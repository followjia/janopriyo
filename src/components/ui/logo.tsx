import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  imageClassName?: string;
  textClassName?: string;
  showText?: boolean;
}

export function Logo({ className, imageClassName, textClassName, showText = true }: LogoProps) {
  return (
    <Link href="/" className={cn("flex items-center gap-2 group", className)}>
      <div className={cn("relative flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105", imageClassName)}>
        <Image
          src="/logo.png"
          alt="Janopriyo Logo"
          width={32}
          height={32}
          className="object-contain"
        />
      </div>
      {showText && (
        <span className={cn("font-bold text-xl tracking-tight text-primary", textClassName)}>
          Janopriyo
        </span>
      )}
    </Link>
  );
}
