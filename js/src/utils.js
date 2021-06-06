function Image() {
    this.type = '';
    this.data = [];
    this.w = 0;
    this.h = 0;
}

function readImage(path, sketch, img) {
    fetch(path).then(data => data.blob().then(file => buildImage(file, sketch, img)));
}


const buildImage = function (file, sketch, img) {
    let reader = new FileReader();

    reader.readAsText(file);

    reader.onload = function (_) {
        let lines = this.result.trim().split('\n');

        let count = 0;

        img.type = lines[count++].trim();
        if (lines[count].charAt(0) === '#') count++;

        let resolution = lines[count++].split(' ');
        img.w = parseInt(resolution[0]);
        img.h = parseInt(resolution[1]);

        let separator = img.type === 'P1' ? '' : ' ';
        let flat = [];

        let k = 0;
        for (let i = count; i < lines.length; i++) {
            let line = lines[i].trim().split(separator);
            for (let j = 0; j < line.length; j++) {
                flat[k++] = parseInt(line[j]);
            }
        }

        k = 0;
        for (let i = 0; i < img.h; i++) {
            img.data[i] = [];
            for (let j = 0; j < img.w; j++) {
                img.data[i][j] = flat[k++];
            }
        }

        paintImage(sketch, img);
    }
}


function paintImage(sketch, img) {
    sketch.resizeCanvas(img.w, img.h);
    sketch.loadPixels();

    let binary = img.type === 'P1';

    for (let i = 0; i < img.h; ++i) {
        for (let j = 0; j < img.w; ++j) {
            let r = img.data[i][j];
            r = binary ? r === 0 ? 255 : 0 : r < 0 ? 0 : r > 255 ? 255 : r;
            sketch.set(j, i, r);
        }
    }

    sketch.updatePixels();
}


function convolution(img, k, doNormalize) {
    let h = img.h;
    let w = img.w;
    let data = img.data;

    let res = [];

    for (let i = 0; i < h; i++) {
        res [i] = []
        for (let j = 0; j < w; j++) {
            let acc = 0

            acc += k[2][2] * (i === 0 || j === 0 ? 0 : data[i - 1][j - 1]);
            acc += k[2][1] * (i === 0 ? 0 : data[i - 1][j]);
            acc += k[2][0] * (i === 0 || j === w - 1 ? 0 : data[i - 1][j + 1]);

            acc += k[1][2] * (j === 0 ? 0 : data[i][j - 1]);
            acc += k[1][1] * data[i][j];
            acc += k[1][0] * (j === w - 1 ? 0 : data[i][j + 1]);

            acc += k[0][2] * (i === h - 1 || j === 0 ? 0 : data[i + 1][j - 1]);
            acc += k[0][1] * (i === h - 1 ? 0 : data[i + 1][j]);
            acc += k[0][0] * (i === h - 1 || j === data.w - 1 ? 0 : data[i + 1][j + 1]);

            res[i][j] = acc
        }
    }


    return doNormalize ? normalize(res, w, h) : res;
}


function composition(a, b, w, h, operator, doNormalize = false) {
    let res = [];
    for (let i = 0; i < h; i++) {
        res[i] = [];
        for (let j = 0; j < w; j++) {
            res[i][j] = operator(a[i][j], b[i][j]);
        }
    }

    return doNormalize ? normalize(res, w, h) : res;
}


function normalize(img, w, h) {
    let min = img[0][0];
    let max = min;

    let res = [];

    for (let i = 0; i < h; ++i) {
        for (let j = 0; j < w; ++j) {
            let v = img[i][j];
            if (v < min) min = v;
            if (v > max) max = v;
        }
    }

    let range = (max - min) === 0 ? 0 : 255 / (max - min);

    for (let i = 0; i < h; ++i) {
        res[i] = [];
        for (let j = 0; j < w; ++j) {
            res[i][j] = Math.round(range * (img[i][j] - min));
        }
    }

    return res;
}


function getRange(img) {
    let max = img.data[0][0];
    let min = max;
    let v;
    for (let i = 0; i < img.h; i++) {
        for (let j = 0; j < img.w; j++) {
            v = img.data[i][j];
            if (v > max) max = v;
            if (v < min) min = v;
        }
    }

    return [min, max];
}


function instantiateHistogram(img) {
    let hist = new Array(256).fill(0);

    for (let i = 0; i < img.h; i++) {
        for (let j = 0; j < img.w; j++) {
            hist[img.data[i][j]]++;
        }
    }

    return hist;
}


function drawHist(sketch, img, width, height, showCDF = false) {

    let hist = instantiateHistogram(img);
    let sum = 0;
    let cumsum = hist.map(x => sum += x);

    let min = sketch.min(hist);
    let max = sketch.max(hist);

    sketch.loadPixels();
    sketch.push();

    let range = 256;
    let vPadding = 20;
    let paddingLeft = width * 0.2;


    let graphHeight = height - 2 * vPadding;

    let y1 = height - vPadding;
    let y2;

    // draw lines
    sketch.translate(paddingLeft, vPadding);
    sketch.stroke(0);

    sketch.textSize(8);
    sketch.textFont('Helvetica');

    sketch.line(-2, y1 + 2, range, y1 + 2); // x axis
    sketch.line(-2, y1 + 2, -2, vPadding); // y axis

    sketch.line(0, y1 + 2, 0, y1 + 4); // start x
    sketch.text('0', 2, y1 + 10);

    sketch.text('< Nivel de cinza >', range / 2 - 30, y1 + 10);

    sketch.line(range, y1 + 2, range, y1 + 4); // end x
    sketch.text('255', range + 2, y1 + 10);

    sketch.text('1 - FDA', range + 2, vPadding);

    sketch.line(-4, y1, -2, y1); // start y
    sketch.text(`${min}`, -20, y1);

    sketch.line(-4, vPadding, -2, vPadding); // end y
    sketch.text(`${max}`, -20, vPadding);

    sketch.rotate(sketch.radians(90));
    sketch.text('< Intensidade >', graphHeight/2 - 10, 20)
    sketch.rotate(sketch.radians(-90));


    sketch.stroke(50);
    for (let i = 0; i < range; i++) {
        y2 = sketch.int(sketch.map(hist[i], min, max, 0, graphHeight));
        if (y2 !== 0) sketch.line(i, y1, i, y1 - y2);
    }

    if (showCDF) {
        sketch.stroke(0);
        sketch.strokeWeight(2);
        let min = sketch.min(cumsum);
        let max = sketch.max(cumsum);

        sketch.beginShape();
        sketch.noFill();

        for (let i = 0; i < range; i++) {
            let y2 = sketch.int(sketch.map(cumsum[i], min, max, 0, graphHeight));
            sketch.curveVertex(i, y1 - y2);
        }
        sketch.endShape();
    }

    sketch.pop();
}


function download(filename, img) {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + imgToText(img));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}


function imgToText(img) {
    let h = img.h;
    let w = img.w;
    let data = img.data;

    let str = `${img.type}\n${w} ${h}\n`;
    if (img.type === 'P2') str += '255\n'
    let separator = img.type === 'P2' ? ' ' : '';

    for (let i = 0; i < h; i++) {
        for (let j = 0; j < w; j++) {
            str += `${data[i][j]}${separator}`;
        }
        str += '\n';
    }

    return str;
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

