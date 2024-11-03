/* eslint-disable prettier/prettier */
// user.controller.ts

import { Controller, Get, Post, Body, Param, Delete, UseGuards, Put } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';
import { ForgotPasswordDto } from 'src/users//dto/forgot-password.dto';
import { ResetPasswordDto } from 'src/users/dto/reset-password.dto';
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
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
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

  @Get('profile/:id')
  @UseGuards(AuthGuard('jwt'))
  async getProfile(@Param('id') id: string) {
    return this.usersService.getProfile(id);
  }  
}
