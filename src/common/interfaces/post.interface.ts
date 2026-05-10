import { Types } from "mongoose";
import { IUser } from "./user.interface";
import { VisabilityEnum } from "../enums";


export interface IPost {
   userId : string | IUser,
   content? : string  ,
   attacments? : string[] ,
   tags? : string[] | IUser[] ,
   likes? : string[] | IUser[],
   updateAt : Date,
   createdAt : Date,
   deleatedAt? : Date
   restoredAt? : Date
   visability : VisabilityEnum

}