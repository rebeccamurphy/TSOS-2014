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
        	//dequeue the program we want to execute from the resident queue
        	var tempProgramPCB = this.residentQueue.find(_ExecutingProgramPID);

        	//enqueue program to the ready queue
        	this.readyQueue.enqueue(tempProgramPCB);

        	//check if the CPU is not executing, thus we need to set the executing program
        	if(!_CPU.isExecuting){
        		_ExecutingProgramPCB = this.readyQueue.dequeue();
        		_ExecutingProgramPID = _ExecutingProgramPCB.pid;
        	}
        	//load it into the cpu
        	_CPU.loadProgram();
        }
        public contextSwitch(){
        	//enqueue the current executing program back into the ready queue
        	this.readyQueue.enqueue(_ExecutingProgramPCB);
        	
        	//reset the counter
        	this.counter =0;

        	//dequeue next program in line
        	_ExecutingProgramPCB = this.readyQueue.dequeue();

        	//load it into the cpu
        	_CPU.loadProgram();

        }
    }
}
