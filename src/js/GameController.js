import themes from './themes';
import { generateTeam, getRandomHumanPosition } from './generators';
import Team from './Team';
import GamePlay from './GamePlay';
import GameState from './GameState';
import PositionedCharacter from './PositionedCharacter';
import Character from './Character';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.teams = new Team();
    this.humanTeam = [];
    this.demonTeam = [];
    this.move = this.humanTeam;
    this.selectedCharacter = null;
    this.level = themes.prairie;
    this.playerPoints = 0;
    this.gameState = GameState.from(this);
  }

  // Сохранение состояния в сессию
  saveInSession() {
    this.gameState = GameState.from(this);
    sessionStorage.setItem('game', JSON.stringify(this.gameState));
  }

  // Подготовка игры
  preparationGame() {
    const heroesTeam = GameController.getRandomCharacter([this.teams.humansRepository[0], this.teams.humansRepository[1]]);
    const daemonsTeam = this.teams.demonsRepository.reduce((arr, character) => {
      arr.push(character);
      return GameController.getRandomCharacter(arr);
    }, []);

    generateTeam(heroesTeam, 1, 2).reduce((arr, character) => {
      arr.push(character);
      return arr;
    }, this.humanTeam);

    generateTeam(daemonsTeam, 2, 2).reduce((arr, character) => {
      arr.push(character);
      return arr;
    }, this.demonTeam);

    this.saveInSession();
  }

  // Подготовка к следующему уровню
  preparationNextLevelUp() {
    const heroesTeam = this.teams.humansRepository.reduce((arr, character) => {
      arr.push(character);
      return GameController.getRandomCharacter(arr);
    }, []);

    let countCharacter = 2;
    let maxLevelForNewHumanCharacter = 1;
    let maxLevelForNewDemonCharacter = 2;

    if (this.level === 'desert') countCharacter = 1;

    if (this.level === 'arctic') {
      countCharacter = 2;
      maxLevelForNewHumanCharacter = 2;
      maxLevelForNewDemonCharacter = 3;
    }

    if (this.level === 'mountain') {
      countCharacter = 2;
      maxLevelForNewHumanCharacter = 3;
      maxLevelForNewDemonCharacter = 4;
    }

    generateTeam(heroesTeam, maxLevelForNewHumanCharacter, countCharacter).reduce((arr, character) => {
      arr.push(character);
      return arr;
    }, this.humanTeam);

    // Переопределение позиций людей на следующий уровень
    const randomHumanPosition = getRandomHumanPosition();
    this.humanTeam.forEach((character) => {
      const person = character;
      person.position = randomHumanPosition.next().value;
    });

    let demonsTeam = null;

    const arr = [];
    for (let i = 0; i < this.humanTeam.length; i += 1) {
      arr.push(this.teams.demonsRepository[Math.trunc(Math.random() * this.teams.demonsRepository.length)]);
    }
    demonsTeam = arr;

    generateTeam(GameController.getRandomCharacter(demonsTeam), maxLevelForNewDemonCharacter, this.humanTeam.length).reduce((array, character) => {
      array.push(character);
      return array;
    }, this.demonTeam);

    this.saveInSession();
  }

  // Получение состояния игры из сессии
  getSessionStorage() {
    const loadObject = JSON.parse(sessionStorage.getItem('game'));
    this.transformStateObject(loadObject);
  }

  // Начало игры
  init() {
    // TODO: add event listeners to gamePlay events
    if (sessionStorage.getItem('game')) {
      this.getSessionStorage();
    } else {
      this.preparationGame();
    }
    this.gamePlay.drawUi(this.level);
    this.gamePlay.redrawPositions([...this.humanTeam, ...this.demonTeam]);
    // TODO: load saved stated from stateService
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));

    this.gamePlay.addNewGameListener(this.onNewGameClick.bind(this));
    this.gamePlay.addSaveGameListener(this.onSaveGameClick.bind(this));
    this.gamePlay.addLoadGameListener(this.onLoadGameClick.bind(this));
  }

  // Начало новой игры
  onNewGameClick() {
    this.humanTeam = [];
    this.demonTeam = [];
    this.move = this.humanTeam;
    this.level = themes.prairie;
    this.preparationGame();
    this.gamePlay.drawUi(this.level);
    this.gamePlay.redrawPositions([...this.humanTeam, ...this.demonTeam]);
  }

  // Сохранение игры
  onSaveGameClick() {
    this.stateService.save(this.gameState);
    GamePlay.showMessage('Игра успешно сохранена!');
  }

  // Загрузка игры
  onLoadGameClick() {
    const loadObject = this.stateService.load();
    this.transformStateObject(loadObject);
    sessionStorage.setItem('game', JSON.stringify(this.gameState));
    GamePlay.showMessage('Игра успешно загружена!');
    this.gamePlay.drawUi(this.level);
    this.gamePlay.redrawPositions([...this.humanTeam, ...this.demonTeam]);
  }

  onCellClick(index) {
    // TODO: react to click

    // Ход персонажей
    if (!(this.selectedCharacter)) {
      if (!(this.gamePlay.cells[index].hasChildNodes())) return;
      if (!(this.checkCurrentCharacter(index))
        && this.gamePlay.cells[index].hasChildNodes()
        && !(this.gamePlay.cells[index].classList.contains('selected-green'))
        && !(this.gamePlay.cells[index].classList.contains('selected-red'))) {
        GamePlay.showError('Нельзя выбрать игрока противоположной команды!');
      }
    }

    if (this.selectedCharacter && this.gamePlay.cells[index].classList.contains('selected-green')) {
      this.selectedCharacter.position = index;
      this.saveInSession();
      this.gamePlay.redrawPositions([...this.humanTeam, ...this.demonTeam]);
      if (this.move === this.humanTeam) {
        this.moveDemonsTeam().then((result) => result);
        this.checkAndDeleteSelectedCharacter();
      } else {
        this.move = this.humanTeam;
        this.checkAndDeleteSelectedCharacter();
      }
    }

    // Атака персонажей
    if (this.selectedCharacter && this.gamePlay.cells[index].classList.contains('selected-red')) {
      const attacker = this.selectedCharacter.character;
      const target = (this.move === this.humanTeam)
        ? this.demonTeam.find((character) => character.position === index)
        : this.humanTeam.find((character) => character.position === index);
      const damage = Math.round(Math.max(attacker._attack - target.character._defence, attacker._attack * 0.1));
      this.gamePlay.showDamage(index, damage).then((result) => {
        target.character.health -= damage;
        this.checkAndDeleteSelectedCharacter();
        this.saveInSession();
        this.gamePlay.redrawPositions([...this.humanTeam, ...this.demonTeam]);
        if (target.character.health <= 0) {
          const teamEnemy = (this.move === this.humanTeam) ? this.demonTeam : this.humanTeam;
          teamEnemy.forEach((character, count) => {
            if (character === target) teamEnemy.splice(count, 1);
          });
        }

        this.saveInSession();
        this.gamePlay.redrawPositions([...this.humanTeam, ...this.demonTeam]);

        if (this.humanTeam.length === 0) {
          GamePlay.showMessage('Вы проиграли!');
          return;
        }

        if (this.demonTeam.length === 0) {
          this.move = this.humanTeam;
          this.winAndLevelUpGame();
          return;
        }

        if (this.move === this.humanTeam) {
          this.moveDemonsTeam().then((move) => move);
        } else {
          this.move = this.humanTeam;
        }
        // eslint-disable-next-line consistent-return
        return result;
      });
    }

    // Выбор персонажа
    if (this.selectedCharacter && this.gamePlay.cells[index].hasChildNodes() && this.checkCurrentCharacter(index)) {
      this.checkAndDeleteSelectedCharacter();
      this.gamePlay.selectCell(index);
      this.selectedCharacter = this.move.find((elem) => elem.position === index);
    }

    if (!(this.selectedCharacter) && this.gamePlay.cells[index].hasChildNodes() && this.checkCurrentCharacter(index)) {
      this.gamePlay.selectCell(index);
      this.selectedCharacter = this.move.find((elem) => elem.position === index);
    }
  }

  // Ход персонажа команды демонов
  moveDemonsTeam() {
    return new Promise((resolve) => {
      this.move = this.demonTeam;
      this.selectedCharacter = this.demonTeam[Math.trunc(Math.random() * this.demonTeam.length)];
      const movesAttack = this.getAttackCharacter();
      const move = this.getDistanceCharacter();
      const variantsAttack = movesAttack.reduce((arr, cell) => {
        if (this.gamePlay.cells[cell].hasChildNodes() && !(this.checkCurrentCharacter(cell))) {
          arr.push(cell);
        }
        return arr;
      }, []);
      const variantMoves = move.reduce((arr, cell) => {
        if (!this.gamePlay.cells[cell].hasChildNodes()) {
          arr.push(cell);
        }
        return arr;
      }, []);
      const event = new Event('click');
      if (variantsAttack.length > 0) {
        const randomIndex = variantsAttack[Math.trunc(Math.random() * variantsAttack.length)];
        this.gamePlay.selectCell(randomIndex, 'red');
        this.gamePlay.cells[randomIndex].dispatchEvent(event);
        this.gamePlay.cells[randomIndex].classList.remove('selected-red');
      } else {
        const randomIndex = variantMoves[Math.trunc(Math.random() * variantMoves.length)];
        this.gamePlay.selectCell(randomIndex, 'green');
        this.gamePlay.cells[randomIndex].dispatchEvent(event);
        this.gamePlay.cells[randomIndex].classList.remove('selected-green');
        this.checkAndDeleteSelectedCharacter();
      }
      resolve();
    });
  }

  onCellEnter(index) {
    // TODO: react to mouse enter
    this.gamePlay.setCursor('');

    this.gamePlay.cells.forEach((elem, count) => {
      const cellEnter = [...elem.classList].filter((className) => className === 'selected');
      if (cellEnter) {
        this.gamePlay.cells[count].classList.remove('selected-green');
        this.gamePlay.cells[count].classList.remove('selected-red');
      }
    });

    if (this.gamePlay.cells[index].hasChildNodes()) {
      // Установка курсора при на ведении на персонажа людей
      [...this.gamePlay.cells[index].querySelector('.character').classList].forEach((elem) => {
        if (['bowman', 'swordsman', 'magician'].includes(elem)) {
          this.gamePlay.setCursor('pointer');
        }
      });
      this.gamePlay.showCellTooltip(this.getTooltip(index), index);
    }

    if (this.selectedCharacter && !(this.gamePlay.cells[index].hasChildNodes())) {
      if (this.getDistanceCharacter().includes(index)) {
        this.gamePlay.setCursor('pointer');
        this.gamePlay.selectCell(index, 'green');
      } else {
        this.gamePlay.setCursor('not-allowed');
      }
    }

    if (this.selectedCharacter && (this.gamePlay.cells[index].hasChildNodes())) {
      if (!(this.checkCurrentCharacter(index))) {
        if (this.getAttackCharacter().includes(index)) {
          this.gamePlay.setCursor('crosshair');
          this.gamePlay.selectCell(index, 'red');
        } else {
          this.gamePlay.setCursor('not-allowed');
        }
      } else {
        this.gamePlay.setCursor('pointer');
      }
    }
  }

  onCellLeave(index) {
    // TODO: react to mouse leave
    if (this.gamePlay.cells[index].hasChildNodes()) {
      this.gamePlay.hideCellTooltip(index);
    }
  }

  // Логика перехода на следующий уровень
  winAndLevelUpGame() {
    if (this.level === 'mountain') {
      GamePlay.showMessage('Вы выйграли игру!');
      return;
    }
    GamePlay.showMessage('Вы выйграли! Переход на следующий уровень');

    this.playerPoints += [...this.humanTeam].reduce((sum, character) => sum + character.character.health, 0);
    let level;
    Object.values(themes).forEach((elem, index) => {
      if (elem === this.level) {
        level = (index + 1 < Object.values(themes).length) ? Object.values(themes)[index + 1] : Object.values(themes)[0];
      }
    });
    this.level = level;
    this.humanTeam.forEach((character) => character.character.levelUp());
    this.preparationNextLevelUp();
    this.gamePlay.drawUi(this.level);
    this.gamePlay.redrawPositions([...this.humanTeam, ...this.demonTeam]);
  }

  // Получение случайного персонажа из массива персонажей
  static getRandomCharacter(arrayCharacters) {
    const arr = [];
    for (let i = 0; i < arrayCharacters.length; i += 1) {
      arr.push(arrayCharacters[Math.trunc(Math.random() * arrayCharacters.length)]);
    }
    return arr;
  }

  // Получение дистанции возможных ходов персонажа
  getDistanceCharacter() {
    const top = [];
    const diagonalTopRight = [];
    const right = [];
    const diagonalDownRight = [];
    const down = [];
    const diagonalDownLeft = [];
    const left = [];
    const diagonalLeftTop = [];

    for (let i = 0; i < this.selectedCharacter.character.distance + 1; i += 1) {
      const [row, coll] = this.convertTo2DCoords(this.selectedCharacter.position);
      top.push([row - i, coll]);
      diagonalTopRight.push([row - i, coll + i]);
      right.push([row, coll + i]);
      diagonalDownRight.push([row + i, coll + i]);
      down.push([row + i, coll]);
      diagonalDownLeft.push([row + i, coll - i]);
      left.push([row, coll - i]);
      diagonalLeftTop.push([row - i, coll - i]);
    }
    return [...this.convertFrom2DToCoords([...top, ...diagonalTopRight, ...right,
      ...diagonalDownRight, ...down, ...diagonalDownLeft, ...left, ...diagonalLeftTop])
      .values()];
  }

  // Всплывающая информация о персонажах
  getTooltip(index) {
    const person = [...this.humanTeam, ...this.demonTeam].find((character) => character.position === index);
    const medalImage = '\u{1F396}';
    const attackImage = '\u{2694}';
    const defenceImage = '\u{1F6E1}';
    const healthImage = '\u{2764}';
    // eslint-disable-next-line max-len
    return `${medalImage}${person.character.level}  ${attackImage}${person.character.attack}  ${defenceImage}${person.character.defence}  ${healthImage}${person.character.health}`;
  }

  // Получение дистанции возможных ходов атаки персонажа
  getAttackCharacter() {
    const arrayCoords = [];
    const [row, coll] = this.convertTo2DCoords(this.selectedCharacter.position);
    for (let i = 0; i < this.selectedCharacter.character.distanceAttack + 1; i += 1) {
      arrayCoords.push([row + i, coll]);
      arrayCoords.push([row - i, coll]);
    }
    arrayCoords.forEach((elem) => {
      const [y, x] = elem;
      for (let j = 0; j < this.selectedCharacter.character.distanceAttack + 1; j += 1) {
        arrayCoords.push([y, x + j]);
        arrayCoords.push([y, x - j]);
      }
    });
    return [...this.convertFrom2DToCoords(arrayCoords).values()];
  }

  // Проверяет и удаляет выбранного персонажа
  checkAndDeleteSelectedCharacter() {
    this.gamePlay.cells.forEach((elem, index) => {
      if ([...elem.classList].filter((className) => className === 'selected')) {
        this.gamePlay.deselectCell(index);
        this.selectedCharacter = null;
      }
    });
  }

  // Конвертирует поле игры в 2D координаты
  convertTo2DCoords(index) {
    return [Math.trunc(index / this.gamePlay.boardSize), index % this.gamePlay.boardSize];
  }

  // Конвертирует из 2D координат в номер клетки поля игры
  convertFrom2DToCoords(array) {
    return array.reduce((set, elem) => {
      const [row, coll] = elem;
      if ((coll >= 0 && coll < this.gamePlay.boardSize)
        && (row >= 0 && row < this.gamePlay.boardSize)
      ) {
        set.add(this.gamePlay.boardSize * row + coll);
      }
      return set;
    }, new Set());
  }

  // Проверяет принадежит ли выбираемый персонаж к команде, у которой сейчас ход
  checkCurrentCharacter(index) {
    const classNames = [...this.gamePlay.cells[index].querySelector('.character').classList];
    return !!this.move.find((character) => classNames.includes(character.character.type));
  }

  // Трансформирует объект, полученный из хранилища в состояние игры
  transformStateObject(loadObject) {
    this.humanTeam = loadObject.humanTeam;
    this.demonTeam = loadObject.demonTeam;
    [...this.humanTeam, ...this.demonTeam].forEach((elem) => {
      // eslint-disable-next-line no-param-reassign,no-proto
      elem.__proto__ = PositionedCharacter.prototype;
      // eslint-disable-next-line no-param-reassign,no-proto
      elem.character.__proto__ = Character.prototype;
    });
    this.move = this.humanTeam;
    this.level = loadObject.level;
    this.playerPoints = loadObject.playerPoints;
    this.gameState = GameState.from(this);
  }
}
