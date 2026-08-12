/* usenoni.app /admin onboarding — invite link → Google → the basics → plan → card → enter app.
   One question per screen, prefilled wherever the invite or Google already told us. */
const FNS = () => window.NoniDesignSystem_710e43;

function GoogleG({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}

function ChoiceCard({ selected, onClick, title, hint, center }) {
  const { Icon } = FNS();
  const [hover, setHover] = React.useState(false);
  return (
    <button type="button" onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left', padding: hint ? '15px 18px' : '14px 16px', borderRadius: 14, border: '1px solid', borderColor: selected ? 'transparent' : hover ? 'var(--blue-300, var(--blue-500))' : 'var(--line)', cursor: 'pointer', background: selected ? 'var(--blue-100)' : hover ? 'var(--fill-quiet)' : 'var(--white)', boxShadow: 'none', transition: 'background var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out)' }}>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', font: '700 14.5px var(--web-ui)', color: selected ? 'var(--blue-700)' : 'var(--ink)', whiteSpace: 'nowrap' }}>{title}</span>
        {hint ? <span style={{ display: 'block', marginTop: 2, font: '600 13px var(--web-ui)', color: 'var(--slate-400)' }}>{hint}</span> : null}
      </span>
    </button>
  );
}

function OnbTopBar() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '22px 28px', flex: '0 0 auto' }}>
      <img src="assets/noni-logo.svg" alt="" width="28" height="28" style={{ display: 'block' }} />
      <span style={{ font: '700 19px var(--web-display)', letterSpacing: '-0.6px', color: 'var(--ink)' }}>noni</span>
    </div>
  );
}

/* One-question screen: segmented progress dashes, big question, fields, one pill. */
function OnbStep({ step, total, title, subtitle, children, primary, primaryDisabled, onPrimary, onBack }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--paper, #F7FAFD)', boxSizing: 'border-box' }}>
      <OnbTopBar />
      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '48px 24px 60px' }}>
        <div key={step} style={{ width: 440, maxWidth: '100%', animation: 'om-rise 240ms var(--ease-out) both' }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 30 }}>
            {Array.from({ length: total }).map((_, i) => (
              <span key={i} style={{ flex: 1, height: 4, borderRadius: 999, background: i <= step ? 'var(--blue-500)' : 'var(--line)', transition: 'background var(--dur-fast) var(--ease-out)' }}></span>
            ))}
          </div>
          <h1 style={{ margin: 0, font: '700 28px var(--web-display)', letterSpacing: '-0.7px', color: 'var(--ink)' }}>{title}</h1>
          {subtitle ? <p style={{ margin: '9px 0 0', font: '600 14.5px/1.55 var(--web-ui)', color: 'var(--slate-400)' }}>{subtitle}</p> : null}
          <div style={{ marginTop: 26 }}>{children}</div>
          {primary ? <KPill onClick={primaryDisabled ? undefined : onPrimary} style={{ width: '100%', marginTop: 26, padding: '15px 22px', font: '700 15px var(--web-ui)', opacity: primaryDisabled ? 0.35 : 1, cursor: primaryDisabled ? 'default' : 'pointer' }}>{primary}</KPill> : null}
          {onBack ? (
            <div style={{ textAlign: 'center', marginTop: 12 }}>
              <button type="button" onClick={onBack} style={{ border: 'none', background: 'transparent', cursor: 'pointer', font: '700 13.5px var(--web-ui)', color: 'var(--slate-400)', padding: 8 }}>Back</button>
            </div>) : null}
        </div>
      </div>
    </div>
  );
}

function PlanOption({ name, price, sub, chip, selected, onClick }) {
  const { Icon } = FNS();
  return (
    <button type="button" onClick={onClick}
      style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%', textAlign: 'left', padding: '17px 18px', borderRadius: 16, border: '1px solid', borderColor: selected ? 'transparent' : 'var(--border)', cursor: 'pointer', background: selected ? 'var(--blue-100)' : 'var(--white)', boxShadow: selected ? 'none' : 'var(--shadow-card)', transition: 'background var(--dur-fast) var(--ease-out)' }}>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ font: '700 15.5px var(--web-ui)', color: selected ? 'var(--blue-700)' : 'var(--ink)' }}>{name}</span>
          {chip ? <KChip tone="green" style={{ padding: '3px 9px', fontSize: 11.5 }}>{chip}</KChip> : null}
        </span>
        <span style={{ display: 'block', marginTop: 3, font: '600 13px var(--web-ui)', color: 'var(--slate-400)' }}>{sub}</span>
      </span>
      <span style={{ font: '700 19px var(--web-display)', letterSpacing: '-0.4px', color: selected ? 'var(--blue-700)' : 'var(--ink)', whiteSpace: 'nowrap' }}>{price}</span>
      {selected ? <Icon name="check" size={17} color="var(--blue-700)" /> : null}
    </button>
  );
}

function CountPicker({ value, onChange, unit }) {
  const { Icon } = FNS();
  const btn = (dir, disabled) => (
    <button type="button" onClick={() => !disabled && onChange(value + dir)} aria-label={dir > 0 ? 'More' : 'Fewer'}
      style={{ width: 46, height: 46, borderRadius: 999, border: '1px solid var(--border)', cursor: disabled ? 'default' : 'pointer', background: 'var(--white)', boxShadow: 'var(--shadow-card)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', opacity: disabled ? 0.35 : 1 }}>
      <Icon name={dir > 0 ? 'plus' : 'chevron-down'} size={17} color="var(--ink)" />
    </button>
  );
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 22, justifyContent: 'center', padding: '10px 0' }}>
      {btn(-1, value === 0)}
      <span style={{ minWidth: 130, textAlign: 'center' }}>
        <span style={{ display: 'block', font: '700 46px var(--web-display)', letterSpacing: '-1.2px', color: 'var(--ink)', lineHeight: 1 }}>{value}</span>
        <span style={{ display: 'block', marginTop: 6, font: '600 13.5px var(--web-ui)', color: 'var(--slate-400)' }}>{value === 0 ? (unit.includes('manager') ? 'no campaign manager yet' : 'no creators yet') : unit}</span>
      </span>
      {btn(1, false)}
    </div>
  );
}

function OnbFlow({ data, setData, onEnter }) {
  const { Icon } = FNS();
  const [step, setStep] = React.useState(0); // 0 invite · 1 who · 2 company · 3 plan · 4 card · 5 done
  const [picker, setPicker] = React.useState(false);
  const set = (patch) => setData((d) => ({ ...d, ...patch }));
  const totalSteps = data.ugc ? (data.managerCount > 0 ? 7 : 6) : 4;

  if (step === 0) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--paper, #F7FAFD)' }}>
      <OnbTopBar />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px 60px' }}>
        <KCard pad={36} style={{ width: 420, maxWidth: '100%', textAlign: 'center', animation: 'om-pop 260ms var(--ease-out) both' }}>
          <img src="assets/noni-logo.svg" alt="" width="46" height="46" style={{ display: 'block', margin: '0 auto' }} />
          <KLabel style={{ display: 'block', marginTop: 20 }}>You're invited</KLabel>
          <h1 style={{ margin: '8px 0 0', font: '700 25px var(--web-display)', letterSpacing: '-0.6px', color: 'var(--ink)' }}>To run FieldVision AI's UGC with Noni!</h1>
          <button type="button" onClick={() => setPicker(true)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, width: '100%', marginTop: 24, padding: '14px 20px', borderRadius: 999, border: '1px solid var(--border)', cursor: 'pointer', background: 'var(--white)', boxShadow: 'var(--shadow-card)', font: '700 14.5px var(--web-ui)', color: 'var(--ink)' }}>
            <GoogleG /> Get started with Google
          </button>
          <p style={{ margin: '16px 0 0', font: '600 12.5px/1.5 var(--web-ui)', color: 'var(--slate-400)' }}>Use the account this invite was sent to: <span style={{ color: 'var(--ink)' }}>elan@fieldvision.ai</span></p>
        </KCard>
      </div>
      {picker ? (
        <KModal title="Choose an account" onClose={() => setPicker(false)}>
          <button type="button" onClick={() => { setPicker(false); setStep(1); }}
            style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left', padding: '12px 14px', borderRadius: 12, border: 'none', cursor: 'pointer', background: 'var(--fill-quiet)' }}>
            <KAvatar name="Elan" size={36} />
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: 'block', font: '700 14px var(--web-ui)', color: 'var(--ink)' }}>Elan Rosen</span>
              <span style={{ display: 'block', font: '600 12.5px var(--web-ui)', color: 'var(--slate-400)' }}>elan@fieldvision.ai</span>
            </span>
            <Icon name="chevron-right" size={15} color="var(--slate-400)" />
          </button>
          <button type="button" style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left', padding: '12px 14px', marginTop: 8, borderRadius: 12, border: 'none', cursor: 'pointer', background: 'transparent', font: '700 13.5px var(--web-ui)', color: 'var(--slate-500)' }}>
            <Icon name="circle-user-round" size={19} color="var(--slate-400)" /> Use another account
          </button>
        </KModal>) : null}
    </div>
  );

  if (step === 1) return (
    <OnbStep step={0} total={totalSteps} title="Who are you?" subtitle="How your team sees you inside Noni."
      primary="Next" primaryDisabled={!data.name.trim()} onPrimary={() => setStep(1.5)}>
      <KField label="Your name" value={data.name} onChange={(e) => set({ name: e.target.value })} autoFocus />
    </OnbStep>
  );

  if (step === 1.5) return (
    <OnbStep step={1} total={totalSteps} title="What do you do?" subtitle="Your role at the company." onBack={() => setStep(1)}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {['Founder', 'Marketing', 'Content', 'Growth', 'Operations', 'Something else'].map((r) => (
          <ChoiceCard key={r} title={r} selected={data.role === r} onClick={() => { set({ role: r }); setTimeout(() => setStep(2), 120); }} />
        ))}
      </div>
    </OnbStep>
  );

  if (step === 2) return (
    <OnbStep step={2} total={totalSteps} title="What's your website?" subtitle="We'll scan your site to learn your company and brand."
      primary="Next" primaryDisabled={!data.website.trim()} onPrimary={() => setStep(3)} onBack={() => setStep(1.5)}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <KField label="Website" value={data.website} onChange={(e) => set({ website: e.target.value })} />
      </div>
    </OnbStep>
  );

  if (step === 3) return (
    <OnbStep step={3} total={totalSteps} title="Do you already do UGC marketing?" onBack={() => setStep(2)}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[[true, 'Yes', 'We already work with creators.'], [false, 'Not yet', "We're starting from scratch."]].map(([v, label, hint]) => (
          <ChoiceCard key={label} title={label} hint={hint} selected={data.ugc === v} onClick={() => { set({ ugc: v }); setTimeout(() => setStep(v ? 4 : 9), 120); }} />
        ))}
      </div>
    </OnbStep>
  );

  if (step === 4) return (
    <OnbStep step={4} total={totalSteps} title="How many creators do you have?" subtitle="You'll invite them once you're inside."
      primary={data.creatorCount === 0 ? "I don't have any" : 'Next'} onPrimary={() => setStep(4.5)} onBack={() => setStep(3)}>
      <CountPicker value={data.creatorCount} onChange={(v) => set({ creatorCount: v })} unit={data.creatorCount === 1 ? 'creator' : 'creators'} />
    </OnbStep>
  );

  if (step === 4.5) return (
    <OnbStep step={5} total={totalSteps} title="And how many campaign managers?" subtitle="They run weekly briefs and keep creators on pace."
      primary={data.managerCount === 0 ? "I don't have one" : 'Next'} onPrimary={() => setStep(data.managerCount > 0 ? 4.7 : 9)} onBack={() => setStep(4)}>
      <CountPicker value={data.managerCount} onChange={(v) => set({ managerCount: v })} unit={data.managerCount === 1 ? 'campaign manager' : 'campaign managers'} />
    </OnbStep>
  );


  if (step === 4.7) return (
    <OnbStep step={6} total={totalSteps} title={data.managerCount === 1 ? 'Are you the campaign manager?' : 'Are you one of the campaign managers?'} onBack={() => setStep(4.5)}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <ChoiceCard title="Yes, that's me" selected={data.selfManager === true} onClick={() => { set({ selfManager: true }); setTimeout(() => setStep(4.8), 120); }} />
        <ChoiceCard title="No, someone else" selected={data.selfManager === false} onClick={() => { set({ selfManager: false }); setTimeout(() => setStep(9), 120); }} />
      </div>
    </OnbStep>
  );

  if (step === 4.8) return (
    <OnbStep step={6} total={totalSteps} title="Download the Noni App to run your campaigns!" subtitle="This Google account is already set as a campaign manager for FieldVision AI."
      primary="I downloaded it!" onPrimary={() => setStep(9)}>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <image-slot id="noni-app-viral-shot" src="review-phone-crop.png" shape="rounded" radius="28" placeholder="Drop the Noni app screenshot" style={{ width: 240, height: 522 }}></image-slot>
      </div>
    </OnbStep>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--paper, #F7FAFD)', padding: 24, boxSizing: 'border-box' }}>
      <div style={{ width: 420, maxWidth: '100%', textAlign: 'center', animation: 'om-pop 300ms var(--ease-out) both' }}>
        <span style={{ width: 64, height: 64, borderRadius: 999, background: 'var(--green-soft, #E4F6EC)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="check" size={28} color="var(--green, #1F9D5B)" />
        </span>
        <h1 style={{ margin: '20px 0 0', font: '700 30px var(--web-display)', letterSpacing: '-0.8px', color: 'var(--ink)' }}>That's it.</h1>
        <p style={{ margin: '10px 0 0', font: '600 14.5px/1.6 var(--web-ui)', color: 'var(--slate-400)' }}>{data.company} is live on Noni. Your setup steps are waiting inside. We'll show you around first.</p>
        <KPill onClick={onEnter} style={{ marginTop: 26, padding: '15px 34px', font: '700 15px var(--web-ui)' }}>Look around</KPill>
      </div>
    </div>
  );
}

Object.assign(window, { OnbFlow, PlanOption });
