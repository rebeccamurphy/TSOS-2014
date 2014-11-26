/* ------------
   Queue.ts

   A simple Queue, which is really just a dressed-up JavaScript Array.
   See the Javascript Array documentation at
   https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array
   Look at the push and shift methods, as they are the least obvious here.

   ------------ */

module TSOS {
    export class Queue {
        constructor(public q = new Array(),
                    private leastIndex:number=null,
                    private ordered = false) {
            
        }

        public getSize() {
            return this.q.length;
        }

        public isEmpty(){
            return (this.q.length == 0);
        }

        public isOrdered(){
            return this.ordered;
        }

        public enqueue(element) {
            this.q.push(element);
        }

        public dequeue() {
            var retVal = null;
            if (this.q.length > 0) {
                retVal = this.q.shift();
            }
            return retVal;
        }

        public get(i){
            //gets pcb
            return this.q[i];
        }
        public getLast(){
            return this.q[this.q.length-1];
        }
        public inQueue(pid){
            if (typeof pid ==='number'){
                for (var i =0; i<this.q.length; i++){
                    if (this.q[i].pid === pid){
                        return true;
                    }
                }
            }
            else{
                for (var i =0; i<this.q.length; i++){
                    if (this.q[i] === pid){
                        return true;
                    }
                }   
            }
            return false;
        }
        public getAndRemove(pid){
            //returns pcb and removes it from the queue
            var retVal = null;
            if (typeof pid ==='number'){
                for (var i =0; i<this.q.length; i++){
                    if (this.q[i].pid === pid){
                        retVal = this.q[i];
                        if (i>-1)
                            this.q.splice(i, 1);
                        return retVal;
                    }
                }
            }
            else {
                for (var i =0; i<this.q.length; i++){
                    if (this.q[i] === pid){
                        retVal = this.q[i];
                        if (i>-1)
                            this.q.splice(i, 1);
                        return retVal;
                    }
                }
            }

        }
        public priorityOrder(){
            this.q.sort(this.comparePriority);
            this.ordered = true;   
        }
        public order(){
            this.q.sort(this.compare);
            this.ordered = true;
        }
        public getLeastImportant(){
            var retVal;
            var leastPriority =0;
            for (var i =0; i<this.q.length; i++){
                if (SCHEDULE_TYPE === scheduleType.priority){
                    //gets last program in memory with highest priority
                    if (this.q[i].location === Locations.Memory && this.q[i].priority >= leastPriority){
                        retVal = this.q[i];
                        this.leastIndex =i;
                        leastPriority = retVal.priority;
                    }
                }
                else{
                    if (this.q[i].location === Locations.Memory){
                        retVal = this.q[i];
                        this.leastIndex =i;
                    }
                }
            }

            this.q.splice(this.leastIndex, 1);
            return retVal;

        }
        public addLeastImportant(pcb){
            this.q.splice(this.leastIndex, 0, pcb);
            this.leastIndex = null;

        }
        private compare(a,b) {
            if (a.pid < b.pid)
                return -1;
            if (a.pid > b.pid)
                return 1;
            return 0;
        }
        private comparePriority(a,b) {
            if (a.priority < b.priority)
                return -1;
            if (a.priority > b.priority)
                return 1;
            return 0;
        }

        public toString() {
            var retVal = "";
            for (var i in this.q) {
                retVal += "[" + this.q[i] + "] ";
            }
            return retVal;
        }
    }
}
