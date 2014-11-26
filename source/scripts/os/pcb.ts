/*
FUTURE ME PUT HELLA SWEET COMMENTS HERE. 
*/

module TSOS {
    export class PCB {
        constructor(
                    //process stuff
                    public PC: number = 0,
                    public Acc: number = 0,
                    public Xreg: number = 0,
                    public Yreg: number = 0,
                    public Zflag: number = 0,
                    public pid: number =0,
                    public IR: string="",
                    // memory stuff
                    public base: number =0, //starting location in the mems
                    public limit:number=0,  //max location in the mems. to prevent
                    public state: State =State.New, //new, ready, or running state of program
                    public priority:number = DEFAULT_PRIORITY,
                    public location:Locations = Locations.Memory //defaults to memory, if written to disk will switch to disk
                    
                    ) {

        this.pid = _CurrPID;
        _CurrPID++;

        }

        public reset(){
            this.PC=0;
            this.Acc=0
            this.Xreg=0
            this.Zflag=0;
            this.IR="";
        }
    }
}
