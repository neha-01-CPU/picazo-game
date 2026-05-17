// 🔥 REGISTER PWA SERVICE WORKER & SMART INSTALL POPUP
let deferredPrompt;

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(reg => {
      // 1. Manually check for a new sw.js file on the server
      reg.update(); 
      
      // 2. Listen for when a new version is finished downloading
      reg.onupdatefound = () => {
        const installingWorker = reg.installing;
        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // 3. New content is ready! Refresh the page automatically for the user
            window.location.reload();
          }
        };
      };
    }).catch(err => console.log('PWA Registration failed:', err));
  });
}

// Wait for the DOM to load to attach our popup listeners
document.addEventListener('DOMContentLoaded', () => {
  const installBanner = document.getElementById('pwa-install-banner');
  const installBtn = document.getElementById('btn-pwa-install');
  const closeBtn = document.getElementById('btn-pwa-close');
  const descText = document.getElementById('pwa-desc');

  // Detect iOS (iPhone/iPad)
  const isIos = () => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod/.test(userAgent);
  };
  // Detect if app is already installed
  const isInStandaloneMode = () => ('standalone' in window.navigator) && (window.navigator.standalone);

  // 1. CHROME / ANDROID LOGIC (Intercepts the default browser prompt)
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); // Stop Chrome's default mini-bar
    deferredPrompt = e; // Save the event
    
    // Only show our custom banner if they haven't installed it yet
    if (!isInStandaloneMode() && installBanner) {
      setTimeout(() => installBanner.classList.remove('hidden'), 2000); // Show after 2 seconds
    }
  });

  // 2. IOS LOGIC (Since iOS blocks the 'beforeinstallprompt' event)
  if (isIos() && !isInStandaloneMode() && installBanner) {
    setTimeout(() => installBanner.classList.remove('hidden'), 2000);
  }

  // 3. HANDLE BUTTON CLICKS
  if (installBtn) {
    installBtn.addEventListener('click', async () => {
      // If it's Android/PC with a valid prompt ready
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          installBanner.classList.add('hidden');
        }
        deferredPrompt = null;
      } 
      // If it's iOS (Apple blocks automatic prompts)
      else if (isIos()) {
        if (descText) descText.innerHTML = `Tap the <strong>Share</strong> icon below, then select <strong>Add to Home Screen ➕</strong>`;
        if (descText) descText.style.color = 'var(--indigo)';
        installBtn.style.display = 'none'; // Hide install button to make room for instructions
      }
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      installBanner.classList.add('hidden');
    });
  }
});

/* ================================================================
   PICAZO — script.js  v43.0 (Shapes & Rating System)
================================================================ */
'use strict';

const socket = io();
let hasVotedOnArt = false; // 🔥 ADDED: Spam filter lock for ratings

/* ════════════════════════════════════════════
   CONSTANTS & DATA
════════════════════════════════════════════ */
let audioCtx = null;

let roomCodeFromUrl = null;
const pathParts = window.location.pathname.split('/');
if (pathParts.length === 3 && pathParts[1] === 'r') {
  roomCodeFromUrl = pathParts[2];
}

let mySessionId = localStorage.getItem('picazo_session_id');
if (!mySessionId) {
  mySessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  localStorage.setItem('picazo_session_id', mySessionId);
}

function playTickSound() {
  if (S.isMuted) {
    return;
  }
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  
  osc.connect(gain); 
  gain.connect(audioCtx.destination);
  
  osc.type = 'sine'; 
  osc.frequency.setValueAtTime(800, audioCtx.currentTime);
  
  gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
  
  osc.start(); 
  osc.stop(audioCtx.currentTime + 0.1);
}

function playPopSound() {
  if (S.isMuted) {
    return;
  }
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  
  osc.type = 'sine';
  osc.frequency.setValueAtTime(500, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.05);
  
  gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
  
  osc.start();
  osc.stop(audioCtx.currentTime + 0.05);
}

function playSuccessSound() {
  if (S.isMuted) {
    return;
  }
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  
  osc.type = 'sine';
  osc.frequency.setValueAtTime(400, audioCtx.currentTime);
  osc.frequency.linearRampToValueAtTime(600, audioCtx.currentTime + 0.1);
  osc.frequency.linearRampToValueAtTime(1000, audioCtx.currentTime + 0.2);
  
  gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
  gain.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
  
  osc.start();
  osc.stop(audioCtx.currentTime + 0.3);
}

function playDrumroll() {
  if (S.isMuted) {
    return;
  }
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.type = 'sine';
  osc.frequency.setValueAtTime(60, audioCtx.currentTime);
  
  gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
  gain.gain.linearRampToValueAtTime(0.4, audioCtx.currentTime + 1.2);
  gain.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 1.5);
  
  osc.start();
  osc.stop(audioCtx.currentTime + 1.5);
}

function playWinnerSound() {
  if (S.isMuted) {
    return;
  }
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  
  const notes = [523.25, 659.25, 783.99, 1046.50];
  notes.forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime + (i * 0.15));
      gain.gain.setValueAtTime(0, audioCtx.currentTime + (i * 0.15));
      gain.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + (i * 0.15) + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + (i * 0.15) + 1.0);
      osc.start(audioCtx.currentTime + (i * 0.15));
      osc.stop(audioCtx.currentTime + (i * 0.15) + 1.0);
  });
}

const COLORS = [
  '#000000',
  '#ffffff',
  '#c0c0c0',
  '#808080',
  '#ff0000',
  '#ff6600',
  '#ffcc00',
  '#ffff00',
  '#00cc00',
  '#00ffcc',
  '#0088ff',
  '#0000ff',
  '#8800ff',
  '#ff00ff',
  '#ff6699',
  '#cc3333',
  '#663300',
  '#996600',
  '#003366',
  '#006633'
];

const PREMIUM_AVATARS = [
  // Eliza - Blue background
  "https://api.dicebear.com/9.x/toon-head/svg?eyebrows=angry,neutral,raised,sad&mouth=smile,laugh&skinColor=c68e7a,f1c3a5&seed=Eliza&backgroundColor=4a8fe8",
  
  // Ryker - Gold background
  "https://api.dicebear.com/9.x/toon-head/svg?eyebrows=angry,neutral,raised,sad&hairColor=2c1b18&mouth=smile,laugh&skinColor=c68e7a,f1c3a5&seed=Ryker&backgroundColor=f4b942",
  
  // Sarah - Green background
  "https://api.dicebear.com/9.x/toon-head/svg?clothes=openJacket,shirt,tShirt,turtleNeck&clothesColor=0b3286,147f3c,151613,545454,731ac3,b11f1f,e8e9e6,ec4899,f97316,eab308&eyebrows=angry,neutral,raised,sad&hairColor=2c1b18&mouth=smile,laugh&skinColor=c68e7a,f1c3a5&seed=Sarah&backgroundColor=2ecc87",
  
  // Oliver - Red background
  "https://api.dicebear.com/9.x/toon-head/svg?clothes=openJacket,shirt,tShirt,turtleNeck&clothesColor=0b3286,147f3c,151613,545454,731ac3,b11f1f,e8e9e6,ec4899,f97316,eab308&eyebrows=angry,neutral,raised,sad&hairColor=2c1b18&mouth=smile,laugh&skinColor=c68e7a,f1c3a5&seed=Oliver&backgroundColor=f0525e",
  
  // Riley - Purple background
  "https://api.dicebear.com/9.x/toon-head/svg?clothes=openJacket,shirt,tShirt,turtleNeck&clothesColor=0b3286,147f3c,151613,545454,731ac3,b11f1f,e8e9e6,ec4899,f97316,eab308&eyebrows=angry,neutral,raised,sad&hairColor=2c1b18&mouth=smile,laugh&skinColor=c68e7a,f1c3a5&seed=Riley&backgroundColor=a855f7",
  
  // Jameson - Pink background
  "https://api.dicebear.com/9.x/toon-head/svg?clothes=openJacket,shirt,tShirt,turtleNeck&clothesColor=0b3286,147f3c,151613,545454,731ac3,b11f1f,e8e9e6,ec4899,f97316,eab308&eyebrows=angry,neutral,raised,sad&eyes=happy&hairColor=2c1b18&mouth=laugh,smile&skinColor=f1c3a5&seed=Jameson&backgroundColor=ec4899",
  
  // Katherine - Indigo background
  "https://api.dicebear.com/9.x/toon-head/svg?clothes=openJacket,shirt,tShirt,turtleNeck&clothesColor=147f3c,151613,545454,731ac3,b11f1f,e8e9e6,f97316,eab308,0b3286&eyebrows=angry,neutral,raised,sad&eyes=happy&hair=sideComed,spiky,undercut,bun&hairColor=2c1b18&mouth=laugh,smile&rearHair[]&skinColor=f1c3a5&seed=Katherine&backgroundColor=5c6ef8"
];

let S = {
  // 🔥 LOAD: Pull the saved avatar and name from the browser's memory!
  avatarIdx: parseInt(localStorage.getItem('picazo_avatar')) || 0, 
  playerName: localStorage.getItem('picazo_name') || '', 
  players: [],
  myId: mySessionId, 
  drawerIdx: -1,
  isDrawer: false,
  currentWord: '', 
  revealedIdx: [], 
  guessedIds: new Set(), 
  timeLeft: 85, 
  drawTime: 85,
  isDrawing: false, 
  tool: 'pencil', 
  color: '#000000', 
  brushSize: 3, 
  history: [], 
  isMuted: false, 
  ctxTarget: null, 
  dpr: window.devicePixelRatio || 1,
  customWords: null,
  roomSettings: null,
  myRole: 'player',       // 'host' | 'player'
  lobbyPlayers: [],
  lobbyHostId: null,
  // 🔥 Shape Specific Data
  shapeType: 'line',
  shapeStartX: 0,
  shapeStartY: 0,
  previewData: null,
  // Tracks the last received remote drawing point so we can do moveTo→lineTo correctly
  remoteLastX: null,
  remoteLastY: null
};

const CIRC = 2 * Math.PI * 25; 

/* ════════════════════════════════════════════
   DOM REFS & INITIALIZATION
════════════════════════════════════════════ */
const $ = id => document.getElementById(id);

const screenLobby = $('screen-lobby');
const screenGame = $('screen-game');
const timerNum = $('timer-num');
const tFg = $('t-fg');
const roundBadge = $('round-badge');
const wordDisplay = $('word-display');
const wordMeta = $('word-meta');
const playerList = $('player-list');
const chatMessages = $('chat-messages');
const chatInput = $('chat-input');
const btnChatSend = $('btn-chat-send');
const gameCanvas = $('game-canvas');
const canvasWrap = $('canvas-wrap');
const ctx = gameCanvas ? gameCanvas.getContext('2d', { willReadFrequently: true }) : null;
const overlayWordSelect = $('overlay-word-select');
const overlayRoundEnd = $('overlay-round-end');
const wsCards = $('ws-cards');
const contextMenu = $('context-menu');
const ctxName = $('ctx-name');
const ctxPts = $('ctx-pts');
const ctxAv = $('ctx-av');
const avImg = $('av-img'); 

document.addEventListener('DOMContentLoaded', () => { 
  const themeCheckboxes = document.querySelectorAll('.theme-checkbox');
  
  function applyTheme(isDark) {
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('picazo-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('picazo-theme', 'light');
    }
    themeCheckboxes.forEach(cb => {
      cb.checked = isDark;
    });
  }

  if (localStorage.getItem('picazo-theme') === 'dark') {
    applyTheme(true);
  }

  themeCheckboxes.forEach(cb => {
    cb.addEventListener('change', (e) => applyTheme(e.target.checked));
  });

  const overlays = ['overlay-waiting', 'overlay-word-select', 'overlay-round-end'];
  overlays.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      document.body.appendChild(el);
      el.style.position = 'fixed';
      el.style.zIndex = '9999';
      el.style.borderRadius = '0';
      el.style.height = '100dvh';
      el.style.width = '100vw';
      el.style.top = '0';
      el.style.left = '0';
    }
  });

  if (canvasWrap) {
    canvasWrap.style.width = "100%";
    canvasWrap.style.maxHeight = "65vh";
  }
    
  if (roomCodeFromUrl && $('btn-private')) {
    $('btn-private').style.display = 'none';
  }

  const pColor = $('popup-color');
  if (pColor && pColor.parentNode !== document.body) {
    document.body.appendChild(pColor);
    pColor.classList.add('mobile-popup-fix');
  }
  
  const pSize = $('popup-size');
  if (pSize && pSize.parentNode !== document.body) {
    document.body.appendChild(pSize);
    pSize.classList.add('mobile-popup-fix');
  }

  // 🔥 Shape popup mobile fix
  const pShape = $('popup-shape');
  if (pShape && pShape.parentNode !== document.body) {
    document.body.appendChild(pShape);
    pShape.classList.add('mobile-popup-fix');
  }

  const fxStyle = document.createElement('style');
  fxStyle.innerHTML = `
    @keyframes canvasShake {
      0% { transform: translate(4px, 4px) rotate(0deg); }
      10% { transform: translate(-4px, -6px) rotate(-2deg); }
      20% { transform: translate(-6px, 0px) rotate(2deg); }
      30% { transform: translate(6px, 6px) rotate(0deg); }
      40% { transform: translate(4px, -4px) rotate(2deg); }
      50% { transform: translate(-4px, 6px) rotate(-2deg); }
      60% { transform: translate(-6px, 2px) rotate(0deg); }
      70% { transform: translate(6px, 2px) rotate(-2deg); }
      80% { transform: translate(-4px, -4px) rotate(2deg); }
      90% { transform: translate(4px, 6px) rotate(0deg); }
      100% { transform: translate(0px, 0px) rotate(0deg); }
    }
    .shake-canvas {
      animation: canvasShake 0.45s cubic-bezier(.36,.07,.19,.97) both !important;
    }
    @media (max-width: 768px) {
      .mobile-popup-fix {
        position: fixed !important;
        top: 50% !important;
        left: 50% !important;
        transform: translate(-50%, -50%) !important;
        z-index: 999999 !important;
        width: 90vw !important;
        max-width: 320px !important;
        background: var(--glass-b, #fff) !important;
        border-radius: 16px !important;
        box-shadow: 0px 20px 50px rgba(0,0,0,0.5) !important;
      }
    }
  `;
  document.head.appendChild(fxStyle);
  
  setupMobileLayout();

  if (!socket.connected) {
    const btn = $('btn-play');
    if (btn) {
      btn.innerHTML = '<span>Waking up server... ⏳</span>';
      btn.style.pointerEvents = 'none';
      btn.style.opacity = '0.6';
    }
  }

  // 🔥 ADDED: Rating System Listeners safely checked (WITH SPAM FILTER)
  if ($('btn-like')) {
    $('btn-like').addEventListener('click', () => { 
      if (hasVotedOnArt) return; // Stop if already voted
      hasVotedOnArt = true;      // Lock it
      socket.emit('rateArt', 'like'); 
      showToast('👍 You liked the drawing!', 't-correct');
      
      // Visually disable buttons
      $('btn-like').style.opacity = '0.4'; $('btn-like').style.cursor = 'not-allowed';
      if ($('btn-dislike')) { $('btn-dislike').style.opacity = '0.4'; $('btn-dislike').style.cursor = 'not-allowed'; }
    });
  }
  if ($('btn-dislike')) {
    $('btn-dislike').addEventListener('click', () => { 
      if (hasVotedOnArt) return; // Stop if already voted
      hasVotedOnArt = true;      // Lock it
      socket.emit('rateArt', 'dislike'); 
      showToast('👎 You disliked the drawing!', 't-warn');
      
      // Visually disable buttons
      $('btn-dislike').style.opacity = '0.4'; $('btn-dislike').style.cursor = 'not-allowed';
      if ($('btn-like')) { $('btn-like').style.opacity = '0.4'; $('btn-like').style.cursor = 'not-allowed'; }
    });
  }

  // 🔥 NEW: Save Masterpiece Listener at Round End (Perfect Viral Edition)
  const btnSaveRound = $('btn-save-round');
  if (btnSaveRound) {
    btnSaveRound.addEventListener('click', (e) => { 
      e.stopPropagation();
      
      const exportCanvas = document.createElement('canvas');
      const eCtx = exportCanvas.getContext('2d');

      // 1. Dynamic Padding (Increased to make the Polaroid look slightly smaller/better framed!)
      const bgPadTop = 230;  // Massive room for the Word and Tagline
      const bgPadBot = 160;  // Lots of room for the 2-line footer
      const bgPadSide = 120; // Wider margins on the left/right
      
      const pSide = 40;   // Polaroid border
      const pTop = 40;    
      const pBot = 140;   // Thick bottom border for the Artist's signature

      const cardW = gameCanvas.width + (pSide * 2);
      const cardH = gameCanvas.height + pTop + pBot;
      
      exportCanvas.width = cardW + (bgPadSide * 2);
      exportCanvas.height = cardH + bgPadTop + bgPadBot;

      // 2. Seamless Vibrant Background Gradient
      const bgGrad = eCtx.createLinearGradient(0, 0, exportCanvas.width, exportCanvas.height);
      bgGrad.addColorStop(0, '#3b82f6'); // Electric Blue
      bgGrad.addColorStop(0.35, '#8b5cf6'); // Rich Purple
      bgGrad.addColorStop(0.7, '#ec4899'); // Hot Pink
      bgGrad.addColorStop(1, '#f97316'); // Vibrant Orange
      eCtx.fillStyle = bgGrad;
      eCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

      // 3. Highlighted Header Tagline
      eCtx.textAlign = 'center';
      eCtx.font = '800 26px Nunito, sans-serif';
      eCtx.fillStyle = '#fde047'; // Bright glowing yellow to highlight it!
      eCtx.shadowColor = 'rgba(0,0,0,0.5)';
      eCtx.shadowBlur = 8;
      eCtx.shadowOffsetY = 3;
      eCtx.fillText('Sketch it. Guess it. Win it.', exportCanvas.width / 2, 60);

      // 4. The Word (Massive and bold at the top)
      const safeWord = S.currentWord ? S.currentWord.toUpperCase() : 'MASTERPIECE';
      eCtx.font = '900 76px Nunito, sans-serif';
      eCtx.fillStyle = '#ffffff';
      eCtx.shadowColor = 'rgba(0,0,0,0.4)';
      eCtx.shadowBlur = 15;
      eCtx.shadowOffsetY = 6;
      eCtx.fillText(`Word: ${safeWord}`, exportCanvas.width / 2, 150);
      
      // Reset shadow for the Polaroid card
      eCtx.shadowColor = 'transparent';
      eCtx.shadowBlur = 0;
      eCtx.shadowOffsetY = 0;

      // 5. Rotate context to place the Polaroid organically
      eCtx.save();
      // Center the origin point perfectly between the header and footer
      eCtx.translate(exportCanvas.width / 2, bgPadTop + (cardH / 2) - 15); 
      eCtx.rotate(1.8 * Math.PI / 180); // Gentle tilt to the right
      eCtx.translate(-cardW / 2, -cardH / 2);

      // 6. Draw Polaroid Base
      eCtx.shadowColor = 'rgba(0, 0, 0, 0.45)';
      eCtx.shadowBlur = 50;
      eCtx.shadowOffsetY = 25;
      eCtx.fillStyle = '#ffffff';
      eCtx.beginPath();
      eCtx.roundRect(0, 0, cardW, cardH, 8); 
      eCtx.fill();
      eCtx.shadowColor = 'transparent';

      // 7. Draw The Art Frame
      eCtx.fillStyle = '#f8fafc'; 
      eCtx.fillRect(pSide, pTop, gameCanvas.width, gameCanvas.height);
      eCtx.strokeStyle = 'rgba(0,0,0,0.05)';
      eCtx.lineWidth = 2;
      eCtx.strokeRect(pSide, pTop, gameCanvas.width, gameCanvas.height);

      // 8. Stamp the actual Game Canvas
      eCtx.drawImage(gameCanvas, pSide, pTop);

      // 9. Aesthetic "Washi Tape"
      eCtx.save();
      eCtx.translate(cardW / 2, 0);
      eCtx.rotate(-3 * Math.PI / 180);
      eCtx.fillStyle = 'rgba(255, 250, 240, 0.9)'; 
      eCtx.shadowColor = 'rgba(0, 0, 0, 0.15)';
      eCtx.shadowBlur = 8;
      eCtx.shadowOffsetY = 4;
      
      eCtx.beginPath();
      eCtx.moveTo(-100, -20);
      eCtx.lineTo(105, -25);
      eCtx.lineTo(95, 22);
      eCtx.lineTo(-105, 26);
      eCtx.fill();
      
      eCtx.strokeStyle = 'rgba(0,0,0,0.03)';
      eCtx.lineWidth = 1;
      eCtx.beginPath(); eCtx.moveTo(-60, -22); eCtx.lineTo(-55, 22); eCtx.stroke();
      eCtx.beginPath(); eCtx.moveTo(60, -24); eCtx.lineTo(55, 21); eCtx.stroke();
      eCtx.restore();

      // 10. Artist Signature (Bottom Right)
      let drawerName = "An Artist";
      if (S.drawerIdx >= 0 && S.players[S.drawerIdx]) {
          drawerName = S.players[S.drawerIdx].name;
      }
      if (S.isDrawer) drawerName = S.playerName; 
      
      eCtx.textAlign = 'right';
      eCtx.font = 'normal 48px Boogaloo, cursive';
      
      const sigGrad = eCtx.createLinearGradient(cardW - 400, 0, cardW - 30, 0);
      sigGrad.addColorStop(0, '#8b5cf6'); // Purple
      sigGrad.addColorStop(1, '#ec4899'); // Pink
      
      eCtx.fillStyle = sigGrad; 
      eCtx.fillText(`Artist 🖌 ${drawerName}`, cardW - pSide - 10, pTop + gameCanvas.height + 85);

      eCtx.restore(); // Restore main rotation

      // 11. Viral Footer Call-To-Action (Split into TWO lines!)
      eCtx.textAlign = 'center';
      eCtx.shadowColor = 'rgba(0,0,0,0.5)';
      eCtx.shadowBlur = 10;
      eCtx.shadowOffsetY = 4;
      
      // Line 1: The Challenge
      eCtx.font = '800 32px Nunito, sans-serif';
      eCtx.fillStyle = 'rgba(255, 255, 255, 0.9)'; 
      eCtx.fillText('Think you can draw better?', exportCanvas.width / 2, exportCanvas.height - 90);
      
      // Line 2: The Link (Larger, pure white)
      eCtx.font = '900 42px Nunito, sans-serif';
      eCtx.fillStyle = '#ffffff'; 
      eCtx.fillText('Prove it at PICAZO.COM 🚀', exportCanvas.width / 2, exportCanvas.height - 40);

      // 12. Trigger the High-Res Download
      const link = document.createElement('a');
      link.download = `Picazo_${safeWord}.png`;
      link.href = exportCanvas.toDataURL('image/png', 1.0); 
      link.click();
      
      showToast('📸 Viral Masterpiece saved!', 't-info');
      
      // Button Feedback
      const originalHTML = btnSaveRound.innerHTML;
      btnSaveRound.innerHTML = '<span class="btn-icon">✅</span> Saved!';
      btnSaveRound.style.background = 'rgba(46,204,135,0.2)';
      btnSaveRound.style.borderColor = 'var(--green)';
      btnSaveRound.style.color = 'var(--green)';
      
      setTimeout(() => {
        btnSaveRound.innerHTML = originalHTML;
        btnSaveRound.style.background = '';
        btnSaveRound.style.borderColor = '';
        btnSaveRound.style.color = '';
      }, 2000);
    });
  }
});

/* ════════════════════════════════════════════
   CONNECTION & LOBBY LOGIC
════════════════════════════════════════════ */
socket.on('connect', () => {
  const btn = $('btn-play');
  if (btn) {
    btn.innerHTML = '<span>Play Now</span>';
    btn.style.pointerEvents = 'auto';
    btn.style.opacity = '1';
  }
  
  if (S.playerName && screenGame && screenGame.classList.contains('active')) {
    socket.emit('joinGame', { 
      sessionId: S.myId,
      name: S.playerName, 
      avatarDef: PREMIUM_AVATARS[S.avatarIdx],
      roomId: roomCodeFromUrl,
      customWords: S.customWords,
      settings: S.roomSettings
    });
  }
});

socket.on('disconnect', () => {
  const btn = $('btn-play');
  if (btn && screenGame && !screenGame.classList.contains('active')) {
    btn.innerHTML = '<span>Connecting... ⏳</span>';
    btn.style.pointerEvents = 'none';
    btn.style.opacity = '0.6';
  }
});

socket.on('kicked', () => {
  showToast('🚫 You were removed from this room.', 't-warn');
  setTimeout(() => { window.location.href = '/'; }, 2000);
});

function setAvatar(i) {
  S.avatarIdx = ((i % PREMIUM_AVATARS.length) + PREMIUM_AVATARS.length) % PREMIUM_AVATARS.length;
  
  if(avImg) {
    avImg.src = PREMIUM_AVATARS[S.avatarIdx];
  }
  
  if($('av-dots')) {
      $('av-dots').innerHTML = '';
      PREMIUM_AVATARS.forEach((_, j) => {
        const d = document.createElement('button'); 
        d.className = 'av-dot' + (j === S.avatarIdx ? ' active' : '');
        d.addEventListener('click', () => setAvatar(j)); 
        $('av-dots').appendChild(d);
      });
  }
}

if ($('btn-av-prev')) $('btn-av-prev').addEventListener('click', () => setAvatar(S.avatarIdx - 1));
if ($('btn-av-next')) $('btn-av-next').addEventListener('click', () => setAvatar(S.avatarIdx + 1));

// 🔥 LOAD: Set the visual avatar to their saved one, not 0
setAvatar(S.avatarIdx); 

// 🔥 LOAD: Auto-type their name into the box so they don't have to
if ($('inp-name') && S.playerName) {
  $('inp-name').value = S.playerName;
}

if ($('btn-play')) {
  $('btn-play').addEventListener('click', () => {
    const name = $('inp-name').value.trim();
    if (!name) {
      $('inp-name').classList.add('shake');
      setTimeout(() => {
        if ($('inp-name')) $('inp-name').classList.remove('shake');
      }, 500);
      return;
    }

    S.playerName = name;
    localStorage.setItem('picazo_name', S.playerName);
    localStorage.setItem('picazo_avatar', S.avatarIdx);

    // If joining via invite link, go to private lobby as guest
    if (roomCodeFromUrl) {
      S.myRole = 'player';
      S._gameInited = true; // Will emit joinGame below
      socket.emit('joinGame', {
        sessionId: S.myId,
        name: S.playerName,
        avatarDef: PREMIUM_AVATARS[S.avatarIdx],
        roomId: roomCodeFromUrl,
        customWords: null,
        settings: null
      });
      // Transition to private lobby (server will send lobbyState or gameState)
      const screenLobby2 = $('screen-lobby');
      const screenPriv2 = $('screen-priv-lobby');
      if (screenLobby2) {
        screenLobby2.style.opacity = '0';
        screenLobby2.style.transform = 'scale(1.08)';
        setTimeout(() => {
          screenLobby2.classList.remove('active');
          screenLobby2.style.display = 'none';
          if (screenPriv2) {
            screenPriv2.classList.add('active');
            setupPrivateLobbyGuestUI();
          }
        }, 380);
      }
    } else {
      transitionToGame();
    }
  });
}

if ($('btn-private')) {
  $('btn-private').addEventListener('click', () => {
    const name = $('inp-name').value.trim();
    if (!name) {
      $('inp-name').classList.add('shake');
      setTimeout(() => { if ($('inp-name')) $('inp-name').classList.remove('shake'); }, 500);
      return;
    }
    S.playerName = name;
    localStorage.setItem('picazo_name', S.playerName);
    localStorage.setItem('picazo_avatar', S.avatarIdx);
    enterPrivateLobby();
  });
}



/* ════════════════════════════════════════════
   PRIVATE ROOM LOBBY SYSTEM
════════════════════════════════════════════ */

// Centralized host permission check
function isHost() { return S.myRole === 'host'; }

// Guest (non-host) joining via invite link — sets up invite panel read-only
function setupPrivateLobbyGuestUI() {
  const inviteLink = `${window.location.origin}/r/${roomCodeFromUrl}`;
  if ($('priv-lobby-link-txt')) $('priv-lobby-link-txt').textContent = inviteLink;
  if ($('priv-qr-code-text')) $('priv-qr-code-text').textContent = inviteLink;

  const copyBtn = $('btn-copy-lobby-link');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(inviteLink).then(() => {
        copyBtn.textContent = '✓ Copied!';
        copyBtn.classList.add('copied');
        setTimeout(() => { copyBtn.textContent = '📋 Copy Link'; copyBtn.classList.remove('copied'); }, 2000);
      });
    });
  }
  if ($('btn-leave-priv-lobby')) {
    $('btn-leave-priv-lobby').addEventListener('click', () => { window.location.href = '/'; });
  }
  // Guests can't start or change settings
  updateLobbyPermissions();
}

// Enter the private room lobby screen (before game starts)
function enterPrivateLobby() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  // Generate a room code and set the URL
  roomCodeFromUrl = Math.random().toString(36).substr(2, 6).toUpperCase();
  window.history.pushState({}, '', `/r/${roomCodeFromUrl}`);

  // Initial settings from UI (host sets these before others join)
  S.roomSettings = {
    maxPlayers: 8,
    rounds: 5,
    drawTime: 90,
    hints: 'medium'
  };
  S.customWords = null;
  S.myRole = 'host'; // We are the host (first to join)

  // Transition: home → private lobby
  const screenLobby = $('screen-lobby');
  const screenPriv = $('screen-priv-lobby');
  if (screenLobby) {
    screenLobby.style.opacity = '0';
    screenLobby.style.transform = 'scale(1.08)';
    setTimeout(() => {
      screenLobby.classList.remove('active');
      screenLobby.style.display = 'none';
      if (screenPriv) screenPriv.classList.add('active');
      setupPrivateLobbyUI();
      joinAsPrivateHost();
    }, 380);
  }
}

// Connect to server as the host of a new private room
function joinAsPrivateHost() {
  socket.emit('joinGame', {
    sessionId: S.myId,
    name: S.playerName,
    avatarDef: PREMIUM_AVATARS[S.avatarIdx],
    roomId: roomCodeFromUrl,
    customWords: S.customWords,
    settings: S.roomSettings
  });
}

// Wire up all the interactive elements of the private lobby screen
function setupPrivateLobbyUI() {
  const inviteLink = `${window.location.origin}/r/${roomCodeFromUrl}`;

  // Invite link display
  if ($('priv-lobby-link-txt')) $('priv-lobby-link-txt').textContent = inviteLink;
  if ($('priv-qr-code-text')) $('priv-qr-code-text').textContent = inviteLink;

  // Copy button
  const copyBtn = $('btn-copy-lobby-link');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(inviteLink).then(() => {
        copyBtn.textContent = '✓ Copied!';
        copyBtn.classList.add('copied');
        setTimeout(() => { copyBtn.textContent = '📋 Copy Link'; copyBtn.classList.remove('copied'); }, 2000);
      }).catch(() => showToast('❌ Copy failed', 't-warn'));
    });
  }

  // Leave room
  if ($('btn-leave-priv-lobby')) {
    $('btn-leave-priv-lobby').addEventListener('click', () => {
      window.location.href = '/';
    });
  }

  // Host Start button
  if ($('btn-host-start')) {
    $('btn-host-start').addEventListener('click', () => {
      if (!isHost()) return;
      // Apply current settings one last time before starting
      applyLobbySettings();
      // Send custom words if any
      const cwEl = $('ls-custom-words');
      if (cwEl && cwEl.value.trim()) {
        S.customWords = cwEl.value.split(',').map(w => w.trim()).filter(w => w.length > 0);
        socket.emit('updateSettings', { customWords: S.customWords });
      }
      // Animated countdown then start
      showStartCountdown(() => {
        socket.emit('hostStartGame');
      });
    });
  }

  // Apply Settings button (host only)
  if ($('btn-apply-settings')) {
    $('btn-apply-settings').addEventListener('click', () => {
      applyLobbySettings();
    });
  }

  // Settings change listeners — only emit if host
  ['ls-max-players', 'ls-rounds', 'ls-draw-time', 'ls-hints'].forEach(id => {
    const el = $(id);
    if (el) {
      el.addEventListener('change', () => {
        if (!isHost()) return;
        if ($('btn-apply-settings')) $('btn-apply-settings').classList.remove('hidden');
      });
    }
  });
  const cwEl = $('ls-custom-words');
  if (cwEl) {
    cwEl.addEventListener('input', () => {
      if (!isHost()) return;
      if ($('btn-apply-settings')) $('btn-apply-settings').classList.remove('hidden');
    });
  }

  // Initial permission state (we're host so everything enabled)
  updateLobbyPermissions();
}

function applyLobbySettings() {
  if (!isHost()) return;
  const settings = {
    maxPlayers: parseInt($('ls-max-players')?.value) || 8,
    rounds: parseInt($('ls-rounds')?.value) || 5,
    drawTime: parseInt($('ls-draw-time')?.value) || 90,
    hints: $('ls-hints')?.value || 'medium',
  };
  const cwEl = $('ls-custom-words');
  if (cwEl) {
    settings.customWords = cwEl.value.trim()
      ? cwEl.value.split(',').map(w => w.trim()).filter(w => w.length > 0)
      : [];
  }
  socket.emit('updateSettings', settings);
  if ($('btn-apply-settings')) $('btn-apply-settings').classList.add('hidden');
  showToast('⚙️ Settings updated!', 't-info');
}

// Update which controls are interactive based on role
function updateLobbyPermissions() {
  const host = isHost();
  const selectors = ['ls-max-players', 'ls-rounds', 'ls-draw-time', 'ls-hints', 'ls-custom-words'];
  selectors.forEach(id => {
    const el = $(id);
    if (el) {
      el.disabled = !host;
      el.style.opacity = host ? '1' : '0.5';
      el.style.cursor = host ? 'pointer' : 'not-allowed';
    }
  });
  const lockNotice = $('priv-settings-lock-notice');
  if (lockNotice) lockNotice.classList.toggle('hidden', host);
  const startBtn = $('btn-host-start');
  if (startBtn) startBtn.style.display = host ? '' : 'none';
  const minNotice = $('priv-min-players-notice');
  if (minNotice) minNotice.style.display = host ? '' : 'none';
}

// Rebuild the player list in the private lobby
function buildPrivateLobbyPlayers(players, hostId) {
  const list = $('priv-player-list');
  if (!list) return;
  list.innerHTML = '';

  const count = $('priv-player-count');
  const maxEl = $('ls-max-players');
  const maxPlayers = maxEl ? parseInt(maxEl.value) || 8 : 8;
  if (count) count.textContent = `${players.length}/${maxPlayers} players`;

  // Update start button state (host only, need >= 2)
  const startBtn = $('btn-host-start');
  const minNotice = $('priv-min-players-notice');
  if (startBtn && isHost()) {
    const canStart = players.length >= 2;
    startBtn.disabled = !canStart;
    if (minNotice) minNotice.style.display = canStart ? 'none' : '';
  }

  players.forEach(p => {
    const isMe = p.id === S.myId;
    const pIsHost = p.id === hostId;
    const li = document.createElement('li');
    li.className = 'priv-player-item' + (pIsHost ? ' is-host' : '') + (isMe ? ' is-self' : '');

    let actionsHTML = '';
    // Host sees kick/transfer buttons on non-self players
    if (isHost() && !isMe) {
      actionsHTML = `
        <div class="priv-player-actions">
          <button class="priv-action-btn transfer" title="Make Host" data-id="${p.id}">👑</button>
          <button class="priv-action-btn kick" title="Kick Player" data-id="${p.id}">❌</button>
        </div>`;
    }

    li.innerHTML = `
      <div class="priv-pi-av"><img src="${p.avatarDef}" alt="${p.name}"></div>
      <div class="priv-pi-info">
        <div class="priv-pi-name">${escHtml(p.name)}${isMe ? ' <span style="color:var(--blue);">( you)</span>' : ''}</div>
        <div class="priv-pi-tag">${pIsHost ? '👑 Host' : 'Player'}</div>
      </div>
      ${pIsHost ? '<span class="priv-host-badge">👑</span>' : ''}
      ${actionsHTML}
    `;

    // Wire action buttons
    const kickBtn = li.querySelector('.priv-action-btn.kick');
    if (kickBtn) kickBtn.addEventListener('click', e => { e.stopPropagation(); socket.emit('hostKick', p.id); });
    const transferBtn = li.querySelector('.priv-action-btn.transfer');
    if (transferBtn) transferBtn.addEventListener('click', e => { e.stopPropagation(); socket.emit('transferHost', p.id); });

    list.appendChild(li);
  });
}

// Animated 3-2-1 countdown before game starts
function showStartCountdown(onDone) {
  // Create overlay if not present
  let overlay = $('start-countdown-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'start-countdown-overlay';
    const numEl = document.createElement('div');
    numEl.className = 'sco-number';
    numEl.id = 'sco-number';
    overlay.appendChild(numEl);
    document.body.appendChild(overlay);
  }
  overlay.classList.remove('hidden');
  const numEl = $('sco-number');
  let count = 3;
  function tick() {
    if (numEl) {
      numEl.textContent = count;
      numEl.style.animation = 'none';
      void numEl.offsetWidth;
      numEl.style.animation = 'scoPop 0.85s var(--spring) both';
    }
    if (count <= 0) {
      overlay.classList.add('hidden');
      onDone();
      return;
    }
    count--;
    setTimeout(tick, 900);
  }
  tick();
}

// Sync lobby settings UI from server state
function applyServerSettingsToUI(settings) {
  if (!settings) return;
  if ($('ls-max-players') && settings.maxPlayers) $('ls-max-players').value = settings.maxPlayers;
  if ($('ls-rounds') && settings.rounds) $('ls-rounds').value = settings.rounds;
  if ($('ls-draw-time') && settings.drawTime) $('ls-draw-time').value = settings.drawTime;
  if ($('ls-hints') && settings.hints) $('ls-hints').value = settings.hints;
}

/* ════════════════════════════════════════════
   SERVER → CLIENT: LOBBY EVENTS
════════════════════════════════════════════ */

// Server sends full lobby state whenever anything changes
socket.on('lobbyState', (data) => {
  S.lobbyPlayers = data.players;
  S.lobbyHostId = data.hostId;

  // Update my own role from server truth
  const me = data.players.find(p => p.id === S.myId);
  if (me) S.myRole = me.role;

  // If the private lobby screen is active, rebuild it
  const privScreen = $('screen-priv-lobby');
  if (privScreen && privScreen.classList.contains('active')) {
    buildPrivateLobbyPlayers(data.players, data.hostId);
    applyServerSettingsToUI(data.settings);
    updateLobbyPermissions();

    // Update waiting text
    const waitTxt = $('priv-waiting-text');
    if (waitTxt) {
      waitTxt.textContent = data.players.length >= 2
        ? `${data.players.length} players ready!`
        : 'Waiting for players to join…';
    }
  }
});

// Server tells us the host changed (used in game too)
socket.on('hostChanged', (data) => {
  if (data.newHostId === S.myId) {
    S.myRole = 'host';
    showToast('👑 You are now the host!', 't-gold');
  } else {
    S.myRole = 'player';
  }
  updateLobbyPermissions();
});

// Server asks everyone to go back to the lobby after game over (private rooms)
socket.on('returnToLobby', () => {
  const screenGame = $('screen-game');
  const screenPriv = $('screen-priv-lobby');
  if (!screenPriv) return;

  // Hide game, show private lobby
  if (screenGame) { screenGame.classList.remove('active'); screenGame.style.display = ''; }

  // Reset overlay states
  ['overlay-waiting','overlay-word-select','overlay-round-end'].forEach(id => {
    const el = $(id);
    if (el) el.classList.add('hidden');
  });

  screenPriv.classList.add('active');
  updateLobbyPermissions();
  showToast('🔄 Returned to lobby. Host can start a new game!', 't-info');
});

/* ════════════════════════════════════════════
   TRANSITION FUNCTIONS
════════════════════════════════════════════ */

function transitionToGame() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }

  if (screenLobby) {
      screenLobby.style.opacity = '0';
      screenLobby.style.transform = 'scale(1.08)';
      
      setTimeout(() => {
        screenLobby.classList.remove('active');
        screenLobby.style.display = 'none';
        const privScreen = $('screen-priv-lobby');
        if (privScreen) { privScreen.classList.remove('active'); }
        if (screenGame) screenGame.classList.add('active');
        setupMobileLayout();
        initGame();
      }, 420);
  }
}

function setupMobileLayout() {
  const isMobile = window.innerWidth < 768;
  const gameBody = document.querySelector('.game-body');
  if (!gameBody) return;
  const lb = $('leaderboard-panel');
  const chat = $('chat-panel');
  const canvasCol = document.querySelector('.canvas-col');
  const chatForm = document.querySelector('.chat-form');
  let bottomRow = document.querySelector('.bottom-mobile-row');

  if (isMobile) {
    if (!bottomRow) {
      bottomRow = document.createElement('div');
      bottomRow.className = 'bottom-mobile-row';
      gameBody.appendChild(bottomRow);
    }
    if (lb && !bottomRow.contains(lb)) {
      bottomRow.appendChild(lb);
    }
    if (chat && !bottomRow.contains(chat)) {
      bottomRow.appendChild(chat);
    }

    if (canvasCol && gameBody.firstChild !== canvasCol) {
      gameBody.insertBefore(canvasCol, gameBody.firstChild);
    }
    if (chatForm && chatForm.parentNode !== gameBody) {
      gameBody.appendChild(chatForm);
    }
  } else {
    if (lb && lb.parentNode !== gameBody) {
      gameBody.appendChild(lb);
    }
    if (canvasCol && canvasCol.parentNode !== gameBody) {
      gameBody.appendChild(canvasCol);
    }
    if (chat && chat.parentNode !== gameBody) {
      gameBody.appendChild(chat);
    }

    if (lb) gameBody.appendChild(lb);
    if (canvasCol) gameBody.appendChild(canvasCol);
    if (chat) gameBody.appendChild(chat);

    if (bottomRow) {
      bottomRow.remove();
    }

    if (chatForm && chat && chatForm.parentNode !== chat) {
      chat.appendChild(chatForm);
    }
  }
  
  setTimeout(resizeCanvas, 50);
}

window.addEventListener('resize', () => { 
  setupMobileLayout(); 
  resizeCanvas(); 
});

/* ════════════════════════════════════════════
   THE GOD SERVER LISTENERS
════════════════════════════════════════════ */
function initGame() {
  // Private lobby players already emitted joinGame when they joined the lobby
  if (!S._gameInited) {
    socket.emit('joinGame', {
      sessionId: S.myId,
      name: S.playerName,
      avatarDef: PREMIUM_AVATARS[S.avatarIdx],
      roomId: roomCodeFromUrl,
      customWords: S.customWords,
      settings: S.roomSettings
    });
    S._gameInited = true;
  }
  
  setupToolbar(); 
  setupChat(); 
  setupContextMenu(); 
  initCanvas();
  
  if ($('overlay-waiting')) {
      $('overlay-waiting').classList.remove('hidden');
      // 🔥 FIX: Generic text so late-joiners aren't confused
      if ($('wait-title')) $('wait-title').textContent = 'Joining room...';
      if ($('wait-sub')) $('wait-sub').textContent = 'Getting things ready...';
  }
}

socket.on('currentPlayers', (serverPlayers) => {
  if (screenGame && !screenGame.classList.contains('active')) {
    return;
  }
  S.players = serverPlayers.map(p => {
    return { ...p, isSelf: p.id === S.myId };
  });
  buildLeaderboard();
});

socket.on('playerJoined', (newPlayer) => {
  sfx.join();
  if (screenGame && !screenGame.classList.contains('active')) {
    return;
  }
  if (S.players.find(p => p.id === newPlayer.id)) {
    return;
  }
  
  S.players.push({ ...newPlayer, isSelf: false });
  buildLeaderboard();
  addChat('system', '', `👋 ${newPlayer.name} joined!`);
  showToast(`👋 ${newPlayer.name} joined!`, 't-info');
});

socket.on('playerLeft', (id) => {
  if (screenGame && !screenGame.classList.contains('active')) {
    return;
  }
  const idx = S.players.findIndex(p => p.id === id);
  if (idx !== -1) {
    const name = S.players[idx].name;
    S.players.splice(idx, 1);
    buildLeaderboard();
    addChat('system', '', `🚪 ${name} left.`);
  }
});

socket.on('gameAborted', () => {
  if (screenGame && !screenGame.classList.contains('active')) {
    return;
  }
  if (overlayRoundEnd) overlayRoundEnd.classList.add('hidden');
  if (overlayWordSelect) overlayWordSelect.classList.add('hidden');
  if ($('overlay-waiting')) {
      $('overlay-waiting').classList.remove('hidden');
      if ($('wait-title')) $('wait-title').textContent = 'Not enough players';
      if ($('wait-sub')) $('wait-sub').textContent = 'Waiting for more players to join...';
  }
});

socket.on('forceStartGame', () => {
  // 🔥 FIX: Wipe the chat box completely clean for the new game
  const chatMessagesEl = document.getElementById('chat-messages');
  if (chatMessagesEl) {
      chatMessagesEl.innerHTML = '';
      addChat('system', '', '🎮 New game started! Chat cleared.');
  }

  if ($('wait-title')) $('wait-title').textContent = 'Players found!';
  if ($('wait-sub')) $('wait-sub').textContent = 'Starting game...';

  // If we were in the private lobby screen, transition to game
  const privScreen = $('screen-priv-lobby');
  const gameScreen = $('screen-game');
  if (privScreen && privScreen.classList.contains('active')) {
    privScreen.classList.remove('active');
    if (gameScreen) gameScreen.classList.add('active');
    setupMobileLayout();
    // initGame already called at joinGame time for reconnects; guard against double-init
    if (!S._gameInited) { initGame(); S._gameInited = true; }
    setTimeout(() => { if ($('overlay-waiting')) $('overlay-waiting').classList.add('hidden'); showEventPopup('🎮', 'Game started!'); }, 1500);
    return;
  }

  if (screenGame && !screenGame.classList.contains('active')) {
    return;
  }
  setTimeout(() => {
    if ($('overlay-waiting')) $('overlay-waiting').classList.add('hidden');
    showEventPopup('🎮', 'Game started!');
  }, 1500);
});

socket.on('gameState', (state) => {
  // If game is in progress and we're on the private lobby screen, jump to game
  const privScreen = $('screen-priv-lobby');
  const gameScreen = $('screen-game');
  if (privScreen && privScreen.classList.contains('active') && gameScreen) {
    privScreen.classList.remove('active');
    gameScreen.classList.add('active');
    setupMobileLayout();
    if (!S._gameInited) { initGame(); S._gameInited = true; }
  }

  if (gameScreen && !gameScreen.classList.contains('active')) {
    return;
  }
  
  S.timeLeft = state.time;
  S.currentWord = state.word;
  S.drawerIdx = state.players.findIndex(p => p.id === state.drawerId);
  S.isDrawer = (state.drawerId === S.myId);
  S.players = state.players.map(p => { return { ...p, isSelf: p.id === S.myId }; });
  S.revealedIdx = state.revealedIdx || [];
  if (state.hostId) S.lobbyHostId = state.hostId;
  if (state.players) {
    const me = state.players.find(p => p.id === S.myId);
    if (me && me.role) S.myRole = me.role;
  }
  
  // Always trust the God-Server for the maximum time limit
if (state.drawTime) S.drawTime = state.drawTime; 
  
  if (roundBadge) roundBadge.textContent = `Round ${state.round}/${state.totalRounds}`;
  buildLeaderboard();

  if ($('overlay-waiting')) $('overlay-waiting').classList.add('hidden');
  if (overlayRoundEnd) overlayRoundEnd.classList.add('hidden');

  // 🔥 Toggle Rating UI based on if you are the Drawer
  if ($('rate-bar')) {
      if (S.isDrawer || state.phase !== 'drawing') {
        $('rate-bar').classList.add('hidden');
      } else {
        $('rate-bar').classList.remove('hidden');
      }
  }

  if (state.phase === 'picking') {
    startWordSelectionUI(state.drawerId);
  } else if (state.phase === 'drawing') {
    if (overlayWordSelect) overlayWordSelect.classList.add('hidden');
    renderWordBlanks();
  }
});

// 🔥 ADDED: Receive Live Ratings
socket.on('artRated', (data) => {
  if (screenGame && !screenGame.classList.contains('active')) {
    return;
  }
  const p = S.players.find(x => x.id === data.id);
  const name = p ? p.name : 'Someone';
  const emoji = data.rating === 'like' ? '👍 liked' : '👎 disliked';
  addChat('system', '', `${name} ${emoji} the drawing!`);
  
  if (S.isDrawer) {
      floatPoints(data.rating === 'like' ? '👍' : '👎', window.innerWidth * 0.5, window.innerHeight * 0.4);
  }
});

socket.on('scoreUpdate', (serverPlayers) => {
  if (screenGame && !screenGame.classList.contains('active')) {
    return;
  }
  S.players = serverPlayers.map(p => {
    return { ...p, isSelf: p.id === S.myId };
  });
  buildLeaderboard();
});

socket.on('yourTurn', (choices) => {
  if (screenGame && !screenGame.classList.contains('active')) {
    return;
  }
  if ($('toolbar')) {
      $('toolbar').style.pointerEvents = 'auto';
      $('toolbar').style.opacity = '1';
  }
  if (wsCards) {
      wsCards.style.display = 'flex';
      
      const headerH2 = document.querySelector('.ws-header h2');
      const headerP = document.querySelector('.ws-header p');
      if (headerH2) headerH2.textContent = 'Choose a Word';
      if (headerP) headerP.innerHTML = `Pick one to draw! Time left: <span id="ws-timer" class="ws-clock">15</span>s`;
      
      wsCards.innerHTML = '';
      choices.forEach(c => {
        const card = document.createElement('div'); 
        card.className = 'ws-card';
        card.innerHTML = `<div class="ws-word">${c.w}</div><div class="ws-len">${c.w.length} letters</div>`;        
        card.addEventListener('pointerdown', (e) => {
          e.preventDefault();
          socket.emit('wordPicked', c.w);
        });
        wsCards.appendChild(card);
      });
  }
});

function startWordSelectionUI(drawerId) {
  if (overlayWordSelect) overlayWordSelect.classList.remove('hidden');
  S.history = [];
  if (ctx && gameCanvas) {
      ctx.fillStyle = 'white'; 
      ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
  }
  
  if (S.myId !== drawerId) {
    if ($('toolbar')) {
        $('toolbar').style.pointerEvents = 'none';
        $('toolbar').style.opacity = '0.4';
    }
    if (wsCards) wsCards.style.display = 'none';
    
    const headerH2 = document.querySelector('.ws-header h2');
    const headerP = document.querySelector('.ws-header p');
    if (headerH2) headerH2.textContent = 'Waiting...';
    
    const artist = S.players.find(p => p.id === drawerId);
    const artistName = artist ? artist.name : 'Artist';
    if (headerP) headerP.innerHTML = `${artistName} is picking a word... <span id="ws-timer" class="ws-clock">15</span>s`;
  }
}

socket.on('wordPicked', (word) => {
  if (screenGame && !screenGame.classList.contains('active')) {
    return;
  }
  if (overlayWordSelect) overlayWordSelect.classList.add('hidden');
  S.currentWord = word; 
  S.revealedIdx = []; 
  renderWordBlanks(); 
  
  addChat('system', '', `A new round begins! 🖊️`);
  
  if (ctx && gameCanvas) {
      ctx.fillStyle = 'white'; 
      ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
  }
  S.history = []; 
  S.remoteLastX = null;
  S.remoteLastY = null;
  
 if (!S.isDrawer) {
    if ($('rate-bar')) $('rate-bar').classList.remove('hidden');
  }

  // 🔥 RESET: Unlock the rating buttons for the new artist
  hasVotedOnArt = false;
  if ($('btn-like')) {
      $('btn-like').style.opacity = '1';
      $('btn-like').style.cursor = 'pointer';
  }
  if ($('btn-dislike')) {
      $('btn-dislike').style.opacity = '1';
      $('btn-dislike').style.cursor = 'pointer';
  }
});

socket.on('timeTick', (data) => {
  if (screenGame && !screenGame.classList.contains('active')) {
    return;
  }
  S.timeLeft = data.time;
  
  if (data.phase === 'drawing') {
    updateTimerUI();
    if (S.timeLeft <= 15 && S.timeLeft > 0) {
      playTickSound();
    }
  } 
  else if (data.phase === 'picking') {
    if ($('ws-timer')) {
      $('ws-timer').textContent = S.timeLeft;
    }
    if ($('ws-timer-bar')) {
        $('ws-timer-bar').style.transition = 'width 1s linear';
        $('ws-timer-bar').style.width = (S.timeLeft / 15 * 100) + '%';
    }
  }
  else if (data.phase === 'roundEnd') {
    const cdSpan = $('re-countdown');
    if (cdSpan) {
      cdSpan.textContent = S.timeLeft;
    }
  }
});

socket.on('timeUp', (data) => {
  if (screenGame && !screenGame.classList.contains('active')) {
    return;
  }
  
  if ($('rate-bar')) $('rate-bar').classList.add('hidden');

  if (data.players) {
    S.players = data.players.map(p => {
      return { ...p, isSelf: p.id === S.myId };
    });
    buildLeaderboard();
  }

  if (data.phase === 'drawing') {
    showRoundEndUI(data.word, data.allGuessed);
  } else if (data.phase === 'gameOver') {
    showGameOverUI();
  }
});

socket.on('drawerDisconnected', () => {
  if (screenGame && !screenGame.classList.contains('active')) {
    return;
  }
  addChat('system', '', '⚠️ The artist disconnected!');
});

socket.on('requestSync', () => {
  if (screenGame && !screenGame.classList.contains('active')) {
    return;
  }
  if (S.isDrawer && gameCanvas) {
    socket.emit('canvasCommand', { cmd: 'sync', data: gameCanvas.toDataURL() }); 
  }
});

socket.on('catchUpSync', (data) => {
  if (screenGame && !screenGame.classList.contains('active')) {
    return;
  }
  if ($('overlay-waiting')) $('overlay-waiting').classList.add('hidden');
  
  S.drawerIdx = S.players.findIndex(p => p.id === data.drawerId);
  S.isDrawer = (data.drawerId === S.myId);

  if (data.phase === 'picking') {
    startWordSelectionUI(data.drawerId);
 } else if (data.phase === 'drawing') {
            if (overlayWordSelect) overlayWordSelect.classList.add('hidden');
            S.currentWord = data.word; 
            S.revealedIdx = data.revealedIdx || []; 
            S.timeLeft = data.time;
            if (data.drawTime) S.drawTime = data.drawTime; // <-- ADD THIS LINE
            renderWordBlanks(); 
            updateTimerUI();  
    if (!S.isDrawer && $('rate-bar')) {
        $('rate-bar').classList.remove('hidden');
    }

    const drawHDVectors = () => {
      if (!gameCanvas || !ctx) return;
      const r = gameCanvas.getBoundingClientRect();
      data.strokes.forEach(stroke => {
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.size * r.width;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        const realX = stroke.x * r.width;
        const realY = stroke.y * r.height; // Updated for strict 4:3 reconstruction

        if (stroke.type === 'start') {
          ctx.beginPath();
          ctx.moveTo(realX, realY);
          ctx.lineTo(realX, realY);
          ctx.stroke();
        } else if (stroke.type === 'move') {
          ctx.lineTo(realX, realY);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(realX, realY);
        }
      });
    };
    
    if (data.baseCanvasImage && gameCanvas && ctx) {
      const img = new Image(); 
      img.onload = () => { 
        // 🛠️ FIXED: Divide by S.dpr to prevent massive zooming on mobile
        ctx.drawImage(img, 0, 0, gameCanvas.width / S.dpr, gameCanvas.height / S.dpr); 
        drawHDVectors(); 
        ctx.beginPath(); // Prevent connecting lines
      }; 
      img.src = data.baseCanvasImage;
    } else { 
      drawHDVectors(); 
    }
  }
});

socket.on('receiveChat', (data) => {
  if (screenGame && !screenGame.classList.contains('active')) {
    return;
  }
  addChat(data.type, data.name, data.text, false);
});

socket.on('correctGuess', (data) => {
  sfx.correct();
  if (screenGame && !screenGame.classList.contains('active')) {
    return;
  }
  const guesser = S.players.find(p => p.id === data.guesserId);
  
  const gName = (data.guesserId === S.myId) ? 'You' : (guesser ? guesser.name : 'Someone'); 
  addChat('correct', gName, `🎉 Guessed the word! (+${data.pts} pts)`, false);
  
  playSuccessSound();
  if (canvasWrap) {
    canvasWrap.classList.remove('shake-canvas');
    void canvasWrap.offsetWidth; // Trigger reflow
    canvasWrap.classList.add('shake-canvas');
  }

  // 🧃 JUICE: Find the specific player on the leaderboard and make their avatar jump!
  const playerItems = document.querySelectorAll('.player-item');
  playerItems.forEach(item => {
    const nameEl = item.querySelector('.pi-name');
    if (nameEl && nameEl.textContent.includes(guesser ? guesser.name : '')) {
      item.classList.remove('happy-bounce');
      void item.offsetWidth; // Trigger reflow
      item.classList.add('happy-bounce');
    }
  });
  
  if (data.guesserId === S.myId) { 
    showToast(`✅ You guessed it! +${data.pts} pts`, 't-correct'); 
    
    // 🧃 JUICE: Randomize the explosion slightly so multiple points look chaotic and fun
    const randomXOffset = (Math.random() - 0.5) * 60;
    const randomYOffset = (Math.random() - 0.5) * 40;
    floatPoints(`+${data.pts}`, (window.innerWidth * 0.5) + randomXOffset, (window.innerHeight * 0.4) + randomYOffset); 
  }
});

socket.on('hintRevealed', (data) => { 
  if (screenGame && !screenGame.classList.contains('active')) return;
  
  // Because the server hides the word from hackers, the server sends us the exact character: { idx: 2, char: 'A' }
  if (!S.revealedIdx.includes(data.idx)) {
    S.revealedIdx.push(data.idx);
    
    // Inject the revealed character into the masked string
    let arr = S.currentWord.split('');
    arr[data.idx] = data.char;
    S.currentWord = arr.join('');
    
    renderWordBlanks(); 
    showToast('💡 Hint letter revealed!', 't-info');
  }
});
socket.on('canvasCommand', (payload) => {
  if (screenGame && !screenGame.classList.contains('active')) {
    return;
  }
  if (payload && payload.cmd === 'sync' && gameCanvas && ctx) {
    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = 'white';
      // 🛠️ FIXED: Divide by S.dpr to prevent massive zooming on mobile
      ctx.fillRect(0, 0, gameCanvas.width / S.dpr, gameCanvas.height / S.dpr);
      ctx.drawImage(img, 0, 0, gameCanvas.width / S.dpr, gameCanvas.height / S.dpr);
      ctx.beginPath(); // 🛠️ FIXED: Reset path so next drawn lines don't connect
    };
    img.src = payload.data;
  }
});

function buildLeaderboard() {
  if (!playerList) return;
  const sorted = [...S.players].sort((a, b) => b.score - a.score);
  playerList.innerHTML = '';
  
  const drawerIdObj = S.players[S.drawerIdx];
  
  sorted.forEach((p, rank) => {
    const li = document.createElement('li');
    const isDrawer = (drawerIdObj && p.id === drawerIdObj.id); 
    
    li.className = 'player-item' + (isDrawer ? ' is-drawing' : '') + (p.guessed ? ' guessed' : '');
    
    const rankClass = rank === 0 ? 'gold' : rank === 1 ? 'silver' : rank === 2 ? 'bronze' : '';
    
    const avWrap = document.createElement('div'); 
    avWrap.className = 'pi-av';
    const avImgList = document.createElement('img');
    avImgList.src = p.avatarDef;
    avImgList.style.width = '100%'; 
    avImgList.style.height = '100%'; 
    avImgList.style.objectFit = 'cover';
    avWrap.appendChild(avImgList);
    
    let rankBadge = rank + 1;
    if (rank === 0) {
      rankBadge = '🥇';
    }
    if (rank === 1) {
      rankBadge = '🥈';
    }
    if (rank === 2) {
      rankBadge = '🥉';
    }
    
    li.innerHTML = `<div class="pi-rank ${rankClass}">${rankBadge}</div>`;
    li.appendChild(avWrap);
    
    let star = p.isSelf ? '⭐ ' : '';
    li.insertAdjacentHTML('beforeend', `<div class="pi-info"><div class="pi-name">${star}${escHtml(p.name)}</div><div class="pi-score">${p.score} pts</div></div>`);
    
    if (isDrawer) {
      li.insertAdjacentHTML('beforeend', `<span class="pi-badge">✏️</span>`);
    } else if (p.guessed) {
      li.insertAdjacentHTML('beforeend', `<span class="pi-badge">✅</span>`);
    }
    
    if (!p.isSelf) {
      li.style.cursor = 'pointer';
      li.addEventListener('click', e => openContextMenu(e, p));
    }
    
    playerList.appendChild(li);
  });
}

function updateTimerUI() {
  if (!timerNum) return;
  timerNum.textContent = S.timeLeft;
  const progress = S.timeLeft / S.drawTime;
  if (tFg) tFg.style.strokeDashoffset = String(CIRC * (1 - progress));
  
  const warn = S.timeLeft <= 15;
  timerNum.className = 'timer-num' + (warn ? ' warn' : '');
  if (tFg) tFg.setAttribute('class', 't-fg' + (warn ? ' warn' : '')); 
}

function renderWordBlanks() {
  if (!wordDisplay || !wordMeta) return;
  wordDisplay.innerHTML = ''; 
  if (!S.currentWord) { 
    wordMeta.textContent = ''; 
    return; 
  }
  
  wordMeta.textContent = S.isDrawer ? `You are drawing — ${S.currentWord.length} letters` : `${S.currentWord.length} letters`;

  for (let i = 0; i < S.currentWord.length; i++) {
    const ch = S.currentWord[i];
    const grp = document.createElement('div');
    const charEl = document.createElement('div');
    
    grp.className = 'wb-group'; 
    const revealed = S.revealedIdx.includes(i);
    charEl.className = 'wb-char' + (revealed && !S.isDrawer ? ' reveal' : '');
    charEl.textContent = S.isDrawer || revealed ? ch.toUpperCase() : '';
    
    grp.appendChild(charEl); 
    grp.insertAdjacentHTML('beforeend', `<div class="wb-line" style="width:20px"></div>`);
    wordDisplay.appendChild(grp);
  }
}

function showRoundEndUI(word, allGuessed) {
  addChat('system', '', `⏰ Turn over! Word was: "${word}"`);
  
  const oldBtnWrap = document.getElementById('podium-btns');
  if (oldBtnWrap) { 
    oldBtnWrap.style.display = 'none'; 
  }

  const sorted = [...S.players].sort((a, b) => b.score - a.score);
  if ($('re-emoji')) $('re-emoji').textContent = allGuessed ? '🎉' : '⏰'; 
  if ($('re-title')) $('re-title').textContent = allGuessed ? 'Everyone guessed!' : 'Turn Over!'; 
  
  const reWordP = document.getElementById('re-word');
  if(reWordP) { 
    reWordP.innerHTML = `The word was: <strong>${word}</strong>`; 
  }

  if ($('re-scores')) {
      $('re-scores').innerHTML = sorted.map((p, i) => {
        let medal = '';
        if (i === 0) medal = '🥇';
        if (i === 1) medal = '🥈';
        if (i === 2) medal = '🥉';
        return `<div class="re-score-row" style="animation-delay:${i*0.07}s"><span class="re-score-name">${medal} ${escHtml(p.name)}</span><span class="re-score-pts">${p.score} pts</span></div>`;
      }).join('');
  }
  
  if (overlayRoundEnd) overlayRoundEnd.classList.remove('hidden');
  if ($('re-next')) {
      $('re-next').style.display = '';
      $('re-next').innerHTML = `Next turn in <span id="re-countdown">4</span>s...`;
  }
}

function showGameOverUI() {
  const sortedPlayers = [...S.players].sort((a, b) => b.score - a.score); 
  const winner = sortedPlayers[0];
  
  if (overlayRoundEnd) {
      overlayRoundEnd.classList.remove('hidden'); 
      overlayRoundEnd.style.flexDirection = 'column'; 
  }
  
  if ($('re-emoji')) $('re-emoji').textContent = '🏆'; 
  if ($('re-title')) $('re-title').textContent = 'Game Over!'; 
  
  const reWordP = document.getElementById('re-word'); 
  if(reWordP) { 
    reWordP.innerHTML = `Winner: <strong>${escHtml(winner ? winner.name : 'Unknown')}</strong>`; 
  }
  
  if ($('re-next')) $('re-next').style.display = 'none';

  const top3 = sortedPlayers.slice(0, 3); 
  const rest = sortedPlayers.slice(3);
  
  let podiumHTML = '<div class="podium-top3">'; 
  const order = [1, 0, 2];
  
  order.forEach(idx => {
    const p = top3[idx];
    if (p) {
      const rank = idx + 1; 
      let crown = '🥉'; 
      let delay = 0.5; 
      
      if (rank === 1) {
        crown = '👑'; 
        delay = 2.8; 
      }
      if (rank === 2) {
        crown = '🥈';
        delay = 1.5; 
      }
      podiumHTML += `
        <div class="podium-place rank-${rank}" style="animation-delay: ${delay}s">
          <div class="podium-crown">${crown}</div>
          <div class="podium-av-wrap"><img src="${p.avatarDef}" alt="Avatar"></div>
          <div class="podium-name">${escHtml(p.name)}</div>
          <div class="podium-pts">${p.score} pts</div>
        </div>
      `;
    }
  });
  podiumHTML += '</div>';

  let restHTML = '<div class="re-scores-list">';
  rest.forEach((p, i) => { 
    restHTML += `
      <div class="re-score-row" style="animation-delay:${3.0 + (i * 0.08)}s">
        <div class="re-score-left">
          <span class="re-score-rank">#${i + 4}</span>
          <div class="re-score-av-wrap-small"><img class="re-score-av" src="${p.avatarDef}" alt="Avatar"></div>
          <span class="re-score-name">${escHtml(p.name)}</span>
        </div>
        <span class="re-score-pts">${p.score} pts</span>
      </div>
    `; 
  });
  restHTML += '</div>';

  if ($('re-scores')) $('re-scores').innerHTML = podiumHTML + restHTML;
  
  let oldBtnWrap = document.getElementById('podium-btns'); 
  if (oldBtnWrap) { 
    oldBtnWrap.remove(); 
  }

  const btnWrap = document.createElement('div'); 
  btnWrap.id = 'podium-btns'; 
  btnWrap.className = 'podium-btn-wrap';
  
  const playBtn = document.createElement('button'); 
  playBtn.innerHTML = '<span>🔄 Play Again</span>'; 
  playBtn.className = 'glass-fluid-btn play-btn'; 
  playBtn.onclick = () => { socket.emit('canvasCommand', { cmd: 'playAgain' }); };
  
  const homeBtn = document.createElement('button'); 
  homeBtn.innerHTML = '<span>🏠 Home</span>'; 
  homeBtn.className = 'glass-fluid-btn home-btn'; 
  homeBtn.onclick = () => location.reload(); 

  btnWrap.appendChild(playBtn); 
  btnWrap.appendChild(homeBtn);
  if (overlayRoundEnd) overlayRoundEnd.appendChild(btnWrap); 
  
  playDrumroll();
  setTimeout(() => {
    playWinnerSound();
    fireGrandConfetti();
    if (winner) { 
      showEventPopup('🏆', `${winner.name} wins the game!`); 
    }
  }, 2800);
}

/* ════════════════════════════════════════════
   CANVAS DRAWING & SHAPE LOGIC
════════════════════════════════════════════ */
function initCanvas() {
  if (!gameCanvas) return;
  resizeCanvas();
  gameCanvas.addEventListener('touchstart', onDrawStart, { passive: false });
  gameCanvas.addEventListener('touchmove', onDrawMove, { passive: false });
  gameCanvas.addEventListener('touchend', onDrawEnd);
  gameCanvas.addEventListener('touchcancel', onDrawEnd);
  gameCanvas.addEventListener('mousedown', onDrawStart);
  window.addEventListener('mousemove', onDrawMove);
  window.addEventListener('mouseup', onDrawEnd);
}

socket.on('drawing', (data) => {
  if (!screenGame || !screenGame.classList.contains('active')) return;
  if (!gameCanvas || !ctx) return;

  const r = gameCanvas.getBoundingClientRect();

  ctx.strokeStyle = data.color;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = data.size * r.width;

  const realX = data.x * r.width;
  const realY = data.y * r.height; 

  if (data.type === 'start') {
    ctx.beginPath();
    ctx.moveTo(realX, realY);
    ctx.lineTo(realX, realY);
    ctx.stroke();
    
    // Save the exact starting coordinate
    S.remoteLastX = realX;
    S.remoteLastY = realY;
  } else if (data.type === 'move') {
    
    // Guarantee we connect seamlessly from the previous received point
    if (S.remoteLastX !== null && S.remoteLastY !== null) {
      ctx.beginPath();
      ctx.moveTo(S.remoteLastX, S.remoteLastY);
      ctx.lineTo(realX, realY);
      ctx.stroke();
    }
    
    // Update the last known position
    S.remoteLastX = realX;
    S.remoteLastY = realY;
  }
});

function resizeCanvas() {
  const wrap = document.getElementById('canvas-wrap');
  if (!wrap || !gameCanvas || !ctx) return;

  const W = Math.max(1, Math.floor(wrap.clientWidth));
  const H = Math.max(1, Math.floor(wrap.clientHeight));
  if (W <= 0 || H <= 0) return;

  // Preserve the current artwork before the canvas gets resized
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = gameCanvas.width || W;
  tempCanvas.height = gameCanvas.height || H;
  const tempCtx = tempCanvas.getContext('2d');
  if (tempCtx && gameCanvas.width > 0 && gameCanvas.height > 0) {
    tempCtx.drawImage(gameCanvas, 0, 0);
  }

  gameCanvas.style.width = `${W}px`;
  gameCanvas.style.height = `${H}px`;

  S.dpr = window.devicePixelRatio || 1;
  gameCanvas.width = Math.round(W * S.dpr);
  gameCanvas.height = Math.round(H * S.dpr);

  ctx.setTransform(S.dpr, 0, 0, S.dpr, 0, 0);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, W, H);

  if (tempCtx) {
    ctx.drawImage(tempCanvas, 0, 0, W, H);
  }
}

function saveState() { 
  if (!gameCanvas || !ctx) return;
  if (S.history.length > 15) {
    S.history.shift(); 
  }
  S.history.push(ctx.getImageData(0, 0, gameCanvas.width, gameCanvas.height)); 
}

function getXY(e) {
  if (!gameCanvas) return {x:0, y:0};
  const r = gameCanvas.getBoundingClientRect(); // ALWAYS use gameCanvas
  let cx = e.clientX;
  let cy = e.clientY;

  if (e.touches && e.touches.length > 0) {
    cx = e.touches[0].clientX;
    cy = e.touches[0].clientY;
  } else if (e.changedTouches && e.changedTouches.length > 0) {
    cx = e.changedTouches[0].clientX;
    cy = e.changedTouches[0].clientY;
  }

  return {
    x: cx - r.left,
    y: cy - r.top
  };
}

function onDrawStart(e) {
  if (e.type === 'touchstart') {
    e.preventDefault(); 
  }
  if (!S.isDrawer || !gameCanvas || !ctx) {
    return;
  }
  
  S.isDrawing = true; 
  const pos = getXY(e); 
  saveState();

  // 🔥 ADDED: Shape Tool Start Logic
  if (S.tool === 'shape') {
      S.shapeStartX = pos.x;
      S.shapeStartY = pos.y;
      S.previewData = ctx.getImageData(0, 0, gameCanvas.width, gameCanvas.height);
      return;
  }
  
  if (S.tool === 'fill') { 
    floodFill(pos.x, pos.y, S.color); 
    S.isDrawing = false; 
    socket.emit('canvasCommand', { cmd: 'sync', data: gameCanvas.toDataURL() }); 
    return; 
  }
  
  const drawColor = S.tool === 'eraser' ? '#ffffff' : S.color; 
  const drawSize = S.tool === 'eraser' ? S.brushSize * 3 : S.brushSize;
  
  ctx.beginPath(); 
  ctx.moveTo(pos.x, pos.y); 
  ctx.lineTo(pos.x, pos.y); 
  ctx.strokeStyle = drawColor; 
  ctx.lineWidth = drawSize; 
  ctx.lineCap = 'round'; 
  ctx.lineJoin = 'round'; 
  ctx.stroke();
  
  const r = gameCanvas.getBoundingClientRect();
  socket.emit('drawing', {
    x: pos.x / r.width,
    y: pos.y / r.height, // Use exact locked height
    color: drawColor,
    size: drawSize / r.width,
    type: 'start' // (Use 'move' inside the onDrawMove function)
  });
}

function onDrawMove(e) {
  if (e.type === 'touchmove') {
    e.preventDefault(); 
  }
  if (!S.isDrawer || !S.isDrawing || !gameCanvas || !ctx) {
    return;
  }
  
  const pos = getXY(e); 

  // Shape Tool Live Preview Logic
  if (S.tool === 'shape') {
      ctx.putImageData(S.previewData, 0, 0);
      ctx.beginPath();
      ctx.strokeStyle = S.color;
      ctx.lineWidth = S.brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (S.shapeType === 'line') {
          ctx.moveTo(S.shapeStartX, S.shapeStartY);
          ctx.lineTo(pos.x, pos.y);
      } else if (S.shapeType === 'rect') {
          ctx.rect(S.shapeStartX, S.shapeStartY, pos.x - S.shapeStartX, pos.y - S.shapeStartY);
      } else if (S.shapeType === 'circle') {
          const radius = Math.sqrt(Math.pow(pos.x - S.shapeStartX, 2) + Math.pow(pos.y - S.shapeStartY, 2));
          ctx.arc(S.shapeStartX, S.shapeStartY, radius, 0, 2 * Math.PI);
      }
      ctx.stroke();
      return;
  }

  ctx.lineTo(pos.x, pos.y); 
  ctx.stroke(); 
  ctx.beginPath(); 
  ctx.moveTo(pos.x, pos.y);
  
  const drawColor = S.tool === 'eraser' ? '#ffffff' : S.color; 
  const drawSize = S.tool === 'eraser' ? S.brushSize * 3 : S.brushSize;
  
  const r = gameCanvas.getBoundingClientRect();
  socket.emit('drawing', { 
    x: pos.x / r.width, 
    y: pos.y / r.height, 
    color: drawColor, 
    size: drawSize / r.width, 
    type: 'move' // 🛠️ FIXED: This must be 'move', not 'start'
  });
}

function onDrawEnd(e) { 
  if (!S.isDrawer || !S.isDrawing || !ctx) {
    return;
  } 
  S.isDrawing = false; 
  
  // 🔥 ADDED: Shape Sync Logic (Uses the Heavy Canvas framework!)
  if (S.tool === 'shape' && gameCanvas) {
      socket.emit('canvasCommand', { cmd: 'sync', data: gameCanvas.toDataURL() });
      return;
  }

  ctx.closePath(); 
}

function floodFill(startX, startY, fillHex) {
  if (!gameCanvas || !ctx) return;
  const w = gameCanvas.width;
  const h = gameCanvas.height; 
  const id = ctx.getImageData(0, 0, w, h);
  const d = id.data;
  
  const xi = Math.round(startX * S.dpr);
  const yi = Math.round(startY * S.dpr);
  
  if (xi < 0 || xi >= w || yi < 0 || yi >= h) {
    return;
  }
  
  const idx = (yi * w + xi) * 4; 
  const tr = d[idx];
  const tg = d[idx+1];
  const tb = d[idx+2];
  const ta = d[idx+3];
  
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fillHex);
  const fc = r ? { r: parseInt(r[1],16), g: parseInt(r[2],16), b: parseInt(r[3],16) } : null;
  
  if (!fc || (tr === fc.r && tg === fc.g && tb === fc.b && ta === 255)) {
    return;
  }
  
  function match(i) { 
    return Math.abs(d[i]-tr) < 30 && Math.abs(d[i+1]-tg) < 30 && Math.abs(d[i+2]-tb) < 30 && Math.abs(d[i+3]-ta) < 30; 
  }
  
  const stack = [xi + yi * w];
  const seen = new Uint8Array(w * h);
  
  while (stack.length) {
    const p = stack.pop(); 
    if (seen[p]) {
      continue; 
    }
    
    const x = p % w;
    const y = Math.floor(p / w);
    
    if (x < 0 || x >= w || y < 0 || y >= h) {
      continue; 
    }
    
    const i = p * 4; 
    if (!match(i)) {
      continue;
    }
    
    seen[p] = 1; 
    d[i] = fc.r; 
    d[i+1] = fc.g; 
    d[i+2] = fc.b; 
    d[i+3] = 255;
    
    if (x + 1 < w) stack.push(p + 1); 
    if (x - 1 >= 0) stack.push(p - 1);
    if (y + 1 < h) stack.push(p + w); 
    if (y - 1 >= 0) stack.push(p - w);
  }
  
  ctx.putImageData(id, 0, 0);
}

function setupToolbar() {
  ['pencil','fill','eraser'].forEach(t => { 
    if($('tool-' + t)) { 
      $('tool-' + t).addEventListener('click', () => { 
        S.tool = t; 
        if(gameCanvas) gameCanvas.className = t === 'eraser' ? 'eraser' : ''; 
        document.querySelectorAll('.tool-btn[data-tool]').forEach(b => {
          b.classList.toggle('active', b.id === 'tool-' + t);
        }); 
      }); 
    }
  });

  // 🔥 ADDED: Shape Tool Popup Listeners
  if($('btn-shape-popup')) {
    $('btn-shape-popup').addEventListener('click', e => {
      e.stopPropagation();
      if($('popup-shape')) $('popup-shape').classList.toggle('hidden');
      if($('popup-color')) $('popup-color').classList.add('hidden');
      if($('popup-size')) $('popup-size').classList.add('hidden');
    });
  }

  document.querySelectorAll('.shape-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      S.tool = 'shape';
      S.shapeType = e.target.dataset.shape;
      if(gameCanvas) gameCanvas.className = 'crosshair';
      document.querySelectorAll('.tool-btn[data-tool]').forEach(b => b.classList.remove('active'));
      if ($('btn-shape-popup')) $('btn-shape-popup').classList.add('active');
      if($('popup-shape')) $('popup-shape').classList.add('hidden');
    });
  });
  
  if($('tool-undo')) {
    $('tool-undo').addEventListener('click', () => { 
      triggerUndo(); 
    });
  }
  
  if($('tool-clear')) {
    $('tool-clear').addEventListener('click', () => { 
      triggerClear(); 
    });
  }
  
  if($('size-slider')) {
      $('size-slider').addEventListener('input', e => { 
        S.brushSize = +e.target.value; 
        if($('size-val-txt')) $('size-val-txt').textContent = S.brushSize + 'px'; 
      });
  }
  
  if($('btn-color-popup')) {
      $('btn-color-popup').addEventListener('click', e => { 
        e.stopPropagation(); 
        if($('popup-color')) $('popup-color').classList.toggle('hidden'); 
        if($('popup-size')) $('popup-size').classList.add('hidden');
        if($('popup-shape')) $('popup-shape').classList.add('hidden');
      });
  }
  
  if($('btn-size-popup')) {
      $('btn-size-popup').addEventListener('click', e => { 
        e.stopPropagation(); 
        if($('popup-size')) $('popup-size').classList.toggle('hidden'); 
        if($('popup-color')) $('popup-color').classList.add('hidden');
        if($('popup-shape')) $('popup-shape').classList.add('hidden');
      });
  }
  
  if($('color-palette')) {
      $('color-palette').innerHTML = COLORS.map(hex => {
        let activeClass = hex === S.color ? 'active' : '';
        return `<div class="c-swatch ${activeClass}" style="background:${hex}" onclick="S.color='${hex}'; const ind = document.getElementById('color-indicator'); if(ind) ind.style.background='${hex}'; if(S.tool==='eraser'){ const p = document.getElementById('tool-pencil'); if(p) p.click(); }"></div>`;
      }).join('');
  }
  
  document.addEventListener('click', e => {
    const pColor = $('popup-color');
    const pSize = $('popup-size');
    const pShape = $('popup-shape');
    
    if (pColor && !pColor.classList.contains('hidden') && !pColor.contains(e.target) && $('btn-color-popup') && !$('btn-color-popup').contains(e.target)) {
      pColor.classList.add('hidden');
    }
    if (pSize && !pSize.classList.contains('hidden') && !pSize.contains(e.target) && $('btn-size-popup') && !$('btn-size-popup').contains(e.target)) {
      pSize.classList.add('hidden');
    }
    if (pShape && !pShape.classList.contains('hidden') && !pShape.contains(e.target) && $('btn-shape-popup') && !$('btn-shape-popup').contains(e.target)) {
      pShape.classList.add('hidden');
    }
  });
}

function triggerUndo() {
  if(!gameCanvas || !ctx) return;
  if (S.history.length > 0) { 
    ctx.putImageData(S.history.pop(), 0, 0); 
  } else { 
    ctx.fillStyle = 'white'; 
    ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height); 
  }
  
  socket.emit('canvasCommand', { cmd: 'sync', data: gameCanvas.toDataURL() });
}

function triggerClear() {
  if(!gameCanvas || !ctx) return;
  saveState(); 
  ctx.fillStyle = 'white'; 
  ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height); 
  
  socket.emit('canvasCommand', { cmd: 'sync', data: gameCanvas.toDataURL() });
}

/* ════════════════════════════════════════════
   CHAT & GUESSING
════════════════════════════════════════════ */
function setupChat() { 
  if (btnChatSend) btnChatSend.addEventListener('click', sendGuess); 
  if (chatInput) {
      chatInput.addEventListener('keydown', e => { 
        if (e.key === 'Enter') { 
          e.preventDefault(); 
          sendGuess(); 
        } 
      }); 
  }
}

function sendGuess() {
  if (!chatInput) return;
  const val = chatInput.value.trim(); 
  if (!val) return; 
  
  chatInput.value = '';
  
  // We just send the text to the server. 
  // The server now handles ALL cheating, edit-distance, and points!
  socket.emit('chatMessage', { type: 'normal', name: S.playerName, text: val });
}

function addChat(type, name, text, broadcast = true) {
  if (!chatMessages) return;
  const div = document.createElement('div'); 
  
  let typeClass = 'normal';
  if (type === 'correct') {
    typeClass = 'correct';
  }
  if (type === 'system') {
    typeClass = 'system';
  }
  if (type === 'close') {
    typeClass = 'close';
  }
  
  div.className = 'chat-msg ' + typeClass;
  
  if (type === 'system' || type === 'close') {
    div.innerHTML = `<span class="msg-text">${escHtml(text)}</span>`;
  } else {
    div.innerHTML = `<span class="msg-name">${escHtml(name)}:</span> <span class="msg-text">${escHtml(text)}</span>`;
  }
    
  chatMessages.appendChild(div); 
  chatMessages.scrollTop = chatMessages.scrollHeight;
  
  if (type === 'normal') {
    playPopSound();
  }
  
  if (broadcast && type === 'normal') { 
    socket.emit('chatMessage', { type, name, text }); 
  }
}

if ($('btn-mute')) {
    $('btn-mute').addEventListener('click', () => { 
      S.isMuted = !S.isMuted; 
      
      if (S.isMuted) {
        if ($('mute-icon')) $('mute-icon').innerHTML = `<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>`;
      } else {
        if ($('mute-icon')) $('mute-icon').innerHTML = `<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>`;
      }
    });
}

function setupContextMenu() {
  document.addEventListener('click', e => {
    if (contextMenu && !contextMenu.contains(e.target)) {
      contextMenu.classList.add('hidden');
    }
  });

  // HOST ONLY: Instant kick from game
  if ($('ctx-host-kick')) {
    $('ctx-host-kick').addEventListener('click', () => {
      if (contextMenu) contextMenu.classList.add('hidden');
      if (S.ctxTarget && isHost()) {
        socket.emit('hostKick', S.ctxTarget.id);
        showToast(`👢 Kicked ${S.ctxTarget.name}`, 't-warn');
      }
    });
  }

  // HOST ONLY: Transfer crown
  if ($('ctx-transfer-host')) {
    $('ctx-transfer-host').addEventListener('click', () => {
      if (contextMenu) contextMenu.classList.add('hidden');
      if (S.ctxTarget && isHost()) {
        socket.emit('transferHost', S.ctxTarget.id);
      }
    });
  }

  if ($('ctx-kick')) {
      $('ctx-kick').addEventListener('click', () => {
        if (contextMenu) contextMenu.classList.add('hidden');
        if (S.ctxTarget) {
          socket.emit('voteKick', S.ctxTarget.id);
          showToast(`🗳️ Vote kick initiated for ${S.ctxTarget.name}`, 't-warn');
        }
      });
  }

  if ($('ctx-report')) {
      $('ctx-report').addEventListener('click', () => {
        if (contextMenu) contextMenu.classList.add('hidden');
        if (S.ctxTarget) {
          showToast(`🚩 ${S.ctxTarget.name} reported`, 't-warn');
        }
      });
  }

  if ($('ctx-mute')) {
      $('ctx-mute').addEventListener('click', () => {
        if (contextMenu) contextMenu.classList.add('hidden');
        if (S.ctxTarget) {
          showToast(`🔇 ${S.ctxTarget.name} muted locally`, 't-info');
        }
      });
  }

  if ($('ctx-close')) {
      $('ctx-close').addEventListener('click', () => {
        if (contextMenu) contextMenu.classList.add('hidden');
      });
  }
}

function openContextMenu(e, player) {
  e.stopPropagation();
  S.ctxTarget = player;
  if (ctxName) ctxName.textContent = player.name;
  if (ctxPts) ctxPts.textContent = player.score + ' pts';

  if (ctxAv) {
      ctxAv.innerHTML = '';
      const img = document.createElement('img');
      img.src = player.avatarDef;
      img.style.width = '100%'; img.style.height = '100%'; img.style.objectFit = 'cover';
      ctxAv.appendChild(img);
  }

  // Show/hide host-only actions
  const hostKickBtn = $('ctx-host-kick');
  const transferBtn = $('ctx-transfer-host');
  if (hostKickBtn) hostKickBtn.style.display = isHost() ? '' : 'none';
  if (transferBtn) transferBtn.style.display = isHost() ? '' : 'none';

  if (contextMenu) {
      contextMenu.classList.remove('hidden');
      contextMenu.style.left = Math.min(e.clientX, window.innerWidth - 200) + 'px';
      contextMenu.style.top = Math.min(e.clientY, window.innerHeight - 280) + 'px';
  }
}

function showEventPopup(icon, msg) { 
  if(!$('event-popup')) {
    return; 
  }
  
  if ($('event-popup-icon')) $('event-popup-icon').textContent = icon; 
  if ($('event-popup-msg')) $('event-popup-msg').textContent = msg; 
  $('event-popup').classList.remove('hidden'); 
  
  setTimeout(() => {
    $('event-popup').classList.add('hidden');
  }, 2800); 
}

function showToast(msg, type = 't-info') { 
  const tc = $('toast-container');
  if(!tc) return;
  const t = document.createElement('div'); 
  
  t.className = 'toast ' + type; 
  t.textContent = msg; 
  tc.prepend(t); 
  
  setTimeout(() => { 
    t.classList.add('fade-out'); 
    setTimeout(() => {
      t.remove();
    }, 380); 
  }, 3800); 
}

function floatPoints(text, x, y) { 
  const el = document.createElement('div'); 
  el.className = 'float-pts'; 
  el.textContent = text; 
  el.style.left = x + 'px'; 
  el.style.top = y + 'px'; 
  document.body.appendChild(el); 
  
  setTimeout(() => {
    el.remove();
  }, 1300); 
}

function escHtml(str) { 
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); 
}

function fireGrandConfetti() {
  if (typeof confetti === 'undefined') {
    return;
  }
  
  const duration = 4000; 
  const end = Date.now() + duration;
  
  confetti({ 
    particleCount: 250, 
    spread: 360, 
    origin: { y: 0.4, x: 0.5 }, 
    startVelocity: 65, 
    colors: ['#4a8fe8', '#2ecc87', '#f4b942', '#ec4899', '#8b5cf6', '#ffffff'], 
    zIndex: 99999 
  });
  
  (function frame() {
    confetti({ 
      particleCount: 10, 
      angle: 60, 
      spread: 100, 
      origin: { x: -0.1, y: 0.8 }, 
      colors: ['#4a8fe8', '#2ecc87', '#f4b942', '#ec4899'], 
      zIndex: 99999 
    });
    
    confetti({ 
      particleCount: 10, 
      angle: 120, 
      spread: 100, 
      origin: { x: 1.1, y: 0.8 }, 
      colors: ['#f4b942', '#ec4899', '#8b5cf6', '#ffffff'], 
      zIndex: 99999 
    });
    
    if (Date.now() < end) { 
      requestAnimationFrame(frame); 
    }
  }());
}

// ==========================================
// 🔊 ZERO-RISK AUDIO ENGINE (WEB AUDIO API)
// ==========================================
const sfx = {
    join: () => { try { playEffect(440, 'sine', 0.2, 0.05); } catch(e){} }, 
    correct: () => {                                                      
        try {
            playEffect(523.25, 'sine', 0.1, 0.05); 
            setTimeout(() => playEffect(659.25, 'sine', 0.2, 0.05), 100);
            if (navigator.vibrate) navigator.vibrate(50);     
        } catch(e){}
    },
    tick: () => { try { playEffect(150, 'triangle', 0.05, 0.02); } catch(e){} }  
};

function playEffect(freq, type, duration, vol) {
    try {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        if (audioCtx.state === 'suspended') {
            audioCtx.resume().catch(() => {});
        }
        
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        
        gain.gain.setValueAtTime(vol, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
        // Silently catch audio errors so the game never freezes
    }
}
// 🔥 Thematic, Game-Screen-Only Invite Button (Final Placement Fix)
document.addEventListener('DOMContentLoaded', () => {
  // Remove old button if it exists to prevent duplicates
  const oldBtn = document.getElementById('btn-copy-invite');
  if (oldBtn) oldBtn.remove();

  const inviteBtn = document.createElement('img');
  
  // 🔥 THE FIX: Added a forward slash so it always loads from the root directory!
  inviteBtn.src = "/add-group_4170328.png"; 
  inviteBtn.id = "btn-copy-invite";
  
  inviteBtn.style.width = '35px';
  inviteBtn.style.height = '35px';
  inviteBtn.style.cursor = 'pointer';
  inviteBtn.style.transition = 'transform 0.2s';
  inviteBtn.style.filter = 'drop-shadow(0px 2px 4px rgba(0,0,0,0.15))';
  inviteBtn.style.pointerEvents = 'auto'; 
  
  // Hover effects
  inviteBtn.onmouseover = () => inviteBtn.style.transform = 'scale(1.1)';
  inviteBtn.onmouseout = () => inviteBtn.style.transform = 'scale(1)';
  
  // Click logic
  inviteBtn.addEventListener('click', (e) => {
    e.stopPropagation(); 
    let urlToCopy = window.location.href; 
    
    if (typeof roomCodeFromUrl !== 'undefined' && roomCodeFromUrl) {
      urlToCopy = window.location.origin + '/r/' + roomCodeFromUrl;
    }
    
    navigator.clipboard.writeText(urlToCopy).then(() => {
      showToast('🔗 Invite Link Copied!', 't-info');
    }).catch(err => {
      showToast('❌ Failed to copy link', 't-warn');
    });
  });

  // 🔥 THE FIX: Grouping the Timer and Button together on the left
  const timerNum = document.getElementById('timer-num');
  
  if (timerNum) {
      // Find the actual container of the timer (the SVG or a wrapper div)
      let timerContainer = timerNum.closest('svg') || timerNum.parentElement;
      
      // Create a new mini-box to hold them side-by-side
      const leftGroup = document.createElement('div');
      leftGroup.style.display = 'flex';
      leftGroup.style.alignItems = 'center';
      leftGroup.style.gap = '12px'; // Perfect spacing between timer and button
      
      // Put the timer and button inside our new box, and put the box in the header
      timerContainer.parentNode.insertBefore(leftGroup, timerContainer);
      leftGroup.appendChild(timerContainer);
      leftGroup.appendChild(inviteBtn);
  }
});
