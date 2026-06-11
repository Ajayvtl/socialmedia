"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { AuroraSelect } from "@/components/ui/AuroraSelect";
import { AuroraDatePicker } from "@/components/ui/AuroraDatePicker";
import { Loader2, ArrowRight, User, Heart, Users, MapPin, Target, Sparkles, Plus, Image as ImageIcon, ChevronDown } from "lucide-react";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { safeArray } from "@/lib/utils";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Basic Identity
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  
  // Purpose
  const [purposes, setPurposes] = useState<string[]>([]);
  
  // Date of Birth
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("other");
  const [location, setLocation] = useState("");
  const [country, setCountry] = useState("United States");
  const [countriesList, setCountriesList] = useState<{value: string, label: string, icon?: string, code?: string}[]>([]);
  const [availableServices, setAvailableServices] = useState<any[]>([]);
  
  // Interests
  const [availableInterests, setAvailableInterests] = useState<any[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<number[]>([]);

  // Validation
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "loading" | "available" | "taken" | "invalid">("idle");
  const [usernameSuggestions, setUsernameSuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (!username) {
      setUsernameStatus("idle");
      return;
    }
    const isValid = /^[a-z0-9_]{3,20}$/.test(username);
    if (!isValid) {
      setUsernameStatus("invalid");
      return;
    }
    
    setUsernameStatus("loading");
    const timeoutId = setTimeout(async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get(`/social-profile/check-username/${username}`, { headers: { Authorization: `Bearer ${token}` }});
        if (res.data?.data?.available) {
          setUsernameStatus("available");
        } else {
          setUsernameStatus("taken");
          setUsernameSuggestions([
            `${username}${Math.floor(Math.random() * 999)}`,
            `${username}_${Math.floor(Math.random() * 999)}`,
            `real${username}`
          ]);
        }
      } catch (err: any) {
        setUsernameStatus("idle");
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [username]);
  useEffect(() => {
    const fetchGlobals = async () => {
       try {
         const [cRes, iRes, sRes] = await Promise.all([
           api.get("/settings/countries"),
           api.get("/settings/interests"),
           api.get("/settings/services")
         ]);
         if (cRes.data?.data) {
           const active = cRes.data.data.filter((c: any) => c.is_enabled);
           setCountriesList(active.map((c: any) => ({
             value: c.name,
             label: c.name,
             icon: c.code ? `https://flagcdn.com/w40/${String(c.code).toLowerCase()}.png` : c.icon,
             code: c.code
           })));
           if (active.length > 0 && !country) setCountry(active[0].name);
         }
         if (iRes.data?.data) {
           setAvailableInterests(iRes.data.data.filter((i: any) => i.is_enabled));
         }
         if (sRes.data?.data) {
           setAvailableServices(sRes.data.data.filter((s: any) => s.is_active));
         }
         // Also fetch user profile to resume progress
         const pRes = await api.get("/social-profile");
         if (pRes.data?.data) {
           const p = pRes.data.data;
           if (p.onboarding_step > 1 && p.onboarding_step <= 5) setStep(p.onboarding_step);
           if (p.username) setUsername(p.username);
           if (p.first_name) setFirstName(p.first_name);
           if (p.last_name) setLastName(p.last_name);
           if (p.dob) setDob(p.dob.split('T')[0]); // assuming YYYY-MM-DD
           if (p.gender) setGender(p.gender);
           if (p.location) setLocation(p.location);
           if (p.country) setCountry(p.country);
           if (p.interested_in) setInterestedIn(p.interested_in);
           if (p.purposes) {
             try { setPurposes(typeof p.purposes === 'string' ? JSON.parse(p.purposes) : p.purposes); } catch(e){}
           }
           if (p.interests) {
             try { setSelectedInterests(typeof p.interests === 'string' ? JSON.parse(p.interests) : p.interests); } catch(e){}
           }
         }
       } catch (err) {
         console.error("Failed to fetch global variables or profile", err);
       }
    };
    fetchGlobals();
  }, []);

  const filteredInterests = availableInterests.filter(i => i.gender_target === 'all' || i.gender_target === gender);

  const calculateAge = (dobString: string) => {
    if (!dobString) return 0;
    const diff = Date.now() - new Date(dobString).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  };
  
  const visibleServices = availableServices.filter(s => {
    const age = calculateAge(dob);
    if (age > 0 && (age < s.min_age || age > s.max_age)) return false;
    
    const selectedCountryData = countriesList.find(c => c.label === country);
    const code = selectedCountryData?.code;
    
    if (s.country !== 'ALL' && s.country !== country && s.country !== code) return false;
    return true;
  });

  const getLocationDetails = async () => {
    if (!navigator.geolocation) {
      toast.error("Location is not supported on this device");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
            {
              headers: {
                "Accept": "application/json",
                "Accept-Language": "en",
              },
            }
          );

          if (!response.ok) {
            throw new Error("Reverse geocoding failed");
          }

          const data = await response.json();
          const address = data?.address || {};
          const cityName =
            address.city ||
            address.town ||
            address.village ||
            address.county ||
            address.state ||
            "";
          const countryName = address.country || "";
          const countryCode = String(address.country_code || "").toUpperCase();

          if (cityName) {
            setLocation(cityName);
          }

          if (countryName) {
            const matchedCountry = countriesList.find((item) =>
              item.label.toLowerCase() === String(countryName).toLowerCase() ||
              String(item.code || "").toUpperCase() === countryCode
            );
            setCountry(matchedCountry?.value || countryName);
          }

          if (!cityName && !countryName) {
            toast.success("Location retrieved");
          } else {
            toast.success("City and country filled");
          }
        } catch (error) {
          console.error("Failed to reverse geocode location", error);
          toast.error("Could not determine city and country");
        }
      },
      () => toast.error("Location access denied")
    );
  };
  
  // Dating Preferences
  const [interestedIn, setInterestedIn] = useState("everyone");
  const [minAge, setMinAge] = useState("18");
  const [maxAge, setMaxAge] = useState("99");
  const [maxDistance, setMaxDistance] = useState("50");
  const [relationshipGoal, setRelationshipGoal] = useState("Long-term");

  const saveProgress = async (nextStepNumber: number) => {
    try {
      await api.put("/social-profile", {
        first_name: firstName,
        last_name: lastName,
        username,
        dob,
        gender,
        location,
        country,
        interested_in: interestedIn,
        purposes,
        interests: selectedInterests,
        onboarding_step: nextStepNumber
      });
      setStep(nextStepNumber);
    } catch (err) {
      toast.error("Failed to save progress");
    }
  };

  const nextStep = () => {
    if (step === 1 && (!username || usernameStatus !== 'available')) {
      toast.error("Please enter a valid unique username");
      return;
    }
    if (step === 2 && !dob) {
      toast.error("Please enter your Date of Birth");
      return;
    }
    saveProgress(step + 1);
  };

  const togglePurpose = (p: string) => {
    setPurposes(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  };

  const toggleInterest = (id: number) => {
    if (selectedInterests.includes(id)) {
      setSelectedInterests(prev => prev.filter(x => x !== id));
    } else {
      if (selectedInterests.length >= 5) {
        toast.error("You can select a maximum of 5 interests");
        return;
      }
      setSelectedInterests(prev => [...prev, id]);
    }
  };

  const submitOnboarding = async () => {
    setLoading(true);
    try {
      await api.put("/social-profile", { 
        first_name: firstName,
        last_name: lastName,
        username, 
        dob, 
        gender, 
        location, 
        country, 
        interested_in: interestedIn,
        purposes,
        interests: selectedInterests,
        onboarding_step: 6 // completed
      });
      toast.success("Profile fully created!");
      router.push("/dapp/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create profile");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    if (step === 1 && (!firstName || !username || usernameStatus !== 'available' || !dob)) return toast.error("Please fill all required fields correctly");
    if (step === 2 && purposes.length === 0) return toast.error("Select at least one purpose");
    if (step === 3 && selectedInterests.length === 0) return toast.error("Select at least one interest");
    
    let nextStepNumber = step + 1;
    if (step === 3) {
      if (purposes.includes("Dating")) nextStepNumber = 4;
      else {
        submitOnboarding();
        return;
      }
    } else if (step === 4) {
      submitOnboarding();
      return;
    }
    
    await saveProgress(nextStepNumber);
  };

  return (
    <div className="min-h-screen bg-[#050816] flex flex-col items-center justify-center p-4 relative overflow-y-auto hide-scrollbar">
      {/* Background Ambience */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] aspect-square rounded-full bg-gradient-to-br from-[#00E5FF]/20 to-transparent blur-[120px] pointer-events-none fixed" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] aspect-square rounded-full bg-gradient-to-tl from-[#FF4D8D]/20 to-transparent blur-[120px] pointer-events-none fixed" />

      <GlassPanel className="w-full max-w-lg p-6 md:p-8 relative z-10 border border-white/10 bg-black/40 shadow-2xl backdrop-blur-xl rounded-[32px] my-auto">
        
        {step === 1 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-500">
            <div className="text-center mb-8">
               <h2 className="text-3xl font-bold text-white mb-2">Basic Identity</h2>
               <p className="text-white/50 text-sm">Let's setup your profile</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">First Name</label>
                <input type="text" value={firstName} onChange={e=>setFirstName(e.target.value)} placeholder="John" className="w-full bg-white/[0.03] border border-white/20 rounded-2xl px-4 py-3.5 text-white focus:border-[#00E5FF] focus:bg-white/[0.05] outline-none transition-colors shadow-inner" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Last Name</label>
                <input type="text" value={lastName} onChange={e=>setLastName(e.target.value)} placeholder="Doe" className="w-full bg-white/[0.03] border border-white/20 rounded-2xl px-4 py-3.5 text-white focus:border-[#00E5FF] focus:bg-white/[0.05] outline-none transition-colors shadow-inner" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Username</label>
              <input type="text" value={username} onChange={e=>setUsername(e.target.value.toLowerCase())} placeholder="johndoe123" className={`w-full bg-white/[0.03] border shadow-inner ${usernameStatus === 'invalid' || usernameStatus === 'taken' ? 'border-[#FF4D8D]' : usernameStatus === 'available' ? 'border-[#00D97E]' : 'border-white/20'} rounded-2xl px-4 py-3.5 text-white focus:border-[#00E5FF] focus:bg-white/[0.05] outline-none transition-colors`} />
              {usernameStatus === 'loading' && <p className="text-white/50 text-xs mt-2 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin"/> Checking availability...</p>}
              {usernameStatus === 'invalid' && <p className="text-[#FF4D8D] text-xs mt-2">Only lowercase letters, numbers, and underscores (3-20 chars).</p>}
              {usernameStatus === 'available' && <p className="text-[#00D97E] text-xs mt-2">Username is available!</p>}
              {usernameStatus === 'taken' && (
                <div className="mt-2">
                   <p className="text-[#FF4D8D] text-xs mb-1">Username is already taken.</p>
                   <p className="text-white/50 text-xs flex gap-2">
                     Suggestions: 
                     {usernameSuggestions.map(sug => (
                       <button key={sug} onClick={() => setUsername(sug)} className="text-[#00E5FF] hover:underline">{sug}</button>
                     ))}
                   </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Date of Birth</label>
                <AuroraDatePicker value={dob} onChange={setDob} />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-4 text-center">Gender</label>
                <div className="flex justify-center gap-8">
                  <div className="flex flex-col items-center gap-3 cursor-pointer group" onClick={() => setGender('male')}>
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${gender === 'male' ? 'bg-gradient-to-br from-[#00E5FF]/20 to-[#00E5FF]/5 border-2 border-[#00E5FF] shadow-[0_0_20px_rgba(0,229,255,0.4)] scale-110' : 'bg-black/40 border border-white/10 group-hover:bg-white/10 group-hover:scale-105 opacity-70 group-hover:opacity-100'}`}>
                      <svg className={`w-7 h-7 transition-all ${gender === 'male' ? 'text-[#00E5FF] drop-shadow-[0_0_8px_rgba(0,229,255,0.8)]' : 'text-white/50'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="10" cy="14" r="5"/><line x1="13.54" y1="10.46" x2="21" y2="3"/><line x1="16" y1="3" x2="21" y2="3"/><line x1="21" y1="3" x2="21" y2="8"/></svg>
                    </div>
                    <span className={`text-[11px] font-bold tracking-wider uppercase transition-colors ${gender === 'male' ? 'text-[#00E5FF]' : 'text-white/50 group-hover:text-white/80'}`}>Male</span>
                  </div>
                  
                  <div className="flex flex-col items-center gap-3 cursor-pointer group" onClick={() => setGender('female')}>
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${gender === 'female' ? 'bg-gradient-to-br from-[#FF4D8D]/20 to-[#FF4D8D]/5 border-2 border-[#FF4D8D] shadow-[0_0_20px_rgba(255,77,141,0.4)] scale-110' : 'bg-black/40 border border-white/10 group-hover:bg-white/10 group-hover:scale-105 opacity-70 group-hover:opacity-100'}`}>
                      <svg className={`w-7 h-7 transition-all ${gender === 'female' ? 'text-[#FF4D8D] drop-shadow-[0_0_8px_rgba(255,77,141,0.8)]' : 'text-white/50'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="9" r="5"/><line x1="12" y1="14" x2="12" y2="21"/><line x1="9" y1="18" x2="15" y2="18"/></svg>
                    </div>
                    <span className={`text-[11px] font-bold tracking-wider uppercase transition-colors ${gender === 'female' ? 'text-[#FF4D8D]' : 'text-white/50 group-hover:text-white/80'}`}>Female</span>
                  </div>

                  <div className="flex flex-col items-center gap-3 cursor-pointer group" onClick={() => setGender('other')}>
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${gender === 'other' ? 'bg-gradient-to-br from-[#8B5CF6]/20 to-[#8B5CF6]/5 border-2 border-[#8B5CF6] shadow-[0_0_20px_rgba(139,92,246,0.4)] scale-110' : 'bg-black/40 border border-white/10 group-hover:bg-white/10 group-hover:scale-105 opacity-70 group-hover:opacity-100'}`}>
                      <Sparkles className={`w-7 h-7 transition-all ${gender === 'other' ? 'text-[#8B5CF6] drop-shadow-[0_0_8px_rgba(139,92,246,0.8)]' : 'text-white/50'}`} strokeWidth={2.5} />
                    </div>
                    <span className={`text-[11px] font-bold tracking-wider uppercase transition-colors ${gender === 'other' ? 'text-[#8B5CF6]' : 'text-white/50 group-hover:text-white/80'}`}>Other</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2 flex justify-between">
                  <span>City</span>
                  <button type="button" onClick={getLocationDetails} className="text-[#00E5FF] text-xs flex items-center gap-1 hover:underline">
                    <MapPin className="w-3 h-3"/> Get Location
                  </button>
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="Enter your city or region"
                  className="w-full h-[48px] bg-white/[0.03] border border-white/20 rounded-2xl px-4 text-white focus:border-[#00E5FF] focus:bg-white/[0.05] outline-none transition-colors shadow-inner"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Country</label>
                <AuroraSelect
                  value={country}
                  onValueChange={(value) => setCountry(String(value || ""))}
                  options={countriesList.length > 0 ? countriesList : [{ value: 'United States', label: 'United States' }]}
                  placeholder="Choose your country"
                />
                <p className="text-white/35 text-xs mt-2">This helps tailor nearby content and services.</p>
              </div>
            </div>
            
            <button onClick={handleNext} disabled={usernameStatus !== 'available' && usernameStatus !== 'idle'} className="w-full bg-gradient-to-r from-[#8B5CF6] to-[#00E5FF] text-white font-bold py-4 rounded-2xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex justify-center items-center gap-2 mt-8">
              Continue <ArrowRight className="w-5 h-5"/>
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-500">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Your Purpose</h2>
              <p className="text-white/50 text-sm">Why are you here? Select all that apply.</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {visibleServices.map(s => (
                <button key={s.id} onClick={() => togglePurpose(s.name)} className={`py-4 px-4 rounded-2xl border transition-all duration-300 font-bold ${purposes.includes(s.name) ? 'bg-[#b534ff]/20 border-[#b534ff] text-white shadow-[0_0_15px_rgba(181,52,255,0.3)]' : 'bg-black/20 border-white/5 text-white/50 hover:bg-white/5 hover:text-white'}`}>
                  {s.name}
                </button>
              ))}
              {visibleServices.length === 0 && (
                <div className="col-span-2 text-center text-white/50 py-4 border border-dashed border-white/10 rounded-xl">
                  No services available in your region/age group.
                </div>
              )}
            </div>

            <button onClick={handleNext} className="w-full bg-gradient-to-r from-[#8B5CF6] to-[#00E5FF] text-white font-bold py-4 rounded-2xl hover:opacity-90 transition-opacity flex justify-center items-center gap-2 mt-8">
              Continue <ArrowRight className="w-5 h-5"/>
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-500">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Your Interests</h2>
              <p className="text-white/50 text-sm">Pick what you love to help us find better matches.</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {filteredInterests.map(interest => (
                <button key={interest.id} onClick={() => toggleInterest(interest.id)} className={`py-4 px-4 rounded-2xl border transition-all duration-300 font-bold flex items-center justify-center gap-2 ${selectedInterests.includes(interest.id) ? 'bg-[#00E5FF]/20 border-[#00E5FF] text-white shadow-[0_0_15px_rgba(0,229,255,0.3)]' : 'bg-black/20 border-white/5 text-white/50 hover:bg-white/5 hover:text-white'}`}>
                  <span className="text-xl">{interest.icon}</span> {interest.name}
                </button>
              ))}
            </div>

            <button onClick={handleNext} disabled={loading} className="w-full bg-gradient-to-r from-[#8B5CF6] to-[#00E5FF] text-white font-bold py-4 rounded-2xl hover:opacity-90 transition-opacity flex justify-center items-center gap-2 mt-8">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Finish Setup <ArrowRight className="w-5 h-5"/></>}
            </button>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-500">
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 bg-pink-500/20 rounded-full flex items-center justify-center mb-4">
                 <Heart className="w-8 h-8 text-pink-400" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Dating Preferences</h2>
              <p className="text-white/50 text-sm">Since you selected Dating, let's narrow it down.</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Interested In</label>
              <AuroraSelect
                value={interestedIn}
                onValueChange={(value) => setInterestedIn(String(value || ""))}
                options={[
                  { value: "male", label: "Men" },
                  { value: "female", label: "Women" },
                  { value: "everyone", label: "Everyone" }
                ]}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Min Age</label>
                <input type="number" value={minAge} onChange={e=>setMinAge(e.target.value)} className="w-full bg-white/[0.03] border border-white/20 rounded-2xl px-4 py-3.5 text-white focus:border-[#00E5FF] focus:bg-white/[0.05] outline-none transition-colors shadow-inner" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Max Age</label>
                <input type="number" value={maxAge} onChange={e=>setMaxAge(e.target.value)} className="w-full bg-white/[0.03] border border-white/20 rounded-2xl px-4 py-3.5 text-white focus:border-[#00E5FF] focus:bg-white/[0.05] outline-none transition-colors shadow-inner" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Maximum Distance ({maxDistance} km)</label>
              <input type="range" min="1" max="500" value={maxDistance} onChange={e=>setMaxDistance(e.target.value)} className="w-full accent-[#00E5FF]" />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Relationship Goal</label>
              <AuroraSelect
                value={relationshipGoal}
                onValueChange={(value) => setRelationshipGoal(String(value || ""))}
                options={[
                  { value: "Long-term", label: "Long-term Relationship" },
                  { value: "Short-term", label: "Short-term Relationship" },
                  { value: "Friends", label: "New Friends" },
                  { value: "Figuring it out", label: "Figuring it out" }
                ]}
              />
            </div>

            <button onClick={handleNext} disabled={loading} className="w-full bg-gradient-to-r from-pink-500 to-[#b534ff] text-white font-bold py-4 rounded-2xl hover:opacity-90 transition-opacity flex justify-center items-center gap-2 mt-8 shadow-[0_4px_20px_rgba(236,72,153,0.3)]">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Save Preferences <ArrowRight className="w-5 h-5"/></>}
            </button>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6 text-center animate-in zoom-in-95 fade-in duration-500">
            <div className="mx-auto w-24 h-24 bg-gradient-to-tr from-[#b534ff] to-[#00E5FF] rounded-[2rem] flex items-center justify-center mb-6 shadow-[0_10px_40px_rgba(0,229,255,0.4)] rotate-12">
               <Sparkles className="w-12 h-12 text-white -rotate-12" />
            </div>
            
            <h2 className="text-3xl font-bold text-white mb-4">Setup Complete!</h2>
            <p className="text-white/60 text-sm mb-10 leading-relaxed max-w-xs mx-auto">Your basic profile is ready. Would you like to create your custom 3D Avatar now, or jump straight into the feed?</p>
            
            <div className="space-y-3">
              <button onClick={() => router.push('/dapp/avatar')} className="w-full bg-white text-black font-bold py-4 rounded-2xl hover:bg-gray-200 transition-colors flex justify-center items-center gap-2 shadow-lg">
                Create 3D Avatar Now
              </button>
              <button onClick={() => router.push('/dapp/feed')} className="w-full bg-black/20 border border-white/10 text-white font-bold py-4 rounded-2xl hover:bg-white/5 transition-colors flex justify-center items-center gap-2">
                Skip for now, take me to Home
              </button>
            </div>
          </div>
        )}

      </GlassPanel>
    </div>
  );
}
