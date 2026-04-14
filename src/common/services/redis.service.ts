import { createClient, RedisArgument, RedisClientType } from "redis";
import { env } from "../../config/env.service";
import { Types } from "mongoose";
import { NotFoundException } from "../exceptions/application.exception";

export class RedisService {
    private client: RedisClientType
    constructor() {
        this.client = createClient({ url: env.REDIS_URI })
        this.handelConnection()
    }
    handelConnection() {
        this.client.on('error', () => {
            return console.log('redis connection error')
        })
        this.client.on("ready", () => {
            console.log('redis is ready');
        })
    }
    connect() {
        this.client.connect()
        console.log("redis connected");
    }

    createRevokeKey = ({ userId, token }: { userId: Types.ObjectId, token: string }): string => {
        return `revokeToken::${userId}::${token}`
    }

    set = async ({ key, value, ttl }: {
        key: string,
        value: any,
        ttl?: number
    }): Promise<string | null> => {
        if (typeof value == "object") {
            value = JSON.stringify(value)
        }
        return ttl ? await this.client.set(key, value, { EX: ttl }) : await this.client.set(key, value)
    }

    get = async (key: string): Promise<string | null> => {
        let data = await this.client.get(key)
        if (!data) {
            throw new NotFoundException('key not found')
        }
        try {
            data = JSON.parse(data)
        } catch (error) { }
        return data
    }

    ttl = async (key: string): Promise<number> => {
        return await this.client.ttl(key)
    }

    exists = async (key: string): Promise<number> => {
        return await this.client.exists(key)
    }

    redis_delete = async (key: string): Promise<number> => {
        return await this.client.del(key)
    }

    mget = async (...keys: string[]): Promise<(string | null)[]> => {
        return await this.client.mGet(keys)
    }

    keys = async (prefix: string): Promise<string[]> => {
        return await this.client.keys(`${prefix}*`)
    }

}

export const redisService = new RedisService()