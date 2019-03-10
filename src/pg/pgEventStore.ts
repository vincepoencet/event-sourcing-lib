import { IConflictResolver } from '../ConflictResolver';
import { Event } from '../Event';
import { IEventBus } from '../EventBus';
import { IEventStore } from '../EventStore';

export class PgEventStore implements IEventStore {
  constructor(
    readonly client,
    readonly eventbus: IEventBus,
    readonly conflictResolver: IConflictResolver,
  ) {}

  public async saveEvents(
    aggregateId: string,
    events: Event[],
    expectedVersion: number,
    metadata: any,
  ): Promise<void> {
    for (const event of events) {
      try {
        await this.client.query(
          `
          insert into events
          (aggregate_id, type, version, body, meta)
          values
          ($1, $2, $3, $4, $5);
        `,
          [aggregateId, event.type, expectedVersion + 1, event, metadata],
        );

        event.version = expectedVersion + 1;
        this.eventbus.publish('events', event);
      } catch (error) {
        // get the missed events
        const res = await this.client.query(
          'select * from events where aggregate_id = $1 and version > $2',
          [aggregateId, expectedVersion],
        );
        const rows = res.rows;
        if (this.conflictResolver.resolve(event, rows.map(x => x.body))) {
          const newExpectedVersion = Math.max(...rows.map(x => x.version));
          return this.saveEvents(
            aggregateId,
            events,
            newExpectedVersion,
            metadata,
          );
        } else {
          throw new Error('ConcurrencyException');
        }
      }
    }
  }

  public async getEventsForAggregate(aggregateId: string): Promise<Event[]> {
    const res = await this.client.query(
      'select * from events where aggregate_id = $1',
      [aggregateId],
    );
    return res.rows.map(x => x.body);
  }

  public async replayEvents(from: number, to: number) {
    const res = await this.client.query(
      'select * from events where id between $1 and $2',
      [from, to],
    );
    for (const r of res.rows) {
      await this.eventbus.publish('events', r.body);
    }
  }
}
