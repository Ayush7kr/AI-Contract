# LexiSure AI ⚖️

**Contract Risk Intelligence Platform for MSMEs and Startups.**

LexiSure AI is a sophisticated AI-powered platform designed to help businesses manage, analyze, and mitigate risks in legal contracts. By leveraging Large Language Models (LLMs), it provides deep insights, risk scoring, and negotiation assistance, making legal due diligence accessible and efficient.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688)
![React](https://img.shields.io/badge/Frontend-React-61DAFB)

---

## 🚀 Key Features

-   **Contract Risk Analysis**: Automated extraction of key clauses and risk assessment with scoring.
-   **AI Negotiation Assistant**: Suggestions for clause modifications based on business interests.
-   **Compliance Tracking**: Ensure contracts adhere to relevant regulations and standards.
-   **Legal Chatbot**: Interactive AI assistant for rapid contract-related queries.
-   **Vendor Intelligence**: Unified dashboard for managing vendor-related risks and insights.
-   **Contract Comparison**: Side-by-side analysis of different contract versions or types.

---

## 🛠️ Tech Stack

### Backend
-   **Framework**: [FastAPI](https://fastapi.tiangolo.com/)
-   **AI Engine**: [Google Gemini Pro](https://deepmind.google/technologies/gemini/)
-   **Database**: SQLite with [SQLAlchemy ORM](https://www.sqlalchemy.org/)
-   **Authentication**: JWT (JSON Web Tokens) with OAuth2
-   **File Processing**: PyPDF2, python-docx

### Frontend
-   **Framework**: [React](https://react.dev/) (Vite)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **Icons**: [Lucide React](https://lucide.dev/)
-   **Charts**: [Recharts](https://recharts.org/)
-   **Notifications**: React Hot Toast

---

## 🏗️ Architecture

The project follows a decoupled client-server architecture:
-   **`backend/`**: Python-based FastAPI application handling logic, AI processing, and database interactions.
-   **`frontend/`**: React-based Single Page Application (SPA) providing a modern, responsive user interface.

Detailed documentation can be found in [ARCHITECTURE.md](docs/ARCHITECTURE.md).

---

## 🏁 Getting Started

### Prerequisites
-   Python 3.10+
-   Node.js 18+
-   Google Gemini API Key

### Backend Setup
1. Navigate to the backend directory:
    ```bash
    cd backend
    ```
2. Create and activate a virtual environment:
    ```bash
    python -m venv .venv
    source .venv/bin/activate  # On Windows: .venv\Scripts\activate
    ```
3. Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4. Configure environment variables in a `.env` file (see `.env.example`).
5. Start the server:
    ```bash
    uvicorn main:app --reload
    ```

### Frontend Setup
1. Navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2. Install dependencies:
    ```bash
    npm install
    ```
3. Start the development server:
    ```bash
    npm run dev
    ```

---

## 📖 Documentation
-   [Features Overview](docs/FEATURES.md)
-   [Architecture Deep Dive](docs/ARCHITECTURE.md)
-   [Step-by-Step Walkthrough](docs/WALKTHROUGH.md)

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

*Developed by Ayush Kumar - [GitHub](https://github.com/Ayush7kr)*
