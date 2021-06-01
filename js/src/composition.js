let img1 = [];
let img2 = [];
let processedImg = [];

let w = 256;
let h = 256;

let pw = 256;
let ph = 256;

const filterSelector = document.getElementById('input-filter');

const img1Selector = document.getElementById('img-1-selector');
const img2Selector = document.getElementById('img-2-selector');

let selectedOperator = 0;

const mainCanvas = function (sketch) {
    sketch.setup = function () {
        sketch.createCanvas(w, h).parent("img-1");
        fetch('../assets/lena.pgm').then(data => data.blob().then(file => readImage(file, img1, sketch)));
    }

    img1Selector.onchange = function () {
        let value = img1Selector.value;

        if (value === '0') {
            fetch('../assets/lena.pgm').then(data => data.blob().then(file => readImage(file, img1, sketch)));
        } else if (value === '1') {
            fetch('../assets/airplane.pgm').then(data => data.blob().then(file => readImage(file, img1, sketch)));
        }
    }

}

const secondaryCanvas = function (sketch) {
    sketch.setup = function () {
        sketch.createCanvas(w, h).parent("img-2");
        fetch('../assets/airplane.pgm').then(data => data.blob().then(file => readImage(file, img2, sketch)));
    }

    img2Selector.onchange = function () {
        let value = img2Selector.value;

        if (value === '0') {
            fetch('../assets/lena.pgm').then(data => data.blob().then(file => readImage(file, img2, sketch)));
        } else if (value === '1') {
            fetch('../assets/airplane.pgm').then(data => data.blob().then(file => readImage(file, img2, sketch)));
        }
    }
}


let processedCanvas = function (sketch) {
    sketch.setup = function () {
        sketch.createCanvas(w, h).parent("processed-img");

        filterSelector.onchange = function () {
            selectedOperator = filterSelector.value;
            processedImg = composition(img1, img2);
            paintImage(sketch, processedImg, pw, ph);
        }
    };
};

let screen1 = new p5(mainCanvas, 'p5sketch');
let screen2 = new p5(secondaryCanvas, 'p5sketch');
let screen3 = new p5(processedCanvas, 'p5sketch');


function readImage(file, img, sketch) {
    if (file != null) {
        let reader = new FileReader();

        reader.readAsText(file);

        reader.onload = function (_) {
            let lines = this.result.trim().split('\n');

            let resolution = lines[1].split(' ');
            w = parseInt(resolution[0]);
            h = parseInt(resolution[1]);

            sketch.resizeCanvas(w, h);

            maxValue = parseInt(resolution[2]);

            for (let i = 3; i < lines.length; i++) {
                let line = lines[i].split(' ');
                img[i - 3] = [];
                for (let j = 0; j < line.length; j++) {
                    img[i - 3][j] = parseInt(line[j]);
                }
            }

            paintImage(sketch, img, w, h);
        }
    }
}

function paintImage(sketch, img, w, h) {
    sketch.background(220);
    sketch.loadPixels();

    for (let i = 0; i < h; ++i) {
        for (let j = 0; j < w; ++j) {
            if (img[i][j] < 0) {
                console.log('<0')
                img[i][j] = 0;
            }
            if (img[i][j] > 255) {
                console.log('>255')
                img[i][j] = 255;
            }

            sketch.set(j, i, img[i][j]);
        }
    }

    sketch.updatePixels();

}


function composition(a, b) {
    let res = [];
    for (let i = 0; i < ph; i++) {
        res[i] = [];
        for (let j = 0; j < pw; j++) {
            if (selectedOperator === '0')
                res[i][j] = (a[i][j] + b[i][j]);
            else if (selectedOperator === '1')
                res[i][j] = (a[i][j] - b[i][j]);
            else if (selectedOperator === '2')
                res[i][j] = (a[i][j] * b[i][j]);
            else if (selectedOperator === '3')
                res[i][j] = b[i][j] === 0 ? 0 : (a[i][j] / b[i][j]);
            else if (selectedOperator === '4')
                res[i][j] = (a[i][j] | b[i][j]);
            else if (selectedOperator === '5')
                res[i][j] = (a[i][j] & b[i][j]);
            else if (selectedOperator === '6')
                res[i][j] = (a[i][j] ^ b[i][j]);
        }
    }

    let min = 0
    let max = 0;

    for (let i = 0; i < h; ++i) {
        for (let j = 0; j < w; ++j) {
            let v = res[i][j];
            if (v < min) min = v;
            if (v > max) max = v;
        }
    }

    for (let i = 0; i < h; ++i) {
        for (let j = 0; j < w; ++j) {
            res[i][j] = (res[i][j] - min) / (max - min) * 255.0;
        }
    }

    return res;
}