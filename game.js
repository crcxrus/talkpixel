// ===================================================
// Shibuya Canal Night 2.5D • しんとした夜 (game.js)
// Cinematic 2.5D Japanese Pixel City Adventure
// True 2.5D Depth Engine • 4-Way Movement • Volumetric World
// ===================================================

(function () {
  'use strict';

  // ─────────────────────────────────────────────────
  // WORLD CONSTANTS & STATE
  // ─────────────────────────────────────────────────
  const WORLD_WIDTH = 6400;
  const GRAVITY = 0.58;
  const JUMP_FORCE = -8.2;
  const WALK_SPEED = 3.0;

  // City Zones definitions (9 distinct districts)
  const CITY_ZONES = [
    { name: '🚉 Stasiun Kereta Laut', x1: 0, x2: 600, color: '#e74c3c' },
    { name: '🏪 Distrik Minimarket', x1: 600, x2: 1200, color: '#00cec9' },
    { name: '✂️ Jalan Barber & Izakaya', x1: 1200, x2: 1900, color: '#fdcb6e' },
    { name: '🕹️ Arcade & Game Center', x1: 1900, x2: 2600, color: '#a855f7' },
    { name: '⛩️ Kuil Inari Kecil', x1: 2600, x2: 3200, color: '#ff6b35' },
    { name: '🍜 Ramen Yokocho', x1: 3200, x2: 3900, color: '#f39c12' },
    { name: '📚 Toko Buku & Musik', x1: 3900, x2: 4600, color: '#6c5ce7' },
    { name: '☕ Kafe Katz & Taman', x1: 4600, x2: 5400, color: '#2ecc71' },
    { name: '🌳 Hutan Totoro', x1: 5400, x2: 6400, color: '#27ae60' }
  ];

  const state = {
    // Player with 2.5D depth:
    // x: horizontal world position (0 to 6400)
    // z: depth across the street (0.05 = back sidewalk/shops, 0.95 = front promenade/canal)
    // jumpY: vertical offset when jumping (< 0 in air)
    player: {
      x: 1000, z: 0.5, vx: 0, vz: 0,
      jumpY: 0, jumpVy: 0, onGround: true,
      w: 22, h: 58, facing: 1,
      isWalking: false, walkFrame: 0, walkTimer: 0, idleTimer: 0,
      name: 'Ren', color: '#2d3436', gold: 850, drinksCount: 1,
      isSitting: false, sitTarget: null, isFishing: false, isLeaning: false, staminaBuffTimer: 0
    },
    camera: { x: 800, y: 0 },
    timeOfDay: 0.82,
    timeSpeed: 0.00008,
    cinemaMode: false,
    showMinimap: true,
    keys: {},
    dpad: { left: false, right: false, up: false, down: false },
    analog: { x: 0, y: 0, active: false },
    currentZone: '',

    // ─── ENTITIES with X and 2.5D Z Depth ───
    entities: {
      // Zone 1: Stasiun Kereta Laut (0-600)
      seaTrain: { x: 120, z: 0.08, w: 460, h: 140 },
      kaonashi: { x: 380, z: 0.18, w: 34, h: 62 },
      stationBench1: { x: 200, z: 0.22, w: 50, h: 22 },
      stationBench2: { x: 500, z: 0.22, w: 50, h: 22 },
      ticketMachine: { x: 80, z: 0.18, w: 36, h: 65 },

      // Zone 2: Distrik Minimarket (600-1200)
      shopBleem: { x: 740, z: 0.05, w: 230, h: 185 },
      vendingMachine: { x: 700, z: 0.18, w: 42, h: 74, glow: 1 },
      vendingMachine2: { x: 1100, z: 0.18, w: 42, h: 74, glow: 1 },
      phoneBooth: { x: 960, z: 0.20, w: 30, h: 82 },
      postBox: { x: 1050, z: 0.22, w: 26, h: 40 },

      // Zone 3: Barber & Izakaya (1200-1900)
      salonBarber: { x: 1220, z: 0.05, w: 200, h: 175, poleAngle: 0 },
      izakayaHouse: { x: 1440, z: 0.05, w: 320, h: 225 },
      streetLamp1: { x: 1390, z: 0.32, h: 190 },
      trafficLight1: { x: 1770, z: 0.35, h: 180 },
      takoyakiStand: { x: 1820, z: 0.26, w: 100, h: 75 },

      // Zone 4: Arcade (1900-2600)
      arcadeBuilding: { x: 1950, z: 0.05, w: 280, h: 210 },
      garaponMachine: { x: 2270, z: 0.22, w: 40, h: 60 },
      streetLamp2: { x: 2350, z: 0.72, h: 190 },
      purikuraBooth: { x: 2400, z: 0.20, w: 80, h: 95 },
      craneGame: { x: 2500, z: 0.24, w: 60, h: 80 },

      // Zone 5: Kuil Inari (2600-3200)
      toriiGate: { x: 2700, z: 0.25, w: 120, h: 140 },
      shrineMain: { x: 2850, z: 0.05, w: 220, h: 160 },
      komainu1: { x: 2820, z: 0.22, w: 24, h: 30 },
      komainu2: { x: 3060, z: 0.22, w: 24, h: 30 },
      emaBoard: { x: 3100, z: 0.20, w: 50, h: 80 },

      // Zone 6: Ramen Yokocho (3200-3900)
      ramenShop: { x: 3280, z: 0.05, w: 220, h: 165 },
      yakitoriStand: { x: 3530, z: 0.26, w: 120, h: 80 },
      taiyakiCart: { x: 3680, z: 0.28, w: 80, h: 65 },
      streetLamp3: { x: 3780, z: 0.32, h: 190 },
      lanternRow: { x: 3300, z: 0.15 },

      // Zone 7: Buku & Musik (3900-4600)
      bookstore: { x: 3960, z: 0.05, w: 240, h: 185 },
      recordShop: { x: 4230, z: 0.05, w: 200, h: 170 },
      streetLamp4: { x: 4460, z: 0.72, h: 190 },
      busStop: { x: 4500, z: 0.32, w: 60, h: 110 },

      // Zone 8: Kafe Katz & Taman (4600-5400)
      cafeKatz: { x: 4680, z: 0.05, w: 290, h: 195 },
      parkBench1: { x: 5020, z: 0.30, w: 50, h: 24 },
      fountain: { x: 5150, z: 0.45, w: 80, h: 60 },
      flowerBed: { x: 5280, z: 0.80, w: 100, h: 20 },

      // Zone 9: Hutan Totoro (5400-6400)
      totoroTree: { x: 5600, z: 0.08, scale: 1.2 },
      totoro: { x: 5680, z: 0.25, w: 78, h: 100, breathe: 0 },
      mushroomCluster: { x: 5900, z: 0.35 },
      forestLantern: { x: 6100, z: 0.40, h: 80 },

      // Cats with 2.5D depths
      strayCatJiji: { x: 1750, z: 0.45, w: 16, h: 16 },
      strayCatShiro: { x: 4720, z: 0.25, w: 18, h: 16, tailAngle: 0 },
      strayCatMike: { x: 3400, z: 0.82, w: 16, h: 16 },

      // NPCs with 2.5D roaming
      npcAoi: { x: 1045, z: 0.25, w: 18, h: 56, isWalking: true, vx: 0.45, minX: 900, maxX: 1160, facing: 1, walkFrame: 0, walkTimer: 0 },
      npcKen: { x: 1550, z: 0.20, w: 20, h: 60, holdingCan: true, isWalking: false, facing: 1, walkFrame: 0, walkTimer: 0 },
      npcRen: { x: 1600, z: 0.55, w: 20, h: 58, isWalking: true, vx: -0.5, minX: 1480, maxX: 1720, facing: -1, walkFrame: 0, walkTimer: 0 },
      npcYuki: { x: 2100, z: 0.82, w: 18, h: 54, isWalking: true, vx: 0.35, minX: 1980, maxX: 2320, facing: 1, walkFrame: 0, walkTimer: 0 },
      npcHiro: { x: 3350, z: 0.50, w: 20, h: 58, isWalking: true, vx: 0.35, minX: 3260, maxX: 3520, facing: 1, walkFrame: 0, walkTimer: 0 },
      npcSakura: { x: 4000, z: 0.22, w: 18, h: 55, isWalking: true, vx: -0.4, minX: 3940, maxX: 4220, facing: -1, walkFrame: 0, walkTimer: 0 },
      npcTaro: { x: 5050, z: 0.32, w: 20, h: 58, isWalking: true, vx: 0.25, minX: 4980, maxX: 5220, facing: 1, walkFrame: 0, walkTimer: 0 },
      npcMiko: { x: 2900, z: 0.20, w: 18, h: 54, isWalking: false, facing: 1, walkFrame: 0, walkTimer: 0 }
    },

    scene: 'street',
    savedStreetX: 2020,
    savedStreetZ: 0.5,

    // Interior scenes with 2.5D rooms
    cafeInterior: {
      roomWidth: 960,
      baristaHana: { x: 530, z: 0.25, brewTimer: 0 },
      catMimi: { x: 180, z: 0.4, zzzTimer: 0 },
      patronSora: { x: 840, z: 0.35 },
      recordPlayer: { x: 710, z: 0.2, spinAngle: 0, currentTrack: 0 },
      steamParticles: []
    },
    bleemInterior: {
      roomWidth: 800,
      cashierMika: { x: 650, z: 0.25 }
    },
    arcadeInterior: {
      roomWidth: 900
    },

    stars: [],
    skylineBuildings: [],
    midgroundBuildings: [],
    particles: [],
    chatBubbles: [],
    audio: { ctx: null, musicEnabled: false, step: 0, timer: null },
    activePrompt: null,
    zoneTimer: 0,
    vinylTrackNames: ['Lo-Fi Chill', 'Jazz Night', 'City Rain', 'Sakura Waltz']
  };

  // ─────────────────────────────────────────────────
  // CANVAS & 2.5D STREET GEOMETRY
  // ─────────────────────────────────────────────────
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  // Calculates the 2.5D street depth, perspective layers, and waterline
  function getStreetGeometry() {
    const h = canvas.height;
    // Canal water height at the bottom
    const waterHeight = Math.max(68, Math.floor(h * 0.17));
    // Vertical 3D stone retaining canal wall
    const canalWallHeight = 24;
    // Front edge of the promenade (where the canal wall drops)
    const streetFrontY = Math.floor(h - waterHeight - canalWallHeight);
    // Depth span of the walkable street plane (vertical depth in pixels)
    const streetDepthSpan = Math.min(145, Math.max(100, Math.floor(h * 0.23)));
    // Back edge of sidewalk (where building facades sit)
    const streetBackY = streetFrontY - streetDepthSpan;

    // Depth zones
    const sidewalkHeight = Math.floor(streetDepthSpan * 0.35); // 0.00 to 0.35
    const roadwayHeight = Math.floor(streetDepthSpan * 0.42);  // 0.35 to 0.77
    const promenadeHeight = streetDepthSpan - sidewalkHeight - roadwayHeight; // 0.77 to 1.00

    return {
      canvasHeight: h,
      waterY: h - waterHeight,
      waterHeight,
      canalWallY: streetFrontY,
      canalWallHeight,
      streetFrontY,
      streetDepthSpan,
      streetBackY,
      sidewalkY: streetBackY,
      sidewalkHeight,
      roadwayY: streetBackY + sidewalkHeight,
      roadwayHeight,
      promenadeY: streetBackY + sidewalkHeight + roadwayHeight,
      promenadeHeight
    };
  }

  // Backward compatibility helper
  function getGroundY() {
    return getStreetGeometry().streetBackY;
  }

  function resizeCanvas() {
    const container = document.getElementById('canvas-container') || canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    ctx.imageSmoothingEnabled = false;

    // Reposition building facades to sit directly on streetBackY
    const geom = getStreetGeometry();
    const backY = geom.streetBackY;
    const ents = state.entities;

    ents.seaTrain.y = backY - 120;
    ents.shopBleem.y = backY - 180;
    ents.salonBarber.y = backY - 175;
    ents.izakayaHouse.y = backY - 225;
    ents.arcadeBuilding.y = backY - 210;
    ents.shrineMain.y = backY - 160;
    ents.ramenShop.y = backY - 165;
    ents.bookstore.y = backY - 185;
    ents.recordShop.y = backY - 170;
    ents.cafeKatz.y = backY - 190;
    ents.totoroTree.y = backY - 160;
  }
  window.addEventListener('resize', resizeCanvas);

  // ─────────────────────────────────────────────────
  // BACKGROUND PARALLAX GENERATORS
  // ─────────────────────────────────────────────────
  function initCityElements() {
    // Stars
    state.stars = [];
    for (let i = 0; i < 90; i++) {
      state.stars.push({
        x: Math.random() * (WORLD_WIDTH * 0.4),
        y: Math.random() * (canvas.height * 0.45),
        size: Math.random() > 0.8 ? 2 : 1,
        twinkle: Math.random() * Math.PI * 2
      });
    }

    // Distant skyline (Parallax 0.08)
    state.skylineBuildings = [];
    let curX = 0;
    while (curX < WORLD_WIDTH + 600) {
      const bWidth = 55 + Math.random() * 95;
      const bHeight = 140 + Math.random() * 210;
      const windows = [];
      const rows = Math.floor(bHeight / 16);
      const cols = Math.floor(bWidth / 14);
      for (let r = 2; r < rows; r++) {
        for (let c = 1; c < cols - 1; c++) {
          if (Math.random() < 0.28) {
            windows.push({
              rx: c * 14, ry: r * 16,
              color: Math.random() > 0.4 ? '#f5cd79' : '#00f0ff'
            });
          }
        }
      }
      state.skylineBuildings.push({
        x: curX, w: bWidth, h: bHeight,
        hasBeacon: Math.random() > 0.5,
        hasNeon: Math.random() > 0.65,
        neonText: ['JUST', 'NEO', 'DREAM', '夜', '光', 'TOKYO'][Math.floor(Math.random() * 6)],
        windows
      });
      curX += bWidth + (Math.random() * 30 - 10);
    }

    // Midground buildings (Parallax 0.22)
    state.midgroundBuildings = [];
    curX = 0;
    const midColors = ['#1a233a', '#1e2842', '#162035', '#212d4a', '#17223b'];
    const signTexts = ['珈琲', 'ラーメン', 'バー', '寿司', 'ホテル', '薬局', '24H', 'カラオケ'];
    const signColors = ['#ff2a7a', '#00f0ff', '#ffd166', '#a855f7', '#ff6b35', '#00b894'];
    while (curX < WORLD_WIDTH + 500) {
      const bWidth = 80 + Math.random() * 120;
      const bHeight = 160 + Math.random() * 180;
      state.midgroundBuildings.push({
        x: curX, w: bWidth, h: bHeight,
        color: midColors[Math.floor(Math.random() * midColors.length)],
        hasSign: Math.random() > 0.4,
        signText: signTexts[Math.floor(Math.random() * signTexts.length)],
        signColor: signColors[Math.floor(Math.random() * signColors.length)]
      });
      curX += bWidth + 15 + Math.random() * 25;
    }

    // Floating particles (night leaves, glow dust)
    state.particles = [];
    for (let i = 0; i < 45; i++) {
      state.particles.push({
        x: Math.random() * WORLD_WIDTH,
        y: Math.random() * canvas.height,
        vx: -0.35 - Math.random() * 0.45,
        vy: 0.15 + Math.random() * 0.25,
        size: 1 + Math.random() * 2,
        color: Math.random() > 0.6 ? '#f5cd79' : (Math.random() > 0.5 ? '#ff7675' : '#74b9ff'),
        alpha: 0.4 + Math.random() * 0.5
      });
    }
  }

  // ─────────────────────────────────────────────────
  // AUDIO & SOUND SYNTHESIS
  // ─────────────────────────────────────────────────
  function initAudio() {
    if (!state.audio.ctx) {
      state.audio.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (state.audio.ctx.state === 'suspended') {
      state.audio.ctx.resume();
    }
  }

  function playTone(freq, type = 'sine', duration = 0.2, gainVal = 0.1) {
    try {
      initAudio();
      const actx = state.audio.ctx;
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, actx.currentTime);
      gain.gain.setValueAtTime(gainVal, actx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + duration);
      osc.connect(gain);
      gain.connect(actx.destination);
      osc.start();
      osc.stop(actx.currentTime + duration);
    } catch (e) { }
  }

  const sfx = {
    step() { playTone(95 + Math.random() * 30, 'triangle', 0.04, 0.025); },
    jump() {
      try {
        initAudio();
        const actx = state.audio.ctx;
        const osc = actx.createOscillator();
        const gain = actx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(170, actx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(390, actx.currentTime + 0.16);
        gain.gain.setValueAtTime(0.08, actx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + 0.16);
        osc.connect(gain); gain.connect(actx.destination);
        osc.start(); osc.stop(actx.currentTime + 0.16);
      } catch (e) { }
    },
    vending() {
      playTone(950, 'sine', 0.08, 0.1);
      setTimeout(() => { playTone(180, 'triangle', 0.12, 0.15); setTimeout(() => playTone(120, 'sine', 0.18, 0.12), 60); }, 180);
    },
    meow() {
      try {
        initAudio();
        const actx = state.audio.ctx;
        const osc = actx.createOscillator();
        const gain = actx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(640, actx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(840, actx.currentTime + 0.12);
        osc.frequency.exponentialRampToValueAtTime(680, actx.currentTime + 0.28);
        gain.gain.setValueAtTime(0.09, actx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + 0.28);
        osc.connect(gain); gain.connect(actx.destination);
        osc.start(); osc.stop(actx.currentTime + 0.28);
      } catch (e) { }
    },
    dialog() { playTone(440, 'triangle', 0.06, 0.05); },
    doorChime() {
      playTone(1046.5, 'sine', 0.25, 0.12);
      setTimeout(() => playTone(1318.5, 'sine', 0.35, 0.14), 130);
    },
    coffeeBrew() {
      playTone(320, 'sine', 0.15, 0.08);
      setTimeout(() => playTone(540, 'triangle', 0.2, 0.07), 90);
    },
    coin() {
      playTone(1200, 'sine', 0.08, 0.1);
      setTimeout(() => playTone(1600, 'sine', 0.12, 0.08), 80);
    },
    shrine() {
      playTone(520, 'sine', 0.4, 0.06);
      setTimeout(() => playTone(780, 'sine', 0.6, 0.05), 200);
    }
  };

  const lofiChords = [
    [349.23, 440.00, 523.25, 659.25],
    [329.63, 392.00, 493.88, 587.33],
    [293.66, 349.23, 440.00, 523.25],
    [261.63, 329.63, 392.00, 493.88]
  ];

  function playLoFiChord(frequencies) {
    try {
      initAudio();
      const actx = state.audio.ctx;
      frequencies.forEach(f => {
        const osc = actx.createOscillator();
        const gain = actx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, actx.currentTime);
        gain.gain.setValueAtTime(0.018, actx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + 3.2);
        osc.connect(gain); gain.connect(actx.destination);
        osc.start(); osc.stop(actx.currentTime + 3.2);
      });
    } catch (e) { }
  }

  function scheduleMusicStep() {
    if (!state.audio.musicEnabled) return;
    const chord = lofiChords[state.audio.step % lofiChords.length];
    playLoFiChord(chord);
    state.audio.step++;
    state.audio.timer = setTimeout(scheduleMusicStep, 3400);
  }

  function toggleAudio() {
    state.audio.musicEnabled = !state.audio.musicEnabled;
    const btn = document.getElementById('btn-audio');
    if (state.audio.musicEnabled) {
      if (btn) btn.classList.add('active');
      scheduleMusicStep();
      showNotification('🎵 Musik Lo-Fi Aktif');
    } else {
      if (btn) btn.classList.remove('active');
      clearTimeout(state.audio.timer);
      showNotification('Musik Dimatikan');
    }
  }

  // ─────────────────────────────────────────────────
  // INPUT & TRUE 4-DIRECTIONAL 2.5D CONTROLS
  // ─────────────────────────────────────────────────
  window.addEventListener('keydown', e => {
    const chatInput = document.getElementById('chat-input');
    if (document.activeElement === chatInput) {
      if (e.key === 'Enter') sendChat();
      if (e.key === 'Escape') { chatInput.blur(); }
      return;
    }
    const key = e.key.toLowerCase();
    state.keys[key] = true;
    state.keys[e.code] = true;
    if (key.length === 1 && '1234567890'.indexOf(key) >= 0 && EMOTES['1234567890'.indexOf(key)]) setEmote(EMOTES['1234567890'.indexOf(key)]);

    // Jumping with Space or K
    if (e.key === ' ' || key === 'k') {
      e.preventDefault();
      handleJump();
    }
    // Action / Interaction with E
    if (key === 'e') {
      e.preventDefault();
      handleAction();
    }
    // Chat focus with Enter or T
    if ((e.key === 'Enter' || key === 't') && chatInput) {
      e.preventDefault();
      toggleChat(true);
      setTimeout(() => chatInput.focus(), 50);
    }
    // Toggle camera / cinema mode
    if (key === 'c') toggleCinemaMode();
    // Toggle minimap
    if (key === 'm') toggleMinimap();
  });

  window.addEventListener('keyup', e => {
    if (document.activeElement === document.getElementById('chat-input')) return;
    const key = e.key.toLowerCase();
    state.keys[key] = false;
    state.keys[e.code] = false;
  });

  function handleJump() {
    const p = state.player;
    if (p.isSitting || p.isLeaning || p.isFishing) {
      p.isSitting = false;
      p.isLeaning = false;
      p.isFishing = false;
      showNotification('Kamu kembali berjalan.');
      return;
    }
    if (state.scene === 'sawit_island') {
      if (window.SawitModule && window.SawitModule.state && window.SawitModule.state.onGround) {
        window.SawitModule.state.playerVel.y = 18.0;
        window.SawitModule.state.onGround = false;
        try { sfx.jump(); } catch (_) {}
      }
      return;
    }
    if (p.onGround) {
      p.jumpVy = JUMP_FORCE;
      p.onGround = false;
      sfx.jump();
    }
  }

  function handleAction() {
    if (state.activePrompt && state.activePrompt.handler) {
      state.activePrompt.handler();
    } else {
      checkProximityAction();
    }
  }

  function toggleCinemaMode() {
    state.cinemaMode = !state.cinemaMode;
    document.body.classList.toggle('cinema-mode', state.cinemaMode);
    showNotification(state.cinemaMode ? '📷 Mode Sinematik Aktif (Tekan C)' : 'Mode Normal');
  }

  function toggleMinimap() {
    state.showMinimap = !state.showMinimap;
    const mc = document.getElementById('minimap-canvas');
    if (mc) mc.style.opacity = state.showMinimap ? '1' : '0';
  }

  // True when the touch-friendly UI (joystick, A/B buttons) is active
  const touchUIQuery = window.matchMedia('(pointer: coarse), (max-width: 900px)');
  function isTouchUI() { return touchUIQuery.matches; }

  // Mobile controls: analog joystick (free 360° walking in 2.5D), A (action), B (jump), emote popup, menu
  function setupMobileControls() {
    const $ = id => document.getElementById(id);
    const buzz = ms => { try { if (navigator.vibrate) navigator.vibrate(ms); } catch (_) {} };

    // ── Analog joystick ──
    const base = $('joystick'), knob = $('joystick-knob');
    if (base && knob) {
      let pid = null, cx = 0, cy = 0, radius = 1;
      const DEAD = 0.18;
      const an = state.analog;
      const reset = () => {
        pid = null; an.x = 0; an.y = 0; an.active = false;
        knob.style.transform = 'translate(-50%, -50%)';
        base.classList.remove('active');
      };
      const update = e => {
        let dx = e.clientX - cx, dy = e.clientY - cy;
        // Forced-landscape mode rotates the UI 90° clockwise: map screen delta back to local delta
        if (document.documentElement.classList.contains('rot')) { const t = dx; dx = dy; dy = -t; }
        const dist = Math.hypot(dx, dy);
        if (dist > radius) { dx = dx / dist * radius; dy = dy / dist * radius; }
        knob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
        const nx = dx / radius, ny = dy / radius, mag = Math.hypot(nx, ny);
        if (mag < DEAD) { an.x = 0; an.y = 0; an.active = false; return; }
        const s = (mag - DEAD) / (1 - DEAD) / mag;
        an.x = nx * s; an.y = ny * s; an.active = true;
      };
      base.addEventListener('pointerdown', e => {
        if (pid !== null) return;
        e.preventDefault();
        pid = e.pointerId;
        try { base.setPointerCapture(pid); } catch (_) {}
        const r = base.getBoundingClientRect();
        cx = r.left + r.width / 2; cy = r.top + r.height / 2;
        radius = Math.max(10, (r.width - knob.offsetWidth) / 2);
        base.classList.add('active');
        update(e);
      });
      base.addEventListener('pointermove', e => { if (e.pointerId === pid) { e.preventDefault(); update(e); } });
      ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(t =>
        base.addEventListener(t, e => { if (e.pointerId === pid) reset(); }));
      window.addEventListener('blur', reset);
    }

    // ── A (action) & B (jump) ──
    const press = (el, fn) => {
      if (!el) return;
      el.addEventListener('pointerdown', e => { e.preventDefault(); el.classList.add('pressed'); buzz(12); fn(); });
      ['pointerup', 'pointercancel', 'pointerleave'].forEach(t => el.addEventListener(t, () => el.classList.remove('pressed')));
    };
    press($('action-a'), handleAction);
    press($('action-jump'), handleJump);

    // Tap the on-screen prompt to interact as well
    const promptEl = $('interaction-prompt');
    if (promptEl) promptEl.addEventListener('pointerdown', e => { e.preventDefault(); handleAction(); });

    // ── Emote popup (single button instead of 8 stacked buttons) ──
    const emoteBar = $('emote-bar'), emoteToggle = $('emote-toggle');
    const closeEmotes = () => { if (emoteBar) emoteBar.classList.remove('open'); if (emoteToggle) emoteToggle.classList.remove('active'); };
    if (emoteBar && emoteToggle) {
      emoteToggle.addEventListener('pointerdown', e => {
        e.preventDefault(); e.stopPropagation(); buzz(8);
        const open = emoteBar.classList.toggle('open');
        emoteToggle.classList.toggle('active', open);
      });
      emoteBar.addEventListener('click', closeEmotes);
      $('game-canvas').addEventListener('pointerdown', closeEmotes);
    }

    // ── Menu (audio, time, minimap, chat) ──
    const menuBtn = $('btn-menu'), quick = $('quick-menu');
    if (menuBtn && quick) {
      const closeMenu = () => { quick.classList.remove('open'); menuBtn.classList.remove('active'); };
      menuBtn.addEventListener('click', e => {
        e.stopPropagation();
        const open = quick.classList.toggle('open');
        menuBtn.classList.toggle('active', open);
      });
      quick.addEventListener('click', e => { if (e.target.closest('button') && e.target.id !== 'btn-audio' && e.target.id !== 'btn-time') closeMenu(); });
      $('game-canvas').addEventListener('pointerdown', closeMenu);
    }

    // ── Mode layar (tombol di menu) ──
    const rotBtn = $('btn-rotate');
    if (rotBtn) rotBtn.addEventListener('click', () => setViewMode(viewMode === 'landscape' ? 'normal' : 'landscape', true));
  }

  // ── Mode layar: 'normal' (ikuti posisi HP) atau 'landscape' (paksa miring) ──
  const VIEW_KEY = 'shibuyaViewMode';
  let viewMode = 'normal';
  try { viewMode = localStorage.getItem(VIEW_KEY) === 'landscape' ? 'landscape' : 'normal'; } catch (_) {}

  async function lockLandscape(on) {
    try {
      if (on) {
        if (!document.fullscreenElement && document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
        if (screen.orientation && screen.orientation.lock) await screen.orientation.lock('landscape');
      } else if (screen.orientation && screen.orientation.unlock) {
        screen.orientation.unlock();
      }
    } catch (_) { /* tidak didukung browser: pakai rotasi UI */ }
  }

  function applyViewMode() {
    const de = document.documentElement, vw = window.innerWidth, vh = window.innerHeight;
    const rotated = viewMode === 'landscape' && isTouchUI() && vh > vw;
    const ew = rotated ? vh : vw, eh = rotated ? vw : vh;
    de.classList.toggle('rot', rotated);
    de.classList.toggle('short', eh <= 420);
    de.classList.toggle('narrow', ew <= 480);
    de.classList.toggle('portrait-ui', eh > ew);
    de.style.setProperty('--ew', ew + 'px');
    de.style.setProperty('--eh', eh + 'px');
    document.querySelectorAll('#view-mode [data-mode]').forEach(b => b.classList.toggle('on', b.dataset.mode === viewMode));
    const rb = document.getElementById('btn-rotate');
    if (rb) rb.classList.toggle('active', viewMode === 'landscape');
    const gw = document.getElementById('game-wrapper');
    if (gw && !gw.classList.contains('hidden')) resizeCanvas();
  }

  function setViewMode(mode, notify) {
    viewMode = mode === 'landscape' ? 'landscape' : 'normal';
    try { localStorage.setItem(VIEW_KEY, viewMode); } catch (_) {}
    if (isTouchUI()) lockLandscape(viewMode === 'landscape'); // dipanggil dari tap pengguna
    applyViewMode();
    if (notify) showNotification(viewMode === 'landscape' ? '🔄 Mode Miring (landscape) aktif' : '📱 Mode Biasa aktif');
  }

  window.addEventListener('resize', applyViewMode);
  window.addEventListener('orientationchange', () => setTimeout(applyViewMode, 150));
  document.querySelectorAll('#view-mode [data-mode]').forEach(b => b.addEventListener('click', () => setViewMode(b.dataset.mode, false)));
  applyViewMode();

  // ─────────────────────────────────────────────────
  // 2.5D PLAYER PHYSICS & CAMERA
  // ─────────────────────────────────────────────────
  function updatePlayer(dt) {
    if (state.scene === 'sawit_island' && window.SawitModule && window.SawitModule.updatePlayer) {
      window.SawitModule.updatePlayer(dt, state.player, state);
      return;
    }
    const p = state.player;
    const geom = getStreetGeometry();
    let currentSpeed = WALK_SPEED;
    if (p.staminaBuffTimer > 0) {
      p.staminaBuffTimer -= dt;
      currentSpeed *= 1.25;
    }

    // 4-Way 2.5D Movement:
    // Left/Right: X axis
    // Up/Down: Z depth axis (Up walks toward shops, Down walks toward canal)
    let moveX = 0;
    let moveZ = 0;

    if (state.keys['a'] || state.keys['arrowleft'] || state.dpad.left) moveX -= 1;
    if (state.keys['d'] || state.keys['arrowright'] || state.dpad.right) moveX += 1;
    if (state.keys['w'] || state.keys['arrowup'] || state.dpad.up) moveZ -= 1;
    if (state.keys['s'] || state.keys['arrowdown'] || state.dpad.down) moveZ += 1;

    // Analog joystick overrides digital input (variable speed, any direction)
    const analog = state.analog.active;
    if (analog) { moveX = state.analog.x; moveZ = state.analog.y; }

    // Cancel idle poses when input received
    if ((moveX !== 0 || moveZ !== 0) && (p.isSitting || p.isLeaning || p.isFishing)) {
      p.isSitting = false;
      p.isLeaning = false;
      p.isFishing = false;
    }

    if ((moveX !== 0 || moveZ !== 0) && !p.isSitting && !p.isLeaning && !p.isFishing) {
      // Normalize diagonal movement speed
      if (!analog && moveX !== 0 && moveZ !== 0) {
        const inv = 0.7071;
        moveX *= inv;
        moveZ *= inv;
      }

      p.vx = moveX * currentSpeed;
      // Z movement speed relative to depth span
      const depthSpeed = currentSpeed * 0.70;
      p.vz = (moveZ * depthSpeed) / geom.streetDepthSpan;

      if (Math.abs(moveX) > (analog ? 0.2 : 0)) p.facing = moveX > 0 ? 1 : -1;
      p.isWalking = true;
      p.idleTimer = 0;
      p.walkTimer += dt;
      if (p.walkTimer > 0.12) {
        p.walkTimer = 0;
        p.walkFrame = (p.walkFrame + 1) % 6;
        if (p.onGround && (p.walkFrame === 0 || p.walkFrame === 3)) sfx.step();
      }
    } else {
      p.vx = 0;
      p.vz = 0;
      p.isWalking = false;
      p.walkFrame = 0;
      p.idleTimer += dt;
    }

    // Update coordinates
    p.x += p.vx;
    p.z += p.vz;
    // Clamp Z depth within walkable street boundaries (0.04 near shopfronts, 0.96 near canal promenade railing)
    p.z = Math.max(0.04, Math.min(0.96, p.z));

    // Jump Physics (Z-preserving volumetric 2.5D jump)
    if (!p.onGround || p.jumpVy !== 0 || p.jumpY !== 0) {
      p.jumpVy += GRAVITY;
      p.jumpY += p.jumpVy;
      if (p.jumpY >= 0) {
        p.jumpY = 0;
        p.jumpVy = 0;
        p.onGround = true;
      }
    }

    // Bounds checking for X
    const isInterior = state.scene !== 'street';
    let worldMaxX = WORLD_WIDTH;
    if (state.scene === 'cafe_interior') worldMaxX = state.cafeInterior.roomWidth;
    else if (state.scene === 'bleem_interior') worldMaxX = state.bleemInterior.roomWidth;
    else if (state.scene === 'arcade_interior') worldMaxX = state.arcadeInterior.roomWidth;
    else if (state.scene === 'sawit_island') worldMaxX = (window.SawitModule && window.SawitModule.state) ? window.SawitModule.state.worldWidth : 2800;

    p.x = Math.max(isInterior ? 45 : 40, Math.min(worldMaxX - 50, p.x));

    // Smooth Camera Follow
    const maxCamX = Math.max(0, worldMaxX - canvas.width);
    const targetCamX = p.x - canvas.width / 2;
    state.camera.x += (targetCamX - state.camera.x) * 0.085;
    state.camera.x = Math.max(0, Math.min(maxCamX, state.camera.x));
  }

  // ─────────────────────────────────────────────────
  // WORLD UPDATE & NPC AI
  // ─────────────────────────────────────────────────
  function updateWorld(dt) {
    state.timeOfDay = (state.timeOfDay + state.timeSpeed) % 1.0;
    updateTimeUI();
    updateZoneLabel();

    if (state.scene === 'sawit_island' && window.SawitModule) {
      window.SawitModule.update(dt, state);
    }

    state.entities.salonBarber.poleAngle = (state.entities.salonBarber.poleAngle + 0.08) % (Math.PI * 2);
    state.entities.totoro.breathe += 0.035;

    // Ambient floating particles
    for (const pt of state.particles) {
      pt.x += pt.vx; pt.y += pt.vy;
      if (pt.y > canvas.height) pt.y = 0;
      if (pt.x > WORLD_WIDTH) pt.x = 0;
      if (pt.x < 0) pt.x = WORLD_WIDTH;
    }

    // NPC 2.5D Wandering AI
    const walkingNpcs = [
      { key: 'npcAoi', baseZ: 0.25 },
      { key: 'npcRen', baseZ: 0.55 },
      { key: 'npcYuki', baseZ: 0.82 },
      { key: 'npcHiro', baseZ: 0.50 },
      { key: 'npcSakura', baseZ: 0.22 },
      { key: 'npcTaro', baseZ: 0.32 }
    ];

    updateNpcEmotes();
    walkingNpcs.forEach(item => {
      const npc = state.entities[item.key];
      if (npc && npc.isWalking && !npcBusy(npc)) {
        if (npc.facingFix) { npc.facingFix = false; npc.facing = npc.vx >= 0 ? 1 : -1; }
        npc.x += npc.vx;
        // Subtle natural depth drift
        if (npc.z === undefined) npc.z = item.baseZ;
        npc.z += Math.sin(Date.now() * 0.001 + npc.x * 0.02) * 0.0004;
        npc.z = Math.max(0.12, Math.min(0.88, npc.z));

        npc.walkTimer += dt;
        if (npc.walkTimer > 0.15) {
          npc.walkFrame = (npc.walkFrame + 1) % 6;
          npc.walkTimer = 0;
        }
        if (npc.x > npc.maxX) { npc.x = npc.maxX; npc.vx *= -1; npc.facing = -1; }
        if (npc.x < npc.minX) { npc.x = npc.minX; npc.vx *= -1; npc.facing = 1; }
      }
    });

    // Cafe interior logic
    if (state.scene === 'cafe_interior') {
      state.cafeInterior.recordPlayer.spinAngle += 0.04;
      state.cafeInterior.catMimi.zzzTimer += dt;
      state.cafeInterior.baristaHana.brewTimer += dt;
      if (Math.random() < 0.28) {
        state.cafeInterior.steamParticles.push({
          x: 530 + (Math.random() - 0.5) * 22,
          y: getStreetGeometry().streetBackY + 20,
          vx: (Math.random() - 0.5) * 0.3,
          vy: -0.6 - Math.random() * 0.4,
          alpha: 0.65, size: 3 + Math.random() * 3
        });
      }
      for (let i = state.cafeInterior.steamParticles.length - 1; i >= 0; i--) {
        const sp = state.cafeInterior.steamParticles[i];
        sp.x += sp.vx; sp.y += sp.vy; sp.alpha -= 0.012; sp.size += 0.06;
        if (sp.alpha <= 0) state.cafeInterior.steamParticles.splice(i, 1);
      }
    }

    // Chat bubble timers
    for (let i = state.chatBubbles.length - 1; i >= 0; i--) {
      const b = state.chatBubbles[i];
      b.timer -= dt;
      if (b.timer < 0.3) b.alpha = Math.max(0, b.timer / 0.3);
      else b.alpha = Math.min(1, (b.maxTimer - b.timer) / 0.2);
      if (b.timer <= 0) state.chatBubbles.splice(i, 1);
    }

    checkProximityAction();
  }

  function updateZoneLabel() {
    const px = state.player.x;
    let foundZone = null;
    for (const z of CITY_ZONES) {
      if (px >= z.x1 && px < z.x2) { foundZone = z; break; }
    }
    if (foundZone && foundZone.name !== state.currentZone) {
      state.currentZone = foundZone.name;
      const el = document.getElementById('zone-label');
      if (el) {
        el.textContent = foundZone.name;
        el.classList.remove('hidden');
        el.style.color = foundZone.color;
        clearTimeout(state.zoneTimer);
        state.zoneTimer = setTimeout(() => el.classList.add('hidden'), 2800);
      }
    }
  }

  // ─────────────────────────────────────────────────
  // 2.5D PROXIMITY DETECTION & ACTIONS
  // ─────────────────────────────────────────────────
  function isNear(p, entX, entZ, maxDist = 65) {
    const geom = getStreetGeometry();
    const dx = p.x - entX;
    const dz = (p.z - (entZ !== undefined ? entZ : 0.25)) * geom.streetDepthSpan;
    return Math.hypot(dx, dz) < maxDist;
  }

  function checkProximityAction() {
    const p = state.player;
    const promptEl = document.getElementById('interaction-prompt');
    const promptText = document.getElementById('prompt-text');
    let newPrompt = null;

    if (state.scene === 'sawit_island') {
      if (window.SawitModule) {
        newPrompt = window.SawitModule.checkProximityAction(p, state);
      }
    } else if (state.scene === 'street') {
      const ents = state.entities;

      // Vending machines
      if (isNear(p, ents.vendingMachine.x + 20, ents.vendingMachine.z, 60) ||
          isNear(p, ents.vendingMachine2.x + 20, ents.vendingMachine2.z, 60)) {
        newPrompt = { text: 'Beli Kopi Kaleng Hangat 🥫 [E]', handler: buyVendingDrink };
      }
      // Ticket Machine & Stasiun Kereta Laut (Pintu Masuk Pulau Sawit)
      else if (isNear(p, ents.ticketMachine.x + 18, ents.ticketMachine.z, 60) || isNear(p, ents.seaTrain.x + 120, ents.seaTrain.z, 80)) {
        newPrompt = {
          text: 'Naik Kereta ke Perkebunan Sawit Simulator 🌴 [E]',
          handler: () => {
            if (window.SawitModule) window.SawitModule.enterSawit(state);
          }
        };
      }
      // NPC Aoi
      else if (isNear(p, ents.npcAoi.x, ents.npcAoi.z, 55)) {
        newPrompt = {
          text: 'Sapa Aoi 💬 [E]',
          handler: () => {
            sfx.dialog();
            showNotification('Aoi: "Malam ini udaranya sejuk ya... lampu kanal terlihat sangat cantik."');
            addChatMessage('Aoi', 'Malam ini udaranya sejuk ya...', '#00f0ff');
            showChatBubble('Aoi', 'Udaranya sejuk ya...', () => getEntityScreenPos(ents.npcAoi), '#00f0ff', 4.5);
          }
        };
      }
      // NPC Ken
      else if (isNear(p, ents.npcKen.x, ents.npcKen.z, 65)) {
        newPrompt = {
          text: 'Ngobrol dengan Ken ☕ [E]',
          handler: () => {
            sfx.dialog();
            showNotification('Ken: "Yo! Mau mampir ngopi di Katz atau jalan ke stasiun laut?"');
            addChatMessage('Ken', 'Yo! Malam begini enaknya ngopi.', '#f5cd79');
            showChatBubble('Ken', 'Yo! Enaknya ngopi nih.', () => getEntityScreenPos(ents.npcKen), '#f5cd79', 4.5);
          }
        };
      }
      // NPC Yuki (Arcade)
      else if (isNear(p, ents.npcYuki.x, ents.npcYuki.z, 55)) {
        newPrompt = {
          text: 'Sapa Yuki 🎮 [E]',
          handler: () => {
            sfx.dialog();
            showNotification('Yuki: "Arcade baru saja buka! Ada game baru lho~"');
            showChatBubble('Yuki', 'Ada game baru di arcade!', () => getEntityScreenPos(ents.npcYuki), '#a855f7', 4.5);
          }
        };
      }
      // NPC Hiro (Ramen)
      else if (isNear(p, ents.npcHiro.x, ents.npcHiro.z, 55)) {
        newPrompt = {
          text: 'Ngobrol dengan Hiro 🍜 [E]',
          handler: () => {
            sfx.dialog();
            showNotification('Hiro: "Ramen di sini enak banget! Kuah tonkotsu-nya mantap!"');
            showChatBubble('Hiro', 'Ramen di sini mantap!', () => getEntityScreenPos(ents.npcHiro), '#f39c12', 4.5);
          }
        };
      }
      // NPC Sakura (Bookstore)
      else if (isNear(p, ents.npcSakura.x, ents.npcSakura.z, 55)) {
        newPrompt = {
          text: 'Sapa Sakura 📚 [E]',
          handler: () => {
            sfx.dialog();
            showNotification('Sakura: "Aku baru beli novel terbaru Haruki Murakami!"');
            showChatBubble('Sakura', 'Novel terbaru Murakami!', () => getEntityScreenPos(ents.npcSakura), '#6c5ce7', 4.5);
          }
        };
      }
      // NPC Taro (Park)
      else if (isNear(p, ents.npcTaro.x, ents.npcTaro.z, 55)) {
        newPrompt = {
          text: 'Ngobrol dengan Taro 🌳 [E]',
          handler: () => {
            sfx.dialog();
            showNotification('Taro: "Taman ini indah sekali di malam hari. Kamu suka air mancurnya?"');
            showChatBubble('Taro', 'Taman malam ini indah ya!', () => getEntityScreenPos(ents.npcTaro), '#2ecc71', 4.5);
          }
        };
      }
      // NPC Miko (Shrine)
      else if (isNear(p, ents.npcMiko.x, ents.npcMiko.z, 55)) {
        newPrompt = {
          text: 'Bicara dengan Miko ⛩️ [E]',
          handler: () => {
            sfx.shrine();
            showNotification('Miko: "Selamat datang di Kuil Inari. Buatlah permohonan dengan tulus."');
            showChatBubble('Miko', 'Selamat datang di Kuil~', () => getEntityScreenPos(ents.npcMiko), '#ff6b35', 4.5);
          }
        };
      }
      // Cats
      else if (isNear(p, ents.strayCatJiji.x, ents.strayCatJiji.z, 45)) {
        newPrompt = {
          text: 'Elus Jiji 🐾 [E]',
          handler: () => {
            sfx.meow(); p.staminaBuffTimer = 20;
            showNotification('🐾 Jiji mendengkur manja! (+Speed Buff)');
            showChatBubble('Jiji 🐾', 'Meowww! ❤️', () => getEntityScreenPos(ents.strayCatJiji), '#ffd166', 3.5);
          }
        };
      }
      else if (isNear(p, ents.strayCatShiro.x, ents.strayCatShiro.z, 45)) {
        newPrompt = {
          text: 'Elus Shiro 🐱 [E]',
          handler: () => {
            sfx.meow();
            showNotification('🐱 Shiro mengeong pelan...');
            showChatBubble('Shiro 🐱', 'Nyaa~', () => getEntityScreenPos(ents.strayCatShiro), '#dfe6e9', 3.5);
          }
        };
      }
      else if (isNear(p, ents.strayCatMike.x, ents.strayCatMike.z, 45)) {
        newPrompt = {
          text: 'Elus Mike 🐈 [E]',
          handler: () => {
            sfx.meow(); p.staminaBuffTimer = 15;
            showNotification('🐈 Mike si kucing belang! (+Speed Buff)');
            showChatBubble('Mike 🐈', 'Purrrr~', () => getEntityScreenPos(ents.strayCatMike), '#f39c12', 3.5);
          }
        };
      }
      // Kaonashi (sitting together)
      else if (isNear(p, ents.kaonashi.x + 10, ents.kaonashi.z, 65)) {
        newPrompt = {
          text: p.isSitting ? 'Berdiri [E]' : 'Duduk bersama Kaonashi ☕ [E]',
          handler: () => {
            if (!p.isSitting) {
              p.isSitting = true;
              p.x = ents.kaonashi.x - 24;
              p.z = ents.kaonashi.z;
              sfx.vending();
              showNotification('Kamu duduk di samping Kaonashi... 🌊');
              showChatBubble('Kaonashi', '...Ah... Ah...', () => getEntityScreenPos(ents.kaonashi), '#b197fc', 4.0);
            } else {
              p.isSitting = false;
              showNotification('Kamu bangkit dari kursi kereta.');
            }
          }
        };
      }
      // Minimarket BLEE.M entrance door (at the back sidewalk)
      else if (isNear(p, ents.shopBleem.x + 120, 0.12, 75)) {
        newPrompt = { text: 'Masuk Minimarket BLEE.M 🏪 [E]', handler: enterBleemInterior };
      }
      // Arcade Center entrance door
      else if (isNear(p, ents.arcadeBuilding.x + 140, 0.12, 80)) {
        newPrompt = { text: 'Masuk Arcade Center 🕹️ [E]', handler: enterArcadeInterior };
      }
      // Ramen Shop
      else if (isNear(p, ents.ramenShop.x + 110, 0.14, 70)) {
        newPrompt = {
          text: 'Makan Ramen Hangat 🍜 [E]',
          handler: () => {
            if (p.gold >= 200) {
              p.gold -= 200; updateCurrencyUI(); sfx.coffeeBrew();
              showNotification('🍜 Kamu menikmati semangkuk ramen lezat! (-200 Yen, +Stamina)');
              p.staminaBuffTimer = 35;
            } else {
              showNotification('Uangmu tidak cukup untuk ramen (perlu 200 Yen)');
            }
          }
        };
      }
      // Takoyaki Stand
      else if (isNear(p, ents.takoyakiStand.x + 50, ents.takoyakiStand.z, 65)) {
        newPrompt = {
          text: 'Beli Takoyaki 🐙 (150 Yen) [E]',
          handler: () => {
            if (p.gold >= 150) {
              p.gold -= 150; updateCurrencyUI(); sfx.coin();
              showNotification('🐙 Takoyaki panas katsuobushi! Gurih sekali!');
            } else showNotification('Uang tidak cukup (perlu 150 Yen)');
          }
        };
      }
      // Yakitori Stand
      else if (isNear(p, ents.yakitoriStand.x + 60, ents.yakitoriStand.z, 65)) {
        newPrompt = {
          text: 'Beli Sate Yakitori 🍢 (180 Yen) [E]',
          handler: () => {
            if (p.gold >= 180) {
              p.gold -= 180; updateCurrencyUI(); sfx.coin();
              showNotification('🍢 Yakitori bakar bumbu tare! Harum mantap!');
            } else showNotification('Uang tidak cukup (perlu 180 Yen)');
          }
        };
      }
      // Taiyaki Cart
      else if (isNear(p, ents.taiyakiCart.x + 40, ents.taiyakiCart.z, 60)) {
        newPrompt = {
          text: 'Beli Taiyaki Manis 🐟 (120 Yen) [E]',
          handler: () => {
            if (p.gold >= 120) {
              p.gold -= 120; updateCurrencyUI(); sfx.coin();
              showNotification('🐟 Taiyaki isi pasta kacang merah manis hangat!');
            } else showNotification('Uang tidak cukup (perlu 120 Yen)');
          }
        };
      }
      // Inari Shrine Ema Board
      else if (isNear(p, ents.emaBoard.x + 25, ents.emaBoard.z, 55)) {
        newPrompt = {
          text: 'Tulis Doa di Ema 🎋 [E]',
          handler: () => {
            sfx.shrine();
            showNotification('🎋 Kamu menggantung doa di papan Ema Kuil: "Semoga kota ini selalu damai."');
          }
        };
      }
      // Inari Shrine Main
      else if (isNear(p, ents.shrineMain.x + 110, ents.shrineMain.z, 75)) {
        newPrompt = {
          text: 'Berdoa di Altar Kuil Inari ⛩️ [E]',
          handler: () => {
            sfx.shrine();
            showNotification('⛩️ *Kling-kling* Kamu melempar koin dan berdoa di bawah lentera kuil...');
          }
        };
      }
      // Garapon Lucky Machine
      else if (isNear(p, ents.garaponMachine.x + 20, ents.garaponMachine.z, 55)) {
        newPrompt = {
          text: 'Putar Lotre Garapon 🎯 (100 Yen) [E]',
          handler: () => {
            if (p.gold >= 100) {
              p.gold -= 100; updateCurrencyUI(); sfx.coin();
              const prizes = ['Emas! +500 Yen!', 'Merah! Minuman gratis!', 'Putih! Permen mint.', 'Biru! +200 Yen!'];
              const res = prizes[Math.floor(Math.random() * prizes.length)];
              if (res.includes('+500')) p.gold += 500;
              if (res.includes('+200')) p.gold += 200;
              updateCurrencyUI();
              showNotification(`🎯 Kamu memutar roda Garapon: ${res}`);
            } else showNotification('Perlu 100 Yen untuk memutar Garapon!');
          }
        };
      }
      // Bookstore
      else if (isNear(p, ents.bookstore.x + 120, 0.12, 75)) {
        newPrompt = {
          text: 'Baca Buku di Toko Buku 📚 [E]',
          handler: () => {
            sfx.dialog();
            showNotification('📚 Kamu membaca cuplikan manga dan majalah seni Tokyo...');
          }
        };
      }
      // Record Shop
      else if (isNear(p, ents.recordShop.x + 100, 0.12, 70)) {
        newPrompt = {
          text: 'Dengarkan Piringan Hitam 🎶 [E]',
          handler: () => {
            sfx.coffeeBrew();
            showNotification('🎶 Suara vinyl lo-fi klasik terdengar di telingamu...');
          }
        };
      }
      // Cafe Katz Entrance
      else if (isNear(p, ents.cafeKatz.x + 75, 0.12, 75)) {
        newPrompt = { text: 'Masuk Kafe Katz ☕ [E]', handler: enterCafeInterior };
      }
      // Park Bench
      else if (isNear(p, ents.parkBench1.x + 25, ents.parkBench1.z, 55)) {
        newPrompt = {
          text: p.isSitting ? 'Berdiri [E]' : 'Duduk di Bangku Taman 🌸 [E]',
          handler: () => {
            if (!p.isSitting) {
              p.isSitting = true; p.x = ents.parkBench1.x + 15; p.z = ents.parkBench1.z;
              showNotification('Kamu duduk di bangku taman sambil menikmati angin malam...');
            } else { p.isSitting = false; showNotification('Kamu berdiri dari bangku.'); }
          }
        };
      }
      // Totoro
      else if (isNear(p, ents.totoro.x + 39, ents.totoro.z, 75)) {
        newPrompt = {
          text: 'Sapa Totoro yang Tidur 🍃 [E]',
          handler: () => {
            sfx.dialog();
            showNotification('🍃 Perut Totoro naik-turun dengan damai... Daun-daun berguguran.');
            showChatBubble('Totoro', '...Zzz... Zzz...', () => getEntityScreenPos(ents.totoro), '#27ae60', 4.0);
          }
        };
      }
      // Canal Railing (Front edge of street)
      else if (p.z > 0.88) {
        newPrompt = {
          text: p.isLeaning ? 'Berhenti Bersandar [E]' : 'Bersandar di Tepi Kanal 🌊 [E]',
          handler: () => {
            if (!p.isLeaning) {
              p.isLeaning = true;
              showNotification('Kamu bersandar di pagar kanal, menatap pantulan neon di air malam...');
              showChatBubble(p.name, 'Air kanal malam ini sangat tenang...', () => getEntityScreenPos(p), '#00f0ff', 4.0);
            } else {
              p.isLeaning = false;
              showNotification('Kamu kembali berjalan.');
            }
          }
        };
      }
    } else if (state.scene === 'cafe_interior') {
      const c = state.cafeInterior;
      if (Math.abs(p.x - c.baristaHana.x) < 65) {
        newPrompt = {
          text: 'Pesan Kopi Spesial Hana ☕ [E]',
          handler: () => {
            if (p.gold >= 180) {
              p.gold -= 180; p.drinksCount++; updateCurrencyUI(); sfx.coffeeBrew();
              showNotification('Hana: "Ini pour-over hangat untukmu, selamat menikmati!"');
              showChatBubble('Hana', 'Ini kopimu, selamat menikmati!', () => ({ x: c.baristaHana.x - state.camera.x, y: getStreetGeometry().streetBackY }), '#fdcb6e', 4.0);
            } else showNotification('Uang tidak cukup (perlu 180 Yen)');
          }
        };
      } else if (Math.abs(p.x - c.catMimi.x) < 45) {
        newPrompt = {
          text: 'Elus Mimi yang Tidur 🐱 [E]',
          handler: () => { sfx.meow(); showNotification('Mimi berguling manja dan mendengkur... purr...'); }
        };
      } else if (Math.abs(p.x - c.recordPlayer.x) < 55) {
        newPrompt = {
          text: 'Ganti Piringan Hitam 🎵 [E]',
          handler: () => {
            c.recordPlayer.currentTrack = (c.recordPlayer.currentTrack + 1) % state.vinylTrackNames.length;
            sfx.dialog();
            showNotification(`🎵 Memutar Track: ${state.vinylTrackNames[c.recordPlayer.currentTrack]}`);
          }
        };
      } else if (p.x < 110) {
        newPrompt = { text: 'Keluar ke Jalan Kanal 🚪 [E]', handler: exitInterior };
      }
    } else if (state.scene === 'bleem_interior') {
      const b = state.bleemInterior;
      if (Math.abs(p.x - b.cashierMika.x) < 60) {
        newPrompt = {
          text: 'Beli Onigiri & Bento 🍙 (120 Yen) [E]',
          handler: () => {
            if (p.gold >= 120) {
              p.gold -= 120; updateCurrencyUI(); sfx.coin();
              showNotification('Mika: "Terima kasih! Jangan lupa panaskan bentonya ya!"');
            } else showNotification('Uang tidak cukup!');
          }
        };
      } else if (p.x < 100) {
        newPrompt = { text: 'Keluar ke Jalan 🚪 [E]', handler: exitInterior };
      }
    } else if (state.scene === 'arcade_interior') {
      if (Math.abs(p.x - 300) < 60) {
        newPrompt = {
          text: 'Main Retro Fighter 🕹️ (100 Yen) [E]',
          handler: () => {
            if (p.gold >= 100) {
              p.gold -= 100; updateCurrencyUI(); sfx.jump();
              showNotification('🕹️ *HADOUKEN!* Kamu mencetak rekor skor baru: 99,400 pts!');
            } else showNotification('Perlu 100 Yen!');
          }
        };
      } else if (p.x < 100) {
        newPrompt = { text: 'Keluar ke Jalan 🚪 [E]', handler: exitInterior };
      }
    }

    state.activePrompt = newPrompt;
    if (newPrompt && promptEl && promptText) {
      promptText.textContent = isTouchUI() ? newPrompt.text.replace(/\s*\[E\]/, '') : newPrompt.text;
      promptEl.classList.remove('hidden');
    } else if (promptEl) {
      promptEl.classList.add('hidden');
    }
  }

  function getEntityScreenPos(ent) {
    const geom = getStreetGeometry();
    const screenX = (ent.x !== undefined ? ent.x : state.player.x) - state.camera.x;
    const footY = geom.streetBackY + (ent.z !== undefined ? ent.z : 0.5) * geom.streetDepthSpan;
    return { x: screenX + 10, y: footY - 50 };
  }

  function buyVendingDrink() {
    const p = state.player;
    if (p.gold >= 120) {
      p.gold -= 120;
      p.drinksCount++;
      p.staminaBuffTimer = 25;
      updateCurrencyUI();
      sfx.vending();
      showNotification('🥫 Kamu membeli kopi kaleng BOSS hangat! (+Speed Buff)');
    } else {
      showNotification('Uang tidak cukup (perlu 120 Yen)');
    }
  }

  // ─────────────────────────────────────────────────
  // SCENE TRANSITIONS
  // ─────────────────────────────────────────────────
  function triggerFadeTransition(callback) {
    const fade = document.getElementById('scene-transition');
    if (!fade) { callback(); return; }
    fade.classList.add('active');
    setTimeout(() => {
      callback();
      setTimeout(() => fade.classList.remove('active'), 250);
    }, 250);
  }

  function enterCafeInterior() {
    triggerFadeTransition(() => {
      sfx.doorChime();
      state.savedStreetX = state.player.x;
      state.savedStreetZ = state.player.z;
      state.scene = 'cafe_interior';
      state.player.x = 120;
      state.player.z = 0.5;
      document.getElementById('world-name').textContent = '☕ Kafe Katz • Interior Hangat';
      showNotification('Kamu memasuki aroma kopi Katz Bakery... ☕');
    });
  }

  function enterBleemInterior() {
    triggerFadeTransition(() => {
      sfx.doorChime();
      state.savedStreetX = state.player.x;
      state.savedStreetZ = state.player.z;
      state.scene = 'bleem_interior';
      state.player.x = 120;
      state.player.z = 0.5;
      document.getElementById('world-name').textContent = '🏪 BLEE.M Minimarket • 24 Jam';
      showNotification('Selamat datang di Minimarket BLEE.M!');
    });
  }

  function enterArcadeInterior() {
    triggerFadeTransition(() => {
      sfx.doorChime();
      state.savedStreetX = state.player.x;
      state.savedStreetZ = state.player.z;
      state.scene = 'arcade_interior';
      state.player.x = 120;
      state.player.z = 0.5;
      document.getElementById('world-name').textContent = '🕹️ Neo Shibuya Game Center';
      showNotification('Lampu neon arcade berkedip cerah!');
    });
  }

  function exitInterior() {
    triggerFadeTransition(() => {
      sfx.doorChime();
      state.scene = 'street';
      state.player.x = state.savedStreetX || 2020;
      state.player.z = state.savedStreetZ || 0.4;
      document.getElementById('world-name').textContent = '🌃 Tepi Kanal Shibuya • しんとした夜';
      showNotification('Kamu kembali ke sejuknya jalan kanal malam.');
    });
  }

  // ─────────────────────────────────────────────────
  // MAIN RENDER PIPELINE
  // ─────────────────────────────────────────────────
  function render() {
    const w = canvas.width;
    const h = canvas.height;
    const camX = Math.floor(state.camera.x);
    const geom = getStreetGeometry();

    ctx.clearRect(0, 0, w, h);

    if (state.scene === 'cafe_interior') { renderCafeInterior(ctx, camX, geom, w, h); return; }
    if (state.scene === 'bleem_interior') { renderBleemInterior(ctx, camX, geom, w, h); return; }
    if (state.scene === 'arcade_interior') { renderArcadeInterior(ctx, camX, geom, w, h); return; }
    if (state.scene === 'sawit_island') {
      if (window.SawitModule) window.SawitModule.render(ctx, Math.floor(state.camera.x), Math.floor(state.camera.y || 0), w, h, state);
      return;
    }

    // === STREET SCENE (TRUE 2.5D LAYERS) ===
    // 1. Sky & Atmosphere
    drawAtmosphericSky(ctx, w, h);
    drawStarsAndMoon(ctx, camX);

    // 2. Distant Parallax Skyline (Layer 0.08)
    drawDistantSkyline(ctx, camX, geom.streetBackY);

    // 3. Midground 2.5D Skyline (Layer 0.22)
    drawMidgroundBuildings(ctx, camX, geom.streetBackY);

    // 4. Overhead Power Cables
    drawOverheadWires(ctx, camX, geom.streetBackY);

    // 5. 2.5D Building Facades (With 3D eaves, canopies & light spills)
    drawStreetBuildings(ctx, camX, geom.streetBackY);
    drawBuildingLife(ctx, camX, geom.streetBackY, false);

    // 6. 2.5D Ground Plane (Sidewalk, Roadway with markings, Promenade & Canal Wall)
    drawStreetGround25D(ctx, camX, geom);

    // 7. Canal Water with Real-Time Neon Reflections
    drawCanalWater25D(ctx, camX, geom);
    drawBuildingLife(ctx, camX, geom.streetBackY, true);

    // 8. 2.5D Depth-Sorted Entities (Characters, NPCs, Cats, Street Fixtures)
    drawDepthSortedEntities(ctx, camX, geom);

    // 9. Foreground Canal Railing (Draws in front of promenade)
    drawForegroundCanalRailing(ctx, camX, geom);

    // 10. Atmospheric Night Particles
    drawAtmosphericParticles(ctx, camX);

    // 11. Dynamic Lighting (Street lamp cones)
    drawDynamicLighting(ctx, camX, geom.streetBackY);

    // 12. Floating Chat Bubbles & Minimap
    drawChatBubbles(ctx, camX);
    drawMinimap(camX);
  }

  // ─────────────────────────────────────────────────
  // SKY & ATMOSPHERE
  // ─────────────────────────────────────────────────
  function drawAtmosphericSky(ctx, w, h) {
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    const t = state.timeOfDay;
    if (t > 0.65 || t < 0.2) {
      grad.addColorStop(0, '#060913');
      grad.addColorStop(0.3, '#0b1429');
      grad.addColorStop(0.6, '#13233f');
      grad.addColorStop(1, '#1b3252');
    } else if (t < 0.45) {
      grad.addColorStop(0, '#2980b9');
      grad.addColorStop(0.5, '#6dd5fa');
      grad.addColorStop(1, '#ffffff');
    } else {
      grad.addColorStop(0, '#3a1c71');
      grad.addColorStop(0.5, '#d76d77');
      grad.addColorStop(1, '#ffaf7b');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }

  function drawStarsAndMoon(ctx, camX) {
    ctx.fillStyle = '#ffffff';
    for (const s of state.stars) {
      const sx = s.x - camX * 0.04;
      if (sx >= 0 && sx <= canvas.width) {
        const alpha = 0.4 + Math.sin(Date.now() * 0.003 + s.twinkle) * 0.4;
        ctx.globalAlpha = alpha;
        ctx.fillRect(sx, s.y, s.size, s.size);
      }
    }
    ctx.globalAlpha = 1.0;

    const moonX = canvas.width - 240;
    const moonY = 85;
    const moonRadius = 38;
    const moonGlow = ctx.createRadialGradient(moonX, moonY, moonRadius * 0.5, moonX, moonY, moonRadius * 2.2);
    moonGlow.addColorStop(0, 'rgba(255, 238, 173, 0.35)');
    moonGlow.addColorStop(0.6, 'rgba(255, 238, 173, 0.08)');
    moonGlow.addColorStop(1, 'rgba(255, 238, 173, 0)');
    ctx.fillStyle = moonGlow;
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonRadius * 2.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fffae0';
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f5e49f';
    ctx.beginPath();
    ctx.arc(moonX - 10, moonY - 8, 9, 0, Math.PI * 2);
    ctx.arc(moonX + 12, moonY + 12, 11, 0, Math.PI * 2);
    ctx.arc(moonX + 8, moonY - 14, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  // ─────────────────────────────────────────────────
  // PARALLAX SKYLINES
  // ─────────────────────────────────────────────────
  function drawDistantSkyline(ctx, camX, backY) {
    const pSpeed = camX * 0.08;
    for (const b of state.skylineBuildings) {
      const bx = b.x - pSpeed;
      if (bx > -150 && bx < canvas.width + 150) {
        const by = backY - b.h + 20;
        ctx.fillStyle = '#0e1627'; ctx.fillRect(bx, by, b.w, b.h);
        ctx.fillStyle = '#141f36'; ctx.fillRect(bx + 3, by + 3, b.w - 6, b.h);
        for (const win of b.windows) {
          ctx.fillStyle = win.color; ctx.globalAlpha = 0.75;
          ctx.fillRect(bx + win.rx, by + win.ry, 6, 8);
        }
        ctx.globalAlpha = 1.0;
        if (b.hasBeacon) {
          const beaconBlink = Math.sin(Date.now() * 0.005 + b.x) > 0;
          ctx.fillStyle = beaconBlink ? '#ff3838' : '#680000';
          ctx.fillRect(bx + b.w / 2 - 1, by - 6, 3, 6);
        }
        if (b.hasNeon) {
          ctx.fillStyle = '#ff2a7a';
          ctx.fillRect(bx + 10, by - 14, 40, 14);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 8px monospace';
          ctx.fillText(b.neonText, bx + 14, by - 4);
        }
      }
    }
  }

  function drawMidgroundBuildings(ctx, camX, backY) {
    const pSpeed = camX * 0.22;
    for (const b of state.midgroundBuildings) {
      const bx = b.x - pSpeed;
      if (bx > -200 && bx < canvas.width + 200) {
        const by = backY - b.h - 10;

        // Parapet / roof cap
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(bx - 2, by - 4, b.w + 4, 4);

        // Rooftop Water Tank or Antenna on some buildings
        if (b.w > 75) {
          ctx.fillStyle = '#334155';
          ctx.fillRect(bx + 14, by - 16, 20, 12);
          ctx.strokeStyle = '#475569'; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(bx + 24, by - 16); ctx.lineTo(bx + 24, by - 24); ctx.stroke();
        }

        // Main building front wall
        ctx.fillStyle = b.color;
        ctx.fillRect(bx, by, b.w, b.h + 10);

        // 2.5D side depth face (Right-angled extrusion)
        ctx.fillStyle = 'rgba(0,0,0,0.38)';
        ctx.beginPath();
        ctx.moveTo(bx + b.w, by - 4);
        ctx.lineTo(bx + b.w + 14, by - 12);
        ctx.lineTo(bx + b.w + 14, backY - 8);
        ctx.lineTo(bx + b.w, backY);
        ctx.closePath();
        ctx.fill();

        // Glowing signs
        if (b.hasSign) {
          ctx.fillStyle = b.signColor;
          ctx.globalAlpha = 0.6 + Math.sin(Date.now() * 0.003 + b.x) * 0.3;
          ctx.fillRect(bx + 8, by + 10, 30, 18);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 11px "Noto Sans JP", sans-serif';
          ctx.fillText(b.signText, bx + 14, by + 24);
          ctx.globalAlpha = 1.0;
        }

        // Random windows with 2.5D frames
        for (let wy = by + 35; wy < backY - 20; wy += 22) {
          for (let wx = bx + 8; wx < bx + b.w - 12; wx += 16) {
            if ((wx + wy) % 3 === 0) {
              ctx.fillStyle = '#f5cd79';
              ctx.globalAlpha = 0.4 + Math.sin(wx * 0.1 + wy * 0.05) * 0.2;
              ctx.fillRect(wx, wy, 8, 10);
              ctx.fillStyle = 'rgba(0,0,0,0.3)';
              ctx.fillRect(wx, wy, 8, 2); // Top lintel shadow
              ctx.globalAlpha = 1.0;
            }
          }
        }
      }
    }
  }

  function drawOverheadWires(ctx, camX, backY) {
    ctx.strokeStyle = '#1a2233'; ctx.lineWidth = 1.2;
    for (let wx = 200; wx < WORLD_WIDTH; wx += 350) {
      const sx = wx - camX; const ex = sx + 350;
      if (sx < canvas.width && ex > 0) {
        for (let k = 0; k < 3; k++) {
          const ky = backY - 170 + k * 14;
          ctx.beginPath(); ctx.moveTo(sx, ky);
          ctx.quadraticCurveTo((sx + ex) / 2, ky + 18, ex, ky);
          ctx.stroke();
        }
      }
    }
  }

  // ─────────────────────────────────────────────────
  // 2.5D GROUND PLANE RENDERING
  // Sidewalk (Back) • Roadway (Mid) • Promenade (Front) • Canal Wall
  // ─────────────────────────────────────────────────
  function drawStreetGround25D(ctx, camX, geom) {
    const w = canvas.width;
    const { sidewalkY, sidewalkHeight, roadwayY, roadwayHeight, promenadeY, promenadeHeight, waterY, canalWallY, canalWallHeight } = geom;

    // ─────────────────────────────────────────
    // 1. BACK SIDEWALK (Shopfront Pavement)
    // ─────────────────────────────────────────
    const swGrad = ctx.createLinearGradient(0, sidewalkY, 0, roadwayY);
    swGrad.addColorStop(0, '#272e3b');
    swGrad.addColorStop(1, '#1e2430');
    ctx.fillStyle = swGrad;
    ctx.fillRect(0, sidewalkY, w, sidewalkHeight);

    // Sidewalk tiles with 2.5D perspective grid
    ctx.strokeStyle = '#323b4c';
    ctx.lineWidth = 1;
    const tileRows = 3;
    for (let r = 1; r <= tileRows; r++) {
      const ty = sidewalkY + (r / (tileRows + 1)) * sidewalkHeight;
      ctx.beginPath(); ctx.moveTo(0, ty); ctx.lineTo(w, ty); ctx.stroke();
    }
    const tileSpacing = 44;
    for (let tx = -100; tx < w + 100; tx += tileSpacing) {
      const sx = tx - (camX % tileSpacing);
      ctx.beginPath(); ctx.moveTo(sx, sidewalkY); ctx.lineTo(sx + sidewalkHeight * 0.35, roadwayY); ctx.stroke();
    }

    // Sidewalk curb ledge (3D edge separating sidewalk from roadway)
    ctx.fillStyle = '#3f495c'; ctx.fillRect(0, roadwayY - 4, w, 4);
    ctx.fillStyle = '#111622'; ctx.fillRect(0, roadwayY, w, 2);

    // Shop Entry Floors & Mats:
    // Train Station Platform
    const stX = state.entities.seaTrain.x - camX;
    if (stX > -460 && stX < w + 50) {
      ctx.fillStyle = '#3a2318'; ctx.fillRect(stX - 10, sidewalkY + 2, 480, sidewalkHeight - 6);
      ctx.fillStyle = '#f1c40f'; ctx.fillRect(stX - 10, roadwayY - 6, 480, 4); // Yellow tactile tiles
      for (let tb = 0; tb < 480; tb += 12) {
        ctx.fillStyle = '#d4ac0d'; ctx.fillRect(stX - 10 + tb, roadwayY - 5, 2, 2);
      }
    }
    // BLEE.M Welcome Mat
    const bmX = state.entities.shopBleem.x - camX + 80;
    if (bmX > -100 && bmX < w + 100) {
      ctx.fillStyle = '#0984e3'; ctx.fillRect(bmX, sidewalkY + 8, 80, sidewalkHeight - 12);
      ctx.strokeStyle = '#00cec9'; ctx.strokeRect(bmX + 2, sidewalkY + 10, 76, sidewalkHeight - 16);
      ctx.fillStyle = '#fff'; ctx.font = 'bold 8px "Outfit", sans-serif';
      ctx.fillText('WELCOME', bmX + 16, sidewalkY + sidewalkHeight - 10);
    }
    // Katz Cafe Wooden Deck
    const kzX = state.entities.cafeKatz.x - camX;
    if (kzX > -320 && kzX < w + 50) {
      ctx.fillStyle = '#4a2f1c'; ctx.fillRect(kzX, sidewalkY, 290, sidewalkHeight - 2);
      ctx.fillStyle = '#2c180e';
      for (let pl = 0; pl < 290; pl += 16) ctx.fillRect(kzX + pl, sidewalkY, 1, sidewalkHeight - 2);
    }
    // Inari Shrine Stone Approach
    const shX = state.entities.toriiGate.x - camX;
    if (shX > -150 && shX < w + 300) {
      ctx.fillStyle = '#485460'; ctx.fillRect(shX - 20, sidewalkY, 400, sidewalkHeight - 2);
      ctx.fillStyle = '#e74c3c'; ctx.fillRect(shX - 20, sidewalkY + 2, 400, 3);
    }

    // ─────────────────────────────────────────
    // 2. ROADWAY / ASPHALT (Main 2.5D Street)
    // ─────────────────────────────────────────
    const roadGrad = ctx.createLinearGradient(0, roadwayY, 0, promenadeY);
    roadGrad.addColorStop(0, '#161a23');
    roadGrad.addColorStop(0.5, '#191f2b');
    roadGrad.addColorStop(1, '#131822');
    ctx.fillStyle = roadGrad;
    ctx.fillRect(0, roadwayY, w, roadwayHeight);

    // Solid white shoulder line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, roadwayY + 8); ctx.lineTo(w, roadwayY + 8); ctx.stroke();

    // 2.5D Dashed Center Lane Marking (yellow)
    const midRoadY = roadwayY + roadwayHeight * 0.48;
    ctx.strokeStyle = 'rgba(241, 196, 15, 0.7)'; ctx.lineWidth = 2.5;
    const dashLength = 32; const dashGap = 24; const dashCycle = dashLength + dashGap;
    const dashOffset = (camX * 0.95) % dashCycle;
    ctx.beginPath();
    for (let dx = -dashCycle; dx < w + dashCycle; dx += dashCycle) {
      const dsx = dx - dashOffset;
      ctx.moveTo(dsx, midRoadY); ctx.lineTo(dsx + dashLength, midRoadY);
    }
    ctx.stroke();

    // Blue Bicycle Lane along bottom of roadway
    const bikeLaneY = promenadeY - 14;
    ctx.fillStyle = 'rgba(9, 132, 227, 0.28)'; ctx.fillRect(0, bikeLaneY, w, 12);
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, bikeLaneY); ctx.lineTo(w, bikeLaneY); ctx.stroke();

    // Bicycle icons
    for (let bx = 300; bx < WORLD_WIDTH; bx += 800) {
      const bsx = bx - camX;
      if (bsx > -40 && bsx < w + 40) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.ellipse(bsx - 8, bikeLaneY + 6, 4, 2, 0, 0, Math.PI * 2);
        ctx.ellipse(bsx + 8, bikeLaneY + 6, 4, 2, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillRect(bsx - 3, bikeLaneY + 4, 6, 1.5);
      }
    }

    // 2.5D Pedestrian Zebra Crossings
    const zebraLocations = [280, 2200, 3500, 4950];
    zebraLocations.forEach(zx => {
      const screenZx = zx - camX;
      if (screenZx > -120 && screenZx < w + 120) {
        const zw = 90; const stripeCount = 7; const stripeWidth = 8;
        ctx.fillStyle = 'rgba(240, 245, 255, 0.75)';
        for (let s = 0; s < stripeCount; s++) {
          const sx = screenZx + s * (zw / stripeCount);
          ctx.beginPath();
          ctx.moveTo(sx, roadwayY + 2);
          ctx.lineTo(sx + stripeWidth, roadwayY + 2);
          ctx.lineTo(sx + stripeWidth + 14, promenadeY - 2);
          ctx.lineTo(sx + 14, promenadeY - 2);
          ctx.closePath();
          ctx.fill();
        }
      }
    });

    // Japanese "止まれ" (TOMARE / STOP) Road Stencils
    const stopLocations = [620, 1850, 3800];
    stopLocations.forEach(tx => {
      const stx = tx - camX;
      if (stx > -80 && stx < w + 80) {
        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
        ctx.font = '900 13px "Noto Sans JP", sans-serif';
        ctx.translate(stx, midRoadY - 4);
        ctx.scale(1.4, 0.7);
        ctx.fillText('止 ま れ', 0, 0);
        ctx.restore();
      }
    });

    // 2.5D Manhole Covers (cast iron perspective ellipses)
    const manholeLocations = [920, 1680, 2600, 4100, 5300];
    manholeLocations.forEach(mx => {
      const smx = mx - camX;
      if (smx > -50 && smx < w + 50) {
        const mY = roadwayY + roadwayHeight * 0.72;
        ctx.fillStyle = '#0f131a';
        ctx.beginPath(); ctx.ellipse(smx, mY, 15, 6, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#3d4452'; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.beginPath(); ctx.ellipse(smx, mY, 9, 3.5, 0, 0, Math.PI * 2); ctx.stroke();
      }
    });

    // ─────────────────────────────────────────
    // 3. CANAL PROMENADE (Front Cobblestone Walkway)
    // ─────────────────────────────────────────
    const promGrad = ctx.createLinearGradient(0, promenadeY, 0, canalWallY);
    promGrad.addColorStop(0, '#242a36');
    promGrad.addColorStop(1, '#1b202a');
    ctx.fillStyle = promGrad;
    ctx.fillRect(0, promenadeY, w, promenadeHeight);

    // Granite cobblestone pattern
    ctx.strokeStyle = '#2d3545'; ctx.lineWidth = 1;
    for (let py = promenadeY + 4; py < canalWallY; py += 7) {
      ctx.beginPath(); ctx.moveTo(0, py); ctx.lineTo(w, py); ctx.stroke();
    }
    for (let px = -100; px < w + 100; px += 28) {
      const psx = px - (camX % 28);
      ctx.beginPath(); ctx.moveTo(psx, promenadeY); ctx.lineTo(psx + promenadeHeight * 0.45, canalWallY); ctx.stroke();
    }

    // Warm ambient LED floor lights along promenade edge
    for (let lx = 60; lx < w; lx += 90) {
      const flx = lx - (camX % 90);
      ctx.fillStyle = 'rgba(255, 209, 102, 0.8)'; ctx.fillRect(flx, canalWallY - 3, 6, 2);
      ctx.fillStyle = 'rgba(255, 209, 102, 0.15)';
      ctx.beginPath(); ctx.arc(flx + 3, canalWallY - 2, 10, 0, Math.PI * 2); ctx.fill();
    }

    // ─────────────────────────────────────────
    // 4. CANAL RETAINING WALL (3D Stone Drop)
    // ─────────────────────────────────────────
    ctx.fillStyle = '#424a59'; ctx.fillRect(0, canalWallY, w, 5);
    ctx.fillStyle = '#2a313d'; ctx.fillRect(0, canalWallY + 4, w, 2);

    const wallGrad = ctx.createLinearGradient(0, canalWallY + 5, 0, waterY);
    wallGrad.addColorStop(0, '#1c222c');
    wallGrad.addColorStop(0.5, '#151a23');
    wallGrad.addColorStop(1, '#0e1219');
    ctx.fillStyle = wallGrad;
    ctx.fillRect(0, canalWallY + 5, w, canalWallHeight - 5);

    // Stone blocks & masonry seams
    ctx.strokeStyle = '#121620'; ctx.lineWidth = 1;
    for (let wy = canalWallY + 10; wy < waterY; wy += 8) {
      ctx.beginPath(); ctx.moveTo(0, wy); ctx.lineTo(w, wy); ctx.stroke();
    }
    for (let wx = 0; wx < w; wx += 44) {
      const wsx = wx - (camX % 44);
      ctx.beginPath(); ctx.moveTo(wsx, canalWallY + 5); ctx.lineTo(wsx, waterY); ctx.stroke();
    }

    // Water contact line shadow
    ctx.fillStyle = '#060a12'; ctx.fillRect(0, waterY - 2, w, 3);
  }

  // ─────────────────────────────────────────────────
  // CANAL WATER WITH REAL-TIME NEON REFLECTIONS
  // ─────────────────────────────────────────────────
  function drawCanalWater25D(ctx, camX, geom) {
    const w = canvas.width;
    const h = canvas.height;
    const waterY = geom.waterY;
    const waterH = geom.waterHeight;

    const waterGrad = ctx.createLinearGradient(0, waterY, 0, h);
    waterGrad.addColorStop(0, '#091322');
    waterGrad.addColorStop(0.4, '#0b192e');
    waterGrad.addColorStop(1, '#050a14');
    ctx.fillStyle = waterGrad;
    ctx.fillRect(0, waterY, w, waterH);

    const time = Date.now() * 0.003;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    for (let y = waterY + 4; y < h; y += 4) {
      const wave = Math.sin(y * 0.3 + time) * 8;
      ctx.fillRect(wave, y, w, 1.2);
    }

    // Neon lights reflecting on water
    const lightSources = [
      { x: 280, color: '#e74c3c', width: 45 },
      { x: 700, color: '#00f0ff', width: 35 },
      { x: 840, color: '#ff2a7a', width: 45 },
      { x: 1100, color: '#00cec9', width: 30 },
      { x: 1300, color: '#3498db', width: 35 },
      { x: 1550, color: '#ffd166', width: 55 },
      { x: 1820, color: '#e74c3c', width: 30 },
      { x: 2100, color: '#a855f7', width: 55 },
      { x: 2400, color: '#e84393', width: 35 },
      { x: 2750, color: '#ff6b35', width: 45 },
      { x: 3350, color: '#f39c12', width: 50 },
      { x: 3600, color: '#e67e22', width: 35 },
      { x: 4050, color: '#6c5ce7', width: 45 },
      { x: 4300, color: '#fdcb6e', width: 40 },
      { x: 4800, color: '#2ecc71', width: 50 },
      { x: 5180, color: '#00cec9', width: 35 },
      { x: 5750, color: '#27ae60', width: 40 }
    ];

    for (const ls of lightSources) {
      const screenX = ls.x - camX;
      if (screenX > -80 && screenX < w + 80) {
        for (let ry = waterY + 2; ry < h - 4; ry += 5) {
          const distRatio = (ry - waterY) / waterH;
          const wave = Math.sin(ry * 0.22 + time * 1.5 + ls.x * 0.05) * (4 + distRatio * 8);
          const lineLen = ls.width * (1.1 - distRatio * 0.4) * (0.8 + Math.sin(ry * 0.18 + time) * 0.35);
          ctx.fillStyle = ls.color;
          ctx.globalAlpha = Math.max(0.08, (0.75 - distRatio * 0.65));
          ctx.fillRect(screenX - lineLen / 2 + wave, ry, lineLen, 2.5);
        }
      }
    }
    ctx.globalAlpha = 1.0;

    // Kanji watermark
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.font = 'bold 12px "Noto Sans JP", sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('— しんとした夜 • 2.5D Shibuya', w - 20, h - 12);
    ctx.textAlign = 'left';
  }

  // ─────────────────────────────────────────────────
  // FOREGROUND CANAL RAILING
  // ─────────────────────────────────────────────────
  function drawForegroundCanalRailing(ctx, camX, geom) {
    const w = canvas.width;
    const ry = geom.canalWallY;
    const postSpacing = 48;

    // Top metal handrail
    ctx.strokeStyle = '#64748b'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(0, ry - 22); ctx.lineTo(w, ry - 22); ctx.stroke();

    // Middle guard rail
    ctx.strokeStyle = '#475569'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, ry - 11); ctx.lineTo(w, ry - 11); ctx.stroke();

    // Vertical metal posts
    for (let px = -50; px < w + 50; px += postSpacing) {
      const psx = px - (camX % postSpacing);
      ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(psx + 2, ry - 24, 2, 24);
      ctx.fillStyle = '#64748b'; ctx.fillRect(psx, ry - 24, 3, 24);
      ctx.fillStyle = '#e2e8f0'; ctx.fillRect(psx - 1, ry - 25, 5, 2);
      ctx.fillStyle = '#334155'; ctx.fillRect(psx - 2, ry - 4, 7, 4);
    }

    // Hanging lifebuoys
    const lifebuoyXs = [500, 1900, 3400, 4800];
    lifebuoyXs.forEach(lx => {
      const lsx = lx - camX;
      if (lsx > -30 && lsx < w + 30) {
        ctx.fillStyle = '#e74c3c'; ctx.beginPath(); ctx.arc(lsx, ry - 12, 10, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(lsx, ry - 12, 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#1a202c'; ctx.beginPath(); ctx.arc(lsx, ry - 12, 3, 0, Math.PI * 2); ctx.fill();
      }
    });
  }

  // ─────────────────────────────────────────────────
  // 2.5D BUILDING FACADES (Layer at streetBackY)
  // ─────────────────────────────────────────────────
  function drawStreetBuildings(ctx, camX, backY) {
    const ents = state.entities;
    const vis = (x, w) => x - camX > -w - 180 && x - camX < canvas.width + 180;

    // Zone 1: Stasiun Kereta Laut
    if (vis(ents.seaTrain.x, 500)) drawTrainStation(ctx, ents.seaTrain.x - camX, backY);
    // Zone 2: Distrik Minimarket
    if (vis(ents.shopBleem.x, 280)) drawBleemShop(ctx, ents.shopBleem.x - camX, backY);
    // Zone 3: Barber & Izakaya
    if (vis(ents.salonBarber.x, 240)) drawBarberShop(ctx, ents.salonBarber.x - camX, backY);
    if (vis(ents.izakayaHouse.x, 360)) drawIzakayaHouse(ctx, ents.izakayaHouse.x - camX, backY);
    // Zone 4: Arcade Cyberpunk
    if (vis(ents.arcadeBuilding.x, 320)) drawArcadeBuilding(ctx, ents.arcadeBuilding.x - camX, backY);
    // Zone 5: Kuil Inari
    if (vis(ents.shrineMain.x, 260)) drawShrineMain(ctx, ents.shrineMain.x - camX, backY);
    // Zone 6: Ramen Yokocho
    if (vis(ents.ramenShop.x, 260)) drawRamenShop(ctx, ents.ramenShop.x - camX, backY);
    // Zone 7: Toko Buku & Musik
    if (vis(ents.bookstore.x, 270)) drawBookstore(ctx, ents.bookstore.x - camX, backY);
    if (vis(ents.recordShop.x, 240)) drawRecordShop(ctx, ents.recordShop.x - camX, backY);
    // Zone 8: Kafe Katz & Toko Roti
    if (vis(ents.cafeKatz.x, 320)) drawKatzBakery(ctx, ents.cafeKatz.x - camX, backY);
    // Zone 9: Hutan Pohon Totoro Suci
    if (vis(ents.totoroTree.x, 360)) drawTotoroGrove(ctx, ents.totoroTree.x - camX, backY);
  }

  // ─────────────────────────────────────────────────
  // 1. STASIUN KERETA LAUT (2.5D Seaside Station & Retro Train)
  // ─────────────────────────────────────────────────
  function drawTrainStation(ctx, x, backY) {
    const sw = 480;
    const sh = 150;
    const sy = backY - sh;

    // Contact shadow
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fillRect(x - 30, backY - 2, sw + 60, 6);

    // 2.5D Concrete platform foundation
    ctx.fillStyle = '#222831';
    ctx.fillRect(x - 24, backY - 14, sw + 48, 14);
    ctx.fillStyle = '#393e46';
    ctx.fillRect(x - 24, backY - 14, sw + 48, 3);
    // Yellow tactile paving studs
    ctx.fillStyle = '#f39c12';
    ctx.fillRect(x - 24, backY - 11, sw + 48, 2);
    for (let tx = x - 20; tx < x + sw + 20; tx += 8) {
      ctx.fillStyle = '#e67e22';
      ctx.fillRect(tx, backY - 11, 4, 2);
    }

    // ── Station Pavilion (Right side: x + 190 to x + 460) ──
    const pw = 270;
    const px = x + 190;
    const ph = 142;
    const py = backY - ph;

    // Main wall (Dark timber & cream stucco)
    ctx.fillStyle = '#2e1e17';
    ctx.fillRect(px, py + 22, pw, ph - 22);
    ctx.fillStyle = '#f0e6d2';
    ctx.fillRect(px + 8, py + 34, pw - 16, 68);

    // 2.5D Side wall depth extrusion (Right side)
    ctx.fillStyle = '#1a100b';
    ctx.beginPath();
    ctx.moveTo(px + pw, py + 12);
    ctx.lineTo(px + pw + 22, py - 6);
    ctx.lineTo(px + pw + 22, backY - 14);
    ctx.lineTo(px + pw, backY - 14);
    ctx.closePath();
    ctx.fill();

    // 2.5D Gabled Roof with overhang eaves
    ctx.fillStyle = '#1c2227';
    ctx.beginPath();
    ctx.moveTo(px - 16, py + 24);
    ctx.lineTo(px + pw / 2, py - 12);
    ctx.lineTo(px + pw + 16, py + 24);
    ctx.closePath();
    ctx.fill();

    // Roof top plane receding backwards (2.5D oblique slope)
    ctx.fillStyle = '#2d373c';
    ctx.beginPath();
    ctx.moveTo(px + pw / 2, py - 12);
    ctx.lineTo(px + pw / 2 + 22, py - 30);
    ctx.lineTo(px + pw + 36, py + 6);
    ctx.lineTo(px + pw + 16, py + 24);
    ctx.closePath();
    ctx.fill();

    // Roof ridge cap & tiles
    ctx.strokeStyle = '#4a575d';
    ctx.lineWidth = 2;
    for (let ry = py; ry < py + 22; ry += 6) {
      ctx.beginPath();
      ctx.moveTo(px + 4, ry);
      ctx.lineTo(px + pw - 4, ry);
      ctx.stroke();
    }

    // Timber rafters under eaves
    ctx.fillStyle = '#5d4037';
    for (let rx = px; rx <= px + pw; rx += 22) {
      ctx.fillRect(rx, py + 22, 5, 8);
    }
    // Eaves drop shadow
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(px, py + 30, pw, 5);

    // Illuminated Station Name Signboard
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(px + 40, py + 38, pw - 80, 24);
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 2;
    ctx.strokeRect(px + 40, py + 38, pw - 80, 24);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px "Noto Sans JP", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('江 ノ 島 海 岸 駅', px + pw / 2, py + 54);
    ctx.font = '8px monospace';
    ctx.fillStyle = '#9ca3af';
    ctx.fillText('ENOSHIMA SEASIDE STATION', px + pw / 2, py + 61);
    ctx.textAlign = 'left';

    // Round Station Wall Clock
    const clockX = px + pw - 35;
    const clockY = py + 80;
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath(); ctx.arc(clockX + 1, clockY + 1, 13, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fefefe';
    ctx.beginPath(); ctx.arc(clockX, clockY, 12, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#374151'; ctx.lineWidth = 2; ctx.stroke();
    // Clock hands
    ctx.strokeStyle = '#dc2626'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(clockX, clockY); ctx.lineTo(clockX, clockY - 7); ctx.stroke();
    ctx.strokeStyle = '#1f2937';
    ctx.beginPath(); ctx.moveTo(clockX, clockY); ctx.lineTo(clockX + 5, clockY + 2); ctx.stroke();

    // Ticket gates / Wickets & Waiting Area
    ctx.fillStyle = '#111827';
    ctx.fillRect(px + 20, backY - 60, pw - 80, 46);
    // IC Touch pads glowing cyan
    ctx.fillStyle = '#00f0ff';
    ctx.fillRect(px + 45, backY - 38, 14, 5);
    ctx.fillRect(px + 95, backY - 38, 14, 5);
    ctx.fillRect(px + 145, backY - 38, 14, 5);
    // Green turnstile indicators
    ctx.fillStyle = '#10b981';
    ctx.fillRect(px + 50, backY - 26, 4, 8);
    ctx.fillRect(px + 100, backY - 26, 4, 8);
    ctx.fillRect(px + 150, backY - 26, 4, 8);

    // Warm station floor light spill
    ctx.fillStyle = 'rgba(254, 240, 138, 0.14)';
    ctx.beginPath();
    ctx.moveTo(px + 20, backY);
    ctx.lineTo(px + pw - 60, backY);
    ctx.lineTo(px + pw - 30, backY + 28);
    ctx.lineTo(px - 10, backY + 28);
    ctx.closePath();
    ctx.fill();

    // ── The Retro Sea Train (Left side: x - 10 to x + 210) ──
    const tx = x - 10;
    const tw = 215;
    const th = 104;
    const ty = backY - th - 12;

    // Train contact shadow on tracks
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(tx - 6, backY - 14, tw + 12, 5);

    // Train Under-chassis & wheels
    ctx.fillStyle = '#111827';
    ctx.fillRect(tx + 10, ty + th - 6, tw - 20, 8);
    for (let wx = tx + 24; wx < tx + tw - 20; wx += 44) {
      ctx.fillStyle = '#4b5563';
      ctx.beginPath(); ctx.arc(wx, ty + th - 1, 7, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#9ca3af';
      ctx.beginPath(); ctx.arc(wx, ty + th - 1, 3, 0, Math.PI * 2); ctx.fill();
    }

    // 2.5D Train Body: Lower green livery, upper ivory
    ctx.fillStyle = '#1e3a24'; // Classic Enoden Forest Green
    ctx.fillRect(tx, ty + 46, tw, th - 52);
    ctx.fillStyle = '#fef9e7'; // Classic Cream Ivory
    ctx.fillRect(tx, ty + 12, tw, 34);

    // 2.5D Curved Aerodynamic Train Roof
    ctx.fillStyle = '#2d5a39';
    ctx.beginPath();
    ctx.moveTo(tx - 4, ty + 12);
    ctx.quadraticCurveTo(tx + tw / 2, ty - 8, tx + tw + 4, ty + 12);
    ctx.closePath();
    ctx.fill();

    // 2.5D Roof top sheen & vent domes
    ctx.fillStyle = '#407a51';
    ctx.beginPath();
    ctx.moveTo(tx + 6, ty + 10);
    ctx.quadraticCurveTo(tx + tw / 2, ty - 4, tx + tw - 6, ty + 10);
    ctx.lineTo(tx + tw - 6, ty + 12);
    ctx.lineTo(tx + 6, ty + 12);
    ctx.closePath();
    ctx.fill();

    // Roof Pantograph (Diamond electrical collector)
    ctx.strokeStyle = '#9ca3af';
    ctx.lineWidth = 1.8;
    const pantoX = tx + 40;
    const pantoY = ty - 4;
    ctx.beginPath();
    ctx.moveTo(pantoX - 10, pantoY); ctx.lineTo(pantoX, pantoY - 14); ctx.lineTo(pantoX + 10, pantoY);
    ctx.moveTo(pantoX, pantoY - 14); ctx.lineTo(pantoX + 10, pantoY - 24); ctx.lineTo(pantoX + 22, pantoY - 24);
    ctx.stroke();

    // Panoramic Train Windows with warm interior lighting
    for (let wi = 0; wi < 3; wi++) {
      const winX = tx + 18 + wi * 62;
      const winY = ty + 18;
      const winW = 48;
      const winH = 26;
      // Window frame
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(winX - 1, winY - 1, winW + 2, winH + 2);
      // Warm glowing glass interior
      ctx.fillStyle = 'rgba(254, 243, 199, 0.95)';
      ctx.fillRect(winX, winY, winW, winH);
      // Passenger seat silhouette
      ctx.fillStyle = '#475569';
      ctx.fillRect(winX + 8, winY + 12, 14, 14);
      ctx.beginPath(); ctx.arc(winX + 15, winY + 9, 4, 0, Math.PI * 2); ctx.fill();
      // Glass diagonal reflection
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(winX + winW - 6, winY + 2);
      ctx.lineTo(winX + 4, winY + winH - 2);
      ctx.stroke();
    }

    // Train Headlights with glowing forward beams
    const hlX = tx + tw - 8;
    const hlY = ty + 62;
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath(); ctx.arc(hlX, hlY, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(hlX, hlY, 3, 0, Math.PI * 2); ctx.fill();
    // Light beam cone
    const beamGrad = ctx.createLinearGradient(hlX, hlY, hlX + 90, hlY + 20);
    beamGrad.addColorStop(0, 'rgba(254, 240, 138, 0.45)');
    beamGrad.addColorStop(0.5, 'rgba(254, 240, 138, 0.15)');
    beamGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
    ctx.fillStyle = beamGrad;
    ctx.beginPath();
    ctx.moveTo(hlX, hlY - 4);
    ctx.lineTo(hlX + 95, hlY - 12);
    ctx.lineTo(hlX + 95, hlY + 36);
    ctx.lineTo(hlX, hlY + 8);
    ctx.closePath();
    ctx.fill();

    // Train number & gold crest
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 9px monospace';
    ctx.fillText('No. 104', tx + 20, ty + 68);
  }

  // ─────────────────────────────────────────────────
  // 2. MINIMARKET BLEE.M (2.5D Modern 24H Convenience Store)
  // ─────────────────────────────────────────────────
  function drawBleemShop(ctx, x, backY) {
    const sw = 230;
    const sh = 188;
    const sy = backY - sh;

    // Contact shadow
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(x - 10, backY - 2, sw + 35, 6);

    // ── Concrete Facade & Parapet ──
    ctx.fillStyle = '#374151';
    ctx.fillRect(x, sy + 18, sw, sh - 18);
    // Parapet beveled roof cap
    ctx.fillStyle = '#6b7280';
    ctx.fillRect(x - 2, sy + 14, sw + 4, 6);
    ctx.fillStyle = '#9ca3af';
    ctx.fillRect(x - 2, sy + 14, sw + 4, 2);

    // Rooftop HVAC unit (3D depth box with fan grille)
    ctx.fillStyle = '#4b5563';
    ctx.fillRect(x + 24, sy - 8, 38, 22);
    ctx.fillStyle = '#374151';
    ctx.beginPath();
    ctx.moveTo(x + 62, sy - 8); ctx.lineTo(x + 72, sy - 14);
    ctx.lineTo(x + 72, sy + 8); ctx.lineTo(x + 62, sy + 14);
    ctx.closePath(); ctx.fill();
    // Fan vent
    ctx.fillStyle = '#1f2937';
    ctx.beginPath(); ctx.arc(x + 43, sy + 3, 7, 0, Math.PI * 2); ctx.fill();
    // Copper pipes running down
    ctx.strokeStyle = '#b45309'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(x + 60, sy + 14); ctx.lineTo(x + 60, sy + 38); ctx.stroke();

    // ── 2.5D Side Wall Extrusion (Right Side) ──
    ctx.fillStyle = '#1f2937';
    ctx.beginPath();
    ctx.moveTo(x + sw, sy + 14);
    ctx.lineTo(x + sw + 20, sy - 2);
    ctx.lineTo(x + sw + 20, backY);
    ctx.lineTo(x + sw, backY);
    ctx.closePath();
    ctx.fill();

    // Side outdoor A/C compressor unit
    ctx.fillStyle = '#374151';
    ctx.fillRect(x + sw + 3, backY - 80, 14, 26);
    ctx.fillStyle = '#111827';
    ctx.fillRect(x + sw + 5, backY - 76, 10, 10);

    // ── Projecting 3D Fascia Lightbox Canopy ──
    const canY = sy + 36;
    const canH = 34;
    // Sloping top facet in perspective
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.moveTo(x - 6, canY);
    ctx.lineTo(x - 2, canY - 8);
    ctx.lineTo(x + sw + 8, canY - 8);
    ctx.lineTo(x + sw + 4, canY);
    ctx.closePath();
    ctx.fill();

    // 3D Front Face: Tricolor Convenience Stripes
    ctx.fillStyle = '#0284c7'; // Cyan blue
    ctx.fillRect(x - 6, canY, sw + 10, 10);
    ctx.fillStyle = '#ffffff'; // White
    ctx.fillRect(x - 6, canY + 10, sw + 10, 14);
    ctx.fillStyle = '#f97316'; // Orange
    ctx.fillRect(x - 6, canY + 24, sw + 10, 10);

    // Right canopy depth return
    ctx.fillStyle = '#0369a1';
    ctx.beginPath();
    ctx.moveTo(x + sw + 4, canY);
    ctx.lineTo(x + sw + 8, canY - 8);
    ctx.lineTo(x + sw + 8, canY + 26);
    ctx.lineTo(x + sw + 4, canY + 34);
    ctx.closePath();
    ctx.fill();

    // Glowing Signage: BLEE.M 24H
    ctx.fillStyle = '#0369a1';
    ctx.font = 'bold 15px "Outfit", sans-serif';
    ctx.fillText('BLEE.M', x + 24, canY + 21);
    ctx.fillStyle = '#ea580c';
    ctx.font = 'bold 10px monospace';
    ctx.fillText('24H CONVENIENCE', x + 96, canY + 21);

    // Underside recessed LED spot lights
    ctx.fillStyle = '#ffffff';
    for (let lx = x + 30; lx < x + sw - 20; lx += 55) {
      ctx.fillRect(lx, canY + canH, 12, 2);
    }
    // Canopy shadow on storefront
    ctx.fillStyle = 'rgba(0,0,0,0.38)';
    ctx.fillRect(x, canY + canH, sw, 8);

    // ── Floor-to-Ceiling Glass Curtain Wall ──
    const winX = x + 12;
    const winY = canY + canH + 8;
    const winW = sw - 24;
    const winH = backY - winY - 4;

    // Window frame border
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(winX, winY, winW, winH);

    // Glowing Store Interior
    const intGrad = ctx.createLinearGradient(0, winY, 0, winY + winH);
    intGrad.addColorStop(0, '#fef9c3'); // Warm bright ceiling
    intGrad.addColorStop(0.3, '#fef08a');
    intGrad.addColorStop(1, '#e2e8f0');
    ctx.fillStyle = intGrad;
    ctx.fillRect(winX + 3, winY + 3, winW - 6, winH - 6);

    // Inside: Drink coolers with colorful beverage shelves
    for (let cy = winY + 12; cy < winY + 50; cy += 11) {
      for (let cx = winX + 12; cx < winX + 85; cx += 12) {
        ctx.fillStyle = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'][(cx + cy) % 5];
        ctx.fillRect(cx, cy, 8, 8);
      }
    }
    // Inside: Snack gondola display racks
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(winX + 10, winY + 54, 76, 4);
    ctx.fillRect(winX + 10, winY + 68, 76, 4);

    // Automatic Sliding Glass Doors (Center-Right: x + 106 to x + 158)
    const doorX = x + 108;
    const doorY = winY + 10;
    const doorW = 48;
    const doorH = winH - 12;

    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2;
    ctx.strokeRect(doorX, doorY, doorW, doorH);
    ctx.strokeRect(doorX, doorY, doorW / 2, doorH); // Center split

    // Automatic door sensor bar & OPEN sign
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(doorX - 2, doorY - 4, doorW + 4, 3);
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 8px monospace';
    ctx.fillText('AUTOMATIC', doorX + 4, doorY + 14);

    // Diagonal glass reflections
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(winX + 20, winY + 4); ctx.lineTo(winX + 6, winY + winH - 6);
    ctx.moveTo(winX + 180, winY + 4); ctx.lineTo(winX + 155, winY + winH - 6);
    ctx.stroke();

    // ── Sidewalk Details: Recycling Station & Umbrella Stand ──
    // 3 Color-coded recycling bins (Bottles, Cans, Paper)
    const binX = x + sw - 46;
    const binY = backY - 32;
    const binColors = ['#0284c7', '#f59e0b', '#6b7280'];
    binColors.forEach((bc, idx) => {
      const bx = binX + idx * 12;
      ctx.fillStyle = bc;
      ctx.fillRect(bx, binY, 10, 28);
      ctx.fillStyle = '#1f2937';
      ctx.beginPath(); ctx.arc(bx + 5, binY + 5, 2.5, 0, Math.PI * 2); ctx.fill();
    });

    // Warm light puddle spilling forward onto sidewalk
    ctx.fillStyle = 'rgba(254, 240, 138, 0.18)';
    ctx.beginPath();
    ctx.moveTo(winX, backY);
    ctx.lineTo(winX + winW, backY);
    ctx.lineTo(winX + winW + 35, backY + 34);
    ctx.lineTo(winX - 25, backY + 34);
    ctx.closePath();
    ctx.fill();
  }

  // ─────────────────────────────────────────────────
  // 3. BARBER SHOP (2.5D Retro Japanese 理容室)
  // ─────────────────────────────────────────────────
  function drawBarberShop(ctx, x, backY) {
    const bw = 205;
    const bh = 192;
    const by = backY - bh;

    // Contact shadow
    ctx.fillStyle = 'rgba(0,0,0,0.48)';
    ctx.fillRect(x - 12, backY - 2, bw + 34, 6);

    // ── 2-Story Building Facade ──
    // Lower floor: Warm teak wood (#4a2e18), Upper floor: Textured stucco (#e5d8c5)
    ctx.fillStyle = '#4a2e18';
    ctx.fillRect(x, by + 85, bw, bh - 85);
    ctx.fillStyle = '#d6c7b2';
    ctx.fillRect(x, by + 26, bw, 62);

    // ── 2.5D Side Wall Extrusion (Right Side) ──
    ctx.fillStyle = '#2c1a0e';
    ctx.beginPath();
    ctx.moveTo(x + bw, by + 10);
    ctx.lineTo(x + bw + 18, by - 6);
    ctx.lineTo(x + bw + 18, backY);
    ctx.lineTo(x + bw, backY);
    ctx.closePath();
    ctx.fill();

    // ── 2.5D Mansard / Pitched Copper Roof ──
    // Verdigris green patina copper (#16a085)
    ctx.fillStyle = '#0e7490';
    ctx.beginPath();
    ctx.moveTo(x - 8, by + 28);
    ctx.lineTo(x + 12, by - 2);
    ctx.lineTo(x + bw - 12, by - 2);
    ctx.lineTo(x + bw + 8, by + 28);
    ctx.closePath();
    ctx.fill();

    // 2.5D Roof side slope
    ctx.fillStyle = '#083344';
    ctx.beginPath();
    ctx.moveTo(x + bw + 8, by + 28);
    ctx.lineTo(x + bw - 12, by - 2);
    ctx.lineTo(x + bw + 6, by - 14);
    ctx.lineTo(x + bw + 22, by + 14);
    ctx.closePath();
    ctx.fill();

    // Copper roof seams
    ctx.strokeStyle = '#065f46';
    ctx.lineWidth = 1.5;
    for (let rx = x + 16; rx < x + bw - 10; rx += 18) {
      ctx.beginPath();
      ctx.moveTo(rx, by + 26);
      ctx.lineTo(rx + 4, by);
      ctx.stroke();
    }

    // Attic Dormer Window with warm light
    const dormerX = x + bw / 2 - 16;
    ctx.fillStyle = '#4a2e18';
    ctx.fillRect(dormerX, by + 4, 32, 22);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(dormerX + 4, by + 8, 24, 16);
    ctx.strokeStyle = '#331e10';
    ctx.strokeRect(dormerX + 4, by + 8, 24, 16);

    // ── 2nd Floor Balcony & Laundry Drying Poles ──
    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 14, by + 82); ctx.lineTo(x + bw - 14, by + 82);
    ctx.moveTo(x + 14, by + 72); ctx.lineTo(x + bw - 14, by + 72);
    ctx.stroke();
    // Hanging towels on balcony
    ctx.fillStyle = '#f8fafc'; ctx.fillRect(x + 36, by + 74, 14, 10);
    ctx.fillStyle = '#38bdf8'; ctx.fillRect(x + 58, by + 74, 14, 10);

    // ── Storefront Signboard: 理 容 室 ──
    ctx.fillStyle = '#1e3a5f';
    ctx.fillRect(x + 16, by + 88, bw - 32, 22);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 16, by + 88, bw - 32, 22);
    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 13px "Noto Sans JP", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('理  容  室', x + bw / 2, by + 104);
    ctx.textAlign = 'left';

    // ── 2.5D Projecting Bay Window with Barber Interior ──
    const bayX = x + 48;
    const bayY = by + 116;
    const bayW = bw - 60;
    const bayH = backY - bayY - 6;

    // Recessed interior
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(bayX, bayY, bayW, bayH);
    ctx.fillStyle = '#fef3c7'; // Warm glow
    ctx.fillRect(bayX + 3, bayY + 3, bayW - 6, bayH - 6);

    // Barber Chair Silhouette & Hollywood Vanity Mirror
    const mirrorX = bayX + 40;
    const mirrorY = bayY + 16;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(mirrorX, mirrorY + 10, 14, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 1.5; ctx.stroke();
    // Vintage leather chair silhouette
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(mirrorX - 8, mirrorY + 28, 16, 20); // Backrest
    ctx.fillRect(mirrorX - 12, mirrorY + 42, 24, 6); // Seat
    ctx.fillRect(mirrorX - 4, mirrorY + 48, 8, 8);   // Hydraulic pedestal

    // Bay window outer 3D glass facet frame
    ctx.strokeStyle = '#4a2e18';
    ctx.lineWidth = 3;
    ctx.strokeRect(bayX, bayY, bayW, bayH);
    // Beveled stone window sill jutting out
    ctx.fillStyle = '#64748b';
    ctx.fillRect(bayX - 4, bayY + bayH, bayW + 8, 6);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(bayX - 4, bayY + bayH, bayW + 8, 2);

    // ── 3D Illuminated Rotating Barber Pole ──
    const px = x + 14;
    const py = by + 112;
    const pw = 16;
    const ph = 64;

    // Chrome wall brackets
    ctx.fillStyle = '#64748b';
    ctx.fillRect(px - 6, py + 8, 8, 4);
    ctx.fillRect(px - 6, py + ph - 12, 8, 4);

    // Glass cylinder background glow
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.fillRect(px, py + 6, pw, ph - 12);

    // Animated helical stripes (Red, White, Royal Blue)
    ctx.save();
    ctx.beginPath();
    ctx.rect(px, py + 6, pw, ph - 12);
    ctx.clip();
    const poleOffset = (Date.now() * 0.04) % 18;
    for (let sy = py - 18; sy < py + ph + 18; sy += 18) {
      ctx.fillStyle = '#dc2626'; // Red
      ctx.beginPath();
      ctx.moveTo(px, sy + poleOffset);
      ctx.lineTo(px + pw, sy + 8 + poleOffset);
      ctx.lineTo(px + pw, sy + 14 + poleOffset);
      ctx.lineTo(px, sy + 6 + poleOffset);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#1d4ed8'; // Blue
      ctx.beginPath();
      ctx.moveTo(px, sy + 9 + poleOffset);
      ctx.lineTo(px + pw, sy + 17 + poleOffset);
      ctx.lineTo(px + pw, sy + 23 + poleOffset);
      ctx.lineTo(px, sy + 15 + poleOffset);
      ctx.closePath();
      ctx.fill();
    }
    // Glass cylinder gloss reflection line
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fillRect(px + 2, py + 6, 3, ph - 12);
    ctx.restore();

    // Chrome domed caps top & bottom
    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath(); ctx.arc(px + pw / 2, py + 6, pw / 2 + 1, Math.PI, 0); ctx.fill();
    ctx.beginPath(); ctx.arc(px + pw / 2, py + ph - 6, pw / 2 + 1, 0, Math.PI); ctx.fill();

    // Barber pole soft light aura
    const aura = ctx.createRadialGradient(px + pw / 2, py + ph / 2, pw / 2, px + pw / 2, py + ph / 2, 28);
    aura.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
    aura.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = aura;
    ctx.beginPath(); ctx.arc(px + pw / 2, py + ph / 2, 28, 0, Math.PI * 2); ctx.fill();
  }

  // ─────────────────────────────────────────────────
  // 4. IZAKAYA HOUSE (2.5D Traditional Edo-Style 居酒屋 赤提灯)
  // ─────────────────────────────────────────────────
  function drawIzakayaHouse(ctx, x, backY) {
    const iw = 330;
    const ih = 240;
    const iy = backY - ih;

    // Contact shadow
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(x - 20, backY - 2, iw + 50, 7);

    // ── Charred Cedar Wood Walls (Shou Sugi Ban) ──
    ctx.fillStyle = '#22140c';
    ctx.fillRect(x, iy + 30, iw, ih - 30);
    // Vertical wood plank lines
    ctx.strokeStyle = '#150c07';
    ctx.lineWidth = 1;
    for (let wx = x + 16; wx < x + iw; wx += 16) {
      ctx.beginPath(); ctx.moveTo(wx, iy + 30); ctx.lineTo(wx, backY); ctx.stroke();
    }

    // ── 2.5D Side Wall Extrusion (Right Side) ──
    ctx.fillStyle = '#140b07';
    ctx.beginPath();
    ctx.moveTo(x + iw, iy + 18);
    ctx.lineTo(x + iw + 24, iy - 6);
    ctx.lineTo(x + iw + 24, backY);
    ctx.lineTo(x + iw, backY);
    ctx.closePath();
    ctx.fill();

    // ── Upper Traditional Japanese Tile Roof (Irimoya-zukuri) ──
    // Sweeping curved dark charcoal Kawara tiles
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(x - 18, iy + 36);
    ctx.quadraticCurveTo(x + iw / 2, iy + 6, x + iw + 18, iy + 36);
    ctx.lineTo(x + iw + 24, iy + 26);
    ctx.quadraticCurveTo(x + iw / 2, iy - 8, x - 24, iy + 26);
    ctx.closePath();
    ctx.fill();

    // 2.5D Roof depth slope (receding backwards)
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(x + iw + 18, iy + 36);
    ctx.quadraticCurveTo(x + iw / 2, iy + 6, x - 18, iy + 36);
    ctx.lineTo(x, iy + 16);
    ctx.quadraticCurveTo(x + iw / 2 + 10, iy - 12, x + iw + 36, iy + 16);
    ctx.closePath();
    ctx.fill();

    // Scalloped Kawara tile ridge trims
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    for (let ry = iy + 16; ry <= iy + 34; ry += 6) {
      ctx.beginPath();
      ctx.moveTo(x - 12, ry);
      ctx.quadraticCurveTo(x + iw / 2, ry - 14, x + iw + 12, ry);
      ctx.stroke();
    }

    // Timber rafters under eaves (Taruki beams)
    ctx.fillStyle = '#5d4037';
    for (let rx = x - 4; rx <= x + iw + 4; rx += 18) {
      ctx.fillRect(rx, iy + 34, 5, 8);
    }
    // Deep eaves shadow
    ctx.fillStyle = 'rgba(0,0,0,0.48)';
    ctx.fillRect(x, iy + 42, iw, 8);

    // ── 2nd Floor Veranda with Shoji Paper Lattice Screens ──
    const shojiY = iy + 52;
    const shojiH = 54;
    // Outer timber frame
    ctx.fillStyle = '#3e2723';
    ctx.fillRect(x + 24, shojiY, iw - 48, shojiH);
    // Warm glowing washi paper
    ctx.fillStyle = 'rgba(254, 215, 170, 0.88)';
    ctx.fillRect(x + 28, shojiY + 4, iw - 56, shojiH - 8);
    // Shoji wooden lattice grid
    ctx.strokeStyle = '#4e342e';
    ctx.lineWidth = 1.2;
    for (let sx = x + 38; sx < x + iw - 38; sx += 14) {
      ctx.beginPath(); ctx.moveTo(sx, shojiY + 4); ctx.lineTo(sx, shojiY + shojiH - 4); ctx.stroke();
    }
    for (let sy = shojiY + 12; sy < shojiY + shojiH - 4; sy += 12) {
      ctx.beginPath(); ctx.moveTo(x + 28, sy); ctx.lineTo(x + iw - 28, sy); ctx.stroke();
    }

    // ── Lower Eaves / Canopy Roof ──
    const lowY = iy + 118;
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(x - 14, lowY + 14);
    ctx.quadraticCurveTo(x + iw / 2, lowY + 4, x + iw + 14, lowY + 14);
    ctx.lineTo(x + iw + 18, lowY + 6);
    ctx.quadraticCurveTo(x + iw / 2, lowY - 4, x - 18, lowY + 6);
    ctx.closePath();
    ctx.fill();

    // ── Traditional Carved Wooden Signboard ──
    const signX = x + 50;
    const signY = lowY + 18;
    const signW = iw - 100;
    ctx.fillStyle = '#1c1008';
    ctx.fillRect(signX, signY, signW, 26);
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 2;
    ctx.strokeRect(signX, signY, signW, 26);
    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 15px "Noto Sans JP", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('居 酒 屋   赤 提 灯', signX + signW / 2, signY + 18);
    ctx.textAlign = 'left';

    // ── Cluster of 4 Glowing 3D Red Paper Chouchin Lanterns ──
    const lanternData = ['酒', '串', '肴', '生'];
    for (let i = 0; i < 4; i++) {
      const lx = x + 44 + i * 78;
      const ly = lowY + 54;
      const lr = 15;
      const lh = 24;

      // Hanging cord
      ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(lx, lowY + 12); ctx.lineTo(lx, ly - lh); ctx.stroke();

      // Soft ambient crimson glow
      const glow = ctx.createRadialGradient(lx, ly, 6, lx, ly, 34);
      glow.addColorStop(0, 'rgba(239, 68, 68, 0.45)');
      glow.addColorStop(0.6, 'rgba(239, 68, 68, 0.15)');
      glow.addColorStop(1, 'rgba(239, 68, 68, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(lx, ly, 34, 0, Math.PI * 2); ctx.fill();

      // 3D Lantern Barrel Body
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.ellipse(lx, ly, lr, lh, 0, 0, Math.PI * 2);
      ctx.fill();

      // Dark wooden caps top & bottom
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(lx - 9, ly - lh - 2, 18, 4);
      ctx.fillRect(lx - 9, ly + lh - 2, 18, 4);

      // Wire ribs
      ctx.strokeStyle = '#7f1d1d';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(lx - lr + 2, ly - 8); ctx.lineTo(lx + lr - 2, ly - 8);
      ctx.moveTo(lx - lr, ly); ctx.lineTo(lx + lr, ly);
      ctx.moveTo(lx - lr + 2, ly + 8); ctx.lineTo(lx + lr - 2, ly + 8);
      ctx.stroke();

      // Golden Kanji Calligraphy
      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 12px "Noto Sans JP", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(lanternData[i], lx, ly + 4);
      ctx.textAlign = 'left';
    }

    // ── Indigo Noren Curtain Doorway (Split into 3 panels) ──
    const doorX = x + iw / 2 - 45;
    const doorY = backY - 68;
    const doorW = 90;
    const doorH = 68;

    // Recessed dark interior
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(doorX, doorY, doorW, doorH);

    // Warm tavern light leaking out from under noren
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(doorX + 6, doorY + 36, doorW - 12, 32);

    // Indigo Noren Panels (Split fabric)
    const norenW = doorW / 3;
    for (let ni = 0; ni < 3; ni++) {
      const nx = doorX + ni * norenW;
      ctx.fillStyle = '#1e3a8a';
      ctx.fillRect(nx + 1, doorY, norenW - 2, 34);
      // White Kamon crest / kanji on middle panel
      if (ni === 1) {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(nx + norenW / 2, doorY + 16, 6, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#1e3a8a';
        ctx.beginPath(); ctx.arc(nx + norenW / 2, doorY + 16, 4, 0, Math.PI * 2); ctx.fill();
      }
    }

    // ── Stack of 3 Traditional Sake Barrels (Komodaru) ──
    const barrelX = x + 20;
    const barrelY = backY - 32;
    // Bottom 2 barrels
    for (let bi = 0; bi < 2; bi++) {
      const bx = barrelX + bi * 24;
      ctx.fillStyle = '#e2d4be'; // Straw wrapping
      ctx.fillRect(bx, barrelY, 22, 28);
      ctx.strokeStyle = '#78350f'; ctx.lineWidth = 1.2;
      ctx.strokeRect(bx, barrelY, 22, 28);
      // Black kanji crest
      ctx.fillStyle = '#1c1917';
      ctx.font = 'bold 8px serif';
      ctx.fillText('銘酒', bx + 3, barrelY + 16);
    }
    // Top stacked barrel
    ctx.fillStyle = '#e2d4be';
    ctx.fillRect(barrelX + 12, barrelY - 24, 22, 24);
    ctx.strokeStyle = '#78350f'; ctx.lineWidth = 1.2;
    ctx.strokeRect(barrelX + 12, barrelY - 24, 22, 24);
    ctx.fillStyle = '#1c1917';
    ctx.font = 'bold 8px serif';
    ctx.fillText('大吟', barrelX + 15, barrelY - 10);

    // Warm tavern floor light spill
    ctx.fillStyle = 'rgba(254, 215, 170, 0.22)';
    ctx.beginPath();
    ctx.moveTo(doorX - 10, backY);
    ctx.lineTo(doorX + doorW + 10, backY);
    ctx.lineTo(doorX + doorW + 38, backY + 32);
    ctx.lineTo(doorX - 38, backY + 32);
    ctx.closePath();
    ctx.fill();
  }

  // ─────────────────────────────────────────────────
  // 5. ARCADE BUILDING (2.5D Cyberpunk Retro Game Center)
  // ─────────────────────────────────────────────────
  function drawArcadeBuilding(ctx, x, backY) {
    const aw = 290;
    const ah = 225;
    const ay = backY - ah;

    // Contact shadow
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(x - 14, backY - 2, aw + 38, 7);

    // ── Stepped Art-Deco High-Tech Facade ──
    // Midnight purple and dark indigo metallic panels
    ctx.fillStyle = '#180d32';
    ctx.fillRect(x, ay + 20, aw, ah - 20);
    ctx.fillStyle = '#24144a';
    ctx.fillRect(x + 10, ay + 20, aw - 20, ah - 20);

    // ── 2.5D Side Wall Extrusion (Right Side) ──
    ctx.fillStyle = '#0f0722';
    ctx.beginPath();
    ctx.moveTo(x + aw, ay + 12);
    ctx.lineTo(x + aw + 22, ay - 6);
    ctx.lineTo(x + aw + 22, backY);
    ctx.lineTo(x + aw, backY);
    ctx.closePath();
    ctx.fill();

    // ── Rooftop Feature: Giant 3D Illuminated Arcade Joystick ──
    const joyX = x + 50;
    const joyY = ay + 4;
    // Chrome shaft
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(joyX, joyY + 16); ctx.lineTo(joyX + 6, joyY - 14); ctx.stroke();
    // Glowing Red Ball-top
    ctx.fillStyle = '#ef4444';
    ctx.beginPath(); ctx.arc(joyX + 6, joyY - 14, 12, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.beginPath(); ctx.arc(joyX + 3, joyY - 17, 4, 0, Math.PI * 2); ctx.fill();
    // 3D Push Buttons on roof
    ctx.fillStyle = '#00f0ff';
    ctx.beginPath(); ctx.ellipse(joyX + 32, joyY + 12, 8, 4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath(); ctx.ellipse(joyX + 52, joyY + 12, 8, 4, 0, 0, Math.PI * 2); ctx.fill();

    // ── Massive 3D Cantilevered Neon Marquee Sign ──
    const marqueeX = x + 24;
    const marqueeY = ay + 28;
    const marqueeW = aw - 48;
    const marqueeH = 46;

    // Industrial girder frame
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(marqueeX - 4, marqueeY - 4, marqueeW + 8, marqueeH + 8);

    // Chasing rainbow neon border
    const neonColors = ['#ff007f', '#00f0ff', '#ffe600', '#a855f7'];
    const colIdx = Math.floor((Date.now() * 0.005) % neonColors.length);
    ctx.strokeStyle = neonColors[colIdx];
    ctx.lineWidth = 2.5;
    ctx.strokeRect(marqueeX - 2, marqueeY - 2, marqueeW + 4, marqueeH + 4);

    // Neon Backplate & Text
    ctx.fillStyle = '#170b2c';
    ctx.fillRect(marqueeX, marqueeY, marqueeW, marqueeH);

    ctx.fillStyle = '#00f0ff';
    ctx.font = 'bold 20px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('A R C A D E', marqueeX + marqueeW / 2, marqueeY + 24);
    ctx.fillStyle = '#ff2a7a';
    ctx.font = 'bold 11px monospace';
    ctx.fillText('★ 24H RETRO & SEGA ★', marqueeX + marqueeW / 2, marqueeY + 39);
    ctx.textAlign = 'left';

    // ── Multi-Story Glass Front with Glowing Arcade Machines ──
    const winX = x + 18;
    const winY = marqueeY + marqueeH + 12;
    const winW = aw - 36;
    const winH = backY - winY - 4;

    ctx.fillStyle = '#0a0319';
    ctx.fillRect(winX, winY, winW, winH);

    // 2nd Floor Arcade Cabinets (Glowing screens & marquees)
    for (let ci = 0; ci < 4; ci++) {
      const cx = winX + 16 + ci * 58;
      const cy = winY + 12;
      // Cabinet box
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(cx, cy, 38, 46);
      // Glowing CRT screen
      ctx.fillStyle = ['#00f0ff', '#ff2a7a', '#10b981', '#f59e0b'][ci % 4];
      ctx.fillRect(cx + 4, cy + 12, 30, 20);
      // Marquee top
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cx + 6, cy + 3, 26, 6);
    }

    // 1st Floor: Entrance & Claw Machine (UFO Catcher)
    const ufoX = winX + 16;
    const ufoY = winY + 68;
    ctx.fillStyle = '#ec4899';
    ctx.strokeRect(ufoX, ufoY, 52, winH - 74);
    ctx.fillStyle = 'rgba(236, 72, 153, 0.2)';
    ctx.fillRect(ufoX + 2, ufoY + 2, 48, winH - 78);
    // Plushies inside claw machine
    ctx.fillStyle = '#fbbf24'; ctx.beginPath(); ctx.arc(ufoX + 16, backY - 20, 7, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#60a5fa'; ctx.beginPath(); ctx.arc(ufoX + 34, backY - 18, 7, 0, Math.PI * 2); ctx.fill();

    // Double glass automatic entrance doors (Center: x + 110 to x + 180)
    const doorX = x + 115;
    const doorY = winY + 66;
    const doorW = 68;
    const doorH = winH - 70;

    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2;
    ctx.strokeRect(doorX, doorY, doorW, doorH);
    ctx.strokeRect(doorX, doorY, doorW / 2, doorH);
    ctx.fillStyle = '#00f0ff';
    ctx.fillRect(doorX - 2, doorY - 3, doorW + 4, 3);

    // ── Row of 3D Gashapon Toy Machines Outside ──
    const gashaX = x + aw - 72;
    const gashaY = backY - 58;
    for (let gi = 0; gi < 2; gi++) {
      const gx = gashaX + gi * 24;
      // Machine body
      ctx.fillStyle = gi === 0 ? '#ef4444' : '#3b82f6';
      ctx.fillRect(gx, gashaY, 20, 48);
      // Transparent dome with capsules
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.beginPath(); ctx.arc(gx + 10, gashaY + 12, 8, 0, Math.PI * 2); ctx.fill();
      // Coin crank
      ctx.fillStyle = '#cbd5e1';
      ctx.beginPath(); ctx.arc(gx + 10, gashaY + 28, 3, 0, Math.PI * 2); ctx.fill();
    }

    // Vivid Purple & Cyan floor reflection on sidewalk
    const floorGrad = ctx.createLinearGradient(0, backY, 0, backY + 36);
    floorGrad.addColorStop(0, 'rgba(168, 85, 247, 0.35)');
    floorGrad.addColorStop(0.5, 'rgba(0, 240, 255, 0.2)');
    floorGrad.addColorStop(1, 'rgba(0, 240, 255, 0)');
    ctx.fillStyle = floorGrad;
    ctx.beginPath();
    ctx.moveTo(doorX - 25, backY);
    ctx.lineTo(doorX + doorW + 25, backY);
    ctx.lineTo(doorX + doorW + 60, backY + 36);
    ctx.lineTo(doorX - 60, backY + 36);
    ctx.closePath();
    ctx.fill();
  }

  // ─────────────────────────────────────────────────
  // 6. KUIL INARI (2.5D Shinto Shrine Pavilion • 浮世神社)
  // ─────────────────────────────────────────────────
  function drawShrineMain(ctx, x, backY) {
    const sw = 240;
    const sh = 190;
    const sy = backY - sh;

    // Contact shadow
    ctx.fillStyle = 'rgba(0,0,0,0.52)';
    ctx.fillRect(x - 20, backY - 2, sw + 45, 6);

    // ── Raised Wooden Engawa Deck Platform ──
    ctx.fillStyle = '#451a03';
    ctx.fillRect(x + 12, backY - 22, sw - 24, 22);
    ctx.fillStyle = '#78350f';
    ctx.fillRect(x + 12, backY - 22, sw - 24, 4);
    // Stone foundation blocks
    ctx.fillStyle = '#475569';
    for (let fx = x + 20; fx < x + sw - 20; fx += 44) {
      ctx.fillRect(fx, backY - 8, 14, 8);
    }
    // Center wooden stairs
    ctx.fillStyle = '#92400e';
    ctx.fillRect(x + sw / 2 - 28, backY - 16, 56, 16);
    ctx.fillStyle = '#b45309';
    ctx.fillRect(x + sw / 2 - 28, backY - 8, 56, 8);

    // ── Main Shrine Hall (Vermilion Pillars & White Stucco) ──
    ctx.fillStyle = '#fef2f2';
    ctx.fillRect(x + 24, sy + 44, sw - 48, sh - 66);
    // 4 Heavy Vermilion Pillars (Shinbashira)
    ctx.fillStyle = '#b91c1c';
    for (let px = x + 24; px <= x + sw - 40; px += 64) {
      ctx.fillRect(px, sy + 44, 16, sh - 66);
    }

    // ── 2.5D Side Wall Extrusion (Right Side) ──
    ctx.fillStyle = '#7f1d1d';
    ctx.beginPath();
    ctx.moveTo(x + sw - 24, sy + 38);
    ctx.lineTo(x + sw + 4, sy + 18);
    ctx.lineTo(x + sw + 4, backY - 22);
    ctx.lineTo(x + sw - 24, backY - 22);
    ctx.closePath();
    ctx.fill();

    // ── Sweeping Nagare-zukuri Curved Copper-Green Roof ──
    ctx.fillStyle = '#0f766e'; // Verdigris copper green
    ctx.beginPath();
    ctx.moveTo(x - 24, sy + 44);
    ctx.quadraticCurveTo(x + sw / 2, sy + 6, x + sw + 24, sy + 44);
    ctx.lineTo(x + sw + 32, sy + 32);
    ctx.quadraticCurveTo(x + sw / 2, sy - 14, x - 32, sy + 32);
    ctx.closePath();
    ctx.fill();

    // 2.5D Roof slope receding backwards
    ctx.fillStyle = '#115e59';
    ctx.beginPath();
    ctx.moveTo(x + sw + 24, sy + 44);
    ctx.quadraticCurveTo(x + sw / 2, sy + 6, x - 24, sy + 44);
    ctx.lineTo(x - 8, sy + 24);
    ctx.quadraticCurveTo(x + sw / 2 + 12, sy - 18, x + sw + 44, sy + 24);
    ctx.closePath();
    ctx.fill();

    // Gold Chigi (Crossed roof finials) & Katsuogi (Ridge logs)
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 4;
    // Left & Right crossed Chigi
    ctx.beginPath();
    ctx.moveTo(x - 14, sy + 12); ctx.lineTo(x - 4, sy - 16);
    ctx.moveTo(x - 4, sy + 12); ctx.lineTo(x - 14, sy - 16);
    ctx.moveTo(x + sw + 4, sy + 12); ctx.lineTo(x + sw + 14, sy - 16);
    ctx.moveTo(x + sw + 14, sy + 12); ctx.lineTo(x + sw + 4, sy - 16);
    ctx.stroke();

    // 3 Gold Katsuogi ridge logs along the roof peak
    ctx.fillStyle = '#fbbf24';
    for (let kx = x + 60; kx <= x + sw - 60; kx += 45) {
      ctx.fillRect(kx, sy - 6, 22, 6);
    }

    // Timber bracket complexes (Tokyō) under eaves
    ctx.fillStyle = '#78350f';
    for (let rx = x + 10; rx <= x + sw - 10; rx += 20) {
      ctx.fillRect(rx, sy + 44, 6, 8);
    }
    // Deep eaves drop shadow
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(x + 20, sy + 52, sw - 40, 8);

    // ── Heavy Twisted Straw Shimenawa Rope with White Shide ──
    const ropeY = sy + 68;
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(x + 24, ropeY);
    ctx.quadraticCurveTo(x + sw / 2, ropeY + 12, x + sw - 24, ropeY);
    ctx.stroke();

    // White zigzag Shide paper streamers hanging from rope
    ctx.fillStyle = '#ffffff';
    for (let si = 0; si < 4; si++) {
      const sx = x + 55 + si * 42;
      ctx.beginPath();
      ctx.moveTo(sx, ropeY + 4); ctx.lineTo(sx + 5, ropeY + 12);
      ctx.lineTo(sx, ropeY + 20); ctx.lineTo(sx + 5, ropeY + 28);
      ctx.lineTo(sx - 3, ropeY + 28); ctx.lineTo(sx - 7, ropeY + 20);
      ctx.lineTo(sx - 2, ropeY + 12); ctx.lineTo(sx - 7, ropeY + 4);
      ctx.closePath();
      ctx.fill();
    }

    // ── Giant Burnished Brass Suzu Bell & Red-White Braided Cord ──
    const bellX = x + sw / 2;
    const bellY = sy + 92;

    // Brass bell
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath(); ctx.arc(bellX, bellY, 11, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fef08a';
    ctx.beginPath(); ctx.arc(bellX - 3, bellY - 3, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(bellX - 7, bellY + 6, 14, 3); // Bell slit

    // Braided Red & White hanging hemp cord
    ctx.lineWidth = 4;
    for (let cy = bellY + 12; cy < backY - 26; cy += 8) {
      ctx.strokeStyle = (cy % 16 === 0) ? '#dc2626' : '#ffffff';
      ctx.beginPath(); ctx.moveTo(bellX, cy); ctx.lineTo(bellX, cy + 8); ctx.stroke();
    }

    // ── Wooden Offering Box (Saisenbako 賽銭箱) ──
    const saisenX = x + sw / 2 - 24;
    const saisenY = backY - 48;
    ctx.fillStyle = '#78350f';
    ctx.fillRect(saisenX, saisenY, 48, 24);
    ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 1.5;
    ctx.strokeRect(saisenX, saisenY, 48, 24);
    // Slanted wooden drop slats
    ctx.strokeStyle = '#451a03'; ctx.lineWidth = 1.2;
    for (let lx = saisenX + 6; lx < saisenX + 42; lx += 8) {
      ctx.beginPath(); ctx.moveTo(lx, saisenY + 2); ctx.lineTo(lx, saisenY + 22); ctx.stroke();
    }

    // ── Stone Kitsune (Fox Guardian) on Right Pedestal ──
    const foxX = x + sw - 22;
    const foxY = backY - 40;
    // Stone pedestal
    ctx.fillStyle = '#64748b';
    ctx.fillRect(foxX - 8, foxY + 12, 20, 26);
    // Stone fox silhouette
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.moveTo(foxX - 4, foxY + 12);
    ctx.lineTo(foxX + 8, foxY + 12);
    ctx.lineTo(foxX + 6, foxY);
    ctx.lineTo(foxX + 2, foxY - 8);
    ctx.lineTo(foxX - 4, foxY);
    ctx.closePath();
    ctx.fill();
    // Red bib
    ctx.fillStyle = '#dc2626';
    ctx.beginPath(); ctx.arc(foxX + 1, foxY + 2, 4, 0, Math.PI); ctx.fill();
  }

  // ─────────────────────────────────────────────────
  // 7. RAMEN SHOP (2.5D Steaming Ramen Bar • らーめん 一番)
  // ─────────────────────────────────────────────────
  function drawRamenShop(ctx, x, backY) {
    const rw = 230;
    const rh = 180;
    const ry = backY - rh;

    // Contact shadow
    ctx.fillStyle = 'rgba(0,0,0,0.52)';
    ctx.fillRect(x - 12, backY - 2, rw + 32, 6);

    // ── Weathered Cedar Timber Wall ──
    ctx.fillStyle = '#3e2723';
    ctx.fillRect(x, ry + 24, rw, rh - 24);

    // ── 2.5D Side Wall Extrusion (Right Side) ──
    ctx.fillStyle = '#22140c';
    ctx.beginPath();
    ctx.moveTo(x + rw, ry + 16);
    ctx.lineTo(x + rw + 18, ry - 4);
    ctx.lineTo(x + rw + 18, backY);
    ctx.lineTo(x + rw, backY);
    ctx.closePath();
    ctx.fill();

    // ── Corrugated Galvanized Metal Roof with Exhaust Chimney ──
    ctx.fillStyle = '#4b5563';
    ctx.beginPath();
    ctx.moveTo(x - 8, ry + 26);
    ctx.lineTo(x + rw + 10, ry + 26);
    ctx.lineTo(x + rw + 18, ry + 10);
    ctx.lineTo(x, ry + 10);
    ctx.closePath();
    ctx.fill();

    // Corrugated tin ridges
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1.5;
    for (let rx = x + 4; rx < x + rw + 8; rx += 14) {
      ctx.beginPath(); ctx.moveTo(rx, ry + 26); ctx.lineTo(rx + 6, ry + 10); ctx.stroke();
    }

    // Exhaust Chimney Pipe with Animated Translucent Steam Wisps
    const chimX = x + 36;
    const chimY = ry + 10;
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(chimX, chimY - 22, 14, 22);
    ctx.fillStyle = '#374151';
    ctx.fillRect(chimX - 3, chimY - 26, 20, 5);

    // Translucent steam particles puffing into cool night air
    const steamTime = Date.now() * 0.003;
    ctx.fillStyle = 'rgba(243, 244, 246, 0.25)';
    for (let sp = 0; sp < 4; sp++) {
      const spY = (chimY - 32) - ((steamTime * 25 + sp * 14) % 45);
      const spX = chimX + 7 + Math.sin(spY * 0.1 + steamTime) * 8;
      const spR = 6 + (chimY - 26 - spY) * 0.25;
      ctx.beginPath(); ctx.arc(spX, spY, spR, 0, Math.PI * 2); ctx.fill();
    }

    // ── Projecting 3D Red-and-Cream Striped Awning ──
    const awnY = ry + 34;
    const awnH = 26;
    const awnW = rw + 16;
    const awnX = x - 8;

    // Sloping top face projecting forward
    const numStripes = 12;
    const stripeW = awnW / numStripes;
    for (let si = 0; si < numStripes; si++) {
      ctx.fillStyle = (si % 2 === 0) ? '#dc2626' : '#fef9e7';
      ctx.beginPath();
      ctx.moveTo(awnX + si * stripeW, awnY);
      ctx.lineTo(awnX + (si + 1) * stripeW, awnY);
      ctx.lineTo(awnX + (si + 1) * stripeW - 2, awnY + awnH);
      ctx.lineTo(awnX + si * stripeW - 2, awnY + awnH);
      ctx.closePath();
      ctx.fill();
    }

    // Scalloped front valance & drop shadow
    ctx.fillStyle = '#b91c1c';
    ctx.fillRect(awnX - 2, awnY + awnH, awnW, 6);
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fillRect(x, awnY + awnH + 6, rw, 8);

    // Signboard: らーめん 一番 (ICHIBAN RAMEN)
    ctx.fillStyle = '#1c1008';
    ctx.fillRect(x + 24, awnY + awnH + 8, rw - 48, 22);
    ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 1.5;
    ctx.strokeRect(x + 24, awnY + awnH + 8, rw - 48, 22);
    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 13px "Noto Sans JP", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ら ー め ん   一 番', x + rw / 2, awnY + awnH + 24);
    ctx.textAlign = 'left';

    // ── Open Counter Bar with Steaming Broth Pot & Chef ──
    const barX = x + 16;
    const barY = ry + 94;
    const barW = rw - 80;
    const barH = backY - barY - 4;

    // Warm glowing noodle bar interior
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(barX, barY, barW, barH);
    ctx.fillStyle = 'rgba(254, 243, 199, 0.9)';
    ctx.fillRect(barX + 2, barY + 2, barW - 4, barH - 4);

    // Steaming Stainless Steel Broth Pot
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(barX + 16, barY + 16, 26, 22);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(barX + 14, barY + 14, 30, 4);
    // Steam from ramen pot
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.beginPath();
    ctx.arc(barX + 28, barY + 8, 7, 0, Math.PI * 2);
    ctx.arc(barX + 32, barY - 2, 9, 0, Math.PI * 2);
    ctx.fill();

    // Stacked Ceramic Ramen Bowls & Chopstick Jars
    ctx.fillStyle = '#dc2626';
    for (let bi = 0; bi < 3; bi++) {
      ctx.fillRect(barX + 52, barY + 24 - bi * 5, 14, 4);
    }
    // Chopsticks jar
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(barX + 74, barY + 18, 8, 14);
    ctx.strokeStyle = '#b45309'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(barX + 76, barY + 18); ctx.lineTo(barX + 74, barY + 10); ctx.stroke();

    // Polished Timber Counter Ledge (2.5D Projection)
    ctx.fillStyle = '#5c2d16';
    ctx.fillRect(barX - 4, barY + 34, barW + 8, 12);
    ctx.fillStyle = '#78350f';
    ctx.fillRect(barX - 4, barY + 34, barW + 8, 3);

    // Swivel Counter Bar Stools (Red vinyl & chrome)
    for (let si = 0; si < 3; si++) {
      const sx = barX + 22 + si * 42;
      const sy = backY - 24;
      // Chrome pole & base
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(sx - 2, sy, 4, 22);
      ctx.fillRect(sx - 8, backY - 4, 16, 4);
      // Red round vinyl cushion
      ctx.fillStyle = '#dc2626';
      ctx.beginPath(); ctx.ellipse(sx, sy, 10, 5, 0, 0, Math.PI * 2); ctx.fill();
    }

    // ── 3D Japanese Ramen Ticket Machine (食券機 Shokkenki) ──
    const vmX = x + rw - 54;
    const vmY = backY - 76;
    // Machine body
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(vmX, vmY, 38, 74);
    ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1.5; ctx.strokeRect(vmX, vmY, 38, 74);

    // Illuminated Top Header: 食 券
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(vmX + 4, vmY + 6, 30, 14);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px "Noto Sans JP", sans-serif';
    ctx.fillText('食 券', vmX + 8, vmY + 17);

    // Grid of glowing menu buttons
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        ctx.fillStyle = (row === 0) ? '#f59e0b' : '#38bdf8';
        ctx.fillRect(vmX + 6 + col * 9, vmY + 24 + row * 9, 7, 7);
      }
    }
    // Coin insert slot & change chute
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(vmX + 24, vmY + 54, 8, 3);
    ctx.fillRect(vmX + 8, vmY + 62, 22, 8);

    // Warm floor light spill
    ctx.fillStyle = 'rgba(254, 240, 138, 0.2)';
    ctx.beginPath();
    ctx.moveTo(barX, backY);
    ctx.lineTo(barX + barW, backY);
    ctx.lineTo(barX + barW + 25, backY + 30);
    ctx.lineTo(barX - 25, backY + 30);
    ctx.closePath();
    ctx.fill();
  }

  // ─────────────────────────────────────────────────
  // 8. TOKO BUKU GINGA (2.5D Tokyo Independent Bookstore • 銀河書店)
  // ─────────────────────────────────────────────────
  function drawBookstore(ctx, x, backY) {
    const bw = 245;
    const bh = 196;
    const by = backY - bh;

    // Contact shadow
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(x - 12, backY - 2, bw + 34, 6);

    // ── Deep Prussian Navy Wood Paneling Facade ──
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x, by + 28, bw, bh - 28);

    // ── 2.5D Side Wall Extrusion (Right Side) ──
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(x + bw, by + 18);
    ctx.lineTo(x + bw + 20, by - 2);
    ctx.lineTo(x + bw + 20, backY);
    ctx.lineTo(x + bw, backY);
    ctx.closePath();
    ctx.fill();

    // ── 2.5D Gabled Mansard Roof with Slate Tiles ──
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.moveTo(x - 8, by + 28);
    ctx.lineTo(x + 14, by - 2);
    ctx.lineTo(x + bw - 14, by - 2);
    ctx.lineTo(x + bw + 8, by + 28);
    ctx.closePath();
    ctx.fill();

    // Roof slope receding backwards
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(x + bw + 8, by + 28);
    ctx.lineTo(x + bw - 14, by - 2);
    ctx.lineTo(x + bw + 4, by - 14);
    ctx.lineTo(x + bw + 22, by + 14);
    ctx.closePath();
    ctx.fill();

    // Arched Dormer Window (2nd Floor Attic Reading Nook)
    const dormerX = x + bw / 2 - 20;
    ctx.fillStyle = '#475569';
    ctx.fillRect(dormerX, by + 4, 40, 24);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(dormerX + 4, by + 8, 32, 18);
    // Bookshelf silhouettes in dormer
    ctx.fillStyle = '#451a03';
    ctx.fillRect(dormerX + 6, by + 10, 6, 14);
    ctx.fillRect(dormerX + 14, by + 12, 6, 12);
    ctx.fillRect(dormerX + 22, by + 8, 6, 16);

    // ── Gilded Gold Signboard: 銀河書店 • GINGA BOOKS ──
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x + 20, by + 36, bw - 40, 24);
    ctx.strokeStyle = '#d97706'; ctx.lineWidth = 2;
    ctx.strokeRect(x + 20, by + 36, bw - 40, 24);

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 13px "Noto Sans JP", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('銀  河  書  店', x + bw / 2, by + 52);
    ctx.font = '7px monospace';
    ctx.fillText('GINGA BOOKS & MANGA', x + bw / 2, by + 58);
    ctx.textAlign = 'left';

    // Dual Brass Gooseneck Lamps with downlight cones
    for (let li = 0; li < 2; li++) {
      const lx = x + 50 + li * (bw - 100);
      ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(lx, by + 36); ctx.quadraticCurveTo(lx, by + 24, lx + 6, by + 24); ctx.stroke();
      // Lamp shade
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath(); ctx.arc(lx + 6, by + 26, 4, 0, Math.PI); ctx.fill();
    }

    // ── 2.5D Projecting Polygonal Bay Showcase Window ──
    const bayX = x + 16;
    const bayY = by + 68;
    const bayW = 140;
    const bayH = backY - bayY - 6;

    // Recessed showcase interior
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(bayX, bayY, bayW, bayH);
    ctx.fillStyle = '#fef3c7'; // Warm glow
    ctx.fillRect(bayX + 3, bayY + 3, bayW - 6, bayH - 6);

    // Tiered Books & Manga Displays
    ctx.fillStyle = '#78350f'; // Wooden shelves
    ctx.fillRect(bayX + 6, bayY + 36, bayW - 12, 4);
    ctx.fillRect(bayX + 6, bayY + 68, bayW - 12, 4);

    // Colorful book spines & covers
    const bookColors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
    for (let bi = 0; bi < 10; bi++) {
      ctx.fillStyle = bookColors[bi % bookColors.length];
      ctx.fillRect(bayX + 10 + bi * 12, bayY + 14, 9, 22);
      ctx.fillStyle = bookColors[(bi + 2) % bookColors.length];
      ctx.fillRect(bayX + 10 + bi * 12, bayY + 44, 9, 24);
    }
    // Antique Brass Globe on shelf
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath(); ctx.arc(bayX + bayW - 22, bayY + 22, 8, 0, Math.PI * 2); ctx.fill();

    // 2.5D Bay window frame & beveled sill
    ctx.strokeStyle = '#334155'; ctx.lineWidth = 3; ctx.strokeRect(bayX, bayY, bayW, bayH);
    ctx.fillStyle = '#475569';
    ctx.fillRect(bayX - 4, bayY + bayH, bayW + 8, 6);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(bayX - 4, bayY + bayH, bayW + 8, 2);

    // ── Glazed Wooden Entrance Door ──
    const doorX = x + bw - 74;
    const doorY = by + 68;
    const doorW = 56;
    const doorH = backY - doorY - 4;

    ctx.fillStyle = '#334155';
    ctx.fillRect(doorX, doorY, doorW, doorH);
    ctx.fillStyle = '#fef3c7';
    ctx.fillRect(doorX + 8, doorY + 12, doorW - 16, 44);
    // Brass door handle
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(doorX + 10, doorY + 66, 4, 14);

    // ── Sidewalk Details: Rolling Book Bargain Cart (ワゴンセール) ──
    const cartX = x + bayW + 28;
    const cartY = backY - 32;
    // Wooden wagon box
    ctx.fillStyle = '#78350f';
    ctx.fillRect(cartX, cartY, 32, 22);
    // Colorful discount books
    for (let ci = 0; ci < 4; ci++) {
      ctx.fillStyle = ['#38bdf8', '#f43f5e', '#a855f7', '#4ade80'][ci];
      ctx.fillRect(cartX + 3 + ci * 7, cartY - 4, 6, 12);
    }
    // Wheels
    ctx.fillStyle = '#1e293b';
    ctx.beginPath(); ctx.arc(cartX + 6, backY - 8, 4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(cartX + 26, backY - 8, 4, 0, Math.PI * 2); ctx.fill();
  }

  // ─────────────────────────────────────────────────
  // 9. TOKO VINYL & MUSIK (2.5D Retro City-Pop Record Shop)
  // ─────────────────────────────────────────────────
  function drawRecordShop(ctx, x, backY) {
    const rw = 210;
    const rh = 185;
    const ry = backY - rh;

    // Contact shadow
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(x - 10, backY - 2, rw + 32, 6);

    // ── Exposed Red Brick Facade with Dark Mortar ──
    ctx.fillStyle = '#7f1d1d'; // Brick terracotta
    ctx.fillRect(x, ry + 26, rw, rh - 26);
    // Brick mortar lines
    ctx.strokeStyle = '#450a0a';
    ctx.lineWidth = 1;
    for (let by = ry + 32; by < backY; by += 10) {
      ctx.beginPath(); ctx.moveTo(x, by); ctx.lineTo(x + rw, by); ctx.stroke();
    }

    // ── 2.5D Side Wall Extrusion (Right Side) ──
    ctx.fillStyle = '#450a0a';
    ctx.beginPath();
    ctx.moveTo(x + rw, ry + 16);
    ctx.lineTo(x + rw + 18, ry - 4);
    ctx.lineTo(x + rw + 18, backY);
    ctx.lineTo(x + rw, backY);
    ctx.closePath();
    ctx.fill();

    // ── Rooftop Spinning 3D Neon Vinyl Record Sign ──
    const recordX = x + rw / 2;
    const recordY = ry + 8;
    // Black vinyl disc
    ctx.fillStyle = '#0f172a';
    ctx.beginPath(); ctx.arc(recordX, recordY, 22, 0, Math.PI * 2); ctx.fill();
    // Vinyl groove rings
    ctx.strokeStyle = '#334155'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(recordX, recordY, 17, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(recordX, recordY, 12, 0, Math.PI * 2); ctx.stroke();
    // Yellow center label
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath(); ctx.arc(recordX, recordY, 7, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(recordX, recordY, 2, 0, Math.PI * 2); ctx.fill();

    // Structural Steel I-Beam Lintel across facade
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x + 6, ry + 36, rw - 12, 14);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('CITY-POP • VINYL RECORDS', x + rw / 2, ry + 47);
    ctx.textAlign = 'left';

    // ── Storefront Window with LP Crates & Listening Station ──
    const winX = x + 14;
    const winY = ry + 58;
    const winW = rw - 28;
    const winH = backY - winY - 4;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(winX, winY, winW, winH);
    ctx.fillStyle = 'rgba(254, 243, 199, 0.88)';
    ctx.fillRect(winX + 2, winY + 2, winW - 4, winH - 4);

    // Browsing Wooden LP Record Bins
    const binW = 86;
    ctx.fillStyle = '#78350f';
    ctx.fillRect(winX + 8, winY + 38, binW, 28);
    // Colorful 12" Vinyl LP Jackets (City-Pop Album Art)
    const lpColors = ['#ec4899', '#06b6d4', '#f59e0b', '#8b5cf6'];
    for (let li = 0; li < 4; li++) {
      ctx.fillStyle = lpColors[li];
      ctx.fillRect(winX + 14 + li * 18, winY + 16, 16, 22);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(winX + 16 + li * 18, winY + 18, 12, 4);
    }

    // Wall-Mounted Headphone Listening Station
    const hpX = winX + winW - 32;
    const hpY = winY + 28;
    // Chrome headphones
    ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(hpX, hpY, 10, Math.PI, 0); ctx.stroke();
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(hpX - 12, hpY - 2, 5, 10);
    ctx.fillRect(hpX + 7, hpY - 2, 5, 10);

    // Glowing Neon "NOW PLAYING" Sign
    ctx.fillStyle = '#f43f5e';
    ctx.font = 'bold 8px monospace';
    ctx.fillText('NOW PLAYING', winX + 10, winY + 12);

    // Window frame
    ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 2.5;
    ctx.strokeRect(winX, winY, winW, winH);

    // ── Sidewalk: A-Frame Chalkboard Sign ──
    const afX = x + rw - 36;
    const afY = backY - 34;
    ctx.fillStyle = '#3e2723';
    ctx.beginPath();
    ctx.moveTo(afX + 8, afY); ctx.lineTo(afX + 18, afY + 32);
    ctx.lineTo(afX - 2, afY + 32);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(afX + 1, afY + 6, 14, 20);
    ctx.fillStyle = '#ffffff';
    ctx.font = '6px monospace';
    ctx.fillText('LP', afX + 4, afY + 18);
  }

  // ─────────────────────────────────────────────────
  // 10. KAFE & TOKO ROTI KATZ (2.5D European Artisan Bakery ☕)
  // ─────────────────────────────────────────────────
  function drawKatzBakery(ctx, x, backY) {
    const kw = 300;
    const kh = 205;
    const ky = backY - kh;

    // Contact shadow
    ctx.fillStyle = 'rgba(0,0,0,0.52)';
    ctx.fillRect(x - 14, backY - 2, kw + 42, 7);

    // ── Parisian Cream Stucco Facade & Limestone Quoins ──
    ctx.fillStyle = '#f5eedc';
    ctx.fillRect(x, ky + 28, kw, kh - 28);
    // Quoins (corner stone blocks)
    ctx.fillStyle = '#e2d5bd';
    for (let qy = ky + 34; qy < backY - 10; qy += 18) {
      ctx.fillRect(x, qy, 10, 10);
      ctx.fillRect(x + kw - 10, qy, 10, 10);
    }

    // ── 2.5D Side Wall Extrusion (Right Side) ──
    ctx.fillStyle = '#d4c2a5';
    ctx.beginPath();
    ctx.moveTo(x + kw, ky + 18);
    ctx.lineTo(x + kw + 22, ky - 4);
    ctx.lineTo(x + kw + 22, backY);
    ctx.lineTo(x + kw, backY);
    ctx.closePath();
    ctx.fill();

    // ── Terracotta Slate Mansard Roof ──
    ctx.fillStyle = '#9a3412';
    ctx.beginPath();
    ctx.moveTo(x - 12, ky + 28);
    ctx.lineTo(x + 16, ky - 6);
    ctx.lineTo(x + kw - 16, ky - 6);
    ctx.lineTo(x + kw + 12, ky + 28);
    ctx.closePath();
    ctx.fill();

    // Roof slope receding backwards
    ctx.fillStyle = '#7c2d12';
    ctx.beginPath();
    ctx.moveTo(x + kw + 12, ky + 28);
    ctx.lineTo(x + kw - 16, ky - 6);
    ctx.lineTo(x + kw + 6, ky - 18);
    ctx.lineTo(x + kw + 26, ky + 14);
    ctx.closePath();
    ctx.fill();

    // Wrought-iron roof cresting railing on peak
    ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 1.5;
    for (let rx = x + 24; rx < x + kw - 20; rx += 12) {
      ctx.beginPath(); ctx.moveTo(rx, ky - 6); ctx.lineTo(rx, ky - 14); ctx.stroke();
    }
    ctx.beginPath(); ctx.moveTo(x + 20, ky - 14); ctx.lineTo(x + kw - 18, ky - 14); ctx.stroke();

    // Weather Vane: Cat holding a baguette!
    const vaneX = x + kw / 2;
    const vaneY = ky - 14;
    ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(vaneX, vaneY); ctx.lineTo(vaneX, vaneY - 14); ctx.stroke();
    // Cat silhouette
    ctx.fillStyle = '#1e293b';
    ctx.beginPath(); ctx.arc(vaneX, vaneY - 18, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f59e0b'; // Baguette
    ctx.fillRect(vaneX + 3, vaneY - 20, 8, 3);

    // ── Arched 2nd Floor Dormer Windows with Flower Boxes ──
    for (let di = 0; di < 2; di++) {
      const dx = x + 45 + di * (kw - 130);
      const dy = ky + 34;
      // Window arch
      ctx.fillStyle = '#451a03';
      ctx.fillRect(dx, dy, 36, 44);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(dx + 4, dy + 4, 28, 36);
      // Flower planter box with pink/violet blossoms
      ctx.fillStyle = '#78350f';
      ctx.fillRect(dx - 4, dy + 40, 44, 10);
      for (let fi = 0; fi < 5; fi++) {
        ctx.fillStyle = (fi % 2 === 0) ? '#f43f5e' : '#a855f7';
        ctx.beginPath(); ctx.arc(dx + fi * 8, dy + 39, 3.5, 0, Math.PI * 2); ctx.fill();
      }
    }

    // ── Lush 3D Climbing Green Ivy Vines ──
    ctx.fillStyle = '#15803d';
    for (let iv = 0; iv < 22; iv++) {
      const ix = x + 8 + (iv * 13) % (kw - 20);
      const iy = ky + 36 + Math.sin(iv * 1.8) * 16 + (iv % 3) * 35;
      ctx.beginPath(); ctx.arc(ix, iy, 4 + (iv % 3), 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = (iv % 2 === 0) ? '#16a34a' : '#14532d';
    }

    // ── Projecting Burgundy & Cream Striped Canopy Awning ──
    const canY = ky + 88;
    const canH = 28;
    const canW = kw - 20;
    const canX = x + 10;

    const numStripes = 14;
    const sW = canW / numStripes;
    for (let si = 0; si < numStripes; si++) {
      ctx.fillStyle = (si % 2 === 0) ? '#831843' : '#fef9e7';
      ctx.beginPath();
      ctx.moveTo(canX + si * sW, canY);
      ctx.lineTo(canX + (si + 1) * sW, canY);
      ctx.lineTo(canX + (si + 1) * sW - 2, canY + canH);
      ctx.lineTo(canX + si * sW - 2, canY + canH);
      ctx.closePath();
      ctx.fill();
    }
    // Gold fringe valance
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(canX - 2, canY + canH, canW, 4);

    // Signboard on canopy: KATZ BAKERY & CAFE ☕
    ctx.fillStyle = '#4a044e';
    ctx.fillRect(x + 50, canY - 14, kw - 100, 20);
    ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 1.5;
    ctx.strokeRect(x + 50, canY - 14, kw - 100, 20);
    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 12px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('☕ KATZ BAKERY & CAFE 🥐', x + kw / 2, canY);
    ctx.textAlign = 'left';

    // ── Curved Glass Pastry Display Showcase (Ground Floor) ──
    const bayX = x + 18;
    const bayY = canY + canH + 8;
    const bayW = kw - 95;
    const bayH = backY - bayY - 4;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(bayX, bayY, bayW, bayH);
    ctx.fillStyle = 'rgba(254, 243, 199, 0.95)';
    ctx.fillRect(bayX + 2, bayY + 2, bayW - 4, bayH - 4);

    // Tiered Glass Shelves with Pastries
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fillRect(bayX + 8, bayY + 24, bayW - 16, 3);
    ctx.fillRect(bayX + 8, bayY + 44, bayW - 16, 3);

    // Golden Croissants & Strawberry Shortcakes on trays
    for (let pi = 0; pi < 7; pi++) {
      const px = bayX + 16 + pi * 24;
      // Croissants
      ctx.fillStyle = '#d97706';
      ctx.beginPath(); ctx.ellipse(px, bayY + 18, 7, 4, 0, 0, Math.PI * 2); ctx.fill();
      // Strawberry cakes on lower tier
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(px - 4, bayY + 36, 12, 8);
      ctx.fillStyle = '#ef4444'; // Strawberry
      ctx.beginPath(); ctx.arc(px + 2, bayY + 34, 3, 0, Math.PI * 2); ctx.fill();
    }

    // Showcase frame & base
    ctx.strokeStyle = '#78350f'; ctx.lineWidth = 2.5; ctx.strokeRect(bayX, bayY, bayW, bayH);

    // ── Entrance Door (Right Side) ──
    const doorX = x + kw - 70;
    const doorY = bayY;
    const doorW = 54;
    const doorH = bayH;
    ctx.fillStyle = '#4a044e';
    ctx.fillRect(doorX, doorY, doorW, doorH);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(doorX + 8, doorY + 10, doorW - 16, 36);

    // ── Sidewalk Cafe Bistro Patio (Table & Steaming Coffee) ──
    const patioX = x + bayW + 12;
    const patioY = backY - 26;
    // Wrought-iron round bistro table
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(patioX + 10, patioY, 2, 24);
    ctx.fillRect(patioX + 4, backY - 4, 14, 4);
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath(); ctx.ellipse(patioX + 11, patioY, 14, 4, 0, 0, Math.PI * 2); ctx.fill();
    // Steaming ceramic coffee mug
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(patioX + 8, patioY - 7, 6, 7);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath(); ctx.arc(patioX + 11, patioY - 11, 3, 0, Math.PI * 2); ctx.fill();
  }

  // ─────────────────────────────────────────────────
  // 11. POHON TOTORO SUCI (2.5D Ancient Sacred Camphor Tree • 御神木)
  // ─────────────────────────────────────────────────
  function drawTotoroGrove(ctx, x, backY) {
    const tw = 340;
    const th = 230;
    const ty = backY - th;

    // Contact shadow
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(x - 10, backY - 2, tw + 20, 8);

    // ── Massive 3D Root Buttresses Spreading Over Stone Pavement ──
    ctx.fillStyle = '#1c1008';
    // Root 1 (Left spreading flare)
    ctx.beginPath();
    ctx.moveTo(x + 90, backY - 70);
    ctx.quadraticCurveTo(x + 40, backY - 20, x + 10, backY);
    ctx.lineTo(x + 45, backY);
    ctx.quadraticCurveTo(x + 80, backY - 30, x + 110, backY - 70);
    ctx.closePath();
    ctx.fill();

    // Root 2 (Right spreading flare)
    ctx.beginPath();
    ctx.moveTo(x + 190, backY - 70);
    ctx.quadraticCurveTo(x + 230, backY - 20, x + 270, backY);
    ctx.lineTo(x + 235, backY);
    ctx.quadraticCurveTo(x + 195, backY - 30, x + 170, backY - 70);
    ctx.closePath();
    ctx.fill();

    // ── Ancient Gnarled Tree Trunk with 3D Bark Shading ──
    const trunkGrad = ctx.createLinearGradient(x + 80, 0, x + 200, 0);
    trunkGrad.addColorStop(0, '#1c1008'); // Dark shadowed left
    trunkGrad.addColorStop(0.35, '#2e1c0c');
    trunkGrad.addColorStop(0.7, '#452b14'); // Warm lit right
    trunkGrad.addColorStop(1, '#1a0f07');
    ctx.fillStyle = trunkGrad;

    ctx.beginPath();
    ctx.moveTo(x + 95, backY);
    ctx.lineTo(x + 105, ty + 70);
    ctx.quadraticCurveTo(x + 140, ty + 50, x + 185, ty + 70);
    ctx.lineTo(x + 195, backY);
    ctx.closePath();
    ctx.fill();

    // Moss patches on bark
    ctx.fillStyle = '#15803d';
    ctx.beginPath(); ctx.ellipse(x + 125, backY - 45, 12, 28, 0.2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x + 168, backY - 35, 10, 22, -0.2, 0, Math.PI * 2); ctx.fill();

    // ── Hollow Tree Cavity with Blinking Kodama Spirits ──
    const cavX = x + 142;
    const cavY = backY - 48;
    ctx.fillStyle = '#0a0502';
    ctx.beginPath(); ctx.ellipse(cavX, cavY, 16, 26, 0, 0, Math.PI * 2); ctx.fill();

    // Kodama Spirit glowing blinking eyes inside tree cavity
    const blink = Math.sin(Date.now() * 0.003) > -0.85;
    if (blink) {
      ctx.fillStyle = '#fef08a';
      ctx.beginPath(); ctx.arc(cavX - 6, cavY - 4, 2.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cavX + 6, cavY - 4, 2.5, 0, Math.PI * 2); ctx.fill();
    }

    // ── Giant Sacred Shimenawa Straw Rope wrapped around Trunk ──
    const ropeY = backY - 95;
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(x + 102, ropeY);
    ctx.quadraticCurveTo(x + 145, ropeY + 12, x + 188, ropeY);
    ctx.stroke();

    // White Zigzag Shide Paper Streamers
    ctx.fillStyle = '#ffffff';
    for (let si = 0; si < 3; si++) {
      const sx = x + 122 + si * 22;
      ctx.beginPath();
      ctx.moveTo(sx, ropeY + 4); ctx.lineTo(sx + 4, ropeY + 12);
      ctx.lineTo(sx, ropeY + 20); ctx.lineTo(sx + 4, ropeY + 28);
      ctx.lineTo(sx - 3, ropeY + 28); ctx.lineTo(sx - 7, ropeY + 20);
      ctx.lineTo(sx - 2, ropeY + 12); ctx.lineTo(sx - 7, ropeY + 4);
      ctx.closePath();
      ctx.fill();
    }

    // ── Multi-Tiered Volumetric Foliage Canopy with Rim Lighting ──
    const canopyData = [
      { x: x + 145, y: ty + 40, r: 88, c: '#064e3b' }, // Deep back shadow
      { x: x + 85,  y: ty + 65, r: 72, c: '#065f46' },
      { x: x + 210, y: ty + 60, r: 75, c: '#047857' },
      { x: x + 145, y: ty + 30, r: 76, c: '#059669' }, // Mid canopy
      { x: x + 105, y: ty + 45, r: 60, c: '#10b981' }, // Moonlit highlights
      { x: x + 180, y: ty + 40, r: 62, c: '#34d399' }
    ];

    const windSway = Math.sin(Date.now() * 0.002) * 4;
    for (const clump of canopyData) {
      ctx.fillStyle = clump.c;
      ctx.beginPath();
      ctx.arc(clump.x + windSway * (clump.r / 80), clump.y, clump.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Drifting Glowing Fireflies (Hotaru 蛍) around the tree
    const time = Date.now() * 0.002;
    for (let fi = 0; fi < 5; fi++) {
      const fx = x + 70 + (fi * 45) + Math.sin(time + fi * 1.5) * 16;
      const fy = ty + 40 + (fi * 22) + Math.cos(time * 0.8 + fi) * 14;
      const alpha = 0.4 + Math.sin(time * 3 + fi * 2) * 0.4;
      ctx.fillStyle = `rgba(254, 240, 138, ${Math.max(0.1, alpha)})`;
      ctx.beginPath(); ctx.arc(fx, fy, 3, 0, Math.PI * 2); ctx.fill();
    }

    // ── Stone Jizo Guardian Statue at Tree Base ──
    const jizoX = x + 65;
    const jizoY = backY - 26;
    // Stone body & head
    ctx.fillStyle = '#64748b';
    ctx.fillRect(jizoX - 5, jizoY + 6, 12, 18);
    ctx.beginPath(); ctx.arc(jizoX + 1, jizoY + 4, 6, 0, Math.PI * 2); ctx.fill();
    // Red woven bib
    ctx.fillStyle = '#dc2626';
    ctx.beginPath(); ctx.arc(jizoX + 1, jizoY + 8, 4.5, 0, Math.PI); ctx.fill();
  }

  // ─────────────────────────────────────────────────
  // 2.5D DEPTH-SORTED ENTITY RENDERING
  // Collects all NPCs, Cats, Stalls, Fixtures & Player
  // and renders them in order of Y-foot position!
  // ─────────────────────────────────────────────────
  function drawDepthSortedEntities(ctx, camX, geom) {
    const ents = state.entities;
    const renderList = [];

    // Helper: calculate screen coords and footY
    function addEntity(type, x, z, drawFn, data = {}) {
      const screenX = x - camX;
      // Skip offscreen entities
      if (screenX < -200 || screenX > canvas.width + 200) return;
      const footY = geom.streetBackY + z * geom.streetDepthSpan;
      const scale = 0.84 + z * 0.28;
      renderList.push({ type, screenX, footY, z, scale, drawFn, data });
    }

    // 1. Street Fixtures & Stalls
    addEntity('vending', ents.vendingMachine.x, ents.vendingMachine.z, () => drawVendingMachine(ctx, ents.vendingMachine.x - camX, ents.vendingMachine.z, geom));
    addEntity('vending2', ents.vendingMachine2.x, ents.vendingMachine2.z, () => drawVendingMachine(ctx, ents.vendingMachine2.x - camX, ents.vendingMachine2.z, geom));
    addEntity('ticket', ents.ticketMachine.x, ents.ticketMachine.z, () => drawTicketMachine(ctx, ents.ticketMachine.x - camX, ents.ticketMachine.z, geom));
    addEntity('phone', ents.phoneBooth.x, ents.phoneBooth.z, () => drawPhoneBooth(ctx, ents.phoneBooth.x - camX, ents.phoneBooth.z, geom));
    addEntity('postbox', ents.postBox.x, ents.postBox.z, () => drawPostBox(ctx, ents.postBox.x - camX, ents.postBox.z, geom));
    addEntity('takoyaki', ents.takoyakiStand.x, ents.takoyakiStand.z, () => drawFoodStand(ctx, ents.takoyakiStand.x - camX, ents.takoyakiStand.z, geom, 'たこ焼き', '#e74c3c', '🐙'));
    addEntity('yakitori', ents.yakitoriStand.x, ents.yakitoriStand.z, () => drawFoodStand(ctx, ents.yakitoriStand.x - camX, ents.yakitoriStand.z, geom, '焼き鳥', '#f39c12', '🍢'));
    addEntity('taiyaki', ents.taiyakiCart.x, ents.taiyakiCart.z, () => drawFoodStand(ctx, ents.taiyakiCart.x - camX, ents.taiyakiCart.z, geom, 'たい焼き', '#e17055', '🐟'));
    addEntity('garapon', ents.garaponMachine.x, ents.garaponMachine.z, () => drawGaraponMachine(ctx, ents.garaponMachine.x - camX, ents.garaponMachine.z, geom));
    addEntity('purikura', ents.purikuraBooth.x, ents.purikuraBooth.z, () => drawPurikuraBooth(ctx, ents.purikuraBooth.x - camX, ents.purikuraBooth.z, geom));
    addEntity('crane', ents.craneGame.x, ents.craneGame.z, () => drawCraneGame(ctx, ents.craneGame.x - camX, ents.craneGame.z, geom));
    addEntity('torii', ents.toriiGate.x, ents.toriiGate.z, () => drawToriiGate(ctx, ents.toriiGate.x - camX, ents.toriiGate.z, geom));
    addEntity('ema', ents.emaBoard.x, ents.emaBoard.z, () => drawEmaBoard(ctx, ents.emaBoard.x - camX, ents.emaBoard.z, geom));
    addEntity('bench_park', ents.parkBench1.x, ents.parkBench1.z, () => drawParkBench(ctx, ents.parkBench1.x - camX, ents.parkBench1.z, geom));
    addEntity('fountain', ents.fountain.x, ents.fountain.z, () => drawFountain(ctx, ents.fountain.x - camX, ents.fountain.z, geom));
    addEntity('flowerbed', ents.flowerBed.x, ents.flowerBed.z, () => drawFlowerBed(ctx, ents.flowerBed.x - camX, ents.flowerBed.z, geom));
    addEntity('busstop', ents.busStop.x, ents.busStop.z, () => drawBusStop(ctx, ents.busStop.x - camX, ents.busStop.z, geom));
    addEntity('totoro', ents.totoro.x, ents.totoro.z, () => drawTotoro(ctx, ents.totoro.x - camX, ents.totoro.z, geom));
    addEntity('kaonashi', ents.kaonashi.x, ents.kaonashi.z, () => drawKaonashi(ctx, ents.kaonashi.x - camX, ents.kaonashi.z, geom));

    // Street Lamps
    [ents.streetLamp1, ents.streetLamp2, ents.streetLamp3, ents.streetLamp4].forEach(lamp => {
      addEntity('lamp', lamp.x, lamp.z, () => drawStreetLamp(ctx, lamp.x - camX, lamp.z, geom));
    });

    // 2. NPCs
    const npcDefs = [
      { key: 'npcAoi', name: 'Aoi', hairColor: '#2d3436', coatColor: '#1e272e', skirtColor: '#c0392b', isFemale: true, holdingPhone: true },
      { key: 'npcKen', name: 'Ken', hairColor: '#5c4033', coatColor: '#2c3e50', pantsColor: '#1a1d24', isFemale: false, holdingCan: true },
      { key: 'npcRen', name: 'Ren(NPC)', hairColor: '#34495e', coatColor: '#dcdde1', pantsColor: '#2f3542', isFemale: false },
      { key: 'npcYuki', name: 'Yuki', hairColor: '#e17055', coatColor: '#6c5ce7', skirtColor: '#a855f7', isFemale: true },
      { key: 'npcHiro', name: 'Hiro', hairColor: '#2d3436', coatColor: '#e67e22', pantsColor: '#2c3e50', isFemale: false },
      { key: 'npcSakura', name: 'Sakura', hairColor: '#fdcb6e', coatColor: '#00b894', skirtColor: '#55efc4', isFemale: true },
      { key: 'npcTaro', name: 'Taro', hairColor: '#636e72', coatColor: '#2d3436', pantsColor: '#1e272e', isFemale: false },
      { key: 'npcMiko', name: 'Miko', hairColor: '#2d3436', coatColor: '#e74c3c', skirtColor: '#ecf0f1', isFemale: true }
    ];

    npcDefs.forEach(def => {
      const npc = ents[def.key];
      if (npc) {
        addEntity(def.key, npc.x, npc.z || 0.3, (item) => {
          drawRealisticHuman(ctx, item.screenX, item.footY, item.z, {
            name: def.name, height: npc.h || 56, hairColor: def.hairColor, coatColor: def.coatColor,
            pantsColor: def.pantsColor, skirtColor: def.skirtColor,
            isFemale: def.isFemale, holdingPhone: def.holdingPhone, holdingCan: def.holdingCan,
            facing: npc.facing || 1, isWalking: npc.isWalking && !npcBusy(npc), walkFrame: npc.walkFrame || 0,
            emote: npc.emote || null, emoteStart: npc.emoteStart || 0
          });
        });
      }
    });

    // 3. Cats
    const catDefs = [
      { ent: ents.strayCatJiji, color: '#0d1117', eyeColor: '#ffd166' },
      { ent: ents.strayCatMike, color: '#e17055', eyeColor: '#2ecc71' },
      { ent: ents.strayCatShiro, color: '#f5f5f5', eyeColor: '#2ecc71' }
    ];
    catDefs.forEach(cd => {
      addEntity('cat', cd.ent.x, cd.ent.z, (item) => {
        const sc = item.scale;
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath(); ctx.ellipse(item.screenX + 8 * sc, item.footY - 1, 8 * sc, 3 * sc, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = cd.color;
        ctx.beginPath(); ctx.ellipse(item.screenX + 8 * sc, item.footY - 8 * sc, 7 * sc, 9 * sc, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = cd.eyeColor;
        ctx.beginPath();
        ctx.arc(item.screenX + 6 * sc, item.footY - 12 * sc, 2 * sc, 0, Math.PI * 2);
        ctx.arc(item.screenX + 10 * sc, item.footY - 12 * sc, 2 * sc, 0, Math.PI * 2);
        ctx.fill();
      });
    });

    // 4. The Player Ren!
    addEntity('player', state.player.x, state.player.z, () => {
      drawRealisticPlayer(ctx, state.player, camX, geom);
    });

    // ─────────────────────────────────────────
    // SORT ALL BY FOOT Y (Painter's Algorithm)
    // ─────────────────────────────────────────
    renderList.sort((a, b) => a.footY - b.footY);

    // Draw all depth-sorted entities
    for (const item of renderList) {
      item.drawFn(item);
    }
  }

  // ─────────────────────────────────────────────────
  // STREET OBJECT DRAWING HELPERS (With 2.5D Scale)
  // ─────────────────────────────────────────────────
  function drawVendingMachine(ctx, x, z, geom) {
    const footY = geom.streetBackY + z * geom.streetDepthSpan;
    const scale = 0.84 + z * 0.28;
    const vw = 44 * scale; const vh = 76 * scale;
    // Ground shadow
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath(); ctx.ellipse(x + vw / 2, footY, vw * 0.6, 5 * scale, 0, 0, Math.PI * 2); ctx.fill();
    // 3D Machine Body
    ctx.fillStyle = '#c0392b'; ctx.fillRect(x, footY - vh, vw, vh);
    ctx.fillStyle = '#e74c3c'; ctx.fillRect(x + 2 * scale, footY - vh + 2 * scale, vw - 4 * scale, vh - 4 * scale);
    ctx.fillStyle = '#ecf0f1'; ctx.fillRect(x + 5 * scale, footY - vh + 8 * scale, vw - 10 * scale, 34 * scale);
    // Drinks
    const canColors = ['#2980b9', '#f39c12', '#27ae60', '#e74c3c', '#8e44ad', '#16a085'];
    for (let cr = 0; cr < 2; cr++) for (let cc = 0; cc < 3; cc++) {
      ctx.fillStyle = canColors[(cr * 3 + cc) % 6];
      ctx.fillRect(x + (8 + cc * 10) * scale, footY - vh + (12 + cr * 14) * scale, 6 * scale, 10 * scale);
    }
    // Neon glow
    ctx.fillStyle = 'rgba(0, 240, 255, 0.16)';
    ctx.beginPath(); ctx.arc(x + vw / 2, footY - vh / 2, 45 * scale, 0, Math.PI * 2); ctx.fill();
  }

  function drawTicketMachine(ctx, x, z, geom) {
    const footY = geom.streetBackY + z * geom.streetDepthSpan;
    const scale = 0.84 + z * 0.28;
    const tw = 34 * scale; const th = 65 * scale;
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath(); ctx.ellipse(x + tw / 2, footY, tw * 0.55, 4.5 * scale, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#2c3e50'; ctx.fillRect(x, footY - th, tw, th);
    ctx.fillStyle = '#00cec9'; ctx.fillRect(x + 4 * scale, footY - th + 12 * scale, tw - 8 * scale, 18 * scale);
  }

  function drawPhoneBooth(ctx, x, z, geom) {
    const footY = geom.streetBackY + z * geom.streetDepthSpan;
    const scale = 0.84 + z * 0.28;
    const pw = 30 * scale; const ph = 82 * scale;
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath(); ctx.ellipse(x + pw / 2, footY, pw * 0.6, 5 * scale, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#c0392b'; ctx.fillRect(x, footY - ph, pw, ph);
    ctx.fillStyle = 'rgba(200,230,255,0.35)'; ctx.fillRect(x + 4 * scale, footY - ph + 10 * scale, pw - 8 * scale, 42 * scale);
  }

  function drawPostBox(ctx, x, z, geom) {
    const footY = geom.streetBackY + z * geom.streetDepthSpan;
    const scale = 0.84 + z * 0.28;
    const pw = 26 * scale; const ph = 40 * scale;
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath(); ctx.ellipse(x + pw / 2, footY, pw * 0.55, 4 * scale, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#e74c3c'; ctx.fillRect(x, footY - ph, pw, ph);
    ctx.fillStyle = '#fff'; ctx.font = `bold ${Math.round(8 * scale)}px sans-serif`; ctx.fillText('〒', x + 8 * scale, footY - ph + 24 * scale);
  }

  function drawFoodStand(ctx, x, z, geom, name, color, icon) {
    const footY = geom.streetBackY + z * geom.streetDepthSpan;
    const scale = 0.84 + z * 0.28;
    const fw = 95 * scale; const fh = 75 * scale;
    // Ground shadow
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath(); ctx.ellipse(x + fw / 2, footY, fw * 0.55, 6 * scale, 0, 0, Math.PI * 2); ctx.fill();
    // Stand Cart
    ctx.fillStyle = '#4a2c1b'; ctx.fillRect(x, footY - fh * 0.6, fw, fh * 0.6);
    ctx.fillStyle = color; ctx.fillRect(x - 4 * scale, footY - fh, fw + 8 * scale, 18 * scale);
    ctx.fillStyle = '#fff'; ctx.font = `bold ${Math.round(11 * scale)}px "Noto Sans JP", sans-serif`;
    ctx.fillText(`${icon} ${name}`, x + 6 * scale, footY - fh + 13 * scale);
    // Lantern
    ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x + fw - 12 * scale, footY - fh + 26 * scale, 8 * scale, 0, Math.PI * 2); ctx.fill();
  }

  function drawGaraponMachine(ctx, x, z, geom) {
    const footY = geom.streetBackY + z * geom.streetDepthSpan;
    const scale = 0.84 + z * 0.28;
    ctx.fillStyle = '#e74c3c'; ctx.fillRect(x, footY - 55 * scale, 36 * scale, 55 * scale);
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x + 18 * scale, footY - 35 * scale, 12 * scale, 0, Math.PI * 2); ctx.fill();
  }

  function drawPurikuraBooth(ctx, x, z, geom) {
    const footY = geom.streetBackY + z * geom.streetDepthSpan;
    const scale = 0.84 + z * 0.28;
    ctx.fillStyle = '#e84393'; ctx.fillRect(x, footY - 95 * scale, 75 * scale, 95 * scale);
    ctx.fillStyle = '#6c5ce7'; ctx.fillRect(x + 15 * scale, footY - 60 * scale, 45 * scale, 60 * scale);
  }

  function drawCraneGame(ctx, x, z, geom) {
    const footY = geom.streetBackY + z * geom.streetDepthSpan;
    const scale = 0.84 + z * 0.28;
    ctx.fillStyle = '#0984e3'; ctx.fillRect(x, footY - 80 * scale, 55 * scale, 80 * scale);
    ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.fillRect(x + 5 * scale, footY - 75 * scale, 45 * scale, 40 * scale);
  }

  function drawToriiGate(ctx, x, z, geom) {
    const footY = geom.streetBackY + z * geom.streetDepthSpan;
    const scale = 0.84 + z * 0.28;
    const tw = 120 * scale; const th = 140 * scale;
    ctx.fillStyle = '#e74c3c';
    // Pillars
    ctx.fillRect(x + 15 * scale, footY - th, 14 * scale, th);
    ctx.fillRect(x + tw - 29 * scale, footY - th, 14 * scale, th);
    // Beams
    ctx.fillRect(x, footY - th, tw, 18 * scale);
    ctx.fillRect(x + 8 * scale, footY - th + 28 * scale, tw - 16 * scale, 12 * scale);
    // Bases
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(x + 12 * scale, footY - 10 * scale, 20 * scale, 10 * scale);
    ctx.fillRect(x + tw - 32 * scale, footY - 10 * scale, 20 * scale, 10 * scale);
  }

  function drawEmaBoard(ctx, x, z, geom) {
    const footY = geom.streetBackY + z * geom.streetDepthSpan;
    const scale = 0.84 + z * 0.28;
    ctx.fillStyle = '#5c4033'; ctx.fillRect(x, footY - 80 * scale, 50 * scale, 80 * scale);
  }

  function drawParkBench(ctx, x, z, geom) {
    const footY = geom.streetBackY + z * geom.streetDepthSpan;
    const scale = 0.84 + z * 0.28;
    ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.ellipse(x + 25 * scale, footY, 26 * scale, 5 * scale, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#5c4033'; ctx.fillRect(x, footY - 22 * scale, 50 * scale, 8 * scale);
    ctx.fillRect(x + 5 * scale, footY - 14 * scale, 4 * scale, 14 * scale);
    ctx.fillRect(x + 41 * scale, footY - 14 * scale, 4 * scale, 14 * scale);
  }

  function drawFountain(ctx, x, z, geom) {
    const footY = geom.streetBackY + z * geom.streetDepthSpan;
    const scale = 0.84 + z * 0.28;
    ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.ellipse(x + 40 * scale, footY, 44 * scale, 8 * scale, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#7f8c8d'; ctx.fillRect(x + 10 * scale, footY - 20 * scale, 60 * scale, 20 * scale);
    ctx.fillStyle = 'rgba(52, 152, 219, 0.6)'; ctx.beginPath(); ctx.ellipse(x + 40 * scale, footY - 20 * scale, 36 * scale, 10 * scale, 0, 0, Math.PI * 2); ctx.fill();
  }

  function drawFlowerBed(ctx, x, z, geom) {
    const footY = geom.streetBackY + z * geom.streetDepthSpan;
    const scale = 0.84 + z * 0.28;
    ctx.fillStyle = '#3d1f0c'; ctx.fillRect(x, footY - 8 * scale, 100 * scale, 8 * scale);
    const flowerColors = ['#e74c3c', '#f39c12', '#9b59b6', '#e91e63', '#ff6b35', '#00b894'];
    for (let f = 0; f < 12; f++) {
      ctx.fillStyle = flowerColors[f % flowerColors.length];
      ctx.beginPath(); ctx.arc(x + (6 + f * 8) * scale, footY - 16 * scale, 3 * scale, 0, Math.PI * 2); ctx.fill();
    }
  }

  function drawBusStop(ctx, x, z, geom) {
    const footY = geom.streetBackY + z * geom.streetDepthSpan;
    const scale = 0.84 + z * 0.28;
    ctx.fillStyle = '#475569'; ctx.fillRect(x + 25 * scale, footY - 110 * scale, 6 * scale, 110 * scale);
    ctx.fillStyle = '#1e293b'; ctx.fillRect(x, footY - 110 * scale, 55 * scale, 30 * scale);
    ctx.fillStyle = '#00f0ff'; ctx.font = `bold ${Math.round(8 * scale)}px sans-serif`; ctx.fillText('BUS', x + 15 * scale, footY - 92 * scale);
  }

  function drawTotoro(ctx, x, z, geom) {
    const footY = geom.streetBackY + z * geom.streetDepthSpan;
    const scale = 0.84 + z * 0.28;
    ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.ellipse(x + 39 * scale, footY, 38 * scale, 8 * scale, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#576574'; ctx.beginPath(); ctx.ellipse(x + 39 * scale, footY - 50 * scale, 36 * scale, 48 * scale, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f5f6fa'; ctx.beginPath(); ctx.ellipse(x + 39 * scale, footY - 40 * scale, 24 * scale, 30 * scale, 0, 0, Math.PI * 2); ctx.fill();
  }

  function drawKaonashi(ctx, x, z, geom) {
    const footY = geom.streetBackY + z * geom.streetDepthSpan;
    const scale = 0.84 + z * 0.28;
    ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.ellipse(x + 17 * scale, footY, 16 * scale, 4 * scale, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#110e17'; ctx.beginPath(); ctx.moveTo(x + 8 * scale, footY - 60 * scale);
    ctx.quadraticCurveTo(x - 8 * scale, footY - 25 * scale, x - 4 * scale, footY);
    ctx.lineTo(x + 38 * scale, footY);
    ctx.quadraticCurveTo(x + 42 * scale, footY - 25 * scale, x + 26 * scale, footY - 60 * scale);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#f8f9fa'; ctx.beginPath(); ctx.ellipse(x + 17 * scale, footY - 42 * scale, 12 * scale, 16 * scale, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#845ec2'; ctx.fillRect(x + 11 * scale, footY - 51 * scale, 3 * scale, 4 * scale); ctx.fillRect(x + 20 * scale, footY - 51 * scale, 3 * scale, 4 * scale);
  }

  function drawStreetLamp(ctx, x, z, geom) {
    const footY = geom.streetBackY + z * geom.streetDepthSpan;
    const scale = 0.84 + z * 0.28;
    // Base shadow
    ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.ellipse(x + 6 * scale, footY, 6 * scale, 2.5 * scale, 0, 0, Math.PI * 2); ctx.fill();
    // Post
    ctx.fillStyle = '#2c3e50'; ctx.fillRect(x + 4 * scale, footY - 185 * scale, 4 * scale, 185 * scale);
    // Lamp Head
    ctx.fillStyle = '#f5cd79'; ctx.fillRect(x - 4 * scale, footY - 192 * scale, 20 * scale, 10 * scale);
  }

  // ─────────────────────────────────────────────────
  // CHARACTER DRAWING (2.5D Scale, Ground Shadow & Jump)
  // ─────────────────────────────────────────────────
  // ─────────────────────────────────────────────────
  // CHARACTER ENGINE: detailed chibi, outlines, shading, expressions & emotes
  // ─────────────────────────────────────────────────
  const EMOTES = ['happy', 'laugh', 'love', 'sad', 'angry', 'surprised', 'sleepy', 'wave', 'dance', 'clap', 'bow', 'cheer'];
  const EMOTE_ICON = { happy: '😊', laugh: '😂', love: '😍', sad: '😢', angry: '💢', surprised: '❗', sleepy: '💤', wave: '👋', dance: '💃', clap: '👏', bow: '🙇', cheer: '🎉' };
  // Durasi tiap emote (detik)
  const EMOTE_DUR = { happy: 3.5, laugh: 4, love: 4.5, sad: 4.5, angry: 3.5, surprised: 2.6, sleepy: 5.5, wave: 3.5, dance: 6, clap: 4, bow: 2.8, cheer: 4.5 };

  // Dipanggil dari tombol emote / tombol 1-9, 0. Untuk mode online: kirim event dari window.onPlayerEmote.
  function setEmote(name) {
    const p = state.player;
    p.emote = name; p.emoteStart = Date.now();
    try { sfx.dialog(); } catch (_) {}
    if (window.onPlayerEmote) window.onPlayerEmote(name);
    if (window.MabarNetwork) window.MabarNetwork.sendEmote(name);
  }

  // Pose seluruh badan untuk emote (dipakai saat karakter diam). Semua nilai di-blend lewat k agar halus masuk/keluar.
  function emotePose(em, age, t, P) {
    const dur = EMOTE_DUR[em] || 3.5;
    const k = Math.min(1, age / 0.25) * Math.min(1, Math.max(0, (dur - age) / 0.3));
    const s8 = Math.sin(t * 8), a9 = Math.abs(Math.sin(t * 9));
    switch (em) {
      case 'happy': P.hop = -a9 * 3 * k; P.aB = (-1.0 + s8 * 0.35) * k; P.aF = (-1.0 - s8 * 0.35) * k; P.tilt = s8 * 0.04 * k; break;
      case 'laugh': P.px = Math.sin(t * 26) * 0.8 * k; P.tilt = -0.12 * k + Math.sin(t * 22) * 0.02 * k; P.hy = -1 * k; P.aF = -1.3 * k; P.aB = -0.8 * k; break;
      case 'love': P.tilt = Math.sin(t * 3) * 0.07 * k; P.px = Math.sin(t * 3) * 1.2 * k; P.hop = -Math.abs(Math.sin(t * 3)) * 1.5 * k; P.aB = -1.55 * k; P.aF = -1.75 * k + Math.sin(t * 6) * 0.05; break;
      case 'sad': P.tilt = 0.08 * k; P.hy = 3 * k; P.bob = 2 * k; P.aB = 0.12 * k; P.aF = (-2.7 + Math.sin(t * 9) * 0.1) * k; break;
      case 'angry': P.px = Math.sin(t * 30) * 0.9 * k; P.sw = Math.sin(t * 12); P.hop = -Math.max(0, Math.sin(t * 12)) * 1.5 * k; P.aB = 0.5 * k; P.aF = 0.5 * k; P.tilt = -0.05 * k; break;
      case 'surprised': P.hop = (age < 0.45 ? -Math.sin(age / 0.45 * Math.PI) * 10 : 0); P.aB = -2.6 * k; P.aF = -2.6 * k; P.tilt = -0.1 * k; P.hy = -2 * k; break;
      case 'sleepy': P.tilt = Math.sin(t * 1.6) * 0.09 * k; P.hy = (3 + Math.sin(t * 1.6) * 2) * k; P.bob = 1 * k; if ((age % 3.2) < 1.3) P.aF = -2.45 * k; break;
      case 'dance': P.px = s8 * 2.2 * k; P.tilt = s8 * 0.1 * k; P.hop = -a9 * 3.5 * k; P.sw = s8; P.aB = (-2.3 + s8 * 0.6) * k; P.aF = (-2.3 - s8 * 0.6) * k; break;
      case 'clap': { const c = Math.sin(t * 18); P.aB = (-1.5 + c * 0.25) * k; P.aF = (-1.5 - c * 0.25) * k; P.hop = -a9 * 1.5 * k; break; }
      case 'bow': { const b = Math.sin(Math.min(1, age / dur) * Math.PI); P.tilt = 0.3 * b; P.hy = 3 * b; P.aB = 0.1 * b; P.aF = 0.1 * b; break; }
      case 'cheer': { const j = Math.abs(Math.sin(t * 7)); P.hop = -j * 8 * k; P.aB = (-2.8 + Math.sin(t * 14) * 0.2) * k; P.aF = (-2.8 - Math.sin(t * 14) * 0.2) * k; break; }
    }
  }

  // Efek partikel emote (tanpa state: dihitung dari umur emote). Koordinat layar.
  function emoteFX(ctx, em, age, t, x, topY, sc, facing, dur, footY) {
    const hyc = topY + 13 * sc, fade = Math.max(0, Math.min(1, (dur - age) / 0.5));
    const px = (cx, cy, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(Math.round(cx), Math.round(cy), w, h); };
    const heart = (cx, cy, s, c) => ['XX.XX', 'XXXXX', '.XXX.', '..X..'].forEach((r, j) => { for (let i = 0; i < 5; i++) if (r[i] === 'X') px(cx + (i - 2) * s, cy + j * s, s, s, c); });
    const sparkle = (cx, cy, s, c) => { px(cx - s, cy, 2 * s + 1, 1, c); px(cx, cy - s, 1, 2 * s + 1, c); };
    ctx.save();
    ctx.globalAlpha = fade;
    switch (em) {
      case 'love':
        for (let i = 0; i < 5; i++) {
          const ph = (age * 0.5 + i / 5) % 1;
          ctx.globalAlpha = fade * (1 - ph * ph);
          heart(x + Math.sin(age * 2.2 + i * 1.9) * 14 * sc + (i - 2) * 5 * sc, hyc - 10 * sc - ph * 38 * sc, Math.max(1, Math.round(sc * (1.2 + (i % 2) * 0.6))), i % 2 ? '#ff5c8a' : '#ff2a7a');
        }
        break;
      case 'sleepy':
        for (let i = 0; i < 3; i++) {
          const ph = (age * 0.35 + i / 3) % 1;
          ctx.globalAlpha = fade * Math.sin(ph * Math.PI);
          ctx.font = `bold ${Math.round((8 + ph * 9) * sc)}px "Outfit", sans-serif`;
          ctx.fillStyle = '#c4b5fd';
          ctx.fillText(i % 2 ? 'Z' : 'z', x + 12 * sc + ph * 14 * sc + Math.sin(ph * 6 + i) * 3, hyc - 6 * sc - ph * 30 * sc);
        }
        break;
      case 'angry':
        for (let i = 0; i < 4; i++) {
          const ph = (age * 1.4 + i / 4) % 1, side = i % 2 ? 1 : -1;
          ctx.globalAlpha = fade * (1 - ph) * 0.8;
          ctx.fillStyle = '#f1f5f9';
          ctx.beginPath(); ctx.arc(x + side * (11 + ph * 10) * sc, hyc - 2 * sc - ph * 18 * sc, (2 + ph * 4) * sc, 0, Math.PI * 2); ctx.fill();
        }
        break;
      case 'sad': {
        const cy = hyc - 26 * sc + Math.sin(t * 2) * 1;
        ctx.fillStyle = '#64748b';
        for (const [dx, dy, r] of [[-6, 0, 5], [1, -2, 6.2], [8, 0, 4.6]]) { ctx.beginPath(); ctx.arc(x + dx * sc, cy + dy * sc, r * sc, 0, Math.PI * 2); ctx.fill(); }
        for (let i = 0; i < 3; i++) {
          const ph = (age * 1.6 + i / 3) % 1;
          ctx.globalAlpha = fade * (1 - ph * 0.5);
          px(x + (i - 1) * 6 * sc, cy + 5 * sc + ph * 20 * sc, Math.max(1, Math.round(1.5 * sc)), Math.max(2, Math.round(3 * sc)), '#60a5fa');
        }
        break;
      }
      case 'surprised':
        if (age < 0.7) {
          ctx.globalAlpha = 1 - age / 0.7; ctx.strokeStyle = '#fde047'; ctx.lineWidth = 2;
          for (let i = 0; i < 6; i++) {
            const a = -Math.PI / 2 + (i - 2.5) * 0.45, r0 = 18 * sc, r1 = (24 + age * 18) * sc;
            ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * r0, hyc + Math.sin(a) * r0); ctx.lineTo(x + Math.cos(a) * r1, hyc + Math.sin(a) * r1); ctx.stroke();
          }
        }
        break;
      case 'dance': {
        const hue = (t * 120) % 360;
        ctx.strokeStyle = `hsla(${hue},100%,65%,.55)`; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.ellipse(x, footY - 1, (15 + Math.sin(t * 8) * 2) * sc, 5 * sc, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.strokeStyle = `hsla(${(hue + 120) % 360},100%,65%,.3)`;
        ctx.beginPath(); ctx.ellipse(x, footY - 1, (22 + Math.sin(t * 8 + 1) * 3) * sc, 7.5 * sc, 0, 0, Math.PI * 2); ctx.stroke();
        const cols = ['#00f0ff', '#ff2a7a', '#fde047', '#a855f7'];
        for (let i = 0; i < 4; i++) {
          const ph = (age * 0.6 + i / 4) % 1, side = i % 2 ? 1 : -1;
          ctx.globalAlpha = fade * (1 - ph);
          ctx.font = `bold ${Math.round(14 * sc)}px sans-serif`; ctx.fillStyle = cols[i];
          ctx.fillText(i % 2 ? '\u266A' : '\u266B', x + side * (14 + ph * 16) * sc + Math.sin(ph * 8 + i) * 3, hyc - 4 * sc - ph * 34 * sc);
        }
        break;
      }
      case 'clap':
        if (Math.sin(t * 18) > 0.85) {
          const sx = x + facing * 12 * sc, sy = hyc + 20 * sc;
          sparkle(sx, sy, Math.max(2, Math.round(3 * sc)), '#fde68a'); sparkle(sx + 6 * sc, sy - 6 * sc, 1, '#fff'); sparkle(sx - 2 * sc, sy - 8 * sc, 1, '#fff');
        }
        break;
      case 'cheer':
        for (let i = 0; i < 16; i++) {
          const ph = (age * 0.7 + mHash(i, 1)) % 1;
          ctx.globalAlpha = fade * (1 - ph * 0.6);
          px(x + (mHash(i, 2) - 0.5) * 44 * sc + Math.sin(age * 3 + i) * 3, hyc - 26 * sc + ph * 52 * sc, 2, 3, MOT_RAIN[i % 6]);
        }
        break;
      case 'laugh':
        for (let i = 0; i < 2; i++) {
          const dir = i ? 1 : -1, ph = (age * 2.2 + i * 0.5) % 1;
          ctx.globalAlpha = fade * (1 - ph);
          px(x + dir * (5 + ph * 14) * sc, hyc + 2 * sc - Math.sin(ph * Math.PI) * 8 * sc + ph * 10 * sc, 2, 3, '#7dd3fc');
        }
        break;
      case 'happy':
        for (let i = 0; i < 4; i++) {
          const tw = (Math.sin(age * 5 + i * 1.7) + 1) / 2, a = i * 1.57 + age * 0.8, r = (18 + (i % 2) * 6) * sc;
          ctx.globalAlpha = fade * tw;
          sparkle(x + Math.cos(a) * r, hyc + Math.sin(a) * r * 0.8, Math.max(1, Math.round((2 + tw * 2) * sc)), '#fde047');
        }
        break;
    }
    ctx.restore();
  }

  // ── NPC emote AI: emote sendiri, menyapa, dan membalas emote pemain / NPC lain ──
  const NPC_KEYS = ['npcAoi', 'npcKen', 'npcRen', 'npcYuki', 'npcHiro', 'npcSakura', 'npcTaro', 'npcMiko'];
  const NPC_PERSONA = {
    npcAoi: ['happy', 'laugh', 'love', 'wave'], npcKen: ['sleepy', 'laugh', 'cheer', 'happy'], npcRen: ['wave', 'bow', 'happy', 'clap'],
    npcYuki: ['dance', 'love', 'happy', 'cheer'], npcHiro: ['cheer', 'clap', 'laugh', 'happy'], npcSakura: ['dance', 'love', 'wave', 'happy'],
    npcTaro: ['sleepy', 'bow', 'angry', 'sad'], npcMiko: ['bow', 'clap', 'happy', 'love'],
    baristaHana: ['happy', 'bow', 'clap', 'wave'], cashierMika: ['wave', 'happy', 'bow', 'laugh']
  };
  const NPC_REPLY = {
    wave: ['wave', 'happy'], happy: ['happy', 'wave'], laugh: ['laugh', 'happy'], love: ['surprised', 'love', 'happy'], sad: ['sad', 'love'],
    angry: ['surprised', 'sad'], surprised: ['surprised', 'laugh'], sleepy: ['sleepy', 'laugh'], dance: ['dance', 'clap', 'cheer'],
    clap: ['bow', 'happy', 'cheer'], bow: ['bow', 'happy'], cheer: ['cheer', 'clap', 'happy']
  };
  let npcSeenEmote = 0;
  const pickOf = arr => arr[(Math.random() * arr.length) | 0];
  const npcBusy = npc => !!npc && npc.busyUntil > Date.now();

  function npcDoEmote(npc, name, now) {
    npc.emote = name; npc.emoteStart = now;
    npc.busyUntil = now + (EMOTE_DUR[name] || 3.5) * 1000;
    npc.nextEmoteAt = now + 9000 + Math.random() * 14000;
    npc.facingFix = true;
  }

  function updateNpcEmotes() {
    const now = Date.now(), p = state.player, ents = state.entities;
    const all = NPC_KEYS.map(k => [k, ents[k], 'street']);
    all.push(['baristaHana', state.cafeInterior && state.cafeInterior.baristaHana, 'cafe_interior']);
    all.push(['cashierMika', state.bleemInterior && state.bleemInterior.cashierMika, 'bleem_interior']);
    const actors = all.filter(a => a[1] && a[2] === state.scene);
    const fresh = p.emote && p.emoteStart !== npcSeenEmote && now - p.emoteStart < (EMOTE_DUR[p.emote] || 3.5) * 1000;
    if (fresh) npcSeenEmote = p.emoteStart;
    for (const [key, npc] of actors) {
      if (npc.nextEmoteAt === undefined) npc.nextEmoteAt = now + 2500 + Math.random() * 7000;
      const dx = p.x - npc.x;
      const near = Math.abs(dx) < 160 && (state.scene !== 'street' || Math.abs((p.z || 0.5) - (npc.z || 0.3)) < 0.45);
      if (npcBusy(npc)) { if (near && Math.abs(dx) > 12) npc.facing = dx > 0 ? 1 : -1; continue; }
      if (npc.pending && now >= npc.pending.at) {
        const nm = npc.pending.name; npc.pending = null;
        npcDoEmote(npc, nm, now);
        if (near && Math.abs(dx) > 12) npc.facing = dx > 0 ? 1 : -1;
        continue;
      }
      if (npc.pending) continue;
      if (fresh && near) { npc.pending = { name: pickOf(NPC_REPLY[p.emote] || ['happy']), at: now + 450 + Math.random() * 900 }; continue; }
      if (near && Math.abs(dx) < 120 && now > (npc.greetAt || 0)) { npc.greetAt = now + 35000; npc.pending = { name: 'wave', at: now + 300 }; continue; }
      if (now >= npc.nextEmoteAt) {
        const nm = pickOf(NPC_PERSONA[key] || ['happy']);
        npcDoEmote(npc, nm, now);
        for (const [, n2] of actors) {
          if (n2 !== npc && !n2.pending && !npcBusy(n2) && Math.abs(n2.x - npc.x) < 170 && Math.abs((n2.z || 0.3) - (npc.z || 0.3)) < 0.5 && Math.random() < 0.5) {
            n2.pending = { name: pickOf(NPC_REPLY[nm] || ['happy']), at: now + 700 + Math.random() * 1200 };
          }
        }
      }
    }
  }
  document.querySelectorAll('#emote-bar button').forEach(b => b.addEventListener('click', () => setEmote(b.dataset.e)));

  function shade(hex, a) {
    if (!/^#[0-9a-f]{6}$/i.test(hex || '')) return hex || '#888888';
    const n = parseInt(hex.slice(1), 16), f = v => Math.max(0, Math.min(255, v + a));
    return 'rgb(' + f(n >> 16) + ',' + f((n >> 8) & 255) + ',' + f(n & 255) + ')';
  }

  // ─────────────────────────────────────────────────
  // MOTIF KAIN (pola piksel) + KATALOG BENTUK ATASAN / BAWAHAN
  // motifHit(jenis, u, v, tinggi) -> 0 = kain polos, 1/2/3 = warna motif (utama/gelap/terang) atau hex warna tetap
  // ─────────────────────────────────────────────────
  const MB = {
    heart: ['.XX.XX.', 'XXXXXXX', 'XXXXXXX', '.XXXXX.', '..XXX..', '...X...'],
    sakura: ['..X.X..', '.XXXXX.', 'XXXOXXX', '.XXXXX.', '..X.X..'],
    alien: ['..X...X..', '...X.X...', '..XXXXX..', '.XX.X.XX.', 'XXXXXXXXX', 'X.XXXXX.X', 'X.X...X.X', '...XX.XX.'],
    bolt: ['..XX', '.XX.', 'XXXX', '.XX.', 'XX..', 'X...']
  };
  const MOT_RAIN = ['#e74c3c', '#f39c12', '#f1c40f', '#2ecc71', '#3498db', '#9b59b6'];
  const mHash = (a, b) => { let h = (a * 374761393 + b * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
  function mBitmap(map, u, v, cw, ch, off) {
    const cu = ((u + off * (Math.floor(v / ch) % 2)) % cw + cw) % cw, r = map[v % ch];
    if (!r || cu >= r.length) return 0;
    const c = r[cu]; return c === 'X' ? 1 : c === 'O' ? 2 : 0;
  }
  function motifHit(k, u0, v0, H) {
    const u = ((u0 % 240) + 240) % 240, v = ((v0 % 240) + 240) % 240;
    switch (k) {
      case 'stripes': return v % 4 < 2 ? 1 : 0;
      case 'vstripes': return u % 4 < 2 ? 1 : 0;
      case 'diag': return (u + v) % 6 < 2 ? 1 : 0;
      case 'dots': return (((u + (Math.floor(v / 5) % 2) * 3) % 6) < 2 && v % 5 < 2) ? 1 : 0;
      case 'confetti': { const q = mHash(u >> 1, v >> 1); return q < 0.11 ? 1 : q < 0.19 ? 2 : q < 0.25 ? 3 : 0; }
      case 'check': return (((u >> 1) + (v >> 1)) % 2 === 0) ? 1 : 0;
      case 'plaid': return (u % 8 === 0 || v % 8 === 0) ? 1 : ((u % 8 === 4 || v % 8 === 4) ? 2 : 0);
      case 'argyle': { const a = (u + v) % 8, b = ((u - v) % 8 + 8) % 8; return (a === 0 || b === 0) ? 1 : (a === 4 && b === 4 ? 2 : 0); }
      case 'stars': { const a = u % 6, b = (v + (Math.floor(u / 6) % 2) * 3) % 6; return ((a === 2 && b >= 1 && b <= 3) || (b === 2 && a >= 1 && a <= 3)) ? 1 : 0; }
      case 'hearts': return mBitmap(MB.heart, u, v, 9, 8, 4);
      case 'sakura': return mBitmap(MB.sakura, u, v, 9, 7, 4);
      case 'seigaiha': { const r = Math.floor(v / 3), cx = ((u + (r % 2) * 3) % 6) - 3, cy = (v % 3) - 3, d = Math.hypot(cx, cy); return (d < 3.6 && d >= 2.5) ? 1 : (d < 1.6 ? 2 : 0); }
      case 'camo': { const n = Math.sin(u * 0.8 + Math.cos(v * 0.5) * 2) + Math.cos(v * 0.7 - Math.sin(u * 0.4) * 2); return n > 0.9 ? 1 : (n < -0.9 ? 2 : 0); }
      case 'flames': { const top = H - (3 + Math.round(Math.abs(Math.sin(u * 0.9 + 1)) * 5) + (u % 4 === 0 ? 2 : 0)); return v0 >= top ? (v0 >= top + 3 ? 2 : 1) : 0; }
      case 'bolt': return mBitmap(MB.bolt, u, v, 8, 8, 4);
      case 'wave': return (((v + Math.round(Math.sin(u * 0.9) * 1.5)) % 5) === 0) ? 1 : 0;
      case 'zebra': return (((u + Math.round(v * 0.6 + Math.sin(v * 0.7) * 2)) % 6) < 2) ? 1 : 0;
      case 'ombre': { const bay = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]]; return (v0 / H) > bay[v & 3][u & 3] / 16 * 0.9 + 0.1 ? 1 : 0; }
      case 'half': return u0 < 7 ? 1 : 0;
      case 'rainbow': return MOT_RAIN[Math.floor(v / 3) % 6];
      case 'alien': return mBitmap(MB.alien, u, v, 12, 11, 0);
      default: return 0;
    }
  }
  // Gambar motif ke area persegi (x,y,w,h). (ax,ay) = titik asal pola; H = tinggi kain (untuk api / ombre).
  function motifPaint(ctx, kind, x, y, w, h, ax, ay, H, col) {
    const c1 = col, c2 = shade(col, -45), c3 = shade(col, 55);
    for (let j = 0; j < h; j++) {
      let run = 0, rc = null;
      for (let i = 0; i <= w; i++) {
        let c = null;
        if (i < w) {
          const r = motifHit(kind, Math.round(x + i - ax), Math.round(y + j - ay), H);
          c = r === 1 ? c1 : r === 2 ? c2 : r === 3 ? c3 : (typeof r === 'string' ? r : null);
        }
        if (c !== rc) { if (rc) { ctx.fillStyle = rc; ctx.fillRect(x + i - run, y + j, run, 1); } rc = c; run = 0; }
        run++;
      }
    }
  }
  const TOPS = {
    jacket: {}, hoodie: {}, tee: { sl: 'short' }, sweater: {}, kimono: { wide: true }, tech: {},
    tank: { sl: 'none', nocollar: true }, longsleeve: {}, polo: { sl: 'short', nocollar: true }, turtle: {},
    cardigan: { inner: '#f1f5f9' }, vest: { inner: '#e8edf5', arm: 'inner' }, bomber: { cuff: true, nocollar: true },
    varsity: { slc: '#f8fafc', cuff: true }, suit: { nocollar: true }, coat: { long: 12, nocollar: true },
    sailor: { sl: 'short', nocollar: true }, gakuran: { nocollar: true }, puffer: { puff: true, nocollar: true },
    happi: { wide: true, nocollar: true }, yukata: { wide: true, long: 12, nocollar: true },
    crop: { crop: true, sl: 'short' }, dungaree: { inner: '#f1f5f9', arm: 'inner', sl: 'short' }
  };
  const BOTS = {
    pants: {}, shorts: { cover: 9, skin: true }, skirt: { sk: [7, 10, 28] }, cargo: {},
    jeans: {}, jogger: {}, wide: { wide: true }, flare: {}, bermuda: { cover: 11, skin: true },
    capri: { cover: 14, skin: true }, leggings: {}, ripped: {},
    mini: { sk: [7, 9, 24] }, pleated: { sk: [7, 11, 29], det: 'pleat' }, long: { sk: [7, 12, 41], det: 'fold' },
    hakama: { sk: [7, 13, 43], det: 'hakama' }, culottes: { sk: [7, 11, 33], det: 'split' }
  };

  // Origin = tengah telapak kaki, y negatif = ke atas. Tinggi total ±68 unit.
  function drawCharacter(ctx, x, footY, sc, o) {
    const t = Date.now() / 1000, OL = '#141826', dk = '#0f172a';
    const sit = !!o.sitting, lean = !!o.leaning, air = !!o.air, lift0 = o.lift || 0;
    let lift = lift0;
    const walk = !!o.walking && !air && !sit && !lean;
    const ph = (o.walkFrame || 0) * (Math.PI / 3);
    let sw = walk ? Math.sin(ph) : 0;
    const age = o.emote ? (Date.now() - (o.emoteStart || 0)) / 1000 : 99;
    const edur = EMOTE_DUR[o.emote] || 3.5;
    const em = age < edur ? o.emote : null;
    const posing = !!em && !walk && !air && !sit && !lean;
    let bob = walk ? -Math.abs(Math.cos(ph)) * 1.6 : (sit ? 0 : Math.sin(t * 2) * 0.5);
    if (em === 'laugh') bob += Math.sin(t * 22) * 1.2;
    const P = { px: 0, tilt: 0, hy: 0, hop: 0, bob: 0, aB: null, aF: null, sw: undefined };
    if (posing) {
      emotePose(em, age, t, P);
      bob += P.bob; lift += P.hop;
      if (P.sw !== undefined) sw = P.sw;
    }
    const skin = o.skin || '#fce4cb', skinD = shade(skin, -30);
    const jc = o.coat || '#2c3e50', pc = o.pants || '#1a202c', hc = o.hair || '#1e293b';
    const BD = BOTS[o.bottom] || BOTS.pants, TD = TOPS[o.top] || TOPS.jacket;
    const lc = (BD.skin || BD.sk) ? skin : pc, shoeC = o.shoe || dk;
    const tmk = o.topMotif || 'none', tmc = o.topMotifColor || '#ffffff', bmk = o.bottomMotif || 'none', bmc = o.bottomMotifColor || '#ffffff';

    ctx.save();
    ctx.translate(Math.round(x), Math.round(footY));
    const shr = 1 - Math.min(0.5, -lift / 100);
    ctx.fillStyle = `rgba(0,0,0,${Math.max(0.12, 0.34 + lift / 300)})`;
    ctx.beginPath(); ctx.ellipse(0, -1, 13 * sc * shr, 4.5 * sc * shr, 0, 0, Math.PI * 2); ctx.fill();
    ctx.translate(0, lift);
    const bx = { slim: 0.9, bulky: 1.12 }[o.build] || 1, by = { short: 0.94, tall: 1.06 }[o.height] || 1;
    ctx.scale((o.facing || 1) * sc * bx, sc * by);
    if (lean) ctx.translate(-3, 0);
    if (posing) { ctx.translate(P.px, 0); if (P.tilt) ctx.rotate(P.tilt); }

    const R = (a, b, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(a, b, w, h); };
    const B = (a, b, w, h, c) => { R(a - 1, b - 1, w + 2, h + 2, OL); R(a, b, w, h, c); };
    const ty = (sit ? -41 : -46) + bob, hy = ty - 17 + P.hy;
    const armBase = TD.arm === 'inner' ? TD.inner : (TD.slc || jc);
    const arm = (sx, ang, sh, item) => {
      const col = sh ? shade(armBase, sh) : armBase, sl = TD.sl === 'short' ? 4 : 11;
      ctx.save(); ctx.translate(sx, ty + 4); ctx.rotate(ang);
      if (TD.sl === 'none') { B(-2, 0, 4, 12, skin); R(-2, 0, 4, 2, col); }
      else {
        B(-2, 0, 4, 12, col);
        if (TD.sl === 'short') R(-2, 4, 4, 8, skin);
        if (TD.wide) B(-4, 3, 8, 9, col);
        if (tmk !== 'none' && TD.arm !== 'inner') {
          motifPaint(ctx, tmk, -2, 0, 4, sl, -(sx + 7), -4, 23, tmc);
          if (TD.wide) motifPaint(ctx, tmk, -4, 3, 8, 9, -(sx + 7), -4, 23, tmc);
          if (sh) { ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.fillRect(-2, 0, 4, sl); }
        }
        if (TD.cuff) R(-2, 9, 4, 2, shade(col, -30));
        if (TD.slc) { R(-2, 8, 4, 1, jc); R(-2, 10, 4, 1, jc); }
        if (TD.puff) { R(-2, 4, 4, 1, shade(col, -40)); R(-2, 8, 4, 1, shade(col, -40)); }
      }
      B(-2, 11, 4, 4, skin); if (item) item();
      ctx.restore();
    };
    const st = o.hairStyle || (o.female ? 'bob' : 'short'), hl = shade(hc, 38), hd = shade(hc, -18);

    // rambut belakang (long / ponytail)
    if (st === 'long') R(-11, hy + 4, 8, 28, hc);
    if (st === 'ponytail') { R(-14, hy + 3, 5, 14 + Math.round(Math.sin(t * 3) * 1.5), hc); R(-12, hy + 1, 3, 4, shade(hc, 30)); }

    const ang = walk ? sw * 0.7 : (sit ? -0.5 : Math.sin(t * 2) * 0.03);
    arm(8, (posing && P.aB !== null) ? P.aB : -ang, -28);

    // kaki + sepatu
    const SKT = o.skirt ? (BD.sk || BOTS.skirt.sk) : null;
    if (sit) {
      B(-6, -17, 14, 5, BD.sk ? skin : pc); B(6, -17, 5, 15, lc); B(5, -3, 8, 4, shoeC); R(5, 0, 8, 1, '#f1f5f9');
      const shinM = BD.cover ? (BD.cover >= 11 ? 5 : 0) : 15;
      if (shinM && BD.cover) R(6, -17, 5, 5, pc);
      if (bmk !== 'none' && !BD.sk) {
        motifPaint(ctx, bmk, -6, -17, 14, 5, -6, -22, 22, bmc);
        if (shinM) motifPaint(ctx, bmk, 6, -17, 5, shinM, -6, -22, 22, bmc);
      }
    } else {
      const lf = air ? -9 : -4 - Math.max(0, sw) * 3, rf = air ? -6 : -4 - Math.max(0, -sw) * 3;
      const lw = BD.wide ? 7 : 5, lx = BD.wide ? -7 : -6, rx = BD.wide ? 0 : 1, bt = o.bottom;
      B(lx, -22, lw, lf + 22, shade(lc, -12)); B(rx, -22, lw, rf + 22, lc);
      if (BD.cover) { R(lx, -22, lw, BD.cover, shade(pc, -12)); R(rx, -22, lw, BD.cover, pc); }
      if (bmk !== 'none' && !BD.sk) {
        const ch = BD.cover || 99;
        motifPaint(ctx, bmk, lx, -22, lw, Math.min(ch, lf + 22), lx, -22, 22, bmc);
        motifPaint(ctx, bmk, rx, -22, lw, Math.min(ch, rf + 22), lx, -22, 22, bmc);
        ctx.fillStyle = 'rgba(0,0,0,.14)'; ctx.fillRect(lx, -22, lw, Math.min(ch, lf + 22));
      }
      if (bt === 'cargo') { R(-6, -16, 5, 4, shade(pc, -25)); R(1, -16, 5, 4, shade(pc, -25)); }
      if (bt === 'jeans') { R(-5, -17, 3, 5, shade(pc, 16)); R(2, -17, 3, 5, shade(pc, 16)); R(1, -21, 4, 1, shade(pc, 45)); R(-6, lf - 1, 5, 1, '#e0a43a'); R(1, rf - 1, 5, 1, '#e0a43a'); }
      if (bt === 'jogger') { R(-6, lf - 3, 5, 3, shade(pc, -35)); R(1, rf - 3, 5, 3, shade(pc, -35)); R(-6, -22, 1, lf + 19, '#f8fafc'); R(5, -22, 1, rf + 19, '#f8fafc'); }
      if (bt === 'wide') { R(-4, -22, 1, lf + 18, shade(pc, -30)); R(3, -22, 1, rf + 18, shade(pc, -30)); }
      if (bt === 'flare') {
        B(-7, lf - 7, 7, 7, shade(pc, -12)); B(0, rf - 7, 7, 7, pc);
        if (bmk !== 'none') { motifPaint(ctx, bmk, -7, lf - 7, 7, 7, lx, -22, 22, bmc); motifPaint(ctx, bmk, 0, rf - 7, 7, 7, lx, -22, 22, bmc); }
      }
      if (bt === 'leggings') { R(-5, -21, 1, lf + 16, shade(pc, 45)); R(2, -21, 1, rf + 16, shade(pc, 45)); R(-6, -22, 5, 2, shade(pc, -30)); R(1, -22, 5, 2, shade(pc, -30)); }
      if (bt === 'ripped') { R(-5, -15, 3, 3, skin); R(2, -12, 3, 2, skin); R(-5, -12, 2, 1, shade(pc, 40)); R(2, -10, 3, 1, shade(pc, 40)); R(-6, lf - 1, 5, 1, shade(pc, 38)); R(1, rf - 1, 5, 1, shade(pc, 38)); }
      B(-7, lf, 7, 4, shoeC); R(-7, lf + 3, 7, 1, '#f1f5f9');
      B(0, rf, 7, 4, shoeC); R(0, rf + 3, 7, 1, '#f1f5f9');
    }

    // badan: bentuk atasan + motif + detail
    const tp = o.top || 'jacket';
    const th = TD.crop ? 14 : 23, tw = TD.puff ? 8 : 7, bc = TD.arm === 'inner' ? TD.inner : jc, panelTop = tp === 'vest' || tp === 'dungaree';
    let tr = [[-tw, ty, tw * 2, th]];
    if (TD.crop) { B(-7, ty + 12, 14, 11, skin); R(-1, ty + 19, 2, 1, shade(skin, -45)); }
    B(-tw, ty, tw * 2, th, bc);
    R(-tw, ty, 3, th, shade(bc, 18)); R(tw - 3, ty, 3, th, shade(bc, -22));
    R(-tw, ty + th - 3, tw * 2, 3, shade(bc, -32));
    if (tp === 'vest') { R(-7, ty, 5, 22, jc); R(2, ty, 5, 22, jc); R(-7, ty, 2, 22, shade(jc, 18)); R(5, ty, 2, 22, shade(jc, -22)); R(-3, ty, 1, 22, shade(jc, -50)); R(2, ty, 1, 22, shade(jc, -50)); R(-7, ty + 20, 5, 2, shade(jc, -32)); R(2, ty + 20, 5, 2, shade(jc, -32)); tr = [[-7, ty, 5, 20], [2, ty, 5, 20]]; }
    if (tp === 'dungaree') { B(-4, ty + 8, 8, 15, jc); R(-5, ty, 2, 10, jc); R(3, ty, 2, 10, jc); tr = [[-4, ty + 8, 8, 15], [-5, ty, 2, 10], [3, ty, 2, 10]]; }
    if (tmk !== 'none') {
      for (const r of tr) motifPaint(ctx, tmk, r[0], r[1], r[2], r[3], -7, ty, 23, tmc);
      ctx.fillStyle = 'rgba(255,255,255,.1)'; ctx.fillRect(-tw, ty, 3, th); ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.fillRect(tw - 3, ty, 3, th);
      if (!panelTop) R(-tw, ty + th - 3, tw * 2, 3, shade(bc, -32));
    }
    const cl = shade(jc, -36);
    if (tp === 'jacket' || tp === 'tech' || tp === 'bomber') { R(0, ty + 3, 1, 17, shade(jc, -48)); R(2, ty + 13, 4, 1, shade(jc, -42)); }
    if (!TD.nocollar) R(-4, ty, 8, 3, cl);
    if (tp === 'hoodie') { R(-9, ty - 2, 18, 5, shade(jc, -15)); R(-4, ty + 14, 8, 5, shade(jc, -26)); R(-2, ty + 3, 1, 6, '#e5e7eb'); R(1, ty + 3, 1, 6, '#e5e7eb'); }
    if (tp === 'sweater') for (let i = 0; i < 3; i++) R(-7, ty + 5 + i * 5, 14, 2, shade(jc, 28));
    if (tp === 'kimono') { ctx.fillStyle = '#f5efe0'; ctx.beginPath(); ctx.moveTo(-4, ty); ctx.lineTo(4, ty); ctx.lineTo(0, ty + 10); ctx.closePath(); ctx.fill(); R(-7, ty + 12, 14, 5, '#f1c40f'); R(-7, ty + 12, 14, 1, '#b7950b'); }
    if (tp === 'tech') { R(-5, ty - 3, 10, 4, shade(jc, -40)); R(-7, ty + 8, 14, 1, '#00f0ff'); R(-7, ty + 15, 14, 1, '#ff5c8a'); R(4, ty, 1, 23, '#00f0ff'); }
    if (tp === 'tank') { R(-7, ty, 2, 9, skin); R(5, ty, 2, 9, skin); R(-3, ty, 6, 5, skin); R(-3, ty + 5, 6, 1, cl); }
    if (tp === 'longsleeve' && tmk === 'none') R(2, ty + 6, 3, 3, shade(jc, 45));
    if (tp === 'polo') { R(-6, ty - 1, 5, 3, shade(jc, 48)); R(1, ty - 1, 5, 3, shade(jc, 48)); R(-6, ty + 2, 5, 1, cl); R(1, ty + 2, 5, 1, cl); R(0, ty + 2, 1, 9, shade(jc, -45)); R(0, ty + 4, 1, 1, '#f8fafc'); R(0, ty + 7, 1, 1, '#f8fafc'); }
    if (tp === 'cardigan') { R(-2, ty, 4, 21, TD.inner); R(-2, ty, 4, 2, shade(TD.inner, -22)); R(-3, ty, 1, 21, shade(jc, -50)); R(2, ty, 1, 21, shade(jc, -50)); for (let i = 0; i < 3; i++) R(1, ty + 5 + i * 5, 1, 1, '#f5d76e'); }
    if (tp === 'bomber') { R(-4, ty, 8, 3, shade(jc, -50)); R(-4, ty + 1, 8, 1, '#f1f5f9'); R(-7, ty + 21, 14, 1, shade(jc, 45)); R(-6, ty + 13, 3, 1, shade(jc, -50)); }
    if (tp === 'varsity') { R(-4, ty, 8, 3, '#f8fafc'); R(-4, ty + 2, 8, 1, shade(jc, -20)); R(0, ty + 3, 1, 17, shade(jc, -45)); for (let i = 0; i < 3; i++) R(0, ty + 5 + i * 5, 1, 1, '#f8fafc'); R(-6, ty + 6, 5, 6, '#f8fafc'); R(-5, ty + 7, 1, 4, jc); R(-3, ty + 7, 1, 4, jc); R(-5, ty + 9, 3, 1, jc); }
    if (tp === 'suit') {
      ctx.fillStyle = '#f8fafc'; ctx.beginPath(); ctx.moveTo(-3, ty); ctx.lineTo(3, ty); ctx.lineTo(0, ty + 12); ctx.closePath(); ctx.fill();
      ctx.fillStyle = shade(jc, -34);
      ctx.beginPath(); ctx.moveTo(-6, ty); ctx.lineTo(-3, ty); ctx.lineTo(0, ty + 12); ctx.lineTo(-4, ty + 9); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(6, ty); ctx.lineTo(3, ty); ctx.lineTo(0, ty + 12); ctx.lineTo(4, ty + 9); ctx.closePath(); ctx.fill();
      R(-1, ty + 1, 2, 2, '#c0392b'); R(-1, ty + 3, 2, 8, '#c0392b'); R(3, ty + 8, 3, 1, '#f8fafc'); R(-1, ty + 16, 1, 1, '#0b0f19'); R(-1, ty + 19, 1, 1, '#0b0f19');
    }
    if (tp === 'coat') { R(-7, ty, 3, 2, shade(jc, -40)); R(4, ty, 3, 2, shade(jc, -40)); R(-5, ty - 1, 3, 5, shade(jc, -28)); R(2, ty - 1, 3, 5, shade(jc, -28)); R(-7, ty + 16, 14, 2, shade(jc, -50)); R(-1, ty + 16, 2, 2, '#d4af37'); for (const [a, b] of [[-3, 5], [2, 5], [-3, 10], [2, 10]]) R(a, ty + b, 1, 1, '#d4af37'); }
    if (tp === 'sailor') {
      ctx.fillStyle = '#1d2a5b';
      ctx.beginPath(); ctx.moveTo(-7, ty); ctx.lineTo(-2, ty); ctx.lineTo(0, ty + 9); ctx.lineTo(-7, ty + 5); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(7, ty); ctx.lineTo(2, ty); ctx.lineTo(0, ty + 9); ctx.lineTo(7, ty + 5); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#f8fafc'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-7, ty + 4.5); ctx.lineTo(-0.5, ty + 8.5); ctx.moveTo(7, ty + 4.5); ctx.lineTo(0.5, ty + 8.5); ctx.stroke();
      R(-2, ty + 8, 4, 3, '#d63031'); R(-1, ty + 11, 2, 4, '#b91c1c');
    }
    if (tp === 'gakuran') { R(-5, ty - 1, 10, 4, shade(jc, -28)); R(-4, ty + 1, 2, 1, '#f1c40f'); R(2, ty + 1, 2, 1, '#f1c40f'); for (let i = 0; i < 5; i++) R(0, ty + 4 + i * 3, 1, 2, '#f1c40f'); R(-6, ty + 15, 4, 1, shade(jc, -45)); R(2, ty + 15, 4, 1, shade(jc, -45)); }
    if (tp === 'puffer') { for (let i = 1; i < 5; i++) { R(-8, ty + i * 5, 16, 1, shade(jc, -44)); R(-8, ty + i * 5 + 1, 16, 1, shade(jc, 20)); } R(-5, ty - 1, 10, 4, shade(jc, -14)); R(-5, ty + 2, 10, 1, shade(jc, -44)); R(0, ty + 3, 1, 20, shade(jc, -55)); }
    if (tp === 'happi') { R(-4, ty, 8, 3, '#f8fafc'); R(-3, ty + 3, 2, 20, '#f8fafc'); R(1, ty + 3, 2, 20, '#f8fafc'); R(-7, ty + 16, 14, 3, '#1d2a5b'); R(3, ty + 6, 3, 3, '#f8fafc'); }
    if (tp === 'yukata') { ctx.fillStyle = '#f5efe0'; ctx.beginPath(); ctx.moveTo(-4, ty); ctx.lineTo(4, ty); ctx.lineTo(0, ty + 10); ctx.closePath(); ctx.fill(); R(-7, ty + 11, 14, 6, '#e84393'); R(-7, ty + 11, 14, 1, '#ff8fb8'); R(1, ty + 12, 5, 6, '#c2185b'); R(2, ty + 13, 3, 1, '#ff8fb8'); }
    if (tp === 'dungaree') { R(-2, ty + 12, 4, 4, shade(jc, -25)); R(-4, ty + 8, 1, 1, '#f1c40f'); R(3, ty + 8, 1, 1, '#f1c40f'); }
    if (!SKT && tp !== 'dungaree') R(-7, ty + 18, 14, 2, '#111827');
    if (SKT) {
      const [tt, bb, off] = SKT, sy0 = ty + 17, sy1 = ty + off, det = BD.det;
      const spath = () => { ctx.beginPath(); ctx.moveTo(-tt, sy0); ctx.lineTo(tt, sy0); ctx.lineTo(bb, sy1); ctx.lineTo(-bb, sy1); ctx.closePath(); };
      ctx.fillStyle = o.skirt; ctx.strokeStyle = OL; ctx.lineWidth = 1;
      spath(); ctx.fill(); ctx.stroke();
      if (bmk !== 'none') { ctx.save(); spath(); ctx.clip(); motifPaint(ctx, bmk, -bb, sy0, bb * 2, sy1 - sy0, -7, sy0, sy1 - sy0, bmc); ctx.restore(); }
      ctx.strokeStyle = 'rgba(0,0,0,.28)';
      if (det === 'pleat' || det === 'fold' || det === 'hakama') for (let k = -3; k <= 3; k++) { ctx.beginPath(); ctx.moveTo(k * tt / 3.4, sy0 + 1); ctx.lineTo(k * bb / 3.4, sy1); ctx.stroke(); }
      if (det === 'split') { ctx.beginPath(); ctx.moveTo(0, sy0 + 9); ctx.lineTo(0, sy1); ctx.stroke(); }
      if (det === 'hakama') { R(-7, sy0 - 1, 14, 3, shade(o.skirt, -45)); R(-1, sy0 + 2, 2, 7, shade(o.skirt, -45)); }
      if (det === 'pleat') R(-tt, sy0, tt * 2, 2, shade(o.skirt, -30));
    }
    if (TD.long) {
      const ty0 = ty + 20, ln = TD.long;
      B(-8, ty0, 16, ln + 2, jc); R(-8, ty0, 3, ln + 2, shade(jc, 18)); R(5, ty0, 3, ln + 2, shade(jc, -22));
      if (tmk !== 'none') { motifPaint(ctx, tmk, -8, ty0, 16, ln + 2, -7, ty, 23, tmc); ctx.fillStyle = 'rgba(255,255,255,.1)'; ctx.fillRect(-8, ty0, 3, ln + 2); ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.fillRect(5, ty0, 3, ln + 2); }
      if (tp === 'coat') R(0, ty0 + 4, 1, ln - 2, shade(jc, -55)); else R(1, ty0, 1, ln + 2, '#f5efe0');
      R(-8, ty0 + ln, 16, 2, shade(jc, -32));
    }

    // leher + kepala
    R(-2, ty - 2, 4, 4, skinD);
    B(-9, hy, 18, 16, skin); R(-8, hy + 14, 16, 2, skinD); R(-10, hy + 7, 2, 4, skin);
    if (tp === 'turtle') { B(-4, ty - 2, 8, 5, shade(jc, -10)); R(-4, ty, 8, 1, shade(jc, -38)); R(-4, ty + 2, 8, 1, shade(jc, -38)); }

    // wajah + ekspresi
    if (!o.back) {
      const fx = 1, e1 = -3, e2 = 4, ey = hy + 8, m = hy + 13, mc = '#9c4a4a', rd = '#7f1d1d';
      const ec = o.eyeColor || dk, es = o.eyeStyle || 'normal';
      const eye = ex => {
        if ((t % 4.3) < 0.12) { R(ex, ey + 2, 3, 1, dk); return; }
        if (es === 'round') { R(ex, ey - 1, 3, 5, ec); R(ex + 1, ey - 1, 1, 1, '#fff'); R(ex, ey + 3, 1, 1, shade(ec, 60)); }
        else if (es === 'sharp') { R(ex, ey + 1, 3, 3, ec); R(ex + 1, ey + 1, 1, 1, '#fff'); R(ex - 1, ey, 5, 1, OL); }
        else if (es === 'sleepy') { R(ex, ey + 1, 3, 3, ec); R(ex + 1, ey + 2, 1, 1, '#fff'); R(ex, ey + 1, 3, 1, shade(skin, -45)); }
        else { R(ex, ey, 3, 4, ec); R(ex + 1, ey, 1, 1, '#fff'); }
      };
      const arc = ex => { R(ex, ey + 2, 1, 2, dk); R(ex + 1, ey + 1, 1, 1, dk); R(ex + 2, ey + 2, 1, 2, dk); };
      const heart = ex => { const k = '#ff5c8a'; R(ex, ey, 2, 2, k); R(ex + 3, ey, 2, 2, k); R(ex, ey + 1, 5, 2, k); R(ex + 1, ey + 3, 3, 1, k); R(ex + 2, ey + 4, 1, 1, k); };
      const blush = c => { R(e1 - 2, ey + 5, 3, 2, c); R(e2 + 1, ey + 5, 3, 2, c); };
      const smile = () => { R(fx - 2, m, 5, 1, mc); R(fx - 3, m - 1, 1, 1, mc); R(fx + 3, m - 1, 1, 1, mc); };
      const brow = (ex, dy) => R(ex, ey - 3 + dy, 3, 1, hd);
      switch (em) {
        case 'happy': case 'wave': arc(e1); arc(e2); smile(); blush('rgba(255,110,140,.45)'); break;
        case 'laugh': arc(e1); arc(e2); R(fx - 2, m - 2, 5, 3, rd); R(fx - 1, m, 3, 1, '#fb7185'); blush('rgba(255,110,140,.5)'); break;
        case 'love': heart(e1 - 1); heart(e2 - 1); smile(); blush('rgba(255,110,140,.5)'); break;
        case 'sad':
          eye(e1); eye(e2); R(e1 - 1, ey - 2, 1, 1, hd); R(e1, ey - 3, 2, 1, hd); R(e2 + 2, ey - 2, 1, 1, hd); R(e2, ey - 3, 2, 1, hd);
          R(fx - 2, m, 5, 1, mc); R(fx - 3, m + 1, 1, 1, mc); R(fx + 3, m + 1, 1, 1, mc); R(e2 + 1, ey + 4 + ((t * 8) % 5 | 0), 1, 2, '#60a5fa'); break;
        case 'angry':
          R(e1, ey + 1, 3, 3, dk); R(e2, ey + 1, 3, 3, dk); R(e1 - 1, ey - 2, 3, 1, hd); R(e1 + 2, ey - 1, 1, 1, hd);
          R(e2 + 1, ey - 2, 3, 1, hd); R(e2, ey - 1, 1, 1, hd); R(fx - 2, m, 5, 1, rd); blush('rgba(255,60,60,.4)'); break;
        case 'surprised':
          for (const ex of [e1, e2]) { R(ex - 2, ey - 2, 7, 8, OL); R(ex - 1, ey - 1, 5, 6, '#fff'); R(ex + 1, ey + 1, 2, 3, dk); }
          R(fx, m - 1, 3, 3, rd); break;
        case 'sleepy': R(e1, ey + 2, 3, 1, dk); R(e2, ey + 2, 3, 1, dk); R(fx, m, 2, 2, mc); break;
        case 'dance': case 'clap': arc(e1); arc(e2); smile(); blush('rgba(255,110,140,.4)'); break;
        case 'cheer': arc(e1); arc(e2); R(fx - 2, m - 2, 5, 3, rd); R(fx - 1, m, 3, 1, '#fb7185'); blush('rgba(255,110,140,.5)'); break;
        case 'bow': R(e1, ey + 2, 3, 1, dk); R(e2, ey + 2, 3, 1, dk); R(fx - 1, m, 3, 1, mc); blush('rgba(255,110,140,.3)'); break;
        default: eye(e1); eye(e2); brow(e1, 0); brow(e2, 0); R(fx - 1, m, 3, 1, mc);
      }
      if (o.extra === 'blush') blush('rgba(255,110,140,.35)');
      if (o.extra === 'freckles') { for (const [a, b] of [[e1 - 1, 5], [e1 + 1, 6], [e2, 5], [e2 + 2, 6]]) R(a, ey + b, 1, 1, '#b9774e'); }
      if (o.extra === 'bandaid') { R(e2, ey + 6, 4, 2, '#e0b878'); R(e2 + 1, ey + 6, 2, 2, '#f3d9a4'); }
    }

    // rambut depan
    R(-10, hy - 3, 20, 8, hc); R(-10, hy + 4, 4, 8, hc); R(-8, hy - 3, 9, 1, hl);
    if (o.back) { R(-10, hy - 3, 20, 18, hc); R(-8, hy + 6, 16, 1, hd); }
    else { R(-7, hy + 5, 8, 2, hc); R(1, hy + 5, 4, 1, hc); }
    if (st === 'spiky') { R(-8, hy - 6, 3, 4, hc); R(-3, hy - 8, 3, 6, hc); R(2, hy - 6, 3, 4, hc); R(6, hy - 4, 3, 3, hc); }
    if (st === 'bob') { R(-10, hy + 4, 4, 13, hc); R(7, hy + 2, 3, 12, hc); }
    if (st === 'long') { R(-10, hy + 4, 4, 14, hc); R(7, hy + 2, 3, 14, hc); }

    const ac = o.acc || 'none';
    if (st === 'bun') { R(-4, hy - 8, 8, 6, hc); R(-3, hy - 7, 4, 1, hl); }
    if (ac === 'cap') { R(-12, hy - 5, 24, 9, OL); R(-11, hy - 4, 22, 7, jc); R(-11, hy + 1, 22, 2, shade(jc, -25)); R(2, hy + 3, 11, 3, shade(jc, -35)); }
    if (ac === 'phones') { R(-11, hy - 5, 22, 3, '#222'); R(-13, hy + 5, 5, 8, '#ff5c8a'); R(8, hy + 5, 5, 8, '#ff5c8a'); }
    if (ac === 'ears') { R(-8, hy - 10, 6, 8, hc); R(3, hy - 10, 6, 8, hc); R(-7, hy - 8, 3, 5, '#ff9eb5'); R(4, hy - 8, 3, 5, '#ff9eb5'); }
    if (ac === 'kitsune') { R(2, hy - 9, 4, 6, '#f8fafc'); R(0, hy - 4, 11, 10, OL); R(1, hy - 3, 9, 8, '#f8fafc'); R(3, hy - 1, 1, 5, '#d63031'); R(7, hy - 1, 1, 5, '#d63031'); }
    if (!o.back) {
      if (ac === 'glasses') for (const ex of [-4, 3]) { R(ex, hy + 7, 5, 1, '#111'); R(ex, hy + 12, 5, 1, '#111'); R(ex, hy + 7, 1, 6, '#111'); R(ex + 4, hy + 7, 1, 6, '#111'); }
      if (ac === 'visor') { R(-9, hy + 6, 18, 7, OL); R(-8, hy + 7, 16, 5, 'rgba(0,240,255,.65)'); R(-6, hy + 8, 4, 1, '#fff'); }
      if (ac === 'mask') { R(-7, hy + 12, 14, 5, OL); R(-6, hy + 13, 12, 3, '#f1f5f9'); }
    }
    if (ac === 'scarf') { R(-9, ty - 1, 18, 5, '#d63031'); R(2, ty + 3, 5, 10, '#d63031'); R(2, ty + 10, 5, 1, '#9b1c1c'); }

    // lengan depan (melambai / pegang HP / minuman)
    let a2 = -ang;
    if (posing && P.aF !== null) a2 = P.aF;
    else if (em === 'wave') a2 = -2.5 + Math.sin(t * 14) * 0.45;
    else if (o.phone || o.can) a2 = -1.25;
    arm(-8, a2, 0, () => {
      if (o.phone) { R(-2, 13, 4, 6, '#00f0ff'); R(-1, 14, 2, 3, '#e0ffff'); }
      if (o.can) R(-2, 13, 4, 6, '#f39c12');
    });
    ctx.restore();

    // name tag + gelembung emote
    const topY = footY + lift0 - 68 * sc * by;
    ctx.textAlign = 'center';
    if (o.name) {
      ctx.font = `bold ${Math.round(10 * sc)}px "Outfit", sans-serif`;
      const w = ctx.measureText(o.name).width + 10;
      ctx.fillStyle = 'rgba(8,10,28,0.62)'; ctx.fillRect(Math.round(x - w / 2), topY - 15, Math.round(w), 14);
      ctx.fillStyle = o.nameColor || 'rgba(255,255,255,0.9)'; ctx.fillText(o.name, x, topY - 4);
    }
    if (em) {
      emoteFX(ctx, em, age, t, x, topY, sc, o.facing || 1, edur, footY + lift0);
      const rise = Math.min(1, age / 0.25), fade = age > edur - 0.6 ? Math.max(0, (edur - age) / 0.6) : 1;
      const by = topY - (o.name ? 36 : 22) - 10 * rise + Math.sin(age * 5) * 1.5;
      const s = Math.min(1, age / 0.32), pop = 1 + 2.7 * Math.pow(s - 1, 3) + 1.7 * Math.pow(s - 1, 2);
      ctx.save(); ctx.globalAlpha = fade;
      ctx.translate(x, by + 4); ctx.scale(pop, pop); ctx.translate(-x, -(by + 4));
      ctx.fillStyle = OL; ctx.fillRect(x - 16, by - 14, 32, 28); ctx.fillRect(x - 4, by + 14, 8, 5);
      ctx.fillStyle = '#fff'; ctx.fillRect(x - 15, by - 13, 30, 26); ctx.fillRect(x - 3, by + 13, 6, 5);
      ctx.font = '19px sans-serif'; ctx.fillStyle = '#000'; ctx.fillText(EMOTE_ICON[em] || '', x, by + 7);
      ctx.restore();
    }
    ctx.textAlign = 'left';
  }

  function drawRealisticPlayer(ctx, p, camX, geom) {
    const scale = 0.84 + p.z * 0.28;
    const k = state.keys, dp = state.dpad;
    const an = state.analog;
    const up = k['w'] || k['arrowup'] || dp.up || (an.active && an.y < -0.35), down = k['s'] || k['arrowdown'] || dp.down || (an.active && an.y > 0.35);
    drawCharacter(ctx, Math.floor(p.x - camX) + (p.w / 2) * scale, Math.floor(geom.streetBackY + p.z * geom.streetDepthSpan), scale, {
      facing: p.facing, ...lookOpts(p.look),
      walking: p.isWalking, walkFrame: p.walkFrame, air: !p.onGround, lift: p.jumpY || 0,
      sitting: p.isSitting, leaning: p.isLeaning, back: !!(up && !down),
      emote: p.emote, emoteStart: p.emoteStart, name: p.name, nameColor: '#00f0ff'
    });
  }

  function drawRealisticHuman(ctx, x, footY, z, opt) {
    const scale = 0.84 + z * 0.28, me = opt.name && opt.name === state.player.name;
    drawCharacter(ctx, x + 10 * scale, footY, scale, {
      facing: opt.facing || 1, coat: opt.coatColor, pants: opt.pantsColor, hair: opt.hairColor, skirt: opt.isFemale ? opt.skirtColor : null,
      female: opt.isFemale, hairStyle: opt.hairStyle, walking: opt.isWalking, walkFrame: opt.walkFrame,
      phone: opt.holdingPhone, can: opt.holdingCan, name: opt.name,
      emote: opt.emote !== undefined ? opt.emote : (me ? state.player.emote : null),
      emoteStart: opt.emote !== undefined ? (opt.emoteStart || 0) : (me ? state.player.emoteStart : 0),
      ...(me ? lookOpts() : {})
    });
  }

  // ─────────────────────────────────────────────────
  // CHARACTER CUSTOMIZER (kulit, badan, rambut, wajah, pakaian, aksesori) + item premium
  // Item premium = elemen opsi ketiga berisi harga (Rp). Sambungkan pembayaran lewat
  // window.onPurchaseRequest({id, price, currency}, callback(true|false)).
  // ─────────────────────────────────────────────────
  const $cz = id => document.getElementById(id);
  const PAL = ['#2d3436', '#0984e3', '#d63031', '#00b894', '#6c5ce7', '#fdcb6e', '#e84393', '#dfe6e9', '#1e272e', '#2c3e50', '#e17055', '#55efc4', '#74b9ff', '#a29bfe', '#fab1a0', '#8b5a2b'];
  const PALB = ['#1a202c', '#34495e', '#6b4f3a', '#d63031', '#dfe6e9', '#fdcb6e', '#6c5ce7', '#00b894', '#2d6a9f', '#9fb6cd', '#e84393', '#1e272e', '#556b2f', '#e17055'];
  const PALM = ['#ffffff', '#f1c40f', '#e74c3c', '#ff5c8a', '#00f0ff', '#2ecc71', '#3498db', '#9b59b6', '#e67e22', '#1e272e', '#bdc3c7', '#8d6e63'];
  const MOTIF_OPTS = [['none', 'Polos'], ['stripes', 'Garis Mendatar'], ['vstripes', 'Garis Tegak'], ['diag', 'Garis Miring'], ['dots', 'Polkadot'], ['confetti', 'Confetti'],
    ['check', 'Kotak-kotak (Ichimatsu)'], ['plaid', 'Tartan / Flanel'], ['argyle', 'Argyle'], ['stars', 'Bintang'], ['hearts', 'Hati'], ['sakura', 'Sakura'],
    ['seigaiha', 'Ombak Seigaiha'], ['camo', 'Kamuflase'], ['flames', 'Api'], ['bolt', 'Petir'], ['wave', 'Gelombang'], ['zebra', 'Zebra'],
    ['ombre', 'Gradasi'], ['half', 'Dua Warna'], ['rainbow', 'Pelangi'], ['alien', 'Space Invader']];
  const CZ = [
    { t: 'Badan', i: '🧍', groups: [
      { f: 'skin', l: 'Warna kulit', i: '🎨', col: ['#fce4cb', '#f5cba7', '#e0ac82', '#c68642', '#8d5524', '#5c3a21'] },
      { f: 'build', l: 'Postur', i: '↔️', reg: 'full', opts: [['slim', 'Ramping'], ['normal', 'Normal'], ['bulky', 'Kekar']] },
      { f: 'height', l: 'Tinggi', i: '↕️', reg: 'full', opts: [['short', 'Pendek'], ['mid', 'Sedang'], ['tall', 'Tinggi']] }] },
    { t: 'Rambut', i: '💇', groups: [
      { f: 'hairStyle', l: 'Gaya', i: '✂️', reg: 'hair', opts: [['short', 'Pendek'], ['spiky', 'Spiky'], ['bob', 'Bob'], ['long', 'Panjang'], ['ponytail', 'Kuncir'], ['bun', 'Cepol']] },
      { f: 'hairColor', l: 'Warna', i: '🎨', col: ['#1e293b', '#4a2c17', '#a0522d', '#e6c35c', '#d63031', '#6c5ce7', '#00b8d4', '#e8e8f0'] }] },
    { t: 'Wajah', i: '🙂', groups: [
      { f: 'eyes', l: 'Mata', i: '👁️', reg: 'eyes', opts: [['normal', 'Normal'], ['round', 'Bulat'], ['sharp', 'Tajam'], ['sleepy', 'Sayu']] },
      { f: 'eyeColor', l: 'Warna mata', i: '🎨', col: ['#0f172a', '#4a2c17', '#1e88e5', '#2e9e5b', '#8e44ad', '#d63031'] },
      { f: 'extra', l: 'Detail', i: '✨', reg: 'face', opts: [['none', 'Polos'], ['blush', 'Merona'], ['freckles', 'Bintik'], ['bandaid', 'Plester']] }] },
    { t: 'Atasan', i: '👕', groups: [
      { f: 'top', l: 'Model atasan', i: '👕', reg: 'top', opts: [['jacket', 'Jaket'], ['hoodie', 'Hoodie'], ['tee', 'Kaos'], ['sweater', 'Sweater'], ['kimono', 'Kimono', 15000], ['tech', 'Techwear', 25000],
        ['tank', 'Tanktop'], ['longsleeve', 'Kaos Lengan Panjang'], ['polo', 'Polo'], ['turtle', 'Turtleneck'], ['cardigan', 'Kardigan'], ['vest', 'Rompi'], ['bomber', 'Bomber'], ['varsity', 'Varsity'],
        ['suit', 'Blazer'], ['coat', 'Trench Coat'], ['sailor', 'Seragam Sailor'], ['gakuran', 'Gakuran'], ['puffer', 'Puffer'], ['happi', 'Happi Festival'], ['yukata', 'Yukata'], ['crop', 'Crop Top'], ['dungaree', 'Overall']] },
      { f: 'topColor', l: 'Warna atasan', i: '🎨', col: PAL }] },
    { t: 'Motif Atasan', i: '🧵', groups: [
      { f: 'topMotif', l: 'Motif atasan', i: '🧵', mot: true, opts: MOTIF_OPTS },
      { f: 'topMotifColor', l: 'Warna motif', i: '🎨', col: PALM }] },
    { t: 'Bawahan', i: '👖', groups: [
      { f: 'bottom', l: 'Model bawahan', i: '👖', reg: 'bottom', opts: [['pants', 'Celana'], ['shorts', 'Pendek'], ['skirt', 'Rok'], ['cargo', 'Cargo', 10000],
        ['jeans', 'Jeans'], ['jogger', 'Jogger'], ['wide', 'Celana Lebar'], ['flare', 'Cutbray'], ['bermuda', 'Bermuda'], ['capri', 'Capri'], ['leggings', 'Legging'], ['ripped', 'Jeans Sobek'],
        ['mini', 'Rok Mini'], ['pleated', 'Rok Lipit'], ['long', 'Rok Panjang'], ['hakama', 'Hakama'], ['culottes', 'Kulot']] },
      { f: 'bottomColor', l: 'Warna bawahan', i: '🎨', col: PALB },
      { f: 'shoeColor', l: 'Sepatu', i: '👟', col: ['#0f172a', '#ffffff', '#d63031', '#0984e3', '#fdcb6e', '#e84393'] }] },
    { t: 'Motif Bawahan', i: '🪡', groups: [
      { f: 'bottomMotif', l: 'Motif bawahan', i: '🪡', mot: true, opts: MOTIF_OPTS },
      { f: 'bottomMotifColor', l: 'Warna motif', i: '🎨', col: PALM }] },
    { t: 'Aksesori', i: '🕶️', groups: [
      { f: 'acc', l: 'Item', i: '🎩', reg: 'acc', opts: [['none', 'Tanpa'], ['glasses', 'Kacamata'], ['cap', 'Topi'], ['phones', 'Headphone'], ['scarf', 'Syal'], ['mask', 'Masker'], ['ears', 'Kuping Kucing', 12000], ['visor', 'Neon Visor', 20000], ['kitsune', 'Topeng Kitsune', 30000]] }] }
  ];
  const LOOK_DEF = { skin: '#fce4cb', build: 'normal', height: 'mid', hairStyle: 'short', hairColor: '#1e293b', eyes: 'normal', eyeColor: '#0f172a', extra: 'none', top: 'jacket', topColor: '#2d3436', topMotif: 'none', topMotifColor: '#ffffff', bottom: 'pants', bottomColor: '#1a202c', bottomMotif: 'none', bottomMotifColor: '#ffffff', shoeColor: '#0f172a', acc: 'none' };
  const OWNED = new Set();
  try { (JSON.parse(localStorage.getItem('shibuya_owned')) || []).forEach(i => OWNED.add(i)); } catch (e) {}
  const isLocked = (f, v) => CZ.some(c => c.groups.some(g => g.f === f && g.opts && g.opts.some(o => o[0] === v && o[2] && !OWNED.has(f + ':' + v))));
  function loadLook() {
    let l = {}; try { l = JSON.parse(localStorage.getItem('shibuya_look')) || {}; } catch (e) {}
    l = Object.assign({}, LOOK_DEF, l);
    for (const f in l) if (isLocked(f, l[f])) l[f] = LOOK_DEF[f];
    return l;
  }
  state.player.look = loadLook(); state.player.color = state.player.look.topColor;
  const rp = n => 'Rp' + n.toLocaleString('id-ID');
  const saveCz = () => { try { localStorage.setItem('shibuya_look', JSON.stringify(state.player.look)); localStorage.setItem('shibuya_owned', JSON.stringify([...OWNED])); } catch (e) {} };

  function lookOpts(l) {
    l = l || state.player.look;
    return { skin: l.skin, coat: l.topColor, pants: l.bottomColor, hair: l.hairColor, hairStyle: l.hairStyle, top: l.top, bottom: l.bottom,
      skirt: (BOTS[l.bottom] || {}).sk ? l.bottomColor : null, topMotif: l.topMotif, topMotifColor: l.topMotifColor, bottomMotif: l.bottomMotif, bottomMotifColor: l.bottomMotifColor, shoe: l.shoeColor, eyeStyle: l.eyes, eyeColor: l.eyeColor, extra: l.extra, acc: l.acc, build: l.build, height: l.height };
  }
  function buyItem(id, price, done) {
    const ok = () => { OWNED.add(id); saveCz(); done(); };
    if (window.onPurchaseRequest) window.onPurchaseRequest({ id, price, currency: 'IDR' }, r => { if (r) ok(); });
    else if (confirm('Mode demo: buka item ini gratis?\n(Sambungkan window.onPurchaseRequest untuk pembayaran asli.)')) ok();
  }
  function czMsg(t, buy) {
    const m = $cz('cz-msg'); m.textContent = t || '';
    if (buy) { const b = document.createElement('button'); b.textContent = 'Beli ' + rp(buy.pr); b.onclick = () => buyItem(buy.id, buy.pr, () => { czMsg('Item dibuka dan siap dipakai!'); renderCz(); }); m.appendChild(b); }
  }
  let czTab = 0;
  // Pilihan ditampilkan sebagai gambar: karakter mini memakai item tsb (dipotong sesuai bagian tubuh) / kotak motif.
  const THUMB = {};
  const REG = { full: { sc: 0.8, cx: 0, cy: -34 }, hair: { sc: 1.5, cx: -1, cy: -53 }, eyes: { sc: 4, cx: 2, cy: -55 }, face: { sc: 3.5, cx: 1, cy: -52 },
    top: { sc: 1.0, cx: 0, cy: -38 }, bottom: { sc: 1.1, cx: 0, cy: -23 }, acc: { sc: 1.7, cx: 0, cy: -56 } };
  const thumbCache = (key, make) => {
    if (THUMB[key]) return THUMB[key];
    if (Object.keys(THUMB).length > 900) for (const k in THUMB) delete THUMB[k];
    return (THUMB[key] = make());
  };
  function thumbURL(f, v, reg) {
    const L = Object.assign({}, state.player.look, { [f]: v });
    if (f !== 'build' && f !== 'height') { L.build = 'normal'; L.height = 'mid'; }
    return thumbCache(reg + '|' + JSON.stringify(L), () => {
      const c = document.createElement('canvas'); c.width = c.height = 56; const x = c.getContext('2d');
      const bg = x.createLinearGradient(0, 0, 0, 56); bg.addColorStop(0, '#1d2650'); bg.addColorStop(1, '#0a0f20'); x.fillStyle = bg; x.fillRect(0, 0, 56, 56);
      const r = REG[reg] || REG.full;
      drawCharacter(x, 28 - r.cx * r.sc, 28 - r.cy * r.sc, r.sc, Object.assign({ facing: 1, name: '' }, lookOpts(L)));
      return c.toDataURL();
    });
  }
  function motifURL(f, v) {
    const L = state.player.look, base = L[f === 'topMotif' ? 'topColor' : 'bottomColor'], mc = L[f + 'Color'];
    return thumbCache('m|' + f + '|' + v + '|' + base + '|' + mc, () => {
      const c = document.createElement('canvas'); c.width = c.height = 28; const x = c.getContext('2d');
      x.fillStyle = base; x.fillRect(0, 0, 28, 28);
      if (v === 'none') { x.strokeStyle = 'rgba(255,255,255,.55)'; x.lineWidth = 2; x.beginPath(); x.moveTo(5, 23); x.lineTo(23, 5); x.stroke(); }
      else motifPaint(x, v, 0, 0, 28, 28, 0, 0, 28, mc);
      return c.toDataURL();
    });
  }
  function renderCz() {
    const L = state.player.look, box = $cz('cz-opts'), keep = box.scrollTop;
    $cz('cz-tabs').innerHTML = CZ.map((c, i) => `<button class="cz-tab${i === czTab ? ' on' : ''}" data-t="${i}" title="${c.t}" aria-label="${c.t}">${c.i}</button>`).join('');
    box.innerHTML = CZ[czTab].groups.map(g => `<div class="cz-l" title="${g.l}">${g.i}</div><div class="cz-row">` + (g.col
      ? g.col.map(c => `<button class="cz-sw${L[g.f] === c ? ' on' : ''}" data-f="${g.f}" data-v="${c}" style="background:${c}"></button>`).join('')
      : g.opts.map(([v, n, pr]) => `<button class="cz-op cz-img${L[g.f] === v ? ' on' : ''}" data-f="${g.f}" data-v="${v}" data-p="${pr || ''}" title="${n}${pr ? ' • ' + rp(pr) : ''}" aria-label="${n}"><img alt="" src="${g.mot ? motifURL(g.f, v) : thumbURL(g.f, v, g.reg)}">${pr ? `<i class="cz-bdg">${OWNED.has(g.f + ':' + v) ? '✔' : '💎'}</i>` : ''}</button>`).join('')) + '</div>').join('');
    box.scrollTop = keep;
  }
  $cz('cz-tabs').onclick = e => { const b = e.target.closest('.cz-tab'); if (!b) return; czTab = +b.dataset.t; renderCz(); $cz('cz-opts').scrollTop = 0; };
  $cz('cz-opts').onclick = e => {
    const b = e.target.closest('[data-f]'); if (!b) return;
    const d = b.dataset;
    state.player.look[d.f] = d.v; state.player.color = state.player.look.topColor;
    const pr = +d.p, id = d.f + ':' + d.v;
    if (pr && !OWNED.has(id)) czMsg('Item premium ' + rp(pr) + '. Boleh dicoba dulu, beli untuk memakainya di game.', { id, pr }); else czMsg('');
    saveCz(); renderCz(); drawHumanPreview();
  };
  $cz('start-btn').addEventListener('click', e => {
    const L = state.player.look, bad = Object.keys(L).filter(f => isLocked(f, L[f]));
    if (bad.length) { e.stopImmediatePropagation(); czMsg('Item premium yang kamu pakai belum dibeli. Beli dulu atau ganti ke item gratis.'); return; }
    saveCz();
  });
  renderCz();
  setInterval(() => { if (!$cz('name-screen').classList.contains('hidden')) drawHumanPreview(); }, 110);

  // ─────────────────────────────────────────────────
  // BUILDING LIFE LAYER: grounding, uap dapur, merpati, genangan cahaya
  // ─────────────────────────────────────────────────
  function nightK() {
    const t = state.timeOfDay;
    return t > 0.6 ? Math.min(1, (t - 0.6) / 0.12) : Math.max(0, Math.min(1, (0.28 - t) / 0.12));
  }
  const LIFE = [
    ['seaTrain', '255,170,120', 0], ['shopBleem', '120,220,255', 1], ['salonBarber', '255,210,120', 0],
    ['izakayaHouse', '255,170,90', 1], ['arcadeBuilding', '190,110,255', 0], ['shrineMain', '255,130,70', 0],
    ['ramenShop', '255,160,70', 1], ['bookstore', '255,215,140', 0], ['recordShop', '255,120,190', 0], ['cafeKatz', '255,220,150', 1]
  ];
  function drawBuildingLife(ctx, camX, backY, front) {
    const now = Date.now() / 1000, n = nightK();
    LIFE.forEach(([key, rgb, steam], i) => {
      const en = state.entities[key]; if (!en) return;
      const w = en.w || 240, h = en.h || 170, sx = en.x - camX;
      if (sx < -w - 60 || sx > canvas.width + 60) return;
      if (front) {
        if (n < 0.05) return;
        const fl = 0.85 + Math.sin(now * 3 + i * 2) * 0.05 + Math.sin(now * 11 + i) * 0.03;
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        ctx.translate(sx + w / 2, backY + 16); ctx.scale(1, 0.22);
        const g = ctx.createRadialGradient(0, 0, 4, 0, 0, w * 0.62);
        g.addColorStop(0, `rgba(${rgb},${0.3 * n * fl})`); g.addColorStop(1, `rgba(${rgb},0)`);
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, w * 0.62, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
        return;
      }
      const ao = ctx.createLinearGradient(0, backY - 70, 0, backY);
      ao.addColorStop(0, 'rgba(0,0,0,0)'); ao.addColorStop(1, 'rgba(0,0,0,0.3)');
      ctx.fillStyle = ao; ctx.fillRect(sx, backY - 70, w, 70);
      const roofY = backY - h;
      if (steam) for (let j = 0; j < 6; j++) {
        const ph = (now * 0.32 + j / 6 + i * 0.17) % 1;
        ctx.fillStyle = `rgba(225,228,240,${(1 - ph) * 0.26})`;
        ctx.beginPath(); ctx.arc(sx + w * 0.74 + Math.sin(ph * 6 + j) * 6 * ph, roofY - ph * 48, 3 + ph * 8, 0, Math.PI * 2); ctx.fill();
      }
      if (i === 1 || i === 2 || i === 7) for (let j = 0; j < 2; j++) {
        const px = sx + w * (j ? 0.78 : 0.16), peck = Math.max(0, Math.sin(now * 2.2 + i + j * 2)) > 0.9 ? 2 : 0;
        const flap = (now + i * 3 + j) % 9 < 0.25 ? -3 : 0, py = roofY - 4 + flap;
        ctx.fillStyle = '#141826'; ctx.fillRect(px - 5, py - 6, 11, 8);
        ctx.fillStyle = '#9aa3b2'; ctx.fillRect(px - 4, py - 5, 9, 6); ctx.fillStyle = '#6b7280'; ctx.fillRect(px - 5, py - 3, 4, 3);
        ctx.fillStyle = '#b8c0cc'; ctx.fillRect(px + 3, py - 9 + peck, 4, 4);
        ctx.fillStyle = '#f59e0b'; ctx.fillRect(px + 7, py - 8 + peck, 2, 1);
        ctx.fillStyle = '#0f172a'; ctx.fillRect(px + 5, py - 8 + peck, 1, 1);
      }
    });
  }

  // ─────────────────────────────────────────────────
  // DYNAMIC LIGHTING & PARTICLES
  // ─────────────────────────────────────────────────
  function drawDynamicLighting(ctx, camX, backY) {
    const ents = state.entities;
    const geom = getStreetGeometry();
    [ents.streetLamp1, ents.streetLamp2, ents.streetLamp3, ents.streetLamp4].forEach(lamp => {
      const lx = lamp.x - camX + 6;
      const footY = geom.streetBackY + lamp.z * geom.streetDepthSpan;
      const ly = footY - 185;
      if (lx > -150 && lx < canvas.width + 150) {
        ctx.save();
        const coneGrad = ctx.createRadialGradient(lx, ly, 10, lx, footY, 130);
        coneGrad.addColorStop(0, 'rgba(255, 241, 193, 0.32)');
        coneGrad.addColorStop(0.5, 'rgba(255, 241, 193, 0.12)');
        coneGrad.addColorStop(1, 'rgba(255, 241, 193, 0)');
        ctx.fillStyle = coneGrad;
        ctx.beginPath();
        ctx.moveTo(lx, ly);
        ctx.lineTo(lx - 65, footY);
        ctx.lineTo(lx + 65, footY);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    });
  }

  function drawAtmosphericParticles(ctx, camX) {
    for (const pt of state.particles) {
      const sx = pt.x - camX;
      if (sx >= -10 && sx <= canvas.width + 10) {
        ctx.fillStyle = pt.color;
        ctx.globalAlpha = pt.alpha;
        ctx.beginPath();
        ctx.arc(sx, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1.0;
  }

  // ─────────────────────────────────────────────────
  // INTERIOR SCENES WITH 2.5D ROOM DEPTH
  // ─────────────────────────────────────────────────
  function renderCafeInterior(ctx, camX, geom, w, h) {
    const c = state.cafeInterior;
    ctx.fillStyle = '#1e140d'; ctx.fillRect(0, 0, w, h);

    const roomW = c.roomWidth;
    const floorY = h * 0.45;
    const floorH = h - floorY;

    // Cafe Wall
    const wallGrad = ctx.createLinearGradient(0, 0, 0, floorY);
    wallGrad.addColorStop(0, '#2d1b11'); wallGrad.addColorStop(1, '#3d2417');
    ctx.fillStyle = wallGrad; ctx.fillRect(0, 0, w, floorY);

    // Warm cafe lights
    for (let lx = 140; lx < w; lx += 220) {
      const cone = ctx.createRadialGradient(lx, 20, 10, lx, floorY, 180);
      cone.addColorStop(0, 'rgba(255, 220, 150, 0.4)');
      cone.addColorStop(1, 'rgba(255, 220, 150, 0)');
      ctx.fillStyle = cone; ctx.beginPath();
      ctx.moveTo(lx, 20); ctx.lineTo(lx - 90, floorY); ctx.lineTo(lx + 90, floorY); ctx.fill();
    }

    // Perspective wood floor
    ctx.fillStyle = '#4a2c1b'; ctx.fillRect(0, floorY, w, floorH);
    ctx.strokeStyle = '#2f190e'; ctx.lineWidth = 1.5;
    for (let fy = floorY; fy < h; fy += 14) {
      ctx.beginPath(); ctx.moveTo(0, fy); ctx.lineTo(w, fy); ctx.stroke();
    }

    // Bar Counter
    const cntX = 460 - camX; const cntY = floorY + 15;
    ctx.fillStyle = '#2c180e'; ctx.fillRect(cntX, cntY, 240, 70);
    ctx.fillStyle = '#5c331d'; ctx.fillRect(cntX - 10, cntY - 8, 260, 12);

    // Espresso Machine
    ctx.fillStyle = '#bdc3c7'; ctx.fillRect(cntX + 50, cntY - 45, 45, 38);

    // Barista Hana
    drawRealisticHuman(ctx, c.baristaHana.x - camX, cntY + 10, 0.25, {
      name: 'Hana (Barista)', height: 56, hairColor: '#5c4033', coatColor: '#2d3436', skirtColor: '#e74c3c', isFemale: true,
      facing: c.baristaHana.facing || 1, emote: c.baristaHana.emote || null, emoteStart: c.baristaHana.emoteStart || 0
    });

    // Cat Mimi
    const mimiX = c.catMimi.x - camX;
    ctx.fillStyle = '#ecf0f1'; ctx.beginPath(); ctx.ellipse(mimiX, floorY + 45, 12, 8, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 9px sans-serif'; ctx.fillText('Mimi (Zzz)', mimiX - 16, floorY + 30);

    // Player Ren
    drawRealisticHuman(ctx, state.player.x - camX, floorY + 50, state.player.z, {
      name: state.player.name, height: state.player.h, coatColor: state.player.color, facing: state.player.facing
    });

    // Exit Door
    ctx.fillStyle = '#111'; ctx.fillRect(50 - camX, floorY - 90, 45, 90);
    ctx.fillStyle = '#2ecc71'; ctx.font = 'bold 9px sans-serif'; ctx.fillText('EXIT [E]', 52 - camX, floorY - 96);
  }

  function renderBleemInterior(ctx, camX, geom, w, h) {
    ctx.fillStyle = '#1e2430'; ctx.fillRect(0, 0, w, h);
    const floorY = h * 0.45;
    ctx.fillStyle = '#2d3748'; ctx.fillRect(0, floorY, w, h - floorY);

    // Shelves with neon goods
    for (let sx = 200; sx < 600; sx += 140) {
      const ssx = sx - camX;
      ctx.fillStyle = '#4a5568'; ctx.fillRect(ssx, floorY - 80, 80, 80);
    }

    // Cashier
    const b = state.bleemInterior;
    drawRealisticHuman(ctx, b.cashierMika.x - camX, floorY + 20, 0.25, {
      name: 'Mika (Kasir)', height: 56, coatColor: '#0984e3', skirtColor: '#00cec9', isFemale: true,
      facing: b.cashierMika.facing || 1, emote: b.cashierMika.emote || null, emoteStart: b.cashierMika.emoteStart || 0
    });

    // Player
    drawRealisticHuman(ctx, state.player.x - camX, floorY + 45, state.player.z, {
      name: state.player.name, height: state.player.h, coatColor: state.player.color, facing: state.player.facing
    });
  }

  function renderArcadeInterior(ctx, camX, geom, w, h) {
    ctx.fillStyle = '#0a0319'; ctx.fillRect(0, 0, w, h);
    const floorY = h * 0.45;

    // Glowing checkered floor
    ctx.fillStyle = '#12072b'; ctx.fillRect(0, floorY, w, h - floorY);
    ctx.strokeStyle = '#a855f7'; ctx.lineWidth = 1;
    for (let ay = floorY; ay < h; ay += 18) {
      ctx.beginPath(); ctx.moveTo(0, ay); ctx.lineTo(w, ay); ctx.stroke();
    }

    // Arcade cabinets
    for (let c = 0; c < 5; c++) {
      const ax = 160 + c * 130 - camX;
      ctx.fillStyle = '#241042'; ctx.fillRect(ax, floorY - 90, 50, 90);
      ctx.fillStyle = c % 2 === 0 ? '#00f0ff' : '#ff2a7a'; ctx.fillRect(ax + 5, floorY - 75, 40, 30);
    }

    // Player
    drawRealisticHuman(ctx, state.player.x - camX, floorY + 45, state.player.z, {
      name: state.player.name, height: state.player.h, coatColor: state.player.color, facing: state.player.facing
    });
  }

  // ─────────────────────────────────────────────────
  // MINIMAP (Shows 2.5D X and Z depth position!)
  // ─────────────────────────────────────────────────
  function drawMinimap(camX) {
    const mc = document.getElementById('minimap-canvas');
    if (!mc || !state.showMinimap) return;
    const mctx = mc.getContext('2d');
    const scale = mc.width / WORLD_WIDTH;

    mctx.fillStyle = 'rgba(9, 14, 26, 0.88)';
    mctx.fillRect(0, 0, mc.width, mc.height);

    // Street depth band
    const streetTopY = mc.height * 0.30;
    const streetHeight = mc.height * 0.44;

    mctx.fillStyle = '#1e2430'; mctx.fillRect(0, streetTopY, mc.width, streetHeight * 0.4);
    mctx.fillStyle = '#161a23'; mctx.fillRect(0, streetTopY + streetHeight * 0.4, mc.width, streetHeight * 0.6);
    mctx.fillStyle = '#0a1628'; mctx.fillRect(0, streetTopY + streetHeight, mc.width, mc.height - (streetTopY + streetHeight));

    // District color tags
    for (const z of CITY_ZONES) {
      mctx.fillStyle = z.color; mctx.globalAlpha = 0.22;
      mctx.fillRect(z.x1 * scale, 0, (z.x2 - z.x1) * scale, mc.height);
    }
    mctx.globalAlpha = 1.0;

    // Camera viewport box
    mctx.strokeStyle = '#00f0ff'; mctx.lineWidth = 1;
    mctx.strokeRect(camX * scale, 2, canvas.width * scale, mc.height - 4);

    // NPC dots with exact 2.5D Z depth
    mctx.fillStyle = '#ffd166';
    ['npcAoi', 'npcKen', 'npcRen', 'npcYuki', 'npcHiro', 'npcSakura', 'npcTaro', 'npcMiko'].forEach(key => {
      const npc = state.entities[key];
      if (npc) {
        const ny = streetTopY + (npc.z || 0.3) * streetHeight;
        mctx.beginPath(); mctx.arc(npc.x * scale, ny, 1.8, 0, Math.PI * 2); mctx.fill();
      }
    });

    // Player dot with depth
    const py = streetTopY + (state.player.z || 0.5) * streetHeight;
    mctx.fillStyle = '#00f0ff';
    mctx.beginPath(); mctx.arc(state.player.x * scale, py, 3.5, 0, Math.PI * 2); mctx.fill();
    mctx.strokeStyle = '#fff'; mctx.lineWidth = 1; mctx.stroke();
  }

  // ─────────────────────────────────────────────────
  // CHAT BUBBLES
  // ─────────────────────────────────────────────────
  function wrapTextLines(text, maxWidth) {
    ctx.save(); ctx.font = '500 12px "Outfit", "Noto Sans JP", sans-serif';
    const words = text.split(' '); const lines = []; let cur = words[0] || '';
    for (let i = 1; i < words.length; i++) {
      const w = words[i]; const test = cur + ' ' + w;
      if (ctx.measureText(test).width <= maxWidth) cur = test; else { lines.push(cur); cur = w; }
    }
    if (cur) lines.push(cur); ctx.restore(); return lines.length > 0 ? lines : [text];
  }

  function showChatBubble(speaker, text, getPosFn, accentColor = '#00f0ff', duration = 5.0) {
    if (!text) return;
    state.chatBubbles = state.chatBubbles.filter(b => b.speaker !== speaker);
    const wrapped = wrapTextLines(text, 200);
    state.chatBubbles.push({ id: Math.random(), speaker, text, lines: wrapped, getPos: getPosFn, color: accentColor, timer: duration, maxTimer: duration, alpha: 0 });
  }

  function drawChatBubbles(ctx, camX) {
    if (!state.chatBubbles || state.chatBubbles.length === 0) return;
    for (const b of state.chatBubbles) {
      if (!b || b.timer <= 0) continue;
      const pos = b.getPos ? b.getPos() : { x: 0, y: 0 };
      const screenX = pos.x; const screenY = pos.y;
      if (screenX < -220 || screenX > canvas.width + 220) continue;

      ctx.save(); ctx.globalAlpha = Math.max(0, Math.min(1, b.alpha));
      ctx.font = '500 12px "Outfit", "Noto Sans JP", sans-serif';
      const lines = b.lines || [b.text];
      let maxLineW = 0;
      for (const l of lines) { const lw = ctx.measureText(l).width; if (lw > maxLineW) maxLineW = lw; }
      ctx.font = 'bold 9px "Outfit", sans-serif';
      const nameW = ctx.measureText(b.speaker.toUpperCase()).width;
      if (nameW + 10 > maxLineW) maxLineW = nameW + 10;

      const padX = 12; const bubbleW = Math.max(72, Math.min(240, maxLineW + padX * 2));
      const lineH = 16; const bubbleH = 14 + lines.length * lineH + 6;
      const floatY = Math.sin(Date.now() * 0.005 + b.id) * 2.5;
      let bx = screenX - bubbleW / 2; let by = screenY - bubbleH - 14 + floatY;
      bx = Math.max(12, Math.min(canvas.width - bubbleW - 12, bx)); by = Math.max(64, by);

      ctx.shadowColor = b.color || '#00f0ff'; ctx.shadowBlur = 10;
      ctx.fillStyle = 'rgba(9, 14, 26, 0.94)'; ctx.strokeStyle = b.color || '#00f0ff'; ctx.lineWidth = 1.8;
      const r = 8;
      ctx.beginPath(); ctx.moveTo(bx + r, by); ctx.lineTo(bx + bubbleW - r, by);
      ctx.arcTo(bx + bubbleW, by, bx + bubbleW, by + r, r);
      ctx.lineTo(bx + bubbleW, by + bubbleH - r);
      ctx.arcTo(bx + bubbleW, by + bubbleH, bx + bubbleW - r, by + bubbleH, r);
      const tailBaseX = Math.max(bx + 14, Math.min(bx + bubbleW - 14, screenX));
      ctx.lineTo(tailBaseX + 6, by + bubbleH); ctx.lineTo(screenX, screenY - 4); ctx.lineTo(tailBaseX - 6, by + bubbleH);
      ctx.lineTo(bx + r, by + bubbleH);
      ctx.arcTo(bx, by + bubbleH, bx, by + bubbleH - r, r);
      ctx.lineTo(bx, by + r); ctx.arcTo(bx, by, bx + r, by, r);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.fillStyle = b.color || '#00f0ff'; ctx.font = 'bold 9px "Outfit", sans-serif';
      ctx.fillText(b.speaker.toUpperCase(), bx + padX, by + 12);
      ctx.fillStyle = '#ffffff'; ctx.font = '500 12px "Outfit", "Noto Sans JP", sans-serif';
      for (let i = 0; i < lines.length; i++) ctx.fillText(lines[i], bx + padX, by + 26 + i * lineH);
      ctx.restore();
    }
  }

  // ─────────────────────────────────────────────────
  // UI MANAGEMENT
  // ─────────────────────────────────────────────────
  function updateCurrencyUI() {
    const p = state.player;
    const gEl = document.getElementById('gold-count'); const fEl = document.getElementById('fish-count');
    if (gEl) gEl.textContent = p.gold; if (fEl) fEl.textContent = p.drinksCount;
  }

  function updateTimeUI() {
    const t = state.timeOfDay; const timeEl = document.getElementById('game-time'); const timeBtn = document.getElementById('btn-time');
    if (!timeEl) return;
    if (t > 0.65 || t < 0.2) { timeEl.textContent = '🌙 21:30'; if (timeBtn) timeBtn.textContent = '🌙'; }
    else if (t < 0.45) { timeEl.textContent = '🌞 11:00'; if (timeBtn) timeBtn.textContent = '🌞'; }
    else { timeEl.textContent = '🌅 17:45'; if (timeBtn) timeBtn.textContent = '🌅'; }
  }

  function toggleTimeOfDay() {
    if (state.timeOfDay > 0.65 || state.timeOfDay < 0.2) state.timeOfDay = 0.35;
    else if (state.timeOfDay < 0.45) state.timeOfDay = 0.55;
    else state.timeOfDay = 0.82;
    updateTimeUI(); sfx.jump(); showNotification('Waktu kota diubah!');
  }

  function showNotification(msg) {
    const area = document.getElementById('notification-area');
    if (!area) return;
    const notif = document.createElement('div'); notif.className = 'notification'; notif.textContent = msg;
    area.appendChild(notif);
    setTimeout(() => { notif.classList.add('notif-fade-out'); setTimeout(() => notif.remove(), 500); }, 3200);
  }

  function addChatMessage(sender, text, color = '#00f0ff', isSystem = false) {
    const msgBox = document.getElementById('chat-messages');
    if (!msgBox) return;
    const el = document.createElement('div'); el.className = 'chat-message';
    if (isSystem) el.innerHTML = `<span class="chat-msg-system">📢 ${text}</span>`;
    else el.innerHTML = `<span class="chat-msg-name" style="color:${color}">${sender}:</span> <span class="chat-msg-text">${text}</span>`;
    msgBox.appendChild(el);
    msgBox.scrollTop = msgBox.scrollHeight;

    const box = document.getElementById('chat-box');
    if (box && box.classList.contains('collapsed')) {
      const badge = document.getElementById('chat-unread-badge');
      if (badge) badge.classList.remove('hidden');
    }
  }

  function toggleChat(forceOpen = null) {
    const box = document.getElementById('chat-box');
    const toggleBtn = document.getElementById('chat-toggle-btn');
    const badge = document.getElementById('chat-unread-badge');
    const hudChatBtn = document.getElementById('btn-chat');
    if (!box) return;

    const willCollapse = forceOpen !== null ? !forceOpen : !box.classList.contains('collapsed');
    box.classList.toggle('collapsed', willCollapse);
    if (toggleBtn) toggleBtn.textContent = willCollapse ? '▴' : '▾';
    if (!willCollapse && badge) badge.classList.add('hidden');
    if (hudChatBtn) hudChatBtn.classList.toggle('active', !willCollapse);

    if (!willCollapse) {
      const input = document.getElementById('chat-input');
      if (input && window.innerWidth > 650) input.focus();
    }
  }

  // ─────────────────────────────────────────────────
  // BUTTON EVENTS
  // ─────────────────────────────────────────────────
  // (Tombol Aksi/Kafe/Vending/Kereta/Mancing dihapus: semua interaksi lewat prompt kontekstual [E] / tombol A)
  document.getElementById('btn-audio').addEventListener('click', toggleAudio);
  document.getElementById('btn-time').addEventListener('click', toggleTimeOfDay);
  document.getElementById('btn-cinema').addEventListener('click', toggleCinemaMode);
  document.getElementById('btn-minimap').addEventListener('click', toggleMinimap);

  const btnMap = document.getElementById('btn-map');
  if (btnMap) {
    btnMap.addEventListener('click', () => {
      if (state.scene === 'sawit_island') {
        if (window.SawitModule) window.SawitModule.leaveSawit(state);
        btnMap.textContent = '🌴';
      } else {
        if (window.SawitModule) window.SawitModule.enterSawit(state);
        btnMap.textContent = '🏙️';
      }
    });
  }

  window._antigravityGameState = state;
  state.canvas = canvas;
  state.getStreetGeometry = getStreetGeometry;
  state.drawRealisticPlayer = drawRealisticPlayer;
  state.drawCharacter = drawCharacter;
  state.lookOpts = lookOpts;
  state.showNotification = showNotification;
  state.addChatMessage = addChatMessage;
  state.updateCurrencyUI = updateCurrencyUI;
  state.triggerFadeTransition = triggerFadeTransition;
  if (window.SawitModule) {
    state.sawit = window.SawitModule.init(state);
  }

  const btnMabar = document.getElementById('btn-mabar');
  if (btnMabar) {
    btnMabar.addEventListener('click', () => {
      if (window.MabarNetwork) window.MabarNetwork.openModal();
    });
  }

  const btnChatHud = document.getElementById('btn-chat');
  if (btnChatHud) btnChatHud.addEventListener('click', () => toggleChat());

  const chatToggleBtn = document.getElementById('chat-toggle-btn');
  if (chatToggleBtn) chatToggleBtn.addEventListener('click', e => { e.stopPropagation(); toggleChat(); });

  const chatHeader = document.getElementById('chat-header');
  if (chatHeader) chatHeader.addEventListener('click', () => toggleChat());

  document.getElementById('modal-close').addEventListener('click', () => {
    document.getElementById('modal-overlay').classList.add('hidden');
  });

  document.getElementById('chat-send').addEventListener('click', sendChat);
  document.getElementById('chat-input').addEventListener('keydown', e => { if (e.key === 'Enter') sendChat(); });

  function sendChat() {
    const input = document.getElementById('chat-input'); const text = input.value.trim(); if (!text) return;
    addChatMessage(state.player.name, text, state.player.color);
    showChatBubble(state.player.name, text, () => getEntityScreenPos(state.player), '#00f0ff', 5.5);
    if (window.MabarNetwork) window.MabarNetwork.sendChat(text);
    input.value = ''; input.blur();
  }

  // ─────────────────────────────────────────────────
  // CHARACTER PREVIEW & INIT
  // ─────────────────────────────────────────────────
  function drawHumanPreview() {
    const pcan = document.getElementById('preview-canvas');
    if (!pcan) return; const pctx = pcan.getContext('2d');
    pctx.clearRect(0, 0, pcan.width, pcan.height);
    pctx.fillStyle = '#080d1a'; pctx.fillRect(0, 0, pcan.width, pcan.height);
    drawCharacter(pctx, pcan.width / 2, pcan.height - 16, 1.45, Object.assign({ facing: 1, name: '' }, lookOpts()));
  }

  document.querySelectorAll('.color-opt').forEach(el => {
    el.addEventListener('click', () => {
      document.querySelectorAll('.color-opt').forEach(e => e.classList.remove('selected'));
      el.classList.add('selected'); state.player.color = el.dataset.color; drawHumanPreview(state.player.color);
    });
  });

  document.getElementById('player-name-input').addEventListener('input', e => { state.player.name = e.target.value.trim() || 'Ren'; });

  // Auto-fill nama dari Telegram jika dibuka di Telegram Mini App
  if (window.MabarNetwork?.telegram?.user) {
    const tgUser = window.MabarNetwork.telegram.user;
    const tgName = tgUser.first_name || tgUser.username || 'Ren';
    state.player.name = tgName;
    const nameInp = document.getElementById('player-name-input');
    if (nameInp) nameInp.value = tgName;
  }

  let selectedStartMap = 'street';
  document.querySelectorAll('#map-select-mode [data-map]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#map-select-mode [data-map]').forEach(b => b.classList.remove('on'));
      btn.classList.add('on');
      selectedStartMap = btn.dataset.map;
    });
  });

  document.getElementById('start-btn').addEventListener('click', () => {
    const nameVal = document.getElementById('player-name-input').value.trim() || 'Ren';
    state.player.name = nameVal; document.getElementById('hud-name').textContent = nameVal;
    document.getElementById('name-screen').classList.add('hidden');
    document.getElementById('game-wrapper').classList.remove('hidden');
    if (viewMode === 'landscape' && isTouchUI()) lockLandscape(true);
    applyViewMode();
    resizeCanvas(); initCityElements(); setupMobileControls(); updateCurrencyUI();
    requestAnimationFrame(resizeCanvas);

    if (window.innerWidth < 700) {
      const box = document.getElementById('chat-box');
      if (box) box.classList.add('collapsed');
      const toggleBtn = document.getElementById('chat-toggle-btn');
      if (toggleBtn) toggleBtn.textContent = '▴';
    }

    const hudAvatar = document.getElementById('hud-avatar');
    if (hudAvatar) {
      hudAvatar.innerHTML = ''; const ac = document.createElement('canvas'); ac.width = 38; ac.height = 38; const actx = ac.getContext('2d');
      actx.fillStyle = state.player.color; actx.fillRect(8, 14, 22, 18); actx.fillStyle = state.player.look.skin; actx.fillRect(10, 4, 18, 12);
      hudAvatar.appendChild(ac);
    }

    if (selectedStartMap === 'sawit_island') {
      if (window.SawitModule) window.SawitModule.enterSawit(state);
      addChatMessage('Sistem', `Selamat datang di Perkebunan Sawit 2.5D Open World, ${nameVal}! Gunakan WASD/Joystick untuk menjelajah, dekati petak tanah lalu tekan [E] atau tap layar untuk menanam bibit sawit!`, '#66bb6a', true);
    } else {
      addChatMessage('Sistem', `Selamat datang di Shibuya Canal 2.5D, ${nameVal}! Gunakan tombol WASD / Panah untuk berjalan 4-arah (2.5D Depth)!`, '#00f0ff', true);
      setTimeout(() => showChatBubble(nameVal, 'Malam yang tenang di Shibuya 2.5D...', () => getEntityScreenPos(state.player), '#00f0ff', 5.0), 800);
    }
    requestAnimationFrame(gameLoop);
  });

  function runLoadingBar() {
    const bar = document.getElementById('loading-bar'); const text = document.getElementById('loading-text');
    const msgs = ['Menyiapkan kedalaman 2.5D...', 'Membangun jalan raya & zebra cross...', 'Menghidupkan pantulan neon kanal...', 'Membuka toko & kuil...', 'Kota Shibuya siap!'];
    let prog = 0;
    const iv = setInterval(() => {
      prog += 20; if (bar) bar.style.width = prog + '%';
      if (text) text.textContent = msgs[Math.floor((prog / 100) * msgs.length)] || 'Siap!';
      if (prog >= 100) {
        clearInterval(iv);
        setTimeout(() => {
          document.getElementById('loading-screen').classList.add('hidden');
          document.getElementById('name-screen').classList.remove('hidden');
          drawHumanPreview(state.player.color);
        }, 400);
      }
    }, 180);
  }

  let lastTime = performance.now();
  function gameLoop(now) {
    const dt = Math.min((now - lastTime) / 1000, 0.1); lastTime = now;
    updatePlayer(dt); updateWorld(dt); render();
    requestAnimationFrame(gameLoop);
  }

  runLoadingBar();
})();