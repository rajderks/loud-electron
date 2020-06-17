export interface MapsFilter {
  key: string;
  value: string | number;
  comparator: MapsFilterComparator;
}

export type MapsFilterComparator = '>' | '=' | '<' | '<>';
