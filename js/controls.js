/* MAP
 * §1 touch feedback L1-L25
 * §2 swipe helper L27-L60
 */

// §1 touch feedback
window.playroomControls = {
  touchFeedback(canvas) {
    if (!canvas || canvas.dataset.touchFeedback) return;
    canvas.dataset.touchFeedback = 'yes';
    canvas.addEventListener('pointerdown', (event) => {
      const dot = document.createElement('i');
      dot.className = 'touch-dot';
      dot.style.left = `${event.clientX}px`;
      dot.style.top = `${event.clientY}px`;
      document.body.appendChild(dot);
      dot.addEventListener('animationend', () => dot.remove());
    }, { passive: true });
  },

  // §2 swipe helper
  bindSwipe(element, callback, minimum = 28) {
    let start = null;
    element.addEventListener('pointerdown', (event) => { start = { x: event.clientX, y: event.clientY }; }, { passive: true });
    element.addEventListener('pointerup', (event) => {
      if (!start) return;
      const dx = event.clientX - start.x;
      const dy = event.clientY - start.y;
      start = null;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < minimum) return;
      callback(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
    }, { passive: true });
  }
};

window.addEventListener('DOMContentLoaded', () => {
  window.PLAYROOM_ASSETS = [...document.scripts]
    .map((script) => new URL(script.src, location.origin).pathname)
    .filter(Boolean)
    .concat(['index.html', 'css/style.css', 'manifest.webmanifest', 'assets/icon-192.png', 'assets/icon-512.png'].map((asset) => new URL(asset, document.baseURI).pathname));
});
