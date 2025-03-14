import { IsBoolean, IsNumber, IsString } from 'class-validator';
import Game from 'src/entities/game.entity';

// NB change type into integer (bitmask of powerups used, convert it into list in front-end)
export default class MatchDataDTO {
  constructor (game: Game) {

    this.player1 = game.player1.nameNick;
    this.player2 = game.player2.nameNick;
    this.winner = game.winner.nameNick;
    this.player1Score = game.player1Score;
    this.player2Score = game.player2Score;
    this.type = (game.powerups === 0) ? 'No powerups' : 'With powerups';
  }
  @IsString()
  player1: string;

  @IsString()
  player2: string;

  @IsString()
  winner: string;

  @IsNumber()
  player1Score: Number;

  @IsNumber()
  player2Score: Number;

  @IsString()
  type: string;

  @IsBoolean()
  forfeit: boolean;
}