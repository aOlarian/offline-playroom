/**
 * Toki Basket - Touch Basketball Shoot
 */
const BASKET_LEVELS = [
  { need: 24, shots: 40, moving: 0, wind: 0 },
  { need: 32, shots: 45, moving: 0, wind: 0 },
  { need: 40, shots: 50, moving: 1.0, wind: 0 },
  { need: 48, shots: 55, moving: 1.6, wind: 0.04 },
  { need: 56, shots: 60, moving: 2.2, wind: 0.07 },
  { need: 64, shots: 65, moving: 2.8, wind: 0.10 }
];

class BasketGame {
  constructor() {
    this.name = 'Toki Basket 🏀';
    this.maxLevel = BASKET_LEVELS.length;
    this.usesSpeed = true;
    this.canvas = null;
    this.ctx = null;
    this.running = false;
    this.ball = { x: 0, y: 0, vx: 0, vy: 0, inFlight: false, radius: 22 };
    this.dragStart = null;
    this.score = 0;
    this.targetScore = 8;
    this.hoop = { x: 0, y: 0, width: 60 };
    this.boundDown = this.handleDown.bind(this);
    this.boundMove = this.handleMove.bind(this);
    this.boundUp = this.handleUp.bind(this);
    this.boundResize = this.resize.bind(this);
  }

  init(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.resize();
    this.running = true;
    this.startLevel();
    this.resetBall();

    window.addEventListener('resize', this.boundResize);
    this.canvas.addEventListener('pointerdown', this.boundDown);
    window.addEventListener('pointermove', this.boundMove);
    window.addEventListener('pointerup', this.boundUp);

    this.loop();
  }


  /** Factorul de viteza ales pentru jocul asta. */
  get sp() {
    return window.gameSpeed.factor('basket');
  }

  startLevel() {
    this.levelIndex = Math.min(window.progress.getLevel('basket'), BASKET_LEVELS.length) - 1;
    this.cfg = BASKET_LEVELS[this.levelIndex];
    this.score = 0;
    this.shotsLeft = this.cfg.shots;
    this.hoopDir = 1;
    window.hub.updateScore(0);
    setTimeout(() => {
      if (!this.running) return;
      const extra = this.cfg.moving ? ' Cosul se misca!' : '';
      window.voice.say('Inscrie ' + this.cfg.need + ' puncte din ' + this.cfg.shots + ' aruncari.' + extra);
    }, 1000);
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
    this.hoop.x = this.canvas.width * 0.75;
    this.hoop.y = this.canvas.height * 0.35;
    if (!this.ball.inFlight) this.resetBall();
  }

  resetBall() {
    this.ball.x = this.canvas.width * 0.25;
    this.ball.y = this.canvas.height * 0.75;
    this.ball.vx = 0;
    this.ball.vy = 0;
    this.ball.inFlight = false;
    this.dragStart = null;
  }

  handleDown(e) {
    if (!this.running || this.ball.inFlight) return;
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (Math.hypot(x - this.ball.x, y - this.ball.y) < 50) {
      this.dragStart = { x, y };
    }
  }

  handleMove(e) {
    if (!this.dragStart) return;
    const rect = this.canvas.getBoundingClientRect();
    this.dragCurrent = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  handleUp() {
    if (!this.dragStart || !this.dragCurrent) {
      this.dragStart = null;
      return;
    }

    const dx = this.dragStart.x - this.dragCurrent.x;
    const dy = this.dragStart.y - this.dragCurrent.y;

    this.ball.vx = Math.max(-18, Math.min(26, dx * 0.28));
    this.ball.vy = Math.max(-28, Math.min(-4, dy * 0.28));
    this.ball.inFlight = true;
    this.dragStart = null;
    this.dragCurrent = null;
    window.soundManager.playPop(1.2);
  }

  loop() {
    if (!this.running) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Court Background
    this.ctx.fillStyle = '#0f172a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Title
    this.ctx.font = 'bold 20px sans-serif';
    this.ctx.fillStyle = '#f97316';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Trage de minge și aruncă la coș! 🏀', this.canvas.width / 2, window.HUD_HEIGHT + 24);

    // Cosul urca si coboara de la nivelul 3 in sus.
    if (this.cfg.moving) {
      this.hoop.y += this.hoopDir * this.cfg.moving * this.sp;
      const minY = this.canvas.height * 0.22;
      const maxY = this.canvas.height * 0.55;
      if (this.hoop.y < minY || this.hoop.y > maxY) this.hoopDir *= -1;
    }

    // Draw Hoop Net, Rim & Backboard
    const hoopCenter = this.hoop.x + this.hoop.width / 2;
    // Backboard
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(this.hoop.x + this.hoop.width, this.hoop.y - 55, 12, 75);
    this.ctx.strokeStyle = '#3b82f6';
    this.ctx.lineWidth = 3;
    this.ctx.strokeRect(this.hoop.x + this.hoop.width, this.hoop.y - 55, 12, 75);

    // Net
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(this.hoop.x + 4, this.hoop.y);
    this.ctx.lineTo(hoopCenter - 10, this.hoop.y + 40);
    this.ctx.lineTo(hoopCenter + 10, this.hoop.y + 40);
    this.ctx.lineTo(this.hoop.x + this.hoop.width - 4, this.hoop.y);
    this.ctx.stroke();
    // Net cross lines
    this.ctx.beginPath();
    this.ctx.moveTo(this.hoop.x + 18, this.hoop.y);
    this.ctx.lineTo(hoopCenter + 6, this.hoop.y + 40);
    this.ctx.moveTo(this.hoop.x + this.hoop.width - 18, this.hoop.y);
    this.ctx.lineTo(hoopCenter - 6, this.hoop.y + 40);
    this.ctx.stroke();

    // Rim
    this.ctx.strokeStyle = '#ef4444';
    this.ctx.lineWidth = 8;
    this.ctx.beginPath();
    this.ctx.moveTo(this.hoop.x, this.hoop.y);
    this.ctx.lineTo(this.hoop.x + this.hoop.width, this.hoop.y);
    this.ctx.stroke();

    // Curved Parabolic Trajectory Aim Line (Enhanced)
    if (this.dragStart && this.dragCurrent) {
      const dx = this.dragStart.x - this.dragCurrent.x;
      const dy = this.dragStart.y - this.dragCurrent.y;
      const simVx = Math.max(-20, Math.min(30, dx * 0.28));
      const simVy = Math.max(-32, Math.min(-6, dy * 0.28));

      let simX = this.ball.x;
      let simY = this.ball.y;
      let currVy = simVy;

      for (let t = 0; t < 36; t++) {
        simX += simVx;
        simY += currVy;
        currVy += 0.55; // gravity simulation

        this.ctx.fillStyle = t % 2 === 0 ? '#fde047' : '#f97316';
        this.ctx.beginPath();
        this.ctx.arc(simX, simY, Math.max(3, 7 - t * 0.12), 0, Math.PI * 2);
        this.ctx.fill();

        if (simY > this.canvas.height + 20 || simX > this.canvas.width + 20) break;
      }
    }

    // Physics
    if (this.ball.inFlight) {
      const sp = this.sp;
      this.ball.x += this.ball.vx * sp;
      this.ball.y += this.ball.vy * sp;
      this.ball.vy += 0.55 * sp; // gravity
      this.ball.vx += this.cfg.wind * sp;

      // Backboard bounce
      const bbX = this.hoop.x + this.hoop.width;
      if (
        this.ball.x + this.ball.radius >= bbX &&
        this.ball.x - this.ball.radius <= bbX + 16 &&
        this.ball.y >= this.hoop.y - 60 &&
        this.ball.y <= this.hoop.y + 20 &&
        this.ball.vx > 0
      ) {
        this.ball.vx = -this.ball.vx * 0.65;
        this.ball.x = bbX - this.ball.radius - 2;
        window.soundManager.playPop(1.5);
      }

      // Generous Basket Hit Detection (Kid-friendly)
      const inHoopX = this.ball.x >= this.hoop.x - 8 && this.ball.x <= this.hoop.x + this.hoop.width + 8;
      const inHoopY = (this.ball.y >= this.hoop.y - 12 && this.ball.y <= this.hoop.y + 45) ||
                      (this.prevBallY && this.prevBallY <= this.hoop.y && this.ball.y >= this.hoop.y);

      if (inHoopX && inHoopY && this.ball.vy > -1) {
        this.score += 2;
        window.hub.updateScore(this.score);
        window.soundManager.playFanfare();
        window.confettiManager.start(1000);

        window.voice.say('Coș! ' + this.score + ' puncte.');
        if (this.score >= this.cfg.need) {
          this.running = false;
          const left = this.shotsLeft;
          const st = left >= this.cfg.shots - this.cfg.need / 2 ? 3 : left >= 2 ? 2 : 1;
          setTimeout(() => window.hub.levelComplete('basket', {
            stars: st,
            score: this.score,
            title: 'Campionul coșurilor!',
            message: this.score + ' puncte, cu ' + left + ' aruncări rămase.',
            isLastLevel: this.levelIndex + 1 >= BASKET_LEVELS.length
          }), 700);
          return;
        }
        this.resetBall();
      }

      this.prevBallY = this.ball.y;

      // Out of screen -> reset
      if (this.ball.y > this.canvas.height + 40 || this.ball.x > this.canvas.width + 40 || this.ball.x < -40) {
        this.shotsLeft--;
        if (this.shotsLeft <= 0) {
          this.running = false;
          setTimeout(() => window.hub.gameOver('basket', {
            score: this.score,
            title: 'S-au terminat aruncările',
            message: 'Ai făcut ' + this.score + ' din ' + this.cfg.need + ' puncte. Mai încercăm!'
          }), 300);
          return;
        }
        this.resetBall();
      }
    }

    // Draw Basketball
    this.ctx.font = '40px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('🏀', this.ball.x, this.ball.y);

    window.drawLevelHud(this.ctx, this.canvas, {
      level: this.levelIndex + 1,
      maxLevel: BASKET_LEVELS.length,
      goal: this.score + '/' + this.cfg.need + ' pct · ' + this.shotsLeft + ' aruncari',
      progress: this.score / this.cfg.need
    });

    requestAnimationFrame(() => this.loop());
  }

  restart() {
    this.running = true;
    this.startLevel();
    this.resetBall();
    this.loop();
  }

  stop() {
    this.running = false;
    if (this.canvas) {
      this.canvas.removeEventListener('pointerdown', this.boundDown);
    }
    window.removeEventListener('pointermove', this.boundMove);
    window.removeEventListener('pointerup', this.boundUp);
    window.removeEventListener('resize', this.boundResize);
  }
}

window.hub.registerGame('basket', new BasketGame());
