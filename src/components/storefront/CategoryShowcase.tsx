import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface Category {
  _id: string;
  name: string;
  slug: string;
  image?: string;
}

interface CategoryShowcaseProps {
  categories: Category[];
}

export function CategoryShowcase({ categories }: CategoryShowcaseProps) {
  if (!categories || categories.length === 0) return null;

  return (
    <section className="bg-muted/30 py-16">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center text-center space-y-4 mb-10">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl" data-aos="fade-up">
            Browse by Category
          </h2>
          <p className="max-w-[700px] text-muted-foreground md:text-lg" data-aos="fade-up" data-aos-delay="100">
            Find exactly what you're looking for by exploring our curated collections.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category, index) => (
            <Link 
                key={category._id} 
                href={`/shop?category=${encodeURIComponent(category.slug)}`}
                className="group"
                // AOS attributes work fine because AOS is initialized globally in a provider
                data-aos="zoom-in"
                data-aos-delay={index * 100}
            >
              <Card className="overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
                <CardContent className="p-4 flex flex-col items-center gap-3">
                  <div className="h-16 w-16 overflow-hidden rounded-full bg-muted flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    {category.image ? (
                      <img 
                        src={category.image} 
                        alt={category.name} 
                        className="h-full w-full object-cover" 
                      />
                    ) : (
                      <Plus className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <h3 className="font-semibold text-sm group-hover:text-primary transition-colors text-center">
                    {category.name}
                  </h3>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
