/*
FUTURE ME PUT REALLY NICE COMMENTS HERE.
*/
var TSOS;
(function (TSOS) {
    var Memory = (function () {
        function Memory(Data, byteSize) {
            if (typeof byteSize === "undefined") { byteSize = 0; }
            this.Data = Data;
            this.byteSize = byteSize;
            this.Data = new Array();
            this.byteSize = byteSize;
        }
        Memory.prototype.init = function () {
            for (var i = 0; i < this.byteSize; i++) {
                this.Data[i] = "00";
            }
        };
        return Memory;
    })();
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
