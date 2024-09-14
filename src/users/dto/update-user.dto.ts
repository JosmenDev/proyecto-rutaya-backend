import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UpdateUserDto {

    @IsOptional() // Permite que el campo sea opcional
    @IsNotEmpty()
    @IsString()
    name?: String;

    @IsOptional() // Permite que el campo sea opcional
    @IsNotEmpty()
    @IsString()
    phone?: String;

    image?: String;
    notification_token?: String;
}