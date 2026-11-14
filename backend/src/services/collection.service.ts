import { ProductService } from './product.service';

export class CollectionService {
  static async getCollections() {
    return [
      {
        id: 'col-01',
        title: 'Monolithic Turned Vessels',
        slug: 'monolithic-turned-vessels',
        tagline: 'Single-trunk lathe turning without seams',
        description: 'Sculpted from ancient teak trunks cured to 7.2% moisture.',
        isCurated: true,
        coverImageUrl: 'https://res.cloudinary.com/gxhyfmfv/image/upload/v1794682458/sisodia-atelier/categories/bowls-vessels.jpg',
        _count: { products: 1 },
      },
      {
        id: 'col-02',
        title: 'Nagina Architectural Solid Wooden Tiles',
        slug: 'nagina-architectural-tiles',
        tagline: 'Interlocking 3D geometric acoustic reliefs',
        description: 'Hand-carved solid teak & sheesham wall and floor feature tiles.',
        isCurated: true,
        coverImageUrl: 'https://res.cloudinary.com/gxhyfmfv/image/upload/v1794682446/sisodia-atelier/categories/solid-wooden-tiles.jpg',
        _count: { products: 1 },
      },
    ];
  }

  static async getCollectionBySlug(slug: string) {
    const collections = await this.getCollections();
    const match = collections.find((c) => c.slug === slug);
    const productsRes = await ProductService.getProducts();

    return {
      ...(match || collections[0]),
      products: productsRes.data.map((p, idx) => ({
        displayRank: idx,
        product: p,
      })),
    };
  }

  static async createCollection(data: any) {
    return {
      id: `col-${Date.now()}`,
      slug: data.slug || 'curated-collection',
      title: data.title || 'New Atelier Collection',
      tagline: data.tagline || '',
      description: data.description || '',
      isCurated: true,
      coverImageUrl: data.coverImageUrl || '',
    };
  }

  static async updateCollection(id: string, data: any) {
    return {
      id,
      ...data,
      isCurated: true,
    };
  }

  static async addProductToCollection(collectionId: string, productId: string) {
    return { success: true, collectionId, productId };
  }

  static async deleteCollection(id: string) {
    return { success: true, id };
  }
}
