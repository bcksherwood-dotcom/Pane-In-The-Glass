#!/usr/bin/env python3
"""
Deploy Pane in the Glass website to Netlify.
Run: python3 deploy.py
"""
import io
import os
import sys
import zipfile
import requests
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent / ".env")

NETLIFY_TOKEN   = os.environ.get("NETLIFY_TOKEN", "")
NETLIFY_SITE_ID = os.environ.get("NETLIFY_SITE_ID", "")

SITE_DIR = Path(__file__).parent
SKIP = {".env", "deploy.py", ".DS_Store", "__pycache__", ".git"}


def build_zip() -> bytes:
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        for path in sorted(SITE_DIR.rglob("*")):
            if path.is_dir():
                continue
            if any(part in SKIP for part in path.parts):
                continue
            arcname = path.relative_to(SITE_DIR)
            zf.write(path, arcname)
            print(f"  + {arcname}")
    return buf.getvalue()


def deploy():
    if not NETLIFY_TOKEN:
        print("ERROR: NETLIFY_TOKEN not set.")
        print("  1. Go to app.netlify.com → click your avatar (top right) → User settings")
        print("  2. Applications → Personal access tokens → New access token")
        print("  3. Copy the token and paste it into your .env file as NETLIFY_TOKEN=...")
        sys.exit(1)

    if not NETLIFY_SITE_ID:
        print("ERROR: NETLIFY_SITE_ID not set.")
        print("  1. Go to your site in Netlify → Site configuration → General")
        print("  2. Copy the 'Site ID' value")
        print("  3. Paste it into your .env file as NETLIFY_SITE_ID=...")
        sys.exit(1)

    print("Building zip...")
    zip_data = build_zip()
    print(f"Zip size: {len(zip_data) / 1024:.1f} KB\n")

    print("Deploying to Netlify...")
    resp = requests.post(
        f"https://api.netlify.com/api/v1/sites/{NETLIFY_SITE_ID}/deploys",
        headers={
            "Authorization": f"Bearer {NETLIFY_TOKEN}",
            "Content-Type": "application/zip",
        },
        data=zip_data,
        timeout=60,
    )

    if resp.status_code not in (200, 201):
        print(f"Deploy failed ({resp.status_code}):")
        print(resp.text)
        sys.exit(1)

    data = resp.json()
    deploy_id  = data.get("id", "")
    deploy_url = data.get("deploy_ssl_url") or data.get("deploy_url") or data.get("url", "")
    site_url   = data.get("ssl_url") or data.get("url", "")

    print(f"\n✅ Deploy started!")
    print(f"   Deploy ID : {deploy_id}")
    print(f"   Live URL  : {site_url}")
    print(f"\nYour site will be live at that URL in about 30 seconds.")


if __name__ == "__main__":
    deploy()
