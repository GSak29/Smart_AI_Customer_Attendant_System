import { useState, useRef } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Plus, Edit, Trash, Download, Search, Filter, Upload, Eye } from 'lucide-react';
import { Alert } from '../components/ui/Alert';
import { useProducts } from '../context/ProductContext';
import * as XLSX from 'xlsx';
import { uploadImageToCloudinary } from '../services/cloudinary';

const Products = () => {
    const { products, deleteProduct, addProduct, updateProduct } = useProducts();
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 10;
    const fileInputRef = useRef<HTMLInputElement>(null);

    // New State for Advanced Features
    const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [viewProduct, setViewProduct] = useState<any | null>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [newProduct, setNewProduct] = useState({
        Product_ID: '',
        Product_Name: '',
        Category: '',
        Material_Type: '',
        Wood_Type: '',
        Length_mm: '',
        Width_mm: '',
        Height_mm: '',
        Thickness_mm: '',
        Size_Description: '',
        Stock_Quantity: '',
        Price_Min_INR: '',
        Price_Max_INR: '',
        Grade: '',
        Usage_Type: '',
        Image_URL: ''
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0]);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewProduct(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveProduct = () => {
        setError(null);
        // Basic validation
        if (!newProduct.Product_ID || !newProduct.Product_Name) {
            setError('Please fill in at least ID and Name');
            return;
        }

        const productData = {
            Product_ID: newProduct.Product_ID,
            Category: newProduct.Category,
            Product_Name: newProduct.Product_Name,
            Material_Type: newProduct.Material_Type,
            Wood_Type: newProduct.Wood_Type,
            Length_mm: parseNumber(newProduct.Length_mm),
            Width_mm: parseNumber(newProduct.Width_mm),
            Height_mm: parseNumber(newProduct.Height_mm),
            Thickness_mm: parseNumber(newProduct.Thickness_mm),
            Size_Description: newProduct.Size_Description,
            Price_Min_INR: parseNumber(newProduct.Price_Min_INR),
            Price_Max_INR: parseNumber(newProduct.Price_Max_INR),
            Stock_Quantity: parseNumber(newProduct.Stock_Quantity),
            Grade: newProduct.Grade,
            Usage_Type: newProduct.Usage_Type
        };

        if (isEditMode) {
            // Logic to handle image upload if a new file is selected
            if (imageFile) {
                setUploading(true);
                uploadImageToCloudinary(imageFile).then(url => {
                    updateProduct(newProduct.Product_ID, { ...productData, Image_URL: url });
                    setUploading(false);
                    closeModal();
                }).catch(err => {
                    console.error("Upload failed", err);
                    setUploading(false);
                    setError("Image upload failed");
                });
            } else {
                updateProduct(newProduct.Product_ID, productData);
                closeModal();
            }
        } else {
            if (products.some(p => p.Product_ID === newProduct.Product_ID)) {
                setError('Product ID already exists. Please change the Product ID or update the existing product.');
                return;
            }


            if (imageFile) {
                setUploading(true);
                uploadImageToCloudinary(imageFile).then(url => {
                    addProduct({ ...productData, Image_URL: url });
                    setUploading(false);
                    closeModal();
                }).catch(err => {
                    console.error("Upload failed", err);
                    setUploading(false);
                    setError("Image upload failed");
                });
            } else {
                addProduct(productData);
                closeModal();
            }
        }
    };

    const closeModal = () => {
        setIsAddModalOpen(false);
        setIsEditMode(false);
        resetForm();
    };

    const resetForm = () => {
        setNewProduct({
            Product_ID: '',
            Product_Name: '',
            Category: '',
            Material_Type: '',
            Wood_Type: '',
            Length_mm: '',
            Width_mm: '',
            Height_mm: '',
            Thickness_mm: '',
            Size_Description: '',
            Stock_Quantity: '',
            Price_Min_INR: '',
            Price_Max_INR: '',
            Grade: '',
            Usage_Type: '',
            Image_URL: ''
        });
        setImageFile(null);
        setError(null);
    };

    const handleEditClick = (product: any) => {
        setNewProduct({
            Product_ID: product.Product_ID,
            Product_Name: product.Product_Name,
            Category: product.Category,
            Material_Type: product.Material_Type,
            Wood_Type: product.Wood_Type,
            Length_mm: product.Length_mm.toString(),
            Width_mm: product.Width_mm.toString(),
            Height_mm: product.Height_mm.toString(),
            Thickness_mm: product.Thickness_mm.toString(),
            Size_Description: product.Size_Description,
            Stock_Quantity: product.Stock_Quantity.toString(),
            Price_Min_INR: product.Price_Min_INR.toString(),
            Price_Max_INR: product.Price_Max_INR.toString(),
            Grade: product.Grade,
            Usage_Type: product.Usage_Type,
            Image_URL: product.Image_URL || ''
        });
        setImageFile(null); // Reset file input, current image is in state
        setIsEditMode(true);
        setIsAddModalOpen(true);
    };

    const parseNumber = (val: string) => {
        const num = parseFloat(val);
        return isNaN(num) ? 0 : num;
    };

    const toggleSelectAll = () => {
        if (selectedProducts.size === currentProducts.length) {
            setSelectedProducts(new Set());
        } else {
            const newSet = new Set(currentProducts.map(p => p.Product_ID));
            setSelectedProducts(newSet);
        }
    };

    const toggleSelectProduct = (id: string) => {
        const newSet = new Set(selectedProducts);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedProducts(newSet);
    };

    const handleBulkDelete = async () => {
        if (!confirm(`Are you sure you want to delete ${selectedProducts.size} products?`)) return;

        for (const id of Array.from(selectedProducts)) {
            await deleteProduct(id);
        }
        setSelectedProducts(new Set());
    };

    const filteredProducts = products.filter(p =>
        (p.Product_Name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.Product_ID || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

    const handleExport = () => {
        const worksheet = XLSX.utils.json_to_sheet(products);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
        XLSX.writeFile(workbook, "products_inventory.xlsx");
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            const bstr = evt.target?.result;
            const wb = XLSX.read(bstr, { type: 'binary' });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const data = XLSX.utils.sheet_to_json(ws);

            let successCount = 0;
            let errorCount = 0;

            data.forEach((row: any) => {
                // Map row data to Product interface
                // Assuming Excel headers match Product interface keys roughly or need mapping
                // For simplicity, let's assume headers ARE the keys, or user maps them.
                // Let's try to map safely.

                if (!row.Product_ID || !row.Product_Name) {
                    errorCount++;
                    return;
                }

                const newProd = {
                    Product_ID: row.Product_ID,
                    Category: row.Category || 'Uncategorized',
                    Product_Name: row.Product_Name,
                    Material_Type: row.Material_Type || '',
                    Wood_Type: row.Wood_Type || '',
                    Length_mm: parseNumber(row.Length_mm),
                    Width_mm: parseNumber(row.Width_mm),
                    Height_mm: parseNumber(row.Height_mm),
                    Thickness_mm: parseNumber(row.Thickness_mm),
                    Size_Description: row.Size_Description || '',
                    Price_Min_INR: parseNumber(row.Price_Min_INR),
                    Price_Max_INR: parseNumber(row.Price_Max_INR),
                    Stock_Quantity: parseNumber(row.Stock_Quantity),
                    Grade: row.Grade || '',
                    Usage_Type: row.Usage_Type || ''
                };

                addProduct(newProd);
                successCount++;
            });

            alert(`Import processed: ${successCount} added, ${errorCount} skipped (missing ID/Name).`);
            if (fileInputRef.current) fileInputRef.current.value = ''; // Reset input
        };
        reader.readAsBinaryString(file);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Products</h2>
                    <p className="text-muted-foreground">Manage your product inventory.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={handleExport}>
                        <Download className="mr-2 h-4 w-4" />
                        Export to Excel
                    </Button>
                    <Button variant="outline" onClick={handleImportClick}>
                        <Upload className="mr-2 h-4 w-4" />
                        Import from Excel
                    </Button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept=".xlsx, .xls"
                    />
                    <Button onClick={() => {
                        resetForm();
                        setIsEditMode(false);
                        setIsAddModalOpen(true);
                    }}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Product
                    </Button>
                </div>
            </div>

            <div className="flex items-center justify-between gap-4">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search products..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex gap-2">
                    {selectedProducts.size > 0 && (
                        <Button variant="destructive" onClick={handleBulkDelete}>
                            <Trash className="mr-2 h-4 w-4" />
                            Delete Selected ({selectedProducts.size})
                        </Button>
                    )}
                    <Button variant="outline" size="icon">
                        <Filter className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="rounded-md border overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[40px]">
                                <input
                                    type="checkbox"
                                    checked={currentProducts.length > 0 && selectedProducts.size === currentProducts.length}
                                    onChange={toggleSelectAll}
                                    className="h-4 w-4 rounded border-gray-300"
                                />
                            </TableHead>
                            <TableHead>Image</TableHead>
                            <TableHead>ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Price (INR)</TableHead>
                            <TableHead>Stock</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {currentProducts.map((product) => (
                            <TableRow key={product.Product_ID}>
                                <TableCell>
                                    <input
                                        type="checkbox"
                                        checked={selectedProducts.has(product.Product_ID)}
                                        onChange={() => toggleSelectProduct(product.Product_ID)}
                                        className="h-4 w-4 rounded border-gray-300"
                                    />
                                </TableCell>
                                <TableCell>
                                    {product.Image_URL ? (
                                        <img src={product.Image_URL} alt={product.Product_Name} className="h-10 w-10 object-cover rounded" />
                                    ) : (
                                        <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">No Img</div>
                                    )}
                                </TableCell>
                                <TableCell className="font-medium whitespace-nowrap">{product.Product_ID}</TableCell>
                                <TableCell className="whitespace-nowrap">{product.Product_Name}</TableCell>
                                <TableCell>{product.Category}</TableCell>
                                <TableCell className="whitespace-nowrap">{product.Price_Min_INR} - {product.Price_Max_INR}</TableCell>
                                <TableCell>{product.Stock_Quantity}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                                            setViewProduct(product);
                                            setIsDetailsModalOpen(true);
                                        }}>
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditClick(product)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteProduct(product.Product_ID)}>
                                            <Trash className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-end space-x-2 py-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                >
                    Previous
                </Button>
                <div className="text-sm font-medium">
                    Page {currentPage} of {totalPages}
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                >
                    Next
                </Button>
            </div>

            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title={isEditMode ? "Edit Product" : "Add Product"} className="max-w-2xl">
                <div className="p-1 max-h-[80vh] overflow-y-auto">
                    {error && (
                        <Alert variant="destructive" className="mb-4">
                            {error}
                        </Alert>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Product ID</label>
                            <Input name="Product_ID" value={newProduct.Product_ID} onChange={handleInputChange} placeholder="e.g. P-1000" disabled={isEditMode} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Product Name</label>
                            <Input name="Product_Name" value={newProduct.Product_Name} onChange={handleInputChange} placeholder="e.g. Product 1" />
                        </div>

                        <div className="col-span-2 space-y-2">
                            <label className="text-sm font-medium">Product Image</label>
                            <div className="flex items-center gap-4">
                                {newProduct.Image_URL && (
                                    <img src={newProduct.Image_URL} alt="Preview" className="h-16 w-16 object-cover rounded border" />
                                )}
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="cursor-pointer"
                                />
                            </div>
                            {uploading && <p className="text-xs text-muted-foreground">Uploading image...</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Category</label>
                            <Input name="Category" value={newProduct.Category} onChange={handleInputChange} placeholder="e.g. Furniture" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Material</label>
                            <Input name="Material_Type" value={newProduct.Material_Type} onChange={handleInputChange} placeholder="e.g. Wood" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Wood Type</label>
                            <Input name="Wood_Type" value={newProduct.Wood_Type} onChange={handleInputChange} placeholder="e.g. Oak" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Grade</label>
                            <Input name="Grade" value={newProduct.Grade} onChange={handleInputChange} placeholder="e.g. A" />
                        </div>

                        <div className="col-span-2 grid grid-cols-4 gap-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Length (mm)</label>
                                <Input name="Length_mm" type="number" value={newProduct.Length_mm} onChange={handleInputChange} placeholder="100" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Width (mm)</label>
                                <Input name="Width_mm" type="number" value={newProduct.Width_mm} onChange={handleInputChange} placeholder="50" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Height (mm)</label>
                                <Input name="Height_mm" type="number" value={newProduct.Height_mm} onChange={handleInputChange} placeholder="10" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Thickness (mm)</label>
                                <Input name="Thickness_mm" type="number" value={newProduct.Thickness_mm} onChange={handleInputChange} placeholder="5" />
                            </div>
                        </div>

                        <div className="col-span-2 space-y-2">
                            <label className="text-sm font-medium">Description</label>
                            <Input name="Size_Description" value={newProduct.Size_Description} onChange={handleInputChange} placeholder="e.g. Standard Size" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Stock</label>
                            <Input name="Stock_Quantity" type="number" value={newProduct.Stock_Quantity} onChange={handleInputChange} placeholder="50" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Usage</label>
                            <Input name="Usage_Type" value={newProduct.Usage_Type} onChange={handleInputChange} placeholder="e.g. Indoor" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Min Price (INR)</label>
                            <Input name="Price_Min_INR" type="number" value={newProduct.Price_Min_INR} onChange={handleInputChange} placeholder="1000" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Max Price (INR)</label>
                            <Input name="Price_Max_INR" type="number" value={newProduct.Price_Max_INR} onChange={handleInputChange} placeholder="1500" />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-6">
                        <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveProduct}>{isEditMode ? "Update Product" : "Save Product"}</Button>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} title="Product Details" className="max-w-3xl">
                {viewProduct && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-2">
                        <div className="flex flex-col items-center">
                            {viewProduct.Image_URL ? (
                                <img src={viewProduct.Image_URL} alt={viewProduct.Product_Name} className="w-full max-h-[300px] object-contain rounded-lg border" />
                            ) : (
                                <div className="w-full h-[200px] bg-gray-100 flex items-center justify-center rounded-lg border text-muted-foreground">
                                    No Image Available
                                </div>
                            )}
                            <div className="mt-4 w-full">
                                <h3 className="text-xl font-bold">{viewProduct.Product_Name}</h3>
                                <p className="text-sm text-muted-foreground">{viewProduct.Product_ID}</p>
                                <div className="mt-2 inline-block px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                                    {viewProduct.Category}
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="font-semibold text-muted-foreground">Price Range</p>
                                    <p>₹{viewProduct.Price_Min_INR} - ₹{viewProduct.Price_Max_INR}</p>
                                </div>
                                <div>
                                    <p className="font-semibold text-muted-foreground">Stock</p>
                                    <p>{viewProduct.Stock_Quantity} units</p>
                                </div>
                                <div>
                                    <p className="font-semibold text-muted-foreground">Material</p>
                                    <p>{viewProduct.Material_Type} ({viewProduct.Wood_Type})</p>
                                </div>
                                <div>
                                    <p className="font-semibold text-muted-foreground">Grade</p>
                                    <p>{viewProduct.Grade}</p>
                                </div>
                                <div>
                                    <p className="font-semibold text-muted-foreground">Dimensions</p>
                                    <p>{viewProduct.Length_mm} x {viewProduct.Width_mm} x {viewProduct.Height_mm} mm</p>
                                </div>
                                <div>
                                    <p className="font-semibold text-muted-foreground">Thickness</p>
                                    <p>{viewProduct.Thickness_mm} mm</p>
                                </div>
                                <div>
                                    <p className="font-semibold text-muted-foreground">Usage</p>
                                    <p>{viewProduct.Usage_Type}</p>
                                </div>
                            </div>
                            <div className="pt-4 border-t">
                                <p className="font-semibold text-muted-foreground mb-1">Description</p>
                                <p className="text-sm">{viewProduct.Size_Description}</p>
                            </div>
                        </div>
                    </div>
                )}
                <div className="flex justify-end mt-6">
                    <Button onClick={() => setIsDetailsModalOpen(false)}>Close</Button>
                </div>
            </Modal>
        </div >
    );
};

export default Products;
