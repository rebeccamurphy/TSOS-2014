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
        public  diskDataFull:  boolean;//data full
        private diskFileFull: boolean;//file track full
        
        constructor() {
            // Override the base method pointers.
            this.tracks   =4;
            this.sectors  =8;
            this.blocks   =8;
            this.metaData =4;
            this.dataBytes=60;
            this.diskDataFull=false;
            this.diskFileFull = false;
            super(this.krnFileSystemDriverEntry, this.krnDiskInUse);
            SWAP_FILE_START_CHAR_HEX = TSOS.Utils.str2hex(SWAP_FILE_START_CHAR);
            //todo switch instances of char to hex
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
          if ( (sessionStorage.getItem('000')===null&&!format)||format) {
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
                    // ;
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
            this.diskDataFull=false;
            this.diskFileFull=false;
            return true;
          }
          else{
            ;
            //add the file names to file name global
            for (var t=0; t<=0; t++){
              for (var s=0; s<=7;s++){
                for(var b=0; b<=7;b++){
                  if (""+t+""+s+""+b !== "000"){
                    var tempName = this.getFileName(t+""+s+""+b);
                    if(tempName!=="" && SWAP_FILE_START_CHAR !== tempName.charAt(0)
                      && this.InUse(t+""+s+""+b)){
                      //makes sure swap files are not added to the file list
                      _FileNames.enqueue(tempName);  
                      }
                    else if (tempName!=="" && SWAP_FILE_START_CHAR === tempName.charAt(0)
                      && this.InUse(t+""+s+""+b)){
                      //clear programs left on disk as if they were in memory
                      this.clearFile(tempName);
                    }
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
        public eraseBlock(tsb:string){
          var blankBlock =new Array(this.dataBytes+this.metaData+1).join('0');
          sessionStorage.setItem(tsb, blankBlock);
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

            var tmin = 0;
            var smin = 0;
            var bmin = 0;
          }
          else if (type==="data"){
            var startTSB = this.getNextAvailbleDataTSB();
            var tmax = 3;
            var smax = 7;
            var bmax = 7;

            var tmin = 1;
            var smin = 0;
            var bmin = 0;
          }
          //parse the current availbe tsb
          var currt = parseInt(startTSB.charAt(0));
          var currs = parseInt(startTSB.charAt(1));
          var currb = parseInt(startTSB.charAt(2));
          //first try to find the availbe tsb by going down in file system
          for (var t = tmin;t<tmax+1; t++){
              for (var s = smin;s<smax+1;s++){
                for(var b= bmin;b<bmax+1;b++){
                  if (""+t+""+s+""+b !== "000"){
                    if (!this.InUse(t+""+s+""+b)){
                      var newMBRData = this.getDataBytes('000');
                      var newTSB = TSOS.Utils.str2hex(t+""+s+""+b);
                      if (type === 'file'){
                        newMBRData = newTSB+newMBRData.substring(6);
                      }
                      else if(type==='data'){
                        newMBRData = newMBRData.substring(0,6) + newTSB + newMBRData.substring(12);
                      }
                      sessionStorage.setItem("000", this.getMetaData('000')+ newMBRData);
                      this.diskDataFull =false;
                      return; 
                  }                  
                 } 
                } 
              }
            }
            
            var newMBRData = this.getDataBytes('000');
            var newTSB = TSOS.Utils.str2hex('000');
            if (type === 'file'){
              newMBRData = newTSB+newMBRData.substring(6);
            }
            else if(type==='data'){
              newMBRData = newMBRData.substring(0,6) + newTSB + newMBRData.substring(12);
            }
            sessionStorage.setItem("000", this.getMetaData('000')+ newMBRData);
            if (type ==='data'){
              ;
              //if neither prove fruitful make the disk as full
              this.diskDataFull = true;
            }
            else if (type==='file'){
              ;
              //fileNames full
              this.diskFileFull=true;
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
        public recoverFile(tsb:string){
           ;
          var tempTSB=this.getNextTSB(tsb);
          //mark the title as in use
          this.markBlockAsUnAvail(tsb);
          while (tempTSB!=="000"){
            //then do all the file data
            this.markBlockAsUnAvail(tempTSB);
            tempTSB = this.getNextTSB(tempTSB);
          }
          return true;
        }
        public clearFile(fileName:string){
          //clears file name and all data from file system
          ;
          var tsb =this.findFile(fileName, false);
          var tempTSB1 = tsb;
          var tempTSB2 = tempTSB1;
          while (tempTSB1!=="000"){
            //previous block
            tempTSB2 = tempTSB1;
            //get next block
            tempTSB1 = this.getNextTSB(tempTSB2);
            //erase previous block
            this.eraseBlock(tempTSB2);
          }

          //set find next available data block
          this.setNextAvailbleTSB('data');
          this.setNextAvailbleTSB('file');
          return true;

        }
        public findFile(name:string, recover:boolean){
          ;
            for (var t=0; t<=0; t++){
              for (var s=0; s<=7; s++){
                for(var b=0; b<=7; b++){
                  if (t+""+s+""+b!=="000"){
                    var tempData = this.getFileName(t+""+s+""+b);
                    if (tempData===name){
                      if (!recover && this.InUse(t+""+s+""+b)){
                        if (SWAP_FILE_START_CHAR === tempData.charAt(0)){
                          //scheduler finding a swap file
                          return t+""+s+""+b;
                        }
                        else {
                          //user creating a file
                          return t+""+s+""+b;
                        }
                      }
                      else if (recover){
                      //TODO
                      //recovering file data
                        return t+""+s+""+b;
                      } 
                      else {
                        //deleting file
                        return t+""+s+""+b;
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
            if (this.diskDataFull){
              this.setNextAvailbleTSB('data');
            }
            //return true that creation of file was successfull heh
            return true;
          }
          else if (!this.diskFileFull){
            var tsb:string = this.getNextAvailbleFileTSB();
            var hexName = TSOS.Utils.str2hex(fileName);
            var newData = "";
            //pad the hexName data with 00s
            newData = hexName + new Array(65-hexName.length-this.metaData).join("0");
            //set the tsb in use with new data
            sessionStorage.setItem(tsb, '1'+"000"+newData);
            //update next availbale file tsb
            this.setNextAvailbleTSB('file');

            return true;

          }
          else
            return false;
        }
        public writeFile(fileName:string, data:string, append:boolean){
           
          //convert the data to hex and split the data into 60 char chunks
          if (fileName.charAt(0)!==SWAP_FILE_START_CHAR){
            var dataArray = TSOS.Utils.str2hex(data).match(/.{1,60}/g);
          }
          else 
            var dataArray = data.match(/.{1,60}/g);
          //then we find the file
          var tsbFile:string = this.findFile(fileName, false);
          
          if (append){
            //if where appending we need to start at the last bit of data associated with the file
            var tempTSB =tsbFile;
            while (tempTSB!="000"){
              tsbFile= tempTSB;
              tempTSB= this.getNextTSB(tempTSB);
            }
            //see if there's room to add more data to the last 
            var lastBlock = this.getDataBytes(tsbFile);
            //trim trailing zeros
            lastBlock = TSOS.Utils.trimTrailingChars(lastBlock, '0');
            //make sure didn't remove 0 from hex char
            lastBlock = (lastBlock.length%2===0)? lastBlock: lastBlock+'0';
            var writtenIndex =0; 
            for (var i=0; i<data.length; i++){
              if (lastBlock.length <60){
                lastBlock+= TSOS.Utils.str2hex(data.charAt(i));
                writtenIndex++;
              }
              else 
                break;
              if (i===data.length-1){
                //set the new data
                this.setDataBytes(tsbFile, lastBlock);
                //return true if the data is done being written
                return true;
              }
            }
            //set the new data
            this.setDataBytes(tsbFile, lastBlock);
            //remove already written data
            data = data.substring(writtenIndex);  
            dataArray = data.match(/.{1,60}/g);
          }
          //local storage of next available data tsb
          var nextTSB:string =this.getNextAvailbleDataTSB();
          //then we make the meta data point to the next available datablock
          this.setMetaData(tsbFile, nextTSB);

          //now we start writing the data to disk
          var prevTSB:string = nextTSB;
          for (var i=0; i<dataArray.length; i++){
            if (!this.diskDataFull){
              //and make the nextTSB the previous TSB
              prevTSB= nextTSB;
              //and mark that data block as in use
              this.markBlockAsUnAvail(prevTSB);
              //update the next availble data block
              this.setNextAvailbleTSB('data');
              //local storage of next available data tsb
              var nextTSB =this.getNextAvailbleDataTSB();
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
          //set find next available data block
          //this.setNextAvailbleTSB('data');
          return true;
        }
        public readFile(fileName:string, swap:boolean):any{
          
          var tsb = this.findFile(fileName, false);
          var contents ="";
          var nextTSB = this.getNextTSB(tsb);
          var swapSudo = fileName.charAt(0)===SWAP_FILE_START_CHAR;
          while (nextTSB!="000"){
            if (swap ||swapSudo){
              //contents already in hex
              contents += this.getDataBytes(nextTSB);
            }
            else{
              var hexContents = this.getDataBytes(nextTSB);
              hexContents= Utils.trimTrailingChars(hexContents, "0");
              if (hexContents%2 !==0){
                hexContents+='0';
              }
              contents+= TSOS.Utils.hex2str(hexContents);
              
            }
             
            nextTSB = this.getNextTSB(nextTSB);
          }
          if (swap){
            var contentsArr = contents.match(/.{1,2}/g);
            //need to slice off extra program 0s
            _ExecutingProgram= contentsArr.slice(0, _ProgramSize);
          }
        
          else
            this.displayContents(contents);
          return true;
        }
        public displayContents(contents:string){
          _StdOut.advanceLine();
          if (contents.indexOf('/n')!==-1){
            var contentsArray= contents.split('/n');
            for (var i=0; i< contentsArray.length; i++){
              _StdOut.putText(contentsArray[i]);
              _StdOut.advanceLine();
            }
          }
          else{
            _StdOut.putText(contents);
          }
          _StdOut.advanceLine();
          TSOS.Control.setFileData(contents);
        }
        public krnDiskInUse(params){
          
          var diskAction = params[0];
          var fileName = params[1];
          var data= params[2];
          var success=false;
          DISK_IN_USE = true;
          fileName = (fileName===undefined)? "" : fileName;
          var notSwap = fileName.charAt(0)!== SWAP_FILE_START_CHAR;
          
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

              if (this.diskFileFull===false)
                success =this.createFile(fileName, false);
              else{
                _StdOut.putText("File name track full, please empty trash.");
                _StdOut.advanceLine();
                success = false;
              }
              if (success && notSwap){
                //add file name to list
                _FileNames.enqueue(fileName);

              }
              break;
            }
            case DiskAction.CreateForce:{
              success=this.createFile(fileName, false);
              if (success && notSwap){
                //add file name to list
                _FileNames.enqueue(fileName);

              }
              break;
            }
            case DiskAction.Delete:{
              success=this.deleteFile(this.findFile(fileName, false));
              if (success && notSwap){
                _Trash.enqueue(fileName);
                _FileNames.getAndRemove(fileName);
              }
              break;
            }
            case DiskAction.DeleteAll:{
              while(!_FileNames.isEmpty()){
                var tempFile = _FileNames.dequeue();
                success =this.deleteFile(this.findFile(tempFile, false));
                if (success&&notSwap){
                  //if the deleting of the file was successful add it to the trash
                  _Trash.enqueue(tempFile);
                }
                else{
                  //deleting all files has failed on one file and we just want to return. 
                  break;
                }
              }            
              break;
            }
            case DiskAction.Recover:{
              success = this.recoverFile(this.findFile(fileName, true));
              if (success&&notSwap){
                //if success move the file from the trash to file name
                _FileNames.enqueue(_Trash.getAndRemove(fileName));
                
              }
              break;
            }
            case DiskAction.RecoverAll:{
              while(!_Trash.isEmpty()){
                var tempFile = _Trash.dequeue();
                success =this.recoverFile(this.findFile(tempFile, true));
                if (success&&notSwap){
                  //if the recovering of the file was successful add it to the trash
                  _FileNames.enqueue(tempFile);
                }
                else{
                  //recovering all files has failed on one file and we just want to return. 
                  break;
                }
              }
              break;
            }
            case DiskAction.Write:{
              ;
              if (this.diskFileFull===false){
                if (this.findFile(fileName, false)===null){
                  //first create the file then write to it
                  this.createFile(fileName, false);
                  success=this.writeFile(fileName, data, false);
                }
                else{
                  //write to existing file
                  this.clearFile(fileName);
                  this.createFile(fileName, false);
                  success =this.writeFile(fileName, data, false);
                  var overwrite = true;
                }
              }
              if (!success){
                _StdOut.advanceLine();
                this.clearFile(fileName);
                _StdOut.putText("File name track full, please empty trash.");
              }
              else if (notSwap&&!overwrite){
                //add file name to list
                _FileNames.enqueue(fileName);
              }
              break;
            }
            case DiskAction.AppendWrite:{
              success=this.writeFile(fileName, data, true);
              if (!success){
                _StdOut.advanceLine();
                this.clearFile(fileName);
                _StdOut.putText("File name track full, please empty trash.");
              }
              break;
            }
            case DiskAction.Read:{
              success= this.readFile(fileName,false);

              break;
            }
            case DiskAction.ReadSwap:{
              success = this.readFile(fileName, true);
              //also delete the program from disk
              success = this.clearFile(fileName);

              if (success){
                //enqueue interrupt for kernal to finish loading the program
                 //last enqueue interrupt to load program into memory after it has been read
                _KernelInterruptQueue.enqueue(new Interrupt(SWAPFILE_IRQ));
              }
              break;
            }
            case DiskAction.EmptyTrash:{
              while(!_Trash.isEmpty()){
                var tempFile = _Trash.dequeue();
                success =this.clearFile(tempFile);
                if (!success){
                  //emptying trash has failed 
                  break;
                }
              }            
              break;

            }

          }
          
          var msg = (success) ? " was successful.": " failed.";
          if (notSwap){
            //hide creation of swap files from user
            _StdOut.advanceLine();
            _StdOut.putText(TSOS.Utils.capitaliseFirstLetter(DiskActions[diskAction]) + " " + fileName+msg);  
            _StdOut.advanceLine();
            _OsShell.putPrompt();
          }
          
          DISK_IN_USE =false;
          TSOS.Control.updateFileSystemDisplay(); 
        }
    }
}
