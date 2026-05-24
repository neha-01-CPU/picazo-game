const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.static('public'));

app.get('/r/:roomCode', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*", methods: ["GET", "POST"] } });

const PROFANITY = [
  'fuck', 'shit', 'bitch', 'asshole', 'cunt', 'dick', 'faggot',
  'nigger', 'bastard', 'slut', 'whore', 'kys', 'retard'
];

// Compile the regex ONCE when the server starts
const PROFANITY_REGEX = new RegExp(`\\b(${PROFANITY.join('|')})\\b`, 'gi');

function cleanText(str) {
  if (!str) return str;
  return str.replace(PROFANITY_REGEX, '***');
}

function getEditDistance(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) matrix[i][j] = matrix[i - 1][j - 1];
      else matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1));
    }
  }
  return matrix[b.length][a.length];
}

const WORD_BANK = [
  // --- Original Words ---
  {w:'waffle'}, {w:'microscope'}, {w:'pancake'}, {w:'umbrella'}, {w:'magnet'},
  {w:'scarecrow'}, {w:'pigeon'}, {w:'octopus'}, {w:'backpack'}, {w:'spaceship'},
  {w:'bicycle'}, {w:'skateboard'}, {w:'camera'}, {w:'starfish'}, {w:'treasure'},
  {w:'koala'}, {w:'bridge'}, {w:'helicopter'}, {w:'hamburger'}, {w:'ladder'},
  {w:'robot'}, {w:'volcano'}, {w:'avocado'}, {w:'mermaid'}, {w:'motorcycle'},
  {w:'origami'}, {w:'guitar'}, {w:'crown'}, {w:'staircase'}, {w:'chameleon'},
  {w:'briefcase'}, {w:'submarine'}, {w:'telescope'}, {w:'snowflake'}, {w:'sunflower'},
  {w:'detective'}, {w:'skeleton'}, {w:'snowman'}, {w:'hotdog'}, {w:'pineapple'},
  {w:'sushi'}, {w:'sword'}, {w:'igloo'}, {w:'vampire'}, {w:'chandelier'},
  {w:'parachute'}, {w:'waterfall'}, {w:'drum'}, {w:'laptop'}, {w:'sandwich'},
  {w:'escalator'}, {w:'carousel'}, {w:'microphone'}, {w:'elephant'}, {w:'french fries'},
  {w:'fireworks'}, {w:'dragon'}, {w:'seahorse'}, {w:'thermometer'}, {w:'keyboard'},
  {w:'tractor'}, {w:'ambulance'}, {w:'smoothie'}, {w:'bookshelf'}, {w:'penguin'},
  {w:'kangaroo'}, {w:'pyramid'}, {w:'compass'}, {w:'treadmill'}, {w:'boomerang'},
  {w:'tornado'}, {w:'scissors'}, {w:'lipstick'}, {w:'joystick'}, {w:'rollercoaster'},
  {w:'cheeseburger'}, {w:'astronaut'}, {w:'ghost'}, {w:'unicorn'}, {w:'milkshake'},
  {w:'balloon'}, {w:'shopping cart'}, {w:'earrings'}, {w:'spatula'}, {w:'diamond'},
  {w:'typewriter'}, {w:'zebra'}, {w:'hurricane'}, {w:'giraffe'}, {w:'blanket'},
  {w:'palette'}, {w:'watermelon'}, {w:'squirrel'}, {w:'brain'}, {w:'cactus'},
  {w:'pajamas'}, {w:'wheelchair'}, {w:'sunglasses'}, {w:'bracelet'}, {w:'iceberg'},
  {w:'pretzel'}, {w:'lighthouse'}, {w:'lemonade'}, {w:'meteor'}, {w:'castle'},
  {w:'beehive'}, {w:'croissant'}, {w:'surfboard'}, {w:'shield'}, {w:'aliens'},
  {w:'ferris wheel'}, {w:'chopsticks'}, {w:'statue'}, {w:'necklace'}, {w:'pizza'},
  {w:'dinosaur'}, {w:'battery'}, {w:'snowboard'}, {w:'trampoline'}, {w:'toaster'},
  {w:'lantern'}, {w:'jellyfish'}, {w:'mailbox'}, {w:'lightning'}, {w:'stethoscope'},
  {w:'eyeball'}, {w:'hourglass'}, {w:'popcorn'}, {w:'rainbow'}, {w:'spaghetti'},
  {w:'yo-yo'}, {w:'flamingo'}, {w:'anchor'}, {w:'trophy'}, {w:'hammock'},
  {w:'microchip'}, {w:'scooter'}, {w:'binoculars'}, {w:'toothbrush'}, {w:'campfire'},
  {w:'mirror'}, {w:'firetruck'}, {w:'windmill'}, {w:'mushroom'}, {w:'satellite'},
  {w:'elevator'},
  
  // --- Indian Vibe Words ---
  {w: 'Girlfriend'}, {w: 'Best Friend'}, {w: 'Arranged Marriage'}, 
  {w: 'Dating App'}, {w: 'Toxic Relationship'}, {w: 'First Date'}, 
  {w: 'Wedding Season'}, {w: 'Joint Family'}, {w: 'Love Letter'},
  {w: 'Traffic Jam'}, {w: 'Autorickshaw'}, {w: 'Street Food'}, 
  {w: 'Spicy Food'}, {w: 'Monday Morning'}, {w: 'Power Cut'}, 
  {w: 'Public Transport'}, {w: 'Cricket Match'}, {w: 'Exam Stress'}, 
  {w: 'Work From Home'}, {w: 'Summer Vacation'}, {w: 'Local Train'},
  {w: 'Tea Time'}, {w: 'Heavy Rain'}, {w: 'Waiting Room'}, 
  {w: 'House Party'}, {w: 'Tech Support'}, {w: 'Mobile Charger'},
  {w: 'Late Night'}, {w: 'Shopping Spree'}, {w: 'Cricket Worldcup'}, 
  {w: 'Food Delivery'}, {w: 'Lost Keys'}, {w: 'Early Morning'}, 
  {w: 'Video Call'}, {w: 'Bad WiFi'}, {w: 'Full Battery'}, 
  {w: 'Hidden Treasure'}, {w: 'School Bus'}, {w: 'Gym Workout'},
  {w: 'Cinema Hall'}, {w: 'Flight Delay'}, {w: 'Online Shopping'},
  {w: 'Office Desk'}, {w: 'Dream Job'}, {w: 'Empty Wallet'},
  {w: 'Night Shift'}, {w: 'Sunday Brunch'}, {w: 'Speed Breaker'},
  {w: 'Traffic Police'}, {w: 'Railway Station'}, {w: 'Highway Toll'}, 
  {w: 'Reserved Seat'}, {w: 'Rush Hour'}, {w: 'Parking Lot'}, 
  {w: 'Conference Call'}, {w: 'Office Canteen'}, {w: 'Final Exam'}, 
  {w: 'Group Study'}, {w: 'Library Desk'}, {w: 'Internship Search'}, 
  {w: 'Coffee Machine'}, {w: 'Job Interview'}, {w: 'Project Report'}, 
  {w: 'Late Submission'}, {w: 'Campus Life'}, {w: 'Ceiling Fan'}, 
  {w: 'Power Failure'}, {w: 'Water Tank'}, {w: 'Morning Newspaper'}, 
  {w: 'Utility Bill'}, {w: 'Dining Table'}, {w: 'Balcony View'}, 
  {w: 'Guest Room'}, {w: 'Shopping Mall'}, {w: 'Family Dinner'}, 
  {w: 'Birthday Surprise'}, {w: 'Wedding Guest'}, {w: 'Movie Ticket'}, 
  {w: 'Holiday Trip'}, {w: 'Health Checkup'}, {w: 'Fitness Center'}, 
  {w: 'Rickshaw'}, {w: 'Monsoon'}, {w: 'Pothole'}, {w: 'Honking'}, 
  {w: 'Canteen'}, {w: 'Syllabus'}, {w: 'Appraisal'}, {w: 'Deadline'}, 
  {w: 'Veranda'}, {w: 'Newspaper'}, {w: 'Chai'}, {w: 'Samosa'}, 
  {w: 'Festival'}, {w: 'Wedding'}, {w: 'Neighbour'}, {w: 'Gossip'},
  {w: 'Cricket'}, {w: 'Salary'}, {w: 'Invitation'}, {w: 'Reunion'},
  {w: 'Picnic'}
];

const rooms = {};

setInterval(() => {
  for (const roomId in rooms) {
    if (getActivePlayers(rooms[roomId]).length === 0) {
      clearInterval(rooms[roomId].timerInt);
      delete rooms[roomId];
    }
  }
}, 300000);

function shuffleArray(array) {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
}

function getRoom(roomId, settings) {
  if (!rooms[roomId]) {
    rooms[roomId] = {
      id: roomId, players: [], hostId: null, isPrivate: false,
      gameInProgress: false, strokeHistory: [], baseCanvasImage: null,
      timerInt: null, currentPhase: 'lobby', timeLeft: 0,
      currentWord: '', currentChoices: [], currentDrawerId: null,
      round: 1, turnsThisRound: 0,
      totalRounds: settings?.rounds || 3,
      drawTime: settings?.drawTime || 85,
      hintIntensity: settings?.hints || 'medium',
      maxPlayers: settings?.maxPlayers || 8,
      hintsFired: 0, revealedIdx: [], kickVotes: {},
      bannedSessions: new Set(), wordBank: null, shuffleBag: []
    };
  }
  return rooms[roomId];
}

function getActivePlayers(room) { return room.players.filter(p => p.connected); }

function getNextDrawerId(room) {
  const active = getActivePlayers(room);
  if (active.length === 0) return null;
  const idx = active.findIndex(p => p.id === room.currentDrawerId);
  if (idx === -1) return active[0].id;
  return active[(idx + 1) % active.length].id;
}

function getMaskedWord(room, playerId) {
  if (room.currentPhase !== 'drawing') return '';
  if (playerId === room.currentDrawerId) return room.currentWord;
  return room.currentWord.split('').map((c, i) =>
    room.revealedIdx.includes(i) ? c : (c === ' ' ? ' ' : '_')
  ).join('');
}

// Build the safe lobby state payload
function getLobbyState(room) {
  return {
    players: getActivePlayers(room).map(p => ({
      id: p.id, name: p.name, avatarDef: p.avatarDef,
      score: p.score, role: p.role, connected: p.connected
    })),
    hostId: room.hostId,
    settings: {
      maxPlayers: room.maxPlayers,
      rounds: room.totalRounds,
      drawTime: room.drawTime,
      hints: room.hintIntensity
    }
  };
}

// Transfer host crown to next available active player
function reassignHost(room) {
  const active = getActivePlayers(room);
  if (active.length === 0) return;
  const newHost = active.find(p => p.id !== room.hostId) || active[0];
  room.hostId = newHost.id;
  room.players.forEach(p => { p.role = (p.id === newHost.id) ? 'host' : 'player'; });
  io.to(room.id).emit('hostChanged', { newHostId: newHost.id, newHostName: newHost.name });
  io.to(room.id).emit('lobbyState', getLobbyState(room));
}

function broadcastState(room) {
  const active = getActivePlayers(room);
  active.forEach(p => {
    io.to(p.socketId).emit('gameState', {
      phase: room.currentPhase, time: room.timeLeft,
      drawTime: room.drawTime,
      word: getMaskedWord(room, p.id),
      drawerId: room.currentDrawerId, round: room.round, totalRounds: room.totalRounds,
      players: active, revealedIdx: room.revealedIdx, hostId: room.hostId
    });
  });
}

function startWordSelection(room) {
  const active = getActivePlayers(room);
  if (active.length < 2) {
    room.gameInProgress = false; room.currentPhase = 'lobby'; io.to(room.id).emit('gameAborted'); return;
  }
  room.currentPhase = 'picking'; room.timeLeft = 15; room.currentWord = '';
  room.revealedIdx = []; room.hintsFired = 0; room.strokeHistory = []; room.baseCanvasImage = null;
  room.players.forEach(p => p.guessed = false);
  const activeBank = room.wordBank || WORD_BANK;
  if (!room.shuffleBag || room.shuffleBag.length < 3) room.shuffleBag = shuffleArray([...activeBank]);
  room.currentChoices = [room.shuffleBag.pop(), room.shuffleBag.pop(), room.shuffleBag.pop()];
  const drawer = room.players.find(p => p.id === room.currentDrawerId);
  broadcastState(room);
  if (drawer && drawer.socketId) io.to(drawer.socketId).emit('yourTurn', room.currentChoices);
  clearInterval(room.timerInt);
  room.timerInt = setInterval(() => {
    room.timeLeft--;
    io.to(room.id).emit('timeTick', { time: room.timeLeft, phase: room.currentPhase });
    if (room.timeLeft <= 0) handleWordPicked(room, room.currentChoices[0].w);
  }, 1000);
}

function handleWordPicked(room, word) {
  clearInterval(room.timerInt);
  room.currentPhase = 'drawing'; room.currentWord = word; room.timeLeft = room.drawTime;
  broadcastState(room);
  const active = getActivePlayers(room);
  active.forEach(p => { io.to(p.socketId).emit('wordPicked', getMaskedWord(room, p.id)); });
  room.timerInt = setInterval(() => {
    room.timeLeft--;
    io.to(room.id).emit('timeTick', { time: room.timeLeft, phase: room.currentPhase });
    let hintTriggers = [];
    if (room.hintIntensity === 'slow') hintTriggers = [0.5];
    else if (room.hintIntensity === 'medium') hintTriggers = [0.66, 0.33];
    else if (room.hintIntensity === 'fast') hintTriggers = [0.75, 0.50, 0.25];
    const triggerSeconds = hintTriggers.map(m => Math.floor(room.drawTime * m));
    if (triggerSeconds.includes(room.timeLeft)) {
      const unrevealed = room.currentWord.split('').map((_,i)=>i).filter(i => !room.revealedIdx.includes(i) && room.currentWord[i] !== ' ');
      if (unrevealed.length > 1) {
        const idx = unrevealed[Math.floor(Math.random() * unrevealed.length)];
        room.revealedIdx.push(idx);
        io.to(room.id).emit('hintRevealed', { idx: idx, char: room.currentWord[idx] });
      }
    }
    if (room.timeLeft <= 0) endTurn(room, false);
  }, 1000);
}

function endTurn(room, allGuessed) {
  clearInterval(room.timerInt);
  room.currentPhase = 'roundEnd'; room.timeLeft = 4;
  const active = getActivePlayers(room);
  io.to(room.id).emit('timeUp', { phase: 'drawing', word: room.currentWord, allGuessed: allGuessed, players: active });
  room.timerInt = setInterval(() => {
    room.timeLeft--;
    io.to(room.id).emit('timeTick', { time: room.timeLeft, phase: room.currentPhase });
    if (room.timeLeft <= 0) {
      clearInterval(room.timerInt);
      const currentActive = getActivePlayers(room);
      if (currentActive.length < 2) {
        room.gameInProgress = false; room.currentPhase = 'lobby'; io.to(room.id).emit('gameAborted');
        if (room.isPrivate) { io.to(room.id).emit('lobbyState', getLobbyState(room)); io.to(room.id).emit('returnToLobby'); }
        return;
      }
      room.turnsThisRound++;
      if (room.turnsThisRound >= currentActive.length) { room.round++; room.turnsThisRound = 0; }
      const isLastTurn = room.round > room.totalRounds;
      if (isLastTurn) {
        room.currentPhase = 'gameOver'; room.gameInProgress = false;
        io.to(room.id).emit('timeUp', { phase: 'gameOver', players: currentActive });
      } else {
        room.currentDrawerId = getNextDrawerId(room); startWordSelection(room);
      }
    }
  }, 1000);
}

io.on('connection', (socket) => {
  console.log('⚡ Connected! Socket:', socket.id);
  socket.eventCount = 0;
  
  // 🔥 NEW: Timestamp-based rate limiting (zero background timers!)
  socket.lastEventReset = Date.now();
  socket.use((packet, next) => {
    const now = Date.now();
    if (now - socket.lastEventReset > 1000) {
      socket.eventCount = 0;
      socket.lastEventReset = now;
    }
    next();
  });

  socket.on('joinGame', (userData) => {
    try {
      let roomId = userData.roomId;
      const isPrivateRoom = !!roomId;

      if (!roomId) {
        let found = false;
        for (const key in rooms) {
          if (key.startsWith('public-')) {
            const roomObj = rooms[key];
            if (!roomObj.isPrivate && getActivePlayers(roomObj).length < roomObj.maxPlayers) {
              roomId = key; found = true; break;
            }
          }
        }
        if (!found) {
          do { roomId = 'public-' + Math.random().toString(36).substr(2, 6); } while (rooms[roomId]);
        }
      }

      const room = getRoom(roomId, userData.settings);
      if (room.bannedSessions.has(userData.sessionId)) { socket.emit('kicked'); socket.disconnect(); return; }

      if (userData.customWords && userData.customWords.length > 0) {
        if (!room.wordBank) {
          let safeWords = userData.customWords.map(w => w.trim().substring(0, 30)).filter(w => w.length > 0);
          let uniqueWords = [...new Set(safeWords)];
          let customObjs = uniqueWords.map(w => ({ w: w, e: '✨' }));
          if (customObjs.length < 3) customObjs = customObjs.concat(WORD_BANK).slice(0, 3);
          room.wordBank = customObjs; room.shuffleBag = [];
        } else {
          socket.emit('receiveChat', { type: 'system', name: '', text: `ℹ️ Using the host's custom words.` });
        }
      }

      socket.roomId = roomId; socket.join(roomId);
      let p = room.players.find(pl => pl.id === userData.sessionId);
      let safeName = (userData.name || 'Player').substring(0, 20);

      if (p) {
        if (p.disconnectTimer) clearTimeout(p.disconnectTimer);
        p.socketId = socket.id; p.connected = true; p.name = safeName; p.avatarDef = userData.avatarDef;
        socket.broadcast.to(room.id).emit('receiveChat', { type: 'system', name: '', text: `⚡ ${p.name} reconnected!` });
      } else {
        const isFirstPlayer = room.players.length === 0;
        const role = (isFirstPlayer && isPrivateRoom) ? 'host' : 'player';
        p = { id: userData.sessionId, socketId: socket.id, name: safeName, avatarDef: userData.avatarDef, score: 0, guessed: false, connected: true, role };
        room.players.push(p);
        if (isFirstPlayer && isPrivateRoom) { room.hostId = p.id; room.isPrivate = true; }
      }

      const active = getActivePlayers(room);
      socket.broadcast.to(room.id).emit('playerJoined', { id: p.id, name: p.name, avatarDef: p.avatarDef, score: p.score, guessed: p.guessed, role: p.role });
      if (active.length > room.maxPlayers) { socket.emit('kicked'); socket.disconnect(); return; }

      if (room.gameInProgress) {
        socket.emit('gameState', {
          phase: room.currentPhase, time: room.timeLeft, word: getMaskedWord(room, p.id),
          drawerId: room.currentDrawerId, round: room.round, totalRounds: room.totalRounds,
          players: active, revealedIdx: room.revealedIdx, hostId: room.hostId
        });
        if (room.currentPhase === 'picking' && room.currentDrawerId === p.id) socket.emit('yourTurn', room.currentChoices);
        if (room.currentPhase === 'drawing') {
          socket.emit('catchUpSync', {
            drawerId: room.currentDrawerId, baseCanvasImage: room.baseCanvasImage, strokes: room.strokeHistory,
            phase: room.currentPhase, word: getMaskedWord(room, p.id), time: room.timeLeft,
            drawTime: room.drawTime, revealedIdx: room.revealedIdx
          });
        }
      } else {
        // Send lobby state — includes host info and settings
        socket.emit('lobbyState', getLobbyState(room));
        io.to(room.id).emit('lobbyState', getLobbyState(room));

        // Public rooms auto-start; private rooms wait for host
        if (!room.isPrivate && active.length >= 2 && !room.gameInProgress && room.currentPhase === 'lobby') {
          room.gameInProgress = true; room.round = 1; room.turnsThisRound = 0; room.currentDrawerId = active[0].id;
          room.players.forEach(pl => { pl.score = 0; pl.guessed = false; });
          clearInterval(room.timerInt);
          setTimeout(() => { io.to(room.id).emit('forceStartGame'); startWordSelection(room); }, 2000);
        }
      }
    } catch (e) { console.error('joinGame error:', e); }
  });

  // HOST ONLY: Update room settings from lobby
  socket.on('updateSettings', (newSettings) => {
    try {
      if (!socket.roomId) return;
      const room = rooms[socket.roomId];
      if (!room || room.gameInProgress) return;
      const p = room.players.find(pl => pl.socketId === socket.id);
      if (!p || p.id !== room.hostId) return;

      if (newSettings.maxPlayers) room.maxPlayers = Math.min(12, Math.max(2, parseInt(newSettings.maxPlayers) || 8));
      if (newSettings.rounds) room.totalRounds = Math.min(6, Math.max(1, parseInt(newSettings.rounds) || 3));
      if (newSettings.drawTime) room.drawTime = Math.min(180, Math.max(30, parseInt(newSettings.drawTime) || 85));
      if (newSettings.hints) room.hintIntensity = newSettings.hints;
      if (newSettings.customWords !== undefined) {
        if (newSettings.customWords && newSettings.customWords.length > 0) {
          let safeWords = newSettings.customWords.map(w => w.trim().substring(0, 30)).filter(w => w.length > 0);
          let uniqueWords = [...new Set(safeWords)];
          let customObjs = uniqueWords.map(w => ({ w: w, e: '✨' }));
          if (customObjs.length < 3) customObjs = customObjs.concat(WORD_BANK).slice(0, 3);
          room.wordBank = customObjs; room.shuffleBag = [];
        } else {
          room.wordBank = null; room.shuffleBag = [];
        }
      }
      io.to(room.id).emit('lobbyState', getLobbyState(room));
    } catch (e) { console.error('updateSettings error:', e); }
  });

  // HOST ONLY: Directly kick a player from lobby
  socket.on('hostKick', (targetId) => {
    try {
      socket.eventCount += 20;
      if (socket.eventCount > 120) return;
      if (!socket.roomId) return;
      const room = rooms[socket.roomId];
      if (!room) return;
      const p = room.players.find(pl => pl.socketId === socket.id);
      if (!p || p.id !== room.hostId || targetId === room.hostId) return;
      const target = room.players.find(tp => tp.id === targetId);
      if (!target) return;
      room.bannedSessions.add(targetId);
      io.to(room.id).emit('receiveChat', { type: 'system', name: '', text: `👢 ${target.name} was removed by the host.` });
      if (target.socketId) { io.to(target.socketId).emit('kicked'); io.in(target.socketId).disconnectSockets(true); }
    } catch (e) { console.error('hostKick error:', e); }
  });

  // HOST ONLY: Transfer crown to another player
  socket.on('transferHost', (targetId) => {
    try {
      socket.eventCount += 20;
      if (socket.eventCount > 120) return;
      if (!socket.roomId) return;
      const room = rooms[socket.roomId];
      if (!room) return;
      const p = room.players.find(pl => pl.socketId === socket.id);
      if (!p || p.id !== room.hostId) return;
      const target = room.players.find(tp => tp.id === targetId);
      if (!target) return;
      p.role = 'player'; target.role = 'host'; room.hostId = targetId;
      io.to(room.id).emit('hostChanged', { newHostId: targetId, newHostName: target.name });
      io.to(room.id).emit('lobbyState', getLobbyState(room));
      io.to(room.id).emit('receiveChat', { type: 'system', name: '', text: `👑 ${target.name} is now the host!` });
    } catch (e) { console.error('transferHost error:', e); }
  });

  // HOST ONLY: Start the game from lobby
  socket.on('hostStartGame', () => {
    try {
      if (!socket.roomId) return;
      const room = rooms[socket.roomId];
      if (!room || room.gameInProgress) return;
      const p = room.players.find(pl => pl.socketId === socket.id);
      if (!p || p.id !== room.hostId) return;
      const active = getActivePlayers(room);
      if (active.length < 2) { socket.emit('receiveChat', { type: 'system', name: '', text: '⚠️ Need at least 2 players to start!' }); return; }
      room.gameInProgress = true; room.round = 1; room.turnsThisRound = 0; room.currentDrawerId = active[0].id;
      room.players.forEach(pl => { pl.score = 0; pl.guessed = false; });
      clearInterval(room.timerInt);
      io.to(room.id).emit('forceStartGame');
      startWordSelection(room);
    } catch (e) { console.error('hostStartGame error:', e); }
  });

  socket.on('wordPicked', (word) => {
    try {
      if (!socket.roomId) return;
      const room = rooms[socket.roomId];
      if (!room) return;
      let p = room.players.find(pl => pl.socketId === socket.id);
      if (p && room.currentPhase === 'picking' && p.id === room.currentDrawerId) {
        const isValidChoice = room.currentChoices.some(choice => choice.w === word);
        if (!isValidChoice) return;
        handleWordPicked(room, word);
      }
    } catch (e) { console.error('wordPicked error:', e); }
  });

  socket.on('drawing', (drawData) => {
    try {
      socket.eventCount++;
      if (socket.eventCount > 120) return;
      if (!socket.roomId) return;
      const room = rooms[socket.roomId];
      if (!room) return;
      let p = room.players.find(player => player.socketId === socket.id);
      if (!p || p.id !== room.currentDrawerId) return;
      if (room.currentPhase === 'drawing') {
        room.strokeHistory.push(drawData);
        socket.broadcast.to(room.id).emit('drawing', drawData);
        
        const now = Date.now();
        // Only request a sync if there are enough strokes AND it has been at least 4 seconds since the last one
        if (room.strokeHistory.length >= 250 && (!room.lastSync || now - room.lastSync > 4000)) {
          socket.emit('requestSync');
          room.lastSync = now;
        }
        
        if (room.strokeHistory.length > 500) room.strokeHistory.shift();      }
    } catch (e) { console.error('drawing error:', e); }
  });

  socket.on('canvasCommand', (cmd) => {
    try {
      socket.eventCount += 10;
      if (socket.eventCount > 120) return;
      if (!socket.roomId) return;
      const room = rooms[socket.roomId];
      if (!room) return;
      let p = room.players.find(player => player.socketId === socket.id);

      if (cmd && cmd.cmd === 'playAgain') {
        if (room.isPrivate && p && p.id !== room.hostId) return;
        room.gameInProgress = false; room.currentPhase = 'lobby'; clearInterval(room.timerInt);
        room.strokeHistory = []; room.baseCanvasImage = null; room.kickVotes = {};
        io.to(room.id).emit('gameAborted');
        const active = getActivePlayers(room);
        if (room.isPrivate) {
          io.to(room.id).emit('lobbyState', getLobbyState(room));
          io.to(room.id).emit('returnToLobby');
        } else if (active.length >= 2) {
          room.gameInProgress = true; room.round = 1; room.turnsThisRound = 0; room.currentDrawerId = active[0].id;
          room.players.forEach(pl => { pl.score = 0; pl.guessed = false; });
          setTimeout(() => { io.to(room.id).emit('forceStartGame'); startWordSelection(room); }, 2000);
        }
      } else if (cmd && cmd.cmd === 'sync' && room.currentPhase === 'drawing') {
        if (!p || p.id !== room.currentDrawerId) return;
        if (typeof cmd.data === 'string' && cmd.data.length > 600000) return;
        room.baseCanvasImage = cmd.data; room.strokeHistory = [];
        socket.broadcast.to(room.id).emit('canvasCommand', cmd);
      }
    } catch (e) { console.error('canvasCommand error:', e); }
  });

  socket.on('rateArt', (rating) => {
    try {
      if (!socket.roomId) return;
      const room = rooms[socket.roomId];
      if (!room) return;
      let p = room.players.find(player => player.socketId === socket.id);
      if (p) io.to(socket.roomId).emit('artRated', { id: p.id, name: p.name, rating: rating });
    } catch (e) { console.error('rateArt error:', e); }
  });

  socket.on('chatMessage', (data) => {
    try {
      socket.eventCount += 20;
      if (socket.eventCount > 120) return;
      if (!socket.roomId) return;
      const room = rooms[socket.roomId];
      if (!room) return;
      const now = Date.now();
      if (socket.lastChat && now - socket.lastChat < 500) return;
      socket.lastChat = now;
      let p = room.players.find(player => player.socketId === socket.id);
      if (!p) return;
      if (!data || typeof data.text !== 'string') return;
      const rawText = data.text.substring(0, 150);
      const safeText = cleanText(rawText);
      const word = (room.currentWord || '').toLowerCase().trim();
      const guess = rawText.toLowerCase().trim();

      if (room.currentPhase === 'drawing' && p.id !== room.currentDrawerId) {
        if (guess === word) {
          if (p.guessed) { socket.emit('receiveChat', { type: 'close', name: '', text: `🤫 You already guessed the word!` }); return; }
          const calculatedPts = Math.floor((room.timeLeft / room.drawTime) * 400) + 100;
          p.score += calculatedPts; p.guessed = true;
          let drawer = room.players.find(pl => pl.id === room.currentDrawerId);
          if (drawer) drawer.score += 50;
          const active = getActivePlayers(room);
          io.to(room.id).emit('scoreUpdate', active);
          io.to(room.id).emit('correctGuess', { guesserId: p.id, pts: calculatedPts });
          const nonDrawers = active.filter(pl => pl.id !== drawer?.id);
          if (nonDrawers.length > 0 && nonDrawers.every(pl => pl.guessed)) endTurn(room, true);
          return;
        }
        const threshold = word.length <= 5 ? 1 : 2;
        // EARLY EXIT: Only do the heavy math if the lengths are very close!
        if (word.length > 2 && Math.abs(guess.length - word.length) <= threshold && getEditDistance(guess, word) <= threshold) {          socket.emit('receiveChat', { type: 'normal', name: p.name, text: safeText });
          socket.emit('receiveChat', { type: 'close', name: '', text: `🤏 '${rawText}' is very close!` });
          return;
        }
      }
      if (room.currentPhase === 'drawing' && p.id === room.currentDrawerId && guess === word) {
        socket.emit('receiveChat', { type: 'close', name: '', text: `🤫 Shh! You already know the word!` }); return;
      }
      data.name = p.name; data.text = safeText; data.senderId = p.id;
      io.to(socket.roomId).emit('receiveChat', data);
    } catch (e) { console.error('chatMessage error:', e); }
  });

  socket.on('voteKick', (targetId) => {
    try {
      socket.eventCount += 20;
      if (socket.eventCount > 120) return;
      if (!socket.roomId) return;
      const room = rooms[socket.roomId];
      if (!room) return;
      let p = room.players.find(pl => pl.socketId === socket.id);
      if (!p || p.id === targetId) return;
      if (!room.kickVotes[targetId]) room.kickVotes[targetId] = new Set();
      room.kickVotes[targetId].add(p.id);
      const activeCount = getActivePlayers(room).length;
      const requiredVotes = Math.max(2, Math.ceil(activeCount / 2));
      const targetPlayer = room.players.find(tp => tp.id === targetId);
      if (room.kickVotes[targetId].size >= requiredVotes) {
        room.bannedSessions.add(targetId);
        io.to(room.id).emit('receiveChat', { type: 'system', name: '', text: `🛑 ${targetPlayer ? targetPlayer.name : 'A player'} was kicked by a democratic vote.` });
        if (targetPlayer && targetPlayer.socketId) { io.to(targetPlayer.socketId).emit('kicked'); io.in(targetPlayer.socketId).disconnectSockets(true); }
      } else {
        io.to(room.id).emit('receiveChat', { type: 'system', name: '', text: `🗳️ Kick vote against ${targetPlayer ? targetPlayer.name : 'A player'} (${room.kickVotes[targetId].size}/${requiredVotes})` });
      }
    } catch (e) { console.error('voteKick error:', e); }
  });

  socket.on('disconnect', () => {
    try {
      if (!socket.roomId) return;
      const room = rooms[socket.roomId];
      if (!room) return;
      let p = room.players.find(pl => pl.socketId === socket.id);
      if (p) {
        p.connected = false;
        io.to(room.id).emit('receiveChat', { type: 'system', name: '', text: `⏳ ${p.name} disconnected. Waiting 8s for reconnect...` });
        p.disconnectTimer = setTimeout(() => {
          if (p.connected) return;
          io.to(room.id).emit('playerLeft', p.id);
          const active = getActivePlayers(room);
          if (room.isPrivate && p.id === room.hostId && active.length > 0) reassignHost(room);
          if (active.length === 0) {
            clearInterval(room.timerInt); delete rooms[socket.roomId];
          } else if (active.length < 2) {
            room.gameInProgress = false; clearInterval(room.timerInt); room.currentPhase = 'lobby';
            room.strokeHistory = []; room.baseCanvasImage = null; io.to(room.id).emit('gameAborted');
            if (room.isPrivate) { io.to(room.id).emit('lobbyState', getLobbyState(room)); io.to(room.id).emit('returnToLobby'); }
          } else if (room.gameInProgress && p.id === room.currentDrawerId && (room.currentPhase === 'drawing' || room.currentPhase === 'picking')) {
            endTurn(room, false);
          }
          if (!room.gameInProgress && room.isPrivate) io.to(room.id).emit('lobbyState', getLobbyState(room));
        }, 8000);
      }
    } catch (e) { console.error('disconnect error:', e); }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => { console.log(`\n🚀 Picazo God-Server is running on port ${PORT}\n`); });
