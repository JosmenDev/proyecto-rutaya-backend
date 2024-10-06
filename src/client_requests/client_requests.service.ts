import { Client, DistanceMatrixResponseData, TravelMode } from '@googlemaps/google-maps-services-js';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClientRequest } from './client_requests.entity';
import { Repository } from 'typeorm';
import { CreateClientRequestDto } from './dto/create_client_request.dto';

const API_KEY = 'AIzaSyACpdZ7tDxDAyeyW7ocOBD9bwcwJ1AHyJw';
@Injectable()
export class ClientRequestsService extends Client {

    constructor(
        @InjectRepository(ClientRequest) 
        private clientRequestRepository: Repository<ClientRequest>,
    ) {
        super();
    }

    async create(clientRequest: CreateClientRequestDto) {
        try {
            await this.clientRequestRepository.query(`
                INSERT INTO
                    client_requests(
                        id_client,
                        pickup_description,
                        destination_description,
                        pickup_position,
                        destination_position
                    )
                VALUES (
                    ${clientRequest.id_client},
                    '${clientRequest.pickup_description}',
                    '${clientRequest.destination_description}',
                    ST_GeomFromText('POINT(${clientRequest.pickup_lat} ${clientRequest.pickup_lng})', 4326),
                    ST_GeomFromText('POINT(${clientRequest.destination_lat} ${clientRequest.destination_lng})', 4326)
                )
            `);
            return true;
        } catch (error) {
            console.error('Error creando la solicitud de ruta:', error);
            throw new HttpException('Error del servidor', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getTimeAndDistanceClienteRequest(
        origin_lat: number,
        origin_lng: number,
        destination_lat: number,
        destination_lng: number,
    ) {
        const googleResponse = await this.distancematrix({
            params: {
                mode: TravelMode.driving,
                key: API_KEY,
                origins: [
                    {
                        lat: origin_lat,
                        lng: origin_lng
                    }
                ],
                destinations: [
                    {
                        lat: destination_lat,
                        lng: destination_lng
                    }
                ]
            }
        });
        return {
            "destination_addresses" : googleResponse.data.destination_addresses[0],
            "origin_addresses" : googleResponse.data.origin_addresses[0],
            "distance": {
                "text": googleResponse.data.rows[0].elements[0].distance.text,
                "value": (googleResponse.data.rows[0].elements[0].distance.value / 1000)
            },
            "duration": {
                "text": googleResponse.data.rows[0].elements[0].duration.text,
                "value": (googleResponse.data.rows[0].elements[0].duration.value / 60)
            },
        };
    }
}
