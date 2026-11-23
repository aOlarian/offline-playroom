/* MAP
 * §1 endless runner character & obstacles L1-L60
 * §2 jump & duck physics L62-L130
 * §3 drawing & game loop L132-L210
 */

// §1 endless runner character & obstacles
class RunnerGame {
  constructor() {
    this.name = 'Fuga în Junglă 🏃';
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
    this.level = window.progress.getLevel('runner') || 1;
    this.targetDistance = 750 + this.level * 500;
    this.distance = 0;
    this.coins = 0;
    this.speed = 4 + this.level * 0.8;
    this.player = {
      x: 60,
      y: this.groundY - 40,
      w: 36,
      h: 48,
      vy: 0,
      isGrounded: true,
      isDucking: false
    };
    this.obstacles = [];
    this.coinsList = [];
    this.spawnTimer = 0;
    this.running = true;

    canvas.addEventListener('pointerdown', this.boundTap);
    window.addEventListener('resize', this.boundResize);
    window.playroomControls.bindSwipe(canvas, (dir) => {
      if (dir === 'up') this.jump();
      if (dir === 'down') this.duck();
    });

    window.hub.updateScore(0);
    window.voice.say(`Nivelul ${this.level}. Aleargă și sari peste bușteni sau obstacole ca să parcurgi ${this.targetDistance} metri!`);
    this.loop();
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = Math.max(320, rect.width);
    this.canvas.height = Math.max(380, rect.height);
    this.groundY = this.canvas.height * 0.76;
    if (this.player) this.player.y = this.groundY - 48;
  }

  get sp() { return window.gameSpeed.factor('runner'); }

  jump() {
    if (this.player.isGrounded) {
      this.player.vy = -13;
      this.player.isGrounded = false;
      this.player.isDucking = false;
      window.soundManager.playPop(1.5);
    }
  }

  duck() {
    if (this.player.isGrounded) {
      this.player.isDucking = true;
      setTimeout(() => { this.player.isDucking = false; }, 600);
      window.soundManager.playClick();
    }
  }

  // §2 jump & duck physics
  handleTap(event) {
    if (!this.running) return;
    const rect = this.canvas.getBoundingClientRect();
    const y = (event.clientY - rect.top) * this.canvas.width / rect.width;

    if (y < this.canvas.height * 0.6) {
      this.jump();
    } else {
      this.duck();
    }
  }

  updatePhysics() {
    const sp = this.sp;
    this.distance += Math.round(this.speed * 0.25 * sp);
    window.hub.updateScore(this.coins);

    // Gravity
    this.player.y += this.player.vy * sp;
    if (!this.player.isGrounded) {
      this.player.vy += 0.7 * sp;
      if (this.player.y >= this.groundY - (this.player.isDucking ? 24 : 48)) {
        this.player.y = this.groundY - (this.player.isDucking ? 24 : 48);
        this.player.vy = 0;
        this.player.isGrounded = true;
      }
    }

    // Spawn Obstacles & Coins
    this.spawnTimer += 1 * sp;
    if (this.spawnTimer > 75) {
      this.spawnTimer = 0;
      const isHigh = Math.random() < 0.35;
      if (isHigh) {
        // High obstacle (bird / bee)
        this.obstacles.push({ x: this.canvas.width + 20, y: this.groundY - 70, w: 32, h: 26, type: 'bird', icon: '🦅' });
      } else {
        // Ground obstacle (rock / log)
        this.obstacles.push({ x: this.canvas.width + 20, y: this.groundY - 32, w: 32, h: 32, type: 'rock', icon: '🪵' });
      }

      // Spawn Coins
      if (Math.random() < 0.6) {
        this.coinsList.push({ x: this.canvas.width + 70, y: this.groundY - 55, r: 14, collected: false });
      }
    }

    // Move Obstacles
    this.obstacles.forEach((obs) => {
      obs.x -= this.speed * sp;

      // Player Collision Check
      const ph = this.player.isDucking ? 24 : 48;
      const py = this.groundY - ph;
      if (
        this.player.x + 24 > obs.x &&
        this.player.x - 10 < obs.x + obs.w &&
        py + ph > obs.y &&
        py < obs.y + obs.h
      ) {
        this.running = false;
        window.soundManager.playBuzz();
        window.hub.gameOver('runner', {
          title: 'Te-ai împiedicat!',
          message: `Ai alergat ${this.distance} metri. Ținta era ${this.targetDistance} metri. Mai încearcă!`,
          score: this.coins
        });
      }
    });

    // Move Coins
    this.coinsList.forEach((coin) => {
      coin.x -= this.speed * sp;
      if (!coin.collected && Math.hypot(this.player.x + 12 - coin.x, (this.groundY - 24) - coin.y) < 36) {
        coin.collected = true;
        this.coins += 5;
        window.soundManager.playPop(1.7);
        window.confettiManager.start(250);
      }
    });

    // Clean offscreen
    this.obstacles = this.obstacles.filter((obs) => obs.x > -50);
    this.coinsList = this.coinsList.filter((c) => c.x > -50);

    // Win condition
    if (this.distance >= this.targetDistance) {
      this.running = false;
      window.hub.levelComplete('runner', {
        stars: 3,
        score: this.coins,
        title: 'Campionul alergării! 🏃',
        message: `Extraordinar! Ai alergat toți cei ${this.targetDistance} metri și ai adunat ${this.coins} monede!`
      });
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
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Sky
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(0, 0, canvas.width, this.groundY);

    // Ground Grass
    ctx.fillStyle = '#15803d';
    ctx.fillRect(0, this.groundY, canvas.width, canvas.height - this.groundY);
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(0, this.groundY, canvas.width, 12);

    // Player Character
    ctx.font = this.player.isDucking ? '32px sans-serif' : '44px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(this.player.isDucking ? '🦔' : '🏃', this.player.x + 12, this.player.y + (this.player.isDucking ? 24 : 48));

    // Obstacles
    this.obstacles.forEach((obs) => {
      ctx.font = '32px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(obs.icon, obs.x + obs.w / 2, obs.y + obs.h / 2);
    });

    // Coins
    this.coinsList.forEach((coin) => {
      if (!coin.collected) {
        ctx.font = '24px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🪙', coin.x, coin.y);
      }
    });

    // Controls helper buttons at bottom
    ctx.fillStyle = 'rgba(30, 41, 59, 0.7)';
    ctx.beginPath();
    ctx.roundRect(20, canvas.height - 50, canvas.width / 2 - 30, 40, 10);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⬆️ Sari (Sus)', 20 + (canvas.width / 2 - 30) / 2, canvas.height - 25);

    ctx.fillStyle = 'rgba(30, 41, 59, 0.7)';
    ctx.beginPath();
    ctx.roundRect(canvas.width / 2 + 10, canvas.height - 50, canvas.width / 2 - 30, 40, 10);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillText('⬇️ Apleacă-te (Jos)', canvas.width / 2 + 10 + (canvas.width / 2 - 30) / 2, canvas.height - 25);

    window.drawLevelHud(ctx, canvas, {
      level: this.level,
      maxLevel: this.maxLevel,
      goal: `Distanță: ${this.distance}/${this.targetDistance}m · Monede: ${this.coins}`
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

window.hub.registerGame('runner', new RunnerGame());
