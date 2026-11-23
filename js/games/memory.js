/**
 * Perechi (Memory) - intorci doua cartonase si cauti perechea.
 * Fiecare cartonas intors se si spune cu voce tare, ca jucătorul sa invete cuvintele.
 */
const MEMORY_LEVELS = [
  { pairs: 3, cols: 3 },
  { pairs: 4, cols: 4 },
  { pairs: 6, cols: 4 },
  { pairs: 8, cols: 4 },
  { pairs: 10, cols: 5 },
  { pairs: 12, cols: 6 }
];

const MEMORY_CARDS = [
  { emoji: '🦁', name: 'leu' }, { emoji: '🐘', name: 'elefant' },
  { emoji: '🦒', name: 'girafă' }, { emoji: '🐸', name: 'broscuță' },
  { emoji: '🐝', name: 'albină' }, { emoji: '🦋', name: 'fluture' },
  { emoji: '🐧', name: 'pinguin' }, { emoji: '🦉', name: 'bufniță' },
  { emoji: '🐢', name: 'țestoasă' }, { emoji: '🦖', name: 'dinozaur' },
  { emoji: '🐬', name: 'delfin' }, { emoji: '🦄', name: 'unicorn' }
];

class MemoryGame {
  constructor() {
    this.name = 'Perechi 🃏';
    this.maxLevel = MEMORY_LEVELS.length;
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
    if (this.cards) this.layout();
  }

  startLevel() {
    this.levelIndex = Math.min(window.progress.getLevel('memory'), MEMORY_LEVELS.length) - 1;
    this.cfg = MEMORY_LEVELS[this.levelIndex];

    const chosen = MEMORY_CARDS.slice().sort(() => Math.random() - 0.5).slice(0, this.cfg.pairs);
    this.cards = chosen
      .flatMap((c) => [{ ...c }, { ...c }])
      .sort(() => Math.random() - 0.5)
      .map((c) => ({ ...c, up: false, done: false, flip: 0 }));

    this.first = null;
    this.busy = false;
    this.pairsFound = 0;
    this.tries = 0;
    this.layout();
    window.hub.updateScore(0);
    setTimeout(() => {
      if (this.running) window.voice.say(`Gaseste cele ${this.cfg.pairs} perechi. Intoarce doua cartonase la fel.`);
    }, 1000);
  }

  layout() {
    const top = window.HUD_HEIGHT + 8;
    const cols = Math.min(this.cfg.cols, this.cards.length);
    const rows = Math.ceil(this.cards.length / cols);
    const availW = this.canvas.width - 20;
    const availH = this.canvas.height - top - 20;
    const size = Math.min(availW / cols, availH / rows) - 8;
    const gridW = cols * (size + 8) - 8;
    const gridH = rows * (size + 8) - 8;
    const x0 = (this.canvas.width - gridW) / 2;
    const y0 = top + (availH - gridH) / 2;

    this.cards.forEach((c, i) => {
      c.x = x0 + (i % cols) * (size + 8);
      c.y = y0 + Math.floor(i / cols) * (size + 8);
      c.w = size;
      c.h = size;
    });
  }

  onTouch(e) {
    if (!this.running || this.busy) return;
    const rect = this.canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    for (const c of this.cards) {
      if (c.done || c.up) continue;
      if (px >= c.x && px <= c.x + c.w && py >= c.y && py <= c.y + c.h) {
        c.up = true;
        c.flip = 12;
        window.soundManager.playPop(1.3);
        window.voice.say(c.name);

        if (!this.first) {
          this.first = c;
        } else {
          this.tries++;
          this.busy = true;
          if (this.first.emoji === c.emoji) {
            setTimeout(() => {
              this.first.done = true;
              c.done = true;
              this.first = null;
              this.busy = false;
              this.pairsFound++;
              window.hub.updateScore(this.pairsFound);
              window.soundManager.playChime();
              window.confettiManager.start(700);
              window.voice.say(`Pereche! Doi ${c.name}.`);
              if (this.pairsFound === this.cfg.pairs) this.finish();
            }, 620);
          } else {
            setTimeout(() => {
              this.first.up = false;
              c.up = false;
              this.first = null;
              this.busy = false;
              window.soundManager.playBuzz();
            }, 950);
          }
        }
        return;
      }
    }
  }

  finish() {
    this.running = false;
    // Fara nicio greseala ar insemna exact atatea incercari cate perechi sunt.
    const stars = this.tries <= this.cfg.pairs * 1.5 ? 3 : this.tries <= this.cfg.pairs * 2.5 ? 2 : 1;
    setTimeout(() => window.hub.levelComplete('memory', {
      stars,
      score: this.pairsFound,
      title: 'Toate perechile gasite!',
      message: `${this.cfg.pairs} perechi din ${this.tries} incercari.`,
      isLastLevel: this.levelIndex + 1 >= MEMORY_LEVELS.length
    }), 700);
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    const bg = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    bg.addColorStop(0, '#1e1b4b');
    bg.addColorStop(1, '#0f172a');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    for (const c of this.cards) {
      const showFace = c.up || c.done;
      // Cartonasul se ingusteaza si se largeste la loc: pare ca se intoarce.
      const squeeze = c.flip ? Math.abs(Math.cos((c.flip / 12) * Math.PI)) : 1;
      if (c.flip) c.flip--;

      ctx.save();
      ctx.translate(c.x + c.w / 2, c.y + c.h / 2);
      ctx.scale(Math.max(0.08, squeeze), 1);

      ctx.fillStyle = c.done ? 'rgba(16, 185, 129, 0.35)' : showFace ? '#ede9fe' : '#4f46e5';
      ctx.strokeStyle = c.done ? '#34d399' : '#facc15';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(-c.w / 2, -c.h / 2, c.w, c.h, 14);
      ctx.fill();
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if (showFace) {
        ctx.font = `${c.w * 0.55}px sans-serif`;
        ctx.fillText(c.emoji, 0, -c.h * 0.06);
        ctx.font = `bold ${Math.max(11, c.w * 0.14)}px sans-serif`;
        ctx.fillStyle = '#4c1d95';
        ctx.fillText(c.name, 0, c.h * 0.32);
      } else {
        ctx.font = `${c.w * 0.4}px sans-serif`;
        ctx.fillText('❓', 0, 0);
      }
      ctx.restore();
    }

    window.drawLevelHud(ctx, this.canvas, {
      level: this.levelIndex + 1,
      maxLevel: MEMORY_LEVELS.length,
      goal: `${this.pairsFound}/${this.cfg.pairs} perechi`,
      progress: this.pairsFound / this.cfg.pairs
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

window.hub.registerGame('memory', new MemoryGame());
