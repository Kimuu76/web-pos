/** @format */

module.exports = (sequelize, DataTypes) => {
	const Product = sequelize.define(
		"Product",
		{
			id: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				autoIncrement: true,
			},
			name: {
				type: DataTypes.STRING,
				allowNull: false,
				unique: true,
			},
			purchasePrice: {
				type: DataTypes.DECIMAL(10, 2),
				allowNull: false,
				defaultValue: 0.0,
			},
			sellingPrice: {
				type: DataTypes.DECIMAL(10, 2),
				allowNull: false,
				defaultValue: 0.0,
			},
			stock: {
				type: DataTypes.INTEGER,
				allowNull: false,
				defaultValue: 0,
			},
		},
		{
			tableName: "Products",
			timestamps: true,
		}
	);

	return Product; // ✅ Return the model
};

/** @format 

const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const Product = sequelize.define(
	"Product",
	{
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true, // ✅ Primary Key
			autoIncrement: true, // ✅ Auto Increment
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true, // ✅ Ensures unique product names
		},
		purchasePrice: {
			type: DataTypes.DECIMAL(10, 2), // ✅ More precise for money values
			allowNull: false,
			defaultValue: 0.0, // ✅ Prevent null values
		},
		sellingPrice: {
			type: DataTypes.DECIMAL(10, 2),
			allowNull: false,
			defaultValue: 0.0,
		},
		stock: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 0, // ✅ Ensures stock starts from 0 if not provided
		},
	},
	{
		tableName: "Products", // ✅ Explicitly set the table name to be plural
		timestamps: true, // ✅ Adds createdAt & updatedAt columns
	}
);

module.exports = Product;*/
