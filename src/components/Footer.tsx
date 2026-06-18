import React from 'react';

interface FooterProps {
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className = "" }) => {
  return (
    <footer className={`py-8 px-4 opacity-50 text-[10px] w-full text-center flex flex-col gap-0.5 ${className}`}>
      <p>&copy; 2026 Sonata | Developed by Al Sangga</p>
    </footer>
  );
};
