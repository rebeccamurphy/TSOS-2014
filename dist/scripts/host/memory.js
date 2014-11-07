/*
FUTURE ME PUT REALLY NICE COMMENTS HERE.
*/
var TSOS;
(function (TSOS) {
    var Memory = (function () {
        function Memory(byteSize) {
            this.byteSize = byteSize;
            this.byteSize = byteSize;
            this.Data = new Array(byteSize);
            this.init();
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
