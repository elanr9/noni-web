/* usenoni.app /admin — Analytics explorer, same engine as the ops console:
   Filters (Format + Creator) · Sort by · time range, scoped to FieldVision AI. */
const ANS = () => window.NoniDesignSystem_710e43;
const aFmtK = (n) => n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : n >= 1e3 ? Math.round(n / 1e3) + 'k' : '' + Math.round(n);
const aMoney = (n) => '$' + n.toLocaleString('en-US');

const ADM_CREATORS = [
  { id: 'a1', name: 'Maya Reyes', email: 'maya.reyes@gmail.com', viewsN: 91700, posts: 3, earned: 208, joined: 'Aug 2, 2026' },
  { id: 'a2', name: 'Devon Kim', email: 'devon.kim@gmail.com', viewsN: 68500, posts: 1, earned: 150, joined: 'Aug 4, 2026' },
  { id: 'a3', name: 'Jordan Tate', email: 'jordantate@gmail.com', viewsN: 53600, posts: 2, earned: 120, joined: 'Aug 2, 2026' },
];
const ADM_POSTS = [
  { id: 'q1', title: 'POV: your film session runs itself', creator: 'Maya Reyes', format: 'Video', date: 'Aug 11', viewsN: 53600, tik: '41.2k', ig: '12.4k', earned: 120 },
  { id: 'q4', title: 'Sideline camera setup in 60 seconds', creator: 'Devon Kim', format: 'Video', date: 'Aug 8', viewsN: 68500, tik: '52.7k', ig: '15.8k', earned: 150 },
  { id: 'q2', title: '3 drills college scouts actually watch', creator: 'Jordan Tate', format: 'Carousel', date: 'Aug 10', viewsN: 38000, tik: '28.9k', ig: '9.1k', earned: 85 },
  { id: 'q3', title: 'How we cut game-film review to 10 minutes', creator: 'Maya Reyes', format: 'Video', date: 'Aug 9', viewsN: 25600, tik: '19.4k', ig: '6.2k', earned: 60 },
  { id: 'q5', title: 'One phone, full film crew', creator: 'Jordan Tate', format: 'Video', date: 'Aug 6', viewsN: 15600, tik: '11.2k', ig: '4.4k', earned: 35 },
  { id: 'q6', title: 'The drill that fixed our third downs', creator: 'Maya Reyes', format: 'Carousel', date: 'Aug 5', viewsN: 12500, tik: '8.9k', ig: '3.6k', earned: 28 },
];
const ADM_WEEKLY = [4, 5, 7, 8, 10, 11, 13, 15, 17, 19, 22, 26];
const ADM_FORMATS = { Video: 4, Carousel: 2 };
const A_RANGES = ['Last 24 hours', 'Last 7 days', 'Last 2 weeks', 'Last month', 'Last 12 weeks'];
const A_SORTS = ['Views over time', 'Top creators', 'Top posts', 'Formats'];

function aRangeData(range, weekly) {
  const lastW = weekly[weekly.length - 1] || 0;
  const wave = (n, base, amp, rise) => Array.from({ length: n }, (_, i) => Math.max(0.1, +(base * (1 + amp * Math.sin(i * 1.35 + 0.8) + rise * i / n)).toFixed(1)));
  if (range === 'Last 24 hours') return { data: wave(12, lastW / 7 / 10, 0.45, 0.5), labels: ['2a', '6a', '10a', '2p', '6p', '10p'] };
  if (range === 'Last 7 days') return { data: wave(7, lastW / 7, 0.3, 0.25), labels: ['Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue'] };
  if (range === 'Last 2 weeks') return { data: wave(14, lastW / 7, 0.35, 0.3), labels: ['Jul 30', 'Aug 3', 'Aug 7', 'Aug 11'] };
  if (range === 'Last month') return { data: weekly.slice(-5), labels: ['Jul 13', 'Jul 20', 'Jul 27', 'Aug 3', 'Aug 10'] };
  return { data: weekly, labels: ['May 25', 'Jun 8', 'Jun 22', 'Jul 6', 'Jul 20', 'Aug 3'] };
}

function AAreaChart({ series, labels, vb = 300 }) {
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
          <line x1={P.l} x2={W - P.r} y1={P.t + ih * f} y2={P.t + ih * f} stroke="var(--line)" strokeWidth="1"></line>
          <text x={P.l - 8} y={P.t + ih * f + 4} textAnchor="end" style={{ font: '600 11px var(--web-ui)', fill: 'var(--slate-400)' }}>{aFmtK(max * (1 - f) * 1000)}</text>
        </g>
      ))}
      <path d={`${line} L ${(P.l + iw).toFixed(1)} ${P.t + ih} L ${P.l} ${P.t + ih} Z`} fill="rgba(27,166,238,0.10)"></path>
      <path d={line} fill="none" stroke="var(--blue-500)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"></path>
      <circle cx={last[0]} cy={last[1]} r="4.5" fill="var(--blue-500)" stroke="#fff" strokeWidth="2"></circle>
      {labels.map((w, i) => <text key={w + i} x={P.l + iw * (labels.length > 1 ? i / (labels.length - 1) : 0)} y={H - 6} textAnchor="middle" style={{ font: '600 11px var(--web-ui)', fill: 'var(--slate-400)' }}>{w}</text>)}
    </svg>
  );
}

function ADropdown({ options, value, onSelect, prefix }) {
  const { Icon } = ANS();
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
        {prefix || value}<Icon name="chevron-down" size={13} color="var(--slate-400)" />
      </button>
      {open ? (
        <div style={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 70, minWidth: 170, background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 14, boxShadow: 'var(--shadow-raised)', padding: 6, transformOrigin: 'top right', animation: 'om-pop 160ms var(--ease-out) both' }}>
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

function AFilters({ formatF, creatorF, onFormat, onCreator }) {
  const { Icon } = ANS();
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
        <div style={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 70, minWidth: 210, background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 14, boxShadow: 'var(--shadow-raised)', padding: 6, transformOrigin: 'top right', animation: 'om-pop 160ms var(--ease-out) both' }}>
          <KLabel style={{ display: 'block', padding: '8px 12px 4px' }}>Format</KLabel>
          {['All formats', 'Video', 'Carousel'].map((f) => <Item key={f} label={f} on={formatF === f} pick={() => onFormat(f)} />)}
          <KLabel style={{ display: 'block', padding: '10px 12px 4px', borderTop: '1px solid var(--line)', marginTop: 6 }}>Creator</KLabel>
          {['All creators', ...ADM_CREATORS.map((p) => p.name)].map((c) => <Item key={c} label={c} on={creatorF === c} pick={() => onCreator(c)} />)}
        </div>
      ) : null}
    </div>
  );
}

function CreatorProfileModal({ creator, onClose }) {
  const { Icon } = ANS();
  const posts = ADM_POSTS.filter((q) => q.creator === creator.name).sort((a, b) => b.viewsN - a.viewsN);
  return (
    <KModal onClose={onClose}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
        <KAvatar name={creator.name} size={46} />
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: 'block', font: '700 19px var(--web-display)', letterSpacing: '-0.4px', color: 'var(--ink)' }}>{creator.name}</span>
          <span style={{ display: 'block', marginTop: 2, font: '600 12.5px var(--web-ui)', color: 'var(--slate-400)' }}>{creator.email} · Creator · joined {creator.joined}</span>
        </span>
      </div>
      <div style={{ display: 'flex', gap: 14, padding: '14px 16px', borderRadius: 14, background: 'var(--fill-quiet)', marginBottom: 14 }}>
        {[['Posts', creator.posts], ['Views this month', aFmtK(creator.viewsN)], ['Earned', aMoney(creator.earned)]].map(([l, v]) => (
          <span key={l} style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: 'block', font: '600 11.5px var(--web-ui)', color: 'var(--slate-400)', whiteSpace: 'nowrap' }}>{l}</span>
            <span style={{ display: 'block', marginTop: 3, font: '700 19px var(--web-display)', letterSpacing: '-0.4px', color: 'var(--ink)' }}>{v}</span>
          </span>
        ))}
      </div>
      <KLabel style={{ display: 'block', marginBottom: 4 }}>Posts</KLabel>
      {posts.map((q) => (
        <div key={q.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: '1px solid var(--line)' }}>
          <span style={{ width: 36, height: 48, flex: '0 0 auto', borderRadius: 9, background: 'var(--blue-100)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={q.format === 'Video' ? 'play' : 'images'} size={14} color="var(--blue-700)" />
          </span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: 'block', font: '700 13.5px var(--web-ui)', color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{q.title}</span>
            <span style={{ display: 'block', marginTop: 2, font: '600 12px var(--web-ui)', color: 'var(--slate-400)' }}>{q.date} · {q.format} · TikTok {q.tik} · IG {q.ig}</span>
          </span>
          <span style={{ textAlign: 'right' }}>
            <span style={{ display: 'block', font: '700 14px var(--web-ui)', color: 'var(--ink)' }}>{aFmtK(q.viewsN)}</span>
            <span style={{ display: 'block', font: '700 11.5px var(--web-ui)', color: 'var(--green, #1F9D5B)' }}>{aMoney(q.earned)}</span>
          </span>
        </div>
      ))}
    </KModal>
  );
}

function CreatorRankRow({ rank, p, share, max, onOpen }) {
  const { Icon } = ANS();
  const [hover, setHover] = React.useState(false);
  const v = Math.round(p.viewsN * share);
  return (
    <div role="button" onClick={onOpen} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '10px 12px', margin: '0 -12px', borderRadius: 12, cursor: 'pointer', background: hover ? 'var(--fill-quiet)' : 'transparent', transition: 'background var(--dur-fast) var(--ease-out)' }}>
      <span style={{ width: 30, font: '800 14px var(--web-ui)', color: rank === 1 ? 'var(--blue-700)' : 'var(--slate-400)' }}>#{rank}</span>
      <KAvatar name={p.name} size={30} />
      <span style={{ width: 110, font: '700 13.5px var(--web-ui)', color: 'var(--ink)', whiteSpace: 'nowrap' }}>{p.name}</span>
      <span style={{ flex: 1, height: 10, borderRadius: 999, background: 'var(--fill-quiet)', overflow: 'hidden' }}>
        <span style={{ display: 'block', width: Math.round((v / max) * 100) + '%', height: '100%', borderRadius: 999, background: 'var(--blue-500)' }}></span>
      </span>
      <span style={{ width: 78, textAlign: 'right', font: '700 13px var(--web-ui)', color: 'var(--ink)', whiteSpace: 'nowrap' }}>{aFmtK(v)} views</span>
      <span style={{ width: 96, textAlign: 'right' }}>{hover ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, font: '700 12px var(--web-ui)', color: 'var(--blue-700)', whiteSpace: 'nowrap', animation: 'om-fade 120ms var(--ease-out) both' }}>View profile <Icon name="arrow-right" size={12} /></span> : null}</span>
    </div>
  );
}

const ADM_DAILY = { 1: [9000, 14, 120], 2: [11200, 18, 150], 3: [8400, 12, 95], 4: [13100, 22, 180], 5: [12500, 19, 160], 6: [15600, 24, 210], 7: [10200, 15, 130], 8: [22400, 31, 260], 9: [25600, 28, 240], 10: [19800, 26, 220], 11: [30400, 38, 320], 12: [8100, 9, 70] };
const dayPosts = (d) => ADM_POSTS.filter((q) => q.date === 'Aug ' + d);

function DayDetail({ day, onOpenPost, onClose }) {
  const { Icon } = ANS();
  const [views, signups, sales] = ADM_DAILY[day] || [0, 0, 0];
  const posts = dayPosts(day);
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <span style={{ flex: 1, font: '700 18px var(--web-display)', letterSpacing: '-0.4px', color: 'var(--ink)' }}>Aug {day}</span>
        <button type="button" onClick={onClose} aria-label="Close" style={{ width: 30, height: 30, borderRadius: 999, border: 'none', cursor: 'pointer', background: 'var(--fill-quiet)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="x" size={14} color="var(--slate-500)" />
        </button>
      </div>
      <div style={{ display: 'flex', gap: 14, padding: '14px 16px', borderRadius: 14, background: 'var(--fill-quiet)', marginBottom: 14 }}>
        {[['Views', aFmtK(views)], ['Sign-ups', signups], ['Sales', aMoney(sales)]].map(([l, v]) => (
          <span key={l} style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: 'block', font: '600 11.5px var(--web-ui)', color: 'var(--slate-400)' }}>{l}</span>
            <span style={{ display: 'block', marginTop: 3, font: '700 19px var(--web-display)', letterSpacing: '-0.4px', color: 'var(--ink)' }}>{v}</span>
          </span>
        ))}
      </div>
      <KLabel style={{ display: 'block', marginBottom: 4 }}>Posted Aug {day}</KLabel>
      {posts.length === 0 ? <p style={{ margin: '8px 0 4px', font: '600 13.5px var(--web-ui)', color: 'var(--slate-400)' }}>Nothing posted this day.</p> : posts.map((q) => (
        <div key={q.id} role="button" onClick={() => onOpenPost(q)}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--fill-quiet)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 10px', margin: '0 -10px', borderRadius: 12, cursor: 'pointer', transition: 'background var(--dur-fast) var(--ease-out)' }}>
          <span style={{ width: 36, height: 48, flex: '0 0 auto', borderRadius: 9, background: 'var(--blue-100)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={q.format === 'Video' ? 'play' : 'images'} size={14} color="var(--blue-700)" />
          </span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: 'block', font: '700 13.5px var(--web-ui)', color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{q.title}</span>
            <span style={{ display: 'block', marginTop: 2, font: '600 12px var(--web-ui)', color: 'var(--slate-400)' }}>{q.creator} · {q.format}</span>
          </span>
          <span style={{ textAlign: 'right' }}>
            <span style={{ display: 'block', font: '700 14px var(--web-ui)', color: 'var(--ink)' }}>{aFmtK(q.viewsN)}</span>
            <span style={{ display: 'block', font: '700 11.5px var(--web-ui)', color: 'var(--green, #1F9D5B)' }}>{aMoney(q.earned)}</span>
          </span>
          <Icon name="chevron-right" size={15} color="var(--slate-400)" />
        </div>
      ))}
    </div>
  );
}

function PostDetail({ post, onBack }) {
  const { Icon } = ANS();
  const tt = Math.round(post.viewsN * 0.76), ig = post.viewsN - tt;
  const col = (name, icon, v) => (
    <div style={{ flex: 1, minWidth: 0, borderRadius: 14, border: '1px solid var(--line)', padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <Icon name={icon} size={15} color="var(--ink)" /><span style={{ font: '700 13.5px var(--web-ui)', color: 'var(--ink)' }}>{name}</span>
      </div>
      {[['Views', aFmtK(v)], ['Likes', aFmtK(Math.round(v * 0.085))], ['Saves', aFmtK(Math.round(v * 0.016))]].map(([l, x]) => (
        <div key={l} style={{ display: 'flex', alignItems: 'baseline', gap: 8, padding: '5px 0' }}>
          <span style={{ flex: 1, font: '600 12.5px var(--web-ui)', color: 'var(--slate-400)' }}>{l}</span>
          <span style={{ font: '700 14px var(--web-ui)', color: 'var(--ink)' }}>{x}</span>
        </div>
      ))}
    </div>
  );
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <button type="button" onClick={onBack} aria-label="Back" style={{ width: 32, height: 32, flex: '0 0 auto', borderRadius: 999, border: '1px solid var(--line)', cursor: 'pointer', background: 'var(--white)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="chevron-left" size={16} color="var(--ink)" />
        </button>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: 'block', font: '700 17px var(--web-display)', letterSpacing: '-0.4px', color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{post.title}</span>
          <span style={{ display: 'block', marginTop: 2, font: '600 12.5px var(--web-ui)', color: 'var(--slate-400)' }}>{post.creator} · {post.format} · {post.date}</span>
        </span>
        <KPill size="sm" variant="tint" icon="share-2">Open post</KPill>
      </div>
      <div style={{ display: 'flex', gap: 14, padding: '14px 16px', borderRadius: 14, background: 'var(--fill-quiet)', marginBottom: 14 }}>
        {[['Total views', aFmtK(post.viewsN)], ['Earned', aMoney(post.earned)], ['Posted', post.date]].map(([l, v]) => (
          <span key={l} style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: 'block', font: '600 11.5px var(--web-ui)', color: 'var(--slate-400)' }}>{l}</span>
            <span style={{ display: 'block', marginTop: 3, font: '700 19px var(--web-display)', letterSpacing: '-0.4px', color: 'var(--ink)' }}>{v}</span>
          </span>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 14 }}>
        {col('TikTok', 'music-2', tt)}
        {col('Instagram', 'at-sign', ig)}
      </div>
    </div>
  );
}

function DayModal({ day, onClose }) {
  const { Icon } = ANS();
  const [views, signups, sales] = ADM_DAILY[day] || [0, 0, 0];
  const posts = dayPosts(day);
  return (
    <KModal title={'Aug ' + day} onClose={onClose}>
      <div style={{ display: 'flex', gap: 14, padding: '14px 16px', borderRadius: 14, background: 'var(--fill-quiet)', marginBottom: 14 }}>
        {[['Views', aFmtK(views)], ['Sign-ups', signups], ['Sales', aMoney(sales)]].map(([l, v]) => (
          <span key={l} style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: 'block', font: '600 11.5px var(--web-ui)', color: 'var(--slate-400)' }}>{l}</span>
            <span style={{ display: 'block', marginTop: 3, font: '700 19px var(--web-display)', letterSpacing: '-0.4px', color: 'var(--ink)' }}>{v}</span>
          </span>
        ))}
      </div>
      <KLabel style={{ display: 'block', marginBottom: 4 }}>Posted Aug {day}</KLabel>
      {posts.length === 0 ? <p style={{ margin: '8px 0 4px', font: '600 13.5px var(--web-ui)', color: 'var(--slate-400)' }}>Nothing posted this day.</p> : posts.map((q) => (
        <div key={q.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: '1px solid var(--line)' }}>
          <span style={{ width: 36, height: 48, flex: '0 0 auto', borderRadius: 9, background: 'var(--blue-100)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={q.format === 'Video' ? 'play' : 'images'} size={14} color="var(--blue-700)" />
          </span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: 'block', font: '700 13.5px var(--web-ui)', color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{q.title}</span>
            <span style={{ display: 'block', marginTop: 2, font: '600 12px var(--web-ui)', color: 'var(--slate-400)' }}>{q.creator} · {q.format}</span>
          </span>
          <span style={{ textAlign: 'right' }}>
            <span style={{ display: 'block', font: '700 14px var(--web-ui)', color: 'var(--ink)' }}>{aFmtK(q.viewsN)}</span>
            <span style={{ display: 'block', font: '700 11.5px var(--web-ui)', color: 'var(--green, #1F9D5B)' }}>{aMoney(q.earned)}</span>
          </span>
        </div>
      ))}
    </KModal>
  );
}

function MonthCalendar({ onPick }) {
  const offset = 6; /* Aug 1, 2026 is a Saturday */
  const cells = [...Array.from({ length: offset }, () => null), ...Array.from({ length: 31 }, (_, i) => i + 1)];
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginBottom: 6 }}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => <span key={d} style={{ textAlign: 'center', font: '800 10.5px var(--web-ui)', letterSpacing: '0.6px', textTransform: 'uppercase', color: 'var(--slate-400)' }}>{d}</span>)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
        {cells.map((d, i) => {
          if (!d) return <span key={'e' + i}></span>;
          const has = ADM_DAILY[d]; const posts = dayPosts(d).length;
          const future = d > 12;
          return (
            <button key={d} type="button" onClick={has ? () => onPick(d) : undefined}
              onMouseEnter={(e) => { if (has) e.currentTarget.style.background = 'var(--blue-100)'; }} onMouseLeave={(e) => { if (has) e.currentTarget.style.background = 'var(--white)'; }}
              style={{ minHeight: 64, borderRadius: 12, border: '1px solid var(--line)', background: 'var(--white)', cursor: has ? 'pointer' : 'default', opacity: future ? 0.4 : 1, padding: '8px 9px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 3, transition: 'background var(--dur-fast) var(--ease-out)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, font: '700 12.5px var(--web-ui)', color: 'var(--ink)' }}>{d}{posts ? <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--blue-500)' }}></span> : null}</span>
              {has ? <span style={{ font: '700 11px var(--web-ui)', color: 'var(--blue-700)', whiteSpace: 'nowrap' }}>+{has[1]} · {aMoney(has[2])}</span> : null}
            </button>
          );
        })}
      </div>
      <p style={{ margin: '10px 0 0', font: '600 12px var(--web-ui)', color: 'var(--slate-400)' }}>Badge = sign-ups and sales that day. Dot = posts published. Click a day for the full picture.</p>
    </div>
  );
}

function AnalyticsPage() {
  const { Icon } = ANS();
  const [range, setRange] = React.useState('Last 7 days');
  const [sortBy, setSortBy] = React.useState('Views over time');
  const [formatF, setFormatF] = React.useState('All formats');
  const [creatorF, setCreatorF] = React.useState('All creators');
  const [profile, setProfile] = React.useState(null);
  const [day, setDay] = React.useState(null);
  const [post, setPost] = React.useState(null);
  const [mode, setMode] = React.useState('Graph');
  const fmtTotal = ADM_FORMATS.Video + ADM_FORMATS.Carousel;
  const fmtShare = formatF === 'All formats' ? 1 : ADM_FORMATS[formatF] / fmtTotal;
  const crTotal = ADM_CREATORS.reduce((n, p) => n + p.viewsN, 0);
  const crObj = ADM_CREATORS.find((p) => p.name === creatorF);
  const crShare = crObj ? crObj.viewsN / crTotal : 1;
  const factor = fmtShare * crShare;
  const chart = aRangeData(range, ADM_WEEKLY.map((v) => +(v * factor).toFixed(1)));
  const ranked = (crObj ? [crObj] : ADM_CREATORS).slice().sort((a, b) => b.viewsN - a.viewsN);
  const maxCr = Math.max(...ranked.map((p) => p.viewsN * fmtShare), 1);
  const posts = ADM_POSTS.filter((q) => (formatF === 'All formats' || q.format === formatF) && (creatorF === 'All creators' || q.creator === creatorF)).sort((a, b) => b.viewsN - a.viewsN);
  const fmtEntries = Object.entries(ADM_FORMATS).filter(([k]) => formatF === 'All formats' || k === formatF).map(([k, v]) => [k, Math.round(v * crShare * 10) / 10]);
  const maxFmt = Math.max(...fmtEntries.map(([, v]) => v), 1);
  return (
    <div>
      <KPageHead title="Analytics" sub="Views, sign-ups and earnings across every post and creator."
        right={<div style={{ display: 'flex', gap: 4, background: 'var(--fill-quiet)', borderRadius: 999, padding: 3 }}>
          {[['Graph', 'chart-column'], ['Calendar', 'calendar-days']].map(([v, ic]) => (
            <button key={v} type="button" onClick={() => setMode(v)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 13px', borderRadius: 999, border: 'none', cursor: 'pointer', background: mode === v ? 'var(--white)' : 'transparent', boxShadow: mode === v ? 'var(--shadow-card)' : 'none', font: '700 12.5px var(--web-ui)', color: mode === v ? 'var(--ink)' : 'var(--slate-400)', whiteSpace: 'nowrap', transition: 'background var(--dur-fast) var(--ease-out)' }}>
              <Icon name={ic} size={13} /> {v}
            </button>
          ))}
        </div>} />
      <KCard pad={22} style={{ display: 'flex', gap: 18, marginBottom: 14 }}>
        {[['Views this month', '214k', '+18% vs July'], ['Posts', '46', '+9 this week'], ['Sign-ups attributed', '380', '+22% vs July'], ['Paid to creators', '$2,140', 'August so far']].map(([l, v, d]) => (
          <span key={l} style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: 'block', font: '600 12px var(--web-ui)', color: 'var(--slate-400)', whiteSpace: 'nowrap' }}>{l}</span>
            <span style={{ display: 'block', marginTop: 4, font: '700 24px var(--web-display)', letterSpacing: '-0.6px', color: 'var(--ink)' }}>{v}</span>
            <span style={{ display: 'block', marginTop: 2, font: '600 12px var(--web-ui)', color: 'var(--slate-400)', whiteSpace: 'nowrap' }}>{d}</span>
          </span>
        ))}
      </KCard>
      {mode === 'Graph' ? (
      <KCard pad={22}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
          <KLabel style={{ flex: 1 }}>Explore</KLabel>
          <AFilters formatF={formatF} creatorF={creatorF} onFormat={setFormatF} onCreator={setCreatorF} />
          <ADropdown prefix="Sort by" options={A_SORTS} value={sortBy} onSelect={setSortBy} />
          <ADropdown options={A_RANGES} value={range} onSelect={setRange} />
        </div>
        <div key={sortBy + range + formatF + creatorF} style={{ animation: 'om-rise 240ms var(--ease-out) both' }}>
          {sortBy === 'Views over time' ? (
            <div>
              <KLabel style={{ display: 'block', marginBottom: 12 }}>Views · {range.toLowerCase()}{formatF !== 'All formats' ? ' · ' + formatF : ''}{creatorF !== 'All creators' ? ' · ' + creatorF : ''}</KLabel>
              <AAreaChart series={chart.data} labels={chart.labels} />
            </div>) : null}
          {sortBy === 'Top creators' ? (
            <div>
              <KLabel style={{ display: 'block', marginBottom: 10 }}>Top creators{formatF !== 'All formats' ? ' · ' + formatF : ''}</KLabel>
              {ranked.map((p, i) => <CreatorRankRow key={p.id} rank={i + 1} p={p} share={fmtShare} max={maxCr} onOpen={() => setProfile(p)} />)}
            </div>) : null}
          {sortBy === 'Top posts' ? (
            <div>
              <KLabel style={{ display: 'block', marginBottom: 14 }}>Top posts{formatF !== 'All formats' ? ' · ' + formatF : ''}{creatorF !== 'All creators' ? ' · ' + creatorF : ''}</KLabel>
              {posts.length === 0 ? <p style={{ margin: 0, font: '600 14px var(--web-ui)', color: 'var(--slate-400)' }}>No posts match these filters.</p> : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {posts.map((q) => (
                    <div key={q.id} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: 14, borderRadius: 14, border: '1px solid var(--line)' }}>
                      <span style={{ width: 42, height: 56, flex: '0 0 auto', borderRadius: 10, background: 'var(--blue-100)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon name={q.format === 'Video' ? 'play' : 'images'} size={15} color="var(--blue-700)" />
                      </span>
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ display: 'block', font: '700 14px var(--web-ui)', color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{q.title}</span>
                        <span style={{ display: 'block', marginTop: 2, font: '600 12.5px var(--web-ui)', color: 'var(--slate-400)' }}>{q.creator} · {q.format} · {q.date}</span>
                      </span>
                      <span style={{ font: '700 14px var(--web-ui)', color: 'var(--ink)' }}>{aFmtK(q.viewsN)}</span>
                    </div>
                  ))}
                </div>)}
            </div>) : null}
          {sortBy === 'Formats' ? (
            <div>
              <KLabel style={{ display: 'block', marginBottom: 16 }}>Posts by format{creatorF !== 'All creators' ? ' · ' + creatorF : ''}</KLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 15, maxWidth: 720 }}>
                {fmtEntries.map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ width: 74, font: '600 13px var(--web-ui)', color: 'var(--slate-500)' }}>{k}</span>
                    <span style={{ flex: 1, height: 10, borderRadius: 999, background: 'var(--fill-quiet)', overflow: 'hidden' }}>
                      <span style={{ display: 'block', width: Math.round(100 * v / maxFmt) + '%', height: '100%', borderRadius: 999, background: 'var(--blue-500)' }}></span>
                    </span>
                    <span style={{ width: 70, textAlign: 'right', font: '700 13px var(--web-ui)', color: 'var(--ink)' }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>) : null}
        </div>
      </KCard>
      ) : (
      <React.Fragment>
      <KCard pad={22}>
        <KLabel style={{ display: 'block', marginBottom: 14 }}>Daily activity · August</KLabel>
        <MonthCalendar onPick={(d) => { setDay(d); setPost(null); }} />
      </KCard>
      {day ? (
        <KCard key={'d' + day + (post ? post.id : '')} pad={22} style={{ marginTop: 14, animation: 'om-rise 240ms var(--ease-out) both' }}>
          {post ? <PostDetail post={post} onBack={() => setPost(null)} /> : <DayDetail day={day} onOpenPost={setPost} onClose={() => setDay(null)} />}
        </KCard>) : null}
      </React.Fragment>
      )}
      {profile ? <CreatorProfileModal creator={profile} onClose={() => setProfile(null)} /> : null}
    </div>
  );
}

const MGR_BRIEFS = [
  { title: 'Film day POV', day: 'Aug 9', format: 'Video', status: 'Active', hook: 'POV: your film session runs itself' },
  { title: 'Drills scouts watch', day: 'Aug 10', format: 'Carousel', status: 'Active', hook: '3 drills college scouts actually pause on' },
  { title: '10-minute film review', day: 'Aug 6', format: 'Video', status: 'Archived', hook: 'We cut film night to 10 minutes' },
];

function ProfilePage({ person, onBack }) {
  const { Icon } = ANS();
  const [post, setPost] = React.useState(null);
  const plain = (person.name || '').replace(' (you)', '');
  const isCreator = person.role === 'Creator';
  const posts = ADM_POSTS.filter((q) => q.creator === plain).sort((a, b) => b.viewsN - a.viewsN);
  if (post) return (
    <div><KCard pad={22}><PostDetail post={post} onBack={() => setPost(null)} /></KCard></div>
  );
  return (
    <div>
      <KPageHead onBack={onBack} title={person.name} sub={`${person.role} · joined ${person.joined || 'August 2026'}`}
        right={person.status === 'Active' ? <KChip tone="green">Active</KChip> : <KChip tone="amber">Invite sent</KChip>} />
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 14, alignItems: 'start' }}>
        <KCard pad={0}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px' }}>
            <KAvatar name={plain} size={42} />
            <span style={{ minWidth: 0 }}>
              <span style={{ display: 'block', font: '700 15px var(--web-ui)', color: 'var(--ink)' }}>{plain}</span>
              <span style={{ display: 'block', marginTop: 2, font: '600 12px var(--web-ui)', color: 'var(--slate-400)' }}>{person.role}</span>
            </span>
          </div>
          {[['Email', person.email], ['Joined', person.joined || 'August 2026'], ['Status', person.status || 'Invited']].map(([l, v]) => (
            <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderTop: '1px solid var(--line)' }}>
              <span style={{ width: 64, font: '600 12.5px var(--web-ui)', color: 'var(--slate-400)' }}>{l}</span>
              <span style={{ flex: 1, font: '700 13.5px var(--web-ui)', color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v}</span>
            </div>
          ))}
        </KCard>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>
          {isCreator ? (<React.Fragment>
            <KCard pad={22} style={{ display: 'flex', gap: 18 }}>
              {[['Posts this month', person.posts || 0], ['Views this month', person.viewsN ? aFmtK(person.viewsN) : '0'], ['Earned', aMoney(person.earned || 0)]].map(([l, v]) => (
                <span key={l} style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', font: '600 12px var(--web-ui)', color: 'var(--slate-400)' }}>{l}</span>
                  <span style={{ display: 'block', marginTop: 5, font: '700 26px var(--web-display)', letterSpacing: '-0.5px', color: 'var(--ink)' }}>{v}</span>
                </span>
              ))}
            </KCard>
            <KCard pad={0}>
              <KLabel style={{ display: 'block', padding: '16px 20px 8px' }}>Posts</KLabel>
              {posts.length === 0 ? (
                <p style={{ margin: 0, padding: '4px 20px 18px', font: '600 13.5px var(--web-ui)', color: 'var(--slate-400)' }}>Nothing published yet.</p>
              ) : posts.map((q) => (
                <div key={q.id} role="button" onClick={() => setPost(q)}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--fill-quiet)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '13px 20px', borderTop: '1px solid var(--line)', cursor: 'pointer', transition: 'background var(--dur-fast) var(--ease-out)' }}>
                  <span style={{ width: 42, height: 56, flex: '0 0 auto', borderRadius: 10, background: 'var(--blue-100)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name={q.format === 'Video' ? 'play' : 'images'} size={15} color="var(--blue-700)" />
                  </span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'block', font: '700 14px var(--web-ui)', color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{q.title}</span>
                    <span style={{ display: 'block', marginTop: 2, font: '600 12.5px var(--web-ui)', color: 'var(--slate-400)' }}>{q.date} · {q.format} · TikTok {q.tik} · IG {q.ig}</span>
                  </span>
                  <span style={{ textAlign: 'right' }}>
                    <span style={{ display: 'block', font: '700 15px var(--web-display)', color: 'var(--ink)' }}>{aFmtK(q.viewsN)}</span>
                    <span style={{ display: 'block', marginTop: 2, font: '700 12px var(--web-ui)', color: 'var(--green, #1F9D5B)' }}>{aMoney(q.earned)}</span>
                  </span>
                  <Icon name="chevron-right" size={15} color="var(--slate-400)" />
                </div>
              ))}
            </KCard>
          </React.Fragment>) : (<React.Fragment>
            <KCard pad={22}>
              <p style={{ margin: 0, font: '600 14px/1.6 var(--web-ui)', color: 'var(--slate-500)' }}>Runs FieldVision AI's weekly briefs and keeps creators on pace, from the Noni app.</p>
            </KCard>
            <KCard pad={0}>
              <KLabel style={{ display: 'block', padding: '16px 20px 8px' }}>Briefs this week</KLabel>
              {MGR_BRIEFS.map((b) => (
                <div key={b.title} style={{ padding: '13px 20px', borderTop: '1px solid var(--line)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ flex: 1, font: '700 14px var(--web-ui)', color: 'var(--ink)' }}>{b.title}</span>
                    <KChip tone="blue" style={{ padding: '3px 9px', fontSize: 11.5 }}>{b.format}</KChip>
                    <KChip tone={b.status === 'Active' ? 'green' : 'slate'} style={{ padding: '3px 9px', fontSize: 11.5 }}>{b.status}</KChip>
                  </div>
                  <div style={{ marginTop: 5, font: '600 12.5px var(--web-ui)', color: 'var(--slate-400)' }}>{b.day} · <span style={{ font: '800 10.5px var(--web-ui)', letterSpacing: '0.7px', color: 'var(--slate-400)' }}>HOOK</span> {b.hook}</div>
                </div>
              ))}
            </KCard>
          </React.Fragment>)}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { AnalyticsPage, CreatorProfileModal, MonthCalendar, DayModal, DayDetail, PostDetail, ProfilePage, ADM_POSTS, aFmtK, aMoney });
