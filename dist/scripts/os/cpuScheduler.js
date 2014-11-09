/*
FUTURE ME PUT HELLA SWEET COMMENTS HERE.
*/
var TSOS;
(function (TSOS) {
    var cpuScheduler = (function () {
        function cpuScheduler(readyQueue, residentQueue, counter) {
            if (typeof readyQueue === "undefined") { readyQueue = new TSOS.Queue(); }
            if (typeof residentQueue === "undefined") { residentQueue = new TSOS.Queue(); }
            if (typeof counter === "undefined") { counter = 0; }
            this.readyQueue = readyQueue;
            this.residentQueue = residentQueue;
            this.counter = counter;
        }
        cpuScheduler.prototype.runProgram = function () {
            //dequeue the program we want to execute
            _ExecutingProgramPCB = this.readyQueue.dequeue();
            _ExecutingProgramPID = _ExecutingProgramPCB.PID;

            //load it into the cpu
            _CPU.loadProgram();
        };
        cpuScheduler.prototype.contextSwitch = function () {
            //enqueue the current executing program back into the ready queue
            this.readyQueue.enqueue(_ExecutingProgramPCB);

            //reset the counter
            this.counter = 0;

            //call run program to get the next program in the queue
            this.runProgram();
        };
        return cpuScheduler;
    })();
    TSOS.cpuScheduler = cpuScheduler;
})(TSOS || (TSOS = {}));
