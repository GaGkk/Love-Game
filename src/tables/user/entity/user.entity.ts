import { Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("User")
export class User{
    @PrimaryGeneratedColumn()
    id:number
}