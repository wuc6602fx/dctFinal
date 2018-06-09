$(document).ready(() => { // jQuery main

    let stage = new createjs.Stage(canvas);
    let repo = new createjs.LoadQueue();
    let startB;


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
            {id: 'explode', src: '/images/exp.png'},//bullet explode
            {id: 'startB', src: '/images/startB.png'},
            {id: 'main', src: '/images/main.jpg'},
            {id: 'bg', src: '/images/bg.jpg'}
            ]);
        repo.on('complete', addTitleView);
    }


    //addTitleView()

    let TitleView = new createjs.Container();

    function addTitleView() {
        let startB = new createjs.Bitmap(repo.getResult('startB'));
        let main = new createjs.Bitmap(repo.getResult('main'));
        let bg = new createjs.Bitmap(repo.getResult('bg'));
        //console.log("Add Title View");
        startB.x = 240;
        startB.y = 160;
        startB.name = 'startB';


        TitleView.addChild(bg, main, startB);
        stage.addChild(TitleView);
        stage.update();

        // Button Listeners

        // startB.onpress = function tweenTitleView(){
        //     console.log("press");
        //     createjs.Tween.get(TitleView).to({y:-320}, 300).call(draw);
        // }
        startB.on("click", function(evt) {
            createjs.Tween.get(TitleView).to({y:-320}, 300).call(draw);
        });
    }
    //
    function draw() {

        //console.log("call draw");
        stage.removeChild(TitleView);
        TitleView = null;
        //ticker
            // createjs.Ticker.addEventListener("tick", handleTick);
            // function handleTick(event) {
            //
            // }

        //

        let criminals = [new createjs.Bitmap(repo.getResult('criminal')),
            new createjs.Bitmap(repo.getResult('m2')),
            new createjs.Bitmap(repo.getResult('m3')),
            new createjs.Bitmap(repo.getResult('m4'))];
        let plane = new createjs.Bitmap(repo.getResult('plane'));
        let exp = new createjs.Bitmap(repo.getResult('explode'));
        //////////////////////////////////////
        // random() run only once?///
        /////////////////////////////////////
        //console.log(theHeight)
        plane.set({x: 10, y: 10});
        stage.addChild(plane);

        function animate(){
            var theHeight = Math.floor((((Math.random() * 5) + 1) * 50));
            criminals[0].set({x: 720, y: theHeight});//x will be replaced to canvas.width
            stage.addChild(criminals[0]);

            createjs.Tween.get(criminals[0])
                .to({x: 280, y: theHeight}, 1000)
                .call(() => {
                    stage.removeChild(criminals[0]);
                    animate();
                });

        }
        animate();


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

    //var t = setInterval(draw, 1500);
    setup();
});