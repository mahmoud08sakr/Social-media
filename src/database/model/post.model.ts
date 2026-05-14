import mongoose from "mongoose";
import { IPost } from "../../common/interfaces";
import { VisabilityEnum } from "../../common/enums";

const postSchema = new mongoose.Schema<IPost>({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" , required : true},
    attachments: [{
        type: String
    }],
    content: {
        type: String,
        required: function (this) {
            return this.attachments?.length == 0
        }
    },
    // likes: [{
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "User"
    // }],
    tags: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],

    deleatedAt: {
        type: Date
    }
    ,
    restoredAt: {
        type: Date
    }

    ,

    visability: {
        type: String,
        enum: Object.values(VisabilityEnum),
        default: VisabilityEnum.Public
    }



}, {
    timestamps: true,
    strictQuery: true
})


postSchema.pre(["find" , "findOne" , "findOneAndUpdate" ],async function () {
    let query = this.getQuery()
    let {admin} =  query

    if(!admin){
        this.setQuery({...query , deleatedAt : { $exists : false}})
    }
})





const postModel = mongoose.model<IPost>("Post", postSchema)
export default postModel