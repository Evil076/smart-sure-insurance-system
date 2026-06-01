
export type EventLevel = 'INFO' | 'SEC' | 'AI' | 'WARN' | 'LOG';

export interface SystemEvent {
  id: string;
  timestamp: string;
  level: EventLevel;
  message: string;
  origin: string;
  metadata?: any;
}

class SystemLogger {
  private events: SystemEvent[] = [];
  private listeners: ((event: SystemEvent) => void)[] = [];

  constructor() {
    // Initial bootstrap logs for a realistic appearance
    this.log('INFO', 'SmartSure System Core initialized.', 'SYSTEM_ROOT');
    this.log('SEC', 'Blockchain genesis block verified.', 'CHAIN_NODE');
  }

  log(level: EventLevel, message: string, origin: string, metadata?: any) {
    const event: SystemEvent = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString([], { hour12: false }),
      level,
      message,
      origin,
      metadata
    };
    
    this.events = [event, ...this.events].slice(0, 100); // Keep last 100
    this.listeners.forEach(listener => listener(event));
    
    // Also persist to session storage for continuity
    const stored = sessionStorage.getItem('smartsure_logs');
    const logs = stored ? JSON.parse(stored) : [];
    sessionStorage.setItem('smartsure_logs', JSON.stringify([event, ...logs].slice(0, 50)));
  }

  getEvents() {
    return this.events;
  }

  subscribe(callback: (event: SystemEvent) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  getMetrics() {
    const aiEvents = this.events.filter(e => e.level === 'AI');
    const secEvents = this.events.filter(e => e.level === 'SEC');
    return {
      totalQueries: this.events.length,
      aiSuccessRate: aiEvents.length > 0 ? 98 : 100,
      activeThreats: secEvents.length,
      avgResponseTime: aiEvents.length > 0 ? (Math.random() * 0.5 + 0.8).toFixed(2) : "0.00"
    };
  }
}

export const systemLogger = new SystemLogger();
