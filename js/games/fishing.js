/* MAP
 * §1 fish types & rod physics L1-L60
 * §2 cast & catch mechanics L62-L135
 * §3 drawing & game loop L137-L210
 */

// §1 fish types & rod physics
const FISH_TYPES = [
  { icon: '🐟', name: 'Peștișor Argintiu', points: 10, speed: 1.2 },
  { icon: '🐠', name: 'Pește Tropical', points: 20, speed: 1.8 },
  { icon: '🐡', name: 'Pește Balon', points: 30, speed: 2.2 },
  { icon: '🦐', name: 'Crevete Iute', points: 15, speed: 1.5 },
  { icon: '⭐', name: 'Stea de Mare', points: 50, speed: 0.8 }
];

class FishingGame {
  constructor() {
    this.name = 'La Pescuit 🎣';
    this.maxLevel = 6;
    this.usesSpeed = true;
    this.boundTap = this.handleTap.bind(this);
    this.boundResize = this.resize.bind(this);
    this.running = false;
  }

  init(canvas) {
    this.stop();
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.resize();
    this.level = window.progress.getLevel('fishing') || 1;
    this.targetFish = 16 + this.level * 8;
    this.caught = 0;
    this.score = 0;
    this.hook = {
      x: this.canvas.width / 2,
      y: 70,
      targetY: 70,
      state: 'idle', // 'idle', 'dropping', 'reeling'
      caughtFish: null
    };
    this.fishes = [];
    this.initFishes();
    this.running = true;

    canvas.addEventListener('pointerdown', this.boundTap);
    window.addEventListener('resize', this.boundResize);

    window.hub.updateScore(0);
    window.voice.say(`Nivelul ${this.level}. Atinge ecranul ca să cobori cârligul și să prinzi ${this.targetFish} pești!`);
    this.loop();
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = Math.max(320, rect.width);
    this.canvas.height = Math.max(380, rect.height);
    this.waterY = 85;
  }

  get sp() { return window.gameSpeed.factor('fishing'); }

  initFishes() {
    this.fishes = [];
    const count = 5 + this.level;
    for (let i = 0; i < count; i++) {
      const type = FISH_TYPES[Math.floor(Math.random() * Math.min(FISH_TYPES.length, 2 + this.level))];
      this.fishes.push({
        type,
        x: Math.random() * this.canvas.width,
        y: this.waterY + 30 + Math.random() * (this.canvas.height - this.waterY - 70),
        dir: Math.random() < 0.5 ? 1 : -1,
        speed: type.speed * (0.8 + Math.random() * 0.6)
      });
    }
  }

  // §2 cast & catch mechanics
  handleTap(event) {
    if (!this.running) return;
    const rect = this.canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * this.canvas.width / rect.width;
    const y = (event.clientY - rect.top) * this.canvas.height / rect.height;

    if (this.hook.state === 'idle') {
      this.hook.x = Math.max(30, Math.min(this.canvas.width - 30, x));
      this.hook.targetY = Math.max(this.waterY + 40, y);
      this.hook.state = 'dropping';
      window.soundManager.playPop(1.2);
    }
  }

  updatePhysics() {
    const sp = this.sp;

    // Hook movement
    if (this.hook.state === 'dropping') {
      this.hook.y += 6 * sp;
      if (this.hook.y >= this.hook.targetY || this.hook.y >= this.canvas.height - 30) {
        this.hook.state = 'reeling';
      }
    } else if (this.hook.state === 'reeling') {
      this.hook.y -= 7 * sp;
      if (this.hook.caughtFish) {
        this.hook.caughtFish.x = this.hook.x;
        this.hook.caughtFish.y = this.hook.y;
      }
      if (this.hook.y <= 70) {
        this.hook.y = 70;
        this.hook.state = 'idle';
        if (this.hook.caughtFish) {
          this.caught++;
          this.score += this.hook.caughtFish.type.points;
          window.hub.updateScore(this.score);
          window.soundManager.playFanfare();
          window.confettiManager.start(500);
          window.voice.say(`Ai prins ${this.hook.caughtFish.type.name}!`);

          // Remove caught fish and respawn
          this.fishes = this.fishes.filter((f) => f !== this.hook.caughtFish);
          this.hook.caughtFish = null;
          this.initFishes();

          if (this.caught >= this.targetFish) {
            this.running = false;
            window.hub.levelComplete('fishing', {
              stars: 3,
              score: this.score,
              title: 'Marele Pescar! 🎣',
              message: `Felicitări! Ai prins toți cei ${this.targetFish} pești!`
            });
            return;
          }
        }
      }
    }

    // Fish swim
    this.fishes.forEach((f) => {
      if (f === this.hook.caughtFish) return;
      f.x += f.dir * f.speed * sp;

      if (f.x < -30) {
        f.x = this.canvas.width + 20;
      } else if (f.x > this.canvas.width + 30) {
        f.x = -20;
      }

      // Hook collision check
      if (this.hook.state === 'dropping' && !this.hook.caughtFish) {
        if (Math.hypot(f.x - this.hook.x, f.y - this.hook.y) < 26) {
          this.hook.caughtFish = f;
          this.hook.state = 'reeling';
          window.soundManager.playPop(1.5);
        }
      }
    });
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
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Sky
    ctx.fillStyle = '#7dd3fc';
    ctx.fillRect(0, 0, canvas.width, this.waterY);

    // Fishing boat & character
    ctx.font = '36px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⛵', this.hook.x, this.waterY - 8);

    // Water
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(0, this.waterY, canvas.width, canvas.height - this.waterY);

    // Fishing Line
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(this.hook.x, this.waterY - 15);
    ctx.lineTo(this.hook.x, this.hook.y);
    ctx.stroke();

    // Hook Hook Shape
    ctx.font = '22px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🪝', this.hook.x, this.hook.y);

    // Fishes
    this.fishes.forEach((f) => {
      ctx.save();
      ctx.translate(f.x, f.y);
      if (f.dir < 0) ctx.scale(-1, 1);
      ctx.font = '28px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(f.type.icon, 0, 0);
      ctx.restore();
    });

    window.drawLevelHud(ctx, canvas, {
      level: this.level,
      maxLevel: this.maxLevel,
      goal: `Pești: ${this.caught}/${this.targetFish} · Scor: ${this.score}`
    });
  }

  restart() {
    if (this.canvas) this.init(this.canvas);
  }

  stop() {
    this.running = false;
    if (this.canvas) this.canvas.removeEventListener('pointerdown', this.boundTap);
    window.removeEventListener('resize', this.boundResize);
  }
}

window.hub.registerGame('fishing', new FishingGame());
