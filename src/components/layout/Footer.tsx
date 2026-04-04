import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t bg-background pt-12 mt-10">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-4">
            <h3 className="text-xl font-bold">Janopriyo Shop</h3>
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
            <ul className="grid gap-2 text-sm text-muted-foreground">
              <li>123 Janopriyo Avenue</li>
              <li>Dhaka, Bangladesh 1205</li>
              <li>support@janopriyoshop.com</li>
              <li>+880 1234-567890</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between border-t py-6 sm:flex-row text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Janopriyo Shop. All rights reserved.</p>
          <div className="flex gap-4 mt-4 sm:mt-0">
            <a href="https://facebook.com/janopriyoshop" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors" aria-label="Facebook">Facebook</a>
            <a href="https://twitter.com/janopriyoshop" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors" aria-label="Twitter">Twitter</a>
            <a href="https://instagram.com/janopriyoshop" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors" aria-label="Instagram">Instagram</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
