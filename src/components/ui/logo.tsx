import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Outfit } from 'next/font/google';

const outfit = Outfit({ 
  subsets: ['latin'],
  weight: ['400', '700', '900'] 
});

interface LogoProps {
  className?: string;
  imageClassName?: string;
  textClassName?: string;
  showText?: boolean;
  onClick?: () => void;
}

export function Logo({ className, imageClassName, textClassName, showText = true, onClick }: LogoProps) {
  return (
    <Link href="/" className={cn("flex items-center gap-2 group", className)} onClick={onClick}>
      <div className={cn("relative flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105 size-8 md:size-9", imageClassName)}>
        <Image
          src="/logo.png"
          alt="Janopriyo Logo"
          fill
          sizes="(max-width: 768px) 32px, 40px"
          className="object-contain"
          priority
        />
      </div>
      {showText && (
        <span className={cn(
          outfit.className,
          "font-black text-xl md:text-2xl uppercase tracking-tighter text-primary transition-all group-hover:tracking-tight", 
          textClassName
        )}>
          Janopriyo
        </span>
      )}
    </Link>
  );
}
