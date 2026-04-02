/* ── DEVTOOLS PROTECTION ── */
(function () {
  'use strict';

  // ── Bloquear atalhos de teclado ──
  document.addEventListener('keydown', function(e) {
    // F12
    if (e.key === 'F12' || e.keyCode === 123) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
    // Ctrl+Shift+I / J / C / K (inspect, console, elements, network)
    if (e.ctrlKey && e.shiftKey && ['I','i','J','j','C','c','K','k'].includes(e.key)) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
    // Ctrl+U (ver código-fonte)
    if (e.ctrlKey && ['U','u'].includes(e.key)) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }, true);

  // ── Bloquear menu de contexto (clique direito) ──
  document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    return false;
  });

})();
