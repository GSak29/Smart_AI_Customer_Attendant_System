// File: lib/screens/notifications_screen.dart
import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:intl/intl.dart';
import '../models/genex_notification.dart';
import 'notification_detail_screen.dart';

class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 2,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Notifications'),
          bottom: const TabBar(
            tabs: [
              Tab(text: 'Unread'),
              Tab(text: 'Read'),
            ],
          ),
        ),
        body: StreamBuilder<QuerySnapshot>(
          stream: FirebaseFirestore.instance
              .collection('notifications')
              .orderBy('timestamp', descending: true)
              .snapshots(),
          builder: (context, snapshot) {
            if (snapshot.hasError) return Center(child: Text('Error: ${snapshot.error}'));
            if (!snapshot.hasData) return const Center(child: CircularProgressIndicator());

            final notifications = snapshot.data!.docs
                .map((doc) => GenexNotification.fromFirestore(doc))
                .toList();

            final unread = notifications.where((n) => !n.isRead).toList();
            final read = notifications.where((n) => n.isRead).toList();

            return TabBarView(
              children: [
                _buildNotificationList(unread, context),
                _buildNotificationList(read, context),
              ],
            );
          },
        ),
      ),
    );
  }

  Widget _buildNotificationList(List<GenexNotification> list, BuildContext context) {
    if (list.isEmpty) {
      return const Center(child: Text('No notifications.'));
    }
    return ListView.builder(
      itemCount: list.length,
      itemBuilder: (context, index) {
        final notification = list[index];
        return Card(
          margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          child: ListTile(
            leading: Icon(
              notification.isRead ? Icons.mark_email_read : Icons.mark_email_unread,
              color: notification.isRead ? Colors.grey : Colors.blue,
            ),
            title: Text(notification.title, style: TextStyle(fontWeight: notification.isRead ? FontWeight.normal : FontWeight.bold)),
            subtitle: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(notification.message),
                const SizedBox(height: 4),
                Text(
                  DateFormat('MMM d, h:mm a').format(notification.timestamp),
                  style: const TextStyle(fontSize: 12, color: Colors.grey),
                ),
              ],
            ),
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => NotificationDetailScreen(notification: notification),
                    ),
                  );
                },
          ),
        );
      },
    );
  }
}
