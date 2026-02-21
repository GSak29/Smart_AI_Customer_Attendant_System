// File: lib/models/genex_notification.dart
import 'package:cloud_firestore/cloud_firestore.dart';

class GenexNotification {
  final String id;
  final String title;
  final String message;
  final DateTime timestamp;
  final bool isRead;

  GenexNotification({
    required this.id,
    required this.title,
    required this.message,
    required this.timestamp,
    required this.isRead,
  });

  factory GenexNotification.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    return GenexNotification(
      id: doc.id,
      title: data['title'] ?? '',
      message: data['message'] ?? '',
      timestamp: (data['timestamp'] as Timestamp?)?.toDate() ?? DateTime.now(),
      // Mapped from 'read' in Firestore to 'isRead' in Dart model
      isRead: data['read'] ?? false,
    );
  }
}
