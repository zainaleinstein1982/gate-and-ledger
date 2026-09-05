// High-quality cinematic SVG vector visual generators for all stages
// Renders instant, responsive, high-resolution cinematic artwork without external network dependencies

export const CINEMATIC_PLATES = {
  // Shot 1: Wide Subterranean Catwalk
  shot1_wide: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="100%" height="100%">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="%23020617"/>
        <stop offset="60%" stop-color="%230f172a"/>
        <stop offset="100%" stop-color="%23030712"/>
      </linearGradient>
      <linearGradient id="steam" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stop-color="%2338bdf8" stop-opacity="0.35"/>
        <stop offset="100%" stop-color="%230f172a" stop-opacity="0"/>
      </linearGradient>
      <linearGradient id="amberLight" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="%23f59e0b" stop-opacity="0.8"/>
        <stop offset="100%" stop-color="%23b45309" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <rect width="800" height="450" fill="url(%23bg)"/>
    <!-- Industrial Catwalk Architecture -->
    <path d="M0,380 L800,380 L800,450 L0,450 Z" fill="%23090d16"/>
    <path d="M0,370 L800,370" stroke="%23334155" stroke-width="4"/>
    <!-- Perforated grating lines -->
    <g stroke="%231e293b" stroke-width="2">
      ${Array.from({ length: 40 })
        .map((_, i) => `<line x1="${i * 20}" y1="380" x2="${i * 20 + 15}" y2="450"/>`)
        .join('')}
    </g>
    <!-- Background Gantry Pillars -->
    <rect x="120" y="40" width="30" height="340" fill="%23091124"/>
    <rect x="360" y="40" width="35" height="340" fill="%230d1b38"/>
    <rect x="620" y="40" width="30" height="340" fill="%23091124"/>
    <line x1="0" y1="140" x2="800" y2="140" stroke="%231e293b" stroke-width="6"/>
    <line x1="0" y1="260" x2="800" y2="260" stroke="%231e293b" stroke-width="6"/>
    <!-- Volumetric Steam Cone -->
    <polygon points="400,100 200,370 600,370" fill="url(%23steam)"/>
    <!-- Emergency Amber Beacon Flare -->
    <circle cx="680" cy="120" r="18" fill="%23f59e0b"/>
    <ellipse cx="680" cy="120" rx="90" ry="24" fill="url(%23amberLight)"/>
    <line x1="480" y1="120" x2="800" y2="120" stroke="%2338bdf8" stroke-width="2" stroke-opacity="0.7"/>
    <!-- Dr. Elena Silhouette on Catwalk -->
    <ellipse cx="380" cy="300" rx="10" ry="12" fill="%23020617"/>
    <path d="M372,312 L388,312 L392,370 L368,370 Z" fill="%23020617"/>
    <circle cx="383" cy="298" r="2.5" fill="%2338bdf8"/>
    <!-- Cinema Letterbox / Scope Aspect Ratio Line -->
    <rect x="0" y="0" width="800" height="30" fill="%23000000"/>
    <rect x="0" y="420" width="800" height="30" fill="%23000000"/>
    <text x="25" y="22" fill="%2338bdf8" font-family="monospace" font-size="12" font-weight="bold">SHOT 01 // EXT. SUBTERRANEAN COOLANT VOID // 35MM ANAMORPHIC</text>
    <text x="700" y="22" fill="%2394a3b8" font-family="monospace" font-size="12">2.39:1 SCOPE</text>
  </svg>`,

  // Shot 2: Medium Tracking past conduits
  shot2_medium: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="100%" height="100%">
    <defs>
      <linearGradient id="bg2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="%230b132b"/>
        <stop offset="100%" stop-color="%23030712"/>
      </linearGradient>
      <linearGradient id="cyanFlare" x1="0%" y1="50%" x2="100%" y2="50%">
        <stop offset="0%" stop-color="%2338bdf8" stop-opacity="0"/>
        <stop offset="50%" stop-color="%2338bdf8" stop-opacity="0.9"/>
        <stop offset="100%" stop-color="%2338bdf8" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <rect width="800" height="450" fill="url(%23bg2)"/>
    <!-- Steam Pipes in Foreground -->
    <circle cx="100" cy="200" r="140" fill="none" stroke="%231e293b" stroke-width="42"/>
    <line x1="0" y1="220" x2="800" y2="220" stroke="%230f172a" stroke-width="28"/>
    <!-- Steam jets -->
    <ellipse cx="280" cy="210" rx="60" ry="120" fill="%2338bdf8" fill-opacity="0.18"/>
    <!-- Elena Mid-Shot Profile -->
    <path d="M420,130 C450,130 480,150 480,190 C480,210 470,230 490,270 L510,420 L350,420 L360,270 C380,230 370,210 370,190 C370,150 400,130 420,130 Z" fill="%23091024" stroke="%231e293b" stroke-width="3"/>
    <!-- Cybernetic Eye Glow -->
    <circle cx="445" cy="180" r="6" fill="%2338bdf8"/>
    <circle cx="445" cy="180" r="18" fill="%2338bdf8" fill-opacity="0.35"/>
    <line x1="200" y1="180" x2="650" y2="180" stroke="url(%23cyanFlare)" stroke-width="3"/>
    <!-- Letterbox -->
    <rect x="0" y="0" width="800" height="30" fill="%23000000"/>
    <rect x="0" y="420" width="800" height="30" fill="%23000000"/>
    <text x="25" y="22" fill="%2338bdf8" font-family="monospace" font-size="12" font-weight="bold">SHOT 02 // MED TRACKING // 50MM T2.0 PRIMES</text>
    <text x="680" y="22" fill="%2394a3b8" font-family="monospace" font-size="12">FPS: 24.00</text>
  </svg>`,

  // Shot 3: Macro Close-Up Emergency Transponder
  shot3_macro: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="100%" height="100%">
    <defs>
      <linearGradient id="metal" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="%231e293b"/>
        <stop offset="50%" stop-color="%230f172a"/>
        <stop offset="100%" stop-color="%23020617"/>
      </linearGradient>
      <linearGradient id="yellowHax" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="%23f59e0b"/>
        <stop offset="100%" stop-color="%23d97706"/>
      </linearGradient>
    </defs>
    <rect width="800" height="450" fill="%23050914"/>
    <!-- Console Faceplate -->
    <rect x="150" y="60" width="500" height="330" rx="16" fill="url(%23metal)" stroke="%23334155" stroke-width="4"/>
    <!-- Warning Stripes -->
    <g fill="%23f59e0b" fill-opacity="0.85">
      <polygon points="180,80 205,80 185,110 160,110"/>
      <polygon points="220,80 245,80 225,110 200,110"/>
      <polygon points="260,80 285,80 265,110 240,110"/>
      <polygon points="300,80 325,80 305,110 280,110"/>
    </g>
    <text x="350" y="100" fill="%23f59e0b" font-family="monospace" font-size="14" font-weight="bold">BEACON TRANSPONDER // CANONICAL</text>
    <!-- Giant Dual Toggle Switch in Emergency Position -->
    <rect x="330" y="160" width="140" height="150" rx="8" fill="%23020617" stroke="%23475569" stroke-width="3"/>
    <!-- Yellow Lever Pressed Down -->
    <polygon points="360,180 440,180 420,280 380,280" fill="url(%23yellowHax)" stroke="%23f59e0b" stroke-width="2"/>
    <circle cx="400" cy="275" r="16" fill="%23ef4444"/>
    <circle cx="400" cy="275" r="30" fill="%23ef4444" fill-opacity="0.4"/>
    <!-- Elena's Cybernetic Titanium Finger pressing lever -->
    <path d="M490,260 L415,270 L410,290 L480,285 Z" fill="%2364748b" stroke="%2394a3b8" stroke-width="2"/>
    <!-- Status Indicator LED -->
    <circle cx="220" cy="240" r="12" fill="%2310b981"/>
    <circle cx="220" cy="240" r="24" fill="%2310b981" fill-opacity="0.3"/>
    <text x="245" y="245" fill="%23e2e8f0" font-family="monospace" font-size="13">SIGNAL TRANSMITTING</text>
    <!-- Letterbox -->
    <rect x="0" y="0" width="800" height="30" fill="%23000000"/>
    <rect x="0" y="420" width="800" height="30" fill="%23000000"/>
    <text x="25" y="22" fill="%2338bdf8" font-family="monospace" font-size="12" font-weight="bold">SHOT 03 // MACRO DETAIL // 75MM CLOSE-FOCUS</text>
    <text x="660" y="22" fill="%23f59e0b" font-family="monospace" font-size="12">STATUS: LOCKED</text>
  </svg>`,

  // Shot 4: Alarm Profile ECU
  shot4_alarm: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="100%" height="100%">
    <defs>
      <radialGradient id="sodiumGlow" cx="70%" cy="30%" r="60%">
        <stop offset="0%" stop-color="%23f59e0b" stop-opacity="0.9"/>
        <stop offset="60%" stop-color="%230b1329" stop-opacity="0.6"/>
        <stop offset="100%" stop-color="%23020617"/>
      </radialGradient>
    </defs>
    <rect width="800" height="450" fill="url(%23sodiumGlow)"/>
    <!-- Intense Side Profile Face Silhouette -->
    <path d="M220,90 C320,80 390,120 400,180 C400,200 425,220 440,240 C410,255 400,280 430,320 L400,340 C360,335 340,360 350,420 L150,420 L150,200 Z" fill="%23030712" stroke="%2338bdf8" stroke-width="2"/>
    <!-- Titanium Ocular Plate Reflecting Amber Sodium Light -->
    <path d="M330,165 L385,160 L380,195 L325,190 Z" fill="%2394a3b8" stroke="%2338bdf8" stroke-width="2"/>
    <circle cx="360" cy="178" r="8" fill="%2338bdf8"/>
    <circle cx="360" cy="178" r="22" fill="%2338bdf8" fill-opacity="0.45"/>
    <!-- Ambient Rain/Steam condensation streaks -->
    <line x1="340" y1="130" x2="330" y2="170" stroke="%23bae6fd" stroke-width="2" stroke-opacity="0.6"/>
    <line x1="375" y1="140" x2="365" y2="180" stroke="%23bae6fd" stroke-width="2" stroke-opacity="0.6"/>
    <!-- Letterbox -->
    <rect x="0" y="0" width="800" height="30" fill="%23000000"/>
    <rect x="0" y="420" width="800" height="30" fill="%23000000"/>
    <text x="25" y="22" fill="%2338bdf8" font-family="monospace" font-size="12" font-weight="bold">SHOT 04 // EXTREME CLOSE-UP // 85MM MACRO ANAMORPHIC</text>
    <text x="650" y="22" fill="%2338bdf8" font-family="monospace" font-size="12">COLOR: ACEScc</text>
  </svg>`,

  // Elena Vance Character Concept Plate
  elena_concept: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%">
    <defs>
      <radialGradient id="elenaGlow" cx="50%" cy="40%" r="50%">
        <stop offset="0%" stop-color="%231e3a8a"/>
        <stop offset="100%" stop-color="%23030712"/>
      </radialGradient>
    </defs>
    <rect width="600" height="600" fill="url(%23elenaGlow)"/>
    <!-- Character Torso & Head -->
    <ellipse cx="300" cy="220" rx="70" ry="90" fill="%231e293b"/>
    <path d="M220,310 C220,290 260,280 300,280 C340,280 380,290 380,310 L440,560 L160,560 Z" fill="%230f172a" stroke="%23334155" stroke-width="3"/>
    <!-- Cybernetic Brow Plate (Invariant #02) -->
    <path d="M250,190 L310,185 L305,215 L245,210 Z" fill="%2364748b" stroke="%2338bdf8" stroke-width="3"/>
    <circle cx="280" cy="200" r="10" fill="%2338bdf8"/>
    <circle cx="280" cy="200" r="28" fill="%2338bdf8" fill-opacity="0.35"/>
    <circle cx="330" cy="205" r="7" fill="%23e2e8f0"/>
    <!-- Kevlar Harness Straps -->
    <line x1="240" y1="310" x2="350" y2="520" stroke="%23f59e0b" stroke-width="8"/>
    <line x1="360" y1="310" x2="250" y2="520" stroke="%23f59e0b" stroke-width="8"/>
    <text x="30" y="50" fill="%2338bdf8" font-family="monospace" font-size="16" font-weight="bold">DR. ELENA VANCE // ASSET PASSPORT</text>
    <text x="30" y="75" fill="%2394a3b8" font-family="monospace" font-size="12">CANONICAL ANCHOR: TITANIUM OCULAR GRAFT (LEFT BROW)</text>
    <rect x="25" y="550" width="180" height="30" rx="4" fill="%2310b981" fill-opacity="0.2" stroke="%2310b981"/>
    <text x="45" y="570" fill="%2310b981" font-family="monospace" font-size="12" font-weight="bold">REGISTRY: LOCKED</text>
  </svg>`,

  // Emergency Transponder Prop Concept
  transponder_prop: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%">
    <rect width="600" height="600" fill="%23050b18"/>
    <!-- Prop Box Orthographic -->
    <rect x="100" y="120" width="400" height="380" rx="20" fill="%230f172a" stroke="%2338bdf8" stroke-width="4"/>
    <rect x="140" y="160" width="320" height="120" rx="8" fill="%231e293b"/>
    <circle cx="200" cy="220" r="30" fill="%23ef4444"/>
    <circle cx="300" cy="220" r="30" fill="%23f59e0b"/>
    <circle cx="400" cy="220" r="30" fill="%2310b981"/>
    <!-- Heavy Toggle Switch -->
    <rect x="250" y="320" width="100" height="120" rx="12" fill="%23f59e0b" stroke="%23b45309" stroke-width="4"/>
    <line x1="300" y1="330" x2="300" y2="430" stroke="%23000000" stroke-width="8"/>
    <text x="30" y="50" fill="%23f59e0b" font-family="monospace" font-size="16" font-weight="bold">EMERGENCY TRANSPONDER BEACON // PROP</text>
    <text x="30" y="75" fill="%2394a3b8" font-family="monospace" font-size="12">COLOR: SAFETY HAZARD YELLOW // HEAVY TOGGLE</text>
    <rect x="25" y="550" width="180" height="30" rx="4" fill="%2310b981" fill-opacity="0.2" stroke="%2310b981"/>
    <text x="45" y="570" fill="%2310b981" font-family="monospace" font-size="12" font-weight="bold">REGISTRY: LOCKED</text>
  </svg>`,

  // Catwalk Gantry Environment Concept
  catwalk_environment: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%">
    <rect width="600" height="600" fill="%23020617"/>
    <!-- Deep Perspective Grid -->
    <polygon points="300,100 0,600 600,600" fill="%230b132b" stroke="%231e3a8a" stroke-width="2"/>
    <line x1="300" y1="100" x2="100" y2="600" stroke="%2338bdf8" stroke-width="2"/>
    <line x1="300" y1="100" x2="200" y2="600" stroke="%2338bdf8" stroke-width="1"/>
    <line x1="300" y1="100" x2="400" y2="600" stroke="%2338bdf8" stroke-width="1"/>
    <line x1="300" y1="100" x2="500" y2="600" stroke="%2338bdf8" stroke-width="2"/>
    <line x1="50" y1="500" x2="550" y2="500" stroke="%23f59e0b" stroke-width="3"/>
    <line x1="120" y1="400" x2="480" y2="400" stroke="%23f59e0b" stroke-width="2"/>
    <line x1="200" y1="280" x2="400" y2="280" stroke="%23f59e0b" stroke-width="1"/>
    <!-- Volumetric Steam Cloud -->
    <ellipse cx="300" cy="200" rx="140" ry="60" fill="%2338bdf8" fill-opacity="0.25"/>
    <text x="30" y="50" fill="%2338bdf8" font-family="monospace" font-size="16" font-weight="bold">SUB-LEVEL 9 CATWALK GANTRY // LOCATION</text>
    <text x="30" y="75" fill="%2394a3b8" font-family="monospace" font-size="12">PERFORATED STEEL GRATING // AMBER SODIUM LIGHTS</text>
    <rect x="25" y="550" width="180" height="30" rx="4" fill="%2310b981" fill-opacity="0.2" stroke="%2310b981"/>
    <text x="45" y="570" fill="%2310b981" font-family="monospace" font-size="12" font-weight="bold">REGISTRY: LOCKED</text>
  </svg>`,

  // 35mm Vintage Anamorphic Lens Specimen
  lens_specimen: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%">
    <rect width="600" height="600" fill="%23000000"/>
    <!-- Anamorphic Blue Streak -->
    <rect x="0" y="295" width="600" height="10" fill="%2338bdf8" fill-opacity="0.9"/>
    <ellipse cx="300" cy="300" rx="250" ry="12" fill="%2360a5fa" fill-opacity="0.5"/>
    <!-- Oval Bokeh Disks -->
    <ellipse cx="200" cy="250" rx="35" ry="60" fill="%23f59e0b" fill-opacity="0.6"/>
    <ellipse cx="420" cy="360" rx="45" ry="75" fill="%2338bdf8" fill-opacity="0.5"/>
    <ellipse cx="320" cy="180" rx="25" ry="45" fill="%23ec4899" fill-opacity="0.5"/>
    <text x="30" y="50" fill="%2338bdf8" font-family="monospace" font-size="16" font-weight="bold">35MM ANAMORPHIC T2.2 OPTICAL PROFILE</text>
    <text x="30" y="75" fill="%2394a3b8" font-family="monospace" font-size="12">OVAL BOKEH 2.0X SQUEEZE // COATING FLARE SUPPRESSION</text>
  </svg>`,
};
