import { Controller, Get, Param } from '@nestjs/common';
import { ChatService } from './chat.service';
import { Channel } from '../entities/chat.entity';

@Controller('channels')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // Get channel by ID
  @Get(':id')
  async getChannel(@Param('id') id: number): Promise<Channel> {
    return this.chatService.getChannelById(id);
  }

  @Get('channels')
  async getAllChannels(): Promise<Channel[]> {
  	return this.chatService.getAllChannels();
  }

  
}
