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
}

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

function draw() {
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

    // Barrotes ventana 1 (Distribución proporcional)
    stroke(paletaActual.colMarcoV1);
    strokeWeight(4);
    line(v1X + v1W * 0.346, v1Y + 8, v1X + v1W * 0.346, v1Y + v1H - 8);
    line(v1X + v1W * 0.64, v1Y + 8, v1X + v1W * 0.64, v1Y + v1H - 8);
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

    // Barrotes ventana 2 (Distribución proporcional)
    stroke(paletaActual.colMarcoV2);
    strokeWeight(6);
    line(v2X + v2W * 0.269, v2Y + 10, v2X + v2W * 0.269, v2Y + v2H - 10);
    line(v2X + v2W * 0.5, v2Y + 10, v2X + v2W * 0.5, v2Y + v2H - 10);
    line(v2X + v2W * 0.73, v2Y + 10, v2X + v2W * 0.73, v2Y + v2H - 10);
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

    // Barrotes ventana 3 (Distribución proporcional)
    stroke(paletaActual.colMarcoV3);
    strokeWeight(5);
    line(v3X + v3W * 0.346, v3Y + 8, v3X + v3W * 0.346, v3Y + v3H - 8);
    line(v3X + v3W * 0.64, v3Y + 8, v3X + v3W * 0.64, v3Y + v3H - 8);
    noStroke();

    // 6. Barra inferior (Cielo)
    fill(paletaActual.colBloque7);
    rect(0, 725, 575, 75);

    pop();
}


function mousePressed() {
    detectarInputMouse();
}

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

function keyPressed() {
    if (key === '1') {
        // Agrandar ventanas hasta el límite
        if (variacionVentana < LIMITE_EXPANSION) {
            variacionVentana += 5;
            redraw();
        }
    } else if (key === '2') {
        // Achicar ventanas hasta el límite
        if (variacionVentana > LIMITE_CONTRACCION) {
            variacionVentana -= 5;
            redraw();
        }
    } else if (key === '3' || key === '4') {
        // Mezclar aleatoriamente las paletas de la obra
        mezclarPaletaAleatoriamente();
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


function drawNoise(x, y, w, h) {
    push();
    strokeWeight(1);
    for (let i = 0; i < (w * h) * 0.05; i++) {
        let px = x + random(w);
        let py = y + random(h);
        stroke(0, 15); // Subtle dark grain
        point(px, py);
        stroke(255, 15); // Subtle light grain
        point(px + 1, py + 1);
    }
    pop();
}

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
