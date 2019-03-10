import { Event } from './Event';

export interface IConflictResolver {
  allow(when: string, is: string): void;
  resolve(currentEvent: Event, missedEvents: Event[]): boolean;
}

export class ConflictResolver {
  private readonly rules: { [id: string]: string[] } = {};

  public allow(when: string, is: string) {
    if (!this.rules[when]) {
      this.rules[when] = [];
    }

    this.rules[when].push(is);
  }

  public resolve(currentEvent: Event, missedEvents: Event[]) {
    const rule = this.rules[currentEvent.type] || [];
    if (missedEvents.some(missedEvent => !rule.includes(missedEvent.type))) {
      return false;
    }

    return true;
  }
}
