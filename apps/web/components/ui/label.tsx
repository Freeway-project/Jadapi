import React from 'react';

export type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement> & {
  className?: string;
};

export function Label({ className = '', children, ...rest }: LabelProps) {
  return (
    <label {...rest} className={`${className}`.trim()}>
      {children}
    </label>
  );
}

export default Label;
