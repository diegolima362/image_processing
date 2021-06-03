let w = 256;
let h = 256;


function readImage(path, sketch, img) {
    fetch(path).then(data => data.blob().then(file => buildImage(file, sketch, img)));
}


const buildImage = function (file, sketch, img) {
    let reader = new FileReader();

    reader.readAsText(file);

    reader.onload = function (_) {
        let lines = this.result.trim().split('\n');

        let resolution = lines[1].split(' ');
        w = parseInt(resolution[0]);
        h = parseInt(resolution[1]);

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

        paintImage(sketch, img);
    }
}


function paintImage(sketch, img) {
    sketch.resizeCanvas(w, h);
    sketch.loadPixels();

    for (let i = 0; i < h; ++i) {
        for (let j = 0; j < w; ++j) {
            if (img[i][j] < 0) {
                img[i][j] = 0;
            }
            if (img[i][j] > 255) {
                img[i][j] = 255;
            }

            sketch.set(j, i, Math.round(img[i][j]));
        }
    }

    sketch.updatePixels();

}


function convolution(img, k, doNormalize) {
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

    return doNormalize ? normalize(res) : res;
}


function composition(a, b, operator, doNormalize) {
    let res = [];
    for (let i = 0; i < h; i++) {
        res[i] = [];
        for (let j = 0; j < w; j++) {
            res[i][j] = operator(a[i][j], b[i][j]);
        }
    }

    return doNormalize ? normalize(res) : res;
}


function normalize(img) {
    let min = img[0][0]
    let max = min;

    for (let i = 0; i < h; ++i) {
        for (let j = 0; j < w; ++j) {
            let v = img[i][j];
            if (v < min) min = v;
            if (v > max) max = v;
        }
    }

    let range = (max - min) === 0 ? 0 : 255 / (max - min);

    for (let i = 0; i < h; ++i) {
        for (let j = 0; j < w; ++j) {
            img[i][j] = Math.round(range * (img[i][j] - min));
        }
    }

    return img;
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

