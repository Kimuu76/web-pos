/** @format */

require("dotenv").config(); // Load environment variables from .env

const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");
const { Sequelize } = require("sequelize");
const sequelize = require("./database");
const { Op } = require("sequelize");
const moment = require("moment");
const models = require("./models");
const { Product } = require("./models");
const { Purchase } = require("./models");
const { Supplier } = require("./models");
const { Sales } = require("./models");
const { SalesReturns } = require("./models");
const { PurchaseReturns } = require("./models");
const { Company } = require("./models");

dotenv.config();
const app = express();

app.use(
	cors({
		origin: "https://web-pos-1.onrender.com",
		methods: ["GET", "POST", "PUT", "DELETE"],
		credentials: true, // Allow cookies
		allowedHeaders: ["Content-Type", "Authorization"], // Make sure Authorization is allowed
	})
);
app.use(express.json());

// Test API
app.get("/", (req, res) => {
	res.send("POS System API is running!");
});

// ✅ 1. Get Company Details (Check if setup exists)
app.get("/company", async (req, res) => {
	try {
		const company = await Company.findOne();
		if (!company) {
			return res.status(404).json({ error: "No company setup found." });
		}
		res.json(company);
	} catch (error) {
		console.error("Error fetching company setup:", error);
		res.status(500).json({ error: "Failed to fetch company setup." });
	}
});

// ✅ Setup Company (Save Name & Encrypted Secret Key)

app.post("/setup", async (req, res) => {
	try {
		console.log("Received Setup Data:", req.body); // ✅ Debugging

		const { companyName, secretKey } = req.body;

		// Prevent duplicate setup
		const existingCompany = await Company.findOne();
		if (existingCompany) {
			return res.status(400).json({ error: "Company setup already exists." });
		}

		// ✅ Validate input
		if (!companyName || !secretKey) {
			return res
				.status(400)
				.json({ error: "Company Name and Secret Key are required!" });
		}

		// ✅ Hash the secret key before storing
		//const hashedKey = await bcrypt.hash(secretKey, 10);

		// ✅ Store company details
		const company = await Company.create({ name: companyName, secretKey });

		res.json({ message: "Company setup successful!", company });
	} catch (error) {
		console.error("Setup Error:", error);
		res.status(500).json({ error: "Failed to setup company!" });
	}
});

app.get("/setup", async (req, res) => {
	res.send("Setup endpoint is working!");
});

// ✅ Login with Secret Key
app.post("/login", async (req, res) => {
	try {
		const { secretKey } = req.body;

		// ✅ Fetch stored company details
		const company = await Company.findOne();
		if (!company)
			return res.status(404).json({ error: "No company setup found!" });

		// ✅ Check if secret key matches the stored key
		if (secretKey !== company.secretKey) {
			return res.status(401).json({ error: "Invalid Secret Key!" });
		}

		res.json({ message: "Login successful!", company });
	} catch (error) {
		console.error("Login Error:", error);
		res.status(500).json({ error: "Failed to login!" });
	}
});

// Get all products
app.get("/products", async (req, res) => {
	const products = await Product.findAll();
	res.json(products);
});

// Add a new product
app.post("/products", async (req, res) => {
	try {
		const { name, stock } = req.body;

		if (!name) {
			return res.status(400).json({ error: "Product name is required!" });
		}

		const product = await Product.create({
			name,
			stock: stock || 0, // Default stock to 0 if not provided
			purchasePrice: 0, // ✅ Default purchase price
			sellingPrice: 0, // ✅ Default selling price
		});

		res.json({ message: "Product added successfully!", product });
	} catch (error) {
		console.error("Error adding product:", error);
		res.status(500).json({ error: "Failed to add product." });
	}
});

/*app.post("/products", async (req, res) => {
	const { name, price, stock } = req.body;
	const product = await Product.create({ name, price, stock });
	res.json(product);
});*/

// Delete a product
app.delete("/products/:id", async (req, res) => {
	try {
		const { id } = req.params;

		// ✅ Check if the product exists
		const product = await Product.findByPk(id);
		if (!product) {
			return res.status(404).json({ error: "Product not found!" });
		}

		// ✅ Fetch related records
		const relatedSales = await Sales.findAll({ where: { productId: id } });
		const relatedSalesReturns = await SalesReturns.findAll({
			where: { productId: id },
		});
		const relatedPurchases = await Purchase.findAll({
			where: { productId: id },
		});
		const relatedPurchaseReturns = await PurchaseReturns.findAll({
			where: { productId: id },
		});

		// ✅ If related records exist, send them to the frontend
		if (
			relatedSales.length ||
			relatedSalesReturns.length ||
			relatedPurchases.length ||
			relatedPurchaseReturns.length
		) {
			return res.status(400).json({
				error: "Cannot delete product. Related records exist!",
				relatedRecords: {
					sales: relatedSales,
					salesReturns: relatedSalesReturns,
					purchases: relatedPurchases,
					purchaseReturns: relatedPurchaseReturns,
				},
			});
		}

		// ✅ If no related records, delete the product
		await product.destroy();
		res.json({ message: "Product deleted successfully!" });
	} catch (error) {
		console.error("Error deleting product:", error);
		res.status(500).json({ error: "Failed to delete product!" });
	}
});

// Get all sales
app.get("/sales", async (req, res) => {
	try {
		const sales = await Sales.findAll({
			include: [
				{
					model: Product,
					attributes: ["name", "purchasePrice"], // ✅ Include product name & purchase price
				},
			],
			attributes: ["id", "quantity", "sellingPricePerUnit", "totalAmount"],
		});

		// ✅ Format response to include product name and purchase price
		const formattedSales = sales.map((sale) => ({
			id: sale.id,
			productName: sale.Product ? sale.Product.name : "Unknown",
			quantity: sale.quantity,
			sellingPricePerUnit: sale.sellingPricePerUnit,
			totalAmount: sale.totalAmount,
			purchasePrice: sale.Product ? sale.Product.purchasePrice : 0, // ✅ Include purchase price
			profit:
				(sale.sellingPricePerUnit -
					(sale.Purchase ? sale.Purchase.pricePerUnit : 0)) *
				sale.quantity,
		}));

		res.json(formattedSales);
	} catch (error) {
		console.error("Error fetching sales:", error);
		res.status(500).json({ error: "Failed to fetch sales" });
	}
});

const generateReceipt = (sale) => {
	return {
		receiptNumber: `RCPT-${Date.now()}`,
		date: new Date().toLocaleString(),
		items: [
			{
				productName: product?.name || "Unknown Product",
				quantity: sale.quantity,
				pricePerUnit: sale.totalAmount / sale.quantity || 0,
				total: sale.totalAmount,
			},
		],
		totalAmount: sale.totalAmount,
	};
};

// Add a sale

//add sale
app.post("/sales", async (req, res) => {
	try {
		const { items } = req.body; // ✅ Now receiving multiple products

		if (!items || !Array.isArray(items) || items.length === 0) {
			return res
				.status(400)
				.json({ error: "⚠️ No products selected for sale!" });
		}

		let totalAmount = 0;
		let receiptItems = [];

		// ✅ Loop through each product in the sale
		for (const item of items) {
			const { productId, quantity } = item;

			// ✅ Check if product exists
			const product = await Product.findByPk(productId);
			if (!product) {
				return res
					.status(404)
					.json({ error: `⚠️ Product not found: ${productId}` });
			}

			// ✅ Ensure selling price is set
			if (!product.sellingPrice || product.sellingPrice <= 0) {
				return res
					.status(400)
					.json({ error: `⚠️ Selling price not set for ${product.name}` });
			}

			// ✅ Ensure enough stock
			if (product.stock < quantity) {
				return res.status(400).json({
					error: `⚠️ Not enough stock for ${product.name}! Available: ${product.stock}`,
				});
			}

			// ✅ Calculate total for this item
			const itemTotal = quantity * product.sellingPrice;
			totalAmount += itemTotal;

			// ✅ Save sale in the database
			await Sales.create({
				productId,
				productName: product.name,
				quantity,
				sellingPricePerUnit: product.sellingPrice,
				totalAmount: itemTotal,
			});

			// ✅ Reduce stock
			product.stock -= quantity;
			await product.save();

			// ✅ Add item to receipt
			receiptItems.push({
				productName: product.name,
				quantity,
				pricePerUnit: product.sellingPrice,
				total: itemTotal,
			});
		}

		// ✅ Generate Receipt for All Items
		const receipt = {
			receiptNumber: `RCPT-${Date.now()}`,
			date: new Date().toLocaleString(),
			items: receiptItems,
			totalAmount,
		};

		console.log("🔍 Receipt generated:", receipt);

		// ✅ Send Response
		res.json({ message: "✅ Sale recorded successfully!", receipt });
	} catch (error) {
		console.error("❌ Error processing sale:", error);
		res.status(500).json({ error: "⚠️ Failed to process sale" });
	}
});

//delete sales records
app.delete("/sales/:id", async (req, res) => {
	try {
		const { id } = req.params;

		// Check if sale exists
		const sale = await Sales.findByPk(id);
		if (!sale) {
			return res.status(404).json({ error: "Sale not found" });
		}

		// Delete related records (Sales Returns)
		await SalesReturns.destroy({ where: { saleId: id } });

		// Now delete the sale
		await sale.destroy();

		res.json({ message: "Sale deleted successfully!" });
	} catch (error) {
		console.error("❌ Error deleting sale:", error);
		res.status(500).json({ error: "Failed to delete sale" });
	}
});

//update sales records
app.put("/sales/:id", async (req, res) => {
	try {
		const { id } = req.params;
		const { productId, quantity } = req.body;

		// ✅ Validate input
		if (!productId || !quantity) {
			return res
				.status(400)
				.json({ error: "Product and quantity are required!" });
		}

		// ✅ Find sale & product
		const sale = await Sales.findByPk(id);
		if (!sale) return res.status(404).json({ error: "Sale not found!" });

		const product = await Product.findByPk(productId);
		if (!product) return res.status(404).json({ error: "Product not found!" });

		// ✅ Calculate total amount & adjust stock
		const newTotalAmount = product.price * quantity;
		const quantityDifference = quantity - sale.quantity;
		product.stock -= quantityDifference;
		await product.save();

		// ✅ Update sale
		await sale.update({
			productId,
			productName: product.name,
			quantity,
			totalAmount: newTotalAmount,
		});

		res.json({
			message: "✅ Sale updated successfully!",
			updatedSale: sale, // ✅ Send updated sale data
		});
	} catch (error) {
		console.error("❌ Error updating sale:", error);
		res.status(500).json({ error: "Failed to update sale!" });
	}
});

//purchases

app.post("/purchases", async (req, res) => {
	try {
		const { productId, supplierId, quantity } = req.body;

		// ✅ Validate inputs
		if (!productId || !supplierId || !quantity) {
			return res.status(400).json({ error: "All fields are required!" });
		}

		// ✅ Check if product exists
		const product = await Product.findByPk(productId);
		if (!product) {
			return res.status(404).json({ error: "Product not found!" });
		}

		// ✅ Check if supplier exists
		const supplier = await Supplier.findByPk(supplierId);
		if (!supplier) {
			return res.status(404).json({ error: "Supplier not found!" });
		}

		// ✅ Ensure quantity is a number, not a string
		const newQuantity = parseInt(quantity, 10); // Convert to integer

		if (isNaN(newQuantity) || newQuantity <= 0) {
			return res.status(400).json({ error: "Invalid quantity provided!" });
		}

		// ✅ Calculate total amount
		const totalAmount = newQuantity * product.purchasePrice;

		// ✅ Create purchase
		const purchase = await Purchase.create({
			productId,
			supplierId,
			quantity: newQuantity,
			pricePerUnit: product.purchasePrice,
			totalAmount,
		});

		// ✅ Update stock
		product.stock = (product.stock || 0) + newQuantity;
		await product.save();

		console.log("✅ Purchase recorded successfully!", purchase);
		res.json({ message: "Purchase added successfully!", purchase });
	} catch (error) {
		console.error("Error recording purchase:", error);
		res.status(500).json({ error: "Failed to record purchase" });
	}
});

//Get all purchases
app.get("/purchases", async (req, res) => {
	try {
		console.log("📥 Fetching purchases...");

		const purchases = await Purchase.findAll({
			include: [
				{
					model: Product,
					attributes: ["name", "purchasePrice"], // ✅ Fetch product name
				},
				{
					model: Supplier,
					attributes: ["name"], // ✅ Fetch supplier name
				},
			],
			attributes: ["id", "quantity", "pricePerUnit", "totalAmount"],
		});

		// ✅ Format response data to include product & supplier names
		const formattedPurchases = purchases.map((purchase) => ({
			id: purchase.id,
			productName: purchase.Product ? purchase.Product.name : "Unknown",
			supplierName: purchase.Supplier ? purchase.Supplier.name : "Unknown",
			quantity: purchase.quantity,
			pricePerUnit: purchase.Product ? purchase.Product.price : "N/A",
			totalAmount: purchase.totalAmount,
		}));

		console.log("✅ Purchases Data:", formattedPurchases);
		res.json(formattedPurchases);
	} catch (error) {
		console.error("❌ Error fetching purchases:", error);
		res.status(500).json({ error: "Failed to fetch purchases" });
	}
});

app.delete("/purchases/:id", async (req, res) => {
	try {
		const { id } = req.params;

		// ✅ Check if purchase exists before deleting
		const purchase = await Purchase.findByPk(id);
		if (!purchase) {
			return res.status(404).json({ error: "Purchase not found!" });
		}

		await purchase.destroy(); // ✅ Delete from database
		res.json({ message: "Purchase deleted successfully!" });
	} catch (error) {
		console.error("Error deleting purchase:", error);
		res.status(500).json({ error: "Failed to delete purchase" });
	}
});
// process sale returns
app.post("/sales-returns", async (req, res) => {
	try {
		const { saleId, returnQuantity, reason } = req.body;

		// ✅ Validate inputs
		if (!saleId || !returnQuantity || !reason) {
			return res.status(400).json({ error: "All fields are required!" });
		}

		// ✅ Find the sale
		const sale = await Sales.findByPk(saleId, { include: Product });
		if (!sale) {
			return res.status(404).json({ error: "Sale record not found!" });
		}

		// ✅ Ensure return quantity is valid
		const returnQty = parseInt(returnQuantity, 10);
		if (isNaN(returnQty) || returnQty <= 0 || returnQty > sale.quantity) {
			return res.status(400).json({ error: "Invalid return quantity!" });
		}

		// ✅ Calculate refund amount
		const refundAmount = returnQty * sale.sellingPricePerUnit;

		// ✅ Create the sales return record
		const salesReturn = await SalesReturns.create({
			saleId,
			productId: sale.productId,
			quantity: returnQty,
			refundAmount,
			reason,
		});

		// ✅ Update stock (Add returned items back)
		sale.Product.stock += returnQty;
		await sale.Product.save();

		console.log("✅ Sale return processed:", salesReturn);
		res.json({ message: "Sale return processed successfully!", salesReturn });
	} catch (error) {
		console.error("❌ Error processing sale return:", error);
		res.status(500).json({ error: "Failed to process sale return" });
	}
});

//get sales returns
app.get("/sales-returns", async (req, res) => {
	try {
		const salesReturns = await SalesReturns.findAll({
			include: [
				{
					model: Product,
					attributes: ["name"], // Get product name
				},
			],
		});

		// ✅ Format response properly
		const formattedReturns = salesReturns.map((returnItem) => ({
			id: returnItem.id,
			productName: returnItem.Product ? returnItem.Product.name : "Unknown",
			quantity: returnItem.quantity,
			refundAmount: returnItem.refundAmount,
			reason: returnItem.reason,
			createdAt: returnItem.createdAt,
		}));

		res.json(formattedReturns);
	} catch (error) {
		console.error("❌ Error fetching sales returns:", error);
		res.status(500).json({ error: "Failed to fetch sales returns" });
	}
});

// ✅ Cancel/Delete a sales return
app.delete("/sales-returns/:id", async (req, res) => {
	try {
		const { id } = req.params;

		const salesReturn = await SalesReturns.findByPk(id);
		if (!salesReturn) {
			return res.status(404).json({ error: "Sales return not found!" });
		}

		// ✅ Restore product stock since return is canceled
		const product = await Product.findByPk(salesReturn.productId);
		if (product) {
			product.stock -= salesReturn.quantity; // Deduct returned quantity
			await product.save();
		}

		await salesReturn.destroy(); // Delete the sales return
		res.json({ message: "Sales return canceled successfully!" });
	} catch (error) {
		console.error("Error canceling sales return:", error);
		res.status(500).json({ error: "Failed to cancel sales return" });
	}
});

// ✅ Edit/Update a sales return
app.put("/sales-returns/:id", async (req, res) => {
	try {
		const { id } = req.params;
		const { quantity, refundAmount } = req.body;

		const salesReturn = await SalesReturns.findByPk(id);
		if (!salesReturn) {
			return res.status(404).json({ error: "Sales return not found!" });
		}

		// ✅ Adjust product stock before updating
		const product = await Product.findByPk(salesReturn.productId);
		if (product) {
			// Remove old return quantity from stock
			product.stock -= salesReturn.quantity;

			// Add new return quantity to stock
			product.stock += parseInt(quantity);
			await product.save();
		}

		// ✅ Update the sales return
		salesReturn.quantity = quantity;
		salesReturn.refundAmount = refundAmount;
		await salesReturn.save();

		res.json({ message: "Sales return updated successfully!", salesReturn });
	} catch (error) {
		console.error("Error updating sales return:", error);
		res.status(500).json({ error: "Failed to update sales return" });
	}
});

//purchase returns
app.post("/purchase-returns", async (req, res) => {
	try {
		console.log("📥 Received purchase return request:", req.body);

		const { purchaseId, productId, quantity, refundAmount, reason } = req.body;

		// ✅ Validate request
		if (!purchaseId || !productId || !quantity || !refundAmount || !reason) {
			return res.status(400).json({ error: "All fields are required!" });
		}

		// ✅ Ensure refundAmount is a valid number
		if (isNaN(refundAmount) || refundAmount <= 0) {
			console.error("❌ Invalid refundAmount:", refundAmount);
			return res.status(400).json({ error: "Invalid refund amount!" });
		}

		// ✅ Find the original purchase
		const purchase = await Purchase.findByPk(purchaseId);
		if (!purchase) {
			return res.status(404).json({ error: "Purchase not found!" });
		}

		// ✅ Find the product
		const product = await Product.findByPk(productId);
		if (!product) {
			return res.status(404).json({ error: "Product not found!" });
		}

		// ✅ Ensure valid return quantity
		if (quantity > purchase.quantity) {
			return res
				.status(400)
				.json({ error: "Return quantity exceeds purchased quantity!" });
		}

		// ✅ Process the return
		const purchaseReturns = await PurchaseReturns.create({
			purchaseId,
			productId, // ✅ Use product ID fetched from product name
			quantity,
			refundAmount: parseFloat(refundAmount),
			reason,
		});

		// ✅ Reduce product stock
		product.stock -= parseInt(quantity);
		await product.save();

		res.json({
			message: "Purchase return processed successfully!",
			purchaseReturns,
		});
	} catch (error) {
		console.error("❌ Error processing purchase return:", error);
		res.status(500).json({ error: "Failed to process purchase return" });
	}
});

//get all purchase returns
app.get("/purchase-returns", async (req, res) => {
	try {
		console.log("📥 Fetching purchase returns...");

		// ✅ Ensure the model is defined
		if (!PurchaseReturns || typeof PurchaseReturns.findAll !== "function") {
			console.error("❌ PurchaseReturns model is not defined!");
			return res
				.status(500)
				.json({ error: "❌ PurchaseReturns model is missing!" });
		}

		// ✅ Fetch purchase returns with associated product name
		const purchaseReturns = await PurchaseReturns.findAll({
			include: [
				{
					model: Product,
					attributes: ["name"], // ✅ Fetch product name
				},
			],
		});

		// ✅ Format response to show product name
		const formattedReturns = purchaseReturns.map((pr) => ({
			id: pr.id,
			purchaseId: pr.purchaseId,
			productName: pr.Product ? pr.Product.name : "Unknown",
			quantity: pr.quantity,
			refundAmount: pr.refundAmount,
			reason: pr.reason,
		}));

		console.log("✅ Purchase Returns Data:", formattedReturns);

		res.json(formattedReturns);
	} catch (error) {
		console.error("❌ Error fetching purchase returns:", error);
		res.status(500).json({ error: "Failed to fetch purchase returns" });
	}
});

app.put("/purchase-returns/:id", async (req, res) => {
	try {
		const { id } = req.params;
		const { quantity, refundAmount, reason } = req.body;

		// Find the purchase return record
		const purchaseReturn = await PurchaseReturns.findByPk(id);
		if (!purchaseReturn) {
			return res.status(404).json({ error: "Purchase return not found!" });
		}

		// Update fields
		purchaseReturn.quantity = quantity;
		purchaseReturn.refundAmount = refundAmount;
		purchaseReturn.reason = reason;

		await purchaseReturn.save();

		res.json({
			message: "Purchase return updated successfully!",
			purchaseReturn,
		});
	} catch (error) {
		console.error("❌ Error updating purchase return:", error);
		res.status(500).json({ error: "Failed to update purchase return!" });
	}
});

app.delete("/purchase-returns/:id", async (req, res) => {
	try {
		const { id } = req.params;

		// Find the purchase return record
		const purchaseReturn = await PurchaseReturns.findByPk(id);
		if (!purchaseReturn) {
			return res.status(404).json({ error: "Purchase return not found!" });
		}

		await purchaseReturn.destroy(); // Delete from DB

		res.json({ message: "Purchase return deleted successfully!" });
	} catch (error) {
		console.error("❌ Error deleting purchase return:", error);
		res.status(500).json({ error: "Failed to delete purchase return!" });
	}
});

// ✅ Get all suppliers
app.get("/suppliers", async (req, res) => {
	try {
		const suppliers = await Supplier.findAll();
		console.log("Fetched suppliers:", suppliers);
		res.json(suppliers);
	} catch (error) {
		console.error("Error fetching suppliers:", error);
		res.status(500).json({ error: "Failed to fetch suppliers" });
	}
});

// ✅ Add a new supplier
app.post("/suppliers", async (req, res) => {
	try {
		const { name, contact, address } = req.body;
		const supplier = await Supplier.create({ name, contact, address });
		res.json(supplier);
		console.log("Supplier added:", supplier);
	} catch (error) {
		console.error("Error adding supplier:", error);
		res.status(500).json({ error: "Failed to add supplier" });
	}
});

// ✅ Delete a supplier
app.delete("/suppliers/:id", async (req, res) => {
	try {
		const { id } = req.params;
		const supplier = await Supplier.findByPk(id);
		if (!supplier) {
			return res.status(404).json({ error: "Supplier not found!" });
		}
		await supplier.destroy();
		res.json({ message: "Supplier deleted successfully!" });
	} catch (error) {
		console.error("Error deleting supplier:", error);
		res.status(500).json({ error: "Failed to delete supplier" });
	}
});

//update the supplier
app.put("/suppliers/:id", async (req, res) => {
	try {
		const { id } = req.params;
		const { name, contact, address } = req.body;

		const supplier = await Supplier.findByPk(id);
		if (!supplier)
			return res.status(404).json({ error: "Supplier not found!" });

		await supplier.update({ name, contact, address });

		res.json({ message: "Supplier updated successfully!", supplier });
	} catch (error) {
		console.error("Error updating supplier:", error);
		res.status(500).json({ error: "Failed to update supplier" });
	}
});

//stock prices
app.put("/stock-prices/:id", async (req, res) => {
	try {
		const { stock, purchasePrice, sellingPrice } = req.body;
		const product = await Product.findByPk(req.params.id);

		if (!product) {
			return res.status(404).json({ error: "Product not found!" });
		}

		// ✅ Update stock and prices
		product.stock = stock;
		product.purchasePrice = purchasePrice;
		product.sellingPrice = sellingPrice;
		await product.save();

		res.json({ message: "Stock and prices updated successfully!", product });
	} catch (error) {
		console.error("Error updating stock and prices:", error);
		res.status(500).json({ error: "Failed to update stock and prices!" });
	}
});

// 🔥 Function to get date range based on filter type
const getDateRange = (filter) => {
	const now = new Date();
	let startDate;

	switch (filter) {
		case "daily":
			startDate = new Date(now.setHours(0, 0, 0, 0));
			break;
		case "weekly":
			startDate = new Date();
			startDate.setDate(now.getDate() - 7);
			break;
		case "monthly":
			startDate = new Date(now.getFullYear(), now.getMonth(), 1);
			break;
		case "yearly":
			startDate = new Date(now.getFullYear(), 0, 1);
			break;
		default:
			startDate = null; // Fetch all records
	}

	return startDate ? { [Op.gte]: startDate } : {};
};

//get reports
app.get("/reports/sales", async (req, res) => {
	try {
		const { filter } = req.query;
		const whereCondition = getDateRange(filter);

		const sales = await Sales.findAll({
			where: whereCondition,
			include: [{ model: Product, attributes: ["name"] }], // ✅ Fetch product name
		});

		const formattedSales = sales.map((sale) => ({
			productName: sale.Product ? sale.Product.name : "Unknown",
			quantity: sale.quantity,
			sellingPrice: sale.sellingPrice,
			totalAmount: sale.totalAmount,
			date: sale.createdAt, // Include date for filtering
		}));

		res.json(formattedSales);
	} catch (error) {
		console.error("Error fetching sales reports:", error);
		res.status(500).json({ error: "Failed to fetch sales reports" });
	}
});

app.get("/reports/sales-returns", async (req, res) => {
	try {
		const { filter } = req.query;
		const whereCondition = getDateRange(filter);

		const salesReturns = await SalesReturns.findAll({
			where: whereCondition,
			include: [{ model: Product, attributes: ["name"] }],
		});
		const formattedReturns = salesReturns.map((returnItem) => ({
			productName: returnItem.Product ? returnItem.Product.name : "Unknown",
			quantity: returnItem.quantity,
			refundAmount: returnItem.refundAmount,
		}));
		res.json(formattedReturns);
	} catch (error) {
		console.error("Error fetching sales returns reports:", error);
		res.status(500).json({ error: "Failed to fetch sales returns reports" });
	}
});

app.get("/reports/purchases", async (req, res) => {
	try {
		const { filter } = req.query;
		const whereCondition = getDateRange(filter);

		const purchases = await Purchase.findAll({
			where: whereCondition,
			include: [{ model: Product, attributes: ["name"] }, { model: Supplier }],
		});
		const formattedPurchases = purchases.map((purchase) => ({
			productName: purchase.Product ? purchase.Product.name : "Unknown",
			supplier: purchase.Supplier ? purchase.Supplier.name : "Unknown",
			quantity: purchase.quantity,
			totalAmount: purchase.totalAmount,
		}));
		res.json(formattedPurchases);
	} catch (error) {
		console.error("Error fetching purchase reports:", error);
		res.status(500).json({ error: "Failed to fetch purchase reports" });
	}
});

app.get("/reports/purchase-returns", async (req, res) => {
	try {
		const { filter } = req.query;
		const whereCondition = getDateRange(filter);

		const purchaseReturns = await PurchaseReturns.findAll({
			where: whereCondition,
			include: [{ model: Product, attributes: ["name"] }],
		});
		const formattedReturns = purchaseReturns.map((returnItem) => ({
			productName: returnItem.Product ? returnItem.Product.name : "Unknown",
			quantity: returnItem.quantity,
			reason: returnItem.reason,
		}));
		res.json(formattedReturns);
	} catch (error) {
		console.error("Error fetching purchase returns reports:", error);
		res.status(500).json({ error: "Failed to fetch purchase returns reports" });
	}
});

app.get("/reports/suppliers", async (req, res) => {
	try {
		const suppliers = await Supplier.findAll();
		res.json(suppliers);
	} catch (error) {
		console.error("Error fetching suppliers reports:", error);
		res.status(500).json({ error: "Failed to fetch suppliers reports" });
	}
});

app.get("/reports/stock-prices", async (req, res) => {
	try {
		const stockPrices = await Product.findAll({
			attributes: ["name", "stock", "purchasePrice", "sellingPrice"],
		});
		const formattedStockPrices = stockPrices.map((product) => ({
			productName: product.name,
			stock: product.stock,
			purchasePrice: product.purchasePrice,
			sellingPrice: product.sellingPrice,
		}));
		res.json(formattedStockPrices);
	} catch (error) {
		console.error("Error fetching stock prices reports:", error);
		res.status(500).json({ error: "Failed to fetch stock prices reports" });
	}
});

app.get("/dashboard", async (req, res) => {
	try {
		const totalSales = (await Sales.sum("totalAmount")) || 0;
		const totalPurchases = (await Purchase.sum("totalAmount")) || 0;
		const salesReturns = (await SalesReturns.sum("refundamount")) || 0;
		const purchasesReturns = (await PurchaseReturns.sum("refundAmount")) || 0;

		// Fetch sales by date (Last 7 days)
		const salesByDate = await Sales.findAll({
			attributes: [
				[Sequelize.literal("CAST(createdAt AS DATE)"), "date"],
				[Sequelize.fn("SUM", Sequelize.col("totalAmount")), "sales"],
			],
			group: [Sequelize.literal("CAST(createdAt AS DATE)")],
			order: [["date", "ASC"]],
		});

		// Fetch purchases by date (Last 7 days)
		const purchasesByDate = await Purchase.findAll({
			attributes: [
				[Sequelize.literal("CAST(createdAt AS DATE)"), "date"],
				[Sequelize.fn("SUM", Sequelize.col("totalAmount")), "purchases"],
			],
			group: [Sequelize.literal("CAST(createdAt AS DATE)")],
			order: [["date", "ASC"]],
		});

		// Send JSON response
		res.json({
			totalSales,
			totalPurchases,
			salesReturns,
			purchasesReturns,
			salesByDate,
			purchasesByDate,
		});
	} catch (error) {
		console.error("Dashboard Query Error:", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

// Start server
const PORT = process.env.PORT || 5000;

/*sequelize.sync().then(() => {
	app.listen(PORT, () => {
		console.log(`Server running on http://localhost:${PORT}`);
	});
});*/

if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "../client/build")));

	app.get("*", (req, res) => {
		res.sendFile(path.join(__dirname, "../client", "build", "index.html"));
	});
}

// Database Connection
const startServer = async () => {
	try {
		await sequelize.authenticate();
		console.log("✅ Connected to mySQL Server successfully!");

		await sequelize.sync({ alter: true }); // Ensure database schema updates without data loss

		app.listen(PORT, () => {
			console.log(`🚀 Server running on http://localhost:${PORT}`);
		});
	} catch (error) {
		console.error("❌ Database connection failed:", error);
		process.exit(1); // Stop server if DB connection fails
	}
};

// Start Server
startServer();

{
	sequelize
		.authenticate()
		.then(() => console.log("Database connected"))
		.catch((err) => console.error("Database connection failed:", err));
}

/*sequelize.sync({ force: true }).then(() => {
	console.log("Database & tables created!");
});*/
