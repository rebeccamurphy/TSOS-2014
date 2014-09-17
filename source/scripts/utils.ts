/* --------
   Utils.ts

   Utility functions.
   -------- */

module TSOS {

    export class Utils {

        public static trim(str): string {
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
        }

        public static rot13(str: string): string {
            /*
               This is an easy-to understand implementation of the famous and common Rot13 obfuscator.
               You can do this in three lines with a complex regular expression, but I'd have
               trouble explaining it in the future.  There's a lot to be said for obvious code.
            */
            var retVal: string = "";
            for (var i in <any>str) {    // We need to cast the string to any for use in the for...in construct.
                var ch: string = str[i];
                var code: number = 0;
                if ("abcedfghijklmABCDEFGHIJKLM".indexOf(ch) >= 0) {
                    code = str.charCodeAt(i) + 13;  // It's okay to use 13.  It's not a magic number, it's called rot13.
                    retVal = retVal + String.fromCharCode(code);
                } else if ("nopqrstuvwxyzNOPQRSTUVWXYZ".indexOf(ch) >= 0) {
                    code = str.charCodeAt(i) - 13;  // It's okay to use 13.  See above.
                    retVal = retVal + String.fromCharCode(code);
                } else {
                    retVal = retVal + ch;
                }
            }
            return retVal;
        }

        public static checkValidProgram(code) :string {
            //assumes code has already been parsedto array
            //check if empty
            //debugger;
            var validProgramBB = "BB";
            var validProgramHex = "HEX";
            for (var k=0; k<code.length;k++){ //check for beepboop
                if (code[k].length < 32){    //each beepboop should have 8 beeps/boops
                    validProgramBB = "";
                    break;
                }
                else if (!(validProgramBB==="")){
                    for (var h =0; h< 32; h+=4){
                        var bb = code[k].substring(h, h+4).toUpperCase();; //should be a beep or boop
                        if ( !(bb === "BEEP") && !(bb==="BOOP")){
                            //break out of loop
                            validProgramBB="";
                            break;
                        }
                    }
                }
                else 
                    break; //breaks encasing forloop if validProgramBB is false
            }

            var hexChars = ["0", "1", "2", "3", "4", "5", "6", "7","8", "9", "A", "B", "C", "D", "E","F"];
            for (var i =0; i< code.length; i++){ //check for hex
                var numStr = code[i];
                if (numStr.length <2){
                    validProgramHex ="";
                    break;
                }
                if (!(validProgramHex==="")){
                    for (var j =0; j< numStr.length; j++){
                        if (hexChars.indexOf(numStr[j].toUpperCase()) === -1){
                            validProgramHex ="";
                            break;
                        }
                    }
                }
                else 
                    break; //breaks out of encasing for loop if validProgramHex is false
            }
            return validProgramHex + validProgramBB; 
        }
        public static convertProgram(lang:string, code):boolean{
            /*private Bin2Hex(n) :string {
                return parseInt(n,2).toString(16);
            };
            private Hex2Bin(n) :string {
                return parseInt(n,16).toString(2);
            };*/
            var beepboop= [];
            var hex = [];
            var numHex, numBin, numBB, num, temp = "";
            if (lang === "HEX") {//convert hex to beepboop
                for(var i=0; i<code.length;  i++){
                    numHex = code[i];
                    debugger;
                    numBin = parseInt(numHex,16).toString(2);//Hex to binary
                    numBin = Array(8-numBin.length).join("0") + numBin; //adds leading boops/0s
                    numBB = "";
                        for (var j=0; j<numBin.length; j++){
                            num = numBin.charAt(j);
                            temp = (num==="0") ? "BOOP": "BEEP";
                            numBB += temp;
                        }
                    beepboop.push(numBB);
                }
                var tempBBStr = beepboop.join(" "); //puts beepboop in textarea
                (<HTMLInputElement>document.getElementById("taProgramInput")).value = tempBBStr;
                return true;
            }
            else if (lang ==="BB"){//convert beepboop to hex
                for (var i=0; i < code.length; i++){
                    numBB = code[i];
                    numBin ="";
                    for (var j=0; j<32; j+4){ //coverts Beepboops to binary
                            var numStr = numBin.substring(j, j+=4);
                            var temp = (numStr==="BOOP") ? "0": "1";
                            numBin += temp;
                    }
                    numHex = parseInt(numBin, 2).toString(16);//coverts bin to hex
                    numHex = Array(2-numHex.length).join("0") +numHex; //adds leading 0s
                    hex.push(numHex.toUpperCase());
                }
                var tempHexStr = hex.join(" "); //puts hex in text area
                (<HTMLInputElement>document.getElementById("taProgramInput")).value = tempHexStr;
                return true;    
            }
            else 
                return false;
        return false;
        }


    }
}
