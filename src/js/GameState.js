export default class GameState {
  static from(object) {
    // TODO: create object
    if (object && typeof object === 'object') {
      return {
        teams: object.teams,
        humanTeam: object.humanTeam,
        demonTeam: object.demonTeam,
        move: object.move,
        selectedCharacter: object.selectedCharacter,
        level: object.level,
        playerPoints: object.playerPoints,
      };
    }
    return null;
  }
}
