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
            debugger;
            for (var i = 0; i < this.memory.byteSize; i++) {
                if (i % 8 === 0) {
                    output += "</tr><tr><td> <b>0x0" + TSOS.Utils.dec2hex(i) + " </td>";
                }
                output += "<td id='dataID" + i + "'>" + this.memory.Data[i] + '</td>';
            }
            output += "</tr>";
            TSOS.Control.updateMemoryDisplay(output);
        };
        return MemoryManager;
    })();
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
