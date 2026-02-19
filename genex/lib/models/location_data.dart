// File: lib/models/location_data.dart
class LocationDataModel {
  final String id;
  final double latitude;
  final double longitude;
  final String name;

  LocationDataModel({
    required this.id,
    required this.latitude,
    required this.longitude,
    required this.name,
  });

  factory LocationDataModel.fromMap(String id, Map<String, dynamic> data) {
    return LocationDataModel(
      id: id,
      latitude: (data['latitude'] as num?)?.toDouble() ?? 0.0,
      longitude: (data['longitude'] as num?)?.toDouble() ?? 0.0,
      name: data['name'] ?? 'Unknown',
    );
  }
}
