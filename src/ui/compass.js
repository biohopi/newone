/**
 * Dynamic 360-degree Military Compass Tape
 */

export class Compass {
  constructor(container) {
    this.container = container;
    this.tapeEl = null;
    this.init();
  }

  init() {
    const wrapper = document.createElement('div');
    wrapper.className = 'compass-container';
    wrapper.innerHTML = `
      <div class="compass-center-marker"></div>
      <div class="compass-tape" id="compass-tape"></div>
    `;

    this.container.appendChild(wrapper);
    this.tapeEl = wrapper.querySelector('#compass-tape');
    this.buildTape();
  }

  buildTape() {
    // Generate degree ticks from 0 to 360 and wrap
    const cardinals = {
      0: 'N',
      45: 'NE',
      90: 'E',
      135: 'SE',
      180: 'S',
      225: 'SW',
      270: 'W',
      315: 'NW',
    };

    let html = '';
    // Repeat sequence to allow smooth wrapping (-360 to 720)
    for (let deg = -180; deg <= 540; deg += 15) {
      let normalized = (deg % 360 + 360) % 360;
      const isCardinal = cardinals[normalized] !== undefined;
      const label = isCardinal ? cardinals[normalized] : normalized;
      html += `
        <div class="compass-degree ${isCardinal ? 'cardinal' : ''}" style="width: 40px;">
          <span>${label}</span>
          <span style="font-size: 8px;">|</span>
        </div>
      `;
    }

    this.tapeEl.innerHTML = html;
  }

  update(bearingDegrees) {
    // Center is 160px (320px width / 2). Each 15 deg = 40px -> 2.666px per degree.
    const pxPerDegree = 40 / 15;
    const offset = (bearingDegrees + 180) * pxPerDegree - 160;
    this.tapeEl.style.transform = `translateX(-${offset}px)`;
  }
}
