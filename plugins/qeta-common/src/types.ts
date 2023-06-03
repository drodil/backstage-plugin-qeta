export interface StatisticResponse {
  ranking: Statistic[];
  loggedUser?: Statistic;
}

export interface Statistic {
  author?: string;
  total?: number;
  position?: number;
}

export interface StatisticsOptions {
  limit?: number;
  period?: string;
  loggedUser?: string;
}

export interface StatisticsRequestParameters {
  author?: string;
  options?: StatisticsOptions;
}
