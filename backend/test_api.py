import requests
import json

# Test API endpoints
BASE_URL = 'http://localhost:5000/api'

def test_health():
    """Test if the API is running"""
    try:
        response = requests.get(f'{BASE_URL}/health')
        print(f"✓ Health Check: {response.json()}")
        return True
    except Exception as e:
        print(f"✗ Health Check Failed: {e}")
        return False

def test_login():
    """Test login and get token"""
    try:
        response = requests.post(f'{BASE_URL}/login', json={
            'email': 'admin@complaint.com',
            'password': 'admin123'
        })
        if response.status_code == 200:
            data = response.json()
            token = data['access_token']
            print(f"✓ Login Successful: {data['user']['name']}")
            return token
        else:
            print(f"✗ Login Failed: {response.json()}")
            return None
    except Exception as e:
        print(f"✗ Login Error: {e}")
        return None

def test_create_complaint(token):
    """Test creating a complaint"""
    try:
        headers = {'Authorization': f'Bearer {token}'}
        data = {
            'title': 'Test Complaint',
            'description': 'This is a test complaint',
            'category': 'water',
            'location': 'Test Location'
        }
        
        response = requests.post(f'{BASE_URL}/complaints', data=data, headers=headers)
        
        if response.status_code == 201:
            print(f"✓ Complaint Created: {response.json()}")
            return True
        else:
            print(f"✗ Complaint Creation Failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"✗ Complaint Creation Error: {e}")
        return False

def test_get_complaints(token):
    """Test getting complaints"""
    try:
        headers = {'Authorization': f'Bearer {token}'}
        response = requests.get(f'{BASE_URL}/complaints', headers=headers)
        
        if response.status_code == 200:
            complaints = response.json()
            print(f"✓ Got {len(complaints)} complaints")
            return True
        else:
            print(f"✗ Get Complaints Failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"✗ Get Complaints Error: {e}")
        return False

if __name__ == '__main__':
    print("="*50)
    print("Testing Complaint Bridge API")
    print("="*50)
    
    # Test health
    if not test_health():
        print("\n⚠ Backend is not running. Start it with: python app.py")
        exit(1)
    
    print()
    
    # Test login
    token = test_login()
    if not token:
        print("\n⚠ Login failed. Check if admin user exists.")
        exit(1)
    
    print()
    
    # Test create complaint
    test_create_complaint(token)
    
    print()
    
    # Test get complaints
    test_get_complaints(token)
    
    print("\n" + "="*50)
    print("Testing Complete!")
    print("="*50)
