# Markdown CV

Escribe tu currículum en texto simple y descárgalo en PDF. No necesitas crear una cuenta ni instalar nada: se usa desde el navegador y lo que escribes se queda en tu equipo, no se envía a ningún servidor.

## Qué puedes hacer

- Escribir y ver el resultado al instante, con botones para agregar secciones, cargos, listas y negrita.
- Volver más tarde y encontrar tu texto, siempre que uses el mismo navegador.
- Elegir entre tres diseños (Clásico, Formal y Moderno) y ajustar letra, márgenes y espaciado.
- Saber cuántas páginas ocupa tu CV y dónde corta cada una.
- Recibir avisos si faltan datos de contacto o fechas, o si el CV quedó demasiado largo.
- Partir desde un archivo `.docx`, `.txt` o `.md`.
- Copiar el texto limpio para pegarlo en portales de empleo.

## Cómo usarlo

1. Presiona **Nuevo**, o reemplaza el CV de ejemplo con tus datos.
2. Elige un diseño y revisa la cantidad de páginas.
3. Presiona **Exportar PDF** y selecciona «Guardar como PDF» en la ventana de impresión.

## Cómo se escribe

| Para crear | Escribe |
|---|---|
| Tu nombre | `# Nombre Apellido` |
| Una sección | `## EXPERIENCIA` |
| Un cargo con su fecha | `### Cargo \| 2022 - Actualidad` |
| Una lista | `- Logro o función` |
| Negrita | `**texto**` |

## Contribuir

Las ideas y mejoras son bienvenidas. Puedes abrir un *issue* para contar un error o proponer algo, o enviar un *pull request* con tu cambio.

Para trabajar en el proyecto necesitas [Node.js](https://nodejs.org):

```
npm install
npm run dev
```

Antes de enviar un cambio, comprueba que `npm run build` termine sin errores.

Tres principios guían el proyecto:

- **Privado**: el texto de cada persona no sale de su navegador.
- **Compatible**: los diseños usan una sola columna para que los sistemas de selección de personal puedan leer el CV.
- **Simple**: cualquier persona debe poder usarlo sin saber qué es Markdown.
