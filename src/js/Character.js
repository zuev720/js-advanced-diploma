export default class Character {
  constructor(level, type = 'generic') {
    this.level = level;
    this._attack = 0;
    this._defence = 0;
    this.health = 50;
    this.type = type;
    // TODO: throw error if user use "new Character()"
    if (new.target.name === 'Character') throw new Error('class Character cannot be instantiated');
  }

  levelUp() {
    this.level += 1;
    if (this.health > 1) {
      this._attack = Math.round(Math.max(this.attack, this.attack * (1.8 - (1 - this.health / 100))));
      this._defence = Math.round(Math.max(this.defence, this.defence * (1.8 - (1 - this.health / 100))));
    }
    this.health = (this.health + 80 <= 100) ? (this.health + 80) : 100;
  }

  get attack() {
    return Math.round(this._attack + (this._attack * (0.1 * (this.level - 1))));
  }

  get defence() {
    return Math.round(this._defence + (this._defence * (0.1 * (this.level - 1))));
  }
}
