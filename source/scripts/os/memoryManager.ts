/*
FUTURE ME PUT HELLA SWEET COMMENTS HERE. 
*/

module TSOS {
    export class MemoryManager {
        
        constructor(public memory:Memory =new Memory(_MemorySize),
                    public nextFreeMem :number =0
                    ) {
        }

        public init(): void {            
            this.updateMemoryDisplay();
        }

        public updateMemoryDisplay(){
            var output = "<tr>";
            //debugger;
            for (var i=0; i<this.memory.byteSize; i++){
                if (i % 8 ===0){
                    output += "</tr><tr><td> <b>" + Utils.createHexIndex(i) + " </td>";
                }
                output += "<td id='dataID" + i + "'>" + this.memory.Data[i] + '</td>';
            }
            output += "</tr>"
        Control.updateMemoryDisplay(output);
        }

        public loadProgram(program){
            //create new PCB
            var currPCB = new TSOS.PCB();
            //add to list of PCBs 
            //because we're starting with just loading 1 program in memory the base will be 0 for now
            currPCB.base = this.nextFreeMem;
            //set the limit?
            currPCB.limit = currPCB.base + _ProgramSize;
            this.nextFreeMem = currPCB.limit;

            _ProgramList[currPCB.pid] = currPCB;

            //Put the program in the ready queue
            _Scheduler.readyQueue.enqueue(currPCB);

            for (var i=0; i<program.length; i++){
                this.memory.Data[i] = program[i];
            }
            //if program is short override previous programs
            for (var j= program.length;j<_ProgramSize; j++ )
                this.memory.Data[j] ="00";
            //update display
            this.updateMemoryDisplay();

            //return program number
            return (currPCB.pid).toString();

        }
        public getMemory(address:any){
            //debugger;

            if (typeof address==="number"){
                //checking memory in bounds
                if (address>= _ProgramList[_ExecutingProgram].limit || address <_ProgramList[_ExecutingProgram].base )
                    _KernelInterruptQueue.enqueue(new Interrupt(MEMORY_ACCESS_VIOLATION_IRQ, Utils.dec2hex(address)));
                else
                    return this.memory.Data[address];
            }
            else{
                
                var decAddress = Utils.hex2dec(address);
                //checking memory in bounds
                if (decAddress>= _ProgramList[_ExecutingProgram].limit || decAddress <_ProgramList[_ExecutingProgram].base )
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
            //debugger;
            var valueHex = Utils.dec2hex(value);
            valueHex =  Array(2-(valueHex.length-1)).join("0") + valueHex;
            var position = this.getDecAddressFromHex(startAddress);
            //check if memory is in bounds
            if (position>= _ProgramList[_ExecutingProgram].limit || position <_ProgramList[_ExecutingProgram].base )
                    _KernelInterruptQueue.enqueue(new Interrupt(MEMORY_ACCESS_VIOLATION_IRQ, startAddress));
            else
                this.memory.Data[position] = valueHex;

        }
    }
}
