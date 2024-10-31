/* eslint-disable prettier/prettier */

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class GitHubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(private readonly authService: AuthService) {
    super({
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: 'https://toptop-be.onrender.com/api/v1/auth/github/callback',
      scope: ['user:email'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    // Xử lý thông tin người dùng từ GitHub
    return {
      id: profile.id,
      username: profile.username,
      email: profile.emails[0].value, // Lấy email đầu tiên
      avatar: profile.photos[0].value, // Lấy ảnh đại diện
    };
  }
}
