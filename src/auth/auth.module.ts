/* eslint-disable prettier/prettier */
// auth.module.ts

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { JwtStrategy } from 'src/jwt/jwt.strategy';
import { AuthController } from './auth.controller';
import { GoogleStrategy } from 'src/strategies/google.strategy';
import { GitHubStrategy } from 'src/strategies/github.strategy';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'yourSecretKey',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [AuthService, JwtStrategy, GoogleStrategy, GitHubStrategy],
  controllers: [AuthController],
})
export class AuthModule {}