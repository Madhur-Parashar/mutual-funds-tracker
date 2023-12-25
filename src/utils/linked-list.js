export default function LinkedList() {
    this.head = null;
    function Node(value) {
      this.value = value;
      this.nextPtr = null;
    }
    this.insertAtEnd = (value) => {
      let newNode = new Node(value);
      if (!this.head) {
        this.head = newNode;
      } else {
        let ptr = this.head;
        while (ptr.nextPtr != null) {
          ptr = ptr.nextPtr;
        }
        ptr.nextPtr = newNode;
      }
    };
    this.insertAtFront = (value) => {
      let newNode = new Node(value);
      newNode.nextPtr = this.head;
      this.head = newNode;
    };
    this.insertAfterNode = (nodeValue, value) => {
      let newNode = new Node(value);
      let ptr = this.head;
      while (ptr.value !== nodeValue) {
        ptr = ptr.nextPtr;
      }
      newNode.nextPtr = ptr.nextPtr;
      ptr.nextPtr = newNode;
    };
    this.deleteFromEnd = () => {
      let ptr = this.head;
      let prePtr = ptr;
      while (ptr.nextPtr !== null) {
        prePtr = ptr;
        ptr = ptr.nextPtr;
      }
      prePtr.nextPtr = null;
    };
    this.deleteFromFront = () => {
      let temp = this.head;
      this.head = temp.nextPtr;
      temp.nextPtr = null;
    };
    this.deleteAfterNode = (nodeValue) => {
      let ptr = this.head;
      let prePtr = ptr;
      while (ptr.value !== nodeValue) {
        prePtr = ptr;
        ptr = ptr.nextPtr;
      }
      prePtr.nextPtr = ptr.nextPtr;
    };
    this.traverseList = () => {
      let ptr = this.head;
      let traverse = [this.head.value];
      while (ptr.nextPtr !== null) {
        ptr = ptr.nextPtr;
        traverse = traverse.concat(ptr.value);
      }
      return traverse;
    };
  }
  