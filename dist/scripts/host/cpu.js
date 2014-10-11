///<reference path="../globals.ts" />
/* ------------
CPU.ts
Requires global.ts.
Routines for the host CPU simulation, NOT for the OS itself.
In this manner, it's A LITTLE BIT like a hypervisor,
in that the Document environment inside a browser is the "bare metal" (so to speak) for which we write code
that hosts our client OS. But that analogy only goes so far, and the lines are blurred, because we are using
TypeScript/JavaScript in both the host and client environments.
This code references page numbers in the text book:
Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
------------ */
var TSOS;
(function (TSOS) {
    var Cpu = (function () {
        function Cpu(PC, Acc, Xreg, Yreg, Zflag, IR, isExecuting) {
            if (typeof PC === "undefined") { PC = 0; }
            if (typeof Acc === "undefined") { Acc = 0; }
            if (typeof Xreg === "undefined") { Xreg = 0; }
            if (typeof Yreg === "undefined") { Yreg = 0; }
            if (typeof Zflag === "undefined") { Zflag = 0; }
            if (typeof IR === "undefined") { IR = ""; }
            if (typeof isExecuting === "undefined") { isExecuting = false; }
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.IR = IR;
            this.isExecuting = isExecuting;
        }
        Cpu.prototype.init = function () {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
        };

        Cpu.prototype.cycle = function () {
            _Kernel.krnTrace('CPU cycle');

            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.
            this.execute(this.fetch);
            this.updateCpu();
        };

        Cpu.prototype.fetch = function () {
            return _MemoryManager.getMemory(this.PC);
        };
        Cpu.prototype.updateCpu = function () {
            //update the CPU display
            TSOS.Control.updateCpuDisplay();
        };
        Cpu.prototype.execute = function (instruct) {
            this.IR = instruct;
            switch (instruct) {
                case "A9": {
                    //Load the accumulator with a constant, LDA
                    this.loadAccumulatorConst();
                    break;
                }
                case "AD": {
                    //Load the accumulator from memory
                    this.loadAccumulatorMem();
                    break;
                }
                case "8D": {
                    //Store the accumulator in memory
                    this.storeAccumulator();
                    break;
                }
                case "6D": {
                    //Add with carry
                    this.addWithCarry();
                    break;
                }
                case "A2": {
                    //Load the X register with a constant
                    this.loadXConst();
                    break;
                }
                case "AE": {
                    //Load the X register from memory
                    this.loadXMem();
                    break;
                }
                case "A0": {
                    //Load the Y register with a constant
                    this.loadYConst();
                    break;
                }
                case "AC": {
                    //Load the Y register from memory
                    this.loadYMem();
                    break;
                }
                case "EA": {
                    //No operation
                    this.noOperation();
                    break;
                }
                case "00": {
                    //break (which is really a system call)
                    this.breakInstruct();
                    break;
                }
                case "EC": {
                    //compare a byte in memory to x reg
                    this.equalToX();
                    break;
                }
                case "D0": {
                    //branch x bytes if the Z flag = 0
                    this.branchNotEqual();
                    break;
                }
                case "EE": {
                    //increment the value of a byte
                    this.increment();
                    break;
                }
                case "FF": {
                    //system call
                    this.systemCall();
                    break;
                }
                default: {
                    break;
                }
            }
            this.PC++;
            this.updateCpu();
        };
        Cpu.prototype.loadAccumulatorConst = function () {
            //Load the accumulator with a constant, LDA
            //Examples
            //LDA #$07, A9 07
            this.Acc = _MemoryManager.convertHexData(_MemoryManager.getMemory(++this.PC));
        };
        Cpu.prototype.loadAccumulatorMem = function () {
            //load the accumulator from memory
            //Examples
            //LDA $0010, AD10 00
            this.Acc = _MemoryManager.getNextTwoDataBytes(++this.PC);
            this.PC++;
        };
        Cpu.prototype.storeAccumulator = function () {
            //store the accumulator in memory
            //Examples
            //STA $0010, 8D 1000
            _MemoryManager.storeInMemory(this.Acc, ++this.PC);
        };
        Cpu.prototype.addWithCarry = function () {
            //add with carry adds contents of an address to the contents of the accumulator
            //and keeps the result in the accumlator
            //Examples
            //ADC $0010, 6D 10 00
            this.Acc += _MemoryManager.getNextTwoDataBytes(++this.PC);
            this.PC++;
        };
        Cpu.prototype.loadXConst = function () {
            //load the x register with a constant
            //Examples
            //LDX #$01, A2 01
            this.Xreg = _MemoryManager.convertHexData(_MemoryManager.getMemory(++this.PC));
        };
        Cpu.prototype.loadXMem = function () {
            //load the x register from memory
            //Examples
            //LDX $0010, AE 10 00
            this.Xreg = _MemoryManager.getNextTwoDataBytes(++this.PC);
            this.PC++;
        };
        Cpu.prototype.loadYConst = function () {
            //load the y register with a constant
            //Examples
            //LDY #$04, A0 04
            this.Yreg = _MemoryManager.convertHexData(_MemoryManager.getMemory(++this.PC));
        };
        Cpu.prototype.loadYMem = function () {
            //load the x register from memory
            //Examples
            //LDY $0010, A0 10 00
            this.Yreg = _MemoryManager.getNextTwoDataBytes(++this.PC);
            this.PC++;
        };
        Cpu.prototype.noOperation = function () {
            //no operation
            //Examples
            //NOP, EA EA
            //this is really just here for consistences sake
        };
        Cpu.prototype.breakInstruct = function () {
            //first  update the pcb for the current program
            //then enquee a break interrupt
            //TODO
        };
        Cpu.prototype.equalToX = function () {
            //compare a byte in memory to the x reg
            //sets the Z (zero) flag if equal
            //Examples
            //CPX, Ec $0010,EC 1000
            if (_MemoryManager.getNextTwoDataBytes(++this.PC) === this.Xreg)
                this.Zflag = 1;
            else
                this.Zflag = 0;
            this.PC++;
        };
        Cpu.prototype.branchNotEqual = function () {
            //branch X bytes if Z flag = 0
            //Examples
            //BNE, D0 $EF D0 EF
            if (this.Zflag === 0) {
                //branching, added plus one is to go past the data address
                this.PC += _MemoryManager.convertHexData(_MemoryManager.getMemory(++this.PC)) + 1;

                //check if we need to shift the pc back to the beginning
                if (this.PC >= _ProgramSize) {
                    //its a circleeeeee
                    this.PC -= _ProgramSize;
                }
            } else {
                //skip over this data byte pretty much
                this.PC++;
            }
        };
        Cpu.prototype.increment = function () {
            //increment the value of a byte
            //Examples
            //inc, EE $0021.EE 21 00
            var dataPos = this.PC + 1;
            _MemoryManager.storeInMemory(dataPos, _MemoryManager.getNextTwoDataBytes(++this.PC) + 1);
            this.PC++;
        };

        Cpu.prototype.systemCall = function () {
            //system call
            //$01 in X reg = print the interger stored in the Y register
            //$02 in X reg = print the 00-termindated Strign stored at the address in the Y register
            //Examples
            //SYS, FF
            //_KernelInterruptQueue.enqueue(new Interrupt(SYS_OPCODE_IRQ));
        };
        return Cpu;
    })();
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
