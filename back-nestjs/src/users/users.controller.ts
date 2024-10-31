import { Controller, Get, Param, } from '@nestjs/common';
import { UsersService } from './users.service';


@Controller('users')
export class UsersController {

	constructor(
		private readonly UserService: UsersService,
	  ) { }


	@Get('/profile/:username/:key/:value')
	async handleCallFrontend(@Param('username') username: string, @Param('key') key: string, @Param('value') value: string)
	{
		if (key == "setNameNick")
			return (this.UserService.setNameNick(username, value));
		else if (key == "getUser")
			return (this.UserService.getUser(username));
		else if (key == "addFriend")
			return (this.UserService.addFriend(username, value));
		else if (key == "changeProfilePic")
			return (this.UserService.changeProfilePic(username, value));
		else if (key == "removeFriend")
			return (this.UserService.removeFriend(username, value));
		else if (key == "blockUser")
			return (this.UserService.blockUser(username, value));
		else if (key == "inviteGame")
			return (this.UserService.inviteGame(username, value));
		else if (key == "sendMessage")
			return (this.UserService.sendMessage(username, value, "NEEDTOFIX"));
	}
}
