import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [isBackendReady, setIsBackendReady] = useState(false);
  
  // Manual Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  
  // Dummy State to make the app feel alive for the demo
  const [activities, setActivities] = useState([
    { id: 1, title: 'Goa Trip 2026', desc: 'Flight tickets', icon: '✈️', amount: 4500, type: 'lent' },
    { id: 2, title: 'Apartment Utilities', desc: 'Electricity and Wi-Fi', icon: '💡', amount: 1250, type: 'owes' },
    { id: 3, title: 'Dinner at Dominos', desc: 'Pizza and garlic bread', icon: '🍕', amount: 500, type: 'lent' }
  ]);

  useEffect(() => {
    // Health check ping to wake up Render instance
    const checkHealth = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
        const res = await fetch(`${apiUrl}/api/ping`);
        if (res.ok) {
          setIsBackendReady(true);
        }
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

  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!expenseTitle || !expenseAmount) return;
    
    // Add to dummy list for demo purposes
    const newActivity = {
      id: Date.now(),
      title: expenseTitle,
      desc: 'Manually added expense',
      icon: '🧾',
      amount: parseInt(expenseAmount),
      type: 'lent'
    };
    
    setActivities([newActivity, ...activities]);
    setIsModalOpen(false);
    setExpenseTitle('');
    setExpenseAmount('');
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
          <span>Groups</span>
          <span>Activity</span>
        </div>
      </nav>

      <main className="main-content">
        <div className="page-header">
          <h1>Welcome back, Saksham</h1>
          <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Add an expense
          </button>
        </div>

        <div className="summary-grid">
          <div className="summary-card">
            <h3>Total balance</h3>
            <div className="amount positive">+ ₹3,750</div>
          </div>
          <div className="summary-card">
            <h3>You owe</h3>
            <div className="amount negative">₹1,250</div>
          </div>
          <div className="summary-card">
            <h3>You are owed</h3>
            <div className="amount positive">₹5,000</div>
          </div>
        </div>

        <h2 className="section-title">Recent Activity</h2>
        <div className="activity-list">
          {activities.map((activity) => (
            <div className="activity-item" key={activity.id}>
              <div className="activity-details">
                <div className="activity-icon">{activity.icon}</div>
                <div className="activity-info">
                  <h4>{activity.title}</h4>
                  <p>{activity.desc}</p>
                </div>
              </div>
              <div className="activity-balance">
                <div className="cost" style={{ color: activity.type === 'owes' ? 'var(--primary-color)' : 'var(--success-color)' }}>
                  {activity.type === 'owes' ? '-' : '+'} ₹{activity.amount}
                </div>
                <div className={`status ${activity.type}`}>
                  {activity.type === 'owes' ? 'you owe' : 'you lent'}
                </div>
              </div>
            </div>
          ))}
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
                  placeholder="Enter a description"
                  value={expenseTitle}
                  onChange={(e) => setExpenseTitle(e.target.value)}
                  autoFocus
                />
              </div>
              
              <div className="form-group">
                <label>Amount (₹)</label>
                <input 
                  type="number" 
                  placeholder="0.00"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Paid by</label>
                <select>
                  <option>You (and split equally)</option>
                  <option>Someone else (and split equally)</option>
                </select>
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
