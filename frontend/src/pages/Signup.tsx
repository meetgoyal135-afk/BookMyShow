import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, ArrowRight, AlertCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '1rem 1rem 1rem 3.5rem',
  background: 'rgba(255, 255, 255, 0.03)',
  border: '1px solid var(--glass-border)',
  borderRadius: '16px',
  color: 'white',
  outline: 'none',
  transition: 'var(--transition)',
};

const iconStyle: React.CSSProperties = {
  position: 'absolute',
  left: '1.25rem',
  top: '50%',
  transform: 'translateY(-50%)',
  color: 'var(--text-muted)',
};

const Signup: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!agree) {
      setError('Please accept the Terms of Service to continue.');
      return;
    }
    setLoading(true);
    try {
      await register(name, email, password, phone);
      navigate('/', { replace: true });
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data ||
          'Could not create account. The email may already be registered.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '8rem 2rem 4rem',
          background:
            'radial-gradient(circle at top right, rgba(225, 29, 72, 0.05), transparent 40%), radial-gradient(circle at bottom left, rgba(225, 29, 72, 0.05), transparent 40%)',
        }}
      >
        <div
          className="glass-effect animate-fade"
          style={{ width: '100%', maxWidth: '500px', padding: '3rem', borderRadius: '32px', boxShadow: 'var(--shadow-premium)' }}
        >
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '0.75rem', letterSpacing: '-1px' }}>Create Account</h1>
            <p style={{ color: 'var(--text-muted)' }}>Join thousands of cinema lovers today</p>
          </div>

          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                background: 'rgba(225, 29, 72, 0.1)',
                border: '1px solid rgba(225, 29, 72, 0.4)',
                color: '#fda4af',
                padding: '0.85rem 1rem',
                borderRadius: '12px',
                marginBottom: '1.5rem',
                fontSize: '0.9rem',
              }}
            >
              <AlertCircle size={18} /> {String(error)}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-muted)', marginLeft: '0.5rem' }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={iconStyle} />
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')} onBlur={(e) => (e.target.style.borderColor = 'var(--glass-border)')} />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-muted)', marginLeft: '0.5rem' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={iconStyle} />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')} onBlur={(e) => (e.target.style.borderColor = 'var(--glass-border)')} />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-muted)', marginLeft: '0.5rem' }}>Phone Number</label>
              <div style={{ position: 'relative' }}>
                <Phone size={18} style={iconStyle} />
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="9876543210" style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')} onBlur={(e) => (e.target.style.borderColor = 'var(--glass-border)')} />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-muted)', marginLeft: '0.5rem' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={iconStyle} />
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')} onBlur={(e) => (e.target.style.borderColor = 'var(--glass-border)')} />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem', marginLeft: '0.5rem' }}>
              <input type="checkbox" id="terms" checked={agree} onChange={(e) => setAgree(e.target.checked)} style={{ accentColor: 'var(--primary)', width: '18px', height: '18px' }} />
              <label htmlFor="terms" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                I agree to the <Link to="/" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Terms of Service</Link> and{' '}
                <Link to="/" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Privacy Policy</Link>
              </label>
            </div>

            <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', marginTop: '1rem', borderRadius: '16px', justifyContent: 'center', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Creating…' : 'Create Account'}
              <ArrowRight size={18} />
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '2.5rem', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Signup;
