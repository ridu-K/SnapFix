import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Mail, Lock, User, Phone, UserCircle, MapPin } from 'lucide-react';
import './Auth.css';
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";

const center = { lat: 12.9715987, lng: 77.5945627 }; // Bangalore default
const libraries = ["places"];

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'user',
    latitude: '',
    longitude: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [marker, setMarker] = useState(null);
  
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: "AIzaSyASQdXCPccj2llmzdgZvsr-npd2_U_Tb5A",
    libraries,
  });

  const onMapClick = useCallback((e) => {
      setMarker({ lat: e.latLng.lat(), lng: e.latLng.lng() });
    }, []);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const result = await register({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      role: formData.role,
      latitude: marker.lat,
      longitude: marker.lng
    });

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        alert("User Registered Successfully!")
        navigate('/login');
      }, 2000);
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">
              <Shield size={40} />
            </div>
            <h1>Create Account</h1>
            <p>Join us to start reporting issues</p>
          </div>

          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          {success && (
            <div className="alert alert-success">
              Registration successful! Redirecting to login...
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">
                <User size={18} />
                Full Name
              </label>
              <input
                type="text"
                name="name"
                className="form-input"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Mail size={18} />
                Email Address
              </label>
              <input
                type="email"
                name="email"
                className="form-input"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Phone size={18} />
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                className="form-input"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <UserCircle size={18} />
                Register As
              </label>
              <select
                name="role"
                className="form-select"
                value={formData.role}
                onChange={handleChange}
                required
              >
                <option value="user">Citizen (Report Issues)</option>
                <option value="worker">Worker (Resolve Issues)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                <Lock size={18} />
                Password
              </label>
              <input
                type="password"
                name="password"
                className="form-input"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Lock size={18} />
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                className="form-input"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <MapPin size={18} />
                Enter the Base Location if Role is Worker
                (Click on map to place the incident location)
              </label>
              <div style={{ height: 400, marginBottom: 12, display: 'flex', alignItems: 'center' }}>
                {loadError ? <div>Map load error</div> :
                  (!isLoaded) ? <div style={{textAlign: 'center'}}>Loading maps...</div> :
                  <GoogleMap
                    mapContainerStyle={{ width: "100%", height: "100%" }}
                    zoom={13}
                    center={marker ? marker : center}
                    onClick={onMapClick}
                  >
                  {marker && <Marker position={marker} />}
                </GoogleMap>}
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-block"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Already have an account?{' '}
              <Link to="/login">Sign in</Link>
            </p>
            <Link to="/" className="back-link">← Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
