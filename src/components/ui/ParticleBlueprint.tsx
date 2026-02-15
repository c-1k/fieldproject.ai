import { PARTICLES } from "@/lib/particles";

interface ParticleBlueprintProps {
  particleId: string;
  className?: string;
}

const FIG: Record<string, string> = {
  boson: "1.1", fermion: "1.2", higgs: "1.3", hadron: "1.4",
  photon: "1.5", neutrino: "1.6", quark: "2.1", gluon: "2.2",
  graviton: "2.3", muon: "2.4",
};

// Stroke presets
const S = { stroke: "currentColor", strokeWidth: 0.75, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
const D = { ...S, strokeWidth: 0.5, strokeDasharray: "3 3", opacity: 0.35 };
const T = { ...S, strokeWidth: 0.35, opacity: 0.18 };
const Label = { fontSize: 6, fontFamily: "monospace", fill: "currentColor", opacity: 0.35 };
const LabelDim = { fontSize: 5, fontFamily: "monospace", fill: "currentColor", opacity: 0.22 };

// Small crosshair registration mark
function Reg({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <line x1={x - 3} y1={y} x2={x + 3} y2={y} {...T} />
      <line x1={x} y1={y - 3} x2={x} y2={y + 3} {...T} />
    </g>
  );
}

function BosonDrawing() {
  return (
    <g>
      {/* Registration marks */}
      <Reg x={20} y={20} /><Reg x={220} y={20} /><Reg x={20} y={175} /><Reg x={220} y={175} />

      {/* Three input channels with labels */}
      <line x1="42" y1="22" x2="96" y2="58" {...S} />
      <line x1="120" y1="10" x2="120" y2="55" {...S} />
      <line x1="198" y1="22" x2="144" y2="58" {...S} />
      {/* Input dots */}
      <circle cx="42" cy="22" r="2" fill="currentColor" opacity="0.4" />
      <circle cx="120" cy="10" r="2" fill="currentColor" opacity="0.4" />
      <circle cx="198" cy="22" r="2" fill="currentColor" opacity="0.4" />
      {/* Input labels */}
      <text x="28" y="18" {...Label}>WEBHOOK</text>
      <text x="110" y="8" {...Label}>API</text>
      <text x="194" y="18" {...Label}>CRON</text>

      {/* Hexagonal gateway — outer */}
      <polygon points="120,52 164,70 164,102 120,120 76,102 76,70" {...S} fill="none" />
      {/* Inner chamber */}
      <polygon points="120,62 152,75 152,97 120,110 88,97 88,75" {...S} fill="none" opacity="0.45" />
      {/* Core envelope shape inside */}
      <rect x="108" y="78" width="24" height="16" rx="1" {...S} fill="none" opacity="0.5" />
      <line x1="108" y1="78" x2="120" y2="88" {...S} opacity="0.35" />
      <line x1="132" y1="78" x2="120" y2="88" {...S} opacity="0.35" />
      {/* HMAC signature hash marks */}
      <line x1="110" y1="96" x2="114" y2="96" {...T} opacity="0.3" />
      <line x1="116" y1="96" x2="120" y2="96" {...T} opacity="0.3" />
      <line x1="122" y1="96" x2="126" y2="96" {...T} opacity="0.3" />
      <line x1="128" y1="96" x2="130" y2="96" {...T} opacity="0.3" />

      {/* Section cut indicator */}
      <line x1="60" y1="86" x2="72" y2="86" {...D} opacity="0.25" />
      <line x1="168" y1="86" x2="180" y2="86" {...D} opacity="0.25" />
      <circle cx="56" cy="86" r="4" {...T} opacity="0.3" />
      <text x="54" y="88" fontSize="5" fontFamily="monospace" fill="currentColor" opacity="0.25">A</text>
      <circle cx="184" cy="86" r="4" {...T} opacity="0.3" />
      <text x="182" y="88" fontSize="5" fontFamily="monospace" fill="currentColor" opacity="0.25">A</text>

      {/* Canonicalization label */}
      <text x="139" y="88" {...LabelDim}>CANONICAL</text>

      {/* Output channel */}
      <line x1="120" y1="120" x2="120" y2="168" {...S} />
      <path d="M116,161 L120,171 L124,161" {...S} fill="none" />
      {/* Output label */}
      <text x="126" y="148" {...Label}>EventEnvelope</text>
      <text x="126" y="156" {...LabelDim}>+ CorrelationId</text>
      <text x="126" y="162" {...LabelDim}>+ HMAC</text>

      {/* HTTP 202 annotation */}
      <line x1="76" y1="120" x2="60" y2="138" {...T} opacity="0.25" />
      <text x="40" y="142" {...Label}>202</text>

      {/* Dimension marks — height */}
      <line x1="36" y1="52" x2="36" y2="120" {...T} />
      <line x1="33" y1="52" x2="39" y2="52" {...T} />
      <line x1="33" y1="120" x2="39" y2="120" {...T} />
      <text x="26" y="90" {...LabelDim} transform="rotate(-90 26 90)">GATE</text>

      {/* Dimension marks — width */}
      <line x1="76" y1="130" x2="164" y2="130" {...T} />
      <line x1="76" y1="127" x2="76" y2="133" {...T} />
      <line x1="164" y1="127" x2="164" y2="133" {...T} />
    </g>
  );
}

function FermionDrawing() {
  return (
    <g>
      <Reg x={20} y={20} /><Reg x={220} y={20} /><Reg x={20} y={175} /><Reg x={220} y={175} />

      {/* Input */}
      <line x1="120" y1="12" x2="120" y2="48" {...S} />
      <circle cx="120" cy="12" r="2" fill="currentColor" opacity="0.4" />
      <text x="126" y="15" {...Label}>EventEnvelope</text>

      {/* Central diamond — outer */}
      <polygon points="120,48 162,80 120,112 78,80" {...S} fill="none" />
      {/* Inner diamond */}
      <polygon points="120,58 152,80 120,102 88,80" {...D} fill="none" />
      {/* Rule evaluation symbol */}
      <text x="112" y="76" fontSize="7" fontFamily="monospace" fill="currentColor" opacity="0.3">RULE</text>
      <text x="110" y="84" {...LabelDim}>EVALUATE</text>

      {/* Higgs consultation line */}
      <line x1="162" y1="80" x2="210" y2="60" {...D} opacity="0.3" />
      <text x="190" y="56" {...LabelDim}>→ Higgs</text>
      <circle cx="210" cy="60" r="2" {...T} opacity="0.4" />

      {/* Three output paths with labels */}
      {/* Left — DENY */}
      <line x1="78" y1="80" x2="28" y2="120" {...S} opacity="0.6" />
      <path d="M32,124 L24,120 L30,114" {...S} fill="none" opacity="0.5" />
      <text x="18" y="132" {...Label}>DENY</text>
      <line x1="28" y1="120" x2="28" y2="135" {...T} opacity="0.2" />

      {/* Center — ALLOW → ActionPlan */}
      <line x1="120" y1="112" x2="120" y2="170" {...S} />
      <path d="M116,163 L120,173 L124,163" {...S} fill="none" />
      <text x="126" y="138" {...Label}>ALLOW</text>
      {/* ActionPlan box */}
      <rect x="128" y="146" width="48" height="20" rx="1" {...T} opacity="0.3" />
      <text x="132" y="155" {...LabelDim}>ActionPlan</text>
      <text x="132" y="162" {...LabelDim}>ordered[]</text>

      {/* Right — FILTER */}
      <line x1="162" y1="80" x2="212" y2="120" {...S} opacity="0.6" />
      <path d="M208,114 L216,120 L210,124" {...S} fill="none" opacity="0.5" />
      <text x="200" y="132" {...Label}>FILTER</text>

      {/* Dry-run bypass (dashed arc) */}
      <path d="M120,48 C145,48 162,55 162,80" {...D} opacity="0.2" />
      <text x="148" y="50" {...LabelDim}>dry-run</text>

      {/* Decision junction dots */}
      <circle cx="78" cy="80" r="1.5" fill="currentColor" opacity="0.5" />
      <circle cx="120" cy="112" r="1.5" fill="currentColor" opacity="0.5" />
      <circle cx="162" cy="80" r="1.5" fill="currentColor" opacity="0.5" />

      {/* Dimension marks */}
      <line x1="68" y1="48" x2="68" y2="112" {...T} />
      <line x1="65" y1="48" x2="71" y2="48" {...T} />
      <line x1="65" y1="112" x2="71" y2="112" {...T} />
    </g>
  );
}

function HiggsDrawing() {
  const plateW = 72;
  const plateD = 42;
  const plate = (cx: number, cy: number) => {
    const dx = plateW * 0.866 * 0.5;
    const dy = plateW * 0.5 * 0.5;
    const ddx = plateD * 0.866 * 0.5;
    const ddy = plateD * 0.5 * 0.5;
    return `${cx},${cy} ${cx + dx},${cy + dy} ${cx + dx - ddx},${cy + dy + ddy} ${cx - ddx},${cy + ddy}`;
  };

  return (
    <g>
      <Reg x={20} y={20} /><Reg x={220} y={20} /><Reg x={20} y={175} /><Reg x={220} y={175} />

      {/* 5 stacked governance plates */}
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          <polygon
            points={plate(86, 30 + i * 28)}
            {...(i === 2 ? S : { ...S, opacity: 0.4 })}
            fill="none"
          />
          {/* Plate detail — internal grid lines */}
          {i < 4 && (
            <line
              x1={86 + 10}
              y1={30 + i * 28 + 5}
              x2={86 + plateW * 0.866 * 0.5 - 5}
              y2={30 + i * 28 + plateW * 0.5 * 0.5 - 2}
              {...T}
              opacity="0.12"
            />
          )}
        </g>
      ))}

      {/* Layer labels on the right */}
      <text x="160" y="35" {...LabelDim}>TENANT CONFIG</text>
      <text x="160" y="63" {...LabelDim}>ALLOWLIST</text>
      <text x="160" y="91" {...Label} opacity="0.4">POLICY ENGINE</text>
      <text x="160" y="119" {...LabelDim}>REDACTION</text>
      <text x="160" y="147" {...LabelDim}>CLASSIFICATION</text>

      {/* Leader lines from labels to plates */}
      {[35, 63, 91, 119, 147].map((y, i) => (
        <line key={i} x1="155" y1={y - 2} x2={147} y2={30 + i * 28 + 10} {...T} opacity="0.15" />
      ))}

      {/* Shield shape on center plate front face */}
      <path
        d="M106,84 L106,76 C106,70 118,64 118,64 C118,64 130,70 130,76 L130,84 Z"
        {...S}
        opacity="0.55"
        fill="none"
      />
      <circle cx="118" cy="75" r="2.5" {...S} opacity="0.4" fill="none" />
      <line x1="118" y1="77" x2="118" y2="82" {...S} opacity="0.4" />

      {/* Section cut */}
      <line x1="52" y1="86" x2="68" y2="86" {...D} opacity="0.2" />
      <line x1="152" y1="86" x2="155" y2="86" {...D} opacity="0.2" />
      <circle cx="48" cy="86" r="4" {...T} opacity="0.25" />
      <text x="46" y="88" fontSize="5" fontFamily="monospace" fill="currentColor" opacity="0.2">B</text>

      {/* Vertical alignment lines */}
      <line x1="86" y1="24" x2="86" y2="160" {...D} opacity="0.12" />

      {/* Dimension — stack height */}
      <line x1="38" y1="30" x2="38" y2="142" {...T} />
      <line x1="35" y1="30" x2="41" y2="30" {...T} />
      <line x1="35" y1="142" x2="41" y2="142" {...T} />
      <text x="28" y="90" {...LabelDim} transform="rotate(-90 28 90)">5 LAYERS</text>

      {/* Policy decision output */}
      <line x1="118" y1="142" x2="118" y2="170" {...S} opacity="0.4" />
      <path d="M114,163 L118,173 L122,163" {...S} fill="none" opacity="0.35" />
      <text x="124" y="168" {...LabelDim}>allow | deny | filter</text>
    </g>
  );
}

function HadronDrawing() {
  const cube = (cx: number, cy: number, s: number, op = 1) => {
    const dx = s * 0.866;
    const dy = s * 0.5;
    return (
      <g opacity={op}>
        <path d={`M${cx},${cy - s} L${cx + dx},${cy - dy} L${cx},${cy} L${cx - dx},${cy - dy} Z`} {...S} fill="none" />
        <path d={`M${cx},${cy} L${cx + dx},${cy + dy} L${cx + dx},${cy - dy} L${cx},${cy - s} Z`} {...S} fill="none" opacity="0.7" />
        <path d={`M${cx},${cy} L${cx},${cy - s} L${cx - dx},${cy - dy} L${cx - dx},${cy + dy} Z`} {...S} fill="none" opacity="0.5" />
        <line x1={cx} y1={cy + s} x2={cx + dx} y2={cy + dy} {...D} />
        <line x1={cx} y1={cy + s} x2={cx - dx} y2={cy + dy} {...D} />
      </g>
    );
  };

  return (
    <g>
      <Reg x={20} y={20} /><Reg x={220} y={20} /><Reg x={20} y={175} /><Reg x={220} y={175} />

      {/* Three state cubes stacked */}
      {cube(110, 145, 26, 0.5)}
      {cube(110, 97, 26, 0.7)}
      {cube(110, 49, 26, 1)}

      {/* State labels on right face of each cube */}
      <text x="140" y="30" {...Label}>SUCCEEDED</text>
      <text x="140" y="78" {...Label}>EXECUTING</text>
      <text x="140" y="126" {...Label}>PENDING</text>

      {/* State transition arrows on the left */}
      <path d="M82,140 C65,140 65,110 82,102" {...S} opacity="0.35" fill="none" />
      <path d="M80,104 L84,100 L82,106" fill="currentColor" opacity="0.25" />
      <path d="M82,92 C65,92 65,62 82,54" {...S} opacity="0.35" fill="none" />
      <path d="M80,56 L84,52 L82,58" fill="currentColor" opacity="0.25" />

      {/* Retry loop on middle cube */}
      <path d="M85,110 C72,118 72,130 85,135" {...D} opacity="0.3" fill="none" />
      <text x="56" y="125" {...LabelDim}>RETRY</text>
      <text x="56" y="131" {...LabelDim}>exp. backoff</text>

      {/* DLQ indicator at bottom */}
      <line x1="110" y1="171" x2="110" y2="182" {...D} opacity="0.25" />
      <rect x="96" y="180" width="28" height="8" rx="1" {...T} opacity="0.3" />
      <text x="100" y="186" {...LabelDim}>DLQ</text>

      {/* Idempotency mark */}
      <text x="140" y="170" {...LabelDim}>idempotency_key</text>
      <line x1="138" y1="167" x2="136" y2="155" {...T} opacity="0.2" />

      {/* Dimension — total height */}
      <line x1="178" y1="23" x2="178" y2="171" {...T} />
      <line x1="175" y1="23" x2="181" y2="23" {...T} />
      <line x1="175" y1="171" x2="181" y2="171" {...T} />

      {/* State dots */}
      <circle cx="110" cy="23" r="1.5" fill="currentColor" opacity="0.6" />
      <circle cx="110" cy="71" r="1.5" fill="currentColor" opacity="0.4" />
      <circle cx="110" cy="119" r="1.5" fill="currentColor" opacity="0.25" />
    </g>
  );
}

function PhotonDrawing() {
  return (
    <g>
      <Reg x={20} y={20} /><Reg x={220} y={20} /><Reg x={20} y={175} /><Reg x={220} y={175} />

      {/* Vault/source prism */}
      <polygon points="42,78 56,68 56,108 42,118" {...S} fill="none" opacity="0.6" />
      <polygon points="42,78 56,68 68,76 56,86" {...S} fill="none" opacity="0.4" />
      <line x1="56" y1="86" x2="56" y2="108" {...S} opacity="0.35" />
      <text x="36" y="130" {...LabelDim}>VAULT</text>

      {/* 5 connector beams fanning out */}
      {[
        { y: 40, label: "HTTP/REST", endX: 210 },
        { y: 66, label: "gRPC", endX: 215 },
        { y: 93, label: "LLM Provider", endX: 210 },
        { y: 120, label: "Message Queue", endX: 215 },
        { y: 148, label: "SaaS Platform", endX: 210 },
      ].map((c, i) => (
        <g key={i}>
          {/* Beam line */}
          <line x1="68" y1="93" x2={c.endX} y2={c.y} {...S} opacity={0.25 + i * 0.1} />
          {/* Connector endpoint — small square */}
          <rect x={c.endX - 4} y={c.y - 4} width="8" height="8" rx="1" {...S} fill="none" opacity={0.35 + i * 0.08} />
          {/* Label */}
          <text x={c.endX - 55} y={c.y - 5} {...LabelDim}>{c.label}</text>
          {/* Error classification dot */}
          <circle cx={c.endX + 10} cy={c.y} r="1" fill="currentColor" opacity="0.2" />
        </g>
      ))}

      {/* Credential resolution arrow */}
      <line x1="50" y1="68" x2="50" y2="50" {...D} opacity="0.25" />
      <text x="30" y="46" {...LabelDim}>credentials</text>

      {/* Error classification legend */}
      <text x="172" y="170" {...LabelDim}>transient | permanent | rate-limited</text>

      {/* Emission point */}
      <circle cx="68" cy="93" r="3" {...S} fill="none" opacity="0.5" />
      <circle cx="68" cy="93" r="1" fill="currentColor" opacity="0.4" />

      {/* Fan angle dimension */}
      <path d="M78,50 A40,40 0 0,1 78,136" {...D} opacity="0.15" fill="none" />
    </g>
  );
}

function NeutrinoDrawing() {
  return (
    <g>
      <Reg x={20} y={20} /><Reg x={220} y={20} /><Reg x={20} y={175} /><Reg x={220} y={175} />

      {/* Beam entering and exiting */}
      <line x1="16" y1="95" x2="72" y2="95" {...S} opacity="0.3" />
      <line x1="168" y1="95" x2="224" y2="95" {...S} opacity="0.3" />
      <path d="M218,91 L228,95 L218,99" {...S} fill="none" opacity="0.3" />
      <text x="16" y="88" {...LabelDim}>event in</text>
      <text x="196" y="88" {...LabelDim}>event out</text>
      <text x="196" y="104" {...LabelDim}>(unchanged)</text>

      {/* Observation cylinder — front ellipse */}
      <ellipse cx="72" cy="95" rx="16" ry="38" {...S} fill="none" />
      {/* Back ellipse */}
      <ellipse cx="168" cy="95" rx="16" ry="38" {...D} fill="none" />
      {/* Top/bottom lines */}
      <line x1="72" y1="57" x2="168" y2="57" {...S} />
      <line x1="72" y1="133" x2="168" y2="133" {...S} />

      {/* Internal trace spans — parallel dashed lines */}
      {[70, 80, 90, 100, 110, 120].map((y) => (
        <line key={y} x1="80" y1={y} x2="160" y2={y} {...T} opacity="0.08" />
      ))}

      {/* Recording ticks along top */}
      {[88, 100, 112, 124, 136, 148, 160].map((x, i) => (
        <g key={x}>
          <line x1={x} y1="57" x2={x} y2="52" {...T} opacity="0.3" />
          <line x1={x} y1="133" x2={x} y2="138" {...T} opacity="0.3" />
          {/* Span ID dots inside */}
          <circle cx={x} cy={72 + i * 5} r="0.8" fill="currentColor" opacity={0.1 + i * 0.04} />
        </g>
      ))}

      {/* Append-only label */}
      <text x="96" y="150" {...Label}>APPEND-ONLY LEDGER</text>

      {/* Trace view annotation */}
      <rect x="88" y="68" width="64" height="12" rx="1" {...T} opacity="0.2" />
      <text x="92" y="76" {...LabelDim}>trace_id: span[]</text>

      {/* Cost/latency counters */}
      <rect x="88" y="105" width="32" height="10" rx="1" {...T} opacity="0.15" />
      <text x="90" y="112" {...LabelDim}>cost: $</text>
      <rect x="124" y="105" width="32" height="10" rx="1" {...T} opacity="0.15" />
      <text x="126" y="112" {...LabelDim}>lat: ms</text>

      {/* Section indicator */}
      <circle cx="42" cy="95" r="4" {...T} opacity="0.25" />
      <text x="40" y="97" fontSize="5" fontFamily="monospace" fill="currentColor" opacity="0.2">C</text>

      {/* Center crosshair */}
      <line x1="116" y1="90" x2="124" y2="90" {...T} />
      <line x1="120" y1="86" x2="120" y2="94" {...T} />
    </g>
  );
}

function QuarkDrawing() {
  const miniCube = (cx: number, cy: number, s: number, opacity = 0.7) => {
    const dx = s * 0.866;
    const dy = s * 0.5;
    return (
      <g opacity={opacity}>
        <path d={`M${cx},${cy - s} L${cx + dx},${cy - dy} L${cx},${cy} L${cx - dx},${cy - dy} Z`} {...S} fill="none" />
        <path d={`M${cx},${cy} L${cx + dx},${cy + dy} L${cx + dx},${cy - dy}`} {...S} fill="none" />
        <path d={`M${cx},${cy} L${cx - dx},${cy + dy} L${cx - dx},${cy - dy}`} {...S} fill="none" />
      </g>
    );
  };

  return (
    <g>
      <Reg x={20} y={20} /><Reg x={220} y={20} />

      {/* Central large cube — the "raw payload" */}
      {miniCube(108, 100, 30, 0.75)}
      <text x="96" y="118" {...LabelDim}>RAW PAYLOAD</text>

      {/* Typed output cubes — smaller, arranged around */}
      {miniCube(170, 42, 18, 0.6)}
      <text x="162" y="28" {...Label}>PR</text>

      {miniCube(190, 90, 18, 0.5)}
      <text x="192" y="76" {...Label}>TICKET</text>

      {miniCube(170, 138, 18, 0.5)}
      <text x="160" y="156" {...Label}>INVOICE</text>

      {miniCube(50, 55, 16, 0.4)}
      <text x="30" y="42" {...Label}>LLMReq</text>

      {miniCube(42, 110, 14, 0.35)}
      <text x="24" y="128" {...LabelDim}>Custom</text>

      {/* Transformation arrows from center to typed cubes */}
      <line x1="130" y1="82" x2="155" y2="52" {...D} opacity="0.25" />
      <line x1="135" y1="95" x2="175" y2="90" {...D} opacity="0.25" />
      <line x1="130" y1="110" x2="155" y2="132" {...D} opacity="0.25" />
      <line x1="85" y1="82" x2="62" y2="62" {...D} opacity="0.2" />
      <line x1="82" y1="105" x2="55" y2="108" {...D} opacity="0.18" />

      {/* Parse/validate indicator in center */}
      <text x="90" y="92" {...LabelDim}>PARSE</text>
      <text x="90" y="98" {...LabelDim}>+ TYPE</text>

      {/* Validation checkmarks on typed cubes */}
      <path d="M182,48 L185,52 L190,44" {...T} opacity="0.3" />
      <path d="M202,96 L205,100 L210,92" {...T} opacity="0.3" />
    </g>
  );
}

function GluonDrawing() {
  const nodes = [
    { x: 50, y: 35, label: "START" },
    { x: 120, y: 28, label: "" },
    { x: 190, y: 35, label: "" },
    { x: 35, y: 90, label: "" },
    { x: 120, y: 82, label: "JOIN" },
    { x: 205, y: 90, label: "" },
    { x: 70, y: 145, label: "" },
    { x: 120, y: 155, label: "END" },
    { x: 170, y: 145, label: "" },
  ];

  const edges = [
    [0, 1], [1, 2], [0, 3], [1, 4], [2, 5],
    [3, 4], [4, 5], [3, 6], [4, 7], [5, 8], [6, 7], [8, 7],
  ];

  return (
    <g>
      <Reg x={20} y={20} /><Reg x={220} y={20} /><Reg x={20} y={175} /><Reg x={220} y={175} />

      {/* Edges */}
      {edges.map(([a, b], i) => (
        <line
          key={i}
          x1={nodes[a].x} y1={nodes[a].y}
          x2={nodes[b].x} y2={nodes[b].y}
          {...S}
          opacity={0.3}
        />
      ))}

      {/* Compensation path (dashed, going backwards) */}
      <path d="M120,155 C40,155 25,110 35,90" {...D} opacity="0.2" fill="none" />
      <text x="20" y="140" {...LabelDim}>COMPENSATE</text>

      {/* Fan-out from node 0 */}
      <text x="28" y="30" {...Label}>FAN-OUT</text>
      <path d="M50,35 L42,28" {...T} opacity="0.3" />
      <path d="M50,35 L58,28" {...T} opacity="0.3" />

      {/* Fan-in to node 7 */}
      <text x="130" y="168" {...Label}>FAN-IN</text>
      <path d="M120,155 L112,164" {...T} opacity="0.3" />
      <path d="M120,155 L128,164" {...T} opacity="0.3" />

      {/* Version label */}
      <text x="180" y="170" {...LabelDim}>v2.1 (serializable)</text>

      {/* Conditional branch mark */}
      <text x="126" y="52" {...LabelDim}>if condition</text>
      <line x1="124" y1="48" x2="120" y2="38" {...T} opacity="0.2" />

      {/* Nodes with varying sizes */}
      {nodes.map((n, i) => (
        <g key={i}>
          <circle cx={n.x} cy={n.y} r={[0, 4, 7].includes(i) ? 6 : 4} {...S} fill="none" opacity={[0, 4, 7].includes(i) ? 0.7 : 0.4} />
          <circle cx={n.x} cy={n.y} r="1" fill="currentColor" opacity={0.3} />
          {n.label && <text x={n.x - 8} y={n.y + 14} {...LabelDim}>{n.label}</text>}
        </g>
      ))}

      {/* Direction arrows on some edges */}
      <path d="M84,58 L88,62 L82,62" fill="currentColor" opacity="0.2" />
      <path d="M156,58 L152,62 L158,62" fill="currentColor" opacity="0.2" />
    </g>
  );
}

function GravitonDrawing() {
  return (
    <g>
      <Reg x={20} y={20} /><Reg x={220} y={20} /><Reg x={20} y={175} /><Reg x={220} y={175} />

      {/* Central body */}
      <circle cx="120" cy="95" r="6" {...S} fill="none" />
      <circle cx="120" cy="95" r="2" fill="currentColor" opacity="0.4" />

      {/* Orbit 1 — CRON */}
      <ellipse cx="120" cy="95" rx="38" ry="19" {...S} opacity="0.55" transform="rotate(-12 120 95)" />
      <circle cx="158" cy="90" r="3" fill="currentColor" opacity="0.45" />
      <text x="162" y="86" {...Label}>CRON</text>

      {/* Orbit 2 — DELAY */}
      <ellipse cx="120" cy="95" rx="62" ry="31" {...S} opacity="0.38" transform="rotate(-12 120 95)" />
      <circle cx="58" cy="105" r="2.5" fill="currentColor" opacity="0.35" />
      <text x="36" y="102" {...Label}>DELAY</text>

      {/* Orbit 3 — SLA */}
      <ellipse cx="120" cy="95" rx="90" ry="45" {...S} opacity="0.25" transform="rotate(-12 120 95)" />
      <circle cx="210" cy="80" r="2" fill="currentColor" opacity="0.25" />
      <text x="198" y="74" {...Label}>SLA</text>

      {/* POLL marker on orbit 2 */}
      <circle cx="180" cy="102" r="2" fill="currentColor" opacity="0.2" />
      <text x="184" y="106" {...LabelDim}>POLL</text>

      {/* Clock tick marks around inner orbit */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
        const rad = ((deg - 12) * Math.PI) / 180;
        const x = 120 + 38 * Math.cos(rad);
        const y = 95 + 19 * Math.sin(rad);
        const ox = 4 * Math.cos(rad);
        const oy = 2 * Math.sin(rad);
        return <line key={deg} x1={x} y1={y} x2={x + ox} y2={y + oy} {...T} opacity="0.3" />;
      })}

      {/* Dashed radial lines */}
      <line x1="120" y1="95" x2="158" y2="90" {...D} opacity="0.2" />
      <line x1="120" y1="95" x2="210" y2="80" {...D} opacity="0.15" />

      {/* Output annotation */}
      <line x1="120" y1="140" x2="120" y2="168" {...S} opacity="0.3" />
      <path d="M116,161 L120,171 L124,161" {...S} fill="none" opacity="0.25" />
      <text x="126" y="158" {...LabelDim}>→ EventEnvelope</text>
      <text x="126" y="166" {...LabelDim}>(re-enters field)</text>

      {/* Time dimension label */}
      <text x="20" y="170" {...LabelDim}>t → ∞</text>
    </g>
  );
}

function MuonDrawing() {
  const dx = 0.866;

  return (
    <g>
      <Reg x={20} y={20} /><Reg x={220} y={20} /><Reg x={20} y={175} /><Reg x={220} y={175} />

      {/* Outer containment cube */}
      <path d={`M120,26 L${120 + 58 * dx},${26 + 29} L120,${26 + 58} L${120 - 58 * dx},${26 + 29} Z`} {...S} opacity="0.35" fill="none" />
      <path d={`M120,${84} L${120 + 58 * dx},${55} L${120 + 58 * dx},${55 + 74} L120,${84 + 74}`} {...S} opacity="0.28" fill="none" />
      <path d={`M120,${84} L${120 - 58 * dx},${55} L${120 - 58 * dx},${55 + 74} L120,${84 + 74}`} {...S} opacity="0.22" fill="none" />
      <line x1="120" y1={158} x2={120 + 58 * dx} y2={129} {...D} />
      <line x1="120" y1={158} x2={120 - 58 * dx} y2={129} {...D} />

      {/* Inner sandbox cube */}
      <path d={`M120,52 L${120 + 30 * dx},${52 + 15} L120,${52 + 30} L${120 - 30 * dx},${52 + 15} Z`} {...S} opacity="0.7" fill="none" />
      <path d={`M120,${82} L${120 + 30 * dx},${67} L${120 + 30 * dx},${67 + 44} L120,${82 + 44}`} {...S} opacity="0.6" fill="none" />
      <path d={`M120,${82} L${120 - 30 * dx},${67} L${120 - 30 * dx},${67 + 44} L120,${82 + 44}`} {...S} opacity="0.5" fill="none" />

      {/* SANDBOX label on inner cube front face */}
      <text x="108" y="100" {...Label} opacity="0.3">SANDBOX</text>

      {/* Barrier marks between cubes */}
      <line x1="120" y1="38" x2="120" y2="48" {...D} opacity="0.35" />
      <line x1={120 + 44 * dx} y1={55 + 20} x2={120 + 32 * dx} y2={67 + 10} {...D} opacity="0.25" />
      <line x1={120 - 44 * dx} y1={55 + 20} x2={120 - 32 * dx} y2={67 + 10} {...D} opacity="0.25" />

      {/* Resource limits annotations */}
      <text x="168" y="52" {...LabelDim}>CPU: bounded</text>
      <text x="168" y="60" {...LabelDim}>MEM: bounded</text>
      <text x="168" y="68" {...LabelDim}>NET: denied</text>
      <line x1="165" y1="55" x2={120 + 32 * dx} y2={67 + 5} {...T} opacity="0.15" />

      {/* Deterministic execution symbol */}
      <text x="168" y="110" {...LabelDim}>deterministic</text>
      <text x="168" y="118" {...LabelDim}>execution only</text>

      {/* Decay/ephemeral marks — lifecycle */}
      <text x="24" y="145" {...LabelDim}>lifecycle:</text>
      <text x="24" y="153" {...LabelDim}>spawn → exec → decay</text>
      <line x1="38" y1="155" x2="42" y2="160" {...T} opacity="0.3" />
      <line x1="42" y1="155" x2="46" y2="160" {...T} opacity="0.22" />
      <line x1="46" y1="155" x2="50" y2="160" {...T} opacity="0.15" />
    </g>
  );
}

const DRAWINGS: Record<string, () => React.JSX.Element> = {
  boson: BosonDrawing,
  fermion: FermionDrawing,
  higgs: HiggsDrawing,
  hadron: HadronDrawing,
  photon: PhotonDrawing,
  neutrino: NeutrinoDrawing,
  quark: QuarkDrawing,
  gluon: GluonDrawing,
  graviton: GravitonDrawing,
  muon: MuonDrawing,
};

export default function ParticleBlueprint({ particleId, className = "" }: ParticleBlueprintProps) {
  const Drawing = DRAWINGS[particleId];
  if (!Drawing) return null;

  return (
    <div className={`relative ${className}`}>
      <span className="absolute top-3 left-4 text-[10px] font-mono tracking-[0.2em] uppercase select-none text-white/20">
        FIG {FIG[particleId] || "0.0"}
      </span>
      <svg
        viewBox="0 0 240 190"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
        style={{ color: "rgba(255,255,255,0.7)" }}
        role="img"
        aria-label={`Blueprint diagram for ${PARTICLES[particleId]?.name ?? particleId.charAt(0).toUpperCase() + particleId.slice(1)} particle`}
      >
        <Drawing />
      </svg>
    </div>
  );
}
