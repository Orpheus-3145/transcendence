import { Injectable, Inject, forwardRef, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserStatus, UserDTO } from '../dto/user.dto'
import { AccessTokenDTO } from '../dto/auth.dto';
import { Notification, NotificationType } from 'src/entities/notification.entity';
import { NotificationService } from 'src/notification/notification.service';
import { Console } from 'console';


@Injectable()
export class UsersService {
  	constructor(
		@InjectRepository(User)
		private usersRepository: Repository<User>,
		@Inject(forwardRef(() => NotificationService))
			private readonly notificationService: NotificationService,
 	) { }

	async userAlreadyExist(user: User): Promise<Boolean>
	{
		var tmp: User | null = await this.findOne(user.intraId);
		if (tmp == null)
			return (false);
		return (true);
	}

	async createUser(access: AccessTokenDTO, userMe: Record<string, any>): Promise<UserDTO> {
		const user = new User();
		user.accessToken = access.access_token;
		user.intraId = userMe.id;
		user.nameNick = userMe.login;
		user.nameIntra = userMe.login;
		user.nameFirst = userMe.first_name;
		user.nameLast = userMe.last_name;
		user.email = userMe.email;
		user.image = userMe.image.link;
		user.greeting = 'Hello, I have just landed!';
		user.status = UserStatus.Offline;
		user.friends = [];
		user.blocked = [];
		const a = new User();
		a.accessToken = access.access_token;
		a.intraId = 43212;
		a.nameNick = "a";
		a.nameIntra = "a";
		a.nameFirst = "a";
		a.nameLast = "a";
		a.email = "a@gmail.co,"
		a.image = userMe.image.link;
		a.greeting = 'Hello, I ave just landed!';
		a.status = UserStatus.Offline;
		a.friends = [];
		a.blocked = [];
		const b = new User();
		b.accessToken = access.access_token;
		b.intraId = 456412;
		b.nameNick = "ab";
		b.nameIntra = "ab";
		b.nameFirst = "ab";
		b.nameLast = "ab";
		b.email = "ab@gmail.co,"
		b.image = userMe.image.link;
		b.greeting = 'Hello, I ave just landed!';
		b.status = UserStatus.Online;
		b.friends = [];
		b.blocked = [];
		const c = new User();
		c.accessToken = access.access_token;
		c.intraId = 48712;
		c.nameNick = "abc";
		c.nameIntra = "abc";
		c.nameFirst = "abc";
		c.nameLast = "abc";
		c.email = "abc@gmail.co,"
		c.image = userMe.image.link;
		c.greeting = 'Hello, I ave just landed!';
		c.status = UserStatus.Online;
		c.friends = [];
		c.blocked = [];
		try {
			if (await this.userAlreadyExist(user) == true)
				return (new UserDTO(user));
			await user.validate();
			await a.validate();
			await b.validate();
			await c.validate();
			await this.usersRepository.save(user);
			await this.usersRepository.save(a);
			await this.usersRepository.save(b);
			await this.usersRepository.save(c);
			return new UserDTO(user);
		} 
		catch (error) {
			console.error('User validation error: ', error);
			throw error;
		}
	}

	async findAll(): Promise<User[]> {
		return this.usersRepository.find();
	}

	async findOne(intraId: number): Promise<User | null> {
		return this.usersRepository.findOne({ where: { intraId } });
	}

	async findOneIntra(intraId: number): Promise<User | null> {
		return this.usersRepository.findOne({ where: { intraId } });
	}

	async findOneId(id: number): Promise<User | null> {
		return this.usersRepository.findOne({ where: { id } });
	}

	async findOneNick(nameNick: string): Promise<User | null> {
		return this.usersRepository.findOne({ where: { nameNick } });
	}

	async getUserId(code: string): Promise<User | null> 
	{
		const numb = Number(code);
		return (this.findOneId(numb));
	}

	async getUserIntraId(code: string): Promise<User | null>
	{
		const numb = Number(code);
		return (this.findOneIntra(numb));
	}

	async setNameNick(user: User, nameNick: string)
	{
		user.nameNick = nameNick;
		this.usersRepository.save(user);
	}
  
	async getFriend(code: string): Promise<User | null> 
	{
		const numb = Number(code);
		return (this.findOneIntra(numb));
	}
  
	async addFriend(user: User, other: User)
	{
		this.notificationService.initRequest( user, other, NotificationType.friendRequest);
	}

  	async friendRequestAccepted(iduser:string, idother:string)
  	{
		var user = this.getUserId(iduser);
		var otheruser = this.getUserId(idother);
		if ((user == null) || (otheruser == null))
		{
			console.log("ERROR accepting friendreq");
			throw new HttpException('Not Found', 404);
		}
		(await user).friends.push((await otheruser).intraId.toString());
		this.usersRepository.save((await user));
		(await otheruser).friends.push((await user).intraId.toString());
		this.usersRepository.save((await otheruser));
  	}

  	async removeFriend(user: User, other: User)
  	{
		var newlist = user.friends.filter(friend => friend !== other.intraId.toString());
		user.friends = newlist;
		this.usersRepository.save(user);
		newlist = other.friends.filter(afriend => afriend !== user.intraId.toString());
		other.friends = newlist;
		this.usersRepository.save(other);
  	}

  	async blockUser(user: User, other: User)
  	{
		var str: string = other.intraId.toString();
		if (user.blocked.find((blockedId) => blockedId === str))
			return ;
		this.removeFriend(user, other);
		user.blocked.push(other.intraId.toString());
		this.usersRepository.save(user);
  	}
  
	async unBlockUser(user: User, other: User)
	{
		var newlist = user.blocked.filter(blocked => blocked !== other.intraId.toString());
		user.blocked = newlist;
		this.usersRepository.save(user);
	}

	async changeProfilePic(user: User, image:string)
  	{
		user.image = image;
		this.usersRepository.save(user);
  	}

  	async inviteGame(user: User, other: User)
 	{	
		this.notificationService.initRequest(user, other, NotificationType.gameInvite);
 	}

  	async sendMessage(user :User, other: User, message:string)
  	{
		this.notificationService.initMessage(user, other, message);
  	}
}
