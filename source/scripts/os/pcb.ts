/*
FUTURE ME PUT HELLA SWEET COMMENTS HERE. 
*/

module TSOS {
    export class PCB {
        
        constructor(public PC: number = 0,
                    public Acc: number = 0,
                    public Xreg: number = 0,
                    public Yreg: number = 0,
                    public Zflag: number = 0,
                    public pid: number =0
                    ) {

        }

        public init(): void {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.pid= 0;
        }

        public incrementPID(){
        	this.pid++;
        }
    }
}
