import { Model } from "mongoose";
import { DatabaseInternalError, DatabaseUnknownClientError, DatabaseValidationError, Repository } from "./repository";
import { BaseModel } from "@src/models";
import { FilterOptions, WithId } from ".";
import logger from "@src/logger";
import { CUSTOM_VALIDATION } from "@src/models/user";

export abstract class DefaultMongoDBRepository<
  T extends BaseModel
> extends Repository<T> {
  constructor(private model: Model<T>) {
    super();
  }

  public async create(data: T): Promise<WithId<T>> {
    try {
      const model = new this.model(data);
      const createData = await model.save();
      // return createData.toJSON<WithId<T>>();
      return createData.toJSON() as WithId<T>;
    } catch (error) {
     this.handleError(error); 
    }
  }


  public async find(filter: FilterOptions): Promise<WithId<T>[]> {
    try {
      const data = await this.model.find(filter);
      return data.map((d) => d.toJSON<WithId<T>>());
    } catch (error) {
      this.handleError(error);
    }
  }


  protected handleError(error: unknown): never {
    if (error instanceof Error.ValidationError) {
      const duplicatedKindErrors = Object.values(error.errors).filter(
        (err) =>
          err.name === 'ValidatorError' &&
          err.kind === CUSTOM_VALIDATION.DUPLICATED
      );
      if (duplicatedKindErrors.length) {
        throw new DatabaseValidationError(error.message);
      }
      throw new DatabaseUnknownClientError(error.message);
    }
    logger.warn('Database error', error);
    throw new DatabaseInternalError(
      'Something unexpected happened to the database'
    );
  }
}