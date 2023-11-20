import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/configuration/database/models/user.entity';
import { hash, compare } from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async login(email: string, password: string) {
    try {
      const user = await this.userModel.findOne({ email });
      if (!user) throw new UnauthorizedException();
      const result = await compare(password, user.password);

      if (!result) throw new UnauthorizedException();

      return {
        username: user.username,
        _id: user._id,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async register(email: string, password: string, username: string) {
    return this.userModel.create({
      email,
      username,
      password: await hash(password, 10),
    });
  }
}
