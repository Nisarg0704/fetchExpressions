import React, { useState, useEffect, useRef } from 'react';
import { Text, View, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import { Camera } from 'expo-camera';
import { FontAwesome } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';
import * as ImageManipulator from 'expo-image-manipulator';

export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraRef, setCameraRef] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const takePicture = async () => {
    if (cameraRef) {
      const photo = await cameraRef.takePictureAsync();
      setCapturedPhoto(photo.uri);
      savePhoto(photo.uri);
    }
  };

  const savePhoto = async (photoUri) => {
    if (isSaving) return; // Prevent multiple saves
    setIsSaving(true);
    try {
      const resizedPhoto = await resizePhoto(photoUri);
      await MediaLibrary.saveToLibraryAsync(resizedPhoto.uri);
      setIsSaving(false);
      Alert.alert('Success', 'Photo saved to library!');
    } catch (error) {
      console.error('Error saving photo to library:', error);
      setIsSaving(false);
      Alert.alert('Error', 'Failed to save photo. Please try again.');
    }
  };

  const resizePhoto = async (photoUri) => {
    const resizedPhoto = await ImageManipulator.manipulateAsync(
      photoUri,
      [{ resize: { width: 800 } }],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );
    return resizedPhoto;
  };

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }
  return (
    <View style={{ flex: 1 }}>
      <Camera
        style={{ flex: 1 }}
        type={type}
        ref={(ref) => setCameraRef(ref)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'transparent',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'flex-end',
          }}
        >
          <TouchableOpacity
            style={styles.flipButton}
            onPress={() => {
              setType(
                type === Camera.Constants.Type.back
                  ? Camera.Constants.Type.front
                  : Camera.Constants.Type.back
              );
            }}
          >
            <FontAwesome name="refresh" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.captureButton}
            onPress={takePicture}
          >
            <FontAwesome name="camera" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </Camera>
      {capturedPhoto && (
        <View style={styles.preview}>
          <Image source={{ uri: capturedPhoto }} style={styles.previewImage} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flipButton: {
    alignSelf: 'flex-end',
    margin: 20,
  },
  captureButton: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  preview: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  previewImage: {
    width: 300,
    height: 400,
    borderRadius: 10,
  },
});
