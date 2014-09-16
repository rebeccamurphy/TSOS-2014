var TSOS;
(function (TSOS) {
    var userProgram = (function () {
        function userProgram(name, code, beepboop) {
            if (typeof name === "undefined") { name = ""; }
            if (typeof code === "undefined") { code = []; }
            if (typeof beepboop === "undefined") { beepboop = []; }
            this.name = name;
            this.code = code;
            this.beepboop = beepboop;
            this.hexChars = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F"];
            this.bbDisplayed = false;
        }
        userProgram.prototype.checkValid = function () {
            for (var i = 0; i < this.code.length; i++) {
                var numStr = this.code[i];
                if (numStr.length < 2)
                    return false;
                for (var j = 0; j < numStr.length; j++)
                    if (this.hexChars.indexOf(numStr[j]) === -1)
                        return false;
            }
            return true;
        };
        userProgram.prototype.Bin2Hex = function (n) {
            return parseInt(n, 2).toString(16);
        };
        userProgram.prototype.Hex2Bin = function (n) {
            return parseInt(n, 16).toString(2);
        };
        userProgram.prototype.Hex2Dec = function (n) {
            return parseInt(n, 16).toString(10);
        };
        userProgram.prototype.Dec2Bin = function (n) {
            return (n).toString(2);
        };

        userProgram.prototype.convertToBB = function () {
            for (var i = 0; i < this.code.length; i++) {
                var numHex = this.code[i];

                //var numDec = this.Hex2Dec(numHex);
                //var numBin = this.Dec2Bin(numDec);
                var numBin = this.Hex2Bin(numHex);
                numBin = Array(8 - (numBin.length - 1)).join("0") + numBin;
                var numBB = "";
                for (var j = 0; j < numBin.length; j++) {
                    var num = numBin.charAt(j);
                    var temp = (num === "0") ? "BOOP" : "BEEP";
                    numBB += temp;
                }
                this.beepboop.push(numBB);
            }
        };
        userProgram.prototype.printBB = function () {
            var tempBBStr = this.beepboop.join(" ");
            document.getElementById("taProgramInput").value = tempBBStr;
            this.bbDisplayed = true;
        };
        userProgram.prototype.printHex = function () {
            document.getElementById("taProgramInput").value = this.code.join(" ");
            this.bbDisplayed = false;
        };
        return userProgram;
    })();
    TSOS.userProgram = userProgram;
})(TSOS || (TSOS = {}));
