/* MAP
 * §1 setup & ball physics L1-L75
 * §2 table collision & pocketing L77-L150
 * §3 drawing & controls L152-L240
 */

// §1 setup & ball physics
class BilliardsGame {
  constructor() {
    this.name = 'Biliard cu Bile Vesele 🎱';
    this.maxLevel = 6;
    this.usesSpeed = true;
    this.boundDown = this.handleDown.bind(this);
    this.boundMove = this.handleMove.bind(this);
    this.boundUp = this.handleUp.bind(this);
    this.boundResize = this.resize.bind(this);
    this.running = false;
  }

  init(canvas) {
    this.stop();
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.resize();
    this.level = window.progress.getLevel('billiard') || 1;
    this.balls = [];
    this.cueBall = null;
    this.dragStart = null;
    this.dragCurrent = null;
    this.score = 0;
    this.targetBalls = 6 + this.level * 2;
    this.shotsLeft = this.targetBalls + 10;
    this.initTable();
    this.running = true;

    canvas.addEventListener('pointerdown', this.boundDown);
    window.addEventListener('pointermove', this.boundMove);
    window.addEventListener('pointerup', this.boundUp);
    window.addEventListener('resize', this.boundResize);

    window.hub.updateScore(0);
    window.voice.say(`Nivelul ${this.level}. Trage de bila albă și bagă toate cele ${this.targetBalls} bile colorate în buzunare!`);
    this.loop();
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = Math.max(320, rect.width);
    this.canvas.height = Math.max(380, rect.height);
    this.table = {
      x: 25,
      y: 45,
      w: this.canvas.width - 50,
      h: this.canvas.height - 75,
      pocketR: 24,
      ballR: Math.min(16, Math.max(12, (this.canvas.width - 50) / 28))
    };
  }

  get sp() { return window.gameSpeed.factor('billiard'); }

  initTable() {
    const t = this.table;
    const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];
    this.balls = [];

    // Cue ball
    this.cueBall = {
      x: t.x + t.w * 0.25,
      y: t.y + t.h * 0.5,
      vx: 0,
      vy: 0,
      r: t.ballR,
      color: '#ffffff',
      isCue: true,
      inPocket: false
    };

    // Target balls placed on right side
    const startX = t.x + t.w * 0.68;
    const startY = t.y + t.h * 0.5;
    let placed = 0;

    for (let col = 0; col < 4 && placed < this.targetBalls; col++) {
      for (let row = 0; row <= col && placed < this.targetBalls; row++) {
        const offY = (row - col / 2) * (t.ballR * 2.2);
        this.balls.push({
          x: startX + col * (t.ballR * 1.9),
          y: startY + offY,
          vx: 0,
          vy: 0,
          r: t.ballR,
          color: colors[placed % colors.length],
          num: placed + 1,
          isCue: false,
          inPocket: false
        });
        placed++;
      }
    }
  }

  getPockets() {
    const t = this.table;
    return [
      { x: t.x + 8, y: t.y + 8 },
      { x: t.x + t.w / 2, y: t.y + 4 },
      { x: t.x + t.w - 8, y: t.y + 8 },
      { x: t.x + 8, y: t.y + t.h - 8 },
      { x: t.x + t.w / 2, y: t.y + t.h - 4 },
      { x: t.x + t.w - 8, y: t.y + t.h - 8 }
    ];
  }

  isAnyBallMoving() {
    if (Math.hypot(this.cueBall.vx, this.cueBall.vy) > 0.15) return true;
    return this.balls.some((b) => !b.inPocket && Math.hypot(b.vx, b.vy) > 0.15);
  }

  // §2 table collision & pocketing
  handleDown(event) {
    if (!this.running || this.isAnyBallMoving()) return;
    const rect = this.canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * this.canvas.width / rect.width;
    const y = (event.clientY - rect.top) * this.canvas.height / rect.height;

    if (Math.hypot(x - this.cueBall.x, y - this.cueBall.y) < this.cueBall.r * 3) {
      this.dragStart = { x, y };
      this.dragCurrent = { x, y };
    }
  }

  handleMove(event) {
    if (!this.dragStart) return;
    const rect = this.canvas.getBoundingClientRect();
    this.dragCurrent = {
      x: (event.clientX - rect.left) * this.canvas.width / rect.width,
      y: (event.clientY - rect.top) * this.canvas.height / rect.height
    };
  }

  handleUp() {
    if (!this.dragStart || !this.dragCurrent) {
      this.dragStart = null;
      return;
    }
    const dx = this.dragStart.x - this.dragCurrent.x;
    const dy = this.dragStart.y - this.dragCurrent.y;
    const power = Math.min(22, Math.hypot(dx, dy) * 0.18);

    if (power > 1) {
      const angle = Math.atan2(dy, dx);
      this.cueBall.vx = Math.cos(angle) * power * this.sp;
      this.cueBall.vy = Math.sin(angle) * power * this.sp;
      this.shotsLeft--;
      window.soundManager.playPop(1.3);
    }
    this.dragStart = null;
    this.dragCurrent = null;
  }

  updatePhysics() {
    const t = this.table;
    const pockets = this.getPockets();
    const all = [this.cueBall, ...this.balls.filter((b) => !b.inPocket)];
    const friction = 0.985;

    // Movement & Pocketing
    all.forEach((b) => {
      if (b.inPocket) return;
      b.x += b.vx;
      b.y += b.vy;
      b.vx *= friction;
      b.vy *= friction;

      if (Math.hypot(b.vx, b.vy) < 0.05) {
        b.vx = 0;
        b.vy = 0;
      }

      // Check pockets
      pockets.forEach((p) => {
        if (Math.hypot(b.x - p.x, b.y - p.y) < t.pocketR * 0.9) {
          b.inPocket = true;
          b.vx = 0;
          b.vy = 0;
          if (b.isCue) {
            window.soundManager.playBuzz();
            window.voice.say('Ai băgat bila albă!');
            setTimeout(() => {
              this.cueBall.x = t.x + t.w * 0.25;
              this.cueBall.y = t.y + t.h * 0.5;
              this.cueBall.inPocket = false;
            }, 600);
          } else {
            this.score++;
            window.hub.updateScore(this.score);
            window.soundManager.playFanfare();
            window.confettiManager.start(400);
          }
        }
      });

      // Cushion bounce
      if (b.x - b.r < t.x + 12) { b.x = t.x + 12 + b.r; b.vx = Math.abs(b.vx) * 0.85; window.soundManager.playClick(); }
      if (b.x + b.r > t.x + t.w - 12) { b.x = t.x + t.w - 12 - b.r; b.vx = -Math.abs(b.vx) * 0.85; window.soundManager.playClick(); }
      if (b.y - b.r < t.y + 12) { b.y = t.y + 12 + b.r; b.vy = Math.abs(b.vy) * 0.85; window.soundManager.playClick(); }
      if (b.y + b.r > t.y + t.h - 12) { b.y = t.y + t.h - 12 - b.r; b.vy = -Math.abs(b.vy) * 0.85; window.soundManager.playClick(); }
    });

    // Ball-to-ball collisions
    for (let i = 0; i < all.length; i++) {
      for (let j = i + 1; j < all.length; j++) {
        const b1 = all[i];
        const b2 = all[j];
        if (b1.inPocket || b2.inPocket) continue;

        const dx = b2.x - b1.x;
        const dy = b2.y - b1.y;
        const dist = Math.hypot(dx, dy);
        if (dist < b1.r + b2.r && dist > 0) {
          // Normal & Tangent
          const nx = dx / dist;
          const ny = dy / dist;
          const kx = b1.vx - b2.vx;
          const ky = b1.vy - b2.vy;
          const p = 2 * (nx * kx + ny * ky) / 2;

          b1.vx -= p * nx;
          b1.vy -= p * ny;
          b2.vx += p * nx;
          b2.vy += p * ny;

          // Push apart
          const overlap = (b1.r + b2.r - dist) / 2;
          b1.x -= overlap * nx;
          b1.y -= overlap * ny;
          b2.x += overlap * nx;
          b2.y += overlap * ny;

          window.soundManager.playPop(1.5);
        }
      }
    }

    // Check Win/Loss conditions once all balls rest
    if (!this.isAnyBallMoving()) {
      const remaining = this.balls.filter((b) => !b.inPocket).length;
      if (remaining === 0) {
        this.running = false;
        window.hub.levelComplete('billiard', {
          stars: this.shotsLeft >= 3 ? 3 : this.shotsLeft >= 1 ? 2 : 1,
          score: this.score,
          title: 'Toate bilele sunt în buzunare!',
          message: `Excelent! Ai terminat nivelul ${this.level}!`
        });
      } else if (this.shotsLeft <= 0) {
        this.running = false;
        window.hub.gameOver('billiard', {
          title: 'S-au terminat loviturile!',
          message: `Au mai rămas ${remaining} bile pe masă. Mai încearcă!`,
          score: this.score
        });
      }
    }
  }

  // §3 drawing & controls
  loop() {
    if (!this.running) return;
    this.updatePhysics();
    this.draw();
    requestAnimationFrame(() => this.loop());
  }

  draw() {
    const { ctx, canvas } = this;
    const t = this.table;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Floor
    ctx.fillStyle = '#091e14';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Table Wood Frame
    ctx.fillStyle = '#5c3a21';
    ctx.beginPath();
    ctx.roundRect(t.x - 14, t.y - 14, t.w + 28, t.h + 28, 16);
    ctx.fill();

    // Table Cloth Green Felt
    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.roundRect(t.x, t.y, t.w, t.h, 10);
    ctx.fill();

    // Pockets
    const pockets = this.getPockets();
    pockets.forEach((p) => {
      ctx.fillStyle = '#020617';
      ctx.beginPath();
      ctx.arc(p.x, p.y, t.pocketR, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // Cue Aim Line
    if (this.dragStart && this.dragCurrent && !this.cueBall.inPocket) {
      const dx = this.dragStart.x - this.dragCurrent.x;
      const dy = this.dragStart.y - this.dragCurrent.y;
      const aimX = this.cueBall.x + dx * 2;
      const aimY = this.cueBall.y + dy * 2;

      ctx.beginPath();
      ctx.moveTo(this.cueBall.x, this.cueBall.y);
      ctx.lineTo(aimX, aimY);
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 3;
      ctx.setLineDash([6, 6]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Cue stick visual
      const stickLen = 90;
      const angle = Math.atan2(dy, dx);
      const stickStartX = this.cueBall.x - Math.cos(angle) * (this.cueBall.r + 8);
      const stickStartY = this.cueBall.y - Math.sin(angle) * (this.cueBall.r + 8);
      const stickEndX = stickStartX - Math.cos(angle) * stickLen;
      const stickEndY = stickStartY - Math.sin(angle) * stickLen;

      ctx.beginPath();
      ctx.moveTo(stickStartX, stickStartY);
      ctx.lineTo(stickEndX, stickEndY);
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.stroke();
    }

    // Target Balls
    this.balls.forEach((b) => {
      if (!b.inPocket) this.drawBall(b);
    });

    // Cue Ball
    if (!this.cueBall.inPocket) {
      this.drawBall(this.cueBall);
    }

    window.drawLevelHud(ctx, canvas, {
      level: this.level,
      maxLevel: this.maxLevel,
      goal: `Bile: ${this.score}/${this.targetBalls} · Lovituri: ${this.shotsLeft}`
    });
  }

  drawBall(b) {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fillStyle = b.color;
    ctx.fill();

    // 3D Ball highlight
    ctx.beginPath();
    ctx.arc(b.x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.35, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fill();

    if (!b.isCue && b.num) {
      ctx.fillStyle = '#0f172a';
      ctx.font = `bold ${Math.round(b.r * 0.9)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(b.num.toString(), b.x, b.y + 1);
    }
  }

  restart() {
    if (this.canvas) this.init(this.canvas);
  }

  stop() {
    this.running = false;
    if (this.canvas) this.canvas.removeEventListener('pointerdown', this.boundDown);
    window.removeEventListener('pointermove', this.boundMove);
    window.removeEventListener('pointerup', this.boundUp);
    window.removeEventListener('resize', this.boundResize);
  }
}

window.hub.registerGame('billiard', new BilliardsGame());
