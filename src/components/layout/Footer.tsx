import Link from 'next/link';
import connectToDatabase from "@/lib/db";
import GlobalSettings from "@/models/GlobalSettings";
import * as SocialIcons from '@/components/ui/social-icons';
import {
  Circle,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';

async function getGlobalSettings() {
  try {
    await connectToDatabase();
    return await GlobalSettings.findOne({}).lean();
  } catch (error) {
    console.error('Error fetching settings for footer:', error);
    return null;
  }
}

const socialIconMap: Record<string, any> = {
  facebook: SocialIcons.Facebook || Circle,
  twitter: SocialIcons.Twitter || SocialIcons.X || Circle,
  instagram: SocialIcons.Instagram || Circle,
  youtube: SocialIcons.Youtube || Circle,
  linkedin: SocialIcons.Linkedin || Circle,
  tiktok: SocialIcons.Tiktok || Circle,
  whatsapp: SocialIcons.Whatsapp || Circle,
};

const socialLabels: Record<string, string> = {
  facebook: 'Facebook',
  twitter: 'X (Twitter)',
  instagram: 'Instagram',
  youtube: 'YouTube',
  linkedin: 'LinkedIn',
  tiktok: 'TikTok',
  whatsapp: 'WhatsApp',
};

export default async function Footer() {
  const settings = await getGlobalSettings();
  const socialLinks = settings?.socialLinks || {};

  return (
    <footer className="border-t bg-background pt-12 mt-10">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-4">
            <h3 className="text-xl font-bold">{settings?.brandName || 'Janopriyo Shop'}</h3>
            <p className="text-sm text-muted-foreground w-4/5">
              Your ultimate destination for quality products across multiple categories including groceries, electronics, and fashion.
            </p>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold">Categories</h4>
            <ul className="grid gap-2 text-sm text-muted-foreground">
              <li>
                <Link href="/category/grocery" className="hover:text-primary transition-colors">Grocery</Link>
              </li>
              <li>
                <Link href="/category/electronics" className="hover:text-primary transition-colors">Electronics</Link>
              </li>
              <li>
                <Link href="/category/fashion" className="hover:text-primary transition-colors">Fashion</Link>
              </li>
              <li>
                <Link href="/category/gadgets" className="hover:text-primary transition-colors">Gadgets</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold">Information</h4>
            <ul className="grid gap-2 text-sm text-muted-foreground">
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">About Us</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-primary transition-colors">Terms & Conditions</Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold">Contact</h4>
            <ul className="grid gap-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-primary mt-0.5 shrink-0" />
                <span>{settings?.contact?.address || '123 Janopriyo Avenue'}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-primary shrink-0" />
                <span>{settings?.contact?.phone || '+880 1234-567890'}</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-primary shrink-0" />
                <span>{settings?.contact?.email || 'support@janopriyoshop.com'}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between border-t py-6 sm:flex-row text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} {settings?.brandName || 'Janopriyo Shop'}. All rights reserved.</p>

          <div className="flex items-center gap-5 mt-4 sm:mt-0">
            {Object.entries(socialLinks).map(([platform, url]) => {
              if (!url) return null;
              const Icon = socialIconMap[platform];
              if (!Icon) return null;

              // Security: Validate protocol to prevent injection (e.g. javascript:)
              let safeUrl = "#";
              try {
                const parsedUrl = new URL(url as string);
                if (['http:', 'https:', 'mailto:'].includes(parsedUrl.protocol)) {
                  safeUrl = url as string;
                } else {
                  return null; // Skip unsafe protocols
                }
              } catch (e) {
                // Allow relative paths starting with /
                if (typeof url === 'string' && url.startsWith('/')) {
                  safeUrl = url;
                } else {
                  return null; // Skip invalid URLs
                }
              }

              return (
                <a
                  key={platform}
                  href={safeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-all hover:scale-110"
                  aria-label={socialLabels[platform] || platform}
                >
                  <Icon size={18} strokeWidth={2.5} />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}
