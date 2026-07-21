import { MapPin, Navigation, Clock } from 'lucide-react';

/** Dados da loja. Troque o endereco/coordenadas que o mapa acompanha. */
const STORE = {
  address: 'R. 49, 37, Maracanaú, Ceará, Brasil, 61901-110',
  hours: 'Ter a Dom · 18h às 23h30',
  lat: -3.8815283,
  lon: -38.6182758,
};

// Recorte do mapa em volta da loja (quanto menor o delta, mais zoom).
const D_LAT = 0.004;
const D_LON = 0.006;
const bbox = [STORE.lon - D_LON, STORE.lat - D_LAT, STORE.lon + D_LON, STORE.lat + D_LAT].join(',');

// OpenStreetMap: embed keyless e confiavel (nao precisa de API key).
const mapSrc =
  `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${STORE.lat},${STORE.lon}`;
// Botao de rotas abre o Google Maps (link comum, funciona em qualquer device).
const directionsHref = `https://www.google.com/maps/dir/?api=1&destination=${STORE.lat},${STORE.lon}`;

/** Secao de localizacao com mapa embutido, exibida antes do rodape. */
export function Location() {
  return (
    <section aria-label="Nossa localização" className="mx-auto w-full max-w-6xl px-4 pb-4">
      <div
        className="overflow-hidden rounded-3xl border border-zinc-200 bg-surface-light shadow-sm
          dark:border-zinc-800 dark:bg-surface-dark-2"
      >
        <div className="grid md:grid-cols-[1.5fr_1fr]">
          {/* Mapa */}
          <div className="relative aspect-[16/10] w-full md:aspect-auto md:min-h-[300px]">
            <iframe
              title="Mapa da nossa loja"
              src={mapSrc}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 h-full w-full border-0"
            />
          </div>

          {/* Info */}
          <div className="flex flex-col justify-center gap-4 p-6 sm:p-8">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-brand-500">
                Onde estamos
              </span>
              <h2 className="mt-1 font-display text-2xl font-extrabold text-cocoa dark:text-zinc-100">
                Venha nos visitar
              </h2>
            </div>

            <p className="flex items-start gap-2.5 text-sm text-zinc-600 dark:text-zinc-300">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand-500" aria-hidden />
              {STORE.address}
            </p>
            <p className="flex items-center gap-2.5 text-sm text-zinc-600 dark:text-zinc-300">
              <Clock className="h-5 w-5 shrink-0 text-brand-500" aria-hidden />
              {STORE.hours}
            </p>

            <a
              href={directionsHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit items-center gap-2 rounded-full bg-brand-500 px-5 py-2.5
                text-sm font-bold text-white transition-colors hover:bg-brand-600"
            >
              <Navigation className="h-4 w-4" aria-hidden />
              Como chegar
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
