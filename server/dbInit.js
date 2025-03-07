/** @format */

const sequelize = require("./database"); // Import MySQL connection
require("./models"); // Ensure models are loaded before syncing

const initDB = async () => {
	try {
		await sequelize.sync({ force: true }); // 🔄 Force sync (drops & recreates tables)
		console.log("✅ MySQL Database initialized successfully!");
	} catch (error) {
		console.error("❌ DB Initialization Error:", error);
	} finally {
		await sequelize.close(); // Close connection after initialization
	}
};

initDB();
