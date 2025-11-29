
import logoHawk from "../assets/img/hawk-emblem-svgrepo-com.svg";
import logoAngel from "../assets/img/angel-outfit-svgrepo-com.svg";
import logoAndroid from "../assets/img/android-mask-svgrepo-com.svg";
import logoAmmonite from "../assets/img/ammonite-svgrepo-com.svg";
import logoAlien from "../assets/img/alien-skull-svgrepo-com.svg";
import logoAnimal from "../assets/img/animal-skull-svgrepo-com.svg";
// import baseImg from "../assets/img/base.png";
import origenImg from "../assets/img/origen.png";
import nave_b from "../assets/img/nave_b.png";
import nave_i from "../assets/img/nave_i.png";
import nave_a from "../assets/img/nave_a.png";

export default function Territorio({
  id, 
  points, 
  fill = 'transparent', 
  label, 
  onClick, 
  ownerColor, 
  hasBase, 
  base = null,
  cx, 
  cy, 
  resourceColor, 
  showLabel = false, 
  casaId = null, 
  esOrigen = null, 
  pointingUp = true,
  baseOwnerLabel = null, 
  originOwnerLabel = null,
  ships = [], 
  selectingDestino = false
}) {
  // points: string "x1,y1 x2,y2 x3,y3"
  // Priority: ownerColor (player) > resourceColor (tile) > default fill
  const displayFill = ownerColor || resourceColor || fill;

  // estimate text width in pixels based on character count (simple approximation)
  const fontSize = 10;
  let pillWidth = 28; // minimum pill width
  if (label && showLabel) {
    // average char width ~ 0.6 * fontSize, add padding
    pillWidth = Math.max(pillWidth, Math.ceil(label.length * fontSize * 0.6) + 12);
  }
  const pillHeight = 16;
  const pillRx = 8; // pill corner radius

  const className = 'territorio' + (onClick ? ' clickable' : '') + (selectingDestino && onClick ? ' selecting-dest' : '');
  const style = { cursor: selectingDestino ? 'crosshair' : (onClick ? 'pointer' : 'default') };

  return (
    <g className={`territorio${onClick ? ' clickable' : ''}`} data-id={id} onClick={() => onClick && onClick(id)}>
      {/* polygon with no stroke; borders are drawn globally to avoid double-stroke gaps */}
      <polygon points={points} fill={displayFill} stroke="none" fillOpacity={1} />
      
      {/* Mostrar icono de origen aun cuando no haya base */}
      {esOrigen && typeof cx === 'number' && typeof cy === 'number' && !hasBase && (
        (() => {
          const iconSize = 12;
          const iconX = cx - iconSize / 2;
          const iconY = cy - (pointingUp ? 18 : -6); // ajustar si es necesario
          return (
            <>
              <image href={origenImg} x={iconX} y={iconY} width={iconSize} height={iconSize} pointerEvents="none" />
              {originOwnerLabel && (
                <text
                  x={cx}
                  y={cy}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={9}
                  fill="#ffffff"
                  pointerEvents="none"
                  style={{ fontWeight: 700, userSelect: 'none' }}
                >
                  {originOwnerLabel}
                </text>
              )}
            </>
          );
        })()
      )}

      {hasBase && typeof cx === 'number' && typeof cy === 'number' && (() => {
        // If casaId is provided, use it directly to pick the logo (preferred)
        // If casaId is provided, use it to pick a house logo. Do not fallback to generic base image.
        const houseMap = {
          1: logoHawk,
          2: logoAngel,
          3: logoAndroid,
          4: logoAmmonite,
          5: logoAlien,
          6: logoAnimal,
        };

        const size = 20;

        if (typeof casaId !== 'undefined' && casaId !== null) {
          const href = houseMap[Number(casaId)];
          if (href) {
            // determine origin flag: prefer explicit prop, then try common planet locations inside `base` if present
            const isOrigen = (() => {
              if (esOrigen === true || esOrigen === 'true') return true;
              try {
                const p = base && (base.planeta || base.planet || base.planetData || base.planetaData);
                const candidates = [
                  esOrigen,
                  base && base.esOrigen,
                  p && (p.esOrigen || p.isOrigin || p.isOrigen || p.es_origen || p.is_origin),
                  base && base.planeta_esOrigen,
                  base && base.planetaEsOrigen,
                ];
                return candidates.some(v => v === true || v === 'true');
              } catch { return false; }
            })();

            const iconSize = 12;
            const extraDown = pointingUp ? 0 : 12; // when triangle points down, move images lower (reduced to position images a bit higher)
            const logoY = cy - size / 2 + extraDown;
            const iconX = cx - iconSize / 2;
            const iconY = cy - size / 2 - iconSize - 4 + extraDown; // place above the house logo, adjusted
            return (
              <>
                <image href={href} x={cx - size/2} y={logoY} width={size} height={size} pointerEvents="none" />
                {baseOwnerLabel && (
                  <text
                    x={cx}
                    y={cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={10}
                    fill="#ffffff"
                    pointerEvents="none"
                    style={{ fontWeight: 700, userSelect: 'none' }}
                  >
                    {baseOwnerLabel}
                  </text>
                )}
                {isOrigen && (
                  <image href={origenImg} x={iconX} y={iconY} width={iconSize} height={iconSize} pointerEvents="none" />
                )}
              </>
            );
          }
          return null;
        }

        // Fallback detection: try to infer a logo from the `base` object, but only render if we can map to one of the known logos.
        let logo = null;
        try {
          const key = (
            base && (
              base.casa || base.house || base.houseKey || base.logo || base.owner || base.jugadorId || base.userId || base.ownerId
            )
          ) || null;
          if (typeof key === 'string') {
            const k = key.toLowerCase();
            if (k.includes('hawk')) logo = logoHawk;
            else if (k.includes('angel')) logo = logoAngel;
            else if (k.includes('android') || k.includes('mask')) logo = logoAndroid;
            else if (k.includes('ammonite')) logo = logoAmmonite;
            else if (k.includes('alien') || k.includes('skull')) logo = logoAlien;
            else if (k.includes('animal')) logo = logoAnimal;
          }

          if (!logo && (key !== null && key !== undefined)) {
            const s = String(key);
            let h = 0;
            for (let i = 0; i < s.length; i++) {
              h = (h * 31 + s.charCodeAt(i)) >>> 0;
            }
            const arr = [logoHawk, logoAngel, logoAndroid, logoAmmonite, logoAlien, logoAnimal];
            logo = arr[h % arr.length];
          }
        } catch (err) {
          console.warn('Error al determinar logo de base', err);
        }

        if (logo) {
          const isOrigen = (() => {
            if (esOrigen === true || esOrigen === 'true') return true;
            try {
              const p = base && (base.planeta || base.planet || base.planetData || base.planetaData);
              const candidates = [
                esOrigen,
                base && base.esOrigen,
                p && (p.esOrigen || p.isOrigin || p.isOrigen || p.es_origen || p.is_origin),
                base && base.planeta_esOrigen,
                base && base.planetaEsOrigen,
              ];
              return candidates.some(v => v === true || v === 'true');
            } catch { return false; }
          })();

          const iconSize = 12;
          const extraDown = pointingUp ? 0 : 12;
          const logoY = cy - size / 2 + extraDown;
          const iconX = cx - iconSize / 2;
          const iconY = cy - size / 2 - iconSize - 4 + extraDown;
          return (
            <>
              <image href={logo} x={cx - size/2} y={logoY} width={size} height={size} pointerEvents="none" />
              {baseOwnerLabel && (
                <text
                  x={cx}
                  y={logoY + size + 12}
                  textAnchor='middle'
                  fontSize={10}
                  fill='#ffffff'
                  pointerEvents='none'
                  style={{ fontWeight: 700 }}
                >
                  {baseOwnerLabel}
                </text>
              )}
              {isOrigen && (
                <image href={origenImg} x={iconX} y={iconY} width={iconSize} height={iconSize} pointerEvents="none" />
              )}
            </>
          );
        }

        return null;
      })()}

        {/* Mostrar icono de nave(s) centrado en el territorio */}
        {Array.isArray(ships) && ships.length > 0 && typeof cx === 'number' && typeof cy === 'number' && (() => {
          // elegir la nave a mostrar (priorizar avanzada > intermedia > basica)
          const normalize = s => (s && s.nivel ? String(s.nivel).toLowerCase() : (s && s.level ? String(s.level).toLowerCase() : ''));
          const order = ['avanzada', 'avanz', 'intermedia', 'inter', 'basica', 'bas'];
          let chosen = ships[0];
          for (const pref of order) {
            const found = ships.find(s => normalize(s).includes(pref));
            if (found) { chosen = found; break; }
          }

          // mapear nivel a imagen
          const lvl = normalize(chosen);
          let href = nave_b;
          if (lvl.includes('avanz')) href = nave_a;
          else if (lvl.includes('inter')) href = nave_i;
          else href = nave_b;

          const size = 18;
          const x = cx - size / 2;
          const y = cy - size / 2;
          return (
            <>
              <image href={href} x={x} y={y} width={size} height={size} pointerEvents="none" />
            </>
          );
        })()}

      {showLabel && label && typeof cx === 'number' && typeof cy === 'number' && (
        <>
          {/* white pill background centered at (cx,cy) */}
          <rect
            x={cx - pillWidth / 2}
            y={cy - pillHeight / 2}
            rx={pillRx}
            ry={pillRx}
            width={pillWidth}
            height={pillHeight}
            fill="#ffffff"
            stroke="rgba(0, 0, 0, 0.06)"
            strokeWidth={0.5}
          />
          <text
            x={cx}
            y={cy}
            textAnchor="middle"
            alignmentBaseline="middle"
            fontSize={fontSize}
            fill="#071330" /* letras negras */
            fontWeight={700}
            pointerEvents="none" /* allow clicks to hit the parent g/polygon */
          >
            {label}
          </text>
        </>
      )}
      
    </g>
  );
} 