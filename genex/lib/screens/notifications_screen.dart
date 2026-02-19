// File: lib/screens/notifications_screen.dart
import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:intl/intl.dart';
import '../models/genex_notification.dart';
import 'notification_detail_screen.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  final Set<String> _selectedIds = {};
  bool _isSelectionMode = false;
  // We don't necessarily need to track tab index if we only show "Clear All" when appropriate,
  // but tracking it helps for UI logic. 
  // However, since we are wrapping Scaffold in StreamBuilder, we need access to TabController to know the index.
  // Using DefaultTabController.of(context) requires a Builder below DefaultTabController.
  
  void _toggleSelection(String id) {
    setState(() {
      if (_selectedIds.contains(id)) {
        _selectedIds.remove(id);
        if (_selectedIds.isEmpty) {
          _isSelectionMode = false;
        }
      } else {
        _selectedIds.add(id);
      }
    });
  }

  void _enterSelectionMode(String id) {
    setState(() {
      _isSelectionMode = true;
      _selectedIds.add(id);
    });
  }

  void _cancelSelection() {
    setState(() {
      _isSelectionMode = false;
      _selectedIds.clear();
    });
  }

  Future<void> _deleteSelected() async {
    final count = _selectedIds.length;
    if (count == 0) return;

    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Notifications'),
        content: Text('Are you sure you want to delete $count notification(s)?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Delete', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      final batch = FirebaseFirestore.instance.batch();
      for (final id in _selectedIds) {
        final docRef = FirebaseFirestore.instance.collection('notifications').doc(id);
        batch.delete(docRef);
      }

      await batch.commit();
      _cancelSelection();
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('$count notification(s) deleted')),
        );
      }
    }
  }

  Future<void> _clearAllIds(List<String> ids) async {
    if (ids.isEmpty) return;

    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Clear History'),
        content: const Text('Are you sure you want to delete ALL notifications in this list?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Clear All', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      final batch = FirebaseFirestore.instance.batch();
      for (final id in ids) {
        final docRef = FirebaseFirestore.instance.collection('notifications').doc(id);
        batch.delete(docRef);
      }
      await batch.commit();

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('History cleared')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 2,
      child: Builder(
        builder: (context) {
          // Listen to tab changes to cancel selection mode or update UI
          final TabController tabController = DefaultTabController.of(context);
          tabController.addListener(() {
            if (!tabController.indexIsChanging && _isSelectionMode) {
               // Optional: Cancel selection when switching tabs
               // setState(() => _cancelSelection()); 
               // Note: Calling setState during build or listener might be risky if not handled carefully.
               // For now, we'll let selection persist or manual cancel. 
               // Actually, it's better to cancel selection if the user switches tabs to avoid confusion.
               if (mounted) {
                  // We need to defer this to next frame or ensure it doesn't conflict
               }
            }
            // We need to trigger rebuild to update "Clear All" button visibility if we want it conditional
            // But setState here might cause loops.
            // Simplified approach: Always show "Clear All" but it applies to the visible list? 
            // Or just put "Clear All" inside the list view as a header? No, AppBar is better.
          });

          return StreamBuilder<QuerySnapshot>(
            stream: FirebaseFirestore.instance
                .collection('notifications')
                .orderBy('timestamp', descending: true)
                .snapshots(),
            builder: (context, snapshot) {
              if (snapshot.hasError) {
                return Scaffold(appBar: AppBar(title: const Text('Notifications')), body: Center(child: Text('Error: ${snapshot.error}')));
              }
              if (!snapshot.hasData) {
                 return Scaffold(appBar: AppBar(title: const Text('Notifications')), body: const Center(child: CircularProgressIndicator()));
              }

              final allDocs = snapshot.data!.docs;
              final notifications = allDocs
                  .map((doc) => GenexNotification.fromFirestore(doc))
                  .toList();

              final unread = notifications.where((n) => !n.isRead).toList();
              final read = notifications.where((n) => n.isRead).toList();

              // Determine current tab index for "Clear All" button logic
              // Since we are inside a stream builder which rebuilds on data, we can't easily rely on tabController listener solely for rebuilding scaffolding.
              // But we can check tabController.index.
              // However, tabController.index might not trigger rebuild of this widget when it changes unless we listen to it.
              // AnimatedBuilder can listen to the controller.
              
              return AnimatedBuilder(
                animation: tabController,
                builder: (context, child) {
                  final currentIndex = tabController.index;
                  
                  return Scaffold(
                    appBar: AppBar(
                      title: _isSelectionMode
                          ? Text('${_selectedIds.length} selected')
                          : const Text('Notifications'),
                      leading: _isSelectionMode
                          ? IconButton(
                              icon: const Icon(Icons.close),
                              onPressed: _cancelSelection,
                            )
                          : null,
                      actions: _isSelectionMode
                          ? [
                              IconButton(
                                icon: const Icon(Icons.delete),
                                onPressed: _deleteSelected,
                              ),
                            ]
                          : [
                              // Only show Clear All on Read tab (index 1) or potentially Unread (index 0) if desired.
                              // User request: "delete the history option". Usually implies history/read.
                              if (currentIndex == 1 && read.isNotEmpty)
                                IconButton(
                                  icon: const Icon(Icons.delete_sweep),
                                  tooltip: 'Clear History',
                                  onPressed: () => _clearAllIds(read.map((n) => n.id).toList()),
                                ),
                            ],
                      bottom: const TabBar(
                        tabs: [
                          Tab(text: 'Unread'),
                          Tab(text: 'Read'),
                        ],
                      ),
                    ),
                    body: TabBarView(
                      children: [
                        _buildNotificationList(unread),
                        _buildNotificationList(read),
                      ],
                    ),
                  );
                }
              );
            },
          );
        }
      ),
    );
  }

  Widget _buildNotificationList(List<GenexNotification> list) {
    if (list.isEmpty) {
      return const Center(child: Text('No notifications.'));
    }
    return ListView.builder(
      itemCount: list.length,
      itemBuilder: (context, index) {
        final notification = list[index];
        final isSelected = _selectedIds.contains(notification.id);

        return Card(
          margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          color: isSelected ? Colors.blue.withOpacity(0.1) : null,
          child: ListTile(
            leading: _isSelectionMode
                ? Checkbox(
                    value: isSelected,
                    onChanged: (bool? value) {
                      _toggleSelection(notification.id);
                    },
                  )
                : Icon(
                    notification.isRead ? Icons.mark_email_read : Icons.mark_email_unread,
                    color: notification.isRead ? Colors.grey : Colors.blue,
                  ),
            title: Text(
              notification.title, 
              style: TextStyle(fontWeight: notification.isRead ? FontWeight.normal : FontWeight.bold)
            ),
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
              if (_isSelectionMode) {
                _toggleSelection(notification.id);
              } else {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => NotificationDetailScreen(notification: notification),
                  ),
                );
              }
            },
            onLongPress: () {
              if (!_isSelectionMode) {
                _enterSelectionMode(notification.id);
              }
            },
          ),
        );
      },
    );
  }
}
