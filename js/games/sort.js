/* MAP
 * §1 items & basket color setup L1-L55
 * §2 drag & drop sorting mechanics L57-L130
 * §3 drawing & game loop L132-L210
 */

// §1 items & basket color setup
const SORT_COLORS = [
  { name: 'Roșu', hex: '#ef4444', items: ['🍎', '🍓', '🍒', '🍅', '🚗', '🎈'] },
  { name: 'Albastru', hex: '#3b82f6', items: ['🚙', '🫐', '🧢', '🥏', '🐬', '🐳'] },
  { name: 'Verde', hex: '#22c55e', items: ['🍏', '🍐', '🥒', '🐸', '🐢', '🥦'] },
  { name: 'Galben', hex: '#eab308', items: ['🍌', '🍋', '⭐', '🐥', '🧀', '🌻'] }
];

class ColorSortGame {
  constructor() {
    this.name = 'Sortare pe Culori 🧺';
    this.maxLevel = 6;
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
    this.level = window.progress.getLevel('sort') || 1;
    this.colorCount = Math.min(4, 2 + Math.floor(this.level / 2));
    this.activeColors = SORT_COLORS.slice(0, this.colorCount);
    this.items = [];
    this.draggedItem = null;
    this.score = 0;
    this.totalItems = 18 + this.level * 8;
    this.initItems();
    this.running = true;

    canvas.addEventListener('pointerdown', this.boundDown);
    window.addEventListener('pointermove', this.boundMove);
    window.addEventListener('pointerup', this.boundUp);
    window.addEventListener('resize', this.boundResize);

    window.hub.updateScore(0);
    window.voice.say(`Nivelul ${this.level}. Pune fiecare obiect în coșul de culoarea potrivită trăgând cu degetul!`);
    this.loop();
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = Math.max(320, rect.width);
    this.canvas.height = Math.max(380, rect.height);
    this.basketY = this.canvas.height - 95;
    this.basketH = 80;
    this.basketW = (this.canvas.width - 24) / this.colorCount;
  }

  initItems() {
    this.items = [];
    for (let i = 0; i < this.totalItems; i++) {
      const colorIdx = Math.floor(Math.random() * this.colorCount);
      const colorData = this.activeColors[colorIdx];
      const icon = colorData.items[Math.floor(Math.random() * colorData.items.length)];
      this.items.push({
        icon,
        colorIdx,
        x: 40 + Math.random() * (this.canvas.width - 80),
        y: 65 + Math.random() * (this.basketY - 120),
        r: 22,
        sorted: false
      });
    }
  }

  // §2 drag & drop sorting mechanics
  handleDown(event) {
    if (!this.running) return;
    const rect = this.canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * this.canvas.width / rect.width;
    const y = (event.clientY - rect.top) * this.canvas.height / rect.height;

    for (let i = this.items.length - 1; i >= 0; i--) {
      const item = this.items[i];
      if (!item.sorted && Math.hypot(x - item.x, y - item.y) < item.r * 1.5) {
        this.draggedItem = item;
        item.offsetX = x - item.x;
        item.offsetY = y - item.y;
        window.soundManager.playClick();
        break;
      }
    }
  }

  handleMove(event) {
    if (!this.draggedItem) return;
    const rect = this.canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * this.canvas.width / rect.width;
    const y = (event.clientY - rect.top) * this.canvas.height / rect.height;

    this.draggedItem.x = x - this.draggedItem.offsetX;
    this.draggedItem.y = y - this.draggedItem.offsetY;
  }

  handleUp() {
    if (!this.draggedItem) return;
    const item = this.draggedItem;
    this.draggedItem = null;

    // Check if dropped inside a basket
    if (item.y > this.basketY - 20) {
      const basketIdx = Math.floor((item.x - 12) / this.basketW);
      if (basketIdx === item.colorIdx) {
        // Correct Basket
        item.sorted = true;
        this.score += 10;
        window.hub.updateScore(this.score);
        window.soundManager.playPop(1.4);
        window.confettiManager.start(300);

        const remaining = this.items.filter((it) => !it.sorted).length;
        if (remaining === 0) {
          this.running = false;
          window.hub.levelComplete('sort', {
            stars: 3,
            score: this.score,
            title: 'Toate obiectele sunt sortate! 🧺',
            message: `Bravo! Ai așezat toate cele ${this.totalItems} obiecte în culorile lor!`
          });
        }
      } else {
        // Wrong Basket
        window.soundManager.playBuzz();
        window.voice.say(`Nu este coșul corect. Caută coșul ${this.activeColors[item.colorIdx].name}!`);
        // Animate back to top
        item.y = 70 + Math.random() * (this.basketY - 130);
      }
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

    // Draw Baskets at Bottom
    this.activeColors.forEach((color, idx) => {
      const bx = 12 + idx * this.basketW;

      ctx.fillStyle = color.hex;
      ctx.beginPath();
      ctx.roundRect(bx + 4, this.basketY, this.basketW - 8, this.basketH, [16, 16, 8, 8]);
      ctx.fill();

      // Basket inner shadow
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.beginPath();
      ctx.roundRect(bx + 10, this.basketY + 8, this.basketW - 20, 20, 8);
      ctx.fill();

      // Basket label
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(color.name, bx + this.basketW / 2, this.basketY + this.basketH - 15);
    });

    // Draw Items
    this.items.forEach((item) => {
      if (!item.sorted) {
        ctx.font = '34px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.icon, item.x, item.y);
      }
    });

    window.drawLevelHud(ctx, canvas, {
      level: this.level,
      maxLevel: this.maxLevel,
      goal: `Sortate: ${this.items.filter((it) => it.sorted).length}/${this.totalItems}`
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

window.hub.registerGame('sort', new ColorSortGame());
