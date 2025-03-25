import { IsBoolean, IsNumber, IsString } from 'class-validator';
import Game from 'src/entities/game.entity';

// NB change type into integer (bitmask of powerups used, convert it into list in front-end)
export default class MatchDataDTO {
  constructor (game: Game) {

    this.player1 = game.player1.nameIntra;
    this.player2 = game.player2.nameIntra;
    this.winner = game.winner.nameIntra;
    this.player1Score = game.player1Score;
    this.player2Score = game.player2Score;
    this.type = (game.powerups === 0) ? 'No powerups' : 'With powerups';
    this.forfeit = game.forfait;
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