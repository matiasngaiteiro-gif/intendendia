# Intendencia — Pedidos de trabajo (prueba piloto)

Herramienta interna de la Intendencia de la Cámara Nacional de Apelaciones en lo Comercial para anotar y seguir los trabajos de mantenimiento en los edificios de Diagonal, Callao y Montevideo.

Esta versión es la **primera prueba piloto**: se dejó solo lo esencial y se rediseñó para que la pueda usar cualquier persona, aunque tenga poca práctica con la computadora.

## Qué tiene

- **Pedidos**: un botón grande «Nuevo pedido» y tres pasos con botones grandes:
  1. ¿Quién tiene que hacerlo? (Electricista, Plomero, Carpintero, Técnico de aire, Pintor, Albañil, Herrero, Tapicero, Ayudante, Portería, Administrativo) y ¿qué hay que hacer?
  2. ¿Dónde? Edificio y dependencia. El piso sale solo de la Guía Judicial PJN; se puede agregar la oficina.
  3. ¿Es urgente? Sí o no, y una nota opcional.

  Antes de guardar se muestra un resumen. Desde ahí se puede «Guardar e imprimir» para archivar la orden en papel.
- **Lista de pedidos**: «Por hacer» y «Terminados». Los urgentes aparecen primero. Cuando hay muchos pedidos aparecen un buscador y botones por edificio.
- **Cada pedido**: cuatro botones de estado (Pendiente, En curso, Faltan materiales, Terminado). También se puede imprimir, modificar o borrar.
- **Orden impresa**: dos copias iguales en una hoja A4, con una línea punteada al medio para cortar. Cada copia es informativa, en blanco y negro y con Arial. Lleva número, fecha del pedido, trabajo, edificio, dependencia, piso u oficina, oficio e indicaciones, y marca «Urgente» cuando corresponde. Al final de cada copia hay un espacio para la firma y sello de la dependencia. No incluye el estado, los horarios de inicio y fin, los materiales ni firmas: informa, no controla. Los márgenes son amplios para que no se corten al imprimir. Terminar o borrar se puede **deshacer** durante unos segundos.
- **Inventario**: los elementos del depósito agrupados por categoría, con buscador. Control de stock: los botones − y + suman o restan de a uno; tocando la cantidad se registra una **salida**, una **entrada** o un **recuento** de cualquier cantidad, con motivo (por ejemplo, el número de pedido). Cada elemento guarda sus últimos 50 movimientos, y no deja sacar más de lo que hay. Filtros: buscador, categoría, estado, ubicación (si hay cargadas) y situación del stock (con stock, sin stock, sin contar), con «Quitar filtros». Se cargan de a uno o todos juntos desde un Excel (.xlsx) o .csv con las columnas Categoría, Elemento, Detalle / variante, Cantidad, Unidad, Estado, Ubicación y Observaciones (solo «Elemento» es obligatoria). Si se vuelve a cargar el mismo archivo, los elementos que ya estaban se actualizan en lugar de duplicarse. Un mismo elemento con distinto estado (por ejemplo, rollos nuevos y en uso) se cuenta por separado.
- **Herramientas**: qué hay y a qué persona está asignada cada una (se escribe el nombre; los nombres ya usados se sugieren solos). «Quitar la asignación» la vuelve a dejar disponible y queda en el historial.
- **Contactos**: guía de juzgados, salas y oficinas. El teléfono se puede tocar para llamar. También se pueden agregar contactos propios.
- **Ajustes**: tamaño de letra (Normal, Grande, Muy grande) y la copia de seguridad.
- **Descargar Excel** en cada sección (Pedidos, Inventario, Herramientas y Contactos): baja lo que se ve en pantalla, con los filtros aplicados, en el mismo formato del Excel de inventario (columna N°, Arial, blanco y negro, apaisado y ajustado al ancho de la hoja, títulos repetidos en cada página).
- **Copia de los viernes**: el Excel trae las hojas Pedidos, Herramientas, Inventario y Movimientos.
- **Copia de los viernes (detalle)**: todos los viernes desde las 12:00 (hora de Argentina) aparece un aviso en Pedidos para guardar la copia de la semana, en cada computadora donde se use. El botón descarga dos archivos:
  - Un Excel (`intendencia-pedidos-AAAA-MM-DD.xlsx`) con las hojas Pedidos y Herramientas, listo para imprimir en A4 apaisado y archivar en papel.
  - Una copia para recuperar los datos (`.json`).

  El aviso queda visible hasta que se guarde la copia. La primera vez, el navegador puede preguntar si se permite descargar varios archivos: hay que responder que sí.

Diseño sobrio: íconos de línea en un solo color, sin emojis.

## Qué cambió respecto de la versión 19

- Los pedidos no llevan nombres de empleados: se asignan a un **oficio**. Las herramientas, en cambio, se asignan a una **persona**.
- Se quitó WhatsApp en esta prueba: el registro de lo pedido es la orden impresa.
- Quedan ocultos: Recordatorios, Obras, Guías, Servicios, Insumos y el panel de métricas. **Sus datos no se borran**: siguen guardados en el navegador y en las copias de seguridad, por si se vuelven a activar.
- Prioridad simplificada: «Normal» o «Urgente». Los pedidos viejos con Alta o Baja se ven como normales y conservan su valor.
- Estados: «Sin asignar» pasa a «Pendiente»; «En proceso» se muestra como «En curso» y «Faltan insumos» como «Faltan materiales».
- Las herramientas asignadas en la versión 19 conservan el nombre de la persona.
- No se cargan pedidos ni herramientas de ejemplo: la aplicación arranca vacía.
- Se quitaron los atajos de teclado y los filtros avanzados. El botón Atrás del navegador funciona en todas las pantallas.

## Dónde se guardan los datos

En la **planilla compartida de Google**. Todas las computadoras conectadas ven y cargan lo mismo: cada cambio se guarda en la planilla y cada 30 segundos se trae lo que cargaron las demás. Para armarla, seguí los pasos de [`planilla/INSTALAR.md`](planilla/INSTALAR.md).

- Una computadora sin conectar no muestra nada: solo la pantalla «Conectá esta computadora», que pide la dirección y la clave. Así nadie carga pedidos por fuera de la planilla.
- Al conectar una computadora que tenía datos de la versión anterior (clave `intendencia-estado-v2` del navegador), se descarga una copia de esos datos y se reemplazan por los de la planilla.
- Al desconectarla, se borra la copia de trabajo que quedaba en esa computadora.

- **Guardar copia de la semana** (en el aviso de los viernes o en Ajustes) descarga el Excel y la copia para recuperar. En Ajustes también se puede descargar cada uno por separado.
- **Recuperar desde una copia** acepta también las copias de la versión 19. Con la planilla conectada, sube los datos de la copia a la planilla.

## Archivos

- `index.html`: estructura de la página.
- `styles.css`: diseño, incluida la hoja impresa.
- `core.js`: lógica sin pantalla (oficios, tareas, dependencias, mensajes, adaptación de datos viejos).
- `app.js`: pantallas.
- `xlsx.js`: genera el Excel sin librerías externas.
- `planilla/Codigo.gs` e `INSTALAR.md`: el código de la planilla de Google y los pasos para instalarla.
- `tests/planilla.test.cjs` y `tests/fake-google.cjs`: prueban el código de la planilla con una simulación de Google.
- `contacts-data.js`: guía PJN transcrita el 16/09/2026.
- `tests/core.test.cjs`: pruebas de la lógica. Se corren con `node tests/core.test.cjs` y `node tests/planilla.test.cjs`.

Los archivos de la versión anterior (`ux.js`, `modules.js`, `supplies.js`, etc.) se quitaron y quedan en el historial del repositorio.

## Publicación

GitHub Pages, rama `main`, carpeta raíz. Después de publicar, recargar sin caché (Ctrl+Shift+R en Windows, Cmd+Shift+R en Mac).

Para probarla en la propia computadora: `python3 -m http.server 8080` dentro de esta carpeta y abrir `http://localhost:8080`.
