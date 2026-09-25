import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  Ship, Anchor, Navigation, Compass, Wind, Droplets, 
  Clock, Gauge, AlertCircle, Play, Pause, FastForward, 
  RotateCcw, Search, Eye, ExternalLink, MessageSquare, 
  Maximize2, Radio, CheckCircle2, ChevronRight, X
} from 'lucide-react';
import { Vessel, Port, Route, Booking, VoyageLog } from '../../types';
import { vesselService, portService, routeService, bookingService, voyageService } from '../../services/db';

interface MaritimeTrackingMapProps {
  initialSearchBL?: string;
  onOpenBookingDetails?: (booking: Booking) => void;
  onOpenNotificationModal?: (booking: Booking) => void;
}

export const MaritimeTrackingMap: React.FC<MaritimeTrackingMapProps> = ({
  initialSearchBL = '',
  onOpenBookingDetails,
  onOpenNotificationModal,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [id: string]: L.Marker }>({});
  const routeLayersRef = useRef<L.Polyline[]>([]);

  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [ports, setPorts] = useState<Port[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [voyages, setVoyages] = useState<VoyageLog[]>([]);

  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null);
  const [selectedPort, setSelectedPort] = useState<Port | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [searchQuery, setSearchQuery] = useState(initialSearchBL);
  const [searchError, setSearchError] = useState<string | null>(null);

  // AIS Simulation State
  const [isSimulating, setIsSimulating] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1);
  const [lastPingTime, setLastPingTime] = useState<string>(new Date().toLocaleTimeString());

  // Load database
  const loadData = () => {
    const v = vesselService.getAll();
    const p = portService.getAll();
    const r = routeService.getAll();
    const b = bookingService.getAll();
    const vy = voyageService.getAll();

    setVessels(v);
    setPorts(p);
    setRoutes(r);
    setBookings(b);
    setVoyages(vy);

    if (v.length > 0 && !selectedVessel) {
      setSelectedVessel(v[0]);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // Prevent double init

    // Center of Indonesian Archipelago
    const map = L.map(mapContainerRef.current, {
      center: [-2.5, 118.0],
      zoom: 5,
      minZoom: 4,
      maxZoom: 13,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Dark nautical theme tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO Nautical AIS',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Render Routes and Ports on Map
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || ports.length === 0) return;

    // Clear old route lines
    routeLayersRef.current.forEach((l) => map.removeLayer(l));
    routeLayersRef.current = [];

    // Draw route polylines
    routes.forEach((rt) => {
      if (rt.waypoints && rt.waypoints.length > 1) {
        const polyline = L.polyline(rt.waypoints, {
          color: '#06b6d4',
          weight: 2.5,
          opacity: 0.7,
          dashArray: '6, 8',
        }).addTo(map);

        polyline.bindTooltip(
          `<div class="text-xs font-bold text-cyan-900 font-sans">${rt.name} (${rt.distanceNM} NM)</div>`,
          { sticky: true }
        );

        routeLayersRef.current.push(polyline);
      }
    });

    // Draw port markers
    ports.forEach((port) => {
      const portIcon = L.divIcon({
        className: 'custom-port-icon',
        html: `
          <div class="relative group cursor-pointer">
            <div class="w-7 h-7 rounded-xl bg-slate-900/90 border border-amber-400/80 text-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/20 hover:scale-125 transition-transform">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2v20m0 0l-5-5m5 5l5-5M4 12a8 8 0 1016 0H4z"/>
              </svg>
            </div>
            <div class="absolute -bottom-5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-slate-900/90 text-[10px] font-mono font-bold text-amber-300 rounded border border-amber-500/30 whitespace-nowrap shadow">
              ${port.code}
            </div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker(port.coordinates, { icon: portIcon }).addTo(map);
      marker.on('click', () => {
        setSelectedPort(port);
        setSelectedVessel(null);
        map.setView(port.coordinates, 8, { animate: true });
      });
    });
  }, [ports, routes]);

  // Update Vessel Markers on Map
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || vessels.length === 0) return;

    vessels.forEach((vessel) => {
      const isSelected = selectedVessel?.id === vessel.id;
      const shipColor =
        vessel.type === 'Container'
          ? '#06b6d4'
          : vessel.type === 'Bulk Carrier'
          ? '#eab308'
          : vessel.type === 'Tanker'
          ? '#ef4444'
          : '#a855f7';

      const vesselIcon = L.divIcon({
        className: 'custom-vessel-icon',
        html: `
          <div class="relative group cursor-pointer ${isSelected ? 'scale-125 z-50' : 'hover:scale-110'}">
            <!-- Radar ping for moving vessels -->
            ${vessel.status === 'Underway' ? `<div class="absolute -inset-2 rounded-full bg-cyan-400/30 radar-ping"></div>` : ''}
            
            <div style="transform: rotate(${vessel.heading}deg); border-color: ${shipColor};" class="relative w-8 h-8 rounded-full bg-slate-950 border-2 text-white flex items-center justify-center shadow-2xl transition-all">
              <svg class="w-4 h-4" style="color: ${shipColor}" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L4 20l8-3 8 3L12 2z"/>
              </svg>
            </div>

            <!-- Vessel Name Badge -->
            <div class="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-slate-900/95 text-[10px] font-bold text-white rounded-md border border-slate-700 whitespace-nowrap shadow-lg flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full ${vessel.status === 'Underway' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}"></span>
              ${vessel.name.replace('MV ', '').replace('KM ', '')}
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      if (markersRef.current[vessel.id]) {
        // Update position
        markersRef.current[vessel.id].setLatLng([vessel.currentLat, vessel.currentLng]);
        markersRef.current[vessel.id].setIcon(vesselIcon);
      } else {
        const marker = L.marker([vessel.currentLat, vessel.currentLng], { icon: vesselIcon }).addTo(map);
        marker.on('click', () => {
          setSelectedVessel(vessel);
          setSelectedPort(null);
          map.setView([vessel.currentLat, vessel.currentLng], 8, { animate: true });
        });
        markersRef.current[vessel.id] = marker;
      }
    });
  }, [vessels, selectedVessel]);

  // Handle Search BL or Booking
  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSearchError(null);
    if (!searchQuery.trim()) return;

    const b = bookingService.getByBLNumber(searchQuery);
    if (b) {
      setSelectedBooking(b);
      const ves = vesselService.getById(b.vesselId);
      if (ves) {
        setSelectedVessel(ves);
        setSelectedPort(null);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([ves.currentLat, ves.currentLng], 8, { animate: true });
        }
      }
    } else {
      setSearchError(`Data dengan No. B/L atau Booking "${searchQuery}" tidak ditemukan.`);
    }
  };

  useEffect(() => {
    if (initialSearchBL) {
      setSearchQuery(initialSearchBL);
      handleSearch();
    }
  }, [initialSearchBL]);

  // Live AIS Movement Simulation Loop
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      const currentList = vesselService.getAll();
      const updatedList = currentList.map((ves) => {
        if (ves.status !== 'Underway') return ves;

        // Advance small coordinate increment based on heading & speed
        const rad = (ves.heading * Math.PI) / 180;
        const deltaLat = Math.cos(rad) * 0.003 * simulationSpeed;
        const deltaLng = Math.sin(rad) * 0.003 * simulationSpeed;

        let newLat = ves.currentLat + deltaLat;
        let newLng = ves.currentLng + deltaLng;

        // Keep inside nautical boundary of Indonesia
        if (newLat > 6.0 || newLat < -10.0) newLat = -ves.currentLat * 0.9;
        if (newLng > 140.0 || newLng < 95.0) newLng = 118.0;

        const updatedVessel = {
          ...ves,
          currentLat: Number(newLat.toFixed(4)),
          currentLng: Number(newLng.toFixed(4)),
        };

        vesselService.update(ves.id, {
          currentLat: updatedVessel.currentLat,
          currentLng: updatedVessel.currentLng,
        });

        return updatedVessel;
      });

      setVessels(updatedList);
      setLastPingTime(new Date().toLocaleTimeString());

      if (selectedVessel) {
        const found = updatedList.find((v) => v.id === selectedVessel.id);
        if (found) setSelectedVessel(found);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isSimulating, simulationSpeed, selectedVessel]);

  const originPort = ports.find((p) => p.id === selectedVessel?.currentPortId);
  const destPort = ports.find((p) => p.id === selectedVessel?.destinationPortId);
  const activeRoute = routes.find((r) => r.id === selectedVessel?.currentRouteId);
  const vesselBookings = bookings.filter((b) => b.vesselId === selectedVessel?.id);

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] flex flex-col lg:flex-row overflow-hidden bg-slate-950">
      {/* Top Floating Map Overlay Toolbar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Search / Filter Container */}
        <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-2xl p-2 shadow-2xl flex items-center gap-2 max-w-md w-full">
          <form onSubmit={handleSearch} className="flex-1 flex items-center gap-2">
            <Search className="w-4 h-4 text-cyan-400 ml-2" />
            <input
              type="text"
              placeholder="Lacak No. B/L atau Booking (e.g. BL-SML-26-0091)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs text-white placeholder-slate-500 outline-none w-full font-mono"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold rounded-xl transition-all shrink-0"
            >
              Lacak
            </button>
          </form>
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedBooking(null);
                setSearchError(null);
              }}
              className="p-1 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Simulation Radar Controls */}
        <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-2xl p-2 shadow-2xl flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="text-slate-300 font-mono text-[11px]">AIS Ping: {lastPingTime}</span>
          </div>

          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              isSimulating
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
            }`}
          >
            {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isSimulating ? 'Simulasi Berjalan' : 'Simulasi Jeda'}</span>
          </button>

          <div className="flex items-center bg-slate-950 rounded-xl border border-slate-800 p-0.5 text-xs font-mono">
            {[1, 5, 10].map((spd) => (
              <button
                key={spd}
                onClick={() => setSimulationSpeed(spd)}
                className={`px-2 py-1 rounded-lg transition-colors ${
                  simulationSpeed === spd
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search Error Alert */}
      {searchError && (
        <div className="absolute top-20 left-4 z-20 bg-red-500/90 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-bounce">
          <AlertCircle className="w-4 h-4" />
          <span>{searchError}</span>
        </div>
      )}

      {/* Main Map Container */}
      <div className="flex-1 h-full w-full relative">
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Floating Map Legend */}
        <div className="absolute bottom-6 left-4 z-20 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-2xl p-3 shadow-2xl text-[11px] space-y-1.5 hidden md:block">
          <p className="font-bold text-slate-300 mb-1">Legenda Peta Maritim</p>
          <div className="flex items-center gap-2 text-slate-400">
            <div className="w-3 h-3 rounded-full bg-cyan-400 border border-cyan-300" />
            <span>Kapal Kontainer (FCL/LCL)</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <div className="w-3 h-3 rounded-full bg-amber-400 border border-amber-300" />
            <span>Kapal Curah (Bulk Carrier)</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <div className="w-3 h-3 rounded-full bg-red-400 border border-red-300" />
            <span>Kapal Tanker (Liquid CPO/BBM)</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <div className="w-3 h-3 rounded bg-amber-500 border border-amber-400 flex items-center justify-center text-[8px] text-slate-950 font-bold">⚓</div>
            <span>Pelabuhan Komersial (Harbor Hub)</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <div className="w-4 border-b-2 border-dashed border-cyan-400" />
            <span>Alur Laut Pelayaran (ALKI)</span>
          </div>
        </div>
      </div>

      {/* Right Telemetry & Vessel Details Drawer */}
      <div className="w-full lg:w-96 h-72 lg:h-full bg-slate-900/95 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col z-20 overflow-y-auto">
        {selectedVessel ? (
          <div className="p-4 sm:p-6 space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                    {selectedVessel.type}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    IMO: {selectedVessel.imoNumber}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  {selectedVessel.name}
                </h3>
                <p className="text-xs text-slate-400">
                  Call Sign: <span className="font-mono text-cyan-400">{selectedVessel.callSign}</span> | MMSI: {selectedVessel.mmsi}
                </p>
              </div>

              <div className="text-right">
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold ${
                  selectedVessel.status === 'Underway'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />
                  {selectedVessel.status}
                </span>
              </div>
            </div>

            {/* Live Nautical Telemetry Metrics */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                  <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Kecepatan (SOG)</span>
                </div>
                <p className="text-base font-extrabold text-white font-mono">
                  {selectedVessel.speedKnots} <span className="text-xs text-slate-400 font-normal">Knots</span>
                </p>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                  <Compass className="w-3.5 h-3.5 text-blue-400" />
                  <span>Arah / Haluan</span>
                </div>
                <p className="text-base font-extrabold text-white font-mono">
                  {selectedVessel.heading}° <span className="text-xs text-slate-400 font-normal">Heading</span>
                </p>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                  <Droplets className="w-3.5 h-3.5 text-amber-400" />
                  <span>Bunker BBM ({selectedVessel.fuelBunkerType})</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-base font-extrabold text-white font-mono">
                    {selectedVessel.fuelLevelPct}%
                  </span>
                  <span className="text-[10px] text-slate-400">{selectedVessel.fuelConsumptionPerNM} L/NM</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className="bg-amber-400 h-full rounded-full"
                    style={{ width: `${selectedVessel.fuelLevelPct}%` }}
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                  <Anchor className="w-3.5 h-3.5 text-purple-400" />
                  <span>Kapasitas Muatan</span>
                </div>
                <p className="text-base font-extrabold text-white font-mono">
                  {selectedVessel.capacityTEU > 0 ? `${selectedVessel.capacityTEU} TEU` : `${selectedVessel.capacityDWT.toLocaleString('id-ID')} DWT`}
                </p>
              </div>
            </div>

            {/* Current Position & Route */}
            <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3">
              <p className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-cyan-400" />
                <span>Pelayaran & Posisi Koordinat</span>
              </p>
              
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Dari Pelabuhan:</span>
                  <span className="font-semibold text-white">{originPort?.name || 'Tanjung Priok'}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600" />
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Tujuan:</span>
                  <span className="font-semibold text-cyan-300">{destPort?.name || 'Tanjung Perak'}</span>
                </div>
              </div>

              <div className="p-2 bg-slate-900 rounded-lg text-xs font-mono text-slate-400 flex items-center justify-between">
                <span>Lat: {selectedVessel.currentLat.toFixed(4)}</span>
                <span>Lng: {selectedVessel.currentLng.toFixed(4)}</span>
              </div>
            </div>

            {/* Captain & Operational Status */}
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Nakhoda (Master):</span>
                <span className="font-bold text-white">{selectedVessel.captain}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Jumlah ABK (Crew):</span>
                <span className="font-semibold text-white">{selectedVessel.crewCount} Personel</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Jadwal Docking:</span>
                <span className="font-semibold text-cyan-400">{selectedVessel.nextMaintenanceDate}</span>
              </div>
              {selectedVessel.notes && (
                <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-300 italic">
                  "{selectedVessel.notes}"
                </div>
              )}
            </div>

            {/* Manifest / Active Shipments on this Vessel */}
            <div>
              <p className="text-xs font-bold text-slate-300 mb-2 flex items-center justify-between">
                <span>Muatan Aktif Onboard ({vesselBookings.length} B/L)</span>
              </p>
              <div className="space-y-2">
                {vesselBookings.map((bkg) => (
                  <div
                    key={bkg.id}
                    className="p-3 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded-xl transition-all cursor-pointer"
                    onClick={() => {
                      setSelectedBooking(bkg);
                      if (onOpenBookingDetails) onOpenBookingDetails(bkg);
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-cyan-400 font-mono">{bkg.blNumber}</span>
                      <span className="text-[10px] font-semibold text-emerald-400 px-2 py-0.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                        {bkg.status}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-white truncate">{bkg.customerName}</p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {bkg.commodityName} • {bkg.quantity} {bkg.quantityUnit} ({bkg.grossWeightTon} Ton)
                    </p>
                    <div className="mt-2 flex items-center justify-between text-[10px] pt-1.5 border-t border-slate-800 text-slate-400">
                      <span>Total: Rp {bkg.grandTotal.toLocaleString('id-ID')}</span>
                      <span className="text-cyan-400 flex items-center gap-0.5">Detail B/L →</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : selectedPort ? (
          <div className="p-4 sm:p-6 space-y-4">
            <div className="border-b border-slate-800 pb-4">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                Port Hub ({selectedPort.code})
              </span>
              <h3 className="text-lg font-bold text-white mt-1">{selectedPort.name}</h3>
              <p className="text-xs text-slate-400">{selectedPort.city}, {selectedPort.province}</p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex justify-between">
                <span className="text-slate-400">Kapasitas Dermaga (Berths):</span>
                <span className="font-bold text-white">{selectedPort.berthCapacity} Kapal</span>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex justify-between">
                <span className="text-slate-400">Kedalaman Kolam (Max Draft):</span>
                <span className="font-bold text-cyan-400">{selectedPort.maxDraftMeters} Meter</span>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex justify-between">
                <span className="text-slate-400">Jumlah Crane Dermaga:</span>
                <span className="font-bold text-white">{selectedPort.craneCount} Unit STS</span>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex justify-between">
                <span className="text-slate-400">Jam Layanan:</span>
                <span className="font-bold text-emerald-400">{selectedPort.operationalHours}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400 my-auto">
            <Ship className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-300">Pilih Kapal atau Pelabuhan</p>
            <p className="text-xs text-slate-500 mt-1">
              Klik salah satu marker armada di peta untuk melihat telemetri AIS real-time.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
