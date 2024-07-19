import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  async getUserAccessToken(code: string): Promise<any> {
    let response = await fetch('https://api.intra.42.fr/oauth/token', {
      method: "POST",
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: process.env.SECRET_UID,
        client_secret: process.env.SECRET_PWD,
        code: code,
        redirect_uri: process.env.REDIRECT_URI,
      })
    });
    return response.json();
  }
  async getUserMe(access_token: string): Promise<any> {
    let response = await fetch('https://api.intra.42.fr/v2/me', {
      method: "GET",
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json'
      }
    })
    return response.json();
  }
}
