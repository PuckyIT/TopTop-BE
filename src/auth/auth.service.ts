/* eslint-disable prettier/prettier */
// auth/auth.service.ts

import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/schemas/user.schema';
import axios from 'axios';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) { }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async validateUser(email: string, password: string, username: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user.toObject();
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user._id };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    // Trả về token và thông tin người dùng (không bao gồm mật khẩu)
    return {
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
        role: user.role,
        createdAt: user.createdAt,
        isActive: user.isActive = true,
        bio: user.bio,
        followersCount: user.followersCount,
        followingCount: user.followingCount,
        likesCount: user.likesCount
      },
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      // Verify refresh token
      const payload = this.jwtService.verify(refreshToken, { secret: 'mySuperSecretKey' });

      // Tạo lại access token mới
      const newAccessToken = this.jwtService.sign({ email: payload.email, sub: payload.sub }, { expiresIn: '1h' });

      return { access_token: newAccessToken };
    } catch (e) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async validateOAuthUser(profile: any, accessToken: string, username?: string): Promise<User> {
    let email = profile.emails && profile.emails.length ? profile.emails[0].value : null;
    const avatar = profile.photos && profile.photos.length ? profile.photos[0].value : profile._json?.avatar_url;

    if (!email) {
      try {
        const response = await axios.get('https://api.github.com/user/emails', {
          headers: { Authorization: `token ${accessToken}` },
        });
        const emails = response.data;
        const primaryEmail = emails.find((email: any) => email.primary)?.email;
        if (primaryEmail) {
          email = primaryEmail;
        } else {
          throw new Error('Primary email not found');
        }
      } catch (error) {
        console.error('Error fetching email from GitHub:', error);
        throw new Error('Email not found');
      }
    }

    const existingUser = await this.usersService.findOneByEmail(email);
    if (existingUser) {
      if (avatar && existingUser.avatar !== avatar) {
        existingUser.avatar = avatar;
        await existingUser.save();
      }
      return existingUser;
    }

    const isUsernameTaken = await this.usersService.findOneByUsername(username);
    if (isUsernameTaken) {
      throw new ConflictException('Username is already taken');
    }

    const newUser = await this.usersService.create({
      email,
      password: null,
      username,
      avatar,
    });

    return newUser;
  }

  async googleLogin(req: any) {
    if (!req.user) {
      return null; // Trả về null nếu không lấy được user
    }

    const user = await this.usersService.findOneByEmail(req.user.email); // Lấy lại người dùng từ DB

    const payload = { email: user.email, sub: user._id };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar, // Avatar từ cơ sở dữ liệu
      },
    };
  }

  async githubLogin(req: any) {
    if (!req.user) {
      return null; // Trả về null nếu không lấy được user
    }

    // Tìm người dùng trong DB bằng email từ profile GitHub
    const user = await this.usersService.findOneByEmail(req.user.email);

    // Tạo payload cho JWT
    const payload = { email: user.email, sub: user._id };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
      },
    };
  }
}