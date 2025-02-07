import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message, Channel, ChannelMember } from 'src/entities/chat.entity';
import {ChatDTO } from '../dto/chat.dto'

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

	// // Create or find a channel
	// async findOrCreateChannel(channelData: Partial<Channel>): Promise<Channel> {
	// 	let channel = await this.channelRepository.findOneBy({
	// 		title: channelData.title,
	// 	});
	// 	if (!channel) {
	// 		channel = this.channelRepository.create(channelData);
	// 		await this.channelRepository.save(channel);
	// 	}
	// 	return channel;
	// }

	async createChannel(chatDTO: ChatDTO): Promise<Channel> {
		const { title, ch_type, ch_owner, users, password } = chatDTO;
	
		// console.log('chatDTO:', chatDTO);  // Log to check if ch_owner exists
	  
		// Create new channel
		const newChannel = this.channelRepository.create({
		  title,
		  ch_type,
		  ch_owner,
		  password,
		//   channel_photo: chatDTO.channel_photo || 'default_channel_photo.png',
		  created: new Date(),
		});
	  
		const savedChannel = await this.channelRepository.save(newChannel);
		// console.log('new channel:', newChannel);

		// Add the initial users
		const userEntities = users.map(user => {
			// console.log('user.nameIntra:', user.nameIntra);
			return {
				user_id: user.id,
				name: user.nameIntra,
		  		channel_id: savedChannel.channel_id,
		  		member_role: user.role,
			}	
		});
		// console.log('userEntities:', userEntities);

		await this.channelMemberRepository.save(userEntities);
		// Fetch the full channel, including relations (users and messages)
		
		const fullChannel = await this.channelRepository.findOne({
			where: { channel_id: savedChannel.channel_id },
			relations: ['members'],
		});
		// console.log('full channel:', fullChannel);
		return fullChannel;
	}
	  

	// Add user to a channel
	async addUserToChannel(user_id: number, channel_id: number, role = 'member') {
		const membership = this.channelMemberRepository.create({
			user_id,
			channel_id,
			member_role: role,
		});
		console.log(membership);
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

 	// Fetch channel by ID
 	async getChannelById(channel_id: number): Promise<Channel> {
		return this.channelRepository.findOne({
			where: { channel_id: channel_id },  // Pass the condition for `channel_id`
		});
 	}

 	// Fetch all channels
	async getAllChannels(): Promise<Channel[]> {
		return this.channelRepository.find({               // Fetches all channels from the database
			select: ['channel_id', 'title', 'ch_type', 'ch_owner', 'password',],
			relations: ['members'],
		});     
 	}

	// Delete a channel
	async deleteChannel(channel_id: number): Promise<Channel | null> {
		try {
			const channel = await this.getChannelById(channel_id);
			if (!channel) {
				return null;
			}
			// Delete associated channel members if necessary
			await this.channelMemberRepository.delete({ channel_id: channel_id });
			// Delete the channel itself
			await this.channelRepository.remove(channel);
			return channel;
		} catch (error) {
			console.error('Error in deleting channel:', error);
			throw new Error('Error deleting channel');
		}
	}
}
