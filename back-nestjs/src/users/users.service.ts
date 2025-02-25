import { Injectable, Inject, forwardRef, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, TopologyClosedEvent } from 'typeorm';
import { leaderboardData, matchRatio } from '../entities/user.entity';
import { UserStatus, UserDTO, matchData } from '../dto/user.dto'
import AccessTokenDTO  from '../dto/auth.dto';
import AppLoggerService from 'src/log/log.service';
import ExceptionFactory from 'src/errors/exceptionFactory.service';
import User from '../entities/user.entity';


@Injectable()
export class UsersService {
  	constructor(
		@InjectRepository(User)
		private usersRepository: Repository<User>,
		private readonly logger: AppLoggerService,
		private readonly thrower: ExceptionFactory,
 	) { 
		this.logger.setContext(UsersService.name);	
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
		user.status = UserStatus.Online;
		user.friends = [];
		user.blocked = [];
		user.matchHistory = [];
		this.logger.debug(`Inserting user ${user.nameNick} in database`);
		try {
			var tmp: User | null = await this.findOne(user.intraId);
			if (tmp != null)
			{
				return (new UserDTO(tmp));
			}
			await user.validate();
			await this.usersRepository.save(user);
			return new UserDTO(user);
		} 
		catch (error) {
			console.error('User validation error: ', error);
			this.thrower.throwSessionExcp(
				`User validation error: ${error}`,
				`${UsersService.name}.${this.constructor.prototype.createUser.name}()`,
				HttpStatus.INTERNAL_SERVER_ERROR,
			)
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

	async setUserStatus(id: number, which: UserStatus)
	{
		var user = await this.findOneId(id);
		user.status = which;
		this.usersRepository.save(user);
	}

	async setNameNick(user: User, nameNick: string)
	{
		user.nameNick = nameNick;
		this.usersRepository.save(user);
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
		return (image);
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
				if (item.whoWon === userProfile.id.toString())
					normalWin += 1;
			}
			else
			{
				powerAll += 1;
				if (item.whoWon === userProfile.id.toString())
					powerWin += 1;
			}
			allAll += 1;
			if (item.whoWon === userProfile.id.toString())
				allWin += 1;
		});

		var ratioNormal = Math.round((normalWin / normalAll) * 100);
		var ratioPower = Math.round((powerWin / powerAll) * 100);
		var ratioAll = Math.round((allWin / allAll) * 100);

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
			item.ratio.forEach((values: matchRatio) =>
			{
				var tmpType = values.title;
				var tmpRate = values.rate;
				if (tmpType === type && values.value > 0)
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
		arr.splice(5);
		return (arr);
	}

	async initLeaderboardArr(allUser: User[]): Promise<leaderboardData[]>
	{
		var tmpratio: matchRatio[] = [];
		var allData: leaderboardData[] = [];

		allUser.forEach(async (item: User) => 
		{
			tmpratio = await this.calculateRatio(item.matchHistory, item);
			var tmp: leaderboardData = { user: item, ratio: tmpratio };
			allData.push(tmp);
		});	

		return (allData);
	}

	async leaderboardCalculator(): Promise<leaderboardData[][]>
	{
		var allUser = await this.findAll();
		var allData: leaderboardData[] = [];

		allData = await this.initLeaderboardArr(allUser);
	
		var normalArr: leaderboardData[] = await this.fillArray(allData, "Normal");
		var powerArr: leaderboardData[] = await this.fillArray(allData, "Power ups");
		var allArr: leaderboardData[] = await this.fillArray(allData, "All");

		var result: leaderboardData[][] = [];
		result.push(normalArr, powerArr, allArr);

		return (result);
	}

	async storeMatchData(p1name: number, p2name: number, p1score: number, p2score: number, type: string): Promise<void>
	{
		var p1: User | null = await this.findOneId(p1name); 
		var p2: User | null = await this.findOneId(p2name); 

		var winner: string = "";
		if (p1score > p2score)
			winner = p1name.toString();
		else
			winner = p2name.toString();
	
		var match: matchData = {player1: p1name.toString(), player2: p2name.toString(), player1Score: p1score.toString(), player2Score: p2score.toString(), whoWon: winner, type: type};
		p1.matchHistory.push(match);
		p2.matchHistory.push(match);
		this.usersRepository.save(p1);
		this.usersRepository.save(p2);
	}
}
