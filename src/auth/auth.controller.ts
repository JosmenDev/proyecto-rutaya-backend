import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { UsersService } from '../users/users.service';
import { LoginAuthDto } from './dto/login-auth.dto';
import { JwtAuthGuard } from './jwt/jwt-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private AuthService: AuthService) {}

    @Post('register') // http://localhost:3000/auth/register
    register(@Body() 
    user: RegisterUserDto){
        return this.AuthService.register(user);
    }

    @Post('login') // http://localhost:3000/auth/login
    login(@Body() 
    loginData: LoginAuthDto){
        return this.AuthService.login(loginData);
    }
}
