// generic data about the game
// @param width: width of the game
// @param height: height of the game
// @param maxScore: max goals before end of the game
export const GAME = {
  width: 1150,
  height: 648,
  maxScore: 3,
};

// data about the ball
// @param radius: radius of the ball
// @param defaultSpeed: speed of the ball when shot from the middle of the game
export const GAME_BALL = {
  radius: 12.5,
  defaultSpeed: 500,
};

// data about the bar
// @param width: width of the bar
// @param height: height of the bar
// @param defaultSpeed: scroll speed of the bar 
export const GAME_PADDLE = {
  width: GAME.width / 46,
  height: GAME.height / 6,
  defaultSpeed: 15,
};
