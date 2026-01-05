import jwt from "jsonwebtoken";

// Verify JWT from Authorization header or httpOnly cookie
export const verifyJWT = (roles = []) => {
	// roles can be string or array
	const allowedRoles = Array.isArray(roles) ? roles : roles ? [roles] : [];

	return (req, res, next) => {
		try {
			const authHeader = req.headers.authorization || req.headers.Authorization;
			const tokenFromHeader =
				authHeader && authHeader.startsWith("Bearer ")
					? authHeader.split(" ")[1]
					: null;
			const tokenFromCookie = req.cookies?.accessToken;
			const token = tokenFromHeader || tokenFromCookie;

			console.log('JWT verification:', {
				hasAuthHeader: !!authHeader,
				hasTokenFromHeader: !!tokenFromHeader,
				hasTokenFromCookie: !!tokenFromCookie,
				tokenExists: !!token
			});

			if (!token) {
				console.error('No token provided');
				return res
					.status(401)
					.json({ message: "Unauthorized: No token provided" });
			}

			const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
			// attach user info
			req.user = {
				_id: decoded._id,
				role: decoded.role,
				email: decoded.email,
				mobileNo: decoded.mobileNo,
			};

			console.log('JWT verified successfully for user:', decoded._id);

			// Role check if provided
			if (allowedRoles.length > 0 && !allowedRoles.includes(decoded.role)) {
				return res
					.status(403)
					.json({ message: "Forbidden: Insufficient role" });
			}

			next();
		} catch (err) {
			console.error('JWT verification error:', err.message);
			return res.status(401).json({ message: "Unauthorized: Invalid token" });
		}
	};
};
