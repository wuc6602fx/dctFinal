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
            {id: 'm1', src: "images/m1.png"},
            {id: 'm2', src: "images/m2.png"},
            {id: 'm3', src: "images/m3.png"},
            {id: 'm4', src: "images/m4.png"},
            {id: 'plane', src: "images/plane.jpg"},
            {id: 'explode', src: '/images/exp.png'},
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
        createjs.Ticker.addEventListener("tick", handleTick);
        function handleTick(event) {
            
        }

        //

        let mountains = [new createjs.Bitmap(repo.getResult('m1')),
            new createjs.Bitmap(repo.getResult('m2')),
            new createjs.Bitmap(repo.getResult('m3')),
            new createjs.Bitmap(repo.getResult('m4'))];
        let plane = new createjs.Bitmap(repo.getResult('plane'));
        let exp = new createjs.Bitmap(repo.getResult('explode'));
        mountains[0].set({x: 600, y: 150});
        mountains[1].set({x: 600, y: 175});
        mountains[2].set({x: 600, y: 200});
        mountains[3].set({x: 600, y: 225});
        stage.addChild(mountains[0], mountains[1], mountains[2], mountains[3]);
        plane.set({x: 10, y: 10});
        stage.addChild(plane);
        createjs.Tween.get(mountains[0], {loop: true}).to({x: 0, y: 150}, 5000);
        createjs.Tween.get(mountains[1], {loop: true}).to({x: 0, y: 170}, 4500);
        createjs.Tween.get(mountains[2], {loop: true}).to({x: 0, y: 200}, 4000);
        createjs.Tween.get(mountains[3], {loop: true}).to({x: 0, y: 225}, 3500);


        //控制方向
        window.addEventListener('keydown', function (e) {
            switch (e.keyCode) {
                case 38:// up
                    plane.y -= 10;
                    break;
                case 40:// down
                    plane.y += 10;
                    break;
            }
        });

        plane.on('click', e => {
            let dot = new createjs.Shape();
            dot.graphics.beginFill('red').drawCircle(plane.x + plane.image.width, plane.y + plane.image.height / 2, 5);
            createjs.Tween.get(dot)
                .to({x: 600}, 1000)
                .call(() => {
                    stage.removeChild(dot);
                    exp.x = 500;
                    exp.y = plane.y;
                    stage.addChild(exp);

                }).wait(500).call(() => stage.removeChild(exp));
            stage.addChild(dot);
        })
    }

    setup();
});