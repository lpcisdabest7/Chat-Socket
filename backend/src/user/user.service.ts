import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { assignIn } from 'lodash';
import { User } from './user.schema';
import { FilterQuery, Model } from 'mongoose';
import { generateHash } from '@libs/utils/util';
import { v4 as uuidv4 } from 'uuid';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiException } from '@libs/utils/exception';
import { ERROR_CODE } from '@libs/utils/const';
import { IAuthSocialProfile } from 'src/auth/dto/auth.interface';
import { AuthProvider } from 'src/auth/auth.type';
import { UserRegisterDto } from 'src/auth/dto/user-register.dto';
@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  findOne(filter: FilterQuery<User>) {
    return this.userModel.findOne(filter);
  }

  async createUser(userRegisterDto: UserRegisterDto) {
    const existUser = await this.userModel.findOne({
      email: userRegisterDto.email,
    });
    if (existUser) {
      throw new ApiException('Email already exist', HttpStatus.CONFLICT);
    }
    const user = await this.userModel.create({
      ...userRegisterDto,
      password: generateHash(userRegisterDto.password),
    });
    return user;
  }

  async createIfNotExistSocialUser(
    socialUser: IAuthSocialProfile,
    authProvider: AuthProvider,
  ) {
    let user;
    if (socialUser.email) {
      user = await this.userModel.findOne({
        $or: [
          { 'providers.providerId': socialUser.id },
          { email: socialUser.email },
        ],
      });
    } else {
      user = await this.userModel.findOne({
        'providers.providerId': socialUser.id,
      });
    }

    if (!user) {
      return await this.userModel.create({
        email: socialUser.email,
        username: socialUser.username,
        avatar: socialUser.avatar,
        providers: [{ provider: authProvider, providerId: socialUser.id }],
      });
    }

    return await this.userModel.findByIdAndUpdate(
      { _id: user.id },
      {
        $set: {
          email: socialUser.email || user.email,
          avatar: socialUser.avatar || user.avatar,
          username: socialUser.username || user.username,
        },
        ...(user.providers.every(
          (provider: any) => provider.providerId !== socialUser.id,
        ) && {
          $push: {
            providers: { provider: authProvider, providerId: socialUser.id },
          },
        }),
      },
      { new: true },
    );
  }

  async resetSessionDevice(user: User) {
    await this.userModel.findByIdAndUpdate(
      { _id: user._id },
      {
        $set: {
          sessionDevice: uuidv4(),
        },
      },
    );
  }

  async updateProfileUser(userId: string, updateUserDto: UpdateUserDto) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new ApiException(
        'User not found',
        HttpStatus.NOT_FOUND,
        ERROR_CODE.CLIENT_BAD_REQUEST.errorCode,
      );
    }
    assignIn(user, updateUserDto);
    return await user.save();
  }
}
