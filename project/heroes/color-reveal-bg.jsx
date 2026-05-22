/* global React */
// Global B&W → color reveal background.
// Layers: color image at the bottom, grayscale-filtered copy on top, soft circular cutout in the
// grayscale layer that follows the cursor — revealing the color underneath.
//
// Image is drawn entirely in CSS so the design is self-contained. Composed of layered radial
// gradients to mimic a cinematic still (sky / horizon / silhouettes / film grain).

const { useState: useStateBG, useEffect: useEffectBG, useRef: useRefBG } = React;

// Props:
//   colorSrc   — URL of the COLOR photo (revealed at cursor)
//   bwSrc      — URL of the BLACK & WHITE photo (covers everything else)
//                If only colorSrc is provided, the B&W layer is auto-generated via CSS grayscale().
//                If neither is provided, falls back to the built-in cinematic gradient scenes.
//   fullReveal — undefined → modo cursor (desktop): a máscara circular segue o mouse.
//                boolean   → modo mobile: sem cursor. false = camada P&B cobre tudo;
//                            true = camada P&B some por inteiro, revelando a cor.
function ColorRevealBackground({ palette, intensity = 1, sceneIdx = 0, colorSrc, bwSrc, fullReveal }) {
  const mobileMode = fullReveal !== undefined;
  const [mouse, setMouse] = useStateBG({ x: 0.5, y: 0.5, active: false });
  const ref = useRefBG(null);

  useEffectBG(() => {
    if (mobileMode) return; // modo mobile não usa cursor
    const el = ref.current;
    if (!el) return;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      setMouse({
        x: (e.clientX - r.left) / r.width,
        y: (e.clientY - r.top) / r.height,
        active: true,
      });
    };
    const onLeave = () => setMouse((m) => ({ ...m, active: false }));
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, [mobileMode]);

  // A few cinematic "film still" scenes built from radial gradients.
  const scenes = [
    // Warm sunset over silhouetted hills
    {
      bg: `
        radial-gradient(ellipse 120% 60% at 50% 110%, #1a0a08 0%, #2a1410 40%, transparent 70%),
        radial-gradient(ellipse 90% 50% at 30% 95%, #0a0606 0%, transparent 60%),
        radial-gradient(ellipse 80% 40% at 70% 100%, #150806 0%, transparent 60%),
        radial-gradient(ellipse 130% 70% at 50% 50%, #d4805a 0%, #c45a3a 25%, #6a2a1a 55%, #1a0808 85%),
        radial-gradient(circle at 65% 35%, #f5d4a0 0%, #f0a070 8%, transparent 18%)
      `,
    },
    // Cool ocean / blue hour
    {
      bg: `
        radial-gradient(ellipse 140% 70% at 50% 110%, #050810 0%, #0a1420 50%, transparent 75%),
        radial-gradient(ellipse 100% 50% at 50% 90%, #08101c 0%, transparent 60%),
        radial-gradient(ellipse 130% 80% at 50% 30%, #4a7a9a 0%, #2a4a6a 30%, #15263a 60%, #060c14 90%),
        radial-gradient(circle at 30% 25%, #d4e4f0 0%, #8aa4c0 6%, transparent 14%)
      `,
    },
    // Forest / green moody
    {
      bg: `
        radial-gradient(ellipse 130% 70% at 50% 105%, #050a06 0%, #0a1410 50%, transparent 75%),
        radial-gradient(ellipse 90% 50% at 30% 90%, #081410 0%, transparent 60%),
        radial-gradient(ellipse 80% 40% at 75% 95%, #0a1a14 0%, transparent 60%),
        radial-gradient(ellipse 130% 70% at 50% 40%, #6a8a6a 0%, #4a6a4a 25%, #2a3a2a 55%, #0a1410 90%),
        radial-gradient(circle at 70% 20%, #e0e8d4 0%, #a0b08a 8%, transparent 18%)
      `,
    },
    // Crimson / interior film noir
    {
      bg: `
        radial-gradient(ellipse 120% 70% at 50% 105%, #0a0303 0%, #1a0606 50%, transparent 75%),
        radial-gradient(ellipse 110% 60% at 50% 50%, #8a2a2a 0%, #5a1818 30%, #2a0a0a 60%, #0a0303 90%),
        radial-gradient(circle at 25% 30%, #f0d4a0 0%, #d49a5a 6%, transparent 14%),
        radial-gradient(circle at 75% 70%, #6a1a1a 0%, transparent 30%)
      `,
    },
    // Sandy desert / golden
    {
      bg: `
        radial-gradient(ellipse 130% 70% at 50% 105%, #1a1208 0%, #2a1e10 50%, transparent 75%),
        radial-gradient(ellipse 110% 60% at 50% 40%, #f0c674 0%, #c89850 25%, #6a4a20 55%, #1a1208 90%),
        radial-gradient(circle at 70% 30%, #fff4d0 0%, #f0d488 8%, transparent 20%)
      `,
    },
  ];

  const scene = scenes[sceneIdx % scenes.length];
  const radius = 160 * (0.5 + intensity * 0.6);

  // Smooth cursor lag using ref + rAF
  const targetRef = useRefBG({ x: 0.5, y: 0.5 });
  const [smooth, setSmooth] = useStateBG({ x: 0.5, y: 0.5 });

  useEffectBG(() => {
    targetRef.current = { x: mouse.x, y: mouse.y };
  }, [mouse.x, mouse.y]);

  useEffectBG(() => {
    let raf;
    const tick = () => {
      setSmooth((s) => {
        const t = targetRef.current;
        return {
          x: s.x + (t.x - s.x) * 0.18,
          y: s.y + (t.y - s.y) * 0.18,
        };
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const mx = smooth.x * 100;
  const my = smooth.y * 100;

  // Mask: opaque (B&W visible) almost everywhere, transparent (color shows through) at cursor.
  const mask = `radial-gradient(circle ${radius}px at ${mx}% ${my}%, transparent 0%, transparent 50%, black 100%)`;

  // Estilo de revelação da camada P&B:
  //   desktop → máscara circular que segue o cursor
  //   mobile  → opacity controlada (1 = P&B, 0 = revela cor), com fade suave
  const revealStyle = mobileMode
    ? { opacity: fullReveal ? 0 : 1, transition: 'opacity 1.6s ease-in-out' }
    : { WebkitMaskImage: mask, maskImage: mask };

  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'auto',
        background: '#0a0a0a',
      }}
    >
      {/* Color layer — full color photo (revealed at cursor) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: colorSrc
            ? `url("${colorSrc}") center/cover no-repeat`
            : scene.bg,
        }}
      />

      {/* Grayscale layer on top — masked away at cursor (desktop) ou opacity-fade (mobile) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          // Prefer an explicit B&W asset when provided; otherwise derive from the color one
          // (or from the gradient scene) via a CSS grayscale filter.
          background: bwSrc
            ? `url("${bwSrc}") center/cover no-repeat`
            : (colorSrc ? `url("${colorSrc}") center/cover no-repeat` : scene.bg),
          filter: bwSrc ? 'contrast(1.05) brightness(0.9)' : 'grayscale(1) contrast(1.15) brightness(0.85)',
          ...revealStyle,
        }}
      />

      {/* Subtle vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.65) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Grain */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.07,
          mixBlendMode: 'overlay',
          backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`,
          pointerEvents: 'none',
        }}
      />

    </div>
  );
}

window.ColorRevealBackground = ColorRevealBackground;
