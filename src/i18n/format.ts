// ─── Number & Date Localization ──────────────────────────────────────────────
// ابزارهای بومی‌سازی اعداد، ارقام و تاریخ برای دو زبان فارسی و انگلیسی.
//
// فارسی: ارقام فارسی (۱۴۰۳/۰۹/۱۵) + تقویم شمسی
// انگلیسی: ارقام لاتین (Dec 5, 2024) + تقویم میلادی

import { getLang } from './store';

const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
const ARABIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

/** ارقام عربی/فارسی را به لاتین تبدیل می‌کند: ۱۴۰۳ → 1403 */
export function toLatinDigits(input: string | number): string {
  return String(input)
    .replace(/[۰-۹]/g, d => String(PERSIAN_DIGITS.indexOf(d)))
    .replace(/[٠-٩]/g, d => String(ARABIC_DIGITS.indexOf(d)));
}

/** ارقام لاتین را به فارسی تبدیل می‌کند: 1403 → ۱۴۰۳ */
export function toPersianDigits(input: string | number): string {
  return String(input).replace(/[0-9]/g, d => PERSIAN_DIGITS[Number(d)]);
}

/** ارقام یک رشته را مطابق زبان فعال بومی‌سازی می‌کند (محتوای غیرعددی دست‌نخورده باقی می‌ماند) */
export function localizeDigits(input: string | number): string {
  const value = String(input ?? '');
  return getLang() === 'fa' ? toPersianDigits(toLatinDigits(value)) : toLatinDigits(value);
}

/** همان localizeDigits — نام کوتاه‌تر برای استفاده در JSX */
export const d = localizeDigits;

export interface NumberFormatOptions {
  /** جداکنندهٔ هزارگان — پیش‌فرض: بله */
  grouping?: boolean;
  /** تعداد ارقام اعشار */
  decimals?: number;
  /** ارقام را مطابق زبان بومی‌سازی کند — پیش‌فرض: بله */
  localize?: boolean;
}

/** قالب‌بندی عدد با جداکنندهٔ هزارگان و ارقام بومی‌شده */
export function formatNumber(value: number | string, options: NumberFormatOptions = {}): string {
  const { grouping = true, decimals, localize = true } = options;
  const raw = typeof value === 'string' ? Number(toLatinDigits(value)) : value;
  if (!Number.isFinite(raw)) return localize ? localizeDigits(String(value ?? '')) : String(value ?? '');

  const fixed = decimals != null ? raw.toFixed(decimals) : String(raw);
  const [intPart, fracPart] = fixed.split('.');
  let out = intPart;
  if (grouping) out = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  if (fracPart) out += `.${fracPart}`;
  return localize ? localizeDigits(out) : out;
}

/** قالب‌بندی عدد فشرده: 50000 → ۵۰K / 50K */
export function formatCompact(value: number | string): string {
  const raw = typeof value === 'string' ? Number(toLatinDigits(value)) : value;
  if (!Number.isFinite(raw)) return localizeDigits(String(value ?? ''));
  const abs = Math.abs(raw);
  if (abs >= 1_000_000_000) return formatNumber((raw / 1_000_000_000).toFixed(1).replace(/\.0$/, '')) + 'B';
  if (abs >= 1_000_000) return formatNumber((raw / 1_000_000).toFixed(1).replace(/\.0$/, '')) + 'M';
  if (abs >= 1_000) return formatNumber((raw / 1_000).toFixed(1).replace(/\.0$/, '')) + 'K';
  return localizeDigits(String(raw));
}

// ─── تقویم ───────────────────────────────────────────────────────────────────

const PERSIAN_MONTHS = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند',
];

const ENGLISH_MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const ENGLISH_MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export interface JalaliDate { jy: number; jm: number; jd: number; }

const GREGORIAN_MONTH_LENGTHS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

function isGregorianLeap(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function gregorianMonthLength(year: number, month: number): number {
  return month === 2 && isGregorianLeap(year) ? 29 : GREGORIAN_MONTH_LENGTHS[month - 1];
}

/** تبدیل تاریخ شمسی به میلادی */
export function jalaliToGregorian(jy: number, jm: number, jd: number): { gy: number; gm: number; gd: number } {
  jy = Math.floor(jy);
  jm = Math.floor(jm);
  jd = Math.floor(jd);

  const jy1 = jy + 1595;
  let days =
    -355668 +
    365 * jy1 +
    Math.floor(jy1 / 33) * 8 +
    Math.floor(((jy1 % 33) + 3) / 4) +
    jd +
    (jm < 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186);

  let gy = 400 * Math.floor(days / 146097);
  days %= 146097;
  if (days > 36524) {
    days -= 1;
    gy += 100 * Math.floor(days / 36524);
    days %= 36524;
    if (days >= 365) days += 1;
  }
  gy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    gy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  const gd = days + 1;

  let gm = 1;
  let remaining = gd;
  while (gm <= 12 && remaining > gregorianMonthLength(gy, gm)) {
    remaining -= gregorianMonthLength(gy, gm);
    gm += 1;
  }
  if (gm > 12) gm = 12;
  return { gy, gm, gd: remaining };
}

/** عددِ روزِ ژولین (JDN) برای یک تاریخ میلادی — الگوریتم استاندارد Fliegel–Van Flandern */
function gregorianToJdn(gy: number, gm: number, gd: number): number {
  const a = Math.floor((14 - gm) / 12);
  const y = gy + 4800 - a;
  const m = gm + 12 * a - 3;
  return (
    gd +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
}

/**
 * تبدیل تاریخ میلادی به شمسی.
 * پیاده‌سازی بر پایهٔ jalaliToGregorian (که با تاریخ‌های مرجع تست شده) و شمارش
 * روزهای ژولین است تا رفت‌وبرگشتِ بین دو تقویم همیشه دقیق باشد.
 */
export function gregorianToJalali(gy: number, gm: number, gd: number): JalaliDate {
  gy = Math.floor(gy);
  gm = Math.floor(gm);
  gd = Math.floor(gd);

  const targetJdn = gregorianToJdn(gy, gm, gd);

  // حدس اولیه: سال شمسی ≈ سال میلادی − ۶۲۱
  let jy = gy - 621;
  let newYear = jalaliToGregorian(jy, 1, 1);
  let newYearJdn = gregorianToJdn(newYear.gy, newYear.gm, newYear.gd);

  // نوروز همیشه ۲۰ یا ۲۱ مارس است — حدس را در صورت نیاز یک سال اصلاح می‌کنیم
  while (targetJdn < newYearJdn) {
    jy -= 1;
    newYear = jalaliToGregorian(jy, 1, 1);
    newYearJdn = gregorianToJdn(newYear.gy, newYear.gm, newYear.gd);
  }
  while (targetJdn >= gregorianToJdn(...((): [number, number, number] => {
    const n = jalaliToGregorian(jy + 1, 1, 1);
    return [n.gy, n.gm, n.gd];
  })())) {
    jy += 1;
    newYear = jalaliToGregorian(jy, 1, 1);
    newYearJdn = gregorianToJdn(newYear.gy, newYear.gm, newYear.gd);
  }

  // روزِ سال (صفر-پایه)
  const dayOfYear = targetJdn - newYearJdn;

  if (dayOfYear < 186) {
    return { jy, jm: 1 + Math.floor(dayOfYear / 31), jd: (dayOfYear % 31) + 1 };
  }
  const rest = dayOfYear - 186;
  return { jy, jm: 7 + Math.floor(rest / 30), jd: (rest % 30) + 1 };
}

function pad(value: number): string {
  return value < 10 ? `0${value}` : String(value);
}

export interface DateFormatOptions {
  /** نمایش نام ماه به‌جای عدد (Dec 5, 2024 / ۱۵ آذر ۱۴۰۳) */
  monthName?: boolean;
  /** نمایش ساعت در کنار تاریخ */
  withTime?: boolean;
}

const JALALI_PATTERN = /^(\d{4})[/\-.](\d{1,2})[/\-.](\d{1,2})(?:[T\s](\d{1,2}):(\d{2}))?/;
const GREGORIAN_PATTERN = /^(\d{4})[/\-.](\d{1,2})[/\-.](\d{1,2})(?:[T\s](\d{1,2}):(\d{2}))?/;
const TIME_PATTERN = /[T\s](\d{1,2}):(\d{2})/;

function extractTime(input: string): { hour: number; minute: number } | null {
  const m = TIME_PATTERN.exec(input);
  if (!m) return null;
  return { hour: Number(m[1]), minute: Number(m[2]) };
}

/**
 * قالب‌بندی تاریخ مطابق زبان فعال.
 * ورودی می‌تواند تاریخ شمسی (۱۴۰۳/۰۹/۱۵)، میلادی (2024-12-05)، رشتهٔ ISO یا timestamp باشد.
 */
export function formatDate(value: string | number | Date, options: DateFormatOptions = {}): string {
  const { monthName = false, withTime = false } = options;
  if (value == null || value === '') return '';

  const lang = getLang();
  let input = String(value);

  // timestamp یا شیء Date
  if (value instanceof Date) {
    input = value.toISOString();
  } else if (typeof value === 'number') {
    input = new Date(value).toISOString();
  }

  input = toLatinDigits(input);

  let time = extractTime(input);
  let jalali: JalaliDate | null = null;
  let gregorian: { gy: number; gm: number; gd: number } | null = null;

  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})/.exec(input);
  if (isoMatch || /^\d{4}[-]\d{1,2}[-]\d{1,2}/.test(input)) {
    const gy = Number(isoMatch ? isoMatch[1] : GREGORIAN_PATTERN.exec(input)![1]);
    const gm = Number(isoMatch ? isoMatch[2] : GREGORIAN_PATTERN.exec(input)![2]);
    const gd = Number(isoMatch ? isoMatch[3] : GREGORIAN_PATTERN.exec(input)![3]);
    gregorian = { gy, gm, gd };
    jalali = gregorianToJalali(gy, gm, gd);
  } else if (/^\d{4}[/.]\d{1,2}[/.]\d{1,2}/.test(input)) {
    // الگوی چهاررقمیِ اول — برای تاریخ‌های شمسی (۱۴۰۳/۰۹/۱۵) یا میلادی با اسلش
    const m = JALALI_PATTERN.exec(input)!;
    const y = Number(m[1]);
    const mo = Number(m[2]);
    const d = Number(m[3]);
    if (y >= 1300 && y <= 1600) {
      jalali = { jy: y, jm: mo, jd: d };
      gregorian = jalaliToGregorian(y, mo, d);
    } else {
      gregorian = { gy: y, gm: mo, gd: d };
      jalali = gregorianToJalali(y, mo, d);
    }
  } else {
    // الگوی ناشناس — فقط ارقام را بومی‌سازی می‌کنیم
    return localizeDigits(String(value));
  }

  const timePart = withTime && time ? `، ${pad(time.hour)}:${pad(time.minute)}` : '';

  if (lang === 'fa' && jalali) {
    const { jy, jm, jd } = jalali;
    const datePart = monthName
      ? `${localizeDigits(jd)} ${PERSIAN_MONTHS[jm - 1]} ${localizeDigits(jy)}`
      : `${localizeDigits(jy)}/${pad(jm)}/${pad(jd)}`;
    return `${datePart}${withTime && time ? `، ${localizeDigits(pad(time!.hour))}:${localizeDigits(pad(time!.minute))}` : ''}`;
  }

  const { gy, gm, gd } = gregorian!;
  const months = monthName ? ENGLISH_MONTHS_LONG : ENGLISH_MONTHS_SHORT;
  const datePart = `${months[gm - 1]} ${gd}, ${gy}`;
  return `${datePart}${withTime && time ? `, ${pad(time!.hour)}:${pad(time!.minute)}` : ''}`;
}

/** تبدیل صریحِ یک رشتهٔ تاریخ به رشتهٔ بومی‌شده (بدون نیاز به دانستن نوع ورودی) */
export function localizeDate(value: string | number | Date, options?: DateFormatOptions): string {
  return formatDate(value, options);
}

export const PERSIAN_MONTH_NAMES = PERSIAN_MONTHS;
export const ENGLISH_MONTH_NAMES = ENGLISH_MONTHS_LONG;
