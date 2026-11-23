/* MAP
 * §1 game state & setup L1-L55
 * §2 input & movement L57-L113
 * §3 drawing & lifecycle L115-L194
 */

// §1 game state & setup
class SnakeGame {
  constructor() {
    this.name = 'Șerpișorul Curajos 🐍';
    this.maxLevel = 8;
    this.usesSpeed = true;
    this.running = false;
    this.direction = 'right';
    this.nextDirection = 'right';
    this.boundPointer = this.pointer.bind(this);
    this.boundResize = this.resize.bind(this);
  }

  init(canvas) {
    this.stop();
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.resize();
    this.level = window.progress.getLevel('snake');
    this.goal = 20 + this.level * 10;
    this.score = 0;
    this.direction = this.nextDirection = 'right';
    this.snake = [{ x: 5, y: 6 }, { x: 4, y: 6 }, { x: 3, y: 6 }];
    this.placeApple();
    this.running = true;
    this.lastMove = performance.now();
    canvas.addEventListener('pointerdown', this.boundPointer);
    window.addEventListener('resize', this.boundResize);
    window.playroomControls.bindSwipe(canvas, (dir) => this.turn(dir));
    window.hub.updateScore(0);
    window.voice.say(`Mănâncă ${this.goal} mere. Apasă săgețile mari sau trage cu degetul.`);
    this.loop();
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = Math.max(320, rect.width);
    this.canvas.height = Math.max(380, rect.height);
  }

  placeApple() {
    do {
      this.apple = { x: Math.floor(Math.random() * 12), y: Math.floor(Math.random() * 11) };
    } while (this.snake.some((part) => part.x === this.apple.x && part.y === this.apple.y));
  }

  get sp() { return window.gameSpeed.factor('snake'); }

  // §2 input & movement
  turn(dir) {
    const opposite = { left: 'right', right: 'left', up: 'down', down: 'up' };
    if (opposite[dir] !== this.direction) this.nextDirection = dir;
  }

  pointer(event) {
    const rect = this.canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * this.canvas.width / rect.width;
    const y = (event.clientY - rect.top) * this.canvas.height / rect.height;
    const controlsY = this.canvas.height - 105;
    if (y < controlsY) return;
    if (x < this.canvas.width * .34) this.turn('left');
    else if (x > this.canvas.width * .66) this.turn('right');
    else this.turn(y < controlsY + 55 ? 'up' : 'down');
  }

  move() {
    this.direction = this.nextDirection;
    const head = { ...this.snake[0] };
    if (this.direction === 'left') head.x--;
    if (this.direction === 'right') head.x++;
    if (this.direction === 'up') head.y--;
    if (this.direction === 'down') head.y++;
    const hit = head.x < 0 || head.x > 11 || head.y < 0 || head.y > 10 || this.snake.some((part) => part.x === head.x && part.y === head.y);
    if (hit) {
      this.running = false;
      window.hub.gameOver('snake', { title: 'Ups, șerpișorul s-a lovit!', message: 'Mai încearcă. Mergi încet și întoarce-l la timp.', score: this.score });
      return;
    }
    this.snake.unshift(head);
    if (head.x === this.apple.x && head.y === this.apple.y) {
      this.score++;
      window.hub.updateScore(this.score);
      window.soundManager.playPop();
      if (this.score >= this.goal) {
        this.running = false;
        window.hub.levelComplete('snake', { stars: 3, score: this.score, message: 'Șerpișorul a mâncat toate merele!' });
        return;
      }
      this.placeApple();
    } else this.snake.pop();
  }

  // §3 drawing & lifecycle
  loop(now = performance.now()) {
    if (!this.running) return;
    const interval = 420 / this.sp;
    if (now - this.lastMove >= interval) { this.lastMove = now; this.move(); }
    this.draw();
    requestAnimationFrame((time) => this.loop(time));
  }

  draw() {
    const { ctx, canvas } = this;
    const cell = Math.min(canvas.width / 12, (canvas.height - 130) / 11);
    const boardW = cell * 12;
    const boardH = cell * 11;
    const ox = (canvas.width - boardW) / 2;
    const oy = 16;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#143b2c'; ctx.fillRect(ox - 6, oy - 6, boardW + 12, boardH + 12);
    for (let y = 0; y < 11; y++) for (let x = 0; x < 12; x++) {
      ctx.fillStyle = (x + y) % 2 ? '#a7d86d' : '#c7eb8a';
      ctx.fillRect(ox + x * cell, oy + y * cell, cell - 2, cell - 2);
    }
    ctx.font = `${cell * .72}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('🍎', ox + (this.apple.x + .5) * cell, oy + (this.apple.y + .52) * cell);
    this.snake.forEach((part, index) => {
      ctx.fillStyle = index ? '#20b86b' : '#087e4d';
      ctx.beginPath(); ctx.roundRect(ox + part.x * cell + 3, oy + part.y * cell + 3, cell - 8, cell - 8, cell * .25); ctx.fill();
      if (!index) { ctx.fillStyle = 'white'; ctx.beginPath(); ctx.arc(ox + (part.x + .68) * cell, oy + (part.y + .34) * cell, 3, 0, Math.PI * 2); ctx.fill(); }
    });
    const cy = canvas.height - 70;
    [['⬅️', canvas.width*.18], ['⬆️', canvas.width*.5], ['➡️', canvas.width*.82], ['⬇️', canvas.width*.5]].forEach(([icon, x], i) => {
      const y = i === 3 ? cy + 44 : cy;
      ctx.fillStyle = 'rgba(86,69,178,.85)'; ctx.beginPath(); ctx.arc(x, y, 34, 0, Math.PI * 2); ctx.fill();
      ctx.font = '29px sans-serif'; ctx.fillText(icon, x, y + 2);
    });
  }

  restart() { if (this.canvas) this.init(this.canvas); }
  stop() { this.running = false; if (this.canvas) this.canvas.removeEventListener('pointerdown', this.boundPointer); window.removeEventListener('resize', this.boundResize); }
}

window.hub.registerGame('snake', new SnakeGame());
