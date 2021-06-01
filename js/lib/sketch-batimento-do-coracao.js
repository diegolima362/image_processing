let sketch = function(p) {

    p.setup = function() {
      p.createCanvas(600, 600);
      p.noLoop();
    }

    p.draw = function() {
        p.background(220);
        p.ellipse(50,50,80,80);
    }

    p.draw2 = function() {
        console.log("teste");
    }

};

new p5(sketch, 'screen');