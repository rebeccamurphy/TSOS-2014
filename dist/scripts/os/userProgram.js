var TSOS;
(function (TSOS) {
    var userProgram = (function () {
        function userProgram(name, code) {
            if (typeof name === "undefined") { name = ""; }
            if (typeof code === "undefined") { code = []; }
            this.name = name;
            this.code = code;
            this.hexChars = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F"];
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
        return userProgram;
    })();
    TSOS.userProgram = userProgram;
})(TSOS || (TSOS = {}));
