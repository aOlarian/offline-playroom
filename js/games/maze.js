/**
 * Labirint - aduna steluțele si iesi pe usa. Labirintul e generat de fiecare data,
 * deci nivelul 3 de azi nu e la fel cu nivelul 3 de maine.
 * Se joaca cu degetul: tragi in directia in care vrei sa mergi.
 */
const MAZE_LEVELS = [
  { cols: 7, rows: 9, stars: 3 },
  { cols: 9, rows: 11, stars: 4 },
  { cols: 11, rows: 13, stars: 5 },
  { cols: 13, rows: 15, stars: 6 },
  { cols: 15, rows: 17, stars: 7 },
  { cols: 17, rows: 21, stars: 8 }
];

class MazeGame {
  constructor() {
    this.name = 'Labirintul Fermecat 🧭';
    this.maxLevel = MAZE_LEVELS.length;
    this.usesSpeed = true;
    this.running = false;
    this.boundDown = this.onDown.bind(this);
    this.boundUp = this.onUp.bind(this);
    this.boundKey = this.onKey.bind(this);
    this.boundResize = this.resize.bind(this);
  }

  init(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.resize();
    this.running = true;
    this.startLevel();
    window.addEventListener('resize', this.boundResize);
    window.addEventListener('keydown', this.boundKey);
    this.canvas.addEventListener('pointerdown', this.boundDown);
    window.addEventListener('pointerup', this.boundUp);
    this.loop();
  }


  /** Factorul de viteza ales pentru jocul asta. */
  get sp() {
    return window.gameSpeed.factor('maze');
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
    if (this.grid) this.layout();
  }

  layout() {
    const top = window.HUD_HEIGHT;
    const availW = this.canvas.width - 16;
    const availH = this.canvas.height - top - 16;
    this.cell = Math.floor(Math.min(availW / this.cols, availH / this.rows));
    this.ox = (this.canvas.width - this.cell * this.cols) / 2;
    this.oy = top + (availH - this.cell * this.rows) / 2 + 8;
  }

  /** Sapare recursiva: pornim dintr-o celula si spargem pereti spre vecini nevizitati. */
  generate() {
    const cols = this.cols;
    const rows = this.rows;
    // Fiecare celula are 4 pereti; ii doboram pe masura ce sapam coridoare.
    const cells = [];
    for (let r = 0; r < rows; r++) {
      cells.push([]);
      for (let c = 0; c < cols; c++) {
        cells[r].push({ n: true, e: true, s: true, w: true, seen: false });
      }
    }

    const stack = [{ r: 0, c: 0 }];
    cells[0][0].seen = true;
    while (stack.length) {
      const cur = stack[stack.length - 1];
      const opts = [];
      if (cur.r > 0 && !cells[cur.r - 1][cur.c].seen) opts.push('n');
      if (cur.r < rows - 1 && !cells[cur.r + 1][cur.c].seen) opts.push('s');
      if (cur.c > 0 && !cells[cur.r][cur.c - 1].seen) opts.push('w');
      if (cur.c < cols - 1 && !cells[cur.r][cur.c + 1].seen) opts.push('e');

      if (!opts.length) { stack.pop(); continue; }
      const dir = opts[Math.floor(Math.random() * opts.length)];
      const d = { n: [-1, 0, 's'], s: [1, 0, 'n'], w: [0, -1, 'e'], e: [0, 1, 'w'] }[dir];
      const nr = cur.r + d[0];
      const nc = cur.c + d[1];
      cells[cur.r][cur.c][dir] = false;
      cells[nr][nc][d[2]] = false;
      cells[nr][nc].seen = true;
      stack.push({ r: nr, c: nc });
    }
    this.grid = cells;
  }

  startLevel() {
    this.levelIndex = Math.min(window.progress.getLevel('maze'), MAZE_LEVELS.length) - 1;
    const cfg = MAZE_LEVELS[this.levelIndex];
    this.cols = cfg.cols;
    this.rows = cfg.rows;
    this.generate();
    this.layout();

    this.player = { r: 0, c: 0, px: 0, pc: 0 };
    this.exit = { r: this.rows - 1, c: this.cols - 1 };

    // Steluțele stau numai in celule departe de start si de iesire.
    this.stars = [];
    const taken = new Set(['0,0', `${this.exit.r},${this.exit.c}`]);
    while (this.stars.length < cfg.stars) {
      const r = Math.floor(Math.random() * this.rows);
      const c = Math.floor(Math.random() * this.cols);
      const key = `${r},${c}`;
      if (taken.has(key)) continue;
      taken.add(key);
      this.stars.push({ r, c, got: false });
    }
    this.collected = 0;
    this.moves = 0;
    window.hub.updateScore(0);
    setTimeout(() => {
      if (this.running) {
        window.voice.say(`Labirintul ${this.levelIndex + 1}. Aduna ${cfg.stars} steluțe si iesi pe usa verde. Trage cu degetul incotro vrei sa mergi.`);
      }
    }, 1000);
  }

  move(dir) {
    if (!this.running) return;
    const cell = this.grid[this.player.r][this.player.c];
    if (cell[dir]) {
      window.soundManager.playBuzz();
      return;
    }
    const d = { n: [-1, 0], s: [1, 0], w: [0, -1], e: [0, 1] }[dir];
    this.player.r += d[0];
    this.player.c += d[1];
    this.moves++;
    window.soundManager.playClick();

    const star = this.stars.find((s) => !s.got && s.r === this.player.r && s.c === this.player.c);
    if (star) {
      star.got = true;
      this.collected++;
      window.hub.updateScore(this.collected);
      window.soundManager.playChime();
      window.voice.say(`${this.collected} steluțe.`);
    }

    if (this.player.r === this.exit.r && this.player.c === this.exit.c) {
      if (this.collected < this.stars.length) {
        window.voice.say(`Mai ai de gasit ${this.stars.length - this.collected} steluțe.`);
      } else {
        this.finish();
      }
    }
  }

  finish() {
    this.running = false;
    const ideal = (this.cols + this.rows) * 2;
    const stars = this.moves <= ideal ? 3 : this.moves <= ideal * 1.8 ? 2 : 1;
    setTimeout(() => window.hub.levelComplete('maze', {
      stars,
      score: this.collected,
      title: `Ai iesit din labirint!`,
      message: `${this.collected} steluțe adunate, din ${this.moves} pasi.`,
      isLastLevel: this.levelIndex + 1 >= MAZE_LEVELS.length
    }), 500);
  }

  onDown(e) {
    const rect = this.canvas.getBoundingClientRect();
    this.swipeFrom = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  onUp(e) {
    if (!this.swipeFrom) return;
    const rect = this.canvas.getBoundingClientRect();
    const dx = e.clientX - rect.left - this.swipeFrom.x;
    const dy = e.clientY - rect.top - this.swipeFrom.y;
    this.swipeFrom = null;
    if (Math.hypot(dx, dy) < 18) return;
    if (Math.abs(dx) > Math.abs(dy)) this.move(dx > 0 ? 'e' : 'w');
    else this.move(dy > 0 ? 's' : 'n');
  }

  onKey(e) {
    const map = { ArrowUp: 'n', ArrowDown: 's', ArrowLeft: 'w', ArrowRight: 'e' };
    if (map[e.key]) { e.preventDefault(); this.move(map[e.key]); }
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const cs = this.cell;
    ctx.save();
    ctx.translate(this.ox, this.oy);

    ctx.fillStyle = '#1e1b4b';
    ctx.fillRect(0, 0, cs * this.cols, cs * this.rows);

    // Iesirea
    ctx.fillStyle = 'rgba(16, 185, 129, 0.35)';
    ctx.fillRect(this.exit.c * cs, this.exit.r * cs, cs, cs);
    ctx.font = `${cs * 0.6}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🚪', this.exit.c * cs + cs / 2, this.exit.r * cs + cs / 2);

    this.stars.forEach((s) => {
      if (s.got) return;
      ctx.font = `${cs * 0.6}px sans-serif`;
      ctx.fillText('⭐', s.c * cs + cs / 2, s.r * cs + cs / 2);
    });

    ctx.strokeStyle = '#8b5cf6';
    ctx.lineWidth = Math.max(2, cs * 0.12);
    ctx.lineCap = 'round';
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const g = this.grid[r][c];
        const x = c * cs;
        const y = r * cs;
        ctx.beginPath();
        if (g.n) { ctx.moveTo(x, y); ctx.lineTo(x + cs, y); }
        if (g.w) { ctx.moveTo(x, y); ctx.lineTo(x, y + cs); }
        if (r === this.rows - 1 && g.s) { ctx.moveTo(x, y + cs); ctx.lineTo(x + cs, y + cs); }
        if (c === this.cols - 1 && g.e) { ctx.moveTo(x + cs, y); ctx.lineTo(x + cs, y + cs); }
        ctx.stroke();
      }
    }

    // Jucatorul aluneca lin spre celula noua
    const step = 0.25 * Math.max(0.35, this.sp);
    this.player.px += (this.player.c - this.player.px) * step;
    this.player.pc += (this.player.r - this.player.pc) * step;
    const playerCenterX = this.player.px * cs + cs / 2;
    const playerCenterY = this.player.pc * cs + cs / 2;

    // Highlight background circle for player visibility
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(playerCenterX, playerCenterY, cs * 0.42, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.font = `${cs * 0.58}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(window.hub.selectedAvatar || '🚀', playerCenterX, playerCenterY + 1);

    ctx.restore();

    window.drawLevelHud(ctx, this.canvas, {
      level: this.levelIndex + 1,
      maxLevel: MAZE_LEVELS.length,
      goal: `⭐ ${this.collected}/${this.stars.length}`,
      progress: this.collected / this.stars.length
    });
  }

  loop() {
    if (!this.running) return;
    this.draw();
    requestAnimationFrame(() => this.loop());
  }

  restart() {
    this.resize();
    this.running = true;
    this.startLevel();
    this.loop();
  }

  stop() {
    this.running = false;
    if (this.canvas) this.canvas.removeEventListener('pointerdown', this.boundDown);
    window.removeEventListener('pointerup', this.boundUp);
    window.removeEventListener('keydown', this.boundKey);
    window.removeEventListener('resize', this.boundResize);
  }
}

window.hub.registerGame('maze', new MazeGame());
