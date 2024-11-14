import { Controller, Get, Param, Post, HttpException, UploadedFile, UseInterceptors } from '@nestjs/common';
import { UsersService } from './users.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';


@Controller('users')
export class UsersController {

	constructor(
		private readonly UserService: UsersService,
	  ) { }


	@Get('/profile/getAll')
	async getAllUsers() {
		return (this.UserService.findAll());
	}

	@Post('/profile/:username')
	async getUserfromdb(@Param('username') username: string) {
		var user = this.UserService.getUser(username);
		if (!user)
			throw new HttpException('Not Found', 404);
		return (user);
	}

	@Post('/profile/:username/newnick/:newname')
	async setNewNickname(@Param('username') username: string, @Param('newname') newname: string) {
		if (newname.length == 0)
		{
			console.log("Invalid new nickname, to short!");
			throw new HttpException('Bad Request', 400);
		}
		if (newname.length > 27)
		{
			console.log("Invalid new nickname, to long!");
			throw new HttpException('Bad Request', 400);
		}

		let i = Number(0);
		while (i < newname.length)
		{
			if (((newname[i] < 'a') || (newname[i] > 'z')) && ((newname[i] < 'A') || (newname[i] > 'Z')) && ((newname[i] < '0') || (newname[i] > '9')))
			{
				if (newname[i] != ' ')
				{
					console.log("Invalid character in the new nickname");
					throw new HttpException('Bad Request', 400);
				}
			}
			i++;
		}
		console.log("User: " + username + " changed his nickname to: " + newname);
		this.UserService.setNameNick(username, newname);
		throw new HttpException('Ok', 200);
	}

	@Post('/profile/username/friend/:id')
	async getFriend(@Param('id') id: string) {
		return (this.UserService.getFriend(id));
	}

	@Post('profile/:username/friend/add/:id')
	async addFriend(@Param('username') username:string, @Param('id') id: string) {
		return (this.UserService.addFriend(username, id));
	}

	@Post('profile/:username/friend/remove/:id')
	async removeFriend(@Param('username') username:string, @Param('id') id: string) {
		return (this.UserService.removeFriend(username, id));
	}

	@Post('profile/:username/friend/block/:id')
	async blockUser(@Param('username') username:string, @Param('id') id: string) {
		return (this.UserService.blockUser(username, id));
	}

	@Post('profile/:username/message/:id/:message')
	async sendMessage(@Param('username') username:string, @Param('id') id: string, @Param('message') message:string) {
		return (this.UserService.sendMessage(username, id, message));
	}

	@Post('profile/:username/invitegame/:id/')
	async inviteGame(@Param('username') username:string, @Param('id') id: string) {
		return (this.UserService.inviteGame(username, id));
	}

	@Post('profile/:username/changepfp')
	@UseInterceptors(FileInterceptor('file')) //instead of any the file should be Express.Multer.File,
	async changePFP(@Param('username') username:string,  @UploadedFile() file: any,) {
		const image = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
		return (this.UserService.changeProfilePic(username, image));
	}
}
