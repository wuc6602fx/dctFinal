$(document).ready(() => { // jQuery main

    let stage = new createjs.Stage(canvas);
    let repo = new createjs.LoadQueue();
    let TitleView = new createjs.Container();
    let TeachView = new createjs.Container();
    let nothing = new createjs.Container();//Redundant object, used in tick(), in order to change to finalView
    let finalView = new createjs.Container();
    let startA;
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
    let volumeOfBgm = 1;//0~1
    let teachStart = false;
    let gamingTime = 60;
    let twArray = [];
    let numOfTW = 0;


    //let startMusic = new Audio('/images/startmusic.mp3');
    //startMusic.loop = true;
    let playingMusic = new Audio('/images/bgmusic.mp3');
    playingMusic.time = -2;
    playingMusic.loop = false;
    let endMusic = new Audio('/images/endmusic.mp3');
    endMusic.loop = true;

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

    //播放開始音樂
    createjs.Sound.registerSound({src: "/images/startmusic.mp3", id: "sound"});
    var props = new createjs.PlayPropsConfig().set({//循環播放音樂
        interrupt: createjs.Sound.INTERRUPT_ANY,
        loop: -1,
        volume: volumeOfBgm
    })
    createjs.Sound.addEventListener("fileload", () => createjs.Sound.play("sound", props));//load完開始播放

    function setup() {
        // automatically update
        createjs.Ticker.on("tick", tick);
        //fps = 60
        createjs.Ticker.framerate = 60;
        //endMusic.pause();
        //startMusic.play();

        // load assets
        repo.loadManifest([
            {id: 'criminal', src: "images/drugs_man.png"},//criminals
            {id: 'police', src: "images/police.png"},//police
            {id: 'explode', src: '/images/blood.png'},//bullet explode
            {id: 'startA', src: '/images/teach_icon.png'},//遊戲教學按鈕
            {id: 'startB', src: '/images/game_icon.png'},//遊戲開始按鈕
            {id: 'main', src: '/images/open_new1.png'},//封面圖案
            {id: 'bg', src: '/images/bg.jpg'},
            {id: 'backgroundPlaying', src: '/images/background_playing.png'},//遊戲畫面背景
            {id: 'backgroundBuilding', src: '/images/background_house.png'},//遊戲畫面建築物
            {id: 'passbyBoy', src: '/images/stranger_boy.png'},//男孩
            {id: 'passbyGirl', src: '/images/stranger_girl.png'},//女孩
            {id: 'score', src: '/images/score.png'},//擊殺數圖案
            {id: 'teachBg', src: '/images/opening_back_OK.png'},//教學背景
            {id: 'rule', src: '/images/rule.png'},//規則介紹
            {id: 'story', src: '/images/story.png'},//背景故事
            {id: 'hourglass', src: '/images/time.png'},//計時沙漏
            {id: 'policeLast', src: '/images/police_last.png'},//獲獎畫面警察
            {id: 'no1', src: '/images/no1.png'},//NO.1獎盃
            {id: 'seeTW', src: '/images/TW.png'},//看台灣按鈕
            {id: 'tw1', src: '/images/tw_cut1.png'},
            {id: 'tw2', src: '/images/tw_cut2.png'},
            {id: 'tw3', src: '/images/tw_cut3.png'},
            {id: 'repeat', src: '/images/repeat.png'},//在玩一次按鈕
            {id: 'ending1', src: '/images/ending1.png'},
            {id: 'ending2', src: '/images/ending2.png'},
            {id: 'tw_cut1', src: '/images/tw_cut1.png'},
            {id: 'tw_cut2', src: '/images/tw_cut2.png'},
            {id: 'tw_cut3', src: '/images/tw_cut3.png'}

        ]);
        repo.on('complete', addTitleView);//全部載入後進入封面畫面
    }


    /***********************************************
     *  封面畫面繪圖函式
     *
     **************************************************/
    function addTitleView() {
        startB = new createjs.Bitmap(repo.getResult('startB'));//載入遊戲開始圖案
        startB.set({
            x: stage.canvas.width / 2 - 150,
            y: stage.canvas.height * 0.75,
            scaleX: 0.30,
            scaleY: 0.30
        });
        let main = new createjs.Bitmap(repo.getResult('main'));
        main.set({scaleX: 0.18, scaleY: 0.18, x: stage.canvas.width / 4, y: 50});
        let bg = new createjs.Bitmap(repo.getResult('teachBg'));

        let story = new createjs.Bitmap(repo.getResult('story'));
        story.set({x: stage.canvas.width / 32 + 10, y: stage.canvas.height / 32, scaleX: 0.5, scaleY: 0.5});


        TitleView.addChild(bg, main, startB);
        stage.addChild(TitleView);
        stage.update();

        // Button Listeners

        // startB.onpress = function tweenTitleView(){
        //     console.log("press");
        //     createjs.Tween.get(TitleView).to({y:-320}, 300).call(drawGame);
        // }
        startB.on("click", function (event) {
            createjs.Tween.get(main).to({y: -800}, 600, createjs.Ease.quadInOut).call(drawGame);
        });
    }

    /**********************
     *  製造囚犯的函式
     *
     *********************/
    function createCriminals() {
        for (let i = 0; i < 3; i++) {
            criminal = new createjs.Bitmap(repo.getResult('criminal'));
            criminal.set({scaleX: 0.13, scaleY: 0.15});
            criminals.push(criminal);
            //遊戲中毒販有三個路，theHeight為第一列高度*(1~3)+上下路間距
            let theHeight = i * criminal.image.height * criminal.scaleY * 1.1 + topBarHeight;//1.1為毒販間距
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
        if (teachStart) {
            if (stage.mouseX > startA.x && stage.mouseY > startA.y) {
                startA.color = 1;
            } else {
                startA.alpha = 0.9;
            }
        }

        if (stage.mouseX > startB.x && stage.mouseY > startB.y) {
            startB.alpha = 1;
        } else {
            startB.alpha = 0.9;
        }

        if (gameStart) {
            //遊戲剩餘秒數
            totalTime = gamingTime + beforeGameTime - Math.floor(createjs.Ticker.getTime() / 1000);
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
        exp.set({scaleX: 0.1, scaleY: 0.1});
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
        let bg = new createjs.Bitmap(repo.getResult('teachBg'));
        bg.set({x: 0, y: 0, scaleX: 1, scaleY: 1});

        let story = new createjs.Bitmap(repo.getResult('story'));
        story.set({x: stage.canvas.width / 32 + 10, y: stage.canvas.height / 32, scaleX: 0.5, scaleY: 0.5});

        let rule = new createjs.Bitmap(repo.getResult('rule'));
        rule.set({x: stage.canvas.width / 32 + 20, y: stage.canvas.height / 32, scaleX: 0.49, scaleY: 0.49});

        startB.set({
            x: stage.canvas.width / 2 - 100,
            y: stage.canvas.height * 0.75,
            scaleX: 0.2,
            scaleY: 0.2,
            name: 'startB'
        });

        startA = new createjs.Bitmap(repo.getResult('startA'));
        startA.set({
            x: stage.canvas.width / 2 - 100,
            y: stage.canvas.height * 0.75,
            scaleX: 0.2,
            scaleY: 0.2,
            name: 'startA'
        });

        teachStart = true;
        TeachView.addChild(bg, rule, story, startA);
        stage.addChild(TeachView);
        stage.update();
        startA.on("click", function (event) {
            createjs.Tween.get(story).to({y: -800}, 500).call(() => {
                TeachView.addChild(startB)
            });
        });
        startB.on("click", function (event) {
            teachStart = false;
            createjs.Tween.get(TeachView).to({y: -800}, 500).call(startTheGame());
            //startTheGame();
        });
    }

    function startTheGame() {
        //startMusic.pause();
        createjs.Sound.stop("sound", props);
        playingMusic.play();
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
                        police.y -= 20;
                    }
                    break;
                case 40:// down
                    if (police.y < 600) {
                        police.y += 20;
                    }
                    break;
                case 32:
                    //播放槍擊聲
                    //第一發沒有聲音，但把載入移到前面會重複播放bgm
                    //createjs.Sound.registerSound({src: "/images/shoot.mp3", id: "sound2"});
                    //createjs.Sound.play("sound2");
                    var shoot = new Audio('/images/shoot.mp3');
                    shoot.play();

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
        playingMusic.pause();
        endMusic.play();
        stage.removeAllChildren();
        stage.update();

        let ending1 = new createjs.Bitmap(repo.getResult('ending1'));
        let ending2 = new createjs.Bitmap(repo.getResult('ending2'));
        let police = new createjs.Bitmap(repo.getResult('policeLast'));
        let seeTW = new createjs.Bitmap(repo.getResult('seeTW'));
        police.set({x: 0, y: 0, scaleX: 0.5, scaleY: 0.5});
        let no1 = new createjs.Bitmap(repo.getResult('no1'));
        no1.set({x: 300, y: 300});
        let tw_cut1 = new createjs.Bitmap(repo.getResult('tw_cut1'));
        let tw_cut2 = new createjs.Bitmap(repo.getResult('tw_cut2'));
        let tw_cut3 = new createjs.Bitmap(repo.getResult('tw_cut3'));
        tw_cut1.set({x: 0, y: 0, scaleX: 0.75, scaleY: 0.75});
        tw_cut2.set({x: 0, y: 0, scaleX: 0.75, scaleY: 0.75});
        tw_cut3.set({x: 0, y: 0, scaleX: 0.75, scaleY: 0.75});
        twArray[0] = tw_cut1;
        twArray[1] = tw_cut2;
        twArray[2] = tw_cut3;
        //counter.x = stage.canvas.width - bounds.width >> 1;
        //counter.y = 10;
        counter.color = "white";
        counter.x = 370;
        counter.y = 156;
        counter.scale = 3.0;

        ending1.set({x: 0, y: 0, scaleX: 0.75, scaleY: 0.75});
        ending2.set({x: 0, y: 0, scaleX: 0.75, scaleY: 0.75});
        if(kills >= 40){
            stage.addChild(ending1);
        }
        else {
            stage.addChild(ending2);
        }
        seeTW.set({x: 750, y: 490, scaleX: 0.6, scaleY: 0.6});
        stage.addChild(seeTW);
        stage.addChild(counter);
        stage.addChild(finalView);

        seeTW.on("click", function (event) {
            //createjs.setInterval = function(fn, ) {
            //    createjs.Tween.get().wait(333).call(fn).loop = 1;
            //}
            //fn();
            //createjs.setInterval(() => fn, 1000);
            stage.removeAllChildren();
            stage.addChild(twArray[0]);
            setInterval(function(){
                    stage.removeAllChildren();
                    stage.addChild(twArray[(numOfTW += 1) % 3]);
                    stage.update();
                    }
                ,1000);
        });

        stage.update();
    }
    setup();
});