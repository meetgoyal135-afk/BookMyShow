import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '../components/Navbar';
import { Armchair, ChevronLeft, CreditCard, Info, AlertCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { ShowAPI, SeatAPI, BookingAPI } from '../services/api';
import type { Show, Seat } from '../services/api';
import { useAuth } from '../context/AuthContext';

const formatTime = (t: string) => {
  const [hStr, m] = t.split(':');
  let h = parseInt(hStr, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
};

const seatTypeLabel: Record<string, string> = {
  REGULAR: 'Regular',
  PREMIUM: 'Premium',
  VIP: 'Recliner (VIP)',
};

const SeatSelection: React.FC = () => {
  const { showId } = useParams<{ showId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [show, setShow] = useState<Show | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [bookedSeatIds, setBookedSeatIds] = useState<Set<number>>(new Set());
  const [selected, setSelected] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const sh = await ShowAPI.getById(Number(showId));
        setShow(sh);
        const [allSeats, available] = await Promise.all([
          SeatAPI.getByScreen(sh.screen.id),
          BookingAPI.getAvailableSeats(sh.id),
        ]);
        const availableIds = new Set(available.map((s) => s.id));
        const booked = new Set(allSeats.filter((s) => !availableIds.has(s.id)).map((s) => s.id));
        // sort seats by row then col for a clean grid
        allSeats.sort((a, b) => (a.row === b.row ? a.col - b.col : a.row.localeCompare(b.row)));
        setSeats(allSeats);
        setBookedSeatIds(booked);
      } catch (err) {
        console.error(err);
        setError('Could not load this show. It may no longer be available.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [showId]);

  const rows = useMemo(() => {
    const map = new Map<string, Seat[]>();
    for (const s of seats) {
      if (!map.has(s.row)) map.set(s.row, []);
      map.get(s.row)!.push(s);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [seats]);

  const toggleSeat = (seat: Seat) => {
    if (bookedSeatIds.has(seat.id)) return;
    setSelected((prev) =>
      prev.find((s) => s.id === seat.id)
        ? prev.filter((s) => s.id !== seat.id)
        : [...prev, seat]
    );
  };

  const total = show ? selected.length * show.ticketPrice : 0;

  const handlePay = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/book/${showId}` } });
      return;
    }
    if (selected.length === 0 || !show) return;
    setBooking(true);
    setError(null);
    try {
      const created = await BookingAPI.create(
        user.id,
        show.id,
        selected.map((s) => s.id)
      );
      navigate(`/booking/${created.id}`, { state: { justBooked: true } });
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data ||
          'Booking failed. One or more seats may have just been taken.'
      );
      // refresh availability
      if (show) {
        try {
          const available = await BookingAPI.getAvailableSeats(show.id);
          const availableIds = new Set(available.map((s) => s.id));
          setBookedSeatIds(new Set(seats.filter((s) => !availableIds.has(s.id)).map((s) => s.id)));
          setSelected([]);
        } catch { /* ignore */ }
      }
    } finally {
      setBooking(false);
    }
  };

  if (loading)
    return (
      <div style={{ background: 'var(--bg-dark)', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid var(--primary-muted)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      </div>
    );

  if (!show)
    return (
      <main style={{ background: 'var(--bg-dark)', minHeight: '100vh' }}>
        <Navbar />
        <div className="container" style={{ paddingTop: '10rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          {error || 'Show not found.'}
        </div>
      </main>
    );

  return (
    <main style={{ background: 'var(--bg-dark)', minHeight: '100vh', paddingBottom: '10rem' }}>
      <Navbar />

      <div className="container" style={{ paddingTop: '8rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', gap: '1rem', flexWrap: 'wrap' }}>
          <button onClick={() => navigate(-1)} style={{ color: 'white', background: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500, opacity: 0.8 }}>
            <ChevronLeft size={20} /> Back
          </button>

          <div style={{ textAlign: 'center', flex: 1 }}>
            <h1 style={{ fontSize: '2.25rem', letterSpacing: '-1px', marginBottom: '0.5rem' }}>{show.movie.title}</h1>
            <p style={{ color: 'var(--text-muted)' }}>
              {show.screen.theater.name} · {show.screen.name} · {formatTime(show.startTime)}
            </p>
          </div>

          <div style={{ width: '80px' }}></div>
        </div>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'rgba(225, 29, 72, 0.1)', border: '1px solid rgba(225, 29, 72, 0.4)', color: '#fda4af', padding: '0.85rem 1rem', borderRadius: '12px', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
            <AlertCircle size={18} /> {String(error)}
          </div>
        )}

        {/* Screen */}
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <div style={{ width: '85%', height: '8px', background: 'linear-gradient(to right, transparent, var(--primary), transparent)', boxShadow: '0 15px 30px rgba(225, 29, 72, 0.5)', margin: '0 auto 1.5rem', borderRadius: '100%' }}></div>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', letterSpacing: '4px', fontWeight: 600 }}>SCREEN THIS WAY</span>
        </div>

        {/* Seat Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center', padding: '2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '32px', border: '1px solid var(--glass-border)', overflowX: 'auto' }}>
          {rows.map(([rowLabel, rowSeats]) => (
            <div key={rowLabel} style={{ display: 'flex', gap: '0.9rem', alignItems: 'center' }}>
              <span style={{ width: '1.5rem', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.85rem' }}>{rowLabel}</span>
              <div style={{ display: 'flex', gap: '0.55rem' }}>
                {rowSeats.map((seat) => {
                  const isSelected = !!selected.find((s) => s.id === seat.id);
                  const isBooked = bookedSeatIds.has(seat.id);
                  const isVip = seat.seatType === 'VIP';
                  return (
                    <button
                      key={seat.id}
                      disabled={isBooked}
                      onClick={() => toggleSeat(seat)}
                      title={`${seat.seatNumber} · ${seatTypeLabel[seat.seatType] || seat.seatType}`}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '9px',
                        background: isBooked ? '#1e293b' : isSelected ? 'var(--primary)' : 'transparent',
                        border: isBooked ? 'none' : isSelected ? 'none' : `1px solid ${isVip ? 'var(--accent)' : 'var(--glass-border)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'var(--transition)',
                        cursor: isBooked ? 'not-allowed' : 'pointer',
                        transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                      }}
                      className={!isBooked ? 'seat-hover' : ''}
                    >
                      <Armchair size={16} color={isBooked ? '#475569' : isSelected ? 'white' : isVip ? 'var(--accent)' : 'var(--text-muted)'} />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2.5rem', marginTop: '3rem', flexWrap: 'wrap' }}>
          {[
            { label: 'Available', color: 'transparent', border: '1px solid var(--glass-border)' },
            { label: 'Recliner/VIP', color: 'transparent', border: '1px solid var(--accent)' },
            { label: 'Selected', color: 'var(--primary)', border: 'none' },
            { label: 'Booked', color: '#1e293b', border: 'none' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ width: '18px', height: '18px', borderRadius: '6px', background: item.color, border: item.border }}></div>
              <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>{item.label}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '2.5rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
          <Info size={14} />
          <span>Tickets once booked cannot be cancelled or refunded.</span>
        </div>
      </div>

      {/* Summary bar */}
      {selected.length > 0 && (
        <div className="glass-effect animate-fade" style={{ position: 'fixed', bottom: '2.5rem', left: '50%', transform: 'translateX(-50%)', width: 'min(92%, 820px)', padding: '1.25rem 2.5rem', borderRadius: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'var(--shadow-premium)', zIndex: 1001, border: '1px solid rgba(225, 29, 72, 0.3)', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{selected.length} Seat{selected.length > 1 ? 's' : ''}</div>
              <div style={{ maxWidth: '260px', overflowX: 'auto', display: 'flex', gap: '0.5rem', color: 'white', fontWeight: 600 }}>
                {selected.map((s) => s.seatNumber).join(', ')}
              </div>
            </div>
            <div style={{ height: '40px', width: '1px', background: 'var(--glass-border)' }}></div>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Total Amount</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)' }}>₹{total}</div>
            </div>
          </div>

          <button onClick={handlePay} disabled={booking} className="btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.05rem', borderRadius: '16px', opacity: booking ? 0.7 : 1 }}>
            {booking ? 'Processing…' : user ? 'Proceed to Pay' : 'Login to Book'}
            <CreditCard size={20} />
          </button>
        </div>
      )}

      <style>{`
        .seat-hover:hover {
          background: var(--primary-muted) !important;
          border-color: var(--primary) !important;
          transform: scale(1.15) translateY(-2px);
        }
      `}</style>
    </main>
  );
};

export default SeatSelection;
