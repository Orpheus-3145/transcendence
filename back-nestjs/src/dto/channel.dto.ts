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
import { MessageDTO } from './message.dto';
import { Channel, ChannelType } from 'src/entities/channel.entity';

export class ChannelDTO {

  constructor(channel: Channel) {

    this.channel_id = channel.channel_id;
    this.ch_type = channel.channel_type;
    this.ch_owner = channel.channel_owner.nameNick;
    this.isActive = channel.isActive;
    this.isDirectMessage = channel.isDirectMessage;
    this.password = channel.password;
    this.title = channel.title;
    this.banned = channel.banned;
    this.muted = channel.muted;
    this.users = [];
    for (const member of channel.members)
      this.users.push(new UserDTO(member.user));
    this.messages = [];
    for (const message of channel.messages)
      this.messages.push(new MessageDTO(message));
  }

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

