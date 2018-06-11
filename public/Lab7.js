$(document).ready(() => { // jQuery main

    let stage = new createjs.Stage(canvas);
    let repo = new createjs.LoadQueue();
    let startB;
    let criminals = [];
    let speedX = -1;//criminal speed
    let endX = 280;//end line to disappear
    let gameStart = false;
    let police;
    let exp;
    let bullet;
    let shooting = false;
    let kills = 0;
    let isCounted = false;
    //下居中文字
    var counter = new createjs.Text(new String(kills), "20px Arial", "black"),
        bounds = counter.getBounds();

    counter.x = stage.canvas.width - bounds.width >> 1;
    counter.y = stage.canvas.height - bounds.height;

    function setup() {
        // automatically update
        /*
        createjs.Ticker.on("tick", (e) => {
            stage.update();
        });
        */
        createjs.Ticker.on("tick", tick);
        createjs.Ticker.framerate = 60;
        // load assets
        repo.loadManifest([
            {id: 'criminal', src: "images/drugs_man.png"},//criminals
            {id: 'm2', src: "images/m2.png"},//man
            {id: 'm3', src: "images/m3.png"},
            {id: 'm4', src: "images/m4.png"},
            {id: 'police', src: "images/police.png"},//police
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
        startB.on("click", function (event) {

            createjs.Tween.get(TitleView).to({y: -320}, 300).call(draw);

        });
    }

    function createCriminals() {

        for (let i = 0; i < 5; i++) {
            let criminal = new createjs.Bitmap(repo.getResult('criminal'));
            criminal.set({scaleX: 0.1, scaleY: 0.1});
            criminals.push(criminal);
        }
        let theHeight = Math.floor(Math.random() * 200);
        criminals[0].set({x: stage.canvas.width, y: theHeight});
        stage.addChild(criminals[0]);

    }

    function tick() {
        if (gameStart) {
            counter.text = kills;
            criminals[0].x += speedX;
            if (criminals[0].x < endX) {
                criminals[0].x = stage.canvas.width;
            }
            if (shooting) {
                console.log("shooting!");
                console.log(criminals[0].y + " " + criminals[0].image);
                if (police.y > criminals[0].y - 20 && police.y < criminals[0].y + 85) {// why criminals[0].image.y = 0?
                    console.log("hit!");
                    if (!isCounted) {
                        kills += 1;
                        isCounted = true;
                    }
                    criminals[0].x = stage.canvas.width;

                }
            }
            else {
                if (isCounted) {
                    isCounted = false;
                }

            }
        }

        stage.update();
    }


    function draw() {

        //console.log("call draw");
        stage.removeChild(TitleView);
        TitleView = null;
        //ticker
        // createjs.Ticker.addEventListener("tick", handleTick);
        // function handleTick(event) {
        //
        // }
        stage.addChild(counter);
        police = new createjs.Bitmap(repo.getResult('police'));
        exp = new createjs.Bitmap(repo.getResult('explode'));

        //resize image
        police.set({scaleX: 0.1, scaleY: 0.1});
        exp.set({scaleX: 0.5, scaleY: 0.5});


        police.set({x: 10, y: 10});
        stage.addChild(police);
        createCriminals();

        gameStart = true;
        //控制方向
        window.addEventListener('keydown', function (e) {
            switch (e.keyCode) {
                case 38:// up
                    police.y -= 10;
                    break;
                case 40:// down
                    police.y += 10;
                    break;
                case 32:
                    bullet = new createjs.Shape();
                    bullet.graphics.beginFill('black').drawCircle(police.x + (police.image.width) * police.scaleX + 10, police.y + (police.image.height) * police.scaleY / 6, 2);
                    createjs.Tween.get(bullet)
                        .to({x: stage.canvas.width}, 100)
                        .call(() => {
                            stage.removeChild(bullet);
                            exp.x = 500;
                            exp.y = police.y;
                            stage.addChild(exp);
                            shooting = false;

                        }).wait(500).call(() => stage.removeChild(exp));
                    stage.addChild(bullet);
                    shooting = true;
                    break;
            }
        });
    }

    setup();
});