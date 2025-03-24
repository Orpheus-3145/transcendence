import { Injectable, HttpStatus, ConsoleLogger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inject ,forwardRef } from '@nestjs/common';

import AppLoggerService from 'src/log/log.service';
import ExceptionFactory from 'src/errors/exceptionFactory.service';
import User from 'src/entities/user.entity';
import Game from 'src/entities/game.entity';
import AccessTokenDTO  from 'src/dto/auth.dto';
import UserDTO, { UserStatus } from 'src/dto/user.dto'
import MatchDataDTO from 'src/dto/matchData.dto';
import LeaderboardDTO from 'src/dto/leaderboard.dto';
import MatchRatioDTO from 'src/dto/matchRatio.dto';
import { AnimationSelected } from 'src/game/types/game.enum';
import { NotificationGateway } from 'src/notification/notification.gateway';


@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(User) private usersRepository: Repository<User>,
		@InjectRepository(Game) private gamesRepository: Repository<Game>,
		private readonly logger: AppLoggerService,
		private readonly thrower: ExceptionFactory,
		@Inject(forwardRef(() => NotificationGateway)) private readonly notificationGateway: NotificationGateway,
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
		user.twoFactorSecret = null;

		this.logger.debug(`Inserting user ${user.nameNick} in database`);
		try {
			var tmp: User | null = await this.findOneIntra(user.intraId);

			if (tmp !== null)
				return (new UserDTO(tmp));

			await Promise.all([user.validate(), this.usersRepository.save(user)]);
			return new UserDTO(user);
		} 
		catch (error) {
			this.thrower.throwSessionExcp(`User intraId: ${user.intraId} failed vaidation: ${error.message}`,
				`${UsersService.name}.${this.constructor.prototype.createUser.name}()`,
				HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	async update(user: User): Promise<User> {
		try {
			return (await this.usersRepository.save(user));
		} catch (error) {
			this.thrower.throwSessionExcp(
				`User update error: ${error.message}`,
				`${UsersService.name}.${this.constructor.prototype.update.name}()`,
				HttpStatus.INTERNAL_SERVER_ERROR,
			)
		}
	}

	async findAll(): Promise<User[]> {
		return this.usersRepository.find();
	}

	async findOneIntra(intraId: number): Promise<User | null> {
		return this.usersRepository.findOne({ where: { intraId: intraId } });
	}

	async findOneId(id: number): Promise<User | null> {
		return this.usersRepository.findOne({ where: { id: id } });
	}

	async findOneNick(nameNick: string): Promise<User> {
		// const user: User = await this.usersRepository.findOne({ where: { nameNick: nameNick } });
		// if (!user)
		// 	this.thrower.throwSessionExcp(`User with nameNick: ${nameNick} not found`,
		// 		`${UsersService.name}.${this.constructor.prototype.findOneNick.name}()`,
		// 		HttpStatus.NOT_FOUND);
		return (await this.usersRepository.findOne({ where: { nameNick: nameNick } }));
	}

	async findOneIntraName(intraName: string): Promise<User> {
		const user: User = await this.usersRepository.findOne({ where: { nameIntra: intraName } });
		if (!user)
		this.thrower.throwSessionExcp(`User with intraname: ${intraName} not found`,
			`${UsersService.name}.${this.constructor.prototype.findOneNick.name}()`,
			HttpStatus.NOT_FOUND);
		return user;
	}

	async findGamesByUser(user: User) : Promise<Game[]> {

		let gamesPlayedbyId: Game[] = await this.gamesRepository.find(
			{ where : [
					{ player1 : {id: user.id} },
					{ player2 : {id: user.id} },
				],
			relations: ['player1', 'player2', 'winner'],
			}
		);
		if (!gamesPlayedbyId)
			gamesPlayedbyId = [];
		return gamesPlayedbyId;
	}

	async getUserId(code: string): Promise<User> {
		const user: User = await this.findOneId(Number(code));
		if (!user)
			this.thrower.throwSessionExcp(`User with id: ${code} not found`,
				`${UsersService.name}.${this.constructor.prototype.getUserId.name}()`,
				HttpStatus.NOT_FOUND);
		return (user);
	}

	async getUserIntraId(code: string): Promise<User> {
		const user: User = await this.findOneIntra(Number(code));
		if (!user)
			this.thrower.throwSessionExcp(`User with intraId: ${code} not found`,
				`${UsersService.name}.${this.constructor.prototype.getUserIntraId.name}()`,
				HttpStatus.NOT_FOUND);
		return (user);
	}

	async setStatusId(id: string, status: UserStatus)
	{
		const user = await this.getUserId(id);
		user.status = status;
		this.usersRepository.save(user);
		this.notificationGateway.sendStatus(user, status);
	}

	async setStatusIntra(id: number, which: UserStatus)
	{
		const user = await this.findOneIntra(id);
		user.status = which;
		this.usersRepository.save(user);
		this.notificationGateway.sendStatus(user, which);
	}

	async setNameNick(userId: string, newUsername: string): Promise<string>
	{
		console.log("aa");
		if (newUsername.length > 27)
			return ("lenght is bigger then 27 chars, make it shorter!");

		const regex = /^[a-zA-Z0-9\-_]+$/;
		if (regex.test(newUsername) === false)
			return (`'${newUsername}': invalid input, only letters, numbers, - and _ are allowed`);

		const user = await this.getUserId(userId);
		let oldUserName: string = user.nameNick;
		if (await this.findOneNick(newUsername))
			return ("name already in use");
		user.nameNick = newUsername;
		this.usersRepository.save(user);
		//try
		//{
		//	if (await this.findOneNick(newUsername))
		//		return ("name already in use");
		//}
		//catch
		//{
		//	console.log("succes");
		//	oldUserName = user.nameNick;
		//	user.nameNick = newUsername;
		//	this.usersRepository.save(user);
		//}

		this.notificationGateway.sendUpdatedNickname(user, newUsername);
		this.logger.log(`Successfully changed username from '${oldUserName}' to '${newUsername}' of user id: ${userId}`);
		return ("");
	}
  
	async getFriend(code: string): Promise<User | null> 
	{
		return (this.findOneIntra(Number(code)));
	}

	async getFriendslistFromUser(id: string): Promise<string[]>
	{
		var user = await this.findOneId(Number(id));
		return (user.friends);
	}

	async updateNewFriendship(iduser:string, idother:string)
	{
		const [user, otheruser] = await Promise.all([this.getUserId(iduser), this.getUserId(idother)]);

		(user).friends.push((otheruser).id.toString());
		await this.usersRepository.save((user));

		(otheruser).friends.push((user).id.toString());
		await this.usersRepository.save((otheruser));

		this.logger.log(`Created friendship between ${user.nameNick} and ${otheruser.nameNick}`);
	}

	async removeFriend(user: User, other: User)
	{
		let newlistUser: string[] = user.friends.filter((friend: string) => friend !== other.id.toString());
		user.friends = newlistUser;
		this.usersRepository.save(user);
		
		let newlistOther: string[] = other.friends.filter((afriend: string) => afriend !== user.id.toString());
		other.friends = newlistOther;
		this.usersRepository.save(other);

		this.logger.log(`Removed friendship between ${user.nameNick} and ${other.nameNick}`);
		this.notificationGateway.removeFriend(user, newlistUser, other, newlistOther);
	}

	async blockUser(user: User, other: User)
	{
		// if it's already blocked ignore
		if (user.blocked.find((blockedId) => blockedId === other.id.toString()))
			return ;

		this.removeFriend(user, other);
		user.blocked.push(other.id.toString());
		this.usersRepository.save(user);
		
		this.notificationGateway.sendBlocked(other);
		this.notificationGateway.removeExistingNoti(user, other);
		this.logger.log(`${user.nameNick} blocked ${other.nameNick}`);
	}

	async unBlockUser(user: User, other: User)
	{
		const newlist = user.blocked.filter(blocked => blocked !== other.id.toString());
		user.blocked = newlist;
		this.usersRepository.save(user);
		
		this.notificationGateway.sendUnBlocked(other);
		this.logger.log(`${user.nameNick} unblocked ${other.nameNick}`);
	}

	async changeProfilePic(user: User, image:string)
	{
		user.image = image;
		this.usersRepository.save(user);
		this.logger.log(`${user.nameNick} updated their profile picture`);
		this.notificationGateway.sendUpdatedImage(user, image);
		return (image);
	}

	async fetchMatches(user: User) : Promise<MatchDataDTO[] | undefined> {

		const gamesDB : Game[] = await this.findGamesByUser(user);

		let matchData: MatchDataDTO[] = [];
		for (const game of gamesDB)
			matchData.push(new MatchDataDTO(game));

		this.logger.debug(`Fetching matches for user ${user.nameNick}`);
		return (matchData);
	}

	async calculateRatio(user: User): Promise<MatchRatioDTO[]>
	{
		const games: Game[] = await this.findGamesByUser(user);
	
		const totMatches = games.length;
		let powerUpMatches = 0;
		let nonPowerUpMatches = 0;
		let totMatchesWon = 0;
		let nonPowerUpMatchesWon = 0;
		let powerUpMatchesWon = 0;
		
		for ( const game of games ) {
			if (game.powerups === 0) {
				nonPowerUpMatches += 1;
				if (game.winner.id === user.id) {
					totMatchesWon += 1;
					nonPowerUpMatchesWon += 1;
				}
			} else {
				powerUpMatches += 1;
				if (game.winner.id === user.id) {
					totMatchesWon += 1;
					powerUpMatchesWon += 1;
				}
			}
		};

		this.logger.debug(`Fetching matches ratios for user ${user.nameNick}`);
		return [
			{title: "Normal", wonGames: nonPowerUpMatchesWon, totGames: nonPowerUpMatches},
			{title: "Power ups", wonGames: powerUpMatchesWon, totGames: powerUpMatches},
			{title: "All", wonGames: totMatchesWon, totGames: totMatches}
		];
	}

	async fillArray(allData: LeaderboardDTO[], type: string): Promise<LeaderboardDTO[]>
	{
		var ratioIndex: number = 0;
		if (type == "Power ups")
			ratioIndex = 1;
		if (type == "All")
			ratioIndex = 2;

		var arr: LeaderboardDTO[] = [];
		allData.forEach((item: LeaderboardDTO) =>
		{
			item.ratio.forEach((values: MatchRatioDTO) =>
			{
				var tmpType = values.title;
				var tmpRate = Math.round((values.wonGames / values.totGames) * 100);
				if (Number.isNaN(tmpRate))
					tmpRate = 0;
				
				if (tmpType === type && values.totGames > 0)
				{
					if (arr.length === 0)
					{
						arr.push(item);
					}
					else
					{
						const firstRate = Math.round((arr[0].ratio[ratioIndex].wonGames / arr[0].ratio[ratioIndex].totGames) * 100);
						if (tmpRate >= firstRate)
						{
							arr.unshift(item);
						}
						else
						{
							var index = 0;
							while (index < arr.length && tmpRate < firstRate)
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
		if (arr.length > 5)
			arr.splice(5);
		return (arr);
	}

	async initLeaderboardArr(allUser: User[]): Promise<LeaderboardDTO[]>
	{
		var allData: LeaderboardDTO[] = [];

		for (const item of allUser) 
		{
			const tmpratio = await this.calculateRatio(item);
			const tmp: LeaderboardDTO = { user: new UserDTO(item), ratio: tmpratio };
			allData.push(tmp);
		}

		return (allData);
	}

	// global leaderboard
	async leaderboardCalculator(): Promise<LeaderboardDTO[][]>
	{
		var allUser = await this.findAll();
		var allData: LeaderboardDTO[] = [];

		allData = await this.initLeaderboardArr(allUser);

		const [normalArr, powerArr, allArr] = await Promise.all([
			this.fillArray(allData, "Normal"),
			this.fillArray(allData, "Power ups"),
			this.fillArray(allData, "All"),
		])

		var result: LeaderboardDTO[][] = [];
		result.push(normalArr, powerArr, allArr);

		this.logger.debug(`Creating global leaderboard`);
		return (result);
	}

	async fetchGameAnimation(intraId: string): Promise<AnimationSelected> {

		const user: User = await this.getUserIntraId(intraId);

		this.logger.log(`fetching animation: ${user.gameAnimation} from ${user.nameNick}`);
		return user.gameAnimation;
	}

	async setGameAnimation(intraId: string, newGameAnimation: AnimationSelected): Promise<void> {

		const user: User = await this.getUserIntraId(intraId);
		user.gameAnimation = newGameAnimation;
		this.usersRepository.save(user);
		this.logger.log(`${user.nameNick} set game animation: ${newGameAnimation}`);
	}
}


