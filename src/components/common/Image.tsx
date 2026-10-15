import React from 'react';

export interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
  unoptimized?: boolean;
  quality?: number;
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
    ...rest
  },
  ref
) {
  const computedStyle: React.CSSProperties = fill
    ? {
        position: 'absolute',
        height: '100%',
        width: '100%',
        inset: 0,
        ...style,
      }
    : { ...style };

  return (
    <img
      ref={ref}
      src={src}
      alt={alt}
      sizes={sizes}
      loading={priority ? 'eager' : loading || 'lazy'}
      style={computedStyle}
      className={className}
      {...rest}
    />
  );
});

export default Image;
