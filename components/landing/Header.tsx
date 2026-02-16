import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut } from "@clerk/nextjs";

export function Header() {
  return (
    <header className="w-full py-4 px-6 flex items-center justify-between max-w-7xl mx-auto">
      <Link href="/" className="font-serif text-xl italic text-foreground">
        ForwardSlash.Chat
      </Link>
      <nav className="hidden md:flex items-center gap-8">
        <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          How it works
        </a>
        <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          Pricing
        </a>
        <Link href="/chat/demo" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          Demo
        </Link>
      </nav>
      <div className="flex items-center gap-3">
        <SignedOut>
          <Link href="/sign-in">
            <Button variant="ghost" size="sm">Sign in</Button>
          </Link>
          <Link href="/sign-up">
            <Button size="sm" className="rounded-full bg-foreground text-background hover:bg-foreground/90">
              Get started
            </Button>
          </Link>
        </SignedOut>
        <SignedIn>
          <Link href="/dashboard">
            <Button size="sm" className="rounded-full bg-foreground text-background hover:bg-foreground/90">
              Dashboard
            </Button>
          </Link>
        </SignedIn>
      </div>
    </header>
  );
}
