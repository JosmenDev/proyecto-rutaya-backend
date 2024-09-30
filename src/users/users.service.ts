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
        try {
            // Intenta guardar el archivo y obtener la URL
            const url = await storage(file, file.originalname);
            console.log('URL: ' + url);
    
            // Verifica si la URL es válida
            if (!url) {
                throw new HttpException('La imagen no se pudo guardar', HttpStatus.INTERNAL_SERVER_ERROR); // 500
            }
    
            user.image = url; // Asigna la URL de la imagen al objeto user
    
            // Busca el usuario en la base de datos
            const userFound = await this.usersRepository.findOneBy({ id });
            if (!userFound) {
                throw new HttpException('Usuario no existe', HttpStatus.NOT_FOUND); // Error 404
            }
    
            // Actualiza el usuario
            const updateUser = Object.assign(userFound, user);
            const savedUser = await this.usersRepository.save(updateUser); // Guarda el usuario actualizado
    
            // Retorna una respuesta JSON
            return {
                message: 'Usuario actualizado con éxito',
                data: savedUser // Incluye el usuario actualizado
            };
        } catch (error) {
            console.error('Error al actualizar el usuario:', error);
            throw new HttpException('Error al actualizar el usuario', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
}
