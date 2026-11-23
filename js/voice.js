/**
 * Vocea in romana. jucătorul nu citeste inca, deci tot ce e scris trebuie si spus.
 *
 * Folosim sinteza vocala a dispozitivului (speechSynthesis). Vocea e instalata
 * in tableta, deci vorbeste si in avion, fara internet. Daca dispozitivul nu are
 * voce romaneasca, cadem pe orice voce disponibila si, in ultima instanta, pe un
 * clinchet, ca sa existe totusi un semnal sonor.
 */
class VoiceManager {
  constructor() {
    this.supported = typeof window.speechSynthesis !== 'undefined';
    this.voice = null;
    this.ready = false;
    this.lastText = '';
    if (this.supported) {
      this.pickVoice();
      // Lista vocilor se incarca asincron in Chrome; o reluam cand apare.
      window.speechSynthesis.onvoiceschanged = () => this.pickVoice();
    }
  }

  pickVoice() {
    if (!this.supported) return;
    const voices = window.speechSynthesis.getVoices() || [];
    if (!voices.length) return;
    // Nu alegem vocea implicită engleză: ea citește greșit ă, â, î, ș și ț.
    // Unele Android-uri etichetează româna ro_RO, altele ro-RO sau Romanian.
    const isRomanian = (voice) => {
      const lang = (voice.lang || '').toLowerCase().replace('_', '-');
      const name = (voice.name || '').toLowerCase();
      return lang === 'ro' || lang.startsWith('ro-') || name.includes('romanian') || name.includes('română');
    };
    this.voice = voices.find(isRomanian) || null;
    this.ready = true;
  }

  normalizeRomanian(text) {
    // NFC păstrează diacriticele ca litere întregi, inclusiv când textul vine
    // dintr-un browser care le-a compus din două caractere.
    return String(text).normalize('NFC')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /** Spune textul cu voce tare. `force` reia si daca e acelasi text ca ultima data. */
  say(text, opts = {}) {
    if (!text) return;
    const spokenText = this.normalizeRomanian(text);
    this.lastText = spokenText;
    if (window.soundManager && window.soundManager.muted) return;
    if (!this.supported) {
      window.soundManager && window.soundManager.playChime();
      return;
    }
    try {
      if (!opts.queue) window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(spokenText);
      if (this.voice) u.voice = this.voice;
      // Limba rămâne română și fără o voce explicită: motorul sistemului are
      // astfel șansa să aleagă vocea română instalată, nu limba implicită.
      u.lang = 'ro-RO';
      u.rate = opts.rate || 0.88;
      u.pitch = opts.pitch || 1.03;
      u.volume = 1;
      window.speechSynthesis.speak(u);
    } catch (e) {
      window.soundManager && window.soundManager.playChime();
    }
  }

  /** Repeta ultima propozitie: butonul rotund de difuzor din jocurile cu intrebari. */
  repeat() {
    if (this.lastText) this.say(this.lastText);
  }

  stop() {
    if (this.supported) {
      try { window.speechSynthesis.cancel(); } catch (e) {}
    }
  }

  /** Cateva incurajari, ca sa nu auda mereu aceeasi vorba. */
  praise() {
    const s = ['Bravo!', 'Super!', 'Excelent!', 'Ai reusit!', 'Foarte bine!', 'Grozav!'];
    this.say(s[Math.floor(Math.random() * s.length)]);
  }

  encourage() {
    const s = ['Mai incearca!', 'Aproape! Inca o data.', 'Nu-i nimic, mai incercam.', 'Hai ca poti!'];
    this.say(s[Math.floor(Math.random() * s.length)]);
  }
}

/**
 * Butonul rotund de difuzor, desenat in canvas de jocurile cu intrebari.
 * Intoarce zona lui, ca jocul sa stie unde s-a apasat.
 */
function drawSpeakerButton(ctx, canvas) {
  const r = 26;
  const x = canvas.width - r - 16;
  const y = window.HUD_HEIGHT + r + 12;
  ctx.save();
  ctx.fillStyle = 'rgba(139, 92, 246, 0.9)';
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.font = `${r}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🔊', x, y + 1);
  ctx.restore();
  return { x, y, r };
}

function hitSpeaker(btn, px, py) {
  return btn && Math.hypot(px - btn.x, py - btn.y) <= btn.r + 8;
}

window.voice = new VoiceManager();
window.drawSpeakerButton = drawSpeakerButton;
window.hitSpeaker = hitSpeaker;
