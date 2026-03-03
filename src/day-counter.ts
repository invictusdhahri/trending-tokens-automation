import { readFileSync, writeFileSync, existsSync } from 'fs';

const DAY_COUNTER_FILE = 'day-counter.txt';

export function getDayCount(): number {
  try {
    if (existsSync(DAY_COUNTER_FILE)) {
      const content = readFileSync(DAY_COUNTER_FILE, 'utf-8').trim();
      const count = parseInt(content, 10);
      return isNaN(count) ? 1 : count;
    }
  } catch (error) {
    console.warn('Error reading day counter:', error);
  }
  return 1;
}

export function incrementDayCount(): number {
  const currentDay = getDayCount();
  const nextDay = currentDay + 1;
  
  try {
    writeFileSync(DAY_COUNTER_FILE, nextDay.toString(), 'utf-8');
  } catch (error) {
    console.error('Error writing day counter:', error);
  }
  
  return currentDay;
}
