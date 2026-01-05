import dotenv from "dotenv";

dotenv.config();

// Cashfree SDK v5 Configuration
export const cashfreeConfig = {
	clientId: process.env.CASHFREE_APP_ID,
	clientSecret: process.env.CASHFREE_SECRET_KEY,
	environment: process.env.CASHFREE_ENV || "production",
};

export default cashfreeConfig;
