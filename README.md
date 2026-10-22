# Intendencia — Pedidos de trabajo (prueba piloto)

Herramienta interna de la Intendencia de la Cámara Nacional de Apelaciones en lo Comercial para anotar y seguir los trabajos de mantenimiento en los edificios de Diagonal, Callao y Montevideo.

Esta versión es la **primera prueba piloto**: se dejó solo lo esencial y se rediseñó para que la pueda usar cualquier persona, aunque tenga poca práctica con la computadora.

## Qué tiene

- **Pedidos**: un botón grande «Nuevo pedido» y tres pasos con botones grandes:
  1. ¿Quién tiene que hacerlo? (Electricista, Plomero, Carpintero, Técnico de aire, Pintor, Albañil, Tapicero, Ayudante, Administrativo) y ¿qué hay que hacer?
  2. ¿Dónde? Edificio y dependencia. El piso sale solo de la Guía Judicial PJN; se puede agregar la oficina.
  3. ¿Es urgente? Sí o no, y una nota opcional.

  Antes de guardar se muestra un resumen. Desde ahí se puede guardar y avisar por WhatsApp.
- **Lista de pedidos**: «Por hacer» y «Terminados». Los urgentes aparecen primero. Cuando hay muchos pedidos aparecen un buscador y botones por edificio.
- **Cada pedido**: cuatro botones de estado (Pendiente, En curso, Faltan materiales, Terminado). También se puede avisar por WhatsApp, imprimir la orden en A4 (blanco y negro, Arial), modificarlo o borrarlo. Terminar o borrar se puede **deshacer** durante unos segundos.
- **Herramientas**: qué hay y a qué oficio se le prestó. Tiene el botón «Ya la devolvió».
- **Contactos**: guía de juzgados, salas y oficinas. El teléfono se puede tocar para llamar. También se pueden agregar contactos propios.
- **Ajustes**: tamaño de letra (Normal, Grande, Muy grande), el número de WhatsApp de cada oficio y la copia de seguridad.

## Qué cambió respecto de la versión 19

- No hay nombres de empleados: se trabaja con **oficios**. El número de WhatsApp se carga una vez por oficio en Ajustes.
- Quedan ocultos: Recordatorios, Obras, Guías, Servicios, Insumos y el panel de métricas. **Sus datos no se borran**: siguen guardados en el navegador y en las copias de seguridad, por si se vuelven a activar.
- Prioridad simplificada: «Normal» o «Urgente». Los pedidos viejos con Alta o Baja se ven como normales y conservan su valor.
- Estados: «Sin asignar» pasa a «Pendiente»; «En proceso» se muestra como «En curso» y «Faltan insumos» como «Faltan materiales».
- Las herramientas que estaban prestadas a una persona pasan a figurar prestadas a su oficio.
- No se cargan pedidos ni herramientas de ejemplo: la aplicación arranca vacía.
- Se quitaron los atajos de teclado y los filtros avanzados. El botón Atrás del navegador funciona en todas las pantallas.

## Dónde se guardan los datos

En el navegador de cada computadora (`localStorage`, misma clave que la versión 19: `intendencia-estado-v2`). Al actualizar desde la versión 19 **no se pierde nada**: los datos existentes se adaptan solos la primera vez que se abre.

- Cada computadora tiene sus propios datos. Si se borra el historial del navegador, se pierden.
- **Guardar una copia** (Ajustes) descarga un archivo `.json`. Si hace más de una semana que no se guarda, la pantalla de pedidos lo recuerda.
- **Recuperar desde una copia** reemplaza los datos de esa computadora. Acepta también las copias de la versión 19.

## Archivos

- `index.html`: estructura de la página.
- `styles.css`: diseño, incluida la hoja impresa.
- `core.js`: lógica sin pantalla (oficios, tareas, dependencias, mensajes, adaptación de datos viejos).
- `app.js`: pantallas.
- `contacts-data.js`: guía PJN transcrita el 16/09/2026.
- `tests/core.test.cjs`: pruebas. Se corren con `node tests/core.test.cjs`.

Los archivos de la versión anterior (`ux.js`, `modules.js`, `supplies.js`, etc.) se quitaron y quedan en el historial del repositorio.

## Publicación

GitHub Pages, rama `main`, carpeta raíz. Después de publicar, recargar sin caché (Ctrl+Shift+R en Windows, Cmd+Shift+R en Mac).

Para probarla en la propia computadora: `python3 -m http.server 8080` dentro de esta carpeta y abrir `http://localhost:8080`.
