import React from 'react';

export default function Territorio({ id, points, fill = 'transparent', label, onClick, ownerColor, hasBase, cx, cy, resourceColor }){
  // points: string "x1,y1 x2,y2 x3,y3" but polygons will be rendered without stroke
  // Priority: ownerColor (player) > resourceColor (tile) > default fill
  const displayFill = ownerColor || resourceColor || fill;
  return (
    <g className="territorio" data-id={id} onClick={() => onClick && onClick(id)} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      {/* polygon with no stroke; borders are drawn globally to avoid double-stroke gaps */}
  <polygon points={points} fill={displayFill} stroke="none" fillOpacity={1} />

      {hasBase && typeof cx === 'number' && typeof cy === 'number' && (
        <circle cx={cx} cy={cy} r={6} fill="#c026d3" />
      )}

      {label && typeof cx === 'number' && typeof cy === 'number' && (
        <text x={cx} y={cy} textAnchor="middle" alignmentBaseline="middle" fontSize={10} fill="#071330">{label}</text>
      )}
    </g>
  );
}
