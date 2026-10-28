import { useId } from 'react';
import './MarketScene.css';

// Original decorative city studies. These are illustrations, not maps or data.
const scenes: Record<string, { sky: string; glow: string; accent: string; buildings: number[][] }> = {
  thailand: { sky: '#152f4a', glow: '#ab7455', accent: '#edbd8c', buildings: [[12, 68, 24, 47], [43, 55, 22, 60], [73, 76, 25, 39], [244, 48, 27, 67], [279, 65, 22, 50], [310, 39, 23, 76]] },
  singapore: { sky: '#103c48', glow: '#328b88', accent: '#7ae0ce', buildings: [[8, 74, 25, 41], [42, 53, 21, 62], [72, 38, 29, 77], [109, 62, 18, 53], [271, 59, 27, 56], [308, 75, 25, 40]] },
  malaysia: { sky: '#292c53', glow: '#7166aa', accent: '#c5b6f7', buildings: [[9, 72, 24, 43], [43, 49, 20, 66], [75, 63, 27, 52], [247, 61, 21, 54], [279, 40, 25, 75], [315, 76, 22, 39]] },
  indonesia: { sky: '#303447', glow: '#a16a58', accent: '#f1bd99', buildings: [[8, 69, 26, 46], [43, 44, 22, 71], [77, 59, 28, 56], [244, 49, 28, 66], [283, 31, 21, 84], [315, 69, 24, 46]] },
  philippines: { sky: '#173b53', glow: '#437a9c', accent: '#8cdbed', buildings: [[10, 72, 21, 43], [42, 44, 23, 71], [76, 61, 24, 54], [250, 58, 24, 57], [285, 34, 21, 81], [317, 69, 20, 46]] },
  vietnam: { sky: '#353049', glow: '#a2647e', accent: '#f0b4c5', buildings: [[10, 72, 23, 43], [43, 52, 25, 63], [78, 67, 23, 48], [246, 52, 23, 63], [281, 69, 25, 46], [317, 45, 22, 70]] },
};

function Landmark({ marketId }: { marketId: string }) {
  switch (marketId) {
    case 'thailand':
      return <g><path d="M114 113V90H126V78H139V67H150V54H165V36L173 16L181 36V54H194V67H207V78H220V91H232V113Z" /><path d="M124 81H219M139 69H208M152 56H194M131 96H216M173 38V111" className="market-scene-detail" /><path d="M152 113V95Q173 77 194 95V113" className="market-scene-cutout" /></g>;
    case 'singapore':
      return <g><path d="M145 111L149 59H165L168 111M184 111L186 59H203L206 111M223 111L221 59H238L244 111" /><path d="M136 56Q184 43 251 50L244 61Q183 57 143 64Z" /><path d="M154 70L153 106M193 70V106M230 70L233 106" className="market-scene-detail" /><path d="M114 113V89M102 89Q114 72 127 89ZM276 113V94M264 94Q276 77 288 94Z" className="market-scene-detail" /></g>;
    case 'malaysia':
      return <g><path d="M128 113V54H135V43H143V28L150 10L157 28V43H165V54H172V113ZM186 113V54H193V43H201V28L208 10L215 28V43H223V54H230V113Z" /><path d="M171 72H187V79H171M137 59H163M137 69H163M137 81H163M137 92H163M195 59H221M195 69H221M195 81H221M195 92H221" className="market-scene-detail" /></g>;
    case 'indonesia':
      return <g><path d="M156 113L164 97L169 47H183L188 97L197 113ZM168 44H185L181 34H173Z" /><path d="M174 33Q159 21 174 10Q173 20 183 23Q187 31 178 35Z" /><path d="M116 113V83H126V73H141V84H151V113M205 113V84H218V70H230V84H239V113" /><path d="M169 98H188M175 52V92M123 92H144M212 92H232" className="market-scene-detail" /></g>;
    case 'philippines':
      return <g><path d="M117 113V78H129V65H144V48H151V65H170V78H182V113ZM190 113V82H204V72H220V59H228V72H241V113Z" /><path d="M109 78L149 58L190 78ZM199 70L224 51L247 70Z" /><path d="M132 87V107M148 86V108M165 88V108M211 87V108M228 87V108" className="market-scene-detail" /><path d="M150 47V29M145 34H155" className="market-scene-detail" /></g>;
    case 'vietnam':
      return <g><path d="M122 113V74L142 58H166V113ZM176 113V55L183 24L202 14L220 111Z" /><path d="M180 62H229L222 69H181ZM187 40L208 35M185 52L212 47M185 77L216 71M184 91L219 85M134 77V107M147 73V107" className="market-scene-detail" /><path d="M229 113V89H239V79H249V89H259V113" /></g>;
    default:
      return null;
  }
}

export default function MarketScene({ marketId, className = '' }: { marketId: string; className?: string }) {
  const id = useId().replace(/:/g, '');
  const scene = scenes[marketId] ?? scenes.thailand;
  return <div className={`market-scene ${className}`} aria-hidden="true">
    <svg viewBox="0 0 350 126" preserveAspectRatio="xMidYMax slice" focusable="false">
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="1" x2="1" y2="0"><stop stopColor={scene.sky} /><stop offset="1" stopColor={scene.glow} /></linearGradient>
        <linearGradient id={`${id}-buildings`} x1="0" y1="1" x2="0" y2="0"><stop stopColor={scene.sky} /><stop offset="1" stopColor={scene.accent} stopOpacity=".6" /></linearGradient>
        <radialGradient id={`${id}-sun`}><stop stopColor={scene.accent} stopOpacity=".35" /><stop offset="1" stopColor={scene.accent} stopOpacity="0" /></radialGradient>
      </defs>
      <path fill={`url(#${id}-sky)`} d="M0 0H350V126H0Z" />
      <circle cx="264" cy="36" r="72" fill={`url(#${id}-sun)`} />
      <circle cx="264" cy="36" r="19" fill={scene.accent} opacity=".35" />
      <path d="M0 92Q43 73 89 85T174 87T260 87T350 74V126H0Z" fill={scene.sky} opacity=".5" />
      <g fill={`url(#${id}-buildings)`} stroke={scene.accent} strokeWidth=".6" strokeOpacity=".4">
        {scene.buildings.map(([x, y, width, height]) => <rect key={x} x={x} y={y} width={width} height={height} rx="1" />)}
        <Landmark marketId={marketId} />
      </g>
      <path d="M0 114H350V126H0Z" fill={scene.sky} />
      <path d="M0 115H350M80 121H139M168 121H235M263 121H311" fill="none" stroke={scene.accent} strokeOpacity=".35" />
      <path d="M16 26H49M30 32H68M298 18H327" fill="none" stroke={scene.accent} strokeWidth="1" strokeOpacity=".25" />
    </svg>
  </div>;
}
