# Manual del CRM para tu organización

> Este documento se genera automáticamente desde la ayuda de la aplicación (`lib/help`). No lo edites a mano: cambia el texto en `lib/help` y ejecuta `npm run generate-manuals`.

Este manual es para las personas que usan el CRM en el día a día: propietaria, administradores y agentes. Explica qué hace cada sección, cómo se usa y cómo sacarle el mejor provecho. El CRM recibe los mensajes de WhatsApp de tus clientes, los atiende con un bot de inteligencia artificial que reúne los datos que tú definas, y cuando hace falta pasa la conversación a una persona de tu equipo. Todo queda ordenado en contactos, leads y un pipeline de ventas.

También encuentras esta misma información dentro de la aplicación: en el menú **Ayuda** y en el símbolo **!** junto al título de cada sección. Para la otra mitad del producto, consulta `docs/MANUAL_ADMIN.md`.

## Contenido

- [Primeros pasos](#primeros-pasos)
- [Cómo trabajar cada día](#cómo-trabajar-cada-día)
- [Panel](#panel)
- [Bandeja](#bandeja)
- [Ficha del cliente](#ficha-del-cliente)
- [Contactos](#contactos)
- [Detalle del contacto](#detalle-del-contacto)
- [Leads](#leads)
- [Detalle del lead](#detalle-del-lead)
- [Pipeline](#pipeline)
- [Automatizaciones](#automatizaciones)
- [Configuración · Cuenta](#configuración--cuenta)
- [Configuración · Usuarios](#configuración--usuarios)
- [Configuración · Canales](#configuración--canales)
- [Configuración · Pipeline](#configuración--pipeline)
- [Configuración · Bot](#configuración--bot)
- [Glosario](#glosario)
- [Preguntas frecuentes](#preguntas-frecuentes)

## Primeros pasos

**Primeros pasos: de cero a atender clientes**

1. Entra a Configuración → Canales y crea tu canal de WhatsApp con los datos de Meta (Phone Number ID, número visible y token de acceso).
2. En Configuración → Bot escribe las instrucciones de tu bot, define los datos que debe reunir (por ejemplo nombre y qué necesita el cliente) y actívalo.
3. Revisa tus etapas de venta en Configuración → Pipeline y ajústalas a tu forma de vender.
4. Invita a tu equipo desde Configuración → Usuarios: crea una cuenta para cada persona con su rol (Agente o Administrador).
5. Escribe un mensaje de prueba a tu número de WhatsApp: verás la conversación aparecer en la Bandeja y la respuesta del bot.
6. Cuando el bot termine de reunir los datos, la conversación pasa a «En cola»: un agente la toma desde la Bandeja y continúa la atención.

## Cómo trabajar cada día

**Cómo trabajar cada día**

1. Empieza por el Panel: mira cuántas conversaciones esperan a una persona y cuántas son tuyas.
2. Abre la Bandeja y filtra por «En cola». Elige una conversación y revisa la Ficha del cliente para ver, sin leer todo el chat, qué datos reunió el bot y qué falta.
3. Pulsa «Tomar» para quedarte con la conversación y responde al cliente. Si el cliente ya tiene lo que necesitaba, marca el lead como ganado o perdido.
4. Si la conversación se puede resolver de forma automática, puedes «Devolver al bot».
5. Mueve cada oportunidad por el Pipeline a medida que avanza la venta. Las etapas te dicen en qué punto está cada cliente.
6. Una vez por semana revisa las Automatizaciones y la configuración del bot: ajusta instrucciones y datos según lo que veas en las conversaciones reales.

## Guía por sección

### Panel

*Pantalla: `/dashboard`*

> Tu resumen del día: cuántos contactos y leads tienes, cuántas conversaciones esperan a una persona y cuántas son tuyas.

El Panel es tu punto de partida. No se configura nada aquí: sirve para saber, de un vistazo, si hay clientes esperando y cómo está repartido tu embudo de ventas. Si un número aparece con un «+» (por ejemplo «1000+») significa que hay más registros de los que se muestran.

**En resumen, aquí puedes:**

- Tarjetas con contactos, leads abiertos, conversaciones en cola y las tuyas.
- Leads abiertos por etapa del pipeline.
- Lista de quién espera a una persona, con el motivo del traspaso.

#### Cómo saber qué atender primero

1. Mira la tarjeta «Conversaciones en cola»: son clientes que ya hablaron con el bot y esperan a una persona.
2. Baja a «Esperando a una persona»: verás quién es y el motivo (por ejemplo, el lead quedó calificado o el cliente pidió un asesor).
3. Pulsa «Ir a la bandeja» para atenderlos.

#### Cómo sacarle el mejor provecho

- Empieza el día por «Conversaciones en cola»: cada minuto de espera es un cliente que se enfría.
- Si «Leads abiertos por etapa» se acumula en una sola etapa, es señal de un cuello de botella en tu proceso.

**Relacionado:** [Bandeja](#bandeja) · [Pipeline](#pipeline)

### Bandeja

*Pantalla: `/inbox`*

> Aquí ves todas las conversaciones de WhatsApp con tus clientes, quién las atiende (bot o persona) y respondes como en WhatsApp.

La Bandeja es el corazón del CRM. Cada cliente tiene una conversación. Una conversación puede estar en tres estados: «Bot activo» (la atiende la inteligencia artificial), «En cola» (el bot terminó o el cliente pidió una persona, y espera a que alguien la tome) y «Con un agente» (una persona la tiene asignada). Solo puedes escribirle al cliente cuando la conversación está asignada a ti. La lista de la izquierda muestra las conversaciones (con contador de mensajes sin leer); la de la derecha, el chat; y a la derecha del chat, la Ficha del cliente.

**En resumen, aquí puedes:**

- Filtra por «En cola», «Con un agente» o «Bot activo».
- Toma una conversación para responder; devuélvela al bot cuando termines.
- La Ficha del cliente resume lo que el bot reunió, sin leer el chat.
- Los mensajes más nuevos están abajo, como en WhatsApp.
- Cada chat muestra «2/3 datos»: cuántos datos obligatorios ya reunió el bot. Filtra por «Datos completos» o «Faltan datos».
- Antes de que se cierre la ventana de 24 h de WhatsApp verás un aviso ámbar; si ya se cerró, la barra se bloquea con la explicación.

#### Cómo atender una conversación en cola

1. Filtra la lista por «En cola» y elige una conversación.
2. Revisa la Ficha del cliente: verás qué datos reunió el bot y cuáles faltan.
3. Pulsa «Tomar»: la conversación queda asignada a ti y se habilita la barra para escribir.
4. Escribe tu respuesta y pulsa Enter (o el botón verde). Usa Mayús + Enter para un salto de línea.

#### Cómo pasar una conversación a otra persona

1. Con la conversación abierta (estado «En cola» o «Con un agente»), usa el selector «Asignar a…».
2. Elige a la persona: la conversación queda asignada a ella.

#### Cómo devolver una conversación al bot

1. Abre una conversación que tengas asignada.
2. Pulsa «Devolver al bot»: el bot vuelve a responder los mensajes nuevos del cliente.

#### Cómo intervenir cuando el bot atiende

1. Abre una conversación en estado «Bot activo».
2. Pulsa «Pasar a una persona»: queda «En cola» y puedes tomarla.

#### Cómo ver mensajes antiguos

1. Se muestran los últimos mensajes. Sube al inicio del chat y pulsa «Cargar mensajes anteriores».
2. Los mensajes muy largos se recogen: pulsa «Ver más» para leerlos completos.

#### Cómo sacarle el mejor provecho

- Responde primero lo que está «En cola»: son los clientes que ya dieron sus datos y esperan.
- Usa la Ficha del cliente antes de escribir: te evita preguntar de nuevo lo que el cliente ya contestó al bot.
- Cuando termines con un cliente, «Devolver al bot» deja al bot atento a su siguiente mensaje.

#### Ten en cuenta

- WhatsApp solo permite escribir libremente dentro de las 24 horas siguientes al último mensaje del cliente. Cuando faltan menos de 2 horas, la Bandeja te avisa en ámbar; pasado ese tiempo la barra para escribir se bloquea y explica por qué (podrás responder cuando el cliente escriba de nuevo).
- Si tu organización está suspendida o en pago fallido, la Bandeja puede recibir mensajes pero no enviarlos: contacta al administrador de la plataforma.

**Relacionado:** [Ficha del cliente](#ficha-del-cliente) · [Configuración · Bot](#configuración--bot) · [Leads](#leads)

### Ficha del cliente

*Pantalla: `/inbox`*

> Un resumen ordenado de lo que el bot reunió del cliente y de lo que aún falta, para no tener que leer el chat.

Los datos que aparecen aquí son los que definiste en Configuración → Bot → «Datos que debe reunir el bot». El bot los va guardando durante la conversación: el nombre y el correo quedan en el contacto, y el resto en el lead. Cuando todos los datos obligatorios están completos, el lead se marca como calificado. Si más adelante quitas un campo de la configuración, sus valores ya guardados no se pierden: aparecen como «(otro dato)». En pantallas anchas la ficha está siempre visible a la derecha del chat; en pantallas pequeñas se abre con el botón «Ficha».

**En resumen, aquí puedes:**

- Datos recopilados con su valor real, o «Pendiente» si aún faltan.
- Avance «N de M» sobre los datos obligatorios y aviso de qué falta.
- Botón «Resumir con IA»: la inteligencia artificial redacta un resumen corto del caso (qué quiere, qué dio, qué falta, siguiente paso).
- Botón «Copiar resumen» para pegarlo en otro sitio.
- Etapa, estado y origen del lead, con enlaces al lead y al contacto.

#### Cómo copiar el resumen de un cliente

1. Abre la conversación y mira la Ficha del cliente.
2. Pulsa «Copiar resumen»: se copia un texto con el cliente, su teléfono, la etapa y cada dato.
3. Pégalo donde lo necesites (un correo, otra herramienta, un mensaje al equipo).

#### Cómo cambiar qué datos aparecen en la ficha

1. Ve a Configuración → Bot.
2. En «Datos que debe reunir el bot» añade, edita o quita campos.
3. Guarda: la ficha de todas las conversaciones usará la nueva lista.

#### Cómo sacarle el mejor provecho

- Define pocos datos obligatorios y útiles (nombre y qué necesita el cliente suele bastar): cada pregunta extra hace que el cliente abandone.
- Si ves muchos «Pendiente» en conversaciones que ya pasaron a una persona, el cliente se cansó antes de terminar: acorta el cuestionario.

#### Ten en cuenta

- «Resumir con IA» solo se genera cuando lo pulsas y consume tokens de IA de tu plan. Puede equivocarse: confírmalo en el chat. Hay un tope de 10 resúmenes cada 10 minutos por persona.

**Relacionado:** [Configuración · Bot](#configuración--bot) · [Bandeja](#bandeja) · [Detalle del lead](#detalle-del-lead)

### Contactos

*Pantalla: `/contacts`*

> La libreta de tus clientes: cada persona que te escribe por WhatsApp se crea sola como contacto.

Un contacto es una persona (identificada por su teléfono). Cuando un cliente escribe por primera vez, el sistema crea el contacto automáticamente, y también su primer lead y su conversación. No necesitas registrar a nadie a mano para atender WhatsApp; crear contactos manualmente sirve para clientes que aún no te han escrito (por ejemplo, para crearles un lead).

**En resumen, aquí puedes:**

- Busca por nombre, teléfono o correo.
- Crea contactos a mano con «Nuevo contacto».
- Abre un contacto para ver su historial comercial y sus conversaciones.

#### Cómo crear un contacto

1. Pulsa «Nuevo contacto».
2. Escribe el teléfono con indicativo del país (por ejemplo +573001112233), y opcionalmente el nombre y el correo.
3. Pulsa «Crear».

#### Cómo encontrar a un cliente

1. Escribe en el buscador parte del nombre, del teléfono o del correo.
2. Si la lista avisa que hay más contactos, refina la búsqueda.

#### Cómo sacarle el mejor provecho

- Escribe siempre el teléfono con indicativo: es lo que evita contactos duplicados.
- Completa el nombre y el correo: aparecen en la Ficha del cliente y en los reportes.

**Relacionado:** [Detalle del contacto](#detalle-del-contacto) · [Leads](#leads)

### Detalle del contacto

*Pantalla: `/contacts`*

> Todo sobre una persona: sus datos, su lead abierto, sus conversaciones y el historial de lo que ha pasado.

El historial comercial es una línea de tiempo de eventos: se creó un lead, cambió de etapa, el lead se calificó, se pidió pasar a una persona, un agente tomó la conversación, se creó una tarea, se cerró el lead. Sirve para entender qué pasó con un cliente sin preguntarle al equipo. El teléfono no se puede cambiar: identifica al contacto.

**En resumen, aquí puedes:**

- Edita el nombre y el correo.
- Ve su lead abierto y sus conversaciones.
- El historial comercial cuenta la historia: etapas, calificación, traspasos.

#### Cómo corregir los datos de un contacto

1. Entra al contacto desde la lista.
2. Cambia el nombre o el correo en «Datos».
3. Pulsa «Guardar cambios».

#### Cómo sacarle el mejor provecho

- Antes de llamar o escribir a un cliente antiguo, lee su historial comercial: te dice en qué quedó.

**Relacionado:** [Contactos](#contactos) · [Detalle del lead](#detalle-del-lead)

### Leads

*Pantalla: `/leads`*

> Cada oportunidad de venta. Un lead nace cuando un cliente te escribe y avanza por las etapas hasta ganarse o perderse.

Un contacto es la persona; un lead es la oportunidad de negocio con esa persona. Un mismo contacto puede tener varios leads a lo largo del tiempo (por ejemplo, un cliente que compró y vuelve meses después). El estado del lead indica quién lo atiende: «Atendido por el bot», «Espera a una persona», «Con un agente», «Ganado» o «Perdido».

**En resumen, aquí puedes:**

- Lista con título, contacto, estado y fecha.
- Busca por título o contacto y filtra por estado.
- Crea un lead a mano para un contacto que ya tengas.

#### Cómo crear un lead manualmente

1. Pulsa «Nuevo lead».
2. Busca y selecciona el contacto.
3. Escribe un título (opcional) y pulsa «Crear».

#### Cómo sacarle el mejor provecho

- Filtra por estado para revisar solo los que «Esperan a una persona».
- Cierra los leads que ya no avanzan (ganados o perdidos): un pipeline limpio da métricas confiables.

**Relacionado:** [Detalle del lead](#detalle-del-lead) · [Pipeline](#pipeline)

### Detalle del lead

*Pantalla: `/leads`*

> Cambia la etapa, asigna un responsable, ciérralo como ganado o perdido y revisa su historial.

Aquí gestionas una oportunidad concreta. Al cerrar un lead (ganado o perdido) queda registrado con su motivo. Si el cliente vuelve a escribir después de cerrado el lead, el sistema abre un lead nuevo en la misma conversación, para no mezclar oportunidades.

**En resumen, aquí puedes:**

- Selector de etapa para mover el lead en el pipeline.
- «Marcar como ganado» o «Marcar como perdido».
- Asignar un responsable.
- Historial completo de lo que ha pasado.

#### Cómo cerrar una venta

1. Abre el lead.
2. Pulsa «Marcar como ganado» si se concretó la venta, o «Marcar como perdido» si no avanzó. El lead queda cerrado y con su fecha de cierre.

#### Cómo asignar el lead a alguien

1. Abre el lead.
2. En «Responsable» elige a la persona.

#### Cómo sacarle el mejor provecho

- Cierra los leads en cuanto se resuelven (ganados o perdidos): así el pipeline y el Panel reflejan la realidad.
- Si un cliente vuelve a escribir después de cerrado su lead, no pierdes el historial: el sistema abre un lead nuevo en la misma conversación.

#### Ten en cuenta

- Solo Propietaria y Administradores pueden asignar leads a otras personas.

**Relacionado:** [Leads](#leads) · [Pipeline](#pipeline)

### Pipeline

*Pantalla: `/pipeline`*

> Tu embudo de ventas en columnas: arrastra cada lead de una etapa a otra a medida que avanza.

El pipeline te muestra dónde está cada oportunidad. Las etapas las defines tú en Configuración → Pipeline. Puedes mover leads arrastrándolos; cada movimiento queda en el historial y puede disparar automatizaciones (por ejemplo, avisar a alguien cuando un lead llegue a «Propuesta»).

**En resumen, aquí puedes:**

- Una columna por etapa, con el número de leads.
- Arrastra una tarjeta para cambiar su etapa (en móvil, mantenla pulsada).
- Cada tarjeta muestra el título y el contacto.

#### Cómo mover un lead de etapa

1. Arrastra la tarjeta a otra columna.
2. En móvil, mantén pulsada la tarjeta un instante y arrástrala; un deslizamiento normal desplaza el tablero.

#### Cómo sacarle el mejor provecho

- Mantén pocas etapas (5 a 7) con nombres que describan una acción concreta.
- Revisa las columnas con más tarjetas: ahí se atasca la venta.

**Relacionado:** [Configuración · Pipeline](#configuración--pipeline) · [Automatizaciones](#automatizaciones) · [Leads](#leads)

### Automatizaciones

*Pantalla: `/automations`*

> Reglas «si pasa esto, haz aquello» que trabajan solas: responder, cambiar de etapa, asignar, crear tareas o avisar a otro sistema.

Una automatización se compone de tres partes. El disparador es el evento que la inicia: «Nuevo contacto», «Mensaje recibido», «Cambio de etapa», «Lead calificado» o «Tiempo transcurrido». Las condiciones (hasta 10, todas deben cumplirse) filtran cuándo aplica. Los pasos (de 1 a 10) son las acciones: «Enviar WhatsApp», «Ejecutar la IA», «Cambiar de etapa», «Asignar agente», «Crear tarea», «Pasar a una persona» y «Llamar un webhook». Solo la Propietaria y los Administradores pueden crearlas. Para evitar bucles, las automatizaciones que disparan otras tienen un límite de encadenamiento.

**En resumen, aquí puedes:**

- Un disparador (qué pasa) + condiciones opcionales + pasos (qué hacer).
- Actívalas o desactívalas sin borrarlas.
- Revisa las últimas ejecuciones para ver si funcionan.

#### Cómo crear una automatización

1. Pulsa «Nueva automatización» y ponle un nombre.
2. Elige el disparador. Con «Tiempo transcurrido» indica cuánto tiempo debe pasar.
3. Añade condiciones si quieres que solo aplique a ciertos casos (por ejemplo, solo a leads de cierta etapa).
4. Añade uno o más pasos y completa lo que pide cada uno (el texto del mensaje, la etapa destino, el título de la tarea…).
5. Guarda. Queda activa: puedes desactivarla con el interruptor de la lista.

#### Cómo comprobar que funciona

1. Abre la automatización desde la lista.
2. Baja a «Últimas ejecuciones»: verás cuándo se ejecutó y si tuvo éxito.

#### Cómo sacarle el mejor provecho

- Empieza con una sola automatización sencilla, por ejemplo «Lead calificado → Crear tarea de seguimiento», y añade más cuando confíes en ella.
- Usa «Tiempo transcurrido» para seguimientos: un recordatorio cuando un lead lleva días sin avanzar.
- Para «Llamar un webhook» la dirección debe empezar por https://.

#### Ten en cuenta

- Una automatización que envía WhatsApp respeta las mismas reglas que un mensaje normal (ventana de 24 horas, límites de tu plan).
- Al borrar una automatización se pierde su configuración; si solo quieres pausarla, desactívala.

**Relacionado:** [Pipeline](#pipeline) · [Configuración · Bot](#configuración--bot)

### Configuración · Cuenta

*Pantalla: `/settings`*

> El nombre de tu organización y tu perfil.

Aquí ves los datos de tu organización y tu propio perfil (nombre, correo y rol). El nombre de la organización lo ven tus compañeros en la parte superior de todas las pantallas.

**En resumen, aquí puedes:**

- Solo la Propietaria puede cambiar el nombre de la cuenta.
- Consulta tu correo y tu rol.
- Las pestañas Usuarios, Canales, Pipeline y Bot solo las ven la Propietaria y los Administradores.

#### Cómo cambiar el nombre de la organización

1. Entra como Propietaria.
2. Edita el nombre en «Datos de la cuenta».
3. Pulsa «Guardar».

#### Cómo sacarle el mejor provecho

- Tu sesión se cierra sola tras 1 hora sin actividad, por seguridad.

**Relacionado:** [Configuración · Usuarios](#configuración--usuarios)

### Configuración · Usuarios

*Pantalla: `/settings`*

> Crea las cuentas de tu equipo, asígnales un rol y desactívalas cuando alguien se va.

Cada persona de tu equipo tiene su propio usuario. Los roles definen qué puede hacer cada una. El Agente atiende clientes: ve la Bandeja, contactos y leads, responde en las conversaciones que tiene asignadas y las devuelve al bot. El Administrador puede además gestionar usuarios, canales, bots, pipelines y automatizaciones, asignar conversaciones y leads, y ver la auditoría. La Propietaria puede todo lo anterior y cambiar el nombre de la organización. Solo estas dos últimas ven esta pestaña.

**En resumen, aquí puedes:**

- Tres roles: Agente, Administrador y Propietaria.
- Crea usuarios con una contraseña inicial.
- Cambia roles, desactiva usuarios y restablece contraseñas.

#### Cómo crear un usuario

1. Pulsa «Nuevo usuario».
2. Escribe nombre y correo, elige el rol y una contraseña inicial de al menos 10 caracteres.
3. Pulsa «Crear» y entrega la contraseña a la persona por un canal privado. Pídele que la cambie al entrar.

#### Cómo dar de baja a alguien

1. Busca a la persona en la lista.
2. Cambia su estado a «Desactivado»: no podrá volver a entrar, pero su historial se conserva.

#### Cómo sacarle el mejor provecho

- Da a cada persona el rol mínimo que necesita: la mayoría de tu equipo solo necesita ser Agente.
- Nunca compartas una cuenta entre varias personas: perderías el registro de quién hizo qué.

#### Ten en cuenta

- Si una persona olvida su contraseña, usa «Restablecer contraseña» y entrégale la nueva de forma privada.

**Relacionado:** [Configuración · Cuenta](#configuración--cuenta) · [Bandeja](#bandeja)

### Configuración · Canales

*Pantalla: `/settings`*

> Conecta tu número de WhatsApp Business: es por donde entran y salen los mensajes.

Un canal es un número de WhatsApp Business conectado a través de la API oficial de Meta. Necesitas: el Phone Number ID (solo dígitos), el número visible, opcionalmente el WABA ID, y un token de acceso de Meta. Cada canal tiene su propio bot. El token se guarda cifrado y nunca se vuelve a mostrar.

**En resumen, aquí puedes:**

- Crea un canal con los datos de Meta.
- Actualiza el token cuando caduque.
- Activa o desactiva un canal.

#### Cómo conectar tu WhatsApp

1. Pulsa «Nuevo canal».
2. Pon un nombre, el Phone Number ID, el número visible y el token de acceso de Meta.
3. Pulsa «Crear». Pídele al administrador de la plataforma la URL del webhook y regístrala en el panel de Meta.
4. Verifica que el canal esté «Activo» y escribe un mensaje de prueba.

#### Cómo actualizar un token vencido

1. Pulsa «Actualizar token» en el canal.
2. Pega el nuevo token de acceso (en Meta for Developers → API Setup, o el token permanente de tu usuario del sistema).
3. Pulsa «Guardar».

#### Cómo sacarle el mejor provecho

- El token de prueba de Meta caduca cada 24 horas. Para producción usa un token permanente de un usuario del sistema.
- Desactiva un canal si quieres dejar de recibir y enviar por ese número sin borrarlo.

#### Ten en cuenta

- Si los mensajes dejan de enviarse, lo más común es un token vencido: actualízalo primero.

**Relacionado:** [Configuración · Bot](#configuración--bot) · [Bandeja](#bandeja)

### Configuración · Pipeline

*Pantalla: `/settings`*

> Define las etapas de tu proceso de venta y en qué orden aparecen.

Las etapas «Abiertas» representan el avance de la venta (por ejemplo Nuevo, Contactado, Calificado, Propuesta, Negociación). Las etapas «Ganada» y «Perdida» son los finales. Cambiar el orden o los nombres no borra los leads: siguen en su etapa.

**En resumen, aquí puedes:**

- Añade, renombra, reordena y elimina etapas.
- Cada etapa es «Abierta», «Ganada» o «Perdida».
- El pipeline «Por defecto» es el que usan los leads nuevos.

#### Cómo añadir una etapa

1. Escribe el nombre en «Nueva etapa…».
2. Pulsa «Añadir».

#### Cómo reordenar

1. Usa las flechas de cada etapa para subirla o bajarla.

#### Cómo sacarle el mejor provecho

- Nombra las etapas por lo que sucede, no por números: «Enviar propuesta» es mejor que «Etapa 4».

#### Ten en cuenta

- Antes de eliminar una etapa, mueve los leads que tenga: revisa el Pipeline.

**Relacionado:** [Pipeline](#pipeline) · [Automatizaciones](#automatizaciones)

### Configuración · Bot

*Pantalla: `/settings`*

> Enseña al bot cómo atender: sus instrucciones, los datos que debe reunir y cuándo pasar la conversación a una persona.

El bot es un asistente de inteligencia artificial que responde los mensajes de WhatsApp. Su comportamiento se define aquí. Las instrucciones (system prompt) le explican quién es, qué vendes y cómo debe hablar. «Datos que debe reunir» es la lista de cosas que debe preguntar: cada campo tiene una clave (identificador interno), una etiqueta (lo que ve tu equipo), un destino (nombre del contacto, correo del contacto o dato del lead), un tipo (texto, correo, teléfono, número o lista de opciones) y si es obligatorio. Cuando todos los obligatorios están completos, el lead queda calificado. Las reglas de traspaso deciden cuándo entra una persona: automáticamente al calificar, cuando el cliente escribe una palabra clave (por ejemplo «asesor» o «humano»), o tras un máximo de turnos del bot. El mensaje de bienvenida se envía en el primer mensaje del bot y el «mensaje para contenido no soportado» responde a fotos, audios y otros formatos que el bot todavía no procesa.

**En resumen, aquí puedes:**

- Activa o pausa el bot de cada canal.
- Define los datos que debe reunir (nombre, interés…).
- Reglas de traspaso: al calificar, por palabras clave o tras N turnos.
- El modelo de IA lo asigna la plataforma.

#### Cómo poner a funcionar tu bot

1. Ve a Configuración → Bot y elige el canal.
2. Escribe las instrucciones: quién es el asistente, qué ofreces, tono, y qué NO debe hacer (por ejemplo, no prometer precios).
3. Añade los datos que debe reunir con «Añadir campo».
4. Ajusta las reglas de traspaso y guarda con «Guardar cambios».
5. Activa «Bot activo» y prueba escribiendo a tu WhatsApp.

#### Cómo añadir un dato que el bot debe reunir

1. Pulsa «Añadir campo».
2. Escribe la clave (minúsculas, dígitos y guion bajo, empezando por letra) y la etiqueta.
3. Elige el destino y el tipo. Si el tipo es lista, escribe las opciones separadas por coma.
4. Marca «Obligatorio» si es imprescindible para calificar al cliente.

#### Cómo sacarle el mejor provecho

- Instrucciones claras y cortas funcionan mejor que un texto larguísimo.
- Revisa conversaciones reales cada semana y afina las instrucciones con lo que veas.
- Marca como obligatorios solo los datos que de verdad necesitas para pasar al equipo.
- Cada campo solo puede apuntar una vez al nombre o al correo del contacto.

#### Ten en cuenta

- El modelo de IA (por ejemplo GPT) ya no se elige aquí: lo asigna el administrador de la plataforma según tu plan.
- Si el bot no responde, revisa que esté activo, que el canal esté activo y que tu organización no haya alcanzado los límites de su plan.

**Relacionado:** [Ficha del cliente](#ficha-del-cliente) · [Configuración · Canales](#configuración--canales) · [Bandeja](#bandeja)

## Glosario

- **Organización:** Tu empresa dentro del CRM. Todo lo que ves (contactos, leads, conversaciones) pertenece solo a tu organización.
- **Canal:** Un número de WhatsApp Business conectado al CRM.
- **Bot:** El asistente de inteligencia artificial que responde los mensajes de un canal.
- **Conversación:** El hilo de mensajes con un cliente. Puede estar en «Bot activo», «En cola» o «Con un agente».
- **Contacto:** Una persona, identificada por su teléfono.
- **Lead:** Una oportunidad de venta con un contacto. Avanza por las etapas del pipeline.
- **Pipeline:** El conjunto de etapas por las que pasa un lead hasta ganarse o perderse.
- **Calificado:** Un lead del que el bot ya reunió todos los datos obligatorios.
- **Traspaso:** El momento en que la conversación pasa del bot a una persona.
- **Ventana de 24 horas:** Regla de WhatsApp: solo puedes escribir libremente hasta 24 horas después del último mensaje del cliente.
- **Token:** La clave que autoriza al CRM a usar tu cuenta de WhatsApp de Meta.

## Preguntas frecuentes

**¿Cómo sé que mi cambio se guardó?**

Cada vez que guardas, creas o cambias algo aparece un aviso discreto en la esquina inferior derecha (verde si se guardó, rojo si no se pudo, con el motivo). Se cierra solo. Lo que cambia otra persona de tu equipo, o el administrador de la plataforma, aparece en tu pantalla en pocos segundos, sin recargar.

**Cambié el mensaje de bienvenida del bot y no veo el cambio.**

El saludo se usa solo en el primer mensaje de una conversación NUEVA. En una conversación en la que el bot ya saludó (por ejemplo, tu propio número de pruebas) no se vuelve a usar. Para probarlo, escribe desde un número que nunca haya hablado con el bot. Además, el bot empieza su respuesta con ese saludo pero puede adaptarlo un poco al mensaje del cliente. El cambio aplica desde el siguiente mensaje que reciba el bot, sin reiniciar nada.

**No veo una conversación nueva en la Bandeja.**

La lista se actualiza sola cada pocos segundos. Si el cliente escribió y no aparece, revisa que el canal esté activo (Configuración → Canales) y que el token de Meta no haya vencido.

**El bot no responde.**

Comprueba que el bot esté activo en Configuración → Bot, que la conversación esté en «Bot activo» (si una persona la tiene, el bot no responde) y que tu organización no esté pausada por límites. Si todo está bien, contacta al administrador de la plataforma.

**No puedo escribirle a un cliente.**

Necesitas tener la conversación asignada: pulsa «Tomar». Si aun así se rechaza, es probable que hayan pasado más de 24 horas desde el último mensaje del cliente (regla de WhatsApp).

**¿Por qué desapareció la opción de elegir el modelo de IA?**

Ahora el modelo lo asigna el administrador de la plataforma por organización, para controlar costos y calidad. Si necesitas otro modelo, pídeselo a él.

**¿Qué pasa si mi organización se suspende?**

Tus usuarios no podrán operar y el bot deja de responder. Los mensajes que lleguen se guardan, pero no se contestan solos al reactivar. Contacta al administrador de la plataforma.

**Olvidé mi contraseña.**

En la pantalla de inicio de sesión pulsa «¿Olvidaste tu contraseña?», escribe tu correo y abre el enlace que te llega (sirve una vez y dura 30 minutos). Al cambiarla se cierran tus sesiones abiertas. Si el correo no llega, pídele a la Propietaria o a un Administrador que use «Restablecer contraseña» en Configuración → Usuarios.
