// 3D Birthday Love Galaxy Web App (Mobile & Desktop WebGL + 3D Center Heart Portrait + "For You" Video + Gift Builder)

const DEFAULT_HEART_IMAGE_PATH = './images/WhatsApp Image 2026-11-09 at 5.03.52 PM.jpeg';
const DEFAULT_FOR_YOU_VIDEO_PATH = './images/gemini_generated_video_c18638f2.mp4';

const DEFAULT_CONFIG = {
  herName: "My Love",
  introTitle: "A Galaxy of Love for You",
  introSubtitle: "HAPPY BIRTHDAY, MY LOVE ✨",
  introButton: "ENTER OUR UNIVERSE",
  hudTitle: "Our Love Universe",
  centerHeartPhoto: "", // Empty string uses the default portrait in ./images/ folder (window.CENTER_HEART_PHOTO)
  musicMode: "romantic_synth", // 'romantic_synth' | 'birthday_box' | 'custom'
  customMusicUrl: "",
  phrases: [
    "HAPPY BIRTHDAY",
    "MY ETERNAL LOVE ∞",
    "YOU ARE MAGIC ✨",
    "I ADORE YOU",
    "LOVE OF MY LIFE",
    "MY UNIVERSE",
    "TODAY WE CELEBRATE YOU",
    "FOREVER & ALWAYS",
    "MY FAVORITE PERSON",
    "YOU LIGHT UP MY WORLD",
    "HAPPY BIRTHDAY BEAUTIFUL",
    "ENDLESS LOVE ♥"
  ],
  memories: [
    {
      id: "mem-queen",
      title: "My Birthday Queen 💖",
      message: "Happy Birthday to the most gorgeous girl in the universe. Your smile lights up my entire galaxy every single day.",
      artwork: "__CENTER_PHOTO__"
    },
    {
      id: "mem-1",
      title: "Love of My Life",
      message: "The more time we spend together, the deeper I fall in love with you. Happy Birthday to my favorite person in the universe.",
      artwork: "coupleBalcony"
    },
    {
      id: "mem-2",
      title: "For You",
      message: "For you, who makes my heart beat in the most magical way. In every memory and every heartbeat, there is always you.",
      artwork: "__FOR_YOU_VIDEO__"
    },
    {
      id: "mem-3",
      title: "Forever & Always",
      message: "No matter how many lifetimes I get to live, in every single one of them I would still choose you. Forever and a day more.",
      artwork: "couplePicnic"
    },
    {
      id: "mem-4",
      title: "Birthday Wishes",
      message: "Today the whole universe celebrates the day you were born. May all your wishes shine as bright as your smile.",
      artwork: "herFlower"
    },
    {
      id: "mem-5",
      title: "Our Best Memories",
      message: "Every moment by your side feels like a dream I never want to wake up from. Here's to making a million more memories together.",
      artwork: "herGlasses"
    }
  ]
};

const SPANISH_PRESET = {
  herName: "Mi Vida",
  introTitle: "Una Galaxia de Amor para Ti",
  introSubtitle: "FELIZ CUMPLEAÑOS, MI VIDA ✨",
  introButton: "ENTRAR A NUESTRO UNIVERSO",
  hudTitle: "Nuestro Universo",
  phrases: [
    "HAPPY BIRTHDAY",
    "MI AMOR ETERNO ∞",
    "ERES MAGIA ✨",
    "TE ADORO",
    "AMOR DE MI VIDA",
    "MI UNIVERSO",
    "HOY CELEBRAMOS",
    "CUMPLE FELIZ",
    "FELIZ CUMPLEAÑOS",
    "SIEMPRE JUNTOS",
    "MI PRINCESA",
    "TE AMO CON LOCURA ♥"
  ],
  memories: [
    {
      id: "mem-queen",
      title: "Mi Reina Hermosa 💖",
      message: "Feliz cumpleaños a la mujer más hermosa del universo. Tu sonrisa ilumina toda mi galaxia cada día.",
      artwork: "__CENTER_PHOTO__"
    },
    {
      id: "mem-1",
      title: "Amor de mi Vida",
      message: "Cuanto más tiempo estamos juntos, más te amo. Feliz cumpleaños a la persona más especial de mi universo.",
      artwork: "coupleBalcony"
    },
    {
      id: "mem-2",
      title: "Para ti",
      message: "Para ti, que haces latir mi corazón de una forma única. En cada recuerdo y en cada latido, estás tú.",
      artwork: "__FOR_YOU_VIDEO__"
    },
    {
      id: "mem-3",
      title: "Para Siempre",
      message: "No me importa cuántas vidas tenga que vivir, en cada una de ellas te elegiré a ti. Para siempre y un día más.",
      artwork: "couplePicnic"
    },
    {
      id: "mem-4",
      title: "Feliz Cumpleaños",
      message: "Hoy el universo entero celebra el día en que naciste. Que todos tus sueños brillen tan fuerte como tu sonrisa.",
      artwork: "herFlower"
    },
    {
      id: "mem-5",
      title: "Nuestros Recuerdos",
      message: "Cada momento a tu lado es mi lugar favorito. Por un millón de aventuras y cumpleaños más juntos.",
      artwork: "herGlasses"
    }
  ]
};

class BirthdayGalaxyApp {
  constructor() {
    this.config = this.loadInitialConfig();
    this.isGiftMode = Boolean(window.EMBEDDED_GIFT_MODE) || new URLSearchParams(window.location.search).get('gift') === '1';

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.clock = new THREE.Clock();

    // 3D Groups
    this.galaxyGroup = new THREE.Group();
    this.heartGroup = new THREE.Group();
    this.centerPortraitGroup = new THREE.Group();
    this.centerHaloRing = null;
    this.orbitGroup = new THREE.Group();
    this.backgroundStars = null;
    this.heartParticles = null;
    this.streamParticles = null;

    // Interactive Memory Sprites & Live Video Node Updaters
    this.clickableSprites = [];
    this.memoryNodeObjects = [];
    this.videoNodeUpdaters = [];
    this.activeMemoryIndex = 0;
    this.pausedAudioForVideoModal = false;

    // Transition & Camera State
    this.hasEnteredUniverse = false;
    this.cameraTargetPos = null;
    this.cameraLookAtTarget = new THREE.Vector3(0, 3.2, 0);

    // Pointer / Touch tracking for accurate tap vs drag detection
    this.raycaster = new THREE.Raycaster();
    this.pointerDownPos = { x: 0, y: 0, time: 0 };

    this.initDOM();
    this.initThree();
    this.buildSceneObjects();
    this.bindEvents();
  }

  getActiveCenterPhotoSrc() {
    if (this.config && this.config.centerHeartPhoto) {
      return this.config.centerHeartPhoto;
    }
    return window.CENTER_HEART_PHOTO || DEFAULT_HEART_IMAGE_PATH;
  }

  isVideoArtwork(artworkKey) {
    if (!artworkKey) return false;
    return (
      artworkKey === '__FOR_YOU_VIDEO__' ||
      artworkKey.endsWith('.mp4') ||
      artworkKey.endsWith('.webm') ||
      artworkKey.startsWith('data:video/')
    );
  }

  resolveArtworkSrc(artworkKey) {
    if (!artworkKey || artworkKey === '__CENTER_PHOTO__') {
      return this.getActiveCenterPhotoSrc();
    }
    if (artworkKey === '__FOR_YOU_VIDEO__') {
      return window.FOR_YOU_VIDEO_DATA || DEFAULT_FOR_YOU_VIDEO_PATH;
    }
    if (window.NEW_GALAXY_PHOTOS && window.NEW_GALAXY_PHOTOS[artworkKey]) {
      return window.NEW_GALAXY_PHOTOS[artworkKey];
    }
    const newFolderFallbacks = {
      coupleBalcony: './images/new images/WhatsApp Image 2026-11-09 at 5.03.53 PM.jpeg',
      couplePicnic: './images/new images/Gemini_Generated_Image_cdckhicdckhicdck.jpg',
      herFlower: './images/new images/her_flower_upright.jpg',
      herGlasses: './images/new images/WhatsApp Image 2026-11-09 at 5.02.18 PM (1).jpeg'
    };
    if (newFolderFallbacks[artworkKey]) {
      return newFolderFallbacks[artworkKey];
    }
    return window.getArtworkDataUri(artworkKey);
  }

  loadInitialConfig() {
    if (window.EMBEDDED_GIFT_CONFIG) {
      return JSON.parse(JSON.stringify(window.EMBEDDED_GIFT_CONFIG));
    }
    if (window.location.hash && window.location.hash.startsWith('#gift=')) {
      try {
        const encoded = window.location.hash.slice(6);
        const jsonStr = decodeURIComponent(escape(atob(encoded)));
        const parsed = JSON.parse(jsonStr);
        return Object.assign({}, JSON.parse(JSON.stringify(DEFAULT_CONFIG)), parsed);
      } catch (e) {
        console.warn('Could not parse gift hash, falling back to saved/default config.');
      }
    }
    try {
      const saved = localStorage.getItem('birthday_galaxy_config_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.memories)) {
          parsed.memories.forEach(m => {
            if ((m.id === 'mem-2' || (m.title && (m.title.toLowerCase() === 'for you' || m.title.toLowerCase() === 'para ti'))) && m.artwork === 'snoopyLove') {
              m.artwork = '__FOR_YOU_VIDEO__';
            }
            if (m.id === 'mem-1' && m.artwork === 'spideyKitty') m.artwork = 'coupleBalcony';
            if (m.id === 'mem-3' && m.artwork === 'soulmatesGlow') m.artwork = 'couplePicnic';
            if (m.id === 'mem-4' && m.artwork === 'birthdayCrown') m.artwork = 'herFlower';
            if (m.id === 'mem-5' && m.artwork === 'couplePolaroid') m.artwork = 'herGlasses';
          });
        }
        return Object.assign({}, JSON.parse(JSON.stringify(DEFAULT_CONFIG)), parsed);
      }
    } catch (e) {}
    return JSON.parse(JSON.stringify(DEFAULT_CONFIG));
  }

  saveConfig() {
    try {
      localStorage.setItem('birthday_galaxy_config_v2', JSON.stringify(this.config));
    } catch (e) {}
  }

  initDOM() {
    const introIllus = document.getElementById('intro-illustration');
    if (introIllus) {
      introIllus.innerHTML = window.GALAXY_ARTWORK.introCouple;
    }

    this.applyConfigToDOM();

    if (this.isGiftMode) {
      const btnCustomize = document.getElementById('btn-open-builder');
      if (btnCustomize) btnCustomize.style.display = 'none';
    }
  }

  applyConfigToDOM() {
    document.getElementById('intro-title').textContent = this.config.introTitle;
    document.getElementById('intro-subtitle').textContent = this.config.introSubtitle;
    document.getElementById('btn-enter-universe').textContent = this.config.introButton;
    document.getElementById('hud-title-text').textContent = this.config.hudTitle || 'Our Love Universe';

    window.galaxyAudio.setMusicConfig(this.config.musicMode, this.config.customMusicUrl);
  }

  // ==========================================
  // THREE.JS 3D GALAXY ENGINE
  // ==========================================
  initThree() {
    const canvas = document.getElementById('galaxy-canvas');
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x05010a, 0.0042);

    const isMobile = window.innerWidth < 768;
    const fov = isMobile ? 60 : 48;
    this.camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 0.1, 600);

    this.camera.position.set(0, 6.5, 9);

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.055;
    this.controls.rotateSpeed = isMobile ? 0.78 : 0.65;
    this.controls.zoomSpeed = 0.9;
    this.controls.enablePan = false;
    this.controls.minDistance = 11;
    this.controls.maxDistance = 120;
    this.controls.maxPolarAngle = Math.PI * 0.62;
    this.controls.minPolarAngle = Math.PI * 0.12;
    this.controls.target.set(0, 3.8, 0);
    this.controls.enabled = false;

    this.scene.add(this.galaxyGroup);
    this.scene.add(this.heartGroup);
    this.scene.add(this.orbitGroup);
  }

  createGlowTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.25, 'rgba(255, 160, 215, 0.85)');
    grad.addColorStop(0.6, 'rgba(255, 45, 135, 0.35)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(canvas);
  }

  buildSceneObjects() {
    this.particleTexture = this.createGlowTexture();
    this.createBackgroundStars();
    this.createSpiralGalaxy();
    this.createCentralHeart();
    this.rebuildDynamicGalaxyItems();
  }

  createBackgroundStars() {
    const count = 2400;
    const geom = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const r = 80 + Math.random() * 180;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);

      const c = new THREE.Color().setHSL(0.9 + Math.random() * 0.12, 0.7, 0.75 + Math.random() * 0.25);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    geom.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 1.1,
      map: this.particleTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    this.backgroundStars = new THREE.Points(geom, mat);
    this.scene.add(this.backgroundStars);
  }

  createSpiralGalaxy() {
    while (this.galaxyGroup.children.length) {
      this.galaxyGroup.remove(this.galaxyGroup.children[0]);
    }

    const count = 20000;
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const arms = 4;
    const maxRadius = 48;
    const spin = 1.45;

    const colorCore = new THREE.Color('#ffffff');
    const colorInner = new THREE.Color('#ff5ca8');
    const colorMid = new THREE.Color('#d91b7a');
    const colorOuter = new THREE.Color('#5a1066');

    for (let i = 0; i < count; i++) {
      const t = Math.pow(Math.random(), 1.45);
      const radius = 1.65 + t * maxRadius;
      const armAngle = ((i % arms) / arms) * Math.PI * 2;
      const spinAngle = radius * spin * 0.22;

      const spread = 0.35 + (radius / maxRadius) * 2.6;
      const randX = Math.pow(Math.random(), 2.2) * (Math.random() < 0.5 ? 1 : -1) * spread;
      const randY = Math.pow(Math.random(), 2.8) * (Math.random() < 0.5 ? 1 : -1) * (spread * 0.28);
      const randZ = Math.pow(Math.random(), 2.2) * (Math.random() < 0.5 ? 1 : -1) * spread;

      const angle = armAngle + spinAngle;
      positions[i * 3] = Math.cos(angle) * radius + randX;
      positions[i * 3 + 1] = randY;
      positions[i * 3 + 2] = Math.sin(angle) * radius + randZ;

      const mixed = colorCore.clone();
      if (t < 0.12) {
        mixed.lerp(colorInner, t / 0.12);
      } else if (t < 0.55) {
        mixed.copy(colorInner).lerp(colorMid, (t - 0.12) / 0.43);
      } else {
        mixed.copy(colorMid).lerp(colorOuter, (t - 0.55) / 0.45);
      }

      colors[i * 3] = mixed.r;
      colors[i * 3 + 1] = mixed.g;
      colors[i * 3 + 2] = mixed.b;
    }

    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.65,
      map: this.particleTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.92,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    const galaxyPoints = new THREE.Points(geom, mat);
    this.galaxyGroup.add(galaxyPoints);

    const coreHole = new THREE.Mesh(
      new THREE.SphereGeometry(1.35, 24, 24),
      new THREE.MeshBasicMaterial({ color: 0x040008 })
    );
    this.galaxyGroup.add(coreHole);

    const glowCanvas = document.createElement('canvas');
    glowCanvas.width = 256;
    glowCanvas.height = 256;
    const gCtx = glowCanvas.getContext('2d');
    const rad = gCtx.createRadialGradient(128, 128, 14, 128, 128, 128);
    rad.addColorStop(0, 'rgba(255, 210, 235, 0.95)');
    rad.addColorStop(0.22, 'rgba(255, 65, 150, 0.7)');
    rad.addColorStop(0.55, 'rgba(190, 20, 100, 0.25)');
    rad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    gCtx.fillStyle = rad;
    gCtx.fillRect(0, 0, 256, 256);

    const coreGlowMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(16, 16),
      new THREE.MeshBasicMaterial({
        map: new THREE.CanvasTexture(glowCanvas),
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide
      })
    );
    coreGlowMesh.rotation.x = -Math.PI / 2;
    this.galaxyGroup.add(coreGlowMesh);
  }

  traceHeartPath(ctx, cx, cy, scale) {
    ctx.beginPath();
    for (let i = 0; i <= 180; i++) {
      const t = (i / 180) * Math.PI * 2;
      const hx = 16 * Math.pow(Math.sin(t), 3);
      const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
      const px = cx + hx * scale;
      const py = cy + hy * scale;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
  }

  build3DCenterHeartPortrait() {
    while (this.centerPortraitGroup.children.length) {
      this.centerPortraitGroup.remove(this.centerPortraitGroup.children[0]);
    }

    const size = 1024;
    const faceCanvas = document.createElement('canvas');
    faceCanvas.width = size;
    faceCanvas.height = size;
    const ctx = faceCanvas.getContext('2d');
    const faceTexture = new THREE.CanvasTexture(faceCanvas);
    faceTexture.minFilter = THREE.LinearFilter;
    faceTexture.magFilter = THREE.LinearFilter;

    const rimCanvas = document.createElement('canvas');
    rimCanvas.width = 512;
    rimCanvas.height = 512;
    const rCtx = rimCanvas.getContext('2d');
    rCtx.save();
    rCtx.shadowColor = '#ff2a85';
    rCtx.shadowBlur = 28;
    rCtx.strokeStyle = '#ff7eb9';
    rCtx.lineWidth = 14;
    this.traceHeartPath(rCtx, 256, 238, 12.2);
    rCtx.stroke();
    rCtx.restore();
    const rimTexture = new THREE.CanvasTexture(rimCanvas);

    const drawPortraitIntoHeart = (imgObj) => {
      ctx.clearRect(0, 0, size, size);
      const cx = size / 2;
      const cy = 476;
      const heartScale = 24.4;

      ctx.save();
      ctx.shadowColor = '#ff1e78';
      ctx.shadowBlur = 55;
      ctx.fillStyle = 'rgba(42, 4, 26, 0.92)';
      this.traceHeartPath(ctx, cx, cy, heartScale);
      ctx.fill();
      ctx.restore();

      ctx.save();
      this.traceHeartPath(ctx, cx, cy, heartScale);
      ctx.clip();

      const bgGrad = ctx.createRadialGradient(cx, cy - 20, 40, cx, cy, 420);
      bgGrad.addColorStop(0, '#3b0a28');
      bgGrad.addColorStop(1, '#12020c');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, size, size);

      if (imgObj && imgObj.width > 0) {
        const iw = imgObj.width;
        const ih = imgObj.height;
        const aspect = ih / iw;

        let sx = 0, sy = 0, sWidth = iw, sHeight = ih;
        if (aspect > 1.25) {
          sWidth = iw * 0.92;
          sHeight = sWidth;
          sx = (iw - sWidth) * 0.45;
          sy = ih * 0.24;
          if (sy + sHeight > ih) sy = ih - sHeight;
        } else {
          const minSide = Math.min(iw, ih);
          sx = (iw - minSide) / 2;
          sy = (ih - minSide) / 2;
          sWidth = minSide;
          sHeight = minSide;
        }

        const destSize = 820;
        const dx = cx - destSize / 2;
        const dy = cy - destSize / 2 + 18;
        ctx.drawImage(imgObj, sx, sy, sWidth, sHeight, dx, dy, destSize, destSize);

        const tintGrad = ctx.createRadialGradient(cx, cy - 30, 130, cx, cy, 410);
        tintGrad.addColorStop(0, 'rgba(255, 180, 215, 0.04)');
        tintGrad.addColorStop(0.58, 'rgba(255, 65, 150, 0.22)');
        tintGrad.addColorStop(0.82, 'rgba(130, 12, 75, 0.62)');
        tintGrad.addColorStop(1, 'rgba(24, 2, 16, 0.92)');
        ctx.fillStyle = tintGrad;
        ctx.fillRect(0, 0, size, size);
      }

      ctx.strokeStyle = 'rgba(20, 2, 14, 0.75)';
      ctx.lineWidth = 36;
      this.traceHeartPath(ctx, cx, cy, heartScale);
      ctx.stroke();

      const glassGrad = ctx.createLinearGradient(cx - 260, cy - 320, cx + 100, cy + 80);
      glassGrad.addColorStop(0, 'rgba(255, 255, 255, 0.28)');
      glassGrad.addColorStop(0.35, 'rgba(255, 195, 225, 0.06)');
      glassGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = glassGrad;
      ctx.fillRect(0, 0, size, size);

      ctx.restore();

      ctx.save();
      ctx.shadowColor = '#ff1e78';
      ctx.shadowBlur = 32;
      ctx.strokeStyle = '#ff4b93';
      ctx.lineWidth = 18;
      this.traceHeartPath(ctx, cx, cy, heartScale - 0.3);
      ctx.stroke();

      ctx.shadowColor = '#ffb3d9';
      ctx.shadowBlur = 14;
      ctx.strokeStyle = '#ffd6eb';
      ctx.lineWidth = 6.5;
      this.traceHeartPath(ctx, cx, cy, heartScale - 0.3);
      ctx.stroke();
      ctx.restore();

      faceTexture.needsUpdate = true;
    };

    drawPortraitIntoHeart(null);
    const portraitImg = new Image();
    portraitImg.crossOrigin = 'anonymous';
    portraitImg.onload = () => drawPortraitIntoHeart(portraitImg);
    portraitImg.src = this.getActiveCenterPhotoSrc();

    const planeSize = 10.6;
    const planeGeom = new THREE.PlaneGeometry(planeSize, planeSize);

    const frontMat = new THREE.MeshBasicMaterial({
      map: faceTexture,
      transparent: true,
      alphaTest: 0.04,
      depthWrite: true,
      side: THREE.FrontSide
    });
    const frontMesh = new THREE.Mesh(planeGeom, frontMat);
    frontMesh.position.z = 0.24;
    frontMesh.userData = { isCenterHeart: true, memoryIndex: 0 };
    this.centerPortraitGroup.add(frontMesh);

    const backMesh = new THREE.Mesh(planeGeom, frontMat);
    backMesh.rotation.y = Math.PI;
    backMesh.position.z = -0.24;
    backMesh.userData = { isCenterHeart: true, memoryIndex: 0 };
    this.centerPortraitGroup.add(backMesh);

    const rimMat = new THREE.MeshBasicMaterial({
      map: rimTexture,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    });
    const layers = 7;
    for (let i = 0; i < layers; i++) {
      const z = -0.20 + (i / (layers - 1)) * 0.40;
      const rimSlice = new THREE.Mesh(planeGeom, rimMat);
      rimSlice.position.z = z;
      const scaleBump = 1 + Math.sin((i / (layers - 1)) * Math.PI) * 0.035;
      rimSlice.scale.set(scaleBump, scaleBump, 1);
      this.centerPortraitGroup.add(rimSlice);
    }

    const ringGeom = new THREE.RingGeometry(5.6, 5.82, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xff85c8,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    this.centerHaloRing = new THREE.Mesh(ringGeom, ringMat);
    this.centerHaloRing.rotation.x = Math.PI * 0.38;
    this.centerHaloRing.rotation.y = Math.PI * 0.12;
    this.centerPortraitGroup.add(this.centerHaloRing);

    this.centerPortraitGroup.position.set(0, 7.6, 0);
    this.heartGroup.add(this.centerPortraitGroup);
  }

  createCentralHeart() {
    while (this.heartGroup.children.length) {
      this.heartGroup.remove(this.heartGroup.children[0]);
    }

    const heartCount = 6200;
    const geom = new THREE.BufferGeometry();
    const pos = new Float32Array(heartCount * 3);
    const colors = new Float32Array(heartCount * 3);

    const cBright = new THREE.Color('#ffb3d9');
    const cMid = new THREE.Color('#ff3b93');
    const cDeep = new THREE.Color('#d90b68');

    for (let i = 0; i < heartCount; i++) {
      const t = Math.random() * Math.PI * 2;
      const shell = 0.88 + Math.random() * 0.24;

      const x = 16 * Math.pow(Math.sin(t), 3) * shell;
      const y = (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * shell;

      const zSpread = (1.1 - Math.abs(Math.cos(t)) * 0.35) * 4.2;
      const z = (Math.random() - 0.5) * zSpread;

      const scale = 0.37;
      pos[i * 3] = x * scale + (Math.random() - 0.5) * 0.22;
      pos[i * 3 + 1] = y * scale + 7.2 + (Math.random() - 0.5) * 0.22;
      pos[i * 3 + 2] = z * scale + (Math.random() - 0.5) * 0.22;

      const rMix = Math.random();
      const col = rMix < 0.5
        ? cDeep.clone().lerp(cMid, rMix * 2)
        : cMid.clone().lerp(cBright, (rMix - 0.5) * 2);

      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    geom.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.52,
      map: this.particleTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    this.heartParticles = new THREE.Points(geom, mat);
    this.heartGroup.add(this.heartParticles);

    this.build3DCenterHeartPortrait();

    const streamCount = 480;
    const sGeom = new THREE.BufferGeometry();
    const sPos = new Float32Array(streamCount * 3);
    for (let i = 0; i < streamCount; i++) {
      const progress = i / streamCount;
      const angle = progress * Math.PI * 10;
      const radius = (1 - progress) * 1.65 + 0.12;
      sPos[i * 3] = Math.cos(angle) * radius;
      sPos[i * 3 + 1] = progress * 4.8;
      sPos[i * 3 + 2] = Math.sin(angle) * radius;
    }
    sGeom.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
    this.streamParticles = new THREE.Points(
      sGeom,
      new THREE.PointsMaterial({
        size: 0.44,
        map: this.particleTexture,
        color: 0xff77be,
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      })
    );
    this.heartGroup.add(this.streamParticles);
  }

  createPhraseSprite(text) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = '800 34px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.shadowColor = '#ff1e78';
    ctx.shadowBlur = 18;
    ctx.fillStyle = '#ff6bb5';
    ctx.fillText(text, 256, 64);

    ctx.shadowColor = '#ff85c8';
    ctx.shadowBlur = 8;
    ctx.fillStyle = '#fff0f7';
    ctx.fillText(text, 256, 64);

    const tex = new THREE.CanvasTexture(canvas);
    const mat = new THREE.SpriteMaterial({
      map: tex,
      transparent: true,
      depthWrite: false
    });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(8.2, 2.05, 1);
    return sprite;
  }

  createSmallHeartSprite() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    ctx.save();
    ctx.translate(64, 64);
    ctx.shadowColor = '#ff1e70';
    ctx.shadowBlur = 18;
    const grad = ctx.createRadialGradient(-10, -12, 4, 0, 0, 45);
    grad.addColorStop(0, '#ff9ec9');
    grad.addColorStop(0.45, '#ff2a78');
    grad.addColorStop(1, '#a30642');
    ctx.fillStyle = grad;

    ctx.beginPath();
    ctx.moveTo(0, 12);
    ctx.bezierCurveTo(-28, -14, -44, 12, 0, 40);
    ctx.bezierCurveTo(44, 12, 28, -14, 0, 12);
    ctx.fill();
    ctx.restore();

    const tex = new THREE.CanvasTexture(canvas);
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
      map: tex,
      transparent: true,
      depthWrite: false
    }));
    sprite.scale.set(2.4, 2.4, 1);
    return sprite;
  }

  createMemoryNode(memory, index, total) {
    const group = new THREE.Group();
    const angle = (index / total) * Math.PI * 2 + 0.35;
    const radius = 15.5 + (index % 2) * 5.5;
    const yOffset = 1.6 + (index % 2) * 0.7;

    group.position.set(
      Math.cos(angle) * radius,
      yOffset,
      Math.sin(angle) * radius
    );
    group.userData = { angle, radius, yOffset, memoryIndex: index };

    const canvas = document.createElement('canvas');
    canvas.width = 360;
    canvas.height = 420;
    const ctx = canvas.getContext('2d');
    const tex = new THREE.CanvasTexture(canvas);
    const isVideo = this.isVideoArtwork(memory.artwork);

    const drawNodeCanvas = (mediaSource, isVideoFrame = false) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const halo = ctx.createRadialGradient(180, 155, 20, 180, 155, 130);
      halo.addColorStop(0, 'rgba(255, 85, 165, 0.42)');
      halo.addColorStop(0.7, 'rgba(255, 45, 135, 0.12)');
      halo.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(180, 155, 130, 0, Math.PI * 2);
      ctx.fill();

      if (mediaSource) {
        ctx.save();
        const isPhoto = isVideoFrame || memory.artwork === '__CENTER_PHOTO__' || (memory.artwork && !window.GALAXY_ARTWORK[memory.artwork]);
        if (isPhoto) {
          ctx.beginPath();
          ctx.roundRect(45, 45, 270, 220, 28);
          ctx.clip();
          const mw = mediaSource.videoWidth || mediaSource.width || 270;
          const mh = mediaSource.videoHeight || mediaSource.height || 220;
          const targetRatio = 270 / 220;
          const srcRatio = mw / mh;
          let sx = 0, sy = 0, sw = mw, sh = mh;
          if (srcRatio > targetRatio) {
            sw = mh * targetRatio;
            sx = (mw - sw) / 2;
          } else {
            sh = mw / targetRatio;
            sy = mh > mw ? mh * 0.2 : (mh - sh) / 2;
          }
          ctx.drawImage(mediaSource, sx, sy, sw, sh, 45, 45, 270, 220);
          ctx.restore();

          ctx.strokeStyle = 'rgba(255, 140, 200, 0.9)';
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.roundRect(45, 45, 270, 220, 28);
          ctx.stroke();

          if (isVideoFrame) {
            // Glowing Play Video pill in top-right corner of the 3D card
            ctx.save();
            ctx.fillStyle = 'rgba(255, 45, 135, 0.88)';
            ctx.beginPath();
            ctx.roundRect(225, 58, 76, 28, 14);
            ctx.fill();
            ctx.font = '700 14px "Plus Jakarta Sans", sans-serif';
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('▶ VIDEO', 263, 72);
            ctx.restore();
          }
        } else {
          ctx.drawImage(mediaSource, 50, 25, 260, 260);
          ctx.restore();
        }
      }

      ctx.save();
      ctx.font = '700 30px "Playfair Display", Georgia, serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = '#ff1e78';
      ctx.shadowBlur = 14;
      ctx.fillStyle = '#ffffff';
      ctx.fillText(memory.title || 'For You', 180, 322);

      ctx.font = '600 18px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#ff94c8';
      ctx.fillText(isVideo ? '▶ TAP TO WATCH ♥' : '♥ TAP TO OPEN ♥', 180, 360);
      ctx.restore();

      tex.needsUpdate = true;
    };

    drawNodeCanvas(null);

    if (isVideo) {
      const thumbImg = new Image();
      thumbImg.crossOrigin = 'anonymous';
      thumbImg.onload = () => drawNodeCanvas(thumbImg, false);
      thumbImg.src = window.FOR_YOU_VIDEO_THUMB || './images/for_you_thumbnail.jpg';
    } else {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => drawNodeCanvas(img, false);
      img.src = this.resolveArtworkSrc(memory.artwork);
    }

    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
      map: tex,
      transparent: true,
      depthWrite: false
    }));
    sprite.scale.set(5.6, 6.5, 1);
    sprite.userData = { memoryIndex: index };

    group.add(sprite);
    this.clickableSprites.push(sprite);
    return group;
  }

  rebuildDynamicGalaxyItems() {
    while (this.orbitGroup.children.length) {
      this.orbitGroup.remove(this.orbitGroup.children[0]);
    }
    this.clickableSprites = [];
    this.memoryNodeObjects = [];
    this.videoNodeUpdaters = [];

    this.build3DCenterHeartPortrait();
    this.centerPortraitGroup.children.forEach(child => {
      if (child.userData && child.userData.isCenterHeart) {
        this.clickableSprites.push(child);
      }
    });

    const phrases = this.config.phrases || DEFAULT_CONFIG.phrases;
    phrases.forEach((text, i) => {
      if (!text || !text.trim()) return;
      const sprite = this.createPhraseSprite(text.trim());
      const ringIndex = i % 3;
      const radius = 11 + ringIndex * 8.5 + (Math.random() * 2.5);
      const angle = (i / phrases.length) * Math.PI * 2;
      const y = (Math.random() - 0.5) * 1.4;
      sprite.position.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
      this.orbitGroup.add(sprite);
    });

    for (let i = 0; i < 10; i++) {
      const hSprite = this.createSmallHeartSprite();
      const angle = (i / 10) * Math.PI * 2 + 0.2;
      const radius = 9 + (i % 3) * 9;
      hSprite.position.set(Math.cos(angle) * radius, 0.8 + (i % 2) * 0.8, Math.sin(angle) * radius);
      this.orbitGroup.add(hSprite);
    }

    const memories = this.config.memories || [];
    memories.forEach((mem, idx) => {
      const node = this.createMemoryNode(mem, idx, memories.length);
      this.orbitGroup.add(node);
      this.memoryNodeObjects.push(node);
    });
  }

  // ==========================================
  // INTERACTIONS, CAMERA & MODALS
  // ==========================================
  enterUniverse() {
    if (this.hasEnteredUniverse) return;
    this.hasEnteredUniverse = true;

    document.getElementById('intro-overlay').classList.add('hidden');
    document.getElementById('hud-layer').classList.add('visible');

    window.galaxyAudio.start();
    window.galaxyAudio.playSparkleChime();

    const isMobile = window.innerWidth < 768;
    this.cameraTargetPos = new THREE.Vector3(0, isMobile ? 14 : 12.5, isMobile ? 38 : 30);
    this.controls.target.set(0, 4.2, 0);
    this.controls.enabled = true;
  }

  stopModalVideoIfAny() {
    const mediaBox = document.getElementById('memory-media-box');
    if (mediaBox) {
      const vid = mediaBox.querySelector('video');
      if (vid) {
        vid.pause();
        vid.removeAttribute('src');
      }
      mediaBox.classList.remove('video-mode');
    }
    if (this.pausedAudioForVideoModal) {
      this.pausedAudioForVideoModal = false;
      if (!window.galaxyAudio.isMuted) {
        window.galaxyAudio.start();
      }
    }
  }

  openMemoryModal(index) {
    const memories = this.config.memories || [];
    if (!memories.length) return;
    this.stopModalVideoIfAny();

    this.activeMemoryIndex = ((index % memories.length) + memories.length) % memories.length;
    const mem = memories[this.activeMemoryIndex];

    window.galaxyAudio.playSparkleChime();

    if (mem.artwork === '__CENTER_PHOTO__') {
      this.cameraTargetPos = new THREE.Vector3(0, 8.2, 16);
      this.controls.target.set(0, 6.8, 0);
    } else {
      const nodeObj = this.memoryNodeObjects[this.activeMemoryIndex];
      if (nodeObj) {
        const worldPos = new THREE.Vector3();
        nodeObj.getWorldPosition(worldPos);
        const dir = worldPos.clone().normalize();
        this.cameraTargetPos = worldPos.clone().add(dir.multiplyScalar(12)).add(new THREE.Vector3(0, 3, 0));
      }
    }

    const mediaBox = document.getElementById('memory-media-box');
    if (this.isVideoArtwork(mem.artwork)) {
      mediaBox.classList.add('video-mode');
      const videoSrc = this.resolveArtworkSrc(mem.artwork);
      const posterSrc = window.FOR_YOU_VIDEO_THUMB || './images/for_you_thumbnail.jpg';
      // Pause background synth while the video plays so she hears the video's own sweet audio
      if (window.galaxyAudio.isPlaying) {
        window.galaxyAudio.stop();
        this.pausedAudioForVideoModal = true;
      }
      mediaBox.innerHTML = `<video src="${videoSrc}" poster="${posterSrc}" autoplay loop playsinline controls></video>`;
      const vidEl = mediaBox.querySelector('video');
      if (vidEl) {
        vidEl.volume = 0.85;
        vidEl.play().catch(() => {});
      }
    } else if (mem.artwork && window.GALAXY_ARTWORK[mem.artwork]) {
      mediaBox.innerHTML = window.GALAXY_ARTWORK[mem.artwork];
    } else {
      const isWidescreenPhoto = mem.artwork === 'coupleBalcony' || mem.artwork === 'couplePicnic' || mem.artwork === 'herFlower';
      if (isWidescreenPhoto) {
        mediaBox.classList.add('video-mode');
      }
      const imgSrc = this.resolveArtworkSrc(mem.artwork);
      const objPos = isWidescreenPhoto ? 'center center' : 'center 24%';
      mediaBox.innerHTML = `<img src="${imgSrc}" alt="${this.escapeHtml(mem.title)}" style="object-position: ${objPos};" />`;
    }

    document.getElementById('memory-title').textContent = mem.title;
    document.getElementById('memory-message').textContent = mem.message;
    document.getElementById('memory-modal-overlay').classList.add('active');
  }

  closeMemoryModal() {
    this.stopModalVideoIfAny();
    document.getElementById('memory-modal-overlay').classList.remove('active');
    const isMobile = window.innerWidth < 768;
    const currentDir = this.camera.position.clone().setY(0).normalize();
    const dist = isMobile ? 38 : 30;
    this.cameraTargetPos = new THREE.Vector3(currentDir.x * dist, isMobile ? 14 : 12.5, currentDir.z * dist);
    this.controls.target.set(0, 4.2, 0);
  }

  bindEvents() {
    document.getElementById('btn-enter-universe').addEventListener('click', () => {
      this.enterUniverse();
    });

    document.getElementById('btn-memory-back').addEventListener('click', () => {
      this.closeMemoryModal();
    });
    document.getElementById('btn-memory-prev').addEventListener('click', () => {
      this.openMemoryModal(this.activeMemoryIndex - 1);
    });
    document.getElementById('btn-memory-next').addEventListener('click', () => {
      this.openMemoryModal(this.activeMemoryIndex + 1);
    });
    document.getElementById('memory-modal-overlay').addEventListener('click', (e) => {
      if (e.target.id === 'memory-modal-overlay') {
        this.closeMemoryModal();
      }
    });

    document.getElementById('floating-heart-btn').addEventListener('click', () => {
      this.openMemoryModal(this.activeMemoryIndex);
      this.activeMemoryIndex = (this.activeMemoryIndex + 1) % (this.config.memories.length || 1);
    });

    const btnAudio = document.getElementById('btn-toggle-audio');
    btnAudio.addEventListener('click', () => {
      const playing = window.galaxyAudio.toggleMute();
      btnAudio.innerHTML = playing ? '🎵 <span>Music On</span>' : '🔇 <span>Muted</span>';
    });

    document.getElementById('btn-reset-view').addEventListener('click', () => {
      const isMobile = window.innerWidth < 768;
      this.cameraTargetPos = new THREE.Vector3(0, isMobile ? 14 : 12.5, isMobile ? 38 : 30);
      this.controls.target.set(0, 4.2, 0);
    });

    const canvas = document.getElementById('galaxy-canvas');
    canvas.addEventListener('pointerdown', (e) => {
      this.pointerDownPos = { x: e.clientX, y: e.clientY, time: performance.now() };
      this.cameraTargetPos = null;
    });

    canvas.addEventListener('pointerup', (e) => {
      const dx = e.clientX - this.pointerDownPos.x;
      const dy = e.clientY - this.pointerDownPos.y;
      const dist = Math.hypot(dx, dy);
      const elapsed = performance.now() - this.pointerDownPos.time;

      if (dist < 14 && elapsed < 450 && this.hasEnteredUniverse) {
        this.handleCanvasTap(e.clientX, e.clientY);
      }
    });

    window.addEventListener('resize', () => {
      const isMobile = window.innerWidth < 768;
      this.camera.fov = isMobile ? 60 : 48;
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    this.initGiftBuilder();
  }

  handleCanvasTap(clientX, clientY) {
    const mouse = new THREE.Vector2(
      (clientX / window.innerWidth) * 2 - 1,
      -(clientY / window.innerHeight) * 2 + 1
    );
    this.raycaster.setFromCamera(mouse, this.camera);
    const hits = this.raycaster.intersectObjects(this.clickableSprites, false);
    if (hits.length > 0) {
      const hitObj = hits[0].object;
      if (typeof hitObj.userData.memoryIndex === 'number') {
        this.openMemoryModal(hitObj.userData.memoryIndex);
      }
    }
  }

  // ==========================================
  // CUSTOMIZE / GIFT BUILDER PANEL
  // ==========================================
  initGiftBuilder() {
    const drawerOverlay = document.getElementById('builder-drawer-overlay');
    const btnOpen = document.getElementById('btn-open-builder');
    const btnClose = document.getElementById('btn-close-builder');

    btnOpen.addEventListener('click', () => {
      this.populateBuilderForm();
      drawerOverlay.classList.add('open');
    });

    btnClose.addEventListener('click', () => {
      drawerOverlay.classList.remove('open');
    });

    drawerOverlay.addEventListener('click', (e) => {
      if (e.target === drawerOverlay) drawerOverlay.classList.remove('open');
    });

    const inputCenterPhoto = document.getElementById('input-center-photo');
    if (inputCenterPhoto) {
      inputCenterPhoto.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        this.compressImageFile(file, (dataUrl) => {
          this.config.centerHeartPhoto = dataUrl;
          this.saveAndRefreshAll('Updated 3D Center Heart Portrait! 💖');
        });
      });
    }

    const btnResetCenterPhoto = document.getElementById('btn-reset-center-photo');
    if (btnResetCenterPhoto) {
      btnResetCenterPhoto.addEventListener('click', () => {
        this.config.centerHeartPhoto = '';
        this.saveAndRefreshAll('Restored default portrait inside 3D Heart ✨');
      });
    }

    document.getElementById('btn-preset-en').addEventListener('click', () => {
      const currentHeartPhoto = this.config.centerHeartPhoto;
      this.config = Object.assign({}, JSON.parse(JSON.stringify(DEFAULT_CONFIG)), { centerHeartPhoto: currentHeartPhoto });
      this.saveAndRefreshAll('Switched to English preset ✨');
      this.populateBuilderForm();
    });

    document.getElementById('btn-preset-es').addEventListener('click', () => {
      const currentHeartPhoto = this.config.centerHeartPhoto;
      this.config = Object.assign({}, JSON.parse(JSON.stringify(DEFAULT_CONFIG)), JSON.parse(JSON.stringify(SPANISH_PRESET)), { centerHeartPhoto: currentHeartPhoto });
      this.saveAndRefreshAll('Cambiado a Español (Original TikTok) ❤️');
      this.populateBuilderForm();
    });

    document.getElementById('btn-add-memory').addEventListener('click', () => {
      this.syncFormToConfig();
      this.config.memories.push({
        id: 'mem-' + Date.now(),
        title: 'Special Memory ❤️',
        message: 'Write your heartfelt birthday message here...',
        artwork: 'couplePolaroid'
      });
      this.saveAndRefreshAll('Added new memory card!');
      this.populateBuilderForm();
    });

    document.getElementById('input-music-file').addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        this.config.musicMode = 'custom';
        this.config.customMusicUrl = ev.target.result;
        document.getElementById('select-music-mode').value = 'custom';
        this.saveAndRefreshAll('Uploaded custom song 🎵');
      };
      reader.readAsDataURL(file);
    });

    document.getElementById('btn-save-builder').addEventListener('click', () => {
      this.syncFormToConfig();
      this.saveAndRefreshAll('Saved & updated your Galaxy! ✨');
      drawerOverlay.classList.remove('open');
    });

    document.getElementById('btn-copy-link').addEventListener('click', () => {
      this.syncFormToConfig();
      this.saveConfig();
      try {
        const shareObj = {
          introTitle: this.config.introTitle,
          introSubtitle: this.config.introSubtitle,
          introButton: this.config.introButton,
          hudTitle: this.config.hudTitle,
          phrases: this.config.phrases,
          memories: this.config.memories.map(m => ({
            title: m.title,
            message: m.message,
            artwork: m.artwork && m.artwork.startsWith('data:') ? '__CENTER_PHOTO__' : m.artwork
          }))
        };
        const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(shareObj))));
        const shareUrl = `${window.location.origin}${window.location.pathname}?gift=1#gift=${encoded}`;
        navigator.clipboard.writeText(shareUrl);
        this.showToast('Shareable Gift Link copied to clipboard! 🔗');
      } catch (err) {
        this.showToast('Saved! Host on Vercel/Netlify or download the HTML file.');
      }
    });

    document.getElementById('btn-export-whatsapp').addEventListener('click', () => {
      this.syncFormToConfig();
      this.saveConfig();
      this.exportStandaloneHtml();
    });
  }

  populateBuilderForm() {
    document.getElementById('input-intro-title').value = this.config.introTitle || '';
    document.getElementById('input-intro-subtitle').value = this.config.introSubtitle || '';
    document.getElementById('input-intro-btn').value = this.config.introButton || '';
    document.getElementById('input-hud-title').value = this.config.hudTitle || '';
    document.getElementById('select-music-mode').value = this.config.musicMode || 'romantic_synth';
    document.getElementById('input-phrases').value = (this.config.phrases || []).join('\n');

    const listEl = document.getElementById('memories-editor-list');
    listEl.innerHTML = '';

    (this.config.memories || []).forEach((mem, idx) => {
      const item = document.createElement('div');
      item.className = 'memory-editor-item';
      const isCustomMedia = mem.artwork && mem.artwork !== '__CENTER_PHOTO__' && mem.artwork !== '__FOR_YOU_VIDEO__' && !(window.NEW_GALAXY_PHOTOS && window.NEW_GALAXY_PHOTOS[mem.artwork]) && !window.GALAXY_ARTWORK[mem.artwork];

      item.innerHTML = `
        <div class="memory-editor-header">
          <span>★ Orbiting Memory #${idx + 1}</span>
          <button type="button" class="btn-small danger btn-delete-mem" data-idx="${idx}">Remove</button>
        </div>
        <div class="field-group">
          <label>Card Title</label>
          <input type="text" class="mem-input-title" data-idx="${idx}" value="${this.escapeHtml(mem.title)}" />
        </div>
        <div class="field-group">
          <label>Romantic Birthday Message</label>
          <textarea rows="2" class="mem-input-msg" data-idx="${idx}">${this.escapeHtml(mem.message)}</textarea>
        </div>
        <div class="field-group">
          <label>Sticker, Video, or Couple Photo</label>
          <div class="photo-upload-row">
            <select class="mem-select-art" data-idx="${idx}" style="flex:1;">
              <option value="coupleBalcony" ${mem.artwork === 'coupleBalcony' ? 'selected' : ''}>💑 Couple Balcony Selfie (Love of My Life)</option>
              <option value="couplePicnic" ${mem.artwork === 'couplePicnic' ? 'selected' : ''}>🧺 Couple Picnic Photo (Forever & Always)</option>
              <option value="herFlower" ${mem.artwork === 'herFlower' ? 'selected' : ''}>🌺 Her Flower Portrait (Birthday Wishes)</option>
              <option value="herGlasses" ${mem.artwork === 'herGlasses' ? 'selected' : ''}>👓 Her Glasses Portrait (Our Best Memories)</option>
              <option value="__FOR_YOU_VIDEO__" ${mem.artwork === '__FOR_YOU_VIDEO__' ? 'selected' : ''}>🎬 Romantic Picnic Video (For You)</option>
              <option value="__CENTER_PHOTO__" ${mem.artwork === '__CENTER_PHOTO__' ? 'selected' : ''}>💖 Her Portrait (From Center Heart)</option>
              <option value="spideyKitty" ${mem.artwork === 'spideyKitty' ? 'selected' : ''}>🕷️🐱 Spidey & Kitty</option>
              <option value="snoopyLove" ${mem.artwork === 'snoopyLove' ? 'selected' : ''}>🐶💕 Snoopy & Hearts</option>
              <option value="soulmatesGlow" ${mem.artwork === 'soulmatesGlow' ? 'selected' : ''}>✨💛 Glowing Soulmates</option>
              <option value="birthdayCrown" ${mem.artwork === 'birthdayCrown' ? 'selected' : ''}>🎂👑 Birthday Cake & Crown</option>
              <option value="couplePolaroid" ${mem.artwork === 'couplePolaroid' ? 'selected' : ''}>📸🌙 Starlit Couple Polaroid</option>
              <option value="introCouple" ${mem.artwork === 'introCouple' ? 'selected' : ''}>🧸💖 Cute Hugging Bears</option>
              ${isCustomMedia ? `<option value="${mem.artwork}" selected>🖼️ Custom Uploaded Media</option>` : ''}
            </select>
            <label class="btn-small" style="cursor:pointer;">
              📷 Upload Media
              <input type="file" accept="image/*,video/*" class="mem-file-upload" data-idx="${idx}" style="display:none;" />
            </label>
          </div>
        </div>
      `;
      listEl.appendChild(item);
    });

    listEl.querySelectorAll('.btn-delete-mem').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-idx'), 10);
        this.syncFormToConfig();
        this.config.memories.splice(idx, 1);
        this.saveAndRefreshAll('Removed memory card');
        this.populateBuilderForm();
      });
    });

    listEl.querySelectorAll('.mem-file-upload').forEach(input => {
      input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const idx = parseInt(input.getAttribute('data-idx'), 10);
        if (file.type.startsWith('video/')) {
          const reader = new FileReader();
          reader.onload = (ev) => {
            this.syncFormToConfig();
            this.config.memories[idx].artwork = ev.target.result;
            this.saveAndRefreshAll('Video added to Galaxy! 🎬');
            this.populateBuilderForm();
          };
          reader.readAsDataURL(file);
        } else {
          this.compressImageFile(file, (dataUrl) => {
            this.syncFormToConfig();
            this.config.memories[idx].artwork = dataUrl;
            this.saveAndRefreshAll('Photo added to Galaxy! 📸');
            this.populateBuilderForm();
          });
        }
      });
    });
  }

  compressImageFile(file, callback) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = 600;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        const minSide = Math.min(img.width, img.height);
        const sx = (img.width - minSide) / 2;
        const sy = (img.height - minSide) / 2;
        ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);
        callback(canvas.toDataURL('image/jpeg', 0.86));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  syncFormToConfig() {
    this.config.introTitle = document.getElementById('input-intro-title').value.trim() || DEFAULT_CONFIG.introTitle;
    this.config.introSubtitle = document.getElementById('input-intro-subtitle').value.trim() || DEFAULT_CONFIG.introSubtitle;
    this.config.introButton = document.getElementById('input-intro-btn').value.trim() || DEFAULT_CONFIG.introButton;
    this.config.hudTitle = document.getElementById('input-hud-title').value.trim() || DEFAULT_CONFIG.hudTitle;
    this.config.musicMode = document.getElementById('select-music-mode').value;

    const rawPhrases = document.getElementById('input-phrases').value
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);
    if (rawPhrases.length > 0) {
      this.config.phrases = rawPhrases;
    }

    const titleInputs = document.querySelectorAll('.mem-input-title');
    const msgInputs = document.querySelectorAll('.mem-input-msg');
    const artSelects = document.querySelectorAll('.mem-select-art');

    titleInputs.forEach((input, idx) => {
      if (this.config.memories[idx]) {
        this.config.memories[idx].title = input.value;
        this.config.memories[idx].message = msgInputs[idx].value;
        this.config.memories[idx].artwork = artSelects[idx].value;
      }
    });
  }

  saveAndRefreshAll(toastMessage) {
    this.saveConfig();
    this.applyConfigToDOM();
    this.rebuildDynamicGalaxyItems();
    if (toastMessage) this.showToast(toastMessage);
  }

  showToast(msg) {
    const toast = document.getElementById('toast-msg');
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
  }

  escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  async exportStandaloneHtml() {
    this.showToast('Building standalone HTML gift file...');
    try {
      let cssText = '';
      let artText = '';
      let audioText = '';
      let appText = '';

      try {
        const [cssRes, artRes, audioRes, appRes] = await Promise.all([
          fetch('./style.css').then(r => r.text()),
          fetch('./artwork.js').then(r => r.text()),
          fetch('./audio.js').then(r => r.text()),
          fetch('./app.js').then(r => r.text())
        ]);
        cssText = cssRes;
        artText = artRes;
        audioText = audioRes;
        appText = appRes;
      } catch (fetchErr) {
        for (const sheet of Array.from(document.styleSheets)) {
          try {
            if (sheet.href && sheet.href.includes('style.css')) {
              cssText = Array.from(sheet.cssRules).map(r => r.cssText).join('\n');
            }
          } catch (e) {}
        }
        artText = `window.GALAXY_ARTWORK = ${JSON.stringify(window.GALAXY_ARTWORK)};\nwindow.CENTER_HEART_PHOTO = ${JSON.stringify(window.CENTER_HEART_PHOTO)};\nwindow.getArtworkDataUri = ${window.getArtworkDataUri.toString()};`;
        audioText = `${GalaxyAudioEngine.toString()}\nwindow.galaxyAudio = new GalaxyAudioEngine();`;
        appText = `const DEFAULT_HEART_IMAGE_PATH = ${JSON.stringify(DEFAULT_HEART_IMAGE_PATH)};\nconst DEFAULT_FOR_YOU_VIDEO_PATH = ${JSON.stringify(DEFAULT_FOR_YOU_VIDEO_PATH)};\nconst DEFAULT_CONFIG = ${JSON.stringify(DEFAULT_CONFIG)};\nconst SPANISH_PRESET = ${JSON.stringify(SPANISH_PRESET)};\n${BirthdayGalaxyApp.toString()}\nwindow.addEventListener('DOMContentLoaded', () => { const app = new BirthdayGalaxyApp(); app.animate(); });`;
      }

      const cloneDoc = document.documentElement.cloneNode(true);
      cloneDoc.querySelectorAll('link[rel="stylesheet"], script').forEach(el => {
        const src = el.getAttribute('src') || '';
        const href = el.getAttribute('href') || '';
        if (href.includes('style.css') || src.includes('artwork.js') || src.includes('audio.js') || src.includes('app.js')) {
          el.remove();
        }
      });

      const introOverlay = cloneDoc.querySelector('#intro-overlay');
      if (introOverlay) introOverlay.className = 'intro-overlay';
      const hudLayer = cloneDoc.querySelector('#hud-layer');
      if (hudLayer) hudLayer.className = 'hud-layer';
      const memoryOverlay = cloneDoc.querySelector('#memory-modal-overlay');
      if (memoryOverlay) memoryOverlay.className = 'memory-modal-overlay';
      const builderOverlay = cloneDoc.querySelector('#builder-drawer-overlay');
      if (builderOverlay) builderOverlay.className = 'builder-drawer-overlay';

      const head = cloneDoc.querySelector('head');
      const styleTag = document.createElement('style');
      styleTag.textContent = cssText;
      head.appendChild(styleTag);

      const body = cloneDoc.querySelector('body');
      const inlineScript = document.createElement('script');
      inlineScript.textContent = `
window.EMBEDDED_GIFT_MODE = true;
window.EMBEDDED_GIFT_CONFIG = ${JSON.stringify(this.config, null, 2)};
${artText}
${audioText}
${appText}
`;
      body.appendChild(inlineScript);

      const fullHtml = '<!DOCTYPE html>\n' + cloneDoc.outerHTML;
      const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Happy Birthday 🥳❤️.html';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      this.showToast('Downloaded "Happy Birthday 🥳❤️.html"! Ready for WhatsApp 💖');
    } catch (err) {
      console.error(err);
      this.showToast('Error exporting file: ' + err.message);
    }
  }

  // ==========================================
  // 60FPS ANIMATION LOOP
  // ==========================================
  animate() {
    requestAnimationFrame(() => this.animate());

    const elapsed = this.clock.getElapsedTime();

    this.galaxyGroup.rotation.y = elapsed * 0.14;
    this.orbitGroup.rotation.y = elapsed * 0.11;

    this.memoryNodeObjects.forEach((node, idx) => {
      node.position.y = node.userData.yOffset + Math.sin(elapsed * 1.8 + idx * 1.3) * 0.42;
    });

    // Update live 3D video node textures
    if (this.videoNodeUpdaters.length > 0) {
      this.videoNodeUpdaters.forEach(fn => fn());
    }

    const beat = 1 + Math.sin(elapsed * 3.2) * 0.038 + Math.pow(Math.max(0, Math.sin(elapsed * 3.2)), 6) * 0.035;
    this.heartGroup.scale.set(beat, beat, beat);
    this.heartGroup.rotation.y = Math.sin(elapsed * 0.55) * 0.42;
    this.heartGroup.rotation.z = Math.cos(elapsed * 0.4) * 0.04;

    if (this.centerHaloRing) {
      this.centerHaloRing.rotation.z = elapsed * 0.8;
    }

    if (this.streamParticles) {
      this.streamParticles.rotation.y = -elapsed * 1.6;
    }

    if (this.backgroundStars) {
      this.backgroundStars.rotation.y = elapsed * 0.015;
    }

    if (this.cameraTargetPos) {
      this.camera.position.lerp(this.cameraTargetPos, 0.045);
      if (this.camera.position.distanceTo(this.cameraTargetPos) < 0.35) {
        this.cameraTargetPos = null;
      }
    }

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const app = new BirthdayGalaxyApp();
  app.animate();
});
