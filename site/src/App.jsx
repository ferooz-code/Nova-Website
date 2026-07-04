import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  Globe2,
  Menu,
  ShieldCheck,
  Sparkles,
  Wifi,
  Wind,
  X,
} from "lucide-react";
import pages from "./data/pages.json";
import assetMap from "./data/asset-map.json";
import defaultSiteContent from "./data/site-content.json";
import { Admin } from "./Admin.jsx";

const publicPages = pages;

const BASE_PATH = import.meta.env.BASE_URL.replace(/\/$/, "");
const withBasePath = (path) => `${BASE_PATH}${path}`;
const resolveAsset = (path) => {
  if (!path || /^(https?:|data:|blob:)/i.test(path)) return path;
  return withBasePath(path.startsWith("/") ? path : `/${path}`);
};
const media = (url) => {
  const path = assetMap[url];
  return path ? resolveAsset(path) : undefined;
};

const ASSETS = {
  novaLogo: media("https://novasolutionstech.com/wp-content/uploads/2024/01/nova-tech-9-2.png"),
  hero: media("https://purium.kr/img/main/section1Visual1-1.jpg"),
  core: media("https://purium.kr/img/sub/coreImg1.png"),
  product: media("https://purium.kr/img/sub/intro2Img1.jpg"),
  customer: media("https://purium.kr/img/main/customerImg1.jpg"),
};

const PRODUCT_IMAGES = [1, 2, 3, 4, 5, 6].map((number) =>
  media(`https://purium.kr/img/main/section3Img0${number === 5 ? "5_n" : number}.jpg`),
);

const navGroups = [
  {
    label: "About",
    items: [
      ["About Nova", "/about/company"],
      ["Awards", "/about/awards"],
      ["Enterprise certifications", "/about/certifications"],
      ["Vision", "/about/vision"],
      ["History", "/about/history"],
      ["Contact Nova", "/about/location"],
    ],
  },
  {
    label: "Technology",
    items: [
      ["Core technologies", "/technology/core"],
      ["Patents", "/technology/patents"],
      ["Certifications", "/technology/certifications"],
      ["Test reports", "/technology/test-reports"],
    ],
  },
  {
    label: "Products",
    items: [
      ["Product overview", "/products/overview"],
      ["Product lineup", "/products/lineup"],
      ["Large facilities", "/products/specifications/large"],
      ["Small facilities", "/products/specifications/small"],
      ["Walk-through products", "/products/specifications/walk-through"],
      ["Advertising type", "/products/specifications/advertising"],
      ["Product package", "/products/package"],
      ["Portfolio", "/products/portfolio"],
      ["Consumables & accessories", "/products/supplies"],
      ["Installation cases", "/installations/7"],
    ],
  },
  {
    label: "Services",
    items: [
      ["Delivery & installation", "/services/delivery"],
      ["Monthly care service", "/services/care"],
      ["After-sales service", "/contact/service"],
    ],
  },
  {
    label: "Sustainability",
    items: [
      ["ESG management", "/sustainability/esg"],
      ["Environmental management", "/sustainability/environment"],
      ["Contribution to society", "/sustainability/social"],
      ["Ethical management", "/sustainability/ethics"],
    ],
  },
  {
    label: "Media",
    items: [
      ["PURIUM gallery", "/news/gallery"],
      ["Photo gallery", "/news/photos"],
      ["Video gallery", "/news/videos"],
    ],
  },
];

const installationCategories = [
  ["Government", "/installations/7"],
  ["Affiliated organizations", "/installations/8"],
  ["Public corporations", "/installations/9"],
  ["Quasi-governmental", "/installations/10"],
  ["Government-invested", "/installations/32"],
  ["Other public", "/installations/11"],
  ["Related organizations", "/installations/12"],
  ["Local governments", "/installations/13"],
  ["Educational institutions", "/installations/16"],
  ["Medical institutions", "/installations/20"],
  ["Social welfare · Religious", "/installations/24"],
  ["Private enterprise · Other", "/installations/26"],
];

function currentPath() {
  const pathname = BASE_PATH && window.location.pathname.startsWith(BASE_PATH)
    ? window.location.pathname.slice(BASE_PATH.length)
    : window.location.pathname;
  return pathname.replace(/\/$/, "") || "/";
}

function normalizeContent(input = {}) {
  return {
    ...defaultSiteContent,
    ...input,
    brand: { ...defaultSiteContent.brand, ...(input.brand || {}) },
    home: { ...defaultSiteContent.home, ...(input.home || {}) },
    company: { ...defaultSiteContent.company, ...(input.company || {}) },
    contact: { ...defaultSiteContent.contact, ...(input.contact || {}) },
    pageOverrides: { ...defaultSiteContent.pageOverrides, ...(input.pageOverrides || {}) },
    videos: Array.isArray(input.videos) ? input.videos : defaultSiteContent.videos,
  };
}

function routeContactThroughNova(value) {
  if (typeof value !== "string") return value;
  return value
    .replace(/[\w.+-]+@purium\.kr/gi, "Nova secure inquiry portal")
    .replace(/\+82-2-881-5544/g, "Nova Solutions Tech global support")
    .replace(/E-mail\s*:\s*Nova secure inquiry portal/gi, "Contact: Nova secure inquiry portal")
    .replace(/Tel\. No\.\s*:\s*Nova Solutions Tech global support/gi, "Support: Nova Solutions Tech");
}

function mergePageContent(page, content) {
  let override = content.pageOverrides[page.route] || {};
  if (page.route === "/about/company") {
    override = { ...override, title: content.company.title, eyebrow: content.company.eyebrow, headings: override.headings?.length ? override.headings : [content.company.summary], paragraphs: content.company.paragraphs };
  }
  if (page.route === "/about/location") {
    override = { ...override, paragraphs: [content.contact.address, content.contact.intro] };
  }
  const hasMediaOverride = Object.prototype.hasOwnProperty.call(override, "media");
  const mediaItems = hasMediaOverride
    ? (override.media || []).map((url) => ({ local: resolveAsset(url), original: url }))
    : page.media.map((item) => ({ ...item, local: resolveAsset(item.local) }));
  return {
    ...page,
    ...override,
    headings: (override.headings || page.headings).map(routeContactThroughNova),
    paragraphs: (override.paragraphs || page.paragraphs).map(routeContactThroughNova),
    lists: (override.lists || page.lists).map(routeContactThroughNova),
    tables: (override.tables || page.tables).map((table) => table.map((row) => row.map(routeContactThroughNova))),
    media: mediaItems,
    videos: override.videos || [],
  };
}

function SiteLink({ to, navigate, children, className = "", onClick }) {
  return (
    <a
      href={withBasePath(to)}
      className={className}
      onClick={(event) => {
        event.preventDefault();
        onClick?.();
        navigate(to);
      }}
    >
      {children}
    </a>
  );
}

function Header({ path, navigate, content }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState(null);
  const isHome = path === "/";

  useEffect(() => {
    setMobileOpen(false);
    setOpenGroup(null);
  }, [path]);

  return (
    <header className={`site-header ${isHome ? "over-hero" : "solid"}`}>
      <SiteLink to="/" navigate={navigate} className="brand" onClick={() => setMobileOpen(false)}>
        <img src={resolveAsset(content.brand.logo) || ASSETS.novaLogo} alt={content.brand.name} />
        <span>
          <strong>{content.brand.partnerLabel.replace(/\s+FOR\s+PURIUM$/i, "")}</strong>
          <small>FOR PURIUM</small>
        </span>
      </SiteLink>

      <nav className="desktop-nav" aria-label="Primary navigation">
        {navGroups.map((group) => {
          const active = group.items.some(([, route]) => path.startsWith(route.split("/").slice(0, 2).join("/")));
          return (
            <div className={`nav-group ${active ? "active" : ""}`} key={group.label}>
              <button
                type="button"
                aria-expanded={openGroup === group.label}
                onClick={() => setOpenGroup(openGroup === group.label ? null : group.label)}
              >
                {group.label} <ChevronDown size={14} />
              </button>
              <div className={`nav-dropdown ${openGroup === group.label ? "open" : ""}`}>
                <span className="dropdown-label">{group.label}</span>
                {group.items.map(([label, route]) => (
                  <SiteLink key={route} to={route} navigate={navigate}>
                    {label}<ArrowUpRight size={14} />
                  </SiteLink>
                ))}
              </div>
            </div>
          );
        })}
      </nav>

      <SiteLink to="/contact/purchase" navigate={navigate} className="header-cta">
        Inquire <ArrowUpRight size={16} />
      </SiteLink>

      <button
        type="button"
        className="menu-button"
        aria-label={mobileOpen ? "Close menu" : "Open menu"}
        aria-expanded={mobileOpen}
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X /> : <Menu />}
      </button>

      {mobileOpen && <div
        className="mobile-panel open"
        style={{ opacity: 1, visibility: "visible", transform: "translateY(0)" }}
      >
        <div className="mobile-panel-meta">Nova Solutions Tech · Canada</div>
        {navGroups.map((group) => (
          <div className="mobile-group" key={group.label}>
            <button
              type="button"
              onClick={() => setOpenGroup(openGroup === group.label ? null : group.label)}
              aria-expanded={openGroup === group.label}
            >
              {group.label}<ChevronDown size={18} />
            </button>
            {openGroup === group.label && (
              <div className="mobile-subnav">
                {group.items.map(([label, route]) => (
                  <SiteLink key={route} to={route} navigate={navigate}>{label}</SiteLink>
                ))}
              </div>
            )}
          </div>
        ))}
        <SiteLink to="/contact/purchase" navigate={navigate} className="mobile-inquire">
          Start an inquiry <ArrowRight size={18} />
        </SiteLink>
      </div>}
    </header>
  );
}

function Eyebrow({ children, light = false }) {
  return <div className={`eyebrow ${light ? "light" : ""}`}><span />{children}</div>;
}

function Home({ navigate, content }) {
  const features = [
    [Wind, "Air purification", "High-volume circulation and fine particulate removal."],
    [ShieldCheck, "Antimicrobial", "Eco-friendly antimicrobial performance for shared spaces."],
    [Sparkles, "Disinfection", "Integrated air and surface sanitation technologies."],
    [Wifi, "SMART IoT", "Connected monitoring, control and operational visibility."],
  ];
  const products = [
    ["Large facilities", "PURIUM 10000", "/products/specifications/large"],
    ["Small facilities", "PURIUM 20000", "/products/specifications/small"],
    ["Special purpose", "AI Disease Control", "/products/overview"],
    ["Walk-through", "PURIUM 50000", "/products/specifications/walk-through"],
    ["Indoor systems", "Clean-air solutions", "/products/lineup"],
    ["Advertising type", "PURIUM 30000", "/products/specifications/advertising"],
  ];

  return (
    <>
      <section className="home-hero" style={{ backgroundImage: `url(${resolveAsset(content.home.heroImage) || ASSETS.hero})` }}>
        <div className="hero-shade" />
        <div className="hero-content page-shell">
          <Eyebrow light>{content.home.eyebrow}</Eyebrow>
          <h1>{content.home.headline.map((line, index) => index === content.home.headline.length - 1 ? <em key={line}>{line}</em> : <span key={line}>{line}<br /></span>)}</h1>
          <p>{content.home.description}</p>
          <div className="hero-actions">
            <SiteLink to="/products/overview" navigate={navigate} className="button primary">
              Explore products <ArrowRight size={18} />
            </SiteLink>
            <SiteLink to="/contact/purchase" navigate={navigate} className="button ghost">
              Request a proposal
            </SiteLink>
          </div>
        </div>
        <div className="hero-index">PRODUCT × TECHNOLOGY <span>01</span></div>
      </section>

      <section className="proof-strip">
        <div className="page-shell proof-grid">
          <div><strong>01</strong><span>World-first patented walk-through air purification</span></div>
          <div><strong>05</strong><span>Integrated safeguards in one connected system</span></div>
          <div><strong>GLOBAL</strong><span>Exclusive sales and distribution through Nova</span></div>
        </div>
      </section>

      <section className="intro-section section-space">
        <div className="page-shell split-intro">
          <div className="intro-copy">
            <Eyebrow>THE PURIUM DIFFERENCE</Eyebrow>
            <h2>Engineered clean-air technology for shared spaces.</h2>
            <p>
              PURIUM combines air purification, antimicrobial treatment, disinfection, dust collection and odor neutralization in a single smart platform—engineered for demanding public environments.
            </p>
            <SiteLink to="/technology/core" navigate={navigate} className="text-link">
              Discover the core technology <ArrowRight size={17} />
            </SiteLink>
          </div>
          <div className="intro-visual">
            <img src={ASSETS.product} alt="PURIUM Smart Safeguards Gate" />
            <div className="visual-caption"><span>SMART SAFEGUARDS GATE</span><strong>AI + IoT</strong></div>
          </div>
        </div>
        <div className="page-shell feature-grid">
          {features.map(([Icon, title, copy], index) => (
            <article key={title}>
              <div className="feature-top"><span>0{index + 1}</span><Icon size={25} strokeWidth={1.5} /></div>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="technology-band">
        <div className="page-shell technology-grid">
          <div className="technology-visual"><img src={ASSETS.core} alt="Cyclone Turbo Air Shot technology" /></div>
          <div className="technology-copy">
            <Eyebrow light>CORE TECHNOLOGY</Eyebrow>
            <h2>{content.home.technologyHeading.split(" ").map((word, index) => <span key={`${word}-${index}`}>{word}{index === 0 ? <br /> : " "}</span>)}</h2>
            <p>{content.home.technologyCopy}</p>
            <SiteLink to="/technology/core" navigate={navigate} className="button light">See how it works <ArrowRight size={18} /></SiteLink>
          </div>
        </div>
      </section>

      <section className="products-section section-space">
        <div className="page-shell section-heading-row">
          <div><Eyebrow>PRODUCT PORTFOLIO</Eyebrow><h2>{content.home.productsHeading}</h2></div>
          <p>{content.home.productsCopy}</p>
        </div>
        <div className="page-shell product-grid">
          {products.map(([label, name, route], index) => (
            <SiteLink to={route} navigate={navigate} className="product-card" key={name}>
              <img src={PRODUCT_IMAGES[index]} alt={`${label} PURIUM solution`} />
              <div className="product-card-overlay">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{label}</h3>
                <p>{name}</p>
                <ArrowUpRight size={21} />
              </div>
            </SiteLink>
          ))}
        </div>
      </section>

      <section className="installations-section" style={{ backgroundImage: `url(${ASSETS.customer})` }}>
        <div className="installations-overlay" />
        <div className="page-shell installations-copy">
          <Eyebrow light>PROVEN IN THE FIELD</Eyebrow>
          <h2>Deployed across high-traffic, high-trust environments.</h2>
          <p>Explore PURIUM installations across government, education, medical, social and private facilities.</p>
          <SiteLink to="/installations/7" navigate={navigate} className="button primary">View installation cases <ArrowRight size={18} /></SiteLink>
        </div>
      </section>

      <section className="services-section section-space">
        <div className="page-shell section-heading-row">
          <div><Eyebrow>GLOBAL SUPPORT</Eyebrow><h2>From introduction<br />to long-term care.</h2></div>
          <p>Nova is the exclusive global point of contact for PURIUM product selection, commercial proposals, distribution and customer coordination.</p>
        </div>
        <div className="page-shell service-cards">
          {[
            ["01", "Distribution", "Global market development and partner support from Nova Solutions Tech.", "/about/company"],
            ["02", "Delivery & installation", "A disciplined process for transport, installation and commissioning.", "/services/delivery"],
            ["03", "Monthly care", "Product inspection, cleaning and consumables replacement.", "/services/care"],
          ].map(([number, title, copy, route]) => (
            <SiteLink to={route} navigate={navigate} className="service-card" key={title}>
              <span>{number}</span><h3>{title}</h3><p>{copy}</p><ArrowUpRight />
            </SiteLink>
          ))}
        </div>
      </section>

      <VideoShowcase videos={content.videos} />

      <CallToAction navigate={navigate} />
    </>
  );
}

function CallToAction({ navigate }) {
  return (
    <section className="cta-section">
      <div className="page-shell cta-grid">
        <div>
          <Eyebrow light>LET’S BUILD A CLEANER SPACE</Eyebrow>
          <h2>Bring PURIUM to your market or facility.</h2>
        </div>
        <SiteLink to="/contact/purchase" navigate={navigate} className="round-link" aria-label="Start an inquiry">
          <ArrowUpRight size={34} />
        </SiteLink>
      </div>
    </section>
  );
}

function videoEmbedUrl(url) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtube.com")) {
      const id = parsed.searchParams.get("v") || parsed.pathname.split("/").filter(Boolean).pop();
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
    }
    if (parsed.hostname === "youtu.be") return `https://www.youtube-nocookie.com/embed/${parsed.pathname.slice(1)}`;
    if (parsed.hostname.includes("vimeo.com")) return `https://player.vimeo.com/video/${parsed.pathname.split("/").filter(Boolean).pop()}`;
  } catch { return null; }
  return null;
}

function VideoShowcase({ videos = [] }) {
  const published = videos.filter((video) => video.url);
  if (!published.length) return null;
  return (
    <section className="video-section section-space">
      <div className="page-shell">
        <div className="section-heading-row compact-heading"><div><Eyebrow>WATCH PURIUM IN ACTION</Eyebrow><h2>Product and technology videos.</h2></div><p>See how PURIUM systems support cleaner, safer shared environments.</p></div>
        <div className="video-grid">
          {published.map((video, index) => {
            const embed = videoEmbedUrl(video.url);
            return <article key={`${video.url}-${index}`}><div className="video-frame">{embed ? <iframe src={embed} title={video.title || `PURIUM video ${index + 1}`} loading="lazy" allow="accelerometer; autoplay; encrypted-media; picture-in-picture" allowFullScreen /> : <video controls preload="metadata" src={resolveAsset(video.url)} />}</div><h3>{video.title || "PURIUM technology"}</h3></article>;
          })}
        </div>
      </div>
    </section>
  );
}

function Breadcrumbs({ page, navigate }) {
  return (
    <div className="breadcrumbs">
      <SiteLink to="/" navigate={navigate}>Home</SiteLink><span>/</span><span>{page.category}</span><span>/</span><strong>{page.title.replace(/\n/g, " ")}</strong>
    </div>
  );
}

function SectionNavigation({ page, navigate }) {
  const group = navGroups.find((entry) => entry.label === page.category || (page.category === "Products" && entry.label === "Products"));
  if (!group) return null;
  return (
    <nav className="section-nav" aria-label={`${page.category} pages`}>
      {group.items.map(([label, route]) => (
        <SiteLink key={route} to={route} navigate={navigate} className={page.route === route ? "active" : ""}>{label}</SiteLink>
      ))}
    </nav>
  );
}

function MediaGrid({ items, title, variant = "" }) {
  const [active, setActive] = useState(null);
  if (!items.length) return null;
  return (
    <>
      <div className={`media-grid ${items.length < 3 ? "compact" : ""} ${variant}`.trim()}>
        {items.map((item, index) => (
          <button type="button" key={`${item.local}-${index}`} onClick={() => setActive(item)} aria-label={`Open ${title} image ${index + 1}`}>
            <img src={item.local} alt={`${title} — ${index + 1}`} loading="lazy" />
            <span>{String(index + 1).padStart(2, "0")}</span>
          </button>
        ))}
      </div>
      {active && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={`${title} image preview`} onClick={() => setActive(null)}>
          <button type="button" aria-label="Close image preview" onClick={() => setActive(null)}><X /></button>
          <img src={active.local} alt={`${title} enlarged`} onClick={(event) => event.stopPropagation()} />
        </div>
      )}
    </>
  );
}

function InquiryForm({ service = false, content, apiBase }) {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  if (sent) {
    return (
      <div className="form-success" role="status">
        <CheckCircle2 size={44} />
        <h3>Thank you. Your inquiry has been sent to Nova.</h3>
        <p>Nova’s global sales and support team will review your request.</p>
        <button type="button" onClick={() => setSent(false)}>Send another inquiry</button>
      </div>
    );
  }
  return (
    <form className="inquiry-form" onSubmit={async (event) => {
      event.preventDefault();
      setSending(true);
      setError("");
      const payload = Object.fromEntries(new FormData(event.currentTarget));
      try {
        const response = await fetch(`${apiBase}/inquiries`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        if (!response.ok) throw new Error("Nova inquiry service is not available here");
        setSent(true);
      } catch {
        setError("Opening Nova’s secure inquiry portal so your request reaches the right team.");
        window.setTimeout(() => window.location.assign(content.contact.inquiryPortal), 700);
      } finally {
        setSending(false);
      }
    }}>
      <input className="form-honeypot" name="website" tabIndex="-1" autoComplete="off" aria-hidden="true" />
      <div className="field-pair">
        <label>Full name<input name="name" autoComplete="name" required /></label>
        <label>Organization<input name="organization" autoComplete="organization" required /></label>
      </div>
      <div className="field-pair">
        <label>Email<input type="email" name="email" autoComplete="email" required /></label>
        <label>Phone<input type="tel" name="phone" autoComplete="tel" /></label>
      </div>
      <label>Region / Country<input name="region" autoComplete="country-name" required /></label>
      <label>
        {service ? "Product or service need" : "Area of interest"}
        <select name="interest" defaultValue="">
          <option value="" disabled>Select one</option>
          <option>Product purchase</option>
          <option>Distribution partnership</option>
          <option>Facility consultation</option>
          <option>After-sales service</option>
          <option>Other</option>
        </select>
      </label>
      <label>How can we help?<textarea name="message" rows="6" required /></label>
      <label className="consent"><input type="checkbox" required /> I agree that Nova may use this information to respond to my inquiry.</label>
      {error && <p className="form-route-note" role="status">{error}</p>}
      <button type="submit" className="button primary" disabled={sending}>{sending ? "Sending…" : "Submit to Nova"} <ArrowRight size={18} /></button>
    </form>
  );
}

function ContactPage({ page, navigate, content, apiBase }) {
  return (
    <>
      <SubHero page={page} navigate={navigate} />
      <main className="page-shell content-layout section-space">
        <aside>
          <Eyebrow>CONTACT NOVA</Eyebrow>
          <h2>{page.route === "/contact/service" ? "After-sales support" : "Start a conversation"}</h2>
          <p>{content.contact.intro}</p>
          <div className="address-block"><span>HEADQUARTERS</span><strong>{content.contact.address.split("\n").map((line) => <span key={line}>{line}<br /></span>)}</strong><a href={content.contact.website} target="_blank" rel="noreferrer">{content.contact.website.replace(/^https?:\/\//, "")}</a></div>
        </aside>
        <InquiryForm service={page.route === "/contact/service"} content={content} apiBase={apiBase} />
      </main>
    </>
  );
}

function SubHero({ page, navigate }) {
  const hasBackdrop = page.media.length && ["Technology", "Products", "Services", "Sustainability"].includes(page.category);
  return (
    <section className={`sub-hero ${hasBackdrop ? "with-image" : ""}`} style={hasBackdrop ? { backgroundImage: `url(${page.media[0].local})` } : undefined}>
      <div className="sub-hero-shade" />
      <div className="page-shell sub-hero-content">
        <Breadcrumbs page={page} navigate={navigate} />
        <Eyebrow light>{page.eyebrow}</Eyebrow>
        <h1>{page.title.split("\n").map((line) => <span key={line}>{line}</span>)}</h1>
        <p>{page.heroDescription || "PURIUM product and technology information, with exclusive global sales and distribution through Nova Solutions Tech."}</p>
      </div>
    </section>
  );
}

function InstallationPage({ page, navigate }) {
  const label = installationCategories.find(([, route]) => route === page.route)?.[0] || "Installation cases";
  return (
    <>
      <SubHero page={{ ...page, title: label, eyebrow: "INSTALLATION CASES" }} navigate={navigate} />
      <main className="section-space">
        <div className="page-shell">
          <Eyebrow>DEPLOYMENT NETWORK</Eyebrow>
          <div className="section-heading-row compact-heading">
            <h2>{label}</h2>
            <p>Selected PURIUM installations within this facility category.</p>
          </div>
          <nav className="category-pills" aria-label="Installation categories">
            {installationCategories.map(([name, route]) => (
              <SiteLink key={route} to={route} navigate={navigate} className={route === page.route ? "active" : ""}>{name}</SiteLink>
            ))}
          </nav>
          <MediaGrid items={page.media} title={`${label} installations`} />
        </div>
      </main>
      <CallToAction navigate={navigate} />
    </>
  );
}

function DataTable({ table, index }) {
  if (!table?.length) return null;
  return (
    <div className="table-wrap" key={index}>
      <table><tbody>{table.map((row, rowIndex) => <tr key={rowIndex}>{row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>)}</tbody></table>
    </div>
  );
}

function SourceNote({ page }) {
  return <div className="source-note"><Globe2 size={18} /><span>Product and technology information supplied by PURIUM. Global sales and distribution by Nova Solutions Tech.</span><a href={page.sourceUrl} target="_blank" rel="noreferrer">Technology source <ArrowUpRight size={14} /></a></div>;
}

const patentGroupDefinitions = [
  ["Granted patents", (item) => /^Patent (?!Application)/.test(item)],
  ["Patent applications", (item) => /^Patent Application/.test(item)],
  ["International filings", (item) => /^(PCT|EUROPE|USA)/.test(item)],
  ["Product designs", (item) => /^Design/.test(item)],
  ["Trademarks", (item) => /^TM/.test(item)],
  ["Software programs", (item) => /^Program/.test(item)],
  ["Other intellectual property", (item) => /^Image/.test(item)],
];

function PatentPortfolio({ page, navigate }) {
  const groups = patentGroupDefinitions.map(([label, matches]) => ({ label, items: page.lists.filter(matches) })).filter((group) => group.items.length);
  return (
    <>
      <SubHero page={{ ...page, title: "Patents & intellectual property", media: [] }} navigate={navigate} />
      <SectionNavigation page={page} navigate={navigate} />
      <main className="section-space technical-page">
        <div className="page-shell">
          <SourceNote page={page} />
          <section className="portfolio-intro">
            <div><Eyebrow>PROTECTED INNOVATION</Eyebrow><h2>A structured portfolio of PURIUM technology.</h2></div>
            <div className="portfolio-summary"><strong>{page.lists.length}</strong><span>published registrations and applications across patents, designs, trademarks and software.</span></div>
          </section>
          <div className="portfolio-groups">
            {groups.map((group, index) => (
              <details className="portfolio-group" key={group.label} open={index === 0}>
                <summary><span>{String(index + 1).padStart(2, "0")}</span><strong>{group.label}</strong><small>{group.items.length} {group.items.length === 1 ? "record" : "records"}</small><ChevronDown size={20} /></summary>
                <ul>{group.items.map((item) => <li key={item}>{item}</li>)}</ul>
              </details>
            ))}
          </div>
        </div>
      </main>
      <CallToAction navigate={navigate} />
    </>
  );
}

const cycloneFeatures = [
  { title: "12-port Cyclone Turbo Air Shot", mediaIndex: 0 },
  { title: "Carbon nanotube + HEPA 13 capture", mediaIndex: 6 },
  { title: "Dual UV-A / UV-C treatment", mediaIndex: 7 },
  { title: "Natural phytoncide deodorization", mediaIndex: 10 },
];

function CycloneTechnology({ page, navigate }) {
  const selectedMedia = page.media.length >= 11 ? [0, 6, 7, 10].map((index) => page.media[index]) : page.media.slice(0, 4);
  return (
    <>
      <SubHero page={{ ...page, media: [] }} navigate={navigate} />
      <SectionNavigation page={page} navigate={navigate} />
      <main className="section-space technical-page cyclone-page">
        <div className="page-shell">
          <SourceNote page={page} />
          <section className="cyclone-intro">
            <div><Eyebrow>ENGINEERED AIRFLOW</Eyebrow><h2>Four coordinated technologies. One cleaner-air pathway.</h2></div>
            <p>The Cyclone Turbo Air Shot combines directional airflow, high-efficiency capture, UV treatment and natural deodorization in one integrated system.</p>
          </section>
          <div className="technology-metrics" aria-label="Cyclone Turbo Air Shot highlights">
            <div><strong>12</strong><span>wind discharge ports</span></div>
            <div><strong>4</strong><span>dust collector fans</span></div>
            <div><strong>HEPA 13</strong><span>high-efficiency filtration</span></div>
            <div><strong>99.9%</strong><span>reported particulate removal*</span></div>
          </div>
          <div className="cyclone-feature-grid">
            {cycloneFeatures.map((feature, index) => {
              const item = selectedMedia[index] || selectedMedia[0];
              return <article className="cyclone-feature" key={feature.title}><div className={`cyclone-feature-media ${index === 1 || index === 2 ? "dark" : ""}`}><img src={item?.local} alt={feature.title} loading="lazy" /></div><div><span>{String(index + 1).padStart(2, "0")}</span><h3>{feature.title}</h3><p>{page.paragraphs[index]}</p></div></article>;
            })}
          </div>
          <p className="technical-footnote">*Performance figures shown are reported in PURIUM source materials. Results may vary by operating conditions and installation.</p>
        </div>
      </main>
      <CallToAction navigate={navigate} />
    </>
  );
}

function parseTestResult(item, fallbackNumber) {
  const lines = item.split(/\n+/).map((line) => line.trim()).filter(Boolean);
  const readings = [...item.matchAll(/([\d.]+)\s*㎍\/㎥/g)].map((match) => match[1]);
  const removal = item.match(/([\d.]+)%\s*Removed/i)?.[1];
  return { number: lines[0] || fallbackNumber, title: lines[1] || "Performance test", before: readings[0] || "—", after: readings[1] || "—", removal: removal ? `${removal}%` : "—" };
}

function parseScoreBand(item) {
  const lines = item.split(/\n+/).map((line) => line.trim()).filter(Boolean);
  return [lines[0] || "Unspecified", (lines[1] || "—").replace(/\s–\s*$/, "+").replace(/\s+/g, "")];
}

function TestReports({ page, navigate }) {
  const testResults = page.lists.slice(0, 3).map((item, index) => parseTestResult(item, String(index + 1).padStart(2, "0")));
  const scoreBands = page.lists.slice(3, 8).map(parseScoreBand);
  return (
    <>
      <SubHero page={{ ...page, media: [] }} navigate={navigate} />
      <SectionNavigation page={page} navigate={navigate} />
      <main className="section-space technical-page reports-page">
        <div className="page-shell">
          <SourceNote page={page} />
          <section className="reports-intro"><div><Eyebrow>VALIDATED PERFORMANCE</Eyebrow><h2>Test results, made readable.</h2></div><p>Three challenge tests compare airborne particulate measurements before and after operation of the Smart Safeguards Gate.</p></section>
          <div className="report-result-grid">
            {testResults.map((result) => <article key={result.number}><div className="report-card-head"><span>{result.number}</span><h3>{result.title}</h3></div><div className="report-reading"><div><small>Before</small><strong>{result.before}</strong><span>㎍/㎥</span></div><ArrowRight size={22} /><div><small>After</small><strong>{result.after}</strong><span>㎍/㎥</span></div></div><div className="report-removal"><strong>{result.removal}</strong><span>reported removal</span></div></article>)}
          </div>
          <section className="score-section">
            <div className="score-copy"><Eyebrow>PURIUM SCORE</Eyebrow><h2>A simple PM2.5 air-quality scale.</h2><p>{page.paragraphs[0]}</p></div>
            <div className="score-scale">{scoreBands.map(([label, range], index) => <div key={label}><span style={{ "--score-level": index }}>{label}</span><strong>{range}</strong><small>㎍/㎥</small></div>)}</div>
          </section>
          <p className="technical-footnote">Results and assessment thresholds are reproduced from PURIUM’s published test-report source. They are presented as technical information, not as an independent Nova laboratory claim.</p>
        </div>
      </main>
      <CallToAction navigate={navigate} />
    </>
  );
}

const aboutRoleTitles = ["Global product access", "Commercial coordination", "Long-term customer support"];

function AboutNova({ page, navigate }) {
  return (
    <>
      <SubHero page={{ ...page, title: "About Nova", media: [], heroDescription: "Nova connects PURIUM clean-air products and technology with customers and partners worldwide." }} navigate={navigate} />
      <SectionNavigation page={page} navigate={navigate} />
      <main className="section-space about-nova-page">
        <div className="page-shell">
          <section className="about-nova-intro">
            <div><Eyebrow>EXCLUSIVE GLOBAL PARTNER</Eyebrow><h2>{page.headings[0] || "Connecting PURIUM innovation with the world."}</h2></div>
            <p>{page.headings[1] || "Nova Solutions Tech is PURIUM’s exclusive global sales and distribution partner."}</p>
          </section>
          <div className="about-role-grid">
            {page.paragraphs.slice(0, 3).map((paragraph, index) => <article key={aboutRoleTitles[index]}><span>{String(index + 1).padStart(2, "0")}</span><h3>{aboutRoleTitles[index]}</h3><p>{paragraph}</p></article>)}
          </div>
          <section className="about-focus-band"><div><Eyebrow light>NOVA × PURIUM</Eyebrow><h2>Product expertise, global reach and one direct point of contact.</h2></div><SiteLink to="/contact/purchase" navigate={navigate} className="button light">Start a product inquiry <ArrowRight size={18} /></SiteLink></section>
        </div>
      </main>
      <CallToAction navigate={navigate} />
    </>
  );
}

function VisionPage({ page, navigate }) {
  const principles = page.headings.slice(1, 4).map((title, index) => ({ title, copy: page.paragraphs[index + 1] || "" }));
  return (
    <>
      <SubHero page={{ ...page, title: "Vision", media: [], heroDescription: "A product-led vision for cleaner environments, responsible growth and dependable global support." }} navigate={navigate} />
      <SectionNavigation page={page} navigate={navigate} />
      <main className="section-space vision-page">
        <div className="page-shell">
          <SourceNote page={page} />
          <section className="vision-intro"><Eyebrow>PRODUCT VISION</Eyebrow><h2>{page.headings[0]}</h2><p>{page.paragraphs[0]}</p></section>
          <div className="vision-principles">
            {principles.map((principle, index) => <article key={principle.title}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{principle.title}</h3><p>{principle.copy}</p></div></article>)}
          </div>
        </div>
      </main>
      <CallToAction navigate={navigate} />
    </>
  );
}

const historyYearSizes = [["2025", 6], ["2024", 6], ["2023", 5], ["2022", 9], ["2021", 5], ["2020", 6], ["2019", 6], ["2018", 6], ["2017", 4], ["2016", 2]];

function groupHistoryItems(items) {
  let offset = 0;
  return historyYearSizes.map(([year, size]) => {
    const entries = items.slice(offset, offset + size).map((item) => {
      const lines = item.split(/\n+/).map((line) => line.trim()).filter(Boolean);
      return { month: lines[0], events: lines.slice(1) };
    });
    offset += size;
    return { year, entries };
  }).filter((group) => group.entries.length);
}

function HistoryPage({ page, navigate }) {
  const years = groupHistoryItems(page.lists);
  return (
    <>
      <SubHero page={{ ...page, title: "Milestones", media: [], heroDescription: "Selected PURIUM milestones that demonstrate product development, certification and market progress." }} navigate={navigate} />
      <SectionNavigation page={page} navigate={navigate} />
      <main className="section-space history-page">
        <div className="page-shell">
          <SourceNote page={page} />
          <section className="history-intro"><div><Eyebrow>PROGRESS & INNOVATION</Eyebrow><h2>A decade of product development and recognition.</h2></div><p>Explore PURIUM milestones by year without the duplicated entries and oversized image archive.</p></section>
          <div className="history-years">
            {years.map((group, index) => <details key={group.year} open={index === 0}><summary><strong>{group.year}</strong><span>{group.entries.reduce((total, entry) => total + entry.events.length, 0)} milestones</span><ChevronDown size={22} /></summary><div className="history-year-content">{group.entries.map((entry, entryIndex) => <article key={`${entry.month}-${entryIndex}`}><span>{entry.month}</span><div>{entry.events.map((event) => <p key={event}>{event}</p>)}</div></article>)}</div></details>)}
          </div>
        </div>
      </main>
      <CallToAction navigate={navigate} />
    </>
  );
}

function isReadableMedia(item) {
  return !/(icon|arrow|prev|next|download)/i.test(item?.local || item?.source || "");
}

function GenericPage({ page, navigate }) {
  const visibleMedia = page.media.filter(isReadableMedia);
  const isMediaForward = visibleMedia.length >= 6;
  const contentParagraphs = page.paragraphs.filter(Boolean);
  const displayHeadings = [...new Set(page.headings.filter(Boolean))];
  const uniqueListItems = page.lists.filter((item) => !contentParagraphs.includes(item) && !/^\d+$/.test(item.trim()));
  const documentGallery = /awards|certifications/.test(page.route);
  return (
    <>
      <SubHero page={{ ...page, media: visibleMedia }} navigate={navigate} />
      <SectionNavigation page={page} navigate={navigate} />
      <main className="section-space">
        <div className="page-shell">
          <SourceNote page={page} />

          {(contentParagraphs.length > 0 || displayHeadings.length > 0) && (
            <div className="editorial-layout">
              <aside>
                <Eyebrow>{page.category.toUpperCase()}</Eyebrow>
                <h2>{displayHeadings[0] || page.title}</h2>
                {displayHeadings.slice(1, 5).map((heading) => <span className="aside-kicker" key={heading}>{heading}</span>)}
              </aside>
              <article className="long-copy">
                {contentParagraphs.map((paragraph, index) => (
                  <div className="copy-block" key={`${paragraph.slice(0, 35)}-${index}`}>
                    <p>{paragraph}</p>
                  </div>
                ))}
                {uniqueListItems.length > 0 && <ul className="captured-list">{uniqueListItems.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul>}
                {page.tables.map((table, index) => <DataTable key={index} table={table} index={index} />)}
              </article>
            </div>
          )}

          {isMediaForward && (
            <section className="page-gallery-section">
              <div className="gallery-heading"><Eyebrow>VISUAL LIBRARY</Eyebrow><h2>{page.title.replace(/\n/g, " ")}</h2></div>
              <MediaGrid items={visibleMedia} title={page.title.replace(/\n/g, " ")} variant={documentGallery ? "documents" : ""} />
            </section>
          )}

          {!isMediaForward && visibleMedia.length > 0 && (
            <section className="page-gallery-section compact-gallery">
              <MediaGrid items={visibleMedia} title={page.title.replace(/\n/g, " ")} variant={documentGallery ? "documents" : ""} />
            </section>
          )}

          <VideoShowcase videos={page.videos} />
        </div>
      </main>
      <CallToAction navigate={navigate} />
    </>
  );
}

function NotFound({ navigate }) {
  return (
    <main className="not-found page-shell">
      <Eyebrow>404</Eyebrow><h1>That page has moved into cleaner air.</h1>
      <SiteLink to="/" navigate={navigate} className="button primary">Return home <ArrowRight size={18} /></SiteLink>
    </main>
  );
}

function Footer({ navigate, content, adminEnabled }) {
  return (
    <footer className="site-footer">
      <div className="page-shell footer-main">
        <div className="footer-brand"><img src={resolveAsset(content.brand.logo) || ASSETS.novaLogo} alt={content.brand.name} /><p>Exclusive global sales and distribution partner for PURIUM clean-air products and Smart Safeguards Gate technology.</p><a className="parent-company-link" href={content.brand.parentCompanyUrl} target="_blank" rel="noreferrer">{content.brand.parentCompanyLabel}<ArrowUpRight size={14} /></a></div>
        <div><span className="footer-label">Explore</span><SiteLink to="/products/overview" navigate={navigate}>Products</SiteLink><SiteLink to="/technology/core" navigate={navigate}>Technology</SiteLink><SiteLink to="/installations/7" navigate={navigate}>Installations</SiteLink></div>
        <div><span className="footer-label">Support</span><SiteLink to="/services/care" navigate={navigate}>Care service</SiteLink><SiteLink to="/contact/service" navigate={navigate}>After-sales service</SiteLink><SiteLink to="/contact/purchase" navigate={navigate}>Purchase inquiry</SiteLink></div>
        <div><span className="footer-label">Nova headquarters</span><p>{content.contact.address.split("\n").map((line) => <span key={line}>{line}<br /></span>)}</p><a href={content.contact.website} target="_blank" rel="noreferrer">Nova website</a></div>
      </div>
      <div className="page-shell footer-bottom"><span>© {new Date().getFullYear()} Nova Solutions Tech Inc.</span><span>Exclusive global sales & distribution partner for PURIUM</span><SiteLink to="/privacy" navigate={navigate}>Privacy policy</SiteLink>{adminEnabled && <SiteLink to="/admin" navigate={navigate}>Site admin</SiteLink>}</div>
    </footer>
  );
}

export function App() {
  const [path, setPath] = useState(currentPath);
  const [siteContent, setSiteContent] = useState(() => normalizeContent(defaultSiteContent));
  const [adminEnabled, setAdminEnabled] = useState(false);
  const apiBase = `${BASE_PATH}/api`;
  const pageMap = useMemo(() => new Map(publicPages.map((page) => {
    const merged = mergePageContent(page, siteContent);
    return [merged.route, merged];
  })), [siteContent]);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${apiBase}/content`, { signal: controller.signal })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Static deployment")))
      .then((value) => { setSiteContent(normalizeContent(value)); setAdminEnabled(true); })
      .catch(() => {});
    return () => controller.abort();
  }, [apiBase]);

  useEffect(() => {
    const onPopState = () => setPath(currentPath());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const navigate = (to) => {
    if (to === path) return;
    window.history.pushState({}, "", withBasePath(to));
    setPath(to);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const page = pageMap.get(path);
  if (path === "/admin") return <Admin apiBase={apiBase} content={siteContent} onContent={(value) => setSiteContent(normalizeContent(value))} navigate={navigate} sourcePages={publicPages} />;
  let content;
  if (path === "/") content = <Home navigate={navigate} content={siteContent} />;
  else if (!page) content = <NotFound navigate={navigate} />;
  else if (path.startsWith("/installations/")) content = <InstallationPage page={page} navigate={navigate} />;
  else if (path.startsWith("/contact/")) content = <ContactPage page={page} navigate={navigate} content={siteContent} apiBase={apiBase} />;
  else if (path === "/technology/core") content = <CycloneTechnology page={page} navigate={navigate} />;
  else if (path === "/technology/patents") content = <PatentPortfolio page={page} navigate={navigate} />;
  else if (path === "/technology/test-reports") content = <TestReports page={page} navigate={navigate} />;
  else if (path === "/about/company") content = <AboutNova page={page} navigate={navigate} />;
  else if (path === "/about/vision") content = <VisionPage page={page} navigate={navigate} />;
  else if (path === "/about/history") content = <HistoryPage page={page} navigate={navigate} />;
  else content = <GenericPage page={page} navigate={navigate} />;

  return (
    <div className="app-shell">
      <Header path={path} navigate={navigate} content={siteContent} />
      {content}
      <Footer navigate={navigate} content={siteContent} adminEnabled={adminEnabled} />
    </div>
  );
}
