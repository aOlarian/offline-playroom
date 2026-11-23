/* MAP
 * §1 coloring books library (35 templates) & palettes L1-L420
 * §2 flood fill & canvas rendering L422-L520
 * §3 dropdown modal picker & navigation UI L522-L720
 */

// §1 coloring books library & palettes
const COLORING_PALETTE = [
  '#ef4444', '#f97316', '#facc15', '#22c55e',
  '#06b6d4', '#3b82f6', '#a855f7', '#ec4899',
  '#78350f', '#000000', '#ffffff', '#94a3b8'
];

const COLORING_PAGES = [
  // --- ANIMALE & PĂSĂRI ---
  {
    name: 'Dinozaurul Voinic 🦖',
    icon: '🦖',
    category: 'Animale',
    draw(ctx, w, h) {
      ctx.lineWidth = 4; ctx.strokeStyle = '#000000';
      ctx.beginPath(); ctx.arc(w * 0.35, h * 0.35, 45, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(w * 0.32, h * 0.31, 8, 0, Math.PI * 2); ctx.fillStyle = '#000'; ctx.fill();
      ctx.beginPath(); ctx.ellipse(w * 0.55, h * 0.58, 75, 55, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w * 0.7, h * 0.58); ctx.quadraticCurveTo(w * 0.88, h * 0.48, w * 0.85, h * 0.38); ctx.quadraticCurveTo(w * 0.78, h * 0.61, w * 0.65, h * 0.65); ctx.stroke();
      ctx.beginPath(); ctx.rect(w * 0.45, h * 0.71, 22, 45); ctx.rect(w * 0.6, h * 0.71, 22, 45); ctx.stroke();
      for (let i = 0; i < 4; i++) {
        const sx = w * 0.45 + i * 22; const sy = h * 0.49;
        ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + 10, sy - 20); ctx.lineTo(sx + 20, sy); ctx.stroke();
      }
    }
  },
  {
    name: 'Ursulețul Jucăuș 🐻',
    icon: '🐻',
    category: 'Animale',
    draw(ctx, w, h) {
      ctx.lineWidth = 4; ctx.strokeStyle = '#000000';
      ctx.beginPath(); ctx.arc(w * 0.5, h * 0.38, 55, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(w * 0.38, h * 0.25, 20, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(w * 0.62, h * 0.25, 20, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(w * 0.5, h * 0.42, 22, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(w * 0.5, h * 0.38, 7, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(w * 0.43, h * 0.33, 5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(w * 0.57, h * 0.33, 5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(w * 0.5, h * 0.68, 65, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(w * 0.5, h * 0.70, 38, 0, Math.PI * 2); ctx.stroke();
    }
  },
  {
    name: 'Cățelușul Vesel 🐶',
    icon: '🐶',
    category: 'Animale',
    draw(ctx, w, h) {
      ctx.lineWidth = 4; ctx.strokeStyle = '#000000';
      ctx.beginPath(); ctx.arc(w * 0.5, h * 0.40, 52, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(w * 0.34, h * 0.42, 16, 36, -0.3, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(w * 0.66, h * 0.42, 16, 36, 0.3, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#000';
      ctx.beginPath(); ctx.arc(w * 0.44, h * 0.36, 6, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(w * 0.56, h * 0.36, 6, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(w * 0.5, h * 0.44, 8, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(w * 0.46, h * 0.47, 8, 0, Math.PI); ctx.stroke();
      ctx.beginPath(); ctx.arc(w * 0.54, h * 0.47, 8, 0, Math.PI); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(w * 0.5, h * 0.70, 50, 42, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(w * 0.42, h * 0.82, 16, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(w * 0.58, h * 0.82, 16, 0, Math.PI * 2); ctx.stroke();
    }
  },
  {
    name: 'Pisicuța Pufoasă 🐱',
    icon: '🐱',
    category: 'Animale',
    draw(ctx, w, h) {
      ctx.lineWidth = 4; ctx.strokeStyle = '#000000';
      ctx.beginPath(); ctx.arc(w * 0.5, h * 0.40, 52, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w * 0.37, h * 0.30); ctx.lineTo(w * 0.33, h * 0.18); ctx.lineTo(w * 0.45, h * 0.28); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w * 0.63, h * 0.30); ctx.lineTo(w * 0.67, h * 0.18); ctx.lineTo(w * 0.55, h * 0.28); ctx.stroke();
      ctx.fillStyle = '#000';
      ctx.beginPath(); ctx.arc(w * 0.43, h * 0.38, 6, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(w * 0.57, h * 0.38, 6, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(w * 0.47, h * 0.44); ctx.lineTo(w * 0.53, h * 0.44); ctx.lineTo(w * 0.50, h * 0.48); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(w * 0.38, h * 0.44); ctx.lineTo(w * 0.22, h * 0.42); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w * 0.38, h * 0.48); ctx.lineTo(w * 0.22, h * 0.50); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w * 0.62, h * 0.44); ctx.lineTo(w * 0.78, h * 0.42); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w * 0.62, h * 0.48); ctx.lineTo(w * 0.78, h * 0.50); ctx.stroke();
      ctx.beginPath(); ctx.arc(w * 0.5, h * 0.70, 58, 0, Math.PI * 2); ctx.stroke();
    }
  },
  {
    name: 'Iepurașul de Câmp 🐰',
    icon: '🐰',
    category: 'Animale',
    draw(ctx, w, h) {
      ctx.lineWidth = 4; ctx.strokeStyle = '#000000';
      ctx.beginPath(); ctx.arc(w * 0.5, h * 0.44, 48, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(w * 0.42, h * 0.22, 14, 42, -0.15, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(w * 0.58, h * 0.22, 14, 42, 0.15, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#000';
      ctx.beginPath(); ctx.arc(w * 0.43, h * 0.41, 6, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(w * 0.57, h * 0.41, 6, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(w * 0.5, h * 0.48, 6, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.rect(w * 0.47, h * 0.53, 6, 8); ctx.stroke();
      ctx.beginPath(); ctx.arc(w * 0.5, h * 0.72, 60, 0, Math.PI * 2); ctx.stroke();
    }
  },
  {
    name: 'Fluturele Colorat 🦋',
    icon: '🦋',
    category: 'Animale',
    draw(ctx, w, h) {
      ctx.lineWidth = 4; ctx.strokeStyle = '#000000';
      ctx.beginPath(); ctx.ellipse(w * 0.5, h * 0.52, 8, 45, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(w * 0.5, h * 0.36, 10, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w * 0.48, h * 0.33); ctx.quadraticCurveTo(w * 0.42, h * 0.25, w * 0.38, h * 0.28); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w * 0.52, h * 0.33); ctx.quadraticCurveTo(w * 0.58, h * 0.25, w * 0.62, h * 0.28); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(w * 0.31, h * 0.43, 40, 30, -Math.PI / 6, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(w * 0.34, h * 0.63, 28, 20, Math.PI / 6, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(w * 0.69, h * 0.43, 40, 30, Math.PI / 6, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(w * 0.66, h * 0.63, 28, 20, -Math.PI / 6, 0, Math.PI * 2); ctx.stroke();
    }
  },
  {
    name: 'Elefănțelul Cici 🐘',
    icon: '🐘',
    category: 'Animale',
    draw(ctx, w, h) {
      ctx.lineWidth = 4; ctx.strokeStyle = '#000000';
      ctx.beginPath(); ctx.arc(w * 0.60, h * 0.55, 65, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(w * 0.38, h * 0.45, 45, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w * 0.30, h * 0.48); ctx.quadraticCurveTo(w * 0.18, h * 0.55, w * 0.16, h * 0.40); ctx.quadraticCurveTo(w * 0.22, h * 0.58, w * 0.33, h * 0.55); ctx.stroke();
      ctx.beginPath(); ctx.arc(w * 0.45, h * 0.42, 32, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(w * 0.32, h * 0.40, 5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.rect(w * 0.42, h * 0.70, 20, 42); ctx.rect(w * 0.65, h * 0.70, 20, 42); ctx.stroke();
    }
  },
  {
    name: 'Leul Curajos 🦁',
    icon: '🦁',
    category: 'Animale',
    draw(ctx, w, h) {
      ctx.lineWidth = 4; ctx.strokeStyle = '#000000';
      ctx.beginPath(); ctx.arc(w * 0.5, h * 0.42, 68, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(w * 0.5, h * 0.42, 45, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(w * 0.38, h * 0.30, 14, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(w * 0.62, h * 0.30, 14, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(w * 0.5, h * 0.43, 7, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(w * 0.44, h * 0.38, 5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(w * 0.56, h * 0.38, 5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(w * 0.5, h * 0.72, 55, 0, Math.PI * 2); ctx.stroke();
    }
  },
  {
    name: 'Giraful Cel Înalt 🦒',
    icon: '🦒',
    category: 'Animale',
    draw(ctx, w, h) {
      ctx.lineWidth = 4; ctx.strokeStyle = '#000000';
      ctx.beginPath(); ctx.arc(w * 0.45, h * 0.25, 24, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w * 0.42, h * 0.20); ctx.lineTo(w * 0.40, h * 0.14); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w * 0.48, h * 0.20); ctx.lineTo(w * 0.50, h * 0.14); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w * 0.40, h * 0.28); ctx.lineTo(w * 0.43, h * 0.60); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w * 0.49, h * 0.28); ctx.lineTo(w * 0.55, h * 0.60); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(w * 0.58, h * 0.68, 48, 32, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(w * 0.46, h * 0.38, 7, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(w * 0.48, h * 0.48, 9, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.rect(w * 0.48, h * 0.75, 12, 45); ctx.rect(w * 0.64, h * 0.75, 12, 45); ctx.stroke();
    }
  },
  {
    name: 'Balena Uriașă 🐳',
    icon: '🐳',
    category: 'Animale',
    draw(ctx, w, h) {
      ctx.lineWidth = 4; ctx.strokeStyle = '#000000';
      ctx.beginPath();
      ctx.moveTo(w * 0.25, h * 0.52);
      ctx.quadraticCurveTo(w * 0.30, h * 0.32, w * 0.65, h * 0.40);
      ctx.quadraticCurveTo(w * 0.82, h * 0.48, w * 0.85, h * 0.42);
      ctx.lineTo(w * 0.82, h * 0.56);
      ctx.quadraticCurveTo(w * 0.55, h * 0.72, w * 0.25, h * 0.52);
      ctx.stroke();
      ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(w * 0.36, h * 0.48, 6, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(w * 0.34, h * 0.54, 12, 0, Math.PI * 0.6); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w * 0.52, h * 0.37); ctx.lineTo(w * 0.52, h * 0.24); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w * 0.52, h * 0.28); ctx.quadraticCurveTo(w * 0.45, h * 0.20, w * 0.40, h * 0.26); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w * 0.52, h * 0.28); ctx.quadraticCurveTo(w * 0.59, h * 0.20, w * 0.64, h * 0.26); ctx.stroke();
    }
  },
  {
    name: 'Peștișorul de Aur 🐠',
    icon: '🐠',
    category: 'Animale',
    draw(ctx, w, h) {
      ctx.lineWidth = 4; ctx.strokeStyle = '#000000';
      ctx.beginPath(); ctx.ellipse(w * 0.46, h * 0.50, 68, 48, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w * 0.68, h * 0.50); ctx.lineTo(w * 0.86, h * 0.32); ctx.lineTo(w * 0.86, h * 0.68); ctx.closePath(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w * 0.44, h * 0.34); ctx.quadraticCurveTo(w * 0.48, h * 0.20, w * 0.56, h * 0.35); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w * 0.44, h * 0.66); ctx.quadraticCurveTo(w * 0.48, h * 0.80, w * 0.56, h * 0.65); ctx.stroke();
      ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(w * 0.32, h * 0.46, 7, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(w * 0.25, h * 0.52, 5, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(w * 0.48, h * 0.50, 20, -Math.PI / 2, Math.PI / 2); ctx.stroke();
    }
  },
  {
    name: 'Broasca Țestoasă 🐢',
    icon: '🐢',
    category: 'Animale',
    draw(ctx, w, h) {
      ctx.lineWidth = 4; ctx.strokeStyle = '#000000';
      ctx.beginPath(); ctx.arc(w * 0.50, h * 0.54, 65, Math.PI, 0); ctx.closePath(); ctx.stroke();
      ctx.beginPath(); ctx.arc(w * 0.50, h * 0.45, 24, Math.PI, 0); ctx.closePath(); ctx.stroke();
      ctx.beginPath(); ctx.arc(w * 0.26, h * 0.54, 22, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(w * 0.22, h * 0.50, 4, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(w * 0.38, h * 0.62, 16, 10, 0.4, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(w * 0.62, h * 0.62, 16, 10, -0.4, 0, Math.PI * 2); ctx.stroke();
    }
  },
  {
    name: 'Pinguinul la Pol 🐧',
    icon: '🐧',
    category: 'Animale',
    draw(ctx, w, h) {
      ctx.lineWidth = 4; ctx.strokeStyle = '#000000';
      ctx.beginPath(); ctx.ellipse(w * 0.50, h * 0.52, 52, 70, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(w * 0.50, h * 0.56, 34, 48, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#000';
      ctx.beginPath(); ctx.arc(w * 0.44, h * 0.36, 5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(w * 0.56, h * 0.36, 5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(w * 0.46, h * 0.40); ctx.lineTo(w * 0.54, h * 0.40); ctx.lineTo(w * 0.50, h * 0.46); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.ellipse(w * 0.31, h * 0.52, 10, 32, 0.2, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(w * 0.69, h * 0.52, 10, 32, -0.2, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(w * 0.42, h * 0.78, 14, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(w * 0.58, h * 0.78, 14, 0, Math.PI * 2); ctx.stroke();
    }
  },
  {
    name: 'Bufnița Înțeleaptă 🦉',
    icon: '🦉',
    category: 'Animale',
    draw(ctx, w, h) {
      ctx.lineWidth = 4; ctx.strokeStyle = '#000000';
      ctx.beginPath(); ctx.ellipse(w * 0.50, h * 0.52, 56, 68, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(w * 0.40, h * 0.40, 18, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(w * 0.60, h * 0.40, 18, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#000';
      ctx.beginPath(); ctx.arc(w * 0.40, h * 0.40, 7, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(w * 0.60, h * 0.40, 7, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(w * 0.46, h * 0.46); ctx.lineTo(w * 0.54, h * 0.46); ctx.lineTo(w * 0.50, h * 0.53); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.arc(w * 0.35, h * 0.58, 20, Math.PI / 2, -Math.PI / 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(w * 0.65, h * 0.58, 20, -Math.PI / 2, Math.PI / 2); ctx.stroke();
    }
  },
  {
    name: 'Ariciul cu Mere 🦔',
    icon: '🦔',
    category: 'Animale',
    draw(ctx, w, h) {
      ctx.lineWidth = 4; ctx.strokeStyle = '#000000';
      ctx.beginPath(); ctx.arc(w * 0.54, h * 0.56, 62, Math.PI, 0); ctx.closePath(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w * 0.36, h * 0.56); ctx.lineTo(w * 0.20, h * 0.56); ctx.lineTo(w * 0.30, h * 0.46); ctx.closePath(); ctx.stroke();
      ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(w * 0.21, h * 0.56, 5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(w * 0.30, h * 0.50, 4, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(w * 0.56, h * 0.36, 18, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w * 0.56, h * 0.26); ctx.lineTo(w * 0.56, h * 0.18); ctx.stroke();
    }
  },

  // --- VEHICULE & UTILAJE ---
  {
    name: 'Mașina de Curse 🏎️',
    icon: '🏎️',
    category: 'Vehicule',
    draw(ctx, w, h) {
      ctx.lineWidth = 4; ctx.strokeStyle = '#000000';
      ctx.beginPath();
      ctx.moveTo(w * 0.2, h * 0.58); ctx.lineTo(w * 0.32, h * 0.44); ctx.lineTo(w * 0.65, h * 0.44); ctx.lineTo(w * 0.82, h * 0.58); ctx.lineTo(w * 0.85, h * 0.66); ctx.lineTo(w * 0.15, h * 0.66); ctx.closePath(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w * 0.36, h * 0.46); ctx.lineTo(w * 0.46, h * 0.34); ctx.lineTo(w * 0.58, h * 0.46); ctx.closePath(); ctx.stroke();
      ctx.beginPath(); ctx.arc(w * 0.3, h * 0.66, 18, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(w * 0.7, h * 0.66, 18, 0, Math.PI * 2); ctx.stroke();
    }
  },
  {
    name: 'Racheta Spațială 🚀',
    icon: '🚀',
    category: 'Vehicule',
    draw(ctx, w, h) {
      ctx.lineWidth = 4; ctx.strokeStyle = '#000000';
      ctx.beginPath(); ctx.moveTo(w * 0.5, h * 0.2); ctx.quadraticCurveTo(w * 0.65, h * 0.45, w * 0.65, h * 0.65); ctx.lineTo(w * 0.35, h * 0.65); ctx.quadraticCurveTo(w * 0.35, h * 0.45, w * 0.5, h * 0.2); ctx.stroke();
      ctx.beginPath(); ctx.arc(w * 0.5, h * 0.42, 24, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w * 0.35, h * 0.55); ctx.lineTo(w * 0.22, h * 0.7); ctx.lineTo(w * 0.35, h * 0.65); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w * 0.65, h * 0.55); ctx.lineTo(w * 0.78, h * 0.7); ctx.lineTo(w * 0.65, h * 0.65); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w * 0.4, h * 0.66); ctx.lineTo(w * 0.5, h * 0.82); ctx.lineTo(w * 0.6, h * 0.66); ctx.stroke();
    }
  },
  {
    name: 'Mașina de Pompieri 🚒',
    icon: '🚒',
    category: 'Vehicule',
    draw(ctx, w, h) {
      ctx.lineWidth = 4; ctx.strokeStyle = '#000000';
      ctx.beginPath(); ctx.rect(w * 0.18, h * 0.42, w * 0.64, h * 0.26); ctx.stroke();
      ctx.beginPath(); ctx.rect(w * 0.18, h * 0.42, w * 0.22, h * 0.26); ctx.stroke();
      ctx.beginPath(); ctx.rect(w * 0.22, h * 0.45, w * 0.14, h * 0.11); ctx.stroke();
      ctx.beginPath(); ctx.arc(w * 0.28, h * 0.38, 9, Math.PI, 0); ctx.stroke();
      ctx.beginPath(); ctx.rect(w * 0.44, h * 0.35, w * 0.34, 10); ctx.stroke();
      for (let i = 0; i < 4; i++) {
        const lx = w * 0.50 + i * (w * 0.07);
        ctx.beginPath(); ctx.moveTo(lx, h * 0.35); ctx.lineTo(lx, h * 0.35 + 10); ctx.stroke();
      }
      ctx.beginPath(); ctx.arc(w * 0.30, h * 0.68, 16, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(w * 0.68, h * 0.68, 16, 0, Math.PI * 2); ctx.stroke();
    }
  },
  {
    name: 'Avionul Călător ✈️',
    icon: '✈️',
    category: 'Vehicule',
    draw(ctx, w, h) {
      ctx.lineWidth = 4; ctx.strokeStyle = '#000000';
      ctx.beginPath(); ctx.ellipse(w * 0.50, h * 0.52, 90, 24, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w * 0.44, h * 0.50); ctx.lineTo(w * 0.34, h * 0.28); ctx.lineTo(w * 0.48, h * 0.28); ctx.lineTo(w * 0.58, h * 0.50); ctx.closePath(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w * 0.44, h * 0.54); ctx.lineTo(w * 0.34, h * 0.74); ctx.lineTo(w * 0.48, h * 0.74); ctx.lineTo(w * 0.58, h * 0.54); ctx.closePath(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w * 0.72, h * 0.50); ctx.lineTo(w * 0.82, h * 0.34); ctx.lineTo(w * 0.77, h * 0.34); ctx.lineTo(w * 0.65, h * 0.50); ctx.closePath(); ctx.stroke();
      for (let i = 0; i < 4; i++) {
        ctx.beginPath(); ctx.arc(w * 0.36 + i * 22, h * 0.52, 6, 0, Math.PI * 2); ctx.stroke();
      }
    }
  },
  {
    name: 'Trenulețul Thomas 🚂',
    icon: '🚂',
    category: 'Vehicule',
    draw(ctx, w, h) {
      ctx.lineWidth = 4; ctx.strokeStyle = '#000000';
      ctx.beginPath(); ctx.rect(w * 0.25, h * 0.46, w * 0.35, h * 0.22); ctx.stroke();
      ctx.beginPath(); ctx.rect(w * 0.60, h * 0.36, w * 0.20, h * 0.32); ctx.stroke();
      ctx.beginPath(); ctx.rect(w * 0.64, h * 0.40, w * 0.12, h * 0.12); ctx.stroke();
      ctx.beginPath(); ctx.rect(w * 0.32, h * 0.34, 18, 24); ctx.stroke();
      ctx.beginPath(); ctx.arc(w * 0.35, h * 0.24, 12, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(w * 0.42, h * 0.18, 16, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(w * 0.34, h * 0.68, 16, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(w * 0.50, h * 0.68, 16, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(w * 0.70, h * 0.68, 22, 0, Math.PI * 2); ctx.stroke();
    }
  },
  {
    name: 'Tractorul Harnic 🚜',
    icon: '🚜',
    category: 'Vehicule',
    draw(ctx, w, h) {
      ctx.lineWidth = 4; ctx.strokeStyle = '#000000';
      ctx.beginPath(); ctx.rect(w * 0.22, h * 0.50, w * 0.28, h * 0.18); ctx.stroke();
      ctx.beginPath(); ctx.rect(w * 0.50, h * 0.36, w * 0.26, h * 0.32); ctx.stroke();
      ctx.beginPath(); ctx.rect(w * 0.54, h * 0.40, w * 0.18, h * 0.14); ctx.stroke();
      ctx.beginPath(); ctx.rect(w * 0.30, h * 0.38, 10, 24); ctx.stroke();
      ctx.beginPath(); ctx.arc(w * 0.32, h * 0.68, 18, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(w * 0.68, h * 0.64, 32, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(w * 0.68, h * 0.64, 12, 0, Math.PI * 2); ctx.stroke();
    }
  },
  {
    name: 'Elicopterul de Salvare 🚁',
    icon: '🚁',
    category: 'Vehicule',
    draw(ctx, w, h) {
      ctx.lineWidth = 4; ctx.strokeStyle = '#000000';
      ctx.beginPath(); ctx.ellipse(w * 0.42, h * 0.52, 55, 38, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(w * 0.32, h * 0.48, 18, 0, Math.PI); ctx.closePath(); ctx.stroke();
      ctx.beginPath(); ctx.rect(w * 0.62, h * 0.48, w * 0.22, 10); ctx.stroke();
      ctx.beginPath(); ctx.rect(w * 0.82, h * 0.40, 8, 26); ctx.stroke();
      ctx.beginPath(); ctx.rect(w * 0.40, h * 0.34, 6, 12); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(w * 0.43, h * 0.32, 75, 6, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w * 0.28, h * 0.72); ctx.lineTo(w * 0.62, h * 0.72); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w * 0.36, h * 0.64); ctx.lineTo(w * 0.36, h * 0.72); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w * 0.52, h * 0.64); ctx.lineTo(w * 0.52, h * 0.72); ctx.stroke();
    }
  },
  {
    name: 'Submarinul Galben 🚤',
    icon: '🚤',
    category: 'Vehicule',
    draw(ctx, w, h) {
      ctx.lineWidth = 4; ctx.strokeStyle = '#000000';
      ctx.beginPath(); ctx.ellipse(w * 0.50, h * 0.54, 82, 38, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.rect(w * 0.46, h * 0.34, 20, 20); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w * 0.54, h * 0.34); ctx.lineTo(w * 0.54, h * 0.24); ctx.lineTo(w * 0.62, h * 0.24); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(w * 0.78, h * 0.54, 8, 22, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(w * 0.36, h * 0.54, 12, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(w * 0.52, h * 0.54, 12, 0, Math.PI * 2); ctx.stroke();
    }
  },
  {
    name: 'Excavatorul Puternic 🚜',
    icon: '🏗️',
    category: 'Vehicule',
    draw(ctx, w, h) {
      ctx.lineWidth = 4; ctx.strokeStyle = '#000000';
      ctx.beginPath(); ctx.roundRect(w * 0.25, h * 0.66, w * 0.46, 24, 12); ctx.stroke();
      ctx.beginPath(); ctx.rect(w * 0.30, h * 0.46, w * 0.34, h * 0.20); ctx.stroke();
      ctx.beginPath(); ctx.rect(w * 0.34, h * 0.49, w * 0.12, h * 0.12); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w * 0.58, h * 0.52); ctx.lineTo(w * 0.72, h * 0.36); ctx.lineTo(w * 0.84, h * 0.56); ctx.stroke();
      ctx.beginPath(); ctx.arc(w * 0.84, h * 0.60, 16, Math.PI, 0); ctx.stroke();
    }
  },

  // --- NATURĂ, SPAȚIU & PLANTE ---
  {
    name: 'Castelul Fermecat 🏰',
    icon: '🏰',
    category: 'Natură & Povești',
    draw(ctx, w, h) {
      ctx.lineWidth = 4; ctx.strokeStyle = '#000000';
      ctx.beginPath(); ctx.rect(w * 0.35, h * 0.44, w * 0.3, h * 0.32); ctx.stroke();
      ctx.beginPath(); ctx.arc(w * 0.5, h * 0.76, 20, Math.PI, 0); ctx.lineTo(w * 0.55, h * 0.76); ctx.lineTo(w * 0.45, h * 0.76); ctx.stroke();
      ctx.beginPath(); ctx.rect(w * 0.22, h * 0.34, w * 0.13, h * 0.42); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w * 0.22, h * 0.34); ctx.lineTo(w * 0.285, h * 0.20); ctx.lineTo(w * 0.35, h * 0.34); ctx.closePath(); ctx.stroke();
      ctx.beginPath(); ctx.rect(w * 0.65, h * 0.34, w * 0.13, h * 0.42); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w * 0.65, h * 0.34); ctx.lineTo(w * 0.715, h * 0.20); ctx.lineTo(w * 0.78, h * 0.34); ctx.closePath(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w * 0.285, h * 0.20); ctx.lineTo(w * 0.285, h * 0.12); ctx.lineTo(w * 0.34, h * 0.16); ctx.lineTo(w * 0.285, h * 0.20); ctx.stroke();
    }
  },
  {
    name: 'Bradul de Crăciun 🎄',
    icon: '🎄',
    category: 'Natură & Povești',
    draw(ctx, w, h) {
      ctx.lineWidth = 4; ctx.strokeStyle = '#000000';
      ctx.beginPath(); ctx.arc(w * 0.5, h * 0.20, 10, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w * 0.5, h * 0.24); ctx.lineTo(w * 0.62, h * 0.38); ctx.lineTo(w * 0.55, h * 0.38); ctx.lineTo(w * 0.68, h * 0.54); ctx.lineTo(w * 0.60, h * 0.54); ctx.lineTo(w * 0.74, h * 0.70); ctx.lineTo(w * 0.26, h * 0.70); ctx.lineTo(w * 0.40, h * 0.54); ctx.lineTo(w * 0.32, h * 0.54); ctx.lineTo(w * 0.45, h * 0.38); ctx.lineTo(w * 0.38, h * 0.38); ctx.closePath(); ctx.stroke();
      ctx.beginPath(); ctx.rect(w * 0.44, h * 0.70, w * 0.12, 28); ctx.stroke();
      ctx.beginPath(); ctx.arc(w * 0.44, h * 0.46, 8, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(w * 0.58, h * 0.48, 8, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(w * 0.38, h * 0.62, 9, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(w * 0.62, h * 0.64, 9, 0, Math.PI * 2); ctx.stroke();
    }
  },
  {
    name: 'Omul de Zăpadă ⛄',
    icon: '⛄',
    category: 'Natură & Povești',
    draw(ctx, w, h) {
      ctx.lineWidth = 4; ctx.strokeStyle = '#000000';
      ctx.beginPath(); ctx.arc(w * 0.50, h * 0.36, 32, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(w * 0.50, h * 0.56, 44, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(w * 0.50, h * 0.76, 56, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.rect(w * 0.38, h * 0.20, 36, 24); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w * 0.32, h * 0.24); ctx.lineTo(w * 0.68, h * 0.24); ctx.stroke();
      ctx.fillStyle = '#000';
      ctx.beginPath(); ctx.arc(w * 0.45, h * 0.34, 4, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(w * 0.55, h * 0.34, 4, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(w * 0.50, h * 0.37); ctx.lineTo(w * 0.64, h * 0.39); ctx.lineTo(w * 0.50, h * 0.41); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.arc(w * 0.50, h * 0.52, 5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(w * 0.50, h * 0.60, 5, 0, Math.PI * 2); ctx.fill();
    }
  },
  {
    name: 'Floarea Soarelui 🌻',
    icon: '🌻',
    category: 'Natură & Povești',
    draw(ctx, w, h) {
      ctx.lineWidth = 4; ctx.strokeStyle = '#000000';
      ctx.beginPath(); ctx.rect(w * 0.47, h * 0.56, 12, h * 0.24); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(w * 0.34, h * 0.68, 28, 14, -0.3, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(w * 0.66, h * 0.68, 28, 14, 0.3, 0, Math.PI * 2); ctx.stroke();
      for (let i = 0; i < 8; i++) {
        const ang = (i * Math.PI * 2) / 8;
        const px = w * 0.5 + Math.cos(ang) * 55;
        const py = h * 0.40 + Math.sin(ang) * 55;
        ctx.beginPath(); ctx.arc(px, py, 18, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.beginPath(); ctx.arc(w * 0.5, h * 0.40, 36, 0, Math.PI * 2); ctx.stroke();
    }
  },
  {
    name: 'Soarele Zâmbăreț ☀️',
    icon: '☀️',
    category: 'Natură & Povești',
    draw(ctx, w, h) {
      ctx.lineWidth = 4; ctx.strokeStyle = '#000000';
      for (let i = 0; i < 12; i++) {
        const ang = (i * Math.PI * 2) / 12;
        const r1 = 58;
        const r2 = 82;
        ctx.beginPath();
        ctx.moveTo(w * 0.5 + Math.cos(ang) * r1, h * 0.48 + Math.sin(ang) * r1);
        ctx.lineTo(w * 0.5 + Math.cos(ang) * r2, h * 0.48 + Math.sin(ang) * r2);
        ctx.stroke();
      }
      ctx.beginPath(); ctx.arc(w * 0.5, h * 0.48, 54, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#000';
      ctx.beginPath(); ctx.arc(w * 0.42, h * 0.44, 6, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(w * 0.58, h * 0.44, 6, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(w * 0.50, h * 0.48, 22, 0, Math.PI); ctx.stroke();
    }
  },
  {
    name: 'Planeta Saturn 🪐',
    icon: '🪐',
    category: 'Natură & Povești',
    draw(ctx, w, h) {
      ctx.lineWidth = 4; ctx.strokeStyle = '#000000';
      ctx.beginPath(); ctx.arc(w * 0.5, h * 0.50, 56, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(w * 0.5, h * 0.50, 105, 30, -0.35, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(w * 0.5, h * 0.50, 85, 20, -0.35, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(w * 0.22, h * 0.30, 8, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(w * 0.78, h * 0.32, 10, 0, Math.PI * 2); ctx.stroke();
    }
  },
  {
    name: 'Farfuria Zburătoare 🛸',
    icon: '🛸',
    category: 'Natură & Povești',
    draw(ctx, w, h) {
      ctx.lineWidth = 4; ctx.strokeStyle = '#000000';
      ctx.beginPath(); ctx.arc(w * 0.50, h * 0.44, 38, Math.PI, 0); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(w * 0.50, h * 0.48, 92, 26, 0, 0, Math.PI * 2); ctx.stroke();
      for (let i = 0; i < 5; i++) {
        ctx.beginPath(); ctx.arc(w * 0.26 + i * 30, h * 0.48, 7, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.beginPath(); ctx.moveTo(w * 0.38, h * 0.56); ctx.lineTo(w * 0.24, h * 0.78); ctx.lineTo(w * 0.76, h * 0.78); ctx.lineTo(w * 0.62, h * 0.56); ctx.stroke();
    }
  },

  // --- OBIECTE, DULCIURI & EROI ---
  {
    name: 'Robotul Prietenos 🤖',
    icon: '🤖',
    category: 'Eroi & Obiecte',
    draw(ctx, w, h) {
      ctx.lineWidth = 4; ctx.strokeStyle = '#000000';
      ctx.beginPath(); ctx.rect(w * 0.35, h * 0.26, w * 0.30, h * 0.22); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w * 0.50, h * 0.26); ctx.lineTo(w * 0.50, h * 0.16); ctx.stroke();
      ctx.beginPath(); ctx.arc(w * 0.50, h * 0.14, 8, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.rect(w * 0.39, h * 0.32, 16, 16); ctx.stroke();
      ctx.beginPath(); ctx.rect(w * 0.53, h * 0.32, 16, 16); ctx.stroke();
      ctx.beginPath(); ctx.rect(w * 0.42, h * 0.42, 28, 6); ctx.stroke();
      ctx.beginPath(); ctx.rect(w * 0.30, h * 0.52, w * 0.40, h * 0.24); ctx.stroke();
      ctx.beginPath(); ctx.arc(w * 0.42, h * 0.64, 10, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(w * 0.58, h * 0.64, 10, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.rect(w * 0.18, h * 0.54, 24, 14); ctx.stroke();
      ctx.beginPath(); ctx.rect(w * 0.74, h * 0.54, 24, 14); ctx.stroke();
    }
  },
  {
    name: 'Cupa Campionului 🏆',
    icon: '🏆',
    category: 'Eroi & Obiecte',
    draw(ctx, w, h) {
      ctx.lineWidth = 4; ctx.strokeStyle = '#000000';
      ctx.beginPath();
      ctx.moveTo(w * 0.32, h * 0.30);
      ctx.lineTo(w * 0.68, h * 0.30);
      ctx.lineTo(w * 0.64, h * 0.52);
      ctx.quadraticCurveTo(w * 0.50, h * 0.64, w * 0.36, h * 0.52);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath(); ctx.arc(w * 0.28, h * 0.42, 16, Math.PI / 2, -Math.PI / 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(w * 0.72, h * 0.42, 16, -Math.PI / 2, Math.PI / 2); ctx.stroke();
      ctx.beginPath(); ctx.rect(w * 0.46, h * 0.60, 14, 20); ctx.stroke();
      ctx.beginPath(); ctx.rect(w * 0.34, h * 0.72, w * 0.32, 18); ctx.stroke();
      ctx.beginPath(); ctx.arc(w * 0.50, h * 0.42, 10, 0, Math.PI * 2); ctx.stroke();
    }
  },
  {
    name: 'Coroana Regală 👑',
    icon: '👑',
    category: 'Eroi & Obiecte',
    draw(ctx, w, h) {
      ctx.lineWidth = 4; ctx.strokeStyle = '#000000';
      ctx.beginPath();
      ctx.moveTo(w * 0.22, h * 0.62);
      ctx.lineTo(w * 0.20, h * 0.36);
      ctx.lineTo(w * 0.35, h * 0.48);
      ctx.lineTo(w * 0.50, h * 0.30);
      ctx.lineTo(w * 0.65, h * 0.48);
      ctx.lineTo(w * 0.80, h * 0.36);
      ctx.lineTo(w * 0.78, h * 0.62);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath(); ctx.arc(w * 0.20, h * 0.34, 7, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(w * 0.50, h * 0.28, 9, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(w * 0.80, h * 0.34, 7, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.rect(w * 0.22, h * 0.64, w * 0.56, 14); ctx.stroke();
    }
  },
  {
    name: 'Înghețata Delicioasă 🍦',
    icon: '🍦',
    category: 'Eroi & Obiecte',
    draw(ctx, w, h) {
      ctx.lineWidth = 4; ctx.strokeStyle = '#000000';
      ctx.beginPath();
      ctx.moveTo(w * 0.32, h * 0.52);
      ctx.lineTo(w * 0.68, h * 0.52);
      ctx.lineTo(w * 0.50, h * 0.82);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w * 0.40, h * 0.52); ctx.lineTo(w * 0.56, h * 0.72); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w * 0.60, h * 0.52); ctx.lineTo(w * 0.44, h * 0.72); ctx.stroke();
      ctx.beginPath(); ctx.arc(w * 0.42, h * 0.46, 24, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(w * 0.58, h * 0.46, 24, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(w * 0.50, h * 0.32, 26, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(w * 0.50, h * 0.18, 10, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w * 0.50, h * 0.18); ctx.quadraticCurveTo(w * 0.58, h * 0.10, w * 0.62, h * 0.12); ctx.stroke();
    }
  },
  {
    name: 'Tortul Aniversar 🎂',
    icon: '🎂',
    category: 'Eroi & Obiecte',
    draw(ctx, w, h) {
      ctx.lineWidth = 4; ctx.strokeStyle = '#000000';
      ctx.beginPath(); ctx.rect(w * 0.22, h * 0.56, w * 0.56, h * 0.20); ctx.stroke();
      ctx.beginPath(); ctx.rect(w * 0.32, h * 0.40, w * 0.36, h * 0.16); ctx.stroke();
      ctx.beginPath(); ctx.rect(w * 0.47, h * 0.28, 10, 20); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(w * 0.50, h * 0.22, 6, 12, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(w * 0.36, h * 0.40, 7, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(w * 0.64, h * 0.40, 7, 0, Math.PI * 2); ctx.stroke();
    }
  },
  {
    name: 'Mingea de Fotbal ⚽',
    icon: '⚽',
    category: 'Eroi & Obiecte',
    draw(ctx, w, h) {
      ctx.lineWidth = 4; ctx.strokeStyle = '#000000';
      ctx.beginPath(); ctx.arc(w * 0.50, h * 0.50, 72, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const ang = (i * Math.PI * 2) / 5 - Math.PI / 2;
        const px = w * 0.5 + Math.cos(ang) * 26;
        const py = h * 0.5 + Math.sin(ang) * 26;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
      for (let i = 0; i < 5; i++) {
        const ang = (i * Math.PI * 2) / 5 - Math.PI / 2;
        ctx.beginPath();
        ctx.moveTo(w * 0.5 + Math.cos(ang) * 26, h * 0.5 + Math.sin(ang) * 26);
        ctx.lineTo(w * 0.5 + Math.cos(ang) * 68, h * 0.5 + Math.sin(ang) * 68);
        ctx.stroke();
      }
    }
  },
  {
    name: 'Căsuța din Povești 🏠',
    icon: '🏠',
    category: 'Natură & Povești',
    draw(ctx, w, h) {
      ctx.lineWidth = 4; ctx.strokeStyle = '#000000';
      ctx.beginPath(); ctx.rect(w * 0.28, h * 0.46, w * 0.44, h * 0.32); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w * 0.22, h * 0.46); ctx.lineTo(w * 0.50, h * 0.24); ctx.lineTo(w * 0.78, h * 0.46); ctx.closePath(); ctx.stroke();
      ctx.beginPath(); ctx.rect(w * 0.62, h * 0.26, 14, 20); ctx.stroke();
      ctx.beginPath(); ctx.rect(w * 0.44, h * 0.58, 24, 38); ctx.stroke();
      ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(w * 0.48, h * 0.68, 3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.rect(w * 0.33, h * 0.52, 20, 20); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w * 0.33, h * 0.62); ctx.lineTo(w * 0.33 + 20, h * 0.62); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w * 0.33 + 10, h * 0.52); ctx.lineTo(w * 0.33 + 10, h * 0.72); ctx.stroke();
    }
  },
  {
    name: 'Ciupercuța Fermecată 🍄',
    icon: '🍄',
    category: 'Natură & Povești',
    draw(ctx, w, h) {
      ctx.lineWidth = 4; ctx.strokeStyle = '#000000';
      ctx.beginPath(); ctx.arc(w * 0.50, h * 0.48, 70, Math.PI, 0); ctx.closePath(); ctx.stroke();
      ctx.beginPath(); ctx.rect(w * 0.40, h * 0.48, w * 0.20, h * 0.30); ctx.stroke();
      ctx.beginPath(); ctx.arc(w * 0.38, h * 0.36, 12, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(w * 0.62, h * 0.36, 12, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(w * 0.50, h * 0.26, 14, 0, Math.PI * 2); ctx.stroke();
    }
  },
  {
    name: 'Căpșuna Dulce 🍓',
    icon: '🍓',
    category: 'Eroi & Obiecte',
    draw(ctx, w, h) {
      ctx.lineWidth = 4; ctx.strokeStyle = '#000000';
      ctx.beginPath();
      ctx.moveTo(w * 0.30, h * 0.36);
      ctx.quadraticCurveTo(w * 0.70, h * 0.36, w * 0.70, h * 0.46);
      ctx.quadraticCurveTo(w * 0.66, h * 0.72, w * 0.50, h * 0.80);
      ctx.quadraticCurveTo(w * 0.34, h * 0.72, w * 0.30, h * 0.46);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath(); ctx.ellipse(w * 0.42, h * 0.32, 14, 8, -0.4, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(w * 0.58, h * 0.32, 14, 8, 0.4, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(w * 0.50, h * 0.28, 12, 8, 0, 0, Math.PI * 2); ctx.stroke();
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          ctx.beginPath(); ctx.arc(w * 0.40 + i * 16, h * 0.46 + j * 16, 3, 0, Math.PI * 2); ctx.stroke();
        }
      }
    }
  }
];

class ColoringGame {
  constructor() {
    this.name = 'Cărți de Colorat 🎨';
    this.maxLevel = 1;
    this.usesSpeed = false;
    this.boundDown = this.handleDown.bind(this);
    this.boundResize = this.resize.bind(this);
    this.running = false;
    this.pageIdx = 0;
    this.showPagePicker = false;
    this.pickerScrollY = 0;
  }

  init(canvas) {
    this.stop();
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.resize();
    this.page = COLORING_PAGES[this.pageIdx];
    this.selectedColor = COLORING_PALETTE[0];
    this.filledAreas = 0;
    this.showPagePicker = false;
    this.pickerScrollY = 0;

    this.renderBlankPage();
    this.running = true;

    canvas.addEventListener('pointerdown', this.boundDown);
    window.addEventListener('resize', this.boundResize);

    window.hub.updateScore(0);
    this.announcePage();
    this.loop();
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = Math.max(320, rect.width);
    this.canvas.height = Math.max(380, rect.height);
    this.topBarY = 6;
    this.topBarH = 48;
    this.paletteY = this.canvas.height - 62;
    this.colorSize = Math.min(36, (this.canvas.width - 24) / COLORING_PALETTE.length);
  }

  announcePage() {
    window.voice.say(`Planșa ${this.pageIdx + 1} din ${COLORING_PAGES.length}: ${this.page.name}. Alege o culoare!`);
  }

  selectPage(idx) {
    this.pageIdx = (idx + COLORING_PAGES.length) % COLORING_PAGES.length;
    this.page = COLORING_PAGES[this.pageIdx];
    this.showPagePicker = false;
    this.renderBlankPage();
    this.announcePage();
    window.soundManager.playClick();
  }

  nextPage() {
    this.selectPage(this.pageIdx + 1);
  }

  prevPage() {
    this.selectPage(this.pageIdx - 1);
  }

  renderBlankPage() {
    const { ctx, canvas } = this;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    this.page.draw(ctx, canvas.width, canvas.height - 30);
  }

  // §2 flood fill & canvas rendering
  handleDown(event) {
    if (!this.running) return;
    const rect = this.canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) * this.canvas.width / rect.width);
    const y = Math.floor((event.clientY - rect.top) * this.canvas.height / rect.height);

    // If dropdown picker modal is open
    if (this.showPagePicker) {
      this.handlePickerClick(x, y);
      return;
    }

    // Check Top Bar (Dropdown & Arrow buttons)
    if (y >= this.topBarY && y <= this.topBarY + this.topBarH) {
      // Left button: Prev page ◀️
      if (x < 56) {
        this.prevPage();
        return;
      }
      // Right button: Next page ▶️
      if (x > this.canvas.width - 56) {
        this.nextPage();
        return;
      }
      // Center area: Open Dropdown Picker 📋
      this.showPagePicker = true;
      window.soundManager.playClick();
      return;
    }

    // Check Bottom Palette
    if (y >= this.paletteY - 10) {
      const idx = Math.floor((x - 12) / this.colorSize);
      if (idx >= 0 && idx < COLORING_PALETTE.length) {
        this.selectedColor = COLORING_PALETTE[idx];
        window.soundManager.playClick();
      }
      return;
    }

    // Flood fill area on canvas
    this.floodFill(x, y, this.selectedColor);
  }

  handlePickerClick(x, y) {
    const modalX = 14;
    const modalY = 20;
    const modalW = this.canvas.width - 28;
    const modalH = this.canvas.height - 40;

    // Header buttons in modal: Close or Scroll
    if (x > modalX + modalW - 50 && y < modalY + 45) {
      this.showPagePicker = false;
      window.soundManager.playClick();
      return;
    }

    // Scroll up / down buttons inside modal
    if (y >= modalY + modalH - 52 && y <= modalY + modalH - 6) {
      if (x < modalX + modalW / 2) {
        // Prev page of items
        this.pickerScrollY = Math.max(0, this.pickerScrollY - 6);
      } else {
        // Next page of items
        const maxScroll = Math.max(0, COLORING_PAGES.length - 6);
        this.pickerScrollY = Math.min(maxScroll, this.pickerScrollY + 6);
      }
      window.soundManager.playClick();
      return;
    }

    // Check click on items list
    const startY = modalY + 52;
    const itemH = 38;
    const visibleCount = Math.floor((modalH - 110) / itemH);

    for (let i = 0; i < visibleCount; i++) {
      const pageIndex = this.pickerScrollY + i;
      if (pageIndex >= COLORING_PAGES.length) break;

      const iy = startY + i * itemH;
      if (x >= modalX + 10 && x <= modalX + modalW - 10 && y >= iy && y <= iy + itemH) {
        this.selectPage(pageIndex);
        return;
      }
    }

    // Tap outside modal closes
    if (x < modalX || x > modalX + modalW || y < modalY || y > modalY + modalH) {
      this.showPagePicker = false;
    }
  }

  floodFill(startX, startY, fillColorHex) {
    const ctx = this.ctx;
    const imgData = ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const data = imgData.data;
    const width = this.canvas.width;
    const height = this.canvas.height;

    const startIdx = (startY * width + startX) * 4;
    const startR = data[startIdx];
    const startG = data[startIdx + 1];
    const startB = data[startIdx + 2];

    // Don't fill on black outlines
    if (startR < 50 && startG < 50 && startB < 50) return;

    // Convert hex to rgb
    const tempDiv = document.createElement('div');
    tempDiv.style.color = fillColorHex;
    document.body.appendChild(tempDiv);
    const rgbStr = window.getComputedStyle(tempDiv).color;
    document.body.removeChild(tempDiv);
    const match = rgbStr.match(/\d+/g);
    if (!match) return;
    const fillR = parseInt(match[0], 10);
    const fillG = parseInt(match[1], 10);
    const fillB = parseInt(match[2], 10);

    if (startR === fillR && startG === fillG && startB === fillB) return;

    const stack = [[startX, startY]];
    const matchStart = (idx) => {
      return Math.abs(data[idx] - startR) < 30 &&
             Math.abs(data[idx + 1] - startG) < 30 &&
             Math.abs(data[idx + 2] - startB) < 30;
    };

    let filledPixels = 0;
    const topLimit = this.topBarY + this.topBarH;
    const bottomLimit = this.paletteY - 10;

    while (stack.length > 0 && filledPixels < 180000) {
      const [cx, cy] = stack.pop();
      const idx = (cy * width + cx) * 4;

      if (cx < 0 || cx >= width || cy < topLimit || cy >= bottomLimit) continue;
      if (!matchStart(idx)) continue;

      data[idx] = fillR;
      data[idx + 1] = fillG;
      data[idx + 2] = fillB;
      data[idx + 3] = 255;
      filledPixels++;

      stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
    }

    ctx.putImageData(imgData, 0, 0);
    this.filledAreas++;
    window.soundManager.playPop(1.2);
    window.confettiManager.start(150);
  }

  // §3 dropdown modal picker & navigation UI
  loop() {
    if (!this.running) return;
    this.drawUI();
    requestAnimationFrame(() => this.loop());
  }

  drawUI() {
    const { ctx, canvas } = this;
    const py = this.paletteY;

    // Top Bar Container
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(8, this.topBarY, canvas.width - 16, this.topBarH, 14);
    ctx.fill();
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Prev Arrow
    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('◀️', 32, this.topBarY + this.topBarH / 2);

    // Center Dropdown Title Button
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px sans-serif';
    const label = `${this.page.icon} ${this.page.name} (${this.pageIdx + 1}/${COLORING_PAGES.length})`;
    const truncated = label.length > 25 ? label.substring(0, 24) + '...' : label;
    ctx.fillText(truncated, canvas.width / 2 - 12, this.topBarY + this.topBarH / 2);

    // Dropdown arrow indicator
    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('▼', canvas.width / 2 + (truncated.length * 4) + 10, this.topBarY + this.topBarH / 2);

    // Next Arrow
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('▶️', canvas.width - 32, this.topBarY + this.topBarH / 2);

    // Palette background at bottom
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, py - 10, canvas.width, canvas.height - py + 10);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, py - 10); ctx.lineTo(canvas.width, py - 10); ctx.stroke();

    COLORING_PALETTE.forEach((color, idx) => {
      const cx = 12 + idx * this.colorSize + this.colorSize / 2;
      const isSelected = color === this.selectedColor;

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(cx, py + 18, isSelected ? this.colorSize * 0.48 : this.colorSize * 0.38, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = isSelected ? '#facc15' : '#475569';
      ctx.lineWidth = isSelected ? 4 : 1.5;
      ctx.stroke();
    });

    // Render Dropdown Picker Modal Popup if open
    if (this.showPagePicker) {
      this.drawPagePickerModal();
    }
  }

  drawPagePickerModal() {
    const { ctx, canvas } = this;
    const modalX = 14;
    const modalY = 16;
    const modalW = canvas.width - 28;
    const modalH = canvas.height - 32;

    // Overlay
    ctx.fillStyle = 'rgba(2, 6, 23, 0.85)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Card
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(modalX, modalY, modalW, modalH, 18);
    ctx.fill();
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Modal Title & Close Button
    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 17px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`Alege Planșa (${COLORING_PAGES.length} modele) 🎨`, modalX + 16, modalY + 26);

    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✖️', modalX + modalW - 24, modalY + 26);

    // Items list
    const startY = modalY + 54;
    const itemH = 38;
    const visibleCount = Math.floor((modalH - 115) / itemH);

    for (let i = 0; i < visibleCount; i++) {
      const pageIndex = this.pickerScrollY + i;
      if (pageIndex >= COLORING_PAGES.length) break;

      const p = COLORING_PAGES[pageIndex];
      const isSelected = pageIndex === this.pageIdx;
      const iy = startY + i * itemH;

      if (isSelected) {
        ctx.fillStyle = 'rgba(99, 102, 241, 0.35)';
        ctx.beginPath();
        ctx.roundRect(modalX + 8, iy - 2, modalW - 16, itemH - 4, 8);
        ctx.fill();
      }

      // Icon & Name
      ctx.fillStyle = isSelected ? '#38bdf8' : '#f8fafc';
      ctx.font = isSelected ? 'bold 15px sans-serif' : '14px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${p.icon} ${p.name}`, modalX + 18, iy + itemH / 2);

      // Category badge on right
      ctx.fillStyle = '#64748b';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(p.category || '', modalX + modalW - 18, iy + itemH / 2);
    }

    // Scroll / Paging footer
    const footerY = modalY + modalH - 48;
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(modalX + 8, footerY, modalW - 16, 40, 10);
    ctx.fill();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⬆️ Mai sus', modalX + modalW * 0.25, footerY + 20);
    ctx.fillText('⬇️ Mai jos', modalX + modalW * 0.75, footerY + 20);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px sans-serif';
    ctx.fillText(`${this.pickerScrollY + 1}-${Math.min(COLORING_PAGES.length, this.pickerScrollY + visibleCount)}`, modalX + modalW * 0.5, footerY + 20);
  }

  restart() {
    this.renderBlankPage();
  }

  stop() {
    this.running = false;
    if (this.canvas) this.canvas.removeEventListener('pointerdown', this.boundDown);
    window.removeEventListener('resize', this.boundResize);
  }
}

window.hub.registerGame('coloring', new ColoringGame());
