import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const BASE_URL = "https://www.janopriyo.com";
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/', 
        '/dashboard/', 
        '/api/', 
        '/checkout/', 
        '/login/', 
        '/register/', 
        '/forgot-password/', 
        '/reset-password/',
        '/wishlist/'
      ],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
