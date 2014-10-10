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
                    // memory stuff
                    public base: number =0, //starting location in the mems
                    public limit:number=0  //max location in the mems. to prevent
                    ) {

        this.pid = _CurrPID;
        _CurrPID++;

        }
    }
}
