import { Controller, Get, Param, Post, HttpException, UploadedFile, UseInterceptors, Body, UseFilters } from '@nestjs/common';
import { UsersService } from './users.service';
import { FileInterceptor } from '@nestjs/platform-express';

import User from '../entities/user.entity';
// import MatchRatioDTO from 'src/dto/matchRatio.dto';
// import MatchDataDTO from 'src/dto/matchData.dto';
import { SessionExceptionFilter } from 'src/errors/exceptionFilters';

@Controller('users')
@UseFilters(SessionExceptionFilter)
export class UsersController {

	constructor( private readonly UserService: UsersService ) {}

	@Get('/profile/getAll')
	async getAllUsers() {
		return (this.UserService.findAll());
	}

	@Get('/profile/:username')
	async getUserfromdb(@Param('username') username: string) {
		return (this.UserService.getUserId(username));
	}

	@Get('/profile/fetchUser/:username')
	async fetchUser(@Param('username') username: string) {
		return (this.UserService.findOneNick(username));
	}

	@Post('/profile/:username/newnick')
	async setNewNickname(@Param('username') username: string, @Body('newname') newname:string) : Promise<string> {
		return (this.UserService.setNameNick(username, newname));
	}

	@Get('/profile/:username/friend/:id')
	async fetchFriend(@Param('id') id: string) {
		return (this.UserService.getUserIntraId(id));
	}

	@Get('/profile/:username/opponent/:id')
	async fetchOpponent(@Param('id') id: string) {
		return (this.UserService.getUserId(id));
	}

	@Get('profile/:username/friend/remove/:id')
	async removeFriend(@Param('username') username:string, @Param('id') id: string) 
	{
		const user = this.UserService.getUserId(username);
		const other = this.UserService.getUserIntraId(id);
		
		return (this.UserService.removeFriend(await user,await other));
	}

	@Get('profile/:username/friend/block/:id')
	async blockUser(@Param('username') username:string, @Param('id') id: string) 
	{
		const user = this.UserService.getUserId(username);
		const other = this.UserService.getUserIntraId(id);

		return (this.UserService.blockUser(await user,await other));
	}

	@Get('profile/:username/friend/unBlock/:id')
	async unBlockUser(@Param('username') username:string, @Param('id') id: string) 
	{
		const user = this.UserService.getUserId(username);
		const other = this.UserService.getUserIntraId(id);

		return (this.UserService.unBlockUser(await user,await other));
	}

	@Post('profile/:username/changepfp')
	@UseInterceptors(FileInterceptor('file')) //instead of any the file should be Express.Multer.File,
	async changePFP(@Param('username') username:string,  @UploadedFile() file: any) 
	{
		const image = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
		const user = await this.UserService.getUserId(username);

		return (this.UserService.changeProfilePic(user, image));
	}

	@Get('profile/:intraId/matches')
	async fetchMatchData(@Param('intraId') intraId:string) {

		const user: User = await this.UserService.getUserIntraId(intraId);
	
		return (await this.UserService.fetchMatches(user));
	}

	@Get('/profile/fetchRatio/:intraId')
	async fetchRatio(@Param('intraId') intraId:string) 
	{
		const user: User = await this.UserService.getUserIntraId(intraId);
	
		return (await this.UserService.calculateRatio(user));
	}

	@Get('/fetchLeaderboard')
	async fetchLeaderboard() {
		return (await this.UserService.leaderboardCalculator());
	}
}
