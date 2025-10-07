export interface MarketHours {
  exchange: string;
  country: string;
  timezone: string;
  openTime: string;
  closeTime: string;
  isWeekendTrading: boolean;
}

export interface MarketStatus {
  exchange: string;
  country: string;
  isOpen: boolean;
  timeUntilChange: number;
  changeType: 'open' | 'close';
  localTime: Date;
  nextEvent: string;
}

export class MarketHoursService {
  private static instance: MarketHoursService;

  private marketHoursConfig: Map<string, MarketHours> = new Map([
    ['SET', { exchange: 'SET', country: 'Thailand', timezone: 'Asia/Bangkok', openTime: '10:00', closeTime: '16:30', isWeekendTrading: false }],
    ['SGX', { exchange: 'SGX', country: 'Singapore', timezone: 'Asia/Singapore', openTime: '09:00', closeTime: '17:00', isWeekendTrading: false }],
    ['MYX', { exchange: 'MYX', country: 'Malaysia', timezone: 'Asia/Kuala_Lumpur', openTime: '09:00', closeTime: '17:00', isWeekendTrading: false }],
    ['IDX', { exchange: 'IDX', country: 'Indonesia', timezone: 'Asia/Jakarta', openTime: '09:00', closeTime: '16:15', isWeekendTrading: false }],
    ['PSE', { exchange: 'PSE', country: 'Philippines', timezone: 'Asia/Manila', openTime: '09:30', closeTime: '15:30', isWeekendTrading: false }],
    ['HOSE', { exchange: 'HOSE', country: 'Vietnam', timezone: 'Asia/Ho_Chi_Minh', openTime: '09:00', closeTime: '15:00', isWeekendTrading: false }]
  ]);

  private symbolToExchangeMap: Map<string, string> = new Map([
    ['SET.BK', 'SET'],
    ['STI.SI', 'SGX'],
    ['KLCI.KL', 'MYX'],
    ['JKSE.JK', 'IDX'],
    ['PSEI.PS', 'PSE'],
    ['VN-INDEX.HM', 'HOSE']
  ]);

  public static getInstance(): MarketHoursService {
    if (!MarketHoursService.instance) {
      MarketHoursService.instance = new MarketHoursService();
    }
    return MarketHoursService.instance;
  }

  getExchangeFromSymbol(symbol: string): string {
    return this.symbolToExchangeMap.get(symbol) || 'UNKNOWN';
  }

  getMarketStatus(exchange: string): MarketStatus {
    const config = this.marketHoursConfig.get(exchange);
    if (!config) {
      return {
        exchange,
        country: 'Unknown',
        isOpen: false,
        timeUntilChange: 0,
        changeType: 'open',
        localTime: new Date(),
        nextEvent: 'Unknown'
      };
    }

    const now = new Date();
    const localTime = new Date(now.toLocaleString('en-US', { timeZone: config.timezone }));
    const dayOfWeek = localTime.getDay();

    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    if (isWeekend && !config.isWeekendTrading) {
      const daysUntilMonday = dayOfWeek === 0 ? 1 : 2;
      const nextMonday = new Date(localTime);
      nextMonday.setDate(localTime.getDate() + daysUntilMonday);
      const [openHour, openMinute] = config.openTime.split(':').map(Number);
      nextMonday.setHours(openHour, openMinute, 0, 0);

      const timeUntilOpen = nextMonday.getTime() - localTime.getTime();

      return {
        exchange,
        country: config.country,
        isOpen: false,
        timeUntilChange: timeUntilOpen,
        changeType: 'open',
        localTime,
        nextEvent: 'Opens Monday'
      };
    }

    const [openHour, openMinute] = config.openTime.split(':').map(Number);
    const [closeHour, closeMinute] = config.closeTime.split(':').map(Number);

    const openTime = new Date(localTime);
    openTime.setHours(openHour, openMinute, 0, 0);

    const closeTime = new Date(localTime);
    closeTime.setHours(closeHour, closeMinute, 0, 0);

    const currentTime = localTime.getTime();
    const openTimestamp = openTime.getTime();
    const closeTimestamp = closeTime.getTime();

    if (currentTime >= openTimestamp && currentTime < closeTimestamp) {
      const timeUntilClose = closeTimestamp - currentTime;
      return {
        exchange,
        country: config.country,
        isOpen: true,
        timeUntilChange: timeUntilClose,
        changeType: 'close',
        localTime,
        nextEvent: 'Closes'
      };
    } else if (currentTime < openTimestamp) {
      const timeUntilOpen = openTimestamp - currentTime;
      return {
        exchange,
        country: config.country,
        isOpen: false,
        timeUntilChange: timeUntilOpen,
        changeType: 'open',
        localTime,
        nextEvent: 'Opens'
      };
    } else {
      const tomorrow = new Date(localTime);
      tomorrow.setDate(localTime.getDate() + 1);
      tomorrow.setHours(openHour, openMinute, 0, 0);

      const tomorrowDayOfWeek = tomorrow.getDay();
      if ((tomorrowDayOfWeek === 0 || tomorrowDayOfWeek === 6) && !config.isWeekendTrading) {
        const daysToAdd = tomorrowDayOfWeek === 6 ? 2 : 1;
        tomorrow.setDate(tomorrow.getDate() + daysToAdd);
      }

      const timeUntilOpen = tomorrow.getTime() - currentTime;

      return {
        exchange,
        country: config.country,
        isOpen: false,
        timeUntilChange: timeUntilOpen,
        changeType: 'open',
        localTime,
        nextEvent: tomorrow.getDay() === localTime.getDay() + 1 ? 'Opens Tomorrow' : 'Opens Monday'
      };
    }
  }

  getAllMarketStatuses(): MarketStatus[] {
    return Array.from(this.marketHoursConfig.keys()).map(exchange =>
      this.getMarketStatus(exchange)
    );
  }

  isAnyMarketOpen(): boolean {
    return this.getAllMarketStatuses().some(status => status.isOpen);
  }

  formatTimeRemaining(milliseconds: number): string {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      return `${days}d ${remainingHours}h`;
    }

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }

    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }

    return `${seconds}s`;
  }

  getMarketHoursInfo(exchange: string): MarketHours | undefined {
    return this.marketHoursConfig.get(exchange);
  }
}
