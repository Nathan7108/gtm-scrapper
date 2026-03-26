# GTM Intel — Design Direction

## Aesthetic: Bloomberg Terminal meets Palantir Gotham
**Tone:** Industrial-utilitarian with luxury data density. Dark, information-rich, authoritative.

## Design Principles (from Anthropic Frontend Skill)
- **Bold direction, not generic AI slop** — no Inter, no purple gradients, no cookie-cutter layouts
- **Typography:** Distinctive display font + refined mono for data
- **Color:** Dominant dark palette with sharp signal accents — not evenly distributed
- **Motion:** High-impact moments (staggered page load reveals, hover states that surprise)
- **Composition:** Asymmetry, grid-breaking elements, controlled density
- **Backgrounds:** Atmosphere and depth — gradient meshes, noise textures, layered transparencies

## Font Choices
- **Display/UI:** Space Mono or IBM Plex Mono (terminal aesthetic)
- **Body:** IBM Plex Sans (clean, professional)
- **Data/Numbers:** JetBrains Mono (tabular-nums, monospace data)

## Color System
```css
/* Base */
--bg-base: #0a0e13;        /* Deep navy-black */
--bg-elevated: #111820;     /* Slightly lifted surfaces */
--bg-card: #161d27;         /* Card backgrounds */
--bg-hover: #1c2533;        /* Hover states */

/* Text */
--text-primary: #c9d1d9;    /* Off-white, not pure white */
--text-secondary: #8b949e;  /* Muted */
--text-accent: #58a6ff;     /* Links, interactive */

/* Signal Colors (constant) */
--critical: #ef4444;
--high: #f97316;
--elevated: #eab308;
--moderate: #3b82f6;
--low: #22c55e;

/* Accent */
--accent: #00d4aa;           /* Teal-green, terminal-style highlight */
--accent-dim: #00d4aa33;     /* Glow effect */
```

## Signature Effects
- Subtle scan-line overlay on hero sections
- Glowing accent borders on active/focused elements
- Staggered fade-in on feed items (animation-delay cascade)
- Noise texture grain on dark backgrounds
- Monospace timestamps with blinking cursor effect
