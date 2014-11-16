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
        cpuScheduler.prototype.loadProgram = function (pcb) {
            this.residentQueue.enqueue(pcb);
        };
        cpuScheduler.prototype.emptyReadyQueue = function () {
            if (this.readyQueue.getSize() === 0) {
                this.counter = 0;
            }
            return this.readyQueue.getSize() === 0;
        };
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
        cpuScheduler.prototype.runAllPrograms = function () {
            while (!this.residentQueue.isEmpty()) {
                this.readyQueue.enqueue(this.residentQueue.dequeue());
            }

            //set the current runnining program
            _ExecutingProgramPCB = this.readyQueue.dequeue();
            _ExecutingProgramPID = _ExecutingProgramPCB.pid;

            _CPU.loadProgram();
        };
        cpuScheduler.prototype.contextSwitch = function () {
            if (_ExecutingProgramPCB !== null) {
                //enqueue the current executing program back into the ready queue
                _ExecutingProgramPCB.state = 2 /* Ready */;
                this.readyQueue.enqueue(_ExecutingProgramPCB);
            }

            //reset the counter
            this.counter = 0;

            //dequeue next program in line
            _ExecutingProgramPCB = this.readyQueue.dequeue();
            _ExecutingProgramPID = _ExecutingProgramPCB.pid;

            //load it into the cpu
            _CPU.loadProgram();
        };
        cpuScheduler.prototype.stopRunning = function (pid) {
            //stops a program if it is currently running and puts it back on the resident queue with a new pcb
            var tempProgramPCB = null;
            if (_ExecutingProgramPID === pid) {
                //reset the pcb so if the program is restarted it will start from the beginning
                tempProgramPCB = _ExecutingProgramPCB;

                //reset the executing program variables
                _ExecutingProgramPID = null;
                _ExecutingProgramPCB = null;
            } else {
                //remove the program from the ready queue
                tempProgramPCB = this.readyQueue.find(pid);
            }

            //mark the memory the program was living in as free
            _MemoryManager.setNextFreeBlock(tempProgramPCB);

            //update the cpu display
            _CPU.updateDisplay();

            //finally enqueue an interrupt
            _KernelInterruptQueue.enqueue(new TSOS.Interrupt(PROCESS_KILLED_IRQ, tempProgramPCB));
        };
        cpuScheduler.prototype.switchScheduling = function () {
            switch (SCHEDULE_TYPE) {
                case 0 /* rr */: {
                    this.counter = 0;
                    break;
                }
                case 1 /* fcfs */: {
                    debugger;
                    if (_ExecutingProgramPID !== null || _ExecutingProgramPCB !== undefined) {
                        this.readyQueue.enqueue(_ExecutingProgramPCB);
                        this.readyQueue.order();
                    } else {
                        this.readyQueue.order();
                    }
                    if (_CPU.isExecuting) {
                        _ExecutingProgramPCB = this.readyQueue.dequeue();
                        _ExecutingProgramPID = _ExecutingProgramPCB.pid;
                    }

                    break;
                }
                case 2 /* priority */: {
                    break;
                }
            }
        };
        return cpuScheduler;
    })();
    TSOS.cpuScheduler = cpuScheduler;
})(TSOS || (TSOS = {}));
