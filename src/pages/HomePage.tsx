import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import type { Institution } from "../types";
import { reports } from "../data/reports";
import ReportCard from "../components/ReportCard";
import { supabase } from "../db/supabaseClient";

type HomePageProps = {
  institution: Institution;
};

function HomePage({ institution }: HomePageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoProcessing = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setIsModalOpen(false);

      // 1. Generate a unique filename to prevent overwrites
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `reports/${fileName}`;

      // 2. Upload file to your Supabase bucket (Make sure a bucket named 'images' exists!)
      const { error: uploadError } = await supabase.storage
        .from("report-images") 
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 3. Get the public asset URL
      const { data: { publicUrl } } = supabase.storage
        .from("report-images")
        .getPublicUrl(filePath);

      // 4. Send user to the form page, passing the photo URL and current institution along in state
      navigate("/create-report", { 
        state: { 
          imageUrl: publicUrl,
          institution: institution 
        } 
      });

    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="animate-[fadeUp_0.3s_ease]">
      {/* Loading Overlay */}
      {isUploading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500 mb-4"></div>
          <p className="font-bold">Uploading photo to server...</p>
        </div>
      )}

      {/* Banner Card */}
      <div className="rounded-[2rem] border border-white/15 bg-gradient-to-br from-sky-400/30 to-violet-600/25 p-7">
        <span className="text-sky-200 text-sm font-bold">{institution.city}</span>
        <h1 className="mt-3 text-4xl font-black tracking-tight leading-tight">
          Welcome to {institution.name}
        </h1>
        <p className="mt-4 text-slate-200 leading-7">{institution.description}</p>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="mt-6 w-full rounded-2xl bg-white text-slate-950 py-4 font-extrabold active:scale-[0.98] transition-transform"
        >
          Report a Problem
        </button>
      </div>

      {/* Feed Layout */}
      <div className="mt-8 mb-4 flex items-center justify-between">
        <h3 className="font-bold text-lg">Recent reports</h3>
        <button className="text-sky-300 font-bold">View all</button>
      </div>

      <div className="space-y-3">
        {reports.map((report, index) => (
          <ReportCard key={index} report={report} />
        ))}
      </div>

      {/* Hidden Native Input Triggers */}
      <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} onChange={handlePhotoProcessing} className="hidden" />
      <input type="file" accept="image/*" ref={fileInputRef} onChange={handlePhotoProcessing} className="hidden" />

      {/* Bottom Modal Menu */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="absolute inset-0" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-[420px] bg-[#0f1d30] border border-white/10 rounded-3xl p-6 shadow-2xl animate-[slideUp_0.25s_ease-out]">
            <h4 className="text-xl font-bold text-center mb-5 text-white">Add a Photo of the Problem</h4>
            <div className="space-y-3">
              <button onClick={() => cameraInputRef.current?.click()} className="w-full py-4 px-5 rounded-2xl bg-sky-500 hover:bg-sky-600 font-bold text-white flex items-center justify-center gap-3">
                📸 Take a Photo
              </button>
              <button onClick={() => fileInputRef.current?.click()} className="w-full py-4 px-5 rounded-2xl bg-white/10 hover:bg-white/15 font-bold text-white flex items-center justify-center gap-3">
                📁 Upload from Gallery
              </button>
              <button onClick={() => setIsModalOpen(false)} className="w-full py-4 text-slate-400 hover:text-white font-medium">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomePage;
