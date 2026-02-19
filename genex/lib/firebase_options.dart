// File: lib/firebase_options.dart
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/foundation.dart' show defaultTargetPlatform, kIsWeb, TargetPlatform;

/// Default [FirebaseOptions] for use with your Firebase apps.
///
/// Example:
/// ```dart
/// import 'firebase_options.dart';
/// // ...
/// await Firebase.initializeApp(
///   options: DefaultFirebaseOptions.currentPlatform,
/// );
/// ```
class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) {
      return web;
    }
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return android;
      case TargetPlatform.iOS:
        return ios;
      case TargetPlatform.macOS:
        return macos;
      case TargetPlatform.windows:
        throw UnsupportedError(
          'DefaultFirebaseOptions have not been configured for windows - '
          'you can reconfigure this by running the FlutterFire CLI again.',
        );
      case TargetPlatform.linux:
        throw UnsupportedError(
          'DefaultFirebaseOptions have not been configured for linux - '
          'you can reconfigure this by running the FlutterFire CLI again.',
        );
      default:
        throw UnsupportedError(
          'DefaultFirebaseOptions are not supported for this platform.',
        );
    }
  }

  static const FirebaseOptions web = FirebaseOptions(
    apiKey: 'AIzaSyCVIEGM5kR9bSING72kQhG0YDaUdwxkAig',
    appId: '1:154269749406:web:d8fca1550663cf50fcab8f',
    messagingSenderId: '154269749406',
    projectId: 'smartretail-iot',
    authDomain: 'smartretail-iot.firebaseapp.com',
    storageBucket: 'smartretail-iot.firebasestorage.app',
    databaseURL: 'https://smartretail-iot-default-rtdb.firebaseio.com',
  );

  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'AIzaSyCVIEGM5kR9bSING72kQhG0YDaUdwxkAig',
    appId: '1:154269749406:web:d8fca1550663cf50fcab8f', // Using web AppID as placeholder if Android app not created in console yet. Ideally should be Android App ID.
    messagingSenderId: '154269749406',
    projectId: 'smartretail-iot',
    storageBucket: 'smartretail-iot.firebasestorage.app',
    databaseURL: 'https://smartretail-iot-default-rtdb.firebaseio.com',
  );

  static const FirebaseOptions ios = FirebaseOptions(
    apiKey: 'AIzaSyCVIEGM5kR9bSING72kQhG0YDaUdwxkAig',
    appId: '1:154269749406:web:d8fca1550663cf50fcab8f', // Using web AppID as placeholder
    messagingSenderId: '154269749406',
    projectId: 'smartretail-iot',
    storageBucket: 'smartretail-iot.firebasestorage.app',
    databaseURL: 'https://smartretail-iot-default-rtdb.firebaseio.com',
  );

  static const FirebaseOptions macos = FirebaseOptions(
    apiKey: 'AIzaSyCVIEGM5kR9bSING72kQhG0YDaUdwxkAig',
    appId: '1:154269749406:web:d8fca1550663cf50fcab8f', // Using web AppID as placeholder
    messagingSenderId: '154269749406',
    projectId: 'smartretail-iot',
    storageBucket: 'smartretail-iot.firebasestorage.app',
    databaseURL: 'https://smartretail-iot-default-rtdb.firebaseio.com',
  );
}
