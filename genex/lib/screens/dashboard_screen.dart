// File: lib/screens/dashboard_screen.dart
import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/product.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            Image.asset('assets/logo.png', height: 30),
            const SizedBox(width: 10),
            const Text('Genexa Dashboard'),
          ],
        ),
      ),
      body: StreamBuilder<QuerySnapshot>(
        stream: FirebaseFirestore.instance.collection('products').snapshots(),
        builder: (context, snapshot) {
          if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          }
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          final products = snapshot.data!.docs.map((doc) {
            final data = doc.data() as Map<String, dynamic>;
            // Add ID to data map for model parsing if needed or pass directly
            return Product.fromMap(data);
          }).toList();

          final totalProducts = products.length;
          final categories = products.map((p) => p.category).toSet().length;
          final lowStock = products.where((p) => p.stockQuantity < 10).length;

          return ListView(
            padding: const EdgeInsets.all(16.0),
            children: [
              _buildStatCard('Total Products', totalProducts.toString(), Icons.inventory),
              _buildStatCard('Total Categories', categories.toString(), Icons.category),
              _buildStatCard('Low Stock Items', lowStock.toString(), Icons.warning, isAlert: lowStock > 0),
              const SizedBox(height: 20),
              const Text('Low Stock Alerts', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 10),
              ...products.where((p) => p.stockQuantity < 10).map((p) => Card(
                child: ListTile(
                  leading: const Icon(Icons.warning, color: Colors.red),
                  title: Text(p.productName),
                  subtitle: Text('Qty: ${p.stockQuantity}'),
                ),
              )),
              if (lowStock == 0)
                const Padding(
                  padding: EdgeInsets.all(8.0),
                  child: Text('No stock alerts.', style: TextStyle(color: Colors.grey)),
                ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildStatCard(String title, String value, IconData icon, {bool isAlert = false}) {
    return Card(
      elevation: 4,
      margin: const EdgeInsets.only(bottom: 16),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Row(
          children: [
            Icon(icon, size: 40, color: isAlert ? Colors.red : Colors.blue),
            const SizedBox(width: 20),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontSize: 16, color: Colors.grey)),
                Text(value, style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: isAlert ? Colors.red : Colors.black)),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
