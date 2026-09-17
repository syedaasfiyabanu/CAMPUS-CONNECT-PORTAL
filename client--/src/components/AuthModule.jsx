import { useState, useEffect, useCallback } from 'react';
import Toast from './Toast.jsx';

/* ============================================================
   AuthModule – the fully-featured Login / Register component.

   Features (medium-advanced):
   ✔ Controlled inputs (name, email, password)
   ✔ Inline field validation with error messages
   ✔ Password visibility toggle
   ✔ Password strength bar (register mode)
   ✔ "Remember email" via localStorage
   ✔ Loading spinner on submit (1.2 s simulated async)
   ✔ Self-dismissing Toast notification on success / failure
   ✔ Prop-synced tab switching (from parent App via initialMode)
   ✔ Smooth CSS transitions between Login / Register views
   ============================================================ */

/* ── Validation helpers ───────────────────────────────────── */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(email) {
    if (!email) return 'Email is required.';
    if (!EMAIL_RE.test(email)) return 'Enter a valid email address.';
    return '';
}

function validatePassword(password, isLogin) {
    if (!password) return 'Password is required.';
    if (password.length < 8) return 'Password must be at least 8 characters.';
    if (!isLogin && !/[A-Z]/.test(password)) return 'Include at least one uppercase letter.';
    if (!isLogin && !/[!@#$%^&*]/.test(password)) return 'Include at least one special character (!@#$%^&*).';
    return '';
}

function validateName(name) {
    if (!name.trim()) return 'Full name is required.';
    if (name.trim().length < 2) return 'Name must be at least 2 characters.';
    return '';
}

/* ── Password strength calculator ────────────────────────── */
function getStrength(pw) {
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[!@#$%^&*]/.test(pw)) score++;

    if (score <= 1) return { label: 'Very Weak', color: '#ef4444', width: '20%' };
    if (score === 2) return { label: 'Weak', color: '#f97316', width: '40%' };
    if (score === 3) return { label: 'Fair', color: '#eab308', width: '60%' };
    if (score === 4) return { label: 'Strong', color: '#22c55e', width: '80%' };
    return { label: 'Very Strong', color: '#16a34a', width: '100%' };
}

/* ── Toast helpers ────────────────────────────────────────── */
let _toastId = 0;
function makeToast(message, type = 'success') {
    return { id: ++_toastId, message, type };
}

/* ============================================================
   Component
   ============================================================ */
export default function AuthModule({ initialMode = 'login' }) {
    /* ── Tab state ──────────────────────────────────────────── */
    const [isLogin, setIsLogin] = useState(initialMode === 'login');

    // Theory (Prop Syncing): when parent changes initialMode (e.g. user clicks
    // the Register navbar link), sync local isLogin accordingly.
    const [prevMode, setPrevMode] = useState(initialMode);
    if (initialMode !== prevMode) {
        setPrevMode(initialMode);
        setIsLogin(initialMode === 'login');
    }

    /* ── Form data ──────────────────────────────────────────── */
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [errors, setErrors] = useState({ name: '', email: '', password: '' });

    /* ── UI states ──────────────────────────────────────────── */
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [toasts, setToasts] = useState([]);

    /* ── Remember email ─────────────────────────────────────── */
    const [remember, setRemember] = useState(() =>
        localStorage.getItem('cc_remember') === 'true'
    );

    // On mount, restore remembered email
    useEffect(() => {
        if (remember) {
            const savedEmail = localStorage.getItem('cc_saved_email') || '';
            setFormData(fd => ({ ...fd, email: savedEmail }));
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // When switching tabs, reset errors & password (keep email so it's convenient)
    const switchTab = useCallback((toLogin) => {
        setIsLogin(toLogin);
        setErrors({ name: '', email: '', password: '' });
        setFormData(fd => ({ ...fd, name: '', password: '' }));
        setShowPw(false);
    }, []);

    /* ── Handlers ───────────────────────────────────────────── */
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(fd => ({ ...fd, [name]: value }));
        // Clear error as user types
        setErrors(err => ({ ...err, [name]: '' }));
    };

    const addToast = (message, type = 'success') => {
        const t = makeToast(message, type);
        setToasts(prev => [...prev, t]);
        setTimeout(() => removeToast(t.id), 3500);
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    /* ── Validation ─────────────────────────────────────────── */
    const validate = () => {
        const newErrors = {
            name: !isLogin ? validateName(formData.name) : '',
            email: validateEmail(formData.email),
            password: validatePassword(formData.password, isLogin),
        };
        setErrors(newErrors);
        return Object.values(newErrors).every(e => e === '');
    };

    /* ── Submit ─────────────────────────────────────────────── */
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);

        // Save / clear remember-me
        if (remember) {
            localStorage.setItem('cc_remember', 'true');
            localStorage.setItem('cc_saved_email', formData.email);
        } else {
            localStorage.removeItem('cc_remember');
            localStorage.removeItem('cc_saved_email');
        }

        // Simulate async API call
        await new Promise(res => setTimeout(res, 1200));

        setLoading(false);

        if (isLogin) {
            addToast(`Welcome back! Logged in as ${formData.email}`, 'success');
        } else {
            addToast(`Account created for ${formData.name} 🎓`, 'success');
            // Auto-switch to login after successful registration
            setTimeout(() => switchTab(true), 800);
        }

        setFormData({ name: '', email: '', password: '' });
    };

    /* ── Password strength ──────────────────────────────────── */
    const strength = !isLogin && formData.password ? getStrength(formData.password) : null;

    /* ── Render ─────────────────────────────────────────────── */
    return (
        <>
            <div className="auth-card">
                {/* ─── Header ────────────────────────────────────────── */}
                <div className="auth-header">
                    <h1 className="auth-header__title">RV UNIVERSITY</h1>
                    <p className="auth-header__sub">Excellence in Education · Campus Connect Portal</p>
                </div>

                {/* ─── Tabs ──────────────────────────────────────────── */}
                <div className="auth-tabs" role="tablist">
                    <button
                        role="tab"
                        aria-selected={isLogin}
                        className={`auth-tab ${isLogin ? 'active' : ''}`}
                        onClick={() => switchTab(true)}
                        id="tab-login"
                    >
                        🔐 Login
                    </button>
                    <button
                        role="tab"
                        aria-selected={!isLogin}
                        className={`auth-tab ${!isLogin ? 'active' : ''}`}
                        onClick={() => switchTab(false)}
                        id="tab-register"
                    >
                        📝 Register
                    </button>
                </div>

                {/* ─── Form ──────────────────────────────────────────── */}
                <div className="auth-body">
                    <h2 className="form-title">
                        {isLogin ? 'Student Login' : 'Create Student Account'}
                    </h2>

                    <form onSubmit={handleSubmit} noValidate>
                        <div className="field-group">

                            {/* Full Name – Register only */}
                            {!isLogin && (
                                <div className="field-wrapper" key="name-field">
                                    <label htmlFor="name" className="field-label">Full Name</label>
                                    <input
                                        id="name"
                                        type="text"
                                        name="name"
                                        placeholder="e.g. Arshur Rehman"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className={`field-input ${errors.name ? 'error' : ''}`}
                                        autoComplete="name"
                                    />
                                    {errors.name && (
                                        <p className="field-error" role="alert">⚠ {errors.name}</p>
                                    )}
                                </div>
                            )}

                            {/* Email */}
                            <div className="field-wrapper">
                                <label htmlFor="email" className="field-label">RVU Email Address</label>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    placeholder="student@rvu.edu.in"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`field-input ${errors.email ? 'error' : ''}`}
                                    autoComplete="email"
                                />
                                {errors.email && (
                                    <p className="field-error" role="alert">⚠ {errors.email}</p>
                                )}
                            </div>

                            {/* Password */}
                            <div className="field-wrapper">
                                <label htmlFor="password" className="field-label">Password</label>
                                <div className="password-wrapper">
                                    <input
                                        id="password"
                                        type={showPw ? 'text' : 'password'}
                                        name="password"
                                        placeholder={isLogin ? 'Enter your password' : 'Min 8 chars, 1 uppercase, 1 special'}
                                        value={formData.password}
                                        onChange={handleChange}
                                        className={`field-input ${errors.password ? 'error' : ''}`}
                                        autoComplete={isLogin ? 'current-password' : 'new-password'}
                                    />
                                    <button
                                        type="button"
                                        className="pw-toggle"
                                        onClick={() => setShowPw(s => !s)}
                                        aria-label={showPw ? 'Hide password' : 'Show password'}
                                        tabIndex={-1}
                                    >
                                        {showPw ? '🙈' : '👁'}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="field-error" role="alert">⚠ {errors.password}</p>
                                )}

                                {/* Password strength bar – register mode only */}
                                {strength && (
                                    <div className="strength-bar-wrapper" aria-live="polite">
                                        <div className="strength-bar-track">
                                            <div
                                                className="strength-bar-fill"
                                                style={{ width: strength.width, background: strength.color }}
                                            />
                                        </div>
                                        <p className="strength-label" style={{ color: strength.color }}>
                                            Strength: {strength.label}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Remember / Forgot row */}
                        <div className="extras-row">
                            <label className="remember-label">
                                <input
                                    type="checkbox"
                                    checked={remember}
                                    onChange={e => setRemember(e.target.checked)}
                                    id="rememberMe"
                                />
                                Remember me
                            </label>
                            {isLogin && (
                                <a href="#forgot" className="forgot-link">Forgot password?</a>
                            )}
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            className="submit-btn"
                            id={isLogin ? 'btn-login' : 'btn-register'}
                            disabled={loading}
                        >
                            {loading ? (
                                <><span className="spinner" aria-hidden="true" /> Processing…</>
                            ) : (
                                <>{isLogin ? '🔑 Sign In to Portal' : '🚀 Create Student Account'}</>
                            )}
                        </button>
                    </form>

                    {/* Switch tab hint */}
                    <p className="auth-divider">
                        {isLogin ? "Don't have an account? " : 'Already have an account? '}
                        <button onClick={() => switchTab(!isLogin)}>
                            {isLogin ? 'Register here' : 'Login here'}
                        </button>
                    </p>
                </div>
            </div>

            {/* Toast portal */}
            <Toast toasts={toasts} onClose={removeToast} />
        </>
    );
}
