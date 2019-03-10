import { Event } from './Event';
import { InMemoryEventBus } from './EventBus';

export interface IEventStore {
  saveEvents(
    aggregateId: string,
    events: Event[],
    expectedVersion: number,
    metadata: any,
  ): Promise<void>;
  getEventsForAggregate(aggregateId: string): Promise<Event[]>;
  replayEvents(from: number, to: number): Promise<void>;
}

class EventDescriptor {
  constructor(
    readonly id: string,
    readonly eventData: Event,
    readonly version: number,
  ) {}
}

// tslint:disable-next-line: max-classes-per-file
export class InMemoryEventStore implements IEventStore {
  private readonly current: { [id: string]: EventDescriptor[] } = {};

  constructor(readonly eventbus: InMemoryEventBus) {}

  public saveEvents(
    aggregateId: string,
    events: Event[],
    expectedVersion: number,
    metadata: any,
  ) {
    let eventDescriptors: EventDescriptor[];

    if (!this.current[aggregateId]) {
      eventDescriptors = [];
      this.current[aggregateId] = eventDescriptors;
    } else {
      eventDescriptors = this.current[aggregateId];
    }

    if (
      eventDescriptors.length > 0 &&
      eventDescriptors[eventDescriptors.length - 1].version !==
        expectedVersion &&
      expectedVersion !== -1
    ) {
      throw new Error('ConcurrencyException');
    }

    let i = expectedVersion;
    events.forEach(event => {
      event.version = ++i;
      eventDescriptors.push(new EventDescriptor(aggregateId, event, i));
      this.eventbus.publish('events', event);
    });

    return Promise.resolve();
  }

  public getEventsForAggregate(aggregateId: string): Promise<Event[]> {
    const eventDescriptors = this.current[aggregateId];

    if (!eventDescriptors) {
      throw new Error('AggregateNotFoundException');
    }

    return Promise.resolve(eventDescriptors.map(x => x.eventData));
  }

  public replayEvents(from: number, to: number): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
