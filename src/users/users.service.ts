/* eslint-disable prettier/prettier */
// user/user.service.ts

import { UpdateUserDto } from 'src/users/dto/update-user.dto';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { MailerService } from '@nestjs-modules/mailer';
import { ForgotPasswordDto } from 'src/users/dto/forgot-password.dto';
import { ResetPasswordDto } from 'src/users/dto/reset-password.dto';
import { CloudinaryService } from 'src/configs/cloudinary/cloudinary.config';

@Injectable()
export class UsersService {
  [x: string]: any;
  constructor(@InjectModel(User.name)
  private userModel: Model<UserDocument>,
    private readonly mailerService: MailerService,
    private readonly cloudinaryService: CloudinaryService,
  ) { }

  async create(createUserDto: { email: string, password: string | null, avatar?: { uid: string } | null, username: string }): Promise<User> {
    const { email, password, avatar, username } = createUserDto;

    // Kiểm tra nếu username đã tồn tại
    const existingUser = await this.userModel.findOne({ username });
    if (existingUser) {
      throw new ConflictException('Username đã tồn tại. Vui lòng chọn username khác.');
    }

    let avatarUid = null;
    if (avatar && avatar.uid) {  // avatar có thể là null, nên bạn không cần kiểm tra typeof avatar
      avatarUid = avatar.uid;
    }

    // Kiểm tra nếu password tồn tại (chỉ hash nếu không phải OAuth)
    let hashedPassword = null;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }

    const createdUser = new this.userModel({
      email,
      password: hashedPassword, // Lưu hashedPassword hoặc null
      username,
      avatar: avatarUid,  // avatarUid sẽ là null nếu không có avatar
    });

    return createdUser.save();
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{ message: string }> {
    const { email } = forgotPasswordDto;

    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Kiểm tra xem OTP đã được tạo trước đó chưa và còn hiệu lực không
    if (user.resetOtp && user.resetOtpExpire.getTime() > Date.now()) {
      throw new ConflictException('OTP đã được gửi và còn hiệu lực. Vui lòng kiểm tra email của bạn.');
    }

    // Tạo OTP 6 chữ số
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpire = Date.now() + 10 * 60 * 1000;

    // Lưu OTP và thời gian hết hạn vào cơ sở dữ liệu
    user.resetOtp = otp;
    user.resetOtpExpire = new Date(otpExpire);

    await user.save();

    // Gửi email chứa mã OTP cho người dùng
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Cài đặt lại mật khẩu',
      text: `Bạn đã yêu cầu đặt lại mật khẩu. OTP của bạn là ${otp}. Mã này sẽ hết hạn sau 10 phút.`,
    });

    return { message: 'OTP gửi thành công' };
  }

  async resetPassword(otp: string, resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    const { email, newPassword } = resetPasswordDto;

    // Tìm user theo email và OTP, kiểm tra OTP còn hiệu lực không
    const user = await this.userModel.findOne({
      email,
      resetOtp: otp,
      resetOtpExpire: { $gt: Date.now() }, // OTP vẫn còn hiệu lực
    });

    if (!user) {
      throw new NotFoundException('OTP không hợp lệ hoặc đã hết hạn');
    }

    // Mã hóa mật khẩu mới và cập nhật
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetOtp = undefined; // Xóa OTP sau khi sử dụng
    user.resetOtpExpire = undefined; // Xóa thời gian hết hạn
    await user.save();

    return { message: 'Mật khẩu đã được đặt lại' };
  }

  findAll() {
    return `This action returns all users`;
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findOne(id: string): Promise<User | null> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateUserProfile(id: string, updateUserProfileDto: UpdateUserDto, avatarFile: Express.Multer.File) {
    let avatarUrl;
    if (avatarFile) {
      const uploadedResponse = await this.cloudinaryService.uploadImage(avatarFile.buffer); // Pass buffer instead of file
      avatarUrl = uploadedResponse.secure_url;
    }
  
    return await this.userModel.findByIdAndUpdate(id, {
      ...updateUserProfileDto,
      avatar: avatarUrl || updateUserProfileDto.avatar,
    });
  }
}