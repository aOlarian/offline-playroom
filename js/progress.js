/**
 * Progresul lui jucătorul: nivel curent, record si steluțe, per joc.
 * Totul in localStorage, ca sa mearga identic si in avion.
 */
class ProgressStore {
  constructor() {
    this.key = 'offline_playroom_progress_v1';
    this.data = this.load();
  }

  load() {
    try {
      return JSON.parse(localStorage.getItem(this.key)) || {};
    } catch (e) {
      return {};
    }
  }

  save() {
    try {
      localStorage.setItem(this.key, JSON.stringify(this.data));
    } catch (e) {}
  }

  entry(gameId) {
    if (!this.data[gameId]) {
      this.data[gameId] = { level: 1, maxLevel: 1, best: 0, stars: 0 };
    }
    return this.data[gameId];
  }

  getLevel(gameId) {
    return this.entry(gameId).level;
  }

  setLevel(gameId, level) {
    const e = this.entry(gameId);
    e.level = Math.max(1, level);
    e.maxLevel = Math.max(e.maxLevel, e.level);
    this.save();
  }

  getBest(gameId) {
    return this.entry(gameId).best;
  }

  submitScore(gameId, score) {
    const e = this.entry(gameId);
    const isRecord = score > e.best;
    if (isRecord) {
      e.best = score;
      this.save();
    }
    return isRecord;
  }

  getStars(gameId) {
    return this.entry(gameId).stars;
  }

  addStars(gameId, n) {
    const e = this.entry(gameId);
    e.stars += n;
    this.save();
  }

  reset(gameId) {
    delete this.data[gameId];
    this.save();
  }
}

/**
 * Bara de sus desenata in canvas: nivel, obiectiv, vieti, record.
 * O foloseste fiecare joc, ca sa arate la fel peste tot.
 */
function drawLevelHud(ctx, canvas, opts) {
  const h = 44;
  ctx.save();
  ctx.fillStyle = 'rgba(10, 8, 30, 0.55)';
  ctx.fillRect(0, 0, canvas.width, h);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, h + 0.5);
  ctx.lineTo(canvas.width, h + 0.5);
  ctx.stroke();

  ctx.font = 'bold 16px sans-serif';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.fillStyle = '#fde047';
  ctx.fillText(`Nivel ${opts.level}${opts.maxLevel ? '/' + opts.maxLevel : ''}`, 14, h / 2);

  if (opts.goal) {
    ctx.textAlign = 'center';
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText(opts.goal, canvas.width / 2, h / 2);
  }

  ctx.textAlign = 'right';
  if (typeof opts.lives === 'number') {
    ctx.fillStyle = '#f472b6';
    ctx.fillText('❤️'.repeat(Math.max(0, opts.lives)), canvas.width - 14, h / 2);
  } else if (typeof opts.best === 'number') {
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`Record ${opts.best}`, canvas.width - 14, h / 2);
  }

  // Bara de progres spre obiectivul nivelului
  if (typeof opts.progress === 'number') {
    const p = Math.max(0, Math.min(1, opts.progress));
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.fillRect(0, h - 4, canvas.width, 4);
    ctx.fillStyle = p >= 1 ? '#34d399' : '#8b5cf6';
    ctx.fillRect(0, h - 4, canvas.width * p, 4);
  }
  ctx.restore();
  return h;
}

window.progress = new ProgressStore();
window.drawLevelHud = drawLevelHud;
window.HUD_HEIGHT = 44;
