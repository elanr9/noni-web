/* @ds-bundle: {"format":4,"namespace":"NoniDesignSystem_710e43","components":[{"name":"TeleprompterOverlay","sourcePath":"components/capture/TeleprompterOverlay.jsx"},{"name":"InfoBlock","sourcePath":"components/content/InfoBlock.jsx"},{"name":"MediaCard","sourcePath":"components/content/MediaCard.jsx"},{"name":"StatCard","sourcePath":"components/content/StatCard.jsx"},{"name":"TaskCard","sourcePath":"components/content/TaskCard.jsx"},{"name":"TrendCard","sourcePath":"components/content/TrendCard.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Icon","sourcePath":"components/core/Icon.jsx"},{"name":"ScreenHeader","sourcePath":"components/core/ScreenHeader.jsx"},{"name":"BubbleMark","sourcePath":"components/core/Wordmark.jsx"},{"name":"Wordmark","sourcePath":"components/core/Wordmark.jsx"},{"name":"EmptyState","sourcePath":"components/feedback/EmptyState.jsx"},{"name":"ProgressBar","sourcePath":"components/feedback/ProgressBar.jsx"},{"name":"StatusChip","sourcePath":"components/feedback/StatusChip.jsx"},{"name":"Chip","sourcePath":"components/forms/Chip.jsx"},{"name":"OptionCard","sourcePath":"components/forms/OptionCard.jsx"},{"name":"Stepper","sourcePath":"components/forms/Stepper.jsx"},{"name":"TextField","sourcePath":"components/forms/TextField.jsx"},{"name":"ToneSlider","sourcePath":"components/forms/ToneSlider.jsx"},{"name":"TabBar","sourcePath":"components/navigation/TabBar.jsx"}],"sourceHashes":{"components/capture/TeleprompterOverlay.jsx":"d788b4798f8f","components/content/InfoBlock.jsx":"788413ab7a60","components/content/MediaCard.jsx":"cd6c39d95a07","components/content/StatCard.jsx":"271b5cdd75c9","components/content/TaskCard.jsx":"77d232cd2c01","components/content/TrendCard.jsx":"3245238c78e4","components/core/Button.jsx":"1c7dd1c59775","components/core/Icon.jsx":"19f0d96823d1","components/core/ScreenHeader.jsx":"ff4ca96aa21d","components/core/Wordmark.jsx":"c0448985a825","components/core/icon-data.js":"1699548410cd","components/feedback/EmptyState.jsx":"c36a10a2b398","components/feedback/ProgressBar.jsx":"2c05daa511fd","components/feedback/StatusChip.jsx":"150c747e5adc","components/forms/Chip.jsx":"c863b202ce46","components/forms/OptionCard.jsx":"b739322b5a42","components/forms/Stepper.jsx":"b92616598790","components/forms/TextField.jsx":"f98155945ecf","components/forms/ToneSlider.jsx":"4ac67783d0c0","components/navigation/TabBar.jsx":"6d9925e99d49","design_handoff_landing_page/reference/ios-frame.jsx":"24642b887be3","redesigns/admin/SettingsRedesign.jsx":"292d25eeda30","redesigns/web/ConsoleApp.jsx":"0c1cfeaa4f6d","redesigns/web/WebShared.jsx":"5eb5d6eb427d","redesigns/website/OpsApp.jsx":"a92c6ecdd5ec","redesigns/website/WebAdminApp.jsx":"20e66d0abca1","redesigns/website/WebKit.jsx":"34030e880bf0","ui_kits/admin-app/AdminApp.jsx":"eba915c9e4a5","ui_kits/admin-app/AdminBoard.jsx":"91cf4e4b182b","ui_kits/admin-app/AdminShared.jsx":"210af6bb37f8","ui_kits/admin-app/AdminShots.jsx":"770df97e0187","ui_kits/admin-app/AnalyticsScreens.jsx":"b2293b14edff","ui_kits/admin-app/ApprovalScreens.jsx":"48456da7e6b8","ui_kits/admin-app/BriefsScreen.jsx":"080c557c177d","ui_kits/admin-app/CreatorsScreens.jsx":"9eb2d1d8f639","ui_kits/admin-app/EditorSheets.jsx":"8a463894b593","ui_kits/admin-app/LibraryScreen.jsx":"88ce9a3138ab","ui_kits/admin-app/PostEditorScreen.jsx":"957955df82f8","ui_kits/admin-app/PostEditorSteps.jsx":"555e6c1cdc19","ui_kits/admin-app/ReviewDetailScreen.jsx":"6edd3ad86b58","ui_kits/admin-app/ReviewScreen.jsx":"e82ec797b546","ui_kits/admin-app/WeekSetupScreen.jsx":"f847f45177e5","ui_kits/admin-app/admin-data.js":"3977c39a753d","ui_kits/creator-app/CreatorApp.jsx":"f6510a4a6f84","ui_kits/creator-app/CreatorShared.jsx":"b579ae0f40ef","ui_kits/creator-app/GrowthScreen.jsx":"a5be591661b0","ui_kits/creator-app/HomeScreen.jsx":"c89b0bcd993e","ui_kits/creator-app/PostsScreen.jsx":"34e4a02f557b","ui_kits/creator-app/ProfileScreen.jsx":"6195ab6e95bb","ui_kits/creator-app/RecordScreen.jsx":"dc1c0f6c2051","ui_kits/creator-app/ScreenBoard.jsx":"dcd4727ae11d","ui_kits/creator-app/TaskDetailScreen.jsx":"4f6610ca8cee","ui_kits/creator-app/creator-data.js":"7d7c01e5ab66","ui_kits/onboarding/AuthScreens.jsx":"a159b4a4d14a","ui_kits/onboarding/BrandStudyScreen.jsx":"34235833bce0","ui_kits/onboarding/CompanyFlow.jsx":"e3bd33ac57bf","ui_kits/onboarding/CreatorFlow.jsx":"ca307e30261a","ui_kits/onboarding/OnboardingApp.jsx":"6f93ccb0b863","ui_kits/onboarding/StepShell.jsx":"d7e037176999","ui_kits/shared/Phone.jsx":"54bbe829197a","ui_kits/shared/data.js":"a6d6f8022d62"},"inlinedExternals":[],"unexposedExports":[{"name":"iconGlyphs","sourcePath":"components/core/icon-data.js"},{"name":"iconNames","sourcePath":"components/core/icon-data.js"}]} */

(() => {

const __ds_ns = (window.NoniDesignSystem_710e43 = window.NoniDesignSystem_710e43 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/capture/TeleprompterOverlay.jsx
try { (() => {
function TeleprompterOverlay({
  text,
  wordIndex = 0,
  paused = false,
  speed,
  style
}) {
  const words = String(text).split(/\s+/).filter(Boolean);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      height: '34%',
      minHeight: 160,
      overflow: 'hidden',
      padding: '12px 20px',
      background: 'var(--scrim)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 26,
      lineHeight: '38px',
      fontWeight: 'var(--weight-semibold)',
      textAlign: 'center',
      textShadow: '0 1px 4px rgba(0,0,0,0.8)'
    }
  }, words.map((w, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      color: i < wordIndex ? 'rgba(255,255,255,0.45)' : i === wordIndex ? 'var(--accent-tint)' : 'var(--white)',
      fontWeight: i === wordIndex ? 'var(--weight-heavy)' : 'inherit'
    }
  }, w, i < words.length - 1 ? ' ' : ''))), speed ? /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: 12,
      right: 16,
      padding: '4px 10px',
      borderRadius: 999,
      background: 'rgba(0,0,0,0.45)',
      color: 'var(--white)',
      fontSize: 'var(--text-chip)',
      fontWeight: 'var(--weight-bold)'
    }
  }, speed, "x") : null, paused ? /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      bottom: 10,
      left: '50%',
      transform: 'translateX(-50%)',
      padding: '6px 12px',
      borderRadius: 999,
      background: 'var(--scrim-strong)',
      color: 'var(--white)',
      fontSize: 'var(--text-chip)',
      fontWeight: 'var(--weight-bold)',
      whiteSpace: 'nowrap'
    }
  }, "Script paused. Tap to resume.") : null);
}
Object.assign(__ds_scope, { TeleprompterOverlay });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/capture/TeleprompterOverlay.jsx", error: String((e && e.message) || e) }); }

// components/content/InfoBlock.jsx
try { (() => {
function InfoBlock({
  label,
  children,
  tone = 'card',
  style
}) {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      background: tone === 'quiet' ? 'var(--surface-sunken)' : 'var(--surface-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--card-pad)',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-label)',
      fontWeight: 'var(--weight-bold)',
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-label)',
      color: 'var(--text-muted)'
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-body)',
      lineHeight: 'var(--leading-body)',
      color: 'var(--text-body)'
    }
  }, children));
}
Object.assign(__ds_scope, { InfoBlock });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/InfoBlock.jsx", error: String((e && e.message) || e) }); }

// components/core/ScreenHeader.jsx
try { (() => {
function ScreenHeader({
  eyebrow,
  title,
  subtitle,
  right,
  style
}) {
  return /*#__PURE__*/React.createElement("header", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 16,
      marginBottom: 'var(--space-10)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      flex: 1,
      minWidth: 0
    }
  }, eyebrow ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-card)',
      fontWeight: 'var(--weight-bold)',
      color: 'var(--accent)',
      letterSpacing: '0.5px'
    }
  }, eyebrow) : null, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontFamily: 'var(--font-display)',
      fontSize: 'var(--text-title-xl)',
      lineHeight: 'var(--leading-title)',
      letterSpacing: 'var(--tracking-title)',
      fontWeight: 'var(--weight-bold)',
      color: 'var(--text-strong)'
    }
  }, title), subtitle ? /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 'var(--text-body)',
      lineHeight: 'var(--leading-body)',
      color: 'var(--text-muted)'
    }
  }, subtitle) : null), right ? /*#__PURE__*/React.createElement("div", {
    style: {
      paddingTop: 4
    }
  }, right) : null);
}
Object.assign(__ds_scope, { ScreenHeader });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/ScreenHeader.jsx", error: String((e && e.message) || e) }); }

// components/core/Wordmark.jsx
try { (() => {
/** The Noni mark: an inflated, glossy capital "N" bubble in the brand blues.
 *  Source of truth is assets/logo.svg — this is the same geometry inlined so
 *  it can be tinted and sized in place. */
function BubbleMark({
  size = 40,
  style
}) {
  const uid = React.useId().replace(/:/g, '');
  const segs = ['M168 372V140', 'M344 372V140', 'M170 156L342 356'];
  return /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    viewBox: "0 0 512 512",
    role: "img",
    "aria-label": "Noni",
    style: style
  }, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("linearGradient", {
    id: `b${uid}`,
    gradientUnits: "userSpaceOnUse",
    x1: "120",
    y1: "70",
    x2: "420",
    y2: "440"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0",
    stopColor: "#9AD4F9"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "0.36",
    stopColor: "#4FB6F2"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "0.72",
    stopColor: "#1189CC"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "1",
    stopColor: "#08557F"
  })), /*#__PURE__*/React.createElement("linearGradient", {
    id: `r${uid}`,
    gradientUnits: "userSpaceOnUse",
    x1: "256",
    y1: "60",
    x2: "256",
    y2: "300"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0",
    stopColor: "#FFFFFF",
    stopOpacity: "0.95"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "0.6",
    stopColor: "#FFFFFF",
    stopOpacity: "0.25"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "1",
    stopColor: "#FFFFFF",
    stopOpacity: "0"
  })), /*#__PURE__*/React.createElement("filter", {
    id: `s${uid}`,
    x: "-40%",
    y: "-40%",
    width: "180%",
    height: "180%"
  }, /*#__PURE__*/React.createElement("feGaussianBlur", {
    stdDeviation: "12"
  })), /*#__PURE__*/React.createElement("filter", {
    id: `s5${uid}`,
    x: "-60%",
    y: "-60%",
    width: "220%",
    height: "220%"
  }, /*#__PURE__*/React.createElement("feGaussianBlur", {
    stdDeviation: "5"
  })), /*#__PURE__*/React.createElement("filter", {
    id: `s3${uid}`,
    x: "-80%",
    y: "-80%",
    width: "260%",
    height: "260%"
  }, /*#__PURE__*/React.createElement("feGaussianBlur", {
    stdDeviation: "3"
  })), /*#__PURE__*/React.createElement("mask", {
    id: `m${uid}`
  }, segs.map(d => /*#__PURE__*/React.createElement("path", {
    key: d,
    d: d,
    fill: "none",
    stroke: "#fff",
    strokeWidth: "118",
    strokeLinecap: "round"
  })))), /*#__PURE__*/React.createElement("g", {
    fill: "none",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, segs.map(d => /*#__PURE__*/React.createElement("path", {
    key: d,
    d: d,
    stroke: "#07547F",
    strokeWidth: "118",
    opacity: "0.3",
    transform: "translate(4,18)",
    filter: `url(#s${uid})`
  })), segs.map(d => /*#__PURE__*/React.createElement("path", {
    key: d,
    d: d,
    stroke: `url(#b${uid})`,
    strokeWidth: "118"
  }))), /*#__PURE__*/React.createElement("g", {
    mask: `url(#m${uid})`
  }, segs.map(d => /*#__PURE__*/React.createElement("path", {
    key: d,
    d: d,
    fill: "none",
    stroke: "#063F60",
    strokeWidth: "40",
    strokeLinecap: "round",
    transform: "translate(8,44)",
    filter: `url(#s${uid})`,
    opacity: "0.55"
  })), segs.map(d => /*#__PURE__*/React.createElement("path", {
    key: d,
    d: d,
    fill: "none",
    stroke: `url(#r${uid})`,
    strokeWidth: "18",
    strokeLinecap: "round",
    transform: "translate(-8,-40)",
    filter: `url(#s5${uid})`
  })), /*#__PURE__*/React.createElement("ellipse", {
    cx: "152",
    cy: "200",
    rx: "14",
    ry: "46",
    fill: "#FFFFFF",
    opacity: "0.9",
    filter: `url(#s3${uid})`
  }), /*#__PURE__*/React.createElement("ellipse", {
    cx: "328",
    cy: "196",
    rx: "13",
    ry: "40",
    fill: "#FFFFFF",
    opacity: "0.5",
    filter: `url(#s5${uid})`
  }), /*#__PURE__*/React.createElement("ellipse", {
    cx: "250",
    cy: "252",
    rx: "11",
    ry: "42",
    fill: "#FFFFFF",
    opacity: "0.28",
    filter: `url(#s5${uid})`,
    transform: "rotate(40 250 252)"
  }), /*#__PURE__*/React.createElement("ellipse", {
    cx: "182",
    cy: "378",
    rx: "42",
    ry: "15",
    fill: "#BFE6FF",
    opacity: "0.28",
    filter: `url(#s${uid})`
  })));
}

/** Wordmark: the bubble mark plus lowercase "noni" in the rounded face. */
function Wordmark({
  size = 28,
  tone = 'ink',
  capsule = false,
  style
}) {
  const color = tone === 'blue' ? 'var(--blue-500)' : tone === 'onDark' ? 'var(--white)' : 'var(--ink)';
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: size * 0.26,
      ...style
    }
  }, capsule ? /*#__PURE__*/React.createElement(BubbleMark, {
    size: size * 1.55
  }) : null, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-rounded)',
      fontWeight: 800,
      fontSize: size,
      letterSpacing: '-0.03em',
      color,
      lineHeight: 1
    }
  }, "noni"));
}
Object.assign(__ds_scope, { BubbleMark, Wordmark });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Wordmark.jsx", error: String((e && e.message) || e) }); }

// components/core/icon-data.js
try { (() => {
/* Inline SVG markup for the 40 Lucide glyphs in assets/icons/.
   Generated from those files — keep the two in sync if you add an icon. */
const iconGlyphs = {
  "chevrons-up-down": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"m7 15 5 5 5-5\"></path> <path d=\"m7 9 5-5 5 5\"></path>"
  },
  "image-plus": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"M16 5h6\"></path> <path d=\"M19 2v6\"></path> <path d=\"M21 11.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7.5\"></path> <path d=\"m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21\"></path> <circle cx=\"9\" cy=\"9\" r=\"2\"></circle>"
  },
  "arrow-right": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"M5 12h14\"></path> <path d=\"m12 5 7 7-7 7\"></path>"
  },
  "at-sign": {
    "viewBox": "0 0 24 24",
    "body": "<circle cx=\"12\" cy=\"12\" r=\"4\"></circle> <path d=\"M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8\"></path>"
  },
  "bell": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"M10.268 21a2 2 0 0 0 3.464 0\"></path> <path d=\"M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326\"></path>"
  },
  "calendar-days": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"M8 2v3\"></path> <path d=\"M16 2v3\"></path> <rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"></rect> <path d=\"M3 9h18\"></path> <path d=\"M8 13h.01\"></path> <path d=\"M12 13h.01\"></path> <path d=\"M16 13h.01\"></path> <path d=\"M8 17h.01\"></path> <path d=\"M12 17h.01\"></path> <path d=\"M16 17h.01\"></path>"
  },
  "camera": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"M13.997 4a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 1.759-1.048l.489-.904A2 2 0 0 1 10.004 4z\"></path> <circle cx=\"12\" cy=\"13\" r=\"3\"></circle>"
  },
  "chart-column": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"M3 3v16a2 2 0 0 0 2 2h16\"></path> <path d=\"M18 17V9\"></path> <path d=\"M13 17V5\"></path> <path d=\"M8 17v-3\"></path>"
  },
  "check": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"M20 6 9 17l-5-5\"></path>"
  },
  "chevron-left": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"m15 18-6-6 6-6\"></path>"
  },
  "chevron-right": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"m9 18 6-6-6-6\"></path>"
  },
  "circle-alert": {
    "viewBox": "0 0 24 24",
    "body": "<circle cx=\"12\" cy=\"12\" r=\"10\"></circle> <line x1=\"12\" x2=\"12\" y1=\"8\" y2=\"12\"></line> <line x1=\"12\" x2=\"12.01\" y1=\"16\" y2=\"16\"></line>"
  },
  "circle-check-big": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"M21.801 10A10 10 0 1 1 17 3.335\"></path> <path d=\"m9 11 3 3L22 4\"></path>"
  },
  "circle-user-round": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"M17.925 20.056a6 6 0 0 0-11.851.001\"></path> <circle cx=\"12\" cy=\"11\" r=\"4\"></circle> <circle cx=\"12\" cy=\"12\" r=\"10\"></circle>"
  },
  "clock": {
    "viewBox": "0 0 24 24",
    "body": "<circle cx=\"12\" cy=\"12\" r=\"10\"></circle> <path d=\"M12 6v6l4 2\"></path>"
  },
  "dollar-sign": {
    "viewBox": "0 0 24 24",
    "body": "<line x1=\"12\" x2=\"12\" y1=\"2\" y2=\"22\"></line> <path d=\"M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6\"></path>"
  },
  "eye": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0\"></path> <circle cx=\"12\" cy=\"12\" r=\"3\"></circle>"
  },
  "gauge": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"m12 14 4-4\"></path> <path d=\"M3.34 19a10 10 0 1 1 17.32 0\"></path>"
  },
  "house": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8\"></path> <path d=\"M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z\"></path>"
  },
  "images": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"m22 11-1.296-1.296a2.4 2.4 0 0 0-3.408 0L11 16\"></path> <path d=\"M4 8a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2\"></path> <circle cx=\"13\" cy=\"7\" r=\"1\" fill=\"currentColor\"></circle> <rect x=\"8\" y=\"2\" width=\"14\" height=\"14\" rx=\"2\"></rect>"
  },
  "inbox": {
    "viewBox": "0 0 24 24",
    "body": "<polyline points=\"22 12 16 12 14 15 10 15 8 12 2 12\"></polyline> <path d=\"M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z\"></path>"
  },
  "layout-list": {
    "viewBox": "0 0 24 24",
    "body": "<rect width=\"7\" height=\"7\" x=\"3\" y=\"3\" rx=\"1\"></rect> <rect width=\"7\" height=\"7\" x=\"3\" y=\"14\" rx=\"1\"></rect> <path d=\"M14 4h7\"></path> <path d=\"M14 9h7\"></path> <path d=\"M14 15h7\"></path> <path d=\"M14 20h7\"></path>"
  },
  "link": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71\"></path> <path d=\"M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71\"></path>"
  },
  "log-out": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"m16 17 5-5-5-5\"></path> <path d=\"M21 12H9\"></path> <path d=\"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4\"></path>"
  },
  "message-circle": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719\"></path>"
  },
  "mic": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"M12 19v3\"></path> <path d=\"M19 10v2a7 7 0 0 1-14 0v-2\"></path> <rect x=\"9\" y=\"2\" width=\"6\" height=\"13\" rx=\"3\"></rect>"
  },
  "music-2": {
    "viewBox": "0 0 24 24",
    "body": "<circle cx=\"8\" cy=\"18\" r=\"4\"></circle> <path d=\"M12 18V2l7 4\"></path>"
  },
  "pause": {
    "viewBox": "0 0 24 24",
    "body": "<rect x=\"14\" y=\"3\" width=\"5\" height=\"18\" rx=\"1\"></rect> <rect x=\"5\" y=\"3\" width=\"5\" height=\"18\" rx=\"1\"></rect>"
  },
  "pencil": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z\"></path> <path d=\"m15 5 4 4\"></path>"
  },
  "play": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z\"></path>"
  },
  "plus": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"M5 12h14\"></path> <path d=\"M12 5v14\"></path>"
  },
  "rotate-ccw": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8\"></path> <path d=\"M3 3v5h5\"></path>"
  },
  "settings": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915\"></path> <circle cx=\"12\" cy=\"12\" r=\"3\"></circle>"
  },
  "share-2": {
    "viewBox": "0 0 24 24",
    "body": "<circle cx=\"18\" cy=\"5\" r=\"3\"></circle> <circle cx=\"6\" cy=\"12\" r=\"3\"></circle> <circle cx=\"18\" cy=\"19\" r=\"3\"></circle> <line x1=\"8.59\" x2=\"15.42\" y1=\"13.51\" y2=\"17.49\"></line> <line x1=\"15.41\" x2=\"8.59\" y1=\"6.51\" y2=\"10.49\"></line>"
  },
  "sparkles": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z\"></path> <path d=\"M20 2v4\"></path> <path d=\"M22 4h-4\"></path> <circle cx=\"4\" cy=\"20\" r=\"2\"></circle>"
  },
  "switch-camera": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"M11 19H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5\"></path> <path d=\"M13 5h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-5\"></path> <circle cx=\"12\" cy=\"12\" r=\"3\"></circle> <path d=\"m18 22-3-3 3-3\"></path> <path d=\"m6 2 3 3-3 3\"></path>"
  },
  "trash-2": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"M10 11v6\"></path> <path d=\"M14 11v6\"></path> <path d=\"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6\"></path> <path d=\"M3 6h18\"></path> <path d=\"M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2\"></path>"
  },
  "trending-up": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"M16 7h6v6\"></path> <path d=\"m22 7-8.5 8.5-5-5L2 17\"></path>"
  },
  "users": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\"></path> <path d=\"M16 3.128a4 4 0 0 1 0 7.744\"></path> <path d=\"M22 21v-2a4 4 0 0 0-3-3.87\"></path> <circle cx=\"9\" cy=\"7\" r=\"4\"></circle>"
  },
  "video": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5\"></path> <rect x=\"2\" y=\"6\" width=\"14\" height=\"12\" rx=\"2\"></rect>"
  },
  "x": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"M18 6 6 18\"></path> <path d=\"m6 6 12 12\"></path>"
  },
  "zap": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"M15.914 4a1.5 1.5 0 00-2.474-1.561l-9 9A1.5 1.5 0 005.5 14h4.002a.5.5 0 01.471.666L8.086 20a1.5 1.5 0 002.475 1.56l9-9A1.5 1.5 0 0018.5 10h-3.997a.5.5 0 01-.472-.667z\"></path>"
  },
  "copy": {
    "viewBox": "0 0 24 24",
    "body": "<rect width=\"14\" height=\"14\" x=\"8\" y=\"8\" rx=\"2\" ry=\"2\"></rect> <path d=\"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2\"></path>"
  },
  "download": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4\"></path> <polyline points=\"7 10 12 15 17 10\"></polyline> <line x1=\"12\" x2=\"12\" y1=\"15\" y2=\"3\"></line>"
  },
  "search": {
    "viewBox": "0 0 24 24",
    "body": "<circle cx=\"11\" cy=\"11\" r=\"8\"></circle> <path d=\"m21 21-4.3-4.3\"></path>"
  },
  "send": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z\"></path> <path d=\"m21.854 2.147-10.94 10.939\"></path>"
  },
  "chevron-down": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"m6 9 6 6 6-6\"></path>"
  },
  "heart": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z\"></path>"
  },
  "bookmark": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z\"></path>"
  },
  "layout-grid": {
    "viewBox": "0 0 24 24",
    "body": "<rect width=\"7\" height=\"7\" x=\"3\" y=\"3\" rx=\"1\"></rect> <rect width=\"7\" height=\"7\" x=\"14\" y=\"3\" rx=\"1\"></rect> <rect width=\"7\" height=\"7\" x=\"14\" y=\"14\" rx=\"1\"></rect> <rect width=\"7\" height=\"7\" x=\"3\" y=\"14\" rx=\"1\"></rect>"
  }
};
const iconNames = ["chevrons-up-down", "image-plus", "arrow-right", "at-sign", "bell", "bookmark", "calendar-days", "camera", "chart-column", "check", "chevron-down", "chevron-left", "chevron-right", "circle-alert", "circle-check-big", "circle-user-round", "clock", "copy", "dollar-sign", "download", "eye", "gauge", "heart", "house", "images", "inbox", "layout-grid", "layout-list", "link", "log-out", "message-circle", "mic", "music-2", "pause", "pencil", "play", "plus", "rotate-ccw", "search", "send", "settings", "share-2", "sparkles", "switch-camera", "trash-2", "trending-up", "users", "video", "x", "zap"];
Object.assign(__ds_scope, { iconGlyphs, iconNames });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/icon-data.js", error: String((e && e.message) || e) }); }

// components/core/Icon.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Renders one of Noni's Lucide glyphs as inline SVG, stroked in currentColor. */
function Icon({
  name,
  size = 22,
  strokeWidth = 2,
  color = 'currentColor',
  style,
  ...rest
}) {
  const glyph = __ds_scope.iconGlyphs[name];
  if (!glyph) return null;
  return /*#__PURE__*/React.createElement("svg", _extends({
    role: "img",
    "aria-label": name,
    width: size,
    height: size,
    viewBox: glyph.viewBox,
    fill: "none",
    stroke: color,
    strokeWidth: strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: {
      display: 'inline-block',
      flex: '0 0 auto',
      ...style
    },
    dangerouslySetInnerHTML: {
      __html: glyph.body
    }
  }, rest));
}
Object.assign(__ds_scope, { Icon });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Icon.jsx", error: String((e && e.message) || e) }); }

// components/content/MediaCard.jsx
try { (() => {
const FORMATS = {
  video: 'Reel',
  reel: 'Reel',
  photo_carousel: 'Slideshow',
  slideshow: 'Slideshow'
};
const clamp = lines => ({
  display: '-webkit-box',
  WebkitLineClamp: lines,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden'
});

/** A post shown the way creators think about it: the frame first, a short
 *  title over or under it, and nothing else. `fill` makes the frame take the
 *  height it is given, so one card can own the screen on any device. */
function MediaCard({
  title,
  meta,
  format = 'reel',
  time,
  duration,
  thumbnail,
  variant = 'tile',
  mediaHeight,
  fill = false,
  onPlay,
  onClick,
  children,
  style
}) {
  const hero = variant === 'hero';
  const h = fill ? undefined : mediaHeight ?? (hero ? 200 : 132);
  const isSlides = format === 'slideshow' || format === 'photo_carousel';
  return /*#__PURE__*/React.createElement("article", {
    onClick: onClick,
    style: {
      background: 'var(--surface-card)',
      border: '1px solid var(--border)',
      borderRadius: hero ? 'var(--radius-2xl)' : 'var(--radius-lg)',
      overflow: 'hidden',
      boxShadow: hero ? 'var(--shadow-raised)' : 'var(--shadow-card)',
      display: 'flex',
      flexDirection: 'column',
      cursor: onClick ? 'pointer' : 'default',
      minWidth: 0,
      minHeight: 0,
      height: fill ? '100%' : undefined,
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      minHeight: 0,
      height: fill ? undefined : h,
      flex: fill ? '1 1 auto' : `0 0 ${h}px`,
      background: thumbnail ? `url(${thumbnail}) center / cover no-repeat` : 'linear-gradient(160deg,#E7F4FD 0%,#DCE7F0 100%)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: 10,
      left: 10,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      padding: '6px 10px',
      borderRadius: 999,
      background: 'rgba(255,255,255,0.92)',
      color: 'var(--ink)',
      fontSize: 'var(--text-label)',
      fontWeight: 'var(--weight-bold)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: isSlides ? 'images' : 'video',
    size: 13
  }), FORMATS[format] ?? 'Reel'), time ? /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: 10,
      right: 10,
      padding: '6px 10px',
      borderRadius: 999,
      background: 'rgba(15,23,32,0.55)',
      color: 'var(--white)',
      fontSize: 'var(--text-label)',
      fontWeight: 'var(--weight-bold)',
      whiteSpace: 'nowrap'
    }
  }, time) : null, /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": "Play",
    onClick: e => {
      e.stopPropagation();
      onPlay && onPlay();
    },
    style: {
      position: 'absolute',
      left: '50%',
      top: '50%',
      transform: 'translate(-50%,-50%)',
      width: hero ? 54 : 40,
      height: hero ? 54 : 40,
      borderRadius: 999,
      border: 'none',
      cursor: 'pointer',
      background: 'rgba(255,255,255,0.92)',
      boxShadow: 'var(--shadow-media)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: isSlides ? 'images' : 'play',
    size: hero ? 23 : 17,
    color: "var(--ink)"
  })), duration ? /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      bottom: 10,
      right: 10,
      padding: '5px 9px',
      borderRadius: 999,
      background: 'rgba(15,23,32,0.55)',
      color: 'var(--white)',
      fontSize: 11,
      fontWeight: 'var(--weight-bold)'
    }
  }, duration) : null, hero ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(180deg,rgba(0,0,0,0) 42%,rgba(0,0,0,0.66) 100%)',
      pointerEvents: 'none'
    }
  }), /*#__PURE__*/React.createElement("h3", {
    style: {
      position: 'absolute',
      left: 16,
      right: 76,
      bottom: 14,
      margin: 0,
      fontFamily: 'var(--font-display)',
      fontSize: 'var(--text-card-lg)',
      fontWeight: 'var(--weight-bold)',
      lineHeight: 'var(--leading-snug)',
      letterSpacing: '-0.3px',
      color: 'var(--white)',
      ...clamp(2)
    }
  }, title)) : null), !hero || children ? /*#__PURE__*/React.createElement("div", {
    style: {
      flex: '0 0 auto',
      padding: hero ? 12 : 12,
      display: 'flex',
      flexDirection: 'column',
      gap: hero ? 0 : 4
    }
  }, !hero ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontSize: 'var(--text-body-sm)',
      fontWeight: 'var(--weight-bold)',
      lineHeight: 'var(--leading-snug)',
      letterSpacing: '-0.2px',
      color: 'var(--text-strong)',
      ...clamp(2)
    }
  }, title), meta ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-chip)',
      color: 'var(--text-muted)',
      ...clamp(1)
    }
  }, meta) : null) : null, children) : null);
}
Object.assign(__ds_scope, { MediaCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/MediaCard.jsx", error: String((e && e.message) || e) }); }

// components/content/StatCard.jsx
try { (() => {
function StatCard({
  value,
  label,
  icon,
  tone = 'plain',
  style
}) {
  const brand = tone === 'brand';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0,
      background: brand ? 'var(--blue-100)' : 'var(--surface-card)',
      border: `1px solid ${brand ? 'transparent' : 'var(--border)'}`,
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--card-pad)',
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      ...style
    }
  }, icon ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 18,
    color: brand ? 'var(--blue-600)' : 'var(--slate-400)',
    style: {
      marginBottom: 6
    }
  }) : null, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 36,
      fontWeight: 'var(--weight-bold)',
      letterSpacing: '-1px',
      lineHeight: 1,
      color: brand ? 'var(--blue-700)' : 'var(--text-strong)'
    }
  }, value), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-body-sm)',
      color: brand ? 'var(--blue-700)' : 'var(--text-muted)'
    }
  }, label));
}
Object.assign(__ds_scope, { StatCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/StatCard.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const {
  useState
} = React;
const VARIANTS = {
  primary: {
    background: 'var(--accent)',
    color: 'var(--text-on-accent)',
    border: 'none',
    boxShadow: 'var(--shadow-accent)'
  },
  secondary: {
    background: 'var(--ink)',
    color: 'var(--white)',
    border: 'none'
  },
  tint: {
    background: 'var(--blue-100)',
    color: 'var(--blue-700)',
    border: 'none'
  },
  outline: {
    background: 'transparent',
    color: 'var(--ink)',
    border: '1.5px solid var(--border-strong)'
  },
  ghost: {
    background: 'transparent',
    color: 'var(--text-muted)',
    border: 'none'
  },
  danger: {
    background: 'var(--danger)',
    color: 'var(--white)',
    border: 'none'
  },
  approve: {
    background: 'var(--green)',
    color: 'var(--white)',
    border: 'none'
  }
};
const SIZES = {
  lg: {
    height: 'var(--tap-primary)',
    fontSize: 'var(--text-action)',
    padding: '0 28px',
    fontWeight: 'var(--weight-heavy)'
  },
  md: {
    height: 48,
    fontSize: 'var(--text-body-sm)',
    padding: '0 20px',
    fontWeight: 'var(--weight-bold)'
  },
  sm: {
    height: 40,
    fontSize: 'var(--text-meta)',
    padding: '0 16px',
    fontWeight: 'var(--weight-bold)'
  }
};
function Button({
  children,
  variant = 'primary',
  size = 'lg',
  icon,
  iconRight,
  block = false,
  disabled = false,
  onClick,
  style,
  type = 'button',
  ...rest
}) {
  const [down, setDown] = useState(false);
  return /*#__PURE__*/React.createElement("button", _extends({
    type: type,
    disabled: disabled,
    onClick: onClick,
    onPointerDown: () => setDown(true),
    onPointerUp: () => setDown(false),
    onPointerLeave: () => setDown(false),
    style: {
      display: block ? 'flex' : 'inline-flex',
      width: block ? '100%' : undefined,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      borderRadius: 'var(--radius-pill)',
      fontFamily: 'var(--font-ui)',
      letterSpacing: '-0.1px',
      cursor: disabled ? 'default' : 'pointer',
      opacity: disabled ? 0.35 : 1,
      transform: down && !disabled ? 'scale(var(--press-scale))' : 'none',
      transition: 'transform var(--dur-instant) var(--ease-out), background var(--dur-fast) var(--ease-out)',
      ...SIZES[size],
      ...VARIANTS[variant],
      ...style
    }
  }, rest), icon ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: size === 'lg' ? 20 : 18
  }) : null, /*#__PURE__*/React.createElement("span", null, children), iconRight ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: iconRight,
    size: size === 'lg' ? 20 : 18
  }) : null);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/content/TrendCard.jsx
try { (() => {
function TrendCard({
  thumbnail,
  platform = 'tiktok',
  handle,
  views,
  hook,
  whyItWorks,
  format,
  variant = 'feed',
  onWatch,
  onTurnIntoTask,
  actionLabel = 'Turn into task',
  style
}) {
  const embedded = variant === 'embedded';
  return /*#__PURE__*/React.createElement("article", {
    style: {
      background: embedded ? 'var(--blue-50)' : 'var(--surface-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: 16,
      display: 'flex',
      gap: 14,
      boxShadow: embedded ? 'none' : 'var(--shadow-card)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 84,
      flex: '0 0 84px',
      aspectRatio: '9 / 16',
      borderRadius: 14,
      background: thumbnail ? `url(${thumbnail}) center / cover no-repeat` : 'var(--fill-quiet)',
      boxShadow: 'var(--shadow-media)',
      border: '3px solid var(--white)',
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
      paddingBottom: 6
    }
  }, !thumbnail ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "play",
    size: 20,
    color: "var(--slate-300)",
    style: {
      margin: 'auto'
    }
  }) : null), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 7,
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      fontSize: 'var(--text-chip)',
      fontWeight: 'var(--weight-semibold)',
      color: 'var(--text-subtle)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: platform === 'instagram' ? 'at-sign' : 'music-2',
    size: 14
  }), platform === 'instagram' ? 'Instagram' : 'TikTok', handle ? ` · @${handle}` : '', views ? ` · ${views}` : ''), format ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      alignSelf: 'flex-start',
      padding: '5px 10px',
      borderRadius: 'var(--radius-pill)',
      background: 'var(--fill-quiet)',
      color: 'var(--text-muted)',
      fontSize: 'var(--text-chip)',
      fontWeight: 'var(--weight-bold)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: format === 'slideshow' || format === 'photo_carousel' ? 'images' : 'video',
    size: 13
  }), format === 'slideshow' || format === 'photo_carousel' ? 'Slideshow' : 'Reel') : null, hook ? /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 'var(--text-action)',
      fontWeight: 'var(--weight-bold)',
      lineHeight: 'var(--leading-snug)',
      color: 'var(--text-strong)'
    }
  }, hook) : null, whyItWorks ? /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 'var(--text-meta)',
      lineHeight: 'var(--leading-body)',
      color: 'var(--text-muted)'
    }
  }, embedded ? /*#__PURE__*/React.createElement("strong", {
    style: {
      color: 'var(--text-strong)'
    }
  }, "Why it works. ") : null, whyItWorks) : null, !embedded ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      marginTop: 4
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Button, {
    variant: "outline",
    size: "sm",
    onClick: onWatch
  }, "Watch"), /*#__PURE__*/React.createElement(__ds_scope.Button, {
    size: "sm",
    onClick: onTurnIntoTask
  }, actionLabel)) : null));
}
Object.assign(__ds_scope, { TrendCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/TrendCard.jsx", error: String((e && e.message) || e) }); }

// components/feedback/EmptyState.jsx
try { (() => {
function EmptyState({
  icon = 'inbox',
  title,
  body,
  actionLabel,
  onAction,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      gap: 12,
      padding: '40px 24px',
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 72,
      height: 72,
      borderRadius: 999,
      background: 'var(--blue-100)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 30,
    color: "var(--blue-500)"
  })), /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontFamily: 'var(--font-display)',
      fontSize: 'var(--text-card)',
      fontWeight: 'var(--weight-bold)',
      color: 'var(--text-strong)',
      letterSpacing: '-0.2px'
    }
  }, title), body ? /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      maxWidth: 300,
      fontSize: 'var(--text-body-sm)',
      lineHeight: 'var(--leading-body)',
      color: 'var(--text-muted)'
    }
  }, body) : null, actionLabel ? /*#__PURE__*/React.createElement(__ds_scope.Button, {
    size: "md",
    variant: "tint",
    onClick: onAction,
    style: {
      marginTop: 4
    }
  }, actionLabel) : null);
}
Object.assign(__ds_scope, { EmptyState });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/EmptyState.jsx", error: String((e && e.message) || e) }); }

// components/feedback/ProgressBar.jsx
try { (() => {
function ProgressBar({
  step,
  total,
  variant = 'dots',
  style
}) {
  const clamped = Math.max(0, Math.min(step, total - 1));
  if (variant === 'bar') {
    const fraction = total <= 1 ? 1 : clamped / (total - 1);
    return /*#__PURE__*/React.createElement("div", {
      style: {
        height: 6,
        borderRadius: 3,
        background: 'var(--line)',
        overflow: 'hidden',
        flex: 1,
        ...style
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: `${fraction * 100}%`,
        height: '100%',
        borderRadius: 3,
        background: 'var(--accent)',
        transition: 'width var(--dur-base) var(--ease-out)'
      }
    }));
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      ...style
    }
  }, Array.from({
    length: total
  }).map((_, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      height: 4,
      borderRadius: 999,
      width: i === clamped ? 34 : 14,
      background: i === clamped ? 'var(--accent)' : 'var(--line-strong)',
      transition: 'width var(--dur-base) var(--ease-out), background var(--dur-base) var(--ease-out)'
    }
  })));
}
Object.assign(__ds_scope, { ProgressBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/ProgressBar.jsx", error: String((e && e.message) || e) }); }

// components/feedback/StatusChip.jsx
try { (() => {
const STATUS = {
  assigned: {
    label: 'To do',
    fg: 'var(--status-todo-fg)',
    bg: 'var(--status-todo-bg)'
  },
  recorded: {
    label: 'Recorded',
    fg: 'var(--slate-500)',
    bg: 'var(--fill-quiet)'
  },
  submitted: {
    label: 'In review',
    fg: 'var(--status-pending-fg)',
    bg: 'var(--status-pending-bg)'
  },
  changes_requested: {
    label: 'Changes needed',
    fg: 'var(--status-pending-fg)',
    bg: 'var(--status-pending-bg)'
  },
  approved: {
    label: 'Approved',
    fg: 'var(--status-done-fg)',
    bg: 'var(--status-done-bg)'
  },
  posted: {
    label: 'Posted',
    fg: 'var(--white)',
    bg: 'var(--green)'
  }
};
function StatusChip({
  status,
  label,
  style
}) {
  const s = STATUS[status] ?? STATUS.assigned;
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      alignSelf: 'flex-start',
      padding: '7px 12px',
      borderRadius: 'var(--radius-pill)',
      background: s.bg,
      color: s.fg,
      fontSize: 'var(--text-chip)',
      fontWeight: 'var(--weight-bold)',
      lineHeight: 1,
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      width: 6,
      height: 6,
      borderRadius: 999,
      background: 'currentColor',
      opacity: status === 'posted' ? 1 : 0.75
    }
  }), label ?? s.label);
}
Object.assign(__ds_scope, { StatusChip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/StatusChip.jsx", error: String((e && e.message) || e) }); }

// components/content/TaskCard.jsx
try { (() => {
const FORMATS = {
  video: {
    icon: 'video',
    label: 'Video'
  },
  reel: {
    icon: 'video',
    label: 'Reel'
  },
  photo_carousel: {
    icon: 'images',
    label: 'Photo carousel'
  },
  slideshow: {
    icon: 'images',
    label: 'Slideshow'
  }
};
function TaskCard({
  title,
  status = 'assigned',
  format = 'video',
  due,
  assignee,
  time,
  hasScript = false,
  actionLabel,
  onAction,
  onSwap,
  swapLabel = 'Swap',
  onClick,
  variant = 'today',
  style
}) {
  const compact = variant === 'calendar';
  const hero = variant === 'hero';
  const f = FORMATS[format] ?? FORMATS.video;
  const meta = [assignee, time ? `Posts ${time}` : null, due ? `Due ${due}` : null].filter(Boolean).join(' · ');
  return /*#__PURE__*/React.createElement("article", {
    onClick: onClick,
    style: {
      background: 'var(--surface-card)',
      border: '1px solid var(--border)',
      borderRadius: compact ? 'var(--radius-md)' : hero ? 'var(--radius-2xl)' : 'var(--radius-lg)',
      padding: compact ? 16 : hero ? 20 : 'var(--card-pad)',
      display: 'flex',
      flexDirection: 'column',
      gap: hero ? 12 : 10,
      boxShadow: compact ? 'none' : hero ? 'var(--shadow-raised)' : 'var(--shadow-card)',
      cursor: onClick ? 'pointer' : 'default',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.StatusChip, {
    status: status
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      fontSize: 'var(--text-chip)',
      fontWeight: 'var(--weight-semibold)',
      color: 'var(--text-subtle)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: f.icon,
    size: 15
  }), f.label), hasScript ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      fontSize: 'var(--text-chip)',
      fontWeight: 'var(--weight-semibold)',
      color: 'var(--text-brand)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "mic",
    size: 15
  }), "Script ready") : null), /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontFamily: 'var(--font-display)',
      fontSize: compact ? 'var(--text-action)' : hero ? 'var(--text-title-sm)' : 'var(--text-card-lg)',
      fontWeight: 'var(--weight-bold)',
      lineHeight: hero ? 'var(--leading-title)' : 'var(--leading-snug)',
      letterSpacing: hero ? 'var(--tracking-title)' : '-0.3px',
      color: 'var(--text-strong)'
    }
  }, title), meta ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-meta)',
      color: 'var(--text-muted)'
    }
  }, meta) : null, actionLabel || onSwap ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      alignItems: 'center',
      marginTop: 4
    }
  }, actionLabel ? /*#__PURE__*/React.createElement(__ds_scope.Button, {
    size: hero ? 'lg' : 'md',
    icon: f.icon,
    onClick: onAction,
    style: {
      flex: 1
    }
  }, actionLabel) : null, onSwap ? /*#__PURE__*/React.createElement(__ds_scope.Button, {
    size: hero ? 'lg' : 'md',
    variant: "tint",
    icon: "rotate-ccw",
    onClick: onSwap,
    style: actionLabel ? undefined : {
      flex: 1
    }
  }, swapLabel) : null) : null);
}
Object.assign(__ds_scope, { TaskCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/TaskCard.jsx", error: String((e && e.message) || e) }); }

// components/forms/Chip.jsx
try { (() => {
function Chip({
  label,
  selected = false,
  onClick,
  icon,
  style
}) {
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClick,
    "aria-pressed": selected,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 7,
      padding: '12px 16px',
      borderRadius: 'var(--radius-pill)',
      cursor: 'pointer',
      background: selected ? 'var(--accent)' : 'var(--white)',
      border: `1.5px solid ${selected ? 'var(--accent)' : 'var(--border-strong)'}`,
      color: selected ? 'var(--white)' : 'var(--text-strong)',
      fontSize: 'var(--text-body-sm)',
      fontWeight: 'var(--weight-bold)',
      transition: 'background var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out)',
      ...style
    }
  }, icon ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 16
  }) : null, label);
}
Object.assign(__ds_scope, { Chip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Chip.jsx", error: String((e && e.message) || e) }); }

// components/forms/OptionCard.jsx
try { (() => {
function OptionCard({
  label,
  hint,
  icon,
  selected = false,
  onClick,
  style
}) {
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClick,
    "aria-pressed": selected,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      width: '100%',
      textAlign: 'left',
      padding: '18px 20px',
      borderRadius: 'var(--radius-md)',
      border: 'none',
      cursor: 'pointer',
      background: selected ? 'var(--blue-100)' : 'var(--fill-quiet)',
      transition: 'background var(--dur-fast) var(--ease-out)',
      ...style
    }
  }, icon ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 22,
    color: selected ? 'var(--blue-600)' : 'var(--slate-400)'
  }) : null, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 3,
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-action)',
      fontWeight: 'var(--weight-bold)',
      color: selected ? 'var(--blue-700)' : 'var(--text-strong)'
    }
  }, label), hint ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-meta)',
      color: 'var(--text-muted)'
    }
  }, hint) : null), selected ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "check",
    size: 20,
    color: "var(--blue-600)"
  }) : null);
}
Object.assign(__ds_scope, { OptionCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/OptionCard.jsx", error: String((e && e.message) || e) }); }

// components/forms/Stepper.jsx
try { (() => {
function RoundBtn({
  icon,
  onClick,
  disabled
}) {
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClick,
    disabled: disabled,
    "aria-label": icon,
    style: {
      width: 56,
      height: 56,
      borderRadius: 999,
      border: '1.5px solid var(--border-strong)',
      background: 'var(--white)',
      cursor: disabled ? 'default' : 'pointer',
      opacity: disabled ? 0.35 : 1,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 22,
    color: "var(--ink)"
  }));
}
function Stepper({
  value,
  onChange,
  min = 1,
  max = 14,
  unit = 'per week',
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 16,
      padding: '8px 4px',
      ...style
    }
  }, /*#__PURE__*/React.createElement(RoundBtn, {
    icon: "x",
    onClick: () => onChange && onChange(Math.max(min, value - 1)),
    disabled: value <= min
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 'var(--text-hero)',
      fontWeight: 'var(--weight-heavy)',
      letterSpacing: 'var(--tracking-hero)',
      color: 'var(--text-strong)',
      lineHeight: 1
    }
  }, value), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 6,
      fontSize: 'var(--text-body-sm)',
      color: 'var(--text-muted)'
    }
  }, unit)), /*#__PURE__*/React.createElement(RoundBtn, {
    icon: "plus",
    onClick: () => onChange && onChange(Math.min(max, value + 1)),
    disabled: value >= max
  }));
}
Object.assign(__ds_scope, { Stepper });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Stepper.jsx", error: String((e && e.message) || e) }); }

// components/forms/TextField.jsx
try { (() => {
const {
  useState
} = React;
function TextField({
  label,
  value,
  onChange,
  placeholder,
  multiline = false,
  rows = 3,
  type = 'text',
  hint,
  disabled = false,
  style
}) {
  const [focused, setFocused] = useState(false);
  const shared = {
    width: '100%',
    background: 'var(--white)',
    border: `1.5px solid ${focused ? 'var(--accent)' : 'var(--border-strong)'}`,
    boxShadow: focused ? 'var(--ring-focus)' : 'none',
    borderRadius: 'var(--radius-md)',
    padding: '16px',
    fontFamily: 'var(--font-ui)',
    fontSize: multiline ? 'var(--text-body-sm)' : 'var(--text-card)',
    lineHeight: 'var(--leading-body)',
    color: 'var(--text-body)',
    outline: 'none',
    transition: 'border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out)',
    opacity: disabled ? 0.5 : 1,
    resize: 'none'
  };
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      ...style
    }
  }, label ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-meta)',
      fontWeight: 'var(--weight-semibold)',
      color: 'var(--text-strong)'
    }
  }, label) : null, multiline ? /*#__PURE__*/React.createElement("textarea", {
    rows: rows,
    value: value,
    placeholder: placeholder,
    disabled: disabled,
    onChange: e => onChange && onChange(e.target.value),
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
    style: {
      ...shared,
      minHeight: 80
    }
  }) : /*#__PURE__*/React.createElement("input", {
    type: type,
    value: value,
    placeholder: placeholder,
    disabled: disabled,
    onChange: e => onChange && onChange(e.target.value),
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
    style: shared
  }), hint ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-chip)',
      color: 'var(--text-subtle)'
    }
  }, hint) : null);
}
Object.assign(__ds_scope, { TextField });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/TextField.jsx", error: String((e && e.message) || e) }); }

// components/forms/ToneSlider.jsx
try { (() => {
function ToneSlider({
  tones,
  value = 0,
  onChange,
  caption,
  style
}) {
  const max = Math.max(tones.length - 1, 1);
  const pct = value / max * 100;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: 'var(--text-chip)',
      fontWeight: 'var(--weight-bold)',
      color: 'var(--text-subtle)'
    }
  }, /*#__PURE__*/React.createElement("span", null, tones[0]), /*#__PURE__*/React.createElement("span", null, tones[tones.length - 1])), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      height: 28,
      display: 'flex',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      height: 6,
      borderRadius: 3,
      background: 'var(--line)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      width: `${pct}%`,
      height: 6,
      borderRadius: 3,
      background: 'var(--accent)',
      transition: 'width var(--dur-base) var(--ease-out)'
    }
  }), /*#__PURE__*/React.createElement("input", {
    type: "range",
    min: 0,
    max: max,
    step: 1,
    value: value,
    onChange: e => onChange && onChange(Number(e.target.value)),
    "aria-label": "Tone",
    style: {
      position: 'absolute',
      inset: 0,
      width: '100%',
      margin: 0,
      opacity: 0,
      cursor: 'pointer'
    }
  }), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      position: 'absolute',
      left: `calc(${pct}% - 14px)`,
      width: 28,
      height: 28,
      borderRadius: 999,
      background: 'var(--white)',
      boxShadow: 'var(--shadow-raised)',
      border: '2px solid var(--accent)',
      transition: 'left var(--dur-base) var(--ease-out)'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-action)',
      fontWeight: 'var(--weight-bold)',
      color: 'var(--blue-700)'
    }
  }, tones[value]), caption ? /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--blue-50)',
      border: '1px solid var(--line)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--card-pad)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-label)',
      fontWeight: 'var(--weight-bold)',
      letterSpacing: 'var(--tracking-label)',
      textTransform: 'uppercase',
      color: 'var(--text-subtle)',
      marginBottom: 8
    }
  }, "Caption preview"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 'var(--text-body)',
      lineHeight: 'var(--leading-body)',
      color: 'var(--text-body)'
    }
  }, caption)) : null);
}
Object.assign(__ds_scope, { ToneSlider });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/ToneSlider.jsx", error: String((e && e.message) || e) }); }

// components/navigation/TabBar.jsx
try { (() => {
function TabBar({
  items,
  active = 0,
  onSelect,
  style
}) {
  return /*#__PURE__*/React.createElement("nav", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      gap: 4,
      padding: 8,
      borderRadius: 'var(--radius-pill)',
      background: 'var(--glass)',
      backdropFilter: 'blur(18px)',
      WebkitBackdropFilter: 'blur(18px)',
      border: '1px solid var(--border)',
      boxShadow: 'var(--shadow-float)',
      ...style
    }
  }, items.map((item, i) => {
    const on = i === active;
    return /*#__PURE__*/React.createElement("button", {
      key: item.label,
      type: "button",
      "aria-label": item.label,
      "aria-current": on ? 'page' : undefined,
      onClick: () => onSelect && onSelect(i),
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 3,
        flex: 1,
        padding: '10px 6px',
        borderRadius: 'var(--radius-pill)',
        border: 'none',
        cursor: 'pointer',
        background: on ? 'var(--blue-100)' : 'transparent',
        transition: 'background var(--dur-fast) var(--ease-out)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        position: 'relative',
        display: 'inline-flex'
      }
    }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: item.icon,
      size: 22,
      color: on ? 'var(--blue-600)' : 'var(--slate-400)'
    }), item.badge ? /*#__PURE__*/React.createElement("span", {
      style: {
        position: 'absolute',
        top: -4,
        right: -7,
        minWidth: 16,
        height: 16,
        padding: '0 4px',
        borderRadius: 999,
        background: 'var(--accent)',
        color: 'var(--white)',
        fontSize: 10,
        fontWeight: 'var(--weight-heavy)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, item.badge) : null), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        fontWeight: 'var(--weight-bold)',
        color: on ? 'var(--blue-700)' : 'var(--text-subtle)'
      }
    }, item.label));
  }));
}
Object.assign(__ds_scope, { TabBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/TabBar.jsx", error: String((e && e.message) || e) }); }

// design_handoff_landing_page/reference/ios-frame.jsx
try { (() => {
// @ds-adherence-ignore -- omelette starter scaffold (raw elements/hex/px by design)
// Copied omelette starter. Re-running copy_starter_component with this kind overwrites this file with the latest version (page content is unaffected).

/* BEGIN USAGE */
// iOS.jsx — Simplified iOS 26 (Liquid Glass) device frame
// Based on the iOS 26 UI Kit + Figma status bar spec. No assets, no deps.
// Exports (to window): IOSDevice, IOSStatusBar, IOSNavBar, IOSGlassPill, IOSList, IOSListRow, IOSKeyboard
//
// Usage — wrap your screen content in <IOSDevice> to get the bezel, status bar
// and home indicator (props: title, dark, keyboard):
//
//   <IOSDevice title="Settings">
//     ...your screen content...
//   </IOSDevice>
//   <IOSDevice dark title="Search" keyboard>…</IOSDevice>
/* END USAGE */

// ─────────────────────────────────────────────────────────────
// Status bar
// ─────────────────────────────────────────────────────────────
function IOSStatusBar({
  dark = false,
  time = '9:41'
}) {
  const c = dark ? '#fff' : '#000';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 154,
      alignItems: 'center',
      justifyContent: 'center',
      padding: '21px 24px 19px',
      boxSizing: 'border-box',
      position: 'relative',
      zIndex: 20,
      width: '100%'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      height: 22,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 1.5
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: '-apple-system, "SF Pro", system-ui',
      fontWeight: 590,
      fontSize: 17,
      lineHeight: '22px',
      color: c
    }
  }, time)), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      height: 22,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 7,
      paddingTop: 1,
      paddingRight: 1
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "19",
    height: "12",
    viewBox: "0 0 19 12"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "0",
    y: "7.5",
    width: "3.2",
    height: "4.5",
    rx: "0.7",
    fill: c
  }), /*#__PURE__*/React.createElement("rect", {
    x: "4.8",
    y: "5",
    width: "3.2",
    height: "7",
    rx: "0.7",
    fill: c
  }), /*#__PURE__*/React.createElement("rect", {
    x: "9.6",
    y: "2.5",
    width: "3.2",
    height: "9.5",
    rx: "0.7",
    fill: c
  }), /*#__PURE__*/React.createElement("rect", {
    x: "14.4",
    y: "0",
    width: "3.2",
    height: "12",
    rx: "0.7",
    fill: c
  })), /*#__PURE__*/React.createElement("svg", {
    width: "17",
    height: "12",
    viewBox: "0 0 17 12"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M8.5 3.2C10.8 3.2 12.9 4.1 14.4 5.6L15.5 4.5C13.7 2.7 11.2 1.5 8.5 1.5C5.8 1.5 3.3 2.7 1.5 4.5L2.6 5.6C4.1 4.1 6.2 3.2 8.5 3.2Z",
    fill: c
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8.5 6.8C9.9 6.8 11.1 7.3 12 8.2L13.1 7.1C11.8 5.9 10.2 5.1 8.5 5.1C6.8 5.1 5.2 5.9 3.9 7.1L5 8.2C5.9 7.3 7.1 6.8 8.5 6.8Z",
    fill: c
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "8.5",
    cy: "10.5",
    r: "1.5",
    fill: c
  })), /*#__PURE__*/React.createElement("svg", {
    width: "27",
    height: "13",
    viewBox: "0 0 27 13"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "0.5",
    y: "0.5",
    width: "23",
    height: "12",
    rx: "3.5",
    stroke: c,
    strokeOpacity: "0.35",
    fill: "none"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "2",
    y: "2",
    width: "20",
    height: "9",
    rx: "2",
    fill: c
  }), /*#__PURE__*/React.createElement("path", {
    d: "M25 4.5V8.5C25.8 8.2 26.5 7.2 26.5 6.5C26.5 5.8 25.8 4.8 25 4.5Z",
    fill: c,
    fillOpacity: "0.4"
  }))));
}

// ─────────────────────────────────────────────────────────────
// Liquid glass pill — blur + tint + shine
// ─────────────────────────────────────────────────────────────
function IOSGlassPill({
  children,
  dark = false,
  style = {}
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: 44,
      minWidth: 44,
      borderRadius: 9999,
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: dark ? '0 2px 6px rgba(0,0,0,0.35), 0 6px 16px rgba(0,0,0,0.2)' : '0 1px 3px rgba(0,0,0,0.07), 0 3px 10px rgba(0,0,0,0.06)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      borderRadius: 9999,
      backdropFilter: 'blur(12px) saturate(180%)',
      WebkitBackdropFilter: 'blur(12px) saturate(180%)',
      background: dark ? 'rgba(120,120,128,0.28)' : 'rgba(255,255,255,0.5)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      borderRadius: 9999,
      boxShadow: dark ? 'inset 1.5px 1.5px 1px rgba(255,255,255,0.15), inset -1px -1px 1px rgba(255,255,255,0.08)' : 'inset 1.5px 1.5px 1px rgba(255,255,255,0.7), inset -1px -1px 1px rgba(255,255,255,0.4)',
      border: dark ? '0.5px solid rgba(255,255,255,0.15)' : '0.5px solid rgba(0,0,0,0.06)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      zIndex: 1,
      display: 'flex',
      alignItems: 'center',
      padding: '0 4px'
    }
  }, children));
}

// ─────────────────────────────────────────────────────────────
// Navigation bar — glass pills + large title
// ─────────────────────────────────────────────────────────────
function IOSNavBar({
  title = 'Title',
  dark = false,
  trailingIcon = true
}) {
  const muted = dark ? 'rgba(255,255,255,0.6)' : '#404040';
  const text = dark ? '#fff' : '#000';
  const pillIcon = content => /*#__PURE__*/React.createElement(IOSGlassPill, {
    dark: dark
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 36,
      height: 36,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, content));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      paddingTop: 62,
      paddingBottom: 10,
      position: 'relative',
      zIndex: 5
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px'
    }
  }, pillIcon(/*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "20",
    viewBox: "0 0 12 20",
    fill: "none",
    style: {
      marginLeft: -1
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M10 2L2 10l8 8",
    stroke: muted,
    strokeWidth: "2.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }))), trailingIcon && pillIcon(/*#__PURE__*/React.createElement("svg", {
    width: "22",
    height: "6",
    viewBox: "0 0 22 6"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "3",
    cy: "3",
    r: "2.5",
    fill: muted
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "11",
    cy: "3",
    r: "2.5",
    fill: muted
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "19",
    cy: "3",
    r: "2.5",
    fill: muted
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 16px',
      fontFamily: '-apple-system, system-ui',
      fontSize: 34,
      fontWeight: 700,
      lineHeight: '41px',
      color: text,
      letterSpacing: 0.4
    }
  }, title));
}

// ─────────────────────────────────────────────────────────────
// Grouped list (inset card, r:26) + row (52px)
// ─────────────────────────────────────────────────────────────
function IOSListRow({
  title,
  detail,
  icon,
  chevron = true,
  isLast = false,
  dark = false
}) {
  const text = dark ? '#fff' : '#000';
  const sec = dark ? 'rgba(235,235,245,0.6)' : 'rgba(60,60,67,0.6)';
  const ter = dark ? 'rgba(235,235,245,0.3)' : 'rgba(60,60,67,0.3)';
  const sep = dark ? 'rgba(84,84,88,0.65)' : 'rgba(60,60,67,0.12)';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      minHeight: 52,
      padding: '0 16px',
      position: 'relative',
      fontFamily: '-apple-system, system-ui',
      fontSize: 17,
      letterSpacing: -0.43
    }
  }, icon && /*#__PURE__*/React.createElement("div", {
    style: {
      width: 30,
      height: 30,
      borderRadius: 7,
      background: icon,
      marginRight: 12,
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      color: text
    }
  }, title), detail && /*#__PURE__*/React.createElement("span", {
    style: {
      color: sec,
      marginRight: 6
    }
  }, detail), chevron && /*#__PURE__*/React.createElement("svg", {
    width: "8",
    height: "14",
    viewBox: "0 0 8 14",
    style: {
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M1 1l6 6-6 6",
    stroke: ter,
    strokeWidth: "2",
    fill: "none",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  })), !isLast && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      left: icon ? 58 : 16,
      height: 0.5,
      background: sep
    }
  }));
}
function IOSList({
  header,
  children,
  dark = false
}) {
  const hc = dark ? 'rgba(235,235,245,0.6)' : 'rgba(60,60,67,0.6)';
  const bg = dark ? '#1C1C1E' : '#fff';
  return /*#__PURE__*/React.createElement("div", null, header && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: '-apple-system, system-ui',
      fontSize: 13,
      color: hc,
      textTransform: 'uppercase',
      padding: '8px 36px 6px',
      letterSpacing: -0.08
    }
  }, header), /*#__PURE__*/React.createElement("div", {
    style: {
      background: bg,
      borderRadius: 26,
      margin: '0 16px',
      overflow: 'hidden'
    }
  }, children));
}

// ─────────────────────────────────────────────────────────────
// Device frame
// ─────────────────────────────────────────────────────────────
function IOSDevice({
  children,
  width = 402,
  height = 874,
  dark = false,
  title,
  keyboard = false
}) {
  return (
    /*#__PURE__*/
    // data-om-starter: inert presence marker — Claude Design's starter-usage
    // probe reads it; it renders nothing. Keep it on this root element.
    React.createElement("div", {
      "data-om-starter": "ios-frame",
      style: {
        width,
        height,
        borderRadius: 48,
        overflow: 'hidden',
        position: 'relative',
        background: dark ? '#000' : '#F2F2F7',
        boxShadow: '0 40px 80px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.12)',
        fontFamily: '-apple-system, system-ui, sans-serif',
        WebkitFontSmoothing: 'antialiased'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        top: 11,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 126,
        height: 37,
        borderRadius: 24,
        background: '#000',
        zIndex: 50
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10
      }
    }, /*#__PURE__*/React.createElement(IOSStatusBar, {
      dark: dark
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }
    }, title !== undefined && /*#__PURE__*/React.createElement(IOSNavBar, {
      title: title,
      dark: dark
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        overflow: 'auto'
      }
    }, children), keyboard && /*#__PURE__*/React.createElement(IOSKeyboard, {
      dark: dark
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 60,
        height: 34,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-end',
        paddingBottom: 8,
        pointerEvents: 'none'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 139,
        height: 5,
        borderRadius: 100,
        background: dark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.25)'
      }
    })))
  );
}

// ─────────────────────────────────────────────────────────────
// Keyboard — iOS 26 liquid glass
// ─────────────────────────────────────────────────────────────
function IOSKeyboard({
  dark = false
}) {
  const glyph = dark ? 'rgba(255,255,255,0.7)' : '#595959';
  const sugg = dark ? 'rgba(255,255,255,0.6)' : '#333';
  const keyBg = dark ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.85)';

  // special-key icons
  const icons = {
    shift: /*#__PURE__*/React.createElement("svg", {
      width: "19",
      height: "17",
      viewBox: "0 0 19 17"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M9.5 1L1 9.5h4.5V16h8V9.5H18L9.5 1z",
      fill: glyph
    })),
    del: /*#__PURE__*/React.createElement("svg", {
      width: "23",
      height: "17",
      viewBox: "0 0 23 17"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M7 1h13a2 2 0 012 2v11a2 2 0 01-2 2H7l-6-7.5L7 1z",
      fill: "none",
      stroke: glyph,
      strokeWidth: "1.6",
      strokeLinejoin: "round"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M10 5l7 7M17 5l-7 7",
      stroke: glyph,
      strokeWidth: "1.6",
      strokeLinecap: "round"
    })),
    ret: /*#__PURE__*/React.createElement("svg", {
      width: "20",
      height: "14",
      viewBox: "0 0 20 14"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M18 1v6H4m0 0l4-4M4 7l4 4",
      fill: "none",
      stroke: "#fff",
      strokeWidth: "1.8",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }))
  };
  const key = (content, {
    w,
    flex,
    ret,
    fs = 25,
    k
  } = {}) => /*#__PURE__*/React.createElement("div", {
    key: k,
    style: {
      height: 42,
      borderRadius: 8.5,
      flex: flex ? 1 : undefined,
      width: w,
      minWidth: 0,
      background: ret ? '#08f' : keyBg,
      boxShadow: '0 1px 0 rgba(0,0,0,0.075)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '-apple-system, "SF Compact", system-ui',
      fontSize: fs,
      fontWeight: 458,
      color: ret ? '#fff' : glyph
    }
  }, content);
  const row = (keys, pad = 0) => /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6.5,
      justifyContent: 'center',
      padding: `0 ${pad}px`
    }
  }, keys.map(l => key(l, {
    flex: true,
    k: l
  })));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      zIndex: 15,
      borderRadius: 27,
      overflow: 'hidden',
      padding: '11px 0 2px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      boxShadow: dark ? '0 -2px 20px rgba(0,0,0,0.09)' : '0 -1px 6px rgba(0,0,0,0.018), 0 -3px 20px rgba(0,0,0,0.012)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      borderRadius: 27,
      backdropFilter: 'blur(12px) saturate(180%)',
      WebkitBackdropFilter: 'blur(12px) saturate(180%)',
      background: dark ? 'rgba(120,120,128,0.14)' : 'rgba(255,255,255,0.25)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      borderRadius: 27,
      boxShadow: dark ? 'inset 1.5px 1.5px 1px rgba(255,255,255,0.15)' : 'inset 1.5px 1.5px 1px rgba(255,255,255,0.7), inset -1px -1px 1px rgba(255,255,255,0.4)',
      border: dark ? '0.5px solid rgba(255,255,255,0.15)' : '0.5px solid rgba(0,0,0,0.06)',
      pointerEvents: 'none'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 20,
      alignItems: 'center',
      padding: '8px 22px 13px',
      width: '100%',
      boxSizing: 'border-box',
      position: 'relative'
    }
  }, ['"The"', 'the', 'to'].map((w, i) => /*#__PURE__*/React.createElement(React.Fragment, {
    key: i
  }, i > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      width: 1,
      height: 25,
      background: '#ccc',
      opacity: 0.3
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      textAlign: 'center',
      fontFamily: '-apple-system, system-ui',
      fontSize: 17,
      color: sugg,
      letterSpacing: -0.43,
      lineHeight: '22px'
    }
  }, w)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 13,
      padding: '0 6.5px',
      width: '100%',
      boxSizing: 'border-box',
      position: 'relative'
    }
  }, row(['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p']), row(['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'], 20), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 14.25,
      alignItems: 'center'
    }
  }, key(icons.shift, {
    w: 45,
    k: 'shift'
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6.5,
      flex: 1
    }
  }, ['z', 'x', 'c', 'v', 'b', 'n', 'm'].map(l => key(l, {
    flex: true,
    k: l
  }))), key(icons.del, {
    w: 45,
    k: 'del'
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      alignItems: 'center'
    }
  }, key('ABC', {
    w: 92.25,
    fs: 18,
    k: 'abc'
  }), key('', {
    flex: true,
    k: 'space'
  }), key(icons.ret, {
    w: 92.25,
    ret: true,
    k: 'ret'
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 56,
      width: '100%',
      position: 'relative'
    }
  }));
}
Object.assign(window, {
  IOSDevice,
  IOSStatusBar,
  IOSNavBar,
  IOSGlassPill,
  IOSList,
  IOSListRow,
  IOSKeyboard
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "design_handoff_landing_page/reference/ios-frame.jsx", error: String((e && e.message) || e) }); }

// redesigns/admin/SettingsRedesign.jsx
try { (() => {
/* Settings, redesigned. Fits 390x844 with zero scroll. Account switching sits
   at the top; content is toggled between Campaign managers and Company Brain;
   support + sign out are compact circles in the header. */

function CircleBtn({
  icon,
  tone = 'plain',
  label,
  onClick
}) {
  const {
    Icon
  } = window.NoniDesignSystem_710e43;
  const danger = tone === 'danger';
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClick,
    "aria-label": label,
    title: label,
    style: {
      width: 36,
      height: 36,
      flex: '0 0 auto',
      borderRadius: 999,
      border: 'none',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: danger ? 'var(--danger-soft)' : 'var(--white)',
      boxShadow: 'var(--shadow-card)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 17,
    color: danger ? 'var(--danger)' : 'var(--slate-500)'
  }));
}
function SwitchAccountsCard({
  onSwitch
}) {
  const {
    Icon
  } = window.NoniDesignSystem_710e43;
  return /*#__PURE__*/React.createElement(Card, {
    pad: 0,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '12px 14px'
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: "Founders",
    size: 40
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: '700 16px var(--font-display)',
      letterSpacing: '-0.3px',
      color: 'var(--ink)'
    }
  }, "Founders"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 2,
      font: '600 12px var(--font-ui)',
      color: 'var(--slate-400)'
    }
  }, "Campaign manager")), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onSwitch,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '9px 13px',
      borderRadius: 999,
      border: 'none',
      cursor: 'pointer',
      background: 'var(--blue-100)',
      color: 'var(--blue-700)',
      font: '700 13px var(--font-ui)',
      whiteSpace: 'nowrap'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "chevrons-up-down",
    size: 14
  }), "Switch accounts"));
}
function ManagersPane() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(SectionLabel, null, "Campaign managers"), /*#__PURE__*/React.createElement(Card, {
    pad: 0,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '10px 12px'
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: "Founders",
    size: 26,
    tone: "quiet"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0,
      font: '600 13px var(--font-ui)',
      color: 'var(--ink)'
    }
  }, "Founders"), /*#__PURE__*/React.createElement(TypeChip, null, "Not connected")));
}
function BrainPane() {
  return null;
}
function SwitchSheet({
  onClose
}) {
  const {
    Icon
  } = window.NoniDesignSystem_710e43;
  const Row = ({
    icon,
    label,
    sub,
    on
  }) => /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClose,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      width: '100%',
      padding: '14px',
      marginBottom: 8,
      borderRadius: 'var(--radius-lg)',
      border: 'none',
      cursor: 'pointer',
      textAlign: 'left',
      background: on ? 'var(--blue-100)' : 'var(--fill-quiet)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 19,
    color: on ? 'var(--blue-700)' : 'var(--slate-500)'
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      font: '700 15px var(--font-ui)',
      color: on ? 'var(--blue-700)' : 'var(--ink)'
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      marginTop: 2,
      font: '600 12px var(--font-ui)',
      color: 'var(--slate-400)'
    }
  }, sub)), on ? /*#__PURE__*/React.createElement(Icon, {
    name: "circle-check-big",
    size: 18,
    color: "var(--blue-700)"
  }) : null);
  return /*#__PURE__*/React.createElement(Sheet, {
    title: "Switch accounts",
    subtitle: "Same login, two sides of Noni.",
    onClose: onClose,
    maxHeight: "46%"
  }, /*#__PURE__*/React.createElement(Row, {
    icon: "chart-column",
    label: "Campaign manager",
    sub: "Founders \xB7 reviews and approves",
    on: true
  }), /*#__PURE__*/React.createElement(Row, {
    icon: "video",
    label: "Creator",
    sub: "Record and post what you owe"
  }));
}
function SettingsRedesign() {
  const [sheet, setSheet] = React.useState(false);
  return /*#__PURE__*/React.createElement(Phone, null, /*#__PURE__*/React.createElement(AdminScreen, {
    bottom: 0,
    gap: 14
  }, /*#__PURE__*/React.createElement(AdminHeader, {
    title: "Settings",
    right: /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 8,
        paddingTop: 2
      }
    }, /*#__PURE__*/React.createElement(CircleBtn, {
      icon: "inbox",
      label: "Contact support"
    }), /*#__PURE__*/React.createElement(CircleBtn, {
      icon: "log-out",
      tone: "danger",
      label: "Log out"
    }))
  }), /*#__PURE__*/React.createElement(SwitchAccountsCard, {
    onSwitch: () => setSheet(true)
  }), /*#__PURE__*/React.createElement(ManagersPane, null)), sheet ? /*#__PURE__*/React.createElement(SwitchSheet, {
    onClose: () => setSheet(false)
  }) : null, /*#__PURE__*/React.createElement(window.NoniDesignSystem_710e43.TabBar, {
    items: ADMIN_TABS,
    active: -1
  }));
}
Object.assign(window, {
  SettingsRedesign
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "redesigns/admin/SettingsRedesign.jsx", error: String((e && e.message) || e) }); }

// redesigns/web/ConsoleApp.jsx
try { (() => {
/* usenoni.app — company admin console. Four pages: Overview, Campaign
   managers, Company Brain (→ Creator Accounts template), Billing & budget.
   Everything an admin owns lives here; the app keeps only review work. */

const NAV = [{
  label: 'Overview',
  icon: 'chart-column'
}, {
  label: 'Campaign managers',
  icon: 'users'
}, {
  label: 'Company Brain',
  icon: 'sparkles'
}, {
  label: 'Billing & budget',
  icon: 'dollar-sign'
}];
function StatCard({
  label,
  value,
  meta
}) {
  return /*#__PURE__*/React.createElement(WCard, {
    pad: 18,
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement(WLabel, null, label), /*#__PURE__*/React.createElement("div", {
    style: {
      margin: '10px 0 2px',
      font: '800 30px var(--font-display)',
      letterSpacing: '-0.8px',
      color: 'var(--ink)'
    }
  }, value), meta ? /*#__PURE__*/React.createElement("div", {
    style: {
      font: '600 13px var(--font-ui)',
      color: 'var(--slate-400)'
    }
  }, meta) : null);
}
function OverviewPage({
  go
}) {
  const {
    Icon
  } = window.NoniDesignSystem_710e43;
  const Shortcut = ({
    icon,
    title,
    sub,
    page
  }) => /*#__PURE__*/React.createElement(WCard, {
    pad: 18,
    onClick: () => go(page),
    style: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 40,
      height: 40,
      flex: '0 0 auto',
      borderRadius: 999,
      background: 'var(--blue-100)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 18,
    color: "var(--blue-700)"
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      font: '700 16px var(--font-display)',
      letterSpacing: '-0.3px',
      color: 'var(--ink)'
    }
  }, title), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      marginTop: 2,
      font: '600 13px var(--font-ui)',
      color: 'var(--slate-400)'
    }
  }, sub)), /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-right",
    size: 17,
    color: "var(--slate-300)"
  }));
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(PageHead, {
    title: "FieldVision",
    sub: "fieldvision \xB7 joined 8/11/2026",
    right: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(WLabel, null, "Company code"), /*#__PURE__*/React.createElement(CodeChip, {
      code: "XPWAML"
    }))
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(StatCard, {
    label: "Campaign managers",
    value: "1",
    meta: "1 invite pending"
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "Creators",
    value: "1",
    meta: "0 connected"
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "Posts this week",
    value: "0",
    meta: "Queue is empty"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 14,
      marginTop: 14
    }
  }, /*#__PURE__*/React.createElement(Shortcut, {
    icon: "sparkles",
    title: "Company Brain",
    sub: "Template, brand docs, features",
    page: 2
  }), /*#__PURE__*/React.createElement(Shortcut, {
    icon: "users",
    title: "Campaign managers",
    sub: "Invite and set access",
    page: 1
  })));
}
function ManagersPage() {
  const {
    Icon
  } = window.NoniDesignSystem_710e43;
  const [email, setEmail] = React.useState('');
  const [access, setAccess] = React.useState({
    m1: false
  });
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(PageHead, {
    title: "Campaign managers",
    sub: "They review and approve in the Noni app. Company Brain access lets one edit the template, brand docs, features and budget here too."
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 340px',
      gap: 20,
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(WLabel, null, "Active"), /*#__PURE__*/React.createElement(WCard, {
    pad: 0
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 13,
      padding: '16px 18px'
    }
  }, /*#__PURE__*/React.createElement(WebAvatar, {
    name: "Founders",
    size: 38
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: '700 15px var(--font-ui)',
      color: 'var(--ink)'
    }
  }, "Founders"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 2,
      font: '600 13px var(--font-ui)',
      color: 'var(--slate-400)'
    }
  }, "founders@fieldvision.ai")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: '600 13px var(--font-ui)',
      color: 'var(--slate-500)'
    }
  }, "Company Brain access"), /*#__PURE__*/React.createElement(Toggle, {
    on: access.m1,
    onChange: v => setAccess({
      m1: v
    }),
    label: "Company Brain access for Founders"
  }))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(WLabel, null, "Pending invites"), /*#__PURE__*/React.createElement(WCard, {
    pad: 0
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 13,
      padding: '16px 18px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 38,
      height: 38,
      flex: '0 0 auto',
      borderRadius: 999,
      background: 'var(--fill-quiet)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "inbox",
    size: 16,
    color: "var(--slate-400)"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: '700 15px var(--font-ui)',
      color: 'var(--ink)'
    }
  }, "elanromo09@gmail.com"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 2,
      font: '600 13px var(--font-ui)',
      color: 'var(--slate-400)'
    }
  }, "Sent 8/11 \xB7 expires 8/25")), /*#__PURE__*/React.createElement(WPill, {
    variant: "quiet",
    size: "sm"
  }, "Resend"))))), /*#__PURE__*/React.createElement(WCard, {
    pad: 22
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      font: '800 19px var(--font-display)',
      letterSpacing: '-0.4px',
      color: 'var(--ink)'
    }
  }, "Invite a campaign manager"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '8px 0 16px',
      font: '400 14px/1.5 var(--font-ui)',
      color: 'var(--slate-500)'
    }
  }, "They get an email to download the Noni app. Signing in with it puts them on this company."), /*#__PURE__*/React.createElement(WInput, {
    value: email,
    onChange: e => setEmail(e.target.value),
    placeholder: "Email address"
  }), /*#__PURE__*/React.createElement(WPill, {
    icon: "plus",
    style: {
      width: '100%',
      marginTop: 12
    }
  }, "Send invite"))));
}
function BrainPage({
  go
}) {
  const {
    Icon
  } = window.NoniDesignSystem_710e43;
  const Row = ({
    icon,
    title,
    sub,
    meta,
    onClick
  }) => /*#__PURE__*/React.createElement(WCard, {
    pad: 0,
    onClick: onClick,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 15,
      padding: '18px 20px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 42,
      height: 42,
      flex: '0 0 auto',
      borderRadius: 999,
      background: 'var(--blue-100)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 19,
    color: "var(--blue-700)"
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      font: '700 17px var(--font-display)',
      letterSpacing: '-0.3px',
      color: 'var(--ink)'
    }
  }, title), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      marginTop: 3,
      font: '600 13px var(--font-ui)',
      color: 'var(--slate-400)'
    }
  }, sub)), meta ? /*#__PURE__*/React.createElement("span", {
    style: {
      font: '600 13px var(--font-ui)',
      color: 'var(--slate-400)',
      whiteSpace: 'nowrap'
    }
  }, meta) : null, /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-right",
    size: 18,
    color: "var(--slate-300)"
  }));
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(PageHead, {
    title: "Company Brain",
    sub: "What Noni writes and onboards against. Only admins edit this, unless a campaign manager is granted access."
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      maxWidth: 720
    }
  }, /*#__PURE__*/React.createElement(Row, {
    icon: "circle-user-round",
    title: "Creator Accounts template",
    sub: "The profile every creator mirrors during setup",
    onClick: () => go('template')
  }), /*#__PURE__*/React.createElement(Row, {
    icon: "sparkles",
    title: "Brand Brain",
    sub: "Docs the briefs are written against",
    meta: "0 docs"
  }), /*#__PURE__*/React.createElement(Row, {
    icon: "zap",
    title: "Features",
    sub: "Approved product claims",
    meta: "0 approved"
  })));
}
function TemplatePage({
  onBack
}) {
  const {
    Icon
  } = window.NoniDesignSystem_710e43;
  const [ig, setIg] = React.useState('');
  const [tt, setTt] = React.useState('');
  const [link, setLink] = React.useState('fieldvisionai.com');
  const Slot = ({
    w,
    h,
    r,
    label,
    icon = 'image-plus'
  }) => /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": label,
    style: {
      width: w,
      height: h,
      flex: '0 0 auto',
      borderRadius: r,
      border: '1.5px dashed var(--line-strong)',
      background: 'var(--fill-quiet)',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 20,
    color: "var(--slate-400)"
  }));
  const Field = ({
    icon,
    label,
    children
  }) => /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 13,
    color: "var(--slate-400)"
  }), /*#__PURE__*/React.createElement(WLabel, null, label)), children);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(PageHead, {
    onBack: onBack,
    kicker: "Company Brain",
    title: "Creator Accounts template",
    sub: "Creators see exactly this during account setup and mirror it.",
    right: /*#__PURE__*/React.createElement(WPill, null, "Save")
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 320px',
      gap: 20,
      alignItems: 'start',
      maxWidth: 980
    }
  }, /*#__PURE__*/React.createElement(WCard, {
    pad: 22,
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(Slot, {
    w: 64,
    h: 64,
    r: 999,
    label: "Add profile picture"
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      font: '700 15px var(--font-ui)',
      color: 'var(--ink)'
    }
  }, "Profile picture"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 2,
      font: '600 13px var(--font-ui)',
      color: 'var(--slate-400)'
    }
  }, "1080 \xD7 1080"))), /*#__PURE__*/React.createElement(Field, {
    icon: "at-sign",
    label: "Instagram bio"
  }, /*#__PURE__*/React.createElement(WInput, {
    rows: 3,
    value: ig,
    onChange: e => setIg(e.target.value),
    placeholder: "Exact bio creators paste in"
  })), /*#__PURE__*/React.createElement(Field, {
    icon: "music-2",
    label: "TikTok bio"
  }, /*#__PURE__*/React.createElement(WInput, {
    rows: 3,
    value: tt,
    onChange: e => setTt(e.target.value),
    placeholder: "Exact bio creators paste in"
  })), /*#__PURE__*/React.createElement(Field, {
    icon: "link",
    label: "Link in bio"
  }, /*#__PURE__*/React.createElement(WInput, {
    value: link,
    onChange: e => setLink(e.target.value)
  }))), /*#__PURE__*/React.createElement(WCard, {
    pad: 22,
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(WLabel, {
    style: {
      alignSelf: 'flex-start'
    }
  }, "Example account"), /*#__PURE__*/React.createElement(Slot, {
    w: 200,
    h: 300,
    r: "var(--radius-md)",
    label: "Add example screenshot"
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      font: '600 13px/1.5 var(--font-ui)',
      color: 'var(--slate-400)',
      textAlign: 'center'
    }
  }, "Screenshot of the look to match"))));
}
function BillingPage() {
  const {
    Icon
  } = window.NoniDesignSystem_710e43;
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(PageHead, {
    title: "Billing & budget",
    sub: "What creators earn per approved post comes out of this budget."
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      maxWidth: 720
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(StatCard, {
    label: "Weekly budget",
    value: "$500",
    meta: "Resets Sunday"
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "Spent this week",
    value: "$0",
    meta: "0 approved posts"
  })), /*#__PURE__*/React.createElement(WCard, {
    pad: 0,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      padding: '16px 18px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 40,
      height: 40,
      flex: '0 0 auto',
      borderRadius: 999,
      background: 'var(--blue-100)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "dollar-sign",
    size: 17,
    color: "var(--blue-700)"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: '700 15px var(--font-ui)',
      color: 'var(--ink)'
    }
  }, "Payment method"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 2,
      font: '600 13px var(--font-ui)',
      color: 'var(--slate-400)'
    }
  }, "Visa \xB7\xB7 4242")), /*#__PURE__*/React.createElement(WPill, {
    variant: "quiet",
    size: "sm"
  }, "Change"))));
}
function AdminConsole() {
  const [nav, setNav] = React.useState(0);
  const [page, setPage] = React.useState(null); // 'template' overrides nav
  const go = i => {
    setPage(null);
    setNav(i);
  };
  const body = page === 'template' ? /*#__PURE__*/React.createElement(TemplatePage, {
    onBack: () => setNav(2) || setPage(null)
  }) : [/*#__PURE__*/React.createElement(OverviewPage, {
    go: go
  }), /*#__PURE__*/React.createElement(ManagersPage, null), /*#__PURE__*/React.createElement(BrainPage, {
    go: p => setPage(p)
  }), /*#__PURE__*/React.createElement(BillingPage, null)][nav];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      height: '100vh',
      background: 'var(--off-white)'
    }
  }, /*#__PURE__*/React.createElement(Sidebar, {
    items: NAV,
    active: page ? 2 : nav,
    onSelect: go
  }), /*#__PURE__*/React.createElement("main", {
    style: {
      flex: 1,
      minWidth: 0,
      overflowY: 'auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1020,
      margin: '0 auto',
      padding: '44px 40px 60px'
    }
  }, body)));
}
Object.assign(window, {
  AdminConsole
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "redesigns/web/ConsoleApp.jsx", error: String((e && e.message) || e) }); }

// redesigns/web/WebShared.jsx
try { (() => {
/* Shared vocabulary for the usenoni.app admin console (desktop web). Same
   tokens as the apps — white ground, one blue, pill actions, hairline cards. */

const WNS = () => window.NoniDesignSystem_710e43;
function WCard({
  children,
  pad = 20,
  onClick,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClick,
    role: onClick ? 'button' : undefined,
    style: {
      background: 'var(--white)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-card)',
      padding: pad,
      cursor: onClick ? 'pointer' : 'default',
      ...style
    }
  }, children);
}
function WLabel({
  children,
  style
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      font: '700 11px var(--font-ui)',
      letterSpacing: 'var(--tracking-label)',
      textTransform: 'uppercase',
      color: 'var(--slate-400)',
      ...style
    }
  }, children);
}
function WPill({
  children,
  icon,
  variant = 'primary',
  size = 'md',
  onClick,
  style
}) {
  const {
    Icon
  } = WNS();
  const looks = {
    primary: {
      background: 'var(--blue-500)',
      color: 'var(--white)',
      boxShadow: 'var(--shadow-accent)'
    },
    tint: {
      background: 'var(--blue-100)',
      color: 'var(--blue-700)'
    },
    quiet: {
      background: 'var(--fill-quiet)',
      color: 'var(--ink)'
    },
    danger: {
      background: 'var(--danger-soft)',
      color: 'var(--danger)'
    }
  };
  const pad = size === 'sm' ? '8px 14px' : '12px 22px';
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClick,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 7,
      padding: pad,
      borderRadius: 999,
      border: 'none',
      cursor: 'pointer',
      font: `700 ${size === 'sm' ? 13 : 15}px var(--font-ui)`,
      whiteSpace: 'nowrap',
      transition: 'filter var(--dur-fast) var(--ease-out)',
      ...looks[variant],
      ...style
    }
  }, icon ? /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: size === 'sm' ? 14 : 16
  }) : null, children);
}
function Toggle({
  on,
  onChange,
  label
}) {
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    role: "switch",
    "aria-checked": on,
    "aria-label": label,
    onClick: () => onChange(!on),
    style: {
      width: 44,
      height: 26,
      flex: '0 0 auto',
      borderRadius: 999,
      border: 'none',
      cursor: 'pointer',
      padding: 3,
      background: on ? 'var(--blue-500)' : 'var(--line-strong)',
      transition: 'background var(--dur-fast) var(--ease-out)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      width: 20,
      height: 20,
      borderRadius: 999,
      background: 'var(--white)',
      boxShadow: '0 1px 3px rgba(15,23,32,0.25)',
      transform: on ? 'translateX(18px)' : 'none',
      transition: 'transform var(--dur-fast) var(--ease-out)'
    }
  }));
}
function CodeChip({
  code
}) {
  const [done, setDone] = React.useState(false);
  const {
    Icon
  } = WNS();
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setDone(true),
    title: "Copy company code",
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      padding: '8px 14px',
      borderRadius: 999,
      border: '1px solid var(--border)',
      background: 'var(--white)',
      cursor: 'pointer',
      boxShadow: 'var(--shadow-card)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: '700 13px var(--font-mono, ui-monospace)',
      letterSpacing: '2px',
      color: 'var(--ink)'
    }
  }, code), done ? /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 14,
    color: "var(--green)"
  }) : /*#__PURE__*/React.createElement("span", {
    style: {
      font: '700 12px var(--font-ui)',
      color: 'var(--blue-700)'
    }
  }, "Copy"));
}
function PageHead({
  kicker,
  title,
  sub,
  right,
  onBack
}) {
  const {
    Icon
  } = WNS();
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 16,
      marginBottom: 26
    }
  }, onBack ? /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onBack,
    "aria-label": "Back",
    style: {
      width: 40,
      height: 40,
      marginTop: 4,
      flex: '0 0 auto',
      borderRadius: 999,
      border: 'none',
      cursor: 'pointer',
      background: 'var(--white)',
      boxShadow: 'var(--shadow-card)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-left",
    size: 20,
    color: "var(--ink)"
  })) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, kicker ? /*#__PURE__*/React.createElement(WLabel, {
    style: {
      display: 'block',
      marginBottom: 6
    }
  }, kicker) : null, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      font: '800 32px var(--font-display)',
      letterSpacing: '-0.8px',
      color: 'var(--ink)'
    }
  }, title), sub ? /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '8px 0 0',
      font: '400 15px/1.5 var(--font-ui)',
      color: 'var(--slate-500)',
      maxWidth: 520
    }
  }, sub) : null), right ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      alignItems: 'center',
      marginTop: 6
    }
  }, right) : null);
}
function WInput({
  value,
  onChange,
  placeholder,
  rows = 1,
  style
}) {
  const base = {
    width: '100%',
    boxSizing: 'border-box',
    border: '1px solid var(--border)',
    outline: 'none',
    resize: 'none',
    background: 'var(--white)',
    borderRadius: 'var(--radius-md)',
    padding: '12px 14px',
    font: '600 15px/1.5 var(--font-ui)',
    color: 'var(--ink)',
    ...style
  };
  return rows === 1 ? /*#__PURE__*/React.createElement("input", {
    value: value,
    onChange: onChange,
    placeholder: placeholder,
    style: base
  }) : /*#__PURE__*/React.createElement("textarea", {
    value: value,
    onChange: onChange,
    placeholder: placeholder,
    rows: rows,
    style: base
  });
}
function Sidebar({
  items,
  active,
  onSelect
}) {
  const {
    Icon,
    Wordmark,
    BubbleMark
  } = WNS();
  return /*#__PURE__*/React.createElement("aside", {
    style: {
      width: 244,
      flex: '0 0 auto',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--white)',
      borderRight: '1px solid var(--line)',
      padding: '26px 16px 20px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '0 10px 6px'
    }
  }, BubbleMark ? /*#__PURE__*/React.createElement(BubbleMark, {
    size: 30
  }) : null, /*#__PURE__*/React.createElement("span", {
    style: {
      font: '800 21px var(--font-round, var(--font-display))',
      letterSpacing: '-0.4px',
      color: 'var(--ink)'
    }
  }, "noni"), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 'auto',
      padding: '4px 9px',
      borderRadius: 999,
      background: 'var(--blue-100)',
      color: 'var(--blue-700)',
      font: '700 10px var(--font-ui)',
      letterSpacing: '0.6px',
      textTransform: 'uppercase'
    }
  }, "Admin")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '2px 10px 18px',
      font: '600 12px var(--font-ui)',
      color: 'var(--slate-400)'
    }
  }, "FieldVision AI"), /*#__PURE__*/React.createElement("nav", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 3
    }
  }, items.map((it, i) => {
    const on = i === active;
    return /*#__PURE__*/React.createElement("button", {
      key: it.label,
      type: "button",
      onClick: () => onSelect(i),
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 11,
        padding: '11px 12px',
        borderRadius: 12,
        border: 'none',
        cursor: 'pointer',
        textAlign: 'left',
        background: on ? 'var(--blue-100)' : 'transparent',
        color: on ? 'var(--blue-700)' : 'var(--slate-500)',
        font: '700 14px var(--font-ui)',
        transition: 'background var(--dur-fast) var(--ease-out)'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: it.icon,
      size: 17,
      color: on ? 'var(--blue-700)' : 'var(--slate-400)'
    }), it.label);
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: 3
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '10px 12px'
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: "Elan",
    size: 30
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: '700 13px var(--font-ui)',
      color: 'var(--ink)'
    }
  }, "Elan"), /*#__PURE__*/React.createElement("div", {
    style: {
      font: '600 11px var(--font-ui)',
      color: 'var(--slate-400)'
    }
  }, "Company admin"))), /*#__PURE__*/React.createElement("button", {
    type: "button",
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 11,
      padding: '10px 12px',
      borderRadius: 12,
      border: 'none',
      cursor: 'pointer',
      textAlign: 'left',
      background: 'transparent',
      color: 'var(--danger)',
      font: '700 13px var(--font-ui)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "log-out",
    size: 16,
    color: "var(--danger)"
  }), "Sign out")));
}
function Avatar({
  name,
  size = 36,
  tone = 'brand'
}) {
  const initial = (name || '?').trim().charAt(0).toUpperCase();
  return /*#__PURE__*/React.createElement("span", {
    style: {
      width: size,
      height: size,
      flex: '0 0 auto',
      borderRadius: 999,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: tone === 'brand' ? 'var(--blue-100)' : 'var(--fill-quiet)',
      color: tone === 'brand' ? 'var(--blue-700)' : 'var(--slate-500)',
      font: `700 ${Math.round(size * 0.42)}px var(--font-display)`
    }
  }, initial);
}
Object.assign(window, {
  WCard,
  WLabel,
  WPill,
  Toggle,
  CodeChip,
  PageHead,
  WInput,
  Sidebar,
  WebAvatar: Avatar
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "redesigns/web/WebShared.jsx", error: String((e && e.message) || e) }); }

// redesigns/website/OpsApp.jsx
try { (() => {
/* usenoni.app /ops — Noni platform console. Overview = performance across
   companies; company page = Analytics / Team / Settings tabs. */

const OPS_NAV = [{
  label: 'Platform',
  items: [{
    label: 'Overview',
    icon: 'gauge'
  }, {
    label: 'Companies',
    icon: 'layout-grid'
  }, {
    label: 'Users',
    icon: 'users'
  }, {
    label: 'Invites',
    icon: 'send'
  }]
}];
const SEED_COMPANIES = [{
  id: 'c1',
  name: 'FieldVision AI',
  website: 'fieldvision.ai',
  admin: {
    name: 'Elan Rosen',
    email: 'elan@fieldvision.ai'
  },
  creators: 4,
  managers: 1,
  campaigns: 3,
  posts: 128,
  views: '1.2M',
  status: 'Active',
  joined: 'Jun 2, 2026',
  series: [60, 72, 85, 80, 95, 110, 124, 118, 140, 156, 170, 188],
  deltas: {
    views: '+18% vs July',
    posts: '+9% vs July',
    campaigns: '1 ended Aug 3',
    creators: '+1 this month'
  },
  formats: {
    Video: 82,
    Carousel: 46
  }
}, {
  id: 'c2',
  name: 'Custom Cleats Co',
  website: 'customcleats.co',
  admin: {
    name: 'Dana Whitfield',
    email: 'dana@customcleats.co'
  },
  creators: 4,
  managers: 2,
  campaigns: 4,
  posts: 210,
  views: '840k',
  status: 'Active',
  joined: 'Jul 14, 2026',
  series: [38, 44, 52, 61, 58, 66, 72, 80, 84, 90, 96, 104],
  deltas: {
    views: '+11% vs July',
    posts: '+24% vs July',
    campaigns: '2 started in Aug',
    creators: 'Steady'
  },
  formats: {
    Video: 118,
    Carousel: 92
  }
}, {
  id: 'c3',
  name: 'Peak Form Labs',
  website: 'peakformlabs.com',
  admin: {
    name: 'Marcus Oduya',
    email: 'marcus@peakformlabs.com'
  },
  creators: 0,
  managers: 0,
  campaigns: 0,
  posts: 0,
  views: '—',
  status: 'Invite pending',
  joined: 'Aug 9, 2026',
  series: [],
  deltas: {},
  formats: {}
}];
const SEED_PEOPLE = [{
  id: 'p1',
  company: 'c1',
  role: 'Company admin',
  name: 'Elan Rosen',
  email: 'elan@fieldvision.ai',
  phone: '+1 (305) 741-2280',
  status: 'Active',
  joined: 'Jun 2, 2026'
}, {
  id: 'p2',
  company: 'c1',
  role: 'Campaign manager',
  name: 'Sofia Marek',
  email: 'sofia@fieldvision.ai',
  phone: '+1 (786) 220-1148',
  status: 'Active',
  joined: 'Jun 9, 2026'
}, {
  id: 'p3',
  company: 'c1',
  role: 'Creator',
  name: 'Maya Reyes',
  email: 'maya.reyes@gmail.com',
  phone: '+1 (813) 402-9917',
  status: 'Onboarded',
  joined: 'Jun 12, 2026',
  posts: 42,
  viewsN: 389000
}, {
  id: 'p4',
  company: 'c1',
  role: 'Creator',
  name: 'Jordan Tate',
  email: 'jordantate@gmail.com',
  phone: '+1 (407) 318-5526',
  status: 'Onboarded',
  joined: 'Jun 15, 2026',
  posts: 38,
  viewsN: 341000
}, {
  id: 'p5',
  company: 'c1',
  role: 'Creator',
  name: 'Devon Kim',
  email: 'devon.kim@gmail.com',
  phone: '+1 (954) 630-2211',
  status: 'Onboarded',
  joined: 'Jul 2, 2026',
  posts: 26,
  viewsN: 204000
}, {
  id: 'p6',
  company: 'c1',
  role: 'Creator',
  name: 'Aliyah Grant',
  email: 'aliyahgrant@gmail.com',
  phone: '+1 (321) 884-7703',
  status: 'Pending',
  joined: 'Aug 8, 2026',
  posts: 0,
  viewsN: 0
}, {
  id: 'p7',
  company: 'c2',
  role: 'Company admin',
  name: 'Dana Whitfield',
  email: 'dana@customcleats.co',
  phone: '+1 (646) 302-8841',
  status: 'Active',
  joined: 'Jul 14, 2026'
}, {
  id: 'p8',
  company: 'c2',
  role: 'Campaign manager',
  name: 'Ray Delgado',
  email: 'ray@customcleats.co',
  phone: '+1 (917) 556-2384',
  status: 'Active',
  joined: 'Jul 18, 2026'
}, {
  id: 'p9',
  company: 'c2',
  role: 'Campaign manager',
  name: 'Tess Boyd',
  email: 'tess@customcleats.co',
  phone: '+1 (718) 209-4415',
  status: 'Active',
  joined: 'Jul 21, 2026'
}, {
  id: 'p10',
  company: 'c2',
  role: 'Creator',
  name: 'Lena Ortiz',
  email: 'lenaortiz@gmail.com',
  phone: '+1 (347) 771-0492',
  status: 'Onboarded',
  joined: 'Jul 20, 2026',
  posts: 51,
  viewsN: 312000
}, {
  id: 'p11',
  company: 'c2',
  role: 'Creator',
  name: 'Sam Whitaker',
  email: 'samwhit@gmail.com',
  phone: '+1 (929) 415-8830',
  status: 'Onboarded',
  joined: 'Jul 22, 2026',
  posts: 33,
  viewsN: 188000
}, {
  id: 'p12',
  company: 'c2',
  role: 'Creator',
  name: 'Priya Nair',
  email: 'priya.nair@gmail.com',
  phone: '+1 (201) 668-3172',
  status: 'Onboarded',
  joined: 'Jul 25, 2026',
  posts: 29,
  viewsN: 162000
}, {
  id: 'p13',
  company: 'c2',
  role: 'Creator',
  name: 'Chris Boone',
  email: 'chrisboone@gmail.com',
  phone: '+1 (551) 380-9906',
  status: 'Pending',
  joined: 'Aug 10, 2026',
  posts: 0,
  viewsN: 0
}, {
  id: 'p14',
  company: 'c3',
  role: 'Company admin',
  name: 'Marcus Oduya',
  email: 'marcus@peakformlabs.com',
  phone: '—',
  status: 'Invite pending',
  joined: 'Aug 9, 2026'
}];
const SEED_POSTS = [{
  id: 'q1',
  company: 'c1',
  title: 'POV: your film session runs itself',
  creator: 'Maya Reyes',
  format: 'Video',
  viewsN: 122000,
  earned: 340,
  date: 'Aug 9',
  day: 9,
  link: 'https://tiktok.com',
  tt: {
    views: 84000,
    saves: 3100,
    likes: 9200
  },
  ig: {
    views: 38000,
    saves: 1400,
    likes: 4100
  },
  sales: 1240,
  signups: 46
}, {
  id: 'q2',
  company: 'c1',
  title: '3 drills college scouts actually watch',
  creator: 'Jordan Tate',
  format: 'Carousel',
  viewsN: 98000,
  earned: 275,
  date: 'Aug 10',
  day: 10,
  link: 'https://instagram.com',
  tt: {
    views: 61000,
    saves: 2400,
    likes: 6800
  },
  ig: {
    views: 37000,
    saves: 1900,
    likes: 3900
  },
  sales: 980,
  signups: 31
}, {
  id: 'q3',
  company: 'c1',
  title: 'How we cut film review to 10 minutes',
  creator: 'Maya Reyes',
  format: 'Video',
  viewsN: 87000,
  earned: 240,
  date: 'Aug 6',
  day: 6,
  link: 'https://tiktok.com',
  tt: {
    views: 52000,
    saves: 1800,
    likes: 5100
  },
  ig: {
    views: 35000,
    saves: 1200,
    likes: 3300
  },
  sales: 760,
  signups: 24
}, {
  id: 'q4',
  company: 'c1',
  title: 'Sideline setup in 60 seconds',
  creator: 'Devon Kim',
  format: 'Video',
  viewsN: 64000,
  earned: 180,
  date: 'Aug 2',
  day: 2,
  link: 'https://tiktok.com',
  tt: {
    views: 41000,
    saves: 1300,
    likes: 3600
  },
  ig: {
    views: 23000,
    saves: 800,
    likes: 2100
  },
  sales: 510,
  signups: 15
}, {
  id: 'q5',
  company: 'c2',
  title: "Rating my teammates' custom cleats",
  creator: 'Lena Ortiz',
  format: 'Video',
  viewsN: 141000,
  earned: 395,
  date: 'Aug 9',
  day: 9,
  link: 'https://tiktok.com',
  tt: {
    views: 96000,
    saves: 3800,
    likes: 11400
  },
  ig: {
    views: 45000,
    saves: 1700,
    likes: 5200
  },
  sales: 1080,
  signups: 38
}, {
  id: 'q6',
  company: 'c2',
  title: 'Design your dream cleat in 3 taps',
  creator: 'Sam Whitaker',
  format: 'Carousel',
  viewsN: 89000,
  earned: 250,
  date: 'Aug 11',
  day: 11,
  link: 'https://instagram.com',
  tt: {
    views: 51000,
    saves: 2100,
    likes: 5900
  },
  ig: {
    views: 38000,
    saves: 2300,
    likes: 4400
  },
  sales: 640,
  signups: 22
}, {
  id: 'q7',
  company: 'c2',
  title: 'Unboxing the new colorway',
  creator: 'Priya Nair',
  format: 'Video',
  viewsN: 76000,
  earned: 215,
  date: 'Aug 3',
  day: 3,
  link: 'https://tiktok.com',
  tt: {
    views: 49000,
    saves: 1500,
    likes: 4300
  },
  ig: {
    views: 27000,
    saves: 900,
    likes: 2500
  },
  sales: 540,
  signups: 18
}, {
  id: 'q8',
  company: 'c2',
  title: 'From sketch to cleat in 6 days',
  creator: 'Lena Ortiz',
  format: 'Carousel',
  viewsN: 58000,
  earned: 160,
  date: 'Aug 1',
  day: 1,
  link: 'https://instagram.com',
  tt: {
    views: 33000,
    saves: 1100,
    likes: 2900
  },
  ig: {
    views: 25000,
    saves: 1300,
    likes: 2400
  },
  sales: 280,
  signups: 9
}];
const COMPANY_DAYS = {
  c1: {
    2: {
      signups: 15,
      sales: 510,
      downloads: 88,
      views: 64000
    },
    6: {
      signups: 24,
      sales: 760,
      downloads: 132,
      views: 87000
    },
    9: {
      signups: 46,
      sales: 1240,
      downloads: 210,
      views: 122000
    },
    10: {
      signups: 31,
      sales: 980,
      downloads: 164,
      views: 98000
    },
    11: {
      signups: 12,
      sales: 310,
      downloads: 70,
      views: 31000
    }
  },
  c2: {
    1: {
      signups: 9,
      sales: 280,
      downloads: 54,
      views: 58000
    },
    3: {
      signups: 18,
      sales: 540,
      downloads: 96,
      views: 76000
    },
    9: {
      signups: 38,
      sales: 1080,
      downloads: 190,
      views: 141000
    },
    11: {
      signups: 22,
      sales: 640,
      downloads: 120,
      views: 89000
    }
  }
};
const COMPANY_BILLING = {
  c1: {
    monthly: 2500,
    spent: 2140,
    topups: [{
      amt: 1000,
      date: 'Aug 1'
    }, {
      amt: 500,
      date: 'Jul 18'
    }, {
      amt: 1000,
      date: 'Jul 2'
    }],
    pingTo: 'Elan'
  },
  c2: {
    monthly: 3000,
    spent: 1210,
    topups: [{
      amt: 1000,
      date: 'Aug 4'
    }, {
      amt: 2000,
      date: 'Jul 14'
    }],
    pingTo: 'Dana'
  }
};
const SEED_BRIEFS = [{
  id: 'b1',
  company: 'c1',
  title: 'Film session runs itself',
  format: 'Video',
  status: 'Active',
  day: 9,
  hook: 'Your film crew quit? Good.',
  script: 'Open on an empty sideline. Mount the phone. Auto-tracking follows the play; clips land in the app before the huddle breaks.',
  caption: 'One phone. Full film crew. #fieldvision'
}, {
  id: 'b2',
  company: 'c1',
  title: 'Drills scouts watch',
  format: 'Carousel',
  status: 'Active',
  day: 10,
  hook: '3 drills college scouts actually pause on',
  script: 'One slide per drill: name it, show the rep, name the metric scouts read off it.',
  caption: 'Save this for fall camp.'
}, {
  id: 'b3',
  company: 'c1',
  title: '10-minute film review',
  format: 'Video',
  status: 'Archived',
  day: 6,
  hook: 'We cut film night to 10 minutes',
  script: 'Before/after split: three-hour film night vs auto-clipped highlight review on the bus home.',
  caption: 'Coaches, reclaim your Sunday.'
}, {
  id: 'b4',
  company: 'c2',
  title: 'Teammate cleat ratings',
  format: 'Video',
  status: 'Active',
  day: 9,
  hook: "Rating my teammates' custom cleats",
  script: 'Walk the locker room, one honest rating per pair, end on your own design.',
  caption: 'Drop your rating below.'
}, {
  id: 'b5',
  company: 'c2',
  title: 'Dream cleat configurator',
  format: 'Carousel',
  status: 'Active',
  day: 11,
  hook: 'Design your dream cleat in 3 taps',
  script: 'Slide per step: base, colorway, stitch detail. Last slide is the checkout screen.',
  caption: 'Link in bio to build yours.'
}];
const money = n => '$' + n.toLocaleString();
const moneyK = n => n >= 1000 ? '$' + (n / 1000).toFixed(1) + 'k' : '$' + n;
const SEED_INVITES = [{
  id: 'i1',
  name: 'Marcus Oduya',
  email: 'marcus@peakformlabs.com',
  company: 'Peak Form Labs',
  sent: '2 days ago',
  status: 'Pending'
}, {
  id: 'i2',
  name: 'Dana Whitfield',
  email: 'dana@customcleats.co',
  company: 'Custom Cleats Co',
  sent: 'Jul 14',
  status: 'Accepted'
}, {
  id: 'i3',
  name: 'Elan Rosen',
  email: 'elan@fieldvision.ai',
  company: 'FieldVision AI',
  sent: 'Jun 2',
  status: 'Accepted'
}];
const statusTone = s => ['Active', 'Accepted', 'Onboarded'].includes(s) ? 'green' : s === 'Expired' ? 'slate' : 'amber';
const companyName = id => (SEED_COMPANIES.find(c => c.id === id) || {}).name || '';
const fmtK = n => n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : n >= 1e3 ? Math.round(n / 1e3) + 'k' : '' + Math.round(n);

/* ---------- charts ---------- */

function AreaChart({
  series,
  vb = 240,
  labels = ['May 25', 'Jun 8', 'Jun 22', 'Jul 6', 'Jul 20', 'Aug 3'],
  yFmt = v => fmtK(v * 1000)
}) {
  const W = 640,
    H = vb,
    P = {
      t: 14,
      r: 10,
      b: 26,
      l: 42
    };
  const max = Math.max(...series) * 1.15;
  const iw = W - P.l - P.r,
    ih = H - P.t - P.b;
  const pts = series.map((v, i) => [P.l + iw * i / (series.length - 1), P.t + ih * (1 - v / max)]);
  const line = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const last = pts[pts.length - 1];
  return /*#__PURE__*/React.createElement("svg", {
    viewBox: `0 0 ${W} ${H}`,
    style: {
      width: '100%',
      height: 'auto',
      display: 'block'
    }
  }, [0, 0.5, 1].map((f, i) => /*#__PURE__*/React.createElement("g", {
    key: i
  }, /*#__PURE__*/React.createElement("line", {
    x1: P.l,
    x2: W - P.r,
    y1: P.t + ih * f,
    y2: P.t + ih * f,
    stroke: "var(--line)",
    strokeWidth: "1"
  }), /*#__PURE__*/React.createElement("text", {
    x: P.l - 8,
    y: P.t + ih * f + 4,
    textAnchor: "end",
    style: {
      font: '600 11px var(--web-ui)',
      fill: 'var(--slate-400)'
    }
  }, yFmt(max * (1 - f))))), /*#__PURE__*/React.createElement("path", {
    d: `${line} L ${(P.l + iw).toFixed(1)} ${P.t + ih} L ${P.l} ${P.t + ih} Z`,
    fill: "rgba(27,166,238,0.10)"
  }), /*#__PURE__*/React.createElement("path", {
    d: line,
    fill: "none",
    stroke: "var(--blue-500)",
    strokeWidth: "2.5",
    strokeLinejoin: "round",
    strokeLinecap: "round"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: last[0],
    cy: last[1],
    r: "4.5",
    fill: "var(--blue-500)",
    stroke: "#fff",
    strokeWidth: "2"
  }), labels.map((w, i) => /*#__PURE__*/React.createElement("text", {
    key: w + i,
    x: P.l + iw * (labels.length > 1 ? i / (labels.length - 1) : 0),
    y: H - 6,
    textAnchor: "middle",
    style: {
      font: '600 11px var(--web-ui)',
      fill: 'var(--slate-400)'
    }
  }, w)));
}
function BarRow({
  label,
  value,
  max,
  suffix
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 74,
      font: '600 13px var(--web-ui)',
      color: 'var(--slate-500)'
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      height: 10,
      borderRadius: 999,
      background: 'var(--fill-quiet)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      width: `${Math.round(100 * value / max)}%`,
      height: '100%',
      borderRadius: 999,
      background: 'var(--blue-500)'
    }
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 70,
      textAlign: 'right',
      font: '700 13px var(--web-ui)',
      color: 'var(--ink)'
    }
  }, value, suffix || ''));
}

/* ---------- shared bits ---------- */

function StatInline({
  label,
  value,
  delta
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      font: '600 13px var(--web-ui)',
      color: 'var(--slate-400)'
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      margin: '6px 0 4px',
      font: '700 30px var(--web-display)',
      letterSpacing: '-0.7px',
      color: 'var(--ink)'
    }
  }, value), delta ? /*#__PURE__*/React.createElement("span", {
    style: {
      font: '600 12.5px var(--web-ui)',
      color: delta.startsWith('+') ? 'var(--green, #1F9D5B)' : 'var(--slate-400)'
    }
  }, delta) : null);
}
function OpsStat({
  label,
  value,
  meta
}) {
  return /*#__PURE__*/React.createElement(KCard, {
    pad: 18,
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement(KLabel, null, label), /*#__PURE__*/React.createElement("div", {
    style: {
      margin: '10px 0 2px',
      font: '700 28px var(--web-display)',
      letterSpacing: '-0.8px',
      color: 'var(--ink)'
    }
  }, value), meta ? /*#__PURE__*/React.createElement("div", {
    style: {
      font: '600 13px var(--web-ui)',
      color: 'var(--slate-400)'
    }
  }, meta) : null);
}
function KTabs({
  tabs,
  active,
  onSelect,
  right
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 4,
      marginBottom: 16,
      alignItems: 'center'
    }
  }, tabs.map(t => /*#__PURE__*/React.createElement("button", {
    key: t,
    type: "button",
    onClick: () => onSelect(t),
    style: {
      padding: '7px 15px',
      borderRadius: 999,
      border: 'none',
      cursor: 'pointer',
      whiteSpace: 'nowrap',
      font: '700 13px var(--web-ui)',
      background: active === t ? 'var(--blue-100)' : 'transparent',
      color: active === t ? 'var(--blue-700)' : 'var(--slate-400)',
      transition: 'background var(--dur-fast) var(--ease-out)'
    }
  }, t)), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }), right || null);
}
function CompanyCard({
  c,
  onOpen
}) {
  const [hover, setHover] = React.useState(false);
  const {
    Icon
  } = window.NoniDesignSystem_710e43;
  const Cell = ({
    label,
    value
  }) => /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      font: '700 19px var(--web-display)',
      letterSpacing: '-0.4px',
      color: 'var(--ink)'
    }
  }, value), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      marginTop: 2,
      font: '600 12px var(--web-ui)',
      color: 'var(--slate-400)'
    }
  }, label));
  return /*#__PURE__*/React.createElement("div", {
    role: "button",
    onClick: onOpen,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      background: 'var(--white)',
      border: hover ? '1px solid var(--blue-300, var(--blue-500))' : '1px solid var(--border)',
      borderRadius: 16,
      padding: 20,
      cursor: 'pointer',
      boxShadow: hover ? 'var(--shadow-raised)' : 'var(--shadow-card)',
      transform: hover ? 'translateY(-3px)' : 'none',
      transition: 'transform 200ms var(--ease-out), box-shadow 200ms var(--ease-out), border-color 200ms var(--ease-out)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(KAvatar, {
    name: c.name,
    size: 38
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      font: '700 16px var(--web-ui)',
      color: 'var(--ink)',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, c.name), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      marginTop: 1,
      font: '600 12.5px var(--web-ui)',
      color: 'var(--slate-400)'
    }
  }, c.website || 'No website yet')), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      font: '700 13px var(--web-ui)',
      color: hover ? 'var(--blue-700)' : 'transparent',
      transition: 'color 200ms var(--ease-out)'
    }
  }, "Open", /*#__PURE__*/React.createElement(Icon, {
    name: "arrow-right",
    size: 14,
    color: hover ? 'var(--blue-700)' : 'transparent'
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12,
      marginTop: 18,
      paddingTop: 16,
      borderTop: '1px solid var(--line)'
    }
  }, /*#__PURE__*/React.createElement(Cell, {
    label: "Active campaigns",
    value: c.campaigns
  }), /*#__PURE__*/React.createElement(Cell, {
    label: "Posts this month",
    value: c.posts
  }), /*#__PURE__*/React.createElement(Cell, {
    label: "Views this month",
    value: c.views
  }), /*#__PURE__*/React.createElement(Cell, {
    label: "Creators",
    value: c.creators
  })));
}
function CompanyRow({
  c,
  onOpen,
  last
}) {
  const {
    Icon
  } = window.NoniDesignSystem_710e43;
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", {
    role: "button",
    onClick: onOpen,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      padding: '15px 20px',
      cursor: 'pointer',
      background: hover ? 'var(--fill-quiet)' : 'transparent',
      borderBottom: last ? 'none' : '1px solid var(--line)',
      transition: 'background var(--dur-fast) var(--ease-out)'
    }
  }, /*#__PURE__*/React.createElement(KAvatar, {
    name: c.name,
    size: 38
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      font: '700 15px var(--web-ui)',
      color: 'var(--ink)'
    }
  }, c.name), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      marginTop: 2,
      font: '600 13px var(--web-ui)',
      color: 'var(--slate-400)'
    }
  }, c.admin.email)), /*#__PURE__*/React.createElement("span", {
    style: {
      font: '600 13px var(--web-ui)',
      color: 'var(--slate-400)',
      width: 210,
      textAlign: 'right'
    }
  }, c.campaigns, " campaigns \xB7 ", c.posts, " posts \xB7 ", c.views, " views"), /*#__PURE__*/React.createElement(KChip, {
    tone: statusTone(c.status)
  }, c.status), /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-right",
    size: 16,
    color: "var(--slate-400)"
  }));
}

/* ---------- modals ---------- */

function NewCompanyModal({
  onClose,
  onCreate
}) {
  const {
    Icon
  } = window.NoniDesignSystem_710e43;
  const [name, setName] = React.useState('');
  const [site, setSite] = React.useState('');
  const [adminName, setAdminName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [sent, setSent] = React.useState(false);
  const ready = name.trim() && adminName.trim() && /.+@.+\..+/.test(email);
  if (sent) return /*#__PURE__*/React.createElement(KModal, {
    title: "Invite sent",
    onClose: onClose
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      padding: '10px 4px 4px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 54,
      height: 54,
      borderRadius: 999,
      background: 'var(--green-soft, #E4F6EC)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "circle-check-big",
    size: 24,
    color: "var(--green, #1F9D5B)"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14,
      font: '700 16px var(--web-display)',
      letterSpacing: '-0.3px',
      color: 'var(--ink)'
    }
  }, name, " is on Noni"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '7px 0 18px',
      font: '600 14px/1.55 var(--web-ui)',
      color: 'var(--slate-400)',
      maxWidth: 330
    }
  }, "We emailed ", email, " an invite to be ", name, "'s admin. They'll sign in with Google and land in onboarding."), /*#__PURE__*/React.createElement(KPill, {
    onClick: onClose,
    style: {
      width: '100%'
    }
  }, "Done")));
  return /*#__PURE__*/React.createElement(KModal, {
    title: "New company",
    onClose: onClose
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(KField, {
    label: "Company name",
    value: name,
    onChange: e => setName(e.target.value),
    placeholder: "Google",
    autoFocus: true
  }), /*#__PURE__*/React.createElement(KField, {
    label: "Website",
    value: site,
    onChange: e => setSite(e.target.value),
    placeholder: "google.com",
    optional: true
  }), /*#__PURE__*/React.createElement(KField, {
    label: "Company admin",
    value: adminName,
    onChange: e => setAdminName(e.target.value),
    placeholder: "John Smith"
  }), /*#__PURE__*/React.createElement(KField, {
    label: "Admin email",
    value: email,
    onChange: e => setEmail(e.target.value),
    placeholder: "johnsmith@google.com"
  }), /*#__PURE__*/React.createElement(KPill, {
    icon: "send",
    onClick: () => {
      if (ready) {
        onCreate({
          name: name.trim(),
          website: site.trim(),
          adminName: adminName.trim(),
          email: email.trim()
        });
        setSent(true);
      }
    },
    style: {
      width: '100%',
      opacity: ready ? 1 : 0.35,
      pointerEvents: ready ? 'auto' : 'none'
    }
  }, "Send invite")));
}
function RemoveCompanyModal({
  c,
  onClose,
  onConfirm
}) {
  const [text, setText] = React.useState('');
  const ready = text.trim().toLowerCase() === 'remove this company';
  return /*#__PURE__*/React.createElement(KModal, {
    title: `Remove ${c.name}`,
    onClose: onClose
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      font: '600 14px/1.55 var(--web-ui)',
      color: 'var(--slate-500)'
    }
  }, "This permanently removes ", c.name, " \u2014 its admin, campaign managers and creators lose access. There's no undo."), /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 7
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: '600 13px var(--web-ui)',
      color: 'var(--slate-500)'
    }
  }, "To confirm, type ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: 'var(--ink)'
    }
  }, "remove this company")), /*#__PURE__*/React.createElement("input", {
    value: text,
    onChange: e => setText(e.target.value),
    autoFocus: true,
    style: {
      width: '100%',
      boxSizing: 'border-box',
      border: '1px solid var(--border)',
      outline: 'none',
      background: 'var(--white)',
      borderRadius: 12,
      padding: '12px 14px',
      font: '600 14.5px var(--web-ui)',
      color: 'var(--ink)'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(KPill, {
    variant: "quiet",
    onClick: onClose,
    style: {
      flex: 1
    }
  }, "Cancel"), /*#__PURE__*/React.createElement(KPill, {
    variant: "danger",
    icon: "trash-2",
    onClick: () => {
      if (ready) onConfirm();
    },
    style: {
      flex: 1,
      opacity: ready ? 1 : 0.35,
      pointerEvents: ready ? 'auto' : 'none'
    }
  }, "Remove company"))));
}
function ProfileModal({
  p,
  onClose,
  onResend,
  resent,
  onViewFull
}) {
  const Row = ({
    label,
    value
  }) => /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '11px 0',
      borderBottom: '1px solid var(--line)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 92,
      font: '600 12.5px var(--web-ui)',
      color: 'var(--slate-400)'
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      font: '600 14px var(--web-ui)',
      color: 'var(--ink)'
    }
  }, value));
  return /*#__PURE__*/React.createElement(KModal, {
    title: "",
    onClose: onClose
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      marginBottom: 10,
      paddingRight: 40
    }
  }, /*#__PURE__*/React.createElement(KAvatar, {
    name: p.name,
    size: 52
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      font: '700 18px var(--web-display)',
      letterSpacing: '-0.3px',
      color: 'var(--ink)'
    }
  }, p.name), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      marginTop: 4
    }
  }, /*#__PURE__*/React.createElement(KChip, {
    tone: p.role === 'Company admin' ? 'blue' : 'slate'
  }, p.role), /*#__PURE__*/React.createElement(KChip, {
    tone: statusTone(p.status)
  }, p.status)))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Row, {
    label: "Email",
    value: p.email
  }), /*#__PURE__*/React.createElement(Row, {
    label: "Phone",
    value: p.phone
  }), /*#__PURE__*/React.createElement(Row, {
    label: "Company",
    value: companyName(p.company)
  }), p.role === 'Creator' ? /*#__PURE__*/React.createElement(Row, {
    label: "This month",
    value: `${p.posts} posts · ${p.viewsN ? fmtK(p.viewsN) + ' views' : 'no views yet'}`
  }) : null, /*#__PURE__*/React.createElement(Row, {
    label: "Joined",
    value: p.joined
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      marginTop: 16
    }
  }, p.status === 'Invite pending' ? /*#__PURE__*/React.createElement(KPill, {
    variant: "tint",
    icon: "rotate-ccw",
    onClick: onResend,
    style: {
      flex: 1
    }
  }, resent ? 'Sent just now' : 'Resend invite') : null, onViewFull ? /*#__PURE__*/React.createElement(KPill, {
    icon: "arrow-right",
    onClick: onViewFull,
    style: {
      flex: 1
    }
  }, "View profile") : null));
}
function ManagerWeek({
  companyId
}) {
  const [metric, setMetric] = React.useState('Views');
  const days = [5, 6, 7, 8, 9, 10, 11];
  const d = COMPANY_DAYS[companyId] || {};
  const pickV = day => {
    const x = d[day];
    if (!x) return 0;
    return metric === 'Views' ? x.views : metric === 'Revenue' ? x.sales : x.signups;
  };
  const series = days.map(pickV);
  const yFmt = metric === 'Views' ? v => fmtK(v) : metric === 'Revenue' ? v => moneyK(Math.round(v)) : v => Math.round(v);
  return /*#__PURE__*/React.createElement(KCard, {
    pad: 22
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement(KLabel, {
    style: {
      flex: 1
    }
  }, "This week"), /*#__PURE__*/React.createElement(SortDropdown, {
    prefix: "",
    options: ['Views', 'Revenue', 'Sign-ups'],
    value: metric,
    onSelect: setMetric
  })), /*#__PURE__*/React.createElement("div", {
    key: metric,
    style: {
      animation: 'om-rise 220ms var(--ease-out) both'
    }
  }, /*#__PURE__*/React.createElement(AreaChart, {
    series: series,
    labels: ['Aug 5', 'Aug 7', 'Aug 9', 'Aug 11'],
    vb: 210,
    yFmt: yFmt
  })));
}
function BriefBlock({
  label,
  text
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      font: '800 11px var(--web-ui)',
      letterSpacing: '0.7px',
      textTransform: 'uppercase',
      color: 'var(--slate-400)',
      marginBottom: 4
    }
  }, label), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      font: '600 13.5px/1.55 var(--web-ui)',
      color: 'var(--ink)'
    }
  }, text));
}
const BRIEF_WEEKS = [{
  label: 'Aug 2 · 8',
  days: [2, 3, 4, 5, 6, 7, 8]
}, {
  label: 'Aug 9 · 15',
  days: [9, 10, 11, 12, 13, 14, 15]
}, {
  label: 'Aug 16 · 22',
  days: [16, 17, 18, 19, 20, 21, 22]
}];
function ManagerBriefs({
  companyId
}) {
  const {
    Icon
  } = window.NoniDesignSystem_710e43;
  const [wi, setWi] = React.useState(1);
  const [day, setDay] = React.useState(null); // null = full week
  const week = BRIEF_WEEKS[wi];
  const briefs = SEED_BRIEFS.filter(b => b.company === companyId);
  const hasContent = dd => briefs.some(b => b.day === dd) || SEED_POSTS.some(q => q.company === companyId && q.day === dd);
  const shownDays = day ? [day] : week.days;
  const shownBriefs = briefs.filter(b => shownDays.includes(b.day));
  const shownPosts = SEED_POSTS.filter(q => q.company === companyId && shownDays.includes(q.day));
  const Arrow = ({
    dir,
    disabled
  }) => /*#__PURE__*/React.createElement("button", {
    type: "button",
    disabled: disabled,
    onClick: () => {
      setWi(wi + dir);
      setDay(null);
    },
    "aria-label": dir < 0 ? 'Previous week' : 'Next week',
    style: {
      width: 30,
      height: 30,
      borderRadius: 999,
      border: '1px solid var(--border)',
      cursor: disabled ? 'default' : 'pointer',
      background: 'var(--white)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: disabled ? 0.35 : 1
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: dir < 0 ? 'chevron-left' : 'chevron-right',
    size: 15,
    color: "var(--ink)"
  }));
  return /*#__PURE__*/React.createElement(KCard, {
    pad: 22
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement(KLabel, {
    style: {
      flex: 1
    }
  }, "Briefs"), /*#__PURE__*/React.createElement(Arrow, {
    dir: -1,
    disabled: wi === 0
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      font: '700 13px var(--web-ui)',
      color: 'var(--ink)',
      whiteSpace: 'nowrap',
      minWidth: 86,
      textAlign: 'center'
    }
  }, week.label), /*#__PURE__*/React.createElement(Arrow, {
    dir: 1,
    disabled: wi === BRIEF_WEEKS.length - 1
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setDay(null),
    style: {
      padding: '9px 16px',
      borderRadius: 12,
      border: 'none',
      cursor: 'pointer',
      whiteSpace: 'nowrap',
      font: '700 13px var(--web-ui)',
      background: day === null ? 'var(--blue-100)' : 'var(--fill-quiet)',
      color: day === null ? 'var(--blue-700)' : 'var(--ink)',
      transition: 'background var(--dur-fast) var(--ease-out)'
    }
  }, "Full week"), week.days.map(dd => {
    const on = day === dd;
    return /*#__PURE__*/React.createElement("button", {
      key: dd,
      type: "button",
      onClick: () => setDay(dd),
      style: {
        flex: 1,
        padding: '9px 0 7px',
        borderRadius: 12,
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        background: on ? 'var(--blue-100)' : 'var(--fill-quiet)',
        transition: 'background var(--dur-fast) var(--ease-out)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        font: '700 13px var(--web-ui)',
        color: on ? 'var(--blue-700)' : 'var(--ink)'
      }
    }, dd), /*#__PURE__*/React.createElement("span", {
      style: {
        width: 5,
        height: 5,
        borderRadius: 999,
        background: hasContent(dd) ? on ? 'var(--blue-500)' : 'var(--slate-400)' : 'transparent'
      }
    }));
  })), /*#__PURE__*/React.createElement("div", {
    key: wi + '-' + day,
    style: {
      animation: 'om-rise 220ms var(--ease-out) both'
    }
  }, shownPosts.length ? /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement(KLabel, {
    style: {
      display: 'block',
      marginBottom: 10
    }
  }, day ? 'Posted Aug ' + day : 'Posted this week'), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 10
    }
  }, shownPosts.map(q => /*#__PURE__*/React.createElement("div", {
    key: q.id,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 11,
      padding: '10px 12px',
      borderRadius: 12,
      background: 'var(--fill-quiet)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 34,
      height: 44,
      flex: '0 0 auto',
      borderRadius: 9,
      background: 'var(--blue-100)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: q.format === 'Video' ? 'play' : 'images',
    size: 13,
    color: "var(--blue-700)"
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      font: '700 13px var(--web-ui)',
      color: 'var(--ink)',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, q.title), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      marginTop: 1,
      font: '600 11.5px var(--web-ui)',
      color: 'var(--slate-400)'
    }
  }, "Aug ", q.day, " \xB7 ", q.creator, " \xB7 ", fmtK(q.viewsN), " views \xB7 ", money(q.earned))), /*#__PURE__*/React.createElement("a", {
    href: q.link,
    target: "_blank",
    rel: "noreferrer",
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      padding: '7px 13px',
      borderRadius: 999,
      background: 'var(--white)',
      border: '1px solid var(--border)',
      font: '700 12px var(--web-ui)',
      color: 'var(--ink)',
      textDecoration: 'none',
      whiteSpace: 'nowrap'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "link",
    size: 12,
    color: "var(--ink)"
  }), "Open"))))) : null, shownBriefs.length ? /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(KLabel, {
    style: {
      display: 'block',
      marginBottom: 10
    }
  }, day ? 'Brief for Aug ' + day : 'Briefs this week'), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: shownBriefs.length > 1 ? '1fr 1fr' : '1fr',
      gap: 12
    }
  }, shownBriefs.map(b => /*#__PURE__*/React.createElement("div", {
    key: b.id,
    style: {
      border: '1px solid var(--line)',
      borderRadius: 14,
      padding: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      font: '700 15px var(--web-ui)',
      color: 'var(--ink)'
    }
  }, b.title), /*#__PURE__*/React.createElement("span", {
    style: {
      font: '600 12px var(--web-ui)',
      color: 'var(--slate-400)',
      whiteSpace: 'nowrap'
    }
  }, "Aug ", b.day), /*#__PURE__*/React.createElement(KChip, {
    tone: "slate"
  }, b.format), /*#__PURE__*/React.createElement(KChip, {
    tone: b.status === 'Active' ? 'green' : 'slate'
  }, b.status)), /*#__PURE__*/React.createElement(BriefBlock, {
    label: "Hook",
    text: b.hook
  }), /*#__PURE__*/React.createElement(BriefBlock, {
    label: "Script",
    text: b.script
  }), /*#__PURE__*/React.createElement(BriefBlock, {
    label: "Caption",
    text: b.caption
  }))))) : /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      font: '600 13.5px var(--web-ui)',
      color: 'var(--slate-400)'
    }
  }, shownPosts.length ? 'No brief ran ' + (day ? 'this day.' : 'this week.') : 'Nothing ran ' + (day ? 'on Aug ' + day + '.' : 'this week.'))));
}
function UserProfile({
  p,
  onBack,
  onOpenCompany,
  onResend,
  resent
}) {
  const {
    Icon
  } = window.NoniDesignSystem_710e43;
  const [selPost, setSelPost] = React.useState(null);
  const posts = SEED_POSTS.filter(q => q.creator === p.name).sort((a, b) => b.viewsN - a.viewsN);
  const earned = posts.reduce((n, q) => n + q.earned, 0);
  if (selPost) return /*#__PURE__*/React.createElement("div", {
    style: {
      animation: 'om-rise 260ms var(--ease-out) both'
    }
  }, /*#__PURE__*/React.createElement(KPageHead, {
    onBack: () => setSelPost(null),
    title: p.name,
    sub: `${p.role} · ${companyName(p.company)}`,
    right: /*#__PURE__*/React.createElement(KChip, {
      tone: statusTone(p.status)
    }, p.status)
  }), /*#__PURE__*/React.createElement(PostDetail, {
    q: selPost,
    onBack: () => setSelPost(null)
  }));
  const Row = ({
    label,
    value
  }) => /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '12px 20px',
      borderTop: '1px solid var(--line)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 84,
      font: '600 12.5px var(--web-ui)',
      color: 'var(--slate-400)'
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      font: '600 13.5px var(--web-ui)',
      color: 'var(--ink)'
    }
  }, value));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      animation: 'om-rise 260ms var(--ease-out) both'
    }
  }, /*#__PURE__*/React.createElement(KPageHead, {
    onBack: onBack,
    title: p.name,
    sub: `${p.role} · ${companyName(p.company)}`,
    right: /*#__PURE__*/React.createElement(KChip, {
      tone: statusTone(p.status)
    }, p.status)
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'minmax(280px, 340px) minmax(0, 1fr)',
      gap: 14,
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement(KCard, {
    pad: 0
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 13,
      padding: '18px 20px'
    }
  }, /*#__PURE__*/React.createElement(KAvatar, {
    name: p.name,
    size: 46
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      font: '700 15px var(--web-ui)',
      color: 'var(--ink)'
    }
  }, p.name), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      marginTop: 3
    }
  }, /*#__PURE__*/React.createElement(KChip, {
    tone: p.role === 'Company admin' ? 'blue' : 'slate'
  }, p.role)))), /*#__PURE__*/React.createElement(Row, {
    label: "Email",
    value: p.email
  }), /*#__PURE__*/React.createElement(Row, {
    label: "Phone",
    value: p.phone
  }), /*#__PURE__*/React.createElement(Row, {
    label: "Joined",
    value: p.joined
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '12px 20px',
      borderTop: '1px solid var(--line)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 84,
      font: '600 12.5px var(--web-ui)',
      color: 'var(--slate-400)'
    }
  }, "Company"), /*#__PURE__*/React.createElement("a", {
    onClick: () => onOpenCompany(p.company),
    style: {
      flex: 1,
      font: '700 13.5px var(--web-ui)',
      color: 'var(--blue-700)',
      cursor: 'pointer'
    }
  }, companyName(p.company))), p.status === 'Invite pending' || p.status === 'Pending' ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 20px',
      borderTop: '1px solid var(--line)'
    }
  }, /*#__PURE__*/React.createElement(KPill, {
    variant: "tint",
    icon: "rotate-ccw",
    onClick: onResend,
    style: {
      width: '100%'
    }
  }, resent ? 'Sent just now' : 'Resend invite')) : null), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
      minWidth: 0
    }
  }, p.role === 'Creator' ? /*#__PURE__*/React.createElement(KCard, {
    pad: 22,
    style: {
      display: 'flex',
      gap: 18
    }
  }, [['Posts this month', p.posts], ['Views this month', p.viewsN ? fmtK(p.viewsN) : '—'], ['Earned', earned ? money(earned) : '—']].map(([l, v]) => /*#__PURE__*/React.createElement("span", {
    key: l,
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      font: '600 12px var(--web-ui)',
      color: 'var(--slate-400)'
    }
  }, l), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      marginTop: 5,
      font: '700 26px var(--web-display)',
      letterSpacing: '-0.5px',
      color: 'var(--ink)'
    }
  }, v)))) : p.role === 'Campaign manager' ? /*#__PURE__*/React.createElement(ManagerWeek, {
    companyId: p.company
  }) : /*#__PURE__*/React.createElement(KCard, {
    pad: 22
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      font: '600 14px/1.6 var(--web-ui)',
      color: 'var(--slate-500)'
    }
  }, `Owns ${companyName(p.company)}'s program on the web dashboard — brand brain, features, billing and the campaign team.`)), p.role === 'Creator' ? /*#__PURE__*/React.createElement(KCard, {
    pad: 0
  }, /*#__PURE__*/React.createElement(KLabel, {
    style: {
      display: 'block',
      padding: '16px 20px 8px'
    }
  }, "Posts"), posts.length === 0 ? /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      padding: '4px 20px 18px',
      font: '600 13.5px var(--web-ui)',
      color: 'var(--slate-400)'
    }
  }, "Nothing published yet.") : /*#__PURE__*/React.createElement("div", {
    style: {
      maxHeight: 400,
      overflowY: 'auto'
    }
  }, posts.map((q, i) => /*#__PURE__*/React.createElement("div", {
    key: q.id,
    role: "button",
    onClick: () => setSelPost(q),
    onMouseEnter: e => e.currentTarget.style.background = 'var(--fill-quiet)',
    onMouseLeave: e => e.currentTarget.style.background = 'transparent',
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 13,
      padding: '13px 20px',
      borderTop: '1px solid var(--line)',
      cursor: 'pointer',
      transition: 'background var(--dur-fast) var(--ease-out)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 42,
      height: 56,
      flex: '0 0 auto',
      borderRadius: 10,
      background: 'var(--blue-100)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: q.format === 'Video' ? 'play' : 'images',
    size: 15,
    color: "var(--blue-700)"
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      font: '700 14px var(--web-ui)',
      color: 'var(--ink)',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, q.title), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      marginTop: 2,
      font: '600 12.5px var(--web-ui)',
      color: 'var(--slate-400)'
    }
  }, q.date, " \xB7 ", q.format, " \xB7 TikTok ", fmtK(q.tt.views), " \xB7 IG ", fmtK(q.ig.views))), /*#__PURE__*/React.createElement("span", {
    style: {
      textAlign: 'right'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      font: '700 15px var(--web-display)',
      color: 'var(--ink)'
    }
  }, fmtK(q.viewsN)), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      marginTop: 2,
      font: '700 12px var(--web-ui)',
      color: 'var(--green, #1F9D5B)'
    }
  }, money(q.earned))))))) : null)), p.role === 'Campaign manager' ? /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14
    }
  }, /*#__PURE__*/React.createElement(ManagerBriefs, {
    companyId: p.company
  })) : null);
}

/* ---------- pages ---------- */

function ScopeDropdown({
  companies,
  scope,
  onSelect
}) {
  const {
    Icon
  } = window.NoniDesignSystem_710e43;
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    const out = e => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    window.addEventListener('mousedown', out);
    return () => window.removeEventListener('mousedown', out);
  }, []);
  const current = scope === 'all' ? 'All companies' : (companies.find(c => c.id === scope) || {}).name;
  const Item = ({
    id,
    label
  }) => /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => {
      onSelect(id);
      setOpen(false);
    },
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      width: '100%',
      padding: '9px 12px',
      borderRadius: 10,
      border: 'none',
      cursor: 'pointer',
      textAlign: 'left',
      background: 'transparent',
      whiteSpace: 'nowrap',
      font: '700 13.5px var(--web-ui)',
      color: 'var(--ink)'
    },
    onMouseEnter: e => e.currentTarget.style.background = 'var(--fill-quiet)',
    onMouseLeave: e => e.currentTarget.style.background = 'transparent'
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }, label), scope === id ? /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 14,
    color: "var(--blue-700)"
  }) : null);
  return /*#__PURE__*/React.createElement("div", {
    ref: ref,
    style: {
      position: 'relative',
      display: 'inline-block',
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setOpen(!open),
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      padding: '8px 14px',
      borderRadius: 999,
      border: '1px solid var(--border)',
      cursor: 'pointer',
      background: 'var(--white)',
      boxShadow: 'var(--shadow-card)',
      whiteSpace: 'nowrap',
      font: '700 13px var(--web-ui)',
      color: 'var(--ink)'
    }
  }, current, /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-down",
    size: 14,
    color: "var(--slate-400)"
  })), open ? /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 'calc(100% + 6px)',
      left: 0,
      zIndex: 70,
      minWidth: 230,
      background: 'var(--white)',
      border: '1px solid var(--border)',
      borderRadius: 14,
      boxShadow: 'var(--shadow-raised)',
      padding: 6,
      transformOrigin: 'top left',
      animation: 'om-pop 160ms var(--ease-out) both'
    }
  }, /*#__PURE__*/React.createElement(Item, {
    id: "all",
    label: "All companies"
  }), companies.map(c => /*#__PURE__*/React.createElement(Item, {
    key: c.id,
    id: c.id,
    label: c.name
  }))) : null);
}
function FiltersDropdown({
  formatF,
  creatorF,
  creatorNames,
  onFormat,
  onCreator
}) {
  const {
    Icon
  } = window.NoniDesignSystem_710e43;
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    const out = e => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    window.addEventListener('mousedown', out);
    return () => window.removeEventListener('mousedown', out);
  }, []);
  const n = (formatF !== 'All formats' ? 1 : 0) + (creatorF !== 'All creators' ? 1 : 0);
  const Item = ({
    label,
    on,
    pick
  }) => /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: pick,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      width: '100%',
      padding: '8px 12px',
      borderRadius: 10,
      border: 'none',
      cursor: 'pointer',
      textAlign: 'left',
      background: 'transparent',
      whiteSpace: 'nowrap',
      font: '700 13px var(--web-ui)',
      color: 'var(--ink)'
    },
    onMouseEnter: e => e.currentTarget.style.background = 'var(--fill-quiet)',
    onMouseLeave: e => e.currentTarget.style.background = 'transparent'
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }, label), on ? /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 13,
    color: "var(--blue-700)"
  }) : null);
  return /*#__PURE__*/React.createElement("div", {
    ref: ref,
    style: {
      position: 'relative',
      display: 'inline-block'
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setOpen(!open),
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 7,
      padding: '8px 14px',
      borderRadius: 999,
      border: '1px solid var(--border)',
      cursor: 'pointer',
      whiteSpace: 'nowrap',
      boxShadow: 'var(--shadow-card)',
      background: n ? 'var(--blue-100)' : 'var(--white)',
      font: '700 13px var(--web-ui)',
      color: n ? 'var(--blue-700)' : 'var(--ink)'
    }
  }, "Filters", n ? ' · ' + n : '', /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-down",
    size: 13,
    color: n ? 'var(--blue-700)' : 'var(--slate-400)'
  })), open ? /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 'calc(100% + 6px)',
      left: 0,
      zIndex: 70,
      minWidth: 210,
      background: 'var(--white)',
      border: '1px solid var(--border)',
      borderRadius: 14,
      boxShadow: 'var(--shadow-raised)',
      padding: 6,
      transformOrigin: 'top left',
      animation: 'om-pop 160ms var(--ease-out) both'
    }
  }, /*#__PURE__*/React.createElement(KLabel, {
    style: {
      display: 'block',
      padding: '8px 12px 4px'
    }
  }, "Format"), ['All formats', 'Video', 'Carousel'].map(f => /*#__PURE__*/React.createElement(Item, {
    key: f,
    label: f,
    on: formatF === f,
    pick: () => onFormat(f)
  })), /*#__PURE__*/React.createElement(KLabel, {
    style: {
      display: 'block',
      padding: '10px 12px 4px',
      borderTop: '1px solid var(--line)',
      marginTop: 6
    }
  }, "Creator"), ['All creators', ...creatorNames].map(c => /*#__PURE__*/React.createElement(Item, {
    key: c,
    label: c,
    on: creatorF === c,
    pick: () => onCreator(c)
  }))) : null);
}
const RANGES = ['Last 24 hours', 'Last 7 days', 'Last 2 weeks', 'Last month', 'Last 12 weeks'];
const SORTS = ['Views over time', 'Top creators', 'Top posts', 'Formats'];
function rangeData(range, weekly) {
  const lastW = weekly[weekly.length - 1] || 0;
  const wave = (n, base, amp, rise) => Array.from({
    length: n
  }, (_, i) => Math.max(0.1, +(base * (1 + amp * Math.sin(i * 1.35 + 0.8) + rise * i / n)).toFixed(1)));
  if (range === 'Last 24 hours') return {
    data: wave(12, lastW / 7 / 10, 0.45, 0.5),
    labels: ['2a', '6a', '10a', '2p', '6p', '10p']
  };
  if (range === 'Last 7 days') return {
    data: wave(7, lastW / 7, 0.3, 0.25),
    labels: ['Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue']
  };
  if (range === 'Last 2 weeks') return {
    data: wave(14, lastW / 7, 0.35, 0.3),
    labels: ['Jul 30', 'Aug 3', 'Aug 7', 'Aug 11']
  };
  if (range === 'Last month') return {
    data: weekly.slice(-5),
    labels: ['Jul 13', 'Jul 20', 'Jul 27', 'Aug 3', 'Aug 10']
  };
  return {
    data: weekly,
    labels: ['May 25', 'Jun 8', 'Jun 22', 'Jul 6', 'Jul 20', 'Aug 3']
  };
}
function OpsOverview({
  companies,
  creators,
  go
}) {
  const {
    Icon
  } = window.NoniDesignSystem_710e43;
  const [scope, setScope] = React.useState('all');
  const [range, setRange] = React.useState('Last 7 days');
  const [sortBy, setSortBy] = React.useState('Views over time');
  const [formatF, setFormatF] = React.useState('All formats');
  const [creatorF, setCreatorF] = React.useState('All creators');
  const active = companies.filter(c => c.status === 'Active');
  const one = scope === 'all' ? null : companies.find(c => c.id === scope);
  const pickScope = id => {
    setScope(id);
    setCreatorF('All creators');
  };
  const series = one ? one.series : Array.from({
    length: 12
  }, (_, i) => active.reduce((n, c) => n + (c.series[i] || 0), 0));
  const stats = one ? {
    views: one.views,
    posts: one.posts,
    campaigns: one.campaigns,
    creators: one.creators,
    dViews: one.deltas.views,
    dPosts: one.deltas.posts,
    dCamp: one.deltas.campaigns
  } : {
    views: '2.0M',
    posts: companies.reduce((n, c) => n + c.posts, 0),
    campaigns: companies.reduce((n, c) => n + c.campaigns, 0),
    creators: creators.length,
    dViews: '+15% vs July',
    dPosts: '+14% vs July',
    dCamp: `${active.length} companies`
  };
  const scopeCreators = creators.filter(r => (one ? r.company === one.id : true) && r.viewsN > 0).sort((a, b) => b.viewsN - a.viewsN);
  const formats = one ? one.formats : active.reduce((acc, c) => {
    Object.entries(c.formats).forEach(([k, v]) => acc[k] = (acc[k] || 0) + v);
    return acc;
  }, {});
  const fmtTotal = (formats.Video || 0) + (formats.Carousel || 0);
  const fmtShare = formatF === 'All formats' || !fmtTotal ? 1 : (formats[formatF] || 0) / fmtTotal;
  const crTotal = scopeCreators.reduce((n, p) => n + p.viewsN, 0) || 1;
  const crObj = scopeCreators.find(p => p.name === creatorF);
  const crShare = crObj ? crObj.viewsN / crTotal : 1;
  const factor = fmtShare * crShare;
  const chart = rangeData(range, series.map(v => +(v * factor).toFixed(1)));
  const barCreators = (crObj ? [crObj] : scopeCreators).map(p => ({
    ...p,
    v: Math.round(p.viewsN * fmtShare / 1000)
  }));
  const maxCr = Math.max(...barCreators.map(p => p.v), 1);
  const posts = SEED_POSTS.filter(q => (!one || q.company === one.id) && (formatF === 'All formats' || q.format === formatF) && (creatorF === 'All creators' || q.creator === creatorF)).sort((a, b) => b.viewsN - a.viewsN);
  const fmtEntries = Object.entries(formats).filter(([k]) => formatF === 'All formats' || k === formatF).map(([k, v]) => [k, Math.round(v * crShare)]);
  const maxFmt = Math.max(...fmtEntries.map(([, v]) => v), 1);
  const scopeLabel = one ? one.name : 'All companies';
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(KPageHead, {
    title: ({
      'Last 24 hours': 'Today',
      'Last 7 days': 'This Week',
      'Last 2 weeks': 'Last 2 Weeks',
      'Last month': 'This Month',
      'Last 12 weeks': 'Last 12 Weeks'
    }[range] || range) + ' on Noni'
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 18,
      alignItems: 'flex-start',
      paddingBottom: 22,
      borderBottom: '1px solid var(--line)',
      marginBottom: 22
    }
  }, /*#__PURE__*/React.createElement(StatInline, {
    label: "Views this month",
    value: stats.views,
    delta: stats.dViews
  }), /*#__PURE__*/React.createElement(StatInline, {
    label: "Posts this month",
    value: stats.posts,
    delta: stats.dPosts
  }), /*#__PURE__*/React.createElement(StatInline, {
    label: "Active campaigns",
    value: stats.campaigns,
    delta: stats.dCamp
  }), /*#__PURE__*/React.createElement(StatInline, {
    label: "Creators",
    value: stats.creators
  }), one ? /*#__PURE__*/React.createElement(KPill, {
    size: "sm",
    variant: "tint",
    icon: "arrow-right",
    onClick: () => go('Companies', one.id)
  }, "View company") : null), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      alignItems: 'center',
      marginBottom: 22,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement(ScopeDropdown, {
    companies: active,
    scope: scope,
    onSelect: pickScope
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement(FiltersDropdown, {
    formatF: formatF,
    creatorF: creatorF,
    creatorNames: scopeCreators.map(p => p.name),
    onFormat: setFormatF,
    onCreator: setCreatorF
  }), /*#__PURE__*/React.createElement(SortDropdown, {
    prefix: "Sort by",
    options: SORTS,
    value: sortBy,
    onSelect: setSortBy
  }), /*#__PURE__*/React.createElement(SortDropdown, {
    prefix: "",
    options: RANGES,
    value: range,
    onSelect: setRange
  })), /*#__PURE__*/React.createElement("div", {
    key: sortBy + scope + range + formatF + creatorF,
    style: {
      animation: 'om-rise 240ms var(--ease-out) both'
    }
  }, sortBy === 'Views over time' ? /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement(KLabel, {
    style: {
      flex: 1
    }
  }, "Views")), /*#__PURE__*/React.createElement(AreaChart, {
    series: chart.data,
    labels: chart.labels,
    vb: 300
  })) : null, sortBy === 'Top creators' ? /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(KLabel, {
    style: {
      display: 'block',
      marginBottom: 18
    }
  }, "Top creators \xB7 ", scopeLabel, formatF !== 'All formats' ? ' · ' + formatF : ''), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 15,
      maxWidth: 720
    }
  }, barCreators.map(p => /*#__PURE__*/React.createElement(BarRow, {
    key: p.id,
    label: p.name.split(' ')[0],
    value: p.v,
    max: maxCr,
    suffix: "k"
  })))) : null, sortBy === 'Top posts' ? /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(KLabel, {
    style: {
      display: 'block',
      marginBottom: 16
    }
  }, "Top posts \xB7 ", scopeLabel, formatF !== 'All formats' ? ' · ' + formatF : '', creatorF !== 'All creators' ? ' · ' + creatorF : ''), posts.length === 0 ? /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      font: '600 14px var(--web-ui)',
      color: 'var(--slate-400)'
    }
  }, "No posts match these filters.") : /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 12
    }
  }, posts.map(q => /*#__PURE__*/React.createElement(KCard, {
    key: q.id,
    pad: 14,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 13
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 42,
      height: 56,
      flex: '0 0 auto',
      borderRadius: 10,
      background: 'var(--blue-100)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: q.format === 'Video' ? 'play' : 'images',
    size: 15,
    color: "var(--blue-700)"
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      font: '700 14px var(--web-ui)',
      color: 'var(--ink)',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, q.title), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      marginTop: 2,
      font: '600 12.5px var(--web-ui)',
      color: 'var(--slate-400)'
    }
  }, q.creator, " \xB7 ", q.format, " \xB7 ", companyName(q.company))), /*#__PURE__*/React.createElement("span", {
    style: {
      font: '700 14px var(--web-ui)',
      color: 'var(--ink)'
    }
  }, fmtK(q.viewsN)))))) : null, sortBy === 'Formats' ? /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(KLabel, {
    style: {
      display: 'block',
      marginBottom: 18
    }
  }, "Posts by format \xB7 ", scopeLabel, creatorF !== 'All creators' ? ' · ' + creatorF : ''), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 15,
      maxWidth: 720
    }
  }, fmtEntries.map(([k, v]) => /*#__PURE__*/React.createElement(BarRow, {
    key: k,
    label: k,
    value: v,
    max: maxFmt
  })))) : null));
}
function OpsCompanies({
  companies,
  go,
  onNew
}) {
  const shown = companies.filter(c => c.status === 'Active');
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(KPageHead, {
    title: "Companies",
    sub: "Every company on Noni, one admin each. New company sends that admin an email invite \u2014 they appear here once they accept.",
    right: /*#__PURE__*/React.createElement(KPill, {
      icon: "plus",
      onClick: onNew
    }, "New company")
  }), /*#__PURE__*/React.createElement(KCard, {
    pad: 0
  }, shown.map((c, i) => /*#__PURE__*/React.createElement(CompanyRow, {
    key: c.id,
    c: c,
    onOpen: () => go('Companies', c.id),
    last: i === shown.length - 1
  }))));
}
function HoverPeek({
  label = 'View profile',
  onClick,
  children
}) {
  const [pos, setPos] = React.useState(null);
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClick,
    onMouseMove: e => setPos({
      x: e.clientX,
      y: e.clientY
    }),
    onMouseLeave: () => setPos(null),
    style: {
      cursor: 'pointer'
    }
  }, children, pos ? ReactDOM.createPortal(/*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      left: pos.x + 14,
      top: pos.y + 16,
      zIndex: 90,
      pointerEvents: 'none',
      padding: '6px 11px',
      borderRadius: 999,
      background: 'var(--ink)',
      color: '#fff',
      font: '700 11.5px var(--web-ui)',
      boxShadow: 'var(--shadow-raised)',
      whiteSpace: 'nowrap'
    }
  }, label), document.body) : null);
}
function MonthCal({
  days,
  onPick
}) {
  const first = 6; // Aug 1, 2026 is a Saturday
  const cells = [...Array(first).fill(null), ...Array.from({
    length: 31
  }, (_, i) => i + 1)];
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      gap: 4,
      marginBottom: 6
    }
  }, ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => /*#__PURE__*/React.createElement("span", {
    key: d,
    style: {
      textAlign: 'center',
      font: '800 10.5px var(--web-ui)',
      letterSpacing: '0.7px',
      textTransform: 'uppercase',
      color: 'var(--slate-400)'
    }
  }, d))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      gap: 4
    }
  }, cells.map((d, i) => {
    if (d === null) return /*#__PURE__*/React.createElement("span", {
      key: 'e' + i
    });
    const data = days[d];
    const today = d === 12;
    return /*#__PURE__*/React.createElement("button", {
      key: d,
      type: "button",
      onClick: data ? () => onPick(d) : undefined,
      style: {
        minHeight: 64,
        borderRadius: 12,
        border: 'none',
        cursor: data ? 'pointer' : 'default',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        background: today ? 'var(--blue-100)' : 'transparent',
        transition: 'background var(--dur-fast) var(--ease-out)'
      },
      onMouseEnter: e => {
        if (data) e.currentTarget.style.background = 'var(--fill-quiet)';
      },
      onMouseLeave: e => {
        e.currentTarget.style.background = today ? 'var(--blue-100)' : 'transparent';
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        font: '700 13.5px var(--web-ui)',
        color: today ? 'var(--blue-700)' : 'var(--ink)'
      }
    }, d), data ? /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 4
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        padding: '1px 7px',
        borderRadius: 999,
        background: 'var(--green-soft, #E4F6EC)',
        color: 'var(--green, #1F9D5B)',
        font: '700 10.5px var(--web-ui)'
      }
    }, data.signups), /*#__PURE__*/React.createElement("span", {
      style: {
        font: '700 10.5px var(--web-ui)',
        color: 'var(--slate-400)'
      }
    }, moneyK(data.sales))) : null);
  })));
}
function DayModal({
  c,
  day,
  onClose
}) {
  const data = COMPANY_DAYS[c.id][day];
  const dayPosts = SEED_POSTS.filter(q => q.company === c.id && q.day === day);
  const {
    Icon
  } = window.NoniDesignSystem_710e43;
  const Cell = ({
    label,
    value
  }) => /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      font: '600 12px var(--web-ui)',
      color: 'var(--slate-400)'
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      marginTop: 4,
      font: '700 22px var(--web-display)',
      letterSpacing: '-0.4px',
      color: 'var(--ink)'
    }
  }, value));
  return /*#__PURE__*/React.createElement(KModal, {
    title: 'August ' + day + ' · ' + c.name,
    onClose: onClose
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 14,
      paddingBottom: 16,
      borderBottom: '1px solid var(--line)'
    }
  }, /*#__PURE__*/React.createElement(Cell, {
    label: "Sales",
    value: money(data.sales)
  }), /*#__PURE__*/React.createElement(Cell, {
    label: "Sign-ups",
    value: data.signups
  }), /*#__PURE__*/React.createElement(Cell, {
    label: "Downloads",
    value: data.downloads
  })), /*#__PURE__*/React.createElement(KLabel, {
    style: {
      display: 'block',
      margin: '16px 0 10px'
    }
  }, "Posted that day"), dayPosts.length === 0 ? /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      font: '600 13.5px var(--web-ui)',
      color: 'var(--slate-400)'
    }
  }, "No posts published this day.") : /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, dayPosts.map(q => /*#__PURE__*/React.createElement("div", {
    key: q.id,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 11
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 34,
      height: 44,
      flex: '0 0 auto',
      borderRadius: 9,
      background: 'var(--blue-100)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: q.format === 'Video' ? 'play' : 'images',
    size: 13,
    color: "var(--blue-700)"
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      font: '700 13px var(--web-ui)',
      color: 'var(--ink)',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, q.title), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      marginTop: 1,
      font: '600 11.5px var(--web-ui)',
      color: 'var(--slate-400)'
    }
  }, q.creator, " \xB7 ", q.format)), /*#__PURE__*/React.createElement("span", {
    style: {
      font: '700 13px var(--web-ui)',
      color: 'var(--ink)'
    }
  }, fmtK(q.viewsN))))));
}
function CompanyExplorer({
  c,
  onOpenProfile
}) {
  const {
    Icon
  } = window.NoniDesignSystem_710e43;
  const [range, setRange] = React.useState('Last 12 weeks');
  const [sortBy, setSortBy] = React.useState('Views over time');
  const [formatF, setFormatF] = React.useState('All formats');
  const [creatorF, setCreatorF] = React.useState('All creators');
  const [selPost, setSelPost] = React.useState(null);
  const scopeCreators = SEED_PEOPLE.filter(p => p.company === c.id && p.role === 'Creator' && p.viewsN > 0).sort((a, b) => b.viewsN - a.viewsN);
  const formats = c.formats;
  const fmtTotal = (formats.Video || 0) + (formats.Carousel || 0);
  const fmtShare = formatF === 'All formats' || !fmtTotal ? 1 : (formats[formatF] || 0) / fmtTotal;
  const crTotal = scopeCreators.reduce((n, p) => n + p.viewsN, 0) || 1;
  const crObj = scopeCreators.find(p => p.name === creatorF);
  const crShare = crObj ? crObj.viewsN / crTotal : 1;
  const chart = rangeData(range, c.series.map(v => +(v * fmtShare * crShare).toFixed(1)));
  const barCreators = (crObj ? [crObj] : scopeCreators).map(p => ({
    ...p,
    v: Math.round(p.viewsN * fmtShare / 1000)
  }));
  const maxCr = Math.max(...barCreators.map(p => p.v), 1);
  const posts = SEED_POSTS.filter(q => q.company === c.id && (formatF === 'All formats' || q.format === formatF) && (creatorF === 'All creators' || q.creator === creatorF)).sort((a, b) => b.viewsN - a.viewsN);
  const fmtEntries = Object.entries(formats).filter(([k]) => formatF === 'All formats' || k === formatF).map(([k, v]) => [k, Math.round(v * crShare)]);
  const maxFmt = Math.max(...fmtEntries.map(([, v]) => v), 1);
  if (selPost) return /*#__PURE__*/React.createElement(KCard, {
    pad: 22
  }, /*#__PURE__*/React.createElement(PostDetail, {
    q: selPost,
    onBack: () => setSelPost(null)
  }));
  return /*#__PURE__*/React.createElement(KCard, {
    pad: 22
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      alignItems: 'center',
      marginBottom: 18,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement(FiltersDropdown, {
    formatF: formatF,
    creatorF: creatorF,
    creatorNames: scopeCreators.map(p => p.name),
    onFormat: setFormatF,
    onCreator: setCreatorF
  }), /*#__PURE__*/React.createElement(SortDropdown, {
    prefix: "Sort by",
    options: SORTS,
    value: sortBy,
    onSelect: setSortBy
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement(SortDropdown, {
    prefix: "",
    options: RANGES,
    value: range,
    onSelect: setRange
  })), /*#__PURE__*/React.createElement("div", {
    key: sortBy + range + formatF + creatorF,
    style: {
      animation: 'om-rise 240ms var(--ease-out) both'
    }
  }, sortBy === 'Views over time' ? /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement(KLabel, {
    style: {
      flex: 1
    }
  }, "Views"), /*#__PURE__*/React.createElement("span", {
    style: {
      font: '600 12.5px var(--web-ui)',
      color: 'var(--slate-400)'
    }
  }, formatF !== 'All formats' ? formatF + ' · ' : '', creatorF !== 'All creators' ? creatorF : formatF === 'All formats' ? c.name : '')), /*#__PURE__*/React.createElement(AreaChart, {
    series: chart.data,
    labels: chart.labels,
    vb: 250
  })) : null, sortBy === 'Top creators' ? /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(KLabel, {
    style: {
      display: 'block',
      marginBottom: 14
    }
  }, "Top creators", formatF !== 'All formats' ? ' · ' + formatF : ''), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column'
    }
  }, barCreators.map(p => /*#__PURE__*/React.createElement(HoverPeek, {
    key: p.id,
    onClick: () => onOpenProfile(p)
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '7px 6px',
      margin: '0 -6px',
      borderRadius: 10
    },
    onMouseEnter: e => e.currentTarget.style.background = 'var(--fill-quiet)',
    onMouseLeave: e => e.currentTarget.style.background = 'transparent'
  }, /*#__PURE__*/React.createElement(BarRow, {
    label: p.name.split(' ')[0],
    value: p.v,
    max: maxCr,
    suffix: "k"
  })))))) : null, sortBy === 'Top posts' ? /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(KLabel, {
    style: {
      display: 'block',
      marginBottom: 14
    }
  }, "Top posts", formatF !== 'All formats' ? ' · ' + formatF : '', creatorF !== 'All creators' ? ' · ' + creatorF : ''), posts.length === 0 ? /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      font: '600 14px var(--web-ui)',
      color: 'var(--slate-400)'
    }
  }, "No posts match these filters.") : /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 12
    }
  }, posts.map(q => /*#__PURE__*/React.createElement(HoverPeek, {
    key: q.id,
    label: "View post",
    onClick: () => setSelPost(q)
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 13,
      padding: '12px 14px',
      borderRadius: 14,
      border: '1px solid var(--line)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 42,
      height: 56,
      flex: '0 0 auto',
      borderRadius: 10,
      background: 'var(--blue-100)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: q.format === 'Video' ? 'play' : 'images',
    size: 15,
    color: "var(--blue-700)"
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      font: '700 14px var(--web-ui)',
      color: 'var(--ink)',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, q.title), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      marginTop: 2,
      font: '600 12.5px var(--web-ui)',
      color: 'var(--slate-400)'
    }
  }, q.creator, " \xB7 ", q.format)), /*#__PURE__*/React.createElement("span", {
    style: {
      font: '700 14px var(--web-ui)',
      color: 'var(--ink)'
    }
  }, fmtK(q.viewsN))))))) : null, sortBy === 'Formats' ? /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(KLabel, {
    style: {
      display: 'block',
      marginBottom: 14
    }
  }, "Posts by format", creatorF !== 'All creators' ? ' · ' + creatorF : ''), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 13,
      maxWidth: 640
    }
  }, fmtEntries.map(([k, v]) => /*#__PURE__*/React.createElement(BarRow, {
    key: k,
    label: k,
    value: v,
    max: maxFmt
  })))) : null));
}
function CompanyAnalytics({
  c,
  onOpenProfile
}) {
  const {
    Icon
  } = window.NoniDesignSystem_710e43;
  const [day, setDay] = React.useState(null);
  const Stat = ({
    label,
    value,
    delta
  }) => /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      font: '600 12px var(--web-ui)',
      color: 'var(--slate-400)'
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      margin: '5px 0 3px',
      font: '700 24px var(--web-display)',
      letterSpacing: '-0.5px',
      color: 'var(--ink)'
    }
  }, value), delta ? /*#__PURE__*/React.createElement("span", {
    style: {
      font: '600 12px var(--web-ui)',
      color: delta.startsWith('+') ? 'var(--green, #1F9D5B)' : 'var(--slate-400)'
    }
  }, delta) : null);
  if (!c.series.length) return /*#__PURE__*/React.createElement(KCard, {
    pad: 0,
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '64px 24px',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 54,
      height: 54,
      borderRadius: 999,
      background: 'var(--blue-100)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "chart-column",
    size: 22,
    color: "var(--blue-700)"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16,
      font: '700 16px var(--web-display)',
      letterSpacing: '-0.3px',
      color: 'var(--ink)'
    }
  }, "Nothing to chart yet"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '6px 0 0',
      font: '600 14px/1.5 var(--web-ui)',
      color: 'var(--slate-400)',
      maxWidth: 340
    }
  }, "Invite pending. Analytics start the moment their first campaign goes live."));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(KCard, {
    pad: 22,
    style: {
      display: 'flex',
      gap: 18
    }
  }, /*#__PURE__*/React.createElement(Stat, {
    label: "Views this month",
    value: c.views,
    delta: c.deltas.views
  }), /*#__PURE__*/React.createElement(Stat, {
    label: "Posts this month",
    value: c.posts,
    delta: c.deltas.posts
  }), /*#__PURE__*/React.createElement(Stat, {
    label: "Active campaigns",
    value: c.campaigns,
    delta: c.deltas.campaigns
  }), /*#__PURE__*/React.createElement(Stat, {
    label: "Creators",
    value: c.creators,
    delta: c.deltas.creators
  })), /*#__PURE__*/React.createElement(CompanyExplorer, {
    c: c,
    onOpenProfile: onOpenProfile
  }), /*#__PURE__*/React.createElement(KCard, {
    pad: 22
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 10,
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement(KLabel, {
    style: {
      flex: 1
    }
  }, "Daily activity \xB7 August 2026"), /*#__PURE__*/React.createElement("span", {
    style: {
      font: '600 12px var(--web-ui)',
      color: 'var(--slate-400)'
    }
  }, "sign-ups \xB7 sales \xB7 click a day")), /*#__PURE__*/React.createElement(MonthCal, {
    days: COMPANY_DAYS[c.id] || {},
    onPick: setDay
  })), day ? /*#__PURE__*/React.createElement(DayModal, {
    c: c,
    day: day,
    onClose: () => setDay(null)
  }) : null);
}
function CompanyTeam({
  c,
  onOpenProfile
}) {
  const {
    Icon
  } = window.NoniDesignSystem_710e43;
  const [filter, setFilter] = React.useState('Admins');
  const [sort, setSort] = React.useState('Name');
  const roleOf = {
    'Admins': 'Company admin',
    'Campaign Managers': 'Campaign manager',
    'Creators': 'Creator'
  };
  const sortOptions = filter === 'Creators' ? ['Views', 'Posts', 'Name'] : ['Name'];
  const pick = f => {
    setFilter(f);
    setSort(f === 'Creators' ? 'Views' : 'Name');
  };
  const people = SEED_PEOPLE.filter(p => p.company === c.id && p.role === roleOf[filter]);
  people.sort((a, b) => sort === 'Views' ? (b.viewsN || 0) - (a.viewsN || 0) : sort === 'Posts' ? (b.posts || 0) - (a.posts || 0) : a.name.localeCompare(b.name));
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(KTabs, {
    tabs: ['Admins', 'Creators', 'Campaign Managers'],
    active: filter,
    onSelect: pick,
    right: /*#__PURE__*/React.createElement(SortDropdown, {
      options: sortOptions,
      value: sort,
      onSelect: setSort
    })
  }), /*#__PURE__*/React.createElement(KCard, {
    pad: 0,
    key: filter + sort,
    style: {
      animation: 'om-rise 240ms var(--ease-out) both'
    }
  }, people.length === 0 ? /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      padding: '22px 20px',
      font: '600 13.5px var(--web-ui)',
      color: 'var(--slate-400)'
    }
  }, "Nobody here yet.") : people.map((p, i) => /*#__PURE__*/React.createElement(HoverPeek, {
    key: p.id,
    onClick: () => onOpenProfile(p)
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      padding: '14px 20px',
      borderBottom: i === people.length - 1 ? 'none' : '1px solid var(--line)'
    },
    onMouseEnter: e => e.currentTarget.style.background = 'var(--fill-quiet)',
    onMouseLeave: e => e.currentTarget.style.background = 'transparent'
  }, /*#__PURE__*/React.createElement(KAvatar, {
    name: p.name,
    size: 36
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      font: '700 14.5px var(--web-ui)',
      color: 'var(--ink)'
    }
  }, p.name), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      marginTop: 2,
      font: '600 12.5px var(--web-ui)',
      color: 'var(--slate-400)'
    }
  }, p.email)), p.role === 'Creator' ? /*#__PURE__*/React.createElement("span", {
    style: {
      font: '600 13px var(--web-ui)',
      color: 'var(--slate-400)'
    }
  }, p.posts, " posts \xB7 ", p.viewsN ? fmtK(p.viewsN) + ' views' : '—') : null, /*#__PURE__*/React.createElement(KChip, {
    tone: statusTone(p.status)
  }, p.status), /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-right",
    size: 16,
    color: "var(--slate-400)"
  }))))));
}
function PostDetail({
  q,
  onBack
}) {
  const {
    Icon
  } = window.NoniDesignSystem_710e43;
  const PRow = ({
    label,
    value
  }) => /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '9px 0',
      borderBottom: '1px solid var(--line)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      font: '600 13px var(--web-ui)',
      color: 'var(--slate-400)'
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      font: '700 13.5px var(--web-ui)',
      color: 'var(--ink)'
    }
  }, value));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      animation: 'om-rise 240ms var(--ease-out) both'
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onBack,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      marginBottom: 14,
      padding: '7px 13px',
      borderRadius: 999,
      border: '1px solid var(--border)',
      cursor: 'pointer',
      whiteSpace: 'nowrap',
      background: 'var(--white)',
      font: '700 12.5px var(--web-ui)',
      color: 'var(--ink)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-left",
    size: 14,
    color: "var(--ink)"
  }), "All posts"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 22,
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 230,
      height: 306,
      flex: '0 0 auto',
      borderRadius: 18,
      background: 'var(--blue-100)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: 'var(--shadow-media, var(--shadow-card))'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: q.format === 'Video' ? 'play' : 'images',
    size: 34,
    color: "var(--blue-700)"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      font: '700 20px var(--web-display)',
      letterSpacing: '-0.4px',
      color: 'var(--ink)'
    }
  }, q.title), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '6px 0 0',
      font: '600 13.5px var(--web-ui)',
      color: 'var(--slate-400)'
    }
  }, q.creator, " \xB7 ", q.format, " \xB7 posted ", q.date)), /*#__PURE__*/React.createElement("a", {
    href: q.link,
    target: "_blank",
    rel: "noreferrer",
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 7,
      padding: '10px 18px',
      borderRadius: 999,
      background: 'var(--blue-500)',
      color: 'var(--white)',
      font: '700 13.5px var(--web-ui)',
      textDecoration: 'none',
      boxShadow: 'var(--shadow-accent)',
      whiteSpace: 'nowrap'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "link",
    size: 14,
    color: "var(--white)"
  }), "Open post")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 16,
      margin: '20px 0',
      paddingBottom: 18,
      borderBottom: '1px solid var(--line)'
    }
  }, [['Views', fmtK(q.viewsN)], ['Earned', money(q.earned)], ['Sales that day', money(q.sales)], ['Sign-ups that day', q.signups]].map(([l, v]) => /*#__PURE__*/React.createElement("span", {
    key: l,
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      font: '600 12px var(--web-ui)',
      color: 'var(--slate-400)'
    }
  }, l), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      marginTop: 4,
      font: '700 22px var(--web-display)',
      letterSpacing: '-0.4px',
      color: 'var(--ink)'
    }
  }, v)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(KCard, {
    pad: 18
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "music-2",
    size: 15,
    color: "var(--ink)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      font: '700 13.5px var(--web-ui)',
      color: 'var(--ink)'
    }
  }, "TikTok")), /*#__PURE__*/React.createElement(PRow, {
    label: "Views",
    value: fmtK(q.tt.views)
  }), /*#__PURE__*/React.createElement(PRow, {
    label: "Likes",
    value: fmtK(q.tt.likes)
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '9px 0'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      font: '600 13px var(--web-ui)',
      color: 'var(--slate-400)'
    }
  }, "Saves"), /*#__PURE__*/React.createElement("span", {
    style: {
      font: '700 13.5px var(--web-ui)',
      color: 'var(--ink)'
    }
  }, fmtK(q.tt.saves)))), /*#__PURE__*/React.createElement(KCard, {
    pad: 18
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "at-sign",
    size: 15,
    color: "var(--ink)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      font: '700 13.5px var(--web-ui)',
      color: 'var(--ink)'
    }
  }, "Instagram")), /*#__PURE__*/React.createElement(PRow, {
    label: "Views",
    value: fmtK(q.ig.views)
  }), /*#__PURE__*/React.createElement(PRow, {
    label: "Likes",
    value: fmtK(q.ig.likes)
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '9px 0'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      font: '600 13px var(--web-ui)',
      color: 'var(--slate-400)'
    }
  }, "Saves"), /*#__PURE__*/React.createElement("span", {
    style: {
      font: '700 13.5px var(--web-ui)',
      color: 'var(--ink)'
    }
  }, fmtK(q.ig.saves))))))));
}
function CompanyPosts({
  c
}) {
  const {
    Icon
  } = window.NoniDesignSystem_710e43;
  const [sel, setSel] = React.useState(null);
  const posts = SEED_POSTS.filter(q => q.company === c.id).sort((a, b) => b.viewsN - a.viewsN);
  if (sel) return /*#__PURE__*/React.createElement(PostDetail, {
    q: posts.find(x => x.id === sel),
    onBack: () => setSel(null)
  });
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 14
    }
  }, posts.map(q => /*#__PURE__*/React.createElement(HoverPeek, {
    key: q.id,
    label: "View post",
    onClick: () => setSel(q.id)
  }, /*#__PURE__*/React.createElement(KCard, {
    pad: 16,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 54,
      height: 72,
      flex: '0 0 auto',
      borderRadius: 12,
      background: 'var(--blue-100)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: q.format === 'Video' ? 'play' : 'images',
    size: 17,
    color: "var(--blue-700)"
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      font: '700 14.5px var(--web-ui)',
      color: 'var(--ink)',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, q.title), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      marginTop: 3,
      font: '600 12.5px var(--web-ui)',
      color: 'var(--slate-400)'
    }
  }, q.creator, " \xB7 ", q.date), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      marginTop: 5,
      font: '600 12px var(--web-ui)',
      color: 'var(--slate-400)'
    }
  }, "TikTok ", fmtK(q.tt.views), " \xB7 IG ", fmtK(q.ig.views))), /*#__PURE__*/React.createElement("span", {
    style: {
      textAlign: 'right'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      font: '700 16px var(--web-display)',
      color: 'var(--ink)'
    }
  }, fmtK(q.viewsN)), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      marginTop: 2,
      font: '700 12.5px var(--web-ui)',
      color: 'var(--green, #1F9D5B)'
    }
  }, money(q.earned)))))));
}
const BRAIN_DOCS = [{
  name: 'Product',
  sub: 'product_truth',
  words: 640,
  updated: 'Aug 4',
  owner: 'human',
  preview: 'FieldVision turns one sideline phone into a full film crew: auto-tracked footage, instant clips, and shareable highlights minutes after the whistle.'
}, {
  name: 'Audience',
  sub: 'audience_niche',
  words: 480,
  updated: 'Aug 6',
  owner: 'human',
  preview: 'High-school and small-college football programs. Coaches short on staff, players who want their own highlight reels, parents filming from the stands.'
}];
const BRAIN_ACCOUNTS = [{
  handle: '@fieldvision.ai',
  platform: 'music-2',
  kind: 'Reference'
}, {
  handle: '@fieldvision.ai',
  platform: 'at-sign',
  kind: 'Reference'
}, {
  handle: '@coachtape.daily',
  platform: 'music-2',
  kind: 'Discovered'
}, {
  handle: '@fridaynightfilm',
  platform: 'music-2',
  kind: 'Discovered'
}];
function DocModal({
  doc,
  onClose
}) {
  const [text, setText] = React.useState(doc.preview + '\n\n');
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const human = doc.owner === 'human';
  return /*#__PURE__*/React.createElement(KModal, {
    title: doc.name,
    onClose: onClose
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginTop: -10,
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: '600 12px var(--web-ui)',
      color: 'var(--slate-400)'
    }
  }, words, " words \xB7 updated ", doc.updated)), /*#__PURE__*/React.createElement("textarea", {
    value: text,
    onChange: e => setText(e.target.value),
    rows: 9,
    readOnly: !human,
    style: {
      width: '100%',
      boxSizing: 'border-box',
      border: '1px solid var(--border)',
      outline: 'none',
      resize: 'vertical',
      background: human ? 'var(--white)' : 'var(--fill-quiet)',
      borderRadius: 12,
      padding: '12px 14px',
      font: '600 13.5px/1.6 var(--web-ui)',
      color: 'var(--ink)'
    }
  }), human ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      marginTop: 14
    }
  }, /*#__PURE__*/React.createElement(KPill, {
    variant: "tint",
    icon: "sparkles",
    style: {
      flex: 1
    }
  }, "AI clean up"), /*#__PURE__*/React.createElement(KPill, {
    onClick: onClose,
    style: {
      flex: 1
    }
  }, "Save")) : null);
}
function CompanyBrain({
  c
}) {
  const {
    Icon
  } = window.NoniDesignSystem_710e43;
  const [doc, setDoc] = React.useState(null);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 14
    }
  }, BRAIN_DOCS.map(d => /*#__PURE__*/React.createElement(HoverPeek, {
    key: d.name,
    label: "Open doc",
    onClick: () => setDoc(d)
  }, /*#__PURE__*/React.createElement(KCard, {
    pad: 20,
    style: {
      height: '100%',
      boxSizing: 'border-box'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      font: '700 15.5px var(--web-ui)',
      color: 'var(--ink)'
    }
  }, d.name)), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '10px 0 12px',
      font: '600 13px/1.55 var(--web-ui)',
      color: 'var(--slate-500)',
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden'
    }
  }, d.preview), /*#__PURE__*/React.createElement("span", {
    style: {
      font: '600 12px var(--web-ui)',
      color: 'var(--slate-400)'
    }
  }, d.words, " words \xB7 updated ", d.updated))))), /*#__PURE__*/React.createElement(KCard, {
    pad: 0
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '16px 20px 10px'
    }
  }, /*#__PURE__*/React.createElement(KLabel, {
    style: {
      flex: 1
    }
  }, "Inspiration accounts"), /*#__PURE__*/React.createElement(KPill, {
    size: "sm",
    variant: "tint",
    icon: "plus"
  }, "Add account")), BRAIN_ACCOUNTS.map((a, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 11,
      padding: '11px 20px',
      borderTop: '1px solid var(--line)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: a.platform,
    size: 15,
    color: "var(--slate-500)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      font: '700 13.5px var(--web-ui)',
      color: 'var(--ink)'
    }
  }, a.handle), /*#__PURE__*/React.createElement(KChip, {
    tone: a.kind === 'Reference' ? 'blue' : 'slate'
  }, a.kind), /*#__PURE__*/React.createElement(KPill, {
    size: "sm",
    variant: "quiet"
  }, "Mute")))), doc ? /*#__PURE__*/React.createElement(DocModal, {
    doc: doc,
    onClose: () => setDoc(null)
  }) : null);
}
function CompanyBilling({
  c,
  onRemove
}) {
  const {
    Icon
  } = window.NoniDesignSystem_710e43;
  const [confirming, setConfirming] = React.useState(false);
  const [pinged, setPinged] = React.useState(false);
  const b = COMPANY_BILLING[c.id];
  const remaining = b.monthly - b.spent;
  const pct = b.spent / b.monthly;
  const low = remaining / b.monthly < 0.2;
  const barColor = pct > 0.85 ? 'var(--danger, #D6455D)' : pct > 0.6 ? 'var(--amber, #B97D14)' : 'var(--blue-500)';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, low ? /*#__PURE__*/React.createElement(KCard, {
    pad: 16,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 13,
      background: 'var(--amber-soft, #FCF1DD)',
      border: '1px solid transparent'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "circle-alert",
    size: 19,
    color: "var(--amber, #B97D14)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      font: '600 13.5px var(--web-ui)',
      color: 'var(--ink)'
    }
  }, "Running low \u2014 ", money(remaining), " left of this month's budget."), /*#__PURE__*/React.createElement(KPill, {
    size: "sm",
    onClick: () => setPinged(true)
  }, pinged ? 'Pinged ' + b.pingTo + ' ✓' : 'Ping ' + b.pingTo + ' to top up')) : null, /*#__PURE__*/React.createElement(KCard, {
    pad: 22
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 18,
      marginBottom: 18
    }
  }, [['Monthly budget', money(b.monthly)], ['Spent so far', money(b.spent)], ['Remaining', money(remaining)]].map(([l, v]) => /*#__PURE__*/React.createElement("span", {
    key: l,
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      font: '600 12px var(--web-ui)',
      color: 'var(--slate-400)'
    }
  }, l), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      marginTop: 5,
      font: '700 26px var(--web-display)',
      letterSpacing: '-0.5px',
      color: l === 'Remaining' && low ? 'var(--danger, #D6455D)' : 'var(--ink)'
    }
  }, v)))), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 10,
      borderRadius: 999,
      background: 'var(--fill-quiet)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      width: Math.round(pct * 100) + '%',
      height: '100%',
      borderRadius: 999,
      background: barColor,
      transition: 'width 400ms var(--ease-out)'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8,
      font: '600 12.5px var(--web-ui)',
      color: 'var(--slate-400)'
    }
  }, Math.round(pct * 100), "% of August budget used \xB7 pays creator bounties")), /*#__PURE__*/React.createElement(KCard, {
    pad: 0
  }, /*#__PURE__*/React.createElement(KLabel, {
    style: {
      display: 'block',
      padding: '16px 20px 6px'
    }
  }, "Top-ups"), b.topups.map((t, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '12px 20px',
      borderTop: '1px solid var(--line)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 32,
      height: 32,
      borderRadius: 999,
      background: 'var(--green-soft, #E4F6EC)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "dollar-sign",
    size: 14,
    color: "var(--green, #1F9D5B)"
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      font: '700 13.5px var(--web-ui)',
      color: 'var(--ink)'
    }
  }, "Prepaid credits"), /*#__PURE__*/React.createElement("span", {
    style: {
      font: '600 13px var(--web-ui)',
      color: 'var(--slate-400)'
    }
  }, t.date), /*#__PURE__*/React.createElement("span", {
    style: {
      font: '700 14px var(--web-ui)',
      color: 'var(--ink)',
      width: 70,
      textAlign: 'right'
    }
  }, money(t.amt))))), /*#__PURE__*/React.createElement(KCard, {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      font: '600 13.5px/1.5 var(--web-ui)',
      color: 'var(--slate-400)'
    }
  }, "Removing ", c.name, " revokes its admin, managers and creators. There's no undo."), /*#__PURE__*/React.createElement(KPill, {
    size: "sm",
    variant: "danger",
    icon: "trash-2",
    onClick: () => setConfirming(true)
  }, "Remove company")), confirming ? /*#__PURE__*/React.createElement(RemoveCompanyModal, {
    c: c,
    onClose: () => setConfirming(false),
    onConfirm: () => {
      setConfirming(false);
      onRemove(c.id);
    }
  }) : null);
}
function OpsCompanyDetail({
  c,
  go,
  onResend,
  onRemove,
  onViewFull
}) {
  const [tab, setTab] = React.useState('Analytics');
  const [profile, setProfile] = React.useState(null);
  const [resent, setResent] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      animation: 'om-rise 260ms var(--ease-out) both'
    }
  }, /*#__PURE__*/React.createElement(KPageHead, {
    onBack: () => go('Companies'),
    title: c.name,
    sub: `${c.website || 'No website yet'} · joined ${c.joined}`,
    right: /*#__PURE__*/React.createElement(KChip, {
      tone: statusTone(c.status)
    }, c.status)
  }), /*#__PURE__*/React.createElement(KTabs, {
    tabs: ['Analytics', 'Team', 'Posts', 'Company Brain', 'Billing'],
    active: tab,
    onSelect: setTab
  }), /*#__PURE__*/React.createElement("div", {
    key: tab,
    style: {
      animation: 'om-rise 240ms var(--ease-out) both'
    }
  }, tab === 'Analytics' ? /*#__PURE__*/React.createElement(CompanyAnalytics, {
    c: c,
    onOpenProfile: p => {
      setProfile(p);
      setResent(false);
    }
  }) : null, tab === 'Team' ? /*#__PURE__*/React.createElement(CompanyTeam, {
    c: c,
    onOpenProfile: p => {
      setProfile(p);
      setResent(false);
    }
  }) : null, tab === 'Posts' ? /*#__PURE__*/React.createElement(CompanyPosts, {
    c: c
  }) : null, tab === 'Company Brain' ? /*#__PURE__*/React.createElement(CompanyBrain, {
    c: c
  }) : null, tab === 'Billing' ? /*#__PURE__*/React.createElement(CompanyBilling, {
    c: c,
    onRemove: onRemove
  }) : null), profile ? /*#__PURE__*/React.createElement(ProfileModal, {
    p: profile,
    onClose: () => setProfile(null),
    resent: resent,
    onResend: () => {
      setResent(true);
      onResend(profile.email);
    },
    onViewFull: () => {
      const pp = profile;
      setProfile(null);
      onViewFull(pp);
    }
  }) : null);
}
function SortDropdown({
  options,
  value,
  onSelect,
  prefix = 'Sort'
}) {
  const {
    Icon
  } = window.NoniDesignSystem_710e43;
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    const out = e => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    window.addEventListener('mousedown', out);
    return () => window.removeEventListener('mousedown', out);
  }, []);
  return /*#__PURE__*/React.createElement("div", {
    ref: ref,
    style: {
      position: 'relative',
      display: 'inline-block'
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setOpen(!open),
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 7,
      padding: '8px 14px',
      borderRadius: 999,
      border: '1px solid var(--border)',
      cursor: 'pointer',
      whiteSpace: 'nowrap',
      boxShadow: 'var(--shadow-card)',
      background: 'var(--white)',
      font: '700 13px var(--web-ui)',
      color: 'var(--ink)'
    }
  }, prefix ? /*#__PURE__*/React.createElement("span", {
    style: {
      whiteSpace: 'nowrap'
    }
  }, prefix) : /*#__PURE__*/React.createElement("span", {
    style: {
      whiteSpace: 'nowrap'
    }
  }, value), /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-down",
    size: 13,
    color: "var(--slate-400)"
  })), open ? /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 'calc(100% + 6px)',
      right: 0,
      zIndex: 70,
      minWidth: 160,
      background: 'var(--white)',
      border: '1px solid var(--border)',
      borderRadius: 14,
      boxShadow: 'var(--shadow-raised)',
      padding: 6,
      transformOrigin: 'top right',
      animation: 'om-pop 160ms var(--ease-out) both'
    }
  }, options.map(o => /*#__PURE__*/React.createElement("button", {
    key: o,
    type: "button",
    onClick: () => {
      onSelect(o);
      setOpen(false);
    },
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      width: '100%',
      padding: '8px 12px',
      borderRadius: 10,
      border: 'none',
      cursor: 'pointer',
      textAlign: 'left',
      background: 'transparent',
      whiteSpace: 'nowrap',
      font: '700 13px var(--web-ui)',
      color: 'var(--ink)'
    },
    onMouseEnter: e => e.currentTarget.style.background = 'var(--fill-quiet)',
    onMouseLeave: e => e.currentTarget.style.background = 'transparent'
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }, o), value === o ? /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 13,
    color: "var(--blue-700)"
  }) : null))) : null);
}
function OpsUsers({
  people,
  onOpenProfile
}) {
  const [filter, setFilter] = React.useState('Admins');
  const roleOf = {
    'Admins': 'Company admin',
    'Campaign Managers': 'Campaign manager',
    'Creators': 'Creator'
  };
  const sortOptions = filter === 'Creators' ? ['Views', 'Posts', 'Name', 'Company'] : ['Name', 'Company'];
  const [sort, setSort] = React.useState('Name');
  const pick = f => {
    setFilter(f);
    setSort(f === 'Creators' ? 'Views' : 'Name');
  };
  const activeIds = SEED_COMPANIES.filter(c => c.status === 'Active').map(c => c.id);
  const shown = people.filter(p => p.role === roleOf[filter] && activeIds.includes(p.company));
  shown.sort((a, b) => sort === 'Views' ? (b.viewsN || 0) - (a.viewsN || 0) : sort === 'Posts' ? (b.posts || 0) - (a.posts || 0) : sort === 'Company' ? companyName(a.company).localeCompare(companyName(b.company)) : a.name.localeCompare(b.name));
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(KPageHead, {
    title: "Users",
    sub: "Everyone on Noni \u2014 company admins, campaign managers and creators."
  }), /*#__PURE__*/React.createElement(KTabs, {
    tabs: ['Admins', 'Creators', 'Campaign Managers'],
    active: filter,
    onSelect: pick,
    right: /*#__PURE__*/React.createElement(SortDropdown, {
      options: sortOptions,
      value: sort,
      onSelect: setSort
    })
  }), /*#__PURE__*/React.createElement(KCard, {
    pad: 0,
    key: filter + sort,
    style: {
      animation: 'om-rise 240ms var(--ease-out) both'
    }
  }, shown.map((r, i) => /*#__PURE__*/React.createElement("div", {
    key: r.id,
    role: "button",
    onClick: () => onOpenProfile(r),
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      padding: '14px 20px',
      cursor: 'pointer',
      borderBottom: i === shown.length - 1 ? 'none' : '1px solid var(--line)'
    },
    onMouseEnter: e => e.currentTarget.style.background = 'var(--fill-quiet)',
    onMouseLeave: e => e.currentTarget.style.background = 'transparent'
  }, /*#__PURE__*/React.createElement(KAvatar, {
    name: r.name,
    size: 36
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      font: '700 14.5px var(--web-ui)',
      color: 'var(--ink)'
    }
  }, r.name), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      marginTop: 2,
      font: '600 12.5px var(--web-ui)',
      color: 'var(--slate-400)'
    }
  }, companyName(r.company))), r.role === 'Creator' ? /*#__PURE__*/React.createElement("span", {
    style: {
      font: '600 13px var(--web-ui)',
      color: 'var(--slate-400)',
      width: 160,
      textAlign: 'right'
    }
  }, r.posts, " posts \xB7 ", r.viewsN ? fmtK(r.viewsN) + ' views' : '—') : /*#__PURE__*/React.createElement("span", {
    style: {
      font: '600 13px var(--web-ui)',
      color: 'var(--slate-400)'
    }
  }, r.email), /*#__PURE__*/React.createElement(KChip, {
    tone: statusTone(r.status)
  }, r.status)))));
}
function OpsInvites({
  invites,
  onResend
}) {
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(KPageHead, {
    title: "Invites",
    sub: "Every admin invite we've sent. Pending means they haven't signed in with Google yet."
  }), /*#__PURE__*/React.createElement(KCard, {
    pad: 0
  }, invites.map((iv, i) => /*#__PURE__*/React.createElement("div", {
    key: iv.id,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      padding: '15px 20px',
      borderBottom: i === invites.length - 1 ? 'none' : '1px solid var(--line)'
    }
  }, /*#__PURE__*/React.createElement(KAvatar, {
    name: iv.name,
    size: 36
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      font: '700 14.5px var(--web-ui)',
      color: 'var(--ink)'
    }
  }, iv.name, " \xB7 ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--slate-400)',
      fontWeight: 600
    }
  }, iv.email)), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      marginTop: 2,
      font: '600 13px var(--web-ui)',
      color: 'var(--slate-400)'
    }
  }, iv.company, " \xB7 Company admin \xB7 sent ", iv.sent)), /*#__PURE__*/React.createElement(KChip, {
    tone: statusTone(iv.status)
  }, iv.status), iv.status !== 'Accepted' ? /*#__PURE__*/React.createElement(KPill, {
    size: "sm",
    variant: "tint",
    icon: "rotate-ccw",
    onClick: () => onResend(iv.email)
  }, iv.sent === 'Just now' ? 'Sent just now' : 'Resend') : null))));
}
function WebOpsApp() {
  const [page, setPage] = React.useState('Overview');
  const [companyId, setCompanyId] = React.useState(null);
  const [modal, setModal] = React.useState(false);
  const [profile, setProfile] = React.useState(null);
  const [resent, setResent] = React.useState(false);
  const [companies, setCompanies] = React.useState(SEED_COMPANIES);
  const [invites, setInvites] = React.useState(SEED_INVITES);
  const creators = SEED_PEOPLE.filter(p => p.role === 'Creator');
  const [profilePage, setProfilePage] = React.useState(null);
  const go = (p, id = null) => {
    setPage(p);
    setCompanyId(id);
  };
  const viewFull = p => {
    setProfile(null);
    setProfilePage({
      p,
      from: {
        page,
        companyId
      }
    });
    setPage('Profile');
    setCompanyId(null);
  };
  const resend = email => setInvites(xs => xs.map(i => i.email === email ? {
    ...i,
    sent: 'Just now',
    status: 'Pending'
  } : i));
  const create = ({
    name,
    website,
    adminName,
    email
  }) => {
    const id = 'c' + Date.now();
    setCompanies(xs => [...xs, {
      id,
      name,
      website,
      admin: {
        name: adminName,
        email
      },
      creators: 0,
      managers: 0,
      campaigns: 0,
      posts: 0,
      views: '—',
      status: 'Invite pending',
      joined: 'Today',
      series: [],
      deltas: {},
      formats: {}
    }]);
    setInvites(xs => [{
      id: 'i' + Date.now(),
      name: adminName,
      email,
      company: name,
      sent: 'Just now',
      status: 'Pending'
    }, ...xs]);
  };
  const remove = id => {
    setCompanies(xs => xs.filter(c => c.id !== id));
    go('Companies');
  };
  const searchIndex = [...OPS_NAV.flatMap(g => g.items.map(it => ({
    section: 'Go to',
    icon: it.icon,
    title: it.label,
    meta: g.label,
    go: () => go(it.label)
  }))), ...companies.filter(c => c.status === 'Active').map(c => ({
    section: 'Companies',
    icon: 'layout-grid',
    title: c.name,
    meta: `${c.admin.email} · ${c.status}`,
    go: () => go('Companies', c.id)
  })), ...SEED_PEOPLE.map(p => ({
    section: 'Users',
    icon: 'circle-user-round',
    title: p.name,
    meta: `${companyName(p.company)} · ${p.role}`,
    go: () => {
      go('Users');
      setProfile(p);
      setResent(false);
    }
  })), ...invites.map(iv => ({
    section: 'Invites',
    icon: 'send',
    title: iv.email,
    meta: `${iv.company} · ${iv.status}`,
    go: () => go('Invites')
  }))];
  const company = companies.find(c => c.id === companyId);
  return /*#__PURE__*/React.createElement(KShell, {
    groups: OPS_NAV,
    active: page,
    onSelect: p => go(p),
    company: null,
    user: {
      name: 'Founders',
      role: 'Noni admin'
    },
    search: /*#__PURE__*/React.createElement(KSearch, {
      index: searchIndex,
      onGo: it => it.go()
    })
  }, page === 'Overview' ? /*#__PURE__*/React.createElement(OpsOverview, {
    companies: companies,
    creators: creators,
    go: go
  }) : null, page === 'Companies' && !company ? /*#__PURE__*/React.createElement(OpsCompanies, {
    companies: companies,
    go: go,
    onNew: () => setModal(true)
  }) : null, page === 'Companies' && company ? /*#__PURE__*/React.createElement(OpsCompanyDetail, {
    key: company.id,
    c: company,
    go: go,
    onResend: resend,
    onRemove: remove,
    onViewFull: viewFull
  }) : null, page === 'Users' ? /*#__PURE__*/React.createElement(OpsUsers, {
    people: SEED_PEOPLE,
    onOpenProfile: p => {
      setProfile(p);
      setResent(false);
    }
  }) : null, page === 'Invites' ? /*#__PURE__*/React.createElement(OpsInvites, {
    invites: invites,
    onResend: resend
  }) : null, page === 'Profile' && profilePage ? /*#__PURE__*/React.createElement(UserProfile, {
    key: profilePage.p.id,
    p: profilePage.p,
    resent: resent,
    onResend: () => {
      setResent(true);
      resend(profilePage.p.email);
    },
    onOpenCompany: cid => go('Companies', cid),
    onBack: () => {
      setPage(profilePage.from.page);
      setCompanyId(profilePage.from.companyId);
    }
  }) : null, modal ? /*#__PURE__*/React.createElement(NewCompanyModal, {
    onClose: () => setModal(false),
    onCreate: create
  }) : null, profile ? /*#__PURE__*/React.createElement(ProfileModal, {
    p: profile,
    onClose: () => setProfile(null),
    resent: resent,
    onResend: () => {
      setResent(true);
      resend(profile.email);
    },
    onViewFull: () => viewFull(profile)
  }) : null);
}
window.WebOpsApp = WebOpsApp;
})(); } catch (e) { __ds_ns.__errors.push({ path: "redesigns/website/OpsApp.jsx", error: String((e && e.message) || e) }); }

// redesigns/website/WebAdminApp.jsx
try { (() => {
/* usenoni.app /admin — company admin shell. This file: nav model, the Review
   queue (home), and calm placeholders for screens still to be redesigned. */

const NAV_GROUPS = [{
  label: 'Work',
  items: [{
    label: 'Review',
    icon: 'inbox',
    badge: '4'
  }, {
    label: 'Briefs',
    icon: 'layout-list'
  }, {
    label: 'Library',
    icon: 'images'
  }, {
    label: 'Creators',
    icon: 'circle-user-round'
  }, {
    label: 'Analytics',
    icon: 'chart-column'
  }]
}, {
  label: 'Company',
  items: [{
    label: 'Brand Brain',
    icon: 'sparkles'
  }, {
    label: 'Features',
    icon: 'zap'
  }, {
    label: 'Billing',
    icon: 'dollar-sign'
  }, {
    label: 'Campaign team',
    icon: 'users'
  }, {
    label: 'Settings',
    icon: 'settings'
  }]
}];
const QUEUE = [{
  id: 's1',
  title: 'POV: your film session runs itself',
  creator: 'Maya Reyes',
  format: 'Video',
  attempt: 1,
  time: '2h ago'
}, {
  id: 's2',
  title: '3 drills college scouts actually watch',
  creator: 'Jordan Tate',
  format: 'Carousel',
  attempt: 2,
  time: '4h ago'
}, {
  id: 's3',
  title: 'How we cut game-film review to 10 minutes',
  creator: 'Maya Reyes',
  format: 'Video',
  attempt: 1,
  time: '6h ago'
}, {
  id: 's4',
  title: 'Sideline camera setup in 60 seconds',
  creator: 'Devon Kim',
  format: 'Video',
  attempt: 1,
  time: 'Yesterday'
}];
function QueueRow({
  item,
  last
}) {
  const {
    Icon
  } = window.NoniDesignSystem_710e43;
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", {
    role: "button",
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      padding: '15px 20px',
      cursor: 'pointer',
      background: hover ? 'var(--fill-quiet)' : 'transparent',
      borderBottom: last ? 'none' : '1px solid var(--line)',
      transition: 'background var(--dur-fast) var(--ease-out)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 42,
      height: 56,
      flex: '0 0 auto',
      borderRadius: 10,
      background: 'var(--blue-100)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: item.format === 'Video' ? 'play' : 'images',
    size: 16,
    color: "var(--blue-700)"
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      font: '700 15px var(--web-ui)',
      color: 'var(--ink)',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, item.title), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      marginTop: 3,
      font: '600 13px var(--web-ui)',
      color: 'var(--slate-400)'
    }
  }, item.creator, " \xB7 ", item.format, " \xB7 Attempt ", item.attempt)), /*#__PURE__*/React.createElement(KChip, {
    tone: "blue"
  }, "Submitted"), /*#__PURE__*/React.createElement("span", {
    style: {
      font: '600 13px var(--web-ui)',
      color: 'var(--slate-400)',
      width: 72,
      textAlign: 'right'
    }
  }, item.time), /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-right",
    size: 16,
    color: "var(--slate-300, var(--slate-400))"
  }));
}
function ReviewPage() {
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(KPageHead, {
    title: "Review",
    sub: "4 submissions waiting. Approve and it's live; request changes and it goes back to the creator."
  }), /*#__PURE__*/React.createElement(KCard, {
    pad: 0
  }, QUEUE.map((s, i) => /*#__PURE__*/React.createElement(QueueRow, {
    key: s.id,
    item: s,
    last: i === QUEUE.length - 1
  }))));
}
function StubPage({
  label
}) {
  const {
    Icon
  } = window.NoniDesignSystem_710e43;
  const icon = NAV_GROUPS.flatMap(g => g.items).find(i => i.label === label)?.icon || 'sparkles';
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(KPageHead, {
    title: label
  }), /*#__PURE__*/React.createElement(KCard, {
    pad: 0,
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '72px 24px',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 54,
      height: 54,
      borderRadius: 999,
      background: 'var(--blue-100)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 22,
    color: "var(--blue-700)"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16,
      font: '700 16px var(--web-display)',
      letterSpacing: '-0.3px',
      color: 'var(--ink)'
    }
  }, "Not designed yet"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '6px 0 0',
      font: '600 14px/1.5 var(--web-ui)',
      color: 'var(--slate-400)',
      maxWidth: 340
    }
  }, "We're going screen by screen. The shell and Review queue come first; ", label, " is on the list.")));
}

/* Everything the command bar can reach: pages first, then records. */
const SEARCH_INDEX = [...NAV_GROUPS.flatMap(g => g.items.map(it => ({
  section: 'Go to',
  icon: it.icon,
  title: it.label,
  meta: g.label,
  go: it.label
}))), ...QUEUE.map(s => ({
  section: 'Submissions',
  icon: s.format === 'Video' ? 'play' : 'images',
  title: s.title,
  meta: `${s.creator} · ${s.time}`,
  go: 'Review'
})), {
  section: 'Creators',
  icon: 'circle-user-round',
  title: 'Maya Reyes',
  meta: 'Onboarded',
  go: 'Creators'
}, {
  section: 'Creators',
  icon: 'circle-user-round',
  title: 'Jordan Tate',
  meta: 'Onboarded',
  go: 'Creators'
}, {
  section: 'Creators',
  icon: 'circle-user-round',
  title: 'Devon Kim',
  meta: 'Pending',
  go: 'Creators'
}];
function WebAdminApp() {
  const [active, setActive] = React.useState('Review');
  return /*#__PURE__*/React.createElement(KShell, {
    groups: NAV_GROUPS,
    active: active,
    onSelect: setActive,
    company: "FieldVision AI",
    user: {
      name: 'Elan',
      role: 'Company admin'
    },
    search: /*#__PURE__*/React.createElement(KSearch, {
      index: SEARCH_INDEX,
      onGo: it => setActive(it.go)
    })
  }, active === 'Review' ? /*#__PURE__*/React.createElement(ReviewPage, null) : /*#__PURE__*/React.createElement(StubPage, {
    label: active
  }));
}
window.WebAdminApp = WebAdminApp;
})(); } catch (e) { __ds_ns.__errors.push({ path: "redesigns/website/WebAdminApp.jsx", error: String((e && e.message) || e) }); }

// redesigns/website/WebKit.jsx
try { (() => {
/* usenoni.app web shell vocabulary — white ground, one blue, pill actions,
   hairline cards. Syne display / Manrope UI (per brand brief). */
const KNS = () => window.NoniDesignSystem_710e43;
function KCard({
  children,
  pad = 20,
  onClick,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClick,
    role: onClick ? 'button' : undefined,
    style: {
      background: 'var(--white)',
      border: '1px solid var(--border)',
      borderRadius: 16,
      boxShadow: 'var(--shadow-card)',
      padding: pad,
      cursor: onClick ? 'pointer' : 'default',
      ...style
    }
  }, children);
}
function KLabel({
  children,
  style
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      font: '800 11px var(--web-ui)',
      letterSpacing: '0.9px',
      textTransform: 'uppercase',
      color: 'var(--slate-400)',
      ...style
    }
  }, children);
}
function KPill({
  children,
  icon,
  variant = 'primary',
  size = 'md',
  onClick,
  style
}) {
  const {
    Icon
  } = KNS();
  const looks = {
    primary: {
      background: 'var(--blue-500)',
      color: 'var(--white)',
      boxShadow: 'var(--shadow-accent)'
    },
    tint: {
      background: 'var(--blue-100)',
      color: 'var(--blue-700)'
    },
    quiet: {
      background: 'var(--fill-quiet)',
      color: 'var(--ink)'
    },
    danger: {
      background: 'var(--danger-soft)',
      color: 'var(--danger)'
    },
    ghost: {
      background: 'transparent',
      color: 'var(--slate-500)'
    }
  };
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClick,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 7,
      padding: size === 'sm' ? '8px 14px' : '12px 22px',
      borderRadius: 999,
      border: 'none',
      cursor: 'pointer',
      font: `700 ${size === 'sm' ? 13 : 14.5}px var(--web-ui)`,
      whiteSpace: 'nowrap',
      transition: 'filter var(--dur-fast) var(--ease-out)',
      ...looks[variant],
      ...style
    }
  }, icon ? /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: size === 'sm' ? 14 : 16
  }) : null, children);
}
function KChip({
  children,
  tone = 'blue',
  style
}) {
  const tones = {
    blue: {
      background: 'var(--blue-100)',
      color: 'var(--blue-700)'
    },
    green: {
      background: 'var(--green-soft, #E4F6EC)',
      color: 'var(--green, #1F9D5B)'
    },
    amber: {
      background: 'var(--amber-soft, #FCF1DD)',
      color: 'var(--amber, #B97D14)'
    },
    slate: {
      background: 'var(--fill-quiet)',
      color: 'var(--slate-500)'
    }
  };
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '5px 11px',
      borderRadius: 999,
      font: '700 12px var(--web-ui)',
      whiteSpace: 'nowrap',
      ...tones[tone],
      ...style
    }
  }, children);
}
function KAvatar({
  name,
  size = 34
}) {
  const initial = (name || '?').trim().charAt(0).toUpperCase();
  return /*#__PURE__*/React.createElement("span", {
    style: {
      width: size,
      height: size,
      flex: '0 0 auto',
      borderRadius: 999,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--blue-100)',
      color: 'var(--blue-700)',
      font: `800 ${Math.round(size * 0.4)}px var(--web-ui)`
    }
  }, initial);
}
function KPageHead({
  title,
  sub,
  right,
  onBack
}) {
  const {
    Icon
  } = KNS();
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      gap: 16,
      marginBottom: 24
    }
  }, onBack ? /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onBack,
    "aria-label": "Back",
    style: {
      width: 38,
      height: 38,
      marginBottom: 2,
      flex: '0 0 auto',
      borderRadius: 999,
      border: '1px solid var(--border)',
      cursor: 'pointer',
      background: 'var(--white)',
      boxShadow: 'var(--shadow-card)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-left",
    size: 18,
    color: "var(--ink)"
  })) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      font: '700 26px var(--web-display)',
      letterSpacing: '-0.5px',
      color: 'var(--ink)'
    }
  }, title), sub ? /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '7px 0 0',
      font: '600 14.5px/1.5 var(--web-ui)',
      color: 'var(--slate-400)',
      maxWidth: 560
    }
  }, sub) : null), right ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      alignItems: 'center'
    }
  }, right) : null);
}
function KSideItem({
  icon,
  label,
  badge,
  active,
  onClick
}) {
  const {
    Icon
  } = KNS();
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 11,
      width: '100%',
      padding: '9px 11px',
      borderRadius: 11,
      border: 'none',
      cursor: 'pointer',
      textAlign: 'left',
      background: active ? 'var(--blue-100)' : hover ? 'var(--fill-quiet)' : 'transparent',
      color: active ? 'var(--blue-700)' : 'var(--slate-500)',
      font: '700 13.5px var(--web-ui)',
      transition: 'background var(--dur-fast) var(--ease-out)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 17,
    color: active ? 'var(--blue-700)' : 'var(--slate-400)'
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }, label), badge ? /*#__PURE__*/React.createElement("span", {
    style: {
      padding: '2px 8px',
      borderRadius: 999,
      background: active ? 'var(--white)' : 'var(--blue-100)',
      color: 'var(--blue-700)',
      font: '800 11px var(--web-ui)'
    }
  }, badge) : null);
}

/* Stripe-style smart search: centered command bar, ⌘K / "/" to focus,
   grouped results ("Go to" pages + records) with match highlighting. */
function KHi({
  text,
  q
}) {
  const i = q ? text.toLowerCase().indexOf(q) : -1;
  if (i < 0) return text;
  return /*#__PURE__*/React.createElement("span", null, text.slice(0, i), /*#__PURE__*/React.createElement("span", {
    style: {
      background: 'var(--blue-100)',
      borderRadius: 3,
      padding: '1px 0'
    }
  }, text.slice(i, i + q.length)), text.slice(i + q.length));
}
function KSearch({
  index,
  onGo
}) {
  const {
    Icon
  } = KNS();
  const [q, setQ] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const [focus, setFocus] = React.useState(false);
  const inputRef = React.useRef(null);
  const wrapRef = React.useRef(null);
  React.useEffect(() => {
    const key = e => {
      const typing = /^(INPUT|TEXTAREA)$/.test(document.activeElement?.tagName || '');
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k' || e.key === '/' && !typing) {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      } else if (e.key === 'Escape') {
        setOpen(false);
        inputRef.current?.blur();
      }
    };
    const out = e => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    window.addEventListener('keydown', key);
    window.addEventListener('mousedown', out);
    return () => {
      window.removeEventListener('keydown', key);
      window.removeEventListener('mousedown', out);
    };
  }, []);
  const ql = q.trim().toLowerCase();
  const hits = index.filter(it => !ql ? it.section === 'Go to' : `${it.title} ${it.meta || ''}`.toLowerCase().includes(ql));
  const sections = [];
  hits.forEach(it => {
    let s = sections.find(x => x.label === it.section);
    if (!s) sections.push(s = {
      label: it.section,
      items: []
    });
    s.items.push(it);
  });
  const pick = it => {
    onGo(it);
    setQ('');
    setOpen(false);
    inputRef.current?.blur();
  };
  return /*#__PURE__*/React.createElement("div", {
    ref: wrapRef,
    style: {
      position: 'relative',
      width: '100%',
      maxWidth: 560
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 9,
      padding: '9px 16px',
      borderRadius: 999,
      background: 'var(--white)',
      border: focus ? '1px solid var(--blue-500)' : '1px solid var(--border)',
      boxShadow: focus ? '0 0 0 3px rgba(27,166,238,0.18)' : 'var(--shadow-card)',
      transition: 'box-shadow var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "search",
    size: 15,
    color: "var(--slate-400)"
  }), /*#__PURE__*/React.createElement("input", {
    ref: inputRef,
    value: q,
    placeholder: "Search or jump to\u2026",
    onChange: e => {
      setQ(e.target.value);
      setOpen(true);
    },
    onFocus: () => {
      setFocus(true);
      setOpen(true);
    },
    onBlur: () => setFocus(false),
    onKeyDown: e => {
      if (e.key === 'Enter' && hits[0]) pick(hits[0]);
    },
    style: {
      flex: 1,
      border: 'none',
      outline: 'none',
      background: 'transparent',
      font: '600 14px var(--web-ui)',
      color: 'var(--ink)'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: '0 0 auto',
      padding: '2px 7px',
      borderRadius: 6,
      border: '1px solid var(--line)',
      font: '700 11px var(--web-ui)',
      color: 'var(--slate-400)'
    }
  }, "\u2318K")), open ? /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 'calc(100% + 8px)',
      left: 0,
      right: 0,
      zIndex: 60,
      background: 'var(--white)',
      border: '1px solid var(--border)',
      borderRadius: 16,
      boxShadow: 'var(--shadow-raised)',
      padding: 8,
      maxHeight: 420,
      overflowY: 'auto',
      transformOrigin: 'top center',
      animation: 'om-pop 160ms var(--ease-out) both'
    }
  }, sections.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '22px 14px',
      textAlign: 'center',
      font: '600 13.5px var(--web-ui)',
      color: 'var(--slate-400)'
    }
  }, "Nothing matches \u201C", q.trim(), "\u201D") : sections.map(s => /*#__PURE__*/React.createElement("div", {
    key: s.label
  }, /*#__PURE__*/React.createElement(KLabel, {
    style: {
      display: 'block',
      padding: '10px 12px 5px'
    }
  }, s.label), s.items.map((it, i) => /*#__PURE__*/React.createElement("button", {
    key: s.label + i,
    type: "button",
    onMouseDown: e => {
      e.preventDefault();
      pick(it);
    },
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 11,
      width: '100%',
      padding: '9px 12px',
      borderRadius: 10,
      border: 'none',
      cursor: 'pointer',
      textAlign: 'left',
      background: 'transparent',
      font: '700 13.5px var(--web-ui)',
      color: 'var(--ink)'
    },
    onMouseEnter: e => e.currentTarget.style.background = 'var(--fill-quiet)',
    onMouseLeave: e => e.currentTarget.style.background = 'transparent'
  }, /*#__PURE__*/React.createElement(Icon, {
    name: it.icon,
    size: 15,
    color: "var(--slate-400)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      minWidth: 0,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, /*#__PURE__*/React.createElement(KHi, {
    text: it.title,
    q: ql
  })), it.meta ? /*#__PURE__*/React.createElement("span", {
    style: {
      font: '600 12.5px var(--web-ui)',
      color: 'var(--slate-400)',
      whiteSpace: 'nowrap'
    }
  }, /*#__PURE__*/React.createElement(KHi, {
    text: it.meta,
    q: ql
  })) : null))))) : null);
}

/* Full app frame: fixed sidebar + top command bar + scrolling content. */
function KShell({
  groups,
  active,
  onSelect,
  user,
  company,
  search,
  children
}) {
  const {
    Icon
  } = KNS();
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      height: '100vh',
      overflow: 'hidden',
      background: 'var(--paper, #F7FAFD)'
    }
  }, /*#__PURE__*/React.createElement("aside", {
    style: {
      width: 236,
      flex: '0 0 auto',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--white)',
      borderRight: '1px solid var(--line)',
      padding: '22px 14px 14px',
      boxSizing: 'border-box'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 9,
      padding: '0 9px'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/noni-logo.svg",
    alt: "",
    width: "30",
    height: "30",
    style: {
      display: 'block'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      font: '700 20px var(--web-display)',
      letterSpacing: '-0.6px',
      color: 'var(--ink)'
    }
  }, "noni")), company ? /*#__PURE__*/React.createElement("div", {
    style: {
      margin: '18px 0 6px',
      padding: '10px 11px',
      borderRadius: 12,
      background: 'var(--fill-quiet)',
      display: 'flex',
      alignItems: 'center',
      gap: 9
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 7,
      height: 7,
      borderRadius: 999,
      background: 'var(--blue-500)',
      flex: '0 0 auto'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      font: '700 13px var(--web-ui)',
      color: 'var(--ink)',
      flex: 1,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, company)) : null, /*#__PURE__*/React.createElement("nav", {
    style: {
      flex: 1,
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: 20,
      paddingTop: 14
    }
  }, groups.map(g => /*#__PURE__*/React.createElement("div", {
    key: g.label,
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 2
    }
  }, /*#__PURE__*/React.createElement(KLabel, {
    style: {
      padding: '0 11px 6px'
    }
  }, g.label), g.items.map(it => /*#__PURE__*/React.createElement(KSideItem, {
    key: it.label,
    icon: it.icon,
    label: it.label,
    badge: it.badge,
    active: active === it.label,
    onClick: () => onSelect(it.label)
  }))))), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: '1px solid var(--line)',
      marginTop: 12,
      paddingTop: 12,
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '12px 9px 0'
    }
  }, /*#__PURE__*/React.createElement(KAvatar, {
    name: user.name,
    size: 32
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: '700 13px var(--web-ui)',
      color: 'var(--ink)',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, user.name), /*#__PURE__*/React.createElement("div", {
    style: {
      font: '600 11.5px var(--web-ui)',
      color: 'var(--slate-400)'
    }
  }, user.role)), /*#__PURE__*/React.createElement("button", {
    type: "button",
    title: "Sign out",
    style: {
      width: 32,
      height: 32,
      flex: '0 0 auto',
      borderRadius: 999,
      border: 'none',
      cursor: 'pointer',
      background: 'transparent',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "log-out",
    size: 15,
    color: "var(--slate-400)"
  })))), /*#__PURE__*/React.createElement("main", {
    style: {
      flex: 1,
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column'
    }
  }, search ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'center',
      padding: '16px 44px 0',
      flex: '0 0 auto'
    }
  }, search) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    key: active,
    style: {
      maxWidth: 1100,
      margin: '0 auto',
      padding: '30px 44px 72px',
      boxSizing: 'border-box',
      animation: 'om-rise 260ms var(--ease-out) both'
    }
  }, children))));
}
function KField({
  label,
  value,
  onChange,
  placeholder,
  optional,
  autoFocus
}) {
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 7
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(KLabel, null, label), optional ? /*#__PURE__*/React.createElement("span", {
    style: {
      font: '600 11.5px var(--web-ui)',
      color: 'var(--slate-400)'
    }
  }, "Optional") : null), /*#__PURE__*/React.createElement("input", {
    value: value,
    onChange: onChange,
    placeholder: placeholder,
    autoFocus: autoFocus,
    style: {
      width: '100%',
      boxSizing: 'border-box',
      border: '1px solid var(--border)',
      outline: 'none',
      background: 'var(--white)',
      borderRadius: 12,
      padding: '12px 14px',
      font: '600 14.5px var(--web-ui)',
      color: 'var(--ink)'
    }
  }));
}
function KModal({
  title,
  onClose,
  children
}) {
  const {
    Icon
  } = KNS();
  const closeBtn = /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClose,
    "aria-label": "Close",
    style: {
      width: 32,
      height: 32,
      flex: '0 0 auto',
      borderRadius: 999,
      border: 'none',
      cursor: 'pointer',
      background: 'var(--fill-quiet)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "x",
    size: 15,
    color: "var(--slate-500)"
  }));
  return ReactDOM.createPortal(/*#__PURE__*/React.createElement("div", {
    onMouseDown: e => {
      if (e.target === e.currentTarget) onClose();
    },
    style: {
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      background: 'rgba(11,15,20,0.35)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      animation: 'om-fade 180ms var(--ease-out) both'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      width: 460,
      maxWidth: 'calc(100vw - 48px)',
      maxHeight: 'calc(100vh - 56px)',
      overflowY: 'auto',
      background: 'var(--white)',
      borderRadius: 20,
      boxShadow: 'var(--shadow-raised)',
      padding: 26,
      boxSizing: 'border-box',
      animation: 'om-pop 240ms var(--ease-out) both'
    }
  }, title ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      font: '700 18px var(--web-display)',
      letterSpacing: '-0.4px',
      color: 'var(--ink)'
    }
  }, title), closeBtn) : /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 18,
      right: 18,
      zIndex: 2
    }
  }, closeBtn), children)), document.body);
}
Object.assign(window, {
  KCard,
  KLabel,
  KPill,
  KChip,
  KAvatar,
  KPageHead,
  KSideItem,
  KShell,
  KSearch,
  KField,
  KModal
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "redesigns/website/WebKit.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin-app/AdminApp.jsx
try { (() => {
/* The admin shell. Five tabs — Review · Briefs · Library · Creators ·
   Analytics — plus the pushed screens. Calendar is a toggle inside Briefs and
   Settings is the gear on Analytics; neither is a tab. */

function AdminKit() {
  const {
    TabBar
  } = window.NoniDesignSystem_710e43;
  const A = window.NONI_ADMIN;
  const [tab, setTab] = React.useState(0);
  const [push, setPush] = React.useState(null);
  const creatorOf = id => A.creators.find(c => c.id === id);
  const back = () => setPush(null);
  const screen = () => {
    if (push) {
      switch (push.kind) {
        case 'review':
          return /*#__PURE__*/React.createElement(ReviewDetail, {
            item: push.item,
            creator: creatorOf(push.item.creator),
            onBack: back,
            onChat: () => setPush({
              kind: 'chat',
              creator: creatorOf(push.item.creator)
            })
          });
        case 'music':
          return /*#__PURE__*/React.createElement(MusicApproval, {
            item: push.item,
            creator: creatorOf(push.item.creator),
            onBack: back
          });
        case 'account':
          return /*#__PURE__*/React.createElement(AccountApproval, {
            item: push.item,
            creator: creatorOf(push.item.creator),
            onBack: back
          });
        case 'post':
          return /*#__PURE__*/React.createElement(PostEditor, {
            onBack: back,
            onDone: back,
            sheet: push.sheet,
            format: push.format || 'video'
          });
        case 'week':
          return /*#__PURE__*/React.createElement(WeekSetup, {
            onBack: back,
            onDone: back
          });
        case 'creator':
          return /*#__PURE__*/React.createElement(CreatorProfile, {
            creator: push.creator,
            onBack: back,
            onChat: () => setPush({
              kind: 'chat',
              creator: push.creator
            }),
            onOpenPost: p => setPush({
              kind: 'creatorPost',
              post: p,
              creator: push.creator
            })
          });
        case 'creatorPost':
          return /*#__PURE__*/React.createElement(CreatorPost, {
            post: push.post,
            creator: push.creator,
            onBack: () => setPush({
              kind: 'creator',
              creator: push.creator
            })
          });
        case 'chat':
          return /*#__PURE__*/React.createElement(ChatScreen, {
            creator: push.creator,
            onBack: back
          });
        case 'settings':
          return /*#__PURE__*/React.createElement(SettingsScreen, {
            onBack: back,
            onTemplate: () => setPush({
              kind: 'template'
            }),
            onBrain: () => setPush({
              kind: 'brain'
            }),
            onFeatures: () => setPush({
              kind: 'features'
            })
          });
        case 'template':
          return /*#__PURE__*/React.createElement(AccountTemplate, {
            onBack: () => setPush({
              kind: 'settings'
            })
          });
        case 'brain':
          return /*#__PURE__*/React.createElement(BrainScreen, {
            onBack: () => setPush({
              kind: 'settings'
            })
          });
        case 'features':
          return /*#__PURE__*/React.createElement(FeaturesScreen, {
            onBack: () => setPush({
              kind: 'settings'
            })
          });
        default:
          return null;
      }
    }
    switch (tab) {
      case 0:
        return /*#__PURE__*/React.createElement(ReviewScreen, {
          onOpen: item => setPush({
            kind: 'review',
            item
          }),
          onOpenMusic: item => setPush({
            kind: 'music',
            item
          }),
          onOpenAccount: item => setPush({
            kind: 'account',
            item
          })
        });
      case 1:
        return /*#__PURE__*/React.createElement(BriefsScreen, {
          onOpenPost: r => setPush({
            kind: 'post',
            format: r && r.format
          }),
          onNewWeek: () => setPush({
            kind: 'week'
          })
        });
      case 2:
        return /*#__PURE__*/React.createElement(LibraryScreen, null);
      case 3:
        return /*#__PURE__*/React.createElement(CreatorsScreen, {
          onOpen: creator => setPush({
            kind: 'creator',
            creator
          })
        });
      default:
        return /*#__PURE__*/React.createElement(AnalyticsScreen, {
          onSettings: () => setPush({
            kind: 'settings'
          })
        });
    }
  };
  const tabs = window.ADMIN_TABS.map((t, i) => i === 0 ? {
    ...t,
    badge: A.submissions.length + A.music.length + A.accounts.filter(a => a.state === 'pending').length
  } : t);
  return /*#__PURE__*/React.createElement(Phone, null, screen(), push ? null : /*#__PURE__*/React.createElement(TabBar, {
    items: tabs,
    active: tab,
    onSelect: i => {
      setTab(i);
      setPush(null);
    }
  }));
}
Object.assign(window, {
  AdminKit
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin-app/AdminApp.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin-app/AdminBoard.jsx
try { (() => {
/* Every admin screen and state, side by side. */
function AdminBoard() {
  const A = window.NONI_ADMIN;
  const creatorOf = id => A.creators.find(c => c.id === id);
  const reel = A.submissions[2];
  const slideshow = A.submissions[1];
  const noop = () => {};
  const groups = [{
    title: 'Review — the daily loop',
    note: 'Three queues in one tab. Counts sit inside the switcher so an empty lane never costs a tap. Reject one clip and only that clip goes back.',
    items: [['Posts', /*#__PURE__*/React.createElement(ReviewScreen, null)], ['Music approvals', /*#__PURE__*/React.createElement(ReviewScreen, {
      lane: 1
    })], ['Account approvals', /*#__PURE__*/React.createElement(ReviewScreen, {
      lane: 2
    })], ['Loading', /*#__PURE__*/React.createElement(ReviewScreen, {
      state: "loading"
    })], ['Nothing to review', /*#__PURE__*/React.createElement(ReviewScreen, {
      state: "empty"
    })], ['No songs waiting', /*#__PURE__*/React.createElement(ReviewScreen, {
      state: "empty",
      lane: 1
    })]]
  }, {
    title: 'Review detail — Reel',
    note: 'The post as it will appear on the platform: one 9:16 frame at true dimensions, handle and caption over it, two actions and nothing else.',
    items: [['The post', /*#__PURE__*/React.createElement(ReviewDetail, {
      item: reel,
      creator: creatorOf(reel.creator)
    })], ['Sections', /*#__PURE__*/React.createElement(ReviewDetail, {
      item: reel,
      creator: creatorOf(reel.creator),
      mode: "changes"
    })], ['Writing a note', /*#__PURE__*/React.createElement(ReviewDetail, {
      item: reel,
      creator: creatorOf(reel.creator),
      state: "typing"
    })], ['Note saved', /*#__PURE__*/React.createElement(ReviewDetail, {
      item: reel,
      creator: creatorOf(reel.creator),
      state: "noted"
    })], ['One note for all', /*#__PURE__*/React.createElement(ReviewDetail, {
      item: reel,
      creator: creatorOf(reel.creator),
      state: "whole"
    })], ['Sent back', /*#__PURE__*/React.createElement(ReviewDetail, {
      item: reel,
      creator: creatorOf(reel.creator),
      state: "sent"
    })], ['Approved', /*#__PURE__*/React.createElement(ReviewDetail, {
      item: reel,
      creator: creatorOf(reel.creator),
      state: "approved"
    })]]
  }, {
    title: 'Review detail — Slideshow',
    note: 'Same frame, same two actions. Slides swipe in place and the sections become one card per slide. The approve confirmation names the music loop instead of the render.',
    items: [['The post', /*#__PURE__*/React.createElement(ReviewDetail, {
      item: slideshow,
      creator: creatorOf(slideshow.creator)
    })], ['Slide 3', /*#__PURE__*/React.createElement(ReviewDetail, {
      item: slideshow,
      creator: creatorOf(slideshow.creator)
    })], ['Sections', /*#__PURE__*/React.createElement(ReviewDetail, {
      item: slideshow,
      creator: creatorOf(slideshow.creator),
      mode: "changes"
    })], ['Approved', /*#__PURE__*/React.createElement(ReviewDetail, {
      item: slideshow,
      creator: creatorOf(slideshow.creator),
      state: "approved"
    })]]
  }, {
    title: 'Music and account gates',
    note: 'Music is one tap after a glance and unlocks that post’s earnings. Account approval happens once per creator and is also the handle-linking moment.',
    items: [['Music approval', /*#__PURE__*/React.createElement(MusicApproval, {
      item: A.music[0],
      creator: creatorOf(A.music[0].creator)
    })], ['Song approved', /*#__PURE__*/React.createElement(MusicApproval, {
      item: A.music[0],
      creator: creatorOf(A.music[0].creator),
      state: "approved"
    })], ['Account, pending', /*#__PURE__*/React.createElement(AccountApproval, {
      item: A.accounts[0],
      creator: creatorOf(A.accounts[0].creator)
    })], ['Account, sending back', /*#__PURE__*/React.createElement(AccountApproval, {
      item: A.accounts[0],
      creator: creatorOf(A.accounts[0].creator),
      state: "reject"
    })], ['Account, sent back', /*#__PURE__*/React.createElement(AccountApproval, {
      item: A.accounts[1],
      creator: creatorOf(A.accounts[1].creator)
    })], ['Account template', /*#__PURE__*/React.createElement(AccountTemplate, null)]]
  }, {
    title: 'Briefs — the weekly loop',
    note: 'Thirty rows exist from week creation. Four states read at a glance with no legend, and every empty row carries a type and a search phrase.',
    items: [['Videos 7/20', /*#__PURE__*/React.createElement(BriefsScreen, null)], ['Slideshows 3/10', /*#__PURE__*/React.createElement(BriefsScreen, {
      lane: 1
    })], ['All thirty complete', /*#__PURE__*/React.createElement(BriefsScreen, {
      state: "ready"
    })], ['Published', /*#__PURE__*/React.createElement(BriefsScreen, {
      state: "published"
    })], ['Calendar view', /*#__PURE__*/React.createElement(BriefsScreen, {
      view: "calendar"
    })], ['Loading', /*#__PURE__*/React.createElement(BriefsScreen, {
      state: "loading"
    })], ['No week yet', /*#__PURE__*/React.createElement(BriefsScreen, {
      state: "empty"
    })]]
  }, {
    title: 'Week setup',
    note: 'The only stepped ceremony in the product. Three screens, once a week. The split is a pool, not a lock.',
    items: [['Ratio', /*#__PURE__*/React.createElement(WeekSetup, {
      step: 0
    })], ['Video types', /*#__PURE__*/React.createElement(WeekSetup, {
      step: 1
    })], ['Over the count', /*#__PURE__*/React.createElement(WeekSetup, {
      step: 1,
      state: "mismatch"
    })], ['Slideshow types', /*#__PURE__*/React.createElement(WeekSetup, {
      step: 2
    })]]
  }, {
    title: 'Post editor — seven steps',
    note: 'One decision group per screen. The type is locked, nothing generates on open, and the hook is chosen against the finished body. Save progress leaves the row partial.',
    items: [['1 · Title', /*#__PURE__*/React.createElement(PostEditor, {
      step: 0
    })], ['2 · Search phrase', /*#__PURE__*/React.createElement(PostEditor, {
      step: 1
    })], ['3 · Hook', /*#__PURE__*/React.createElement(PostEditor, {
      step: 2
    })], ['3 · Hook, other', /*#__PURE__*/React.createElement(PostEditor, {
      step: 2,
      state: "other"
    })], ['4 · CTA', /*#__PURE__*/React.createElement(PostEditor, {
      step: 3
    })], ['5 · Talking points', /*#__PURE__*/React.createElement(PostEditor, {
      step: 4
    })], ['6 · Caption', /*#__PURE__*/React.createElement(PostEditor, {
      step: 5
    })], ['7 · AI review', /*#__PURE__*/React.createElement(PostEditor, {
      step: 6
    })], ['Nothing written yet', /*#__PURE__*/React.createElement(PostEditor, {
      step: 4,
      state: "empty"
    })], ['Progress saved', /*#__PURE__*/React.createElement(PostEditor, {
      step: 2,
      state: "saved"
    })], ['Fill with AI', /*#__PURE__*/React.createElement(PostEditor, {
      step: 0,
      sheet: "fill",
      animateSheet: false
    })], ['Camera roll', /*#__PURE__*/React.createElement(PostEditor, {
      step: 4,
      sheet: "shot",
      animateSheet: false
    })], ['Move to clip', /*#__PURE__*/React.createElement(PostEditor, {
      step: 4,
      sheet: "move",
      animateSheet: false
    })], ['Library picker', /*#__PURE__*/React.createElement(PostEditor, {
      step: 2,
      sheet: "library",
      animateSheet: false
    })]]
  }, {
    title: 'Post editor — Slideshow',
    note: 'Same seven steps for a photo carousel. Slots are slides, the count comes from the type, and the plug still rides inside one point.',
    items: [['1 · Title', /*#__PURE__*/React.createElement(PostEditor, {
      step: 0,
      format: "photo_carousel"
    })], ['3 · Hook', /*#__PURE__*/React.createElement(PostEditor, {
      step: 2,
      format: "photo_carousel"
    })], ['5 · Slides', /*#__PURE__*/React.createElement(PostEditor, {
      step: 4,
      format: "photo_carousel"
    })], ['6 · Caption', /*#__PURE__*/React.createElement(PostEditor, {
      step: 5,
      format: "photo_carousel"
    })], ['7 · AI review', /*#__PURE__*/React.createElement(PostEditor, {
      step: 6,
      format: "photo_carousel"
    })], ['Move to slide', /*#__PURE__*/React.createElement(PostEditor, {
      step: 4,
      format: "photo_carousel",
      sheet: "move",
      animateSheet: false
    })]]
  }, {
    title: 'Library',
    note: 'One list, four source chips, quick capture pinned to the top. Type, enter, saved — it has to work while walking to the train.',
    items: [['Ideas', /*#__PURE__*/React.createElement(LibraryScreen, null)], ['Bulk paste', /*#__PURE__*/React.createElement(LibraryScreen, {
      capture: 'Coaches ignore reels sent in July\nWhat parents should film from the stands\nThe 14 dollar clamp, again'
    })], ['Our posts', /*#__PURE__*/React.createElement(LibraryScreen, {
      chip: 1
    })], ['References', /*#__PURE__*/React.createElement(LibraryScreen, {
      chip: 2
    })], ['From creator', /*#__PURE__*/React.createElement(LibraryScreen, {
      chip: 3
    })], ['Loading', /*#__PURE__*/React.createElement(LibraryScreen, {
      state: "loading"
    })], ['Empty', /*#__PURE__*/React.createElement(LibraryScreen, {
      state: "empty"
    })]]
  }, {
    title: 'Creators',
    note: 'Money, posts and views on the card. The profile is Instagram-shaped, and chat is one thread per creator with two entry points.',
    items: [['Roster', /*#__PURE__*/React.createElement(CreatorsScreen, null)], ['Loading', /*#__PURE__*/React.createElement(CreatorsScreen, {
      state: "loading"
    })], ['Empty', /*#__PURE__*/React.createElement(CreatorsScreen, {
      state: "empty"
    })], ['Profile, grid', /*#__PURE__*/React.createElement(CreatorProfile, {
      creator: A.creators[0]
    })], ['Profile, calendar', /*#__PURE__*/React.createElement(CreatorProfile, {
      creator: A.creators[0],
      view: "calendar"
    })], ['Post detail', /*#__PURE__*/React.createElement(CreatorPost, {
      post: A.library.ours[0],
      creator: A.creators[0]
    })], ['Chat', /*#__PURE__*/React.createElement(ChatScreen, {
      creator: A.creators[1]
    })]]
  }, {
    title: 'Analytics and settings',
    note: 'One time series with posting activity and the metric on the same axis. Everything else is a cut of it. The gear is the only way into Settings.',
    items: [['Views', /*#__PURE__*/React.createElement(AnalyticsScreen, null)], ['Loading', /*#__PURE__*/React.createElement(AnalyticsScreen, {
      state: "loading"
    })], ['Empty', /*#__PURE__*/React.createElement(AnalyticsScreen, {
      state: "empty"
    })], ['Settings', /*#__PURE__*/React.createElement(SettingsScreen, null)], ['Brand Brain', /*#__PURE__*/React.createElement(BrainScreen, null)], ['Brain, editing', /*#__PURE__*/React.createElement(BrainScreen, {
      state: "editing"
    })], ['Features', /*#__PURE__*/React.createElement(FeaturesScreen, null)], ['Feature sheet', /*#__PURE__*/React.createElement(FeaturesScreen, {
      sheet: true,
      animateSheet: false
    })]]
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 56,
      padding: '48px 40px 80px'
    }
  }, /*#__PURE__*/React.createElement("header", {
    style: {
      maxWidth: 760
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: '700 12px var(--font-ui)',
      letterSpacing: 'var(--tracking-label)',
      textTransform: 'uppercase',
      color: 'var(--slate-500)'
    }
  }, "Noni \xB7 Admin app"), /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: '10px 0 0',
      font: '700 44px/1.05 var(--font-display)',
      letterSpacing: 'var(--tracking-hero)',
      color: 'var(--ink)'
    }
  }, "Every screen and state"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '14px 0 0',
      font: '400 16px/1.5 var(--font-ui)',
      color: 'var(--slate-500)'
    }
  }, "Review \xB7 Briefs \xB7 Library \xB7 Creators \xB7 Analytics, plus every pushed screen. Both formats everywhere: Reel and Slideshow. Tenant is FieldVision AI.")), groups.map(g => /*#__PURE__*/React.createElement("section", {
    key: g.title,
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 20
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      font: '700 26px var(--font-display)',
      letterSpacing: 'var(--tracking-title)',
      color: 'var(--ink)'
    }
  }, g.title), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '6px 0 0',
      font: '400 15px/1.5 var(--font-ui)',
      color: 'var(--slate-500)',
      maxWidth: 660
    }
  }, g.note)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 32
    }
  }, g.items.map(([label, node]) => /*#__PURE__*/React.createElement(Phone, {
    key: label,
    label: label
  }, node))))));
}
Object.assign(window, {
  AdminBoard
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin-app/AdminBoard.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin-app/AdminShared.jsx
try { (() => {
/* Shared vocabulary for the admin kit. Everything here extends the creator
   design system — no new hex, no new radii. Admin screen gutter is 20px
   (the creator app uses 24): admin surfaces are dense lists, and 20 matches
   app/(admin) as built. */

const NS = () => window.NoniDesignSystem_710e43;
const GUT = 20;

/* Screen scaffold. Off-white ground, one scrolling column, optional pinned
   footer that the content scrolls behind. */
function AdminScreen({
  children,
  footer,
  dark = false,
  pad = true,
  gap = 14,
  bottom = 108,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minHeight: 0,
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      background: dark ? 'var(--ink-900)' : 'var(--off-white)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minHeight: 0,
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap,
      padding: pad ? `6px ${GUT}px ${bottom}px` : 0
    }
  }, children), footer);
}

/* Tab-level header: title, one line of intent, trailing slot. */
function AdminHeader({
  title,
  subtitle,
  right,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 12,
      padding: '6px 0 2px',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      font: '700 30px var(--font-display)',
      letterSpacing: 'var(--tracking-title)',
      color: 'var(--ink)'
    }
  }, title), subtitle ? /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '6px 0 0',
      font: '400 15px/1.4 var(--font-ui)',
      color: 'var(--slate-500)'
    }
  }, subtitle) : null), right);
}

/* Pushed-screen header: back chevron, title, trailing slot. */
function PushHeader({
  title,
  meta,
  onBack,
  right,
  dark = false,
  style
}) {
  const {
    Icon
  } = NS();
  const fg = dark ? 'var(--white)' : 'var(--ink)';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: `4px ${GUT}px 10px`,
      background: dark ? 'transparent' : 'var(--off-white)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onBack,
    "aria-label": "Back",
    style: {
      width: 36,
      height: 36,
      flex: '0 0 auto',
      borderRadius: 999,
      border: 'none',
      cursor: 'pointer',
      background: dark ? 'rgba(255,255,255,0.16)' : 'var(--white)',
      boxShadow: dark ? 'none' : 'var(--shadow-card)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-left",
    size: 20,
    color: fg
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: '700 17px var(--font-display)',
      letterSpacing: '-0.3px',
      color: fg,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, title), meta ? /*#__PURE__*/React.createElement("div", {
    style: {
      font: '600 12px var(--font-ui)',
      color: dark ? 'rgba(255,255,255,0.6)' : 'var(--slate-400)',
      marginTop: 1
    }
  }, meta) : null), right);
}

/* Queue switcher. Counts live in the control so the admin never taps to
   find out a lane is empty. */
function Segmented({
  items,
  active,
  onSelect,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 4,
      padding: 4,
      borderRadius: 'var(--radius-pill)',
      background: 'var(--fill-quiet)',
      ...style
    }
  }, items.map((it, i) => {
    const on = i === active;
    const label = typeof it === 'string' ? it : it.label;
    const count = typeof it === 'string' ? null : it.count;
    return /*#__PURE__*/React.createElement("button", {
      key: label,
      type: "button",
      onClick: () => onSelect(i),
      "aria-pressed": on,
      style: {
        flex: 1,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        padding: '10px 6px',
        border: 'none',
        cursor: 'pointer',
        borderRadius: 'var(--radius-pill)',
        background: on ? 'var(--white)' : 'transparent',
        boxShadow: on ? 'var(--shadow-card)' : 'none',
        color: on ? 'var(--ink)' : 'var(--slate-500)',
        font: '700 14px var(--font-ui)',
        letterSpacing: '-0.1px',
        transition: 'background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out)'
      }
    }, label, count != null ? /*#__PURE__*/React.createElement("span", {
      style: {
        minWidth: 19,
        height: 19,
        padding: '0 5px',
        borderRadius: 999,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        font: '700 11px var(--font-ui)',
        background: on ? count ? 'var(--blue-500)' : 'var(--fill-quiet)' : 'var(--white)',
        color: on ? count ? 'var(--white)' : 'var(--slate-400)' : 'var(--slate-500)'
      }
    }, count) : null);
  }));
}
function SectionLabel({
  children,
  right,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 8,
      padding: '10px 2px 0',
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      font: '700 12px var(--font-ui)',
      letterSpacing: 'var(--tracking-label)',
      textTransform: 'uppercase',
      color: 'var(--slate-500)'
    }
  }, children), right);
}
function CountPill({
  children,
  tone = 'brand'
}) {
  const map = {
    brand: ['var(--blue-100)', 'var(--blue-700)'],
    clear: ['var(--green-soft)', 'var(--green)'],
    quiet: ['var(--fill-quiet)', 'var(--slate-500)']
  };
  const [bg, fg] = map[tone];
  return /*#__PURE__*/React.createElement("span", {
    style: {
      padding: '7px 13px',
      borderRadius: 999,
      background: bg,
      color: fg,
      font: '700 13px var(--font-ui)',
      whiteSpace: 'nowrap'
    }
  }, children);
}
function Avatar({
  name,
  size = 36,
  tone = 'brand',
  photo = false
}) {
  const {
    Icon
  } = NS();
  const initial = (name || '?').trim().charAt(0).toUpperCase();
  if (photo) {
    return /*#__PURE__*/React.createElement("span", {
      title: name,
      style: {
        width: size,
        height: size,
        flex: '0 0 auto',
        borderRadius: 999,
        overflow: 'hidden',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(160deg,#E7F4FD 0%,#DCE7F0 100%)',
        boxShadow: 'var(--shadow-media)'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "circle-user-round",
      size: Math.round(size * 0.62),
      color: "var(--blue-300)"
    }));
  }
  return /*#__PURE__*/React.createElement("span", {
    style: {
      width: size,
      height: size,
      flex: '0 0 auto',
      borderRadius: 999,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: tone === 'brand' ? 'var(--blue-100)' : 'var(--fill-quiet)',
      color: tone === 'brand' ? 'var(--blue-700)' : 'var(--slate-500)',
      font: `700 ${Math.round(size * 0.42)}px var(--font-display)`
    }
  }, initial);
}
const isReel = f => f === 'video' || f === 'reel';
const formatLabel = f => isReel(f) ? 'Reel' : 'Slideshow';

/* Format is never implied. Every surface that shows media states Reel or
   Slideshow. */
function FormatChip({
  format,
  size = 'md',
  onDark = false,
  style
}) {
  const {
    Icon
  } = NS();
  const reel = isReel(format);
  const sm = size === 'sm';
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: sm ? 4 : 5,
      padding: sm ? '3px 8px 3px 6px' : '5px 10px 5px 8px',
      borderRadius: 999,
      background: onDark ? 'rgba(255,255,255,0.16)' : 'var(--blue-100)',
      color: onDark ? 'var(--white)' : 'var(--blue-700)',
      font: `700 ${sm ? 11 : 12}px var(--font-ui)`,
      whiteSpace: 'nowrap',
      ...style
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: reel ? 'video' : 'images',
    size: sm ? 12 : 13
  }), formatLabel(format));
}
function TypeChip({
  children,
  tone = 'quiet',
  style
}) {
  const map = {
    quiet: ['var(--fill-quiet)', 'var(--slate-500)'],
    warn: ['var(--amber-soft)', 'var(--amber)'],
    good: ['var(--green-soft)', 'var(--green)'],
    bad: ['var(--danger-soft)', 'var(--danger)']
  };
  const [bg, fg] = map[tone];
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      padding: '4px 9px',
      borderRadius: 999,
      background: bg,
      color: fg,
      font: '700 11px var(--font-ui)',
      whiteSpace: 'nowrap',
      ...style
    }
  }, children);
}

/* One hue per post type so a lane reads by colour before it reads by word.
   Tints only — same soft-chip recipe as the status chips, never a fill. */
const TYPE_TONES = {
  numbered_list: ['#E3F2FD', '#0E6BA8'],
  talking_head: ['#ECE7FB', '#5B44B4'],
  explainer: ['#DFF3EE', '#0E6E5C'],
  contrast: ['#FDEEDC', '#95560C'],
  replay_bait: ['#FBE7EF', '#A03A67'],
  numbered_tips: ['#E3F2FD', '#0E6BA8'],
  how_to: ['#E7EAFB', '#3B4EA0'],
  getting_started: ['#FDEEDC', '#95560C']
};
function PostTypeChip({
  type,
  children,
  style
}) {
  const [bg, fg] = TYPE_TONES[type] || ['var(--fill-quiet)', 'var(--slate-500)'];
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '5px 10px',
      borderRadius: 999,
      background: bg,
      color: fg,
      font: '700 12px var(--font-ui)',
      whiteSpace: 'nowrap',
      ...style
    }
  }, children);
}

/* 9:16 media placeholder. No real frames exist in the sources, so this is a
   quiet fill with the format glyph — never a drawn illustration. */
function Thumb({
  format = 'video',
  w = 52,
  h = 70,
  radius = 'var(--radius-sm)',
  badge,
  topBadge,
  style,
  onClick
}) {
  const {
    Icon
  } = NS();
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClick,
    style: {
      width: w,
      height: h,
      flex: '0 0 auto',
      position: 'relative',
      borderRadius: radius,
      overflow: 'hidden',
      background: 'linear-gradient(160deg,#E7F4FD 0%,#DCE7F0 100%)',
      boxShadow: 'var(--shadow-media)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: onClick ? 'pointer' : 'default',
      ...style
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: isReel(format) ? 'play' : 'images',
    size: typeof w === 'number' ? Math.min(22, Math.round(w * 0.36)) : 22,
    color: "var(--blue-300)"
  }), topBadge ? /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      left: 4,
      top: 4,
      padding: '2px 5px',
      borderRadius: 999,
      background: 'var(--amber)',
      color: 'var(--white)',
      font: '700 9px var(--font-ui)',
      whiteSpace: 'nowrap'
    }
  }, topBadge) : null, badge ? /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      left: 4,
      bottom: 4,
      padding: '2px 6px',
      borderRadius: 999,
      background: 'rgba(11,15,20,0.55)',
      color: 'var(--white)',
      font: '700 10px var(--font-ui)',
      whiteSpace: 'nowrap'
    }
  }, badge) : null);
}
function Card({
  children,
  pad = 14,
  onClick,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClick,
    role: onClick ? 'button' : undefined,
    style: {
      background: 'var(--white)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-card)',
      padding: pad,
      cursor: onClick ? 'pointer' : 'default',
      transition: 'transform var(--dur-instant) var(--ease-out)',
      ...style
    }
  }, children);
}

/* Pinned bottom action bar. Content scrolls behind it. */
function ActionBar({
  children,
  dark = false,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: '0 0 auto',
      padding: `12px ${GUT}px 26px`,
      background: dark ? 'linear-gradient(180deg,rgba(11,15,20,0) 0%,var(--ink-900) 42%)' : 'linear-gradient(180deg,rgba(247,250,253,0) 0%,var(--off-white) 34%)',
      display: 'flex',
      gap: 10,
      ...style
    }
  }, children);
}
function SkeletonLine({
  w = '100%',
  h = 13,
  r = 999,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: w,
      height: h,
      borderRadius: r,
      background: 'var(--fill-quiet)',
      ...style
    }
  });
}
function SkeletonCard({
  height = 92,
  radius = 'var(--radius-lg)',
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height,
      borderRadius: radius,
      background: 'linear-gradient(100deg,var(--fill-quiet) 30%,#FAFCFE 50%,var(--fill-quiet) 70%)',
      backgroundSize: '220% 100%',
      animation: 'noni-shimmer 1400ms linear infinite',
      ...style
    }
  });
}
function SkeletonRows({
  n = 4,
  height = 92,
  gap = 12
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap
    }
  }, Array.from({
    length: n
  }).map((_, i) => /*#__PURE__*/React.createElement(SkeletonCard, {
    key: i,
    height: height
  })));
}

/* Bottom sheet. 240ms rise, scrim fades with it. */
function Sheet({
  title,
  subtitle,
  onClose,
  children,
  footer,
  animate = true,
  maxHeight = '84%',
  style
}) {
  const {
    Icon
  } = NS();
  const [shown, setShown] = React.useState(!animate);
  React.useLayoutEffect(() => {
    if (animate) {
      const t = setTimeout(() => setShown(true), 0);
      return () => clearTimeout(t);
    }
  }, [animate]);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      zIndex: 70,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end'
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
    style: {
      position: 'absolute',
      inset: 0,
      background: 'var(--scrim)',
      opacity: shown ? 1 : 0,
      transition: 'opacity var(--dur-base) var(--ease-out)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      maxHeight,
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--white)',
      borderRadius: 'var(--radius-2xl) var(--radius-2xl) 0 0',
      boxShadow: 'var(--shadow-raised)',
      paddingBottom: 24,
      transform: shown ? 'translateY(0)' : 'translateY(100%)',
      transition: 'transform var(--dur-base) var(--ease-out)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '10px 0 0',
      display: 'flex',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 40,
      height: 5,
      borderRadius: 999,
      background: 'var(--line-strong)'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: `14px ${GUT}px 12px`,
      display: 'flex',
      alignItems: 'flex-start',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      font: '700 21px var(--font-display)',
      letterSpacing: '-0.4px',
      color: 'var(--ink)'
    }
  }, title), subtitle ? /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '5px 0 0',
      font: '400 14px/1.45 var(--font-ui)',
      color: 'var(--slate-500)'
    }
  }, subtitle) : null), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClose,
    "aria-label": "Close",
    style: {
      border: 'none',
      background: 'var(--fill-quiet)',
      width: 32,
      height: 32,
      flex: '0 0 auto',
      borderRadius: 999,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "x",
    size: 17,
    color: "var(--slate-500)"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minHeight: 0,
      overflowY: 'auto',
      padding: `0 ${GUT}px`
    }
  }, children), footer ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: `12px ${GUT}px 0`
    }
  }, footer) : null));
}

/* Score dial for the AI review step. Ring only — no gauge chrome. */
function ScoreDial({
  value,
  size = 76,
  stroke = 7,
  label
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const tone = value >= 80 ? 'var(--green)' : value >= 65 ? 'var(--amber)' : 'var(--danger)';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: size,
      height: size,
      position: 'relative',
      flex: '0 0 auto'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    style: {
      transform: 'rotate(-90deg)'
    }
  }, /*#__PURE__*/React.createElement("circle", {
    cx: size / 2,
    cy: size / 2,
    r: r,
    fill: "none",
    stroke: "var(--fill-quiet)",
    strokeWidth: stroke
  }), /*#__PURE__*/React.createElement("circle", {
    cx: size / 2,
    cy: size / 2,
    r: r,
    fill: "none",
    stroke: tone,
    strokeWidth: stroke,
    strokeLinecap: "round",
    strokeDasharray: c,
    strokeDashoffset: c * (1 - value / 100),
    style: {
      transition: 'stroke-dashoffset var(--dur-slow) var(--ease-out)'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: `700 ${Math.round(size * 0.31)}px var(--font-display)`,
      letterSpacing: '-0.5px',
      color: 'var(--ink)'
    }
  }, value), label ? /*#__PURE__*/React.createElement("span", {
    style: {
      font: '700 9px var(--font-ui)',
      letterSpacing: '0.6px',
      textTransform: 'uppercase',
      color: 'var(--slate-400)'
    }
  }, label) : null));
}
function ScoreBar({
  value,
  style
}) {
  const tone = value >= 80 ? 'var(--green)' : value >= 65 ? 'var(--amber)' : 'var(--danger)';
  return /*#__PURE__*/React.createElement("span", {
    style: {
      width: 54,
      height: 6,
      borderRadius: 999,
      background: 'var(--fill-quiet)',
      overflow: 'hidden',
      display: 'inline-block',
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      width: `${value}%`,
      height: '100%',
      borderRadius: 999,
      background: tone
    }
  }));
}

/* Settings-style navigation row. */
function NavRow({
  icon,
  label,
  meta,
  onClick,
  tone = 'plain',
  last = false
}) {
  const {
    Icon
  } = NS();
  const danger = tone === 'danger';
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClick,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      width: '100%',
      padding: '14px 14px',
      border: 'none',
      borderBottom: last ? 'none' : '1px solid var(--line)',
      background: 'transparent',
      cursor: 'pointer',
      textAlign: 'left'
    }
  }, icon ? /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 19,
    color: danger ? 'var(--danger)' : 'var(--slate-500)'
  }) : null, /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      font: '600 15px var(--font-ui)',
      color: danger ? 'var(--danger)' : 'var(--ink)'
    }
  }, label), meta ? /*#__PURE__*/React.createElement("span", {
    style: {
      font: '600 14px var(--font-ui)',
      color: 'var(--slate-400)',
      whiteSpace: 'nowrap'
    }
  }, meta) : null, !danger ? /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-right",
    size: 17,
    color: "var(--slate-300)"
  }) : null);
}
const ADMIN_TABS = [{
  label: 'Review',
  icon: 'inbox'
}, {
  label: 'Briefs',
  icon: 'layout-list'
}, {
  label: 'Library',
  icon: 'images'
}, {
  label: 'Creators',
  icon: 'users'
}, {
  label: 'Analytics',
  icon: 'chart-column'
}];
Object.assign(window, {
  AdminScreen,
  AdminHeader,
  PushHeader,
  Segmented,
  SectionLabel,
  CountPill,
  Avatar,
  FormatChip,
  TypeChip,
  PostTypeChip,
  TYPE_TONES,
  Thumb,
  Card,
  ActionBar,
  SkeletonLine,
  SkeletonCard,
  SkeletonRows,
  Sheet,
  ScoreDial,
  ScoreBar,
  NavRow,
  ADMIN_TABS,
  GUT,
  isReel,
  formatLabel
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin-app/AdminShared.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin-app/AdminShots.jsx
try { (() => {
/* Handoff sheet — the Briefs authoring loop only, three phones per row so the
   page is light enough to capture. */
function AdminShots() {
  const items = [['01 Briefs · videos', /*#__PURE__*/React.createElement(BriefsScreen, null)], ['02 Briefs · slideshows', /*#__PURE__*/React.createElement(BriefsScreen, {
    lane: 1
  })], ['03 Briefs · all complete', /*#__PURE__*/React.createElement(BriefsScreen, {
    state: "ready"
  })], ['04 Briefs · published', /*#__PURE__*/React.createElement(BriefsScreen, {
    state: "published"
  })], ['05 Briefs · calendar', /*#__PURE__*/React.createElement(BriefsScreen, {
    view: "calendar"
  })], ['06 Briefs · no week yet', /*#__PURE__*/React.createElement(BriefsScreen, {
    state: "empty"
  })], ['07 Week setup · mix', /*#__PURE__*/React.createElement(WeekSetup, {
    step: 0
  })], ['08 Week setup · video types', /*#__PURE__*/React.createElement(WeekSetup, {
    step: 1
  })], ['09 Week setup · slideshow types', /*#__PURE__*/React.createElement(WeekSetup, {
    step: 2
  })], ['10 Editor 1 · title', /*#__PURE__*/React.createElement(PostEditor, {
    step: 0
  })], ['11 Editor 2 · search phrase', /*#__PURE__*/React.createElement(PostEditor, {
    step: 1
  })], ['12 Editor 3 · hook', /*#__PURE__*/React.createElement(PostEditor, {
    step: 2
  })], ['13 Editor 3 · other', /*#__PURE__*/React.createElement(PostEditor, {
    step: 2,
    state: "other"
  })], ['14 Editor 4 · CTA', /*#__PURE__*/React.createElement(PostEditor, {
    step: 3
  })], ['15 Editor 5 · talking points', /*#__PURE__*/React.createElement(PostEditor, {
    step: 4
  })], ['16 Editor 5 · camera roll', /*#__PURE__*/React.createElement(PostEditor, {
    step: 4,
    sheet: "shot",
    animateSheet: false
  })], ['17 Editor 5 · move to clip', /*#__PURE__*/React.createElement(PostEditor, {
    step: 4,
    sheet: "move",
    animateSheet: false
  })], ['18 Editor 6 · caption', /*#__PURE__*/React.createElement(PostEditor, {
    step: 5
  })], ['19 Editor 7 · AI review', /*#__PURE__*/React.createElement(PostEditor, {
    step: 6
  })], ['20 Editor · fill with AI', /*#__PURE__*/React.createElement(PostEditor, {
    step: 0,
    sheet: "fill",
    animateSheet: false
  })], ['21 Editor · library picker', /*#__PURE__*/React.createElement(PostEditor, {
    step: 2,
    sheet: "library",
    animateSheet: false
  })], ['22 Editor · slides', /*#__PURE__*/React.createElement(PostEditor, {
    step: 4,
    format: "photo_carousel"
  })], ['23 Editor · slideshow review', /*#__PURE__*/React.createElement(PostEditor, {
    step: 6,
    format: "photo_carousel"
  })], ['24 Library · ideas', /*#__PURE__*/React.createElement(LibraryScreen, null)]];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 32,
      padding: 40
    }
  }, items.map(([label, node]) => /*#__PURE__*/React.createElement(Phone, {
    key: label,
    label: label
  }, node)));
}
Object.assign(window, {
  AdminShots
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin-app/AdminShots.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin-app/AnalyticsScreens.jsx
try { (() => {
/* Analytics and everything reachable from it: Settings (gear), the account
   template, Brand Brain and Features. The job here is to replace the
   spreadsheet, not to build a dashboard. */

function AnalyticsScreen({
  state = 'default',
  onSettings,
  onOpenDay
}) {
  const {
    Icon,
    EmptyState
  } = window.NoniDesignSystem_710e43;
  const A = window.NONI_ADMIN.analytics;
  const [metric, setMetric] = React.useState(0);
  const [range, setRange] = React.useState(1);
  const loading = state === 'loading';
  const empty = state === 'empty';
  return /*#__PURE__*/React.createElement(AdminScreen, null, /*#__PURE__*/React.createElement(AdminHeader, {
    title: "Analytics",
    subtitle: loading ? null : 'Posting activity and conversion on one axis.',
    right: /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: onSettings,
      "aria-label": "Settings",
      style: {
        width: 38,
        height: 38,
        borderRadius: 999,
        border: 'none',
        cursor: 'pointer',
        background: 'var(--white)',
        boxShadow: 'var(--shadow-card)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "settings",
      size: 19,
      color: "var(--slate-500)"
    }))
  }), loading ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(SkeletonCard, {
    height: 210
  }), /*#__PURE__*/React.createElement(SkeletonRows, {
    n: 3,
    height: 64
  })) : null, !loading && empty ? /*#__PURE__*/React.createElement(EmptyState, {
    icon: "chart-column",
    title: "No numbers yet",
    body: "Metrics start landing the day the first post goes live.",
    style: {
      marginTop: 40
    }
  }) : null, !loading && !empty ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Segmented, {
    items: ['Views', 'Revenue', 'Sales'],
    active: metric,
    onSelect: setMetric
  }), /*#__PURE__*/React.createElement(Card, {
    pad: 16
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: '700 34px var(--font-display)',
      letterSpacing: 'var(--tracking-title)',
      color: 'var(--ink)'
    }
  }, metric === 0 ? A.headline.views : metric === 1 ? A.headline.revenue : '284'), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 2,
      font: '600 13px var(--font-ui)',
      color: 'var(--slate-500)'
    }
  }, ['Views', 'Attributed revenue', 'Sales'][metric], " \xB7 ", ['7 days', '30 days', '90 days'][range])), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      padding: '6px 10px',
      borderRadius: 999,
      background: 'var(--green-soft)',
      color: 'var(--green)',
      font: '700 12px var(--font-ui)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "trending-up",
    size: 13
  }), "+34%")), /*#__PURE__*/React.createElement(TimeSeriesChart, {
    series: A.series,
    events: A.events,
    onPick: onOpenDay
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 4,
      padding: 3,
      borderRadius: 999,
      background: 'var(--fill-quiet)',
      marginTop: 14
    }
  }, ['7 days', '30 days', '90 days'].map((r, i) => /*#__PURE__*/React.createElement("button", {
    key: r,
    type: "button",
    onClick: () => setRange(i),
    "aria-pressed": range === i,
    style: {
      flex: 1,
      padding: '8px 6px',
      borderRadius: 999,
      border: 'none',
      cursor: 'pointer',
      background: range === i ? 'var(--white)' : 'transparent',
      boxShadow: range === i ? 'var(--shadow-card)' : 'none',
      color: range === i ? 'var(--ink)' : 'var(--slate-500)',
      font: '700 13px var(--font-ui)'
    }
  }, r))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12,
      display: 'flex',
      gap: 14,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(Legend, {
    color: "var(--blue-500)",
    label: ['Views', 'Revenue', 'Sales'][metric]
  }), /*#__PURE__*/React.createElement(Legend, {
    color: "var(--blue-200)",
    label: "Posts that day",
    bar: true
  }))), /*#__PURE__*/React.createElement(SectionLabel, null, "Per creator"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, A.perCreator.map(c => /*#__PURE__*/React.createElement(Card, {
    key: c.name,
    pad: 13,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: c.name,
    size: 34
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: '700 14px var(--font-display)',
      letterSpacing: '-0.2px',
      color: 'var(--ink)'
    }
  }, c.name), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 2,
      font: '600 12px var(--font-ui)',
      color: 'var(--slate-400)'
    }
  }, c.posts, " posts \xB7 ", c.views, " views")), /*#__PURE__*/React.createElement("div", {
    style: {
      font: '700 16px var(--font-display)',
      letterSpacing: '-0.3px',
      color: 'var(--ink)'
    }
  }, c.revenue)))), /*#__PURE__*/React.createElement(SectionLabel, null, "Best hooks"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, A.hooks.map((h, i) => /*#__PURE__*/React.createElement(Card, {
    key: h.text,
    pad: 13,
    style: {
      display: 'flex',
      gap: 11,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 24,
      height: 24,
      flex: '0 0 auto',
      borderRadius: 999,
      background: 'var(--blue-100)',
      color: 'var(--blue-700)',
      font: '700 12px var(--font-display)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, i + 1), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      minWidth: 0,
      font: '600 14px/1.35 var(--font-ui)',
      color: 'var(--ink)'
    }
  }, h.text), /*#__PURE__*/React.createElement("span", {
    style: {
      font: '700 13px var(--font-ui)',
      color: 'var(--slate-500)'
    }
  }, h.views))))) : null);
}
function Legend({
  color,
  label,
  bar
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      font: '600 12px var(--font-ui)',
      color: 'var(--slate-500)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: bar ? 8 : 14,
      height: bar ? 12 : 3,
      borderRadius: bar ? 2 : 999,
      background: color
    }
  }), label);
}

/* Hand-written SVG. Posting activity as bars, the metric as an area line, one
   axis. Tap a day to see what ran. */
function TimeSeriesChart({
  series,
  events,
  height = 132,
  onPick
}) {
  const w = 318,
    h = height,
    pad = 6;
  const max = Math.max(...series);
  const evMax = Math.max(...events);
  const x = i => pad + i * (w - pad * 2) / (series.length - 1);
  const y = v => h - 26 - v / max * (h - 44);
  const line = series.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  const area = `${line} L${x(series.length - 1).toFixed(1)},${h - 26} L${x(0).toFixed(1)},${h - 26} Z`;
  const bw = Math.max(3, (w - pad * 2) / series.length - 3);
  return /*#__PURE__*/React.createElement("svg", {
    viewBox: `0 0 ${w} ${h}`,
    width: "100%",
    height: h,
    style: {
      marginTop: 14,
      display: 'block',
      overflow: 'visible'
    }
  }, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("linearGradient", {
    id: "noni-area",
    x1: "0",
    y1: "0",
    x2: "0",
    y2: "1",
    gradientUnits: "objectBoundingBox"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0%",
    stopColor: "#1BA6EE",
    stopOpacity: "0.22"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "100%",
    stopColor: "#1BA6EE",
    stopOpacity: "0"
  }))), events.map((e, i) => /*#__PURE__*/React.createElement("rect", {
    key: i,
    x: x(i) - bw / 2,
    y: h - 26 - e / evMax * 20,
    width: bw,
    height: e / evMax * 20 + 1,
    rx: "2",
    fill: "var(--blue-200)",
    onClick: onPick,
    style: {
      cursor: onPick ? 'pointer' : 'default'
    }
  })), /*#__PURE__*/React.createElement("line", {
    x1: pad,
    y1: h - 25.5,
    x2: w - pad,
    y2: h - 25.5,
    stroke: "var(--line)",
    strokeWidth: "1"
  }), /*#__PURE__*/React.createElement("path", {
    d: area,
    fill: "url(#noni-area)"
  }), /*#__PURE__*/React.createElement("path", {
    d: line,
    fill: "none",
    stroke: "#1BA6EE",
    strokeWidth: "2.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: x(series.length - 1),
    cy: y(series[series.length - 1]),
    r: "4.5",
    fill: "#1BA6EE",
    stroke: "#FFFFFF",
    strokeWidth: "2.5"
  }), ['Jul 8', 'Jul 22', 'Aug 6'].map((t, i) => /*#__PURE__*/React.createElement("text", {
    key: t,
    x: pad + i * ((w - pad * 2) / 2),
    y: h - 8,
    textAnchor: i === 0 ? 'start' : i === 2 ? 'end' : 'middle',
    style: {
      font: '600 10px var(--font-ui)',
      fill: 'var(--slate-400)'
    }
  }, t)));
}
function SettingsScreen({
  onBack,
  onTemplate,
  onBrain,
  onFeatures
}) {
  const {
    Button,
    Icon
  } = window.NoniDesignSystem_710e43;
  const A = window.NONI_ADMIN;
  return /*#__PURE__*/React.createElement(AdminScreen, {
    bottom: 40,
    pad: false
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minHeight: 0,
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
      padding: '0 0 40px'
    }
  }, /*#__PURE__*/React.createElement(PushHeader, {
    title: "Settings",
    meta: A.company.name,
    onBack: onBack
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: `0 ${window.GUT}px`,
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(SectionLabel, {
    right: /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      variant: "tint",
      icon: "plus"
    }, "Invite")
  }, "Roster"), /*#__PURE__*/React.createElement(Card, {
    pad: 0
  }, A.creators.map((c, i) => /*#__PURE__*/React.createElement("div", {
    key: c.id,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 11,
      padding: '12px 14px',
      borderBottom: i === A.creators.length - 1 ? 'none' : '1px solid var(--line)'
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: c.name,
    size: 32,
    tone: c.status === 'approved' ? 'brand' : 'quiet'
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: '600 14px var(--font-ui)',
      color: 'var(--ink)'
    }
  }, c.name), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 1,
      font: '600 12px var(--font-ui)',
      color: 'var(--slate-400)',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, "@", c.tiktok, " \xB7 @", c.instagram)), c.status === 'approved' ? /*#__PURE__*/React.createElement(Icon, {
    name: "circle-check-big",
    size: 17,
    color: "var(--green)"
  }) : /*#__PURE__*/React.createElement(TypeChip, {
    tone: "warn"
  }, "Pending"))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(SectionLabel, null, "Company"), /*#__PURE__*/React.createElement(Card, {
    pad: 0
  }, /*#__PURE__*/React.createElement(NavRow, {
    icon: "circle-user-round",
    label: "Account template",
    onClick: onTemplate
  }), /*#__PURE__*/React.createElement(NavRow, {
    icon: "sparkles",
    label: "Brand Brain",
    meta: "4 docs",
    onClick: onBrain
  }), /*#__PURE__*/React.createElement(NavRow, {
    icon: "circle-check-big",
    label: "Features",
    meta: "3 approved",
    onClick: onFeatures
  }), /*#__PURE__*/React.createElement(NavRow, {
    icon: "clock",
    label: "Publish time",
    meta: "Sun 8PM EST",
    last: true
  }))), /*#__PURE__*/React.createElement(Card, {
    pad: 0
  }, /*#__PURE__*/React.createElement(NavRow, {
    icon: "log-out",
    label: "Sign out",
    tone: "danger",
    last: true
  })), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '0 2px',
      textAlign: 'center',
      font: '600 12px var(--font-ui)',
      color: 'var(--slate-300)'
    }
  }, "Signed in as admin \xB7 ", A.company.name))));
}

/* Brand Brain — the doctrine the generator writes against. */
function BrainScreen({
  onBack,
  state = 'default'
}) {
  const {
    Button,
    Icon
  } = window.NoniDesignSystem_710e43;
  const A = window.NONI_ADMIN;
  const editing = state === 'editing';
  return /*#__PURE__*/React.createElement(AdminScreen, {
    bottom: 40,
    pad: false
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minHeight: 0,
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
      padding: '0 0 40px'
    }
  }, /*#__PURE__*/React.createElement(PushHeader, {
    title: "Brand Brain",
    meta: "What every brief is written against",
    onBack: onBack
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: `0 ${window.GUT}px`,
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, editing ? /*#__PURE__*/React.createElement(Card, {
    pad: 14
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      font: '700 12px var(--font-ui)',
      letterSpacing: 'var(--tracking-label)',
      textTransform: 'uppercase',
      color: 'var(--slate-500)'
    }
  }, "Voice"), /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    variant: "tint",
    icon: "sparkles"
  }, "Clean up")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 13,
      borderRadius: 'var(--radius-md)',
      border: '1.5px solid var(--blue-500)',
      boxShadow: '0 0 0 3px rgba(27,166,238,0.30)',
      minHeight: 150,
      font: '400 15px/1.55 var(--font-ui)',
      color: 'var(--ink)'
    }
  }, "One speaker, always. Credential in the opening eight seconds. Second person five to six times per hundred words. The product shows up once, inside a point, never as its own beat.")) : /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, A.brain.map(d => /*#__PURE__*/React.createElement(Card, {
    key: d.key,
    pad: 14,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: '700 16px var(--font-display)',
      letterSpacing: '-0.3px',
      color: 'var(--ink)'
    }
  }, d.key), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 3,
      font: '600 12px var(--font-ui)',
      color: 'var(--slate-400)'
    }
  }, d.words, " words \xB7 ", d.updated)), /*#__PURE__*/React.createElement(Icon, {
    name: "pencil",
    size: 17,
    color: "var(--slate-300)"
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(SectionLabel, {
    right: /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      variant: "ghost",
      icon: "plus"
    }, "Add")
  }, "Source accounts"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 7,
      flexWrap: 'wrap'
    }
  }, ['@sundayleaguetape', '@d1.keeper', '@coachlensuk', '@collegesoccerdad'].map(h => /*#__PURE__*/React.createElement("span", {
    key: h,
    style: {
      padding: '8px 12px',
      borderRadius: 999,
      background: 'var(--white)',
      border: '1px solid var(--border)',
      font: '600 13px var(--font-ui)',
      color: 'var(--ink)'
    }
  }, h)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(SectionLabel, null, "Saved search terms"), /*#__PURE__*/React.createElement(Card, {
    pad: 0
  }, ['why am I not getting recruited for college soccer', 'what do college coaches look for in film', 'soccer recruiting timeline sophomore year'].map((t, i, arr) => /*#__PURE__*/React.createElement("div", {
    key: t,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '12px 14px',
      borderBottom: i === arr.length - 1 ? 'none' : '1px solid var(--line)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "search",
    size: 14,
    color: "var(--slate-400)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      minWidth: 0,
      font: '600 13px var(--font-ui)',
      color: 'var(--ink)'
    }
  }, t), /*#__PURE__*/React.createElement("span", {
    style: {
      font: '600 11px var(--font-ui)',
      color: 'var(--slate-300)'
    }
  }, "used ", i + 1, "\xD7"))))))));
}

/* Features — the approved claims the plug must trace to. */
function FeaturesScreen({
  onBack,
  sheet = false,
  animateSheet = true
}) {
  const {
    Button,
    Icon
  } = window.NoniDesignSystem_710e43;
  const [open, setOpen] = React.useState(sheet);
  const F = window.NONI_ADMIN.features;
  const approved = F.filter(f => f.state === 'approved');
  const rejected = F.filter(f => f.state === 'rejected');
  return /*#__PURE__*/React.createElement(AdminScreen, {
    bottom: 96,
    pad: false,
    footer: /*#__PURE__*/React.createElement(ActionBar, null, /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      size: "md",
      icon: "plus",
      block: true,
      onClick: () => setOpen(true)
    }, "Add a claim"))
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minHeight: 0,
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
      padding: '0 0 96px'
    }
  }, /*#__PURE__*/React.createElement(PushHeader, {
    title: "Features",
    meta: "Every plug traces to one of these",
    onBack: onBack
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: `0 ${window.GUT}px`,
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(SectionLabel, null, "Approved"), approved.map(f => /*#__PURE__*/React.createElement(Card, {
    key: f.name,
    pad: 13,
    style: {
      display: 'flex',
      gap: 11,
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "circle-check-big",
    size: 17,
    color: "var(--green)",
    style: {
      flex: '0 0 auto',
      marginTop: 1
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: '700 15px var(--font-display)',
      letterSpacing: '-0.2px',
      color: 'var(--ink)'
    }
  }, f.name), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '4px 0 0',
      font: '400 13px/1.45 var(--font-ui)',
      color: 'var(--slate-500)'
    }
  }, f.body)), /*#__PURE__*/React.createElement(Icon, {
    name: "pencil",
    size: 15,
    color: "var(--slate-300)"
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(SectionLabel, null, "Rejected"), rejected.map(f => /*#__PURE__*/React.createElement(Card, {
    key: f.name,
    pad: 13,
    style: {
      display: 'flex',
      gap: 11,
      alignItems: 'flex-start',
      background: 'var(--fill-quiet)',
      border: 'none',
      boxShadow: 'none'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "x",
    size: 16,
    color: "var(--danger)",
    style: {
      flex: '0 0 auto',
      marginTop: 2
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: '700 15px var(--font-display)',
      letterSpacing: '-0.2px',
      color: 'var(--slate-500)'
    }
  }, f.name), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '4px 0 0',
      font: '400 13px/1.45 var(--font-ui)',
      color: 'var(--slate-400)'
    }
  }, f.body))))))), open ? /*#__PURE__*/React.createElement(Sheet, {
    title: "Bulk coach emails",
    subtitle: "Claims are quoted in briefs word for word. Write it the way a creator would say it.",
    onClose: () => setOpen(false),
    animate: animateSheet,
    maxHeight: "70%",
    footer: /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      size: "lg",
      block: true,
      onClick: () => setOpen(false)
    }, "Save claim")
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 13,
      borderRadius: 'var(--radius-md)',
      border: '1.5px solid var(--border-strong)',
      font: '600 15px var(--font-ui)',
      color: 'var(--ink)'
    }
  }, "Bulk coach emails"), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 13,
      borderRadius: 'var(--radius-md)',
      border: '1.5px solid var(--border-strong)',
      minHeight: 90,
      font: '400 15px/1.5 var(--font-ui)',
      color: 'var(--ink)'
    }
  }, "Sends a film link to a filtered list of college coaches."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, ['Approved', 'Rejected'].map((s, i) => /*#__PURE__*/React.createElement("span", {
    key: s,
    style: {
      flex: 1,
      textAlign: 'center',
      padding: '11px 8px',
      borderRadius: 'var(--radius-sm)',
      cursor: 'pointer',
      font: '700 14px var(--font-ui)',
      background: i === 0 ? 'var(--green-soft)' : 'var(--fill-quiet)',
      color: i === 0 ? 'var(--green)' : 'var(--slate-500)'
    }
  }, s))))) : null);
}
Object.assign(window, {
  AnalyticsScreen,
  TimeSeriesChart,
  SettingsScreen,
  BrainScreen,
  FeaturesScreen,
  Legend
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin-app/AnalyticsScreens.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin-app/ApprovalScreens.jsx
try { (() => {
/* The two gates that are not post review: music on a live slideshow, and the
   one-time creator account approval (which is also the account-linking
   moment). Plus the account template both sides read from. */

function MusicApproval({
  item,
  creator,
  state = 'default',
  onBack,
  onApproved
}) {
  const {
    Button,
    Icon
  } = window.NoniDesignSystem_710e43;
  const [done, setDone] = React.useState(state === 'approved');
  const slides = window.NONI_ADMIN.slides.slice(0, item.slides);
  const [i, setI] = React.useState(0);
  return /*#__PURE__*/React.createElement(AdminScreen, {
    bottom: 96,
    pad: false,
    footer: /*#__PURE__*/React.createElement(ActionBar, null, /*#__PURE__*/React.createElement(Button, {
      variant: "outline",
      size: "md",
      block: true,
      onClick: onBack,
      style: {
        flex: '0 0 42%'
      }
    }, "Not on it yet"), /*#__PURE__*/React.createElement(Button, {
      variant: "approve",
      size: "md",
      icon: "check",
      block: true,
      onClick: () => {
        setDone(true);
        onApproved && onApproved();
      },
      style: {
        flex: 1
      }
    }, "Song is on it"))
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minHeight: 0,
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
      padding: '0 0 96px'
    }
  }, /*#__PURE__*/React.createElement(PushHeader, {
    title: "Music approval",
    meta: `${creator.name} · ${item.posted}`,
    onBack: onBack
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: `0 ${window.GUT}px`,
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(SlideFrame, {
    slides: slides,
    index: i,
    onIndex: setI
  }), /*#__PURE__*/React.createElement(Card, {
    pad: 14,
    style: {
      display: 'flex',
      gap: 12,
      alignItems: 'center',
      background: 'var(--blue-50)',
      borderColor: 'var(--blue-100)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 40,
      height: 40,
      flex: '0 0 auto',
      borderRadius: 999,
      background: 'var(--blue-100)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "music-2",
    size: 19,
    color: "var(--blue-700)"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: '700 14px var(--font-display)',
      letterSpacing: '-0.2px',
      color: 'var(--ink)'
    }
  }, creator.short, " says the song is added"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 2,
      font: '600 12px var(--font-ui)',
      color: 'var(--slate-500)'
    }
  }, item.marked))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(SectionLabel, null, "Check the live post"), [['music-2', 'Open on TikTok', `@${creator.tiktok}`], ['at-sign', 'Open on Instagram', `@${creator.instagram}`]].map(([icon, label, handle]) => /*#__PURE__*/React.createElement(Card, {
    key: label,
    pad: 13,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 11
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 18,
    color: "var(--slate-500)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      font: '600 15px var(--font-ui)',
      color: 'var(--ink)'
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      font: '600 13px var(--font-ui)',
      color: 'var(--slate-400)'
    }
  }, handle), /*#__PURE__*/React.createElement(Icon, {
    name: "arrow-right",
    size: 16,
    color: "var(--slate-300)"
  })))), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '0 2px',
      font: '400 13px/1.45 var(--font-ui)',
      color: 'var(--slate-400)'
    }
  }, "Approving unlocks this post's earnings. Videos never enter this queue."))), done ? /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      zIndex: 80,
      background: 'var(--white)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
      padding: `0 ${window.GUT}px`,
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setDone(false),
    "aria-label": "Back",
    style: {
      position: 'absolute',
      top: 10,
      left: 16,
      width: 36,
      height: 36,
      borderRadius: 999,
      border: 'none',
      cursor: 'pointer',
      background: 'var(--fill-quiet)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-left",
    size: 20,
    color: "var(--ink)"
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 68,
      height: 68,
      borderRadius: 999,
      background: 'var(--green-soft)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 32,
    color: "var(--green)"
  })), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      font: '700 26px var(--font-display)',
      letterSpacing: 'var(--tracking-title)',
      color: 'var(--ink)'
    }
  }, "Song approved"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      maxWidth: 280,
      font: '400 15px/1.5 var(--font-ui)',
      color: 'var(--slate-500)'
    }
  }, "Earnings for this post are unlocked. ", creator.short, " sees it in their wallet tonight."), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "lg",
    block: true,
    onClick: onBack,
    style: {
      marginTop: 8
    }
  }, "Back to Review")) : null);
}

/* Once per creator. Approval and handle capture are the same moment —
   Upload-Post cannot post to an unlinked account. */
function AccountApproval({
  item,
  creator,
  state = 'default',
  onBack
}) {
  const {
    Button,
    Icon,
    TextField
  } = window.NoniDesignSystem_710e43;
  const sentBack = item.state === 'needs_changes';
  const [reason, setReason] = React.useState(state === 'reject' ? 'feed' : null);
  const rejecting = state === 'reject';
  const proof = (p, icon) => /*#__PURE__*/React.createElement(Card, {
    pad: 12,
    style: {
      display: 'flex',
      gap: 11,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(Thumb, {
    format: "video",
    w: 44,
    h: 58,
    badge: p.got
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: '700 14px var(--font-display)',
      letterSpacing: '-0.2px',
      color: 'var(--ink)'
    }
  }, p.label), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 3,
      font: '600 12px var(--font-ui)',
      color: 'var(--slate-500)'
    }
  }, p.need)), /*#__PURE__*/React.createElement(Icon, {
    name: "circle-check-big",
    size: 18,
    color: "var(--green)"
  }));
  return /*#__PURE__*/React.createElement(AdminScreen, {
    bottom: 100,
    pad: false,
    footer: /*#__PURE__*/React.createElement(ActionBar, null, /*#__PURE__*/React.createElement(Button, {
      variant: "outline",
      size: "md",
      block: true,
      style: {
        flex: '0 0 44%'
      }
    }, "Send back"), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      size: "md",
      icon: "check",
      block: true,
      style: {
        flex: 1
      }
    }, "Approve and link"))
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minHeight: 0,
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
      padding: '0 0 100px'
    }
  }, /*#__PURE__*/React.createElement(PushHeader, {
    title: "Account approval",
    meta: item.submitted,
    onBack: onBack
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: `0 ${window.GUT}px`,
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(Card, {
    pad: 14,
    style: {
      display: 'flex',
      gap: 12,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: creator.name,
    size: 46
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: '700 17px var(--font-display)',
      letterSpacing: '-0.3px',
      color: 'var(--ink)'
    }
  }, creator.name), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 2,
      font: '600 13px var(--font-ui)',
      color: 'var(--slate-500)'
    }
  }, creator.credential)), /*#__PURE__*/React.createElement(TypeChip, {
    tone: sentBack ? 'warn' : 'quiet'
  }, sentBack ? 'Needs changes' : 'Pending')), sentBack ? /*#__PURE__*/React.createElement(Card, {
    pad: 13,
    style: {
      background: 'var(--amber-soft)',
      borderColor: 'rgba(224,138,22,0.3)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "circle-alert",
    size: 16,
    color: "var(--amber)",
    style: {
      flex: '0 0 auto',
      marginTop: 1
    }
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      font: '700 13px var(--font-ui)',
      color: '#8A5A0E'
    }
  }, item.reason), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '4px 0 0',
      font: '400 13px/1.45 var(--font-ui)',
      color: '#8A5A0E'
    }
  }, item.note)))) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(SectionLabel, null, "Warm-up proof"), proof(item.ig), proof(item.tt), /*#__PURE__*/React.createElement(Card, {
    pad: 12,
    style: {
      display: 'flex',
      gap: 11,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(Thumb, {
    format: "photo_carousel",
    w: 38,
    h: 50
  }), /*#__PURE__*/React.createElement(Thumb, {
    format: "photo_carousel",
    w: 38,
    h: 50
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: '700 14px var(--font-display)',
      letterSpacing: '-0.2px',
      color: 'var(--ink)'
    }
  }, "Profile screenshots"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 3,
      font: '600 12px var(--font-ui)',
      color: 'var(--slate-500)'
    }
  }, "Both platforms, bio visible")), /*#__PURE__*/React.createElement(Icon, {
    name: "circle-check-big",
    size: 18,
    color: "var(--green)"
  }))), /*#__PURE__*/React.createElement(Card, {
    pad: 14
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: '700 12px var(--font-ui)',
      letterSpacing: 'var(--tracking-label)',
      textTransform: 'uppercase',
      color: 'var(--slate-500)'
    }
  }, "The feed test"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '7px 0 11px',
      font: '400 14px/1.45 var(--font-ui)',
      color: 'var(--ink)'
    }
  }, "For You has to be college soccer and recruiting. A cold or off-topic feed throttles every post this creator will ever make."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, [['Feed checks out', 'good'], ['Wrong content', 'bad']].map(([label, tone]) => /*#__PURE__*/React.createElement("span", {
    key: label,
    style: {
      flex: 1,
      textAlign: 'center',
      padding: '11px 8px',
      borderRadius: 'var(--radius-sm)',
      cursor: 'pointer',
      font: '700 14px var(--font-ui)',
      background: tone === 'good' === !rejecting ? 'var(--blue-100)' : 'var(--fill-quiet)',
      color: tone === 'good' === !rejecting ? 'var(--blue-700)' : 'var(--slate-500)',
      border: `1.5px solid ${tone === 'good' === !rejecting ? 'var(--blue-300)' : 'transparent'}`
    }
  }, label)))), rejecting ? /*#__PURE__*/React.createElement(Card, {
    pad: 14
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: '700 12px var(--font-ui)',
      letterSpacing: 'var(--tracking-label)',
      textTransform: 'uppercase',
      color: 'var(--slate-500)'
    }
  }, "Reason (goes to the creator)"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10,
      display: 'flex',
      flexDirection: 'column',
      gap: 7
    }
  }, [['feed', 'Feed is not college soccer'], ['age', 'Account is not new enough'], ['bio', 'Bio does not match the template'], ['proof', 'Recording too short or cut']].map(([key, label]) => /*#__PURE__*/React.createElement("button", {
    key: key,
    type: "button",
    onClick: () => setReason(key),
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '12px 13px',
      borderRadius: 'var(--radius-sm)',
      cursor: 'pointer',
      textAlign: 'left',
      border: 'none',
      background: reason === key ? 'var(--blue-100)' : 'var(--fill-quiet)',
      font: '600 14px var(--font-ui)',
      color: reason === key ? 'var(--blue-700)' : 'var(--ink)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 18,
      height: 18,
      borderRadius: 999,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: reason === key ? 'var(--blue-500)' : 'var(--white)'
    }
  }, reason === key ? /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 12,
    color: "var(--white)"
  }) : null), label))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 11,
      padding: 13,
      borderRadius: 'var(--radius-md)',
      border: '1.5px solid var(--border-strong)',
      minHeight: 72,
      font: '400 14px/1.5 var(--font-ui)',
      color: 'var(--slate-400)'
    }
  }, "What has to change before they resubmit")) : /*#__PURE__*/React.createElement(Card, {
    pad: 14
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: '700 12px var(--font-ui)',
      letterSpacing: 'var(--tracking-label)',
      textTransform: 'uppercase',
      color: 'var(--slate-500)'
    }
  }, "Handles to link"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '7px 0 12px',
      font: '400 13px/1.45 var(--font-ui)',
      color: 'var(--slate-500)'
    }
  }, "Captured on approval. Upload-Post needs both before anything can go out."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, [['music-2', 'TikTok', item.tiktok], ['at-sign', 'Instagram', item.instagram]].map(([icon, label, handle]) => /*#__PURE__*/React.createElement("div", {
    key: label,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '12px 13px',
      borderRadius: 'var(--radius-md)',
      border: '1.5px solid var(--border-strong)',
      background: 'var(--white)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 17,
    color: "var(--slate-400)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      font: '600 13px var(--font-ui)',
      color: 'var(--slate-400)',
      width: 66
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      font: '600 15px var(--font-ui)',
      color: 'var(--ink)'
    }
  }, "@", handle))))))));
}

/* Company-scoped. Creators see the same values on their setup screen, so the
   standard is visible before they submit rather than after they fail. */
function AccountTemplate({
  onBack
}) {
  const {
    Button,
    Icon
  } = window.NoniDesignSystem_710e43;
  const bio = 'D1 soccer film + recruiting\nEvery match tagged with FieldVision AI\nComment D1 for the breakdown';
  return /*#__PURE__*/React.createElement(AdminScreen, {
    bottom: 40,
    pad: false
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minHeight: 0,
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
      padding: '0 0 40px'
    }
  }, /*#__PURE__*/React.createElement(PushHeader, {
    title: "Account template",
    meta: "FieldVision AI",
    onBack: onBack
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: `0 ${window.GUT}px`,
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      font: '400 14px/1.5 var(--font-ui)',
      color: 'var(--slate-500)'
    }
  }, "What a creator account should look like. They copy it, they do not retype it."), /*#__PURE__*/React.createElement(Card, {
    pad: 14
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      font: '700 12px var(--font-ui)',
      letterSpacing: 'var(--tracking-label)',
      textTransform: 'uppercase',
      color: 'var(--slate-500)'
    }
  }, "Bio"), /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    variant: "tint",
    icon: "copy"
  }, "Copy")), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '10px 0 0',
      whiteSpace: 'pre-line',
      font: '400 15px/1.5 var(--font-ui)',
      color: 'var(--ink)'
    }
  }, bio)), /*#__PURE__*/React.createElement(Card, {
    pad: 14
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 56,
      height: 56,
      borderRadius: 999,
      flex: '0 0 auto',
      background: 'linear-gradient(160deg,#E7F4FD 0%,#DCE7F0 100%)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "circle-user-round",
    size: 24,
    color: "var(--blue-300)"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: '700 15px var(--font-display)',
      letterSpacing: '-0.2px',
      color: 'var(--ink)'
    }
  }, "Profile picture"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 2,
      font: '600 12px var(--font-ui)',
      color: 'var(--slate-500)'
    }
  }, "1080 \xD7 1080 PNG")), /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    variant: "tint",
    icon: "download"
  }, "Download"))), /*#__PURE__*/React.createElement(Card, {
    pad: 14
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: '700 12px var(--font-ui)',
      letterSpacing: 'var(--tracking-label)',
      textTransform: 'uppercase',
      color: 'var(--slate-500)'
    }
  }, "Link in bio"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10,
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '12px 13px',
      borderRadius: 'var(--radius-md)',
      background: 'var(--off-white)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "link",
    size: 16,
    color: "var(--slate-400)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      font: '600 15px var(--font-ui)',
      color: 'var(--ink)'
    }
  }, "fieldvisionai.com"), /*#__PURE__*/React.createElement(Icon, {
    name: "copy",
    size: 16,
    color: "var(--slate-400)"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(SectionLabel, null, "Example account"), /*#__PURE__*/React.createElement(Card, {
    pad: 12,
    style: {
      display: 'flex',
      gap: 11,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(Thumb, {
    format: "photo_carousel",
    w: 54,
    h: 72
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: '700 14px var(--font-display)',
      letterSpacing: '-0.2px',
      color: 'var(--ink)'
    }
  }, "@fabri.d1soccer"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 3,
      font: '400 13px/1.4 var(--font-ui)',
      color: 'var(--slate-500)'
    }
  }, "This is the bar. Same bio shape, same grid, no gym content.")))))));
}
Object.assign(window, {
  MusicApproval,
  AccountApproval,
  AccountTemplate
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin-app/ApprovalScreens.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin-app/BriefsScreen.jsx
try { (() => {
/* Briefs — the weekly authoring loop. One week pool, two lanes, thirty rows
   that all exist from week creation. Calendar is a view toggle here, never a
   tab. Every empty row is pre-stamped with a type and a search phrase, which
   is what kills the blank page. */

function BriefsScreen({
  state = 'default',
  view: view0 = 'grid',
  lane: lane0 = 0,
  onOpenPost,
  onNewWeek,
  onOpenDay
}) {
  const {
    Button,
    Icon,
    EmptyState
  } = window.NoniDesignSystem_710e43;
  const W = window.NONI_ADMIN.week;
  const [view, setView] = React.useState(view0);
  const [lane, setLane] = React.useState(lane0);
  const loading = state === 'loading';
  const empty = state === 'empty';
  const rows = lane === 0 ? W.rows : W.slideRows;
  const done = lane === 0 ? W.videoDone : W.slideshowDone;
  const target = lane === 0 ? W.videoTarget : W.slideshowTarget;
  const left = W.videoTarget + W.slideshowTarget - W.videoDone - W.slideshowDone;
  const ready = state === 'ready' || state === 'published' || left === 0;
  const published = state === 'published';
  if (empty) {
    return /*#__PURE__*/React.createElement(AdminScreen, null, /*#__PURE__*/React.createElement(AdminHeader, {
      title: "Briefs",
      subtitle: "A week is one shared pool of posts for the whole roster."
    }), /*#__PURE__*/React.createElement(EmptyState, {
      icon: "layout-list",
      title: "No week yet",
      body: "Set the ratio, split the types, and thirty stamped rows appear.",
      actionLabel: "Start week",
      onAction: onNewWeek,
      style: {
        marginTop: 40
      }
    }));
  }
  return /*#__PURE__*/React.createElement(AdminScreen, {
    footer: /*#__PURE__*/React.createElement(ActionBar, {
      style: {
        flexDirection: 'column',
        gap: 8
      }
    }, published ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      variant: "outline",
      size: "md",
      icon: "plus",
      block: true,
      onClick: onNewWeek
    }, "Start week 15"), /*#__PURE__*/React.createElement("span", {
      style: {
        font: '600 12px var(--font-ui)',
        color: 'var(--slate-400)',
        textAlign: 'center'
      }
    }, "Week 14 is with the creators. Next week opens now.")) : ready ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      size: "md",
      block: true
    }, "Publish to creators"), /*#__PURE__*/React.createElement("span", {
      style: {
        font: '600 12px var(--font-ui)',
        color: 'var(--slate-400)',
        textAlign: 'center'
      }
    }, "Before Sunday 8:00 PM EST, so creators are notified on schedule.")) : /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '13px 15px',
        borderRadius: 'var(--radius-md)',
        background: 'var(--white)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-card)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 34,
        height: 34,
        flex: '0 0 auto',
        borderRadius: 999,
        background: 'var(--blue-100)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        font: '700 13px var(--font-display)',
        color: 'var(--blue-700)'
      }
    }, left), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        font: '600 13px/1.4 var(--font-ui)',
        color: 'var(--slate-500)'
      }
    }, "posts left this week. Publish opens when all thirty are complete."))),
    bottom: 128
  }, /*#__PURE__*/React.createElement(AdminHeader, {
    title: "Briefs",
    subtitle: loading ? null : `${W.label} · ${W.range}`,
    right: /*#__PURE__*/React.createElement(ViewToggle, {
      view: view,
      onView: setView
    })
  }), loading ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(SkeletonCard, {
    height: 78
  }), /*#__PURE__*/React.createElement(SkeletonRows, {
    n: 5,
    height: 72
  })) : view === 'calendar' ? /*#__PURE__*/React.createElement(CalendarView, {
    onOpenDay: onOpenDay
  }) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(LaneCard, {
    label: "Videos",
    done: W.videoDone,
    target: W.videoTarget,
    on: lane === 0,
    onClick: () => setLane(0),
    icon: "video"
  }), /*#__PURE__*/React.createElement(LaneCard, {
    label: "Slideshows",
    done: W.slideshowDone,
    target: W.slideshowTarget,
    on: lane === 1,
    onClick: () => setLane(1),
    icon: "images"
  })), /*#__PURE__*/React.createElement(SplitHeader, {
    split: lane === 0 ? W.split : W.slideSplit
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, rows.map(r => /*#__PURE__*/React.createElement(PostRow, {
    key: r.n,
    row: r,
    onClick: () => onOpenPost && onOpenPost(r)
  })), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '8px 2px 0',
      font: '400 13px/1.45 var(--font-ui)',
      color: 'var(--slate-400)'
    }
  }, done, " of ", target, " ", lane === 0 ? 'videos' : 'slideshows', " complete."))));
}
function ViewToggle({
  view,
  onView
}) {
  const {
    Icon
  } = window.NoniDesignSystem_710e43;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 3,
      padding: 3,
      borderRadius: 999,
      background: 'var(--fill-quiet)'
    }
  }, [['grid', 'layout-grid'], ['calendar', 'calendar-days']].map(([k, icon]) => /*#__PURE__*/React.createElement("button", {
    key: k,
    type: "button",
    onClick: () => onView(k),
    "aria-label": k === 'grid' ? 'Grid view' : 'Calendar view',
    "aria-pressed": view === k,
    style: {
      width: 36,
      height: 32,
      borderRadius: 999,
      border: 'none',
      cursor: 'pointer',
      background: view === k ? 'var(--white)' : 'transparent',
      boxShadow: view === k ? 'var(--shadow-card)' : 'none',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'background var(--dur-fast) var(--ease-out)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 17,
    color: view === k ? 'var(--ink)' : 'var(--slate-400)'
  }))));
}

/* The switcher is the progress. Two buttons, counts inside them. */
function LaneCard({
  label,
  done,
  target,
  on,
  onClick,
  icon
}) {
  const {
    Icon
  } = window.NoniDesignSystem_710e43;
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClick,
    "aria-pressed": on,
    style: {
      flex: 1,
      textAlign: 'left',
      padding: 14,
      borderRadius: 'var(--radius-lg)',
      cursor: 'pointer',
      background: on ? 'var(--blue-500)' : 'var(--white)',
      border: `1px solid ${on ? 'transparent' : 'var(--border)'}`,
      boxShadow: on ? 'var(--shadow-accent)' : 'var(--shadow-card)',
      transition: 'background var(--dur-fast) var(--ease-out)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 15,
    color: on ? 'rgba(255,255,255,0.75)' : 'var(--slate-400)'
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      font: '700 13px var(--font-ui)',
      color: on ? 'rgba(255,255,255,0.85)' : 'var(--slate-500)'
    }
  }, label)), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 7,
      font: '700 26px var(--font-display)',
      letterSpacing: '-0.6px',
      color: on ? 'var(--white)' : 'var(--ink)'
    }
  }, done, /*#__PURE__*/React.createElement("span", {
    style: {
      font: '700 17px var(--font-display)',
      color: on ? 'rgba(255,255,255,0.6)' : 'var(--slate-400)'
    }
  }, " / ", target)), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 9,
      height: 5,
      borderRadius: 999,
      background: on ? 'rgba(255,255,255,0.28)' : 'var(--fill-quiet)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      width: `${done / target * 100}%`,
      height: '100%',
      borderRadius: 999,
      background: on ? 'var(--white)' : 'var(--blue-300)'
    }
  })));
}

/* The pool was a plan, not a lock. Drift shows here rather than in a dialog. */
function SplitHeader({
  split
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      overflowX: 'auto',
      paddingBottom: 2
    }
  }, split.map(s => {
    const drift = s.actual !== s.planned;
    return /*#__PURE__*/React.createElement("span", {
      key: s.type,
      style: {
        flex: '0 0 auto',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '7px 11px',
        borderRadius: 999,
        background: 'var(--white)',
        border: `1px solid ${drift ? 'rgba(224,138,22,0.4)' : 'var(--border)'}`,
        font: '700 12px var(--font-ui)',
        color: 'var(--slate-500)'
      }
    }, s.label, /*#__PURE__*/React.createElement("span", {
      style: {
        font: '700 12px var(--font-ui)',
        color: drift ? 'var(--amber)' : 'var(--ink)'
      }
    }, s.actual, drift ? `/${s.planned}` : ''));
  }));
}

/* Four states, readable while scrolling, no legend: empty, partial,
   filled-unreviewed, complete. Killed slots keep their reason. */
function PostRow({
  row,
  onClick
}) {
  const {
    Icon
  } = window.NoniDesignSystem_710e43;
  const n = String(row.n).padStart(2, '0');
  const num = /*#__PURE__*/React.createElement("span", {
    style: {
      width: 20,
      flex: '0 0 auto',
      font: '700 12px var(--font-ui)',
      color: 'var(--slate-300)',
      paddingTop: 2
    }
  }, n);
  if (row.state === 'empty') {
    return /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: onClick,
      style: {
        display: 'flex',
        gap: 10,
        width: '100%',
        textAlign: 'left',
        padding: 13,
        borderRadius: 'var(--radius-lg)',
        cursor: 'pointer',
        background: 'transparent',
        border: '1.5px dashed var(--line-strong)'
      }
    }, num, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement(PostTypeChip, {
      type: row.type,
      style: {
        alignSelf: 'flex-start'
      }
    }, row.typeLabel), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 7,
        alignItems: 'flex-start'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "search",
      size: 14,
      color: "var(--slate-400)",
      style: {
        flex: '0 0 auto',
        marginTop: 2
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        font: '400 14px/1.35 var(--font-ui)',
        color: 'var(--slate-500)'
      }
    }, "\u201C", row.phrase, "\u201D"))), /*#__PURE__*/React.createElement(Icon, {
      name: "plus",
      size: 17,
      color: "var(--slate-300)"
    }));
  }
  if (row.state === 'killed') {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 10,
        padding: 13,
        borderRadius: 'var(--radius-lg)',
        background: 'var(--fill-quiet)'
      }
    }, num, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        font: '700 13px var(--font-ui)',
        color: 'var(--slate-500)'
      }
    }, "Left empty on purpose"), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 3,
        font: '400 13px/1.4 var(--font-ui)',
        color: 'var(--slate-400)'
      }
    }, row.kill)));
  }
  const complete = row.state === 'complete';
  const filled = row.state === 'filled';
  return /*#__PURE__*/React.createElement(Card, {
    pad: 14,
    onClick: onClick,
    style: {
      display: 'flex',
      gap: 10,
      alignItems: 'center'
    }
  }, num, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: 9
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: '700 16px/1.3 var(--font-display)',
      letterSpacing: '-0.25px',
      color: 'var(--ink)'
    }
  }, row.title), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 7,
      alignItems: 'center',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement(PostTypeChip, {
    type: row.type
  }, row.typeLabel), complete ? /*#__PURE__*/React.createElement("span", {
    style: {
      font: '700 12px var(--font-ui)',
      color: 'var(--green)'
    }
  }, "AI score ", row.score) : null, filled ? /*#__PURE__*/React.createElement("span", {
    style: {
      font: '700 12px var(--font-ui)',
      color: 'var(--amber)'
    }
  }, "Needs review") : null, row.state === 'partial' ? /*#__PURE__*/React.createElement("span", {
    style: {
      font: '600 12px var(--font-ui)',
      color: 'var(--slate-400)'
    }
  }, row.filled) : null)), complete ? /*#__PURE__*/React.createElement(Icon, {
    name: "circle-check-big",
    size: 19,
    color: "var(--green)",
    style: {
      flex: '0 0 auto'
    }
  }) : /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-right",
    size: 18,
    color: "var(--slate-300)",
    style: {
      flex: '0 0 auto'
    }
  }));
}

/* Week oversight across creators. Compact cells; the day sheet carries the
   detail. */
function CalendarView({
  onOpenDay
}) {
  const {
    Icon
  } = window.NoniDesignSystem_710e43;
  const days = window.NONI_ADMIN.calendar;
  const dot = {
    assigned: 'var(--blue-300)',
    recorded: 'var(--amber)',
    submitted: 'var(--amber)',
    approved: 'var(--green)',
    posted: 'var(--green)'
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, days.map(d => /*#__PURE__*/React.createElement(Card, {
    key: d.day,
    pad: 12,
    onClick: () => onOpenDay && onOpenDay(d),
    style: {
      display: 'flex',
      gap: 12,
      alignItems: d.items.length ? 'flex-start' : 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 46,
      flex: '0 0 auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: '700 11px var(--font-ui)',
      letterSpacing: '0.4px',
      textTransform: 'uppercase',
      color: 'var(--slate-400)'
    }
  }, d.day.split(' ')[0]), /*#__PURE__*/React.createElement("div", {
    style: {
      font: '700 20px var(--font-display)',
      letterSpacing: '-0.4px',
      color: 'var(--ink)'
    }
  }, d.day.split(' ')[1])), d.items.length ? /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: 6
    }
  }, d.items.map((it, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '8px 10px',
      borderRadius: 'var(--radius-sm)',
      background: 'var(--off-white)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 7,
      height: 7,
      flex: '0 0 auto',
      borderRadius: 999,
      background: dot[it.s]
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      minWidth: 0,
      font: '600 13px var(--font-ui)',
      color: 'var(--ink)',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, it.t), /*#__PURE__*/React.createElement(Icon, {
    name: window.isReel(it.f) ? 'video' : 'images',
    size: 13,
    color: "var(--slate-400)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      font: '600 11px var(--font-ui)',
      color: 'var(--slate-400)'
    }
  }, it.c)))) : /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      font: '400 13px var(--font-ui)',
      color: 'var(--slate-300)'
    }
  }, "Rest day"))));
}
function DayDetailSheet({
  day,
  onClose,
  animate
}) {
  const {
    Button
  } = window.NoniDesignSystem_710e43;
  const dot = {
    assigned: 'var(--blue-300)',
    recorded: 'var(--amber)',
    submitted: 'var(--amber)',
    approved: 'var(--green)',
    posted: 'var(--green)'
  };
  const label = {
    assigned: 'To shoot',
    recorded: 'Recorded',
    submitted: 'In review',
    approved: 'Approved',
    posted: 'Posted'
  };
  return /*#__PURE__*/React.createElement(Sheet, {
    title: day.day,
    subtitle: `${day.items.length} posts across the roster`,
    onClose: onClose,
    animate: animate,
    maxHeight: "62%",
    footer: /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      size: "md",
      block: true,
      onClick: onClose
    }, "Close")
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, day.items.map((it, i) => /*#__PURE__*/React.createElement(Card, {
    key: i,
    pad: 12,
    style: {
      display: 'flex',
      gap: 11,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(Thumb, {
    format: it.f,
    w: 40,
    h: 54
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: '700 14px var(--font-display)',
      letterSpacing: '-0.2px',
      color: 'var(--ink)'
    }
  }, it.t), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 4,
      display: 'flex',
      gap: 6,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(FormatChip, {
    format: it.f,
    size: "sm"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      font: '700 11px var(--font-ui)',
      color: 'var(--slate-500)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: 999,
      background: dot[it.s]
    }
  }), label[it.s]))), /*#__PURE__*/React.createElement(Avatar, {
    name: it.c,
    size: 28
  })))));
}
Object.assign(window, {
  BriefsScreen,
  PostRow,
  CalendarView,
  DayDetailSheet,
  LaneCard,
  SplitHeader,
  ViewToggle
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin-app/BriefsScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin-app/CreatorsScreens.jsx
try { (() => {
/* Creators — list, profile, post detail and the one chat thread per creator.
   Review's per-post chat opens this same thread. Two entry points, one
   system. */

function CreatorsScreen({
  state = 'default',
  onOpen
}) {
  const {
    Icon,
    EmptyState
  } = window.NoniDesignSystem_710e43;
  const A = window.NONI_ADMIN;
  const [sort, setSort] = React.useState(0);
  const loading = state === 'loading';
  const empty = state === 'empty';
  const list = empty ? [] : A.creators.filter(c => c.status === 'approved');
  return /*#__PURE__*/React.createElement(AdminScreen, null, /*#__PURE__*/React.createElement(AdminHeader, {
    title: "Creators",
    subtitle: loading ? null : `${list.length} on the roster · ${A.accounts.filter(a => a.state === 'pending').length} waiting on approval`
  }), !loading && !empty ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6
    }
  }, ['Earnings', 'Views', 'Posts'].map((s, i) => /*#__PURE__*/React.createElement("button", {
    key: s,
    type: "button",
    onClick: () => setSort(i),
    style: {
      flex: '0 0 auto',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      padding: '7px 12px',
      borderRadius: 999,
      border: 'none',
      cursor: 'pointer',
      background: sort === i ? 'var(--blue-100)' : 'var(--white)',
      boxShadow: sort === i ? 'none' : 'var(--shadow-card)',
      color: sort === i ? 'var(--blue-700)' : 'var(--slate-500)',
      font: '700 12px var(--font-ui)'
    }
  }, sort === i ? /*#__PURE__*/React.createElement(Icon, {
    name: "trending-up",
    size: 12
  }) : null, s))) : null, loading ? /*#__PURE__*/React.createElement(SkeletonRows, {
    n: 3,
    height: 112
  }) : null, !loading && empty ? /*#__PURE__*/React.createElement(EmptyState, {
    icon: "users",
    title: "No creators yet",
    body: "Invite from Settings. They upload warm-up proof, you approve, then briefs start landing.",
    style: {
      marginTop: 40
    }
  }) : null, !loading && !empty ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, list.map(c => /*#__PURE__*/React.createElement(Card, {
    key: c.id,
    pad: 14,
    onClick: () => onOpen && onOpen(c)
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: c.name,
    size: 44
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: '700 17px var(--font-display)',
      letterSpacing: '-0.3px',
      color: 'var(--ink)'
    }
  }, c.name), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 2,
      font: '600 12px var(--font-ui)',
      color: 'var(--slate-400)',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, "@", c.tiktok)), /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-right",
    size: 18,
    color: "var(--slate-300)"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 13,
      display: 'flex',
      gap: 8
    }
  }, [[c.earned, 'earned'], [c.posts, 'posts'], [c.views, 'views']].map(([v, l]) => /*#__PURE__*/React.createElement("div", {
    key: l,
    style: {
      flex: 1,
      padding: '10px 11px',
      borderRadius: 'var(--radius-sm)',
      background: 'var(--off-white)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: '700 16px var(--font-display)',
      letterSpacing: '-0.3px',
      color: 'var(--ink)'
    }
  }, v), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 1,
      font: '600 11px var(--font-ui)',
      color: 'var(--slate-400)'
    }
  }, l))))))) : null);
}

/* Instagram-style profile: stats, then a grid or calendar of their posts. */
function CreatorProfile({
  creator,
  view: view0 = 'grid',
  onBack,
  onChat,
  onOpenPost
}) {
  const {
    Icon
  } = window.NoniDesignSystem_710e43;
  const A = window.NONI_ADMIN;
  const [view, setView] = React.useState(view0);
  const posts = A.library.ours;
  return /*#__PURE__*/React.createElement(AdminScreen, {
    bottom: 40,
    pad: false
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minHeight: 0,
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
      padding: '0 0 40px'
    }
  }, /*#__PURE__*/React.createElement(PushHeader, {
    title: creator.name,
    meta: `@${creator.tiktok}`,
    onBack: onBack,
    right: /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: onChat,
      "aria-label": `Message ${creator.short}`,
      style: {
        width: 36,
        height: 36,
        borderRadius: 999,
        border: 'none',
        cursor: 'pointer',
        background: 'var(--blue-100)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "message-circle",
      size: 18,
      color: "var(--blue-700)"
    }))
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: `0 ${window.GUT}px`,
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: creator.name,
    size: 64
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      gap: 8
    }
  }, [[creator.views, 'views'], [creator.posts, 'posts'], [creator.earned, 'earned']].map(([v, l]) => /*#__PURE__*/React.createElement("div", {
    key: l,
    style: {
      flex: 1,
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: '700 18px var(--font-display)',
      letterSpacing: '-0.4px',
      color: 'var(--ink)'
    }
  }, v), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 1,
      font: '600 11px var(--font-ui)',
      color: 'var(--slate-400)'
    }
  }, l))))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      font: '600 14px/1.45 var(--font-ui)',
      color: 'var(--ink)'
    }
  }, creator.credential), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 3,
      font: '600 13px var(--font-ui)',
      color: 'var(--slate-400)'
    }
  }, "@", creator.tiktok, " \xB7 @", creator.instagram)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 3,
      padding: 3,
      borderRadius: 999,
      background: 'var(--fill-quiet)',
      alignSelf: 'flex-start'
    }
  }, [['grid', 'layout-grid'], ['calendar', 'calendar-days']].map(([k, icon]) => /*#__PURE__*/React.createElement("button", {
    key: k,
    type: "button",
    onClick: () => setView(k),
    "aria-label": k,
    "aria-pressed": view === k,
    style: {
      width: 44,
      height: 32,
      borderRadius: 999,
      border: 'none',
      cursor: 'pointer',
      background: view === k ? 'var(--white)' : 'transparent',
      boxShadow: view === k ? 'var(--shadow-card)' : 'none',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 16,
    color: view === k ? 'var(--ink)' : 'var(--slate-400)'
  })))), view === 'grid' ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gap: 6
    }
  }, posts.concat(posts).map((p, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    onClick: () => onOpenPost && onOpenPost(p),
    style: {
      position: 'relative',
      aspectRatio: '9/16',
      borderRadius: 'var(--radius-sm)',
      overflow: 'hidden',
      background: 'linear-gradient(160deg,#E7F4FD 0%,#DCE7F0 100%)',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'flex-end',
      padding: 7
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: window.isReel(p.format) ? 'play' : 'images',
    size: 13,
    color: "rgba(15,23,32,0.45)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 5,
      font: '700 11px var(--font-ui)',
      color: 'rgba(15,23,32,0.6)'
    }
  }, p.views)))) : /*#__PURE__*/React.createElement(CalendarView, null))));
}
function CreatorPost({
  post,
  creator,
  onBack
}) {
  const {
    Icon
  } = window.NoniDesignSystem_710e43;
  const stats = [['eye', post.views, 'views'], ['dollar-sign', '$180', 'payout'], ['bookmark', '4.1K', 'saves'], ['heart', '38K', 'likes'], ['message-circle', '612', 'comments']];
  return /*#__PURE__*/React.createElement(AdminScreen, {
    bottom: 40,
    pad: false
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minHeight: 0,
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
      padding: '0 0 40px'
    }
  }, /*#__PURE__*/React.createElement(PushHeader, {
    title: post.title,
    meta: `${creator.short} · ${post.when}`,
    onBack: onBack
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: `0 ${window.GUT}px`,
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      height: 300,
      borderRadius: 'var(--radius-xl)',
      background: 'linear-gradient(160deg,#E7F4FD 0%,#DCE7F0 100%)',
      boxShadow: 'var(--shadow-media)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: window.isReel(post.format) ? 'play' : 'images',
    size: 38,
    color: "var(--blue-300)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: 12,
      left: 12
    }
  }, /*#__PURE__*/React.createElement(FormatChip, {
    format: post.format,
    size: "sm"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      flexWrap: 'wrap'
    }
  }, stats.map(([icon, v, l]) => /*#__PURE__*/React.createElement("div", {
    key: l,
    style: {
      flex: '1 1 30%',
      padding: '11px 12px',
      borderRadius: 'var(--radius-sm)',
      background: 'var(--white)',
      border: '1px solid var(--border)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 14,
    color: "var(--slate-400)"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 6,
      font: '700 17px var(--font-display)',
      letterSpacing: '-0.4px',
      color: 'var(--ink)'
    }
  }, v), /*#__PURE__*/React.createElement("div", {
    style: {
      font: '600 11px var(--font-ui)',
      color: 'var(--slate-400)'
    }
  }, l)))), /*#__PURE__*/React.createElement(Card, {
    pad: 14
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: '700 12px var(--font-ui)',
      letterSpacing: 'var(--tracking-label)',
      textTransform: 'uppercase',
      color: 'var(--slate-500)'
    }
  }, "Caption"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '8px 0 0',
      font: '400 14px/1.5 var(--font-ui)',
      color: 'var(--ink)'
    }
  }, "Save this before Sunday. Comment D1 and I will send the template. #collegesoccer #matchfilm")))));
}

/* One thread per creator. A message can carry a post reference that renders
   inline; Review scrolls this thread to that post. */
function ChatScreen({
  creator,
  onBack
}) {
  const {
    Icon
  } = window.NoniDesignSystem_710e43;
  const msgs = window.NONI_ADMIN.chat;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minHeight: 0,
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--white)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: '0 0 auto',
      paddingTop: 4,
      borderBottom: '1px solid var(--line)',
      background: 'var(--white)'
    }
  }, /*#__PURE__*/React.createElement(PushHeader, {
    title: creator.name,
    meta: `@${creator.tiktok}`,
    onBack: onBack,
    style: {
      background: 'transparent'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minHeight: 0,
      overflowY: 'auto',
      padding: `16px ${window.GUT}px`,
      display: 'flex',
      flexDirection: 'column',
      gap: 9
    }
  }, msgs.map((m, i) => {
    const mine = m.from === 'admin';
    if (m.ref) {
      return /*#__PURE__*/React.createElement("div", {
        key: i,
        style: {
          alignSelf: mine ? 'flex-end' : 'flex-start',
          maxWidth: '84%',
          padding: 9,
          borderRadius: 16,
          background: 'var(--blue-500)'
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          gap: 9,
          alignItems: 'center',
          padding: 8,
          borderRadius: 12,
          background: 'rgba(255,255,255,0.16)'
        }
      }, /*#__PURE__*/React.createElement(Thumb, {
        format: m.ref.format,
        w: 34,
        h: 46
      }), /*#__PURE__*/React.createElement("div", {
        style: {
          minWidth: 0
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          font: '700 13px var(--font-ui)',
          color: 'var(--white)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }
      }, m.ref.title), /*#__PURE__*/React.createElement("div", {
        style: {
          marginTop: 2,
          font: '600 11px var(--font-ui)',
          color: 'rgba(255,255,255,0.75)'
        }
      }, m.ref.meta))), /*#__PURE__*/React.createElement("div", {
        style: {
          marginTop: 5,
          textAlign: 'right',
          font: '600 11px var(--font-ui)',
          color: 'rgba(255,255,255,0.7)'
        }
      }, m.time));
    }
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        alignSelf: mine ? 'flex-end' : 'flex-start',
        maxWidth: '84%',
        padding: '10px 13px',
        borderRadius: mine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
        background: mine ? 'var(--blue-500)' : 'var(--fill-quiet)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        font: '400 14px/1.4 var(--font-ui)',
        color: mine ? 'var(--white)' : 'var(--ink)'
      }
    }, m.body), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 4,
        font: '600 11px var(--font-ui)',
        color: mine ? 'rgba(255,255,255,0.7)' : 'var(--slate-400)'
      }
    }, m.time));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: '0 0 auto',
      padding: `10px ${window.GUT}px 26px`,
      borderTop: '1px solid var(--line)',
      display: 'flex',
      gap: 9,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      padding: '12px 15px',
      borderRadius: 999,
      background: 'var(--fill-quiet)',
      font: '400 15px var(--font-ui)',
      color: 'var(--slate-400)'
    }
  }, "Message ", creator.short), /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": "Send",
    style: {
      width: 44,
      height: 44,
      flex: '0 0 auto',
      borderRadius: 999,
      border: 'none',
      cursor: 'pointer',
      background: 'var(--blue-500)',
      boxShadow: 'var(--shadow-accent)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "send",
    size: 18,
    color: "var(--white)"
  }))));
}
Object.assign(window, {
  CreatorsScreen,
  CreatorProfile,
  CreatorPost,
  ChatScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin-app/CreatorsScreens.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin-app/EditorSheets.jsx
try { (() => {
/* The four sheets the post editor opens, plus the Library picker it shares
   with the Library tab. */

function FillSheet({
  onClose,
  animate,
  state = 'default'
}) {
  const {
    Button,
    Icon
  } = window.NoniDesignSystem_710e43;
  const [mode, setMode] = React.useState(0);
  const working = state === 'working';
  return /*#__PURE__*/React.createElement(Sheet, {
    title: "Fill this post",
    subtitle: "Claim, then search phrase, then points. The hook is written last, against the finished body.",
    onClose: onClose,
    animate: animate,
    maxHeight: "76%",
    footer: /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      size: "lg",
      block: true,
      icon: "sparkles",
      disabled: working
    }, working ? 'Writing the brief…' : 'Fill all fields')
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Segmented, {
    items: ['From a phrase', 'From a link'],
    active: mode,
    onSelect: setMode
  }), mode === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 14,
      borderRadius: 'var(--radius-md)',
      border: '1.5px solid var(--border-strong)',
      font: '400 15px/1.4 var(--font-ui)',
      color: 'var(--ink)'
    }
  }, "why my winger fades after 70 minutes") : /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 14,
      borderRadius: 'var(--radius-md)',
      border: '1.5px solid var(--border-strong)',
      font: '400 15px/1.4 var(--font-ui)',
      color: 'var(--slate-300)'
    }
  }, "Paste a TikTok or Instagram link"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 7
    }
  }, [['Claim', 'Off-ball run tagging', true], ['Search phrase', 'why my winger fades after 70 minutes', true], ['Talking points', 'Five, set by the type', working], ['Hook', '8 to 10 options, best first', false], ['Caption and hashtags', 'Phrase in the first sentence', false]].map(([label, hint, on], i) => /*#__PURE__*/React.createElement("div", {
    key: label,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '11px 12px',
      borderRadius: 'var(--radius-sm)',
      background: 'var(--off-white)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 20,
      height: 20,
      flex: '0 0 auto',
      borderRadius: 999,
      background: on ? 'var(--blue-500)' : 'var(--fill-quiet)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, on ? /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 12,
    color: "var(--white)"
  }) : /*#__PURE__*/React.createElement("span", {
    style: {
      font: '700 10px var(--font-ui)',
      color: 'var(--slate-400)'
    }
  }, i + 1)), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      font: '600 14px var(--font-ui)',
      color: 'var(--ink)'
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      font: '600 12px var(--font-ui)',
      color: 'var(--slate-400)',
      maxWidth: 140,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, hint)))), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '0 2px 4px',
      font: '400 13px/1.45 var(--font-ui)',
      color: 'var(--slate-400)'
    }
  }, "If a field cannot be filled with something concrete, the slot stays empty with the reason. Padding a post is worse than missing one.")));
}

/* Camera roll. The admin picks the screenshot that pops up on a clip — a
   real photo, never a generated graphic. */
function ShotPickerSheet({
  post,
  onClose,
  animate
}) {
  const {
    Button,
    Icon
  } = window.NoniDesignSystem_710e43;
  const [pick, setPick] = React.useState(2);
  const shots = ['Today', 'Today', 'Yesterday', 'Yesterday', 'Aug 3', 'Aug 3', 'Aug 1', 'Jul 29', 'Jul 29'];
  return /*#__PURE__*/React.createElement(Sheet, {
    title: "Camera roll",
    subtitle: "Pick the screenshot that pops up on this clip.",
    onClose: onClose,
    animate: animate,
    maxHeight: "78%",
    footer: /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      size: "lg",
      block: true,
      onClick: onClose
    }, "Use this screenshot")
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 8
    }
  }, shots.map((when, i) => /*#__PURE__*/React.createElement("button", {
    key: i,
    type: "button",
    onClick: () => setPick(i),
    style: {
      position: 'relative',
      padding: 0,
      border: 'none',
      background: 'transparent',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement(Thumb, {
    format: post && !window.isReel(post.format) ? 'photo_carousel' : 'video',
    w: "100%",
    h: 124,
    radius: "var(--radius-md)",
    style: {
      outline: i === pick ? '2.5px solid var(--blue-500)' : 'none',
      outlineOffset: 2
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      left: 6,
      bottom: 6,
      padding: '2px 7px',
      borderRadius: 999,
      background: 'rgba(11,15,20,0.55)',
      color: 'var(--white)',
      font: '700 10px var(--font-ui)'
    }
  }, when), i === pick ? /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: 6,
      right: 6,
      width: 20,
      height: 20,
      borderRadius: 999,
      background: 'var(--blue-500)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 12,
    color: "var(--white)"
  })) : null))));
}

/* Move — which clip or slide the screenshot pops up on. The slot list comes
   from the type, so there is nothing to type in. */
function MoveSheet({
  post,
  onClose,
  animate
}) {
  const {
    Button,
    Icon
  } = window.NoniDesignSystem_710e43;
  const slots = post && post.clipSlots || window.NONI_ADMIN.post.clipSlots;
  const [pick, setPick] = React.useState(3);
  const slide = post && !window.isReel(post.format);
  return /*#__PURE__*/React.createElement(Sheet, {
    title: slide ? 'Move to slide' : 'Move to clip',
    subtitle: "Slots come from the post type. Count is never a field.",
    onClose: onClose,
    animate: animate,
    maxHeight: "70%",
    footer: /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      size: "lg",
      block: true,
      onClick: onClose
    }, "Move it here")
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 7
    }
  }, slots.map((s, i) => {
    const on = i === pick;
    return /*#__PURE__*/React.createElement("button", {
      key: s,
      type: "button",
      onClick: () => setPick(i),
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 11,
        padding: 13,
        borderRadius: 'var(--radius-md)',
        cursor: 'pointer',
        border: `1.5px solid ${on ? 'var(--blue-500)' : 'transparent'}`,
        background: on ? 'var(--blue-50)' : 'var(--off-white)',
        textAlign: 'left'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        font: '600 15px var(--font-ui)',
        color: 'var(--ink)'
      }
    }, s), on ? /*#__PURE__*/React.createElement(Icon, {
      name: "check",
      size: 17,
      color: "var(--blue-600)"
    }) : null);
  })));
}

/* Opens from inside a post, filtered to that post's type. Using an item marks
   it used, never removes it. */
function LibraryPickerSheet({
  onClose,
  animate
}) {
  const {
    Button,
    Icon
  } = window.NoniDesignSystem_710e43;
  const L = window.NONI_ADMIN.library;
  const [chip, setChip] = React.useState(0);
  const items = chip === 0 ? L.refs : L.ours.filter(o => window.isReel(o.format));
  return /*#__PURE__*/React.createElement(Sheet, {
    title: "Pick an example",
    subtitle: "Filtered to numbered list videos.",
    onClose: onClose,
    animate: animate,
    maxHeight: "80%",
    footer: /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      size: "lg",
      block: true,
      onClick: onClose
    }, "Attach to post")
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Segmented, {
    items: ['References', 'Our posts'],
    active: chip,
    onSelect: setChip
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, items.map((it, i) => /*#__PURE__*/React.createElement(Card, {
    key: it.id,
    pad: 12,
    style: {
      display: 'flex',
      gap: 11,
      alignItems: 'center',
      borderColor: i === 0 ? 'var(--blue-500)' : 'var(--border)'
    }
  }, /*#__PURE__*/React.createElement(Thumb, {
    format: it.format,
    w: 44,
    h: 58
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: '700 14px/1.3 var(--font-display)',
      letterSpacing: '-0.2px',
      color: 'var(--ink)'
    }
  }, it.title), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 4,
      display: 'flex',
      gap: 6,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(FormatChip, {
    format: it.format,
    size: "sm"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      font: '600 12px var(--font-ui)',
      color: 'var(--slate-400)'
    }
  }, it.handle ? `@${it.handle}` : it.creator, " \xB7 ", it.views))), i === 0 ? /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 18,
    color: "var(--blue-600)"
  }) : null)))));
}
Object.assign(window, {
  FillSheet,
  ShotPickerSheet,
  MoveSheet,
  LibraryPickerSheet
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin-app/EditorSheets.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin-app/LibraryScreen.jsx
try { (() => {
/* Library — one tab, one list, four source chips. Quick capture is pinned to
   the top: type, enter, saved. No sheet, no form, no category picker. */

function LibraryScreen({
  state = 'default',
  chip: chip0 = 0,
  capture = ''
}) {
  const {
    Icon,
    EmptyState,
    Button
  } = window.NoniDesignSystem_710e43;
  const L = window.NONI_ADMIN.library;
  const [chip, setChip] = React.useState(chip0);
  const [text, setText] = React.useState(capture);
  const loading = state === 'loading';
  const empty = state === 'empty';
  const chips = ['Ideas', 'Our posts', 'References', 'From creator'];
  const multiline = text.includes('\n');
  return /*#__PURE__*/React.createElement(AdminScreen, null, /*#__PURE__*/React.createElement(AdminHeader, {
    title: "Library",
    subtitle: "Everything worth stealing from, in one list."
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 9,
      padding: '12px 13px',
      borderRadius: 'var(--radius-md)',
      background: 'var(--white)',
      border: `1.5px solid ${text ? 'var(--blue-500)' : 'var(--border-strong)'}`,
      boxShadow: text ? '0 0 0 3px rgba(27,166,238,0.30)' : 'none'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "plus",
    size: 17,
    color: text ? 'var(--blue-600)' : 'var(--slate-400)',
    style: {
      flex: '0 0 auto',
      marginTop: 2
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0,
      whiteSpace: 'pre-line',
      font: '400 15px/1.45 var(--font-ui)',
      color: text ? 'var(--ink)' : 'var(--slate-300)'
    }
  }, text || 'Idea or link. Paste lines for many at once.'), text ? /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    variant: "primary"
  }, "Save") : null), multiline ? /*#__PURE__*/React.createElement("span", {
    style: {
      font: '600 12px var(--font-ui)',
      color: 'var(--blue-700)',
      padding: '0 2px'
    }
  }, text.split('\n').filter(Boolean).length, " ideas will be saved") : null), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 7,
      overflowX: 'auto',
      paddingBottom: 2
    }
  }, chips.map((c, i) => /*#__PURE__*/React.createElement("button", {
    key: c,
    type: "button",
    onClick: () => setChip(i),
    "aria-pressed": chip === i,
    style: {
      flex: '0 0 auto',
      padding: '9px 14px',
      borderRadius: 999,
      border: 'none',
      cursor: 'pointer',
      background: chip === i ? 'var(--blue-500)' : 'var(--white)',
      boxShadow: chip === i ? 'none' : 'var(--shadow-card)',
      color: chip === i ? 'var(--white)' : 'var(--slate-500)',
      font: '700 13px var(--font-ui)',
      transition: 'background var(--dur-fast) var(--ease-out)'
    }
  }, c))), chip === 1 && !loading ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 9
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 9,
      padding: '11px 13px',
      borderRadius: 999,
      background: 'var(--white)',
      border: '1px solid var(--border)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "search",
    size: 16,
    color: "var(--slate-400)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      font: '400 14px var(--font-ui)',
      color: 'var(--slate-300)'
    }
  }, "Search topic")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      overflowX: 'auto'
    }
  }, ['Top · 60 days', 'All creators', 'All types'].map((f, i) => /*#__PURE__*/React.createElement("span", {
    key: f,
    style: {
      flex: '0 0 auto',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      padding: '7px 11px',
      borderRadius: 999,
      background: i === 0 ? 'var(--blue-100)' : 'var(--fill-quiet)',
      color: i === 0 ? 'var(--blue-700)' : 'var(--slate-500)',
      font: '700 12px var(--font-ui)'
    }
  }, f, /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-down",
    size: 12
  }))))) : null, loading ? /*#__PURE__*/React.createElement(SkeletonRows, {
    n: 4,
    height: 76
  }) : null, !loading && empty ? /*#__PURE__*/React.createElement(EmptyState, {
    icon: "images",
    title: chip === 0 ? 'No ideas saved yet' : chip === 1 ? 'No posts yet' : chip === 2 ? 'No references yet' : 'Nothing from creators yet',
    body: chip === 0 ? 'Type one above and hit enter. Paste a whole doc and every line becomes an idea.' : chip === 1 ? 'Posts land here the day they go live, sorted by performance.' : chip === 2 ? 'Paste a TikTok or Instagram link and it saves with a thumbnail.' : 'Creators can send ideas from their app. They show up here first.',
    style: {
      marginTop: 32
    }
  }) : null, !loading && !empty ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, chip === 0 ? L.ideas.map(it => /*#__PURE__*/React.createElement(Card, {
    key: it.id,
    pad: 13,
    style: {
      display: 'flex',
      gap: 11,
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "zap",
    size: 15,
    color: "var(--blue-600)",
    style: {
      flex: '0 0 auto',
      marginTop: 2
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      font: '400 14px/1.45 var(--font-ui)',
      color: 'var(--ink)'
    }
  }, it.body), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 5,
      font: '600 12px var(--font-ui)',
      color: 'var(--slate-400)'
    }
  }, it.age)))) : null, chip === 1 ? L.ours.map(it => /*#__PURE__*/React.createElement(Card, {
    key: it.id,
    pad: 12,
    style: {
      display: 'flex',
      gap: 11,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(Thumb, {
    format: it.format,
    w: 44,
    h: 58
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: '700 14px/1.3 var(--font-display)',
      letterSpacing: '-0.2px',
      color: 'var(--ink)'
    }
  }, it.title), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 5,
      display: 'flex',
      gap: 6,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(FormatChip, {
    format: it.format,
    size: "sm"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      font: '600 12px var(--font-ui)',
      color: 'var(--slate-400)'
    }
  }, it.creator, " \xB7 ", it.when))), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'right'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: '700 15px var(--font-display)',
      letterSpacing: '-0.3px',
      color: 'var(--ink)'
    }
  }, it.views), /*#__PURE__*/React.createElement("div", {
    style: {
      font: '600 11px var(--font-ui)',
      color: 'var(--slate-400)'
    }
  }, "views")))) : null, chip === 2 ? L.refs.map(it => /*#__PURE__*/React.createElement(Card, {
    key: it.id,
    pad: 12,
    style: {
      display: 'flex',
      gap: 11,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(Thumb, {
    format: it.format,
    w: 44,
    h: 58
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: '700 14px/1.3 var(--font-display)',
      letterSpacing: '-0.2px',
      color: 'var(--ink)'
    }
  }, it.title), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 5,
      display: 'flex',
      gap: 6,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(FormatChip, {
    format: it.format,
    size: "sm"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      font: '600 12px var(--font-ui)',
      color: 'var(--slate-400)'
    }
  }, "@", it.handle, " \xB7 ", it.views))), /*#__PURE__*/React.createElement(Icon, {
    name: "link",
    size: 16,
    color: "var(--slate-300)"
  }))) : null, chip === 3 ? L.fromCreator.map(it => /*#__PURE__*/React.createElement(Card, {
    key: it.id,
    pad: 13,
    style: {
      display: 'flex',
      gap: 11,
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: it.creator,
    size: 30
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      font: '400 14px/1.45 var(--font-ui)',
      color: 'var(--ink)'
    }
  }, it.body), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 5,
      font: '600 12px var(--font-ui)',
      color: 'var(--slate-400)'
    }
  }, it.creator, " \xB7 ", it.age)), /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    variant: "tint"
  }, "Use"))) : null) : null);
}
Object.assign(window, {
  LibraryScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin-app/LibraryScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin-app/PostEditorScreen.jsx
try { (() => {
/* Post editor — seven steps, one decision group per screen. Nothing generates
   when it opens: every AI action is a tap. The post type is locked here; it
   was stamped at week setup and the clip count follows from it. */

const EDITOR_STEPS = ['Title', 'Search phrase', 'Hook', 'CTA', 'Talking points', 'Caption', 'Review'];
function PostEditor({
  step: step0 = 0,
  format = 'video',
  state = 'default',
  sheet: sheet0 = null,
  animateSheet = true,
  onBack,
  onDone
}) {
  const {
    Button,
    Icon
  } = window.NoniDesignSystem_710e43;
  const slide = !window.isReel(format);
  const P = slide ? window.NONI_ADMIN.slidePost : window.NONI_ADMIN.post;
  const [step, setStep] = React.useState(step0);
  const [sheet, setSheet] = React.useState(sheet0);
  const [hook, setHook] = React.useState(state === 'other' ? 'other' : 0);
  const [applied, setApplied] = React.useState({});
  const blank = state === 'empty';
  const saved = state === 'saved';
  const last = step === 6;
  const titles = ['Title', 'Search phrase', 'Hook', 'CTA', 'Talking points', 'Caption and hashtags', 'Review'];
  const intents = ['Optional. It is how the post reads in the grid, not on the platform.', 'The TikTok search this post answers. Everything downstream is written against it.', 'Nine words maximum, written against the finished body. Pick one or write your own.', 'One sentence that plugs FieldVision. It rides inside a talking point, never its own clip.', slide ? `${P.points.length} slides, set by the type. The plug sits inside one of them.` : `${P.points.length} points, set by the type. The plug sits inside one of them.`, 'Both go out together. Instagram needs the tags inside the caption.', 'Scores and suggestions. Nothing is applied unless you apply it.'];
  const footer = /*#__PURE__*/React.createElement(ActionBar, null, step > 0 ? /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    size: "md",
    onClick: () => setStep(step - 1),
    style: {
      flex: '0 0 30%'
    }
  }, "Back") : null, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "md",
    block: true,
    icon: last ? 'check' : null,
    onClick: () => last ? onDone && onDone() : setStep(step + 1),
    style: {
      flex: 1
    }
  }, last ? 'Save post' : 'Next'));
  return /*#__PURE__*/React.createElement(AdminScreen, {
    bottom: 132,
    pad: false,
    footer: footer
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minHeight: 0,
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      padding: '0 0 132px'
    }
  }, /*#__PURE__*/React.createElement(PushHeader, {
    title: `Post ${String(P.n).padStart(2, '0')}`,
    meta: `${P.typeLabel} · Week 14`,
    onBack: step === 0 ? onBack : () => setStep(step - 1),
    right: /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: onBack,
      style: {
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        padding: '8px 2px',
        font: '700 13px var(--font-ui)',
        color: 'var(--blue-600)',
        whiteSpace: 'nowrap'
      }
    }, "Save progress")
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: `0 ${window.GUT}px`,
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(StepDots, {
    step: step,
    total: 7,
    label: `Step ${step + 1} of 7 · ${EDITOR_STEPS[step]}`
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      font: '700 28px var(--font-display)',
      letterSpacing: 'var(--tracking-title)',
      color: 'var(--ink)'
    }
  }, titles[step]), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '8px 0 0',
      font: '400 15px/1.5 var(--font-ui)',
      color: 'var(--slate-500)'
    }
  }, intents[step])), saved ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 9,
      padding: '12px 14px',
      borderRadius: 'var(--radius-md)',
      background: 'var(--green-soft)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 16,
    color: "var(--green)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      font: '700 13px var(--font-ui)',
      color: 'var(--green)'
    }
  }, "Progress saved. The row stays partial until review.")) : null, step === 0 ? /*#__PURE__*/React.createElement(TitleStep, {
    post: P,
    blank: blank,
    onFill: () => setSheet('fill')
  }) : null, step === 1 ? /*#__PURE__*/React.createElement(PhraseStep, {
    post: P,
    blank: blank
  }) : null, step === 2 ? /*#__PURE__*/React.createElement(HookStep, {
    post: P,
    pick: hook,
    onPick: setHook,
    onLibrary: () => setSheet('library')
  }) : null, step === 3 ? /*#__PURE__*/React.createElement(CtaStep, {
    post: P,
    blank: blank
  }) : null, step === 4 ? /*#__PURE__*/React.createElement(PointsStep, {
    post: P,
    blank: blank,
    onShot: () => setSheet('shot'),
    onMove: () => setSheet('move')
  }) : null, step === 5 ? /*#__PURE__*/React.createElement(CaptionStep, {
    post: P,
    blank: blank
  }) : null, step === 6 ? /*#__PURE__*/React.createElement(ReviewStep, {
    post: P,
    applied: applied,
    onToggle: k => setApplied({
      ...applied,
      [k]: true
    })
  }) : null)), sheet === 'fill' ? /*#__PURE__*/React.createElement(FillSheet, {
    onClose: () => setSheet(null),
    animate: animateSheet
  }) : null, sheet === 'shot' ? /*#__PURE__*/React.createElement(ShotPickerSheet, {
    post: P,
    onClose: () => setSheet(null),
    animate: animateSheet
  }) : null, sheet === 'move' ? /*#__PURE__*/React.createElement(MoveSheet, {
    post: P,
    onClose: () => setSheet(null),
    animate: animateSheet
  }) : null, sheet === 'library' ? /*#__PURE__*/React.createElement(LibraryPickerSheet, {
    onClose: () => setSheet(null),
    animate: animateSheet
  }) : null);
}

/* Seven dots. The current one stretches — position is readable without
   counting. */
function StepDots({
  step,
  total,
  label
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 9
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 5,
      alignItems: 'center'
    }
  }, Array.from({
    length: total
  }).map((_, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      height: 6,
      flex: i === step ? '0 0 26px' : '0 0 6px',
      borderRadius: 999,
      background: i === step ? 'var(--blue-500)' : i < step ? 'var(--blue-300)' : 'var(--line-strong)',
      transition: 'flex var(--dur-base) var(--ease-out), background var(--dur-fast) var(--ease-out)'
    }
  }))), /*#__PURE__*/React.createElement("span", {
    style: {
      font: '700 12px var(--font-ui)',
      color: 'var(--slate-400)'
    }
  }, label));
}
function TitleStep({
  post,
  blank,
  onFill
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(EditorField, {
    label: "Title",
    meta: "Optional",
    action: /*#__PURE__*/React.createElement(AiAction, {
      onClick: onFill
    })
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      font: '700 20px/1.3 var(--font-display)',
      letterSpacing: '-0.4px',
      color: blank ? 'var(--slate-300)' : 'var(--ink)'
    }
  }, blank ? 'Untitled post' : post.title)), /*#__PURE__*/React.createElement(StepNote, null, "Skip it and the grid shows the hook instead. Fill with AI writes the whole post in order, from the claim down."));
}
function PhraseStep({
  post,
  blank
}) {
  const {
    Icon
  } = window.NoniDesignSystem_710e43;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(EditorField, {
    label: "Search phrase",
    action: /*#__PURE__*/React.createElement(AiAction, {
      label: "Regenerate",
      icon: "rotate-ccw"
    })
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 9,
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "search",
    size: 16,
    color: "var(--slate-400)",
    style: {
      flex: '0 0 auto',
      marginTop: 3
    }
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      font: '600 17px/1.35 var(--font-ui)',
      color: blank ? 'var(--slate-300)' : 'var(--ink)'
    }
  }, blank ? 'why am I not getting recruited for college soccer' : post.phrase))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: '700 12px var(--font-ui)',
      letterSpacing: 'var(--tracking-label)',
      textTransform: 'uppercase',
      color: 'var(--slate-500)',
      padding: '0 2px'
    }
  }, "Also searched"), post.phraseAlts.map(p => /*#__PURE__*/React.createElement("button", {
    key: p,
    type: "button",
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 9,
      padding: '12px 13px',
      borderRadius: 'var(--radius-md)',
      border: 'none',
      background: 'var(--white)',
      boxShadow: 'var(--shadow-card)',
      cursor: 'pointer',
      textAlign: 'left'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "search",
    size: 14,
    color: "var(--slate-300)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      font: '400 14px var(--font-ui)',
      color: 'var(--slate-500)'
    }
  }, p), /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-right",
    size: 15,
    color: "var(--slate-300)"
  })))), /*#__PURE__*/React.createElement(StepNote, null, "The phrase decides the talking points, the caption and the hook. Change it here rather than downstream."));
}

/* Eight to ten options, best first, plus Other. Same order the creator app
   receives. */
function HookStep({
  post,
  pick,
  onPick,
  onLibrary
}) {
  const {
    Icon
  } = window.NoniDesignSystem_710e43;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      font: '700 12px var(--font-ui)',
      letterSpacing: 'var(--tracking-label)',
      textTransform: 'uppercase',
      color: 'var(--slate-500)'
    }
  }, post.hookOptions.length, " options"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onLibrary,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '7px 12px',
      borderRadius: 999,
      border: 'none',
      cursor: 'pointer',
      background: 'var(--white)',
      boxShadow: 'var(--shadow-card)',
      font: '700 12px var(--font-ui)',
      color: 'var(--ink)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "images",
    size: 13,
    color: "var(--slate-500)"
  }), "Library")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, post.hookOptions.map((h, i) => {
    const on = pick === i;
    const words = h.split(' ').length;
    return /*#__PURE__*/React.createElement("button", {
      key: h,
      type: "button",
      onClick: () => onPick(i),
      style: {
        display: 'flex',
        gap: 11,
        alignItems: 'flex-start',
        textAlign: 'left',
        padding: 13,
        borderRadius: 'var(--radius-md)',
        cursor: 'pointer',
        border: `1.5px solid ${on ? 'var(--blue-500)' : 'transparent'}`,
        background: on ? 'var(--blue-50)' : 'var(--white)',
        boxShadow: on ? 'none' : 'var(--shadow-card)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 20,
        height: 20,
        flex: '0 0 auto',
        marginTop: 2,
        borderRadius: 999,
        background: on ? 'var(--blue-500)' : 'var(--white)',
        border: on ? 'none' : '1.5px solid var(--line-strong)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, on ? /*#__PURE__*/React.createElement(Icon, {
      name: "check",
      size: 12,
      color: "var(--white)"
    }) : null), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'block',
        font: '600 15px/1.35 var(--font-ui)',
        color: 'var(--ink)'
      }
    }, h), /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'block',
        marginTop: 5,
        font: '700 11px var(--font-ui)',
        color: words > 9 ? 'var(--danger)' : 'var(--slate-400)'
      }
    }, words, " words", i === 0 ? ' · best scored' : '')));
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 13,
      borderRadius: 'var(--radius-md)',
      border: `1.5px solid ${pick === 'other' ? 'var(--blue-500)' : 'transparent'}`,
      background: pick === 'other' ? 'var(--blue-50)' : 'var(--white)',
      boxShadow: pick === 'other' ? 'none' : 'var(--shadow-card)'
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => onPick('other'),
    style: {
      display: 'flex',
      gap: 11,
      alignItems: 'center',
      width: '100%',
      padding: 0,
      border: 'none',
      background: 'transparent',
      cursor: 'pointer',
      textAlign: 'left'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 20,
      height: 20,
      flex: '0 0 auto',
      borderRadius: 999,
      background: pick === 'other' ? 'var(--blue-500)' : 'var(--white)',
      border: pick === 'other' ? 'none' : '1.5px solid var(--line-strong)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, pick === 'other' ? /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 12,
    color: "var(--white)"
  }) : null), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      font: '600 15px var(--font-ui)',
      color: 'var(--ink)'
    }
  }, "Other"), /*#__PURE__*/React.createElement("span", {
    style: {
      font: '600 12px var(--font-ui)',
      color: 'var(--slate-400)'
    }
  }, "Write your own")), pick === 'other' ? /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 11,
      padding: 12,
      borderRadius: 'var(--radius-sm)',
      background: 'var(--white)',
      border: '1.5px solid var(--blue-500)',
      boxShadow: '0 0 0 3px rgba(27,166,238,0.30)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: '600 15px/1.35 var(--font-ui)',
      color: 'var(--ink)'
    }
  }, "Nobody fades at 70. They stop being served."), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      marginTop: 6,
      font: '700 11px var(--font-ui)',
      color: 'var(--slate-400)'
    }
  }, "8 of 9 words")) : null)));
}
function CtaStep({
  post,
  blank
}) {
  const {
    Icon
  } = window.NoniDesignSystem_710e43;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(EditorField, {
    label: "Plug sentence",
    action: /*#__PURE__*/React.createElement(AiAction, {
      label: "Rewrite"
    })
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      font: '400 16px/1.5 var(--font-ui)',
      color: blank ? 'var(--slate-300)' : 'var(--ink)'
    }
  }, blank ? 'One sentence, traceable to an approved claim' : post.cta), blank ? null : /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      marginTop: 12,
      padding: '6px 11px',
      borderRadius: 999,
      background: 'var(--blue-100)',
      font: '700 11px var(--font-ui)',
      color: 'var(--blue-700)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "circle-check-big",
    size: 12
  }), "Traces to: ", post.claim)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 9,
      alignItems: 'flex-start',
      padding: '13px 14px',
      borderRadius: 'var(--radius-md)',
      background: 'var(--blue-50)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "zap",
    size: 15,
    color: "var(--blue-600)",
    style: {
      flex: '0 0 auto',
      marginTop: 2
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      font: '600 13px/1.45 var(--font-ui)',
      color: 'var(--ink)'
    }
  }, "On the next step this sentence lands inside one talking point. It never gets its own card or clip.")), /*#__PURE__*/React.createElement(StepNote, null, "Every post plugs FieldVision once. Claims come from Features, so a plug the product cannot back is rejected here."));
}
Object.assign(window, {
  PostEditor,
  StepDots,
  TitleStep,
  PhraseStep,
  HookStep,
  CtaStep,
  EDITOR_STEPS
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin-app/PostEditorScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin-app/PostEditorSteps.jsx
try { (() => {
/* Post editor, steps 5 to 7, plus the shared field vocabulary the earlier
   steps use. One field group per screen: nothing here scrolls past two
   decisions. */

/* A written value looks like a written value. Placeholder grey means the AI
   has not been asked yet — nothing generates on open. */
function EditorField({
  label,
  meta,
  action,
  children,
  style
}) {
  return /*#__PURE__*/React.createElement(Card, {
    pad: 15,
    style: style
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: 11
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: '700 12px var(--font-ui)',
      letterSpacing: 'var(--tracking-label)',
      textTransform: 'uppercase',
      color: 'var(--slate-500)'
    }
  }, label), meta ? /*#__PURE__*/React.createElement("span", {
    style: {
      font: '600 11px var(--font-ui)',
      color: 'var(--slate-300)',
      whiteSpace: 'nowrap'
    }
  }, meta) : null, /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }), action), children);
}
function AiAction({
  label = 'Fill with AI',
  icon = 'sparkles',
  onClick
}) {
  const {
    Icon
  } = window.NoniDesignSystem_710e43;
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClick,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '7px 12px',
      borderRadius: 999,
      border: 'none',
      cursor: 'pointer',
      background: 'var(--blue-100)',
      color: 'var(--blue-700)',
      font: '700 12px var(--font-ui)',
      whiteSpace: 'nowrap'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 13,
    color: "var(--blue-700)"
  }), label);
}
function StepNote({
  children
}) {
  return /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '0 2px',
      font: '400 13px/1.5 var(--font-ui)',
      color: 'var(--slate-400)'
    }
  }, children);
}
function DerivedNote({
  children
}) {
  const {
    Icon
  } = window.NoniDesignSystem_710e43;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 9,
      padding: '11px 13px',
      borderRadius: 'var(--radius-md)',
      background: 'var(--blue-50)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "layout-list",
    size: 16,
    color: "var(--blue-600)",
    style: {
      flex: '0 0 auto'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      font: '600 13px/1.4 var(--font-ui)',
      color: 'var(--ink)'
    }
  }, children));
}

/* Step 5 — talking points. N cards, count derived from the type. The plug
   card is starred; it is never its own clip. */
function PointsStep({
  post,
  blank,
  onShot,
  onMove
}) {
  const {
    Icon
  } = window.NoniDesignSystem_710e43;
  const slide = !window.isReel(post.format);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(DerivedNote, null, post.derived), post.points.map(pt => /*#__PURE__*/React.createElement(Card, {
    key: pt.n,
    pad: 14,
    style: {
      borderColor: pt.plug ? 'var(--blue-300)' : 'var(--border)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: 9
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 24,
      height: 24,
      flex: '0 0 auto',
      borderRadius: 999,
      background: pt.plug ? 'var(--blue-500)' : 'var(--fill-quiet)',
      color: pt.plug ? 'var(--white)' : 'var(--slate-500)',
      font: '700 12px var(--font-display)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, pt.n), pt.plug ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      font: '700 11px var(--font-ui)',
      letterSpacing: '0.3px',
      textTransform: 'uppercase',
      color: 'var(--blue-700)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "zap",
    size: 12,
    color: "var(--blue-600)"
  }), "Plug rides here") : /*#__PURE__*/React.createElement("span", {
    style: {
      font: '700 11px var(--font-ui)',
      letterSpacing: '0.3px',
      textTransform: 'uppercase',
      color: 'var(--slate-400)'
    }
  }, "Point ", pt.n), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": "Rewrite this point",
    style: {
      width: 26,
      height: 26,
      borderRadius: 999,
      border: 'none',
      cursor: 'pointer',
      background: 'var(--blue-100)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "sparkles",
    size: 13,
    color: "var(--blue-700)"
  }))), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      font: '400 15px/1.45 var(--font-ui)',
      color: blank ? 'var(--slate-300)' : 'var(--ink)'
    }
  }, blank ? 'Nothing written yet' : pt.text), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginTop: 12
    }
  }, pt.shot && !blank ? /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onShot,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 9,
      flex: 1,
      minWidth: 0,
      padding: 0,
      border: 'none',
      background: 'transparent',
      cursor: 'pointer',
      textAlign: 'left'
    }
  }, /*#__PURE__*/React.createElement(Thumb, {
    format: post.format,
    w: 30,
    h: 40
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      minWidth: 0,
      font: '600 12px var(--font-ui)',
      color: 'var(--slate-500)',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, pt.shot)) : /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onShot,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 7,
      flex: 1,
      minWidth: 0,
      padding: '9px 11px',
      borderRadius: 'var(--radius-sm)',
      border: '1.5px dashed var(--line-strong)',
      background: 'transparent',
      cursor: 'pointer',
      font: '700 12px var(--font-ui)',
      color: 'var(--slate-500)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "images",
    size: 14,
    color: "var(--slate-400)"
  }), "Add screenshot"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onMove,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      flex: '0 0 auto',
      padding: '9px 11px',
      borderRadius: 999,
      border: 'none',
      background: 'var(--fill-quiet)',
      cursor: 'pointer',
      font: '700 12px var(--font-ui)',
      color: 'var(--ink)'
    }
  }, blank ? slide ? 'Slide' : 'Clip' : pt.move, /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-down",
    size: 13,
    color: "var(--slate-400)"
  }))))), /*#__PURE__*/React.createElement(StepNote, null, "The screenshot pops up on the ", slide ? 'slide' : 'clip', " you choose. Move it if the point lands somewhere else on camera."));
}

/* Step 6 — caption and hashtags on one screen, because Instagram needs the
   tags inside the caption and the admin should see the merged result. */
function CaptionStep({
  post,
  blank
}) {
  const {
    Icon
  } = window.NoniDesignSystem_710e43;
  const merged = `${post.caption} ${post.hashtags.join(' ')}`;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(EditorField, {
    label: "Caption",
    meta: blank ? null : `${post.caption.length} of 200`,
    action: /*#__PURE__*/React.createElement(AiAction, null)
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      font: '400 15px/1.5 var(--font-ui)',
      color: blank ? 'var(--slate-300)' : 'var(--ink)'
    }
  }, blank ? 'Search phrase goes in the first sentence' : post.caption)), /*#__PURE__*/React.createElement(EditorField, {
    label: "Hashtags",
    meta: blank ? '3 to 5' : `${post.hashtags.length} of 5`,
    action: /*#__PURE__*/React.createElement(AiAction, {
      label: "Suggest"
    })
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 7,
      flexWrap: 'wrap'
    }
  }, (blank ? [] : post.hashtags).map(h => /*#__PURE__*/React.createElement("span", {
    key: h,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '7px 11px',
      borderRadius: 999,
      background: 'var(--blue-100)',
      font: '700 13px var(--font-ui)',
      color: 'var(--blue-700)'
    }
  }, h, /*#__PURE__*/React.createElement(Icon, {
    name: "x",
    size: 12,
    color: "var(--blue-600)"
  }))), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '7px 11px',
      borderRadius: 999,
      border: '1.5px dashed var(--line-strong)',
      font: '700 13px var(--font-ui)',
      color: 'var(--slate-400)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "plus",
    size: 13,
    color: "var(--slate-400)"
  }), "Add"))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 15,
      borderRadius: 'var(--radius-lg)',
      background: 'var(--white)',
      border: '1px solid var(--border)',
      boxShadow: 'var(--shadow-card)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: '700 12px var(--font-ui)',
      letterSpacing: 'var(--tracking-label)',
      textTransform: 'uppercase',
      color: 'var(--slate-500)'
    }
  }, "Merged preview"), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      font: '600 11px var(--font-ui)',
      color: 'var(--slate-400)'
    }
  }, "Instagram and TikTok")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 13,
      borderRadius: 'var(--radius-md)',
      background: 'var(--off-white)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: "FieldVision",
    size: 24
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      font: '700 13px var(--font-ui)',
      color: 'var(--ink)'
    }
  }, "fieldvision.ai")), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      font: '400 14px/1.5 var(--font-ui)',
      color: blank ? 'var(--slate-300)' : 'var(--ink)'
    }
  }, blank ? 'Caption and tags appear here together' : merged)), /*#__PURE__*/React.createElement(StepNote, null, "Instagram reads hashtags inside the caption, so both platforms post the same string.")));
}

/* Step 7 — AI review. A step the admin takes, never a gate. It never blocks
   and never silently edits: every suggestion needs a tap. */
function ReviewStep({
  post,
  applied,
  onToggle
}) {
  const {
    Icon,
    Button
  } = window.NoniDesignSystem_710e43;
  const R = post.review;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      padding: 16,
      borderRadius: 'var(--radius-lg)',
      background: 'var(--white)',
      border: '1px solid var(--border)',
      boxShadow: 'var(--shadow-card)'
    }
  }, /*#__PURE__*/React.createElement(ScoreDial, {
    value: R.overall,
    label: "overall"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: '700 17px var(--font-display)',
      letterSpacing: '-0.3px',
      color: 'var(--ink)'
    }
  }, R.overall >= 80 ? 'Reads spoken' : 'Reads mostly spoken'), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '5px 0 0',
      font: '400 13px/1.45 var(--font-ui)',
      color: 'var(--slate-500)'
    }
  }, R.overall >= 80 ? 'One suggestion left. Save whenever you are ready.' : 'Two lines still read as written copy. Fix them or save as is.'))), R.sections.map(s => /*#__PURE__*/React.createElement(Card, {
    key: s.key,
    pad: 14
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 9
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      font: '700 15px var(--font-display)',
      letterSpacing: '-0.2px',
      color: 'var(--ink)'
    }
  }, s.key), /*#__PURE__*/React.createElement(ScoreBar, {
    value: s.score
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 24,
      textAlign: 'right',
      font: '700 13px var(--font-ui)',
      color: s.score >= 80 ? 'var(--green)' : s.score >= 65 ? 'var(--amber)' : 'var(--danger)'
    }
  }, s.score)), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '8px 0 0',
      font: '400 13px/1.45 var(--font-ui)',
      color: 'var(--slate-500)'
    }
  }, s.note), s.fix ? /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 11,
      padding: 12,
      borderRadius: 'var(--radius-sm)',
      background: applied[s.key] ? 'var(--green-soft)' : 'var(--blue-50)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: applied[s.key] ? 'check' : 'sparkles',
    size: 13,
    color: applied[s.key] ? 'var(--green)' : 'var(--blue-600)',
    style: {
      flex: '0 0 auto',
      marginTop: 2
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      font: '600 13px/1.4 var(--font-ui)',
      color: 'var(--ink)'
    }
  }, applied[s.key] ? 'Applied. The section will rescore on save.' : s.fix)), applied[s.key] ? null : /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10,
      display: 'flex',
      gap: 7
    }
  }, /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    variant: "tint",
    onClick: () => onToggle && onToggle(s.key)
  }, "Apply"), /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    variant: "ghost"
  }, "Ignore"))) : null)), /*#__PURE__*/React.createElement(Card, {
    pad: 14
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: '700 12px var(--font-ui)',
      letterSpacing: 'var(--tracking-label)',
      textTransform: 'uppercase',
      color: 'var(--slate-500)'
    }
  }, "Checks"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10,
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, R.checks.map(c => /*#__PURE__*/React.createElement("div", {
    key: c.label,
    style: {
      display: 'flex',
      gap: 9,
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: c.pass ? 'check' : 'circle-alert',
    size: 14,
    color: c.pass ? 'var(--green)' : 'var(--amber)',
    style: {
      flex: '0 0 auto',
      marginTop: 2
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      font: '600 13px/1.4 var(--font-ui)',
      color: c.pass ? 'var(--slate-500)' : 'var(--ink)'
    }
  }, c.label, c.quote ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      marginTop: 3,
      font: '400 13px/1.4 var(--font-ui)',
      color: 'var(--slate-500)'
    }
  }, c.quote) : null))))), /*#__PURE__*/React.createElement(StepNote, null, "Review never blocks. Save the post at any score and the override is logged with the check that fired."));
}
Object.assign(window, {
  EditorField,
  AiAction,
  StepNote,
  DerivedNote,
  PointsStep,
  CaptionStep,
  ReviewStep
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin-app/PostEditorSteps.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin-app/ReviewDetailScreen.jsx
try { (() => {
/* Review detail. The default view is the post the way it will appear on the
   platform: one 9:16 frame at true dimensions, handle and caption over it,
   two actions. Nothing about the render manifest is on this screen — the
   question here is only "does this go out or come back".

   Request changes flips into suggestion mode: the spoken sections and the
   caption as cards, each one openable with a note. Notes ride back to the
   creator attached to the post card they re-record from. */

function ReviewDetail({
  item,
  creator,
  state = 'default',
  mode: mode0 = 'view',
  animateSheet = true,
  onBack,
  onChat,
  onApproved
}) {
  const {
    Button,
    Icon
  } = window.NoniDesignSystem_710e43;
  const A = window.NONI_ADMIN;
  const [mode, setMode] = React.useState(state === 'changes' ? 'changes' : mode0);
  const [done, setDone] = React.useState(state === 'approved');
  const [slide, setSlide] = React.useState(0);
  const reel = window.isReel(item.format);
  const caption = reel ? 'Why my winger fades after 70 minutes: he runs the wrong runs, not too few. Full breakdown below.' : 'Three numbers decide most Sunday matches. Save this before the weekend. Comment D1 for the template.';
  const tags = reel ? '#collegesoccer #soccerrecruiting #matchfilm' : '#collegesoccer #matchfilm #u17';
  if (mode === 'changes') {
    return /*#__PURE__*/React.createElement(RevisionMode, {
      item: item,
      creator: creator,
      state: state,
      onBack: () => setMode('view')
    });
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minHeight: 0,
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--ink-900)',
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      width: '100%',
      aspectRatio: '9 / 16',
      flex: '0 0 auto',
      overflow: 'hidden',
      background: reel ? 'linear-gradient(170deg,#1B242E 0%,#0B0F14 100%)' : 'linear-gradient(160deg,#E7F4FD 0%,#C9DCEB 100%)'
    }
  }, reel ? /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "play",
    size: 46,
    color: "rgba(255,255,255,0.26)"
  })) : /*#__PURE__*/React.createElement(SlideFrame, {
    slides: A.slides,
    index: slide,
    onIndex: setSlide
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      padding: '10px 16px 34px',
      background: 'linear-gradient(180deg,rgba(11,15,20,0.55) 0%,rgba(11,15,20,0) 100%)',
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onBack,
    "aria-label": "Back",
    style: {
      width: 36,
      height: 36,
      borderRadius: 999,
      border: 'none',
      cursor: 'pointer',
      background: 'rgba(255,255,255,0.18)',
      backdropFilter: 'blur(18px)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-left",
    size: 20,
    color: "var(--white)"
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }), item.attempt > 1 ? /*#__PURE__*/React.createElement("span", {
    style: {
      padding: '6px 11px',
      borderRadius: 999,
      background: 'rgba(224,138,22,0.92)',
      color: 'var(--white)',
      font: '700 12px var(--font-ui)'
    }
  }, "Take ", item.attempt) : null, /*#__PURE__*/React.createElement("span", {
    style: {
      padding: '6px 11px',
      borderRadius: 999,
      background: 'rgba(255,255,255,0.18)',
      backdropFilter: 'blur(18px)',
      color: 'var(--white)',
      font: '700 12px var(--font-ui)'
    }
  }, "1 of 5"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onChat,
    "aria-label": `Message ${creator.short}`,
    style: {
      width: 36,
      height: 36,
      borderRadius: 999,
      border: 'none',
      cursor: 'pointer',
      background: 'rgba(255,255,255,0.18)',
      backdropFilter: 'blur(18px)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "message-circle",
    size: 18,
    color: "var(--white)"
  }))), reel ? /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 16,
      right: 16,
      bottom: 148,
      display: 'flex',
      flexDirection: 'column',
      gap: 7
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 3,
      borderRadius: 999,
      background: 'rgba(255,255,255,0.3)',
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: '34%',
      borderRadius: 999,
      background: 'var(--white)'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      left: '34%',
      top: -4,
      width: 11,
      height: 11,
      borderRadius: 999,
      background: 'var(--white)',
      transform: 'translateX(-50%)'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      font: '700 11px var(--font-ui)',
      color: 'rgba(255,255,255,0.65)'
    }
  }, /*#__PURE__*/React.createElement("span", null, "0:13"), /*#__PURE__*/React.createElement("span", null, item.duration))) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      padding: '52px 16px 16px',
      background: 'linear-gradient(180deg,rgba(11,15,20,0) 0%,rgba(11,15,20,0.72) 55%,rgba(11,15,20,0.86) 100%)',
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 9
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: creator.name,
    size: 30
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: '700 14px var(--font-ui)',
      color: 'var(--white)'
    }
  }, "@", creator.tiktok), /*#__PURE__*/React.createElement("div", {
    style: {
      font: '600 11px var(--font-ui)',
      color: 'rgba(255,255,255,0.62)'
    }
  }, item.typeLabel, " \xB7 ", item.age)), /*#__PURE__*/React.createElement(FormatChip, {
    format: item.format,
    size: "sm",
    onDark: true
  })), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      font: '400 14px/1.42 var(--font-ui)',
      color: 'var(--white)'
    }
  }, caption), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      font: '600 13px var(--font-ui)',
      color: 'rgba(255,255,255,0.72)'
    }
  }, tags))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minHeight: 0,
      background: 'var(--white)',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '0 16px'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "outline",
    size: "md",
    onClick: () => setMode('changes'),
    style: {
      flex: '0 0 46%',
      whiteSpace: 'nowrap'
    }
  }, "Request changes"), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "md",
    icon: "check",
    block: true,
    onClick: () => {
      setDone(true);
      onApproved && onApproved();
    },
    style: {
      flex: 1
    }
  }, "Approve")), done ? /*#__PURE__*/React.createElement(ApprovedOverlay, {
    item: item,
    creator: creator,
    onBack: onBack
  }) : null);
}

/* Slideshow frame — real slides in the same 9:16 box, swipe dots at the top
   so they clear the caption. */
function SlideFrame({
  slides,
  index,
  onIndex
}) {
  const {
    Icon
  } = window.NoniDesignSystem_710e43;
  const s = slides[index];
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '96px 44px 190px'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      textAlign: 'center',
      font: '800 25px/1.26 var(--font-display)',
      letterSpacing: '-0.5px',
      color: 'var(--ink)'
    }
  }, s.overlay)), s.shot ? /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: 58,
      right: 16,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      padding: '5px 10px',
      borderRadius: 999,
      background: 'rgba(11,15,20,0.5)',
      color: 'var(--white)',
      font: '700 11px var(--font-ui)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "images",
    size: 11
  }), "Screenshot") : null, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 62,
      left: 0,
      right: 0,
      display: 'flex',
      gap: 5,
      justifyContent: 'center'
    }
  }, slides.map((_, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    onClick: () => onIndex(i),
    style: {
      width: i === index ? 18 : 6,
      height: 6,
      borderRadius: 999,
      cursor: 'pointer',
      background: i === index ? 'var(--ink)' : 'rgba(15,23,32,0.24)',
      transition: 'width var(--dur-fast) var(--ease-out)'
    }
  }))), index > 0 ? /*#__PURE__*/React.createElement(PagerArrow, {
    dir: "left",
    onClick: () => onIndex(index - 1)
  }) : null, index < slides.length - 1 ? /*#__PURE__*/React.createElement(PagerArrow, {
    dir: "right",
    onClick: () => onIndex(index + 1)
  }) : null);
}
function PagerArrow({
  dir,
  onClick
}) {
  const {
    Icon
  } = window.NoniDesignSystem_710e43;
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClick,
    "aria-label": dir === 'left' ? 'Previous slide' : 'Next slide',
    style: {
      position: 'absolute',
      top: '46%',
      [dir]: 10,
      transform: 'translateY(-50%)',
      width: 34,
      height: 34,
      borderRadius: 999,
      border: 'none',
      cursor: 'pointer',
      background: 'var(--glass)',
      backdropFilter: 'blur(18px)',
      boxShadow: 'var(--shadow-card)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: dir === 'left' ? 'chevron-left' : 'chevron-right',
    size: 18,
    color: "var(--ink)"
  }));
}

/* Suggestion mode. One card per spoken section plus the caption. Tap a card,
   a note box opens under it; save and the note sticks to that section. Or
   switch to one note for the whole post. Only the sections with notes go
   back — everything else stays approved. */
function RevisionMode({
  item,
  creator,
  state = 'default',
  onBack
}) {
  const {
    Button,
    Icon
  } = window.NoniDesignSystem_710e43;
  const A = window.NONI_ADMIN;
  const reel = window.isReel(item.format);
  const sections = reel ? A.segments.map(s => ({
    key: s.slot,
    label: s.slot,
    text: s.text
  })) : A.slides.map(s => ({
    key: `Slide ${s.n}`,
    label: `Slide ${s.n}`,
    text: s.overlay
  }));
  sections.push({
    key: 'Caption',
    label: 'Caption',
    text: reel ? 'Why my winger fades after 70 minutes: he runs the wrong runs, not too few. Full breakdown below.' : 'Three numbers decide most Sunday matches. Save this before the weekend. Comment D1 for the template.'
  });
  const seeded = state === 'noted' ? {
    'Point 3': 'Audio clips at 0:04. Same setup, just move the phone off the fence rail.'
  } : {};
  const [notes, setNotes] = React.useState(seeded);
  const [open, setOpen] = React.useState(state === 'typing' ? 'Point 3' : null);
  const [draft, setDraft] = React.useState(state === 'typing' ? 'Audio clips at 0:04. Same setup, just move' : '');
  const [whole, setWhole] = React.useState(state === 'whole');
  const [wholeNote, setWholeNote] = React.useState(state === 'whole' ? 'Great energy, wrong room. Shoot the whole thing outside at the pitch — the echo is killing every line.' : '');
  const [sent, setSent] = React.useState(state === 'sent');
  const count = whole ? wholeNote ? 1 : 0 : Object.keys(notes).length;
  const openCard = key => {
    setOpen(key);
    setDraft(notes[key] || '');
  };
  const save = () => {
    setNotes({
      ...notes,
      [open]: draft.trim()
    });
    setOpen(null);
    setDraft('');
  };
  const clear = key => {
    const n = {
      ...notes
    };
    delete n[key];
    setNotes(n);
  };
  return /*#__PURE__*/React.createElement(AdminScreen, {
    bottom: 100,
    pad: false,
    footer: /*#__PURE__*/React.createElement(ActionBar, null, /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      size: "md",
      onClick: onBack,
      style: {
        flex: '0 0 30%'
      }
    }, "Cancel"), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      size: "md",
      icon: "send",
      block: true,
      disabled: count === 0,
      onClick: () => setSent(true),
      style: {
        flex: 1,
        whiteSpace: 'nowrap'
      }
    }, count === 0 ? 'Send back' : `Send back · ${count} ${count === 1 ? 'note' : 'notes'}`))
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minHeight: 0,
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      padding: '0 0 100px'
    }
  }, /*#__PURE__*/React.createElement(PushHeader, {
    title: `What should ${creator.short} fix?`,
    meta: item.title,
    onBack: onBack
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: `0 ${window.GUT}px`,
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Segmented, {
    items: ['Section by section', 'Whole post'],
    active: whole ? 1 : 0,
    onSelect: i => setWhole(i === 1)
  }), whole ? /*#__PURE__*/React.createElement(Card, {
    pad: 14
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: '700 12px var(--font-ui)',
      letterSpacing: 'var(--tracking-label)',
      textTransform: 'uppercase',
      color: 'var(--slate-500)'
    }
  }, "One note for the whole post"), /*#__PURE__*/React.createElement("textarea", {
    value: wholeNote,
    onChange: e => setWholeNote(e.target.value),
    rows: 5,
    placeholder: `What has to change before ${creator.short} records again`,
    style: {
      marginTop: 10,
      width: '100%',
      boxSizing: 'border-box',
      resize: 'none',
      padding: 13,
      borderRadius: 'var(--radius-md)',
      border: '1.5px solid var(--border-strong)',
      font: '400 15px/1.5 var(--font-ui)',
      color: 'var(--ink)',
      outline: 'none'
    }
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '10px 0 0',
      font: '400 13px/1.45 var(--font-ui)',
      color: 'var(--slate-400)'
    }
  }, "The whole post comes back as one re-record. Use section notes when only part of it is off.")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '0 2px',
      font: '400 13px/1.45 var(--font-ui)',
      color: 'var(--slate-500)'
    }
  }, "Tap a section to leave a note. Only the sections you note come back \u2014 the rest stay approved."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, sections.map(s => {
    const noted = notes[s.key] != null;
    const isOpen = open === s.key;
    return /*#__PURE__*/React.createElement("div", {
      key: s.key,
      style: {
        background: 'var(--white)',
        border: `1px solid ${noted || isOpen ? 'var(--blue-500)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-card)',
        overflow: 'hidden',
        transition: 'border-color var(--dur-fast) var(--ease-out)'
      }
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => isOpen ? setOpen(null) : openCard(s.key),
      style: {
        display: 'block',
        width: '100%',
        textAlign: 'left',
        padding: 13,
        border: 'none',
        background: 'transparent',
        cursor: 'pointer'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        font: '700 12px var(--font-ui)',
        letterSpacing: 'var(--tracking-label)',
        textTransform: 'uppercase',
        color: noted ? 'var(--blue-700)' : 'var(--slate-500)'
      }
    }, s.label), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1
      }
    }), noted ? /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        font: '700 11px var(--font-ui)',
        color: 'var(--blue-700)'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "pencil",
      size: 12
    }), "Note added") : /*#__PURE__*/React.createElement(Icon, {
      name: "plus",
      size: 15,
      color: "var(--slate-300)"
    })), /*#__PURE__*/React.createElement("p", {
      style: {
        margin: '7px 0 0',
        font: '400 14px/1.45 var(--font-ui)',
        color: 'var(--ink)'
      }
    }, s.text)), noted && !isOpen ? /*#__PURE__*/React.createElement("div", {
      style: {
        margin: '0 13px 13px',
        padding: 11,
        borderRadius: 'var(--radius-sm)',
        background: 'var(--blue-50)',
        display: 'flex',
        gap: 8,
        alignItems: 'flex-start'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "message-circle",
      size: 14,
      color: "var(--blue-600)",
      style: {
        flex: '0 0 auto',
        marginTop: 2
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        font: '600 13px/1.4 var(--font-ui)',
        color: 'var(--ink)'
      }
    }, notes[s.key]), /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => clear(s.key),
      "aria-label": "Remove note",
      style: {
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        padding: 0
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "x",
      size: 14,
      color: "var(--slate-400)"
    }))) : null, isOpen ? /*#__PURE__*/React.createElement("div", {
      style: {
        margin: '0 13px 13px',
        padding: 11,
        borderRadius: 'var(--radius-sm)',
        background: 'var(--blue-50)'
      }
    }, /*#__PURE__*/React.createElement("textarea", {
      autoFocus: true,
      value: draft,
      onChange: e => setDraft(e.target.value),
      rows: 3,
      placeholder: "What to change here",
      style: {
        width: '100%',
        boxSizing: 'border-box',
        resize: 'none',
        padding: 11,
        borderRadius: 'var(--radius-sm)',
        border: '1.5px solid var(--blue-300)',
        background: 'var(--white)',
        font: '400 14px/1.45 var(--font-ui)',
        color: 'var(--ink)',
        outline: 'none'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 9,
        display: 'flex',
        gap: 7,
        justifyContent: 'flex-end'
      }
    }, /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      variant: "ghost",
      onClick: () => setOpen(null)
    }, "Cancel"), /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      variant: "primary",
      disabled: !draft.trim(),
      onClick: save
    }, "Save note"))) : null);
  }))))), sent ? /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      zIndex: 80,
      background: 'var(--white)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
      padding: `0 ${window.GUT}px`,
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setSent(false),
    "aria-label": "Back",
    style: {
      position: 'absolute',
      top: 10,
      left: 16,
      width: 36,
      height: 36,
      borderRadius: 999,
      border: 'none',
      cursor: 'pointer',
      background: 'var(--fill-quiet)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-left",
    size: 20,
    color: "var(--ink)"
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 68,
      height: 68,
      borderRadius: 999,
      background: 'var(--blue-100)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "send",
    size: 28,
    color: "var(--blue-600)"
  })), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      font: '700 26px var(--font-display)',
      letterSpacing: 'var(--tracking-title)',
      color: 'var(--ink)'
    }
  }, "Sent back"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      maxWidth: 290,
      font: '400 15px/1.5 var(--font-ui)',
      color: 'var(--slate-500)'
    }
  }, creator.short, " gets this post back with your notes on the sections you marked. Nothing else has to be re-recorded."), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "lg",
    block: true,
    onClick: onBack,
    style: {
      marginTop: 8
    }
  }, "Next in queue")) : null);
}

/* Approve is the last human touch. Say what happens next, then get out. */
function ApprovedOverlay({
  item,
  creator,
  onBack
}) {
  const {
    Icon,
    Button
  } = window.NoniDesignSystem_710e43;
  const reel = window.isReel(item.format);
  const steps = reel ? [['zap', 'Clips stitched and overlays burned in'], ['share-2', 'Posted to TikTok and Instagram at the slot time'], ['trending-up', 'Views and revenue tracked from the first hour']] : [['zap', 'Slides assembled with their overlay text'], ['share-2', 'Posted with auto-add music on TikTok, silent on Instagram'], ['music-2', `${creator.short} adds the song, then it comes back for one tap`]];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      zIndex: 80,
      background: 'var(--white)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: `0 ${window.GUT}px`,
      gap: 22
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onBack,
    "aria-label": "Back",
    style: {
      position: 'absolute',
      top: 10,
      left: 16,
      width: 36,
      height: 36,
      borderRadius: 999,
      border: 'none',
      cursor: 'pointer',
      background: 'var(--fill-quiet)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-left",
    size: 20,
    color: "var(--ink)"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 14,
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 68,
      height: 68,
      borderRadius: 999,
      background: 'var(--green-soft)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 32,
    color: "var(--green)"
  })), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      font: '700 26px var(--font-display)',
      letterSpacing: 'var(--tracking-title)',
      color: 'var(--ink)'
    }
  }, "Approved"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      maxWidth: 280,
      font: '400 15px/1.5 var(--font-ui)',
      color: 'var(--slate-500)'
    }
  }, item.title, " is out of your hands. Noni takes it from here.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, steps.map(([icon, text]) => /*#__PURE__*/React.createElement("div", {
    key: text,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 11,
      padding: '13px 14px',
      borderRadius: 'var(--radius-md)',
      background: 'var(--off-white)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 18,
    color: "var(--blue-600)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      font: '600 14px/1.35 var(--font-ui)',
      color: 'var(--ink)'
    }
  }, text)))), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "lg",
    block: true,
    onClick: onBack
  }, "Next in queue"));
}
Object.assign(window, {
  ReviewDetail,
  SlideFrame,
  PagerArrow,
  RevisionMode,
  ApprovedOverlay
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin-app/ReviewDetailScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin-app/ReviewScreen.jsx
try { (() => {
/* Review — the daily loop. Three queues in one tab: post submissions,
   music approvals (slideshows only), and creator account approval.
   Counts live in the switcher so an empty lane never costs a tap. */

function ReviewScreen({
  state = 'default',
  lane = 0,
  onOpen,
  onOpenMusic,
  onOpenAccount
}) {
  const {
    Button,
    EmptyState,
    Icon
  } = window.NoniDesignSystem_710e43;
  const A = window.NONI_ADMIN;
  const [tab, setTab] = React.useState(lane);
  React.useEffect(() => setTab(lane), [lane]);
  const loading = state === 'loading';
  const empty = state === 'empty';
  const subs = empty ? [] : A.submissions;
  const music = empty ? [] : A.music;
  const accounts = empty ? [] : A.accounts.filter(a => a.state === 'pending');
  const creator = id => A.creators.find(c => c.id === id);
  const total = subs.length + music.length + accounts.length;
  return /*#__PURE__*/React.createElement(AdminScreen, null, /*#__PURE__*/React.createElement(AdminHeader, {
    title: "Review",
    subtitle: loading ? null : total === 0 ? 'Everything is cleared. Creators are recording the rest of the week.' : total === 1 ? "One to clear, then you're done for today." : "Approve and it's live. Editing, posting and tracking are automatic.",
    right: loading ? /*#__PURE__*/React.createElement(SkeletonLine, {
      w: 84,
      h: 30
    }) : /*#__PURE__*/React.createElement(CountPill, {
      tone: total === 0 ? 'clear' : 'brand'
    }, total === 0 ? 'All clear' : `${total} waiting`)
  }), /*#__PURE__*/React.createElement(Segmented, {
    active: tab,
    onSelect: setTab,
    items: [{
      label: 'Posts',
      count: loading ? '' : subs.length
    }, {
      label: 'Music',
      count: loading ? '' : music.length
    }, {
      label: 'Accounts',
      count: loading ? '' : accounts.length
    }],
    style: {
      marginTop: 4
    }
  }), loading ? /*#__PURE__*/React.createElement(SkeletonRows, {
    n: 4,
    height: 96
  }) : null, !loading && tab === 0 ? subs.length ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, subs.map(s => /*#__PURE__*/React.createElement(SubmissionRow, {
    key: s.id,
    item: s,
    creator: creator(s.creator),
    onClick: () => onOpen && onOpen(s)
  })), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '6px 2px 0',
      font: '400 13px/1.45 var(--font-ui)',
      color: 'var(--slate-400)'
    }
  }, "Reject a single clip and only that clip goes back. The rest stay approved.")) : /*#__PURE__*/React.createElement(EmptyState, {
    icon: "inbox",
    title: "Nothing to review",
    body: "Creators are recording this week's posts. New submissions land here, newest first.",
    style: {
      marginTop: 40
    }
  }) : null, !loading && tab === 1 ? music.length ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '2px 2px 0',
      font: '400 13px/1.45 var(--font-ui)',
      color: 'var(--slate-500)'
    }
  }, "Slideshows only. Open the post, check the song is on it, approve. Approval unlocks that post's earnings."), music.map(m => /*#__PURE__*/React.createElement(MusicApprovalRow, {
    key: m.id,
    item: m,
    creator: creator(m.creator),
    onOpen: () => onOpenMusic && onOpenMusic(m)
  }))) : /*#__PURE__*/React.createElement(EmptyState, {
    icon: "music-2",
    title: "No songs waiting",
    body: "Creators tap Music added once the track is on a live slideshow. It lands here.",
    style: {
      marginTop: 40
    }
  }) : null, !loading && tab === 2 ? accounts.length ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '2px 2px 0',
      font: '400 13px/1.45 var(--font-ui)',
      color: 'var(--slate-500)'
    }
  }, "Once per creator. A cold or off-topic feed throttles every post they will ever make."), accounts.map(a => /*#__PURE__*/React.createElement(AccountRow, {
    key: a.id,
    item: a,
    creator: creator(a.creator),
    onClick: () => onOpenAccount && onOpenAccount(a)
  })), /*#__PURE__*/React.createElement(SectionLabel, null, "Sent back"), A.accounts.filter(a => a.state === 'needs_changes').map(a => /*#__PURE__*/React.createElement(AccountRow, {
    key: a.id,
    item: a,
    creator: creator(a.creator),
    onClick: () => onOpenAccount && onOpenAccount(a)
  }))) : /*#__PURE__*/React.createElement(EmptyState, {
    icon: "circle-user-round",
    title: "No accounts to approve",
    body: "Every creator on the roster is linked. New creators show up here after they upload their warm-up proof.",
    style: {
      marginTop: 40
    }
  }) : null);
}

/* Every row is the same height: 72px thumb plus 12px padding, so the queue
   scrolls as an even rhythm. The retake count rides on the thumbnail rather
   than the chip row, which would push a card taller. */
function SubmissionRow({
  item,
  creator,
  onClick
}) {
  return /*#__PURE__*/React.createElement(Card, {
    pad: 12,
    onClick: onClick,
    style: {
      display: 'flex',
      gap: 12,
      alignItems: 'stretch',
      height: 96,
      boxSizing: 'border-box'
    }
  }, /*#__PURE__*/React.createElement(Thumb, {
    format: item.format,
    w: 54,
    h: 72,
    badge: window.isReel(item.format) ? item.duration : `${item.clips}`,
    topBadge: item.attempt > 1 ? `Take ${item.attempt}` : null
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 7
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: creator.name,
    size: 20,
    photo: true
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      font: '700 13px var(--font-ui)',
      color: 'var(--ink)'
    }
  }, creator.short), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      font: '600 12px var(--font-ui)',
      color: 'var(--slate-400)'
    }
  }, item.age)), /*#__PURE__*/React.createElement("div", {
    style: {
      font: '700 15px/1.28 var(--font-display)',
      letterSpacing: '-0.2px',
      color: 'var(--ink)',
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden'
    }
  }, item.title), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      alignItems: 'center',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement(FormatChip, {
    format: item.format,
    size: "sm"
  }), /*#__PURE__*/React.createElement(TypeChip, null, item.typeLabel), /*#__PURE__*/React.createElement(TypeChip, null, window.isReel(item.format) ? `${item.clips} clips` : `${item.clips} slides`))));
}

/* One tap after a glance. The song is the only question. */
function MusicApprovalRow({
  item,
  creator,
  onOpen,
  approved = false
}) {
  const {
    Button,
    Icon
  } = window.NoniDesignSystem_710e43;
  return /*#__PURE__*/React.createElement(Card, {
    pad: 12,
    style: {
      display: 'flex',
      gap: 12,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(Thumb, {
    format: item.format,
    w: 44,
    h: 58,
    onClick: onOpen
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: '700 14px/1.3 var(--font-display)',
      letterSpacing: '-0.2px',
      color: 'var(--ink)',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, item.title), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 3,
      font: '600 12px var(--font-ui)',
      color: 'var(--slate-500)',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, creator.short, " \xB7 ", item.slides, " slides \xB7 ", item.posted), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 6,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      font: '700 11px var(--font-ui)',
      color: 'var(--blue-700)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "music-2",
    size: 12
  }), item.marked)), approved ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      padding: '8px 12px',
      borderRadius: 999,
      background: 'var(--green-soft)',
      color: 'var(--green)',
      font: '700 13px var(--font-ui)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 14
  }), "Approved") : /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    variant: "approve",
    icon: "check",
    onClick: onOpen
  }, "Approve"));
}
function AccountRow({
  item,
  creator,
  onClick
}) {
  const {
    Icon
  } = window.NoniDesignSystem_710e43;
  const sentBack = item.state === 'needs_changes';
  return /*#__PURE__*/React.createElement(Card, {
    pad: 12,
    onClick: onClick,
    style: {
      display: 'flex',
      gap: 12,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: creator.name,
    size: 40,
    tone: sentBack ? 'quiet' : 'brand'
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 7
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: '700 15px var(--font-display)',
      letterSpacing: '-0.2px',
      color: 'var(--ink)'
    }
  }, creator.name), /*#__PURE__*/React.createElement(TypeChip, {
    tone: sentBack ? 'warn' : 'quiet'
  }, sentBack ? 'Needs changes' : 'Pending')), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 3,
      font: '600 12px var(--font-ui)',
      color: 'var(--slate-500)',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, "@", item.tiktok, " \xB7 @", item.instagram), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 2,
      font: '400 12px var(--font-ui)',
      color: 'var(--slate-400)'
    }
  }, sentBack ? item.reason : item.submitted)), /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-right",
    size: 18,
    color: "var(--slate-300)"
  }));
}
Object.assign(window, {
  ReviewScreen,
  SubmissionRow,
  MusicApprovalRow,
  AccountRow
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin-app/ReviewScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin-app/WeekSetupScreen.jsx
try { (() => {
/* Week setup — the only stepped ceremony in the product. It runs once a week,
   so it can afford three screens. The split is a pool, not a lock: types stay
   editable inside each post and the grid header shows the drift. */

const VIDEO_TYPES = [{
  key: 'numbered_list',
  label: 'Numbered list',
  hint: 'Hook, N points, outro',
  d: 8
}, {
  key: 'talking_head',
  label: 'Talking head',
  hint: '3 to 5 points, one speaker',
  d: 5
}, {
  key: 'explainer',
  label: 'Explainer',
  hint: 'One idea, taken apart',
  d: 3
}, {
  key: 'contrast',
  label: 'Contrast',
  hint: 'Two sides, still one speaker',
  d: 2
}, {
  key: 'replay_bait',
  label: 'Replay bait',
  hint: 'One loop clip, no plug',
  d: 2
}];
const SLIDE_TYPES = [{
  key: 'numbered_tips',
  label: 'Numbered tips',
  hint: 'One slide per point',
  d: 5
}, {
  key: 'how_to',
  label: 'How to',
  hint: 'Steps in order',
  d: 3
}, {
  key: 'getting_started',
  label: 'Getting started',
  hint: 'For someone on day one',
  d: 2
}];
function WeekSetup({
  step: step0 = 0,
  state = 'default',
  onDone,
  onBack
}) {
  const {
    Button,
    ProgressBar,
    Icon
  } = window.NoniDesignSystem_710e43;
  const [step, setStep] = React.useState(step0);
  const [videos, setVideos] = React.useState(20);
  const [slideshows, setSlideshows] = React.useState(10);
  const [vSplit, setVSplit] = React.useState(() => Object.fromEntries(VIDEO_TYPES.map(t => [t.key, t.d])));
  const [sSplit, setSSplit] = React.useState(() => Object.fromEntries(SLIDE_TYPES.map(t => [t.key, t.d])));
  const vSum = Object.values(vSplit).reduce((a, b) => a + b, 0);
  const sSum = Object.values(sSplit).reduce((a, b) => a + b, 0);
  const over = state === 'mismatch';
  const vTotal = over ? vSum + 2 : vSum;
  const titles = ["This week's mix", 'Video types', 'Slideshow types'];
  const subs = ['Thirty posts is the week. Change the ratio if the roster is short.', `The ${videos} videos split across five types. Numbered list carries the week.`, `The ${slideshows} slideshows split across three types.`];
  const ok = step === 0 ? true : step === 1 ? vTotal === videos : sSum === slideshows;
  return /*#__PURE__*/React.createElement(AdminScreen, {
    bottom: 110,
    pad: false,
    footer: /*#__PURE__*/React.createElement(ActionBar, null, step > 0 ? /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      size: "md",
      onClick: () => setStep(step - 1),
      style: {
        flex: '0 0 30%'
      }
    }, "Back") : null, /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      size: "md",
      block: true,
      disabled: !ok,
      onClick: () => step < 2 ? setStep(step + 1) : onDone && onDone(),
      style: {
        flex: 1
      }
    }, step < 2 ? 'Next' : 'Create 30 rows'))
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minHeight: 0,
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      padding: `0 0 110px`
    }
  }, /*#__PURE__*/React.createElement(PushHeader, {
    title: "Week 15 \xB7 Aug 17\u201323",
    meta: `Step ${step + 1} of 3`,
    onBack: step === 0 ? onBack : () => setStep(step - 1)
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: `0 ${window.GUT}px`,
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(ProgressBar, {
    step: step,
    total: 3,
    variant: "dots"
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      font: '700 28px var(--font-display)',
      letterSpacing: 'var(--tracking-title)',
      color: 'var(--ink)'
    }
  }, titles[step]), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '8px 0 0',
      font: '400 15px/1.5 var(--font-ui)',
      color: 'var(--slate-500)'
    }
  }, subs[step])), step === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(RatioCard, {
    label: "Videos",
    hint: "Reels",
    value: videos,
    onChange: setVideos,
    icon: "video"
  }), /*#__PURE__*/React.createElement(RatioCard, {
    label: "Slideshows",
    hint: "Photo carousels",
    value: slideshows,
    onChange: setSlideshows,
    icon: "images"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '14px 16px',
      borderRadius: 'var(--radius-md)',
      background: 'var(--blue-50)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "layout-list",
    size: 18,
    color: "var(--blue-600)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      font: '600 14px var(--font-ui)',
      color: 'var(--ink)'
    }
  }, videos + slideshows, " rows will be stamped and ready to fill"))) : null, step === 1 ? /*#__PURE__*/React.createElement(SplitList, {
    types: VIDEO_TYPES,
    split: vSplit,
    onChange: (k, v) => setVSplit({
      ...vSplit,
      [k]: v
    }),
    sum: vTotal,
    target: videos,
    noun: "videos"
  }) : null, step === 2 ? /*#__PURE__*/React.createElement(SplitList, {
    types: SLIDE_TYPES,
    split: sSplit,
    onChange: (k, v) => setSSplit({
      ...sSplit,
      [k]: v
    }),
    sum: sSum,
    target: slideshows,
    noun: "slideshows"
  }) : null, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '0 2px',
      font: '400 13px/1.45 var(--font-ui)',
      color: 'var(--slate-400)'
    }
  }, "This is a pool, not a lock. Any post's type stays editable later and the grid header shows the drift."))));
}
function RatioCard({
  label,
  hint,
  value,
  onChange,
  icon
}) {
  const {
    Icon
  } = window.NoniDesignSystem_710e43;
  const step = d => onChange(Math.max(0, value + d));
  return /*#__PURE__*/React.createElement(Card, {
    pad: 16,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 42,
      height: 42,
      flex: '0 0 auto',
      borderRadius: 999,
      background: 'var(--blue-100)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 19,
    color: "var(--blue-700)"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: '700 17px var(--font-display)',
      letterSpacing: '-0.3px',
      color: 'var(--ink)'
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 2,
      font: '600 13px var(--font-ui)',
      color: 'var(--slate-400)'
    }
  }, hint)), /*#__PURE__*/React.createElement(StepControl, {
    value: value,
    onStep: step
  }));
}
function StepControl({
  value,
  onStep,
  w = 34
}) {
  const {
    Icon
  } = window.NoniDesignSystem_710e43;
  const btn = {
    width: w,
    height: w,
    borderRadius: 999,
    border: 'none',
    cursor: 'pointer',
    background: 'var(--fill-quiet)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center'
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 9
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => onStep(-1),
    "aria-label": "Decrease",
    style: btn
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 12,
      height: 2,
      borderRadius: 2,
      background: 'var(--slate-500)'
    }
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      minWidth: 28,
      textAlign: 'center',
      font: '700 22px var(--font-display)',
      letterSpacing: '-0.5px',
      color: 'var(--ink)'
    }
  }, value), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => onStep(1),
    "aria-label": "Increase",
    style: btn
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "plus",
    size: 16,
    color: "var(--slate-500)"
  })));
}
function SplitList({
  types,
  split,
  onChange,
  sum,
  target,
  noun
}) {
  const {
    Icon
  } = window.NoniDesignSystem_710e43;
  const diff = sum - target;
  const good = diff === 0;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 9,
      padding: '12px 14px',
      borderRadius: 'var(--radius-md)',
      background: good ? 'var(--green-soft)' : 'var(--amber-soft)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: good ? 'circle-check-big' : 'circle-alert',
    size: 17,
    color: good ? 'var(--green)' : 'var(--amber)'
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      font: '700 14px var(--font-ui)',
      color: good ? 'var(--green)' : '#8A5A0E'
    }
  }, good ? `${sum} of ${target} ${noun} assigned` : diff > 0 ? `${diff} over. Take ${diff} off a type.` : `${-diff} left to assign.`)), types.map(t => /*#__PURE__*/React.createElement(Card, {
    key: t.key,
    pad: 13,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: '700 15px var(--font-display)',
      letterSpacing: '-0.2px',
      color: 'var(--ink)'
    }
  }, t.label), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 2,
      font: '600 12px var(--font-ui)',
      color: 'var(--slate-400)'
    }
  }, t.hint)), /*#__PURE__*/React.createElement(StepControl, {
    value: split[t.key],
    onStep: d => onChange(t.key, Math.max(0, split[t.key] + d)),
    w: 30
  }))));
}
Object.assign(window, {
  WeekSetup,
  RatioCard,
  StepControl,
  SplitList,
  VIDEO_TYPES,
  SLIDE_TYPES
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin-app/WeekSetupScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin-app/admin-data.js
try { (() => {
/* Sample content for the Noni admin kit. Tenant: FieldVision AI — college
   soccer recruiting tech. Every post plugs the product inside one talking
   point; nothing here is a standalone ad beat. Formats are video (Reel) and
   photo_carousel (Slideshow), never video-only. */
window.NONI_ADMIN = {
  company: {
    name: 'FieldVision AI',
    admin: 'Elan'
  },
  creators: [{
    id: 'c1',
    name: 'Fabri Duarte',
    short: 'Fabri',
    initial: 'F',
    tiktok: 'fabri.d1soccer',
    instagram: 'fabri.d1soccer',
    credential: 'D1 midfielder, Class of 2027',
    earned: '$1,840',
    posts: 34,
    views: '2.4M',
    status: 'approved'
  }, {
    id: 'c2',
    name: 'Mara Ionescu',
    short: 'Mara',
    initial: 'M',
    tiktok: 'mara.keeps',
    instagram: 'mara.keeps',
    credential: 'Keeper, committed to Pitt',
    earned: '$1,275',
    posts: 28,
    views: '1.6M',
    status: 'approved'
  }, {
    id: 'c3',
    name: 'Deniz Aksoy',
    short: 'Deniz',
    initial: 'D',
    tiktok: 'deniz.on.ball',
    instagram: 'deniz.onball',
    credential: 'JUCO transfer, 2 offers',
    earned: '$910',
    posts: 21,
    views: '870K',
    status: 'approved'
  }, {
    id: 'c4',
    name: 'Sofia Reyes',
    short: 'Sofia',
    initial: 'S',
    tiktok: 'sofia.recruitfilm',
    instagram: 'sofia.recruitfilm',
    credential: 'Class of 2028, uncommitted',
    earned: '$0',
    posts: 0,
    views: '—',
    status: 'pending'
  }],
  /* Queue 1 — post submissions, newest first. */
  submissions: [{
    id: 's1',
    creator: 'c1',
    title: 'The tripod setup that took 90 seconds',
    type: 'talking_head',
    typeLabel: 'Talking head',
    format: 'video',
    clips: 5,
    duration: '0:38',
    age: '14m ago',
    attempt: 1,
    status: 'submitted'
  }, {
    id: 's2',
    creator: 'c3',
    title: '3 stats that decide Sunday',
    type: 'numbered_tips',
    typeLabel: 'Numbered tips',
    format: 'photo_carousel',
    clips: 5,
    duration: '5 slides',
    age: '52m ago',
    attempt: 1,
    status: 'submitted'
  }, {
    id: 's3',
    creator: 'c2',
    title: 'Why your winger fades after 70 minutes',
    type: 'numbered_list',
    typeLabel: 'Numbered list',
    format: 'video',
    clips: 7,
    duration: '0:52',
    age: '2h ago',
    attempt: 2,
    status: 'submitted'
  }, {
    id: 's4',
    creator: 'c1',
    title: 'Highlight reel vs full match film',
    type: 'contrast',
    typeLabel: 'Contrast',
    format: 'video',
    clips: 6,
    duration: '0:44',
    age: '5h ago',
    attempt: 1,
    status: 'submitted'
  }, {
    id: 's5',
    creator: 'c2',
    title: 'Getting your first film clip tagged',
    type: 'getting_started',
    typeLabel: 'Getting started',
    format: 'photo_carousel',
    clips: 4,
    duration: '4 slides',
    age: 'Yesterday',
    attempt: 1,
    status: 'submitted'
  }],
  /* Queue 2 — music approvals. Slideshows only, one tap. */
  music: [{
    id: 'm1',
    creator: 'c1',
    title: '4 drills we tagged this week',
    format: 'photo_carousel',
    slides: 4,
    posted: 'Live 3h ago',
    marked: 'Marked added 12m ago',
    platforms: 'TikTok · Instagram'
  }, {
    id: 'm2',
    creator: 'c3',
    title: 'How to film a match from one corner',
    format: 'photo_carousel',
    slides: 6,
    posted: 'Live 9h ago',
    marked: 'Marked added 1h ago',
    platforms: 'TikTok · Instagram'
  }],
  /* Queue 3 — creator account approval, once per creator. */
  accounts: [{
    id: 'a1',
    creator: 'c4',
    state: 'pending',
    submitted: 'Submitted 1h ago',
    tiktok: 'sofia.recruitfilm',
    instagram: 'sofia.recruitfilm',
    ig: {
      label: 'Instagram scroll',
      need: '20s — home, explore, reels',
      got: '0:22'
    },
    tt: {
      label: 'TikTok For You scroll',
      need: '15s minimum, continuous',
      got: '0:19'
    },
    shots: 2
  }, {
    id: 'a2',
    creator: 'c3',
    state: 'needs_changes',
    submitted: 'Sent back 2d ago',
    tiktok: 'deniz.on.ball',
    instagram: 'deniz.onball',
    reason: 'Feed is not college soccer',
    note: 'For You is gym and car content. Follow 20 college soccer and recruiting accounts, scroll for two days, then record again.',
    ig: {
      label: 'Instagram scroll',
      need: '20s — home, explore, reels',
      got: '0:21'
    },
    tt: {
      label: 'TikTok For You scroll',
      need: '15s minimum, continuous',
      got: '0:16'
    },
    shots: 2
  }],
  /* Reel review — one row per clip in the render manifest. */
  segments: [{
    slot: 'Hook',
    text: 'You do not need a camera crew. You need one phone and a fence.',
    overlay: 'ONE PHONE. ONE FENCE.',
    len: '0:06',
    state: 'ok'
  }, {
    slot: 'Point 1',
    text: 'Clamp it at the halfway line, chest height, and press record.',
    overlay: 'Halfway line, chest height',
    len: '0:09',
    state: 'ok'
  }, {
    slot: 'Point 2',
    text: 'Walk away. You are coaching, not filming.',
    overlay: '',
    len: '0:07',
    state: 'ok'
  }, {
    slot: 'Point 3',
    text: 'FieldVision tags every touch off that one angle, so the film is cut before you get home.',
    overlay: 'Cut before you get home',
    len: '0:11',
    state: 'flagged',
    note: 'Plug is clear but the audio clips at 0:04. Re-record this one.'
  }, {
    slot: 'Outro',
    text: 'Comment D1 and I will send you the clamp we use.',
    overlay: 'Comment D1',
    len: '0:05',
    state: 'ok'
  }],
  slides: [{
    n: 1,
    overlay: 'Three numbers decide most Sunday matches. None of them are goals.',
    shot: false
  }, {
    n: 2,
    overlay: 'Recoveries in the final third',
    shot: true
  }, {
    n: 3,
    overlay: 'Passes before a shot',
    shot: true
  }, {
    n: 4,
    overlay: 'Distance covered after minute 70',
    shot: false
  }, {
    n: 5,
    overlay: 'FieldVision tags all three off one phone angle. Comment D1 for the template.',
    shot: false
  }],
  thread: [{
    from: 'admin',
    name: 'You',
    time: '2d ago',
    body: 'Point 3 audio clipped. Same setup, just move the phone off the fence rail.'
  }, {
    from: 'creator',
    name: 'Mara',
    time: '2d ago',
    body: 'Rail was buzzing. Reshot it on the tripod, take 2 is up.'
  }],
  chat: [{
    from: 'creator',
    name: 'Mara',
    time: 'Mon 09:14',
    body: 'Field is booked till 6 today, I will shoot both after.'
  }, {
    from: 'admin',
    name: 'You',
    time: 'Mon 09:20',
    body: 'Works. The contrast one needs daylight, keep that first.'
  }, {
    from: 'admin',
    time: 'Mon 09:21',
    ref: {
      title: 'Highlight reel vs full match film',
      format: 'video',
      meta: 'Contrast · 6 clips'
    }
  }, {
    from: 'creator',
    name: 'Mara',
    time: 'Mon 18:02',
    body: 'Both up. Take 2 on the winger one, the rail was buzzing on take 1.'
  }, {
    from: 'admin',
    name: 'You',
    time: 'Tue 07:41',
    body: 'Approved. Posting Wednesday 5pm.'
  }],
  /* Briefs — the week pool. 30 posts, four row states. */
  week: {
    label: 'Week 14',
    range: 'Aug 10–16',
    videoTarget: 20,
    slideshowTarget: 10,
    videoDone: 7,
    slideshowDone: 3,
    split: [{
      type: 'numbered_list',
      label: 'Numbered list',
      planned: 8,
      actual: 8
    }, {
      type: 'talking_head',
      label: 'Talking head',
      planned: 5,
      actual: 6
    }, {
      type: 'explainer',
      label: 'Explainer',
      planned: 3,
      actual: 2
    }, {
      type: 'contrast',
      label: 'Contrast',
      planned: 2,
      actual: 2
    }, {
      type: 'replay_bait',
      label: 'Replay bait',
      planned: 2,
      actual: 2
    }],
    slideSplit: [{
      type: 'numbered_tips',
      label: 'Numbered tips',
      planned: 5,
      actual: 5
    }, {
      type: 'how_to',
      label: 'How to',
      planned: 3,
      actual: 3
    }, {
      type: 'getting_started',
      label: 'Getting started',
      planned: 2,
      actual: 2
    }],
    rows: [{
      n: 1,
      type: 'numbered_list',
      typeLabel: 'Numbered list',
      format: 'video',
      state: 'complete',
      title: '5 things coaches check before they reply',
      points: 5,
      score: 88
    }, {
      n: 2,
      type: 'talking_head',
      typeLabel: 'Talking head',
      format: 'video',
      state: 'complete',
      title: 'The tripod setup that took 90 seconds',
      points: 3,
      score: 92
    }, {
      n: 3,
      type: 'contrast',
      typeLabel: 'Contrast',
      format: 'video',
      state: 'filled',
      title: 'Highlight reel vs full match film',
      points: 4
    }, {
      n: 4,
      type: 'numbered_list',
      typeLabel: 'Numbered list',
      format: 'video',
      state: 'partial',
      title: 'Why your winger fades after 70 minutes',
      points: 5,
      filled: 'Hook and 3 of 5 points'
    }, {
      n: 5,
      type: 'explainer',
      typeLabel: 'Explainer',
      format: 'video',
      state: 'empty',
      phrase: 'why am I not getting recruited for college soccer'
    }, {
      n: 6,
      type: 'replay_bait',
      typeLabel: 'Replay bait',
      format: 'video',
      state: 'empty',
      phrase: 'college soccer id camp worth it'
    }, {
      n: 7,
      type: 'numbered_list',
      typeLabel: 'Numbered list',
      format: 'video',
      state: 'killed',
      kill: 'No approved claim covers transfer portal timing'
    }, {
      n: 8,
      type: 'talking_head',
      typeLabel: 'Talking head',
      format: 'video',
      state: 'empty',
      phrase: 'what do college coaches look for in film'
    }],
    slideRows: [{
      n: 1,
      type: 'numbered_tips',
      typeLabel: 'Numbered tips',
      format: 'photo_carousel',
      state: 'complete',
      title: '3 stats that decide Sunday',
      points: 5,
      score: 84
    }, {
      n: 2,
      type: 'how_to',
      typeLabel: 'How to',
      format: 'photo_carousel',
      state: 'filled',
      title: 'How to film a match from one corner',
      points: 6
    }, {
      n: 3,
      type: 'getting_started',
      typeLabel: 'Getting started',
      format: 'photo_carousel',
      state: 'partial',
      title: 'Getting your first film clip tagged',
      points: 4,
      filled: 'Hook and 2 of 4 slides'
    }, {
      n: 4,
      type: 'numbered_tips',
      typeLabel: 'Numbered tips',
      format: 'photo_carousel',
      state: 'empty',
      phrase: 'soccer recruiting timeline sophomore year'
    }]
  },
  /* Post editor — one filled post. */
  post: {
    n: 4,
    type: 'numbered_list',
    typeLabel: 'Numbered list',
    format: 'video',
    title: 'Why your winger fades after 70 minutes',
    titleOptions: ['Why your winger fades after 70 minutes', 'The 70th minute is a running problem', 'Your winger is not unfit, he is unserved'],
    phrase: 'why my winger fades after 70 minutes',
    phraseAlts: ['winger tired second half soccer', 'off ball runs college soccer film'],
    derived: 'Hook + 5 points + outro = 7 clips',
    clipSlots: ['Hook', 'Clip 1', 'Clip 2', 'Clip 3', 'Clip 4', 'Clip 5', 'Outro'],
    hook: 'Your winger runs the wrong runs, not too few.',
    hookOptions: ['Your winger runs the wrong runs, not too few.', 'Nobody fades at 70 minutes by accident.', 'I tagged 400 wide runs so you do not have to.', 'Your winger covers 11km and touches the ball nine times.', 'The 70th minute is a data problem, not a fitness one.', 'Coaches blame the legs. The film blames the runs.'],
    points: [{
      n: 1,
      text: 'Count the runs he makes before minute 30. It is usually double what he makes after 60.',
      shot: null,
      move: 'Clip 1'
    }, {
      n: 2,
      text: 'Most of them are outside-shoulder runs that never get played. That is the waste.',
      shot: 'Pass map, Sat vs Ridgeview',
      move: 'Clip 2'
    }, {
      n: 3,
      text: 'FieldVision tags every off-ball run off one phone angle, so you can see which ones actually got served.',
      plug: true,
      shot: 'Run map, second half',
      move: 'Clip 3'
    }, {
      n: 4,
      text: 'Cut the three runs nobody plays and he still has legs at 80.',
      shot: null,
      move: 'Clip 4'
    }, {
      n: 5,
      text: 'Show him the map, not the stopwatch.',
      shot: null,
      move: 'Clip 5'
    }],
    cta: 'FieldVision tags every off-ball run off one phone angle.',
    claim: 'Off-ball run tagging from a single fixed camera',
    caption: 'Why my winger fades after 70 minutes: he runs the wrong runs, not too few. Full breakdown below.',
    hashtags: ['#collegesoccer', '#soccerrecruiting', '#matchfilm', '#u17'],
    example: 'tiktok.com/@sundayleaguetape/video/7391…',
    segments: [{
      slot: 'Hook',
      overlay: 'WRONG RUNS, NOT TIRED LEGS',
      show: true,
      shot: false
    }, {
      slot: 'Point 1',
      overlay: 'Double the runs before minute 30',
      show: true,
      shot: false
    }, {
      slot: 'Point 2',
      overlay: 'Outside-shoulder runs nobody plays',
      show: true,
      shot: true
    }, {
      slot: 'Point 3',
      overlay: 'Every run tagged from one angle',
      show: true,
      shot: true
    }, {
      slot: 'Point 4',
      overlay: '',
      show: false,
      shot: false
    }, {
      slot: 'Point 5',
      overlay: 'Show the map, not the stopwatch',
      show: true,
      shot: false
    }, {
      slot: 'Outro',
      overlay: 'Comment D1',
      show: true,
      shot: false
    }],
    review: {
      overall: 78,
      sections: [{
        key: 'Hook',
        score: 71,
        note: 'Nine words exactly. The second clause is the stronger opening.',
        suggestion: null,
        fix: 'Open on “wrong runs” and drop the comparison.'
      }, {
        key: 'Talking points',
        score: 84,
        note: 'Plug sits inside point 3 and traces to an approved claim.',
        suggestion: null
      }, {
        key: 'CTA',
        score: 66,
        note: 'Reads written, not spoken.',
        suggestion: 'Say the plug the way you would say it on a touchline.',
        fix: 'Replace “off one phone angle” with “from the one phone on the fence”.'
      }],
      checks: [{
        label: 'Hook ≤ 9 words',
        pass: true
      }, {
        label: '4 hashtags',
        pass: true
      }, {
        label: 'Search phrase in first sentence of caption',
        pass: true
      }, {
        label: 'One plug, inside a talking point',
        pass: true
      }, {
        label: 'Second person 5.8 per 100 words',
        pass: true
      }, {
        label: 'Hedge words: “just” in point 4',
        pass: false
      }, {
        label: 'Reads as spoken',
        pass: false,
        quote: '“Show him the map, not the stopwatch.”'
      }]
    }
  },
  /* Post editor — the slideshow variant of the same wizard. */
  slidePost: {
    n: 2,
    type: 'how_to',
    typeLabel: 'How to',
    format: 'photo_carousel',
    title: 'How to film a match from one corner',
    titleOptions: ['How to film a match from one corner', 'One corner, one phone, whole match'],
    phrase: 'how to film a soccer game by yourself',
    phraseAlts: ['filming youth soccer from the stands', 'best phone angle for match film'],
    derived: 'Cover slide + 4 steps + close = 6 slides',
    clipSlots: ['Cover', 'Slide 1', 'Slide 2', 'Slide 3', 'Slide 4', 'Close'],
    hook: 'One corner beats four parents with phones.',
    hookOptions: ['One corner beats four parents with phones.', 'Stop filming from the halfway line.', 'The corner flag is the only angle you need.', 'Four parents, four angles, zero usable film.', 'Film the whole match without holding a phone.', 'Your best camera position is already on the field.'],
    cta: 'FieldVision builds the pass map off that one corner angle.',
    claim: 'Pass map in 20 seconds',
    points: [{
      n: 1,
      text: 'Stand at the corner nearest your bench. You want the far touchline in frame.',
      shot: 'Corner setup, phone on clamp',
      move: 'Slide 1'
    }, {
      n: 2,
      text: 'Clamp at head height and lock the exposure before kickoff.',
      shot: null,
      move: 'Slide 2'
    }, {
      n: 3,
      text: 'FieldVision builds the pass map off that one corner angle, so nobody has to hold a phone.',
      plug: true,
      shot: 'Pass map from corner angle',
      move: 'Slide 3'
    }, {
      n: 4,
      text: 'Record the whole half in one take. Do not stop between phases.',
      shot: null,
      move: 'Slide 4'
    }],
    caption: 'How to film a soccer game by yourself: one corner, head height, one take. Steps in the slides.',
    hashtags: ['#collegesoccer', '#matchfilm', '#soccerparents'],
    example: 'tiktok.com/@d1.keeper/video/7402…',
    review: {
      overall: 84,
      sections: [{
        key: 'Hook',
        score: 86,
        note: 'Seven words, and it names the mistake instead of the fix.'
      }, {
        key: 'Talking points',
        score: 88,
        note: 'Steps run in order and the plug sits inside step 3.'
      }, {
        key: 'Caption',
        score: 74,
        note: 'Phrase is in the first sentence. Three hashtags is the floor.',
        suggestion: 'Add one more tag.',
        fix: 'Add #youthsoccer to reach four.'
      }],
      checks: [{
        label: 'Hook ≤ 9 words',
        pass: true
      }, {
        label: '3 hashtags',
        pass: true
      }, {
        label: 'Search phrase in first sentence of caption',
        pass: true
      }, {
        label: 'One plug, inside a talking point',
        pass: true
      }, {
        label: 'Slide count matches the type',
        pass: true
      }]
    }
  },
  library: {
    ideas: [{
      id: 'l1',
      body: 'Coaches ignore highlight reels sent in July. Post about the actual window.',
      age: '2h ago'
    }, {
      id: 'l2',
      body: 'The one drill clip that got Mara three replies.',
      age: 'Yesterday'
    }, {
      id: 'l3',
      body: 'What a 31% possession drop looks like on film.',
      age: '3d ago'
    }],
    ours: [{
      id: 'o1',
      title: 'Half-time talk, but with data',
      creator: 'Fabri',
      format: 'video',
      views: '412K',
      when: 'Jul 24'
    }, {
      id: 'o2',
      title: '4 drills we tagged this week',
      creator: 'Mara',
      format: 'photo_carousel',
      views: '128K',
      when: 'Jul 21'
    }, {
      id: 'o3',
      title: 'Reading a pass map in 20 seconds',
      creator: 'Deniz',
      format: 'video',
      views: '96K',
      when: 'Jul 19'
    }, {
      id: 'o4',
      title: '5 things coaches check before they reply',
      creator: 'Fabri',
      format: 'photo_carousel',
      views: '81K',
      when: 'Jul 14'
    }],
    refs: [{
      id: 'r1',
      title: 'I tagged 400 goal kicks so you do not have to',
      handle: 'sundayleaguetape',
      format: 'video',
      views: '2.1M'
    }, {
      id: 'r2',
      title: 'Nobody talks about keeper distribution',
      handle: 'd1.keeper',
      format: 'photo_carousel',
      views: '480K'
    }],
    fromCreator: [{
      id: 'f1',
      body: 'My coach asked how the pass map is built. Could be a whole post.',
      creator: 'Deniz',
      age: '1d ago'
    }, {
      id: 'f2',
      body: 'Parents keep asking what to film from the stands.',
      creator: 'Fabri',
      age: '4d ago'
    }]
  },
  analytics: {
    range: '30 days',
    headline: {
      views: '1.9M',
      revenue: '$16.4k',
      posts: 118
    },
    series: [12, 18, 15, 24, 31, 28, 22, 35, 41, 38, 33, 47, 52, 44, 58, 61, 49, 66, 72, 63, 70, 84, 77, 91, 86, 98, 104, 96, 112, 121],
    events: [3, 0, 2, 5, 1, 4, 0, 6, 3, 2, 7, 4, 1, 5, 8, 3, 2, 6, 9, 4, 3, 7, 5, 11, 6, 8, 4, 9, 12, 7],
    perCreator: [{
      name: 'Fabri Duarte',
      views: '842K',
      revenue: '$6,180',
      posts: 34
    }, {
      name: 'Mara Ionescu',
      views: '611K',
      revenue: '$5,240',
      posts: 28
    }, {
      name: 'Deniz Aksoy',
      views: '447K',
      revenue: '$4,980',
      posts: 21
    }],
    hooks: [{
      text: 'I tagged 400 goal kicks so you do not have to',
      views: '312K'
    }, {
      text: 'Your winger runs the wrong runs, not too few.',
      views: '288K'
    }, {
      text: 'Coaches ignore reels sent in July. Here is why.',
      views: '204K'
    }]
  },
  features: [{
    name: 'Off-ball run tagging',
    state: 'approved',
    body: 'Tags every off-ball run from a single fixed camera angle.'
  }, {
    name: 'Pass map in 20 seconds',
    state: 'approved',
    body: 'Full pass map generated from one phone on a tripod.'
  }, {
    name: 'Bulk coach emails',
    state: 'approved',
    body: 'Sends a film link to a filtered list of college coaches.'
  }, {
    name: 'Auto highlight cut',
    state: 'rejected',
    body: 'Not shipped. Do not claim automatic highlight generation.'
  }],
  brain: [{
    key: 'Product',
    words: 412,
    updated: 'Updated 2d ago'
  }, {
    key: 'Audience',
    words: 268,
    updated: 'Updated 6d ago'
  }, {
    key: 'Voice',
    words: 331,
    updated: 'Updated 2w ago'
  }, {
    key: 'Learnings',
    words: 96,
    updated: 'Updated today'
  }],
  calendar: [{
    day: 'Mon 10',
    items: [{
      t: 'Tripod setup',
      c: 'Fabri',
      f: 'video',
      s: 'approved'
    }, {
      t: '3 stats Sunday',
      c: 'Deniz',
      f: 'photo_carousel',
      s: 'submitted'
    }]
  }, {
    day: 'Tue 11',
    items: [{
      t: 'Winger fades',
      c: 'Mara',
      f: 'video',
      s: 'assigned'
    }]
  }, {
    day: 'Wed 12',
    items: [{
      t: 'Highlight vs film',
      c: 'Fabri',
      f: 'video',
      s: 'assigned'
    }, {
      t: 'One corner',
      c: 'Deniz',
      f: 'photo_carousel',
      s: 'assigned'
    }, {
      t: 'First clip tagged',
      c: 'Mara',
      f: 'photo_carousel',
      s: 'recorded'
    }]
  }, {
    day: 'Thu 13',
    items: [{
      t: 'ID camp truth',
      c: 'Fabri',
      f: 'video',
      s: 'assigned'
    }]
  }, {
    day: 'Fri 14',
    items: [{
      t: 'Coach reply window',
      c: 'Mara',
      f: 'photo_carousel',
      s: 'assigned'
    }, {
      t: 'Film from stands',
      c: 'Deniz',
      f: 'video',
      s: 'assigned'
    }]
  }, {
    day: 'Sat 15',
    items: []
  }, {
    day: 'Sun 16',
    items: [{
      t: 'Weekend recap',
      c: 'Fabri',
      f: 'video',
      s: 'assigned'
    }]
  }]
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin-app/admin-data.js", error: String((e && e.message) || e) }); }

// ui_kits/creator-app/CreatorApp.jsx
try { (() => {
/* Creator shell — Home · Posts · Analytics · Profile. */
function CreatorApp({
  state = 'default'
}) {
  const {
    TabBar
  } = window.NoniDesignSystem_710e43;
  const [tab, setTab] = React.useState(0);
  const [task, setTask] = React.useState(null);
  const [mode, setMode] = React.useState('list'); // list | detail | record
  const [toast, setToast] = React.useState(null);
  React.useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);
  const dark = mode === 'record';
  const open = t => {
    setTask(t);
    setMode('detail');
  };
  let body;
  if (mode === 'record') {
    body = /*#__PURE__*/React.createElement(RecordScreen, {
      task: task,
      onClose: () => setMode('detail'),
      onSubmitted: () => {
        setMode('list');
        setToast('Sent for review. Approve lands it in your queue.');
      }
    });
  } else if (mode === 'detail') {
    body = /*#__PURE__*/React.createElement(TaskDetailScreen, {
      task: task,
      onBack: () => setMode('list'),
      onRecord: () => setMode('record')
    });
  } else if (tab === 1) {
    body = /*#__PURE__*/React.createElement(PostsScreen, {
      state: state,
      onGoConnect: () => setTab(3)
    });
  } else if (tab === 2) {
    body = /*#__PURE__*/React.createElement(GrowthScreen, {
      state: state
    });
  } else if (tab === 3) {
    body = /*#__PURE__*/React.createElement(ProfileScreen, {
      state: state
    });
  } else {
    body = /*#__PURE__*/React.createElement(HomeScreen, {
      state: state,
      onOpenTask: open,
      onRecord: t => {
        setTask(t);
        setMode('record');
      }
    });
  }
  return /*#__PURE__*/React.createElement(Phone, {
    dark: dark
  }, body, mode === 'list' ? /*#__PURE__*/React.createElement(TabBar, {
    active: tab,
    onSelect: setTab,
    style: {
      position: 'absolute',
      left: 16,
      right: 16,
      bottom: 22
    },
    items: [{
      label: 'Home',
      icon: 'house'
    }, {
      label: 'Posts',
      icon: 'layout-list'
    }, {
      label: 'Analytics',
      icon: 'chart-column'
    }, {
      label: 'Profile',
      icon: 'circle-user-round'
    }]
  }) : null, toast ? /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 20,
      right: 20,
      bottom: 100,
      padding: '14px 18px',
      borderRadius: 16,
      background: 'var(--ink)',
      color: '#fff',
      font: '600 14px var(--font-ui)',
      boxShadow: 'var(--shadow-float)',
      zIndex: 60
    }
  }, toast) : null);
}

/* Kit harness: one phone, plus the state switch the design review needs. */
function CreatorKit() {
  const [state, setState] = React.useState('default');
  const states = [['default', 'Default'], ['loading', 'Loading'], ['empty', 'Empty'], ['unlinked', 'No accounts']];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      padding: 5,
      borderRadius: 999,
      background: 'var(--white)',
      border: '1px solid var(--line)',
      boxShadow: 'var(--shadow-card)'
    }
  }, states.map(([k, label]) => /*#__PURE__*/React.createElement("button", {
    key: k,
    type: "button",
    onClick: () => setState(k),
    style: {
      padding: '9px 16px',
      borderRadius: 999,
      border: 'none',
      cursor: 'pointer',
      background: state === k ? 'var(--ink)' : 'transparent',
      color: state === k ? 'var(--white)' : 'var(--slate-500)',
      font: '700 13px var(--font-ui)',
      transition: 'background var(--dur-fast) var(--ease-out)'
    }
  }, label))), /*#__PURE__*/React.createElement(CreatorApp, {
    key: state,
    state: state
  }));
}
Object.assign(window, {
  CreatorApp,
  CreatorKit
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/creator-app/CreatorApp.jsx", error: String((e && e.message) || e) }); }

// ui_kits/creator-app/CreatorShared.jsx
try { (() => {
/* Shared pieces for the creator shell: segmented control, week strip,
   skeletons and the Swap sheet. Motion matches the system: 240ms
   --ease-out for surfaces, 160ms for colour. */

function Segmented({
  items,
  active,
  onSelect,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 4,
      padding: 4,
      borderRadius: 'var(--radius-pill)',
      background: 'var(--fill-quiet)',
      ...style
    }
  }, items.map((label, i) => {
    const on = i === active;
    return /*#__PURE__*/React.createElement("button", {
      key: label,
      type: "button",
      onClick: () => onSelect(i),
      "aria-pressed": on,
      style: {
        flex: 1,
        padding: '11px 8px',
        border: 'none',
        cursor: 'pointer',
        borderRadius: 'var(--radius-pill)',
        background: on ? 'var(--white)' : 'transparent',
        boxShadow: on ? 'var(--shadow-card)' : 'none',
        color: on ? 'var(--ink)' : 'var(--slate-500)',
        font: '700 15px var(--font-ui)',
        letterSpacing: '-0.1px',
        transition: 'background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out)'
      }
    }, label);
  }));
}
function WeekStrip({
  days,
  active,
  onSelect
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6
    }
  }, days.map((d, i) => {
    const on = i === active;
    return /*#__PURE__*/React.createElement("button", {
      key: d.key,
      type: "button",
      onClick: () => onSelect(i),
      "aria-pressed": on,
      style: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        padding: '10px 0 9px',
        borderRadius: 'var(--radius-md)',
        cursor: 'pointer',
        border: `1px solid ${on ? 'transparent' : 'var(--border)'}`,
        background: on ? 'var(--accent)' : 'var(--white)',
        transition: 'background var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        font: '600 11px var(--font-ui)',
        color: on ? 'rgba(255,255,255,0.8)' : 'var(--slate-400)'
      }
    }, d.dow), /*#__PURE__*/React.createElement("span", {
      style: {
        font: '700 16px var(--font-display)',
        letterSpacing: '-0.3px',
        color: on ? 'var(--white)' : d.today ? 'var(--blue-600)' : 'var(--ink)'
      }
    }, d.date), /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'flex',
        gap: 3,
        height: 5,
        alignItems: 'center'
      }
    }, d.posts ? Array.from({
      length: d.posts
    }).map((_, k) => /*#__PURE__*/React.createElement("span", {
      key: k,
      style: {
        width: 5,
        height: 5,
        borderRadius: 999,
        background: on ? 'rgba(255,255,255,0.85)' : d.done ? 'var(--green)' : 'var(--blue-300)'
      }
    })) : /*#__PURE__*/React.createElement("span", {
      style: {
        width: 5,
        height: 5,
        borderRadius: 999,
        background: on ? 'rgba(255,255,255,0.45)' : 'var(--line-strong)'
      }
    })));
  }));
}
function SkeletonCard({
  height = 156,
  radius = 'var(--radius-lg)'
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height,
      borderRadius: radius,
      background: 'linear-gradient(100deg,var(--fill-quiet) 30%,#FAFCFE 50%,var(--fill-quiet) 70%)',
      backgroundSize: '220% 100%',
      animation: 'noni-shimmer 1400ms linear infinite'
    }
  });
}
function SkeletonLine({
  w = '100%',
  h = 14,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: w,
      height: h,
      borderRadius: 999,
      background: 'var(--fill-quiet)',
      ...style
    }
  });
}

/* Swap sheet — Inspiration filtered to the same format and pillars as the
   slot being replaced. */
function SwapSheet({
  slot,
  onPick,
  onClose,
  animate = true
}) {
  const {
    Icon,
    Button,
    MediaCard
  } = window.NoniDesignSystem_710e43;
  const [shown, setShown] = React.useState(!animate);
  React.useLayoutEffect(() => {
    if (animate) {
      const t = setTimeout(() => setShown(true), 0);
      return () => clearTimeout(t);
    }
  }, [animate]);
  const matches = window.NONI_DATA.inspiration.filter(i => i.format === slot.format && i.tags.some(t => slot.tags.includes(t)));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      zIndex: 70,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end'
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
    style: {
      position: 'absolute',
      inset: 0,
      background: 'var(--scrim)',
      opacity: shown ? 1 : 0,
      transition: 'opacity var(--dur-base) var(--ease-out)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      maxHeight: '78%',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--white)',
      borderRadius: 'var(--radius-2xl) var(--radius-2xl) 0 0',
      boxShadow: 'var(--shadow-raised)',
      paddingBottom: 26,
      transform: shown ? 'translateY(0)' : 'translateY(100%)',
      transition: 'transform var(--dur-base) var(--ease-out)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '10px 0 0',
      display: 'flex',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 40,
      height: 5,
      borderRadius: 999,
      background: 'var(--line-strong)'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 24px 12px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      font: '700 22px var(--font-display)',
      letterSpacing: '-0.4px',
      color: 'var(--ink)'
    }
  }, "Swap this post"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '6px 0 0',
      font: '400 14px/1.5 var(--font-ui)',
      color: 'var(--slate-500)'
    }
  }, "Same format, same pillars as the ", slot.time, " slot.")), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClose,
    "aria-label": "Close",
    style: {
      border: 'none',
      background: 'var(--fill-quiet)',
      width: 34,
      height: 34,
      borderRadius: 999,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "x",
    size: 18,
    color: "var(--slate-500)"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 24px 12px',
      display: 'flex',
      gap: 7,
      flexWrap: 'wrap'
    }
  }, [slot.format === 'reel' ? 'Reel' : 'Slideshow', ...slot.tags].map(t => /*#__PURE__*/React.createElement("span", {
    key: t,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      padding: '7px 12px',
      borderRadius: 999,
      background: 'var(--blue-100)',
      color: 'var(--blue-700)',
      font: '700 13px var(--font-ui)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 13
  }), t))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto',
      padding: '0 24px 0',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 10
    }
  }, matches.map(m => /*#__PURE__*/React.createElement(MediaCard, {
    key: m.id,
    variant: "tile",
    title: m.title,
    format: m.format,
    duration: m.duration,
    meta: `@${m.handle} · ${m.views}`,
    mediaHeight: 150,
    onClick: () => onPick(m),
    onPlay: () => onPick(m)
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 24px 0'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    size: "md",
    block: true,
    onClick: onClose
  }, "Keep what I have"))));
}
Object.assign(window, {
  Segmented,
  WeekStrip,
  SkeletonCard,
  SkeletonLine,
  SwapSheet,
  Dropdown,
  PostPager
});

/* Compact select. Used for sort on Posts and the metric on Analytics. */
function Dropdown({
  label,
  value,
  options,
  onChange,
  align = 'left',
  style
}) {
  const {
    Icon
  } = window.NoniDesignSystem_710e43;
  const [open, setOpen] = React.useState(false);
  const current = options.find(o => o.value === value) || options[0];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      ...style
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setOpen(o => !o),
    "aria-expanded": open,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      padding: '9px 13px',
      borderRadius: 999,
      cursor: 'pointer',
      background: 'var(--white)',
      border: '1.5px solid var(--border-strong)',
      color: 'var(--ink)',
      font: '700 14px var(--font-ui)'
    }
  }, current.icon ? /*#__PURE__*/React.createElement(Icon, {
    name: current.icon,
    size: 15,
    color: "var(--slate-500)"
  }) : null, label ? /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--slate-500)'
    }
  }, label) : null, current.label, /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-right",
    size: 15,
    color: "var(--slate-400)",
    style: {
      transform: open ? 'rotate(-90deg)' : 'rotate(90deg)',
      transition: 'transform var(--dur-fast) var(--ease-out)'
    }
  })), open ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    onClick: () => setOpen(false),
    style: {
      position: 'fixed',
      inset: 0,
      zIndex: 25
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 46,
      [align]: 0,
      zIndex: 30,
      minWidth: 176,
      background: 'var(--white)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-raised)',
      overflow: 'hidden'
    }
  }, options.map(o => /*#__PURE__*/React.createElement("button", {
    key: o.value,
    type: "button",
    onClick: () => {
      onChange(o.value);
      setOpen(false);
    },
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 9,
      width: '100%',
      padding: '12px 14px',
      border: 'none',
      borderBottom: '1px solid var(--line)',
      background: 'transparent',
      cursor: 'pointer',
      font: '600 14px var(--font-ui)',
      color: o.value === value ? 'var(--blue-700)' : 'var(--ink)'
    }
  }, o.icon ? /*#__PURE__*/React.createElement(Icon, {
    name: o.icon,
    size: 15,
    color: o.value === value ? 'var(--blue-600)' : 'var(--slate-400)'
  }) : null, /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      textAlign: 'left'
    }
  }, o.label), o.value === value ? /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 16,
    color: "var(--blue-600)"
  }) : null)))) : null);
}

/* Three posts a day, one on screen at a time. Green = done, amber = in
   review, blue = still to shoot. */
function PostPager({
  items,
  active,
  onSelect
}) {
  const dot = s => s === 'posted' || s === 'approved' ? 'var(--green)' : s === 'submitted' || s === 'recorded' ? 'var(--amber)' : 'var(--blue-300)';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 3,
      padding: 3,
      borderRadius: 999,
      background: 'var(--fill-quiet)'
    }
  }, items.map((it, i) => {
    const on = i === active;
    return /*#__PURE__*/React.createElement("button", {
      key: it.id || i,
      type: "button",
      onClick: () => onSelect(i),
      "aria-pressed": on,
      style: {
        flex: 1,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        padding: '7px 4px',
        border: 'none',
        borderRadius: 999,
        cursor: 'pointer',
        background: on ? 'var(--white)' : 'transparent',
        boxShadow: on ? 'var(--shadow-card)' : 'none',
        color: on ? 'var(--ink)' : 'var(--slate-500)',
        font: '700 13px var(--font-ui)',
        transition: 'background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 7,
        height: 7,
        borderRadius: 999,
        background: dot(it.status)
      }
    }), it.time || `Post ${i + 1}`);
  }));
}
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/creator-app/CreatorShared.jsx", error: String((e && e.message) || e) }); }

// ui_kits/creator-app/GrowthScreen.jsx
try { (() => {
/* Analytics — its own tab. One big chart, a metric switcher, and the rest
   as tiles. Nothing scrolls. */

function GrowthScreen({
  state = 'default'
}) {
  const {
    Icon,
    EmptyState
  } = window.NoniDesignSystem_710e43;
  const M = window.NONI_DATA.metrics;
  const keys = ['views', 'likes', 'followers', 'saves', 'comments', 'shares'];
  const [metric, setMetric] = React.useState('views');
  const [range, setRange] = React.useState('7D');
  const loading = state === 'loading';
  const m = M[metric];
  const r = m.ranges[range];
  if (state === 'unlinked' || state === 'empty') {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '8px 24px 0'
      }
    }, /*#__PURE__*/React.createElement("h1", {
      style: {
        margin: 0,
        font: '700 30px var(--font-display)',
        letterSpacing: 'var(--tracking-title)',
        color: 'var(--ink)'
      }
    }, "Analytics")), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        paddingBottom: 90
      }
    }, /*#__PURE__*/React.createElement(EmptyState, {
      icon: "chart-column",
      title: "No numbers yet",
      body: "Once your first posts go out, growth shows up here \u2014 views, likes, followers, saves."
    })));
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minHeight: 0,
      display: 'flex',
      flexDirection: 'column',
      padding: '8px 24px 96px',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      font: '700 30px var(--font-display)',
      letterSpacing: 'var(--tracking-title)',
      color: 'var(--ink)'
    }
  }, "Analytics"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 3,
      padding: 3,
      borderRadius: 999,
      background: 'var(--fill-quiet)'
    }
  }, ['7D', '30D', '90D'].map(k => /*#__PURE__*/React.createElement("button", {
    key: k,
    type: "button",
    onClick: () => setRange(k),
    "aria-pressed": range === k,
    style: {
      padding: '7px 11px',
      border: 'none',
      cursor: 'pointer',
      borderRadius: 999,
      background: range === k ? 'var(--white)' : 'transparent',
      boxShadow: range === k ? 'var(--shadow-card)' : 'none',
      color: range === k ? 'var(--ink)' : 'var(--slate-500)',
      font: '700 13px var(--font-ui)',
      transition: 'background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out)'
    }
  }, k)))), /*#__PURE__*/React.createElement(Dropdown, {
    value: metric,
    onChange: setMetric,
    options: keys.map(k => ({
      value: k,
      label: M[k].label,
      icon: M[k].icon
    })),
    style: {
      alignSelf: 'flex-start'
    }
  }), loading ? /*#__PURE__*/React.createElement(SkeletonCard, {
    height: 250
  }) : /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--white)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: 16,
      boxShadow: 'var(--shadow-card)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      font: '600 13px var(--font-ui)',
      color: 'var(--slate-500)',
      whiteSpace: 'nowrap'
    }
  }, m.label, " \xB7 last ", range === '7D' ? '7 days' : range === '30D' ? '30 days' : '90 days'), /*#__PURE__*/React.createElement("div", {
    style: {
      font: '700 34px var(--font-display)',
      letterSpacing: '-1px',
      color: 'var(--ink)',
      marginTop: 3
    }
  }, formatCount(r.total))), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      padding: '7px 12px',
      borderRadius: 999,
      background: 'var(--green-soft)',
      color: 'var(--green)',
      font: '700 13px var(--font-ui)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "trending-up",
    size: 14
  }), r.delta)), /*#__PURE__*/React.createElement(AreaChart, {
    key: metric + range,
    series: r.series,
    height: 120
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: 8,
      font: '600 12px var(--font-ui)',
      color: 'var(--slate-400)',
      whiteSpace: 'nowrap'
    }
  }, /*#__PURE__*/React.createElement("span", null, range === '7D' ? '7 days ago' : range === '30D' ? '30 days ago' : '90 days ago'), /*#__PURE__*/React.createElement("span", null, "Today"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gap: 8
    }
  }, keys.filter(k => k !== metric).slice(0, 3).map(k => /*#__PURE__*/React.createElement(MiniStat, {
    key: k,
    metric: M[k],
    range: range,
    onClick: () => setMetric(k)
  }))), /*#__PURE__*/React.createElement(SplitBar, {
    range: range
  }));
}
function formatCount(v) {
  if (v >= 1000000) return `${(v / 1000000).toFixed(v >= 10000000 ? 0 : 1)}M`;
  if (v >= 1000) return `${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}k`;
  return `${v}`;
}

/* Smooth area chart, drawn left to right on mount. */
function AreaChart({
  series,
  height = 132,
  color = 'var(--accent)'
}) {
  const [grow, setGrow] = React.useState(0);
  React.useLayoutEffect(() => {
    const t = setTimeout(() => setGrow(1), 20);
    return () => clearTimeout(t);
  }, []);
  const W = 320,
    H = height,
    pad = 10;
  const max = Math.max(...series),
    min = Math.min(...series);
  const span = Math.max(1, max - min);
  const pts = series.map((v, i) => [pad + i / (series.length - 1) * (W - pad * 2), pad + (1 - (v - min) / span) * (H - pad * 2)]);
  const line = pts.map((p, i) => {
    if (!i) return `M${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
    const q = pts[i - 1];
    const cx = (q[0] + p[0]) / 2;
    return `C${cx.toFixed(1)} ${q[1].toFixed(1)} ${cx.toFixed(1)} ${p[1].toFixed(1)} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
  }).join(' ');
  const area = `${line} L${W - pad} ${H} L${pad} ${H} Z`;
  const last = pts[pts.length - 1];
  const uid = React.useId().replace(/:/g, '');
  return /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12,
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: `0 0 ${W} ${H}`,
    width: "100%",
    height: H,
    preserveAspectRatio: "none",
    style: {
      display: 'block',
      overflow: 'visible'
    }
  }, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("linearGradient", {
    id: `g${uid}`,
    x1: "0",
    y1: "0",
    x2: "0",
    y2: "1"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0",
    stopColor: "#1BA6EE",
    stopOpacity: "0.26"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "1",
    stopColor: "#1BA6EE",
    stopOpacity: "0"
  })), /*#__PURE__*/React.createElement("clipPath", {
    id: `c${uid}`
  }, /*#__PURE__*/React.createElement("rect", {
    x: "0",
    y: "0",
    width: W * grow,
    height: H,
    style: {
      transition: 'width var(--dur-slow) var(--ease-out)'
    }
  }))), [0.25, 0.5, 0.75].map(f => /*#__PURE__*/React.createElement("line", {
    key: f,
    x1: pad,
    x2: W - pad,
    y1: pad + f * (H - pad * 2),
    y2: pad + f * (H - pad * 2),
    stroke: "var(--line)",
    strokeWidth: "1"
  })), /*#__PURE__*/React.createElement("g", {
    clipPath: `url(#c${uid})`
  }, /*#__PURE__*/React.createElement("path", {
    d: area,
    fill: `url(#g${uid})`
  }), /*#__PURE__*/React.createElement("path", {
    d: line,
    fill: "none",
    stroke: color,
    strokeWidth: "3",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    vectorEffect: "non-scaling-stroke"
  }))), /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      left: `${last[0] / W * 100}%`,
      top: last[1],
      width: 11,
      height: 11,
      marginLeft: -5.5,
      marginTop: -5.5,
      borderRadius: 999,
      background: 'var(--accent)',
      border: '2.5px solid var(--white)',
      boxShadow: 'var(--shadow-accent)',
      opacity: grow,
      transition: 'opacity var(--dur-base) var(--ease-out) 200ms'
    }
  }));
}
function MiniStat({
  metric,
  range,
  onClick
}) {
  const {
    Icon
  } = window.NoniDesignSystem_710e43;
  const r = metric.ranges[range];
  const max = Math.max(...r.series),
    min = Math.min(...r.series);
  const span = Math.max(1, max - min);
  const pts = r.series.map((v, i) => `${i / (r.series.length - 1) * 100},${26 - (v - min) / span * 22}`).join(' ');
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClick,
    style: {
      textAlign: 'left',
      cursor: 'pointer',
      background: 'var(--white)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      padding: 11,
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
      boxShadow: 'var(--shadow-card)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      font: '600 12px var(--font-ui)',
      color: 'var(--slate-500)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: metric.icon,
    size: 13,
    color: "var(--slate-400)"
  }), metric.label), /*#__PURE__*/React.createElement("span", {
    style: {
      font: '700 19px var(--font-display)',
      letterSpacing: '-0.4px',
      color: 'var(--ink)'
    }
  }, formatCount(r.total)), /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 100 28",
    width: "100%",
    height: "24",
    preserveAspectRatio: "none",
    style: {
      display: 'block'
    }
  }, /*#__PURE__*/React.createElement("polyline", {
    points: pts,
    fill: "none",
    stroke: "var(--blue-300)",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    vectorEffect: "non-scaling-stroke"
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      font: '700 11px var(--font-ui)',
      color: 'var(--green)'
    }
  }, r.delta));
}
function SplitBar({
  range
}) {
  const {
    Icon
  } = window.NoniDesignSystem_710e43;
  const s = window.NONI_DATA.metricSplit;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--white)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: 16,
      boxShadow: 'var(--shadow-card)',
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: '600 13px var(--font-ui)',
      color: 'var(--slate-500)'
    }
  }, "Where it came from \xB7 ", range), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      height: 10,
      borderRadius: 999,
      overflow: 'hidden',
      background: 'var(--fill-quiet)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: `${s.tiktok * 100}%`,
      background: 'var(--accent)',
      transition: 'width var(--dur-base) var(--ease-out)'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      width: `${s.instagram * 100}%`,
      background: 'var(--blue-300)'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      font: '600 13px var(--font-ui)',
      color: 'var(--ink)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "music-2",
    size: 14,
    color: "var(--accent)"
  }), "TikTok ", Math.round(s.tiktok * 100), "%"), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      font: '600 13px var(--font-ui)',
      color: 'var(--ink)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "at-sign",
    size: 14,
    color: "var(--blue-300)"
  }), "Instagram ", Math.round(s.instagram * 100), "%")));
}
Object.assign(window, {
  GrowthScreen,
  AreaChart,
  MiniStat,
  SplitBar,
  formatCount
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/creator-app/GrowthScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/creator-app/HomeScreen.jsx
try { (() => {
/* Home — Calendar (default) | Inspiration.
   Three posts a day, one on screen at a time: a tiny pager under the week
   strip, then one vertical card that fills whatever height is left. */

function HomeScreen({
  state = 'default',
  onOpenTask,
  onRecord,
  initialSeg = 0,
  initialDay = 2,
  initialSlot,
  initialSwap = false,
  animateSheet = true
}) {
  const {
    Icon,
    Wordmark,
    EmptyState
  } = window.NoniDesignSystem_710e43;
  const D = window.NONI_DATA;
  const [seg, setSeg] = React.useState(initialSeg);
  const [day, setDay] = React.useState(initialDay);
  const [queue, setQueue] = React.useState(D.today);
  const [swapSlot, setSwapSlot] = React.useState(initialSwap ? D.today[2] : null);
  const [swapped, setSwapped] = React.useState(null);
  const empty = state === 'empty';
  const loading = state === 'loading';
  const isToday = day === 2;
  const dayKey = D.weekStrip[day].key;
  const items = empty ? [] : isToday ? queue : (D.dayPlans[dayKey] || []).map((t, i) => ({
    ...t,
    id: `${dayKey}-${i}`
  }));
  const firstOpen = Math.max(0, items.findIndex(t => t.status === 'assigned'));
  const [slot, setSlot] = React.useState(initialSlot ?? firstOpen);
  React.useEffect(() => {
    setSlot(initialSlot ?? Math.max(0, items.findIndex(t => t.status === 'assigned')));
  }, [day]);
  React.useEffect(() => {
    if (!swapped) return;
    const t = setTimeout(() => setSwapped(null), 2400);
    return () => clearTimeout(t);
  }, [swapped]);
  const current = items[Math.min(slot, items.length - 1)];
  const pick = idea => {
    setQueue(q => q.map(c => c.id === swapSlot.id ? {
      ...c,
      title: idea.title,
      format: idea.format,
      hasScript: idea.hasScript,
      summary: idea.summary,
      duration: idea.duration,
      tags: idea.tags,
      trend: {
        platform: idea.platform,
        handle: idea.handle,
        views: idea.views,
        hook: idea.hook,
        why: idea.why
      }
    } : c));
    setSwapSlot(null);
    setSwapped(idea.title);
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      minHeight: 0,
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '6px 24px 0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement(Wordmark, {
    size: 19,
    capsule: true
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'relative',
      display: 'inline-flex'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "bell",
    size: 23,
    color: "var(--ink)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: -1,
      right: -1,
      width: 9,
      height: 9,
      borderRadius: 999,
      background: 'var(--accent)',
      border: '2px solid var(--white)'
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 24px 12px'
    }
  }, /*#__PURE__*/React.createElement(Segmented, {
    items: ['Calendar', 'Inspiration'],
    active: seg,
    onSelect: setSeg
  })), seg === 1 ? /*#__PURE__*/React.createElement(InspirationFeed, {
    state: state,
    onOpen: onOpenTask
  }) : /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minHeight: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      padding: '0 24px 96px'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      font: '700 24px/1.15 var(--font-display)',
      letterSpacing: 'var(--tracking-title)',
      color: 'var(--ink)'
    }
  }, D.creator.returning ? `Welcome back, ${D.creator.firstName}.` : 'Welcome'), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '4px 0 0',
      font: '400 14px var(--font-ui)',
      color: 'var(--slate-500)'
    }
  }, loading ? 'Building your day…' : empty ? 'Nothing queued yet.' : isToday ? `${items.filter(t => t.status === 'assigned').length} left to shoot today.` : `${items.length} planned.`)), /*#__PURE__*/React.createElement(WeekStrip, {
    days: D.weekStrip,
    active: day,
    onSelect: setDay
  }), loading ? /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minHeight: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(SkeletonCard, {
    height: 38,
    radius: "999px"
  }), /*#__PURE__*/React.createElement(SkeletonCard, {
    radius: "var(--radius-2xl)",
    height: "100%"
  })) : !items.length ? /*#__PURE__*/React.createElement(EmptyState, {
    icon: empty ? 'sparkles' : 'calendar-days',
    title: empty ? 'Nothing queued today' : 'Rest day',
    body: empty ? 'Your next batch lands tonight. Pull one from Inspiration if you want to shoot now.' : 'No posts planned. Ask for more volume and Noni fills it.',
    actionLabel: empty ? 'Open Inspiration' : undefined,
    onAction: () => setSeg(1),
    style: {
      padding: '30px 0'
    }
  }) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(PostPager, {
    items: items,
    active: Math.min(slot, items.length - 1),
    onSelect: setSlot
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minHeight: 0
    }
  }, /*#__PURE__*/React.createElement(PostCard, {
    key: current.id,
    task: current,
    onOpen: () => onOpenTask(current),
    onAction: () => onRecord(current),
    onSwap: isToday ? () => setSwapSlot(current) : undefined
  })))), swapSlot ? /*#__PURE__*/React.createElement(SwapSheet, {
    slot: swapSlot,
    animate: animateSheet,
    onPick: pick,
    onClose: () => setSwapSlot(null)
  }) : null, swapped ? /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 20,
      right: 20,
      bottom: 104,
      padding: '14px 18px',
      borderRadius: 16,
      background: 'var(--ink)',
      color: '#fff',
      font: '600 14px var(--font-ui)',
      boxShadow: 'var(--shadow-float)',
      zIndex: 60
    }
  }, "Swapped in \u201C", swapped, "\u201D.") : null);
}

/* One post, vertical, filling the space it is given. What sits under the
   frame depends on where the post is: shoot it, wait on it, or read it. */
function PostCard({
  task,
  onOpen,
  onAction,
  onSwap
}) {
  const {
    MediaCard,
    Button,
    Icon
  } = window.NoniDesignSystem_710e43;
  const isVideo = task.format === 'reel' || task.format === 'video';
  const done = task.status === 'posted' || task.status === 'approved';
  const waiting = task.status === 'submitted' || task.status === 'recorded';
  return /*#__PURE__*/React.createElement(MediaCard, {
    variant: "hero",
    fill: true,
    title: task.title,
    format: task.format,
    time: done ? `Posted ${task.time}` : `Posts ${task.time}`,
    duration: task.duration,
    onClick: onOpen,
    onPlay: onOpen,
    style: {
      height: '100%'
    }
  }, done ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '2px 2px 0'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '8px 12px',
      borderRadius: 999,
      background: 'var(--green-soft)',
      color: 'var(--green)',
      font: '700 13px var(--font-ui)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "circle-check-big",
    size: 14
  }), "Posted"), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      font: '600 13px var(--font-ui)',
      color: 'var(--slate-500)'
    }
  }, task.views || 'Counting views'), /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    variant: "ghost",
    onClick: e => {
      e.stopPropagation();
      onOpen();
    }
  }, "See it")) : waiting ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '2px 2px 0'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '8px 12px',
      borderRadius: 999,
      background: 'var(--amber-soft)',
      color: 'var(--amber)',
      font: '700 13px var(--font-ui)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "clock",
    size: 14
  }), "In review"), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      font: '600 13px var(--font-ui)',
      color: 'var(--slate-500)'
    }
  }, "Sent for approval"), /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    variant: "ghost",
    onClick: e => {
      e.stopPropagation();
      onOpen();
    }
  }, "See it")) : /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Button, {
    size: "md",
    icon: isVideo ? 'video' : 'images',
    onClick: e => {
      e.stopPropagation();
      onAction && onAction();
    },
    style: {
      flex: 1
    }
  }, isVideo ? 'Record' : 'Create'), onSwap ? /*#__PURE__*/React.createElement(Button, {
    size: "md",
    variant: "tint",
    icon: "rotate-ccw",
    onClick: e => {
      e.stopPropagation();
      onSwap();
    }
  }, "Swap") : null));
}

/* Inspiration — makeable posts as frames, two up. Tap one to see it. */
function InspirationFeed({
  state = 'default',
  onOpen
}) {
  const {
    MediaCard,
    EmptyState
  } = window.NoniDesignSystem_710e43;
  const D = window.NONI_DATA;
  const [fmt, setFmt] = React.useState('all');
  const list = fmt === 'all' ? D.inspiration : D.inspiration.filter(i => i.format === fmt);
  const loading = state === 'loading';
  const empty = state === 'empty';
  const open = i => onOpen && onOpen({
    ...i,
    status: 'assigned',
    time: null,
    trend: {
      platform: i.platform,
      handle: i.handle,
      views: i.views,
      hook: i.hook,
      why: i.why
    }
  });
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minHeight: 0,
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 24px'
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      font: '700 24px var(--font-display)',
      letterSpacing: 'var(--tracking-title)',
      color: 'var(--ink)'
    }
  }, "Makeable now"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '4px 0 0',
      font: '400 14px var(--font-ui)',
      color: 'var(--slate-500)'
    }
  }, "Posts that fit your pillars, filmed with what you have."), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 0 10px'
    }
  }, /*#__PURE__*/React.createElement(Dropdown, {
    value: fmt,
    onChange: setFmt,
    options: [{
      value: 'all',
      label: 'Everything'
    }, {
      value: 'reel',
      label: 'Reels',
      icon: 'video'
    }, {
      value: 'slideshow',
      label: 'Slideshows',
      icon: 'images'
    }]
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minHeight: 0,
      overflowY: 'auto',
      padding: '0 24px 110px'
    }
  }, loading ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 10
    }
  }, [0, 1, 2, 3].map(i => /*#__PURE__*/React.createElement(SkeletonCard, {
    key: i,
    height: 186
  }))) : empty || !list.length ? /*#__PURE__*/React.createElement(EmptyState, {
    icon: "sparkles",
    title: "No ideas yet",
    body: "Noni scrapes TikTok and Instagram every morning. Check back after the next pull."
  }) : /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 10
    }
  }, list.map(i => /*#__PURE__*/React.createElement(MediaCard, {
    key: i.id,
    variant: "tile",
    title: i.title,
    format: i.format,
    duration: i.duration,
    meta: `@${i.handle} · ${i.views}`,
    mediaHeight: 150,
    onClick: () => open(i),
    onPlay: () => open(i)
  })))));
}
Object.assign(window, {
  HomeScreen,
  InspirationFeed,
  PostCard
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/creator-app/HomeScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/creator-app/PostsScreen.jsx
try { (() => {
/* Posts — month calendar (default) or list. Neither view scrolls the page;
   only the day/list panel scrolls when a day is busy. */

function PostsScreen({
  state = 'default',
  onGoConnect,
  initialView = 'calendar'
}) {
  const {
    Icon,
    EmptyState
  } = window.NoniDesignSystem_710e43;
  const D = window.NONI_DATA;
  const [view, setView] = React.useState(initialView);
  const [accts, setAccts] = React.useState(['instagram', 'tiktok']);
  const [sort, setSort] = React.useState('time');
  const [sel, setSel] = React.useState(D.month.today);
  const loading = state === 'loading';
  const empty = state === 'empty';
  const unlinked = state === 'unlinked';
  const active = accts.length ? accts : ['instagram', 'tiktok'];
  const toggle = k => setAccts(a => a.includes(k) ? a.filter(x => x !== k) : [...a, k]);
  const all = [...D.postDays, ...D.postDaysOlder].flatMap(d => d.posts).filter(p => active.includes(p.platform));
  const SORTS = {
    time: 'Newest',
    virality: 'Virality',
    likes: 'Likes',
    views: 'Views'
  };
  const sorted = sort === 'time' ? all : [...all].sort((a, b) => b[sort] - a[sort]);
  const dayPosts = (D.postsByDate[sel] || []).filter(p => active.includes(p.platform));
  if (unlinked) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0
      }
    }, /*#__PURE__*/React.createElement(Header, {
      view: view,
      setView: setView,
      disabled: true
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        paddingBottom: 90
      }
    }, /*#__PURE__*/React.createElement(EmptyState, {
      icon: "link",
      title: "Link your accounts to see your posts",
      body: "Connect Instagram and TikTok in Profile. Noni pulls views, likes and follower growth from there.",
      actionLabel: "Go to Profile",
      onAction: onGoConnect
    })));
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      minHeight: 0
    }
  }, /*#__PURE__*/React.createElement(Header, {
    view: view,
    setView: setView
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 24px 0',
      display: 'flex',
      gap: 8
    }
  }, [['instagram', 'at-sign', 'Instagram'], ['tiktok', 'music-2', 'TikTok']].map(([k, icon, label]) => {
    const on = accts.includes(k);
    return /*#__PURE__*/React.createElement("button", {
      key: k,
      type: "button",
      onClick: () => toggle(k),
      "aria-pressed": on,
      style: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 7,
        padding: '10px 12px',
        borderRadius: 999,
        cursor: 'pointer',
        background: on ? 'var(--blue-100)' : 'var(--white)',
        border: `1.5px solid ${on ? 'transparent' : 'var(--border-strong)'}`,
        color: on ? 'var(--blue-700)' : 'var(--slate-500)',
        font: '700 14px var(--font-ui)',
        transition: 'background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out)'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: icon,
      size: 17
    }), label);
  })), view === 'calendar' ? /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minHeight: 0,
      display: 'flex',
      flexDirection: 'column',
      padding: '14px 24px 96px'
    }
  }, /*#__PURE__*/React.createElement(MonthGrid, {
    month: D.month,
    counts: D.postsByDate,
    active: active,
    sel: sel,
    onSelect: setSel,
    loading: loading || empty
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14,
      flex: 1,
      minHeight: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      font: '700 17px var(--font-display)',
      letterSpacing: '-0.3px',
      color: 'var(--ink)'
    }
  }, sel === D.month.today ? 'Today' : `${sel} July`), /*#__PURE__*/React.createElement("span", {
    style: {
      font: '400 13px var(--font-ui)',
      color: 'var(--slate-500)'
    }
  }, dayPosts.length ? `${dayPosts.length} post${dayPosts.length > 1 ? 's' : ''}` : 'Nothing posted')), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minHeight: 0,
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, loading ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(SkeletonCard, {
    height: 72
  }), /*#__PURE__*/React.createElement(SkeletonCard, {
    height: 72
  })) : dayPosts.length ? dayPosts.map(p => /*#__PURE__*/React.createElement(PostRow, {
    key: p.id,
    post: p
  })) : /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '10px 0 0',
      font: '400 14px var(--font-ui)',
      color: 'var(--slate-400)'
    }
  }, "Nothing went out on this day.")))) : /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minHeight: 0,
      display: 'flex',
      flexDirection: 'column',
      padding: '14px 24px 96px'
    }
  }, /*#__PURE__*/React.createElement(Dropdown, {
    label: "Sort:",
    value: sort,
    onChange: setSort,
    options: [{
      value: 'time',
      label: 'Newest'
    }, {
      value: 'virality',
      label: 'Virality'
    }, {
      value: 'likes',
      label: 'Likes'
    }, {
      value: 'views',
      label: 'Views'
    }],
    style: {
      alignSelf: 'flex-start',
      marginBottom: 10
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minHeight: 0,
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, loading ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(SkeletonCard, {
    height: 72
  }), /*#__PURE__*/React.createElement(SkeletonCard, {
    height: 72
  }), /*#__PURE__*/React.createElement(SkeletonCard, {
    height: 72
  })) : empty || !sorted.length ? /*#__PURE__*/React.createElement(EmptyState, {
    icon: "layout-list",
    title: "Nothing posted yet",
    body: "Record what is on Home. Approved posts land here with their numbers."
  }) : sorted.map(p => /*#__PURE__*/React.createElement(PostRow, {
    key: p.id,
    post: p,
    showDate: true
  })))));
}
function Header({
  view,
  setView,
  disabled
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '8px 24px 0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      font: '700 30px var(--font-display)',
      letterSpacing: 'var(--tracking-title)',
      color: 'var(--ink)'
    }
  }, "Posts"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 3,
      padding: 3,
      borderRadius: 999,
      background: 'var(--fill-quiet)',
      opacity: disabled ? 0.4 : 1
    }
  }, [['calendar', 'calendar-days'], ['list', 'layout-list']].map(([k, icon]) => {
    const on = view === k;
    const {
      Icon
    } = window.NoniDesignSystem_710e43;
    return /*#__PURE__*/React.createElement("button", {
      key: k,
      type: "button",
      disabled: disabled,
      onClick: () => setView(k),
      "aria-label": k,
      style: {
        padding: '8px 14px',
        border: 'none',
        borderRadius: 999,
        cursor: disabled ? 'default' : 'pointer',
        background: on ? 'var(--white)' : 'transparent',
        boxShadow: on ? 'var(--shadow-card)' : 'none',
        display: 'inline-flex',
        transition: 'background var(--dur-fast) var(--ease-out)'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: icon,
      size: 18,
      color: on ? 'var(--ink)' : 'var(--slate-400)'
    }));
  })));
}
function MonthGrid({
  month,
  counts,
  active,
  sel,
  onSelect,
  loading
}) {
  const cells = [];
  for (let i = 0; i < month.firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= month.days; d++) cells.push(d);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--white)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: 14,
      boxShadow: 'var(--shadow-card)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: '700 15px var(--font-display)',
      letterSpacing: '-0.2px',
      color: 'var(--ink)'
    }
  }, month.label), /*#__PURE__*/React.createElement("span", {
    style: {
      font: '600 12px var(--font-ui)',
      color: 'var(--slate-400)'
    }
  }, "Tap a day")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7,1fr)',
      gap: 2
    }
  }, ['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      textAlign: 'center',
      font: '700 11px var(--font-ui)',
      color: 'var(--slate-400)',
      paddingBottom: 4
    }
  }, d)), cells.map((d, i) => {
    if (!d) return /*#__PURE__*/React.createElement("span", {
      key: `e${i}`
    });
    const n = loading ? 0 : (counts[d] || []).filter(p => active.includes(p.platform)).length;
    const on = d === sel;
    const today = d === month.today;
    return /*#__PURE__*/React.createElement("button", {
      key: d,
      type: "button",
      onClick: () => onSelect(d),
      style: {
        aspectRatio: '1 / 1',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        border: 'none',
        borderRadius: 10,
        cursor: 'pointer',
        background: on ? 'var(--accent)' : today ? 'var(--blue-100)' : 'transparent',
        transition: 'background var(--dur-fast) var(--ease-out)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        font: '700 13px var(--font-ui)',
        color: on ? 'var(--white)' : today ? 'var(--blue-700)' : n ? 'var(--ink)' : 'var(--slate-300)'
      }
    }, d), /*#__PURE__*/React.createElement("span", {
      style: {
        height: 5,
        display: 'flex',
        gap: 2
      }
    }, Array.from({
      length: Math.min(n, 3)
    }).map((_, k) => /*#__PURE__*/React.createElement("span", {
      key: k,
      style: {
        width: 4,
        height: 4,
        borderRadius: 999,
        background: on ? 'rgba(255,255,255,0.9)' : 'var(--blue-300)'
      }
    }))));
  })));
}
function PostRow({
  post,
  showDate
}) {
  const {
    Icon
  } = window.NoniDesignSystem_710e43;
  const n = v => v >= 1000 ? `${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}k` : `${v}`;
  const CPM = 1.5,
    TIER = 20;
  const earned = post.views / 1000 * CPM;
  const next = Math.floor(earned / TIER) * TIER + TIER;
  const toGo = Math.round((next - earned) / CPM * 1000);
  const pct = earned % TIER / TIER * 100;
  return /*#__PURE__*/React.createElement("article", {
    style: {
      background: 'var(--white)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      padding: 12,
      display: 'flex',
      gap: 12,
      alignItems: 'stretch',
      boxShadow: 'var(--shadow-card)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 40,
      flex: '0 0 40px',
      borderRadius: 10,
      background: 'linear-gradient(160deg,#E7F4FD 0%,#DCE7F0 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: post.format === 'slideshow' ? 'images' : 'play',
    size: 15,
    color: "var(--slate-400)"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      font: '600 12px var(--font-ui)',
      color: 'var(--slate-400)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: post.platform === 'instagram' ? 'at-sign' : 'music-2',
    size: 13
  }), showDate ? `${post.day.replace('jul', '')} Jul · ` : '', post.time, post.virality >= 90 ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      padding: '3px 8px',
      borderRadius: 999,
      background: 'var(--green-soft)',
      color: 'var(--green)',
      font: '700 11px var(--font-ui)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "trending-up",
    size: 11
  }), "Top ", 100 - post.virality + 1, "%") : null), /*#__PURE__*/React.createElement("div", {
    style: {
      font: '700 14px/1.35 var(--font-ui)',
      color: 'var(--ink)',
      letterSpacing: '-0.2px',
      display: '-webkit-box',
      WebkitLineClamp: 1,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden'
    }
  }, post.title), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 14,
      font: '600 12px var(--font-ui)',
      color: 'var(--slate-500)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "eye",
    size: 13
  }), n(post.views)), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "zap",
    size: 13
  }), n(post.likes))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 2,
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: '800 13px var(--font-ui)',
      color: 'var(--green)'
    }
  }, "$", earned.toFixed(2)), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      height: 5,
      borderRadius: 999,
      background: 'var(--fill-quiet)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      height: '100%',
      width: `${pct}%`,
      background: 'var(--green)',
      transition: 'width var(--dur-base) var(--ease-out)'
    }
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      font: '600 11px var(--font-ui)',
      color: 'var(--slate-500)',
      whiteSpace: 'nowrap'
    }
  }, n(toGo), " views to $", next))));
}
Object.assign(window, {
  PostsScreen,
  PostRow,
  MonthGrid
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/creator-app/PostsScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/creator-app/ProfileScreen.jsx
try { (() => {
/* Profile — identity, wallet, connected accounts, settings and the App Store
   compliance rows. Fits without scrolling. */

function ProfileScreen({
  state = 'default'
}) {
  const {
    Icon,
    Button,
    StatusChip
  } = window.NoniDesignSystem_710e43;
  const D = window.NONI_DATA;
  const loading = state === 'loading';
  const unlinked = state === 'unlinked' || state === 'empty';
  const acc = D.accounts;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minHeight: 0,
      display: 'flex',
      flexDirection: 'column',
      padding: '8px 24px 96px'
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      font: '700 30px var(--font-display)',
      letterSpacing: 'var(--tracking-title)',
      color: 'var(--ink)'
    }
  }, "Profile"), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '16px 0 0',
      display: 'flex',
      alignItems: 'center',
      gap: 14
    }
  }, loading ? /*#__PURE__*/React.createElement(SkeletonCard, {
    height: 58,
    radius: "999px"
  }) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 58,
      height: 58,
      borderRadius: 999,
      background: 'var(--blue-100)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      font: '800 22px var(--font-display)',
      color: 'var(--blue-700)'
    }
  }, "F"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: '700 19px var(--font-display)',
      letterSpacing: '-0.3px',
      color: 'var(--ink)'
    }
  }, D.creator.name), /*#__PURE__*/React.createElement("div", {
    style: {
      font: '400 13px var(--font-ui)',
      color: 'var(--slate-500)',
      marginTop: 2
    }
  }, "@", D.creator.handle, " \xB7 FieldVision AI")), /*#__PURE__*/React.createElement(Button, {
    variant: "outline",
    size: "sm",
    onClick: () => {}
  }, "Edit"))), /*#__PURE__*/React.createElement(Group, {
    title: "Balance"
  }, /*#__PURE__*/React.createElement(Row, {
    icon: "dollar-sign",
    label: "Wallet",
    value: "$1,240 pending",
    chevron: true
  })), /*#__PURE__*/React.createElement(Group, {
    title: "Accounts"
  }, /*#__PURE__*/React.createElement(ConnectRow, {
    icon: "at-sign",
    label: "Instagram",
    data: acc.instagram,
    unlinked: unlinked
  }), /*#__PURE__*/React.createElement(ConnectRow, {
    icon: "music-2",
    label: "TikTok",
    data: acc.tiktok,
    unlinked: unlinked
  })), /*#__PURE__*/React.createElement(Group, {
    title: "Settings"
  }, /*#__PURE__*/React.createElement(Row, {
    icon: "bell",
    label: "Notifications",
    value: "Tasks, review",
    chevron: true
  }), /*#__PURE__*/React.createElement(Row, {
    icon: "clock",
    label: "Posting windows",
    value: "3 a day",
    chevron: true
  })), /*#__PURE__*/React.createElement(Group, {
    title: "Legal and support"
  }, /*#__PURE__*/React.createElement(Row, {
    icon: "message-circle",
    label: "Contact support",
    chevron: true
  }), /*#__PURE__*/React.createElement(Row, {
    icon: "circle-alert",
    label: "Privacy and terms",
    chevron: true
  }), /*#__PURE__*/React.createElement(Row, {
    icon: "trash-2",
    label: "Delete account",
    danger: true,
    chevron: true
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    size: "sm",
    block: true,
    icon: "log-out",
    onClick: () => {}
  }, "Sign out"), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      font: '400 12px var(--font-ui)',
      color: 'var(--slate-400)',
      marginTop: 6
    }
  }, "Noni 1.4.0 \xB7 FieldVision AI")));
}
function Group({
  title,
  children
}) {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      paddingTop: 18
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: '0 0 8px',
      font: '700 12px var(--font-ui)',
      letterSpacing: 'var(--tracking-label)',
      textTransform: 'uppercase',
      color: 'var(--slate-500)'
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--white)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-card)'
    }
  }, children));
}
function Row({
  icon,
  label,
  value,
  chevron,
  danger
}) {
  const {
    Icon
  } = window.NoniDesignSystem_710e43;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '13px 14px',
      borderBottom: '1px solid var(--line)',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 19,
    color: danger ? 'var(--danger)' : 'var(--slate-400)'
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      font: '600 15px var(--font-ui)',
      color: danger ? 'var(--danger)' : 'var(--ink)'
    }
  }, label), value ? /*#__PURE__*/React.createElement("span", {
    style: {
      font: '400 13px var(--font-ui)',
      color: 'var(--slate-500)'
    }
  }, value) : null, chevron ? /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-right",
    size: 17,
    color: "var(--slate-300)"
  }) : null);
}
function ConnectRow({
  icon,
  label,
  data,
  unlinked
}) {
  const {
    Icon,
    Button,
    StatusChip
  } = window.NoniDesignSystem_710e43;
  const on = !unlinked && data.connected;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '12px 14px',
      borderBottom: '1px solid var(--line)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 19,
    color: "var(--slate-400)"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: '600 15px var(--font-ui)',
      color: 'var(--ink)'
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      font: '400 12px var(--font-ui)',
      color: 'var(--slate-500)',
      marginTop: 1
    }
  }, on ? `@${data.handle} · ${data.followers} followers` : 'Not connected')), on ? /*#__PURE__*/React.createElement(StatusChip, {
    status: "approved",
    label: "Connected"
  }) : /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    onClick: () => {}
  }, "Connect"));
}
Object.assign(window, {
  ProfileScreen,
  Group,
  Row,
  ConnectRow
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/creator-app/ProfileScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/creator-app/RecordScreen.jsx
try { (() => {
function RecordScreen({
  task,
  onClose,
  onSubmitted
}) {
  const {
    TeleprompterOverlay,
    Button,
    Icon
  } = window.NoniDesignSystem_710e43;
  const [phase, setPhase] = React.useState('idle'); // idle | countdown | recording | review
  const [count, setCount] = React.useState(3);
  const [speed, setSpeed] = React.useState(1);
  const [word, setWord] = React.useState(0);
  const [elapsed, setElapsed] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const script = task.script.split('\n\n')[0];
  React.useEffect(() => {
    if (phase !== 'countdown') return;
    if (count === 0) {
      setPhase('recording');
      setElapsed(0);
      setWord(0);
      return;
    }
    const t = setTimeout(() => setCount(c => c - 1), 800);
    return () => clearTimeout(t);
  }, [phase, count]);
  React.useEffect(() => {
    if (phase !== 'recording' || paused) return;
    const t = setInterval(() => {
      setElapsed(e => e + 0.25);
      setWord(w => w + 1);
    }, 250 / speed);
    return () => clearInterval(t);
  }, [phase, paused, speed]);
  const total = 90;
  const fmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  if (phase === 'review') {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        position: 'relative',
        background: 'var(--ink-900)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(180deg,#1b2430,#0b0f14)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "play",
      size: 64,
      color: "rgba(255,255,255,0.85)"
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        top: 8,
        left: 18,
        right: 18,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => setPhase('idle'),
      style: {
        border: 'none',
        background: 'transparent',
        color: '#fff',
        font: '700 16px var(--font-ui)',
        cursor: 'pointer'
      }
    }, "Back"), /*#__PURE__*/React.createElement("span", {
      style: {
        font: '700 15px var(--font-ui)',
        color: '#fff'
      }
    }, fmt(elapsed), " take"), /*#__PURE__*/React.createElement("span", {
      style: {
        width: 40
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        left: 20,
        right: 20,
        bottom: 34,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        alignItems: 'center'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        font: '600 13px var(--font-ui)',
        color: 'rgba(255,255,255,0.8)'
      }
    }, "One clip. Clips post as one video."), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 12,
        width: '100%'
      }
    }, /*#__PURE__*/React.createElement(Button, {
      size: "md",
      variant: "ghost",
      onClick: () => {
        setPhase('idle');
        setElapsed(0);
      },
      style: {
        flex: 1,
        background: 'rgba(255,255,255,0.18)',
        color: '#fff'
      }
    }, "Retake all"), /*#__PURE__*/React.createElement(Button, {
      size: "md",
      onClick: onSubmitted,
      style: {
        flex: 1.4
      }
    }, "Send for review"))));
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      position: 'relative',
      background: 'var(--ink-900)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'radial-gradient(120% 80% at 50% 20%, #33414f 0%, #131a22 70%)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 4,
      left: 16,
      right: 16,
      height: 5,
      display: 'flex',
      gap: 3,
      zIndex: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      flex: Math.min(elapsed, total) / total,
      background: phase === 'recording' ? '#fff' : 'var(--accent)',
      borderRadius: 3
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1 - Math.min(elapsed, total) / total
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 12,
      left: 16,
      right: 16,
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      zIndex: 15
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClose,
    style: {
      border: 'none',
      background: 'transparent',
      color: '#fff',
      font: '700 16px var(--font-ui)',
      cursor: 'pointer',
      width: 56,
      textAlign: 'left'
    }
  }, "Close"), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      textAlign: 'center',
      font: '700 15px var(--font-ui)',
      color: '#fff',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  }, task.title), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 56
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 46,
      left: 0,
      right: 0
    },
    onClick: () => phase === 'recording' && setPaused(p => !p)
  }, /*#__PURE__*/React.createElement(TeleprompterOverlay, {
    text: script,
    wordIndex: phase === 'recording' ? word : 0,
    paused: paused,
    speed: speed
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      right: 12,
      top: 300,
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      zIndex: 15
    }
  }, /*#__PURE__*/React.createElement(RailBtn, {
    label: "Flash"
  }), phase !== 'recording' ? /*#__PURE__*/React.createElement(RailBtn, {
    label: "Flip"
  }) : null), phase === 'countdown' ? /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 20
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: '800 96px var(--font-display)',
      color: '#fff'
    }
  }, count), /*#__PURE__*/React.createElement("span", {
    style: {
      font: '600 14px var(--font-ui)',
      color: 'rgba(255,255,255,0.7)'
    }
  }, "Tap to cancel")) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 20,
      right: 20,
      bottom: 30,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 14,
      zIndex: 15
    }
  }, phase === 'recording' ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    style: {
      font: '800 18px var(--font-ui)',
      color: '#fff'
    }
  }, fmt(elapsed), " / ", fmt(total)), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setPhase('review'),
    "aria-label": "Stop",
    style: {
      width: 76,
      height: 76,
      borderRadius: 999,
      border: '4px solid #fff',
      background: 'rgba(0,0,0,0.35)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 28,
      height: 28,
      borderRadius: 6,
      background: 'var(--accent)'
    }
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      font: '600 13px var(--font-ui)',
      color: 'rgba(255,255,255,0.8)'
    }
  }, "Stop saves this clip")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, [0.75, 1, 1.25, 1.5].map(s => /*#__PURE__*/React.createElement("button", {
    key: s,
    type: "button",
    onClick: () => setSpeed(s),
    style: {
      padding: '8px 12px',
      borderRadius: 999,
      border: 'none',
      cursor: 'pointer',
      background: speed === s ? 'var(--accent)' : 'rgba(255,255,255,0.2)',
      color: '#fff',
      font: '700 13px var(--font-ui)'
    }
  }, s, "x"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => {
      setCount(3);
      setPhase('countdown');
    },
    "aria-label": "Record",
    style: {
      width: 84,
      height: 84,
      borderRadius: 999,
      border: '4px solid #fff',
      background: 'transparent',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 64,
      height: 64,
      borderRadius: 999,
      background: 'var(--accent)'
    }
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      font: '600 13px var(--font-ui)',
      color: 'rgba(255,255,255,0.8)',
      textAlign: 'center'
    }
  }, "1:30 left")))));
}
function RailBtn({
  label
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      padding: '10px 12px',
      borderRadius: 999,
      background: 'rgba(0,0,0,0.45)',
      border: '1px solid rgba(255,255,255,0.4)',
      color: '#fff',
      font: '700 13px var(--font-ui)'
    }
  }, label);
}
Object.assign(window, {
  RecordScreen,
  RailBtn
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/creator-app/RecordScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/creator-app/ScreenBoard.jsx
try { (() => {
/* Every creator-app screen and state, side by side. */
function ScreenBoard() {
  const D = window.NONI_DATA;
  const task = D.today[0];
  const noScript = D.today[1];
  const groups = [{
    title: 'Home — Calendar',
    note: 'Never scrolls. Three posts a day, one at a time: green when it is out, amber while it is in review, blue when it is still to shoot.',
    items: [['Today — to shoot', /*#__PURE__*/React.createElement(HomeScreen, {
      state: "default",
      onOpenTask: () => {},
      onRecord: () => {}
    })], ['Today — posted', /*#__PURE__*/React.createElement(HomeScreen, {
      state: "default",
      initialSlot: 0,
      onOpenTask: () => {},
      onRecord: () => {}
    })], ['Today — in review', /*#__PURE__*/React.createElement(HomeScreen, {
      state: "default",
      initialSlot: 1,
      onOpenTask: () => {},
      onRecord: () => {}
    })], ['Another day', /*#__PURE__*/React.createElement(HomeScreen, {
      state: "default",
      initialDay: 3,
      onOpenTask: () => {},
      onRecord: () => {}
    })], ['Rest day', /*#__PURE__*/React.createElement(HomeScreen, {
      state: "default",
      initialDay: 6,
      onOpenTask: () => {},
      onRecord: () => {}
    })], ['Loading', /*#__PURE__*/React.createElement(HomeScreen, {
      state: "loading",
      onOpenTask: () => {},
      onRecord: () => {}
    })], ['Empty', /*#__PURE__*/React.createElement(HomeScreen, {
      state: "empty",
      onOpenTask: () => {},
      onRecord: () => {}
    })]]
  }, {
    title: 'Home — Swap and Inspiration',
    note: 'Swap shows the same format and pillars as the slot. Tap a frame to take it.',
    items: [['Swap sheet', /*#__PURE__*/React.createElement(HomeScreen, {
      state: "default",
      initialSwap: true,
      animateSheet: false,
      onOpenTask: () => {},
      onRecord: () => {}
    })], ['Inspiration', /*#__PURE__*/React.createElement(HomeScreen, {
      state: "default",
      initialSeg: 1,
      onOpenTask: () => {},
      onRecord: () => {}
    })], ['Inspiration, loading', /*#__PURE__*/React.createElement(HomeScreen, {
      state: "loading",
      initialSeg: 1,
      onOpenTask: () => {},
      onRecord: () => {}
    })], ['Inspiration, empty', /*#__PURE__*/React.createElement(HomeScreen, {
      state: "empty",
      initialSeg: 1,
      onOpenTask: () => {},
      onRecord: () => {}
    })]]
  }, {
    title: 'Posts',
    note: 'Month calendar by default; list view adds a sort menu. Tap a day to see what went out.',
    items: [['Calendar', /*#__PURE__*/React.createElement(PostsScreen, {
      state: "default",
      onGoConnect: () => {}
    })], ['List + sort', /*#__PURE__*/React.createElement(PostsScreen, {
      state: "default",
      initialView: "list",
      onGoConnect: () => {}
    })], ['Loading', /*#__PURE__*/React.createElement(PostsScreen, {
      state: "loading",
      onGoConnect: () => {}
    })], ['No accounts linked', /*#__PURE__*/React.createElement(PostsScreen, {
      state: "unlinked",
      onGoConnect: () => {}
    })]]
  }, {
    title: 'Analytics',
    note: 'One chart, one metric at a time, three ranges. Everything else is a tile.',
    items: [['Growth', /*#__PURE__*/React.createElement(GrowthScreen, {
      state: "default"
    })], ['Loading', /*#__PURE__*/React.createElement(GrowthScreen, {
      state: "loading"
    })], ['Empty', /*#__PURE__*/React.createElement(GrowthScreen, {
      state: "empty"
    })]]
  }, {
    title: 'Profile',
    note: 'Identity, wallet, connect status, settings, and the App Store compliance rows.',
    items: [['Connected', /*#__PURE__*/React.createElement(ProfileScreen, {
      state: "default"
    })], ['Not connected', /*#__PURE__*/React.createElement(ProfileScreen, {
      state: "unlinked"
    })]]
  }, {
    title: 'Task and record',
    note: 'The example to copy, a short description, one action. No hook, script or caption on screen.',
    items: [['Task', /*#__PURE__*/React.createElement(TaskDetailScreen, {
      task: task,
      onBack: () => {},
      onRecord: () => {}
    })], ['Task, no script', /*#__PURE__*/React.createElement(TaskDetailScreen, {
      task: {
        ...noScript,
        hasScript: false
      },
      onBack: () => {},
      onRecord: () => {}
    })], ['Record', /*#__PURE__*/React.createElement(RecordScreen, {
      task: task,
      onClose: () => {},
      onSubmitted: () => {}
    }), true]]
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 56,
      padding: '48px 40px 80px'
    }
  }, /*#__PURE__*/React.createElement("header", {
    style: {
      maxWidth: 720
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: '700 12px var(--font-ui)',
      letterSpacing: 'var(--tracking-label)',
      textTransform: 'uppercase',
      color: 'var(--slate-500)'
    }
  }, "Noni \xB7 Creator app"), /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: '10px 0 0',
      font: '700 44px/1.05 var(--font-display)',
      letterSpacing: 'var(--tracking-hero)',
      color: 'var(--ink)'
    }
  }, "Every screen and state"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '14px 0 0',
      font: '400 16px/1.5 var(--font-ui)',
      color: 'var(--slate-500)'
    }
  }, "Home \xB7 Posts \xB7 Analytics \xB7 Profile, plus task and record. Frames first, no walls of text, and nothing scrolls except feeds.")), groups.map(g => /*#__PURE__*/React.createElement("section", {
    key: g.title,
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 20
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      font: '700 26px var(--font-display)',
      letterSpacing: 'var(--tracking-title)',
      color: 'var(--ink)'
    }
  }, g.title), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '6px 0 0',
      font: '400 15px/1.5 var(--font-ui)',
      color: 'var(--slate-500)',
      maxWidth: 640
    }
  }, g.note)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 32
    }
  }, g.items.map(([label, node, dark]) => /*#__PURE__*/React.createElement(Phone, {
    key: label,
    label: label,
    dark: dark
  }, node))))));
}
Object.assign(window, {
  ScreenBoard
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/creator-app/ScreenBoard.jsx", error: String((e && e.message) || e) }); }

// ui_kits/creator-app/TaskDetailScreen.jsx
try { (() => {
/* Task — the example to copy, a short description, and the action.
   No hook / script / caption: Noni writes the caption and the teleprompter
   carries the script into the recorder. Never scrolls. */

function TaskDetailScreen({
  task,
  onBack,
  onRecord
}) {
  const {
    Icon,
    Button,
    StatusChip
  } = window.NoniDesignSystem_710e43;
  const [playing, setPlaying] = React.useState(false);
  const isVideo = task.format === 'video' || task.format === 'reel';
  const formatLabel = isVideo ? 'Reel' : 'Slideshow';
  const t = task.trend || {};
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      minHeight: 0
    }
  }, /*#__PURE__*/React.createElement(NavBar, {
    title: "Task",
    onBack: onBack
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minHeight: 0,
      display: 'flex',
      flexDirection: 'column',
      padding: '0 24px',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: () => setPlaying(p => !p),
    style: {
      position: 'relative',
      height: 292,
      borderRadius: 'var(--radius-2xl)',
      cursor: 'pointer',
      background: playing ? 'var(--ink-900)' : 'linear-gradient(160deg,#E7F4FD 0%,#DCE7F0 100%)',
      boxShadow: 'var(--shadow-media)',
      overflow: 'hidden',
      transition: 'background var(--dur-base) var(--ease-out)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: 12,
      left: 12,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '7px 12px',
      borderRadius: 999,
      background: playing ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.92)',
      color: playing ? 'var(--white)' : 'var(--ink)',
      font: '700 12px var(--font-ui)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: t.platform === 'instagram' ? 'at-sign' : 'music-2',
    size: 13
  }), t.handle ? `@${t.handle}` : 'Example', t.views ? ` · ${t.views}` : ''), /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      left: '50%',
      top: '50%',
      transform: 'translate(-50%,-50%)',
      width: 62,
      height: 62,
      borderRadius: 999,
      background: playing ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.92)',
      boxShadow: playing ? 'none' : 'var(--shadow-media)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: playing ? 'pause' : 'play',
    size: 26,
    color: playing ? 'var(--white)' : 'var(--ink)'
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      left: 16,
      right: 16,
      bottom: 16,
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      height: 4,
      borderRadius: 999,
      background: playing ? 'rgba(255,255,255,0.28)' : 'rgba(15,23,32,0.12)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      height: '100%',
      width: playing ? '38%' : '0%',
      background: playing ? 'var(--white)' : 'var(--accent)',
      transition: 'width var(--dur-slow) var(--ease-out)'
    }
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      font: '700 12px var(--font-ui)',
      color: playing ? 'var(--white)' : 'var(--slate-500)'
    }
  }, task.duration || '0:35'))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(StatusChip, {
    status: task.status
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      font: '600 13px var(--font-ui)',
      color: 'var(--slate-400)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: isVideo ? 'video' : 'images',
    size: 15
  }), formatLabel), task.time ? /*#__PURE__*/React.createElement("span", {
    style: {
      font: '600 13px var(--font-ui)',
      color: 'var(--slate-400)'
    }
  }, "Posts ", task.time) : null), /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      font: '700 26px/1.18 var(--font-display)',
      letterSpacing: '-0.5px',
      color: 'var(--ink)'
    }
  }, task.title), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      font: '400 15px/1.5 var(--font-ui)',
      color: 'var(--slate-500)'
    }
  }, task.summary || 'Copy the example in your own words. Noni writes the caption and posts it once it is approved.')), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 24px 30px',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      background: 'var(--white)'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    block: true,
    icon: isVideo ? 'video' : 'images',
    onClick: onRecord
  }, isVideo ? 'Record' : 'Create slides'), /*#__PURE__*/React.createElement("span", {
    style: {
      textAlign: 'center',
      font: '400 12px var(--font-ui)',
      color: 'var(--slate-400)'
    }
  }, task.hasScript ? 'Your script runs in the teleprompter.' : 'No script — say it your way.')));
}
function NavBar({
  title,
  onBack,
  action
}) {
  const {
    Icon
  } = window.NoniDesignSystem_710e43;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '6px 18px 14px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onBack,
    "aria-label": "Back",
    style: {
      border: 'none',
      background: 'transparent',
      cursor: 'pointer',
      padding: 6,
      display: 'inline-flex'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-left",
    size: 26,
    color: "var(--ink)"
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      textAlign: 'center',
      font: '700 15px var(--font-ui)',
      color: 'var(--ink)'
    }
  }, title), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 38,
      display: 'flex',
      justifyContent: 'flex-end'
    }
  }, action));
}
Object.assign(window, {
  TaskDetailScreen,
  NavBar
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/creator-app/TaskDetailScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/creator-app/creator-data.js
try { (() => {
/* Creator-app content for the Home / Posts / Profile shell.
   FieldVision AI (football technology) is the tenant, so every task,
   idea and post below is football-themed. */
(function () {
  const D = window.NONI_DATA;
  const trend = (platform, handle, views, hook, why) => ({
    platform,
    handle,
    views,
    hook,
    why
  });

  /* Today's queue — never more than three. Posting windows come from the
     brand's plan: up to three sends a day once the creator approves. */
  D.today = [{
    id: 'd1',
    slot: 0,
    summary: 'Set the phone on the fence, film the session, show the clips it produced. No talking to camera needed until the last line.',
    duration: '0:35',
    title: 'The 90-second tripod setup every coach copies',
    format: 'reel',
    status: 'posted',
    time: '08:30',
    hasScript: true,
    views: '41k views',
    tags: ['training', 'outdoor'],
    hook: 'You do not need a camera crew. You need one phone and a fence.',
    script: 'You do not need a camera crew. You need one phone and a fence.\n\nClamp it at the halfway line, chest height, press record, walk away.\n\nFieldVision tags the session while you coach. Clips are waiting before the drive home.',
    caption: 'Setup takes 90 seconds. Clamp we use is in bio. #footballcoach',
    trend: trend('tiktok', 'coachlensuk', '860K views', 'The £14 clamp every coach films with', 'Cheap-gear hooks convert: price in the first two seconds.')
  }, {
    id: 'd2',
    slot: 1,
    summary: 'Four slides, one number each. Finish on the stat nobody tracks.',
    duration: '4 slides',
    title: '3 numbers that decide Sunday',
    format: 'slideshow',
    status: 'submitted',
    time: '13:00',
    hasScript: false,
    tags: ['stats', 'homemade yapping'],
    hook: 'Three numbers decide most youth matches. None of them are goals.',
    script: 'Slide 1: Three numbers decide most youth matches.\n\nSlide 2: Recoveries in the final third.\n\nSlide 3: Passes before a shot.\n\nSlide 4: Distance covered after minute 70.',
    caption: 'Save this before Sunday. Comment STATS and I will send the template.',
    trend: trend('instagram', 'd1.keeper', '480K views', 'Nobody talks about keeper distribution', 'One stat, one claim, one CTA. Nothing else on screen.')
  }, {
    id: 'd3',
    slot: 2,
    summary: 'Talk through the goal-kick data the way you would on the touchline. Keep it under 45 seconds.',
    duration: '0:42',
    title: 'What a 31% possession drop actually looks like',
    format: 'reel',
    status: 'assigned',
    time: '18:45',
    hasScript: true,
    tags: ['stats', 'training'],
    hook: 'We tagged 400 goal kicks from one U16 season.',
    script: 'We tagged 400 goal kicks from one U16 season.\n\nEvery time the ball went long, possession dropped to 31%.\n\nSame keeper, same squad. The only change was where the first pass went.',
    caption: 'Two goals a month, gone. Full breakdown at the link in bio. #u16',
    trend: trend('tiktok', 'sundayleaguetape', '2.1M views', 'I tagged 400 goal kicks so you do not have to', 'Absurd effort in the hook buys 30 seconds of attention.')
  }];

  /* Seven-day strip. today = index 2 (Wednesday). */
  D.weekStrip = [{
    key: 'mon',
    dow: 'M',
    date: 27,
    label: 'Mon 27',
    posts: 3,
    windows: ['08:30', '13:00', '18:45'],
    done: true
  }, {
    key: 'tue',
    dow: 'T',
    date: 28,
    label: 'Tue 28',
    posts: 2,
    windows: ['09:00', '17:30'],
    done: true
  }, {
    key: 'wed',
    dow: 'W',
    date: 29,
    label: 'Today',
    posts: 3,
    windows: ['08:30', '13:00', '18:45'],
    today: true
  }, {
    key: 'thu',
    dow: 'T',
    date: 30,
    label: 'Thu 30',
    posts: 3,
    windows: ['08:30', '13:00', '18:45']
  }, {
    key: 'fri',
    dow: 'F',
    date: 31,
    label: 'Fri 31',
    posts: 2,
    windows: ['09:15', '19:00']
  }, {
    key: 'sat',
    dow: 'S',
    date: 1,
    label: 'Sat 1',
    posts: 1,
    windows: ['11:00']
  }, {
    key: 'sun',
    dow: 'S',
    date: 2,
    label: 'Sun 2',
    posts: 0,
    windows: []
  }];
  D.dayPlans = {
    mon: [{
      title: 'Half-time talk, but with data',
      format: 'reel',
      status: 'posted',
      time: '08:30'
    }, {
      title: '4 drills we tagged this week',
      format: 'slideshow',
      status: 'posted',
      time: '13:00'
    }, {
      title: 'Reading a pass map in 20 seconds',
      format: 'reel',
      status: 'posted',
      time: '18:45'
    }],
    tue: [{
      title: 'One phone, one fence, one season',
      format: 'reel',
      status: 'posted',
      time: '09:00'
    }, {
      title: 'The stat sheet parents actually read',
      format: 'slideshow',
      status: 'posted',
      time: '17:30'
    }],
    thu: [{
      title: 'Why your winger fades after minute 70',
      format: 'reel',
      status: 'assigned',
      time: '08:30',
      hasScript: true
    }, {
      title: 'Five drills, one camera angle',
      format: 'slideshow',
      status: 'assigned',
      time: '13:00'
    }, {
      title: 'Tagging a session while you coach it',
      format: 'reel',
      status: 'assigned',
      time: '18:45',
      hasScript: true
    }],
    fri: [{
      title: 'The £14 clamp we film with',
      format: 'slideshow',
      status: 'assigned',
      time: '09:15'
    }, {
      title: 'Pre-match walkthrough, tagged live',
      format: 'reel',
      status: 'assigned',
      time: '19:00',
      hasScript: true
    }],
    sat: [{
      title: 'Match day from one tripod',
      format: 'reel',
      status: 'assigned',
      time: '11:00',
      hasScript: true
    }],
    sun: []
  };

  /* Inspiration FYP — makeable posts, each tagged so Swap can filter to
     the same format and pillars as the slot it replaces. */
  D.inspiration = [{
    id: 'i1',
    summary: 'Hold up the clamp, show the price, then the shot it gets you.',
    duration: '0:28',
    format: 'reel',
    tags: ['training', 'outdoor'],
    platform: 'tiktok',
    handle: 'coachlensuk',
    views: '860K views',
    hook: 'The £14 clamp every coach films with',
    why: 'Cheap-gear hooks convert: price in the first two seconds.',
    hasScript: true,
    title: 'The £14 clamp every coach films with'
  }, {
    id: 'i2',
    summary: 'Film 10 seconds of the session before you say a word.',
    duration: '0:31',
    format: 'reel',
    tags: ['training', 'outdoor'],
    platform: 'tiktok',
    handle: 'fabri.d1soccer',
    views: '1.2M views',
    hook: 'POV: your coach films every session now',
    why: 'Opens mid-action, no intro, and the payoff lands in 4 seconds.',
    hasScript: true,
    title: 'POV: your coach films every session now'
  }, {
    id: 'i3',
    summary: 'Park up after training and say the one thing that annoyed you.',
    duration: '0:44',
    format: 'reel',
    tags: ['training', 'homemade yapping'],
    platform: 'instagram',
    handle: 'gaffer.notes',
    views: '310K views',
    hook: 'Talking to the camera in the car after training',
    why: 'Zero production. The car makes it feel like a real thought.',
    hasScript: false,
    title: 'Post-training thoughts, filmed in the car'
  }, {
    id: 'i4',
    summary: 'Four slides: the stat, the proof, the fix, the ask.',
    duration: '4 slides',
    format: 'slideshow',
    tags: ['stats', 'homemade yapping'],
    platform: 'instagram',
    handle: 'd1.keeper',
    views: '480K views',
    hook: 'Nobody talks about keeper distribution',
    why: 'One stat, one claim, one CTA. Nothing else on screen.',
    hasScript: false,
    title: 'Nobody talks about keeper distribution'
  }, {
    id: 'i5',
    summary: 'One chart, one claim. Let the number do the work.',
    duration: '6 slides',
    format: 'slideshow',
    tags: ['stats', 'training'],
    platform: 'tiktok',
    handle: 'sundayleaguetape',
    views: '2.1M views',
    hook: 'I tagged 400 goal kicks so you do not have to',
    why: 'Absurd effort in the hook buys 30 seconds of attention.',
    hasScript: false,
    title: '400 goal kicks, one chart'
  }, {
    id: 'i6',
    summary: 'The numbers parents ask about, one per slide.',
    duration: '5 slides',
    format: 'slideshow',
    tags: ['stats', 'homemade yapping'],
    platform: 'instagram',
    handle: 'academy.dad',
    views: '95K views',
    hook: 'The four numbers I send parents every Sunday',
    why: 'Named audience in the hook. Parents share it themselves.',
    hasScript: false,
    title: 'The four numbers parents ask for'
  }, {
    id: 'i7',
    summary: 'Two angles side by side, then say which one you would keep.',
    duration: '0:36',
    format: 'reel',
    tags: ['outdoor', 'stats'],
    platform: 'tiktok',
    handle: 'pitchsidebrief',
    views: '640K views',
    hook: 'Filming from the fence beats filming from the touchline',
    why: 'A rule you can argue with. Comments do the reach.',
    hasScript: true,
    title: 'Fence angle beats touchline angle'
  }, {
    id: 'i8',
    summary: 'Five rondos, one page. Built to be screenshotted.',
    duration: '5 slides',
    format: 'slideshow',
    tags: ['training', 'outdoor'],
    platform: 'tiktok',
    handle: 'u16sessions',
    views: '220K views',
    hook: 'Five rondo variations, one page',
    why: 'Save-bait. Coaches screenshot the whole carousel.',
    hasScript: false,
    title: 'Five rondo variations, one page'
  }];
  D.accounts = {
    instagram: {
      connected: true,
      handle: 'fabri.d1soccer',
      followers: '18.4k'
    },
    tiktok: {
      connected: true,
      handle: 'fabri.d1soccer',
      followers: '42.7k'
    }
  };
  const post = (id, day, platform, format, title, time, views, likes, virality) => ({
    id,
    day,
    platform,
    format,
    title,
    time,
    views,
    likes,
    virality
  });

  /* Past posts, newest first, grouped by day in Posts. */
  D.postDays = [{
    key: 'jul29',
    label: 'Today',
    sub: 'Wed 29 Jul',
    posts: [post('p1', 'jul29', 'tiktok', 'reel', 'Half-time talk, but with data', '08:30', 41200, 3810, 94)]
  }, {
    key: 'jul28',
    label: 'Yesterday',
    sub: 'Tue 28 Jul',
    posts: [post('p2', 'jul28', 'instagram', 'slideshow', 'The stat sheet parents actually read', '17:30', 18600, 2140, 71), post('p3', 'jul28', 'tiktok', 'reel', 'One phone, one fence, one season', '09:00', 96400, 11200, 98)]
  }, {
    key: 'jul27',
    label: 'Mon 27 Jul',
    sub: '3 posts',
    posts: [post('p4', 'jul27', 'tiktok', 'reel', 'Reading a pass map in 20 seconds', '18:45', 12800, 940, 44), post('p5', 'jul27', 'instagram', 'slideshow', '4 drills we tagged this week', '13:00', 22100, 3020, 66), post('p6', 'jul27', 'tiktok', 'slideshow', '3 stats that win Sunday', '08:30', 51900, 6400, 88)]
  }, {
    key: 'jul26',
    label: 'Sun 26 Jul',
    sub: '1 post',
    posts: [post('p7', 'jul26', 'instagram', 'reel', 'Match day from one tripod', '11:00', 8700, 610, 31)]
  }, {
    key: 'jul25',
    label: 'Sat 25 Jul',
    sub: '2 posts',
    posts: [post('p8', 'jul25', 'tiktok', 'reel', 'The tripod setup that took 90 seconds', '19:00', 132000, 15400, 99), post('p9', 'jul25', 'instagram', 'slideshow', 'The £14 clamp we film with', '09:15', 14300, 1780, 52)]
  }, {
    key: 'jul24',
    label: 'Fri 24 Jul',
    sub: '2 posts',
    posts: [post('p10', 'jul24', 'tiktok', 'reel', 'Why your winger fades after minute 70', '18:45', 74500, 8900, 91), post('p11', 'jul24', 'instagram', 'reel', 'Keeper distribution, explained', '08:30', 26800, 3310, 74)]
  }, {
    key: 'jul23',
    label: 'Thu 23 Jul',
    sub: '1 post',
    posts: [post('p12', 'jul23', 'tiktok', 'slideshow', 'Five drills, one camera angle', '13:00', 33900, 4120, 68)]
  }];
  D.postDaysOlder = [{
    key: 'jul22',
    label: 'Wed 22 Jul',
    sub: '2 posts',
    posts: [post('p13', 'jul22', 'tiktok', 'reel', 'Tagging a session while you coach it', '08:30', 58200, 6900, 84), post('p14', 'jul22', 'instagram', 'slideshow', 'The four numbers parents ask for', '17:30', 11400, 1290, 39)]
  }, {
    key: 'jul21',
    label: 'Tue 21 Jul',
    sub: '1 post',
    posts: [post('p15', 'jul21', 'tiktok', 'reel', 'Fence angle beats touchline angle', '19:00', 88700, 10400, 93)]
  }, {
    key: 'jul20',
    label: 'Mon 20 Jul',
    sub: '2 posts',
    posts: [post('p16', 'jul20', 'instagram', 'reel', 'Pre-match walkthrough, tagged live', '09:00', 19200, 2260, 57), post('p17', 'jul20', 'tiktok', 'slideshow', 'Five rondo variations, one page', '13:00', 43100, 5180, 79)]
  }];

  /* Growth metrics. Each series is cumulative-ish daily totals, newest last. */
  const ramp = (start, end, n, jitter) => Array.from({
    length: n
  }, (_, i) => {
    const t = i / (n - 1);
    const base = start + (end - start) * Math.pow(t, 0.92);
    const wobble = Math.sin(i * 1.7) * jitter + Math.sin(i * 0.6) * jitter * 0.6;
    return Math.max(0, Math.round(base + wobble));
  });
  D.metrics = {
    views: {
      label: 'Views',
      icon: 'eye',
      unit: '',
      ranges: {
        '7D': {
          total: 621000,
          delta: '+18%',
          up: true,
          series: ramp(42000, 96000, 7, 5200)
        },
        '30D': {
          total: 2140000,
          delta: '+64%',
          up: true,
          series: ramp(21000, 96000, 30, 6400)
        },
        '90D': {
          total: 4870000,
          delta: '+210%',
          up: true,
          series: ramp(6000, 96000, 90, 5600)
        }
      }
    },
    likes: {
      label: 'Likes',
      icon: 'zap',
      unit: '',
      ranges: {
        '7D': {
          total: 74500,
          delta: '+11%',
          up: true,
          series: ramp(5200, 12400, 7, 900)
        },
        '30D': {
          total: 246000,
          delta: '+41%',
          up: true,
          series: ramp(3100, 12400, 30, 1100)
        },
        '90D': {
          total: 592000,
          delta: '+156%',
          up: true,
          series: ramp(900, 12400, 90, 900)
        }
      }
    },
    followers: {
      label: 'Followers',
      icon: 'users',
      unit: '',
      ranges: {
        '7D': {
          total: 61100,
          delta: '+2.4k',
          up: true,
          series: ramp(58700, 61100, 7, 140)
        },
        '30D': {
          total: 61100,
          delta: '+9.8k',
          up: true,
          series: ramp(51300, 61100, 30, 190)
        },
        '90D': {
          total: 61100,
          delta: '+34k',
          up: true,
          series: ramp(27100, 61100, 90, 240)
        }
      }
    },
    saves: {
      label: 'Saves',
      icon: 'inbox',
      unit: '',
      ranges: {
        '7D': {
          total: 12800,
          delta: '+26%',
          up: true,
          series: ramp(980, 2600, 7, 210)
        },
        '30D': {
          total: 41200,
          delta: '+58%',
          up: true,
          series: ramp(520, 2600, 30, 260)
        },
        '90D': {
          total: 96400,
          delta: '+184%',
          up: true,
          series: ramp(140, 2600, 90, 220)
        }
      }
    },
    comments: {
      label: 'Comments',
      icon: 'message-circle',
      unit: '',
      ranges: {
        '7D': {
          total: 3140,
          delta: '+7%',
          up: true,
          series: ramp(310, 620, 7, 60)
        },
        '30D': {
          total: 11600,
          delta: '+22%',
          up: true,
          series: ramp(190, 620, 30, 70)
        },
        '90D': {
          total: 27400,
          delta: '+96%',
          up: true,
          series: ramp(60, 620, 90, 60)
        }
      }
    },
    shares: {
      label: 'Shares',
      icon: 'share-2',
      unit: '',
      ranges: {
        '7D': {
          total: 8900,
          delta: '+31%',
          up: true,
          series: ramp(640, 1840, 7, 150)
        },
        '30D': {
          total: 29800,
          delta: '+72%',
          up: true,
          series: ramp(320, 1840, 30, 180)
        },
        '90D': {
          total: 68200,
          delta: '+240%',
          up: true,
          series: ramp(90, 1840, 90, 160)
        }
      }
    }
  };

  /* Split by account, for the last 30 days. */
  D.metricSplit = {
    tiktok: 0.68,
    instagram: 0.32
  };
  D.analytics = {
    views: {
      total: '621k',
      delta: '+18%',
      series: [42, 51, 38, 66, 59, 88, 96]
    },
    likes: {
      total: '74.5k',
      delta: '+11%',
      series: [5, 7, 4, 9, 8, 11, 12]
    },
    following: {
      total: '61.1k',
      delta: '+2.4k',
      series: [55, 56, 57, 58, 59, 60, 61]
    },
    days: ['Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed']
  };
  /* July 2026 month view. Jul 1 2026 is a Wednesday. */
  D.month = {
    label: 'July 2026',
    days: 31,
    firstWeekday: 3,
    today: 29
  };
  D.postsByDate = {};
  [...D.postDays, ...D.postDaysOlder].forEach(d => {
    const day = Number(d.key.replace('jul', ''));
    D.postsByDate[day] = d.posts;
  });
  [1, 2, 5, 8, 13, 16, 17, 18, 19].forEach((day, i) => {
    D.postsByDate[day] = D.postsByDate[day] || D.postDays[i % D.postDays.length].posts.slice(0, i % 3 + 1).map((p, k) => ({
      ...p,
      id: `m${day}-${k}`
    }));
  });
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/creator-app/creator-data.js", error: String((e && e.message) || e) }); }

// ui_kits/onboarding/AuthScreens.jsx
try { (() => {
function LoginScreen({
  onNext
}) {
  const {
    Wordmark,
    TextField,
    Button
  } = window.NoniDesignSystem_710e43;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 24px 30px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      gap: 28
    }
  }, /*#__PURE__*/React.createElement(Wordmark, {
    size: 38,
    capsule: true
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      font: '700 34px/1.12 var(--font-display)',
      letterSpacing: '-0.5px',
      color: 'var(--ink)'
    }
  }, "Sign in"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      font: '400 16px/1.5 var(--font-ui)',
      color: 'var(--slate-500)'
    }
  }, "We'll email you a link. No password to forget.")), /*#__PURE__*/React.createElement(TextField, {
    label: "Email",
    type: "email",
    value: "elan@fieldvision.ai"
  })), /*#__PURE__*/React.createElement(Button, {
    block: true,
    onClick: onNext
  }, "Email me a link"));
}
function MagicLinkScreen({
  onNext
}) {
  const {
    Wordmark,
    Icon,
    Button
  } = window.NoniDesignSystem_710e43;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 24px 30px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 18,
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 84,
      height: 84,
      borderRadius: 999,
      background: 'var(--blue-100)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "link",
    size: 34,
    color: "var(--blue-500)"
  })), /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      font: '700 30px/1.15 var(--font-display)',
      letterSpacing: '-0.5px',
      color: 'var(--ink)'
    }
  }, "Check your email"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      maxWidth: 280,
      font: '400 16px/1.5 var(--font-ui)',
      color: 'var(--slate-500)'
    }
  }, "We sent a link to elan@fieldvision.ai. Open it on this phone and you're in.")), /*#__PURE__*/React.createElement(Button, {
    block: true,
    variant: "tint",
    onClick: onNext
  }, "I opened the link"));
}
Object.assign(window, {
  LoginScreen,
  MagicLinkScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/onboarding/AuthScreens.jsx", error: String((e && e.message) || e) }); }

// ui_kits/onboarding/BrandStudyScreen.jsx
try { (() => {
function BrandStudyScreen({
  onDone
}) {
  const {
    ProgressBar,
    Icon,
    Wordmark
  } = window.NoniDesignSystem_710e43;
  const PHASES = ['Reading your site', 'Watching your posts', 'Learning your voice'];
  const [phase, setPhase] = React.useState(0);
  React.useEffect(() => {
    if (phase >= PHASES.length) {
      const t = setTimeout(onDone, 900);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setPhase(p => p + 1), 1600);
    return () => clearTimeout(t);
  }, [phase]);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 24px 40px',
      background: 'var(--blue-50)'
    }
  }, /*#__PURE__*/React.createElement(Wordmark, {
    size: 20,
    tone: "blue"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      gap: 30
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      font: '700 34px/1.12 var(--font-display)',
      letterSpacing: '-0.6px',
      color: 'var(--ink)'
    }
  }, "Give us 60 seconds."), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      font: '400 17px/1.5 var(--font-ui)',
      color: 'var(--slate-500)'
    }
  }, "We're studying your brand so every script sounds like you.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, PHASES.map((p, i) => {
    const done = i < phase,
      active = i === phase;
    return /*#__PURE__*/React.createElement("div", {
      key: p,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        opacity: done || active ? 1 : 0.35,
        transition: 'opacity var(--dur-base) var(--ease-out)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 30,
        height: 30,
        borderRadius: 999,
        background: done ? 'var(--blue-500)' : active ? 'var(--white)' : 'transparent',
        border: done ? 'none' : '2px solid var(--blue-200)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, done ? /*#__PURE__*/React.createElement(Icon, {
      name: "check",
      size: 16,
      color: "#fff"
    }) : active ? /*#__PURE__*/React.createElement("span", {
      style: {
        width: 9,
        height: 9,
        borderRadius: 999,
        background: 'var(--blue-500)'
      }
    }) : null), /*#__PURE__*/React.createElement("span", {
      style: {
        font: `${active ? 700 : 500} 17px var(--font-ui)`,
        color: done || active ? 'var(--ink)' : 'var(--slate-400)'
      }
    }, p));
  })), /*#__PURE__*/React.createElement(ProgressBar, {
    variant: "bar",
    step: phase,
    total: PHASES.length
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      textAlign: 'center',
      font: '500 13px var(--font-ui)',
      color: 'var(--slate-400)'
    }
  }, "You can edit everything we find."));
}
Object.assign(window, {
  BrandStudyScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/onboarding/BrandStudyScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/onboarding/CompanyFlow.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const COMPANY_TOTAL = 13;
const TONES = ['Professional', 'Friendly', 'Playful', 'Bold', 'Unhinged'];
const TONE_CAPTIONS = ['FieldVision AI gives you the data to improve every week. See it in action at the link in bio.', 'We built FieldVision AI because getting better should feel simple. Come see how it works.', 'POV: you found FieldVision AI before everyone else did. Your future self says thanks.', 'Most people guess. FieldVision users know. Stop guessing.', 'not to be dramatic but FieldVision AI is basically a cheat code and gatekeeping it would be a crime'];
function CompanyFlow({
  onFinish
}) {
  const {
    Wordmark,
    Button,
    TextField,
    OptionCard,
    Chip,
    Stepper,
    ToneSlider,
    Icon
  } = window.NoniDesignSystem_710e43;
  const [step, setStep] = React.useState(0);
  const [buying, setBuying] = React.useState('link');
  const [pillars, setPillars] = React.useState(['Match-day breakdowns', 'Coach tips']);
  const [tone, setTone] = React.useState(2);
  const [cadence, setCadence] = React.useState(3);
  const [approvers, setApprovers] = React.useState('just_me');
  const next = () => setStep(s => s + 1);
  const back = step > 0 ? () => setStep(s => s === 4 ? 2 : s - 1) : undefined;
  const togglePillar = p => setPillars(l => l.includes(p) ? l.filter(x => x !== p) : [...l, p]);
  const shell = props => /*#__PURE__*/React.createElement(StepShell, _extends({
    step: step,
    total: COMPANY_TOTAL,
    onBack: back,
    onExit: () => {},
    onPrimary: next
  }, props));
  if (step === 0) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 24px 30px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 22
      }
    }, /*#__PURE__*/React.createElement(Wordmark, {
      size: 44,
      capsule: true
    }), /*#__PURE__*/React.createElement("h1", {
      style: {
        margin: 0,
        font: '700 34px/1.12 var(--font-display)',
        letterSpacing: '-0.6px',
        color: 'var(--ink)'
      }
    }, "Noni studies your brand, plans your content, and fills your creators' queues."), /*#__PURE__*/React.createElement("p", {
      style: {
        margin: 0,
        font: '400 17px/1.5 var(--font-ui)',
        color: 'var(--slate-500)'
      }
    }, "You just approve.")), /*#__PURE__*/React.createElement(Button, {
      block: true,
      onClick: next
    }, "Get started"));
  }
  if (step === 1) return shell({
    title: 'What are you called?',
    subtitle: "We'll read your site to learn how you talk.",
    primaryLabel: 'Next',
    children: /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 12
      }
    }, /*#__PURE__*/React.createElement(TextField, {
      label: "Company name",
      value: "FieldVision AI"
    }), /*#__PURE__*/React.createElement(TextField, {
      label: "Website",
      type: "url",
      value: "fieldvision.ai"
    }))
  });
  if (step === 2) return shell({
    title: 'Where do you post?',
    subtitle: 'We watch these accounts to see what already works.',
    primaryLabel: 'Study my brand',
    onPrimary: () => setStep(3),
    children: /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 12
      }
    }, /*#__PURE__*/React.createElement(TextField, {
      label: "TikTok",
      value: "@fieldvision.ai"
    }), /*#__PURE__*/React.createElement(TextField, {
      label: "Instagram",
      value: "@fieldvision.ai"
    }))
  });
  if (step === 3) return /*#__PURE__*/React.createElement(BrandStudyScreen, {
    onDone: () => setStep(4)
  });
  if (step === 4) return shell({
    title: 'Who is your customer?',
    subtitle: 'We drafted this from your site. Fix anything that feels off.',
    primaryLabel: 'Looks right',
    children: /*#__PURE__*/React.createElement(TextField, {
      multiline: true,
      rows: 4,
      value: "Grassroots and academy coaches at U14\u2013U18 level, plus ambitious parents who film matches on a phone."
    })
  });
  if (step === 5) return shell({
    title: 'What are you selling?',
    primaryLabel: 'Looks right',
    children: /*#__PURE__*/React.createElement(TextField, {
      multiline: true,
      rows: 4,
      value: "An app that tags football matches from one phone on a tripod: pass maps, sprint counts, and clips coaches can send the squad the same night."
    })
  });
  if (step === 6) return shell({
    title: 'How do people buy?',
    primaryLabel: 'Next',
    children: /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 10
      }
    }, /*#__PURE__*/React.createElement(OptionCard, {
      icon: "link",
      label: "Link in bio",
      hint: "Most creators start here.",
      selected: buying === 'link',
      onClick: () => setBuying('link')
    }), /*#__PURE__*/React.createElement(OptionCard, {
      icon: "message-circle",
      label: "DMs",
      hint: "A keyword in comments opens the chat.",
      selected: buying === 'dms',
      onClick: () => setBuying('dms')
    }), /*#__PURE__*/React.createElement(OptionCard, {
      icon: "at-sign",
      label: "Website",
      hint: "Straight to a landing page.",
      selected: buying === 'web',
      onClick: () => setBuying('web')
    }))
  });
  if (step === 7) return shell({
    title: 'Your content pillars',
    subtitle: 'From your last 40 posts. Keep what fits, add your own.',
    primaryLabel: `Keep ${pillars.length} pillars`,
    primaryDisabled: pillars.length === 0,
    children: /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 8,
        flexWrap: 'wrap'
      }
    }, ['Match-day breakdowns', 'Coach tips', 'Keeper play', 'Gear on a budget', 'Parent guides'].map(p => /*#__PURE__*/React.createElement(Chip, {
      key: p,
      label: p,
      selected: pillars.includes(p),
      onClick: () => togglePillar(p)
    })), /*#__PURE__*/React.createElement(Chip, {
      label: "Add your own",
      icon: "plus"
    }))
  });
  if (step === 8) return shell({
    title: 'How should captions sound?',
    subtitle: 'Drag it. The example rewrites as you go.',
    primaryLabel: `Sounds ${TONES[tone].toLowerCase()}`,
    children: /*#__PURE__*/React.createElement(ToneSlider, {
      tones: TONES,
      value: tone,
      onChange: setTone,
      caption: TONE_CAPTIONS[tone]
    })
  });
  if (step === 9) return shell({
    title: 'How often should each creator post?',
    primaryLabel: 'Next',
    children: /*#__PURE__*/React.createElement(Stepper, {
      value: cadence,
      onChange: setCadence,
      unit: "posts per creator, per week"
    })
  });
  if (step === 10) return shell({
    title: 'Who approves content?',
    primaryLabel: 'Next',
    children: /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 10
      }
    }, /*#__PURE__*/React.createElement(OptionCard, {
      icon: "circle-user-round",
      label: "Just me",
      hint: "Every post waits for you.",
      selected: approvers === 'just_me',
      onClick: () => setApprovers('just_me')
    }), /*#__PURE__*/React.createElement(OptionCard, {
      icon: "users",
      label: "Me and others",
      hint: "Anyone on the list can approve.",
      selected: approvers === 'team',
      onClick: () => setApprovers('team')
    }))
  });
  if (step === 11) return shell({
    title: 'Invite your creators',
    subtitle: 'They sign in, connect their accounts, and their first tasks are waiting.',
    primaryLabel: 'Share invite link',
    footNote: 'You can add more later from Settings.',
    onPrimary: next,
    children: /*#__PURE__*/React.createElement("div", {
      style: {
        background: 'var(--surface-sunken)',
        borderRadius: 18,
        padding: 18,
        display: 'flex',
        alignItems: 'center',
        gap: 12
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "link",
      size: 20,
      color: "var(--slate-400)"
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        font: '600 14px var(--font-mono)',
        color: 'var(--ink)',
        wordBreak: 'break-all'
      }
    }, "noni.app/join/fieldvision-9f2c"))
  });
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 24px 30px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 18,
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 84,
      height: 84,
      borderRadius: 999,
      background: 'var(--green-soft)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "circle-check-big",
    size: 36,
    color: "var(--green)"
  })), /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      font: '700 30px/1.15 var(--font-display)',
      letterSpacing: '-0.5px',
      color: 'var(--ink)'
    }
  }, "Your first week is already planned"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      maxWidth: 290,
      font: '400 16px/1.5 var(--font-ui)',
      color: 'var(--slate-500)'
    }
  }, "Twelve tasks are in your creators' queues, built from what's working in your niche this week.")), /*#__PURE__*/React.createElement(Button, {
    block: true,
    onClick: onFinish
  }, "Open the calendar"));
}
Object.assign(window, {
  CompanyFlow,
  TONES,
  TONE_CAPTIONS
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/onboarding/CompanyFlow.jsx", error: String((e && e.message) || e) }); }

// ui_kits/onboarding/CreatorFlow.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function CreatorFlow({
  onFinish
}) {
  const {
    Button,
    TextField,
    OptionCard,
    Icon,
    TeleprompterOverlay,
    Wordmark
  } = window.NoniDesignSystem_710e43;
  const TOTAL = 5;
  const [step, setStep] = React.useState(0);
  const next = () => setStep(s => s + 1);
  const back = step > 0 ? () => setStep(s => s - 1) : undefined;
  const shell = props => /*#__PURE__*/React.createElement(StepShell, _extends({
    step: step,
    total: TOTAL,
    onBack: back,
    onExit: () => {},
    onPrimary: next
  }, props));
  if (step === 0) return shell({
    title: "What's your name?",
    subtitle: 'Your admin sees this next to every task.',
    primaryLabel: 'Next',
    children: /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 16
      }
    }, /*#__PURE__*/React.createElement(TextField, {
      label: "Full name",
      value: "Fabri Duarte"
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 14
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 64,
        height: 64,
        borderRadius: 999,
        background: 'var(--fill-quiet)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "camera",
      size: 24,
      color: "var(--slate-400)"
    })), /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      variant: "tint"
    }, "Take a selfie")))
  });
  if (step === 1) return shell({
    title: 'Camera and mic',
    subtitle: 'Both are needed to shoot with the teleprompter. Nothing records until you press the button.',
    primaryLabel: 'Allow both',
    children: /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 10
      }
    }, /*#__PURE__*/React.createElement(OptionCard, {
      icon: "camera",
      label: "Camera",
      hint: "So you can film your takes in the app.",
      selected: true
    }), /*#__PURE__*/React.createElement(OptionCard, {
      icon: "mic",
      label: "Microphone",
      hint: "So we capture your voice with the video.",
      selected: true
    }))
  });
  if (step === 2) return shell({
    title: 'Connect your accounts',
    subtitle: 'Approved content posts straight to these. Nothing posts without an approval.',
    primaryLabel: 'Next',
    children: /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 10
      }
    }, /*#__PURE__*/React.createElement(OptionCard, {
      icon: "music-2",
      label: "TikTok",
      hint: "@fabri.d1soccer connected",
      selected: true
    }), /*#__PURE__*/React.createElement(OptionCard, {
      icon: "at-sign",
      label: "Instagram",
      hint: "Tap to connect"
    }))
  });
  if (step === 3) return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      minHeight: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '6px 18px 8px',
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: back,
    "aria-label": "Back",
    style: {
      border: 'none',
      background: 'transparent',
      cursor: 'pointer',
      padding: 6,
      display: 'inline-flex'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-left",
    size: 24,
    color: "var(--slate-500)"
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      font: '700 15px var(--font-ui)',
      color: 'var(--ink)'
    }
  }, "Practice take")), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      margin: '0 20px 16px',
      borderRadius: 24,
      overflow: 'hidden',
      position: 'relative',
      background: 'radial-gradient(120% 80% at 50% 20%, #33414f 0%, #131a22 70%)'
    }
  }, /*#__PURE__*/React.createElement(TeleprompterOverlay, {
    style: {
      height: '46%'
    },
    speed: 1,
    text: "Hi, I'm Fabri. This is a 15 second throwaway clip so you can feel the teleprompter before your first real task."
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 20,
      left: 0,
      right: 0,
      display: 'flex',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 76,
      height: 76,
      borderRadius: 999,
      border: '4px solid #fff',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 58,
      height: 58,
      borderRadius: 999,
      background: 'var(--accent)'
    }
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 24px 30px'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    block: true,
    onClick: next
  }, "That's the idea")));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 24px 30px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 18,
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement(Wordmark, {
    size: 30,
    capsule: true
  }), /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      font: '700 30px/1.15 var(--font-display)',
      letterSpacing: '-0.5px',
      color: 'var(--ink)'
    }
  }, "One task is waiting"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      maxWidth: 280,
      font: '400 16px/1.5 var(--font-ui)',
      color: 'var(--slate-500)'
    }
  }, "Due today, about 40 seconds of talking. The script is written.")), /*#__PURE__*/React.createElement(Button, {
    block: true,
    onClick: onFinish
  }, "Open Today"));
}
Object.assign(window, {
  CreatorFlow
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/onboarding/CreatorFlow.jsx", error: String((e && e.message) || e) }); }

// ui_kits/onboarding/OnboardingApp.jsx
try { (() => {
function OnboardingKit() {
  const {
    Button
  } = window.NoniDesignSystem_710e43;
  const [flow, setFlow] = React.useState('auth'); // auth | link | company | creator | done
  const [role, setRole] = React.useState('company');
  let body;
  if (flow === 'auth') body = /*#__PURE__*/React.createElement(LoginScreen, {
    onNext: () => setFlow('link')
  });else if (flow === 'link') body = /*#__PURE__*/React.createElement(MagicLinkScreen, {
    onNext: () => setFlow(role)
  });else if (flow === 'company') body = /*#__PURE__*/React.createElement(CompanyFlow, {
    onFinish: () => setFlow('done')
  });else if (flow === 'creator') body = /*#__PURE__*/React.createElement(CreatorFlow, {
    onFinish: () => setFlow('done')
  });else body = /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
      padding: 30,
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      font: '700 26px/1.2 var(--font-display)',
      letterSpacing: '-0.4px',
      color: 'var(--ink)'
    }
  }, "Onboarding complete"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      font: '400 15px/1.5 var(--font-ui)',
      color: 'var(--slate-500)'
    }
  }, "The real app lands on the Calendar (admin) or Today (creator) \u2014 see those UI kits."), /*#__PURE__*/React.createElement(Button, {
    size: "md",
    variant: "tint",
    onClick: () => setFlow('auth')
  }, "Run it again"));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      padding: 6,
      background: 'var(--white)',
      borderRadius: 999,
      border: '1px solid var(--line)'
    }
  }, [['company', 'Company (admin)'], ['creator', 'Creator']].map(([k, label]) => /*#__PURE__*/React.createElement("button", {
    key: k,
    type: "button",
    onClick: () => {
      setRole(k);
      setFlow('auth');
    },
    style: {
      padding: '9px 16px',
      borderRadius: 999,
      border: 'none',
      cursor: 'pointer',
      font: '700 13px var(--font-ui)',
      background: role === k ? 'var(--blue-100)' : 'transparent',
      color: role === k ? 'var(--blue-700)' : 'var(--slate-500)'
    }
  }, label))), /*#__PURE__*/React.createElement(Phone, null, body));
}
Object.assign(window, {
  OnboardingKit
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/onboarding/OnboardingApp.jsx", error: String((e && e.message) || e) }); }

// ui_kits/onboarding/StepShell.jsx
try { (() => {
function StepShell({
  step,
  total,
  title,
  subtitle,
  children,
  onBack,
  onExit,
  primaryLabel,
  onPrimary,
  primaryDisabled,
  footNote
}) {
  const {
    ProgressBar,
    Icon,
    Button
  } = window.NoniDesignSystem_710e43;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      minHeight: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '6px 18px 8px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onBack,
    "aria-label": "Back",
    disabled: !onBack,
    style: {
      border: 'none',
      background: 'transparent',
      cursor: onBack ? 'pointer' : 'default',
      opacity: onBack ? 1 : 0,
      padding: 6,
      display: 'inline-flex'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-left",
    size: 24,
    color: "var(--slate-500)"
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      display: 'flex',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(ProgressBar, {
    step: step,
    total: total
  })), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onExit,
    "aria-label": "Save and exit",
    style: {
      border: 'none',
      background: 'transparent',
      cursor: 'pointer',
      padding: 6,
      display: 'inline-flex'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "log-out",
    size: 22,
    color: "var(--slate-400)"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto',
      padding: '18px 24px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      font: '700 30px/1.15 var(--font-display)',
      letterSpacing: '-0.5px',
      color: 'var(--ink)'
    }
  }, title), subtitle ? /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '0 0 8px',
      font: '400 16px/1.5 var(--font-ui)',
      color: 'var(--slate-500)'
    }
  }, subtitle) : null, children), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 24px 30px',
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, footNote ? /*#__PURE__*/React.createElement("span", {
    style: {
      textAlign: 'center',
      font: '500 12px var(--font-ui)',
      color: 'var(--slate-400)'
    }
  }, footNote) : null, /*#__PURE__*/React.createElement(Button, {
    block: true,
    disabled: primaryDisabled,
    onClick: onPrimary
  }, primaryLabel)));
}
Object.assign(window, {
  StepShell
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/onboarding/StepShell.jsx", error: String((e && e.message) || e) }); }

// ui_kits/shared/Phone.jsx
try { (() => {
/* Device chrome for the Noni UI kits. iPhone 390x844 safe area. */
function Phone({
  children,
  dark = false,
  label
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 390,
      height: 844,
      borderRadius: 46,
      overflow: 'hidden',
      position: 'relative',
      background: dark ? 'var(--ink-900)' : 'var(--white)',
      boxShadow: '0 0 0 10px #10161d, 0 24px 60px rgba(15,23,32,0.28)',
      flex: '0 0 auto'
    }
  }, /*#__PURE__*/React.createElement(StatusBar, {
    dark: dark
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      paddingTop: 54,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }
  }, children), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 8,
      left: '50%',
      transform: 'translateX(-50%)',
      width: 134,
      height: 5,
      borderRadius: 999,
      background: dark ? 'rgba(255,255,255,0.5)' : 'rgba(15,23,32,0.3)'
    }
  })), label ? /*#__PURE__*/React.createElement("div", {
    style: {
      font: '700 12px var(--font-ui)',
      color: 'var(--slate-400)',
      letterSpacing: '0.4px',
      textTransform: 'uppercase'
    }
  }, label) : null);
}
function StatusBar({
  dark
}) {
  const c = dark ? 'rgba(255,255,255,0.95)' : 'var(--ink)';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 54,
      padding: '16px 30px 0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      zIndex: 40,
      pointerEvents: 'none'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: '700 15px var(--font-ui)',
      color: c
    }
  }, "08:09"), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 5
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      gap: 2
    }
  }, [5, 8, 11, 14].map(h => /*#__PURE__*/React.createElement("span", {
    key: h,
    style: {
      width: 3,
      height: h,
      borderRadius: 1,
      background: c
    }
  }))), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 24,
      height: 13,
      borderRadius: 4,
      border: `1.5px solid ${c}`,
      position: 'relative',
      display: 'inline-block'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      inset: 2,
      right: 6,
      background: c,
      borderRadius: 2
    }
  }))));
}
Object.assign(window, {
  Phone,
  StatusBar
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/shared/Phone.jsx", error: String((e && e.message) || e) }); }

// ui_kits/shared/data.js
try { (() => {
/* Sample content for the Noni UI kits. First tenant is FieldVision AI
   (football technology), so every task, trend and caption is sports-themed. */
window.NONI_DATA = {
  creator: {
    name: 'Fabri',
    firstName: 'Fabri',
    handle: 'fabri.d1soccer',
    returning: true
  },
  tasks: [{
    id: 't1',
    title: "Why every U16 coach is filming training now",
    status: 'assigned',
    format: 'video',
    due: 'today',
    hook: "Your keeper's distribution is costing you two goals a month.",
    script: "Your keeper's distribution is costing you two goals a month.\n\nWe tagged 400 goal kicks from one U16 season. Every time the ball went long, possession dropped to 31%.\n\nFieldVision tags it automatically from one phone on a tripod. You get the clip, the pass map, and the fix before Sunday.",
    caption: "Two goals a month, gone. Full breakdown at the link in bio. #footballcoach #u16",
    trend: {
      platform: 'tiktok',
      handle: 'fabri.d1soccer',
      views: '1.2M views',
      hook: 'POV: your coach films every session now',
      why: 'Opens mid-action, no intro, and the payoff lands in 4 seconds.'
    }
  }, {
    id: 't2',
    title: '3 stats that win Sunday',
    status: 'recorded',
    format: 'photo_carousel',
    due: 'Thursday',
    hook: 'Three numbers decide most youth matches. None of them are goals.',
    script: 'Slide 1: Three numbers decide most youth matches.\n\nSlide 2: Recoveries in the final third.\n\nSlide 3: Passes before a shot.\n\nSlide 4: Distance covered after minute 70.',
    caption: 'Save this before Sunday. Comment STATS and I will send the template.',
    trend: {
      platform: 'instagram',
      handle: 'd1.keeper',
      views: '480K views',
      hook: 'Nobody talks about keeper distribution',
      why: 'One stat, one claim, one CTA. Nothing else on screen.'
    }
  }, {
    id: 't3',
    title: 'The tripod setup that took 90 seconds',
    status: 'submitted',
    format: 'video',
    due: 'Friday',
    hook: 'You do not need a camera crew. You need one phone and a fence.',
    script: 'You do not need a camera crew. You need one phone and a fence.\n\nClamp it at the halfway line, chest height, press record, walk away.',
    caption: 'Setup takes 90 seconds. Link in bio for the clamp we use.',
    trend: {
      platform: 'tiktok',
      handle: 'coachlensuk',
      views: '860K views',
      hook: 'The £14 clamp every coach films with',
      why: 'Cheap-gear hooks convert: price in the first two seconds.'
    }
  }],
  posted: [{
    id: 'p1',
    title: 'Half-time talk, but with data',
    status: 'posted',
    format: 'video',
    due: 'Jul 24',
    views: '412K',
    link: 'tiktok.com/@fabri.d1soccer/video/7391…'
  }, {
    id: 'p2',
    title: '4 drills we tagged this week',
    status: 'posted',
    format: 'photo_carousel',
    due: 'Jul 21',
    views: '128K',
    link: 'tiktok.com/@fabri.d1soccer/photo/7388…'
  }, {
    id: 'p3',
    title: 'Reading a pass map in 20 seconds',
    status: 'approved',
    format: 'video',
    due: 'Jul 28',
    views: '—',
    link: null
  }],
  queue: [{
    id: 'q1',
    title: 'The tripod setup that took 90 seconds',
    creator: 'Fabri',
    status: 'submitted',
    format: 'video',
    due: 'Friday',
    duration: '0:38'
  }, {
    id: 'q2',
    title: 'Why your winger fades after 70 minutes',
    creator: 'Mara',
    status: 'submitted',
    format: 'video',
    due: 'Friday',
    duration: '0:52'
  }, {
    id: 'q3',
    title: '3 stats that win Sunday',
    creator: 'Fabri',
    status: 'submitted',
    format: 'photo_carousel',
    due: 'Thursday',
    duration: '4 slides'
  }, {
    id: 'q4',
    title: 'What a 31% possession drop looks like',
    creator: 'Deniz',
    status: 'submitted',
    format: 'video',
    due: 'Saturday',
    duration: '0:41'
  }],
  week: [{
    day: 'Mon 3',
    items: [{
      title: 'Why every U16 coach is filming training now',
      creator: 'Fabri',
      status: 'assigned',
      format: 'video'
    }]
  }, {
    day: 'Tue 4',
    items: [{
      title: '3 stats that win Sunday',
      creator: 'Fabri',
      status: 'recorded',
      format: 'photo_carousel'
    }, {
      title: 'Keeper distribution, explained',
      creator: 'Mara',
      status: 'assigned',
      format: 'video'
    }]
  }, {
    day: 'Wed 5',
    items: [{
      title: 'One phone, one fence, one season',
      creator: 'Deniz',
      status: 'assigned',
      format: 'video'
    }]
  }, {
    day: 'Thu 6',
    items: [{
      title: 'The £14 clamp we film with',
      creator: 'Mara',
      status: 'assigned',
      format: 'photo_carousel'
    }]
  }],
  trends: [{
    platform: 'tiktok',
    handle: 'fabri.d1soccer',
    views: '1.2M views',
    hook: 'POV: your coach films every session now',
    why: 'Opens mid-action, no intro, and the payoff lands in 4 seconds.'
  }, {
    platform: 'instagram',
    handle: 'd1.keeper',
    views: '480K views',
    hook: 'Nobody talks about keeper distribution',
    why: 'One stat, one claim, one CTA. Nothing else on screen.'
  }, {
    platform: 'tiktok',
    handle: 'coachlensuk',
    views: '860K views',
    hook: 'The £14 clamp every coach films with',
    why: 'Cheap-gear hooks convert: price in the first two seconds.'
  }, {
    platform: 'tiktok',
    handle: 'sundayleaguetape',
    views: '2.1M views',
    hook: 'I tagged 400 goal kicks so you do not have to',
    why: 'Absurd effort in the hook buys 30 seconds of attention.'
  }]
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/shared/data.js", error: String((e && e.message) || e) }); }

__ds_ns.TeleprompterOverlay = __ds_scope.TeleprompterOverlay;

__ds_ns.InfoBlock = __ds_scope.InfoBlock;

__ds_ns.MediaCard = __ds_scope.MediaCard;

__ds_ns.StatCard = __ds_scope.StatCard;

__ds_ns.TaskCard = __ds_scope.TaskCard;

__ds_ns.TrendCard = __ds_scope.TrendCard;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Icon = __ds_scope.Icon;

__ds_ns.ScreenHeader = __ds_scope.ScreenHeader;

__ds_ns.BubbleMark = __ds_scope.BubbleMark;

__ds_ns.Wordmark = __ds_scope.Wordmark;

__ds_ns.EmptyState = __ds_scope.EmptyState;

__ds_ns.ProgressBar = __ds_scope.ProgressBar;

__ds_ns.StatusChip = __ds_scope.StatusChip;

__ds_ns.Chip = __ds_scope.Chip;

__ds_ns.OptionCard = __ds_scope.OptionCard;

__ds_ns.Stepper = __ds_scope.Stepper;

__ds_ns.TextField = __ds_scope.TextField;

__ds_ns.ToneSlider = __ds_scope.ToneSlider;

__ds_ns.TabBar = __ds_scope.TabBar;

})();
