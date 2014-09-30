/*
FUTURE ME PUT REALLY NICE COMMENTS HERE. 
*/

module TSOS {

    export class Memory {

        constructor(public Data: Array<String>,
                    public byteSize: number=0) {

            this.Data = new Array();
            this.byteSize = byteSize;

        }

        public init(): void {
            for (var i =0; i< this.byteSize; i++){
                this.Data[i] ="00";
            }
            
        }
    }
}
