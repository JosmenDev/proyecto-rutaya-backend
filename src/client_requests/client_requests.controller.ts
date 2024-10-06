import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ClientRequestsService } from './client_requests.service';
import { CreateClientRequestDto } from './dto/create_client_request.dto';

@Controller('client-requests')
export class ClientRequestsController {

    constructor(private ClientRequestsService: ClientRequestsService) {}

    @Get(':origin_lat/:origin_lng/:destination_lat/:destination_lng')
    getTimeAndDistanceClientRequest(
        @Param('origin_lat') origin_lat: number,
        @Param('origin_lng') origin_lng: number,
        @Param('destination_lat') destination_lat: number,
        @Param('destination_lng') destination_lng: number,
    ) {
        return this.ClientRequestsService.getTimeAndDistanceClienteRequest(
            origin_lat,
            origin_lng,
            destination_lat,
            destination_lng,
        )
    }

    @Post()
    create(@Body() clientRequest: CreateClientRequestDto) {
        return this.ClientRequestsService.create(clientRequest);
    }
}
