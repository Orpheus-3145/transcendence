import { IsArray,
  IsInt ,
  IsEnum,
  IsOptional,
  IsString,
  IsBoolean } from 'class-validator';
import { Channel, ChannelType } from 'src/entities/chat.entity';

export class ChannelDTO {

  constructor(channel: Channel) {

    this.channel_id = channel.channel_id;
    this.channel_type = channel.channel_type;
    this.channel_owner_id = channel.channel_owner.id;
    this.isActive = channel.isActive;
    this.isDirectMessage = channel.isDirectMessage;
    this.password = channel.password;
    this.title = channel.title;
    this.banned = channel.banned;
    this.muted = channel.muted;
  }

  @IsInt()
  channel_id: number;

  @IsEnum(ChannelType)
  channel_type: ChannelType

  @IsString()
  channel_owner_id: number;

  @IsBoolean()
  isActive: boolean = true;

  @IsBoolean()
  isDirectMessage: boolean = false;

  @IsOptional() 
  @IsString()
  password: string | null;

  @IsString()
  title: string;

  @IsArray()
  @IsString({ each: true })
  banned: string[];

  @IsArray()
  @IsString({ each: true })
  muted: string[];
}

