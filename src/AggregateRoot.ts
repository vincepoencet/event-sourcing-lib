import { Event } from './Event';

export abstract class AggregateRoot {
  public readonly version: number;
  public id: string;
  private readonly changes: Event[] = [];

  public getUncommittedChanges() {
    return this.changes;
  }

  public markChangesAsCommited() {
    this.changes.length = 0;
  }

  public loadFromHistory(history: Event[]) {
    history.forEach(change => this.applyChange(change, false));
  }

  protected applyChange(event: Event, isNew: boolean = true) {
    this.apply(event);

    if (isNew) {
      this.changes.push(event);
    }
  }

  protected abstract apply(e: any);
}
