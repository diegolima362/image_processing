const HALF = 1.0 / 2.0;
const FOURTH = 1.0 / 4.0;
const EIGHTH = 1.0 / 8.0;
const NINTH = 1.0 / 9.0;
const SIXTEENTH = 1.0 / 16.0;

let img = [];
let processedImg = [];

let w = 256;
let h = 256;

let maxValue = 255;

const edgeDetection = [[-1, -1, -1], [-1, 8, -1], [-1, -1, -1]];
const edgeDetection2 = [[-1, -1, -1], [-1, 9, -1], [-1, -1, -1]];
const sharpen = [[0, -1, 0], [-1, 5, -1], [0, -1, 0]];

const sobelX = [[-1, -2, -1], [0, 0, 0], [1, 2, 1]];
const sobelY = [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]];

const prewittX = [[-1, -1, -1], [0, 0, 0], [1, 1, 1]];
const prewittY = [[-1, 0, 1], [-1, 0, 1], [-1, 0, 1]];
const prewittXY = [[-2, -1, 0], [-1, 0, 1], [0, 1, 2]];

const average = [[NINTH, NINTH, NINTH], [NINTH, NINTH, NINTH], [NINTH, NINTH, NINTH]];


const gaussianBlur = [
    [SIXTEENTH, EIGHTH, SIXTEENTH],
    [EIGHTH, FOURTH, EIGHTH],
    [SIXTEENTH, EIGHTH, SIXTEENTH]
];

const gradientX = [[0, 0, 0], [0, 1, 0], [0, -1, 0]];
const gradientY = [[0, 0, 0], [0, 1, -1], [0, 0, 0]];

const robertsX = [[0, 0, 0], [0, 1, 0], [0, 0, -1]];
const robertsY = [[0, 0, 0], [0, 0, 1], [0, -1, 0]];

const none = [[0, 0, 0], [0, 1, 0], [0, 0, 0]];

const custom = [[0, 0, 0], [0, 1, 0], [0, 0, 0]];

let activeFilter = none;

const filters = {
    0: none,
    1: custom,
    2: edgeDetection,
    3: edgeDetection2,
    4: sharpen,
    5: sobelX,
    6: sobelY,
    7: prewittX,
    8: prewittY,
    9: average,
    10: gaussianBlur,
    11: gradientX,
    12: gradientY,
    13: robertsX,
    14: robertsY,
    16: prewittXY
};

const imagesPath = {
    0: '../assets/lena.pgm',
    1: '../assets/lenasalp.pgm',
    2: '../assets/lenag.pgm',
    3: '../assets/airplane.pgm',
    4: '../assets/pepper.pgm',
    5: '../assets/brain.pgm',
    6: '../assets/barbara.pgm',
    7: '../assets/einstein.pgm',
    8: '../assets/sea.pgm',
};

let kernelList = [];

const applyFilterBtn = document.getElementById('apply-filter-btn');
const filterSelector = document.getElementById('input-filter');
const inputMatrix = document.getElementById('input-matrix');
const inputMatrixValues = document.getElementsByName('array[]');
const imgSelector = document.getElementById('img-selector');
const scalar = document.getElementById('scalar');


const mainCanvas = function (sketch) {
    sketch.setup = function () {
        sketch.createCanvas(w, h).parent("original-img");
        fetch('../assets/lena.pgm').then(data => data.blob().then(readImage));
    }

    imgSelector.onchange = function () {
        let path = imagesPath[imgSelector.value];
        fetch(path).then(data => data.blob().then(readImage));
    }

    filterSelector.onchange = function () {
        let value = filterSelector.value;

        if (value === '15') {
            processedImg = medianFilter();
        } else {
            activeFilter = filters[value];

            let k = 0;
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    inputMatrixValues[k++].value = `${activeFilter[i][j]}`;
                }
            }

            processedImg = convolution(img, activeFilter);
        }

        screen2.setup();
    }

    applyFilterBtn.onclick = function () {
        processedImg = convolution(img, activeFilter);
        screen2.setup();
    }

    inputMatrix.onchange = function () {
        if (filterSelector.value !== 1) filterSelector.value = 1;

        let k = 0;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                custom[i][j] = parseFloat(scalar.value) * parseFloat(inputMatrixValues[k++].value);
            }
        }

        activeFilter = custom;
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

function convolution(img, k) {
    let res = []

    for (let i = 0; i < h; i++) {
        res [i] = []
        for (let j = 0; j < w; j++) {
            let acc = 0

            acc += k[2][2] * (i === 0 || j === 0 ? 0 : img[i - 1][j - 1]);
            acc += k[2][1] * (i === 0 ? 0 : img[i - 1][j]);
            acc += k[2][0] * (i === 0 || j === w - 1 ? 0 : img[i - 1][j + 1]);

            acc += k[1][2] * (j === 0 ? 0 : img[i][j - 1]);
            acc += k[1][1] * img[i][j];
            acc += k[1][0] * (j === w - 1 ? 0 : img[i][j + 1]);

            acc += k[0][2] * (i === h - 1 || j === 0 ? 0 : img[i + 1][j - 1]);
            acc += k[0][1] * (i === h - 1 ? 0 : img[i + 1][j]);
            acc += k[0][0] * (i === h - 1 || j === w - 1 ? 0 : img[i + 1][j + 1]);

            res[i][j] = acc
        }
    }

    return res;
}

function medianFilter() {
    let arr = [];
    let res = [];

    for (let i = 0; i < h; i++) {
        res[i] = [];

        for (let j = 0; j < w; j++) {
            arr[0] = i === 0 || j === 0 ? 0 : img[i - 1][j - 1];
            arr[1] = i === 0 ? 0 : img[i - 1][j];
            arr[2] = i === 0 || j === w - 1 ? 0 : img[i - 1][j + 1];

            arr[3] = j === 0 ? 0 : img[i][j - 1];
            arr[4] = img[i][j];
            arr[5] = j === w - 1 ? 0 : img[i][j + 1];

            arr[6] = i === h - 1 || j === 0 ? 0 : img[i + 1][j - 1];
            arr[7] = i === h - 1 ? 0 : img[i + 1][j];
            arr[8] = i === h - 1 || j === w - 1 ? 0 : img[i + 1][j + 1];

            insertionSort(arr, 9);
            res[i][j] = arr[4]
        }
    }

    return res;
}

function insertionSort(arr, n) {
    for (let i = 1; i < n; i++) {
        let key = arr[i];
        let j = i - 1;

        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j = j - 1;
        }
        arr[j + 1] = key;
    }
}