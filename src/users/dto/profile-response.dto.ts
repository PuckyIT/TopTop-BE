/* eslint-disable prettier/prettier */
// profile-response.dto.ts

export class ProfileResponseDto {
    username: string;
    bio: string;
    followersCount: number;
    followingCount: number;
    likesCount: number;
    avatar?: string;
}