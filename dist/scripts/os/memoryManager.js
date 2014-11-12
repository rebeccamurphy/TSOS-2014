/*
FUTURE ME PUT HELLA SWEET COMMENTS HERE.
*/
var TSOS;
(function (TSOS) {
    var MemoryManager = (function () {
        function MemoryManager(memory, nextFreeMem) {
            if (typeof memory === "undefined") { memory = new TSOS.Memory(_MemorySize); }
            if (typeof nextFreeMem === "undefined") { nextFreeMem = 0; }
            this.memory = memory;
            this.nextFreeMem = nextFreeMem;
        }
        MemoryManager.prototype.init = function () {
            TSOS.Control.updateMemoryDisplay();
        };

        MemoryManager.prototype.findNextFreeBlock = function () {
            for (var i = 0; i < _ProgramSize * _NumPrograms; i += 256) {
                if (this.memory.Data[i] === "00")
                    return i;
            }
            return null;
        };
        MemoryManager.prototype.setNextFreeBlock = function (pcb) {
            this.nextFreeMem = pcb.base;
        };
        MemoryManager.prototype.loadProgram = function (program) {
            //create new PCB
            var currPCB = new TSOS.PCB();

            //add to list of PCBs
            //because we're starting with just loading 1 program in memory the base will be 0 for now
            currPCB.base = this.nextFreeMem;

            //set the pc of the pcb to start at the base
            currPCB.PC = currPCB.base;

            //set the limit?
            currPCB.limit = currPCB.base + _ProgramSize;

            //set the pcb state
            currPCB.state = 0 /* New */;

            //Put the program in the ready queue
            _Scheduler.loadProgram(currPCB);

            for (var i = 0; i < program.length; i++) {
                this.memory.Data[i + currPCB.base] = program[i];
            }

            for (var j = program.length + currPCB.base; j < currPCB.limit; j++)
                this.memory.Data[j] = "00";

            //set the next free block of memory
            this.nextFreeMem = this.findNextFreeBlock();

            //update display
            TSOS.Control.updateMemoryDisplay();

            //return program number
            return (currPCB.pid).toString();
        };
        MemoryManager.prototype.getMemory = function (address) {
            if (typeof address === "number") {
                //checking memory in bounds
                if (address >= _ExecutingProgramPCB.limit || address < _ExecutingProgramPCB.base)
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(MEMORY_ACCESS_VIOLATION_IRQ, TSOS.Utils.dec2hex(address)));
                else
                    return this.memory.Data[address];
            } else {
                //add base of program to position so it remains in the program block
                var decAddress = TSOS.Utils.hex2dec(address) + _ExecutingProgramPCB.base;

                //checking memory in bounds
                if (decAddress >= _ExecutingProgramPCB.limit || decAddress < _ExecutingProgramPCB.base)
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(MEMORY_ACCESS_VIOLATION_IRQ, decAddress));
                else
                    return this.memory.Data[decAddress];
            }
        };
        MemoryManager.prototype.convertHexData = function (data) {
            return TSOS.Utils.hex2dec(data);
        };
        MemoryManager.prototype.getNextTwoDataBytes = function (startAddress) {
            return this.getMemory(this.getMemory(startAddress + 1) + this.getMemory(startAddress));
        };
        MemoryManager.prototype.getDecAddressFromHex = function (startAddress) {
            return this.convertHexData(this.getMemory(startAddress + 1) + this.getMemory(startAddress));
        };
        MemoryManager.prototype.storeInMemory = function (startAddress, value) {
            var valueHex = TSOS.Utils.dec2hex(value);

            valueHex = Array(2 - (valueHex.length - 1)).join("0") + valueHex;

            //add the base of the Executing program so it knows where to go
            var position = this.getDecAddressFromHex(startAddress) + _ExecutingProgramPCB.base;

            //check if memory is in bounds
            if (position >= _ExecutingProgramPCB.limit || position < _ExecutingProgramPCB.base) {
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(MEMORY_ACCESS_VIOLATION_IRQ, position));
            } else
                this.memory.Data[position] = valueHex;
        };
        MemoryManager.prototype.clearProgramFromMemory = function (pcb) {
            if (pcb === undefined) {
                for (var i = _ExecutingProgramPCB.base; i < _ExecutingProgramPCB.limit; i++) {
                    this.memory.Data[i] = "00";
                }
            } else {
                for (var i = pcb.base; i < pcb.limit; i++) {
                    this.memory.Data[i] = "00";
                }
            }
            this.nextFreeMem = this.findNextFreeBlock();
        };
        return MemoryManager;
    })();
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
