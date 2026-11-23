/**
 * Draw with Finger & Coloring Kids Game
 */
class DrawingGame {
  constructor() {
    this.name = 'Desenează & Colorează 🎨';
    this.canvas = null;
    this.ctx = null;
    this.running = false;
    this.isDrawing = false;
    this.currentColor = '#ec4899';
    this.brushSize = 10;
    this.lastX = 0;
    this.lastY = 0;
    this.colors = [
      '#ef4444', '#f97316', '#f59e0b', '#10b981',
      '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899',
      '#ffffff', '#000000'
    ];
    this.boundDown = this.handleDown.bind(this);
    this.boundMove = this.handleMove.bind(this);
    this.boundUp = this.handleUp.bind(this);
    this.boundResize = this.resize.bind(this);
  }

  init(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.resize();
    this.running = true;

    // Fill white canvas background
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    window.addEventListener('resize', this.boundResize);
    this.canvas.addEventListener('pointerdown', this.boundDown);
    window.addEventListener('pointermove', this.boundMove);
    window.addEventListener('pointerup', this.boundUp);

    this.drawUI();
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    
    // Save image
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = this.canvas.width;
    tempCanvas.height = this.canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (this.canvas.width > 0 && this.canvas.height > 0) {
      tempCtx.drawImage(this.canvas, 0, 0);
    }

    this.canvas.width = rect.width;
    this.canvas.height = rect.height;

    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    if (tempCanvas.width > 0) {
      this.ctx.drawImage(tempCanvas, 0, 0);
    }
  }

  handleDown(e) {
    if (!this.running) return;
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check color palette clicks (bottom 60px)
    if (y > this.canvas.height - 65) {
      const colWidth = this.canvas.width / this.colors.length;
      const colIdx = Math.floor(x / colWidth);
      if (colIdx >= 0 && colIdx < this.colors.length) {
        this.currentColor = this.colors[colIdx];
        window.soundManager.playPop(1.5);
        this.drawUI();
      }
      return;
    }

    this.isDrawing = true;
    this.lastX = x;
    this.lastY = y;
    this.drawDot(x, y);
  }

  handleMove(e) {
    if (!this.running || !this.isDrawing) return;
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (y > this.canvas.height - 65) return;

    this.ctx.beginPath();
    this.ctx.moveTo(this.lastX, this.lastY);
    this.ctx.lineTo(x, y);
    this.ctx.strokeStyle = this.currentColor;
    this.ctx.lineWidth = this.brushSize;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.stroke();

    this.lastX = x;
    this.lastY = y;
  }

  handleUp() {
    this.isDrawing = false;
    this.drawUI();
  }

  drawDot(x, y) {
    this.ctx.beginPath();
    this.ctx.arc(x, y, this.brushSize / 2, 0, Math.PI * 2);
    this.ctx.fillStyle = this.currentColor;
    this.ctx.fill();
  }

  drawUI() {
    // Bottom Palette Bar
    const colWidth = this.canvas.width / this.colors.length;
    const barHeight = 55;
    const startY = this.canvas.height - barHeight;

    this.ctx.save();
    this.ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    this.ctx.fillRect(0, startY, this.canvas.width, barHeight);

    this.colors.forEach((col, idx) => {
      const cx = idx * colWidth + colWidth / 2;
      const cy = startY + barHeight / 2;
      const isSelected = col === this.currentColor;

      this.ctx.beginPath();
      this.ctx.arc(cx, cy, isSelected ? 18 : 14, 0, Math.PI * 2);
      this.ctx.fillStyle = col;
      this.ctx.fill();
      this.ctx.strokeStyle = isSelected ? '#fde047' : '#ffffff';
      this.ctx.lineWidth = isSelected ? 4 : 2;
      this.ctx.stroke();
    });

    this.ctx.restore();
  }

  restart() {
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawUI();
    window.soundManager.playFanfare();
  }

  stop() {
    this.running = false;
    if (this.canvas) {
      this.canvas.removeEventListener('pointerdown', this.boundDown);
    }
    window.removeEventListener('pointermove', this.boundMove);
    window.removeEventListener('pointerup', this.boundUp);
    window.removeEventListener('resize', this.boundResize);
  }
}

window.hub.registerGame('drawing', new DrawingGame());
