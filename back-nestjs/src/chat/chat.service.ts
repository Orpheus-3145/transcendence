import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message, Channel, ChannelMember } from 'src/entities/chat.entity';

@Injectable()
export class ChatService {
	constructor(
		@InjectRepository(Channel)
		private readonly channelRepository: Repository<Channel>,

		@InjectRepository(ChannelMember)
		private readonly channelMemberRepository: Repository<ChannelMember>,

		@InjectRepository(Message)
		private readonly messageRepository: Repository<Message>,
	) {}

	// Create or find a channel
	async findOrCreateChannel(channelData: Partial<Channel>): Promise<Channel> {
		let channel = await this.channelRepository.findOneBy({
			title: channelData.title,
		});
		if (!channel) {
			channel = this.channelRepository.create(channelData);
			await this.channelRepository.save(channel);
		}
		return channel;
	}

	// Add user to a channel
	async addUserToChannel(user_id: number, channel_id: number, role = 'member') {
		const membership = this.channelMemberRepository.create({
			user_id,
			channel_id,
			member_role: role,
		});
		return this.channelMemberRepository.save(membership);
	}

	// Remove user to a channel
	async removeUserFromChannel(user_id: number, channel_id: number, role: string) {
	  // Find the user's membership in the channel
	  const membership = await this.channelMemberRepository.findOne({
		where: { user_id, channel_id },
	  });
	
	  if (!membership) {
		throw new Error('User is not a member of the channel');
	  }
	
	  // Check if the user is the owner of the channel
	  if (membership.member_role === 'owner') {
		// Transfer ownership to another admin or member
		const otherMembers = await this.channelMemberRepository.find({
		  where: { channel_id },
		  order: { member_role: 'ASC' }, // Admins will appear before members
		});
	
		if (otherMembers.length > 1) {
		  // Assign the first non-owner member as the new owner
		  const newOwner = otherMembers.find(
			(member: ChannelMember) => member.user_id !== user_id
		  );
		  if (newOwner) {
			newOwner.member_role = 'owner';
			await this.channelMemberRepository.save(newOwner);
		  }
		} else {
		  // If the channel is empty, delete the channel
		  await this.channelMemberRepository.delete({ channel_id });
		  await this.channelRepository.delete({ channel_id });
		  return;
		}
	  }
	
	  // Remove the user from the channel
	  await this.channelMemberRepository.delete({ user_id, channel_id });
}

	// Send a message
	async sendMessage(
		sender_id: number,
		receiver_id: number,
		content: string,
	): Promise<Message> {
		const message = this.messageRepository.create({
			sender_id,
			receiver_id,
			content,
		});
		return this.messageRepository.save(message);
	}

	// Get messages for a channel
	async getChannelMessages(channel_id: number): Promise<Message[]> {
		return this.messageRepository.find({ where: { receiver_id: channel_id } });
	}
}