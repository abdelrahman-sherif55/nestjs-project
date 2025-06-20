import * as mongoose from 'mongoose';
import { RequestQuery } from '../interfaces/request-query.interface';
import { SearchQuery } from '../interfaces/search-query.interface';
import { PaginationQuery } from '../interfaces/pagination-query.interface';

export class Features {
  constructor(
    public mongooseQuery: mongoose.Query<any[], any>,
    private readonly reqQuery: RequestQuery,
  ) {}

  public paginationResult: PaginationQuery = {};

  public filter(): this {
    const reqQuery: RequestQuery = { ...this.reqQuery };
    const executedFields: string[] = [
      'page',
      'limit',
      'sort',
      'fields',
      'search',
      'lang',
    ];
    executedFields.forEach((field: string): void => {
      delete reqQuery[field];
    });
    Object.keys(reqQuery).forEach((key: string): void => {
      const value: any = reqQuery[key];
      if (
        value === '' ||
        value === null ||
        value === undefined ||
        (Array.isArray(value) && value.length === 0)
      ) {
        delete reqQuery[key];
      }
    });
    let query: string = JSON.stringify(reqQuery);
    query = query.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match: string): string => `$${match}`,
    );
    this.mongooseQuery = this.mongooseQuery.find(JSON.parse(query));
    return this;
  }

  public sort(): this {
    if (this.reqQuery.sort) {
      const sortBy = this.reqQuery.sort.split(',').join(' ');
      this.mongooseQuery = this.mongooseQuery.sort(sortBy);
    } else {
      this.mongooseQuery = this.mongooseQuery.sort('-createdAt');
    }
    return this;
  }

  public limitFields(): this {
    if (this.reqQuery.fields) {
      const fields: string = this.reqQuery.fields.split(',').join(' ');
      this.mongooseQuery = this.mongooseQuery.select(fields);
    } else {
      this.mongooseQuery = this.mongooseQuery.select('-__v');
    }
    return this;
  }

  public search(modelName: string): this {
    if (this.reqQuery.search) {
      let query: SearchQuery = {};
      if (modelName === '') {
        query.$or = [
          { name: new RegExp(this.reqQuery.search, 'i') },
          { code: new RegExp(this.reqQuery.search, 'i') },
        ];
      } else {
        query = { name: new RegExp(this.reqQuery.search, 'i') };
      }
      this.mongooseQuery = this.mongooseQuery.find(query);
    }
    return this;
  }

  public pagination(documentsCount: number): this {
    const page: number = this.reqQuery.page || 1;
    const limit: number = this.reqQuery.limit || 20;
    const skip: number = (page - 1) * limit;
    const endIndex: number = page * limit;
    const paginationResult: PaginationQuery = {
      currentPage: Number(page),
      limit: Number(limit),
      numberOfPages: Math.ceil(documentsCount / limit),
    };
    if (endIndex < documentsCount) paginationResult.next = Number(page) + 1;
    if (skip > 0) paginationResult.prev = Number(page) - 1;
    this.mongooseQuery = this.mongooseQuery.skip(skip).limit(limit);
    this.paginationResult = paginationResult;
    return this;
  }
}
