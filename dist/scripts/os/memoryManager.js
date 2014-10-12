/*
FUTURE ME PUT HELLA SWEET COMMENTS HERE.
*/
var TSOS;
(function (TSOS) {
    var MemoryManager = (function () {
        function MemoryManager(memory, locations) {
            if (typeof memory === "undefined") { memory = new TSOS.Memory(_MemorySize); }
            if (typeof locations === "undefined") { locations = new Array(_NumPrograms); }
            this.memory = memory;
            this.locations = locations;
        }
        MemoryManager.prototype.init = function () {
            /*for (var i =0; i<this.locations.length; i++){
            //later
            this.locations.push(i);
            }*/
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
            //create new PCB
            var currPCB = new TSOS.PCB();

            //add to list of PCBs
            //because we're starting with just loading 1 program in memory the base will be 0 for now
            currPCB.base = 0;

            _ProgramList[currPCB.pid] = currPCB;

            for (var i = 0; i < program.length; i++) {
                this.memory.Data[i] = program[i];
            }

            for (var j = program.length; j < _ProgramSize; j++)
                this.memory.Data[j] = "00";

            //update display
            this.updateMemoryDisplay();

            //return program number
            return (currPCB.pid).toString();
        };
        MemoryManager.prototype.getMemory = function (address) {
            //debugger;
            if (typeof address === "number")
                return this.memory.Data[address];
            else {
                console.log(address);
                var decAddress = TSOS.Utils.hex2dec(address);
                console.log(this.memory.Data[decAddress]);
                return this.memory.Data[decAddress];
            }
        };
        MemoryManager.prototype.convertHexData = function (data) {
            return TSOS.Utils.hex2dec(data);
        };
        MemoryManager.prototype.getNextTwoDataBytes = function (startAddress) {
            console.log(this.getMemory(startAddress + 1));
            console.log(this.getMemory(startAddress));
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
            this.memory.Data[position] = valueHex;
        };
        return MemoryManager;
    })();
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
