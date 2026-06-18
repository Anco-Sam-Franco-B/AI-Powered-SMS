# AI-Powered Student Management System (SMS)

A sophisticated, AI-driven Student Management System that combines traditional wallet/financial management with advanced machine learning capabilities for student data analysis, prediction, and int[...]

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
┌────────────────────────────────────────────────────────────────�[...]
│                      Frontend (React + Vite)                     │
│              - Student Dashboard                                 │
│              - Financial Management UI                           │
│              - Analytics & Reports                               │
└────────────────────────────┬───────��───────────────────────────�[...]
                             │
                             ▼
┌────────────────────────────────────────────────────────────────�[...]
│              API Gateway & Authentication                        │
│         (Express.js Backend - Port 5000)                        │
└────────────────┬─────────────────────────────────┬─────────────�[...]
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
              ┌─────────┐   ┌─────────��┐    ┌────────────┐
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

... (file content preserved) ...

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

---

## Recent changes (last 10 commits)

- [1711be5] Added Multi-server starter between frontend, backend and backend-ai — BYIRINGIRO Sam Franco — 2026-06-18T19:01:06Z
  https://github.com/Anco-Sam-Franco-B/AI-Powered-SMS/commit/1711be5d469b3ed2f2f43e59d08a41bcb6384baa

- [d6916e4] Added Multi-server starter between frontend, backend and backend-ai — anco-sam-franco-b — 2026-06-18T18:07:55Z
  https://github.com/Anco-Sam-Franco-B/AI-Powered-SMS/commit/d6916e4a39da0d33136448478f399eacfd905449

- [8257c4d] Merge pull request #7 — Rename project from frontend-wallet to ai-powered-sms — BYIRINGIRO Sam Franco — 2026-06-18T18:04:07Z
  https://github.com/Anco-Sam-Franco-B/AI-Powered-SMS/commit/8257c4d18382f3f671c7a70d7a50a5c92274e4e7

- [852a3aa] Rename project from frontend-wallet to ai-powered-sms — BYIRINGIRO Sam Franco — 2026-06-18T18:02:39Z
  https://github.com/Anco-Sam-Franco-B/AI-Powered-SMS/commit/852a3aa44662a42233b335db41fe9535e20bb075

- [2bb8b99] Merge pull request #6 — Rename project from frontend-wallet to ai-powered-sms — BYIRINGIRO Sam Franco — 2026-06-18T18:00:52Z
  https://github.com/Anco-Sam-Franco-B/AI-Powered-SMS/commit/2bb8b99e9fc3b394d605e242ceeaeba268b238aa

- [ac6c963] Rename project from frontend-wallet to ai-powered-sms — BYIRINGIRO Sam Franco — 2026-06-18T18:00:01Z
  https://github.com/Anco-Sam-Franco-B/AI-Powered-SMS/commit/ac6c96336d07c8539762a08a82f0930767e516d4

- [87df549] Merge pull request #5 — Rename project from backend-wallet to ai-powered-sms — BYIRINGIRO Sam Franco — 2026-06-18T17:59:06Z
  https://github.com/Anco-Sam-Franco-B/AI-Powered-SMS/commit/87df54980effa9df7bd8eb31bb25c8e20d8c3059

- [95b6415] Rename project from backend-wallet to ai-powered-sms — BYIRINGIRO Sam Franco — 2026-06-18T17:58:02Z
  https://github.com/Anco-Sam-Franco-B/AI-Powered-SMS/commit/95b641510bfd52b23c6cfa8facb4044567372212

- [b33a8c1] Merge pull request #4 — Update project description for clarity — BYIRINGIRO Sam Franco — 2026-06-18T17:56:50Z
  https://github.com/Anco-Sam-Franco-B/AI-Powered-SMS/commit/b33a8c13166827e960c12c4326e33226a8d9d826

- [f3f1555] Update project description for clarity — BYIRINGIRO Sam Franco — 2026-06-18T17:55:56Z
  https://github.com/Anco-Sam-Franco-B/AI-Powered-SMS/commit/f3f15551ad07ad7d44a349124859522343d65a85

---

_Last updated: 2026-06-18T19:01:06Z_

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

