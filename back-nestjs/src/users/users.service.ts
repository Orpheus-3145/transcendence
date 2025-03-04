import { Injectable, Inject, forwardRef, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import AppLoggerService from 'src/log/log.service';
import ExceptionFactory from 'src/errors/exceptionFactory.service';
import User from '../entities/user.entity';
import Game from 'src/entities/game.entity';
import AccessTokenDTO  from '../dto/auth.dto';
import UserDTO, { UserStatus } from '../dto/user.dto'
import MatchDataDTO from 'src/dto/matchData.dto';
import LeaderboardDTO from 'src/dto/leaderboard.dto';
import MatchRatioDTO from 'src/dto/matchRatio.dto';


@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(User) private usersRepository: Repository<User>,
		@InjectRepository(Game) private gamesRepository: Repository<Game>,
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
		user.twoFactorSecret = null;

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
			throw error;
		}
	}

	async update(user: User): Promise<User> {
		try {
			await this.usersRepository.save(user);
			return user;
		} catch (error) {
			this.thrower.throwSessionExcp(
				`User update error: ${error}`,
				`${UsersService.name}.${this.constructor.prototype.update.name}()`,
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
		return this.usersRepository.findOne({ where: { intraId: intraId } });
	}

	async findOneId(id: number): Promise<User | null> {
		return this.usersRepository.findOne({ where: { id: id } });
	}

	async findOneIntraName(intraName: string): Promise<User | null> {
		return this.usersRepository.findOne({ where: { nameIntra: intraName } });
	}

	async findOneNick(nameNick: string): Promise<User | null> {
		return this.usersRepository.findOne({ where: { nameNick } });
	}

	async findGamesByUser(user: User) : Promise<Game[] | undefined> {

		const gamesPlayedbyId: Game[] = await this.gamesRepository.find(
			{ where : [
				{ player1 : {id: user.id} },
				{ player2 : {id: user.id} },
				]
			}
		);
		return gamesPlayedbyId;
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
		var user = await this.findOneIntra(id);
		user.status = which;
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

	async fetchMatches(user: User) : Promise<MatchDataDTO[] | undefined> {

		const gamesDB : Game[] = await this.gamesRepository.find({
			where : [
				{ player1 : {id: user.id} },
				{ player2 : {id: user.id} },
			],
			relations: ['player1', 'player2'],
		});
		let matchData: MatchDataDTO[] = [];
		for (const game of gamesDB) {

			const winner: string = (game.player1Score > game.player2Score) ? game.player1.nameIntra : game.player2.nameIntra;
			const type: string = (game.powerups === 0) ? 'No powerups' : 'With powerups';
			matchData.push({
				player1: game.player1.nameIntra,
				player2: game.player2.nameIntra,
				player1Score: game.player1Score,
				player2Score: game.player2Score,
				whoWon: winner,
				type: type,
			});
		}

		return matchData;
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
				if ((game.player1Score > game.player2Score && game.player1.intraId === user.intraId) ||
						(game.player2Score > game.player1Score && game.player2.intraId === user.intraId)) {
					totMatchesWon += 1;
					nonPowerUpMatchesWon += 1;
				}
			} else {
				powerUpMatches += 1;
				if ((game.player1Score > game.player2Score && game.player1.intraId === user.intraId) ||
						(game.player2Score > game.player1Score && game.player2.intraId === user.intraId)) {
					totMatchesWon += 1;
					powerUpMatchesWon += 1;
				}
			}
		};

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
				if (tmpType === type && values.wonGames > 0)
				{
					if (arr.length === 0)
						arr.push(item);
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
		arr.splice(5);
		return (arr);
	}

	async initLeaderboardArr(allUser: User[]): Promise<LeaderboardDTO[]>
	{
		var tmpratio: MatchRatioDTO[] = [];
		var allData: LeaderboardDTO[] = [];

		allUser.forEach(async (item: User) => 
		{
			tmpratio = await this.calculateRatio(item);
			var tmp: LeaderboardDTO = { user: new UserDTO(item), ratio: tmpratio };
			allData.push(tmp);
		});

		return (allData);
	}

	// global leaderboard
	async leaderboardCalculator(): Promise<LeaderboardDTO[][]>
	{
		var allUser = await this.findAll();
		var allData: LeaderboardDTO[] = [];

		allData = await this.initLeaderboardArr(allUser);

		var normalArr: LeaderboardDTO[] = await this.fillArray(allData, "Normal");
		var powerArr: LeaderboardDTO[] = await this.fillArray(allData, "Power ups");
		var allArr: LeaderboardDTO[] = await this.fillArray(allData, "All");

		var result: LeaderboardDTO[][] = [];
		result.push(normalArr, powerArr, allArr);

		return (result);
	}
}
