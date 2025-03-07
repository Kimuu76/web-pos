/** @format */

import { useEffect, useState } from "react";
import axios from "axios";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
	Button,
	TextField,
} from "@mui/material";

const Products = () => {
	const [products, setProducts] = useState([]);
	const [newProduct, setNewProduct] = useState({
		name: "",
	});

	useEffect(() => {
		fetchProducts();
	}, []);

	const fetchProducts = async () => {
		try {
			const response = await axios.get(
				"https://web-pos-1.onrender.com/products"
			);
			setProducts(response.data);
		} catch (error) {
			console.error("Error fetching products:", error);
		}
	};

	const addProduct = async () => {
		await axios.post("https://web-pos-1.onrender.com/products", newProduct);
		setNewProduct({ name: "" });
		fetchProducts();
	};

	return (
		<div>
			<h1>Products</h1>

			<TextField
				label='Product Name'
				value={newProduct.name}
				onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
			/>
			<Button variant='contained' onClick={addProduct}>
				Add Product
			</Button>

			<Table>
				<TableHead>
					<TableRow>
						<TableCell fontWeight='bold'>Product Name</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{products.map((product) => (
						<TableRow key={product.id}>
							<TableCell>{product.name}</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
};

export default Products;

/** @format 
import { useEffect, useState } from "react";
import axios from "axios";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
	Button,
	TextField,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Typography,
	Box,
	Container,
	Paper,
	Alert,
} from "@mui/material";

const Products = () => {
	const [products, setProducts] = useState([]);
	const [newProduct, setNewProduct] = useState({
		name: "",
		//price: "",
		stock: "",
	});
	const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });
	const [error, setError] = useState(""); // ✅ State to handle validation errors

	// Fetch products from backend
	useEffect(() => {
		fetchProducts();
	}, []);

	const fetchProducts = async () => {
		try {
			const response = await axios.get("http://localhost:5000/products");
			setProducts(response.data || []);
		} catch (error) {
			console.error("Error fetching products:", error);
		}
	};

	// ✅ Validate and Add New Product
	const addProduct = async () => {
		const { name, price, stock } = newProduct;

		// ✅ Form Validation
		if (!name.trim() || !stock) {
			setError("⚠️ Please fill in all fields Required correctly.");
			return;
		}

		// ✅ Reset error if input is valid
		setError("");

		await axios.post("http://localhost:5000/products", newProduct);
		setNewProduct({ name: "", /*price: "",* stock: "" 
		fetchProducts();
		alert("Product added successfully!");
	

	// Confirm delete product
	const confirmDelete = (id) => {
		setDeleteConfirm({ open: true, id });
	};

	// Delete a product
	const deleteProduct = async () => {
		try {
			const { id } = deleteConfirm;
			setDeleteConfirm({ open: false, id: null });

			// ✅ Check for related records before deleting
			const response = await axios.delete(
				`http://localhost:5000/products/${id}`
			);

			if (response.data.relatedRecords) {
				const { sales, salesReturns, purchases, purchaseReturns } =
					response.data.relatedRecords;

				alert(`
                ❌ Cannot delete product! Related records found:
                - Sales: ${sales.length}
                - Sales Returns: ${salesReturns.length}
                - Purchases: ${purchases.length}
                - Purchase Returns: ${purchaseReturns.length}
                Please delete these records first.
                `);
				return;
			}

			alert("✅ Product deleted successfully!");
			fetchProducts();
		} catch (error) {
			console.error("Error deleting product:", error);
			alert(error.response?.data?.error || "Failed to delete product!");
		}
	};

	return (
		<Container maxWidth='md'>
			<Typography variant='h4' align='center' gutterBottom>
				🛍️ Products Management
			</Typography>

			{/* Add Product Form 
			<Paper elevation={3} sx={{ padding: 3, marginBottom: 4 }}>
				<Typography variant='h6' gutterBottom>
					Add New Product
				</Typography>

				{/* Display Validation Error *
				{error && <Alert severity='error'>{error}</Alert>}

				<Box display='flex' gap={2} sx={{ marginTop: 2 }}>
					<TextField
						label='Name'
						fullWidth
						value={newProduct.name}
						onChange={(e) =>
							setNewProduct({ ...newProduct, name: e.target.value })
						}
					/>
					{/*<TextField
						label='Price'
						type='number'
						fullWidth
						value={newProduct.price}
						onChange={(e) =>
							setNewProduct({ ...newProduct, price: e.target.value })
						}
					/>*
					<TextField
						label='Stock'
						type='number'
						fullWidth
						value={newProduct.stock}
						onChange={(e) =>
							setNewProduct({ ...newProduct, stock: e.target.value })
						}
					/>
					<Button variant='contained' color='primary' onClick={addProduct}>
						Add Product
					</Button>
				</Box>
			</Paper>

			{/* Product Table 
			<Paper elevation={3} sx={{ padding: 2 }}>
				<Typography variant='h6' gutterBottom>
					Product List
				</Typography>
				<Table>
					<TableHead>
						<TableRow sx={{ backgroundColor: "#f5f5f5" }}>
							<TableCell>Name</TableCell>
							{/*<TableCell>Price (KES)</TableCell>*
							<TableCell>Stock</TableCell>
							<TableCell>Actions</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{products.length === 0 ? (
							<TableRow>
								<TableCell colSpan={4} align='center'>
									No products available.
								</TableCell>
							</TableRow>
						) : (
							products.map((product) => (
								<TableRow key={product.id}>
									<TableCell>{product.name}</TableCell>
									{/*<TableCell>KES {product.price}</TableCell>
									<TableCell>{product.stock}</TableCell>
									<TableCell>
										<Button
											variant='outlined'
											color='error'
											onClick={() => confirmDelete(product.id)}
										>
											Delete
										</Button>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</Paper>

			{/* Delete Confirmation Dialog *
			<Dialog
				open={deleteConfirm.open}
				onClose={() => setDeleteConfirm({ open: false, id: null })}
			>
				<DialogTitle>Confirm Delete</DialogTitle>
				<DialogContent>
					<DialogContentText>
						Are you sure you want to delete this product? This action cannot be
						undone.
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button
						onClick={() => setDeleteConfirm({ open: false, id: null })}
						color='primary'
					>
						Cancel
					</Button>
					<Button onClick={deleteProduct} color='error'>
						Delete
					</Button>
				</DialogActions>
			</Dialog>
		</Container>
	);
};

export default Products;*/
