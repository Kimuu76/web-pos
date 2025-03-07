/** @format */

require("dotenv").config();
const { Sequelize, DataTypes } = require("sequelize");

// Initialize Sequelize with environment variables or defaults
const sequelize = new Sequelize(
	process.env.DB_NAME || "kimuu",
	process.env.DB_USER || "kimuu76",
	process.env.DB_PASSWORD || "Bett7544@",
	{
		host: process.env.DB_HOST || "mysql-193713-0.cloudclusters.net",
		dialect: "mysql",
		port: process.env.DB_PORT || 10050,
		logging: false,
	}
);

// Import models
const Product = require("./Product")(sequelize, DataTypes);
const Purchase = require("./Purchases")(sequelize, DataTypes);
const Sales = require("./Sales")(sequelize, DataTypes);
const SalesReturns = require("./SalesReturns")(sequelize, DataTypes);
const PurchaseReturns = require("./PurchaseReturns")(sequelize, DataTypes);
const Supplier = require("./Supplier")(sequelize, DataTypes);
const Company = require("./Company")(sequelize, DataTypes);

// ✅ Define relationships
Product.hasMany(Sales, { foreignKey: "productId", onDelete: "CASCADE" });
Sales.belongsTo(Product, { foreignKey: "productId" });

Product.hasMany(Purchase, { foreignKey: "productId", onDelete: "CASCADE" });
Purchase.belongsTo(Product, { foreignKey: "productId" });

Product.hasMany(SalesReturns, { foreignKey: "productId", onDelete: "CASCADE" });
SalesReturns.belongsTo(Product, { foreignKey: "productId" });

Product.hasMany(PurchaseReturns, {
	foreignKey: "productId",
	onDelete: "CASCADE",
});
PurchaseReturns.belongsTo(Product, { foreignKey: "productId" });

Supplier.hasMany(Purchase, { foreignKey: "supplierId", onDelete: "CASCADE" });
Purchase.belongsTo(Supplier, { foreignKey: "supplierId" });

// Export models and sequelize instance
module.exports = {
	Sales,
	Product,
	Purchase,
	Supplier,
	SalesReturns,
	PurchaseReturns,
	Company,
	sequelize,
};
