import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Carrossel de destaque do topo: fotos reais de gente feliz comendo
 * (Unsplash), com autoplay, setas para navegar com o mouse e bolinhas.
 */
const SLIDES = [
  {
    image:
      'https://images.unsplash.com/photo-1622455331494-966b1b4eda44?auto=format&fit=crop&w=1600&q=70',
    title: 'Pizza no forno, burger na chapa.',
    highlight: 'Chega quentinho.',
    subtitle: 'Peça online e acompanhe seu pedido em tempo real.',
  },
  {
    image:
      'https://images.unsplash.com/photo-1568901839061-11e2837cd2b7?auto=format&fit=crop&w=1600&q=70',
    title: 'Fome de burger?',
    highlight: 'A chapa já está quente.',
    subtitle: 'Smash, cheddar e bacon esperando por você.',
  },
  {
    image:
      'https://images.unsplash.com/photo-1679598077423-4fd4849086e0?auto=format&fit=crop&w=1600&q=70',
    title: 'Aquela fatia perfeita',
    highlight: 'existe. E entrega.',
    subtitle: 'Massa artesanal, forno a lenha e muito recheio.',
  },
  {
    image:
      'https://images.unsplash.com/photo-1698281964068-be15d9e587bc?auto=format&fit=crop&w=1600&q=70',
    title: 'Junta a galera',
    highlight: 'que a gente leva o resto.',
    subtitle: 'Combos, fritas e bebidas geladas até sua porta.',
  },
  {
    image:
      'https://images.unsplash.com/photo-1658951865313-394706e1364d?auto=format&fit=crop&w=1600&q=70',
    title: 'Noite de pizza com os amigos?',
    highlight: 'Deixa com a gente.',
    subtitle: 'Pizzas grandes, precos de amigo e entrega rapidinha.',
  },
];

const INTERVAL_MS = 5000;

export function HeroCarousel() {
  const [current, setCurrent] = useState(0);

  // Depender de `current` reinicia o timer apos navegacao manual
  useEffect(() => {
    const timer = setInterval(
      () => setCurrent((i) => (i + 1) % SLIDES.length),
      INTERVAL_MS,
    );
    return () => clearInterval(timer);
  }, [current]);

  const previous = () => setCurrent((i) => (i - 1 + SLIDES.length) % SLIDES.length);
  const next = () => setCurrent((i) => (i + 1) % SLIDES.length);

  return (
    <section
      aria-label="Destaques"
      className="group relative h-72 overflow-hidden rounded-3xl sm:h-96 md:h-[30rem] lg:h-[34rem]"
    >
      {SLIDES.map((slide, index) => (
        <div
          key={slide.image}
          aria-hidden={index !== current}
          className={`absolute inset-0 transition-opacity duration-700
            ${index === current ? 'opacity-100' : 'opacity-0'}`}
        >
          <img
            src={slide.image}
            alt=""
            loading={index === 0 ? 'eager' : 'lazy'}
            className="h-full w-full object-cover"
          />
          {/* Escurece a foto para o texto ficar legivel */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-black/10" />
          <div className="absolute inset-0 flex flex-col justify-end p-6 pb-8 text-white sm:p-10 md:p-12">
            <h1 className="max-w-xl font-display text-2xl font-extrabold leading-tight sm:text-4xl md:text-5xl">
              {slide.title} <span className="text-accent-400">{slide.highlight}</span>
            </h1>
            <p className="mt-2 max-w-md text-sm text-white/85 sm:text-base md:text-lg">
              {slide.subtitle}
            </p>
          </div>
        </div>
      ))}

      <button
        type="button"
        aria-label="Destaque anterior"
        onClick={previous}
        className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center
          justify-center rounded-full bg-black/35 text-white backdrop-blur-sm transition
          hover:bg-brand-500 sm:left-4 sm:h-11 sm:w-11"
      >
        <ChevronLeft className="h-6 w-6" aria-hidden />
      </button>
      <button
        type="button"
        aria-label="Proximo destaque"
        onClick={next}
        className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center
          justify-center rounded-full bg-black/35 text-white backdrop-blur-sm transition
          hover:bg-brand-500 sm:right-4 sm:h-11 sm:w-11"
      >
        <ChevronRight className="h-6 w-6" aria-hidden />
      </button>

      <div className="absolute bottom-4 right-5 flex gap-2 sm:bottom-5">
        {SLIDES.map((_, index) => (
          <button
            key={index}
            aria-label={`Ir para o destaque ${index + 1}`}
            aria-current={index === current}
            onClick={() => setCurrent(index)}
            className={`h-2.5 rounded-full transition-all
              ${index === current ? 'w-6 bg-accent-400' : 'w-2.5 bg-white/60 hover:bg-white'}`}
          />
        ))}
      </div>
    </section>
  );
}
