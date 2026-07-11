import { Link } from 'react-router-dom';
import { Instagram, Linkedin, Twitter } from 'lucide-react';
import { CATEGORIES } from '@/shared/config';

export function Footer() {
  return (
    <footer className="relative mt-24 border-t border-border bg-card">
      <div className="container grid gap-10 py-16 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl gradient-ember font-display text-lg font-bold text-white">
              G
            </span>
            <span className="font-display text-xl font-bold">Gofla</span>
          </Link>
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">
            Snap, match and shop smarter. Premium shoes, bags, wallets, jackets, belts and more —
            curated for the way you actually live.
          </p>
          <div className="mt-6 flex gap-3">
            {[Instagram, Twitter, Linkedin].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="grid h-10 w-10 place-items-center rounded-full border border-border transition hover:border-primary hover:text-primary"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <FooterCol title="Shop" links={CATEGORIES.map((c) => ({ label: c.name, to: `/category/${c.slug}` }))} />
        <FooterCol
          title="Company"
          links={[
            { label: 'About', to: '#' },
            { label: 'Careers', to: '#' },
            { label: 'Sustainability', to: '#' },
            { label: 'Press', to: '#' },
          ]}
        />
        <FooterCol
          title="Help"
          links={[
            { label: 'Shipping & Returns', to: '#' },
            { label: 'Track Order', to: '/orders' },
            { label: 'Contact', to: '#' },
            { label: 'FAQ', to: '#' },
          ]}
        />
      </div>

      <div className="border-t border-border">
        <div className="container flex flex-col items-center justify-between gap-2 py-6 text-xs text-muted-foreground md:flex-row">
          <p>© {new Date().getFullYear()} Gofla. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Refund Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { label: string; to: string }[] }) {
  return (
    <div>
      <h4 className="mb-4 text-sm font-semibold">{title}</h4>
      <ul className="space-y-2.5 text-sm text-muted-foreground">
        {links.map((l) => (
          <li key={l.label}>
            <Link to={l.to} className="transition hover:text-foreground">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
