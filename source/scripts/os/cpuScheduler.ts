/*
FUTURE ME PUT HELLA SWEET COMMENTS HERE. 
*/

module TSOS {
    export class cpuScheduler {
        constructor( 
                    public readyQueue: Queue = new Queue(),
                    public residentQueue: Queue = new Queue(),
                    public counter :number =0

                    ) {

        }

        public runProgram(){
        	//dequeue the program we want to execute
        	_ExecutingProgramPCB = this.readyQueue.dequeue();
        	_ExecutingProgramPID = _ExecutingProgramPCB.PID;
        	//load it into the cpu
        	_CPU.loadProgram();
        }
        public contextSwitch(){
        	//enqueue the current executing program back into the ready queue
        	this.readyQueue.enqueue(_ExecutingProgramPCB);
        	
        	//reset the counter
        	this.counter =0;
        	//call run program to get the next program in the queue
        	this.runProgram();


        }
    }
}
