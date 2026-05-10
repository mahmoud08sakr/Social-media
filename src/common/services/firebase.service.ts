import console from "console";
import admin  from "firebase-admin"
import { readFileSync } from "fs";
import { resolve } from "path";
import userModel from "../../database/model/user.model";
import { Types } from "mongoose";
import { NotFoundException } from "../exceptions/application.exception";


let serviceAccount  = readFileSync(resolve("social-2ad90-firebase-adminsdk-fbsvc-a6622c7105.json"));
let newServiceAccount = JSON.parse(serviceAccount.toString());

admin.initializeApp({
    credential: admin.credential.cert(newServiceAccount),
});    


export let sendNotificationFirebase = async (userId :string , data : {})=>{
    let user = await userModel.findById(new Types.ObjectId(userId))
    if(!user){
        throw new NotFoundException("user not found ")
    }

    

    if(user.tokens && user.tokens.length > 0){
        for(const token of user.tokens){

           try {
             await admin.messaging().send({
                token ,
                data ,
            } )
            console.log("done")
           } catch (error:any) {
            console.log(error.message)
           }

            
         }
    }
}