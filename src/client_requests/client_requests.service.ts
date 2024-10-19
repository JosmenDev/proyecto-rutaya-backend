import { Client, DistanceMatrixResponseData, TravelMode } from '@googlemaps/google-maps-services-js';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClientRequest, Status } from './client_requests.entity';
import { Repository } from 'typeorm';
import { CreateClientRequestDto } from './dto/create_client_request.dto';
import { ConfigService } from '@nestjs/config'; // Importa ConfigService
import { UpdateTripSelectRequestDto } from './dto/update_trip_select_request.dto';
import { UpdateStatusClientRequestDto } from './dto/update_status_client_request.dto';

@Injectable()
export class ClientRequestsService extends Client {
    private apiKey: string;

    constructor(
        @InjectRepository(ClientRequest) 
        private clientRequestRepository: Repository<ClientRequest>,
        private configService: ConfigService, // Inyecta ConfigService
    ) {
        super();
        this.apiKey = this.configService.get<string>('GOOGLE_API_KEY'); // Obtiene la clave de API del .env
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
                        destination_position,
                        pickup_stop_position,
                        destination_stop_position
                    )
                VALUES (
                    ${clientRequest.id_client},
                    '${clientRequest.pickup_description}',
                    '${clientRequest.destination_description}',
                    ST_GeomFromText('POINT(${clientRequest.pickup_lat} ${clientRequest.pickup_lng})', 4326),
                    ST_GeomFromText('POINT(${clientRequest.destination_lat} ${clientRequest.destination_lng})', 4326),
                    ST_GeomFromText('POINT(${clientRequest.pickup_lat} ${clientRequest.pickup_lng})', 4326),
                    ST_GeomFromText('POINT(${clientRequest.destination_lat} ${clientRequest.destination_lng})', 4326)
                )
            `);
            const data = await this.clientRequestRepository.query(`SELECT MAX(id) AS id from client_requests`);
            console.log('ID CLIENT REQUEST: ', data[0].id);
            return Number(data[0].id);
        } catch (error) {
            console.error('Error creando la solicitud de ruta:', error);
            throw new HttpException('Error del servidor', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async updateRouteSelect(clientRequest: UpdateTripSelectRequestDto) {
        try {
            await this.clientRequestRepository.query(`
                UPDATE
                    client_requests
                SET
                    agency_long_name = '${clientRequest.agency_long_name}',
                    pickup_stop_description = '${clientRequest.pickup_stop_description}',
                    destination_stop_description = '${clientRequest.destination_stop_description}',
                    pickup_stop_position = ST_GeomFromText('POINT(${clientRequest.pickup_stop_lat} ${clientRequest.pickup_stop_lng})', 4326),
                    destination_stop_position = ST_GeomFromText('POINT(${clientRequest.destination_stop_lat} ${clientRequest.destination_stop_lng})', 4326),
                    distance_route = '${clientRequest.distance_route}',
                    time_route = '${clientRequest.time_route}',
                    tarifa_route = '${clientRequest.tarifa_route}',
                    status = '${Status.TRAVELLING}',
                    updated_at = NOW()
                WHERE
                    id = ${clientRequest.id}
            `);
            return true;
        } catch (error) {
            console.error('Error creando la solicitud de ruta:', error);
            throw new HttpException('Error del servidor', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async updateStatus(updateStatusDto: UpdateStatusClientRequestDto) {
        try {
            await this.clientRequestRepository.query(`
                UPDATE
                    client_requests
                SET
                    status = '${updateStatusDto.status}',
                    updated_at = NOW()
                WHERE
                    id = ${updateStatusDto.id_client_request}
            `);
            return true;
        } catch (error) {
            console.error('Error actaizando estado:', error);
            throw new HttpException('Error del servidor', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getByClientRequest(id_client_request: number){ 
        const data = await this.clientRequestRepository.query(`
            SELECT
                CR.id,
                CR.id_client,
                CR.pickup_description,
                CR.destination_description,
                CR.agency_long_name,
                CR.status,
                CR.distance_route,
                CR.tarifa_route,
                CR.pickup_position,
                CR.destination_position,
                CR.pickup_stop_position,
                CR.destination_stop_position,
                JSON_OBJECT(
                    "name", U.name,
                    "phone", U.phone,
                    "image", U.image
                ) AS client,
                -- Calcula la diferencia de tiempo en formato mm:ss
                DATE_FORMAT(SEC_TO_TIME(TIMESTAMPDIFF(SECOND, CR.created_at, CR.updated_at)), '%i:%s') AS duration
            FROM
                client_requests AS CR
            INNER JOIN
                users AS U
            ON
                U.id = CR.id_client
            WHERE
                CR.id = ${id_client_request} AND CR.status = '${Status.TRAVELLING}'
        `);
        
        return {
            ...data[0],
            'pickup_lat': data[0].pickup_position.y,
            'pickup_lng': data[0].pickup_position.x,
            'destination_lat': data[0].destination_position.y,
            'destination_lng': data[0].destination_position.x,
            'pickup_stop_lat': data[0].pickup_stop_position.y,
            'pickup_stop_lng': data[0].pickup_stop_position.x,
            'destination_stop_lat': data[0].destination_stop_position.y,
            'destination_stop_lng': data[0].destination_stop_position.x,
            'duration': data[0].duration // Agrega la duración en formato mm:ss
        };
    }

    async getByClientTripsHistory(id_client: number){ 
        const data = await this.clientRequestRepository.query(`
            SELECT
                CR.id,
                CR.id_client,
                CR.pickup_description,
                CR.destination_description,
                CR.agency_long_name,
                CR.status,
                CR.distance_route,
                CR.tarifa_route,
                CR.pickup_position,
                CR.destination_position,
                CR.pickup_stop_position,
                CR.destination_stop_position,
                JSON_OBJECT(
                    "name", U.name,
                    "phone", U.phone,
                    "image", U.image
                ) AS client,
                -- Calcula la diferencia de tiempo en formato mm:ss
                DATE_FORMAT(SEC_TO_TIME(TIMESTAMPDIFF(SECOND, CR.created_at, CR.updated_at)), '%i:%s') AS duration
            FROM
                client_requests AS CR
            INNER JOIN
                users AS U
            ON
                U.id = CR.id_client
            WHERE
                CR.id_client = ${id_client} AND CR.status = '${Status.FINISHED}'
        `);
        
        return data;
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
                key: this.apiKey, // Usa la clave de API obtenida de las variables de entorno
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
            "destination_addresses": googleResponse.data.destination_addresses[0],
            "origin_addresses": googleResponse.data.origin_addresses[0],
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
