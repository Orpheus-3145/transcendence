import { Injectable, Inject, forwardRef, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { leaderboardData, matchRatio, User } from '../entities/user.entity';
import { UserStatus, UserDTO, matchData } from '../dto/user.dto'
import { AccessTokenDTO } from '../dto/auth.dto';

const tmpGame: matchData = {
	player1: 'hha',
	player2: 'dhussain',
	player1Score: "2",
	player2Score: "5",
	whoWon: 'hha',
	type: "Normal",
};

@Injectable()
export class UsersService {
  	constructor(
		@InjectRepository(User)
		private usersRepository: Repository<User>,
 	) { }

	
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
		user.status = UserStatus.Online;
		user.friends = [];
		user.blocked = [];
		user.matchHistory = [];
		user.matchHistory.push(tmpGame);
		const a = new User();
		a.accessToken = access.access_token;
		a.intraId = 23244;
		a.nameNick = "a";
		a.nameIntra = "a";
		a.nameFirst = "a";
		a.nameLast = "a";
		a.email = userMe.email;
		a.image = userMe.image.link;
		a.greeting = 'Hello, I have just landed!';
		a.status = UserStatus.Online;
		a.friends = [];
		a.blocked = [];
		a.matchHistory = [];
		a.matchHistory.push(tmpGame);
		const b = new User();
		b.accessToken = access.access_token;
		b.intraId = 432424;
		b.nameNick = "ab";
		b.nameIntra = "ab";
		b.nameFirst = "ab";
		b.nameLast = "ab";
		b.email = userMe.email;
		b.image = userMe.image.link;
		b.greeting = 'Hello, I have just landed!';
		b.status = UserStatus.Online;
		b.friends = [];
		b.blocked = [];
		b.matchHistory = [];
		b.matchHistory.push(tmpGame);
		const c = new User();
		c.accessToken = access.access_token;
		c.intraId = 312424;
		c.nameNick = "abc";
		c.nameIntra = "abc";
		c.nameFirst = "abc";
		c.nameLast = "abc";
		c.email = userMe.email;
		c.image = userMe.image.link;
		c.greeting = 'Hello, I have just landed!';
		c.status = UserStatus.Online;
		c.friends = [];
		c.blocked = [];
		c.matchHistory = [];
		c.matchHistory.push(tmpGame);
		const d = new User();
		d.accessToken = access.access_token;
		d.intraId = 518424;
		d.nameNick = "abcd";
		d.nameIntra = "abcd";
		d.nameFirst = "abcd";
		d.nameLast = "abcd";
		d.email = userMe.email;
		d.image = userMe.image.link;
		d.greeting = 'Hello, I have just landed!';
		d.status = UserStatus.Online;
		d.friends = [];
		d.blocked = [];
		d.matchHistory = [];
		d.matchHistory.push(tmpGame);
		try {
			var tmp: User | null = await this.findOne(user.intraId);
			if (tmp != null)
			{
				return (new UserDTO(tmp));
			}
			await user.validate();
			await a.validate();
			await b.validate();
			await c.validate();
			await d.validate();
			await this.usersRepository.save(user);
			await this.usersRepository.save(a);
			await this.usersRepository.save(b);
			await this.usersRepository.save(c);
			await this.usersRepository.save(d);
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

	async setStatus(Id: string, status: UserStatus)
	{
		var user = await this.getUserId(Id);
		user.status = status;
		this.usersRepository.save(user);
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


  	async friendRequestAccepted(iduser:string, idother:string)
  	{
		var user = await this.getUserId(iduser);
		var otheruser = await this.getUserId(idother);
		if ((user == null) || (otheruser == null))
		{
			console.log("ERROR accepting friendreq");
			throw new HttpException('Not Found', 404);
		}
		(user).friends.push((otheruser).intraId.toString());
		this.usersRepository.save((user));
		(otheruser).friends.push((user).intraId.toString());
		this.usersRepository.save((otheruser));
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

	async calculateRatio(arr: matchData[], userProfile: User)
	{
		if (arr.length === 0)
		{
			var tmp: matchRatio[] = [
			{
				title: "Normal", value: 0, rate: 0
			},
			{
				title: "Power ups", value: 0, rate: 0
			},
			{
				title: "All", value: 0, rate: 0
			}];
			return (tmp);	
		}

		var normalWin = 0;
		var normalAll = 0;
		var powerWin = 0;
		var powerAll = 0;
		var allWin = 0;
		var allAll = 0;
		arr.forEach((item: matchData) =>
		{
			if (item.type === "Normal")
			{
				normalAll += 1;
				if (item.whoWon === userProfile.intraId.toString())
					normalWin += 1;
			}
			else
			{
				powerAll += 1;
				if (item.whoWon === userProfile.intraId.toString())
					powerWin += 1;
			}
			allAll += 1;
			if (item.whoWon === userProfile.intraId.toString())
				allWin += 1;
		});
			
		var ratioNormal = (normalWin / normalAll) * 100;
		var ratioPower = (powerWin / powerAll) * 100;
		var ratioAll = (allWin / allAll) * 100;

		if (normalAll === 0)
			ratioNormal = 0;
		if (powerAll === 0)
			ratioPower = 0;

		var resultArr: matchRatio[] = [
		{
			title: "Normal", value: normalAll, rate: ratioNormal
		},
		{
			title: "Power ups", value: powerAll, rate: ratioPower
		},
		{
			title: "All", value: allAll, rate: ratioAll
		}];

		return (resultArr);		
	}


	async fillArray(allData: leaderboardData[], type: string): Promise<leaderboardData[]>
	{
		var ratioIndex: number = 0;
		if (type == "Power ups")
			ratioIndex = 1;
		if (type == "All")
			ratioIndex = 2;

		var arr: leaderboardData[] = [];
		allData.forEach((item: leaderboardData) =>
		{
			if (arr.length === 5)
				return (arr);
			item.ratio.forEach((values: matchRatio) =>
			{
				var tmpType = values.title;
				var tmpRate = values.rate;
				if (tmpType === type)
				{
					if (arr.length === 0)
						arr.push(item);
					else
					{
						if (tmpRate >= arr[0].ratio[ratioIndex].rate)
						{
							arr.unshift(item);
						}
						else
						{
							var index = 0;
							while (index < arr.length && tmpRate < arr[index].ratio[ratioIndex].rate)
								index++;
							if (index < arr.length)
								arr.splice(index, 0, item);
							else
								arr.push(item);
						}
					}
				}
			});
		});
		return (arr);
	}

	async leaderboardCalculator(): Promise<leaderboardData[][]>
	{
		var allUser = await this.findAll();
		var allData: leaderboardData[] = [];
		var tmpratio: matchRatio[] = [];

		allUser.forEach(async (item: User) => 
		{
			tmpratio = await this.calculateRatio(item.matchHistory, item);
			var tmp: leaderboardData = { user: item, ratio: tmpratio };
			allData.push(tmp);
		});

		var normalArr: leaderboardData[] = await this.fillArray(allData, "Normal");
		var powerArr: leaderboardData[] = await this.fillArray(allData, "Power ups");
		var allArr: leaderboardData[] = await this.fillArray(allData, "All");

		var result: leaderboardData[][] = [];
		result.push(normalArr, powerArr, allArr);

		return (result);
	}
}
