'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Image as ImageType } from '@/types';

export function ProductGallery({ images }: { images: ImageType[] }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedImage = images[selectedIndex];

  if (!images.length) {
    return (
      <div className="aspect-square bg-paper-cream flex items-center justify-center">
        <span className="font-display text-xl text-ink-300 italic">No image</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main image */}
      <div className="relative aspect-square overflow-hidden bg-paper-cream">
        <Image
          src={selectedImage.url}
          alt={selectedImage.altText || ''}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
          priority
        />
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {images.map((image, i) => (
            <button
              key={image.url}
              onClick={() => setSelectedIndex(i)}
              className={`relative aspect-square w-16 shrink-0 overflow-hidden transition-all
                ${i === selectedIndex
                  ? 'ring-2 ring-ink-950 ring-offset-2 ring-offset-paper'
                  : 'opacity-60 hover:opacity-100'
                }`}
            >
              <Image
                src={image.url}
                alt={image.altText || ''}
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
