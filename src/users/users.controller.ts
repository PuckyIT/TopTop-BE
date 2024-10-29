/* eslint-disable prettier/prettier */
// user.controller.ts

import { Controller, Get, Post, Body, Param, Delete, UseGuards, Put, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';
import { ForgotPasswordDto } from 'src/users//dto/forgot-password.dto';
import { ResetPasswordDto } from 'src/users/dto/reset-password.dto';
import { JwtAuthGuard } from 'src/jwt/jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post('signup')
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.usersService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password/:otp')
  async resetPassword(@Param('otp') otp: string, @Body() resetPasswordDto: ResetPasswordDto) {
    return this.usersService.resetPassword(otp, resetPasswordDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  getProfile() {
    return { message: 'This route is protected' };
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))  // Bảo vệ route với JWT
  getMe(@Req() req) {
    // req.user sẽ chứa thông tin người dùng từ token
    return req.user;
  }
}
