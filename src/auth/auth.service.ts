/* eslint-disable prettier/prettier */

import { Injectable } from '@nestjs/common';
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

  async validateUser(email: string, password: string): Promise<any> {
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
    const access_token = this.jwtService.sign(payload);

    // Trả về token và thông tin người dùng (không bao gồm mật khẩu)
    return {
      access_token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar, // Nếu có
      },
    };
  }

  async validateOAuthUser(profile: any, accessToken: string): Promise<User> {
    // Retrieve email and avatar
    let email = profile.emails && profile.emails.length ? profile.emails[0].value : null;
    const avatar = profile.photos && profile.photos.length ? profile.photos[0].value : profile._json?.avatar_url;

    // Fetch email from GitHub API if not found in the profile
    if (!email) {
      try {
        const response = await axios.get('https://api.github.com/user/emails', {
          headers: {
            Authorization: `token ${accessToken}`,
          },
        });
        const emails = response.data;
        const primaryEmail = emails.find((email: any) => email.primary)?.email;
        if (primaryEmail) {
          email = primaryEmail;
        } else {
          throw new Error('Primary email not found in GitHub response');
        }
      } catch (error) {
        console.error('Error fetching email from GitHub:', error);
        throw new Error('Email not found in GitHub profile');
      }
    }

    // Rest of your user creation or updating logic
    let user = await this.usersService.findOneByEmail(email);

    if (!user) {
      const newUser = await this.usersService.create({
        email,
        password: null,
        avatar,
      });
      user = newUser;
    } else {
      if (avatar && user.avatar !== avatar) {
        user.avatar = avatar;
        await user.save();
      }
    }

    return user;
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
        avatar: user.avatar, // Avatar từ cơ sở dữ liệu
      },
    };
  }
}