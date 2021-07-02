import Character from '../Character';
import Bowman from '../characters/Bowman';

it('Новый экземпляр класса Character должен выбрасывать ошибку. Создавться должны только дочерние классы', () => {
  expect(() => new Character()).toThrowError('class Character cannot be instantiated');
  expect(new Bowman(1)).toEqual({
    level: 1,
    _attack: 25,
    _defence: 25,
    distance: 2,
    distanceAttack: 2,
    health: 50,
    type: 'bowman',
  });
});
