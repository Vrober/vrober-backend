/**
 * Location Controller
 * Handles reverse geocoding and location-based queries
 */

// Reverse geocode coordinates to city/state using OpenStreetMap Nominatim
export async function reverseGeocode(req, res) {
	try {
		const { lat, lng } = req.query;

		if (!lat || !lng) {
			return res.status(400).json({ message: "Latitude and longitude required" });
		}

		// Call Nominatim API from backend (more reliable than frontend)
		const response = await fetch(
			`https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&accept-language=en&zoom=18&lat=${lat}&lon=${lng}`,
			{
				headers: {
					"User-Agent": "Vrober-Service-App/1.0",
				},
			}
		);

		if (!response.ok) {
			throw new Error(`Nominatim API error: ${response.status}`);
		}

		const data = await response.json();

		// Extract address components for full locality
		const address = data.address || {};
		const city = address.city || address.town || address.village || address.county || "Unknown";
		const state = address.state || "";
		const stateCode = state
			? state
					.split(" ")
					.map((w) => w[0])
					.join("")
					.substring(0, 2)
					.toUpperCase()
			: "";

		// Build full locality string using road + area + city + full state
		const area = address.suburb || address.neighbourhood || address.locality || address.quarter || "";
		const road = [address.house_number, address.road].filter(Boolean).join(" ") || address.road || "";

		// Prefer full state name for user clarity
		const stateFull = address.state || "";

		const prefixParts = [road, area].filter(Boolean);
		const cityState = [city, stateFull].filter(Boolean).join(", ");
		const parts = [...prefixParts, cityState].filter(Boolean);
		const locationText = parts.join(" - ");

		res.status(200).json({
			location: locationText,
			city,
			state: stateFull,
			locality: area,
			address: data.address || {},
		});
	} catch (error) {
		console.error("Reverse geocoding error:", error);
		res.status(500).json({
			message: "Failed to reverse geocode location",
			error: error.message,
		});
	}
}

// Get user location from IP (fallback option)
export async function getUserLocationFromIP(req, res) {
	try {
		// Get IP from request headers (works with most CDNs)
		const ip =
			req.headers["x-forwarded-for"]?.split(",")[0] ||
			req.headers["x-real-ip"] ||
			req.socket.remoteAddress;

		if (!ip) {
			return res.status(400).json({ message: "Unable to determine IP address" });
		}

		// Use ip-api.com (free, no key required for basic usage)
		const response = await fetch(`http://ip-api.com/json/${ip}?fields=city,regionName,countryCode`);

		if (!response.ok) {
			throw new Error(`IP-API error: ${response.status}`);
		}

		const data = await response.json();

		if (data.status !== "success") {
			throw new Error("IP lookup failed");
		}

		// Format: "City, ST" (e.g., "Ranchi, JH")
		const state = data.regionName
			?.split(" ")
			.map((w) => w[0])
			.join("")
			.substring(0, 2)
			.toUpperCase() || "";

		const locationText = state ? `${data.city}, ${state}` : data.city;

		res.status(200).json({
			location: locationText,
			city: data.city,
			state,
		});
	} catch (error) {
		console.error("IP-based location lookup error:", error);
		res.status(500).json({
			message: "Failed to determine location from IP",
			error: error.message,
		});
	}
}
