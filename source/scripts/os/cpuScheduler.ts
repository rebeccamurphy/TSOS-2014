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
                    public reorder :boolean=false,
                    public clearMemCheck:boolean =false

                    ) {

        }

        public loadProgramMem(program, priority){
            //if loading a program directly into memory   
            //create new PCB
            var currPCB = new TSOS.PCB();
            //add to list of PCBs 
            //because we're starting with just loading 1 program in memory the base will be 0 for now
            currPCB.base = _MemoryManager.nextFreeMem;

            //set the pc of the pcb to start at the base
            currPCB.PC = 0;
            //set the limit?
            currPCB.limit = currPCB.base + _ProgramSize-1;

            //set the pcb state
            currPCB.state = State.New;

            //set the priority
            if (priority !== undefined)
                currPCB.priority = priority;
            
            //Put the program in the resident queue
        	this.residentQueue.enqueue(currPCB);
            //put the program in memory

            TSOS.Control.updateAllQueueDisplays();
            //update the queue display

            //update memory
            _MemoryManager.loadProgram(currPCB, program);

            //return program number
            return (currPCB.pid).toString();

        }
        public loadProgramDisk(program, priority){
             
            //create new PCB
            var currPCB = new TSOS.PCB();
            //add to list of PCBs 
            //because we're starting with just loading 1 program in memory the base will be 0 for now
            currPCB.base = null;

            //set the pc of the pcb to start at the base
            currPCB.PC = 0;
            //set the limit?
            currPCB.limit = null;

            //set the pcb state
            currPCB.state = State.New;
            //set the location to in disk
            currPCB.location = Locations.Disk;
            //set the priority
            if (priority !== undefined)
                currPCB.priority = priority;
            
            //add to the resident queue
            this.residentQueue.enqueue(currPCB);
            //update the displays
            TSOS.Control.updateAllQueueDisplays();
            //write program to disk
            _KernelInterruptQueue.enqueue(new Interrupt(FILESYSTEM_IRQ, [DiskAction.Write, SWAP_FILE_START_CHAR+String(currPCB.pid), program.join('')]));

            //return pid
            return currPCB.pid;

        }
        public clearMem(){
            //clear current executing program
            this.clearMemCheck=true;
            var tempProgramPCB = _ExecutingProgramPCB;  
            if (_ExecutingProgramPCB.location === Locations.Memory)
                _ExecutingProgramPID=-1; //so we don't accidentalyl enqueue a bunch of interrupts

            _KernelInterruptQueue.enqueue(new Interrupt(PROCESS_KILLED_IRQ, tempProgramPCB.pid));
            var sizeRQ = this.readyQueue.getSize();
            var sizeRL = this.residentQueue.getSize();
            //clear programs in memory from ready queue
            for (var i=0; i<sizeRQ; i++){
                tempProgramPCB = this.readyQueue.dequeue();
                //check if the program is in memory 
                if (tempProgramPCB.location === Locations.Memory){
                    //and kill program if so
                    _KernelInterruptQueue.enqueue(new Interrupt(PROCESS_KILLED_IRQ, tempProgramPCB.pid));
                }
                this.readyQueue.enqueue(tempProgramPCB);
            }
            //clear programs in memory from resident list.
            for (var i=0; i<sizeRL; i++){
                tempProgramPCB = this.residentQueue.dequeue();
                if (tempProgramPCB.location === Locations.Memory){
                    _KernelInterruptQueue.enqueue(new Interrupt(PROCESS_KILLED_IRQ, tempProgramPCB.pid));
                }
                this.residentQueue.enqueue(tempProgramPCB);
            }
            _KernelInterruptQueue.enqueue(new Interrupt(CONTEXT_SWITCH_IRQ, _ExecutingProgramPCB.pid));
        }
        public clearDisk(){
            debugger;
            var tempProgramPCB;
            var sizeRQ = this.readyQueue.getSize();
            var sizeRL = this.residentQueue.getSize();
            //clear programs in memory from ready queue
            for (var i=0; i<sizeRQ; i++){
                tempProgramPCB = this.readyQueue.dequeue();
                //check if the program is in disk
                if (tempProgramPCB.location === Locations.Disk){
                    //and kill program if so
                    _KernelInterruptQueue.enqueue(new Interrupt(PROCESS_KILLED_IRQ, tempProgramPCB.pid));
                }
                this.readyQueue.enqueue(tempProgramPCB);
            }
            //clear programs in memory from resident list.
            for (var i=0; i<sizeRL; i++){
                tempProgramPCB = this.residentQueue.dequeue();
                if (tempProgramPCB.location === Locations.Disk){
                    this.residentQueue.getAndRemove(tempProgramPCB.pid);
                    _KernelInterruptQueue.enqueue(new Interrupt(PROCESS_KILLED_IRQ, tempProgramPCB.pid));
                }
                this.residentQueue.enqueue(tempProgramPCB);
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
                if (tempProgramPCB.location ===Locations.Memory){
                    _ExecutingProgramPCB = this.readyQueue.dequeue();
                    _ExecutingProgramPID = _ExecutingProgramPCB.pid;
                  //load it into the cpu
                  _CPU.loadProgram();
                }
                else if (tempProgramPCB.location === Locations.Disk) {
                    _ExecutingProgramPCB = null;
                    this.contextSwitch();        
                }
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
            this.clearMemCheck=false;
            debugger;
        	if (_ExecutingProgramPCB!==null && _ExecutingProgramPCB.state!==State.Killed){
        		//enqueue the current executing program back into the ready queue
        		_ExecutingProgramPCB.state = State.Ready;
        		this.readyQueue.enqueue(_ExecutingProgramPCB);
        	}
        	//reset the counter
        	this.counter =0;
        	//dequeue next program in line
        	_ExecutingProgramPCB = this.readyQueue.dequeue();
        	_ExecutingProgramPID = _ExecutingProgramPCB.pid;
            //check if the program is on disk()
            if (_ExecutingProgramPCB.location === Locations.Disk) {
                
                //enqueue an interupt to read swap from disk to so there is more room
                 _KernelInterruptQueue.enqueue(new Interrupt(FILESYSTEM_IRQ, [DiskAction.ReadSwap, SWAP_FILE_START_CHAR +_ExecutingProgramPID]));
                
                // then check if there is an open spot in memory from another process being completed
                if (_MemoryManager.nextFreeMem!==null){
                    //load the program into the free space
                    _ExecutingProgramPCB.base = _MemoryManager.nextFreeMem;
                    _ExecutingProgramPCB.limit = _ExecutingProgramPCB.base + _ProgramSize -1;

                }
                else{
                    //we need to remove one program from memory and load the executing pcb to memory
                    var lastPCB = this.residentQueue.getLeastImportant();
                    //if no programs in readyqueue in memory try resident list
                    var useReady=lastPCB===null;
                    if (useReady)
                        lastPCB = this.readyQueue.getLeastImportant();
                    var lastProgram=[];
                    //get the last program in the queue from memory 
                    lastProgram = _MemoryManager.getProgram(lastPCB);
                    var lastProgramStr =lastProgram.join('')
                    //set the base and limit of the Executing PCB to the lastPCB
                    _ExecutingProgramPCB.base = lastPCB.base;
                    _ExecutingProgramPCB.limit = lastPCB.limit;
                    //set the location of the last program to disk
                    lastPCB.location =Locations.Disk;
                    //write the last program to disk
                    _KernelInterruptQueue.enqueue(new Interrupt(FILESYSTEM_IRQ, [DiskAction.Write, SWAP_FILE_START_CHAR +lastPCB.pid, lastProgramStr]));
                    //finally splicein  the lastpcb
                    if (useReady)
                        this.readyQueue.addLeastImportant(lastPCB);
                    else
                        this.residentQueue.addLeastImportant(lastPCB);
                }
                
            }
            else{
        	   //load it into the cpu
        	   _CPU.loadProgram();
            }
        }
        public stopRunning(pid){
            debugger;
        	//stops a program if it is currently running and puts it back on the resident queue with a new pcb
        	var tempProgramPCB =null;

        	if (_ExecutingProgramPCB!== undefined &&_ExecutingProgramPCB.pid === pid){
        		//reset the pcb so if the program is restarted it will start from the beginning
        		tempProgramPCB = _ExecutingProgramPCB;	
        		
        		//reset the executing program variables
                if (!this.clearMem()){
        		  _ExecutingProgramPID=null;
        		  _ExecutingProgramPCB=null;
                }
        	}
        	else{
        		//remove the program from the ready queue
        		tempProgramPCB = this.readyQueue.getAndRemove(pid);
                if (tempProgramPCB === null)
                    tempProgramPCB  = this.residentQueue.getAndRemove(pid);
        	}
            //mark the memory the program was living in as free
            if (tempProgramPCB.location===Locations.Memory)
                _MemoryManager.setNextFreeBlock(tempProgramPCB);
            //update the cpu display
            _CPU.updateDisplay();
        	//finally enqueue an interrupt
            return tempProgramPCB;
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
