import { Target, Trophy, TrendingUp, Calendar as CalendarIcon, Star } from "lucide-react";

export default function GoalsCalendarView() {
  return (
    <div className="w-full h-full p-8 overflow-y-auto">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Goals Section */}
        <div className="lg:col-span-1 space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-[#00D97E]/20 text-[#00D97E] rounded-2xl">
              <Target className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-white">Personal Goals</h2>
          </div>

          <div className="bg-gradient-to-b from-[#00D97E]/10 to-transparent border border-[#00D97E]/20 p-6 rounded-3xl relative overflow-hidden">
            <div className="relative z-10 space-y-6">
              <div>
                <div className="flex justify-between items-end mb-2">
                  <h3 className="font-bold text-white">Build Network</h3>
                  <span className="text-[#00D97E] text-sm font-bold">75%</span>
                </div>
                <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden">
                  <div className="h-full bg-[#00D97E] w-[75%] rounded-full shadow-[0_0_10px_#00D97E]"></div>
                </div>
                <p className="text-xs text-white/50 mt-2">Connect with 100 new distributors</p>
              </div>
              
              <div>
                <div className="flex justify-between items-end mb-2">
                  <h3 className="font-bold text-white">Family Reunion Fund</h3>
                  <span className="text-[#00E5FF] text-sm font-bold">40%</span>
                </div>
                <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden">
                  <div className="h-full bg-[#00E5FF] w-[40%] rounded-full shadow-[0_0_10px_#00E5FF]"></div>
                </div>
                <p className="text-xs text-white/50 mt-2">Save $5000 for the upcoming trip</p>
              </div>

              <button className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-bold transition-colors">
                + Add New Goal
              </button>
            </div>
          </div>

          {/* Mini Achievements */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-black/40 border border-white/10 rounded-2xl flex flex-col items-center justify-center text-center">
              <Trophy className="w-8 h-8 text-[#FACC15] mb-2" />
              <p className="font-bold text-white">Top Earner</p>
              <p className="text-xs text-white/40">This Week</p>
            </div>
            <div className="p-4 bg-black/40 border border-white/10 rounded-2xl flex flex-col items-center justify-center text-center">
              <Star className="w-8 h-8 text-[#FF4D8D] mb-2" />
              <p className="font-bold text-white">50+ Family</p>
              <p className="text-xs text-white/40">Connections</p>
            </div>
          </div>
        </div>

        {/* Calendar Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#8B5CF6]/20 text-[#8B5CF6] rounded-2xl">
                <CalendarIcon className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-white">Memories & Calendar</h2>
            </div>
            <select className="bg-black/40 border border-white/10 text-white text-sm px-4 py-2 rounded-xl outline-none">
              <option>October 2026</option>
              <option>November 2026</option>
            </select>
          </div>

          <div className="bg-black/40 border border-white/10 rounded-3xl p-6 h-[500px] flex flex-col">
            {/* Simple Grid Placeholder for Calendar */}
            <div className="grid grid-cols-7 gap-2 mb-2 text-center text-sm font-bold text-white/50">
              <div>SUN</div><div>MON</div><div>TUE</div><div>WED</div><div>THU</div><div>FRI</div><div>SAT</div>
            </div>
            <div className="flex-1 grid grid-cols-7 gap-2">
              {Array.from({ length: 35 }).map((_, i) => {
                const isToday = i === 15;
                const hasEvent = i === 10 || i === 22;
                return (
                  <div key={i} className={`relative rounded-xl border ${isToday ? 'border-[#00E5FF] bg-[#00E5FF]/10' : 'border-white/5 bg-white/[0.02]'} p-2 flex flex-col hover:bg-white/10 transition-colors cursor-pointer`}>
                    <span className={`text-sm font-bold ${isToday ? 'text-[#00E5FF]' : 'text-white/70'}`}>
                      {(i % 31) + 1}
                    </span>
                    {hasEvent && (
                      <div className="mt-auto">
                        <div className="w-full h-1.5 bg-[#FF4D8D] rounded-full shadow-[0_0_5px_#FF4D8D]"></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
