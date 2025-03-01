import {IsNumber, IsString, } from 'class-validator';

// NB change type into integer (bitmask of powerups used, convert it into list in front-end)
export default class MatchDataDTO {
  @IsString()
  player1: string;

  @IsString()
  player2: string;

  @IsNumber()
  player1Score: Number;

  @IsNumber()
  player2Score: Number;

  @IsString()
  whoWon: string;

  @IsString()
  type: string;
}