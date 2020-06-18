export interface MapsFilter {
  key: string;
  value: string | number;
  comparator: MapsFilterComparator;
}

export type MapsFilterComparator = '>' | '=' | '<' | '<>';

export interface MapAttr {
  id: number;
  author: string;
  description: string;
  downloads: number;
  file: string;
  image: string;
  name: string;
  players: number;
  size: number;
  version: string;
  views: number;
}
