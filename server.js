// =============================================================================
// SAWIT & SHIBUYA MULTIPLAYER GAME SERVER (TELEGRAM TMA COMPATIBLE)
// Zero-Dependency Pure Node.js WebSocket & HTTP Server
// Port default: 3000 (atau process.env.PORT di cloud hosting Render/Railway)
// =============================================================================

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const ROOT_DIR = __dirname;

// MIME Types untuk Static File Serving
const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.webp': 'image/webp'
};

// ─────────────────────────────────────────────────────────────────────────────
// 1. HTTP SERVER (STATIC GAME ASSETS)
// ─────────────────────────────────────────────────────────────────────────────
const server = http.createServer((req, res) => {
  // CORS Headers untuk Telegram Mini App
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  let reqPath = decodeURI(req.url.split('?')[0]);
  if (reqPath === '/' || reqPath === '') reqPath = '/index.html';

  const filePath = path.normalize(path.join(ROOT_DIR, reqPath));

  // Pastikan tidak path traversal di luar direktori game
  if (!filePath.startsWith(ROOT_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. WEBSOCKET SERVER (RFC 6455 ZERO-DEPENDENCY IMPLEMENTATION)
// ─────────────────────────────────────────────────────────────────────────────
const rooms = new Map(); // roomId -> Set of client sockets

server.on('upgrade', (req, socket, head) => {
  const key = req.headers['sec-websocket-key'];
  if (!key) {
    socket.destroy();
    return;
  }

  // SHA-1 Handshake response sesuai spesifikasi RFC 6455
  const acceptKey = crypto
    .createHash('sha1')
    .update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11')
    .digest('base64');

  const headers = [
    'HTTP/1.1 101 Switching Protocols',
    'Upgrade: websocket',
    'Connection: Upgrade',
    `Sec-WebSocket-Accept: ${acceptKey}`
  ];

  socket.write(headers.join('\r\n') + '\r\n\r\n');

  // Socket setup
  socket.roomId = null;
  socket.playerId = null;
  socket.playerName = null;

  socket.on('data', buffer => {
    handleWebSocketFrame(socket, buffer);
  });

  socket.on('close', () => {
    handleClientDisconnect(socket);
  });

  socket.on('error', () => {
    handleClientDisconnect(socket);
  });
});

// Parser WebSocket Frame RFC 6455
function handleWebSocketFrame(socket, buffer) {
  if (buffer.length < 2) return;

  const firstByte = buffer[0];
  const secondByte = buffer[1];
  const opcode = firstByte & 0x0f;

  // Opcode 8: Close frame
  if (opcode === 8) {
    socket.end();
    return;
  }

  // Opcode 9: Ping frame -> balas Pong
  if (opcode === 9) {
    sendWebSocketFrame(socket, Buffer.alloc(0), 10);
    return;
  }

  // Hanya terima Text Frame (Opcode 1)
  if (opcode !== 1) return;

  const isMasked = (secondByte & 0x80) !== 0;
  let payloadLength = secondByte & 0x7f;
  let currentOffset = 2;

  if (payloadLength === 126) {
    payloadLength = buffer.readUInt16BE(2);
    currentOffset = 4;
  } else if (payloadLength === 127) {
    payloadLength = Number(buffer.readBigUInt64BE(2));
    currentOffset = 10;
  }

  let maskingKey = null;
  if (isMasked) {
    maskingKey = buffer.slice(currentOffset, currentOffset + 4);
    currentOffset += 4;
  }

  const payload = buffer.slice(currentOffset, currentOffset + payloadLength);
  if (isMasked && maskingKey) {
    for (let i = 0; i < payload.length; i++) {
      payload[i] ^= maskingKey[i % 4];
    }
  }

  try {
    const text = payload.toString('utf8');
    const msg = JSON.parse(text);
    processMessage(socket, msg);
  } catch (err) {
    // Abaikan paket rusak
  }
}

// Encode WebSocket Frame keluar ke client
function sendWebSocketFrame(socket, dataBuffer, opcode = 1) {
  const length = dataBuffer.length;
  let header;

  if (length <= 125) {
    header = Buffer.alloc(2);
    header[0] = 0x80 | opcode; // FIN + opcode
    header[1] = length; // Unmasked dari server ke client
  } else if (length <= 65535) {
    header = Buffer.alloc(4);
    header[0] = 0x80 | opcode;
    header[1] = 126;
    header.writeUInt16BE(length, 2);
  } else {
    header = Buffer.alloc(10);
    header[0] = 0x80 | opcode;
    header[1] = 127;
    header.writeBigUInt64BE(BigInt(length), 2);
  }

  try {
    socket.write(Buffer.concat([header, dataBuffer]));
  } catch (_) {}
}

function sendJson(socket, obj) {
  const jsonStr = JSON.stringify(obj);
  sendWebSocketFrame(socket, Buffer.from(jsonStr, 'utf8'));
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. LOGIKA ROOM & BROADCAST MULTIPLAYER
// ─────────────────────────────────────────────────────────────────────────────
function processMessage(socket, msg) {
  if (!msg || !msg.type) return;

  switch (msg.type) {
    case 'join_room': {
      const roomId = (msg.roomId || 'DEFAULT').toUpperCase();
      socket.roomId = roomId;

      if (msg.player) {
        socket.playerId = msg.player.id;
        socket.playerName = msg.player.name;
      }

      if (!rooms.has(roomId)) {
        rooms.set(roomId, new Set());
      }
      const room = rooms.get(roomId);
      room.add(socket);

      console.log(`[Mabar] Player ${socket.playerName || socket.playerId} joined room: ${roomId} (${room.size} players)`);

      // Beritahu anggota room lain bahwa pemain ini bergabung
      broadcastToRoom(roomId, {
        type: 'player_joined',
        roomId: roomId,
        player: msg.player
      }, socket);

      // Kirim daftar pemain yang sudah ada di room kepada pemain baru
      const existingPlayers = [];
      room.forEach(s => {
        if (s !== socket && s.playerId) {
          existingPlayers.push({
            id: s.playerId,
            name: s.playerName
          });
        }
      });

      sendJson(socket, {
        type: 'room_state',
        roomId: roomId,
        players: existingPlayers
      });
      break;
    }

    case 'player_move':
    case 'player_chop':
    case 'player_plant':
    case 'player_chat':
    case 'player_emote':
    case 'player_sync': {
      const roomId = socket.roomId || msg.roomId;
      if (roomId) {
        broadcastToRoom(roomId, msg, socket);
      }
      break;
    }

    case 'player_left': {
      handleClientDisconnect(socket);
      break;
    }
  }
}

function broadcastToRoom(roomId, data, senderSocket) {
  const room = rooms.get(roomId);
  if (!room) return;

  const jsonBuf = Buffer.from(JSON.stringify(data), 'utf8');
  room.forEach(client => {
    if (client !== senderSocket && client.writable) {
      sendWebSocketFrame(client, jsonBuf);
    }
  });
}

function handleClientDisconnect(socket) {
  if (socket.roomId && rooms.has(socket.roomId)) {
    const room = rooms.get(socket.roomId);
    room.delete(socket);

    if (socket.playerId) {
      broadcastToRoom(socket.roomId, {
        type: 'player_left',
        roomId: socket.roomId,
        playerId: socket.playerId
      }, socket);
      console.log(`[Mabar] Player ${socket.playerName || socket.playerId} left room: ${socket.roomId}`);
    }

    if (room.size === 0) {
      rooms.delete(socket.roomId);
      console.log(`[Mabar] Room ${socket.roomId} closed (empty).`);
    }
    socket.roomId = null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. JALANKAN SERVER
// ─────────────────────────────────────────────────────────────────────────────
server.listen(PORT, () => {
  console.log('====================================================');
  console.log(`🌴 SAWIT & SHIBUYA MULTIPLAYER SERVER BERJALAN!`);
  console.log(`🌐 Akses Game: http://localhost:${PORT}`);
  console.log(`📡 WebSocket:  ws://localhost:${PORT}`);
  console.log(`📱 Siap untuk Telegram Mini App & Mabar Online!`);
  console.log('====================================================');
});
