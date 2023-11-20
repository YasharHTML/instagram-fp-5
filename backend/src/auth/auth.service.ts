import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/configuration/database/models/user.entity';
import { hash, compare } from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as qs from 'node:querystring';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly configService: ConfigService,
  ) {}

  async login(email: string, password: string) {
    try {
      const user = await this.userModel.findOne({ email });
      if (!user) throw new UnauthorizedException();
      if (user.isOauth) throw new BadRequestException('Wrong provider');
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
      isOauth: false,
      picture: '',
    });
  }

  async oauth(code: string) {
    const rootURl = 'https://oauth2.googleapis.com/token';
    const rootURlProfile = 'https://www.googleapis.com/oauth2/v1/userinfo';

    const options = {
      code,
      client_id: this.configService.get<string>('CLIENT_ID'),
      client_secret: this.configService.get<string>('CLIENT_SECRET'),
      redirect_uri: this.configService.get<string>('REDIRECT_URI'),
      grant_type: 'authorization_code',
    };

    try {
      const { data } = await axios.post(rootURl, qs.stringify(options), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const { access_token } = data;
      const { data: data1 } = await axios.get(rootURlProfile, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      const user = await this.userModel.findOne({ email: data1.email });
      if (!user) {
        const user = await this.userModel.create({
          email: data1.email,
          picture: data1.picture,
          password: 'w',
          isOauth: true,
          username: data1.name,
        });

        return {
          username: user.username,
          _id: user._id,
          email: user.email,
        };
      }

      return {
        username: user.username,
        email: user.email,
        _id: user._id,
      };
    } catch (err: any) {
      console.log('Failed to fetch Google Oauth Tokens');
      throw new Error(err);
    }
  }
}
