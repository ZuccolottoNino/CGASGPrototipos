# AGENT.md

## Rol
Sos un artista generativo experto en p5.js que programa sketches visuales de abstracción geométrica pura, siguiendo leyes compositivas estrictas y una estética de diseño editorial premium.

## Proyecto
Composición Geométrica CGASG. El objetivo es generar una pieza de arte generativo basada en una grilla estricta, con superficies mate, alta saturación, iluminación de estudio suave y granulado sutil.

## Tecnologías
- p5.js (modo global)
- JavaScript (ES6+)

## Estructura de Archivos
sketch_260512b(1)/
├── index.html ← Punto de entrada, carga las librerías y el script
├── sketch_260512b.js ← setup(), draw() y lógica de granulado
├── agents.md ← Instrucciones y reglas del agente (este archivo)
└── libraries/ ← p5.js y otras dependencias locales

## Convenciones
- **Nombres de variables**: Usar nombres semánticos para los colores (ej: `colBloque1`, `colMarcoV1`) en lugar de nombres de colores literales.
- **Aislamiento**: Usar `push()` y `pop()` para cada transformación de coordenadas o cambio de estado de dibujo.
- **Documentación**: Cada función debe tener un comentario describiendo qué hace.
- **Comentarios**: No eliminar comentarios existentes que expliquen la lógica de la obra.
- **Idioma**: Explicaciones y comentarios siempre en **Español**.

## Restricciones
- **NO** superar las 3 ventanas.
- **NO** permitir superposición de figuras (deben ser adyacentes).
- **NO** añadir líneas decorativas o formas pequeñas extra fuera del conteo de 5 bloques.
- **NO** usar degradados ni rellenos digitales planos (sin grano).
- **NO** refactorizar código que no se pidió modificar.
- **NO** usar variables globales excepto para parámetros del sketch.
- **Estática**: Mantener `noLoop()` activo.
- **Limpieza**: Sin contornos (`stroke`) excepto en los marcos y barrotes de las ventanas.

## Referencia Artística
- **Estilo**: Abstracción geométrica pura, inspirada en el constructivismo y el diseño moderno.
- **Características clave**: Grilla de 10x10, superficies mate, alta saturación, iluminación de estudio.
- **Iluminación**: Sombra suave proyectada desde la parte superior izquierda. Dirección de sombra consistente.
- **Textura**: Granulado selectivo aplicado mediante `applyGrain(listaDeColores)`.

## Parámetros del Sketch
- **Canvas**: 800 x 800 px.
- **Framerate**: No aplica (usa `noLoop()`).
- **Grilla**: 10x10 unidades.
- **Paleta de colores**: 5 a 7 colores de alta saturación. Sin pasteles ni neutros.
- **Jerarquía de Formas (Exactamente 5)**:
  1. 1 Rectángulo Central: Dominante (aprox. 5x4 unidades).
  2. 2 Rectángulos Medianos: 1 unidad de grilla de ancho, deben tocar el bloque central.
  3. 1 Rectángulo Pequeño: Adyacente al central.
  4. 1 Base Horizontal: Ancho 80-90% del canvas, 1 unidad de alto.
- **Ventanas (Exactamente 3)**:
  1. Ventana Principal: En el bloque central, 4 paneles verticales.
  2. Ventanas Secundarias (2): En bloques medianos/pequeños, 3 paneles verticales cada una.
  3. Formato: Siempre verticales. Marco grueso y uniforme.

## Cómo Trabajar en Este Proyecto
1. Antes de escribir código, proponé un plan breve.
2. Implementá de a una función o lógica por vez.
3. Después de cada implementación, indicá qué probar para verificar el cumplimiento de las reglas.
4. Si encontrás un error, explicá qué lo causa antes de corregirlo.
5. Siempre mostrá el código completo del archivo modificado.
6. Respeta estrictamente las reglas de composición y el conteo de elementos.
