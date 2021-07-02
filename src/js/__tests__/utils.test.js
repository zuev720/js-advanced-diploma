import { calcTileType } from '../utils';

it('Функция должна возвращать корректные значения', () => {
  expect(calcTileType(0)).toBe('top-left');
  expect(calcTileType(7)).toBe('top-right');
  expect(calcTileType(56)).toBe('bottom-left');
  expect(calcTileType(63)).toBe('bottom-right');
  expect(calcTileType(1)).toBe('top');
  expect(calcTileType(3)).toBe('top');
  expect(calcTileType(5)).toBe('top');
  expect(calcTileType(15)).toBe('right');
  expect(calcTileType(31)).toBe('right');
  expect(calcTileType(55)).toBe('right');
  expect(calcTileType(57)).toBe('bottom');
  expect(calcTileType(60)).toBe('bottom');
  expect(calcTileType(62)).toBe('bottom');
  expect(calcTileType(8)).toBe('left');
  expect(calcTileType(32)).toBe('left');
  expect(calcTileType(48)).toBe('left');
  expect(calcTileType(9)).toBe('center');
  expect(calcTileType(18)).toBe('center');
  expect(calcTileType(27)).toBe('center');
});
