# Conectar la aplicación con una planilla de Google

Con la planilla, todas las computadoras ven y cargan los mismos pedidos. Se arma una sola vez, en unos 10 minutos.

## 1. Crear la planilla

1. Entrá a [sheets.google.com](https://sheets.google.com) con la cuenta que va a guardar los datos.
2. Creá una planilla en blanco y ponele de nombre **Intendencia · Pedidos**.

## 2. Pegar el código

1. En la planilla, abrí el menú **Extensiones › Apps Script**. Se abre una pestaña nueva con un editor.
2. Borrá todo lo que aparece escrito en el editor.
3. Pegá el contenido completo de [`Codigo.gs`](Codigo.gs).
4. En la línea que dice `const CLAVE = 'CAMBIAR-ESTA-CLAVE';`, cambiá `CAMBIAR-ESTA-CLAVE` por una clave propia: letras y números, sin espacios, por ejemplo `Intendencia2026Diagonal`. Anotala, porque se usa en el paso 4.
5. Tocá el ícono del disquete (**Guardar proyecto**).

## 3. Publicar como aplicación web

1. Arriba a la derecha, tocá **Implementar › Nueva implementación**.
2. En el engranaje de «Seleccionar tipo», elegí **Aplicación web**.
3. Completá así:
   - **Descripción**: Intendencia
   - **Ejecutar como**: Yo (tu cuenta)
   - **Quién tiene acceso**: Cualquier persona
4. Tocá **Implementar**.
5. Google pide autorizar el acceso a la planilla:
   - Tocá **Autorizar acceso** y elegí tu cuenta.
   - Si aparece «Google no verificó esta app», tocá **Configuración avanzada** y después **Ir a Intendencia (no seguro)**. Es normal: el código es tuyo y solo usa esta planilla.
   - Tocá **Permitir**.
6. Copiá la **URL de la aplicación web**. Empieza con `https://script.google.com/macros/s/` y termina en `/exec`.

«Cualquier persona» quiere decir que la dirección responde sin pedir cuenta de Google. Lo que protege los datos es la clave: sin ella, la planilla no muestra ni guarda nada.

## 4. Conectar cada computadora

En cada computadora que vaya a usar la aplicación:

1. Abrí la aplicación: aparece la pantalla **Conectá esta computadora**.
2. Pegá la dirección del paso 3 y escribí la clave del paso 2.
3. Tocá **Conectar**.

Mientras una computadora no esté conectada, la aplicación muestra solo la pantalla «Conectá esta computadora». Si esa computadora tenía datos cargados por su cuenta, al conectarla se descarga una copia de esos datos por las dudas y se muestran los de la planilla.

Arriba de la pantalla aparece el estado de la conexión: **Al día**, **Guardando…** o **Sin conexión**. Sin internet se pueden seguir marcando estados: los cambios quedan en espera y se envían solos cuando vuelve la conexión. Lo que sí necesita conexión es crear un pedido nuevo, porque el número lo asigna la planilla para que dos computadoras no usen el mismo.

## La planilla

- Tiene tres pestañas: **Pedidos**, **Herramientas** y **Contactos**. Se crean solas con el primer dato.
- Se puede mirar, filtrar, ordenar e imprimir sin problema.
- **No cambies los títulos ni el orden de las columnas, y no borres la columna oculta «datos».** Ahí está la información que usa la aplicación.
- Para corregir un pedido, usá la aplicación. Lo que se escribe a mano en la planilla se pisa con el próximo cambio desde la aplicación.
- Google guarda el historial de versiones (**Archivo › Historial de versiones**), así que si algo se borra por error se puede recuperar.

## Empezar de cero (borrar los datos de prueba)

En la planilla, en las pestañas **Pedidos** y **Herramientas** (y **Contactos** si cargaste alguno de prueba):

1. Hacé clic en el número **2** de la izquierda (la primera fila después de los títulos).
2. Con **Mayúscula** apretada, hacé clic en el número de la última fila con datos.
3. Clic derecho › **Borrar filas**.

No borres la fila 1 (los títulos). Las computadoras conectadas se actualizan solas en menos de un minuto. Los números de pedido vuelven a empezar en OT-0001.

## Pasar a la cuenta institucional

1. Con la cuenta institucional, abrí la planilla (compartila primero si hace falta) y usá **Archivo › Hacer una copia**. La copia incluye los datos y el código.
2. En la copia, abrí **Extensiones › Apps Script**, cambiá la clave si querés y repetí el paso 3. Vas a obtener una dirección nueva.
3. En cada computadora: **Ajustes › Planilla compartida › Desconectar esta computadora**, y después conectá con la dirección y la clave nuevas.
4. Cuando todas las computadoras usen la nueva, la planilla de la prueba se puede archivar.

## Si se actualiza el código

Si más adelante hay que cambiar `Codigo.gs`, después de pegar el código nuevo usá **Implementar › Administrar implementaciones**. Tocá el lápiz, elegí **Versión: nueva versión** y tocá **Implementar**. Así la dirección no cambia y no hay que reconectar las computadoras.
