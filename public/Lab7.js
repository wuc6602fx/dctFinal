$(document).ready(() => { // jQuery main

    let stage = new createjs.Stage(canvas);
    let repo = new createjs.LoadQueue();
    let startB;
    let criminals = [];
    let speedX = [-4, -3, -2];//criminal speed
    let endX = 280;//end line to disappear
    let gameStart = false;
    let police;
    let exp;
    let bullet;
    let shooting = false;
    let kills = 0;//人數
    let isCounted = false;//防止重複計數
    const topBarHeight = 100;
    let isAppear = [1, 1, 1];//0:毒販重生中，打到不會計分，1:計分
    let nextTimeAppear = [0, 0, 0];
    let criminalsAppearFrequency = 50; //毒販生成頻率
    let criminalsAvgSpeed = 2;//毒販走路速度

    //計數器
    var counter = new createjs.Text(new String(kills), "20px Arial", "black"),
        bounds = counter.getBounds();
    counter.x = stage.canvas.width - bounds.width >> 1;

    //計時器


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

        for (let i = 0; i < 3; i++) {
            let criminal = new createjs.Bitmap(repo.getResult('criminal'));
            criminal.set({scaleX: 0.1, scaleY: 0.1});
            criminals.push(criminal);
            //let theHeight = (Math.floor(Math.random() * 100) % 3) * criminal.image.height * criminal.scaleY * 1.4 + topBarHeight;//1.4為毒販間距
            let theHeight = i * criminal.image.height * criminal.scaleY * 1.4 + topBarHeight;//1.4為毒販間距
            criminals[i].set({x: stage.canvas.width, y: theHeight});
        }
        for (let i = 0; i < 3; i++) {
            stage.addChild(criminals[i]);
        }

    }

    function tick() {
        for (let i = 0; i < 3; i++) {
            if (nextTimeAppear[i] === 0) {
                isAppear[i] = 1;
                speedX[i] = -1 * (Math.floor(Math.random() * 10) % 3 + criminalsAvgSpeed);
            }
        }
        if (gameStart) {
            counter.text = kills;
            criminals[0].x += speedX[0];
            criminals[1].x += speedX[1];
            criminals[2].x += speedX[2];
            for (let i = 0; i < 3; i++) {
                if (criminals[i].x < endX) {
                    criminals[i].x = stage.canvas.width;
                }
            }
            //collision detection
            if (shooting) {
                console.log("shooting!");

                for (let i = 0; i < 3; i++) {
                    if (police.y > criminals[i].y - 20 && police.y < criminals[i].y + 85 && isAppear[i] === 1) {// why criminals[0].image.y = 0?
                        console.log("hit!");
                        if (!isCounted) {
                            kills += 1;
                            isCounted = true;
                            isAppear[i] = 0;
                            speedX[i] = 0;
                            nextTimeAppear[i] = ((Math.floor(Math.random() * 10) % 3 + 1) * criminalsAppearFrequency);
                        }
                        criminals[i].x = stage.canvas.width;
                    }
                }
            }
            else {
                if (isCounted) {
                    isCounted = false;
                }
            }
            for (let i = 0; i < 3; i++) {
                nextTimeAppear[i] -= 1;
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
                            //stage.addChild(exp);
                            shooting = false;

                        }).wait(500).call(() => stage.removeChild(exp));
                    stage.addChild(bullet);
                    shooting = true;
                    break;
            }
        });
    }

    setup();
})
;