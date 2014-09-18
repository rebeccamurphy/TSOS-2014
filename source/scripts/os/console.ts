///<reference path="../globals.ts" />

/* ------------
     Console.ts

     Requires globals.ts

     The OS Console - stdIn and stdOut by default.
     Note: This is not the Shell.  The Shell is the "command line interface" (CLI) or interpreter for this console.
     ------------ */

module TSOS {

    export class Console {

        constructor(public currentFont = _DefaultFontFamily,
                    public currentFontSize = _DefaultFontSize,
                    public currentXPosition = 0,
                    public currentYPosition = _DefaultFontSize +_FontHeightMargin,
                    public buffer = "",
                    public currentLine = 0,
                    public prevXLineEnd = [],
                    public enteredCommandsList =[""],
                    public enteredCommandsIndex =0 ){

        }

        public init(): void {
            this.clearScreen();
            this.resetXY();
        }

        private clearScreen(): void {
            _Canvas.height = CONSOLE_VIEWPORT_HEIGHT; //resets console height
            _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
        }

        private resetXY(): void {
            this.currentXPosition = 0;
            this.currentYPosition = this.currentFontSize +_FontHeightMargin;
        }

        public handleInput(): void {
            while (_KernelInputQueue.getSize() > 0) {
                // Get the next character from the kernel input queue.
                
                var chr = _KernelInputQueue.dequeue();
                // Check to see if it's "special" (enter or ctrl-c) or "normal" (anything else that the keyboard device driver gave us).
                if (chr === String.fromCharCode(13)) { //     Enter key
                    if (this.buffer!== ""){
                        // The enter key marks the end of a console command, so ...
                        // ... tell the shell ...
                        _OsShell.handleInput(this.buffer);
                        //add into the previous command list
                        this.enteredCommandsList.push(this.buffer);
                        //reset the enteredcommandlist index
                        this.enteredCommandsIndex =this.enteredCommandsList.length;
                        // ... and reset our buffer.
                        this.buffer = "";
                    }
                } else if (chr === String.fromCharCode(8)) { //Backspace
                    this.eraseText(this.buffer.slice(-1));  //remove last character from canvas
                    
                    this.buffer = this.buffer.slice(0, -1); //remove last character from buffer

                } else if (chr === String.fromCharCode(9)) { //tab
                    this.matchCommand();
                } else if ((chr === "UP") || //up arrow, has the same charcode as &
                           (chr === "DOWN") ) {//down arrow, has same charcode as (
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
        }

        public putText(text: string, color?: string ): void {
            // My first inclination here was to write two functions: putChar() and putString().
            // Then I remembered that JavaScript is (sadly) untyped and it won't differentiate
            // between the two.  So rather than be like PHP and write two (or more) functions that
            // do the same thing, thereby encouraging confusion and decreasing readability, I
            // decided to write one function and use the term "text" to connote string or char.
            // UPDATE: Even though we are now working in TypeScript, char and string remain undistinguished.
            if (text !== "" &&text.length ===1) { //only for characters
                this.putChar(text, color); //might be  problem      
                
            }
            else if (text !=="" && text.length>1){ //strings. there's probably a way to make this better. 
                var words = text.split(" ");
                for (var i =0; i<words.length; i++){
                    var word = words[i];
                    var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, word);
                    if (words.length > 1 && i !== words.length-1)
                        word += " ";

                    if (this.currentXPosition + offset > _Canvas.width){
                        this.prevXLineEnd.push(this.currentXPosition);
                        this.advanceLine();
                    }
                    for (var j=0; j < word.length; j++)
                        this.putChar(word.charAt(j));
                }
            }
        }
        public putChar(text, color?:string) :void{
                var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
                if (this.currentXPosition + offset > _Canvas.width){
                    this.prevXLineEnd.push(this.currentXPosition);
                    this.advanceLine();
                }
                if (color===undefined)
                    // Draw the text at the current X and Y coordinates.
                    _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, text, CONSOLE_TEXT_COLOR);
                else{
                    _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, text, color);
                }
                        
                // Move the current X position.
                this.currentXPosition = this.currentXPosition + offset;
        }
        public eraseText(text) :void{
            var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
            this.currentXPosition = this.currentXPosition - offset;
            var roundedXPos = Math.round(this.currentXPosition); // work around rounding bug
            if (roundedXPos <0 ) 
                this.backLine(offset);
            _DrawingContext.fillStyle = CONSOLE_BGC;
            _DrawingContext.fillRect(this.currentXPosition, this.currentYPosition - _DefaultFontSize, offset, _DefaultFontSize + _FontHeightMargin+1);
            //leaving in next line for later virus mode or something
            //_DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, text, CONSOLE_BGC);
        }
        
        public advanceLine(): void {
            this.currentXPosition = 0;
            this.currentYPosition += _DefaultFontSize + _FontHeightMargin;
            this.currentLine++;
            if (this.currentYPosition >= _Canvas.height)
                this.changeCanvasLength();
            
        }
        public backLine(offset): void{
            this.currentXPosition = this.prevXLineEnd.pop()- offset;
            this.currentYPosition -= _DefaultFontSize + _FontHeightMargin;
            this.currentLine--;
            if (this.currentYPosition >= CONSOLE_VIEWPORT_HEIGHT)
                this.changeCanvasLength();
        }
        public clearLine() :void {
            _DrawingContext.fillStyle = CONSOLE_BGC;
            _DrawingContext.fillRect(0, this.currentYPosition - _DefaultFontSize, _Canvas.width, _DefaultFontSize + _FontHeightMargin+1);
            this.currentXPosition=0;
            this.buffer="";
        }
        public changeCanvasLength() :void {
            var img = _DrawingContext.getImageData(0,0, _Canvas.width, _Canvas.height); //creates image of old canvas
            _Canvas.height = this.currentYPosition +5; //increases length of console, +5 for bottom buffer
            _DrawingContext.putImageData(img, 0,0);    //redraws old canvas on longer canvas
            this.moveScrollbar("bottom");
        }
        public moveScrollbar(area) :void{
            //gave option, incase moving scrollbar diff areas needed later
            if (area == "bottom")
                _ConsoleScrollbar.scrollTop = _ConsoleScrollbar.scrollHeight; //moves scrollbar to bottom
        }
        public matchCommand():void{
            var matchingCommands=[];
            var matchingCommand ="";
            for ( var i=0; i<_OsShell.commandList.length; i++){
                var msgLength = this.buffer.length;
                var command = _OsShell.commandList[i].command;
                if (this.buffer == command.substr(0, msgLength)){
                    matchingCommands.push(command);
                    matchingCommand= command.slice(msgLength);
                }
            }
            if (matchingCommands.length===1){ //auto complete the one command
                this.buffer+=matchingCommand;
                this.putText(matchingCommand);
            }
            else if (matchingCommands.length>1){ //display matching commands
                this.advanceLine();
                for (var i=0;i< matchingCommands.length; i++)
                    this.putText(matchingCommands[i] + " ");
                this.advanceLine();
                _OsShell.putPrompt();
                this.putText(this.buffer);
            }
            //else do nothing basically
        }

        public approxMatchCommand() :void {
            var approxMatchingCommands =[];
            var approxMatchingCommand ="";
            for ( var i=0; i<_OsShell.commandList.length; i++){
                var msgLength = this.buffer.length;
                var command = _OsShell.commandList[i].command;
                if(command.indexOf(this.buffer)!==-1)
                    approxMatchingCommands.push(command);
                else{
                    for (var j=0; j< this.buffer.length; j++){
                        if (command.indexOf(this.buffer.charAt(j)) ===-1) // if buffer char isnt in command
                            break;
                        else if (j === this.buffer.length-1) // if all chars were in command and its at the end of the buff
                            approxMatchingCommands.push(command);
                    }
                }
            }
            if (approxMatchingCommands.length>0){ //display approximate matching commands
                this.advanceLine();
                this.putText("Did you mean any of the following?");
                this.advanceLine();
                for (var i=0;i< approxMatchingCommands.length; i++)
                    this.putText(approxMatchingCommands[i] + " ");
            }
        }

        public enteredCommands(chr) :void{
            
            if ((chr === "UP")&& //up arrow
                (this.enteredCommandsIndex >1)){ //current index useable                  
                this.enteredCommandsIndex--; //moves up item in list
                this.clearLine();
                _OsShell.putPrompt();
                this.putText(this.enteredCommandsList[this.enteredCommandsIndex]);
                this.buffer = this.enteredCommandsList[this.enteredCommandsIndex];                
                
            }
            else if (chr ==="DOWN"){//down arrow
                if (this.enteredCommandsIndex < this.enteredCommandsList.length){ //current index useable                  
                    this.enteredCommandsIndex++;    //moves down item in list
                    this.clearLine();
                    _OsShell.putPrompt();
                    if (this.enteredCommandsIndex !== this.enteredCommandsList.length){
                        //displays previous command, unless last command has been display
                        //then it clears the row
                        this.putText(this.enteredCommandsList[this.enteredCommandsIndex]);
                        this.buffer = this.enteredCommandsList[this.enteredCommandsIndex];
                    }

                }
                
            }
        }
        public computerOver():void{
            this.clearScreen();
            _DrawingContext.fillStyle="#3a50b6";
            _DrawingContext.fillRect(0, 0, _Canvas.width, _Canvas.height);
            var img = new Image();
            img.onload = function() {
                _DrawingContext.drawImage(img, 0, 100);
            };
            img.src ="http://i.imgur.com/sOoqj6a.jpg";
        }
            
    }
 }

        
