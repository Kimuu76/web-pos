/** @format */

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
	Table,
	TableHead,
	TableRow,
	TableCell,
	TableBody,
	Button,
	TextField,
	Select,
	MenuItem,
	Dialog,
	DialogTitle,
	DialogActions,
	DialogContent,
} from "@mui/material";

const Purchases = () => {
	const [purchases, setPurchases] = useState([]);
	const [products, setProducts] = useState([]);
	const [suppliers, setSuppliers] = useState([]);
	const [newPurchase, setNewPurchase] = useState({
		productId: "",
		supplierId: "",
		quantity: "",
		pricePerUnit: "",
	});
	const [editingPurchase, setEditingPurchase] = useState(null);
	const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
	const [selectedPurchaseId, setSelectedPurchaseId] = useState(null);

	useEffect(() => {
		fetchPurchases();
		fetchProducts();
		fetchSuppliers();
	}, []);

	const fetchPurchases = async () => {
		try {
			const response = await axios.get(
				"https://web-pos-1.onrender.com/purchases"
			);
			setPurchases(response.data || []);
		} catch (error) {
			console.error("Error fetching purchases:", error);
		}
	};

	const fetchProducts = async () => {
		try {
			const response = await axios.get(
				"https://web-pos-1.onrender.com/products"
			);
			setProducts(response.data || []);
		} catch (error) {
			console.error("Error fetching products:", error);
		}
	};

	const fetchSuppliers = async () => {
		try {
			const response = await axios.get(
				"https://web-pos-1.onrender.com/suppliers"
			);
			setSuppliers(response.data || []);
		} catch (error) {
			console.error("Error fetching suppliers:", error);
		}
	};

	// ✅ Add a new purchase
	const addPurchase = async () => {
		if (
			!newPurchase.productId ||
			!newPurchase.supplierId ||
			!newPurchase.quantity
		) {
			alert("⚠ Please fill in all fields before adding a purchase!");
			return;
		}

		try {
			const response = await axios.post(
				"https://web-pos-1.onrender.com/purchases",
				newPurchase
			);
			setPurchases([...purchases, response.data.purchase]);
			setNewPurchase({
				productId: "",
				supplierId: "",
				quantity: Number(newPurchase.quantity),
				pricePerUnit: "",
			});
			fetchPurchases();
		} catch (error) {
			console.error("Error adding purchase:", error);
		}
	};

	// ✅ Edit a purchase
	const updatePurchase = async () => {
		if (!editingPurchase) return;

		try {
			await axios.put(
				`https://web-pos-1.onrender.com/purchases/${editingPurchase.id}`,
				editingPurchase
			);
			setEditingPurchase(null);
			fetchPurchases();
		} catch (error) {
			console.error("Error updating purchase:", error);
		}
	};

	// ✅ Open delete confirmation dialog
	const confirmDelete = (id) => {
		setSelectedPurchaseId(id);
		setOpenDeleteDialog(true);
	};

	// ✅ Delete a purchase
	const deletePurchase = async () => {
		try {
			await axios.delete(
				`https://web-pos-1.onrender.com/purchases/${selectedPurchaseId}`
			);
			setPurchases((prevPurchases) =>
				prevPurchases.filter((purchase) => purchase.id !== selectedPurchaseId)
			);
			setOpenDeleteDialog(false);
		} catch (error) {
			console.error("Error deleting purchase:", error);
		}
	};

	return (
		<div>
			<h2>Purchases</h2>

			{/* Add Purchase Form */}
			<div
				style={{
					marginBottom: "20px",
					display: "flex",
					gap: "10px",
					alignItems: "center",
				}}
			>
				<Select
					value={newPurchase.productId}
					onChange={(e) =>
						setNewPurchase({ ...newPurchase, productId: e.target.value })
					}
					displayEmpty
				>
					<MenuItem value='' disabled>
						Select a product
					</MenuItem>
					{products.map((product) => (
						<MenuItem key={product.id} value={product.id}>
							{product.name}
						</MenuItem>
					))}
				</Select>

				<Select
					value={newPurchase.supplierId}
					onChange={(e) =>
						setNewPurchase({ ...newPurchase, supplierId: e.target.value })
					}
					displayEmpty
				>
					<MenuItem value='' disabled>
						Select a supplier
					</MenuItem>
					{suppliers.map((supplier) => (
						<MenuItem key={supplier.id} value={supplier.id}>
							{supplier.name}
						</MenuItem>
					))}
				</Select>

				<TextField
					label='Quantity'
					type='number'
					value={newPurchase.quantity}
					onChange={(e) =>
						setNewPurchase({ ...newPurchase, quantity: e.target.value })
					}
					required
				/>
				<TextField
					label='Purchase Price (Auto-Fetched)'
					type='number'
					value={
						products.find((p) => p.id === newPurchase.productId)
							?.purchasePrice || ""
					}
					disabled
				/>
				<Button variant='contained' color='primary' onClick={addPurchase}>
					Add Purchase
				</Button>
			</div>

			{/* Display Purchases Table */}
			<Table>
				<TableHead>
					<TableRow>
						<TableCell>ID</TableCell>
						<TableCell>Product Name</TableCell>
						<TableCell>Supplier</TableCell>
						<TableCell>Quantity</TableCell>
						<TableCell>Total Cost</TableCell>
						<TableCell>Actions</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{purchases.map((purchase) => (
						<TableRow key={purchase.id}>
							<TableCell>{purchase.id}</TableCell>
							<TableCell>{purchase.productName || "Unknown"}</TableCell>
							<TableCell>{purchase.supplierName || "Unknown"}</TableCell>
							<TableCell>{purchase.quantity}</TableCell>
							<TableCell>KES {purchase.totalAmount}</TableCell>
							<TableCell>
								<Button
									color='secondary'
									onClick={() => confirmDelete(purchase.id)}
								>
									Delete
								</Button>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>

			{/* Delete Confirmation Dialog */}
			<Dialog
				open={openDeleteDialog}
				onClose={() => setOpenDeleteDialog(false)}
			>
				<DialogTitle>Confirm Deletion</DialogTitle>
				<DialogContent>
					Are you sure you want to delete this purchase?
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
					<Button onClick={deletePurchase} color='error'>
						Delete
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
};

export default Purchases;
