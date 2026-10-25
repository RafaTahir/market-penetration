import { useId } from 'react';
import {
  CITIES, FACTORS, evaluateCity,
  type CityId, type PlannerState,
} from '../../services/entryPlanner';
import { SEA_COUNTRIES, SEA_GEOGRAPHY_SOURCE, projectSeaPoint } from './seaGeography';
import './visualisations.css';

interface CityEvidenceMapProps {
  state: PlannerState;
  activeCity: CityId;
  onSelectCity: (city: CityId) => void;
  today: string;
}

// Approximate city-centre coordinates; these anchors do not define market boundaries.
const CITY_ANCHORS: Record<CityId, { longitude: number; latitude: number }> = {
  jakarta: { longitude: 106.8456, latitude: -6.2088 },
  manila: { longitude: 120.9842, latitude: 14.5995 },
};

const COUNTRY_LABELS = [
  { label: 'THAILAND', longitude: 101.5, latitude: 16.5 },
  { label: 'VIETNAM', longitude: 108, latitude: 18.7 },
  { label: 'MALAYSIA', longitude: 113.5, latitude: 3 },
  { label: 'INDONESIA', longitude: 116.6, latitude: -4.7 },
  { label: 'PHILIPPINES', longitude: 124.8, latitude: 11.6 },
];

export function CityEvidenceMap({ state, activeCity, onSelectCity, today }: CityEvidenceMapProps) {
  const id = useId().replace(/:/g, '');
  const cities = CITIES.map(city => ({ city, result: evaluateCity(state, city.id, today) }));
  const total = cities.reduce((sum, { result }) => sum + result.qualifiedCount, 0);

  return (
    <figure className="evidence-map" aria-labelledby={`${id}-title`}>
      <figcaption className="visual-heading">
        <div>
          <span className="visual-kicker">Southeast Asia</span>
          <h2 id={`${id}-title`}>Two cities. Your next move.</h2>
        </div>
        <span className="visual-coverage"><strong>{total}<span>/{FACTORS.length * CITIES.length}</span></strong><small>factors documented</small></span>
      </figcaption>

      <div className="evidence-map-canvas">
        <svg className="evidence-map-geography" viewBox="0 0 740 630" aria-hidden="true" focusable="false">
          <defs>
            <pattern id={`${id}-grid`} width="92" height="92" patternUnits="userSpaceOnUse">
              <path d="M92 0H0V92" className="evidence-map-grid" fill="none" />
            </pattern>
            <clipPath id={`${id}-clip`}><rect width="740" height="630" /></clipPath>
          </defs>
          <rect width="740" height="630" fill={`url(#${id}-grid)`} />
          <g clipPath={`url(#${id}-clip)`}>
            {SEA_COUNTRIES.map(country => (
              <path key={country.id} d={country.path} className={`evidence-map-land${country.id === 'idn' ? ' evidence-map-indonesia' : country.id === 'phl' ? ' evidence-map-philippines' : ''}`} />
            ))}
          </g>
          {COUNTRY_LABELS.map(country => {
            const point = projectSeaPoint(country.longitude, country.latitude);
            return <text key={country.label} x={point.x} y={point.y} className="evidence-map-country" textAnchor="middle">{country.label}</text>;
          })}
          <g className="evidence-map-compass" transform="translate(680 470)">
            <text x="0" y="-21" textAnchor="middle">N</text>
            <path d="M0 -13L-5 6L0 2L5 6Z" />
            <path d="M0 2V20" fill="none" />
          </g>
          <text x="52" y="602" className="evidence-map-coordinate">95°E</text>
          <text x="680" y="602" className="evidence-map-coordinate" textAnchor="end">130°E</text>
        </svg>

        {cities.map(({ city, result }) => {
          const anchor = CITY_ANCHORS[city.id];
          const point = projectSeaPoint(anchor.longitude, anchor.latitude);
          const selected = activeCity === city.id;
          return (
            <button
              key={city.id}
              type="button"
              className={`evidence-map-pin${selected ? ' is-selected' : ''}`}
              data-city={city.id}
              style={{ left: `${point.x / 740 * 100}%`, top: `${point.y / 630 * 100}%` }}
              aria-pressed={selected}
              aria-label={`${city.name}, ${city.country}. ${result.qualifiedCount} of ${FACTORS.length} factors documented with recent self-reported evidence. Select city.`}
              onClick={() => onSelectCity(city.id)}
            >
              <svg viewBox="0 0 52 52" className="evidence-map-marker" aria-hidden="true" focusable="false">
                <circle className="evidence-map-pin-halo" cx="26" cy="26" r="24" />
                {FACTORS.map((factor, index) => (
                  <circle
                    key={factor.id}
                    cx="26" cy="26" r="18"
                    fill="none"
                    className={`evidence-map-ring${result.factors[index].qualified ? ' is-documented' : ''}`}
                    strokeDasharray="17.4 95.7"
                    transform={`rotate(${index * 72 - 90} 26 26)`}
                  />
                ))}
                <circle className="evidence-map-pin-core" cx="26" cy="26" r="7" />
                <circle className="evidence-map-pin-center" cx="26" cy="26" r="2.3" />
              </svg>
              <span className="evidence-map-pin-label">
                <span className="evidence-map-city">{city.name}<svg viewBox="0 0 14 14" aria-hidden="true"><path d="M3 7h8M7 3l4 4-4 4" /></svg></span>
                <span className="evidence-map-pin-coverage"><strong>{result.qualifiedCount}<span>/{FACTORS.length}</span></strong><small>documented</small></span>
              </span>
            </button>
          );
        })}

        <span className="evidence-map-sea" aria-hidden="true">SOUTH CHINA<br />SEA</span>
      </div>

      <div className="visual-map-bottom">
        <span className="visual-map-legend"><span className="visual-legend-ring" aria-hidden="true" />Evidence coverage <span className="visual-map-legend-note">· select a city</span></span>
        <details className="visual-source-details">
          <summary>Map &amp; evidence</summary>
          <div>
            <p>Rings count documented factors, from 0 to 5. Coverage is not market opportunity. Assessments are self-reported; source contents are unverified.</p>
            <p>Outlines: <a href={SEA_GEOGRAPHY_SOURCE.url} target="_blank" rel="noopener noreferrer">{SEA_GEOGRAPHY_SOURCE.title}</a>, public domain. {SEA_GEOGRAPHY_SOURCE.projection}</p>
            <p>Approximate city-centre anchors: Jakarta 6.2088°S, 106.8456°E; Manila 14.5995°N, 120.9842°E. Pins do not define service areas or administrative boundaries.</p>
          </div>
        </details>
      </div>
    </figure>
  );
}
