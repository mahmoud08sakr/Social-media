import { CompleteMultipartUploadCommandOutput, DeleteObjectCommand, GetObjectCommand, GetObjectCommandOutput, ObjectCannedACL, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { env } from "../../config/env.service";
import { MulterEnum } from "../enums/multer.enums";
import { createReadStream } from "fs";
import { Upload } from "@aws-sdk/lib-storage";
import it from "zod/v4/locales/it.js";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
export class S3Service {
    private client: S3Client
    constructor() {
        this.client = new S3Client({
            region: env.AWS_REGION,
            credentials: {
                accessKeyId: env.AWS_ACCESS_KEY_ID,
                secretAccessKey: env.AWS_SECRET_ACCESS_KEY
            }
        })
    }
    async uploadAsset({
        storageKey = MulterEnum.diskStorage,
        Bucket = env.AWS_BUCKET_NAME,
        path = "general",
        file,
        ACL = ObjectCannedACL.private,
        contentType
    }: {
        storageKey?: MulterEnum
        Bucket?: string,
        path?: string,
        file: Express.Multer.File,
        ACL?: ObjectCannedACL,
        contentType: string
    }) {
        const key = `socialMedia/${path}/${Math.round(Math.random() * 1e9)}-${file.originalname}`
        const result = await this.client.send(new PutObjectCommand({
            Bucket,
            Key: key,
            ACL,
            Body: storageKey == MulterEnum.memoryStorage ? file.buffer : createReadStream(file.path),
            ContentType: contentType || file.mimetype
        }))
        return key
    }

    async uploadBigAsset({
        storageKey = MulterEnum.diskStorage,
        Bucket = env.AWS_BUCKET_NAME,
        path = "general",
        file,
        ACL = ObjectCannedACL.private,
        contentType,
        partSize = 5
    }: {
        storageKey?: MulterEnum
        Bucket?: string,
        path?: string,
        file: Express.Multer.File,
        ACL?: ObjectCannedACL,
        contentType?: string,
        partSize?: number
    }): Promise<CompleteMultipartUploadCommandOutput> {
        const key = `socialMedia/${path}/${Math.round(Math.random() * 1e9)}-${file.originalname}`
        const result = await new Upload({
            client: this.client,
            params: {
                Bucket,
                Key: key,
                ACL,
                Body: storageKey == MulterEnum.memoryStorage ? file.buffer : createReadStream(file.path),
                ContentType: contentType || file.mimetype
            },
            partSize: partSize * 1024 * 1024
        })
        result.on("httpUploadProgress", (progress) => {
            console.log(progress.loaded);
            console.log(`${(progress.loaded as number) / (progress.total as number) * 100} %`);
        })
        return await result.done()
    }


    async uploadAssets({
        storageKey = MulterEnum.diskStorage,
        Bucket = env.AWS_BUCKET_NAME,
        path = "general",
        files,
        ACL = ObjectCannedACL.private,
        contentType,
        originalname
    }: {
        storageKey?: MulterEnum
        Bucket?: string,
        path?: string,
        files: Express.Multer.File[],
        ACL?: ObjectCannedACL,
        contentType?: string,
        originalname?: string
    }): Promise<{ Key: String, result: String[] }> {
        const Key = `socialMedia/${path}/${Math.round(Math.random() * 1e9)}-${originalname}`
        const result = await Promise.all(files.map(item => {
            {
                return this.uploadAsset({
                    storageKey,
                    Bucket,
                    path,
                    file: item,
                    ACL,
                    contentType: item.mimetype
                })
            }
        })
        )
        return { Key, result }
    }


    async createPreSIgnUrl({
        Bucket = env.AWS_BUCKET_NAME,
        path = "general",
        contentType,
        originalname
    }: {
        Bucket?: string,
        path?: string,
        contentType?: string,
        originalname?: string
    }): Promise<{ key: string, url: string }> {
        const key = `socialMedia/${path}/${Math.round(Math.random() * 1e9)}-${originalname}`
        const result = new PutObjectCommand({
            Bucket,
            Key: key,
            ContentType: contentType
        })

        const url = await getSignedUrl(this.client, result, { expiresIn: 60 * 2 })
        return { url, key }
    }

    async getAsset({
        Bucket = env.AWS_BUCKET_NAME,
        Key,
    }: {
        Bucket?: string,
        Key: string,
    }): Promise<GetObjectCommandOutput> {
        const result = await new GetObjectCommand({
            Bucket,
            Key
        })
        return this.client.send(result)
    }


    async deleteAsset({
        Bucket = env.AWS_BUCKET_NAME,
        Key,
    }: {
        Bucket?: string,
        Key: string,
    }) {
        const result = await new DeleteObjectCommand({
            Bucket,
            Key
        })
        return this.client.send(result)
    }


    async createPresignFetshUrl({
        Bucket = env.AWS_BUCKET_NAME,
        Key,
        fileName,
        download
    }: {
        Bucket?: string,
        fileName?: string
        download?: string
        Key: string,
    }): Promise<string> {


        const result = new GetObjectCommand({
            Bucket,
            Key,
            ResponseContentDisposition: download == "true" ? `attachment; filename="${fileName || Key.split("/").pop()}"` : undefined
        })
        const url = await getSignedUrl(this.client, result, { expiresIn: 60 * 2 })
        return url
    }
}


export const s3Service = new S3Service()