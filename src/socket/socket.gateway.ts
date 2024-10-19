import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
@WebSocketGateway({
    cors: {
        origin: '*'
    },
    transports: ['websocket']
})

export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {

    @WebSocketServer() server: Server;

    handleDisconnect(client: Socket) {
        console.log('Un usuario se ha desconectado de SOCKET.IO', client.id);
        this.server.emit('driver_disconnected', { id_socket: client.id });
    }
    
    handleConnection(client: Socket, ...args: any[]) {
        console.log('Un usuario se ha conectado a SOCKET.IO', client.id);
    }

    @SubscribeMessage('trip_change_position')
    handleTripChangePosition(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
        this.server.emit(`trip_new_position/${data.id_client}`, {id_socket: client.id, lat: data.lat, lng: data.lng});
    }

    @SubscribeMessage('update_status_trip')
    handleUpdateStatusTrip(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
        this.server.emit(`new_status_trip/${data.id_client_request}`, {id_socket: client.id, status: data.status, id_client_request: data.id_client_request});
    }
}