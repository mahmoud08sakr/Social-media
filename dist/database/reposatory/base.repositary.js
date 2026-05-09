"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseRepository = void 0;
class DatabaseRepository {
    model;
    constructor(model) {
        this.model = model;
    }
    create(data) {
        return this.model.create(data);
    }
    createMany(data) {
        return this.model.insertMany(data);
    }
    findOne(filter, select, populate) {
        let query = this.model.findOne(filter);
        if (select)
            query = query.select(select);
        if (populate)
            query = query.populate(populate);
        return query;
    }
    find(filter = {}, select, populate, options) {
        let query = this.model.find(filter, null, options);
        if (select)
            query = query.select(select);
        if (populate)
            query = query.populate(populate);
        return query;
    }
    findById(id, select, populate) {
        let query = this.model.findById(id);
        if (select)
            query = query.select(select);
        if (populate)
            query = query.populate(populate);
        return query;
    }
    findOneAndUpdate(filter, update, options, select, populate) {
        let query = this.model.findOneAndUpdate(filter, update, {
            new: true,
            ...options
        });
        if (select)
            query = query.select(select);
        if (populate)
            query = query.populate(populate);
        return query;
    }
    deleteMany(filter) {
        return this.model.deleteMany(filter);
    }
    findOneAndDelete(filter, select) {
        let query = this.model.findOneAndDelete(filter);
        if (select)
            query = query.select(select);
        return query;
    }
}
exports.DatabaseRepository = DatabaseRepository;
