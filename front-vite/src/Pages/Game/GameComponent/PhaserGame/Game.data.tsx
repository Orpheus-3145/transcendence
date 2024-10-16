// generic data about the game
// @param width: width of the game
// @param height: height of the game
// @param idDiv: ref of DOM element that contains the game
// @param maxScore: max goals before end of the game
export const GAME = {
  width: 1152,
  height: 648,
  maxScore: 1,
};

// data about the ball
// @param radius: radius of the ball
// @param defaultSpeed: speed of the ball when shot from the middle of the game
// @param texture: image of the ball
export const GAME_BALL = {
  radius: 12.5,
  defaultSpeed: 500,
  texture: '',
};

// data about the bar
// @param width: width of the bar
// @param height: height of the bar
// @param defaultSpeed: scroll speed of the bar 
// @param texture: image of the bar
export const GAME_BAR = {
  width: 25,
  height: GAME.height / 6,
  defaultSpeed: 15,
  texture: '',
};