/*
FUTURE ME PUT HELLA SWEET COMMENTS HERE.
*/
var TSOS;
(function (TSOS) {
    var cpuScheduler = (function () {
        function cpuScheduler(readyQueue, residentQueue, terminatedQueue, counter, reorder) {
            if (typeof readyQueue === "undefined") { readyQueue = new TSOS.Queue(); }
            if (typeof residentQueue === "undefined") { residentQueue = new TSOS.Queue(); }
            if (typeof terminatedQueue === "undefined") { terminatedQueue = new TSOS.Queue(); }
            if (typeof counter === "undefined") { counter = 0; }
            if (typeof reorder === "undefined") { reorder = false; }
            this.readyQueue = readyQueue;
            this.residentQueue = residentQueue;
            this.terminatedQueue = terminatedQueue;
            this.counter = counter;
            this.reorder = reorder;
        }
        cpuScheduler.prototype.loadProgramMem = function (program, priority) {
            //if loading a program directly into memory
            //create new PCB
            var currPCB = new TSOS.PCB();

            //add to list of PCBs
            //because we're starting with just loading 1 program in memory the base will be 0 for now
            currPCB.base = _MemoryManager.nextFreeMem;

            //set the pc of the pcb to start at the base
            currPCB.PC = 0;

            //set the limit?
            currPCB.limit = currPCB.base + _ProgramSize - 1;

            //set the pcb state
            currPCB.state = 0 /* New */;

            //set the priority
            if (priority !== undefined)
                currPCB.priority = priority;

            //Put the program in the resident queue
            this.residentQueue.enqueue(currPCB);

            //put the program in memory
            TSOS.Control.updateAllQueueDisplays();

            //update the queue display
            //update memory
            _MemoryManager.loadProgram(currPCB, program);

            //return program number
            return (currPCB.pid).toString();
        };
        cpuScheduler.prototype.loadProgramDisk = function (program, priority) {
            //create new PCB
            var currPCB = new TSOS.PCB();

            //add to list of PCBs
            //because we're starting with just loading 1 program in memory the base will be 0 for now
            currPCB.base = null;

            //set the pc of the pcb to start at the base
            currPCB.PC = 0;

            //set the limit?
            currPCB.limit = null;

            //set the pcb state
            currPCB.state = 0 /* New */;

            //set the location to in disk
            currPCB.location = 1 /* Disk */;

            //set the priority
            if (priority !== undefined)
                currPCB.priority = priority;

            //add to the resident queue
            this.residentQueue.enqueue(currPCB);

            //update the displays
            TSOS.Control.updateAllQueueDisplays();

            //write program to disk
            _KernelInterruptQueue.enqueue(new TSOS.Interrupt(FILESYSTEM_IRQ, [4 /* Write */, SWAP_FILE_START_CHAR + String(currPCB.pid), program.join('')]));

            //return pid
            return currPCB.pid;
        };
        cpuScheduler.prototype.clearMem = function () {
            debugger;
            var tempProgramPCB = _ExecutingProgramPCB;
            _ExecutingProgramPCB = null;
            _ExecutingProgramPID = null;

            _KernelInterruptQueue.enqueue(new TSOS.Interrupt(PROCESS_KILLED_IRQ, tempProgramPCB));
            var sizeRQ = this.readyQueue.getSize();
            var sizeRL = this.residentQueue.getSize();

            for (var i = 0; i < sizeRQ; i++) {
                tempProgramPCB = this.readyQueue.dequeue();

                //check if the program is in memory
                if (tempProgramPCB.location === 0 /* Memory */) {
                    //remove program from the ready queue
                    this.readyQueue.getAndRemove(tempProgramPCB.pid);

                    //and kill program if so
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(PROCESS_KILLED_IRQ, tempProgramPCB));
                } else
                    this.readyQueue.enqueue(tempProgramPCB);
            }

            for (var i = 0; i < sizeRL; i++) {
                tempProgramPCB = this.residentQueue.dequeue();
                if (tempProgramPCB.location === 0 /* Memory */) {
                    this.residentQueue.getAndRemove(tempProgramPCB.pid);
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(PROCESS_KILLED_IRQ, tempProgramPCB));
                } else
                    this.residentQueue.enqueue(tempProgramPCB);
            }
        };
        cpuScheduler.prototype.emptyReadyQueue = function () {
            if (this.readyQueue.getSize() === 0) {
                this.counter = 0;
            }
            return this.readyQueue.getSize() === 0;
        };
        cpuScheduler.prototype.runProgram = function () {
            //dequeue the program we want to execute from the resident queue
            var tempProgramPCB = this.residentQueue.getAndRemove(_ExecutingProgramPID);

            //enqueue program to the ready queue
            this.readyQueue.enqueue(tempProgramPCB);

            //check if the CPU is not executing, thus we need to set the executing program
            if (!_CPU.isExecuting) {
                _ExecutingProgramPCB = this.readyQueue.dequeue();
                _ExecutingProgramPID = _ExecutingProgramPCB.pid;

                //load it into the cpu
                _CPU.loadProgram();
            }
            if (SCHEDULE_TYPE === 2 /* priority */) {
                this.reorder = true;
            }
        };
        cpuScheduler.prototype.runAllPrograms = function () {
            while (!this.residentQueue.isEmpty()) {
                this.readyQueue.enqueue(this.residentQueue.dequeue());
            }

            if (SCHEDULE_TYPE === 2 /* priority */) {
                this.readyQueue.priorityOrder();
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

            //check if the program is on disk()
            if (_ExecutingProgramPCB.location === 1 /* Disk */) {
                ;

                //enqueue an interupt to read swap from disk to so there is more room
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(FILESYSTEM_IRQ, [3 /* ReadSwap */, SWAP_FILE_START_CHAR + _ExecutingProgramPID]));

                // then check if there is an open spot in memory from another process being completed
                if (_MemoryManager.nextFreeMem !== null) {
                    //load the program into the free space
                    _ExecutingProgramPCB.base = _MemoryManager.nextFreeMem;
                    _ExecutingProgramPCB.limit = _ExecutingProgramPCB.base + _ProgramSize - 1;
                } else {
                    //we need to remove one program from memory and load the executing pcb to memory
                    var lastPCB = this.readyQueue.getLeastImportant();
                    var lastProgram = [];

                    //get the last program in the queue from memory
                    lastProgram = _MemoryManager.getProgram(lastPCB);
                    var lastProgramStr = lastProgram.join('');

                    //set the base and limit of the Executing PCB to the lastPCB
                    _ExecutingProgramPCB.base = lastPCB.base;
                    _ExecutingProgramPCB.limit = lastPCB.limit;

                    //set the location of the last program to disk
                    lastPCB.location = 1 /* Disk */;

                    //write the last program to disk
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(FILESYSTEM_IRQ, [4 /* Write */, SWAP_FILE_START_CHAR + lastPCB.pid, lastProgramStr]));

                    //finally splicein  the lastpcb
                    this.readyQueue.addLeastImportant(lastPCB);
                }
            } else {
                //load it into the cpu
                _CPU.loadProgram();
            }
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
                tempProgramPCB = this.readyQueue.getAndRemove(pid);
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
                    if (_CPU.isExecuting) {
                        this.readyQueue.enqueue(_ExecutingProgramPCB);
                        this.readyQueue.order();
                        _ExecutingProgramPCB = this.readyQueue.dequeue();
                        _ExecutingProgramPID = _ExecutingProgramPCB.pid;
                        _CPU.loadProgram();
                    } else {
                        this.readyQueue.order();
                    }

                    break;
                }
                case 2 /* priority */: {
                    //because non-premptive just order the queue
                    this.readyQueue.priorityOrder();
                    break;
                }
            }
        };
        return cpuScheduler;
    })();
    TSOS.cpuScheduler = cpuScheduler;
})(TSOS || (TSOS = {}));
