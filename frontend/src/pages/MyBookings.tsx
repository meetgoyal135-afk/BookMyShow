import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { BookingAPI } from '../services/api';
import type { Booking } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Calendar, Clock, MapPin, Armchair, Ticket, XCircle } from 'lucide-react';

const formatTime = (t: string) => {
  const [hStr, m] = t.split(':');
  let h = parseInt(hStr, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
};

const MyBookings: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<number | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: '/my-bookings' } });
      return;
    }
    window.scrollTo(0, 0);
    BookingAPI.getByUser(user.id)
      .then((b) => setBookings(b.sort((a, z) => z.id - a.id)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user, navigate]);

  const handleCancel = async (id: number) => {
    setCancelling(id);
    try {
      const updated = await BookingAPI.cancel(id);
      setBookings((prev) => prev.map((b) => (b.id === id ? updated : b)));
    } catch (e) {
      console.error(e);
    } finally {
      setCancelling(null);
    }
  };

  return (
    <main style={{ background: 'var(--bg-dark)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <div className="container" style={{ flex: 1, paddingTop: '9rem', paddingBottom: '4rem' }}>
        <h1 style={{ fontSize: '2.5rem', letterSpacing: '-1px', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Ticket className="text-primary" /> My Bookings
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '3rem' }}>All your ticket bookings in one place.</p>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
            <div style={{ width: '36px', height: '36px', border: '4px solid var(--primary-muted)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="glass-effect" style={{ padding: '3rem', borderRadius: '24px', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>You haven't booked any tickets yet.</p>
            <Link to="/" className="btn-primary" style={{ padding: '0.85rem 1.75rem', borderRadius: '14px', textDecoration: 'none' }}>Browse Movies</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {bookings.map((b) => {
              const cancelled = b.status === 'CANCELLED';
              return (
                <div key={b.id} className="glass-effect" style={{ borderRadius: '20px', overflow: 'hidden', border: '1px solid var(--glass-border)', display: 'flex', opacity: cancelled ? 0.6 : 1 }}>
                  <img src={b.show.movie.posterUrl} alt={b.show.movie.title} style={{ width: '110px', objectFit: 'cover', flexShrink: 0 }} />
                  <div style={{ padding: '1.5rem', flex: 1, display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <h3 style={{ fontSize: '1.35rem' }}>{b.show.movie.title}</h3>
                        <span style={{ padding: '2px 10px', borderRadius: '100px', fontSize: '0.7rem', fontWeight: 700, background: cancelled ? '#7f1d1d' : '#166534', color: 'white' }}>{b.status}</span>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><MapPin size={15} /> {b.show.screen.theater.name}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Calendar size={15} /> {new Date(b.show.showDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Clock size={15} /> {formatTime(b.show.startTime)}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Armchair size={15} /> {b.seats.map((s) => s.seatNumber).join(', ')}</span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Booking #BMS{String(b.id).padStart(6, '0')}</div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1rem' }}>
                      <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary)' }}>₹{b.totalPrice}</div>
                      <div style={{ display: 'flex', gap: '0.6rem' }}>
                        <Link to={`/booking/${b.id}`} className="btn-glass" style={{ padding: '0.55rem 1.1rem', borderRadius: '12px', textDecoration: 'none', fontSize: '0.85rem' }}>View Ticket</Link>
                        {!cancelled && (
                          <button onClick={() => handleCancel(b.id)} disabled={cancelling === b.id} style={{ padding: '0.55rem 1.1rem', borderRadius: '12px', fontSize: '0.85rem', background: 'rgba(225,29,72,0.12)', border: '1px solid rgba(225,29,72,0.4)', color: '#fda4af', display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}>
                            <XCircle size={15} /> {cancelling === b.id ? 'Cancelling…' : 'Cancel'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
      <style>{`.text-primary { color: var(--primary); }`}</style>
    </main>
  );
};

export default MyBookings;
