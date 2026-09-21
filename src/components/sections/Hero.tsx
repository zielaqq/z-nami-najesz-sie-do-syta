import { Fragment, type CSSProperties } from "react";

import { ButtonLink } from "@/components/ui/Button";
import { Phone } from "@/components/ui/icons";
import { OpenStatus } from "@/components/ui/OpenStatus";
import { Photo } from "@/components/ui/Photo";
import { heroContent } from "@/data/about";
import { siteConfig } from "@/data/site";

/** Opóźnienie animacji wejścia (CSS zmienna --d, patrz globals.css → .hero-in) */
const delay = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

export function Hero() {
  const { eyebrow, titleLines, lead, services, photoAlt, insetAlt } = heroContent;
  const lastLine = titleLines.length - 1;

  return (
    <section aria-labelledby="hero-title" className="relative bg-cream">
      <div className="container-page grid items-center gap-14 pb-24 pt-10 sm:pt-14 lg:grid-cols-12 lg:gap-10 lg:pb-28 lg:pt-12 xl:gap-16">
        <div className="lg:col-span-5">
          <p className="eyebrow hero-in flex items-center gap-3" style={delay(60)}>
            <span aria-hidden="true" className="h-px w-8 bg-current" />
            {eyebrow}
          </p>

          <h1 id="hero-title" className="text-hero mt-6">
            {titleLines.map((line, index) => (
              <Fragment key={line}>
                <span className="hero-in block" style={delay(140 + index * 110)}>
                  {index === lastLine ? <span className="font-serif-italic italic text-accent">{line}</span> : line}
                </span>
                {/* spacja między liniami – tekst nagłówka czytany jako jedno zdanie (SEO, czytniki ekranu) */}
                {index < lastLine ? " " : null}
              </Fragment>
            ))}
          </h1>

          <p className="text-lead hero-in mt-7 max-w-[30rem] text-ink-soft" style={delay(520)}>
            {lead}
          </p>

          <div className="hero-in mt-9 flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row" style={delay(640)}>
            <ButtonLink
              href={siteConfig.contact.phoneHref}
              size="lg"
              icon={<Phone />}
              aria-label={`Zadzwoń i umów: ${siteConfig.contact.phoneDisplay}`}
            >
              Zadzwoń i umów
            </ButtonLink>
            <ButtonLink href="/#menu" variant="secondary" size="lg">
              Zobacz menu
            </ButtonLink>
          </div>

          <div
            className="hero-in mt-10 flex flex-col gap-3 border-t border-ink/12 pt-6 text-[0.9375rem] text-ink-soft sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-8"
            style={delay(760)}
          >
            <OpenStatus className="font-medium text-ink" />
            <ul className="flex flex-wrap gap-x-5 gap-y-1 text-mute" aria-label="Nasze usługi">
              {services.map((service) => (
                <li key={service} className="flex items-center gap-5 after:text-sand after:content-['/'] last:after:hidden">
                  {service}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="relative lg:col-span-7">
          <div className="hero-photo hero-in" style={delay(200)}>
            <Photo
              src="/images/hero/hero-main.jpg"
              alt={photoAlt}
              sizes="(min-width: 1024px) 58vw, 100vw"
              ratio="aspect-[5/4] sm:aspect-[16/11] lg:aspect-[6/7] lg:max-h-[calc(100svh-var(--header-h)-3rem)] lg:min-h-[28rem]"
              eager
              quality={90}
            />
          </div>
          <div
            className="hero-in absolute -bottom-9 left-4 w-[38%] max-w-[15rem] border-[6px] border-cream sm:left-6 lg:-left-10 lg:-bottom-8 lg:w-[32%]"
            style={delay(520)}
          >
            <div className="hero-photo zoom-on-hover">
              <Photo
                src="/images/hero/hero-inset.jpg"
                alt={insetAlt}
                sizes="(min-width: 1024px) 20vw, 40vw"
                ratio="aspect-square"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
