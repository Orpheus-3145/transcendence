import { IsInt, Min } from 'class-validator';

export default class GameSizeDTO {
  @IsInt()
  @Min(0)
  width: number;

  @IsInt()
  @Min(0)
  height: number;
}