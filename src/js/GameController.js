import themes from './themes';
import generateTeam from './functions/generators';
import getRandomHumanPosition from './functions/getRandomHumanPosition';
import Team from './Team';
import GamePlay from './GamePlay';
import GameState from './GameState';
import PositionedCharacter from './PositionedCharacter';
import Character from './characters/Character';

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

  // Сохранение состояния в сессию
  saveInSession() {
    this.gameState = GameState.from(this);
    sessionStorage.setItem('game', JSON.stringify(this.gameState));
  }

  // Подготовка игры
  preparationGame() {
    this.humanTeam = generateTeam([this.teams.humansRepository[0], this.teams.humansRepository[1]], 1, 2);
    this.demonTeam = generateTeam(this.teams.demonsRepository, 2, 2);
    this.saveInSession();
  }

  // Подготовка к следующему уровню
  preparationNextLevelUp() {
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
    const humanTeam = generateTeam(this.teams.humansRepository, maxLevelForNewHumanCharacter, countCharacter).map((character) => character);
    const arrayRandomHumanPositions = getRandomHumanPosition()[Symbol.iterator]();
    this.humanTeam = [...this.humanTeam, ...humanTeam];
    this.humanTeam.forEach((character) => {
      const person = character;
      person.position = arrayRandomHumanPositions.next().value;
    });

    this.demonTeam = generateTeam(this.teams.demonsRepository, maxLevelForNewDemonCharacter, this.humanTeam.length);

    this.move = this.humanTeam;

    this.saveInSession();
  }

  // Получение состояния игры из сессии
  getSessionStorage() {
    const loadObject = JSON.parse(sessionStorage.getItem('game'));
    this.transformStateObject(loadObject);
  }

  // Начало новой игры
  onNewGameClick() {
    this.humanTeam = [];
    this.demonTeam = [];
    this.level = themes.prairie;
    this.preparationGame();
    this.gamePlay.drawUi(this.level);
    this.gamePlay.redrawPositions([...this.humanTeam, ...this.demonTeam]);
    this.move = this.humanTeam;
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

  async onCellClick(index) {
    // TODO: react to click
    if (!(this.selectedCharacter)) {
      if (!(this.gamePlay.cells[index].hasChildNodes())) return;
      if (!(GameController.checkCurrentCharacter(this.gamePlay.cells[index].firstChild.classList[1]))
        && this.gamePlay.cells[index].hasChildNodes()
        && !(this.gamePlay.cells[index].classList.contains('selected-green'))
        && !(this.gamePlay.cells[index].classList.contains('selected-red'))) {
        GamePlay.showError('Нельзя выбрать игрока противоположной команды!');
        return;
      }
    }

    // Ход персонажей
    if (this.selectedCharacter && this.gamePlay.cells[index].classList.contains('selected-green')) {
      this.gamePlay.deselectCell(this.selectedCharacter.position);
      this.gamePlay.deselectCell(index);
      this.selectedCharacter.position = index;
      this.saveInSession();
      this.gamePlay.redrawPositions([...this.humanTeam, ...this.demonTeam]);
      await this.moveDemonsTeam();
      this.move = this.humanTeam;
      return;
    }

    // Атака персонажей
    if (this.selectedCharacter && this.gamePlay.cells[index].classList.contains('selected-red')) {
      this.gamePlay.deselectCell(index);
      this.gamePlay.deselectCell(this.selectedCharacter.position);
      await this.attackPerson(index);
      this.gamePlay.redrawPositions([...this.humanTeam, ...this.demonTeam]);
      if (this.demonTeam.length === 0) {
        if (this.level === 'mountain') {
          GamePlay.showMessage('Вы выйграли игру!');
          return;
        }
        this.winAndLevelUpGame();
      }
      this.gamePlay.redrawPositions([...this.humanTeam, ...this.demonTeam]);
      await this.moveDemonsTeam();
      this.gamePlay.deselectCell(index);
      this.move = this.humanTeam;
      return;
    }

    // Выбор персонажа
    if (this.selectedCharacter
      && this.gamePlay.cells[index].hasChildNodes()
      && (GameController.checkCurrentCharacter(this.gamePlay.cells[index].firstChild.classList[1]))) {
      this.gamePlay.deselectCell(this.selectedCharacter.position);
      this.gamePlay.selectCell(index);
      this.selectedCharacter = this.move.find((elem) => elem.position === index);
      return;
    }

    if (!this.selectedCharacter
      && this.gamePlay.cells[index].hasChildNodes()
      && (GameController.checkCurrentCharacter(this.gamePlay.cells[index].firstChild.classList[1]))) {
      this.gamePlay.selectCell(index);
      this.selectedCharacter = this.move.find((elem) => elem.position === index);
    }
  }

  // Ход персонажа команды демонов
  async moveDemonsTeam() {
    this.move = this.demonTeam;
    const accessAttackPerson = this.demonTeam.reduce((arr, person) => {
      const accessAttack = this.getAttackCharacter(person)
        .filter((elem) => this.gamePlay.cells[Number(elem)].hasChildNodes())
        .filter((element) => (GameController.checkCurrentCharacter(this.gamePlay.cells[element].firstChild.classList[1])));
      if (accessAttack.length > 0) {
        arr.push({ person, accessAttack });
      }
      return arr;
    }, []);
    if (accessAttackPerson.length > 0) {
      if (accessAttackPerson.length < 2) {
        this.selectedCharacter = accessAttackPerson[0].person;
        const cellIndex = this.selectedCharacter.position;
        this.gamePlay.selectCell(cellIndex);
        this.gamePlay.redrawPositions([...this.humanTeam, ...this.demonTeam]);
        const randomIndex = accessAttackPerson[0].accessAttack[Math.round(Math.random() * (accessAttackPerson[0].accessAttack.length - 1))];
        await this.attackPerson(randomIndex);
        if (this.humanTeam.length === 0) {
          GamePlay.showMessage('Вы проиграли!');
        }
        this.gamePlay.deselectCell(cellIndex);
        this.gamePlay.redrawPositions([...this.humanTeam, ...this.demonTeam]);
        return;
      }
      const index = Math.round(Math.random() * (accessAttackPerson.length - 1));
      this.selectedCharacter = accessAttackPerson[index].person;
      const cellIndex = this.selectedCharacter.position;
      this.gamePlay.selectCell(cellIndex);
      this.gamePlay.redrawPositions([...this.humanTeam, ...this.demonTeam]);
      const indexAttack = accessAttackPerson[index].accessAttack[Math.round(Math.random() * (accessAttackPerson[index].accessAttack.length - 1))];
      await this.attackPerson(indexAttack);
      if (this.humanTeam.length === 0) {
        GamePlay.showMessage('Вы проиграли!');
      }
      this.gamePlay.deselectCell(cellIndex);
      this.gamePlay.redrawPositions([...this.humanTeam, ...this.demonTeam]);
      return;
    }
    this.selectedCharacter = this.demonTeam[Math.round(Math.random() * (this.demonTeam.length - 1))];
    const moves = this.getDistanceCharacter(this.selectedCharacter).filter((elem) => !this.gamePlay.cells[elem].hasChildNodes());
    this.selectedCharacter.position = moves[Math.round(Math.random() * (moves.length - 1))];
    this.gamePlay.redrawPositions([...this.humanTeam, ...this.demonTeam]);
    this.selectedCharacter = null;
    this.move = this.humanTeam;
  }

  onCellEnter(index) {
    // TODO: react to mouse enter
    this.gamePlay.setCursor('');

    if (this.move === this.demonTeam) return;

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
      if (this.getDistanceCharacter(this.selectedCharacter).includes(index)) {
        this.gamePlay.setCursor('pointer');
        this.gamePlay.selectCell(index, 'green');
      } else {
        this.gamePlay.setCursor('not-allowed');
      }
    }

    if (this.selectedCharacter && (this.gamePlay.cells[index].hasChildNodes())) {
      if (!GameController.checkCurrentCharacter(this.gamePlay.cells[index].firstChild.classList[1])) {
        if (this.getAttackCharacter(this.selectedCharacter).includes(index)) {
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

  attackPerson(index) {
    return new Promise((resolve) => {
      const attacker = this.selectedCharacter.character;
      const target = (this.move === this.humanTeam)
        ? this.demonTeam.find((character) => character.position === index)
        : this.humanTeam.find((character) => character.position === index);
      const random = Math.round(Math.random() * 3);
      const damage = (random === 3)
        ? Math.round(Math.max(attacker._attack - target.character._defence, attacker._attack * 0.1)
          + (Math.round(Math.max(attacker._attack - target.character._defence, attacker._attack * 0.1)) * 0.75))
        : Math.round(Math.max(attacker._attack - target.character._defence, attacker._attack * 0.1));
      target.character._health -= damage;
      this.gamePlay.showDamage(index, damage).then(() => {
        if (target.character._health <= 0) {
          const teamEnemy = (this.move === this.humanTeam) ? this.demonTeam : this.humanTeam;
          teamEnemy.forEach((character, count) => {
            if (character === target) teamEnemy.splice(count, 1);
          });
        }
        this.saveInSession();
        this.selectedCharacter = null;
        resolve();
      });
    });
  }

  // Логика перехода на следующий уровень
  winAndLevelUpGame() {
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

  // Получение дистанции возможных ходов персонажа
  getDistanceCharacter(character) {
    const variantDistance = this.gamePlay.cells.reduce((arr, cell, index) => {
      if (index < character.character._distance + 1) {
        const [row, coll] = this.convertTo2DCoords(character.position);
        arr.push([row - index, coll]);
        arr.push([row - index, coll + index]);
        arr.push([row, coll + index]);
        arr.push([row + index, coll + index]);
        arr.push([row + index, coll]);
        arr.push([row + index, coll - index]);
        arr.push([row, coll - index]);
        arr.push([row - index, coll - index]);
      }
      return arr;
    }, []);

    return [...this.convertFrom2DToCoords(variantDistance)];
  }

  // Всплывающая информация о персонажах
  getTooltip(index) {
    const person = [...this.humanTeam, ...this.demonTeam].find((character) => character.position === index);
    const medalImage = '\u{1F396}';
    const attackImage = '\u{2694}';
    const defenceImage = '\u{1F6E1}';
    const healthImage = '\u{2764}';
    // eslint-disable-next-line max-len
    return `${medalImage}${person.character._level}  ${attackImage}${person.character._attack}  ${defenceImage}${person.character._defence}  ${healthImage}${person.character._health}`;
  }

  // Получение дистанции возможных ходов атаки персонажа
  getAttackCharacter(person) {
    const arrayCoords = this.gamePlay.cells.reduce((arr, cell, index) => {
      if (index <= person.character._distanceAttack) {
        const [row, coll] = this.convertTo2DCoords(person.position);
        arr.push([row + index, coll]);
        arr.push([row - index, coll]);
      }
      return arr;
    }, []);
    arrayCoords.forEach((elem) => {
      const [y, x] = elem;
      for (let i = 0; i <= person.character._distanceAttack; i += 1) {
        arrayCoords.push([y, x + i]);
        arrayCoords.push([y, x - i]);
      }
    });
    return [...this.convertFrom2DToCoords(arrayCoords)];
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
  static checkCurrentCharacter(nameCharacter) {
    return (['bowman', 'swordsman', 'magician'].includes(nameCharacter));
  }

  // Трансформирует объект, полученный из хранилища в состояние игры
  transformStateObject(loadObject) {
    this.humanTeam = loadObject.humanTeam;
    this.demonTeam = loadObject.demonTeam;
    [...this.humanTeam, ...this.demonTeam].forEach((elem) => {
      Object.setPrototypeOf(elem, PositionedCharacter.prototype);
      Object.setPrototypeOf(elem.character, Character.prototype);
    });
    this.move = this.humanTeam;
    this.level = loadObject.level;
    this.playerPoints = loadObject.playerPoints;
    this.gameState = GameState.from(this);
  }
}
