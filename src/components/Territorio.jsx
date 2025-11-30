
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
      
      {/* Logo arriba, nombre en el centro, origen abajo: renderizados más abajo para evitar duplicados */}

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

            const iconSize = 12;
            const extraDown = pointingUp ? 0 : 6;
            // place logo above the name (name will be at cy)
            const logoY = cy - size - 8 + extraDown;
            const iconX = cx - iconSize / 2;
            const iconY = logoY - iconSize - 4;
            return (
              <>
                <image href={href} x={cx - size/2} y={logoY} width={size} height={size} pointerEvents="none" />
                {/* Mostrar solo el logo de la casa y el nombre del propietario; el icono de origen
                    se renderiza únicamente fuera del bloque de base cuando `esOrigen` es true
                    (ver el condicional arriba que usa `esOrigen && !hasBase`). */}
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
          const iconSize = 12;
          const extraDown = pointingUp ? 0 : 6;
          const logoY = cy - size - 8 + extraDown;
          return (
            <>
              <image href={logo} x={cx - size/2} y={logoY} width={size} height={size} pointerEvents="none" />
            </>
          );
        }

        return null;
      })()}

        {/* Mostrar hasta 2 naves pequeñas en la base del triángulo */}
        {Array.isArray(ships) && ships.length > 0 && typeof cx === 'number' && typeof cy === 'number' && (() => {
          // parse points string into vertices [[x,y],...]
          let verts = [];
          try {
            verts = (points || '').split(' ').map(p => p.split(',').map(Number));
          } catch (e) { verts = []; }
          if (!Array.isArray(verts) || verts.length < 3) return null;

          const size = 12; // small icons
          const chooseHref = (s) => {
            const lvl = (s && (s.nivel || s.level) ? String(s.nivel || s.level).toLowerCase() : '');
            if (lvl.includes('avanz')) return nave_a;
            if (lvl.includes('inter')) return nave_i;
            return nave_b;
          };

          // determine base vertices: the two with largest y (pointingUp) or smallest y (pointingDown)
          const indexed = verts.map((v, i) => ({ i, x: v[0], y: v[1] }));
          const sortedByY = indexed.slice().sort((a,b) => a.y - b.y);
          let baseIndices;
          if (pointingUp) {
            // base is the bottom edge -> two with largest y
            baseIndices = [sortedByY[2].i, sortedByY[1].i];
          } else {
            // pointing down -> base is top edge -> two with smallest y
            baseIndices = [sortedByY[0].i, sortedByY[1].i];
          }

          const imgs = [];
          const maxToShow = Math.min(2, ships.length);
          for (let k = 0; k < maxToShow; k++) {
            const vi = baseIndices[k % 2];
            const v = verts[vi];
            if (!v) continue;
            // move slightly inward toward centroid (60% corner, 40% center)
            const px = Math.round(v[0] * 0.6 + cx * 0.4);
            const py = Math.round(v[1] * 0.6 + cy * 0.4);
            const href = chooseHref(ships[k]);
            imgs.push(<image key={`ship-${k}`} href={href} x={px - size/2} y={py - size/2} width={size} height={size} pointerEvents="none" />);
          }
          return (<>{imgs}</>);
        })()}

      {/* Owner name centered, then origin icon below */}
      {baseOwnerLabel && typeof cx === 'number' && typeof cy === 'number' && (
        <>
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
        </>
      )}

      {/* origen icon below name */}
      {esOrigen && typeof cx === 'number' && typeof cy === 'number' && (
        (() => {
          const iconSize = 12;
          const iconX = cx - iconSize / 2;
          // move origin icon a bit closer to the name (slightly above previous position)
          const iconY = cy + 6;
          return (
            <>
              <image href={origenImg} x={iconX} y={iconY} width={iconSize} height={iconSize} pointerEvents="none" />
              {originOwnerLabel && originOwnerLabel !== baseOwnerLabel && (
                <text
                  x={cx}
                  y={iconY + iconSize + 8}
                  textAnchor="middle"
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