/* --------
Utils.ts
Utility functions.
-------- */
var TSOS;
(function (TSOS) {
    var Utils = (function () {
        function Utils() {
        }
        Utils.trim = function (str) {
            // Use a regular expression to remove leading and trailing spaces.
            return str.replace(/^\s+ | \s+$/g, "");
            /*
            Huh? WTF? Okay... take a breath. Here we go:
            - The "|" separates this into two expressions, as in A or B.
            - "^\s+" matches a sequence of one or more whitespace characters at the beginning of a string.
            - "\s+$" is the same thing, but at the end of the string.
            - "g" makes is global, so we get all the whitespace.
            - "" is nothing, which is what we replace the whitespace with.
            */
        };

        Utils.rot13 = function (str) {
            /*
            This is an easy-to understand implementation of the famous and common Rot13 obfuscator.
            You can do this in three lines with a complex regular expression, but I'd have
            trouble explaining it in the future.  There's a lot to be said for obvious code.
            */
            var retVal = "";
            for (var i in str) {
                var ch = str[i];
                var code = 0;
                if ("abcedfghijklmABCDEFGHIJKLM".indexOf(ch) >= 0) {
                    code = str.charCodeAt(i) + 13; // It's okay to use 13.  It's not a magic number, it's called rot13.
                    retVal = retVal + String.fromCharCode(code);
                } else if ("nopqrstuvwxyzNOPQRSTUVWXYZ".indexOf(ch) >= 0) {
                    code = str.charCodeAt(i) - 13; // It's okay to use 13.  See above.
                    retVal = retVal + String.fromCharCode(code);
                } else {
                    retVal = retVal + ch;
                }
            }
            return retVal;
        };

        Utils.checkValidProgram = function (code) {
            //assumes code has already been parsed to array
            //check if empty
            var validProgramBB = "BB";
            var validProgramHex = "HEX";
            for (var k = 0; k < code.length; k++) {
                if (code[k].length !== 32) {
                    validProgramBB = "";
                    break;
                } else if (!(validProgramBB === "")) {
                    for (var h = 0; h < 32; h += 4) {
                        var bb = code[k].substring(h, h + 4).toUpperCase();
                        ;
                        if (!(bb === "BEEP") && !(bb === "BOOP")) {
                            //break out of loop
                            validProgramBB = "";
                            break;
                        }
                    }
                } else
                    break;
            }

            //now it checks if the code could be valid hex
            var hexChars = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F"];
            for (var i = 0; i < code.length; i++) {
                var numStr = code[i];
                if (numStr.length !== 2) {
                    validProgramHex = "";
                    break;
                }
                if (!(validProgramHex === "")) {
                    for (var j = 0; j < numStr.length; j++) {
                        if (hexChars.indexOf(numStr[j].toUpperCase()) === -1) {
                            //checks if numStr is made of valid hex chars
                            validProgramHex = "";
                            break;
                        }
                    }
                } else
                    break;
            }
            return validProgramHex + validProgramBB;
        };
        Utils.convertProgram = function (lang, code, priority) {
            var beepboop = [];
            var hex = [];
            var numHex, numBin, numBB, num, temp = "";
            if (lang === "HEX") {
                for (var i = 0; i < code.length; i++) {
                    numHex = code[i];
                    numBin = parseInt(numHex, 16).toString(2); //Hex to binary
                    numBin = Array(8 - (numBin.length - 1)).join("0") + numBin; //adds leading boops/0s
                    numBB = "";
                    console.log(numBin);
                    for (var j = 0; j < numBin.length; j++) {
                        num = numBin.charAt(j);
                        temp = (num === "0") ? "BOOP" : "BEEP";
                        numBB += temp;
                    }
                    beepboop.push(numBB);
                }
                var tempBBStr = beepboop.join(" ");

                //puts beepboop in textarea
                TSOS.Control.displayUserProgram(tempBBStr);
                return true;
            } else if (lang === "BB" || lang === "runnableBB") {
                for (var i = 0; i < code.length; i++) {
                    numBB = code[i];
                    numBin = "";
                    for (var j = 0; j < 32; j += 4) {
                        var numStr = numBB.substring(j, j + 4);
                        var temp = (numStr === "BOOP") ? "0" : "1";
                        numBin += temp;
                    }
                    numHex = parseInt(numBin, 2).toString(16); //coverts bin to hex
                    numHex = Array(2 - (numHex.length - 1)).join("0") + numHex; //adds leading 0s
                    hex.push(numHex.toUpperCase());
                }
                var tempHexStr = hex.join(" ");
                if (lang === "runnableBB") {
                    //TODO
                    //_MemoryManager.loadProgram(hex, priority);
                } else
                    //puts hex in text area
                    TSOS.Control.displayUserProgram(tempHexStr);
                return true;
            } else
                return false;
        };
        Utils.dec2hex = function (numDec) {
            return numDec.toString(16).toUpperCase();
        };
        Utils.hex2dec = function (numHex) {
            return parseInt(numHex, 16);
        };

        Utils.createHexIndex = function (numDec) {
            var numHex = this.dec2hex(numDec);
            return "0x" + Array(3 - (numHex.length - 1)).join("0") + numHex;
        };
        Utils.str2hex = function (name) {
            var hexStr = "";
            for (var i = 0; i < name.length; i++) {
                var temp = TSOS.Utils.dec2hex(name.charCodeAt(i));
                temp = new Array(2 - temp.length).join('0') + temp;
                hexStr += temp;
            }
            return hexStr;
        };
        Utils.hex2str = function (hexName) {
            var str = "";
            var hexArray = hexName.match(/.{1,2}/g);
            for (var i = 0; i < hexArray.length; i++) {
                var charFromHex = String.fromCharCode(this.hex2dec(hexArray[i]));
                str += charFromHex;
            }
            return str;
        };

        // Method to determine if the browser that the user is using supports
        // the HTML5 localStorage
        // Taken from http://diveintohtml5.info/storage.html
        Utils.supports_html5_storage = function () {
            try  {
                return 'localStorage' in window && window['localStorage'] !== null;
            } catch (e) {
                return false;
            }
        };

        Utils.InvalidFileName = function (fileName) {
            return fileName.indexOf(' ') !== -1 || fileName.indexOf('.') !== -1 || fileName.length > 60;
        };

        Utils.trimTrailingChars = function (s, charToTrim) {
            var regExp = new RegExp(charToTrim + "+$");
            var result = s.replace(regExp, "");

            return result;
        };
        Utils.capitaliseFirstLetter = function (string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        };
        return Utils;
    })();
    TSOS.Utils = Utils;
})(TSOS || (TSOS = {}));
