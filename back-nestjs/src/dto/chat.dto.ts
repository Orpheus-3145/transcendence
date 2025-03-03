import { IsArray, IsInt , IsEnum, IsOptional, IsString, MaxLength, ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import UserDTO from './user.dto';
import { MessageDTO } from './message.dto';
import { ChannelMember } from 'src/entities/chat.entity';
// import { each } from 'cheerio/dist/commonjs/api/traversing';

export class ChatDTO {

  @IsOptional() // Only required for updates
  @IsInt()
  channel_id?: number;

  @IsString()
  @MaxLength(50)
  title: string;
 
//   @IsOptional()
  @IsBoolean()
  isDirectMessage: boolean = false;

  @IsString()
  ch_owner: string;

  @IsEnum(['public', 'protected', 'private', 'chat'])
  ch_type: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  channel_photo?: string;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => UserDTO)
  users?: UserDTO[];


  @IsOptional()
  @IsString()
  password?: string | null;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type (() => MessageDTO)
  messages?: MessageDTO[];
}

// export class ChannelMemberDTO {
// 	@IsInt()
// 	user_id: number;

	




// }

