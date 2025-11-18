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

			if (!token) {
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

			// Role check if provided
			if (allowedRoles.length > 0 && !allowedRoles.includes(decoded.role)) {
				return res
					.status(403)
					.json({ message: "Forbidden: Insufficient role" });
			}

			next();
		} catch (err) {
			return res.status(401).json({ message: "Unauthorized: Invalid token" });
		}
	};
};
