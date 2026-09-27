# Manual del panel administrativo (SuperAdmin)

> Este documento se genera automáticamente desde la ayuda de la aplicación (`lib/help`). No lo edites a mano: cambia el texto en `lib/help` y ejecuta `npm run generate-manuals`.

Este manual es para quien opera la plataforma: el equipo que administra todas las organizaciones clientes. Desde el panel SuperAdmin ves el estado global, gestionas organizaciones, planes y límites, asignas modelos de IA, controlas el consumo y los costos, enciendes o apagas funciones, y respondes a alertas. Todo lo que cambias queda en una auditoría inmutable. Este panel es un mundo aparte del CRM de las organizaciones: tiene su propio inicio de sesión, sus propias contraseñas y ninguna sesión sirve en el otro.

También encuentras esta misma información dentro de la aplicación: en el menú **Ayuda** y en el símbolo **!** junto al título de cada sección. Para la otra mitad del producto, consulta `docs/MANUAL_ORGANIZACION.md`.

## Contenido

- [Primeros pasos](#primeros-pasos)
- [Cómo trabajar cada día](#cómo-trabajar-cada-día)
- [Resumen](#resumen)
- [Organizaciones](#organizaciones)
- [Detalle de la organización](#detalle-de-la-organización)
- [Planes](#planes)
- [Uso](#uso)
- [IA](#ia)
- [Uso de WhatsApp](#uso-de-whatsapp)
- [Facturación](#facturación)
- [Salud del sistema](#salud-del-sistema)
- [Alertas](#alertas)
- [Feature flags](#feature-flags)
- [Configuración global](#configuración-global)
- [Prompts globales](#prompts-globales)
- [Modo mantenimiento](#modo-mantenimiento)
- [Auditoría](#auditoría)
- [Seguridad (verificación en dos pasos)](#seguridad-verificación-en-dos-pasos)
- [Equipo](#equipo)
- [Glosario](#glosario)
- [Preguntas frecuentes](#preguntas-frecuentes)

## Primeros pasos

**Primeros pasos: dejar lista una organización nueva**

1. Revisa el Resumen para conocer el estado general de la plataforma.
2. En Planes, confirma que existe el plan que le corresponde (con sus límites) y que está activo.
3. En Organizaciones abre la nueva cuenta y, en «Plan», asígnale el plan indicando el motivo.
4. En la misma pantalla, en «Límites», define si necesita algún ajuste propio y, en IA, el modelo por defecto que usará su bot.
5. Confirma que su estado sea «Activa». Si está «Pendiente de configuración», cámbiala a «Activa» cuando esté lista.
6. Sigue su Uso durante los primeros días y vigila que no aparezcan Alertas.

## Cómo trabajar cada día

**Rutina de operación recomendada**

1. Asegúrate de que todo el equipo tenga activada la verificación en dos pasos (Equipo → columna «Doble factor»).
2. Cada mañana abre Salud del sistema: todo debe estar «Operativo». Si algo está degradado, es lo primero que se atiende.
3. Revisa Alertas: atiende primero las críticas (consumo al 100 % o componentes caídos) y confirma las que ya estás resolviendo.
4. Mira el Resumen: organizaciones cerca del límite, consumo y costo estimado del período.
5. Para una organización con problemas, ábrela desde Organizaciones: estado, plan, límites y uso reciente están en una sola pantalla.
6. Antes de cambiar algo que afecta a todos (mantenimiento, flags, configuración global), prográmalo y avisa a tus clientes.
7. Al final de mes revisa Facturación: costos estimados por organización para decidir planes y precios.

## Guía por sección

### Resumen

*Pantalla: `/admin`*

> La foto general de la plataforma: organizaciones, usuarios, conversaciones, consumo y costo en el período elegido.

El Resumen responde a la pregunta «¿cómo está la plataforma?». Las tarjetas se calculan sobre la ventana de tiempo que elijas arriba a la derecha. «Cuentas cerca del límite» cuenta las organizaciones con una alerta de consumo abierta (85 % o más de algún límite). El costo estimado suma IA y WhatsApp donde hay costo registrado; no es una factura sino una estimación operativa.

**En resumen, aquí puedes:**

- Cambia la ventana: 24 h, 7, 30 o 90 días.
- Organizaciones cerca del límite y costo estimado.
- Mensajes de WhatsApp, sesiones y tokens de IA.
- Organizaciones por estado.

#### Cómo detectar organizaciones en riesgo

1. Mira «Cuentas cerca del límite»: si es mayor que cero, ve a Alertas para ver cuáles.
2. Revisa «Organizaciones por estado»: cuentas suspendidas o con pago fallido merecen seguimiento.

#### Cómo sacarle el mejor provecho

- Usa 24 h para ver el ritmo de hoy y 30 días para tendencias y costos.

**Relacionado:** [Alertas](#alertas) · [Salud del sistema](#salud-del-sistema) · [Facturación](#facturación)

### Organizaciones

*Pantalla: `/admin/organizations`*

> Todas las cuentas clientes de la plataforma. Entra a una para cambiar su estado, su plan o sus límites.

Una organización nace cuando un cliente se registra. Su ciclo de vida se controla con el estado: Activa, Pendiente de configuración, Pago fallido, Pausada por límite, Inactiva, Suspendida, Congelada o Eliminada. Cualquier estado distinto de «Activa» bloquea la operación de la organización de forma inmediata: el bot deja de responder y sus usuarios no pueden operar; en «Congelada» pueden entrar pero solo consultar. Los mensajes que lleguen mientras está bloqueada se guardan, pero al reactivarla el bot no los responde de golpe: una persona los revisa en la Bandeja.

**En resumen, aquí puedes:**

- Busca por nombre y filtra por estado.
- Cada fila muestra su estado y su plan.
- Abre una organización para gestionarla.

#### Cómo encontrar una organización

1. Usa el buscador por nombre.
2. Filtra por estado.
3. Pulsa la fila para abrir su detalle.

#### Cómo sacarle el mejor provecho

- Documenta el motivo con claridad: queda en la auditoría y lo verá quien revise después.

**Relacionado:** [Detalle de la organización](#detalle-de-la-organización) · [Planes](#planes) · [Auditoría](#auditoría)

### Detalle de la organización

*Pantalla: `/admin/organizations`*

> Estado, plan, límites propios y consumo de una organización, todo en una pantalla. Cada cambio pide un motivo.

Esta pantalla concentra todo lo que puedes hacer con UNA organización. Todos los cambios exigen un motivo (mínimo tres caracteres) y se registran con quién, cuándo, el valor anterior y el nuevo. Los límites se resuelven por capas: primero los valores globales, luego los del plan y luego los propios de la cuenta; los bloqueos de emergencia mandan sobre todo lo demás. Un campo de límite vacío significa «hereda del plan»; «ilimitado» significa sin tope. El modelo de IA lo asignas aquí: la lista de «modelos permitidos» restringe cuáles puede usar, «modelo por defecto» es el que usará su bot y «modelo de respaldo» entra si el principal no está disponible.

**En resumen, aquí puedes:**

- Cambiar el estado (con advertencia si bloquea).
- Asignar o cambiar el plan.
- Ajustar límites, modelos de IA y bloqueos de emergencia solo para esta cuenta.
- Ver su consumo del período.

#### Cómo suspender o reactivar una organización

1. Abre la organización y ve a «Estado».
2. Elige el estado nuevo (el sistema avisa si la organización perderá el acceso).
3. Escribe el motivo y confirma.

#### Cómo cambiar el plan

1. En «Plan», elige el plan.
2. Escribe el motivo y confirma: los límites del nuevo plan rigen de inmediato.

#### Cómo darle un modelo de IA a una organización

1. En «Límites», activa la restricción de modelos si quieres limitar cuáles puede usar y marca los permitidos.
2. Elige el modelo por defecto (y opcionalmente uno de respaldo).
3. Escribe el motivo y guarda. El bot usará ese modelo desde el siguiente mensaje.

#### Cómo poner un freno de emergencia

1. En «Límites», marca el bloqueo que necesitas: «Bloquear IA», «Bloquear envíos de WhatsApp», «Bloquear conversaciones nuevas» o «Desactivar bots».
2. Escribe el motivo y guarda. El efecto es inmediato y se revierte desmarcando.

#### Cómo sacarle el mejor provecho

- Prefiere un bloqueo de emergencia puntual a suspender toda la cuenta: corta solo lo que causa el problema.
- Sube el límite de una cuenta puntual con un valor propio en vez de crear un plan nuevo.

#### Ten en cuenta

- Cambiar el estado a algo distinto de «Activa» bloquea a la organización al instante.
- «Bloquear conversaciones nuevas» ignora los mensajes de clientes que aún no existen; los clientes existentes siguen atendidos.

**Relacionado:** [Planes](#planes) · [IA](#ia) · [Alertas](#alertas) · [Auditoría](#auditoría)

### Planes

*Pantalla: `/admin/plans`*

> El catálogo de planes: nombre, precio mensual y los límites que cada uno concede.

Un plan es una plantilla de límites que se asigna a las organizaciones. Los límites cubren WhatsApp (mensajes por día y mes, salientes, plantillas, multimedia), IA (tokens por día y mes, ejecuciones, costo) y estructura (usuarios, bandejas, conversaciones, contactos, almacenamiento). Cuando una organización llega a un límite, el sistema la detiene en ese aspecto y abre una alerta. Los cambios al catálogo (crear o editar planes) no piden motivo, pero sí quedan en la auditoría.

**En resumen, aquí puedes:**

- Crea y edita planes.
- Define límites de WhatsApp, IA y estructura.
- Un plan inactivo no se puede asignar a cuentas nuevas.

#### Cómo crear un plan

1. Pulsa «Nuevo plan».
2. Escribe un código único (A-Z, 0-9 y guion bajo; no se puede cambiar después), el nombre y el precio mensual en USD.
3. Define los límites (vacío = sin definir; «ilimitado» = sin tope).
4. Guarda y actívalo.

#### Cómo sacarle el mejor provecho

- Empieza con tres planes claros; más opciones complican la venta y el soporte.
- Deja el modelo de IA fuera del plan y asígnalo por organización (ver Detalle de la organización).

#### Ten en cuenta

- Editar los límites de un plan afecta a todas las organizaciones que lo tienen, salvo los valores propios de cada cuenta.

**Relacionado:** [Detalle de la organización](#detalle-de-la-organización) · [Facturación](#facturación)

### Uso

*Pantalla: `/admin/usage`*

> El consumo de mensajería e IA de toda la plataforma o de una organización.

Uso responde «¿cuánto se está consumiendo?». Combina mensajes de WhatsApp (entrantes y salientes) y consumo de IA (sesiones, tokens de entrada y salida). Filtrar por organización te sirve para ver por qué una cuenta se acerca a su límite.

**En resumen, aquí puedes:**

- Elige la ventana de tiempo.
- Filtra por una organización.
- Compara mensajes, sesiones de IA y tokens.

#### Cómo revisar el consumo de un cliente

1. Elige la organización en el filtro.
2. Cambia la ventana (24 h, 7, 30 o 90 días).
3. Compara con los límites de su plan.

#### Cómo sacarle el mejor provecho

- Antes de hablar con un cliente sobre subir de plan, muéstrale su consumo de los últimos 30 días.

**Relacionado:** [IA](#ia) · [Uso de WhatsApp](#uso-de-whatsapp) · [Alertas](#alertas)

### IA

*Pantalla: `/admin/ai`*

> Consumo de la inteligencia artificial por modelo y el catálogo de modelos con sus precios.

Cada respuesta del bot es una «sesión de IA» que consume tokens. El costo se calcula con el precio por token de entrada y de salida que defines en el catálogo de modelos. Mientras el catálogo esté vacío cualquier modelo se puede usar (con el costo sin calcular); en cuanto tiene modelos, solo se pueden usar los activos. Si desactivas un modelo del catálogo, las organizaciones que lo tenían asignado pasan a su modelo de respaldo o, si no hay, el bot se detiene con un aviso de configuración.

**En resumen, aquí puedes:**

- Sesiones, tokens y costo por modelo.
- Catálogo de modelos con precio por token.
- Activa o desactiva modelos.

#### Cómo dar de alta un modelo nuevo

1. En el catálogo, pulsa el botón para añadir un modelo.
2. Escribe proveedor, nombre exacto del modelo y los precios por token.
3. Guarda y actívalo.

#### Cómo sacarle el mejor provecho

- Mantén los precios al día: son la base de tus costos estimados y de los límites por costo.

#### Ten en cuenta

- Escribe el nombre del modelo exactamente como lo espera el proveedor: un error tumba las respuestas del bot.

**Relacionado:** [Detalle de la organización](#detalle-de-la-organización) · [Facturación](#facturación) · [Configuración global](#configuración-global)

### Uso de WhatsApp

*Pantalla: `/admin/whatsapp`*

> Mensajes entrantes y salientes, separados por tipo.

Sirve para entender el volumen de mensajería y vigilar límites de WhatsApp. Aún no hay un catálogo de precios de WhatsApp, así que el costo solo se suma donde ya hay costo registrado.

**En resumen, aquí puedes:**

- Entrantes y salientes.
- Por tipo (texto, plantilla, multimedia).
- Por organización o de toda la plataforma.

#### Cómo revisar un pico de mensajes

1. Elige una ventana corta (24 h).
2. Filtra por organización para ver quién lo causa.

#### Cómo sacarle el mejor provecho

- Un pico repentino de salientes suele ser una automatización mal configurada.

**Relacionado:** [Uso](#uso) · [Alertas](#alertas)

### Facturación

*Pantalla: `/admin/billing`*

> Costos operativos estimados (IA + WhatsApp) de la plataforma o de una organización.

Esta pantalla NO emite facturas ni cobra: muestra cuánto te cuesta operar a cada cliente, según el consumo y los precios del catálogo de modelos. Compara ese costo con el precio de su plan para saber qué cuentas son rentables.

**En resumen, aquí puedes:**

- Costo estimado por período.
- Desglose IA y WhatsApp.
- Base para decidir precios de planes.

#### Cómo saber si un plan es rentable

1. Filtra por la organización.
2. Elige 30 días.
3. Compara el costo estimado con el precio mensual de su plan.

#### Cómo sacarle el mejor provecho

- Revisa las cuentas con más costo que ingreso: quizá necesiten un plan superior.

#### Ten en cuenta

- Es una estimación: depende de que los precios del catálogo estén actualizados.

**Relacionado:** [Planes](#planes) · [IA](#ia)

### Salud del sistema

*Pantalla: `/admin/system-health`*

> El estado de cada pieza de la plataforma. Se actualiza solo cada 15 segundos.

Cada componente se clasifica como Operativo, Degradado, Caído o Desconocido. WhatsApp y el proveedor de IA no se «consultan»: su estado se deduce de la tasa de fallos reciente de los envíos y de las sesiones de IA. «Desconocido» significa que no hay datos suficientes y nunca empeora el estado general.

**En resumen, aquí puedes:**

- Backend, base de datos, Redis, procesos en segundo plano.
- WhatsApp y proveedor de IA (deducidos de errores reales).
- Estados: Operativo, Degradado, Caído o Desconocido.

#### Cómo actuar ante un componente caído

1. Identifica el componente en rojo.
2. Revisa Alertas: allí queda registrada.
3. Si es WhatsApp o IA, revisa el token o la clave del proveedor y los logs del servidor.

#### Cómo sacarle el mejor provecho

- Deja esta pantalla abierta cuando hagas cambios grandes o un despliegue.

**Relacionado:** [Alertas](#alertas) · [Modo mantenimiento](#modo-mantenimiento)

### Alertas

*Pantalla: `/admin/alerts`*

> Avisos automáticos de consumo cerca del límite y de problemas operativos. Se evalúan solos cada 5 minutos.

Las alertas de consumo se abren solas cuando una organización llega al 85 % (advertencia) o al 100 % (crítica) de un límite. Las operativas se abren cuando un componente falla. Una alerta no se cierra sola si el dato no se puede leer. El número rojo en el menú indica cuántas hay abiertas. «Confirmar» marca que alguien ya la está atendiendo; «Resolver» la cierra.

**En resumen, aquí puedes:**

- Advertencia desde el 85 % de un límite; crítica al 100 %.
- Alertas de componentes caídos.
- Confirmar (ya lo estoy atendiendo) o resolver.

#### Cómo atender una alerta de consumo

1. Ábrela y mira qué organización y qué límite.
2. Confirma la alerta.
3. Habla con el cliente o sube su límite en el detalle de su organización.
4. Resuélvela cuando el consumo vuelva a la normalidad.

#### Cómo sacarle el mejor provecho

- Trata cada alerta al 85 % como una oportunidad comercial: el cliente está creciendo.

**Relacionado:** [Detalle de la organización](#detalle-de-la-organización) · [Salud del sistema](#salud-del-sistema) · [Uso](#uso)

### Feature flags

*Pantalla: `/admin/feature-flags`*

> Enciende o apaga funciones por plataforma, por plan o por organización.

Un flag es un interruptor. El valor por defecto aplica a todos; un plan puede tener su propio valor y una organización también. Hoy tres flags gobiernan funciones reales: AI_ENABLED (la IA de los bots), WHATSAPP_ENABLED (los envíos por WhatsApp) y AUTOMATIONS_ENABLED (las automatizaciones). Los demás flags que crees se guardan y se pueden consultar, pero solo tienen efecto donde el producto los lea.

**En resumen, aquí puedes:**

- Gana lo más específico: cuenta, luego plan, luego el valor global.
- Un flag que no existe cuenta como encendido.
- Cada cambio pide un motivo.

#### Cómo apagar una función para una organización

1. Abre el flag.
2. Añade un valor propio para esa organización con «apagado».
3. Escribe el motivo y guarda.

#### Cómo sacarle el mejor provecho

- Usa flags para probar una función con una sola organización antes de abrirla a todos.

#### Ten en cuenta

- Apagar un flag global afecta a todas las organizaciones a la vez.

**Relacionado:** [Modo mantenimiento](#modo-mantenimiento) · [Detalle de la organización](#detalle-de-la-organización) · [Configuración global](#configuración-global)

### Configuración global

*Pantalla: `/admin/global-config`*

> Valores que aplican a toda la plataforma: límites por defecto, modelos de IA por defecto y mensaje de mantenimiento.

Es la capa más general de la jerarquía: sus valores aplican donde ni el plan ni la organización definan uno propio. Guardar un valor vacío (null) lo borra y vuelve al comportamiento de fábrica. Cada cambio exige un motivo y queda auditado. Las claves (API keys, tokens) NO se administran aquí: viven en el servidor.

**En resumen, aquí puedes:**

- Límites por defecto de toda la plataforma.
- Modelo de IA por defecto y de respaldo.
- Los secretos nunca se muestran ni se guardan aquí.

#### Cómo cambiar el modelo de IA por defecto de la plataforma

1. Ve a «default_ai_model».
2. Escribe el modelo (debe existir en el catálogo).
3. Escribe el motivo y guarda.

#### Cómo sacarle el mejor provecho

- Cambia aquí solo lo que de verdad deba valer para todos; lo demás, en el plan o en la organización.

#### Ten en cuenta

- Un cambio aquí puede afectar a todas las organizaciones sin un valor propio.

**Relacionado:** [IA](#ia) · [Planes](#planes) · [Feature flags](#feature-flags)

### Prompts globales

*Pantalla: `/admin/prompts`*

> Versiones inmutables de instrucciones para la IA: para cambiar una se crea una versión nueva y se activa.

Cada cambio a un prompt crea una versión nueva; las anteriores no se pueden editar, para poder auditar y volver atrás. Solo una versión por nombre puede estar activa. Importante: hoy el bot de las organizaciones usa sus propias instrucciones (Configuración → Bot); estos prompts globales quedan guardados y versionados para conectarlos más adelante.

**En resumen, aquí puedes:**

- Una sola versión activa por nombre.
- Compara versiones con un diff.
- Aún no los usa el bot de las organizaciones.

#### Cómo publicar una versión nueva

1. Elige el prompt (o crea uno nuevo).
2. Pulsa «Nueva versión» y escribe el contenido.
3. Compara con la versión anterior en el diff.
4. Actívala indicando el motivo.

#### Cómo sacarle el mejor provecho

- Escribe siempre el motivo del cambio: será tu historial de decisiones.

#### Ten en cuenta

- Aún no cambian el comportamiento del bot de las organizaciones.

**Relacionado:** [Configuración global](#configuración-global) · [Auditoría](#auditoría)

### Modo mantenimiento

*Pantalla: `/admin/maintenance`*

> Corta, por completo o por servicio, lo que ven y usan las organizaciones. El panel SuperAdmin nunca se corta.

Usa el mantenimiento para migraciones o incidentes. En «CRM» los usuarios reciben un aviso 503 con tu mensaje; en «IA» los turnos del bot se aplazan (no se pasan a una persona) y se retoman al terminar; en «WhatsApp» no salen mensajes. Los mensajes entrantes de Meta se siguen recibiendo. El propio panel SuperAdmin, la salud del sistema y los webhooks no se cortan.

**En resumen, aquí puedes:**

- Global o por servicio: WhatsApp (envíos), IA (bot) o CRM (API).
- Mensaje visible para los usuarios.
- Puede programarse con un inicio y un fin opcionales.

#### Cómo activar un mantenimiento

1. Elige global o los servicios a cortar.
2. Escribe el mensaje que verán los usuarios.
3. Opcionalmente indica cuándo empieza y termina.
4. Escribe el motivo y aplica.

#### Cómo quitarlo

1. Desmarca todo y aplica «Quitar el mantenimiento».

#### Cómo sacarle el mejor provecho

- Avisa a tus clientes con anticipación y programa el fin para no depender de acordarte.

#### Ten en cuenta

- Un mantenimiento global detiene a todas las organizaciones a la vez.

**Relacionado:** [Salud del sistema](#salud-del-sistema) · [Feature flags](#feature-flags)

### Auditoría

*Pantalla: `/admin/audit`*

> El historial inmutable de todo lo que se hace desde el panel: quién, cuándo, qué cambió y por qué.

Cada acción sensible (cambiar estado, plan o límites, cambiar flags o configuración, publicar prompts, confirmar alertas, cambiar el mantenimiento) crea un evento con la persona, la fecha, el motivo y el antes y después. La base de datos impide modificar o borrar estos eventos.

**En resumen, aquí puedes:**

- Filtra por acción exacta y por tipo de entidad.
- Muestra el estado anterior y el nuevo.
- Nada se puede editar ni borrar.

#### Cómo averiguar quién cambió algo

1. Filtra por la acción exacta o por el tipo de entidad (por ejemplo, la organización).
2. Abre el evento: verás quién, cuándo, el motivo y el cambio.

#### Cómo sacarle el mejor provecho

- Antes de deshacer un cambio ajeno, léelo aquí: el motivo suele explicar por qué se hizo.

**Relacionado:** [Detalle de la organización](#detalle-de-la-organización) · [Feature flags](#feature-flags) · [Configuración global](#configuración-global)

### Seguridad (verificación en dos pasos)

*Pantalla: `/admin/security`*

> Además de la contraseña, un código de 6 dígitos de tu teléfono. Así, aunque alguien conozca tu contraseña, no puede entrar.

El panel administra todas las organizaciones: una contraseña robada bastaría para suspender clientes o cambiar sus límites. La verificación en dos pasos (TOTP) exige además un código que cambia cada 30 segundos y solo genera tu teléfono. Cada código sirve una sola vez. Si pierdes el teléfono, entras con uno de tus códigos de recuperación. La plataforma puede exigirla a todo el equipo (ajuste PLATFORM_MFA_REQUIRED del servidor): entonces quien no la tenga debe configurarla en su siguiente inicio de sesión y nadie puede desactivarla por su cuenta.

**En resumen, aquí puedes:**

- Funciona con Google Authenticator, Microsoft Authenticator, Authy y similares.
- Al activarla recibes 8 códigos de recuperación de un solo uso.
- Cada persona administra la suya, también el rol de solo lectura.

#### Cómo activarla

1. Instala una app autenticadora en tu teléfono.
2. Entra a Seguridad y pulsa «Activar».
3. En la app pulsa «+» y escanea el código QR (o escribe la clave si no puedes escanear).
4. Escribe el código de 6 dígitos que muestra la app y pulsa «Activar».
5. Guarda los 8 códigos de recuperación en un gestor de contraseñas: no se vuelven a mostrar.

#### Cómo entrar si perdiste el teléfono

1. Escribe tu correo y contraseña como siempre.
2. Cuando pida el código, escribe uno de tus códigos de recuperación (formato ABCDE-FGHJK).
3. Ya dentro, desactiva la verificación y vuelve a activarla con el teléfono nuevo, o genera códigos nuevos.

#### Cómo generar códigos de recuperación nuevos

1. En Seguridad pulsa «Generar códigos de recuperación nuevos».
2. Confirma con un código de tu app (no con uno de recuperación).
3. Guarda los nuevos: los anteriores dejan de servir.

#### Cómo sacarle el mejor provecho

- Actívala antes que nada: es la protección más efectiva del panel.
- Cuando todo el equipo la tenga, pide que se active PLATFORM_MFA_REQUIRED en el servidor para exigirla.
- Si te quedan 2 códigos de recuperación o menos, genera nuevos.

#### Ten en cuenta

- Si pierdes el teléfono Y los códigos, otro SuperAdmin debe restablecerla desde Equipo. Si eres la única persona SuperAdmin, se restablece en el servidor con el script reset_superadmin_mfa.py.
- Nunca compartas ni fotografíes los códigos de recuperación en un chat.

**Relacionado:** [Equipo](#equipo) · [Auditoría](#auditoría)

### Equipo

*Pantalla: `/admin/team`*

> Quién entra al panel y con qué rol: SuperAdmin (cambia todo) o Solo lectura (solo consulta).

El rol «Solo lectura» ve todo el panel pero no puede cambiar nada: el servidor rechaza cualquier cambio suyo, sin depender de que la pantalla oculte los botones. Sirve para contabilidad, soporte o quien solo necesita consultar. Reglas de protección: nadie cambia su propio rol ni se desactiva a sí mismo, y siempre debe quedar al menos un SuperAdmin activo. Desactivar a alguien cierra su acceso de inmediato. Todo cambio queda en la Auditoría con el motivo.

**En resumen, aquí puedes:**

- Crea personas con rol SuperAdmin o Solo lectura.
- Cambia el rol o desactiva a alguien, siempre con un motivo.
- Restablece el doble factor de quien perdió su teléfono.

#### Cómo dar acceso de solo lectura

1. Pulsa «Nueva persona».
2. Escribe nombre, correo, elige «Solo lectura» y una contraseña inicial.
3. Escribe el motivo y pulsa «Crear». Entrega la contraseña por un canal privado.
4. Pídele que active la verificación en dos pasos en su primer ingreso.

#### Cómo quitarle el acceso a alguien

1. Pulsa «Rol / estado» en su fila.
2. Desmarca «Puede entrar al panel».
3. Escribe el motivo y guarda.

#### Cómo restablecer el doble factor de otra persona

1. Confirma su identidad por otro medio (una llamada, en persona).
2. Pulsa «Restablecer doble factor» en su fila y escribe el motivo.
3. La próxima vez que entre, deberá configurarlo de nuevo.

#### Cómo sacarle el mejor provecho

- Da el rol mínimo necesario: la mayoría de las personas solo necesita consultar.
- Revisa la columna «Doble factor»: nadie con rol SuperAdmin debería tenerlo sin activar.
- Desactiva de inmediato el acceso de quien deja el equipo.

#### Ten en cuenta

- Restablecer el doble factor es la vía que usaría un atacante con ingeniería social: verifica siempre la identidad antes.

**Relacionado:** [Seguridad (verificación en dos pasos)](#seguridad-verificación-en-dos-pasos) · [Auditoría](#auditoría)

## Glosario

- **Organización:** Un cliente de la plataforma, con sus propios usuarios, contactos y conversaciones aislados de los demás.
- **Plan:** Plantilla de límites y precio que se asigna a una organización.
- **Límite:** Tope de consumo o de estructura (mensajes, tokens, usuarios…). Al alcanzarse, el sistema detiene ese recurso y abre una alerta.
- **Jerarquía de límites:** Global → plan → cuenta → bloqueos de emergencia. Lo más específico gana; la emergencia manda sobre todo.
- **Estado de la organización:** Activa, Pendiente de configuración, Pago fallido, Pausada por límite, Inactiva, Suspendida, Congelada o Eliminada. Solo «Activa» opera con normalidad.
- **Bloqueo de emergencia:** Interruptor por organización que corta un aspecto puntual (IA, envíos, conversaciones nuevas, bots).
- **Feature flag:** Interruptor de una función, con valor global, por plan o por organización.
- **Sesión de IA:** Cada vez que el bot genera una respuesta. Consume tokens y tiene costo.
- **Token:** Unidad en la que se mide el texto que procesa la IA. Se cobra por token de entrada y de salida.
- **Mantenimiento:** Estado temporal en el que se corta un servicio (o todo) para las organizaciones.
- **Auditoría:** Registro inmutable de acciones del panel.

## Preguntas frecuentes

**Una organización dice que su bot no responde. ¿Qué reviso?**

Abre su detalle: confirma que el estado sea «Activa», que no haya bloqueos de emergencia, que no haya alcanzado un límite de IA (Alertas) y que tenga un modelo permitido y activo. Luego revisa Salud del sistema por si el proveedor de IA está caído.

**¿Cómo le pongo un límite propio a un cliente?**

En el detalle de la organización, sección «Límites»: escribe el valor en el campo del límite (vacío hereda del plan, «ilimitado» quita el tope), añade el motivo y guarda.

**¿Por qué no puedo asignar un plan?**

Lo más probable es que el plan esté inactivo. Actívalo en Planes. También se exige un motivo al asignar.

**¿Puede una organización elegir su modelo de IA?**

No. El modelo lo asignas tú por organización (detalle → Límites), o hereda el de la configuración global. Así controlas costos y calidad.

**¿Qué pasa con los mensajes de una organización suspendida?**

Siguen llegando y se guardan, pero el bot no responde ni se envía nada. Al reactivarla, el bot no contesta el atraso de golpe: una persona lo revisa en la Bandeja.

**¿Dónde se guardan las claves de OpenAI o de Meta?**

Nunca en este panel. Viven en las variables de entorno del servidor. La Configuración global solo guarda valores no sensibles.

**¿Puedo deshacer un cambio?**

Sí, aplicando el valor anterior: la Auditoría te muestra el estado previo de cada cambio. El historial en sí no se puede modificar.
