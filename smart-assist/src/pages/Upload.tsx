import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { UploadCloud, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useProducts, type Product } from '../context/ProductContext';
import { useNavigate } from 'react-router-dom';

const Upload = () => {
    const [dragging, setDragging] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
    const [statusMessage, setStatusMessage] = useState('');
    const { products, addProduct } = useProducts();
    const navigate = useNavigate();

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            setFile(e.dataTransfer.files[0]);
            setUploadStatus('idle');
            setStatusMessage('');
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
            setUploadStatus('idle');
            setStatusMessage('');
        }
    };

    const handleUpload = () => {
        if (!file) return;
        setUploadStatus('uploading');

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(sheet);

                // Map fields to match Product interface if needed
                const newProducts = jsonData.map((item: any) => ({
                    Product_ID: item.Product_ID ? String(item.Product_ID) : `P-${Math.floor(Math.random() * 10000)}`,
                    Category: item.Category ? String(item.Category) : 'Uncategorized',
                    Product_Name: item.Product_Name ? String(item.Product_Name) : 'Unknown Product',
                    Material_Type: item.Material_Type ? String(item.Material_Type) : '',
                    Wood_Type: item.Wood_Type ? String(item.Wood_Type) : '',
                    Length_mm: Number(item.Length_mm) || 0,
                    Width_mm: Number(item.Width_mm) || 0,
                    Height_mm: Number(item.Height_mm) || 0,
                    Thickness_mm: Number(item.Thickness_mm) || 0,
                    Size_Description: item.Size_Description ? String(item.Size_Description) : '',
                    Price_Min_INR: Number(item.Price_Min_INR) || 0,
                    Price_Max_INR: Number(item.Price_Max_INR) || 0,
                    Stock_Quantity: Number(item.Stock_Quantity) || 0,
                    Grade: item.Grade ? String(item.Grade) : '',
                    Usage_Type: item.Usage_Type ? String(item.Usage_Type) : ''
                })) as Product[];

                if (newProducts.length === 0) {
                    throw new Error("No valid data found in file.");
                }

                // Append new products using Context (updates Firestore)
                let addedCount = 0;
                let updatedCount = 0;

                // Process sequentially to potential avoid race conditions or use Promise.all
                // Using Promise.all for speed, assuming batch isn't too huge
                await Promise.all(newProducts.map(async (newP) => {
                    const exists = products.some(p => p.Product_ID === newP.Product_ID);
                    if (exists) {
                        // For simplicity, we are adding/overwriting. 
                        // ProductContext.addProduct uses setDoc which overwrites/merges if we used setDoc with merge? 
                        // Actually addProduct uses setDoc(docRef, product). This overwrites.
                        // Context also has updateProduct but it takes Partial.
                        // Let's just use addProduct which acts as upsert here because setDoc overwrites.
                        await addProduct(newP);
                        updatedCount++;
                    } else {
                        await addProduct(newP);
                        addedCount++;
                    }
                }));

                setUploadStatus('success');
                setStatusMessage(`Processed successfully: ${addedCount} added, ${updatedCount} updated.`);
                setTimeout(() => {
                    navigate('/products');
                }, 1000);

            } catch (error) {
                console.error("Error parsing file:", error);
                setUploadStatus('error');
                setStatusMessage('Failed to parse Excel file. Please check the format.');
            }
        };
        reader.onerror = () => {
            setUploadStatus('error');
            setStatusMessage('Error reading file.');
        };
        reader.readAsBinaryString(file);
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Bulk Upload</h2>
                <p className="text-muted-foreground">Upload Excel files to update inventory.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Upload File</CardTitle>
                    <CardDescription>Drag and drop your Excel file here or click to browse.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div
                        className={`border-2 border-dashed rounded-lg p-12 flex flex-col items-center justify-center text-center transition-colors
                            ${dragging ? 'border-primary bg-primary/10' : 'border-border'}
                            ${uploadStatus === 'success' ? 'border-green-500 bg-green-50 dark:bg-green-900/10' : ''}
                            ${uploadStatus === 'error' ? 'border-destructive bg-red-50 dark:bg-red-900/10' : ''}
                        `}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        {uploadStatus === 'success' ? (
                            <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                        ) : uploadStatus === 'error' ? (
                            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                        ) : (
                            <UploadCloud className="h-12 w-12 text-muted-foreground mb-4" />
                        )}

                        <div className="space-y-2">
                            {file ? (
                                <div className="font-medium flex items-center gap-2 justify-center">
                                    <FileSpreadsheet className="h-4 w-4" />
                                    {file.name}
                                </div>
                            ) : (
                                <>
                                    <p className="text-sm font-medium">Drag & Drop or <label htmlFor="file-upload" className="text-primary hover:underline cursor-pointer">Browse</label></p>
                                    <p className="text-xs text-muted-foreground">Supported formats: .xlsx, .xls</p>
                                </>
                            )}
                            <input
                                id="file-upload"
                                type="file"
                                className="hidden"
                                accept=".xlsx,.xls,.csv"
                                onChange={handleFileChange}
                            />
                        </div>
                    </div>

                    {file && (
                        <div className="mt-6 flex justify-end">
                            <Button onClick={handleUpload} disabled={uploadStatus === 'uploading' || uploadStatus === 'success'}>
                                {uploadStatus === 'uploading' ? 'Uploading...' : uploadStatus === 'success' ? 'Uploaded' : 'Upload File'}
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {statusMessage && (
                <Card className={uploadStatus === 'error' ? "border-destructive" : uploadStatus === 'success' ? "border-green-500" : ""}>
                    <CardContent className="pt-6">
                        <p className={uploadStatus === 'error' ? "text-destructive font-medium" : uploadStatus === 'success' ? "text-green-600 font-medium" : ""}>
                            {statusMessage}
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default Upload;
