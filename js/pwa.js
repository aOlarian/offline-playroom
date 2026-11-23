/**
 * PWA Service Worker Registration, Wake Lock, Offline Detection & Confetti
 */

class PWAManager {
  constructor() {
    this.deferredPrompt = null;
    this.wakeLock = null;
    this.init();
  }

  init() {
    this.registerServiceWorker();
    this.setupInstallPrompt();
    this.setupNetworkStatus();
    this.setupWakeLock();
  }

  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
          .then((reg) => {
            console.log('ServiceWorker registered with scope:', reg.scope);
          })
          .catch((err) => {
            console.warn('ServiceWorker registration failed:', err);
          });
      });
    }
  }

  setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      const banner = document.getElementById('pwa-install-banner');
      if (banner) banner.classList.add('active');
    });

    const installBtn = document.getElementById('pwa-install-action');
    if (installBtn) {
      installBtn.addEventListener('click', async () => {
        if (this.deferredPrompt) {
          this.deferredPrompt.prompt();
          const { outcome } = await this.deferredPrompt.userChoice;
          console.log('Install outcome:', outcome);
          this.deferredPrompt = null;
          const banner = document.getElementById('pwa-install-banner');
          if (banner) banner.classList.remove('active');
        }
      });
    }
  }

  setupNetworkStatus() {
    const updateOnlineStatus = () => {
      const isOnline = navigator.onLine;
      const statusPill = document.getElementById('network-status');
      if (statusPill) {
        if (!isOnline) {
          statusPill.innerHTML = '✈️ Mod Avion (Offline 100%)';
          statusPill.style.background = 'rgba(236, 72, 153, 0.2)';
          statusPill.style.borderColor = 'rgba(236, 72, 153, 0.5)';
          statusPill.style.color = '#f472b6';
        } else {
          statusPill.innerHTML = '🟢 Gata de Joc (Offline Ready)';
          statusPill.style.background = 'rgba(16, 185, 129, 0.2)';
          statusPill.style.borderColor = 'rgba(16, 185, 129, 0.4)';
          statusPill.style.color = '#34d399';
        }
      }
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    updateOnlineStatus();
  }

  async downloadForAirplane() {
    window.soundManager.ensureContext();
    window.soundManager.playClick();
    const button = document.getElementById('download-all-btn');
    if (!navigator.serviceWorker || !navigator.serviceWorker.controller) {
      window.voice.say('Pregătesc jocurile. Mai apasă o dată peste câteva secunde.');
      if (button) button.textContent = '⏳';
      return;
    }
    const files = window.PLAYROOM_ASSETS || [];
    if (!files.length) return;
    if (button) { button.disabled = true; button.textContent = '⏳'; }
    window.voice.say('Pregătesc toate jocurile pentru avion.');
    try {
      const cache = await caches.open(`offline-playroom:${(await navigator.serviceWorker.ready).scope}:airplane`);
      let done = 0;
      for (const path of files) {
        try { await cache.add(new Request(path, { cache: 'reload' })); } catch (_) { /* SW keeps the previous offline copy. */ }
        done++;
        if (button) button.textContent = `${Math.round(done * 100 / files.length)}%`;
      }
      if (navigator.storage && navigator.storage.persist) await navigator.storage.persist();
      localStorage.setItem('offline_playroom_airplane_ready', new Date().toISOString());
      if (button) button.textContent = '✅';
      window.soundManager.playFanfare();
      window.voice.say('Gata. Poți juca fără internet.');
    } finally {
      setTimeout(() => { if (button) { button.disabled = false; button.textContent = '✈️'; } }, 1800);
    }
  }

  async setupWakeLock() {
    if ('wakeLock' in navigator) {
      try {
        this.wakeLock = await navigator.wakeLock.request('screen');
        document.addEventListener('visibilitychange', async () => {
          if (this.wakeLock !== null && document.visibilityState === 'visible') {
            this.wakeLock = await navigator.wakeLock.request('screen');
          }
        });
      } catch (err) {
        console.warn('Wake Lock error:', err);
      }
    }
  }
}

// Confetti celebration helper
class ConfettiManager {
  constructor() {
    this.canvas = document.getElementById('confetti-canvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.particles = [];
    this.animating = false;
    if (this.canvas) {
      this.resize();
      window.addEventListener('resize', () => this.resize());
    }
  }

  resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  start(duration = 2500) {
    if (!this.canvas) return;
    this.resize();
    const colors = ['#f43f5e', '#ec4899', '#8b5cf6', '#3b82f6', '#10b981', '#facc15', '#f97316'];
    for (let i = 0; i < 100; i++) {
      this.particles.push({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        vx: (Math.random() - 0.5) * 18,
        vy: (Math.random() - 0.7) * 20,
        size: Math.random() * 8 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 12,
        alpha: 1
      });
    }

    if (!this.animating) {
      this.animating = true;
      this.loop();
    }

    setTimeout(() => {
      // Fade out
    }, duration);
  }

  loop() {
    if (!this.animating || !this.ctx) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.4; // gravity
      p.vx *= 0.98;
      p.rotation += p.rotSpeed;
      p.alpha -= 0.008;

      if (p.alpha <= 0 || p.y > this.canvas.height + 50) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = Math.max(0, p.alpha);
      this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      this.ctx.restore();
    }

    if (this.particles.length > 0) {
      requestAnimationFrame(() => this.loop());
    } else {
      this.animating = false;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
}

window.pwaManager = new PWAManager();
window.confettiManager = new ConfettiManager();
