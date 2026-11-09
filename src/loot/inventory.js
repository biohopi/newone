/**
 * Loot Inventory & Backpack Management
 */

export class InventoryManager {
  constructor(hud) {
    this.hud = hud;

    // 2 Main weapon slots
    this.weapons = [
      { id: 'M416', currentMag: 30, reserveAmmo: 180 },
      { id: 'AWM', currentMag: 5, reserveAmmo: 20 },
    ];
    this.activeSlot = 0;

    // Unlimited backpack space for meds, equipment, and attachments
    this.backpackItems = [
      { name: '5.56mm Ammo', count: 180, type: 'AMMO' },
      { name: '.300 Magnum Ammo', count: 20, type: 'AMMO' },
      { name: 'First Aid Kit', count: 3, type: 'MED' },
      { name: 'Energy Drink', count: 4, type: 'MED' },
      { name: 'Frag Grenade', count: 2, type: 'THROWABLE' },
    ];
  }

  getActiveWeapon() {
    return this.weapons[this.activeSlot];
  }

  setActiveSlot(slotIndex) {
    if (slotIndex >= 0 && slotIndex < this.weapons.length) {
      this.activeSlot = slotIndex;
    }
  }

  addLoot(item) {
    const existing = this.backpackItems.find((i) => i.name === item.name);
    if (existing) {
      existing.count += item.count || 1;
    } else {
      this.backpackItems.push({ ...item });
    }
  }

  useFirstAid(player) {
    const med = this.backpackItems.find((i) => i.name === 'First Aid Kit' && i.count > 0);
    if (med) {
      med.count--;
      player.health = Math.min(100, player.health + 75);
      return true;
    }
    return false;
  }
}
