import { UserStatus } from "./Enum";

export interface MatchRatio {
  title: string;
  wonGames: number;
  totGames: number;
}

export interface LeaderboardData {
  user: User;
  ratio: MatchRatio[];
}

export interface MatchData {
  player1: string;
  player2: string;
  winner: string;
  player1Score: number;
  player2Score: number;
  whoWon: string;
  type: string;
  forfeit: boolean;
}

export interface User {
  id: number;
  intraId: number;
  nameNick: string | null;
  nameIntra: string;
  nameFirst: string;
  nameLast: string;
  email: string;
  image: string | null;
  greeting: string;
  status: UserStatus;
  friends: string[];
  blocked: string[];
  twoFactorSecret: string;
}

export interface UserContextType {
	user: User;
	setUser: React.Dispatch<React.SetStateAction<User>>;
}