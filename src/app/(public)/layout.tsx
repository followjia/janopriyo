import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Marquee } from '@/components/layout/Marquee';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Marquee />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
