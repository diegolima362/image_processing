let img = [];
let processedImg = [];

let w = 256;
let h = 256;

let maxValue = 255;
let minValue = 0;

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
const dynamicRange = (r) => Math.round(((r - minValue) / (255 - minValue)) * targetValue);
const sigmoide = (r) => Math.round(255 * (1 / (1 + Math.exp(-(r - greyCenterValue) / sigmaValue))));

let currentOperator = null;

const operators = {
    1: negative,
    2: gamma,
    3: logarithmic,
    4: linear,
    5: dynamicRange,
    6: sigmoide,
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


const filterSelector = document.getElementById('input-filter');
const inputMatrix = document.getElementById('input-matrix');
const inputMatrixValues = document.getElementsByName('array[]');
const imgSelector = document.getElementById('img-selector');


const mainCanvas = function (sketch) {
    sketch.setup = function () {
        sketch.createCanvas(w, h).parent("original-img");
        fetch('../assets/lena.pgm').then(data => data.blob().then(readImage));
    }

    imgSelector.onchange = function () {
        let path = imagesPath[imgSelector.value];
        fetch(path).then(data => data.blob().then(readImage));
    }

    applyAgainBtn.onclick = function () {
        img = processedImg;
        paintImage(sketch, img, w, h);
    }

    filterSelector.onchange = function () {
        let value = filterSelector.value;

        if (value === '0') {
            currentOperator = null;
            processedImg = img;
        } else {
            currentOperator = operators[value];
        }

        if (currentOperator != null) processedImg = transform(currentOperator);
        screen2.setup();
    }

    inputMatrix.onchange = function () {
        gammaValue = parseFloat(inputMatrixValues[0].value);
        logScalarValue = parseFloat(inputMatrixValues[1].value);
        aValue = parseFloat(inputMatrixValues[2].value);
        bValue = parseFloat(inputMatrixValues[3].value);
        minValue = parseFloat(inputMatrixValues[4].value);
        targetValue = parseFloat(inputMatrixValues[5].value);
        greyCenterValue = parseFloat(inputMatrixValues[6].value);
        sigmaValue = parseFloat(inputMatrixValues[7].value);


        if (currentOperator != null) {
            processedImg = transform(currentOperator);
            screen2.setup();
        }
    }

    function readImage(file) {
        if (file != null) {
            let reader = new FileReader();

            reader.readAsText(file);

            reader.onload = function (_) {
                img = [];
                let lines = this.result.trim().split('\n');

                let resolution = lines[1].split(' ');
                w = parseInt(resolution[0]);
                h = parseInt(resolution[1]);


                sketch.resizeCanvas(w, h);

                maxValue = parseInt(resolution[2]);

                let flat = [];

                let k = 0;
                for (let i = 3; i < lines.length; i++) {
                    let line = lines[i].trim().split(' ');
                    for (let j = 0; j < line.length; j++) {
                        flat[k++] = parseInt(line[j]);
                    }
                }

                k = 0;
                for (let i = 0; i < h; i++) {
                    img[i] = [];
                    for (let j = 0; j < w; j++) {
                        img[i][j] = flat[k++];
                    }
                }

                paintImage(sketch, img, w, h);
                processedImg = img;
                screen2.setup();
            }
        }
    }
}


let processedCanvas = function (sketch) {
    sketch.setup = function () {
        sketch.createCanvas(w, h).parent("processed-img");
        if (processedImg.length !== 0) paintImage(sketch, processedImg, w, h);
        else if (img.length !== 0) paintImage(sketch, img, w, h);
    };
};

let screen1 = new p5(mainCanvas, 'p5sketch');
let screen2 = new p5(processedCanvas, 'p5sketch');


function paintImage(sketch, img, w, h) {
    sketch.background(220);
    sketch.loadPixels();

    for (let i = 0; i < h; ++i) {
        for (let j = 0; j < w; ++j) {
            if (img[i][j] < 0) {
                img[i][j] = 0;
            }
            if (img[i][j] > 255) {
                img[i][j] = 255;
            }

            sketch.set(j, i, img[i][j]);
        }
    }

    sketch.updatePixels();

}

function transform(operation) {
    let res = [];

    for (let i = 0; i < h; i++) {
        res[i] = [];
        for (let j = 0; j < w; j++) {
            res[i][j] = operation(img[i][j]);
        }
    }

    return res;
}


function normalize(img, w, h) {
    let res = [];

    let min = img[0][0];
    let max = img[0][0];

    for (let i = 0; i < h; ++i) {
        for (let j = 0; j < w; ++j) {
            let v = img[i][j];
            if (v < min) min = v;
            if (v > max) max = v;
        }
    }

    for (let i = 0; i < h; ++i) {
        res[i] = [];
        for (let j = 0; j < w; ++j) {
            res[i][j] = (255 - max) * (img[i][j] - min) / (max - min);
        }
    }

    return res;
}

function download(filename, data) {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + imgToText(data));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

document.getElementById("download-btn").onclick = function () {
    const filename = "image.pgm";
    download(filename, processedImg);
}

function imgToText(img) {
    let str = `P2\n${w} ${h}\n255\n`;
    for (let i = 0; i < h; i++) {
        for (let j = 0; j < w; j++) {
            str += `${img[i][j]} `;
        }
        str += '\n';
    }

    return str;
}
