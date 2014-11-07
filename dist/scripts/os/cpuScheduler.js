/*
FUTURE ME PUT HELLA SWEET COMMENTS HERE.
*/
var TSOS;
(function (TSOS) {
    var cpuScheduler = (function () {
        function cpuScheduler(readyQueue, residentQueue) {
            if (typeof readyQueue === "undefined") { readyQueue = new TSOS.Queue(); }
            if (typeof residentQueue === "undefined") { residentQueue = new TSOS.Queue(); }
            this.readyQueue = readyQueue;
            this.residentQueue = residentQueue;
        }
        cpuScheduler.prototype.contextSwitch = function () {
        };
        return cpuScheduler;
    })();
    TSOS.cpuScheduler = cpuScheduler;
})(TSOS || (TSOS = {}));
