let imgA = [];
let imgB = [];
let processedImg = [];

let selectedOperator = null;

const add = (a, b) => a + b;
const sub = (a, b) => a - b;
const mul = (a, b) => a * b;
const divide = (a, b) => b === 0 ? 0 : a / b;

const or = (a, b) => a | b;
const and = (a, b) => a & b;
const xor = (a, b) => a ^ b;

const operators = {
    1: add,
    2: sub,
    3: mul,
    4: divide,
    5: or,
    6: and,
    7: xor,
};

const imagesPath = {
    0: '../assets/lena.pgm',
    1: '../assets/airplane.pgm',
};

const filterSelector = document.getElementById('input-filter');
const img1Selector = document.getElementById('img-1-selector');
const img2Selector = document.getElementById('img-2-selector');

const normalizeSwitch = document.getElementById('normalizeSwitch');
const downloadBtn = document.getElementById('download-btn');

let doNormalize = false;


const mainCanvas = function (sketch) {
    sketch.setup = function () {
        sketch.createCanvas(w, h).parent("img-1");
        readImage('../assets/lena.pgm', sketch, imgA);
    }

    img1Selector.onchange = _ => readImage(imagesPath[img1Selector.value], sketch, imgA);
}


const secondaryCanvas = function (sketch) {
    sketch.setup = function () {
        sketch.createCanvas(w, h).parent("img-2");
        readImage('../assets/airplane.pgm', sketch, imgB, w, h);
    }

    img2Selector.onchange = _ => readImage(imagesPath[img2Selector.value], sketch, imgB);
}


const processedCanvas = function (sketch) {
    sketch.setup = function () {
        sketch.createCanvas(w, h).parent("processed-img");
    };

    filterSelector.onchange = function () {
        let val = filterSelector.value;

        if (val !== '0') {
            processedImg = composition(imgA, imgB, operators[val], doNormalize);
            paintImage(sketch, processedImg);
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


new p5(mainCanvas, 'p5sketch');
new p5(secondaryCanvas, 'p5sketch');
new p5(processedCanvas, 'p5sketch');
