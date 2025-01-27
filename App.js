// StAuth10244: I Nisarg Khatri, 000881890 certify that this material is my original work. No other person's work has been used without due acknowledgement. I have not made my work available to anyone else.

import React, { useState, useEffect } from 'react';
import { Text, View, TouchableOpacity, StyleSheet, Image, ScrollView, Alert } from 'react-native';
import { Camera } from 'expo-camera';
import { FontAwesome } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraRef, setCameraRef] = useState(null);
  const [isFrontCamera, setIsFrontCamera] = useState(true); // Use front camera by default
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [mood, setMood] = useState(null);
  const [photoMemories, setPhotoMemories] = useState([]);

  useEffect(() => {
    (async () => {
      const { status } = await Camera;
      setHasPermission(status === 'granted');
    })();
  }, []);

  const toggleCameraType = () => {
    setIsFrontCamera((prevState) => !prevState);
  };

  const takePicture = async () => {
    if (cameraRef) {
      const photo = await cameraRef.takePictureAsync();
      setCapturedPhoto(photo.uri);
      analyzeMood(photo.uri);
      savePhotoMemory(photo.uri);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      setCapturedPhoto(result.uri);
      analyzeMood(result.uri);
      savePhotoMemory(result.uri);
    }
  };

  const analyzeMood = async (photoUri) => {
    const moods = ['happy', 'sad', 'angry', 'surprised'];
    const randomMood = moods[Math.floor(Math.random() * moods.length)];
    setMood(randomMood);

    setTimeout(() => {
      setMood(null);
    }, 5000);
  };

  const savePhotoMemory = (photoUri) => {
    setPhotoMemories([...photoMemories, photoUri]);
  };

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <Camera 
        style={styles.camera} 
        type={isFrontCamera ? Camera.Constants.Type.front : Camera.Constants.Type.back}
        ref={(ref) => setCameraRef(ref)}
        pictureSize="High"
        quality={0.5}
      >
        <View style={styles.cameraControlsContainer}>
          <TouchableOpacity
            style={styles.flipButton}
            onPress={toggleCameraType}
          >
            <FontAwesome name="refresh" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </Camera>
      <TouchableOpacity
        style={styles.captureButton}
        onPress={takePicture}
      >
        <FontAwesome name="camera" size={24} color="white" />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.galleryButton}
        onPress={pickImage}
      >
        <FontAwesome name="image" size={24} color="white" />
      </TouchableOpacity>
      {capturedPhoto && mood && (
        <View style={styles.moodContainer}>
          <Text style={styles.moodText}>Detected Mood: {mood}</Text>
        </View>
      )}
      <View style={styles.photoMemoriesBackground}>
        <ScrollView horizontal contentContainerStyle={styles.photoMemoriesContainer}>
          {photoMemories.map((memory, index) => (
            <Image key={index} source={{ uri: memory }} style={styles.memoryImage} />
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  camera: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  cameraControlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 20,
  },
  flipButton: {
    padding: 20,
  },
  captureButton: {
    position: 'absolute',
    bottom: 20,
    left: '50%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 50,
    transform: [{ translateX: -25 }],
    zIndex: 1,
  },
  galleryButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 50,
    zIndex: 1,
  },
  moodContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 10,
    borderRadius: 10,
    zIndex: 1,
  },
  moodText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  photoMemoriesBackground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '20%',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  photoMemoriesContainer: {
    paddingHorizontal: 10,
  },
  memoryImage: {
    width: 100,
    height: '100%',
    marginHorizontal: 5,
    borderRadius: 10,
  },
});
