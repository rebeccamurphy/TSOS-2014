module TSOS {
    export class userProgram {
        private hexChars = ["0", "1", "2", "3", "4", "5", "6", "7","8", "9", "A", "B", "C", "D", "E","F"];
        constructor(public name="",
                    public code= []){
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
            
    }
}