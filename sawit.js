// =============================================================================
// SAWIT SIMULATOR 2.5D OPEN WORLD MODULE - ULTRA AESTHETIC EDITION
// Sesuai Dokumen Spesifikasi & Design Game TMA v1.0
// Estetika 2.5D Modern HD • Desain Tropis Indah • Detail Pohon, Bangunan, & PKS
// =============================================================================

(function (window) {
  'use strict';

  // ───────────────────────────────────────────────────────────────────────────
  // 1. DATA 12 PULAU & HIRARKI BUAH (Sesuai PDF Hal. 2 - 7)
  // ───────────────────────────────────────────────────────────────────────────
  const ISLANDS_DATA = [
    {
      id: 1, name: "Kebun Pemula", reqLevel: 1, reqCoins: 0,
      skyTop: '#1b3a24', skyBot: '#66bb6a', groundColor: '#3a2717', grassColor: '#2e7d32', grassAccent: '#388e3c',
      pathColor: '#795548', pathBorder: '#5d4037', trenchColor: '#004d40', foliage: '#2e7d32', foliageDark: '#1b5e20',
      foliageLight: '#66bb6a', trunkColor: '#5d4037', ambientGlow: 'rgba(255, 240, 180, 0.08)',
      fruits: [
        { rarity: "Common", name: "Sawit Pentil Kayu", chance: 70.00, price: 10, color: "#8d6e63" },
        { rarity: "Uncommon", name: "Sawit Hijau Mentah", chance: 20.00, price: 30, color: "#4caf50" },
        { rarity: "Rare", name: "Sawit Matang Oranye", chance: 7.00, price: 100, color: "#ff9800" },
        { rarity: "Epic", name: "Sawit Super Merah", chance: 2.49, price: 250, color: "#f44336" },
        { rarity: "Legendary", name: "Sawit Emas Pemula", chance: 0.50, price: 1000, color: "#ffd700", glow: true },
        { rarity: "Mythic", name: "Sawit Berlian Kebun", chance: 0.01, price: 5000, color: "#00f0ff", glow: true }
      ]
    },
    {
      id: 2, name: "Lembah Bukit Lembap", reqLevel: 15, reqCoins: 10000,
      skyTop: '#1a3238', skyBot: '#4db6ac', groundColor: '#2c251e', grassColor: '#00695c', grassAccent: '#00897b',
      pathColor: '#6d4c41', pathBorder: '#4e342e', trenchColor: '#00332c', foliage: '#00897b', foliageDark: '#004d40',
      foliageLight: '#4db6ac', trunkColor: '#4e342e', ambientGlow: 'rgba(128, 222, 234, 0.08)',
      fruits: [
        { rarity: "Common", name: "Sawit Batang Keras", chance: 70.00, price: 600, color: "#5d4037" },
        { rarity: "Uncommon", name: "Sawit Bukit Purba", chance: 20.00, price: 1800, color: "#2e7d32" },
        { rarity: "Rare", name: "Sawit Nektar Manis", chance: 7.00, price: 5000, color: "#ffb74d" },
        { rarity: "Epic", name: "Sawit Pelangi Lembah", chance: 2.49, price: 15000, color: "#ba68c8" },
        { rarity: "Legendary", name: "Sawit Api Volkanik", chance: 0.50, price: 60000, color: "#ff5722", glow: true },
        { rarity: "Mythic", name: "Sawit Jiwa Bukit", chance: 0.01, price: 300000, color: "#00e5ff", glow: true }
      ]
    },
    {
      id: 3, name: "Rawa Gambut Mistik", reqLevel: 35, reqCoins: 500000,
      skyTop: '#101c15', skyBot: '#1b5e20', groundColor: '#1a1412', grassColor: '#1b3820', grassAccent: '#2e7d32',
      pathColor: '#3e2723', pathBorder: '#27120a', trenchColor: '#0a1a11', foliage: '#00e676', foliageDark: '#0a3d1b',
      foliageLight: '#69f0ae', trunkColor: '#37474f', ambientGlow: 'rgba(105, 240, 174, 0.10)',
      fruits: [
        { rarity: "Common", name: "Sawit Gambut Hitam", chance: 70.00, price: 300000, color: "#212121" },
        { rarity: "Uncommon", name: "Sawit Rawa Menyala", chance: 20.00, price: 900000, color: "#00e676" },
        { rarity: "Rare", name: "Sawit Bioma Hijau", chance: 7.00, price: 2500000, color: "#1b5e20" },
        { rarity: "Epic", name: "Sawit Toksik Mistik", chance: 2.49, price: 7500000, color: "#76ff03" },
        { rarity: "Legendary", name: "Sawit Bayangan Rawa", chance: 0.50, price: 30000000, color: "#7c4dff", glow: true },
        { rarity: "Mythic", name: "Sawit Void Rawa", chance: 0.01, price: 150000000, color: "#e040fb", glow: true }
      ]
    },
    {
      id: 4, name: "Pesisir Pantai Mangrove", reqLevel: 60, reqCoins: 25000000,
      skyTop: '#0a2e47', skyBot: '#4fc3f7', groundColor: '#5d4037', grassColor: '#00838f', grassAccent: '#00acc1',
      pathColor: '#d4ac0d', pathBorder: '#b7950b', trenchColor: '#0277bd', foliage: '#00bcd4', foliageDark: '#006064',
      foliageLight: '#80deea', trunkColor: '#546e7a', ambientGlow: 'rgba(129, 212, 250, 0.08)',
      fruits: [
        { rarity: "Common", name: "Sawit Pesisir Garam", chance: 70.00, price: 15000000, color: "#cfd8dc" },
        { rarity: "Uncommon", name: "Sawit Pasir Putih", chance: 20.00, price: 45000000, color: "#fff9c4" },
        { rarity: "Rare", name: "Sawit Karang Laut", chance: 7.00, price: 120000000, color: "#ff80ab" },
        { rarity: "Epic", name: "Sawit Mutiara Biru", chance: 2.49, price: 400000000, color: "#29b6f6" },
        { rarity: "Legendary", name: "Sawit Poseidon Gold", chance: 0.50, price: 1500000000, color: "#ffd54f", glow: true },
        { rarity: "Mythic", name: "Sawit Samudra Abadi", chance: 0.01, price: 8000000000, color: "#00b0ff", glow: true }
      ]
    },
    {
      id: 5, name: "Hutan Hujan Tropis", reqLevel: 90, reqCoins: 500000000,
      skyTop: '#0d2818', skyBot: '#43a047', groundColor: '#2e1c0c', grassColor: '#1b5e20', grassAccent: '#2e7d32',
      pathColor: '#5d4037', pathBorder: '#3e2723', trenchColor: '#003300', foliage: '#4caf50', foliageDark: '#1b5e20',
      foliageLight: '#81c784', trunkColor: '#4e342e', ambientGlow: 'rgba(129, 199, 132, 0.08)',
      fruits: [
        { rarity: "Common", name: "Sawit Kanopi Hijau", chance: 70.00, price: 800000000, color: "#33691e" },
        { rarity: "Uncommon", name: "Sawit Lumut Tua", chance: 20.00, price: 2500000000, color: "#558b2f" },
        { rarity: "Rare", name: "Sawit Amber Getah", chance: 7.00, price: 7000000000, color: "#ff8f00" },
        { rarity: "Epic", name: "Sawit Flora Eksotis", chance: 2.49, price: 22000000000, color: "#d81b60" },
        { rarity: "Legendary", name: "Sawit Zamrud Rimba", chance: 0.50, price: 80000000000, color: "#00e676", glow: true },
        { rarity: "Mythic", name: "Sawit Jantung Hutan", chance: 0.01, price: 400000000000, color: "#00bfa5", glow: true }
      ]
    },
    {
      id: 6, name: "Dataran Tinggi Magma", reqLevel: 130, reqCoins: 10000000000,
      skyTop: '#2b0000', skyBot: '#d32f2f', groundColor: '#1c0a0a', grassColor: '#3e1515', grassAccent: '#5d1c1c',
      pathColor: '#b71c1c', pathBorder: '#7f0000', trenchColor: '#e65100', foliage: '#ff5722', foliageDark: '#bf360c',
      foliageLight: '#ff8a65', trunkColor: '#261717', ambientGlow: 'rgba(255, 87, 34, 0.12)',
      fruits: [
        { rarity: "Common", name: "Sawit Kerak Lava", chance: 70.00, price: 40000000000, color: "#4e342e" },
        { rarity: "Uncommon", name: "Sawit Magma Pijar", chance: 20.00, price: 120000000000, color: "#ff6f00" },
        { rarity: "Rare", name: "Sawit Obsidian Hitam", chance: 7.00, price: 350000000000, color: "#121212" },
        { rarity: "Epic", name: "Sawit Bara Infernal", chance: 2.49, price: 1200000000000, color: "#d50000" },
        { rarity: "Legendary", name: "Sawit Pyra Emas", chance: 0.50, price: 4500000000000, color: "#ffab00", glow: true },
        { rarity: "Mythic", name: "Sawit Inti Magma", chance: 0.01, price: 25000000000000, color: "#ff1744", glow: true }
      ]
    },
    {
      id: 7, name: "Puncak Es Tundra", reqLevel: 180, reqCoins: 200000000000,
      skyTop: '#081726', skyBot: '#81d4fa', groundColor: '#cfd8dc', grassColor: '#e0f7fa', grassAccent: '#b2ebf2',
      pathColor: '#90caf9', pathBorder: '#64b5f6', trenchColor: '#0288d1', foliage: '#80deea', foliageDark: '#0097a7',
      foliageLight: '#e0f7fa', trunkColor: '#546e7a', ambientGlow: 'rgba(179, 229, 252, 0.12)',
      fruits: [
        { rarity: "Common", name: "Sawit Frost Es", chance: 70.00, price: 2000000000, color: "#e1f5fe" },
        { rarity: "Uncommon", name: "Sawit Salju Abadi", chance: 20.00, price: 6000000000, color: "#ffffff" },
        { rarity: "Rare", name: "Sawit Kristal Beku", chance: 7.00, price: 18000000000, color: "#80deea" },
        { rarity: "Epic", name: "Sawit Glacier Biru", chance: 2.49, price: 60000000000, color: "#00b0ff" },
        { rarity: "Legendary", name: "Sawit Aurora Perak", chance: 0.50, price: 220000000000, color: "#b0bec5", glow: true },
        { rarity: "Mythic", name: "Sawit Zero Absolut", chance: 0.01, price: 1200000000000, color: "#00e5ff", glow: true }
      ]
    },
    {
      id: 8, name: "Lembah Elektrik Neon", reqLevel: 240, reqCoins: 5000000000000,
      skyTop: '#0d001a', skyBot: '#7b1fa2', groundColor: '#120024', grassColor: '#240046', grassAccent: '#3b0066',
      pathColor: '#4a148c', pathBorder: '#00e5ff', trenchColor: '#00f0ff', foliage: '#00f0ff', foliageDark: '#0097a7',
      foliageLight: '#e040fb', trunkColor: '#311b92', ambientGlow: 'rgba(0, 240, 255, 0.12)',
      fruits: [
        { rarity: "Common", name: "Sawit Statis Kuning", chance: 70.00, price: 100000000000, color: "#ffea00" },
        { rarity: "Uncommon", name: "Sawit Voltage Volt", chance: 20.00, price: 300000000000, color: "#76ff03" },
        { rarity: "Rare", name: "Sawit Plasma Ungu", chance: 7.00, price: 900000000000, color: "#d500f9" },
        { rarity: "Epic", name: "Sawit Cyber Neon", chance: 2.49, price: 3000000000000, color: "#00e5ff" },
        { rarity: "Legendary", name: "Sawit Petir Halilintar", chance: 0.50, price: 12000000000000, color: "#ff3d00", glow: true },
        { rarity: "Mythic", name: "Sawit Overload Core", chance: 0.01, price: 70000000000000, color: "#ff007f", glow: true }
      ]
    },
    {
      id: 9, name: "Gurun Pasir Mistik", reqLevel: 310, reqCoins: 100000000000000,
      skyTop: '#3e2723', skyBot: '#ffb74d', groundColor: '#a17935', grassColor: '#dfb76c', grassAccent: '#f5d78e',
      pathColor: '#b7950b', pathBorder: '#7d6608', trenchColor: '#0277bd', foliage: '#c49a45', foliageDark: '#7d6608',
      foliageLight: '#ffe082', trunkColor: '#6d4c41', ambientGlow: 'rgba(255, 213, 79, 0.08)',
      fruits: [
        { rarity: "Common", name: "Sawit Pasir Hisap", chance: 70.00, price: 5000000000000, color: "#d7ccc8" },
        { rarity: "Uncommon", name: "Sawit Fata Morgana", chance: 20.00, price: 15000000000000, color: "#ffe082" },
        { rarity: "Rare", name: "Sawit Piramida Tua", chance: 7.00, price: 45000000000000, color: "#ffd54f" },
        { rarity: "Epic", name: "Sawit Ankh Mesir", chance: 2.49, price: 150000000000000, color: "#ffb300" },
        { rarity: "Legendary", name: "Sawit Firaun Emas", chance: 0.50, price: 600000000000000, color: "#ffd700", glow: true },
        { rarity: "Mythic", name: "Sawit Solaris Abadi", chance: 0.01, price: 3500000000000000, color: "#ff6d00", glow: true }
      ]
    },
    {
      id: 10, name: "Kebun Mengapung Langit", reqLevel: 400, reqCoins: 2000000000000000,
      skyTop: '#0d47a1', skyBot: '#b3e5fc', groundColor: '#90caf9', grassColor: '#e1f5fe', grassAccent: '#ffffff',
      pathColor: '#81d4fa', pathBorder: '#29b6f6', trenchColor: '#0288d1', foliage: '#e0f7fa', foliageDark: '#80deea',
      foliageLight: '#ffffff', trunkColor: '#78909c', ambientGlow: 'rgba(255, 255, 255, 0.15)',
      fruits: [
        { rarity: "Common", name: "Sawit Awan Aether", chance: 70.00, price: 200000000000000, color: "#eceff1" },
        { rarity: "Uncommon", name: "Sawit Angin Topan", chance: 20.00, price: 600000000000000, color: "#b0bec5" },
        { rarity: "Rare", name: "Sawit Pelangi Surga", chance: 7.00, price: 1800000000000000, color: "#e040fb" },
        { rarity: "Epic", name: "Sawit Celestia Murni", chance: 2.49, price: 6000000000000000, color: "#00e5ff" },
        { rarity: "Legendary", name: "Sawit Sayap Malaikat", chance: 0.50, price: 25000000000000000, color: "#fff59d", glow: true },
        { rarity: "Mythic", name: "Sawit Takhta Langit", chance: 0.01, price: 150000000000000000, color: "#ffffff", glow: true }
      ]
    },
    {
      id: 11, name: "Kepulauan Dimensi Void", reqLevel: 500, reqCoins: 50000000000000000,
      skyTop: '#000000', skyBot: '#4a148c', groundColor: '#0d001a', grassColor: '#1a0033', grassAccent: '#311b92',
      pathColor: '#6a1b9a', pathBorder: '#8e24aa', trenchColor: '#e040fb', foliage: '#ab47bc', foliageDark: '#4a148c',
      foliageLight: '#ea80fc', trunkColor: '#1a0033', ambientGlow: 'rgba(224, 64, 251, 0.12)',
      fruits: [
        { rarity: "Common", name: "Sawit Bayangan Void", chance: 70.00, price: 10000000000000000, color: "#424242" },
        { rarity: "Uncommon", name: "Sawit Distorsi Ruang", chance: 20.00, price: 30000000000000000, color: "#ab47bc" },
        { rarity: "Rare", name: "Sawit Gravitasi Gelap", chance: 7.00, price: 90000000000000000, color: "#6a1b9a" },
        { rarity: "Epic", name: "Sawit Singularity", chance: 2.49, price: 300000000000000000, color: "#ea80fc" },
        { rarity: "Legendary", name: "Sawit Black Hole", chance: 0.50, price: 1200000000000000000, color: "#e040fb", glow: true },
        { rarity: "Mythic", name: "Sawit Chaos Kehampaan", chance: 0.01, price: 8000000000000000000, color: "#b388ff", glow: true }
      ]
    },
    {
      id: 12, name: "Tahta Dewa Sawit", reqLevel: 650, reqCoins: 1000000000000000000,
      skyTop: '#2b1a04', skyBot: '#ffd54f', groundColor: '#2b1e06', grassColor: '#7a5a0f', grassAccent: '#b8860b',
      pathColor: '#ffd700', pathBorder: '#ffb300', trenchColor: '#ffeb3b', foliage: '#ffe082', foliageDark: '#ffb300',
      foliageLight: '#ffffff', trunkColor: '#664d03', ambientGlow: 'rgba(255, 215, 0, 0.20)',
      fruits: [
        { rarity: "Common", name: "Sawit Cahaya Genesis", chance: 70.00, price: 500000000000000000, color: "#fff9c4" },
        { rarity: "Uncommon", name: "Sawit Takdir Kosmik", chance: 20.00, price: 1500000000000000000, color: "#ffd54f" },
        { rarity: "Rare", name: "Sawit Harmoni Alam", chance: 7.00, price: 4500000000000000000, color: "#ffca28" },
        { rarity: "Epic", name: "Sawit Keabadian Dewa", chance: 2.49, price: 15000000000000000000, color: "#ffb300" },
        { rarity: "Legendary", name: "Sawit Omnipotent Gold", chance: 0.50, price: 60000000000000000000, color: "#ffe082", glow: true },
        { rarity: "Mythic", name: "Sawit Maha Pencipta", chance: 0.01, price: 500000000000000000000, color: "#ffffff", glow: true }
      ]
    }
  ];

  // ───────────────────────────────────────────────────────────────────────────
  // 2. KATALOG 9 ALAT PANEN
  // ───────────────────────────────────────────────────────────────────────────
  const TOOLS_DATA = [
    { id: 1, name: "Kapak Batu Tua", tier: "Pulau 1", damage: 10, atkSpeed: 1.0, price: 0, icon: "🪓" },
    { id: 2, name: "Egrek Besi Karatan", tier: "Pulau 1", damage: 25, atkSpeed: 0.9, price: 500, icon: "🗡️" },
    { id: 3, name: "Dodos Baja Tajam", tier: "Pulau 1", damage: 75, atkSpeed: 0.8, price: 2500, icon: "⛏️" },
    { id: 4, name: "Egrek Titanium Turbo", tier: "Pulau 1-2", damage: 200, atkSpeed: 0.7, price: 12000, icon: "⚔️" },
    { id: 5, name: "Egrek Listrik Portable", tier: "Pulau 2-3", damage: 800, atkSpeed: 0.6, price: 75000, icon: "⚡" },
    { id: 6, name: "Kapak Api Volkanik", tier: "Pulau 3-4", damage: 2500, atkSpeed: 0.5, price: 350000, icon: "🔥" },
    { id: 7, name: "Gergaji Mesin Plasma", tier: "Pulau 5-6", damage: 8000, atkSpeed: 0.4, price: 1500000, icon: "⚙️" },
    { id: 8, name: "Egrek Cyberpunk Laser", tier: "Pulau 7-9", damage: 35000, atkSpeed: 0.3, price: 20000000, icon: "🔮" },
    { id: 9, name: "Dodos Dewa Sawit (Mythic)", tier: "Pulau 10-12", damage: 150000, atkSpeed: 0.2, price: 150000000, icon: "👑" }
  ];

  // ───────────────────────────────────────────────────────────────────────────
  // 3. SAWIT ENGINE STATE & BUTTERFLIES
  // ───────────────────────────────────────────────────────────────────────────
  const WORLD_W = 2800;
  const WORLD_H = 2200;

  const sawitState = {
    activeIslandIndex: 0,
    playerLevel: 1,
    playerXp: 0,
    seeds: 15,
    equippedToolId: 1,
    ownedToolIds: [1],
    unlockedIslandIds: [1],
    truckInventory: [],
    truckCapacity: 20,
    rebirthCount: 0,
    chopCooldown: 0,
    swingAnim: 0,
    plots: [],
    particles: [],
    popups: [],
    pksSmoke: [],
    butterflies: [],
    pksGearAngle: 0,
    worldWidth: WORLD_W,
    worldHeight: WORLD_H
  };

  // Inisialisasi kupu-kupu tropis penghias kebun
  function initButterflies() {
    sawitState.butterflies = [];
    const colors = ['#ffd54f', '#81d4fa', '#ff80ab', '#a7ffeb'];
    for (let i = 0; i < 9; i++) {
      sawitState.butterflies.push({
        x: 350 + Math.random() * 1600,
        y: 400 + Math.random() * 1200,
        baseX: 350 + Math.random() * 1600,
        baseY: 400 + Math.random() * 1200,
        color: colors[i % colors.length],
        angle: Math.random() * Math.PI * 2,
        speed: 0.8 + Math.random() * 0.8,
        wingPhase: Math.random() * Math.PI
      });
    }
  }

  // Generate 24 petak tanam terstruktur rapi
  function initPlots(isl) {
    sawitState.plots = [];
    const blockConfigs = [
      { name: 'Blok A (Utara 1)', ox: 420, oy: 450, cols: 3, rows: 2, sx: 250, sy: 210 },
      { name: 'Blok B (Utara 2)', ox: 1220, oy: 450, cols: 3, rows: 2, sx: 250, sy: 210 },
      { name: 'Blok C (Selatan 1)', ox: 420, oy: 1040, cols: 3, rows: 2, sx: 250, sy: 210 },
      { name: 'Blok D (Selatan 2)', ox: 1220, oy: 1040, cols: 3, rows: 2, sx: 250, sy: 210 }
    ];

    let plotId = 1;
    blockConfigs.forEach(b => {
      for (let r = 0; r < b.rows; r++) {
        for (let c = 0; c < b.cols; c++) {
          const px = b.ox + c * b.sx;
          const py = b.oy + r * b.sy;
          const hpMax = 40 + (isl.id - 1) * 350;

          let stage = 'empty';
          if (plotId % 3 === 0) stage = 'mature';
          else if (plotId % 3 === 1) stage = 'growing';
          else stage = 'empty';

          sawitState.plots.push({
            id: plotId++,
            block: b.name,
            x: px,
            y: py,
            stage: stage,
            growTimer: stage === 'seed' ? 5.0 : (stage === 'growing' ? 4.0 : 0),
            maxGrowTimer: 5.0,
            hp: hpMax,
            maxHp: hpMax,
            shake: 0,
            sway: Math.random() * Math.PI * 2,
            fruit: rollFruit(isl)
          });
        }
      }
    });
  }

  function rollFruit(isl) {
    const roll = Math.random() * 100;
    let acc = 0;
    for (let i = 0; i < isl.fruits.length; i++) {
      acc += isl.fruits[i].chance;
      if (roll <= acc || i === isl.fruits.length - 1) return isl.fruits[i];
    }
    return isl.fruits[0];
  }

  function getEquippedTool() {
    return TOOLS_DATA.find(t => t.id === sawitState.equippedToolId) || TOOLS_DATA[0];
  }

  function xpNeeded(lvl) {
    return Math.floor(40 * Math.pow(1.30, lvl - 1));
  }

  function addSawitXp(amount, parentState) {
    sawitState.playerXp += amount;
    const needed = xpNeeded(sawitState.playerLevel);
    if (sawitState.playerXp >= needed) {
      sawitState.playerXp -= needed;
      sawitState.playerLevel++;
      try { if (window.sfx && window.sfx.jump) window.sfx.jump(); } catch (_) {}
      showPopup(parentState.player.x, (parentState.player.y || 800) - 70, `⭐ LEVEL UP! (Lv. ${sawitState.playerLevel})`, '#ffd700');
    }
  }

  function showPopup(x, y, text, color) {
    sawitState.popups.push({ x, y, text, color: color || '#fff', life: 1.25 });
  }

  function spawnParticles(x, y, count, color) {
    for (let i = 0; i < count; i++) {
      sawitState.particles.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 6,
        vy: -2 - Math.random() * 4,
        size: 3 + Math.random() * 4,
        color: color || '#ff9800',
        alpha: 1
      });
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 4. LOGIKA TANAM & PANEN SAWIT 2.5D
  // ───────────────────────────────────────────────────────────────────────────
  function plantSeedInPlot(plot, parentState) {
    if (sawitState.seeds <= 0) {
      if (parentState.showNotification) parentState.showNotification('⚠️ Bibit sawit habis! Beli bibit tambahan di Toko Bibit.');
      return;
    }

    sawitState.seeds--;
    plot.stage = 'seed';
    plot.growTimer = 4.5;
    plot.maxGrowTimer = 4.5;
    plot.fruit = rollFruit(ISLANDS_DATA[sawitState.activeIslandIndex]);

    spawnParticles(plot.x, plot.y, 12, '#8d6e63');
    try { if (window.sfx && window.sfx.step) window.sfx.step(); } catch (_) {}

    showPopup(plot.x, plot.y - 45, '🌱 Bibit Ditanam! (+15 XP)', '#66bb6a');
    addSawitXp(15, parentState);

    if (parentState.showNotification) {
      parentState.showNotification(`🌱 Berhasil menanam bibit sawit di ${plot.block}! Sisa bibit: ${sawitState.seeds}`);
    }

    if (window.MabarNetwork) {
      window.MabarNetwork.sendPlant(plot.id - 1);
    }
  }

  function harvestPalm(plot, parentState) {
    if (sawitState.chopCooldown > 0) return;
    const tool = getEquippedTool();
    sawitState.chopCooldown = tool.atkSpeed;
    sawitState.swingAnim = 0.28;

    plot.hp -= tool.damage;
    plot.shake = 12;
    spawnParticles(plot.x, plot.y - 40, 14, plot.fruit ? plot.fruit.color : '#ff9800');

    try { if (window.sfx && window.sfx.step) window.sfx.step(); } catch (_) {}
    showPopup(plot.x, plot.y - 70, `💥 -${tool.damage}`, '#ff5252');

    if (window.MabarNetwork) {
      window.MabarNetwork.sendChop(plot.id - 1, tool.damage, plot.hp);
    }

    if (plot.hp <= 0) {
      const isl = ISLANDS_DATA[sawitState.activeIslandIndex];
      const droppedFruit = plot.fruit || rollFruit(isl);

      if (sawitState.truckInventory.length < sawitState.truckCapacity) {
        sawitState.truckInventory.push(droppedFruit);
        try { if (window.sfx && window.sfx.vending) window.sfx.vending(); } catch (_) {}
        showPopup(plot.x, plot.y - 95, `✨ +1 ${droppedFruit.name} (+${formatNum(droppedFruit.price)} Koin)`, droppedFruit.color);
        addSawitXp(40, parentState);

        if (parentState.showNotification) {
          parentState.showNotification(`🪓 Panen Sukses! +1 [${droppedFruit.name}] masuk ke Truk (${sawitState.truckInventory.length}/${sawitState.truckCapacity} TBS).`);
        }
      } else {
        if (parentState.showNotification) {
          parentState.showNotification(`⚠️ Truk PENUH (${sawitState.truckCapacity}/${sawitState.truckCapacity} TBS)! Jual ke Pabrik PKS sekarang!`);
        }
      }

      plot.stage = 'harvested';
      plot.growTimer = 5.0;
      plot.maxGrowTimer = 5.0;
      plot.hp = plot.maxHp;
    }
  }

  function sellToPKS(parentState) {
    if (sawitState.truckInventory.length === 0) {
      if (parentState.showNotification) parentState.showNotification('Bak Truk masih kosong! Panen buah sawit dari kebun terlebih dahulu.');
      return;
    }

    const mult = 1 + sawitState.rebirthCount * 1.0;
    let totalCoins = 0;
    sawitState.truckInventory.forEach(f => {
      totalCoins += Math.round(f.price * mult);
    });

    const count = sawitState.truckInventory.length;
    parentState.player.gold = (parentState.player.gold || 0) + totalCoins;
    sawitState.truckInventory = [];

    if (parentState.updateCurrencyUI) parentState.updateCurrencyUI();
    try { if (window.sfx && window.sfx.drink) window.sfx.drink(); } catch (_) {}

    // Pesta koin emas
    for (let i = 0; i < 10; i++) {
      spawnParticles(2120 + (Math.random() - 0.5) * 80, 560 + (Math.random() - 0.5) * 50, 8, '#ffd700');
    }
    showPopup(2120, 520, `💰 +${formatNum(totalCoins)} KOIN DARI PKS!`, '#ffd700');

    if (parentState.showNotification) {
      parentState.showNotification(`🏭 Pabrik PKS berhasil mengolah ${count} TBS! Saldo bertambah +${formatNum(totalCoins)} Koin!`);
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 5. UPDATE LOOP (PERTUMBUHAN TANAMAN, KUPU-KUPU, & PARTIKEL)
  // ───────────────────────────────────────────────────────────────────────────
  function updateSawit(dt, parentState) {
    if (sawitState.chopCooldown > 0) sawitState.chopCooldown -= dt;
    if (sawitState.swingAnim > 0) sawitState.swingAnim -= dt;

    if (window.MabarNetwork) {
      window.MabarNetwork.update(dt);
    }

    // Pertumbuhan tanaman
    sawitState.plots.forEach(pl => {
      if (pl.shake > 0) pl.shake = Math.max(0, pl.shake - dt * 25);

      if (pl.stage === 'seed') {
        pl.growTimer -= dt;
        if (pl.growTimer <= 0) {
          pl.stage = 'growing';
          pl.growTimer = 4.0;
          spawnParticles(pl.x, pl.y - 10, 8, '#4caf50');
        }
      } else if (pl.stage === 'growing') {
        pl.growTimer -= dt;
        if (pl.growTimer <= 0) {
          pl.stage = 'mature';
          pl.hp = pl.maxHp;
          pl.fruit = rollFruit(ISLANDS_DATA[sawitState.activeIslandIndex]);
          spawnParticles(pl.x, pl.y - 30, 12, '#ffd700');
          showPopup(pl.x, pl.y - 60, '🌴 Sawit Siap Panen!', '#ffb300');
        }
      } else if (pl.stage === 'harvested') {
        pl.growTimer -= dt;
        if (pl.growTimer <= 0) {
          pl.stage = 'mature';
          pl.hp = pl.maxHp;
          pl.fruit = rollFruit(ISLANDS_DATA[sawitState.activeIslandIndex]);
        }
      }
    });

    // PKS gear rotation
    sawitState.pksGearAngle += dt * 2.2;

    // Asap cerobong PKS lembut
    if (Math.random() < 0.4) {
      sawitState.pksSmoke.push({
        x: 2210 + (Math.random() - 0.5) * 16,
        y: 350,
        vx: -0.5 + (Math.random() - 0.5) * 0.4,
        vy: -1.6 - Math.random() * 0.8,
        size: 8 + Math.random() * 8,
        alpha: 0.65
      });
    }

    for (let i = sawitState.pksSmoke.length - 1; i >= 0; i--) {
      const s = sawitState.pksSmoke[i];
      s.x += s.vx;
      s.y += s.vy;
      s.size += dt * 7;
      s.alpha -= dt * 0.32;
      if (s.alpha <= 0) sawitState.pksSmoke.splice(i, 1);
    }

    // Gerak kupu-kupu tropis
    sawitState.butterflies.forEach(b => {
      b.angle += (Math.random() - 0.5) * 0.3;
      b.x += Math.cos(b.angle) * b.speed;
      b.y += Math.sin(b.angle) * b.speed;
      b.wingPhase += dt * 14;

      // Kembali jika terlalu jauh dari titik asal
      if (Math.hypot(b.x - b.baseX, b.y - b.baseY) > 160) {
        b.angle = Math.atan2(b.baseY - b.y, b.baseX - b.x);
      }
    });

    // Partikel percikan
    for (let i = sawitState.particles.length - 1; i >= 0; i--) {
      const pt = sawitState.particles[i];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.alpha -= dt * 1.8;
      if (pt.alpha <= 0) sawitState.particles.splice(i, 1);
    }

    // Popups
    for (let i = sawitState.popups.length - 1; i >= 0; i--) {
      const po = sawitState.popups[i];
      po.y -= dt * 24;
      po.life -= dt;
      if (po.life <= 0) sawitState.popups.splice(i, 1);
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 6. PERGERAKAN KARAKTER 2.5D OPEN WORLD
  // ───────────────────────────────────────────────────────────────────────────
  function updatePlayerOpenWorld(dt, p, parentState) {
    let moveX = 0;
    let moveY = 0;

    // Keyboard & Dpad
    if (parentState.keys['a'] || parentState.keys['arrowleft'] || parentState.dpad.left) moveX -= 1;
    if (parentState.keys['d'] || parentState.keys['arrowright'] || parentState.dpad.right) moveX += 1;
    if (parentState.keys['w'] || parentState.keys['arrowup'] || parentState.dpad.up) moveY -= 1;
    if (parentState.keys['s'] || parentState.keys['arrowdown'] || parentState.dpad.down) moveY += 1;

    // Joystick Analog
    if (parentState.analog && parentState.analog.active) {
      moveX = parentState.analog.x;
      moveY = parentState.analog.y;
    }

    // Normalisasi diagonal keyboard
    if (!parentState.analog.active && moveX !== 0 && moveY !== 0) {
      const inv = 0.7071;
      moveX *= inv;
      moveY *= inv;
    }

    const SPEED = 4.4;
    p.vx = moveX * SPEED;
    p.vy = moveY * (SPEED * 0.88);

    if (moveX !== 0 || moveY !== 0) {
      p.isWalking = true;
      p.walkTimer = (p.walkTimer || 0) + dt;
      if (p.walkTimer > 0.12) {
        p.walkTimer = 0;
        p.walkFrame = ((p.walkFrame || 0) + 1) % 6;
      }

      if (moveX !== 0) p.facing = moveX > 0 ? 1 : -1;
      p.back = moveY < -0.25 && Math.abs(moveX) < 0.65;
    } else {
      p.isWalking = false;
      p.walkFrame = 0;
    }

    // Fisika Lompat 2.5D
    if (!p.onGround) {
      p.jumpVy = (p.jumpVy || 0) + 0.58;
      p.jumpY = (p.jumpY || 0) + p.jumpVy;
      if (p.jumpY >= 0) {
        p.jumpY = 0;
        p.jumpVy = 0;
        p.onGround = true;
      }
    }

    p.x += p.vx;
    p.y = (p.y !== undefined ? p.y : 800) + p.vy;

    // Batas peta
    p.x = Math.max(90, Math.min(WORLD_W - 90, p.x));
    p.y = Math.max(140, Math.min(WORLD_H - 140, p.y));

    // Smooth Camera Follow
    const cWidth = parentState.canvas ? parentState.canvas.width : window.innerWidth;
    const cHeight = parentState.canvas ? parentState.canvas.height : window.innerHeight;

    const targetCamX = p.x - cWidth / 2;
    const targetCamY = p.y - cHeight / 2;

    const maxCamX = Math.max(0, WORLD_W - cWidth);
    const maxCamY = Math.max(0, WORLD_H - cHeight);

    parentState.camera.x += (Math.max(0, Math.min(maxCamX, targetCamX)) - parentState.camera.x) * 0.12;
    parentState.camera.y = (parentState.camera.y || 0) + (Math.max(0, Math.min(maxCamY, targetCamY)) - (parentState.camera.y || 0)) * 0.12;

    if (window.MabarNetwork) {
      window.MabarNetwork.sendMove(p, 'sawit_island', getEquippedTool(), sawitState.swingAnim);
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 7. CHECK PROXIMITY ACTION
  // ───────────────────────────────────────────────────────────────────────────
  function checkProximityAction(p, parentState) {
    const px = p.x;
    const py = p.y !== undefined ? p.y : 800;

    // 1. Cek Petak Tanam terdekat dalam radius 80px
    let nearestPlot = null;
    let minDist = 80;

    sawitState.plots.forEach(pl => {
      const d = Math.hypot(pl.x - px, pl.y - py);
      if (d < minDist) {
        minDist = d;
        nearestPlot = pl;
      }
    });

    if (nearestPlot) {
      if (nearestPlot.stage === 'empty') {
        return {
          text: `🌱 Tanam Bibit Sawit (${sawitState.seeds} Bibit Tersedia) [E]`,
          handler: () => plantSeedInPlot(nearestPlot, parentState)
        };
      } else if (nearestPlot.stage === 'seed') {
        return {
          text: `⏳ Kecambah Sedang Tumbuh (${nearestPlot.growTimer.toFixed(1)}s)`,
          handler: () => {}
        };
      } else if (nearestPlot.stage === 'growing') {
        return {
          text: `⏳ Sawit Muda Menghasilkan Buah (${nearestPlot.growTimer.toFixed(1)}s)`,
          handler: () => {}
        };
      } else if (nearestPlot.stage === 'mature') {
        return {
          text: `🪓 Tebas / Panen Sawit (${nearestPlot.hp}/${nearestPlot.maxHp} HP) [E]`,
          handler: () => harvestPalm(nearestPlot, parentState)
        };
      } else if (nearestPlot.stage === 'harvested') {
        return {
          text: `⏳ Tandan Baru Sedang Tumbuh... (${nearestPlot.growTimer.toFixed(1)}s)`,
          handler: () => {}
        };
      }
    }

    // 2. Pabrik PKS & Rampa Timbang Truk (x: 2120, y: 560)
    if (Math.hypot(2120 - px, 560 - py) < 140) {
      const count = sawitState.truckInventory.length;
      let val = 0;
      sawitState.truckInventory.forEach(f => val += f.price);
      return {
        text: `🏭 Bongkar & Jual Sawit ke Pabrik PKS (${count} TBS = ${formatNum(val)} Koin) [E]`,
        handler: () => sellToPKS(parentState)
      };
    }

    // 3. Toko Bibit & Pos Mandor (x: 2120, y: 1160)
    if (Math.hypot(2120 - px, 1160 - py) < 130) {
      return {
        text: `🛒 Toko Bibit & Upgrade Alat Panen [E]`,
        handler: () => openShopModal()
      };
    }

    // 4. Dermaga Ekspedisi 12 Pulau (x: 2120, y: 1760)
    if (Math.hypot(2120 - px, 1760 - py) < 135) {
      return {
        text: `🗺️ Dermaga Ekspedisi 12 Pulau Sawit [E]`,
        handler: () => openIslandsModal()
      };
    }

    // 5. Stasiun Kereta Laut (Pintu Balik ke Shibuya) (x: 140, y: 1040)
    if (Math.hypot(140 - px, 1040 - py) < 120) {
      return {
        text: `🚆 Naik Kereta Kembali ke Kota Shibuya [E]`,
        handler: () => leaveSawit(parentState)
      };
    }

    return null;
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 8. 2.5D HIGH-AESTHETIC RENDERING PIPELINE
  // ───────────────────────────────────────────────────────────────────────────
  function renderSawitIsland(ctx, camX, camY, w, h, parentState) {
    const isl = ISLANDS_DATA[sawitState.activeIslandIndex];

    // 1. Gambar Dasar Tanah Open World yang Indah & Bertekstur
    renderAestheticTerrain(ctx, camX, camY, w, h, isl);

    // 2. Kumpulkan Entitas 2.5D untuk Y-Depth Sorting
    const renderList = [];

    // Pabrik Kelapa Sawit (PKS) 2.5D Modern Industrial
    renderList.push({
      sortY: 560,
      draw: () => drawPabrikPKSEsthetic(ctx, 2120 - camX, 520 - camY)
    });

    // Truk Sawit Colt Diesel 2.5D Detail
    renderList.push({
      sortY: 670,
      draw: () => drawTrukSawitEsthetic(ctx, 1980 - camX, 660 - camY)
    });

    // Toko Bibit & Pos Mandor 2.5D Villa Style
    renderList.push({
      sortY: 1160,
      draw: () => drawTokoBibitEsthetic(ctx, 2120 - camX, 1140 - camY)
    });

    // Dermaga Ekspedisi 12 Pulau 2.5D
    renderList.push({
      sortY: 1760,
      draw: () => drawDermagaEsthetic(ctx, 2120 - camX, 1740 - camY)
    });

    // Stasiun Balik ke Shibuya 2.5D
    renderList.push({
      sortY: 1040,
      draw: () => drawStasiunKeretaEsthetic(ctx, 140 - camX, 1020 - camY)
    });

    // 24 Petak Tanam Sawit 2.5D dengan Pohon Rimbun Indah
    sawitState.plots.forEach(pl => {
      renderList.push({
        sortY: pl.y,
        draw: () => drawPlotEsthetic(ctx, pl, pl.x - camX, pl.y - camY, isl)
      });
    });

    // Karakter 2.5D Pemain
    const p = parentState.player;
    const playerFootY = p.y !== undefined ? p.y : 800;
    renderList.push({
      sortY: playerFootY,
      draw: () => drawPlayer25D(ctx, p, p.x - camX, playerFootY - camY, parentState)
    });

    // Karakter 2.5D Pemain Lain (Mabar Multiplayer)
    if (window.MabarNetwork && window.MabarNetwork.otherPlayers) {
      const others = window.MabarNetwork.otherPlayers;
      for (const id in others) {
        const op = others[id];
        if (op.map === 'sawit_island' || !op.map) {
          const opFootY = op.y !== undefined ? op.y : 800;
          renderList.push({
            sortY: opFootY,
            draw: () => window.MabarNetwork.drawOtherPlayer(ctx, op, op.x - camX, opFootY - camY, parentState)
          });
        }
      }
    }

    // Urutkan dari Y terjauh ke terdekat
    renderList.sort((a, b) => a.sortY - b.sortY);
    renderList.forEach(item => item.draw());

    // 3. Asap Lembut Cerobong Pabrik PKS
    sawitState.pksSmoke.forEach(s => {
      ctx.fillStyle = `rgba(245, 245, 245, ${s.alpha})`;
      ctx.beginPath();
      ctx.arc(s.x - camX, s.y - camY, s.size, 0, Math.PI * 2);
      ctx.fill();
    });

    // 4. Kupu-Kupu Tropis Bergerak
    renderButterflies(ctx, camX, camY);

    // 5. Partikel Percikan Tebasan
    sawitState.particles.forEach(pt => {
      ctx.fillStyle = pt.color;
      ctx.fillRect(Math.round(pt.x - camX), Math.round(pt.y - camY), Math.round(pt.size), Math.round(pt.size));
    });

    // 6. Efek Sun Rays (Sinar Matahari Menerobos Kanopi)
    renderGodRays(ctx, w, h);

    // 7. Floating Text Popups
    ctx.textAlign = 'center';
    sawitState.popups.forEach(po => {
      ctx.save();
      ctx.font = 'bold 13px "Outfit", sans-serif';
      ctx.fillStyle = '#060911';
      ctx.fillText(po.text, po.x - camX + 1, po.y - camY + 1);
      ctx.fillStyle = po.color;
      ctx.fillText(po.text, po.x - camX, po.y - camY);
      ctx.restore();
    });
    ctx.textAlign = 'left';

    // 8. Top HUD Bar Elegan
    renderOpenWorldHUD(ctx, w, h, isl);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 9. HIGH-AESTHETIC TERRAIN & ENVIRONMENT
  // ───────────────────────────────────────────────────────────────────────────
  // ───────────────────────────────────────────────────────────────────────────
  // 9. HIGH-AESTHETIC TERRAIN & ENVIRONMENT (HD-2D TROPICAL ESTATE)
  // ───────────────────────────────────────────────────────────────────────────
  function renderAestheticTerrain(ctx, camX, camY, w, h, isl) {
    // 1. Dasar tanah berlapis tekstur kaya (Rich Tropical Soil & Lawn)
    const groundGrad = ctx.createLinearGradient(0, 0, 0, h);
    groundGrad.addColorStop(0, isl.groundColor);
    groundGrad.addColorStop(0.5, shadeColor(isl.groundColor, -12));
    groundGrad.addColorStop(1, shadeColor(isl.groundColor, -25));
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, 0, w, h);

    // Pola rumput subur dengan lajur bergradien (Lawn Mower Bands)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.025)';
    for (let gy = 0; gy < WORLD_H; gy += 64) {
      const sy = gy - camY;
      if (sy + 64 > 0 && sy < h) {
        ctx.fillRect(0, sy, w, 32);
      }
    }

    // 2. Parit Drainase Utama (Deep Estate Canal with Flowing Water & Caustics)
    const trenchX = 1880 - camX;
    if (trenchX + 60 > 0 && trenchX - 20 < w) {
      // Dinding tanggul parit batu alam
      ctx.fillStyle = '#263238';
      ctx.fillRect(trenchX - 6, 0 - camY, 48, WORLD_H);
      ctx.fillStyle = '#37474f';
      ctx.fillRect(trenchX - 3, 0 - camY, 42, WORLD_H);

      // Air jernih bergradien dalam (Emerald-Cyan Deep Canal)
      const waterGrad = ctx.createLinearGradient(trenchX, 0, trenchX + 36, 0);
      waterGrad.addColorStop(0, '#004d40');
      waterGrad.addColorStop(0.3, '#00695c');
      waterGrad.addColorStop(0.7, '#00897b');
      waterGrad.addColorStop(1, '#004d40');
      ctx.fillStyle = waterGrad;
      ctx.fillRect(trenchX, 0 - camY, 36, WORLD_H);

      // Riak gelombang dan pantulan cahaya air mengalir (Water Caustics)
      const waveTime = Date.now() * 0.0025;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 1.6;
      for (let wy = (waveTime * 35) % 60; wy < WORLD_H; wy += 48) {
        const sy = wy - camY;
        if (sy > -20 && sy < h + 20) {
          ctx.beginPath();
          ctx.moveTo(trenchX + 4, sy);
          ctx.bezierCurveTo(trenchX + 12, sy - 5, trenchX + 24, sy + 5, trenchX + 32, sy);
          ctx.stroke();

          // Kilau riak sekunder
          ctx.fillStyle = 'rgba(178, 235, 242, 0.25)';
          ctx.beginPath();
          ctx.arc(trenchX + 18, sy + 6, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Teratai air mengapung di parit (Water Lilies)
      for (let ly = 120; ly < WORLD_H; ly += 380) {
        const lsy = ly - camY;
        if (lsy > -20 && lsy < h + 20) {
          // Daun teratai hijau
          ctx.fillStyle = '#2e7d32';
          ctx.beginPath();
          ctx.arc(trenchX + 16, lsy, 7, 0.4, Math.PI * 1.9);
          ctx.fill();
          // Bunga teratai merah muda mekar
          ctx.fillStyle = '#f48fb1';
          ctx.beginPath();
          ctx.arc(trenchX + 16, lsy, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // 3. Jalan Utama Perkebunan (Laterite Red Gravel Road with Realistic Tire Tracks)
    const roadX = 1916 - camX;
    if (roadX + 180 > 0 && roadX - 30 < w) {
      const roadGrad = ctx.createLinearGradient(roadX, 0, roadX + 150, 0);
      roadGrad.addColorStop(0, isl.pathBorder);
      roadGrad.addColorStop(0.08, isl.pathColor);
      roadGrad.addColorStop(0.5, shadeColor(isl.pathColor, 12));
      roadGrad.addColorStop(0.92, isl.pathColor);
      roadGrad.addColorStop(1, isl.pathBorder);
      ctx.fillStyle = roadGrad;
      ctx.fillRect(roadX, 0 - camY, 150, WORLD_H);

      // Jejak alur roda ban truk ganda (Realistic Tread Ruts)
      ctx.fillStyle = 'rgba(20, 10, 5, 0.28)';
      ctx.fillRect(roadX + 24, 0 - camY, 20, WORLD_H);
      ctx.fillRect(roadX + 104, 0 - camY, 20, WORLD_H);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.fillRect(roadX + 44, 0 - camY, 2, WORLD_H);
      ctx.fillRect(roadX + 124, 0 - camY, 2, WORLD_H);
    }

    // Jalan penghubung lateral antar blok
    [740, 1340].forEach(ry => {
      const sry = ry - camY;
      if (sry + 85 > 0 && sry < h) {
        const hRoadGrad = ctx.createLinearGradient(0, sry, 0, sry + 85);
        hRoadGrad.addColorStop(0, isl.pathBorder);
        hRoadGrad.addColorStop(0.12, isl.pathColor);
        hRoadGrad.addColorStop(0.88, isl.pathColor);
        hRoadGrad.addColorStop(1, isl.pathBorder);
        ctx.fillStyle = hRoadGrad;
        ctx.fillRect(120 - camX, sry, 1800, 85);

        // Jejak ban horizontal
        ctx.fillStyle = 'rgba(20, 10, 5, 0.22)';
        ctx.fillRect(120 - camX, sry + 18, 1800, 14);
        ctx.fillRect(120 - camX, sry + 54, 1800, 14);
      }
    });

    // 4. Empat Blok Kebun Sawit Utama (Blok A, B, C, D) dengan Lanskap Indah
    [
      { x: 280, y: 320, w: 820, h: 390, label: '🌴 BLOK A • KEBUN UTARA 1' },
      { x: 1140, y: 320, w: 740, h: 390, label: '🌴 BLOK B • KEBUN UTARA 2' },
      { x: 280, y: 920, w: 820, h: 390, label: '🌴 BLOK C • KEBUN SELATAN 1' },
      { x: 1140, y: 920, w: 740, h: 390, label: '🌴 BLOK D • KEBUN SELATAN 2' }
    ].forEach(b => {
      const bx = b.x - camX, by = b.y - camY;
      if (bx + b.w < 0 || bx > w || by + b.h < 0 || by > h) return;

      // Bayangan tepi blok kebun
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      roundRect(ctx, bx + 5, by + 5, b.w, b.h, 16);
      ctx.fill();

      // Hamparan rumput bergradien mewah (Lush Emerald Turf)
      const grassGrad = ctx.createLinearGradient(bx, by, bx, by + b.h);
      grassGrad.addColorStop(0, isl.grassAccent);
      grassGrad.addColorStop(0.5, isl.grassColor);
      grassGrad.addColorStop(1, shadeColor(isl.grassColor, -15));
      ctx.fillStyle = grassGrad;
      roundRect(ctx, bx, by, b.w, b.h, 16);
      ctx.fill();

      // Border batu kapur putih penanda kebun profesional (Estate Stone Curbing)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 3;
      roundRect(ctx, bx, by, b.w, b.h, 16);
      ctx.stroke();

      // Pagar kayu keliling estetis
      ctx.strokeStyle = '#5d4037';
      ctx.lineWidth = 1.5;
      roundRect(ctx, bx + 6, by + 6, b.w - 12, b.h - 12, 12);
      ctx.stroke();

      // Rumpun bunga tropis liar beraneka warna (Lush Tropical Wildflowers)
      const flowerTime = Date.now() * 0.002;
      for (let fi = 0; fi < 14; fi++) {
        const fx = bx + 45 + (fi * 115) % (b.w - 90);
        const fy = by + 35 + ((fi * 65) % (b.h - 70));
        const swayFlower = Math.sin(flowerTime + fi) * 1.5;

        // Tangkai hijau
        ctx.strokeStyle = '#2e7d32';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(fx, fy);
        ctx.lineTo(fx + swayFlower, fy - 6);
        ctx.stroke();

        // Kelopak bunga cerah
        const colors = ['#ff4081', '#ffca28', '#ab47bc', '#ffffff', '#ff7043'];
        ctx.fillStyle = colors[fi % colors.length];
        ctx.beginPath();
        ctx.arc(fx + swayFlower, fy - 7, 2.5, 0, Math.PI * 2);
        ctx.fill();
        // Titik benang sari
        ctx.fillStyle = '#ffe082';
        ctx.beginPath();
        ctx.arc(fx + swayFlower, fy - 7, 1, 0, Math.PI * 2);
        ctx.fill();
      }

      // Plang Nama Blok Elegan Kayu Jati
      ctx.fillStyle = 'rgba(26, 18, 12, 0.85)';
      roundRect(ctx, bx + 20, by + 18, 195, 26, 6);
      ctx.fill();
      ctx.strokeStyle = '#d7ccc8';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#a5d6a7';
      ctx.font = 'bold 11px "Outfit", sans-serif';
      ctx.fillText(b.label, bx + 32, by + 35);
    });

    // Jembatan kayu lengkung kokoh di atas parit (Arched Timber Canal Bridges)
    [760, 1360].forEach(jy => {
      const bridgeY = jy - camY;
      if (bridgeY + 60 > 0 && bridgeY < h) {
        // Balok penopang jembatan
        ctx.fillStyle = '#3e2723';
        ctx.fillRect(trenchX - 12, bridgeY, 60, 52);

        // Papan dek jembatan melengkung
        for (let py = bridgeY + 2; py < bridgeY + 50; py += 10) {
          const woodGrad = ctx.createLinearGradient(trenchX - 12, py, trenchX + 48, py);
          woodGrad.addColorStop(0, '#5d4037');
          woodGrad.addColorStop(0.5, '#8d6e63');
          woodGrad.addColorStop(1, '#4e342e');
          ctx.fillStyle = woodGrad;
          ctx.fillRect(trenchX - 10, py, 56, 8);
        }

        // Pagar pegangan jembatan dengan tiang lentera
        ctx.fillStyle = '#a1887f';
        ctx.fillRect(trenchX - 12, bridgeY - 6, 60, 6);
        ctx.fillRect(trenchX - 12, bridgeY + 50, 60, 6);

        // Lentera kuningan di tiang jembatan
        [-8, 44].forEach(lx => {
          ctx.fillStyle = '#ffd54f';
          ctx.beginPath();
          ctx.arc(trenchX + lx, bridgeY - 3, 3.5, 0, Math.PI * 2);
          ctx.fill();
        });
      }
    });
  }

  // Efek Sinar Matahari Menerobos Kanopi (Volumetric Golden God Rays & Floating Dust Motes)
  function renderGodRays(ctx, w, h) {
    ctx.save();
    // Berkas cahaya matahari diagonal
    const rayGrad = ctx.createLinearGradient(0, 0, w, h);
    rayGrad.addColorStop(0, 'rgba(255, 248, 200, 0.12)');
    rayGrad.addColorStop(0.35, 'rgba(255, 235, 160, 0.06)');
    rayGrad.addColorStop(0.7, 'rgba(255, 255, 255, 0.02)');
    rayGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = rayGrad;
    ctx.fillRect(0, 0, w, h);

    // Butiran spora/debu keemasan melayang di udara (Golden Spores / Dust Motes)
    const sporeTime = Date.now() * 0.0012;
    ctx.fillStyle = 'rgba(255, 245, 180, 0.35)';
    for (let si = 0; si < 24; si++) {
      const spX = ((si * 137.5) + sporeTime * 14) % w;
      const spY = ((si * 89.3) + Math.sin(sporeTime + si) * 22) % h;
      const spR = 1 + (si % 3) * 0.8;
      ctx.beginPath();
      ctx.arc(spX, spY, spR, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // Kupu-kupu Tropis Hidup & Animatif
  function renderButterflies(ctx, camX, camY) {
    sawitState.butterflies.forEach(b => {
      const sx = b.x - camX;
      const sy = b.y - camY;
      const wingW = Math.cos(b.wingPhase) * 6;

      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(b.angle);

      // Bayangan kupu-kupu di tanah
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.beginPath();
      ctx.ellipse(0, 10, Math.abs(wingW) * 0.8, 3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Sayap anggun bergradien
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.ellipse(-wingW, 0, Math.abs(wingW), 5, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(wingW, 0, Math.abs(wingW), 5, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Corak sayap hitam
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Tubuh & antena
      ctx.fillStyle = '#212121';
      ctx.fillRect(-1, -4, 2, 8);
      ctx.restore();
    });
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 10. POHON KELAPA SAWIT HD MASTERPIECE & PETAK TANAM
  // ───────────────────────────────────────────────────────────────────────────
  function drawPlotEsthetic(ctx, plot, sx, sy, isl) {
    ctx.save();
    if (plot.shake > 0) {
      sx += (Math.random() - 0.5) * plot.shake;
      sy += (Math.random() - 0.5) * plot.shake;
    }

    // 1. Bayangan Lembut Berlapis di Tanah (Soft Volumetric Ambient Occlusion)
    const shadowGrad = ctx.createRadialGradient(sx + 12, sy + 8, 10, sx + 12, sy + 8, 52);
    shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.55)');
    shadowGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.25)');
    shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = shadowGrad;
    ctx.beginPath();
    ctx.ellipse(sx + 12, sy + 8, 52, 22, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Bedengan Tanah Subur (Fertile Organic Compost Mound with Stone Edge)
    const bedGrad = ctx.createRadialGradient(sx, sy, 6, sx, sy, 42);
    bedGrad.addColorStop(0, '#1a0e07');
    bedGrad.addColorStop(0.5, '#351c0d');
    bedGrad.addColorStop(0.85, '#231309');
    bedGrad.addColorStop(1, '#150a04');
    ctx.fillStyle = bedGrad;
    ctx.beginPath();
    ctx.ellipse(sx, sy, 42, 22, 0, 0, Math.PI * 2);
    ctx.fill();

    // Batas cincin batu piringan sawit rapi (Clean Palm Weeding Circle)
    ctx.strokeStyle = plot.stage === 'empty' ? 'rgba(129, 199, 132, 0.9)' : 'rgba(109, 76, 65, 0.85)';
    ctx.lineWidth = plot.stage === 'empty' ? 3 : 2;
    ctx.stroke();

    if (plot.stage === 'empty') {
      // Lubang tanam gembur siap bibit
      ctx.fillStyle = '#0a0502';
      ctx.beginPath();
      ctx.ellipse(sx, sy, 18, 9, 0, 0, Math.PI * 2);
      ctx.fill();

      // Sekop baja mengkilap tertancap di gundukan
      const shovelGrad = ctx.createLinearGradient(sx + 12, sy - 28, sx + 20, sy - 14);
      shovelGrad.addColorStop(0, '#ffffff');
      shovelGrad.addColorStop(0.5, '#b0bec5');
      shovelGrad.addColorStop(1, '#455a64');
      ctx.fillStyle = shovelGrad;
      ctx.fillRect(sx + 12, sy - 24, 7, 14);

      // Gagang kayu sekop
      ctx.fillStyle = '#8d6e63';
      ctx.fillRect(sx + 14, sy - 38, 3, 16);
      ctx.fillStyle = '#d7ccc8';
      ctx.fillRect(sx + 12, sy - 40, 7, 3);

      // Beacon penanda siap tanam bercahaya berputar
      const bTime = Date.now() * 0.003;
      ctx.strokeStyle = '#81c784';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([5, 5]);
      ctx.lineDashOffset = -bTime * 15;
      ctx.beginPath();
      ctx.arc(sx, sy, 26, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Label hologram penanda
      ctx.fillStyle = 'rgba(10, 25, 14, 0.85)';
      roundRect(ctx, sx - 48, sy + 26, 96, 20, 5);
      ctx.fill();
      ctx.strokeStyle = '#81c784';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#c8e6c9';
      ctx.font = 'bold 10px "Outfit", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🌱 SIAP TANAM', sx, sy + 40);

    } else if (plot.stage === 'seed') {
      // Polibag hitam pembibitan sawit resmi (Official Nursery Polybag)
      const bagGrad = ctx.createLinearGradient(sx - 11, sy - 24, sx + 11, sy);
      bagGrad.addColorStop(0, '#37474f');
      bagGrad.addColorStop(0.6, '#212121');
      bagGrad.addColorStop(1, '#121212');
      ctx.fillStyle = bagGrad;
      roundRect(ctx, sx - 11, sy - 22, 22, 22, 3);
      ctx.fill();

      // Lubang drainase polibag & tanah gembur
      ctx.fillStyle = '#3e2723';
      ctx.beginPath();
      ctx.ellipse(sx, sy - 21, 9, 3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Tunas muda hijau segar dengan embun pagi (Dewy Fresh Sprout)
      ctx.fillStyle = '#4caf50';
      ctx.fillRect(sx - 2, sy - 34, 4, 14);
      // Sepasang daun pertama melengkung anggun
      ctx.beginPath();
      ctx.ellipse(sx - 9, sy - 32, 9, 5, -0.45, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(sx + 9, sy - 32, 9, 5, 0.45, 0, Math.PI * 2);
      ctx.fill();

      // Kilau embun
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(sx - 8, sy - 34, 2, 2);

      // Progress bar pertumbuhan modern
      drawAestheticProgress(ctx, sx, sy - 46, (plot.maxGrowTimer - plot.growTimer) / plot.maxGrowTimer, '#66bb6a');

    } else if (plot.stage === 'growing') {
      // Sawit remaja (TBM - Tanaman Belum Menghasilkan)
      const trunkGrad = ctx.createLinearGradient(sx - 10, 0, sx + 10, 0);
      trunkGrad.addColorStop(0, '#4e342e');
      trunkGrad.addColorStop(0.4, '#795548');
      trunkGrad.addColorStop(0.7, '#8d6e63');
      trunkGrad.addColorStop(1, '#3e2723');
      ctx.fillStyle = trunkGrad;

      // Batang meruncing ke atas
      ctx.beginPath();
      ctx.moveTo(sx - 7, sy - 54);
      ctx.lineTo(sx + 7, sy - 54);
      ctx.lineTo(sx + 10, sy - 2);
      ctx.lineTo(sx - 10, sy - 2);
      ctx.closePath();
      ctx.fill();

      // Pelepah-pelepah muda melengkung anggun
      for (let i = -3; i <= 3; i++) {
        const pFrondTime = Date.now() * 0.002 + i;
        const pSway = Math.sin(pFrondTime) * 3;
        ctx.strokeStyle = i % 2 === 0 ? isl.foliageLight : isl.foliage;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(sx, sy - 50);
        ctx.quadraticCurveTo(sx + i * 22, sy - 78, sx + i * 42 + pSway, sy - 60);
        ctx.stroke();
      }

      drawAestheticProgress(ctx, sx, sy - 84, (plot.maxGrowTimer - plot.growTimer) / plot.maxGrowTimer, '#ffd54f');

    } else if (plot.stage === 'mature' || plot.stage === 'harvested') {
      // ───────────────────────────────────────────────────────────────────────
      // POHON KELAPA SAWIT DEWASA INDAH (LUSH 3D ORGANIC PALM CANOPY)
      // ───────────────────────────────────────────────────────────────────────
      const trunkH = 112;
      const trunkTopY = sy - trunkH;

      // Batang Kelapa Sawit Bertekstur Silinder 3D
      const trunkGrad = ctx.createLinearGradient(sx - 16, 0, sx + 16, 0);
      trunkGrad.addColorStop(0, '#3e2723');
      trunkGrad.addColorStop(0.2, '#6d4c41');
      trunkGrad.addColorStop(0.5, '#8d6e63');
      trunkGrad.addColorStop(0.85, '#5d4037');
      trunkGrad.addColorStop(1, '#2c1911');
      ctx.fillStyle = trunkGrad;

      // Siluet batang alami (Sedikit melebar di pangkal bawah / root flare)
      ctx.beginPath();
      ctx.moveTo(sx - 11, trunkTopY);
      ctx.lineTo(sx + 11, trunkTopY);
      ctx.lineTo(sx + 16, sy - 2);
      ctx.lineTo(sx - 16, sy - 2);
      ctx.closePath();
      ctx.fill();

      // Pola Belah Ketupat Sisik Bekas Pangkasan Pelepah (Diamond Bark Scale Phyllotaxis)
      for (let by = trunkTopY + 12; by < sy - 8; by += 12) {
        const rowScale = 1 + (by - trunkTopY) / trunkH * 0.35;
        const wSpan = 11 * rowScale;

        // Bayangan bawah sisik
        ctx.fillStyle = 'rgba(25, 12, 6, 0.65)';
        ctx.beginPath();
        ctx.moveTo(sx - wSpan, by);
        ctx.lineTo(sx, by + 6);
        ctx.lineTo(sx + wSpan, by);
        ctx.lineTo(sx, by + 3);
        ctx.closePath();
        ctx.fill();

        // Highlight keemasan di bibir pelepah terpotong
        ctx.fillStyle = 'rgba(215, 204, 200, 0.4)';
        ctx.beginPath();
        ctx.moveTo(sx - wSpan, by);
        ctx.lineTo(sx, by - 4);
        ctx.lineTo(sx + wSpan, by);
        ctx.lineTo(sx, by - 2);
        ctx.closePath();
        ctx.fill();
      }

      // Pakis Sarang Burung / Lumut Epifit Menempel di Batang (Epiphytic Trunk Ferns)
      ctx.fillStyle = '#388e3c';
      for (let fi = -1; fi <= 1; fi += 2) {
        ctx.beginPath();
        ctx.ellipse(sx + fi * 11, trunkTopY + 45, 7, 12, fi * 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#66bb6a';
        ctx.beginPath();
        ctx.ellipse(sx + fi * 11, trunkTopY + 45, 4, 8, fi * 0.4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Kerah sabut/ijuk hitam pelindung mahkota pohon (Fibrous Palm Collar)
      ctx.fillStyle = '#2d1810';
      ctx.beginPath();
      ctx.ellipse(sx, trunkTopY + 4, 15, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      // ───────────────────────────────────────────────────────────────────────
      // LAYER 1: PELEPAH BELAKANG (REAR FRONDS - DEEP SHADOW LAYER)
      // ───────────────────────────────────────────────────────────────────────
      const windTime = Date.now() * 0.0022 + plot.sway;
      const frondAngles = [-2.4, -2.0, -1.5, -1.0, -0.6, 0.6, 1.0, 1.5, 2.0, 2.4];

      frondAngles.forEach((angle, idx) => {
        if (Math.abs(angle) > 1.2) {
          const sway = Math.sin(windTime + idx) * 8;
          const reach = 88;
          const endX = sx + Math.sin(angle) * reach + sway;
          const endY = trunkTopY - Math.cos(angle) * reach * 0.65;

          // Tulang pelepah belakang gelap
          ctx.strokeStyle = isl.foliageDark;
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.moveTo(sx, trunkTopY);
          ctx.quadraticCurveTo(sx + Math.sin(angle) * 45, trunkTopY - 45, endX, endY);
          ctx.stroke();

          // Helai daun menyirip (Feathery Pinnate Leaflets)
          ctx.strokeStyle = isl.foliageDark;
          ctx.lineWidth = 3;
          for (let t = 0.25; t <= 1.0; t += 0.12) {
            const lx = sx + (endX - sx) * t;
            const ly = trunkTopY + (endY - trunkTopY) * t;
            ctx.beginPath();
            ctx.moveTo(lx, ly);
            ctx.lineTo(lx - 16 * Math.cos(angle), ly + 14);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(lx, ly);
            ctx.lineTo(lx + 16 * Math.cos(angle), ly + 14);
            ctx.stroke();
          }
        }
      });

      // ───────────────────────────────────────────────────────────────────────
      // TANDAN BUAH SEGAR (TBS) BERGERIGI DENGAN KILAU MINYAK SAWIT SEGAR
      // ───────────────────────────────────────────────────────────────────────
      if (plot.stage === 'mature' && plot.fruit) {
        const fCol = plot.fruit.color;
        const isMythic = plot.fruit.glow;

        if (isMythic) {
          ctx.shadowColor = fCol;
          ctx.shadowBlur = 24;
        }

        // Sepasang tandan buah lebat di ketiak pelepah
        [-1, 1].forEach(side => {
          const tbsX = sx + side * 15;
          const tbsY = trunkTopY + 12;

          // Bayangan tandan buah
          ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
          ctx.beginPath();
          ctx.ellipse(tbsX, tbsY + 6, 14, 10, 0, 0, Math.PI * 2);
          ctx.fill();

          // Dasar tandan buah berbentuk oval cembung
          const fruitGrad = ctx.createRadialGradient(tbsX, tbsY - 2, 2, tbsX, tbsY, 15);
          fruitGrad.addColorStop(0, '#ffa726');
          fruitGrad.addColorStop(0.5, fCol);
          fruitGrad.addColorStop(0.9, '#bf360c');
          fruitGrad.addColorStop(1, '#3e1008');
          ctx.fillStyle = fruitGrad;
          ctx.beginPath();
          ctx.ellipse(tbsX, tbsY, 14, 12, side * 0.15, 0, Math.PI * 2);
          ctx.fill();

          // Puluhan butiran brondolan buah sawit berduri dengan kilau minyak
          ctx.fillStyle = '#ffcc80';
          for (let bi = 0; bi < 9; bi++) {
            const ox = (bi % 3 - 1) * 6;
            const oy = (Math.floor(bi / 3) - 1) * 5;
            ctx.beginPath();
            ctx.arc(tbsX + ox, tbsY + oy, 3, 0, Math.PI * 2);
            ctx.fill();
            // Kilau putih specular
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(tbsX + ox - 1, tbsY + oy - 1, 1.5, 1.5);
            ctx.fillStyle = '#ffcc80';
          }
        });

        ctx.shadowBlur = 0;

        // Health bar HP Sawit Modern
        if (plot.hp < plot.maxHp) {
          const barW = 60;
          ctx.fillStyle = 'rgba(9, 14, 26, 0.9)';
          roundRect(ctx, sx - barW / 2, trunkTopY - 32, barW, 8, 4);
          ctx.fill();
          ctx.strokeStyle = '#37474f';
          ctx.lineWidth = 1;
          ctx.stroke();

          // Bar merah berkilau
          const hpGrad = ctx.createLinearGradient(sx - barW / 2, 0, sx + barW / 2, 0);
          hpGrad.addColorStop(0, '#e53935');
          hpGrad.addColorStop(1, '#ff7043');
          ctx.fillStyle = hpGrad;
          roundRect(ctx, sx - barW / 2 + 1, trunkTopY - 31, (barW - 2) * (plot.hp / plot.maxHp), 6, 3);
          ctx.fill();
        }
      }

      // ───────────────────────────────────────────────────────────────────────
      // LAYER 2: PELEPAH DEPAN & MAHKOTA KANOPY (LUSH FOREGROUND FRONDS)
      // ───────────────────────────────────────────────────────────────────────
      frondAngles.forEach((angle, idx) => {
        const sway = Math.sin(windTime + idx * 1.2) * 9;
        const reach = 94;
        const endX = sx + Math.sin(angle) * reach + sway;
        const endY = trunkTopY - Math.cos(angle) * reach * 0.72 + Math.abs(Math.sin(angle)) * 14;

        // Tulang pelepah utama hijau zamrud
        ctx.strokeStyle = isl.foliage;
        ctx.lineWidth = 5.5;
        ctx.beginPath();
        ctx.moveTo(sx, trunkTopY + 2);
        ctx.quadraticCurveTo(sx + Math.sin(angle) * 48, trunkTopY - 52, endX, endY);
        ctx.stroke();

        // Punggung pelepah terkena sinar mentari (Sunlit Leaf Ridge)
        ctx.strokeStyle = isl.foliageLight;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(sx, trunkTopY + 2);
        ctx.quadraticCurveTo(sx + Math.sin(angle) * 46, trunkTopY - 50, endX, endY);
        ctx.stroke();

        // Anak daun menyirip rimbun penuh (Dense Pinnate Blades)
        ctx.strokeStyle = isl.foliage;
        ctx.lineWidth = 2.8;
        for (let t = 0.2; t <= 1.0; t += 0.1) {
          const lx = sx + (endX - sx) * t;
          const ly = trunkTopY + (endY - trunkTopY) * t;
          const leafSpread = 16 + t * 6;

          ctx.beginPath();
          ctx.moveTo(lx, ly);
          ctx.lineTo(lx - leafSpread * Math.cos(angle), ly + 18);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(lx, ly);
          ctx.lineTo(lx + leafSpread * Math.cos(angle), ly + 18);
          ctx.stroke();
        }
      });

      // Pucuk daun pupus tegak di tengah (Emerging Spear Leaf)
      ctx.fillStyle = '#c5e1a5';
      ctx.beginPath();
      ctx.moveTo(sx - 3, trunkTopY);
      ctx.lineTo(sx + 3, trunkTopY);
      ctx.lineTo(sx, trunkTopY - 42 + Math.sin(windTime) * 3);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }

  function drawAestheticProgress(ctx, x, y, ratio, color) {
    const w = 46, h = 7;
    ctx.fillStyle = 'rgba(9, 14, 26, 0.9)';
    roundRect(ctx, x - w / 2, y, w, h, 3.5);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = color;
    roundRect(ctx, x - w / 2 + 1, y + 1, (w - 2) * Math.min(1, Math.max(0, ratio)), h - 2, 2.5);
    ctx.fill();
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 11. BANGUNAN TOKO BIBIT & POS MANDOR (LUXURY ESTATE LODGE & GLASSHOUSE)
  // ───────────────────────────────────────────────────────────────────────────
  function drawTokoBibitEsthetic(ctx, x, y) {
    ctx.save();

    // 1. Bayangan Lembut Bangunan di Tanah
    const shadowGrad = ctx.createRadialGradient(x, y + 20, 20, x, y + 20, 115);
    shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.45)');
    shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = shadowGrad;
    ctx.beginPath();
    ctx.ellipse(x, y + 20, 115, 30, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Fondasi Batu Kali Alami Bertingkat (River Stone Masonry Plinth)
    ctx.fillStyle = '#37474f';
    roundRect(ctx, x - 100, y - 8, 200, 28, 4);
    ctx.fill();
    ctx.fillStyle = '#455a64';
    for (let rx = -96; rx < 96; rx += 18) {
      ctx.fillRect(x + rx, y - 6, 15, 8);
      ctx.fillRect(x + rx + 8, y + 4, 15, 8);
    }

    // 3. Dek Kayu Ulin Veranda Teras Luas (Ironwood Veranda Deck)
    const deckGrad = ctx.createLinearGradient(0, y - 16, 0, y + 6);
    deckGrad.addColorStop(0, '#5d4037');
    deckGrad.addColorStop(0.5, '#795548');
    deckGrad.addColorStop(1, '#4e342e');
    ctx.fillStyle = deckGrad;
    ctx.fillRect(x - 96, y - 16, 192, 14);

    // Garis sambungan papan dek
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    for (let px = -90; px < 90; px += 16) {
      ctx.fillRect(x + px, y - 16, 1.5, 14);
    }

    // Pagar pembatas kayu berukir (Carved Balustrade Railings)
    ctx.fillStyle = '#8d6e63';
    ctx.fillRect(x - 96, y - 32, 192, 4);
    for (let bx = -92; bx < 92; bx += 14) {
      ctx.fillRect(x + bx, y - 32, 3, 16);
    }

    // 4. Dinding Utama Kayu Cedar Tropis (Cedar Lap-Siding Manor)
    const wallGrad = ctx.createLinearGradient(x - 85, y - 105, x + 85, y - 16);
    wallGrad.addColorStop(0, '#a1887f');
    wallGrad.addColorStop(0.4, '#8d6e63');
    wallGrad.addColorStop(1, '#5d4037');
    ctx.fillStyle = wallGrad;
    ctx.fillRect(x - 85, y - 105, 170, 90);

    // Garis tekstur kayu papan dinding
    ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
    for (let wy = y - 100; wy < y - 16; wy += 9) {
      ctx.fillRect(x - 85, wy, 170, 1.5);
    }

    // 5. Rumah Kaca Pembibitan Samping Kiri (Victorian Glasshouse Conservatory)
    ctx.fillStyle = 'rgba(178, 235, 242, 0.75)';
    ctx.fillRect(x - 80, y - 96, 75, 78);
    // Rangka baja putih rumah kaca
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(x - 80, y - 96, 75, 78);
    // Kaca silang & lengkung kubah
    ctx.beginPath();
    ctx.moveTo(x - 80, y - 96); ctx.lineTo(x - 5, y - 18);
    ctx.moveTo(x - 5, y - 96); ctx.lineTo(x - 80, y - 18);
    ctx.stroke();

    // Rak bertingkat di dalam rumah kaca dengan lampu grow-light ungu/emas
    ctx.fillStyle = 'rgba(255, 179, 0, 0.35)';
    ctx.fillRect(x - 76, y - 88, 67, 18);
    ctx.fillRect(x - 76, y - 56, 67, 18);

    // Deretan bibit polibag hijau unggul di dalam rumah kaca
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 4; c++) {
        ctx.fillStyle = '#2e7d32';
        ctx.beginPath();
        ctx.arc(x - 68 + c * 17, y - 72 + r * 30, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#81c784';
        ctx.beginPath();
        ctx.arc(x - 68 + c * 17, y - 73 + r * 30, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 6. Pintu Masuk Kayu Klasik & Jendela Kaca Hangat Bercahaya
    // Pintu berpanel jati
    ctx.fillStyle = '#3e2723';
    ctx.fillRect(x + 16, y - 82, 34, 66);
    ctx.fillStyle = '#ffd700'; // Gagang pintu kuningan
    ctx.fillRect(x + 19, y - 50, 4, 4);

    // Jendela kaca hangat lantai dua
    const winGrad = ctx.createLinearGradient(x + 20, y - 75, x + 46, y - 45);
    winGrad.addColorStop(0, '#ffe082');
    winGrad.addColorStop(1, '#ffb300');
    ctx.fillStyle = winGrad;
    ctx.fillRect(x + 22, y - 76, 22, 22);
    ctx.strokeStyle = '#4e342e';
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 22, y - 76, 22, 22);

    // Kotak bunga kembang sepatu merah di bawah jendela (Window Flowerbox)
    ctx.fillStyle = '#5d4037';
    ctx.fillRect(x + 18, y - 53, 30, 6);
    ctx.fillStyle = '#e91e63';
    for (let fb = 0; fb < 4; fb++) {
      ctx.beginPath();
      ctx.arc(x + 22 + fb * 7, y - 55, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // 7. Meja Layanan Mandor & Etalase Bibit di Teras (Front Porch Counter)
    ctx.fillStyle = '#4e342e';
    ctx.fillRect(x - 10, y - 36, 68, 20);
    // Buku register perkebunan & timbangan kuningan
    ctx.fillStyle = '#fff8e1';
    ctx.fillRect(x + 4, y - 38, 12, 5);
    ctx.fillStyle = '#ffd54f';
    ctx.beginPath();
    ctx.arc(x + 28, y - 36, 5, 0, Math.PI * 2);
    ctx.fill();

    // Tumpukan karung pupuk NPK & Urea di samping toko (Burlap Fertilizer Sacks)
    [-34, -22].forEach((sx, idx) => {
      ctx.fillStyle = '#d7ccc8';
      roundRect(ctx, x + 56 + idx * 8, y - 32 + idx * 4, 18, 16, 4);
      ctx.fill();
      ctx.fillStyle = '#d84315';
      ctx.font = 'bold 6px sans-serif';
      ctx.fillText('NPK', x + 58 + idx * 8, y - 22 + idx * 4);
    });

    // 8. Atap Tropis Sirap Berlapis Megah (Grand Multi-Tier Gable Roof)
    const roofGrad = ctx.createLinearGradient(x, y - 155, x, y - 105);
    roofGrad.addColorStop(0, '#bf360c');
    roofGrad.addColorStop(0.4, '#d84315');
    roofGrad.addColorStop(0.8, '#e64a19');
    roofGrad.addColorStop(1, '#bf360c');
    ctx.fillStyle = roofGrad;

    // Atap utama bersudut tajam
    ctx.beginPath();
    ctx.moveTo(x, y - 158);
    ctx.lineTo(x + 104, y - 104);
    ctx.lineTo(x - 104, y - 104);
    ctx.closePath();
    ctx.fill();

    // Lisplang ukir atap kayu jati (Carved Eaves & Fascia)
    ctx.fillStyle = '#3e2723';
    ctx.fillRect(x - 108, y - 107, 216, 7);
    ctx.fillStyle = '#ffd54f';
    ctx.fillRect(x - 2, y - 165, 4, 9); // Mahkota finial puncak atap

    // Tekstur genteng sirap tropis
    ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
    for (let ry = y - 150; ry < y - 105; ry += 11) {
      const spread = (ry - (y - 155)) * 1.8;
      ctx.fillRect(x - spread, ry, spread * 2, 2);
    }

    // 9. Lentera Kuningan Mewah Gantung Menyala (Warm Glowing Lanterns)
    [x - 84, x + 52].forEach(lx => {
      const lanternGrad = ctx.createRadialGradient(lx, y - 75, 2, lx, y - 75, 32);
      lanternGrad.addColorStop(0, 'rgba(255, 224, 130, 0.95)');
      lanternGrad.addColorStop(0.4, 'rgba(255, 179, 0, 0.45)');
      lanternGrad.addColorStop(1, 'rgba(255, 179, 0, 0)');
      ctx.fillStyle = lanternGrad;
      ctx.beginPath();
      ctx.arc(lx, y - 75, 32, 0, Math.PI * 2);
      ctx.fill();

      // Lentera fisik
      ctx.fillStyle = '#3e2723';
      ctx.fillRect(lx - 1, y - 88, 2, 8);
      ctx.fillStyle = '#ffa000';
      ctx.fillRect(lx - 4, y - 80, 8, 10);
      ctx.strokeStyle = '#ffd54f';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(lx - 4, y - 80, 8, 10);
    });

    // 10. Plang Papan Nama Toko Mewah Berukir (Embossed Shop Signboard)
    ctx.fillStyle = 'rgba(27, 94, 32, 0.95)';
    roundRect(ctx, x - 90, y - 138, 180, 26, 6);
    ctx.fill();
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🌿 TOKO BIBIT PPKS & POS MANDOR', x, y - 121);

    ctx.restore();
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 12. PABRIK PKS KELAPA SAWIT (MODERN AGRO-INDUSTRIAL COMPLEX)
  // ───────────────────────────────────────────────────────────────────────────
  function drawPabrikPKSEsthetic(ctx, x, y) {
    ctx.save();

    // 1. Bayangan Raksasa Pabrik di Tanah
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(x, y + 28, 185, 38, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Fondasi Bata Merah & Beton Industri (Reinforced Masonry Foundation)
    ctx.fillStyle = '#4e342e';
    ctx.fillRect(x - 160, y - 12, 320, 42);
    ctx.fillStyle = '#6d4c41';
    for (let bx = -155; bx < 155; bx += 20) {
      ctx.fillRect(x + bx, y - 10, 16, 3);
      ctx.fillRect(x + bx + 10, y + 8, 16, 3);
    }

    // 3. Bangunan Pabrik Baja Gelap Bergelombang (Corrugated Industrial Mill)
    const bldgGrad = ctx.createLinearGradient(x, y - 135, x, y - 12);
    bldgGrad.addColorStop(0, '#546e7a');
    bldgGrad.addColorStop(0.5, '#37474f');
    bldgGrad.addColorStop(1, '#212121');
    ctx.fillStyle = bldgGrad;
    ctx.fillRect(x - 150, y - 130, 300, 118);

    // Garis vertikal lembaran seng bergelombang & paku rivet baja
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    for (let px = -140; px < 140; px += 22) {
      ctx.fillRect(x + px, y - 125, 18, 112);
    }

    // Garis pita keselamatan industri kuning-hitam (Hazard Safety Stripes)
    for (let st = -150; st < 150; st += 24) {
      ctx.fillStyle = '#fbc02d';
      ctx.fillRect(x + st, y - 130, 12, 7);
      ctx.fillStyle = '#212121';
      ctx.fillRect(x + st + 12, y - 130, 12, 7);
    }

    // 4. Dua Cerobong Asap Baja Boiler Raksasa (Industrial Smokestacks)
    [-35, 15].forEach(cx => {
      const chimX = x + cx + 90;
      const chimGrad = ctx.createLinearGradient(chimX - 13, 0, chimX + 13, 0);
      chimGrad.addColorStop(0, '#212121');
      chimGrad.addColorStop(0.4, '#616161');
      chimGrad.addColorStop(0.8, '#424242');
      chimGrad.addColorStop(1, '#111111');
      ctx.fillStyle = chimGrad;
      ctx.fillRect(chimX - 12, y - 195, 24, 95);

      // Cincin penguat baja & lis kuningan
      ctx.fillStyle = '#ffd54f';
      ctx.fillRect(chimX - 14, y - 190, 28, 5);
      ctx.fillRect(chimX - 14, y - 155, 28, 4);
    });

    // 5. Dua Tangki Silo Penyimpanan CPO Baja Tahan Karat (Stainless CPO Tanks)
    [-115, -60].forEach((sx, idx) => {
      const siloX = x + sx;
      const siloGrad = ctx.createLinearGradient(siloX - 25, 0, siloX + 25, 0);
      siloGrad.addColorStop(0, '#78909c');
      siloGrad.addColorStop(0.35, '#eceff1');
      siloGrad.addColorStop(0.7, '#90a4ae');
      siloGrad.addColorStop(1, '#455a64');
      ctx.fillStyle = siloGrad;
      ctx.fillRect(siloX - 25, y - 150, 50, 138);

      // Kubah atas silo CPO
      ctx.fillStyle = '#cfd8dc';
      ctx.beginPath();
      ctx.ellipse(siloX, y - 150, 25, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      // Tangga melingkar & label tangki
      ctx.strokeStyle = '#37474f';
      ctx.lineWidth = 1.5;
      for (let ty = y - 140; ty < y - 25; ty += 18) {
        ctx.beginPath();
        ctx.moveTo(siloX - 24, ty);
        ctx.lineTo(siloX + 24, ty + 8);
        ctx.stroke();
      }

      ctx.fillStyle = 'rgba(10, 15, 25, 0.85)';
      roundRect(ctx, siloX - 20, y - 90, 40, 14, 3);
      ctx.fill();
      ctx.fillStyle = '#80d8ff';
      ctx.font = 'bold 8px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`CPO #${idx + 1}`, siloX, y - 80);
    });

    // 6. Roda Gigi Mekanis Berputar & Mesin Sterilizer (Sterilizer Drive Gear)
    ctx.save();
    ctx.translate(x + 80, y - 50);
    ctx.rotate(sawitState.pksGearAngle);
    ctx.fillStyle = '#ffb300';
    for (let g = 0; g < 8; g++) {
      ctx.rotate(Math.PI / 4);
      ctx.fillRect(-18, -5, 36, 10);
    }
    ctx.fillStyle = '#ffd54f';
    ctx.beginPath();
    ctx.arc(0, 0, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#37474f';
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 7. Rampa Timbang Truk & Sabuk Conveyor Masuk TBS (Conveyor Loading Ramp)
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x - 35, y + 8, 140, 36);

    // Rel baja conveyor
    ctx.fillStyle = '#334155';
    ctx.fillRect(x - 30, y + 18, 130, 12);
    // Sabuk karet conveyor hitam berjalan
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x - 28, y + 21, 126, 6);

    // Tandan TBS di atas sabuk conveyor bergerak ke dalam mesin
    const convOffset = (Date.now() * 0.04) % 24;
    for (let bi = 0; bi < 5; bi++) {
      const tbsBx = x - 20 + bi * 26 + convOffset;
      if (tbsBx < x + 95) {
        ctx.fillStyle = '#e65100';
        ctx.beginPath();
        ctx.arc(tbsBx, y + 20, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffa726';
        ctx.fillRect(tbsBx - 2, y + 18, 3, 3);
      }
    }

    // 8. Timbangan Digital LED Menyala (Digital Weighbridge Indicator)
    ctx.fillStyle = '#0a0e17';
    roundRect(ctx, x - 30, y - 15, 75, 20, 4);
    ctx.fill();
    ctx.strokeStyle = '#00e676';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.fillStyle = '#00e676';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('SCALE: READY', x + 7, y - 2);

    // 9. Plang Pabrik PKS Mewah Berhuruf Emas (Grand PKS Signboard)
    ctx.fillStyle = '#e65100';
    roundRect(ctx, x - 100, y - 72, 200, 26, 6);
    ctx.fill();
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🏭 PABRIK KELAPA SAWIT (PKS)', x, y - 55);

    ctx.restore();
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 13. TRUK SAWIT COLT DIESEL 2.5D DETAIL (MITSUBISHI CANTER STYLE)
  // ───────────────────────────────────────────────────────────────────────────
  function drawTrukSawitEsthetic(ctx, x, y) {
    ctx.save();

    // 1. Bayangan Truk di Atas Aspal
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(x, y + 15, 68, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Rangka Sasis Baja Hitam Truk
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x - 58, y - 10, 116, 12);

    // 3. Bak Muatan Kayu Belakang dengan Rangka Baja (Canter Wooden Drop-Side Bed)
    const bedGrad = ctx.createLinearGradient(x - 56, y - 52, x + 10, y + 2);
    bedGrad.addColorStop(0, '#795548');
    bedGrad.addColorStop(0.5, '#5d4037');
    bedGrad.addColorStop(1, '#3e2723');
    ctx.fillStyle = bedGrad;
    ctx.fillRect(x - 56, y - 50, 68, 52);

    // Garis bilah kayu bak truk & klem besi penguat
    ctx.strokeStyle = '#263238';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(x - 56, y - 50, 68, 52);
    ctx.fillStyle = '#263238';
    for (let px = -50; px < 8; px += 16) {
      ctx.fillRect(x + px, y - 50, 3, 52);
    }

    // Tumpukan Buah Sawit (TBS) Menggunung di Bak Truk
    const loadedCount = Math.min(28, sawitState.truckInventory.length);
    for (let i = 0; i < loadedCount; i++) {
      const bx = x - 50 + (i % 6) * 11;
      const by = y - 44 - Math.floor(i / 6) * 9;

      const fGrad = ctx.createRadialGradient(bx, by, 1, bx, by, 7);
      fGrad.addColorStop(0, '#ffb74d');
      fGrad.addColorStop(0.6, '#e65100');
      fGrad.addColorStop(1, '#bf360c');
      ctx.fillStyle = fGrad;
      ctx.beginPath();
      ctx.arc(bx, by, 6.5, 0, Math.PI * 2);
      ctx.fill();

      // Kilau butiran buah
      ctx.fillStyle = '#ffe082';
      ctx.fillRect(bx - 1, by - 2, 2, 2);
    }

    // 4. Kabin Kuning Mengkilap Truk Depan (Iconic Canary-Yellow Cab)
    const cabGrad = ctx.createLinearGradient(x + 12, y - 60, x + 56, y + 4);
    cabGrad.addColorStop(0, '#fff59d');
    cabGrad.addColorStop(0.3, '#fbc02d');
    cabGrad.addColorStop(0.8, '#f57f17');
    cabGrad.addColorStop(1, '#e65100');
    ctx.fillStyle = cabGrad;
    roundRect(ctx, x + 12, y - 58, 44, 58, 7);
    ctx.fill();

    // Kaca depan lebar dengan pantulan langit biru & wiper
    const glassGrad = ctx.createLinearGradient(x + 24, y - 52, x + 50, y - 30);
    glassGrad.addColorStop(0, '#e1f5fe');
    glassGrad.addColorStop(0.5, '#81d4fa');
    glassGrad.addColorStop(1, '#29b6f6');
    ctx.fillStyle = glassGrad;
    roundRect(ctx, x + 24, y - 52, 28, 22, 3);
    ctx.fill();

    // Bilah wiper kaca
    ctx.strokeStyle = '#212121';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x + 30, y - 32); ctx.lineTo(x + 40, y - 44);
    ctx.stroke();

    // Gril krom depan & logo Mitsubishi
    ctx.fillStyle = '#eceff1';
    ctx.fillRect(x + 46, y - 26, 8, 12);
    ctx.fillStyle = '#b0bec5';
    ctx.fillRect(x + 46, y - 23, 8, 2);
    ctx.fillRect(x + 46, y - 18, 8, 2);

    // Lampu halogen depan menyala terang
    ctx.fillStyle = '#fffde7';
    ctx.beginPath();
    ctx.arc(x + 50, y - 14, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffd54f';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Spion samping kabin
    ctx.fillStyle = '#212121';
    ctx.fillRect(x + 22, y - 46, 3, 8);
    ctx.fillRect(x + 19, y - 48, 4, 10);

    // 5. Roda Truk Bertekstur Tebal & Velg Baut (Heavy Duty Wheels)
    [-38, -14, 34].forEach(wx => {
      // Ban karet hitam
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(x + wx, y + 10, 10, 0, Math.PI * 2);
      ctx.fill();
      // Velg baja silver
      ctx.fillStyle = '#90a4ae';
      ctx.beginPath();
      ctx.arc(x + wx, y + 10, 5, 0, Math.PI * 2);
      ctx.fill();
      // Baut roda
      ctx.fillStyle = '#37474f';
      ctx.fillRect(x + wx - 1, y + 9, 2, 2);
    });

    // 6. Badge Indikator Kapasitas Muatan Mengambang
    ctx.fillStyle = 'rgba(9, 14, 26, 0.92)';
    roundRect(ctx, x - 45, y - 80, 90, 20, 5);
    ctx.fill();
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 10px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`🚚 ${sawitState.truckInventory.length}/${sawitState.truckCapacity} TBS`, x, y - 66);

    ctx.restore();
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 14. DERMAGA 12 PULAU & STASIUN KERETA (HIGH AESTHETIC HARBOR & STATION)
  // ───────────────────────────────────────────────────────────────────────────
  function drawDermagaEsthetic(ctx, x, y) {
    ctx.save();

    // Dermaga Kayu Teak di Atas Air Berombak
    ctx.fillStyle = '#5d4037';
    ctx.fillRect(x - 90, y - 28, 180, 54);

    // Papan kayu berpaku
    ctx.fillStyle = '#3e2723';
    for (let px = -85; px < 85; px += 14) {
      ctx.fillRect(x + px, y - 28, 2, 54);
    }

    // Tiang pancang tambat kapal (Mooring Bollards)
    ctx.fillStyle = '#263238';
    [-84, -40, 40, 80].forEach(bx => {
      ctx.fillRect(x + bx, y + 20, 8, 16);
      ctx.fillStyle = '#ffd54f';
      ctx.beginPath();
      ctx.arc(x + bx + 4, y + 20, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#263238';
    });

    // Kapal Ekspedisi Mewah Bersandar (Luxury Expedition Cruiser)
    const boatGrad = ctx.createLinearGradient(x + 45, y + 10, x + 125, y + 45);
    boatGrad.addColorStop(0, '#ffffff');
    boatGrad.addColorStop(0.5, '#e0f7fa');
    boatGrad.addColorStop(1, '#b2ebf2');
    ctx.fillStyle = boatGrad;
    ctx.beginPath();
    ctx.ellipse(x + 80, y + 32, 55, 20, 0, 0, Math.PI * 2);
    ctx.fill();

    // Garis biru lambung kapal & kabin
    ctx.fillStyle = '#0288d1';
    ctx.fillRect(x + 50, y + 20, 60, 16);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 56, y + 23, 14, 8);
    ctx.fillRect(x + 76, y + 23, 14, 8);

    // Plang Dermaga
    ctx.fillStyle = '#01579b';
    roundRect(ctx, x - 80, y - 58, 160, 24, 6);
    ctx.fill();
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🗺️ DERMAGA 12 PULAU', x, y - 42);

    ctx.restore();
  }

  function drawStasiunKeretaEsthetic(ctx, x, y) {
    ctx.save();

    // Rel kereta api baja ganda berkilau
    ctx.fillStyle = '#546e7a';
    ctx.fillRect(x - 48, y - 80, 12, 160);
    ctx.fillRect(x - 20, y - 80, 12, 160);
    ctx.fillStyle = '#cfd8dc';
    ctx.fillRect(x - 46, y - 80, 4, 160);
    ctx.fillRect(x - 18, y - 80, 4, 160);

    // Bantalan kayu rel
    ctx.fillStyle = '#3e2723';
    for (let ry = -75; ry < 75; ry += 16) {
      ctx.fillRect(x - 55, y + ry, 54, 5);
    }

    // Peron stasiun batu bata rapi & ubin kuning taktil
    const platGrad = ctx.createLinearGradient(x + 8, 0, x + 75, 0);
    platGrad.addColorStop(0, '#546e7a');
    platGrad.addColorStop(1, '#263238');
    ctx.fillStyle = platGrad;
    ctx.fillRect(x + 8, y - 60, 68, 120);

    // Jalur kuning pemandu difabel stasiun
    ctx.fillStyle = '#fbc02d';
    ctx.fillRect(x + 12, y - 60, 5, 120);

    // Plang Stasiun Merah Tokyo Style
    ctx.fillStyle = '#c62828';
    roundRect(ctx, x - 18, y - 86, 115, 24, 6);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🚆 KE SHIBUYA', x + 39, y - 70);

    ctx.restore();
  }

  // Karakter Pemain 2.5D
  function drawPlayer25D(ctx, p, px, py, parentState) {
    const scale = 1.08;
    const isWalking = !!p.isWalking;
    const walkFrame = p.walkFrame || 0;
    const facing = p.facing || 1;
    const isBack = !!p.back;
    const lift = p.jumpY || 0;

    // Bayangan presisi di tanah
    ctx.save();
    const shadowGrad = ctx.createRadialGradient(px, py, 2, px, py, 16 * scale);
    shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.45)');
    shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = shadowGrad;
    ctx.beginPath();
    ctx.ellipse(px, py, 16 * scale, 6 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Gambar karakter dengan kustomisasi lengkap
    if (parentState.drawCharacter) {
      const look = parentState.lookOpts ? parentState.lookOpts(p.look) : {};
      parentState.drawCharacter(ctx, px, py + lift, scale, {
        facing: facing,
        walking: isWalking,
        walkFrame: walkFrame,
        air: !p.onGround,
        lift: lift,
        back: isBack,
        name: p.name || 'Ren',
        nameColor: '#00f0ff',
        ...look
      });
    }

    // Animasi ayunan alat tebas 2.5D
    const tool = getEquippedTool();
    if (sawitState.swingAnim > 0) {
      const swingRatio = sawitState.swingAnim / 0.28;
      ctx.save();
      ctx.translate(px + facing * 18, py - 35 + lift);
      ctx.rotate(-swingRatio * 2.4 * facing);

      ctx.fillStyle = '#8d6e63';
      ctx.fillRect(-2, -26, 4, 30);
      ctx.fillStyle = '#cfd8dc';
      ctx.fillRect(-12, -30, 24, 8);

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(0, 0, 28, -Math.PI / 4, Math.PI / 2);
      ctx.stroke();

      ctx.restore();
    }
  }

  // Top Open World HUD Bar Elegan
  function renderOpenWorldHUD(ctx, w, h, isl) {
    ctx.save();
    const hudW = Math.min(700, w - 24);
    const hudH = 46;
    const hudX = (w - hudW) / 2;
    const hudY = 12;

    const hudGrad = ctx.createLinearGradient(hudX, hudY, hudX, hudY + hudH);
    hudGrad.addColorStop(0, 'rgba(15, 23, 42, 0.92)');
    hudGrad.addColorStop(1, 'rgba(9, 14, 26, 0.95)');
    ctx.fillStyle = hudGrad;
    roundRect(ctx, hudX, hudY, hudW, hudH, 10);
    ctx.fill();
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Nama Pulau & Level
    ctx.fillStyle = '#00f0ff';
    ctx.font = 'bold 13px "Outfit", sans-serif';
    ctx.fillText(`🌴 Pulau ${isl.id}: ${isl.name}`, hudX + 16, hudY + 20);

    const xpCur = sawitState.playerXp;
    const xpMax = xpNeeded(sawitState.playerLevel);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px "Outfit", sans-serif';
    ctx.fillText(`Lv. ${sawitState.playerLevel}`, hudX + 16, hudY + 36);

    ctx.fillStyle = '#1e293b';
    roundRect(ctx, hudX + 62, hudY + 28, 85, 8, 3);
    ctx.fill();
    ctx.fillStyle = '#00e5ff';
    roundRect(ctx, hudX + 62, hudY + 28, 85 * Math.min(1, xpCur / xpMax), 8, 3);
    ctx.fill();

    // Stok Bibit
    ctx.fillStyle = '#66bb6a';
    ctx.font = 'bold 12px "Outfit", sans-serif';
    ctx.fillText(`🌱 ${sawitState.seeds} Bibit`, hudX + 175, hudY + 28);

    // Kapasitas Truk
    const truckCount = sawitState.truckInventory.length;
    const isFull = truckCount >= sawitState.truckCapacity;
    ctx.fillStyle = isFull ? '#ff5252' : '#ffd700';
    ctx.font = 'bold 12px "Outfit", sans-serif';
    ctx.fillText(`🚚 Truk: ${truckCount}/${sawitState.truckCapacity} TBS`, hudX + 285, hudY + 28);

    // Alat Panen Terpasang
    const tool = getEquippedTool();
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '12px "Outfit", sans-serif';
    ctx.fillText(`${tool.icon} ${tool.name} (${tool.damage} Dmg)`, hudX + 445, hudY + 28);

    ctx.restore();
  }

  function roundRect(ctx, x, y, width, height, radius) {
    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(x, y, width, height, radius);
      return;
    }
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  function shadeColor(color, percent) {
    let num = parseInt(color.replace('#', ''), 16);
    let amt = Math.round(2.55 * percent);
    let R = (num >> 16) + amt;
    let G = (num >> 8 & 0x00FF) + amt;
    let B = (num & 0x0000FF) + amt;
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 14. MODAL TOKO BIBIT & 12 PULAU EKSPEDISI
  // ───────────────────────────────────────────────────────────────────────────
  function openShopModal() {
    const overlay = document.getElementById('modal-overlay');
    const body = document.getElementById('modal-body');
    if (!overlay || !body) return;

    const gs = window._antigravityGameState;
    const playerGold = gs ? gs.player.gold : 0;

    let html = `
      <div style="font-family:'Outfit',sans-serif;color:#e2e8f0;padding:12px;">
        <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #1f293b;padding-bottom:10px;margin-bottom:16px;">
          <div>
            <h2 style="font-size:1.3rem;font-weight:700;color:#66bb6a;margin:0;">🌱 Toko Bibit & Upgrade Alat Sawit</h2>
            <div style="font-size:0.85rem;color:#94a3b8;">Beli bibit sawit unggul, perbarui alat tebas, dan perluas muatan truk</div>
          </div>
          <div style="background:rgba(255,215,0,0.12);border:1px solid #ffd700;border-radius:8px;padding:6px 14px;color:#ffd700;font-weight:700;">
            💴 ${formatNum(playerGold)} Koin
          </div>
        </div>

        <h3 style="font-size:1.05rem;color:#a5d6a7;margin:12px 0 8px;">🌱 Beli Bibit Sawit (Stok Kamu: ${sawitState.seeds} Bibit)</h3>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;margin-bottom:18px;">
          <div style="background:#131c2e;border:1px solid #23334d;border-radius:8px;padding:12px;text-align:center;">
            <div style="font-size:1.8rem;">🌱</div>
            <div style="font-weight:700;color:#fff;">Paket 5 Bibit</div>
            <div style="font-size:0.8rem;color:#94a3b8;margin:4px 0 10px;">Bibit kelapa sawit siap tanam</div>
            <button onclick="window.SawitModule.buySeeds(5, 100)" style="width:100%;background:#2e7d32;color:#fff;border:none;padding:8px;border-radius:6px;cursor:pointer;font-weight:700;">
              Beli 5 Bibit (100 Koin)
            </button>
          </div>
          <div style="background:#131c2e;border:1px solid #23334d;border-radius:8px;padding:12px;text-align:center;">
            <div style="font-size:1.8rem;">🌿</div>
            <div style="font-weight:700;color:#81c784;">Paket 15 Bibit</div>
            <div style="font-size:0.8rem;color:#94a3b8;margin:4px 0 10px;">Cukup untuk penuhi Blok A</div>
            <button onclick="window.SawitModule.buySeeds(15, 250)" style="width:100%;background:#388e3c;color:#fff;border:none;padding:8px;border-radius:6px;cursor:pointer;font-weight:700;">
              Beli 15 Bibit (250 Koin)
            </button>
          </div>
          <div style="background:#131c2e;border:1px solid #23334d;border-radius:8px;padding:12px;text-align:center;">
            <div style="font-size:1.8rem;">🌾</div>
            <div style="font-weight:700;color:#ffd54f;">Paket 40 Bibit</div>
            <div style="font-size:0.8rem;color:#94a3b8;margin:4px 0 10px;">Penuhi seluruh 24 petak kebun</div>
            <button onclick="window.SawitModule.buySeeds(40, 600)" style="width:100%;background:#f57f17;color:#fff;border:none;padding:8px;border-radius:6px;cursor:pointer;font-weight:700;">
              Beli 40 Bibit (600 Koin)
            </button>
          </div>
        </div>

        <h3 style="font-size:1.05rem;color:#81d4fa;margin:16px 0 8px;">🪓 Katalog 9 Alat Panen (Kapak, Egrek & Dodos)</h3>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px;margin-bottom:18px;">
    `;

    TOOLS_DATA.forEach(t => {
      const isOwned = sawitState.ownedToolIds.includes(t.id);
      const isEquipped = sawitState.equippedToolId === t.id;

      html += `
        <div style="background:#131c2e;border:1px solid ${isEquipped ? '#00f0ff' : '#23334d'};border-radius:8px;padding:12px;display:flex;flex-direction:column;justify-content:space-between;">
          <div>
            <div style="display:flex;align-items:center;justify-content:space-between;">
              <span style="font-size:1.4rem;">${t.icon}</span>
              <span style="font-size:0.75rem;padding:2px 6px;border-radius:4px;background:#1e293b;color:#94a3b8;">${t.tier}</span>
            </div>
            <div style="font-weight:700;margin:6px 0 2px;color:#fff;">${t.name}</div>
            <div style="font-size:0.8rem;color:#4ade80;">💥 ${t.damage} Dmg • ⚡ Atk Speed: ${t.atkSpeed}s</div>
          </div>
          <div style="margin-top:10px;">
            ${isEquipped ? `
              <button disabled style="width:100%;background:#00bcd4;color:#000;border:none;padding:6px;border-radius:6px;font-weight:700;">✓ Terpasang</button>
            ` : isOwned ? `
              <button onclick="window.SawitModule.equipTool(${t.id})" style="width:100%;background:#1e293b;color:#fff;border:1px solid #00f0ff;padding:6px;border-radius:6px;cursor:pointer;font-weight:700;">Pasang</button>
            ` : `
              <button onclick="window.SawitModule.buyTool(${t.id})" style="width:100%;background:#ff6b35;color:#fff;border:none;padding:6px;border-radius:6px;cursor:pointer;font-weight:700;">
                Beli (${formatNum(t.price)} Koin)
              </button>
            `}
          </div>
        </div>
      `;
    });

    html += `
        </div>

        <h3 style="font-size:1.05rem;color:#ffb74d;margin:16px 0 8px;">🚚 Kapasitas Bak Truk (Sekarang: ${sawitState.truckCapacity} TBS)</h3>
        <div style="display:flex;align-items:center;justify-content:space-between;background:#131c2e;border:1px solid #23334d;border-radius:8px;padding:12px;">
          <div>
            <div style="font-weight:700;color:#fff;">Tambah +15 Kapasitas Bak Truk</div>
            <div style="font-size:0.85rem;color:#94a3b8;">Muat lebih banyak buah sawit sebelum menjual ke PKS</div>
          </div>
          <button onclick="window.SawitModule.upgradeTruck()" style="background:#e65100;color:#fff;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;font-weight:700;">
            Upgrade (2,500 Koin)
          </button>
        </div>
      </div>
    `;

    body.innerHTML = html;
    overlay.classList.remove('hidden');
  }

  function openIslandsModal() {
    const overlay = document.getElementById('modal-overlay');
    const body = document.getElementById('modal-body');
    if (!overlay || !body) return;

    let html = `
      <div style="font-family:'Outfit',sans-serif;color:#e2e8f0;padding:12px;">
        <div style="border-bottom:1px solid #1f293b;padding-bottom:10px;margin-bottom:16px;">
          <h2 style="font-size:1.3rem;font-weight:700;color:#00f0ff;margin:0;">🗺️ Peta Ekspedisi 12 Pulau Sawit</h2>
          <div style="font-size:0.85rem;color:#94a3b8;">Jelajahi 12 bioma pulau unik dengan buah langka berharga triliunan koin!</div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px;max-height:60vh;overflow-y:auto;padding-right:4px;">
    `;

    ISLANDS_DATA.forEach((isl, idx) => {
      const isUnlocked = sawitState.unlockedIslandIds.includes(isl.id);
      const isActive = sawitState.activeIslandIndex === idx;

      html += `
        <div style="background:#111827;border:1px solid ${isActive ? '#00f0ff' : (isUnlocked ? '#23334d' : '#374151')};border-radius:8px;padding:12px;display:flex;flex-direction:column;justify-content:space-between;">
          <div>
            <div style="display:flex;align-items:center;justify-content:space-between;">
              <span style="font-weight:700;color:${isActive ? '#00f0ff' : '#fff'};font-size:1rem;">Pulau ${isl.id}: ${isl.name}</span>
              <span style="font-size:0.75rem;padding:2px 6px;border-radius:4px;background:#1e293b;color:#94a3b8;">Lv. ${isl.reqLevel}+</span>
            </div>
            <div style="font-size:0.8rem;color:#94a3b8;margin:6px 0 8px;">
              Bioma tanah: <span style="display:inline-block;width:12px;height:12px;background:${isl.groundColor};border-radius:2px;vertical-align:middle;"></span> ${isl.name}
            </div>
            <div style="font-size:0.75rem;color:#64748b;">
              Buah Mythic: <span style="color:#00f0ff;font-weight:600;">${isl.fruits[5].name}</span> (${formatNum(isl.fruits[5].price)} Koin)
            </div>
          </div>
          <div style="margin-top:10px;">
            ${isActive ? `
              <button disabled style="width:100%;background:#00bcd4;color:#000;border:none;padding:6px;border-radius:6px;font-weight:700;">Sedang Aktif</button>
            ` : isUnlocked ? `
              <button onclick="window.SawitModule.travelToIsland(${idx})" style="width:100%;background:#1b5e20;color:#fff;border:none;padding:6px;border-radius:6px;cursor:pointer;font-weight:700;">Kunjungi Pulau</button>
            ` : `
              <button onclick="window.SawitModule.unlockIsland(${idx})" style="width:100%;background:#ff6f00;color:#fff;border:none;padding:6px;border-radius:6px;cursor:pointer;font-weight:700;">
                Buka (${formatNum(isl.reqCoins)} Koin)
              </button>
            `}
          </div>
        </div>
      `;
    });

    html += `
        </div>
      </div>
    `;

    body.innerHTML = html;
    overlay.classList.remove('hidden');
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 15. TRANSISI SCENE
  // ───────────────────────────────────────────────────────────────────────────
  function enterSawit(parentState) {
    if (!parentState) parentState = window._antigravityGameState;
    if (parentState.triggerFadeTransition) {
      parentState.triggerFadeTransition(() => {
        parentState.savedStreetX = parentState.player.x;
        parentState.savedStreetZ = parentState.player.z;
        parentState.scene = 'sawit_island';

        parentState.player.x = 240;
        parentState.player.y = 1040;
        parentState.player.jumpY = 0;
        parentState.player.onGround = true;

        const isl = ISLANDS_DATA[sawitState.activeIslandIndex];
        initPlots(isl);
        initButterflies();

        const wName = document.getElementById('world-name');
        if (wName) wName.textContent = `🌴 Perkebunan Sawit 2.5D: ${isl.name}`;

        const btnMap = document.getElementById('btn-map');
        if (btnMap) btnMap.textContent = '🏙️';

        if (parentState.showNotification) {
          parentState.showNotification(`🌴 Selamat datang di Perkebunan Sawit 2.5D! Nikmati pemandangan kebun yang asri, tanam bibit unggul, dan panen hasilnya.`);
        }
      });
    }
  }

  function leaveSawit(parentState) {
    if (!parentState) parentState = window._antigravityGameState;
    if (parentState.triggerFadeTransition) {
      parentState.triggerFadeTransition(() => {
        parentState.scene = 'street';
        parentState.player.x = parentState.savedStreetX || 400;
        parentState.player.z = parentState.savedStreetZ || 0.35;
        parentState.player.jumpY = 0;
        parentState.camera.y = 0;

        const wName = document.getElementById('world-name');
        if (wName) wName.textContent = '🌃 Tepi Kanal Shibuya • しんとした夜';

        const btnMap = document.getElementById('btn-map');
        if (btnMap) btnMap.textContent = '🌴';

        if (parentState.showNotification) {
          parentState.showNotification('Kamu kembali ke kota kanal Shibuya.');
        }
      });
    }
  }

  function formatNum(n) {
    if (n >= 1e18) return (n / 1e18).toFixed(1) + 'Qi';
    if (n >= 1e15) return (n / 1e15).toFixed(1) + 'Qa';
    if (n >= 1e12) return (n / 1e12).toFixed(1) + 'T';
    if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
    if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(1) + 'k';
    return n.toString();
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 16. EXPOSE PUBLIC API
  // ───────────────────────────────────────────────────────────────────────────
  window.SawitModule = {
    ISLANDS_DATA,
    TOOLS_DATA,
    state: sawitState,
    init(parentState) {
      initPlots(ISLANDS_DATA[0]);
      initButterflies();

      const canvas = document.getElementById('game-canvas');
      if (canvas && !canvas._sawitPointerAttached) {
        canvas._sawitPointerAttached = true;
        canvas.addEventListener('pointerdown', e => {
          const gs = window._antigravityGameState || parentState;
          if (!gs || gs.scene !== 'sawit_island') return;
          const rect = canvas.getBoundingClientRect();
          const scaleX = canvas.width / rect.width;
          const scaleY = canvas.height / rect.height;
          const clickX = (e.clientX - rect.left) * scaleX + gs.camera.x;
          const clickY = (e.clientY - rect.top) * scaleY + (gs.camera.y || 0);

          // Cek klik petak tanam
          sawitState.plots.forEach(pl => {
            if (Math.hypot(pl.x - clickX, pl.y - clickY) < 60) {
              const p = gs.player;
              const py = p.y !== undefined ? p.y : 800;
              if (Math.hypot(pl.x - p.x, pl.y - py) < 140) {
                if (pl.stage === 'empty') plantSeedInPlot(pl, gs);
                else if (pl.stage === 'mature') harvestPalm(pl, gs);
              }
            }
          });

          // Cek klik PKS
          if (Math.hypot(2120 - clickX, 560 - clickY) < 140) {
            const p = gs.player;
            const py = p.y !== undefined ? p.y : 800;
            if (Math.hypot(2120 - p.x, 560 - py) < 160) sellToPKS(gs);
          }

          // Cek klik Toko
          if (Math.hypot(2120 - clickX, 1160 - clickY) < 100) openShopModal();

          // Cek klik Dermaga
          if (Math.hypot(2120 - clickX, 1760 - clickY) < 100) openIslandsModal();
        });
      }

      return sawitState;
    },
    update(dt, parentState) {
      updateSawit(dt, parentState);
    },
    updatePlayer(dt, p, parentState) {
      updatePlayerOpenWorld(dt, p, parentState);
    },
    render(ctx, camX, camY, w, h, parentState) {
      renderSawitIsland(ctx, camX, camY, w, h, parentState);
    },
    checkProximityAction(p, parentState) {
      return checkProximityAction(p, parentState);
    },
    enterSawit(parentState) {
      enterSawit(parentState || window._antigravityGameState);
    },
    leaveSawit(parentState) {
      leaveSawit(parentState || window._antigravityGameState);
    },
    buySeeds(amount, cost) {
      const gs = window._antigravityGameState;
      if (!gs) return;
      if ((gs.player.gold || 0) < cost) {
        if (gs.showNotification) gs.showNotification('Koin tidak mencukupi untuk membeli bibit!');
        return;
      }
      gs.player.gold -= cost;
      sawitState.seeds += amount;
      if (gs.updateCurrencyUI) gs.updateCurrencyUI();
      try { if (window.sfx && window.sfx.drink) window.sfx.drink(); } catch (_) {}
      if (gs.showNotification) gs.showNotification(`🎉 Berhasil membeli +${amount} Bibit Sawit! Total: ${sawitState.seeds} Bibit.`);
      openShopModal();
    },
    upgradeTruck() {
      const gs = window._antigravityGameState;
      const cost = 2500;
      if (!gs) return;
      if ((gs.player.gold || 0) < cost) {
        if (gs.showNotification) gs.showNotification('Koin tidak mencukupi untuk upgrade truk!');
        return;
      }
      gs.player.gold -= cost;
      sawitState.truckCapacity += 15;
      if (gs.updateCurrencyUI) gs.updateCurrencyUI();
      if (gs.showNotification) gs.showNotification(`🚚 Kapasitas Truk bertambah menjadi ${sawitState.truckCapacity} TBS!`);
      openShopModal();
    },
    equipTool(toolId) {
      sawitState.equippedToolId = toolId;
      const modal = document.getElementById('modal-overlay');
      if (modal) modal.classList.add('hidden');
      const tool = getEquippedTool();
      if (window._antigravityGameState && window._antigravityGameState.showNotification) {
        window._antigravityGameState.showNotification(`⚔️ Alat terpasang: ${tool.name}!`);
      }
    },
    buyTool(toolId) {
      const tool = TOOLS_DATA.find(t => t.id === toolId);
      const gs = window._antigravityGameState;
      if (!tool || !gs) return;
      if ((gs.player.gold || 0) >= tool.price) {
        gs.player.gold -= tool.price;
        sawitState.ownedToolIds.push(tool.id);
        this.equipTool(tool.id);
        if (gs.updateCurrencyUI) gs.updateCurrencyUI();
        if (gs.showNotification) gs.showNotification(`🎉 Berhasil membeli & memasang ${tool.name}!`);
      } else {
        if (gs.showNotification) gs.showNotification('Koin tidak mencukupi!');
      }
    },
    travelToIsland(islandIdx) {
      sawitState.activeIslandIndex = islandIdx;
      initPlots(ISLANDS_DATA[islandIdx]);
      initButterflies();
      const modal = document.getElementById('modal-overlay');
      if (modal) modal.classList.add('hidden');
      const gs = window._antigravityGameState;
      if (gs) enterSawit(gs);
    },
    unlockIsland(islandIdx) {
      const isl = ISLANDS_DATA[islandIdx];
      const gs = window._antigravityGameState;
      if (!isl || !gs) return;
      if (sawitState.playerLevel < isl.reqLevel) {
        if (gs.showNotification) gs.showNotification(`Level belum mencukupi! Butuh Level ${isl.reqLevel}`);
        return;
      }
      if (gs.player.gold < isl.reqCoins) {
        if (gs.showNotification) gs.showNotification(`Koin tidak mencukupi! Butuh ${formatNum(isl.reqCoins)} Koin`);
        return;
      }
      gs.player.gold -= isl.reqCoins;
      sawitState.unlockedIslandIds.push(isl.id);
      if (gs.updateCurrencyUI) gs.updateCurrencyUI();
      const modal = document.getElementById('modal-overlay');
      if (modal) modal.classList.add('hidden');
      if (gs.showNotification) gs.showNotification(`🔓 Akses Pulau ${isl.id}: ${isl.name} Terbuka!`);
      this.travelToIsland(islandIdx);
    },
    getPlots() {
      return sawitState.plots;
    },
    spawnParticles: spawnParticles
  };

})(window);
