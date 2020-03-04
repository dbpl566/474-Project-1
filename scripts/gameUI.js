var gameUI = function () {
    var self = this;
    this.game = undefined;
    this.running = false;
    this.counter = 0;
    this.platforms = [];
    this.platformId = 0;
    this.top = {
        pos: 0,
        name: '',
    }
    var timer = undefined;

    this.initialize = function () {
        //self.game = new game();
        self.top.name = '#playBoard1';
        $('#GameStopped').show();
        $('#GameRunning').hide();

        $('#StartBtn').on('click', function () {
            $('#GameStopped').hide();
            $('#GameRunning').show();
            self.running = true;
            self.startGame();
        });
        $('#StopBtn').on('click', function () {
            $('#GameStopped').show();
            $('#GameRunning').hide();
            self.running = false;
            //self.game.reset();
            clearInterval(self.timer);
            self.counter = 0;
        });

        this.refreshView = function () {
            var top1 = $('#playBoard1').position();
            var top2 = $('#playBoard2').position();

            top1 = this.setBackgroundPos(top1.top);
            top2 = this.setBackgroundPos(top2.top);

            if (top1 > -1100 && top1 < 700) {
                self.top.name = '#playBoard1';
                self.top.pos = top1;
            }
            else {
                self.top.name = '#playBoard2';
                self.top.pos = top2;
            }


            $('#playBoard1').css("top", top1);
            $('#playBoard2').css("top", top2);
        };
        this.updateUI = function () {
            //var result = self.game.update(counter);

            if (self.counter % 100 == 0) {
                self.updatePlatforms();
            }

            self.platforms.forEach(p => {
                p.yPos -= 1;
            })

            self.refreshView();
            self.counter += 1;

        }

        this.startGame = function () {
            self.timer = setInterval(self.updateUI, 50)
        }

        this.updatePlatforms = function () {
            var newArray = [];

            //check to see if current platforms are still in view, if not remove
            self.platforms.forEach(platform => {
                if (platform.yPos > -50) {
                    newArray.push(platform);
                }
                else {
                    $('#platform' + platform.id).remove();
                }
            });

            //add a new platform
            self.platformId += 1;
            var newPlat = new platform(self.platformId, self.top.pos);
            newArray.push(newPlat);

            //create new div and append to either board1 or board2
            var $newPlatform = $("<div id='platform" + self.platformId + "' class='platform'></div>");

            $($newPlatform).css("top", newPlat.yPos);
            $($newPlatform).css("left", newPlat.xPos);

            $(self.top.name).append($newPlatform);


            self.platforms = newArray;
        }



        this.setBackgroundPos = function (curY) {
            if (curY <= -1884) {
                curY = 1884;
            }
            curY -= 1;
            return curY;
        }
    }
    this.initialize();
}

var platform = function (id, top) {
    var self = this;
    this.speed = 0;
    this.xPos = 0;
    this.yPos = 0;
    this.id = 0;
    this.initialize = function (id, top) {
        self.id = id;
        self.speed = 10;
        self.xPos = (Math.floor(Math.random() * 530));
        self.yPos = 700 - top;
    };
    this.positionPlatform = function (x, y) {
        self.xPos = x;
        self.yPos = y;
    };
    this.setSpeed = function (speed) {
        self.speed = speed;
    };
    this.updatePosition = function () {
        self.yPos -= 1;
    }
    this.initialize(id, top);
}