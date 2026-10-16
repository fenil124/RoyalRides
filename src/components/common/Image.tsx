'use client';

import React, { useState } from 'react';
import { migrateLegacyImagePath, DEFAULT_AIRPORT_TRANSFER } from '@/lib/constants/default-images';

export interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
  unoptimized?: boolean;
  quality?: number;
  fallbackSrc?: string;
}

export const Image = React.forwardRef<HTMLImageElement, ImageProps>(function Image(
  {
    src,
    alt,
    fill,
    priority,
    sizes,
    unoptimized,
    quality,
    className,
    style,
    loading,
    fallbackSrc,
    onError,
    ...rest
  },
  ref
) {
  // Automatically migrate any legacy local image path to persistent remote URL
  const resolvedSrc = migrateLegacyImagePath(src);
  const [imgSrc, setImgSrc] = useState(resolvedSrc);
  const [hasError, setHasError] = useState(false);

  // Sync if prop changes
  React.useEffect(() => {
    setImgSrc(migrateLegacyImagePath(src));
    setHasError(false);
  }, [src]);

  const computedStyle: React.CSSProperties = fill
    ? {
        position: 'absolute',
        height: '100%',
        width: '100%',
        inset: 0,
        ...style,
      }
    : { ...style };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (!hasError) {
      setHasError(true);
      console.warn(`[Image component] Image failed to load: "${src}". Displaying fallback without modifying stored reference.`);
      setImgSrc(fallbackSrc || DEFAULT_AIRPORT_TRANSFER);
    }
    if (onError) onError(e);
  };

  return (
    <img
      ref={ref}
      src={imgSrc}
      alt={alt}
      sizes={sizes}
      loading={priority ? 'eager' : loading || 'lazy'}
      style={computedStyle}
      className={className}
      onError={handleError}
      {...rest}
    />
  );
});

export default Image;
