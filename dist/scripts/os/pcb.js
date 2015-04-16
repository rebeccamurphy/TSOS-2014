/*
FUTURE ME PUT HELLA SWEET COMMENTS HERE.
*/
var TSOS;
(function (TSOS) {
    var PCB = (function () {
        function PCB(
            //process stuff
            PC, Acc, Xreg, Yreg, Zflag, pid, IR, 
            // memory stuff
            base, //starting location in the mems
            limit, //max location in the mems. to prevent
            state, //new, ready, or running state of program
            priority, location //defaults to memory, if written to disk will switch to disk
            ) {
            if (PC === void 0) { PC = 0; }
            if (Acc === void 0) { Acc = 0; }
            if (Xreg === void 0) { Xreg = 0; }
            if (Yreg === void 0) { Yreg = 0; }
            if (Zflag === void 0) { Zflag = 0; }
            if (pid === void 0) { pid = 0; }
            if (IR === void 0) { IR = ""; }
            if (base === void 0) { base = 0; }
            if (limit === void 0) { limit = 0; }
            if (state === void 0) { state = State.New; }
            if (priority === void 0) { priority = DEFAULT_PRIORITY; }
            if (location === void 0) { location = Locations.Memory; }
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
