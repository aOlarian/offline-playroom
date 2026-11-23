/* MAP
 * §1 2048 game state & setup L1-L60
 * §2 slide logic & merges L62-L135
 * §3 drawing & controls L137-L210
 */

// §1 2048 game state & setup
const NUM_COLORS = {
  2: '#fef08a',
  4: '#fed7aa',
  8: '#fca5a5',
  16: '#f87171',
  32: '#ef4444',
  64: '#e11d48',
  128: '#fde047',
  256: '#a3e635',
  512: '#4ade80',
  1024: '#22d3ee',
  2048: '#a855f7'
};

class Game2048 {
  constructor() {
    this.name = 'Cifre Magice 2048 🔢';
    this.maxLevel = 6;
    this.usesSpeed = false;
    this.boundTap = this.handleTap.bind(this);
    this.boundResize = this.resize.bind(this);
    this.running = false;
  }

  init(canvas) {
    this.stop();
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.resize();
    this.level = window.progress.getLevel('game2048') || 1;
    this.targetVal = Math.pow(2, 6 + this.level); // lvl 1: 128, lvl 2: 256, lvl 3: 512, etc.
    this.grid = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ];
    this.score = 0;
    this.spawnTile();
    this.spawnTile();
    this.running = true;

    canvas.addEventListener('pointerdown', this.boundTap);
    window.addEventListener('resize', this.boundResize);
    window.playroomControls.bindSwipe(canvas, (dir) => this.move(dir));

    window.hub.updateScore(0);
    window.voice.say(`Nivelul ${this.level}. Unește cifrele egale prin tragere cu degetul până obții numărul ${this.targetVal}!`);
    this.loop();
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = Math.max(320, rect.width);
    this.canvas.height = Math.max(380, rect.height);
    this.cell = Math.min((this.canvas.width - 40) / 4, (this.canvas.height - 150) / 4);
    this.ox = (this.canvas.width - this.cell * 4) / 2;
    this.oy = 45;
  }

  spawnTile() {
    const empty = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (this.grid[r][c] === 0) empty.push({ r, c });
      }
    }
    if (empty.length > 0) {
      const spot = empty[Math.floor(Math.random() * empty.length)];
      this.grid[spot.r][spot.c] = Math.random() < 0.85 ? 2 : 4;
    }
  }

  // §2 slide logic & merges
  move(dir) {
    if (!this.running) return;
    let moved = false;
    const prevGrid = JSON.stringify(this.grid);

    const slideRow = (row) => {
      let arr = row.filter((v) => v !== 0);
      for (let i = 0; i < arr.length - 1; i++) {
        if (arr[i] === arr[i + 1]) {
          arr[i] *= 2;
          this.score += arr[i];
          arr[i + 1] = 0;
        }
      }
      arr = arr.filter((v) => v !== 0);
      while (arr.length < 4) arr.push(0);
      return arr;
    };

    if (dir === 'left') {
      for (let r = 0; r < 4; r++) this.grid[r] = slideRow(this.grid[r]);
    } else if (dir === 'right') {
      for (let r = 0; r < 4; r++) this.grid[r] = slideRow(this.grid[r].reverse()).reverse();
    } else if (dir === 'up') {
      for (let c = 0; c < 4; c++) {
        let col = [this.grid[0][c], this.grid[1][c], this.grid[2][c], this.grid[3][c]];
        col = slideRow(col);
        for (let r = 0; r < 4; r++) this.grid[r][c] = col[r];
      }
    } else if (dir === 'down') {
      for (let c = 0; c < 4; c++) {
        let col = [this.grid[3][c], this.grid[2][c], this.grid[1][c], this.grid[0][c]];
        col = slideRow(col);
        for (let r = 0; r < 4; r++) this.grid[3 - r][c] = col[r];
      }
    }

    if (JSON.stringify(this.grid) !== prevGrid) {
      window.soundManager.playPop(1.1);
      window.hub.updateScore(this.score);
      this.spawnTile();
      this.checkWinOrLoss();
    }
  }

  checkWinOrLoss() {
    let max = 0;
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (this.grid[r][c] > max) max = this.grid[r][c];
      }
    }

    if (max >= this.targetVal) {
      this.running = false;
      window.hub.levelComplete('game2048', {
        stars: 3,
        score: this.score,
        title: 'Ai atins cifra țintă! 🎉',
        message: `Super! Ai format cifra ${this.targetVal}!`
      });
      return;
    }

    // Check if any moves left
    let canMove = false;
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (this.grid[r][c] === 0) canMove = true;
        if (r < 3 && this.grid[r][c] === this.grid[r + 1][c]) canMove = true;
        if (c < 3 && this.grid[r][c] === this.grid[r][c + 1]) canMove = true;
      }
    }

    if (!canMove) {
      this.running = false;
      window.hub.gameOver('game2048', {
        title: 'Nu mai sunt mutări posibile!',
        message: `Scor obținut: ${this.score}. Mai încearcă o dată!`,
        score: this.score
      });
    }
  }

  handleTap(event) {
    const rect = this.canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * this.canvas.width / rect.width;
    const y = (event.clientY - rect.top) * this.canvas.height / rect.height;

    // Virtual D-pad arrows at bottom
    const cy = this.canvas.height - 55;
    if (y < cy - 40) return;

    if (x < this.canvas.width * 0.28) this.move('left');
    else if (x > this.canvas.width * 0.72) this.move('right');
    else if (y < cy) this.move('up');
    else this.move('down');
  }

  // §3 drawing & controls
  loop() {
    if (!this.running) return;
    this.draw();
    requestAnimationFrame(() => this.loop());
  }

  draw() {
    const { ctx, canvas } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background
    ctx.fillStyle = '#1e1b4b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid Container
    ctx.fillStyle = '#312e81';
    ctx.beginPath();
    ctx.roundRect(this.ox - 8, this.oy - 8, this.cell * 4 + 16, this.cell * 4 + 16, 16);
    ctx.fill();

    // Tiles
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const x = this.ox + c * this.cell;
        const y = this.oy + r * this.cell;
        const val = this.grid[r][c];

        ctx.fillStyle = val ? (NUM_COLORS[val] || '#c084fc') : '#3730a3';
        ctx.beginPath();
        ctx.roundRect(x + 3, y + 3, this.cell - 6, this.cell - 6, 12);
        ctx.fill();

        if (val > 0) {
          ctx.fillStyle = val <= 4 ? '#334155' : '#ffffff';
          ctx.font = `bold ${Math.round(this.cell * 0.42)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(val.toString(), x + this.cell / 2, y + this.cell / 2);
        }
      }
    }

    // Virtual D-pad arrows
    const cy = canvas.height - 55;
    [
      ['⬅️', canvas.width * 0.16, cy],
      ['⬆️', canvas.width * 0.5, cy - 25],
      ['➡️', canvas.width * 0.84, cy],
      ['⬇️', canvas.width * 0.5, cy + 25]
    ].forEach(([icon, x, y]) => {
      ctx.fillStyle = 'rgba(99, 102, 241, 0.85)';
      ctx.beginPath();
      ctx.arc(x, y, 26, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = '22px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(icon, x, y + 1);
    });

    window.drawLevelHud(ctx, canvas, {
      level: this.level,
      maxLevel: this.maxLevel,
      goal: `Țintă: ${this.targetVal} · Scor: ${this.score}`
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

window.hub.registerGame('game2048', new Game2048());
