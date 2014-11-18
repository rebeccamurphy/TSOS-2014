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
                for(var b=0; b<this.blocks;b++){
                  if (""+t+""+b+""+s !== "000"){
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
        }

        public getBlock(tsb:string){
          return sessionStorage.getItem(tsb);
        }

        public getMetaData(tsb:string){
          return this.getBlock(tsb).substring(0, this.metaData);
        }
            
        public checkInUse(tsb:string):boolean{
          return this.getMetaData(tsb).charAt(0) ==='1';
        }

        public getNextTSB(tsb:string){
          return this.getMetaData(tsb).substring(1, this.metaData);
        }

        public getDataBytes(tsb:string){
          return this.getBlock(tsb).substring(this.metaData, this.metaData+this.dataBytes);
        }

        public fullFormatDisk(){
          this.init(true);
        }
        public quickFormatDisk(){
          //sets every block as not inuse, but keeps the data
          for (var t=0; t<this.tracks; t++){
            for (var s=0; s<this.sectors;s++){
              for(var b=0; b<this.blocks;b++){
                if (""+t+""+b+""+s !== "000"){
                try {
                  sessionStorage.setItem( t+""+s+""+b, "0"+ sessionStorage.getItem(t+""+s+""+b).substring(1));                  
                } 
                catch (e) {
                    alert('Quota exceeded!');
                  }
               } 
              } 
            }
          }

        }
        public krnDiskInUse(diskAction:DiskAction, data?){
          DISK_IN_USE = true;
          switch(diskAction){
            case DiskAction.FullFormat:{
              this.fullFormatDisk();
              break;
            }
            case DiskAction.QuickFormat:{
              this.quickFormatDisk();
              break;
            }

          }

          DISK_IN_USE =false;

        }



    }
}
