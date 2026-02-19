// File: lib/main.dart
import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'firebase_options.dart';
import 'screens/dashboard_screen.dart';
import 'screens/notifications_screen.dart';
import 'services/notification_service.dart';
import 'package:cloud_firestore/cloud_firestore.dart';


void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  await NotificationService().init();
  runApp(const GenexApp());
}

class GenexApp extends StatefulWidget {
  const GenexApp({super.key});

  @override
  State<GenexApp> createState() => _GenexAppState();
}

class _GenexAppState extends State<GenexApp> {
  @override
  void initState() {
    super.initState();
    _listenForAlerts();
  }

  void _listenForAlerts() {
    // Listen for low stock
    FirebaseFirestore.instance.collection('products').snapshots().listen((snapshot) {
      for (var change in snapshot.docChanges) {
        if (change.type == DocumentChangeType.modified || change.type == DocumentChangeType.added) {
          final data = change.doc.data() as Map<String, dynamic>;
          final stock = int.tryParse(data['Stock_Quantity']?.toString() ?? '0') ?? 0;
          final name = data['Product_Name'] ?? 'Product';
          
          if (stock < 10) {
            NotificationService().showNotification(
              id: name.hashCode,
              title: 'Low Stock Alert',
              body: '$name is running low ($stock remaining).',
            );
          }
        }
      }
    });

    // Listen for new notifications
    FirebaseFirestore.instance.collection('notifications').snapshots().listen((snapshot) {
      for (var change in snapshot.docChanges) {
        if (change.type == DocumentChangeType.added) {
          final data = change.doc.data() as Map<String, dynamic>;
          final title = data['title'] ?? 'New Alert';
          final message = data['message'] ?? '';
          
          NotificationService().showNotification(
            id: DateTime.now().millisecondsSinceEpoch ~/ 1000,
            title: title,
            body: message,
          );
        }
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Genex',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue),
        useMaterial3: true,
      ),
      home: const MainScreen(),
    );
  }
}

class MainScreen extends StatefulWidget {
  const MainScreen({super.key});

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  int _selectedIndex = 0;
  
  static const List<Widget> _widgetOptions = <Widget>[
    DashboardScreen(),
    NotificationsScreen(),
  ];

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _widgetOptions.elementAt(_selectedIndex),
      bottomNavigationBar: BottomNavigationBar(
        items: const <BottomNavigationBarItem>[
          BottomNavigationBarItem(
            icon: Icon(Icons.dashboard),
            label: 'Dashboard',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.notifications),
            label: 'Alerts',
          ),
        ],
        currentIndex: _selectedIndex,
        selectedItemColor: Colors.blue,
        onTap: _onItemTapped,
      ),
    );
  }
}
