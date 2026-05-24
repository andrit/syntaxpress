import { productFragment, cartFragment } from './fragments';
import { imageFragment } from './fragments';

// ──────────────────────────────────────────────
// Product Queries
// ──────────────────────────────────────────────

export const getProductsQuery = /* GraphQL */ `
  query GetProducts($first: Int = 20, $sortKey: ProductSortKeys = BEST_SELLING, $reverse: Boolean = false) {
    products(first: $first, sortKey: $sortKey, reverse: $reverse) {
      edges {
        node {
          ...ProductFields
        }
      }
    }
  }
  ${productFragment}
`;

export const getProductByHandleQuery = /* GraphQL */ `
  query GetProductByHandle($handle: String!) {
    product(handle: $handle) {
      ...ProductFields
    }
  }
  ${productFragment}
`;

export const getProductRecommendationsQuery = /* GraphQL */ `
  query GetProductRecommendations($productId: ID!) {
    productRecommendations(productId: $productId) {
      ...ProductFields
    }
  }
  ${productFragment}
`;

// ──────────────────────────────────────────────
// Collection Queries
// ──────────────────────────────────────────────

export const getCollectionsQuery = /* GraphQL */ `
  query GetCollections($first: Int = 20) {
    collections(first: $first) {
      edges {
        node {
          id
          handle
          title
          description
          image {
            ...ImageFields
          }
          seo {
            title
            description
          }
        }
      }
    }
  }
  ${imageFragment}
`;

export const getCollectionByHandleQuery = /* GraphQL */ `
  query GetCollectionByHandle($handle: String!, $first: Int = 50, $sortKey: ProductCollectionSortKeys = BEST_SELLING, $reverse: Boolean = false) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      image {
        ...ImageFields
      }
      seo {
        title
        description
      }
      products(first: $first, sortKey: $sortKey, reverse: $reverse) {
        edges {
          node {
            ...ProductFields
          }
        }
      }
    }
  }
  ${imageFragment}
  ${productFragment}
`;

// ──────────────────────────────────────────────
// Cart Mutations
// ──────────────────────────────────────────────

export const createCartMutation = /* GraphQL */ `
  mutation CreateCart($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        ...CartFields
      }
      userErrors {
        field
        message
      }
    }
  }
  ${cartFragment}
`;

export const addToCartMutation = /* GraphQL */ `
  mutation AddToCart($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        ...CartFields
      }
      userErrors {
        field
        message
      }
    }
  }
  ${cartFragment}
`;

export const updateCartMutation = /* GraphQL */ `
  mutation UpdateCart($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        ...CartFields
      }
      userErrors {
        field
        message
      }
    }
  }
  ${cartFragment}
`;

export const removeFromCartMutation = /* GraphQL */ `
  mutation RemoveFromCart($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        ...CartFields
      }
      userErrors {
        field
        message
      }
    }
  }
  ${cartFragment}
`;

export const getCartQuery = /* GraphQL */ `
  query GetCart($cartId: ID!) {
    cart(id: $cartId) {
      ...CartFields
    }
  }
  ${cartFragment}
`;
