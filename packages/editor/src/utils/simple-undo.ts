export interface SimpleUndoOptions {
  provider: (done: (data: string) => void) => void;
  maxLength: number;
  onUpdate: () => void;
}

export type HistoryStackItem = string | null;

function truncate(stack: Array<HistoryStackItem>, limit: number) {
  while (stack.length > limit) {
    stack.shift();
  }
}

// 管理formrender过程中的数据
export default class SimpleUndo {
  provider: SimpleUndoOptions['provider'];
  maxLength: SimpleUndoOptions['maxLength'];
  onUpdate: SimpleUndoOptions['onUpdate'];
  position: number;
  initialItem: HistoryStackItem;
  stack: Array<HistoryStackItem>;
  constructor(options?: Partial<SimpleUndoOptions>) {
    const mergeOptions = {
      provider: function () {
        throw new Error("No provider!");
      },
      maxLength: 30,
      onUpdate: function () { },
      ...options
    };

    this.provider = mergeOptions.provider;
    this.maxLength = mergeOptions.maxLength;
    this.onUpdate = mergeOptions.onUpdate;
    this.initialItem = null;
    this.stack = [];
    this.position = 0;
    this.clear = this.clear.bind(this);
    this.count = this.count.bind(this);
    this.canUndo = this.canUndo.bind(this);
    this.canRedo = this.canRedo.bind(this);
    this.redo = this.redo.bind(this);
    this.undo = this.undo.bind(this);
    this.save = this.save.bind(this);
    this.initialize = this.initialize.bind(this);
    this.clear();
  }

  count() {
    return this.stack.length - 1; // -1 because of initial item
  };

  canUndo() {
    return this.position > 0;
  };

  canRedo() {
    return this.position < this.count();
  };

  redo(callback: (data: HistoryStackItem) => void) {
    if (this.canRedo()) {
      var item = this.stack[++this.position];
      this.onUpdate();

      if (callback) {
        callback(item);
      }
    }
  }

  undo(callback: (data: HistoryStackItem) => void) {
    if (this.canUndo()) {
      var item = this.stack[--this.position];
      this.onUpdate();

      if (callback) {
        callback(item);
      }
    }
  }

  save() {
    this.provider((current: string) => {
      if (this.position >= this.maxLength) truncate(this.stack, this.maxLength);
      this.position = Math.min(this.position, this.stack.length - 1);
      this.stack = this.stack.slice(0, this.position + 1);
      this.stack.push(current);
      this.position++;
      this.onUpdate();
    });
  }

  clear() {
    this.stack = [this.initialItem];
    this.position = 0;
    this.onUpdate();
  }

  initialize(initialItem) {
    this.stack[0] = initialItem;
    this.initialItem = initialItem;
  }
}
