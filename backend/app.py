from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, get_jwt
from datetime import datetime, timedelta
import os
from sqlalchemy import case
from werkzeug.utils import secure_filename
import google.generativeai as genai
from flask_mail import Mail, Message
import joblib
from scipy.sparse import hstack, csr_matrix
import numpy as np
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv("DB")
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv("SECRET_KEY")
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=1)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = os.getenv("GMAIL")   # Replace
app.config['MAIL_PASSWORD'] = os.getenv("APP_PASS")      # Replace (App Password)
app.config['MAIL_DEFAULT_SENDER'] = os.getenv("GMAIL")

# from google.generativeai import list_models
# print(list(list_models()))

CORS(app,
     resources={r"/*": {"origins": "http://localhost:3000"}},
     supports_credentials=True,
     allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

# Initialize extensions
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)
mail = Mail(app)

genai.configure(api_key=os.getenv("API_KEY"))
model = genai.GenerativeModel("models/gemini-2.5-flash")

# Create upload folder if it doesn't exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Models
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(20))
    password = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), default='user')  # user, admin, worker
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    workload = db.Column(db.String(255), default='Free')
    latitude = db.Column(db.String(255))
    longitude = db.Column(db.String(255))
    active_tasks = db.Column(db.Integer)
    complaints = db.relationship('Complaint', backref='user', lazy=True, foreign_keys='Complaint.user_id')

class Complaint(db.Model):
    __tablename__ = 'complaints'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(50), nullable=False)  # accident, water, tree, infrastructure, electrical
    status = db.Column(db.String(20), default='pending')  # pending, assigned, in_progress, completed, rejected
    priority = db.Column(db.String(20), default='low')  # low, medium, high
    location = db.Column(db.String(255))
    image_url = db.Column(db.String(255))
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    worker_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    worker = db.relationship('User', foreign_keys=[worker_id])
    updates = db.relationship('ComplaintUpdate', backref='complaint', lazy=True, cascade='all, delete-orphan')

class ComplaintUpdate(db.Model):
    __tablename__ = 'complaint_updates'
    id = db.Column(db.Integer, primary_key=True)
    complaint_id = db.Column(db.Integer, db.ForeignKey('complaints.id'), nullable=False)
    message = db.Column(db.Text, nullable=False)
    updated_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    user = db.relationship('User', foreign_keys=[updated_by])

# JWT configuration for additional claims
@jwt.additional_claims_loader
def add_claims_to_access_token(identity):
    user = User.query.get(identity)
    if user:
        return {
            'role': user.role,
            'email': user.email,
            'name': user.name
        }
    return {}

# Routes

@app.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.json
        
        # Check if user exists
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'message': 'Email already registered'}), 400
        
        # Hash password
        hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
        
        # Create new user
        new_user = User(
            name=data['name'],
            email=data['email'],
            phone=data.get('phone', ''),
            password=hashed_password,
            role=data.get('role', 'user'),
            latitude=data['latitude'],
            longitude=data['longitude']
        )
        
        db.session.add(new_user)
        db.session.commit()
        
        return jsonify({'message': 'User registered successfully'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.json
        user = User.query.filter_by(email=data['email']).first()
        
        if user and bcrypt.check_password_hash(user.password, data['password']):
            # Use user ID as identity (as string for JWT compatibility), additional claims added automatically
            access_token = create_access_token(identity=str(user.id))
            
            return jsonify({
                'access_token': access_token,
                'user': {
                    'id': user.id,
                    'name': user.name,
                    'email': user.email,
                    'role': user.role
                }
            }), 200
        
        return jsonify({'message': 'Invalid credentials'}), 401
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/autofill', methods=['POST'])
@jwt_required()
def autofill():
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image uploaded'}), 400

        image = request.files['image']
        img_bytes = image.read()
        mime = image.content_type

        prompt = """
        Respond ONLY with a valid JSON object.

        Extract from the image:
          - Title (5–8 words)
          - Description (1–2 or more sentences depending on the severity of the incident)
          - Image Severity Score (0-1, where accidents and infrastructure damage will get a high score while other incidents will receive low score) 
          - Category:
            1. Road Accident (return as 'accident')
            2. Water Leakage (return as 'water')
            3. Tree/Pole Damage (return as 'tree')
            4. Electrical Issues (return as 'electrical')
            5. Infrastructure Damage (return as 'infrastructure')

            If the image falls under that category, return the word given in the corresponding parenthesis 
  ];

        Return exactly:
        {
          "title": "",
          "description": "",
          "category": "",
          "image_severity_score": 0.00
        }
        """

        response = model.generate_content([
            prompt,
            {"mime_type": mime, "data": img_bytes}
        ])

        print("\n🔵 RAW GEMINI RESPONSE:\n", response)

        # Sometimes Gemini returns list of candidates
        try:
            text_output = response.text
        except:
            text_output = response.candidates[0].content.parts[0].text

        print("\n🟡 GEMINI TEXT OUTPUT:\n", text_output)

        import json
        if text_output.startswith("```json"):
            text_output = text_output.replace("```json", "").replace("```", "").strip()
        output = json.loads(text_output)
        return jsonify(output)

    except Exception as e:
        print("\n🔴 SERVER ERROR:\n", str(e))
        return jsonify({"error": str(e)}), 500

@app.route('/send-mail', methods=['POST'])
@jwt_required()
def send_mail():
    email = request.form.get('email')
    subject = request.form.get('subject')
    body = request.form.get('body')

    try:
        msg = Message(
            subject=subject,
            recipients=[email],   # List of recipients
            html=body
        )
        mail.send(msg)
        return jsonify({"message": "Email sent successfully"})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/allcomplaints', methods=['GET'])
@jwt_required()
def get_allcomplaints():
    try:
        user_id = get_jwt_identity()
        claims = get_jwt()

        if claims.get('role') == 'worker':
            query = Complaint.query.filter_by(worker_id=user_id)
        else:
            query = Complaint.query.filter_by(user_id=user_id)

        # Apply pagination
        complaints = query.order_by(Complaint.created_at.desc())

        result = []
        for complaint in complaints:
            result.append({
                'id': complaint.id,
                'title': complaint.title,
                'description': complaint.description,
                'category': complaint.category,
                'status': complaint.status,
                'priority': complaint.priority,
                'location': complaint.location,
                'image_url': complaint.image_url,
                'user_name': complaint.user.name,
                'worker_name': complaint.worker.name if complaint.worker else None,
                'created_at': complaint.created_at.isoformat(),
                'updated_at': complaint.updated_at.isoformat()
            })

        # Response with pagination metadata
        return jsonify({
            'data': result,
        }), 200

    except Exception as e:
        return jsonify({'message': str(e)}), 500


import math

def haversine(lat1, lon1, lat2, lon2):
    R = 6371  # Earth radius in km
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)

    a = math.sin(dphi/2)**2 + \
        math.cos(phi1)*math.cos(phi2)*math.sin(dlambda/2)**2
    return 2 * R * math.atan2(math.sqrt(a), math.sqrt(1-a))

def compute_score(worker, complaint):
    lat, lon = map(float, complaint.location.split(", "))
    distance = haversine(
        float(worker.latitude), float(worker.longitude),
        lat, lon
    )

    workload = 1

    if worker.workload == "Free":
        workload = 0

    score = (
        0.6 * distance +
        0.3 * worker.active_tasks +
        0.1 * workload
    )
    return score


@app.route('/api/complaints', methods=['GET'])
@jwt_required()
def get_complaints():
    try:
        user_id = get_jwt_identity()
        claims = get_jwt()

        # Pagination parameters
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 5, type=int)

        # Choose query based on role
        if claims.get('role') == 'admin':
            priority_order = case(
                (Complaint.priority == "Critical", 1),
                (Complaint.priority == "High", 2),
                (Complaint.priority == "Medium", 3),
                (Complaint.priority == "Low", 4),
                else_=5
            )

            status_order = case(
                (Complaint.status == "pending", 1),
                (Complaint.status == "assigned", 2),
                (Complaint.status == "completed", 3),
                else_=4
            )
            query = (
                Complaint.query
                .order_by(
                    status_order,          # pending → assigned → completed
                    priority_order,        # Critical → Low
                    Complaint.created_at.desc()
                )
            )
        elif claims.get('role') == 'worker':
            query = Complaint.query.filter_by(worker_id=user_id).order_by(Complaint.created_at.desc())
        else:
            query = Complaint.query.filter_by(user_id=user_id).order_by(Complaint.created_at.desc())
        

        # Apply pagination
        pagination = query.paginate(
            page=page,
            per_page=limit,
            error_out=False
        )

        complaints = pagination.items

        result = []
        for complaint in complaints:
            best_worker = None
            best_score = float('inf')
            if claims.get('role') == 'admin':
                workers = User.query.filter_by(role='worker')

                for worker in workers:
                    score = compute_score(worker, complaint)
                    if score < best_score:
                        best_score = score
                        best_worker = worker
                
                result.append({
                    'id': complaint.id,
                    'title': complaint.title,
                    'description': complaint.description,
                    'category': complaint.category,
                    'status': complaint.status,
                    'priority': complaint.priority,
                    'location': complaint.location,
                    'image_url': complaint.image_url,
                    'user_name': complaint.user.name,
                    'worker_name': complaint.worker.name if complaint.worker else None,
                    'created_at': complaint.created_at.isoformat(),
                    'updated_at': complaint.updated_at.isoformat(),
                    'worker': best_worker.name if best_worker else None,
                    'worker_id': best_worker.id if best_worker else None,
                    'score': round(best_score, 2) if best_score else None
                })
            else:
                result.append({
                    'id': complaint.id,
                    'title': complaint.title,
                    'description': complaint.description,
                    'category': complaint.category,
                    'status': complaint.status,
                    'priority': complaint.priority,
                    'location': complaint.location,
                    'image_url': complaint.image_url,
                    'user_name': complaint.user.name,
                    'worker_name': complaint.worker.name if complaint.worker else None,
                    'created_at': complaint.created_at.isoformat(),
                    'updated_at': complaint.updated_at.isoformat(),
                })

        # Response with pagination metadata
        return jsonify({
            'data': result,
            'page': page,
            'limit': limit,
            'total_items': pagination.total,
            'total_pages': pagination.pages
        }), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

tfidf_vectorizer = joblib.load("tfidf_vectorizer.pkl")
priority_model = joblib.load("priority_model.pkl")
category_encoder = joblib.load("category_encoder.pkl")

def build_feature_vector(category, description, image_severity, created_at):
    # Encode category
    try:
        category_encoded = category_encoder.transform([category])[0]
    except:
        category_encoded = -1

    # TF-IDF
    text_vec = tfidf_vectorizer.transform([description])

    # Time features
    hour = created_at.hour
    is_night = 1 if hour >= 21 or hour <= 6 else 0

    numeric = np.array([[category_encoded, image_severity, hour, is_night]])
    numeric_sparse = csr_matrix(numeric)

    return hstack([text_vec, numeric_sparse])


@app.route('/api/complaints', methods=['POST'])
@jwt_required()
def create_complaint():
    try:
        user_id = get_jwt_identity()
        claims = get_jwt()
        print(f"Creating complaint for user: {user_id} ({claims.get('name')})")
        
        # Handle file upload
        image_url = None
        if 'image' in request.files:
            file = request.files['image']
            if file and file.filename:
                filename = secure_filename(f"{datetime.now().timestamp()}_{file.filename}")
                filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                file.save(filepath)
                image_url = f"/uploads/{filename}"
                print(f"Image saved: {filepath}")
        
        # Get form data
        title = request.form.get('title')
        description = request.form.get('description')
        category = request.form.get('category')
        location = request.form.get('location', '')
        image_severity_score = request.form.get('image_severity_score')
        
        print(f"Complaint data - Title: {title}, Category: {category}")
        
        if not title or not description or not category:
            return jsonify({'message': 'Title, description, and category are required'}), 400

        print(image_severity_score)

        created_at = datetime.now()

        X_priority = build_feature_vector(
            category=category,
            description=description,
            image_severity=float(image_severity_score or 0),
            created_at=created_at
        )

        priority = priority_model.predict(X_priority)[0]
        confidence = max(priority_model.predict_proba(X_priority)[0])
        
        print(priority)
        print(confidence)

        if priority == "P1":
            priority = "Critical"
        elif priority == "P2":
            priority = "High"
        elif priority == "P3":
            priority = "Medium"
        elif priority == "P4":
            priority = "Low"

        new_complaint = Complaint(
            title=title,
            description=description,
            category=category,
            location=location,
            image_url=image_url,
            user_id=user_id,
            priority=priority
        )
        
        db.session.add(new_complaint)
        db.session.commit()
        
        print(f"Complaint created successfully with ID: {new_complaint.id}")
        return jsonify({'message': 'Complaint submitted successfully', 'id': new_complaint.id}), 201
    except Exception as e:
        db.session.rollback()
        print(f"Error creating complaint: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'message': str(e)}), 500

@app.route('/api/complaints/<int:complaint_id>', methods=['GET'])
@jwt_required()
def get_complaint(complaint_id):
    try:
        complaint = Complaint.query.get_or_404(complaint_id)
        
        updates = []
        for update in complaint.updates:
            updates.append({
                'id': update.id,
                'message': update.message,
                'updated_by': update.user.name,
                'created_at': update.created_at.isoformat()
            })
        
        return jsonify({
            'id': complaint.id,
            'title': complaint.title,
            'description': complaint.description,
            'category': complaint.category,
            'status': complaint.status,
            'priority': complaint.priority,
            'location': complaint.location,
            'image_url': complaint.image_url,
            'user_name': complaint.user.name,
            'user_email': complaint.user.email,
            'user_phone': complaint.user.phone,
            'worker_name': complaint.worker.name if complaint.worker else None,
            'created_at': complaint.created_at.isoformat(),
            'updated_at': complaint.updated_at.isoformat(),
            'updates': updates
        }), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/complaints/<int:complaint_id>', methods=['PUT'])
@jwt_required()
def update_complaint(complaint_id):
    try:
        user_id = get_jwt_identity()
        claims = get_jwt()
        complaint = Complaint.query.get_or_404(complaint_id)
        data = request.json
        
        # Only admin and assigned worker can update
        if claims.get('role') not in ['admin', 'worker']:
            return jsonify({'message': 'Unauthorized'}), 403
        
        if 'status' in data:
            complaint.status = data['status']
            worker = User.query.filter_by(id=complaint.worker_id).first()
            print(worker.name)
            
            if worker:
                if data['status'] == "in_progress":
                    worker.active_tasks += 1
                    worker.workload = "Busy"     
                elif data['status'] == "completed":
                    worker.active_tasks -= 1
                    if worker.active_tasks == 0:
                        worker.workload = "Free"     
                db.session.commit()
        if 'priority' in data and claims.get('role') == 'admin':
            complaint.priority = data['priority']
        if 'worker_id' in data and claims.get('role') == 'admin':
            complaint.worker_id = data['worker_id']
            complaint.status = 'assigned'
        
        complaint.updated_at = datetime.utcnow()
        
        # Add update log
        if 'message' in data:
            update = ComplaintUpdate(
                complaint_id=complaint_id,
                message=data['message'],
                updated_by=user_id
            )
            db.session.add(update)
        
        db.session.commit()
        
        return jsonify({'message': 'Complaint updated successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500

@app.route('/api/complaints/<int:complaint_id>', methods=['DELETE'])
@jwt_required()
def delete_complaint(complaint_id):
    try:
        claims = get_jwt()
        
        if claims.get('role') != 'admin':
            return jsonify({'message': 'Unauthorized'}), 403
        
        complaint = Complaint.query.get_or_404(complaint_id)
        db.session.delete(complaint)
        db.session.commit()
        
        return jsonify({'message': 'Complaint deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500

@app.route('/api/worker/<int:worker_id>', methods=["GET"])
@jwt_required()
def get_worker_mail(worker_id):
    try:
        claims = get_jwt()

        if claims.get('role') != 'admin':
            return jsonify({'message': 'Unauthorized'}), 403
        
        worker = User.query.filter_by(role='worker', id=worker_id).first()

        if not worker:
            return jsonify({'message': 'Worker not found'}), 404

        worker_data = {
            'id': worker.id,
            'name': worker.name,
            'email': worker.email,
            'role': worker.role
        }

        return jsonify(worker_data), 200
    
    except Exception as e:
        return jsonify({'message': str(e)}), 500


@app.route('/api/workers', methods=['GET'])
@jwt_required()
def get_workers():
    try:
        claims = get_jwt()
        
        if claims.get('role') != 'admin':
            return jsonify({'message': 'Unauthorized'}), 403
        
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 5, type=int)

        query = User.query.filter_by(role='worker')

        pagination = query.order_by(User.workload.desc()).paginate(
            page=page,
            per_page=limit,
            error_out=False
        )

        workers = pagination.items
        
        result = []
        for worker in workers:
            assigned_complaints = Complaint.query.filter_by(worker_id=worker.id).count()
            result.append({
                'id': worker.id,
                'name': worker.name,
                'email': worker.email,
                'phone': worker.phone,
                'assigned_complaints': assigned_complaints,
                'workload': worker.workload
            })
        
        return jsonify({
            'data': result,
            'page': page,
            'limit': limit,
            'total_items': pagination.total,
            'total_pages': pagination.pages
        }), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/analytics', methods=['GET'])
@jwt_required()
def get_analytics():
    try:
        claims = get_jwt()
        
        if claims.get('role') != 'admin':
            return jsonify({'message': 'Unauthorized'}), 403
        
        # Total counts
        total_complaints = Complaint.query.count()
        total_users = User.query.filter_by(role='user').count()
        total_workers = User.query.filter_by(role='worker').count()
        
        # Status breakdown
        pending = Complaint.query.filter_by(status='pending').count()
        assigned = Complaint.query.filter_by(status='assigned').count()
        in_progress = Complaint.query.filter_by(status='in_progress').count()
        completed = Complaint.query.filter_by(status='completed').count()
        rejected = Complaint.query.filter_by(status='rejected').count()
        
        # Category breakdown
        categories = db.session.query(
            Complaint.category, 
            db.func.count(Complaint.id)
        ).group_by(Complaint.category).all()
        
        category_data = {cat: count for cat, count in categories}
        
        # Priority breakdown
        priorities = db.session.query(
            Complaint.priority,
            db.func.count(Complaint.id)
        ).group_by(Complaint.priority).all()
        
        priority_data = {pri: count for pri, count in priorities}
        
        # Recent complaints
        recent_complaints = Complaint.query.order_by(
            Complaint.created_at.desc()
        ).limit(5).all()
        
        recent_list = []
        for complaint in recent_complaints:
            recent_list.append({
                'id': complaint.id,
                'title': complaint.title,
                'category': complaint.category,
                'status': complaint.status,
                'created_at': complaint.created_at.isoformat()
            })
        
        return jsonify({
            'total_complaints': total_complaints,
            'total_users': total_users,
            'total_workers': total_workers,
            'status_breakdown': {
                'pending': pending,
                'assigned': assigned,
                'in_progress': in_progress,
                'completed': completed,
                'rejected': rejected
            },
            'category_breakdown': category_data,
            'priority_breakdown': priority_data,
            'recent_complaints': recent_list
        }), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/users', methods=['GET'])
@jwt_required()
def get_users():
    try:
        claims = get_jwt()
        
        if claims.get('role') != 'admin':
            return jsonify({'message': 'Unauthorized'}), 403
        
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 5, type=int)

        query = User.query.filter(User.role.in_(['user', 'worker']))
        
        pagination = query.order_by(User.workload.desc()).paginate(
            page=page,
            per_page=limit,
            error_out=False
        )

        users = pagination.items

        result = []
        for user in users:
            result.append({
                'id': user.id,
                'name': user.name,
                'email': user.email,
                'phone': user.phone,
                'role': user.role,
                'created_at': user.created_at.isoformat()
            })
        
        return jsonify({
            'data': result,
            'page': page,
            'limit': limit,
            'total_items': pagination.total,
            'total_pages': pagination.pages
        }), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

# Serve uploaded files
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    from flask import send_from_directory
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy'}), 200

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        # Create default admin if not exists
        admin = User.query.filter_by(email='admin@complaint.com').first()
        if not admin:
            hashed_password = bcrypt.generate_password_hash('admin123').decode('utf-8')
            admin = User(
                name='Admin',
                email='admin@complaint.com',
                password=hashed_password,
                role='admin'
            )
            db.session.add(admin)
            db.session.commit()
            print("Default admin created: admin@complaint.com / admin123")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
