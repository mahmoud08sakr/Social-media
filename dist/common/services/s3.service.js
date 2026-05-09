"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.s3Service = exports.S3Service = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const env_service_1 = require("../../config/env.service");
const multer_enums_1 = require("../enums/multer.enums");
const fs_1 = require("fs");
const lib_storage_1 = require("@aws-sdk/lib-storage");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
class S3Service {
    client;
    constructor() {
        this.client = new client_s3_1.S3Client({
            region: env_service_1.env.AWS_REGION,
            credentials: {
                accessKeyId: env_service_1.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: env_service_1.env.AWS_SECRET_ACCESS_KEY
            }
        });
    }
    async uploadAsset({ storageKey = multer_enums_1.MulterEnum.diskStorage, Bucket = env_service_1.env.AWS_BUCKET_NAME, path = "general", file, ACL = client_s3_1.ObjectCannedACL.private, contentType }) {
        const key = `socialMedia/${path}/${Math.round(Math.random() * 1e9)}-${file.originalname}`;
        const result = await this.client.send(new client_s3_1.PutObjectCommand({
            Bucket,
            Key: key,
            ACL,
            Body: storageKey == multer_enums_1.MulterEnum.memoryStorage ? file.buffer : (0, fs_1.createReadStream)(file.path),
            ContentType: contentType || file.mimetype
        }));
        return key;
    }
    async uploadBigAsset({ storageKey = multer_enums_1.MulterEnum.diskStorage, Bucket = env_service_1.env.AWS_BUCKET_NAME, path = "general", file, ACL = client_s3_1.ObjectCannedACL.private, contentType, partSize = 5 }) {
        const key = `socialMedia/${path}/${Math.round(Math.random() * 1e9)}-${file.originalname}`;
        const result = await new lib_storage_1.Upload({
            client: this.client,
            params: {
                Bucket,
                Key: key,
                ACL,
                Body: storageKey == multer_enums_1.MulterEnum.memoryStorage ? file.buffer : (0, fs_1.createReadStream)(file.path),
                ContentType: contentType || file.mimetype
            },
            partSize: partSize * 1024 * 1024
        });
        result.on("httpUploadProgress", (progress) => {
            console.log(progress.loaded);
            console.log(`${progress.loaded / progress.total * 100} %`);
        });
        return await result.done();
    }
    async uploadAssets({ storageKey = multer_enums_1.MulterEnum.diskStorage, Bucket = env_service_1.env.AWS_BUCKET_NAME, path = "general", files, ACL = client_s3_1.ObjectCannedACL.private, contentType, originalname }) {
        const Key = `socialMedia/${path}/${Math.round(Math.random() * 1e9)}-${originalname}`;
        const result = await Promise.all(files.map(item => {
            {
                return this.uploadAsset({
                    storageKey,
                    Bucket,
                    path,
                    file: item,
                    ACL,
                    contentType: item.mimetype
                });
            }
        }));
        return { Key, result };
    }
    async createPreSIgnUrl({ Bucket = env_service_1.env.AWS_BUCKET_NAME, path = "general", contentType, originalname }) {
        const key = `socialMedia/${path}/${Math.round(Math.random() * 1e9)}-${originalname}`;
        const result = new client_s3_1.PutObjectCommand({
            Bucket,
            Key: key,
            ContentType: contentType
        });
        const url = await (0, s3_request_presigner_1.getSignedUrl)(this.client, result, { expiresIn: 60 * 2 });
        return { url, key };
    }
    async getAsset({ Bucket = env_service_1.env.AWS_BUCKET_NAME, Key, }) {
        const result = await new client_s3_1.GetObjectCommand({
            Bucket,
            Key
        });
        return this.client.send(result);
    }
    async deleteAsset({ Bucket = env_service_1.env.AWS_BUCKET_NAME, Key, }) {
        const result = await new client_s3_1.DeleteObjectCommand({
            Bucket,
            Key
        });
        return this.client.send(result);
    }
    async createPresignFetshUrl({ Bucket = env_service_1.env.AWS_BUCKET_NAME, Key, fileName, download }) {
        const result = new client_s3_1.GetObjectCommand({
            Bucket,
            Key,
            ResponseContentDisposition: download == "true" ? `attachment; filename="${fileName || Key.split("/").pop()}"` : undefined
        });
        const url = await (0, s3_request_presigner_1.getSignedUrl)(this.client, result, { expiresIn: 60 * 2 });
        return url;
    }
}
exports.S3Service = S3Service;
exports.s3Service = new S3Service();
