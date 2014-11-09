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
            //dequeue the program we want to execute from the resident queue
            var tempProgramPCB = this.residentQueue.find(_ExecutingProgramPID);

            //enqueue program to the ready queue
            this.readyQueue.enqueue(tempProgramPCB);

            //check if the CPU is not executing, thus we need to set the executing program
            if (!_CPU.isExecuting) {
                _ExecutingProgramPCB = this.readyQueue.dequeue();
                _ExecutingProgramPID = _ExecutingProgramPCB.pid;
            }

            //load it into the cpu
            _CPU.loadProgram();
        };
        cpuScheduler.prototype.contextSwitch = function () {
            //enqueue the current executing program back into the ready queue
            this.readyQueue.enqueue(_ExecutingProgramPCB);

            //reset the counter
            this.counter = 0;

            //dequeue next program in line
            _ExecutingProgramPCB = this.readyQueue.dequeue();

            //load it into the cpu
            _CPU.loadProgram();
        };
        return cpuScheduler;
    })();
    TSOS.cpuScheduler = cpuScheduler;
})(TSOS || (TSOS = {}));
