/** @format */

require("dotenv").config(); // Load environment variables
const { Sequelize } = require("sequelize");

// Initialize Sequelize first
const sequelize = new Sequelize(
	process.env.DB_NAME || "kimuu",
	process.env.DB_USER || "kimuu76",
	process.env.DB_PASSWORD || "Bett7544@",
	{
		host: process.env.DB_HOST || "mysql-193713-0.cloudclusters.net",
		dialect: "mysql",
		port: process.env.DB_PORT || 10050,
		logging: false,
		define: {
			freezeTableName: false, // ✅ Ensures Sequelize uses pluralized table names
		},
		dialectOptions: {
			// SSL options (if needed)
		},
	}
);

// Import models **after** defining Sequelize
require("./models");

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

// Test the database connection
sequelize
	.authenticate()
	.then(() => {
		console.log("✅ Database connection successful.");
		initDB(); // Start DB initialization after connection is established
	})
	.catch((error) => {
		console.error("❌ Unable to connect to the database:", error);
	});

module.exports = sequelize;

/** @format 

require("dotenv").config(); // Load environment variables
const { Sequelize } = require("sequelize");
require("./models");

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

const sequelize = new Sequelize(
	process.env.DB_NAME || "kimuu",
	process.env.DB_USER || "kimuu76",
	process.env.DB_PASSWORD || "Bett7544@",
	{
		host: process.env.DB_HOST || "mysql-193713-0.cloudclusters.net",
		dialect: "mysql",
		port: process.env.DB_PORT || 10050,
		logging: false,
		define: {
			freezeTableName: false, // ✅ Ensures Sequelize uses pluralized table names
		},
		dialectOptions: {
			// SSL options (if needed)
		},
	}
);

// Test the connection to ensure it works
sequelize
	.authenticate()
	.then(() => {
		console.log("Database connection successful.");
	})
	.catch((error) => {
		console.error("Unable to connect to the database:", error);
	});

(module.exports = sequelize), initDB();*/
