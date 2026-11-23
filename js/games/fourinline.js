/**
 * Four in a Line (Connect 4) Game
 */
// Cat de destept e robotul la fiecare nivel.
// blocks = incearca sa opreasca jucătorul, center = prefera coloanele din mijloc,
// trap = evita mutarile care ii dau lui jucătorul o victorie imediata.
const FOUR_LEVELS = [
  { name: 'Robotel', blocks: false, center: false, trap: false },
  { name: 'Robot', blocks: true, center: false, trap: false },
  { name: 'Robot isteț', blocks: true, center: true, trap: false },
  { name: 'Robot ager', blocks: true, center: true, trap: true },
  { name: 'Super Robot', blocks: true, center: true, trap: true }
];

class FourInLineGame {
  constructor() {
    this.name = '4 în Linie 🔴🟡';
    this.maxLevel = FOUR_LEVELS.length;
    this.canvas = null;
    this.ctx = null;
    this.running = false;
    this.rows = 6;
    this.cols = 7;
    this.board = [];
    this.currentPlayer = 1; // 1: jucătorul (Red), 2: Robot (Yellow)
    this.gameOver = false;
    this.boundTouch = this.handleTouch.bind(this);
    this.boundResize = this.resize.bind(this);
  }

  init(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.resize();
    this.running = true;
    this.levelIndex = Math.min(window.progress.getLevel('fourinline'), FOUR_LEVELS.length) - 1;
    this.cfg = FOUR_LEVELS[this.levelIndex];
    this.resetBoard();

    window.addEventListener('resize', this.boundResize);
    setTimeout(() => {
      if (this.running) window.voice.say('Joci cu ' + this.cfg.name + '. Pune patru discuri rosii in linie. Atinge coloana unde vrei sa cada discul.');
    }, 1000);
    this.canvas.addEventListener('pointerdown', this.boundTouch);

    this.loop();
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
  }

  resetBoard() {
    this.board = Array(this.rows).fill(null).map(() => Array(this.cols).fill(0));
    this.currentPlayer = 1;
    this.gameOver = false;
  }

  handleTouch(e) {
    if (!this.running || this.gameOver || this.currentPlayer !== 1) return;
    const rect = this.canvas.getBoundingClientRect();
    const touchX = e.clientX - rect.left;

    const cellSize = Math.min(this.canvas.width / 7.5, (this.canvas.height - 100) / 6.5);
    const boardWidth = cellSize * this.cols;
    const startX = (this.canvas.width - boardWidth) / 2;

    const col = Math.floor((touchX - startX) / cellSize);
    if (col >= 0 && col < this.cols) {
      if (this.dropPiece(col, 1)) {
        window.soundManager.playBoing();
        if (this.checkWin(1)) {
          this.gameOver = true;
          window.soundManager.playFanfare();
          window.confettiManager.start(2500);
          window.voice.say('Patru in linie! Ai castigat!');
          setTimeout(() => window.hub.levelComplete('fourinline', {
            stars: 3,
            score: 1,
            title: 'L-ai batut pe ' + this.cfg.name + '!',
            message: 'Ai pus patru discuri rosii in linie.',
            isLastLevel: this.levelIndex + 1 >= FOUR_LEVELS.length
          }), 900);
          return;
        }
        if (this.isFull()) { this.declareDraw(); return; }

        // Robot AI turn
        this.currentPlayer = 2;
        setTimeout(() => {
          this.makeAiMove();
        }, 600);
      }
    }
  }

  dropPiece(col, player) {
    for (let r = this.rows - 1; r >= 0; r--) {
      if (this.board[r][col] === 0) {
        this.board[r][col] = player;
        return true;
      }
    }
    return false;
  }

  isFull() {
    for (let c = 0; c < this.cols; c++) if (this.canDrop(c)) return false;
    return true;
  }

  declareDraw() {
    this.gameOver = true;
    window.voice.say('Remiza! Tabla s-a umplut.');
    setTimeout(() => window.hub.gameOver('fourinline', {
      title: 'Remiza!',
      message: 'Tabla s-a umplut. Mai jucam o partida.'
    }), 600);
  }

  makeAiMove() {
    if (!this.running || this.gameOver) return;
    // Check if AI can win or block jucătorul
    let chosenCol = -1;
    for (let c = 0; c < this.cols; c++) {
      if (this.canDrop(c)) {
        // Try win
        const r = this.getOpenRow(c);
        this.board[r][c] = 2;
        if (this.checkWin(2)) { chosenCol = c; this.board[r][c] = 0; break; }
        this.board[r][c] = 0;
      }
    }

    if (chosenCol === -1 && this.cfg.blocks) {
      for (let c = 0; c < this.cols; c++) {
        if (this.canDrop(c)) {
          // Block jucătorul
          const r = this.getOpenRow(c);
          this.board[r][c] = 1;
          if (this.checkWin(1)) { chosenCol = c; this.board[r][c] = 0; break; }
          this.board[r][c] = 0;
        }
      }
    }

    if (chosenCol === -1) {
      let validCols = [];
      for (let c = 0; c < this.cols; c++) {
        if (this.canDrop(c)) validCols.push(c);
      }
      if (this.cfg.trap) {
        // Nu pune un disc care ii lasa lui jucătorul victoria chiar deasupra.
        const safe = validCols.filter((c) => {
          const r = this.getOpenRow(c);
          if (r <= 0) return true;
          this.board[r][c] = 2;
          this.board[r - 1][c] = 1;
          const bad = this.checkWin(1);
          this.board[r][c] = 0;
          this.board[r - 1][c] = 0;
          return !bad;
        });
        if (safe.length) validCols = safe;
      }
      if (this.cfg.center) {
        // Mijlocul tablei deschide cele mai multe linii.
        const mid = (this.cols - 1) / 2;
        validCols.sort((a, b) => Math.abs(a - mid) - Math.abs(b - mid));
        chosenCol = validCols[Math.min(validCols.length - 1, Math.floor(Math.random() * 2))];
      } else {
        chosenCol = validCols[Math.floor(Math.random() * validCols.length)];
      }
    }

    if (chosenCol !== undefined && this.dropPiece(chosenCol, 2)) {
      window.soundManager.playPop(1.2);
      if (this.checkWin(2)) {
        this.gameOver = true;
        window.soundManager.playBuzz();
        window.voice.say('Robotul a facut patru in linie. Mai incercam o data.');
        setTimeout(() => window.hub.gameOver('fourinline', {
          title: 'A castigat robotul',
          message: 'Data viitoare ii oprim linia mai devreme.'
        }), 700);
      } else if (this.isFull()) {
        this.declareDraw();
      } else {
        this.currentPlayer = 1;
        window.voice.say('Randul tau.');
      }
    }
  }

  canDrop(col) {
    return this.board[0][col] === 0;
  }

  getOpenRow(col) {
    for (let r = this.rows - 1; r >= 0; r--) {
      if (this.board[r][col] === 0) return r;
    }
    return -1;
  }

  checkWin(p) {
    // Horiz
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols - 3; c++) {
        if (this.board[r][c] === p && this.board[r][c+1] === p && this.board[r][c+2] === p && this.board[r][c+3] === p) return true;
      }
    }
    // Vert
    for (let r = 0; r < this.rows - 3; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.board[r][c] === p && this.board[r+1][c] === p && this.board[r+2][c] === p && this.board[r+3][c] === p) return true;
      }
    }
    // Diag
    for (let r = 0; r < this.rows - 3; r++) {
      for (let c = 0; c < this.cols - 3; c++) {
        if (this.board[r][c] === p && this.board[r+1][c+1] === p && this.board[r+2][c+2] === p && this.board[r+3][c+3] === p) return true;
      }
    }
    for (let r = 3; r < this.rows; r++) {
      for (let c = 0; c < this.cols - 3; c++) {
        if (this.board[r][c] === p && this.board[r-1][c+1] === p && this.board[r-2][c+2] === p && this.board[r-3][c+3] === p) return true;
      }
    }
    return false;
  }

  loop() {
    if (!this.running) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Background
    this.ctx.fillStyle = '#0f172a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Title & Player Turn
    this.ctx.font = 'bold 20px sans-serif';
    this.ctx.fillStyle = this.currentPlayer === 1 ? '#ef4444' : '#facc15';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(this.currentPlayer === 1 ? 'Rândul tău (Roșu) 🔴' : 'Gândește Robotul (Galben) 🤖', this.canvas.width / 2, window.HUD_HEIGHT + 24);

    const cellSize = Math.min(this.canvas.width / 7.5, (this.canvas.height - 100) / 6.5);
    const boardWidth = cellSize * this.cols;
    const boardHeight = cellSize * this.rows;
    const startX = (this.canvas.width - boardWidth) / 2;
    const startY = window.HUD_HEIGHT + 46;

    // Draw Board Background
    this.ctx.fillStyle = '#2563eb';
    this.ctx.beginPath();
    this.ctx.roundRect(startX - 8, startY - 8, boardWidth + 16, boardHeight + 16, 16);
    this.ctx.fill();

    // Draw Slots & Chips
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const cx = startX + c * cellSize + cellSize / 2;
        const cy = startY + r * cellSize + cellSize / 2;
        const val = this.board[r][c];

        this.ctx.beginPath();
        this.ctx.arc(cx, cy, cellSize * 0.4, 0, Math.PI * 2);
        if (val === 0) {
          this.ctx.fillStyle = '#0f172a';
        } else if (val === 1) {
          this.ctx.fillStyle = '#ef4444';
        } else {
          this.ctx.fillStyle = '#facc15';
        }
        this.ctx.fill();
      }
    }

    window.drawLevelHud(this.ctx, this.canvas, {
      level: this.levelIndex + 1,
      maxLevel: FOUR_LEVELS.length,
      goal: 'Adversar: ' + this.cfg.name
    });

    requestAnimationFrame(() => this.loop());
  }

  restart() {
    this.levelIndex = Math.min(window.progress.getLevel('fourinline'), FOUR_LEVELS.length) - 1;
    this.cfg = FOUR_LEVELS[this.levelIndex];
    this.resetBoard();
    this.running = true;
    setTimeout(() => {
      if (this.running) window.voice.say('Joci cu ' + this.cfg.name + '. Randul tau.');
    }, 500);
    this.loop();
  }

  stop() {
    this.running = false;
    if (this.canvas) {
      this.canvas.removeEventListener('pointerdown', this.boundTouch);
    }
    window.removeEventListener('resize', this.boundResize);
  }
}

window.hub.registerGame('fourinline', new FourInLineGame());
