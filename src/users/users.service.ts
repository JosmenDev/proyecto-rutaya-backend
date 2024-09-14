import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { CreateUserDTO } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import storage = require('../utils/cloud_storage');
import { Rol } from 'src/roles/roles.entity';

@Injectable()
export class UsersService {

    constructor(
        @InjectRepository(User) private usersRepository: Repository<User>
    ) {};

    create(user: CreateUserDTO) {
        const newUser = this.usersRepository.create(user);
        return this.usersRepository.save(newUser);
    }

    findAll() {
        return this.usersRepository.find( {relations: ['roles']});
    }

    async update(id: number, user: UpdateUserDto) {
        const userFound = await this.usersRepository.findOneBy({id});

        if (!userFound) {
            throw new HttpException('Usuario no existe', HttpStatus.NOT_FOUND);    //Error 404
        }

        const updateUser = Object.assign(userFound, user);
        return this.usersRepository.save(updateUser);
    }

    async updateWithImage(file: Express.Multer.File, id: number, user: UpdateUserDto) {
        // file o archivo y nombre que recibe el archivo
        const url = await storage(file, file.originalname);
        console.log('URL: ' + url);

        if (url === undefined && url === null) {
            throw new HttpException('La imagen no se pudo guardar', HttpStatus.INTERNAL_SERVER_ERROR); // 500
        }
        
        user.image = url;
        const userFound = await this.usersRepository.findOneBy({id});

        if (!userFound) {
            throw new HttpException('Usuario no existe', HttpStatus.NOT_FOUND);    //Error 404
        }

        const updateUser = Object.assign(userFound, user);
        return this.usersRepository.save(updateUser);
    }
}
