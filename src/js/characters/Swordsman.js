import Character from './Character';

export default class Swordsman extends Character {
  constructor(level, attack, defence, distance, distanceAttack, type) {
    super(level, attack, defence, distance, distanceAttack, type);
    this._type = 'swordsman';
  }
}
