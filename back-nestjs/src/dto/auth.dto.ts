import { IsString, IsNumber } from "class-validator";

export class AccessTokenDTO {

  constructor(data: Partial<AccessTokenDTO>) {
    Object.assign(this, data);
  }

  @IsString()
  access_token: string;

  @IsString()
  token_type: string;

  @IsNumber()
  expires_in: number;

  @IsString()
  scope: string;

  @IsNumber()
  created_at: number;
}