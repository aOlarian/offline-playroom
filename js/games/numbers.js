/**
 * Numara si Invata - 8 niveluri: numarat, apoi adunare si scadere.
 * Fiecare intrebare se aude in romana; butonul de difuzor o repeta.
 */
const NUMBERS_LEVELS = [
  { kind: 'count', max: 3, options: 3, need: 18 },
  { kind: 'count', max: 5, options: 3, need: 22 },
  { kind: 'count', max: 8, options: 3, need: 24 },
  { kind: 'count', max: 10, options: 4, need: 25 },
  { kind: 'count', max: 12, options: 4, need: 28, mixed: true },
  { kind: 'add', max: 5, options: 3, need: 24 },
  { kind: 'add', max: 10, options: 4, need: 28 },
  { kind: 'sub', max: 10, options: 4, need: 28 }
];

class NumbersGame {
  constructor() {
    this.name = 'Numără & Învață 🔢';
    this.maxLevel = NUMBERS_LEVELS.length;
    this.emojis = ['🍎', '🦁', '⭐', '🎈', '🚗', '🍌', '🦖', '🐶', '🐟', '🌸'];
    this.running = false;
    this.boundTouch = this.onTouch.bind(this);
    this.boundResize = this.resize.bind(this);
  }

  init(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.resize();
    this.running = true;
    this.startLevel();
    window.addEventListener('resize', this.boundResize);
    this.canvas.addEventListener('pointerdown', this.boundTouch);
    this.loop();
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
  }

  startLevel() {
    this.levelIndex = Math.min(window.progress.getLevel('numbers'), NUMBERS_LEVELS.length) - 1;
    this.cfg = NUMBERS_LEVELS[this.levelIndex];
    this.correct = 0;
    this.mistakes = 0;
    this.lives = 3;
    this.feedback = null;
    window.hub.updateScore(0);
    this.nextQuestion(1200);
  }

  nextQuestion(delay = 0) {
    const cfg = this.cfg;
    const pick = () => this.emojis[Math.floor(Math.random() * this.emojis.length)];

    if (cfg.kind === 'count') {
      this.answer = Math.floor(Math.random() * cfg.max) + 1;
      this.emoji = pick();
      this.decoy = cfg.mixed ? pick() : null;
      this.decoyCount = cfg.mixed ? Math.floor(Math.random() * 4) + 1 : 0;
      this.question = `Câte ${this.emoji} vezi?`;
      this.spoken = `Câte ${this.emojiName(this.emoji)} vezi pe ecran?`;
      // Asezarea se fixeaza acum, o data pe intrebare: altfel obiectele ar sari
      // pe ecran la fiecare cadru si copilul nu ar mai putea numara.
      this.items = [];
      for (let i = 0; i < this.answer; i++) this.items.push(this.emoji);
      for (let i = 0; i < this.decoyCount; i++) this.items.push(this.decoy);
      this.items.sort(() => Math.random() - 0.5);
    } else if (cfg.kind === 'add') {
      const a = Math.floor(Math.random() * (cfg.max - 1)) + 1;
      const b = Math.floor(Math.random() * (cfg.max - a)) + 1;
      this.a = a; this.b = b;
      this.answer = a + b;
      this.emoji = pick();
      this.question = `${a} + ${b} = ?`;
      this.spoken = `Cât fac ${a} plus ${b}?`;
    } else {
      const a = Math.floor(Math.random() * (cfg.max - 1)) + 2;
      const b = Math.floor(Math.random() * (a - 1)) + 1;
      this.a = a; this.b = b;
      this.answer = a - b;
      this.emoji = pick();
      this.question = `${a} − ${b} = ?`;
      this.spoken = `Cât fac ${a} minus ${b}?`;
    }

    const set = new Set([this.answer]);
    const span = Math.max(cfg.max, this.answer + 2);
    while (set.size < cfg.options) {
      const v = Math.max(0, this.answer + Math.floor(Math.random() * 7) - 3);
      if (v <= span) set.add(v);
    }
    this.options = Array.from(set).sort(() => Math.random() - 0.5);

    setTimeout(() => {
      if (this.running) window.voice.say(this.spoken);
    }, delay);
  }

  emojiName(e) {
    const names = { '🍎': 'mere', '🦁': 'lei', '⭐': 'stele', '🎈': 'baloane', '🚗': 'mașini',
      '🍌': 'banane', '🦖': 'dinozauri', '🐶': 'cățeluși', '🐟': 'peștișori', '🌸': 'floricele' };
    return names[e] || 'obiecte';
  }

  buttonRects() {
    const n = this.options.length;
    const w = Math.min(96, (this.canvas.width - 40) / n - 12);
    const h = 76;
    const y = this.canvas.height - h - 28;
    const totalW = n * w + (n - 1) * 14;
    const x0 = (this.canvas.width - totalW) / 2;
    return this.options.map((val, i) => ({ val, x: x0 + i * (w + 14), y, w, h }));
  }

  onTouch(e) {
    if (!this.running) return;
    const rect = this.canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    if (window.hitSpeaker(this.speaker, px, py)) {
      window.voice.say(this.spoken);
      return;
    }
    if (this.feedback) return;

    for (const b of this.buttonRects()) {
      if (px >= b.x && px <= b.x + b.w && py >= b.y && py <= b.y + b.h) {
        this.answerGiven(b.val);
        return;
      }
    }
  }

  answerGiven(val) {
    if (val === this.answer) {
      this.correct++;
      window.hub.updateScore(this.correct);
      this.feedback = { ok: true, val, t: 40 };
      window.soundManager.playChime();
      window.confettiManager.start(700);
      window.voice.say(`${val}. Corect! ${['Bravo!', 'Super!', 'Foarte bine!'][Math.floor(Math.random() * 3)]}`);

      if (this.correct >= this.cfg.need) {
        this.running = false;
        const stars = this.mistakes === 0 ? 3 : this.mistakes <= 2 ? 2 : 1;
        setTimeout(() => {
          window.hub.levelComplete('numbers', {
            stars,
            score: this.correct,
            title: `Nivelul ${this.levelIndex + 1} rezolvat!`,
            message: `${this.correct} raspunsuri corecte, ${this.mistakes} greseli.`,
            isLastLevel: this.levelIndex + 1 >= NUMBERS_LEVELS.length
          });
        }, 900);
        return;
      }
      setTimeout(() => { this.feedback = null; this.nextQuestion(300); }, 900);
    } else {
      this.mistakes++;
      this.lives--;
      this.feedback = { ok: false, val, t: 30 };
      window.soundManager.playBuzz();
      window.voice.say(`${val}. Nu e bine. Mai numara o data.`);

      if (this.lives <= 0) {
        this.running = false;
        setTimeout(() => window.hub.gameOver('numbers', {
          score: this.correct,
          message: 'S-au terminat inimioarele. Reluam nivelul.'
        }), 900);
        return;
      }
      setTimeout(() => { this.feedback = null; }, 800);
    }
  }

  draw() {
    const ctx = this.ctx;
    const W = this.canvas.width;
    const H = this.canvas.height;
    ctx.clearRect(0, 0, W, H);
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#1e1b4b');
    bg.addColorStop(1, '#0f172a');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    const top = window.HUD_HEIGHT;

    ctx.font = 'bold 26px sans-serif';
    ctx.fillStyle = '#fde047';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.question, W / 2, top + 36);

    if (this.cfg.kind === 'count') {
      const items = this.items || [];
      const cols = Math.min(5, Math.max(3, Math.ceil(Math.sqrt(items.length))));
      const rows = Math.ceil(items.length / cols);
      const areaTop = top + 70;
      const areaH = H - areaTop - 130;
      const stepX = Math.min(78, W / (cols + 1));
      const stepY = Math.min(72, areaH / rows);
      const size = Math.min(46, stepY * 0.7);

      items.forEach((em, i) => {
        const c = i % cols;
        const r = Math.floor(i / cols);
        ctx.font = `${size}px sans-serif`;
        ctx.fillText(em, W / 2 + (c - (cols - 1) / 2) * stepX, areaTop + stepY / 2 + r * stepY);
      });
    } else {
      // Adunare si scadere aratate si cu obiecte, nu doar cu cifre
      const cy = top + 130;
      ctx.font = '38px sans-serif';
      const drawRow = (n, y) => {
        const stepX = Math.min(48, (W - 60) / Math.max(n, 1));
        for (let i = 0; i < n; i++) {
          ctx.fillText(this.emoji, W / 2 + (i - (n - 1) / 2) * stepX, y);
        }
      };
      drawRow(this.a, cy);
      ctx.font = 'bold 30px sans-serif';
      ctx.fillStyle = '#f472b6';
      ctx.fillText(this.cfg.kind === 'add' ? '+' : '−', W / 2, cy + 46);
      ctx.fillStyle = '#fde047';
      ctx.font = '38px sans-serif';
      drawRow(this.b, cy + 96);
    }

    // Butoanele cu raspunsuri
    for (const b of this.buttonRects()) {
      const fb = this.feedback && this.feedback.val === b.val;
      ctx.save();
      ctx.fillStyle = fb ? (this.feedback.ok ? '#10b981' : '#ef4444') : '#4f46e5';
      ctx.strokeStyle = 'rgba(255,255,255,0.35)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(b.x, b.y, b.w, b.h, 20);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 38px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(b.val), b.x + b.w / 2, b.y + b.h / 2);
      ctx.restore();
    }

    this.speaker = window.drawSpeakerButton(ctx, this.canvas);
    if (this.feedback) this.feedback.t--;

    window.drawLevelHud(ctx, this.canvas, {
      level: this.levelIndex + 1,
      maxLevel: NUMBERS_LEVELS.length,
      goal: `${this.correct}/${this.cfg.need} corecte`,
      lives: this.lives,
      progress: this.correct / this.cfg.need
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
    if (this.canvas) this.canvas.removeEventListener('pointerdown', this.boundTouch);
    window.removeEventListener('resize', this.boundResize);
  }
}

window.hub.registerGame('numbers', new NumbersGame());
