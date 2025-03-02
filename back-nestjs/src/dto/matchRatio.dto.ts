import {IsNumber, IsString, } from 'class-validator';


export default class MatchRatioDTO {
  @IsString()
  title: string;

  @IsNumber()
  value: number;

  @IsNumber()
  rate: number;
}