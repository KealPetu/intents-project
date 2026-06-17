# Taller Práctico: Comunicación Inter-App mediante Intents Nativos

**Institución:** Escuela Politécnica Nacional

**Materia:** Aplicaciones Móviles

**1. Objetivo General**

Configurar el ciclo de vida y los filtros de comunicación de la aplicación para interactuar con el sistema operativo Android, delegando acciones (marcador, cámara) y capturando flujos de datos externos (compartir texto e imágenes) desde cualquier otra app del dispositivo.

**2. Arquitectura de los Flujos de Trabajo**

Para que este taller funcione de manera homogénea en todos los frameworks, los estudiantes implementarán una nueva sección en su aplicación dividida en dos pestañas o dos flujos claros: Acciones Salientes y Zonas de Recepción.

**Sección A: Módulo de Acciones Salientes (Delegación)**

Esta pantalla contendrá dos paneles independientes:
 
```Plain Text
+-----------------------------------------------------------+
|               MÓDULO: INTENTS SALIENTES                   |
+-----------------------------------------------------------+
| [ Teléfono: 0987654321       ]  [ BOTÓN: INICIAR DIAL ]   |  <-- Panel 1
+-----------------------------------------------------------+
|  +-----------------------+                                |
|  |                       |      [ BOTÓN: TOMAR FOTO ]     |  <-- Panel 2
|  |     [Miniatura]       |                                |
|  |                       |                                |
|  +-----------------------+                                |
+-----------------------------------------------------------+
```
**Flujo del "Llamador Misterioso"** ``(Intent.ACTION_DIAL)``

- Acción: El usuario escribe un número telefónico en un campo de texto y presiona el botón.
- Mecánica de Fondo: El framework debe invocar un Intent con la acción ``android.intent.action.DIAL`` pasando los datos empaquetados en un esquema URI (``tel:xxxxxxxxxx``).
- Resultado esperado: La aplicación propia pasa a segundo plano y se abre la interfaz del teléfono nativo con el número ya digitado, listo para que el usuario presione el botón verde de llamar.

**Flujo de la "Foto Express"** (``MediaStore.ACTION_IMAGE_CAPTURE``)

- Acción: El usuario presiona el botón "Tomar Foto".
- Mecánica de Fondo: La aplicación solicita al sistema operativo abrir la cámara del dispositivo (``android.media.action.IMAGE_CAPTURE``). Al ser una solicitud con retorno de datos (*Activity Result*), la aplicación debe pausarse y quedar a la espera.
- Resultado esperado: El usuario toma la foto, la acepta en la cámara nativa, el sistema operativo cierra la cámara     y devuelve el control al framework multiplataforma. La app debe capturar los bytes de la miniatura (*Bitmap*) y renderizarlos en el contenedor cuadrado de la interfaz.

**Sección B: Módulo de Acciones Entrantes (Filtros en el Manifest)**

Para esta sección, la aplicación no necesita estar abierta. El estudiante debe modificar el archivo estructural del proyecto Android (``AndroidManifest.xml``) dentro de la sección de su ``Activity`` principal para indicarle al sistema operativo que la aplicación tiene la capacidad de procesar datos compartidos.
Los estudiantes deben registrar dos ``<intent-filter>`` específicos:

| Caso de Uso           | Action Requerido                  | MimeType a Filtrar    | Origen del Estímulo externo                               |
| :---                  | :---:                             | :---:                 | ---:                                                      |
| Receptor de Chismes   | ``android.intent.action.SEND``    | ``text/plain``        | Navegador Web, YouTube, WhatsApp (Compartir enlace/texto) |
| Lector de Imágenes    | ``android.intent.action.SEND``    | ``image/*``           | Galería de fotos del dispositivo, Google Fotos            |
 
```Plain Text
+-----------------------------------------------------------+
|               MÓDULO: INTENTS ENTRANTES                   |
+-----------------------------------------------------------+
| Estado: Esperando datos externos...                       |
|                                                           |
| [ Caja de Texto / Label para renderizar texto recibido ]  | <-- Caso Text
|                                                           |
| +-------------------------------------------------------+ |
| |                                                       | |
| |      Contenedor Dinámico para Imagen Recibida         | | <-- Caso Image
| |                                                       | |
| +-------------------------------------------------------+ |
+-----------------------------------------------------------+
```
**El Flujo de Entrada de Datos:**

1. El usuario abre la Galería nativa del teléfono y selecciona una foto.
2. Presiona el botón global de "Compartir".
3. En la lista de aplicaciones compatibles del sistema operativo, debe aparecer el logotipo y nombre de la app creada por el estudiante.
4. Al seleccionar su aplicación, Android arranca (o maximiza) la Activity de la app y le inyecta un objeto ``Intent`` cargado con los datos compartidos.
5. El framework debe inspeccionar el Intent de arranque. Si detecta que viene con datos, extrae el texto o procesa el ``Uri`` de la imagen (por ejemplo, ``content://media/external/images/media/...``) y lo dibuja en pantalla.

**3. Tips de diseño en React Native**

Para capturar datos entrantes cuando la app es abierta desde afuera, se debe analizar cómo el método de inicio (como Linking o librerías específicas de Intents compartidos) captura el objeto inicial que Android envía a la Activity.

**Criterio de Evaluación Académica**

- Persistencia en Segundo Plano: Si la aplicación ya estaba abierta y se comparte un elemento desde la galería, la aplicación no debe crashear; debe actualizar la interfaz de manera fluida.
- Validación de Datos: Si el filtro recibe una imagen, el espacio de texto debe limpiarse o mostrar un indicador de que el dato actual es un archivo binario, y viceversa.