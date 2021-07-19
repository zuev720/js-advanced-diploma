import Bowman from './characters/Bowman';
import Swordsman from './characters/Swordsman';
import Magician from './characters/Magician';
import Daemon from './characters/Daemon';
import Undead from './characters/Undead';
import Vampire from './characters/Vampire';

export default class Employee {
  static create(type, level) {
    let employee;
    if (type === 'Bowman') {
      employee = new Bowman(level, 25, 25, 2, 2);
    }
    if (type === 'Swordsman') {
      employee = new Swordsman(level, 40, 10, 4, 1);
    }
    if (type === 'Magician') {
      employee = new Magician(level, 10, 40, 1, 4);
    }
    if (type === 'Daemon') {
      employee = new Daemon(level, 10, 40, 1, 4);
    }
    if (type === 'Undead') {
      employee = new Undead(level, 40, 10, 4, 1);
    }
    if (type === 'Vampire') {
      employee = new Vampire(level, 25, 25, 2, 2);
    }
    return employee;
  }
}
