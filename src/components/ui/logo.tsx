import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Orbitron } from 'next/font/google';

const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
});


interface LogoProps {
  className?: string;
  imageClassName?: string;
  textClassName?: string;
  showText?: boolean;
  onClick?: () => void;
  sizes?: string;
}

export function Logo({ className, imageClassName, textClassName, showText = true, onClick, sizes }: LogoProps) {
  return (
    <Link href="/" className={cn("flex items-center group", className)} onClick={onClick}>
      <div className={cn("relative flex items-center justify-center overflow-hidden transition-transform group-hover:scale-110 size-10 md:size-12", imageClassName)}>
        <Image
          src="/logo.png"
          alt="Janopriyo Logo"
          fill
          sizes={sizes || "(max-width: 768px) 40px, 48px"}
          className="object-contain"
          quality={100}
          priority
        />
      </div>
      {showText && (
        <span className={cn(
          orbitron.className,
          "text-xl md:text-2xl uppercase text-primary transition-all group-hover:text-primary/90",
          textClassName
        )}>
          Janopriyo
        </span>
      )}
    </Link>
  );
}
