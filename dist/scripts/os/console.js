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
        function Console(currentFont, currentFontSize, currentXPosition, currentYPosition, buffer, currentLine, prevXLine, enteredCommandsList, enteredCommandsIndex) {
            if (typeof currentFont === "undefined") { currentFont = _DefaultFontFamily; }
            if (typeof currentFontSize === "undefined") { currentFontSize = _DefaultFontSize; }
            if (typeof currentXPosition === "undefined") { currentXPosition = 0; }
            if (typeof currentYPosition === "undefined") { currentYPosition = _DefaultFontSize; }
            if (typeof buffer === "undefined") { buffer = ""; }
            if (typeof currentLine === "undefined") { currentLine = 0; }
            if (typeof prevXLine === "undefined") { prevXLine = 0; }
            if (typeof enteredCommandsList === "undefined") { enteredCommandsList = [""]; }
            if (typeof enteredCommandsIndex === "undefined") { enteredCommandsIndex = 0; }
            this.currentFont = currentFont;
            this.currentFontSize = currentFontSize;
            this.currentXPosition = currentXPosition;
            this.currentYPosition = currentYPosition;
            this.buffer = buffer;
            this.currentLine = currentLine;
            this.prevXLine = prevXLine;
            this.enteredCommandsList = enteredCommandsList;
            this.enteredCommandsIndex = enteredCommandsIndex;
        }
        Console.prototype.init = function () {
            this.clearScreen();
            this.resetXY();
        };

        Console.prototype.clearScreen = function () {
            _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
        };

        Console.prototype.resetXY = function () {
            this.currentXPosition = 0;
            this.currentYPosition = this.currentFontSize;
        };

        Console.prototype.handleInput = function () {
            while (_KernelInputQueue.getSize() > 0) {
                // Get the next character from the kernel input queue.
                var chr = _KernelInputQueue.dequeue();

                // Check to see if it's "special" (enter or ctrl-c) or "normal" (anything else that the keyboard device driver gave us).
                if (chr === String.fromCharCode(13)) {
                    // The enter key marks the end of a console command, so ...
                    // ... tell the shell ...
                    _OsShell.handleInput(this.buffer);

                    //add into the previous command list
                    this.enteredCommandsList.push(this.buffer);

                    //reset the enteredcommandlist index
                    this.enteredCommandsIndex = this.enteredCommandsList.length;

                    // ... and reset our buffer.
                    this.buffer = "";
                } else if (chr === String.fromCharCode(8)) {
                    this.eraseText(this.buffer.slice(-1)); //remove last character from canvas
                    this.buffer = this.buffer.slice(0, -1); //remove last character from buffer
                } else if (chr === String.fromCharCode(9)) {
                    this.matchCommand();
                } else if ((chr === String.fromCharCode(38)) || (chr === String.fromCharCode(40))) {
                    this.enteredCommands(chr);
                } else {
                    // This is a "normal" character, so ...
                    // ... draw it on the screen...
                    this.putText(chr);

                    // ... and add it to our buffer.
                    this.buffer += chr;
                }
                // TODO: Write a case for Ctrl-C.
            }
        };

        Console.prototype.putText = function (text, color) {
            // My first inclination here was to write two functions: putChar() and putString().
            // Then I remembered that JavaScript is (sadly) untyped and it won't differentiate
            // between the two.  So rather than be like PHP and write two (or more) functions that
            // do the same thing, thereby encouraging confusion and decreasing readability, I
            // decided to write one function and use the term "text" to connote string or char.
            // UPDATE: Even though we are now working in TypeScript, char and string remain undistinguished.
            console.log("x is off" + this.currentXPosition);
            if (text !== "" && text.length === 1) {
                if (color !== undefined)
                    this.putChar(text, color); //might be  problem
                else
                    this.putChar(text); //might be  problem
            } else if (text !== "" && text.length > 1) {
                var words = text.split(" ");
                for (var i = 0; i < words.length; i++) {
                    var word = words[i];
                    var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, word);
                    if (words.length > 1 && i !== words.length - 1)
                        word += " ";

                    if (this.currentXPosition + offset > CONSOLE_WIDTH) {
                        this.prevXLine = this.currentXPosition;
                        this.advanceLine();
                    }
                    for (var j = 0; j < word.length; j++)
                        this.putChar(word.charAt(j));
                }
            }
        };
        Console.prototype.putChar = function (text, color) {
            var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
            if (this.currentXPosition + offset > CONSOLE_WIDTH) {
                this.prevXLine = this.currentXPosition;
                this.advanceLine();
            }

            // Draw the text at the current X and Y coordinates.
            _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, text, CONSOLE_TEXT_COLOR);

            // Move the current X position.
            this.currentXPosition = this.currentXPosition + offset;
        };
        Console.prototype.eraseText = function (text) {
            var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
            this.currentXPosition = this.currentXPosition - offset;
            if (this.currentXPosition < -.5)
                this.backLine(offset);
            _DrawingContext.fillStyle = CONSOLE_BGC;
            _DrawingContext.fillRect(this.currentXPosition, this.currentYPosition - _DefaultFontSize, offset, _DefaultFontSize + _FontHeightMargin + 1);
            //leaving in next line for later virus mode or something
            //_DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, text, CONSOLE_BGC);
        };
        Console.prototype.advanceLine = function () {
            this.currentXPosition = 0;
            this.currentYPosition += _DefaultFontSize + _FontHeightMargin;
            this.currentLine++;

            if (this.currentYPosition >= CONSOLE_HEIGHT) {
                // TODO: Handle scrolling. (Project 1)
            }
        };
        Console.prototype.backLine = function (offset) {
            this.currentXPosition = this.prevXLine - offset;
            this.currentYPosition -= _DefaultFontSize + _FontHeightMargin;
            console.log("Y advance " + this.currentYPosition);
            this.currentLine--;
        };
        Console.prototype.clearLine = function () {
            _DrawingContext.fillStyle = CONSOLE_BGC;
            _DrawingContext.fillRect(0, this.currentYPosition - _DefaultFontSize, CONSOLE_WIDTH, _DefaultFontSize + _FontHeightMargin + 1);
            this.currentXPosition = 0;
            this.buffer = "";
        };
        Console.prototype.matchCommand = function () {
            var matchingCommands = [];
            var matchingCommand = "";
            var currentBuffer = this.buffer;
            for (var i = 0; i < _OsShell.commandList.length; i++) {
                var msgLength = this.buffer.length;
                var command = _OsShell.commandList[i].command;
                if (this.buffer == command.substr(0, msgLength)) {
                    matchingCommands.push(command);
                    matchingCommand = command.slice(msgLength);
                }
            }
            if (matchingCommands.length === 1) {
                this.buffer += matchingCommand;
                this.putText(matchingCommand);
            } else if (matchingCommands.length > 0) {
                this.advanceLine();
                for (var i = 0; i < matchingCommands.length; i++)
                    this.putText(matchingCommands[i] + " ");
                this.advanceLine();

                //_OsShell.putPrompt();
                this.putText(this.buffer);
            }
            //else do nothing basically
        };

        Console.prototype.enteredCommands = function (chr) {
            if ((chr === String.fromCharCode(38)) && (this.enteredCommandsIndex > 1)) {
                this.enteredCommandsIndex--; //moves up item in list
                this.clearLine();
                _OsShell.putPrompt();
                this.putText(this.enteredCommandsList[this.enteredCommandsIndex]);
                this.buffer = this.enteredCommandsList[this.enteredCommandsIndex];
            } else if (chr === String.fromCharCode(40)) {
                debugger;
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
        return Console;
    })();
    TSOS.Console = Console;
})(TSOS || (TSOS = {}));
