const erosion = (img, k) => operation(img, k, 'erosion');
const dilation = (img, k) => operation(img, k, 'dilation');

let currentOperator = null;

const operators = {
    1: erosion,
    2: dilation,
};

const imagesPath = {
    0: '../assets/fingerprint.pbm',
    1: '../assets/holes.pbm',
    2: '../assets/text.pbm',
};

let kernelList = [0, 1, 0, 1, 1, 1, 0, 1, 0];

const downloadBtn = document.getElementById('download-btn');

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
            processedImg.data = currentOperator(img, kernelList);
        }

        paintImage(sketch, processedImg);
    }

    inputMatrix.onchange = function () {
        for (let i = 0; i < 9; i++) {
            kernelList[i] = parseInt(inputMatrixValues[i].value);
        }
        if (currentOperator != null) {
            processedImg.data = currentOperator(img, kernelList);
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


function operation(img, k, operate = 'erosion') {
    let h = img.h;
    let w = img.w;
    let data = img.data;

    let res = [];

    let target = operate === 'dilation' ? 1 : k.reduce((a, b) => a + b, 0);

    for (let i = 0; i < h; i++) {
        res [i] = []
        for (let j = 0; j < w; j++) {
            let acc = 0

            acc += k[0] & (i === 0 || j === 0 ? 0 : data[i - 1][j - 1]);
            acc += k[1] & (i === 0 ? 0 : data[i - 1][j]);
            acc += k[2] & (i === 0 || j === w - 1 ? 0 : data[i - 1][j + 1]);

            acc += k[3] & (j === 0 ? 0 : data[i][j - 1]);
            acc += k[4] & data[i][j];
            acc += k[5] & (j === w - 1 ? 0 : data[i][j + 1]);

            acc += k[6] & (i === h - 1 || j === 0 ? 0 : data[i + 1][j - 1]);
            acc += k[7] & (i === h - 1 ? 0 : data[i + 1][j]);
            acc += k[8] & (i === h - 1 || j === data.w - 1 ? 0 : data[i + 1][j + 1]);

            res[i][j] = acc >= target ? 1 : 0;
        }
    }


    return res;
}