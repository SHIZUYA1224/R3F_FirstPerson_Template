export type EventHandler<T = unknown> = (payload: T) => void;

export type EventBus = {
  on<T>(event: string, handler: EventHandler<T>): () => void;
  emit<T>(event: string, payload?: T): void;
};

export type InternalEventBus = EventBus & {
  clear(): void;
  listenerCount(event?: string): number;
};

export function createEventBus(): InternalEventBus {
  const listeners = new Map<string, Set<EventHandler>>();

  return {
    on<T>(event: string, handler: EventHandler<T>) {
      const handlers = listeners.get(event) ?? new Set<EventHandler>();
      const internalHandler = handler as EventHandler;

      handlers.add(internalHandler);
      listeners.set(event, handlers);

      return () => {
        handlers.delete(internalHandler);
        if (handlers.size === 0) {
          listeners.delete(event);
        }
      };
    },

    emit<T>(event: string, payload?: T) {
      const handlers = listeners.get(event);
      if (!handlers) {
        return;
      }

      for (const handler of [...handlers]) {
        handler(payload);
      }
    },

    clear() {
      listeners.clear();
    },

    listenerCount(event?: string) {
      if (event) {
        return listeners.get(event)?.size ?? 0;
      }

      let count = 0;
      for (const handlers of listeners.values()) {
        count += handlers.size;
      }
      return count;
    },
  };
}
