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
            for (var i=0; i<program.length; i++){
                this.memory.Data[i] = program[i];
            }
            this.updateMemoryDisplay();
            var currPCB = new TSOS.PCB();
            return (currPCB.pid).toString();

        }
        public getMemory(address){
            var decAddress = Utils.dec2hex(address);
            return this.memory.Data[decAddress];
        }
        public convertHexData(data):number {
            return Utils.hex2dec(data);
        }
        public getNextTwoDataBytes(startAddress){
            return this.convertHexData( this.getMemory(startAddress+1) +this.getMemory(startAddress));
        }
        public storeInMemory(startAddress, value){
            var valueHex = Utils.dec2hex(value);
            var position = this.getNextTwoDataBytes(startAddress);
            this.memory.Data[position] = valueHex.substring(0, 2);
            this.memory.Data[position+1] = valueHex.substring(2, 4);
        }
    }
}
