/* usenoni.app /ops — Noni platform console. Overview = performance across
   companies; company page = Analytics / Team / Settings tabs. */

const OPS_NAV = [
  { label: 'Platform', items: [
    { label: 'Overview', icon: 'gauge' },
    { label: 'Companies', icon: 'layout-grid' },
    { label: 'Users', icon: 'users' },
    { label: 'Invites', icon: 'send' },
  ]},
];

const SEED_COMPANIES = [
  { id: 'c1', name: 'FieldVision AI', website: 'fieldvision.ai', admin: { name: 'Elan Rosen', email: 'elan@fieldvision.ai' }, creators: 4, managers: 1, campaigns: 3, posts: 128, views: '1.2M', status: 'Active', joined: 'Jun 2, 2026',
    series: [60, 72, 85, 80, 95, 110, 124, 118, 140, 156, 170, 188], deltas: { views: '+18% vs July', posts: '+9% vs July', campaigns: '1 ended Aug 3', creators: '+1 this month' }, formats: { Video: 82, Carousel: 46 } },
  { id: 'c2', name: 'Custom Cleats Co', website: 'customcleats.co', admin: { name: 'Dana Whitfield', email: 'dana@customcleats.co' }, creators: 4, managers: 2, campaigns: 4, posts: 210, views: '840k', status: 'Active', joined: 'Jul 14, 2026',
    series: [38, 44, 52, 61, 58, 66, 72, 80, 84, 90, 96, 104], deltas: { views: '+11% vs July', posts: '+24% vs July', campaigns: '2 started in Aug', creators: 'Steady' }, formats: { Video: 118, Carousel: 92 } },
  { id: 'c3', name: 'Peak Form Labs', website: 'peakformlabs.com', admin: { name: 'Marcus Oduya', email: 'marcus@peakformlabs.com' }, creators: 0, managers: 0, campaigns: 0, posts: 0, views: '—', status: 'Invite pending', joined: 'Aug 9, 2026',
    series: [], deltas: {}, formats: {} },
];

const SEED_PEOPLE = [
  { id: 'p1', company: 'c1', role: 'Company admin', name: 'Elan Rosen', email: 'elan@fieldvision.ai', phone: '+1 (305) 741-2280', status: 'Active', joined: 'Jun 2, 2026' },
  { id: 'p2', company: 'c1', role: 'Campaign manager', name: 'Sofia Marek', email: 'sofia@fieldvision.ai', phone: '+1 (786) 220-1148', status: 'Active', joined: 'Jun 9, 2026' },
  { id: 'p3', company: 'c1', role: 'Creator', name: 'Maya Reyes', email: 'maya.reyes@gmail.com', phone: '+1 (813) 402-9917', status: 'Onboarded', joined: 'Jun 12, 2026', posts: 42, viewsN: 389000 },
  { id: 'p4', company: 'c1', role: 'Creator', name: 'Jordan Tate', email: 'jordantate@gmail.com', phone: '+1 (407) 318-5526', status: 'Onboarded', joined: 'Jun 15, 2026', posts: 38, viewsN: 341000 },
  { id: 'p5', company: 'c1', role: 'Creator', name: 'Devon Kim', email: 'devon.kim@gmail.com', phone: '+1 (954) 630-2211', status: 'Onboarded', joined: 'Jul 2, 2026', posts: 26, viewsN: 204000 },
  { id: 'p6', company: 'c1', role: 'Creator', name: 'Aliyah Grant', email: 'aliyahgrant@gmail.com', phone: '+1 (321) 884-7703', status: 'Pending', joined: 'Aug 8, 2026', posts: 0, viewsN: 0 },
  { id: 'p7', company: 'c2', role: 'Company admin', name: 'Dana Whitfield', email: 'dana@customcleats.co', phone: '+1 (646) 302-8841', status: 'Active', joined: 'Jul 14, 2026' },
  { id: 'p8', company: 'c2', role: 'Campaign manager', name: 'Ray Delgado', email: 'ray@customcleats.co', phone: '+1 (917) 556-2384', status: 'Active', joined: 'Jul 18, 2026' },
  { id: 'p9', company: 'c2', role: 'Campaign manager', name: 'Tess Boyd', email: 'tess@customcleats.co', phone: '+1 (718) 209-4415', status: 'Active', joined: 'Jul 21, 2026' },
  { id: 'p10', company: 'c2', role: 'Creator', name: 'Lena Ortiz', email: 'lenaortiz@gmail.com', phone: '+1 (347) 771-0492', status: 'Onboarded', joined: 'Jul 20, 2026', posts: 51, viewsN: 312000 },
  { id: 'p11', company: 'c2', role: 'Creator', name: 'Sam Whitaker', email: 'samwhit@gmail.com', phone: '+1 (929) 415-8830', status: 'Onboarded', joined: 'Jul 22, 2026', posts: 33, viewsN: 188000 },
  { id: 'p12', company: 'c2', role: 'Creator', name: 'Priya Nair', email: 'priya.nair@gmail.com', phone: '+1 (201) 668-3172', status: 'Onboarded', joined: 'Jul 25, 2026', posts: 29, viewsN: 162000 },
  { id: 'p13', company: 'c2', role: 'Creator', name: 'Chris Boone', email: 'chrisboone@gmail.com', phone: '+1 (551) 380-9906', status: 'Pending', joined: 'Aug 10, 2026', posts: 0, viewsN: 0 },
  { id: 'p14', company: 'c3', role: 'Company admin', name: 'Marcus Oduya', email: 'marcus@peakformlabs.com', phone: '—', status: 'Invite pending', joined: 'Aug 9, 2026' },
];

const SEED_POSTS = [
  { id: 'q1', company: 'c1', title: 'POV: your film session runs itself', creator: 'Maya Reyes', format: 'Video', viewsN: 122000, earned: 340, date: 'Aug 9', day: 9, link: 'https://tiktok.com', tt: { views: 84000, saves: 3100, likes: 9200 }, ig: { views: 38000, saves: 1400, likes: 4100 }, sales: 1240, signups: 46 },
  { id: 'q2', company: 'c1', title: '3 drills college scouts actually watch', creator: 'Jordan Tate', format: 'Carousel', viewsN: 98000, earned: 275, date: 'Aug 10', day: 10, link: 'https://instagram.com', tt: { views: 61000, saves: 2400, likes: 6800 }, ig: { views: 37000, saves: 1900, likes: 3900 }, sales: 980, signups: 31 },
  { id: 'q3', company: 'c1', title: 'How we cut film review to 10 minutes', creator: 'Maya Reyes', format: 'Video', viewsN: 87000, earned: 240, date: 'Aug 6', day: 6, link: 'https://tiktok.com', tt: { views: 52000, saves: 1800, likes: 5100 }, ig: { views: 35000, saves: 1200, likes: 3300 }, sales: 760, signups: 24 },
  { id: 'q4', company: 'c1', title: 'Sideline setup in 60 seconds', creator: 'Devon Kim', format: 'Video', viewsN: 64000, earned: 180, date: 'Aug 2', day: 2, link: 'https://tiktok.com', tt: { views: 41000, saves: 1300, likes: 3600 }, ig: { views: 23000, saves: 800, likes: 2100 }, sales: 510, signups: 15 },
  { id: 'q5', company: 'c2', title: "Rating my teammates' custom cleats", creator: 'Lena Ortiz', format: 'Video', viewsN: 141000, earned: 395, date: 'Aug 9', day: 9, link: 'https://tiktok.com', tt: { views: 96000, saves: 3800, likes: 11400 }, ig: { views: 45000, saves: 1700, likes: 5200 }, sales: 1080, signups: 38 },
  { id: 'q6', company: 'c2', title: 'Design your dream cleat in 3 taps', creator: 'Sam Whitaker', format: 'Carousel', viewsN: 89000, earned: 250, date: 'Aug 11', day: 11, link: 'https://instagram.com', tt: { views: 51000, saves: 2100, likes: 5900 }, ig: { views: 38000, saves: 2300, likes: 4400 }, sales: 640, signups: 22 },
  { id: 'q7', company: 'c2', title: 'Unboxing the new colorway', creator: 'Priya Nair', format: 'Video', viewsN: 76000, earned: 215, date: 'Aug 3', day: 3, link: 'https://tiktok.com', tt: { views: 49000, saves: 1500, likes: 4300 }, ig: { views: 27000, saves: 900, likes: 2500 }, sales: 540, signups: 18 },
  { id: 'q8', company: 'c2', title: 'From sketch to cleat in 6 days', creator: 'Lena Ortiz', format: 'Carousel', viewsN: 58000, earned: 160, date: 'Aug 1', day: 1, link: 'https://instagram.com', tt: { views: 33000, saves: 1100, likes: 2900 }, ig: { views: 25000, saves: 1300, likes: 2400 }, sales: 280, signups: 9 },
];

const COMPANY_DAYS = {
  c1: { 2: { signups: 15, sales: 510, downloads: 88, views: 64000 }, 6: { signups: 24, sales: 760, downloads: 132, views: 87000 }, 9: { signups: 46, sales: 1240, downloads: 210, views: 122000 }, 10: { signups: 31, sales: 980, downloads: 164, views: 98000 }, 11: { signups: 12, sales: 310, downloads: 70, views: 31000 } },
  c2: { 1: { signups: 9, sales: 280, downloads: 54, views: 58000 }, 3: { signups: 18, sales: 540, downloads: 96, views: 76000 }, 9: { signups: 38, sales: 1080, downloads: 190, views: 141000 }, 11: { signups: 22, sales: 640, downloads: 120, views: 89000 } },
};
const COMPANY_BILLING = {
  c1: { monthly: 2500, spent: 2140, topups: [{ amt: 1000, date: 'Aug 1' }, { amt: 500, date: 'Jul 18' }, { amt: 1000, date: 'Jul 2' }], pingTo: 'Elan' },
  c2: { monthly: 3000, spent: 1210, topups: [{ amt: 1000, date: 'Aug 4' }, { amt: 2000, date: 'Jul 14' }], pingTo: 'Dana' },
};
const SEED_BRIEFS = [
  { id: 'b1', company: 'c1', title: 'Film session runs itself', format: 'Video', status: 'Active', day: 9, hook: 'Your film crew quit? Good.', script: 'Open on an empty sideline. Mount the phone. Auto-tracking follows the play; clips land in the app before the huddle breaks.', caption: 'One phone. Full film crew. #fieldvision' },
  { id: 'b2', company: 'c1', title: 'Drills scouts watch', format: 'Carousel', status: 'Active', day: 10, hook: '3 drills college scouts actually pause on', script: 'One slide per drill: name it, show the rep, name the metric scouts read off it.', caption: 'Save this for fall camp.' },
  { id: 'b3', company: 'c1', title: '10-minute film review', format: 'Video', status: 'Archived', day: 6, hook: 'We cut film night to 10 minutes', script: 'Before/after split: three-hour film night vs auto-clipped highlight review on the bus home.', caption: 'Coaches, reclaim your Sunday.' },
  { id: 'b4', company: 'c2', title: 'Teammate cleat ratings', format: 'Video', status: 'Active', day: 9, hook: "Rating my teammates' custom cleats", script: 'Walk the locker room, one honest rating per pair, end on your own design.', caption: 'Drop your rating below.' },
  { id: 'b5', company: 'c2', title: 'Dream cleat configurator', format: 'Carousel', status: 'Active', day: 11, hook: 'Design your dream cleat in 3 taps', script: 'Slide per step: base, colorway, stitch detail. Last slide is the checkout screen.', caption: 'Link in bio to build yours.' },
];
const money = (n) => '$' + n.toLocaleString();
const moneyK = (n) => n >= 1000 ? '$' + (n / 1000).toFixed(1) + 'k' : '$' + n;

const SEED_INVITES = [
  { id: 'i1', name: 'Marcus Oduya', email: 'marcus@peakformlabs.com', company: 'Peak Form Labs', sent: '2 days ago', status: 'Pending' },
  { id: 'i2', name: 'Dana Whitfield', email: 'dana@customcleats.co', company: 'Custom Cleats Co', sent: 'Jul 14', status: 'Accepted' },
  { id: 'i3', name: 'Elan Rosen', email: 'elan@fieldvision.ai', company: 'FieldVision AI', sent: 'Jun 2', status: 'Accepted' },
];

const statusTone = (s) => ['Active', 'Accepted', 'Onboarded'].includes(s) ? 'green' : s === 'Expired' ? 'slate' : 'amber';
const companyName = (id) => (SEED_COMPANIES.find((c) => c.id === id) || {}).name || '';
const fmtK = (n) => n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : n >= 1e3 ? Math.round(n / 1e3) + 'k' : '' + Math.round(n);

/* ---------- charts ---------- */

function AreaChart({ series, vb = 240, labels = ['May 25', 'Jun 8', 'Jun 22', 'Jul 6', 'Jul 20', 'Aug 3'], yFmt = (v) => fmtK(v * 1000) }) {
  const W = 640, H = vb, P = { t: 14, r: 10, b: 26, l: 42 };
  const max = Math.max(...series) * 1.15;
  const iw = W - P.l - P.r, ih = H - P.t - P.b;
  const pts = series.map((v, i) => [P.l + iw * i / (series.length - 1), P.t + ih * (1 - v / max)]);
  const line = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const last = pts[pts.length - 1];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      {[0, 0.5, 1].map((f, i) => (
        <g key={i}>
          <line x1={P.l} x2={W - P.r} y1={P.t + ih * f} y2={P.t + ih * f} stroke="var(--line)" strokeWidth="1" />
          <text x={P.l - 8} y={P.t + ih * f + 4} textAnchor="end" style={{ font: '600 11px var(--web-ui)', fill: 'var(--slate-400)' }}>{yFmt(max * (1 - f))}</text>
        </g>
      ))}
      <path d={`${line} L ${(P.l + iw).toFixed(1)} ${P.t + ih} L ${P.l} ${P.t + ih} Z`} fill="rgba(27,166,238,0.10)" />
      <path d={line} fill="none" stroke="var(--blue-500)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={last[0]} cy={last[1]} r="4.5" fill="var(--blue-500)" stroke="#fff" strokeWidth="2" />
      {labels.map((w, i) => <text key={w + i} x={P.l + iw * (labels.length > 1 ? i / (labels.length - 1) : 0)} y={H - 6} textAnchor="middle" style={{ font: '600 11px var(--web-ui)', fill: 'var(--slate-400)' }}>{w}</text>)}
    </svg>
  );
}

function BarRow({ label, value, max, suffix }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{ width: 74, font: '600 13px var(--web-ui)', color: 'var(--slate-500)' }}>{label}</span>
      <span style={{ flex: 1, height: 10, borderRadius: 999, background: 'var(--fill-quiet)', overflow: 'hidden' }}>
        <span style={{ display: 'block', width: `${Math.round(100 * value / max)}%`, height: '100%', borderRadius: 999, background: 'var(--blue-500)' }} />
      </span>
      <span style={{ width: 70, textAlign: 'right', font: '700 13px var(--web-ui)', color: 'var(--ink)' }}>{value}{suffix || ''}</span>
    </div>
  );
}

/* ---------- shared bits ---------- */

function StatInline({ label, value, delta }) {
  return (
    <span style={{ flex: 1, minWidth: 0 }}>
      <span style={{ display: 'block', font: '600 13px var(--web-ui)', color: 'var(--slate-400)' }}>{label}</span>
      <span style={{ display: 'block', margin: '6px 0 4px', font: '700 30px var(--web-display)', letterSpacing: '-0.7px', color: 'var(--ink)' }}>{value}</span>
      {delta ? <span style={{ font: '600 12.5px var(--web-ui)', color: delta.startsWith('+') ? 'var(--green, #1F9D5B)' : 'var(--slate-400)' }}>{delta}</span> : null}
    </span>
  );
}

function OpsStat({ label, value, meta }) {
  return (
    <KCard pad={18} style={{ flex: 1, minWidth: 0 }}>
      <KLabel>{label}</KLabel>
      <div style={{ margin: '10px 0 2px', font: '700 28px var(--web-display)', letterSpacing: '-0.8px', color: 'var(--ink)' }}>{value}</div>
      {meta ? <div style={{ font: '600 13px var(--web-ui)', color: 'var(--slate-400)' }}>{meta}</div> : null}
    </KCard>
  );
}

function KTabs({ tabs, active, onSelect, right }) {
  return (
    <div style={{ display: 'flex', gap: 4, marginBottom: 16, alignItems: 'center' }}>
      {tabs.map((t) => (
        <button key={t} type="button" onClick={() => onSelect(t)}
          style={{ padding: '7px 15px', borderRadius: 999, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', font: '700 13px var(--web-ui)', background: active === t ? 'var(--blue-100)' : 'transparent', color: active === t ? 'var(--blue-700)' : 'var(--slate-400)', transition: 'background var(--dur-fast) var(--ease-out)' }}>{t}</button>
      ))}
      <span style={{ flex: 1 }} />
      {right || null}
    </div>
  );
}

function CompanyCard({ c, onOpen }) {
  const [hover, setHover] = React.useState(false);
  const { Icon } = window.NoniDesignSystem_710e43;
  const Cell = ({ label, value }) => (
    <span style={{ flex: 1, minWidth: 0 }}>
      <span style={{ display: 'block', font: '700 19px var(--web-display)', letterSpacing: '-0.4px', color: 'var(--ink)' }}>{value}</span>
      <span style={{ display: 'block', marginTop: 2, font: '600 12px var(--web-ui)', color: 'var(--slate-400)' }}>{label}</span>
    </span>
  );
  return (
    <div role="button" onClick={onOpen} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ background: 'var(--white)', border: hover ? '1px solid var(--blue-300, var(--blue-500))' : '1px solid var(--border)', borderRadius: 16, padding: 20, cursor: 'pointer', boxShadow: hover ? 'var(--shadow-raised)' : 'var(--shadow-card)', transform: hover ? 'translateY(-3px)' : 'none', transition: 'transform 200ms var(--ease-out), box-shadow 200ms var(--ease-out), border-color 200ms var(--ease-out)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <KAvatar name={c.name} size={38} />
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: 'block', font: '700 16px var(--web-ui)', color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</span>
          <span style={{ display: 'block', marginTop: 1, font: '600 12.5px var(--web-ui)', color: 'var(--slate-400)' }}>{c.website || 'No website yet'}</span>
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, font: '700 13px var(--web-ui)', color: hover ? 'var(--blue-700)' : 'transparent', transition: 'color 200ms var(--ease-out)' }}>Open<Icon name="arrow-right" size={14} color={hover ? 'var(--blue-700)' : 'transparent'} /></span>
      </div>
      <div style={{ display: 'flex', gap: 12, marginTop: 18, paddingTop: 16, borderTop: '1px solid var(--line)' }}>
        <Cell label="Active campaigns" value={c.campaigns} />
        <Cell label="Posts this month" value={c.posts} />
        <Cell label="Views this month" value={c.views} />
        <Cell label="Creators" value={c.creators} />
      </div>
    </div>
  );
}

function CompanyRow({ c, onOpen, last }) {
  const { Icon } = window.NoniDesignSystem_710e43;
  const [hover, setHover] = React.useState(false);
  return (
    <div role="button" onClick={onOpen} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '15px 20px', cursor: 'pointer', background: hover ? 'var(--fill-quiet)' : 'transparent', borderBottom: last ? 'none' : '1px solid var(--line)', transition: 'background var(--dur-fast) var(--ease-out)' }}>
      <KAvatar name={c.name} size={38} />
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', font: '700 15px var(--web-ui)', color: 'var(--ink)' }}>{c.name}</span>
        <span style={{ display: 'block', marginTop: 2, font: '600 13px var(--web-ui)', color: 'var(--slate-400)' }}>{c.admin.email}</span>
      </span>
      <span style={{ font: '600 13px var(--web-ui)', color: 'var(--slate-400)', width: 210, textAlign: 'right' }}>{c.campaigns} campaigns · {c.posts} posts · {c.views} views</span>
      <KChip tone={statusTone(c.status)}>{c.status}</KChip>
      <Icon name="chevron-right" size={16} color="var(--slate-400)" />
    </div>
  );
}

/* ---------- modals ---------- */

function NewCompanyModal({ onClose, onCreate }) {
  const { Icon } = window.NoniDesignSystem_710e43;
  const [name, setName] = React.useState('');
  const [site, setSite] = React.useState('');
  const [adminName, setAdminName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [sent, setSent] = React.useState(false);
  const ready = name.trim() && adminName.trim() && /.+@.+\..+/.test(email);
  if (sent) return (
    <KModal title="Invite sent" onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '10px 4px 4px' }}>
        <span style={{ width: 54, height: 54, borderRadius: 999, background: 'var(--green-soft, #E4F6EC)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="circle-check-big" size={24} color="var(--green, #1F9D5B)" />
        </span>
        <div style={{ marginTop: 14, font: '700 16px var(--web-display)', letterSpacing: '-0.3px', color: 'var(--ink)' }}>{name} is on Noni</div>
        <p style={{ margin: '7px 0 18px', font: '600 14px/1.55 var(--web-ui)', color: 'var(--slate-400)', maxWidth: 330 }}>We emailed {email} an invite to be {name}'s admin. They'll sign in with Google and land in onboarding.</p>
        <KPill onClick={onClose} style={{ width: '100%' }}>Done</KPill>
      </div>
    </KModal>
  );
  return (
    <KModal title="New company" onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <KField label="Company name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Google" autoFocus />
        <KField label="Website" value={site} onChange={(e) => setSite(e.target.value)} placeholder="google.com" optional />
        <KField label="Company admin" value={adminName} onChange={(e) => setAdminName(e.target.value)} placeholder="John Smith" />
        <KField label="Admin email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="johnsmith@google.com" />
        <KPill icon="send" onClick={() => { if (ready) { onCreate({ name: name.trim(), website: site.trim(), adminName: adminName.trim(), email: email.trim() }); setSent(true); } }}
          style={{ width: '100%', opacity: ready ? 1 : 0.35, pointerEvents: ready ? 'auto' : 'none' }}>Send invite</KPill>
      </div>
    </KModal>
  );
}

function RemoveCompanyModal({ c, onClose, onConfirm }) {
  const [text, setText] = React.useState('');
  const ready = text.trim().toLowerCase() === 'remove this company';
  return (
    <KModal title={`Remove ${c.name}`} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <p style={{ margin: 0, font: '600 14px/1.55 var(--web-ui)', color: 'var(--slate-500)' }}>This permanently removes {c.name} — its admin, campaign managers and creators lose access. There's no undo.</p>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          <span style={{ font: '600 13px var(--web-ui)', color: 'var(--slate-500)' }}>To confirm, type <b style={{ color: 'var(--ink)' }}>remove this company</b></span>
          <input value={text} onChange={(e) => setText(e.target.value)} autoFocus
            style={{ width: '100%', boxSizing: 'border-box', border: '1px solid var(--border)', outline: 'none', background: 'var(--white)', borderRadius: 12, padding: '12px 14px', font: '600 14.5px var(--web-ui)', color: 'var(--ink)' }} />
        </label>
        <div style={{ display: 'flex', gap: 10 }}>
          <KPill variant="quiet" onClick={onClose} style={{ flex: 1 }}>Cancel</KPill>
          <KPill variant="danger" icon="trash-2" onClick={() => { if (ready) onConfirm(); }}
            style={{ flex: 1, opacity: ready ? 1 : 0.35, pointerEvents: ready ? 'auto' : 'none' }}>Remove company</KPill>
        </div>
      </div>
    </KModal>
  );
}

function ProfileModal({ p, onClose, onResend, resent, onViewFull }) {
  const Row = ({ label, value }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: '1px solid var(--line)' }}>
      <span style={{ width: 92, font: '600 12.5px var(--web-ui)', color: 'var(--slate-400)' }}>{label}</span>
      <span style={{ flex: 1, font: '600 14px var(--web-ui)', color: 'var(--ink)' }}>{value}</span>
    </div>
  );
  return (
    <KModal title="" onClose={onClose}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10, paddingRight: 40 }}>
        <KAvatar name={p.name} size={52} />
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: 'block', font: '700 18px var(--web-display)', letterSpacing: '-0.3px', color: 'var(--ink)' }}>{p.name}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}><KChip tone={p.role === 'Company admin' ? 'blue' : 'slate'}>{p.role}</KChip><KChip tone={statusTone(p.status)}>{p.status}</KChip></span>
        </span>
      </div>
      <div>
        <Row label="Email" value={p.email} />
        <Row label="Phone" value={p.phone} />
        <Row label="Company" value={companyName(p.company)} />
        {p.role === 'Creator' ? <Row label="This month" value={`${p.posts} posts · ${p.viewsN ? fmtK(p.viewsN) + ' views' : 'no views yet'}`} /> : null}
        <Row label="Joined" value={p.joined} />
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
        {p.status === 'Invite pending' ? (
          <KPill variant="tint" icon="rotate-ccw" onClick={onResend} style={{ flex: 1 }}>{resent ? 'Sent just now' : 'Resend invite'}</KPill>
        ) : null}
        {onViewFull ? <KPill icon="arrow-right" onClick={onViewFull} style={{ flex: 1 }}>View profile</KPill> : null}
      </div>
    </KModal>
  );
}

function ManagerWeek({ companyId }) {
  const [metric, setMetric] = React.useState('Views');
  const days = [5, 6, 7, 8, 9, 10, 11];
  const d = COMPANY_DAYS[companyId] || {};
  const pickV = (day) => { const x = d[day]; if (!x) return 0; return metric === 'Views' ? x.views : metric === 'Revenue' ? x.sales : x.signups; };
  const series = days.map(pickV);
  const yFmt = metric === 'Views' ? ((v) => fmtK(v)) : metric === 'Revenue' ? ((v) => moneyK(Math.round(v))) : ((v) => Math.round(v));
  return (
    <KCard pad={22}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <KLabel style={{ flex: 1 }}>This week</KLabel>
        <SortDropdown prefix="" options={['Views', 'Revenue', 'Sign-ups']} value={metric} onSelect={setMetric} />
      </div>
      <div key={metric} style={{ animation: 'om-rise 220ms var(--ease-out) both' }}>
        <AreaChart series={series} labels={['Aug 5', 'Aug 7', 'Aug 9', 'Aug 11']} vb={210} yFmt={yFmt} />
      </div>
    </KCard>
  );
}

function BriefBlock({ label, text }) {
  return (
    <div style={{ marginTop: 12 }}>
      <span style={{ display: 'block', font: '800 11px var(--web-ui)', letterSpacing: '0.7px', textTransform: 'uppercase', color: 'var(--slate-400)', marginBottom: 4 }}>{label}</span>
      <p style={{ margin: 0, font: '600 13.5px/1.55 var(--web-ui)', color: 'var(--ink)' }}>{text}</p>
    </div>
  );
}

const BRIEF_WEEKS = [
  { label: 'Aug 2 · 8', days: [2, 3, 4, 5, 6, 7, 8] },
  { label: 'Aug 9 · 15', days: [9, 10, 11, 12, 13, 14, 15] },
  { label: 'Aug 16 · 22', days: [16, 17, 18, 19, 20, 21, 22] },
];

function ManagerBriefs({ companyId }) {
  const { Icon } = window.NoniDesignSystem_710e43;
  const [wi, setWi] = React.useState(1);
  const [day, setDay] = React.useState(null); // null = full week
  const week = BRIEF_WEEKS[wi];
  const briefs = SEED_BRIEFS.filter((b) => b.company === companyId);
  const hasContent = (dd) => briefs.some((b) => b.day === dd) || SEED_POSTS.some((q) => q.company === companyId && q.day === dd);
  const shownDays = day ? [day] : week.days;
  const shownBriefs = briefs.filter((b) => shownDays.includes(b.day));
  const shownPosts = SEED_POSTS.filter((q) => q.company === companyId && shownDays.includes(q.day));
  const Arrow = ({ dir, disabled }) => (
    <button type="button" disabled={disabled} onClick={() => { setWi(wi + dir); setDay(null); }} aria-label={dir < 0 ? 'Previous week' : 'Next week'}
      style={{ width: 30, height: 30, borderRadius: 999, border: '1px solid var(--border)', cursor: disabled ? 'default' : 'pointer', background: 'var(--white)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', opacity: disabled ? 0.35 : 1 }}>
      <Icon name={dir < 0 ? 'chevron-left' : 'chevron-right'} size={15} color="var(--ink)" />
    </button>
  );
  return (
    <KCard pad={22}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <KLabel style={{ flex: 1 }}>Briefs</KLabel>
        <Arrow dir={-1} disabled={wi === 0} />
        <span style={{ font: '700 13px var(--web-ui)', color: 'var(--ink)', whiteSpace: 'nowrap', minWidth: 86, textAlign: 'center' }}>{week.label}</span>
        <Arrow dir={1} disabled={wi === BRIEF_WEEKS.length - 1} />
      </div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
        <button type="button" onClick={() => setDay(null)}
          style={{ padding: '9px 16px', borderRadius: 12, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', font: '700 13px var(--web-ui)', background: day === null ? 'var(--blue-100)' : 'var(--fill-quiet)', color: day === null ? 'var(--blue-700)' : 'var(--ink)', transition: 'background var(--dur-fast) var(--ease-out)' }}>Full week</button>
        {week.days.map((dd) => {
          const on = day === dd;
          return (
            <button key={dd} type="button" onClick={() => setDay(dd)}
              style={{ flex: 1, padding: '9px 0 7px', borderRadius: 12, border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: on ? 'var(--blue-100)' : 'var(--fill-quiet)', transition: 'background var(--dur-fast) var(--ease-out)' }}>
              <span style={{ font: '700 13px var(--web-ui)', color: on ? 'var(--blue-700)' : 'var(--ink)' }}>{dd}</span>
              <span style={{ width: 5, height: 5, borderRadius: 999, background: hasContent(dd) ? (on ? 'var(--blue-500)' : 'var(--slate-400)') : 'transparent' }} />
            </button>
          );
        })}
      </div>
      <div key={wi + '-' + day} style={{ animation: 'om-rise 220ms var(--ease-out) both' }}>
        {shownPosts.length ? (
          <div style={{ marginBottom: 18 }}>
            <KLabel style={{ display: 'block', marginBottom: 10 }}>{day ? 'Posted Aug ' + day : 'Posted this week'}</KLabel>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {shownPosts.map((q) => (
                <div key={q.id} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '10px 12px', borderRadius: 12, background: 'var(--fill-quiet)' }}>
                  <span style={{ width: 34, height: 44, flex: '0 0 auto', borderRadius: 9, background: 'var(--blue-100)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name={q.format === 'Video' ? 'play' : 'images'} size={13} color="var(--blue-700)" />
                  </span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'block', font: '700 13px var(--web-ui)', color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{q.title}</span>
                    <span style={{ display: 'block', marginTop: 1, font: '600 11.5px var(--web-ui)', color: 'var(--slate-400)' }}>Aug {q.day} · {q.creator} · {fmtK(q.viewsN)} views · {money(q.earned)}</span>
                  </span>
                  <a href={q.link} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '7px 13px', borderRadius: 999, background: 'var(--white)', border: '1px solid var(--border)', font: '700 12px var(--web-ui)', color: 'var(--ink)', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                    <Icon name="link" size={12} color="var(--ink)" />Open
                  </a>
                </div>
              ))}
            </div>
          </div>
        ) : null}
        {shownBriefs.length ? (
          <div>
            <KLabel style={{ display: 'block', marginBottom: 10 }}>{day ? 'Brief for Aug ' + day : 'Briefs this week'}</KLabel>
            <div style={{ display: 'grid', gridTemplateColumns: shownBriefs.length > 1 ? '1fr 1fr' : '1fr', gap: 12 }}>
              {shownBriefs.map((b) => (
                <div key={b.id} style={{ border: '1px solid var(--line)', borderRadius: 14, padding: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ flex: 1, font: '700 15px var(--web-ui)', color: 'var(--ink)' }}>{b.title}</span>
                    <span style={{ font: '600 12px var(--web-ui)', color: 'var(--slate-400)', whiteSpace: 'nowrap' }}>Aug {b.day}</span>
                    <KChip tone="slate">{b.format}</KChip>
                    <KChip tone={b.status === 'Active' ? 'green' : 'slate'}>{b.status}</KChip>
                  </div>
                  <BriefBlock label="Hook" text={b.hook} />
                  <BriefBlock label="Script" text={b.script} />
                  <BriefBlock label="Caption" text={b.caption} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p style={{ margin: 0, font: '600 13.5px var(--web-ui)', color: 'var(--slate-400)' }}>{shownPosts.length ? 'No brief ran ' + (day ? 'this day.' : 'this week.') : 'Nothing ran ' + (day ? 'on Aug ' + day + '.' : 'this week.')}</p>
        )}
      </div>
    </KCard>
  );
}
function UserProfile({ p, onBack, onOpenCompany, onResend, resent }) {
  const { Icon } = window.NoniDesignSystem_710e43;
  const [selPost, setSelPost] = React.useState(null);
  const posts = SEED_POSTS.filter((q) => q.creator === p.name).sort((a, b) => b.viewsN - a.viewsN);
  const earned = posts.reduce((n, q) => n + q.earned, 0);
  if (selPost) return (
    <div style={{ animation: 'om-rise 260ms var(--ease-out) both' }}>
      <KPageHead onBack={() => setSelPost(null)} title={p.name} sub={`${p.role} · ${companyName(p.company)}`} right={<KChip tone={statusTone(p.status)}>{p.status}</KChip>} />
      <PostDetail q={selPost} onBack={() => setSelPost(null)} />
    </div>
  );
  const Row = ({ label, value }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderTop: '1px solid var(--line)' }}>
      <span style={{ width: 84, font: '600 12.5px var(--web-ui)', color: 'var(--slate-400)' }}>{label}</span>
      <span style={{ flex: 1, font: '600 13.5px var(--web-ui)', color: 'var(--ink)' }}>{value}</span>
    </div>
  );
  return (
    <div style={{ animation: 'om-rise 260ms var(--ease-out) both' }}>
      <KPageHead onBack={onBack} title={p.name} sub={`${p.role} · ${companyName(p.company)}`} right={<KChip tone={statusTone(p.status)}>{p.status}</KChip>} />
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 340px) minmax(0, 1fr)', gap: 14, alignItems: 'start' }}>
        <KCard pad={0}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '18px 20px' }}>
            <KAvatar name={p.name} size={46} />
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: 'block', font: '700 15px var(--web-ui)', color: 'var(--ink)' }}>{p.name}</span>
              <span style={{ display: 'block', marginTop: 3 }}><KChip tone={p.role === 'Company admin' ? 'blue' : 'slate'}>{p.role}</KChip></span>
            </span>
          </div>
          <Row label="Email" value={p.email} />
          <Row label="Phone" value={p.phone} />
          <Row label="Joined" value={p.joined} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderTop: '1px solid var(--line)' }}>
            <span style={{ width: 84, font: '600 12.5px var(--web-ui)', color: 'var(--slate-400)' }}>Company</span>
            <a onClick={() => onOpenCompany(p.company)} style={{ flex: 1, font: '700 13.5px var(--web-ui)', color: 'var(--blue-700)', cursor: 'pointer' }}>{companyName(p.company)}</a>
          </div>
          {p.status === 'Invite pending' || p.status === 'Pending' ? (
            <div style={{ padding: '14px 20px', borderTop: '1px solid var(--line)' }}>
              <KPill variant="tint" icon="rotate-ccw" onClick={onResend} style={{ width: '100%' }}>{resent ? 'Sent just now' : 'Resend invite'}</KPill>
            </div>) : null}
        </KCard>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>
          {p.role === 'Creator' ? (
            <KCard pad={22} style={{ display: 'flex', gap: 18 }}>
              {[['Posts this month', p.posts], ['Views this month', p.viewsN ? fmtK(p.viewsN) : '—'], ['Earned', earned ? money(earned) : '—']].map(([l, v]) => (
                <span key={l} style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', font: '600 12px var(--web-ui)', color: 'var(--slate-400)' }}>{l}</span>
                  <span style={{ display: 'block', marginTop: 5, font: '700 26px var(--web-display)', letterSpacing: '-0.5px', color: 'var(--ink)' }}>{v}</span>
                </span>
              ))}
            </KCard>) : p.role === 'Campaign manager' ? (
            <ManagerWeek companyId={p.company} />) : (
            <KCard pad={22}>
              <p style={{ margin: 0, font: '600 14px/1.6 var(--web-ui)', color: 'var(--slate-500)' }}>{`Owns ${companyName(p.company)}'s program on the web dashboard — brand brain, features, billing and the campaign team.`}</p>
            </KCard>)}
          {p.role === 'Creator' ? (
            <KCard pad={0}>
              <KLabel style={{ display: 'block', padding: '16px 20px 8px' }}>Posts</KLabel>
              {posts.length === 0 ? (
                <p style={{ margin: 0, padding: '4px 20px 18px', font: '600 13.5px var(--web-ui)', color: 'var(--slate-400)' }}>Nothing published yet.</p>
              ) : (
                <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                  {posts.map((q, i) => (
                    <div key={q.id} role="button" onClick={() => setSelPost(q)}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--fill-quiet)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '13px 20px', borderTop: '1px solid var(--line)', cursor: 'pointer', transition: 'background var(--dur-fast) var(--ease-out)' }}>
                      <span style={{ width: 42, height: 56, flex: '0 0 auto', borderRadius: 10, background: 'var(--blue-100)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon name={q.format === 'Video' ? 'play' : 'images'} size={15} color="var(--blue-700)" />
                      </span>
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ display: 'block', font: '700 14px var(--web-ui)', color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{q.title}</span>
                        <span style={{ display: 'block', marginTop: 2, font: '600 12.5px var(--web-ui)', color: 'var(--slate-400)' }}>{q.date} · {q.format} · TikTok {fmtK(q.tt.views)} · IG {fmtK(q.ig.views)}</span>
                      </span>
                      <span style={{ textAlign: 'right' }}>
                        <span style={{ display: 'block', font: '700 15px var(--web-display)', color: 'var(--ink)' }}>{fmtK(q.viewsN)}</span>
                        <span style={{ display: 'block', marginTop: 2, font: '700 12px var(--web-ui)', color: 'var(--green, #1F9D5B)' }}>{money(q.earned)}</span>
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </KCard>) : null}
        </div>
      </div>
      {p.role === 'Campaign manager' ? <div style={{ marginTop: 14 }}><ManagerBriefs companyId={p.company} /></div> : null}
    </div>
  );
}

/* ---------- pages ---------- */

function ScopeDropdown({ companies, scope, onSelect }) {
  const { Icon } = window.NoniDesignSystem_710e43;
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    const out = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    window.addEventListener('mousedown', out);
    return () => window.removeEventListener('mousedown', out);
  }, []);
  const current = scope === 'all' ? 'All companies' : (companies.find((c) => c.id === scope) || {}).name;
  const Item = ({ id, label }) => (
    <button type="button" onClick={() => { onSelect(id); setOpen(false); }}
      style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 12px', borderRadius: 10, border: 'none', cursor: 'pointer', textAlign: 'left', background: 'transparent', whiteSpace: 'nowrap', font: '700 13.5px var(--web-ui)', color: 'var(--ink)' }}
      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--fill-quiet)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
      <span style={{ flex: 1 }}>{label}</span>
      {scope === id ? <Icon name="check" size={14} color="var(--blue-700)" /> : null}
    </button>
  );
  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block', marginBottom: 18 }}>
      <button type="button" onClick={() => setOpen(!open)}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 999, border: '1px solid var(--border)', cursor: 'pointer', background: 'var(--white)', boxShadow: 'var(--shadow-card)', whiteSpace: 'nowrap', font: '700 13px var(--web-ui)', color: 'var(--ink)' }}>
        {current}<Icon name="chevron-down" size={14} color="var(--slate-400)" />
      </button>
      {open ? (
        <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 70, minWidth: 230, background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 14, boxShadow: 'var(--shadow-raised)', padding: 6, transformOrigin: 'top left', animation: 'om-pop 160ms var(--ease-out) both' }}>
          <Item id="all" label="All companies" />
          {companies.map((c) => <Item key={c.id} id={c.id} label={c.name} />)}
        </div>
      ) : null}
    </div>
  );
}

function FiltersDropdown({ formatF, creatorF, creatorNames, onFormat, onCreator }) {
  const { Icon } = window.NoniDesignSystem_710e43;
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    const out = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    window.addEventListener('mousedown', out);
    return () => window.removeEventListener('mousedown', out);
  }, []);
  const n = (formatF !== 'All formats' ? 1 : 0) + (creatorF !== 'All creators' ? 1 : 0);
  const Item = ({ label, on, pick }) => (
    <button type="button" onClick={pick}
      style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '8px 12px', borderRadius: 10, border: 'none', cursor: 'pointer', textAlign: 'left', background: 'transparent', whiteSpace: 'nowrap', font: '700 13px var(--web-ui)', color: 'var(--ink)' }}
      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--fill-quiet)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
      <span style={{ flex: 1 }}>{label}</span>
      {on ? <Icon name="check" size={13} color="var(--blue-700)" /> : null}
    </button>
  );
  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button type="button" onClick={() => setOpen(!open)}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 14px', borderRadius: 999, border: '1px solid var(--border)', cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: 'var(--shadow-card)', background: n ? 'var(--blue-100)' : 'var(--white)', font: '700 13px var(--web-ui)', color: n ? 'var(--blue-700)' : 'var(--ink)' }}>
        Filters{n ? ' · ' + n : ''}<Icon name="chevron-down" size={13} color={n ? 'var(--blue-700)' : 'var(--slate-400)'} />
      </button>
      {open ? (
        <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 70, minWidth: 210, background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 14, boxShadow: 'var(--shadow-raised)', padding: 6, transformOrigin: 'top left', animation: 'om-pop 160ms var(--ease-out) both' }}>
          <KLabel style={{ display: 'block', padding: '8px 12px 4px' }}>Format</KLabel>
          {['All formats', 'Video', 'Carousel'].map((f) => <Item key={f} label={f} on={formatF === f} pick={() => onFormat(f)} />)}
          <KLabel style={{ display: 'block', padding: '10px 12px 4px', borderTop: '1px solid var(--line)', marginTop: 6 }}>Creator</KLabel>
          {['All creators', ...creatorNames].map((c) => <Item key={c} label={c} on={creatorF === c} pick={() => onCreator(c)} />)}
        </div>
      ) : null}
    </div>
  );
}

const RANGES = ['Last 24 hours', 'Last 7 days', 'Last 2 weeks', 'Last month', 'Last 12 weeks'];
const SORTS = ['Views over time', 'Top creators', 'Top posts', 'Formats'];
function rangeData(range, weekly) {
  const lastW = weekly[weekly.length - 1] || 0;
  const wave = (n, base, amp, rise) => Array.from({ length: n }, (_, i) => Math.max(0.1, +(base * (1 + amp * Math.sin(i * 1.35 + 0.8) + rise * i / n)).toFixed(1)));
  if (range === 'Last 24 hours') return { data: wave(12, lastW / 7 / 10, 0.45, 0.5), labels: ['2a', '6a', '10a', '2p', '6p', '10p'] };
  if (range === 'Last 7 days') return { data: wave(7, lastW / 7, 0.3, 0.25), labels: ['Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue'] };
  if (range === 'Last 2 weeks') return { data: wave(14, lastW / 7, 0.35, 0.3), labels: ['Jul 30', 'Aug 3', 'Aug 7', 'Aug 11'] };
  if (range === 'Last month') return { data: weekly.slice(-5), labels: ['Jul 13', 'Jul 20', 'Jul 27', 'Aug 3', 'Aug 10'] };
  return { data: weekly, labels: ['May 25', 'Jun 8', 'Jun 22', 'Jul 6', 'Jul 20', 'Aug 3'] };
}

function OpsOverview({ companies, creators, go }) {
  const { Icon } = window.NoniDesignSystem_710e43;
  const [scope, setScope] = React.useState('all');
  const [range, setRange] = React.useState('Last 7 days');
  const [sortBy, setSortBy] = React.useState('Views over time');
  const [formatF, setFormatF] = React.useState('All formats');
  const [creatorF, setCreatorF] = React.useState('All creators');
  const active = companies.filter((c) => c.status === 'Active');
  const one = scope === 'all' ? null : companies.find((c) => c.id === scope);
  const pickScope = (id) => { setScope(id); setCreatorF('All creators'); };
  const series = one ? one.series : Array.from({ length: 12 }, (_, i) => active.reduce((n, c) => n + (c.series[i] || 0), 0));
  const stats = one
    ? { views: one.views, posts: one.posts, campaigns: one.campaigns, creators: one.creators, dViews: one.deltas.views, dPosts: one.deltas.posts, dCamp: one.deltas.campaigns }
    : { views: '2.0M', posts: companies.reduce((n, c) => n + c.posts, 0), campaigns: companies.reduce((n, c) => n + c.campaigns, 0), creators: creators.length, dViews: '+15% vs July', dPosts: '+14% vs July', dCamp: `${active.length} companies` };
  const scopeCreators = creators.filter((r) => (one ? r.company === one.id : true) && r.viewsN > 0).sort((a, b) => b.viewsN - a.viewsN);
  const formats = one ? one.formats : active.reduce((acc, c) => { Object.entries(c.formats).forEach(([k, v]) => acc[k] = (acc[k] || 0) + v); return acc; }, {});
  const fmtTotal = (formats.Video || 0) + (formats.Carousel || 0);
  const fmtShare = formatF === 'All formats' || !fmtTotal ? 1 : (formats[formatF] || 0) / fmtTotal;
  const crTotal = scopeCreators.reduce((n, p) => n + p.viewsN, 0) || 1;
  const crObj = scopeCreators.find((p) => p.name === creatorF);
  const crShare = crObj ? crObj.viewsN / crTotal : 1;
  const factor = fmtShare * crShare;
  const chart = rangeData(range, series.map((v) => +(v * factor).toFixed(1)));
  const barCreators = (crObj ? [crObj] : scopeCreators).map((p) => ({ ...p, v: Math.round(p.viewsN * fmtShare / 1000) }));
  const maxCr = Math.max(...barCreators.map((p) => p.v), 1);
  const posts = SEED_POSTS.filter((q) => (!one || q.company === one.id) && (formatF === 'All formats' || q.format === formatF) && (creatorF === 'All creators' || q.creator === creatorF)).sort((a, b) => b.viewsN - a.viewsN);
  const fmtEntries = Object.entries(formats).filter(([k]) => formatF === 'All formats' || k === formatF).map(([k, v]) => [k, Math.round(v * crShare)]);
  const maxFmt = Math.max(...fmtEntries.map(([, v]) => v), 1);
  const scopeLabel = one ? one.name : 'All companies';
  return (
    <div>
      <KPageHead title={({ 'Last 24 hours': 'Today', 'Last 7 days': 'This Week', 'Last 2 weeks': 'Last 2 Weeks', 'Last month': 'This Month', 'Last 12 weeks': 'Last 12 Weeks' }[range] || range) + ' on Noni'} />
      <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start', paddingBottom: 22, borderBottom: '1px solid var(--line)', marginBottom: 22 }}>
        <StatInline label="Views this month" value={stats.views} delta={stats.dViews} />
        <StatInline label="Posts this month" value={stats.posts} delta={stats.dPosts} />
        <StatInline label="Active campaigns" value={stats.campaigns} delta={stats.dCamp} />
        <StatInline label="Creators" value={stats.creators} />
        {one ? <KPill size="sm" variant="tint" icon="arrow-right" onClick={() => go('Companies', one.id)}>View company</KPill> : null}
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 22, flexWrap: 'wrap' }}>
        <ScopeDropdown companies={active} scope={scope} onSelect={pickScope} />
        <span style={{ flex: 1 }} />
        <FiltersDropdown formatF={formatF} creatorF={creatorF} creatorNames={scopeCreators.map((p) => p.name)} onFormat={setFormatF} onCreator={setCreatorF} />
        <SortDropdown prefix="Sort by" options={SORTS} value={sortBy} onSelect={setSortBy} />
        <SortDropdown prefix="" options={RANGES} value={range} onSelect={setRange} />
      </div>
      <div key={sortBy + scope + range + formatF + creatorF} style={{ animation: 'om-rise 240ms var(--ease-out) both' }}>
        {sortBy === 'Views over time' ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <KLabel style={{ flex: 1 }}>Views</KLabel>
            </div>
            <AreaChart series={chart.data} labels={chart.labels} vb={300} />
          </div>
        ) : null}
        {sortBy === 'Top creators' ? (
          <div>
            <KLabel style={{ display: 'block', marginBottom: 18 }}>Top creators · {scopeLabel}{formatF !== 'All formats' ? ' · ' + formatF : ''}</KLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 15, maxWidth: 720 }}>
              {barCreators.map((p) => <BarRow key={p.id} label={p.name.split(' ')[0]} value={p.v} max={maxCr} suffix="k" />)}
            </div>
          </div>
        ) : null}
        {sortBy === 'Top posts' ? (
          <div>
            <KLabel style={{ display: 'block', marginBottom: 16 }}>Top posts · {scopeLabel}{formatF !== 'All formats' ? ' · ' + formatF : ''}{creatorF !== 'All creators' ? ' · ' + creatorF : ''}</KLabel>
            {posts.length === 0 ? <p style={{ margin: 0, font: '600 14px var(--web-ui)', color: 'var(--slate-400)' }}>No posts match these filters.</p> : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {posts.map((q) => (
                <KCard key={q.id} pad={14} style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
                  <span style={{ width: 42, height: 56, flex: '0 0 auto', borderRadius: 10, background: 'var(--blue-100)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name={q.format === 'Video' ? 'play' : 'images'} size={15} color="var(--blue-700)" />
                  </span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'block', font: '700 14px var(--web-ui)', color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{q.title}</span>
                    <span style={{ display: 'block', marginTop: 2, font: '600 12.5px var(--web-ui)', color: 'var(--slate-400)' }}>{q.creator} · {q.format} · {companyName(q.company)}</span>
                  </span>
                  <span style={{ font: '700 14px var(--web-ui)', color: 'var(--ink)' }}>{fmtK(q.viewsN)}</span>
                </KCard>
              ))}
            </div>)}
          </div>
        ) : null}
        {sortBy === 'Formats' ? (
          <div>
            <KLabel style={{ display: 'block', marginBottom: 18 }}>Posts by format · {scopeLabel}{creatorF !== 'All creators' ? ' · ' + creatorF : ''}</KLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 15, maxWidth: 720 }}>
              {fmtEntries.map(([k, v]) => <BarRow key={k} label={k} value={v} max={maxFmt} />)}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function OpsCompanies({ companies, go, onNew }) {
  const shown = companies.filter((c) => c.status === 'Active');
  return (
    <div>
      <KPageHead title="Companies" sub="Every company on Noni, one admin each. New company sends that admin an email invite — they appear here once they accept."
        right={<KPill icon="plus" onClick={onNew}>New company</KPill>} />
      <KCard pad={0}>
        {shown.map((c, i) => <CompanyRow key={c.id} c={c} onOpen={() => go('Companies', c.id)} last={i === shown.length - 1} />)}
      </KCard>
    </div>
  );
}

function HoverPeek({ label = 'View profile', onClick, children }) {
  const [pos, setPos] = React.useState(null);
  return (
    <div onClick={onClick} onMouseMove={(e) => setPos({ x: e.clientX, y: e.clientY })} onMouseLeave={() => setPos(null)} style={{ cursor: 'pointer' }}>
      {children}
      {pos ? ReactDOM.createPortal(<div style={{ position: 'fixed', left: pos.x + 14, top: pos.y + 16, zIndex: 90, pointerEvents: 'none', padding: '6px 11px', borderRadius: 999, background: 'var(--ink)', color: '#fff', font: '700 11.5px var(--web-ui)', boxShadow: 'var(--shadow-raised)', whiteSpace: 'nowrap' }}>{label}</div>, document.body) : null}
    </div>
  );
}

function MonthCal({ days, onPick }) {
  const first = 6; // Aug 1, 2026 is a Saturday
  const cells = [...Array(first).fill(null), ...Array.from({ length: 31 }, (_, i) => i + 1)];
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 6 }}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => <span key={d} style={{ textAlign: 'center', font: '800 10.5px var(--web-ui)', letterSpacing: '0.7px', textTransform: 'uppercase', color: 'var(--slate-400)' }}>{d}</span>)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {cells.map((d, i) => {
          if (d === null) return <span key={'e' + i} />;
          const data = days[d];
          const today = d === 12;
          return (
            <button key={d} type="button" onClick={data ? () => onPick(d) : undefined}
              style={{ minHeight: 64, borderRadius: 12, border: 'none', cursor: data ? 'pointer' : 'default', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, background: today ? 'var(--blue-100)' : 'transparent', transition: 'background var(--dur-fast) var(--ease-out)' }}
              onMouseEnter={(e) => { if (data) e.currentTarget.style.background = 'var(--fill-quiet)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = today ? 'var(--blue-100)' : 'transparent'; }}>
              <span style={{ font: '700 13.5px var(--web-ui)', color: today ? 'var(--blue-700)' : 'var(--ink)' }}>{d}</span>
              {data ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ padding: '1px 7px', borderRadius: 999, background: 'var(--green-soft, #E4F6EC)', color: 'var(--green, #1F9D5B)', font: '700 10.5px var(--web-ui)' }}>{data.signups}</span>
                  <span style={{ font: '700 10.5px var(--web-ui)', color: 'var(--slate-400)' }}>{moneyK(data.sales)}</span>
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DayModal({ c, day, onClose }) {
  const data = COMPANY_DAYS[c.id][day];
  const dayPosts = SEED_POSTS.filter((q) => q.company === c.id && q.day === day);
  const { Icon } = window.NoniDesignSystem_710e43;
  const Cell = ({ label, value }) => (
    <span style={{ flex: 1 }}>
      <span style={{ display: 'block', font: '600 12px var(--web-ui)', color: 'var(--slate-400)' }}>{label}</span>
      <span style={{ display: 'block', marginTop: 4, font: '700 22px var(--web-display)', letterSpacing: '-0.4px', color: 'var(--ink)' }}>{value}</span>
    </span>
  );
  return (
    <KModal title={'August ' + day + ' · ' + c.name} onClose={onClose}>
      <div style={{ display: 'flex', gap: 14, paddingBottom: 16, borderBottom: '1px solid var(--line)' }}>
        <Cell label="Sales" value={money(data.sales)} />
        <Cell label="Sign-ups" value={data.signups} />
        <Cell label="Downloads" value={data.downloads} />
      </div>
      <KLabel style={{ display: 'block', margin: '16px 0 10px' }}>Posted that day</KLabel>
      {dayPosts.length === 0 ? <p style={{ margin: 0, font: '600 13.5px var(--web-ui)', color: 'var(--slate-400)' }}>No posts published this day.</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {dayPosts.map((q) => (
            <div key={q.id} style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
              <span style={{ width: 34, height: 44, flex: '0 0 auto', borderRadius: 9, background: 'var(--blue-100)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={q.format === 'Video' ? 'play' : 'images'} size={13} color="var(--blue-700)" />
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', font: '700 13px var(--web-ui)', color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{q.title}</span>
                <span style={{ display: 'block', marginTop: 1, font: '600 11.5px var(--web-ui)', color: 'var(--slate-400)' }}>{q.creator} · {q.format}</span>
              </span>
              <span style={{ font: '700 13px var(--web-ui)', color: 'var(--ink)' }}>{fmtK(q.viewsN)}</span>
            </div>
          ))}
        </div>
      )}
    </KModal>
  );
}

function CompanyExplorer({ c, onOpenProfile }) {
  const { Icon } = window.NoniDesignSystem_710e43;
  const [range, setRange] = React.useState('Last 12 weeks');
  const [sortBy, setSortBy] = React.useState('Views over time');
  const [formatF, setFormatF] = React.useState('All formats');
  const [creatorF, setCreatorF] = React.useState('All creators');
  const [selPost, setSelPost] = React.useState(null);
  const scopeCreators = SEED_PEOPLE.filter((p) => p.company === c.id && p.role === 'Creator' && p.viewsN > 0).sort((a, b) => b.viewsN - a.viewsN);
  const formats = c.formats;
  const fmtTotal = (formats.Video || 0) + (formats.Carousel || 0);
  const fmtShare = formatF === 'All formats' || !fmtTotal ? 1 : (formats[formatF] || 0) / fmtTotal;
  const crTotal = scopeCreators.reduce((n, p) => n + p.viewsN, 0) || 1;
  const crObj = scopeCreators.find((p) => p.name === creatorF);
  const crShare = crObj ? crObj.viewsN / crTotal : 1;
  const chart = rangeData(range, c.series.map((v) => +(v * fmtShare * crShare).toFixed(1)));
  const barCreators = (crObj ? [crObj] : scopeCreators).map((p) => ({ ...p, v: Math.round(p.viewsN * fmtShare / 1000) }));
  const maxCr = Math.max(...barCreators.map((p) => p.v), 1);
  const posts = SEED_POSTS.filter((q) => q.company === c.id && (formatF === 'All formats' || q.format === formatF) && (creatorF === 'All creators' || q.creator === creatorF)).sort((a, b) => b.viewsN - a.viewsN);
  const fmtEntries = Object.entries(formats).filter(([k]) => formatF === 'All formats' || k === formatF).map(([k, v]) => [k, Math.round(v * crShare)]);
  const maxFmt = Math.max(...fmtEntries.map(([, v]) => v), 1);
  if (selPost) return <KCard pad={22}><PostDetail q={selPost} onBack={() => setSelPost(null)} /></KCard>;
  return (
    <KCard pad={22}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 18, flexWrap: 'wrap' }}>
        <FiltersDropdown formatF={formatF} creatorF={creatorF} creatorNames={scopeCreators.map((p) => p.name)} onFormat={setFormatF} onCreator={setCreatorF} />
        <SortDropdown prefix="Sort by" options={SORTS} value={sortBy} onSelect={setSortBy} />
        <span style={{ flex: 1 }} />
        <SortDropdown prefix="" options={RANGES} value={range} onSelect={setRange} />
      </div>
      <div key={sortBy + range + formatF + creatorF} style={{ animation: 'om-rise 240ms var(--ease-out) both' }}>
        {sortBy === 'Views over time' ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <KLabel style={{ flex: 1 }}>Views</KLabel>
              <span style={{ font: '600 12.5px var(--web-ui)', color: 'var(--slate-400)' }}>{formatF !== 'All formats' ? formatF + ' · ' : ''}{creatorF !== 'All creators' ? creatorF : formatF === 'All formats' ? c.name : ''}</span>
            </div>
            <AreaChart series={chart.data} labels={chart.labels} vb={250} />
          </div>
        ) : null}
        {sortBy === 'Top creators' ? (
          <div>
            <KLabel style={{ display: 'block', marginBottom: 14 }}>Top creators{formatF !== 'All formats' ? ' · ' + formatF : ''}</KLabel>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {barCreators.map((p) => (
                <HoverPeek key={p.id} onClick={() => onOpenProfile(p)}>
                  <div style={{ padding: '7px 6px', margin: '0 -6px', borderRadius: 10 }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--fill-quiet)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                    <BarRow label={p.name.split(' ')[0]} value={p.v} max={maxCr} suffix="k" />
                  </div>
                </HoverPeek>
              ))}
            </div>
          </div>
        ) : null}
        {sortBy === 'Top posts' ? (
          <div>
            <KLabel style={{ display: 'block', marginBottom: 14 }}>Top posts{formatF !== 'All formats' ? ' · ' + formatF : ''}{creatorF !== 'All creators' ? ' · ' + creatorF : ''}</KLabel>
            {posts.length === 0 ? <p style={{ margin: 0, font: '600 14px var(--web-ui)', color: 'var(--slate-400)' }}>No posts match these filters.</p> : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {posts.map((q) => (
                <HoverPeek key={q.id} label="View post" onClick={() => setSelPost(q)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '12px 14px', borderRadius: 14, border: '1px solid var(--line)' }}>
                    <span style={{ width: 42, height: 56, flex: '0 0 auto', borderRadius: 10, background: 'var(--blue-100)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name={q.format === 'Video' ? 'play' : 'images'} size={15} color="var(--blue-700)" />
                    </span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: 'block', font: '700 14px var(--web-ui)', color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{q.title}</span>
                      <span style={{ display: 'block', marginTop: 2, font: '600 12.5px var(--web-ui)', color: 'var(--slate-400)' }}>{q.creator} · {q.format}</span>
                    </span>
                    <span style={{ font: '700 14px var(--web-ui)', color: 'var(--ink)' }}>{fmtK(q.viewsN)}</span>
                  </div>
                </HoverPeek>
              ))}
            </div>)}
          </div>
        ) : null}
        {sortBy === 'Formats' ? (
          <div>
            <KLabel style={{ display: 'block', marginBottom: 14 }}>Posts by format{creatorF !== 'All creators' ? ' · ' + creatorF : ''}</KLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 13, maxWidth: 640 }}>
              {fmtEntries.map(([k, v]) => <BarRow key={k} label={k} value={v} max={maxFmt} />)}
            </div>
          </div>
        ) : null}
      </div>
    </KCard>
  );
}

function CompanyAnalytics({ c, onOpenProfile }) {
  const { Icon } = window.NoniDesignSystem_710e43;
  const [day, setDay] = React.useState(null);
  const Stat = ({ label, value, delta }) => (
    <span style={{ flex: 1, minWidth: 0 }}>
      <span style={{ display: 'block', font: '600 12px var(--web-ui)', color: 'var(--slate-400)' }}>{label}</span>
      <span style={{ display: 'block', margin: '5px 0 3px', font: '700 24px var(--web-display)', letterSpacing: '-0.5px', color: 'var(--ink)' }}>{value}</span>
      {delta ? <span style={{ font: '600 12px var(--web-ui)', color: delta.startsWith('+') ? 'var(--green, #1F9D5B)' : 'var(--slate-400)' }}>{delta}</span> : null}
    </span>
  );
  if (!c.series.length) return (
    <KCard pad={0} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '64px 24px', textAlign: 'center' }}>
      <span style={{ width: 54, height: 54, borderRadius: 999, background: 'var(--blue-100)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="chart-column" size={22} color="var(--blue-700)" />
      </span>
      <div style={{ marginTop: 16, font: '700 16px var(--web-display)', letterSpacing: '-0.3px', color: 'var(--ink)' }}>Nothing to chart yet</div>
      <p style={{ margin: '6px 0 0', font: '600 14px/1.5 var(--web-ui)', color: 'var(--slate-400)', maxWidth: 340 }}>Invite pending. Analytics start the moment their first campaign goes live.</p>
    </KCard>
  );
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <KCard pad={22} style={{ display: 'flex', gap: 18 }}>
        <Stat label="Views this month" value={c.views} delta={c.deltas.views} />
        <Stat label="Posts this month" value={c.posts} delta={c.deltas.posts} />
        <Stat label="Active campaigns" value={c.campaigns} delta={c.deltas.campaigns} />
        <Stat label="Creators" value={c.creators} delta={c.deltas.creators} />
      </KCard>
      <CompanyExplorer c={c} onOpenProfile={onOpenProfile} />
      <KCard pad={22}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 12 }}>
          <KLabel style={{ flex: 1 }}>Daily activity · August 2026</KLabel>
          <span style={{ font: '600 12px var(--web-ui)', color: 'var(--slate-400)' }}>sign-ups · sales · click a day</span>
        </div>
        <MonthCal days={COMPANY_DAYS[c.id] || {}} onPick={setDay} />
      </KCard>
      {day ? <DayModal c={c} day={day} onClose={() => setDay(null)} /> : null}
    </div>
  );
}

function CompanyTeam({ c, onOpenProfile }) {
  const { Icon } = window.NoniDesignSystem_710e43;
  const [filter, setFilter] = React.useState('Admins');
  const [sort, setSort] = React.useState('Name');
  const roleOf = { 'Admins': 'Company admin', 'Campaign Managers': 'Campaign manager', 'Creators': 'Creator' };
  const sortOptions = filter === 'Creators' ? ['Views', 'Posts', 'Name'] : ['Name'];
  const pick = (f) => { setFilter(f); setSort(f === 'Creators' ? 'Views' : 'Name'); };
  const people = SEED_PEOPLE.filter((p) => p.company === c.id && p.role === roleOf[filter]);
  people.sort((a, b) => sort === 'Views' ? (b.viewsN || 0) - (a.viewsN || 0) : sort === 'Posts' ? (b.posts || 0) - (a.posts || 0) : a.name.localeCompare(b.name));
  return (
    <div>
      <KTabs tabs={['Admins', 'Creators', 'Campaign Managers']} active={filter} onSelect={pick}
        right={<SortDropdown options={sortOptions} value={sort} onSelect={setSort} />} />
      <KCard pad={0} key={filter + sort} style={{ animation: 'om-rise 240ms var(--ease-out) both' }}>
        {people.length === 0 ? <p style={{ margin: 0, padding: '22px 20px', font: '600 13.5px var(--web-ui)', color: 'var(--slate-400)' }}>Nobody here yet.</p> : people.map((p, i) => (
        <HoverPeek key={p.id} onClick={() => onOpenProfile(p)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderBottom: i === people.length - 1 ? 'none' : '1px solid var(--line)' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--fill-quiet)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
            <KAvatar name={p.name} size={36} />
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: 'block', font: '700 14.5px var(--web-ui)', color: 'var(--ink)' }}>{p.name}</span>
              <span style={{ display: 'block', marginTop: 2, font: '600 12.5px var(--web-ui)', color: 'var(--slate-400)' }}>{p.email}</span>
            </span>
            {p.role === 'Creator' ? <span style={{ font: '600 13px var(--web-ui)', color: 'var(--slate-400)' }}>{p.posts} posts · {p.viewsN ? fmtK(p.viewsN) + ' views' : '—'}</span> : null}
            <KChip tone={statusTone(p.status)}>{p.status}</KChip>
            <Icon name="chevron-right" size={16} color="var(--slate-400)" />
          </div>
        </HoverPeek>
        ))}
      </KCard>
    </div>
  );
}
function PostDetail({ q, onBack }) {
  const { Icon } = window.NoniDesignSystem_710e43;
    const PRow = ({ label, value }) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid var(--line)' }}>
        <span style={{ flex: 1, font: '600 13px var(--web-ui)', color: 'var(--slate-400)' }}>{label}</span>
        <span style={{ font: '700 13.5px var(--web-ui)', color: 'var(--ink)' }}>{value}</span>
      </div>
    );
    return (
      <div style={{ animation: 'om-rise 240ms var(--ease-out) both' }}>
        <button type="button" onClick={onBack} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 14, padding: '7px 13px', borderRadius: 999, border: '1px solid var(--border)', cursor: 'pointer', whiteSpace: 'nowrap', background: 'var(--white)', font: '700 12.5px var(--web-ui)', color: 'var(--ink)' }}>
          <Icon name="chevron-left" size={14} color="var(--ink)" />All posts
        </button>
        <div style={{ display: 'flex', gap: 22, alignItems: 'flex-start' }}>
          <span style={{ width: 230, height: 306, flex: '0 0 auto', borderRadius: 18, background: 'var(--blue-100)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-media, var(--shadow-card))' }}>
            <Icon name={q.format === 'Video' ? 'play' : 'images'} size={34} color="var(--blue-700)" />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 style={{ margin: 0, font: '700 20px var(--web-display)', letterSpacing: '-0.4px', color: 'var(--ink)' }}>{q.title}</h2>
                <p style={{ margin: '6px 0 0', font: '600 13.5px var(--web-ui)', color: 'var(--slate-400)' }}>{q.creator} · {q.format} · posted {q.date}</p>
              </div>
              <a href={q.link} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 18px', borderRadius: 999, background: 'var(--blue-500)', color: 'var(--white)', font: '700 13.5px var(--web-ui)', textDecoration: 'none', boxShadow: 'var(--shadow-accent)', whiteSpace: 'nowrap' }}>
                <Icon name="link" size={14} color="var(--white)" />Open post
              </a>
            </div>
            <div style={{ display: 'flex', gap: 16, margin: '20px 0', paddingBottom: 18, borderBottom: '1px solid var(--line)' }}>
              {[['Views', fmtK(q.viewsN)], ['Earned', money(q.earned)], ['Sales that day', money(q.sales)], ['Sign-ups that day', q.signups]].map(([l, v]) => (
                <span key={l} style={{ flex: 1 }}>
                  <span style={{ display: 'block', font: '600 12px var(--web-ui)', color: 'var(--slate-400)' }}>{l}</span>
                  <span style={{ display: 'block', marginTop: 4, font: '700 22px var(--web-display)', letterSpacing: '-0.4px', color: 'var(--ink)' }}>{v}</span>
                </span>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <KCard pad={18}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <Icon name="music-2" size={15} color="var(--ink)" /><span style={{ font: '700 13.5px var(--web-ui)', color: 'var(--ink)' }}>TikTok</span>
                </div>
                <PRow label="Views" value={fmtK(q.tt.views)} />
                <PRow label="Likes" value={fmtK(q.tt.likes)} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0' }}>
                  <span style={{ flex: 1, font: '600 13px var(--web-ui)', color: 'var(--slate-400)' }}>Saves</span>
                  <span style={{ font: '700 13.5px var(--web-ui)', color: 'var(--ink)' }}>{fmtK(q.tt.saves)}</span>
                </div>
              </KCard>
              <KCard pad={18}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <Icon name="at-sign" size={15} color="var(--ink)" /><span style={{ font: '700 13.5px var(--web-ui)', color: 'var(--ink)' }}>Instagram</span>
                </div>
                <PRow label="Views" value={fmtK(q.ig.views)} />
                <PRow label="Likes" value={fmtK(q.ig.likes)} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0' }}>
                  <span style={{ flex: 1, font: '600 13px var(--web-ui)', color: 'var(--slate-400)' }}>Saves</span>
                  <span style={{ font: '700 13.5px var(--web-ui)', color: 'var(--ink)' }}>{fmtK(q.ig.saves)}</span>
                </div>
              </KCard>
            </div>
          </div>
        </div>
      </div>
    );
}

function CompanyPosts({ c }) {
  const { Icon } = window.NoniDesignSystem_710e43;
  const [sel, setSel] = React.useState(null);
  const posts = SEED_POSTS.filter((q) => q.company === c.id).sort((a, b) => b.viewsN - a.viewsN);
  if (sel) return <PostDetail q={posts.find((x) => x.id === sel)} onBack={() => setSel(null)} />;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
      {posts.map((q) => (
        <HoverPeek key={q.id} label="View post" onClick={() => setSel(q.id)}>
          <KCard pad={16} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ width: 54, height: 72, flex: '0 0 auto', borderRadius: 12, background: 'var(--blue-100)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={q.format === 'Video' ? 'play' : 'images'} size={17} color="var(--blue-700)" />
            </span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: 'block', font: '700 14.5px var(--web-ui)', color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{q.title}</span>
              <span style={{ display: 'block', marginTop: 3, font: '600 12.5px var(--web-ui)', color: 'var(--slate-400)' }}>{q.creator} · {q.date}</span>
              <span style={{ display: 'block', marginTop: 5, font: '600 12px var(--web-ui)', color: 'var(--slate-400)' }}>TikTok {fmtK(q.tt.views)} · IG {fmtK(q.ig.views)}</span>
            </span>
            <span style={{ textAlign: 'right' }}>
              <span style={{ display: 'block', font: '700 16px var(--web-display)', color: 'var(--ink)' }}>{fmtK(q.viewsN)}</span>
              <span style={{ display: 'block', marginTop: 2, font: '700 12.5px var(--web-ui)', color: 'var(--green, #1F9D5B)' }}>{money(q.earned)}</span>
            </span>
          </KCard>
        </HoverPeek>
      ))}
    </div>
  );
}

const BRAIN_DOCS = [
  { name: 'Product', sub: 'product_truth', words: 640, updated: 'Aug 4', owner: 'human', preview: 'FieldVision turns one sideline phone into a full film crew: auto-tracked footage, instant clips, and shareable highlights minutes after the whistle.' },
  { name: 'Audience', sub: 'audience_niche', words: 480, updated: 'Aug 6', owner: 'human', preview: 'High-school and small-college football programs. Coaches short on staff, players who want their own highlight reels, parents filming from the stands.' },
];
const BRAIN_ACCOUNTS = [
  { handle: '@fieldvision.ai', platform: 'music-2', kind: 'Reference' },
  { handle: '@fieldvision.ai', platform: 'at-sign', kind: 'Reference' },
  { handle: '@coachtape.daily', platform: 'music-2', kind: 'Discovered' },
  { handle: '@fridaynightfilm', platform: 'music-2', kind: 'Discovered' },
];

function DocModal({ doc, onClose }) {
  const [text, setText] = React.useState(doc.preview + '\n\n');
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const human = doc.owner === 'human';
  return (
    <KModal title={doc.name} onClose={onClose}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: -10, marginBottom: 12 }}>
        <span style={{ font: '600 12px var(--web-ui)', color: 'var(--slate-400)' }}>{words} words · updated {doc.updated}</span>
      </div>
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={9} readOnly={!human}
        style={{ width: '100%', boxSizing: 'border-box', border: '1px solid var(--border)', outline: 'none', resize: 'vertical', background: human ? 'var(--white)' : 'var(--fill-quiet)', borderRadius: 12, padding: '12px 14px', font: '600 13.5px/1.6 var(--web-ui)', color: 'var(--ink)' }} />
      {human ? (
        <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
          <KPill variant="tint" icon="sparkles" style={{ flex: 1 }}>AI clean up</KPill>
          <KPill onClick={onClose} style={{ flex: 1 }}>Save</KPill>
        </div>
      ) : null}
    </KModal>
  );
}

function CompanyBrain({ c }) {
  const { Icon } = window.NoniDesignSystem_710e43;
  const [doc, setDoc] = React.useState(null);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {BRAIN_DOCS.map((d) => (
          <HoverPeek key={d.name} label="Open doc" onClick={() => setDoc(d)}>
            <KCard pad={20} style={{ height: '100%', boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ flex: 1, font: '700 15.5px var(--web-ui)', color: 'var(--ink)' }}>{d.name}</span>
              </div>
              <p style={{ margin: '10px 0 12px', font: '600 13px/1.55 var(--web-ui)', color: 'var(--slate-500)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{d.preview}</p>
              <span style={{ font: '600 12px var(--web-ui)', color: 'var(--slate-400)' }}>{d.words} words · updated {d.updated}</span>
            </KCard>
          </HoverPeek>
        ))}
      </div>
      <KCard pad={0}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 20px 10px' }}>
          <KLabel style={{ flex: 1 }}>Inspiration accounts</KLabel>
          <KPill size="sm" variant="tint" icon="plus">Add account</KPill>
        </div>
        {BRAIN_ACCOUNTS.map((a, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '11px 20px', borderTop: '1px solid var(--line)' }}>
            <Icon name={a.platform} size={15} color="var(--slate-500)" />
            <span style={{ flex: 1, font: '700 13.5px var(--web-ui)', color: 'var(--ink)' }}>{a.handle}</span>
            <KChip tone={a.kind === 'Reference' ? 'blue' : 'slate'}>{a.kind}</KChip>
            <KPill size="sm" variant="quiet">Mute</KPill>
          </div>
        ))}
      </KCard>
      {doc ? <DocModal doc={doc} onClose={() => setDoc(null)} /> : null}
    </div>
  );
}

function CompanyBilling({ c, onRemove }) {
  const { Icon } = window.NoniDesignSystem_710e43;
  const [confirming, setConfirming] = React.useState(false);
  const [pinged, setPinged] = React.useState(false);
  const b = COMPANY_BILLING[c.id];
  const remaining = b.monthly - b.spent;
  const pct = b.spent / b.monthly;
  const low = remaining / b.monthly < 0.2;
  const barColor = pct > 0.85 ? 'var(--danger, #D6455D)' : pct > 0.6 ? 'var(--amber, #B97D14)' : 'var(--blue-500)';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {low ? (
        <KCard pad={16} style={{ display: 'flex', alignItems: 'center', gap: 13, background: 'var(--amber-soft, #FCF1DD)', border: '1px solid transparent' }}>
          <Icon name="circle-alert" size={19} color="var(--amber, #B97D14)" />
          <span style={{ flex: 1, font: '600 13.5px var(--web-ui)', color: 'var(--ink)' }}>Running low — {money(remaining)} left of this month's budget.</span>
          <KPill size="sm" onClick={() => setPinged(true)}>{pinged ? 'Pinged ' + b.pingTo + ' ✓' : 'Ping ' + b.pingTo + ' to top up'}</KPill>
        </KCard>
      ) : null}
      <KCard pad={22}>
        <div style={{ display: 'flex', gap: 18, marginBottom: 18 }}>
          {[['Monthly budget', money(b.monthly)], ['Spent so far', money(b.spent)], ['Remaining', money(remaining)]].map(([l, v]) => (
            <span key={l} style={{ flex: 1 }}>
              <span style={{ display: 'block', font: '600 12px var(--web-ui)', color: 'var(--slate-400)' }}>{l}</span>
              <span style={{ display: 'block', marginTop: 5, font: '700 26px var(--web-display)', letterSpacing: '-0.5px', color: l === 'Remaining' && low ? 'var(--danger, #D6455D)' : 'var(--ink)' }}>{v}</span>
            </span>
          ))}
        </div>
        <div style={{ height: 10, borderRadius: 999, background: 'var(--fill-quiet)', overflow: 'hidden' }}>
          <span style={{ display: 'block', width: Math.round(pct * 100) + '%', height: '100%', borderRadius: 999, background: barColor, transition: 'width 400ms var(--ease-out)' }} />
        </div>
        <div style={{ marginTop: 8, font: '600 12.5px var(--web-ui)', color: 'var(--slate-400)' }}>{Math.round(pct * 100)}% of August budget used · pays creator bounties</div>
      </KCard>
      <KCard pad={0}>
        <KLabel style={{ display: 'block', padding: '16px 20px 6px' }}>Top-ups</KLabel>
        {b.topups.map((t, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderTop: '1px solid var(--line)' }}>
            <span style={{ width: 32, height: 32, borderRadius: 999, background: 'var(--green-soft, #E4F6EC)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="dollar-sign" size={14} color="var(--green, #1F9D5B)" />
            </span>
            <span style={{ flex: 1, font: '700 13.5px var(--web-ui)', color: 'var(--ink)' }}>Prepaid credits</span>
            <span style={{ font: '600 13px var(--web-ui)', color: 'var(--slate-400)' }}>{t.date}</span>
            <span style={{ font: '700 14px var(--web-ui)', color: 'var(--ink)', width: 70, textAlign: 'right' }}>{money(t.amt)}</span>
          </div>
        ))}
      </KCard>
      <KCard style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{ flex: 1, font: '600 13.5px/1.5 var(--web-ui)', color: 'var(--slate-400)' }}>Removing {c.name} revokes its admin, managers and creators. There's no undo.</span>
        <KPill size="sm" variant="danger" icon="trash-2" onClick={() => setConfirming(true)}>Remove company</KPill>
      </KCard>
      {confirming ? <RemoveCompanyModal c={c} onClose={() => setConfirming(false)} onConfirm={() => { setConfirming(false); onRemove(c.id); }} /> : null}
      {/* doc modal host */}
    </div>
  );
}

function OpsCompanyDetail({ c, go, onResend, onRemove, onViewFull }) {
  const [tab, setTab] = React.useState('Analytics');
  const [profile, setProfile] = React.useState(null);
  const [resent, setResent] = React.useState(false);
  return (
    <div style={{ animation: 'om-rise 260ms var(--ease-out) both' }}>
      <KPageHead onBack={() => go('Companies')} title={c.name} sub={`${c.website || 'No website yet'} · joined ${c.joined}`}
        right={<KChip tone={statusTone(c.status)}>{c.status}</KChip>} />
      <KTabs tabs={['Analytics', 'Team', 'Posts', 'Company Brain', 'Billing']} active={tab} onSelect={setTab} />
      <div key={tab} style={{ animation: 'om-rise 240ms var(--ease-out) both' }}>
        {tab === 'Analytics' ? <CompanyAnalytics c={c} onOpenProfile={(p) => { setProfile(p); setResent(false); }} /> : null}
        {tab === 'Team' ? <CompanyTeam c={c} onOpenProfile={(p) => { setProfile(p); setResent(false); }} /> : null}
        {tab === 'Posts' ? <CompanyPosts c={c} /> : null}
        {tab === 'Company Brain' ? <CompanyBrain c={c} /> : null}
        {tab === 'Billing' ? <CompanyBilling c={c} onRemove={onRemove} /> : null}
      </div>
      {profile ? <ProfileModal p={profile} onClose={() => setProfile(null)} resent={resent} onResend={() => { setResent(true); onResend(profile.email); }} onViewFull={() => { const pp = profile; setProfile(null); onViewFull(pp); }} /> : null}
    </div>
  );
}
function SortDropdown({ options, value, onSelect, prefix = 'Sort' }) {
  const { Icon } = window.NoniDesignSystem_710e43;
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    const out = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    window.addEventListener('mousedown', out);
    return () => window.removeEventListener('mousedown', out);
  }, []);
  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button type="button" onClick={() => setOpen(!open)}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 14px', borderRadius: 999, border: '1px solid var(--border)', cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: 'var(--shadow-card)', background: 'var(--white)', font: '700 13px var(--web-ui)', color: 'var(--ink)' }}>
        {prefix ? <span style={{ whiteSpace: 'nowrap' }}>{prefix}</span> : <span style={{ whiteSpace: 'nowrap' }}>{value}</span>}<Icon name="chevron-down" size={13} color="var(--slate-400)" />
      </button>
      {open ? (
        <div style={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 70, minWidth: 160, background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 14, boxShadow: 'var(--shadow-raised)', padding: 6, transformOrigin: 'top right', animation: 'om-pop 160ms var(--ease-out) both' }}>
          {options.map((o) => (
            <button key={o} type="button" onClick={() => { onSelect(o); setOpen(false); }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '8px 12px', borderRadius: 10, border: 'none', cursor: 'pointer', textAlign: 'left', background: 'transparent', whiteSpace: 'nowrap', font: '700 13px var(--web-ui)', color: 'var(--ink)' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--fill-quiet)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
              <span style={{ flex: 1 }}>{o}</span>
              {value === o ? <Icon name="check" size={13} color="var(--blue-700)" /> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function OpsUsers({ people, onOpenProfile }) {
  const [filter, setFilter] = React.useState('Admins');
  const roleOf = { 'Admins': 'Company admin', 'Campaign Managers': 'Campaign manager', 'Creators': 'Creator' };
  const sortOptions = filter === 'Creators' ? ['Views', 'Posts', 'Name', 'Company'] : ['Name', 'Company'];
  const [sort, setSort] = React.useState('Name');
  const pick = (f) => { setFilter(f); setSort(f === 'Creators' ? 'Views' : 'Name'); };
  const activeIds = SEED_COMPANIES.filter((c) => c.status === 'Active').map((c) => c.id);
  const shown = people.filter((p) => p.role === roleOf[filter] && activeIds.includes(p.company));
  shown.sort((a, b) => sort === 'Views' ? (b.viewsN || 0) - (a.viewsN || 0) : sort === 'Posts' ? (b.posts || 0) - (a.posts || 0) : sort === 'Company' ? companyName(a.company).localeCompare(companyName(b.company)) : a.name.localeCompare(b.name));
  return (
    <div>
      <KPageHead title="Users" sub="Everyone on Noni — company admins, campaign managers and creators." />
      <KTabs tabs={['Admins', 'Creators', 'Campaign Managers']} active={filter} onSelect={pick}
        right={<SortDropdown options={sortOptions} value={sort} onSelect={setSort} />} />
      <KCard pad={0} key={filter + sort} style={{ animation: 'om-rise 240ms var(--ease-out) both' }}>
        {shown.map((r, i) => (
          <div key={r.id} role="button" onClick={() => onOpenProfile(r)}
            style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', cursor: 'pointer', borderBottom: i === shown.length - 1 ? 'none' : '1px solid var(--line)' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--fill-quiet)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
            <KAvatar name={r.name} size={36} />
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: 'block', font: '700 14.5px var(--web-ui)', color: 'var(--ink)' }}>{r.name}</span>
              <span style={{ display: 'block', marginTop: 2, font: '600 12.5px var(--web-ui)', color: 'var(--slate-400)' }}>{companyName(r.company)}</span>
            </span>
            {r.role === 'Creator' ? <span style={{ font: '600 13px var(--web-ui)', color: 'var(--slate-400)', width: 160, textAlign: 'right' }}>{r.posts} posts · {r.viewsN ? fmtK(r.viewsN) + ' views' : '—'}</span> : <span style={{ font: '600 13px var(--web-ui)', color: 'var(--slate-400)' }}>{r.email}</span>}
            <KChip tone={statusTone(r.status)}>{r.status}</KChip>
          </div>
        ))}
      </KCard>
    </div>
  );
}

function OpsInvites({ invites, onResend }) {
  return (
    <div>
      <KPageHead title="Invites" sub="Every admin invite we've sent. Pending means they haven't signed in with Google yet." />
      <KCard pad={0}>
        {invites.map((iv, i) => (
          <div key={iv.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '15px 20px', borderBottom: i === invites.length - 1 ? 'none' : '1px solid var(--line)' }}>
            <KAvatar name={iv.name} size={36} />
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: 'block', font: '700 14.5px var(--web-ui)', color: 'var(--ink)' }}>{iv.name} · <span style={{ color: 'var(--slate-400)', fontWeight: 600 }}>{iv.email}</span></span>
              <span style={{ display: 'block', marginTop: 2, font: '600 13px var(--web-ui)', color: 'var(--slate-400)' }}>{iv.company} · Company admin · sent {iv.sent}</span>
            </span>
            <KChip tone={statusTone(iv.status)}>{iv.status}</KChip>
            {iv.status !== 'Accepted' ? <KPill size="sm" variant="tint" icon="rotate-ccw" onClick={() => onResend(iv.email)}>{iv.sent === 'Just now' ? 'Sent just now' : 'Resend'}</KPill> : null}
          </div>
        ))}
      </KCard>
    </div>
  );
}

function WebOpsApp() {
  const [page, setPage] = React.useState('Overview');
  const [companyId, setCompanyId] = React.useState(null);
  const [modal, setModal] = React.useState(false);
  const [profile, setProfile] = React.useState(null);
  const [resent, setResent] = React.useState(false);
  const [companies, setCompanies] = React.useState(SEED_COMPANIES);
  const [invites, setInvites] = React.useState(SEED_INVITES);
  const creators = SEED_PEOPLE.filter((p) => p.role === 'Creator');
  const [profilePage, setProfilePage] = React.useState(null);
  const go = (p, id = null) => { setPage(p); setCompanyId(id); };
  const viewFull = (p) => { setProfile(null); setProfilePage({ p, from: { page, companyId } }); setPage('Profile'); setCompanyId(null); };
  const resend = (email) => setInvites((xs) => xs.map((i) => i.email === email ? { ...i, sent: 'Just now', status: 'Pending' } : i));
  const create = ({ name, website, adminName, email }) => {
    const id = 'c' + Date.now();
    setCompanies((xs) => [...xs, { id, name, website, admin: { name: adminName, email }, creators: 0, managers: 0, campaigns: 0, posts: 0, views: '—', status: 'Invite pending', joined: 'Today', series: [], deltas: {}, formats: {} }]);
    setInvites((xs) => [{ id: 'i' + Date.now(), name: adminName, email, company: name, sent: 'Just now', status: 'Pending' }, ...xs]);
  };
  const remove = (id) => { setCompanies((xs) => xs.filter((c) => c.id !== id)); go('Companies'); };
  const searchIndex = [
    ...OPS_NAV.flatMap((g) => g.items.map((it) => ({ section: 'Go to', icon: it.icon, title: it.label, meta: g.label, go: () => go(it.label) }))),
    ...companies.filter((c) => c.status === 'Active').map((c) => ({ section: 'Companies', icon: 'layout-grid', title: c.name, meta: `${c.admin.email} · ${c.status}`, go: () => go('Companies', c.id) })),
    ...SEED_PEOPLE.map((p) => ({ section: 'Users', icon: 'circle-user-round', title: p.name, meta: `${companyName(p.company)} · ${p.role}`, go: () => { go('Users'); setProfile(p); setResent(false); } })),
    ...invites.map((iv) => ({ section: 'Invites', icon: 'send', title: iv.email, meta: `${iv.company} · ${iv.status}`, go: () => go('Invites') })),
  ];
  const company = companies.find((c) => c.id === companyId);
  return (
    <KShell groups={OPS_NAV} active={page} onSelect={(p) => go(p)}
      company={null} user={{ name: 'Founders', role: 'Noni admin' }}
      search={<KSearch index={searchIndex} onGo={(it) => it.go()} />}>
      {page === 'Overview' ? <OpsOverview companies={companies} creators={creators} go={go} /> : null}
      {page === 'Companies' && !company ? <OpsCompanies companies={companies} go={go} onNew={() => setModal(true)} /> : null}
      {page === 'Companies' && company ? <OpsCompanyDetail key={company.id} c={company} go={go} onResend={resend} onRemove={remove} onViewFull={viewFull} /> : null}
      {page === 'Users' ? <OpsUsers people={SEED_PEOPLE} onOpenProfile={(p) => { setProfile(p); setResent(false); }} /> : null}
      {page === 'Invites' ? <OpsInvites invites={invites} onResend={resend} /> : null}
      {page === 'Profile' && profilePage ? <UserProfile key={profilePage.p.id} p={profilePage.p} resent={resent} onResend={() => { setResent(true); resend(profilePage.p.email); }} onOpenCompany={(cid) => go('Companies', cid)} onBack={() => { setPage(profilePage.from.page); setCompanyId(profilePage.from.companyId); }} /> : null}
      {modal ? <NewCompanyModal onClose={() => setModal(false)} onCreate={create} /> : null}
      {profile ? <ProfileModal p={profile} onClose={() => setProfile(null)} resent={resent} onResend={() => { setResent(true); resend(profile.email); }} onViewFull={() => viewFull(profile)} /> : null}
    </KShell>
  );
}

window.WebOpsApp = WebOpsApp;
