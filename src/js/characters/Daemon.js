import Character from '../Character';

export default class Daemon extends Character {
  constructor(level) {
    super(level);
    this.level = level;
    this._attack = 10;
    this._defence = 40;
    this.distance = 1;
    this.distanceAttack = 4;
    this.type = 'daemon';
  }
}
