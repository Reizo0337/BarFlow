export declare class CreateProductDto {
    name: string;
    category: string;
    price: number;
    stock: number;
    minStock?: number;
    unit?: string;
    image?: string;
}
export declare class UpdateProductDto {
    name?: string;
    category?: string;
    price?: number;
    stock?: number;
    minStock?: number;
    unit?: string;
    image?: string;
}
