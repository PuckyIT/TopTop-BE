/* eslint-disable prettier/prettier */
// user/dto/update-user.dto.ts

import { IsOptional, IsString, IsInt, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class AvatarDto {
  @IsString()
  uid: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => AvatarDto)
  avatar?: AvatarDto;

  @IsOptional()
  @IsInt()
  followerCount?: number;

  @IsOptional()
  @IsInt()
  followingCount?: number;

  @IsOptional()
  @IsInt()
  likeCount?: number;
}