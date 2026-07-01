let paletaActual;
let paletaInicial;
let indicePaletaActual = -1;
let todosLosColores = [];

let paletas = [
    {
        colBloque1: '#15b0e1',
        colBloque2: '#e6b111',
        colBloque3: '#d3299d',
        colBloque4: '#1d0788',
        colBloque5: '#e30404',
        colBloque6: '#d45d2a',
        colBloque7: '#32965d',
        colInteriorV1: '#8891ab',
        colInteriorV2: '#dcd4ec',
        colInteriorV3: '#da82ba',
        colMarcoV1: '#b02663',
        colMarcoV2: '#0f7f7a',
        colMarcoV3: '#7922a6'
    },
    {
        colBloque1: '#d8be0c',
        colBloque2: '#4b7eb2',
        colBloque3: '#d90d4f',
        colBloque4: '#ad37a6',
        colBloque5: '#544648',
        colBloque6: '#c45827',
        colBloque7: '#87b7c8',
        colInteriorV1: '#8883b1',
        colInteriorV2: '#efbaca',
        colInteriorV3: '#cce897',
        colMarcoV1: '#67be9c',
        colMarcoV2: '#e9eaae',
        colMarcoV3: '#c2c8c6'
    },
    {
        colBloque1: '#d2cad8',
        colBloque2: '#e70640',
        colBloque3: '#b777d1',
        colBloque4: '#f6ac07',
        colBloque5: '#8ad60c',
        colBloque6: '#c787dc',
        colBloque7: '#81c2c2',
        colInteriorV1: '#d1ce70',
        colInteriorV2: '#eb159d',
        colInteriorV3: '#eae806',
        colMarcoV1: '#9ad0d1',
        colMarcoV2: '#ceb14e',
        colMarcoV3: '#831835'
    },
    {
        colBloque1: '#075572',
        colBloque2: '#ce0a2e',
        colBloque3: '#8e7895',
        colBloque4: '#d2d1ce',
        colBloque5: '#82c107',
        colBloque6: '#8aa6cb',
        colBloque7: '#ada5a1',
        colInteriorV1: '#4bcc0d',
        colInteriorV2: '#a19789',
        colInteriorV3: '#bcb4a2',
        colMarcoV1: '#634063',
        colMarcoV2: '#c93b5a',
        colMarcoV3: '#a3bac3'
    },
    {
        colBloque1: '#d5365d',
        colBloque2: '#dbf60f',
        colBloque3: '#6185c6',
        colBloque4: '#8297cd',
        colBloque5: '#b5961b',
        colBloque6: '#1b3387',
        colBloque7: '#b4bccc',
        colInteriorV1: '#6ca4d5',
        colInteriorV2: '#c984b2',
        colInteriorV3: '#b0c19a',
        colMarcoV1: '#d2d4db',
        colMarcoV2: '#684684',
        colMarcoV3: '#d0cdca'
    }
];

// Colores de la obra (semánticos)
let colFondo = '#f0f0f0';

// Parámetro de interacción para las ventanas
let variacionVentana = 0;
const LIMITE_EXPANSION = 30;
const LIMITE_CONTRACCION = -40;

// Búferes para el grano estático de los bloques
let grainBloque1;
let grainBloque2;
let grainBloque3;
let grainBloque4;

// -------------CONFIGURACION INICIAL DE SONIDO-----------------
let AMP_MIN = 0.001;
let AMP_MAX = 0.13;
let NOTA_MIN = 48;
let NOTA_MAX = 60;

let calibrandoAmp = true;
let monitor = false; // Por defecto apagado para visualizar la obra

let umbralRuido = 0.1;
let umbralDuracionSonido = 1000;

// -------------SONIDO GENERAL-----------------
let mic;
let audioIniciado = false;

// -------------AMPLITUD-----------------
let pisoAmp = Infinity;
let techoAmp = -Infinity;
let amp = 0;
let intensidad = 0;

// ----------ANALISIS FRECUENCIA------
let frec = 0; // Frecuencia cruda detectada
let pitch; // Objeto del modelo pitch-detection
const model_url = "https://cdn.jsdelivr.net/gh/ml5js/ml5-data-and-models/models/pitch-detection/crepe/";

let notaMidi = 0;
let altura = 0;
let difAltura = 0;
let hayPitch = false;

// --------GESTORES-------
let gestorAmp;
let gestorFrec;

// -------ESTADOS Y EVENTOS DE SONIDO-----
let haySonido = false;
let antesHabiaSonido = false;
let empezoElSonido = false;
let terminoElSonido = false;

// -------TEMPORIZADORES----
let marcaInicioSonido = 0;
let marcaFinSonido = 0;
let durSonido = 0;
let durSilencio = 0;
let sonidoLargo = false;
let marcaUltimoPitch = 0;
let timeoutSinPitch = 300;

// -------DETECCION DE PICOS DE FRECUENCIA-----
let umbralVariacionFrec = 2.0; // Mínima variación en notas MIDI para filtrar el ruido ambiente
let ultimoExtremoFrec = 0;     // Nota MIDI del último pico o valle
let direccionFrec = 0;         // Dirección del cambio: 1 = subiendo, -1 = bajando, 0 = indefinido
let ultimoCambioPaleta = 0;    // Registro de tiempo (millis) del último cambio de paleta

// -------ANALISIS DE SISEO (SHHHHH) Y VIBRACION-----
let fft;
let energyTreble = 0;
let energyBass = 0;
let energyMid = 0;
let esShhhh = false;
let umbralShhhh = 50;          // Umbral de energía de agudos mínimos para el siseo
let ampVibracion = 0;          // Amplitud actual de la vibración de los barrotes

// -------------INTERFAZ DE CONTROL DE SONIDO-----------------
let slidersControlSonido = [];
let botonesControlSonido = [];
let sliderActivoControlSonido = null;
let retornoVoz = false;


/**
 * Inicialización de p5.js. Configura el canvas, paletas, grano y el micrófono.
 */
function setup() {
    //document.oncontextmenu = () => false;
    createCanvas(800, 800);
    noStroke();

    // Recopilar todos los colores únicos de las 5 paletas
    let setColores = new Set();
    for (let paleta of paletas) {
        for (let color of Object.values(paleta)) {
            setColores.add(color.toLowerCase());
        }
    }
    todosLosColores = Array.from(setColores);

    elegirPaletaAlAzar();
    paletaInicial = { ...paletaActual }; // Guardar copia de la paleta inicial original

    // Generar texturas de grano estáticas una sola vez al arrancar
    grainBloque1 = generateGrain(260, 260);
    grainBloque2 = generateGrain(355, 320);
    grainBloque3 = generateGrain(345, 415);
    grainBloque4 = generateGrain(255, 250);

    // Inicialización del micrófono y gestores de señal de audio
    mic = new p5.AudioIn();
    gestorAmp = new GestorSenial(AMP_MIN, AMP_MAX);
    gestorFrec = new GestorSenial(NOTA_MIN, NOTA_MAX);

    // Analizador de espectro para detección de siseo
    fft = new p5.FFT();

    // Inicializar sliders y botones de la interfaz de control de sonido
    inicializarInterfazControlSonido();
    inicializarBotonesControlSonido();
}

/**
 * Selecciona una paleta aleatoria asegurándose de no repetir la actual.
 */
function elegirPaletaAlAzar() {
    let indicesDisponibles = [];
    for (let i = 0; i < paletas.length; i++) {
        if (i !== indicePaletaActual) {
            indicesDisponibles.push(i);
        }
    }
    indicePaletaActual = random(indicesDisponibles);
    paletaActual = { ...paletas[indicePaletaActual] };

    // Validación: verificamos que todos los colores sean únicos para asegurar que no haya adyacentes iguales
    let colores = Object.values(paletaActual);
    let coloresUnicos = new Set(colores);
    if (coloresUnicos.size !== colores.length) {
        console.warn("Advertencia: La paleta seleccionada contiene colores duplicados.");
    } else {
        console.log("Paleta elegida con éxito. Todos los elementos tienen colores únicos garantizados.");
    }
}

/**
 * Función principal de dibujo. Controla el procesamiento de micrófono,
 * la pantalla de calibración (monitoreo), la obra artística y el overlay de inicio.
 */
function draw() {
    // Si el monitor de calibración está activo, se muestra y se cancela el render de la obra
    if (monitor) {
        dibujarInterfazControlSonido();
        if (audioIniciado) {
            antesHabiaSonido = haySonido;
        }
        return;
    }

    // Si el audio está iniciado, se procesa el stream del micrófono
    if (audioIniciado) {
        amp = mic.getLevel();

        if (calibrandoAmp) {
            // Captura los valores máximos y mínimos de volumen
            pisoAmp = min(pisoAmp, amp);
            techoAmp = max(techoAmp, amp);
        }

        gestorAmp.actualizar(amp);

        // Análisis FFT para detección del sonido siseante "shhhhh"
        fft.analyze();
        energyTreble = fft.getEnergy(4000, 15000);
        energyBass = fft.getEnergy(20, 500);
        energyMid = fft.getEnergy(500, 2000);

        // Lógica de detección de siseo (el agudo domina el espectro y supera el umbral)
        esShhhh = (energyTreble > umbralShhhh) && (energyTreble > energyBass * 1.5) && (energyTreble > energyMid * 1.2);

        let objetivoVibracion = 0;
        if (esShhhh) {
            // Mapeo dinámico del nivel de siseo a la fuerza de vibración
            objetivoVibracion = map(energyTreble, umbralShhhh, 255, 1.5, 5.5, true);
        }
        ampVibracion = lerp(ampVibracion, objetivoVibracion, 0.25);

        // Derivar variables de intensidad (volumen) y altura (frecuencia)
        intensidad = gestorAmp.filtrada;
        altura = gestorFrec.filtrada;
        difAltura = hayPitch ? gestorFrec.derivada * 10 : 0;

        // Mapea la intensidad del sonido al rango permitido de variación de ventanas
        variacionVentana = map(intensidad, 0.0, 1.0, LIMITE_CONTRACCION, LIMITE_EXPANSION);

        // Clasificación de sonido mediante umbrales
        haySonido = intensidad > umbralRuido;
        empezoElSonido = haySonido && !antesHabiaSonido;
        terminoElSonido = !haySonido && antesHabiaSonido;

        // Gestión de temporizadores para duración de sonido y silencio
        if (empezoElSonido) {
            marcaInicioSonido = millis();
            durSilencio = millis() - marcaFinSonido;
            sonidoLargo = false;
        }

        if (haySonido) {
            durSonido = millis() - marcaInicioSonido;
            sonidoLargo = durSonido >= umbralDuracionSonido;
        }

        if (terminoElSonido) {
            durSonido = millis() - marcaInicioSonido;
            marcaFinSonido = millis();
            sonidoLargo = false;
        }

        if (!haySonido) {
            durSilencio = millis() - marcaFinSonido;
        }

        // Algoritmo de detección de picos en la variación de graves y agudos (con histéresis)
        if (haySonido && hayPitch) {
            let notaActual = map(gestorFrec.filtrada, 0.0, 1.0, gestorFrec.minimo, gestorFrec.maximo);

            if (direccionFrec === 0) {
                ultimoExtremoFrec = notaActual;
                direccionFrec = 1; // Asumimos dirección de subida al iniciar
            } else if (direccionFrec === 1) {
                // Buscando un pico máximo (agudo)
                if (notaActual > ultimoExtremoFrec) {
                    ultimoExtremoFrec = notaActual;
                } else if (notaActual < ultimoExtremoFrec - umbralVariacionFrec) {
                    // Se superó el umbral hacia abajo -> pico detectado
                    mezclarPaletaAleatoriamente();
                    direccionFrec = -1;
                    ultimoExtremoFrec = notaActual;
                }
            } else if (direccionFrec === -1) {
                // Buscando un valle mínimo (grave)
                if (notaActual < ultimoExtremoFrec) {
                    ultimoExtremoFrec = notaActual;
                } else if (notaActual > ultimoExtremoFrec + umbralVariacionFrec) {
                    // Se superó el umbral hacia arriba -> valle detectado
                    mezclarPaletaAleatoriamente();
                    direccionFrec = 1;
                    ultimoExtremoFrec = notaActual;
                }
            }
        } else {
            // Fuera de sonido o sin tono limpio, reseteamos la dirección para reiniciar
            direccionFrec = 0;
        }

    }

    // Renderizado de la obra de arte geométrica original
    background(colFondo);

    // Escala y traslación para centrar la figura
    push();
    translate(width * 0.15, height * 0.05);
    scale(0.85);

    // 1. Rectángulos de fondo (Verde y Rosa)
    fill(paletaActual.colBloque6);
    rect(60, 420, 450, 310); // Base verde

    fill(paletaActual.colBloque5);
    rect(450, 275, 300, 330); // Bloque rosa a la derecha

    // 2. Bloque Amarillo (Arriba Izquierda)
    fill(paletaActual.colBloque1);
    rect(45, 50, 260, 260);
    image(grainBloque1, 45, 50);

    // Ventana Celeste (Parametrizada)
    let v1X = 100 - variacionVentana;
    let v1Y = 95 - variacionVentana;
    let v1W = 150 + 2 * variacionVentana;
    let v1H = 165 + 2 * variacionVentana;

    fill(paletaActual.colMarcoV1);
    rect(v1X, v1Y, v1W, v1H);

    fill(paletaActual.colInteriorV1);
    // Mantiene el marco de 8px
    rect(v1X + 8, v1Y + 8, v1W - 16, v1H - 16);

    // Barrotes ventana 1 (Distribución proporcional con vibración siseante)
    stroke(paletaActual.colMarcoV1);
    strokeWeight(4);
    let v1Desp1 = random(-ampVibracion, ampVibracion);
    let v1Desp2 = random(-ampVibracion, ampVibracion);
    line(v1X + v1W * 0.346 + v1Desp1, v1Y + 8, v1X + v1W * 0.346 + v1Desp1, v1Y + v1H - 8);
    line(v1X + v1W * 0.64 + v1Desp2, v1Y + 8, v1X + v1W * 0.64 + v1Desp2, v1Y + v1H - 8);
    noStroke();

    // 3. Bloque Rojo (Arriba Derecha)
    fill(paletaActual.colBloque2);
    rect(305, 0, 355, 320);
    image(grainBloque2, 305, 0);

    // 4. Bloque Morado (Centro abajo)
    fill(paletaActual.colBloque3);
    rect(115, 310, 345, 415);
    image(grainBloque3, 115, 310);

    // Ventana Naranja (Parametrizada)
    let v2X = 170 - variacionVentana;
    let v2Y = 365 - variacionVentana;
    let v2W = 230 + 2 * variacionVentana;
    let v2H = 310 + 2 * variacionVentana;

    fill(paletaActual.colMarcoV2);
    rect(v2X, v2Y, v2W, v2H);

    fill(paletaActual.colInteriorV2);
    // Mantiene el marco de 10px
    rect(v2X + 10, v2Y + 10, v2W - 20, v2H - 20);

    // Barrotes ventana 2 (Distribución proporcional con vibración siseante)
    stroke(paletaActual.colMarcoV2);
    strokeWeight(6);
    let v2Desp1 = random(-ampVibracion, ampVibracion);
    let v2Desp2 = random(-ampVibracion, ampVibracion);
    let v2Desp3 = random(-ampVibracion, ampVibracion);
    line(v2X + v2W * 0.269 + v2Desp1, v2Y + 10, v2X + v2W * 0.269 + v2Desp1, v2Y + v2H - 10);
    line(v2X + v2W * 0.5 + v2Desp2, v2Y + 10, v2X + v2W * 0.5 + v2Desp2, v2Y + v2H - 10);
    line(v2X + v2W * 0.73 + v2Desp3, v2Y + 10, v2X + v2W * 0.73 + v2Desp3, v2Y + v2H - 10);
    noStroke();

    // 5. Bloque Azul (Centro Derecha)
    fill(paletaActual.colBloque4);
    rect(460, 310, 255, 250);
    image(grainBloque4, 460, 310);

    // Ventana Rosa Fuerte (Parametrizada)
    let v3X = 510 - variacionVentana;
    let v3Y = 360 - variacionVentana;
    let v3W = 150 + 2 * variacionVentana;
    let v3H = 150 + 2 * variacionVentana;

    fill(paletaActual.colMarcoV3);
    rect(v3X, v3Y, v3W, v3H);

    fill(paletaActual.colInteriorV3);
    // Mantiene el marco de 8px
    rect(v3X + 8, v3Y + 8, v3W - 16, v3H - 16);

    // Barrotes ventana 3 (Distribución proporcional con vibración siseante)
    stroke(paletaActual.colMarcoV3);
    strokeWeight(5);
    let v3Desp1 = random(-ampVibracion, ampVibracion);
    let v3Desp2 = random(-ampVibracion, ampVibracion);
    line(v3X + v3W * 0.346 + v3Desp1, v3Y + 8, v3X + v3W * 0.346 + v3Desp1, v3Y + v3H - 8);
    line(v3X + v3W * 0.64 + v3Desp2, v3Y + 8, v3X + v3W * 0.64 + v3Desp2, v3Y + v3H - 8);
    noStroke();

    // 6. Barra inferior (Cielo)
    fill(paletaActual.colBloque7);
    rect(0, 725, 575, 75);

    pop();

    // Si el audio no ha sido activado, dibujamos la interfaz de inicio elegante
    if (!audioIniciado) {
        dibujarOverlayInicio();
    }

    if (audioIniciado) {
        antesHabiaSonido = haySonido; // Guardamos el estado acústico anterior
    }
}

/**
 * Dibuja un cartel de activación inicial sutil y refinado con estilo editorial
 * para invitar al usuario a activar la captura del micrófono por clicks.
 */
function dibujarOverlayInicio() {
    push();
    // Fondo translúcido sutil que atenúa la obra
    fill(20, 20, 20, 150);
    rect(0, 0, width, height);

    // Caja de diálogo mate premium
    rectMode(CENTER);
    noStroke();

    // Sombra sutil proyectada hacia el sentido de la luz de la obra (superior-izquierda -> inferior-derecha)
    fill(0, 25);
    rect(width / 2 + 5, height / 2 + 5, 680, 220, 8);

    // Contenedor principal con color crema mate
    fill(245, 245, 243);
    rect(width / 2, height / 2, 680, 220, 8);

    // Recuadro interior fino con estética de diseño editorial
    stroke(30, 25);
    strokeWeight(1);
    noFill();
    rect(width / 2, height / 2, 660, 200, 6);

    // Configuración de textos
    noStroke();
    textAlign(CENTER, CENTER);
    textFont("'Helvetica Neue', Helvetica, Arial, sans-serif");

    // Título de la obra
    fill(20, 20, 20);
    textSize(15);
    textStyle(BOLD);
    text("COMPOSICIÓN GEOMÉTRICA CGASG", width / 2, height / 2 - 50);

    // Instrucción de activación
    fill(80, 80, 80);
    textSize(13);
    textStyle(NORMAL);
    text("Haga clic en la pantalla para activar el sonido", width / 2, height / 2 - 10);

    // Control de sonido, reset e interacciones
    fill(110, 110, 110);
    textSize(11);
    text("Control de sonido: [M] Monitoreo  |  Reset: [Espacio] Reiniciar obra", width / 2, height / 2 + 30);
    text("Interacciones: Graves/Agudos cambian paleta  |  Volumen deforma ventanas  |  Siseo (Shhhhh) vibra barrotes", width / 2, height / 2 + 55);

    pop();
}

/**
 * Gestiona el evento de clic de ratón. Inicializa el audio en la primera
 * interacción y preserva la interacción original en clics subsecuentes.
 */
function mousePressed() {
    // Si la interfaz de control de sonido está activa
    if (monitor) {
        // 1. Detectar si el clic es sobre algún botón del panel
        for (let boton of botonesControlSonido) {
            if (mouseX >= boton.x && mouseX <= boton.x + boton.w &&
                mouseY >= boton.y && mouseY <= boton.y + boton.h) {
                
                // Si es el botón de volver a la obra, no iniciamos el audio
                if (boton.etiqueta === "← VOLVER A LA OBRA") {
                    boton.accion();
                    return;
                }
                
                // Si es otro botón de acción, sí iniciamos el audio si no estaba activo
                if (!audioIniciado) {
                    iniciarAudio();
                }
                boton.accion();
                return;
            }
        }

        // 2. Detectar si el clic es sobre algún slider del panel
        for (let slider of slidersControlSonido) {
            if (mouseX >= slider.x && mouseX <= slider.x + slider.w &&
                mouseY >= slider.y - 5 && mouseY <= slider.y + slider.h + 5) {
                
                // Si el audio no está iniciado, lo iniciamos ya que va a cambiar un parámetro acústico
                if (!audioIniciado) {
                    iniciarAudio();
                }
                sliderActivoControlSonido = slider;
                actualizarValorSliderControlSonido();
                return;
            }
        }
        
        // Si el clic ocurre en zonas vacías del panel, lo ignoramos para no forzar audio
        return;
    }

    // Si estamos en la obra normal (overlay crema inicial)
    if (!audioIniciado) {
        iniciarAudio();
        return;
    }

    // Clic normal en la obra cuando ya está iniciado el audio
    detectarInputMouse();
}

/**
 * Evento nativo de arrastre del ratón de p5.js.
 */
function mouseDragged() {
    if (monitor) {
        mouseDraggedControlSonido();
    }
}

/**
 * Evento nativo de liberación del ratón de p5.js.
 */
function mouseReleased() {
    if (monitor) {
        mouseReleasedControlSonido();
    }
}

/**
 * Reporta la información de depuración original de clics sobre el lienzo.
 */
function detectarInputMouse() {
    let tipoFrecuencia;
    let tipoAmplitud;

    if (mouseY < height / 2) {
        tipoFrecuencia = "alta (sonido agudo)";
    } else {
        tipoFrecuencia = "baja (sonido grave)";
    }

    if (mouseButton === LEFT) {
        tipoAmplitud = "izquierdo (alta amplitud)";
    } else if (mouseButton === RIGHT) {
        tipoAmplitud = "derecho (baja amplitud)";
    } else {
        tipoAmplitud = "desconocida";
    }

    console.log(
        "Se presionó click " +
        tipoAmplitud +
        " en la zona " +
        tipoFrecuencia +
        " del canvas. (La paleta de colores de la obra es fija y se mantiene)."
    );
}

/**
 * Gestiona los eventos de teclado para calibración de audio, monitoreo
 * y controles geométricos/paletas existentes de la obra.
 */
function keyPressed() {
    // Controles de calibración y análisis de sonido
    if (key === 'c' || key === 'C') {
        calibrandoAmp = !calibrandoAmp;
        console.log("Calibración Amp =", calibrandoAmp ? "ACTIVA" : "INACTIVA");
        console.log("AMP_MIN =", pisoAmp);
        console.log("AMP_MAX =", techoAmp);
    } else if (key === 'a' || key === 'A') {
        if (isFinite(pisoAmp) && isFinite(techoAmp) && techoAmp > pisoAmp) {
            gestorAmp.minimo = pisoAmp;
            gestorAmp.maximo = techoAmp;
            console.log("Rango aplicado a gestorAmp:", gestorAmp.minimo, gestorAmp.maximo);
        } else {
            console.warn("No hay calibración válida todavía para aplicar.");
        }
    } else if (key === 'm' || key === 'M') {
        monitor = !monitor;
        if (!monitor && retornoVoz) {
            retornoVoz = false;
            mic.disconnect();
            console.log("Retorno de voz desactivado automáticamente por tecla M al volver a la obra.");
        }
    }

    // Ajuste de umbral de variación de frecuencia
    else if (key === '1') {
        umbralVariacionFrec = max(0.5, umbralVariacionFrec - 0.2);
        console.log("Umbral Variación Frecuencia decrementado a:", umbralVariacionFrec.toFixed(2));
    } else if (key === '2') {
        umbralVariacionFrec = min(5.0, umbralVariacionFrec + 0.2);
        console.log("Umbral Variación Frecuencia incrementado a:", umbralVariacionFrec.toFixed(2));
    }

    // Controles geométricos y paletas originales
    if (key === '3' || key === '4') {
        // La mezcla manual por teclas se deshabilita para priorizar la interacción por sonido
        // mezclarPaletaAleatoriamente();
    } else if (key === ' ') {
        // Volver al tamaño original y restaurar la paleta inicial original
        variacionVentana = 0;
        paletaActual = { ...paletaInicial };
        redraw();
    }
}

/**
 * Asigna a cada elemento de paletaActual un color aleatorio del conjunto de todos los colores
 * y resuelve los posibles conflictos de elementos adyacentes para evitar repeticiones.
 */
function mezclarPaletaAleatoriamente() {
    // Evita cambios de paleta demasiado seguidos (cooldown de 2 segundos)
    if (millis() - ultimoCambioPaleta < 500) {
        return;
    }
    ultimoCambioPaleta = millis();

    let claves = Object.keys(paletaActual);
    for (let clave of claves) {
        paletaActual[clave] = random(todosLosColores);
    }
    resolverConflictosAdyacentes();
    redraw();
}

/**
 * Condicional de resolución de conflictos de adyacencia de color.
 * Si dos elementos geométricamente adyacentes tienen el mismo color, se cambia a otro.
 */
function resolverConflictosAdyacentes() {
    // Definimos las adyacencias geométricas (elementos que se tocan o contienen)
    let adyacencias = [
        ['colBloque1', 'colBloque2'],
        ['colBloque1', 'colBloque3'],
        ['colBloque1', 'colMarcoV1'],
        ['colBloque2', 'colBloque3'],
        ['colBloque2', 'colBloque4'],
        ['colBloque2', 'colBloque5'],
        ['colBloque3', 'colBloque4'],
        ['colBloque3', 'colBloque6'],
        ['colBloque3', 'colBloque7'],
        ['colBloque3', 'colMarcoV2'],
        ['colBloque4', 'colBloque5'],
        ['colBloque4', 'colMarcoV3'],
        ['colBloque5', 'colBloque6'],
        ['colBloque6', 'colBloque7'],
        ['colMarcoV1', 'colInteriorV1'],
        ['colMarcoV2', 'colInteriorV2'],
        ['colMarcoV3', 'colInteriorV3']
    ];

    let maxIntentos = 1000;
    let intento = 0;
    let huboConflicto = true;

    while (huboConflicto && intento < maxIntentos) {
        huboConflicto = false;
        intento++;

        for (let par of adyacencias) {
            let elem1 = par[0];
            let elem2 = par[1];

            // Si los colores coinciden exactamente
            if (paletaActual[elem1] === paletaActual[elem2]) {
                huboConflicto = true;
                // Reasignamos el color del segundo elemento por otro color aleatorio
                let nuevoColor;
                do {
                    nuevoColor = random(todosLosColores);
                } while (nuevoColor === paletaActual[elem1]);

                paletaActual[elem2] = nuevoColor;
            }
        }
    }

    if (intento >= maxIntentos) {
        console.warn("Se alcanzó el límite de intentos al resolver adyacencias de color.");
    } else {
        console.log("Adyacencias de color resueltas en " + intento + " iteraciones.");
    }
}

/**
 * Genera texturas de grano estáticas en formato p5.Graphics para simular superficies mate.
 */
function generateGrain(w, h) {
    let pg = createGraphics(w, h);
    pg.pixelDensity(1); // Mapeo 1 a 1 de píxeles
    pg.background(0, 0); // Fondo transparente
    pg.loadPixels();
    let numPixels = pg.pixels.length;
    for (let i = 0; i < numPixels; i += 4) {
        let val = random(-10, 10);
        if (val >= 0) {
            pg.pixels[i] = 255;
            pg.pixels[i + 1] = 255;
            pg.pixels[i + 2] = 255;
            pg.pixels[i + 3] = val * 2.5; // Brillo sutil
        } else {
            pg.pixels[i] = 0;
            pg.pixels[i + 1] = 0;
            pg.pixels[i + 2] = 0;
            pg.pixels[i + 3] = -val * 2.5; // Oscuridad sutil
        }
    }
    pg.updatePixels();
    return pg;
}

/**
 * Inicializa y configura los sliders interactivos del panel de control de sonido.
 * Define los límites, etiquetas y funciones callback para leer/escribir cada variable.
 */
function inicializarInterfazControlSonido() {
    slidersControlSonido = [
        {
            etiqueta: "Amplitud Mínima (Sensibilidad)",
            minVal: 0.0001,
            maxVal: 0.02,
            get: () => AMP_MIN,
            set: (v) => { AMP_MIN = v; gestorAmp.minimo = v; },
            formato: (v) => v.toFixed(5),
            esEntero: false
        },
        {
            etiqueta: "Amplitud Máxima (Límite Alto)",
            minVal: 0.01,
            maxVal: 0.5,
            get: () => AMP_MAX,
            set: (v) => { AMP_MAX = v; gestorAmp.maximo = v; },
            formato: (v) => v.toFixed(4),
            esEntero: false
        },
        {
            etiqueta: "Umbral de Ruido (Puerta de Ruido)",
            minVal: 0.01,
            maxVal: 0.5,
            get: () => umbralRuido,
            set: (v) => { umbralRuido = v; },
            formato: (v) => v.toFixed(3),
            esEntero: false
        },
        {
            etiqueta: "Nota MIDI Mínima",
            minVal: 24,
            maxVal: 72,
            get: () => NOTA_MIN,
            set: (v) => { NOTA_MIN = Math.round(v); gestorFrec.minimo = Math.round(v); },
            formato: (v) => Math.round(v).toString() + " (" + Math.round(midiToFreq(v)) + " Hz)",
            esEntero: true
        },
        {
            etiqueta: "Nota MIDI Máxima",
            minVal: 48,
            maxVal: 96,
            get: () => NOTA_MAX,
            set: (v) => { NOTA_MAX = Math.round(v); gestorFrec.maximo = Math.round(v); },
            formato: (v) => Math.round(v).toString() + " (" + Math.round(midiToFreq(v)) + " Hz)",
            esEntero: true
        },
        {
            etiqueta: "Umbral Siseo (Shhhhh)",
            minVal: 10,
            maxVal: 200,
            get: () => umbralShhhh,
            set: (v) => { umbralShhhh = v; },
            formato: (v) => Math.round(v).toString(),
            esEntero: true
        },
        {
            etiqueta: "Variación Tono (Picos MIDI)",
            minVal: 0.5,
            maxVal: 5.0,
            get: () => umbralVariacionFrec,
            set: (v) => { umbralVariacionFrec = v; },
            formato: (v) => v.toFixed(2),
            esEntero: false
        },
        {
            etiqueta: "Suavizado Señal (Paso Bajo)",
            minVal: 0.1,
            maxVal: 0.98,
            get: () => gestorAmp.f,
            set: (v) => { gestorAmp.f = v; gestorFrec.f = v; },
            formato: (v) => v.toFixed(2),
            esEntero: false
        }
    ];

    // Barajar claves de color de la paleta para asignar colores estables pero aleatorios a cada barra
    let clavesColores = ["colBloque1", "colBloque2", "colBloque3", "colBloque4", "colBloque5", "colBloque6", "colBloque7"];
    let clavesBarajadas = [];
    let copiaClaves = [...clavesColores];
    while (copiaClaves.length > 0) {
        let idx = Math.floor(Math.random() * copiaClaves.length);
        clavesBarajadas.push(copiaClaves.splice(idx, 1)[0]);
    }

    // Configurar posiciones geométricas (X, Y, Ancho, Alto) y asignar claveColor a cada slider de la interfaz
    let xBase = 50;
    let yBase = 140;
    let wSlider = 300;
    let hSlider = 10;
    let espaciado = 60;

    for (let i = 0; i < slidersControlSonido.length; i++) {
        slidersControlSonido[i].x = xBase;
        slidersControlSonido[i].y = yBase + i * espaciado;
        slidersControlSonido[i].w = wSlider;
        slidersControlSonido[i].h = hSlider;
        slidersControlSonido[i].claveColor = clavesBarajadas[i % clavesBarajadas.length];
    }
}

/**
 * Inicializa y configura los botones interactivos del panel de control de sonido.
 * Define la posición y la acción a ejecutar al hacer clic sobre ellos.
 */
function inicializarBotonesControlSonido() {
    botonesControlSonido = [
        {
            etiqueta: "CALIBRAR VOLUMEN",
            accion: () => {
                calibrandoAmp = !calibrandoAmp;
                if (calibrandoAmp) {
                    pisoAmp = Infinity;
                    techoAmp = -Infinity;
                }
                console.log("Calibración Amp =", calibrandoAmp ? "ACTIVA" : "INACTIVA");
            },
            getActivo: () => calibrandoAmp,
            x: 50,
            y: 630,
            w: 160,
            h: 35
        },
        {
            etiqueta: "APLICAR RANGO",
            accion: () => {
                if (isFinite(pisoAmp) && isFinite(techoAmp) && techoAmp > pisoAmp) {
                    AMP_MIN = pisoAmp;
                    AMP_MAX = techoAmp;
                    gestorAmp.minimo = AMP_MIN;
                    gestorAmp.maximo = AMP_MAX;
                    console.log("Calibración aplicada: min=" + AMP_MIN + ", max=" + AMP_MAX);
                }
            },
            getActivo: () => false,
            x: 230,
            y: 630,
            w: 160,
            h: 35
        },
        {
            etiqueta: "RESTAURAR VALORES POR DEFECTO",
            accion: () => {
                AMP_MIN = 0.001;
                AMP_MAX = 0.13;
                NOTA_MIN = 48;
                NOTA_MAX = 60;
                umbralRuido = 0.1;
                umbralShhhh = 50;
                umbralVariacionFrec = 2.0;
                gestorAmp.minimo = AMP_MIN;
                gestorAmp.maximo = AMP_MAX;
                gestorFrec.minimo = NOTA_MIN;
                gestorFrec.maximo = NOTA_MAX;
                gestorAmp.f = 0.80;
                gestorFrec.f = 0.80;
                pisoAmp = Infinity;
                techoAmp = -Infinity;
                console.log("Valores restaurados por defecto.");
            },
            getActivo: () => false,
            x: 50,
            y: 685,
            w: 340,
            h: 35
        },
        {
            etiqueta: "← VOLVER A LA OBRA",
            accion: () => {
                monitor = false;
                variacionVentana = 0;
                paletaActual = { ...paletaInicial };
                // Apagar el retorno de voz automáticamente al volver a la obra
                if (retornoVoz) {
                    retornoVoz = false;
                    mic.disconnect();
                    console.log("Retorno de voz desactivado automáticamente al volver a la obra.");
                }
                redraw();
            },
            getActivo: () => false,
            x: 600,
            y: 35,
            w: 150,
            h: 30
        },
        {
            etiqueta: "PRUEBA DE VOZ (RETORNO)",
            accion: () => {
                if (!audioIniciado) {
                    iniciarAudio();
                }
                retornoVoz = !retornoVoz;
                if (retornoVoz) {
                    mic.connect();
                    console.log("Retorno de voz (Prueba de voz) ACTIVO.");
                } else {
                    mic.disconnect();
                    console.log("Retorno de voz (Prueba de voz) INACTIVO.");
                }
            },
            getActivo: () => retornoVoz,
            x: 50,
            y: 740,
            w: 340,
            h: 35
        }
    ];
}

/**
 * Renderiza la interfaz gráfica interactiva de control de sonido.
 * Dibuja sliders, botones, telemetría y los osciloscopios de señal.
 */
function dibujarInterfazControlSonido() {
    push();
    // Fondo claro crema premium de estudio
    background(245, 245, 243);

    // --- ENCABEZADO ---
    fill(20, 20, 22);
    noStroke();
    textFont("'Helvetica Neue', Helvetica, Arial, sans-serif");
    textSize(20);
    textStyle(BOLD);
    text("PANEL DE CONTROL DE SONIDO", 50, 50);

    textSize(11);
    textStyle(NORMAL);
    fill(100, 100, 105);
    text("AJUSTES DE SENSIBILIDAD E INTERACCIÓN GENERATIVA  |  [M] VOLVER A LA OBRA", 50, 75);

    // Separador lineal minimalista
    stroke(205, 205, 210);
    strokeWeight(1);
    line(50, 90, width - 50, 90);

    // --- PANEL IZQUIERDO: SLIDERS Y BOTONES ---
    for (let slider of slidersControlSonido) {
        let valActual = slider.get();
        // Dibujar etiqueta
        noStroke();
        fill(90, 90, 95);
        textSize(11);
        textAlign(LEFT, BASELINE);
        text(slider.etiqueta.toUpperCase(), slider.x, slider.y - 8);

        // Dibujar valor actual a la derecha
        textAlign(RIGHT, BASELINE);
        fill(30, 30, 32);
        text(slider.formato(valActual), slider.x + slider.w, slider.y - 8);

        // Pista del slider (fondo)
        strokeWeight(slider.h);
        stroke(225, 225, 230);
        strokeCap(ROUND);
        line(slider.x, slider.y + slider.h/2, slider.x + slider.w, slider.y + slider.h/2);

        // Barra de progreso llena (color dinámico tomado de la paleta actual de la obra)
        let pct = map(valActual, slider.minVal, slider.maxVal, 0.0, 1.0, true);
        let colSlider = paletaActual[slider.claveColor] || '#e6b111';
        stroke(colSlider);
        line(slider.x, slider.y + slider.h/2, slider.x + slider.w * pct, slider.y + slider.h/2);

        // Perilla (knob) minimalista
        stroke(170, 170, 175);
        strokeWeight(1);
        fill(255);
        ellipse(slider.x + slider.w * pct, slider.y + slider.h/2, 14, 14);
    }

    // Dibujar botones
    for (let boton of botonesControlSonido) {
        let esActivo = boton.getActivo();
        let esHover = (mouseX >= boton.x && mouseX <= boton.x + boton.w && mouseY >= boton.y && mouseY <= boton.y + boton.h);

        // Fondo del botón
        if (esActivo) {
            // Si está activo (ej: calibrando), usamos un color llamativo de la paleta
            fill(paletaActual.colBloque5 || '#d3299d');
        } else if (esHover) {
            fill(215, 215, 220); // Gris hover claro
        } else {
            fill(235, 235, 238); // Gris fondo claro
        }

        // Borde fino minimalista
        stroke(195, 195, 200);
        strokeWeight(1);
        rectMode(CORNER);
        rect(boton.x, boton.y, boton.w, boton.h, 4);

        // Texto del botón
        noStroke();
        if (esActivo) {
            fill(255); // Texto blanco sobre fondo activo de paleta
        } else {
            fill(50, 50, 55); // Gris oscuro
        }
        textSize(10);
        textStyle(BOLD);
        textAlign(CENTER, CENTER);
        text(boton.etiqueta, boton.x + boton.w / 2, boton.y + boton.h / 2);
    }

    // --- PANEL DERECHO: TELEMETRÍA Y OSCILOSCOPIOS ---
    let dx = 480;
    
    // Dibujar osciloscopio de amplitud
    fill(90, 90, 95);
    textSize(11);
    textStyle(BOLD);
    textAlign(LEFT, TOP);
    text("HISTORIAL DE AMPLITUD (VOLUMEN)", dx, 110);
    gestorAmp.dibujar(dx, 130);

    // Dibujar osciloscopio de frecuencia
    text("HISTORIAL DE FRECUENCIA (TONO MIDI)", dx, 255);
    gestorFrec.dibujar(dx, 275);

    // Caja de telemetría minimalista (fondo gris muy claro premium)
    fill(235, 235, 238);
    stroke(215, 215, 220);
    rect(dx, 400, 270, 320, 6);

    noStroke();
    fill(20, 20, 22);
    textSize(13);
    textStyle(BOLD);
    text("TELEMETRÍA EN TIEMPO REAL", dx + 20, 420);

    textSize(12);
    textStyle(NORMAL);
    fill(100, 100, 105);
    
    // Categoría: Amplitud
    text("VOLUMEN / INTENSIDAD:", dx + 20, 455);
    fill(40, 40, 45);
    text("Nivel Crudo: " + amp.toFixed(4), dx + 40, 475);
    text("Filtrado (Intensidad): " + intensidad.toFixed(3), dx + 40, 495);
    text("Rango Calibrado: [" + pisoAmp.toFixed(4) + " - " + techoAmp.toFixed(4) + "]", dx + 40, 515);

    // Categoría: Frecuencia
    fill(100, 100, 105);
    text("FRECUENCIA / ALTURA:", dx + 20, 545);
    fill(40, 40, 45);
    text("Frecuencia: " + frec.toFixed(1) + " Hz", dx + 40, 565);
    text("Nota MIDI: " + notaMidi.toFixed(1), dx + 40, 585);
    text("Dirección Tono: " + (direccionFrec === 1 ? "SUBIENDO" : (direccionFrec === -1 ? "BAJANDO" : "REPOSO")), dx + 40, 605);

    // Categoría: Agudos (Shhhhh)
    fill(100, 100, 105);
    text("DETECTOR DE SISEO (SHHHHH):", dx + 20, 635);
    fill(40, 40, 45);
    text("Energía Agudos: " + energyTreble.toFixed(1), dx + 40, 655);
    text("¿Es Shhhhh?: " + (esShhhh ? "SÍ (VIBRANDO)" : "NO"), dx + 40, 675);
    text("Estado Acústico: " + (haySonido ? "CON SONIDO" : "SILENCIO"), dx + 40, 695);

    pop();
}



/**
 * Maneja el arrastre del mouse. Si hay un slider de control de sonido activo,
 * calcula y actualiza su valor proporcionalmente al desplazamiento X.
 */
function mouseDraggedControlSonido() {
    if (sliderActivoControlSonido) {
        actualizarValorSliderControlSonido();
        return true; // Arrastre consumido
    }
    return false;
}

/**
 * Libera el slider de control de sonido que se estaba arrastrando.
 */
function mouseReleasedControlSonido() {
    sliderActivoControlSonido = null;
}

/**
 * Recalcula el valor del slider activo en base a la coordenada X del ratón.
 */
function actualizarValorSliderControlSonido() {
    if (!sliderActivoControlSonido) return;

    let pct = (mouseX - sliderActivoControlSonido.x) / sliderActivoControlSonido.w;
    pct = constrain(pct, 0.0, 1.0);

    let nuevoVal = map(pct, 0.0, 1.0, sliderActivoControlSonido.minVal, sliderActivoControlSonido.maxVal);
    if (sliderActivoControlSonido.esEntero) {
        nuevoVal = Math.round(nuevoVal);
    }
    
    sliderActivoControlSonido.set(nuevoVal);
}

/**
 * Inicializa de forma asíncrona el contexto de Audio y arranca la entrada del micrófono.
 */
async function iniciarAudio() {
    if (audioIniciado) {
        return;
    }

    try {
        await userStartAudio();
        mic.start(
            () => {
                audioIniciado = true;
                marcaInicioSonido = millis();
                marcaFinSonido = millis();
                marcaUltimoPitch = millis();
                // Conectar entrada de micrófono a FFT
                fft.setInput(mic);
                startPitch();
            },
            (error) => {
                console.error("No se pudo iniciar el microfono", error);
            }
        );
    } catch (error) {
        console.error("No se pudo habilitar el contexto de audio", error);
    }
}

/**
 * Inicializa el modelo de detección de frecuencia (pitch) mediante ML5 crepe.
 */
function startPitch() {
    pitch = ml5.pitchDetection(
        model_url,
        getAudioContext(),
        mic.stream,
        modelLoaded
    );
}

/**
 * Callback ejecutado cuando el modelo de pitch se carga exitosamente.
 */
function modelLoaded() {
    getPitch();
}

/**
 * Realiza la lectura recursiva de pitch-detection para estimar la frecuencia
 * y actualizar el gestor de frecuencia.
 */
function getPitch() {
    pitch.getPitch(function (err, frequency) {
        if (err) {
            console.error("Error en getPitch:", err);
            setTimeout(getPitch, 120);
            return;
        }

        if (frequency) {
            frec = frequency;
            notaMidi = freqToMidi(frequency);
            hayPitch = true;
            marcaUltimoPitch = millis();
            gestorFrec.actualizar(notaMidi);
        } else {
            frec = 0;
            hayPitch = millis() - marcaUltimoPitch <= timeoutSinPitch;
        }

        getPitch();
    });
}
