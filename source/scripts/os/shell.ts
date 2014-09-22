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
                                  "- Loads user program from User Program Input, labels with name if specifed.");
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
                                  "Converts hex program in ta to beepboop");
            this.commandList[this.commandList.length] = sc;

            //unbeepboop
            sc = new ShellCommand(this.shellUnBB,
                                  "unbeepboop",
                                  "Converts beepboop program in ta to hex.");
            this.commandList[this.commandList.length] = sc;

            // processes - list the running processes and their IDs
            // kill <id> - kills the specified process id.

            //
            // Display the initial prompt.
            this.putPrompt();
        }

        public putPrompt() {
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
            // We just got a command, so advance the line...
            _StdOut.advanceLine();
            // ... call the command function passing in the args...
            fn(args);
            // Check to see if we need to advance the line again
            if (_StdOut.currentXPosition > 0) {
                _StdOut.advanceLine();
            }
            // ... and finally write the prompt again.
            if (fn !== this.shellBSOD &&  fn!==this.shellShutdown) //unless we're BS-ing or shutting down
                this.putPrompt();
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
            var boxContent  =(<HTMLInputElement>document.getElementById("taProgramInput")).value.trim();
            var tempProgramString = null;
            
            tempProgramString = boxContent.replace( /\n/g, " " ).split( " " );
            if (boxContent.length===0){
                if (_SarcasticMode)
                    _StdOut.putText("Enter something in the textarea first. Poopbutt.");
                else
                    _StdOut.putText("Enter something in the textarea first.");
            }
            else if (Utils.checkValidProgram(tempProgramString)==="HEX" ||
                     Utils.checkValidProgram(tempProgramString)==="BB"){
                _StdOut.putText("Successfully loaded program.");
            }
            else{
                if (_SarcasticMode)
                    _StdOut.putText("Invalid Format. "+Utils.rot13("Shpxvat")+" poopbutt.");
                else
                    _StdOut.putText("Invalid Format.");
            }
        }
        public shellBSOD(args){
            _Kernel.krnTrapError("TEST");
        }

        public shellBB(args):void{
            var boxContent  =(<HTMLInputElement>document.getElementById("taProgramInput")).value.trim();
            //debugger;
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
            var boxContent  =(<HTMLInputElement>document.getElementById("taProgramInput")).value.trim();
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
                document.getElementById("statusDisplay").innerHTML = msg;
            }
            else
                _StdOut.putText("Invalid status.");
        }   
    }        
}
