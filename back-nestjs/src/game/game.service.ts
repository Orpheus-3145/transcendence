import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { UsersService as UserService } from '../users/users.service';


@Injectable()
export default class GameService {
  constructor(
    private configService: ConfigService,
    private userService: UserService,
	// private ball: number, // vector
	// private player1: number, // y coordinate only (probably the centre coordinate)
	// private player2: number, // y coordinate only
	// private bot: boolean, // bot will automatically move towards the position of the ball
	// private roomId: number, // different game rooms can exist
	// 
  ) {};

	/* Logic
	   - Check what key is being pressed/ direction by the players
	   - Based on that move the position of the paddle
	   - Calculate the direction of the ball depending on where it hits the paddle
	   - Move ball based on a speed
	   - If ball collides with paddle change direction
	   - otherwise there has been a ponumbers change
	*/
  gameSimulation() {

	  // run  physics simulation here
  };

  // Set everything to the start position: ball in the centre, paddles centralised
  setStartPos() {
  
  };

  updateBall() {
		// update ball position every frame (setIntrerval function in JS)
		// Considerations: contact with edge of the window 
		// Move ball in direction until it reaches edge of the window,
		// If touches paddle, flip the direction to the opposite
		//Else, recentre game position and increment ponumber for player
  };

	async showPlayerz(): Promise<> {
		
	}
};
