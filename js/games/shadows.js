/* MAP
 * §1 shadow pairs setup L1-L50
 * §2 matching & drag mechanics L52-L120
 * §3 drawing & game loop L122-L195
 */

// §1 shadow pairs setup
const SHADOW_SETS = [
  { name: 'Animale Salbatice', items: [{ icon: '🦁', name: 'Leul' }, { icon: '🐘', name: 'Elefantul' }, { icon: '🦒', name: 'Girafa' }, { icon: '🐼', name: 'Ursul Panda' }] },
  { name: 'Vehicule Vesele', items: [{ icon: '🚀', name: 'Racheta' }, { icon: '🚁', name: 'Elicopterul' }, { icon: '🚂', name: 'Trenulețul' }, { icon: '🚢', name: 'Vaporul' }] },
  { name: 'Fructe Gustoase', items: [{ icon: '🍎', name: 'Mărul' }, { icon: '🍌', name: 'Banana' }, { icon: '🍇', name: 'Strugurele' }, { icon: '🍓', name: 'Căpșuna' }] },
  { name: 'Lumea Marină', items: [{ icon: '🐬', name: 'Delfinul' }, { icon: '🐙', name: 'Caracatița' }, { icon: '🦀', name: 'Racul' }, { icon: '🦈', name: 'Rechinul' }] }
];

class ShadowsGame {
  constructor() {
    this.name = 'Potrivește Umbrele 👤';
    this.maxLevel = SHADOW_SETS.length;
    this.usesSpeed = false;
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
    this.level = window.progress.getLevel('shadows') || 1;
    this.currentSet = SHADOW_SETS[(this.level - 1) % SHADOW_SETS.length];
    this.items = [];
    this.shadows = [];
    this.dragged = null;
    this.score = 0;
    this.initPairs();
    this.running = true;

    canvas.addEventListener('pointerdown', this.boundDown);
    window.addEventListener('pointermove', this.boundMove);
    window.addEventListener('pointerup', this.boundUp);
    window.addEventListener('resize', this.boundResize);

    window.hub.updateScore(0);
    window.voice.say(`Nivelul ${this.level}: ${this.currentSet.name}. Trage fiecare desen peste umbra lui neagră corespunzătoare!`);
    this.loop();
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = Math.max(320, rect.width);
    this.canvas.height = Math.max(380, rect.height);
    this.slotH = (this.canvas.height - 110) / 4;
  }

  initPairs() {
    this.items = [];
    this.shadows = [];
    const count = this.currentSet.items.length;

    // Left column: colored items (shuffled order)
    const shuffledItems = [...this.currentSet.items].map((it, idx) => ({ ...it, origIdx: idx })).sort(() => Math.random() - 0.5);

    shuffledItems.forEach((it, idx) => {
      this.items.push({
        ...it,
        x: this.canvas.width * 0.22,
        y: 65 + idx * this.slotH + this.slotH * 0.45,
        matched: false,
        origX: this.canvas.width * 0.22,
        origY: 65 + idx * this.slotH + this.slotH * 0.45
      });
    });

    // Right column: shadows (original or different shuffled order)
    this.currentSet.items.forEach((it, idx) => {
      this.shadows.push({
        origIdx: idx,
        x: this.canvas.width * 0.78,
        y: 65 + idx * this.slotH + this.slotH * 0.45,
        matched: false
      });
    });
  }

  // §2 matching & drag mechanics
  handleDown(event) {
    if (!this.running) return;
    const rect = this.canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * this.canvas.width / rect.width;
    const y = (event.clientY - rect.top) * this.canvas.height / rect.height;

    for (const item of this.items) {
      if (!item.matched && Math.hypot(x - item.x, y - item.y) < 40) {
        this.dragged = item;
        item.offsetX = x - item.x;
        item.offsetY = y - item.y;
        window.soundManager.playClick();
        break;
      }
    }
  }

  handleMove(event) {
    if (!this.dragged) return;
    const rect = this.canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * this.canvas.width / rect.width;
    const y = (event.clientY - rect.top) * this.canvas.height / rect.height;

    this.dragged.x = x - this.dragged.offsetX;
    this.dragged.y = y - this.dragged.offsetY;
  }

  handleUp() {
    if (!this.dragged) return;
    const item = this.dragged;
    this.dragged = null;

    // Check if dropped near its corresponding shadow
    const targetShadow = this.shadows.find((s) => s.origIdx === item.origIdx);
    if (targetShadow && Math.hypot(item.x - targetShadow.x, item.y - targetShadow.y) < 55) {
      item.matched = true;
      targetShadow.matched = true;
      item.x = targetShadow.x;
      item.y = targetShadow.y;
      this.score += 25;
      window.hub.updateScore(this.score);
      window.soundManager.playPop(1.5);
      window.confettiManager.start(350);
      window.voice.say(`Corect! ${item.name}!`);

      const remaining = this.items.filter((it) => !it.matched).length;
      if (remaining === 0) {
        this.running = false;
        window.hub.levelComplete('shadows', {
          stars: 3,
          score: this.score,
          title: 'Toate umbrele potrivite! 👤',
          message: `Excelent! Ai asociat toate desenele cu umbrele lor!`
        });
      }
    } else {
      // Revert to start position
      item.x = item.origX;
      item.y = item.origY;
      window.soundManager.playBuzz();
    }
  }

  // §3 drawing & game loop
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

    // Right Shadows Target Slots
    this.shadows.forEach((shadow) => {
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(shadow.x, shadow.y, 38, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Silhouette Shadow
      const originalItem = this.currentSet.items[shadow.origIdx];
      if (originalItem && !shadow.matched) {
        ctx.save();
        ctx.filter = 'brightness(0) contrast(200%) opacity(0.8)';
        ctx.font = '38px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(originalItem.icon, shadow.x, shadow.y);
        ctx.restore();
      }
    });

    // Left Items Start Slots
    this.items.forEach((item) => {
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(item.origX, item.origY, 38, 0, Math.PI * 2);
      ctx.fill();

      // Draw Item
      ctx.font = '38px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(item.icon, item.x, item.y);
    });

    window.drawLevelHud(ctx, canvas, {
      level: this.level,
      maxLevel: this.maxLevel,
      goal: `Potrivite: ${this.items.filter((it) => it.matched).length}/${this.items.length}`
    });
  }

  restart() {
    if (this.canvas) this.init(this.canvas);
  }

  stop() {
    this.running = false;
    if (this.canvas) {
      this.canvas.removeEventListener('pointerdown', this.boundDown);
      window.removeEventListener('pointermove', this.boundMove);
      window.removeEventListener('pointerup', this.boundUp);
    }
    window.removeEventListener('resize', this.boundResize);
  }
}

window.hub.registerGame('shadows', new ShadowsGame());
