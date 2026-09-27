import type { HelpGuide } from "./types";

export const ORGANIZATION_GUIDE: HelpGuide = {
  audience: "organization",
  title: "Manual del CRM para tu organización",
  intro:
    "Este manual es para las personas que usan el CRM en el día a día: propietaria, administradores y agentes. " +
    "Explica qué hace cada sección, cómo se usa y cómo sacarle el mejor provecho. El CRM recibe los mensajes de WhatsApp " +
    "de tus clientes, los atiende con un bot de inteligencia artificial que reúne los datos que tú definas, y cuando hace falta " +
    "pasa la conversación a una persona de tu equipo. Todo queda ordenado en contactos, leads y un pipeline de ventas.",
  quickStart: {
    title: "Primeros pasos: de cero a atender clientes",
    steps: [
      "Entra a Configuración → Canales y crea tu canal de WhatsApp con los datos de Meta (Phone Number ID, número visible y token de acceso).",
      "En Configuración → Bot escribe las instrucciones de tu bot, define los datos que debe reunir (por ejemplo nombre y qué necesita el cliente) y actívalo.",
      "Revisa tus etapas de venta en Configuración → Pipeline y ajústalas a tu forma de vender.",
      "Invita a tu equipo desde Configuración → Usuarios: crea una cuenta para cada persona con su rol (Agente o Administrador).",
      "Escribe un mensaje de prueba a tu número de WhatsApp: verás la conversación aparecer en la Bandeja y la respuesta del bot.",
      "Cuando el bot termine de reunir los datos, la conversación pasa a «En cola»: un agente la toma desde la Bandeja y continúa la atención.",
    ],
  },
  workflow: {
    title: "Cómo trabajar cada día",
    steps: [
      "Empieza por el Panel: mira cuántas conversaciones esperan a una persona y cuántas son tuyas.",
      "Abre la Bandeja y filtra por «En cola». Elige una conversación y revisa la Ficha del cliente para ver, sin leer todo el chat, qué datos reunió el bot y qué falta.",
      "Pulsa «Tomar» para quedarte con la conversación y responde al cliente. Si el cliente ya tiene lo que necesitaba, marca el lead como ganado o perdido.",
      "Si la conversación se puede resolver de forma automática, puedes «Devolver al bot».",
      "Mueve cada oportunidad por el Pipeline a medida que avanza la venta. Las etapas te dicen en qué punto está cada cliente.",
      "Una vez por semana revisa las Automatizaciones y la configuración del bot: ajusta instrucciones y datos según lo que veas en las conversaciones reales.",
    ],
  },
  topics: [
    {
      id: "dashboard",
      title: "Panel",
      route: "/dashboard",
      summary:
        "Tu resumen del día: cuántos contactos y leads tienes, cuántas conversaciones esperan a una persona y cuántas son tuyas.",
      points: [
        "Tarjetas con contactos, leads abiertos, conversaciones en cola y las tuyas.",
        "Leads abiertos por etapa del pipeline.",
        "Lista de quién espera a una persona, con el motivo del traspaso.",
      ],
      purpose:
        "El Panel es tu punto de partida. No se configura nada aquí: sirve para saber, de un vistazo, si hay clientes esperando y cómo está repartido tu embudo de ventas. " +
        "Si un número aparece con un «+» (por ejemplo «1000+») significa que hay más registros de los que se muestran.",
      howTo: [
        {
          title: "Cómo saber qué atender primero",
          steps: [
            "Mira la tarjeta «Conversaciones en cola»: son clientes que ya hablaron con el bot y esperan a una persona.",
            "Baja a «Esperando a una persona»: verás quién es y el motivo (por ejemplo, el lead quedó calificado o el cliente pidió un asesor).",
            "Pulsa «Ir a la bandeja» para atenderlos.",
          ],
        },
      ],
      tips: [
        "Empieza el día por «Conversaciones en cola»: cada minuto de espera es un cliente que se enfría.",
        "Si «Leads abiertos por etapa» se acumula en una sola etapa, es señal de un cuello de botella en tu proceso.",
      ],
      related: ["inbox", "pipeline"],
    },
    {
      id: "inbox",
      title: "Bandeja",
      route: "/inbox",
      summary:
        "Aquí ves todas las conversaciones de WhatsApp con tus clientes, quién las atiende (bot o persona) y respondes como en WhatsApp.",
      points: [
        "Filtra por «En cola», «Con un agente» o «Bot activo».",
        "Toma una conversación para responder; devuélvela al bot cuando termines.",
        "La Ficha del cliente resume lo que el bot reunió, sin leer el chat.",
        "Los mensajes más nuevos están abajo, como en WhatsApp.",
        "Cada chat muestra «2/3 datos»: cuántos datos obligatorios ya reunió el bot. Filtra por «Datos completos» o «Faltan datos».",
        "Antes de que se cierre la ventana de 24 h de WhatsApp verás un aviso ámbar; si ya se cerró, la barra se bloquea con la explicación.",
      ],
      purpose:
        "La Bandeja es el corazón del CRM. Cada cliente tiene una conversación. Una conversación puede estar en tres estados: " +
        "«Bot activo» (la atiende la inteligencia artificial), «En cola» (el bot terminó o el cliente pidió una persona, y espera a que alguien la tome) " +
        "y «Con un agente» (una persona la tiene asignada). Solo puedes escribirle al cliente cuando la conversación está asignada a ti. " +
        "La lista de la izquierda muestra las conversaciones (con contador de mensajes sin leer); la de la derecha, el chat; y a la derecha del chat, la Ficha del cliente.",
      howTo: [
        {
          title: "Cómo atender una conversación en cola",
          steps: [
            "Filtra la lista por «En cola» y elige una conversación.",
            "Revisa la Ficha del cliente: verás qué datos reunió el bot y cuáles faltan.",
            "Pulsa «Tomar»: la conversación queda asignada a ti y se habilita la barra para escribir.",
            "Escribe tu respuesta y pulsa Enter (o el botón verde). Usa Mayús + Enter para un salto de línea.",
          ],
        },
        {
          title: "Cómo pasar una conversación a otra persona",
          steps: [
            "Con la conversación abierta (estado «En cola» o «Con un agente»), usa el selector «Asignar a…».",
            "Elige a la persona: la conversación queda asignada a ella.",
          ],
        },
        {
          title: "Cómo devolver una conversación al bot",
          steps: [
            "Abre una conversación que tengas asignada.",
            "Pulsa «Devolver al bot»: el bot vuelve a responder los mensajes nuevos del cliente.",
          ],
        },
        {
          title: "Cómo intervenir cuando el bot atiende",
          steps: [
            "Abre una conversación en estado «Bot activo».",
            "Pulsa «Pasar a una persona»: queda «En cola» y puedes tomarla.",
          ],
        },
        {
          title: "Cómo ver mensajes antiguos",
          steps: [
            "Se muestran los últimos mensajes. Sube al inicio del chat y pulsa «Cargar mensajes anteriores».",
            "Los mensajes muy largos se recogen: pulsa «Ver más» para leerlos completos.",
          ],
        },
      ],
      tips: [
        "Responde primero lo que está «En cola»: son los clientes que ya dieron sus datos y esperan.",
        "Usa la Ficha del cliente antes de escribir: te evita preguntar de nuevo lo que el cliente ya contestó al bot.",
        "Cuando termines con un cliente, «Devolver al bot» deja al bot atento a su siguiente mensaje.",
      ],
      cautions: [
        "WhatsApp solo permite escribir libremente dentro de las 24 horas siguientes al último mensaje del cliente. Cuando faltan menos de 2 horas, la Bandeja te avisa en ámbar; pasado ese tiempo la barra para escribir se bloquea y explica por qué (podrás responder cuando el cliente escriba de nuevo).",
        "Si tu organización está suspendida o en pago fallido, la Bandeja puede recibir mensajes pero no enviarlos: contacta al administrador de la plataforma.",
      ],
      related: ["customer-summary", "settings-bot", "leads"],
    },
    {
      id: "customer-summary",
      title: "Ficha del cliente",
      route: "/inbox",
      summary:
        "Un resumen ordenado de lo que el bot reunió del cliente y de lo que aún falta, para no tener que leer el chat.",
      points: [
        "Datos recopilados con su valor real, o «Pendiente» si aún faltan.",
        "Avance «N de M» sobre los datos obligatorios y aviso de qué falta.",
        "Botón «Resumir con IA»: la inteligencia artificial redacta un resumen corto del caso (qué quiere, qué dio, qué falta, siguiente paso).",
        "Botón «Copiar resumen» para pegarlo en otro sitio.",
        "Etapa, estado y origen del lead, con enlaces al lead y al contacto.",
      ],
      purpose:
        "Los datos que aparecen aquí son los que definiste en Configuración → Bot → «Datos que debe reunir el bot». " +
        "El bot los va guardando durante la conversación: el nombre y el correo quedan en el contacto, y el resto en el lead. " +
        "Cuando todos los datos obligatorios están completos, el lead se marca como calificado. Si más adelante quitas un campo de la configuración, " +
        "sus valores ya guardados no se pierden: aparecen como «(otro dato)». En pantallas anchas la ficha está siempre visible a la derecha del chat; " +
        "en pantallas pequeñas se abre con el botón «Ficha».",
      howTo: [
        {
          title: "Cómo copiar el resumen de un cliente",
          steps: [
            "Abre la conversación y mira la Ficha del cliente.",
            "Pulsa «Copiar resumen»: se copia un texto con el cliente, su teléfono, la etapa y cada dato.",
            "Pégalo donde lo necesites (un correo, otra herramienta, un mensaje al equipo).",
          ],
        },
        {
          title: "Cómo cambiar qué datos aparecen en la ficha",
          steps: [
            "Ve a Configuración → Bot.",
            "En «Datos que debe reunir el bot» añade, edita o quita campos.",
            "Guarda: la ficha de todas las conversaciones usará la nueva lista.",
          ],
        },
      ],
      cautions: [
        "«Resumir con IA» solo se genera cuando lo pulsas y consume tokens de IA de tu plan. Puede equivocarse: confírmalo en el chat. Hay un tope de 10 resúmenes cada 10 minutos por persona.",
      ],
      tips: [
        "Define pocos datos obligatorios y útiles (nombre y qué necesita el cliente suele bastar): cada pregunta extra hace que el cliente abandone.",
        "Si ves muchos «Pendiente» en conversaciones que ya pasaron a una persona, el cliente se cansó antes de terminar: acorta el cuestionario.",
      ],
      related: ["settings-bot", "inbox", "lead-detail"],
    },
    {
      id: "contacts",
      title: "Contactos",
      route: "/contacts",
      summary:
        "La libreta de tus clientes: cada persona que te escribe por WhatsApp se crea sola como contacto.",
      points: [
        "Busca por nombre, teléfono o correo.",
        "Crea contactos a mano con «Nuevo contacto».",
        "Abre un contacto para ver su historial comercial y sus conversaciones.",
      ],
      purpose:
        "Un contacto es una persona (identificada por su teléfono). Cuando un cliente escribe por primera vez, el sistema crea el contacto automáticamente, " +
        "y también su primer lead y su conversación. No necesitas registrar a nadie a mano para atender WhatsApp; crear contactos manualmente sirve para clientes que aún no te han escrito " +
        "(por ejemplo, para crearles un lead).",
      howTo: [
        {
          title: "Cómo crear un contacto",
          steps: [
            "Pulsa «Nuevo contacto».",
            "Escribe el teléfono con indicativo del país (por ejemplo +573001112233), y opcionalmente el nombre y el correo.",
            "Pulsa «Crear».",
          ],
        },
        {
          title: "Cómo encontrar a un cliente",
          steps: [
            "Escribe en el buscador parte del nombre, del teléfono o del correo.",
            "Si la lista avisa que hay más contactos, refina la búsqueda.",
          ],
        },
      ],
      tips: [
        "Escribe siempre el teléfono con indicativo: es lo que evita contactos duplicados.",
        "Completa el nombre y el correo: aparecen en la Ficha del cliente y en los reportes.",
      ],
      related: ["contact-detail", "leads"],
    },
    {
      id: "contact-detail",
      title: "Detalle del contacto",
      route: "/contacts",
      summary:
        "Todo sobre una persona: sus datos, su lead abierto, sus conversaciones y el historial de lo que ha pasado.",
      points: [
        "Edita el nombre y el correo.",
        "Ve su lead abierto y sus conversaciones.",
        "El historial comercial cuenta la historia: etapas, calificación, traspasos.",
      ],
      purpose:
        "El historial comercial es una línea de tiempo de eventos: se creó un lead, cambió de etapa, el lead se calificó, se pidió pasar a una persona, un agente tomó la conversación, se creó una tarea, se cerró el lead. " +
        "Sirve para entender qué pasó con un cliente sin preguntarle al equipo. El teléfono no se puede cambiar: identifica al contacto.",
      howTo: [
        {
          title: "Cómo corregir los datos de un contacto",
          steps: [
            "Entra al contacto desde la lista.",
            "Cambia el nombre o el correo en «Datos».",
            "Pulsa «Guardar cambios».",
          ],
        },
      ],
      tips: [
        "Antes de llamar o escribir a un cliente antiguo, lee su historial comercial: te dice en qué quedó.",
      ],
      related: ["contacts", "lead-detail"],
    },
    {
      id: "leads",
      title: "Leads",
      route: "/leads",
      summary:
        "Cada oportunidad de venta. Un lead nace cuando un cliente te escribe y avanza por las etapas hasta ganarse o perderse.",
      points: [
        "Lista con título, contacto, estado y fecha.",
        "Busca por título o contacto y filtra por estado.",
        "Crea un lead a mano para un contacto que ya tengas.",
      ],
      purpose:
        "Un contacto es la persona; un lead es la oportunidad de negocio con esa persona. Un mismo contacto puede tener varios leads a lo largo del tiempo " +
        "(por ejemplo, un cliente que compró y vuelve meses después). El estado del lead indica quién lo atiende: «Atendido por el bot», «Espera a una persona», «Con un agente», «Ganado» o «Perdido».",
      howTo: [
        {
          title: "Cómo crear un lead manualmente",
          steps: [
            "Pulsa «Nuevo lead».",
            "Busca y selecciona el contacto.",
            "Escribe un título (opcional) y pulsa «Crear».",
          ],
        },
      ],
      tips: [
        "Filtra por estado para revisar solo los que «Esperan a una persona».",
        "Cierra los leads que ya no avanzan (ganados o perdidos): un pipeline limpio da métricas confiables.",
      ],
      related: ["lead-detail", "pipeline"],
    },
    {
      id: "lead-detail",
      title: "Detalle del lead",
      route: "/leads",
      summary:
        "Cambia la etapa, asigna un responsable, ciérralo como ganado o perdido y revisa su historial.",
      points: [
        "Selector de etapa para mover el lead en el pipeline.",
        "«Marcar como ganado» o «Marcar como perdido».",
        "Asignar un responsable.",
        "Historial completo de lo que ha pasado.",
      ],
      purpose:
        "Aquí gestionas una oportunidad concreta. Al cerrar un lead (ganado o perdido) queda registrado con su motivo. " +
        "Si el cliente vuelve a escribir después de cerrado el lead, el sistema abre un lead nuevo en la misma conversación, para no mezclar oportunidades.",
      howTo: [
        {
          title: "Cómo cerrar una venta",
          steps: [
            "Abre el lead.",
            "Pulsa «Marcar como ganado» si se concretó la venta, o «Marcar como perdido» si no avanzó. El lead queda cerrado y con su fecha de cierre.",
          ],
        },
        {
          title: "Cómo asignar el lead a alguien",
          steps: ["Abre el lead.", "En «Responsable» elige a la persona."],
        },
      ],
      tips: [
        "Cierra los leads en cuanto se resuelven (ganados o perdidos): así el pipeline y el Panel reflejan la realidad.",
        "Si un cliente vuelve a escribir después de cerrado su lead, no pierdes el historial: el sistema abre un lead nuevo en la misma conversación.",
      ],
      cautions: [
        "Solo Propietaria y Administradores pueden asignar leads a otras personas.",
      ],
      related: ["leads", "pipeline"],
    },
    {
      id: "pipeline",
      title: "Pipeline",
      route: "/pipeline",
      summary:
        "Tu embudo de ventas en columnas: arrastra cada lead de una etapa a otra a medida que avanza.",
      points: [
        "Una columna por etapa, con el número de leads.",
        "Arrastra una tarjeta para cambiar su etapa (en móvil, mantenla pulsada).",
        "Cada tarjeta muestra el título y el contacto.",
      ],
      purpose:
        "El pipeline te muestra dónde está cada oportunidad. Las etapas las defines tú en Configuración → Pipeline. " +
        "Puedes mover leads arrastrándolos; cada movimiento queda en el historial y puede disparar automatizaciones (por ejemplo, avisar a alguien cuando un lead llegue a «Propuesta»).",
      howTo: [
        {
          title: "Cómo mover un lead de etapa",
          steps: [
            "Arrastra la tarjeta a otra columna.",
            "En móvil, mantén pulsada la tarjeta un instante y arrástrala; un deslizamiento normal desplaza el tablero.",
          ],
        },
      ],
      tips: [
        "Mantén pocas etapas (5 a 7) con nombres que describan una acción concreta.",
        "Revisa las columnas con más tarjetas: ahí se atasca la venta.",
      ],
      related: ["settings-pipeline", "automations", "leads"],
    },
    {
      id: "automations",
      title: "Automatizaciones",
      route: "/automations",
      summary:
        "Reglas «si pasa esto, haz aquello» que trabajan solas: responder, cambiar de etapa, asignar, crear tareas o avisar a otro sistema.",
      points: [
        "Un disparador (qué pasa) + condiciones opcionales + pasos (qué hacer).",
        "Actívalas o desactívalas sin borrarlas.",
        "Revisa las últimas ejecuciones para ver si funcionan.",
      ],
      purpose:
        "Una automatización se compone de tres partes. El disparador es el evento que la inicia: «Nuevo contacto», «Mensaje recibido», «Cambio de etapa», «Lead calificado» o «Tiempo transcurrido». " +
        "Las condiciones (hasta 10, todas deben cumplirse) filtran cuándo aplica. Los pasos (de 1 a 10) son las acciones: «Enviar WhatsApp», «Ejecutar la IA», «Cambiar de etapa», «Asignar agente», «Crear tarea», «Pasar a una persona» y «Llamar un webhook». " +
        "Solo la Propietaria y los Administradores pueden crearlas. Para evitar bucles, las automatizaciones que disparan otras tienen un límite de encadenamiento.",
      howTo: [
        {
          title: "Cómo crear una automatización",
          steps: [
            "Pulsa «Nueva automatización» y ponle un nombre.",
            "Elige el disparador. Con «Tiempo transcurrido» indica cuánto tiempo debe pasar.",
            "Añade condiciones si quieres que solo aplique a ciertos casos (por ejemplo, solo a leads de cierta etapa).",
            "Añade uno o más pasos y completa lo que pide cada uno (el texto del mensaje, la etapa destino, el título de la tarea…).",
            "Guarda. Queda activa: puedes desactivarla con el interruptor de la lista.",
          ],
        },
        {
          title: "Cómo comprobar que funciona",
          steps: [
            "Abre la automatización desde la lista.",
            "Baja a «Últimas ejecuciones»: verás cuándo se ejecutó y si tuvo éxito.",
          ],
        },
      ],
      tips: [
        "Empieza con una sola automatización sencilla, por ejemplo «Lead calificado → Crear tarea de seguimiento», y añade más cuando confíes en ella.",
        "Usa «Tiempo transcurrido» para seguimientos: un recordatorio cuando un lead lleva días sin avanzar.",
        "Para «Llamar un webhook» la dirección debe empezar por https://.",
      ],
      cautions: [
        "Una automatización que envía WhatsApp respeta las mismas reglas que un mensaje normal (ventana de 24 horas, límites de tu plan).",
        "Al borrar una automatización se pierde su configuración; si solo quieres pausarla, desactívala.",
      ],
      related: ["pipeline", "settings-bot"],
    },
    {
      id: "settings-account",
      title: "Configuración · Cuenta",
      route: "/settings",
      summary: "El nombre de tu organización y tu perfil.",
      points: [
        "Solo la Propietaria puede cambiar el nombre de la cuenta.",
        "Consulta tu correo y tu rol.",
        "Las pestañas Usuarios, Canales, Pipeline y Bot solo las ven la Propietaria y los Administradores.",
      ],
      purpose:
        "Aquí ves los datos de tu organización y tu propio perfil (nombre, correo y rol). El nombre de la organización lo ven tus compañeros en la parte superior de todas las pantallas.",
      howTo: [
        {
          title: "Cómo cambiar el nombre de la organización",
          steps: [
            "Entra como Propietaria.",
            "Edita el nombre en «Datos de la cuenta».",
            "Pulsa «Guardar».",
          ],
        },
      ],
      tips: [
        "Tu sesión se cierra sola tras 1 hora sin actividad, por seguridad.",
      ],
      related: ["settings-users"],
    },
    {
      id: "settings-users",
      title: "Configuración · Usuarios",
      route: "/settings",
      summary:
        "Crea las cuentas de tu equipo, asígnales un rol y desactívalas cuando alguien se va.",
      points: [
        "Tres roles: Agente, Administrador y Propietaria.",
        "Crea usuarios con una contraseña inicial.",
        "Cambia roles, desactiva usuarios y restablece contraseñas.",
      ],
      purpose:
        "Cada persona de tu equipo tiene su propio usuario. Los roles definen qué puede hacer cada una. " +
        "El Agente atiende clientes: ve la Bandeja, contactos y leads, responde en las conversaciones que tiene asignadas y las devuelve al bot. " +
        "El Administrador puede además gestionar usuarios, canales, bots, pipelines y automatizaciones, asignar conversaciones y leads, y ver la auditoría. " +
        "La Propietaria puede todo lo anterior y cambiar el nombre de la organización. Solo estas dos últimas ven esta pestaña.",
      howTo: [
        {
          title: "Cómo crear un usuario",
          steps: [
            "Pulsa «Nuevo usuario».",
            "Escribe nombre y correo, elige el rol y una contraseña inicial de al menos 10 caracteres.",
            "Pulsa «Crear» y entrega la contraseña a la persona por un canal privado. Pídele que la cambie al entrar.",
          ],
        },
        {
          title: "Cómo dar de baja a alguien",
          steps: [
            "Busca a la persona en la lista.",
            "Cambia su estado a «Desactivado»: no podrá volver a entrar, pero su historial se conserva.",
          ],
        },
      ],
      tips: [
        "Da a cada persona el rol mínimo que necesita: la mayoría de tu equipo solo necesita ser Agente.",
        "Nunca compartas una cuenta entre varias personas: perderías el registro de quién hizo qué.",
      ],
      cautions: [
        "Si una persona olvida su contraseña, usa «Restablecer contraseña» y entrégale la nueva de forma privada.",
      ],
      related: ["settings-account", "inbox"],
    },
    {
      id: "settings-channels",
      title: "Configuración · Canales",
      route: "/settings",
      summary:
        "Conecta tu número de WhatsApp Business: es por donde entran y salen los mensajes.",
      points: [
        "Crea un canal con los datos de Meta.",
        "Actualiza el token cuando caduque.",
        "Activa o desactiva un canal.",
      ],
      purpose:
        "Un canal es un número de WhatsApp Business conectado a través de la API oficial de Meta. Necesitas: el Phone Number ID (solo dígitos), el número visible, " +
        "opcionalmente el WABA ID, y un token de acceso de Meta. Cada canal tiene su propio bot. El token se guarda cifrado y nunca se vuelve a mostrar.",
      howTo: [
        {
          title: "Cómo conectar tu WhatsApp",
          steps: [
            "Pulsa «Nuevo canal».",
            "Pon un nombre, el Phone Number ID, el número visible y el token de acceso de Meta.",
            "Pulsa «Crear». Pídele al administrador de la plataforma la URL del webhook y regístrala en el panel de Meta.",
            "Verifica que el canal esté «Activo» y escribe un mensaje de prueba.",
          ],
        },
        {
          title: "Cómo actualizar un token vencido",
          steps: [
            "Pulsa «Actualizar token» en el canal.",
            "Pega el nuevo token de acceso (en Meta for Developers → API Setup, o el token permanente de tu usuario del sistema).",
            "Pulsa «Guardar».",
          ],
        },
      ],
      tips: [
        "El token de prueba de Meta caduca cada 24 horas. Para producción usa un token permanente de un usuario del sistema.",
        "Desactiva un canal si quieres dejar de recibir y enviar por ese número sin borrarlo.",
      ],
      cautions: [
        "Si los mensajes dejan de enviarse, lo más común es un token vencido: actualízalo primero.",
      ],
      related: ["settings-bot", "inbox"],
    },
    {
      id: "settings-pipeline",
      title: "Configuración · Pipeline",
      route: "/settings",
      summary:
        "Define las etapas de tu proceso de venta y en qué orden aparecen.",
      points: [
        "Añade, renombra, reordena y elimina etapas.",
        "Cada etapa es «Abierta», «Ganada» o «Perdida».",
        "El pipeline «Por defecto» es el que usan los leads nuevos.",
      ],
      purpose:
        "Las etapas «Abiertas» representan el avance de la venta (por ejemplo Nuevo, Contactado, Calificado, Propuesta, Negociación). " +
        "Las etapas «Ganada» y «Perdida» son los finales. Cambiar el orden o los nombres no borra los leads: siguen en su etapa.",
      howTo: [
        {
          title: "Cómo añadir una etapa",
          steps: ["Escribe el nombre en «Nueva etapa…».", "Pulsa «Añadir»."],
        },
        {
          title: "Cómo reordenar",
          steps: ["Usa las flechas de cada etapa para subirla o bajarla."],
        },
      ],
      tips: [
        "Nombra las etapas por lo que sucede, no por números: «Enviar propuesta» es mejor que «Etapa 4».",
      ],
      cautions: [
        "Antes de eliminar una etapa, mueve los leads que tenga: revisa el Pipeline.",
      ],
      related: ["pipeline", "automations"],
    },
    {
      id: "settings-bot",
      title: "Configuración · Bot",
      route: "/settings",
      summary:
        "Enseña al bot cómo atender: sus instrucciones, los datos que debe reunir y cuándo pasar la conversación a una persona.",
      points: [
        "Activa o pausa el bot de cada canal.",
        "Define los datos que debe reunir (nombre, interés…).",
        "Reglas de traspaso: al calificar, por palabras clave o tras N turnos.",
        "El modelo de IA lo asigna la plataforma.",
      ],
      purpose:
        "El bot es un asistente de inteligencia artificial que responde los mensajes de WhatsApp. Su comportamiento se define aquí. " +
        "Las instrucciones (system prompt) le explican quién es, qué vendes y cómo debe hablar. «Datos que debe reunir» es la lista de cosas que debe preguntar: " +
        "cada campo tiene una clave (identificador interno), una etiqueta (lo que ve tu equipo), un destino (nombre del contacto, correo del contacto o dato del lead), un tipo (texto, correo, teléfono, número o lista de opciones) y si es obligatorio. " +
        "Cuando todos los obligatorios están completos, el lead queda calificado. Las reglas de traspaso deciden cuándo entra una persona: automáticamente al calificar, cuando el cliente escribe una palabra clave (por ejemplo «asesor» o «humano»), o tras un máximo de turnos del bot. " +
        "El mensaje de bienvenida se envía en el primer mensaje del bot y el «mensaje para contenido no soportado» responde a fotos, audios y otros formatos que el bot todavía no procesa.",
      howTo: [
        {
          title: "Cómo poner a funcionar tu bot",
          steps: [
            "Ve a Configuración → Bot y elige el canal.",
            "Escribe las instrucciones: quién es el asistente, qué ofreces, tono, y qué NO debe hacer (por ejemplo, no prometer precios).",
            "Añade los datos que debe reunir con «Añadir campo».",
            "Ajusta las reglas de traspaso y guarda con «Guardar cambios».",
            "Activa «Bot activo» y prueba escribiendo a tu WhatsApp.",
          ],
        },
        {
          title: "Cómo añadir un dato que el bot debe reunir",
          steps: [
            "Pulsa «Añadir campo».",
            "Escribe la clave (minúsculas, dígitos y guion bajo, empezando por letra) y la etiqueta.",
            "Elige el destino y el tipo. Si el tipo es lista, escribe las opciones separadas por coma.",
            "Marca «Obligatorio» si es imprescindible para calificar al cliente.",
          ],
        },
      ],
      tips: [
        "Instrucciones claras y cortas funcionan mejor que un texto larguísimo.",
        "Revisa conversaciones reales cada semana y afina las instrucciones con lo que veas.",
        "Marca como obligatorios solo los datos que de verdad necesitas para pasar al equipo.",
        "Cada campo solo puede apuntar una vez al nombre o al correo del contacto.",
      ],
      cautions: [
        "El modelo de IA (por ejemplo GPT) ya no se elige aquí: lo asigna el administrador de la plataforma según tu plan.",
        "Si el bot no responde, revisa que esté activo, que el canal esté activo y que tu organización no haya alcanzado los límites de su plan.",
      ],
      related: ["customer-summary", "settings-channels", "inbox"],
    },
    {
      id: "campaign",
      title: "Campaña",
      route: "/campaign",
      summary:
        "Solo aparece si tu organización es de tipo «Campaña política»: el perfil del candidato, las propuestas o preguntas frecuentes que quieres publicar y los próximos eventos.",
      points: [
        "El bot solo responde con lo que publiques aquí: nunca inventa propuestas ni cifras.",
        "Un documento no se ve hasta que lo publiques.",
        "Solo la Propietaria y los Administradores pueden editar; el resto puede ver.",
      ],
      purpose:
        "Esta sección es la fuente oficial y autorizada de información que el bot usa para responder a los ciudadanos por WhatsApp. Tiene tres partes: el perfil (nombre, cargo o aspiración y una biografía corta), la información oficial " +
        "(propuestas, ejes programáticos o preguntas frecuentes, cada una como un documento con título y contenido) y los próximos eventos (título, fecha, lugar y si es público). Un documento nace SIN publicar: mientras no lo publiques, el bot no lo ve ni lo puede citar. " +
        "Esto te deja preparar contenido con calma antes de que llegue a los ciudadanos.",
      howTo: [
        {
          title: "Cómo publicar una propuesta",
          steps: [
            "Entra a Campaña → Información y pulsa «Nuevo documento».",
            "Escribe un título y el contenido completo.",
            "Guarda como borrador si quieres revisarlo después, o marca «Publicado» cuando esté listo.",
          ],
        },
        {
          title: "Cómo anunciar un evento",
          steps: [
            "Entra a Campaña → Eventos y pulsa «Nuevo evento».",
            "Escribe el título, la fecha y hora, y el lugar (opcional).",
            "La fecha debe ser futura: no se pueden crear eventos ya pasados.",
          ],
        },
      ],
      tips: [
        "Escribe el contenido de cada documento como si el ciudadano fuera a leerlo tal cual: el bot lo recorta si es muy largo.",
        "Actualiza el perfil del candidato con la información que más preguntan los ciudadanos (nombre, cargo, propuestas clave).",
        "Los eventos pasados dejan de aparecer solos en «Próximos»: no hace falta borrarlos.",
      ],
      cautions: [
        "Un documento sin publicar es invisible para el bot, aunque exista y lo veas en esta lista.",
        "El bot nunca completa con información que no esté aquí: si algo falta, le dice al ciudadano que una persona se lo confirmará.",
      ],
      related: ["citizen-requests", "settings-bot"],
    },
    {
      id: "citizen-requests",
      title: "Solicitudes ciudadanas",
      route: "/citizen-requests",
      summary:
        "Solo aparece si tu organización es de tipo «Campaña política»: quejas, reclamos, ideas, peticiones, ayuda o solicitudes de reunión que dejan los ciudadanos, cada una con su radicado.",
      points: [
        "Cada solicitud recibe un radicado único (por ejemplo REQUEST-2026-000001) al crearse.",
        "El bot las registra solo y pasa la conversación a una persona; también puedes registrar una a mano.",
        "Cambia el estado (Abierta, En trámite, Resuelta, Cerrada) y deja un motivo: queda en el historial.",
      ],
      purpose:
        "Cuando un ciudadano expresa con claridad una queja, un reclamo, una idea, una petición, una solicitud de ayuda o de reunión, el bot la registra aquí automáticamente y pasa la conversación a una persona del equipo — nunca se cierra sola. " +
        "El radicado es el número que le das al ciudadano para que haga seguimiento. El historial de estado (quién cambió qué, cuándo y por qué) queda guardado sin poder editarse, para que el seguimiento sea trazable.",
      howTo: [
        {
          title: "Cómo hacer seguimiento a una solicitud",
          steps: [
            "Ábrela desde la lista (puedes filtrar por estado o por tipo).",
            "Revisa el radicado, el contacto y la descripción.",
            "Cambia el estado cuando avances (por ejemplo a «En trámite») y escribe un motivo breve.",
          ],
        },
        {
          title: "Cómo registrar una solicitud a mano",
          steps: [
            "Pulsa «Nueva solicitud».",
            "Busca y selecciona el contacto, elige el tipo y escribe el asunto.",
            "Guarda: el radicado se genera solo.",
          ],
        },
      ],
      tips: [
        "Usa el filtro por estado para ver primero lo que sigue «Abierta».",
        "El motivo del cambio de estado queda visible en el historial: escribe algo útil para quien lo revise después.",
      ],
      related: ["campaign", "inbox"],
    },
  ],
  glossary: [
    {
      term: "Organización",
      definition:
        "Tu empresa dentro del CRM. Todo lo que ves (contactos, leads, conversaciones) pertenece solo a tu organización.",
    },
    {
      term: "Canal",
      definition: "Un número de WhatsApp Business conectado al CRM.",
    },
    {
      term: "Bot",
      definition:
        "El asistente de inteligencia artificial que responde los mensajes de un canal.",
    },
    {
      term: "Conversación",
      definition:
        "El hilo de mensajes con un cliente. Puede estar en «Bot activo», «En cola» o «Con un agente».",
    },
    {
      term: "Contacto",
      definition: "Una persona, identificada por su teléfono.",
    },
    {
      term: "Lead",
      definition:
        "Una oportunidad de venta con un contacto. Avanza por las etapas del pipeline.",
    },
    {
      term: "Pipeline",
      definition:
        "El conjunto de etapas por las que pasa un lead hasta ganarse o perderse.",
    },
    {
      term: "Calificado",
      definition:
        "Un lead del que el bot ya reunió todos los datos obligatorios.",
    },
    {
      term: "Traspaso",
      definition:
        "El momento en que la conversación pasa del bot a una persona.",
    },
    {
      term: "Ventana de 24 horas",
      definition:
        "Regla de WhatsApp: solo puedes escribir libremente hasta 24 horas después del último mensaje del cliente.",
    },
    {
      term: "Token",
      definition:
        "La clave que autoriza al CRM a usar tu cuenta de WhatsApp de Meta.",
    },
  ],
  faq: [
    {
      question: "¿Cómo sé que mi cambio se guardó?",
      answer:
        "Cada vez que guardas, creas o cambias algo aparece un aviso discreto en la esquina inferior derecha (verde si se guardó, rojo si no se pudo, con el motivo). Se cierra solo. Lo que cambia otra persona de tu equipo, o el administrador de la plataforma, aparece en tu pantalla en pocos segundos, sin recargar.",
    },
    {
      question: "Cambié el mensaje de bienvenida del bot y no veo el cambio.",
      answer:
        "El saludo se usa solo en el primer mensaje de una conversación NUEVA. En una conversación en la que el bot ya saludó (por ejemplo, tu propio número de pruebas) no se vuelve a usar. Para probarlo, escribe desde un número que nunca haya hablado con el bot. Además, el bot empieza su respuesta con ese saludo pero puede adaptarlo un poco al mensaje del cliente. El cambio aplica desde el siguiente mensaje que reciba el bot, sin reiniciar nada.",
    },
    {
      question: "No veo una conversación nueva en la Bandeja.",
      answer:
        "La lista se actualiza sola cada pocos segundos. Si el cliente escribió y no aparece, revisa que el canal esté activo (Configuración → Canales) y que el token de Meta no haya vencido.",
    },
    {
      question: "El bot no responde.",
      answer:
        "Comprueba que el bot esté activo en Configuración → Bot, que la conversación esté en «Bot activo» (si una persona la tiene, el bot no responde) y que tu organización no esté pausada por límites. Si todo está bien, contacta al administrador de la plataforma.",
    },
    {
      question: "No puedo escribirle a un cliente.",
      answer:
        "Necesitas tener la conversación asignada: pulsa «Tomar». Si aun así se rechaza, es probable que hayan pasado más de 24 horas desde el último mensaje del cliente (regla de WhatsApp).",
    },
    {
      question: "¿Por qué desapareció la opción de elegir el modelo de IA?",
      answer:
        "Ahora el modelo lo asigna el administrador de la plataforma por organización, para controlar costos y calidad. Si necesitas otro modelo, pídeselo a él.",
    },
    {
      question: "¿Qué pasa si mi organización se suspende?",
      answer:
        "Tus usuarios no podrán operar y el bot deja de responder. Los mensajes que lleguen se guardan, pero no se contestan solos al reactivar. Contacta al administrador de la plataforma.",
    },
    {
      question: "Olvidé mi contraseña.",
      answer:
        "En la pantalla de inicio de sesión pulsa «¿Olvidaste tu contraseña?», escribe tu correo y abre el enlace que te llega (sirve una vez y dura 30 minutos). Al cambiarla se cierran tus sesiones abiertas. Si el correo no llega, pídele a la Propietaria o a un Administrador que use «Restablecer contraseña» en Configuración → Usuarios.",
    },
  ],
};
