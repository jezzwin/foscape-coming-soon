import Image from "next/image";
import { FoscapeLogo } from "@/components/FoscapeLogo";
import { PondBackground } from "@/components/PondBackground";
import { siteConfig } from "@/lib/site";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteConfig.url}/#organization`,
      name: siteConfig.name,
      url: siteConfig.url,
      slogan: siteConfig.tagline,
      description: siteConfig.description,
      logo: {
        "@type": "ImageObject",
        url: `${siteConfig.url}/foscape-logo.svg`,
      },
      sameAs: [siteConfig.instagram],
      parentOrganization: { "@type": "Organization", name: "Aqua55" },
    },
    {
      "@type": "WebSite",
      "@id": `${siteConfig.url}/#website`,
      url: siteConfig.url,
      name: siteConfig.name,
      description: siteConfig.description,
      inLanguage: "en",
      publisher: { "@id": `${siteConfig.url}/#organization` },
    },
  ],
};

// Split so the TLD can carry the brand cyan without hardcoding the domain.
const [domainName, ...domainRest] = siteConfig.domain.split(".");
const domainTld = domainRest.length > 0 ? `.${domainRest.join(".")}` : "";

export default function Home() {
  return (
    <>
      <PondBackground />
      <div className="overlay overlay--scrim" />
      <div className="overlay overlay--vignette" />
      <div className="overlay overlay--grain" />

      <main className="stage">
        <div className="lockup">
          <div className="brand">
            <FoscapeLogo className="logo" />
            <span className="brand__divider" aria-hidden="true" />
            <Image
              className="brand__aqua"
              src="/aqua55-mark.png"
              alt="The Aqua55"
              width={416}
              height={288}
              priority
              sizes="(max-width: 820px) 128px, 176px"
            />
          </div>
          <h1 className="coming">
            <span className="sr-only">Foscape — </span>Coming Soon
          </h1>
          <p className="domain">
            {domainName}
            <span className="domain__tld">{domainTld}</span>
          </p>
          <p className="tagline">{siteConfig.tagline}</p>
          <a
            className="social"
            href={siteConfig.instagram}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Foscape on Instagram"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              aria-hidden="true"
              focusable="false"
            >
              <rect x="3" y="3" width="18" height="18" rx="5.2" />
              <circle cx="12" cy="12" r="4.1" />
              <circle cx="17.3" cy="6.7" r="1.1" fill="currentColor" stroke="none" />
            </svg>
          </a>
        </div>
      </main>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
