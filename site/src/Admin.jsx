import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  FileVideo,
  Inbox,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  Save,
  Settings2,
  Upload,
} from "lucide-react";

const clone = (value) => JSON.parse(JSON.stringify(value));

function Field({ label, children, hint }) {
  return <label className="admin-field"><span>{label}</span>{children}{hint && <small>{hint}</small>}</label>;
}

function splitLines(value) {
  return value.split("\n").map((item) => item.trim()).filter(Boolean);
}

function splitParagraphs(value) {
  return value.split(/\n\s*\n/).map((item) => item.trim()).filter(Boolean);
}

export function Admin({ apiBase, content, onContent, navigate, sourcePages }) {
  const [session, setSession] = useState(null);
  const [checking, setChecking] = useState(true);
  const [loginError, setLoginError] = useState("");
  const [backendAvailable, setBackendAvailable] = useState(true);
  const [draft, setDraft] = useState(() => clone(content));
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedRoute, setSelectedRoute] = useState("/about/company");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const [inquiries, setInquiries] = useState([]);

  useEffect(() => setDraft(clone(content)), [content]);

  useEffect(() => {
    fetch(`${apiBase}/auth/session`, { credentials: "same-origin" })
      .then(async (response) => {
        if (!response.ok) throw new Error("unavailable");
        const result = await response.json();
        setSession(result.authenticated ? result : null);
      })
      .catch(() => setBackendAvailable(false))
      .finally(() => setChecking(false));
  }, [apiBase]);

  const routes = useMemo(() => sourcePages, [sourcePages]);
  const contentBase = apiBase.replace(/\/api$/, "");
  const assetUrl = (value) => /^(https?:|data:|blob:)/i.test(value || "") ? value : `${contentBase}${value || ""}`;
  const sourcePage = routes.find((page) => page.route === selectedRoute);
  const override = draft.pageOverrides[selectedRoute] || {};

  const setPath = (path, value) => {
    setDraft((current) => {
      const next = clone(current);
      let target = next;
      path.slice(0, -1).forEach((key) => { target = target[key]; });
      target[path[path.length - 1]] = value;
      return next;
    });
  };

  const setOverride = (key, value) => {
    setDraft((current) => ({
      ...current,
      pageOverrides: {
        ...current.pageOverrides,
        [selectedRoute]: { ...(current.pageOverrides[selectedRoute] || {}), [key]: value },
      },
    }));
  };

  const login = async (event) => {
    event.preventDefault();
    setLoginError("");
    const values = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const response = await fetch(`${apiBase}/auth/login`, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Sign-in failed");
      setSession(result);
      setBackendAvailable(true);
    } catch (error) {
      setLoginError(error.message === "Failed to fetch" ? "The secure admin server is not available on this deployment." : error.message);
    }
  };

  const save = async () => {
    setSaving(true);
    setNotice("");
    try {
      const response = await fetch(`${apiBase}/content`, {
        method: "PUT",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to save");
      onContent(result.content);
      setNotice("Changes saved and published to this server.");
    } catch (error) {
      setNotice(error.message);
    } finally {
      setSaving(false);
    }
  };

  const uploadMedia = async (file) => {
    if (!file) return null;
    const data = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    const response = await fetch(`${apiBase}/media`, {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename: file.name, mime: file.type, data }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Upload failed");
    return result.url;
  };

  const loadInquiries = async () => {
    const response = await fetch(`${apiBase}/inquiries`, { credentials: "same-origin" });
    if (response.ok) setInquiries((await response.json()).inquiries || []);
  };

  useEffect(() => { if (session && activeTab === "inquiries") loadInquiries(); }, [session, activeTab]);

  if (checking) return <div className="admin-gate"><div className="admin-login-card"><p>Opening Nova Admin Studio…</p></div></div>;

  if (!session) {
    return (
      <div className="admin-gate">
        <button className="admin-back" onClick={() => navigate("/")}><ArrowLeft size={18} /> Back to website</button>
        <form className="admin-login-card" onSubmit={login}>
          <div className="admin-mark"><LockKeyhole size={24} /></div>
          <span>NOVA CONTENT STUDIO</span>
          <h1>Website administration</h1>
          <p>Manage Nova messaging, product pages, brand media, videos and incoming inquiries.</p>
          {!backendAvailable && <div className="admin-warning">This GitHub Pages copy is read-only. Deploy the included Nova server to enable secure editing.</div>}
          <Field label="Username"><input name="username" autoComplete="username" required /></Field>
          <Field label="Password"><input name="password" type="password" autoComplete="current-password" required /></Field>
          {loginError && <div className="admin-error">{loginError}</div>}
          <button className="button primary" type="submit">Sign in</button>
        </form>
      </div>
    );
  }

  const tabs = [
    ["overview", LayoutDashboard, "Overview"],
    ["identity", Settings2, "Identity & homepage"],
    ["company", Settings2, "Company & contact"],
    ["pages", LayoutDashboard, "Page editor"],
    ["media", FileVideo, "Media & video"],
    ["inquiries", Inbox, "Inquiries"],
    ["security", LockKeyhole, "Security"],
  ];

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <button className="admin-brand" onClick={() => navigate("/")}><img src={assetUrl(draft.brand.logo)} alt="Nova" /><span><strong>NOVA</strong>Content Studio</span></button>
        <nav>{tabs.map(([id, Icon, label]) => <button key={id} className={activeTab === id ? "active" : ""} onClick={() => setActiveTab(id)}><Icon size={18} />{label}</button>)}</nav>
        <button className="admin-logout" onClick={async () => { await fetch(`${apiBase}/auth/logout`, { method: "POST", credentials: "same-origin" }); setSession(null); }}><LogOut size={18} /> Sign out</button>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar"><div><span>Signed in as {session.username}</span><h1>{tabs.find(([id]) => id === activeTab)?.[2]}</h1></div><div className="admin-actions">{notice && <span className="admin-notice"><CheckCircle2 size={16} />{notice}</span>}<button className="button primary" onClick={save} disabled={saving}><Save size={17} />{saving ? "Saving…" : "Save changes"}</button></div></header>

        {activeTab === "overview" && <section className="admin-panel"><div className="admin-welcome"><span>PRODUCT-FIRST CONTENT</span><h2>Keep PURIUM technology in focus.</h2><p>Use the editors to update Nova’s positioning, contact details, every page’s copy, imagery and video library. Changes are stored by the Nova server and become visible immediately.</p></div><div className="admin-stat-grid"><article><strong>{routes.length}</strong><span>Editable public pages</span></article><article><strong>{draft.videos.length}</strong><span>Published videos</span></article><article><strong>{inquiries.length}</strong><span>Loaded inquiries</span></article></div></section>}

        {activeTab === "identity" && <section className="admin-panel admin-form-grid"><div><h2>Brand identity</h2><Field label="Organization name"><input value={draft.brand.name} onChange={(e) => setPath(["brand", "name"], e.target.value)} /></Field><Field label="Partner statement"><input value={draft.brand.partnerLabel} onChange={(e) => setPath(["brand", "partnerLabel"], e.target.value)} /></Field><Field label="Logo URL"><input value={draft.brand.logo} onChange={(e) => setPath(["brand", "logo"], e.target.value)} /></Field><Field label="Upload a logo" hint="PNG, JPG or WebP"><input type="file" accept="image/png,image/jpeg,image/webp" onChange={async (e) => { try { const url = await uploadMedia(e.target.files[0]); if (url) setPath(["brand", "logo"], url); } catch (error) { setNotice(error.message); } }} /></Field><Field label="Parent company link label"><input value={draft.brand.parentCompanyLabel} onChange={(e) => setPath(["brand", "parentCompanyLabel"], e.target.value)} /></Field><Field label="Parent company website"><input type="url" value={draft.brand.parentCompanyUrl} onChange={(e) => setPath(["brand", "parentCompanyUrl"], e.target.value)} /></Field></div><div><h2>Homepage hero</h2><Field label="Eyebrow"><input value={draft.home.eyebrow} onChange={(e) => setPath(["home", "eyebrow"], e.target.value)} /></Field><Field label="Headline — one line per row"><textarea rows="4" value={draft.home.headline.join("\n")} onChange={(e) => setPath(["home", "headline"], splitLines(e.target.value))} /></Field><Field label="Description"><textarea rows="5" value={draft.home.description} onChange={(e) => setPath(["home", "description"], e.target.value)} /></Field><Field label="Hero image URL"><input value={draft.home.heroImage} onChange={(e) => setPath(["home", "heroImage"], e.target.value)} /></Field></div></section>}

        {activeTab === "company" && <section className="admin-panel admin-form-grid"><div><h2>Nova positioning</h2><Field label="Company title"><input value={draft.company.title} onChange={(e) => setPath(["company", "title"], e.target.value)} /></Field><Field label="Eyebrow"><input value={draft.company.eyebrow} onChange={(e) => setPath(["company", "eyebrow"], e.target.value)} /></Field><Field label="Summary"><textarea rows="5" value={draft.company.summary} onChange={(e) => setPath(["company", "summary"], e.target.value)} /></Field><Field label="Company paragraphs — blank line between paragraphs"><textarea rows="12" value={draft.company.paragraphs.join("\n\n")} onChange={(e) => setPath(["company", "paragraphs"], splitParagraphs(e.target.value))} /></Field></div><div><h2>Nova contact point</h2><Field label="Headquarters"><textarea rows="4" value={draft.contact.address} onChange={(e) => setPath(["contact", "address"], e.target.value)} /></Field><Field label="Website"><input value={draft.contact.website} onChange={(e) => setPath(["contact", "website"], e.target.value)} /></Field><Field label="Fallback inquiry portal"><input value={draft.contact.inquiryPortal} onChange={(e) => setPath(["contact", "inquiryPortal"], e.target.value)} /></Field><Field label="Contact introduction"><textarea rows="6" value={draft.contact.intro} onChange={(e) => setPath(["contact", "intro"], e.target.value)} /></Field></div></section>}

        {activeTab === "pages" && <section className="admin-panel"><div className="page-editor-toolbar"><Field label="Choose a page"><select value={selectedRoute} onChange={(e) => setSelectedRoute(e.target.value)}>{routes.map((page) => <option key={page.route} value={page.route}>{page.title.replace(/\n/g, " ")} — {page.route}</option>)}</select></Field><span>{selectedRoute}</span></div><div className="admin-form-grid"><div><Field label="Page title"><input value={override.title ?? sourcePage?.title ?? ""} onChange={(e) => setOverride("title", e.target.value)} /></Field><Field label="Eyebrow"><input value={override.eyebrow ?? sourcePage?.eyebrow ?? ""} onChange={(e) => setOverride("eyebrow", e.target.value)} /></Field><Field label="Section headings — one per line"><textarea rows="7" value={(override.headings ?? sourcePage?.headings ?? []).join("\n")} onChange={(e) => setOverride("headings", splitLines(e.target.value))} /></Field><Field label="Structured items — blank line between items"><textarea rows="12" value={(override.lists ?? sourcePage?.lists ?? []).join("\n\n")} onChange={(e) => setOverride("lists", splitParagraphs(e.target.value))} /></Field></div><div><Field label="Body paragraphs — blank line between paragraphs"><textarea rows="16" value={(override.paragraphs ?? sourcePage?.paragraphs ?? []).join("\n\n")} onChange={(e) => setOverride("paragraphs", splitParagraphs(e.target.value))} /></Field><Field label="Image URLs — one per line"><textarea rows="6" value={(override.media ?? sourcePage?.media?.map((item) => item.local) ?? []).join("\n")} onChange={(e) => setOverride("media", splitLines(e.target.value))} /></Field></div></div></section>}

        {activeTab === "media" && <section className="admin-panel"><div className="admin-form-grid"><div><h2>Upload media</h2><p>Upload a photo, logo or video and copy its URL into any page or brand field.</p><label className="upload-drop"><Upload size={28} /><strong>Choose an image or video</strong><span>JPG, PNG, WebP, GIF, MP4 or WebM</span><input type="file" accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm" onChange={async (e) => { try { const url = await uploadMedia(e.target.files[0]); if (url) setNotice(`Uploaded: ${url}`); } catch (error) { setNotice(error.message); } }} /></label></div><div><h2>Video showcase</h2><p>Add uploaded video URLs or supported YouTube/Vimeo links.</p>{draft.videos.map((video, index) => <div className="video-editor" key={`${video.url}-${index}`}><input placeholder="Video title" value={video.title} onChange={(e) => { const next = clone(draft.videos); next[index].title = e.target.value; setPath(["videos"], next); }} /><input placeholder="https://…" value={video.url} onChange={(e) => { const next = clone(draft.videos); next[index].url = e.target.value; setPath(["videos"], next); }} /><button onClick={() => setPath(["videos"], draft.videos.filter((_, itemIndex) => itemIndex !== index))}>Remove</button></div>)}<button className="button secondary" onClick={() => setPath(["videos"], [...draft.videos, { title: "PURIUM technology", url: "" }])}><FileVideo size={17} /> Add video</button></div></div></section>}

        {activeTab === "inquiries" && <section className="admin-panel"><div className="inquiry-list"><h2>Nova inquiries</h2>{inquiries.length === 0 ? <p>No inquiries have been received on this server yet.</p> : inquiries.map((item) => <article key={item.id}><div><strong>{item.name}</strong><span>{item.organization} · {item.region}</span></div><p>{item.message}</p><small>{item.email}{item.phone ? ` · ${item.phone}` : ""} · {new Date(item.createdAt).toLocaleString()}</small></article>)}</div></section>}

        {activeTab === "security" && <section className="admin-panel narrow-panel"><h2>Change administrator password</h2>{session.mustChangePassword && <div className="admin-warning">The temporary password is still active. Change it before production launch.</div>}<form onSubmit={async (event) => { event.preventDefault(); const values = Object.fromEntries(new FormData(event.currentTarget)); const response = await fetch(`${apiBase}/auth/change-password`, { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) }); const result = await response.json(); setNotice(response.ok ? "Administrator password updated." : result.error); if (response.ok) setSession({ ...session, mustChangePassword: false }); }}><Field label="Current password"><input type="password" name="currentPassword" required /></Field><Field label="New password" hint="At least 12 characters"><input type="password" name="newPassword" minLength="12" required /></Field><button className="button primary" type="submit">Update password</button></form></section>}
      </main>
    </div>
  );
}
