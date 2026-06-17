import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  Linking,
  Alert,
  StatusBar,
  Platform
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

export default function App() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  // ---------------------------------------------------------
  // FLUJO 1: "Llamador Misterioso" (Intent.ACTION_DIAL)
  // ---------------------------------------------------------
  const handleDial = () => {
    if (!phoneNumber.trim()) {
      Alert.alert("Atención", "Por favor ingresa un número telefónico.");
      return;
    }

    // Empaquetamos los datos en un esquema URI (tel:xxxxxxxxxx)
    const url = `tel:${phoneNumber}`;

    // El framework invoca el Intent explícito hacia el marcador nativo
    Linking.openURL(url).catch(() => {
      Alert.alert("Error", "No se pudo abrir el marcador telefónico del sistema.");
    });
  };

  // ---------------------------------------------------------
  // FLUJO 2: "Foto Express" (MediaStore.ACTION_IMAGE_CAPTURE)
  // ---------------------------------------------------------
  const handleTakePhoto = async () => {
    // 1. Solicitamos permiso nativo
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert("Permiso Denegado", "Es necesario acceder a la cámara para este flujo.");
      return;
    }

    // 2. Solicitamos al sistema operativo abrir la cámara del dispositivo
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, // Permite al usuario recortar la foto
      aspect: [1, 1],      // Forzamos la miniatura cuadrada
      quality: 0.5,
    });

    // 3. Capturamos el retorno de datos (Activity Result)
    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>

          <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>MÓDULO: INTENTS SALIENTES</Text>
          </View>

          {/* ================= PANEL 1 ================= */}
          <View style={styles.panel}>
            <Text style={styles.panelSubtitle}>&lt;-- Panel 1</Text>
            <View style={styles.row}>
              <TextInput
                style={styles.input}
                placeholder="Teléfono: 0987654321"
                keyboardType="phone-pad"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholderTextColor="#888"
              />
              <TouchableOpacity style={styles.button} onPress={handleDial}>
                <Text style={styles.buttonText}>INICIAR DIAL</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ================= PANEL 2 ================= */}
          <View style={styles.panel}>
            <Text style={styles.panelSubtitle}>&lt;-- Panel 2</Text>
            <View style={styles.rowCentered}>

              {/* Contenedor Cuadrado de la Miniatura */}
              <View style={styles.thumbnailContainer}>
                {photoUri ? (
                  <Image source={{ uri: photoUri }} style={styles.image} />
                ) : (
                  <Text style={styles.placeholderText}>[Miniatura]</Text>
                )}
              </View>

              <TouchableOpacity style={styles.buttonSecondary} onPress={handleTakePhoto}>
                <Text style={styles.buttonText}>TOMAR FOTO</Text>
              </TouchableOpacity>
            </View>
          </View>

        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  headerContainer: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#333',
    padding: 15,
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  panel: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#666',
    padding: 15,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  panelSubtitle: {
    position: 'absolute',
    right: -10,
    top: -12,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 5,
    color: '#666',
    fontSize: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  rowCentered: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginRight: 10,
    borderRadius: 5,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  buttonSecondary: {
    backgroundColor: '#34C759',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  thumbnailContainer: {
    width: 100,
    height: 100,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#999',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eee',
  },
  placeholderText: {
    color: '#999',
    fontSize: 12,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});