$(document).ready(() => { // jQuery main

    let stage = new createjs.Stage(canvas);
    let repo = new createjs.LoadQueue();


    function setup() {
        // automatically update
        createjs.Ticker.on("tick", e => stage.update());
        createjs.Ticker.framerate = 60;
        // load assets
        repo.loadManifest([
            {id: 'criminal', src: "images/m1.png"},//criminals
            {id: 'm2', src: "images/m2.png"},//man
            {id: 'm3', src: "images/m3.png"},
            {id: 'm4', src: "images/m4.png"},
            {id: 'plane', src: "images/plane.jpg"},//police
            {id: 'explode', src: '/images/exp.png'}]);//bullet explode
        repo.on('complete', draw);
    }

    function draw() {
        let criminals = [new createjs.Bitmap(repo.getResult('criminal')),
            new createjs.Bitmap(repo.getResult('m2')),
            new createjs.Bitmap(repo.getResult('m3')),
            new createjs.Bitmap(repo.getResult('m4'))];
        let plane = new createjs.Bitmap(repo.getResult('plane'));
        let exp = new createjs.Bitmap(repo.getResult('explode'));
        //////////////////////////////////////
        // random() run only once?///
        /////////////////////////////////////
        var theHeight = Math.floor((((Math.random() * 5) + 1) * 50));
        //console.log(theHeight)
        criminals[0].set({x: 720, y: theHeight});//x will be replaced to canvas.width
        stage.addChild(criminals[0]);
        plane.set({x: 10, y: 10});
        stage.addChild(plane);

        createjs.Tween.get(criminals[0])
            .to({x: 280, y: theHeight}, 1000)
            .call(() => {
                stage.removeChild(criminals[0]);
            });
        stage.addChild(criminals[0]);

        //控制方向
        window.addEventListener('keydown', function (e) {
            switch (e.keyCode) {
                case 38:// up
                    plane.y -= 10;
                    break;
                case 40:// down
                    plane.y += 10;
                    break;
                case 32:
                    let dot = new createjs.Shape();
                    dot.graphics.beginFill('black').drawCircle(plane.x + plane.image.width, plane.y + plane.image.height / 2, 5);
                    createjs.Tween.get(dot)
                        .to({x: canvas.width}, 1000)
                        .call(() => {
                            stage.removeChild(dot);
                            exp.x = 500;
                            exp.y = plane.y;
                            stage.addChild(exp);

                        }).wait(500).call(() => stage.removeChild(exp));
                    stage.addChild(dot);
                    break;
            }
        });
    }

    var t = setInterval(draw, 1500);
    setup();
});