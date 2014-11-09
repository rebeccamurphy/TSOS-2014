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
            this.updateMemoryDisplay();
        };

        MemoryManager.prototype.updateMemoryDisplay = function () {
            var output = "<tr>";

            for (var i = 0; i < this.memory.byteSize; i++) {
                if (i % 8 === 0) {
                    output += "</tr><tr><td> <b>" + TSOS.Utils.createHexIndex(i) + " </td>";
                }
                output += "<td id='dataID" + i + "'>" + this.memory.Data[i] + '</td>';
            }
            output += "</tr>";
            TSOS.Control.updateMemoryDisplay(output);
        };

        MemoryManager.prototype.loadProgram = function (program) {
            debugger;

            //create new PCB
            var currPCB = new TSOS.PCB();

            //add to list of PCBs
            //because we're starting with just loading 1 program in memory the base will be 0 for now
            currPCB.base = this.nextFreeMem;

            //set the limit?
            currPCB.limit = currPCB.base + _ProgramSize;

            //next free memory should be after the program size
            this.nextFreeMem = currPCB.limit;

            //Put the program in the ready queue
            _Scheduler.readyQueue.enqueue(currPCB);

            for (var i = 0; i < program.length; i++) {
                this.memory.Data[i + currPCB.base] = program[i];
            }

            for (var j = program.length + currPCB.base; j < currPCB.limit; j++)
                this.memory.Data[j] = "00";

            //update display
            this.updateMemoryDisplay();

            //return program number
            return (currPCB.pid).toString();
        };
        MemoryManager.prototype.getMemory = function (address) {
            //debugger;
            if (typeof address === "number") {
                //checking memory in bounds
                if (address >= _ExecutingProgramPCB.limit || address < _ExecutingProgramPCB.base)
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(MEMORY_ACCESS_VIOLATION_IRQ, TSOS.Utils.dec2hex(address)));
                else
                    return this.memory.Data[address];
            } else {
                var decAddress = TSOS.Utils.hex2dec(address);

                //checking memory in bounds
                if (decAddress >= _ExecutingProgramPCB.limit || decAddress < _ExecutingProgramPCB.base)
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(MEMORY_ACCESS_VIOLATION_IRQ, address));
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
            //debugger;
            var valueHex = TSOS.Utils.dec2hex(value);
            valueHex = Array(2 - (valueHex.length - 1)).join("0") + valueHex;
            var position = this.getDecAddressFromHex(startAddress);

            //check if memory is in bounds
            if (position >= _ExecutingProgramPCB.limit || position < _ExecutingProgramPCB.base)
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(MEMORY_ACCESS_VIOLATION_IRQ, startAddress));
            else
                this.memory.Data[position] = valueHex;
        };
        MemoryManager.prototype.clearFromMemory = function () {
        };
        return MemoryManager;
    })();
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
