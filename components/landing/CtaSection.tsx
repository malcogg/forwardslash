import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="relative py-32 px-6 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#e8f5e9]/40 via-[#e3f2fd]/40 to-[#f3e5f5]/30" />

      <div className="relative max-w-3xl mx-auto text-center">
        <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl mb-4 text-foreground">
          Get your AI chatbot today
        </h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          One payment. Your domain. No monthly fees. Scan your site and see your price.
        </p>
        <Button asChild className="rounded-full bg-foreground text-background hover:bg-foreground/90 px-6">
          <a href="#scan">Scan your website</a>
        </Button>
      </div>
    </section>
  );
}
