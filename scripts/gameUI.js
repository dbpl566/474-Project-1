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

        this.refreshView = function () {
            $('#platform1').css("top", self.game.platform.yPos);
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