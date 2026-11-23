/* MAP
 * §1 pinball physics & bumpers setup L1-L65
 * §2 flipper triggers & ball dynamics L67-L145
 * §3 drawing & game loop L147-L225
 */

// §1 pinball physics & bumpers setup
class PinballGame {
  constructor() {
    this.name = 'Flipper Vesele 🎰';
    this.maxLevel = 6;
    this.usesSpeed = true;
    this.boundDown = this.handleDown.bind(this);
    this.boundUp = this.handleUp.bind(this);
    this.boundResize = this.resize.bind(this);
    this.running = false;
    this.flipperLeft = false;
    this.flipperRight = false;
  }

  init(canvas) {
    this.stop();
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.resize();
    this.level = window.progress.getLevel('pinball') || 1;
    this.targetScore = 1500 + this.level * 800;
    this.score = 0;
    this.ballsLeft = 5;
    this.ball = null;
    this.bumpers = [];

    this.initTable();
    this.resetBall();
    this.running = true;

    canvas.addEventListener('pointerdown', this.boundDown);
    canvas.addEventListener('pointerup', this.boundUp);
    window.addEventListener('resize', this.boundResize);

    window.hub.updateScore(0);
    window.voice.say(`Nivelul ${this.level}. Atinge stânga sau dreapta ecranului pentru a ridica paletele și a strânge ${this.targetScore} puncte!`);
    this.loop();
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = Math.max(320, rect.width);
    this.canvas.height = Math.max(380, rect.height);
  }

  get sp() { return window.gameSpeed.factor('pinball'); }

  initTable() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    this.bumpers = [
      { x: w * 0.3, y: h * 0.25, r: 24, color: '#ef4444', pts: 20 },
      { x: w * 0.7, y: h * 0.25, r: 24, color: '#3b82f6', pts: 20 },
      { x: w * 0.5, y: h * 0.38, r: 28, color: '#facc15', pts: 30 },
      { x: w * 0.22, y: h * 0.52, r: 18, color: '#10b981', pts: 15 },
      { x: w * 0.78, y: h * 0.52, r: 18, color: '#a855f7', pts: 15 }
    ];
  }

  resetBall() {
    this.ball = {
      x: this.canvas.width * 0.5,
      y: 60,
      vx: (Math.random() - 0.5) * 4,
      vy: 2,
      r: 12
    };
  }

  // §2 flipper triggers & ball dynamics
  handleDown(event) {
    if (!this.running) return;
    const rect = this.canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * this.canvas.width / rect.width;

    if (x < this.canvas.width * 0.5) {
      this.flipperLeft = true;
      window.soundManager.playPop(1.4);
    } else {
      this.flipperRight = true;
      window.soundManager.playPop(1.4);
    }
  }

  handleUp(event) {
    const rect = this.canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * this.canvas.width / rect.width;
    if (x < this.canvas.width * 0.5) this.flipperLeft = false;
    else this.flipperRight = false;
  }

  updatePhysics() {
    const sp = this.sp;
    const b = this.ball;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Ball gravity & motion
    b.x += b.vx * sp;
    b.y += b.vy * sp;
    b.vy += 0.32 * sp; // Gravity

    // Outer wall bounces
    if (b.x - b.r < 15) { b.x = 15 + b.r; b.vx = Math.abs(b.vx) * 0.85; window.soundManager.playClick(); }
    if (b.x + b.r > w - 15) { b.x = w - 15 - b.r; b.vx = -Math.abs(b.vx) * 0.85; window.soundManager.playClick(); }
    if (b.y - b.r < 35) { b.y = 35 + b.r; b.vy = Math.abs(b.vy) * 0.85; window.soundManager.playClick(); }

    // Bumper collisions
    this.bumpers.forEach((bmp) => {
      const dist = Math.hypot(b.x - bmp.x, b.y - bmp.y);
      if (dist < b.r + bmp.r) {
        const angle = Math.atan2(b.y - bmp.y, b.x - bmp.x);
        b.vx = Math.cos(angle) * 11;
        b.vy = Math.sin(angle) * 11;
        this.score += bmp.pts;
        window.hub.updateScore(this.score);
        window.soundManager.playFanfare();
        window.confettiManager.start(250);
      }
    });

    // Flipper collisions
    const fY = h - 90;
    const fLeftX = w * 0.25;
    const fRightX = w * 0.75;
    const fLen = w * 0.22;

    // Left Flipper
    if (this.flipperLeft && b.x > fLeftX - 10 && b.x < fLeftX + fLen + 10 && b.y > fY - 30 && b.y < fY + 25) {
      b.vy = -12;
      b.vx += 3;
      this.score += 10;
      window.soundManager.playPop(1.7);
    } else if (!this.flipperLeft && b.x > fLeftX && b.x < fLeftX + fLen && b.y > fY - 5 && b.y < fY + 25) {
      b.vy = -Math.abs(b.vy) * 0.5;
    }

    // Right Flipper
    if (this.flipperRight && b.x > fRightX - fLen - 10 && b.x < fRightX + 10 && b.y > fY - 30 && b.y < fY + 25) {
      b.vy = -12;
      b.vx -= 3;
      this.score += 10;
      window.soundManager.playPop(1.7);
    } else if (!this.flipperRight && b.x > fRightX - fLen && b.x < fRightX && b.y > fY - 5 && b.y < fY + 25) {
      b.vy = -Math.abs(b.vy) * 0.5;
    }

    // Check Win
    if (this.score >= this.targetScore) {
      this.running = false;
      window.hub.levelComplete('pinball', {
        stars: 3,
        score: this.score,
        title: 'Scor Fantastic la Flipper! 🎰',
        message: `Bravo! Ai atins ${this.score} puncte!`
      });
      return;
    }

    // Ball drained in bottom hole
    if (b.y > h + 30) {
      this.ballsLeft--;
      window.soundManager.playBuzz();
      if (this.ballsLeft > 0) {
        this.resetBall();
      } else {
        this.running = false;
        window.hub.gameOver('pinball', {
          title: 'S-au terminat bilele!',
          message: `Scor: ${this.score} din ${this.targetScore} necesare. Mai încearcă!`,
          score: this.score
        });
      }
    }
  }

  // §3 drawing & game loop
  loop() {
    if (!this.running) return;
    this.updatePhysics();
    this.draw();
    requestAnimationFrame(() => this.loop());
  }

  draw() {
    const { ctx, canvas } = this;
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Table Felt Neon Background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    // Table Border Neon
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 6;
    ctx.strokeRect(10, 30, w - 20, h - 35);

    // Bumpers
    this.bumpers.forEach((bmp) => {
      ctx.fillStyle = bmp.color;
      ctx.beginPath();
      ctx.arc(bmp.x, bmp.y, bmp.r, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`+${bmp.pts}`, bmp.x, bmp.y);
    });

    // Flippers
    const fY = h - 90;
    const fLeftX = w * 0.25;
    const fRightX = w * 0.75;
    const fLen = w * 0.22;

    // Left Flipper
    ctx.save();
    ctx.translate(fLeftX, fY);
    ctx.rotate(this.flipperLeft ? -Math.PI / 4 : Math.PI / 8);
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.roundRect(0, -6, fLen, 14, 6);
    ctx.fill();
    ctx.restore();

    // Right Flipper
    ctx.save();
    ctx.translate(fRightX, fY);
    ctx.rotate(this.flipperRight ? Math.PI / 4 : -Math.PI / 8);
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.roundRect(-fLen, -6, fLen, 14, 6);
    ctx.fill();
    ctx.restore();

    // Steel Ball
    if (this.ball) {
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.arc(this.ball.x, this.ball.y, this.ball.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Touch Buttons hint
    ctx.fillStyle = 'rgba(30, 41, 59, 0.6)';
    ctx.beginPath(); ctx.roundRect(15, h - 60, w * 0.45, 45, 10); ctx.fill();
    ctx.beginPath(); ctx.roundRect(w * 0.55 - 5, h - 60, w * 0.45, 45, 10); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('PALETĂ STÂNGA 👈', 15 + (w * 0.45) / 2, h - 33);
    ctx.fillText('👉 PALETĂ DREAPTA', w * 0.55 - 5 + (w * 0.45) / 2, h - 33);

    window.drawLevelHud(ctx, canvas, {
      level: this.level,
      maxLevel: this.maxLevel,
      goal: `Scor: ${this.score}/${this.targetScore} · Bile: ${this.ballsLeft}`
    });
  }

  restart() {
    if (this.canvas) this.init(this.canvas);
  }

  stop() {
    this.running = false;
    if (this.canvas) {
      this.canvas.removeEventListener('pointerdown', this.boundDown);
      this.canvas.removeEventListener('pointerup', this.boundUp);
    }
    window.removeEventListener('resize', this.boundResize);
  }
}

window.hub.registerGame('pinball', new PinballGame());
