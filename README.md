[![Build status](https://ci.appveyor.com/api/projects/status/4yta51i2l6j6g0hy?svg=true)](https://ci.appveyor.com/project/zuev720/js-advanced-diploma)

[GitHub-pages](https://zuev720.github.io/js-advanced-diploma/)

# AJS. Retro Game

## Предыстория

Вы неплохо овладели не только продвинутыми возможностями JS, но и инфраструктурными инструментами. И вам поручили первый проект: разработать небольшую пошаговую игру.

Вам нужно реанимировать проект, переведя его на работу с npm, Babel, Webpack, ESLint (ну и дальше по списку - вы в курсе).

## Концепция игры

Двухмерная игра в стиле фэнтези, где игроку предстоит выставлять своих персонажей против персонажей нечисти. После каждого раунда, восстанавливается жизнь уцелевших персонажей игрока и повышается их уровень. Максимальный уровень - 4.

## Механика

Размер поля фиксирован (8x8). Направление движения аналогично ферзю в шахматах. Персонажи разного типа могут ходить на разное расстояние (в базовом варианте можно перескакивать через других персонажей - т.е. как конь в шахматах, единственно - ходим по прямым и по диагонали):
* Мечники/Скелеты - 4 клетки в любом направлении
* Лучники/Вампиры - 2 клетки в любом направлении
* Маги/Демоны - 1 клетка в любом направлении

![](https://camo.githubusercontent.com/bf49dfd91603952972495e667043a4dc837c6d86b148f4c2eec192c396f2c20e/68747470733a2f2f692e696d6775722e636f6d2f797038766a684c2e6a7067)

Дальность атаки так же ограничена:
* Мечники/Скелеты - могут атаковать только соседнюю клетку
* Лучники/Вампиры - на ближайшие 2 клетки
* Маги/Демоны - на ближайшие 4 клетки

Клетки считаются "по радиусу", допустим для мечника зона поражения будет выглядеть вот так:

![](https://camo.githubusercontent.com/3163140fc5fd5f1272ed46c903c793b9c6e2436be55bd8307f21913ec74b4e82/68747470733a2f2f692e696d6775722e636f6d2f674a38445850552e6a7067)

Для лучника(отмечено красным):

![](https://camo.githubusercontent.com/c5895f03de5d5c8069e0074e855711e8a69ea7e3977b60b465ad3b76b8d9163f/68747470733a2f2f692e696d6775722e636f6d2f7249494e6146442e706e67)


Игрок и компьютер последовательно выполняют по одному игровому действию, после чего управление передаётся противостоящей стороне. Как это выглядит:
1. Выбирается собственный персонаж (для этого на него необходимо кликнуть левой кнопкой мыши)
1. Далее возможен один из двух вариантов:
    1. Перемещение: выбирается свободное поле, на которое можно передвинуть персонажа (для этого на поле необходимо кликнуть левой кнопкой мыши)
    2. Атака: выбирается поле с противником, которое можно атаковать с учётом ограничений по дальности атаки (для этого на персонаже противника необходимо кликнуть левой кнопкой мыши)
    
**Важно: в новой игре игрок всегда начинает первым (если игра загружается из сохранения, то порядок определяется в сохранении).**

Игра заканчивается тогда, когда все персонажи игрока погибают, либо достигнут выигран максимальный уровень (см.ниже Уровни).

Уровень завершается выигрышем игрока тогда, когда все персонажи компьютера погибли.

Баллы, которые набирает игрок за уровень равны сумме жизней оставшихся в живых персонажей.

### Генерация персонажей

Персонажи генерируются рандомно в столбцах 1 и 2 для игрока и в столбцах 7 и 8 для компьютера:

![](https://camo.githubusercontent.com/702bf07e2dc907508a3ee48193da46e84caf55764779a99ddd06dc33027104ce/68747470733a2f2f692e696d6775722e636f6d2f587163563175572e6a7067)


### Уровни

#### Level 1: prairie

У игрока генерируются два персонажа: (случайным образом - типов `Bowman` и `Swordsman`) с уровнем 1, характеристики соответствуют таблице характеристик (см. раздел ниже).

У компьютера генерируется произвольный набор персонажей в количестве 2 единиц.

#### Level 2: desert

У игрока повышается level игроков на 1 + восстанавливается здоровье выживших. Дополнительно случайным образом добавляется новый персонаж уровня 1.

У компьютера случайным образом генерируются персонажи в количестве, равным количеству персонажей игрока, с уровнем от 1 до 2.

#### Level 3: arctic

У игрока повышается level игроков на 1 + восстанавливается здоровье выживших. Дополнительно случайным образом добавляется два новых персонаж уровня 1 или 2.

У компьютера случайным образом генерируются персонажи в количестве, равным количеству персонажей игрока, с уровнем от 1 до 3.


#### Level 4: mountain

У игрока повышается level игроков на 1 + восстанавливается здоровье выживших. Дополнительно случайным образом добавляется два новых персонаж уровня от 1 до 3.

У компьютера случайным образом генерируются персонажи в количестве, равным количеству персонажей игрока, с уровнем от 1 до 4.

### Персонажи

Валидные строковые идентификаторы (к которым привязаны изображения):
* swordsman
* bowman
* magician
* daemon
* undead
* vampire

UPD: 14.04.2019 у игрока могут быть только swordsman, bowman и magician, у компьютера только daemon, undead, vampire. Если вы сделали без этого, то диплом тоже принимается.

#### Стартовые характеристики (атака/защита)

* Bowman - 25/25
* Swordsman - 40/10
* Magician - 10/40
* Vampire - 25/25
* Undead - 40/10
* Daemon - 10/40

#### Level Up

* На 1 повышает поле level автоматически после каждого раунда
* Показатель health приводится к значению: текущий уровень + 80 (но не более 100). Т.е. если у персонажа 1 после окончания раунда уровень жизни был 10, а персонажа 2 - 80, то после levelup:
    * персонаж 1 - жизнь станет 90
    * персонаж 2 - жизнь станет 100
* Повышение показателей атаки/защиты также привязаны к оставшейся жизни по формуле: `attackAfter = Math.max(attackBefore, attackBefore * (1.8 - life) / 100)`, т.е. если у персонажа после окончания раунда жизни осталось 50%, то его показатели улучшаться на 30%. Если же жизни осталось 1%, то показатели никак не увеличаться.
