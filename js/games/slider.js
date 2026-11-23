/* MAP
 * §1 slider puzzle board & scramble L1-L60
 * §2 tile movement & victory check L62-L130
 * §3 drawing & touch controls L132-L200
 */

// §1 slider puzzle board & scramble
const SLIDER_THEMES = [
  { name: 'Animale Vesele 🦁', emojis: ['🦁', '🐯', '🐻', '🐼', '🐨', '🦊', '🐰', '🐵', ''] },
  { name: 'Vehicule Rapide 🚀', emojis: ['🚀', '🏎️', '✈️', '🚁', '🚂', '🚢', '🚜', '🛵', ''] },
  { name: 'Fructe Dulci 🍓', emojis: ['🍎', '🍌', '🍇', '🍓', '🍒', '🍍', '🍉', '🥝', ''] }
];

class SliderPuzzleGame {
  constructor() {
    this.name = 'Puzzle Glisant 🧩';
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
    this.level = window.progress.getLevel('slider') || 1;
    this.theme = SLIDER_THEMES[(this.level - 1) % SLIDER_THEMES.length];
    this.moves = 0;
    this.score = 0;
    this.grid = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8] // 8 is the empty slot
    ];
    this.emptyPos = { r: 2, c: 2 };
    this.scramble();
    this.running = true;

    canvas.addEventListener('pointerdown', this.boundTap);
    window.addEventListener('resize', this.boundResize);

    window.hub.updateScore(0);
    window.voice.say(`Nivelul ${this.level}: ${this.theme.name}. Atinge piesele vecine cu spațiul liber ca să le glisezi în ordinea corectă!`);
    this.loop();
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = Math.max(320, rect.width);
    this.canvas.height = Math.max(380, rect.height);
    this.cell = Math.min((this.canvas.width - 40) / 3, (this.canvas.height - 130) / 3);
    this.ox = (this.canvas.width - this.cell * 3) / 2;
    this.oy = 55;
  }

  scramble() {
    const movesCount = 10 + this.level * 6;
    for (let i = 0; i < movesCount; i++) {
      const neighbors = this.getValidNeighborPositions(this.emptyPos.r, this.emptyPos.c);
      const chosen = neighbors[Math.floor(Math.random() * neighbors.length)];
      this.swapTile(chosen.r, chosen.c, false);
    }
    this.moves = 0;
  }

  getValidNeighborPositions(r, c) {
    const candidates = [
      { r: r - 1, c },
      { r: r + 1, c },
      { r, c: c - 1 },
      { r, c: c + 1 }
    ];
    return candidates.filter((p) => p.r >= 0 && p.r < 3 && p.c >= 0 && p.c < 3);
  }

  // §2 tile movement & victory check
  handleTap(event) {
    if (!this.running) return;
    const rect = this.canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * this.canvas.width / rect.width;
    const y = (event.clientY - rect.top) * this.canvas.height / rect.height;

    const c = Math.floor((x - this.ox) / this.cell);
    const r = Math.floor((y - this.oy) / this.cell);

    if (r >= 0 && r < 3 && c >= 0 && c < 3) {
      if (Math.abs(r - this.emptyPos.r) + Math.abs(c - this.emptyPos.c) === 1) {
        this.swapTile(r, c, true);
      }
    }
  }

  swapTile(r, c, countMove = true) {
    const temp = this.grid[r][c];
    this.grid[r][c] = this.grid[this.emptyPos.r][this.emptyPos.c];
    this.grid[this.emptyPos.r][this.emptyPos.c] = temp;
    this.emptyPos = { r, c };

    if (countMove) {
      this.moves++;
      window.soundManager.playClick();
      this.checkWin();
    }
  }

  checkWin() {
    let win = true;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const expected = r * 3 + c;
        if (this.grid[r][c] !== expected) {
          win = false;
          break;
        }
      }
    }

    if (win) {
      this.running = false;
      this.score = Math.max(50, 200 - this.moves * 5);
      window.hub.levelComplete('slider', {
        stars: this.moves <= 25 ? 3 : this.moves <= 45 ? 2 : 1,
        score: this.score,
        title: 'Puzzle rezolvat! 🧩',
        message: `Superb! Ai aranjat toate piesele în ${this.moves} mutări!`
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
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid container
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(this.ox - 8, this.oy - 8, this.cell * 3 + 16, this.cell * 3 + 16, 16);
    ctx.fill();

    // Tiles
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const val = this.grid[r][c];
        const x = this.ox + c * this.cell;
        const y = this.oy + r * this.cell;

        if (val !== 8) {
          // Normal Tile
          ctx.fillStyle = '#3b82f6';
          ctx.beginPath();
          ctx.roundRect(x + 4, y + 4, this.cell - 8, this.cell - 8, 12);
          ctx.fill();

          ctx.fillStyle = '#60a5fa';
          ctx.beginPath();
          ctx.roundRect(x + 6, y + 6, this.cell - 12, (this.cell - 12) * 0.45, 8);
          ctx.fill();

          // Emoji Icon & Number
          ctx.font = `${Math.round(this.cell * 0.45)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(this.theme.emojis[val], x + this.cell / 2, y + this.cell / 2 - 4);

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 14px sans-serif';
          ctx.fillText((val + 1).toString(), x + 16, y + 16);
        } else {
          // Empty slot
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.roundRect(x + 4, y + 4, this.cell - 8, this.cell - 8, 12);
          ctx.fill();
        }
      }
    }

    window.drawLevelHud(ctx, canvas, {
      level: this.level,
      maxLevel: this.maxLevel,
      goal: `Mutări: ${this.moves} · ${this.theme.name}`
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

window.hub.registerGame('slider', new SliderPuzzleGame());
