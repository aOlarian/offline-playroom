/* MAP
 * §1 configuration & setup L1-L50
 * §2 mechanics & physics L52-L130
 * §3 drawing & lifecycle L132-L210
 */

// §1 configuration & setup
const BUBBLE_COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

class BubbleShooterGame {
  constructor() {
    this.name = 'Baloane Colorate 🫧';
    this.maxLevel = 8;
    this.usesSpeed = true;
    this.boundDown = this.handleDown.bind(this);
    this.boundResize = this.resize.bind(this);
    this.running = false;
  }

  init(canvas) {
    this.stop();
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.resize();
    this.level = window.progress.getLevel('bubble') || 1;
    this.cols = 10;
    this.rows = 9;
    this.activeColors = BUBBLE_COLORS.slice(0, Math.min(5, 3 + Math.floor(this.level / 3)));
    this.grid = [];
    this.initGrid();
    this.score = 0;
    this.bullet = null;
    this.nextColor = this.randomColor();
    this.newBullet();
    this.running = true;

    canvas.addEventListener('pointerdown', this.boundDown);
    window.addEventListener('resize', this.boundResize);

    window.hub.updateScore(0);
    window.voice.say(`Nivelul ${this.level}. Atinge unde vrei să tragi balonul colorat!`);
    this.loop();
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = Math.max(320, rect.width);
    this.canvas.height = Math.max(380, rect.height);
    this.radius = Math.min(this.canvas.width / (this.cols * 2.1), (this.canvas.height * 0.55) / (this.rows * 2));
  }

  get sp() { return window.gameSpeed.factor('bubble'); }

  randomColor() {
    return this.activeColors[Math.floor(Math.random() * this.activeColors.length)];
  }

  initGrid() {
    this.grid = [];
    for (let r = 0; r < this.rows; r++) {
      const row = [];
      const colsInRow = r % 2 === 1 ? this.cols - 1 : this.cols;
      for (let c = 0; c < colsInRow; c++) {
        if (r < 5 + Math.floor(this.level / 4)) {
          row.push(this.randomColor());
        } else {
          row.push(null);
        }
      }
      this.grid.push(row);
    }
  }

  newBullet() {
    const r = this.radius || 18;
    this.bullet = {
      x: this.canvas.width / 2,
      y: this.canvas.height - 45,
      color: this.nextColor,
      vx: 0,
      vy: 0,
      moving: false,
      radius: r
    };
    this.nextColor = this.randomColor();
  }

  // §2 mechanics & physics
  handleDown(event) {
    if (!this.running || !this.bullet || this.bullet.moving) return;
    const rect = this.canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * this.canvas.width / rect.width;
    const y = (event.clientY - rect.top) * this.canvas.height / rect.height;

    if (y >= this.bullet.y - 10) return;

    const dx = x - this.bullet.x;
    const dy = y - this.bullet.y;
    const dist = Math.hypot(dx, dy);
    const speed = 14 * this.sp;

    this.bullet.vx = (dx / dist) * speed;
    this.bullet.vy = (dy / dist) * speed;
    this.bullet.moving = true;
    window.soundManager.playPop(1.1);
  }

  getBubblePos(r, c) {
    const rad = this.radius || 18;
    const offset = (r % 2 === 1) ? rad : 0;
    const startX = (this.canvas.width - (this.cols * rad * 2)) / 2 + rad;
    return {
      x: startX + c * (rad * 2) + offset,
      y: 40 + r * (rad * 1.75)
    };
  }

  updatePhysics() {
    if (!this.bullet || !this.bullet.moving) return;
    const rad = this.radius || 18;

    this.bullet.x += this.bullet.vx;
    this.bullet.y += this.bullet.vy;

    // Wall bounce
    if (this.bullet.x - rad <= 10) {
      this.bullet.x = 10 + rad;
      this.bullet.vx = Math.abs(this.bullet.vx);
      window.soundManager.playClick();
    } else if (this.bullet.x + rad >= this.canvas.width - 10) {
      this.bullet.x = this.canvas.width - 10 - rad;
      this.bullet.vx = -Math.abs(this.bullet.vx);
      window.soundManager.playClick();
    }

    // Top ceiling hit or grid collision
    let collided = false;
    let targetR = 0;
    let targetC = 0;

    if (this.bullet.y - rad <= 35) {
      collided = true;
      targetR = 0;
      targetC = Math.max(0, Math.min(this.cols - 1, Math.floor((this.bullet.x - (this.canvas.width - (this.cols * rad * 2)) / 2) / (rad * 2))));
    } else {
      for (let r = 0; r < this.grid.length; r++) {
        for (let c = 0; c < this.grid[r].length; c++) {
          if (this.grid[r][c]) {
            const pos = this.getBubblePos(r, c);
            const dist = Math.hypot(this.bullet.x - pos.x, this.bullet.y - pos.y);
            if (dist < rad * 1.75) {
              collided = true;
              const best = this.findClosestEmpty(this.bullet.x, this.bullet.y);
              targetR = best.r;
              targetC = best.c;
              break;
            }
          }
        }
        if (collided) break;
      }
    }

    if (collided) {
      this.placeBulletInGrid(targetR, targetC, this.bullet.color);
    }
  }

  findClosestEmpty(x, y) {
    let bestR = 0, bestC = 0, minDist = Infinity;
    for (let r = 0; r < this.grid.length; r++) {
      for (let c = 0; c < this.grid[r].length; c++) {
        if (!this.grid[r][c]) {
          const pos = this.getBubblePos(r, c);
          const dist = Math.hypot(x - pos.x, y - pos.y);
          if (dist < minDist) {
            minDist = dist;
            bestR = r;
            bestC = c;
          }
        }
      }
    }
    return { r: bestR, c: bestC };
  }

  placeBulletInGrid(r, c, color) {
    if (r >= 0 && r < this.grid.length && c >= 0 && c < this.grid[r].length) {
      this.grid[r][c] = color;
    }

    const matches = this.findMatches(r, c, color);
    if (matches.length >= 3) {
      matches.forEach(([mr, mc]) => {
        this.grid[mr][mc] = null;
      });
      this.score += matches.length * 10;
      window.hub.updateScore(this.score);
      window.soundManager.playFanfare();
      window.confettiManager.start(500);
      this.removeFloatingBubbles();
    } else {
      window.soundManager.playPop(0.9);
    }

    const totalRemaining = this.grid.flat().filter(Boolean).length;
    if (totalRemaining === 0) {
      this.running = false;
      window.hub.levelComplete('bubble', {
        stars: 3,
        score: this.score,
        title: 'Victorie!',
        message: 'Ai spart toate baloanele colorate!'
      });
      return;
    }

    const bottomHasBubble = this.grid[this.grid.length - 1].some(Boolean);
    if (bottomHasBubble) {
      this.running = false;
      window.hub.gameOver('bubble', {
        title: 'Baloanele au coborât prea jos!',
        message: 'Mai încearcă o dată. Sparge grupurile mari de aceeași culoare!',
        score: this.score
      });
      return;
    }

    this.newBullet();
  }

  findMatches(startR, startC, color) {
    const visited = new Set();
    const matches = [];
    const queue = [[startR, startC]];
    visited.add(`${startR},${startC}`);

    while (queue.length > 0) {
      const [r, c] = queue.shift();
      if (this.grid[r] && this.grid[r][c] === color) {
        matches.push([r, c]);
        const neighbors = this.getNeighbors(r, c);
        for (const [nr, nc] of neighbors) {
          const key = `${nr},${nc}`;
          if (!visited.has(key) && this.grid[nr] && this.grid[nr][nc] === color) {
            visited.add(key);
            queue.push([nr, nc]);
          }
        }
      }
    }
    return matches;
  }

  getNeighbors(r, c) {
    const isOdd = r % 2 === 1;
    const offsets = isOdd
      ? [[-1, 0], [-1, 1], [0, -1], [0, 1], [1, 0], [1, 1]]
      : [[-1, -1], [-1, 0], [0, -1], [0, 1], [1, -1], [1, 0]];
    const neighbors = [];
    for (const [dr, dc] of offsets) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < this.grid.length && nc >= 0 && nc < this.grid[nr].length) {
        neighbors.push([nr, nc]);
      }
    }
    return neighbors;
  }

  removeFloatingBubbles() {
    const connected = new Set();
    const queue = [];

    for (let c = 0; c < this.grid[0].length; c++) {
      if (this.grid[0][c]) {
        connected.add(`0,${c}`);
        queue.push([0, c]);
      }
    }

    while (queue.length > 0) {
      const [r, c] = queue.shift();
      for (const [nr, nc] of this.getNeighbors(r, c)) {
        const key = `${nr},${nc}`;
        if (!connected.has(key) && this.grid[nr] && this.grid[nr][nc]) {
          connected.add(key);
          queue.push([nr, nc]);
        }
      }
    }

    for (let r = 0; r < this.grid.length; r++) {
      for (let c = 0; c < this.grid[r].length; c++) {
        if (this.grid[r][c] && !connected.has(`${r},${c}`)) {
          this.grid[r][c] = null;
          this.score += 15;
        }
      }
    }
    window.hub.updateScore(this.score);
  }

  // §3 drawing & lifecycle
  loop() {
    if (!this.running) return;
    this.updatePhysics();
    this.draw();
    requestAnimationFrame(() => this.loop());
  }

  draw() {
    const { ctx, canvas } = this;
    const rad = this.radius || 18;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#334155';
    ctx.fillRect(0, 32, canvas.width, 6);

    for (let r = 0; r < this.grid.length; r++) {
      for (let c = 0; c < this.grid[r].length; c++) {
        const color = this.grid[r][c];
        if (color) {
          const pos = this.getBubblePos(r, c);
          this.drawBubble(pos.x, pos.y, rad - 2, color);
        }
      }
    }

    const shooterX = canvas.width / 2;
    const shooterY = canvas.height - 45;
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(shooterX, shooterY, rad * 1.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Următor:', shooterX - rad * 2.5, shooterY - 5);
    if (this.nextColor) {
      this.drawBubble(shooterX - rad * 2.5, shooterY + 12, rad * 0.65, this.nextColor);
    }

    if (this.bullet) {
      this.drawBubble(this.bullet.x, this.bullet.y, rad - 2, this.bullet.color);
    }

    window.drawLevelHud(ctx, canvas, {
      level: this.level,
      maxLevel: this.maxLevel,
      goal: `Scor: ${this.score}`
    });
  }

  drawBubble(x, y, r, color) {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x - r * 0.3, y - r * 0.3, r * 0.35, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.fill();

    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  restart() {
    if (this.canvas) this.init(this.canvas);
  }

  stop() {
    this.running = false;
    if (this.canvas) this.canvas.removeEventListener('pointerdown', this.boundDown);
    window.removeEventListener('resize', this.boundResize);
  }
}

window.hub.registerGame('bubble', new BubbleShooterGame());
