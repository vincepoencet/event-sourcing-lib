// tslint:disable-next-line: no-empty-interface
export interface IMessage {}

export interface IEventBus {
  subscribe(
    topic: string,
    callback: (message: IMessage) => void,
  ): Promise<void>;
  publish(topic: string, message: IMessage): Promise<void>;
}

export class InMemoryEventBus implements IEventBus {
  private readonly topics: {
    [id: string]: Array<(message: IMessage) => void>;
  } = {};

  public subscribe(topic: string, callback: (message: IMessage) => void) {
    if (!this.topics[topic]) {
      this.topics[topic] = [];
    }

    this.topics[topic].push(callback);
    return Promise.resolve();
  }

  public async publish(topic: string, message: IMessage) {
    for (const t of this.topics[topic] || []) {
      await t(message);
    }
  }
}
