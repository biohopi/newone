/**
 * Weapons Arsenal Definitions & Specifications
 */

export const WEAPON_REGISTRY = {
  M416: {
    id: 'M416',
    name: 'M416',
    category: 'ASSAULT_RIFLE',
    ammoType: '5.56mm',
    magCapacity: 30,
    reserveAmmo: 180,
    fireRate: 0.086, // ~700 RPM
    damage: 41,
    bulletVelocity: 880, // m/s
    recoilKickVertical: 0.015,
    recoilKickHorizontal: 0.008,
    reloadDuration: 2.1,
    zoomFov: 42,
    hasAutoFire: true,
  },
  AKM: {
    id: 'AKM',
    name: 'AKM',
    category: 'ASSAULT_RIFLE',
    ammoType: '7.62mm',
    magCapacity: 30,
    reserveAmmo: 150,
    fireRate: 0.1, // 600 RPM
    damage: 48,
    bulletVelocity: 715,
    recoilKickVertical: 0.024,
    recoilKickHorizontal: 0.014,
    reloadDuration: 2.3,
    zoomFov: 45,
    hasAutoFire: true,
  },
  AWM: {
    id: 'AWM',
    name: 'AWM',
    category: 'SNIPER_RIFLE',
    ammoType: '.300 Magnum',
    magCapacity: 5,
    reserveAmmo: 20,
    fireRate: 1.85,
    damage: 105,
    bulletVelocity: 945,
    recoilKickVertical: 0.065,
    recoilKickHorizontal: 0.01,
    reloadDuration: 3.2,
    zoomFov: 18, // High 8x zoom
    hasAutoFire: false,
  },
  S12K: {
    id: 'S12K',
    name: 'S12K',
    category: 'SHOTGUN',
    ammoType: '12 Gauge',
    magCapacity: 5,
    reserveAmmo: 40,
    fireRate: 0.25,
    damage: 22, // x8 pellets
    pelletCount: 8,
    bulletVelocity: 350,
    recoilKickVertical: 0.045,
    recoilKickHorizontal: 0.02,
    reloadDuration: 2.4,
    zoomFov: 50,
    hasAutoFire: false,
  },
};
