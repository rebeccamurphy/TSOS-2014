module TSOS {
    export class userProgram {
        private hexChars = ["0", "1", "2", "3", "4", "5", "6", "7","8", "9", "A", "B", "C", "D", "E","F"];
        public bbDisplayed = false;
        constructor(public name="",
                    public code= [],
                    public beepboop =[]){
        }

        public checkValid() :boolean {
            //assumes code has already been parsedto array
            //check if empty
            for (var i =0; i< this.code.length; i++){
                var numStr = this.code[i];
                if (numStr.length <2)
                    return false;
                for (var j =0; j< numStr.length; j++)
                    if (this.hexChars.indexOf(numStr[j]) === -1)
                        return false;
            }
            return true; 
        }
        private Bin2Hex(n) :string {
            return parseInt(n,2).toString(16);
        }
        private Hex2Bin(n) :string {
            return parseInt(n,16).toString(2);
        }
        private Hex2Dec(n):string {
            return parseInt(n,16).toString(10);
        }
        private Dec2Bin(n):string {
            return (n).toString(2);
        }

        public convertToBB():void {
            for(var i=0; i<this.code.length;  i++){
                var numHex = this.code[i];
                //var numDec = this.Hex2Dec(numHex);
                //var numBin = this.Dec2Bin(numDec);
                var numBin = this.Hex2Bin(numHex);
                numBin = Array(8-(numBin.length-1)).join("0") + numBin; 
                var numBB = "";
                for (var j=0; j<numBin.length; j++){
                    var num = numBin.charAt(j);
                    var temp = (num==="0") ? "BOOP": "BEEP";
                    numBB += temp;
                }
                this.beepboop.push(numBB);
            }
        }
        public printBB():void{
            var tempBBStr = this.beepboop.join(" ");
            (<HTMLInputElement>document.getElementById("taProgramInput")).value = tempBBStr;
            this.bbDisplayed = true;
        }
        public printHex():void{
            (<HTMLInputElement>document.getElementById("taProgramInput")).value = this.code.join(" ");
            this.bbDisplayed = false;
        }
            
    }   
}