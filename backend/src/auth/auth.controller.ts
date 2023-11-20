import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  Req,
  Session,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Types } from 'mongoose';
import { LoginRequest } from 'src/types/request/login_request';
import { RegisterRequest } from 'src/types/request/register_request';
import { Request } from 'express';
import { ApiExcludeEndpoint, ApiResponse } from '@nestjs/swagger';
import { MeResponse } from 'src/types/response/me_response';
import { getUrl } from 'src/configuration/oauth';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @ApiResponse({
    type: MeResponse,
    status: 200,
  })
  @ApiResponse({
    status: 401,
    type: Object,
  })
  @Get('me')
  async me(
    @Session()
    {
      _id,
      username,
      email,
      isOauth,
    }: {
      username: string;
      _id: Types.ObjectId;
      email: string;
      isOauth: boolean;
    },
  ) {
    if (_id)
      return {
        email,
        _id,
        username,
        isOauth,
      };
    else throw new UnauthorizedException();
  }

  @Post('signin')
  async login(
    @Body()
    { email, password, rememberLogin }: LoginRequest,
    @Session() session: Record<string, any>,
  ) {
    const { _id, username } = await this.authService.login(email, password);
    session._id = _id;
    session.username = username;
    session.email = email;
    session.isOauth = false;
    if (!rememberLogin) session.cookie.maxAge = 60 * 60 * 1000 * 12;
    return {
      loggedIn: true,
    };
  }

  @Post('signup')
  register(
    @Body()
    { email, password, username }: RegisterRequest,
  ) {
    return this.authService.register(email, password, username);
  }

  @Delete('signout')
  logoff(@Req() request: Request) {
    return new Promise((res, rej) =>
      request.session.destroy((err) => {
        if (err) return rej(err);
        res(undefined);
      }),
    );
  }

  @Get('oauth')
  googleOauthPage() {
    return getUrl();
  }

  @Get('/__/handler')
  @ApiExcludeEndpoint()
  private async googleoauth(
    @Session() session: Record<string, any>,
    @Query() { code }: { code: string },
  ) {
    const { _id, email, username } = await this.authService.oauth(code);
    session._id = _id;
    session.username = username;
    session.email = email;
    session.isOauth = true;
    return {
      loggedIn: true,
    };
  }
}
