/* eslint-disable prettier/prettier */
// auth.controller.ts

import { Controller, Post, Body, UnauthorizedException, Get, UseGuards, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  async login(@Body() loginDto: { email: string; password: string }) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return this.authService.login(user);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async googleAuth(@Req() req) {
    // Đường dẫn này sẽ chuyển hướng đến Google để xác thực
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req, @Res() res) {
    const result = await this.authService.googleLogin(req);

    if (result) {
      const { access_token, user } = result;
      return res.redirect(`http://localhost:3000/login/callback?token=${access_token}&email=${user.email}&avatar=${user.avatar}`);
    } else {
      return res.redirect('http://localhost:3000/login');
    }
  }



  @Get('github')
  @UseGuards(AuthGuard('github'))
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async githubAuth(@Req() req) {
    // Đường dẫn này sẽ chuyển hướng đến GitHub để xác thực
  }

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  githubAuthCallback(@Req() req, @Res() res) {
    // Xử lý callback từ GitHub
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const user = req.user; // Thông tin người dùng
    res.redirect('/home'); // Chuyển hướng sau khi đăng nhập thành công
  }
}