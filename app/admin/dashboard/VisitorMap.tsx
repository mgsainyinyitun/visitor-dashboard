'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { VisitorData } from '@/lib/type';

interface VisitorMapProps {
    visitors: VisitorData[];
    hoveredVisitor: VisitorData | null;
    onVisitorHover: (visitor: VisitorData | null) => void;
    getMapCenter: () => [number, number];
}

export default function VisitorMap({ visitors, hoveredVisitor, onVisitorHover, getMapCenter }: VisitorMapProps) {
    useEffect(() => {
        if (typeof window !== 'undefined') {
            delete (L.Icon.Default.prototype as any)._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
                iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
            });
        }
    }, []);

    return (
        <MapContainer
            center={getMapCenter()}
            zoom={2}
            minZoom={2}
            maxZoom={8}
            style={{ height: '100%', width: '100%', background: '#1e293b' }}
            scrollWheelZoom={true}
            worldCopyJump={true}
            dragging={true}
            className="rounded-lg"
        >
            <TileLayer
                attribution='&copy; <a href="https://carto.com/">CARTO</a> & contributors'
                url="https://cartodb-basemaps-a.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png"
            />
            {visitors.map((visitor) =>
                (typeof visitor.latitude === 'number' && typeof visitor.longitude === 'number') ? (
                    <CircleMarker
                        key={visitor.id}
                        center={[visitor.latitude, visitor.longitude]}
                        radius={hoveredVisitor?.id === visitor.id ? 9 : 7}
                        pathOptions={{
                            color: '#3b82f6',
                            fillColor: '#60a5fa',
                            fillOpacity: 0.7,
                            opacity: hoveredVisitor?.id === visitor.id ? 1 : 0.7,
                        }}
                        eventHandlers={{
                            mouseover: () => onVisitorHover(visitor),
                            mouseout: () => onVisitorHover(null),
                        }}
                    >
                        <Tooltip direction="top" offset={[0, -12]} opacity={1} className="!bg-slate-800 !text-white !border-slate-600">
                            <span>
                                <strong>{visitor.city}, {visitor.country}</strong>
                                <br />
                                {visitor.ip}
                            </span>
                        </Tooltip>
                        <Popup>
                            <div className="space-y-2">
                                <div>
                                    <span className="font-semibold">Location:</span> {visitor.city}, {visitor.country}
                                </div>
                                <div>
                                    <span className="font-semibold">IP:</span> {visitor.ip}
                                </div>
                                <div>
                                    <span className="font-semibold">ISP:</span> {visitor.isp}
                                </div>
                                <div>
                                    <span className="font-semibold">Time:</span> {new Date(visitor.timestamp).toLocaleString()}
                                </div>
                                {visitor.screenResolution && (
                                    <div>
                                        <span className="font-semibold">Screen:</span> {visitor.screenResolution}
                                    </div>
                                )}
                            </div>
                        </Popup>
                    </CircleMarker>
                ) : null
            )}
        </MapContainer>
    );
}

