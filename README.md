# AI-Powered Student Management System (SMS)

A sophisticated, AI-driven Student Management System that combines traditional wallet/financial management with advanced machine learning capabilities for student data analysis, prediction, and intelligent insights. The system leverages modern cloud architecture with microservices design patterns, containerization, and real-time processing.

---

## 📋 Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Components](#components)
- [Installation & Setup](#installation--setup)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Features](#features)
- [Deployment](#deployment)
- [Development](#development)
- [Contributing](#contributing)

---

## Overview

### Purpose

The AI-Powered SMS is an enterprise-grade student management system designed to:

1. **Wallet & Financial Management**: Handle student financial accounts, transactions, and billing
2. **AI-Powered Analytics**: Utilize machine learning for student performance prediction and analysis
3. **Natural Language Processing**: Process and understand student-related documents and communications
4. **Real-time Monitoring**: Track student metrics with automated alerts and insights
5. **Data-Driven Decisions**: Generate actionable reports and recommendations

### Key Capabilities

- 🎓 Complete student lifecycle management
- 💰 Integrated wallet/financial system
- 🤖 ML-based performance predictions
- 📊 Advanced analytics and reporting
- 🔐 Role-based access control (RBAC)
- 📱 RESTful API with comprehensive documentation
- 🐳 Docker & Kubernetes ready
- ⚡ Real-time data processing with Celery

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      Frontend (React + Vite)                     │
│              - Student Dashboard                                 │
│              - Financial Management UI                           │
│              - Analytics & Reports                               │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              API Gateway & Authentication                        │
│         (Express.js Backend - Port 5000)                        │
└────────────────┬─────────────────────────────────┬──────────────┘
                 │                                 │
        ┌────────▼─────────┐          ┌────────────▼──────────┐
        │                  │          │                       │
        ▼                  ▼          ▼                       ▼
   ┌─────────┐      ┌─────────┐  ┌─────────┐           ┌──────────┐
   │Wallet   │      │Academic │  │Reports  │           │AI Backend│
   │Services │      │Services │  │Services │           │(Python)  │
   └─────────┘      └─────────┘  └─────────┘           └──────────┘
        │                │           │                       │
        └────────┬───────┴───────────┴───────────────────────┘
                 │
        ┌────────▼─────────────────┐
        │                          │
        ▼                          ▼
   ┌──────────┐            ┌─────────────────┐
   │PostgreSQL│            │Redis Cache      │
   │(Neon)    │            │Message Broker   │
   └──────────┘            └────────┬────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
                    ▼               ▼               ▼
              ┌─────────┐   ┌──────────┐    ┌────────────┐
              │Celery   │   │Celery    │    │LLM Model   │
              │Worker   │   │Beat      │    │(Ollama)    │
              └─────────┘   └──────────┘    └────────────┘
```

### Microservices Overview

The system is built around a microservices architecture with clear separation of concerns:

#### 1. **Backend API Service** (Node.js/Express)
- **Port**: 5000
- **Purpose**: REST API for all frontend and third-party integrations
- **Responsibilities**:
  - User authentication and authorization
  - Student data CRUD operations
  - Wallet/financial transaction management
  - Academic term and year management
  - Report generation
  - File upload handling
  - Webhook integration

#### 2. **AI Backend Service** (Python/FastAPI)
- **Port**: 8000
- **Purpose**: Machine learning and intelligent data processing
- **Responsibilities**:
  - ML model training and inference
  - Predictive analytics
  - Natural language processing
  - Data drift detection
  - Batch processing with Celery
  - Vector embeddings and similarity search

#### 3. **Support Services**
- **PostgreSQL (Neon)**: Primary database
- **Redis**: Cache, message broker, session store
- **Celery**: Asynchronous task queue
- **Ollama**: Local LLM inference
- **ChromaDB**: Vector database for embeddings

---

## Technology Stack

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite
- **UI Libraries**: 
  - Material-UI (MUI) 7.3
  - DaisyUI 5.5
  - Tailwind CSS 4
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Data Visualization**: 
  - Chart.js & react-chartjs-2
  - Recharts
  - Nivo Charts
- **Utilities**: 
  - React Router v7
  - date-fns
  - xlsx (Excel handling)
  - HTML2Canvas & jsPDF (PDF export)
- **Development**: ESLint

### Backend API
- **Runtime**: Node.js
- **Framework**: Express 5.1
- **Database ORM**: SQL (PostgreSQL via pg driver)
- **Authentication**: 
  - JWT (jsonwebtoken 9.0)
  - bcryptjs (password hashing)
- **File Upload**: Multer
- **PDF Generation**: PDFKit
- **Data Export**: xlsx
- **Middleware**: 
  - CORS
  - Morgan (logging)
  - Body Parser
  - Cookie Parser
  - Express Session
- **Utilities**: UUID generation

### AI Backend
- **Framework**: FastAPI 0.115
- **Server**: Uvicorn
- **Database**: 
  - PostgreSQL with asyncpg
  - SQLAlchemy (async ORM)
  - Alembic (migrations)
- **ML/Data Science**:
  - numpy, pandas
  - scikit-learn
  - XGBoost
  - statsmodels & prophet (time series)
  - joblib (model persistence)
  - mlflow (experiment tracking)
  - Optuna (hyperparameter optimization)
- **NLP**:
  - sentence-transformers
  - ChromaDB (vector store)
  - LangChain & LangChain Community
  - Ollama (local LLM)
- **Async Task Queue**: Celery
- **Cache & Message Broker**: Redis
- **Configuration**: Pydantic v2
- **Security**: python-jose with cryptography
- **Utilities**: 
  - loguru (structured logging)
  - tenacity (retry logic)
  - psutil (system monitoring)

### Infrastructure & DevOps
- **Containerization**: Docker
- **Orchestration**: Docker Compose
- **Cloud Database**: Neon (PostgreSQL)
- **Environment**: Linux/Unix based

### Language Composition
- **JavaScript**: 68.4% (Frontend + Node Backend)
- **Python**: 25.3% (AI Backend)
- **CSS**: 6.1% (Styling)
- **Other**: 0.2%

---

## Project Structure

```
AI-Powered-SMS/
├── frontend/                          # React Frontend Application
│   ├── public/                        # Static assets
│   ├── src/
│   │   ├── COMPONENTS/                # Reusable React components
│   │   ├── PAGES/                     # Page components
│   │   ├── STORES/                    # Zustand state stores
│   │   ├── MOD/                       # Modules/utilities
│   │   ├── App.jsx                    # Main App component
│   │   ├── main.jsx                   # React entry point
│   │   └── index.css                  # Global styles
│   ├── package.json                   # Frontend dependencies
│   ├── vite.config.js                 # Vite configuration
│   └── eslint.config.js               # ESLint configuration
│
├── backend/                           # Node.js/Express REST API
│   ├── Configs/                       # Configuration files
│   │   ├── Database.js                # PostgreSQL connection
│   │   └── DBInitialization.js        # Schema initialization
│   ├── controllers/                   # Business logic handlers
│   │   ├── userAuth.controllers.js    # Authentication
│   │   ├── academicYear.Controller.js # Academic year management
│   │   ├── academicTerms.controller.js# Academic term management
│   │   ├── data.controller.js         # Student data CRUD
│   │   ├── upload.controller.js       # File upload handling
│   │   ├── report.controller.js       # Report generation
│   │   └── webhook.controller.js      # Webhook handling
│   ├── middlewares/                   # Express middlewares
│   ├── routes/                        # API route definitions
│   ├── services/                      # Database services
│   ├── utils/                         # Utility functions
│   ├── server.js                      # Express app setup
│   ├── package.json                   # Backend dependencies
│   └── .env                           # Environment variables
│
├── backend-ai/                        # Python/FastAPI AI Service
│   ├── app/
│   │   ├── api/                       # API endpoints/routers
│   │   ├── core/
│   │   │   ├── database.py            # Database connection & ORM setup
│   │   │   ├── cache.py               # Redis cache manager
│   │   │   └── security.py            # Authentication utilities
│   │   ├── models/                    # SQLAlchemy models
│   │   ├── schemas/                   # Pydantic schemas (validation)
│   │   ├── ml/                        # Machine learning modules
│   │   │   ├── model_trainer.py       # Model training
│   │   │   ├── predictor.py           # Inference engine
│   │   │   └── drift_detector.py      # Data drift detection
│   │   ├── nlp/                       # NLP processing
│   │   │   ├── embeddings.py          # Text embeddings
│   │   │   ├── rag.py                 # RAG implementation
│   │   │   └── summarizer.py          # Text summarization
│   │   ├── tasks/                     # Celery async tasks
│   │   │   ├── celery_app.py          # Celery configuration
│   │   │   ├── training_tasks.py      # ML training tasks
│   │   │   └── scheduled_tasks.py     # Scheduled jobs
│   │   ├── utils/                     # Utility functions
│   │   │   ├── logger.py              # Logging setup
│   │   │   └── validators.py          # Data validation
│   │   ├── main.py                    # FastAPI app initialization
│   │   └── config.py                  # Configuration settings
│   ├── tests/                         # Unit & integration tests
│   ├── scripts/                       # Utility scripts
│   ├── logs/                          # Application logs
│   ├── pyproject.toml                 # Python project definition
│   ├── Dockerfile                     # Container image
│   ├── docker-compose.yml             # Multi-service setup
│   └── .env                           # Environment variables
│
├── students.csv                       # Sample student data
└── README.md                          # This file

```

---

## Components

### Frontend Components

#### Page Components (PAGES)
- **Dashboard**: Main student overview and analytics
- **Student Management**: CRUD operations for students
- **Financial/Wallet**: Transaction history and balance management
- **Academic Terms**: Term and year management
- **Reports**: Analytics and report generation
- **Authentication**: Login/register pages
- **Settings**: User preferences and configurations

#### UI Components (COMPONENTS)
- Navigation and Header
- Cards and Data Display
- Forms and Input Fields
- Tables and Data Grids
- Charts and Visualizations
- Modals and Dialogs
- Alerts and Notifications

### Backend API Controllers

#### Authentication (`userAuth.controllers.js`)
```
POST /api/v1/auth/register    - Register new user
POST /api/v1/auth/login       - User login
POST /api/v1/auth/logout      - User logout
POST /api/v1/auth/refresh     - Refresh JWT token
```

#### Academic Year Management (`academicYear.Controller.js`)
```
GET    /api/v1/academic-years      - List all years
POST   /api/v1/academic-years      - Create new year
PUT    /api/v1/academic-years/:id  - Update year
DELETE /api/v1/academic-years/:id  - Delete year
```

#### Academic Terms (`academicTerms.controller.js`)
```
GET    /api/v1/academic-terms      - List all terms
POST   /api/v1/academic-terms      - Create new term
PUT    /api/v1/academic-terms/:id  - Update term
DELETE /api/v1/academic-terms/:id  - Delete term
```

#### Student Data (`data.controller.js`)
```
GET    /api/v1/students            - List students
POST   /api/v1/students            - Create student
PUT    /api/v1/students/:id        - Update student
DELETE /api/v1/students/:id        - Delete student
GET    /api/v1/students/:id        - Get student details
```

#### File Upload (`upload.controller.js`)
```
POST /api/v1/upload/csv       - Bulk upload student data
POST /api/v1/upload/files     - Upload documents
POST /api/v1/export/csv       - Export data as CSV
POST /api/v1/export/pdf       - Export data as PDF
```

#### Reports (`report.controller.js`)
```
GET /api/v1/reports/summary       - Summary report
GET /api/v1/reports/performance   - Performance analytics
GET /api/v1/reports/financial     - Financial report
GET /api/v1/reports/custom        - Custom report generation
```

#### Webhooks (`webhook.controller.js`)
```
POST /api/v1/webhooks/events  - Process external events
```

### AI Backend Endpoints

#### Health & Info
```
GET /                     - Service info
GET /health               - Health check
```

#### ML Models
```
POST /api/models/train              - Trigger model training
GET  /api/models/status             - Model performance metrics
POST /api/models/predict            - Get predictions
POST /api/models/retrain            - Force retraining
```

#### Analytics
```
POST /api/analytics/analyze         - Analyze student data
GET  /api/analytics/trends          - Trend analysis
POST /api/analytics/anomalies       - Detect anomalies
```

#### NLP Services
```
POST /api/nlp/embed                 - Generate embeddings
POST /api/nlp/search                - Semantic search
POST /api/nlp/summarize             - Text summarization
POST /api/nlp/rag                   - RAG query processing
```

#### Tasks
```
GET  /api/tasks/:task_id           - Get task status
POST /api/tasks/retry/:task_id     - Retry failed task
```

---

## Installation & Setup

### Prerequisites

- **Node.js**: v16+ (for backend)
- **Python**: 3.11+ (for AI backend)
- **Docker & Docker Compose**: Latest versions
- **Git**: Version control
- **PostgreSQL**: Cloud (Neon) or local installation
- **Redis**: For caching and message brokering

### Step 1: Clone Repository

```bash
git clone https://github.com/Anco-Sam-Franco-B/AI-Powered-SMS.git
cd AI-Powered-SMS
```

### Step 2: Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
# Edit .env.local with your API endpoint

# Development server
npm run dev

# Build for production
npm run build
```

### Step 3: Backend API Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env with database credentials

# Development with nodemon
npm run dev

# Or start production
node server.js
```

### Step 4: AI Backend Setup

```bash
cd backend-ai

# Install Python dependencies
pip install -e .

# Or with development dependencies
pip install -e ".[dev]"

# Run database migrations
alembic upgrade head

# Start the service
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Step 5: Docker Setup (Recommended)

```bash
cd backend-ai

# Build and start all services
docker-compose up --build

# Services will be available at:
# - Frontend: http://localhost:5173
# - Backend API: http://localhost:5000
# - AI Backend: http://localhost:8000
# - Redis: localhost:6379
# - Ollama: http://localhost:11434
```

---

## Configuration

### Backend API Environment Variables

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=ai_sms

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRY=7d

# CORS
CORS_ORIGIN=http://localhost:5173

# File Upload
MAX_FILE_SIZE=50mb
UPLOAD_DIR=./uploads

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_app_password
```

### AI Backend Environment Variables

```env
# Application
APP_NAME=Student Management AI
APP_VERSION=1.0.0
DEBUG=False

# Database
DATABASE_URL=postgresql+asyncpg://user:password@host/db
DATABASE_URL_SYNC=postgresql://user:password@host/db

# Redis
REDIS_URL=redis://localhost:6379/0

# Celery
CELERY_BROKER_URL=redis://localhost:6379/1
CELERY_RESULT_BACKEND=redis://localhost:6379/2

# JWT
JWT_KEY=your_secret_key
JWT_ALGORITHM=HS256

# Model Storage
MODEL_STORAGE_PATH=storage/models
VECTOR_DB_PATH=storage/chromadb

# LLM (Ollama)
OLLAMA_BASE_URL=http://localhost:11434
LLM_MODEL=llama3.2

# Auto-Training
AUTO_RETRAIN_ENABLED=True
RETRAIN_CRON_SCHEDULE=0 3 * * 0  # Every Sunday at 3 AM
DRIFT_CHECK_INTERVAL_HOURS=24

# CORS
ALLOWED_ORIGINS=["http://localhost:5173", "http://localhost:5000"]
```

### Frontend Environment Variables

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_AI_API_URL=http://localhost:8000/api
VITE_APP_NAME=AI-Powered SMS
```

---

## API Documentation

### Authentication Flow

1. **Register**
   ```bash
   POST /api/v1/auth/register
   {
     "email": "student@example.com",
     "password": "secure_password",
     "name": "John Doe",
     "role": "student"
   }
   ```

2. **Login**
   ```bash
   POST /api/v1/auth/login
   {
     "email": "student@example.com",
     "password": "secure_password"
   }
   Response:
   {
     "token": "eyJhbGc...",
     "user": { ... }
   }
   ```

3. **Use Token**
   ```bash
   Authorization: Bearer {token}
   ```

### Data Endpoints

#### Get All Students
```bash
GET /api/v1/students?page=1&limit=10&search=name
```

#### Create Student
```bash
POST /api/v1/students
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "+1234567890",
  "academicYear": 1,
  "academicTerm": 1,
  "wallet_balance": 1000.00
}
```

#### Bulk Upload
```bash
POST /api/v1/upload/csv
Content-Type: multipart/form-data
file: students.csv
```

### AI Endpoints

#### Predict Student Performance
```bash
POST /api/models/predict
{
  "student_id": 123,
  "features": {
    "attendance": 0.95,
    "previous_gpa": 3.8,
    "study_hours": 5.0
  }
}
Response:
{
  "predicted_gpa": 3.85,
  "confidence": 0.92,
  "recommendation": "Excellent performance expected"
}
```

#### Generate Embeddings
```bash
POST /api/nlp/embed
{
  "text": "Student performance analysis"
}
Response:
{
  "embedding": [0.123, -0.456, ...],
  "model": "all-MiniLM-L6-v2"
}
```

### WebSocket Support (Real-time Updates)
```javascript
// Connect to real-time updates
const ws = new WebSocket('ws://localhost:5000/api/v1/ws');

ws.onmessage = (event) => {
  console.log('Update:', JSON.parse(event.data));
};
```

---

## Features

### Core Features

#### 1. Student Management
- ✅ Student CRUD operations
- ✅ Bulk import/export
- ✅ Student profiles and history
- ✅ Contact information management
- ✅ Academic transcript tracking

#### 2. Financial Management
- ✅ Wallet balance management
- ✅ Transaction history
- ✅ Payment processing
- ✅ Fee calculation and billing
- ✅ Financial reports

#### 3. Academic Management
- ✅ Academic year configuration
- ✅ Term management
- ✅ Grade tracking
- ✅ Course enrollment
- ✅ Attendance monitoring

#### 4. AI & Analytics
- ✅ Performance prediction
- ✅ Risk identification
- ✅ Trend analysis
- ✅ Anomaly detection
- ✅ Natural language processing

#### 5. Reporting
- ✅ Summary reports
- ✅ Custom reports
- ✅ PDF export
- ✅ CSV export
- ✅ Scheduled reports

#### 6. Security
- ✅ JWT authentication
- ✅ Role-based access control
- ✅ Password hashing (bcryptjs)
- ✅ CORS protection
- ✅ Input validation
- ✅ SQL injection prevention

#### 7. Performance
- ✅ Redis caching
- ✅ Database indexing
- ✅ Async processing with Celery
- ✅ Request rate limiting
- ✅ Load balancing ready

---

## Deployment

### Docker Deployment

```bash
# Build all services
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Kubernetes Deployment

```bash
# Create namespace
kubectl create namespace ai-sms

# Deploy backend
kubectl apply -f k8s/backend-deployment.yaml

# Deploy AI service
kubectl apply -f k8s/ai-deployment.yaml

# Deploy database
kubectl apply -f k8s/database-deployment.yaml

# Check status
kubectl get pods -n ai-sms
```

### Cloud Deployment (AWS Example)

```bash
# Push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin {account}.dkr.ecr.us-east-1.amazonaws.com

docker tag backend-api:latest {account}.dkr.ecr.us-east-1.amazonaws.com/ai-sms-backend:latest
docker push {account}.dkr.ecr.us-east-1.amazonaws.com/ai-sms-backend:latest

# Create ECS task definition and service
# Configure RDS for PostgreSQL
# Configure ElastiCache for Redis
```

### Environment Configuration

```bash
# Production
export NODE_ENV=production
export VITE_API_BASE_URL=https://api.yourdomain.com
export DATABASE_URL=postgresql://user:pass@prod-host/db
```

---

## Development

### Project Setup

```bash
# Install pre-commit hooks
pip install pre-commit
pre-commit install

# Run linting
npm run lint          # Frontend
pylint app/           # Backend-AI

# Run tests
npm test              # Frontend
pytest                # Backend-AI
```

### Development Tools

#### Frontend
- **Vite**: Lightning-fast build tool
- **ESLint**: Code quality
- **React DevTools**: Chrome extension

#### Backend
- **Nodemon**: Auto-restart on changes
- **Morgan**: HTTP logging
- **Postman**: API testing

#### AI Backend
- **Jupyter**: Interactive notebooks
- **MLflow**: Experiment tracking
- **Pytest**: Testing framework

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature

# Make changes and commit
git add .
git commit -m "feat: describe your changes"

# Push to remote
git push origin feature/your-feature

# Create pull request on GitHub
```

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Database connection error | Check DB_URL and credentials in .env |
| CORS errors | Verify CORS_ORIGIN matches frontend URL |
| Redis connection fails | Ensure Redis is running: `redis-cli ping` |
| Model loading error | Check model path and file permissions |
| Celery tasks not running | Verify Redis broker URL and worker is active |

---

## Performance Optimization

### Caching Strategy
- Redis for session management
- Query result caching with TTL
- API response caching for GET requests
- Model caching for inference

### Database Optimization
- Indexed columns on frequently queried fields
- Connection pooling (asyncpg)
- Async queries for I/O operations
- Query optimization and EXPLAIN analysis

### Frontend Optimization
- Code splitting with Vite
- Lazy loading of components
- Image optimization
- CSS purging with Tailwind

### ML Optimization
- Model quantization for faster inference
- Batch prediction for efficiency
- Distributed training on Celery workers
- Feature caching and preprocessing

---

## Monitoring & Logging

### Application Logging
```python
# AI Backend
from app.utils.logger import logger
logger.info("Training started")
logger.error("Training failed", error=str(e))
```

```javascript
// Backend API
console.log('Student created:', student);
console.error('Database error:', error);
```

### Health Checks
```bash
# Backend API
curl http://localhost:5000/health

# AI Backend
curl http://localhost:8000/

# Database
pg_isready -h localhost -p 5432
```

### Metrics & Monitoring
- CPU and memory usage tracking
- Request response times
- Database query performance
- ML model inference latency
- Cache hit rates

---

## Contributing

### Code Style
- **Frontend**: ESLint configuration
- **Backend**: Node conventions
- **AI Backend**: PEP 8 with Black formatter

### Pull Request Process
1. Fork repository
2. Create feature branch
3. Make changes with tests
4. Update documentation
5. Submit PR with description

---

## License

This project is licensed under ISC License - see LICENSE file for details.

---

## Support & Contact

**Author**: Tr. Sam Franco BYIRINGIRO

**Repository**: [AI-Powered-SMS](https://github.com/Anco-Sam-Franco-B/AI-Powered-SMS)

**Issues**: [GitHub Issues](https://github.com/Anco-Sam-Franco-B/AI-Powered-SMS/issues)

---

## Acknowledgments

- FastAPI & uvicorn for the AI service
- Express.js for the backend API
- React & Vite for the frontend
- PostgreSQL & Redis for data persistence
- Celery for async task processing
- Ollama for local LLM capabilities
- All open-source contributors

---

## Roadmap

### Q1 2025
- [ ] Mobile app development (React Native)
- [ ] Advanced ML models for performance prediction
- [ ] Enhanced NLP capabilities
- [ ] GraphQL API support

### Q2 2025
- [ ] Real-time collaboration features
- [ ] Advanced analytics dashboard
- [ ] Integration with third-party APIs
- [ ] SMS notification system

### Q3 2025
- [ ] Mobile payment integration
- [ ] Blockchain-based wallet security
- [ ] Advanced fraud detection
- [ ] Multi-language support

### Q4 2025
- [ ] AI-powered tutoring recommendations
- [ ] Predictive course recommendations
- [ ] Advanced reporting with Tableau integration
- [ ] Enterprise SSO support

---

**Last Updated**: June 17, 2025

**Version**: 1.0.0

For the latest updates, visit the [GitHub repository](https://github.com/Anco-Sam-Franco-B/AI-Powered-SMS).
