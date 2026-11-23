/**
 * Toki Jetpack - Space Runner Game
 */
const JETPACK_LEVELS = [
  { dist: 2200, obst: 0.014, speed: 3.2 },
  { dist: 3000, obst: 0.020, speed: 3.6 },
  { dist: 3800, obst: 0.026, speed: 4.0 },
  { dist: 4600, obst: 0.032, speed: 4.4 },
  { dist: 5500, obst: 0.038, speed: 4.8 },
  { dist: 6800, obst: 0.045, speed: 5.4 }
];

class JetpackGame {
  constructor() {
    this.name = 'Toki Jetpack 🚀';
    this.maxLevel = JETPACK_LEVELS.length;
    this.usesSpeed = true;
    this.canvas = null;
    this.ctx = null;
    this.running = false;
    this.player = { x: 80, y: 150, vy: 0, thrust: false };
    this.stars = [];
    this.obstacles = [];
    this.flames = [];
    this.distance = 0;
    this.score = 0;
    this.targetDistance = 400;
    this.boundDown = () => { this.player.thrust = true; window.soundManager.playPop(0.8); };
    this.boundUp = () => { this.player.thrust = false; };
    this.boundResize = this.resize.bind(this);
  }

  init(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.resize();
    this.running = true;
    this.player.y = this.canvas.height / 2;
    this.player.vy = 0;
    this.stars = [];
    this.obstacles = [];
    this.flames = [];
    this.distance = 0;
    this.score = 0;
    this.starsGot = 0;
    this.lives = 3;
    this.invuln = 0;
    this.levelIndex = Math.min(window.progress.getLevel('jetpack'), JETPACK_LEVELS.length) - 1;
    this.cfg = JETPACK_LEVELS[this.levelIndex];

    window.addEventListener('resize', this.boundResize);
    this.canvas.addEventListener('pointerdown', this.boundDown);
    window.addEventListener('pointerup', this.boundUp);

    setTimeout(() => {
      if (this.running) window.voice.say('Zborul ' + (this.levelIndex + 1) + '. Tine degetul apasat ca sa urci. Aduna stelute si fereste-te de nori.');
    }, 1000);
    this.loop();
  }


  /** Factorul de viteza ales pentru jocul asta. */
  get sp() {
    return window.gameSpeed.factor('jetpack');
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
  }

  loop() {
    if (!this.running) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Deep Space Background
    this.ctx.fillStyle = '#090514';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Update Player
    const sp = this.sp;
    if (this.player.thrust) {
      this.player.vy -= 0.6 * sp;
      // Flame particles
      this.flames.push({
        x: this.player.x - 12,
        y: this.player.y + 12,
        vx: -(Math.random() * 4 + 3),
        vy: (Math.random() - 0.5) * 3,
        color: Math.random() < 0.5 ? '#f59e0b' : '#ef4444',
        alpha: 1
      });
    } else {
      this.player.vy += 0.35 * sp; // gravity
    }

    this.player.vy = Math.max(-6, Math.min(6, this.player.vy));
    this.player.y += this.player.vy * sp;

    // Clamp inside screen
    if (this.player.y < 30) { this.player.y = 30; this.player.vy = 0; }
    if (this.player.y > this.canvas.height - 40) { this.player.y = this.canvas.height - 40; this.player.vy = 0; }

    this.distance += sp;
    if (this.invuln > 0) this.invuln--;
    window.hub.updateScore(Math.round(this.distance));

    if (this.distance >= this.cfg.dist) {
      this.running = false;
      const st = this.lives === 3 ? 3 : this.lives === 2 ? 2 : 1;
      window.voice.say('Ai ajuns in statia spatiala!');
      setTimeout(() => window.hub.levelComplete('jetpack', {
        stars: st,
        score: Math.round(this.distance),
        title: 'Zborul ' + (this.levelIndex + 1) + ' reusit!',
        message: Math.round(this.distance) + ' metri si ' + this.starsGot + ' stelute adunate.',
        isLastLevel: this.levelIndex + 1 >= JETPACK_LEVELS.length
      }), 700);
      return;
    }

    // Spawn Stars & Obstacles
    if (Math.random() < 0.05 * sp) {
      this.stars.push({
        x: this.canvas.width + 30,
        y: Math.random() * (this.canvas.height - 80) + 40,
        size: 24
      });
    }

    if (Math.random() < this.cfg.obst * sp) {
      this.obstacles.push({
        x: this.canvas.width + 40,
        y: Math.random() * (this.canvas.height - 100) + 50,
        emoji: '☁️',
        size: 38
      });
    }

    // Update & Draw Stars
    for (let i = this.stars.length - 1; i >= 0; i--) {
      const s = this.stars[i];
      s.x -= this.cfg.speed * sp;
      this.ctx.font = '22px sans-serif';
      this.ctx.fillText('⭐', s.x, s.y);

      if (Math.hypot(this.player.x - s.x, this.player.y - s.y) < 32) {
        this.stars.splice(i, 1);
        this.score += 10;
        this.starsGot++;
        window.soundManager.playChime();
        continue;
      }
      if (s.x < -30) this.stars.splice(i, 1);
    }

    // Update & Draw Obstacles
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const o = this.obstacles[i];
      o.x -= this.cfg.speed * sp;
      this.ctx.font = `${o.size}px sans-serif`;
      this.ctx.fillText(o.emoji, o.x, o.y);

      if (Math.hypot(this.player.x - o.x, this.player.y - o.y) < 28 && this.invuln === 0) {
        window.soundManager.playBoing();
        this.player.vy = 4; // bounce down
        this.lives--;
        this.invuln = 70;
        this.obstacles.splice(i, 1);
        if (this.lives <= 0) {
          this.running = false;
          window.voice.say('Racheta s-a oprit. Mai incercam.');
          setTimeout(() => window.hub.gameOver('jetpack', {
            score: this.distance,
            title: 'Zborul s-a incheiat',
            message: 'Trei ciocniri cu norii. Reluam zborul.'
          }), 400);
          return;
        }
        window.voice.say('Atentie! Mai ai ' + this.lives + ' vieti.');
        continue;
      }
      if (o.x < -50) this.obstacles.splice(i, 1);
    }

    // Flames
    for (let i = this.flames.length - 1; i >= 0; i--) {
      const f = this.flames[i];
      f.x += f.vx;
      f.y += f.vy;
      f.alpha -= 0.05;
      if (f.alpha <= 0) {
        this.flames.splice(i, 1);
        continue;
      }
      this.ctx.save();
      this.ctx.globalAlpha = f.alpha;
      this.ctx.fillStyle = f.color;
      this.ctx.fillRect(f.x, f.y, 6, 6);
      this.ctx.restore();
    }

    // Draw Player (jucătorul in Rocket / Jetpack)
    this.ctx.save();
    this.ctx.translate(this.player.x, this.player.y);
    this.ctx.font = '36px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    if (this.invuln === 0 || Math.floor(this.invuln / 5) % 2 === 0) {
      this.ctx.fillText('🚀', 0, 0);
    }
    this.ctx.restore();

    window.drawLevelHud(this.ctx, this.canvas, {
      level: this.levelIndex + 1,
      maxLevel: JETPACK_LEVELS.length,
      goal: '⭐ ' + this.starsGot + ' · ' + Math.round(this.distance) + 'm',
      lives: this.lives,
      progress: this.distance / this.cfg.dist
    });

    requestAnimationFrame(() => this.loop());
  }

  restart() {
    this.levelIndex = Math.min(window.progress.getLevel('jetpack'), JETPACK_LEVELS.length) - 1;
    this.cfg = JETPACK_LEVELS[this.levelIndex];
    this.player.y = this.canvas.height / 2;
    this.player.vy = 0;
    this.distance = 0;
    this.score = 0;
    this.starsGot = 0;
    this.lives = 3;
    this.invuln = 0;
    this.stars = [];
    this.obstacles = [];
    this.running = true;
    this.loop();
  }

  stop() {
    this.running = false;
    if (this.canvas) {
      this.canvas.removeEventListener('pointerdown', this.boundDown);
    }
    window.removeEventListener('pointerup', this.boundUp);
    window.removeEventListener('resize', this.boundResize);
  }
}

window.hub.registerGame('jetpack', new JetpackGame());
