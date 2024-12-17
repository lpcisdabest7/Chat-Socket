import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { assignIn } from 'lodash';
import { User } from './user.schema';
import { FilterQuery, Model, ObjectId } from 'mongoose';
import { generateHash } from '@libs/utils/util';
import { v4 as uuidv4 } from 'uuid';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiException } from '@libs/utils/exception';
import { ERROR_CODE } from '@libs/utils/const';
import { IAuthSocialProfile } from 'src/auth/dto/auth.interface';
import { AuthProvider } from 'src/auth/auth.type';
import { UserRegisterDto } from 'src/auth/dto/user-register.dto';
import { AddFriendDto } from './dto/add-friend.dto';
import { Types } from 'mongoose';
import { PagingOffsetDto } from '@libs/core/dto/pagination-offset.dto';
@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  findOne(filter: FilterQuery<User>) {
    return this.userModel.findOne(filter);
  }

  async createUser(userRegisterDto: UserRegisterDto) {
    const { email, password, firstName, lastName } = userRegisterDto;

    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new ApiException('Email already exists', HttpStatus.CONFLICT);
    }

    const hashedPassword = generateHash(password);

    const newUser = {
      ...userRegisterDto,
      password: hashedPassword,
      username: `${firstName} ${lastName}`,
    };

    const user = await this.userModel.create(newUser);

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
        avatarImage: socialUser.avatarImage,
        providers: [{ provider: authProvider, providerId: socialUser.id }],
      });
    }

    return await this.userModel.findByIdAndUpdate(
      { _id: user.id },
      {
        $set: {
          email: socialUser.email || user.email,
          avatarImage: socialUser.avatarImage || user.avatarImage,
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

  async getFriends(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new ApiException(
        'User not found',
        HttpStatus.NOT_FOUND,
        ERROR_CODE.CLIENT_BAD_REQUEST.errorCode,
      );
    }
    const friends = await this.userModel
      .find({ _id: { $in: user.friends } })
      .select('username avatarImage');

    return friends;
  }

  async addFriends(userId: string, dto: AddFriendDto) {
    const { friendIds } = dto;

    if (!friendIds || (Array.isArray(friendIds) && friendIds.length === 0)) {
      throw new ApiException(
        'No friends provided to add',
        HttpStatus.BAD_REQUEST,
        ERROR_CODE.CLIENT_BAD_REQUEST.errorCode,
      );
    }

    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new ApiException(
        'User not found',
        HttpStatus.NOT_FOUND,
        ERROR_CODE.CLIENT_BAD_REQUEST.errorCode,
      );
    }

    const userIds = Array.isArray(friendIds) ? friendIds : [friendIds];
    const objectIds = userIds.map((id) => {
      if (!Types.ObjectId.isValid(id)) {
        throw new ApiException(
          `Invalid friend ID: ${id}`,
          HttpStatus.BAD_REQUEST,
          ERROR_CODE.CLIENT_BAD_REQUEST.errorCode,
        );
      }
      return new Types.ObjectId(id);
    });

    // Cập nhật bạn bè cho user
    const updatedUser = await this.userModel.findByIdAndUpdate(
      user.id,
      {
        $addToSet: { friends: { $each: objectIds } },
      },
      { new: true },
    );

    // Cập nhật userId vào danh sách bạn bè của từng bạn
    await Promise.all(
      objectIds.map((friendId) =>
        this.userModel.findByIdAndUpdate(
          friendId,
          { $addToSet: { friends: new Types.ObjectId(userId) } },
          { new: true },
        ),
      ),
    );

    return updatedUser;
  }

  async getAllUsers(paginationDto: PagingOffsetDto) {
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;

    const listUsers = await this.userModel
      .find()
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);
    const totalRecords = await this.userModel.countDocuments(listUsers);

    const totalPages = Math.ceil(totalRecords / limit);

    return {
      listUsers,
      currentPage: page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }

  async removeFriend(user: User, friendId: string) {
    await this.userModel.updateOne(
      { _id: user },
      { $pull: { friends: new Types.ObjectId(friendId) } },
    );
  }
}
