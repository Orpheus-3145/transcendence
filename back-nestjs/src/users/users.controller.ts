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
		const status: string = await this.UserService.setNameNick(username, newname);
		return (status);
	}

	@Get('/profile/:username/friend/:id')
	async fetchFriend(@Param('id') id: string) 
	{
		return (this.UserService.getUserIntraId(id));
	}

	@Get('/profile/:username/opponent/:id')
	async fetchOpponent(@Param('id') id: string) 
	{
		return (this.UserService.getUserId(id));
	}

	@Get('profile/:username/friend/remove/:id')
	async removeFriend(@Param('username') username:string, @Param('id') id: string) 
	{
		const user = await this.UserService.getUserId(username);
		const other = await this.UserService.getUserIntraId(id);
		if (user == null || other == null)
		// {
			// console.log("ERROR: failed to get user in removeFriend!");
			throw new HttpException('Not Found', 404);
		// }
		return (this.UserService.removeFriend(user, other));
	}

	@Get('profile/:username/friend/block/:id')
	async blockUser(@Param('username') username:string, @Param('id') id: string) 
	{
		const user = await this.UserService.getUserId(username);
		const other = await this.UserService.getUserIntraId(id);
		if (user == null || other == null)
		// {
		// 	console.log("ERROR: failed to get user in blockUser!");
			throw new HttpException('Not Found', 404);
		// }
		return (this.UserService.blockUser(user, other));
	}

	@Get('profile/:username/friend/unBlock/:id')
	async unBlockUser(@Param('username') username:string, @Param('id') id: string) 
	{
		const user = await this.UserService.getUserId(username);
		const other = await this.UserService.getUserIntraId(id);
		if (user == null || other == null)
		// {
		// 	console.log("ERROR: failed to get user in blockUser!");
			throw new HttpException('Not Found', 404);
		// }
		return (this.UserService.unBlockUser(user, other));
	}

	@Post('profile/:username/changepfp')
	@UseInterceptors(FileInterceptor('file')) //instead of any the file should be Express.Multer.File,
	async changePFP(@Param('username') username:string,  @UploadedFile() file: any) 
	{
		const image = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
		// if (!image)
		// {
		// 	console.log("ERROR: image is invalid!");
		// 	throw new HttpException('Bad Request', 400);
		// }
		const user = await this.UserService.getUserId(username);
		if (user == null)
		// {
		// 	console.log("ERROR: getting user in changePFP!");
			throw new HttpException('Not Found', 404);
		// }
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
		return (await this.UserService.leaderboardCalculator());
	}
}
