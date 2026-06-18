# AI-Powered SMS

Turn ordinary SMS into actionable conversations — automate replies, summarize long threads, and schedule campaigns with an AI assistant built on JavaScript and Python.

## Project overview

AI-Powered SMS is a lightweight assistant for sending, receiving, summarizing, and automating SMS messaging using modern NLP. The project pairs a JavaScript frontend with Python-based NLP services to provide AI-generated reply suggestions, conversation summarization, message templates, and scheduling. It's designed to be extensible and Twilio-compatible so teams can quickly add automation and analytics to existing SMS workflows.

## Key features

- Send & receive SMS (Twilio-compatible)
- AI-generated reply suggestions and auto-responses
- Message and thread summarization
- Templates, scheduling, and campaign automation
- Basic analytics & delivery reporting
- Extensible architecture: JavaScript frontend + Python NLP backend

## Tech stack

- Languages: JavaScript (frontend, ~68.5%), Python (NLP services, ~25.2%), CSS (~6.1%)
- Likely components: React/Vue UI, Node.js server for web/API, Python service (Flask/FastAPI) for NLP, Twilio (or compatible) integration for SMS delivery

## Quickstart

1. Clone the repo and install dependencies for both frontend and backend:

   - Frontend: npm install (or yarn)
   - Backend: pip install -r requirements.txt

2. Create a .env with your SMS provider (e.g., Twilio) credentials and model/API keys. Example variables:

   - TWILIO_ACCOUNT_SID=
   - TWILIO_AUTH_TOKEN=
   - SMS_FROM_NUMBER=
   - NLP_SERVICE_URL=
   - NLP_API_KEY=

3. Run the backend service, start the frontend, and open the web UI to test sending and receiving messages:

   - Backend: python -m uvicorn app.main:app --reload
   - Frontend: npm start

## Contributing

Contributions are welcome — open issues or pull requests for improvements, bug fixes, or new features.

## License

Specify a license (e.g., MIT) in LICENSE.md.

---

(Updated README with longer project description and usage hints.)