/* eslint-disable prettier/prettier */
// user/user.controller.ts

import { Controller, Get, Post, Body, Param, Delete, UseGuards, Put, Req, Patch, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';
import { ForgotPasswordDto } from 'src/users//dto/forgot-password.dto';
import { ResetPasswordDto } from 'src/users/dto/reset-password.dto';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from 'src/jwt/jwt-auth.guard';

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
  async updateUserProfile(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto
  ) {
    if (!id) {
      throw new BadRequestException('User ID is required.');
    }

    // Cập nhật thông tin người dùng
    const updatedUser = await this.usersService.update(id, updateUserDto);

    return {
      message: 'User updated successfully',
      user: updatedUser,
    };
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

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(@Req() req, @Body() updateData: { username?: string; avatar?: string }) {
    // `req.user` contains the authenticated user data
    const userId = req.user._id;

    // Update the user's profile with provided data
    const updatedUser = await this.usersService.updateUser(userId, updateData);

    return {
      message: 'Profile updated successfully',
      user: updatedUser,
    };
  }
}
