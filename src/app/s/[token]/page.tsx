import { Metadata, ResolvingMetadata } from 'next';
import api, { getMediaUrl } from '@/lib/api';
import { notFound } from 'next/navigation';
import { GlassPanel } from '@/components/ui/GlassPanel';
import Link from 'next/link';
import { Play } from 'lucide-react';
import { SpatialPhoto } from '@/features/memoryWallet/components/SpatialPhoto';

// IMPORTANT: This creates the Open Graph Previews for WhatsApp, iMessage, Twitter
export async function generateMetadata(
  { params }: { params: { token: string } },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const token = params.token;
  
  // We hit the backend directly without auth to fetch public memory metadata
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4000';
    const res = await fetch(`${backendUrl}/api/memory-wallet/public/share/${token}`, { next: { revalidate: 60 } });
    
    if (!res.ok) {
      return {
        title: 'Memory Not Found | Aurora',
        description: 'This memory may have been deleted or made private.',
      };
    }
    
    const data = await res.json();
    const memory = data.data;
    
    const title = memory.title || `Memory shared by ${memory.owner_name}`;
    const description = memory.caption || `View this beautiful memory captured by ${memory.owner_name} on Aurora.`;
    const imageUrl = getMediaUrl(memory.url);

    return {
      title: title,
      description: description,
      openGraph: {
        title: title,
        description: description,
        url: `https://aurora.app/s/${token}`,
        siteName: 'Aurora Memory Wallet',
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
        type: 'article',
      },
      twitter: {
        card: 'summary_large_image',
        title: title,
        description: description,
        images: [imageUrl],
      },
    };
  } catch (error) {
    return {
      title: 'Aurora Memory Wallet',
    };
  }
}

export default async function PublicSharedMemoryPage({ params }: { params: { token: string } }) {
  const token = params.token;
  let memory: any = null;
  
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4000';
    const res = await fetch(`${backendUrl}/api/memory-wallet/public/share/${token}`, { next: { revalidate: 60 } });
    
    if (!res.ok) {
      notFound();
    }
    const data = await res.json();
    memory = data.data;
  } catch (err) {
    notFound();
  }

  if (!memory) notFound();

  return (
    <div className="min-h-screen bg-[#050816] flex items-center justify-center p-4">
      {/* Immersive Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-[#8B5CF6]/10 to-[#FF4D8D]/5 opacity-50"></div>
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay"></div>
      </div>

      <div className="w-full max-w-4xl relative z-10 flex flex-col items-center">
        {/* Brand Header */}
        <div className="mb-8 flex items-center justify-center gap-2">
           <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#FF4D8D] to-[#8B5CF6] flex items-center justify-center shadow-[0_0_20px_rgba(255,77,141,0.5)]">
              <span className="text-white font-bold text-xs">A</span>
           </div>
           <span className="text-white/80 font-bold tracking-widest uppercase text-sm">Aurora</span>
        </div>

        {/* Dynamic Memory Card */}
        <GlassPanel className="w-full overflow-hidden p-0 rounded-3xl border border-white/10 shadow-2xl relative group">
          <div className="relative aspect-[4/3] sm:aspect-video w-full bg-black/50 overflow-hidden">
            {memory.media_type === 'video' ? (
              <>
                <video src={getMediaUrl(memory.url)} className="w-full h-full object-cover" poster={memory.thumbnail_url ? getMediaUrl(memory.thumbnail_url) : undefined} controls />
              </>
            ) : memory.depth_map_url ? (
              <SpatialPhoto 
                imageUrl={getMediaUrl(memory.url)}
                depthMapUrl={getMediaUrl(memory.depth_map_url)}
              />
            ) : (
              <img src={getMediaUrl(memory.url)} alt={memory.title || 'Memory'} className="w-full h-full object-cover" />
            )}
          </div>
          
          <div className="p-6 md:p-8 bg-gradient-to-b from-[#161a20]/80 to-[#0b0e11] backdrop-blur-md">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{memory.title || "Untitled Memory"}</h1>
            {memory.caption && <p className="text-white/70 text-sm md:text-base leading-relaxed mb-6">{memory.caption}</p>}
            
            <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full border-2 border-white/10 overflow-hidden">
                  {memory.owner_dp ? (
                    <img src={getMediaUrl(memory.owner_dp)} alt={memory.owner_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-[#8B5CF6] flex items-center justify-center text-white font-bold">
                      {memory.owner_name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm text-white font-bold">Shared by {memory.owner_name}</p>
                  <p className="text-xs text-white/50">{new Date(memory.memory_date || memory.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              <Link href="/auth/register" className="bg-white text-black px-6 py-2 rounded-full font-bold text-sm hover:bg-white/90 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                Join Aurora to view Family Context
              </Link>
            </div>
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}
