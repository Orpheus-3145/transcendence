import { Controller, Get, Param, Post, HttpException, UploadedFile, UseInterceptors, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { FileInterceptor } from '@nestjs/platform-express';

import User from '../entities/user.entity';
import MatchRatioDTO from 'src/dto/matchRatio.dto';
import MatchDataDTO from 'src/dto/matchData.dto';

@Controller('users')
export class UsersController {

	constructor(
		private readonly UserService: UsersService,
	  ) {}

	@Get('/profile/getAll')
	async getAllUsers() {
		return (this.UserService.findAll());
	}

	@Get('/profile/:username')
	async getUserfromdb(@Param('username') username: string) {
		var user = await this.UserService.getUserId(username);
		if (!user)
			throw new HttpException('Not Found', 404);
		return (user);
	}

	@Get('/profile/fetchUser/:username')
	async fetchUser(@Param('username') username: string) {
		var user: User | null = await this.UserService.findOneNick(username);
		return (user);
	}

	@Post('/profile/:username/newnick')
	async setNewNickname(@Param('username') username: string, @Body('newname') newname:string) : Promise<string>
	{
		if (newname.length == 0)
		{
			return ("lenght is 0, add chars!");
		}
		if (newname.length > 27)
		{
			return ("lenght is bigger then 27 chars, make it shorter!");
		}

		let i = Number(0);
		while (i < newname.length)
		{
			if (((newname[i] < 'a') || (newname[i] > 'z')) && ((newname[i] < 'A') || (newname[i] > 'Z')) && ((newname[i] < '0') || (newname[i] > '9')))
			{
				if (newname[i] != ' ' && newname[i] != '_' && newname[i] != '-')
				{
					var str: string = "char: " + newname[i] + " is not allowed! Only letters, numbers, spaced, - and _ are allowed!";
					return (str);
				}
			}
			i++;
		}
		i = 0;
		while (i < newname.length)
		{
			if (newname[i] != ' ')
			{
				break ;
			}
			i++;
		}
		if (i == newname.length)
		{	
			return ("name needs atleast 1 letter or number!");
		}
		var user = await this.UserService.getUserId(username);
		if (user == null)
		{
			console.log("error");
			return ("error");
		}

		var tmp: User | null = await this.UserService.findOneNick(newname);
		if (tmp)
		{
			return ("name already exists!");
		}
		this.UserService.setNameNick(user, newname);
		return ("");
	}

	@Get('/profile/friend/:id')
	async fetchFriend(@Param('id') id: string) 
	{
		return (this.UserService.getUserIntraId(id));
	}

	@Get('/profile/opponent/:intraName')
	async fetchOpponent(@Param('intraName') intraName: string) 
	{
		return (this.UserService.findOneIntraName(intraName));
	}

	@Get('/profile/message/:id')
	async fetchUserMessage(@Param('id') id: string) 
	{
		return (this.UserService.getUserId(id));
	}

	@Get('profile/:username/friend/remove/:id')
	async removeFriend(@Param('username') username:string, @Param('id') id: string) 
	{
		var user = await this.UserService.getUserId(username);
		var other = await this.UserService.getUserIntraId(id);
		if (user == null || other == null)
		{
			console.log("ERROR: failed to get user in removeFriend!");
			throw new HttpException('Not Found', 404);
		}
		return (this.UserService.removeFriend(user, other));
	}

	@Get('profile/:username/friend/block/:id')
	async blockUser(@Param('username') username:string, @Param('id') id: string) 
	{
		var user = await this.UserService.getUserId(username);
		var other = await this.UserService.getUserIntraId(id);
		if (user == null || other == null)
		{
			console.log("ERROR: failed to get user in blockUser!");
			throw new HttpException('Not Found', 404);
		}
		return (this.UserService.blockUser(user, other));
	}

	@Get('profile/:username/friend/unBlock/:id')
	async unBlockUser(@Param('username') username:string, @Param('id') id: string) 
	{
		var user = await this.UserService.getUserId(username);
		var other = await this.UserService.getUserIntraId(id);
		if (user == null || other == null)
		{
			console.log("ERROR: failed to get user in blockUser!");
			throw new HttpException('Not Found', 404);
		}
		return (this.UserService.unBlockUser(user, other));
	}

	@Post('profile/:username/changepfp')
	@UseInterceptors(FileInterceptor('file')) //instead of any the file should be Express.Multer.File,
	async changePFP(@Param('username') username:string,  @UploadedFile() file: any) 
	{
		const image = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
		if (!image)
		{
			console.log("ERROR: image is invalid!");
			throw new HttpException('Bad Request', 400);
		}
		console.log('calling changePFP (users.controller)!');
		var user = await this.UserService.getUserId(username);
		if (user == null)
		{
			console.log("ERROR: getting user in changePFP!");
			throw new HttpException('Not Found', 404);
		}
		return (this.UserService.changeProfilePic(user, image));
	}

	@Get('profile/:intraId/matches')
	async fetchMatchData(@Param('intraId') intraId:string) {

		const user: User = await this.UserService.getUserIntraId(intraId);
		const games: MatchDataDTO[] = await this.UserService.fetchMatches(user);
		return games;
	}

	@Get('/profile/fetchRatio/:intraId')
	async fetchRatio(@Param('intraId') intraId:string) 
	{
		const user: User = await this.UserService.getUserIntraId(intraId);
		var arr: MatchRatioDTO[] = await this.UserService.calculateRatio(user);
		return (arr);
	}

	@Get('/fetchLeaderboard')
	async fetchLeaderboard() {
		return (this.UserService.leaderboardCalculator());
	}
}
