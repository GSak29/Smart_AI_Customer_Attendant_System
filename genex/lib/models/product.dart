// File: lib/models/product.dart
class Product {
  final String productId;
  final String category;
  final String productName;
  final int stockQuantity;
  final double priceMin;
  final double priceMax;

  Product({
    required this.productId,
    required this.category,
    required this.productName,
    required this.stockQuantity,
    this.priceMin = 0.0,
    this.priceMax = 0.0,
  });

  factory Product.fromMap(Map<String, dynamic> data) {
    return Product(
      productId: data['Product_ID']?.toString() ?? '',
      category: data['Category']?.toString() ?? '',
      productName: data['Product_Name']?.toString() ?? '',
      stockQuantity: int.tryParse(data['Stock_Quantity']?.toString() ?? '0') ?? 0,
      priceMin: double.tryParse(data['Price_Min_INR']?.toString() ?? '0.0') ?? 0.0,
      priceMax: double.tryParse(data['Price_Max_INR']?.toString() ?? '0.0') ?? 0.0,
    );
  }
}
