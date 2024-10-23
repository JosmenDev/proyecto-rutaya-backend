import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from '../users/user.entity';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Rol } from 'src/roles/roles.entity';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User) private usersRepository: Repository<User>,
        @InjectRepository(Rol) private rolesRepository: Repository<Rol>,
        private jwtService: JwtService
    ) {}

    

    async register(user: RegisterUserDto) {
        const { email, phone } = user;
    
        // Verifica si el teléfono o el email ya existen
        const phoneExist = await this.usersRepository.findOneBy({ phone });
        if (phoneExist) {
            throw new HttpException('El teléfono ya está registrado', HttpStatus.CONFLICT);
        }
    
        const emailExist = await this.usersRepository.findOneBy({ email });
        if (emailExist) {
            throw new HttpException('El email ya está registrado', HttpStatus.CONFLICT);
        }
    
        // Crear un nuevo usuario
        const newUser = this.usersRepository.create(user);
    
        // Asignar roles
        let rolesIds = [];
        if (user.rolesIds) {
            rolesIds = user.rolesIds;
        } else {
            rolesIds.push('CLIENT'); // Asignar rol predeterminado si no se proporcionan roles
        }
    
        // Agrega este log para depurar
        console.log('Roles seleccionados para el usuario:', rolesIds);
    
        // Buscar los roles en la base de datos
        const roles = await this.rolesRepository.findBy({ id: In(rolesIds) });
    
        // Verifica si los roles se encuentran correctamente
        if (!roles || roles.length === 0) {
            throw new HttpException('Roles no encontrados', HttpStatus.NOT_FOUND);
        }
    
        newUser.roles = roles;
        const userSaved = await this.usersRepository.save(newUser);
    
        // Mostrar los roles asignados al usuario guardado
        console.log('Roles asignados al usuario guardado:', userSaved.roles);
    
        // Generar el token
        const rolesString = userSaved.roles.map(rol => rol.id);
        const payload = { id: userSaved.id, name: userSaved.name, roles: rolesString };
        const token = this.jwtService.sign(payload);
    
        const data = {
            user: userSaved,
            token: token,
        };
    
        // Ocultar la contraseña en la respuesta
        delete data.user.password;
    
        return data;
    }
    

    async login(loginData: LoginAuthDto) {
        
        const {email, password} = loginData;
        const userFound = await this.usersRepository.findOne({
            where: {email},
            relations: ['roles']
        });

        if (!userFound) {
            throw new HttpException('El email no existe', HttpStatus.NOT_FOUND);   //Error 404
        }

        const isPasswordValid = await compare(password, userFound.password);
        if (!isPasswordValid) {
            // error 403: acceso denegado
            throw new HttpException('La contraseña es incorrecta', HttpStatus.FORBIDDEN);
        }

        // Traer los roles de usuarios
        const rolesIds = userFound.roles.map(rol => rol.id);

        // Generar Token
        const payload = { id: userFound.id, name: userFound.name, roles: rolesIds};
        const token = this.jwtService.sign(payload);
        const data = {
            user: userFound,
            token: token
        }

        // ocultar o quitar el password de la data que se obtiene
        delete data.user.password
        return data;
    }
}
