import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class RegisterUserDto {
    // Significa que cuando mande el nomnbre, nos aseguramos que sea string
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    phone: string;

    @IsNotEmpty()
    @IsString()
    @IsEmail({}, {message: 'El email no es válido'})
    email: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(6, {message: 'La contraseña debe tener mínimo 6 caracteres'})
    password: string;

    // Recibir los roles del usuario
    rolesIds: string[];
}