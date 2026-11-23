/**
 * Crazy Mole - 8 niveluri. Cresc vizuinile, scade timpul de reactie,
 * iar de la nivelul 4 apar si bombe pe care NU trebuie sa le atingi.
 */
const MOLE_LEVELS = [
  { need: 40, cols: 3, rows: 2, gap: 40, life: 70, bombs: 0, time: 180 },
  { need: 60, cols: 3, rows: 2, gap: 34, life: 60, bombs: 0, time: 200 },
  { need: 75, cols: 3, rows: 3, gap: 30, life: 52, bombs: 0, time: 220 },
  { need: 90, cols: 3, rows: 3, gap: 26, life: 46, bombs: 0.2, time: 240 },
  { need: 110, cols: 4, rows: 3, gap: 22, life: 42, bombs: 0.25, time: 260 },
  { need: 130, cols: 4, rows: 3, gap: 20, life: 38, bombs: 0.3, time: 270 },
  { need: 150, cols: 4, rows: 4, gap: 18, life: 34, bombs: 0.3, time: 280 },
  { need: 180, cols: 4, rows: 4, gap: 15, life: 30, bombs: 0.35, time: 300 }
];

class MoleGame {
  constructor() {
    this.name = 'Crazy Mole 🦔';
    this.maxLevel = MOLE_LEVELS.length;
    this.usesSpeed = true;
    this.running = false;
    this.boundTouch = this.onTouch.bind(this);
    this.boundResize = this.resize.bind(this);
  }

  init(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.running = true;
    this.startLevel();
    window.addEventListener('resize', this.boundResize);
    this.canvas.addEventListener('pointerdown', this.boundTouch);
    this.loop();
  }


  /** Factorul de viteza ales pentru jocul asta. */
  get sp() {
    return window.gameSpeed.factor('mole');
  }

  resize() {
    if (!this.canvas || !this.cfg) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;

    const top = window.HUD_HEIGHT + 50;
    const availH = this.canvas.height - top - 20;
    const cols = this.cfg.cols;
    const rows = this.cfg.rows;
    const stepX = this.canvas.width / (cols + 1);
    const stepY = availH / rows;

    this.holes = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        this.holes.push({
          x: (c + 1) * stepX,
          y: top + stepY * (r + 0.6),
          rx: Math.min(46, stepX * 0.36),
          ry: Math.min(24, stepY * 0.18)
        });
      }
    }
  }

  startLevel() {
    this.levelIndex = Math.min(window.progress.getLevel('mole'), MOLE_LEVELS.length) - 1;
    this.cfg = MOLE_LEVELS[this.levelIndex];
    this.resize();
    this.score = 0;
    this.missedBombs = 0;
    this.active = null;
    this.timer = 0;
    this.timeLeft = this.cfg.time;
    this.lastTick = performance.now();
    window.hub.updateScore(0);
    setTimeout(() => {
      if (!this.running) return;
      const bombWarn = this.cfg.bombs ? ' Ai grija, bombele nu se ating!' : '';
      window.voice.say(`Prinde ${this.cfg.need} animalute.${bombWarn}`);
    }, 1000);
  }

  onTouch(e) {
    if (!this.running || !this.active) return;
    const rect = this.canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const h = this.holes[this.active.hole];
    if (Math.hypot(px - h.x, py - (h.y - 22)) > 55) return;

    if (this.active.bomb) {
      this.missedBombs++;
      this.timeLeft = Math.max(0, this.timeLeft - 5);
      window.soundManager.playBuzz();
      window.voice.say('Buum! Aceea era o bomba.');
    } else {
      this.score++;
      window.hub.updateScore(this.score);
      window.soundManager.playBoing();
      window.confettiManager.start(500);
      if (this.score % 5 === 0) window.voice.praise();

      if (this.score >= this.cfg.need) {
        this.running = false;
        const stars = this.missedBombs === 0 ? 3 : this.missedBombs <= 2 ? 2 : 1;
        setTimeout(() => window.hub.levelComplete('mole', {
          stars,
          score: this.score,
          title: `Reflexe de campion!`,
          message: `${this.score} animalute prinse in nivelul ${this.levelIndex + 1}.`,
          isLastLevel: this.levelIndex + 1 >= MOLE_LEVELS.length
        }), 600);
      }
    }
    this.active = null;
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    const bg = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    bg.addColorStop(0, '#065f46');
    bg.addColorStop(1, '#022c22');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const sp = this.sp;
    const gap = Math.max(6, Math.round(this.cfg.gap / sp));
    const life = Math.round(this.cfg.life / sp);
    this.timer++;
    if (!this.active && this.timer % gap === 0) {
      this.active = {
        hole: Math.floor(Math.random() * this.holes.length),
        bomb: Math.random() < this.cfg.bombs,
        emoji: Math.random() < 0.3 ? '🐰' : '🦔',
        expires: this.timer + life,
        born: this.timer
      };
    } else if (this.active && this.timer > this.active.expires) {
      this.active = null;
    }

    this.holes.forEach((h, idx) => {
      if (this.active && this.active.hole === idx) {
        // Animalul iese si intra la loc: inaltimea urmeaza un arc lin.
        const t = (this.timer - this.active.born) / life;
        const rise = Math.sin(Math.min(1, t) * Math.PI) * 42;
        ctx.save();
        ctx.font = '46px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.active.bomb ? '💣' : this.active.emoji, h.x, h.y - rise);
        ctx.restore();
      }

      ctx.beginPath();
      ctx.ellipse(h.x, h.y, h.rx, h.ry, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#1c1917';
      ctx.fill();
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 6;
      ctx.stroke();
    });

    const now = performance.now();
    this.timeLeft -= ((now - this.lastTick) / 1000) * sp;
    this.lastTick = now;
    if (this.timeLeft <= 0) {
      this.running = false;
      setTimeout(() => window.hub.gameOver('mole', {
        score: this.score,
        title: 'S-a terminat timpul!',
        message: `Ai prins ${this.score} din ${this.cfg.need}. Mai incercam.`
      }), 200);
    }

    ctx.font = 'bold 18px sans-serif';
    ctx.fillStyle = this.timeLeft < 10 ? '#f87171' : '#e2e8f0';
    ctx.textAlign = 'center';
    ctx.fillText(`⏱ ${Math.max(0, Math.ceil(this.timeLeft))}s`, this.canvas.width / 2, window.HUD_HEIGHT + 26);

    window.drawLevelHud(ctx, this.canvas, {
      level: this.levelIndex + 1,
      maxLevel: MOLE_LEVELS.length,
      goal: `${this.score}/${this.cfg.need} prinse`,
      progress: this.score / this.cfg.need
    });
  }

  loop() {
    if (!this.running) return;
    this.draw();
    requestAnimationFrame(() => this.loop());
  }

  restart() {
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

window.hub.registerGame('mole', new MoleGame());
