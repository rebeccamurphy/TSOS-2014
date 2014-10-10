/*
FUTURE ME PUT REALLY NICE COMMENTS HERE. 
*/

module TSOS {

    export class Memory {
        public Data: Array<String>;
        constructor(public byteSize:number) {
            this.byteSize = byteSize;

            this.Data = new Array(byteSize);
            this.init();

        }

        public init(): void {
            for (var i =0; i< this.byteSize; i++){
                this.Data[i] ="00";
            }
            
        }
    }
}
