export interface Category {
    id?: number;
    name: string;
    slug?: string;
}

export interface Product {
    id: string;
    name: string;
    slug: string;
    price: number;
    sale_price: number | null;
    current_price: number;
    primary_image: string | null;
    category: Category;
    rating?: number;
    stock: number;
    description?: string;
    created_at?: string;
}
