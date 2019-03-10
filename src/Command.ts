import { IMessage } from './EventBus';

export abstract class Command implements IMessage {
  constructor(readonly metadata: any) {}
}
