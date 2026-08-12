import { Controller, Post, Body, Res, Get, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import * as express from 'express';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { User } from '../users/user.entity';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  private setCookies(res: express.Response, accessToken: string, refreshToken: string) {
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 mins
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  private clearCookies(res: express.Response) {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
  }

  @Post('register')
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) res: any,
  ) {
    const user = await this.usersService.create(
      registerDto.email,
      registerDto.password,
      registerDto.name,
    );
    const tokens = await this.authService.generateTokens(user);
    this.setCookies(res, tokens.accessToken, tokens.refreshToken);
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return result;
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: any,
  ) {
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    const tokens = await this.authService.generateTokens(user);
    this.setCookies(res, tokens.accessToken, tokens.refreshToken);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return result;
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) res: any) {
    this.clearCookies(res);
    return { success: true };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@GetUser() user: User) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return result;
  }
}
