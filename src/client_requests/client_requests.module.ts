import { Module } from '@nestjs/common';
import { ClientRequestsService } from './client_requests.service';
import { ClientRequestsController } from './client_requests.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientRequest } from './client_requests.entity';
import { User } from 'src/users/user.entity';

@Module({
  providers: [ClientRequestsService],
  controllers: [ClientRequestsController],
  imports: [TypeOrmModule.forFeature([ClientRequest, User])]
})
export class ClientRequestsModule {}
