var gameHeight = $(window).height();
var gameWidth = $(window).width();
var boardHeight = 1884;
var boardWidth = 680;
/*const Direction = Object.freeze({LEFT, RIGHT});*/

var gameUI = function () {
    var self = this;
    this.game = undefined;
    this.running = false;
    this.counter = 0;
    this.platforms = [];
    this.platformId = 0;
    this.player = undefined;
    this.height = boardHeight;
    this.globalMoveSpeed = -1;
    this.top = {
        pos: 0,
        name: '',
    }
    var timer = undefined;

    // not using game.js anymore right now
    this.initialize = function () {
        self.top.name = '#playBoard1';
        $('#startScreen').show();
        $('#endScreen').hide();

        $('#startBtn').on('click', function () {
            $('#startBtn').hide();
            $('#startScreen').slideUp();
            setTimeout(self.startGame, 0); //number delays when game starts

        });

        //call to show endscreen and restart
        this.endGame = function () {
            $('#restartBtn').show();
            $('#endScreen').show();
            self.running = false;
        }

        $('#restartBtn').on('click', function () {
            //self.game.reset();
            self.running = true;
            clearInterval(self.timer);
            self.counter = 0;
        });

        // listener for when a key is pressed down
        $('body').keydown(function (e) {
            self.player.handleKeyDown(e);
        });

        // listener for when key is released
        $('body').keyup(function (e) {
            self.player.handleKeyUp(e);
        });

        // gets called every tick
        this.refreshView = function () {
            var top1 = $('#playBoard1').position();
            var top2 = $('#playBoard2').position();

            // update the top pos of the two backgrounds (increment them by -1)
            top1 = this.setBackgroundPos(top1.top);
            top2 = this.setBackgroundPos(top2.top);

            // determines which background to add platforms onto
            if (top1 > -1100 && top1 < 800) {
                self.top.name = '#playBoard1';
                self.top.pos = top1;
            }
            else {
                self.top.name = '#playBoard2';
                self.top.pos = top2;
            }


            $('#playBoard1').css("top", top1);
            $('#playBoard2').css("top", top2);

            //set the player div = to his current x and y
            $('#player').css("left", self.player.xPos + 'px');
            $('#player').css("top", self.player.yPos + 'px');

        } /*end of refreshView*/


        // called every tick (50ms) from setInterval
        this.updateUI = function () {
            // counter gets incremented every tick from the setInterval (50ms right now)
            // after 100 ticks, add a new platform and remove any that are out of view
            if (self.counter % 100 == 0) {
                self.updatePlatforms();
            }

            // update the yPos (internally) of each platform
            // if player is on a platform, its ySpeed gets set to -1 instead of default 2;
            self.player.ySpeed = 3;
            self.platforms.forEach(p => {
                if ((self.player.yPos + self.player.height) - p.yPos <= 3 && (self.player.yPos + self.player.height) - p.yPos >= -3) {
                    let minX = p.xPos - self.player.width;
                    let maxX = p.xPos + p.width;
                    if (self.player.xPos >= minX && self.player.xPos <= maxX) {
                        self.player.ySpeed = self.globalMoveSpeed;
                        self.player.yAccel = 0;
                        self.player.yPos = p.yPos - self.player.height;
                    }
                }
                p.updatePosition();
            })

            self.player.handleAccelTimer();

            // update the y and x internally of the player
            self.player.yPos += self.player.ySpeed + self.player.yAccel;
            self.player.xPos += self.player.xSpeed;



            self.refreshView();

            self.counter += 1;

        }   /*end of updateUI*/

        this.startGame = function () {
            // creates a timer that calls updateUI every 50 ms
            self.timer = setInterval(self.updateUI, 30);
            self.player = new player();
        }

        this.updatePlatforms = function () {
            var newArray = [];

            //check to see if current platforms are still in view, if not then remove
            self.platforms.forEach(platform => {
                if (platform.yPos > -50) {
                    newArray.push(platform);
                }
                else {
                    $('#platform' + platform.id).remove();
                }
            });

            //add a new platform (internally), each platform has a unique id (platformId)
            self.platformId += 1;
            var newPlat = new platform(self.platformId, self.top.pos);
            newArray.push(newPlat);

            //create new div for the platform and append to either board1 or board2 based on which is in view
            var $newPlatform = $("<div id='platform" + self.platformId + "' class='platform'></div>");

            //set the top and left of the newly created div
            $($newPlatform).css("top", newPlat.top);
            $($newPlatform).css("left", newPlat.xPos);

            $(self.top.name).append($newPlatform);

            // set the global platforms array = to the newArray that has removed the out of view platforms and added the new ones
            self.platforms = newArray;

        }



        this.setBackgroundPos = function (curY) {
            if (curY <= -self.height) {
                curY = self.height;
            }
            curY += self.globalMoveSpeed;
            return curY;
        }
    } /*end of initialize*/
    this.initialize();

} /*end of gameUI*/

var platform = function (id, top) {
    var self = this;
    this.speed = 0;
    this.xPos = 0;
    this.yPos = 0;
    this.id = 0;
    this.width = 0;
    this.height = 0;
    this.top = 0;
    this.initialize = function (id, top) {
        self.id = id;
        self.speed = 10;
        // determine where to pos the 'top' css element of the platform
        self.top = 800 - top; 
        // set the starting yPos
        self.yPos = 800;
        self.width = 150;
        self.height = 25;
        // give the platforms a random x pos
        self.xPos = (Math.floor(Math.random() * (boardWidth - self.width)));
    };
    this.positionPlatform = function (x, y) {
        self.xPos = x;
        self.yPos = y;
        self.ySpeed = 2;
    };
    this.setSpeed = function (speed) {
        self.speed = speed;
    };
    this.updatePosition = function () {
        self.yPos -= 1;
    }
    this.initialize(id, top);
} /*end of platform*/

var player = function () {
    var self = this;
    this.isMoving = false;
    this.xPos = 0;
    this.yPos = 0;
    this.xSpeed = 0;
    this.ySpeed = 3;
    this.yAccel = 0;
    this.height = 0;
    this.width = 0;
    this.accelTimer = undefined;
    this.state = 'idle';
    this.prevstate;

    this.initialize = function () {
        self.xPos = 328;
        self.yPos = 32;
        self.height = 32;
        self.width = 32;
        self.createAccelTimer();
    };

    this.setPos = function (x, y) {
        self.xPos = x;
        self.yPos = y;
    };

    this.createAccelTimer = function () {
        self.accelTimer = setInterval(self.updateAccel, 500);
    }

    this.handleAccelTimer = function () {
        if (self.ySpeed >= 2) {
            if (self.accelTimer == undefined) {
                self.createAccelTimer();
            }
        }
        if (self.ySpeed == -1) {
            if (self.accelTimer != undefined) {
                clearInterval(self.accelTimer);
                self.accelTimer = undefined;
            }
        }
    }

    this.updateAccel = function () {
        if (self.yAccel <= 4) {
            self.yAccel += 1;
        }
    }

    //changes state to input string and handles hiding and showing player images
    this.changeState = function(newstate){
        self.prevstate = self.state;
        self.state = newstate;
        $('#'+self.state).css("display", "block");
        $('#'+self.prevstate).css("display", "none");
    }

    // if the player is currently not moving (isMoving): sets the xSpeed of the player as well as isMoving to true
    this.handleKeyDown = function (e) {
        if (self.isMoving) {
            return;
        }
        // left
        if (e.which == 37) {
            self.changeState('runleft');
            self.xSpeed = -5;
        }
        // right
        else if (e.which == 39) {
            self.changeState('runright');
            self.xSpeed = 5;
        }

        self.isMoving = true;
    }

    // when left/right arrow is released, sets the xSpeed back to 0 and isMoving to false;
    this.handleKeyUp = function (e) {
        if (e.which == 37){
            self.xSpeed = 0;
            self.isMoving = false;
            self.changeState('idleleft');
        }else if (e.which == 39) {
            self.xSpeed = 0;
            self.isMoving = false;
            self.changeState('idleright');
        }
    }

    this.initialize();


} /*end of player*/