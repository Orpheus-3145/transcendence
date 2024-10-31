import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserStatus, UserDTO } from '../dto/user.dto'
import { AccessTokenDTO } from '../dto/auth.dto';


@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) { }

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
    user.status = UserStatus.Offline;
    try {
      await user.validate();
      await this.usersRepository.save(user);
      return new UserDTO(user);
    } catch (error) {
      console.error('User validation error: ', error);
      throw error;
    }
  }

  async findOne(intraId: number): Promise<User | null> {
    return this.usersRepository.findOne({ where: { intraId } });
  }

  async findOneId(id: number): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findOneNick(nameNick: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { nameNick } });
  }

  async getUser(code: string): Promise<User | null> {
    const numb = Number(code);
    return (this.findOneId(numb));
  }

  async setNameNick(id: string, nameNick: string)
  {
    var user = this.getUser(id);
    (await user).nameNick = nameNick;
    this.usersRepository.save((await user));
  }

  async addFriend(iduser: string, idother:string)
  {
    // var user = this.findOneNick(iduser);
    // (await user).friends.push(idother);
    // this.usersRepository.save((await user));
    //still need to test if this works!!!!!!!!!!
    console.log("add friend");
  }

  async changeProfilePic(id:string, image:any)
  {
    console.log("change profile picture");
  }

  async removeFriend(iduser:string, idother:string)
  {
    // var user = this.findOneNick(iduser);
    // var newlist = (await user).friends.filter(friend => friend !== idother);
    // (await user).friends = newlist;
    // this.usersRepository.save((await user));
    // console.log("hahaha: " + (await user).friends);
    //doenst work yet since friends list is empty!!!!!!!!!!!!
    console.log("remove friend");
  }

  async blockUser(iduser:string, idother:string)
  {
    console.log("block user");
  }

  async inviteGame(iduser:string, idother:string)
  {
    console.log("invite game");
  }

  async sendMessage(iduser:string, idother:string, message:string)
  {
    console.log("send message");
  }
}
