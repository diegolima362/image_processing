let img = [];
let processedImg = [];

let gammaValue = 1;
let logScalarValue = 1;
let aValue = 1;
let bValue = 1;
let targetValue = 255;
let greyCenterValue = 127;
let sigmaValue = 25;

const negative = (r) => 255 - r;
const gamma = (r) => Math.round((((1 + r) / 255) ** gammaValue) * 255);
const logarithmic = (r) => Math.round((logScalarValue * Math.log(1 + (r / 255))) * 255);
const linear = (r) => Math.round(aValue * r + bValue);
const dynamicRange = (r) => Math.round((r / 255) * targetValue);
const sigmoid = (r) => Math.round(255 * (1 / (1 + Math.exp(-(r - greyCenterValue) / sigmaValue))));

let currentOperator = null;

const operators = {
    1: negative,
    2: gamma,
    3: logarithmic,
    4: linear,
    5: dynamicRange,
    6: sigmoid,
};

const imagesPath = {
    0: '../assets/lena.pgm',
    1: '../assets/cameraman.pgm',
    2: '../assets/airplane.pgm',
    3: '../assets/pepper.pgm',
    4: '../assets/brain.pgm',
    5: '../assets/barbara.pgm',
    6: '../assets/tyre.pgm',
    7: '../assets/einstein.pgm',
    8: '../assets/sea.pgm',
};

let kernelList = [];

const applyAgainBtn = document.getElementById('apply-again-btn');
const downloadBtn = document.getElementById('download-btn');


const filterSelector = document.getElementById('input-filter');
const inputMatrix = document.getElementById('input-matrix');
const inputMatrixValues = document.getElementsByName('array[]');
const imgSelector = document.getElementById('img-selector');

const normalizeSwitch = document.getElementById('normalizeSwitch');

let doNormalize = false;

const mainCanvas = function (sketch) {
    sketch.setup = function () {
        sketch.createCanvas(w, h).parent("original-img");
        readImage('../assets/lena.pgm', sketch, img);
    }

    imgSelector.onchange = _ => readImage(imagesPath[imgSelector.value], sketch, img);

    applyAgainBtn.onclick = function () {
        img = processedImg;
        paintImage(sketch, img);
    }
}


let processedCanvas = function (sketch) {
    sketch.setup = function () {
        sketch.createCanvas(w, h).parent("processed-img");
    };

    filterSelector.onchange = function () {
        let value = filterSelector.value;

        if (value === '0') {
            currentOperator = null;
            processedImg = img;
        } else {
            currentOperator = operators[value];
            processedImg = transform(currentOperator);
        }

        paintImage(sketch, processedImg);
    }

    inputMatrix.onchange = function () {
        gammaValue = parseFloat(inputMatrixValues[0].value);
        logScalarValue = parseFloat(inputMatrixValues[1].value);
        aValue = parseFloat(inputMatrixValues[2].value);
        bValue = parseFloat(inputMatrixValues[3].value);
        targetValue = parseFloat(inputMatrixValues[4].value);
        greyCenterValue = parseFloat(inputMatrixValues[5].value);
        sigmaValue = parseFloat(inputMatrixValues[6].value);

        if (currentOperator != null) {
            processedImg = transform(currentOperator);
            paintImage(sketch, processedImg)
        }
    }

    normalizeSwitch.onchange = function () {
        doNormalize = !doNormalize;
    }

    downloadBtn.onclick = function () {
        let filename = "image.pgm";
        download(filename, processedImg);
    }
};


function transform(operation) {
    let res = [];
    for (let i = 0; i < h; i++) {
        res[i] = [];
        for (let j = 0; j < w; j++) {
            res[i][j] = operation(img[i][j]);
        }
    }
    return doNormalize ? normalize(res) : res;
}


new p5(mainCanvas, 'p5sketch');
new p5(processedCanvas, 'p5sketch');
