# Sistema de órdenes de trabajo — Intendencia + Supabase

## Versión 16: Insumos, depósitos y retiros de los miércoles

Nueva sección Insumos con depósitos Diagonal, Callao y Montevideo. Cada uno permite seleccionar un empleado referente (puede ser cualquiera de la dotación) y conserva su propio stock. Catálogo inicial: resmas de papel A4, carátulas amarillas, carátulas azules, carpetas verdes, sobres chicos y sobres grandes. Se pueden agregar insumos con unidad y cantidad sugerida; quedan disponibles en los tres depósitos, inicialmente en cero.

### Primer uso y semana de entregas

1. Elegir el referente de cada depósito; editar su teléfono en Personal para habilitar el enlace de WhatsApp.
2. Pulsar Stock junto a cada producto: cargar las existencias reales con Ingreso/reposición y un motivo. El stock inicial es cero, sin cantidades ficticias. Papel se cuenta por resmas: 1 caja = 10 resmas; 5 cajas = 50 resmas.
3. Asignar entrega a una dependencia de ese edificio, elegir insumo/cantidad y un miércoles de retiro. Las resmas sugieren 10, pero puede modificarse. Se valida stock suficiente y cantidades enteras positivas. La asignación descuenta inmediatamente y reserva esos insumos. El stock mostrado es el disponible, excluyendo lo reservado.
4. La fecha sugerida es el próximo miércoles. El mismo miércoles antes de las 08:00 de Argentina sugiere ese día; desde las 08:00 sugiere el miércoles siguiente. Puede cambiarse manualmente a otro miércoles.
5. El miércoles, seleccionar la fecha en «Miércoles a informar» y pulsar «Informar los que retiran». Agrupa las dependencias con asignaciones pendientes hasta ese día, incluyendo atrasadas, sin duplicarlas ni incluir retiros completados o cancelados. No incluye pedidos de semanas futuras.
6. Copiar el mensaje o abrir WhatsApp al referente. El borrador usa «hoy», no menciona el edificio y pide «Avisame mañana los que retiraron». Para salas utiliza A–F y para juzgados solo el número. El contexto indica la fecha prevista; enviar el texto ese miércoles. Generar un informe no lo envía ni marca entregas como retiradas. El informe generado y sus asignaciones se conservan en el historial.
7. Tras la confirmación, marcar cada entrega Retirado: no hay un segundo descuento. Cancelar devuelve las unidades al stock, una sola vez. Los pendientes no retirados quedan disponibles para el próximo informe.

Reposiciones y correcciones conservan movimientos con fecha/hora, cantidad, saldo y motivo. «Corregir stock disponible» establece un saldo absoluto de las existencias libres; no debe incluir los insumos ya reservados. Se muestran los últimos 100 movimientos y 5 informes por depósito, pero los anteriores permanecen guardados. El historial de entregas incluye todos los estados.

Los datos se guardan en el JSON compartido existente de Supabase y usan el control de concurrencia de la aplicación. No son datos locales independientes por dispositivo. No se requieren tablas nuevas ni ejecutar SQL. Para evitar mezclar versiones, actualizar todos los dispositivos y recargar la página; no mantener pestañas antiguas guardando sobre la misma base.

### Actualización desde la versión 15

Reemplazar `index.html`, `app.js` y `README.md`; agregar `supplies.js` y `supplies.css`. Conservar `config.js`, `contacts-data.js`, `modules.js`, todas las hojas de estilo anteriores y los demás archivos. La carpeta tests es opcional para publicar. No ejecutar SQL. Esperar la publicación de Pages y recargar con Cmd+Shift+R en Mac. El paquete de actualización no incluye configuración ni credenciales.

Prueba adicional: `node tests/supplies.test.cjs`. No se envían mensajes, crean avisos externos ni tareas programadas con la aplicación cerrada: el informe del miércoles se genera manualmente al pulsar el botón.

## Versión 15: editar personal, registro de creación y servicios base

- Personal: botón Editar para cambiar nombre, especialidad, sede y WhatsApp. Conserva el ID del empleado y las asignaciones a órdenes/herramientas.
- Órdenes: fecha y hora automáticas al guardar, visibles en el listado, edición, confirmación y orden impresa. Se conserva la creación original al editar. Hora mostrada en Argentina, con segundos. El registro usa el reloj del dispositivo; no constituye un sellado de tiempo certificado. Las órdenes antiguas que solo tenían fecha muestran «hora no registrada», sin inventarla. WhatsApp continúa sin fecha ni referencia de orden.
- Al primer ingreso con esta versión se agregan automáticamente los servicios faltantes y se guardan en Supabase sin sobrescribir empresas ni contactos existentes: Diagonal tiene Limpieza, Tanques, Caldera, Fumigación, Ascensores, Hidrantes y Matafuegos; Callao, los mismos sin Hidrantes; Montevideo, los mismos sin Caldera y con Detección de incendios. Son 20 casilleros en total. Las empresas quedan pendientes de completar con Editar.
- La precarga se ejecuta una sola vez por base compartida. Eliminar luego un servicio no lo recrea automáticamente. No se borran servicios cargados anteriormente, aunque no coincidan con las excepciones indicadas.
- Contactos: búsqueda parcial por letras, sin tildes ni mayúsculas. Un número solo (o «juzgado 1») busca únicamente números de juzgado y prioriza los que empiezan con ese número, ordenados numéricamente: 1, 10, 11, 12, 13…; coincidencias como 21 y 31 quedan después, sin resultados espurios por teléfonos o direcciones.

Actualizar reemplazando `index.html`, `app.js`, `enhancements.css` y `README.md`. La carpeta `tests` es opcional para publicar. Conservar `config.js`, `contacts-data.js` y todos los demás archivos. No ejecutar SQL. Esperar que finalice GitHub Pages, recargar con Cmd+Shift+R e ingresar para aplicar la precarga.

Pruebas adicionales: `node tests/admin-v15.test.cjs`.

## Versión 14: mensaje WhatsApp simplificado

El mensaje incluye primer nombre, tarea y ubicación. No incluye número/referencia de orden, descripción ni fecha límite; se eliminan los signos de apertura ¿ y ¡. Solo cuando la prioridad es Urgente agrega «Darle prioridad.». Alta, Media y Baja no agregan frases de prioridad. Los datos completos siguen guardados y disponibles para imprimir.

Actualizar reemplazando `index.html`, `app.js` y `README.md`. La carpeta `tests` es opcional para publicar. Conservar `config.js` y el resto de los archivos; no ejecutar SQL. Esperar la publicación de GitHub Pages y recargar con Cmd+Shift+R en Mac. No se envían mensajes automáticamente: WhatsApp abre el borrador y el usuario decide enviarlo.

## Versión 13: especialidad y dependencias por sede

El formulario muestra solo Especialidad (sin Categoría), seguida de sus tareas y «Otra tarea». La especialidad elegida se guarda y sirve para filtrar órdenes. La categoría histórica se mantiene únicamente como metadato interno compatible con versiones anteriores.

Las dependencias se generan desde el catálogo institucional `contacts-data.js`, transcrito de la Guía Judicial PJN el 16/09/2026 (https://www.pjn.gov.ar/guia). No hay actualización automática:

- Diagonal 1211: juzgados 1, 4, 5, 6, 7 y 8; Cámara, salas A–F y oficinas generales publicadas allí.
- Callao 635: juzgados 3, 10, 11, 14, 15, 16, 25 y 26; Mesa Receptora de Callao.
- Montevideo 546: juzgados 27, 28, 29, 30 y 31; Mesa Receptora Montevideo.
- Los juzgados 2, 9, 12, 13 y 17–24 figuran en M.T. Alvear 1840 y no se asignan a las tres sedes disponibles.

«Portería» y «Otra dependencia» son opciones operativas de cada sede, no datos de ubicación extraídos de la guía. El detalle libre de sector/oficina/puerta se conserva. Cambiar el edificio reinicia la dependencia; se rechazan nuevas combinaciones incorrectas. Las órdenes antiguas con ubicaciones incompatibles no se eliminan: al editarlas se conserva el dato con un aviso para revisarlo y puede mantenerse si no se cambia la sede.

Actualizar reemplazando `index.html`, `app.js`, `workflow.css`, `contacts-data.js` y `README.md`. Los tests son opcionales para publicar. Conservar `config.js` y demás archivos. No ejecutar SQL. Esperar la publicación de Pages y recargar sin caché (Cmd+Shift+R en Mac). Se mantiene «Faltan insumos».

## Versión 12: categoría primero y tareas exclusivas

El primer campo de Nueva orden es Categoría y el segundo es Tarea o reparación. No se muestra el selector de especialidad. Las tareas se filtran por igualdad exacta de categoría, sin mezclar categorías que comparten especialidad: Electricidad no incluye Ascensores; Mantenimiento general no incluye Limpieza ni Movimiento interno. Cada categoría tiene tareas propias. «Otra tarea» permite escribir un trabajo de la categoría seleccionada.

Al cambiar de categoría se reinicia la selección de tarea para evitar combinaciones incorrectas. Al guardar se valida que la tarea pertenezca a la categoría. La especialidad interna para el filtro se deriva de la categoría; el responsable puede asignarse libremente. Las órdenes anteriores se conservan y los títulos fuera del catálogo se muestran como «Otra tarea» al editar. Se mantiene el estado «Faltan insumos».

Actualización desde v10/v11: reemplazar `index.html`, `app.js`, `workflow.css` y `README.md`; la carpeta `tests` es opcional para publicar. Mantener `config.js`, `contacts-data.js` y todos los demás archivos existentes. No ejecutar SQL. Esperar la publicación de GitHub Pages y recargar sin caché (Ctrl+Shift+R en Windows; Cmd+Shift+R en Mac). El paquete v12 no contiene credenciales ni archivos de configuración.

## Versión 11: especialidad antes de tarea

- Al crear una orden, elegir primero Especialidad. El desplegable de tareas muestra solo las de esa especialidad; «Otra tarea» sigue permitiendo escribir un trabajo propio.
- La especialidad elegida se conserva en la orden y controla el filtro, aunque el responsable tenga otra especialidad. No hay un segundo campo «Especialidad requerida».
- Nuevo estado «Faltan insumos», disponible al crear/editar y en el filtro de estados; sigue siendo una orden activa y puede finalizarse después.
- Al editar órdenes anteriores se conservan especialidad, título y descripción. Si el trabajo no corresponde al catálogo de esa especialidad, aparece como «Otra tarea» con el texto original.

### Actualización segura desde la versión 10

Reemplazar únicamente `index.html`, `app.js`, `workflow.css` y `README.md` con el paquete de actualización. Conservar `config.js`, `contacts-data.js` y el resto de los archivos existentes. No ejecutar SQL ni cambiar la contraseña por esta actualización. Esperar la publicación de GitHub Pages y recargar sin caché. El paquete de actualización no incluye `config.js`, para evitar reemplazar la conexión real por una plantilla.

Estas modificaciones no resuelven por sí solas un error previo de autenticación: debe revisarse la configuración del proyecto y la cuenta Master.

## Versión 10: formulario simplificado y contactos PJN

- Nueva especialidad Administrativo y 40 tareas predeterminadas (30 incorporaciones).
- Se eliminan los campos visibles Título del trabajo y Especialidad requerida. El trabajo se toma del catálogo; «Otra tarea» permite escribir uno propio. La especialidad se obtiene del responsable o, si no lo hay, de la categoría. Las órdenes anteriores conservan sus títulos y especialidades hasta editarlas.
- «Nueva orden» aparece únicamente en Órdenes de trabajo.
- WhatsApp breve y cercano: primer nombre, tarea, edificio, dependencia abreviada, sector y vencimiento/prioridad cuando corresponde. No incluye descripción. La impresión conserva los detalles completos.
- Abrir una herramienta entregada y pulsar «Ya la devolvió»: registra responsable anterior, fecha de entrega y devolución; queda disponible. El historial se conserva en Supabase.
- Agenda PJN con búsqueda por palabras sin distinguir tildes ni mayúsculas. 50 contactos institucionales: 31 juzgados, Cámara, 6 salas y 12 dependencias generales. Transcritos de la guía oficial el 16/09/2026; no se actualizan automáticamente. Se respetan las direcciones oficiales, incluso M.T. Alvear 1840, fuera de los tres edificios propios.
- **Pendiente: fiscalías comerciales.** La búsqueda «Fiscalía» en la guía PJN no devolvió resultados y «Fiscal» mostró dependencias ajenas al fuero solicitado. No se incorporaron datos de fiscalías sin verificar. Pueden cargarse manualmente desde Contactos.
- En instalaciones existentes, pulsar «Cargar contactos oficiales PJN» en Contactos. Agrega faltantes por ID/correo, sin reemplazar registros existentes; volver a pulsarlo puede recuperar contactos oficiales eliminados.

### Actualizar una instalación existente

1. Guardar una copia de los archivos actuales del repositorio.
2. Reemplazar `index.html`, `app.js`, `workflow.css` y `README.md`; agregar `contacts-data.js`. Los tests son opcionales para publicar.
3. **Conservar el `config.js` ya configurado.** El incluido aquí es únicamente una plantilla.
4. Confirmar los cambios en GitHub y esperar que finalice la publicación de Pages.
5. Abrir la aplicación y recargar sin caché. En Contactos, importar el catálogo oficial si ya existían datos.

No ejecutar nuevamente `supabase-setup.sql` ni `supabase-master.sql` para esta actualización: los nuevos datos se guardan en el JSON compartido existente. No se modificó una base ni un repositorio remoto al preparar este paquete.

Pruebas: `node tests/search.test.cjs`, `node tests/modules.test.cjs` y `node tests/workflow.test.cjs`.

## Versión 9: Obras, Guías, Recordatorios y acceso Master

- Buscador de órdenes ampliado: descripción, dependencia, edificio, categoría, sector, responsable y especialidad, ignorando tildes.
- Obras: nombre, edificio, fecha contable, inicio y fin previstos, monto ARS, orden de compra, empresa y estados Pronta / En progreso / Realizada. Total general y total filtrado por mes y año. Los montos corresponden a lo registrado, no certifican pagos.
- Guías: alta, edición, eliminación y lectura de instrucciones numeradas. Un paso por línea.
- Recordatorios: título, nota, fecha, hora de referencia y repetición opcional semanal, mensual o anual. Aviso central Hoy / Mañana según el calendario local del dispositivo. Para meses cortos, las repeticiones del día 29–31 se trasladan al último día. No hay avisos externos con la aplicación cerrada; la hora es informativa y el aviso aplica a todo el día.

### Configurar un único usuario Master

1. Ejecutar `supabase-setup.sql` si el proyecto es nuevo. Si ya está instalado, NO repetirlo después de aplicar la restricción master porque restablece políticas generales.
2. En Supabase Authentication > Users crear manualmente `master@intendencia.local`, confirmado, con la contraseña elegida. Establecer allí la contraseña solicitada, nunca en archivos públicos.
3. Deshabilitar nuevos registros públicos.
4. Ejecutar `supabase-master.sql`. Restringe las tablas al UUID del único master sin eliminar usuarios ni datos anteriores.
5. Completar URL y clave publicable en `config.js`. MASTER_EMAIL debe coincidir con el correo del usuario y con el correo del SQL.
6. Subir todos los archivos del paquete a la raíz de GitHub Pages. La pantalla pide únicamente la contraseña; Supabase valida la identidad.

No se crearon cuentas ni se modificó una base remota desde este paquete. Una contraseña compartida entre varias personas no permite distinguirlas en la auditoría: todas las acciones figuran como Master. Las guías también exigen el acceso master.

Aplicación web interna para gestionar mantenimiento y servicios en los tres edificios de la Cámara Nacional de Apelaciones en lo Comercial.

## Funciones

- Panel general con órdenes pendientes, en proceso, resueltas, sin asignar y demoradas.
- Alta y edición de órdenes de trabajo.
- Asignación a empleados, edificio, ubicación, categoría, prioridad y fecha límite.
- Filtros por texto, estado y edificio.
- Filtro adicional de órdenes por especialidad del responsable.
- Cada orden conserva su especialidad calculada; al editarla se recalcula desde el responsable o categoría.
- Finalización directa y eliminación confirmada de órdenes cargadas por error.
- Especialidades limitadas a Carpintería, Aires Acondicionados, Albañilería, Ayudante, Electricidad, Plomería, Tapicería, Pintura y Administrativo.
- Gestión básica del personal.
- Alta y eliminación de empleados, incluyendo número de WhatsApp.
- Reparaciones cotidianas predeterminadas para completar órdenes más rápido.
- Dependencias judiciales y administrativas con detalle libre de oficina, sector o puerta.
- Mensaje de asignación generado automáticamente con tres acciones: enviar por WhatsApp, copiar orden e imprimir orden.
- Impresión de una orden formal en formato A4 con datos completos, seguimiento y firmas.
- Inventario de herramientas con marca, modelo, número identificatorio y estado.
- Registro de responsable y fecha de entrega de cada herramienta.
- Devolución, reasignación, reparación, baja y eliminación de herramientas.
- Servicios organizados por edificio con prestador, vigencia y datos de contacto.
- Reclamos por tipo de servicio y redacción automática de correo jurídico formal.
- Agenda editable de contactos de utilidad.
- Base de datos compartida mediante Supabase.
- Autenticación real por correo y contraseña.
- Sincronización automática entre los dispositivos autorizados.
- Control de concurrencia para evitar que una edición pise otra silenciosamente.
- Auditoría de actualizaciones por usuario y revisión.
- Diseño responsive para computadora, tablet y celular.

## Configuración de Supabase

1. Crear un proyecto en Supabase.
2. Abrir **SQL Editor**, pegar todo el contenido de `supabase-setup.sql` y ejecutarlo una sola vez.
3. Abrir **Authentication > Providers > Email** y mantener habilitado el acceso por correo y contraseña.
4. Deshabilitar el registro público para que solamente puedan ingresar los usuarios creados por el administrador.
5. Crear únicamente el usuario Master desde **Authentication > Users** y ejecutar `supabase-master.sql` como se indica arriba.
6. Abrir **Project Settings > API** o **Connect** y copiar:
   - URL del proyecto.
   - Clave publicable con prefijo `sb_publishable_`.
7. Abrir `config.js` y reemplazar únicamente los dos valores de ejemplo.

```javascript
window.APP_CONFIG = Object.freeze({
  SUPABASE_URL: 'https://PROYECTO.supabase.co',
  SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_CLAVE',
  MASTER_EMAIL: 'master@intendencia.local'
});
```

Nunca incorporar una clave `sb_secret_`, una contraseña administrativa ni credenciales de la base de datos en GitHub.

## Primer ingreso

El primer ingreso Master crea el estado compartido. Si ese navegador contiene datos de una versión anterior, se migran una sola vez a Supabase y luego se elimina esa copia operativa de `localStorage`. Los siguientes dispositivos reciben el mismo estado desde la base usando la misma cuenta Master.

La aplicación consulta cambios cada 15 segundos. Si dos personas intentan guardar sobre la misma revisión, evita sobrescribir información y carga la revisión más reciente.

## Uso local

Abrir `index.html` en el navegador. Para servirlo localmente:

```bash
python3 -m http.server 8080 --directory ordenes-intendencia
```

Luego ingresar a `http://localhost:8080`.

## Publicación en GitHub Pages

1. Crear un repositorio nuevo, por ejemplo `ordenes-intendencia`.
2. Subir el contenido de esta carpeta a la rama `main`.
3. En GitHub, abrir **Settings > Pages**.
4. Seleccionar **Deploy from a branch**, rama `main`, carpeta `/root`.

## Seguridad

La aplicación no utiliza librerías externas ni analítica. Incluye política CSP restrictiva, bloqueo de permisos innecesarios, ausencia de referer y escape del contenido cargado. La base bloquea el rol anónimo y permite acceder únicamente a usuarios autenticados mediante políticas RLS. La clave publicable identifica a la aplicación pero no concede acceso anónimo. La sesión se conserva en el navegador; los datos operativos permanecen en Supabase.
