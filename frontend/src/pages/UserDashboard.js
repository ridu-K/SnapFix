import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { 
  PlusCircle, 
  LogOut, 
  FileText, 
  Clock, 
  CheckCircle,
  User
} from 'lucide-react';
import './Dashboard.css';

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(5);  
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [load, setLoad] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    in_progress: 0,
    completed: 0
  });

  useEffect(() => {
    fetchComplaints(page);
  }, [page]);

  const fetchComplaints = async (pageNumber = 1) => {
    try {
      setLoad(true);
      const response = await axios.get(`http://localhost:5000/api/complaints?page=${pageNumber}&limit=${limit}`);
      const response1 = await axios.get(`http://localhost:5000/api/allcomplaints`);
      setComplaints(response.data.data);
      setPage(response.data.page)
      setTotalPages(response.data.total_pages);
      // Calculate stats
      const stats = {
        total: response1.data.data.length,
        pending: response1.data.data.filter(c => c.status === 'pending').length,
        in_progress: response1.data.data.filter(c => c.status === 'in_progress' || c.status === 'assigned').length,
        completed: response1.data.data.filter(c => c.status === 'completed').length
      };
      setStats(stats);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
      setLoad(false);
    }
  };

  const handleLogout = () => {
    if(window.confirm("Do you want to logout?")){
      logout();
      navigate('/');
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

  return (
    <>
      {load ? (
        <div className='smart-load'>
          <div className="dots-loader">
            <span></span><span></span><span></span>
          </div>
        </div>
      ) : (
        <div className="dashboard">
          {/* Header */}
          <header className="dashboard-header">
            <div className="container">
              <div className="header-content">
                <h1>Complaint Bridge</h1>
                <div className="header-actions">
                  <div className="user-info">
                    <User size={20} />
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

          {/* Main Content */}
          <main className="dashboard-main">
            <div className="container">
              {/* Stats Cards */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon" style={{ background: '#dbeafe' }}>
                    <FileText size={24} color="#2563eb" />
                  </div>
                  <div className="stat-content">
                    <h3>{stats.total}</h3>
                    <p>Total Complaints</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon" style={{ background: '#fef3c7' }}>
                    <Clock size={24} color="#f59e0b" />
                  </div>
                  <div className="stat-content">
                    <h3>{stats.pending}</h3>
                    <p>Pending</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon" style={{ background: '#e0e7ff' }}>
                    <Clock size={24} color="#6366f1" />
                  </div>
                  <div className="stat-content">
                    <h3>{stats.in_progress}</h3>
                    <p>In Progress</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon" style={{ background: '#d1fae5' }}>
                    <CheckCircle size={24} color="#10b981" />
                  </div>
                  <div className="stat-content">
                    <h3>{stats.completed}</h3>
                    <p>Completed</p>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="action-section">
                <Link to="/create-complaint" className="btn btn-primary btn-large">
                  <PlusCircle size={20} />
                  Submit New Complaint
                </Link>
              </div>

              {/* Complaints Table */}
              <div className="card">
                <div className="card-header">
                  <h2>My Complaints</h2>
                </div>

                {loading ? (
                            <div className='smart-load'>
                              <div className="dots-loader">
                                <span></span><span></span><span></span>
                              </div>
                            </div>
                ) : complaints.length === 0 ? (
                  <div className="empty-state">
                    <FileText size={48} color="#9ca3af" />
                    <p>No complaints submitted yet</p>
                    <Link to="/create-complaint" className="btn btn-primary">
                      Submit Your First Complaint
                    </Link>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Title</th>
                          <th>Category</th>
                          <th>Status</th>
                          <th>Worker</th>
                          <th>Date</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {complaints.map((complaint) => (
                          <tr key={complaint.id}>
                            <td>#{complaint.id}</td>
                            <td>{complaint.title}</td>
                            <td>
                              <span className="category-badge">
                                {complaint.category}
                              </span>
                            </td>
                            <td>{getStatusBadge(complaint.status)}</td>
                            <td>{complaint.worker_name || 'Not Assigned'}</td>
                            <td>{formatDate(complaint.created_at)}</td>
                            <td>
                              <Link 
                                to={`/complaint/${complaint.id}`}
                                className="btn-link"
                              >
                                View Details
                              </Link>
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
                )}
              </div>
            </div>
          </main>
        </div>
      )}
    </>
  );
};

export default UserDashboard;
