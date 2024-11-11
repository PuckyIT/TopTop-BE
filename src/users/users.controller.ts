/* eslint-disable prettier/prettier */
// user/user.controller.ts

import { Controller, Get, Post, Body, Param, Delete, UseGuards, Put, Req, ForbiddenException, UseInterceptors, UploadedFile } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';
import { ForgotPasswordDto } from 'src/users//dto/forgot-password.dto';
import { ResetPasswordDto } from 'src/users/dto/reset-password.dto';
import { JwtAuthGuard } from 'src/jwt/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) { }


  @Post('signup')
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req) {
    return req.user;
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
  @Put('profile/:id')
  @UseInterceptors(FileInterceptor('avatar'))  // Handle 'avatar' file field
  async updateUserProfile(
    @Req() req,
    @Param('id') id: string,
    @UploadedFile() avatarFile: Express.Multer.File,
    @Body() updateUserProfileDto: UpdateUserDto,
  ) {
    const userIdFromToken = req.user.id;
    if (userIdFromToken !== id) {
      throw new ForbiddenException("You are not allowed to update another user's profile.");
    }
    return this.usersService.updateUserProfile(id, updateUserProfileDto, avatarFile);
  }
}
