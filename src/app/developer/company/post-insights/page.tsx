"use client";

import { useState, useEffect } from "react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { BarChart2, MessageCircle, Heart, Share2, Users, Search, Filter } from "lucide-react";
import api from "@/lib/api";

export default function PostInsightsPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await api.get('/posts/all?limit=50');
      setPosts(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPosts = posts.filter(post => {
    const author = (post.display_name || post.profile_username || post.user_email || "").toLowerCase();
    const content = (post.content || "").toLowerCase();
    const s = search.toLowerCase();
    return author.includes(s) || content.includes(s);
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart2 className="w-8 h-8 text-emerald-400" />
            Global Post Insights
          </h1>
          <p className="text-slate-400 mt-1">Monitor engagement and reach across all member posts.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <GlassPanel className="p-6 bg-slate-900/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center">
              <Heart className="w-6 h-6 text-pink-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400 font-medium">Total Likes</p>
              <h3 className="text-2xl font-bold text-white">
                {posts.reduce((sum, p) => sum + (p.likes_count || 0), 0)}
              </h3>
            </div>
          </div>
        </GlassPanel>
        <GlassPanel className="p-6 bg-slate-900/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400 font-medium">Total Replies</p>
              <h3 className="text-2xl font-bold text-white">
                {posts.reduce((sum, p) => sum + (p.comments_count || 0), 0)}
              </h3>
            </div>
          </div>
        </GlassPanel>
        <GlassPanel className="p-6 bg-slate-900/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Share2 className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400 font-medium">Total Shares</p>
              <h3 className="text-2xl font-bold text-white">
                {posts.reduce((sum, p) => sum + (p.shares_count || 0), 0)}
              </h3>
            </div>
          </div>
        </GlassPanel>
        <GlassPanel className="p-6 bg-slate-900/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400 font-medium">Total Impressions</p>
              <h3 className="text-2xl font-bold text-white">
                {posts.reduce((sum, p) => sum + (p.views_count || 0), 0)}
              </h3>
            </div>
          </div>
        </GlassPanel>
      </div>

      <GlassPanel className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">All Posts</h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search author or content..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <button className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-300">
            <thead className="text-xs uppercase bg-slate-800/50 text-slate-400 border-b border-slate-700">
              <tr>
                <th className="px-4 py-3 rounded-tl-lg">Author</th>
                <th className="px-4 py-3">Content Snippet</th>
                <th className="px-4 py-3 text-center">Likes</th>
                <th className="px-4 py-3 text-center">Replies</th>
                <th className="px-4 py-3 text-center">Shares</th>
                <th className="px-4 py-3 text-center">Impressions</th>
                <th className="px-4 py-3 text-right rounded-tr-lg">Date</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="text-center py-8 text-slate-500">Loading...</td></tr>
              ) : filteredPosts.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-slate-500">No posts found.</td></tr>
              ) : (
                filteredPosts.map((post) => (
                  <tr key={post.id} className="border-b border-slate-800 hover:bg-slate-800/20 transition-colors">
                    <td className="px-4 py-3 font-medium text-white flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-700 flex flex-shrink-0 items-center justify-center overflow-hidden">
                        {post.avatar_url ? (
                          <img src={post.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs">{post.user_email?.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <div className="flex flex-col">
                         <span>{post.display_name || post.profile_username || "Unknown"}</span>
                         <span className="text-xs text-slate-500">{post.user_email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 max-w-[200px] truncate" title={post.content}>{post.content}</td>
                    <td className="px-4 py-3 text-center text-pink-400 font-bold">{post.likes_count || 0}</td>
                    <td className="px-4 py-3 text-center text-cyan-400 font-bold">{post.comments_count || 0}</td>
                    <td className="px-4 py-3 text-center text-purple-400 font-bold">{post.shares_count || 0}</td>
                    <td className="px-4 py-3 text-center text-yellow-400 font-bold">{post.views_count || 0}</td>
                    <td className="px-4 py-3 text-right text-xs text-slate-500">{new Date(post.created_at).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassPanel>
    </div>
  );
}
