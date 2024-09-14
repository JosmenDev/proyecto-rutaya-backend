export class CreateUserDTO {

    name: string;
    phone: string;
    email: string;
    password: string;
    image?: string;
    notification_token?: string;
}