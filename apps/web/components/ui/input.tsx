import React from 'react';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  className?: string;
};

export function Input({ className = '', ...rest }: InputProps) {
  return (
    <input
      {...rest}
      className={`${className} border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`.trim()}
    />
  );
}

export default Input;
