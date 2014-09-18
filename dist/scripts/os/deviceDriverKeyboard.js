///<reference path="deviceDriver.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/* ----------------------------------
DeviceDriverKeyboard.ts
Requires deviceDriver.ts
The Kernel Keyboard Device Driver.
---------------------------------- */
var TSOS;
(function (TSOS) {
    // Extends DeviceDriver
    var DeviceDriverKeyboard = (function (_super) {
        __extends(DeviceDriverKeyboard, _super);
        function DeviceDriverKeyboard() {
            // Override the base method pointers.
            _super.call(this, this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
            this.capslockOn = false;
        }
        DeviceDriverKeyboard.prototype.krnKbdDriverEntry = function () {
            // Initialization routine for this, the kernel-mode Keyboard Device Driver.
            this.status = "loaded";
            // More?
        };

        DeviceDriverKeyboard.prototype.krnKbdDispatchKeyPress = function (params) {
            // Parse the params.    TODO: Check that they are valid and osTrapError if not.
            var keyCode = params[0];
            var isShifted = params[1];

            //debugger;
            if (keyCode == 20 && !this.capslockOn)
                this.capslockOn = true;
            else if (keyCode == 20 && this.capslockOn)
                this.capslockOn = false;

            if (this.capslockOn && params[1])
                isShifted = false;
            else if (this.capslockOn && !isShifted)
                isShifted = this.capslockOn;

            if (keyCode == 17 && !this.ctrlHeld) {
                this.ctrlHeld = true;
            }
            _Kernel.krnTrace("Key code:" + keyCode + " shifted:" + isShifted);
            var chr = "";

            // Check to see if we even want to deal with the key that was pressed.
            if (((keyCode >= 65) && (keyCode <= 90)) || ((keyCode >= 97) && (keyCode <= 123))) {
                // Determine the character we want to display.
                // Assume it's lowercase...
                chr = String.fromCharCode(keyCode + 32);

                // ... then check the shift key and re-adjust if necessary.
                if (isShifted) {
                    chr = String.fromCharCode(keyCode);
                }
                _KernelInputQueue.enqueue(chr);
            } else if (((keyCode >= 48) && (keyCode <= 57) && !isShifted) || (keyCode == 32) || (keyCode == 13) || (keyCode == 8) || (keyCode == 9) || (keyCode == 38 && !isShifted) || (keyCode == 40 && !isShifted)) {
                if (keyCode == 38)
                    chr = "UP";
                else if (keyCode == 40)
                    chr = "DOWN";
                else
                    chr = String.fromCharCode(keyCode);
                _KernelInputQueue.enqueue(chr);
            } else if ((keyCode >= 186 && keyCode <= 192) || (keyCode >= 219 && keyCode <= 222) || ((keyCode >= 48) && (keyCode <= 57) && isShifted)) {
                switch (keyCode) {
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
        };
        return DeviceDriverKeyboard;
    })(TSOS.DeviceDriver);
    TSOS.DeviceDriverKeyboard = DeviceDriverKeyboard;
})(TSOS || (TSOS = {}));
