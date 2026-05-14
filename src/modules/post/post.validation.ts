import {z} from "zod"
 
export let createPostSchema = {
    body : z.strictObject({
        content : z.string().optional(),
        tags : z.array(z.string()).optional(),
        visability : z.string().optional(),
        files : z.array(z.object()).optional()
    }).refine((values)=>{
        if(!values.content?.length && !values.files?.length) return false
        return true
    },{
        error : "content or files must be provided"
    }).optional(),


}