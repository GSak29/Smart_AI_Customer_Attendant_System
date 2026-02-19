import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Package, Tags, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useProducts } from '../context/ProductContext';
import { NotificationCard } from '../components/dashboard/NotificationCard';

const Dashboard = () => {
    const { products } = useProducts();

    const totalProducts = products.length;
    const totalCategories = new Set(products.map(p => p.Category)).size;
    const lowStockCount = products.filter(p => p.Stock_Quantity < 10).length;

    const stats = [
        {
            title: "Total Products",
            value: totalProducts.toLocaleString(),
            icon: Package,
            description: "Items in inventory",
        },
        {
            title: "Total Categories",
            value: totalCategories.toString(),
            icon: Tags,
            description: "Active categories",
        },
        {
            title: "Low Stock",
            value: lowStockCount.toString(),
            icon: AlertTriangle,
            description: "Items with < 10 quantity",
            alert: lowStockCount > 0,
        }
    ];

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {stats.map((stat, index) => (
                    <motion.div
                        key={stat.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {stat.title}
                                </CardTitle>
                                <stat.icon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stat.value}</div>
                                <p className={`text-xs ${stat.alert ? 'text-destructive' : 'text-muted-foreground'}`}>
                                    {stat.description}
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
                {/* Placeholder for 4th stat if needed or just leave gap? 
                     User said "remove inventory value". If I remove it, the grid is 4 columns. 
                     If I have 3 items, it will look fine. 
                     Wait, user might want a placeholder for the stat too? 
                     "remove the inventory value ... and instead leave a space card"
                     Actually, I should probably leave a space in the layout or just let the grid handle 3 items.
                     The prompt says "remove the inventory value recent activities". This implies the "Recent Activity" BLOCK.
                     Lets assume removing the stat card entirely is fine. 
                  */}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <NotificationCard />
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Stock Alerts</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {products.filter(p => p.Stock_Quantity < 10).slice(0, 5).map((product, i) => (
                                <div key={product.Product_ID || i} className="flex items-center justify-between border-b pb-2 last:border-0">
                                    <div className="flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4 text-destructive" />
                                        <span className="text-sm text-destructive">Low Stock: {product.Product_Name}</span>
                                    </div>
                                    <span className="text-xs text-muted-foreground">Qty: {product.Stock_Quantity}</span>
                                </div>
                            ))}
                            {products.filter(p => p.Stock_Quantity < 10).length === 0 && (
                                <p className="text-sm text-muted-foreground">No stock alerts.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;
