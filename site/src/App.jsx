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

const media = (url) => assetMap[url];

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
      ["Message from the CEO", "/about/ceo"],
      ["Company overview", "/about/company"],
      ["Awards", "/about/awards"],
      ["Enterprise certifications", "/about/certifications"],
      ["Identity", "/about/identity"],
      ["Vision", "/about/vision"],
      ["History", "/about/history"],
      ["Where to find us", "/about/location"],
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
  return window.location.pathname.replace(/\/$/, "") || "/";
}

function SiteLink({ to, navigate, children, className = "", onClick }) {
  return (
    <a
      href={to}
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

function Header({ path, navigate }) {
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
        <img src={ASSETS.novaLogo} alt="Nova Solutions Tech" />
        <span>
          <strong>GLOBAL DISTRIBUTOR</strong>
          <small>OF PURIUM</small>
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

function Home({ navigate }) {
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
      <section className="home-hero" style={{ backgroundImage: `url(${ASSETS.hero})` }}>
        <div className="hero-shade" />
        <div className="hero-content page-shell">
          <Eyebrow light>GLOBAL DISTRIBUTOR OF PURIUM</Eyebrow>
          <h1>Clean air.<br />Smarter spaces.<br /><em>Global reach.</em></h1>
          <p>
            Nova Solutions Tech brings PURIUM’s patented Smart Safeguards Gate and integrated clean-air technologies to global markets.
          </p>
          <div className="hero-actions">
            <SiteLink to="/products/overview" navigate={navigate} className="button primary">
              Explore PURIUM <ArrowRight size={18} />
            </SiteLink>
            <SiteLink to="/contact/purchase" navigate={navigate} className="button ghost">
              Request a proposal
            </SiteLink>
          </div>
        </div>
        <div className="hero-index">NOVA × PURIUM <span>01</span></div>
      </section>

      <section className="proof-strip">
        <div className="page-shell proof-grid">
          <div><strong>01</strong><span>World-first patented walk-through air purification</span></div>
          <div><strong>05</strong><span>Integrated safeguards in one connected system</span></div>
          <div><strong>GLOBAL</strong><span>Distribution and market integration by Nova</span></div>
        </div>
      </section>

      <section className="intro-section section-space">
        <div className="page-shell split-intro">
          <div className="intro-copy">
            <Eyebrow>THE PURIUM DIFFERENCE</Eyebrow>
            <h2>A new standard for safer, cleaner shared spaces.</h2>
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
            <h2>Cyclone<br />Turbo Air Shot</h2>
            <p>A precision-engineered air curtain helps prevent contaminants from moving deeper into a facility while supporting powerful circulation and filtration.</p>
            <SiteLink to="/technology/core" navigate={navigate} className="button light">See how it works <ArrowRight size={18} /></SiteLink>
          </div>
        </div>
      </section>

      <section className="products-section section-space">
        <div className="page-shell section-heading-row">
          <div><Eyebrow>PRODUCT PORTFOLIO</Eyebrow><h2>Built for the way<br />people move.</h2></div>
          <p>From major public facilities to compact indoor environments, PURIUM offers a flexible family of clean-air solutions.</p>
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
          <p>Nova supports international market entry while PURIUM’s service system covers delivery, installation and ongoing product care.</p>
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

function MediaGrid({ items, title }) {
  const [active, setActive] = useState(null);
  if (!items.length) return null;
  return (
    <>
      <div className={`media-grid ${items.length < 3 ? "compact" : ""}`}>
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

function InquiryForm({ service = false }) {
  const [sent, setSent] = useState(false);
  if (sent) {
    return (
      <div className="form-success" role="status">
        <CheckCircle2 size={44} />
        <h3>Thank you. Your inquiry is ready for Nova’s team.</h3>
        <p>This prototype confirms the complete form experience. Connect it to your email or CRM before launch.</p>
        <button type="button" onClick={() => setSent(false)}>Send another inquiry</button>
      </div>
    );
  }
  return (
    <form className="inquiry-form" onSubmit={(event) => { event.preventDefault(); setSent(true); }}>
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
      <button type="submit" className="button primary">Submit inquiry <ArrowRight size={18} /></button>
    </form>
  );
}

function ContactPage({ page, navigate }) {
  return (
    <>
      <SubHero page={page} navigate={navigate} />
      <main className="page-shell content-layout section-space">
        <aside>
          <Eyebrow>CONTACT NOVA</Eyebrow>
          <h2>{page.route === "/contact/service" ? "After-sales support" : "Start a conversation"}</h2>
          <p>Tell us about your organization, facility or market. Nova Solutions Tech will route your request to the right commercial or technical contact.</p>
          <div className="address-block"><span>HEADQUARTER</span><strong>9970 148 Street<br />Surrey, BC V3R 0P9<br />Canada</strong></div>
        </aside>
        <InquiryForm service={page.route === "/contact/service"} />
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
        <p>Official PURIUM product and company information, presented globally by Nova Solutions Tech.</p>
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

function GenericPage({ page, navigate }) {
  const isHistory = page.route === "/about/history";
  const isMediaForward = page.media.length >= 6;
  const contentParagraphs = page.paragraphs.filter(Boolean);
  return (
    <>
      <SubHero page={page} navigate={navigate} />
      <SectionNavigation page={page} navigate={navigate} />
      <main className="section-space">
        <div className="page-shell">
          <div className="source-note"><Globe2 size={18} /><span>Product and corporate information supplied by PURIUM Co., Ltd.</span><a href={page.sourceUrl} target="_blank" rel="noreferrer">Original source <ArrowUpRight size={14} /></a></div>

          {(contentParagraphs.length > 0 || page.headings.length > 0) && (
            <div className={`editorial-layout ${isHistory ? "history-layout" : ""}`}>
              <aside>
                <Eyebrow>{page.category.toUpperCase()}</Eyebrow>
                <h2>{page.headings[0] || page.title}</h2>
                {page.headings.slice(1, 5).map((heading) => <span className="aside-kicker" key={heading}>{heading}</span>)}
              </aside>
              <article className={isHistory ? "timeline-copy" : "long-copy"}>
                {contentParagraphs.map((paragraph, index) => (
                  <div className={isHistory ? "timeline-entry" : "copy-block"} key={`${paragraph.slice(0, 35)}-${index}`}>
                    {isHistory && <span>{String(index + 1).padStart(2, "0")}</span>}
                    <p>{paragraph}</p>
                  </div>
                ))}
                {page.lists.length > 0 && <ul className="captured-list">{page.lists.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul>}
                {page.tables.map((table, index) => <DataTable key={index} table={table} index={index} />)}
              </article>
            </div>
          )}

          {isMediaForward && (
            <section className="page-gallery-section">
              <div className="gallery-heading"><Eyebrow>VISUAL LIBRARY</Eyebrow><h2>{page.title.replace(/\n/g, " ")}</h2></div>
              <MediaGrid items={page.media} title={page.title.replace(/\n/g, " ")} />
            </section>
          )}

          {!isMediaForward && page.media.length > 0 && (
            <section className="page-gallery-section compact-gallery">
              <MediaGrid items={page.media} title={page.title.replace(/\n/g, " ")} />
            </section>
          )}
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

function Footer({ navigate }) {
  return (
    <footer className="site-footer">
      <div className="page-shell footer-main">
        <div className="footer-brand"><img src={ASSETS.novaLogo} alt="Nova Solutions Tech" /><p>Global distributor of PURIUM clean-air and Smart Safeguards Gate technologies.</p></div>
        <div><span className="footer-label">Explore</span><SiteLink to="/products/overview" navigate={navigate}>Products</SiteLink><SiteLink to="/technology/core" navigate={navigate}>Technology</SiteLink><SiteLink to="/installations/7" navigate={navigate}>Installations</SiteLink></div>
        <div><span className="footer-label">Support</span><SiteLink to="/services/care" navigate={navigate}>Care service</SiteLink><SiteLink to="/contact/service" navigate={navigate}>After-sales service</SiteLink><SiteLink to="/contact/purchase" navigate={navigate}>Purchase inquiry</SiteLink></div>
        <div><span className="footer-label">Headquarter</span><p>9970 148 Street<br />Surrey, BC V3R 0P9<br />Canada</p></div>
      </div>
      <div className="page-shell footer-bottom"><span>© {new Date().getFullYear()} Nova Solutions Tech Inc.</span><span>Global Distributor of PURIUM</span><SiteLink to="/privacy" navigate={navigate}>Privacy policy</SiteLink></div>
    </footer>
  );
}

export function App() {
  const [path, setPath] = useState(currentPath);
  const pageMap = useMemo(() => new Map(pages.map((page) => [page.route, page])), []);

  useEffect(() => {
    const onPopState = () => setPath(currentPath());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const navigate = (to) => {
    if (to === path) return;
    window.history.pushState({}, "", to);
    setPath(to);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const page = pageMap.get(path);
  let content;
  if (path === "/") content = <Home navigate={navigate} />;
  else if (!page) content = <NotFound navigate={navigate} />;
  else if (path.startsWith("/installations/")) content = <InstallationPage page={page} navigate={navigate} />;
  else if (path.startsWith("/contact/")) content = <ContactPage page={page} navigate={navigate} />;
  else content = <GenericPage page={page} navigate={navigate} />;

  return (
    <div className="app-shell">
      <Header path={path} navigate={navigate} />
      {content}
      <Footer navigate={navigate} />
    </div>
  );
}
