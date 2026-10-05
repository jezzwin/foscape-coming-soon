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
          <p className="domain">{siteConfig.domain}</p>
          <p className="tagline">{siteConfig.tagline}</p>
        </div>
      </main>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
