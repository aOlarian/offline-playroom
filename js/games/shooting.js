/**
 * Shooting Gallery - Carnival Ducks & Targets
 */
const SHOOT_LEVELS = [
  { need: 600, gap: 35, speed: 1.0, time: 180 },
  { need: 1000, gap: 32, speed: 1.15, time: 200 },
  { need: 1500, gap: 28, speed: 1.3, time: 220 },
  { need: 2100, gap: 24, speed: 1.5, time: 240 },
  { need: 2800, gap: 21, speed: 1.7, time: 260 },
  { need: 3600, gap: 18, speed: 1.9, time: 280 }
];

class ShootingGame {
  constructor() {
    this.name = 'Shooting Gallery 🎯';
    this.maxLevel = SHOOT_LEVELS.length;
    this.usesSpeed = true;
    this.canvas = null;
    this.ctx = null;
    this.running = false;
    this.targets = [];
    this.particles = [];
    this.score = 0;
    this.targetScore = 150;
    this.spawnTimer = 0;
    this.boundTouch = this.handleTouch.bind(this);
    this.boundResize = this.resize.bind(this);
  }

  init(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.resize();
    this.startLevel();
    this.targets = [];
    this.particles = [];
    this.running = true;

    window.addEventListener('resize', this.boundResize);
    this.canvas.addEventListener('pointerdown', this.boundTouch);

    this.loop();
  }


  /** Factorul de viteza ales pentru jocul asta. */
  get sp() {
    return window.gameSpeed.factor('shooting');
  }

  startLevel() {
    this.levelIndex = Math.min(window.progress.getLevel('shooting'), SHOOT_LEVELS.length) - 1;
    this.cfg = SHOOT_LEVELS[this.levelIndex];
    this.score = 0;
    this.hits = 0;
    this.shots = 0;
    this.timeLeft = this.cfg.time;
    this.lastTick = performance.now();
    window.hub.updateScore(0);
    setTimeout(() => {
      if (!this.running) return;
      window.voice.say('Ocheste tintele. Ai nevoie de ' + this.cfg.need + ' de puncte.');
    }, 1000);
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
  }

  spawnTarget() {
    const rowY = [this.canvas.height * 0.3, this.canvas.height * 0.55, this.canvas.height * 0.78];
    const y = rowY[Math.floor(Math.random() * rowY.length)];
    const direction = Math.random() < 0.5 ? 1 : -1;
    const speed = (Math.random() * 2 + 1.8) * direction * this.cfg.speed;
    const x = direction === 1 ? -40 : this.canvas.width + 40;

    const types = [
      { emoji: '🦆', pts: 10, size: 36 },
      { emoji: '🎯', pts: 20, size: 34 },
      { emoji: '🛸', pts: 30, size: 38 },
      { emoji: '⭐', pts: 50, size: 32 }
    ];
    const type = types[Math.floor(Math.random() * types.length)];

    this.targets.push({
      x, y, speed,
      emoji: type.emoji,
      pts: type.pts,
      radius: type.size,
      hit: false
    });
  }

  handleTouch(e) {
    if (!this.running) return;
    const rect = this.canvas.getBoundingClientRect();
    const touchX = e.clientX - rect.left;
    const touchY = e.clientY - rect.top;

    window.soundManager.playLaser();
    this.shots++;

    for (let i = this.targets.length - 1; i >= 0; i--) {
      const t = this.targets[i];
      const dist = Math.hypot(touchX - t.x, touchY - t.y);

      if (dist < t.radius * 1.3 && !t.hit) {
        t.hit = true;
        this.hits++;
        this.score += t.pts;
        window.hub.updateScore(this.score);
        window.soundManager.playChime();
        if (this.hits % 8 === 0) window.voice.praise();

        // Particles
        for (let p = 0; p < 12; p++) {
          this.particles.push({
            x: t.x,
            y: t.y,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            color: '#facc15',
            alpha: 1
          });
        }

        this.targets.splice(i, 1);

        if (this.score >= this.cfg.need) {
          this.running = false;
          const acc = this.shots ? this.hits / this.shots : 0;
          const st = acc > 0.7 ? 3 : acc > 0.45 ? 2 : 1;
          setTimeout(() => window.hub.levelComplete('shooting', {
            stars: st,
            score: this.score,
            title: 'Tintas de elita!',
            message: this.score + ' puncte, din ' + this.shots + ' focuri.',
            isLastLevel: this.levelIndex + 1 >= SHOOT_LEVELS.length
          }), 600);
        }
        break;
      }
    }
  }

  loop() {
    if (!this.running) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Carnival Background Shelves
    this.ctx.fillStyle = '#1e1b4b';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const rowY = [this.canvas.height * 0.3, this.canvas.height * 0.55, this.canvas.height * 0.78];
    rowY.forEach(y => {
      this.ctx.fillStyle = '#475569';
      this.ctx.fillRect(0, y + 25, this.canvas.width, 10);
      this.ctx.fillStyle = '#334155';
      this.ctx.fillRect(0, y + 35, this.canvas.width, 4);
    });

    // Spawning
    this.spawnTimer++;
    if (this.spawnTimer % Math.max(6, Math.round(this.cfg.gap / this.sp)) === 0 && this.targets.length < 9) {
      this.spawnTarget();
    }

    // Update & draw targets
    for (let i = this.targets.length - 1; i >= 0; i--) {
      const t = this.targets[i];
      t.x += t.speed * this.sp;

      if ((t.speed > 0 && t.x > this.canvas.width + 60) || (t.speed < 0 && t.x < -60)) {
        this.targets.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.font = `${t.radius * 1.4}px sans-serif`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(t.emoji, t.x, t.y);
      this.ctx.restore();
    }

    // Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 0.04;

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = p.alpha;
      this.ctx.fillStyle = p.color;
      this.ctx.fillRect(p.x, p.y, 6, 6);
      this.ctx.restore();
    }

    const now = performance.now();
    this.timeLeft -= ((now - this.lastTick) / 1000) * this.sp;
    this.lastTick = now;
    if (this.timeLeft <= 0) {
      this.running = false;
      setTimeout(() => window.hub.gameOver('shooting', {
        score: this.score,
        title: 'S-a terminat timpul!',
        message: 'Ai facut ' + this.score + ' din ' + this.cfg.need + ' puncte.'
      }), 200);
      return;
    }

    this.ctx.font = 'bold 18px sans-serif';
    this.ctx.fillStyle = this.timeLeft < 10 ? '#f87171' : '#e2e8f0';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('⏱ ' + Math.max(0, Math.ceil(this.timeLeft)) + 's', this.canvas.width / 2, window.HUD_HEIGHT + 26);

    window.drawLevelHud(this.ctx, this.canvas, {
      level: this.levelIndex + 1,
      maxLevel: SHOOT_LEVELS.length,
      goal: this.score + '/' + this.cfg.need + ' puncte',
      progress: this.score / this.cfg.need
    });

    requestAnimationFrame(() => this.loop());
  }

  restart() {
    this.running = true;
    this.startLevel();
    this.targets = [];
    this.particles = [];
    this.loop();
  }

  stop() {
    this.running = false;
    if (this.canvas) {
      this.canvas.removeEventListener('pointerdown', this.boundTouch);
    }
    window.removeEventListener('resize', this.boundResize);
  }
}

window.hub.registerGame('shooting', new ShootingGame());
