/*
FUTURE ME PUT HELLA SWEET COMMENTS HERE. 
*/

module TSOS {
    export class MemoryManager {
        
        constructor(public memory:Memory =new Memory(_MemorySize),
                    public locations: Array<Number> = new Array(_NumPrograms)) {
        }

        public init(): void {
            /*for (var i =0; i<this.locations.length; i++){
                //later
                this.locations.push(i);
            }*/
            
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
            currPCB.base = 0;

            _ProgramList[currPCB.pid] = currPCB;

            for (var i=0; i<program.length; i++){
                this.memory.Data[i] = program[i];
            }
            //update display
            this.updateMemoryDisplay();

            //return program number
            return (currPCB.pid).toString();

        }
        public getMemory(address:any){
            //debugger;
            if (typeof address==="number")
                return this.memory.Data[address];
            else{
                console.log(address);
                var decAddress = Utils.hex2dec(address);
                console.log(this.memory.Data[decAddress]);
                return this.memory.Data[decAddress];
            }
            
        }
        public convertHexData(data):number {
            return Utils.hex2dec(data);
        }
        public getNextTwoDataBytes(startAddress){
            
            console.log(this.getMemory(startAddress+1));
            console.log(this.getMemory(startAddress));
            return this.convertHexData(
                this.getMemory(this.getMemory(startAddress+1) +this.getMemory(startAddress))
                    );
        }
        public getDecAddressFromHex(startAddress){
            return this.convertHexData(this.getMemory(startAddress+1) +this.getMemory(startAddress));
        }
        public storeInMemory(startAddress, value){
            //debugger;
            var valueHex = Utils.dec2hex(value);
            valueHex =  Array(2-(valueHex.length-1)).join("0") + valueHex;
            var position = this.getDecAddressFromHex(startAddress);
            this.memory.Data[position] = valueHex;
        }
    }
}
