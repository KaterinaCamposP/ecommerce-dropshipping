import { api } from "@/lib/api";
import Link from "next/link";

interface Product {
  id: string;
  title: string;
  description?: string;
  price: number;
  stock: number;
  imageUrl?: string;
  category?: string;
}

interface ProductsResponse {
  data: Product[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default async function Home() {
  let products: Product[] = [];
  let error: string | null = null;

  try {
    const response = await api.get<ProductsResponse>("/products");
    products = response.data;
  } catch (err) {
    error = err instanceof Error ? err.message : "Error al cargar productos";
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-neutral-900 mb-6">Catálogo</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {products.length === 0 && !error && (
        <p className="text-neutral-600">No hay productos disponibles.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-lg border border-neutral-200 shadow-sm overflow-hidden"
          >
            <div className="aspect-square bg-neutral-100 flex items-center justify-center">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-neutral-400 text-sm">Sin imagen</span>
              )}
            </div>

            <div className="p-4">
              <h2 className="text-lg font-semibold text-neutral-900 mb-1">
                {product.title}
              </h2>
              {product.description && (
                <p className="text-sm text-neutral-600 mb-2 line-clamp-2">
                  {product.description}
                </p>
              )}
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-neutral-900">
                  ${product.price.toLocaleString("es-CL")}
                </span>
                {product.stock > 0 ? (
                  <span className="text-sm text-green-600">
                    Stock: {product.stock}
                  </span>
                ) : (
                  <span className="text-sm text-red-600">Sin stock</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
