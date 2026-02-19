import { useState } from 'react';
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
import { Plus, Edit, Trash } from 'lucide-react';

interface Category {
    id: string;
    name: string;
    productCount: number;
    description: string;
}

const mockCategories: Category[] = [
    { id: '1', name: 'Furniture', productCount: 120, description: 'Chairs, Tables, Sofas' },
    { id: '2', name: 'Decor', productCount: 45, description: 'Vases, Paintings' },
    { id: '3', name: 'Lighting', productCount: 30, description: 'Lamps, Bulbs' },
];

const Categories = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Categories</h2>
                    <p className="text-muted-foreground">Manage product categories.</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Category
                </Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Category Name</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Products</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {mockCategories.map((cat) => (
                            <TableRow key={cat.id}>
                                <TableCell className="font-medium">{cat.name}</TableCell>
                                <TableCell>{cat.description}</TableCell>
                                <TableCell>{cat.productCount}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                                            <Trash className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Category">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Category Name</label>
                        <Input placeholder="Enter name" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Description</label>
                        <Input placeholder="Enter description" />
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button onClick={() => setIsModalOpen(false)}>Save</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Categories;
