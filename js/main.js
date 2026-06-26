// ── THREE.JS 3D HERO SCENE ─────────────────────────────────────────────
(function init3D() {
  const canvas = document.getElementById('three-canvas');
  const hero   = document.getElementById('hero');
  if (!canvas || typeof THREE === 'undefined') return;

  const W = () => hero.offsetWidth;
  const H = () => hero.offsetHeight;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(W(), H());
  renderer.setClearColor(0x000000, 0);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, W() / H(), 0.1, 500);
  camera.position.set(0, 0, 9);

  // Lights
  scene.add(new THREE.AmbientLight(0x002244, 1.2));
  const light1 = new THREE.PointLight(0x00d4ff, 3, 30);
  light1.position.set(6, 5, 6);
  scene.add(light1);
  const light2 = new THREE.PointLight(0x7c3aed, 2, 25);
  light2.position.set(-6, -4, 4);
  scene.add(light2);
  const light3 = new THREE.PointLight(0xf59e0b, 1.5, 20);
  light3.position.set(0, -8, 2);
  scene.add(light3);

  // Main glass window group
  const winGroup = new THREE.Group();
  scene.add(winGroup);

  // Glass pane
  const glassGeo = new THREE.BoxGeometry(5.5, 3.8, 0.06);
  const glassMat = new THREE.MeshPhongMaterial({
    color: 0x88ddff, shininess: 300,
    transparent: true, opacity: 0.12, side: THREE.DoubleSide,
    emissive: 0x003355, emissiveIntensity: 0.3,
  });
  winGroup.add(new THREE.Mesh(glassGeo, glassMat));

  // Frame edges (neon glow)
  const edgeGeo  = new THREE.EdgesGeometry(new THREE.BoxGeometry(5.5, 3.8, 0.06));
  const edgeMat  = new THREE.LineBasicMaterial({ color: 0x00d4ff });
  const edges     = new THREE.LineSegments(edgeGeo, edgeMat);
  winGroup.add(edges);

  // Window dividers (cross)
  const divMat = new THREE.MeshPhongMaterial({ color: 0x00d4ff, emissive: 0x0055aa, emissiveIntensity: 0.8 });
  const hBar = new THREE.Mesh(new THREE.BoxGeometry(5.5, 0.06, 0.08), divMat);
  const vBar = new THREE.Mesh(new THREE.BoxGeometry(0.06, 3.8, 0.08), divMat);
  winGroup.add(hBar, vBar);

  // Second smaller window behind
  const win2 = winGroup.clone();
  win2.scale.set(0.55, 0.55, 0.55);
  win2.position.set(4, 2.5, -3);
  win2.rotation.set(0.2, -0.4, 0.1);
  scene.add(win2);

  const win3 = winGroup.clone();
  win3.scale.set(0.4, 0.4, 0.4);
  win3.position.set(-4.5, -2, -5);
  win3.rotation.set(-0.15, 0.5, -0.1);
  scene.add(win3);

  // Soap bubbles
  const bubbles = [];
  for (let i = 0; i < 40; i++) {
    const r   = Math.random() * 0.22 + 0.04;
    const geo = new THREE.SphereGeometry(r, 14, 14);
    const mat = new THREE.MeshPhongMaterial({
      color: new THREE.Color().setHSL(Math.random() * 0.2 + 0.5, 1, 0.7),
      shininess: 400, transparent: true,
      opacity: Math.random() * 0.25 + 0.06,
      side: THREE.DoubleSide,
    });
    const b = new THREE.Mesh(geo, mat);
    b.position.set((Math.random() - 0.5) * 22, (Math.random() - 0.5) * 14, (Math.random() - 0.5) * 8 - 2);
    b.userData = {
      vx: (Math.random() - 0.5) * 0.012,
      vy: Math.random() * 0.018 + 0.006,
      vz: (Math.random() - 0.5) * 0.008,
      wobble: Math.random() * Math.PI * 2,
    };
    scene.add(b);
    bubbles.push(b);
  }

  // Stars
  const starVerts = [];
  for (let i = 0; i < 2500; i++) {
    starVerts.push((Math.random()-0.5)*300, (Math.random()-0.5)*300, (Math.random()-0.5)*300 - 80);
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starVerts, 3));
  scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.2, transparent: true, opacity: 0.7 })));

  // Mouse parallax
  let tx = 0, ty = 0;
  document.addEventListener('mousemove', e => {
    tx = (e.clientX / innerWidth  - 0.5) * 2;
    ty = (e.clientY / innerHeight - 0.5) * 2;
  });

  window.addEventListener('resize', () => {
    renderer.setSize(W(), H());
    camera.aspect = W() / H();
    camera.updateProjectionMatrix();
  });

  let mx = 0, my = 0;
  const clock = new THREE.Clock();

  (function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    mx += (tx - mx) * 0.04;
    my += (ty - my) * 0.04;

    winGroup.rotation.y = Math.sin(t * 0.25) * 0.18 + mx * 0.12;
    winGroup.rotation.x = Math.sin(t * 0.18) * 0.10 - my * 0.06;
    win2.rotation.y += 0.003;
    win3.rotation.y -= 0.002;
    win3.rotation.x += 0.001;

    light1.position.x = Math.sin(t * 0.4) * 8;
    light1.position.y = Math.cos(t * 0.3) * 5;
    light2.position.x = Math.cos(t * 0.35) * -7;

    bubbles.forEach(b => {
      b.userData.wobble += 0.02;
      b.position.x += b.userData.vx + Math.sin(b.userData.wobble) * 0.003;
      b.position.y += b.userData.vy;
      b.position.z += b.userData.vz;
      if (b.position.y > 10) { b.position.y = -10; b.position.x = (Math.random()-0.5)*22; }
      if (Math.abs(b.position.x) > 14) b.userData.vx *= -1;
    });

    renderer.render(scene, camera);
  })();
})();


// ── WIPE EFFECT ────────────────────────────────────────────────────────
(function initWipe() {
  const canvas  = document.getElementById('wipe-canvas');
  const hero    = document.getElementById('hero');
  const hint    = document.getElementById('wipe-hint');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let lx = null, ly = null, wiped = false;

  function resize() {
    canvas.width  = hero.offsetWidth;
    canvas.height = hero.offsetHeight;
    paint();
  }

  function paint() {
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(2,4,9,0.84)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < 100; i++) {
      const x = Math.random()*canvas.width, y = Math.random()*canvas.height, r = Math.random()*90+20;
      const g = ctx.createRadialGradient(x,y,0,x,y,r);
      g.addColorStop(0, `rgba(${20+Math.random()*25},${10+Math.random()*15},2,${Math.random()*.45})`);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
    }
    for (let i = 0; i < 18; i++) {
      ctx.strokeStyle = `rgba(160,130,80,${Math.random()*.07})`;
      ctx.lineWidth   = Math.random()*4+1;
      ctx.beginPath();
      const x = Math.random()*canvas.width, y = Math.random()*canvas.height;
      ctx.moveTo(x,y); ctx.lineTo(x+(Math.random()-.5)*250, y+Math.random()*160); ctx.stroke();
    }
  }

  function wipe(x, y) {
    if (!wiped) { wiped = true; if (hint) hint.style.opacity = '0'; }
    ctx.globalCompositeOperation = 'destination-out';
    if (lx !== null) {
      ctx.beginPath(); ctx.moveTo(lx,ly); ctx.lineTo(x,y);
      ctx.lineWidth = 120; ctx.lineCap = 'round'; ctx.stroke();
    }
    ctx.beginPath(); ctx.arc(x, y, 60, 0, Math.PI*2); ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    lx = x; ly = y;
  }

  window.addEventListener('resize', resize);
  resize();

  canvas.addEventListener('mousemove', e => {
    const r = canvas.getBoundingClientRect();
    wipe(e.clientX-r.left, e.clientY-r.top);
  });
  canvas.addEventListener('mouseleave', () => { lx = null; ly = null; });
  canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    const r = canvas.getBoundingClientRect(), t = e.touches[0];
    wipe(t.clientX-r.left, t.clientY-r.top);
  }, { passive: false });
  canvas.addEventListener('touchend', () => { lx = null; ly = null; });
})();


// ── CURSOR + PARTICLE TRAIL ─────────────────────────────────────────────
(function initCursor() {
  const ring  = document.getElementById('cursor-ring');
  const dot   = document.getElementById('cursor-dot');
  const trail = document.getElementById('cursor-trail');
  if (!ring || !trail) return;

  trail.width  = innerWidth;
  trail.height = innerHeight;
  window.addEventListener('resize', () => { trail.width = innerWidth; trail.height = innerHeight; });

  const ctx = trail.getContext('2d');
  const particles = [];
  let mx = -200, my = -200, rx = -200, ry = -200;

  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  document.querySelectorAll('a,button,.service-card,.ba-container,.addon-toggle,.story-btn,.calc-toggle,.t-dot')
    .forEach(el => {
      el.addEventListener('mouseenter', () => ring.classList.add('big'));
      el.addEventListener('mouseleave', () => ring.classList.remove('big'));
    });

  function spawnParticle() {
    particles.push({
      x: mx, y: my,
      vx: (Math.random()-.5)*2.5,
      vy: (Math.random()-.5)*2.5 - 1,
      r: Math.random()*3+1,
      alpha: Math.random()*.7+.3,
      hue: Math.random() < 0.5 ? 195 : (Math.random() < 0.5 ? 40 : 270),
    });
  }

  let spawnTick = 0;
  (function animCursor() {
    rx += (mx-rx)*0.18; ry += (my-ry)*0.18;
    ring.style.left = mx+'px'; ring.style.top = my+'px';
    dot.style.left  = rx+'px'; dot.style.top  = ry+'px';

    if (++spawnTick % 2 === 0) spawnParticle();

    ctx.clearRect(0,0,trail.width,trail.height);
    for (let i = particles.length-1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx; p.y += p.vy; p.vy += 0.08; p.r *= 0.93; p.alpha *= 0.9;
      if (p.alpha < 0.01 || p.r < 0.3) { particles.splice(i,1); continue; }
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fillStyle = `hsla(${p.hue},100%,65%,${p.alpha})`;
      ctx.fill();
    }
    requestAnimationFrame(animCursor);
  })();
})();


// ── TEXT SCRAMBLE ──────────────────────────────────────────────────────
class TextScramble {
  constructor(el) {
    this.el = el; this.chars = '!<>-_\\/[]{}—=+*^?#@$%&';
    this.update = this.update.bind(this);
  }
  run() {
    const text = this.el.dataset.text;
    this.queue = text.split('').map((to, i) => ({
      to, from: this.el.innerText[i]||'', start: Math.floor(Math.random()*12), end: Math.floor(Math.random()*16)+12, char:'',
    }));
    this.frame = 0; cancelAnimationFrame(this.raf); this.update();
  }
  update() {
    let out = ''; let done = 0;
    this.queue.forEach(q => {
      if (this.frame >= q.end) { done++; out += q.to; }
      else if (this.frame >= q.start) {
        if (!q.char||Math.random()<.28) q.char = this.chars[Math.floor(Math.random()*this.chars.length)];
        out += `<span class="scramble-char">${q.char}</span>`;
      } else out += q.from || q.to;
    });
    this.el.innerHTML = out;
    if (done < this.queue.length) { this.frame++; this.raf = requestAnimationFrame(this.update); }
  }
}


// ── SCROLL REVEAL + SCRAMBLE ────────────────────────────────────────────
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (!entry.isIntersecting) return;
    setTimeout(() => entry.target.classList.add('visible'), i * 90);
    revealObs.unobserve(entry.target);
  });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

const scrambleObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    new TextScramble(entry.target).run();
    scrambleObs.unobserve(entry.target);
  });
}, { threshold: 0.3 });
document.querySelectorAll('.scramble-target').forEach(el => scrambleObs.observe(el));


// ── STAT COUNTERS ──────────────────────────────────────────────────────
const countObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target, target = +el.dataset.target, suffix = el.dataset.suffix||'';
    let n = 0; const step = target/60;
    const tick = () => { n = Math.min(n+step, target); el.textContent = Math.floor(n)+suffix; if(n<target) requestAnimationFrame(tick); };
    tick(); countObs.unobserve(el);
  });
}, { threshold: .5 });
document.querySelectorAll('[data-target]').forEach(el => countObs.observe(el));


// ── MAGNETIC ELEMENTS ─────────────────────────────────────────────────
document.querySelectorAll('.magnetic').forEach(el => {
  el.addEventListener('mousemove', e => {
    const r = el.getBoundingClientRect();
    const x = (e.clientX-r.left-r.width/2)*0.35;
    const y = (e.clientY-r.top-r.height/2)*0.35;
    el.style.transform = `translate(${x}px,${y}px)`;
  });
  el.addEventListener('mouseleave', () => { el.style.transform=''; });
});

document.querySelectorAll('.magnetic-light').forEach(el => {
  el.addEventListener('mousemove', e => {
    const r = el.getBoundingClientRect();
    const x = (e.clientX-r.left-r.width/2)*0.12;
    const y = (e.clientY-r.top-r.height/2)*0.12;
    el.style.transform = `translate(${x}px,${y}px)`;
  });
  el.addEventListener('mouseleave', () => { el.style.transform=''; });
});


// ── BEFORE/AFTER DRAG ─────────────────────────────────────────────────
(function initBA() {
  const container = document.getElementById('ba-container');
  const before    = document.getElementById('ba-before');
  const divider   = document.getElementById('ba-divider');
  if (!container) return;
  let drag = false;

  function setPos(x) {
    const r = container.getBoundingClientRect();
    const p = Math.min(Math.max((x-r.left)/r.width*100, 2), 98);
    before.style.clipPath   = `inset(0 ${100-p}% 0 0)`;
    divider.style.left      = p+'%';
  }

  setPos(container.getBoundingClientRect().left + container.getBoundingClientRect().width * 0.5);
  container.addEventListener('mousedown',  () => drag=true);
  window.addEventListener('mouseup',       () => drag=false);
  window.addEventListener('mousemove',     e => { if(drag) setPos(e.clientX); });
  container.addEventListener('touchstart', e => { drag=true; setPos(e.touches[0].clientX); }, {passive:true});
  window.addEventListener('touchend',      () => drag=false);
  window.addEventListener('touchmove',     e => { if(drag) setPos(e.touches[0].clientX); }, {passive:true});
})();


// ── PRICE CALCULATOR ──────────────────────────────────────────────────
(function initCalc() {
  const slider    = document.getElementById('win-slider');
  const display   = document.getElementById('win-display');
  const priceEl   = document.getElementById('calc-price');
  const rangeEl   = document.getElementById('calc-range');
  if (!slider) return;

  let wins=12, stories=1, screens=false, interior=false, hw=false;

  function calc() {
    let base = wins * 8 * (stories===1?1:stories===2?1.3:1.65);
    if (screens)   base += wins*3;
    if (interior)  base *= 1.5;
    if (hw)        base += 65;
    priceEl.textContent = `$${Math.round(base)}`;
    rangeEl.textContent = `Range: $${Math.round(base*.88)} – $${Math.round(base*1.18)}`;
  }

  slider.addEventListener('input', () => { wins=+slider.value; display.textContent=wins; calc(); });

  document.querySelectorAll('.story-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.story-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active'); stories=+btn.dataset.stories; calc();
    });
  });

  [['tog-screens','screens'],['tog-interior','interior'],['tog-hw','hw']].forEach(([id,key]) => {
    document.getElementById(id)?.addEventListener('click', function() {
      this.classList.toggle('active');
      if(key==='screens') screens=!screens;
      else if(key==='interior') interior=!interior;
      else hw=!hw;
      calc();
    });
  });
  calc();
})();


// ── TESTIMONIALS CAROUSEL ─────────────────────────────────────────────
// ── ADD REAL REVIEWS HERE WHEN CUSTOMERS SUBMIT THEM ─────────────────
const reviews = [
  { stars:5, name:"Sarah M.", loc:"Cedar Park, TX", text:"Absolutely incredible job. My windows have never looked this clean — even the ones I forgot existed! Fast, professional, and reasonably priced." },
  { stars:5, name:"James R.", loc:"Cedar Park, TX", text:"Used them for our storefront and the difference was night and day. Customers even commented on how great the windows looked. Highly recommend!" },
  { stars:5, name:"Linda K.", loc:"Cedar Park, TX", text:"Super easy to schedule, showed up on time, did a flawless job. Already booked them for a recurring monthly clean. Love these guys!" },
];

(function initT() {
  const track = document.getElementById('t-track');
  const dots  = document.getElementById('t-dots');
  if (!track) return;
  let cur=0;

  reviews.forEach(r => {
    const c = document.createElement('div'); c.className='t-card';
    c.innerHTML=`<div class="t-stars">${'★'.repeat(r.stars)}</div><div class="t-text">"${r.text}"</div><div class="t-name">${r.name}</div><div class="t-loc">${r.loc}</div>`;
    track.appendChild(c);
  });
  reviews.forEach((_,i)=>{
    const d=document.createElement('div'); d.className='t-dot'+(i===0?' active':'');
    d.onclick=()=>go(i); dots.appendChild(d);
  });

  function go(i) {
    cur=i;
    const w=(track.children[0]?.offsetWidth||0)+24;
    track.style.transform=`translateX(-${cur*w}px)`;
    dots.querySelectorAll('.t-dot').forEach((d,j)=>d.classList.toggle('active',j===cur));
  }
  setInterval(()=>go((cur+1)%reviews.length), 5000);
})();


// ── STAR PICKER ───────────────────────────────────────────────────────
(function initStars() {
  const picker = document.getElementById('star-picker');
  const input  = document.getElementById('stars-input');
  if (!picker) return;
  const spans = picker.querySelectorAll('span');
  spans.forEach(s => {
    s.addEventListener('click', () => {
      input.value = s.dataset.val;
      spans.forEach(x=>x.classList.toggle('active', +x.dataset.val <= +s.dataset.val));
    });
    s.addEventListener('mouseover', () => spans.forEach(x=>x.classList.toggle('active', +x.dataset.val <= +s.dataset.val)));
  });
  picker.addEventListener('mouseleave', () => {
    const v=+input.value;
    spans.forEach(x=>x.classList.toggle('active', +x.dataset.val <= v));
  });
})();


// ── FORMS ─────────────────────────────────────────────────────────────
['review-form','contact-form'].forEach(id => {
  const form = document.getElementById(id);
  if (!form) return;
  const success = document.getElementById(id==='review-form'?'review-success':'contact-success');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (id==='review-form' && +document.getElementById('stars-input').value===0) { alert('Please select a star rating.'); return; }
    const btn = form.querySelector('button[type=submit]');
    btn.textContent='Sending...'; btn.disabled=true;
    try {
      await fetch('/', { method:'POST', body: new FormData(form) });
      form.style.display='none'; if(success) success.style.display='block';
    } catch { btn.textContent='Try Again'; btn.disabled=false; }
  });
});


// ── NAV TOGGLE ────────────────────────────────────────────────────────
document.getElementById('nav-toggle')?.addEventListener('click', () =>
  document.getElementById('nav-links')?.classList.toggle('open'));
document.querySelectorAll('.nav-links a').forEach(a =>
  a.addEventListener('click', () => document.getElementById('nav-links')?.classList.remove('open')));


// ── CLICK RIPPLE ──────────────────────────────────────────────────────
document.addEventListener('click', e => {
  if (e.target.closest('button,a,input,textarea,select')) return;
  const ripple = document.createElement('div');
  Object.assign(ripple.style, {
    position:'fixed', left:e.clientX+'px', top:e.clientY+'px',
    width:'6px', height:'6px', borderRadius:'50%',
    border:'1.5px solid rgba(0,212,255,0.8)',
    transform:'translate(-50%,-50%) scale(1)',
    pointerEvents:'none', zIndex:'9997',
    animation:'ripple-out .6s ease-out forwards',
  });
  document.body.appendChild(ripple);
  setTimeout(()=>ripple.remove(), 620);
});

const rippleStyle = document.createElement('style');
rippleStyle.textContent = `@keyframes ripple-out { to { transform: translate(-50%,-50%) scale(22); opacity: 0; } }`;
document.head.appendChild(rippleStyle);


// ── GALLERY IMAGES (add URLs here + redeploy) ──────────────────────────
// { src: 'https://i.ibb.co/yourimage.jpg', label: 'After — Cedar Park home' }
const galleryImages = [];
