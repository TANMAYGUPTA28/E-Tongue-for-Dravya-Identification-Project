import React from 'react';

export function Card({ className = '', children, hover = false, ...props }) {
  return (
    <div
      className={`bg-[#111713] border border-white/[0.08] rounded-2xl text-[#F3F4F1] transition-all duration-200 ${
        hover ? 'hover:border-white/[0.16] hover:bg-[#151D18]' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className = '', children, ...props }) {
  return (
    <div className={`p-5 sm:p-6 pb-3 flex items-center justify-between flex-wrap gap-3 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className = '', children, ...props }) {
  return (
    <h3 className={`text-sm font-semibold tracking-tight text-[#F3F4F1] ${className}`} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ className = '', children, ...props }) {
  return (
    <p className={`text-xs text-[#8E9B93] font-normal leading-relaxed ${className}`} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ className = '', children, ...props }) {
  return (
    <div className={`p-5 sm:p-6 pt-0 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className = '', children, ...props }) {
  return (
    <div className={`p-5 sm:p-6 pt-0 border-t border-white/[0.06] flex items-center justify-between ${className}`} {...props}>
      {children}
    </div>
  );
}

export default Card;

