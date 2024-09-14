import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { JwtStrategy } from 'src/auth/jwt/jwt.strategy';
import { Rol } from 'src/roles/roles.entity';

@Module({
    imports: [TypeOrmModule.forFeature([User, Rol])],
    providers: [UsersService, JwtStrategy],
    controllers: [UsersController]
})
export class UsersModule {}
