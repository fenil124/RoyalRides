import React from 'react';
import { Link as RouterLink, LinkProps as RouterLinkProps } from 'react-router-dom';

export interface NextLinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  href?: string;
  to?: string;
  children?: React.ReactNode;
}

export const Link = React.forwardRef<HTMLAnchorElement, NextLinkProps>(function Link(
  { href, to, children, className, onClick, target, rel, ...rest },
  ref
) {
  const targetUrl = href || to || '';

  // If external link, anchor link on same page, or mailto/tel, use standard <a> tag
  if (
    targetUrl.startsWith('#') ||
    targetUrl.startsWith('http://') ||
    targetUrl.startsWith('https://') ||
    targetUrl.startsWith('mailto:') ||
    targetUrl.startsWith('tel:') ||
    target === '_blank'
  ) {
    return (
      <a
        ref={ref}
        href={targetUrl}
        className={className}
        onClick={onClick}
        target={target}
        rel={target === '_blank' ? (rel || 'noopener noreferrer') : rel}
        {...rest}
      >
        {children}
      </a>
    );
  }

  return (
    <RouterLink
      ref={ref}
      to={targetUrl}
      className={className}
      onClick={onClick}
      target={target}
      rel={rel}
      {...(rest as any)}
    >
      {children}
    </RouterLink>
  );
});

export default Link;
