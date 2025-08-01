# HealthOS - Medical Information System

A modern medical information system built with React, designed for managing medical data and facilitating interaction between doctors and administrators.

## 🚀 Features

- **Landing page** with system information
- **Authentication system** (login and registration)
- **User dashboard** with specialty overview
- **Administrative panel** for user management
- **Specialized sections** for various medical specialties:
  - Cardiology
  - Neurology
  - Gastroenterology
- **Responsive design** for all devices
- **Modern UI/UX** using Tailwind CSS

## 🛠️ Technologies

- **React 18** - Main framework
- **React Router** - Routing
- **Tailwind CSS** - Styling
- **Font Awesome** - Icons
- **Context API** - State management
- **Local Storage** - User data storage

## 📦 Installation

1. **Clone the repository or navigate to the project folder:**
   ```bash
   cd helthOS9.1
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the application in development mode:**
   ```bash
   npm start
   ```

4. **Open your browser and navigate to:**
   ```
   http://localhost:3000
   ```

## 🔐 Demo Accounts

### Administrator
- **Email:** admin@healthos.ru
- **Password:** admin123

### Cardiologist
- **Email:** doctor@healthos.ru
- **Password:** doctor123

## 📁 Project Structure

```
helthOS9.1/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Admin/
│   │   │   ├── AdminPanel.js
│   │   │   └── AdminPanel.css
│   │   ├── Auth/
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   └── Auth.css
│   │   ├── Dashboard/
│   │   │   ├── Dashboard.js
│   │   │   └── Dashboard.css
│   │   ├── LandingPage/
│   │   │   ├── LandingPage.js
│   │   │   └── LandingPage.css
│   │   ├── Specialties/
│   │   │   ├── SpecialtyPage.js
│   │   │   └── SpecialtyPage.css
│   │   └── ProtectedRoute.js
│   ├── contexts/
│   │   └── AuthContext.js
│   ├── App.js
│   ├── index.js
│   └── index.css
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

## 🎯 Main Components

### AuthContext
Manages user authentication, including:
- System login
- New user registration
- System logout
- Profile updates
- Data storage in localStorage

### ProtectedRoute
Protects routes that require authentication or administrative privileges.

### LandingPage
Main page with system information and links for login/registration.

### Dashboard
User control panel with overview of available specialties and statistics.

### AdminPanel
Administrative panel for managing users and system settings.

### SpecialtyPage
Dynamic pages for various medical specialties with corresponding sections.

## 🔧 Available Scripts

- `npm start` - Start in development mode
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Extract configuration (irreversible)

## 🌐 Routes

- `/` - Landing page
- `/login` - Login page
- `/register` - Registration page
- `/dashboard` - User dashboard
- `/admin` - Administrative panel (administrators only)
- `/specialty/:specialtyName` - Specialty pages
- `/specialty/:specialtyName/:section` - Specialty sections

## 🎨 Design

The application uses modern design with:
- Gradient backgrounds
- Smooth animations
- Responsive layout
- Intuitive navigation
- Professional color scheme

## 📱 Responsiveness

The application is fully adapted for:
- Desktop computers
- Tablets
- Mobile devices

## 🔒 Security

- Protected routes
- User role verification
- Form validation
- Secure data storage

## 🚀 Deployment

For production deployment:

1. Build the application:
   ```bash
   npm run build
   ```

2. Deploy the contents of the `build` folder to a web server.

## 📞 Support

For support or bug reports, please create an issue in the project repository.

## 📄 License

This project is distributed under the MIT license.

---

**HealthOS** - Your reliable partner in medical information management! 🏥💙