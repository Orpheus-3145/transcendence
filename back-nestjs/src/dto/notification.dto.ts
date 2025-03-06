import { IsEnum, IsNumber, IsString } from "class-validator";
import { Notification, NotificationStatus, NotificationType } from "src/entities/notification.entity";
import { PowerUpSelected } from "src/game/types/game.enum";

export default class NotificationDTO {

  constructor(notiEntity: Notification) {
    this.id = notiEntity.id;
    this.senderId = notiEntity.sender.id;
    this.receiverId = notiEntity.receiver.id;
    this.senderName = notiEntity.sender.nameNick;
    this.receiverName = notiEntity.receiver.nameNick;
    this.type = notiEntity.type;
    this.status = notiEntity.status;
    this.message = notiEntity.message;
    this.powerUpsSelected = notiEntity.powerUpsSelected;
  }

  @IsNumber()
  id: number;

  @IsNumber()
  senderId: number;

  @IsNumber()
  receiverId: number;

  @IsString()
  senderName: string;

  @IsString()
  receiverName: string;

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsEnum(NotificationStatus)
  status: NotificationStatus;

  @IsString()
  message: String;

  @IsEnum(PowerUpSelected)
  powerUpsSelected: PowerUpSelected;
}