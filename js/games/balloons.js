/**
 * Bim Bum Balloon - Pop the Balloons Game
 */
const BALLOON_LEVELS = [
  { need: 75, time: 180, speed: 1.0, max: 12, bombs: 0 },
  { need: 110, time: 200, speed: 1.15, max: 13, bombs: 0 },
  { need: 150, time: 220, speed: 1.3, max: 14, bombs: 0.10 },
  { need: 190, time: 240, speed: 1.45, max: 15, bombs: 0.14 },
  { need: 230, time: 260, speed: 1.6, max: 16, bombs: 0.18 },
  { need: 280, time: 280, speed: 1.8, max: 17, bombs: 0.22 }
];

class BalloonGame {
  constructor() {
    this.name = 'Bim Bum Balloon 🎈';
    this.maxLevel = BALLOON_LEVELS.length;
    this.usesSpeed = true;
    this.canvas = null;
    this.ctx = null;
    this.balloons = [];
    this.particles = [];
    this.floatingTexts = [];
    this.running = false;
    this.score = 0;
    this.targetScore = 25;
    this.spawnTimer = 0;
    this.colors = ['#f43f5e', '#ec4899', '#8b5cf6', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b'];
    this.boundTouch = this.handleTouch.bind(this);
    this.boundResize = this.resize.bind(this);
  }

  init(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.resize();
    this.startLevel();
    this.balloons = [];
    this.particles = [];
    this.floatingTexts = [];
    this.running = true;

    window.addEventListener('resize', this.boundResize);
    this.canvas.addEventListener('pointerdown', this.boundTouch);

    for (let i = 0; i < 6; i++) {
      this.spawnBalloon(true);
    }
    this.loop();
  }


  /** Factorul de viteza ales pentru jocul asta. */
  get sp() {
    return window.gameSpeed.factor('balloons');
  }

  startLevel() {
    this.levelIndex = Math.min(window.progress.getLevel('balloons'), BALLOON_LEVELS.length) - 1;
    this.cfg = BALLOON_LEVELS[this.levelIndex];
    this.score = 0;
    this.popped = 0;
    this.bombsHit = 0;
    this.timeLeft = this.cfg.time;
    this.lastTick = performance.now();
    window.hub.updateScore(0);
    setTimeout(() => {
      if (!this.running) return;
      const warn = this.cfg.bombs ? ' Nu atinge bombele!' : '';
      window.voice.say('Sparge ' + this.cfg.need + ' baloane.' + warn);
    }, 1000);
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
  }

  spawnBalloon(randomY = false) {
    const isBomb = Math.random() < this.cfg.bombs;
    const isSpecial = !isBomb && Math.random() < 0.15;
    const radius = Math.random() * 15 + 32;
    const x = Math.random() * (this.canvas.width - radius * 2) + radius;
    const y = randomY ? Math.random() * (this.canvas.height - 100) + 50 : this.canvas.height + radius + 10;
    const speed = (Math.random() * 1.5 + 1.2) * this.cfg.speed;
    const color = isBomb ? '#334155' : isSpecial ? '#fbbf24' : this.colors[Math.floor(Math.random() * this.colors.length)];

    this.balloons.push({
      x,
      y,
      radius,
      speed,
      color,
      isSpecial,
      isBomb,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: Math.random() * 0.04 + 0.02,
      popped: false
    });
  }

  handleTouch(e) {
    if (!this.running) return;
    const rect = this.canvas.getBoundingClientRect();
    const touchX = e.clientX - rect.left;
    const touchY = e.clientY - rect.top;

    for (let i = this.balloons.length - 1; i >= 0; i--) {
      const b = this.balloons[i];
      const dist = Math.hypot(touchX - b.x, touchY - b.y);

      if (dist < b.radius * 1.3 && !b.popped) {
        b.popped = true;
        this.balloons.splice(i, 1);

        if (b.isBomb) {
          this.bombsHit++;
          this.timeLeft = Math.max(0, this.timeLeft - 5);
          window.soundManager.playBuzz();
          window.voice.say('Aceea era o bomba! Ai pierdut cinci secunde.');
          this.createPopParticles(b.x, b.y, '#ef4444', true);
          this.createFloatingText(b.x, b.y, '-5s', '#f87171');
          break;
        }

        const pts = b.isSpecial ? 5 : 1;
        this.score += pts;
        this.popped++;
        window.hub.updateScore(this.score);

        if (b.isSpecial) {
          window.soundManager.playChime();
        } else {
          window.soundManager.playPop(1 + Math.random() * 0.4);
        }
        if (this.popped % 10 === 0) window.voice.praise();

        this.createPopParticles(b.x, b.y, b.color, b.isSpecial);
        this.createFloatingText(b.x, b.y, `+${pts}`, b.isSpecial ? '#fbbf24' : '#ffffff');

        if (this.score >= this.cfg.need) {
          this.running = false;
          const st = this.bombsHit === 0 ? 3 : this.bombsHit <= 2 ? 2 : 1;
          setTimeout(() => window.hub.levelComplete('balloons', {
            stars: st,
            score: this.score,
            title: 'Toate baloanele sparte!',
            message: this.score + ' puncte in nivelul ' + (this.levelIndex + 1) + '.',
            isLastLevel: this.levelIndex + 1 >= BALLOON_LEVELS.length
          }), 600);
        }
        break;
      }
    }
  }

  createPopParticles(x, y, color, isSpecial) {
    const count = isSpecial ? 25 : 14;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const speed = Math.random() * 6 + 2;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: Math.random() * 6 + 3,
        alpha: 1
      });
    }
  }

  createFloatingText(x, y, text, color) {
    this.floatingTexts.push({
      x,
      y,
      text,
      color,
      alpha: 1,
      vy: -2
    });
  }

  loop() {
    if (!this.running) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const grad = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    grad.addColorStop(0, '#1e1b4b');
    grad.addColorStop(1, '#0f172a');
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.spawnTimer++;
    if (this.spawnTimer % Math.max(6, Math.round(40 / this.sp)) === 0 && this.balloons.length < this.cfg.max) {
      this.spawnBalloon();
    }

    const now = performance.now();
    this.timeLeft -= ((now - this.lastTick) / 1000) * this.sp;
    this.lastTick = now;
    if (this.timeLeft <= 0) {
      this.running = false;
      setTimeout(() => window.hub.gameOver('balloons', {
        score: this.score,
        title: 'S-a terminat timpul!',
        message: 'Ai facut ' + this.score + ' din ' + this.cfg.need + ' puncte.'
      }), 200);
      return;
    }

    for (let i = this.balloons.length - 1; i >= 0; i--) {
      const b = this.balloons[i];
      const sp = this.sp;
      b.wobble += b.wobbleSpeed * sp;
      b.x += Math.sin(b.wobble) * 1.2 * sp;
      b.y -= b.speed * sp;

      if (b.y < -b.radius * 2) {
        this.balloons.splice(i, 1);
        continue;
      }

      this.drawBalloon(b);
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.15;
      p.alpha -= 0.03;

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = p.alpha;
      this.ctx.fillStyle = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }

    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy;
      ft.alpha -= 0.025;

      if (ft.alpha <= 0) {
        this.floatingTexts.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = ft.alpha;
      this.ctx.font = 'bold 24px sans-serif';
      this.ctx.fillStyle = ft.color;
      this.ctx.textAlign = 'center';
      this.ctx.fillText(ft.text, ft.x, ft.y);
      this.ctx.restore();
    }

    this.ctx.font = 'bold 18px sans-serif';
    this.ctx.fillStyle = this.timeLeft < 10 ? '#f87171' : '#e2e8f0';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('⏱ ' + Math.max(0, Math.ceil(this.timeLeft)) + 's', this.canvas.width / 2, window.HUD_HEIGHT + 26);

    window.drawLevelHud(this.ctx, this.canvas, {
      level: this.levelIndex + 1,
      maxLevel: BALLOON_LEVELS.length,
      goal: this.score + '/' + this.cfg.need + ' puncte',
      progress: this.score / this.cfg.need
    });

    requestAnimationFrame(() => this.loop());
  }

  drawBalloon(b) {
    this.ctx.save();
    this.ctx.translate(b.x, b.y);

    this.ctx.beginPath();
    this.ctx.moveTo(0, b.radius * 1.15);
    this.ctx.quadraticCurveTo(Math.sin(b.wobble * 2) * 8, b.radius * 1.6, 0, b.radius * 2.2);
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.ellipse(0, 0, b.radius * 0.85, b.radius * 1.1, 0, 0, Math.PI * 2);
    this.ctx.fillStyle = b.color;
    this.ctx.fill();

    this.ctx.beginPath();
    this.ctx.moveTo(-5, b.radius * 1.1);
    this.ctx.lineTo(5, b.radius * 1.1);
    this.ctx.lineTo(0, b.radius * 1.25);
    this.ctx.closePath();
    this.ctx.fillStyle = b.color;
    this.ctx.fill();

    this.ctx.beginPath();
    this.ctx.ellipse(-b.radius * 0.35, -b.radius * 0.4, b.radius * 0.22, b.radius * 0.35, Math.PI / 4, 0, Math.PI * 2);
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    this.ctx.fill();

    if (b.isSpecial || b.isBomb) {
      this.ctx.font = `${b.radius * 0.8}px sans-serif`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(b.isBomb ? '💣' : '⭐', 0, 0);
    }

    this.ctx.restore();
  }

  restart() {
    this.running = true;
    this.startLevel();
    this.balloons = [];
    this.particles = [];
    this.floatingTexts = [];
    for (let i = 0; i < 6; i++) {
      this.spawnBalloon(true);
    }
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

window.hub.registerGame('balloons', new BalloonGame());
