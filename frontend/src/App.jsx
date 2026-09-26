import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [isBackendReady, setIsBackendReady] = useState(false);
  const [isSlowBoot, setIsSlowBoot] = useState(false);
  
  // AI Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedData, setParsedData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If it takes more than 3 seconds, show the subtext for slow cold boots
    const timer = setTimeout(() => {
      if (!isBackendReady) setIsSlowBoot(true);
    }, 3000);

    // Ping the backend to wake it up / check health
    const pingBackend = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
        const res = await fetch(`${apiUrl}/api/ping`);
        if (res.ok) {
          setIsBackendReady(true);
          clearTimeout(timer);
        }
      } catch (err) {
        // If it fails, retry in 5 seconds (Render cold start)
        console.log("Backend waking up...", err);
        setTimeout(pingBackend, 5000);
      }
    };

    pingBackend();

    return () => clearTimeout(timer);
  }, [isBackendReady]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64Image = reader.result;
      setIsParsing(true);
      setError(null);
      setParsedData(null);

      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
        const response = await fetch(`${apiUrl}/api/ai/parse-receipt`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64Image })
        });
        
        if (!response.ok) throw new Error('Failed to parse receipt');
        
        const data = await response.json();
        setParsedData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsParsing(false);
      }
    };
  };

  if (!isBackendReady) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <div className="loading-text">Setting up your workspace...</div>
        {isSlowBoot && (
          <div className="loading-subtext">
            Our secure environment is spinning up. This usually takes about 30 seconds on the first visit.
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="logo">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.64-2.25 1.64-1.74 0-2.27-.85-2.34-1.76H7.83c.14 1.7 1.4 2.94 3.07 3.23V19h2.3v-1.62c1.94-.37 3.07-1.53 3.07-3.1 0-1.87-1.22-2.78-3.96-3.14z"/>
          </svg>
          FairShare
        </div>
        <div className="nav-links">
          <span>Dashboard</span>
          <span>Groups</span>
          <span>Activity</span>
        </div>
      </nav>

      <main className="main-content">
        <div className="hero">
          <h1>Fair splits, zero friction.</h1>
          <p>The modern way to share expenses with roommates, trips, and groups.</p>
        </div>

        <div className="dashboard-grid">
          <div className="card">
            <div className="card-title">Goa Trip 2026</div>
            <div className="card-amount">₹4,500</div>
            <div className="card-subtitle">You owe Rahul</div>
          </div>
          
          <div className="card">
            <div className="card-title">Apartment Utilities</div>
            <div className="card-amount">₹1,250</div>
            <div className="card-subtitle">Ankit owes you</div>
          </div>

          <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <button className="btn-primary" onClick={() => setIsModalOpen(true)}>+ Add Expense</button>
          </div>
        </div>
      </main>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Add AI Expense</h2>
            <p style={{marginBottom: '16px', color: 'var(--text-gray)'}}>Upload a receipt image to automatically extract items and prices.</p>
            
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageUpload} 
              style={{marginBottom: '16px'}}
            />

            {isParsing && <div style={{color: 'var(--primary-color)'}}>Parsing receipt using AI...</div>}
            {error && <div style={{color: 'red'}}>{error}</div>}
            
            {parsedData && (
              <div className="parsed-result">
                <h4 style={{marginBottom: '8px'}}>Extracted Items:</h4>
                <pre style={{whiteSpace: 'pre-wrap', fontFamily: 'monospace'}}>
                  {JSON.stringify(parsedData, null, 2)}
                </pre>
              </div>
            )}

            <div className="modal-actions" style={{marginTop: '24px'}}>
              <button className="btn-secondary" onClick={() => { setIsModalOpen(false); setParsedData(null); }}>Cancel</button>
              <button className="btn-primary" disabled={isParsing}>Confirm Split</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
