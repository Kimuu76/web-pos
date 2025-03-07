/** @format */

module.exports = (sequelize, DataTypes) => {
	const PurchaseReturns = sequelize.define(
		"PurchaseReturns",
		{
			id: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				autoIncrement: true,
			},
			purchaseId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			productId: {
				type: DataTypes.INTEGER,
				allowNull: false,
				references: {
					model: "Products", // ✅ Ensure model name is a string
					key: "id",
				},
				onDelete: "CASCADE",
			},
			quantity: {
				type: DataTypes.INTEGER,
				allowNull: false,
				validate: {
					min: 1,
				},
			},
			reason: {
				type: DataTypes.STRING,
				allowNull: false,
				validate: {
					len: [3, 255],
				},
			},
			refundAmount: {
				type: DataTypes.DECIMAL(10, 2),
				allowNull: false,
				defaultValue: 0.0,
			},
		},
		{
			tableName: "PurchaseReturns",
			timestamps: true,
		}
	);

	return PurchaseReturns;
};

/** @format 

const { DataTypes } = require("sequelize");
const sequelize = require("../database");
const Product = require("./Product");

const PurchaseReturns = sequelize.define(
	"PurchaseReturns",
	{
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		purchaseId: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		productId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: Product, // ✅ Enforces Foreign Key constraint
				key: "id",
			},
			onDelete: "CASCADE", // ✅ Ensures related returns are deleted when a product is removed
		},
		quantity: {
			type: DataTypes.INTEGER,
			allowNull: false,
			validate: {
				min: 1, // ✅ Prevents negative or zero quantity
			},
		},
		reason: {
			type: DataTypes.STRING,
			allowNull: false,
			validate: {
				len: [3, 255], // ✅ Ensures a reasonable reason length
			},
		},
		refundAmount: {
			type: DataTypes.DECIMAL(10, 2), // ✅ More precise for currency values
			allowNull: false,
			defaultValue: 0.0, // ✅ Prevents NULL issues
		},
	},
	{
		tableName: "PurchaseReturns", // ✅ Explicitly set plural table name
		timestamps: true, // ✅ Includes createdAt & updatedAt
	}
);

// ✅ Establish association
PurchaseReturns.belongsTo(Product, { foreignKey: "productId" });

module.exports = PurchaseReturns;*/
