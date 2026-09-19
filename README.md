# Entrenador de Lectura Veloz

Aplicacin web interactiva para practicar lectura veloz con 3 métodos de entrenamiento seleccionables.

## Cmo empezar

1. Abrir `index.html` en el navegador
2. Seleccionar método de práctica (se explica cada uno)
3. Configurar texto o elegir ejemplo
4. Ajustar velocidad y presionar Iniciar

## Tres métodos de práctica

| Mtodo | Descripcin | Ideal para |
|---|---|---|
| **Palabra por palabra** | Las palabras aparecen una a una con puntero visual `\|` que marca el ritmo. | Velocidad pura, mxximo procesamiento visual |
| **Palabras en grupo** | Ves 1-3 palabras con contexto visual (opacidad reducida). Puntero incluido. | Velocidad + comprensin, textos tcnicos |
| **Frases completas** | Lees la frase entera visible en pantalla. Avance automtico segn WPM. | Lectura natural a ritmo controlado |

### Cules son los estorbos visuales

Cada modo tiene un propsito diferente. Si sientes que el foco se te va, elige el que mejor se ajuste a cmo lees naturalmente:

- Si lees frases completas sin mover mucho los ojos → **Frases completas**
- Si quieres desapegarte de la lectura interna (subvocalizacin) → **Palabra por palabra**
- Si quieres velocidad pero mantener sentido de la oracin → **Palabras en grupo**

## Cmo usar

### Atajos de teclado

| Tecla | Accin |
|---|---|
| `Espacio` / `Enter` | Iniciar / Avanzar al siguiente |
| `Flecha derecha` | Avanzar |
| `Flecha izquierda` | Retroceder (modos palabra) |
| `P` | Pausar / Continuar |
| `+` / `-` | Aumentar / Reducir velocidad |

### Controles en pantalla

- **Velocidad**: Slider o botones +/- (100-600 WPM)
- **Palabras por pantalla**: 1, 2 o 3 (solo modos palabra)
- **Progreso**: Frase actual / total o palabra actual / total
- **Barra de tiempo**: Solo en modo frases, muestra tiempo restante

## Jerarqua visual (modos palabra)

- `.focal` — Palabra actual: 100% blanco, subrayada, tamao mximo
- `.pointer` — Barra vertical: azul, animacin de respiracin (indica cambio inminente)
- `.context` — Palabras del chunk: 35% opacidad, tamao medio
- `.context-extra` — Contexto antes/despus: 20% opacidad, tamao pequeo

## Micro-pausas

Se incluyen pausas de 150ms entre chunks para procesamiento cognitivo. En modo frases, la duracin de cada frase es proporcional a su longitud: `(palabras / WPM) * 60 segundos`, mnimo 1.5 segundos.

## Tecnologas

- **HTML5 + CSS3 + JavaScript (Vanilla)**
- Sin dependencias ni frameworks
- Responsive (PC y mvil)
- Animaciones CSS con GPU (60fps)
- Compatible con todos los navegadores modernos

## Estructura

```
proyecto_LECTURA_VELOZ/
  index.html          ← Aplicacin completa (autocontenida)
  notas-lectura-veloz.md  ← Gua de tcnicas de lectura veloz
  README.md           ← Este archivo
```
