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

        const {email, phone} = user;

        const phoneExist = await this.usersRepository.findOneBy({phone});
        if (phoneExist) {
            throw new HttpException('El telefono ya está registrado', HttpStatus.CONFLICT);
        }

        const emailExist = await this.usersRepository.findOneBy({email});
        if (emailExist) {
            throw new HttpException('El email ya está registrado', HttpStatus.CONFLICT);   //Error 409
        }

        const newUser = this.usersRepository.create(user);

        // Constante para asignar roles
        let rolesIds = [];
        if (user.rolesIds !== undefined && user.rolesIds !== null) {
            rolesIds = user.rolesIds;
        } else {
            rolesIds.push('CLIENT');
        }
        
        const roles = await this.rolesRepository.findBy({id: In(rolesIds) });
        newUser.roles = roles;

        const userSaved = await this.usersRepository.save(newUser);

        const rolesString = userSaved.roles.map(rol => rol.id);

        // Generar Token y Tener la sesion iniciada al realziar el registro
        const payload = { id: userSaved.id, name: userSaved.name, roles: rolesString};
        const token = this.jwtService.sign(payload);
        const data = {
            user: userSaved,
            token: token
        }

        // ocultar o quitar el password de la data que se obtiene
        delete data.user.password

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
        // ["ADMIN", "CLIENT"]
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
