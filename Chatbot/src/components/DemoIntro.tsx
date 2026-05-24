import { useTranslation } from "react-i18next";

interface Feature {
  icon: string;
  title: string;
  desc: string;
}

export function DemoIntro() {
  const { t } = useTranslation();
  const features = t("demoIntro.features", { returnObjects: true }) as Feature[];

  return (
    <div className="flex-1 flex items-center justify-center px-6 py-8 overflow-y-auto">
      <div className="max-w-lg w-full">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-1">
          {t("demoIntro.title")}
        </h2>
        <p className="text-sm text-gray-500 text-center mb-8">
          {t("demoIntro.subtitle")}
        </p>

        <div className="space-y-4">
          {features.map((f: Feature) => (
            <div
              key={f.title}
              className="bg-white rounded-xl border border-gray-200 px-5 py-4 flex items-start gap-4 shadow-sm"
            >
              <span className="text-2xl shrink-0 mt-0.5">{f.icon}</span>
              <div>
                <h3 className="text-sm font-semibold text-gray-800">
                  {f.title}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-400 text-center mt-6">
          {t("demoIntro.hint")}
        </p>
      </div>
    </div>
  );
}
