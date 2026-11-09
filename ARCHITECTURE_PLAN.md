# PUBG Mobile Web 3D Engine Architecture & Specifications

## 1. Executive Summary
This document specifies the technical architecture, UI layout, asset strategy, physics, and gameplay systems for a AAA-grade web-based 3D tactical shooter mirroring PUBG Mobile. Optimized for mobile browsers (iOS WebKit & Android Blink) running at a target 60 FPS in landscape orientation.

---

## 2. Technical Stack & Hardware Optimization
- **Core 3D Engine:** Three.js (r170+) with customized shader chunks and direct WebGL 2.0 context.
- **Rendering Pipeline:** ACES Filmic Tone Mapping, directional cascade shadow maps, logarithmic depth buffer disabled for mobile speed, low overhead fog, and dynamic frustum culling.
- **Bundler & Tooling:** Vite with aggressive tree-shaking and minification.
- **Audio Architecture:** Web Audio API procedural synthesis engine (zero asset load latency, ultra-lightweight footprint, zero missing asset errors).
- **Physics Engine:** Swept capsule collision with multi-floor AABB meshes, stair step-climbing, velocity dampening, and gravity integration.
- **Touch Gesture Engine:** Low-latency PointerEvent multi-touch manager with isolated screen quadrants and virtual joystick thumb tracking.

---

## 3. UI System Specifications (Tactical Glassmorphism)
- **Orientation Lock:** Forced landscape with visual orientation warning overlay when held vertically.
- **Full-Screen Integration:** HTML5 Fullscreen API toggle with fallback styling.
- **Tactical Aesthetic:** Matte dark carbon backgrounds (`#0a0d12`), neon tactical yellow/gold accents (`#f5a623`, `#ffd000`), angled sci-fi corner cuts, monospace tactical metrics, PUBG-style health bars, and killfeed banner notifications.

### Navigation Hierarchy:
1. **Launch Tab (Lobby):**
   - Quick Start / Offline Match
   - Online Play (Tactical matchmaking placeholder dialog)
   - Layout Customizer Mode (Interactive drag-and-drop HUD remapping)
   - Settings Modal (Sensitivity, Graphics, Audio)
   - Fullscreen Switch
2. **Offline Setup Tab:**
   - Team 1 (Player Squad) Bot Counter (+/- buttons, default 0)
   - Team 2 (Enemy Squad) Bot Counter (+/- buttons, default 0)
   - Map Weather Selector (Clear Day, Sunset Golden Hour, Overcast Fog)
   - Match Start button
3. **In-Game Match HUD:**
   - **Movement:** Left fixed virtual joystick with sprint-slider threshold.
   - **Combat Actions:** Left & Right Fire buttons, ADS Scope button, Reload, Jump, Crouch, Prone.
   - **Equipment:** Primary Weapon 1, Primary Weapon 2, Holster/Melee.
   - **Backpack Drawer:** Unlimited backpack space, ammo counters, attachments, ground loot proximity list.
   - **Heal Quick-Use:** Medkit, First Aid Kit, Energy Drink with cast-time circular progress bar.
   - **Tactical Compass:** 360-degree rotating bearing tape with N/NE/E/SE/S/SW/W/NW and degree values.
   - **Minimap Radar:** Dynamic canvas with topographical indicators, player coordinates, camera view frustum cone, bot dots, and shrinking blue zone circle.

---

## 4. Multi-Stage Architectural Building Systems
The combat zone features procedurally constructed multi-level structures designed for CQB (Close Quarters Battle) and sniper overwatch:
1. **1-Stage Military Guardhouse / Bunker:**
   - Single floor, reinforced concrete bunker with blast doors and horizontal slit windows for defensive peeking.
2. **2-Stage Residential Compound:**
   - Ground floor living room and kitchen with front and rear exits.
   - Functional internal stairs.
   - Second floor bedrooms, exterior balcony, and vantage windows.
3. **3-Stage Tactical Sniper Tower / Apartment:**
   - Ground entrance lobby with barricade cover.
   - Second floor interior suites.
   - Third floor sniper nest and open rooftop parapet overlooking compounds.

---

## 5. Arsenal & Ballistics Engine
- **M416 (Assault Rifle):** 5.56mm, 30-round magazine, high rate of fire, moderate vertical recoil.
- **AKM (Heavy Rifle):** 7.62mm, 30-round magazine, extreme damage, aggressive vertical/horizontal kick.
- **AWM (Magnum Sniper):** .300 Magnum, 5-round bolt-action, one-shot headshot lethality, integrated high-magnification scope with Mil-dot reticle.
- **S12K / Shotgun:** 12 Gauge, 5-round semi-auto, multi-pellet spread cone for devastating close-range breaching.
- **Optics Engine:** Dynamic FOV reduction with tactile sniper reticle overlays (Red Dot sight, 4x ACOG crosshair, 8x Mil-dot sniper grid) and sensitivity damping.

---

## 6. Advanced Bot AI State Machine
Bots operate under a tick-based behavior tree:
- `PATROL`: Navigates waypoints around compounds and roads.
- `LOOT`: Detects nearby ground loot and upgrades weapons/armor.
- `SEARCH_SOUND`: Reacts to player gunfire within a 120m audio radius.
- `ENGAGE`: Aims at target with procedural reaction delay, applies weapon spread/recoil, bursts fire, and crouch-strafes.
- `RETREAT_HEAL`: When HP < 30%, breaks line of sight to take cover behind walls and use medical items.
