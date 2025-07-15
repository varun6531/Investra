# Investra - Financial Chat Application

A multi-platform financial chat application with AI-powered document analysis, real-time stock data, and web search capabilities.

#### Built using Nodejs, Typescript, React, React Native, Python, Langchain and powered by qdrant vector database, serpapi for web search, polygon io api for stock api and ollama models: llama3.2:3b for llm and nomic-embed-text for embedding model

Start with the Base mode for RAG output based on The Basics for Investing in Stocks by the Editors of Kiplinger's Personal Finance

Toggle on top right to Ultra mode for RAG + Enhanced with real-time stock data and web search capabilities. Ask about current stock prices, market trends, or any financial questions - the AI will search for the latest information when the document doesn't contain the answer.

See below for app pages, feature completion, requirements, installion, running, tech stack used, reflection and plan for future. 

## On start you get to see mode options, click Get Started with Investra:
<img width="1920" height="1080" alt="Mode Options" src="https://github.com/user-attachments/assets/5fd7138d-8f71-4204-aa2c-bf71cf214759" />

## Base mode for RAG output in web app:
<img width="1920" height="1080" alt="Base Mode Web" src="https://github.com/user-attachments/assets/f27586af-419b-4961-972d-a11376cba0ee" />

## Ultra mode for RAG + Enhanced with real-time stock data and web search capabilities in web app (switched modes with toggle on top right):
<img width="1920" height="1080" alt="Ultra Mode Web" src="https://github.com/user-attachments/assets/a0b98f8a-ee1e-4065-bbf5-64873610364d" />


## Base mode for RAG output in mobile app:
<img width="567" height="1087" alt="Base Mode Mobile" src="https://github.com/user-attachments/assets/28bf58df-a256-4f27-a036-b9b3fc719dbb" />

Ultra mode for RAG + Enhanced with real-time stock data and web search capabilities in mobile app (switched modes with toggle on top right):
<img width="567" height="1087" alt="Ultra Mode Mobile" src="https://github.com/user-attachments/assets/6340b170-1e4d-4f46-97c4-15b2626483a4" />


## Complete Features

### **Milestone 1: Basic Chat UI with Contextual Answers** ✅
- ✅ **Simple user interface** with modern chat format and responsive design
- ✅ **Preloaded reference document** Investor FAQ: https://www.rld.nm.gov/wp-content/uploads/2021/06/IPT_Stocks_2012.pdf with automatic chunking and embedding
- ✅ **Vector store integration** using Qdrant for efficient similarity search
- ✅ **Retrieval-Augmented Generation (RAG)** with relevant document chunk retrieval
- ✅ **Local LLM integration** via Ollama with llama3.2:3b model
- ✅ **Citation system** with colored links to source documents (green for docs, purple for stocks, blue for web search)

### **Milestone 2: Enhanced Chat Experience** ✅
- ✅ **Local chat history persistence** using localStorage with session management
- ✅ **Multi-session support** with ability to switch between different chat sessions
- ✅ **Improved response formatting** with paragraph splitting and proper spacing
- ✅ **Service usage indicators** showing which services were used (RAG, Stock, Web Search)
- ✅ **Error handling and loading states** for better user experience

### **Milestone 3 (Bonus): Optional Extensions** ✅
- ✅ **Memory capabilities** maintaining context across follow-up questions
- ✅ **Web search integration** using SerpAPI with LangChain for fallback answers
- ✅ **Stock data API integration** using Polygon.io with LangChain for real-time stock information
- ✅ **React Native mobile app** with full feature parity to web version
- ✅ **RAG mode toggle** between normal (basic RAG) and advanced (RAG + Stock + Web Search) modes
- ✅ **Prompt caching using Redis** for improved performance and reduced API calls

### **Additional Features** ✅
- ✅ **Beautiful modern UI** with gradient backgrounds, shadows, and responsive design
- ✅ **Cross-platform support** (Web + Mobile)
- ✅ **Microservices architecture** with separate Python LLM service and Node.js API gateway
- ✅ **Citation enhancement** with hover tooltips and source tracking
- ✅ **Real-time stock ticker detection** and automatic data retrieval
- ✅ **Web search fallback** when document doesn't contain answers
- ✅ **Session management** with automatic title generation and persistence



## Installation and Running Steps

### Prerequisites

Before setting up the project, ensure you have the following installed:

### System Requirements

#### Python 3.10 or higher  ([make sure python available as name of cmdlet in path](https://stackoverflow.com/questions/52332554/vscode-the-term-python-is-not-recognized-but-py-works))
- **macOS**: 
  - **Option 1**: Download from [python.org](https://python.org/downloads)
  - **Option 2**: `brew install python`
- **Windows**: Download from [python.org](https://python.org/downloads)
- **Linux**: `sudo apt install python3` (Ubuntu/Debian) or `sudo yum install python3` (CentOS/RHEL)

#### Node.js 18 or higher
- **macOS**: 
  - **Option 1**: Download from [nodejs.org](https://nodejs.org)
  - **Option 2**: `brew install node`
- **Windows**: Download from [nodejs.org](https://nodejs.org)
- **Linux**: Use NodeSource repository or download from [nodejs.org](https://nodejs.org)

#### npm and npx  ([make sure npm/npx available as name of cmdlet in path](https://stackoverflow.com/questions/20992723/npm-is-not-recognized-as-internal-or-external-command-operable-program-or-bat))
- Included with Node.js installation
- Verify installation: `npm --version` and `npx --version`

#### Git ([make sure git available as name of cmdlet in path](https://stackoverflow.com/questions/4492979/error-git-is-not-recognized-as-an-internal-or-external-command))
- **macOS**: 
  - **Option 1**: Download from [git-scm.com](https://git-scm.com)
  - **Option 2**: `brew install git`
- **Windows**: Download from [git-scm.com](https://git-scm.com)
- **Linux**: `sudo apt install git` (Ubuntu/Debian) or `sudo yum install git` (CentOS/RHEL)

#### pip
Included with Python installation
`pip --version`

If pip is not installed or not working, you can manually install it by downloading the get-pip.py script and running:
`python get-pip.py`

### Downloaded Software
- Ollama (for local LLM and embedding model): install from website - [ollama.ai](https://ollama.com/download)
- Redis (Optional though recomended for mac for caching): install from website - [redis.io](https://redis.io/download](https://redis.io/docs/latest/operate/oss_and_stack/install/archive/install-redis/))
Note: Redis for windows needs linux subsystem/ubuntu, if you dont have these systems needed for download then redis will  not cache the prompt, yet the app works still, so it is entirely optional
- Expo CLI (for mobile development): shown below in installation guide

#### Make sure to restart your system after installation (especially if updating path variables in windows)

## Install (make sure to run in new terminal instances wherever mentioned)

### 1. Clone the Repository

```bash
git clone https://github.com/varun6531/Investra.git
cd Investra
```

### 2. Install Ollama and Pull Models and Run in a new terminal

#### macOS:
- **Option 1 (Recommended)**: Download from [ollama.ai](https://ollama.ai) and install the .dmg file
- **Option 2 (Homebrew)**: `brew install ollama`

#### Windows:
- Download from [ollama.ai](https://ollama.ai) and run the installer
- Add Ollama to your system PATH if prompted (may have to restart)

#### Linux:
- Download from [ollama.ai](https://ollama.ai) and follow the installation instructions
- Or use: `curl -fsSL https://ollama.ai/install.sh | sh`

After installation, pull the required models:

```bash
ollama pull llama3.2:3b
ollama pull nomic-embed-text
ollama serve
```
if after `ollama serve` you are getting an error like: 'Error: listen tcp 127.0.0.1:11434: bind: Only one usage of each socket address (protocol/network address/port) is normally permitted.', this means ollama application is using the port so make sure to quit the app (or kill the process using that port) and then do `ollama serve` again

### 3. Install and Run Redis in a new terminal (Optional for prompt caching)

#### macOS:
- **Option 1 (Homebrew)**:  (Optional, can skip)
  ```bash
  brew install redis
  redis-server
  ```
- **Option 2 (Manual)**:  (Optional, can skip)
  ```bash
  # Download and compile from source
  wget http://download.redis.io/redis-stable.tar.gz
  tar xvzf redis-stable.tar.gz
  cd redis-stable
  make
  sudo make install
  redis-server
  ```

#### Ubuntu/Debian: (Optional, can skip)
```bash
sudo apt update
sudo apt install redis-server
redis-server
```

#### Windows: (Optional, can skip)
- **Option 1 (WSL)**: Follow Ubuntu/Debian instructions in WSL
- **Option 2 (Native)**: 
  - Download Redis for Windows from [redis.io](https://redis.io/download)
  - Extract to a directory (e.g., C:\redis)
  - Add C:\redis to your system PATH
  - Run `redis-server` from command prompt
- **Option 3 (Chocolatey)**: `choco install redis-64`

### 4. Install Expo CLI

```bash
npm install -g @expo/cli
```

### 5. Set Up Python Virtual Environment

```bash
cd llm-service
python -m venv .venv
```

Activate virtual environment
On macOS/Linux:
```bash
source .venv/bin/activate
```
 On Windows:
```bash
.venv\Scripts\activate
```
If getting an error on windows saying running scripts is disabled on this system [How to fix](https://stackoverflow.com/questions/69605313/vs-code-terminal-activate-ps1-cannot-be-loaded-because-running-scripts-is-disa)

Install Python dependencies
```bash
pip install -r requirements.txt
```

### 6. Install Backend Dependencies

```bash
cd backend
npm install
```

### 7. Install Frontend Dependencies

```bash
cd frontend
npm install
```

### 8. Install Mobile Dependencies

```bash
cd mobile
npm install
```
## Running Steps

The application consists of multiple services that need to run simultaneously. Open separate terminal windows for each service.

### Terminal 1: LLM Service

```bash
cd llm-service
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
python main.py
```

The LLM service will start on http://localhost:8000

### Terminal 2: Backend Server

```bash
cd backend
npm start
```

The backend server will start on http://localhost:3001

### Terminal 3: Frontend (Web App)

```bash
cd frontend
npm run dev
```

The frontend will start on http://localhost:5173

Open http://localhost:5173 to start the app!

### Terminal 4: Mobile App (Expo) [For now use with i command to open ios simulator as this is the only way to get localhost requests and responses]

```bash
cd mobile
npx expo start
```

This will start the Expo development server. Since this is a localhost version (not deployed), you must use a simulator/emulator to access the localhost services:

- Press 'i' to open iOS simulator (recommended)
- Press 'a' to open Android emulator
- **Note**: Physical devices cannot access localhost services unless you configure network tunneling or deploy the services

## Configuration

### Default ports

The application uses default configurations, but you can customize:

- Backend port: 3001
- LLM service port: 8000
- Frontend port: 5173
- Redis: localhost:6379

### Vector Database

The Qdrant vector database is automatically initialized when the LLM service starts. Data is stored locally in the `vector-db/qdrant_data/` directory.

## Tech Stack

### Frontend (React)
- React v19.1.0 - UI framework
- TypeScript v5.8.3 - Type safety
- Vite v7.0.4 - Build tool and dev server
- Tailwind CSS v4.1.11 - Utility-first CSS framework
- React Router DOM v7.6.3 - Client-side routing
- Axios v1.10.0 - HTTP client for API calls

### Backend (Node.js)
- Express.js v5.1.0 - Web framework
- CORS v2.8.5 - Cross-origin resource sharing
- Multer v2.0.1 - File upload handling
- Axios v1.10.0 - HTTP client for forwarding requests
- Redis v4.7.1 - For Redis Caching functionality

### LLM Service (Python)
- FastAPI v0.116.1 - Modern Python web framework
- Uvicorn v0.35.0 - ASGI server
- LangChain v0.3.26 - LLM framework
- LangChain-Ollama v0.3.4 - Ollama integration
- LangChain-Qdrant v0.2.0 - Qdrant vector store integration

### Vector Database
- Qdrant v1.14.3 - Vector database client
- Local file-based storage - Qdrant data stored in vector-db/qdrant_data/

### LLM & Embeddings
- Ollama - Local LLM server
- llama3.2:3b - Fast, lightweight model for chat responses
- nomic-embed-text:latest - embedding model
- Vector dimensions: 3072 (optimized for llama3.2:3b)

### Development Tools
- ESLint v9.30.1 - Code linting
- PostCSS v8.5.6 - CSS processing
- Autoprefixer v10.4.21 - CSS vendor prefixing
- Nodemon - Backend development with auto-restart



## Project Structure

```
Investra/
├── backend/                 # Node.js API server
├── frontend/               # React web application
├── mobile/                 # React Native mobile app
├── llm-service/           # Python FastAPI LLM service
├── vector-db/             # Qdrant vector database data (generated on running llm service)
└── README.md
```

## Features

### Base Mode
- Document-based Q&A using pre-loaded financial documents
- RAG (Retrieval-Augmented Generation) with citation support
- Chat session management
- Multi-session support

### Ultra Mode
- All Base mode features
- Real-time stock data integration
- Web search capabilities
- Enhanced AI responses with external data

### Mobile App
- Full feature parity with web app
- Native mobile experience
- Cross-platform (iOS/Android)

### Common Issues

1. **Ollama not running**: Ensure Ollama is installed and running
2. **Redis connection error**: Check if Redis is running on localhost:6379
3. **Port conflicts**: Ensure ports 3001, 8000, and 5173 are available
4. **Python dependencies**: Make sure virtual environment is activated
5. **Mobile app issues**: Ensure Expo CLI is installed and device/emulator is ready

### Model Loading

If models fail to load:
```bash
ollama list  # Check installed models
ollama pull llama3.2:3b  # Re-pull if needed
ollama pull nomic-embed-text  # Re-pull if needed
```

### Redis Issues

Test Redis connection:
```bash
redis-cli ping  # Should return PONG
```

## Development

### Adding New Features
- Frontend: Edit files in `frontend/src/`
- Backend: Edit files in `backend/src/`
- LLM Service: Edit files in `llm-service/`
- Mobile: Edit files in `mobile/`

### Code Style
- Frontend: ESLint and Prettier configured
- Backend: ESLint configured
- Python: Follow PEP 8 guidelines

## License

Built by Varun Pillai

## Support

For issues and questions, please refer to the project documentation or create an issue in the repository.


### **Design Choices: Simplicity, Clarity, and Scalability** ✅

**What I Planned:**
- Microservices architecture with clear separation of concerns
- Python LLM service for advanced AI capabilities
- Node.js API gateway for routing and caching
- React frontend with TypeScript for type safety for web app
- React Native frontend with TypeScript for type safety for mobile
- Vector database for efficient document retrieval

**What I Implemented:**
- ✅ **Microservices Architecture**: Separate Python FastAPI service for LLM operations and Node.js Express server for API gateway
- ✅ **Clear Service Separation**: LLM service handles all AI/ML operations, backend handles routing and caching, frontend handles UI
- ✅ **Scalable Design**: Redis caching layer, modular service structure, and container-ready setup
- ✅ **Technology Choices**: Python for LangChain integration, Node.js for API gateway, React for frontend, React Native for mobile

**Reflection & Next Steps:**
The microservices approach proved effective for this project. The separation allowed us to leverage Python's superior LangChain ecosystem while maintaining a familiar Node.js API layer. For future scaling, I could add load balancing, database persistence, and container orchestration.

### **Code Quality: Readability, Maintainability, and Logical Structure** ✅

**What I Planned:**
- Clean, well-documented code with proper error handling
- TypeScript for type safety and better developer experience
- Modular component structure with reusable components
- Comprehensive error handling and logging

**What I Implemented:**
- ✅ **TypeScript Integration**: Full type safety across frontend and mobile apps
- ✅ **Modular Architecture**: Separate services for RAG, stock data, and web search
- ✅ **Error Handling**: Comprehensive error handling with user-friendly messages
- ✅ **Code Organization**: Clear file structure with logical separation of concerns
- ✅ **Documentation**: Inline comments and clear function documentation

**Reflection & Next Steps:**
The codebase is well-structured and maintainable. Future improvements could include unit tests, integration tests, and automated code quality checks. The modular design makes it easy to add new features or modify existing ones.

### **UI/UX Look & Feel: Interface Cleanliness, Responsiveness, and Usability** ✅

**What I Planned:**
- Modern, clean interface with intuitive navigation
- Responsive design that works on all devices
- Clear visual feedback for user actions
- Accessible design with proper contrast and readability

**What I Implemented:**
- ✅ **Modern Design**: Beautiful gradient backgrounds, shadows, and modern styling
- ✅ **Responsive Layout**: Works seamlessly on desktop, tablet, and mobile
- ✅ **Interactive Elements**: Smooth animations, hover effects, and loading states
- ✅ **Visual Feedback**: Service usage indicators, citation highlighting, and status messages
- ✅ **Cross-Platform**: Identical experience on web and mobile with React Native
- ✅ **Accessibility**: Proper contrast ratios, keyboard navigation, and screen reader support

**Reflection & Next Steps:**
The UI/UX exceeded expectations with a professional, modern look. The React Native implementation provides true cross-platform functionality. Future enhancements could include dark/light mode toggle, customizable themes, and advanced accessibility features.

### **Accuracy: Quality and Correctness of Chatbot Answers** ✅

**What I Planned:**
- RAG system with accurate document retrieval
- Citation system for source verification
- Fallback mechanisms for unanswered questions
- Context-aware responses with memory

**What I Implemented:**
- ✅ **Advanced RAG System**: Dual-mode RAG with normal (document-only) and advanced (document + stock + web search)
- ✅ **Citation System**: Color-coded citations linking to source documents, stock data, and web search results
- ✅ **Multi-Source Answers**: Combines document knowledge with real-time stock data and web search
- ✅ **Context Memory**: Maintains conversation context across follow-up questions
- ✅ **Quality Indicators**: Service badges show which sources were used for each answer
- ✅ **Fallback Mechanisms**: Web search automatically triggered when document knowledge is insufficient

**Reflection & Next Steps:**
The accuracy is significantly improved by the multi-source approach. The citation system allows users to verify information sources. Future improvements could include answer confidence scoring, fact-checking integration, and user feedback mechanisms for answer quality.

### **Bonus Features & Extensions** ✅

**What I Planned:**
- React Native mobile app
- Stock data integration
- Web search capabilities
- Memory and context management
- Performance optimizations

**What I Implemented:**
- ✅ **React Native Mobile App**: Full feature parity with web version, native mobile experience
- ✅ **Real-Time Stock Data**: Polygon.io integration with automatic ticker detection
- ✅ **Web Search Integration**: SerpAPI integration for fallback answers
- ✅ **Redis Caching**: Prompt caching for improved performance
- ✅ **Session Management**: Multi-session support with localStorage persistence
- ✅ **RAG Mode Toggle**: Switch between basic and advanced modes

**Reflection & Next Steps:**
All planned bonus features were successfully implemented. The mobile app provides a seamless cross-platform experience. Future enhancements could include voice input, push notifications, offline support, and advanced analytics.

### **Technical Architecture Decisions** ✅

**Why Python LLM Service + Node.js API Gateway:**
- ✅ **Python's LangChain Ecosystem**: More mature and feature-complete than JavaScript alternatives
- ✅ **Optimization Benefits**: Leverage Python-specific optimizations (quantization, GPU support) without compromising Node.js performance
- ✅ **Service Isolation**: Keep AI/ML logic separate from business rules and routing
- ✅ **Scalability**: Python service can be optimized independently for AI workloads

**What I Achieved:**
- ✅ **Clean Separation**: Python handles all AI operations, Node.js handles API routing and caching
- ✅ **Performance**: Redis caching layer reduces API calls and improves response times
- ✅ **Maintainability**: Clear boundaries between services make debugging and updates easier
- ✅ **Extensibility**: Easy to add new AI services or modify existing ones without affecting the API layer

This architecture proved to be the right choice for this project, providing the best of both worlds: Python's AI capabilities and Node.js's web development strengths. 
