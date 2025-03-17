import { IsArray,
  IsInt ,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
  IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import UserDTO from './user.dto';
import { ChannelType } from 'src/entities/channel.entity';
import { MessageDTO } from './chatRoom.dto';


// Nb this is used only for receiving channel creation from the front-end
export class ChannelDTO {

  @IsOptional() // Only required for updates
  @IsInt()
  channel_id?: number;

  @IsEnum(ChannelType)
  ch_type: ChannelType

  @IsString()
  ch_owner: string;

  @IsBoolean()
  isActive: boolean = true;

  @IsBoolean()
  isDirectMessage: boolean = false;

  @IsOptional()
  @IsString()
  password?: string | null;

  @IsString()
  @MaxLength(50)
  title: string;

	@IsArray()
	@IsString({ each: true })
	banned: string[];

  @IsArray()
	@IsString({ each: true })
	muted: string[];

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => UserDTO)
  users?: UserDTO[];

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type (() => MessageDTO)
  messages?: MessageDTO[];
}

