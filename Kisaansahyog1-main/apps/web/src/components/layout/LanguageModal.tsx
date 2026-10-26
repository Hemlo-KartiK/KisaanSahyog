import { Check, Globe, X } from "lucide-react";
import { getDictionary, type Language } from "@kisaansahyog/shared";
import { useAppStore } from "../../store/useAppStore";

const languageOptions: Array<{ code: Language; native: string; english: string }> = [
  { code: "hi", native: "हिंदी", english: "Hindi" },
  { code: "en", native: "English", english: "English" },
  { code: "pa", native: "ਪੰਜਾਬੀ", english: "Punjabi" },
  { code: "mr", native: "मराठी", english: "Marathi" },
];

export function LanguageModal() {
  const language = useAppStore((state) => state.language);
  const isLanguageModalOpen = useAppStore((state) => state.isLanguageModalOpen);
  const setLanguage = useAppStore((state) => state.setLanguage);
  const setLanguageModalOpen = useAppStore((state) => state.setLanguageModalOpen);
  const dictionary = getDictionary(language);

  if (!isLanguageModalOpen) {
    return null;
  }

  return (
    <div
      role="presentation"
      onClick={() => setLanguageModalOpen(false)}
      className="fixed inset-0 z-50 flex items-end justify-center bg-soil-deep/50"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="language-modal-title"
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-md rounded-t-[2rem] border border-cream-border bg-cream-card p-5 pb-8 shadow-sheet"
      >
        <div className="mx-auto h-1 w-10 rounded-full bg-cream-border" />

        <div className="mt-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-leaf-soft text-leaf-deep">
              <Globe size={21} aria-hidden="true" />
            </span>
            <div>
              <h2 id="language-modal-title" className="text-lg font-bold">
                {dictionary.common.changeLanguage}
              </h2>
              <p className="text-xs text-soil-brown">
                {dictionary.common.language}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setLanguageModalOpen(false)}
            aria-label={dictionary.common.close}
            className="flex h-11 w-11 min-h-[48px] min-w-[48px] items-center justify-center rounded-full bg-cream-bg text-soil-brown transition hover:bg-cream-tan"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="mt-4 space-y-2">
          {languageOptions.map((option) => {
            const isSelected = language === option.code;

            return (
              <button
                key={option.code}
                type="button"
                onClick={() => {
                  setLanguage(option.code);
                  setLanguageModalOpen(false);
                }}
                className={`flex min-h-[56px] w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
                  isSelected
                    ? "border-leaf-green bg-leaf-soft text-leaf-deep"
                    : "border-cream-border bg-cream-bg/60 text-soil-text hover:bg-cream-tan/40"
                }`}
              >
                <div>
                  <p className="text-base font-semibold">{option.native}</p>
                  <p className="text-xs text-soil-brown">{option.english}</p>
                </div>
                {isSelected && <Check size={20} aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
