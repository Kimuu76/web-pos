/** @format */

module.exports = (sequelize, DataTypes) => {
	const Purchase = sequelize.define(
		"Purchase",
		{
			id: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				autoIncrement: true,
			},
			// 🔥 Ensure the foreign key matches `Products.id` type
			productId: {
				type: DataTypes.INTEGER,
				allowNull: false,
				references: {
					model: "Products", // ✅ Use table name as a string
					key: "id",
				},
				onDelete: "CASCADE",
			},
			// ✅ Foreign key constraint for supplierId
			supplierId: {
				type: DataTypes.INTEGER,
				allowNull: false,
				references: {
					model: "Suppliers", // ✅ Use table name as a string
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
			pricePerUnit: {
				type: DataTypes.DECIMAL(10, 2),
				allowNull: false,
				defaultValue: 0.0,
			},
			totalAmount: {
				type: DataTypes.DECIMAL(10, 2),
				allowNull: false,
				defaultValue: 0.0,
			},
		},
		{
			tableName: "Purchases",
			timestamps: true,
		}
	);

	return Purchase;
};

/** @format 

const { DataTypes } = require("sequelize");
const sequelize = require("../database");
const Product = require("./Product");
const Supplier = require("./Supplier");

const Purchase = sequelize.define(
	"Purchase",
	{
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		// 🔥 Ensure the foreign key matches `Products.id` type
		productId: {
			type: DataTypes.INTEGER, // ✅ Change from STRING to INTEGER if Products.id is INTEGER
			allowNull: false,
			references: {
				model: Product,
				key: "id",
			},
			onDelete: "CASCADE", // ✅ Ensures related purchases are deleted when a product is removed
		},
		// ✅ Foreign key constraint for supplierId
		supplierId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: Supplier,
				key: "id",
			},
			onDelete: "CASCADE",
		},
		quantity: {
			type: DataTypes.INTEGER,
			allowNull: false,
			validate: {
				min: 1, // ✅ Prevents negative or zero quantity
			},
		},
		pricePerUnit: {
			type: DataTypes.DECIMAL(10, 2), // ✅ More precise for financial values
			allowNull: false,
			defaultValue: 0.0, // ✅ Prevents null
		},
		totalAmount: {
			type: DataTypes.DECIMAL(10, 2), // ✅ More precise for financial values
			allowNull: false,
			defaultValue: 0.0, // ✅ Prevents null
		},
	},
	{
		tableName: "Purchases", // ✅ Explicitly set the plural table name
		timestamps: true, // ✅ Includes createdAt & updatedAt
	}
);

// ✅ Define Associations
Purchase.belongsTo(Product, { foreignKey: "productId" });
Purchase.belongsTo(Supplier, { foreignKey: "supplierId" });

module.exports = Purchase;*/
