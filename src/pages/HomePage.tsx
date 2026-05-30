import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { Camera, X, MapPin, AlertCircle, Globe } from "lucide-react";
import ReportCard from "../components/ReportCard";
import { supabase } from "../db/supabaseClient";
import imageCompression from "browser-image-compression";
import { useTranslation } from "react-i18next";
import type { Report, Category } from "../types/types";

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

const LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "mk", label: "Македонски", flag: "🇲🇰" },
  { code: "sq", label: "Shqip", flag: "🇦🇱" },
];

// Always English — these are the raw DB values
const CATEGORY_KEYS: Array<Category | "All"> = [
  "All",
  "Safety",
  "Poor Lighting",
  "Waste / Trash",
  "Broken Infrastructure",
  "Water Problem",
  "Accessibility",
  "Harassment-Risk Area",
  "Parking / Traffic",
  "Campus Issue",
  "IT / Digital Service",
  "Other",
];

function HomePage() {
  const { t, i18n } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [reports, setReports] = useState<Report[]>();

  // Store the raw English key, not the translated label
  const [selectedCategory, setSelectedCategory] = useState<Category | "All">("All");

  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const currentLang = LANGUAGES.find((l) => l.code === i18n.language) ?? LANGUAGES[0];

  const handleLangChange = (code: string) => {
    i18n.changeLanguage(code);
    localStorage.setItem("civiclink_lang", code);
    setLangOpen(false);
  };

  // Translate a category key for display only
  const tCat = (key: Category | "All") =>
    key === "All" ? t("home.cat_all") : t(`category.${key}`, { defaultValue: key });

  useEffect(() => {
    const handler = (e: MouseEvent | TouchEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, []);

  const handlePhotoProcessing = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const options = { maxSizeMB: 1.5, maxWidthOrHeight: 1200, useWebWorker: true };

    try {
      setIsUploading(true);
      setIsModalOpen(false);

      const compressedFile = await imageCompression(file, options);
      const base64 = await fileToBase64(compressedFile);

      const modRes = await fetch(import.meta.env.VITE_MODERATION_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64.split(",")[1] }),
      });

      const moderation = await modRes.json();
      if (moderation.flagged) {
        alert(t("home.image_flagged"));
        return;
      }

      const fileExt = compressedFile.name.split(".").pop() || "jpg";
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `reports/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("report-images")
        .upload(filePath, compressedFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("report-images")
        .getPublicUrl(filePath);

      navigate("/create-report", { state: { imageUrl: publicUrl } });
    } catch (error) {
      console.error("Error uploading image:", error);
      alert(t("wizard.upload_fail"));
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    supabase
      .from("reports")
      .select(`*, institutions (id, name)`)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error(error);
        if (data) setReports(data as Report[]);
      });
  }, []);

  const filteredReports = reports?.filter((report) =>
    selectedCategory === "All" ? true : report.category === selectedCategory
  );

  return (
    <div className="min-h-[calc(100vh-67.5px)] bg-gray-50">

      {isUploading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm">
          <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm font-medium text-gray-900">{t("home.uploading")}</p>
        </div>
      )}

      {/* Sticky top nav */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">

          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gray-900 flex items-center justify-center">
              <MapPin size={13} className="text-white" />
            </div>
            <span className="text-sm font-bold tracking-tight text-gray-900">{t("home.brand")}</span>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">

            {/* Language switcher */}
            <div className="relative" ref={langRef}>
              <button
                onClick={() => setLangOpen((v) => !v)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  langOpen ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Globe size={15} />
                <span className="hidden sm:inline">{currentLang.label}</span>
                <span className="sm:hidden">{currentLang.flag}</span>
              </button>

              {langOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden z-50">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLangChange(lang.code)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                        i18n.language === lang.code
                          ? "bg-gray-900 text-white"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <span className="text-base">{lang.flag}</span>
                      <span className="font-medium">{lang.label}</span>
                      {i18n.language === lang.code && (
                        <span className="ml-auto text-xs opacity-70">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Desktop CTA */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 active:scale-[0.98] transition-all"
            >
              <Camera size={15} />
              {t("home.title")}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
            {t("home.title")}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-gray-500 max-w-lg">
            {t("home.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left column */}
          <div className="lg:col-span-1 space-y-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex items-start gap-3 mb-4">
                <div className="mt-0.5 w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                  <AlertCircle size={17} className="text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{t("home.how_it_works_title")}</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{t("home.how_it_works_body")}</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full rounded-xl bg-gray-900 text-white py-3.5 text-sm font-semibold tracking-wide active:scale-[0.98] transition-transform flex items-center justify-center gap-2 hover:bg-gray-800"
              >
                <Camera size={16} />
                {t("home.start_report")}
              </button>
            </div>

            {/* Desktop category filter */}
            <div className="hidden lg:block rounded-2xl border border-gray-200 bg-white p-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
                {t("home.filter_category")}
              </p>
              <div className="flex flex-wrap gap-2">
                {CATEGORY_KEYS.map((key) => (
                  <button
                    key={key}
                    onClick={() => setSelectedCategory(key)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                      key === selectedCategory
                        ? "bg-gray-900 text-white"
                        : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {tCat(key)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right column — Feed */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900">{t("home.recent_reports")}</h2>
              <Link to="/reports">
                <button className="text-sm text-gray-400 font-medium hover:text-gray-600 transition-colors">
                  {t("home.view_all")}
                </button>
              </Link>
            </div>

            {/* Mobile category pills */}
            <div className="flex gap-2 overflow-x-auto pb-3 mb-4 lg:hidden scrollbar-none">
              {CATEGORY_KEYS.map((key) => (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                    key === selectedCategory
                      ? "bg-gray-900 text-white"
                      : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {tCat(key)}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {filteredReports?.map((report, index) => (
                <ReportCard key={index} report={report} />
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Mobile FAB */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-20 right-4 sm:hidden z-40 flex items-center gap-2 px-5 py-3.5 rounded-full bg-gray-900 text-white text-sm font-semibold shadow-lg active:scale-[0.97] transition-transform"
      >
        <Camera size={16} />
        {t("home.start_report")}
      </button>

      <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} onChange={handlePhotoProcessing} className="hidden" />
      <input type="file" accept="image/*" ref={fileInputRef} onChange={handlePhotoProcessing} className="hidden" />

      {/* Bottom sheet modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full sm:max-w-sm bg-white rounded-t-3xl sm:rounded-2xl p-6 pb-10 sm:pb-6 border-t sm:border border-gray-100 mx-0 sm:mx-4">
            <div className="w-10 h-1 rounded-full bg-gray-200 mx-auto mb-5 sm:hidden" />
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-semibold text-gray-900">{t("wizard.step_photo_title")}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{t("wizard.step_photo_subtitle")}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
                <X size={16} />
              </button>
            </div>
            <div className="space-y-2.5">
              <button
                onClick={() => cameraInputRef.current?.click()}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl bg-gray-900 text-white text-sm font-semibold active:scale-[0.98] transition-transform hover:bg-gray-800"
              >
                <Camera size={18} />
                {t("wizard.take_photo")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomePage;
