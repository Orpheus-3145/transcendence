import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import UserDTO from './user.dto';
import MatchRatioDTO from './matchRatio.dto';


export default class LeaderboardDTO {
  @ValidateNested()
  @Type(() => UserDTO)
  user: UserDTO;

  @ValidateNested()
  @Type(() => MatchRatioDTO)
  ratio: MatchRatioDTO[];
}