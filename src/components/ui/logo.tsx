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
}

export function Logo({ className, imageClassName, textClassName, showText = true, onClick }: LogoProps) {
  return (
    <Link href="/" className={cn("flex items-center group", className)} onClick={onClick}>
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
          orbitron.className,
          "text-xl md:text-2xl uppercase tracking-[0.2em] text-primary transition-all group-hover:text-primary/90",
          textClassName
        )}>
          Janopriyo
        </span>
      )}
    </Link>
  );
}
