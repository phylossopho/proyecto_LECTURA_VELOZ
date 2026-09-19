# Notas sobre Lectura Veloz

## ¿Qué es?

La lectura veloz (speed reading) es un conjunto de técnicas para aumentar la velocidad de lectura manteniendo o mejorando la comprensión. El lector promedio lee a 200-250 WPM (palabras por minuto). Lectores entrenados alcanzan 400-700 WPM.

---

## Técnicas principales

### 1. RSVP (Rapid Serial Visual Presentation)

**Cómo funciona:** Las palabras aparecen una por una (o en pequeños grupos) en una posición fija central de la pantalla. El lector no mueve los ojos, solo procesa.

**Ventajas:**
- Elimina los movimientos oculares (sacaqueos/regresiones)
- Ritmo completamente controlado por el sistema
- Fácil de implementar y medir
- Útil para textos lineales (artículos, libros)

**Desventajas:**
- Se pierde el contexto visual de la frase completa
- A velocidades muy altas (>400 WPM), la comprensión puede caer
- No funciona bien para textos técnicos/densas que requieren relectura

**Origen:** Documentado desde 1960, popularizado por apps como Spritz y Spreeder.

---

### 2. Chunking (Agrupamiento)

**Cómo funciona:** En lugar de leer palabra por palabra, el lector procesa grupos de 2-4 palabras en una sola fijación ocular.

**Base científica:** Estudios de eye-tracking muestran que el ojo humano hace fijaciones de ~200-300ms durante las cuales procesa 3-4 palabras. El chunking entrena al cerebro para aprovechar esa capacidad natural.

**Ventajas:**
- Más natural que RSVP puro
- Mejor comprensión (se ven relaciones entre palabras)
- Reduce el número de fijaciones por línea

**Desventajas:**
- Requiere práctica para grupos grandes
- Textos desordenados o complejos son más difíciles

**En la app:** El usuario selecciona 1, 2 o 3 palabras por pantalla.

---

### 3. Meta Guiding (Puntero / Pointer)

**Cómo funciona:** Un puntero visual (dedo, cursor, línea, barra) guía la mirada a lo largo del texto, indicando exactamente dónde enfocar.

**Base científica:** Investigaciones de la Universidad de Vanderbilt (Centro de Lectura) muestran que el uso de guía manual mejora la velocidad de lectura entre 30-50% en principiantes. Funciona porque:
- Reduce regresiones (volver atrás)
- Minimiza fijaciones innecesarias
- Mantiene la atención enfocada en la dirección correcta

**Tipos de puntero:**
- Dedo físico (el clásico: leer con el dedo en la página)
- Línea horizontal (resalta la línea actual)
- Cursor/pointer vertical (indica la palabra exacta)
- Caja/marco alrededor del área activa

**En la app:** Barra vertical `|` con animación sutil de respiración que marca la palabra focal.

**Por qué animación:** La pulsación del pointer crea un ritmo visual que sincroniza el procesamiento cognitivo con la transición entre palabras.

---

### 4. Reducción de Subvocalización

**Qué es:** La subvocalización es el "habla interna" que hacemos al leer — pronunciamos mentalmente cada palabra. Esto limita la velocidad a ~250 WPM (la velocidad máxima de habla).

**Técnica:** Reducir gradualmente la subvocalización mediante:
- Contar números mientras se lee (ocupa la "voz interna")
- Masticar chicle (interfiere con la articulación mental)
- Escuchar música sin letra (compite por recursos verbales)
- Practicar a velocidades altas forzando al cerebro a procesar sin hablar

**Por qué no está en la app:** Es una técnica de entrenamiento mental, no visual. No se puede implementar en UI. Pero el RSVP + velocidad creciente del entrenador ayuda indirectamente a reducir la subvocalización.

---

### 5. Regresión Elimination (Evitar volver atrás)

**Qué es:** Los lectores lentos gastan ~30% del tiempo volviendo a releer texto ya leído (regresiones). Eliminar regresiones es una de las mayores ganancias de velocidad.

**Técnicas:**
- Puntero/guía (impide volver atrás visualmente)
- Enfoque en bloques de texto en lugar de palabras individuales
- Entrenamiento con RSVP (el sistema no permite retroceder)

**En la app:** El puntero + la dirección forzada de avance (solo adelante por defecto) reducen regresiones.

---

### 6. Skimming / Pre-reading

**Cómo funciona:** Antes de leer en detalle, se explora el texto rápidamente:
- Títulos y subtítulos
- Primera y última oración de cada párrafo
- Palabras en negrita/cursiva
- Gráficos y resúmenes

**Cuándo usarlo:** Para obtener la idea general, localizar información específica, o decidir si el texto merece lectura profunda.

**Por qué no está en la app:** Es una técnica previa a la lectura, no durante. Podría ser una funcionalidad futura (modo "explorar" que muestra solo estructura del texto).

---

### 7. Training de Visión Periférica

**Cómo funciona:** Entrenar para captar más palabras en cada fijación usando la visión periférica. El punto de fijación es una palabra central, y se intenta leer 1-2 palabras a cada lado sin mover los ojos.

**Ejercicio clásico:** La técnica de Schulte — fijar la vista en un punto central y percibir números/palabras dispersas en la periferia.

**Por qué no está en la app:** Requiere una UI muy diferente (distribución no lineal de palabras). Es más un ejercicio de entrenamiento ocular que un método de lectura de texto.

---

## Micro-pausas y procesamiento cognitivo

**El problema:** A alta velocidad, el cerebro necesita tiempo para codificar el significado de cada chunk. Saltar de chunk en chunk sin pausa reduce la comprensión.

**Solución:** Insertar micro-pausas de 100-200ms al final de cada chunk (especialmente al final de frases/cláusulas). Esto permite:
- Integración del significado del chunk
- Transición al siguiente contexto
- Consolidación de la memoria de trabajo

**En la app:** 150ms de micro-pausa entre chunks. Idealmente, las pausas serían más largas al final de oraciones/coma y más cortas dentro de cláusulas (imitando la respiración del texto).

**Mejora futura:** Detectar puntuación (punto, coma, punto y coma) y variar la duración de la micro-pausa según la estructura de la oración.

---

## Velocidad recomendada por nivel

| Nivel | WPM | Chunk | Observación |
|---|---|---|---|
| Principiante | 100-150 | 1 | Concentrarse en el puntero |
| Básico | 150-250 | 1-2 | Agregar contexto visual |
| Intermedio | 250-350 | 2-3 | Reducir subvocalización |
| Avanzado | 350-500 | 3 | Skimming + chunking |
| Experto | 500-700 | 3-4 | Lectura casi completa |

---

## Impacto del color y Contraste en la lectura

**Principios:**
- Alto contraste en la palabra focal (blanco sobre oscuro) para anclar atención
- Contraste bajo en palabras de contexto para accesibilidad periférica sin competencia
- Fondo oscuro reduce fatiga en sesiones largas
- La barra de color del pointer (azul) diferencia del focal (blanco) — crea una señal dual (color + posición)

**Error común:** Mostrar todas las palabras al mismo brillo. Esto divide la atención y el cerebro no sabe dónde enfocar. La jerarquía visual es esencial.

**Dato clave:** La retina humana tiene máxima agudeza en la fóvea (centro de la visión, ~2° de ángulo). Las palabras fuera del centro se procesan con menor resolución. Por eso el contexto puede ser borroso — el cerebro lo usa para predicción, no para lectura detallada.

---

## Fijaciones oculares y lectura

El ojo humano NO lee de forma continua. Lee en fijaciones:
1. Fijación (~200-300ms) — el cerebro procesa
2. Saccada (~50ms) — el ojo salta a la siguiente posición
3. Repetir

Una línea de 10 palabras típicamente requiere 3-5 fijaciones para un lector rápido.

**El entrenador RSVP reduce esto a 1 fijación por palabra/chunk**, eliminando las saccadas.

---

## Resumen de técnicas según objetivo

| Objetivo | Técnica principal |
|---|---|
| Máxima velocidad | RSVP puro (1 palabra) |
| Velocidad + comprensión | Chunking + Pointer |
| Comprensión profunda | Chunking grande (3-4) + micro-pausas |
| Exploración rápida | Skimming |
| Buscar información | Scanning |
| Eliminar malos hábitos | Regresión elimination + Subvocalización reduction |

---

## Por qué HTML/CSS/JS para esta aplicación

1. **RSVP es fundamentalmente DOM-verbal** — mostrar/ocultar elementos es el core de la app, no Canvas/WebGL
2. **Animaciones CSS** (pointer breathing, transitions) son GPU-aceleradas a 60fps sin JavaScript
3. **Sin build step** — abrir el archivo funciona, sin npm, sin bundler
4. **Responsivo por defecto** — viewport meta + unidades relativas = PC y móvil
5. **Eventos táctiles nativos** — mobile funciona sin librerías
6. **Tamaño mínimo** — una sola librería no justifica el overhead para una herramienta de lectura
7. **Portabilidad** — se puede guardar como bookmark, instalar como PWA, o abrir desde USB

Alternativas descartadas:
- **React/Vue/Svelte**: Overhead de runtime innecesario para estado simple
- **Canvas/WebGL**: No hay beneficio para texto estático con animaciones CSS
- **Flutter/React Native**: Wrappers pesados para una app web pura
- **Electron**: Sobredimensionado (navegador empotrado para una app de navegador)

## Por que mltiples modos

No todos leen igual. La lectura veloz NO es una sola tcnica — es un conjunto de tcnicas y cada lector necesita una diferente:

| Cómo lees naturalmente | Modo recomendado | Por qu |
|---|---|---|
| Leo frases completas, me cuesta si me las rompen | **Frases completas** | No hay estorbo visual, mantienes tu flujo natural |
| Puedo procesar palabra a palabra si no hay distracciones | **Palabra por palabra** | Máxima fuerza de procesamiento, sin opciones |
| Leo bien en grupos pero necesito contexto | **Palabras en grupo** | Veo relaciones entre palabras con jerarquía visual |

### El error del "un solo modo"

Si alguien lee frases naturalmente y le muestras RSVP palabra a palabra, siente que es un estorbo porque:
- Su cerebro está acostumbrado a procesar oraciones completas
- La ruptura secuencial interrumpe la comprensión contextual
- La mirada pierde la "forma" de la oración

Por eso **antes de iniciar** el entrenador debe preguntar: ¿qué tipo de práctica quieres? Y explicar brevemente qué esperar de cada una.

### Progresión recomendada

Si no sabes qué modo elegir, empieza así:
1. **Frases completas** (2-3 semanas) — adapta tu cerebro al ritmo
2. **Palabras en grupo** (2-3 semanas) — reduce el procesamiento gramatical
3. **Palabra por palabra** (2-3 semanas) — máxima velocidad pura

Cada modo entrena una habilidad diferente. El orden importa: primero aprendes a mantener el ritmo, luego a procesar más en menos fijaciones, luego a eliminar por completo el movimiento ocular.

### Micro-pausas y procesamiento cognitivo

El cerebro necesita 100-200ms para codificar significado entre chunks. Sin pausa, la comprensión cae a alta velocidad. En modo frases, la duración de cada frase es proporcional: `(palabras / WPM) × 60 segundos`, mínimo 1.5 segundos. Esto permite procesar antes de que desaparezca.

**Mejora futura**: Detectar puntuación (punto, coma, punto y coma) y variar la duración de la micro-pausa según la estructura de la oración — pausas más largas al final de oraciones, más cortas dentro de cláusulas.
