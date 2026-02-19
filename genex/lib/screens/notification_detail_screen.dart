import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:intl/intl.dart';
import '../models/genex_notification.dart';

class NotificationDetailScreen extends StatefulWidget {
  final GenexNotification notification;

  const NotificationDetailScreen({super.key, required this.notification});

  @override
  State<NotificationDetailScreen> createState() => _NotificationDetailScreenState();
}

class _NotificationDetailScreenState extends State<NotificationDetailScreen> {
  @override
  void initState() {
    super.initState();
    _markAsRead();
  }

  Future<void> _markAsRead() async {
    if (!widget.notification.isRead) {
      try {
        await FirebaseFirestore.instance
            .collection('notifications')
            .doc(widget.notification.id)
            .update({'read': true});
      } catch (e) {
        debugPrint('Error marking notification as read: $e');
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Notification Details'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              widget.notification.title,
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            const SizedBox(height: 8),
            Text(
              DateFormat('MMM d, yyyy h:mm a').format(widget.notification.timestamp),
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: Colors.grey,
                  ),
            ),
            const SizedBox(height: 24),
            Text(
              widget.notification.message,
              style: Theme.of(context).textTheme.bodyLarge,
            ),
          ],
        ),
      ),
    );
  }
}
