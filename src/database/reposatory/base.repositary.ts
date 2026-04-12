import {
    HydratedDocument,
    Model,
    PopulateOptions,
    QueryFilter,
    UpdateQuery,
    QueryOptions,
} from "mongoose";

export class DatabaseRepository<TRawDocs> {
    constructor(private model: Model<TRawDocs>) {}
    create(data: Partial<TRawDocs>): Promise<HydratedDocument<TRawDocs>> {
        return this.model.create(data);
    }
    createMany(data: Partial<TRawDocs>[]): Promise<HydratedDocument<TRawDocs>[]> {
        return this.model.insertMany(data) as Promise<HydratedDocument<TRawDocs>[]>;
    }
    findOne(
        filter: QueryFilter<TRawDocs> | QueryFilter<TRawDocs>[],
        select?: string | Record<string, 0 | 1>,
        populate?: PopulateOptions | PopulateOptions[]
    ) {
        let query = this.model.findOne(filter);
        if (select) query = query.select(select);
        if (populate) query = query.populate(populate);
        return query;
    }
    find(
        filter: QueryFilter<TRawDocs> = {},
        select?: string | Record<string, 0 | 1>,
        populate?: PopulateOptions | PopulateOptions[],
        options?: QueryOptions
    ) {
        let query = this.model.find(filter, null, options);
        if (select) query = query.select(select);
        if (populate) query = query.populate(populate);
        return query;
    }
    findById(
        id: string,
        select?: string | Record<string, 0 | 1>,
        populate?: PopulateOptions | PopulateOptions[]
    ) {
        let query = this.model.findById(id);
        if (select) query = query.select(select);
        if (populate) query = query.populate(populate);
        return query;
    }

    findOneAndUpdate(
        filter: QueryFilter<TRawDocs>,
        update: UpdateQuery<TRawDocs>,
        options?: QueryOptions,
        select?: string | Record<string, 0 | 1>,
        populate?: PopulateOptions | PopulateOptions[]
    ) {
        let query = this.model.findOneAndUpdate(filter, update, {
            new: true,
            ...options
        });
        if (select) query = query.select(select);
        if (populate) query = query.populate(populate);
        return query;
    }
    deleteMany(filter: QueryFilter<TRawDocs>) {
        return this.model.deleteMany(filter);
    }
    findOneAndDelete(
        filter: QueryFilter<TRawDocs>,
        select?: string | Record<string, 0 | 1>
    ) {
        let query = this.model.findOneAndDelete(filter);
        if (select) query = query.select(select);
        return query;
    }

}