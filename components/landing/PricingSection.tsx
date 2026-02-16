import { Button } from "@/components/ui/button";

const tiers = [
  { name: "1-Year Starter", price: 550, years: 1 },
  { name: "2-Year Bundle", price: 850, years: 2, badge: "Recommended" },
  { name: "3-Year Bundle", price: 1250, years: 3 },
  { name: "4-Year Bundle", price: 1600, years: 4 },
  { name: "5-Year Bundle", price: 1950, years: 5 },
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 px-6 bg-background">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl md:text-4xl text-foreground">Simple pricing</h2>
          <p className="mt-4 text-muted-foreground">
            One upfront payment. Hosting included. Renewal optional at $495/year after.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative rounded-xl border bg-card p-6 ${
                tier.badge ? "border-primary shadow-md" : "border-border"
              }`}
            >
              {tier.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                  {tier.badge}
                </span>
              )}
              <h3 className="font-medium text-foreground">{tier.name}</h3>
              <p className="mt-2 text-2xl font-semibold text-foreground">${tier.price}</p>
              <p className="text-sm text-muted-foreground">{tier.years} year{tier.years > 1 ? "s" : ""}</p>
              <Button asChild variant={tier.badge ? "default" : "outline"} size="sm" className="w-full mt-4">
                <a href="#scan">Get started</a>
              </Button>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          +$99 optional: Help with DNS setup. Scan your site to see your recommended tier.
        </p>
      </div>
    </section>
  );
}
