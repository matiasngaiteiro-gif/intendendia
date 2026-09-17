# Sistema de órdenes de trabajo — Intendencia + Supabase

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
