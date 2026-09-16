# Sistema de órdenes de trabajo — Intendencia + Supabase

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
- Cada orden conserva su especialidad requerida aunque se cambie o elimine el responsable.
- Finalización directa y eliminación confirmada de órdenes cargadas por error.
- Especialidades limitadas a Carpintería, Aires Acondicionados, Albañilería, Ayudante, Electricidad, Plomería, Tapicería y Pintura.
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
