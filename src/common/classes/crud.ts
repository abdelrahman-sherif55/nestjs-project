import * as mongoose from 'mongoose';
import { Features } from './features';

export class Crud<ModelType> {
  constructor(
    private readonly model: mongoose.Model<ModelType>,
    private readonly modelName: string,
  ) {}

  public async getAll(query: any, filter?: any) {
    const filterData: any = filter || {};
    let searchLength: number = 0;
    let flagSearch: boolean = false;
    if (query) {
      flagSearch = true;
      const searchResult: Features = new Features(
        this.model.find(filterData),
        query,
      )
        .filter()
        .search(this.modelName);
      const searchData: ModelType[] = await searchResult.mongooseQuery;
      searchLength = searchData.length;
    }
    const documentsCount: number = flagSearch
      ? searchLength
      : await this.model.find(filterData).countDocuments();
    const apiFeatures: Features = new Features(
      this.model.find(filterData),
      query,
    )
      .filter()
      .sort()
      .limitFields()
      .search(this.modelName)
      .pagination(documentsCount);
    const documents: ModelType[] = await apiFeatures.mongooseQuery;
    return {
      length: documents.length,
      pagination: apiFeatures.paginationResult,
      data: documents,
    };
  }

  public async getAllList(query: any, filter?: any) {
    const filterData: any = filter || {};
    const apiFeatures: Features = new Features(
      this.model.find(filterData),
      query,
    )
      .filter()
      .sort()
      .limitFields();
    const documents: ModelType[] = await apiFeatures.mongooseQuery;
    return {
      length: documents.length,
      data: documents,
    };
  }

  public async createOne(data: any): Promise<ModelType> {
    return await this.model.create(data);
  }

  public async getOne(id: any) {
    return this.model.findById(id);
  }

  public async updateOne(id: any, data: any) {
    return this.model.findByIdAndUpdate(id, data, { new: true });
  }

  public async deleteOne(id: any) {
    return this.model.findByIdAndDelete(id);
  }

  public async addImages(id: any, images: string[]) {
    return this.model.findByIdAndUpdate(
      id,
      { $addToSet: { images: { $each: images } } },
      { new: true },
    );
  }

  public async removeImage(id: any, image: string) {
    return this.model.findByIdAndUpdate(
      id,
      { $pull: { images: image } },
      { new: true },
    );
  }
}
