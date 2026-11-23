/* MAP
 * §1 candies setup L1-L60
 * §2 swap mechanics & match 3 cascade L62-L160
 * §3 drawing & touch controls L162-L240
 */

// §1 candies setup
const CANDY_TYPES = [
  { icon: '🍬', color: '#f43f5e' },
  { icon: '🍭', color: '#3b82f6' },
  { icon: '🍫', color: '#d97706' },
  { icon: '🍩', color: '#ec4899' },
  { icon: '🧁', color: '#10b981' },
  { icon: '⭐', color: '#facc15' }
];

class CandiesGame {
  constructor() {
    this.name = 'Bomboane Vesele 🍬';
    this.maxLevel = 8;
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
    this.level = window.progress.getLevel('candies') || 1;
    this.cols = 6;
    this.rows = 6;
    this.typeCount = Math.min(6, 4 + Math.floor(this.level / 3));
    this.board = [];
    this.score = 0;
    this.targetScore = 600 + this.level * 350;
    this.movesLeft = 50 + this.level * 10;
    this.selected = null;
    this.dragStart = null;
    this.animating = false;

    this.initBoard();
    this.running = true;

    canvas.addEventListener('pointerdown', this.boundDown);
    window.addEventListener('pointermove', this.boundMove);
    window.addEventListener('pointerup', this.boundUp);
    window.addEventListener('resize', this.boundResize);

    window.hub.updateScore(0);
    window.voice.say(`Nivelul ${this.level}. Potrivește câte 3 bomboane de același fel trăgând cu degetul! Ținta este ${this.targetScore} puncte.`);
    this.loop();
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = Math.max(320, rect.width);
    this.canvas.height = Math.max(380, rect.height);
    this.cell = Math.min((this.canvas.width - 24) / 6, (this.canvas.height - 110) / 6);
    this.ox = (this.canvas.width - this.cell * 6) / 2;
    this.oy = 55;
  }

  get sp() { return window.gameSpeed.factor('candies'); }

  randomCandy() {
    return Math.floor(Math.random() * this.typeCount);
  }

  initBoard() {
    do {
      this.board = [];
      for (let r = 0; r < this.rows; r++) {
        const row = [];
        for (let c = 0; c < this.cols; c++) {
          row.push(this.randomCandy());
        }
        this.board.push(row);
      }
    } while (this.findMatches().length > 0);
  }

  // §2 swap mechanics & match 3 cascade
  handleDown(event) {
    if (!this.running || this.animating) return;
    const rect = this.canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * this.canvas.width / rect.width;
    const y = (event.clientY - rect.top) * this.canvas.height / rect.height;

    const c = Math.floor((x - this.ox) / this.cell);
    const r = Math.floor((y - this.oy) / this.cell);

    if (r >= 0 && r < this.rows && c >= 0 && c < this.cols) {
      this.selected = { r, c };
      this.dragStart = { x, y, r, c };
    }
  }

  handleMove(event) {
    if (!this.dragStart || this.animating) return;
    const rect = this.canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * this.canvas.width / rect.width;
    const y = (event.clientY - rect.top) * this.canvas.height / rect.height;

    const dx = x - this.dragStart.x;
    const dy = y - this.dragStart.y;
    const threshold = this.cell * 0.45;

    if (Math.abs(dx) > threshold || Math.abs(dy) > threshold) {
      const dirR = Math.abs(dy) > Math.abs(dx) ? (dy > 0 ? 1 : -1) : 0;
      const dirC = Math.abs(dx) >= Math.abs(dy) ? (dx > 0 ? 1 : -1) : 0;
      const targetR = this.dragStart.r + dirR;
      const targetC = this.dragStart.c + dirC;

      if (targetR >= 0 && targetR < this.rows && targetC >= 0 && targetC < this.cols) {
        this.trySwap(this.dragStart.r, this.dragStart.c, targetR, targetC);
      }
      this.dragStart = null;
      this.selected = null;
    }
  }

  handleUp() {
    this.dragStart = null;
  }

  trySwap(r1, c1, r2, c2) {
    this.animating = true;
    const temp = this.board[r1][c1];
    this.board[r1][c1] = this.board[r2][c2];
    this.board[r2][c2] = temp;

    const matches = this.findMatches();
    if (matches.length > 0) {
      this.movesLeft--;
      window.soundManager.playClick();
      this.resolveCascade();
    } else {
      // Revert swap
      setTimeout(() => {
        const rev = this.board[r1][c1];
        this.board[r1][c1] = this.board[r2][c2];
        this.board[r2][c2] = rev;
        this.animating = false;
        window.soundManager.playBuzz();
      }, 250);
    }
  }

  findMatches() {
    const matched = new Set();

    // Horizontal matches
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols - 2; c++) {
        const val = this.board[r][c];
        if (val !== null && val === this.board[r][c + 1] && val === this.board[r][c + 2]) {
          matched.add(`${r},${c}`);
          matched.add(`${r},${c + 1}`);
          matched.add(`${r},${c + 2}`);
        }
      }
    }

    // Vertical matches
    for (let c = 0; c < this.cols; c++) {
      for (let r = 0; r < this.rows - 2; r++) {
        const val = this.board[r][c];
        if (val !== null && val === this.board[r + 1][c] && val === this.board[r + 2][c]) {
          matched.add(`${r},${c}`);
          matched.add(`${r + 1},${c}`);
          matched.add(`${r + 2},${c}`);
        }
      }
    }

    return [...matched].map((k) => k.split(',').map(Number));
  }

  resolveCascade() {
    const matches = this.findMatches();
    if (matches.length === 0) {
      this.animating = false;
      this.checkGameState();
      return;
    }

    // Give points
    this.score += matches.length * 15;
    window.hub.updateScore(this.score);
    window.soundManager.playPop(1.3);
    window.confettiManager.start(400);

    // Clear matched
    matches.forEach(([r, c]) => {
      this.board[r][c] = null;
    });

    // Drop candies down
    setTimeout(() => {
      for (let c = 0; c < this.cols; c++) {
        let writeR = this.rows - 1;
        for (let r = this.rows - 1; r >= 0; r--) {
          if (this.board[r][c] !== null) {
            this.board[writeR][c] = this.board[r][c];
            if (writeR !== r) this.board[r][c] = null;
            writeR--;
          }
        }
        // Fill top with new candies
        while (writeR >= 0) {
          this.board[writeR][c] = this.randomCandy();
          writeR--;
        }
      }
      setTimeout(() => this.resolveCascade(), 220);
    }, 200);
  }

  checkGameState() {
    if (this.score >= this.targetScore) {
      this.running = false;
      window.hub.levelComplete('candies', {
        stars: this.movesLeft >= 6 ? 3 : this.movesLeft >= 2 ? 2 : 1,
        score: this.score,
        title: 'Dulce victorie! 🍭',
        message: `Ai strâns ${this.score} puncte din bomboane delicioase!`
      });
      return;
    }

    if (this.movesLeft <= 0) {
      this.running = false;
      window.hub.gameOver('candies', {
        title: 'S-au terminat mutările!',
        message: `Ai obținut ${this.score} din ${this.targetScore} puncte. Mai încearcă o dată!`,
        score: this.score
      });
    }
  }

  // §3 drawing & touch controls
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

    // Board container
    ctx.fillStyle = '#312e81';
    ctx.beginPath();
    ctx.roundRect(this.ox - 8, this.oy - 8, this.cell * this.cols + 16, this.cell * this.rows + 16, 16);
    ctx.fill();

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const x = this.ox + c * this.cell;
        const y = this.oy + r * this.cell;

        // Tile background
        ctx.fillStyle = (r + c) % 2 ? '#3730a3' : '#4338ca';
        ctx.beginPath();
        ctx.roundRect(x + 2, y + 2, this.cell - 4, this.cell - 4, 10);
        ctx.fill();

        // Selected candy highlight
        if (this.selected && this.selected.r === r && this.selected.c === c) {
          ctx.strokeStyle = '#facc15';
          ctx.lineWidth = 4;
          ctx.stroke();
        }

        // Candy icon
        const typeIdx = this.board[r][c];
        if (typeIdx !== null && CANDY_TYPES[typeIdx]) {
          ctx.font = `${Math.round(this.cell * 0.62)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(CANDY_TYPES[typeIdx].icon, x + this.cell / 2, y + this.cell / 2 + 2);
        }
      }
    }

    window.drawLevelHud(ctx, canvas, {
      level: this.level,
      maxLevel: this.maxLevel,
      goal: `Scor: ${this.score}/${this.targetScore} · Mutări: ${this.movesLeft}`
    });
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

window.hub.registerGame('candies', new CandiesGame());
