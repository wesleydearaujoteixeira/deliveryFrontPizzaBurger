/**
 * Selo da marca: badge vermelho inclinado com um hamburguer e uma
 * fatia de pizza sobrepostos, desenhados em SVG proprio.
 */
export function LogoMark({ className = 'h-10 w-10' }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`flex -rotate-3 items-center justify-center rounded-2xl bg-brand-500
        shadow-lg shadow-brand-500/30 ${className}`}
    >
      <svg viewBox="0 0 48 48" className="h-[82%] w-[82%]" role="img">
        {/* Hamburguer (atras, a esquerda) */}
        <g>
          {/* pao de cima com gergelim */}
          <path d="M4 27a12 9 0 0 1 24 0v1H4z" fill="#FFB52E" />
          <ellipse cx="10.5" cy="21.5" rx="1.1" ry="0.8" fill="#FFF3DC" />
          <ellipse cx="16" cy="19.8" rx="1.1" ry="0.8" fill="#FFF3DC" />
          <ellipse cx="21.5" cy="21.5" rx="1.1" ry="0.8" fill="#FFF3DC" />
          {/* carne */}
          <rect x="4" y="28.6" width="24" height="4.2" rx="2.1" fill="#5C2E11" />
          {/* queijo */}
          <rect x="4" y="33.2" width="24" height="2.4" rx="1.2" fill="#FFD54F" />
          {/* pao de baixo */}
          <rect x="4" y="36" width="24" height="4.6" rx="2.3" fill="#FFB52E" />
        </g>

        {/* Fatia de pizza (na frente, a direita, inclinada) */}
        <g transform="rotate(14 34 24)">
          {/* borda */}
          <rect x="24" y="7" width="20" height="5.5" rx="2.75"
            fill="#FFB52E" stroke="#fff" strokeWidth="1.6" />
          {/* massa */}
          <path d="M25.5 12.5 L42.5 12.5 L34 33.5 Z"
            fill="#FFE0B2" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
          {/* pepperonis */}
          <circle cx="31" cy="17.5" r="2" fill="#D62300" />
          <circle cx="37.5" cy="17" r="2" fill="#D62300" />
          <circle cx="34" cy="24" r="2" fill="#D62300" />
        </g>
      </svg>
    </span>
  );
}

/** Logo completa: selo + wordmark empilhado (wordmark some em telas minusculas). */
export function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark />
      <span className="hidden flex-col leading-none min-[380px]:flex">
        <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-brand-500">
          Pizza &amp; Burger
        </span>
        <span className="font-display text-2xl font-extrabold leading-none text-cocoa dark:text-white">
          Delivery
        </span>
      </span>
    </span>
  );
}
