/** @format */

module.exports = (sequelize, DataTypes) => {
	const SalesReturns = sequelize.define(
		"SalesReturns",
		{
			id: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				autoIncrement: true,
			},
			saleId: {
				type: DataTypes.INTEGER,
				allowNull: false,
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
			quantity: {
				type: DataTypes.INTEGER,
				allowNull: false,
				validate: {
					min: 1, // ✅ Ensures quantity is always greater than zero
				},
			},
			refundAmount: {
				type: DataTypes.DECIMAL(10, 2),
				allowNull: false,
				defaultValue: 0.0,
			},
		},
		{
			tableName: "SalesReturns",
			timestamps: true,
		}
	);

	return SalesReturns;
};

/** @format 

const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const SalesReturns = sequelize.define(
	"SalesReturns",
	{
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		saleId: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		productId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: "Products", // Ensures that the foreign key is correctly linked
				key: "id",
			},
			onDelete: "CASCADE", // Ensures related returns are deleted when the associated sale is deleted
		},
		quantity: {
			type: DataTypes.INTEGER,
			allowNull: false,
			validate: {
				min: 1, // Prevents negative or zero returns
			},
		},
		refundAmount: {
			type: DataTypes.DECIMAL(10, 2), // More precise for currency values
			allowNull: false,
			defaultValue: 0.0, // Prevents NULL values
		},
	},
	{
		tableName: "SalesReturns", // Ensures the table name is pluralized
		timestamps: true, // Adds createdAt & updatedAt for better tracking
	}
);

module.exports = SalesReturns;*/
