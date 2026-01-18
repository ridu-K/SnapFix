import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { 
  LogOut, 
  Users, 
  FileText, 
  AlertCircle,
  TrendingUp,
  Shield,
  UserCircle
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('analytics');
  const [analytics, setAnalytics] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(5);  
  const [totalPages, setTotalPages] = useState(1);
  const [workers, setWorkers] = useState([]);
  const [page1, setPage1] = useState(1);
  const [limit1] = useState(5);  
  const [totalPages1, setTotalPages1] = useState(1);
  const [users, setUsers] = useState([]);
  const [page2, setPage2] = useState(1);
  const [limit2] = useState(5);  
  const [totalPages2, setTotalPages2] = useState(1);
  const [loading, setLoading] = useState(true);
  const [load, setLoad] = useState(false);
  const categories = [
    { value: 'accident', label: 'Road Accident' },
    { value: 'water', label: 'Water Leakage' },
    { value: 'tree', label: 'Tree/Pole Damage' },
    { value: 'electrical', label: 'Electrical Issues' },
    { value: 'infrastructure', label: 'Infrastructure Damage' }
  ];

  useEffect(() => {
    fetchData(page, page1, page2);
  }, [page, page1, page2]);

  const fetchData = async (pageNumber = 1, pageNumber1 = 1, pageNumber2 = 1) => {
    try {
      setLoad(true);
      const [analyticsRes, complaintsRes, workersRes, usersRes] = await Promise.all([
        axios.get('http://localhost:5000/api/analytics'),
        axios.get(`http://localhost:5000/api/complaints?page=${pageNumber}&limit=${limit}`),
        axios.get(`http://localhost:5000/api/workers?page=${pageNumber1}&limit=${limit1}`),
        axios.get(`http://localhost:5000/api/users?page=${pageNumber2}&limit=${limit2}`)
      ]);

      setAnalytics(analyticsRes.data);

      setComplaints(complaintsRes.data.data);
      setTotalPages(complaintsRes.data.total_pages);
      setPage(complaintsRes.data.page);
      
      setWorkers(workersRes.data.data);
      setTotalPages1(workersRes.data.total_pages);
      setPage1(workersRes.data.page);

      setUsers(usersRes.data.data);
      setTotalPages2(usersRes.data.total_pages);
      setPage2(usersRes.data.page);

      
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      setLoad(false);
    }
  };

  const handleLogout = () => {
    if(window.confirm("Do you wanna logout?"))
    {
      logout();
      navigate('/');
    }
  };

  const handleAssignWorker = async (complaintId, workerId) => {
    try {
      
      await axios.put(`http://localhost:5000/api/complaints/${complaintId}`, {
        worker_id: workerId,
        message: 'Worker assigned to complaint'
      });

      setLoad(true);
      
      const response = await axios.get(`http://localhost:5000/api/complaints/${complaintId}`);

      const response1 = await axios.get(`http://localhost:5000/api/worker/${workerId}`);
    
      if(response.data && response1.data){
        const formDataToSendMail = new FormData();
        formDataToSendMail.append("email", response1.data.email)
        formDataToSendMail.append("subject", "New Task Assigned")
        formDataToSendMail.append("body", 
          `
            <div style="font-family: Arial; line-height: 1.6;">
                <h2 style="color:#0b5ed7;">New Task Received</h2>

                <strong>Hi ${response1.data.name},</strong><br>
                You have been assigned with the following task:<br>
                <p style="text-align:justify;">
                    <strong>Title:</strong> ${response.data.title}<br><br>

                    <strong>Description:</strong><br>
                    ${response.data.description}<br><br>

                    <strong>Category:</strong> ${categories.find(c => c.value === response.data.category)?.label}<br><br>
                    <strong>Location:</strong> ${response.data.location}

                </p>
            </div>
          `)

        const response2 = await axios.post('http://localhost:5000/send-mail', formDataToSendMail, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        console.log('Email sent successfully:', response2.data);
      }
      setLoad(false);
      fetchData();
    } catch (error) {
      console.error('Error assigning worker:', error);
    }
  };

  const handleUpdateStatus = async (complaintId, status) => {
    try {
      await axios.put(`http://localhost:5000/api/complaints/${complaintId}`, {
        status: status,
        message: `Status updated to ${status}`
      });
      fetchData();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: 'badge-pending',
      assigned: 'badge-assigned',
      in_progress: 'badge-in-progress',
      completed: 'badge-completed',
      rejected: 'badge-rejected'
    };
    
    return (
      <span className={`badge ${statusClasses[status]}`}>
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return <div className='smart-load'>
          <div className="dots-loader">
            <span></span><span></span><span></span>
          </div>
        </div>
  }

  // Prepare chart data
  const statusData = analytics ? [
    { name: 'Pending', value: analytics.status_breakdown.pending, color: '#f59e0b' },
    { name: 'Assigned', value: analytics.status_breakdown.assigned, color: '#3b82f6' },
    { name: 'In Progress', value: analytics.status_breakdown.in_progress, color: '#8b5cf6' },
    { name: 'Completed', value: analytics.status_breakdown.completed, color: '#10b981' },
    { name: 'Rejected', value: analytics.status_breakdown.rejected, color: '#ef4444' }
  ] : [];

  const categoryData = analytics ? Object.entries(analytics.category_breakdown).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    complaints: value
  })) : [];

  return (
    <>
      {load ? (
        <div className='smart-load'>
          <div className="dots-loader">
            <span></span><span></span><span></span>
          </div>
        </div>
      ) : (
        <div className="dashboard admin-dashboard">
          {/* Header */}
          <header className="dashboard-header">
            <div className="container">
              <div className="header-content">
                <div className="header-left">
                  <Shield size={32} color="#2563eb" />
                  <div>
                    <h1>Admin Dashboard</h1>
                    <p className="header-subtitle">Complaint Bridge Management</p>
                  </div>
                </div>
                <div className="header-actions">
                  <div className="user-info">
                    <UserCircle size={20} />
                    <span>{user?.name}</span>
                  </div>
                  <button style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }} onClick={handleLogout} className="btn btn-outline">
                    Logout
                    <LogOut size={18} />
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Navigation Tabs */}
          <div className="admin-nav">
            <div className="container">
              <div className="nav-tabs">
                <button
                  className={`nav-tab ${activeTab === 'analytics' ? 'active' : ''}`}
                  onClick={() => setActiveTab('analytics')}
                >
                  <TrendingUp size={18} />
                  Analytics
                </button>
                <button
                  className={`nav-tab ${activeTab === 'complaints' ? 'active' : ''}`}
                  onClick={() => setActiveTab('complaints')}
                >
                  <FileText size={18} />
                  Complaints
                </button>
                <button
                  className={`nav-tab ${activeTab === 'users' ? 'active' : ''}`}
                  onClick={() => setActiveTab('users')}
                >
                  <Users size={18} />
                  Users & Workers
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <main className="dashboard-main">
            <div className="container">
              {activeTab === 'analytics' && analytics && (
                <>
                  {/* Stats Cards */}
                  <div className="stats-grid">
                    <div className="stat-card gradient-blue">
                      <div className="stat-icon">
                        <FileText size={28} />
                      </div>
                      <div className="stat-content">
                        <h3>{analytics.total_complaints}</h3>
                        <p>Total Complaints</p>
                      </div>
                    </div>

                    <div className="stat-card gradient-green">
                      <div className="stat-icon">
                        <Users size={28} />
                      </div>
                      <div className="stat-content">
                        <h3>{analytics.total_users}</h3>
                        <p>Total Users</p>
                      </div>
                    </div>

                    <div className="stat-card gradient-purple">
                      <div className="stat-icon">
                        <UserCircle size={28} />
                      </div>
                      <div className="stat-content">
                        <h3>{analytics.total_workers}</h3>
                        <p>Active Workers</p>
                      </div>
                    </div>

                    <div className="stat-card gradient-orange">
                      <div className="stat-icon">
                        <AlertCircle size={28} />
                      </div>
                      <div className="stat-content">
                        <h3>{analytics.status_breakdown.pending}</h3>
                        <p>Pending Issues</p>
                      </div>
                    </div>
                  </div>

                  {/* Charts */}
                  <div className="charts-grid">
                    <div className="card">
                      <div className="card-header">
                        <h2>Status Distribution</h2>
                      </div>
                      <div className="chart-container">
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            {/* <Pie
                              data={statusData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, value }) => `${name}: ${value}`}
                              outerRadius={100}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {statusData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie> */}
                            <Pie
                              data={statusData}
                              cx="50%"
                              cy="50%"
                              outerRadius={100}
                              dataKey="value"
                              label={false}
                            >
                              {statusData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Legend />
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="card">
                      <div className="card-header">
                        <h2>Complaints by Category</h2>
                      </div>
                      <div className="chart-container">
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={categoryData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="complaints" fill="#2563eb" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* Recent Complaints */}
                  <div className="card">
                    <div className="card-header">
                      <h2>Recent Complaints</h2>
                    </div>
                    <div className="table-responsive">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Title</th>
                            <th>Category</th>
                            <th>Status</th>
                            <th>Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analytics.recent_complaints.map((complaint) => (
                            <tr key={complaint.id}>
                              <td>#{complaint.id}</td>
                              <td>{complaint.title}</td>
                              <td>
                                <span className="category-badge">
                                  {complaint.category}
                                </span>
                              </td>
                              <td>{getStatusBadge(complaint.status)}</td>
                              <td>{formatDate(complaint.created_at)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'complaints' && (
                <div className="card">
                  <div className="card-header">
                    <h2>All Complaints</h2>
                  </div>
                  <div className="table-responsive">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Title</th>
                          <th>User</th>
                          <th>Category</th>
                          <th>Status</th>
                          <th>Worker</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {complaints.map((complaint) => (
                          <tr key={complaint.id}>
                            <td>#{complaint.id}</td>
                            <td>{complaint.title}</td>
                            <td>{complaint.user_name}</td>
                            <td>
                              <span className="category-badge">
                                {complaint.category}
                              </span>
                            </td>
                            <td>{getStatusBadge(complaint.status)}</td>
                            <td>
                              <select
                                className="form-select-sm"
                                value={complaint.worker.id || ''}
                                onChange={(e) => handleAssignWorker(complaint.id, e.target.value)}
                              >
                                <option value="">Assign Worker</option>
                                <option key={complaint.worker_id} value={complaint.worker_id}>
                                  {complaint.worker} ({complaint.score})
                                </option>
                              </select>
                            </td>
                            <td>
                              <div className="action-buttons">
                                <Link 
                                  to={`/complaint/${complaint.id}`}
                                  className="btn-sm btn-primary"
                                >
                                  View
                                </Link>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="pagination">
                      <button
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                        className="btn-pagination"
                      >
                        Prev
                      </button>

                      <span> Page {page} of {totalPages} </span>

                      <button
                        disabled={page === totalPages}
                        onClick={() => setPage(page + 1)}
                        className="btn-pagination"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'users' && (
                <>
                  <div className="card" style={{ marginBottom: '40px' }}>
                    <div className="card-header">
                      <h2>Workers</h2>
                    </div>
                    <div className="table-responsive">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Assigned Complaints</th>
                            <th>Workload</th>
                          </tr>
                        </thead>
                        <tbody>
                          {workers.map((worker) => (
                            <tr key={worker.id}>
                              <td>{worker.name}</td>
                              <td>{worker.email}</td>
                              <td>{worker.phone || 'N/A'}</td>
                              <td>{worker.assigned_complaints}</td>
                              <td>{worker.workload}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="pagination">
                        <button
                          disabled={page1 === 1}
                          onClick={() => setPage(page1 - 1)}
                          className="btn-pagination"
                        >
                          Prev
                        </button>

                        <span> Page {page1} of {totalPages1} </span>

                        <button
                          disabled={page1 === totalPages1}
                          onClick={() => setPage(page1 + 1)}
                          className="btn-pagination"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="card">
                    <div className="card-header">
                      <h2>All Users</h2>
                    </div>
                    <div className="table-responsive">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Role</th>
                            <th>Joined</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map((user) => (
                            <tr key={user.id}>
                              <td>{user.name}</td>
                              <td>{user.email}</td>
                              <td>{user.phone || 'N/A'}</td>
                              <td>
                                <span className="role-badge">
                                  {user.role}
                                </span>
                              </td>
                              <td>{formatDate(user.created_at)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="pagination">
                        <button
                          disabled={page2 === 1}
                          onClick={() => setPage(page2 - 1)}
                          className="btn-pagination"
                        >
                          Prev
                        </button>

                        <span> Page {page2} of {totalPages2} </span>

                        <button
                          disabled={page2 === totalPages2}
                          onClick={() => setPage(page2 + 1)}
                          className="btn-pagination"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </main>
        </div>
      )}
    </>
  );
};

export default AdminDashboard;
