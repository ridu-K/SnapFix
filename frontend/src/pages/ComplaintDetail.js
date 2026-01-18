import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  User, 
  FileText,
  MessageSquare,
  Send
} from 'lucide-react';
import './ComplaintDetail.css';
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";

const libraries = ["places"];

const ComplaintDetail = () => {
  
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: "AIzaSyASQdXCPccj2llmzdgZvsr-npd2_U_Tb5A",
    libraries,
  });
  
  const [marker, setMarker] = useState(null);
  
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newUpdate, setNewUpdate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComplaint();
  }, [id]);

  const fetchComplaint = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/complaints/${id}`);
      setComplaint(response.data);
      const loc = response.data.location;

      if (loc) {
        const [lat, lng] = loc.split(",").map(Number);  // Convert to numbers
        setMarker({ lat, lng });
      }
    } catch (error) {
      console.error('Error fetching complaint:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUpdate = async (e) => {
    e.preventDefault();
    if (!newUpdate.trim()) return;

    setSubmitting(true);
    try {
      await axios.put(`http://localhost:5000/api/complaints/${id}`, {
        message: newUpdate
      });
      setNewUpdate('');
      fetchComplaint();
    } catch (error) {
      console.error('Error adding update:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/complaints/${id}`, {
        status: newStatus,
        message: `Status changed to ${newStatus}`
      });
      fetchComplaint();
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
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const goBack = () => {
    if (user.role === 'admin') {
      navigate('/admin-dashboard');
    } else if (user.role === 'worker') {
      navigate('/worker-dashboard');
    } else {
      navigate('/user-dashboard');
    }
  };

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  if (!complaint) {
    return <div className="error-screen">Complaint not found</div>;
  }

  return (
    <div className="complaint-detail-page">
      <div className="container">
        <button onClick={goBack} className="btn-back">
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>

        <div className="detail-grid">
          {/* Main Content */}
          <div className="detail-main">
            <div className="card">
              <div className="detail-header">
                <div>
                  <h1>{complaint.title}</h1>
                  <div className="detail-meta">
                    <span className="category-badge">{complaint.category}</span>
                    {getStatusBadge(complaint.status)}
                  </div>
                </div>
              </div>

              {complaint.image_url && (
                <div className="detail-image">
                  <img 
                    src={`http://localhost:5000${complaint.image_url}`} 
                    alt="Complaint" 
                  />
                </div>
              )}

              <div className="detail-content">
                <h3>Description</h3>
                <p>{complaint.description}</p>
              </div>

              <div className="detail-info">
                <div className="info-item">
                  <User size={18} />
                  <div>
                    <span className="info-label">Submitted by</span>
                    <span className="info-value">{complaint.user_name}</span>
                  </div>
                </div>

                {complaint.location && (
                  <div className="info-item">
                    <MapPin size={18} />
                    <div>
                      <span className="info-label">Location</span>
                      <span className="info-value">{complaint.location}</span>
                    </div>
                  </div>
                )}

                <div className="info-item">
                  <Calendar size={18} />
                  <div>
                    <span className="info-label">Submitted on</span>
                    <span className="info-value">{formatDate(complaint.created_at)}</span>
                  </div>
                </div>

                {complaint.worker_name && (
                  <div className="info-item">
                    <User size={18} />
                    <div>
                      <span className="info-label">Assigned to</span>
                      <span className="info-value">{complaint.worker_name}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Status Actions for Admin/Worker */}
              {(user.role === 'admin' || user.role === 'worker') && (
                <div className="status-actions">
                {complaint.status == 'completed' ? (
                  <></>
                ) : (
                  <>
                    <h3>Update Status</h3>
                    <div className="status-buttons">
                      {complaint.status !== 'in_progress' && complaint.status !== 'completed' && (
                        <button
                          onClick={() => handleStatusChange('in_progress')}
                          className="btn btn-warning"
                        >
                          Mark In Progress
                        </button>
                      )}
                      {complaint.status !== 'completed' && (
                        <button
                          onClick={() => handleStatusChange('completed')}
                          className="btn btn-success"
                        >
                          Mark Completed
                        </button>
                      )}
                      {complaint.status !== 'rejected' && user.role === 'admin' && (
                        <button
                          onClick={() => handleStatusChange('rejected')}
                          className="btn btn-danger"
                        >
                          Reject
                        </button>
                      )}
                    </div>
                  </>
                )}
                </div>
              )}
              <div className="detail-content">
                <h3>View the location in Map</h3>
                <div style={{ height: 400, marginBottom: 12, display: 'flex', alignItems: 'center' }}>
                  {loadError && marker ? <div>Map load error</div> : 
                  (!isLoaded) ? <div>Loading maps...</div> : 
                  <GoogleMap
                    mapContainerStyle={{ width: "100%", height: "100%" }}
                    zoom={13}
                    center={marker}
                  >
                    {marker && <Marker position={marker} />}
                  </GoogleMap>}
                </div>
              </div>
            </div>
          </div>

          {/* Updates Sidebar */}
          <div className="detail-sidebar">
            <div className="card">
              <div className="updates-header">
                <MessageSquare size={20} />
                <h3>Updates & Activity</h3>
              </div>

              <div className="updates-list">
                {complaint.updates && complaint.updates.length > 0 ? (
                  complaint.updates.map((update) => (
                    <div key={update.id} className="update-item">
                      <div className="update-author">{update.updated_by}</div>
                      <div className="update-message">{update.message}</div>
                      <div className="update-date">{formatDate(update.created_at)}</div>
                    </div>
                  ))
                ) : (
                  <p className="no-updates">No updates yet</p>
                )}
              </div>

              {/* Add Update Form */}
              {(user.role === 'admin' || user.role === 'worker') && (
                <form onSubmit={handleAddUpdate} className="update-form">
                  <textarea
                    className="form-textarea"
                    placeholder="Add an update..."
                    value={newUpdate}
                    onChange={(e) => setNewUpdate(e.target.value)}
                    rows="3"
                  />
                  <button 
                    type="submit" 
                    className="btn btn-primary btn-block"
                    disabled={submitting || !newUpdate.trim()}
                  >
                    <Send size={16} />
                    {submitting ? 'Posting...' : 'Post Update'}
                  </button>
                </form>
              )}
            </div>

            {/* Contact Info Card */}
            <div className="card contact-card">
              <h3>Contact Information</h3>
              <div className="contact-info">
                <p><strong>Email:</strong> {complaint.user_email}</p>
                {complaint.user_phone && (
                  <p><strong>Phone:</strong> {complaint.user_phone}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetail;
