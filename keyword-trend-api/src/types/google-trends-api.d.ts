declare module 'google-trends-api' {
  export function interestOverTime(options: {
    keyword: string | string[];
    geo?: string;
    startTime?: Date;
    endTime?: Date;
  }): Promise<string>;

  export function dailyTrends(options: { geo?: string }): Promise<string>;

  export function realTimeTrends(options: {
    category?: string;
    geo?: string;
  }): Promise<string>;
}
