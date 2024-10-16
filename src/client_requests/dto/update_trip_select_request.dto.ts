export class UpdateTripSelectRequestDto {
    id: number;
    agency_long_name: string;
    pickup_stop_description: string;
    destination_stop_description: string;
    pickup_stop_lat: number;
    pickup_stop_lng: number;
    destination_stop_lat: number;
    destination_stop_lng: number;
    distance_route: number;
    time_route: number;
    tarifa_route: number;
}