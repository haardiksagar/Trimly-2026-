"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function Home() {
  const [session, setSession] = useState(null);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authOtp, setAuthOtp] = useState("");
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const [urlInput, setUrlInput] = useState("");
  const [currentShortUrl, setCurrentShortUrl] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [recentLinks, setRecentLinks] = useState([]);
  
  const API_ENDPOINT = "http://localhost:8080/api/urls";
  const REDIRECT_BASE_URL = "http://localhost:8080";

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchHistoryFromDB(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        setIsAuthModalOpen(false);
        fetchHistoryFromDB(session);
      } else {
        setRecentLinks([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchHistoryFromDB = async (currentSession) => {
    if (!currentSession) return;
    try {
      const res = await fetch(API_ENDPOINT, {
        headers: { "Authorization": `Bearer ${currentSession.access_token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRecentLinks(data.reverse());
      } else if (res.status === 401) {
        supabase.auth.signOut();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");
    
    if (!isOtpStep) {
      if (isLoginMode) {
        const { error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword });
        if (error) setAuthError(error.message);
      } else {
        const { data, error } = await supabase.auth.signUp({ email: authEmail, password: authPassword });
        if (error) {
          setAuthError(error.message);
        } else if (data?.user?.identities?.length === 0) {
          setAuthError("User already exists. Please log in.");
        } else {
          setIsOtpStep(true);
        }
      }
    } else {
      const { error } = await supabase.auth.verifyOtp({ email: authEmail, token: authOtp, type: 'signup' });
      if (error) {
        setAuthError(error.message);
      } else {
        await supabase.auth.signOut();
        setIsLoginMode(true);
        setIsOtpStep(false);
        setAuthSuccess("Registration successful! Please log in.");
      }
    }
  };

  const handleGoogleLogin = async () => {
    setAuthError("");
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } });
    if (error) setAuthError(error.message);
  };

  const normalizeUrl = (value) => {
    const trimmed = value.trim();
    if (!trimmed) return "";
    return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  };

  const isValidHttpUrl = (value) => {
    try {
      const parsed = new URL(value);
      return ["http:", "https:"].includes(parsed.protocol) && Boolean(parsed.hostname);
    } catch {
      return false;
    }
  };

  const handleShorten = async (e) => {
    e.preventDefault();
    setFormMessage("");
    setCurrentShortUrl("");
    
    const originalUrl = normalizeUrl(urlInput);
    setUrlInput(originalUrl);
    
    if (!isValidHttpUrl(originalUrl)) {
      setFormMessage("Enter a valid web address, such as https://example.com.");
      return;
    }
    if (!session) {
      setFormMessage("Please log in to shorten URLs.");
      setIsAuthModalOpen(true);
      return;
    }
    
    setIsLoading(true);
    try {
      const res = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ url: originalUrl })
      });
      if (!res.ok) throw new Error("Request failed");
      const data = await res.json();
      setCurrentShortUrl(`${REDIRECT_BASE_URL}/${data.shortToken}`);
      fetchHistoryFromDB(session);
    } catch (err) {
      setFormMessage(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyText = (text) => {
    navigator.clipboard.writeText(text).catch(err => console.error(err));
  };

  return (
    <div className="page-shell">
      <header className="site-header">
        <a className="brand" href="#" aria-label="Trimly home">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" role="img">
              <path d="M9.5 14.5 14.5 9M7.2 17.8l-1 1a3.54 3.54 0 0 1-5-5l4.2-4.2a3.54 3.54 0 0 1 5 0M16.8 6.2l1-1a3.54 3.54 0 1 1 5 5l-4.2 4.2a3.54 3.54 0 0 1-5 0" />
            </svg>
          </span>
          <span>trimly</span>
        </a>

        <nav className="site-nav" aria-label="Primary navigation">
          <a className="header-link" href="#recent-links">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
            </svg>
            <span>My links</span>
          </a>
          
          {!session ? (
            <button className="text-button" onClick={() => setIsAuthModalOpen(true)}>Log in</button>
          ) : (
            <div className="profile-container">
              {session.user.user_metadata?.avatar_url ? (
                <img 
                  src={session.user.user_metadata.avatar_url} 
                  alt="Profile picture" 
                  className="profile-pic"
                  onClick={() => setIsProfileOpen(!isProfileOpen)} 
                />
              ) : (
                <div className="profile-placeholder" onClick={() => setIsProfileOpen(!isProfileOpen)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
              )}
              
              {isProfileOpen && (
                <div className="profile-dropdown open">
                  <div className="profile-dropdown-header">{session.user.email}</div>
                  <button className="text-button dropdown-item" onClick={() => supabase.auth.signOut()}>Sign out</button>
                </div>
              )}
            </div>
          )}
        </nav>
      </header>

      <main>
        <section className="hero" aria-labelledby="hero-title">
          <h1 id="hero-title">Short links.<br /><em>Big reach.</em></h1>
          <p className="hero-copy">
            Turn long, unwieldy URLs into clean links worth sharing.
            No account, no clutter — just paste and go.
          </p>

          <form className="shortener-card" onSubmit={handleShorten} noValidate>
            <label htmlFor="url-input">Paste your long URL</label>
            <div className="input-row">
              <div className={`url-field ${formMessage ? 'invalid' : ''}`}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.7-1.7" />
                </svg>
                <input 
                  id="url-input" 
                  type="url" 
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://your-very-long-link.com/..." 
                  required 
                />
              </div>
              <button className={`primary-button ${isLoading ? 'loading' : ''}`} disabled={isLoading} type="submit">
                <span className="button-label">{isLoading ? "Creating link…" : "Shorten link"}</span>
                <span className="spinner" aria-hidden="true"></span>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            </div>
            <p className="form-message" role="alert" aria-live="polite">{formMessage}</p>
          </form>

          {currentShortUrl && (
            <div className="result-card" aria-live="polite">
              <div className="result-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path d="m5 12 4 4L19 6" />
                </svg>
              </div>
              <div className="result-content">
                <span>Your short link is ready</span>
                <a href={currentShortUrl} target="_blank" rel="noopener noreferrer">{currentShortUrl}</a>
              </div>
              <div className="result-actions">
                <button className="icon-button" type="button" onClick={() => window.open(currentShortUrl, "_blank")} aria-label="Open link">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  </svg>
                </button>
                <button className="copy-button" type="button" onClick={() => copyText(currentShortUrl)}>
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <rect x="9" y="9" width="13" height="13" rx="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  <span>Copy</span>
                </button>
              </div>
            </div>
          )}
        </section>

        {recentLinks.length > 0 && (
          <section className="recent-section" id="recent-links">
            <div className="section-heading">
              <div>
                <span className="section-kicker">Saved on this device</span>
                <h2>Recent links</h2>
              </div>
            </div>
            <div className="recent-list">
              {recentLinks.map((link) => {
                const short = `${REDIRECT_BASE_URL}/${link.shortToken}`;
                return (
                  <article key={link.id} className="recent-item">
                    <div className="recent-original">
                      <span>Original</span>
                      <p title={link.originalUrl}>{link.originalUrl}</p>
                    </div>
                    <div className="recent-short">
                      <span>Short link</span>
                      <a href={short} target="_blank" rel="noopener noreferrer">{short}</a>
                    </div>
                    <button className="mini-copy" type="button" onClick={() => copyText(short)}>
                      <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                    </button>
                  </article>
                )
              })}
            </div>
          </section>
        )}
      </main>

      <footer>
        <a className="brand footer-brand" href="#" aria-label="Trimly home">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M9.5 14.5 14.5 9M7.2 17.8l-1 1a3.54 3.54 0 0 1-5-5l4.2-4.2a3.54 3.54 0 0 1 5 0M16.8 6.2l1-1a3.54 3.54 0 1 1 5 5l-4.2 4.2a3.54 3.54 0 0 1-5 0" />
            </svg>
          </span>
          <span>trimly</span>
        </a>
        <p>Small links, made thoughtfully.</p>
      </footer>

      {isAuthModalOpen && (
        <dialog open className="auth-modal" style={{ display: 'block' }}>
          <form className="auth-form" onSubmit={handleAuthSubmit}>
            <h2>{isOtpStep ? "Verify Email" : (isLoginMode ? "Log in to Trimly" : "Sign up for Trimly")}</h2>
            
            {(authError || authSuccess) && (
               <p className="form-message invalid" style={{ color: authSuccess ? "var(--green)" : "" }}>
                 {authError || authSuccess}
               </p>
            )}

            {!isOtpStep ? (
              <>
                <div className="input-row-auth">
                  <label>Email</label>
                  <input type="email" required value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} />
                </div>
                <div className="input-row-auth">
                  <label>Password</label>
                  <input type="password" required value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} />
                </div>
                <button className="primary-button" type="submit">
                  <span className="button-label">{isLoginMode ? "Log in" : "Sign up"}</span>
                </button>
              </>
            ) : (
              <>
                <p className="auth-helper-text" style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '15px' }}>
                  We sent a 6-digit code to your email.
                </p>
                <div className="input-row-auth">
                  <label>6-Digit Code</label>
                  <input type="text" minLength="6" maxLength="6" pattern="\d{6}" value={authOtp} onChange={(e) => setAuthOtp(e.target.value)} />
                </div>
                <button className="primary-button" type="submit">
                  <span className="button-label">Verify Code</span>
                </button>
                <button type="button" className="text-button" style={{ width: '100%', marginTop: '10px' }} onClick={() => setIsOtpStep(false)}>
                  Back to Email
                </button>
              </>
            )}

            {!isOtpStep && (
              <>
                <div className="auth-divider"><span>or</span></div>
                <button type="button" className="google-button" onClick={handleGoogleLogin}>
                  <svg viewBox="0 0 24 24" aria-hidden="true" className="google-icon">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  <span className="button-label">Continue with Google</span>
                </button>
                <p className="auth-toggle-text">
                  {isLoginMode ? "Don't have an account? " : "Already have an account? "}
                  <a href="#" onClick={(e) => { e.preventDefault(); setIsLoginMode(!isLoginMode); }}>
                    {isLoginMode ? "Sign up" : "Log in"}
                  </a>
                </p>
              </>
            )}

            <button type="button" className="icon-button close-modal" onClick={() => setIsAuthModalOpen(false)} aria-label="Close">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </form>
        </dialog>
      )}
    </div>
  );
}
