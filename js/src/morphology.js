const erosion = (img, w, h, k) => operation(img, w, h, k, 'erosion');
const dilation = (img, w, h, k) => operation(img, w, h, k, 'dilation');
const opening = (img, w, h, k) => dilation(erosion(img, w, h, k), w, h, k);
const closing = (img, w, h, k) => erosion(dilation(img, w, h, k), w, h, k);

let currentOperator = null;

const operators = {
    1: erosion,
    2: dilation,
    3: opening,
    4: closing,
};

const imagesPath = {
    0: '../assets/fingerprint.pbm',
    1: '../assets/fingerprint_negative.pbm',
    2: '../assets/holes.pbm',
    3: '../assets/holes_negative.pbm',
    4: '../assets/text.pbm',
    5: '../assets/map.pbm',
};

let kernelList = [0, 1, 0, 1, 1, 1, 0, 1, 0];

const downloadBtn = document.getElementById('download-btn');
const applyAgainBtn = document.getElementById('apply-again-btn');

const filterSelector = document.getElementById('input-filter');
const inputMatrix = document.getElementById('input-matrix');
const inputMatrixValues = document.getElementsByName('array[]');
const imgSelector = document.getElementById('img-selector');

let img = new Image();
let processedImg = new Image();

const mainCanvas = function (sketch) {
    sketch.setup = function () {
        sketch.createCanvas(256, 256).parent("original-img");
        readImage('../assets/fingerprint.pbm', sketch, img);
    }

    imgSelector.onchange = _ => readImage(imagesPath[imgSelector.value], sketch, img);

    applyAgainBtn.onclick = function () {
        if (processedImg.w !== 0) {
            img.data = processedImg.data;
            paintImage(sketch, img);
        }
    }
}


let processedCanvas = function (sketch) {
    sketch.setup = function () {
        sketch.createCanvas(256, 256).parent("processed-img");
    };

    filterSelector.onchange = function () {
        let value = filterSelector.value;

        processedImg.type = img.type;
        processedImg.w = img.w;
        processedImg.h = img.h;

        if (value === '0') {
            currentOperator = null;
            processedImg.data = img.data;
        } else {
            currentOperator = operators[value];
            processedImg.data = currentOperator(img.data, img.w, img.h, kernelList);
        }

        paintImage(sketch, processedImg);
    }

    inputMatrix.onchange = function () {
        for (let i = 0; i < 9; i++) {
            kernelList[i] = parseInt(inputMatrixValues[i].value);
        }
        if (currentOperator != null) {
            processedImg.data = currentOperator(img.data, img.w, img.h, kernelList);
            paintImage(sketch, processedImg);
        }
    }

    downloadBtn.onclick = function () {
        if (processedImg.w !== 0) {
            let filename = "image.pbm";
            download(filename, processedImg);
        }
    }
};


new p5(mainCanvas, 'p5sketch');
new p5(processedCanvas, 'p5sketch');


function operation(img, w, h, k, operate = 'erosion') {
    let res = [];

    let target = operate === 'dilation' ? 1 : k.reduce((a, b) => a + b, 0);

    for (let i = 0; i < h; i++) {
        res [i] = []
        for (let j = 0; j < w; j++) {
            let acc = 0

            acc += k[0] & (i === 0 || j === 0 ? 0 : img[i - 1][j - 1]);
            acc += k[1] & (i === 0 ? 0 : img[i - 1][j]);
            acc += k[2] & (i === 0 || j === w - 1 ? 0 : img[i - 1][j + 1]);

            acc += k[3] & (j === 0 ? 0 : img[i][j - 1]);
            acc += k[4] & img[i][j];
            acc += k[5] & (j === w - 1 ? 0 : img[i][j + 1]);

            acc += k[6] & (i === h - 1 || j === 0 ? 0 : img[i + 1][j - 1]);
            acc += k[7] & (i === h - 1 ? 0 : img[i + 1][j]);
            acc += k[8] & (i === h - 1 || j === img.w - 1 ? 0 : img[i + 1][j + 1]);

            res[i][j] = acc >= target ? 1 : 0;
        }
    }

    return res;
}