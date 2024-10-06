import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { RolesModule } from './roles/roles.module';
import { ClientRequestsModule } from './client_requests/client_requests.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',  
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '',
      database: 'db_ruta_transporte',
      entities: [__dirname + '*/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    
    UsersModule,
    AuthModule,
    RolesModule,
    ClientRequestsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
