// Minimal test server to debug the issue
import express from 'express';

const app = express();
const port = 8000;

app.use(express.json());

app.get('/test', (req, res) => {
  res.json({ message: 'Test server working' });
});

try {
  app.listen(port, () => {
    console.log(`✅ Test server running on http://localhost:${port}`);
  });
  
  // Add error handling
  process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
  });
  
  process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
  });
  
} catch (error) {
  console.error('❌ Server startup error:', error);
}