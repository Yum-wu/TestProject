import { useTranslation } from "react-i18next";

/** Language switcher button — toggles between EN / 中文 */
export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const isEn = i18n.language?.startsWith("en");

  const toggle = () => {
    i18n.changeLanguage(isEn ? "zh" : "en");
  };

  return (
    <button
      onClick={toggle}
      className="text-xs font-medium px-2.5 py-1 rounded-md border border-gray-300 text-gray-500 hover:text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-colors shrink-0"
      title={isEn ? "切换到中文" : "Switch to English"}
      aria-label={isEn ? "切换到中文" : "Switch to English"}
    >
      {isEn ? "中文" : "EN"}
    </button>
  );
}
