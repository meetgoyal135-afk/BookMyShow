import React, { useEffect, useRef, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { BookingAPI } from '../services/api';
import type { Booking } from '../services/api';
import { CheckCircle2, Calendar, Clock, MapPin, Ticket, Armchair, ScanLine, Download, X, ShieldCheck } from 'lucide-react';

const formatTime = (t: string) => {
  const [hStr, m] = t.split(':');
  let h = parseInt(hStr, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
};

const bookingCode = (id: number) => `BMS${String(id).padStart(6, '0')}`;

// Lightweight non-secret verification token so a gate scanner can sanity-check the payload.
const makeToken = (b: Booking): string => {
  const raw = `${b.id}|${b.show.id}|${b.seats.map((s) => s.id).sort((a, c) => a - c).join(',')}|${b.totalPrice}|${b.status}`;
  let h = 0;
  for (let i = 0; i < raw.length; i++) {
    h = (h * 31 + raw.charCodeAt(i)) >>> 0;
  }
  return h.toString(16).toUpperCase().padStart(8, '0');
};

// The full, self-describing payload encoded in the QR. A gate app can parse this JSON,
// verify the token, and admit the guest — no network needed for a first-pass check.
const buildQrPayload = (b: Booking): string =>
  JSON.stringify({
    t: 'BMS_TICKET',
    v: 1,
    bookingId: b.id,
    bookingCode: bookingCode(b.id),
    status: b.status,
    movie: b.show.movie.title,
    language: b.show.movie.language,
    theater: b.show.screen.theater.name,
    address: b.show.screen.theater.address,
    screen: b.show.screen.name,
    date: b.show.showDate,
    time: b.show.startTime,
    seats: b.seats.map((s) => s.seatNumber),
    amount: b.totalPrice,
    holder: b.user?.name,
    token: makeToken(b),
    issuedAt: b.bookedAt,
  });

const BookingConfirmation: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const location = useLocation();
  const justBooked = (location.state as { justBooked?: boolean })?.justBooked;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [gateOpen, setGateOpen] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    BookingAPI.getById(Number(bookingId))
      .then(setBooking)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [bookingId]);

  const downloadQr = () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (!canvas || !booking) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `ticket-${bookingCode(booking.id)}.png`;
    a.click();
  };

  if (loading)
    return (
      <div style={{ background: 'var(--bg-dark)', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid var(--primary-muted)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      </div>
    );

  if (!booking)
    return (
      <main style={{ background: 'var(--bg-dark)', minHeight: '100vh' }}>
        <Navbar />
        <div className="container" style={{ paddingTop: '10rem', textAlign: 'center', color: 'var(--text-muted)' }}>Booking not found.</div>
      </main>
    );

  const { show, seats } = booking;
  const cancelled = booking.status === 'CANCELLED';
  const qrValue = buildQrPayload(booking);

  return (
    <main style={{ background: 'var(--bg-dark)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <div className="container" style={{ flex: 1, paddingTop: '9rem', paddingBottom: '4rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {justBooked && !cancelled && (
          <div className="animate-fade" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <CheckCircle2 size={64} className="text-primary" style={{ color: '#22c55e', marginBottom: '1rem' }} />
            <h1 style={{ fontSize: '2.5rem', letterSpacing: '-1px', marginBottom: '0.5rem' }}>Booking Confirmed!</h1>
            <p style={{ color: 'var(--text-muted)' }}>Your tickets are booked. Show this ticket at the venue.</p>
          </div>
        )}

        {/* Ticket */}
        <div className="glass-effect animate-fade" style={{ width: '100%', maxWidth: '520px', borderRadius: '28px', overflow: 'hidden', boxShadow: 'var(--shadow-premium)', border: '1px solid var(--glass-border)' }}>
          {/* poster header */}
          <div style={{ position: 'relative', height: '180px', backgroundImage: `linear-gradient(to top, rgba(2,6,23,0.95), rgba(2,6,23,0.3)), url(${show.movie.posterUrl})`, backgroundSize: 'cover', backgroundPosition: 'center 25%', display: 'flex', alignItems: 'flex-end', padding: '1.5rem' }}>
            <div>
              <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: '100px', fontSize: '0.7rem', fontWeight: 700, marginBottom: '0.5rem', background: cancelled ? '#7f1d1d' : '#166534', color: 'white' }}>
                {booking.status}
              </span>
              <h2 style={{ fontSize: '1.75rem', letterSpacing: '-0.5px' }}>{show.movie.title}</h2>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{show.movie.language} · {show.movie.genre}</span>
            </div>
          </div>

          <div style={{ padding: '1.75rem 2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
              <Detail icon={<MapPin size={16} />} label="Theater" value={`${show.screen.theater.name}`} sub={show.screen.theater.address} />
              <Detail icon={<Ticket size={16} />} label="Screen" value={show.screen.name} />
              <Detail icon={<Calendar size={16} />} label="Date" value={new Date(show.showDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} />
              <Detail icon={<Clock size={16} />} label="Time" value={formatTime(show.startTime)} />
            </div>

            <div style={{ borderTop: '1px dashed var(--glass-border)', paddingTop: '1.25rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.6rem' }}>
                <Armchair size={16} /> SEATS
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {seats.map((s) => (
                  <span key={s.id} style={{ padding: '4px 12px', borderRadius: '8px', background: 'var(--primary-muted)', border: '1px solid var(--primary)', fontWeight: 700, fontSize: '0.9rem' }}>
                    {s.seatNumber}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed var(--glass-border)', paddingTop: '1.25rem', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Booking ID</div>
                <div style={{ fontWeight: 700 }}>#{bookingCode(booking.id)}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>Total Paid</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>₹{booking.totalPrice}</div>
              </div>

              {/* Real, scannable QR encoding the full ticket */}
              <div ref={qrRef} style={{ textAlign: 'center' }}>
                {cancelled ? (
                  <div style={{ width: 118, height: 118, borderRadius: 14, background: 'rgba(127,29,29,0.25)', border: '1px solid #7f1d1d', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, color: '#fda4af' }}>
                    <X size={30} />
                    <span style={{ fontSize: '0.7rem', fontWeight: 700 }}>VOID</span>
                  </div>
                ) : (
                  <>
                    <div style={{ background: 'white', padding: 8, borderRadius: 14, display: 'inline-block', lineHeight: 0 }}>
                      <QRCodeCanvas value={qrValue} size={104} level="M" includeMargin={false} />
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}>
                      <ShieldCheck size={12} /> Scan at gate
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Gate actions */}
        {!cancelled && (
          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button onClick={() => setGateOpen(true)} className="btn-primary" style={{ padding: '0.85rem 1.75rem', borderRadius: '14px' }}>
              <ScanLine size={18} /> Show QR at Gate
            </button>
            <button onClick={downloadQr} className="btn-glass" style={{ padding: '0.85rem 1.75rem', borderRadius: '14px' }}>
              <Download size={18} /> Download Ticket
            </button>
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
          <Link to="/my-bookings" className="btn-glass" style={{ padding: '0.85rem 1.75rem', borderRadius: '14px', textDecoration: 'none' }}>My Bookings</Link>
          <Link to="/" className="btn-primary" style={{ padding: '0.85rem 1.75rem', borderRadius: '14px', textDecoration: 'none' }}>Book More Movies</Link>
        </div>
      </div>

      {/* Full-screen gate view: large QR to present at the theatre entrance */}
      {gateOpen && !cancelled && (
        <div
          onClick={() => setGateOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(2,6,23,0.92)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="animate-fade"
            style={{ background: 'white', borderRadius: 28, padding: '2rem', maxWidth: 380, width: '100%', textAlign: 'center', color: '#0f172a', boxShadow: 'var(--shadow-premium)' }}
          >
            <button onClick={() => setGateOpen(false)} style={{ position: 'absolute', top: 24, right: 24, background: 'rgba(255,255,255,0.1)', color: 'white', width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <X size={20} />
            </button>

            <div style={{ fontWeight: 900, fontSize: '1.15rem', letterSpacing: '-0.5px', marginBottom: 4 }}>
              BOOK<span style={{ color: 'var(--primary)' }}>MY</span>SHOW
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1.25rem' }}>Present this at the entry gate</div>

            <div style={{ display: 'inline-block', padding: 12, border: '4px solid #0f172a', borderRadius: 18 }}>
              <QRCodeCanvas value={qrValue} size={240} level="M" includeMargin={false} />
            </div>

            <h3 style={{ margin: '1.25rem 0 0.25rem', fontSize: '1.25rem' }}>{show.movie.title}</h3>
            <div style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.6 }}>
              {show.screen.theater.name} · {show.screen.name}<br />
              {new Date(show.showDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} · {formatTime(show.startTime)}<br />
              <strong>Seats:</strong> {seats.map((s) => s.seatNumber).join(', ')}
            </div>

            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px dashed #cbd5e1', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: '#64748b' }}>#{bookingCode(booking.id)}</span>
              <span style={{ fontWeight: 700, color: '#166534' }}>● {booking.status}</span>
            </div>
          </div>
        </div>
      )}

      <Footer />
      <style>{`.text-primary { color: var(--primary); }`}</style>
    </main>
  );
};

const Detail: React.FC<{ icon: React.ReactNode; label: string; value: string; sub?: string }> = ({ icon, label, value, sub }) => (
  <div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.35rem' }}>
      {icon} {label.toUpperCase()}
    </div>
    <div style={{ fontWeight: 700, fontSize: '0.98rem' }}>{value}</div>
    {sub && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{sub}</div>}
  </div>
);

export default BookingConfirmation;
