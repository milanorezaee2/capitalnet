import type { EvalFormConfig, HeadingTag, TextAlign } from '../lib/settingsApi'

const DEFAULT_EVAL_FORM_CONFIG: EvalFormConfig = {
  step1_title: 'به کپیتال نتورک خوش آمدید',
  step1_title_level: 'h1',
  step1_title_align: 'right',
  step1_subtitle: 'برای شروع، نوع همکاری خود را انتخاب کنید.',
  step1_subtitle_level: 'h2',
  step1_subtitle_align: 'right',
  profile_types: [
    { value: 'founder', label: 'فاندر / استارتاپ', label_level: 'h3', label_align: 'right', sub: 'به دنبال جذب سرمایه Seed تا Series B هستم', sub_align: 'right' },
    { value: 'investor', label: 'سرمایه‌گذار / VC', label_level: 'h3', label_align: 'right', sub: 'به دنبال Deal Flow باکیفیت هستم', sub_align: 'right' },
  ],
  step2_title: 'اطلاعات تماس',
  step2_title_level: 'h2',
  step2_title_align: 'right',
  step2_subtitle: 'برای هماهنگی جلسه استراتژی با شما در ارتباط خواهیم بود',
  step2_subtitle_level: 'h3',
  step2_subtitle_align: 'right',
  step3f_title: 'درباره استارتاپ شما',
  step3f_title_level: 'h2',
  step3f_title_align: 'right',
  step3f_subtitle: 'این اطلاعات به ما کمک می‌کند VC مناسب را مچ کنیم',
  step3f_subtitle_level: 'h3',
  step3f_subtitle_align: 'right',
  sector_options: ['SaaS / B2B Software', 'Fintech / Payment', 'AI / Data / ML', 'HealthTech / BioTech', 'E-commerce / D2C', 'Marketplace', 'Other'],
  stage_options: ['Pre-Seed / MVP', 'Seed', 'Series A', 'Series B'],
  capital_options: ['200M–350M تومان', '350M–500M تومان', '500M–750M تومان', '750M–1B تومان', '€500K – €2M', '€2M – €5M', '€5M – €15M', '€15M+'],
  step3i_title: 'پروفایل سرمایه‌گذاری',
  step3i_title_level: 'h2',
  step3i_title_align: 'right',
  step3i_subtitle: 'تا Deal Flow مرتبط برای شما ارسال کنیم',
  step3i_subtitle_level: 'h3',
  step3i_subtitle_align: 'right',
  ticket_options: ['€500K – €2M', '€2M – €5M', '€5M – €15M', '€15M+'],
  stage_pref_options: ['Seed', 'Series A', 'Series B', 'Growth', 'Flexible'],
  step4_title: 'مستندات و آمادگی',
  step4_title_level: 'h2',
  step4_title_align: 'right',
  step4_subtitle: 'آپلود Pitch Deck بررسی را سریع‌تر می‌کند',
  step4_subtitle_level: 'h3',
  step4_subtitle_align: 'right',
  confidence_options: [
    { value: 'high', label: 'کاملاً آماده‌ام / می‌دانم چه می‌خواهم', label_level: 'h4', label_align: 'right', sub: 'کاملاً آماده', sub_level: 'h5', sub_align: 'right' },
    { value: 'low', label: 'نیاز به راهنمایی دارم / مطمئن نیستم', label_level: 'h4', label_align: 'right', sub: 'نیاز به راهنمایی', sub_level: 'h5' },
  ],
  step5_title: 'تأیید و ارسال',
  step5_title_level: 'h2',
  step5_title_align: 'right',
  step5_subtitle: 'اطلاعات وارد شده را بررسی و سپس ارسال کنید.',
  step5_subtitle_level: 'h3',
  step5_subtitle_align: 'right',
  success_title: 'ارسال با موفقیت انجام شد!',
  success_title_level: 'h2',
  success_title_align: 'center',
  success_subtitle: 'در حال انتقال به صفحه اصلی...',
  success_subtitle_level: 'h3',
  success_subtitle_align: 'center',
  success_btn: 'بازگشت فوری به صفحه اصلی',
  success_btn_align: 'center',
  step5_notice: 'با ارسال این فرم، تیم کپیتال نتورک ظرف ۲ تا ۵ روز کاری با شما تماس خواهد گرفت.',
  tab_steps: ['پروفایل', 'اطلاعات', 'جزئیات', 'مستندات', 'تأیید'],
};

function pickOption<T extends string>(value: unknown, fallback: T): T {
  return typeof value === 'string' && value.trim() ? value as T : fallback;
}

function pickString(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

function pickStringArray(value: unknown, fallback: string[]) {
  return Array.isArray(value) && value.length > 0 ? value.filter(item => typeof item === 'string' && item.trim()) : fallback;
}

function pickProfileTypes(value: unknown, fallback: EvalFormConfig['profile_types']) {
  if (Array.isArray(value) && value.length > 0) {
    return value
      .filter(item => item && typeof item === 'object')
      .map(item => ({
        value: pickString((item as Record<string, unknown>).value, fallback[0]?.value || ''),
        label: pickString((item as Record<string, unknown>).label, fallback[0]?.label || ''),
        label_level: pickString((item as Record<string, unknown>).label_level, fallback[0]?.label_level || 'h3'),
        label_align: pickString((item as Record<string, unknown>).label_align, fallback[0]?.label_align || 'right'),
        sub: pickString((item as Record<string, unknown>).sub, fallback[0]?.sub || ''),
        sub_level: pickString((item as Record<string, unknown>).sub_level, fallback[0]?.sub_level || 'h5'),
        sub_align: pickString((item as Record<string, unknown>).sub_align, fallback[0]?.sub_align || 'right'),
      }));
  }
  return fallback;
}

function pickOptionCards(value: unknown, fallback: EvalFormConfig['confidence_options']) {
  if (Array.isArray(value) && value.length > 0) {
    return value
      .filter(item => item && typeof item === 'object')
      .map(item => ({
        value: pickString((item as Record<string, unknown>).value, fallback[0]?.value || ''),
        label: pickString((item as Record<string, unknown>).label, fallback[0]?.label || ''),
        label_level: pickString((item as Record<string, unknown>).label_level, fallback[0]?.label_level || 'h4'),
        label_align: pickString((item as Record<string, unknown>).label_align, fallback[0]?.label_align || 'right'),
        sub: pickString((item as Record<string, unknown>).sub, fallback[0]?.sub || ''),
        sub_level: pickString((item as Record<string, unknown>).sub_level, fallback[0]?.sub_level || 'h5'),
        sub_align: pickString((item as Record<string, unknown>).sub_align, fallback[0]?.sub_align || 'right'),
      }));
  }
  return fallback;
}

export function normalizeEvalFormConfig(config: Partial<EvalFormConfig> = {}): EvalFormConfig {
  return {
    step1_title: pickOption(config.step1_title, DEFAULT_EVAL_FORM_CONFIG.step1_title),
    step1_title_level: pickOption(config.step1_title_level, DEFAULT_EVAL_FORM_CONFIG.step1_title_level),
    step1_title_align: pickOption(config.step1_title_align, DEFAULT_EVAL_FORM_CONFIG.step1_title_align),
    step1_subtitle: pickOption(config.step1_subtitle, DEFAULT_EVAL_FORM_CONFIG.step1_subtitle),
    step1_subtitle_level: pickOption(config.step1_subtitle_level, DEFAULT_EVAL_FORM_CONFIG.step1_subtitle_level),
    step1_subtitle_align: pickOption(config.step1_subtitle_align, DEFAULT_EVAL_FORM_CONFIG.step1_subtitle_align),
    profile_types: pickProfileTypes(config.profile_types, DEFAULT_EVAL_FORM_CONFIG.profile_types),
    step2_title: pickOption(config.step2_title, DEFAULT_EVAL_FORM_CONFIG.step2_title),
    step2_title_level: pickOption(config.step2_title_level, DEFAULT_EVAL_FORM_CONFIG.step2_title_level),
    step2_title_align: pickOption(config.step2_title_align, DEFAULT_EVAL_FORM_CONFIG.step2_title_align),
    step2_subtitle: pickOption(config.step2_subtitle, DEFAULT_EVAL_FORM_CONFIG.step2_subtitle),
    step2_subtitle_level: pickOption(config.step2_subtitle_level, DEFAULT_EVAL_FORM_CONFIG.step2_subtitle_level),
    step2_subtitle_align: pickOption(config.step2_subtitle_align, DEFAULT_EVAL_FORM_CONFIG.step2_subtitle_align),
    step3f_title: pickOption(config.step3f_title, DEFAULT_EVAL_FORM_CONFIG.step3f_title),
    step3f_title_level: pickOption(config.step3f_title_level, DEFAULT_EVAL_FORM_CONFIG.step3f_title_level),
    step3f_title_align: pickOption(config.step3f_title_align, DEFAULT_EVAL_FORM_CONFIG.step3f_title_align),
    step3f_subtitle: pickOption(config.step3f_subtitle, DEFAULT_EVAL_FORM_CONFIG.step3f_subtitle),
    step3f_subtitle_level: pickOption(config.step3f_subtitle_level, DEFAULT_EVAL_FORM_CONFIG.step3f_subtitle_level),
    step3f_subtitle_align: pickOption(config.step3f_subtitle_align, DEFAULT_EVAL_FORM_CONFIG.step3f_subtitle_align),
    sector_options: pickStringArray(config.sector_options, DEFAULT_EVAL_FORM_CONFIG.sector_options),
    stage_options: pickStringArray(config.stage_options, DEFAULT_EVAL_FORM_CONFIG.stage_options),
    capital_options: pickStringArray(config.capital_options, DEFAULT_EVAL_FORM_CONFIG.capital_options),
    step3i_title: pickOption(config.step3i_title, DEFAULT_EVAL_FORM_CONFIG.step3i_title),
    step3i_title_level: pickOption(config.step3i_title_level, DEFAULT_EVAL_FORM_CONFIG.step3i_title_level),
    step3i_title_align: pickOption(config.step3i_title_align, DEFAULT_EVAL_FORM_CONFIG.step3i_title_align),
    step3i_subtitle: pickOption(config.step3i_subtitle, DEFAULT_EVAL_FORM_CONFIG.step3i_subtitle),
    step3i_subtitle_level: pickOption(config.step3i_subtitle_level, DEFAULT_EVAL_FORM_CONFIG.step3i_subtitle_level),
    step3i_subtitle_align: pickOption(config.step3i_subtitle_align, DEFAULT_EVAL_FORM_CONFIG.step3i_subtitle_align),
    ticket_options: pickStringArray(config.ticket_options, DEFAULT_EVAL_FORM_CONFIG.ticket_options),
    stage_pref_options: pickStringArray(config.stage_pref_options, DEFAULT_EVAL_FORM_CONFIG.stage_pref_options),
    step4_title: pickOption(config.step4_title, DEFAULT_EVAL_FORM_CONFIG.step4_title),
    step4_title_level: pickOption(config.step4_title_level, DEFAULT_EVAL_FORM_CONFIG.step4_title_level),
    step4_title_align: pickOption(config.step4_title_align, DEFAULT_EVAL_FORM_CONFIG.step4_title_align),
    step4_subtitle: pickOption(config.step4_subtitle, DEFAULT_EVAL_FORM_CONFIG.step4_subtitle),
    step4_subtitle_level: pickOption(config.step4_subtitle_level, DEFAULT_EVAL_FORM_CONFIG.step4_subtitle_level),
    step4_subtitle_align: pickOption(config.step4_subtitle_align, DEFAULT_EVAL_FORM_CONFIG.step4_subtitle_align),
    confidence_options: pickOptionCards(config.confidence_options, DEFAULT_EVAL_FORM_CONFIG.confidence_options),
    step5_title: pickOption(config.step5_title, DEFAULT_EVAL_FORM_CONFIG.step5_title),
    step5_title_level: pickOption(config.step5_title_level, DEFAULT_EVAL_FORM_CONFIG.step5_title_level),
    step5_title_align: pickOption(config.step5_title_align, DEFAULT_EVAL_FORM_CONFIG.step5_title_align),
    step5_subtitle: pickOption(config.step5_subtitle, DEFAULT_EVAL_FORM_CONFIG.step5_subtitle),
    step5_subtitle_level: pickOption(config.step5_subtitle_level, DEFAULT_EVAL_FORM_CONFIG.step5_subtitle_level),
    step5_subtitle_align: pickOption(config.step5_subtitle_align, DEFAULT_EVAL_FORM_CONFIG.step5_subtitle_align),
    success_title: pickOption(config.success_title, DEFAULT_EVAL_FORM_CONFIG.success_title),
    success_title_level: pickOption(config.success_title_level, DEFAULT_EVAL_FORM_CONFIG.success_title_level),
    success_title_align: pickOption(config.success_title_align, DEFAULT_EVAL_FORM_CONFIG.success_title_align),
    success_subtitle: pickOption(config.success_subtitle, DEFAULT_EVAL_FORM_CONFIG.success_subtitle),
    success_subtitle_level: pickOption(config.success_subtitle_level, DEFAULT_EVAL_FORM_CONFIG.success_subtitle_level),
    success_subtitle_align: pickOption(config.success_subtitle_align, DEFAULT_EVAL_FORM_CONFIG.success_subtitle_align),
    success_btn: pickOption(config.success_btn, DEFAULT_EVAL_FORM_CONFIG.success_btn),
    success_btn_align: pickOption(config.success_btn_align, DEFAULT_EVAL_FORM_CONFIG.success_btn_align),
    tab_steps: pickStringArray(config.tab_steps, DEFAULT_EVAL_FORM_CONFIG.tab_steps),
  };
}

export { DEFAULT_EVAL_FORM_CONFIG };
