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
            console.log(program);
            debugger;
            for (var i=0; i<program.length; i++){
                this.memory.Data[i] = program[i];
            }
            this.updateMemoryDisplay();

        }
    }
}
