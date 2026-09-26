import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [isBackendReady, setIsBackendReady] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Auth
  const [isLogin, setIsLogin] = useState(true);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authUsername, setAuthUsername] = useState('');
  const [authError, setAuthError] = useState('');

  // Data
  const [activities, setActivities] = useState([]);
  const [friends, setFriends] = useState([]);

  // Add Expense Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [selectedFriend, setSelectedFriend] = useState('');

  // Add Friend Modal
  const [isFriendModalOpen, setIsFriendModalOpen] = useState(false);
  const [newFriendEmail, setNewFriendEmail] = useState('');
  const [friendError, setFriendError] = useState('');

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/ping`);
        if (res.ok) setIsBackendReady(true);
      } catch (err) { /* still booting */ }
    };
    checkHealth();
    const interval = setInterval(() => { if (!isBackendReady) checkHealth(); }, 2000);
    return () => clearInterval(interval);
  }, [isBackendReady]);

  useEffect(() => {
    const saved = localStorage.getItem('fairshare_user');
    if (saved) setCurrentUser(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchExpenses();
      fetchFriends();
    }
  }, [currentUser]);

  const fetchExpenses = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/expenses/${currentUser.email}`);
      if (res.ok) setActivities(await res.json());
    } catch (err) { console.error(err); }
  };

  const fetchFriends = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/friends/${currentUser.email}`);
      if (res.ok) setFriends(await res.json());
    } catch (err) { console.error(err); }
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
    } catch (err) { setAuthError(err.message); }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('fairshare_user');
    setActivities([]);
    setFriends([]);
  };

  const handleAddFriend = async (e) => {
    e.preventDefault();
    setFriendError('');
    try {
      const res = await fetch(`${apiUrl}/api/friends/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requesterEmail: currentUser.email, friendEmail: newFriendEmail })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add friend');
      setIsFriendModalOpen(false);
      setNewFriendEmail('');
      fetchFriends();
    } catch (err) { setFriendError(err.message); }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!expenseTitle || !expenseAmount || !selectedFriend) return;
    try {
      const res = await fetch(`${apiUrl}/api/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: expenseTitle,
          amount: parseFloat(expenseAmount),
          paidByEmail: currentUser.email,
          splitWithEmail: selectedFriend
        })
      });
      if (res.ok) {
        setIsModalOpen(false);
        setExpenseTitle('');
        setExpenseAmount('');
        setSelectedFriend('');
        fetchExpenses();
      }
    } catch (err) { console.error(err); }
  };

  const FairShareLogo = () => (
    <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.64-2.25 1.64-1.74 0-2.27-.85-2.34-1.76H7.83c.14 1.7 1.4 2.94 3.07 3.23V19h2.3v-1.62c1.94-.37 3.07-1.53 3.07-3.1 0-1.87-1.22-2.78-3.96-3.14z"/>
    </svg>
  );

  if (!isBackendReady) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <h2>Waking up server...</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Free servers sleep after inactivity. One moment!</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="logo" style={{ justifyContent: 'center', marginBottom: '8px' }}>
            <FairShareLogo /> FairShare
          </div>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '28px' }}>
            {isLogin ? 'Welcome back!' : 'Create your account'}
          </p>
          {authError && <div className="error-msg">{authError}</div>}
          <form onSubmit={handleAuth}>
            {!isLogin && (
              <div className="form-group">
                <label>Username</label>
                <input type="text" placeholder="Your name" value={authUsername} onChange={e => setAuthUsername(e.target.value)} required />
              </div>
            )}
            <div className="form-group">
              <label>Email</label>
              <input type="email" placeholder="you@example.com" value={authEmail} onChange={e => setAuthEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" placeholder="••••••••" value={authPassword} onChange={e => setAuthPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '8px' }}>
              {isLogin ? 'Log In' : 'Create Account'}
            </button>
          </form>
          <p className="auth-switch">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span onClick={() => { setIsLogin(!isLogin); setAuthError(''); }}>
              {isLogin ? 'Sign up' : 'Log in'}
            </span>
          </p>
        </div>
      </div>
    );
  }

  let youOwe = 0, youAreOwed = 0;
  activities.forEach(exp => {
    const half = exp.amount / 2;
    if (exp.paidByEmail === currentUser.email) youAreOwed += half;
    else youOwe += half;
  });
  const totalBalance = youAreOwed - youOwe;

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="logo"><FairShareLogo /> FairShare</div>
        <div className="nav-links">
          <span className="active">Dashboard</span>
          <span onClick={() => setIsFriendModalOpen(true)}>+ Add Friend</span>
          <span onClick={handleLogout}>Log Out</span>
        </div>
      </nav>

      <main className="main-content">
        <div className="page-header">
          <h1>Hey, {currentUser.username || currentUser.email.split('@')[0]} 👋</h1>
          <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add expense
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

        {/* Friends Panel */}
        {friends.length > 0 && (
          <>
            <h2 className="section-title">Friends ({friends.length})</h2>
            <div className="friends-list">
              {friends.map(f => (
                <div className="friend-chip" key={f.id}>
                  <div className="friend-avatar">{(f.friendUsername || f.friendEmail)[0].toUpperCase()}</div>
                  <span>{f.friendUsername || f.friendEmail}</span>
                </div>
              ))}
            </div>
          </>
        )}

        <h2 className="section-title" style={{ marginTop: friends.length > 0 ? '32px' : '0' }}>Recent Activity</h2>
        <div className="activity-list">
          {activities.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>🧾</div>
              <p>No expenses yet. Add one above!</p>
            </div>
          ) : activities.map((activity) => {
            const iPaid = activity.paidByEmail === currentUser.email;
            const type = iPaid ? 'lent' : 'owes';
            const half = (activity.amount / 2).toFixed(2);
            const friendName = iPaid
              ? friends.find(f => f.friendEmail === activity.splitWithEmail)?.friendUsername || activity.splitWithEmail
              : friends.find(f => f.friendEmail === activity.paidByEmail)?.friendUsername || activity.paidByEmail;

            return (
              <div className="activity-item" key={activity.id}>
                <div className="activity-details">
                  <div className="activity-icon">🧾</div>
                  <div className="activity-info">
                    <h4>{activity.title}</h4>
                    <p>
                      {iPaid
                        ? `You paid ₹${activity.amount} — ${friendName} owes you half`
                        : `${friendName} paid ₹${activity.amount} — you owe half`}
                    </p>
                  </div>
                </div>
                <div className="activity-balance">
                  <div className="cost" style={{ color: type === 'owes' ? 'var(--danger-color)' : 'var(--success-color)' }}>
                    {type === 'owes' ? '-' : '+'} ₹{half}
                  </div>
                  <div className={`status ${type}`}>{type === 'owes' ? 'you owe' : 'you lent'}</div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Add Expense Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Add an expense</h2>
            <form onSubmit={handleAddExpense}>
              <div className="form-group">
                <label>Description</label>
                <input type="text" placeholder="e.g. Dinner at Dominos" value={expenseTitle} onChange={e => setExpenseTitle(e.target.value)} autoFocus required />
              </div>
              <div className="form-group">
                <label>Total Amount (₹)</label>
                <input type="number" placeholder="0.00" step="0.01" min="0.01" value={expenseAmount} onChange={e => setExpenseAmount(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Split equally with</label>
                {friends.length === 0 ? (
                  <div className="empty-state" style={{ padding: '16px', borderRadius: '8px', border: '1px dashed var(--border-color)' }}>
                    <p style={{ fontSize: '14px' }}>No friends added yet. <span style={{ color: 'var(--primary-color)', cursor: 'pointer' }} onClick={() => { setIsModalOpen(false); setIsFriendModalOpen(true); }}>Add a friend first →</span></p>
                  </div>
                ) : (
                  <select value={selectedFriend} onChange={e => setSelectedFriend(e.target.value)} required>
                    <option value="">Select a friend...</option>
                    {friends.map(f => (
                      <option key={f.id} value={f.friendEmail}>{f.friendUsername || f.friendEmail}</option>
                    ))}
                  </select>
                )}
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={friends.length === 0}>Save Expense</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Friend Modal */}
      {isFriendModalOpen && (
        <div className="modal-overlay" onClick={() => { setIsFriendModalOpen(false); setFriendError(''); }}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Add a Friend</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px', textAlign: 'center' }}>
              Your friend must already have a FairShare account.
            </p>
            {friendError && <div className="error-msg">{friendError}</div>}
            <form onSubmit={handleAddFriend}>
              <div className="form-group">
                <label>Friend's Email</label>
                <input type="email" placeholder="friend@example.com" value={newFriendEmail} onChange={e => setNewFriendEmail(e.target.value)} autoFocus required />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => { setIsFriendModalOpen(false); setFriendError(''); }}>Cancel</button>
                <button type="submit" className="btn-primary">Add Friend</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
