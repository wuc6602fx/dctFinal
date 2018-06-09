$(document).ready(() => { // jQuery main

    let stage = new createjs.Stage(canvas);
    let repo = new createjs.LoadQueue();

    function setup() {
        // automatically update
        createjs.Ticker.on("tick", e => stage.update());
        createjs.Ticker.framerate = 60;
        // load assets
        repo.loadManifest([
            {id: 'criminal', src: "images/criminal.png"},//criminals
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
        criminals[0].set({x: 720, y: 150});//x will be replaced to canvas.width

        stage.addChild(criminals[0]);
        plane.set({x: 10, y: 10});
        stage.addChild(plane);
        createjs.Tween.get(criminals[0], {loop: true}).to({x: 280, y: 150}, 5000);


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
                        .to({x: 1080}, 1000)
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
        /*
                plane.on('click', e => {
                    let dot = new createjs.Shape();
                    dot.graphics.beginFill('red').drawCircle(plane.x + plane.image.width, plane.y + plane.image.height / 2, 5);
                    createjs.Tween.get(dot)
                        .to({x: 1080}, 1000)
                        .call(() => {
                            stage.removeChild(dot);
                            exp.x = 500;
                            exp.y = plane.y;
                            stage.addChild(exp);

                        }).wait(500).call(() => stage.removeChild(exp));
                    stage.addChild(dot);
                })
                */
    }

    setup();
});