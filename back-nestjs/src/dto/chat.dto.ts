import { IsArray, IsInt , IsEnum, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UserDTO } from './user.dto';
import { MessageDTO } from './message.dto';
import { each } from 'cheerio/dist/commonjs/api/traversing';

export class ChatDTO {
  @IsString()
  @MaxLength(50)
  title: string;

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

  @IsString()
  ch_owner: string;

  @IsOptional()
  @IsString()
  password?: string | null;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type (() => MessageDTO)
  messages?: MessageDTO[];
}
