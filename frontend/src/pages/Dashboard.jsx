import React, { useState, useEffect } from 'react';
import { Landmark, Briefcase, Search, Settings, Trash2, Building2 } from 'lucide-react';

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [dbStatus, setDbStatus] = useState('SYNCING');

  // Form State
  const [formData, setFormData] = useState({ name: '', email: '', age: '', hobbies: '', bio: '', userId: '' });
  const [editId, setEditId] = useState(null);
  // Filter State
  const [filters, setFilters] = useState({ name: '', email: '', age: '', search: '', hobbies: '' });

  const addLog = (msg) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 30));
  };

  const fetchUsers = async () => {
    addLog(`GET /users - Fetching client profiles from database...`);
    try {
      const queryParams = new URLSearchParams();
      if(filters.name) queryParams.append('name', filters.name);
      if(filters.email) queryParams.append('email', filters.email);
      if(filters.age) queryParams.append('age', filters.age);
      if(filters.search) queryParams.append('search', filters.search);
      if(filters.hobbies) queryParams.append('hobbies', filters.hobbies);

      const res = await fetch(`https://library-fsd-5b-backend.onrender.com/users?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.data || []);
        addLog(`SUCCESS: Authorized view of ${data.data?.length || 0} client records.`);
        setDbStatus('SECURE');
      } else {
        throw new Error('Database Error');
      }
    } catch (e) {
      addLog(`ERROR: Connection to Central Library dropped.`);
      setDbStatus('OFFLINE');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isUpdate = !!editId;
    addLog(`${isUpdate ? 'PUT' : 'POST'} /users - ${isUpdate ? 'Updating existing' : 'Opening new'} client profile...`);
    try {
      const payload = {
        ...formData,
        age: Number(formData.age),
        hobbies: typeof formData.hobbies === 'string' ? formData.hobbies.split(',').map(h => h.trim()) : formData.hobbies
      };
      
      const res = await fetch(`https://library-fsd-5b-backend.onrender.com/users${isUpdate ? `/${editId}` : ''}`, {
        method: isUpdate ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        addLog(`SUCCESS: Client portfolio successfully ${isUpdate ? 'updated' : 'provisioned'}.`);
        setFormData({ name: '', email: '', age: '', hobbies: '', bio: '', userId: '' });
        setEditId(null);
        fetchUsers();
      } else {
        const err = await res.json();
        addLog(`DECLINED: ${err.error}`);
      }
    } catch (e) {
      addLog(`SYSTEM FAILURE: Could not negotiate transaction.`);
    }
  };

  const handleEditInit = (u) => {
    setEditId(u._id);
    setFormData({
      name: u.name,
      email: u.email,
      age: u.age,
      hobbies: u.hobbies ? u.hobbies.join(', ') : '',
      bio: u.bio,
      userId: u.userId
    });
    addLog(`SYS: Loaded ${u.userId} into provisioning form for modification.`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    addLog(`DELETE /users/${id} - Terminating client profile...`);
    try {
      if(window.confirm('Are you strictly authorized to close this portfolio account?')) {
        const res = await fetch(`https://library-fsd-5b-backend.onrender.com/users/${id}`, { method: 'DELETE' });
        if (res.ok) {
          addLog('OVERRIDE APPROVED: Record successfully expunged.');
          fetchUsers();
        }
      }
    } catch (e) {
      addLog(`ERROR: Portfolio closure rejected.`);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle auto-fetch when filters change
  useEffect(() => {
    const timeout = setTimeout(() => {
       fetchUsers();
    }, 500);
    return () => clearTimeout(timeout);
  }, [filters]);


  return (
    <div className="dashboard-layout">
      
      {/* Institutional Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' }}>
        <div>
          <span className="label-sm" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-gold)' }}>
            <Building2 size={16} /> 
            WEALTH MANAGEMENT PORTAL
          </span>
          <h1 className="display-lg" style={{ marginTop: '5px' }}>Aegis Library</h1>
          <p className="body-md">Institutional Client Database & CRM System. Strictly Confidential.</p>
        </div>
        <div>
           <div className="status-pill">
              <div className="status-dot" style={{ backgroundColor: dbStatus === 'SECURE' ? 'var(--success)' : 'var(--danger)' }}></div>
              DATABASE {dbStatus}
           </div>
        </div>
      </div>

      <div className="bento-grid">
        
        {/* NEW ACCOUNT FORM PANEL */}
        <div className="corporate-panel col-span-5">
           <h2 className="headline-md" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Briefcase size={20} color="var(--primary-navy)"/>
              Client Enrollment
           </h2>
           <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
             <div>
                <label className="label-sm" style={{ display: 'block', marginBottom: '6px' }}>Account UUID (Required)</label>
                <input className="library-input" type="text" placeholder="e.g. USR-782" required value={formData.userId} onChange={e => setFormData({...formData, userId: e.target.value})} />
             </div>
             
             <div>
                <label className="label-sm" style={{ display: 'block', marginBottom: '6px' }}>Primary Beneficiary Name</label>
                <input className="library-input" type="text" placeholder="Full Legal Name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
             </div>

             <div>
                <label className="label-sm" style={{ display: 'block', marginBottom: '6px' }}>Contact Email</label>
                <input className="library-input" type="email" placeholder="client@domain.com" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
             </div>

             <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                   <label className="label-sm" style={{ display: 'block', marginBottom: '6px' }}>Age Status</label>
                   <input className="library-input" type="number" placeholder="Years" required value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} />
                </div>
                <div style={{ flex: 2 }}>
                   <label className="label-sm" style={{ display: 'block', marginBottom: '6px' }}>Known Affiliations</label>
                   <input className="library-input" type="text" placeholder="Golf, Art, etc" value={formData.hobbies} onChange={e => setFormData({...formData, hobbies: e.target.value})} />
                </div>
             </div>

             <div>
                <label className="label-sm" style={{ display: 'block', marginBottom: '6px' }}>Dossier Notes</label>
                <textarea className="library-input" placeholder="Executive summary for indexing..." rows="2" value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})}></textarea>
             </div>
             
             <button type="submit" className="btn-primary" style={{ marginTop: '8px' }}>
                {editId ? 'Update Client Dossier' : 'Authorize & Provision Account'}
             </button>
             {editId && (
                <button type="button" className="btn-tertiary" style={{ alignSelf: 'center', color: 'var(--text-muted)' }} onClick={() => { setEditId(null); setFormData({ name: '', email: '', age: '', hobbies: '', bio: '', userId: '' }); }}>Cancel Update</button>
             )}
           </form>
        </div>

        {/* FINANCIAL QUERY & LOGS */}
        <div className="col-span-7" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
           
           <div className="corporate-panel">
             <h2 className="headline-md" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Search size={20} color="var(--primary-navy)" />
                Directory Search Query
             </h2>
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
               <input className="library-input" type="text" placeholder="Search Dossier (Bio)..." value={filters.search} onChange={e => setFilters({...filters, search: e.target.value})} />
               <input className="library-input" type="text" placeholder="Client Name..." value={filters.name} onChange={e => setFilters({...filters, name: e.target.value})} />
               <div style={{ display: 'flex', gap: '8px' }}>
                  <input className="library-input" type="text" placeholder="Email..." value={filters.email} onChange={e => setFilters({...filters, email: e.target.value})} />
                  <input className="library-input" type="number" placeholder="Age" value={filters.age} style={{ width: '80px' }} onChange={e => setFilters({...filters, age: e.target.value})} />
               </div>
               <input className="library-input" type="text" placeholder="Affiliation Match..." value={filters.hobbies} onChange={e => setFilters({...filters, hobbies: e.target.value})} />
             </div>
           </div>

           <div className="corporate-panel" style={{ flexGrow: 1 }}>
              <h2 className="label-sm" style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                 <Settings size={14} /> SYSTEM AUDIT LOG
              </h2>
              <div className="sys-console">
                  {logs.map((log, i) => (
                    <div key={i} style={{ marginBottom: '4px', opacity: 1 - (i * 0.08) }}>
                      {log}
                    </div>
                  ))}
              </div>
           </div>

        </div>

        {/* THE MASTER LEDGER */}
        <div className="corporate-panel col-span-12">
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingBottom: '16px' }}>
             <h2 className="headline-md" style={{ margin: 0, borderBottom: 'none', paddingBottom: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Landmark size={24} color="var(--accent-gold)" />
                Master Client Ledger
             </h2>
             <span className="label-sm">Authorized Records: {users.length}</span>
           </div>
           
           <div className="library-ledger-wrapper">
             <table className="library-ledger">
               <thead>
                 <tr>
                   <th>UUID Node</th>
                   <th>Client Name</th>
                   <th>Contact Email</th>
                   <th>Age</th>
                   <th>Affiliations</th>
                   <th>Dossier Summary</th>
                   <th style={{ textAlign: 'right' }}>Actions</th>
                 </tr>
               </thead>
               <tbody>
                  {users.map(u => (
                    <tr key={u._id}>
                      <td className="ledger-id">{u.userId}</td>
                      <td style={{ fontWeight: 500 }}>{u.name}</td>
                      <td>{u.email}</td>
                      <td>{u.age}</td>
                      <td>{u.hobbies?.join(', ')}</td>
                      <td style={{ maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.bio}</td>
                      <td style={{ textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                         <button className="btn-tertiary" style={{ color: 'var(--accent-gold)' }} onClick={() => handleEditInit(u)}>Update</button>
                         <button className="btn-tertiary" onClick={() => handleDelete(u._id)}>Terminate</button>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                         No institutional records match provided criteria.
                      </td>
                    </tr>
                  )}
               </tbody>
             </table>
           </div>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;
