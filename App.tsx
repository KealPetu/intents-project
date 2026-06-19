import React, { useState, useEffect } from 'react';
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
  Platform,
  ScrollView
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useShareIntent } from 'expo-share-intent';

export default function App() {
  const { hasShareIntent, shareIntent, resetShareIntent, error } = useShareIntent();

  // Estados para la Sección A (Salientes)
  const [phoneNumber, setPhoneNumber] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  // Estados para la Sección B (Entrantes)
  const [incomingText, setIncomingText] = useState<string | null>(null);
  const [incomingImage, setIncomingImage] = useState<string | null>(null);

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
      Alert.alert("Permiso Denegado", "Es necesario acceder a la cámara.");
      return;
    }

    // 2. Solicitamos al sistema operativo abrir la cámara del dispositivo
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,  // Permite al usuario recortar la foto
      aspect: [1, 1],       // Forzamos la miniatura cuadrada
      quality: 0.5,
    });

    // 3. Capturamos el retorno de datos (Activity Result)
    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  // ---------------------------------------------------------
  // SECCIÓN B: Lógica Entrante (Recepción de Intents)
  // ---------------------------------------------------------
  useEffect(() => {
    if (!hasShareIntent) return;

    console.log('shareIntent completo:', JSON.stringify(shareIntent, null, 2));
    
    if (shareIntent.type === 'text') {
      setIncomingText(shareIntent.text ?? null);
      setIncomingImage(null);
    } else if (shareIntent.type === 'media') {
      setIncomingImage(shareIntent.files?.[0]?.path ?? null);
      setIncomingText(null);
    }

    resetShareIntent();
  }, [hasShareIntent, resetShareIntent]);

  // Determinar el estado visual
  const statusMessage = (incomingText || incomingImage)
    ? "Estado: ¡Datos recibidos exitosamente!"
    : "Estado: Esperando datos externos...";

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

          {/* ================================================= */}
          {/* SECCIÓN A: ACCIONES SALIENTES                       */}
          {/* ================================================= */}
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

          {/* ================================================= */}
          {/* SECCIÓN B: ACCIONES ENTRANTES                       */}
          {/* ================================================= */}
          <View style={[styles.headerContainer, styles.headerIncoming]}>
            <Text style={styles.headerTitle}>MÓDULO: INTENTS ENTRANTES</Text>
            <Text style={styles.statusText}>{statusMessage}</Text>
          </View>

          {/* Contenedor de Textos / Enlaces Recibidos */}
          <View style={styles.panel}>
            <Text style={styles.panelSubtitle}>&lt;-- Caso Text</Text>
            <View style={styles.incomingTextContainer}>
              <Text style={incomingText ? styles.receivedDataText : styles.placeholderText}>
                {incomingText ? incomingText : "[ Caja de Texto para renderizar texto recibido ]"}
              </Text>
            </View>
          </View>

          {/* Contenedor Dinámico de Imágenes Recibidas */}
          <View style={styles.panel}>
            <Text style={styles.panelSubtitle}>&lt;-- Caso Image</Text>
            <View style={styles.incomingImageWrapper}>
              <View style={styles.dynamicImageContainer}>
                {incomingImage ? (
                  <Image source={{ uri: incomingImage }} style={styles.image} resizeMode="cover" />
                ) : (
                  <Text style={styles.placeholderText}>+</Text>
                )}
              </View>
              <Text style={styles.captionText}>Contenedor Dinámico para Imagen Recibida</Text>
            </View>
          </View>

          {/* Espacio extra al final para scroll fluido */}
          <View style={{ height: 40 }} />

        </ScrollView>
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
    textAlign: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  headerIncoming: {
    marginTop: 20,
    backgroundColor: '#e6f7ff',
    borderColor: '#007AFF',
  },
  statusText: {
    marginTop: 10,
    fontSize: 14,
    color: '#005bb5',
    fontStyle: 'italic',
    fontWeight: '500',
  },
  incomingTextContainer: {
    minHeight: 60,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 15,
    borderRadius: 5,
    backgroundColor: '#fafafa',
    justifyContent: 'center',
  },
  receivedDataText: {
    color: '#333',
    fontSize: 14,
  },
  incomingImageWrapper: {
    alignItems: 'center',
    marginTop: 10,
  },
  dynamicImageContainer: {
    width: 200,
    height: 200,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#999',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eee',
    marginBottom: 10,
  },
  captionText: {
    fontSize: 12,
    color: '#666',
  },
});