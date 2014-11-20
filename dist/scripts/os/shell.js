///<reference path="shellCommand.ts" />
///<reference path="userCommand.ts" />
///<reference path="../utils.ts" />
/* ------------
Shell.ts
The OS Shell - The "command line interface" (CLI) for the console.
------------ */
// TODO: Write a base class / prototype for system services and let Shell inherit from it.
var TSOS;
(function (TSOS) {
    var Shell = (function () {
        function Shell() {
            // Properties
            this.promptStr = ">";
            this.commandList = [];
            this.curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf], [ovgpu],[qhpx],[onol], [Wrfhf]";
            this.apologies = "[sorry]";
            this.backdoors = "[jeff]";
        }
        Shell.prototype.init = function () {
            var sc = null;

            //
            // Load the command list.
            // ver
            sc = new TSOS.ShellCommand(this.shellVer, "ver", "- Displays the current version data.");
            this.commandList[this.commandList.length] = sc;

            // help
            sc = new TSOS.ShellCommand(this.shellHelp, "help", "- This is the help command. Seek help.");
            this.commandList[this.commandList.length] = sc;

            // shutdown
            sc = new TSOS.ShellCommand(this.shellShutdown, "shutdown", "- Shuts down the virtual OS but leaves the underlying hardware simulation running.");
            this.commandList[this.commandList.length] = sc;

            // cls
            sc = new TSOS.ShellCommand(this.shellCls, "cls", "- Clears the screen and resets the cursor position.");
            this.commandList[this.commandList.length] = sc;

            // man <topic>
            sc = new TSOS.ShellCommand(this.shellMan, "man", "<topic> - Displays the MANual page for <topic>.");
            this.commandList[this.commandList.length] = sc;

            // trace <on | off>
            sc = new TSOS.ShellCommand(this.shellTrace, "trace", "<on | off> - Turns the OS trace on or off.");
            this.commandList[this.commandList.length] = sc;

            // rot13 <string>
            sc = new TSOS.ShellCommand(this.shellRot13, "rot13", "<string> - Does rot13 obfuscation on <string>.");
            this.commandList[this.commandList.length] = sc;

            // prompt <string>
            sc = new TSOS.ShellCommand(this.shellPrompt, "prompt", "<string> - Sets the prompt.");
            this.commandList[this.commandList.length] = sc;

            // date
            sc = new TSOS.ShellCommand(this.shellDate, "date", "- Displays the current date.");
            this.commandList[this.commandList.length] = sc;

            // whereami
            sc = new TSOS.ShellCommand(this.shellWhereAmI, "whereami", "- Displays your location.");
            this.commandList[this.commandList.length] = sc;

            // load
            sc = new TSOS.ShellCommand(this.shellLoad, "load", "<number>- Loads user program from User Program Input with the given priority if specified.");
            this.commandList[this.commandList.length] = sc;

            // clearmem
            sc = new TSOS.ShellCommand(this.shellClearMem, "clearmem", "<string>- clears memory of all loaded programs if none are executing, add -force to force memory to clear running programs.");
            this.commandList[this.commandList.length] = sc;

            //run
            sc = new TSOS.ShellCommand(this.shellRun, "run", "<number> - Runs program with id of <number> if the program is in memory.");
            this.commandList[this.commandList.length] = sc;

            //run all
            sc = new TSOS.ShellCommand(this.shellRunAll, "runall", "- Runs all user programs loaded into memory. ");
            this.commandList[this.commandList.length] = sc;

            //set quantum
            sc = new TSOS.ShellCommand(this.shellSetQuantum, "quantum", "<number> - Sets the quantum to the specified number.");
            this.commandList[this.commandList.length] = sc;

            //set default priority
            sc = new TSOS.ShellCommand(this.shellSetDefaultPriority, "setDefaultPriority", "<number> - Sets the default to the specified number.");
            this.commandList[this.commandList.length] = sc;

            //set scheduling type
            sc = new TSOS.ShellCommand(this.shellSetScheduling, "setschedule", "<rr, fcfs, priority> - Sets the scheduling to the specified type.");
            this.commandList[this.commandList.length] = sc;

            //set scheduling type
            sc = new TSOS.ShellCommand(this.shellGetScheduling, "getschedule", "Returns the currently scheduling type.");
            this.commandList[this.commandList.length] = sc;

            // BSOD
            sc = new TSOS.ShellCommand(this.shellBSOD, "bsod", "- Tests kernel trapping an OS error.");
            this.commandList[this.commandList.length] = sc;

            // status <string>
            sc = new TSOS.ShellCommand(this.shellStatus, "status", "<string> - Display's users entered status in host display.");
            this.commandList[this.commandList.length] = sc; // status

            //beepboop
            sc = new TSOS.ShellCommand(this.shellBB, "beepboop", "Converts hex program in ta to beepboop");
            this.commandList[this.commandList.length] = sc;

            //unbeepboop
            sc = new TSOS.ShellCommand(this.shellUnBB, "unbeepboop", "Converts beepboop program in ta to hex.");
            this.commandList[this.commandList.length] = sc;

            // processes - list the running processes and their IDs
            sc = new TSOS.ShellCommand(this.shellDisplayActiveProcesses, "ps", "List the running processes and their IDs");
            this.commandList[this.commandList.length] = sc;

            // kill <id> - kills the specified process id.
            sc = new TSOS.ShellCommand(this.shellKillProcess, "kill", "<int> - Kill the specified process if it is running.");
            this.commandList[this.commandList.length] = sc;

            // format  -Initialize  all blocks  in  all sectors in  all tracks and display a  message denoting    success or  failure.
            sc = new TSOS.ShellCommand(this.shellFormatDisk, "format", "<quick, full, -force> - formats disk, defaults to full, quick allows data to be recovered, optional parameter of -force to force format even if program is running.");
            this.commandList[this.commandList.length] = sc;

            // create   Create  the File    filename    and display a   message denoting    success or  failure.
            sc = new TSOS.ShellCommand(this.shellCreateFile, "create", "<filename, -force> - create file with filename specified, use -force to override file with the same name.");
            this.commandList[this.commandList.length] = sc;

            // delete       Remove  filename    from    storage and display a   message denoting    success or  failure
            sc = new TSOS.ShellCommand(this.shellDeleteFile, "delete", "<filename, *> - deletes file with filename specified, or use * to delete all files.");
            this.commandList[this.commandList.length] = sc;

            // ls  -lists all files stored on disk
            sc = new TSOS.ShellCommand(this.shellListFiles, "ls", "- lists all files in current directory.");
            this.commandList[this.commandList.length] = sc;

            // trash  -displays all files that are deleted but still recoverable
            sc = new TSOS.ShellCommand(this.shellTrashFiles, "trash", "- displays all deleted files that are still recoverable.");
            this.commandList[this.commandList.length] = sc;

            //write - write   the data    inside  the quotes  to  filename    and display a   message denoting    success or  failure.
            sc = new TSOS.ShellCommand(this.shellWriteFile, "write", "<filename>,<-append, -overwrite>, 'data'  - writes to data to specified file name. Defaults to" + "overwrite if not specified. Use /n for newlines in your data.");
            this.commandList[this.commandList.length] = sc;

            //read -Read    and display the contents    of  filename    or  display an  error   if  something   went    wrong
            sc = new TSOS.ShellCommand(this.shellReadFile, "read", "<filename> - Displays the contents of specified file.");
            this.commandList[this.commandList.length] = sc;

            // Display the initial prompt.
            this.putPrompt();
        };

        Shell.prototype.putPrompt = function () {
            _StdOut.putText(this.promptStr);
        };

        Shell.prototype.handleInput = function (buffer) {
            _Kernel.krnTrace("Shell Command~" + buffer);

            //
            // Parse the input...
            //
            var userCommand = new TSOS.UserCommand();
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
                if (this.curses.indexOf("[" + TSOS.Utils.rot13(cmd) + "]") >= 0) {
                    this.execute(this.shellCurse);
                } else if (this.apologies.indexOf("[" + cmd + "]") >= 0) {
                    this.execute(this.shellApology);
                } else if (this.backdoors.indexOf("[" + cmd + "]") >= 0) {
                    this.execute(this.shellBackdoor);
                } else {
                    this.execute(this.shellInvalidCommand);
                }
            }
        };

        // args is an option parameter, ergo the ? which allows TypeScript to understand that
        Shell.prototype.execute = function (fn, args) {
            // We just got a command, so advance the line...
            _StdOut.advanceLine();

            // ... call the command function passing in the args...
            fn(args);

            // Check to see if we need to advance the line again
            if (_StdOut.currentXPosition > 0) {
                _StdOut.advanceLine();
            }

            // ... and finally write the prompt again.
            if (fn !== this.shellBSOD && fn !== this.shellShutdown)
                this.putPrompt();
        };

        Shell.prototype.parseInput = function (buffer) {
            var retVal = new TSOS.UserCommand();

            // 1. Remove leading and trailing spaces.
            buffer = TSOS.Utils.trim(buffer);

            // 2. Lower-case it.
            buffer = buffer.toLowerCase();

            // 3. Separate on spaces so we can determine the command and command-line args, if any.
            var tempList = buffer.split(" ");

            // 4. Take the first (zeroth) element and use that as the command.
            var cmd = tempList.shift();

            // 4.1 Remove any left-over spaces.
            cmd = TSOS.Utils.trim(cmd);

            // 4.2 Record it in the return value.
            retVal.command = cmd;

            for (var i in tempList) {
                var arg = TSOS.Utils.trim(tempList[i]);
                if (arg != "") {
                    retVal.args[retVal.args.length] = tempList[i];
                }
            }
            return retVal;
        };

        //
        // Shell Command Functions.  Again, not part of Shell() class per se', just called from there.
        //
        Shell.prototype.shellInvalidCommand = function () {
            _StdOut.putText("Invalid Command. ");
            if (_SarcasticMode) {
                _StdOut.putText("Duh. Go back to your Speak & Spell.");
            } else {
                _StdOut.putText("Type 'help' for, well... help.");
                _Console.approxMatchCommand();
            }
        };

        Shell.prototype.shellCurse = function () {
            _StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
            _StdOut.advanceLine();
            _StdOut.putText("Bitch.");
            _SarcasticMode = true;
        };

        Shell.prototype.shellApology = function () {
            if (_SarcasticMode) {
                _StdOut.putText("Okay. I forgive you. This time.");
                _SarcasticMode = false;
            } else {
                _StdOut.putText("For what?");
            }
        };
        Shell.prototype.shellBackdoor = function () {
            if (_SarcasticMode) {
                _StdOut.putText("Why would you think that would work? I wasn't born on the first of Jeff, 19JeffityJeff.");
                _SarcasticMode = false;
            } else {
                _StdOut.putText("If you blocked the pop up, use this: http://youtu.be/k6C_HjWr3Nk?t=1m58s");
                window.open("http://youtu.be/k6C_HjWr3Nk?t=1m58s", "_blank");
            }
        };

        Shell.prototype.shellVer = function (args) {
            _StdOut.putText(APP_NAME + " version " + APP_VERSION);
        };

        Shell.prototype.shellHelp = function (args) {
            if (_SarcasticMode) {
                _StdOut.putText("There is no helping you.");
            } else {
                _StdOut.putText("Commands:");
                for (var i in _OsShell.commandList) {
                    _StdOut.advanceLine();
                    _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
                }
            }
        };

        Shell.prototype.shellShutdown = function (args) {
            _StdOut.putText("Shutting down...");

            // Call Kernel shutdown routine.
            _Kernel.krnShutdown();
        };

        Shell.prototype.shellCls = function (args) {
            _StdOut.clearScreen();
            _StdOut.resetXY();
        };

        Shell.prototype.shellMan = function (args) {
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
        };

        Shell.prototype.shellTrace = function (args) {
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
        };

        Shell.prototype.shellRot13 = function (args) {
            if (args.length > 0) {
                // Requires Utils.ts for rot13() function.
                _StdOut.putText(args.join(' ') + " = '" + TSOS.Utils.rot13(args.join(' ')) + "'");
            } else {
                _StdOut.putText("Usage: rot13 <string>  Please supply a string.");
            }
        };

        Shell.prototype.shellPrompt = function (args) {
            if (args.length > 0) {
                _OsShell.promptStr = args[0];
            } else {
                _StdOut.putText("Usage: prompt <string>  Please supply a string.");
            }
        };

        Shell.prototype.shellDate = function (args) {
            if (_SarcasticMode) {
                _StdOut.putText("Time is meaningless.");
            } else {
                _StdOut.putText(Date());
            }
        };

        Shell.prototype.shellWhereAmI = function (args) {
            if (_SarcasticMode) {
                _StdOut.putText("Hopefully no where near me.");
            } else {
                var currentDate = new Date();
                if (currentDate.getHours() < 6)
                    _StdOut.putText("Well, you should be in bed.");
                else
                    _StdOut.putText("I don't even know where I am, man.");
            }
        };

        Shell.prototype.shellLoad = function (args) {
            //gets the text box content
            var boxContent = TSOS.Control.getUserProgram();
            var tempProgramString = null;
            var tempPriority = args[0];
            if (_MemoryManager.nextFreeMem === null) {
                _StdOut.putText("Cannot load program, memory full.");
                return;
            }
            if ((boxContent.indexOf("BEEP") == -1 || boxContent.indexOf("BOOP") == -1)) {
                //inserts spaces into spaceless hex code because i assumed programs would have spaces. BB still needs spaces
                tempProgramString = boxContent.replace(/\s+/g, '');
                tempProgramString = tempProgramString.replace(/\n+/g, '');
                tempProgramString = tempProgramString.match(/.{1,2}/g);
            } else
                tempProgramString = boxContent.replace(/\n/g, " ").split(" ");
            if (boxContent.length === 0) {
                if (_SarcasticMode)
                    _StdOut.putText("Enter something in the textarea first. Poopbutt.");
                else
                    _StdOut.putText("Enter something in the textarea first.");
            } else if (TSOS.Utils.checkValidProgram(tempProgramString) === "HEX") {
                _StdOut.putText("Successfully loaded program.");
                _StdOut.advanceLine();
                _StdOut.putText("ProcessID: " + _MemoryManager.loadProgram(tempProgramString, tempPriority));
            } else if (TSOS.Utils.checkValidProgram(tempProgramString) === "BB") {
                TSOS.Utils.convertProgram("runnableBB", tempProgramString);
                _StdOut.putText("ProcessID: " + (_CurrPID - 1).toString());
            } else {
                if (_SarcasticMode)
                    _StdOut.putText("Invalid Format. " + TSOS.Utils.rot13("Shpxvat") + " poopbutt.");
                else
                    _StdOut.putText("Invalid Format.");
            }
        };

        Shell.prototype.shellClearMem = function (args) {
            //clear the running programs and the memory.
            if (_CPU.isExecuting && args.length === 0) {
                _StdOut.putText("Are you sure you want to clear memory? This will stop programs from executing. Enter clearmem-force instead.");
                return;
            } else if (args[0] === "-force") {
                //TODO clear memory interrupt
                _StdOut.putText("Forcing memory to be cleared.");
            } else {
                _StdOut.putText("Memory being cleared.");
            }

            _KernelInterruptQueue.enqueue(new TSOS.Interrupt(CLEAR_MEMORY_IRQ));
        };

        Shell.prototype.shellRun = function (args) {
            if (args.length <= 0)
                _StdOut.putText("You need a program id to run.");
            else if (!_Scheduler.residentQueue.inQueue(parseInt(args[0]))) {
                //check for valid id
                _StdOut.putText("Invalid program id");
            } else if (_Scheduler.readyQueue.inQueue(parseInt(args[0]))) {
                _StdOut.putText("Program is already waiting to execute.");
            } else if (_ExecutingProgramPID == parseInt(args[0])) {
                if (!_SarcasticMode)
                    _StdOut.putText("Program is already executing");
                else
                    _StdOut.putText("Christ, give a second to run, it's already running.");
            } else {
                //run program
                _ExecutingProgramPID = parseInt(args[0]);
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(RUN_PROGRAM_IRQ));
                _StdOut.putText("Running PID " + args[0]);
            }
        };

        Shell.prototype.shellRunAll = function () {
            if (_Scheduler.residentQueue.getSize() !== 0)
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(RUN_PROGRAM_IRQ, "all"));
            else
                _StdOut.putText("Load at least one program first.");
        };
        Shell.prototype.shellSetQuantum = function (args) {
            if (args.length <= 0)
                _StdOut.putText("You need to actually input a number. Current Quantum: " + QUANTUM);
            else if (isNaN(args[0]))
                _StdOut.putText("Invalid quantum.");
            else {
                QUANTUM = parseInt(args[0]);
                _StdOut.putText("Current Quantum is " + QUANTUM);
            }
        };
        Shell.prototype.shellSetDefaultPriority = function (args) {
            if (args.length <= 0)
                _StdOut.putText("You need to actually input a number. Current default priority: " + DEFAULT_PRIORITY);
            else if (isNaN(args[0]))
                _StdOut.putText("Invalid default priority.");
            else {
                DEFAULT_PRIORITY = parseInt(args[0]);
                _StdOut.putText("Current default priority is " + DEFAULT_PRIORITY);
            }
        };
        Shell.prototype.shellBSOD = function (args) {
            _Kernel.krnTrapError("TEST");
        };

        Shell.prototype.shellBB = function (args) {
            var boxContent = TSOS.Control.getUserProgram();

            var tempProgramString = null;
            tempProgramString = boxContent.replace(/\n/g, " ").split(" ");
            var programType = TSOS.Utils.checkValidProgram(tempProgramString);
            if (programType !== "HEX" && programType !== undefined) {
                if (_SarcasticMode)
                    _StdOut.putText("Invalid hex program you pox upon humanity. If you want convert hex to " + "beepboop put valid hex program in ta.");
                else
                    _StdOut.putText("Invalid hex program.If you want convert hex to " + "beepboop put valid hex program in ta.");
            } else {
                TSOS.Utils.convertProgram(programType, tempProgramString);
                _StdOut.putText("Successfully converted hex to beepboop.");
            }
        };
        Shell.prototype.shellUnBB = function (args) {
            var boxContent = TSOS.Control.getUserProgram();
            var tempProgramString = null;
            tempProgramString = boxContent.replace(/\n/g, " ").split(" ");
            var programType = TSOS.Utils.checkValidProgram(tempProgramString);
            if (programType !== "BB" && programType !== undefined) {
                if (_SarcasticMode)
                    _StdOut.putText("Invalid beepboop program you pox upon humanity. If you want convert beepboop to " + "hex put valid beepboop program in ta.");
                else
                    _StdOut.putText("Invalid beepboop program.If you want convert beepboop to " + "hex put valid beepboop program in ta.");
            } else {
                TSOS.Utils.convertProgram(programType, tempProgramString);
                _StdOut.putText("Successfully converted beepboop to hex.");
            }
        };
        Shell.prototype.shellStatus = function (args) {
            var msg = args[0];
            if (msg.length !== 0) {
                TSOS.Control.displayUserStatus(msg);
            } else
                _StdOut.putText("Invalid status.");
        };
        Shell.prototype.shellDisplayActiveProcesses = function (args) {
            var msg = "";
            if (_Scheduler.readyQueue.isEmpty() && _ExecutingProgramPID == null)
                _StdOut.putText("There are no running processes.");
            else {
                for (var i = 0; i < _Scheduler.readyQueue.getSize(); i++)
                    msg += ", PID: " + _Scheduler.readyQueue.get(i).pid;
                _StdOut.putText("Current running processes... ");
                _StdOut.putText("PID: " + _ExecutingProgramPID + msg);
            }
        };
        Shell.prototype.shellKillProcess = function (args) {
            var program = parseInt(args[0]);
            if (_ExecutingProgramPID !== program && !_Scheduler.readyQueue.inQueue(program)) {
                if (_SarcasticMode)
                    _StdOut.putText("I cannot kill what which has no life.");
                else
                    _StdOut.putText("Process cannot be killed because process is not running.");
            } else {
                _Scheduler.stopRunning(program);
                _StdOut.putText("PID " + args[0] + " is running.");
            }
        };
        Shell.prototype.shellSetScheduling = function (args) {
            var type = args[0];
            _KernelInterruptQueue.enqueue(new TSOS.Interrupt(SET_SCHEDULE_TYPE_IRQ, type));

            //print message to console
            _StdOut.putText("Scheduling type changed successfully.");
        };
        Shell.prototype.shellGetScheduling = function () {
            _StdOut.putText("Scheduling type is currently " + scheduleTypes[SCHEDULE_TYPE] + ".");
        };
        Shell.prototype.shellFormatDisk = function (args) {
            debugger;
            var firstParam = args[0];
            var secondParam = args[1];
            var thirdParam = args[2];

            if (firstParam === undefined && DISK_IN_USE) {
                //disk in use and force not specified
                _StdOut.putPrompt("Disk in use please use -force.");
                return;
            } else if (firstParam === undefined && !DISK_IN_USE) {
                //disk not inuse and full formatting
                _StdOut.putText("Disk full format starting.");
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(FILESYSTEM_IRQ, [7 /* FullFormat */]));
                return;
            }

            if (firstParam === "-force") {
                //forcing file system to be formatted
                _StdOut.putText("Disk full format starting.");
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(FILESYSTEM_IRQ, [7 /* FullFormat */]));
                return;
            }

            if (firstParam === "quick" && !DISK_IN_USE) {
                //file system to be quick formatted
                _StdOut.putText("Disk quick format starting.");
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(FILESYSTEM_IRQ, [8 /* QuickFormat */]));
                return;
            } else if (firstParam === "quick" && secondParam === undefined && DISK_IN_USE) {
                //disk in use and force not specified
                _StdOut.putPrompt("Disk in use please use -force.");
                return;
            } else if (firstParam === "quick" && secondParam === "-force") {
                //forcing file system to be formatted
                _StdOut.putText("Disk quick format starting.");
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(FILESYSTEM_IRQ, [8 /* QuickFormat */]));
                return;
            }
            if (firstParam === "full" && !DISK_IN_USE) {
                //file system to be quick formatted
                _StdOut.putText("Disk full format starting.");
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(FILESYSTEM_IRQ, [7 /* FullFormat */]));
                return;
            } else if (firstParam === "full" && secondParam === undefined && DISK_IN_USE) {
                //disk in use and force not specified
                _StdOut.putPrompt("Disk in use please use -force.");
                return;
            } else if (firstParam === "full" && secondParam === "-force") {
                //forcing file system to be formatted
                _StdOut.putText("Disk full format starting.");
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(FILESYSTEM_IRQ, [7 /* FullFormat */]));
                return;
            }

            _StdOut.putText("Invalid parameter.");
        };

        Shell.prototype.shellCreateFile = function (args) {
            var firstParam = args[0];
            var secondParam = args[1];
            debugger;
            if (firstParam === undefined) {
                _StdOut.putText("Please specify a file name.");
                return;
            }
            if (firstParam === "-force") {
                _StdOut.putText("You can't name a file -force you butt.");
                return;
            }
            if (TSOS.Utils.InvalidFileName(firstParam)) {
                _StdOut.putText("Invalid file name. File names are limited to 60 characters, no spaces, and no periods.");
                return;
            }

            if (!_FileNames.inQueue(firstParam)) {
                //create the file
                _StdOut.putText("Creating File: " + firstParam);
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(FILESYSTEM_IRQ, [0 /* Create */, firstParam]));
            } else if (secondParam === "-force") {
                //create the file
                _StdOut.putText("Creating File: " + firstParam);
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(FILESYSTEM_IRQ, [1 /* CreateForce */, firstParam]));
            } else {
                //file already exits and -force not used
                _StdOut.putText("File already exists. Delete file or use -force to write over file.");
            }
        };
        Shell.prototype.shellDeleteFile = function (args) {
            var fileName = args[0];

            if (fileName === undefined) {
                _StdOut.putText("Please specify a file name.");
                return;
            } else if (fileName === "*") {
                //delete all files in directory
                _StdOut.putText("Deleting All Files");
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(FILESYSTEM_IRQ, [6 /* DeleteAll */]));
                return;
            } else if (_FileNames.inQueue(fileName)) {
                //delete existing file
                _StdOut.putText("Deleting File: " + fileName);
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(FILESYSTEM_IRQ, [5 /* Delete */, fileName]));
                return;
            } else {
                _StdOut.putText("Invalid file name. ");
            }
        };

        Shell.prototype.shellWriteFile = function (args) {
            debugger;
            var fileName = args[0];
            var typeOfWrite = args[1];
            if (typeOfWrite === "-append" || typeOfWrite === "-overwrite")
                var data = args.slice(2);
            else
                var data = args.slice(1);
            data = data.join('');
            if (data.charAt(0) !== "'" && data.charAt(0) !== '"' && data.charAt(data.length - 1) !== "'" && data.charAt(data.length - 1) !== '"') {
                _StdOut.putText("Data must be surrounded by quotes.");
                return;
            }

            //strip the quotes from the data
            data = data.substring(1, data.length);
            if (data.length === 0) {
                _StdOut.putText("Please specify text to write.");
                return;
            }

            if (fileName === undefined) {
                _StdOut.putText("Please specify the file name you wish to write to.");
                return;
            }
            if (data === undefined) {
                _StdOut.putText("Please specify the data you want written to the file.");
                return;
            }
            if (typeOfWrite === '-append') {
                _StdOut.putText("Appending data to file: " + fileName);
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(FILESYSTEM_IRQ, [4 /* AppendWrite */, fileName, data]));
            } else {
                _StdOut.putText("Writing data to file: " + fileName);
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(FILESYSTEM_IRQ, [3 /* Write */, fileName, data]));
            }
        };
        Shell.prototype.shellReadFile = function (args) {
            var fileName = args[0];
            if (!_FileNames.inQueue(fileName)) {
                _StdOut.putText("Invalid fileName");
            }

            _KernelInterruptQueue.enqueue(new TSOS.Interrupt(FILESYSTEM_IRQ, [2 /* Read */, fileName]));
        };

        Shell.prototype.shellListFiles = function () {
            if (_FileNames.getSize() === 0) {
                _StdOut.putText("No files created.");
                return;
            }
            _StdOut.putText("Files in current directory:");
            _StdOut.advanceLine();
            for (var i = 0; i < _FileNames.getSize(); i++) {
                _StdOut.putText(_FileNames.get(i));
                _StdOut.advanceLine();
            }
        };
        Shell.prototype.shellTrashFiles = function () {
            if (_Trash.getSize() === 0) {
                _StdOut.putText("Trash empty.");
                return;
            }
            _StdOut.putText("Recoverable files in trash are:");
            _StdOut.advanceLine();
            for (var i = 0; i < _Trash.getSize(); i++) {
                _StdOut.putText(_Trash.get(i));
                _StdOut.advanceLine();
            }
        };
        return Shell;
    })();
    TSOS.Shell = Shell;
})(TSOS || (TSOS = {}));
