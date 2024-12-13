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
		 const tmp = new User();
		 tmp.accessToken = access.access_token;
		 tmp.intraId = 47328;
		 tmp.nameNick = 'bald';
		 tmp.nameIntra = 'baldwin';
		 tmp.nameFirst = 'bal';
		 tmp.nameLast = 'dwin';
		 tmp.email = 'baldwin@student.codam.nl';
		 tmp.image = userMe.image.link;
		 tmp.greeting = 'Hello, I have just landed!';
		 tmp.status = UserStatus.Offline;
		 user.friends = [];
		 user.blocked = [];
		 const a = new User();
		 a.accessToken = access.access_token;
		 a.intraId = 58493;
		 a.nameNick = 'nani';
		 a.nameIntra = 'nanida';
		 a.nameFirst = 'nani';
		 a.nameLast = 'fuq';
		 a.email = 'nanidafuq@student.codam.nl';
		 a.image = userMe.image.link;
		 a.greeting = 'Hello, I have just landed!';
		 a.status = UserStatus.Offline;
		 user.friends = [];
		 user.blocked = [];
		try {
			if (await this.userAlreadyExist(user) == true)
				return (new UserDTO(user));
			await user.validate();
			await tmp.validate();
			await a.validate();
			await this.usersRepository.save(user);
			await this.usersRepository.save(tmp); //remove tmp when testing is done, it is an extra user to test
			await this.usersRepository.save(a);//remove tmp when testing is done, it is an extra user to test
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
