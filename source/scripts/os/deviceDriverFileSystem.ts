///<reference path="deviceDriver.ts" />

/* ----------------------------------
   DeviceDriverFileSystem.ts

   Requires deviceDriver.ts

   The Kernel File System Device Driver.
   ---------------------------------- */

module TSOS {

    // Extends DeviceDriver
    export class DeviceDriverFileSystem extends DeviceDriver {
        private tracks:    number;
        private sectors:   number;
        private blocks:    number;
        private metaData:  number;
        private dataBytes: number;
        constructor() {
            // Override the base method pointers.
            this.tracks   =4;
            this.sectors  =8;
            this.blocks   =8;
            this.metaData =4;
            this.dataBytes=60;
            super(this.krnFileSystemDriverEntry, this.krnDiskInUse);
            
        }


        public krnFileSystemDriverEntry() {
          debugger;
            // Initialization routine for this, the kernel-mode Keyboard Device Driver.
          this.status = "File System Loaded";
            // More?
          this.init(false);
        }

        public init(format:boolean){
          if ( (sessionStorage.length===0&&!format)||format) {
            //set the master boot record
            sessionStorage.setItem("000", "1---"+ "001"+new Array(57).join('0'));                  
            for (var t=0; t<this.tracks; t++){
              for (var s=0; s<this.sectors;s++){
                for(var b=1; b<this.blocks;b++){
                  try {
                    sessionStorage.setItem( t+""+s+""+b, new Array(this.dataBytes+this.metaData).join('0'));                  
                  } 
                  catch (e) {
                      alert('Quota exceeded!');
                    }
                  
                } 
              }
            }
          }
        }

        public getMetaData(tsb:string){
          return sessionStorage.getItem(tsb);
        }
            
        public checkInUse(tsb:string):boolean{
          return this.getMetaData(tsb).charAt(0) ==='1';
        }

        public getNextTSB(tsb:string){
          return this.getMetaData(tsb).substring(1, this.metaData);
        }

        public getDataBytes(tsb:string){
          return sessionStorage.getItem(tsb).substring(this.metaData, this.metaData+this.dataBytes);
        }

        public formatDisk(){
          this.init(true);
        }
        public krnDiskInUse(params){

        }



    }
}
