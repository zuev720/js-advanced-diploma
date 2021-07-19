import PositionedCharacter from '../PositionedCharacter';
import getRandomHumanPosition from './getRandomHumanPosition';
import getRandomDemonPosition from './getRandomDemonPosition';
import Employee from '../Employee';

/**
 * Generates random characters
 *
 * @param typePerson
 * @param maxLevel max character level
 * @returns Character type children (ex. Magician, Bowman, etc)
 */

function* characterGenerator(typePerson, maxLevel) {
  // TODO: write logic here

  let humanPositions = getRandomHumanPosition()[Symbol.iterator]();
  let demonPositions = getRandomDemonPosition()[Symbol.iterator]();
  const character = Employee.create(typePerson, Math.floor(Math.random() * maxLevel) + 1);
  if (character._type === 'bowman' || character._type === 'swordsman' || character._type === 'magician') {
    if (humanPositions.next().value === undefined) humanPositions = getRandomHumanPosition()[Symbol.iterator]();
    yield new PositionedCharacter(character, Number(humanPositions.next().value));
  } else {
    if (demonPositions.next.value === undefined) demonPositions = getRandomDemonPosition()[Symbol.iterator]();
    yield new PositionedCharacter(character, Number(demonPositions.next().value));
  }
}

export default function generateTeam(allowedTypes, maxLevel, characterCount) {
  // TODO: write logic here

  const array = [];
  for (let i = 0; i < characterCount; i += 1) {
    const type = allowedTypes[Math.trunc(Math.random() * allowedTypes.length)];
    array.push(characterGenerator(type, maxLevel).next().value);
  }
  return array;
}
