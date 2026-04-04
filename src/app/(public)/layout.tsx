import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Marquee } from '@/components/layout/Marquee';
import connectToDatabase from "@/lib/db";
import GlobalSettings from "@/models/GlobalSettings";

async function getMarqueeText() {
  try {
    await connectToDatabase();
    const settings = await GlobalSettings.findOne({}).select('marqueeText').lean();
    return settings?.marqueeText || 'Welcome to Janopriyo Shop! Free shipping on orders over $500.';
  } catch (error) {
    console.error('Error fetching marquee text:', error);
    return 'Welcome to Janopriyo Shop!';
  }
}
 
export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const marqueeText = await getMarqueeText();
  return (
    <>
      <Marquee marqueeText={marqueeText} />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
