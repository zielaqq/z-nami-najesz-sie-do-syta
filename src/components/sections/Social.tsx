import { FacebookEmbed } from "@/components/sections/FacebookEmbed";
import { ButtonLink } from "@/components/ui/Button";
import { FacebookIcon } from "@/components/ui/icons";
import { Section, SectionHeading, type SectionTone } from "@/components/ui/Section";
import { siteConfig } from "@/data/site";

export function Social({ tone = "paper" }: { tone?: SectionTone }) {
  const { facebook } = siteConfig.links;

  return (
    <Section id="social" labelledBy="social-title" tone={tone}>
      <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-6">
          <SectionHeading
            id="social-title"
            eyebrow="Social media"
            title="Obserwuj nas"
            lead="Zobacz, co aktualnie dzieje się w restauracji."
            titleWidth="max-w-[12ch]"
          />
          <div className="mt-9" data-reveal>
            <ButtonLink href={facebook} external icon={<FacebookIcon />} size="lg">
              Odwiedź nas na Facebooku
            </ButtonLink>
          </div>
        </div>

        <div className="lg:col-span-6">
          <FacebookEmbed pageUrl={facebook} loadOnClick={siteConfig.embeds.loadOnClick} />
        </div>
      </div>
    </Section>
  );
}
