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
        }

        public krnDiskInUse(params){

        }

    }
}
