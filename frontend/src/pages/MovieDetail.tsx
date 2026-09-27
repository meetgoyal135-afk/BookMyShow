import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MovieAPI, ShowAPI } from '../services/api';
import type { Movie, Show } from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Calendar, Clock, Star, ChevronLeft, MapPin, Ticket } from 'lucide-react';

const formatTime = (t: string) => {
  // t is "HH:mm:ss"
  const [hStr, m] = t.split(':');
  let h = parseInt(hStr, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
};

const formatDate = (d: string) => {
  const date = new Date(d + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((date.getTime() - today.getTime()) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

interface TheaterGroup {
  theaterName: string;
  address: string;
  shows: Show[];
}

const MovieDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const load = async () => {
      setLoading(true);
      try {
        const [m, s] = await Promise.all([
          MovieAPI.getById(Number(id)),
          ShowAPI.getByMovie(Number(id)),
        ]);
        setMovie(m);
        setShows(s);
      } catch (error) {
        console.error('Error loading movie detail:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading || !movie)
    return (
      <div style={{ background: 'var(--bg-dark)', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid var(--primary-muted)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      </div>
    );

  // group shows by date -> theater
  const dates = Array.from(new Set(shows.map((s) => s.showDate))).sort();

  const groupByTheater = (dayShows: Show[]): TheaterGroup[] => {
    const map = new Map<string, TheaterGroup>();
    for (const s of dayShows) {
      const key = s.screen.theater.name;
      if (!map.has(key)) {
        map.set(key, { theaterName: key, address: s.screen.theater.address, shows: [] });
      }
      map.get(key)!.shows.push(s);
    }
    return Array.from(map.values());
  };

  return (
    <main>
      <Navbar />

      {/* Hero */}
      <div style={{ position: 'relative', width: '100%', minHeight: '70vh', display: 'flex', alignItems: 'flex-end', paddingTop: '100px' }}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `linear-gradient(to top, var(--bg-dark) 0%, rgba(2, 6, 23, 0.6) 50%, rgba(2, 6, 23, 0.4) 100%), url(${movie.posterUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 20%',
            zIndex: -1,
          }}
        ></div>

        <div className="container" style={{ paddingBottom: '4rem' }}>
          <Link to="/" style={{ color: 'white', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', opacity: 0.8, fontWeight: 500 }} className="hover-push">
            <ChevronLeft size={20} /> Back to Movies
          </Link>

          <div style={{ display: 'flex', gap: '3.5rem', alignItems: 'flex-end' }} className="movie-header">
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <img src={movie.posterUrl} alt={movie.title} className="animate-fade"
                style={{ width: '280px', borderRadius: '20px', boxShadow: 'var(--shadow-premium)', border: '1px solid var(--glass-border)', aspectRatio: '2/3', objectFit: 'cover' }} />
            </div>

            <div style={{ paddingBottom: '1rem', flex: 1 }} className="animate-fade">
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                {movie.genre.split('/').map((g) => (
                  <span key={g} style={{ border: '1px solid var(--primary)', color: 'var(--primary)', padding: '2px 10px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 600 }}>{g}</span>
                ))}
              </div>
              <h1 style={{ fontSize: '4rem', lineHeight: 1, marginBottom: '1.5rem', letterSpacing: '-2px' }}>{movie.title}</h1>

              <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ background: 'var(--accent)', color: 'var(--bg-dark)', padding: '4px 8px', borderRadius: '6px', fontWeight: 800, fontSize: '1.1rem' }}>
                    <Star size={14} fill="currentColor" style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                    {movie.rating}
                  </div>
                </div>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
                  <Clock size={20} className="text-primary" /> {Math.floor(movie.durationMinutes / 60)}h {movie.durationMinutes % 60}m
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
                  <Calendar size={20} className="text-primary" /> {new Date(movie.releaseDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <span style={{ fontSize: '1.1rem', background: 'var(--glass)', padding: '4px 12px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>{movie.language}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '4rem 0 6rem' }}>
        {/* Synopsis */}
        <section style={{ marginBottom: '4rem', maxWidth: '820px' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1.25rem', letterSpacing: '-1px' }}>Synopsis</h2>
          <p style={{ fontSize: '1.15rem', color: 'var(--text-muted)', lineHeight: 1.8 }}>{movie.description}</p>
        </section>

        {/* Showtimes */}
        <section>
          <h2 style={{ fontSize: '2rem', marginBottom: '2rem', letterSpacing: '-1px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Ticket className="text-primary" /> Book Tickets
          </h2>

          {shows.length === 0 ? (
            <div className="glass-effect" style={{ padding: '2.5rem', borderRadius: '20px', color: 'var(--text-muted)', textAlign: 'center' }}>
              No showtimes are currently scheduled for this movie.
            </div>
          ) : (
            dates.map((date) => (
              <div key={date} style={{ marginBottom: '2.5rem' }}>
                <h3 style={{ fontSize: '1.15rem', color: 'var(--accent)', marginBottom: '1.25rem', fontWeight: 700, letterSpacing: '0.5px' }}>
                  {formatDate(date)}
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {groupByTheater(shows.filter((s) => s.showDate === date)).map((group) => (
                    <div key={group.theaterName} className="glass-effect" style={{ padding: '1.5rem 2rem', borderRadius: '18px', border: '1px solid var(--glass-border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                        <MapPin size={18} className="text-primary" />
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{group.theaterName}</div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{group.address}</div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                        {group.shows
                          .sort((a, b) => a.startTime.localeCompare(b.startTime))
                          .map((show) => (
                            <button
                              key={show.id}
                              onClick={() => navigate(`/book/${show.id}`)}
                              className="hover-scale"
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '2px',
                                padding: '0.6rem 1.1rem',
                                borderRadius: '12px',
                                border: '1px solid var(--primary)',
                                background: 'transparent',
                                color: 'white',
                                cursor: 'pointer',
                                transition: 'var(--transition)',
                                minWidth: '96px',
                              }}
                            >
                              <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{formatTime(show.startTime)}</span>
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>₹{show.ticketPrice} · {show.screen.name}</span>
                            </button>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </section>
      </div>

      <Footer />

      <style>{`
        .movie-header { @media (max-width: 968px) { flex-direction: column; align-items: flex-start; } }
        .text-primary { color: var(--primary); }
        .hover-push:hover { transform: translateX(-5px); }
        .hover-scale:hover { background: var(--primary) !important; transform: translateY(-2px); }
      `}</style>
    </main>
  );
};

export default MovieDetail;
