import { HeroSection } from '../components/landing/HeroSection';
import { FeatureGrid } from '../components/landing/FeatureGrid';
import { BenchmarkSection } from '../components/landing/BenchmarkSection';

export function Landing() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <HeroSection />
      <FeatureGrid />
      <BenchmarkSection />

      <footer className="py-8 px-4 text-center text-[var(--text-tertiary)] text-sm">
        <p>Built by Enterprise AI Systems Studio</p>
      </footer>
    </div>
  );
}
