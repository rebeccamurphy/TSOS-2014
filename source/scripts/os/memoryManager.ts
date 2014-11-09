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
            this.updateMemoryDisplay();
        }

        public updateMemoryDisplay(){
            //TODO move this to control.ts
            var output = "<tr>";
            
            for (var i=0; i<this.memory.byteSize; i++){
                if (i % 8 ===0){
                    output += "</tr><tr><td> <b>" + Utils.createHexIndex(i) + " </td>";
                }
                if (_CPU.PC===i&&_CPU.isExecuting)
                    output += "<td id='dataID" + i + "'><b>" + this.memory.Data[i] + '</b></td>';
                else
                    output += "<td id='dataID" + i + "'>" + this.memory.Data[i] + '</td>';
            }
            output += "</tr>"
        Control.updateMemoryDisplay(output);
        }
        public findNextFreeBlock(){
          
            for (var i =0; i< _ProgramSize*_NumPrograms; i+=256){
                if (this.memory.Data[i]==="00")
                    return i;
            }
            return null;
        }
        public loadProgram(program){
 
            //create new PCB
            var currPCB = new TSOS.PCB();
            //add to list of PCBs 
            //because we're starting with just loading 1 program in memory the base will be 0 for now
            currPCB.base = this.nextFreeMem;

            //set the pc of the pcb to start at the base
            currPCB.PC = currPCB.base;
            //set the limit?
            currPCB.limit = currPCB.base + _ProgramSize;


            //Put the program in the ready queue
            _Scheduler.residentQueue.enqueue(currPCB);

            for (var i=0; i<program.length; i++){
                this.memory.Data[i+currPCB.base] = program[i];
            }
            //if program is short override previous programs
            for (var j= program.length+currPCB.base;j<currPCB.limit; j++ )
                this.memory.Data[j] ="00";
            

            //set the next free block of memory
            this.nextFreeMem = this.findNextFreeBlock();
       
            //update display
            this.updateMemoryDisplay();

            //return program number
            return (currPCB.pid).toString();

        }
        public getMemory(address:any){
            if (typeof address==="number"){
                //checking memory in bounds
                if (address>= _ExecutingProgramPCB.limit || address <_ExecutingProgramPCB.base )
                    _KernelInterruptQueue.enqueue(new Interrupt(MEMORY_ACCESS_VIOLATION_IRQ, Utils.dec2hex(address)));
                else
                    return this.memory.Data[address];
            }
            else{
                //add base of program to position so it remains in the program block
                var decAddress = Utils.hex2dec(address) +_ExecutingProgramPCB.base;

                //checking memory in bounds
                if (decAddress>= _ExecutingProgramPCB.limit || decAddress <_ExecutingProgramPCB.base )
                    _KernelInterruptQueue.enqueue(new Interrupt(MEMORY_ACCESS_VIOLATION_IRQ, address));
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
            if (position>= _ExecutingProgramPCB.limit || position <_ExecutingProgramPCB.base )
                _KernelInterruptQueue.enqueue(new Interrupt(MEMORY_ACCESS_VIOLATION_IRQ, startAddress));
            else
                this.memory.Data[position] = valueHex;

        }
        public clearProgramFromMemory(){

            for (var i = _ExecutingProgramPCB.base; i<_ExecutingProgramPCB.limit; i++){
                this.memory.Data[i] = "00";
            }
            this.nextFreeMem= this.findNextFreeBlock();
        }
    }
}
