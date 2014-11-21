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
        public  diskFull:  boolean;//data full
        private fileTFull: boolean;//file track full
        p
        constructor() {
            // Override the base method pointers.
            this.tracks   =4;
            this.sectors  =8;
            this.blocks   =8;
            this.metaData =4;
            this.dataBytes=60;
            this.diskFull=false;
            this.fileTFull = false;
            super(this.krnFileSystemDriverEntry, this.krnDiskInUse);
            SWAP_FILE_START_CHAR = TSOS.Utils.str2hex('.');
            //001-077 is for file names
            //100-377 is for data
            //swap files begin with .

        }


        public krnFileSystemDriverEntry() {
          _FileNames= new Queue();
          _Trash= new Queue();
            // Initialization routine for this, the kernel-mode Keyboard Device Driver.
          this.status = "File System Loaded";
            // More?
          this.init(false);
        }

        public init(format:boolean){
          if ( (sessionStorage.length===0&&!format)||format) {
            //set the master boot record
            //first 3 spots of data is next available file name
            //next 3 spots are for the next available datablock 
            sessionStorage.setItem("000", "1---"+ TSOS.Utils.str2hex("001100")+new Array(54).join('0'));                  
            for (var t=0; t<this.tracks; t++){
              for (var s=0; s<this.sectors;s++){
                for(var b=0; b<this.blocks;b++){
                  if (""+t+""+s+""+b !== "000"){
                    //TODO Find out if swap files should be deleted on format
                  try {
                    //debugger;
                    var blankBlock =new Array(this.dataBytes+this.metaData+1).join('0');
                    sessionStorage.setItem( t+""+s+""+b, blankBlock);                  
                  } 
                  catch (e) {
                      alert('Quota exceeded!');
                      return false;
                    }
                 } 
                } 
              }
            }
            return true;
          }
          else{
            //add the file names to file name global
            for (var t=0; t<=0; t++){
              for (var s=0; s<=7;s++){
                for(var b=0; b<=7;b++){
                  if (""+t+""+s+""+b !== "000"){
                    var tempName = this.getFileName(t+""+s+""+b);
                    if(tempName!=="" && tempName.indexOf(SWAP_FILE_START_CHAR)===-1 && this.InUse(t+""+s+""+b))
                      //makes sure swap files are not added to the file list
                      _FileNames.enqueue(tempName);  
                  } 
                }
              }
            }
          }
        }

        public getFileName(tsb:string){
          var temp = this.getDataBytes(tsb);
          //remove trailing 0s
          temp = temp.replace(/0+$/g, "");
          if (temp.length %2 !==0)
            temp+='0'; //accidentally removed an important hex 0.
          if (temp==="")
            return "";
          return TSOS.Utils.hex2str(temp);
        }

        public getBlock(tsb:string){
          return sessionStorage.getItem(tsb);
        }
        

        public getMetaData(tsb:string){
          return this.getBlock(tsb).substring(0, this.metaData);
        }

        public setMetaData(tsb:string, metaData:string){
          if (this.InUse(tsb)){
            sessionStorage.setItem(tsb,"1"+ metaData+ this.getDataBytes(tsb));
          }
          else {
            sessionStorage.setItem(tsb,"0"+ metaData+ this.getDataBytes(tsb));  
          }
        }
            
        public InUse(tsb:string):boolean{
          return this.getMetaData(tsb).charAt(0) ==='1';
        }

        public getNextTSB(tsb:string){
          debugger;
          return this.getMetaData(tsb).substring(1, this.metaData);
        }

        public getDataBytes(tsb:string){
          return this.getBlock(tsb).substring(this.metaData, this.metaData+this.dataBytes);
        }
        public setDataBytes(tsb:string, blockData:string){
          sessionStorage.setItem(tsb, this.getMetaData(tsb) + blockData+new Array(61-blockData.length).join('0'));
        }

        public getNextAvailbleFileTSB(){
          return TSOS.Utils.hex2str(this.getDataBytes("000").substring(0, 6));
        }
        public getNextAvailbleDataTSB(){
          return TSOS.Utils.hex2str(this.getDataBytes("000").substring(6, 12));
        }

        public markBlockAsAvail(tsb){
            sessionStorage.setItem(tsb, "0"+ sessionStorage.getItem(tsb).substring(1));
        }
        public markBlockAsUnAvail(tsb){
            sessionStorage.setItem(tsb, "1"+ sessionStorage.getItem(tsb).substring(1));
        }
        public setNextAvailbleTSB(type:string){
          if (type==="file"){
            var startTSB = this.getNextAvailbleFileTSB();
            var tmax = 0;
            var smax = 7;
            var bmax = 7;
          }
          else if (type==="data"){
            var startTSB = this.getNextAvailbleDataTSB();
            var tmax = 3;
            var smax = 7;
            var bmax = 7;
          }
          //parse the current availbe tsb
          var currt = parseInt(startTSB.charAt(0));
          var currs = parseInt(startTSB.charAt(1));
          var currb = parseInt(startTSB.charAt(2));
          //first try to find the availbe tsb by going down in file system
          for (var t = currt;t<tmax+1; t++){
              for (var s = currs;s<smax+1;s++){
                for(var b=currb;b<bmax+1;b++){
                  if (""+t+""+s+""+b !== "000"){
                    if (!this.InUse(t+""+s+""+b)&& ( t+""+s+""+b!==currt+""+currs+""+currb)){
                      var newMBRData = sessionStorage.getItem("000");
                      newMBRData = newMBRData.replace(TSOS.Utils.str2hex(startTSB), TSOS.Utils.str2hex(t+""+s+""+b));
                      sessionStorage.setItem("000", newMBRData);
                      this.diskFull =false;
                      return; 
                  }                  
                 } 
                } 
              }
            }
            //now we try going up
            for (var t = 0;t<currt; t++){
              for (var s = 0;s<currs;s++){
                for(var b=0;b<currb;b++){
                  if (""+t+""+s+""+b !== "000"){
                    if (!this.InUse(t+""+s+""+b)&&(t+""+s+""+b!==currt+""+currs+""+currb)){
                      var newMBRData = sessionStorage.getItem("000");
                      newMBRData = newMBRData.replace(TSOS.Utils.str2hex(startTSB), TSOS.Utils.str2hex(t+""+s+""+b));
                      sessionStorage.setItem("000", newMBRData);
                      this.diskFull=false;
                      return; 
                  }                  
                 } 
                } 
              }
            }
            if (type ==='data'){
              //if neither prove fruitful make the disk as full
              this.diskFull = true;
            }
            else if (type==='file'){
              //fileNames full
              this.fileTFull=true;
            }
        }
        public fullFormatDisk(){
          return this.init(true);
        }
        public quickFormatDisk(){
          //sets every block as not inuse, but keeps the data
          for (var t=0; t<this.tracks; t++){
            for (var s=0; s<this.sectors;s++){
              for(var b=0; b<this.blocks;b++){
                if (""+t+""+b+""+s !== "000"){
                try {
                  //set all items except the master boot record as not in use
                  this.markBlockAsAvail(t+""+s+""+b);
                } 
                catch (e) {
                    alert('Quota exceeded!');
                    return false;
                  }
               } 
              } 
            }
          }
          return true;

        }
        public deleteFile(tsb:string){
          //sets file name and all data as available
          var tempTSB = tsb;
          //delete the file name
          this.markBlockAsAvail(tempTSB);
          //delete the data
          this.deleteFileData(tempTSB);
          //remove the last block associate with that file
          this.markBlockAsAvail(tempTSB);
          return true;
        }
        public deleteFileData(tsb:string){
          
          //skip deleting the file Unreadname
          var tempTSB = this.getNextTSB(tsb);
          while (tempTSB!=="000"){
            this.markBlockAsAvail(tempTSB);
            tempTSB = this.getNextTSB(tempTSB);
          }
        }
        public findFile(name:string, recover:boolean){
          
          var swapFile1Chr = TSOS.Utils.str2hex(".");
            for (var t=0; t<=0; t++){
              for (var s=0; s<=7; s++){
                for(var b=0; b<=7; b++){
                  if (t+""+s+""+b!=="000"){
                    var tempData = this.getFileName(t+""+s+""+b);
                    if (tempData===name){
                      if (!recover && this.InUse(t+""+s+""+b)){
                        if (tempData.indexOf(swapFile1Chr) === tempData.indexOf(name)){
                          //scheduler finding a swap file
                          //TODO
                        }
                        else {
                          //user creating a file
                          return t+""+s+""+b;
                        }
                      }
                      else {
                      //TODO
                      //recovering file data
                      }   
                    }
                  }                  
                }
              }
            }
            return null;
        }
        public createFile(fileName:string, force:boolean){
          if (force){
            //find previous file
            var tsb:string = this.findFile(fileName, false);
            //delete its data
            this.deleteFileData(tsb);
            //update next available block if disk is full
            if (this.diskFull){
              this.setNextAvailbleTSB('data');
            }
            //return true that creation of file was successfull heh
            return true;
          }
          else if (!this.fileTFull){
            var tsb:string = this.getNextAvailbleFileTSB();
            var hexName = TSOS.Utils.str2hex(fileName);
            var newData = "";
            //pad the hexName data with 00s
            newData = hexName + new Array(65-hexName.length-this.metaData).join("0");
            //set the tsb in use with new data
            sessionStorage.setItem(tsb, '1'+"000"+newData);
            //add file name to list
            _FileNames.enqueue(fileName);

            //update next availbale file tsb
            this.setNextAvailbleTSB('file');

            return true;

          }
          else
            return false;
        }
        public writeFile(fileName:string, data:string){
          
          //convert the data to hex and split the data into 60 char chunks
          var dataArray = TSOS.Utils.str2hex(data).match(/.{1,60}/g);
          //then we find the file
          var tsbFile:string = this.findFile(fileName, false);
          //local storage of next available data tsb
          var nextTSB:string =this.getNextAvailbleDataTSB();
          //then we make the meta data point to the next available datablock
          this.setMetaData(tsbFile, nextTSB);

          //now we start writing the data to disk
          var prevTSB:string = nextTSB;
          for (var i=0; i<dataArray.length; i++){
            if (!this.diskFull){
              //and make the nextTSB the previous TSB
              prevTSB= nextTSB;
              //update the next availble data block
              this.setNextAvailbleTSB('data');
              //local storage of next available data tsb
              var nextTSB =this.getNextAvailbleDataTSB();
              //and mark that data block as in use
              this.markBlockAsUnAvail(prevTSB);
              //then we make the meta data point to the next available datablock
              this.setMetaData(prevTSB, nextTSB);            
              //and we write out the data to said block
              this.setDataBytes(prevTSB, dataArray[i]);
            }
            else // if disk full return false
              return false;
          }
          //set the last block to not point to anything
          this.setMetaData(prevTSB, "000");
          return true;

        }
        public readFile(fileName:string){
          
          var tsb = this.findFile(fileName, false);
          var contents ="";
          var nextTSB = this.getNextTSB(tsb);
          while (nextTSB!="000"){
            var hexContents = this.getDataBytes(nextTSB);
            hexContents= Utils.trimTrailingChars(hexContents, "0");
            if (hexContents%2 !==0){
              hexContents+='0';
            }
            contents+= TSOS.Utils.hex2str(hexContents);
            nextTSB = this.getNextTSB(nextTSB);
          }

          this.displayContents(contents);
          return true;
        }
        public displayContents(contents:string){
          debugger;
          if (contents.indexOf('/n')!==-1){
            var contentsArray= contents.split('/n');
            for (var i=0; i< contentsArray.length; i++){
              _StdOut.putText(contentsArray[i]);
              _StdOut.advanceLine();
            }
            TSOS.Control.setFileData(contents);
          }
          else{
            _StdOut.putText(contents);
            _StdOut.advanceLine();
            TSOS.Control.setFileData(contents);
          }
        }
        public krnDiskInUse(params){
          debugger;
          var diskAction = params[0];
          var fileName = params[1];
          var data= params[2];
          var success=false;
          DISK_IN_USE = true;
          switch(diskAction){
            case DiskAction.FullFormat:{
              success =this.fullFormatDisk();
              _FileNames= new Queue();
              _Trash = new Queue();
              break;
            }
            case DiskAction.QuickFormat:{
              success =this.quickFormatDisk();
              _Trash = _FileNames;
              _FileNames= new Queue();
              break;
            }
            case DiskAction.Create:{
              if (this.fileTFull===false)
                success =this.createFile(fileName, false);
              else{
                _StdOut.putText("File name track full, please empty trash.");
                _StdOut.advanceLine();
                success = false;
              }
              break;
            }
            case DiskAction.CreateForce:{
              success=this.createFile(fileName, false);
              break;
            }
            case DiskAction.Delete:{
              success=this.deleteFile(this.findFile(fileName, false));
              _Trash.enqueue(fileName);
              _FileNames.getAndRemove(fileName);
              break;
            }
            case DiskAction.DeleteAll:{
              //TODO
              _Trash = _FileNames;
              _FileNames = new Queue();
              break;
            }
            case DiskAction.Write:{
              
              if (this.fileTFull===false){
                if (this.findFile(fileName, false)===null){
                  //first create the file then write to it
                  this.createFile(fileName, false);
                  success=this.writeFile(fileName, data);
                }
                else{
                  //write to existing file
                  success =this.writeFile(fileName, data);
                }
              }
              if (!success){
                this.deleteFile(this.findFile(fileName, false));
                _StdOut.putText("File name track full, please empty trash.");
                _StdOut.advanceLine();
                
              }
              break;
            }
            case DiskAction.Read:{
              success= this.readFile(fileName);
              break;
            }

          }
          fileName = (fileName===undefined)? "" : fileName;
          if (success){
            _StdOut.putText(TSOS.Utils.capitaliseFirstLetter(DiskActions[diskAction]) + " " + fileName+" was successful.");
          }
          else {
            _StdOut.putText(TSOS.Utils.capitaliseFirstLetter(DiskActions[diskAction]) +" " +fileName+" failed."); 
            
          }
          _StdOut.advanceLine();
          _OsShell.putPrompt();
          DISK_IN_USE =false;
          TSOS.Control.updateFileSystemDisplay(); 
        }
    }
}
