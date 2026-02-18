"use client";

import { useState, Suspense } from "react";
import { Header } from "@/components/landing/Header";
import { HeroSection } from "@/components/landing/HeroSection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { PricingSection } from "@/components/landing/PricingSection";
import { FaqSection } from "@/components/landing/FaqSection";
import { CtaSection } from "@/components/landing/CtaSection";
import { Footer } from "@/components/landing/Footer";
import { ScanModal } from "@/components/ScanModal";

export default function HomePage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [scanUrl, setScanUrl] = useState("https://example.com");

  const handleScanClick = (url: string) => {
    setScanUrl(url);
    setModalOpen(true);
  };

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <HeroSection onScanClick={handleScanClick} />
      <HowItWorks />
      <Suspense
        fallback={
          <section id="pricing" className="py-24 px-6 bg-slate-50 dark:bg-slate-950/50">
            <div className="max-w-2xl mx-auto text-center">
              <div className="h-10 bg-muted/50 rounded w-48 mx-auto mb-4" />
              <div className="h-5 bg-muted/30 rounded w-80 mx-auto mb-12" />
              <div className="h-64 rounded-xl bg-muted/30 border border-border" />
            </div>
          </section>
        }
      >
        <PricingSection />
      </Suspense>
      <FaqSection />
      <CtaSection />
      <Footer />

      <ScanModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        url={scanUrl}
        onScanComplete={(url) => setScanUrl(url)}
      />
    </main>
  );
}
