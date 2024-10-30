import { Controller, Get, Param, } from '@nestjs/common';
import { UsersService } from './users.service';


@Controller('users')
export class UsersController {

	constructor(
		private readonly UserService: UsersService,
	  ) { }

	
	@Get('/profile/:username')
 	async getProfile(@Param('username') username: string) {
    	return (this.UserService.getUser(username));
  	}

	@Get('/profile/:username/:nameNick')
	async newNickname(@Param('username') username: string, @Param('nameNick') nameNick: string)
	{
		console.log("NewNickName has been called!");
		return (this.UserService.setNameNick(username, nameNick));
	}
 }
