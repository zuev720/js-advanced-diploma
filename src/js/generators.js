import PositionedCharacter from './PositionedCharacter';

/**
 * Generates random characters
 *
 * @param allowedTypes iterable of classes
 * @param maxLevel max character level
 * @returns Character type children (ex. Magician, Bowman, etc)
 */
function* characterGenerator(allowedTypes, maxLevel) {
  // TODO: write logic here

  // eslint-disable-next-line no-use-before-define
  const humanPositions = getRandomHumanPosition();
  // eslint-disable-next-line no-use-before-define
  const demonPositions = getRandomDemonPosition();
  for (let i = 0; i < allowedTypes.length; i += 1) {
    // eslint-disable-next-line no-use-before-define
    const character = new allowedTypes[i](getRandomLevel(maxLevel));
    if (character.type === 'bowman' || character.type === 'swordsman' || character.type === 'magician') {
      yield new PositionedCharacter(character, humanPositions.next().value);
    } else {
      yield new PositionedCharacter(character, demonPositions.next().value);
    }
  }
}

export function generateTeam(allowedTypes, maxLevel, characterCount) {
  // TODO: write logic here
  const arrayPersons = [];
  const iterator = characterGenerator(allowedTypes, maxLevel)[Symbol.iterator]();
  for (let i = 0; i < characterCount; i += 1) {
    arrayPersons.push(iterator.next().value);
  }
  return arrayPersons;
}

export function getRandomHumanPosition() {
  const arrNumberPosition = [0, 1, 8, 9, 16, 17, 24, 25, 32, 33, 40, 41, 48, 49, 56, 57];
  const uniqueNumber = arrNumberPosition.reduce((set) => {
    const randomIndex = Math.trunc((Math.random() * arrNumberPosition.length));
    set.add(arrNumberPosition[randomIndex]);
    return set;
  }, new Set());
  return [...uniqueNumber.values()][Symbol.iterator]();
}

function getRandomDemonPosition() {
  const arrNumberPosition = [6, 7, 14, 15, 22, 23, 30, 31, 38, 39, 46, 47, 54, 55, 62, 63];
  const uniqueNumber = arrNumberPosition.reduce((set) => {
    const randomIndex = Math.trunc((Math.random() * arrNumberPosition.length));
    set.add(arrNumberPosition[randomIndex]);
    return set;
  }, new Set());
  return [...uniqueNumber.values()][Symbol.iterator]();
}

function getRandomLevel(maxLevel) {
  return (Math.floor(Math.random() * maxLevel) + 1);
}
