// ─── CONFIG ───
const CONFIG = {
  DURATIONS: [1, 2, 4, 7, 11, 16],
  STATS_KEY: 'iu-heardle-stats',
  THEME_KEY: 'iu-heardle-theme',
  WAVEFORM_BARS: 25,
  THEMES: ['dark', 'light', 'neon', 'sepia', 'abyss'],
  I18N: {
    PT: {
      status: "Pronto! Clique ▶",
      placeholder: "seu palpite aqui…",
      skip: "⏭ Pular (+1s)",
      confirm: "✓ Confirmar",
      wonTitle: "🎉 Você acertou!",
      lostTitle: "😔 Não foi dessa vez!",
      playAgain: "🔄 Jogar Novamente",
      statsTitle: "📊 Estatísticas",
      statsHist: "Seu histórico de partidas",
      statsLabels: ["Partidas", "Vitórias", "Sequência", "Melhor"],
      statsDist: "Distribuição de tentativas",
      statsReset: "🗑 Resetar",
      statsClose: "Fechar",
      statsWinPct: "de aproveitamento"
    },
    EN: {
      status: "Ready! Click ▶",
      placeholder: "your guess here…",
      skip: "⏭ Skip (+1s)",
      confirm: "✓ Confirm",
      wonTitle: "🎉 You got it!",
      lostTitle: "😔 Not this time!",
      playAgain: "🔄 Play Again",
      statsTitle: "📊 Statistics",
      statsHist: "Your match history",
      statsLabels: ["Played", "Wins", "Streak", "Best"],
      statsDist: "Guess distribution",
      statsReset: "🗑 Reset",
      statsClose: "Close",
      statsWinPct: "win rate"
    },
    ES: {
      status: "¡Listo! Clic ▶",
      placeholder: "tu respuesta aquí…",
      skip: "⏭ Saltar (+1s)",
      confirm: "✓ Confirmar",
      wonTitle: "🎉 ¡Lo lograste!",
      lostTitle: "😔 ¡Otra vez será!",
      playAgain: "🔄 Jugar de Nuevo",
      statsTitle: "📊 Estadísticas",
      statsHist: "Tu historial de partidas",
      statsLabels: ["Partidas", "Victorias", "Racha", "Mejor"],
      statsDist: "Distribución de intentos",
      statsReset: "🗑 Reiniciar",
      statsClose: "Cerrar",
      statsWinPct: "de rendimiento"
    }
  },
  THEME_DOTS: {
    dark: 'dot-dark',
    light: 'dot-light',
    neon: 'dot-neon',
    sepia: 'dot-sepia',
    abyss: 'dot-abyss'
  }
};

// ─── STATE ───
const STATE = {
  currentSong: null,
  attempt: 0,
  guesses: [],
  isPlaying: false,
  audio: null,
  timerInterval: null,
  gameOver: false,
  currentLang: 'PT',
  currentTheme: localStorage.getItem(CONFIG.THEME_KEY) || 'dark'
};

// ─── UTILS ───
const DOM = {
  get: (id) => document.getElementById(id),
  qs: (sel) => document.querySelector(sel),
  qsa: (sel) => document.querySelectorAll(sel)
};

const i18n = (key) => CONFIG.I18N[STATE.currentLang][key];

// ─── THEME ───
function initThemes() {
  const container = DOM.get('themeOptions');
  container.innerHTML = CONFIG.THEMES.map(t => `
    <button class="theme-option" data-theme="${t}">
      <span class="theme-dot ${CONFIG.THEME_DOTS[t]}"></span> ${t.charAt(0).toUpperCase() + t.slice(1)}
    </button>
  `).join('');

  const activeThemeBtn = DOM.qs(`.theme-option[data-theme="${STATE.currentTheme}"]`);
  if (activeThemeBtn) {
    activeThemeBtn.classList.add('active');
  }

  document.documentElement.setAttribute('data-theme', STATE.currentTheme);

  DOM.qsa('.theme-option').forEach(btn => {
    btn.addEventListener('click', () => setTheme(btn.dataset.theme));
  });
}

function setTheme(theme) {
  STATE.currentTheme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  DOM.qsa('.theme-option').forEach(b => b.classList.remove('active'));

  const activeThemeBtn = DOM.qs(`.theme-option[data-theme="${theme}"]`);
  if (activeThemeBtn) {
    activeThemeBtn.classList.add('active');
  }

  localStorage.setItem(CONFIG.THEME_KEY, theme);
  closeThemeMenu();
}

function openThemeMenu() {
  const btn = DOM.get('themeToggleBtn');
  const opts = DOM.get('themeOptions');
  opts.classList.add('visible');
  btn.classList.add('open');
}

function closeThemeMenu() {
  DOM.get('themeOptions').classList.remove('visible');
  DOM.get('themeToggleBtn').classList.remove('open');
}

// ─── LANGUAGE ───
function initLanguages() {
  const container = DOM.get('langSwitcher');
  container.innerHTML = Object.keys(CONFIG.I18N).map(lang =>
    `<button class="lang-btn" data-lang="${lang}">${lang}</button>`
  ).join('');

  const defaultLangBtn = DOM.qs('.lang-btn[data-lang="PT"]');
  if (defaultLangBtn) {
    defaultLangBtn.classList.add('active');
  }

  DOM.qsa('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
  });
}

function setLanguage(lang) {
  STATE.currentLang = lang;
  DOM.get('statusText').textContent = i18n('status');
  DOM.get('songInput').placeholder = i18n('placeholder');
  DOM.get('skipBtn').textContent = i18n('skip');
  DOM.get('confirmBtn').textContent = i18n('confirm');
  DOM.get('againBtn').textContent = i18n('playAgain');

  DOM.qsa('.lang-btn').forEach(b => b.classList.remove('active'));
  const activeLangBtn = DOM.qs(`.lang-btn[data-lang="${lang}"]`);
  if (activeLangBtn) {
    activeLangBtn.classList.add('active');
  }
}

// ─── WAVEFORM ───
function buildWaveform() {
  DOM.get('waveform').innerHTML = Array(CONFIG.WAVEFORM_BARS)
    .fill(0)
    .map(() => '<div class="wave-bar" style="height:10px;"></div>')
    .join('');
}

// ─── GAME LOGIC ───
function init() {
  if (typeof musicasIU === 'undefined') {
    alert("Erro: database.js não encontrado!");
    return;
  }

  STATE.gameOver = false;
  STATE.attempt = 0;
  STATE.guesses = [];

  if (STATE.audio) {
    try {
      STATE.audio.pause();
    } catch (e) {}
    STATE.audio = null;
  }

  STATE.currentSong = musicasIU[Math.floor(Math.random() * musicasIU.length)];
  STATE.audio = new Audio();
  STATE.audio.preload = "none";
  STATE.audio.src = STATE.currentSong.file;

  renderBars();
  buildWaveform();
  DOM.get('songInput').value = '';
  DOM.get('guessesList').innerHTML = '';
  DOM.get('timerFill').style.width = '0%';
  DOM.get('timerLabel').textContent = '0.0s / 1s';
  setLanguage(STATE.currentLang);
}

function handlePlay() {
  if (!STATE.currentSong || !STATE.audio) return;
  if (STATE.isPlaying) return pauseAudio();

  const maxDur = CONFIG.DURATIONS[STATE.attempt];
  STATE.audio.currentTime = 0;

  STATE.audio.play().catch(() => {
    DOM.get('statusText').textContent = 'Toque novamente ▶';
  });

  STATE.isPlaying = true;
  DOM.get('playBtn').textContent = '⏸';
  DOM.get('waveform').classList.add('playing');

  let elapsed = 0;
  STATE.timerInterval = setInterval(() => {
    elapsed += 0.1;
    DOM.get('timerFill').style.width = Math.min((elapsed / maxDur) * 100, 100) + '%';
    DOM.get('timerLabel').textContent = elapsed.toFixed(1) + 's / ' + maxDur + 's';

    if (elapsed >= maxDur) {
      pauseAudio();
    }
  }, 100);
}

function pauseAudio() {
  if (!STATE.audio) return;

  STATE.audio.pause();
  clearInterval(STATE.timerInterval);
  STATE.isPlaying = false;
  DOM.get('playBtn').textContent = '▶';
  DOM.get('waveform').classList.remove('playing');
}

function selectSong(title) {
  DOM.get('songInput').value = title;
  DOM.get('autocomplete').classList.remove('show');
}

function submitGuess() {
  const val = DOM.get('songInput').value.trim();
  if (!val || STATE.gameOver) return;

  const correct = val.toLowerCase() === STATE.currentSong.title.toLowerCase();
  STATE.guesses.push({ title: val, correct, skipped: false });

  if (correct) {
    renderBars();
    renderGuesses();
    showResult(true);
  } else {
    STATE.attempt++;
    renderBars();
    renderGuesses();

    if (STATE.attempt >= 6) {
      showResult(false);
    } else {
      DOM.get('songInput').value = '';
    }
  }
}

function skip() {
  if (STATE.gameOver) return;

  STATE.guesses.push({ title: 'Pulou', correct: false, skipped: true });
  STATE.attempt++;
  renderBars();
  renderGuesses();

  if (STATE.attempt >= 6) {
    showResult(false);
  }
}

function renderBars() {
  DOM.get('barsContainer').innerHTML = Array(6).fill(0).map((_, i) => {
    let cls = 'bar';

    if (i < STATE.guesses.length) {
      cls += STATE.guesses[i].correct
        ? ' correct'
        : (STATE.guesses[i].skipped ? ' skipped' : ' wrong');
    }

    return `<div class="${cls}"></div>`;
  }).join('');
}

function renderGuesses() {
  DOM.get('guessesList').innerHTML = STATE.guesses.map(g =>
    `<div class="guess-item">${g.title}</div>`
  ).join('');
}

function showResult(won) {
  STATE.gameOver = true;
  pauseAudio();
  recordResult(won, STATE.attempt);

  DOM.get('resultModal').classList.add('show');
  DOM.get('resultTitle').textContent = won ? i18n('wonTitle') : i18n('lostTitle');
  DOM.get('resultSongName').textContent = STATE.currentSong.title;
  DOM.get('resultAlbum').textContent = STATE.currentSong.album;
  DOM.get('againBtn').textContent = i18n('playAgain');

  const albumImg = DOM.get('albumArt');
  const albumFallback = DOM.get('albumFallback');
  albumImg.style.display = 'block';
  albumFallback.style.display = 'none';

  const coverUrl = STATE.currentSong.cover;
  albumImg.src = coverUrl.includes('wikimedia.org')
    ? `https://images.weserv.nl/?url=${encodeURIComponent(coverUrl)}&w=180&h=180&fit=cover`
    : coverUrl;
}

// ─── AUTOCOMPLETE ───
DOM.get('songInput').addEventListener('input', (e) => {
  if (typeof musicasIU === 'undefined') return;

  const q = e.target.value.toLowerCase();
  const ac = DOM.get('autocomplete');

  if (!q) {
    ac.classList.remove('show');
    return;
  }

  const matches = musicasIU
    .filter(s => s.title.toLowerCase().includes(q))
    .slice(0, 5);

  ac.innerHTML = matches.map(m =>
    `<div class="ac-item" data-title="${m.title}">${m.title}</div>`
  ).join('');

  ac.classList.toggle('show', matches.length > 0);

  DOM.qsa('.ac-item').forEach(item => {
    item.addEventListener('click', () => selectSong(item.dataset.title));
  });
});

// ─── STATS ───
function loadStats() {
  try {
    return JSON.parse(localStorage.getItem(CONFIG.STATS_KEY)) || {
      played: 0,
      wins: 0,
      streak: 0,
      bestStreak: 0,
      dist: { 1:0, 2:0, 3:0, 4:0, 5:0, 6:0 }
    };
  } catch {
    return {
      played: 0,
      wins: 0,
      streak: 0,
      bestStreak: 0,
      dist: { 1:0, 2:0, 3:0, 4:0, 5:0, 6:0 }
    };
  }
}

function saveStats(stats) {
  localStorage.setItem(CONFIG.STATS_KEY, JSON.stringify(stats));
}

function recordResult(won, attemptNum) {
  const stats = loadStats();
  stats.played++;

  if (won) {
    stats.wins++;
    stats.streak++;
    stats.bestStreak = Math.max(stats.bestStreak, stats.streak);

    const key = String(attemptNum + 1);
    stats.dist[key] = (stats.dist[key] || 0) + 1;
  } else {
    stats.streak = 0;
  }

  saveStats(stats);
}

function openStats() {
  const stats = loadStats();
  const labels = i18n('statsLabels');

  DOM.get('statsGrid').innerHTML = [stats.played, stats.wins, stats.streak, stats.bestStreak]
    .map((val, i) => `
      <div class="stat-box">
        <span class="stat-number">${val}</span>
        <span class="stat-label">${labels[i]}</span>
      </div>
    `).join('');

  const winPct = stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0;
  DOM.get('statsSubtitle').textContent = `${winPct}% ${i18n('statsWinPct')}`;

  const max = Math.max(...Object.values(stats.dist), 1);
  const distRows = Array(6).fill(0).map((_, i) => {
    const idx = i + 1;
    const val = stats.dist[idx] || 0;
    const pct = Math.round((val / max) * 100);
    const isLast = STATE.gameOver && STATE.guesses.length === idx && STATE.guesses[idx - 1]?.correct;

    return `
      <div class="dist-row">
        <span class="dist-num">${idx}</span>
        <div class="dist-bar-wrap">
          <div class="dist-bar-fill ${isLast ? 'highlight' : ''}" style="width:${Math.max(pct, 4)}%">
            ${val > 0 ? val : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');

  DOM.get('distSection').innerHTML = `
    <p class="dist-title">${i18n('statsDist')}</p>
    ${distRows}
  `;

  DOM.get('statsModal').classList.add('show');
}

// ─── EVENT LISTENERS ───
DOM.get('themeToggleBtn').addEventListener('click', () => {
  DOM.get('themeOptions').classList.contains('visible')
    ? closeThemeMenu()
    : openThemeMenu();
});

document.addEventListener('click', (e) => {
  if (!e.target.closest('.theme-switcher')) {
    closeThemeMenu();
  }
});

DOM.get('playBtn').addEventListener('click', handlePlay);
DOM.get('confirmBtn').addEventListener('click', submitGuess);
DOM.get('skipBtn').addEventListener('click', skip);

DOM.get('statsBtn').addEventListener('click', () => {
  DOM.get('statsTitle').textContent = i18n('statsTitle');
  DOM.get('statsResetBtn').textContent = i18n('statsReset');
  DOM.get('statsCloseBtn').textContent = i18n('statsClose');
  openStats();
});

DOM.get('statsCloseBtn').addEventListener('click', () => {
  DOM.get('statsModal').classList.remove('show');
});

DOM.get('statsResetBtn').addEventListener('click', () => {
  if (confirm('Tem certeza que quer apagar todas as estatísticas?')) {
    localStorage.removeItem(CONFIG.STATS_KEY);
    openStats();
  }
});

DOM.get('againBtn').addEventListener('click', () => {
  DOM.get('resultModal').classList.remove('show');
  init();
});

DOM.get('newBtn').addEventListener('click', () => {
  DOM.get('resultModal').classList.remove('show');
  init();
});

// ─── INIT ───
function tryInit(attempts) {
  if (typeof musicasIU !== 'undefined') {
    initThemes();
    initLanguages();
    init();
  } else if (attempts > 0) {
    setTimeout(() => tryInit(attempts - 1), 200);
  } else {
    alert("Erro: database.js não encontrado!");
  }
}

window.addEventListener('load', () => tryInit(20));
