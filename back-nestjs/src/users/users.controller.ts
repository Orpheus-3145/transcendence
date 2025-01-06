import { Controller, Inject, Get, Param, Post, HttpException, UploadedFile, UseInterceptors, forwardRef, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationType } from 'src/entities/notification.entity';
import {User} from '../entities/user.entity'

@Controller('users')
export class UsersController {

	constructor(
		private readonly UserService: UsersService,
		@Inject(forwardRef(() => NotificationService))
		private readonly notificationService: NotificationService,
	  ) { }


	@Get('/profile/getAll')
	async getAllUsers() {
		return (this.UserService.findAll());
	}

	@Get('/profile/:username')
	async getUserfromdb(@Param('username') username: string) {
		var user = this.UserService.getUserId(username);
		if (!user)
			throw new HttpException('Not Found', 404);
		return (user);
	}

	@Post('/profile/:username/newnick')
	async setNewNickname(@Param('username') username: string, @Body('newname') newname:string) : Promise<string>
	{
		if (newname.length == 0)
		{
			console.log("lenght is 0, add chars!");
			return ("lenght is 0, add chars!");
		}
		if (newname.length > 27)
		{
			// throw new HttpException('Bad Request', 400);
			console.log("Lenght is bigger then 27 chars, make it shorter!");
			return ("lenght is bigger then 27 chars, make it shorter!");
		}

		let i = Number(0);
		while (i < newname.length)
		{
			if (((newname[i] < 'a') || (newname[i] > 'z')) && ((newname[i] < 'A') || (newname[i] > 'Z')) && ((newname[i] < '0') || (newname[i] > '9')))
			{
				if (newname[i] != ' ')
				{
					console.log("only letters, numbers and spaces are allowed!");
					return ("only letters, numbers and spaces are allowed!");
					// throw new HttpException('Bad Request', 400);
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
			console.log("Name needs atleast 1 letter or number!");
			return ("name needs atleast 1 letter or number!");
		}
		var user = this.UserService.getUserId(username);
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
		this.UserService.setNameNick(await user, newname);
		return ("");
	}

	@Get('/profile/:username/friend/:id')
	async fetchFriend(@Param('id') id: string) {
		return (this.UserService.getFriend(id));
	}

	@Get('profile/:username/friend/add/:id')
	async addFriend(@Param('username') username:string, @Param('id') id: string) 
	{
		var user = this.UserService.getUserId(username);
		var other = this.UserService.getUserId(id);
		if (user == null || other == null)
		{
			console.log("ERROR: failed to get user in addFriend!");
			throw new HttpException('Not Found', 404);
		}
		return (this.UserService.addFriend(await user, await other));
	}

	@Get('profile/:username/friend/remove/:id')
	async removeFriend(@Param('username') username:string, @Param('id') id: string) 
	{
		var user = this.UserService.getUserId(username);
		var other = this.UserService.getUserIntraId(id);
		if (user == null || other == null)
		{
			console.log("ERROR: failed to get user in removeFriend!");
			throw new HttpException('Not Found', 404);
		}
		return (this.UserService.removeFriend(await user, await other));
	}

	@Get('profile/:username/friend/block/:id')
	async blockUser(@Param('username') username:string, @Param('id') id: string) 
	{
		var user = this.UserService.getUserId(username);
		var other = this.UserService.getUserIntraId(id);
		if (user == null || other == null)
		{
			console.log("ERROR: failed to get user in blockUser!");
			throw new HttpException('Not Found', 404);
		}
		return (this.UserService.blockUser(await user, await other));
	}

	@Get('profile/:username/friend/unBlock/:id')
	async unBlockUser(@Param('username') username:string, @Param('id') id: string) 
	{
		var user = this.UserService.getUserId(username);
		var other = this.UserService.getUserIntraId(id);
		if (user == null || other == null)
		{
			console.log("ERROR: failed to get user in blockUser!");
			throw new HttpException('Not Found', 404);
		}
		return (this.UserService.unBlockUser(await user, await other));
	}

	@Post('profile/:username/sendMessage/:id')
	async sendMessage(@Param('username') username:string, @Param('id') id: string, @Body('message') message:string) 
	{
		if (message.length == 0)
		{
			console.log("ERROR: message in sendMessage is invalid!");
			throw new HttpException('Bad Request', 400);
		}
		var user = this.UserService.getUserId(username);
		var other = this.UserService.getUserId(id);
		if (user == null || other == null)
		{
			console.log("ERROR: failed to get user in sendMessage!");
			throw new HttpException('Not Found', 404);
		}
		return (this.UserService.sendMessage(await user, await other, message));
	}

	@Get('profile/:username/invitegame/:id/')
	async inviteGame(@Param('username') username:string, @Param('id') id: string) 
	{
		var user = this.UserService.getUserId(username);
		var other = this.UserService.getUserId(id);
		if (user == null || other == null)
		{
			console.log("ERROR: failed to get user in inviteGame!");
			throw new HttpException('Not Found', 404);
		}
		return (this.UserService.inviteGame(await user, await other));
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
		var user = this.UserService.getUserId(username);
		if (user == null)
		{
			console.log("ERROR: getting user in changePFP!");
			throw new HttpException('Not Found', 404);
		}
		return (this.UserService.changeProfilePic(await user, image));
	}
}
