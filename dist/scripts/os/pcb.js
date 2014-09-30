/*
FUTURE ME PUT HELLA SWEET COMMENTS HERE.
*/
var TSOS;
(function (TSOS) {
    var PCB = (function () {
        function PCB(PC, Acc, Xreg, Yreg, Zflag, pid) {
            if (typeof PC === "undefined") { PC = 0; }
            if (typeof Acc === "undefined") { Acc = 0; }
            if (typeof Xreg === "undefined") { Xreg = 0; }
            if (typeof Yreg === "undefined") { Yreg = 0; }
            if (typeof Zflag === "undefined") { Zflag = 0; }
            if (typeof pid === "undefined") { pid = 0; }
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.pid = pid;
        }
        PCB.prototype.init = function () {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.pid = 0;
        };

        PCB.prototype.incrementPID = function () {
            this.pid++;
        };
        return PCB;
    })();
    TSOS.PCB = PCB;
})(TSOS || (TSOS = {}));
