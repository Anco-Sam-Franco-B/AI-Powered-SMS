# AI-Powered Student Management System (AI-Powered-SMS)

A concise, maintainable Student Management System (SMS) that combines a React frontend, an Express backend, and a Python/FastAPI AI service for analytics and machine learning features.

## Quick start

1. Clone the repo:

   ```bash
   git clone https://github.com/Anco-Sam-Franco-B/AI-Powered-SMS.git
   cd AI-Powered-SMS
   ```

2. Run services (Docker Compose recommended):

   ```bash
   # from repository root if a docker-compose.yml exists
   docker compose up --build
   ```

3. Or run locally per service:

   - Frontend:
     ```bash
     cd frontend
     npm install
     npm run dev
     ```

   - Backend (Express):
     ```bash
     cd backend
     npm install
     npm run dev
     ```

   - AI Backend (FastAPI):
     ```bash
     cd backend-ai
     pip install -r requirements.txt
     uvicorn app.main:app --reload --port 8000
     ```

## Features

- Student CRUD and lifecycle management
- Wallet and financial transactions
- AI-powered analytics and predictions
- NLP utilities and embeddings (RAG)
- Asynchronous jobs with Celery
- Docker-friendly and ready for cloud deployment

## Project structure

Top-level folders: `frontend/`, `backend/`, and `backend-ai/`. See the full project for more details.

## Contributing

Contributions are welcome. Please open issues to discuss features or bug fixes, and send pull requests against the repository's default branch.

## License

This project is licensed under the ISC License — see the LICENSE file for details.

## Contact
Author: Tr. Sam Franco BYIRINGIRO
Repository: https://github.com/Anco-Sam-Franco-B/AI-Powered-SMS
