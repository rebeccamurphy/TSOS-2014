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
            this.execute(this.fetch);
            this.updateCpu();
        }
        
        public fetch(): String{
            return _MemoryManager.getMemory(this.PC);
        }
        public updateCpu(){

            //update the CPU display
            TSOS.Control.updateCpuDisplay();
        }
        public execute(instruct){
            this.IR = instruct;
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

                }

            }
            this.updateCpu();
        }
        public loadAccumulatorConst(){    
            //Load the accumulator with a constant, LDA
            //Examples
            //LDA #$07, A9 07
            this.Acc = _MemoryManager.convertHexData(_MemoryManager.getMemory(this.PC+1));
            this.PC +=2;
        }
        public loadAccumulatorMem(){
            //load the accumulator from memory
            //Examples
            //LDA $0010, AD10 00
            this.Acc = _MemoryManager.getNextTwoDataBytes(this.PC+1);
            this.PC+=3;
        }
        public storeAccumulator(){
            //store the accumulator in memory
            //Examples
            //STA $0010, 8D 1000
            _MemoryManager.storeInMemory(this.Acc, this.PC+1);
            this.PC+=3;
        }
        public addWithCarry(){
            //add with carry adds contents of an address to the contents of the accumulator 
            //and keeps the result in the accumlator
            //Examples
            //ADC $0010, 6D 10 00
            this.Acc += _MemoryManager.getNextTwoDataBytes(this.PC+1);
            this.PC+=3;
        }

    }

}
