import { Link } from 'react-router';
import {
  Banknote,
  Clock,
  CreditCard,
  MapPin,
  Phone,
  QrCode,
} from 'lucide-react';
import { LogoMark } from '@/components/Logo';

/* Icones de redes sociais (removidos do lucide-react nas versoes novas) */
function SocialSvg({ path, extra }: { path: string; extra?: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden
    >
      <path d={path} />
      {extra}
    </svg>
  );
}

const InstagramIcon = () => (
  <SocialSvg
    path="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5z"
    extra={
      <>
        <circle cx="12" cy="12" r="4" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </>
    }
  />
);

const FacebookIcon = () => (
  <SocialSvg path="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
);

const TwitterIcon = () => (
  <SocialSvg path="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
);

/** Rodape institucional em marrom bbq, no estilo dos sites de fast-food. */
export function Footer() {
  return (
    <footer className="mt-12 bg-brand-900 text-white/90">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 py-10 sm:py-12 md:grid-cols-4">
        {/* Marca */}
        <div className="col-span-2 flex flex-col gap-3 md:col-span-1">
          <span className="flex items-center gap-2.5">
            <LogoMark className="h-10 w-10" />
            <span className="flex flex-col leading-none">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-accent-400">
                Pizza &amp; Burger
              </span>
              <span className="font-display text-2xl font-extrabold leading-none text-white">
                Delivery
              </span>
            </span>
          </span>
          <p className="max-w-xs text-sm text-white/60">
            Pizza de forno a lenha e smash burgers artesanais, entregues quentinhos na sua porta.
          </p>
          <div className="mt-1 flex gap-2">
            <SocialLink label="Instagram"><InstagramIcon /></SocialLink>
            <SocialLink label="Facebook"><FacebookIcon /></SocialLink>
            <SocialLink label="Twitter"><TwitterIcon /></SocialLink>
          </div>
        </div>

        {/* Navegacao */}
        <nav aria-label="Cardapio" className="flex flex-col gap-2 text-sm">
          <h3 className="mb-1 font-display text-base font-bold text-white">Cardápio</h3>
          <FooterLink to="/">Pizzas</FooterLink>
          <FooterLink to="/">Hambúrgueres</FooterLink>
          <FooterLink to="/">Bebidas</FooterLink>
          <FooterLink to="/">Sobremesas</FooterLink>
        </nav>

        <nav aria-label="Sua conta" className="flex flex-col gap-2 text-sm">
          <h3 className="mb-1 font-display text-base font-bold text-white">Sua conta</h3>
          <FooterLink to="/pedidos">Meus pedidos</FooterLink>
          <FooterLink to="/checkout">Finalizar pedido</FooterLink>
          <FooterLink to="/">Cardápio completo</FooterLink>
        </nav>

        {/* Contato e horario */}
        <div className="col-span-2 flex flex-col gap-2.5 text-sm md:col-span-1">
          <h3 className="mb-1 font-display text-base font-bold text-white">Atendimento</h3>
          <p className="flex items-start gap-2 text-white/70">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent-400" aria-hidden />
            Av. dos Sabores, 1234 — Centro, Fortaleza/CE
          </p>
          <p className="flex items-center gap-2 text-white/70">
            <Phone className="h-4 w-4 shrink-0 text-accent-400" aria-hidden />
            (85) 99999-0000
          </p>
          <p className="flex items-center gap-2 text-white/70">
            <Clock className="h-4 w-4 shrink-0 text-accent-400" aria-hidden />
            Ter a Dom · 18h às 23h30
          </p>
          <div className="mt-1 flex flex-wrap gap-2" aria-label="Formas de pagamento">
            <PaymentChip icon={<QrCode className="h-3.5 w-3.5" aria-hidden />} label="Pix" />
            <PaymentChip icon={<CreditCard className="h-3.5 w-3.5" aria-hidden />} label="Cartão" />
            <PaymentChip icon={<Banknote className="h-3.5 w-3.5" aria-hidden />} label="Dinheiro" />
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4
          py-4 text-center text-xs text-white/50 sm:flex-row sm:text-left">
          <p>© 2026 Delivery Pizza &amp; Burger — projeto de demonstração.</p>
          <p>Feito com muito queijo e React + Spring Boot.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link to={to} className="text-white/70 transition-colors hover:text-accent-400">
      {children}
    </Link>
  );
}

function SocialLink({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <a
      href="#"
      aria-label={label}
      onClick={(e) => e.preventDefault()}
      className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10
        text-white/80 transition-colors hover:bg-brand-500 hover:text-white"
    >
      {children}
    </a>
  );
}

function PaymentChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs
      font-medium text-white/80">
      {icon}
      {label}
    </span>
  );
}
