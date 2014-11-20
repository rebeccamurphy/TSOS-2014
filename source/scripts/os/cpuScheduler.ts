/*
FUTURE ME PUT HELLA SWEET COMMENTS HERE. 
*/

module TSOS {
    export class cpuScheduler {
        constructor( 
                    public readyQueue: Queue = new Queue(),
                    public residentQueue: Queue = new Queue(),
                    public terminatedQueue:Queue = new Queue(),
                    public counter :number =0,
                    public reorder :boolean=false

                    ) {

        }

        public loadProgram(pcb){
        	this.residentQueue.enqueue(pcb);
            TSOS.Control.updateAllQueueDisplays();
            //update the queue display

        }
        public clearMem(){
            //clear current executing program
            debugger;
            var tempProgramPCB = _ExecutingProgramPCB;
            _ExecutingProgramPCB =null;
            _ExecutingProgramPID =null;

            _KernelInterruptQueue.enqueue(new Interrupt(PROCESS_KILLED_IRQ, tempProgramPCB));
            var tempReadyQueue = this.readyQueue;
            var tempResidentQueue = this.residentQueue;
            //clear programs in memory from ready queue
            while (! tempReadyQueue.isEmpty() ){
                tempProgramPCB = tempReadyQueue.dequeue();
                //check if the program is in memory 
                if (tempProgramPCB.location === Locations.Memory){
                    //remove program from the ready queue
                    this.readyQueue.getAndRemove(tempProgramPCB.pid);
                    //and kill program if so
                    _KernelInterruptQueue.enqueue(new Interrupt(PROCESS_KILLED_IRQ, tempProgramPCB));
                }
            }
            //clear programs in memory from resident list.
            while (!tempResidentQueue.isEmpty()){
                tempProgramPCB = tempResidentQueue.dequeue();
                if (tempProgramPCB.location === Locations.Memory){
                    this.residentQueue.getAndRemove(tempProgramPCB.pid);
                    _KernelInterruptQueue.enqueue(new Interrupt(PROCESS_KILLED_IRQ, tempProgramPCB));
                }
            }
        }
        public emptyReadyQueue() :boolean {
            if (this.readyQueue.getSize()===0){
                this.counter=0;
            }
            return this.readyQueue.getSize()===0;
        }
        public runProgram(){
        	//dequeue the program we want to execute from the resident queue
        	var tempProgramPCB = this.residentQueue.getAndRemove(_ExecutingProgramPID);

        	//enqueue program to the ready queue
        	this.readyQueue.enqueue(tempProgramPCB);

        	//check if the CPU is not executing, thus we need to set the executing program
        	if(!_CPU.isExecuting){
        		_ExecutingProgramPCB = this.readyQueue.dequeue();
        		_ExecutingProgramPID = _ExecutingProgramPCB.pid;
                //load it into the cpu
                _CPU.loadProgram();
        	}
            if (SCHEDULE_TYPE === scheduleType.priority){
                this.reorder = true;
            }

        	
        }
        public runAllPrograms(){
        	//load all programs in the resident queue into the ready queue
        	while(!this.residentQueue.isEmpty()){
        		this.readyQueue.enqueue(this.residentQueue.dequeue());
        	}

            if (SCHEDULE_TYPE === scheduleType.priority){
                this.readyQueue.priorityOrder();
            }
        	//set the current runnining program
        	_ExecutingProgramPCB = this.readyQueue.dequeue();
        	_ExecutingProgramPID = _ExecutingProgramPCB.pid;

        	_CPU.loadProgram();

        }
        public contextSwitch(){
        	if (_ExecutingProgramPCB!==null){
        		//enqueue the current executing program back into the ready queue
        		_ExecutingProgramPCB.state = State.Ready;
        		this.readyQueue.enqueue(_ExecutingProgramPCB);
        	}
        	//reset the counter
        	this.counter =0;

        	//dequeue next program in line
        	_ExecutingProgramPCB = this.readyQueue.dequeue();
        	_ExecutingProgramPID = _ExecutingProgramPCB.pid;
        	//load it into the cpu
            //TODO make sure the program is loaded into memory 
        	_CPU.loadProgram();

        }
        public stopRunning(pid){
            
        	//stops a program if it is currently running and puts it back on the resident queue with a new pcb
        	var tempProgramPCB =null;
        	if (_ExecutingProgramPID === pid){
        		//reset the pcb so if the program is restarted it will start from the beginning
        		tempProgramPCB = _ExecutingProgramPCB;	
        		
        		//reset the executing program variables
        		_ExecutingProgramPID=null;
        		_ExecutingProgramPCB=null;
        	}
        	else{
        		//remove the program from the ready queue
        		tempProgramPCB = this.readyQueue.getAndRemove(pid);
        	}
            //mark the memory the program was living in as free
            _MemoryManager.setNextFreeBlock(tempProgramPCB);
            //update the cpu display
            _CPU.updateDisplay();
        	//finally enqueue an interrupt
        	_KernelInterruptQueue.enqueue(new Interrupt(PROCESS_KILLED_IRQ, tempProgramPCB));
        }
        public switchScheduling(){
            switch(SCHEDULE_TYPE){
                case scheduleType.rr:{
                    this.counter =0; 
                    break;
                } 
                case scheduleType.fcfs:{
                    if (_CPU.isExecuting){
                        this.readyQueue.enqueue(_ExecutingProgramPCB);
                        this.readyQueue.order();
                        _ExecutingProgramPCB =this.readyQueue.dequeue();
                        _ExecutingProgramPID =_ExecutingProgramPCB.pid; 
                        _CPU.loadProgram();
                    }
                    else {
                        this.readyQueue.order();
                    }

                    break;
                } 
                case scheduleType.priority:{ 
                        //because non-premptive just order the queue
                        this.readyQueue.priorityOrder();
                    break;
                }
            }
        }
    }
}
