import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  imageClassName?: string;
  textClassName?: string;
  showText?: boolean;
  onClick?: () => void;
}

export function Logo({ className, imageClassName, textClassName, showText = true, onClick }: LogoProps) {
  return (
    <Link href="/" className={cn("flex items-center group", className)} onClick={onClick}>
      <div className={cn("relative flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105 size-8", imageClassName)}>
        <Image
          src="/logo.png"
          alt="Janopriyo Logo"
          fill
          sizes="40px"
          className="object-contain"
          priority
        />
      </div>
      {showText && (
        <span className={cn("font-bold text-xl uppercase tracking-tight text-primary transition-colors", textClassName)}>
          Janopriyo
        </span>
      )}
    </Link>
  );
}
