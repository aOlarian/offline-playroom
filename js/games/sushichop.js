/**
 * Sushi & Fruit Chop - Slice objects in mid-air
 */
const SUSHI_LEVELS = [
  { need: 90, gap: 45, bombs: 0, lives: 3 },
  { need: 130, gap: 40, bombs: 0.08, lives: 3 },
  { need: 170, gap: 35, bombs: 0.12, lives: 3 },
  { need: 220, gap: 30, bombs: 0.16, lives: 3 },
  { need: 270, gap: 26, bombs: 0.20, lives: 3 },
  { need: 330, gap: 22, bombs: 0.24, lives: 3 }
];

class SushiChopGame {
  constructor() {
    this.name = 'Sushi & Fruit Chop 🍉';
    this.maxLevel = SUSHI_LEVELS.length;
    this.usesSpeed = true;
    this.canvas = null;
    this.ctx = null;
    this.running = false;
    this.items = [];
    this.trail = [];
    this.particles = [];
    this.score = 0;
    this.targetScore = 30;
    this.spawnTimer = 0;
    this.fruits = ['🍉', '🍊', '🍓', '🍎', '🍌', '🍣', '🍍', '🥝'];
    this.boundDown = this.handlePointerDown.bind(this);
    this.boundMove = this.handlePointerMove.bind(this);
    this.boundUp = this.handlePointerUp.bind(this);
    this.boundResize = this.resize.bind(this);
  }

  init(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.resize();
    this.startLevel();
    this.items = [];
    this.trail = [];
    this.particles = [];
    this.running = true;

    window.addEventListener('resize', this.boundResize);
    this.canvas.addEventListener('pointerdown', this.boundDown);
    this.canvas.addEventListener('pointermove', this.boundMove);
    window.addEventListener('pointerup', this.boundUp);

    this.loop();
  }


  /** Factorul de viteza ales pentru jocul asta. */
  get sp() {
    return window.gameSpeed.factor('sushichop');
  }

  startLevel() {
    this.levelIndex = Math.min(window.progress.getLevel('sushichop'), SUSHI_LEVELS.length) - 1;
    this.cfg = SUSHI_LEVELS[this.levelIndex];
    this.score = 0;
    this.lives = this.cfg.lives;
    window.hub.updateScore(0);
    setTimeout(() => {
      if (!this.running) return;
      const warn = this.cfg.bombs ? ' Nu taia bombele!' : '';
      window.voice.say('Taie ' + this.cfg.need + ' fructe din zbor.' + warn);
    }, 1000);
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
  }

  spawnFruit() {
    const x = Math.random() * (this.canvas.width - 120) + 60;
    const y = this.canvas.height + 40;
    const vx = (this.canvas.width / 2 - x) * 0.015 + (Math.random() - 0.5) * 3;
    const vy = -(Math.random() * 4 + 11);
    const isBomb = Math.random() < this.cfg.bombs;
    const emoji = isBomb ? '💣' : this.fruits[Math.floor(Math.random() * this.fruits.length)];

    this.items.push({
      x, y, vx, vy,
      emoji,
      isBomb,
      radius: 34,
      rotation: 0,
      rotSpeed: (Math.random() - 0.5) * 0.1,
      sliced: false
    });
  }

  handlePointerDown(e) {
    this.addTrailPoint(e);
  }

  handlePointerMove(e) {
    if (!this.running) return;
    this.addTrailPoint(e);
    this.checkSlice();
  }

  handlePointerUp() {
    this.trail = [];
  }

  addTrailPoint(e) {
    const rect = this.canvas.getBoundingClientRect();
    this.trail.push({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      time: Date.now()
    });
    if (this.trail.length > 8) this.trail.shift();
  }

  checkSlice() {
    if (this.trail.length < 2) return;
    const p1 = this.trail[this.trail.length - 2];
    const p2 = this.trail[this.trail.length - 1];

    for (const item of this.items) {
      if (item.sliced) continue;
      const dist = Math.hypot(p2.x - item.x, p2.y - item.y);
      if (dist < item.radius * 1.2) {
        item.sliced = true;

        if (item.isBomb) {
          this.lives--;
          window.soundManager.playBuzz();
          window.voice.say('Bomba! Mai ai ' + this.lives + ' vieti.');
          if (this.lives <= 0) {
            this.running = false;
            setTimeout(() => window.hub.gameOver('sushichop', {
              score: this.score,
              title: 'Prea multe bombe',
              message: 'Taie doar fructele. Reluam nivelul.'
            }), 300);
          }
          continue;
        }

        this.score++;
        window.hub.updateScore(this.score);
        window.soundManager.playSlice();
        if (this.score % 10 === 0) window.voice.praise();

        // Splatter particles
        for (let i = 0; i < 15; i++) {
          this.particles.push({
            x: item.x,
            y: item.y,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            color: '#f43f5e',
            size: Math.random() * 5 + 3,
            alpha: 1
          });
        }

        if (this.score >= this.cfg.need) {
          this.running = false;
          const st = this.lives === this.cfg.lives ? 3 : this.lives >= 2 ? 2 : 1;
          setTimeout(() => window.hub.levelComplete('sushichop', {
            stars: st,
            score: this.score,
            title: 'Maestru ninja!',
            message: this.score + ' fructe taiate in nivelul ' + (this.levelIndex + 1) + '.',
            isLastLevel: this.levelIndex + 1 >= SUSHI_LEVELS.length
          }), 600);
        }
      }
    }
  }

  loop() {
    if (!this.running) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Background
    this.ctx.fillStyle = '#1e1b4b';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Spawning
    this.spawnTimer++;
    if (this.spawnTimer % Math.max(6, Math.round(this.cfg.gap / this.sp)) === 0) {
      this.spawnFruit();
    }

    // Update & draw fruits
    for (let i = this.items.length - 1; i >= 0; i--) {
      const item = this.items[i];
      const sp = this.sp;
      item.x += item.vx * sp;
      item.y += item.vy * sp;
      item.vy += 0.25 * sp; // gravity
      item.rotation += item.rotSpeed * sp;

      if (item.y > this.canvas.height + 80) {
        this.items.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.translate(item.x, item.y);
      this.ctx.rotate(item.rotation);
      this.ctx.font = `${item.radius * 1.5}px sans-serif`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';

      if (item.sliced) {
        // Draw 2 half splatters
        this.ctx.globalAlpha = 0.5;
        this.ctx.fillText('💥', 0, 0);
      } else {
        this.ctx.fillText(item.emoji, 0, 0);
      }
      this.ctx.restore();
    }

    // Draw Blade Trail
    const now = Date.now();
    this.trail = this.trail.filter(p => now - p.time < 120);

    if (this.trail.length > 1) {
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.moveTo(this.trail[0].x, this.trail[0].y);
      for (let i = 1; i < this.trail.length; i++) {
        this.ctx.lineTo(this.trail[i].x, this.trail[i].y);
      }
      this.ctx.strokeStyle = '#38bdf8';
      this.ctx.shadowColor = '#0284c7';
      this.ctx.shadowBlur = 12;
      this.ctx.lineWidth = 6;
      this.ctx.lineCap = 'round';
      this.ctx.stroke();
      this.ctx.restore();
    }

    // Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.2;
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

    window.drawLevelHud(this.ctx, this.canvas, {
      level: this.levelIndex + 1,
      maxLevel: SUSHI_LEVELS.length,
      goal: this.score + '/' + this.cfg.need + ' fructe',
      lives: this.lives,
      progress: this.score / this.cfg.need
    });

    requestAnimationFrame(() => this.loop());
  }

  restart() {
    this.running = true;
    this.startLevel();
    this.items = [];
    this.trail = [];
    this.particles = [];
    this.loop();
  }

  stop() {
    this.running = false;
    if (this.canvas) {
      this.canvas.removeEventListener('pointerdown', this.boundDown);
      this.canvas.removeEventListener('pointermove', this.boundMove);
    }
    window.removeEventListener('pointerup', this.boundUp);
    window.removeEventListener('resize', this.boundResize);
  }
}

window.hub.registerGame('sushichop', new SushiChopGame());
