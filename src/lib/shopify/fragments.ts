// ──────────────────────────────────────────────
// Shopify Storefront API — GraphQL Fragments
// ──────────────────────────────────────────────

export const imageFragment = /* GraphQL */ `
  fragment ImageFields on Image {
    url
    altText
    width
    height
  }
`;

export const productVariantFragment = /* GraphQL */ `
  fragment ProductVariantFields on ProductVariant {
    id
    title
    availableForSale
    selectedOptions {
      name
      value
    }
    price {
      amount
      currencyCode
    }
    compareAtPrice {
      amount
      currencyCode
    }
    image {
      ...ImageFields
    }
  }
  ${imageFragment}
`;

export const productFragment = /* GraphQL */ `
  fragment ProductFields on Product {
    id
    handle
    title
    description
    descriptionHtml
    vendor
    productType
    tags
    availableForSale
    featuredImage {
      ...ImageFields
    }
    images(first: 20) {
      edges {
        node {
          ...ImageFields
        }
      }
    }
    options {
      id
      name
      values
    }
    variants(first: 100) {
      edges {
        node {
          ...ProductVariantFields
        }
      }
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
      maxVariantPrice {
        amount
        currencyCode
      }
    }
    seo {
      title
      description
    }
    createdAt
    updatedAt
  }
  ${productVariantFragment}
`;

export const cartFragment = /* GraphQL */ `
  fragment CartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    cost {
      subtotalAmount {
        amount
        currencyCode
      }
      totalAmount {
        amount
        currencyCode
      }
      totalTaxAmount {
        amount
        currencyCode
      }
    }
    lines(first: 100) {
      edges {
        node {
          id
          quantity
          merchandise {
            ... on ProductVariant {
              id
              title
              selectedOptions {
                name
                value
              }
              product {
                id
                handle
                title
                featuredImage {
                  ...ImageFields
                }
              }
              price {
                amount
                currencyCode
              }
            }
          }
          cost {
            totalAmount {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
  ${imageFragment}
`;
