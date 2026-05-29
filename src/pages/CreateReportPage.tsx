import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { supabase } from "../db/supabaseClient";
import type { Institution } from "../types";

function CreateReportPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Extract the passed data bundle from router history state
  const state = location.state as { imageUrl?: string; institution?: Institution } | null;
  const imageUrl = state?.imageUrl;
  const institution = state?.institution;

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("Low");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Safety protection fallback: if someone refreshes this raw page path directly, kick them home
  useEffect(() => {
    if (!imageUrl || !institution) {
      navigate("/", { replace: true });
    }
  }, [imageUrl, institution, navigate]);

  if (!imageUrl || !institution) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);

      // Save the structured payload row into your Supabase Data Table
      const { error } = await supabase
        .from("reports") // Make sure you have a table named 'reports'
        .insert([
          {
            title,
            description,
            severity,
            image_url: imageUrl,
            institution_id: institution.id,
            institution_name: institution.name,
          },
        ]);

      if (error) throw error;

      alert("Report submitted successfully!");
      // Send them back to the platform homepage view
      navigate("/platform", { state: { institution } });

    } catch (error) {
      console.error("Error saving data:", error);
      alert("Failed to submit report details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#081220] text-white max-w-[460px] mx-auto border-x border-white/10 p-5 pb-12">
      <header className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => navigate("/platform", { state: { institution } })}
          className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center font-bold"
        >
          ←
        </button>
        <h1 className="text-xl font-bold">New Issue Report</h1>
      </header>

      {/* Uploaded Image Preview */}
      <div className="w-full h-48 rounded-2xl overflow-hidden border border-white/10 mb-6 bg-slate-900">
        <img src={imageUrl} alt="Problem Preview" className="w-full h-full object-cover" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">Selected Institution</label>
          <input 
            type="text" 
            value={institution.name} 
            disabled 
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 font-semibold"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Title</label>
          <input 
            type="text" 
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Broken water fountain, cracked window"
            className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white focus:border-sky-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
          <textarea 
            rows={4}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide context about where the issue is and what needs fixing..."
            className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white focus:border-sky-500 focus:outline-none resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Severity Level</label>
          <select 
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white focus:border-sky-500 focus:outline-none"
          >
            <option value="Low">🟢 Low Priority</option>
            <option value="Medium">🟡 Medium Priority</option>
            <option value="High">🔴 High Critical Priority</option>
          </select>
        </div>

        <button 
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 mt-4 rounded-xl bg-sky-500 font-extrabold text-white transition-all hover:bg-sky-600 disabled:bg-sky-500/50"
        >
          {isSubmitting ? "Submitting Report..." : "Submit Report Entry"}
        </button>
      </form>
    </main>
  );
}

export default CreateReportPage;
