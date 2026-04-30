import { fromZonedTime, toZonedTime } from "date-fns-tz";
import { startOfDay, endOfDay } from "date-fns";

const TIMEZONE = "Asia/Manila";

const now = new Date();

const nowInManila = toZonedTime(now, TIMEZONE);

const startManila = startOfDay(nowInManila);
const endManila = endOfDay(nowInManila);


export const start = fromZonedTime(startManila, TIMEZONE);
export const end = fromZonedTime(endManila, TIMEZONE);