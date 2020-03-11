var gameHeight = 1884;
var gameWidth = 680;

var gameUI = function () {
    var self = this;
    this.game = undefined;
    this.running = false;
    this.counter = 0;
    this.platforms = [];
    this.platformId = 0;
    this.player = undefined;
    this.height = gameHeight;
    this.top = {
        pos: 0,
        name: '',
    }
    var timer = undefined;

    // not using game.js anymore right now
    this.initialize = function () {
        self.player = new player();
        self.top.name = '#playBoard1';
        $('#startScreen').show();
        $('#endScreen').hide()

        $('#startBtn').on('click', function () {
            $('#startBtn').hide();
            $('#startScreen').slideUp();
            self.running = true;
            self.startGame();
        });

        //call to show endscreen and restart
        this.endGame = function(){
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
            self.player.ySpeed = 2;
            self.platforms.forEach(p => {
                if ((self.player.yPos + 25) - p.yPos <= 1 && (self.player.yPos + 25) - p.yPos >= -1) {
                    let minX = p.xPos - 24;
                    let maxX = p.xPos + p.width;
                    if (self.player.xPos >= minX && self.player.xPos <= maxX) {
                        self.player.ySpeed = -1;
                    }
                }
                p.updatePosition();
            })

            // update the y and x internally of the player
            self.player.yPos += self.player.ySpeed;
            self.player.xPos += self.player.xSpeed;


            self.refreshView();

            self.counter += 1;

        }   /*end of updateUI*/

        this.startGame = function () {
            // creates a timer that calls updateUI every 50 ms
            self.timer = setInterval(self.updateUI, 50)
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
            curY -= 1;
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
        self.top = 700 - top;
        // set the starting yPos
        self.yPos = 700;
        self.width = 90;
        self.height = 139;
         // give the platforms a random x pos
         self.xPos = (Math.floor(Math.random() * (gameWidth - self.width)));
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
    this.ySpeed = 0;

    this.initialize = function () {
        self.xPos = 20;
        self.yPos = 20;
    };

    this.setPos = function (x, y) {
        self.xPos = x;
        self.yPos = y;
    };


    // if the player is currently not moving (isMoving): sets the xSpeed of the player as well as isMoving to true
    this.handleKeyDown = function (e) {
        if (self.isMoving) {
            return;
        }
        // left
        if (e.which == 37) {
            self.xSpeed = -5;
        }
        // right
        else if (e.which == 39) {
            self.xSpeed = 5;
        }

        self.isMoving = true;
    }

    // when left/right arrow is released, sets the xSpeed back to 0 and isMoving to false;
    this.handleKeyUp = function (e) {
        if (e.which == 37 || e.which == 39) {
            self.xSpeed = 0;
            self.isMoving = false;

        }
    }

    this.initialize();


} /*end of player*/