'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { collection, onSnapshot, query, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Globe, Users, MapPin, Clock, TrendingUp, Home } from 'lucide-react';
import Link from 'next/link';
import { VisitorData, Stats } from '@/lib/type';

// Dynamically import the map component with SSR disabled
const VisitorMap = dynamic(() => import('./VisitorMap'), {
    ssr: false,
    loading: () => <div className="flex items-center justify-center h-full text-slate-400">Loading map...</div>
});

export default function AdminDashboard() {
    const [visitors, setVisitors] = useState<VisitorData[]>([]);
    const [hoveredVisitor, setHoveredVisitor] = useState<VisitorData | null>(null);
    const [stats, setStats] = useState<Stats>({ total: 0, countries: 0, today: 0 });
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const q = query(
            collection(db, 'visitors'),
            orderBy('timestamp', 'desc'),
            limit(100)
        );

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const visitorsData: VisitorData[] = snapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        ...data,
                        timestamp: data.timestamp instanceof Timestamp
                            ? data.timestamp.toDate().toISOString()
                            : data.timestamp
                    } as VisitorData;
                });

                setVisitors(visitorsData);
                updateStats(visitorsData);
                setLoading(false);
            },
            (error) => {
                console.error('Error fetching visitors:', error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    const updateStats = (data: VisitorData[]): void => {
        const uniqueCountries = new Set(data.map(v => v.country)).size;
        const today = data.filter(v => {
            const visitDate = new Date(v.timestamp);
            const now = new Date();
            return visitDate.toDateString() === now.toDateString();
        }).length;

        setStats({
            total: data.length,
            countries: uniqueCountries,
            today: today
        });
    };

    // Find map center based on visitor locations, fallback to somewhere global if no visitors
    const getMapCenter = (): [number, number] => {
        if (!visitors || visitors.length === 0) return [20, 0];
        const validCoords = visitors
            .filter(v => typeof v.latitude === 'number' && typeof v.longitude === 'number')
            .map(v => [v.latitude, v.longitude] as [number, number]);
        if (validCoords.length === 0) return [20, 0];
        const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
        return [
            avg(validCoords.map(c => c[0])),
            avg(validCoords.map(c => c[1]))
        ] as [number, number];
    };

    const getCountryCount = (): [string, number][] => {
        const counts: Record<string, number> = {};
        visitors.forEach(v => {
            if (v.country) {
                counts[v.country] = (counts[v.country] || 0) + 1;
            }
        });
        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                <div className="text-white text-xl">Loading dashboard...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Globe className="w-10 h-10 text-blue-400" />
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                Visitor Analytics Dashboard
                            </h1>
                        </div>
                        <p className="text-slate-400 ml-13">Real-time visitor tracking and geolocation</p>
                    </div>

                    <Link
                        href="/"
                        className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg transition-colors"
                    >
                        <Home className="w-4 h-4" />
                        Home
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-sm mb-1">Total Visitors</p>
                                <p className="text-3xl font-bold text-blue-400">{stats.total}</p>
                            </div>
                            <Users className="w-12 h-12 text-blue-400 opacity-50" />
                        </div>
                    </div>

                    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-sm mb-1">Countries</p>
                                <p className="text-3xl font-bold text-purple-400">{stats.countries}</p>
                            </div>
                            <MapPin className="w-12 h-12 text-purple-400 opacity-50" />
                        </div>
                    </div>

                    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-sm mb-1">Today's Visits</p>
                                <p className="text-3xl font-bold text-green-400">{stats.today}</p>
                            </div>
                            <TrendingUp className="w-12 h-12 text-green-400 opacity-50" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Map Section */}
                    <div className="lg:col-span-2 bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <Globe className="w-5 h-5 text-blue-400" />
                            Visitor Map
                        </h2>

                        <div className="relative bg-slate-900/50 rounded-lg overflow-hidden" style={{ height: '500px' }}>
                            <VisitorMap
                                visitors={visitors}
                                hoveredVisitor={hoveredVisitor}
                                onVisitorHover={setHoveredVisitor}
                                getMapCenter={getMapCenter}
                            />
                            {/* Manual tooltip (if any marker is hovered, show floating panel at absolute position, similar to original) */}
                            {hoveredVisitor && (
                                <div className="absolute top-4 right-4 bg-slate-800 border border-slate-600 rounded-lg p-4 shadow-xl max-w-xs z-10">
                                    <div className="flex items-start gap-3">
                                        <MapPin className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" />
                                        <div className="space-y-2 text-sm">
                                            <div>
                                                <p className="text-slate-400">Location</p>
                                                <p className="font-semibold">{hoveredVisitor.city}, {hoveredVisitor.country}</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-400">IP Address</p>
                                                <p className="font-mono text-xs">{hoveredVisitor.ip}</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-400">ISP</p>
                                                <p className="text-xs">{hoveredVisitor.isp}</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-400">Time</p>
                                                <p className="text-xs">{new Date(hoveredVisitor.timestamp).toLocaleString()}</p>
                                            </div>
                                            {hoveredVisitor.screenResolution && (
                                                <div>
                                                    <p className="text-slate-400">Screen</p>
                                                    <p className="text-xs">{hoveredVisitor.screenResolution}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-purple-400" />
                                Top Countries
                            </h3>
                            <div className="space-y-3">
                                {getCountryCount().length > 0 ? (
                                    getCountryCount().map(([country, count], index) => (
                                        <div key={country} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-slate-400 text-sm w-4">{index + 1}</span>
                                                <span className="text-sm">{country}</span>
                                            </div>
                                            <span className="text-blue-400 font-semibold">{count}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-slate-400 text-sm">No data yet</p>
                                )}
                            </div>
                        </div>

                        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-green-400" />
                                Recent Visitors
                            </h3>
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {visitors.slice(0, 10).length > 0 ? (
                                    visitors.slice(0, 10).map((visitor) => (
                                        <div
                                            key={visitor.id}
                                            className="flex items-start gap-3 p-3 bg-slate-900/50 rounded-lg hover:bg-slate-900/70 transition-colors cursor-pointer"
                                            onMouseEnter={() => setHoveredVisitor(visitor)}
                                            onMouseLeave={() => setHoveredVisitor(null)}
                                        >
                                            <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0 mt-1" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{visitor.city || 'Unknown'}</p>
                                                <p className="text-xs text-slate-400 truncate">{visitor.country || 'Unknown'}</p>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    {new Date(visitor.timestamp).toLocaleTimeString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-slate-400 text-sm">No visitors yet</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-400">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span>Live updates enabled</span>
                </div>
            </div>
        </div>
    );
}