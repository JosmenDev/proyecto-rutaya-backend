import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Rol } from './roles.entity';
import { Repository } from 'typeorm';
import { CreateRolDto } from './dto/create-rol.dto';

@Injectable()
export class RolesService {
    
    constructor(@InjectRepository(Rol) private rolesRepository: Repository<Rol>) {}

    create(rol: CreateRolDto) {
        const newRol = this.rolesRepository.create(rol);
        return this.rolesRepository.save(newRol);
    }

    // Método para obtener todos los roles
    findAll() {
        return this.rolesRepository.find(); // Devuelve todos los registros en la tabla roles
    }
}
