import { Calendar, Gift, Heart, CalendarDays } from "lucide-react";

export default function ImportantDatesView({ data }: { data: any }) {
  // Placeholder mock data. We can fetch birthdays from `data.relationships` if we join with profiles later.
  const upcomingEvents = [
    { date: "Oct 15, 2026", title: "Mom's Birthday", type: "birthday", daysLeft: 5 },
    { date: "Nov 22, 2026", title: "Parents' Anniversary", type: "anniversary", daysLeft: 43 },
    { date: "Dec 31, 2026", title: "New Year Gathering", type: "event", daysLeft: 82 }
  ];

  return (
    <div className="w-full h-full p-8 overflow-y-auto">
      <div className="max-w-3xl mx-auto space-y-8">
        
        <div className="text-center space-y-2 mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#FF4D8D]/10 text-[#FF4D8D] mb-2">
            <Calendar className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold text-white">Important Dates</h2>
          <p className="text-white/50">Never miss a special moment with your network</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-[#00E5FF]/20 to-transparent p-6 rounded-3xl border border-[#00E5FF]/20">
            <Gift className="w-8 h-8 text-[#00E5FF] mb-4" />
            <h3 className="text-xl font-bold text-white">Birthdays</h3>
            <p className="text-white/50 text-sm mt-2">Track birthdays from your family tree and connections.</p>
          </div>
          <div className="bg-gradient-to-br from-[#FF4D8D]/20 to-transparent p-6 rounded-3xl border border-[#FF4D8D]/20">
            <Heart className="w-8 h-8 text-[#FF4D8D] mb-4" />
            <h3 className="text-xl font-bold text-white">Anniversaries</h3>
            <p className="text-white/50 text-sm mt-2">Celebrate the milestones of your loved ones.</p>
          </div>
          <div className="bg-gradient-to-br from-[#8B5CF6]/20 to-transparent p-6 rounded-3xl border border-[#8B5CF6]/20">
            <CalendarDays className="w-8 h-8 text-[#8B5CF6] mb-4" />
            <h3 className="text-xl font-bold text-white">Custom Events</h3>
            <p className="text-white/50 text-sm mt-2">Gatherings, reunions, and important meetups.</p>
          </div>
        </div>

        <div className="bg-black/40 border border-white/10 rounded-3xl p-8 backdrop-blur-md">
          <h3 className="text-xl font-bold text-white mb-6">Upcoming in next 90 days</h3>
          
          <div className="space-y-4">
            {upcomingEvents.map((ev, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    ev.type === 'birthday' ? 'bg-[#00E5FF]/20 text-[#00E5FF]' :
                    ev.type === 'anniversary' ? 'bg-[#FF4D8D]/20 text-[#FF4D8D]' : 'bg-[#8B5CF6]/20 text-[#8B5CF6]'
                  }`}>
                    {ev.type === 'birthday' ? <Gift className="w-6 h-6" /> : ev.type === 'anniversary' ? <Heart className="w-6 h-6" /> : <CalendarDays className="w-6 h-6" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-lg">{ev.title}</h4>
                    <p className="text-white/50 text-sm">{ev.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-white">{ev.daysLeft}</span>
                  <p className="text-xs uppercase tracking-wider text-white/50">Days Left</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
