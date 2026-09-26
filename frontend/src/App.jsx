import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [isBackendReady, setIsBackendReady] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Auth Form State
  const [isLogin, setIsLogin] = useState(true);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authUsername, setAuthUsername] = useState('');
  const [authError, setAuthError] = useState('');
  
  // Dashboard State
  const [activities, setActivities] = useState([]);
  
  // Manual Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [splitWithEmail, setSplitWithEmail] = useState('');
  
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';

  useEffect(() => {
    // Health check
    const checkHealth = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/ping`);
        if (res.ok) setIsBackendReady(true);
      } catch (err) {
        console.log("Backend booting...");
      }
    };
    checkHealth();
    const interval = setInterval(() => {
      if (!isBackendReady) checkHealth();
    }, 2000);
    return () => clearInterval(interval);
  }, [isBackendReady]);

  // Load user from local storage
  useEffect(() => {
    const savedUser = localStorage.getItem('fairshare_user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  // Fetch expenses when user changes
  useEffect(() => {
    if (currentUser) {
      fetchExpenses();
    }
  }, [currentUser]);

  const fetchExpenses = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/expenses/${currentUser.email}`);
      if (res.ok) {
        const data = await res.json();
        setActivities(data);
      }
    } catch (err) {
      console.error("Failed to fetch expenses", err);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    const endpoint = isLogin ? '/api/users/login' : '/api/users/register';
    
    const payload = { email: authEmail, password: authPassword };
    if (!isLogin) payload.username = authUsername;

    try {
      const res = await fetch(`${apiUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Authentication failed');
      
      setCurrentUser(data);
      localStorage.setItem('fairshare_user', JSON.stringify(data));
      setAuthEmail('');
      setAuthPassword('');
      setAuthUsername('');
    } catch (err) {
      setAuthError(err.message);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('fairshare_user');
    setActivities([]);
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!expenseTitle || !expenseAmount || !splitWithEmail) return;
    
    const payload = {
      title: expenseTitle,
      amount: parseFloat(expenseAmount),
      paidByEmail: currentUser.email,
      splitWithEmail: splitWithEmail
    };

    try {
      const res = await fetch(`${apiUrl}/api/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setIsModalOpen(false);
        setExpenseTitle('');
        setExpenseAmount('');
        setSplitWithEmail('');
        fetchExpenses(); // Refresh list
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!isBackendReady) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <h2>Waking up server...</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
          Free servers sleep after 15 minutes of inactivity.
        </p>
      </div>
    );
  }

  // Auth Screen
  if (!currentUser) {
    return (
      <div className="app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="modal-content" style={{ animation: 'none' }}>
          <h2 style={{ textAlign: 'center', color: 'var(--primary-color)' }}>
            <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" style={{ verticalAlign: 'middle', marginRight: '8px' }}>
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.64-2.25 1.64-1.74 0-2.27-.85-2.34-1.76H7.83c.14 1.7 1.4 2.94 3.07 3.23V19h2.3v-1.62c1.94-.37 3.07-1.53 3.07-3.1 0-1.87-1.22-2.78-3.96-3.14z"/>
            </svg>
            FairShare
          </h2>
          <p style={{ textAlign: 'center', marginBottom: '24px', color: 'var(--text-muted)' }}>
            {isLogin ? 'Log in to your account' : 'Create a new account'}
          </p>
          
          {authError && <div style={{ color: 'var(--danger-color)', marginBottom: '16px', fontSize: '14px', textAlign: 'center' }}>{authError}</div>}
          
          <form onSubmit={handleAuth}>
            {!isLogin && (
              <div className="form-group">
                <label>Username</label>
                <input type="text" value={authUsername} onChange={e => setAuthUsername(e.target.value)} required />
              </div>
            )}
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={authEmail} onChange={e => setAuthEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" value={authPassword} onChange={e => setAuthPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%' }}>
              {isLogin ? 'Log In' : 'Sign Up'}
            </button>
          </form>
          
          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px' }}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span style={{ color: 'var(--primary-color)', cursor: 'pointer', fontWeight: '600' }} onClick={() => { setIsLogin(!isLogin); setAuthError(''); }}>
              {isLogin ? 'Sign up' : 'Log in'}
            </span>
          </p>
        </div>
      </div>
    );
  }

  // Calculate balances
  let youOwe = 0;
  let youAreOwed = 0;
  
  activities.forEach(exp => {
    // We assume standard 50/50 split for this demo
    const half = exp.amount / 2;
    if (exp.paidByEmail === currentUser.email) {
      youAreOwed += half;
    } else {
      youOwe += half;
    }
  });
  
  const totalBalance = youAreOwed - youOwe;

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
          <span className="active">Dashboard</span>
          <span onClick={handleLogout}>Log Out ({currentUser.username || currentUser.email})</span>
        </div>
      </nav>

      <main className="main-content">
        <div className="page-header">
          <h1>Welcome back, {currentUser.username || currentUser.email.split('@')[0]}</h1>
          <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Add an expense
          </button>
        </div>

        <div className="summary-grid">
          <div className="summary-card">
            <h3>Total balance</h3>
            <div className={`amount ${totalBalance >= 0 ? 'positive' : 'negative'}`}>
              {totalBalance >= 0 ? '+' : '-'} ₹{Math.abs(totalBalance).toFixed(2)}
            </div>
          </div>
          <div className="summary-card">
            <h3>You owe</h3>
            <div className="amount negative">₹{youOwe.toFixed(2)}</div>
          </div>
          <div className="summary-card">
            <h3>You are owed</h3>
            <div className="amount positive">₹{youAreOwed.toFixed(2)}</div>
          </div>
        </div>

        <h2 className="section-title">Recent Activity</h2>
        <div className="activity-list">
          {activities.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No expenses yet. Add one above!
            </div>
          ) : (
            activities.map((activity) => {
              const iPaid = activity.paidByEmail === currentUser.email;
              const type = iPaid ? 'lent' : 'owes';
              const displayAmount = (activity.amount / 2).toFixed(2);
              
              return (
                <div className="activity-item" key={activity.id}>
                  <div className="activity-details">
                    <div className="activity-icon">🧾</div>
                    <div className="activity-info">
                      <h4>{activity.title}</h4>
                      <p>
                        {iPaid 
                          ? `You paid ₹${activity.amount}, ${activity.splitWithEmail} owes you half`
                          : `${activity.paidByEmail} paid ₹${activity.amount}, you owe half`}
                      </p>
                    </div>
                  </div>
                  <div className="activity-balance">
                    <div className="cost" style={{ color: type === 'owes' ? 'var(--primary-color)' : 'var(--success-color)' }}>
                      {type === 'owes' ? '-' : '+'} ₹{displayAmount}
                    </div>
                    <div className={`status ${type}`}>
                      {type === 'owes' ? 'you owe' : 'you lent'}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Add an expense</h2>
            <form onSubmit={handleAddExpense}>
              <div className="form-group">
                <label>Description</label>
                <input 
                  type="text" 
                  placeholder="e.g. Dinner at Dominos"
                  value={expenseTitle}
                  onChange={(e) => setExpenseTitle(e.target.value)}
                  autoFocus
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Total Amount (₹)</label>
                <input 
                  type="number" 
                  placeholder="0.00"
                  step="0.01"
                  min="0.01"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Split equally with (Enter Email)</label>
                <input 
                  type="email" 
                  placeholder="friend@example.com"
                  value={splitWithEmail}
                  onChange={(e) => setSplitWithEmail(e.target.value)}
                  required
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Expense</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
