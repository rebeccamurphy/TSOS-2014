///<reference path="shellCommand.ts" />
///<reference path="userCommand.ts" />
///<reference path="../utils.ts" />

/* ------------
   Shell.ts

   The OS Shell - The "command line interface" (CLI) for the console.
   ------------ */

// TODO: Write a base class / prototype for system services and let Shell inherit from it.

module TSOS {
    export class Shell {
        // Properties
        public promptStr = ">";
        public commandList = [];
        public curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf], [ovgpu],[qhpx],[onol], [Wrfhf]";
        public apologies = "[sorry]";
        public backdoors = "[jeff]";
        constructor() {

        }

        public init() {
            var sc = null;
            //
            // Load the command list.

            // ver
            sc = new ShellCommand(this.shellVer,
                                  "ver",
                                  "- Displays the current version data.");
            this.commandList[this.commandList.length] = sc;

            // help
            sc = new ShellCommand(this.shellHelp,
                                  "help",
                                  "- This is the help command. Seek help.");
            this.commandList[this.commandList.length] = sc;

            // shutdown
            sc = new ShellCommand(this.shellShutdown,
                                  "shutdown",
                                  "- Shuts down the virtual OS but leaves the underlying hardware simulation running.");
            this.commandList[this.commandList.length] = sc;

            // cls
            sc = new ShellCommand(this.shellCls,
                                  "cls",
                                  "- Clears the screen and resets the cursor position.");
            this.commandList[this.commandList.length] = sc;

            // man <topic>
            sc = new ShellCommand(this.shellMan,
                                  "man",
                                  "<topic> - Displays the MANual page for <topic>.");
            this.commandList[this.commandList.length] = sc;

            // trace <on | off>
            sc = new ShellCommand(this.shellTrace,
                                  "trace",
                                  "<on | off> - Turns the OS trace on or off.");
            this.commandList[this.commandList.length] = sc;

            // rot13 <string>
            sc = new ShellCommand(this.shellRot13,
                                  "rot13",
                                  "<string> - Does rot13 obfuscation on <string>.");
            this.commandList[this.commandList.length] = sc;

            // prompt <string>
            sc = new ShellCommand(this.shellPrompt,
                                  "prompt",
                                  "<string> - Sets the prompt.");
            this.commandList[this.commandList.length] = sc;

            // date
            sc = new ShellCommand(this.shellDate,
                                  "date",
                                  "- Displays the current date.");
            this.commandList[this.commandList.length] = sc;

            // whereami
            sc = new ShellCommand(this.shellWhereAmI,
                                  "whereami",
                                  "- Displays your location.");
            this.commandList[this.commandList.length] = sc;

            // load
            sc = new ShellCommand(this.shellLoad,
                                  "load",
                                  "<number> - Loads user program from User Program Input with the given priority if specified.");
            this.commandList[this.commandList.length] = sc;
            
            // clearmem
            sc = new ShellCommand(this.shellClearMem,
                                  "clearmem",
                                  "<-force> - clears memory of all loaded programs if none are executing, add -force to force memory to clear running programs.");
            this.commandList[this.commandList.length] = sc;

            //run
            sc = new ShellCommand(this.shellRun,
                                  "run",
                                  "<number> - Runs program with id of <number> if the program is in memory.");
            this.commandList[this.commandList.length] = sc;

            //run all
            sc = new ShellCommand(this.shellRunAll,
                                  "runall",
                                  "- Runs all user programs loaded into memory. ");
            this.commandList[this.commandList.length] = sc;

            //set quantum
            sc = new ShellCommand(this.shellSetQuantum,
                                 "quantum",
                                 "<number> - Sets the quantum to the specified number.");
            this.commandList[this.commandList.length] = sc;

            //set default priority
            sc = new ShellCommand(this.shellSetDefaultPriority,
                                 "setdefaultpriority",
                                 "<number> - Sets the default to the specified number.");
            this.commandList[this.commandList.length] = sc;

            //set scheduling type
            sc = new ShellCommand(this.shellSetScheduling,
                                 "setschedule",
                                 "<rr, fcfs, priority> - Sets the scheduling to the specified type.");
            this.commandList[this.commandList.length] = sc;

            //set scheduling type
            sc = new ShellCommand(this.shellGetScheduling,
                                 "getschedule",
                                 "- Returns the currently scheduling type.");
            this.commandList[this.commandList.length] = sc;

            // BSOD
            sc = new ShellCommand(this.shellBSOD,
                                  "bsod",
                                  "- Tests kernel trapping an OS error.");
            this.commandList[this.commandList.length] = sc;

            // status <string>
            sc = new ShellCommand(this.shellStatus,
                                  "status",
                                  "<string> - Display's users entered status in host display.");
            this.commandList[this.commandList.length] = sc; // status

            //beepboop
            sc = new ShellCommand(this.shellBB,
                                  "beepboop",
                                  "- Converts hex program in ta to beepboop");
            this.commandList[this.commandList.length] = sc;

            //unbeepboop
            sc = new ShellCommand(this.shellUnBB,
                                  "unbeepboop",
                                  "- Converts beepboop program in ta to hex.");
            this.commandList[this.commandList.length] = sc;

            // processes - list the running processes and their IDs
            sc = new ShellCommand(this.shellDisplayActiveProcesses,
                                  "ps",
                                  "- List the running processes and their IDs");
            this.commandList[this.commandList.length] = sc;            
            
            // kill <id> - kills the specified process id.
            sc = new ShellCommand(this.shellKillProcess,
                                  "kill",
                                  "<int,*> - Kill the specified process if it is running. * kills all.");
            this.commandList[this.commandList.length] = sc;    

            // format  -Initialize  all blocks  in  all sectors in  all tracks and display a  message denoting    success or  failure.    
            sc = new ShellCommand(this.shellFormatDisk,
                                  "format",
                                  "<-quick, -full, -force> - formats disk, defaults to full, quick allows data to be recovered, optional parameter of -force to force format even if program is running.");
            this.commandList[this.commandList.length] = sc;  

            // create   Create  the File    filename    and display a   message denoting    success or  failure.       
            sc = new ShellCommand(this.shellCreateFile,
                                  "create",
                                  "<filename, -force> - create file with filename specified, use -force to override file with the same name.");
            this.commandList[this.commandList.length] = sc;    
            
            // delete       Remove  filename    from    storage and display a   message denoting    success or  failure
            sc = new ShellCommand(this.shellDeleteFile,
                                  "delete",
                                  "<filename, *>, <-force> - deletes file with filename specified, or use * to delete all files. -force makes the file unrecoverable.");
            this.commandList[this.commandList.length] = sc;    
            
            // recover
            sc = new ShellCommand(this.shellRecoverFile,
                                  "recover",
                                  "<filename, *> - recovers file with filename specified from trash, or use * to recover all files from trash.");
            this.commandList[this.commandList.length] = sc;    
             

            //write - write   the data    inside  the quotes  to  filename    and display a   message denoting    success or  failure.    
            sc = new ShellCommand(this.shellWriteFile,
                                  "write",
                                  "<filename>, <-append, -overwrite>, 'data' - writes to data to specified file name. Defaults to"
                                   +"overwrite if not specified. Use /n for newlines in your data. If you have a lot of data you can paste it into the file data input.");
            this.commandList[this.commandList.length] = sc;

            //read -Read    and display the contents    of  filename    or  display an  error   if  something   went    wrong
            sc = new ShellCommand(this.shellReadFile,
                                  "read",
                                  "<filename> - Displays the contents of specified file.");
            this.commandList[this.commandList.length] = sc;


            // ls  -lists all files stored on disk
            sc = new ShellCommand(this.shellListFiles,
                                  "ls",
                                  "- lists all files in current directory.");
            this.commandList[this.commandList.length] = sc;

            // trash  -displays all files that are deleted but still recoverable
            sc = new ShellCommand(this.shellTrashFiles,
                                  "trash",
                                  "<-empty> - displays all deleted files that are still recoverable.");
            this.commandList[this.commandList.length] = sc;

            // startup  -displays all files that are deleted but still recoverable
            sc = new ShellCommand(this.shellStartUp,
                                  "startup",
                                  "<on | off> - displays/set start up option.");
            this.commandList[this.commandList.length] = sc;

            // Display the initial prompt.
            this.putPrompt();
        }

        public putPrompt(msg?) {
            if (msg===undefined)
              _StdOut.putText(this.promptStr);
            else{
              _StdOut.putText(msg);
              _StdOut.advanceLine();
              _StdOut.putText(this.promptStr);
            }
        }
        public putPromptNextLine(){
            _StdOut.advanceLine();
            _StdOut.putText(this.promptStr);
        }

        public handleInput(buffer) {
            _Kernel.krnTrace("Shell Command~" + buffer);
            //
            // Parse the input...
            //
            var userCommand = new UserCommand();
            userCommand = this.parseInput(buffer);
            // ... and assign the command and args to local variables.
            var cmd = userCommand.command;
            var args = userCommand.args;
            //
            // Determine the command and execute it.
            //
            // JavaScript may not support associative arrays in all browsers so we have to
            // iterate over the command list in attempt to find a match.  TODO: Is there a better way? Probably.
            var index = 0;
            var found = false;
            var fn = undefined;
            while (!found && index < this.commandList.length) {
                if (this.commandList[index].command === cmd) {
                    found = true;
                    fn = this.commandList[index].func;
                } else {
                    ++index;
                }
            }
            if (found) {
                this.execute(fn, args);
            } else {
                // It's not found, so check for curses and apologies before declaring the command invalid.
                if (this.curses.indexOf("[" + Utils.rot13(cmd) + "]") >= 0) {     // Check for curses. {
                    this.execute(this.shellCurse);
                } else if (this.apologies.indexOf("[" + cmd + "]") >= 0) {    // Check for apologies. {
                    this.execute(this.shellApology);
                } else if (this.backdoors.indexOf("[" + cmd + "]") >=0){    //Check for jeff
                    this.execute(this.shellBackdoor);
                } 

                else { // It's just a bad command. {
                    this.execute(this.shellInvalidCommand);
                }
            }
        }

        // args is an option parameter, ergo the ? which allows TypeScript to understand that
        public execute(fn, args?) {
            var nonPrompt:boolean= fn!==this.shellCreateFile &&fn!==this.shellFormatDisk && fn!==this.shellTrashFiles
                && fn !== this.shellReadFile && fn!==this.shellWriteFile && fn!==this.shellDeleteFile
                && fn!==this.shellRecoverFile && fn!==this.shellSetScheduling  &&fn!==this.shellKillProcess;
            // We just got a command, so advance the line...
            _StdOut.advanceLine();
            // ... call the command function passing in the args...
            fn(args);
            // Check to see if we need to advance the line again
            if (_StdOut.currentXPosition > 0 && nonPrompt) {
                _StdOut.advanceLine();
            }
            // ... and finally write the prompt again.
            if (fn !== this.shellBSOD &&  fn!==this.shellShutdown && nonPrompt) {
              //unless we're BS-ing or shutting down, or any disk commands
              this.putPrompt();
            }
        }

        public parseInput(buffer) {
            var retVal = new UserCommand();

            // 1. Remove leading and trailing spaces.
            buffer = Utils.trim(buffer);

            // 2. Lower-case it.
            buffer = buffer.toLowerCase();

            // 3. Separate on spaces so we can determine the command and command-line args, if any.
            var tempList = buffer.split(" ");

            // 4. Take the first (zeroth) element and use that as the command.
            var cmd = tempList.shift();  // Yes, you can do that to an array in JavaScript.  See the Queue class.
            // 4.1 Remove any left-over spaces.
            cmd = Utils.trim(cmd);
            // 4.2 Record it in the return value.
            retVal.command = cmd;

            // 5. Now create the args array from what's left.
            for (var i in tempList) {
                var arg = Utils.trim(tempList[i]);
                if (arg != "") {
                    retVal.args[retVal.args.length] = tempList[i];
                }
            }
            return retVal;
        }

        //
        // Shell Command Functions.  Again, not part of Shell() class per se', just called from there.
        //
        public shellInvalidCommand() {
            _StdOut.putText("Invalid Command. ");
            if (_SarcasticMode) {
                _StdOut.putText("Duh. Go back to your Speak & Spell.");
            } else {
                _StdOut.putText("Type 'help' for, well... help.");
                _Console.approxMatchCommand(); 
            }
        }
        
        public shellCurse() {
            _StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
            _StdOut.advanceLine();
            _StdOut.putText("Bitch.");
            _SarcasticMode = true;
        }

        public shellApology() {
           if (_SarcasticMode) {
              _StdOut.putText("Okay. I forgive you. This time.");
              _SarcasticMode = false;
           } else {
              _StdOut.putText("For what?");
           }
        }
        public shellBackdoor() {
           if (_SarcasticMode) {
              _StdOut.putText("Why would you think that would work? I wasn't born on the first of Jeff, 19JeffityJeff.");
              _SarcasticMode = false;
           } else {
              _StdOut.putText("If you blocked the pop up, use this: http://youtu.be/k6C_HjWr3Nk?t=1m58s");
              window.open("http://youtu.be/k6C_HjWr3Nk?t=1m58s", "_blank");
           }
        }

        public shellVer(args) {
            _StdOut.putText(APP_NAME + " version " + APP_VERSION);
        }

        public shellHelp(args) {
            if (_SarcasticMode) {
              _StdOut.putText("There is no helping you.");
            }
            else {
                _StdOut.putText("Commands:");
                for (var i in _OsShell.commandList) {
                    _StdOut.advanceLine();
                    _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
                }
                _StdOut.advanceLine();
                _StdOut.putText("For extended help press escape.");
            }
        }

        public shellShutdown(args) {
             _StdOut.putText("Shutting down...");
             // Call Kernel shutdown routine.
            _Kernel.krnShutdown();
        }

        public shellCls(args) {
            _StdOut.clearScreen();
            _StdOut.resetXY();
        }

        public shellMan(args) {
            if (args.length > 0) {
                var topic = args[0];
                switch (topic) {
                    case "help":
                        _StdOut.putText("Help displays a list of (hopefully) valid commands.");
                        break;
                    default:
                        _StdOut.putText("No manual entry for " + args[0] + ".");
                }
            } else {
                _StdOut.putText("Usage: man <topic>  Please supply a topic.");
            }
        }

        public shellTrace(args) {
            if (args.length > 0) {
                var setting = args[0];
                switch (setting) {
                    case "on":
                        if (_Trace && _SarcasticMode) {
                            _StdOut.putText("Trace is already on, dumbass.");
                        } else {
                            _Trace = true;
                            _StdOut.putText("Trace ON");
                        }

                        break;
                    case "off":
                        _Trace = false;
                        _StdOut.putText("Trace OFF");
                        break;
                    default:
                        _StdOut.putText("Invalid arguement.  Usage: trace <on | off>.");
                }
            } else {
                _StdOut.putText("Usage: trace <on | off>");
            }
        }

        public shellRot13(args) {
            if (args.length > 0) {
                // Requires Utils.ts for rot13() function.
                _StdOut.putText(args.join(' ') + " = '" + Utils.rot13(args.join(' ')) +"'");
            } else {
                _StdOut.putText("Usage: rot13 <string>  Please supply a string.");
            }
        }

        public shellPrompt(args) {
            if (args.length > 0) {
                _OsShell.promptStr = args[0];
            } else {
                _StdOut.putText("Usage: prompt <string>  Please supply a string.");
            }
        }

        public shellDate(args) {
            if (_SarcasticMode){
                _StdOut.putText("Time is meaningless.");
            }
            else {
                _StdOut.putText(Date());
            }
        }

        public shellWhereAmI(args) {

            if (_SarcasticMode){
                _StdOut.putText("Hopefully no where near me.");
            }
            else {
                var currentDate = new Date();
                if (currentDate.getHours() < 6)
                    _StdOut.putText("Well, you should be in bed.");
                else
                    _StdOut.putText("I don't even know where I am, man.");
            }
        }

        public shellLoad(args){
            //gets the text box content
            
            var boxContent  =TSOS.Control.getUserProgram();
            var tempProgramString = null;
            var tempPriority = args[0];
              
            if ((boxContent.indexOf("BEEP")==-1||boxContent.indexOf("BOOP")==-1)){
                //TODO do scheduling beepboop
                //inserts spaces into spaceless hex code because i assumed programs would have spaces. BB still needs spaces
                tempProgramString= boxContent.replace(/\s+/g, '');
                tempProgramString = tempProgramString.replace( /\n+/g, '' );
                tempProgramString= tempProgramString.match(/.{1,2}/g);            
            }
            else
                tempProgramString = boxContent.replace( /\n/g, " " ).split( " " );
            if (boxContent.length===0){
                if (_SarcasticMode)
                    _StdOut.putText("Enter something in the textarea first. Poopbutt.");
                else
                    _StdOut.putText("Enter something in the textarea first.");
            }
            else if (Utils.checkValidProgram(tempProgramString)==="HEX"){
                if (_MemoryManager.nextFreeMem===null ){
                  //_StdOut.putText("Cannot load program, memory full.");
                  //need to put program on disk
                  if (_krnFileSystemDriver.diskDataFull || _krnFileSystemDriver.diskFileFull){
                    _StdOut.putText("Hard drive full, please empty trash, remove some files, or run programs on disk.");
                    return;
                  }
                  else {
                    _StdOut.putText("Successfully loaded program.");
                    _StdOut.advanceLine();
                    _StdOut.putText("ProcessID: " + _Scheduler.loadProgramDisk(tempProgramString, tempPriority));
                    return;
                  }
                }
                else{
                  _StdOut.putText("Successfully loaded program.");
                  _StdOut.advanceLine();
                  _StdOut.putText("ProcessID: " + _Scheduler.loadProgramMem(tempProgramString, tempPriority));
                }
            }
            else if (Utils.checkValidProgram(tempProgramString)==="BB"){
                tempProgramString =Utils.convertProgram("runnableBB", tempProgramString);   
                if (_MemoryManager.nextFreeMem===null ){
                  //_StdOut.putText("Cannot load program, memory full.");
                  //need to put program on disk
                  if (_krnFileSystemDriver.diskDataFull || _krnFileSystemDriver.diskFileFull){
                    _StdOut.putText("Hard drive full, please empty trash, remove some files, or run programs on disk.");
                    return;
                  }
                  else {
                    _StdOut.putText("Successfully loaded program.");
                    _StdOut.advanceLine();
                    _StdOut.putText("ProcessID: " + _Scheduler.loadProgramDisk(tempProgramString, tempPriority));
                    return;
                  }
                }
                else{
                  _StdOut.putText("Successfully loaded program.");
                  _StdOut.advanceLine();
                  _StdOut.putText("ProcessID: " + _Scheduler.loadProgramMem(tempProgramString, tempPriority));
                }
            }
            else{
                if (_SarcasticMode)
                    _StdOut.putText("Invalid Format. "+Utils.rot13("Shpxvat")+" poopbutt.");
                else
                    _StdOut.putText("Invalid Format.");
            }
        }

        public shellClearMem(args){
            //clear the running programs and the memory.
            if (_CPU.isExecuting && args[0]!=="-force"){ 
                _StdOut.putText("Are you sure you want to clear memory? This will stop programs from executing. Enter clearmem -force instead.");
                return;    
            }
            else if (args[0] ==="-force"){
                //TODO clear memory interrupt
                _StdOut.putText("Forcing memory to be cleared.");
            }
            else {
                _StdOut.putText("Memory being cleared.");
            }
            _KernelInterruptQueue.enqueue(new Interrupt(CLEAR_MEMORY_IRQ));
        }
        
        public shellRun(args){
            if (args.length <=0)
                _StdOut.putText("You need a program id to run.");
            else if (!_Scheduler.residentQueue.inQueue(parseInt(args[0]))){
                //check for valid id
                _StdOut.putText("Invalid program id");
            }
            else if (_Scheduler.readyQueue.inQueue(parseInt(args[0]))){
                _StdOut.putText("Program is already waiting to execute.")
            }
            else if (_ExecutingProgramPID == parseInt(args[0]) ){
                if (!_SarcasticMode)
                    _StdOut.putText("Program is already executing");
                else
                    _StdOut.putText("Christ, give a second to run, it's already running.");
            }

            else {
                //run program 
                _ExecutingProgramPID = parseInt(args[0]);
                _KernelInterruptQueue.enqueue(new Interrupt(RUN_PROGRAM_IRQ));
                _StdOut.putText("Running PID " + args[0]);

            }
        }

        public shellRunAll(){
            if (_Scheduler.residentQueue.getSize()!==0)
                _KernelInterruptQueue.enqueue(new Interrupt(RUN_PROGRAM_IRQ, "all"));
            else
                _StdOut.putText("Load at least one program first.");
        }
        public shellSetQuantum(args){
            if (args.length<=0)
                _StdOut.putText("You need to actually input a number. Current Quantum: " +QUANTUM);
            else if (isNaN(args[0]))
                _StdOut.putText("Invalid quantum.");
            else{
                QUANTUM = parseInt(args[0])
                _StdOut.putText("Current Quantum is " + QUANTUM);
            }

        }
        public shellSetDefaultPriority(args){
            if (args.length<=0)
                _StdOut.putText("You need to actually input a number. Current default priority: " + DEFAULT_PRIORITY);
            else if (isNaN(args[0]))
                _StdOut.putText("Invalid default priority.");
            else{
                DEFAULT_PRIORITY= parseInt(args[0])
                _StdOut.putText("Current default priority is " + DEFAULT_PRIORITY);
            }            
        }
        public shellBSOD(args){
            _Kernel.krnTrapError("TEST");
        }

        public shellBB(args):void{
            var boxContent  =TSOS.Control.getUserProgram();
            
            var tempProgramString = null;
            tempProgramString = boxContent.replace( /\n/g, " " ).split( " " );
            var programType = Utils.checkValidProgram(tempProgramString);
            if (programType !== "HEX" && programType!== undefined){
                if (_SarcasticMode)
                    _StdOut.putText("Invalid hex program you pox upon humanity. If you want convert hex to "+
                        "beepboop put valid hex program in ta.");
                else
                    _StdOut.putText("Invalid hex program.If you want convert hex to "+ 
                        "beepboop put valid hex program in ta.");
            }
            else {
                Utils.convertProgram(programType, tempProgramString);
                _StdOut.putText("Successfully converted hex to beepboop.")
            }                
        }
        public shellUnBB(args):void{
            var boxContent  =TSOS.Control.getUserProgram();
            var tempProgramString = null;
            tempProgramString = boxContent.replace( /\n/g, " " ).split( " " );
            var programType = Utils.checkValidProgram(tempProgramString);
            if (programType !== "BB" &&programType!== undefined){
                if (_SarcasticMode)
                    _StdOut.putText("Invalid beepboop program you pox upon humanity. If you want convert beepboop to "+ 
                        "hex put valid beepboop program in ta.");
                else
                    _StdOut.putText("Invalid beepboop program.If you want convert beepboop to " +
                        "hex put valid beepboop program in ta.");
            }
            else {
                Utils.convertProgram(programType, tempProgramString);
                _StdOut.putText("Successfully converted beepboop to hex.");
            }
            
         }
        public shellStatus(args):void{
            var msg = args[0];
            if (msg.length !==0){
                TSOS.Control.displayUserStatus(msg);
            }
            else
                _StdOut.putText("Invalid status.");
        } 
        public shellDisplayActiveProcesses(args):void{
            var msg="";
            if (_Scheduler.readyQueue.isEmpty()&& _ExecutingProgramPID==null)
                _StdOut.putText("There are no running processes.");
            else {
                for(var i=0; i<_Scheduler.readyQueue.getSize(); i++)
                    msg += ", PID: " + _Scheduler.readyQueue.get(i).pid;
                _StdOut.putText("Current running processes... ");
                _StdOut.putText("PID: "+_ExecutingProgramPID +msg);
            }

        }
        public shellKillProcess(args):void{
          
            var program: any = parseInt(args[0])|| args[0];
            if (program==='*'){
              _KernelInterruptQueue.enqueue(new Interrupt(PROCESS_KILLED_IRQ, -1));
              _OsShell.putPromptNextLine();
            }
            else if (program==="me"){
              _StdOut.putText("If you insist.");
              _StdOut.advanceLine();
              _StdOut.putText('"I can do whatever the fuck I want."');
              _StdOut.advanceLine();
              _StdOut.putText('~Alan Labouseur, 2015');
              _OsShell.putPromptNextLine();
            }
            else if (program==="yourself"){
              if (_SarcasticMode){
                _StdOut.putText("MEANIE.");
                _Kernel.krnTrapError("TEST");
              }
              else {
                _StdOut.putText("Goodbye cruel world~");
                _Kernel.krnTrapError("TEST");
               
              }
            }
            else if (_ExecutingProgramPID !==program && !_Scheduler.readyQueue.inQueue(program) &&args[0]!=='*'){
                if (_SarcasticMode)
                    _StdOut.putText("I cannot kill what which has no life.");
                else
                    _StdOut.putText("Process cannot be killed because process is not running.");
                _OsShell.putPromptNextLine();
            }
            else {
                _KernelInterruptQueue.enqueue(new Interrupt(PROCESS_KILLED_IRQ, program));
                _StdOut.putText("PID " + args[0] +" is dead.");
                _OsShell.putPromptNextLine();
            }
        }
        public shellSetScheduling(args):void{
            var type = args[0];
            _KernelInterruptQueue.enqueue(new Interrupt(SET_SCHEDULE_TYPE_IRQ, type))
            //print message to console


        }
        public shellGetScheduling():void{
            _StdOut.putText("Scheduling type is currently " +scheduleTypes[SCHEDULE_TYPE] +".");

        }
        public shellFormatDisk(args):void{
             
            var firstParam = args[0];
            var secondParam = args[1];
            var thirdParam = args[2];

            if (firstParam===undefined && _CPU.isExecuting ){
                //disk in use and force not specified
                _StdOut.putText("Disk in use please use -force.");
                _OsShell.putPromptNextLine();
                return;
            }
            else if (firstParam ===undefined && !_CPU.isExecuting){
                //disk not inuse and full formatting
                _StdOut.putText("Disk full format starting.");
                _KernelInterruptQueue.enqueue(new Interrupt(FILESYSTEM_IRQ, [DiskAction.FullFormat]));
                return;
            }

            if (firstParam==="-force"){
                //forcing file system to be formatted
                _StdOut.putText("Disk full format starting.");
                _KernelInterruptQueue.enqueue(new Interrupt(FILESYSTEM_IRQ, [DiskAction.FullFormat]));
                return;
            }

            if (firstParam==="-quick"&&!_CPU.isExecuting){
                //file system to be quick formatted
                _StdOut.putText("Disk quick format starting.");
                _KernelInterruptQueue.enqueue(new Interrupt(FILESYSTEM_IRQ, [DiskAction.QuickFormat]));
                return;   
            }
            else if (firstParam==="-quick"&& secondParam===undefined &&_CPU.isExecuting ){
                //disk in use and force not specified
                _StdOut.putText("Disk in use please use -force.");
                _OsShell.putPromptNextLine();
                return;
            }
            else if (firstParam==="-quick" && secondParam==="-force"){
                //forcing file system to be formatted
                _StdOut.putText("Disk quick format starting.");
                _KernelInterruptQueue.enqueue(new Interrupt(FILESYSTEM_IRQ, [DiskAction.QuickFormat]));
                return;    
            }
            if (firstParam==="-full"&&!_CPU.isExecuting){
                //file system to be quick formatted
                _StdOut.putText("Disk full format starting.");
                _KernelInterruptQueue.enqueue(new Interrupt(FILESYSTEM_IRQ, [DiskAction.FullFormat]));
                return;   
            }
            else if (firstParam==="-full"&& secondParam!=="-force"){
                //disk in use and force not specified
                _OsShell.putPrompt("Disk in use please use -force.");
                return;
            }
            else if (firstParam==="-full" && secondParam==="-force"){
                //forcing file system to be formatted
                _StdOut.putText("Disk full format starting.");
                _KernelInterruptQueue.enqueue(new Interrupt(FILESYSTEM_IRQ, [DiskAction.FullFormat]));
                return;    
            }

            _OsShell.putPrompt("Invalid parameter.");
        }  

        public shellCreateFile(args):void{
            var firstParam = args[0];
            var secondParam = args[1];
             ;
            if (firstParam===undefined){
                _OsShell.putPrompt("Please specify a file name.");
                return;
            }
            if (firstParam==="-force"){
                _OsShell.putPrompt("You can't name a file -force you butt.");
                return;
            }
            if (TSOS.Utils.InvalidFileName(firstParam)){
                _OsShell.putPrompt("Invalid file name. File names are limited to 30 characters, no spaces, and not start with " +SWAP_FILE_START_CHAR);
                return;
            }
            if (_Trash.inQueue(firstParam)){
              _OsShell.putPrompt("File name in trash, empty trash first before overwriting.")
              return;
            }

            if (!_FileNames.inQueue(firstParam)){
                //create the file
                _StdOut.putText("Creating File: " + firstParam);
                _KernelInterruptQueue.enqueue(new Interrupt(FILESYSTEM_IRQ, [DiskAction.Create, firstParam]));
            }
            else if (secondParam==="-force"){
                //create the file
                _StdOut.putText("Creating File: " + firstParam);
                _KernelInterruptQueue.enqueue(new Interrupt(FILESYSTEM_IRQ, [DiskAction.CreateForce, firstParam]));
            }
            else {
                //file already exits and -force not used
                _OsShell.putPrompt("File already exists. Delete file or use -force to write over file.");
            }
        }
        public shellDeleteFile(args){
            var fileName = args[0];
            var force = args[1]==="-force";

            if (fileName===undefined){
                _StdOut.putText("Please specify a file name.");
                _OsShell.putPromptNextLine();                
                return;   
            }
            else if (fileName ==="*"){
                if (force){
                  _StdOut.putPrompt("Cannot force delete all files. Format the disk instead.");
                  return;
                }
                //delete all files in directory
                _StdOut.putText("Deleting All Files");
                _KernelInterruptQueue.enqueue(new Interrupt(FILESYSTEM_IRQ, [DiskAction.DeleteAll]));
                return;
            }
            else if (_FileNames.inQueue(fileName)){
                //delete existing file
                _StdOut.putText("Deleting File: " + fileName);
                if (force){
                  _KernelInterruptQueue.enqueue(new Interrupt(FILESYSTEM_IRQ, [DiskAction.DeleteForce, fileName]));
                }
                else 
                  _KernelInterruptQueue.enqueue(new Interrupt(FILESYSTEM_IRQ, [DiskAction.Delete, fileName]));
                return;
            }
            else{
                _StdOut.putText("Invalid file name. ");
                _OsShell.putPromptNextLine();            
              }

        }

        public shellRecoverFile(args){
          var fileName =args[0];
            if (fileName===undefined){
                _StdOut.putText("Please specify a file name.");
                _OsShell.putPromptNextLine();                
                return;   
            }
            else if (fileName ==="*"){
                //delete all files in directory
                _StdOut.putText("Recovering All Files");
                _KernelInterruptQueue.enqueue(new Interrupt(FILESYSTEM_IRQ, [DiskAction.RecoverAll]));
                return;
            }
            else if (_Trash.inQueue(fileName)){
                //delete existing file
                _StdOut.putText("Recovering File: " + fileName);
                _KernelInterruptQueue.enqueue(new Interrupt(FILESYSTEM_IRQ, [DiskAction.Recover, fileName]));
                return;
            }
            else{
                _StdOut.putText("Invalid file name. ");
                _OsShell.putPromptNextLine();            
          }     

        }

        public shellWriteFile(args){
            var fileName = args[0];
            var typeOfWrite = args[1];
            var boxContent  =TSOS.Control.getFileData();
            if (typeOfWrite==="-append"||typeOfWrite==="-overwrite" )
                var data = args.slice(2);
            else
                var data = args.slice(1);
            data = data.join(' ');
            if (_Trash.inQueue(fileName)){
              _OsShell.putPrompt("File name in trash, empty trash first before overwriting.")
              return;
            }
            if (fileName===undefined || TSOS.Utils.InvalidFileName(fileName)){
              _StdOut.putText("File names must be less than 30 characters and not contains spaces or start with " +SWAP_FILE_START_CHAR);
              _OsShell.putPromptNextLine();              
              return;
            }
            if (typeOfWrite ==='' && boxContent===''){
              _StdOut.putText("Write some data or put some data in the next box.");
              _OsShell.putPromptNextLine();              
              return;
            }
            else if (data.charAt(0)!=="'"&& data.charAt(0)!=='"' && 
                data.charAt(data.length-1)!=="'" && data.charAt(data.length-1)!=='"' && data.length!==0){
                  _StdOut.putText("Data must be surrounded by quotes.");
                  _OsShell.putPromptNextLine();                  
                  return;
            }
            else if (boxContent!=='' && data.length===0){
              data = boxContent;
            }
            else{
              //strip the quotes from the data
              data =data.substring(1, data.length-1);
            }
            if (data.length===0){
                _StdOut.putText("Please specify text to write.");
                _OsShell.putPromptNextLine();                
                return;
            }

            if (fileName===undefined){
                _StdOut.putText("Please specify the file name you wish to write to.");
                _OsShell.putPromptNextLine();                
                return;
            }
            if (data===undefined){
                _StdOut.putText("Please specify the data you want written to the file.");
                _OsShell.putPromptNextLine();                
                return;
            }
            if (typeOfWrite==='-append'){
                if (_FileNames.inQueue(fileName)){
                  _StdOut.putText("Appending data to file: " + fileName );
                  _KernelInterruptQueue.enqueue(new Interrupt(FILESYSTEM_IRQ, [DiskAction.AppendWrite, fileName, data]));
                }
                else{
                  _StdOut.putText("Cannot append data to a file that does not exist.");
                  _OsShell.putPromptNextLine();                }
            }
            else if (_Trash.inQueue(fileName)){
              _StdOut.putText("File is in trash, it cannot be written to. Recover the file or empty the trash.");  
              _OsShell.putPromptNextLine();            }
            else {
                _StdOut.putText("Writing data to file: " + fileName);
                _KernelInterruptQueue.enqueue(new Interrupt(FILESYSTEM_IRQ, [DiskAction.Write, fileName, data]));    
            }

        }
        public shellReadFile(args){
            var fileName = args[0];
            var sudo = args[1];
            if (!_FileNames.inQueue(fileName)&&sudo!=="sudo"){
                _StdOut.putText("Invalid file name.");
                _OsShell.putPromptNextLine();    
                return;
            }
            else{
            _KernelInterruptQueue.enqueue(new Interrupt(FILESYSTEM_IRQ, [DiskAction.Read, fileName]));    
          }
        }


        public shellListFiles(){
            if (_FileNames.getSize()===0){
                _StdOut.putText("No files created.");
                return;
            }
            _StdOut.putText("Files in current directory:")
            _StdOut.advanceLine();
            for (var i=0; i<_FileNames.getSize(); i++){
                _StdOut.putText(_FileNames.get(i));
                _StdOut.advanceLine();
            }
        }
        public shellTrashFiles(args){
            if (args[0] === "-empty"){
              if (_Trash.isEmpty()){
                _StdOut.putText("No trash to empty."); 
                _OsShell.putPromptNextLine();    
                return;
              }
              else{
                _StdOut.putText("Trash being emptied.");
                _KernelInterruptQueue.enqueue(new Interrupt(FILESYSTEM_IRQ, [DiskAction.EmptyTrash]));
                return;
              }
            }
            if (_Trash.isEmpty()){
                _StdOut.putText("Trash empty.");
                _OsShell.putPromptNextLine();    
                return;
            }
            _StdOut.putText("Recoverable files in trash are:")
            for (var i=0; i<_Trash.getSize(); i++){
                _StdOut.advanceLine();
                _StdOut.putText(_Trash.get(i));

            }
            _OsShell.putPromptNextLine();
        }
        public shellStartUp(args){
          var option = args[0];
          if (option ==='on'){
            sessionStorage.setItem('startUp', 'true');
            _StartUp = true;
          }
          else if (option==='off'){
            sessionStorage.setItem('startUp', 'false');
            _StartUp = false;
          }
          var strOption = (_StartUp)? 'on':'off';
          _StdOut.putText('Start up screen is currently ' + strOption +'.');
        }

    }        
}
