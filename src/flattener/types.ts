export interface FlattenedTool {
  name: string;
  version: string | undefined;
  category: string | undefined;
  source: string; // snapshot id or label the tool came from
}

export interface FlattenResult {
  tools: FlattenedTool[];
  sourceCount: number;
  duplicatesRemoved: number;
  totalBefore: number;
}
