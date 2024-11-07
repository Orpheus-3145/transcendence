import { Controller, Get, Param, Post, HttpException} from '@nestjs/common';
import { UsersService } from './users.service';


@Controller('users')
export class UsersController {

	constructor(
		private readonly UserService: UsersService,
	  ) { }

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
			throw new HttpException('Bad Request', 400);
		if (newname.length > 28)
			throw new HttpException('Bad Request', 400);

		return (this.UserService.setNameNick(username, newname));
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

	@Post('profile/:username/changepfp/:image/')
	async changePFP(@Param('username') username:string, @Param('image') image: string) {
		return (this.UserService.changeProfilePic(username, image));
	}
}
