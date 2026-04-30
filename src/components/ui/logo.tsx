import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Great_Vibes } from 'next/font/google';

const greatVibes = Great_Vibes({ 
  subsets: ['latin'],
  weight: '400'
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
      <div className={cn("relative flex items-center justify-center overflow-hidden transition-transform group-hover:scale-110 size-9 md:size-10", imageClassName)}>
        <Image
          src="/logo.png"
          alt="Janopriyo Logo"
          fill
          sizes="(max-width: 768px) 36px, 44px"
          className="object-contain"
          priority
        />
      </div>
      {showText && (
        <span className={cn(
          greatVibes.className,
          "text-3xl md:text-4xl text-primary transition-all drop-shadow-sm group-hover:text-primary/80", 
          textClassName
        )}>
          Janopriyo
        </span>
      )}
    </Link>
  );
}
