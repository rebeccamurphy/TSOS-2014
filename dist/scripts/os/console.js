///<reference path="../globals.ts" />
/* ------------
     Console.ts

     Requires globals.ts

     The OS Console - stdIn and stdOut by default.
     Note: This is not the Shell.  The Shell is the "command line interface" (CLI) or interpreter for this console.
     ------------ */
var TSOS;
(function (TSOS) {
    var Console = (function () {
        function Console(currentFont, currentFontSize, currentXPosition, currentYPosition, buffer, currentLine, prevXLineEnd, enteredCommandsList, enteredCommandsIndex) {
            if (currentFont === void 0) { currentFont = _DefaultFontFamily; }
            if (currentFontSize === void 0) { currentFontSize = _DefaultFontSize; }
            if (currentXPosition === void 0) { currentXPosition = 0; }
            if (currentYPosition === void 0) { currentYPosition = _DefaultFontSize + _FontHeightMargin; }
            if (buffer === void 0) { buffer = ""; }
            if (currentLine === void 0) { currentLine = 0; }
            if (prevXLineEnd === void 0) { prevXLineEnd = []; }
            if (enteredCommandsList === void 0) { enteredCommandsList = [""]; }
            if (enteredCommandsIndex === void 0) { enteredCommandsIndex = 0; }
            this.currentFont = currentFont;
            this.currentFontSize = currentFontSize;
            this.currentXPosition = currentXPosition;
            this.currentYPosition = currentYPosition;
            this.buffer = buffer;
            this.currentLine = currentLine;
            this.prevXLineEnd = prevXLineEnd;
            this.enteredCommandsList = enteredCommandsList;
            this.enteredCommandsIndex = enteredCommandsIndex;
        }
        Console.prototype.init = function () {
            this.clearScreen();
            this.resetXY();
        };
        Console.prototype.clearScreen = function () {
            _Canvas.height = CONSOLE_VIEWPORT_HEIGHT; //resets console height
            _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
        };
        Console.prototype.resetXY = function () {
            this.currentXPosition = 0;
            this.currentYPosition = this.currentFontSize + _FontHeightMargin;
        };
        Console.prototype.handleInput = function () {
            while (_KernelInputQueue.getSize() > 0) {
                // Get the next character from the kernel input queue.
                var chr = _KernelInputQueue.dequeue();
                // Check to see if it's "special" (enter or ctrl-c) or "normal" (anything else that the keyboard device driver gave us).
                if (chr === String.fromCharCode(13)) {
                    if (this.buffer !== "") {
                        // The enter key marks the end of a console command, so ...
                        // ... tell the shell ...
                        _OsShell.handleInput(this.buffer);
                        //add into the previous command list
                        this.enteredCommandsList.push(this.buffer);
                        //reset the enteredcommandlist index
                        this.enteredCommandsIndex = this.enteredCommandsList.length;
                        // ... and reset our buffer.
                        this.buffer = "";
                    }
                }
                else if (chr === String.fromCharCode(8)) {
                    this.eraseText(this.buffer.slice(-1)); //remove last character from canvas
                    this.buffer = this.buffer.slice(0, -1); //remove last character from buffer
                }
                else if (chr === String.fromCharCode(9)) {
                    this.matchCommand();
                }
                else if ((chr === "UP") ||
                    (chr === "DOWN")) {
                    this.enteredCommands(chr);
                }
                else {
                    // This is a "normal" character, so ...
                    // ... draw it on the screen...
                    this.putText(chr);
                    // ... and add it to our buffer.
                    this.buffer += chr;
                }
            }
        };
        Console.prototype.putText = function (text, color) {
            //takes in a string or character and implements line wrap.
            if (text !== "" && text.length === 1) {
                this.putChar(text, color); //might be  problem      
            }
            else if (text !== "" && text.length > 1) {
                var words = text.split(" "); //split string by spaces from part of line wrapping
                for (var i = 0; i < words.length; i++) {
                    var word = words[i];
                    var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, word);
                    if (words.length > 1 && i !== words.length - 1)
                        word += " "; // add a space to the end of words that was removed in text.split(" ")
                    if (this.currentXPosition + offset > _Canvas.width) {
                        //if the word to be drawn offset is greated than the amount of space to write it
                        //we advance a line before drawing the text
                        this.prevXLineEnd.push(this.currentXPosition); //adds previous endline positioon to array
                        this.advanceLine(); //advance line
                    }
                    for (var j = 0; j < word.length; j++)
                        this.putChar(word.charAt(j));
                }
            }
        };
        Console.prototype.putChar = function (text, color) {
            //measures offset of character
            var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
            if (this.currentXPosition + offset > _Canvas.width) {
                //advance line if character would be drawn off screen
                this.prevXLineEnd.push(this.currentXPosition);
                this.advanceLine();
            }
            if (color === undefined)
                // Draw the text at the current X and Y coordinates, what ever color entered.
                _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, text, CONSOLE_TEXT_COLOR);
            else {
                _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, text, color);
            }
            // Move the current X position.
            this.currentXPosition = this.currentXPosition + offset;
        };
        Console.prototype.eraseText = function (text) {
            //measure offset of letter going to be erased
            var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
            //change the current x position
            this.currentXPosition = this.currentXPosition - offset;
            var roundedXPos = Math.round(this.currentXPosition); // work around rounding bug
            if (roundedXPos < 0)
                this.backLine(offset); //needs to be erased from the previous line so we go back a line
            _DrawingContext.fillStyle = CONSOLE_BGC;
            _DrawingContext.fillRect(this.currentXPosition, this.currentYPosition - _DefaultFontSize, offset, _DefaultFontSize + _FontHeightMargin + 1);
            //leaving in next line for later virus mode or something
            //_DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, text, CONSOLE_BGC);
        };
        Console.prototype.advanceLine = function () {
            this.currentXPosition = 0; // resets x position 
            this.currentYPosition += _DefaultFontSize + _FontHeightMargin; //increases y position
            this.currentLine++; // increases current line
            if (this.currentYPosition >= _Canvas.height) {
                var img = _DrawingContext.getImageData(0, 0, _Canvas.width, _Canvas.height); //creates image of old canvas
                this.clearScreen();
                //_Canvas.height = this.currentYPosition +5; //increases length of console, +5 for bottom buffer
                _DrawingContext.putImageData(img, 0, _Canvas.height - this.currentYPosition - 5, 0, 0, _Canvas.width, _Canvas.height);
                //this.moveCanvasUp(); //grows canvas if current y is greater than current canvas height
                this.currentYPosition -= _DefaultFontSize + _FontHeightMargin; //decrease y
            }
        };
        Console.prototype.backLine = function (offset) {
            //sets x position to where it left off at the last line
            this.currentXPosition = this.prevXLineEnd.pop() - offset;
            this.currentYPosition -= _DefaultFontSize + _FontHeightMargin; //decrease y
            this.currentLine--; //decreases current line
            //if (this.currentYPosition > CONSOLE_VIEWPORT_HEIGHT)
            //    this.changeCanvasLength(); 
            //if the current y is still greater than default console size
            //decrease the size of the canvas
        };
        Console.prototype.clearLine = function () {
            //clears a line of the console by drawing a rectangle of the console color over it
            _DrawingContext.fillStyle = CONSOLE_BGC;
            _DrawingContext.fillRect(0, this.currentYPosition - _DefaultFontSize, _Canvas.width, _DefaultFontSize + _FontHeightMargin + 1);
            this.currentXPosition = 0;
            this.buffer = "";
        };
        Console.prototype.moveCanvasUp = function () {
            var img = _DrawingContext.getImageData(0, 0, _Canvas.width, _Canvas.height); //creates image of old canvas
            this.clearScreen();
            //_Canvas.height = this.currentYPosition +5; //increases length of console, +5 for bottom buffer
            _DrawingContext.putImageData(img, 0, 0); //redraws old canvas on longer canvas
            //this.moveScrollbar("bottom");//move view to new line
        };
        Console.prototype.moveScrollbar = function (area) {
            //gave option, incase moving scrollbar diff areas needed later
            if (area == "bottom")
                _ConsoleScrollbar.scrollTop = _ConsoleScrollbar.scrollHeight; //moves scrollbar to bottom
        };
        Console.prototype.matchCommand = function () {
            //checks if any commands match when a user presses tab
            var matchingCommands = [];
            var matchingCommand = ""; //where the rest of a matching command is stored
            for (var i = 0; i < _OsShell.commandList.length; i++) {
                var msgLength = this.buffer.length;
                var command = _OsShell.commandList[i].command;
                if (this.buffer == command.substr(0, msgLength)) {
                    matchingCommands.push(command); //push entire matching command
                    matchingCommand = command.slice(msgLength); //add end of string to matching command
                }
            }
            if (matchingCommands.length === 1) {
                this.buffer += matchingCommand;
                this.putText(matchingCommand);
            }
            else if (matchingCommands.length > 1) {
                this.advanceLine();
                for (var i = 0; i < matchingCommands.length; i++)
                    this.putText(matchingCommands[i] + " ");
                //after printing matching commands, give the user what they started with
                this.advanceLine();
                _OsShell.putPrompt();
                this.putText(this.buffer);
            }
            //else do nothing basically
        };
        Console.prototype.approxMatchCommand = function () {
            //gives suggestions of invalid command contains character of valid command
            var approxMatchingCommands = [];
            var approxMatchingCommand = "";
            for (var i = 0; i < _OsShell.commandList.length; i++) {
                var msgLength = this.buffer.length;
                var command = _OsShell.commandList[i].command;
                if (command.indexOf(this.buffer) !== -1)
                    approxMatchingCommands.push(command);
                else {
                    for (var j = 0; j < this.buffer.length; j++) {
                        if (command.indexOf(this.buffer.charAt(j)) === -1)
                            break;
                        else if (j === this.buffer.length - 1)
                            approxMatchingCommands.push(command);
                    }
                }
            }
            if (approxMatchingCommands.length > 0) {
                this.advanceLine();
                this.putText("Did you mean any of the following?");
                this.advanceLine();
                for (var i = 0; i < approxMatchingCommands.length; i++)
                    this.putText(approxMatchingCommands[i] + " ");
            }
        };
        Console.prototype.enteredCommands = function (chr) {
            if ((chr === "UP") &&
                (this.enteredCommandsIndex > 1)) {
                this.enteredCommandsIndex--; //moves up item in list
                this.clearLine();
                _OsShell.putPrompt();
                this.putText(this.enteredCommandsList[this.enteredCommandsIndex]);
                this.buffer = this.enteredCommandsList[this.enteredCommandsIndex];
            }
            else if (chr === "DOWN") {
                if (this.enteredCommandsIndex < this.enteredCommandsList.length) {
                    this.enteredCommandsIndex++; //moves down item in list
                    this.clearLine();
                    _OsShell.putPrompt();
                    if (this.enteredCommandsIndex !== this.enteredCommandsList.length) {
                        //displays previous command, unless last command has been display
                        //then it clears the row
                        this.putText(this.enteredCommandsList[this.enteredCommandsIndex]);
                        this.buffer = this.enteredCommandsList[this.enteredCommandsIndex];
                    }
                }
            }
        };
        Console.prototype.computerOver = function () {
            if (_SarcasticMode) {
                this.clearScreen();
                TSOS.Control.c();
            }
            else {
                this.clearScreen();
                _DrawingContext.fillStyle = "#3a50b6";
                _DrawingContext.fillRect(0, 0, _Canvas.width, _Canvas.height);
                var img = new Image();
                img.onload = function () {
                    _DrawingContext.drawImage(img, 0, 100);
                };
                img.src = "http://i.imgur.com/sOoqj6a.jpg";
            }
        };
        Console.prototype.startUp = function () {
            this.clearScreen();
            _DrawingContext.fillStyle = "#3a50b6";
            _DrawingContext.fillRect(0, 0, _Canvas.width, _Canvas.height);
            var img = new Image();
            img.onload = function () {
                _DrawingContext.drawImage(img, 0, 100);
            };
            img.src = "http://i.imgur.com/5PP6VmW.gif";
            TSOS.Control.playStartUpNoise();
        };
        Console.prototype.handleSysOpCode = function () {
            if (_CPU.Xreg === 1) {
                //print the integer stored in Y register
                this.putText((_CPU.Yreg).toString());
                this.advanceLine();
                _OsShell.putPrompt();
            }
            else if (_CPU.Xreg === 2) {
                //print the 00-terminated string stored at the address in the Y register
                var string00 = "";
                var curPos = _CPU.Yreg + _ExecutingProgramPCB.base;
                var curData = _MemoryManager.getMemory(curPos);
                while (curData !== "00") {
                    //convert current data from hex to dec to char to string. YAY. 
                    string00 += String.fromCharCode(_MemoryManager.convertHexData(curData));
                    //move to next byte of data
                    curData = _MemoryManager.getMemory(++curPos);
                }
                this.putText(string00);
                this.advanceLine();
                _OsShell.putPrompt();
            }
            //else do nothing basically
        };
        return Console;
    })();
    TSOS.Console = Console;
})(TSOS || (TSOS = {}));
