/**
 * Offline Playroom - Hub Controller & Game Registry
 */

class HubController {
  constructor() {
    this.currentView = 'hub-view';
    this.currentGame = null;
    this.currentGameId = null;
    this.pendingLaunch = null;
    this.games = {};
    this.totalStars = parseInt(localStorage.getItem('offline_playroom_stars') || '0', 10);
    this.selectedAvatar = localStorage.getItem('offline_playroom_avatar') || '🚀';
    this.categories = {
      sport: { name: 'Sport și mișcare', icon: '⚽', games: ['golf', 'basket', 'race', 'billiard', 'fishing'] },
      arcade: { name: 'Arcade și reflexe', icon: '🕹️', games: ['balloons', 'sushichop', 'shooting', 'jetpack', 'mole', 'snake', 'bubble', 'runner', 'pinball'] },
      minte: { name: 'Minte și puzzle', icon: '🧩', games: ['puzzle', 'fourinline', 'maze', 'memory', 'candies', 'game2048', 'slider'] },
      invat: { name: 'Învăț și descopăr', icon: '🔎', games: ['numbers', 'dots', 'findit', 'sort', 'shadows'] },
      creativ: { name: 'Desenez și creez', icon: '🎨', games: ['drawing', 'coloring'] }
    };

    this.init();
  }

  init() {
    this.renderStars();
    this.renderAvatar();
    this.generateBackgroundStars();
    // Insignele de pe carduri se pot desena abia dupa ce jocurile s-au inregistrat.
    window.addEventListener('load', () => this.renderCardBadges());
    window.addEventListener('load', () => this.buildCategories());
  }

  buildCategories() {
    const grid = document.querySelector('.games-grid');
    if (!grid || grid.dataset.categorized) return;
    grid.dataset.categorized = 'yes';
    const cards = [...grid.querySelectorAll('.game-card')];
    const byId = Object.fromEntries(cards.map((card) => [card.dataset.game, card]));
    grid.innerHTML = '';
    Object.entries(this.categories).forEach(([id, category]) => {
      const section = document.createElement('section');
      section.className = 'category-section';
      section.dataset.category = id;
      const title = document.createElement('button');
      title.className = 'category-title';
      title.innerHTML = `<span>${category.icon}</span><strong>${category.name}</strong><small>${category.games.length} jocuri</small><b>⌄</b>`;
      title.addEventListener('click', () => {
        section.classList.toggle('open');
        window.soundManager.playClick();
        window.voice.say(category.name);
      });
      const list = document.createElement('div');
      list.className = 'category-games';
      category.games.forEach((gameId) => { if (byId[gameId]) list.appendChild(byId[gameId]); });
      section.append(title, list);
      grid.appendChild(section);
    });
    const first = grid.querySelector('.category-section');
    if (first) first.classList.add('open');
    this.renderCardBadges();
  }

  registerGame(id, gameInstance) {
    this.games[id] = gameInstance;
    gameInstance.id = id;
  }

  toggleSound() {
    const isMuted = window.soundManager.toggleMute();
    if (isMuted) window.voice.stop();
    const soundBtn = document.getElementById('sound-toggle-btn');
    if (soundBtn) soundBtn.innerHTML = isMuted ? '🔇' : '🔊';
    window.soundManager.playClick();
  }

  toggleFullscreen() {
    window.soundManager.playClick();
    const fsBtn = document.getElementById('fullscreen-btn');
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      if (fsBtn) fsBtn.innerHTML = '🔲';
    } else {
      document.exitFullscreen().catch(() => {});
      if (fsBtn) fsBtn.innerHTML = '⛶';
    }
  }

  cycleAvatar() {
    window.soundManager.playPop();
    const avatars = ['🚀', '🦁', '🦖', '⭐', '🏎️', '🎮', '🦄', '✈️'];
    let idx = avatars.indexOf(this.selectedAvatar);
    idx = (idx + 1) % avatars.length;
    this.selectedAvatar = avatars[idx];
    localStorage.setItem('offline_playroom_avatar', this.selectedAvatar);
    this.renderAvatar();
  }

  /** Butonul de viteza din bara jocului. Se schimba doar pentru jocul deschis. */
  renderSpeedButton() {
    const btn = document.getElementById('game-speed-btn');
    if (!btn) return;
    const game = this.games[this.currentGameId];
    // Jocurile fara nimic in miscare nu au ce regla.
    if (!game || !game.usesSpeed) {
      btn.style.display = 'none';
      return;
    }
    const s = window.gameSpeed.step(this.currentGameId);
    btn.style.display = '';
    btn.textContent = `${s.icon} ${s.label}`;
  }

  cycleSpeed() {
    if (!this.currentGameId) return;
    const s = window.gameSpeed.cycle(this.currentGameId);
    this.renderSpeedButton();
    window.soundManager.playClick();
    window.voice.say('Viteza: ' + s.label);
  }

  restartGame() {
    window.soundManager.playClick();
    if (this.currentGame && typeof this.currentGame.restart === 'function') {
      this.currentGame.restart();
    }
  }

  resetToLevelOne() {
    if (!this.currentGameId) return;
    window.progress.setLevel(this.currentGameId, 1);
    window.soundManager.playBuzz();
    window.voice.say('Am resetat jocul la Nivelul 1.');
    this.restartGame();
  }

  generateBackgroundStars() {
    const starBg = document.querySelector('.star-bg');
    if (!starBg) return;
    starBg.innerHTML = '';
    for (let i = 0; i < 35; i++) {
      const star = document.createElement('div');
      star.className = 'star';
      const size = Math.random() * 3 + 1;
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      star.style.top = `${Math.random() * 100}%`;
      star.style.left = `${Math.random() * 100}%`;
      star.style.animationDelay = `${Math.random() * 3}s`;
      starBg.appendChild(star);
    }
  }

  /** Fiecare card arata la ce nivel a ajuns jucătorul si cate steluțe a strans acolo. */
  renderCardBadges() {
    document.querySelectorAll('.game-card').forEach((card) => {
      const id = card.dataset.game;
      const game = this.games[id];
      if (!game) return;
      const lvl = window.progress.getLevel(id);
      const stars = window.progress.getStars(id);
      const total = game.maxLevel || 0;
      let bar = card.querySelector('.card-progress');
      if (!bar) {
        bar = document.createElement('div');
        bar.className = 'card-progress';
        card.appendChild(bar);
      }
      const pct = total ? Math.min(100, Math.round(((lvl - 1) / total) * 100)) : 0;
      bar.innerHTML =
        `<span class="chip chip-level">Nivel ${lvl}${total ? '/' + total : ''}</span>` +
        `<span class="chip chip-stars">⭐ ${stars}</span>` +
        `<span class="card-bar"><i style="width:${pct}%"></i></span>`;
    });
  }

  launchGame(gameId) {
    const game = this.games[gameId];
    if (!game) {
      console.warn(`Game ${gameId} not found`);
      return;
    }

    window.soundManager.ensureContext();
    window.soundManager.playClick();

    this.currentGame = game;
    this.currentGameId = gameId;
    this.switchView('game-view');

    const titleEl = document.getElementById('game-title-text');
    if (titleEl) titleEl.textContent = game.name || 'Joc';

    const lvl = window.progress.getLevel(gameId);
    window.voice.say(`${(game.name || 'Joc').replace(/[^\p{L}\p{N} ]/gu, '')}. Nivelul ${lvl}.`);
    this.renderSpeedButton();

    const scoreEl = document.getElementById('game-current-score');
    if (scoreEl) scoreEl.textContent = '0';

    const canvas = document.getElementById('game-canvas');
    if (canvas && typeof game.init === 'function') {
      if (window.playroomControls) window.playroomControls.touchFeedback(canvas);
      clearTimeout(this.pendingLaunch);
      this.pendingLaunch = setTimeout(() => {
        this.pendingLaunch = null;
        game.init(canvas);
      }, 50);
    }
  }

  exitGame() {
    clearTimeout(this.pendingLaunch);
    this.pendingLaunch = null;
    window.soundManager.playClick();
    window.voice.stop();
    if (this.currentGame && typeof this.currentGame.stop === 'function') {
      this.currentGame.stop();
    }
    this.currentGame = null;
    this.currentGameId = null;
    this.hideModal();
    this.renderCardBadges();
    this.switchView('hub-view');
  }

  switchView(viewId) {
    document.querySelectorAll('.view').forEach((v) => v.classList.remove('active'));
    const target = document.getElementById(viewId);
    if (target) {
      target.classList.add('active');
      this.currentView = viewId;
    }
  }

  addStars(amount = 1) {
    this.totalStars += amount;
    localStorage.setItem('offline_playroom_stars', this.totalStars.toString());
    this.renderStars();
    window.soundManager.playChime();
    window.confettiManager.start(1500);
  }

  renderStars() {
    const countEl = document.getElementById('total-star-count');
    if (countEl) countEl.textContent = this.totalStars;
  }

  renderAvatar() {
    const avatarBtn = document.getElementById('user-avatar-btn');
    if (avatarBtn) avatarBtn.textContent = this.selectedAvatar;
  }

  updateScore(score) {
    const scoreEl = document.getElementById('game-current-score');
    if (scoreEl) scoreEl.textContent = score.toString();
  }

  /**
   * Sfarsit de nivel. Salveaza progresul, da steluțe si intreaba ce urmeaza.
   * opts: {stars, title, message, score, isLastLevel}
   */
  levelComplete(gameId, opts = {}) {
    const game = this.games[gameId];
    const stars = Math.max(1, Math.min(3, opts.stars || 1));
    const level = window.progress.getLevel(gameId);
    const maxLevel = (game && game.maxLevel) || 0;
    const finished = opts.isLastLevel || (maxLevel && level >= maxLevel);

    window.progress.addStars(gameId, stars);
    if (typeof opts.score === 'number') window.progress.submitScore(gameId, opts.score);
    if (!finished) window.progress.setLevel(gameId, level + 1);

    this.addStars(stars);
    window.soundManager.playFanfare();
    window.confettiManager.start(3000);

    this.showModal({
      icon: finished ? '🏆' : '🎉',
      title: opts.title || (finished ? 'Ai terminat tot jocul!' : `Nivelul ${level} rezolvat!`),
      message: opts.message || (finished
        ? 'Ai trecut prin toate nivelurile. Esti campion!'
        : `Urmeaza nivelul ${level + 1}. Devine putin mai greu.`),
      stars,
      buttons: finished
        ? [
            { label: 'Ia-o de la capat 🔄', cls: 'btn-warning', action: () => { window.progress.setLevel(gameId, 1); this.hideModal(); this.restartGame(); } },
            { label: 'Meniu 🏠', cls: 'btn-danger', action: () => this.exitGame() }
          ]
        : [
            { label: 'Nivelul următor 🚀', cls: 'btn-success', action: () => { this.hideModal(); this.restartGame(); } },
            { label: 'Meniu 🏠', cls: 'btn-danger', action: () => this.exitGame() }
          ]
    });
  }

  /** Sfarsit de partida fara reusita: reia acelasi nivel, fara pedeapsa. */
  gameOver(gameId, opts = {}) {
    window.soundManager.playBuzz();
    if (typeof opts.score === 'number') window.progress.submitScore(gameId, opts.score);
    this.showModal({
      icon: '💪',
      title: opts.title || 'Aproape!',
      message: opts.message || 'Mai incearca o data, esti pe aproape.',
      buttons: [
        { label: 'Mai incerc 🔄', cls: 'btn-success', action: () => { this.hideModal(); this.restartGame(); } },
        { label: 'Meniu 🏠', cls: 'btn-danger', action: () => this.exitGame() }
      ]
    });
  }

  showModal(opts) {
    const modal = document.getElementById('game-win-modal');
    if (!modal) return;
    modal.querySelector('.modal-icon').textContent = opts.icon || '🏆';
    document.getElementById('modal-title').textContent = opts.title || '';
    document.getElementById('modal-message').textContent = opts.message || '';

    const starsEl = document.getElementById('modal-stars-earned');
    starsEl.textContent = opts.stars ? '⭐'.repeat(opts.stars) + '☆'.repeat(3 - opts.stars) : '';

    const actions = modal.querySelector('.modal-actions');
    actions.innerHTML = '';
    (opts.buttons || [{ label: 'Continuă 🚀', cls: 'btn-success', action: () => this.hideModal() }])
      .forEach((b) => {
        const btn = document.createElement('button');
        btn.className = `game-btn ${b.cls || 'btn-success'}`;
        btn.textContent = b.label;
        btn.addEventListener('click', b.action);
        actions.appendChild(btn);
      });

    // jucătorul nu citeste inca: tot ce apare scris in fereastra se si aude.
    window.voice.say(`${opts.title}. ${opts.message}`, { rate: 0.9 });

    modal.classList.add('active');
  }

  // Pastrata pentru jocurile care inca o folosesc direct.
  showWinModal(title, message, stars = 3) {
    this.addStars(stars);
    window.soundManager.playFanfare();
    window.confettiManager.start(3000);
    this.showModal({ icon: '🏆', title, message, stars });
  }

  hideModal() {
    const modal = document.getElementById('game-win-modal');
    if (modal) modal.classList.remove('active');
  }
}

window.hub = new HubController();
