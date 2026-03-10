"use client";

import React, { useState } from "react";
import { MapPin, Phone, Clock, Star, Search, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";

interface VetClinic {
  id: number;
  name: string;
  rating: number;
  reviews: number;
  phone: string;
  address: string;
  hours: string;
  services: string[];
  emergency?: boolean;
}

const MOCK_VETS: VetClinic[] = [
  { id: 1, name: "City Animal Hospital", rating: 4.8, reviews: 312, phone: "(212) 555-0101", address: "123 Broadway, New York, NY 10036", hours: "Mon–Fri 8am–8pm, Sat–Sun 9am–6pm", services: ["Emergency", "Surgery", "Dental", "X-Ray", "Lab Tests"], emergency: true },
  { id: 2, name: "Paws & Claws Veterinary", rating: 4.6, reviews: 198, phone: "(212) 555-0102", address: "456 5th Ave, New York, NY 10018", hours: "Mon–Sat 8am–7pm", services: ["Wellness", "Vaccination", "Dental", "Grooming"] },
  { id: 3, name: "Downtown Pet Clinic", rating: 4.5, reviews: 156, phone: "(212) 555-0103", address: "789 Greenwich St, New York, NY 10014", hours: "Mon–Fri 9am–6pm", services: ["Wellness", "Surgery", "Emergency", "Orthopedics"], emergency: true },
  { id: 4, name: "Happy Paws Animal Hospital", rating: 4.9, reviews: 441, phone: "(212) 555-0104", address: "321 E 60th St, New York, NY 10022", hours: "24/7 Emergency Available", services: ["Emergency", "Neutering", "X-Ray", "Lab Tests", "ICU"], emergency: true },
  { id: 5, name: "Central Park Vet", rating: 4.7, reviews: 223, phone: "(212) 555-0105", address: "50 W 96th St, New York, NY 10025", hours: "Mon–Sun 8am–9pm", services: ["Wellness", "Dental", "Behavioral", "Nutrition"] },
  { id: 6, name: "Brooklyn Heights Animal Clinic", rating: 4.4, reviews: 89, phone: "(718) 555-0106", address: "22 Montague St, Brooklyn, NY 11201", hours: "Mon–Fri 8am–6pm, Sat 9am–4pm", services: ["Wellness", "Vaccination", "Dental"] },
];

export default function VetFinderPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "emergency">("all");
  const [selected, setSelected] = useState<VetClinic | null>(null);

  const filtered = MOCK_VETS.filter((v) => {
    const matchSearch =
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.address.toLowerCase().includes(search.toLowerCase()) ||
      v.services.some((s) => s.toLowerCase().includes(search.toLowerCase()));
    const matchFilter = filter === "all" || (filter === "emergency" && v.emergency);
    return matchSearch && matchFilter;
  });

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard"
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition-all shadow-sm">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Vet Finder</h1>
          <p className="text-slate-500 text-sm mt-0.5">Find trusted veterinary care near you</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clinics, services, location..."
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white shadow-sm"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "emergency"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                filter === f
                  ? "bg-teal-600 text-white border-teal-600 shadow-lg shadow-teal-600/20"
                  : "bg-white text-slate-600 border-slate-200 hover:border-teal-300 hover:text-teal-600"
              }`}>
              {f === "all" ? "All Clinics" : "🚨 Emergency"}
            </button>
          ))}
        </div>
      </div>

      {/* Map Placeholder */}
      <div className="bg-gradient-to-br from-slate-800 to-teal-900 rounded-2xl h-48 mb-6 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 30% 50%, #14b8a6 0%, transparent 40%), radial-gradient(circle at 70% 50%, #6366f1 0%, transparent 40%)" }} />
        <div className="relative text-center">
          <MapPin className="w-8 h-8 text-teal-400 mx-auto mb-2" />
          <p className="text-white font-semibold">Interactive map coming soon</p>
          <p className="text-slate-400 text-sm mt-1">Browse clinics in the list below</p>
        </div>
      </div>

      {/* Results */}
      <p className="text-sm text-slate-500 mb-4 font-medium">{filtered.length} clinic{filtered.length !== 1 ? "s" : ""} found</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map((vet, i) => (
          <motion.div key={vet.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <button
              onClick={() => setSelected(selected?.id === vet.id ? null : vet)}
              className={`w-full text-left bg-white rounded-2xl border shadow-sm p-4 hover:shadow-md transition-all ${
                selected?.id === vet.id ? "border-teal-300 shadow-teal-100" : "border-slate-100"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-slate-900">{vet.name}</h3>
                    {vet.emergency && (
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-semibold border border-red-200">Emergency</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span className="font-semibold text-slate-800">{vet.rating}</span>
                    <span className="text-slate-400">({vet.reviews} reviews)</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{vet.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{vet.hours}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span>{vet.phone}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mt-3">
                {vet.services.map((s) => (
                  <span key={s} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg">{s}</span>
                ))}
              </div>

              <AnimatePresence>
                {selected?.id === vet.id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden">
                    <div className="pt-4 mt-3 border-t border-slate-100 flex gap-2">
                      <a href={`tel:${vet.phone}`}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-teal-600 text-white rounded-xl text-sm font-semibold hover:bg-teal-700 transition-all">
                        <Phone className="w-3.5 h-3.5" /> Call Now
                      </a>
                      <a href={`https://maps.google.com/?q=${encodeURIComponent(vet.address)}`} target="_blank" rel="noreferrer"
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-200 transition-all">
                        <MapPin className="w-3.5 h-3.5" /> Directions
                      </a>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
          <div className="text-5xl mb-3">🗺️</div>
          <h3 className="font-bold text-slate-800 mb-1">No clinics found</h3>
          <p className="text-slate-400 text-sm">Try adjusting your search or filter.</p>
        </div>
      )}
    </div>
  );
}
