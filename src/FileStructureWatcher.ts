import chokidar from 'chokidar';

type ChangeCallback = () => void;

class FileStructureWatcher {
  private readonly watchPath: string;
  private changeCallbacks: ChangeCallback[] = [];
  private readonly watchOptions: chokidar.WatchOptions;

  constructor(watchPath: string) {
    this.watchPath = watchPath;
    this.watchOptions = {
      ignored: /node_modules|\.git/,
      persistent: true,
      ignoreInitial: true,
    };

    this.startWatching();
  }

  onChange(callback: ChangeCallback): void {
    this.changeCallbacks.push(callback);
  }

  private startWatching(): void {
    const watcher = chokidar.watch(this.watchPath, this.watchOptions);

    watcher.on('all', (event, path) => {
      // Invoke all registered callbacks when a change occurs
      this.changeCallbacks.forEach(callback => callback());
    });
  }
}

export default FileStructureWatcher;
