var gameHeight = $(window).height();
var gameWidth = $(window).width();
var boardHeight = 1884;
var boardWidth = 680;
/*const Direction = Object.freeze({LEFT, RIGHT});*/

var gameUI = function () {
    var self = this;
    this.game = undefined;
    this.running = false;
    this.score = 0;
    this.counter = 0;
    this.platforms = [];
    this.rocks = [];
    this.platformId = 0;
    this.player = undefined;
    this.height = boardHeight;
    this.globalMoveSpeed = -2;
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
        $('#scoreBoard').hide();
        $('#player').hide();

        $('#startBtn').on('click', function () {
            $('#startBtn').hide();
            $('#startScreen').hide();
            $('#scoreBoard').show();
            $('#player').show();
            setTimeout(self.startGame, 0); //number delays when game starts
            self.running = true;
        });

        //call to show endscreen and restart
        this.endGame = function () {
            self.player.changeState("hit");
            $('#restartBtn').show();
            $('#endScreen').show();
            $('#scoreBoard').hide();
            document.getElementById("endText").innerHTML = "SCORE<br>" + self.score;
            self.running = false;
        }

        $('#restartBtn').on('click', function () {
            self.player.changeState("idleright");
            $('#restartBtn').hide();
            $('#endScreen').hide();
            $('#scoreBoard').show();
            self.score = 0;
            clearInterval(self.timer);
            self.counter = 0;
            self.platforms.forEach(platform => {
                $('#platform' + platform.id).remove();
            });
            self.platforms = []; //must occur after for
            self.rocks.forEach(r => {
                $('#rock' + r.id).remove();
            })
            self.rocks = [];
            self.running = true;
            $('#playBoard1').css("top", 0);
            $('#playBoard2').css("top", 1884);
            self.top.name = '#playBoard1';
            self.top.pos = 0;
            self.startPlatforms();
            setTimeout(self.startGame, 0);
        });

        // listener for when a key is pressed down
        $('body').keydown(function (e) {
            if(self.running == true){
                self.player.handleKeyDown(e);
            }
        });

        // listener for when key is released
        $('body').keyup(function (e) {
            if(self.running == true){
                self.player.handleKeyUp(e);
            }
        });

        // gets called every tick
        this.refreshView = function () {
            document.getElementById("score").innerHTML = "SCORE:<br>" + self.score;
            var top1 = $('#playBoard1').position();
            var top2 = $('#playBoard2').position();

            // update the top pos of the two backgrounds (increment them by -1)
            top1 = this.setBackgroundPos(top1.top);
            top2 = this.setBackgroundPos(top2.top);

            // determines which background to add platforms onto
            if (top1 > -1000 && top1 < 800) {
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


        // called every tick (50ms) from setInterval if game is running 
        this.updateUI = function () {
            if (self.running == true) {
                if ((self.player.yPos + self.player.height < 0) || (self.player.yPos > gameHeight)) {
                    self.endGame();
                }
                // counter gets incremented every tick from the setInterval (50ms right now)
                // after 90 ticks, add a new platform and remove any that are out of view
                if (self.counter % 90 == 0 && self.counter >= 90) {
                    self.updatePlatforms();
                }
                //every 100 secs add 10 to score, remainder = 99 to start score from 0
                if (self.counter % 100 == 99) {
                    self.score += 10;
                }
                // update the yPos (internally) of each platform
                // if player is on a platform, its ySpeed gets set to -1 instead of default 2;
                // player offset by 10 px cause body in image smaller than width
                self.player.ySpeed = 3;
                self.platforms.forEach(p => {
                    if ((self.player.yPos + self.player.height) - p.yPos <= 4 && (self.player.yPos + self.player.height) - p.yPos >= -4) {
                        let minX = p.xPos - self.player.width;
                        let maxX = p.xPos + p.width + self.player.width;
                        let playerMinX = self.player.xPos - 10;
                        let playerMaxX = self.player.xPos + self.player.width + 10;
                        if (playerMinX >= minX && playerMaxX <= maxX) {
                            self.player.ySpeed = self.globalMoveSpeed;
                            self.player.yAccel = 0;
                            self.player.yPos = p.yPos - self.player.height;
                            if (p.type == 'platformDecay' && !p.isDecay) {
                                p.startDecay();
                            }
                        }
                    }
                    p.updatePosition();
                });

                var endGame = false;
                self.rocks.forEach(r => {
                    if (self.player.yPos - (r.yPos + r.height) <= 3 && self.player.yPos - (r.yPos + r.height) >= -3) {
                        let minX = r.xPos - self.player.width;
                        let maxX = r.xPos + r.width + self.player.width;
                        let playerMinX = self.player.xPos - 10;
                        let playerMaxX = self.player.xPos + self.player.width + 10;
                        if (playerMinX >= minX && playerMaxX <= maxX) {
                            endGame = true;
                        }
                    }
                    r.updatePosition();
                    $('#rock' + r.id).css("top", r.yPos + 'px');
                })

                if (endGame) {
                    self.endGame();
                }
                self.player.handleAccelTimer();

                // update the y and x internally of the player
                self.player.yPos += self.player.ySpeed + self.player.yAccel;
                self.player.xPos += self.player.xSpeed;

                self.refreshView();

                self.counter += 1;

            }
        }   /*end of updateUI*/

        this.startGame = function () {
            // creates a timer that calls updateUI every 50 ms
            self.timer = setInterval(self.updateUI, 20);
            self.player = new player();

        }

        this.startPlatforms = function () {

            let top1 = (Math.floor(Math.random() * 100) + 200);
            let top2 = (Math.floor(Math.random() * 100) + 500);
            var plat1 = new platform(99, top1, 'platform');
            var plat2 = new platform(100, top2, 'platform');

            plat1.top = top1;
            plat2.top = top2;
            plat1.yPos = top1;
            plat2.yPos = top2;


            var $newPlatform = $("<div id='platform" + plat1.id + "' class='" + plat1.type + "'></div>");

            //set the top and left of the newly created div
            $($newPlatform).css("top", plat1.top + 'px');
            $($newPlatform).css("left", plat1.xPos + 'px');

            $(self.top.name).append($newPlatform);

            var $newPlatform2 = $("<div id='platform" + plat2.id + "' class='" + plat2.type + "'></div>");

            //set the top and left of the newly created div
            $($newPlatform2).css("top", plat2.top + 'px');
            $($newPlatform2).css("left", plat2.xPos + 'px');

            $(self.top.name).append($newPlatform2);

            self.platforms.push(plat1);
            self.platforms.push(plat2);
        }

        this.updatePlatforms = function () {
            var newArray = [];

            //check to see if current platforms are still in view, if not then remove
            self.platforms.forEach(platform => {
                if (platform.yPos > -200) {
                    newArray.push(platform);
                }
                else {
                    $('#platform' + platform.id).remove();
                }
            });

            var newRockArray = [];

            //check to see if current platforms are still in view, if not then remove
            self.rocks.forEach(rock => {
                if (rock.yPos < 800) {
                    newRockArray.push(rock);
                }
                else {
                    $('#rock' + rock.id).remove();
                }
            });

            //add a new platform (internally), each platform has a unique id (platformId)
            self.platformId += 1;
            var classType = 'platform';

            var randGen = (Math.floor(Math.random() * 5));

            switch (randGen) {
                case 1:
                    classType = 'platformDecay';
                    break;
                default:
                    break;
            }

            var newPlat = new platform(self.platformId, self.top.pos, classType);
            newArray.push(newPlat);

            var newRock = new rock(self.platformId);
            newRockArray.push(newRock);

            var $newRock = $("<div id='rock" + self.platformId + "' class='rock'></div>");

            //set the top and left of the newly created div
            $($newRock).css("top", newRock.yPos + 'px');
            $($newRock).css("left", newRock.xPos + 'px');

            $('#playBoardContainer').append($newRock);




            //create new div for the platform and append to either board1 or board2 based on which is in view
            var $newPlatform = $("<div id='platform" + self.platformId + "' class='" + classType + "'></div>");

            //set the top and left of the newly created div
            $($newPlatform).css("top", newPlat.top + 'px');
            $($newPlatform).css("left", newPlat.xPos + 'px');

            $(self.top.name).append($newPlatform);

            // set the global platforms array = to the newArray that has removed the out of view platforms and added the new ones
            self.platforms = newArray;
            self.rocks = newRockArray;

        }



        this.setBackgroundPos = function (curY) {
            if (curY <= -self.height) {
                curY = self.height;
            }
            curY += self.globalMoveSpeed;
            return curY;
        }
        self.startPlatforms();
    } /*end of initialize*/
    this.initialize();

} /*end of gameUI*/

var platform = function (id, top, type) {
    var self = this;
    this.speed = 0;
    this.xPos = 0;
    this.yPos = 0;
    this.id = 0;
    this.width = 0;
    this.height = 0;
    this.top = 0;
    this.type = undefined;
    this.opacity = 75;
    this.decayTimer = undefined;
    this.isDecay = false;
    this.initialize = function (id, top, type) {
        self.id = id;
        self.speed = 10;
        // determine where to pos the 'top' css element of the platform
        self.top = 800 - top;
        // set the starting yPos
        self.yPos = 800;
        self.width = 150;
        self.height = 157;
        // give the platforms a random x pos
        self.xPos = (Math.floor(Math.random() * (boardWidth - self.width)));
        self.type = type;
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
        self.yPos -= 2;
    }
    this.startDecay = function () {
        self.isDecay = true;
        self.decayTimer = setInterval(self.updateDecay, 1000);
    }
    this.updateDecay = function () {
        if (self.opacity > 0) {
            self.opacity -= 25;
            $('#platform' + self.id).css("opacity", (self.opacity / 100));
        }
        if (self.opacity <= 0) {
            clearInterval(self.decayTimer);
            self.yPos = -200;
        }
    }
    this.initialize(id, top, type);
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
    this.state;

    this.initialize = function () {
        self.xPos = 328;
        self.yPos = 32;
        self.height = 32;
        self.width = 32;
        self.createAccelTimer();
        self.state = 'idleright'
    };

    this.setPos = function (x, y) {
        self.xPos = x;
        self.yPos = y;
    };

    this.createAccelTimer = function () {
        self.accelTimer = setInterval(self.updateAccel, 300);
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
        if (self.yAccel <= 2) {
            self.yAccel += 1;
        }
    }

    //changes state to input string and handles hiding and showing player images
    this.changeState = function (newstate) {
        $('#' + newstate).css("display", "block");
        $('#' + self.state).css("display", "none");
        self.state = newstate;
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
        if (e.which == 37) {
            self.xSpeed = 0;
            self.isMoving = false;
            self.changeState('idleleft');
        } else if (e.which == 39) {
            self.xSpeed = 0;
            self.isMoving = false;
            self.changeState('idleright');
        }
    }

    this.initialize();


} /*end of player*/

var rock = function (id) {
    var self = this;
    this.speed = 0;
    this.xPos = 0;
    this.yPos = 0;
    this.id = 0;
    this.width = 0;
    this.height = 0;
    this.top = 0;
    this.initialize = function (id) {
        self.id = id;
        self.speed = 5;
        // determine where to pos the 'top' css element of the platform
        // set the starting yPos
        self.yPos = -200;
        self.width = 100;
        self.height = 51;
        // give the platforms a random x pos
        self.xPos = (Math.floor(Math.random() * (boardWidth - self.width)));
    };
    this.positionRock = function (x, y) {
        self.xPos = x;
        self.yPos = y;
    };
    this.setSpeed = function (speed) {
        self.speed = speed;
    };
    this.updatePosition = function () {
        self.yPos += self.speed;
    }
    this.initialize(id);
} /*end of rock*/