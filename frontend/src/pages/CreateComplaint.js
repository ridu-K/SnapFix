import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Upload, MapPin } from 'lucide-react';
import './CreateComplaint.css';
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";

const center = { lat: 12.9715987, lng: 77.5945627 }; // Bangalore default
const libraries = ["places"];

const CreateComplaint = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    image_severity_score: 0
  });
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: "AIzaSyASQdXCPccj2llmzdgZvsr-npd2_U_Tb5A",
    libraries,
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [marker, setMarker] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [manAuto, setManAuto] = useState(false);
  const [smartLoad, setSmartLoad] = useState(false);

  const onMapClick = useCallback((e) => {
    setMarker({ lat: e.latLng.lat(), lng: e.latLng.lng() });
  }, []);

  const categories = [
    { value: 'accident', label: 'Road Accident' },
    { value: 'water', label: 'Water Leakage' },
    { value: 'tree', label: 'Tree/Pole Damage' },
    { value: 'electrical', label: 'Electrical Issues' },
    { value: 'infrastructure', label: 'Infrastructure Damage' }
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAutoFill = async () => {
    setSmartLoad(true);
    const formDat = new FormData();
    formDat.append("image", image);
    const res = await axios.post("http://localhost:5000/api/autofill",  formDat, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    const data = await res.data;
    if(data.title && data.description && data.category && data.image_severity_score)
    {
      setFormData({
        title: data.title,
        description: data.description,
        category: data.category,
        image_severity_score: data.image_severity_score
      })
      setManAuto(false);
      setSmartLoad(false);
  }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      if(marker)  formDataToSend.append('location', marker.lat + ", " + marker.lng);
      formDataToSend.append('image_severity_score', formData.image_severity_score);
      
      if (image) {
        formDataToSend.append('image', image);
      }

      console.log('Submitting complaint:', {
        title: formData.title,
        category: formData.category,
        hasImage: !!image
      });

      const response = await axios.post('http://localhost:5000/api/complaints', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('Complaint submitted successfully:', response.data);
      const formDataToSendMail = new FormData();
      formDataToSendMail.append("email", "jerinpisac@gmail.com")
      formDataToSendMail.append("subject", "New Complaint")
      formDataToSendMail.append("body", 
        `
          <div style="font-family: Arial; line-height: 1.6;">
              <h2 style="color:#0b5ed7;">New Complaint Received</h2>

              <p style="text-align:justify;">
                  <strong>Title:</strong> ${formData.title}<br><br>

                  <strong>Description:</strong><br>
                  ${formData.description}<br><br>

                  <strong>Category:</strong> ${categories.find(c => c.value === formData.category)?.label}<br><br>
                  <strong>Location:</strong> ${marker.lat + ", " + marker.lng}

              </p>
          </div>
        `)

      const response2 = await axios.post('http://localhost:5000/send-mail', formDataToSendMail, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('Email sent successfully:', response2.data);

      setMarker(null);
      navigate('/user-dashboard');
    } catch (error) {
      console.error('Error submitting complaint:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to submit complaint';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    {smartLoad ? (
      <div className='smart-load'>
        <div className="dots-loader">
          <span></span><span></span><span></span>
        </div>
      </div>
    ) : (
      <div className="create-complaint-page">
      <div className="container">
        <div className="page-header">
          <button onClick={() => navigate('/user-dashboard')} className="btn-back">
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
          <h1>Submit New Complaint</h1>
          <p>Report an issue in your area and track its resolution</p>
        </div>

        <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
          <button onClick={() => setManAuto(false)} className='btn1'>Manual Entry</button>
          <div style={{ borderLeft: '1.5px solid lightgray', height: '30px' }}></div>
          <button onClick={() => setManAuto(true)} className='btn2'>AI Auto Fill</button>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <div className="complaint-form-card">
          <form onSubmit={handleSubmit}>
            {manAuto == false ? (
              <>
                <div className="form-group">
                  <label className="form-label">Complaint Title <span style={{ color: 'red' }}>*</span></label>
                  <input
                    type="text"
                    name="title"
                    className="form-input"
                    placeholder="Brief description of the issue"
                    value={formData.title}
                    onChange={handleChange}
                    required />
                </div>
                <div className="form-group">
                    <label className="form-label">Category <span style={{ color: 'red' }}>*</span></label>
                    <select
                      name="category"
                      className="form-select"
                      value={formData.category}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select a category</option>
                      {categories.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Detailed Description <span style={{ color: 'red' }}>*</span></label>
                  <textarea
                    name="description"
                    className="form-textarea"
                    placeholder="Provide detailed information about the issue..."
                    value={formData.description}
                    onChange={handleChange}
                    rows="6"
                    required />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    <MapPin size={18} />
                    Location <span style={{ color: 'red' }}>*</span>
                    (Click on map to place the incident location)
                  </label>
                  <div style={{ height: 400, marginBottom: 12, display: 'flex', alignItems: 'center' }}>
                    {loadError ? <div>Map load error</div> :
                      (!isLoaded) ? <div>Loading maps...</div> :
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
                <div className="form-group">
                  <label className="form-label">
                    <Upload size={18} />
                    Upload Image <span style={{ color: 'red' }}>*</span>
                  </label>
                  <div className="image-upload">
                    <input
                      type="file"
                      id="image"
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{ display: 'none' }}
                      required />
                    <label htmlFor="image" className="upload-label">
                      {imagePreview ? (
                        <div className="image-preview">
                          <img src={imagePreview} alt="Preview" />
                        </div>
                      ) : (
                        <div className="upload-placeholder">
                          <Upload size={32} />
                          <p>Click to upload image</p>
                          <span>PNG, JPG up to 16MB</span>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
                <div className="form-actions">
                  <button
                    type="button"
                    onClick={() => navigate('/user-dashboard')}
                    className="btn btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                    onClick={handleSubmit}
                  >
                    {loading ? 'Submitting...' : 'Submit Complaint'}
                  </button>
                </div>
                </>
                ) : (
                  <>
                    <div className="form-group">
                      <label className="form-label">
                        <Upload size={18} />
                        Upload Image <span style={{ color: 'red' }}>*</span>
                      </label>
                      <div className="image-upload">
                        <input
                          type="file"
                          id="image"
                          accept="image/*"
                          onChange={handleImageChange}
                          style={{ display: 'none' }}
                          required />
                        <label htmlFor="image" className="upload-label">
                          {imagePreview ? (
                            <div className="image-preview">
                              <img src={imagePreview} alt="Preview" />
                            </div>
                          ) : (
                            <div className="upload-placeholder">
                              <Upload size={32} />
                              <p>Click to upload image</p>
                              <span>PNG, JPG up to 16MB</span>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleAutoFill}
                    >
                      Upload
                    </button>
                  </>
                )}
          </form>
        </div>
      </div>
    </div>
    )}
    </>
    
  );
};

export default CreateComplaint;
