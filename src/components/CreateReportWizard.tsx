import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { X, ChevronRight, ChevronLeft, MapPin, Camera, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { supabase } from "../db/supabaseClient";
import type { Category, Urgency } from "../types/types";
import { institutions } from "../data/institutions";

const CATEGORY_KEYS: Category[] = [
  "Safety", "Poor Lighting", "Waste / Trash", "Broken Infrastructure",
  "Water Problem", "Accessibility", "Harassment-Risk Area",
  "Parking / Traffic", "Campus Issue", "IT / Digital Service", "Other",
];

const URGENCY_KEYS: Urgency[] = ["Low", "Medium", "High"];

type FormData = {
  imageUrl: string;
  title: string;
  description: string;
  category: Category | "";
  urgency: Urgency | "";
  location_name: string;
  latitude: number | null;
  longitude: number | null;
  contact_email: string;
  institution_id: string | null;
  anonymous: boolean;
};

export function CreateReportWizard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const passedImageUrl = location.state?.imageUrl ?? "";

  const [step, setStep] = useState(passedImageUrl ? 1 : 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [institutionQuery, setInstitutionQuery] = useState("");
  const [institutionOpen, setInstitutionOpen] = useState(false);

  const institutionWrapperRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<HTMLInputElement>(null);
  // @ts-ignore
  const autocompleteInstance = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    const input = autocompleteRef.current;
    if (!input) return;
    // @ts-ignore
    if (!window.google?.maps?.places) return;
    // @ts-ignore
    const ac = new google.maps.places.Autocomplete(input, { types: ["geocode"] });
    ac.setFields(["formatted_address", "geometry"]);
    ac.addListener("place_changed", () => {
      const place = ac.getPlace();
      set("location_name", place.formatted_address || "");
      set("latitude", place.geometry?.location?.lat() ?? null);
      set("longitude", place.geometry?.location?.lng() ?? null);
    });
    // @ts-ignore
    return () => google.maps.event.clearInstanceListeners(ac);
  }, [autocompleteRef.current]);

  useEffect(() => {
    const handleOutside = (e: MouseEvent | TouchEvent) => {
      if (institutionWrapperRef.current && !institutionWrapperRef.current.contains(e.target as Node)) {
        setInstitutionOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
    };
  }, []);

  const [form, setForm] = useState<FormData>({
    imageUrl: passedImageUrl,
    title: "", description: "", category: "", urgency: "",
    location_name: "", latitude: null, longitude: null,
    contact_email: "", anonymous: true, institution_id: null,
  });

  const set = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fileExt = file.name.split(".").pop() || "jpg";
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `reports/${fileName}`;
    const { error } = await supabase.storage.from("report-images").upload(filePath, file);
    if (error) { alert(t("wizard.upload_fail")); return; }
    const { data: { publicUrl } } = supabase.storage.from("report-images").getPublicUrl(filePath);
    set("imageUrl", publicUrl);
    setStep(1);
  };

  const detectLocation = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        set("latitude", pos.coords.latitude);
        set("longitude", pos.coords.longitude);
        set("location_name", `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`);
        setIsLocating(false);
      },
      () => setIsLocating(false)
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from("reports").insert({
        user_id: user?.id ?? null,
        title: form.title,
        description: form.description,
        category: form.category || null,
        urgency: form.urgency || null,
        status: "Submitted",
        location_name: form.location_name || null,
        latitude: form.latitude,
        longitude: form.longitude,
        image_url: form.imageUrl || null,
        institution_id: form.institution_id,
        anonymous: form.anonymous,
        contact_email: form.contact_email || null,
        upvotes: 0,
        downvotes: 0,
        safety_related: form.category === "Safety" || form.category === "Harassment-Risk Area",
      });
      if (error) throw error;
      navigate("/reports", { state: { submitted: true } });
    } catch (err) {
      console.error(err);
      alert(t("wizard.submit_fail"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredInstitutions = institutions.filter((i) =>
    i.name.toLowerCase().includes(institutionQuery.toLowerCase())
  );
  const selectedInstitution = institutions.find((i) => i.id === form.institution_id);
  const canAdvanceStep1 = form.title.trim().length > 3 && form.category !== "" && form.urgency !== "";
  const canSubmit = form.location_name.trim().length > 0;

  return (
    <div className="min-h-screen bg-white max-w-lg mx-auto px-4 pt-6 pb-24">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-500">
          <X size={18} />
        </button>
        <h1 className="text-base font-semibold text-gray-900">{t("wizard.new_report")}</h1>
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all ${i <= step ? "bg-gray-900 w-6" : "bg-gray-200 w-3"}`} />
          ))}
        </div>
      </div>

      {/* Step 0 — Photo */}
      {step === 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">{t("wizard.step_photo_title")}</h2>
          <p className="text-sm text-gray-500 mb-6">{t("wizard.step_photo_subtitle")}</p>

          <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} onChange={handleFileChange} className="hidden" />
          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />

          <div className="space-y-3">
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="w-full flex items-center gap-3 px-4 py-4 rounded-xl bg-gray-900 text-white text-sm font-semibold active:scale-[0.98] transition-transform"
            >
              <Camera size={18} />
              {t("wizard.take_photo")}
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center gap-3 px-4 py-4 rounded-xl border border-gray-200 text-gray-900 text-sm font-semibold active:scale-[0.98] transition-transform hover:bg-gray-50"
            >
              {t("wizard.upload_gallery")}
            </button>
            <button onClick={() => setStep(1)} className="w-full py-3 text-sm text-gray-400 hover:text-gray-600 transition-colors">
              {t("wizard.skip_photo")}
            </button>
          </div>
        </div>
      )}

      {/* Step 1 — Details */}
      {step === 1 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">{t("wizard.step_details_title")}</h2>
          <p className="text-sm text-gray-500 mb-6">{t("wizard.step_details_subtitle")}</p>

          {form.imageUrl && (
            <div className="relative mb-5">
              <img src={form.imageUrl} alt="Preview" className="w-full h-44 object-cover rounded-xl" />
              <button
                onClick={() => { set("imageUrl", ""); setStep(0); }}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center text-gray-600 hover:bg-white"
              >
                <X size={14} />
              </button>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">{t("wizard.title_label")}</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder={t("wizard.title_placeholder")}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">{t("wizard.description_label")}</label>
              <textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder={t("wizard.description_placeholder")}
                rows={3}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-colors resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">{t("wizard.category_label")}</label>
              <select
                value={form.category}
                onChange={(e) => set("category", e.target.value as Category)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-colors"
              >
                <option value="">{t("wizard.category_placeholder")}</option>
                {CATEGORY_KEYS.map((c) => (
                  <option key={c} value={c}>{t(`category.${c}`, { defaultValue: c })}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">{t("wizard.urgency_label")}</label>
              <div className="grid grid-cols-3 gap-2">
                {URGENCY_KEYS.map((u) => (
                  <button
                    key={u}
                    onClick={() => set("urgency", u)}
                    className={`px-3 py-2.5 rounded-xl border text-left transition-colors ${
                      form.urgency === u
                        ? "border-gray-900 bg-gray-900 text-white"
                        : "border-gray-200 hover:border-gray-300 text-gray-700"
                    }`}
                  >
                    <div className="text-xs font-semibold">{t(`urgency.${u}`)}</div>
                    <div className={`text-xs mt-0.5 ${form.urgency === u ? "text-gray-300" : "text-gray-400"}`}>
                      {t(`urgency.${u.toLowerCase()}_desc`)}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <button
              onClick={() => setStep(0)}
              className="flex items-center gap-1 px-4 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft size={16} />
              {t("wizard.back")}
            </button>
            <button
              onClick={() => setStep(2)}
              disabled={!canAdvanceStep1}
              className="flex-1 flex items-center justify-center gap-1 py-3 rounded-xl bg-gray-900 text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
            >
              {t("wizard.next")} <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Step 2 — Location */}
      {step === 2 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">{t("wizard.step_location_title")}</h2>
          <p className="text-sm text-gray-500 mb-6">{t("wizard.step_location_subtitle")}</p>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">{t("wizard.address_label")}</label>
              <input
                ref={autocompleteRef}
                type="text"
                defaultValue={form.location_name}
                onChange={(e) => set("location_name", e.target.value)}
                placeholder={t("wizard.address_placeholder")}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-colors"
              />
            </div>

            <button
              onClick={detectLocation}
              disabled={isLocating}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isLocating ? <Loader2 size={16} className="animate-spin" /> : <MapPin size={16} />}
              {isLocating ? t("wizard.detecting") : t("wizard.use_location")}
            </button>

            {form.latitude && form.longitude && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 border border-green-100">
                <MapPin size={14} className="text-green-700 shrink-0" />
                <span className="text-xs text-green-800 font-medium">
                  {t("wizard.gps_locked")} · {form.latitude.toFixed(4)}, {form.longitude.toFixed(4)}
                </span>
              </div>
            )}
          </div>

          {/* Institution picker */}
          <div className="mt-4">
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
              {t("wizard.institution_label")}
            </label>
            <div className="relative" ref={institutionWrapperRef}>
              <input
                value={institutionOpen ? institutionQuery : selectedInstitution?.name || ""}
                onChange={(e) => { setInstitutionQuery(e.target.value); setInstitutionOpen(true); }}
                onFocus={() => setInstitutionOpen(true)}
                placeholder={t("wizard.institution_placeholder")}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-colors"
              />
              {institutionOpen && (
                <div className="absolute z-20 mt-2 w-full max-h-56 overflow-auto bg-white border border-gray-200 rounded-xl shadow">
                  {filteredInstitutions.length === 0 ? (
                    <div className="p-3 text-sm text-gray-500">{t("wizard.no_results")}</div>
                  ) : (
                    filteredInstitutions.map((inst) => (
                      <button
                        key={inst.id}
                        onClick={() => { set("institution_id", inst.id); setInstitutionQuery(inst.name); setInstitutionOpen(false); }}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50"
                      >
                        <div className="text-sm font-medium">{inst.name}</div>
                        <div className="text-xs text-gray-400">{inst.type} · {inst.location}</div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
            {selectedInstitution && (
              <p className="text-xs text-gray-500 mt-2">
                {t("wizard.institution_selected")}{" "}
                <span className="font-medium text-gray-700">{selectedInstitution.name}</span>
              </p>
            )}
          </div>

          {/* Summary */}
          <div className="mt-6 p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t("wizard.summary")}</p>
            <p className="text-sm font-semibold text-gray-900">{form.title || "—"}</p>
            <p className="text-xs text-gray-500">
              {form.category ? t(`category.${form.category}`, { defaultValue: form.category }) : "—"} ·{" "}
              {form.urgency ? t(`urgency.${form.urgency}`) : "—"} {t("wizard.urgency_suffix")} ·{" "}
              {form.anonymous ? t("wizard.anonymous_label") : t("wizard.named_label")}
            </p>
          </div>

          <div className="flex gap-3 mt-8">
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-1 px-4 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft size={16} />
              {t("wizard.back")}
            </button>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit || isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-900 text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
            >
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              {isSubmitting ? t("wizard.submitting") : t("wizard.submit")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
