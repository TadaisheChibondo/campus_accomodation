🎓 CampusAcc
The official off campus Student Accommodation platform in Zimbabwe

CampusAcc is a full-stack real estate marketplace engineered to solve the student housing crisis, specifically designed for the National University of Science and Technology (NUST) community and surrounding Bulawayo areas. The platform connects students with safe, verified, and affordable accommodation while providing landlords with a streamlined dashboard to manage their properties without middleman fees.

🚀 Live Demo
View the Live Application
https://studenthousing.co.zw

✨ Key Features
🔍 For Students (Tenants)
Smart Search: Filter boarding houses and cottages by price, location, and specific amenities (e.g., Solar backup, Wi-Fi, Borehole water).

NUST Distance Calculator: View exact property locations on an interactive map relative to the university campus.

Live Availability Tracking: Real-time "Taken" or "Available" status tags to prevent inquiries on occupied rooms.

Verified Reviews: Read honest feedback from previous student tenants regarding security, noise, and landlord responsiveness.

🏠 For Landlords (Hosts)
Property Management Dashboard: Create, edit, and update property listings instantly.

Cloud Image Hosting: Seamlessly upload high-resolution property photos utilizing Cloudinary integration.

Direct Connection: Receive inquiries directly from interested students.

🛠️ Technical Architecture
The application is built as a decoupled Monorepo, separating the client interface from the API server.

Frontend (Client)
Framework: React.js (Vite)

Styling: Modern CSS3 (Grid/Flexbox), Responsive Mobile-First UI

State Management: React Hooks

Routing: React Router v6

Maps: Leaflet API integration

Deployment: Vercel

Backend (Server)
Framework: Django & Django REST Framework (DRF)

Database: PostgreSQL

Authentication: JWT (JSON Web Tokens) via djangorestframework-simplejwt

Media Storage: Cloudinary

Security: Strict CORS policies, CSRF protection

Deployment: Render (Gunicorn Server)

⚙️ Local Installation & Setup
Follow these steps to run the development environment locally.

Prerequisites
Node.js & npm

Python 3.10+

PostgreSQL

1. Clone the Repository

```
    git clone https://github.com/yourusername/campusacc.git
    cd campusacc
```

2. Backend Environment Setup

```
    cd backend
    python -m venv venv
    # Activate virtual environment
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    # Install dependencies
    pip install -r requirements.txt

    # Database & Migrations
    python manage.py makemigrations
    python manage.py migrate

    # Start the server
    python manage.py runserver
```

3. Frontend Environment Setup
   Bash
   cd ../frontend
   npm install

# Start the Vite development server

npm run dev
The application will be accessible at http://localhost:5173.

📝 License
This project is licensed under the MIT License - see the LICENSE file for details.
