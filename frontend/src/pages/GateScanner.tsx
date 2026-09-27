import React, { useEffect, useRef, useState } from 'react';
import Navbar from '../components/Navbar';
import { GateAPI } from '../services/api';
import type { GateVerifyResponse } from '../services/api';
import { CheckCircle2, XCircle, Camera, CameraOff, ScanLine, KeyRound, RotateCcw } from 'lucide-react';

// Extract a bookingId from either a scanned QR payload (our JSON) or a manual code.
const extractBookingId = (raw: string): number | null => {
  const text = raw.trim();
  // Try our JSON ticket payload
  try {
    const obj = JSON.parse(text);
    if (obj && (obj.bookingId || obj.bookingCode)) {
      if (obj.bookingId) return Number(obj.bookingId);
      const m = String(obj.bookingCode).match(/(\d+)/);
      if (m) return Number(m[1]);
    }
  } catch {
    /* not JSON, fall through */
  }
  // Accept "BMS000012", "#BMS000012" or a plain number
  const m = text.match(/(\d+)/);
  return m ? Number(m[1]) : null;
};

type Mode = 'camera' | 'manual';

const GateScanner: React.FC = () => {
  const [mode, setMode] = useState<Mode>('manual');
  const [cameraOn, setCameraOn] = useState(false);
  const [code, setCode] = useState('');
  const [result, setResult] = useState<GateVerifyResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [camError, setCamError] = useState<string | null>(null);
  const scannerRef = useRef<any>(null);
  const busyRef = useRef(false);

  const doCheckIn = async (bookingId: number) => {
    if (busyRef.current) return;
    busyRef.current = true;
    setLoading(true);
    try {
      const res = await GateAPI.checkIn(bookingId);
      setResult(res);
    } catch {
      setResult({ admit: false, result: 'NOT_FOUND', message: 'Could not reach the server or ticket not found.', booking: null });
    } finally {
      setLoading(false);
      // brief cooldown so a held-up QR doesn't fire repeatedly
      setTimeout(() => { busyRef.current = false; }, 1500);
    }
  };

  const handleManual = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = extractBookingId(code);
    if (id == null) {
      setResult({ admit: false, result: 'INVALID', message: 'Enter a valid booking code (e.g. BMS000012).', booking: null });
      return;
    }
    await doCheckIn(id);
  };

  // camera scanner lifecycle
  const stopCamera = async () => {
    try {
      if (scannerRef.current) {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
      }
    } catch { /* ignore */ }
    scannerRef.current = null;
    setCameraOn(false);
  };

  const startCamera = async () => {
    setCamError(null);
    setResult(null);
    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      const scanner = new Html5Qrcode('gate-reader');
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (decodedText: string) => {
          const id = extractBookingId(decodedText);
          if (id != null) doCheckIn(id);
        },
        () => { /* ignore per-frame decode errors */ }
      );
      setCameraOn(true);
    } catch (err: any) {
      setCamError(
        'Camera unavailable or permission denied. Use manual entry instead. (' + (err?.message || 'no camera') + ')'
      );
      setCameraOn(false);
    }
  };

  useEffect(() => {
    return () => { stopCamera(); };
  }, []);

  const reset = () => {
    setResult(null);
    setCode('');
  };

  const banner = (() => {
    if (!result) return null;
    const admitted = result.admit;
    const b = result.booking;
    return (
      <div
        className="animate-fade"
        style={{
          borderRadius: 24,
          padding: '2rem',
          textAlign: 'center',
          background: admitted ? 'rgba(22,101,52,0.18)' : 'rgba(127,29,29,0.18)',
          border: `1px solid ${admitted ? '#22c55e' : '#ef4444'}`,
          marginTop: '2rem',
        }}
      >
        {admitted ? <CheckCircle2 size={72} color="#22c55e" /> : <XCircle size={72} color="#f87171" />}
        <h2 style={{ fontSize: '2rem', margin: '0.75rem 0 0.35rem', color: admitted ? '#4ade80' : '#f87171' }}>
          {admitted ? 'ADMIT' : 'ENTRY DENIED'}
        </h2>
        <div style={{ fontWeight: 700, letterSpacing: 1, color: 'var(--text-muted)', marginBottom: '0.75rem' }}>{result.result}</div>
        <p style={{ color: 'var(--text-muted)', marginBottom: b ? '1.25rem' : 0 }}>{result.message}</p>
        {b && (
          <div style={{ textAlign: 'left', background: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: '1.25rem', border: '1px solid var(--glass-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <strong>{b.show.movie.title}</strong>
              <span style={{ color: 'var(--text-muted)' }}>#BMS{String(b.id).padStart(6, '0')}</span>
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              {b.show.screen.theater.name} · {b.show.screen.name}<br />
              {new Date(b.show.showDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} · {b.show.startTime.slice(0, 5)}<br />
              Seats: <strong style={{ color: 'white' }}>{b.seats.map((s) => s.seatNumber).join(', ')}</strong> · Holder: {b.user?.name}
            </div>
          </div>
        )}
        <button onClick={reset} className="btn-glass" style={{ marginTop: '1.5rem', padding: '0.7rem 1.5rem', borderRadius: 12 }}>
          <RotateCcw size={16} /> Scan Next
        </button>
      </div>
    );
  })();

  return (
    <main style={{ background: 'var(--bg-dark)', minHeight: '100vh' }}>
      <Navbar />

      <div className="container" style={{ maxWidth: 560, paddingTop: '8rem', paddingBottom: '4rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 14px', borderRadius: 100, border: '1px solid var(--glass-border)', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '1rem' }}>
            <ScanLine size={15} /> THEATRE GATE · STAFF
          </div>
          <h1 style={{ fontSize: '2.5rem', letterSpacing: '-1px' }}>Ticket Scanner</h1>
          <p style={{ color: 'var(--text-muted)' }}>Scan a guest's QR code or enter their booking code to admit entry.</p>
        </div>

        {/* mode toggle */}
        <div style={{ display: 'flex', gap: 8, background: 'rgba(255,255,255,0.03)', padding: 6, borderRadius: 14, marginBottom: '1.5rem' }}>
          {(['manual', 'camera'] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setResult(null); if (m !== 'camera') stopCamera(); }}
              style={{
                flex: 1, padding: '0.7rem', borderRadius: 10, fontWeight: 600, cursor: 'pointer',
                background: mode === m ? 'var(--primary)' : 'transparent',
                color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              {m === 'manual' ? <KeyRound size={16} /> : <Camera size={16} />} {m === 'manual' ? 'Enter Code' : 'Camera Scan'}
            </button>
          ))}
        </div>

        {mode === 'manual' && (
          <form onSubmit={handleManual} className="glass-effect" style={{ padding: '2rem', borderRadius: 20, border: '1px solid var(--glass-border)' }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>Booking Code</label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="BMS000012"
              autoFocus
              style={{ width: '100%', padding: '1rem 1.25rem', marginTop: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', borderRadius: 14, color: 'white', outline: 'none', fontSize: '1.1rem', letterSpacing: 1 }}
            />
            <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', marginTop: '1.25rem', borderRadius: 14, justifyContent: 'center', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Verifying…' : 'Verify & Admit'} <ScanLine size={18} />
            </button>
          </form>
        )}

        {mode === 'camera' && (
          <div className="glass-effect" style={{ padding: '1.5rem', borderRadius: 20, border: '1px solid var(--glass-border)', textAlign: 'center' }}>
            <div id="gate-reader" style={{ width: '100%', borderRadius: 14, overflow: 'hidden', minHeight: cameraOn ? 'auto' : 0 }} />
            {!cameraOn ? (
              <button onClick={startCamera} className="btn-primary" style={{ borderRadius: 14, justifyContent: 'center', margin: '0.5rem auto' }}>
                <Camera size={18} /> Start Camera
              </button>
            ) : (
              <button onClick={stopCamera} className="btn-glass" style={{ borderRadius: 14, justifyContent: 'center', margin: '1rem auto 0' }}>
                <CameraOff size={18} /> Stop Camera
              </button>
            )}
            {camError && (
              <p style={{ color: '#fda4af', fontSize: '0.85rem', marginTop: '1rem' }}>{camError}</p>
            )}
            {!cameraOn && !camError && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>Point the camera at the guest's ticket QR code.</p>
            )}
          </div>
        )}

        {banner}
      </div>
    </main>
  );
};

export default GateScanner;
