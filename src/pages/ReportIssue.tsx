import { Camera, MapPin, Calendar as CalIcon, Clock, Send, CheckCircle2, ChevronDown, X, User, AlertCircle, Info } from "lucide-react";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";
import { useAuth } from "../context/AuthContext";
import brokenStreetlightImg from "../assets/images/broken_streetlight_1784910893615.jpg";
import garbageOverflowImg from "../assets/images/garbage_overflow_1788787302130.jpg";

const CATEGORIES = [
  "Garbage", "Potholes", "Broken Streetlights", "Water Leakage", 
  "Drainage", "Stray Animal Issues", "Illegal Tree Cutting", "Pollution", "Other"
];

export type UnifiedReport = {
  id: number;
  title: string;
  category: string;
  status: "Pending" | "In Progress" | "Resolved";
  location: string;
  date: string;
  user: string;
  userEmail?: string;
  description: string;
  contact?: string;
  img?: string;
  afterImg?: string;
  department?: string;
};

const getDepartmentByCategory = (category: string): string => {
  switch (category) {
    case "Garbage": return "Sanitation Department";
    case "Potholes": return "Public Works Department";
    case "Broken Streetlights": return "Electrical Department";
    case "Water Leakage": return "Water Department";
    case "Drainage": return "Sewer Department";
    case "Stray Animal Issues": return "Animal Control Department";
    case "Illegal Tree Cutting": return "Parks & Forestry Department";
    case "Pollution": return "Environmental Protection Department";
    default: return "General Municipal Administration";
  }
};

export const DEFAULT_REPORTS: UnifiedReport[] = [
  { 
    id: 1, 
    title: "Garbage Overflow", 
    category: "Garbage", 
    status: "Pending", 
    location: "Sector 4 Market", 
    date: "Oct 24, 2023, 10:30 AM", 
    user: "Alex Walker", 
    userEmail: "alex.walker@gmail.com", 
    description: "Severe garbage overflow spilling out of the municipal dustbin with excessive waste and plastic accumulated on the pedestrian pavement.", 
    department: "Sanitation Department",
    img: garbageOverflowImg
  },
  { 
    id: 2, 
    title: "Broken Streetlight", 
    category: "Broken Streetlights", 
    status: "Resolved", 
    location: "Oak Wood Avenue", 
    date: "Oct 20, 2023, 08:15 PM", 
    user: "Sarah Jenkins", 
    userEmail: "sarah.j@gmail.com", 
    description: "The street light in front of house 42 has been flickering and is now completely out, making the corner dangerous at night.", 
    department: "Electrical Department",
    img: brokenStreetlightImg,
    afterImg: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&q=80&w=600" // street light fixed bright
  },
];

export function ReportIssue() {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Controlled inputs
  const [title, setTitle] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
  const [location, setLocation] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [description, setDescription] = useState("");
  const [contact, setContact] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Selected complaint details modal state (Requirement 7 & 8)
  const [selectedReport, setSelectedReport] = useState<UnifiedReport | null>(null);

  // Dynamic reports list synced with localStorage
  const [reports, setReports] = useState<UnifiedReport[]>(() => {
    const stored = localStorage.getItem("ecocity_reports");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        let updated = false;
        const cleaned = parsed.map((r: UnifiedReport) => {
          if (r.category === "Broken Streetlights") {
            updated = true;
            return { ...r, img: brokenStreetlightImg };
          }
          if (r.category === "Garbage" || r.id === 1 || r.title.toLowerCase().includes("garbage")) {
            updated = true;
            return { ...r, title: "Garbage Overflow", img: garbageOverflowImg };
          }
          return r;
        });
        if (updated) {
          localStorage.setItem("ecocity_reports", JSON.stringify(cleaned));
        }
        return cleaned;
      } catch (e) {
        return DEFAULT_REPORTS;
      }
    }
    localStorage.setItem("ecocity_reports", JSON.stringify(DEFAULT_REPORTS));
    return DEFAULT_REPORTS;
  });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPhotoPreview(url);
    }
  };

  const formatReportDate = (dateTimeStr: string) => {
    if (!dateTimeStr) return "";
    try {
      const d = new Date(dateTimeStr);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return dateTimeStr;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formattedDate = formatReportDate(dateTime) || new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const newReport: UnifiedReport = {
      id: Date.now(),
      title,
      category: selectedCategory,
      status: "Pending",
      location,
      date: formattedDate,
      user: user?.name || "EcoCity Citizen",
      userEmail: user?.email || "rushithapalteru07@gmail.com",
      description,
      contact: contact || undefined,
      img: photoPreview || "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=600", // elegant fallback placeholder
      department: getDepartmentByCategory(selectedCategory),
    };

    setTimeout(() => {
      const updatedReports = [newReport, ...reports];
      setReports(updatedReports);
      localStorage.setItem("ecocity_reports", JSON.stringify(updatedReports));
      
      setIsSubmitting(false);
      setIsSuccess(true);

      // Reset form fields
      setTitle("");
      setSelectedCategory(CATEGORIES[0]);
      setLocation("");
      setDateTime("");
      setDescription("");
      setContact("");
      setPhotoPreview(null);
    }, 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* Intro Description Board (Requirement 11) */}
      <div className="bg-white border border-charcoal/5 rounded-3xl p-6 sm:p-8 mb-12 flex flex-col md:flex-row gap-6 items-center shadow-xs">
        <div className="w-14 h-14 rounded-2xl bg-teal/10 flex items-center justify-center text-teal flex-shrink-0 border border-teal/10">
          <Info className="w-7 h-7" />
        </div>
        <div>
          <h2 className="text-xl font-display font-medium text-charcoal mb-1">EcoCity Platform Integrity</h2>
          <p className="text-xs sm:text-sm text-charcoal-light leading-relaxed">
            EcoCity is <strong>A Smart Civic Engagement Platform that empowers citizens to report civic issues, participate in environmental initiatives, volunteer for community activities, and collaborate with local authorities to build cleaner, greener, and smarter cities.</strong>
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-12 items-start">
        
        {/* Form Section */}
        <div className="lg:col-span-7">
          <div className="mb-8">
            <h1 className="text-3xl font-display font-medium text-charcoal mb-3">Report an Issue</h1>
            <p className="text-charcoal-light">Help keep our neighborhoods clean, green, and safe. Your report directly reaches the responsible municipal department.</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 md:p-8 border border-charcoal/5 shadow-sm">
            <AnimatePresence mode="wait">
              {isSuccess ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col items-center justify-center py-12 text-center"
                >
                  <div className="w-16 h-16 bg-sage/10 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-8 h-8 text-sage" />
                  </div>
                  <h3 className="text-2xl font-display font-medium text-charcoal mb-4">Report Submitted!</h3>
                  <div className="bg-ivory border border-charcoal/5 rounded-2xl p-5 max-w-md text-sm text-charcoal-light leading-relaxed mb-6">
                    Complaint submitted successfully. Your concern has been instantly routed to the <strong className="text-teal font-semibold">{getDepartmentByCategory(selectedCategory)}</strong> for verification and scheduling.
                  </div>
                  <button type="button" onClick={() => setIsSuccess(false)} className="px-6 py-2.5 bg-teal text-white rounded-xl font-medium shadow-sm hover:bg-teal-light transition-all text-xs cursor-pointer">Submit another report</button>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  {/* Short Title */}
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">Short Title / Summary</label>
                    <input
                      required
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="E.g., Pothole near Central Market"
                      className="w-full bg-ivory border border-charcoal/10 rounded-xl px-4 py-3 text-charcoal focus:outline-none focus:ring-2 focus:ring-teal/20 focus:border-teal transition-all placeholder:text-charcoal-light/50"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">Issue Category</label>
                    <div className="relative">
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full appearance-none bg-ivory border border-charcoal/10 rounded-xl px-4 py-3 text-charcoal focus:outline-none focus:ring-2 focus:ring-teal/20 focus:border-teal transition-all"
                      >
                        {CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-light pointer-events-none" />
                    </div>
                  </div>

                  {/* Photo Upload */}
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">Photo (Optional)</label>
                    <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-charcoal/10 rounded-2xl bg-ivory hover:bg-ivory-dark transition-colors cursor-pointer overflow-hidden relative">
                      {photoPreview ? (
                        <div className="absolute inset-0 w-full h-full">
                          <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity text-white text-sm font-medium">Change Photo</div>
                        </div>
                      ) : (
                        <>
                          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mb-3 shadow-sm">
                            <Camera className="w-5 h-5 text-teal" />
                          </div>
                          <span className="text-sm text-charcoal-light">Tap to upload a photo</span>
                        </>
                      )}
                      <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                    </label>
                    <span className="block mt-2 text-[10px] text-teal font-medium">
                      ⓘ Images will be securely stored in cloud storage after backend integration.
                    </span>
                  </div>

                  {/* Location & Date */}
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-2">Location</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-light" />
                        <input
                          required
                          type="text"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder="E.g., 5th Avenue"
                          className="w-full bg-ivory border border-charcoal/10 rounded-xl pl-11 pr-4 py-3 text-charcoal focus:outline-none focus:ring-2 focus:ring-teal/20 focus:border-teal transition-all placeholder:text-charcoal-light/50"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-2">Date & Time</label>
                      <div className="relative">
                        <CalIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-light" />
                        <input
                          required
                          type="datetime-local"
                          value={dateTime}
                          onChange={(e) => setDateTime(e.target.value)}
                          className="w-full bg-ivory border border-charcoal/10 rounded-xl pl-11 pr-4 py-3 text-charcoal focus:outline-none focus:ring-2 focus:ring-teal/20 focus:border-teal transition-all placeholder:text-charcoal-light/50"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">Description</label>
                    <textarea
                      required
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Please describe the issue in detail..."
                      className="w-full bg-ivory border border-charcoal/10 rounded-xl px-4 py-3 text-charcoal focus:outline-none focus:ring-2 focus:ring-teal/20 focus:border-teal transition-all placeholder:text-charcoal-light/50 resize-none"
                    ></textarea>
                  </div>

                  {/* Contact Info */}
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">Contact Information (Optional)</label>
                    <input
                      type="text"
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      placeholder="Email or Phone Number"
                      className="w-full bg-ivory border border-charcoal/10 rounded-xl px-4 py-3 text-charcoal focus:outline-none focus:ring-2 focus:ring-teal/20 focus:border-teal transition-all placeholder:text-charcoal-light/50"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-teal hover:bg-teal-light text-white rounded-xl font-medium transition-all shadow-sm flex items-center justify-center gap-2 mt-4 disabled:opacity-70 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Submitting complaint...</span>
                      </div>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit Report
                      </>
                    )}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>

        {/* History / Cards Section */}
        <div className="lg:col-span-5">
          <div className="mb-6">
            <h3 className="text-xl font-display font-medium text-charcoal">Recent Reports near you</h3>
            <p className="text-xs text-charcoal-light mt-1">Tap any complaint card to view its live progress timeline and resolution status.</p>
          </div>
          <div className="space-y-4">
            {reports.map((report) => (
              <div 
                key={report.id} 
                onClick={() => setSelectedReport(report)}
                className="bg-white rounded-2xl border border-charcoal/5 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer hover:border-teal/20 active:scale-99"
              >
                {report.img && (
                  <div className="h-48 w-full overflow-hidden border-b border-charcoal/5">
                    <img 
                      src={report.img} 
                      alt={report.title} 
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" 
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className={cn(
                        "text-xs px-3 py-1 rounded-full font-medium shadow-sm transition-colors",
                        report.status === 'Resolved' ? "bg-sage/10 text-sage" : 
                        report.status === 'In Progress' ? "bg-amber-50 text-amber-600 border border-amber-100" : "bg-teal/10 text-teal"
                      )}>
                        {report.status}
                    </span>
                    <div className="text-xs font-semibold tracking-wider uppercase text-charcoal-light">{report.category}</div>
                  </div>
                  
                  <h4 className="font-semibold text-charcoal text-lg mb-2">{report.title}</h4>
                  <p className="text-charcoal-light text-sm mb-4 line-clamp-2 leading-relaxed">{report.description}</p>
                  
                  <div className="flex flex-col gap-2.5 pt-3 border-t border-charcoal/5">
                    <div className="flex items-start gap-2.5 text-xs text-charcoal-light">
                      <MapPin className="w-3.5 h-3.5 text-charcoal/40 flex-shrink-0 mt-0.5" />
                      <span>{report.location}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-charcoal-light">
                      <CalIcon className="w-3.5 h-3.5 text-charcoal/40" />
                      <span>{report.date}</span>
                    </div>
                    {report.department && (
                      <div className="flex items-center gap-2.5 text-xs text-teal font-medium mt-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse mr-1" />
                        <span>Assigned to: {report.department}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Citizen Complaint Details Modal (Requirement 7 & 8) */}
      <AnimatePresence>
        {selectedReport && (
          <div className="fixed inset-0 bg-charcoal/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-charcoal/5 shadow-2xl relative"
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-charcoal/5 px-6 py-5 flex justify-between items-center z-10">
                <div>
                  <span className={cn(
                    "text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider mb-2 inline-block",
                    selectedReport.status === 'Resolved' ? "bg-sage/10 text-sage" : 
                    selectedReport.status === 'In Progress' ? "bg-amber-50 text-amber-600 border border-amber-100" : "bg-teal/10 text-teal"
                  )}>
                    {selectedReport.status}
                  </span>
                  <h3 className="text-xl font-display font-medium text-charcoal">{selectedReport.title}</h3>
                </div>
                <button 
                  onClick={() => setSelectedReport(null)}
                  className="p-2 text-charcoal-light/60 hover:text-charcoal hover:bg-charcoal/5 rounded-full transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-8">
                
                {/* Meta details */}
                <div className="grid grid-cols-2 gap-4 bg-ivory rounded-2xl p-4 text-xs">
                  <div>
                    <span className="text-charcoal-light block mb-0.5">Category</span>
                    <strong className="text-charcoal">{selectedReport.category}</strong>
                  </div>
                  <div>
                    <span className="text-charcoal-light block mb-0.5 font-sans">Responsible Department</span>
                    <strong className="text-teal font-medium">{selectedReport.department || "General Administration"}</strong>
                  </div>
                  <div>
                    <span className="text-charcoal-light block mb-0.5">Precise Location</span>
                    <strong className="text-charcoal flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-teal" /> {selectedReport.location}
                    </strong>
                  </div>
                  <div>
                    <span className="text-charcoal-light block mb-0.5">Submitted Date</span>
                    <strong className="text-charcoal flex items-center gap-1">
                      <CalIcon className="w-3 h-3 text-teal" /> {selectedReport.date}
                    </strong>
                  </div>
                </div>

                {/* Full Description */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-light mb-2">Description</h4>
                  <p className="text-sm text-charcoal leading-relaxed whitespace-pre-wrap bg-ivory/50 rounded-2xl p-4 border border-charcoal/5">
                    {selectedReport.description}
                  </p>
                </div>

                {/* Requirement 7: LIVE COMPLAINT TIMELINE */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-light mb-4">Complaint Dispatch Progress</h4>
                  <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-charcoal/10">
                    
                    {/* Step 1: Submitted */}
                    <div className="flex gap-4 items-start relative z-10">
                      <div className="w-6 h-6 rounded-full bg-teal text-white flex items-center justify-center text-xs font-bold shadow-sm">
                        ✓
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-charcoal">Complaint Submitted</h5>
                        <p className="text-[10px] text-charcoal-light">Successfully received and verified. Citizen points (+10 Eco Points) credited.</p>
                      </div>
                    </div>

                    {/* Step 2: Assigned */}
                    <div className="flex gap-4 items-start relative z-10">
                      <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-sm",
                        (selectedReport.status === "In Progress" || selectedReport.status === "Resolved") 
                          ? "bg-teal text-white" 
                          : "bg-white border-2 border-charcoal/20 text-charcoal-light"
                      )}>
                        {(selectedReport.status === "In Progress" || selectedReport.status === "Resolved") ? "✓" : "2"}
                      </div>
                      <div>
                        <h5 className={cn("text-xs font-bold", (selectedReport.status === "In Progress" || selectedReport.status === "Resolved") ? "text-charcoal" : "text-charcoal-light")}>
                          Assigned to Department
                        </h5>
                        <p className="text-[10px] text-charcoal-light">
                          {(selectedReport.status === "In Progress" || selectedReport.status === "Resolved") 
                            ? `Successfully assigned to ${selectedReport.department || "General Department"}.` 
                            : "Awaiting dispatcher department assignment."}
                        </p>
                      </div>
                    </div>

                    {/* Step 3: In Progress */}
                    <div className="flex gap-4 items-start relative z-10">
                      <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-sm",
                        (selectedReport.status === "In Progress" || selectedReport.status === "Resolved") 
                          ? "bg-teal text-white animate-pulse" 
                          : "bg-white border-2 border-charcoal/20 text-charcoal-light"
                      )}>
                        {selectedReport.status === "Resolved" ? "✓" : "3"}
                      </div>
                      <div>
                        <h5 className={cn("text-xs font-bold", (selectedReport.status === "In Progress" || selectedReport.status === "Resolved") ? "text-charcoal" : "text-charcoal-light")}>
                          In Progress
                        </h5>
                        <p className="text-[10px] text-charcoal-light">
                          {selectedReport.status === "Resolved" 
                            ? "Field crew dispatched and operation completed." 
                            : selectedReport.status === "In Progress" 
                              ? "Crew has been dispatched to the physical site to initiate resolution works." 
                              : "Operation will begin once assignment is confirmed."}
                        </p>
                      </div>
                    </div>

                    {/* Step 4: Resolved */}
                    <div className="flex gap-4 items-start relative z-10">
                      <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-sm",
                        selectedReport.status === "Resolved" 
                          ? "bg-sage text-white" 
                          : "bg-white border-2 border-charcoal/20 text-charcoal-light"
                      )}>
                        {selectedReport.status === "Resolved" ? "✓" : "4"}
                      </div>
                      <div>
                        <h5 className={cn("text-xs font-bold", selectedReport.status === "Resolved" ? "text-sage" : "text-charcoal-light")}>
                          Resolved
                        </h5>
                        <p className="text-[10px] text-charcoal-light">
                          {selectedReport.status === "Resolved" 
                            ? "Issue resolved completely! Citizens rewarded with bonus (+20 Eco Points)." 
                            : "Awaiting final municipal crew site completion sign-off."}
                        </p>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Requirement 8: BEFORE & AFTER IMAGES */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-light mb-4">Site Visual Documentation</h4>
                  <div className="grid sm:grid-cols-2 gap-6">
                    {/* Before Image */}
                    <div>
                      <span className="block text-[10px] font-bold text-charcoal-light uppercase tracking-wider mb-2">Before Image (Citizen)</span>
                      <div className="h-44 rounded-2xl overflow-hidden border border-charcoal/5 bg-ivory shadow-inner relative flex items-center justify-center">
                        {selectedReport.img ? (
                          <img 
                            src={selectedReport.img} 
                            alt="Before state" 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <span className="text-[11px] text-charcoal-light italic">No initial photo uploaded.</span>
                        )}
                      </div>
                    </div>

                    {/* After Image */}
                    <div>
                      <span className="block text-[10px] font-bold text-charcoal-light uppercase tracking-wider mb-2">After Image (Administration)</span>
                      <div className="h-44 rounded-2xl overflow-hidden border border-charcoal/5 bg-ivory shadow-inner relative flex items-center justify-center text-center p-4">
                        {selectedReport.status === "Resolved" ? (
                          <img 
                            src={selectedReport.afterImg || "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=600"} 
                            alt="Resolved after state" 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <span className="text-[11px] text-coral/80 font-medium italic">
                            Resolution image will appear after the issue is resolved.
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="p-6 bg-ivory border-t border-charcoal/5 flex justify-end">
                <button
                  onClick={() => setSelectedReport(null)}
                  className="px-6 py-2.5 bg-teal text-white rounded-xl font-semibold text-xs shadow-sm hover:bg-teal-light transition-colors cursor-pointer"
                >
                  Close Details
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
