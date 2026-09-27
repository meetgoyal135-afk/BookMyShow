import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Ticket, LogOut, ChevronDown, ScanLine } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  return (
    <nav
      className="glass-effect"
      style={{ position: 'fixed', top: 0, width: '100%', zIndex: 1000, padding: '0.75rem 0', borderBottom: '1px solid var(--glass-border)' }}
    >
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-1.5px', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          BOOK<span style={{ color: 'var(--primary)' }}>MY</span>SHOW
        </Link>

        <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '2rem' }} className="nav-links">
            <Link to="/" style={{ color: 'var(--text-main)', textDecoration: 'none', fontWeight: 500, fontSize: '0.95rem', opacity: 0.8 }}>Movies</Link>
            <Link to="/scan" style={{ color: 'var(--text-main)', textDecoration: 'none', fontWeight: 500, fontSize: '0.95rem', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <ScanLine size={16} /> Scan
            </Link>
            {user && (
              <Link to="/my-bookings" style={{ color: 'var(--text-main)', textDecoration: 'none', fontWeight: 500, fontSize: '0.95rem', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Ticket size={16} /> My Bookings
              </Link>
            )}
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {user ? (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setMenuOpen((o) => !o)}
                  className="btn-glass"
                  style={{ padding: '0.55rem 1.1rem', borderRadius: '100px', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
                >
                  <span style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem' }}>
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{user.name?.split(' ')[0]}</span>
                  <ChevronDown size={16} />
                </button>

                {menuOpen && (
                  <div className="glass-effect animate-fade" style={{ position: 'absolute', right: 0, top: 'calc(100% + 0.5rem)', minWidth: '200px', borderRadius: '16px', padding: '0.5rem', boxShadow: 'var(--shadow-premium)', border: '1px solid var(--glass-border)' }}>
                    <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--glass-border)', marginBottom: '0.35rem' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{user.name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{user.email}</div>
                    </div>
                    <Link to="/my-bookings" onClick={() => setMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.65rem 1rem', borderRadius: '10px', color: 'white', textDecoration: 'none', fontSize: '0.9rem' }} className="menu-item">
                      <Ticket size={16} /> My Bookings
                    </Link>
                    <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.65rem 1rem', borderRadius: '10px', color: '#fda4af', background: 'none', fontSize: '0.9rem', cursor: 'pointer' }} className="menu-item">
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="btn-primary" style={{ padding: '0.6rem 1.5rem', borderRadius: '100px', textDecoration: 'none' }}>
                <User size={18} />
                Login
              </Link>
            )}
          </div>
        </div>
      </div>

      <style>{`.menu-item:hover { background: rgba(255,255,255,0.06); }`}</style>
    </nav>
  );
};

export default Navbar;
