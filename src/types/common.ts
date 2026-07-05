export interface FirestoreTimestamp {
  seconds: number;
  nanoseconds: number;
}

export type DatabaseDate = FirestoreTimestamp | Date | string | number;
