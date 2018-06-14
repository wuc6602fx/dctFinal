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
    let nextTimeAppear = [1, 1, 1];
    let criminalsAppearFrequency = 50; //毒販生成頻率
    let criminalsAvgSpeed = 2;//毒販走路速度
    let backgroundPlaying;
    let backgroundBuilding;
    let criminal;
    let tickTimes = 0;  //tick總次數
    let totalTime = 0;
    let hourglass;
    let boy;
    let girl;
    let beforeGameTime = 0;
    let isCriminal = [1, 1, 1];
    let volumeOfBgm = 0.3;//0~1


    //計數器
    let counter = new createjs.Text(new String(kills), "20px Arial", "black");
    let bounds = counter.getBounds();
    counter.x = stage.canvas.width - bounds.width >> 1;
    counter.y = 10;
    counter.scale = 1.5;

    //計時器
    let timer = new createjs.Text(new String(totalTime), "20px Arial", "black");
    timer.x = stage.canvas.width - bounds.width >> 1;
    timer.y = 10;
    timer.scale = 1.5;

    //播放背景音樂
    createjs.Sound.registerSound({src: "/images/bgmusic.mp3", id: "sound"});
    var props = new createjs.PlayPropsConfig().set({
        interrupt: createjs.Sound.INTERRUPT_ANY,
        loop: -1,
        volume: volumeOfBgm
    })
    createjs.Sound.addEventListener("fileload", () => createjs.Sound.play("sound", props));


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
            {id: 'passbyBoy', src: '/images/stranger_boy.png'},
            {id: 'passbyGirl', src: '/images/stranger_girl.png'},
            {id: 'score', src: '/images/score.png'},
            //{id: 'bgMusic', src: '/images/bgmusic.mp3'},
            //{id: 'shootMusic', src: '/images/shoot.mp3'},
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
            criminal.set({scaleX: 0.13, scaleY: 0.15});
            criminals.push(criminal);
            let theHeight = i * criminal.image.height * criminal.scaleY * 1.1 + topBarHeight;//1.4為毒販間距
            criminals[i].set({x: stage.canvas.width, y: theHeight});
        }
        for (let i = 0; i < 3; i++) {
            stage.addChild(criminals[i]);
        }
    }

    function changeCriminal(change, i) {
        if (change === 0) {//change to boy
            criminals[i].image = boy.image;
            criminals[i].set({scaleX: 0.09, scaleY: 0.08});
            console.log("Change to boy.");
        }
        else if (change === 1) {//change to girl
            criminals[i].image = girl.image;
            criminals[i].set({scaleX: 0.17, scaleY: 0.15});
            console.log("Change to girl.");
        }
        else if (change === 2) {//change to criminal
            criminals[i].image = criminal.image;
            criminals[i].set({scaleX: 0.13, scaleY: 0.15});
            console.log("Change to criminal.");
        }
        else {
        }
    }

    function tick() {//update every second   //call 60 times per second

        //time's up, game over, move to finalScreen
        tickTimes += 1;
        //console.log(tickTimes);
        stage.removeChild(timer);
        if (gameStart) {
            //遊戲剩餘秒數
            totalTime = 60 + beforeGameTime - Math.floor(createjs.Ticker.getTime() / 1000);
            if (totalTime === 0) {
                createjs.Ticker.off("tick", tick);
                createjs.Tween.get(nothing).to({y: -320}, 300).call(moveToFinalScreen());
            }
            if (totalTime <= 9) {//顯示0:0X
                timer.text = "0:0" + String(totalTime);
            } else {//顯示0:XX
                timer.text = "0:" + String(totalTime);
            }
            timer.x = 900;
            stage.addChild(timer);


            for (let i = 0; i < 3; i++) {//重生時間到
                if (nextTimeAppear[i] === 0) {
                    isAppear[i] = 1;
                    speedX[i] = -1 * (Math.floor(Math.random() * 100) % 3 + criminalsAvgSpeed);
                }
            }

            //更換路人
            if (nextTimeAppear[0] > 0) {
                if (isCriminal[0] === 1) {
                    if (totalTime % 9 === 1) {
                        changeCriminal(0, 0);
                        isCriminal[0] = 0;
                    }
                    if (totalTime % 17 === 1) {
                        changeCriminal(1, 0);
                        isCriminal[0] = 0;
                    }
                }
            }
            if (nextTimeAppear[1] > 0) {
                if (isCriminal[1] === 1) {
                    if (totalTime % 29 === 1) {
                        changeCriminal(0, 1);
                        isCriminal[1] = 0;
                    }
                    if (totalTime % 11 === 1) {
                        changeCriminal(1, 1);
                        isCriminal[1] = 0;
                    }
                }
            }
            /*(有圖片size改變的Bug)
            if (nextTimeAppear[2] > 0) {
                if (isCriminal[2] === 1) {
                    if (totalTime % 23 === 1) {
                        changeCriminal(0, 2);
                        isCriminal[2] = 0;
                    }
                }
            }
            */

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
                //console.log("shooting!");

                for (let i = 0; i < 3; i++) {
                    if (police.y > criminals[i].y - 20 && police.y < criminals[i].y + 100 && isAppear[i] === 1) {
                        //console.log("hit!");
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
                        if (isCriminal[i] === 0) {//如果不是毒販則變回毒販
                            changeCriminal(2, i);
                            isCriminal[i] = 1;
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

        boy = new createjs.Bitmap(repo.getResult('passbyBoy'));
        girl = new createjs.Bitmap(repo.getResult('passbyGirl'));

        backgroundPlaying = new createjs.Bitmap(repo.getResult('backgroundPlaying'));
        backgroundBuilding = new createjs.Bitmap(repo.getResult('backgroundBuilding'));
        police = new createjs.Bitmap(repo.getResult('police'));
        exp = new createjs.Bitmap(repo.getResult('explode'));
        score = new createjs.Bitmap(repo.getResult('score'));
        hourglass = new createjs.Bitmap(repo.getResult('hourglass'));
        //resize image
        police.set({scaleX: 0.15, scaleY: 0.15});
        exp.set({scaleX: 0.5, scaleY: 0.5});
        backgroundBuilding.set({x: stage.canvas.width, y: 30, scaleX: 1.1, scaleY: 0.5});
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

        beforeGameTime = Math.floor(createjs.Ticker.getTime() / 1000);
        stage.removeChild(TeachView);
        TeachView = null;
        gameStart = true;
        //createjs.Ticker.on("tick", tick);  //for test
        //createjs.Ticker.framerate = 60;

        createCriminals();

        createjs.Tween.get(backgroundBuilding, {loop: true}).to({x: -1 * backgroundBuilding.image.width}, 6000);
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
                    //播放槍擊聲
                    //第一發沒有聲音，但把載入移到前面會重複播放bgm
                    createjs.Sound.registerSound({src: "/images/shoot.mp3", id: "sound2"});
                    createjs.Sound.play("sound2");

                    bullet = new createjs.Shape();
                    bullet.graphics.beginFill('silver').drawCircle(police.x + (police.image.width) * police.scaleX + 10, police.y + (police.image.height) * police.scaleY / 6, 2);
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
        gameStart = false;
        stage.removeAllChildren();
        stage.update();

        let bg = new createjs.Bitmap(repo.getResult('bg'));
        finalView.addChild(bg);
        stage.addChild(finalView);
        stage.update();
    }

    setup();
});