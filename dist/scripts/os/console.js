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
            if (typeof currentFont === "undefined") { currentFont = _DefaultFontFamily; }
            if (typeof currentFontSize === "undefined") { currentFontSize = _DefaultFontSize; }
            if (typeof currentXPosition === "undefined") { currentXPosition = 0; }
            if (typeof currentYPosition === "undefined") { currentYPosition = _DefaultFontSize + _FontHeightMargin; }
            if (typeof buffer === "undefined") { buffer = ""; }
            if (typeof currentLine === "undefined") { currentLine = 0; }
            if (typeof prevXLineEnd === "undefined") { prevXLineEnd = []; }
            if (typeof enteredCommandsList === "undefined") { enteredCommandsList = [""]; }
            if (typeof enteredCommandsIndex === "undefined") { enteredCommandsIndex = 0; }
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
                } else if (chr === String.fromCharCode(8)) {
                    this.eraseText(this.buffer.slice(-1)); //remove last character from canvas

                    this.buffer = this.buffer.slice(0, -1); //remove last character from buffer
                } else if (chr === String.fromCharCode(9)) {
                    this.matchCommand();
                } else if ((chr === "UP") || (chr === "DOWN")) {
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
            if (text !== "" && text.length === 1) {
                this.putChar(text, color); //might be  problem
            } else if (text !== "" && text.length > 1) {
                var words = text.split(" ");
                for (var i = 0; i < words.length; i++) {
                    var word = words[i];
                    var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, word);
                    if (words.length > 1 && i !== words.length - 1)
                        word += " ";

                    if (this.currentXPosition + offset > _Canvas.width) {
                        this.prevXLineEnd.push(this.currentXPosition);
                        this.advanceLine();
                    }
                    for (var j = 0; j < word.length; j++)
                        this.putChar(word.charAt(j));
                }
            }
        };
        Console.prototype.putChar = function (text, color) {
            var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
            if (this.currentXPosition + offset > _Canvas.width) {
                this.prevXLineEnd.push(this.currentXPosition);
                this.advanceLine();
            }
            if (color === undefined)
                // Draw the text at the current X and Y coordinates.
                _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, text, CONSOLE_TEXT_COLOR);
            else {
                _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, text, color);
            }

            // Move the current X position.
            this.currentXPosition = this.currentXPosition + offset;
        };
        Console.prototype.eraseText = function (text) {
            var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
            this.currentXPosition = this.currentXPosition - offset;
            var roundedXPos = Math.round(this.currentXPosition);
            if (roundedXPos < 0)
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
            if (this.currentYPosition >= _Canvas.height)
                this.changeCanvasLength();
        };
        Console.prototype.backLine = function (offset) {
            this.currentXPosition = this.prevXLineEnd.pop() - offset;
            this.currentYPosition -= _DefaultFontSize + _FontHeightMargin;
            this.currentLine--;
            if (this.currentYPosition >= CONSOLE_VIEWPORT_HEIGHT)
                this.changeCanvasLength();
        };
        Console.prototype.clearLine = function () {
            _DrawingContext.fillStyle = CONSOLE_BGC;
            _DrawingContext.fillRect(0, this.currentYPosition - _DefaultFontSize, _Canvas.width, _DefaultFontSize + _FontHeightMargin + 1);
            this.currentXPosition = 0;
            this.buffer = "";
        };
        Console.prototype.changeCanvasLength = function () {
            var img = _DrawingContext.getImageData(0, 0, _Canvas.width, _Canvas.height);
            _Canvas.height = this.currentYPosition + 5; //increases length of console, +5 for bottom buffer
            _DrawingContext.putImageData(img, 0, 0); //redraws old canvas on longer canvas
            this.moveScrollbar("bottom");
        };
        Console.prototype.moveScrollbar = function (area) {
            //gave option, incase moving scrollbar diff areas needed later
            if (area == "bottom")
                _ConsoleScrollbar.scrollTop = _ConsoleScrollbar.scrollHeight; //moves scrollbar to bottom
        };
        Console.prototype.matchCommand = function () {
            var matchingCommands = [];
            var matchingCommand = "";
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
            } else if (matchingCommands.length > 1) {
                this.advanceLine();
                for (var i = 0; i < matchingCommands.length; i++)
                    this.putText(matchingCommands[i] + " ");
                this.advanceLine();
                _OsShell.putPrompt();
                this.putText(this.buffer);
            }
            //else do nothing basically
        };

        Console.prototype.approxMatchCommand = function () {
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
            if ((chr === "UP") && (this.enteredCommandsIndex > 1)) {
                this.enteredCommandsIndex--; //moves up item in list
                this.clearLine();
                _OsShell.putPrompt();
                this.putText(this.enteredCommandsList[this.enteredCommandsIndex]);
                this.buffer = this.enteredCommandsList[this.enteredCommandsIndex];
            } else if (chr === "DOWN") {
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
            this.clearScreen();
            _DrawingContext.fillStyle = "#3a50b6";
            _DrawingContext.fillRect(0, 0, _Canvas.width, _Canvas.height);
            var img = new Image();
            img.onload = function () {
                _DrawingContext.drawImage(img, 0, 100);
            };
            img.src = "http://i.imgur.com/sOoqj6a.jpg";
        };
        return Console;
    })();
    TSOS.Console = Console;
})(TSOS || (TSOS = {}));
