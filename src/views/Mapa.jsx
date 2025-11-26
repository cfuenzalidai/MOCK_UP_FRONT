import React, { useState } from 'react';
import Territorio from '../components/Territorio';
import "../assets/styles/Mapa.css";

export default function Mapa({ bases = [], jugadores = [], planetas = [] }) {
  const cell = 80; 
  const [territorios, setTerritorios] = useState(() => {
    const arr = [];
    let id = 1;

    const pattern = [5, 7, 7, 5];
    for (let r = 0; r < pattern.length; r++) {
      for (let c = 0; c < pattern[r]; c++) {
        arr.push({ id: id++, owner: null, hasBase: false, label: `T${id - 1}` });
      }
    }
    return arr;
  });
  const [selectedId, setSelectedId] = useState(null);

  function mulberry32(a) {
    return function() {
      var t = a += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
  }
  function seededShuffle(array, seedStr = 'map-seed-v1'){
    // simple hash to uint32 from seedStr
    let h = 2166136261 >>> 0;
    for (let i = 0; i < seedStr.length; i++) {
      h = Math.imul(h ^ seedStr.charCodeAt(i), 16777619);
    }
    const rand = mulberry32(h >>> 0);
    const a = array.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  const targetLabels = ['T2','T4','T6','T7','T11','T12','T13','T14','T18','T19','T21','T23'];
  const COLOR = {
    especia: '#ef4444', // rojo
    liebre: '#edd3b0',  // beige
    metal: '#c6c5c5ff',   // negro
    agua: '#60a5fa'     // celeste
  };
  const pool = seededShuffle([
    COLOR.especia, COLOR.especia, COLOR.especia,
    COLOR.metal, COLOR.metal, COLOR.metal,
    COLOR.liebre, COLOR.liebre, COLOR.liebre,
    COLOR.agua, COLOR.agua, COLOR.agua
  ], '111122');
  const assignment = {};
  targetLabels.forEach((lab, i) => { assignment[lab] = pool[i]; });
  function handleClick(id) {
    setSelectedId(prev => (prev === id ? null : id));
  }

  const geometries = [];
  const pattern = [5, 7, 7, 5];
  let idx = 0;
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;

  for (let r = 0; r < pattern.length; r++) {
    const cols = pattern[r];
    const offsetX = ((7 - cols) * (cell / 2)) / 2;
    for (let c = 0; c < cols; c++) {
  const flipRow = r === 1 || r === 2;
  const up = ((r + c) % 2 === 0) !== flipRow;
      const x = offsetX + c * (cell / 2);
      const y = r * (cell * 0.866);
      const pts = up
        ? [
            [x, y + cell * 0.866],
            [x + cell / 2, y],
            [x + cell, y + cell * 0.866]
          ]
        : [
            [x, y],
            [x + cell / 2, y + cell * 0.866],
            [x + cell, y]
          ];
      // actualizar bounding box
      pts.forEach(p => {
        if (p[0] < minX) minX = p[0];
        if (p[1] < minY) minY = p[1];
        if (p[0] > maxX) maxX = p[0];
        if (p[1] > maxY) maxY = p[1];
      });

      const pointsStr = pts.map(p => p.join(',')).join(' ');
      const cx = pts.reduce((s, p) => s + p[0], 0) / 3;
      const cy = pts.reduce((s, p) => s + p[1], 0) / 3;
      const t = territorios[idx++];
      // only assign resourceColor if this label is in the target set
      const resourceColor = targetLabels.includes(t.label) ? assignment[t.label] || null : null;
      // determine whether this territory's planet has a base
      // assume base objects have a `planetaId` field referencing the territory id
      const baseMatch = Array.isArray(bases) ? bases.find(b => String(b.planetaId) === String(t.id) || String(b.planetaId) === String(t.label) || String(b.planetaId) === String(t.label.replace(/^T/, ''))) : null;
      const hasBase = Boolean(baseMatch);
      // derive esOrigen from `planetas` prop if available (planet objects have esOrigen)
      let esOrigen = false;
      if (Array.isArray(planetas) && planetas.length > 0) {
        const planetMatch = planetas.find(p => String(p.id) === String(t.id) || String(p.id) === String(t.label) || String(p.id) === String(t.label.replace(/^T/, '')) || String(p.planetaId) === String(t.id));
        esOrigen = Boolean(planetMatch && (planetMatch.esOrigen === true || planetMatch.esOrigen === 'true' || planetMatch.isOrigin === true || planetMatch.isOrigin === 'true'));
      }
      // derive casaId from jugadores list if possible
      let casaId = null;
      if (baseMatch) {
        const player = Array.isArray(jugadores) ? jugadores.find(p => String(p.id) === String(baseMatch.jugadorId) || String(p.id) === String(baseMatch.userId) || String(p.usuarioId) === String(baseMatch.jugadorId) || String(p.usuarioId) === String(baseMatch.userId) || String(p.jugadorEnPartidaId) === String(baseMatch.jugadorEnPartidaId)) : null;
        casaId = player?.casa || baseMatch?.casa || null;
      }
      geometries.push({ ...t, pts, pointsStr, cx, cy, resourceColor, hasBase, base: baseMatch, casaId, esOrigen, up });
    }
  }

  // añadir un pequeño padding alrededor
  const pad = 12;
  const viewMinX = Math.floor(minX - pad);
  const viewMinY = Math.floor(minY - pad);
  const viewWidth = Math.ceil(maxX - minX + pad * 2);
  const viewHeight = Math.ceil(maxY - minY + pad * 2);

  const edgeMap = new Map();
  geometries.forEach(g => {
    const { pts } = g;
    for (let i = 0; i < 3; i++) {
      const a = pts[i];
      const b = pts[(i + 1) % 3];
      const key = edgeKey(a, b);
      if (!edgeMap.has(key)) edgeMap.set(key, { a, b });
    }
  });

  const edges = Array.from(edgeMap.values());
  // removed debug logs for `esOrigen` on bases — `esOrigen` belongs to planet objects, not bases
  // For geometries that are NOT in targetLabels, assign a unique ordered pair of colors
  // orderedPairs = all permutations of two distinct colors (4*3 = 12)
  const allColors = [COLOR.especia, COLOR.agua, COLOR.metal, COLOR.liebre];
  const orderedPairs = [];
  for (let i = 0; i < allColors.length; i++) {
    for (let j = 0; j < allColors.length; j++) {
      if (i === j) continue;
      orderedPairs.push([allColors[i], allColors[j]]);
    }
  }
  const shuffledPairs = seededShuffle(orderedPairs, 'split-pairs-seed-2025');

  // collect geometries that need split fills
  const needSplit = geometries.filter(g => !targetLabels.includes(g.label));
  // assign a unique ordered pair per geometry
  needSplit.forEach((g, i) => {
    const pair = shuffledPairs[i % shuffledPairs.length];
    // resourceColor will be an url() to a gradient id for split fills
    g.splitPair = pair; // store pair for later defs
    g.resourceColor = `url(#split-${g.label})`;
  });

  return (
    <div className="mapa-container">
      <svg
        className="map-svg"
        viewBox={`${viewMinX} ${viewMinY} ${viewWidth} ${viewHeight}`}
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {geometries.map(g => {
            if (!g.splitPair) return null;
            const id = `split-${g.label}`;
            const [c1,c2] = g.splitPair;
            return (
              <linearGradient id={id} key={id} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={c1} />
                <stop offset="50%" stopColor={c1} />
                <stop offset="50%" stopColor={c2} />
                <stop offset="100%" stopColor={c2} />
              </linearGradient>
            );
          })}
        </defs>
        {/* Territorios */}
        {geometries.map(g => (
          <Territorio
            key={g.id}
            id={g.id}
            points={g.pointsStr}
            label={g.label}
            ownerColor={g.owner}
            resourceColor={g.resourceColor}
            hasBase={g.hasBase}
            casaId={g.casaId}
            esOrigen={g.esOrigen}
            pointingUp={g.up}
            cx={g.cx}
            cy={g.cy}
            onClick={handleClick}
          />
        ))}

        {/* Bordes (base) */}
        <g className="map-edges" stroke="#ffffff" strokeWidth={2}>
          {edges.map((e, i) => (
            <line key={i} x1={e.a[0]} y1={e.a[1]} x2={e.b[0]} y2={e.b[1]} />
          ))}
        </g>
        {selectedId != null && (() => {
          const sel = geometries.find(g => g.id === selectedId);
          if (!sel) return null;
          return (
            <polygon
              points={sel.pointsStr}
              fill="none"
              stroke="#c99d0c89"
              strokeWidth={4}
              strokeLinejoin="round"
              strokeLinecap="round"
              pointerEvents="none"
            />
          );
        })()}
      </svg>
    </div>
  );
}

function getRandomOwnerColor() {
  const colors = ['#f97316', '#60a5fa', '#34d399', '#f472b6', '#a78bfa', '#facc15'];
  return colors[Math.floor(Math.random() * colors.length)];
}

function edgeKey(a, b) {
  const sa = `${a[0]},${a[1]}`;
  const sb = `${b[0]},${b[1]}`;
  return sa < sb ? `${sa}-${sb}` : `${sb}-${sa}`;
}