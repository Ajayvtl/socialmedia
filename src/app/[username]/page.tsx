import { Metadata, ResolvingMetadata } from 'next'
import { notFound } from 'next/navigation'
import { MapPin, Link as LinkIcon, Calendar, CheckCircle2, Lock, Shield } from "lucide-react"
import ProfileActions from './ProfileActions'

type Props = {
  params: { username: string }
}

// 1. DYNAMIC SEO METADATA GENERATION
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const username = params.username

  // Simulated DB Fetch
  const isPrivate = username === "private_user";
  
  if (isPrivate) {
    return {
      title: 'Private Profile',
      robots: { index: false, follow: false } // Prevent search engines from indexing private profiles
    }
  }

  const title = `${username} on the Platform`
  const description = `Check out ${username}'s 3D Avatar, latest stories, and posts.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'profile',
      url: `https://yourdomain.com/${username}`,
      images: ['https://yourdomain.com/default-avatar.png'], // Dynamic avatar URL
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    }
  }
}

// 2. PUBLIC PROFILE PAGE (Server Component)
export default function PublicProfilePage({ params }: Props) {
  const username = params.username

  // Mock DB Check
  const isPrivate = username === "private_user"
  const hasActiveStory = true // 24-hour status style
  
  // 3. STRUCTURED DATA (JSON-LD for Google Rich Results)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: username,
    url: `https://yourdomain.com/${username}`,
    description: `Creator and Member on the Platform`,
    interactionStatistic: [
      {
        "@type": "InteractionCounter",
        "interactionType": "https://schema.org/FollowAction",
        "userInteractionCount": 12500
      }
    ]
  }

  if (isPrivate) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
         <div className="max-w-md w-full bg-surface p-8 rounded-3xl border border-border text-center">
            <div className="w-20 h-20 bg-surface-secondary rounded-full mx-auto mb-4 flex items-center justify-center border border-border">
              <Lock className="w-8 h-8 text-foreground/50" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">@{username}</h1>
            <p className="text-foreground/60 mb-6">This account is private. You must follow them to see their posts and Avatar.</p>
            <button className="w-full py-3 bg-primary text-background font-bold rounded-xl hover:bg-primary/90 transition">Request to Follow</button>
         </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Inject JSON-LD to HEAD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Profile Header Cover */}
      <div className="h-64 md:h-80 w-full bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-screen" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative -top-24">
         <div className="flex flex-col md:flex-row gap-6 md:items-end justify-between">
            <div className="flex flex-col md:flex-row gap-6 md:items-end">
               {/* Avatar with 24-Hour Status (Story Ring) */}
               <div className="relative group cursor-pointer shrink-0 w-fit">
                  <div className={`w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-background overflow-hidden relative z-10 ${hasActiveStory ? 'ring-4 ring-primary ring-offset-4 ring-offset-background' : ''}`}>
                    <div className="w-full h-full bg-surface-secondary flex items-center justify-center text-4xl font-bold">
                       {username[0].toUpperCase()}
                    </div>
                  </div>
                  {hasActiveStory && (
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-primary text-background text-[10px] font-bold px-2 py-0.5 rounded-full uppercase z-20 border-2 border-background">
                      Live Status
                    </div>
                  )}
               </div>

               <div className="mb-2">
                 <h1 className="text-3xl md:text-4xl font-extrabold text-foreground flex items-center gap-2">
                    {username} <CheckCircle2 className="w-6 h-6 text-primary fill-primary/20" />
                 </h1>
                 <p className="text-foreground/60 text-lg">@{username}</p>
                 <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-foreground/70">
                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4"/> Metaverse</span>
                    <span className="flex items-center gap-1"><LinkIcon className="w-4 h-4"/> linktr.ee/{username}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-4 h-4"/> Joined June 2026</span>
                 </div>
               </div>
            </div>

            <ProfileActions targetUsername={username} />
         </div>

         {/* Stats Bar */}
         <div className="grid grid-cols-3 gap-4 border-y border-border py-6 mt-8 max-w-2xl">
            <div className="text-center md:text-left">
              <span className="text-2xl font-extrabold text-foreground block">142</span>
              <span className="text-sm text-foreground/60 uppercase tracking-wider font-bold">Posts</span>
            </div>
            <div className="text-center md:text-left">
              <span className="text-2xl font-extrabold text-foreground block">12.5K</span>
              <span className="text-sm text-foreground/60 uppercase tracking-wider font-bold">Followers</span>
            </div>
            <div className="text-center md:text-left">
              <span className="text-2xl font-extrabold text-foreground block">845</span>
              <span className="text-sm text-foreground/60 uppercase tracking-wider font-bold">Following</span>
            </div>
         </div>

         {/* Public Feed / Gallery Placeholder */}
         <div className="mt-12">
            <h3 className="text-xl font-bold text-foreground mb-6">Recent Content</h3>
            <div className="grid grid-cols-3 gap-1 md:gap-4">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="aspect-square bg-surface-secondary border border-border/50 hover:opacity-80 transition cursor-pointer md:rounded-2xl" />
              ))}
            </div>
         </div>

      </div>
    </div>
  )
}
