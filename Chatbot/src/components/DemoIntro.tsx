import { useTranslation } from "react-i18next";

interface BadgeItem {
  value: string;
  label: string;
}

interface CapabilityItem {
  icon: string;
  title: string;
  desc: string;
  metric: string;
}

interface DiffItem {
  icon: string;
  text: string;
}

interface DemoIntroProps {
  onNavigate: (page: "chat" | "rag" | "crew") => void;
}

export function DemoIntro({ onNavigate }: DemoIntroProps) {
  const { t } = useTranslation();

  const badges = t("demoIntro.badges", { returnObjects: true }) as BadgeItem[];
  const capabilities = t("demoIntro.capabilities", { returnObjects: true }) as CapabilityItem[];
  const diffItems = t("demoIntro.differentiators", { returnObjects: true }) as DiffItem[];

  return (
    <div className="h-full overflow-y-auto">
      {/* ── Hero ── */}
      <section className="bg-gradient-to-b from-blue-50 to-white px-6 pt-16 pb-12 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4 animate-fade-in-up">
          {t("demoIntro.hero.title")}
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          {t("demoIntro.hero.subtitle")}
        </p>

        {/* Stat badges */}
        <div className="flex justify-center gap-4 flex-wrap animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          {badges.map((b) => (
            <div
              key={b.label}
              className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-3 min-w-[120px]"
            >
              <div className="text-2xl font-bold text-blue-600">{b.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{b.label}</div>
            </div>
          ))}
        </div>

        {/* CTA buttons */}
        <div className="flex justify-center gap-4 mt-8 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          <button
            onClick={() => onNavigate("chat")}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
          >
            {t("demoIntro.cta.chat")}
          </button>
          <button
            onClick={() => onNavigate("rag")}
            className="bg-white text-blue-600 border border-blue-200 px-6 py-2.5 rounded-lg font-medium hover:bg-blue-50 transition-colors shadow-sm"
          >
            {t("demoIntro.cta.rag")}
          </button>
        </div>
      </section>

      {/* ── Capability Cards ── */}
      <section className="px-6 py-12 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {capabilities.map((c, i) => (
            <div
              key={c.title}
              className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow animate-fade-in-up"
              style={{ animationDelay: `${0.4 + i * 0.1}s` }}
            >
              <div className="text-3xl mb-3">{c.icon}</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{c.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-3">{c.desc}</p>
              <span className="inline-block text-xs font-medium bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                {c.metric}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Differentiators ── */}
      <section className="bg-gray-900 text-white px-6 py-10">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {diffItems.map((d) => (
            <div key={d.text} className="animate-fade-in-up">
              <div className="text-2xl mb-1">{d.icon}</div>
              <div className="text-sm text-gray-300">{d.text}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
