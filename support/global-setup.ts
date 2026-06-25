import { initTracker } from './program-tracker';

export default async function globalSetup(): Promise<void> {
  initTracker();
}
