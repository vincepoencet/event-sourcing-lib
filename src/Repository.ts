import { AggregateRoot } from './AggregateRoot';
import { IEventStore } from './EventStore';

export interface IRepository<T extends AggregateRoot> {
  save(
    aggregate: AggregateRoot,
    expectedVersion: number,
    metadata: any,
  ): Promise<void>;
  getById(id: string): Promise<T>;
}

export abstract class Repository<T extends AggregateRoot>
  implements IRepository<T> {
  constructor(readonly storage: IEventStore) {}

  public save(
    aggregate: AggregateRoot,
    expectedVersion: number,
    metadata: any,
  ): Promise<void> {
    return this.storage.saveEvents(
      aggregate.id,
      aggregate.getUncommittedChanges(),
      expectedVersion,
      metadata,
    );
  }

  public async getById(id: string): Promise<T> {
    const o: T = this.getNew();
    const e = await this.storage.getEventsForAggregate(id);
    o.loadFromHistory(e);
    return o;
  }

  protected abstract getNew(): T;
}
