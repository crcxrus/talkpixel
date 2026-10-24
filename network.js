// =============================================================================
// TELEGRAM MINI APP (TMA) & MABAR MULTIPLAYER ENGINE
// Sesuai Spesifikasi Telegram WebApp & TMA Game Protocol
// Mendukung: WebSocket Server, BroadcastChannel, & Peer-to-Peer
// =============================================================================

(function (window) {
  'use strict';

  // ───────────────────────────────────────────────────────────────────────────
  // 1. TELEGRAM WEBAPP SDK AUTO-DETECTION & INITIALIZATION
  // ───────────────────────────────────────────────────────────────────────────
  const tg = window.Telegram?.WebApp;
  const isInsideTelegram = !!(tg && tg.initData);

  const TelegramState = {
    isInsideTelegram: isInsideTelegram,
    user: tg?.initDataUnsafe?.user || null,
    startParam: tg?.initDataUnsafe?.start_param || null,
    botUsername: window.TELEGRAM_BOT_USERNAME || 'SawitSimulatorBot',
    colorScheme: tg?.colorScheme || 'dark'
  };

  // Setup WebApp saat dimuat di Telegram
  if (tg) {
    try {
      tg.ready();
      tg.expand();
      if (tg.enableClosingConfirmation) tg.enableClosingConfirmation();
      if (tg.setHeaderColor) tg.setHeaderColor('#090e1a');
      if (tg.setBackgroundColor) tg.setBackgroundColor('#090e1a');
    } catch (e) {
      console.warn('[Telegram WebApp] Init warning:', e);
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 2. MABAR MULTIPLAYER STATE & CONFIGURATION
  // ───────────────────────────────────────────────────────────────────────────
  const MabarState = {
    status: 'disconnected', // 'disconnected' | 'connecting' | 'connected'
    roomId: null,
    isHost: false,
    myId: 'player_' + Math.random().toString(36).substr(2, 8),
    myName: TelegramState.user?.first_name || 'Petani ' + Math.floor(Math.random() * 900 + 100),
    myTgId: TelegramState.user?.id || null,
    serverUrl: localStorage.getItem('sawit_mabar_server') || (location.protocol === 'https:' ? `wss://${location.host}` : `ws://${location.hostname || 'localhost'}:3000`),
    socket: null,
    broadcastChannel: null,
    otherPlayers: {}, // { [id]: { id, name, tgId, x, y, facing, isWalking, walkFrame, jumpY, map, tool, swingAnim, look, emote, chatText, chatTimer } }
    lastMoveSent: 0,
    ping: 0,
    pingStart: 0
  };

  // Inisialisasi BroadcastChannel untuk mabar lokal antar-tab tanpa server
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      MabarState.broadcastChannel = new BroadcastChannel('sawit_mabar_local');
      MabarState.broadcastChannel.onmessage = e => handleIncomingData(e.data);
    }
  } catch (_) {}

  // ───────────────────────────────────────────────────────────────────────────
  // 3. NETWORKING CLIENT (WEBSOCKET & BROADCAST)
  // ───────────────────────────────────────────────────────────────────────────
  function connectWebSocket(url) {
    if (MabarState.socket) {
      try { MabarState.socket.close(); } catch (_) {}
      MabarState.socket = null;
    }

    MabarState.status = 'connecting';
    updateHUDMabarStatus();

    try {
      const ws = new WebSocket(url);
      MabarState.socket = ws;

      ws.onopen = () => {
        MabarState.status = 'connected';
        updateHUDMabarStatus();
        showNotification('🌐 Terhubung ke Server Mabar!');

        // Kirim join room jika sudah ada roomId
        if (MabarState.roomId) {
          sendPacket({
            type: 'join_room',
            roomId: MabarState.roomId,
            player: getMyPlayerPayload()
          });
        }
      };

      ws.onmessage = event => {
        try {
          const data = JSON.parse(event.data);
          handleIncomingData(data);
        } catch (e) {
          console.error('[Mabar] Failed to parse message:', e);
        }
      };

      ws.onclose = () => {
        MabarState.status = 'disconnected';
        updateHUDMabarStatus();
      };

      ws.onerror = () => {
        MabarState.status = 'disconnected';
        updateHUDMabarStatus();
      };
    } catch (e) {
      MabarState.status = 'disconnected';
      updateHUDMabarStatus();
    }
  }

  function sendPacket(data) {
    // 1. Kirim via WebSocket jika terhubung
    if (MabarState.socket && MabarState.socket.readyState === WebSocket.OPEN) {
      MabarState.socket.send(JSON.stringify(data));
    }
    // 2. Selalu broadcast ke channel lokal (agar bisa mabar antar-tab/layar di perangkat yang sama)
    if (MabarState.broadcastChannel) {
      try {
        MabarState.broadcastChannel.postMessage(data);
      } catch (_) {}
    }
  }

  function getMyPlayerPayload() {
    const parentState = window._antigravityGameState || {};
    const p = parentState.player || {};
    return {
      id: MabarState.myId,
      name: MabarState.myName,
      tgId: MabarState.myTgId,
      color: p.color || '#3b82f6',
      look: p.look || {},
      map: parentState.scene || 'sawit_island'
    };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 4. HANDLING INCOMING MULTIPLAYER PACKETS
  // ───────────────────────────────────────────────────────────────────────────
  function handleIncomingData(data) {
    if (!data || data.senderId === MabarState.myId) return;

    // Filter berdasarkan Room ID (hanya terima yang sama roomnya)
    if (data.roomId && MabarState.roomId && data.roomId !== MabarState.roomId) {
      return;
    }

    switch (data.type) {
      case 'player_joined':
        if (data.player && data.player.id !== MabarState.myId) {
          MabarState.otherPlayers[data.player.id] = {
            ...data.player,
            x: data.player.x || 1000,
            y: data.player.y || 800,
            targetX: data.player.x || 1000,
            targetY: data.player.y || 800,
            facing: 1,
            isWalking: false,
            walkFrame: 0,
            jumpY: 0,
            lastUpdate: Date.now()
          };
          showNotification(`👋 ${data.player.name} bergabung ke Room Mabar!`);
          haptic('light');

          // Balas kirim keberadaan kita jika kita host/sudah ada di room
          sendPacket({
            type: 'player_sync',
            roomId: MabarState.roomId,
            senderId: MabarState.myId,
            player: {
              ...getMyPlayerPayload(),
              x: window._antigravityGameState?.player?.x || 1000,
              y: window._antigravityGameState?.player?.y || 800
            }
          });
        }
        break;

      case 'player_sync':
        if (data.player && data.player.id !== MabarState.myId) {
          if (!MabarState.otherPlayers[data.player.id]) {
            MabarState.otherPlayers[data.player.id] = {
              ...data.player,
              targetX: data.player.x || 1000,
              targetY: data.player.y || 800,
              lastUpdate: Date.now()
            };
          }
        }
        break;

      case 'player_left':
        if (data.playerId && MabarState.otherPlayers[data.playerId]) {
          const name = MabarState.otherPlayers[data.playerId].name;
          delete MabarState.otherPlayers[data.playerId];
          showNotification(`🏃 ${name} keluar dari room.`);
        }
        break;

      case 'player_move':
        if (data.playerId && data.playerId !== MabarState.myId) {
          let op = MabarState.otherPlayers[data.playerId];
          if (!op) {
            op = {
              id: data.playerId,
              name: data.name || 'Teman',
              x: data.x,
              y: data.y,
              targetX: data.x,
              targetY: data.y,
              lastUpdate: Date.now()
            };
            MabarState.otherPlayers[data.playerId] = op;
          }
          op.targetX = data.x;
          op.targetY = data.y;
          op.facing = data.facing;
          op.isWalking = data.isWalking;
          op.walkFrame = data.walkFrame;
          op.jumpY = data.jumpY;
          op.map = data.map;
          op.tool = data.tool;
          op.swingAnim = data.swingAnim;
          op.lastUpdate = Date.now();
        }
        break;

      case 'player_chop':
        // Teman menebas pohon sawit
        if (data.plotIndex !== undefined && window.SawitModule) {
          const plot = window.SawitModule.getPlots()[data.plotIndex];
          if (plot && plot.stage === 'mature') {
            plot.hp = Math.max(0, (data.remainingHp !== undefined ? data.remainingHp : plot.hp - (data.damage || 15)));
            plot.shake = 16;
            if (window.SawitModule.spawnParticles) {
              window.SawitModule.spawnParticles(plot.x, plot.y - 30, 10, '#8d6e63');
            }
            if (data.remainingHp <= 0) {
              plot.stage = 'harvested';
              plot.growTimer = 8.0;
            }
          }
        }
        break;

      case 'player_plant':
        // Teman menanam pohon sawit
        if (data.plotIndex !== undefined && window.SawitModule) {
          const plot = window.SawitModule.getPlots()[data.plotIndex];
          if (plot && plot.stage === 'empty') {
            plot.stage = 'seed';
            plot.growTimer = 3.5;
            if (window.SawitModule.spawnParticles) {
              window.SawitModule.spawnParticles(plot.x, plot.y - 10, 8, '#4caf50');
            }
          }
        }
        break;

      case 'player_chat':
        if (data.playerId && data.playerId !== MabarState.myId) {
          const op = MabarState.otherPlayers[data.playerId];
          if (op) {
            op.chatText = data.text;
            op.chatTimer = 5.0;
          }
          // Tambahkan ke chatbox global game
          if (window._antigravityGameState?.addChatMessage) {
            window._antigravityGameState.addChatMessage(data.name || 'Teman', data.text, '#00f0ff');
          }
        }
        break;

      case 'player_emote':
        if (data.playerId && data.playerId !== MabarState.myId) {
          const op = MabarState.otherPlayers[data.playerId];
          if (op) {
            op.emote = data.emote;
            op.emoteStart = Date.now();
          }
        }
        break;

      case 'room_state':
        // Sinkronisasi penuh dari host atau server
        if (data.players) {
          data.players.forEach(p => {
            if (p.id !== MabarState.myId) {
              MabarState.otherPlayers[p.id] = {
                ...p,
                targetX: p.x || 1000,
                targetY: p.y || 800,
                lastUpdate: Date.now()
              };
            }
          });
        }
        break;
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 5. EMITTING LOCAL PLAYER EVENTS (PENGIRIMAN DATA)
  // ───────────────────────────────────────────────────────────────────────────
  function sendMyMovement(p, mapName, tool, swingAnim) {
    if (!MabarState.roomId) return;
    const now = Date.now();
    // Throttle ke ~18 fps agar hemat kuota di Telegram HP
    if (now - MabarState.lastMoveSent < 55) return;
    MabarState.lastMoveSent = now;

    sendPacket({
      type: 'player_move',
      roomId: MabarState.roomId,
      senderId: MabarState.myId,
      playerId: MabarState.myId,
      name: MabarState.myName,
      x: Math.round(p.x),
      y: Math.round(p.y !== undefined ? p.y : 800),
      facing: p.facing || 1,
      isWalking: !!p.isWalking,
      walkFrame: p.walkFrame || 0,
      jumpY: Math.round(p.jumpY || 0),
      map: mapName || 'sawit_island',
      tool: tool?.name || 'Kapak',
      swingAnim: swingAnim || 0
    });
  }

  function sendChopAction(plotIndex, damage, remainingHp) {
    if (!MabarState.roomId) return;
    sendPacket({
      type: 'player_chop',
      roomId: MabarState.roomId,
      senderId: MabarState.myId,
      plotIndex: plotIndex,
      damage: damage,
      remainingHp: remainingHp
    });
    haptic('chop');
  }

  function sendPlantAction(plotIndex) {
    if (!MabarState.roomId) return;
    sendPacket({
      type: 'player_plant',
      roomId: MabarState.roomId,
      senderId: MabarState.myId,
      plotIndex: plotIndex
    });
    haptic('light');
  }

  function sendChatAction(text) {
    if (!MabarState.roomId) return;
    sendPacket({
      type: 'player_chat',
      roomId: MabarState.roomId,
      senderId: MabarState.myId,
      playerId: MabarState.myId,
      name: MabarState.myName,
      text: text
    });
  }

  function sendEmoteAction(emoteName) {
    if (!MabarState.roomId) return;
    sendPacket({
      type: 'player_emote',
      roomId: MabarState.roomId,
      senderId: MabarState.myId,
      playerId: MabarState.myId,
      emote: emoteName
    });
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 6. ROOM MANAGEMENT (CREATE, JOIN, SHARE TELEGRAM)
  // ───────────────────────────────────────────────────────────────────────────
  function createRoom() {
    // Generate Room Code 4-karakter acak (misal: SAWIT-782)
    const randomCode = 'SAWIT-' + Math.floor(100 + Math.random() * 900);
    joinRoom(randomCode, true);
    return randomCode;
  }

  function joinRoom(roomId, isHost = false) {
    if (!roomId) return;
    const cleanRoomId = roomId.trim().toUpperCase();
    MabarState.roomId = cleanRoomId;
    MabarState.isHost = !!isHost;
    MabarState.otherPlayers = {};

    // Hubungkan WebSocket jika belum
    if (!MabarState.socket || MabarState.socket.readyState !== WebSocket.OPEN) {
      connectWebSocket(MabarState.serverUrl);
    }

    sendPacket({
      type: 'join_room',
      roomId: cleanRoomId,
      senderId: MabarState.myId,
      player: getMyPlayerPayload()
    });

    showNotification(`🎮 Terhubung ke Room: ${cleanRoomId}`);
    updateHUDMabarStatus();
    haptic('success');
  }

  function leaveRoom() {
    if (!MabarState.roomId) return;
    sendPacket({
      type: 'player_left',
      roomId: MabarState.roomId,
      senderId: MabarState.myId,
      playerId: MabarState.myId
    });
    MabarState.roomId = null;
    MabarState.isHost = false;
    MabarState.otherPlayers = {};
    updateHUDMabarStatus();
    showNotification('🚪 Keluar dari Room Mabar.');
  }

  // Bagikan link invite room ke kontak/grup Telegram
  function shareTelegramInvite() {
    if (!MabarState.roomId) {
      createRoom();
    }
    const roomId = MabarState.roomId;
    const bot = TelegramState.botUsername;
    const inviteUrl = `https://t.me/${bot}/app?startapp=${roomId}`;
    const textMsg = `🌴 Ayo mabar tanam & panen kelapa sawit bersamaku di Telegram! Masuk ke room: ${roomId}`;

    if (TelegramState.isInsideTelegram && tg?.openTelegramLink) {
      const shareLink = `https://t.me/share/url?url=${encodeURIComponent(inviteUrl)}&text=${encodeURIComponent(textMsg)}`;
      tg.openTelegramLink(shareLink);
    } else {
      // Fallback copy ke clipboard untuk browser biasa
      if (navigator.clipboard) {
        navigator.clipboard.writeText(inviteUrl);
      }
      showNotification(`📋 Link Mabar disalin: ${inviteUrl}`);
      alert(`Kode Room: ${roomId}\nLink Mabar: ${inviteUrl}\n(Bagikan ke teman Telegram Anda!)`);
    }
  }

  // Haptic feedback Telegram
  function haptic(type) {
    if (tg?.HapticFeedback) {
      try {
        if (type === 'chop') tg.HapticFeedback.impactOccurred('heavy');
        else if (type === 'success') tg.HapticFeedback.notificationOccurred('success');
        else tg.HapticFeedback.impactOccurred('light');
      } catch (_) {}
    }
  }

  function showNotification(msg) {
    if (window._antigravityGameState?.showNotification) {
      window._antigravityGameState.showNotification(msg);
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 7. INTERPOLASI & UPDATE POSISI PEMAIN LAIN DI GAME LOOP
  // ───────────────────────────────────────────────────────────────────────────
  function updateOtherPlayers(dt) {
    const now = Date.now();
    for (const id in MabarState.otherPlayers) {
      const op = MabarState.otherPlayers[id];

      // Smooth Lerp posisi (Interpolasi halus)
      if (op.targetX !== undefined) {
        op.x += (op.targetX - op.x) * Math.min(1, dt * 14);
      }
      if (op.targetY !== undefined) {
        op.y += (op.targetY - op.y) * Math.min(1, dt * 14);
      }

      // Durasi chat bubble
      if (op.chatTimer > 0) {
        op.chatTimer -= dt;
        if (op.chatTimer <= 0) op.chatText = null;
      }

      // Timeout jika pemain diam/terputus > 30 detik
      if (now - op.lastUpdate > 30000) {
        delete MabarState.otherPlayers[id];
      }
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 8. RENDERING KARAKTER PEMAIN LAIN 2.5D (HD SPRITE + TELEGRAM BADGE)
  // ───────────────────────────────────────────────────────────────────────────
  function drawOtherPlayer25D(ctx, op, px, py, parentState) {
    const scale = 1.08;
    const isWalking = !!op.isWalking;
    const walkFrame = op.walkFrame || 0;
    const facing = op.facing || 1;
    const lift = op.jumpY || 0;

    ctx.save();

    // 1. Bayangan Lembut Pemain di Tanah
    const shadowGrad = ctx.createRadialGradient(px, py, 2, px, py, 16 * scale);
    shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.45)');
    shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = shadowGrad;
    ctx.beginPath();
    ctx.ellipse(px, py, 16 * scale, 6 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Gambar Karakter Pemain Lain
    if (parentState.drawCharacter) {
      const look = parentState.lookOpts ? parentState.lookOpts(op.look || {}) : {};
      parentState.drawCharacter(ctx, px, py + lift, scale, {
        facing: facing,
        walking: isWalking,
        walkFrame: walkFrame,
        air: lift < -2,
        lift: lift,
        name: '', // Digambar custom dengan badge Telegram di bawah
        ...look
      });
    }

    // 3. Animasi Ayunan Alat Pemain Lain
    if (op.swingAnim > 0) {
      ctx.save();
      ctx.translate(px + facing * 18, py - 35 + lift);
      ctx.rotate(-1.8 * facing);
      ctx.fillStyle = '#8d6e63';
      ctx.fillRect(-2, -26, 4, 30);
      ctx.fillStyle = '#cfd8dc';
      ctx.fillRect(-12, -30, 24, 8);
      ctx.restore();
    }

    // 4. Badge Nama Telegram & Status Teman di Atas Kepala
    const tagY = py - 78 + lift;
    const nameStr = (op.name || 'Teman').substring(0, 14);

    // Kotak nama semi-transparan
    ctx.fillStyle = 'rgba(9, 14, 26, 0.85)';
    const textW = Math.max(70, nameStr.length * 8 + 24);
    if (parentState.roundRect) {
      parentState.roundRect(ctx, px - textW / 2, tagY - 14, textW, 20, 5);
    } else {
      ctx.fillRect(px - textW / 2, tagY - 14, textW, 20);
    }
    ctx.fill();
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Ikon & Nama
    ctx.fillStyle = '#00f0ff';
    ctx.font = 'bold 10px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`👥 ${nameStr}`, px, tagY);

    // 5. Balon Chat Mengambang Jika Ada
    if (op.chatText) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      const cW = Math.min(180, op.chatText.length * 7 + 20);
      ctx.fillRect(px - cW / 2, tagY - 42, cW, 24);
      ctx.fillStyle = '#0f172a';
      ctx.font = '11px sans-serif';
      ctx.fillText(op.chatText.substring(0, 24), px, tagY - 26);
    }

    ctx.restore();
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 9. UI MODAL MABAR & HUD STATUS
  // ───────────────────────────────────────────────────────────────────────────
  function updateHUDMabarStatus() {
    const btn = document.getElementById('btn-mabar');
    if (btn) {
      if (MabarState.roomId) {
        btn.classList.add('active');
        btn.title = `Mabar Aktif (Room: ${MabarState.roomId})`;
      } else {
        btn.classList.remove('active');
        btn.title = 'Mabar Telegram 👥';
      }
    }
  }

  function openMabarModal() {
    const modalBody = document.getElementById('modal-body');
    const modalOverlay = document.getElementById('modal-overlay');
    if (!modalBody || !modalOverlay) return;

    const isConnected = !!MabarState.roomId;
    const otherCount = Object.keys(MabarState.otherPlayers).length;

    modalBody.innerHTML = `
      <div style="font-family:'Outfit',sans-serif; color:#f8fafc; padding:10px;">
        <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
          <span style="font-size:2rem;">👥</span>
          <div>
            <h3 style="margin:0; font-size:1.3rem; color:#00f0ff;">Mabar Telegram (Multiplayer)</h3>
            <p style="margin:4px 0 0; font-size:0.85rem; color:#94a3b8;">Main bareng panen kelapa sawit bersama teman Telegram!</p>
          </div>
        </div>

        <!-- Profil Saya -->
        <div style="background:#1e293b; border-radius:10px; padding:12px; margin-bottom:14px; border:1px solid #334155;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <div style="font-size:0.75rem; color:#64748b; text-transform:uppercase; letter-spacing:0.5px;">Akun Anda:</div>
              <div style="font-size:1.05rem; font-weight:700; color:#ffffff;">${TelegramState.user ? `📱 ${TelegramState.user.first_name}` : `👤 ${MabarState.myName}`}</div>
            </div>
            <div style="text-align:right;">
              <span style="display:inline-block; padding:4px 10px; border-radius:20px; font-size:0.75rem; font-weight:700; ${isConnected ? 'background:#166534; color:#86efac;' : 'background:#334155; color:#94a3b8;'}">
                ${isConnected ? `🟢 Room: ${MabarState.roomId}` : '⚪ Solo Mode'}
              </span>
            </div>
          </div>
        </div>

        ${!isConnected ? `
          <!-- Buat Room Baru -->
          <div style="margin-bottom:14px;">
            <button id="btn-create-room" style="width:100%; padding:14px; border-radius:10px; background:linear-gradient(135deg, #059669, #10b981); color:#ffffff; font-weight:700; font-size:1rem; border:none; cursor:pointer; box-shadow:0 4px 12px rgba(16,185,129,0.3);">
              🌴 Buat Room Mabar Baru
            </button>
          </div>

          <!-- Gabung Room Teman -->
          <div style="background:#0f172a; border-radius:10px; padding:12px; margin-bottom:14px; border:1px solid #334155;">
            <div style="font-size:0.85rem; font-weight:600; margin-bottom:8px; color:#cbd5e1;">Punya Kode Room dari Teman?</div>
            <div style="display:flex; gap:8px;">
              <input type="text" id="input-room-code" placeholder="Misal: SAWIT-782" maxlength="12" style="flex:1; padding:10px 12px; border-radius:8px; background:#1e293b; border:1px solid #475569; color:#ffffff; font-size:0.95rem; text-transform:uppercase;" />
              <button id="btn-join-room" style="padding:10px 18px; border-radius:8px; background:#2563eb; color:#ffffff; font-weight:700; border:none; cursor:pointer;">
                Gabung
              </button>
            </div>
          </div>
        ` : `
          <!-- Tampilan Saat Sudah Terhubung -->
          <div style="background:#0f172a; border-radius:10px; padding:14px; margin-bottom:14px; border:1px solid #10b981;">
            <div style="text-align:center; margin-bottom:12px;">
              <div style="font-size:0.8rem; color:#94a3b8;">KODE ROOM KAMU:</div>
              <div style="font-size:1.8rem; font-weight:800; color:#34d399; letter-spacing:2px; margin:4px 0;">${MabarState.roomId}</div>
              <div style="font-size:0.8rem; color:#64748b;">${otherCount} Teman sedang online di kebun</div>
            </div>

            <!-- Tombol Ajak Teman Telegram -->
            <button id="btn-share-telegram" style="width:100%; padding:12px; border-radius:8px; background:linear-gradient(135deg, #0284c7, #38bdf8); color:#ffffff; font-weight:700; font-size:0.95rem; border:none; cursor:pointer; margin-bottom:8px; display:flex; align-items:center; justify-content:center; gap:8px;">
              <span>📱</span> Ajak Teman di Telegram (Kirim Link)
            </button>

            <!-- Tombol Keluar Room -->
            <button id="btn-leave-room" style="width:100%; padding:10px; border-radius:8px; background:#ef4444; color:#ffffff; font-weight:600; font-size:0.85rem; border:none; cursor:pointer;">
              🚪 Keluar dari Room
            </button>
          </div>
        `}

        <!-- Daftar Teman di Kebun -->
        <div style="font-size:0.85rem; font-weight:600; margin-bottom:8px; color:#cbd5e1;">👥 Teman di Pulau Ini:</div>
        <div id="mabar-player-list" style="max-height:120px; overflow-y:auto; background:#0f172a; border-radius:8px; padding:8px; border:1px solid #1e293b;">
          <div style="display:flex; justify-content:space-between; padding:6px 8px; font-size:0.85rem; color:#38bdf8; border-bottom:1px solid #1e293b;">
            <span>⭐ ${MabarState.myName} (Anda)</span>
            <span style="color:#4ade80;">Host</span>
          </div>
          ${Object.values(MabarState.otherPlayers).map(op => `
            <div style="display:flex; justify-content:space-between; padding:6px 8px; font-size:0.85rem; color:#f1f5f9; border-bottom:1px solid #1e293b;">
              <span>👤 ${op.name}</span>
              <span style="color:#00f0ff;">Online</span>
            </div>
          `).join('') || (otherCount === 0 && isConnected ? '<div style="padding:8px; font-size:0.8rem; color:#64748b; text-align:center;">Menunggu teman bergabung...</div>' : '')}
        </div>
      </div>
    `;

    modalOverlay.classList.remove('hidden');

    // Event listeners tombol modal
    const btnCreate = document.getElementById('btn-create-room');
    if (btnCreate) {
      btnCreate.addEventListener('click', () => {
        const code = createRoom();
        openMabarModal();
      });
    }

    const btnJoin = document.getElementById('btn-join-room');
    if (btnJoin) {
      btnJoin.addEventListener('click', () => {
        const input = document.getElementById('input-room-code');
        const code = input?.value?.trim();
        if (code) {
          joinRoom(code);
          openMabarModal();
        }
      });
    }

    const btnShare = document.getElementById('btn-share-telegram');
    if (btnShare) {
      btnShare.addEventListener('click', () => {
        shareTelegramInvite();
      });
    }

    const btnLeave = document.getElementById('btn-leave-room');
    if (btnLeave) {
      btnLeave.addEventListener('click', () => {
        leaveRoom();
        openMabarModal();
      });
    }
  }

  // Cek jika Telegram dibuka lewat link invite (?startapp=ROOM_CODE)
  function checkTelegramStartParam() {
    if (TelegramState.startParam) {
      console.log('[Telegram Mabar] Menemukan invite room dari link:', TelegramState.startParam);
      setTimeout(() => {
        joinRoom(TelegramState.startParam);
      }, 1500);
    }
  }

  // Jalankan cek invite saat game siap
  window.addEventListener('DOMContentLoaded', () => {
    checkTelegramStartParam();
  });

  // ───────────────────────────────────────────────────────────────────────────
  // 10. EXPOSE KE GLOBAL WINDOW UNTUK SAWIT.JS & GAME.JS
  // ───────────────────────────────────────────────────────────────────────────
  window.MabarNetwork = {
    state: MabarState,
    telegram: TelegramState,
    connect: connectWebSocket,
    createRoom: createRoom,
    joinRoom: joinRoom,
    leaveRoom: leaveRoom,
    shareInvite: shareTelegramInvite,
    openModal: openMabarModal,
    haptic: haptic,
    sendMove: sendMyMovement,
    sendChop: sendChopAction,
    sendPlant: sendPlantAction,
    sendChat: sendChatAction,
    sendEmote: sendEmoteAction,
    update: updateOtherPlayers,
    drawOtherPlayer: drawOtherPlayer25D,
    get otherPlayers() { return MabarState.otherPlayers; }
  };

})(window);
