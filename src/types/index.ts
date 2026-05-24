// ──────────────────────────────────────────────
// Shopify Storefront API Types
// ──────────────────────────────────────────────

export type Money = {
  amount: string;
  currencyCode: string;
};

export type Image = {
  url: string;
  altText: string | null;
  width: number;
  height: number;
};

export type ProductVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  selectedOptions: { name: string; value: string }[];
  price: Money;
  compareAtPrice: Money | null;
  image?: Image;
};

export type Product = {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  vendor: string;
  productType: string;
  tags: string[];
  availableForSale: boolean;
  featuredImage: Image;
  images: Image[];
  options: { id: string; name: string; values: string[] }[];
  variants: ProductVariant[];
  priceRange: {
    minVariantPrice: Money;
    maxVariantPrice: Money;
  };
  seo: {
    title: string | null;
    description: string | null;
  };
  createdAt: string;
  updatedAt: string;
};

export type Collection = {
  id: string;
  handle: string;
  title: string;
  description: string;
  image?: Image;
  seo: {
    title: string | null;
    description: string | null;
  };
  products: Product[];
};

export type CartItem = {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    selectedOptions: { name: string; value: string }[];
    product: {
      id: string;
      handle: string;
      title: string;
      featuredImage: Image;
    };
    price: Money;
  };
  cost: {
    totalAmount: Money;
  };
};

export type Cart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: {
    subtotalAmount: Money;
    totalAmount: Money;
    totalTaxAmount: Money | null;
  };
  lines: CartItem[];
};

// ──────────────────────────────────────────────
// Shopify GraphQL Response Shapes
// ──────────────────────────────────────────────

export type ShopifyConnection<T> = {
  edges: { node: T; cursor: string }[];
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

export type ShopifyProduct = {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  vendor: string;
  productType: string;
  tags: string[];
  availableForSale: boolean;
  featuredImage: Image;
  images: ShopifyConnection<Image>;
  options: { id: string; name: string; values: string[] }[];
  variants: ShopifyConnection<ProductVariant>;
  priceRange: {
    minVariantPrice: Money;
    maxVariantPrice: Money;
  };
  seo: {
    title: string | null;
    description: string | null;
  };
  createdAt: string;
  updatedAt: string;
};

export type ShopifyCollection = {
  id: string;
  handle: string;
  title: string;
  description: string;
  image?: Image;
  seo: {
    title: string | null;
    description: string | null;
  };
  products: ShopifyConnection<ShopifyProduct>;
};

export type ShopifyCart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: {
    subtotalAmount: Money;
    totalAmount: Money;
    totalTaxAmount: Money | null;
  };
  lines: ShopifyConnection<{
    id: string;
    quantity: number;
    merchandise: {
      id: string;
      title: string;
      selectedOptions: { name: string; value: string }[];
      product: {
        id: string;
        handle: string;
        title: string;
        featuredImage: Image;
      };
      price: Money;
    };
    cost: {
      totalAmount: Money;
    };
  }>;
};

// ──────────────────────────────────────────────
// Page / SEO types
// ──────────────────────────────────────────────

export type SEO = {
  title: string;
  description: string;
};

export type MenuItem = {
  title: string;
  path: string;
};
