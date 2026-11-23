/**
 * Connect Points (Dot to Dot) Game
 */
class DotsGame {
  constructor() {
    this.name = 'Unește Punctele ✏️';
    this.maxLevel = 8;
    this.canvas = null;
    this.ctx = null;
    this.running = false;
    this.currentLevel = 0;
    this.levels = [
      {
        name: 'Steaua Aurie ⭐',
        color: '#facc15',
        points: [
          { x: 0.5, y: 0.15 },
          { x: 0.62, y: 0.38 },
          { x: 0.88, y: 0.38 },
          { x: 0.67, y: 0.55 },
          { x: 0.75, y: 0.82 },
          { x: 0.5, y: 0.66 },
          { x: 0.25, y: 0.82 },
          { x: 0.33, y: 0.55 },
          { x: 0.12, y: 0.38 },
          { x: 0.38, y: 0.38 }
        ]
      },
      {
        name: 'Inima Magică ❤️',
        color: '#ec4899',
        points: [
          { x: 0.5, y: 0.32 },
          { x: 0.65, y: 0.18 },
          { x: 0.82, y: 0.25 },
          { x: 0.85, y: 0.45 },
          { x: 0.72, y: 0.65 },
          { x: 0.5, y: 0.85 },
          { x: 0.28, y: 0.65 },
          { x: 0.15, y: 0.45 },
          { x: 0.18, y: 0.25 },
          { x: 0.35, y: 0.18 }
        ]
      },
      {
        name: 'Căsuța Veselă 🏠',
        color: '#38bdf8',
        points: [
          { x: 0.5, y: 0.15 },
          { x: 0.8, y: 0.4 },
          { x: 0.8, y: 0.8 },
          { x: 0.2, y: 0.8 },
          { x: 0.2, y: 0.4 }
        ]
      },
      {
        name: 'Bradul de Crăciun 🌲',
        color: '#22c55e',
        points: [
          { x: 0.5, y: 0.10 }, { x: 0.66, y: 0.34 }, { x: 0.58, y: 0.34 },
          { x: 0.74, y: 0.56 }, { x: 0.64, y: 0.56 }, { x: 0.82, y: 0.78 },
          { x: 0.56, y: 0.78 }, { x: 0.56, y: 0.90 }, { x: 0.44, y: 0.90 },
          { x: 0.44, y: 0.78 }, { x: 0.18, y: 0.78 }, { x: 0.36, y: 0.56 },
          { x: 0.26, y: 0.56 }, { x: 0.42, y: 0.34 }, { x: 0.34, y: 0.34 }
        ]
      },
      {
        name: 'Bărcuța pe Apă ⛵',
        color: '#38bdf8',
        points: [
          { x: 0.50, y: 0.10 }, { x: 0.50, y: 0.58 }, { x: 0.80, y: 0.58 },
          { x: 0.88, y: 0.70 }, { x: 0.72, y: 0.86 }, { x: 0.28, y: 0.86 },
          { x: 0.12, y: 0.70 }, { x: 0.20, y: 0.58 }, { x: 0.44, y: 0.58 },
          { x: 0.44, y: 0.20 }, { x: 0.20, y: 0.46 }, { x: 0.44, y: 0.46 }
        ]
      },
      {
        name: 'Racheta Spațială 🚀',
        color: '#f472b6',
        points: [
          { x: 0.50, y: 0.08 }, { x: 0.62, y: 0.26 }, { x: 0.62, y: 0.60 },
          { x: 0.78, y: 0.74 }, { x: 0.62, y: 0.74 }, { x: 0.58, y: 0.88 },
          { x: 0.42, y: 0.88 }, { x: 0.38, y: 0.74 }, { x: 0.22, y: 0.74 },
          { x: 0.38, y: 0.60 }, { x: 0.38, y: 0.26 }
        ]
      },
      {
        name: 'Pisicuța Somnoroasă 🐱',
        color: '#fbbf24',
        points: [
          { x: 0.32, y: 0.24 }, { x: 0.38, y: 0.10 }, { x: 0.46, y: 0.22 },
          { x: 0.58, y: 0.22 }, { x: 0.66, y: 0.10 }, { x: 0.72, y: 0.24 },
          { x: 0.78, y: 0.44 }, { x: 0.74, y: 0.70 }, { x: 0.86, y: 0.84 },
          { x: 0.50, y: 0.88 }, { x: 0.26, y: 0.72 }, { x: 0.24, y: 0.44 }
        ]
      }
    ];
    this.connectedIndex = 0;
    this.boundTouch = this.handleTouch.bind(this);
    this.boundResize = this.resize.bind(this);
  }

  init(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.resize();
    this.running = true;
    this.currentLevel = Math.min(window.progress.getLevel('dots'), this.levels.length) - 1;
    this.connectedIndex = 0;
    this.mistakes = 0;

    window.addEventListener('resize', this.boundResize);
    this.canvas.addEventListener('pointerdown', this.boundTouch);

    setTimeout(() => this.announce(), 1000);
    this.loop();
  }

  /** Spune ce desen facem si ce numar urmeaza la atins. */
  announce() {
    if (!this.running) return;
    const lvl = this.levels[this.currentLevel % this.levels.length];
    const name = lvl.name.replace(/[^\p{L} ]/gu, '').trim();
    this.spoken = this.connectedIndex === 0
      ? 'Desenam ' + name + '. Atinge numarul unu.'
      : 'Atinge numarul ' + (this.connectedIndex + 1) + '.';
    window.voice.say(this.spoken);
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
  }

  handleTouch(e) {
    if (!this.running) return;
    const rect = this.canvas.getBoundingClientRect();
    const touchX = e.clientX - rect.left;
    const touchY = e.clientY - rect.top;

    if (window.hitSpeaker(this.speaker, touchX, touchY)) {
      window.voice.say(this.spoken || '');
      return;
    }

    const lvl = this.levels[this.currentLevel % this.levels.length];
    const targetIdx = this.connectedIndex;
    if (targetIdx >= lvl.points.length) return;

    const pt = lvl.points[targetIdx];
    const px = pt.x * this.canvas.width;
    const py = pt.y * this.canvas.height;
    const dist = Math.hypot(touchX - px, touchY - py);

    if (dist < 40) {
      this.connectedIndex++;
      window.soundManager.playNote(300 + this.connectedIndex * 50, 0.2);

      if (this.connectedIndex >= lvl.points.length) {
        window.soundManager.playFanfare();
        window.confettiManager.start(2000);
        this.running = false;
        const st = this.mistakes === 0 ? 3 : this.mistakes <= 3 ? 2 : 1;
        const name = lvl.name.replace(/[^\p{L} ]/gu, '').trim();
        window.voice.say('Gata! Ai desenat ' + name + '.');
        setTimeout(() => window.hub.levelComplete('dots', {
          stars: st,
          score: lvl.points.length,
          title: name + ' — gata!',
          message: 'Ai unit toate cele ' + lvl.points.length + ' puncte.',
          isLastLevel: this.currentLevel + 1 >= this.levels.length
        }), 900);
      } else {
        window.voice.say(String(this.connectedIndex + 1), { rate: 1.05 });
        this.spoken = 'Atinge numarul ' + (this.connectedIndex + 1) + '.';
      }
    } else {
      this.mistakes++;
      window.soundManager.playBuzz();
      window.voice.say('Nu acolo. Cauta numarul ' + (this.connectedIndex + 1) + '.');
    }
  }

  loop() {
    if (!this.running) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Background
    this.ctx.fillStyle = '#0f172a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const lvl = this.levels[this.currentLevel % this.levels.length];

    // Level Title
    this.ctx.font = 'bold 22px sans-serif';
    this.ctx.fillStyle = '#fde047';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`Unește punctele: ${lvl.name}`, this.canvas.width / 2, window.HUD_HEIGHT + 26);

    // Draw connected lines
    if (this.connectedIndex > 0) {
      this.ctx.beginPath();
      const first = lvl.points[0];
      this.ctx.moveTo(first.x * this.canvas.width, first.y * this.canvas.height);

      for (let i = 1; i < this.connectedIndex; i++) {
        const p = lvl.points[i];
        this.ctx.lineTo(p.x * this.canvas.width, p.y * this.canvas.height);
      }

      if (this.connectedIndex >= lvl.points.length) {
        this.ctx.closePath();
        this.ctx.fillStyle = lvl.color + '44';
        this.ctx.fill();
      }

      this.ctx.strokeStyle = lvl.color;
      this.ctx.lineWidth = 5;
      this.ctx.lineCap = 'round';
      this.ctx.stroke();
    }

    // Draw dots
    lvl.points.forEach((pt, idx) => {
      const px = pt.x * this.canvas.width;
      const py = pt.y * this.canvas.height;
      const isNext = idx === this.connectedIndex;
      const isConnected = idx < this.connectedIndex;

      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(px, py, isNext ? 18 : 14, 0, Math.PI * 2);
      this.ctx.fillStyle = isConnected ? lvl.color : (isNext ? '#f43f5e' : '#334155');
      this.ctx.fill();
      this.ctx.strokeStyle = '#ffffff';
      this.ctx.lineWidth = 3;
      this.ctx.stroke();

      // Number text
      this.ctx.font = 'bold 13px sans-serif';
      this.ctx.fillStyle = '#ffffff';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText((idx + 1).toString(), px, py);
      this.ctx.restore();
    });

    this.speaker = window.drawSpeakerButton(this.ctx, this.canvas);

    window.drawLevelHud(this.ctx, this.canvas, {
      level: this.currentLevel + 1,
      maxLevel: this.levels.length,
      goal: this.connectedIndex + '/' + lvl.points.length + ' puncte',
      progress: this.connectedIndex / lvl.points.length
    });

    requestAnimationFrame(() => this.loop());
  }

  restart() {
    this.currentLevel = Math.min(window.progress.getLevel('dots'), this.levels.length) - 1;
    this.connectedIndex = 0;
    this.mistakes = 0;
    this.running = true;
    setTimeout(() => this.announce(), 600);
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

window.hub.registerGame('dots', new DotsGame());
