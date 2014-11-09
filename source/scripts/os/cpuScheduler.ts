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
        public runAllPrograms(){
        	//load all programs in the resident queue into the ready queue
        	while(!this.residentQueue.isEmpty()){
        		this.readyQueue.enqueue(this.residentQueue.dequeue());
        	}
        	//set the current runnining program
        	_ExecutingProgramPCB = this.readyQueue.dequeue();
        	_ExecutingProgramPID = _ExecutingProgramPCB.pid;

        	_CPU.loadProgram();

        }
        public contextSwitch(){
        	if (_ExecutingProgramPCB!==null){
        		//enqueue the current executing program back into the ready queue
        		this.readyQueue.enqueue(_ExecutingProgramPCB);
        	}
        	//reset the counter
        	this.counter =0;

        	//dequeue next program in line
        	_ExecutingProgramPCB = this.readyQueue.dequeue();
        	_ExecutingProgramPID = _ExecutingProgramPCB.pid;
        	//load it into the cpu
        	_CPU.loadProgram();

        }
        public stopRunning(pid){
        	//stops a program if it is currently running and puts it back on the resident queue with a new pcb
        	if (_ExecutingProgramPID === pid){
        		//reset the pcb so if the program is restarted it will start from the beginning
        		_ExecutingProgramPCB.reset();
        		//put the program back in the resident queue because it is still in memory
        		this.residentQueue.enqueue(_ExecutingProgramPCB);
        		//reset the executing program variables
        		_ExecutingProgramPID=null;
        		_ExecutingProgramPCB=null;
        	}
        	else{
        		//remove the program from the ready queue
        		var tempProgramPCB = this.readyQueue.find(pid);
        		//put the program back in the resident queue because it is still in memory
        		this.residentQueue.enqueue(tempProgramPCB);
        	}
        	//finally enqueue an interrupt
        	_KernelInterruptQueue.enqueue(new Interrupt(PROCESS_KILLED_IRQ, pid));
        }
    }
}
