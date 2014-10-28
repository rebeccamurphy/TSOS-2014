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

module TSOS {

    export class Cpu {

        constructor(public PC: number = 0,
                    public Acc: number = 0,
                    public Xreg: number = 0,
                    public Yreg: number = 0,
                    public Zflag: number = 0,
                    public IR: String ="",
                    public isExecuting: boolean = false) {

        }

        public init(): void {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
        }

        public cycle(): void {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.
            this.execute(this.fetch());
            this.updateCpu();
        }
        
        public fetch(): String{
            return _MemoryManager.getMemory(this.PC);
        }
        public clearPreviousProgram(){
            //just for project 2, clearing CPU data 
            this.IR ="0";
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
            _Assembly = "No Instruction";   
            TSOS.Control.updateCpuDisplay();
            TSOS.Control.startPCBDisplay();
        }
        public updateCpu(){
            if( this.isExecuting){
                this.updatePCB();
            }

            //update the CPU display
            TSOS.Control.updateCpuDisplay();
            TSOS.Control.updatePCBDisplay();
            _MemoryManager.updateMemoryDisplay();
        }
        public updatePCB(){
            //update program pcb
            //debugger;
            _ProgramList[_ExecutingProgram].PC = _CPU.PC;
            _ProgramList[_ExecutingProgram].IR = _CPU.IR;
            _ProgramList[_ExecutingProgram].Acc = _CPU.Acc;
            _ProgramList[_ExecutingProgram].Xreg = _CPU.Xreg;
            _ProgramList[_ExecutingProgram].Yreg = _CPU.Yreg;
            _ProgramList[_ExecutingProgram].Zflag = _CPU.Zflag;
        }
        public execute(instruct){

            this.IR = instruct.toUpperCase();

            switch(instruct){
                case "A9": {
                    //Load the accumulator with a constant, LDA
                    this.loadAccumulatorConst()
                    break;
                }
                case "AD":{
                    //Load the accumulator from memory 
                    this.loadAccumulatorMem();
                    break;
                }
                case "8D":{
                    //Store the accumulator in memory 
                    this.storeAccumulator();
                    break;
                }
                case "6D":{
                    //Add with carry
                    this.addWithCarry();
                    break;
                }
                case "A2":{
                    //Load the X register with a constant
                    this.loadXConst();
                    break;
                }
                case "AE":{
                    //Load the X register from memory
                    this.loadXMem();
                    break;
                }
                case "A0":{
                    //Load the Y register with a constant
                    this.loadYConst();
                    break;
                }
                case "AC":{
                    //Load the Y register from memory
                    this.loadYMem();
                    break;
                }
                case "EA":{
                    //No operation
                    this.noOperation();
                    break;
                }
                case "00":{
                    //break (which is really a system call)
                    this.breakInstruct();
                    break;
                }
                case "EC":{
                    //compare a byte in memory to x reg
                    this.equalToX();
                    break;
                }
                case "D0":{
                    //branch x bytes if the Z flag = 0
                    this.branchNotEqual();
                    break;
                }
                case "EE":{
                    //increment the value of a byte
                    this.increment();
                    break;
                }
                case "FF":{
                    //system call
                    this.systemCall();
                    break;
                }
                default:{
                    //unknown instruct code error
                    //_KernelInterruptQueue.enqueue(new  Interrupt(Unknown_Opcode_irq));
                    break;
                }
            }
            this.PC++;
        }
        public loadAccumulatorConst(){    
            //Load the accumulator with a constant, LDA
            //Examples
            //LDA #$07, A9 07
        
            this.Acc = _MemoryManager.convertHexData(_MemoryManager.getMemory(++this.PC));
            _Assembly = "LDA #$" + _MemoryManager.getMemory(this.PC);    
            
        }
        public loadAccumulatorMem(){
            //load the accumulator from memory
            //Examples
            //LDA $0010, AD10 00
            this.Acc = _MemoryManager.convertHexData(_MemoryManager.getNextTwoDataBytes(++this.PC));
            _Assembly = "LDA $" + _MemoryManager.getNextTwoDataBytes(this.PC);   
            this.PC++;
        }
        public storeAccumulator(){
            //store the accumulator in memory
            //Examples
            //STA $0010, 8D 1000
            //debugger;
            _MemoryManager.storeInMemory(++this.PC, this.Acc);
            _Assembly ="STA $" + _MemoryManager.getMemory(this.PC);
            this.PC++;

        }
        public addWithCarry(){
            //add with carry adds contents of an address to the contents of the accumulator 
            //and keeps the result in the accumlator
            //Examples
            //ADC $0010, 6D 10 00
            this.Acc += _MemoryManager.convertHexData(_MemoryManager.getNextTwoDataBytes(++this.PC));
            _Assembly = "ADC $" + _MemoryManager.getNextTwoDataBytes(this.PC);
            this.PC++;
        }
        public loadXConst(){
            //load the x register with a constant
            //Examples
            //LDX #$01, A2 01
            this.Xreg = _MemoryManager.convertHexData(_MemoryManager.getMemory(++this.PC));
            _Assembly= "LDX #$" + _MemoryManager.getMemory(this.PC);
        }
        public loadXMem(){
            //load the x register from memory
            //Examples
            //LDX $0010, AE 10 00
            this.Xreg = _MemoryManager.convertHexData(_MemoryManager.getNextTwoDataBytes(++this.PC));
            _Assembly= "LDX $" + _MemoryManager.getNextTwoDataBytes(this.PC);
            this.PC++;
        }
        public loadYConst(){
            //load the y register with a constant
            //Examples
            //LDY #$04, A0 04
            this.Yreg = _MemoryManager.convertHexData(_MemoryManager.getMemory(++this.PC));
            _Assembly= "LDY #$" + _MemoryManager.getMemory(this.PC);
        }
        public loadYMem(){
            //load the x register from memory
            //Examples
            //LDY $0010, A0 10 00
            this.Yreg = _MemoryManager.convertHexData(_MemoryManager.getNextTwoDataBytes(++this.PC));
             _Assembly= "LDY $" + _MemoryManager.getNextTwoDataBytes(this.PC);
            this.PC++;
        }
        public noOperation(){
            //no operation
            //Examples
            //NOP, EA EA
            //this is really just here for consistences sake
            _Assembly= "NOP";
        }
        public breakInstruct(){
            //first  update the pcb for the current program
            this.updatePCB();
            //then enqueue a break interrupt
            _Assembly= "BRK";
            _KernelInterruptQueue.enqueue(new Interrupt(CPU_BREAK_IRQ));
        }
        public equalToX(){
            //compare a byte in memory to the x reg
            //sets the Z (zero) flag if equal
            //Examples
            //CPX, Ec $0010,EC 1000

            if (_MemoryManager.convertHexData(_MemoryManager.getNextTwoDataBytes(++this.PC)) === this.Xreg)
                this.Zflag = 1;
            else
                this.Zflag =0;
            _Assembly = "CPX $" + _MemoryManager.getNextTwoDataBytes(this.PC);
            this.PC++;
        }
        public branchNotEqual(){
            //branch X bytes if Z flag = 0
            //Examples
            //BNE, D0 $EF D0 EF
            //debugger;
            if (this.Zflag===0){
                //branching, added plus one is to go past the data address 
                _Assembly = "BNE $" +_MemoryManager.getMemory(this.PC+1);
                this.PC +=_MemoryManager.convertHexData(_MemoryManager.getMemory(++this.PC))+1;
                   
                //check if we need to shift the pc back to the beginning
                if (this.PC>=_ProgramSize){
                    //its a circleeeeee
                    this.PC-=_ProgramSize
                }
            }
            else {
                //skip over this data byte pretty much
                _Assembly = "BNE $" + _MemoryManager.getMemory(this.PC);
                this.PC++;
            }
        }
        public increment(){
            //increment the value of a byte
            //Examples
            //inc, EE $0021.EE 21 00
            var dataPos = this.PC +1;
            _MemoryManager.storeInMemory(dataPos, _MemoryManager.convertHexData(_MemoryManager.getNextTwoDataBytes(++this.PC)) +1);
            _Assembly = "INC $"+ _MemoryManager.getNextTwoDataBytes(this.PC);
            this.PC++;
        }

        public systemCall(){
            //system call 
            //$01 in X reg = print the interger stored in the Y register
            //$02 in X reg = print the 00-termindated Strign stored at the address in the Y register
            //Examples
            //SYS, FF 
            _Assembly = "SYS";
            _KernelInterruptQueue.enqueue(new Interrupt(SYS_OPCODE_IRQ));
        }

        
    }

}
