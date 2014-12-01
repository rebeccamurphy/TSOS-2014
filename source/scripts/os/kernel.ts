/* ------------
     Kernel.ts

     Requires globals.ts

     Routines for the Operating System, NOT the host.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */

module TSOS {

    export class Kernel {
        //
        // OS Startup and Shutdown Routines
        //
        public krnBootstrap() {      // Page 8. {
            Control.hostLog("bootstrap", "host");  // Use hostLog because we ALWAYS want this, even if _Trace is off.
            debugger;
            // Initialize our global queues.
            _KernelInterruptQueue = new Queue();  // A (currently) non-priority queue for interrupt requests (IRQs).
            _KernelBuffers = new Array();         // Buffers... for the kernel.
            _KernelInputQueue = new Queue();      // Where device input lands before being processed out somewhere.
            _Console = new Console();          // The command line interface / console I/O device.

            // Initialize the console.
            if (!_StartUp)
                _Console.init();

            // Initialize standard input and output to the _Console.
            _StdIn  = _Console;
            _StdOut = _Console;

            // Load the Keyboard Device Driver
            this.krnTrace("Loading the keyboard device driver.");
            _krnKeyboardDriver = new DeviceDriverKeyboard();     // Construct it.
            _krnKeyboardDriver.driverEntry();                    // Call the driverEntry() initialization routine.
            this.krnTrace(_krnKeyboardDriver.status);

            // Load the FileSystem Device Driver
            this.krnTrace("Loading the file system device driver.");
            _krnFileSystemDriver = new DeviceDriverFileSystem();     // Construct it.
            _krnFileSystemDriver.driverEntry();                    // Call the driverEntry() initialization routine.
            this.krnTrace(_krnFileSystemDriver.status);


            
            //
            // ... more?
            //

            // Enable the OS Interrupts.  (Not the CPU clock interrupt, as that is done in the hardware sim.)
            this.krnTrace("Enabling the interrupts.");
            this.krnEnableInterrupts();

            // Launch the shell.


            //play start up screen
            if (_StartUp){
            TSOS.Control.playStartUpNoise();
            var this2 = this;
            setTimeout(function() {
                TSOS.Control.startUp();
                _Console.init(); 
                // Launch the shell.
                this2.krnTrace("Creating and Launching the shell.");
                _OsShell = new Shell();
                _OsShell.init();
                }, 8000);
            }
            else{
                TSOS.Control.startUp();    
            }
            
            if (!_StartUp){
                // Launch the shell.
                this.krnTrace("Creating and Launching the shell.");
                _OsShell = new Shell();
                _OsShell.init();
            }
            // Finally, initiate testing.
            if (_GLaDOS) {
                _GLaDOS.afterStartup();
            }

        }

        public krnShutdown() {
            this.krnTrace("begin shutdown OS");
            // TODO: Check for running processes.  Alert if there are some, alert and stop.  Else...
            // ... Disable the Interrupts.
            this.krnTrace("Disabling the interrupts.");
            this.krnDisableInterrupts();
            //
            // Unload the Device Drivers?
            // More?
            //
            this.krnTrace("end shutdown OS");
        }


        public krnOnCPUClockPulse() {
            /* This gets called from the host hardware sim every time there is a hardware clock pulse.
               This is NOT the same as a TIMER, which causes an interrupt and is handled like other interrupts.
               This, on the other hand, is the clock pulse from the hardware (or host) that tells the kernel
               that it has to look for interrupts and process them if it finds any.                           */

            // Check for an interrupt, are any. Page 560

            if (_KernelInterruptQueue.getSize() > 0) {
                // Process the first interrupt on the interrupt queue.
                // TODO: Implement a priority queue based on the IRQ number/id to enforce interrupt priority.
                var interrupt = _KernelInterruptQueue.dequeue();
                this.krnInterruptHandler(interrupt.irq, interrupt.params);
            } else if ( (_CPU.isExecuting && _SingleStep && _Stepping) || (_CPU.isExecuting && !_SingleStep)) { 
                //clear the interval of the clock pulse
                
                switch(SCHEDULE_TYPE){
                    case scheduleType.rr:{ 
                        if (_Scheduler.counter < QUANTUM || _Scheduler.emptyReadyQueue())
                            _CPU.cycle();
                        else if (!_Scheduler.emptyReadyQueue()){
                            //perform a context switch
                            _KernelInterruptQueue.enqueue(new Interrupt(CONTEXT_SWITCH_IRQ, _ExecutingProgramPID));
                        }
                        break;
                    }
                    case scheduleType.fcfs:{
                        _CPU.cycle();
                        break;
                    }
                    case scheduleType.priority:{
                        if (_Scheduler.reorder){
                            _Scheduler.readyQueue.priorityOrder();
                            _Scheduler.reorder = false;
                        }
                        _CPU.cycle();
                        break;
                    }
                }

            } else if (!_SingleStep){// If there are no interrupts and there is nothing being executed then just be idle. {
                this.krnTrace("Idle");
            }
        }


        //
        // Interrupt Handling
        //
        public krnEnableInterrupts() {
            // Keyboard
            Devices.hostEnableKeyboardInterrupt();
            // Put more here.
        }

        public krnDisableInterrupts() {
            // Keyboard
            Devices.hostDisableKeyboardInterrupt();
            // Put more here.
        }

        public krnInterruptHandler(irq, params) {
            // This is the Interrupt Handler Routine.  Pages 8 and 560. {
            // Trace our entrance here so we can compute Interrupt Latency by analyzing the log file later on.  Page 766.
            this.krnTrace("Handling IRQ~" + irq);

            // Invoke the requested Interrupt Service Routine via Switch/Case rather than an Interrupt Vector.
            // TODO: Consider using an Interrupt Vector in the future.
            // Note: There is no need to "dismiss" or acknowledge the interrupts in our design here.
            //       Maybe the hardware simulation will grow to support/require that in the future.
            switch (irq) {
                case TIMER_IRQ:
                    this.krnTimerISR();              // Kernel built-in routine for timers (not the clock).
                    break;
                case KEYBOARD_IRQ:
                    _krnKeyboardDriver.isr(params);   // Kernel mode device driver
                    _StdIn.handleInput();
                    break;
                case FILESYSTEM_IRQ:{
                    var fileName = params[1]===undefined? "": " "+params[1];
                    this.krnTrace("The Disk is " + DiskActions[params[0]] + fileName+".");
                    _krnFileSystemDriver.isr(params);
                    this.krnTrace("The Disk is done " + DiskActions[params[0]]  +fileName+".");
                    
                    break;
                }
                case SWAPFILE_IRQ:{
                    //finishing loading program into memory after reading the disk file
                     
                    this.krnTrace("Loading swap program into memory.");
                    _MemoryManager.loadProgram(_ExecutingProgramPCB, _ExecutingProgram);
                    _ExecutingProgramPCB.location= Locations.Memory;
                    //load it into the cpu
                    _CPU.loadProgram();
                    _ExecutingProgram = null;
                    break;
                }

                case RUN_PROGRAM_IRQ:{
                    //start the program
                    //since where just running the first program in mem, just setting isexecuting true
                    if (params!=="all")
                        _Scheduler.runProgram(); 
                    else
                        _Scheduler.runAllPrograms();
                    _CPU.isExecuting = true;
                    break;
                }
                case UNKNOWN_OP_CODE: {
                    //handles unknown opcode in memory
                    //first log the error
                    this.krnTrace("Unknown opcode: " + _MemoryManager.getMemory(_CPU.PC-1));
                    //then stop the program from executing
                    _Scheduler.stopRunning(_ExecutingProgramPCB);
                    break;
                }
                case SYS_OPCODE_IRQ:{
                    //printing something from memory to console
                    _StdIn.handleSysOpCode();
                    break;
                }
                case CPU_BREAK_IRQ:{
                    //TODO make a separate context switch interrupt
                    //clear program from memory
                    this.krnTrace("PID: " +params +" has reached a break.");
                    _MemoryManager.clearProgramFromMemory();
                    this.krnTrace("PID: " +params +" has been cleared from memory.");
                    
                    //set state to done
                    _ExecutingProgramPCB.state =State.Done;
                    //add program to terminated queue
                    _Scheduler.terminatedQueue.enqueue(_ExecutingProgramPCB);

                    //clear executing program
                    _ExecutingProgramPCB =null;
                    var tempPID = _ExecutingProgramPID;
                    _ExecutingProgramPID =null;

                    //update the display
                    _CPU.updateDisplay();
                    
                    //check if the ready queue is empty, if not continue executing
                    if (_Scheduler.readyQueue.isEmpty()){
                        _CPU.isExecuting = false; //stop the cpu from executing
                        this.krnTrace("CPU had stopped executing.");
                    }
                    else
                        _KernelInterruptQueue.enqueue(new Interrupt(CONTEXT_SWITCH_IRQ, tempPID));
                    break;
                }
                case CONTEXT_SWITCH_IRQ:{
                    _Scheduler.contextSwitch();
                    this.krnTrace("Switching from PID: " + params +" to PID: "+_ExecutingProgramPID);
                    break;
                }
                case MEMORY_ACCESS_VIOLATION_IRQ:{
                    //log the error
                    this.krnTrace("Memory access violation in program PID: " + _ExecutingProgramPID + 
                        " Attempted to access " + parseInt(params));
                    _Scheduler.stopRunning(_ExecutingProgramPID);
                    
                    break;
                }
                case PROCESS_KILLED_IRQ:{
                    //set the state of the program to killed
                    params.state = State.Killed;

                    //add program to terminated queue
                    _Scheduler.terminatedQueue.enqueue(params);

                    //log event
                    this.krnTrace("PID: "+ params.pid +" has been killed.");
                    
                    //check if the ready queue is empty, if not continue executing
                    if (_Scheduler.readyQueue.isEmpty()&&_ExecutingProgramPID===null){
                        _CPU.isExecuting = false; //stop the cpu from executing
                        this.krnTrace("CPU had stopped executing.");
                    }
                    else if (_ExecutingProgramPID===null){
                        //only perform a context switch if the running process was killed
                        _KernelInterruptQueue.enqueue(new Interrupt(CONTEXT_SWITCH_IRQ, params.pid));
                    }
                    TSOS.Control.updateAllQueueDisplays();
                    break;
                }
                case CLEAR_MEMORY_IRQ:{  
                    this.krnTrace("Memory is being cleared.");                          
                    //clear the memory
                    _MemoryManager= new MemoryManager();
                    _MemoryManager.init();
                    //clear the scheduler
                    _Scheduler.clearMem();  
                    break;
                }
                case SET_SCHEDULE_TYPE_IRQ:{
                    var previous =scheduleTypes[SCHEDULE_TYPE];
                    //set the correct schedule type
                    switch (params){
                        case "rr":{
                            SCHEDULE_TYPE = scheduleType.rr; 
                            break;
                        } 
                        case "fcfs":{
                            SCHEDULE_TYPE= scheduleType.fcfs; 
                            break;
                        } 
                        case "priority":{
                            SCHEDULE_TYPE = scheduleType.priority; 
                            break;
                        }
                        default: {
                            _StdOut.putText("Invalid type of scheduling. ");
                        }
                    }
                    this.krnTrace("Switching scheduling from " +previous +" to "+ scheduleTypes[SCHEDULE_TYPE]);
                    _Scheduler.switchScheduling();
                    //update to display the correct type 
                    TSOS.Control.updateScheduleType();

                    break;
                }

                default:
                    this.krnTrapError("Invalid Interrupt Request. irq=" + irq + " params=[" + params + "]");
            }
        }

        public krnTimerISR() {
            // The built-in TIMER (not clock) Interrupt Service Routine (as opposed to an ISR coming from a device driver). {
            // Check multiprogramming parameters and enforce quanta here. Call the scheduler / context switch here if necessary.
        }

        //
        // System Calls... that generate software interrupts via tha Application Programming Interface library routines.
        //
        // Some ideas:
        // - ReadConsole
        // - WriteConsole
        // - CreateProcess
        // - ExitProcess
        // - WaitForProcessToExit
        // - CreateFile
        // - OpenFile
        // - ReadFile
        // - WriteFile
        // - CloseFile


        //
        // OS Utility Routines
        //
        public krnTrace(msg: string) {
             // Check globals to see if trace is set ON.  If so, then (maybe) log the message.
             if (_Trace) {
                if (msg === "Idle") {
                    // We can't log every idle clock pulse because it would lag the browser very quickly.
                    if (_OSclock % 10 == 0) {
                        // Check the CPU_CLOCK_INTERVAL in globals.ts for an
                        // idea of the tick rate and adjust this line accordingly.
                        Control.hostLog(msg, "OS");
                    }
                } else {
                    Control.hostLog(msg, "OS");
                }
             }
        }

        public krnTrapError(msg) {
            Control.hostLog("OS ERROR - TRAP: " + msg);
            _Console.computerOver();//Display BSOD
            this.krnShutdown();
        }
    }
}
