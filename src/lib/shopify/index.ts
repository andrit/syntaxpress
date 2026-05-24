import {
  Cart,
  CartItem,
  Collection,
  Product,
  ShopifyCart,
  ShopifyCollection,
  ShopifyConnection,
  ShopifyProduct,
} from '@/types';
import {
  getProductsQuery,
  getProductByHandleQuery,
  getProductRecommendationsQuery,
  getCollectionsQuery,
  getCollectionByHandleQuery,
  createCartMutation,
  addToCartMutation,
  updateCartMutation,
  removeFromCartMutation,
  getCartQuery,
} from './queries';

// ──────────────────────────────────────────────
// Client Configuration
// ──────────────────────────────────────────────

const domain = process.env.SHOPIFY_STORE_DOMAIN ?? '';
const storefrontAccessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN ?? '';
const apiVersion = '2024-04';
const endpoint = `https://${domain}/api/${apiVersion}/graphql.json`;

/** Returns true if Shopify credentials are present */
export function isShopifyConfigured(): boolean {
  return Boolean(domain && storefrontAccessToken);
}

type ShopifyResponse<T> = {
  data: T;
  errors?: { message: string; locations: { line: number; column: number }[] }[];
};

async function shopifyFetch<T>({
  query,
  variables = {},
  cache = 'force-cache',
  tags,
}: {
  query: string;
  variables?: Record<string, unknown>;
  cache?: RequestCache;
  tags?: string[];
}): Promise<T> {
  if (!isShopifyConfigured()) {
    throw new Error(
      'Shopify not configured — set SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_ACCESS_TOKEN in .env.local'
    );
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': storefrontAccessToken,
    },
    body: JSON.stringify({ query, variables }),
    cache,
    ...(tags && { next: { tags } }),
  });

  const body: ShopifyResponse<T> = await response.json();

  if (body.errors) {
    throw new Error(
      `Shopify API error: ${body.errors.map((e) => e.message).join(', ')}`
    );
  }

  return body.data;
}

// ──────────────────────────────────────────────
// Data Reshaping — flatten Shopify connections
// ──────────────────────────────────────────────

function flattenConnection<T>(connection: ShopifyConnection<T>): T[] {
  return connection.edges.map((edge) => edge.node);
}

function reshapeProduct(shopifyProduct: ShopifyProduct): Product {
  return {
    ...shopifyProduct,
    images: flattenConnection(shopifyProduct.images),
    variants: flattenConnection(shopifyProduct.variants),
  };
}

function reshapeCollection(shopifyCollection: ShopifyCollection): Collection {
  return {
    ...shopifyCollection,
    products: flattenConnection(shopifyCollection.products).map(reshapeProduct),
  };
}

function reshapeCart(shopifyCart: ShopifyCart): Cart {
  return {
    ...shopifyCart,
    lines: flattenConnection(shopifyCart.lines),
  };
}

// ──────────────────────────────────────────────
// Product API
// ──────────────────────────────────────────────

export async function getProducts(options?: {
  first?: number;
  sortKey?: string;
  reverse?: boolean;
}): Promise<Product[]> {
  try {
    const data = await shopifyFetch<{
      products: ShopifyConnection<ShopifyProduct>;
    }>({
      query: getProductsQuery,
      variables: {
        first: options?.first ?? 20,
        sortKey: options?.sortKey ?? 'BEST_SELLING',
        reverse: options?.reverse ?? false,
      },
      tags: ['products'],
    });

    return flattenConnection(data.products).map(reshapeProduct);
  } catch (error) {
    console.warn('[Shopify] getProducts failed:', (error as Error).message);
    return [];
  }
}

export async function getProductByHandle(
  handle: string
): Promise<Product | null> {
  try {
    const data = await shopifyFetch<{ product: ShopifyProduct | null }>({
      query: getProductByHandleQuery,
      variables: { handle },
      tags: ['products', `product-${handle}`],
    });

    return data.product ? reshapeProduct(data.product) : null;
  } catch (error) {
    console.warn('[Shopify] getProductByHandle failed:', (error as Error).message);
    return null;
  }
}

export async function getProductRecommendations(
  productId: string
): Promise<Product[]> {
  try {
    const data = await shopifyFetch<{
      productRecommendations: ShopifyProduct[];
    }>({
      query: getProductRecommendationsQuery,
      variables: { productId },
      tags: ['products'],
    });

    return data.productRecommendations.map(reshapeProduct);
  } catch (error) {
    console.warn('[Shopify] getProductRecommendations failed:', (error as Error).message);
    return [];
  }
}

// ──────────────────────────────────────────────
// Collection API
// ──────────────────────────────────────────────

export async function getCollections(): Promise<Omit<Collection, 'products'>[]> {
  try {
    const data = await shopifyFetch<{
      collections: ShopifyConnection<ShopifyCollection>;
    }>({
      query: getCollectionsQuery,
      tags: ['collections'],
    });

    return flattenConnection(data.collections);
  } catch (error) {
    console.warn('[Shopify] getCollections failed:', (error as Error).message);
    return [];
  }
}

export async function getCollectionByHandle(
  handle: string,
  options?: { sortKey?: string; reverse?: boolean }
): Promise<Collection | null> {
  try {
    const data = await shopifyFetch<{ collection: ShopifyCollection | null }>({
      query: getCollectionByHandleQuery,
      variables: {
        handle,
        sortKey: options?.sortKey ?? 'BEST_SELLING',
        reverse: options?.reverse ?? false,
      },
      tags: ['collections', `collection-${handle}`],
    });

    return data.collection ? reshapeCollection(data.collection) : null;
  } catch (error) {
    console.warn('[Shopify] getCollectionByHandle failed:', (error as Error).message);
    return null;
  }
}

// ──────────────────────────────────────────────
// Cart API
// ──────────────────────────────────────────────

export async function createCart(): Promise<Cart> {
  const data = await shopifyFetch<{
    cartCreate: { cart: ShopifyCart };
  }>({
    query: createCartMutation,
    variables: { input: {} },
    cache: 'no-store',
  });

  return reshapeCart(data.cartCreate.cart);
}

export async function addToCart(
  cartId: string,
  lines: { merchandiseId: string; quantity: number }[]
): Promise<Cart> {
  const data = await shopifyFetch<{
    cartLinesAdd: { cart: ShopifyCart };
  }>({
    query: addToCartMutation,
    variables: { cartId, lines },
    cache: 'no-store',
  });

  return reshapeCart(data.cartLinesAdd.cart);
}

export async function updateCart(
  cartId: string,
  lines: { id: string; merchandiseId: string; quantity: number }[]
): Promise<Cart> {
  const data = await shopifyFetch<{
    cartLinesUpdate: { cart: ShopifyCart };
  }>({
    query: updateCartMutation,
    variables: { cartId, lines },
    cache: 'no-store',
  });

  return reshapeCart(data.cartLinesUpdate.cart);
}

export async function removeFromCart(
  cartId: string,
  lineIds: string[]
): Promise<Cart> {
  const data = await shopifyFetch<{
    cartLinesRemove: { cart: ShopifyCart };
  }>({
    query: removeFromCartMutation,
    variables: { cartId, lineIds },
    cache: 'no-store',
  });

  return reshapeCart(data.cartLinesRemove.cart);
}

export async function getCart(cartId: string): Promise<Cart | null> {
  const data = await shopifyFetch<{ cart: ShopifyCart | null }>({
    query: getCartQuery,
    variables: { cartId },
    cache: 'no-store',
  });

  return data.cart ? reshapeCart(data.cart) : null;
}
