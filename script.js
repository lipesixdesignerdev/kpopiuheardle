// ─── CONFIG & STATE ───
const CONFIG = {
  DURATIONS: [1, 2, 4, 7, 11, 16],
  KEYS: { STATS: 'iu-heardle-stats', THEME: 'iu-heardle-theme' },
  THEMES: ['dark', 'light', 'neon', 'sepia', 'abyss'],
  I18N: {
    PT: { title: "IU Heardle — Adivinhe a Música", status: "Pronto! Clique ▶", placeholder: "seu palpite aqui…", skip: "⏭ Pular (+1s)", confirm: "✓ Confirmar", won: "🎉 Você acertou!", lost: "😔 Não foi dessa vez!", playAgain: "🔄 Jogar Novamente", stats: "📊 Estatísticas", labels: ["Partidas", "Vitórias", "Sequência", "Melhor"], dist: "Distribuição", reset: "🗑 Resetar", close: "Fechar", pct: "de aproveitamento", credit: "Feito com ❤ por", copied: "Copiado para a área de transferência!" },
    EN: { title: "IU Heardle — Guess the Song", status: "Ready! Click ▶", placeholder: "your guess here…", skip: "⏭ Skip (+1s)", confirm: "✓ Confirm", won: "🎉 You got it!", lost: "😔 Not this time!", playAgain: "🔄 Play Again", stats: "📊 Statistics", labels: ["Played", "Wins", "Streak", "Best"], dist: "Distribution", reset: "🗑 Reset", close: "Close", pct: "win rate", credit: "Made with ❤ by", copied: "Copied to clipboard!" },
    ES: { title: "IU Heardle — Adivina la Canción", status: "¡Listo! Clic ▶", placeholder: "tu respuesta aquí…", skip: "⏭ Saltar (+1s)", confirm: "✓ Confirmar", won: "🎉 ¡Lo lograste!", lost: "😔 ¡Otra vez será!", playAgain: "🔄 Jugar de Nuevo", stats: "📊 Estadísticas", labels: ["Partidas", "Victorias", "Racha", "Mejor"], dist: "Distribución", reset: "🗑 Reiniciar", close: "Cerrar", pct: "de rendimiento", credit: "Hecho con ❤ por", copied: "¡Copiado al portapapeles!" }
  }
};

const STATE = { song: null, attempt: 0, guesses: [], isPlaying: false, audio: new Audio(), timer: null, over: false, lang: 'PT', theme: localStorage.getItem(CONFIG.KEYS.THEME) || 'dark', artworkUrl: null, artworkPromise: null };
const DOM = { get: id => document.getElementById(id), qs: s => document.querySelector(s), qsa: s => document.querySelectorAll(s) };
const i18n = k => CONFIG.I18N[STATE.lang][k];

// ─── UI BUILDERS ───
function initUI() {
  const buildOpts = (id, items, attr, active, fn) => {
    const c = DOM.get(id);
    c.innerHTML = items.map(i => `<button class="${attr}-btn ${i===active?'active':''}" data-val="${i}">${i.toUpperCase()}</button>`).join('');
    c.onclick = e => { const v = e.target.dataset.val; if(v) fn(v); };
  };

  // Themes
  DOM.get('themeOptions').innerHTML = CONFIG.THEMES.map(t => `<button class="theme-option ${t===STATE.theme?'active':''}" data-theme="${t}"><span class="theme-dot dot-${t}"></span> ${t[0].toUpperCase()+t.slice(1)}</button>`).join('');
  DOM.get('themeOptions').onclick = e => { const t = e.target.closest('button')?.dataset.theme; if(t) setTheme(t); };
  setTheme(STATE.theme);

  // Languages
  buildOpts('langSwitcher', Object.keys(CONFIG.I18N), 'lang', STATE.lang, setLanguage);
  setLanguage(STATE.lang);
}

const THEME_ICONS = {
  dark: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="24" height="24"><path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" /></svg>',
  light: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="24" height="24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" /></svg>',
  neon: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="24" height="24"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>',
  sepia: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="24" height="24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.468 5.99 5.99 0 0 0-1.925 3.547 5.975 5.975 0 0 1-2.133-1.001A3.75 3.75 0 0 0 12 18Z" /></svg>',
  abyss: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="24" height="24"><path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09l2.846.813-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" /></svg>'
};

function setTheme(t) {
  STATE.theme = t; document.documentElement.setAttribute('data-theme', t);
  localStorage.setItem(CONFIG.KEYS.THEME, t);
  DOM.qsa('.theme-option').forEach(b => b.classList.toggle('active', b.dataset.theme === t));
  DOM.get('themeOptions').classList.remove('visible');
  if(DOM.get('themeToggleBtn')) DOM.get('themeToggleBtn').innerHTML = THEME_ICONS[t] || THEME_ICONS.dark;
}

function setLanguage(l) {
  STATE.lang = l;
  document.documentElement.lang = l.toLowerCase();
  const txt = CONFIG.I18N[l];
  document.title = txt.title;
  DOM.get('statusText').textContent = txt.status; DOM.get('songInput').placeholder = txt.placeholder;
  DOM.get('skipBtn').textContent = txt.skip; DOM.get('confirmBtn').textContent = txt.confirm;
  if(DOM.get('creditText')) DOM.get('creditText').textContent = txt.credit;
  DOM.get('againBtn').textContent = txt.playAgain;
  DOM.qsa('.lang-btn').forEach(b => b.classList.toggle('active', b.dataset.val === l));
}

// ─── AUDIO BLOB LOADER (hides mp3 filenames from Network tab) ───
let _currentBlobUrl = null;
async function loadAudioBlob(src) {
  try {
    if (_currentBlobUrl) { URL.revokeObjectURL(_currentBlobUrl); _currentBlobUrl = null; }
    const res = await fetch(src);
    const blob = await res.blob();
    _currentBlobUrl = URL.createObjectURL(blob);
    STATE.audio.src = _currentBlobUrl;
  } catch(e) {
    // fallback to direct src if fetch fails
    STATE.audio.src = src;
  }
}

// ─── ARTWORK PREFETCH ───
async function fetchArtwork(song) {
  const cleanTitle = song.title.replace(/\([^)]+\)/g, '').trim();
  const queries = [
    `artist:"IU" track:"${cleanTitle}"`,
    `artist:"IU" track:"${song.title}"`,
    `artist:"IU" album:"${song.album}"`,
  ];
  const fetchDeezerJSONP = (q) => new Promise((resolve) => {
    const cb = 'dz_' + Math.floor(Math.random()*1000000);
    window[cb] = (data) => { delete window[cb]; document.head.removeChild(s); resolve(data); };
    const s = document.createElement('script');
    s.src = `https://api.deezer.com/search?q=${encodeURIComponent(q)}&limit=3&output=jsonp&callback=${cb}`;
    s.onerror = () => { delete window[cb]; document.head.removeChild(s); resolve({data:[]}); };
    document.head.appendChild(s);
  });

  for (const q of queries) {
    try {
      const data = await fetchDeezerJSONP(q);
      if (data && data.data && data.data.length > 0) {
        const cover = data.data[0].album?.cover_xl || data.data[0].album?.cover_big || data.data[0].album?.cover_medium;
        if (cover) return cover;
      }
    } catch(e) { /* try next */ }
  }
  try {
    const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent('IU ' + cleanTitle)}&entity=song&country=kr&limit=5`);
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      const match = data.results.find(r => r.artistName && r.artistName.includes('IU')) || data.results[0];
      if (match && match.artworkUrl100) return match.artworkUrl100.replace('100x100bb', '600x600bb');
    }
  } catch(e) {}
  return null;
}

// ─── GAME CORE ───
function init() {
  if (typeof musicasIU === 'undefined') return alert("Erro: database.js não encontrado!");
  STATE.over = false; STATE.attempt = 0; STATE.guesses = [];
  if (STATE.isPlaying) pauseAudio();
  
  STATE.song = musicasIU[Math.floor(Math.random() * musicasIU.length)];
  STATE.artworkUrl = null;
  // Prefetch artwork AND load audio blob simultaneously in background
  STATE.artworkPromise = fetchArtwork(STATE.song).then(url => { STATE.artworkUrl = url; });
  loadAudioBlob(STATE.song.file);

  DOM.get('waveform').innerHTML = '<div class="wave-bar" style="height:10px;"></div>'.repeat(25);
  buildAlphaBrowser();
  DOM.get('songInput').value = ''; DOM.get('timerFill').style.width = '0%'; DOM.get('timerLabel').textContent = '0.0s / 1s';
  updateGameView();
}

function handlePlay() {
  if (!STATE.song || STATE.isPlaying) return pauseAudio();
  const dur = CONFIG.DURATIONS[STATE.attempt];
  STATE.audio.currentTime = 0;
  STATE.audio.play().catch(() => DOM.get('statusText').textContent = 'Erro no áudio');
  STATE.isPlaying = true; DOM.get('playBtn').textContent = '⏸'; DOM.get('waveform').classList.add('playing');
  
  let el = 0;
  STATE.timer = setInterval(() => {
    el += 0.1;
    DOM.get('timerFill').style.width = Math.min((el/dur)*100, 100) + '%';
    DOM.get('timerLabel').textContent = `${el.toFixed(1)}s / ${dur}s`;
    if (el >= dur) pauseAudio();
  }, 100);
}

function pauseAudio() {
  STATE.audio.pause(); clearInterval(STATE.timer); STATE.isPlaying = false;
  DOM.get('playBtn').textContent = '▶'; DOM.get('waveform').classList.remove('playing');
}

function nextTurn(guessVal, skipped = false) {
  if (STATE.over) return;
  const correct = !skipped && guessVal.toLowerCase() === STATE.song.title.toLowerCase();
  STATE.guesses.push({ title: skipped ? 'Pulou' : guessVal, correct, skipped });
  
  if (correct || !skipped) DOM.get('songInput').value = '';
  
  if (!correct) {
    STATE.attempt++;
    const inp = DOM.get('songInput');
    inp.classList.remove('shake');
    void inp.offsetWidth; // reset anim
    inp.classList.add('shake');
  }
  
  updateGameView();
  if (correct || STATE.attempt >= 6) finishGame(correct);
}

function updateGameView() {
  DOM.get('barsContainer').innerHTML = Array(6).fill(0).map((_, i) => {
    const g = STATE.guesses[i];
    const cls = !g ? '' : g.correct ? ' correct' : g.skipped ? ' skipped' : ' wrong';
    return `<div class="bar${cls}"></div>`;
  }).join('');
  DOM.get('guessesList').innerHTML = STATE.guesses.map(g => `<div class="guess-item">${g.title}</div>`).join('');
}

async function finishGame(won) {
  STATE.over = true; pauseAudio();
  const stats = getStats();
  stats.played++;
  if (won) { stats.wins++; stats.streak++; stats.best = Math.max(stats.best, stats.streak); stats.dist[STATE.attempt+1] = (stats.dist[STATE.attempt+1]||0)+1; }
  else stats.streak = 0;
  localStorage.setItem(CONFIG.KEYS.STATS, JSON.stringify(stats));

  DOM.get('resultModal').classList.add('show');
  DOM.get('resultTitle').textContent = i18n(won ? 'won' : 'lost');
  DOM.get('resultSongName').textContent = STATE.song.title;
  DOM.get('resultAlbum').textContent = STATE.song.album;

  const albumArt = DOM.get('albumArt');
  const albumFallback = DOM.get('albumFallback');
  albumArt.style.display = '';
  albumFallback.style.display = 'none';
  albumArt.onerror = () => { albumArt.style.display = 'none'; albumFallback.style.display = 'flex'; };

  if (won && typeof confetti === 'function') confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#00d4ff', '#0070f3', '#ff00ff', '#ffffff'] });
  if (DOM.get('shareBtn')) DOM.get('shareBtn').style.display = 'flex';

  // Artwork was prefetched during gameplay — show instantly
  // Wait for the promise only if it's still pending (e.g. very fast finish)
  await STATE.artworkPromise;
  const url = STATE.artworkUrl;
  if (url) {
    albumArt.src = url;
    if (DOM.get('ambientBg')) DOM.get('ambientBg').src = url;
  } else {
    albumArt.style.display = 'none';
    albumFallback.style.display = 'flex';
  }
}

function shareResults() {
  const blocks = STATE.guesses.map(g => g.correct ? '🟩' : g.skipped ? '🟨' : '🟥').join('');
  const text = `🎵 IU Heardle - ${STATE.guesses[STATE.guesses.length-1]?.correct ? STATE.attempt + 1 : 'X'}/6\n${blocks}\n👉 https://kpopiuheardle.vercel.app`;
  navigator.clipboard.writeText(text).then(() => alert(i18n('copied') || "Copiado!"));
}

// ─── FEATURES: Alpha Browser & Autocomplete ───
function buildAlphaBrowser() {
  const box = DOM.get('alphaBrowser') || document.createElement('div');
  box.id = 'alphaBrowser';
  box.style.cssText = 'display:flex;flex-wrap:wrap;gap:5px;margin-bottom:8px;padding:10px;background:var(--card);border:1px solid var(--border);border-radius:12px;';
  
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(l => {
    const has = musicasIU.some(s => s.title.toUpperCase().startsWith(l));
    return `<button data-l="${l}" ${!has?'disabled':''} style="width:26px;height:26px;font-size:11px;font-weight:700;border-radius:6px;border:1px solid ${has?'var(--border)':'transparent'};background:${has?'var(--bg)':'transparent'};color:${has?'var(--text)':'var(--muted)'};cursor:${has?'pointer':'default'}">${l}</button>`;
  }).join('');
  
  box.innerHTML = chars + `<button id="clrAlpha" style="width:26px;height:26px;border:1px solid var(--accent);color:var(--accent);background:transparent;border-radius:6px;margin-left:4px;cursor:pointer">✕</button>`;
  
  if (!DOM.get('alphaBrowser')) DOM.get('songInput').before(box);

  box.onclick = e => {
    if (e.target.id === 'clrAlpha') { resetAlpha(); return; }
    const btn = e.target.closest('button[data-l]');
    if (!btn || btn.disabled) return;
    
    const isActive = btn.style.background === 'var(--accent)';
    resetAlpha();
    if (!isActive) {
      btn.style.cssText += ';background:var(--accent);color:#fff;border-color:var(--accent)';
      showAC(musicasIU.filter(s => s.title.toUpperCase().startsWith(btn.dataset.l)));
    }
  };
}

function resetAlpha() {
  DOM.get('songInput').value = ''; DOM.get('autocomplete').classList.remove('show');
  DOM.qsa('#alphaBrowser button[data-l]').forEach(b => {
    if(!b.disabled) b.style.cssText += ';background:var(--bg);color:var(--text);border-color:var(--border)';
  });
}

function showAC(list) {
  const ac = DOM.get('autocomplete');
  ac.innerHTML = list.slice(0, 50).map(m => `<div class="ac-item" data-t="${m.title}">${m.title}</div>`).join('');
  ac.classList.toggle('show', list.length > 0);
  ac.onclick = e => { if(e.target.dataset.t) { DOM.get('songInput').value = e.target.dataset.t; ac.classList.remove('show'); }};
}

// ─── STATS ───
const getStats = () => JSON.parse(localStorage.getItem(CONFIG.KEYS.STATS)) || { played:0, wins:0, streak:0, best:0, dist:{} };

function openStats() {
  const s = getStats(), lbl = i18n('labels'), max = Math.max(...Object.values(s.dist), 1);
  DOM.get('statsGrid').innerHTML = [s.played, s.wins, s.streak, s.best].map((v,i) => `<div class="stat-box"><span class="stat-number">${v}</span><span class="stat-label">${lbl[i]}</span></div>`).join('');
  DOM.get('statsSubtitle').textContent = `${s.played ? Math.round((s.wins/s.played)*100) : 0}% ${i18n('pct')}`;
  DOM.get('distSection').innerHTML = `<p class="dist-title">${i18n('dist')}</p>` + Array(6).fill(0).map((_,i) => {
    const v = s.dist[i+1]||0, hl = (STATE.over && STATE.attempt === i && STATE.guesses[i]?.correct) ? 'highlight' : '';
    return `<div class="dist-row"><span class="dist-num">${i+1}</span><div class="dist-bar-wrap"><div class="dist-bar-fill ${hl}" style="width:${Math.max((v/max)*100, 4)}%">${v||''}</div></div></div>`;
  }).join('');
  DOM.get('statsModal').classList.add('show');
}

// ─── EVENTS ───
DOM.get('songInput').oninput = e => {
  if (e.target.value) resetAlpha();
  const v = e.target.value.toLowerCase();
  showAC(v ? musicasIU.filter(s => s.title.toLowerCase().includes(v)).slice(0,5) : []);
};
DOM.get('songInput').onkeydown = e => e.key === 'Enter' && nextTurn(DOM.get('songInput').value.trim());

DOM.get('playBtn').onclick = handlePlay;
DOM.get('confirmBtn').onclick = () => nextTurn(DOM.get('songInput').value.trim());
DOM.get('skipBtn').onclick = () => nextTurn('', true);
DOM.get('themeToggleBtn').onclick = () => DOM.get('themeOptions').classList.toggle('visible');
document.onclick = e => {
  if (!e.target.closest('.theme-switcher')) DOM.get('themeOptions').classList.remove('visible');
  if (!e.target.closest('.input-section') && !e.target.closest('#alphaBrowser')) DOM.get('autocomplete').classList.remove('show');
};

DOM.get('statsBtn').onclick = () => {
    DOM.get('statsTitle').textContent = i18n('stats'); DOM.get('statsResetBtn').textContent = i18n('reset'); DOM.get('statsCloseBtn').textContent = i18n('close');
    openStats();
};
DOM.get('statsCloseBtn').onclick = () => DOM.get('statsModal').classList.remove('show');
DOM.get('statsResetBtn').onclick = () => confirm('Resetar?') && localStorage.removeItem(CONFIG.KEYS.STATS) | openStats();
DOM.get('againBtn').onclick = DOM.get('newBtn').onclick = () => { DOM.get('resultModal').classList.remove('show'); DOM.get('ambientBg').src=''; init(); };
if(DOM.get('shareBtn')) DOM.get('shareBtn').onclick = shareResults;

window.onload = () => { initUI(); init(); };
