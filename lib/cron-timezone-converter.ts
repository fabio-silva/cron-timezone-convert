import { getTimezoneOffset } from "date-fns-tz";
import cronParser from "cron-parser";

const cronConverter = (
  cronExpression: string,
  originalTimeZone: string,
  targetTimeZone: string,
  includeSeconds = true,
): string => {
  const interval = cronParser.parseExpression(cronExpression);
  const now = new Date();

  const timeZoneOffsetMin =
    (getTimezoneOffset(targetTimeZone, now) -
      getTimezoneOffset(originalTimeZone, now)) /
    1000 /
    60;

  const c = getDaysHoursMinutes(
    interval.fields.hour[0],
    interval.fields.minute[0],
    timeZoneOffsetMin,
  );
  const cronExpressionFields = getFieldsCron(cronExpression);

  // Minute
  cronExpressionFields.minute = addMinutes(
    cronExpressionFields.minute,
    c.minutes,
  );

  // Hour
  cronExpressionFields.hour = addHours(cronExpressionFields.hour, c.hours);

  // Month
  if (
    (cronExpressionFields.dayOfMonth.indexOf(1) >= 0 && c.days === -1) ||
    (cronExpressionFields.dayOfMonth.indexOf(31) >= 0 && c.days === 1)
  ) {
    cronExpressionFields.month = addMonth(cronExpressionFields.month, c.days);
  }

  // Day of month
  cronExpressionFields.dayOfMonth = addDayOfMonth(
    cronExpressionFields.dayOfMonth,
    c.days,
  );

  // Day of week
  cronExpressionFields.dayOfWeek = addDayOfWeek(
    cronExpressionFields.dayOfWeek,
    c.days,
  );
  try {
    return setFieldsCron(cronExpressionFields, includeSeconds);
  } catch (err: any) {
    if (err.message.includes("Invalid explicit day of month definition")) {
      cronExpressionFields.dayOfMonth = [1];
      cronExpressionFields.month = addMonth(cronExpressionFields.month, 1);
      return setFieldsCron(cronExpressionFields, includeSeconds);
    }
    return cronExpression;
  }
};

const getDaysHoursMinutes = (
  hour: number,
  minute: number,
  timeZoneOffset: number,
) => {
  const minutes = hour * 60 + minute;
  const newMinutes = minutes + timeZoneOffset;
  const diffHour = (Math.floor(newMinutes / 60) % 24) - hour;
  const diffMinutes = (newMinutes % 60) - minute;
  const diffDays = Math.floor(newMinutes / (60 * 24));

  return { hours: diffHour, minutes: diffMinutes, days: diffDays };
};

const getFieldsCron = (expression: string) => {
  const interval = cronParser.parseExpression(expression);
  return JSON.parse(JSON.stringify(interval.fields));
};

const setFieldsCron = (fields: any, includeSeconds: boolean) => {
  const expression = cronParser.fieldsToExpression(fields).stringify();

  if (includeSeconds) {
    const second = getSeconds({ ...fields });
    return `${second} ${expression}`;
  }

  return expression;
};

const getSeconds = (fields: any) => {
  fields.minute = fields.second;
  return cronParser.fieldsToExpression(fields).stringify().split(" ")[0];
};

const addHours = (hours: number[], hour: number) =>
  hours.map((n) => {
    const h = n + hour;
    if (h > 23) return h - 24;
    if (h < 0) return h + 24;
    return h;
  });

const addMinutes = (minutes: number[], minute: number) =>
  minutes.map((n) => {
    const m = n + minute;
    if (m > 59) return m - 60;
    if (m < 0) return m + 60;
    return m;
  });

const addDayOfMonth = (dayOfMonth: any[], day: number) => {
  if (dayOfMonth.length > 30) return dayOfMonth;
  return dayOfMonth.map((n) => {
    const d = n + day;
    if (d > 31 || n === "L") return 1;
    if (d < 1) return "L";
    return d;
  });
};

const addDayOfWeek = (dayOfWeek: any[], day: number) => {
  if (dayOfWeek.length > 6) return dayOfWeek;
  return dayOfWeek.map((n) => {
    const d = n + day;
    if (d > 6) return 0;
    if (d < 0) return 6;
    return d;
  });
};

const addMonth = (month: any[], mon: number) => {
  if (month.length > 11) return month;
  return month.map((n) => {
    const m = n + mon;
    if (m > 12) return 1;
    if (m < 1) return 12;
    return m;
  });
};

export default cronConverter;
