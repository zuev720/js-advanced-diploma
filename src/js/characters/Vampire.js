import Character from '../Character';

export default class Vampire extends Character {
  constructor(level) {
    super(level);
    this.level = level;
    this._attack = 25;
    this._defence = 25;
    this.distance = 2;
    this.distanceAttack = 2;
    this.type = 'vampire';
  }
}
