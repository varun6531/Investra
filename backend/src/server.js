const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cacheMiddleware = require('./middleware/cache');

const app = express();
const SERVER_PORT = 3000;
const CORS_ORIGIN = 5173;
const LLM_SERVICE_URL = 'http://localhost:8000';

app.use((req, res, next) => {
  const startTime = Date.now();

  const originalJson = res.json;
  const originalSend = res.send;
  
  res.json = function(body) {
    return originalJson.call(this, body);
  };
  
  res.send = function(body) {
    return originalSend.call(this, body);
  };
  
  next();
});

app.use(cors({
    origin: `http://localhost:${CORS_ORIGIN}`,
    credentials: true
}));
app.use(express.json());

app.post('/api/chat', cacheMiddleware, async (req, res) => {
  try {
    const { query, chat_history = [], session_id } = req.body;
    
    console.log(`[${new Date().toISOString()}] Forwarding advanced chat request to LLM service`);
    
    const llmResponse = await axios.post(`${LLM_SERVICE_URL}/chat`, {
      query: query,
      chat_history: chat_history,
      session_id: session_id
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`[${new Date().toISOString()}] Received response from LLM service`);
    
    res.json({
      answer: llmResponse.data.answer,
      sources: llmResponse.data.sources || [],
      timestamp: llmResponse.data.timestamp || new Date().toISOString(),
      document_loaded: llmResponse.data.document_loaded,
      services_used: llmResponse.data.services_used,
      stock_data: llmResponse.data.stock_data,
      web_search_results: llmResponse.data.web_search_results,
      web_search_query: llmResponse.data.web_search_query,
      stock_tickers: llmResponse.data.stock_tickers,
      session_id: llmResponse.data.session_id
    });
    
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in advanced chat endpoint:`, error.message);
    
    if (error.code === 'ECONNREFUSED') {
      res.status(503).json({ 
        error: ' ensure the LLM service is running on port 8000.' 
      });
    } else if (error.response) {
      res.status(error.response.status).json({ 
        error: 'LLM service error' 
      });
    } else if (error.code === 'ETIMEDOUT') {
      res.status(504).json({ 
        error: 'Request to LLM service timed out. Please try again.' 
      });
    } else {
      res.status(500).json({ 
        error: 'Internal server error' 
      });
    }
  }
});

app.post('/api/chat/normal', cacheMiddleware, async (req, res) => {
  try {
    const { query, chat_history = [], session_id } = req.body;
    
    console.log(`[${new Date().toISOString()}] Forwarding normal chat request to LLM service`);
    
    const llmResponse = await axios.post(`${LLM_SERVICE_URL}/chat/normal`, {
      query: query,
      chat_history: chat_history,
      session_id: session_id
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`[${new Date().toISOString()}] Received response from LLM service`);
    
    // Return the LLM service response with all fields
    res.json({
      answer: llmResponse.data.answer,
      sources: llmResponse.data.sources || [],
      timestamp: llmResponse.data.timestamp || new Date().toISOString(),
      document_loaded: llmResponse.data.document_loaded,
      services_used: llmResponse.data.services_used,
      stock_data: llmResponse.data.stock_data,
      web_search_results: llmResponse.data.web_search_results,
      web_search_query: llmResponse.data.web_search_query,
      stock_tickers: llmResponse.data.stock_tickers,
      session_id: llmResponse.data.session_id
    });
    
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in normal chat endpoint:`, error.message);
    
    if (error.code === 'ECONNREFUSED') {
      res.status(503).json({ 
        error: ' ensure the LLM service is running on port 8000.' 
      });
    } else if (error.response) {
      res.status(error.response.status).json({ 
        error: 'LLM service error' 
      });
    } else if (error.code === 'ETIMEDOUT') {
      res.status(504).json({ 
        error: 'Request to LLM service timed out. Please try again.' 
      });
    } else {
      res.status(500).json({ 
        error: 'Internal server error' 
      });
    }
  }
});

app.listen(SERVER_PORT, () => {
  console.log(`Backend server running on http://localhost:${SERVER_PORT}`);
  console.log(`LLM service URL: ${LLM_SERVICE_URL}`);
});
