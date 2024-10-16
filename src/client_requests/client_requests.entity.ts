import { User } from "src/users/user.entity";
import { Column, Entity, Index, JoinColumn, ManyToOne, Point, PrimaryGeneratedColumn } from "typeorm";

export enum Status {
    CREATED = 'CREATED',
    TRAVELLING = 'TRAVELLING',
    FINISHED = 'FINISHED',
    CANCELLED = 'CANCELLED'
};

@Entity({name: 'client_requests'})
export class ClientRequest {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    id_client: number;

    @Column()
    pickup_description: string;

    @Column()
    destination_description: string;

    @Index({spatial: true})
    @Column({
        type: 'point',
        spatialFeatureType: 'Point',
        srid: 4326,
        nullable: false
    })
    pickup_position: Point;

    @Index({spatial: true})
    @Column({
        type: 'point',
        spatialFeatureType: 'Point',
        srid: 4326,
        nullable: false
    })
    destination_position: Point;

    @Column({
        nullable: true
    })
    agency_long_name: string;

    @Column({
        nullable: true
    })
    pickup_stop_description: string;

    @Column({
        nullable: true
    })
    destination_stop_description: string;

    @Index({spatial: true})
    @Column({
        type: 'point',
        spatialFeatureType: 'Point',
        srid: 4326,
        nullable: false
    })
    pickup_stop_position: Point;

    @Index({spatial: true})
    @Column({
        type: 'point',
        spatialFeatureType: 'Point',
        srid: 4326,
        nullable: false
    })
    destination_stop_position: Point;

    @Column({
        type: 'decimal',
        precision: 18,
        scale: 2,
        nullable: true
    })
    distance_route: number;

    @Column({
        type: 'int',
        nullable: true
    })
    time_route: number;

    @Column({
        type: 'decimal',
        precision: 18,
        scale: 2,
        nullable: true
    })
    tarifa_route: number;

    @Column({
        type: 'enum',
        enum: Status,
        default: Status.CREATED
    })
    status: Status;
    
    @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP'})
    created_at: Date;

    @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP'})
    updated_at: Date;
    
    @ManyToOne(() => User, (user) => user.id)
    @JoinColumn({ name: 'id_client' })
    user: User;
}