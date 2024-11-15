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
    const tmp = new User();
    tmp.accessToken = access.access_token;
    tmp.intraId = 47328;
    tmp.nameNick = 'bald';
    tmp.nameIntra = 'baldwin';
    tmp.nameFirst = 'bal';
    tmp.nameLast = 'dwin';
    tmp.email = 'baldwin@student.codam.nl';
    tmp.image = userMe.image.link;
    tmp.greeting = 'Hello, I have just landed!';
    tmp.status = UserStatus.Offline;
    const a = new User();
    a.accessToken = access.access_token;
    a.intraId = 58493;
    a.nameNick = 'nani';
    a.nameIntra = 'nanida';
    a.nameFirst = 'nani';
    a.nameLast = 'fuq';
    a.email = 'nanidafuq@student.codam.nl';
    a.image = userMe.image.link;
    a.greeting = 'Hello, I have just landed!';
    a.status = UserStatus.Offline;
    try {
      await user.validate();
      await tmp.validate();
      await a.validate();
      await this.usersRepository.save(user);
      await this.usersRepository.save(tmp); //remove tmp when testing is done, it is an extra user to test
      await this.usersRepository.save(a);//remove tmp when testing is done, it is an extra user to test
      return new UserDTO(user);
    } catch (error) {
      console.error('User validation error: ', error);
      throw error;
    }
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
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

  async getUser(code: string): Promise<User | null> 
  {
    const numb = Number(code);
    return (this.findOneId(numb));
  }

  async setNameNick(id: string, nameNick: string)
  {
    var user = this.getUser(id);
    (await user).nameNick = nameNick;
    this.usersRepository.save((await user));
  }
  
  async getFriend(code: string): Promise<User | null> 
  {
    const numb = Number(code);
    return (this.findOne(numb));
  }
  
  async addFriend(iduser: string, idother:string)
  {
    var user = this.getUser(iduser);
    var otheruser = this.getUser(idother);
    if (!(await user).friends)
    {
      (await user).friends =  [];
    }
    if (!(await otheruser).friends)
      {
        (await otheruser).friends =  [];
      }
    (await user).friends.push((await otheruser).intraId.toString());
    this.usersRepository.save((await user));
    (await otheruser).friends.push((await user).intraId.toString());
    this.usersRepository.save((await otheruser));
  }

  async removeFriend(iduser:string, idother:string)
  {
    var user = this.getUser(iduser);
    var numb = Number(idother);
    var other = this.findOne(numb);
    var newlist = (await user).friends.filter(friend => friend !== idother);
    (await user).friends = newlist;
    this.usersRepository.save((await user));
    var userid = (await user).intraId.toString();
    newlist = (await other).friends.filter(afriend => afriend !== userid);
    (await other).friends = newlist;
    this.usersRepository.save((await other));
  }

  async blockUser(iduser:string, idother:string)
  {
    this.removeFriend(iduser, idother);
    var user = this.getUser(iduser);
    (await user).blocked.push(idother);
    this.usersRepository.save((await user));
  }
  
  async changeProfilePic(id:string, image:string)
  {
    var user = this.getUser(id);
    (await user).image = image;
    this.usersRepository.save((await user));
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
