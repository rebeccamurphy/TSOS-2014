/* ------------
   Queue.ts

   A simple Queue, which is really just a dressed-up JavaScript Array.
   See the Javascript Array documentation at
   https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array
   Look at the push and shift methods, as they are the least obvious here.

   ------------ */

module TSOS {
    export class Queue {
        constructor(public q = new Array()) {

        }

        public getSize() {
            return this.q.length;
        }

        public isEmpty(){
            return (this.q.length == 0);
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
        public inQueue(pid){
            for (var i =0; i<this.q.length; i++){
                if (this.q[i].pid === pid){
                    return true;
                }
            }
            return false;
        }
        public find(pid){
            //returns pcb and removes it from the queue
            var retVal = null;
            for (var i =0; i<this.q.length; i++){
                if (this.q[i].pid === pid){
                    retVal = this.q[i];
                    if (i>-1)
                        this.q.splice(i, 1);
                    return retVal;
                }
            }
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
