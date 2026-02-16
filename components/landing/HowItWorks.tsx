import { Globe, CreditCard, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <span className="inline-block px-4 py-1.5 text-sm border rounded-full mb-6 text-muted-foreground">
            How it works
          </span>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-balance text-foreground">
            From your website to
            <br />
            a live chatbot in days
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Scan your site, choose a bundle, pay once. We train your AI, set up hosting, and deliver at your subdomain.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <Globe className="w-7 h-7 text-muted-foreground" />
            </div>
            <h3 className="font-serif text-xl md:text-2xl mb-2 text-foreground">1. Scan your site</h3>
            <p className="text-muted-foreground text-sm">
              Enter your URL. We crawl your pages and show you exactly what we found. Pick your tier based on page count.
            </p>
          </div>
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-7 h-7 text-muted-foreground" />
            </div>
            <h3 className="font-serif text-xl md:text-2xl mb-2 text-foreground">2. Pay once</h3>
            <p className="text-muted-foreground text-sm">
              Choose a 1–5 year bundle. One payment covers creation, hosting, and maintenance. No monthly fees.
            </p>
          </div>
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <Zap className="w-7 h-7 text-muted-foreground" />
            </div>
            <h3 className="font-serif text-xl md:text-2xl mb-2 text-foreground">3. Get your chatbot</h3>
            <p className="text-muted-foreground text-sm">
              Add a CNAME record. Your AI chatbot goes live at chat.yourdomain.com. Trained on your content, branded to match.
            </p>
          </div>
        </div>

        <div className="text-center mt-16">
          <Button asChild className="rounded-full bg-foreground text-background hover:bg-foreground/90 px-6">
            <a href="#scan">Scan your website</a>
          </Button>
        </div>
      </div>
    </section>
  );
}
