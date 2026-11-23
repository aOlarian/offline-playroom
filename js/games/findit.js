/**
 * Gaseste Obiectul - 8 niveluri. Se cere cu voce ce trebuie gasit,
 * iar butonul de difuzor repeta cererea oricand.
 */
const FINDIT_LEVELS = [
  { count: 18, need: 12, time: 0 },
  { count: 24, need: 16, time: 0 },
  { count: 32, need: 20, time: 0 },
  { count: 38, need: 24, time: 160 },
  { count: 44, need: 28, time: 180 },
  { count: 50, need: 32, time: 200 },
  { count: 56, need: 36, time: 220 },
  { count: 64, need: 40, time: 240 }
];

const FINDIT_ITEMS = [
  { emoji: '🦁', name: 'leul' }, { emoji: '🚀', name: 'racheta' },
  { emoji: '⭐', name: 'steaua' }, { emoji: '🦖', name: 'dinozaurul' },
  { emoji: '🏎️', name: 'mașinuța' }, { emoji: '🎈', name: 'balonul' },
  { emoji: '🍦', name: 'înghețata' }, { emoji: '👑', name: 'coroana' },
  { emoji: '⚽', name: 'mingea' }, { emoji: '🎁', name: 'cadoul' },
  { emoji: '🐶', name: 'cățelul' }, { emoji: '🐱', name: 'pisica' },
  { emoji: '🍎', name: 'mărul' }, { emoji: '🌵', name: 'cactusul' },
  { emoji: '🎸', name: 'chitara' }, { emoji: '🦋', name: 'fluturele' }
];

class FindItGame {
  constructor() {
    this.name = 'Găsește Obiectul 🔍';
    this.maxLevel = FINDIT_LEVELS.length;
    this.running = false;
    this.boundTouch = this.onTouch.bind(this);
    this.boundResize = this.resize.bind(this);
  }

  init(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.resize();
    this.running = true;
    this.startLevel();
    window.addEventListener('resize', this.boundResize);
    this.canvas.addEventListener('pointerdown', this.boundTouch);
    this.loop();
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
  }

  startLevel() {
    this.levelIndex = Math.min(window.progress.getLevel('findit'), FINDIT_LEVELS.length) - 1;
    this.cfg = FINDIT_LEVELS[this.levelIndex];
    this.found = 0;
    this.mistakes = 0;
    this.timeLeft = this.cfg.time;
    this.lastTick = performance.now();
    window.hub.updateScore(0);
    this.generateScene(1100);
  }

  generateScene(delay = 0) {
    const top = window.HUD_HEIGHT + 46;
    this.objects = [];
    for (let i = 0; i < this.cfg.count; i++) {
      const item = FINDIT_ITEMS[i % FINDIT_ITEMS.length];
      const size = Math.random() * 14 + 30;
      this.objects.push({
        ...item,
        size,
        x: Math.random() * (this.canvas.width - size * 2) + size,
        y: Math.random() * (this.canvas.height - top - size * 2) + top + size,
        wob: Math.random() * Math.PI * 2
      });
    }
    const picked = this.objects[Math.floor(Math.random() * this.objects.length)];
    this.target = { emoji: picked.emoji, name: picked.name };
    this.spoken = `Găsește ${this.target.name}. Atinge-${/^[aeiou]/.test(this.target.name) ? 'o' : 'l'} cu degetul.`;
    setTimeout(() => { if (this.running) window.voice.say(this.spoken); }, delay);
  }

  onTouch(e) {
    if (!this.running) return;
    const rect = this.canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    if (window.hitSpeaker(this.speaker, px, py)) {
      window.voice.say(this.spoken);
      return;
    }

    for (let i = this.objects.length - 1; i >= 0; i--) {
      const o = this.objects[i];
      if (Math.hypot(px - o.x, py - o.y) < o.size * 0.85) {
        if (o.emoji === this.target.emoji) {
          this.found++;
          window.hub.updateScore(this.found);
          window.soundManager.playChime();
          window.confettiManager.start(800);
          window.voice.praise();

          if (this.found >= this.cfg.need) {
            this.running = false;
            const stars = this.mistakes === 0 ? 3 : this.mistakes <= 3 ? 2 : 1;
            setTimeout(() => window.hub.levelComplete('findit', {
              stars,
              score: this.found,
              title: `Ochi de vultur! Nivelul ${this.levelIndex + 1}`,
              message: `Ai găsit ${this.found} obiecte, cu ${this.mistakes} greșeli.`,
              isLastLevel: this.levelIndex + 1 >= FINDIT_LEVELS.length
            }), 800);
            return;
          }
          setTimeout(() => this.generateScene(200), 500);
        } else {
          this.mistakes++;
          o.shake = 16;
          window.soundManager.playBuzz();
          window.voice.say(`Acesta e ${o.name}. Caută ${this.target.name}.`);
        }
        return;
      }
    }
  }

  draw() {
    const ctx = this.ctx;
    const W = this.canvas.width;
    const H = this.canvas.height;
    ctx.clearRect(0, 0, W, H);
    const bg = ctx.createRadialGradient(W / 2, H / 2, 20, W / 2, H / 2, Math.max(W, H) * 0.7);
    bg.addColorStop(0, '#312e81');
    bg.addColorStop(1, '#0f172a');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    const top = window.HUD_HEIGHT;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(0, top, W, 46);
    ctx.font = 'bold 22px sans-serif';
    ctx.fillStyle = '#fde047';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`Găsește: ${this.target.emoji} ${this.target.name}`, W / 2, top + 23);

    for (const o of this.objects) {
      o.wob += 0.03;
      ctx.save();
      ctx.translate(o.x, o.y + Math.sin(o.wob) * 2);
      if (o.shake) {
        ctx.rotate(Math.sin(o.shake) * 0.3);
        o.shake--;
      }
      ctx.font = `${o.size}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(o.emoji, 0, 0);
      ctx.restore();
    }

    if (this.cfg.time) {
      const now = performance.now();
      this.timeLeft -= (now - this.lastTick) / 1000;
      this.lastTick = now;
      if (this.timeLeft <= 0) {
        this.running = false;
        setTimeout(() => window.hub.gameOver('findit', {
          score: this.found,
          title: 'S-a terminat timpul!',
          message: 'Mai incercam o data, cu ochii mari.'
        }), 300);
      }
      ctx.font = 'bold 18px sans-serif';
      ctx.fillStyle = this.timeLeft < 10 ? '#f87171' : '#e2e8f0';
      ctx.textAlign = 'left';
      ctx.fillText(`⏱ ${Math.max(0, Math.ceil(this.timeLeft))}s`, 14, top + 68);
    }

    this.speaker = window.drawSpeakerButton(ctx, this.canvas);

    window.drawLevelHud(ctx, this.canvas, {
      level: this.levelIndex + 1,
      maxLevel: FINDIT_LEVELS.length,
      goal: `${this.found}/${this.cfg.need} găsite`,
      progress: this.found / this.cfg.need
    });
  }

  loop() {
    if (!this.running) return;
    this.draw();
    requestAnimationFrame(() => this.loop());
  }

  restart() {
    this.resize();
    this.running = true;
    this.startLevel();
    this.loop();
  }

  stop() {
    this.running = false;
    if (this.canvas) this.canvas.removeEventListener('pointerdown', this.boundTouch);
    window.removeEventListener('resize', this.boundResize);
  }
}

window.hub.registerGame('findit', new FindItGame());
