// var game = function () {
//     var self = this;
//     this.options = {
//         height: 1884,
//         width: 680,
//         pformCounter: 0,
//     }
//     this.height = 1884;

//     this.platforms = [];
//     this.initialize = function () {
//         self.reset();
//     };
//     this.reset = function () {
//         //self.platforms = [];
//     };
//     this.update = function (time) {

//         platform.updatePosition(time);

//         if (time % 2000) {
//             var newArray = [];
//             self.platforms.forEach(platform => {
//                 if (platform.yPos > -50) {
//                     newArray.push(platform);
//                 }
//                 else {
//                     pformCounter += 1;
//                     newArray.push(new platform(pformCounter));
//                 }
//             });
//             self.platforms = newArray;
//         }


//         return 0;

//     };

//     this.initialize();

// };


// var platform = function () {
//     var self = this;
//     this.speed = 0;
//     this.xPos = 0;
//     this.yPos = 0;
//     this.id = 0;
//     this.initialize = function (id) {
//         self.id = id;
//         self.speed = 10;
//         self.xPos = (Math.floor(Math.random() * 300) + 30)
//         self.yPos = 520;
//     };
//     this.positionPlatform = function (x, y) {
//         self.xPos = x;
//         self.yPos = y;
//     };
//     this.setSpeed = function (speed) {
//         self.speed = speed;
//     };
//     this.updatePosition = function (time) {
//         //speed*time gives distance.
//         var distance = self.speed * time;

//         self.yPos = self.yPos - distance;
//     }
//     this.initialize();
// }