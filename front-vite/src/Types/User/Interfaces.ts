import { UserStatus } from "./Enum";

export interface MatchRatio {
  title: string;
  value: number;
  rate: number;
}

export interface LeaderboardData {
  user: User;
  ratio: MatchRatio[];
}

export interface MatchData {
  player1: string;
  player2: string;
  player1Score: number;
  player2Score: number;
  whoWon: string;
  type: string;
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
}

export interface UserContextType {
	user: User;
	setUser: React.Dispatch<React.SetStateAction<User>>;
}