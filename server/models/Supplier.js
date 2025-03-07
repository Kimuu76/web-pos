/** @format */

module.exports = (sequelize, DataTypes) => {
	const Supplier = sequelize.define(
		"Supplier",
		{
			id: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				autoIncrement: true,
			},
			name: {
				type: DataTypes.STRING,
				allowNull: false,
				unique: true, // Ensures supplier names are unique
				validate: {
					len: [3, 255], // Ensures the name length is reasonable
				},
			},
			contact: {
				type: DataTypes.STRING,
				allowNull: false,
				validate: {
					is: /^[0-9]+$/i, // Ensures the contact contains only digits (e.g., phone number validation)
				},
			},
			address: {
				type: DataTypes.STRING,
				allowNull: false,
				validate: {
					len: [10, 255], // Ensures the address is of reasonable length
				},
			},
		},
		{
			tableName: "Suppliers", // Ensures the table name is pluralized
			timestamps: true, // Adds createdAt & updatedAt for better record tracking
		}
	);
	return Supplier;
};
