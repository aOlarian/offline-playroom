/**
 * Mini Golf 3D - vedere din spatele mingii, teren care se curbeaza si urca-coboara.
 *
 * Nu folosim nicio librarie 3D. Avem un motor mic scris de noi: fiecare colt de
 * teren e un punct in spatiu, il rotim dupa camera, il impartim la departare
 * (asa apare perspectiva) si desenam poligoanele de la cel mai departat spre cel
 * mai apropiat. Asta e tot ce trebuie ca sa se vada ca in realitate.
 *
 * Terenul e o panglica: o linie de mijloc curbata, cu latime. Inaltimea vine din
 * cateva movile; panta trage mingea la vale, exact ca pe iarba adevarata.
 */
const GOLF3D_LEVELS = [
  {
    par: 2, width: 3.2,
    path: [[0, 0], [0, 8], [0, 16], [0, 24]],
    bumps: [], sand: [], water: [], boxes: []
  },
  {
    par: 2, width: 3.0,
    path: [[0, 0], [0, 7], [3, 12], [7, 15], [11, 18], [11, 25]],
    bumps: [], sand: [], water: [], boxes: []
  },
  {
    par: 3, width: 3.0,
    path: [[0, 0], [0, 8], [-4, 13], [-9, 17], [-9, 24], [-9, 30]],
    bumps: [{ t: 0.42, off: 0, amp: 0.9, sigma: 3.0 }],
    sand: [{ t: 0.55, off: 0.75, r: 0.8 }],
    water: [], boxes: []
  },
  {
    par: 3, width: 3.4,
    path: [[0, 0], [0, 9], [0, 18], [0, 27], [0, 34]],
    bumps: [{ t: 0.40, off: 0, amp: 1.4, sigma: 3.2 }, { t: 0.70, off: 0, amp: -0.9, sigma: 3.0 }],
    sand: [{ t: 0.58, off: 0.7, r: 0.85 }],
    water: [], boxes: [{ t: 0.85, off: -0.55, w: 1.1, d: 0.7, h: 0.7 }]
  },
  {
    par: 3, width: 3.0,
    path: [[0, 0], [0, 7], [4, 11], [9, 15], [4, 20], [0, 24], [0, 31]],
    bumps: [{ t: 0.45, off: 0, amp: 1.1, sigma: 3.5 }],
    sand: [{ t: 0.35, off: 0.75, r: 0.85 }],
    water: [{ t: 0.62, off: -0.8, r: 0.6 }], boxes: []
  },
  {
    par: 4, width: 3.2,
    path: [[0, 0], [0, 8], [-3, 14], [-3, 21], [2, 26], [7, 30], [7, 37]],
    bumps: [{ t: 0.45, off: 0, amp: -1.1, sigma: 3.0 }, { t: 0.78, off: 0, amp: 1.2, sigma: 3.4 }],
    sand: [{ t: 0.55, off: -0.7, r: 0.9 }],
    water: [{ t: 0.68, off: 0.82, r: 0.6 }],
    boxes: [{ t: 0.28, off: -0.5, w: 1.0, d: 0.7, h: 0.8 }]
  },
  {
    par: 4, width: 3.0,
    path: [[0, 0], [0, 9], [5, 14], [11, 18], [11, 26], [5, 32], [0, 36], [0, 43]],
    bumps: [{ t: 0.50, off: 0, amp: 1.5, sigma: 3.6 }, { t: 0.85, off: 0, amp: -1.0, sigma: 2.8 }],
    sand: [{ t: 0.33, off: 0.75, r: 0.85 }, { t: 0.92, off: -0.7, r: 0.8 }],
    water: [{ t: 0.62, off: 0.85, r: 0.55 }],
    boxes: [{ t: 0.15, off: -0.5, w: 1.0, d: 0.7, h: 0.8 }]
  },
  {
    par: 4, width: 2.9,
    path: [[0, 0], [0, 8], [-5, 13], [-11, 17], [-11, 25], [-5, 31], [0, 35], [0, 42], [0, 48]],
    bumps: [{ t: 0.45, off: 0, amp: 1.6, sigma: 3.2 }, { t: 0.92, off: 0, amp: 0.8, sigma: 2.6 }],
    sand: [{ t: 0.58, off: -0.7, r: 0.85 }],
    water: [{ t: 0.78, off: 0.85, r: 0.55 }],
    boxes: [{ t: 0.20, off: 0.5, w: 1.0, d: 0.7, h: 0.8 }, { t: 0.50, off: -0.55, w: 0.9, d: 0.8, h: 0.8 }]
  },
  {
    par: 5, width: 2.9,
    path: [[0, 0], [0, 9], [6, 14], [13, 18], [13, 27], [6, 32], [0, 36], [-7, 40], [-7, 48], [0, 53], [0, 60]],
    bumps: [
      { t: 0.35, off: 0, amp: 1.8, sigma: 3.4 },
      { t: 0.72, off: 0, amp: -1.2, sigma: 3.0 },
      { t: 0.94, off: 0, amp: 1.0, sigma: 2.6 }
    ],
    sand: [{ t: 0.25, off: 0.75, r: 0.85 }, { t: 0.76, off: -0.7, r: 0.9 }],
    water: [{ t: 0.55, off: 0.85, r: 0.55 }, { t: 0.88, off: -0.85, r: 0.5 }],
    boxes: [{ t: 0.12, off: -0.5, w: 1.0, d: 0.7, h: 0.8 }, { t: 0.83, off: 0.5, w: 0.9, d: 0.7, h: 0.8 }]
  }
];

class GolfGame {
  constructor() {
    this.name = 'Mini Golf 3D ⛳';
    this.maxLevel = GOLF3D_LEVELS.length;
    this.usesSpeed = true;
    this.running = false;
    this.boundDown = this.onDown.bind(this);
    this.boundMove = this.onMove.bind(this);
    this.boundUp = this.onUp.bind(this);
    this.boundResize = this.resize.bind(this);
  }

  init(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.resize();
    this.running = true;
    this.setupLevel();

    window.addEventListener('resize', this.boundResize);
    this.canvas.addEventListener('pointerdown', this.boundDown);
    window.addEventListener('pointermove', this.boundMove);
    window.addEventListener('pointerup', this.boundUp);
    this.loop();
  }


  /** Factorul de viteza ales pentru jocul asta. */
  get sp() {
    return window.gameSpeed.factor('golf');
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
    // Distanta focala: cat de "aproape" pare lumea. Mai mare = zoom mai puternic.
    this.focal = this.canvas.height * 0.85;
  }

  // ---------- geometria terenului ----------

  /** Curba neteda prin punctele date (Catmull-Rom), esantionata des. */
  buildCenterline(pts, step = 0.4) {
    const P = [pts[0]].concat(pts, [pts[pts.length - 1]]);
    const out = [];
    for (let i = 1; i < P.length - 2; i++) {
      const [p0, p1, p2, p3] = [P[i - 1], P[i], P[i + 1], P[i + 2]];
      const seg = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
      const n = Math.max(2, Math.ceil(seg / step));
      for (let k = 0; k < n; k++) {
        const t = k / n;
        const t2 = t * t;
        const t3 = t2 * t;
        const x = 0.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * t +
          (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 +
          (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3);
        const z = 0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * t +
          (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 +
          (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3);
        out.push({ x, z });
      }
    }
    out.push({ x: pts[pts.length - 1][0], z: pts[pts.length - 1][1] });

    // Normala laterala in fiecare punct, ca sa stim unde sunt marginile.
    for (let i = 0; i < out.length; i++) {
      const a = out[Math.max(0, i - 1)];
      const b = out[Math.min(out.length - 1, i + 1)];
      const dx = b.x - a.x;
      const dz = b.z - a.z;
      const len = Math.hypot(dx, dz) || 1;
      out[i].nx = dz / len;
      out[i].nz = -dx / len;
      out[i].dx = dx / len;
      out[i].dz = dz / len;
    }
    return out;
  }

  /**
   * Muta movilele, nisipul, apa si cutiile din (t, off) in coordonate reale.
   * t = cat la suta din drum, off = cat de lateral (1 = chiar langa bordura).
   * Asa niciun obstacol nu poate ateriza fix pe mijlocul singurului culoar.
   */
  placeFeatures() {
    const at = (f) => {
      const c = this.center[Math.max(0, Math.min(this.center.length - 1, Math.round(f.t * (this.center.length - 1))))];
      const o = (f.off || 0) * (this.half - 0.35);
      return { x: c.x + c.nx * o, z: c.z + c.nz * o };
    };
    const conv = (list) => (list || []).map((f) => Object.assign({}, f, at(f)));
    this.level.bumps = conv(this.level.bumps);
    this.level.sand = conv(this.level.sand);
    this.level.water = conv(this.level.water);
    this.level.boxes = conv(this.level.boxes);
  }

  height(x, z) {
    let h = 0;
    for (const b of this.level.bumps) {
      const d2 = (x - b.x) * (x - b.x) + (z - b.z) * (z - b.z);
      h += b.amp * Math.exp(-d2 / (2 * b.sigma * b.sigma));
    }
    return h;
  }

  /** Panta terenului: cat de tare trage mingea la vale, pe fiecare axa. */
  slope(x, z) {
    let gx = 0;
    let gz = 0;
    for (const b of this.level.bumps) {
      const dx = x - b.x;
      const dz = z - b.z;
      const s2 = b.sigma * b.sigma;
      const e = b.amp * Math.exp(-(dx * dx + dz * dz) / (2 * s2));
      gx += -e * dx / s2;
      gz += -e * dz / s2;
    }
    return { gx, gz };
  }

  /** Cel mai apropiat punct de pe linia de mijloc + cat de lateral e fata de ea. */
  nearestOnPath(x, z) {
    let best = 0;
    let bestD = Infinity;
    for (let i = 0; i < this.center.length; i++) {
      const c = this.center[i];
      const d = (c.x - x) * (c.x - x) + (c.z - z) * (c.z - z);
      if (d < bestD) { bestD = d; best = i; }
    }
    const c = this.center[best];
    const off = (x - c.x) * c.nx + (z - c.z) * c.nz;
    return { i: best, c, off };
  }

  setupLevel() {
    this.levelIndex = Math.min(window.progress.getLevel('golf'), GOLF3D_LEVELS.length) - 1;
    this.level = GOLF3D_LEVELS[this.levelIndex];
    this.center = this.buildCenterline(this.level.path);
    this.half = this.level.width / 2;
    this.placeFeatures();

    const start = this.center[0];
    const end = this.center[this.center.length - 1];
    this.ball = { x: start.x, z: start.z, vx: 0, vz: 0, r: 0.16, spin: 0 };
    this.safe = { x: start.x, z: start.z };
    this.hole = { x: end.x, z: end.z, r: 0.34 };

    this.yaw = Math.atan2(start.dx, start.dz);
    this.camDist = 2.4;
    this.camHeight = 1.35;
    // Negativ = privim in jos. Asa linia orizontului urca spre treimea de sus
    // si terenul umple ecranul, in loc sa vedem mai mult cer decat iarba.
    this.pitch = -0.17;

    this.strokes = 0;
    this.sunk = false;
    this.aiming = false;
    this.power = 0;
    this.flag = 0;
    this.splash = 0;
    window.hub.updateScore(0);

    setTimeout(() => {
      if (!this.running) return;
      window.voice.say('Gaura ' + (this.levelIndex + 1) + '. Par ' + this.level.par +
        '. Trage cu degetul in jos ca sa incarci lovitura si misca stanga-dreapta ca sa tintesti.');
    }, 900);
  }

  get moving() {
    return Math.hypot(this.ball.vx, this.ball.vz) > 0.008;
  }

  // ---------- comenzi ----------

  onDown(e) {
    if (!this.running || this.sunk || this.moving) return;
    const rect = this.canvas.getBoundingClientRect();
    this.drag = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    this.yaw0 = this.yaw;
    this.aiming = true;
    this.power = 0;
  }

  onMove(e) {
    if (!this.aiming) return;
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    // Stanga-dreapta = intorc privirea. In jos = trag crosa inapoi.
    this.yaw = this.yaw0 - (x - this.drag.x) * 0.005;
    this.power = Math.max(0, Math.min(1, (y - this.drag.y) / (this.canvas.height * 0.28)));
  }

  onUp() {
    if (!this.aiming) return;
    this.aiming = false;
    if (this.power < 0.08) return;      // doar s-a uitat in jur, nu a lovit
    const speed = this.power * 0.62;
    this.ball.vx = Math.sin(this.yaw) * speed;
    this.ball.vz = Math.cos(this.yaw) * speed;
    this.strokes++;
    window.hub.updateScore(this.strokes);
    window.soundManager.playPop(1.7);
    this.power = 0;
  }

  // ---------- fizica ----------

  update() {
    const b = this.ball;
    if (this.sunk) { this.flag += 0.05; return; }

    if (this.moving) {
      // La golf incetinim TIMPUL, nu mingea: pasul e mai mic, dar si frecarea
      // se aplica pe masura, deci lovitura ajunge tot atat de departe.
      const sp = this.sp;
      const g = this.slope(b.x, b.z);
      b.vx += g.gx * 0.010 * sp;
      b.vz += g.gz * 0.010 * sp;

      b.x += b.vx * sp;
      b.z += b.vz * sp;
      b.spin += Math.hypot(b.vx, b.vz) * 3 * sp;

      // Marginile panglicii: mingea se loveste de bordura si ricoseaza.
      const np = this.nearestOnPath(b.x, b.z);
      const limit = this.half - b.r;
      if (Math.abs(np.off) > limit) {
        const push = (Math.abs(np.off) - limit) * Math.sign(np.off);
        b.x -= np.c.nx * push;
        b.z -= np.c.nz * push;
        const vn = b.vx * np.c.nx + b.vz * np.c.nz;
        b.vx -= 2 * vn * np.c.nx;
        b.vz -= 2 * vn * np.c.nz;
        b.vx *= 0.72;
        b.vz *= 0.72;
        if (Math.hypot(b.vx, b.vz) > 0.06) window.soundManager.playClick();
      }

      // Capetele terenului: la start e perete, la final e zona gaurii.
      if (np.i === 0) {
        const c = this.center[0];
        const along = (b.x - c.x) * c.dx + (b.z - c.z) * c.dz;
        if (along < 0) {
          b.x -= c.dx * along;
          b.z -= c.dz * along;
          const vd = b.vx * c.dx + b.vz * c.dz;
          b.vx -= 2 * vd * c.dx;
          b.vz -= 2 * vd * c.dz;
          b.vx *= 0.7;
          b.vz *= 0.7;
        }
      }

      for (const box of this.level.boxes) this.collideBox(box);

      const inSand = this.level.sand.some((s) => Math.hypot(b.x - s.x, b.z - s.z) < s.r);
      const fr = Math.pow(inSand ? 0.90 : 0.984, sp);
      b.vx *= fr;
      b.vz *= fr;

      if (this.level.water.some((w) => Math.hypot(b.x - w.x, b.z - w.z) < w.r)) {
        this.splash = 30;
        window.soundManager.playBuzz();
        window.voice.say('Pleosc! Ai cazut in apa. O lovitura in plus.');
        b.x = this.safe.x;
        b.z = this.safe.z;
        b.vx = 0;
        b.vz = 0;
        this.strokes++;
        window.hub.updateScore(this.strokes);
      }

      const dh = Math.hypot(b.x - this.hole.x, b.z - this.hole.z);
      // Prea repede peste gaura = mingea sare peste, ca la golful adevarat.
      if (dh < this.hole.r && Math.hypot(b.vx, b.vz) < 0.16) this.sink();
    } else if (b.vx || b.vz) {
      b.vx = 0;
      b.vz = 0;
      if (!this.level.water.some((w) => Math.hypot(b.x - w.x, b.z - w.z) < w.r)) {
        this.safe = { x: b.x, z: b.z };
      }
      // Dupa ce mingea s-a oprit, intoarcem privirea spre gaura: copilul
      // nu trebuie sa caute singur incotro s-o ia.
      const np = this.nearestOnPath(b.x, b.z);
      const ahead = this.center[Math.min(this.center.length - 1, np.i + 6)];
      this.yaw = Math.atan2(ahead.x - b.x, ahead.z - b.z);
    }

    if (this.splash > 0) this.splash--;
    this.flag += 0.05;
  }

  collideBox(box) {
    const b = this.ball;
    const minX = box.x - box.w / 2;
    const maxX = box.x + box.w / 2;
    const minZ = box.z - box.d / 2;
    const maxZ = box.z + box.d / 2;
    if (b.x + b.r < minX || b.x - b.r > maxX || b.z + b.r < minZ || b.z - b.r > maxZ) return;

    const left = b.x + b.r - minX;
    const right = maxX - (b.x - b.r);
    const front = b.z + b.r - minZ;
    const back = maxZ - (b.z - b.r);
    const m = Math.min(left, right, front, back);
    if (m === left) { b.x = minX - b.r; b.vx = -Math.abs(b.vx) * 0.7; }
    else if (m === right) { b.x = maxX + b.r; b.vx = Math.abs(b.vx) * 0.7; }
    else if (m === front) { b.z = minZ - b.r; b.vz = -Math.abs(b.vz) * 0.7; }
    else { b.z = maxZ + b.r; b.vz = Math.abs(b.vz) * 0.7; }
    window.soundManager.playClick();
  }

  sink() {
    this.sunk = true;
    this.ball.vx = 0;
    this.ball.vz = 0;
    window.soundManager.playChime();
    window.voice.say('Direct in gaura! Bravo!');

    const par = this.level.par;
    const stars = this.strokes <= par ? 3 : this.strokes <= par + 1 ? 2 : 1;
    const verdict = this.strokes < par ? 'Sub par! Extraordinar!'
      : this.strokes === par ? 'Fix par. Perfect!'
      : 'Ai bagat-o! Data viitoare din mai putine lovituri.';

    setTimeout(() => {
      window.hub.levelComplete('golf', {
        stars,
        score: this.strokes,
        title: 'Gaura ' + (this.levelIndex + 1) + ' terminata!',
        message: this.strokes + ' lovituri, par ' + par + '. ' + verdict,
        isLastLevel: this.levelIndex + 1 >= GOLF3D_LEVELS.length
      });
    }, 900);
  }

  // ---------- motorul 3D ----------

  updateCamera() {
    const b = this.ball;
    // Camera sta chiar in spatele mingii, la inaltimea capului unui copil.
    let tx = b.x - Math.sin(this.yaw) * this.camDist;
    let tz = b.z - Math.cos(this.yaw) * this.camDist;

    // Camera trebuie sa ramana DEASUPRA terenului. Daca iese peste bordura,
    // se lipeste de scandura si tot ecranul devine o pata maro; o tragem inauntru.
    const np = this.nearestOnPath(tx, tz);
    const lim = this.half - 0.3;
    if (Math.abs(np.off) > lim) {
      const push = (Math.abs(np.off) - lim) * Math.sign(np.off);
      tx -= np.c.nx * push;
      tz -= np.c.nz * push;
    }
    const ty = this.height(tx, tz) + this.camHeight;

    if (!this.cam) this.cam = { x: tx, y: ty, z: tz };
    // Urmarire lina: camera nu sare, aluneca dupa minge.
    const k = this.moving ? 0.18 : 0.35;
    this.cam.x += (tx - this.cam.x) * k;
    this.cam.y += (ty - this.cam.y) * k;
    this.cam.z += (tz - this.cam.z) * k;
  }

  /** Punct din lume -> punct in fata camerei (x dreapta, y sus, z inainte). */
  toCam(x, y, z) {
    const dx = x - this.cam.x;
    const dy = y - this.cam.y;
    const dz = z - this.cam.z;
    const s = Math.sin(this.yaw);
    const c = Math.cos(this.yaw);
    const cx = dx * c - dz * s;
    const cz = dx * s + dz * c;
    const sp = Math.sin(this.pitch);
    const cp = Math.cos(this.pitch);
    return { x: cx, y: dy * cp - cz * sp, z: dy * sp + cz * cp };
  }

  project(p) {
    return {
      x: this.canvas.width / 2 + (p.x * this.focal) / p.z,
      y: this.canvas.height / 2 - (p.y * this.focal) / p.z
    };
  }

  /** Taie poligonul la planul din fata camerei; fara asta, ce e in spate se rastoarna pe ecran. */
  clipNear(poly) {
    const NEAR = 0.2;
    const out = [];
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i];
      const b = poly[(i + 1) % poly.length];
      const ain = a.z > NEAR;
      const bin = b.z > NEAR;
      if (ain) out.push(a);
      if (ain !== bin) {
        const t = (NEAR - a.z) / (b.z - a.z);
        out.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, z: NEAR });
      }
    }
    return out;
  }

  addPoly(list, pts, color, stroke) {
    const cam = pts.map((p) => this.toCam(p[0], p[1], p[2]));
    if (!cam.some((p) => p.z > 0.2)) return;
    const clipped = this.clipNear(cam);
    if (clipped.length < 3) return;
    let d = 0;
    for (const p of clipped) d += p.z;
    list.push({ pts: clipped.map((p) => this.project(p)), color, stroke, dist: d / clipped.length });
  }

  groundColor(i, col, x, z) {
    for (const w of this.level.water) {
      if (Math.hypot(x - w.x, z - w.z) < w.r) return '#2f7fd0';
    }
    for (const s of this.level.sand) {
      if (Math.hypot(x - s.x, z - s.z) < s.r) return '#e6d29a';
    }
    // Dungi de cosit, ca pe un teren adevarat.
    const stripe = Math.floor(i / 5) % 2 === 0;
    const shade = 1 + this.height(x, z) * 0.10;
    const base = stripe ? [58, 138, 70] : [46, 118, 58];
    const c = base.map((v) => Math.max(0, Math.min(255, Math.round(v * shade))));
    return `rgb(${c[0]},${c[1]},${c[2]})`;
  }

  draw() {
    const ctx = this.ctx;
    const W = this.canvas.width;
    const H = this.canvas.height;

    // Cer si dealuri departate
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#4aa3e8');
    sky.addColorStop(0.55, '#a8d8f5');
    sky.addColorStop(1, '#dbeeff');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    const horizon = H / 2 + Math.tan(this.pitch) * this.focal;
    ctx.fillStyle = '#7fb98a';
    ctx.beginPath();
    ctx.moveTo(0, horizon);
    for (let x = 0; x <= W; x += 40) {
      ctx.lineTo(x, horizon - 18 - Math.sin((x + this.yaw * 200) * 0.01) * 14);
    }
    ctx.lineTo(W, horizon);
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#2b6b3a';
    ctx.fillRect(0, horizon, W, H - horizon);

    const polys = [];
    const COLS = 3;
    const b = this.ball;

    // Panglica de iarba + bordurile ei
    for (let i = 0; i < this.center.length - 1; i++) {
      const a = this.center[i];
      const c = this.center[i + 1];
      if (Math.hypot(a.x - this.cam.x, a.z - this.cam.z) > 42) continue;

      for (let k = 0; k < COLS; k++) {
        const o1 = -this.half + (this.level.width * k) / COLS;
        const o2 = -this.half + (this.level.width * (k + 1)) / COLS;
        const p1 = [a.x + a.nx * o1, 0, a.z + a.nz * o1];
        const p2 = [a.x + a.nx * o2, 0, a.z + a.nz * o2];
        const p3 = [c.x + c.nx * o2, 0, c.z + c.nz * o2];
        const p4 = [c.x + c.nx * o1, 0, c.z + c.nz * o1];
        p1[1] = this.height(p1[0], p1[2]);
        p2[1] = this.height(p2[0], p2[2]);
        p3[1] = this.height(p3[0], p3[2]);
        p4[1] = this.height(p4[0], p4[2]);
        const mx = (p1[0] + p3[0]) / 2;
        const mz = (p1[2] + p3[2]) / 2;
        this.addPoly(polys, [p1, p2, p3, p4], this.groundColor(i, k, mx, mz));
      }

      // Bordurile de lemn, stanga si dreapta
      for (const side of [-1, 1]) {
        const o = side * this.half;
        const ax = a.x + a.nx * o;
        const az = a.z + a.nz * o;
        const cx = c.x + c.nx * o;
        const cz = c.z + c.nz * o;
        // Bucata de bordura lipita de obiectiv ar acoperi tot ecranul.
        if (Math.hypot(ax - this.cam.x, az - this.cam.z) < 0.7) continue;
        const ay = this.height(ax, az);
        const cy = this.height(cx, cz);
        this.addPoly(polys, [
          [ax, ay, az], [cx, cy, cz], [cx, cy + 0.34, cz], [ax, ay + 0.34, az]
        ], side < 0 ? '#8a5a2b' : '#7a4f26');
      }
    }

    // Obstacolele: cutii de lemn
    for (const box of this.level.boxes) {
      // Cand mingea a trecut de cutie, camera ajunge lipita de ea si cutia ar
      // acoperi tot ecranul. Daca e mai aproape decat mingea, n-o mai desenam.
      const bc = this.toCam(box.x, this.height(box.x, box.z), box.z);
      if (bc.z < 1.7) continue;
      const y0 = this.height(box.x, box.z);
      const y1 = y0 + box.h;
      const x0 = box.x - box.w / 2;
      const x1 = box.x + box.w / 2;
      const z0 = box.z - box.d / 2;
      const z1 = box.z + box.d / 2;
      this.addPoly(polys, [[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]], '#c98b4b');
      this.addPoly(polys, [[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0]], '#a06a33');
      this.addPoly(polys, [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], '#a06a33');
      this.addPoly(polys, [[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]], '#8b5a2b');
      this.addPoly(polys, [[x1, y0, z0], [x1, y0, z1], [x1, y1, z1], [x1, y1, z0]], '#8b5a2b');
    }

    // Gaura
    const hy = this.height(this.hole.x, this.hole.z) + 0.01;
    const ring = [];
    for (let a = 0; a < 12; a++) {
      const t = (a / 12) * Math.PI * 2;
      ring.push([this.hole.x + Math.cos(t) * this.hole.r, hy, this.hole.z + Math.sin(t) * this.hole.r]);
    }
    this.addPoly(polys, ring, '#10160f');

    polys.sort((p, q) => q.dist - p.dist);
    for (const p of polys) {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.moveTo(p.pts[0].x, p.pts[0].y);
      for (let i = 1; i < p.pts.length; i++) ctx.lineTo(p.pts[i].x, p.pts[i].y);
      ctx.closePath();
      ctx.fill();
    }

    this.drawFlag(ctx);
    if (!this.sunk) this.drawBall(ctx);
    if (this.aiming || (!this.moving && !this.sunk)) this.drawAim(ctx);

    if (this.splash > 0) {
      ctx.save();
      ctx.globalAlpha = this.splash / 30;
      ctx.fillStyle = '#dbeafe';
      ctx.font = 'bold 26px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('PLEOSC! +1 lovitură', W / 2, H * 0.4);
      ctx.restore();
    }

    window.drawLevelHud(ctx, this.canvas, {
      level: this.levelIndex + 1,
      maxLevel: GOLF3D_LEVELS.length,
      goal: 'Lovituri ' + this.strokes + ' · par ' + this.level.par,
      best: window.progress.getBest('golf') || undefined
    });

    if (!this.moving && !this.sunk && this.strokes === 0) {
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.fillRect(0, H - 44, W, 44);
      ctx.font = 'bold 15px sans-serif';
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.fillText('Trage degetul în jos ca să lovești · stânga-dreapta ca să țintești', W / 2, H - 18);
      ctx.restore();
    }
  }

  drawFlag(ctx) {
    const gy = this.height(this.hole.x, this.hole.z);
    const base = this.toCam(this.hole.x, gy, this.hole.z);
    const top = this.toCam(this.hole.x, gy + 1.5, this.hole.z);
    if (base.z < 0.3 || top.z < 0.3) return;
    const b = this.project(base);
    const t = this.project(top);

    ctx.save();
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = Math.max(1.5, 60 / base.z);
    ctx.beginPath();
    ctx.moveTo(b.x, b.y);
    ctx.lineTo(t.x, t.y);
    ctx.stroke();

    const wav = Math.sin(this.flag) * 6;
    const flagW = Math.max(8, 340 / base.z);
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(t.x, t.y);
    ctx.lineTo(t.x + flagW + wav, t.y + flagW * 0.3);
    ctx.lineTo(t.x, t.y + flagW * 0.62);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  drawBall(ctx) {
    const b = this.ball;
    const y = this.height(b.x, b.z) + b.r;
    const c = this.toCam(b.x, y, b.z);
    if (c.z < 0.25) return;
    const p = this.project(c);
    const r = Math.max(2, (b.r * this.focal) / c.z);

    // Umbra pe iarba
    const sc = this.toCam(b.x, this.height(b.x, b.z) + 0.01, b.z);
    if (sc.z > 0.25) {
      const sp = this.project(sc);
      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = '#0b2413';
      ctx.beginPath();
      ctx.ellipse(sp.x, sp.y, r * 1.05, r * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    const g = ctx.createRadialGradient(p.x - r * 0.35, p.y - r * 0.4, r * 0.1, p.x, p.y, r);
    g.addColorStop(0, '#ffffff');
    g.addColorStop(1, '#c8cdd4');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.fill();

    // Cateva adancituri care se rotesc: se vede ca mingea se rostogoleste.
    if (r > 6) {
      ctx.save();
      ctx.globalAlpha = 0.25;
      ctx.fillStyle = '#64748b';
      for (let i = 0; i < 5; i++) {
        const a = b.spin + (i * Math.PI * 2) / 5;
        ctx.beginPath();
        ctx.arc(p.x + Math.cos(a) * r * 0.45, p.y + Math.sin(a) * r * 0.45, r * 0.13, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  drawAim(ctx) {
    const b = this.ball;
    const pw = this.aiming ? this.power : 0.35;
    const len = 1.0 + pw * 4.5;
    const pts = [];
    for (let i = 0; i <= 10; i++) {
      const d = (i / 10) * len;
      const x = b.x + Math.sin(this.yaw) * d;
      const z = b.z + Math.cos(this.yaw) * d;
      const c = this.toCam(x, this.height(x, z) + 0.03, z);
      if (c.z < 0.3) continue;
      pts.push({ p: this.project(c), t: i / 10 });
    }
    ctx.save();
    for (const q of pts) {
      ctx.globalAlpha = 0.85 - q.t * 0.6;
      ctx.fillStyle = pw > 0.75 ? '#ef4444' : pw > 0.45 ? '#fbbf24' : '#f8fafc';
      ctx.beginPath();
      ctx.arc(q.p.x, q.p.y, Math.max(2, 7 * (1 - q.t * 0.6)), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    if (this.aiming) {
      const W = this.canvas.width;
      const H = this.canvas.height;
      const bw = W * 0.6;
      const bx = (W - bw) / 2;
      const by = H - 78;
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.beginPath();
      ctx.roundRect(bx, by, bw, 18, 9);
      ctx.fill();
      ctx.fillStyle = this.power > 0.75 ? '#ef4444' : this.power > 0.45 ? '#fbbf24' : '#34d399';
      ctx.beginPath();
      ctx.roundRect(bx, by, bw * this.power, 18, 9);
      ctx.fill();
      ctx.font = 'bold 14px sans-serif';
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.fillText('Forța loviturii', W / 2, by - 8);
      ctx.restore();
    }
  }

  loop() {
    if (!this.running) return;
    this.update();
    this.updateCamera();
    this.draw();
    requestAnimationFrame(() => this.loop());
  }

  restart() {
    this.resize();
    this.cam = null;
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

window.hub.registerGame('golf', new GolfGame());
