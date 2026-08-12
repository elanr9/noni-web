/* usenoni.app /admin — setup-phase tab pages: locked tabs, Company Brain,
   Team invites (managers + creators), Billing (subscription + creator budget). */
const TNS = () => window.NoniDesignSystem_710e43;
const tMoney = (n) => '$' + n.toLocaleString('en-US');

function LockedPage({ label, icon, unlocked, goHome }) {
  const { Icon } = TNS();
  return (
    <div>
      <KPageHead title={label} />
      <KCard style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '72px 24px', textAlign: 'center' }}>
        <span style={{ width: 54, height: 54, borderRadius: 999, background: 'var(--blue-100)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={icon} size={22} color="var(--blue-700)" />
        </span>
        {unlocked ? (<React.Fragment>
          <div style={{ marginTop: 16, font: '700 16px var(--web-display)', letterSpacing: '-0.3px', color: 'var(--ink)' }}>Nothing here yet</div>
          <p style={{ margin: '6px 0 0', font: '600 14px/1.55 var(--web-ui)', color: 'var(--slate-400)', maxWidth: 360 }}>{label} fills in on its own once your creators start posting.</p>
        </React.Fragment>) : (<React.Fragment>
          <div style={{ marginTop: 16, font: '700 16px var(--web-display)', letterSpacing: '-0.3px', color: 'var(--ink)' }}>Finish setup to view {label}</div>
          <p style={{ margin: '6px 0 0', font: '600 14px/1.55 var(--web-ui)', color: 'var(--slate-400)', maxWidth: 360 }}>Complete your three setup steps first. This tab fills in on its own once creators post.</p>
          <KPill size="sm" variant="tint" onClick={goHome} style={{ marginTop: 18 }}>Go to Home</KPill>
        </React.Fragment>)}
      </KCard>
    </div>
  );
}

/* ---------- Posts ---------- */
function PostsPage() {
  const { Icon } = TNS();
  const [view, setView] = React.useState('Grid');
  const [day, setDay] = React.useState(null);
  const [sel, setSel] = React.useState(null);
  const [hoverId, setHoverId] = React.useState(null);
  if (sel && view === 'Grid') return (
    <div>
      <KPageHead title="Posts" />
      <KCard pad={22}><PostDetail post={sel} onBack={() => setSel(null)} /></KCard>
    </div>
  );
  return (
    <div>
      <KPageHead title="Posts" sub="Every post your creators publish, with views and earnings on each."
        right={<div style={{ display: 'flex', gap: 4, background: 'var(--fill-quiet)', borderRadius: 999, padding: 3 }}>
          {[['Grid', 'layout-grid'], ['Calendar', 'calendar-days']].map(([v, ic]) => (
            <button key={v} type="button" onClick={() => { setView(v); setSel(null); setDay(null); }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 13px', borderRadius: 999, border: 'none', cursor: 'pointer', background: view === v ? 'var(--white)' : 'transparent', boxShadow: view === v ? 'var(--shadow-card)' : 'none', font: '700 12.5px var(--web-ui)', color: view === v ? 'var(--ink)' : 'var(--slate-400)', whiteSpace: 'nowrap', transition: 'background var(--dur-fast) var(--ease-out)' }}>
              <Icon name={ic} size={13} /> {v}
            </button>
          ))}
        </div>} />
      {view === 'Calendar' ? (
        <React.Fragment>
        <KCard pad={22}>
          <KLabel style={{ display: 'block', marginBottom: 14 }}>August · dot means posts went out</KLabel>
          <MonthCalendar onPick={(d) => { setDay(d); setSel(null); }} />
        </KCard>
        {day ? (
          <KCard key={'d' + day + (sel ? sel.id : '')} pad={22} style={{ marginTop: 14, animation: 'om-rise 240ms var(--ease-out) both' }}>
            {sel ? <PostDetail post={sel} onBack={() => setSel(null)} /> : <DayDetail day={day} onOpenPost={setSel} onClose={() => setDay(null)} />}
          </KCard>) : null}
        </React.Fragment>
      ) : (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {ADM_POSTS.map((p) => (
          <div key={p.id} role="button" onClick={() => setSel(p)} onMouseEnter={() => setHoverId(p.id)} onMouseLeave={() => setHoverId(null)}
            style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 16, borderRadius: 16, background: 'var(--white)', border: hoverId === p.id ? '1px solid var(--blue-300, var(--blue-500))' : '1px solid var(--border)', boxShadow: hoverId === p.id ? 'var(--shadow-raised)' : 'var(--shadow-card)', cursor: 'pointer', transform: hoverId === p.id ? 'translateY(-2px)' : 'none', transition: 'box-shadow var(--dur-fast) var(--ease-out), transform var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out)' }}>
            <span style={{ width: 46, height: 62, flex: '0 0 auto', borderRadius: 10, background: 'var(--blue-100)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={p.format === 'Video' ? 'play' : 'images'} size={16} color="var(--blue-700)" />
            </span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: 'block', font: '700 14px var(--web-ui)', color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title}</span>
              <span style={{ display: 'block', marginTop: 3, font: '600 12.5px var(--web-ui)', color: 'var(--slate-400)', whiteSpace: 'nowrap' }}>{p.creator} · {p.date} · TikTok {p.tik} · IG {p.ig}</span>
            </span>
            <span style={{ textAlign: 'right', flex: '0 0 auto' }}>
              <span style={{ display: 'block', font: '700 15px var(--web-ui)', color: 'var(--ink)' }}>{aFmtK(p.viewsN)}</span>
              <span style={{ display: 'block', font: '600 12px var(--web-ui)', color: 'var(--green, #1F9D5B)' }}>{aMoney(p.earned)}</span>
            </span>
            {hoverId === p.id ? <Icon name="chevron-right" size={15} color="var(--blue-700)" /> : null}
          </div>
        ))}
      </div>)}
    </div>
  );
}

/* ---------- Company Brain ---------- */
const BRAIN_META = {
  product: { name: 'Product', hint: 'What you sell, what it costs, why it wins. Every hook and script starts here.', editorHint: "What you sell, what it costs, anything you'd like us to know about your company!",
    draft: "FieldVision turns one sideline phone into a full film crew. Put a phone on a tripod, press record, and it auto-tracks the ball, tags every play, and cuts clips coaches can send the squad the same night. Sold as a team subscription at $79/mo. The wedge: fire your film crew, one phone does the whole job. Buyers care most about time saved on film review (hours to minutes) and players getting their own highlight reels without anyone editing." },
  audience: { name: 'Audience', hint: 'Who buys, where they hang out, what they already believe.',
    draft: "High-school and small-college football programs in the US. Coaches short on staff who still owe the team film by Monday; players who want their own highlight reels for recruiting; parents who film every game from the bleachers anyway. They live on TikTok and Instagram for drills and scheme breakdowns, and they already believe film wins games. They just hate making it." },
};

function BrainDocEditor({ kind, value, onSave, onClose }) {
  const { Icon } = TNS();
  const meta = BRAIN_META[kind];
  const [text, setText] = React.useState(value || '');
  const [cleaning, setCleaning] = React.useState(false);
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const cleanUp = () => {
    if (!text.trim() || cleaning) return;
    setCleaning(true);
    setTimeout(() => {
      let t = text.trim().replace(/\s+/g, ' ').replace(/\s+([,.!?])/g, '$1');
      t = t.charAt(0).toUpperCase() + t.slice(1);
      if (!/[.!?]$/.test(t)) t += '.';
      setText(t); setCleaning(false);
    }, 900);
  };
  return (
    <KModal title={meta.name} onClose={onClose}>
      <p style={{ margin: '0 0 12px', font: '600 13px/1.5 var(--web-ui)', color: 'var(--slate-400)' }}>{meta.editorHint || meta.hint}</p>
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={11} autoFocus placeholder="Write it the way you'd explain it to a new hire."
        style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical', border: '1px solid var(--border)', outline: 'none', background: 'var(--white)', borderRadius: 12, padding: '12px 14px', font: '600 14px/1.6 var(--web-ui)', color: 'var(--ink)', opacity: cleaning ? 0.5 : 1, transition: 'opacity var(--dur-fast) var(--ease-out)' }}></textarea>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14 }}>
        <span style={{ flex: 1 }}></span>
        <KPill size="sm" variant="tint" icon="sparkles" onClick={cleanUp} style={{ opacity: text.trim() && !cleaning ? 1 : 0.35 }}>{cleaning ? 'Cleaning up…' : 'Clean up with AI'}</KPill>
        <KPill size="sm" onClick={() => { onSave(text.trim()); onClose(); }} style={{ opacity: text.trim() ? 1 : 0.35 }}>Done</KPill>
      </div>
    </KModal>
  );
}

function BrainDocCard({ meta, val, onOpen }) {
  const { Icon } = TNS();
  const [hover, setHover] = React.useState(false);
  return (
    <div role="button" onClick={onOpen} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ background: 'var(--white)', border: hover ? '1px solid var(--blue-300, var(--blue-500))' : '1px solid var(--border)', borderRadius: 16, boxShadow: hover ? 'var(--shadow-raised)' : 'var(--shadow-card)', padding: 20, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 10, boxSizing: 'border-box', transform: hover ? 'translateY(-2px)' : 'none', transition: 'box-shadow var(--dur-fast) var(--ease-out), transform var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <KLabel style={{ flex: 1 }}>{meta.name}</KLabel>
        {val ? <KChip tone="green" style={{ padding: '3px 9px', fontSize: 11.5 }}><Icon name="check" size={11} /> Filled in</KChip> : <KChip tone="amber" style={{ padding: '3px 9px', fontSize: 11.5 }}>Empty</KChip>}
      </div>
      {val ? (<React.Fragment>
        <p style={{ margin: 0, flex: 1, font: '600 13.5px/1.6 var(--web-ui)', color: 'var(--ink)', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{val}</p>
        <span style={{ font: '600 12.5px var(--web-ui)', color: 'var(--slate-400)' }}>{val.trim().split(/\s+/).length} words · updated just now</span>
      </React.Fragment>) : (<React.Fragment>
        <p style={{ margin: 0, flex: 1, font: '600 13.5px/1.6 var(--web-ui)', color: 'var(--slate-400)' }}>{meta.hint}</p>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, font: '700 13px var(--web-ui)', color: 'var(--blue-700)' }}><Icon name="pencil" size={13} /> Click to fill it in</span>
      </React.Fragment>)}
    </div>
  );
}

function BrainPage({ brain, setBrain, accounts, setAccounts }) {
  const { Icon } = TNS();
  const [editing, setEditing] = React.useState(null);
  const [adding, setAdding] = React.useState(false);
  const [handle, setHandle] = React.useState('');
  const [platform, setPlatform] = React.useState('music-2');
  const addAccount = () => {
    if (!handle.trim()) return;
    setAccounts((l) => [...l, { handle: handle.trim().startsWith('@') ? handle.trim() : '@' + handle.trim(), platform, kind: 'Reference' }]);
    setHandle(''); setAdding(false);
  };
  return (
    <div>
      <KPageHead title="Company Brain" sub="Noni writes every hook, script and caption from this. The better it is, the better every brief." />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {['product', 'audience'].map((k) => {
          const meta = BRAIN_META[k]; const val = brain[k];
          return (
            <BrainDocCard key={k} meta={meta} val={val} onOpen={() => setEditing(k)} />
          );
        })}
      </div>
      <KCard pad={0} style={{ marginTop: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 20px' }}>
          <span style={{ flex: 1 }}>
            <KLabel>Inspiration accounts</KLabel>
            <span style={{ display: 'block', marginTop: 3, font: '600 13px var(--web-ui)', color: 'var(--slate-400)' }}>We watch these to see what already works in your niche.</span>
          </span>
          <KPill size="sm" variant="tint" icon="plus" onClick={() => setAdding(true)}>Add account</KPill>
        </div>
        {adding ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px', borderTop: '1px solid var(--line)', animation: 'om-rise 200ms var(--ease-out) both' }}>
            <div style={{ display: 'flex', gap: 4, background: 'var(--fill-quiet)', borderRadius: 999, padding: 3 }}>
              {[['music-2', 'TikTok'], ['at-sign', 'Instagram']].map(([ic, label]) => (
                <button key={ic} type="button" onClick={() => setPlatform(ic)} title={label}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 999, border: 'none', cursor: 'pointer', background: platform === ic ? 'var(--white)' : 'transparent', boxShadow: platform === ic ? 'var(--shadow-card)' : 'none', font: '700 12.5px var(--web-ui)', color: platform === ic ? 'var(--ink)' : 'var(--slate-400)', whiteSpace: 'nowrap' }}>
                  <Icon name={ic} size={13} /> {label}
                </button>
              ))}
            </div>
            <input value={handle} onChange={(e) => setHandle(e.target.value)} placeholder="@handle" autoFocus
              onKeyDown={(e) => { if (e.key === 'Enter') addAccount(); }}
              style={{ flex: 1, border: '1px solid var(--border)', outline: 'none', borderRadius: 999, padding: '9px 14px', font: '600 13.5px var(--web-ui)', color: 'var(--ink)' }} />
            <KPill size="sm" onClick={addAccount}>Add</KPill>
          </div>) : null}
        {accounts.length === 0 && !adding ? (
          <div style={{ padding: '14px 20px', borderTop: '1px solid var(--line)', font: '600 13.5px var(--web-ui)', color: 'var(--slate-400)' }}>No accounts yet. Add the TikTok and Instagram accounts your customers already follow.</div>) : null}
        {accounts.map((a, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '11px 20px', borderTop: '1px solid var(--line)' }}>
            <Icon name={a.platform} size={15} color="var(--slate-500)" />
            <span style={{ flex: 1, font: '700 13.5px var(--web-ui)', color: 'var(--ink)' }}>{a.handle}</span>
            <KChip tone="slate" style={{ padding: '3px 9px', fontSize: 11.5 }}>{a.kind}</KChip>
            <button type="button" aria-label="Remove" onClick={() => setAccounts((l) => l.filter((_, j) => j !== i))}
              style={{ width: 28, height: 28, borderRadius: 999, border: 'none', cursor: 'pointer', background: 'transparent', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="x" size={13} color="var(--slate-400)" />
            </button>
          </div>
        ))}
      </KCard>
      {editing ? <BrainDocEditor kind={editing} value={brain[editing]} onSave={(t) => setBrain((b) => ({ ...b, [editing]: t }))} onClose={() => setEditing(null)} /> : null}
    </div>
  );
}

/* ---------- Team ---------- */
function InviteModal({ kind, company, onSend, onClose }) {
  const { Icon } = TNS();
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [sent, setSent] = React.useState(null);
  const send = () => { if (!name.trim() || !email.trim()) return; onSend({ name: name.trim(), email: email.trim() }); setSent(name.trim().split(' ')[0]); };
  const role = kind === 'manager' ? 'campaign manager' : 'creator';
  return (
    <KModal title={sent ? undefined : `Invite a ${role}`} onClose={onClose}>
      {sent ? (
        <div style={{ textAlign: 'center', padding: '18px 4px 6px' }}>
          <span style={{ width: 52, height: 52, borderRadius: 999, background: 'var(--green-soft, #E4F6EC)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="send" size={21} color="var(--green, #1F9D5B)" />
          </span>
          <div style={{ marginTop: 14, font: '700 18px var(--web-display)', letterSpacing: '-0.4px', color: 'var(--ink)' }}>Invite sent</div>
          <p style={{ margin: '8px 0 0', font: '600 13.5px/1.6 var(--web-ui)', color: 'var(--slate-400)' }}>{sent} gets an email. When they sign in with it, Noni already knows they're a {role} for {company}. No code, no setup on their end.</p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 18 }}>
            <KPill size="sm" variant="tint" onClick={() => { setSent(null); setName(''); setEmail(''); }}>Invite another</KPill>
            <KPill size="sm" onClick={onClose}>Done</KPill>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <KField label="Name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          <KField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" />
          <KPill icon="send" onClick={send} style={{ opacity: name.trim() && email.trim() ? 1 : 0.35 }}>Send invite</KPill>
        </div>
      )}
    </KModal>
  );
}

function TeamSection({ label, hint, people, onInvite, inviteLabel, onOpen }) {
  const { Icon } = TNS();
  return (
    <KCard pad={0}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 20px' }}>
        <span style={{ flex: 1 }}>
          <KLabel>{label}{people.length ? ` · ${people.length}` : ''}</KLabel>
          <span style={{ display: 'block', marginTop: 3, font: '600 13px var(--web-ui)', color: 'var(--slate-400)' }}>{hint}</span>
        </span>
        <KPill size="sm" variant="tint" icon="plus" onClick={onInvite}>{inviteLabel}</KPill>
      </div>
      {people.length === 0 ? (
        <div style={{ padding: '14px 20px', borderTop: '1px solid var(--line)', font: '600 13.5px var(--web-ui)', color: 'var(--slate-400)' }}>Nobody yet. Invites land by email and new sign-ins arrive already in the right role.</div>
      ) : people.map((p, i) => (
        <div key={i} role={onOpen ? 'button' : undefined} onClick={onOpen ? () => onOpen(p) : undefined}
          onMouseEnter={(e) => { if (onOpen) e.currentTarget.style.background = 'var(--fill-quiet)'; }} onMouseLeave={(e) => { if (onOpen) e.currentTarget.style.background = 'transparent'; }}
          style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderTop: '1px solid var(--line)', cursor: onOpen ? 'pointer' : 'default', transition: 'background var(--dur-fast) var(--ease-out)' }}>
          <KAvatar name={p.name} size={34} />
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: 'block', font: '700 14px var(--web-ui)', color: 'var(--ink)' }}>{p.name}</span>
            <span style={{ display: 'block', font: '600 12.5px var(--web-ui)', color: 'var(--slate-400)' }}>{p.email}</span>
          </span>
          {p.status === 'Active' ? <KChip tone="green">Active</KChip> : <KChip tone="amber"><Icon name="clock" size={12} /> Invite sent</KChip>}
          {onOpen ? <Icon name="chevron-right" size={15} color="var(--slate-400)" /> : null}
        </div>
      ))}
    </KCard>
  );
}

function TeamPage({ company, managers, creators, onAddManager, onAddCreator }) {
  const [inviting, setInviting] = React.useState(null);
  const [profile, setProfile] = React.useState(null);
  if (profile) return <ProfilePage person={profile} onBack={() => setProfile(null)} />;
  return (
    <div>
      <KPageHead title="Team" sub={`Everyone on ${company}. Invites land by email; Noni knows their role the moment they sign in.`} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <TeamSection label="Campaign managers" hint="They run weekly briefs and keep creators on pace." people={managers} inviteLabel="Invite manager" onInvite={() => setInviting('manager')} onOpen={(p) => setProfile({ ...p, role: 'Campaign manager' })} />
        <TeamSection label="Creators" hint="They record. Their first tasks are waiting when they sign in." people={creators} inviteLabel="Invite creator" onInvite={() => setInviting('creator')} onOpen={(p) => setProfile({ ...p, role: 'Creator' })} />
      </div>
      {inviting ? <InviteModal kind={inviting} company={company} onSend={inviting === 'manager' ? onAddManager : onAddCreator} onClose={() => setInviting(null)} /> : null}
    </div>
  );
}

/* ---------- Billing ---------- */
function PlanCard({ name, price, sub, chip, current, cta, ctaVariant, onCta }) {
  return (
    <div style={{ flex: 1, minWidth: 0, borderRadius: 16, padding: 20, boxSizing: 'border-box', background: current ? 'var(--blue-100)' : 'var(--white)', border: current ? '1px solid transparent' : '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ flex: 1, font: '700 15.5px var(--web-ui)', color: current ? 'var(--blue-700)' : 'var(--ink)' }}>{name}</span>
        {current ? <KChip tone="blue" style={{ background: 'var(--white)' }}>Current</KChip> : chip ? <KChip tone="green">{chip}</KChip> : null}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 7 }}>
        <span style={{ font: '700 27px var(--web-display)', letterSpacing: '-0.7px', color: 'var(--ink)' }}>{price}</span>
        <span style={{ font: '600 13.5px var(--web-ui)', color: 'var(--slate-400)' }}>per month</span>
      </div>
      <span style={{ font: '600 13px/1.5 var(--web-ui)', color: 'var(--slate-500)' }}>{sub}</span>
      <KPill size="sm" variant={ctaVariant} onClick={onCta} style={{ width: '100%', marginTop: 10 }}>{cta}</KPill>
    </div>
  );
}

function PlanModal({ subscription, onPurchase, onCancel, onClose }) {
  const { Icon } = TNS();
  const [redirecting, setRedirecting] = React.useState(null);
  const pick = (plan) => {
    if (redirecting) return;
    setRedirecting(plan);
    setTimeout(() => { onPurchase(plan); onClose(); }, 1400);
  };
  const active = subscription.active;
  return (
    <KModal title={active ? 'Manage your plan' : 'Purchase your subscription'} onClose={onClose}>
      {redirecting ? (
        <div style={{ textAlign: 'center', padding: '30px 8px 22px' }}>
          <span style={{ width: 52, height: 52, borderRadius: 999, background: 'var(--blue-100)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="dollar-sign" size={21} color="var(--blue-700)" />
          </span>
          <div style={{ marginTop: 14, font: '700 17px var(--web-display)', letterSpacing: '-0.4px', color: 'var(--ink)' }}>Taking you to Stripe checkout</div>
          <p style={{ margin: '7px 0 0', font: '600 13.5px/1.55 var(--web-ui)', color: 'var(--slate-400)' }}>{redirecting === 'annual' ? '$1,200 billed once a year.' : '$200 billed monthly.'} You'll come right back here.</p>
        </div>
      ) : (
        <React.Fragment>
          <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
            <PlanCard name="Monthly" price="$200" sub="Full access with monthly billing. Cancel any time."
              current={active && subscription.plan === 'monthly'}
              cta={active ? (subscription.plan === 'monthly' ? 'Cancel current plan' : 'Switch to monthly') : 'Choose monthly'}
              ctaVariant={active && subscription.plan === 'monthly' ? 'quiet' : active ? 'primary' : 'quiet'}
              onCta={() => (active ? (subscription.plan === 'monthly' ? (onCancel(), onClose()) : pick('monthly')) : pick('monthly'))} />
            <PlanCard name="Annual" price="$100" sub="Billed $1,200 per year." chip="Save 50%"
              current={active && subscription.plan === 'annual'}
              cta={active ? (subscription.plan === 'annual' ? 'Cancel current plan' : 'Upgrade to annual') : 'Choose annual'}
              ctaVariant={active && subscription.plan === 'annual' ? 'quiet' : 'primary'}
              onCta={() => (active ? (subscription.plan === 'annual' ? (onCancel(), onClose()) : pick('annual')) : pick('annual'))} />
          </div>
          <p style={{ margin: '14px 0 0', textAlign: 'center', font: '600 12px var(--web-ui)', color: 'var(--slate-400)' }}>Checkout and card details are handled by Stripe. The same card funds your budget top-ups.</p>
        </React.Fragment>
      )}
    </KModal>
  );
}

function AdjustLimitModal({ current, onSet, onClose }) {
  const [custom, setCustom] = React.useState('');
  const [amt, setAmt] = React.useState(current || 1000);
  const value = custom ? parseInt(custom.replace(/[^0-9]/g, ''), 10) || 0 : amt;
  return (
    <KModal title="Monthly spend limit" onClose={onClose}>
      <p style={{ margin: '0 0 14px', font: '600 13px/1.5 var(--web-ui)', color: 'var(--slate-400)' }}>The most Noni spends on creator bounties each month. Spend resets on the 1st.</p>
      <div style={{ display: 'flex', gap: 8 }}>
        {[500, 1000, 2500].map((v) => (
          <button key={v} type="button" onClick={() => { setAmt(v); setCustom(''); }}
            style={{ flex: 1, padding: '12px 0', borderRadius: 12, border: '1px solid', borderColor: !custom && amt === v ? 'transparent' : 'var(--border)', cursor: 'pointer', background: !custom && amt === v ? 'var(--blue-100)' : 'var(--white)', font: '700 14.5px var(--web-ui)', color: !custom && amt === v ? 'var(--blue-700)' : 'var(--ink)' }}>{tMoney(v)}</button>
        ))}
      </div>
      <div style={{ marginTop: 12 }}>
        <KField label="Or a custom limit" value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="$750" />
      </div>
      <KPill onClick={() => { if (value > 0) { onSet(value); onClose(); } }} style={{ width: '100%', marginTop: 16, opacity: value > 0 ? 1 : 0.35 }}>Set limit to {tMoney(value)}/mo</KPill>
    </KModal>
  );
}

function TopupModal({ onTopup, onClose }) {
  const [amt, setAmt] = React.useState(1000);
  const [custom, setCustom] = React.useState('');
  const value = custom ? parseInt(custom.replace(/[^0-9]/g, ''), 10) || 0 : amt;
  return (
    <KModal title="Top up your budget" onClose={onClose}>
      <p style={{ margin: '0 0 14px', font: '600 13px/1.5 var(--web-ui)', color: 'var(--slate-400)' }}>One-off credit on top of your monthly budget. Goes straight to creator bounties, charged to Visa ···· 4242.</p>
      <div style={{ display: 'flex', gap: 8 }}>
        {[500, 1000, 2500].map((v) => (
          <button key={v} type="button" onClick={() => { setAmt(v); setCustom(''); }}
            style={{ flex: 1, padding: '12px 0', borderRadius: 12, border: '1px solid', borderColor: !custom && amt === v ? 'transparent' : 'var(--border)', cursor: 'pointer', background: !custom && amt === v ? 'var(--blue-100)' : 'var(--white)', font: '700 14.5px var(--web-ui)', color: !custom && amt === v ? 'var(--blue-700)' : 'var(--ink)' }}>{tMoney(v)}</button>
        ))}
      </div>
      <div style={{ marginTop: 12 }}>
        <KField label="Or a custom amount" value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="$750" />
      </div>
      <KPill onClick={() => { if (value > 0) { onTopup(value); onClose(); } }} style={{ width: '100%', marginTop: 16, opacity: value > 0 ? 1 : 0.35 }}>Add {tMoney(value)}</KPill>
    </KModal>
  );
}

function StripeCard({ on, onConnect }) {
  const { Icon } = TNS();
  const [busy, setBusy] = React.useState(false);
  const connect = () => { if (busy) return; setBusy(true); setTimeout(() => { setBusy(false); onConnect(); }, 1400); };
  return (
    <KCard pad={22}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <KLabel style={{ flex: 1 }}>Stripe</KLabel>
        {on ? <KChip tone="green"><Icon name="check" size={12} /> Connected</KChip> : <KChip tone="amber">Not connected</KChip>}
      </div>
      {on ? (
        <p style={{ margin: '10px 0 0', font: '600 13.5px/1.55 var(--web-ui)', color: 'var(--slate-500)' }}>FieldVision AI · acct ····1FVA · read-only. Sales and sign-ups now flow into Analytics.</p>
      ) : (<React.Fragment>
        <p style={{ margin: '10px 0 0', font: '600 13.5px/1.55 var(--web-ui)', color: 'var(--slate-500)' }}>Read-only connection so Analytics shows real sales and sign-ups next to every post. We never move money from Stripe.</p>
        <div style={{ marginTop: 14 }}>
          <KPill size="sm" icon={busy ? 'clock' : 'link'} onClick={connect}>{busy ? 'Opening Stripe…' : 'Connect with Stripe'}</KPill>
        </div>
      </React.Fragment>)}
    </KCard>
  );
}

function BillingPage({ subscription, budget, onTopup, onToggleAuto, onPurchase, onCancel, onSetLimit, stripeOn, onStripe }) {
  const { Icon } = TNS();
  const [topup, setTopup] = React.useState(false);
  const [buying, setBuying] = React.useState(false);
  const [adjusting, setAdjusting] = React.useState(false);
  const annual = subscription.plan === 'annual';
  const pctUsed = budget.limit > 0 ? Math.min(1, budget.spent / budget.limit) : 0;
  return (
    <div>
      <KPageHead title="Billing" sub="Two things live here: your Noni subscription, and the budget that pays creator bounties." />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {subscription.active && budget.limit === 0 ? (
          <KCard pad={16} style={{ display: 'flex', alignItems: 'center', gap: 13, background: 'var(--amber-soft, #FCF1DD)', border: '1px solid transparent' }}>
            <Icon name="circle-alert" size={19} color="var(--amber, #B97D14)" />
            <span style={{ flex: 1, font: '600 13.5px var(--web-ui)', color: 'var(--ink)' }}>No monthly budget yet. Set a spend limit so Noni can pay creator bounties.</span>
            <KPill size="sm" onClick={() => setAdjusting(true)}>Set monthly budget</KPill>
          </KCard>) : null}
        <KCard pad={22}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <KLabel style={{ flex: 1 }}>Subscription</KLabel>
            {subscription.active ? <KChip tone="green">Active</KChip> : <KChip tone="amber">Not active</KChip>}
          </div>
          {subscription.active ? (<React.Fragment>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 12 }}>
            <span style={{ font: '700 30px var(--web-display)', letterSpacing: '-0.8px', color: 'var(--ink)' }}>{annual ? '$100' : '$200'}<span style={{ font: '700 15px var(--web-ui)', color: 'var(--slate-400)' }}>/mo</span></span>
            <span style={{ font: '600 13.5px var(--web-ui)', color: 'var(--slate-400)' }}>{annual ? 'Annual · billed $1,200/yr · renews Aug 12, 2027' : 'Monthly · renews Sep 12, 2026'} · Visa ···· 4242</span>
          </div>
          <div style={{ marginTop: 14 }}>
            <KPill size="sm" variant="quiet" onClick={() => setBuying(true)}>Manage plan</KPill>
          </div>
          </React.Fragment>) : (<React.Fragment>
          <p style={{ margin: '10px 0 0', font: '600 13.5px/1.55 var(--web-ui)', color: 'var(--slate-500)' }}>$100/mo billed annually, or $200/mo billed monthly. One subscription runs your whole roster. Checkout is handled by Stripe.</p>
          <div style={{ marginTop: 14 }}>
            <KPill size="sm" onClick={() => setBuying(true)}>Choose a plan</KPill>
          </div>
          </React.Fragment>)}
        </KCard>
        <KCard pad={0}>
          <div style={{ padding: '18px 22px 16px' }}>
            <KLabel style={{ display: 'block', marginBottom: 12 }}>Creator budget</KLabel>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ minWidth: 0 }}>
                <span style={{ display: 'block', font: '700 24px var(--web-display)', letterSpacing: '-0.6px', color: 'var(--ink)' }}>{tMoney(budget.spent)} spent</span>
                <span style={{ display: 'block', marginTop: 2, font: '600 12.5px var(--web-ui)', color: 'var(--slate-400)' }}>Resets Sep 1</span>
              </span>
              <span style={{ flex: 1, height: 8, borderRadius: 999, background: 'var(--fill-quiet)', overflow: 'hidden' }}>
                <span style={{ display: 'block', width: Math.round(pctUsed * 100) + '%', height: '100%', borderRadius: 999, background: pctUsed > 0.85 ? 'var(--danger, #D64545)' : pctUsed > 0.6 ? 'var(--amber, #B97D14)' : 'var(--blue-500)', transition: 'width 400ms var(--ease-out)' }}></span>
              </span>
              <span style={{ font: '600 13px var(--web-ui)', color: 'var(--slate-400)', whiteSpace: 'nowrap' }}>{Math.round(pctUsed * 100)}% used</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 22px', borderTop: '1px solid var(--line)' }}>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: 'block', font: '700 16px var(--web-ui)', color: 'var(--ink)' }}>{budget.limit > 0 ? tMoney(budget.limit) : 'Not set'}</span>
              <span style={{ display: 'block', marginTop: 1, font: '600 12.5px var(--web-ui)', color: 'var(--slate-400)' }}>Monthly spend limit</span>
            </span>
            <KPill size="sm" variant="quiet" onClick={() => setAdjusting(true)}>{budget.limit > 0 ? 'Adjust limit' : 'Set limit'}</KPill>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 22px', borderTop: '1px solid var(--line)' }}>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: 'block', font: '700 16px var(--web-ui)', color: 'var(--ink)' }}>{tMoney(budget.balance)}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 1, font: '600 12.5px var(--web-ui)', color: 'var(--slate-400)' }}>Extra credit balance · Auto top-up {budget.auto ? 'on' : 'off'}
                <button type="button" onClick={onToggleAuto} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, font: '700 12.5px var(--web-ui)', color: 'var(--blue-700)' }}>{budget.auto ? 'Turn off' : 'Turn on'}</button>
              </span>
            </span>
            <KPill size="sm" icon="plus" onClick={() => setTopup(true)}>Top up</KPill>
          </div>
        </KCard>
        <StripeCard on={stripeOn} onConnect={onStripe} />
        {budget.topups.length ? (
          <KCard pad={0}>
            <KLabel style={{ display: 'block', padding: '16px 20px 6px' }}>Top-ups</KLabel>
            {budget.topups.map((t, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderTop: '1px solid var(--line)' }}>
                <span style={{ width: 32, height: 32, borderRadius: 999, background: 'var(--green-soft, #E4F6EC)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="plus" size={14} color="var(--green, #1F9D5B)" />
                </span>
                <span style={{ flex: 1, font: '700 14px var(--web-ui)', color: 'var(--ink)' }}>{tMoney(t.amt)} top-up</span>
                <span style={{ font: '600 13px var(--web-ui)', color: 'var(--slate-400)' }}>Visa ···· 4242 · {t.date}</span>
              </div>
            ))}
          </KCard>) : null}
      </div>
      {topup ? <TopupModal onTopup={onTopup} onClose={() => setTopup(false)} /> : null}
      {adjusting ? <AdjustLimitModal current={budget.limit} onSet={onSetLimit} onClose={() => setAdjusting(false)} /> : null}
      {buying ? <PlanModal subscription={subscription} onPurchase={onPurchase} onCancel={onCancel} onClose={() => setBuying(false)} /> : null}
    </div>
  );
}

Object.assign(window, { LockedPage, BrainPage, TeamPage, BillingPage, PostsPage });
