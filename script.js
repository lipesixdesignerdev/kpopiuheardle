// ─── CONFIG & STATE ───
const CONFIG = {
  DURATIONS: [1, 2, 4, 7, 11, 16],
  KEYS: { STATS: 'iu-heardle-stats', THEME: 'iu-heardle-theme' },
  THEMES: ['dark', 'light', 'neon', 'sepia', 'abyss'],
  I18N: {
    PT: { status: "Pronto! Clique ▶", placeholder: "seu palpite aqui…", skip: "⏭ Pular (+1s)", confirm: "✓ Confirmar", won: "🎉 Você acertou!", lost: "😔 Não foi dessa vez!", playAgain: "🔄 Jogar Novamente", stats: "📊 Estatísticas", labels: ["Partidas", "Vitórias", "Sequência", "Melhor"], dist: "Distribuição", reset: "🗑 Resetar", close: "Fechar", pct: "de aproveitamento" },
    EN: { status: "Ready! Click ▶", placeholder: "your guess here…", skip: "⏭ Skip (+1s)", confirm: "✓ Confirm", won: "🎉 You got it!", lost: "😔 Not this time!", playAgain: "🔄 Play Again", stats: "📊 Statistics", labels: ["Played", "Wins", "Streak", "Best"], dist: "Distribution", reset: "🗑 Reset", close: "Close", pct: "win rate" },
    ES: { status: "¡Listo! Clic ▶", placeholder: "tu respuesta aquí…", skip: "⏭ Saltar (+1s)", confirm: "✓ Confirmar", won: "🎉 ¡Lo lograste!", lost: "😔 ¡Otra vez será!", playAgain: "🔄 Jugar de Nuevo", stats: "📊 Estadísticas", labels: ["Partidas", "Victorias", "Racha", "Mejor"], dist: "Distribución", reset: "🗑 Reiniciar", close: "Cerrar", pct: "de rendimiento" }
  }
};

const STATE = { song: null, attempt: 0, guesses: [], isPlaying: false, audio: new Audio(), timer: null, over: false, lang: 'PT', theme: localStorage.getItem(CONFIG.KEYS.THEME) || 'dark' };
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

function setTheme(t) {
  STATE.theme = t; document.documentElement.setAttribute('data-theme', t);
  localStorage.setItem(CONFIG.KEYS.THEME, t);
  DOM.qsa('.theme-option').forEach(b => b.classList.toggle('active', b.dataset.theme === t));
  DOM.get('themeOptions').classList.remove('visible');
}

function setLanguage(l) {
  STATE.lang = l;
  const txt = CONFIG.I18N[l];
  DOM.get('statusText').textContent = txt.status; DOM.get('songInput').placeholder = txt.placeholder;
  DOM.get('skipBtn').textContent = txt.skip; DOM.get('confirmBtn').textContent = txt.confirm;
  DOM.get('againBtn').textContent = txt.playAgain;
  DOM.qsa('.lang-btn').forEach(b => b.classList.toggle('active', b.dataset.val === l));
}

// ─── GAME CORE ───
function init() {
  if (typeof musicasIU === 'undefined') return alert("Erro: database.js não encontrado!");
  STATE.over = false; STATE.attempt = 0; STATE.guesses = [];
  if (STATE.isPlaying) pauseAudio();
  
  STATE.song = musicasIU[Math.floor(Math.random() * musicasIU.length)];
  STATE.audio.src = STATE.song.file;
  
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
  if (!correct) STATE.attempt++;
  
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

  // Reset album art visibility between games
  const albumArt = DOM.get('albumArt');
  const albumFallback = DOM.get('albumFallback');
  albumArt.style.display = '';
  albumFallback.style.display = 'none';
  albumArt.src = '';

  // Fetch artwork dynamically in browser (bypasses CDN hotlink block on Vercel)
  // Multi-strategy search to maximize hit rate
  async function fetchArtwork() {
    const cleanTitle = STATE.song.title.replace(/\([^)]+\)/g, '').trim();
    const strategies = [
      `IU ${cleanTitle}`,
      `IU ${STATE.song.title}`,
      `IU ${STATE.song.album}`,
    ];
    for (const term of strategies) {
      try {
        const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=song&country=kr&limit=5`);
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          // Prefer results where artist name contains IU
          const match = data.results.find(r => r.artistName && r.artistName.includes('IU')) || data.results[0];
          if (match && match.artworkUrl100) {
            return match.artworkUrl100.replace('100x100bb', '600x600bb');
          }
        }
      } catch(e) { /* try next strategy */ }
    }
    return STATE.song.cover || 'iuHeart-2x.gif';
  }
  albumArt.src = await fetchArtwork();
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
DOM.get('againBtn').onclick = DOM.get('newBtn').onclick = () => { DOM.get('resultModal').classList.remove('show'); init(); };

window.onload = () => { initUI(); init(); };
