/**
 * Viteza jocurilor, reglabila si tinuta minte pentru fiecare joc in parte.
 *
 * Toate jocurile in care se misca ceva inmultesc deplasarea cu factorul de aici,
 * deci "Melc" chiar inseamna de vreo cinci ori mai incet, nu doar putin mai lent.
 * Pornim de la Incet, nu de la Rapid: mai bine urca el viteza cand vrea.
 */
const SPEED_STEPS = [
  { key: 'melc', label: 'Melc', icon: '🐌', f: 0.18 },
  { key: 'incet', label: 'Încet', icon: '🐢', f: 0.30 },
  { key: 'potrivit', label: 'Potrivit', icon: '🚶', f: 0.50 },
  { key: 'iute', label: 'Iute', icon: '🏃', f: 0.75 },
  { key: 'rapid', label: 'Rapid', icon: '🐇', f: 1.00 },
  { key: 'super', label: 'Super', icon: '⚡', f: 1.40 }
];

const SPEED_DEFAULT = 1; // Încet

class GameSpeed {
  constructor() {
    this.key = 'offline_playroom_speed_v1';
    try {
      this.map = JSON.parse(localStorage.getItem(this.key)) || {};
    } catch (e) {
      this.map = {};
    }
  }

  index(gameId) {
    const i = this.map[gameId];
    return typeof i === 'number' ? Math.max(0, Math.min(SPEED_STEPS.length - 1, i)) : SPEED_DEFAULT;
  }

  /** Factorul cu care se inmulteste orice miscare. 1 = viteza de baza. */
  factor(gameId) {
    return SPEED_STEPS[this.index(gameId)].f;
  }

  step(gameId) {
    return SPEED_STEPS[this.index(gameId)];
  }

  cycle(gameId) {
    const next = (this.index(gameId) + 1) % SPEED_STEPS.length;
    this.map[gameId] = next;
    try {
      localStorage.setItem(this.key, JSON.stringify(this.map));
    } catch (e) {}
    return SPEED_STEPS[next];
  }
}

window.gameSpeed = new GameSpeed();
window.SPEED_STEPS = SPEED_STEPS;
