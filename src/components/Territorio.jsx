import React from 'react';

export default function Territorio({ id, points, fill = 'transparent', label, onClick, ownerColor, hasBase, cx, cy, resourceColor }){
  // points: string "x1,y1 x2,y2 x3,y3"
  // Priority: ownerColor (player) > resourceColor (tile) > default fill
  const displayFill = ownerColor || resourceColor || fill;

  // estimate text width in pixels based on character count (simple approximation)
  const fontSize = 10;
  let pillWidth = 28; // minimum pill width
  if (label) {
    // average char width ~ 0.6 * fontSize, add padding
    pillWidth = Math.max(pillWidth, Math.ceil(label.length * fontSize * 0.6) + 12);
  }
  const pillHeight = 16;
  const pillRx = 8; // pill corner radius

  return (
    <g className="territorio" data-id={id} onClick={() => onClick && onClick(id)} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      {/* polygon with no stroke; borders are drawn globally to avoid double-stroke gaps */}
      <polygon points={points} fill={displayFill} stroke="none" fillOpacity={1} />

      {hasBase && typeof cx === 'number' && typeof cy === 'number' && (
        <circle cx={cx} cy={cy} r={6} fill="#c026d3" />
      )}

      {label && typeof cx === 'number' && typeof cy === 'number' && (
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
            stroke="rgba(0,0,0,0.06)"
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
            style={{ pointerEvents: 'none' }} /* allow clicks to hit the parent g/polygon */
          >
            {label}
          </text>
        </>
      )}
    </g>
  );
} 