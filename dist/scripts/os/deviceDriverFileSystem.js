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
            this.dataBytes = 60;
            this.diskDataFull = false;
            this.diskFileFull = false;
            _super.call(this, this.krnFileSystemDriverEntry, this.krnDiskInUse);
            SWAP_FILE_START_CHAR = TSOS.Utils.str2hex('.');
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
            if ((sessionStorage.length === 0 && !format) || format) {
                //set the master boot record
                //first 3 spots of data is next available file name
                //next 3 spots are for the next available datablock
                sessionStorage.setItem("000", "1---" + TSOS.Utils.str2hex("001100") + new Array(54).join('0'));
                for (var t = 0; t < this.tracks; t++) {
                    for (var s = 0; s < this.sectors; s++) {
                        for (var b = 0; b < this.blocks; b++) {
                            if ("" + t + "" + s + "" + b !== "000") {
                                try  {
                                    //debugger;
                                    var blankBlock = new Array(this.dataBytes + this.metaData + 1).join('0');
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
                                if (tempName !== "" && tempName.indexOf(SWAP_FILE_START_CHAR) === -1 && this.InUse(t + "" + s + "" + b))
                                    //makes sure swap files are not added to the file list
                                    _FileNames.enqueue(tempName);
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
            var blankBlock = new Array(this.dataBytes + this.metaData + 1).join('0');
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
            debugger;
            return this.getMetaData(tsb).substring(1, this.metaData);
        };

        DeviceDriverFileSystem.prototype.getDataBytes = function (tsb) {
            return this.getBlock(tsb).substring(this.metaData, this.metaData + this.dataBytes);
        };
        DeviceDriverFileSystem.prototype.setDataBytes = function (tsb, blockData) {
            sessionStorage.setItem(tsb, this.getMetaData(tsb) + blockData + new Array(61 - blockData.length).join('0'));
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
            } else if (type === "data") {
                var startTSB = this.getNextAvailbleDataTSB();
                var tmax = 3;
                var smax = 7;
                var bmax = 7;
            }

            //parse the current availbe tsb
            var currt = parseInt(startTSB.charAt(0));
            var currs = parseInt(startTSB.charAt(1));
            var currb = parseInt(startTSB.charAt(2));

            for (var t = currt; t < tmax + 1; t++) {
                for (var s = currs; s < smax + 1; s++) {
                    for (var b = currb; b < bmax + 1; b++) {
                        if ("" + t + "" + s + "" + b !== "000") {
                            if (!this.InUse(t + "" + s + "" + b) && (t + "" + s + "" + b !== currt + "" + currs + "" + currb)) {
                                var newMBRData = sessionStorage.getItem("000");
                                newMBRData = newMBRData.replace(TSOS.Utils.str2hex(startTSB), TSOS.Utils.str2hex(t + "" + s + "" + b));
                                sessionStorage.setItem("000", newMBRData);
                                this.diskDataFull = false;
                                return;
                            }
                        }
                    }
                }
            }

            for (var t = 0; t < currt; t++) {
                for (var s = 0; s < currs; s++) {
                    for (var b = 0; b < currb; b++) {
                        if ("" + t + "" + s + "" + b !== "000") {
                            if (!this.InUse(t + "" + s + "" + b) && (t + "" + s + "" + b !== currt + "" + currs + "" + currb)) {
                                var newMBRData = sessionStorage.getItem("000");
                                newMBRData = newMBRData.replace(TSOS.Utils.str2hex(startTSB), TSOS.Utils.str2hex(t + "" + s + "" + b));
                                sessionStorage.setItem("000", newMBRData);
                                this.diskDataFull = false;
                                return;
                            }
                        }
                    }
                }
            }
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
        DeviceDriverFileSystem.prototype.clearFile = function (tsb) {
            //clears file name and all data from file system
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

            return true;
        };
        DeviceDriverFileSystem.prototype.findFile = function (name, recover) {
            debugger;
            for (var t = 0; t <= 0; t++) {
                for (var s = 0; s <= 7; s++) {
                    for (var b = 0; b <= 7; b++) {
                        if (t + "" + s + "" + b !== "000") {
                            var tempData = this.getFileName(t + "" + s + "" + b);
                            if (tempData === name) {
                                if (!recover && this.InUse(t + "" + s + "" + b)) {
                                    if (tempData.indexOf(SWAP_FILE_START_CHAR) === tempData.indexOf(name)) {
                                        //scheduler finding a swap file
                                        //TODO
                                    } else {
                                        //user creating a file
                                        return t + "" + s + "" + b;
                                    }
                                } else if (recover) {
                                    //TODO
                                    //recovering file data
                                    //  return t+""+s+""+b;
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
                newData = hexName + new Array(65 - hexName.length - this.metaData).join("0");

                //set the tsb in use with new data
                sessionStorage.setItem(tsb, '1' + "000" + newData);

                //update next availbale file tsb
                this.setNextAvailbleTSB('file');

                return true;
            } else
                return false;
        };
        DeviceDriverFileSystem.prototype.writeFile = function (fileName, data, append) {
            //convert the data to hex and split the data into 60 char chunks
            var dataArray = TSOS.Utils.str2hex(data).match(/.{1,60}/g);

            //then we find the file
            var tsbFile = this.findFile(fileName, false);

            if (append) {
                //if where appending we need to start at the last bit of data associated with the file
                var tempTSB = tsbFile;
                while (tempTSB != "000") {
                    tsbFile = tempTSB;
                    tempTSB = this.getNextTSB(tempTSB);
                }
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

                    //update the next availble data block
                    this.setNextAvailbleTSB('data');

                    //local storage of next available data tsb
                    var nextTSB = this.getNextAvailbleDataTSB();

                    //and mark that data block as in use
                    this.markBlockAsUnAvail(prevTSB);

                    //then we make the meta data point to the next available datablock
                    this.setMetaData(prevTSB, nextTSB);

                    //and we write out the data to said block
                    this.setDataBytes(prevTSB, dataArray[i]);
                } else
                    return false;
            }

            //set the last block to not point to anything
            this.setMetaData(prevTSB, "000");
            return true;
        };
        DeviceDriverFileSystem.prototype.readFile = function (fileName) {
            var tsb = this.findFile(fileName, false);
            var contents = "";
            var nextTSB = this.getNextTSB(tsb);
            while (nextTSB != "000") {
                var hexContents = this.getDataBytes(nextTSB);
                hexContents = TSOS.Utils.trimTrailingChars(hexContents, "0");
                if (hexContents % 2 !== 0) {
                    hexContents += '0';
                }
                contents += TSOS.Utils.hex2str(hexContents);
                nextTSB = this.getNextTSB(nextTSB);
            }

            this.displayContents(contents);
            return true;
        };
        DeviceDriverFileSystem.prototype.displayContents = function (contents) {
            if (contents.indexOf('/n') !== -1) {
                var contentsArray = contents.split('/n');
                for (var i = 0; i < contentsArray.length; i++) {
                    _StdOut.putText(contentsArray[i]);
                    _StdOut.advanceLine();
                }
                TSOS.Control.setFileData(contents);
            } else {
                _StdOut.putText(contents);
                _StdOut.advanceLine();
                TSOS.Control.setFileData(contents);
            }
        };
        DeviceDriverFileSystem.prototype.krnDiskInUse = function (params) {
            debugger;
            var diskAction = params[0];
            var fileName = params[1];
            var data = params[2];
            var success = false;
            DISK_IN_USE = true;
            switch (diskAction) {
                case 7 /* FullFormat */: {
                    success = this.fullFormatDisk();
                    _FileNames = new TSOS.Queue();
                    _Trash = new TSOS.Queue();
                    break;
                }
                case 8 /* QuickFormat */: {
                    success = this.quickFormatDisk();
                    _Trash = _FileNames;
                    _FileNames = new TSOS.Queue();
                    break;
                }
                case 0 /* Create */: {
                    if (this.diskFileFull === false)
                        success = this.createFile(fileName, false);
                    else {
                        _StdOut.putText("File name track full, please empty trash.");
                        _StdOut.advanceLine();
                        success = false;
                    }
                    if (success) {
                        //add file name to list
                        _FileNames.enqueue(fileName);
                    }
                    break;
                }
                case 1 /* CreateForce */: {
                    success = this.createFile(fileName, false);
                    break;
                }
                case 5 /* Delete */: {
                    success = this.deleteFile(this.findFile(fileName, false));
                    _Trash.enqueue(fileName);
                    _FileNames.getAndRemove(fileName);
                    break;
                }
                case 6 /* DeleteAll */: {
                    debugger;
                    while (!_FileNames.isEmpty()) {
                        var tempFile = _FileNames.dequeue();
                        success = this.deleteFile(this.findFile(tempFile, false));
                        if (success) {
                            //if the deleting of the file was successful add it to the trash
                            _Trash.enqueue(tempFile);
                        } else {
                            break;
                        }
                    }
                    break;
                }
                case 3 /* Write */: {
                    if (this.diskFileFull === false) {
                        if (this.findFile(fileName, false) === null) {
                            //first create the file then write to it
                            this.createFile(fileName, false);
                            success = this.writeFile(fileName, data, false);
                        } else {
                            //write to existing file
                            success = this.writeFile(fileName, data, false);
                        }
                    }
                    if (!success) {
                        this.deleteFile(this.findFile(fileName, false));
                        _StdOut.putText("File name track full, please empty trash.");
                        _StdOut.advanceLine();
                    } else {
                        //add file name to list
                        _FileNames.enqueue(fileName);
                    }
                    break;
                }
                case 4 /* AppendWrite */: {
                    success = this.writeFile(fileName, data, true);
                    break;
                }
                case 2 /* Read */: {
                    success = this.readFile(fileName);
                    break;
                }
                case 9 /* EmptyTrash */: {
                    while (!_Trash.isEmpty()) {
                        var tempFile = _Trash.dequeue();
                        success = this.clearFile(this.findFile(tempFile, false));
                        if (!success) {
                            break;
                        }
                    }
                    break;
                }
            }
            fileName = (fileName === undefined) ? "" : fileName;
            var msg = (success) ? " was successful." : " failed.";

            _StdOut.advanceLine();
            _StdOut.putText(TSOS.Utils.capitaliseFirstLetter(DiskActions[diskAction]) + " " + fileName + msg);
            _StdOut.advanceLine();
            _OsShell.putPrompt();
            DISK_IN_USE = false;
            TSOS.Control.updateFileSystemDisplay();
        };
        return DeviceDriverFileSystem;
    })(TSOS.DeviceDriver);
    TSOS.DeviceDriverFileSystem = DeviceDriverFileSystem;
})(TSOS || (TSOS = {}));
