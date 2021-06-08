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


function magnitude(gx, gy, w, h, doNormalize) {
    let res = [];
    for (let i = 0; i < h; i++) {
        res[i] = [];
        for (let j = 0; j < w; j++) {
            res[i][j] = Math.abs(gx[i][j]) + Math.abs(gy[i][j]);
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

function inTriangle(p, t) {
    let v0 = [t.c.x - t.a.x, t.c.y - t.a.y];
    let v1 = [t.b.x - t.a.x, t.b.y - t.a.y];
    let v2 = [p.x - t.a.x, p.y - t.a.y];

    let dot00 = (v0[0] * v0[0]) + (v0[1] * v0[1]);
    let dot01 = (v0[0] * v1[0]) + (v0[1] * v1[1]);
    let dot02 = (v0[0] * v2[0]) + (v0[1] * v2[1]);
    let dot11 = (v1[0] * v1[0]) + (v1[1] * v1[1]);
    let dot12 = (v1[0] * v2[0]) + (v1[1] * v2[1]);

    let invDenom = 1 / (dot00 * dot11 - dot01 * dot01);

    let u = (dot11 * dot02 - dot01 * dot12) * invDenom;
    let v = (dot00 * dot12 - dot01 * dot02) * invDenom;

    return ((u >= 0) && (v >= 0) && (u + v < 1));
}

