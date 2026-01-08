export function getEventId(hash: string, logIndex: number) {
  return `${hash}_${logIndex}`;
}
