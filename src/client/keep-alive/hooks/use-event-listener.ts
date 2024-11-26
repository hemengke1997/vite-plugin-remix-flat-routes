import { useEffect, useRef } from 'react'
import EventEmitter from 'eventemitter3'
import { type ActivityMode } from '../types'

class KeepAliveEvent extends EventEmitter<Events> {
  private static instance: KeepAliveEvent

  private constructor() {
    super()
  }

  static getInstance() {
    if (!KeepAliveEvent.instance) {
      KeepAliveEvent.instance = new KeepAliveEvent()
    }

    return KeepAliveEvent.instance
  }
}

type Ev<T extends Events, EventName extends EventEmitter.EventNames<T> = EventEmitter.EventNames<T>> = {
  [key in EventName]?: EventEmitter.EventListener<Events, key>
}

type Events = {
  activeChange: [
    {
      pathname: string
      mode: ActivityMode
    },
  ]
}

export function useEventListener(events?: { on?: Ev<Events>; once?: Ev<Events> }) {
  const ref = useRef<KeepAliveEvent>(KeepAliveEvent.getInstance())

  useEffect(() => {
    const hanleEvent = (type: 'on' | 'off') => {
      if (events) {
        Object.keys(events).forEach((key) => {
          if (events[key]) {
            for (const eventName in events[key]) {
              ref.current[type](eventName as keyof Events, events[key][eventName])
            }
          }
        })
      }
    }

    const registerEvent = () => {
      hanleEvent('on')
      return () => {
        hanleEvent('off')
      }
    }

    const unregister = registerEvent()

    return () => {
      unregister?.()
    }
  }, [])

  return {
    eventListener: ref.current,
  }
}
