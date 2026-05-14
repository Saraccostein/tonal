# CLAUDE.md

## Proyecto

Mi proyecto de la materia de emprendimiento de la licenciatura de diseño gráfico es la construcción de un Producto Mínimo Viable de una idea de negocio. En este caso particular la idea es la modernización del calendario nahua a los tiempos modernos.

## Mercado

La Generación Z en México representa cerca del 30% de la población y se define por tres ejes: búsqueda de propósito, bienestar emocional y reconexión cultural. Es un grupo que consume de forma crítica, valora la autenticidad, prioriza la salud mental y combina lo digital con lo físico en su vida cotidiana.

## Producto

La idea consiste en un calendario físico que adapte el calendario gregoriano estándar y añada la capa de información del calendario ritual nahua —El Tonalpahualli—, junto con un chatbot digital operado por inteligencia artificial que sea capaz de facilitar el horóscopo del día según el tonalpahualli. 

## Sistema

Eres un programador fullstack experto. Desarolla el calendario con Transformers.js o WebLLm usando el sistema de diseño que te paso a continuación.

El objetivo es que el usuario mediante un chat pueda hablar con una inteligencia artificial que corre en el nmavegador que pueda pronosticar un horóscopo según el tonalpahuali y darle una explicación detallada de los signos del día, para ello, tendrás que investigar por tu cuenta (1) los signos y sus significados, (2) los dioses asosiados a cada signo y su energía y (3) el número de la trecena. La ia tiene que comprender que día es el actual (en gregoriano) encontrar los 3 puntos anteriores según el día en gregoriano y encontrar el día exacto en tonalpahualli (me estoy basando en esta pagina: <https://www.cantosfloridos.mx/calendario-nahuatl>) y poder desarrollar un horoscopo del día que satisfaga al usuario

Eres un desarrollador fullstack experto en aplicaciones web con inteligencia artificial en el navegador. Debes construir un sistema funcional utilizando Transformers.js o WebLLM. El objetivo es desarrollar un chatbot que funcione completamente en el navegador y que genere interpretaciones diarias basadas en el calendario Tonalpohualli. Requisitos funcionales:

1. El sistema debe detectar automáticamente la fecha actual en calendario gregoriano.

2. Debe convertir esa fecha al sistema del Tonalpohualli.

3. A partir de esa conversión debe identificar:

   * El signo del día (nahual)
   * El número de la trecena correspondiente
   * El dios o energía asociada a esa trecena (correponde al Dios deribado del signo con el que abre la trecena)

4. Con esta información, la IA debe generar un “horóscopo del día” en lenguaje natural. Requisitos de conocimiento: El sistema debe apoyarse en información verificada del calendario nahua, incluyendo:

5. Significados de los signos del Tonalpohualli

6. Deidades asociadas a cada signo y su simbolismo

7. Estructura de trecenas y su interpretación Referencia base: <https://www.cantosfloridos.mx/calendario-nahuatl> Resultado esperado: El usuario debe poder interactuar con un chatbot en lenguaje natural que:

8. Identifique el día actual automáticamente

9. Devuelva su correspondencia en el Tonalpohualli

10. Explique el significado energético del día de forma clara, culturalmente respetuosa y comprensible

11. Genere una lectura tipo “horóscopo” coherente con la tradición nahua

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture

Everything lives in `tonalpohualli_10.html`: HTML structure, all CSS, and all JavaScript as an ES module (`<script type="module">`).

**Key sections of the JS module:**

- **`SIGNOS` array** — The 20 Nahua calendar signs, each with `nahuatl`, `es` (Spanish), `emoji`, `dios` (deity), and `significado` (meaning).
- **`getTonalDay(date)`** — Core calendar algorithm. Correlates a Gregorian date to the Tonalpohualli 260-day cycle using a fixed epoch of 1 Jan 2024 = 1 Cipactli. Returns the current sign, trecena number (1–13), opening sign of the trecena, and position in the 260-day cycle.
- **`initSidebar()`** — Populates today's card and the 20-sign index in the sidebar.
- **`loadModel()`** — Loads `HuggingFaceTB/SmolLM2-360M-Instruct` (q4, WASM) from HuggingFace via the `@huggingface/transformers@3.5.0` CDN package. Downloads ~1 GB on first load; cached by the browser afterwards.
- **`buildMessages(userMessage)`** — Builds the chat messages array, injecting today's Tonalpohualli data into the system prompt so the model responds in context.
- **`callClaude(userMessage)`** — Runs inference with streaming via `TextStreamer`; updates the chat bubble token-by-token.
- **`parseMarkdown(text)` / `inlineFormat(text)`** — Lightweight custom Markdown-to-HTML renderer (headings, lists, blockquotes, bold/italic, inline code, HR). HTML is escaped before inline formatting to prevent XSS.

**Layout:** Two-column CSS Grid (`320px sidebar | 1fr chat`), collapses to single-column on mobile (`max-width: 768px`).

**Design tokens** are CSS custom properties on `:root` (navy, green, red, gold palette + font stacks).

## Important Constraints

- The model runs **entirely in the browser** (WebAssembly, no server-side inference). Do not add a backend API unless replacing the local model approach entirely.
- The calendar correlation epoch is hardcoded: `2024-01-01 = signo 0 (Cipactli), trecena number 1`. Changing this affects all date calculations.
- The system prompt caps responses at 120 words (`max_new_tokens: 200`) to keep the small model coherent.
- All UI text and AI responses are in **Spanish (Mexican locale `es-MX`)**.
