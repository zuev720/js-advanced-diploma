export default class Character {
  constructor(level, attack, defence, distance, distanceAttack) {
    this._level = level;
    this._health = 50;
    this._attack = Math.round(attack + (attack * (0.1 * (this._level - 1))));
    this._defence = Math.round(defence + (defence * (0.1 * (this._level - 1))));
    this._distance = distance;
    this._distanceAttack = distanceAttack;
    // TODO: throw error if user use "new Character()"
    if (new.target.name === 'Character') throw new Error('class Character cannot be instantiated');
  }

  levelUp() {
    this._level += 1;
    if (this._health > 1) {
      this._attack = Math.round(Math.max(this._attack, this._attack * (1.8 - (1 - this._health / 100))));
      this._defence = Math.round(Math.max(this._defence, this._defence * (1.8 - (1 - this._health / 100))));
    }
    this._health = (this._health + 80 <= 100) ? (this._health + 80) : 100;
  }
}
