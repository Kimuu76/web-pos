/** @format */

module.exports = (sequelize, DataTypes) => {
	const Sales = sequelize.define(
		"Sales",
		{
			id: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				autoIncrement: true,
			},
			productId: {
				type: DataTypes.INTEGER,
				allowNull: false,
				references: {
					model: "Products", // ✅ Use table name as a string
					key: "id",
				},
				onDelete: "CASCADE",
			},
			productName: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			quantity: {
				type: DataTypes.INTEGER,
				allowNull: false,
				validate: {
					min: 1, // ✅ Ensures quantity is always greater than zero
				},
			},
			sellingPricePerUnit: {
				type: DataTypes.DECIMAL(10, 2), // ✅ More precise for financial values
				allowNull: false,
				defaultValue: 0.0, // ✅ Prevents NULL values
			},
			totalAmount: {
				type: DataTypes.DECIMAL(10, 2), // ✅ More precise for financial values
				allowNull: false,
				defaultValue: 0.0, // ✅ Prevents NULL values
			},
		},
		{
			tableName: "Sales",
			timestamps: true,
		}
	);

	return Sales;
};

/** @format 

const { DataTypes } = require("sequelize");
const sequelize = require("../database");
const Product = require("./Product");

const Sales = sequelize.define(
	"Sales",
	{
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		productId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: Product,
				key: "id",
			},
			onDelete: "CASCADE", // ✅ Deletes associated sales when a product is deleted
		},
		productName: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		quantity: {
			type: DataTypes.INTEGER,
			allowNull: false,
			validate: {
				min: 1, // ✅ Ensures quantity is always greater than zero
			},
		},
		sellingPricePerUnit: {
			type: DataTypes.DECIMAL(10, 2), // ✅ More precise for financial values
			allowNull: false,
			defaultValue: 0.0, // ✅ Prevents NULL values
		},
		totalAmount: {
			type: DataTypes.DECIMAL(10, 2), // ✅ More precise for financial values
			allowNull: false,
			defaultValue: 0.0, // ✅ Prevents NULL values
		},
	},
	{
		tableName: "Sales", // ✅ Explicitly set the plural table name
		timestamps: true, // ✅ Adds createdAt & updatedAt
	}
);

Sales.belongsTo(Product, { foreignKey: "productId" }); // ✅ Sales belongs to a product

module.exports = Sales;*/
