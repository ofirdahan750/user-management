# User Management Application

Full-stack application for user registration, authentication, and profile management.

## 🔗 Live Demo

| Component | URL |
|-----------|-----|
| **Frontend** | [ofir-user-management.netlify.app](https://ofir-user-management.netlify.app/) |
| **Backend API Health** | [API Health Check](https://cheerful-rois-organizationnametwo-fc78dba0.koyeb.app/api/health) |

## 📁 Project Structure

```
user-management/
├── user-management-client/   # Angular 21 frontend
├── user-management-backend/  # Node.js + Express API
├── netlify.toml             # Netlify deployment config
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18.x or higher
- **npm** v9.x or higher

### Backend

```bash
cd user-management-backend
npm install
cp .env.example .env
# Edit .env with JWT secrets
npm start
```

See [user-management-backend/README.md](user-management-backend/README.md) for details.

### Frontend

```bash
cd user-management-client
npm install
npm start
```

Navigate to `http://localhost:4200`. See [user-management-client/README.md](user-management-client/README.md) for details.

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | Angular 21, Angular Material, NgRx, TypeScript, RxJS |
| **Backend** | Node.js, Express, JWT |
| **Deploy** | Netlify (frontend), Koyeb (backend) |

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.
