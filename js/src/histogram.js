const imagesPath = {
    0: '../assets/lena.pgm',
    1: '../assets/cameraman.pgm',
    2: '../assets/airplane.pgm',
    3: '../assets/barbara.pgm',
    4: '../assets/sea.pgm',
    5: '../assets/lenalow.pgm',
    6: '../assets/lenahigh.pgm',
};

const imgSelector = document.getElementById('img-selector');
const showOriginalHist = document.getElementById('show-original-hist');
const showProcessedHist = document.getElementById('show-processed-hist');

const downloadBtn = document.getElementById('download-btn');

const equalizeBtn = document.getElementById('equalize-btn');

let img = new Image();
let processedImg = new Image();

const mainCanvas = function (sketch) {
    sketch.setup = function () {
        sketch.createCanvas(256, 256).parent("original-img");
        readImage('../assets/lena.pgm', sketch, img);
    }

    imgSelector.onchange = _ => readImage(imagesPath[imgSelector.value], sketch, img);

    showOriginalHist.onclick = _ => img.width !== 0 ? originalHist.setup() : null;
}


let processedCanvas = function (sketch) {
    sketch.setup = function () {
        sketch.createCanvas(256, 256).parent("processed-img");
    };

    showProcessedHist.onclick = _ => img.width !== 0 ? processedHist.setup() : null;

    equalizeBtn.onclick = function () {
        processedImg.type = img.type;
        processedImg.w = img.w;
        processedImg.h = img.h;
        processedImg.data = equalizeImage(img);
        paintImage(sketch, processedImg);
    }
};


const originalHistCanvas = function (sketch) {
    sketch.setup = function () {
        sketch.createCanvas(400, 200).parent("original-hist");
        if (img.w !== 0) drawHist(sketch, img, 350, 180, true);
    }
}

const processedHistCanvas = function (sketch) {
    sketch.setup = function () {
        sketch.createCanvas(400, 200).parent("processed-hist");
        if (processedImg.w !== 0) drawHist(sketch, processedImg, 350, 180, true);
    }

    downloadBtn.onclick = function () {
        let filename = "image.pgm";
        download(filename, processedImg);
    }

}

new p5(mainCanvas, 'p5sketch');
new p5(processedCanvas, 'p5sketch');
const originalHist = new p5(originalHistCanvas, 'p5sketch');
const processedHist = new p5(processedHistCanvas, 'p5sketch');


function equalizeImage(img) {
    let hist = instantiateHistogram(img);
    let histProb = getHistProb(hist, img.h * img.w);
    let acc = getAccumulatedProba(histProb);
    let scale = getScaleArr(acc);

    let res = [];
    for (let i = 0; i < img.h; i++) {
        res [i] = [];
        for (let j = 0; j < img.w; j++) {
            res[i][j] = scale[img.data[i][j]];
        }
    }

    return res;
}

function getHistProb(hist, n) {
    let h = [];
    for (let i = 0; i < 256; i++) {
        h[i] = hist[i] / n;
    }
    return h
}


function getAccumulatedProba(hist) {
    let acc = [];
    let sum = 0;

    acc [0] = hist[0];
    for (let i = 1; i < 256; i++) {
        sum += hist[i - 1]
        acc[i] = hist[i] + sum;
    }

    return acc;
}


function getScaleArr(arr) {
    let res = [];

    for (let i = 1; i < 256; i++) {
        res[i] = Math.ceil(arr[i] * 255);
    }

    return res;
}