///<reference path="deviceDriver.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/* ----------------------------------
DeviceDriverFileSystem.ts
Requires deviceDriver.ts
The Kernel File System Device Driver.
---------------------------------- */
var TSOS;
(function (TSOS) {
    // Extends DeviceDriver
    var DeviceDriverFileSystem = (function (_super) {
        __extends(DeviceDriverFileSystem, _super);
        function DeviceDriverFileSystem() {
            // Override the base method pointers.
            this.tracks = 4;
            this.sectors = 8;
            this.blocks = 8;
            this.metaData = 4;
            this.dataBits = 120;
            this.diskDataFull = false;
            this.diskFileFull = false;
            _super.call(this, this.krnFileSystemDriverEntry, this.krnDiskInUse);
            SWAP_FILE_START_CHAR_HEX = TSOS.Utils.str2hex(SWAP_FILE_START_CHAR);
            //todo switch instances of char to hex
            //001-077 is for file names
            //100-377 is for data
            //swap files begin with .
        }
        DeviceDriverFileSystem.prototype.krnFileSystemDriverEntry = function () {
            _FileNames = new TSOS.Queue();
            _Trash = new TSOS.Queue();

            // Initialization routine for this, the kernel-mode Keyboard Device Driver.
            this.status = "File System Loaded";

            // More?
            this.init(false);
        };

        DeviceDriverFileSystem.prototype.init = function (format) {
            if ((sessionStorage.getItem('000') === null && !format) || format) {
                debugger;

                //set the master boot record
                //first 3 spots of data is next available file name
                //next 3 spots are for the next available datablock
                var hexDefaultMBR = TSOS.Utils.str2hex("001100");
                sessionStorage.setItem("000", "1000" + hexDefaultMBR + new Array(120 - hexDefaultMBR.length + 1).join('0'));
                for (var t = 0; t < this.tracks; t++) {
                    for (var s = 0; s < this.sectors; s++) {
                        for (var b = 0; b < this.blocks; b++) {
                            if ("" + t + "" + s + "" + b !== "000") {
                                try  {
                                    // ;
                                    var blankBlock = new Array(this.dataBits + this.metaData + 1).join('0');
                                    sessionStorage.setItem(t + "" + s + "" + b, blankBlock);
                                } catch (e) {
                                    alert('Quota exceeded!');
                                    return false;
                                }
                            }
                        }
                    }
                }
                this.diskDataFull = false;
                this.diskFileFull = false;
                return true;
            } else {
                for (var t = 0; t <= 0; t++) {
                    for (var s = 0; s <= 7; s++) {
                        for (var b = 0; b <= 7; b++) {
                            if ("" + t + "" + s + "" + b !== "000") {
                                var tempName = this.getFileName(t + "" + s + "" + b);
                                if (tempName !== "" && SWAP_FILE_START_CHAR !== tempName.charAt(0) && this.InUse(t + "" + s + "" + b)) {
                                    //makes sure swap files are not added to the file list
                                    _FileNames.enqueue(tempName);
                                } else if (tempName !== "" && SWAP_FILE_START_CHAR !== tempName.charAt(0)) {
                                    //added deleted files to trash
                                    _Trash.enqueue(tempName);
                                } else if (tempName !== "" && SWAP_FILE_START_CHAR === tempName.charAt(0) && this.InUse(t + "" + s + "" + b)) {
                                    //clear programs left on disk as if they were in memory
                                    this.clearFile(tempName);
                                }
                            }
                        }
                    }
                }
            }
        };

        DeviceDriverFileSystem.prototype.getFileName = function (tsb) {
            var temp = this.getDataBytes(tsb);

            //remove trailing 0s
            temp = temp.replace(/0+$/g, "");
            if (temp.length % 2 !== 0)
                temp += '0'; //accidentally removed an important hex 0.
            if (temp === "")
                return "";
            return TSOS.Utils.hex2str(temp);
        };

        DeviceDriverFileSystem.prototype.getBlock = function (tsb) {
            return sessionStorage.getItem(tsb);
        };
        DeviceDriverFileSystem.prototype.eraseBlock = function (tsb) {
            var blankBlock = new Array(this.dataBits + this.metaData + 1).join('0');
            sessionStorage.setItem(tsb, blankBlock);
        };

        DeviceDriverFileSystem.prototype.getMetaData = function (tsb) {
            return this.getBlock(tsb).substring(0, this.metaData);
        };

        DeviceDriverFileSystem.prototype.setMetaData = function (tsb, metaData) {
            if (this.InUse(tsb)) {
                sessionStorage.setItem(tsb, "1" + metaData + this.getDataBytes(tsb));
            } else {
                sessionStorage.setItem(tsb, "0" + metaData + this.getDataBytes(tsb));
            }
        };

        DeviceDriverFileSystem.prototype.InUse = function (tsb) {
            return this.getMetaData(tsb).charAt(0) === '1';
        };

        DeviceDriverFileSystem.prototype.getNextTSB = function (tsb) {
            return this.getMetaData(tsb).substring(1, this.metaData);
        };

        DeviceDriverFileSystem.prototype.getDataBytes = function (tsb) {
            return this.getBlock(tsb).substring(this.metaData, this.metaData + this.dataBits);
        };
        DeviceDriverFileSystem.prototype.setDataBytes = function (tsb, blockData) {
            sessionStorage.setItem(tsb, this.getMetaData(tsb) + blockData + new Array(this.dataBits - blockData.length + 1).join('0'));
        };

        DeviceDriverFileSystem.prototype.getNextAvailbleFileTSB = function () {
            return TSOS.Utils.hex2str(this.getDataBytes("000").substring(0, 6));
        };
        DeviceDriverFileSystem.prototype.getNextAvailbleDataTSB = function () {
            return TSOS.Utils.hex2str(this.getDataBytes("000").substring(6, 12));
        };

        DeviceDriverFileSystem.prototype.markBlockAsAvail = function (tsb) {
            sessionStorage.setItem(tsb, "0" + sessionStorage.getItem(tsb).substring(1));
        };
        DeviceDriverFileSystem.prototype.markBlockAsUnAvail = function (tsb) {
            sessionStorage.setItem(tsb, "1" + sessionStorage.getItem(tsb).substring(1));
        };
        DeviceDriverFileSystem.prototype.setNextAvailbleTSB = function (type) {
            if (type === "file") {
                var startTSB = this.getNextAvailbleFileTSB();
                var tmax = 0;
                var smax = 7;
                var bmax = 7;

                var tmin = 0;
                var smin = 0;
                var bmin = 0;
            } else if (type === "data") {
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

            for (var t = tmin; t < tmax + 1; t++) {
                for (var s = smin; s < smax + 1; s++) {
                    for (var b = bmin; b < bmax + 1; b++) {
                        if ("" + t + "" + s + "" + b !== "000") {
                            if (!this.InUse(t + "" + s + "" + b)) {
                                var newMBRData = this.getDataBytes('000');
                                var newTSB = TSOS.Utils.str2hex(t + "" + s + "" + b);
                                if (type === 'file') {
                                    newMBRData = newTSB + newMBRData.substring(6);
                                } else if (type === 'data') {
                                    newMBRData = newMBRData.substring(0, 6) + newTSB + newMBRData.substring(12);
                                }
                                sessionStorage.setItem("000", this.getMetaData('000') + newMBRData);
                                this.diskDataFull = false;
                                this.diskFileFull = false;
                                return;
                            }
                        }
                    }
                }
            }

            var newMBRData = this.getDataBytes('000');
            var newTSB = TSOS.Utils.str2hex('000');
            if (type === 'file') {
                newMBRData = newTSB + newMBRData.substring(6);
            } else if (type === 'data') {
                newMBRData = newMBRData.substring(0, 6) + newTSB + newMBRData.substring(12);
            }
            sessionStorage.setItem("000", this.getMetaData('000') + newMBRData);
            if (type === 'data') {
                //if neither prove fruitful make the disk as full
                this.diskDataFull = true;
            } else if (type === 'file') {
                //fileNames full
                this.diskFileFull = true;
            }
        };
        DeviceDriverFileSystem.prototype.fullFormatDisk = function () {
            return this.init(true);
        };
        DeviceDriverFileSystem.prototype.quickFormatDisk = function () {
            for (var t = 0; t < this.tracks; t++) {
                for (var s = 0; s < this.sectors; s++) {
                    for (var b = 0; b < this.blocks; b++) {
                        if ("" + t + "" + b + "" + s !== "000") {
                            try  {
                                //set all items except the master boot record as not in use
                                this.markBlockAsAvail(t + "" + s + "" + b);
                            } catch (e) {
                                alert('Quota exceeded!');
                                return false;
                            }
                        }
                    }
                }
            }
            return true;
        };
        DeviceDriverFileSystem.prototype.deleteFile = function (tsb) {
            //sets file name and all data as available
            var tempTSB = tsb;

            //delete the file name
            this.markBlockAsAvail(tempTSB);

            //delete the data
            this.deleteFileData(tempTSB);

            //remove the last block associate with that file
            this.markBlockAsAvail(tempTSB);
            return true;
        };
        DeviceDriverFileSystem.prototype.deleteFileData = function (tsb) {
            //skip deleting the file Unreadname
            var tempTSB = this.getNextTSB(tsb);
            while (tempTSB !== "000") {
                this.markBlockAsAvail(tempTSB);
                tempTSB = this.getNextTSB(tempTSB);
            }
        };
        DeviceDriverFileSystem.prototype.recoverFile = function (tsb) {
            ;
            var tempTSB = this.getNextTSB(tsb);

            //mark the title as in use
            this.markBlockAsUnAvail(tsb);
            while (tempTSB !== "000") {
                //then do all the file data
                this.markBlockAsUnAvail(tempTSB);
                tempTSB = this.getNextTSB(tempTSB);
            }
            return true;
        };
        DeviceDriverFileSystem.prototype.clearFile = function (fileName) {
            ;
            var tsb = this.findFile(fileName, false);
            var tempTSB1 = tsb;
            var tempTSB2 = tempTSB1;
            while (tempTSB1 !== "000") {
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
        };
        DeviceDriverFileSystem.prototype.findFile = function (name, recover) {
            ;
            for (var t = 0; t <= 0; t++) {
                for (var s = 0; s <= 7; s++) {
                    for (var b = 0; b <= 7; b++) {
                        if (t + "" + s + "" + b !== "000") {
                            var tempData = this.getFileName(t + "" + s + "" + b);
                            if (tempData === name) {
                                if (!recover && this.InUse(t + "" + s + "" + b)) {
                                    if (SWAP_FILE_START_CHAR === tempData.charAt(0)) {
                                        //scheduler finding a swap file
                                        return t + "" + s + "" + b;
                                    } else {
                                        //user creating a file
                                        return t + "" + s + "" + b;
                                    }
                                } else if (recover) {
                                    //TODO
                                    //recovering file data
                                    return t + "" + s + "" + b;
                                } else {
                                    //deleting file
                                    return t + "" + s + "" + b;
                                }
                            }
                        }
                    }
                }
            }
            return null;
        };
        DeviceDriverFileSystem.prototype.createFile = function (fileName, force) {
            if (force) {
                //find previous file
                var tsb = this.findFile(fileName, false);

                //delete its data
                this.deleteFileData(tsb);

                //update next available block if disk is full
                if (this.diskDataFull) {
                    this.setNextAvailbleTSB('data');
                }

                //return true that creation of file was successfull heh
                return true;
            } else if (!this.diskFileFull) {
                var tsb = this.getNextAvailbleFileTSB();
                var hexName = TSOS.Utils.str2hex(fileName);
                var newData = "";

                //pad the hexName data with 00s
                newData = hexName + new Array(this.dataBits + 1 - hexName.length).join("0");

                //set the tsb in use with new data
                sessionStorage.setItem(tsb, '1' + "000" + newData);

                //update next availbale file tsb
                this.setNextAvailbleTSB('file');

                return true;
            } else
                return false;
        };
        DeviceDriverFileSystem.prototype.writeFile = function (fileName, data, append) {
            debugger;
            var bits = this.dataBits;

            //convert the data to hex and split the data into databits char chunks
            if (fileName.charAt(0) !== SWAP_FILE_START_CHAR) {
                var dataArray = TSOS.Utils.splitString(TSOS.Utils.str2hex(data), this.dataBits);
            } else
                var dataArray = TSOS.Utils.splitString(data, this.dataBits);

            //then we find the file
            var tsbFile = this.findFile(fileName, false);

            if (append) {
                //if where appending we need to start at the last bit of data associated with the file
                var tempTSB = tsbFile;
                while (tempTSB != "000") {
                    tsbFile = tempTSB;
                    tempTSB = this.getNextTSB(tempTSB);
                }

                //see if there's room to add more data to the last
                var lastBlock = this.getDataBytes(tsbFile);

                //trim trailing zeros
                lastBlock = TSOS.Utils.trimTrailingChars(lastBlock, '0');

                //make sure didn't remove 0 from hex char
                lastBlock = (lastBlock.length % 2 === 0) ? lastBlock : lastBlock + '0';
                var writtenIndex = 0;
                for (var i = 0; i < data.length; i++) {
                    if (lastBlock.length < this.dataBits) {
                        lastBlock += TSOS.Utils.str2hex(data.charAt(i));
                        writtenIndex++;
                    } else
                        break;
                    if (i === data.length - 1) {
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
                dataArray = TSOS.Utils.splitString(data, this.dataBits);
            }

            //local storage of next available data tsb
            var nextTSB = this.getNextAvailbleDataTSB();

            //then we make the meta data point to the next available datablock
            this.setMetaData(tsbFile, nextTSB);

            //now we start writing the data to disk
            var prevTSB = nextTSB;
            for (var i = 0; i < dataArray.length; i++) {
                if (!this.diskDataFull) {
                    //and make the nextTSB the previous TSB
                    prevTSB = nextTSB;

                    //and mark that data block as in use
                    this.markBlockAsUnAvail(prevTSB);

                    //update the next availble data block
                    this.setNextAvailbleTSB('data');

                    //local storage of next available data tsb
                    var nextTSB = this.getNextAvailbleDataTSB();

                    //then we make the meta data point to the next available datablock
                    this.setMetaData(prevTSB, nextTSB);

                    //and we write out the data to said block
                    this.setDataBytes(prevTSB, dataArray[i]);
                } else
                    return false;
            }

            //set the last block to not point to anything
            this.setMetaData(prevTSB, "000");

            //set find next available data block
            //this.setNextAvailbleTSB('data');
            return true;
        };
        DeviceDriverFileSystem.prototype.readFile = function (fileName, swap) {
            debugger;
            var tsb = this.findFile(fileName, false);
            var contents = "";
            var nextTSB = this.getNextTSB(tsb);
            var swapSudo = fileName.charAt(0) === SWAP_FILE_START_CHAR;
            while (nextTSB != "000") {
                if (swap || swapSudo) {
                    //contents already in hex
                    contents += this.getDataBytes(nextTSB);
                } else {
                    var hexContents = this.getDataBytes(nextTSB);
                    hexContents = TSOS.Utils.trimTrailingChars(hexContents, "0");
                    if (hexContents % 2 !== 0) {
                        hexContents += '0';
                    }
                    contents += TSOS.Utils.hex2str(hexContents);
                }

                nextTSB = this.getNextTSB(nextTSB);
            }
            if (swap) {
                var contentsArr = contents.match(/.{1,2}/g);

                //need to slice off extra program 0s
                _ExecutingProgram = contentsArr.slice(0, _ProgramSize);
            } else
                this.displayContents(contents);
            return true;
        };
        DeviceDriverFileSystem.prototype.displayContents = function (contents) {
            _StdOut.advanceLine();
            if (contents.indexOf('/n') !== -1) {
                var contentsArray = contents.split('/n');
                for (var i = 0; i < contentsArray.length; i++) {
                    _StdOut.putText(contentsArray[i]);
                    _StdOut.advanceLine();
                }
            } else {
                _StdOut.putText(contents);
            }
            _StdOut.advanceLine();
            TSOS.Control.setFileData(contents);
        };
        DeviceDriverFileSystem.prototype.krnDiskInUse = function (params) {
            var diskAction = params[0];
            var fileName = params[1];
            var data = params[2];
            var success = false;
            fileName = (fileName === undefined) ? "" : fileName;
            var notSwap = fileName.charAt(0) !== SWAP_FILE_START_CHAR;

            switch (diskAction) {
                case 9 /* FullFormat */: {
                    success = this.fullFormatDisk();
                    if (success) {
                        _FileNames = new TSOS.Queue();
                        _Trash = new TSOS.Queue();
                        if (_CPU.isExecuting) {
                            //clear programs on disk
                            _Scheduler.clearDisk();
                        }
                    }
                    break;
                }
                case 10 /* QuickFormat */: {
                    success = this.quickFormatDisk();
                    if (success) {
                        _Trash = _FileNames;
                        _FileNames = new TSOS.Queue();
                        if (_CPU.isExecuting) {
                            //clear programs on disk
                            _Scheduler.clearDisk();
                        }
                    }
                    break;
                }
                case 0 /* Create */: {
                    success = this.createFile(fileName, false);
                    if (!success) {
                        _StdOut.putText("File name track full, please empty trash.");
                        _StdOut.advanceLine();
                        success = false;
                    } else if (success && notSwap) {
                        //add file name to list
                        _FileNames.enqueue(fileName);
                    }
                    break;
                }
                case 1 /* CreateForce */: {
                    success = this.createFile(fileName, false);
                    if (!success) {
                        _StdOut.putText("File name track full, please empty trash.");
                        _StdOut.advanceLine();
                        success = false;
                    } else if (success && notSwap) {
                        //add file name to list
                        _FileNames.enqueue(fileName);
                    }
                    break;
                }
                case 6 /* Delete */: {
                    success = this.deleteFile(this.findFile(fileName, false));
                    if (success && notSwap) {
                        _Trash.enqueue(fileName);
                        _FileNames.getAndRemove(fileName);
                    }
                    break;
                }
                case 7 /* DeleteForce */: {
                    success = this.clearFile(fileName);
                    if (success && notSwap) {
                        _FileNames.getAndRemove(fileName);
                    }
                    break;
                }
                case 8 /* DeleteAll */: {
                    while (!_FileNames.isEmpty()) {
                        var tempFile = _FileNames.dequeue();
                        success = this.deleteFile(this.findFile(tempFile, false));
                        if (success && notSwap) {
                            //if the deleting of the file was successful add it to the trash
                            _Trash.enqueue(tempFile);
                        } else {
                            break;
                        }
                    }
                    break;
                }
                case 12 /* Recover */: {
                    success = this.recoverFile(this.findFile(fileName, true));
                    if (success && notSwap) {
                        //if success move the file from the trash to file name
                        _FileNames.enqueue(_Trash.getAndRemove(fileName));
                    }
                    break;
                }
                case 13 /* RecoverAll */: {
                    while (!_Trash.isEmpty()) {
                        var tempFile = _Trash.dequeue();
                        success = this.recoverFile(this.findFile(tempFile, true));
                        if (success && notSwap) {
                            //if the recovering of the file was successful add it to the trash
                            _FileNames.enqueue(tempFile);
                        } else {
                            break;
                        }
                    }
                    break;
                }
                case 4 /* Write */: {
                    if (this.diskFileFull === false) {
                        if (this.findFile(fileName, false) === null) {
                            //first create the file then write to it
                            this.createFile(fileName, false);
                            success = this.writeFile(fileName, data, false);
                            if (!success) {
                                _StdOut.advanceLine();
                                this.clearFile(fileName);
                                _StdOut.putText("File name track full, please empty trash or delete files.");
                                break;
                            }
                        } else {
                            //write to existing file
                            this.clearFile(fileName);
                            this.createFile(fileName, false);
                            success = this.writeFile(fileName, data, false);
                            if (!success) {
                                _StdOut.advanceLine();
                                this.clearFile(fileName);
                                _StdOut.putText("File name track full, please empty trash or delete files.");
                                var overwrite = true;
                                break;
                            }
                        }
                    }
                    if (!success) {
                        _StdOut.advanceLine();
                        this.clearFile(fileName);
                        _StdOut.putText("File data space full, please empty trash or delete files.");
                    } else if (notSwap && !overwrite) {
                        //add file name to list
                        _FileNames.enqueue(fileName);
                    }
                    break;
                }
                case 5 /* AppendWrite */: {
                    success = this.writeFile(fileName, data, true);
                    if (!success) {
                        _StdOut.advanceLine();
                        this.clearFile(fileName);
                        _StdOut.putText("File data space full, please empty trash or delete files.");
                    }
                    break;
                }
                case 2 /* Read */: {
                    success = this.readFile(fileName, false);

                    break;
                }
                case 3 /* ReadSwap */: {
                    success = this.readFile(fileName, true);

                    //also delete the program from disk
                    success = this.clearFile(fileName);

                    if (success) {
                        //enqueue interrupt for kernal to finish loading the program
                        //last enqueue interrupt to load program into memory after it has been read
                        _KernelInterruptQueue.enqueue(new TSOS.Interrupt(SWAPFILE_IRQ));
                    }
                    break;
                }
                case 11 /* EmptyTrash */: {
                    while (!_Trash.isEmpty()) {
                        var tempFile = _Trash.dequeue();
                        success = this.clearFile(tempFile);
                        if (!success) {
                            break;
                        }
                    }
                    break;
                }
            }

            var msg = (success) ? " was successful." : " failed.";
            if (notSwap) {
                //hide creation of swap files from user
                _StdOut.advanceLine();
                _StdOut.putText(TSOS.Utils.capitaliseFirstLetter(DiskActions[diskAction]) + " " + fileName + msg);
                _StdOut.advanceLine();
                _OsShell.putPrompt();
            }

            TSOS.Control.updateFileSystemDisplay();
        };
        return DeviceDriverFileSystem;
    })(TSOS.DeviceDriver);
    TSOS.DeviceDriverFileSystem = DeviceDriverFileSystem;
})(TSOS || (TSOS = {}));
