/*
FUTURE ME PUT HELLA SWEET COMMENTS HERE. 
*/

module TSOS {
    export class MemoryManager {
        
        constructor(public memory:Memory =new Memory(_MemorySize),
                    public nextFreeMem:number =0
                    ) {
        }

        public init(): void {            
            Control.updateMemoryDisplay();
        }

        
        public findNextFreeBlock(){
            //THIS IS WRONG REWRITE TEST 
            /*
            for (var i =0; i< _ProgramSize; i++){
                if (this.memory.Data[i]==="00")
                    return i;
            }
            return null;
            */
            
            for (var j=0; j <_NumPrograms; j++){
                var blockEmpty=true;
                var base = 255*j;
                for (var i =0; i< _ProgramSize; i++){
                    if (this.memory.Data[base+i]!=="00"){
                        blockEmpty=false;
                        break;
                    }
                }
                if (blockEmpty)
                    return j * (_ProgramSize);
            }
            return null;
            
        }
        public setNextFreeBlock(pcb){
            this.nextFreeMem = pcb.base;
        }
        public loadProgram(currPCB, program){
            //set the location to in memory
            debugger;
            currPCB.location = Locations.Memory;
            
            for (var i=0; i<program.length; i++){
                this.memory.Data[i+currPCB.base] = program[i];
            }
            //if program is short override previous programs
            for (var j= program.length+currPCB.base;j<currPCB.limit; j++ )
                this.memory.Data[j] ="00";
            

            //set the next free block of memory
            this.nextFreeMem = this.findNextFreeBlock();
       
            //update display
            TSOS.Control.updateMemoryDisplay();
        }
        public getProgram(pcb){
            debugger;
            var program = [];
            for (var i=pcb.base; i<=pcb.length+pcb.base; i++){
                program.push(this.memory.Data[i]);
            }
            return program;
        }
        public getMemory(address:any){
            if (typeof address==="number"){
                //checking memory in bounds
                if (address> _ExecutingProgramPCB.limit || address <_ExecutingProgramPCB.base )
                    _KernelInterruptQueue.enqueue(new Interrupt(MEMORY_ACCESS_VIOLATION_IRQ, Utils.dec2hex(address)));
                else
                    return this.memory.Data[address];
            }
            else{
                //add base of program to position so it remains in the program block
                var decAddress = Utils.hex2dec(address) +_ExecutingProgramPCB.base;

                //checking memory in bounds
                if (decAddress> _ExecutingProgramPCB.limit || decAddress <_ExecutingProgramPCB.base )
                    _KernelInterruptQueue.enqueue(new Interrupt(MEMORY_ACCESS_VIOLATION_IRQ, decAddress));
                else
                    return this.memory.Data[decAddress];
            }
            
        }
        public convertHexData(data):number {
            return Utils.hex2dec(data);
        }
        public getNextTwoDataBytes(startAddress){
            return this.getMemory(this.getMemory(startAddress+1) +this.getMemory(startAddress));
        }
        public getDecAddressFromHex(startAddress){
            return this.convertHexData(this.getMemory(startAddress+1) +this.getMemory(startAddress));
        }
        public storeInMemory(startAddress, value){
            var valueHex = Utils.dec2hex(value);
            
            valueHex =  Array(2-(valueHex.length-1)).join("0") + valueHex;
            //add the base of the Executing program so it knows where to go
            var position = this.getDecAddressFromHex(startAddress) + _ExecutingProgramPCB.base;
            //check if memory is in bounds
            if (position> _ExecutingProgramPCB.limit || position <_ExecutingProgramPCB.base ){
                _KernelInterruptQueue.enqueue(new Interrupt(MEMORY_ACCESS_VIOLATION_IRQ, position));
            }
            else
                this.memory.Data[position] = valueHex;

        }
        public clearProgramFromMemory(pcb?):void{
            if (pcb ===undefined){
                for (var i = _ExecutingProgramPCB.base; i<_ExecutingProgramPCB.limit; i++){
                    this.memory.Data[i] = "00";
                }
            }
            else{
                for (var i = pcb.base; i<pcb.limit; i++){
                    this.memory.Data[i] = "00";
                }
            }
            this.nextFreeMem= this.findNextFreeBlock();
        }
    }
}
