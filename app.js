/**
 * THE ACCESS CARD - 3D INTERACTIVE ENGINE & STORYTELLING CONTROLLER
 * Gryphon Academy Episode 01 Premiere
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  initThreeJsBackground();
  initSoundEngine();
  initClickRipples();
  init3DTilt();
  initNamingStorm();
  initGuestIntel();
  initScriptVault();
  initVideoPlayer();
  initBtsVault();
  initSeoTabs();
  initScrollSpy();
  initGuestTicker();
  initThankYouPopup();
});

/* ==========================================================================
   1. THREE.JS 3D WEBGL PARTICLE SYSTEM & CAMERA PARALLAX
   ========================================================================== */
let scene, camera, renderer, particlesMesh, particleCount = 450;
let mouseX = 0, mouseY = 0;
let targetX = 0, targetY = 0;
let isHyperdrive = false;
let particleSpeeds = [];

function initThreeJsBackground() {
  const canvas = document.getElementById('webgl-canvas');
  if (!canvas || !window.THREE) return;

  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0xF5EBD0, 0.0018);

  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 2000);
  camera.position.z = 800;

  renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Particles Geometry - Reversed Palette
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  const color1 = new THREE.Color(0x7F011F); // Crimson
  const color2 = new THREE.Color(0x890149); // Royal Magenta
  const color3 = new THREE.Color(0x7F011F); // Crimson Deep
  const color4 = new THREE.Color(0x890149); // Magenta Accent

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    positions[i3] = (Math.random() - 0.5) * 1800;
    positions[i3 + 1] = (Math.random() - 0.5) * 1800;
    positions[i3 + 2] = (Math.random() - 0.5) * 1200;

    // Mixed vibrant palette
    const rand = Math.random();
    let c = color1;
    if (rand < 0.3) c = color2;
    else if (rand < 0.6) c = color3;
    else if (rand < 0.8) c = color4;

    colors[i3] = c.r;
    colors[i3 + 1] = c.g;
    colors[i3 + 2] = c.b;

    particleSpeeds.push({
      x: (Math.random() - 0.5) * 0.4,
      y: (Math.random() - 0.5) * 0.4,
      z: (Math.random() - 0.5) * 0.4
    });
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  // Circular particle texture generator
  const particleCanvas = document.createElement('canvas');
  particleCanvas.width = 32;
  particleCanvas.height = 32;
  const ctx = particleCanvas.getContext('2d');
  const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.3, 'rgba(0,240,255,0.8)');
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 32, 32);

  const texture = new THREE.CanvasTexture(particleCanvas);

  const material = new THREE.PointsMaterial({
    size: 9,
    vertexColors: true,
    map: texture,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  particlesMesh = new THREE.Points(geometry, material);
  scene.add(particlesMesh);

  // Mouse Parallax tracking
  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX - window.innerWidth / 2) * 0.6;
    mouseY = (e.clientY - window.innerHeight / 2) * 0.6;
  });

  // Resize handling
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Hyperdrive toggle
  const hyperBtn = document.getElementById('hyperdrive-btn');
  if (hyperBtn) {
    hyperBtn.addEventListener('click', () => {
      isHyperdrive = !isHyperdrive;
      hyperBtn.classList.toggle('active', isHyperdrive);
      hyperBtn.querySelector('span').textContent = isHyperdrive ? 'WARP SPEED ⚡' : 'Energy Boost';
      playSynthesizedSound('hyperdrive');
    });
  }

  animateThreeJs();
}

function animateThreeJs() {
  requestAnimationFrame(animateThreeJs);

  targetX += (mouseX - targetX) * 0.04;
  targetY += (mouseY - targetY) * 0.04;

  camera.position.x = targetX * 0.8;
  camera.position.y = -targetY * 0.8;
  camera.lookAt(scene.position);

  if (particlesMesh) {
    const mult = isHyperdrive ? 4.5 : 1.0;
    particlesMesh.rotation.y += 0.0008 * mult;
    particlesMesh.rotation.x += 0.0004 * mult;

    const positions = particlesMesh.geometry.attributes.position.array;
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      positions[i3 + 2] += (particleSpeeds[i].z * mult * 2);
      if (positions[i3 + 2] > 600) {
        positions[i3 + 2] = -600;
      }
    }
    particlesMesh.geometry.attributes.position.needsUpdate = true;
  }

  renderer.render(scene, camera);
}

/* ==========================================================================
   2. SYNTHESIZED SOUND ENGINE (ZERO EXTERNAL ASSETS NEEDED)
   ========================================================================== */
let audioCtx = null;
let sfxEnabled = true;

function initSoundEngine() {
  const sfxBtn = document.getElementById('sfx-toggle-btn');
  if (sfxBtn) {
    sfxBtn.addEventListener('click', () => {
      sfxEnabled = !sfxEnabled;
      sfxBtn.querySelector('span').textContent = sfxEnabled ? 'SFX ON' : 'SFX MUTED';
      sfxBtn.style.opacity = sfxEnabled ? '1' : '0.6';
      if (sfxEnabled) playSynthesizedSound('click');
    });
  }
}

function getAudioContext() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      audioCtx = new AudioContext();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playSynthesizedSound(type) {
  if (!sfxEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  switch (type) {
    case 'click':
      osc.type = 'sine';
      osc.frequency.setValueAtTime(580, now);
      osc.frequency.exponentialRampToValueAtTime(1100, now + 0.06);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
      break;

    case 'eliminate':
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.15);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
      break;

    case 'chime':
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.4);
      break;

    case 'hyperdrive':
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.35);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
      break;

    case 'tab':
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
      break;
  }
}

/* ==========================================================================
   3. CLICK RIPPLE & PARTICLE BURST ENGINE
   ========================================================================== */
function initClickRipples() {
  const container = document.getElementById('click-ripple-container');
  if (!container) return;

  window.addEventListener('click', (e) => {
    // Spawn ripple ring
    const ripple = document.createElement('div');
    ripple.className = 'click-ripple';
    ripple.style.left = `${e.clientX}px`;
    ripple.style.top = `${e.clientY}px`;
    container.appendChild(ripple);

    setTimeout(() => ripple.remove(), 700);

    // Spawn 8 spark particles radiating outward
    const sparkColors = ['#F5EBD0', '#7F011F', '#890149', '#ffffff', '#e6d3a3'];
    for (let i = 0; i < 8; i++) {
      const spark = document.createElement('div');
      spark.className = 'click-particle';
      spark.style.left = `${e.clientX}px`;
      spark.style.top = `${e.clientY}px`;
      spark.style.backgroundColor = sparkColors[Math.floor(Math.random() * sparkColors.length)];

      const angle = (i / 8) * (Math.PI * 2) + (Math.random() * 0.3);
      const dist = 45 + Math.random() * 55;
      const tx = Math.cos(angle) * dist;
      const ty = Math.sin(angle) * dist;

      spark.style.setProperty('--tx', `${tx}px`);
      spark.style.setProperty('--ty', `${ty}px`);

      container.appendChild(spark);
      setTimeout(() => spark.remove(), 600);
    }

    playSynthesizedSound('click');
  });
}

/* ==========================================================================
   4. 3D TILT EFFECT ON CARDS
   ========================================================================== */
function init3DTilt() {
  const cards = document.querySelectorAll('.card-3d');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((y - centerY) / centerY) * -8;
      const rotateY = ((x - centerX) / centerX) * 8;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.015, 1.015, 1.015)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    });
  });
}

/* ==========================================================================
   5. ACT 2: THE NAMING STORM (50+ CANDIDATE NOMINEES)
   ========================================================================== */
const namingCandidates = [
  // The Original Whiteboard Contenders
  { name: "Career Wareer", cat: "desi", verdict: "Fun Rhyme, but Lacked Corporate Gravitas" },
  { name: "The Career Lust", cat: "quirky", verdict: "Provocative, but Too Sensational" },
  { name: "Around the Clock", cat: "corporate", verdict: "Felt Like a 24-hr News Desk" },
  { name: "Imperfect Balance of Career", cat: "corporate", verdict: "Too Lengthy for Podcast Marquees" },
  { name: "Hiring Hungama", cat: "desi", verdict: "Desi & Energetic, but Sounded Like a Flash Sale" },
  { name: "Modern Gurukul", cat: "campus", verdict: "Classic Academy Vibe, but Lacked Recruiter Edge" },
  { name: "The Career Bash", cat: "quirky", verdict: "Sounded Like an Annual College Party" },
  { name: "Career Currency", cat: "corporate", verdict: "Smart Concept, Stored for Season 2 Segments" },
  { name: "Career Burger", cat: "quirky", verdict: "Tempting, but Hard to Pitch to Fortune 500 Guests!" },
  { name: "GAP - Gryphon Academy Podcast", cat: "corporate", verdict: "Clean Acronym, but Too Formal" },
  { name: "The Career Crunch", cat: "corporate", verdict: "Sounded Like an Emergency Crisis Show" },
  { name: "Fly High w GA", cat: "campus", verdict: "Great Mascot Pun, Better Suited for Merch" },
  { name: "Career High", cat: "quirky", verdict: "Double Meaning Dilemma" },
  { name: "Career Dopamine", cat: "quirky", verdict: "Loved the Neuro vibe, Kept as Reel Series" },
  { name: "Ground Reality", cat: "corporate", verdict: "Solid, but Common in Documentary Circuits" },
  { name: "Career Temp", cat: "corporate", verdict: "Risk of Sounding Like Temporary Staffing" },
  { name: "Naukri Fundas", cat: "desi", verdict: "Great Hindi Slang, Less Global GCC Appeal" },
  { name: "Sectorial Punch", cat: "corporate", verdict: "Too Analytical & Academic" },
  { name: "9 to 5 Hustle", cat: "campus", verdict: "Promoted Workaholic Hustle Culture" },
  { name: "Figuring Out 9 to 5", cat: "campus", verdict: "Close, but Needed More Decisiveness" },
  { name: "Industry Insights", cat: "corporate", verdict: "The Classic Corporate Bore — Instantly Cut!" },

  // Expanded Whiteboard Contenders (50+ Brainstorm Storm)
  { name: "Campus to Cubicle", cat: "campus", verdict: "Catchy Alliteration, but Lacked Exclusivity" },
  { name: "The Resume Roast", cat: "quirky", verdict: "Hilarious Segment, Reserved for YouTube Shorts" },
  { name: "Chai & Careers", cat: "desi", verdict: "Too Informal for Executive Director Interviews" },
  { name: "Offer Letter Odyssey", cat: "campus", verdict: "Sounded Like an 8-bit Video Game Level" },
  { name: "Corporate Decoded", cat: "corporate", verdict: "Overused in 2020s Tech Podcasts" },
  { name: "The HR Hotseat", cat: "corporate", verdict: "Intimidating to Prospective Guests" },
  { name: "Beyond The CTC", cat: "campus", verdict: "Great Angle, Made Into an Episode Pillar" },
  { name: "Placement Pulse", cat: "campus", verdict: "Felt Too Much Like a College Notice Board" },
  { name: "Zero to Offer", cat: "campus", verdict: "Too Transactional, Missed Long-Term Growth" },
  { name: "The Notice Period", cat: "corporate", verdict: "Relevant Only to Working Pros, Not Freshers" },
  { name: "Career Khichdi", cat: "desi", verdict: "Fun, but Left a Confused Aftertaste" },
  { name: "Unfiltered Corporate", cat: "corporate", verdict: "Every Second Channel Uses 'Unfiltered'" },
  { name: "The First Appraisal", cat: "corporate", verdict: "Nightmare Fuel for Many Professionals!" },
  { name: "Break Into Tech", cat: "corporate", verdict: "Too Narrow: Excluded Core & GCC Roles" },
  { name: "Placement Express", cat: "campus", verdict: "Sounded Like a Fast-Food Delivery App" },
  { name: "GCC Chronicles", cat: "corporate", verdict: "Solid for Industry Nerds, Dry for Students" },
  { name: "The Talent Compass", cat: "corporate", verdict: "Felt Like a Corporate HR Software Tool" },
  { name: "Office Politics 101", cat: "quirky", verdict: "Spicy, but Dangerous for Brand Sponsorships" },
  { name: "College to Cabin", cat: "campus", verdict: "Cute Alliteration, A Bit Outdated" },
  { name: "The Recruiter's Lens", cat: "corporate", verdict: "Good, but Positioned the Recruiter as the Only Hero" },
  { name: "The Daily Standup", cat: "corporate", verdict: "Techies Felt Like They Were Back on Monday Morning" },
  { name: "Skill Over Degree", cat: "campus", verdict: "Powerful Manifesto, Better as Episode Title" },
  { name: "The Hiring Radar", cat: "corporate", verdict: "Sounded Like an Air Traffic Control System" },
  { name: "Corporate Unlocked", cat: "corporate", verdict: "A Bit Generic in App Store Searches" },
  { name: "Job Seekers Anonymous", cat: "quirky", verdict: "Sounded Like Support Group Rather Than Masterclass" },
  { name: "The Placement Blueprint", cat: "campus", verdict: "Strong Contender, Saved for E-Book Launch" },
  { name: "From Viva to VP", cat: "campus", verdict: "Poetic, but Way Too Long for YouTube Banners" },
  { name: "Corporate Chakravyuh", cat: "desi", verdict: "Epic Mythology Reference, A Bit Dramatic" },
  { name: "The Cubicle Survival Kit", cat: "campus", verdict: "Felt Defensive Rather Than Ambitious" },
  { name: "Pitch Perfect Placement", cat: "campus", verdict: "Sounded Like a Musical Movie Sequel" },
  { name: "The Early Career Playbook", cat: "corporate", verdict: "Runner-up! Paved the Path to The Access Card" }
];

let currentNamingFilter = 'all';

function initNamingStorm() {
  const container = document.getElementById('candidate-chips-container');
  if (!container) return;

  function renderChips() {
    container.innerHTML = '';
    const filtered = namingCandidates.filter(item => {
      if (currentNamingFilter === 'all') return true;
      return item.cat === currentNamingFilter;
    });

    filtered.forEach((item, index) => {
      const chip = document.createElement('div');
      chip.className = 'name-chip';
      chip.innerHTML = `
        <span>${item.name}</span>
        <span class="chip-tag">#${index + 1}</span>
      `;

      chip.addEventListener('click', (e) => {
        e.stopPropagation();
        const isEliminated = chip.classList.toggle('eliminated');
        playSynthesizedSound(isEliminated ? 'eliminate' : 'click');

        // Highlight verdict toast
        showToast(`${item.name}: ${item.verdict}`);
      });

      container.appendChild(chip);
    });
  }

  // Setup category filter buttons
  const filterBtns = document.querySelectorAll('#naming-category-filters button');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentNamingFilter = btn.getAttribute('data-cat');
      renderChips();
      playSynthesizedSound('tab');
    });
  });

  renderChips();
}

/* ==========================================================================
   6. ACT 3: GUEST INTEL & RESEARCH SCREEN RECORDINGS
   ========================================================================== */
function initGuestIntel() {
  const tabs = document.querySelectorAll('.vault-tab-btn');
  const videoPlayer = document.getElementById('research-video-player');
  const hudLabel = document.getElementById('research-video-hud-label');

  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.stopPropagation();
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const videoSrc = tab.getAttribute('data-video');
      const label = tab.getAttribute('data-label');

      if (videoPlayer && videoSrc) {
        videoPlayer.src = videoSrc;
        videoPlayer.play().catch(() => {});
      }

      if (hudLabel && label) {
        hudLabel.textContent = `RECORDING: ${label}`;
      }

      playSynthesizedSound('tab');
    });
  });

  // Invitation Pass Modal Handlers
  const modal = document.getElementById('invite-modal-overlay');
  const openModalBtns = [
    document.getElementById('view-invite-btn'),
    document.getElementById('open-invite-modal-btn'),
    document.getElementById('invite-thumb-trigger')
  ];
  const closeModalBtn = document.getElementById('close-invite-modal-btn');
  const modalBackdrop = document.getElementById('invite-modal-backdrop');

  const modalImg = modal ? modal.querySelector('.modal-invite-image') : null;
  const modalTitle = modal ? modal.querySelector('h3') : null;
  const modalFooter = modal ? modal.querySelector('.invite-modal-footer') : null;
  const downloadLink = modal ? modal.querySelector('a[download]') : null;

  function openInviteModal() {
    if (modal) {
      if (modalImg) modalImg.src = 'assets/images/Invitation_Pass.jpg';
      if (modalTitle) modalTitle.textContent = 'Official VIP Invitation Pass';
      if (downloadLink) {
        downloadLink.href = 'assets/images/Invitation_Pass.jpg';
        downloadLink.setAttribute('download', 'Gryphon_Academy_Invitation_Pass_SN_Rao.jpg');
      }
      if (modalFooter) {
        modalFooter.innerHTML = `
          <div style="display:flex;gap:1.5rem;flex-wrap:wrap;font-family:var(--font-mono);font-size:0.75rem;color:var(--text-secondary);">
            <span><strong style="color:#fff;">Date:</strong> 03rd November 2026</span>
            <span><strong style="color:#fff;">Time:</strong> 9:30 AM</span>
            <span><strong style="color:#fff;">Venue:</strong> Gryphon Academy, Baner, Pune</span>
            <span><strong style="color:#fff;">Signed by:</strong> Mr. Shashi Bhat & Ms. Ummeaiman Ansari</span>
          </div>
        `;
      }
      modal.style.display = 'flex';
      playSynthesizedSound('chime');
      showToast("Displaying Official Invitation Pass to Suvarnanidhi Rao");
    }
  }

  function closeInviteModal() {
    if (modal) {
      modal.style.display = 'none';
      playSynthesizedSound('click');
    }
  }

  openModalBtns.forEach(btn => {
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        openInviteModal();
      });
    }
  });

  if (closeModalBtn) closeModalBtn.addEventListener('click', closeInviteModal);
  if (modalBackdrop) modalBackdrop.addEventListener('click', closeInviteModal);

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.style.display === 'flex') {
      closeInviteModal();
    }
  });
}

/* ==========================================================================
   BTS VAULT & PHOTO LIGHTBOX ENGINE
   ========================================================================== */
function initBtsVault() {
  // BTS Video Tab Switcher
  const btsTabs = document.querySelectorAll('#bts-video-tabs .vault-tab-btn');
  const btsPlayer = document.getElementById('bts-video-player');
  const btsLabel = document.getElementById('bts-video-label');

  btsTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.stopPropagation();
      btsTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const videoSrc = tab.getAttribute('data-video');
      const label = tab.getAttribute('data-label');

      if (btsPlayer && videoSrc) {
        btsPlayer.src = videoSrc;
        btsPlayer.play().catch(() => {});
      }

      if (btsLabel && label) {
        btsLabel.textContent = `PLAYING: ${label}`;
      }

      playSynthesizedSound('tab');
    });
  });

  // Photo Lightbox for all BTS triggers
  const photoTriggers = document.querySelectorAll('.bts-photo-trigger');
  const modal = document.getElementById('invite-modal-overlay');
  const modalImg = modal ? modal.querySelector('.modal-invite-image') : null;
  const modalTitle = modal ? modal.querySelector('h3') : null;
  const modalFooter = modal ? modal.querySelector('.invite-modal-footer') : null;
  const downloadLink = modal ? modal.querySelector('a[download]') : null;

  photoTriggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const src = trigger.getAttribute('data-src') || trigger.querySelector('img')?.src;
      const caption = trigger.getAttribute('data-caption') || 'Behind-The-Scenes Photography • Episode 1 Shoot';

      if (modal && modalImg && src) {
        modalImg.src = src;
        if (modalTitle) modalTitle.textContent = "Production Floor BTS Moment";
        if (modalFooter) {
          modalFooter.innerHTML = `<p style="color:#cbd5e1;font-size:0.85rem;line-height:1.5;">${caption}</p>`;
        }
        if (downloadLink) {
          downloadLink.href = src;
          downloadLink.setAttribute('download', src.split('/').pop());
        }
        modal.style.display = 'flex';
        playSynthesizedSound('chime');
      }
    });
  });
}

/* ==========================================================================
   7. ACT 4: SCRIPT VAULT & DRAFT SWITCHER
   ========================================================================== */
const scriptData = {
  concept: {
    title: "Gryphon Academy's Podcast: The Access Card",
    badge: "CONCEPT MEMORANDUM",
    content: `
      <p><strong>The Core Distance:</strong> The distance between a campus and a corporate office is often measured in questions. What do recruiters look for? What happens after the offer letter? Which skills carry a career forward?</p>
      <br>
      <p>Gryphon Academy's Podcast, <em>The Access Card</em>, brings those questions straight to the people who hold the answers, and gives students access, visibility and opportunity at the very start of their professional journey.</p>
      <br>
      <p><strong>The Episode Architecture:</strong> Each episode opens one door. Talent acquisition leaders, industry experts and young professionals walk the audience through the working day, the hiring process, the first appraisal and the turning points that define a career. For students preparing for placements and educators guiding them, The Access Card is the pass to the world of work.</p>
    `
  },
  topics: {
    title: "Episode 1 Strategic Anchors: Suvarnanidhi Rao",
    badge: "FOUR CORE PILLARS",
    content: `
      <p><strong>Pillar 1: His First Access Card</strong><br>
      Opening story: the path from a Bachelor of Theology (1997–1999) to a 20-year career in talent acquisition. What his first job taught him that still guides him today.</p>
      <br>
      <p><strong>Pillar 2: Twenty Years of Campus Hiring, Then and Now</strong><br>
      Campus hiring across IT services, telecom, health tech and GCCs (Wipro, TCS, BT, Philips, Dentsu). Which qualities in freshers have stayed constant across all these years?</p>
      <br>
      <p><strong>Pillar 3: Inside a Recruiter's Mind</strong><br>
      What a recruiter notices in the first 2 minutes of an interview. How campus shortlists are actually built. What makes one resume stand out in a pile of hundreds?</p>
      <br>
      <p><strong>Pillar 4: GCCs & The AI Wave</strong><br>
      India's global capability centers boom. Is AI taking fresher jobs, or redefining what freshers need to master on day one?</p>
    `
  },
  hook: {
    title: "Short Hook Intro [Single Frame, High Retention]",
    badge: "VIRAL REELS & SHORTS HOOK",
    content: `
      <p><span class="script-speaker">HOST (Single Frame, Dynamic Zoom):</span>
      "If you're a fresher, or you're currently looking for a job switch, meet our guest who has 24+ years of experience in campus and early-career hiring across the world's biggest brands.</p>
      <br>
      <p>He has evaluated over 10,000+ candidates across Wipro, TCS, BT, Philips and now Dentsu Global Services. If you want to know what actually happens behind closed interview doors... this episode is going to turn your skill and experience into your Access Card to corporate."</p>
      <br>
      <p><span class="script-speaker">HOST (Provocative Question [Cam-2]):</span>
      "Students often hear that corporate life is stressful, that it's a trap, and that you lose your happiness. If corporate life is really that challenging, why are millions working day and night to get into it?"</p>
    `
  },
  master: {
    title: "Ep 1 Master Multi-Cam Broadcast Script",
    badge: "CAM-1 / CAM-2 BROADCAST READY",
    content: `
      <p><span class="script-speaker">HOST [Cam-1 Wide]:</span>
      Welcome to The Access Card, Suvarnanidhi Rao.</p>
      <br>
      <p><span class="script-speaker">HOST:</span>
      Your first degree was a Bachelor of Theology, and you ended up spending 20+ years in talent acquisition. How did that happen, and what did that teach you about human nature that guides your hiring decisions today?</p>
      <br>
      <p><span class="script-speaker">SN RAO [Cam-2 Close-up]:</span>
      (Laughs) It's always the question that breaks the ice. Theology taught me how to listen to what people aren't saying. In campus interviews, anxiety is high. Freshers memorize textbook answers. My job wasn't to test memory; it was to find conviction.</p>
      <br>
      <p><span class="script-speaker">HOST [Cam-1]:</span>
      Tell us about a candidate who surprised you during an interview. What made them unforgettable?</p>
      <br>
      <p><span class="script-speaker">SN RAO:</span>
      It was a student who admitted failure with complete accountability, and then showed me the live project he built to fix his mistake. Instant hire.</p>
    `
  }
};

function initScriptVault() {
  const navItems = document.querySelectorAll('.script-card-item');
  const viewport = document.getElementById('script-viewport');

  function renderScript(key) {
    const data = scriptData[key] || scriptData.concept;
    if (!viewport) return;

    viewport.innerHTML = `
      <div class="script-excerpt-header">
        <div>
          <span class="cue-tag">${data.badge}</span>
          <h3 style="color:#fff;font-size:1.3rem;font-weight:800;margin-top:0.4rem;">${data.title}</h3>
        </div>
        <button class="ctrl-btn" onclick="showToast('Script Draft Selected')">
          <i data-lucide="bookmark" style="width:14px;height:14px;"></i>
          <span>Save Draft</span>
        </button>
      </div>
      <div class="script-body-text">
        ${data.content}
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  }

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');

      const docKey = item.getAttribute('data-doc');
      renderScript(docKey);
      playSynthesizedSound('tab');
    });
  });

  renderScript('concept');

  const toggleBtn = document.getElementById('toggle-scripts-vault-btn');
  const scriptsContainer = document.getElementById('collapsible-scripts-container');
  const toggleLabel = document.getElementById('script-toggle-label');

  if (toggleBtn && scriptsContainer) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isHidden = scriptsContainer.style.display === 'none' || scriptsContainer.style.display === '';
      scriptsContainer.style.display = isHidden ? 'block' : 'none';
      if (toggleLabel) {
        toggleLabel.textContent = isHidden ? 'Hide Script Drafts' : 'Inspect Script Drafts';
      }
      playSynthesizedSound(isHidden ? 'chime' : 'click');
      if (isHidden) {
        scriptsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  }
}

/* ==========================================================================
   8. ACT 6: CUSTOM VIDEO PLAYER FOR GUEST INTRO
   ========================================================================== */
function initVideoPlayer() {
  const video = document.getElementById('intro-video-element');
  const playBtn = document.getElementById('video-play-btn');
  const playIcon = document.getElementById('play-pause-icon');
  const muteBtn = document.getElementById('video-mute-btn');
  const muteIcon = document.getElementById('mute-icon');
  const progressBar = document.getElementById('video-progress-bar');
  const progressFill = document.getElementById('video-progress-fill');
  const timeDisplay = document.getElementById('video-time-display');
  const replayBtn = document.getElementById('video-replay-btn');
  const fsBtn = document.getElementById('video-fs-btn');
  const container = document.getElementById('intro-video-container');

  if (!video) return;

  // Auto-generate matching thumbnail directly from the actual video graphics frame
  video.addEventListener('loadedmetadata', () => {
    if (video.paused && video.currentTime === 0) {
      video.currentTime = 0.5; // Seek to vivid intro graphic
    }
  }, { once: true });

  video.addEventListener('seeked', () => {
    try {
      if (!video.poster) {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 1280;
        canvas.height = video.videoHeight || 720;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        if (dataUrl && dataUrl.length > 500) {
          video.poster = dataUrl;
        }
      }
    } catch (e) {
      // Browser displays the video frame natively
    }
  }, { once: true });

  let hasStartedPlayback = false;

  function togglePlay() {
    if (video.paused || video.ended) {
      if (!hasStartedPlayback) {
        video.currentTime = 0;
        hasStartedPlayback = true;
      }
      video.play().then(() => {
        if (playIcon) playIcon.setAttribute('data-lucide', 'pause');
        if (window.lucide) window.lucide.createIcons();
      }).catch(() => {});
    } else {
      video.pause();
      if (playIcon) playIcon.setAttribute('data-lucide', 'play');
      if (window.lucide) window.lucide.createIcons();
    }
  }

  if (playBtn) playBtn.addEventListener('click', togglePlay);
  video.addEventListener('click', togglePlay);

  video.addEventListener('timeupdate', () => {
    if (!video.duration) return;
    const pct = (video.currentTime / video.duration) * 100;
    if (progressFill) progressFill.style.width = `${pct}%`;

    if (timeDisplay) {
      const curM = Math.floor(video.currentTime / 60);
      const curS = Math.floor(video.currentTime % 60).toString().padStart(2, '0');
      const durM = Math.floor(video.duration / 60);
      const durS = Math.floor(video.duration % 60).toString().padStart(2, '0');
      timeDisplay.textContent = `${curM}:${curS} / ${durM}:${durS}`;
    }
  });

  if (progressBar) {
    progressBar.addEventListener('click', (e) => {
      const rect = progressBar.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      video.currentTime = pos * video.duration;
    });
  }

  if (muteBtn) {
    muteBtn.addEventListener('click', () => {
      video.muted = !video.muted;
      if (muteIcon) {
        muteIcon.setAttribute('data-lucide', video.muted ? 'volume-x' : 'volume-2');
        if (window.lucide) window.lucide.createIcons();
      }
    });
  }

  if (replayBtn) {
    replayBtn.addEventListener('click', () => {
      video.currentTime = 0;
      video.play();
    });
  }

  if (fsBtn && container) {
    fsBtn.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        container.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    });
  }
}

/* ==========================================================================
   9. ACT 10: SEO TABS SWITCHER
   ========================================================================== */
function initSeoTabs() {
  const tabs = document.querySelectorAll('.seo-tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.stopPropagation();
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const targetId = `seo-tab-${tab.getAttribute('data-tab')}`;
      const contents = document.querySelectorAll('.seo-tab-content');
      contents.forEach(c => c.classList.remove('active'));

      const targetContent = document.getElementById(targetId);
      if (targetContent) targetContent.classList.add('active');

      playSynthesizedSound('tab');
    });
  });
}

// Copy to clipboard helper
window.copyText = function(elementId) {
  const el = document.getElementById(elementId);
  if (!el) return;
  const text = el.innerText || el.textContent;

  navigator.clipboard.writeText(text.trim()).then(() => {
    showToast("Copied to Clipboard! Ready for YouTube Studio");
    playSynthesizedSound('chime');
  }).catch(() => {
    showToast("Selection ready to copy");
  });
};

/* ==========================================================================
   10. ACT 11: CELEBRATION REACTION SYSTEM
   ========================================================================== */
window.triggerReaction = function(emoji, message) {
  playSynthesizedSound('chime');
  showToast(`${emoji} ${message} Recorded!`);

  // Increment counter
  if (emoji === '🔥') {
    const c = document.getElementById('count-fire');
    if (c) c.textContent = parseInt(c.textContent) + 1;
  } else if (emoji === '🤯') {
    const c = document.getElementById('count-mind');
    if (c) c.textContent = parseInt(c.textContent) + 1;
  } else if (emoji === '🎓') {
    const c = document.getElementById('count-campus');
    if (c) c.textContent = parseInt(c.textContent) + 1;
  } else if (emoji === '💯') {
    const c = document.getElementById('count-real');
    if (c) c.textContent = parseInt(c.textContent) + 1;
  }

  // Confetti burst
  spawnConfettiRain();
};

function spawnConfettiRain() {
  const container = document.getElementById('click-ripple-container');
  if (!container) return;

  const colors = ['#00f0ff', '#f59e0b', '#a855f7', '#10b981', '#ff5757', '#ffffff'];

  for (let i = 0; i < 40; i++) {
    const confetti = document.createElement('div');
    confetti.style.position = 'fixed';
    confetti.style.left = `${Math.random() * 100}vw`;
    confetti.style.top = '-10px';
    confetti.style.width = `${Math.random() * 8 + 6}px`;
    confetti.style.height = `${Math.random() * 12 + 6}px`;
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.borderRadius = '2px';
    confetti.style.zIndex = '9999';
    confetti.style.pointerEvents = 'none';
    confetti.style.opacity = '0.9';
    confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
    confetti.style.transition = `transform ${Math.random() * 2 + 1.5}s ease-out, top ${Math.random() * 2 + 1.5}s ease-in, opacity 2s ease`;

    container.appendChild(confetti);

    requestAnimationFrame(() => {
      confetti.style.top = '105vh';
      confetti.style.transform = `rotate(${Math.random() * 720}deg) scale(0.6)`;
      confetti.style.opacity = '0';
    });

    setTimeout(() => confetti.remove(), 2500);
  }
}

/* ==========================================================================
   11. SCROLLSPY & TOAST NOTIFICATIONS
   ========================================================================== */
function initScrollSpy() {
  const sections = document.querySelectorAll('.chapter-section');
  const navIndicator = document.getElementById('nav-chapter-indicator');

  const chapterNames = {
    'act-genesis': 'Act 1: The Spark',
    'act-naming': 'Act 2: The Access Card',
    'act-brand-lab': 'Act 3: Brand & Review',
    'act-social-strategy': 'Act 4: Social Strategy',
    'act-studio-gear': 'Act 5: Studio Arsenal',
    'act-shoot-day': 'Act 6: Shoot Day & BTS',
    'act-guest-intel': 'Act 7: Guest Research',
    'act-intro-video': 'Act 8: Guest Intro AV',
    'act-post-production': 'Act 9: Editing Suite',
    'act-youtube-seo': 'Act 10: Channel & SEO',
    'act-trial-premiere': 'Act 11: The Premiere',
    'act-upcoming-targets': 'Act 12: Upcoming Target'
  };

  window.addEventListener('scroll', () => {
    let currentId = '';
    const scrollPos = window.scrollY + window.innerHeight * 0.35;

    sections.forEach(sec => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentId = sec.id;
      }
    });

    if (currentId && navIndicator && chapterNames[currentId]) {
      navIndicator.textContent = chapterNames[currentId];
    }
  });
}

function showToast(message) {
  let toast = document.getElementById('global-live-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'global-live-toast';
    toast.style.position = 'fixed';
    toast.style.bottom = '2rem';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%) translateY(100px)';
    toast.style.background = 'rgba(10, 14, 30, 0.95)';
    toast.style.border = '1px solid var(--primary-cyan)';
    toast.style.color = '#fff';
    toast.style.padding = '0.75rem 1.6rem';
    toast.style.borderRadius = '999px';
    toast.style.boxShadow = '0 10px 30px rgba(0, 240, 255, 0.3)';
    toast.style.fontFamily = 'var(--font-mono)';
    toast.style.fontSize = '0.85rem';
    toast.style.zIndex = '10000';
    toast.style.transition = 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)';
    toast.style.pointerEvents = 'none';
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.style.transform = 'translateX(-50%) translateY(0)';
  toast.style.opacity = '1';

  clearTimeout(toast.timeoutId);
  toast.timeoutId = setTimeout(() => {
    toast.style.transform = 'translateX(-50%) translateY(100px)';
    toast.style.opacity = '0';
  }, 3200);
}

/* ==========================================================================
   12. GUEST TICKER PAUSE / RESUME CONTROLLER
   ========================================================================== */
function initGuestTicker() {
  const tickerBtn = document.getElementById('ticker-toggle-btn');
  const tickerTrack = document.getElementById('guest-ticker-track');
  const tickerIcon = document.getElementById('ticker-toggle-icon');
  const tickerText = document.getElementById('ticker-toggle-text');

  if (tickerBtn && tickerTrack) {
    tickerBtn.addEventListener('click', () => {
      tickerTrack.classList.toggle('paused');
      const isPaused = tickerTrack.classList.contains('paused');
      if (tickerText) tickerText.textContent = isPaused ? 'Resume Scroll' : 'Pause Scroll';
      if (tickerIcon) {
        tickerIcon.setAttribute('data-lucide', isPaused ? 'play' : 'pause');
        if (window.lucide) window.lucide.createIcons();
      }
    });
  }
}

/* ==========================================================================
   13. END-OF-SLIDE THANK YOU POPUP
   ========================================================================== */
function initThankYouPopup() {
  const modal = document.getElementById('thankyou-modal-overlay');
  const closeBtn = document.getElementById('close-thankyou-modal-btn');
  const backdrop = document.getElementById('thankyou-modal-backdrop');
  let hasTriggered = false;

  function openThankYouModal() {
    if (!modal) return;
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    if (window.lucide) window.lucide.createIcons();
  }

  function closeThankYouModal() {
    if (!modal) return;
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }

  if (closeBtn) closeBtn.addEventListener('click', closeThankYouModal);
  if (backdrop) backdrop.addEventListener('click', closeThankYouModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.style.display !== 'none') {
      closeThankYouModal();
    }
  });

  // Trigger when slide ends (user scrolls near bottom of page)
  window.addEventListener('scroll', () => {
    if (hasTriggered) return;
    const scrollBottom = window.innerHeight + window.scrollY;
    const threshold = document.documentElement.scrollHeight - 250;
    if (scrollBottom >= threshold) {
      hasTriggered = true;
      setTimeout(() => {
        openThankYouModal();
      }, 350);
    }
  });

  // Reopen from footer button
  const reopenBtn = document.getElementById('reopen-thankyou-btn');
  if (reopenBtn) {
    reopenBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openThankYouModal();
    });
  }
}
