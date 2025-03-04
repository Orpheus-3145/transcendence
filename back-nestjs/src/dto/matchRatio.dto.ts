import {IsNumber, IsString, } from 'class-validator';


export default class MatchRatioDTO {
  @IsString()
  title: string;

  @IsNumber()
  wonGames: number;

  @IsNumber()
  totGames: number;
}