/* usenoni.app /admin — root: onboarding flow → app shell with the company-page
   tabs as the left nav, spotlight tour, gamified setup to-do, achievements. */

const ADMIN_NAV = [
  { label: 'Workspace', items: [
    { label: 'Onboarding', icon: 'house' },
    { label: 'Analytics', icon: 'chart-column' },
    { label: 'Team', icon: 'users' },
    { label: 'Posts', icon: 'images' },
  ]},
  { label: 'Company', items: [
    { label: 'Company Brain', icon: 'sparkles' },
    { label: 'Billing', icon: 'dollar-sign' },
  ]},
];

const TOUR = [
  { target: 'Onboarding', title: 'Onboarding', body: 'Your setup to-do lives here. A few steps and Noni runs itself. This tab retires once everything is done.' },
  { target: 'Analytics', title: 'Analytics', body: 'Views, sign-ups and earnings by post, creator and day.' },
  { target: 'Team', title: 'Team', body: 'Campaign managers and creators. Invite them from here. They join by email, already in the right role.' },
  { target: 'Posts', title: 'Posts', body: 'Every post your creators publish, with views and earnings on each.' },
  { target: 'Company Brain', title: 'Company Brain', body: 'What Noni knows about your product and audience. Every brief is written from this.' },
  { target: 'Billing', title: 'Billing', body: 'Your subscription and the creator budget. Top up any time.' },
  { target: 'Search', title: 'Jump anywhere', body: 'Press ⌘K from any page to search pages, people and posts.' },
];

function TourOverlay({ idx, onNext, onSkip }) {
  const step = TOUR[idx];
  const [rect, setRect] = React.useState(null);
  React.useLayoutEffect(() => {
    const el = document.querySelector(`[data-tour="${step.target}"]`);
    setRect(el ? el.getBoundingClientRect() : null);
  }, [idx]);
  if (!rect) return null;
  const pad = 5;
  const search = step.target === 'Search';
  const pop = search
    ? { top: rect.bottom + 16, left: Math.max(16, rect.left + rect.width / 2 - 160) }
    : { top: Math.max(16, rect.top - 10), left: rect.right + 18 };
  const last = idx === TOUR.length - 1;
  return ReactDOM.createPortal((
    <div style={{ position: 'fixed', inset: 0, zIndex: 90 }}>
      <div style={{ position: 'fixed', top: rect.top - pad, left: rect.left - pad, width: rect.width + pad * 2, height: rect.height + pad * 2, borderRadius: search ? 999 : 13, boxShadow: '0 0 0 9999px rgba(11,15,20,0.5), 0 0 0 2.5px var(--blue-500)', transition: 'all 260ms var(--ease-out)', pointerEvents: 'none' }}></div>
      <div key={idx} style={{ position: 'fixed', ...pop, width: 320, background: 'var(--white)', borderRadius: 16, boxShadow: 'var(--shadow-raised)', padding: 20, boxSizing: 'border-box', animation: 'om-pop 240ms var(--ease-out) both' }}>
        <KLabel>{idx + 1} of {TOUR.length}</KLabel>
        <div style={{ margin: '7px 0 0', font: '700 17px var(--web-display)', letterSpacing: '-0.4px', color: 'var(--ink)' }}>{step.title}</div>
        <p style={{ margin: '6px 0 0', font: '600 13.5px/1.55 var(--web-ui)', color: 'var(--slate-500)' }}>{step.body}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16 }}>
          <span style={{ flex: 1, display: 'flex', gap: 4 }}>
            {TOUR.map((_, i) => <span key={i} style={{ width: 6, height: 6, borderRadius: 999, background: i === idx ? 'var(--blue-500)' : 'var(--line)' }}></span>)}
          </span>
          <KPill size="sm" variant="ghost" onClick={onSkip}>Skip tour</KPill>
          <KPill size="sm" onClick={onNext}>{last ? 'Start step 1' : 'Next'}</KPill>
        </div>
      </div>
    </div>
  ), document.body);
}

function AchievementToast({ toast, onDone }) {
  const { Icon } = window.NoniDesignSystem_710e43;
  React.useEffect(() => { const t = setTimeout(onDone, 3400); return () => clearTimeout(t); }, [toast]);
  return ReactDOM.createPortal((
    <div key={toast.title} style={{ position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)', zIndex: 140, display: 'flex', alignItems: 'center', gap: 13, background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 999, boxShadow: 'var(--shadow-raised)', padding: '12px 22px 12px 13px', animation: 'om-pop 280ms var(--ease-out) both', whiteSpace: 'nowrap' }}>
      <span style={{ width: 38, height: 38, borderRadius: 999, background: toast.final ? 'var(--blue-100)' : 'var(--green-soft, #E4F6EC)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={toast.final ? 'sparkles' : 'circle-check-big'} size={17} color={toast.final ? 'var(--blue-700)' : 'var(--green, #1F9D5B)'} />
      </span>
      <span>
        <KLabel style={{ display: 'block' }}>{toast.final ? 'Setup complete' : 'Step done'}</KLabel>
        <span style={{ display: 'block', marginTop: 2, font: '700 14.5px var(--web-ui)', color: 'var(--ink)' }}>{toast.title}</span>
      </span>
    </div>
  ), document.body);
}

function SetupRow({ n, done, title, sub, action, onGo, last }) {
  const { Icon } = window.NoniDesignSystem_710e43;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 15, padding: '16px 20px', borderBottom: last ? 'none' : '1px solid var(--line)' }}>
      <span style={{ width: 34, height: 34, flex: '0 0 auto', borderRadius: 999, background: done ? 'var(--green-soft, #E4F6EC)' : 'var(--blue-100)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', font: '800 14px var(--web-ui)', color: 'var(--blue-700)', transition: 'background var(--dur-fast) var(--ease-out)' }}>
        {done ? <Icon name="check" size={15} color="var(--green, #1F9D5B)" /> : n}
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', font: '700 15px var(--web-ui)', color: 'var(--ink)', textDecoration: done ? 'line-through' : 'none', textDecorationColor: 'var(--slate-400)' }}>{title}</span>
        <span style={{ display: 'block', marginTop: 2, font: '600 13px/1.45 var(--web-ui)', color: 'var(--slate-400)' }}>{sub}</span>
      </span>
      {done ? <KChip tone="green">Done</KChip> : <KPill size="sm" variant="tint" onClick={onGo}>{action}</KPill>}
    </div>
  );
}

function HomePage({ user, company, steps, doneCount, go }) {
  const all = doneCount === steps.length;
  return (
    <div>
      <KPageHead title={`Hey ${user.name.split(' ')[0]}.`} sub={all ? `Setup's done. Noni takes it from here: briefs, queues, edits and posting.` : `${steps.length - doneCount} step${steps.length - doneCount > 1 ? 's' : ''} and ${company} runs itself.`} />
      <KCard pad={0}>
        <div style={{ padding: '18px 20px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <KLabel style={{ flex: 1 }}>Set up {company}</KLabel>
            <span style={{ font: '700 13px var(--web-ui)', color: all ? 'var(--green, #1F9D5B)' : 'var(--slate-500)' }}>{doneCount} of {steps.length} done</span>
          </div>
          <div style={{ marginTop: 11, height: 7, borderRadius: 999, background: 'var(--fill-quiet)', overflow: 'hidden' }}>
            <span style={{ display: 'block', width: (doneCount / steps.length) * 100 + '%', height: '100%', borderRadius: 999, background: all ? 'var(--green, #1F9D5B)' : 'var(--blue-500)', transition: 'width 400ms var(--ease-out), background 400ms var(--ease-out)' }}></span>
          </div>
        </div>
        {steps.map((s, i) => <SetupRow key={s.title} n={i + 1} last={i === steps.length - 1} {...s} onGo={() => go(s.go)} />)}
      </KCard>
      {all ? (
        <KCard pad={20} style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ width: 42, height: 42, flex: '0 0 auto', borderRadius: 999, background: 'var(--blue-100)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            {(() => { const { Icon } = window.NoniDesignSystem_710e43; return <Icon name="sparkles" size={18} color="var(--blue-700)" />; })()}
          </span>
          <span style={{ flex: 1, font: '600 14px/1.55 var(--web-ui)', color: 'var(--slate-500)' }}>We're studying your brand and drafting the first briefs. Your team's queues fill as they sign in, and Analytics and Posts wake up with the first post.</span>
        </KCard>) : null}
    </div>
  );
}

function AdminOnboardingRoot() {
  const [phase, setPhase] = React.useState('onb');
  const [data, setData] = React.useState({ name: 'Elan Rosen', role: '', company: 'FieldVision AI', website: 'fieldvision.ai', plan: 'annual', card: '', exp: '', cvc: '', ugc: null, creatorCount: 2, managerCount: 1, stripe: false, selfManager: null });
  const [active, setActive] = React.useState('Onboarding');
  const [tour, setTour] = React.useState(-1);
  const [brain, setBrain] = React.useState({ product: '', audience: '' });
  const [accounts, setAccounts] = React.useState([
    { handle: '@fridaynightfilm', platform: 'music-2', kind: 'Reference' },
    { handle: '@coachreels', platform: 'music-2', kind: 'Reference' },
    { handle: '@qbschool', platform: 'music-2', kind: 'Reference' },
    { handle: '@gridironlab', platform: 'at-sign', kind: 'Reference' },
    { handle: '@sidelinescout', platform: 'at-sign', kind: 'Reference' },
  ]);
  const [managers, setManagers] = React.useState([{ name: 'Riley Chen', email: 'riley@fieldvision.ai', status: 'Active', joined: 'Aug 3, 2026' }]);
  const [creators, setCreators] = React.useState([
    { name: 'Maya Reyes', email: 'maya.reyes@gmail.com', status: 'Active', viewsN: 91700, posts: 3, earned: 208, joined: 'Aug 2, 2026' },
    { name: 'Devon Kim', email: 'devon.kim@gmail.com', status: 'Active', viewsN: 68500, posts: 1, earned: 150, joined: 'Aug 4, 2026' },
    { name: 'Jordan Tate', email: 'jordantate@gmail.com', status: 'Active', viewsN: 53600, posts: 2, earned: 120, joined: 'Aug 2, 2026' },
  ]);
  const [budget, setBudget] = React.useState({ limit: 0, balance: 0, spent: 0, auto: false, topups: [] });
  const [sub, setSub] = React.useState({ active: false, plan: null });
  const [stripeOn, setStripeOn] = React.useState(false);
  const [toasts, setToasts] = React.useState([]);

  const brainDone = !!(brain.product && brain.audience);
  const billingDone = sub.active && budget.limit > 0 && stripeOn;
  const mcReq = data.ugc ? data.managerCount : 1;
  const ccReq = data.ugc ? data.creatorCount : 1;
  const managersDone = mcReq > 0 && managers.length >= mcReq;
  const creatorsDone = ccReq > 0 && creators.length >= ccReq;
  const doneFlags = [brainDone, billingDone, ...(mcReq > 0 ? [managersDone] : []), ...(ccReq > 0 ? [creatorsDone] : [])];
  const doneCount = doneFlags.filter(Boolean).length;
  const allDone = doneCount === doneFlags.length;

  const prev = React.useRef({ brainDone, billingDone, managersDone, creatorsDone, allDone });
  React.useEffect(() => {
    const p = prev.current; const add = [];
    if (brainDone && !p.brainDone) add.push({ title: 'Company brain filled in' });
    if (billingDone && !p.billingDone) add.push({ title: 'Budget and subscription set' });
    if (managersDone && !p.managersDone) add.push({ title: mcReq > 1 ? 'Campaign managers invited' : 'Campaign manager invited' });
    if (creatorsDone && !p.creatorsDone) add.push({ title: ccReq > 1 ? 'Creators invited' : 'First creator invited' });
    if (allDone && !p.allDone) add.push({ title: `${data.company} is fully set up`, final: true });
    if (add.length) setToasts((t) => [...t, ...add]);
    prev.current = { brainDone, billingDone, managersDone, creatorsDone, allDone };
  }, [brainDone, billingDone, managersDone, creatorsDone, allDone]);

  React.useEffect(() => { if (allDone && active === 'Onboarding') setActive('Analytics'); }, [allDone]);

  if (phase === 'onb') return <OnbFlow data={data} setData={setData} onEnter={() => { setPhase('app'); setTour(0); if (data.selfManager) setManagers((m) => [{ name: data.name + ' (you)', email: 'elan@fieldvision.ai', status: 'Active', joined: 'Just now' }, ...m]); }} />;

  const inviteProgress = (n, req) => (n > 0 && n < req ? ` ${n} of ${req} invited so far.` : '');
  const steps = [
    { done: brainDone, title: 'Fill in your company brain', sub: 'Help us learn more about your company.', action: 'Open Company Brain', go: 'Company Brain' },
    { done: billingDone, title: 'Set your budget and subscription', sub: 'Purchase your subscription, set the monthly budget that pays bounties, and connect Stripe so Analytics shows real numbers.', action: 'Open Billing', go: 'Billing' },
    ...(mcReq > 0 ? [{ done: managersDone, title: mcReq > 1 ? `Invite your ${mcReq} campaign managers` : 'Invite your campaign manager(s)', sub: "Anyone that's a part of your brief generation and campaign management!" + inviteProgress(managers.length, mcReq), action: 'Invite managers', go: 'Team' }] : []),
    ...(ccReq > 0 ? [{ done: creatorsDone, title: ccReq > 1 ? `Invite your ${ccReq} creators` : 'Invite your creators', sub: "Let's get your creator army over here!" + inviteProgress(creators.length, ccReq), action: 'Invite creators', go: 'Team' }] : []),
  ];

  const searchIndex = [
    ...ADMIN_NAV.flatMap((g) => g.items.filter((it) => it.label !== 'Onboarding' || !allDone).map((it) => ({ section: 'Go to', icon: it.icon, title: it.label, meta: g.label, go: it.label }))),
    ...managers.map((m) => ({ section: 'Team', icon: 'circle-user-round', title: m.name, meta: 'Campaign manager · invited', go: 'Team' })),
    ...creators.map((c) => ({ section: 'Team', icon: 'circle-user-round', title: c.name, meta: 'Creator · invited', go: 'Team' })),
  ];

  const tourStep = (i) => { setTour(i); const t = TOUR[i]; if (t && t.target !== 'Search') setActive(t.target); };
  const endTour = () => { setTour(-1); setActive('Onboarding'); };

  return (
    <React.Fragment>
      <KShell groups={ADMIN_NAV.map((g) => ({ ...g, items: g.items.map((it) => it.label === 'Onboarding' && !allDone ? { ...it, badge: String(steps.length - doneCount) } : it).filter((it) => it.label !== 'Onboarding' || !allDone) }))}
        active={active} onSelect={setActive} company={data.company} user={{ name: data.name.split(' ')[0], role: 'Company admin' }}
        search={<div data-tour="Search" style={{ width: '100%', maxWidth: 560, display: 'flex', justifyContent: 'center' }}><KSearch index={searchIndex} onGo={(it) => setActive(it.go)} /></div>}>
        {active === 'Onboarding' ? <HomePage user={data} company={data.company} steps={steps} doneCount={doneCount} go={setActive} /> : null}
        {active === 'Analytics' ? <AnalyticsPage /> : null}
        {active === 'Posts' ? <PostsPage /> : null}
        {active === 'Team' ? <TeamPage company={data.company} managers={managers} creators={creators} onAddManager={(p) => setManagers((l) => [...l, p])} onAddCreator={(p) => setCreators((l) => [...l, p])} /> : null}
        {active === 'Company Brain' ? <BrainPage brain={brain} setBrain={setBrain} accounts={accounts} setAccounts={setAccounts} /> : null}
        {active === 'Billing' ? <BillingPage subscription={sub} onPurchase={(plan) => setSub({ active: true, plan })} onCancel={() => setSub({ active: false, plan: null })} onSetLimit={(v) => setBudget((b) => ({ ...b, limit: v }))} stripeOn={stripeOn} onStripe={() => setStripeOn(true)} budget={budget} onTopup={(v) => setBudget((b) => ({ ...b, balance: b.balance + v, topups: [{ amt: v, date: 'Just now' }, ...b.topups] }))} onToggleAuto={() => setBudget((b) => ({ ...b, auto: !b.auto }))} /> : null}
      </KShell>
      {tour >= 0 ? <TourOverlay idx={tour} onNext={() => (tour === TOUR.length - 1 ? endTour() : tourStep(tour + 1))} onSkip={endTour} /> : null}
      {toasts.length && tour < 0 ? <AchievementToast toast={toasts[0]} onDone={() => setToasts((t) => t.slice(1))} /> : null}
      <button type="button" onClick={() => window.location.reload()} title="Restart the flow from the invite link"
        style={{ position: 'fixed', bottom: 14, right: 14, zIndex: 150, border: '1px solid var(--line)', background: 'var(--white)', borderRadius: 999, padding: '7px 13px', cursor: 'pointer', font: '700 11.5px var(--web-ui)', color: 'var(--slate-400)', boxShadow: 'var(--shadow-card)' }}>Restart demo</button>
    </React.Fragment>
  );
}

window.AdminOnboardingRoot = AdminOnboardingRoot;
