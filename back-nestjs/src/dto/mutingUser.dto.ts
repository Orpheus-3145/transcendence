import { Type } from 'class-transformer';
import { IsInt, ValidateNested } from 'class-validator';


export class DurationDTO {

  @IsInt()
  days: number;

  @IsInt()
  hours: number;

  @IsInt()
  minutes: number;

  @IsInt()
  seconds: number;
}

export class MutingUserDTO {
  @IsInt()
  userId: number;

  @IsInt()
  channelId: number;

  @ValidateNested()
  @Type(() => DurationDTO)
  time: DurationDTO;
}
