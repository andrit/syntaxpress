'use server';

import { cookies } from 'next/headers';
import { addToCart, createCart, getCart, removeFromCart, updateCart } from '@/lib/shopify';
import { revalidateTag } from 'next/cache';

const CART_COOKIE = 'syntaxpress-cart-id';

export async function getCartFromCookies() {
  const cookieStore = cookies();
  const cartId = cookieStore.get(CART_COOKIE)?.value;

  if (!cartId) return null;

  try {
    return await getCart(cartId);
  } catch {
    // Cart expired or invalid — clear the cookie
    return null;
  }
}

export async function addItem(variantId: string) {
  const cookieStore = cookies();
  let cartId = cookieStore.get(CART_COOKIE)?.value;

  if (!cartId) {
    const cart = await createCart();
    cartId = cart.id;
    cookieStore.set(CART_COOKIE, cartId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 14, // 14 days
      path: '/',
    });
  }

  await addToCart(cartId, [{ merchandiseId: variantId, quantity: 1 }]);
  revalidateTag('cart');
}

export async function updateItemQuantity(lineId: string, variantId: string, quantity: number) {
  const cookieStore = cookies();
  const cartId = cookieStore.get(CART_COOKIE)?.value;

  if (!cartId) return;

  if (quantity === 0) {
    await removeFromCart(cartId, [lineId]);
  } else {
    await updateCart(cartId, [{ id: lineId, merchandiseId: variantId, quantity }]);
  }

  revalidateTag('cart');
}

export async function removeItem(lineId: string) {
  const cookieStore = cookies();
  const cartId = cookieStore.get(CART_COOKIE)?.value;

  if (!cartId) return;

  await removeFromCart(cartId, [lineId]);
  revalidateTag('cart');
}
