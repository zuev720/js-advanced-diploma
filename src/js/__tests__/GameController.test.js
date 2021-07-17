import GamePlay from '../GamePlay';
import GameController from '../GameController';
import GameStateService from '../GameStateService';
import PositionedCharacter from '../PositionedCharacter';
import Bowman from '../characters/Bowman';
import Daemon from '../characters/Daemon';

it('Всплывающая подсказка о характеристиках персонажа должна корректно работать', () => {
  const gamePlay = new GamePlay();
  const stateService = new GameStateService(localStorage);
  const gameCtrl = new GameController(gamePlay, stateService);
  gameCtrl.humanTeam = [new PositionedCharacter(new Bowman(1), 1)];
  expect(gameCtrl.getTooltip(1)).toEqual('🎖1  ⚔25  🛡25  ❤50');
});

it('Метод getDistanceCharacter() должен возвращать корректные значения', () => {
  const gamePlay = new GamePlay();
  const stateService = new GameStateService(localStorage);
  const gameCtrl = new GameController(gamePlay, stateService);
  gameCtrl.humanTeam = [new PositionedCharacter(new Bowman(1), 1)];
  gameCtrl.selectedCharacter = gameCtrl.humanTeam.find((elem) => elem.position === 1);
  expect(gameCtrl.getDistanceCharacter(gameCtrl.selectedCharacter)).toEqual([
    1, 2, 3, 10, 19,
    9, 17, 8, 0,
  ]);
});

it('Метод getAttackCharacter() должен возвращать корректные значения', () => {
  const gamePlay = new GamePlay();
  const stateService = new GameStateService(localStorage);
  const gameCtrl = new GameController(gamePlay, stateService);
  gameCtrl.humanTeam = [new PositionedCharacter(new Bowman(1), 1)];
  gameCtrl.selectedCharacter = gameCtrl.humanTeam.find((elem) => elem.position === 1);
  expect(gameCtrl.getAttackCharacter()).toEqual([
    1, 9, 17, 2, 0,
    3, 10, 8, 11, 18,
    16, 19]);
});

it('Метод onSaveGameClick должен сохранять и загружать состояние игры из локального хранилища', () => {
  window.alert = jest.fn();
  document.body.innerHTML = '<div id="game-container"></div>';
  const gamePlay = new GamePlay();
  gamePlay.bindToDOM(document.querySelector('#game-container'));
  const stateService = new GameStateService(localStorage);
  const gameCtrl = new GameController(gamePlay, stateService);
  gameCtrl.humanTeam = [new PositionedCharacter(new Bowman(1), 1)];
  gameCtrl.demonTeam = [new PositionedCharacter(new Daemon(1), 6)];
  gameCtrl.playerPoints = 100;
  gameCtrl.onSaveGameClick();
  gameCtrl.stateService.load();
  expect(gameCtrl.humanTeam).toEqual([
    {
      character: {
        level: 1,
        _attack: 25,
        _defence: 25,
        health: 50,
        type: 'bowman',
        distance: 2,
        distanceAttack: 2,
      },
      position: 1,
    },
  ]);
  expect(gameCtrl.demonTeam).toEqual([
    {
      character: {
        level: 1,
        _attack: 10,
        _defence: 40,
        health: 50,
        type: 'daemon',
        distance: 1,
        distanceAttack: 4,
      },
      position: 6,
    },
  ]);
  expect(gameCtrl.level).toBe('prairie');
  expect(gameCtrl.playerPoints).toBe(100);
  expect(gameCtrl.level).toBe('prairie');
});

test('should mistake with load from localstorage', () => {
  document.body.innerHTML = '<div id="game-container"></div>';
  const gamePlay = new GamePlay();
  gamePlay.bindToDOM(document.querySelector('#game-container'));
  const stateService = new GameStateService(localStorage);
  const gameCtrl = new GameController(gamePlay, stateService);
  gameCtrl.init();
  gameCtrl.stateService.save();
  expect(() => {
    gameCtrl.stateService.load();
  }).toThrow(new Error('Invalid state'));
});
