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
            for (var i = 0; i < program.length; i++) {
                this.memory.Data[i] = program[i];
            }
            this.updateMemoryDisplay();
            var currPCB = new TSOS.PCB();
            return (currPCB.pid).toString();
        };
        MemoryManager.prototype.getMemory = function (address) {
            var decAddress = TSOS.Utils.dec2hex(address);
            return this.memory.Data[decAddress];
        };
        MemoryManager.prototype.convertHexData = function (data) {
            return TSOS.Utils.hex2dec(data);
        };
        MemoryManager.prototype.getNextTwoDataBytes = function (startAddress) {
            return this.convertHexData(this.getMemory(startAddress + 1) + this.getMemory(startAddress));
        };
        MemoryManager.prototype.storeInMemory = function (value, startAddress) {
            var valueHex = TSOS.Utils.dec2hex(value);
            var position = this.getNextTwoDataBytes(startAddress);
            this.memory.Data[position] = valueHex.substring(0, 2);
            this.memory.Data[position + 1] = valueHex.substring(2, 4);
        };
        return MemoryManager;
    })();
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
