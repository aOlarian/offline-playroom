/**
 * Puzzle adevarat: o poza intreaga, taiata in piese cu urechi si scobituri.
 * Fiecare piesa poarta bucata ei de imagine, nu poza toata.
 *
 * Poza e desenata de noi pe un canvas ascuns (zero fisiere externe, merge in avion),
 * apoi fiecare piesa o decupeaza cu clip() dupa conturul ei de puzzle.
 */
const PUZZLE_SCENES = [
  {
    name: 'Leul din savana',
    hero: '🦁',
    sky: ['#fbbf24', '#f97316'],
    ground: '#c2410c',
    props: ['🌿', '🌵', '🦓']
  },
  {
    name: 'Racheta spre stele',
    hero: '🚀',
    sky: ['#1e1b4b', '#4c1d95'],
    ground: '#312e81',
    props: ['⭐', '🪐', '☄️']
  },
  {
    name: 'Dinozaurul din jungla',
    hero: '🦖',
    sky: ['#34d399', '#065f46'],
    ground: '#14532d',
    props: ['🌴', '🌋', '🥚']
  },
  {
    name: 'Balena din ocean',
    hero: '🐋',
    sky: ['#38bdf8', '#0369a1'],
    ground: '#0c4a6e',
    props: ['🐠', '🐙', '🪸']
  },
  {
    name: 'Trenul de munte',
    hero: '🚂',
    sky: ['#93c5fd', '#1d4ed8'],
    ground: '#475569',
    props: ['🌲', '⛰️', '🏠']
  },
  {
    name: 'Unicornul din nori',
    hero: '🦄',
    sky: ['#f9a8d4', '#a855f7'],
    ground: '#7e22ce',
    props: ['☁️', '🌈', '✨']
  }
];

const PUZZLE_GRIDS = [
  { cols: 2, rows: 2 },
  { cols: 3, rows: 2 },
  { cols: 3, rows: 3 },
  { cols: 4, rows: 3 },
  { cols: 4, rows: 4 },
  { cols: 5, rows: 4 },
  { cols: 5, rows: 5 },
  { cols: 6, rows: 5 }
];

class PuzzleGame {
  constructor() {
    this.name = 'Puzzle cu Poze 🧩';
    this.maxLevel = PUZZLE_GRIDS.length;
    this.canvas = null;
    this.ctx = null;
    this.running = false;
    this.pieces = [];
    this.dragging = null;
    this.boundDown = this.onDown.bind(this);
    this.boundMove = this.onMove.bind(this);
    this.boundUp = this.onUp.bind(this);
    this.boundResize = this.onResize.bind(this);
  }

  init(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.resizeCanvas();
    this.running = true;
    this.setupLevel();

    window.addEventListener('resize', this.boundResize);
    this.canvas.addEventListener('pointerdown', this.boundDown);
    window.addEventListener('pointermove', this.boundMove);
    window.addEventListener('pointerup', this.boundUp);
    this.loop();
  }

  resizeCanvas() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
  }

  onResize() {
    this.resizeCanvas();
    this.setupLevel();
  }

  /** Deseneaza poza pe un canvas ascuns, de unde piesele isi vor decupa bucatile. */
  paintScene(scene, w, h) {
    const off = document.createElement('canvas');
    off.width = w;
    off.height = h;
    const c = off.getContext('2d');

    const sky = c.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, scene.sky[0]);
    sky.addColorStop(1, scene.sky[1]);
    c.fillStyle = sky;
    c.fillRect(0, 0, w, h);

    // Soare / luna
    c.fillStyle = 'rgba(255,255,255,0.35)';
    c.beginPath();
    c.arc(w * 0.8, h * 0.18, w * 0.09, 0, Math.PI * 2);
    c.fill();

    // Dealuri
    c.fillStyle = 'rgba(0,0,0,0.18)';
    c.beginPath();
    c.moveTo(0, h * 0.72);
    c.quadraticCurveTo(w * 0.25, h * 0.52, w * 0.5, h * 0.7);
    c.quadraticCurveTo(w * 0.78, h * 0.86, w, h * 0.64);
    c.lineTo(w, h);
    c.lineTo(0, h);
    c.closePath();
    c.fill();

    c.fillStyle = scene.ground;
    c.beginPath();
    c.moveTo(0, h * 0.82);
    c.quadraticCurveTo(w * 0.5, h * 0.72, w, h * 0.84);
    c.lineTo(w, h);
    c.lineTo(0, h);
    c.closePath();
    c.fill();

    // Decoruri marunte, ca fiecare piesa sa aiba ceva de recunoscut
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    const spots = [
      { x: 0.12, y: 0.3 }, { x: 0.88, y: 0.45 }, { x: 0.2, y: 0.85 },
      { x: 0.78, y: 0.88 }, { x: 0.5, y: 0.22 }, { x: 0.32, y: 0.55 },
      { x: 0.68, y: 0.62 }, { x: 0.06, y: 0.6 }
    ];
    spots.forEach((s, i) => {
      c.font = `${w * (0.07 + (i % 3) * 0.015)}px sans-serif`;
      c.fillText(scene.props[i % scene.props.length], w * s.x, h * s.y);
    });

    // Eroul, mare in mijloc
    c.font = `${Math.min(w, h) * 0.42}px sans-serif`;
    c.fillText(scene.hero, w * 0.5, h * 0.55);

    return off;
  }

  /** Un contur de piesa: latura dreapta cand d=0, cu ureche/scobitura cand d=±1. */
  edge(path, ax, ay, bx, by, d) {
    const dx = bx - ax;
    const dy = by - ay;
    const len = Math.hypot(dx, dy);
    const ux = dx / len;
    const uy = dy / len;
    const nx = uy;
    const ny = -ux;
    const P = (t, o) => [ax + ux * len * t + nx * len * o, ay + uy * len * t + ny * len * o];

    if (!d) {
      path.lineTo(bx, by);
      return;
    }
    path.lineTo(...P(0.4, 0));
    path.bezierCurveTo(...P(0.30, 0.10 * d), ...P(0.28, 0.34 * d), ...P(0.5, 0.34 * d));
    path.bezierCurveTo(...P(0.72, 0.34 * d), ...P(0.70, 0.10 * d), ...P(0.6, 0));
    path.lineTo(bx, by);
  }

  setupLevel() {
    const lvl = Math.min(window.progress.getLevel('puzzle'), PUZZLE_GRIDS.length);
    this.levelIndex = lvl - 1;
    const grid = PUZZLE_GRIDS[this.levelIndex];
    this.scene = PUZZLE_SCENES[this.levelIndex % PUZZLE_SCENES.length];
    this.cols = grid.cols;
    this.rows = grid.rows;

    const top = window.HUD_HEIGHT;
    const playW = this.canvas.width;
    const playH = this.canvas.height - top;
    const sideBySide = playW > playH * 1.15;

    // Tabla ocupa o parte, restul e tava cu piese amestecate.
    const boardMaxW = sideBySide ? playW * 0.54 : playW * 0.92;
    const boardMaxH = sideBySide ? playH * 0.88 : playH * 0.56;
    const cell = Math.min(boardMaxW / this.cols, boardMaxH / this.rows);
    const boardW = cell * this.cols;
    const boardH = cell * this.rows;

    this.board = {
      x: sideBySide ? playW * 0.04 : (playW - boardW) / 2,
      y: sideBySide ? top + (playH - boardH) / 2 : top + 12,
      w: boardW,
      h: boardH,
      cell
    };
    this.tray = sideBySide
      ? { x: this.board.x + boardW + playW * 0.05, y: top + 10, w: playW - (this.board.x + boardW) - playW * 0.08, h: playH - 20 }
      : { x: 10, y: this.board.y + boardH + 14, w: playW - 20, h: playH - boardH - 34 };

    this.image = this.paintScene(this.scene, Math.round(boardW), Math.round(boardH));

    // Directia fiecarei laturi comune, ca doua piese vecine sa se imbine.
    const H = [];
    for (let r = 0; r <= this.rows; r++) {
      H.push([]);
      for (let c = 0; c < this.cols; c++) {
        H[r].push(r === 0 || r === this.rows ? 0 : (Math.random() < 0.5 ? -1 : 1));
      }
    }
    const V = [];
    for (let r = 0; r < this.rows; r++) {
      V.push([]);
      for (let c = 0; c <= this.cols; c++) {
        V[r].push(c === 0 || c === this.cols ? 0 : (Math.random() < 0.5 ? -1 : 1));
      }
    }

    this.pieces = [];
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const p = new Path2D();
        p.moveTo(0, 0);
        this.edge(p, 0, 0, cell, 0, H[r][c]);                 // sus
        this.edge(p, cell, 0, cell, cell, V[r][c + 1]);       // dreapta
        this.edge(p, cell, cell, 0, cell, -H[r + 1][c]);      // jos (parcursa invers)
        this.edge(p, 0, cell, 0, 0, -V[r][c]);                // stanga (parcursa invers)
        p.closePath();

        this.pieces.push({
          r, c, path: p,
          srcX: c * cell, srcY: r * cell,
          targetX: this.board.x + c * cell,
          targetY: this.board.y + r * cell,
          x: 0, y: 0,
          placed: false
        });
      }
    }

    this.scatter();
    this.snapDist = Math.max(18, cell * 0.38);
    this.placedCount = 0;
    this.moves = 0;
    window.hub.updateScore(0);
    setTimeout(() => {
      window.voice.say(`${this.scene.name}. ${this.pieces.length} piese. Trage fiecare bucata la locul ei.`);
    }, 900);
  }

  scatter() {
    const t = this.tray;
    const cell = this.board.cell;
    const shuffled = this.pieces.slice().sort(() => Math.random() - 0.5);
    // Asezare pe randuri in tava, ca piesele sa nu se ascunda complet una sub alta.
    const perRow = Math.max(1, Math.floor(t.w / (cell * 0.78)));
    shuffled.forEach((p, i) => {
      const col = i % perRow;
      const row = Math.floor(i / perRow);
      const stepX = t.w / perRow;
      const stepY = Math.max(cell * 0.55, (t.h - cell) / Math.max(1, Math.ceil(shuffled.length / perRow)));
      p.x = t.x + col * stepX + (stepX - cell) / 2 + (Math.random() - 0.5) * 8;
      p.y = t.y + row * stepY + (Math.random() - 0.5) * 6;
      p.y = Math.min(p.y, t.y + t.h - cell * 0.9);
    });
    // Ordinea de desenare: ultima pusa e deasupra.
    this.pieces = shuffled;
  }

  pointerPos(e) {
    const rect = this.canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  onDown(e) {
    if (!this.running) return;
    const pt = this.pointerPos(e);
    for (let i = this.pieces.length - 1; i >= 0; i--) {
      const p = this.pieces[i];
      if (p.placed) continue;
      if (this.ctx.isPointInPath(p.path, pt.x - p.x, pt.y - p.y)) {
        this.dragging = p;
        this.dragDX = pt.x - p.x;
        this.dragDY = pt.y - p.y;
        this.pieces.splice(i, 1);
        this.pieces.push(p);
        window.soundManager.playPop(1.5);
        return;
      }
    }
  }

  onMove(e) {
    if (!this.dragging) return;
    const pt = this.pointerPos(e);
    this.dragging.x = pt.x - this.dragDX;
    this.dragging.y = pt.y - this.dragDY;
  }

  onUp() {
    if (!this.dragging) return;
    const p = this.dragging;
    this.dragging = null;
    this.moves++;

    if (Math.hypot(p.x - p.targetX, p.y - p.targetY) < this.snapDist) {
      p.x = p.targetX;
      p.y = p.targetY;
      p.placed = true;
      p.pop = 10;
      this.placedCount++;
      window.hub.updateScore(this.placedCount);
      window.soundManager.playBoing();
      if (this.placedCount === this.pieces.length) this.finish();
      else if (this.placedCount % 3 === 0) window.voice.praise();
    } else {
      window.soundManager.playClick();
    }
  }

  finish() {
    this.running = false;
    const perfect = this.pieces.length;
    // Trei steluțe daca aproape fiecare mutare a nimerit locul potrivit.
    const stars = this.moves <= perfect * 1.3 ? 3 : this.moves <= perfect * 2 ? 2 : 1;
    setTimeout(() => {
      window.hub.levelComplete('puzzle', {
        stars,
        score: this.placedCount,
        title: `${this.scene.name} — gata!`,
        message: `${this.cols}x${this.rows} piese, din ${this.moves} mutari.`,
        isLastLevel: this.levelIndex + 1 >= PUZZLE_GRIDS.length
      });
    }, 500);
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.fillStyle = '#151233';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Poza palida pe tabla = ajutorul care arata unde vine fiecare bucata.
    ctx.save();
    ctx.globalAlpha = 0.16;
    ctx.drawImage(this.image, this.board.x, this.board.y, this.board.w, this.board.h);
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 8]);
    ctx.strokeRect(this.board.x, this.board.y, this.board.w, this.board.h);
    ctx.restore();

    // Zona de tava
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.tray.x, this.tray.y, this.tray.w, this.tray.h);
    ctx.restore();

    for (const p of this.pieces) {
      ctx.save();
      ctx.translate(p.x, p.y);
      if (p.pop) {
        const s = 1 + p.pop / 60;
        ctx.translate(this.board.cell / 2, this.board.cell / 2);
        ctx.scale(s, s);
        ctx.translate(-this.board.cell / 2, -this.board.cell / 2);
        p.pop--;
      }

      ctx.save();
      ctx.clip(p.path);
      ctx.drawImage(this.image, -p.srcX, -p.srcY);
      ctx.restore();

      ctx.strokeStyle = p.placed ? 'rgba(253, 224, 71, 0.55)' : 'rgba(255,255,255,0.75)';
      ctx.lineWidth = p.placed ? 1.5 : 2;
      ctx.stroke(p.path);

      if (!p.placed) {
        ctx.save();
        ctx.globalAlpha = 0.25;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 4;
        ctx.stroke(p.path);
        ctx.restore();
      }
      ctx.restore();
    }

    // Poza intreaga, mica, in colt: asa stie jucătorul ce construieste.
    const pw = Math.min(90, this.canvas.width * 0.2);
    const ph = pw * (this.board.h / this.board.w);
    ctx.save();
    ctx.globalAlpha = 0.95;
    ctx.drawImage(this.image, this.canvas.width - pw - 10, this.canvas.height - ph - 10, pw, ph);
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.canvas.width - pw - 10, this.canvas.height - ph - 10, pw, ph);
    ctx.restore();

    window.drawLevelHud(ctx, this.canvas, {
      level: this.levelIndex + 1,
      maxLevel: PUZZLE_GRIDS.length,
      goal: `${this.scene.name} · ${this.placedCount}/${this.pieces.length}`,
      progress: this.placedCount / this.pieces.length
    });
  }

  loop() {
    if (!this.running) return;
    this.draw();
    requestAnimationFrame(() => this.loop());
  }

  restart() {
    this.resizeCanvas();
    this.setupLevel();
    this.running = true;
    this.loop();
  }

  stop() {
    this.running = false;
    if (this.canvas) this.canvas.removeEventListener('pointerdown', this.boundDown);
    window.removeEventListener('pointermove', this.boundMove);
    window.removeEventListener('pointerup', this.boundUp);
    window.removeEventListener('resize', this.boundResize);
  }
}

window.hub.registerGame('puzzle', new PuzzleGame());
