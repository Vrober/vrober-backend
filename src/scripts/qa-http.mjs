import "dotenv/config";
const BASE = process.env.BASE_URL || "http://localhost:8000/api/v1";

async function main() {
	try {
		const health = await fetch(
			`${BASE.replace(/\/api\/v1$/, "")}/api/v1/health`
		).then((r) => r.json());
		console.log("Health:", health);
	} catch (e) {
		console.error("Health check failed:", e.message);
	}

	try {
		const sections = await fetch(`${BASE}/services/home-sections`).then((r) =>
			r.json()
		);
		console.log("Home Sections keys:", Object.keys(sections));
		console.log(
			"popular:",
			sections.popular?.length || 0,
			"premium:",
			sections.premium?.length || 0,
			"mostBooked:",
			sections.mostBooked?.length || 0
		);
	} catch (e) {
		console.error("Home sections failed:", e.message);
	}

	try {
		const cats = await fetch(`${BASE}/services/categories`).then((r) =>
			r.json()
		);
		console.log("Categories:", cats.categories || cats);
	} catch (e) {
		console.error("Categories failed:", e.message);
	}
}

main();
