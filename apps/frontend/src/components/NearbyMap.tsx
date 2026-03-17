'use client';

import { useEffect, useRef, useState } from 'react';

interface Place {
  id: number;
  name: string;
  type: string;
  lat: number;
  lon: number;
  distance: number;
  address?: string;
  phone?: string;
  website?: string;
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function typeColor(type: string): string {
  if (type.includes('cafe') || type.includes('WiFi')) return '#ff9100';
  if (type.includes('shop') || type.includes('Shop')) return '#d500f9';
  return '#00e676';
}

// Broad Overpass query — catches anything telecom/internet related
function buildOverpassQuery(lat: number, lon: number, r = 25000): string {
  return `[out:json][timeout:30];
(
  node["office"="telecommunication"](around:${r},${lat},${lon});
  node["office"="internet_service_provider"](around:${r},${lat},${lon});
  node["shop"="telecommunication"](around:${r},${lat},${lon});
  node["shop"="mobile_phone"](around:${r},${lat},${lon});
  node["amenity"="internet_cafe"](around:${r},${lat},${lon});
  node["amenity"="wifi"](around:${r},${lat},${lon});
  node["telecom"](around:${r},${lat},${lon});
  node["internet_access"="yes"]["name"](around:${r},${lat},${lon});
  node["operator"]["office"](around:${r},${lat},${lon});
  way["office"="telecommunication"](around:${r},${lat},${lon});
  way["shop"="telecommunication"](around:${r},${lat},${lon});
  way["amenity"="internet_cafe"](around:${r},${lat},${lon});
);
out center tags;`;
}

function tagToType(tags: Record<string, string>): string {
  if (tags.office === 'telecommunication') return 'ISP / Telecom Office';
  if (tags.office === 'internet_service_provider') return 'Internet Provider';
  if (tags.shop === 'telecommunication') return 'Telecom Shop';
  if (tags.shop === 'mobile_phone') return 'Mobile / Internet Shop';
  if (tags.amenity === 'internet_cafe') return 'Internet Cafe';
  if (tags.amenity === 'wifi') return 'WiFi Hotspot';
  if (tags.telecom) return 'Telecom Infrastructure';
  return 'Internet Provider';
}

type ViewMode = 'map' | 'google';

export default function NearbyMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<import('leaflet').Map | null>(null);
  const markersRef = useRef<Map<number, import('leaflet').Marker>>(new Map());

  const [status, setStatus] = useState<'idle' | 'locating' | 'loading' | 'done' | 'error'>('idle');
  const [places, setPlaces] = useState<Place[]>([]);
  const [selected, setSelected] = useState<Place | null>(null);
  const [error, setError] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [view, setView] = useState<ViewMode>('map');

  async function loadMap() {
    setStatus('locating');
    setError('');
    setPlaces([]);
    setSelected(null);

    const pos = await new Promise<GeolocationPosition>((res, rej) =>
      navigator.geolocation.getCurrentPosition(res, rej, { timeout: 10000 })
    ).catch(() => null);

    if (!pos) {
      setError('Location access denied. Please allow location access.');
      setStatus('error');
      return;
    }

    const { latitude: lat, longitude: lon } = pos.coords;
    setCoords({ lat, lon });
    setStatus('loading');

    // Try Overpass API
    let elements: Array<{
      id: number;
      lat?: number; lon?: number;
      center?: { lat: number; lon: number };
      tags?: Record<string, string>;
    }> = [];

    const endpoints = [
      'https://overpass-api.de/api/interpreter',
      'https://overpass.kumi.systems/api/interpreter',
      'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
    ];

    const query = buildOverpassQuery(lat, lon, 25000);

    for (const endpoint of endpoints) {
      try {
        const res = await fetch(endpoint, { method: 'POST', body: query });
        const data = await res.json();
        elements = data.elements ?? [];
        break;
      } catch { continue; }
    }

    // Parse
    const results: Place[] = elements
      .map(el => {
        const elLat = el.lat ?? el.center?.lat;
        const elLon = el.lon ?? el.center?.lon;
        if (!elLat || !elLon) return null;
        const tags = el.tags ?? {};
        const name = tags.name ?? tags['name:en'] ?? tags.operator ?? tags.brand ?? 'Unknown Provider';
        if (name === 'Unknown Provider' && !tags.office && !tags.shop && !tags.amenity) return null;
        const address = [tags['addr:street'], tags['addr:housenumber'], tags['addr:city']]
          .filter(Boolean).join(', ');
        return {
          id: el.id,
          name,
          type: tagToType(tags),
          lat: elLat,
          lon: elLon,
          distance: haversine(lat, lon, elLat, elLon),
          address: address || undefined,
          phone: tags.phone ?? tags['contact:phone'],
          website: tags.website ?? tags['contact:website'],
        } as Place;
      })
      .filter((p): p is Place => p !== null)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 30);

    setPlaces(results);

    // Init Leaflet map
    const L = (await import('leaflet')).default;
    if (typeof document !== 'undefined' && !document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    if (!mapRef.current) return;
    if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; }
    markersRef.current.clear();

    const map = L.map(mapRef.current).setView([lat, lon], results.length > 0 ? 13 : 12);
    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OSM</a> © <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd', maxZoom: 19,
    }).addTo(map);

    // User marker
    const userIcon = L.divIcon({
      className: '',
      html: `<div style="width:16px;height:16px;border-radius:50%;background:#00e5ff;border:3px solid #fff;box-shadow:0 0 0 4px rgba(0,229,255,.25),0 0 20px #00e5ff;"></div>`,
      iconSize: [16, 16], iconAnchor: [8, 8],
    });
    L.marker([lat, lon], { icon: userIcon }).addTo(map)
      .bindPopup('<b style="color:#00e5ff">📍 You are here</b>');

    // Place markers
    results.forEach(p => {
      const color = typeColor(p.type);
      const icon = L.divIcon({
        className: '',
        html: `<div style="position:relative;width:32px;height:32px">
          <div style="
            width:32px;height:32px;border-radius:50% 50% 50% 0;
            background:${color};border:2px solid rgba(255,255,255,.8);
            box-shadow:0 0 12px ${color},0 0 24px ${color}60;
            transform:rotate(-45deg);
          "></div>
          <div style="position:absolute;top:6px;left:7px;font-size:13px;transform:rotate(0deg)">📡</div>
        </div>`,
        iconSize: [32, 32], iconAnchor: [16, 32],
      });

      const marker = L.marker([p.lat, p.lon], { icon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family:sans-serif;min-width:190px;padding:2px">
            <div style="color:${color};font-weight:700;font-size:14px;margin-bottom:4px">${p.name}</div>
            <div style="color:#aaa;font-size:11px;margin-bottom:8px;text-transform:uppercase;letter-spacing:.05em">${p.type}</div>
            ${p.address ? `<div style="color:#ccc;font-size:12px;margin-bottom:3px">📍 ${p.address}</div>` : ''}
            ${p.phone ? `<div style="color:#ccc;font-size:12px;margin-bottom:3px">📞 ${p.phone}</div>` : ''}
            ${p.website ? `<div style="margin-bottom:3px"><a href="${p.website}" target="_blank" rel="noopener" style="color:${color};font-size:12px">🌐 Visit Website</a></div>` : ''}
            <div style="color:#555;font-size:11px;margin-top:6px;border-top:1px solid #333;padding-top:6px">${p.distance.toFixed(2)} km away</div>
          </div>
        `);

      marker.on('click', () => setSelected(p));
      markersRef.current.set(p.id, marker);
    });

    setStatus('done');
  }

  function focusPlace(p: Place) {
    setSelected(p);
    const map = mapInstanceRef.current;
    const marker = markersRef.current.get(p.id);
    if (map && marker) {
      map.setView([p.lat, p.lon], 16, { animate: true });
      marker.openPopup();
    }
  }

  // Google Maps embed search URL
  const googleSearchUrl = coords
    ? `https://www.google.com/maps/search/internet+service+provider/@${coords.lat},${coords.lon},13z`
    : null;

  useEffect(() => () => { mapInstanceRef.current?.remove(); }, []);

  const showContent = status === 'loading' || status === 'done';

  return (
    <div className="nearby-wrap">
      <div className="nearby-header">
        <div className="nearby-title">Nearby Internet Providers</div>
        <div className="nearby-sub">ISP offices, telecom shops &amp; internet cafes near you</div>
      </div>

      {status === 'idle' && (
        <button className="nearby-btn" onClick={loadMap}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style={{ marginRight: 8 }}>
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
          Find Nearby Providers
        </button>
      )}

      {(status === 'locating' || status === 'loading') && (
        <div className="nearby-loading">
          <div className="nearby-spinner" />
          <span>{status === 'locating' ? 'Getting your location…' : 'Searching for providers…'}</span>
        </div>
      )}

      {status === 'error' && (
        <div className="nearby-error">
          <span>⚠ {error}</span>
          <button className="nearby-btn nearby-btn--sm" onClick={loadMap} style={{ marginTop: 12 }}>Try Again</button>
        </div>
      )}

      {showContent && (
        <div className="nearby-content">
          {/* View toggle */}
          {status === 'done' && (
            <div className="nearby-tabs">
              <button
                className={`nearby-tab${view === 'map' ? ' nearby-tab--active' : ''}`}
                onClick={() => setView('map')}
              >OSM Map</button>
              <button
                className={`nearby-tab${view === 'google' ? ' nearby-tab--active' : ''}`}
                onClick={() => setView('google')}
              >Google Maps</button>
            </div>
          )}

          {/* OSM Leaflet map */}
          <div style={{ display: view === 'map' ? 'block' : 'none' }}>
            <div ref={mapRef} className="nearby-map" />
          </div>

          {/* Google Maps iframe fallback */}
          {view === 'google' && googleSearchUrl && (
            <div className="nearby-google-wrap">
              <div className="nearby-google-note">
                Opens Google Maps search for internet providers near your location.
              </div>
              <a
                href={googleSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="nearby-google-btn"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" style={{ marginRight: 8 }}>
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                </svg>
                Open in Google Maps
              </a>
            </div>
          )}

          {/* Results list */}
          {status === 'done' && view === 'map' && (
            <>
              {places.length === 0 ? (
                <div className="nearby-empty">
                  <div style={{ marginBottom: 8 }}>No providers found in OpenStreetMap within 25km.</div>
                  <div style={{ fontSize: 12, opacity: 0.5, marginBottom: 16 }}>
                    OSM data is limited in some regions. Try Google Maps view instead.
                  </div>
                  <button
                    className="nearby-btn nearby-btn--sm"
                    style={{ background: '#4285f4' }}
                    onClick={() => setView('google')}
                  >Switch to Google Maps →</button>
                </div>
              ) : (
                <div className="nearby-list">
                  {places.slice(0, 10).map(p => {
                    const color = typeColor(p.type);
                    const isActive = selected?.id === p.id;
                    return (
                      <div
                        key={p.id}
                        className={`nearby-item${isActive ? ' nearby-item--active' : ''}`}
                        onClick={() => focusPlace(p)}
                        style={{ borderColor: isActive ? color : undefined }}
                      >
                        <div className="nearby-item__dot" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
                        <div className="nearby-item__info">
                          <span className="nearby-item__name">{p.name}</span>
                          <span className="nearby-item__type">{p.type}</span>
                          {p.address && <span className="nearby-item__addr">📍 {p.address}</span>}
                        </div>
                        <div className="nearby-item__right">
                          <span className="nearby-item__dist">{p.distance.toFixed(1)} km</span>
                          {p.phone && <span className="nearby-item__phone">{p.phone}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
