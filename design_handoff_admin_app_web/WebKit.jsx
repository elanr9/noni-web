/* usenoni.app web shell vocabulary — white ground, one blue, pill actions,
   hairline cards. Syne display / Manrope UI (per brand brief). */
const KNS = () => window.NoniDesignSystem_710e43;

function KCard({ children, pad = 20, onClick, style }) {
  return (
    <div onClick={onClick} role={onClick ? 'button' : undefined}
      style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 16, boxShadow: 'var(--shadow-card)', padding: pad, cursor: onClick ? 'pointer' : 'default', ...style }}>
      {children}
    </div>
  );
}

function KLabel({ children, style }) {
  return <span style={{ font: '800 11px var(--web-ui)', letterSpacing: '0.9px', textTransform: 'uppercase', color: 'var(--slate-400)', ...style }}>{children}</span>;
}

function KPill({ children, icon, variant = 'primary', size = 'md', onClick, style }) {
  const { Icon } = KNS();
  const [hover, setHover] = React.useState(false);
  const [down, setDown] = React.useState(false);
  const looks = {
    primary: { background: 'var(--blue-500)', color: 'var(--white)', boxShadow: 'var(--shadow-accent)' },
    tint: { background: 'var(--blue-100)', color: 'var(--blue-700)' },
    quiet: { background: 'var(--fill-quiet)', color: 'var(--ink)' },
    danger: { background: 'var(--danger-soft)', color: 'var(--danger)' },
    ghost: { background: 'transparent', color: 'var(--slate-500)' },
  };
  const hoverLook = hover ? (variant === 'ghost' ? { background: 'var(--fill-quiet)' } : { filter: 'brightness(0.93) saturate(1.15)' }) : null;
  return (
    <button type="button" onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => { setHover(false); setDown(false); }}
      onMouseDown={() => setDown(true)} onMouseUp={() => setDown(false)}
      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: size === 'sm' ? '8px 14px' : '12px 22px', borderRadius: 999, border: 'none', cursor: 'pointer', font: `700 ${size === 'sm' ? 13 : 14.5}px var(--web-ui)`, whiteSpace: 'nowrap', transform: down ? 'scale(0.97)' : 'none', transition: 'filter var(--dur-fast) var(--ease-out), background var(--dur-fast) var(--ease-out), transform 90ms var(--ease-out)', ...looks[variant], ...hoverLook, ...style }}>
      {icon ? <Icon name={icon} size={size === 'sm' ? 14 : 16} /> : null}{children}
    </button>
  );
}

function KChip({ children, tone = 'blue', style }) {
  const tones = {
    blue: { background: 'var(--blue-100)', color: 'var(--blue-700)' },
    green: { background: 'var(--green-soft, #E4F6EC)', color: 'var(--green, #1F9D5B)' },
    amber: { background: 'var(--amber-soft, #FCF1DD)', color: 'var(--amber, #B97D14)' },
    slate: { background: 'var(--fill-quiet)', color: 'var(--slate-500)' },
  };
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 11px', borderRadius: 999, font: '700 12px var(--web-ui)', whiteSpace: 'nowrap', ...tones[tone], ...style }}>{children}</span>;
}

function KAvatar({ name, size = 34 }) {
  const initial = (name || '?').trim().charAt(0).toUpperCase();
  return <span style={{ width: size, height: size, flex: '0 0 auto', borderRadius: 999, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'var(--blue-100)', color: 'var(--blue-700)', font: `800 ${Math.round(size * 0.4)}px var(--web-ui)` }}>{initial}</span>;
}

function KPageHead({ title, sub, right, onBack }) {
  const { Icon } = KNS();
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, marginBottom: 24 }}>
      {onBack ? (
        <button type="button" onClick={onBack} aria-label="Back" style={{ width: 38, height: 38, marginBottom: 2, flex: '0 0 auto', borderRadius: 999, border: '1px solid var(--border)', cursor: 'pointer', background: 'var(--white)', boxShadow: 'var(--shadow-card)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="chevron-left" size={18} color="var(--ink)" />
        </button>) : null}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h1 style={{ margin: 0, font: '700 26px var(--web-display)', letterSpacing: '-0.5px', color: 'var(--ink)' }}>{title}</h1>
        {sub ? <p style={{ margin: '7px 0 0', font: '600 14.5px/1.5 var(--web-ui)', color: 'var(--slate-400)', maxWidth: 560 }}>{sub}</p> : null}
      </div>
      {right ? <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>{right}</div> : null}
    </div>
  );
}

function KSideItem({ icon, label, badge, active, onClick }) {
  const { Icon } = KNS();
  const [hover, setHover] = React.useState(false);
  return (
    <button type="button" data-tour={label} onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ display: 'flex', alignItems: 'center', gap: 11, width: '100%', padding: '9px 11px', borderRadius: 11, border: 'none', cursor: 'pointer', textAlign: 'left', background: active ? 'var(--blue-100)' : hover ? 'var(--fill-quiet)' : 'transparent', color: active ? 'var(--blue-700)' : 'var(--slate-500)', font: '700 13.5px var(--web-ui)', transition: 'background var(--dur-fast) var(--ease-out)' }}>
      <Icon name={icon} size={17} color={active ? 'var(--blue-700)' : 'var(--slate-400)'} />
      <span style={{ flex: 1 }}>{label}</span>
      {badge ? <span style={{ padding: '2px 8px', borderRadius: 999, background: active ? 'var(--white)' : 'var(--blue-100)', color: 'var(--blue-700)', font: '800 11px var(--web-ui)' }}>{badge}</span> : null}
    </button>
  );
}

/* Stripe-style smart search: centered command bar, ⌘K / "/" to focus,
   grouped results ("Go to" pages + records) with match highlighting. */
function KHi({ text, q }) {
  const i = q ? text.toLowerCase().indexOf(q) : -1;
  if (i < 0) return text;
  return (<span>{text.slice(0, i)}<span style={{ background: 'var(--blue-100)', borderRadius: 3, padding: '1px 0' }}>{text.slice(i, i + q.length)}</span>{text.slice(i + q.length)}</span>);
}

function KSearch({ index, onGo }) {
  const { Icon } = KNS();
  const [q, setQ] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const [focus, setFocus] = React.useState(false);
  const inputRef = React.useRef(null);
  const wrapRef = React.useRef(null);
  React.useEffect(() => {
    const key = (e) => {
      const typing = /^(INPUT|TEXTAREA)$/.test(document.activeElement?.tagName || '');
      if (((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') || (e.key === '/' && !typing)) { e.preventDefault(); inputRef.current?.focus(); setOpen(true); }
      else if (e.key === 'Escape') { setOpen(false); inputRef.current?.blur(); }
    };
    const out = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    window.addEventListener('keydown', key); window.addEventListener('mousedown', out);
    return () => { window.removeEventListener('keydown', key); window.removeEventListener('mousedown', out); };
  }, []);
  const ql = q.trim().toLowerCase();
  const hits = index.filter((it) => !ql ? it.section === 'Go to' : `${it.title} ${it.meta || ''}`.toLowerCase().includes(ql));
  const sections = [];
  hits.forEach((it) => { let s = sections.find((x) => x.label === it.section); if (!s) sections.push(s = { label: it.section, items: [] }); s.items.push(it); });
  const pick = (it) => { onGo(it); setQ(''); setOpen(false); inputRef.current?.blur(); };
  return (
    <div ref={wrapRef} style={{ position: 'relative', width: '100%', maxWidth: 560 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '9px 16px', borderRadius: 999, background: 'var(--white)', border: focus ? '1px solid var(--blue-500)' : '1px solid var(--border)', boxShadow: focus ? '0 0 0 3px rgba(27,166,238,0.18)' : 'var(--shadow-card)', transition: 'box-shadow var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out)' }}>
        <Icon name="search" size={15} color="var(--slate-400)" />
        <input ref={inputRef} value={q} placeholder="Search or jump to…"
          onChange={(e) => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => { setFocus(true); setOpen(true); }} onBlur={() => setFocus(false)}
          onKeyDown={(e) => { if (e.key === 'Enter' && hits[0]) pick(hits[0]); }}
          style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', font: '600 14px var(--web-ui)', color: 'var(--ink)' }} />
        <span style={{ flex: '0 0 auto', padding: '2px 7px', borderRadius: 6, border: '1px solid var(--line)', font: '700 11px var(--web-ui)', color: 'var(--slate-400)' }}>⌘K</span>
      </div>
      {open ? (
        <div style={{ position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0, zIndex: 60, background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 16, boxShadow: 'var(--shadow-raised)', padding: 8, maxHeight: 420, overflowY: 'auto', transformOrigin: 'top center', animation: 'om-pop 160ms var(--ease-out) both' }}>
          {sections.length === 0 ? (
            <div style={{ padding: '22px 14px', textAlign: 'center', font: '600 13.5px var(--web-ui)', color: 'var(--slate-400)' }}>Nothing matches “{q.trim()}”</div>
          ) : sections.map((s) => (
            <div key={s.label}>
              <KLabel style={{ display: 'block', padding: '10px 12px 5px' }}>{s.label}</KLabel>
              {s.items.map((it, i) => (
                <button key={s.label + i} type="button" onMouseDown={(e) => { e.preventDefault(); pick(it); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 11, width: '100%', padding: '9px 12px', borderRadius: 10, border: 'none', cursor: 'pointer', textAlign: 'left', background: 'transparent', font: '700 13.5px var(--web-ui)', color: 'var(--ink)' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--fill-quiet)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <Icon name={it.icon} size={15} color="var(--slate-400)" />
                  <span style={{ flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}><KHi text={it.title} q={ql} /></span>
                  {it.meta ? <span style={{ font: '600 12.5px var(--web-ui)', color: 'var(--slate-400)', whiteSpace: 'nowrap' }}><KHi text={it.meta} q={ql} /></span> : null}
                </button>
              ))}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/* Full app frame: fixed sidebar + top command bar + scrolling content. */
function KShell({ groups, active, onSelect, user, company, search, children }) {
  const { Icon } = KNS();
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--paper, #F7FAFD)' }}>
      <aside style={{ width: 236, flex: '0 0 auto', display: 'flex', flexDirection: 'column', background: 'var(--white)', borderRight: '1px solid var(--line)', padding: '22px 14px 14px', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '0 9px' }}>
          <img src="assets/noni-logo.svg" alt="" width="30" height="30" style={{ display: 'block' }} />
          <span style={{ font: '700 20px var(--web-display)', letterSpacing: '-0.6px', color: 'var(--ink)' }}>noni</span>
        </div>
        {company ? (
        <div style={{ margin: '18px 0 6px', padding: '10px 11px', borderRadius: 12, background: 'var(--fill-quiet)', display: 'flex', alignItems: 'center', gap: 9 }}>
          <span style={{ width: 7, height: 7, borderRadius: 999, background: 'var(--blue-500)', flex: '0 0 auto' }} />
          <span style={{ font: '700 13px var(--web-ui)', color: 'var(--ink)', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{company}</span>
        </div>) : null}
        <nav style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20, paddingTop: 14 }}>
          {groups.map((g) => (
            <div key={g.label} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <KLabel style={{ padding: '0 11px 6px' }}>{g.label}</KLabel>
              {g.items.map((it) => (
                <KSideItem key={it.label} icon={it.icon} label={it.label} badge={it.badge} active={active === it.label} onClick={() => onSelect(it.label)} />
              ))}
            </div>
          ))}
        </nav>
        <div style={{ borderTop: '1px solid var(--line)', marginTop: 12, paddingTop: 12, display: 'flex', alignItems: 'center', gap: 10, padding: '12px 9px 0' }}>
          <KAvatar name={user.name} size={32} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ font: '700 13px var(--web-ui)', color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
            <div style={{ font: '600 11.5px var(--web-ui)', color: 'var(--slate-400)' }}>{user.role}</div>
          </div>
          <button type="button" title="Sign out" style={{ width: 32, height: 32, flex: '0 0 auto', borderRadius: 999, border: 'none', cursor: 'pointer', background: 'transparent', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="log-out" size={15} color="var(--slate-400)" />
          </button>
        </div>
      </aside>
      <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {search ? <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 44px 0', flex: '0 0 auto' }}>{search}</div> : null}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <div key={active} style={{ maxWidth: 1100, margin: '0 auto', padding: '30px 44px 72px', boxSizing: 'border-box', animation: 'om-rise 260ms var(--ease-out) both' }}>{children}</div>
        </div>
      </main>
    </div>
  );
}

function KField({ label, value, onChange, placeholder, optional, autoFocus }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      <span style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <KLabel>{label}</KLabel>
        {optional ? <span style={{ font: '600 11.5px var(--web-ui)', color: 'var(--slate-400)' }}>Optional</span> : null}
      </span>
      <input value={value} onChange={onChange} placeholder={placeholder} autoFocus={autoFocus}
        style={{ width: '100%', boxSizing: 'border-box', border: '1px solid var(--border)', outline: 'none', background: 'var(--white)', borderRadius: 12, padding: '12px 14px', font: '600 14.5px var(--web-ui)', color: 'var(--ink)' }} />
    </label>
  );
}

function KModal({ title, onClose, children }) {
  const { Icon } = KNS();
  const closeBtn = (
    <button type="button" onClick={onClose} aria-label="Close" style={{ width: 32, height: 32, flex: '0 0 auto', borderRadius: 999, border: 'none', cursor: 'pointer', background: 'var(--fill-quiet)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <Icon name="x" size={15} color="var(--slate-500)" />
    </button>
  );
  return ReactDOM.createPortal((
    <div onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(11,15,20,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'om-fade 180ms var(--ease-out) both' }}>
      <div style={{ position: 'relative', width: 460, maxWidth: 'calc(100vw - 48px)', maxHeight: 'calc(100vh - 56px)', overflowY: 'auto', background: 'var(--white)', borderRadius: 20, boxShadow: 'var(--shadow-raised)', padding: 26, boxSizing: 'border-box', animation: 'om-pop 240ms var(--ease-out) both' }}>
        {title ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
          <span style={{ flex: 1, font: '700 18px var(--web-display)', letterSpacing: '-0.4px', color: 'var(--ink)' }}>{title}</span>
          {closeBtn}
        </div>) : (
        <div style={{ position: 'absolute', top: 18, right: 18, zIndex: 2 }}>{closeBtn}</div>)}
        {children}
      </div>
    </div>
  ), document.body);
}

Object.assign(window, { KCard, KLabel, KPill, KChip, KAvatar, KPageHead, KSideItem, KShell, KSearch, KField, KModal });
