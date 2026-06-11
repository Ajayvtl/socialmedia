import { Metadata } from 'next';
import { Breadcrumbs } from '@/components/ui/Breadcrumb';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { Hash, TrendingUp } from 'lucide-react';
import Image from 'next/image';

// 1. Dynamic SEO Metadata for Internal Hashtag Routes
export async function generateMetadata({ params }: { params: { tag: string } }): Promise<Metadata> {
  const decodedTag = decodeURIComponent(params.tag);
  return {
    title: `#${decodedTag} - Explore Trending on Platform`,
    description: `Explore the latest high-performance posts, communities, and virtual events connected to #${decodedTag}.`
  };
}

export default function TagExplorePage({ params }: { params: { tag: string } }) {
  const decodedTag = decodeURIComponent(params.tag);

  return (
    <div className="max-w-7xl mx-auto py-8">
      {/* 2. Internal Linking Architecture (Breadcrumbs) */}
      <Breadcrumbs />
      
      <div className="px-4 md:px-8 space-y-6">
         <GlassPanel className="p-8 rounded-3xl flex flex-col md:flex-row md:items-center justify-between border-border bg-gradient-to-tr from-primary/10 to-transparent gap-4">
            <div>
               <h1 className="text-4xl font-extrabold text-foreground flex items-center gap-2 mb-2">
                 <Hash className="w-8 h-8 text-primary"/> {decodedTag}
               </h1>
               <p className="text-foreground/60 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-secondary"/> 45.2K posts • Trending in Virtual Spaces</p>
            </div>
            <button className="px-6 py-3 bg-primary text-background font-bold rounded-xl shadow-glow whitespace-nowrap">Follow Tag</button>
         </GlassPanel>

         {/* 3. Performance SEO (Core Web Vitals) */}
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1,2,3,4,5,6,7,8].map(i => (
               <div key={i} className="aspect-[3/4] relative rounded-2xl overflow-hidden bg-surface border border-border group">
                  
                  {/* Web Vitals: Using next/image for auto format (WebP), lazy loading, and exact sizing */}
                  <Image 
                     src={`https://picsum.photos/seed/${decodedTag}${i}/400/600`}
                     alt={`Trending post for ${decodedTag}`}
                     fill
                     sizes="(max-width: 768px) 50vw, 25vw"
                     className="object-cover group-hover:scale-105 transition-transform duration-500"
                     loading={i <= 4 ? "eager" : "lazy"} // Eager load top row to fix LCP (Largest Contentful Paint)
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                     <p className="text-white text-sm font-bold truncate">Epic #{decodedTag} moment!</p>
                  </div>
               </div>
            ))}
         </div>
      </div>
    </div>
  );
}
