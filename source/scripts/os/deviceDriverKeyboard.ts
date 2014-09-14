///<reference path="deviceDriver.ts" />

/* ----------------------------------
   DeviceDriverKeyboard.ts

   Requires deviceDriver.ts

   The Kernel Keyboard Device Driver.
   ---------------------------------- */

module TSOS {

    // Extends DeviceDriver
    export class DeviceDriverKeyboard extends DeviceDriver {
        capslockOn:boolean;
        constructor() {
            // Override the base method pointers.
            super(this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
            this.capslockOn=false;
        }

        public krnKbdDriverEntry() {
            // Initialization routine for this, the kernel-mode Keyboard Device Driver.
            this.status = "loaded";
            // More?
        }

        public krnKbdDispatchKeyPress(params) {
            // Parse the params.    TODO: Check that they are valid and osTrapError if not.
            
            var keyCode = params[0];
            var isShifted = params[1];
            if (keyCode ==20 && !this.capslockOn) //capslock turned on
                this.capslockOn = true;
            else if (keyCode==20 && this.capslockOn)//capslock turned off
                this.capslockOn = false;

            if (this.capslockOn && params[1])//capslock on and shift held
                isShifted = false;
            else if (this.capslockOn && !isShifted) //capslock on and shift not held
                isShifted = this.capslockOn;
                
            _Kernel.krnTrace("Key code:" + keyCode + " shifted:" + isShifted);
            var chr = "";
            // Check to see if we even want to deal with the key that was pressed.
            if (((keyCode >= 65) && (keyCode <= 90)) ||   // A..Z
                ((keyCode >= 97) && (keyCode <= 123))) {  // a..z {
                // Determine the character we want to display.
                // Assume it's lowercase...
                chr = String.fromCharCode(keyCode + 32);
                // ... then check the shift key and re-adjust if necessary.
                if (isShifted) {
                    chr = String.fromCharCode(keyCode);
                }
                _KernelInputQueue.enqueue(chr);
            } else if (((keyCode >= 48) && (keyCode <= 57) &&!isShifted) ||   // digits
                        (keyCode == 32)                     ||   // space
                        (keyCode == 13)                     ||   // enter
                        (keyCode == 8 )                     ||   // backspace
                        (keyCode == 9)                      ||   // tab
                        (keyCode == 38)                     ||   //arrow up
                        (keyCode == 40))                         //arrow down         
                {                      
                    chr = String.fromCharCode(keyCode);
                    _KernelInputQueue.enqueue(chr);
                    
            } else if ((keyCode >= 186 && keyCode<= 192) || //punctuation
                        (keyCode >=219 && keyCode <=222) ||
                        ((keyCode >= 48) && (keyCode <= 57) &&isShifted)) { //number punctuation/symbols
                    switch (keyCode)
                    {
                        //number punctation/symbols keys
                        case 48: {
                            //0
                            chr = ")";
                            break;
                        }
                        case 49: {
                            //1
                            chr = "!";
                            break;
                        }
                        case 50: {
                            //2
                            chr = "@";
                            break;
                        }
                        case 51: {
                            //3
                            chr = "#";
                            break;
                        }
                        case 52: {
                            //4
                            chr = "$";
                            break;
                        }
                        case 53: {
                            //5
                            chr = "%";
                            break;
                        }
                        case 54: {
                            //6
                            chr = "^";
                            break;
                        }
                        case 55: {
                            //7
                            chr = "&";
                            break;
                        }
                        case 56: {
                            //8
                            chr = "*";
                            break;
                        }
                        case 57: {
                            //9
                            chr = "(";
                            break;
                        }

                        //normal punctuation keys
                        case 186: {
                            //semicolon
                            chr = (isShifted) ? ":" : ";";
                            break;
                        }
                        case 187: {
                            //equal
                            chr = (isShifted) ? "+" : "=";
                            break;
                        }
                        case 188: {
                            //comma
                            chr = (isShifted) ? "<" : ",";
                            break;
                        }
                        case 189: {
                            //dash
                            chr = (isShifted) ? "_" : "-";
                            break;
                        }
                        case 190: {
                            //period
                            chr = (isShifted) ? ">" : ".";
                            break;
                        }
                        case 191: {
                            //forward slash
                            chr = (isShifted) ? "?" : "/";
                            break;
                        }
                        case 192: {
                            //grave accent
                            chr = (isShifted) ? "~" : "`";
                            break;
                        }
                        case 219: {
                            //open bracket
                            chr = (isShifted) ? "{" : "[";
                            break;
                        }
                        case 220: {
                            //backslash
                            chr = (isShifted) ? "|" : "\\";
                            break;
                        }
                        case 221: {
                            //close bracket
                            chr = (isShifted) ? "}" : "]";
                            break;
                        }
                        case 222: {
                            //close bracket
                            chr = (isShifted) ? "\"" : "'";
                            break;
                        }
                        default: {
                            console.log("i hecked up.");
                        }
                    }
                    _KernelInputQueue.enqueue(chr);
                    
            }

        }
    }
}
