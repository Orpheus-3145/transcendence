import { IsArray,
  IsInt ,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
  IsBoolean, 
  IsEmail,
  IsTimeZone} from 'class-validator';
import { Type } from 'class-transformer';
import { Channel, ChannelMember, ChannelMemberType, ChannelType } from 'src/entities/channel.entity';
import { Message } from 'src/entities/message.entity';


class UserPropsDTO {

  constructor( member: ChannelMember) {
    this.id = member.user.id;
    this.name = member.user.nameNick;
    this.role = member.memberRole;
    this.email = member.user.email;
  }

  @IsInt()
  id: number;

  @IsString()
  name: string;

  @IsEnum(ChannelMemberType)
  role: ChannelMemberType;

  @IsEmail()
  email: string

  // @IsString()    // NB probabily not needed
  // password: string;
}

export class ChatMessageDTO {

  constructor(message: Message) {

    this.id = message.msg_id;
    this.receiver_id = message.channel.channel_id;
    this.message = message.content;
    this.user = message.sender.user.nameNick;
    this.timestamp = message.created;
  }

  @IsInt()
  id: number;

  @IsInt()
  receiver_id: number;

  @IsString()
  message: string;

  @IsString()
  user: string;

  @IsInt()
  userId: number;

  @IsTimeZone()
  timestamp: Date;
}

class ChatSettingsDTO {

  constructor(channel: Channel) {
    
    this.type = channel.channel_type;
    this.password = channel.password;
    this.users = [];
    for (const member of channel.members)
      this.users.push(new UserPropsDTO(member));
    this.owner = channel.channel_owner.nameNick;
    this.banned = channel.banned;
    this.muted = channel.muted;
  }
  @IsEnum(ChannelType)
  type: ChannelType;

  // NB password should't be given to front-end, it should cal the chatGateway endpoint to check it
  @IsOptional()
  @IsString()
	password: string | null;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UserPropsDTO)
  users: UserPropsDTO[];

  @IsString()
  owner: string;

  @IsArray()
  @ValidateNested({ each: true })
  @IsString()
  banned: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @IsString()
  muted: string[];
}

export class ChatRoomDTO {

  constructor(channel: Channel) {

    this.id = channel.channel_id;
    this.name = channel.title;
    this.messages = [];
    for (const message of channel.messages)
      this.messages.push(new ChatMessageDTO(message));
    this.settings = new ChatSettingsDTO(channel);
    this.isDirectMessage = channel.isDirectMessage;
  }

  @IsInt()
  id: number;

  @IsString()
  name: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDTO)
  messages: ChatMessageDTO[];

  @Type(() => ChatSettingsDTO)
  settings: ChatSettingsDTO;

  @IsBoolean()
  isDirectMessage: boolean = false;
}

