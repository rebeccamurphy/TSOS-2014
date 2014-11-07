/*
FUTURE ME PUT HELLA SWEET COMMENTS HERE. 
*/

module TSOS {
    export class cpuScheduler {
        constructor( 
                    public readyQueue: Queue = new Queue(),
                    public residentQueue: Queue = new Queue()
                    ) {

        }

        public contextSwitch(){}
    }
}
