$(document).ready(() => { // jQuery main

    let stage = new createjs.Stage(canvas);
    let repo = new createjs.LoadQueue();
    let TitleView = new createjs.Container();
    let TeachView = new createjs.Container();
    let nothing = new createjs.Container();//Redundant object, used in tick(), in order to change to finalView
    let finalView = new createjs.Container();
    let startB;
    let criminals = [];
    let speedX = [-4, -3, -2];//criminal speed
    let endX = 280;//end line to disappear
    let gameStart = false;
    let police;
    let exp;
    let score;
    let bullet;
    let shooting = false;
    let kills = 0;//人數
    let isCounted = false;//防止重複計數
    const topBarHeight = 250;
    let isAppear = [1, 1, 1];//0:毒販重生中，打到不會計分，1:計分
    let nextTimeAppear = [0, 0, 0];
    let criminalsAppearFrequency = 50; //毒販生成頻率
    let criminalsAvgSpeed = 2;//毒販走路速度
    let backgroundPlaying;
    let backgroundBuilding;
    let isPassbyAppear = false;
    let criminal;
    let tickTimes = 0;  //tick總次數
    let totalTime = 0;
    let hourglass;

    //計數器
    let counter = new createjs.Text(new String(kills), "20px Arial", "black");
    let bounds = counter.getBounds();
    counter.x = stage.canvas.width - bounds.width >> 1;
    counter.y = 10
    counter.scale = 1.5;

    //計時器
    let timer = new createjs.Text(new String(totalTime), "20px Arial", "black");
    timer.x = stage.canvas.width - bounds.width >> 1;
    timer.y = 10
    timer.scale = 1.5;

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
            {id: 'bg', src: '/images/bg.jpg'},
            {id: 'backgroundPlaying', src: '/images/background_playing.png'},
            {id: 'backgroundBuilding', src: '/images/background_house.png'},
            {id: 'passby', src: '/images/stranger_girl.png'},
            {id: 'score', src: '/images/score.png'},
            {id: 'hourglass', src: '/images/time.png'}
        ]);
        repo.on('complete', addTitleView);
    }


    //addTitleView()


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
        //     createjs.Tween.get(TitleView).to({y:-320}, 300).call(drawGame);
        // }
        startB.on("click", function (event) {
            createjs.Tween.get(TitleView).to({y: -320}, 300).call(drawGame);
        });
    }

    function createCriminals() {

        for (let i = 0; i < 3; i++) {
            criminal = new createjs.Bitmap(repo.getResult('criminal'));
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

    function tick() {//update every second   //call 60 times per second

        //time's up, game over, move to finalScreen
        tickTimes += 1;
        //console.log(tickTimes);


        //if (tickTimes === 800) {   //600加上多遊戲介紹時間，最好要從gameStart後開始算時間
        //createjs.Ticker.off("tick", tick);
        //createjs.Tween.get(nothing).to({y: -320}, 300).call(moveToFinalScreen());


        if (gameStart) {
            //遊戲剩餘秒數
            totalTime = 62 - Math.floor(createjs.Ticker.getTime() / 1000);
            timer.text = String(totalTime);
            timer.x = 900;
            stage.addChild(timer);

            for (let i = 0; i < 3; i++) {
                if (nextTimeAppear[i] === 0) {//重生時間到
                    isAppear[i] = 1;
                    speedX[i] = -1 * (Math.floor(Math.random() * 10) % 3 + criminalsAvgSpeed);
                }
            }
            //createjs.Tween.get(backgroundBuilding, {loop: true}).to({x: 0}, 3000);
            counter.text = kills;
            criminals[0].x += speedX[0];
            criminals[1].x += speedX[1];
            criminals[2].x += speedX[2];
            for (let i = 0; i < 3; i++) {
                if (criminals[i].x < endX) {
                    kills -= 1;
                    criminals[i].x = stage.canvas.width;
                }
            }
            //collision detection
            if (shooting) {
                console.log("shooting!");

                for (let i = 0; i < 3; i++) {
                    if (police.y > criminals[i].y - 20 && police.y < criminals[i].y + 85 && isAppear[i] === 1) {// why criminals[0].image.y = 0?
                        console.log("hit!");
                        exp.x = criminals[i].x;
                        exp.y = criminals[i].y;
                        stage.addChild(exp);
                        if (!isCounted) {
                            kills += 1;
                            isCounted = true;
                            isAppear[i] = 0;
                            speedX[i] = 0;
                            nextTimeAppear[i] = ((Math.floor(Math.random() * 10) % 3 + 1) * criminalsAppearFrequency);
                        }

                        criminals[i].x = stage.canvas.width;
                        if (isPassbyAppear) {
                            criminals[0] = criminal;
                            criminals[1] = criminal;
                            criminals[2] = criminal;
                            isPassbyAppear = false;
                        }
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
        //}
    }


    function drawGame() {

        //console.log("call drawGame");
        stage.removeChild(TitleView);
        TitleView = null;
        //ticker
        // createjs.Ticker.addEventListener("tick", handleTick);
        // function handleTick(event) {
        //
        // }


        backgroundPlaying = new createjs.Bitmap(repo.getResult('backgroundPlaying'));
        backgroundBuilding = new createjs.Bitmap(repo.getResult('backgroundBuilding'));
        police = new createjs.Bitmap(repo.getResult('police'));
        exp = new createjs.Bitmap(repo.getResult('explode'));
        score = new createjs.Bitmap(repo.getResult('score'));
        hourglass = new createjs.Bitmap(repo.getResult('hourglass'));
        //resize image
        police.set({scaleX: 0.1, scaleY: 0.1});
        exp.set({scaleX: 0.5, scaleY: 0.5});
        backgroundBuilding.set({x: stage.canvas.width, y: 30, scaleX: 0.5, scaleY: 0.5});
        backgroundPlaying.set({x: 0, y: 0});
        stage.addChild(backgroundPlaying);
        stage.addChild(backgroundBuilding);
        stage.addChild(counter);
        police.set({x: 10, y: topBarHeight});
        score.x = 580;
        score.scale = 0.2;
        hourglass.x = 850;
        hourglass.scale = 0.2;
        stage.addChild(police);
        stage.addChild(score);
        stage.addChild(hourglass);
        //createCriminals();
        teachTheGame();

    }

    function teachTheGame() {
        startB = new createjs.Bitmap(repo.getResult('startB'));
        //let main = new createjs.Bitmap(repo.getResult('main'));
        let bg = new createjs.Bitmap(repo.getResult('bg'));
        bg.set({x: bg.image.width / 4, y: bg.image.height / 4, scaleX: 0.5, scaleY: 0.5});

        startB.set({
            x: bg.image.width / 4 + startB.image.width / 4,
            y: bg.image.height / 4 + startB.image.height / 4,
            scaleX: 0.5,
            scaleY: 0.5
        });
        startB.name = 'startB';


        TeachView.addChild(bg, startB);
        stage.addChild(TeachView);
        stage.update();
        startB.on("click", function (event) {
            createjs.Tween.get(TeachView).to({y: -320}, 300).call(startTheGame());
            //startTheGame();
        });
    }

    function startTheGame() {
        stage.removeChild(TeachView);
        TeachView = null;
        gameStart = true;
        //createjs.Ticker.on("tick", tick);  //for test
        //createjs.Ticker.framerate = 60;
        createCriminals();
        createjs.Tween.get(backgroundBuilding, {loop: true}).to({x: -1 * backgroundBuilding.image.width / 2}, 6000);
        //控制方向
        window.addEventListener('keydown', function (e) {
            switch (e.keyCode) {
                case 38:// up
                    if (police.y > topBarHeight - 50) {
                        police.y -= 10;
                    }
                    break;
                case 40:// down
                    if (police.y < 600) {
                        police.y += 10;
                    }
                    break;
                case 32:
                    bullet = new createjs.Shape();
                    bullet.graphics.beginFill('black').drawCircle(police.x + (police.image.width) * police.scaleX + 10, police.y + (police.image.height) * police.scaleY / 6, 2);
                    createjs.Tween.get(bullet)
                        .to({x: stage.canvas.width}, 100)
                        .call(() => {
                            stage.removeChild(bullet);
                            //exp.x = 500;
                            //exp.y = police.y;
                            //stage.addChild(exp);
                            shooting = false;

                        }).wait(500).call(() => stage.removeChild(exp));
                    stage.addChild(bullet);
                    shooting = true;
                    break;
            }
        });
    }

    function moveToFinalScreen() {
        stage.removeAllChildren();
        stage.update();

        let bg = new createjs.Bitmap(repo.getResult('bg'));
        finalView.addChild(bg);
        stage.addChild(finalView);
        stage.update();
    }

    setup();
});