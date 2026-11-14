import { Request, Response, NextFunction } from 'express';
import { Currency } from '@prisma/client';
import { ProductService } from '../services/product.service';
import { ApiResponse } from '../utils/apiResponse';

export class ProductController {
  static async getProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await ProductService.getProducts(req.query as any);
      ApiResponse.paginated(
        res,
        result.data,
        result.meta,
        'SISODIA ATELIER ✧ catalog pieces retrieved successfully.'
      );
    } catch (error) {
      next(error);
    }
  }

  static async getProductBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const slug = String(req.params.slug);
      const currency = (req.query.currency as Currency) || Currency.USD;
      const product = await ProductService.getProductBySlug(slug, currency);
      ApiResponse.success(res, product, 'Heirloom specification retrieved.');
    } catch (error) {
      next(error);
    }
  }

  static async createProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await ProductService.createProduct(req.body);
      ApiResponse.created(res, product, 'New heirloom masterwork added to catalog.');
    } catch (error) {
      next(error);
    }
  }

  static async toggleStar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const isFeatured =
        typeof req.body?.isFeatured === 'boolean' ? req.body.isFeatured : undefined;
      const updated = await ProductService.toggleFeaturedStar(id, isFeatured);
      ApiResponse.success(
        res,
        updated,
        updated.isFeatured
          ? 'Product starred and featured on homepage carousel.'
          : 'Product removed from homepage featured carousel.'
      );
    } catch (error) {
      next(error);
    }
  }

  static async updateProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const updated = await ProductService.updateProduct(id, req.body);
      ApiResponse.success(res, updated, 'Heirloom masterwork updated successfully.');
    } catch (error) {
      next(error);
    }
  }

  static async deleteProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const result = await ProductService.deleteProduct(id);
      ApiResponse.success(res, result, result.message);
    } catch (error) {
      next(error);
    }
  }

  static async getCategories(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await ProductService.getCategories();
      ApiResponse.success(res, categories, 'Atelier categories retrieved.');
    } catch (error) {
      next(error);
    }
  }

  static async getWoodSpeciesCatalog(
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const catalog = ProductService.getWoodSpeciesCatalog();
      ApiResponse.success(res, catalog, 'CITES verified wood species provenance guide.');
    } catch (error) {
      next(error);
    }
  }
}
