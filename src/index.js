import dotenv from "dotenv";
import { app } from "./app.js";
import connectDb from "./db/index.db.js";

dotenv.config();

const port = process.env.PORT || 8000;

// Add error handling
process.on('unhandledRejection', (reason, promise) => {
	console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
	process.exit(1);
});

process.on('uncaughtException', (error) => {
	console.error('❌ Uncaught Exception:', error);
	process.exit(1);
});

connectDb()
	.then(() => {
		const server = app.listen(port, () => {
			console.log(`🚀 App is running at http://localhost:${port}`);
		});
		
		server.on('error', (error) => {
			console.error('❌ Server error:', error);
		});
	})
	.catch((error) => {
		console.log("❌ DB connection failed {index.js} error:", error);
	});
