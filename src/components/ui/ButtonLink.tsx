import { AnchorHTMLAttributes, PropsWithChildren } from 'react';

type Props = PropsWithChildren<
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    variant?: 'primary' | 'secondary';
    size?: 'sm' | 'md';
  }
>;

export function ButtonLink({ children, className = '', variant = 'primary', size = 'md', ...props }: Props) {
  return (
    <a
      {...props}
      className={`button button--${variant} button--${size}${className ? ` ${className}` : ''}`}
    >
      {children}
    </a>
  );
}
