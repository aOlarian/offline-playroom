/**
 * Cursa pe Sosea - conduci masinuța cu degetul, ocolesti masinile
 * si aduni combustibil. Nivelurile cresc viteza si traficul.
 */
const RACE_LEVELS = [
  { dist: 3600, speed: 3.2, traffic: 90, lanes: 3 },
  { dist: 4800, speed: 3.8, traffic: 78, lanes: 3 },
  { dist: 6000, speed: 4.4, traffic: 66, lanes: 4 },
  { dist: 7600, speed: 5.0, traffic: 58, lanes: 4 },
  { dist: 9200, speed: 5.6, traffic: 50, lanes: 4 },
  { dist: 11200, speed: 6.4, traffic: 44, lanes: 5 }
];

class RaceGame {
  constructor() {
    this.name = 'Cursa pe Șosea 🏎️';
    this.maxLevel = RACE_LEVELS.length;
    this.usesSpeed = true;
    this.running = false;
    this.boundDown = this.onPointer.bind(this);
    this.boundMove = this.onPointer.bind(this);
    this.boundResize = this.resize.bind(this);
  }

  init(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.resize();
    this.running = true;
    this.startLevel();
    window.addEventListener('resize', this.boundResize);
    this.canvas.addEventListener('pointerdown', this.boundDown);
    this.canvas.addEventListener('pointermove', this.boundMove);
    this.loop();
  }


  /** Factorul de viteza ales pentru jocul asta. */
  get sp() {
    return window.gameSpeed.factor('race');
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
    this.roadW = Math.min(this.canvas.width * 0.86, 460);
    this.roadX = (this.canvas.width - this.roadW) / 2;
  }

  startLevel() {
    this.levelIndex = Math.min(window.progress.getLevel('race'), RACE_LEVELS.length) - 1;
    this.cfg = RACE_LEVELS[this.levelIndex];
    this.carX = this.canvas.width / 2;
    this.traveled = 0;
    this.fuelPicked = 0;
    this.lives = 3;
    this.obstacles = [];
    this.stripes = 0;
    this.timer = 0;
    this.invuln = 0;
    window.hub.updateScore(0);
    setTimeout(() => {
      if (this.running) window.voice.say(`Cursa ${this.levelIndex + 1}. Tine degetul pe ecran si condu masina. Fereste-te de celelalte masini.`);
    }, 1000);
  }

  onPointer(e) {
    if (!this.running) return;
    if (e.pressure === 0 && e.type === 'pointermove' && e.buttons === 0 && e.pointerType === 'mouse') return;
    const rect = this.canvas.getBoundingClientRect();
    this.carX = e.clientX - rect.left;
  }

  laneX(i) {
    const lanes = this.cfg.lanes;
    return this.roadX + (this.roadW / lanes) * (i + 0.5);
  }

  spawn() {
    const lane = Math.floor(Math.random() * this.cfg.lanes);
    const isFuel = Math.random() < 0.22;
    this.obstacles.push({
      x: this.laneX(lane),
      y: -60,
      fuel: isFuel,
      emoji: isFuel ? '⛽' : ['🚙', '🚌', '🚚', '🏍️'][Math.floor(Math.random() * 4)],
      size: isFuel ? 34 : 44
    });
  }

  update() {
    const cfg = this.cfg;
    const carY = this.canvas.height - 80;
    const half = this.roadW / 2;
    this.carX = Math.max(this.roadX + 26, Math.min(this.roadX + this.roadW - 26, this.carX));

    const sp = this.sp;
    this.traveled += cfg.speed * sp;
    this.stripes = (this.stripes + cfg.speed * sp) % 60;
    window.hub.updateScore(Math.floor(this.traveled / 10));

    this.timer += 16 * sp;
    if (this.timer > cfg.traffic * 8) {
      this.timer = 0;
      this.spawn();
    }

    if (this.invuln > 0) this.invuln--;

    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const o = this.obstacles[i];
      o.y += cfg.speed * 1.4 * sp;
      if (o.y > this.canvas.height + 60) { this.obstacles.splice(i, 1); continue; }

      if (Math.abs(o.x - this.carX) < 34 && Math.abs(o.y - carY) < 40) {
        if (o.fuel) {
          this.fuelPicked++;
          this.obstacles.splice(i, 1);
          window.soundManager.playChime();
          window.voice.say('Combustibil!');
        } else if (this.invuln === 0) {
          this.obstacles.splice(i, 1);
          this.lives--;
          this.invuln = 70;
          window.soundManager.playBuzz();
          window.confettiManager.start(300);
          if (this.lives <= 0) {
            this.running = false;
            window.voice.say('Ai ramas fara masini. Mai incercam.');
            setTimeout(() => window.hub.gameOver('race', {
              score: Math.floor(this.traveled / 10),
              title: 'Cursa s-a oprit',
              message: 'Trei ciocniri. Reluam cursa de la inceput.'
            }), 500);
            return;
          }
          window.voice.say(`Atentie! Mai ai ${this.lives} masini.`);
        }
      }
    }

    if (this.traveled >= cfg.dist) {
      this.running = false;
      const stars = this.lives === 3 ? 3 : this.lives === 2 ? 2 : 1;
      window.voice.say('Ai ajuns la linia de sosire!');
      setTimeout(() => window.hub.levelComplete('race', {
        stars,
        score: Math.floor(this.traveled / 10),
        title: `Cursa ${this.levelIndex + 1} terminata!`,
        message: `${this.fuelPicked} bidoane de combustibil si ${this.lives} masini ramase.`,
        isLastLevel: this.levelIndex + 1 >= RACE_LEVELS.length
      }), 700);
    }
  }

  draw() {
    const ctx = this.ctx;
    const W = this.canvas.width;
    const H = this.canvas.height;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#14532d';
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = '#334155';
    ctx.fillRect(this.roadX, 0, this.roadW, H);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(this.roadX - 4, 0, 4, H);
    ctx.fillRect(this.roadX + this.roadW, 0, 4, H);

    ctx.fillStyle = 'rgba(255,255,255,0.65)';
    for (let l = 1; l < this.cfg.lanes; l++) {
      const x = this.roadX + (this.roadW / this.cfg.lanes) * l - 2;
      for (let y = -60 + this.stripes; y < H; y += 60) {
        ctx.fillRect(x, y, 4, 30);
      }
    }

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const o of this.obstacles) {
      ctx.font = `${o.size}px sans-serif`;
      ctx.fillText(o.emoji, o.x, o.y);
    }

    const carY = H - 80;
    if (this.invuln === 0 || Math.floor(this.invuln / 5) % 2 === 0) {
      ctx.font = '52px sans-serif';
      ctx.fillText('🏎️', this.carX, carY);
    }

    window.drawLevelHud(ctx, this.canvas, {
      level: this.levelIndex + 1,
      maxLevel: RACE_LEVELS.length,
      goal: `⛽ ${this.fuelPicked}`,
      lives: this.lives,
      progress: this.traveled / this.cfg.dist
    });
  }

  loop() {
    if (!this.running) return;
    this.update();
    if (this.running) this.draw();
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
    if (this.canvas) {
      this.canvas.removeEventListener('pointerdown', this.boundDown);
      this.canvas.removeEventListener('pointermove', this.boundMove);
    }
    window.removeEventListener('resize', this.boundResize);
  }
}

window.hub.registerGame('race', new RaceGame());
