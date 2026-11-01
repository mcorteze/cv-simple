// Catálogo de guías. Una guía es un dato: agregar o corregir una no toca la app.
//
// Paso: { zone, title, text, pane? }
//   zone: selector de lo que se resalta (null = mensaje centrado). Si la zona no
//         está a la vista (por ejemplo, en celular), el paso se omite.
//   pane: en celular, la pestaña que se abre antes del paso ('editor' o 'preview').
// Las guías solo muestran: nunca cambian el texto del CV.

const z = (name) => `[data-guide="${name}"]`;

export const GUIDE_GROUPS = { screen: 'Conocer esta pantalla', action: 'Cómo hago…' };

const screen = {
    id: 'p-editor',
    type: 'screen',
    title: 'Editor y vista previa',
    steps: [
        { zone: null, title: 'Tu CV en dos partes', text: 'En el editor escribes el texto; en la vista previa ves la hoja tal como saldrá en el PDF. Cada cambio se refleja al instante.' },
        { zone: z('actions'), title: 'Para empezar', text: 'Nuevo deja el editor en blanco, Ejemplo carga un CV de muestra e Importar trae uno desde Word o desde un archivo de texto. Si ya escribiste algo, se pide confirmación antes de reemplazarlo.' },
        { pane: 'editor', zone: z('editor'), title: 'Editor', text: 'Aquí va el texto del CV, con marcas simples: # para tu nombre, ## para cada sección y ### para un cargo con su fecha.' },
        { pane: 'editor', zone: z('editor-tools'), title: 'Herramientas', text: 'Insertan una sección, un cargo con fecha, una lista o negrita donde está el cursor. «Guía» resume cómo se escribe cada parte.' },
        { pane: 'editor', zone: z('save-status'), title: 'Guardado', text: 'El texto se guarda solo, en este navegador. No se envía a ningún lado: en otro equipo o en otro navegador no estará.' },
        { pane: 'preview', zone: z('page'), title: 'Vista previa', text: 'La hoja en tamaño A4. Las líneas punteadas con «Página 2», «Página 3»… marcan dónde corta cada página.' },
        { pane: 'preview', zone: z('review'), title: 'Revisión', text: 'Cuenta las páginas y avisa lo que conviene corregir: falta de correo o teléfono, cargos sin fecha, puntos muy largos o datos del ejemplo sin reemplazar.' },
        { pane: 'preview', zone: z('format'), title: 'Formato', text: 'Diseño cambia el estilo de la hoja. Letra, Márgenes y Espaciado ajustan cuánto cabe en cada página.' },
        { pane: 'preview', zone: z('zoom'), title: 'Zoom', text: 'Acerca o aleja la hoja solo en pantalla: el PDF no cambia. El botón del costado vuelve al ajuste automático.' },
        { zone: z('divider'), title: 'Ancho de los paneles', text: 'Arrastra esta línea para darle más espacio al editor o a la vista previa.' },
        { zone: z('pdf'), title: 'Exportar', text: 'Exportar PDF genera el archivo para enviar. Copiar texto sirve para pegar el CV en un formulario de postulación y Descargar .txt guarda una copia para seguir editándolo después.' },
    ],
};

const actions = [
    {
        id: 'a-importar',
        type: 'action',
        title: 'Traer mi CV desde Word',
        steps: [
            { zone: z('import'), title: '1. Presiona Importar', text: 'Acepta archivos .docx, .md y .txt. Un .doc antiguo hay que guardarlo antes como .docx desde Word. También puedes arrastrar el archivo sobre la ventana.' },
            { pane: 'editor', zone: z('editor'), title: '2. Revisa el texto', text: 'Cada documento de Word está armado de forma distinta: confirma que el nombre, las secciones, los cargos y las fechas hayan quedado con su marca (#, ## y ###).' },
            { pane: 'preview', zone: z('review'), title: '3. Mira la revisión', text: 'Avisa lo que quedó incompleto, como un cargo sin fecha o un dato de contacto que no se reconoció.' },
        ],
    },
    {
        id: 'a-seccion',
        type: 'action',
        title: 'Agregar una sección o un cargo',
        steps: [
            { pane: 'editor', zone: z('editor'), title: '1. Ubica el cursor', text: 'Haz clic en la línea después de la cual va lo nuevo.' },
            { pane: 'editor', zone: z('editor-tools'), title: '2. Presiona Sección', text: 'Inserta un título listo para reemplazar. Escríbelo en mayúsculas, como EXPERIENCIA o EDUCACIÓN.' },
            { pane: 'editor', zone: z('editor-tools'), title: '3. Agrega cada cargo', text: '«Cargo y fecha» inserta el cargo, la fecha que va a la derecha y la empresa en negrita. «Lista» convierte las líneas seleccionadas en puntos.' },
            { pane: 'preview', zone: z('page'), title: '4. Confirma en la vista previa', text: 'Lo nuevo aparece en la hoja de inmediato.' },
        ],
    },
    {
        id: 'a-una-pagina',
        type: 'action',
        title: 'Que el CV quepa en menos páginas',
        steps: [
            { pane: 'preview', zone: z('review'), title: '1. Mira cuántas páginas tiene', text: 'El total aparece arriba de la vista previa, y las líneas punteadas sobre la hoja muestran dónde corta.' },
            { pane: 'preview', zone: z('format'), title: '2. Ajusta el formato', text: 'Una letra más pequeña, márgenes estrechos o un espaciado compacto suelen bastar para ganar varias líneas.' },
            { pane: 'editor', zone: z('editor'), title: '3. Si aún no cabe, acorta', text: 'Deja los logros más relevantes de cada cargo y resume la experiencia más antigua.' },
        ],
    },
    {
        id: 'a-pdf',
        type: 'action',
        title: 'Descargar el CV en PDF',
        steps: [
            { zone: z('pdf'), title: '1. Presiona Exportar PDF', text: 'El archivo se descarga con tu nombre, por ejemplo CV_Ana_Perez.pdf, y queda en la carpeta de descargas del equipo o del teléfono.' },
            { zone: z('copy'), title: 'Para un formulario: Copiar texto', text: 'Copia el CV sin marcas, listo para pegar en un portal de empleo.' },
        ],
    },
];

const general = {
    id: 'g-recorrido',
    type: 'general',
    title: 'Del texto al PDF',
    steps: [
        { zone: null, title: 'Del texto al PDF', text: 'Este recorrido muestra el camino completo: desde un CV en blanco o en Word hasta el PDF listo para enviar.' },
        { zone: z('actions'), title: '1. Parte de algo', text: 'Empieza en blanco, desde el ejemplo o importando tu CV actual.' },
        { pane: 'editor', zone: z('editor'), title: '2. Escribe', text: 'Completa tus datos, secciones y cargos. Las herramientas sobre el editor insertan cada parte con su formato.' },
        { pane: 'preview', zone: z('page'), title: '3. Mira cómo queda', text: 'La vista previa muestra la hoja final y dónde corta cada página.' },
        { pane: 'preview', zone: z('review'), title: '4. Revisa', text: 'Corrige los avisos de la revisión antes de enviar.' },
        { pane: 'preview', zone: z('format'), title: '5. Ajusta el formato', text: 'Elige el diseño y ajusta letra, márgenes y espaciado hasta que la hoja quede bien.' },
        { zone: z('pdf'), title: '6. Exporta', text: 'Genera el PDF. Lo escrito queda guardado en este navegador para la próxima vez.' },
        { zone: z('guide'), title: 'Siempre a mano', text: 'Este botón está siempre arriba, con guías para cada parte.' },
    ],
};

export const GUIDES = [screen, ...actions, general];
