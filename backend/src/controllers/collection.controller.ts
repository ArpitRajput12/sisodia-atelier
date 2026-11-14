import { Request, Response, NextFunction } from 'express';
import { CollectionService } from '../services/collection.service';
import { ApiResponse } from '../utils/apiResponse';

export class CollectionController {
  static async getCollections(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const collections = await CollectionService.getCollections();
      ApiResponse.success(res, collections, 'Curated collections retrieved.');
    } catch (error) {
      next(error);
    }
  }

  static async getCollectionBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { slug } = req.params;
      const collection = await CollectionService.getCollectionBySlug(slug);
      ApiResponse.success(res, collection, 'Collection details retrieved.');
    } catch (error) {
      next(error);
    }
  }

  static async createCollection(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const collection = await CollectionService.createCollection(req.body);
      ApiResponse.created(res, collection, 'Collection created successfully.');
    } catch (error) {
      next(error);
    }
  }

  static async updateCollection(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const updated = await CollectionService.updateCollection(id, req.body);
      ApiResponse.success(res, updated, 'Collection updated successfully.');
    } catch (error) {
      next(error);
    }
  }
}

