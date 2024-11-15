/* eslint-disable prettier/prettier */
// auth/auth.controller.ts

import { Controller, Post, Body, UnauthorizedException, Get, UseGuards, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  async login(@Body() loginDto: { email: string; password: string, username: string }) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
      loginDto.username,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return this.authService.login(user);
  }

  @Post('refresh-token')
  async refreshAccessToken(@Body() body: { refreshToken: string }) {
    const { refreshToken } = body;
    return await this.authService.refreshToken(refreshToken);
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    return (res as Response).status(200).json({ message: 'Successfully logged out' });
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
      return res.redirect(`https://top-top.vercel.app/login/callback?token=${access_token}&email=${user.email}&avatar=${user.avatar}`);
    } else {
      return res.redirect('https://top-top.vercel.app/login');
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
  async githubAuthCallback(@Req() req, @Res() res) {
    const result = await this.authService.githubLogin(req);
  
    if (result) {
      const { access_token, user } = result;
      return res.redirect(`https://top-top.vercel.app/login/callback?token=${access_token}&email=${user.email}&avatar=${user.avatar}`);
    } else {
      return res.redirect('https://top-top.vercel.app/login');
    } 
  }
}