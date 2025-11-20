import dotenv from 'dotenv';
import { app } from '../src/app.js';

// Load environment variables
dotenv.config();

// Vercel serverless function handler
export default app;

// For local development compatibility
if (process.env.NODE_ENV !== 'production') {
	const port = process.env.PORT || 8000;
	app.listen(port, () => {
		console.log(`🚀 Local server running at http://localhost:${port}`);
	});
}