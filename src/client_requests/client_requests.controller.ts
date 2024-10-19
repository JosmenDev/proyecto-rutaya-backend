import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { ClientRequestsService } from './client_requests.service';
import { CreateClientRequestDto } from './dto/create_client_request.dto';
import { UpdateTripSelectRequestDto } from './dto/update_trip_select_request.dto';
import { UpdateStatusClientRequestDto } from './dto/update_status_client_request.dto';

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

    @Put()
    updateTripSelect(@Body() clientRequest: UpdateTripSelectRequestDto) {
        return this.ClientRequestsService.updateRouteSelect(clientRequest);
    }

    @Get(':id_client_request')
    getByClientRequest(@Param('id_client_request') id_client_request: number) {
        return this.ClientRequestsService.getByClientRequest(id_client_request);
    }

    @Put('update_status')
    updateStatus(@Body() updateStatus: UpdateStatusClientRequestDto) {
        return this.ClientRequestsService.updateStatus(updateStatus);
    }

    @Get('client/:id_client')
    getByClientTripsHistory(@Param('id_client') id_client: number) {
        return this.ClientRequestsService.getByClientTripsHistory(id_client);
    }
}
