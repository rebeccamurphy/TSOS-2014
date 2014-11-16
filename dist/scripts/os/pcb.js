/*
FUTURE ME PUT HELLA SWEET COMMENTS HERE.
*/
var TSOS;
(function (TSOS) {
    var PCB = (function () {
        function PCB(//process stuff
        PC, Acc, Xreg, Yreg, Zflag, pid, IR, // memory stuff
        base, limit, state, priority, location) {
            if (typeof PC === "undefined") { PC = 0; }
            if (typeof Acc === "undefined") { Acc = 0; }
            if (typeof Xreg === "undefined") { Xreg = 0; }
            if (typeof Yreg === "undefined") { Yreg = 0; }
            if (typeof Zflag === "undefined") { Zflag = 0; }
            if (typeof pid === "undefined") { pid = 0; }
            if (typeof IR === "undefined") { IR = ""; }
            if (typeof base === "undefined") { base = 0; }
            if (typeof limit === "undefined") { limit = 0; }
            if (typeof state === "undefined") { state = 0 /* New */; }
            if (typeof priority === "undefined") { priority = DEFAULT_PRIORITY; }
            if (typeof location === "undefined") { location = "Memory"; }
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.pid = pid;
            this.IR = IR;
            this.base = base;
            this.limit = limit;
            this.state = state;
            this.priority = priority;
            this.location = location;
            this.pid = _CurrPID;
            _CurrPID++;
        }
        PCB.prototype.reset = function () {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Zflag = 0;
            this.IR = "";
        };
        return PCB;
    })();
    TSOS.PCB = PCB;
})(TSOS || (TSOS = {}));
