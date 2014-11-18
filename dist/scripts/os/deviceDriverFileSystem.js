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
            _super.call(this, this.krnFileSystemDriverEntry, this.krnDiskInUse);
        }
        DeviceDriverFileSystem.prototype.krnFileSystemDriverEntry = function () {
            debugger;

            // Initialization routine for this, the kernel-mode Keyboard Device Driver.
            this.status = "File System Loaded";

            // More?
            this.init(false);
        };

        DeviceDriverFileSystem.prototype.init = function (format) {
            if ((sessionStorage.length === 0 && !format) || format) {
                //set the master boot record
                sessionStorage.setItem("000", "1---" + "001" + new Array(57).join('0'));
                for (var t = 0; t < this.tracks; t++) {
                    for (var s = 0; s < this.sectors; s++) {
                        for (var b = 1; b < this.blocks; b++) {
                            try  {
                                sessionStorage.setItem(t + "" + s + "" + b, new Array(this.dataBytes + this.metaData).join('0'));
                            } catch (e) {
                                alert('Quota exceeded!');
                            }
                        }
                    }
                }
            }
        };

        DeviceDriverFileSystem.prototype.getMetaData = function (tsb) {
            return sessionStorage.getItem(tsb);
        };

        DeviceDriverFileSystem.prototype.checkInUse = function (tsb) {
            return this.getMetaData(tsb).charAt(0) === '1';
        };

        DeviceDriverFileSystem.prototype.getNextTSB = function (tsb) {
            return this.getMetaData(tsb).substring(1, this.metaData);
        };

        DeviceDriverFileSystem.prototype.getDataBytes = function (tsb) {
            return sessionStorage.getItem(tsb).substring(this.metaData, this.metaData + this.dataBytes);
        };

        DeviceDriverFileSystem.prototype.formatDisk = function () {
            this.init(true);
        };
        DeviceDriverFileSystem.prototype.krnDiskInUse = function (params) {
        };
        return DeviceDriverFileSystem;
    })(TSOS.DeviceDriver);
    TSOS.DeviceDriverFileSystem = DeviceDriverFileSystem;
})(TSOS || (TSOS = {}));
