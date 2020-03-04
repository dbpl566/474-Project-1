var gameUI = function () {
    var self = this;
    this.game = undefined;
    this.running = false;
    this.initialize = function () {
        self.game = new game()
        $('#GameStopped').show();
        $('#GameRunning').hide();

        $('#StartBtn').on('click', function () {
            $('#GameStopped').hide();
            $('#GameRunning').show();
            self.running = true;
            self.updateUI();
        });
        $('#StopBtn').on('click', function () {
            $('#GameStopped').show();
            $('#GameRunning').hide();
            self.running = false;
            self.game.reset();
            self.refreshView();
        });

        $('body').keydown(function(e) { 
            if (e.which == 37) { //left
                self.game.player.incrementX(-10);
            } else if(e.which == 38) { //up
                self.game.player.incrementY(-10); 
            } else if (e.which == 39) { //right 
                self.game.player.incrementX(10);
            } else if (e.which == 40) { //down
                self.game.player.incrementY(10);
            }
        });

        this.refreshView = function () {
            $('#platform1').css("top", self.game.platform.yPos+'px');
            $('#player').css("left", self.game.player.xPos+'px');
            $('#player').css("top", self.game.player.yPos+'px');
            //$("#player").finish().animate({ left: self.game.player.xPos+'px'},"slow" ); 
        };
        
        this.updateUI = function () {
            if (self.running == false) {
                return;
            }
            var result = self.game.update(.1);
            self.refreshView();

            if (result == 0) {
                setTimeout(function () { self.updateUI(); }, 30);
                return;
            }

        }
        this.updateUI();
    }
    this.initialize();
}