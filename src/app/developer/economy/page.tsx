"use client";

import { useState } from "react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GlowButton } from "@/components/ui/GlowButton";
import { AnimatedContainer } from "@/components/ui/AnimatedContainer";
import { Coins, Gem, CreditCard, DollarSign, Plus, Edit, Trash2, Check, X, Search, Settings2 } from "lucide-react";

export default function EconomyEnginePage() {
  const [activeTab, setActiveTab] = useState<"PACKAGES" | "PAYOUTS" | "LEDGER">("PACKAGES");
  const [isAddingPackage, setIsAddingPackage] = useState(false);

  // Mock Data for CRUD
  const [packages, setPackages] = useState([
    { id: 1, name: "Starter Pouch", coins: 100, price: 4.99, isPopular: false },
    { id: 2, name: "Creator Chest", coins: 500, price: 19.99, isPopular: true },
    { id: 3, name: "Whale Vault", coins: 2500, price: 89.99, isPopular: false },
  ]);

  const payouts = [
    { id: "PAY-101", creator: "@alice_x", amount: "$450.00", gems: 45000, status: "Pending" },
    { id: "PAY-102", creator: "@neon_d", amount: "$1,200.00", gems: 120000, status: "Pending" },
    { id: "PAY-100", creator: "@crypto_bro", amount: "$150.00", gems: 15000, status: "Approved" },
  ];

  const ledger = [
    { id: "TX-998", type: "Gift", from: "@bob_m", to: "@alice_x", amount: "50 Gems", date: "2026-06-03" },
    { id: "TX-997", type: "Purchase", from: "@ninja_99", to: "Platform", amount: "$19.99 (500 Coins)", date: "2026-06-03" },
    { id: "TX-996", type: "Store Drop", from: "@neon_d", to: "Platform", amount: "1,200 Gems", date: "2026-06-02" },
  ];

  const handleDeletePackage = (id: number) => {
    setPackages(packages.filter(p => p.id !== id));
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <AnimatedContainer animation="slideUp" className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground mb-2 flex items-center gap-2">
            <Coins className="w-8 h-8 text-warning" /> Economy Engine
          </h1>
          <p className="text-foreground/60">Manage dynamic coin packages, creator payouts, and global ledger.</p>
        </div>
        <div className="flex gap-2 bg-surface-secondary p-1 rounded-xl border border-border">
          <button onClick={() => setActiveTab("PACKAGES")} className={`px-4 py-2 rounded-lg font-bold text-sm transition ${activeTab === "PACKAGES" ? "bg-surface text-warning shadow-soft" : "text-foreground/60 hover:text-foreground"}`}>Packages</button>
          <button onClick={() => setActiveTab("PAYOUTS")} className={`px-4 py-2 rounded-lg font-bold text-sm transition ${activeTab === "PAYOUTS" ? "bg-surface text-success shadow-soft" : "text-foreground/60 hover:text-foreground"}`}>Payouts</button>
          <button onClick={() => setActiveTab("LEDGER")} className={`px-4 py-2 rounded-lg font-bold text-sm transition ${activeTab === "LEDGER" ? "bg-surface text-primary shadow-soft" : "text-foreground/60 hover:text-foreground"}`}>Global Ledger</button>
        </div>
      </AnimatedContainer>

      {/* Main Content Area */}
      <GlassPanel className="p-6 rounded-3xl border border-border">
        
        {/* PACKAGES CRUD */}
        {activeTab === "PACKAGES" && (
          <AnimatedContainer animation="fade" className="space-y-6">
            <div className="flex justify-between items-center border-b border-border pb-4">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2"><DollarSign className="w-5 h-5 text-warning"/> Dynamic Coin Packages</h2>
              <GlowButton variant="secondary" onClick={() => setIsAddingPackage(!isAddingPackage)}><Plus className="w-4 h-4 mr-2"/> Create Package</GlowButton>
            </div>

            {isAddingPackage && (
              <div className="bg-surface-secondary p-6 rounded-2xl border border-border flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                  <label className="text-xs font-bold text-foreground/60 uppercase mb-1 block">Package Name</label>
                  <input type="text" placeholder="e.g. Mega Vault" className="w-full bg-surface border border-border rounded-lg px-4 py-2 text-foreground focus:border-warning outline-none" />
                </div>
                <div className="w-full md:w-32">
                  <label className="text-xs font-bold text-foreground/60 uppercase mb-1 block">Coins</label>
                  <input type="number" placeholder="1000" className="w-full bg-surface border border-border rounded-lg px-4 py-2 text-foreground focus:border-warning outline-none" />
                </div>
                <div className="w-full md:w-32">
                  <label className="text-xs font-bold text-foreground/60 uppercase mb-1 block">Price ($)</label>
                  <input type="number" placeholder="9.99" className="w-full bg-surface border border-border rounded-lg px-4 py-2 text-foreground focus:border-warning outline-none" />
                </div>
                <GlowButton variant="primary" className="w-full md:w-auto"><Check className="w-4 h-4 mr-2"/> Save</GlowButton>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {packages.map((pkg) => (
                <div key={pkg.id} className="p-5 bg-surface border border-border hover:border-warning/50 rounded-2xl transition relative group">
                  {pkg.isPopular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-warning text-warning-foreground text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Best Value</span>}
                  
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center text-warning border border-warning/20">
                      <Coins className="w-6 h-6" />
                    </div>
                    <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 text-foreground/50 hover:text-primary transition"><Edit className="w-4 h-4"/></button>
                      <button onClick={() => handleDeletePackage(pkg.id)} className="p-1.5 text-foreground/50 hover:text-danger transition"><Trash2 className="w-4 h-4"/></button>
                    </div>
                  </div>
                  
                  <h3 className="font-bold text-lg text-foreground mb-1">{pkg.name}</h3>
                  <div className="flex items-end gap-2 mb-4">
                    <span className="text-2xl font-extrabold text-foreground">{pkg.coins}</span>
                    <span className="text-sm font-bold text-foreground/50 mb-1">Coins</span>
                  </div>
                  <div className="w-full py-2 bg-surface-secondary text-center rounded-lg border border-border font-mono text-sm text-foreground/80">
                    ${pkg.price.toFixed(2)} USD
                  </div>
                </div>
              ))}
            </div>
          </AnimatedContainer>
        )}

        {/* PAYOUTS MANAGER */}
        {activeTab === "PAYOUTS" && (
          <AnimatedContainer animation="fade" className="space-y-6">
            <div className="flex justify-between items-center border-b border-border pb-4">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2"><CreditCard className="w-5 h-5 text-success"/> Creator Payout Requests</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border text-foreground/50 text-xs uppercase tracking-wider">
                    <th className="pb-3 font-bold">Request ID</th>
                    <th className="pb-3 font-bold">Creator</th>
                    <th className="pb-3 font-bold">Gems Deducted</th>
                    <th className="pb-3 font-bold">Fiat Amount</th>
                    <th className="pb-3 font-bold">Status</th>
                    <th className="pb-3 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {payouts.map((pay) => (
                    <tr key={pay.id} className="border-b border-border/50 hover:bg-surface-secondary/50 transition">
                      <td className="py-4 font-mono text-foreground/60">{pay.id}</td>
                      <td className="py-4 font-bold text-foreground">{pay.creator}</td>
                      <td className="py-4 text-warning font-bold flex items-center gap-1"><Gem className="w-3 h-3"/> {pay.gems.toLocaleString()}</td>
                      <td className="py-4 text-success font-bold">{pay.amount}</td>
                      <td className="py-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${pay.status === 'Approved' ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'}`}>{pay.status}</span>
                      </td>
                      <td className="py-4 text-right">
                        {pay.status === "Pending" ? (
                          <div className="flex justify-end gap-2">
                            <button className="p-1.5 bg-success/10 text-success hover:bg-success/20 rounded transition"><Check className="w-4 h-4"/></button>
                            <button className="p-1.5 bg-danger/10 text-danger hover:bg-danger/20 rounded transition"><X className="w-4 h-4"/></button>
                          </div>
                        ) : (
                          <span className="text-xs text-foreground/40 font-bold">Processed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AnimatedContainer>
        )}

        {/* LEDGER */}
        {activeTab === "LEDGER" && (
          <AnimatedContainer animation="fade" className="space-y-6">
             <div className="flex justify-between items-center border-b border-border pb-4">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2"><Settings2 className="w-5 h-5 text-primary"/> Global Transaction Ledger</h2>
              <div className="relative w-64">
                <Search className="w-4 h-4 text-foreground/50 absolute left-3 top-1/2 -translate-y-1/2" />
                <input type="text" placeholder="Search TxID or User..." className="w-full bg-surface-secondary border border-border rounded-lg pl-9 pr-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border text-foreground/50 text-xs uppercase tracking-wider">
                    <th className="pb-3 font-bold">TxID</th>
                    <th className="pb-3 font-bold">Date</th>
                    <th className="pb-3 font-bold">Type</th>
                    <th className="pb-3 font-bold">From</th>
                    <th className="pb-3 font-bold">To</th>
                    <th className="pb-3 font-bold text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {ledger.map((tx) => (
                    <tr key={tx.id} className="border-b border-border/50 hover:bg-surface-secondary/50 transition">
                      <td className="py-3 font-mono text-foreground/60 text-xs">{tx.id}</td>
                      <td className="py-3 text-foreground/60">{tx.date}</td>
                      <td className="py-3 font-bold text-foreground">{tx.type}</td>
                      <td className="py-3 text-secondary">{tx.from}</td>
                      <td className="py-3 text-primary">{tx.to}</td>
                      <td className="py-3 text-right font-bold text-foreground">{tx.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AnimatedContainer>
        )}

      </GlassPanel>
    </div>
  );
}
