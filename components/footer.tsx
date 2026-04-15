import Link from "next/link";
import { siteConfig } from "@/data/site";

export function Footer() {
  return (
    <footer className="border-t bg-background pt-16 pb-8 md:pt-24 md:pb-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row md:items-start">
          <div className="flex flex-col items-center md:items-start md:max-w-xs">
            <Link href="/" className="mb-6 text-2xl font-bold tracking-tighter">
              {siteConfig.name}
            </Link>
            <p className="mb-6 text-center text-sm leading-relaxed text-muted-foreground md:text-left">
              {siteConfig.description}
            </p>
          </div>

          <div className="flex flex-col items-center gap-8 md:flex-row md:gap-16">
            <div className="flex flex-col items-center md:items-start">
              <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-muted-foreground">Company</h4>
              <ul className="flex flex-col items-center gap-3 md:items-start">
                {siteConfig.footer.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm font-medium hover:text-primary transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col items-center md:items-start">
              <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-muted-foreground">Resources</h4>
              <ul className="flex flex-col items-center gap-3 md:items-start">
                <li>
                  <Link href="/help" className="text-sm font-medium hover:text-primary transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="text-sm font-medium hover:text-primary transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/developers" className="text-sm font-medium hover:text-primary transition-colors">
                    Developers
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t pt-8 md:mt-24 md:flex-row">
          <p className="text-xs text-muted-foreground">
            {siteConfig.footer.copyright}
          </p>
          <div className="flex items-center gap-6">
            <Link href="#" className="text-xs text-muted-foreground hover:text-primary">
              Twitter
            </Link>
            <Link href="#" className="text-xs text-muted-foreground hover:text-primary">
              LinkedIn
            </Link>
            <Link href="#" className="text-xs text-muted-foreground hover:text-primary">
              GitHub
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
