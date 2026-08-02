// ========== history.ts ==========
// 编辑器历史记录管理 (撤销 / 重做)
//
// 设计:
//   - 每条 HistoryEntry 记录一次操作前(before)与操作后(after)的完整网格数据快照。
//   - push: 追加一条记录, 并丢弃当前指针之后的 redo 尾部。
//   - undo: 指针回退一步, 返回被撤销的记录 (调用方应将其 before 应用到网格)。
//   - redo: 指针前进一步, 返回被恢复的记录 (调用方应将其 after 应用到网格)。
//   - 内部存储时对 before/after 做了切片复制, 避免外部修改影响历史快照。

import type { HistoryEntry } from '../types';

export class HistoryManager {
  private history: HistoryEntry[] = [];
  private index: number = -1;
  private maxSize: number;

  /**
   * @param maxSize 最多保留的历史记录条数 (默认 50, 最小 1)
   */
  constructor(maxSize: number = 50) {
    this.maxSize = Math.max(1, Math.floor(maxSize));
  }

  /**
   * 追加一条历史记录。
   * 若当前处于已 undo 的中间状态, 会先丢弃其后的 redo 记录。
   * 超过 maxSize 时, 从最旧的记录开始丢弃。
   */
  push(entry: HistoryEntry): void {
    // 丢弃 redo 尾部
    if (this.index < this.history.length - 1) {
      this.history = this.history.slice(0, this.index + 1);
    }

    // 复制快照, 防止外部对同一 Int32Array 的后续修改污染历史
    const stored: HistoryEntry = {
      before: entry.before.slice(),
      after: entry.after.slice(),
      action: entry.action,
    };
    this.history.push(stored);

    // 限制最大长度
    while (this.history.length > this.maxSize) {
      this.history.shift();
    }

    this.index = this.history.length - 1;
  }

  /**
   * 撤销一步, 返回被撤销的记录 (调用方应用 entry.before)。
   * 若无可撤销, 返回 null。
   */
  undo(): HistoryEntry | null {
    if (!this.canUndo()) {
      return null;
    }
    const entry = this.history[this.index];
    this.index -= 1;
    return entry;
  }

  /**
   * 重做一步, 返回被恢复的记录 (调用方应用 entry.after)。
   * 若无可重做, 返回 null。
   */
  redo(): HistoryEntry | null {
    if (!this.canRedo()) {
      return null;
    }
    this.index += 1;
    return this.history[this.index];
  }

  /** 是否可撤销 */
  canUndo(): boolean {
    return this.index >= 0;
  }

  /** 是否可重做 */
  canRedo(): boolean {
    return this.index < this.history.length - 1;
  }

  /** 清空全部历史 */
  clear(): void {
    this.history = [];
    this.index = -1;
  }

  /** 当前历史记录条数 */
  size(): number {
    return this.history.length;
  }

  /** 当前指针位置 (-1 表示尚未有已应用记录) */
  currentIndex(): number {
    return this.index;
  }
}
