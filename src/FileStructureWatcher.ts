import fs from 'fs';

type ChangeCallback = () => void;

class FileStructureWatcher {
  private readonly watchPath: string;
  private changeCallback: ChangeCallback;
  private readonly watchOptions: fs.WatchOptions;

  constructor(watchPath: string) {
    this.watchPath = watchPath;
    this.changeCallback = () => { };
    this.watchOptions = {
      recursive: true,
    };

    this.startWatching();
  }

  onChange(callback: ChangeCallback): void {
    this.changeCallback = callback;
  }

  private startWatching(): void {
    fs.watch(this.watchPath, this.watchOptions, (event, filename) => {
      if (event === 'change') {
        // File or folder changed, call the callback
        this.changeCallback();
      } else if (event === 'rename') {
        // File or folder added or removed, call the callback
        this.changeCallback();
      }
    });
  }
}

export default FileStructureWatcher