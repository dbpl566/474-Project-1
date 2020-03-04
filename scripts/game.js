var game = function () {
    var self = this;
    this.options = {
        height: 550,
        width: 680,
    }
    this.height = 550;
    this.player = new player();
    this.platform = new platform();
    this.initialize = function () {
        self.reset();
    };
    this.reset = function () {

    };
    this.update = function (time) {
        self.platform.updatePosition(time);
        if (self.platform.yPos < 30) {
            self.platform.positionPlatform(self.platform.xPos, self.options.height - 50)
        }

        return 0;

    };

    this.initialize();

}

var platform = function () {
    var self = this;
    this.speed = 0;
    this.xPos = 0;
    this.yPos = 0;
    this.initialize = function () {
        self.speed = 10;
        self.xPos = 0;
        self.yPos = 500;
    };
    this.positionPlatform = function (x, y) {
        self.xPos = x;
        self.yPos = y;
    };
    this.setSpeed = function (speed) {
        self.speed = speed;
    };
    this.updatePosition = function (time) {
        //speed*time gives distance.
        var distance = self.speed * time;
        //calculate new x,y from distance and angle y is sin*dist, x is cos*dist
        self.yPos = self.yPos - distance;
    }
    this.initialize();
}

var player = function(){
    var self = this;
    this.speed = 0;
    this.xPos = 0;
    this.yPos = 0;

    this.initialize = function () {
        self.speed = 10;
        self.xPos = 20;
        self.yPos = 20;
    };

    this.setPos=function(x,y){
        self.xPos = x;
        self.yPos = y;
    };
    
    this.incrementX = function(incr){
        self.xPos += incr;
    };

    this.incrementY = function(incr){
        self.yPos += incr;
    };

    this.initialize();


}