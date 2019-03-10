import { IMessage } from './EventBus';

export class Event implements IMessage {
  public version: number;
  public readonly type: string;
}
