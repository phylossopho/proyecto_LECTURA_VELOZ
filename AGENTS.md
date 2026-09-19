# AGENTS.md — Guía para Implementación del Proyecto

## Descripcin

Entrenador de Lectura Veloz: aplicacin web (HTML/CSS/JS vanilla) para practicar lectura rpida con 4 modos de entrenamiento, configuracin avanzada y seguimiento de estadsticas.

## Progreso y estadsticas

### Archivo progress.json

Ubicacin: `proyecto_LECTURA_VELOZ/progress.json`

Estructura:
```json
{
    "sessions": 0,
    "totalWords": 0,
    "totalTime": 0,
    "bestWPM": 0,
    "history": []
}
```

- `sessions`: nmero de sesiones completadas
- `totalWords`: total de palabras leidas
- `totalTime`: tiempo acumulado en segundos
- `bestWPM`: mayor velocidad alcanzada
- `history`: historial detallado de cada sesin (se agrega futuramente)

### Estadsticas en pantalla

Al terminar cada sesin, se actualizan automticamente:
- Se registra la sesin en `trainingStats`
- Se guarda en `localStorage` bajo clave `reading-stats`
- Se muestra en el modal de configuracin del engranaje

## Modales

### Modal de configuracin (engranaje ⚙)

Accesible desde el icono en la barra superior. Ventana compacta sin campos de texto:
- Botn "Cerrar" (abajo a la izquierda)
- Botn "Config rápido" (abajo a la derecha)
- Botones de tema (Oscuro/Neón/Claro)
- Botones de tamaño (Pequeño/Mediano/Grande)

Se cierra con el botn "Cerrar", click fuera o presionando Escape.

### Modal "Config rápido" (#quick-modal)

Accesible desde el botn "Config rápido" en la barra superior (siempre visible al inicio):
- Slider WPM (50-600)
- Tamao de chunk (3/5/7)
- Color de fondo, resaltado y texto

### Botón "Editar texto" (✏)

Ubicado en la barra superior (top-bar). Abre el modal de configuración con el texto actual cargado para edición.

## Estructura del proyecto

```
proyecto_LECTURA_VELOZ/
  index.html          ← Estructura DOM, referencia CSS/JS
  styles.css          ← Estilos (3 temas + responsive + animaciones)
  app.js              ← Coordinador principal (estado compartido, flujo global)
  mode-word.js        ← Motor modo palabra por palabra (RSVP)
  mode-chunk.js       ← Motor modo palabras en grupo (chunking)
  mode-line.js        ← Motor modo frases completas
  mode-starwars.js    ← Motor modo Estrella Wars (scroll ascendente)
  test_app.js         ← Tests unitarios (Node.js)
  progress.json       ← Estadsticas de entrenamiento (plantilla)
  notas-lectura-veloz.md
  README.md
  AGENTS.md
```

## Arquitectura de motores

Cada modo de prctica tiene su propio archivo JS ("motor"). `app.js` es el coordinador que mantiene el estado compartido (variables globales, DOM, eventos) y delega las operaciones especficas de cada modo a su motor correspondiente.

Los motores se cargan en `index.html` antes que `app.js` (funciones globales disponibles por hoisting):

| Motor | Archivo | Funciones |
|---|---|---|
| Palabra por palabra | `mode-word.js` | `renderWordDisplay`, `scheduleWordNext` |
| Palabras en grupo | `mode-chunk.js` | `renderChunkDisplay`, `scheduleChunkNext` |
| Frases completas | `mode-line.js` | `renderLineDisplay`, `updateLineTimer`, `scheduleLineNext` |
| Estrella Wars | `mode-starwars.js` | `splitStarWarsGroups`, `renderStarWarsDisplay`, `startStarWarsAnimation`, `animateStarWars`, `pauseStarWars`, `resumeStarWars`, `clearStarWarsPresentation`, etc. |

`app.js` coordina mediante delegacin: `renderDisplay()` llama al render del motor activo, `togglePause()` llama al pause/resume del motor, y el handler de teclado delega el avance a cada motor.

Esto permite modificar un modo sin afectar a los dems.

## Flujo de desarrollo

Los algoritmos de procesamiento de texto (agrupación, chunking, splitting) se desarrollan y prueban primero en **Python**. Cuando la lógica produce grupos correctos en Python con múltiples textos de prueba, se porta fielmente a JS en el archivo del modo correspondiente. Esto evita iterar a ciegas en el navegador.

## Flujo de ejecución

```
1. Abrir index.html en navegador
2. Carga preferencias desde localStorage (tema, WPM, chunk size, modo, font size)
3. Modal "Selecciona método" → usuario elige modo (word/chunk/line/starwars)
4. Modal "Configurar Texto" → usuario pega texto o elige ejemplo
5. Sesin activa con controles de velocidad y avance
6. Al terminar → pantalla "Fin!" + registro de estadsticas en localStorage
```

## Modelo de estado clave

```javascript
mode              // 'word' | 'chunk' | 'line' | 'starwars'
wpm               // velocidad (50-600)
chunkSize         // palabras por grupo (3, 5, 7) — solo modo chunk
currentTheme      // 'dark' | 'neon' | 'light'
fontSize          // 'small' | 'medium' | 'large'
words[]           // array de palabras (modo word)
chunks[]          // array de {words: [], endsWith: type} (modo chunk)
sentences[]       // array de oraciones completas (modo line)
currentChunk      // índice actual en chunks[]
currentIndex      // índice actual en words[]
currentSentence   // índice actual en sentences[]
isRunning / isPaused
pausedDuration    // tiempo acumulado en pausas
chunkPauseMs      // micro-pausa variable según puntuación
trainingStats     // { sessions, totalWords, totalTime, bestWPM }
```

## Preferencias en localStorage

| Clave | Valor |
|---|---|
| `reading-theme` | 'dark' \| 'neon' \| 'light' |
| `reading-wpm` | nmero (50-600) |
| `reading-chunkSize` | 3 \| 5 \| 7 |
| `reading-mode` | 'word' \| 'chunk' \| 'line' | 'starwars' |
| `reading-fontSize` | 'small' \| 'medium' \| 'large' |
| `reading-stats` | JSON { sessions, totalWords, totalTime, bestWPM } |

## Funciones principales

### Coordinador (`app.js`)

| Funcin | Propsito |
|---|---|
| `startReading()` | Inicia sesin según modo, delega al motor |
| `togglePause()` | Pausa/reanuda, delega pause/resume al motor |
| `resetReading()` | Reinicia todo, limpia estado del motor activo |
| `finishReading()` | Termina sesión, limpia motor y registra stats |
| `renderDisplay()` | Delega render al motor del modo activo |
| `updateTimer()` | Actualiza timer, delega timer visual al motor |
| `loadText(text)` | Procesa texto → words, sentences, chunks |
| `splitIntoChunks(text, targetSize)` | Divide texto en chunks respetando puntuación |
| `getPauseForEndType(type)` | Retorna micro-pausa (200-600ms) según signo |
| `updateWPM()` | Actualiza WPM y notifica al motor si aplica |
| `adjustWPM(delta)` | Ajusta WPM +/- 20 |
| `setChunk(size)` | Cambia chunk size |
| `loadPreferences()` / `savePreferences()` | Persistencia de configuración |
| `setTheme(theme)` / `setFontSize(size)` / `setColor(type)` | Configuración visual |

### Motores de modo

| Motor | Archivo | Funciones |
|---|---|---|
| Palabra por palabra | `mode-word.js` | `renderWordDisplay`, `scheduleWordNext` |
| Palabras en grupo | `mode-chunk.js` | `renderChunkDisplay`, `scheduleChunkNext` |
| Frases completas | `mode-line.js` | `renderLineDisplay`, `updateLineTimer`, `scheduleLineNext` |
| Estrella Wars | `mode-starwars.js` | `renderStarWarsDisplay`, `startStarWarsAnimation`, `animateStarWars`, `pauseStarWars`, `resumeStarWars`, `clearStarWarsPresentation`, `splitStarWarsGroups`, `getStarWarsDuration` |

### Modal / configuración

## Funciones testeables (test_app.js)

| Función | Test |
|---|---|
| `cleanWord(word)` | Elimina puntuación |
| `getEndType(word)` | Clasifica tipo de fin (sentence/clause/list/normal) |
| `getPauseForEndType(type)` | Retorna ms según tipo |
| `splitSentences(text)` | Divide por puntuación final |
| `splitIntoChunks(text, target)` | Respetando puntuación, N palabras máx |
| `formatTime(seconds)` | Formato MM:SS |
| `loadPref(key, default)` | Retorna default si no existe |
| `savePref(key, value)` | Almacena en localStorage |

Ejecutar: `node test_app.js` → debe mostrar `27/27 tests passed`

Los tests de `test_app.js` cubren solo funciones compartidas (utilidades, chunking, formato). Las funciones específicas de modo (ej. `splitStarWarsGroups`) se prueban en **Python** antes de portar a JS.

## Técnicas implementadas

- Chunking inteligente — grupos de 3-7 palabras separados por puntuación
- Meta Guiding — pointer `|` con animación de respiración
- Contexto visual — 4 niveles de opacidad (100%, 60%, 40%, 20%)
- Colores personalizados por tema (fondo, resaltado, texto)
- Micro-pausas variables — 200ms normal, 350ms coma, 300ms lista, 600ms punto final
- Flexbox gap para separación de palabras (arreglo crítico)
- `.chunk-box` — contenedor con borde y fondo alrededor de TODO el chunk en modo grupo
- `.chunk-word` — clase uniforme para TODAS las palabras del chunk (sin resaltado individual)
- Colores personalizados por tema (fondo, resaltado, texto)

## Temas disponibles

| Tema | Fondo | Acento principal |
|---|---|---|
| Oscuro (default) | #0f0f1a | #7c8aff (azul) |
| Neón | #050510 | #00d4ff (cyan) |
| Claro | #d8d8d8 | #4a5ac7 (azul suave) |

## Modos de práctica

| Modo | Descripción | Para quién |
|---|---|---|
| Palabra por palabra | RSVP con pointer | Máxima velocidad |
| Palabras en grupo | 3-7 palabras con puntuación | Velocidad + comprensión |
| Frases completas | Frase visible, avance automático | Lectura natural a ritmo |
| Estrella Wars | Texto dorado subiendo desde abajo | Diversión y entrenamiento visual |

## Slider WPM

Mnimo 50 (para niños de primaria), máximo 600.

## Micro-pausas por puntuación

| Signo final | Pausa |
|---|---|
| Punto, signos de pregunta/exclamación | 600ms |
| Coma, punto y coma | 350ms |
| Dos puntos | 300ms |
| Sin puntuación | 200ms |

## Problemas conocidos

- **Modo grupo — visibilidad de chunk-box**: se implement `.chunk-box` como contenedor visible alrededor del chunk. Verificar en navegador real si todas las palabras son visibles y resaltadas correctamente.
- **Tema claro**: fondo `#d8d8d8`, texto `#2a2a2a`. `setColor('bg')` guarda color por tema y afecta solo ese tema.

## Posibles mejoras futuras

- [ ] Pausas proporcionales según longitud de oración (modo line)
- [ ] Detección automática de puntuación en modos word/chunk
- [ ] Compartir estadísticas entre dispositivos
- [ ] Modo child-friendly con interfaz más colorida y recompensas
- [ ] Modo skimming (leer títulos/subtítulos rápidamente)
- [ ] Importar texto desde archivo .txt
- [ ] Crear lista de palabras difíciles para repasar
- [ ] Animación de pointer más suave (requestAnimationFrame)
- [ ] Soporte para idiomas con acentos (actualmente usa texto sin tildes)
- [ ] Sincronización de estadísticas en servidor
- [ ] Dashboard de progreso con gráficos
