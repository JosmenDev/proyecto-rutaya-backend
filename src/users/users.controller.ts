import { Body, Controller, FileTypeValidator, Get, MaxFileSizeValidator, Param, ParseFilePipe, ParseIntPipe, Post, Put, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { CreateUserDTO } from './dto/create-user.dto';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtRolesGuard } from 'src/auth/jwt/jwt-roles.guard';
import { HasRoles } from 'src/auth/jwt/has-roles';
import { JwtRole } from 'src/auth/jwt/jwt-role';

@Controller('users')
export class UsersController {

    constructor( private UsersService: UsersService) {}
    // GET(, POST, PUT, DELETE

    @HasRoles(JwtRole.ADMIN)
    @UseGuards(JwtAuthGuard, JwtRolesGuard)
    @Post() // http://localhost/users -> POST
    create(@Body() 
    user:CreateUserDTO) {
        return this.UsersService.create(user);
    }

    // Proteger la ruta, validar que sea visible para usuarios en sesion
    @HasRoles(JwtRole.ADMIN)
    @UseGuards(JwtAuthGuard, JwtRolesGuard)
    // @UseGuards(JwtAuthGuard)
    @Get() // http://localhost/users -> GET
    findAll() {
        return this.UsersService.findAll();
    }

    @HasRoles(JwtRole.CLIENT)
    @UseGuards(JwtAuthGuard, JwtRolesGuard)
    @Put(':id') // http://localhost/users/:id -> PUT
    update(@Param('id', ParseIntPipe) id: number, @Body() user: UpdateUserDto) {
        return this.UsersService.update(id, user);
    }

    // Agregar imagen
    @HasRoles(JwtRole.CLIENT)
    @UseGuards(JwtAuthGuard, JwtRolesGuard)
    @Post('updateWithImage/:id')
    @UseInterceptors(FileInterceptor('file'))
    updateWidthImage(@UploadedFile(
        new ParseFilePipe({
            validators: [
                new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 10 }),
                new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
            ],
        }),
    ) 
    file: Express.Multer.File,
    @Param('id', ParseIntPipe) id: number, @Body() user: UpdateUserDto) {
        console.log(file);
        this.UsersService.updateWithImage(file, id, user);
    }

}
