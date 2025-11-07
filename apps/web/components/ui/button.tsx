import React from 'react';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

export function Button({ variant = 'default', size = 'md', className = '', children, ...rest }: ButtonProps) {
  const base = 'inline-flex items-center justify-center rounded-md transition-all';
  const sizeCls =
    size === 'sm' ? 'px-3 py-1.5 text-sm h-8' : size === 'lg' ? 'px-4 py-2 text-base h-10' : 'px-3 py-2 text-sm h-9';
  const variantCls = variant === 'outline' ? 'border border-gray-300 bg-white text-gray-900' : 'bg-blue-600 text-white hover:bg-blue-700';

  return (
    <button {...rest} className={`${base} ${sizeCls} ${variantCls} ${className}`.trim()}>
      {children}
    </button>
  );
}

export default Button;
