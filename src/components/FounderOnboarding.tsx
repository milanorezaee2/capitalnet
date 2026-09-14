'use client'

import type * as React from 'react'
import { useEffect, useState, useRef } from 'react'
import { addUserAction } from '../utils/userStore'
import { insertLead } from '../lib/leadsApi'
import { supabase } from '../lib/supabaseApi'
import { useSettings } from '../hooks/useSettings'
import { normalizeEvalFormConfig } from '../utils/evalFormConfigRuntime'

function FallbackEvaluationContent({ evalConfig }: { evalConfig: ReturnType<typeof normalizeEvalFormConfig> }) {
  return (
    <div style={{ minHeight: '100vh', background: '#030712', color: '#fff', padding: '48px 24px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', background: 'rgba(8,12,24,0.72)', border: '1px solid rgba(255,255,255,0.16)', borderRadius: 24, padding: 32, boxShadow: '0 24px 80px rgba(0,0,0,0.45)' }}>
        <h1 style={{ fontSize: 32, marginBottom: 12 }}>{evalConfig.step1_title}</h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16, marginBottom: 24 }}>{evalConfig.step1_subtitle}</p>
        <div style={{ display: 'grid', gap: 12 }}>
          {evalConfig.profile_types.map((profileType) => (
            <div key={profileType.value} style={{ border: '1px solid rgba(255,255,255,0.14)', borderRadius: 16, padding: 16, background: 'rgba(255,255,255,0.04)' }}>
              <h3 style={{ margin: 0, fontSize: 18 }}>{profileType.label}</h3>
              <p style={{ margin: '6px 0 0', color: 'rgba(255,255,255,0.7)' }}>{profileType.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function StepHeader({ title, subtitle, titleLevel, titleAlign, subtitleLevel, subtitleAlign }: { title: string; subtitle: string; titleLevel?: string; titleAlign?: string; subtitleLevel?: string; subtitleAlign?: string }) {
  const HeadingTag = (titleLevel || 'h2') as keyof React.JSX.IntrinsicElements
  const SubtitleTag = (subtitleLevel || 'p') as keyof React.JSX.IntrinsicElements
  const titleTextAlign = titleAlign === 'center' ? 'center' : titleAlign === 'left' ? 'left' : 'right'
  const subtitleTextAlign = subtitleAlign === 'center' ? 'center' : subtitleAlign === 'left' ? 'left' : 'right'

  return (
    <div className="cn-step-header" style={{ textAlign: titleTextAlign }}>
      <HeadingTag className="cn-step-title" style={{ textAlign: titleTextAlign }}>{title}</HeadingTag>
      <SubtitleTag className="cn-step-desc" style={{ textAlign: subtitleTextAlign }}>{subtitle}</SubtitleTag>
    </div>
  )
}

function CardHeading({ title, level, align }: { title: string; level?: string; align?: string }) {
  const HeadingTag = (level || 'h4') as keyof React.JSX.IntrinsicElements
  const textAlign = align === 'center' ? 'center' : align === 'left' ? 'left' : 'right'
  return <HeadingTag style={{ textAlign, margin: 0, lineHeight: 1.2 }}>{title}</HeadingTag>
}

export default function FounderOnboarding() {
  const settings = useSettings()
  const evalConfig = normalizeEvalFormConfig(settings.eval_form_config)
  const [videoSrc, setVideoSrc] = useState<string | null>(null)
  const [videoError, setVideoError] = useState(false)
  const [videoReady, setVideoReady] = useState(false)
  const [hasRenderError, setHasRenderError] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const progressLabels = evalConfig.tab_steps.slice(0, 5)

  const normalizeProfileType = (value?: string | null) => {
    const raw = String(value ?? '').trim().toLowerCase()
    if (!raw) return ''

    const founderValues = ['founder', 'founders', 'founders & companies', 'founders & company', 'company', 'companies', 'startup', 'startups', 'founder/startup']
    const investorValues = ['investor', 'investors', 'vc', 'vcs', 'venture capitalist', 'venture capital', 'fund', 'funds', 'capital']

    if (founderValues.includes(raw)) return 'founder'
    if (investorValues.includes(raw)) return 'investor'
    return raw
  }

  useEffect(() => {
    fetch('/videos/videos.config.json?t=' + Date.now())
      .then(r => r.json())
      .then(cfg => {
        if (cfg.appraisal) {
          setVideoSrc(cfg.appraisal)
          setVideoError(false)
          setVideoReady(false)
        } else {
          setVideoSrc(null)
        }
      })
      .catch(() => {
        setVideoSrc(null)
      })
  }, [])

  useEffect(() => {
    if (!videoSrc) return

    const video = videoRef.current
    if (!video) return

    video.load()
    setVideoReady(false)

    const handleCanPlay = () => {
      setVideoReady(true)
      const playPromise = video.play()
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {
          setVideoReady(true)
        })
      }
    }

    video.addEventListener('canplay', handleCanPlay, { once: true })
    video.addEventListener('error', () => setVideoError(true), { once: true })

    const handleVideoError = () => setVideoError(true)
    video.addEventListener('error', handleVideoError, { once: true })

    return () => {
      video.removeEventListener('canplay', handleCanPlay)
      video.removeEventListener('error', handleVideoError)
    }
  }, [videoSrc])

  useEffect(() => {
    try {
      const form = document.getElementById('cn-onboard-form')
    const steps = Array.from(document.querySelectorAll('.cn-step'))
    const progressSteps = Array.from(document.querySelectorAll('.cn-progress-step'))
    const progressFill = document.getElementById('cn-progress-fill')
    const prevBtn = document.getElementById('cn-prev-btn')
    const nextBtn = document.getElementById('cn-next-btn')
    const submitBtn = document.getElementById('cn-submit-btn')
    const step1Error = document.getElementById('step1-error')
    const profileHidden = document.getElementById('profile_type_hidden')

    let currentStep = 1
    let profileType = ''
    const totalSteps = 5

    const setError = (field: any, msg: string) => {
      const holder = field?.closest('.cn-field') || field?.parentElement
      const error = holder?.querySelector('.cn-error')
      if (field) field.classList.toggle('error', !!msg)
      if (error) error.textContent = msg || ''
    }

    const updateProgress = () => {
      if (progressFill) (progressFill as HTMLElement).style.width = ((currentStep / totalSteps) * 100) + '%'
      progressSteps?.forEach((s: any, i: number) => s.classList.toggle('active', i + 1 <= currentStep))
    }

    const showStep = (step: number) => {
      const normalizedProfileType = normalizeProfileType(profileType)
      steps.forEach((item: any) => {
        item.classList.remove('active')
        const stepNum = Number(item.dataset.step)
        const showFor = item.dataset.show
        const normalizedShowFor = normalizeProfileType(showFor)
        if (stepNum === step && (!showFor || normalizedShowFor === normalizedProfileType)) {
          item.classList.add('active')
        }
      })
      if (prevBtn) (prevBtn as HTMLElement).style.display = step > 1 && step < 5 ? 'block' : 'none'
      if (nextBtn) (nextBtn as HTMLElement).style.display = step < 4 ? 'block' : 'none'
      if (submitBtn) (submitBtn as HTMLElement).style.display = step === 4 ? 'block' : 'none'
      if (step === 5) {
        const nav = document.querySelector('.cn-nav')
        if (nav) (nav as HTMLElement).style.display = 'none'
      }
      updateProgress()
      document.getElementById('cn-onboard')?.scrollIntoView({ behavior: 'smooth' })
    }

    const validateStep = () => {
      const activeStep = document.querySelector('.cn-step.active')
      let valid = true

      if (currentStep === 1) {
        const selected = form?.querySelector('input[name="profile_type"]:checked') as HTMLInputElement
        if (!selected) {
          if (step1Error) step1Error.textContent = 'لطفاً نوع پروفایل را انتخاب کنید'
          return false
        }
        profileType = normalizeProfileType(selected.value)
        if (profileHidden) (profileHidden as HTMLInputElement).value = profileType
        if (step1Error) step1Error.textContent = ''
        return true
      }

      activeStep?.querySelectorAll('[required]').forEach((field: any) => {
        let value = ''
        if (field.type === 'radio') {
          const checked = activeStep.querySelector(`input[name="${field.name}"]:checked`) as HTMLInputElement
          value = checked?.value || ''
        } else if (field.type === 'checkbox') {
          value = field.checked ? field.value : ''
        } else {
          value = String(field.value || '').trim()
        }

        if (!value) {
          setError(field, 'این فیلد الزامی است')
          valid = false
        } else if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          setError(field, 'ایمیل معتبر وارد کنید')
          valid = false
        } else if (field.name === 'phone') {
          // اعتبارسنجی شماره تلفن: ۱۰ تا ۱۵ رقم با یا بدون + و فاصله
          const digits = value.replace(/[\s\-().]/g, '')
          if (!/^\+?[0-9]{10,15}$/.test(digits)) {
            setError(field, 'شماره تماس معتبر نیست (مثال: ۰۹۱۲۱۲۳۴۵۶۷ یا +98912...)')
            valid = false
          } else {
            setError(field, '')
          }
        } else {
          setError(field, '')
        }
      })
      return valid
    }

    form?.querySelectorAll('input[name="profile_type"]').forEach((input: Element) => {
      (input as HTMLInputElement).addEventListener('change', function() {
        profileType = normalizeProfileType((this as HTMLInputElement).value)
        if (profileHidden) (profileHidden as HTMLInputElement).value = profileType
        if (step1Error) step1Error.textContent = ''
      })
    })

    nextBtn?.addEventListener('click', () => {
      if (validateStep()) {
        currentStep = Math.min(currentStep + 1, totalSteps)
        showStep(currentStep)
      }
    })

    prevBtn?.addEventListener('click', () => {
      currentStep = Math.max(currentStep - 1, 1)
      showStep(currentStep)
    })

    const showSuccessStep = (message: string) => {
      const successText = document.getElementById('cn-success-message')
      const successTitle = document.getElementById('cn-success-title')
      const successButton = document.getElementById('cn-success-button')
      if (successText) successText.textContent = message || evalConfig.success_subtitle || 'درخواست شما با موفقیت ارسال شد.'
      if (successTitle) successTitle.textContent = evalConfig.success_title || 'ارسال با موفقیت انجام شد!'
      if (successButton) successButton.textContent = evalConfig.success_btn || 'بازگشت فوری به صفحه اصلی'
      currentStep = 5
      showStep(currentStep)
      setTimeout(() => {
        window.location.href = '/'
      }, 2000)
    }

    form?.addEventListener('submit', async (e: Event) => {
      e.preventDefault()
      if (!validateStep()) return

      if (submitBtn) {
        (submitBtn as HTMLButtonElement).disabled = true
        submitBtn.textContent = 'در حال ارسال...'
      }

      try {
        const fd = new FormData(form as HTMLFormElement)
        const get = (k: string) => (fd.get(k) as string | null) || undefined
        const formProfileType = normalizeProfileType(get('profile_type_hidden') || get('profile_type') || 'founder')

        // آپلود Pitch Deck به Supabase Storage (اگر وجود داشت)
        let deck_url: string | undefined
        const deckFile = (document.getElementById('cn-file-input') as HTMLInputElement)?.files?.[0]
        if (deckFile) {
          const fileName = `${Date.now()}-${deckFile.name}`
          const { data: uploadData, error: uploadError } = await supabase
            .storage
            .from('pitch-decks')
            .upload(fileName, deckFile, { cacheControl: '3600', upsert: false })
          if (!uploadError && uploadData) {
            const { data: urlData } = supabase.storage.from('pitch-decks').getPublicUrl(uploadData.path)
            deck_url = urlData?.publicUrl
          }
        }

        // undefined → null برای سازگاری با Supabase nullable columns
        const n = (v: string | undefined): string | null => v ?? null;
        const leadData = {
          profile_type:     formProfileType as 'founder' | 'investor',
          full_name:        get('full_name') ?? '',
          email:            get('email') ?? '',
          phone:            n(get('phone')),
          linkedin:         n(get('linkedin')),
          company_name:     n(get('company_name')),
          sector:           n(get('sector')),
          stage:            n(get('stage')),
          capital_required: n(get('capital_required')),
          one_liner:        n(get('one_liner')),
          org_name:         n(get('org_name')),
          ticket_size:      n(get('ticket_size')),
          stage_pref:       n(get('stage_pref')),
          geo_pref:         n(get('geo_pref')),
          confidence:       (get('confidence') as 'high' | 'low' | null | undefined) ?? null,
          message:          n(get('message')),
          deck_url:         deck_url ?? null,
          status:           'new' as const,
        }

        const result = await insertLead(leadData)
        if (result) {
          addUserAction(result.id, 'درخواست ارزیابی', 'درخواست ارزیابی با موفقیت ثبت شد.', { source: 'founder_onboarding' })
          showSuccessStep('ارسال با موفقیت انجام شد. تیم ما به زودی با شما تماس می‌گیرد.')
        }
      } catch (error) {
        console.error('Submit error:', error)
        const msg = error instanceof Error ? error.message : String(error)
        alert('خطا در ارسال فرم:\n' + msg)
      } finally {
        if (submitBtn) {
          (submitBtn as HTMLButtonElement).disabled = false
          submitBtn.textContent = 'ارسال نهایی'
        }
      }
    })

    const uploadArea = document.getElementById('cn-upload-area')
    const fileInput = document.getElementById('cn-file-input')
    const filePreview = document.getElementById('cn-file-preview')

    const MAX_UPLOAD_SIZE = 20 * 1024 * 1024
    const handleFile = (file: File) => {
      if (!file || !filePreview) return
      const lowerName = String(file.name || '').toLowerCase()
      if (file.type !== 'application/pdf' || !lowerName.endsWith('.pdf')) {
        filePreview.textContent = 'فقط فایل PDF مجاز است'
        filePreview.classList.add('show')
        if (fileInput) (fileInput as HTMLInputElement).value = ''
        return
      }
      if (file.size > MAX_UPLOAD_SIZE) {
        filePreview.textContent = 'حجم فایل نباید بیشتر از 20MB باشد'
        filePreview.classList.add('show')
        if (fileInput) (fileInput as HTMLInputElement).value = ''
        return
      }
      filePreview.textContent = file.name
      filePreview.classList.add('show')
    }

    uploadArea?.addEventListener('click', () => (fileInput as HTMLInputElement)?.click())
    uploadArea?.addEventListener('dragover', (e: DragEvent) => {
      e.preventDefault()
      uploadArea.classList.add('dragover')
    })
    uploadArea?.addEventListener('dragleave', () => uploadArea.classList.remove('dragover'))
    uploadArea?.addEventListener('drop', (e: DragEvent) => {
      e.preventDefault()
      uploadArea.classList.remove('dragover')
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0]
        if (fileInput) {
          (fileInput as HTMLInputElement).files = e.dataTransfer.files
          handleFile(file)
        }
      }
    })
    fileInput?.addEventListener('change', () => handleFile((fileInput as HTMLInputElement).files?.[0] as File))

    const params = new URLSearchParams(window.location.search)
    currentStep = params.get('sent') === '1' ? 5 : 1
    showStep(currentStep)

    const header = document.getElementById('cn-header')
    const toggle = document.getElementById('cn-menu-toggle')
    const mobileMenu = document.getElementById('cn-mobile-menu')

      window.addEventListener('scroll', () => {
        if (header) header.classList.toggle('scrolled', window.scrollY > 10)
      })
      toggle?.addEventListener('click', () => {
        toggle.classList.toggle('active')
        mobileMenu?.classList.toggle('open')
      })
    } catch (error) {
      console.error('[FounderOnboarding] setup error:', error)
      setHasRenderError(true)
    }
  }, [])

  if (hasRenderError) return <FallbackEvaluationContent evalConfig={evalConfig} />

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: '#030712', isolation: 'isolate' }}>
      {videoSrc && !videoError ? (
        <>
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            onError={() => setVideoError(true)}
            style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0, pointerEvents: 'none', opacity: 1, display: 'block' }}
          >
            <source src={videoSrc} type="video/mp4" />
          </video>
          <div style={{ position: 'fixed', inset: 0, background: 'linear-gradient(135deg, rgba(56,189,248,0.04) 0%, rgba(96,165,250,0.03) 100%)', zIndex: 0, pointerEvents: 'none' }} />
        </>
      ) : (
        <div style={{ position: 'fixed', inset: 0, background: '#eef9ff', zIndex: 0, pointerEvents: 'none' }} />
      )}

    <div className="cn-onboard-wrapper" id="cn-onboard" style={{ position: 'relative', zIndex: 1 }}>
      <div className="cn-progress-wrap">
        <div className="cn-progress-steps">
          <div className="cn-progress-step active">پروفایل</div>
          <div className="cn-progress-step">اطلاعات</div>
          <div className="cn-progress-step">جزئیات</div>
          <div className="cn-progress-step">مستندات</div>
          <div className="cn-progress-step">تأیید</div>
        </div>
        <div className="cn-progress-bar"><div className="cn-progress-fill" id="cn-progress-fill"></div></div>
      </div>
      <div className="cn-form-container">
        <form id="cn-onboard-form" method="post" action="/api/founder-onboarding" encType="multipart/form-data" noValidate>
          <input type="hidden" name="action" value="cn_intake" />
          <input type="hidden" name="profile_type_hidden" id="profile_type_hidden" />
          <div className="cn-step active" data-step="1">
            <StepHeader
              title={evalConfig.step1_title}
              subtitle={evalConfig.step1_subtitle}
              titleLevel={evalConfig.step1_title_level}
              titleAlign={evalConfig.step1_title_align}
              subtitleLevel={evalConfig.step1_subtitle_level}
              subtitleAlign={evalConfig.step1_subtitle_align}
            />
            <div className="cn-profile-select">
              {evalConfig.profile_types.map((profileType) => (
                <label key={profileType.value} className="cn-profile-card">
                  <input type="radio" name="profile_type" value={profileType.value} required />
                  <div className="cn-profile-content">
                    <CardHeading
                      title={profileType.label}
                      level={profileType.label_level}
                      align={profileType.label_align}
                    />
                    {(() => {
                      const SubTag = (profileType.sub_level || 'p') as keyof React.JSX.IntrinsicElements
                      return (
                        <SubTag style={{ margin: 0, textAlign: profileType.sub_align === 'center' ? 'center' : profileType.sub_align === 'left' ? 'left' : 'right' }}>
                          {profileType.sub}
                        </SubTag>
                      )
                    })()}
                  </div>
                </label>
              ))}
            </div>
            <div className="cn-step-error" id="step1-error"></div>
          </div>
          <div className="cn-step" data-step="2">
            <StepHeader
              title={evalConfig.step2_title}
              subtitle={evalConfig.step2_subtitle}
              titleLevel={evalConfig.step2_title_level}
              titleAlign={evalConfig.step2_title_align}
              subtitleLevel={evalConfig.step2_subtitle_level}
              subtitleAlign={evalConfig.step2_subtitle_align}
            />
            <div className="cn-field-grid">
              <div className="cn-field"><label className="cn-label">نام و نام خانوادگی <span>*</span></label><input className="cn-input" name="full_name" type="text" required placeholder="مثل: علی رضایی" /><span className="cn-error"></span></div>
              <div className="cn-field"><label className="cn-label">ایمیل کاری <span>*</span></label><input className="cn-input" name="email" type="email" required placeholder="name@company.com" /><span className="cn-error"></span></div>
              <div className="cn-field"><label className="cn-label">شماره تماس / WhatsApp <span>*</span></label><input className="cn-input" name="phone" type="tel" required placeholder="۰۹۱۲۱۲۳۴۵۶۷ یا +98912..." /><span className="cn-error"></span></div>
              <div className="cn-field"><label className="cn-label">لینکدین / وب‌سایت</label><input className="cn-input" name="linkedin" type="url" placeholder="https://linkedin.com/in/..." /></div>
            </div>
          </div>
          <div className="cn-step" data-step="3" data-show="founder">
            <StepHeader
              title={evalConfig.step3f_title}
              subtitle={evalConfig.step3f_subtitle}
              titleLevel={evalConfig.step3f_title_level}
              titleAlign={evalConfig.step3f_title_align}
              subtitleLevel={evalConfig.step3f_subtitle_level}
              subtitleAlign={evalConfig.step3f_subtitle_align}
            />
            <div className="cn-field-grid">
              <div className="cn-field"><label className="cn-label">نام شرکت <span>*</span></label><input className="cn-input" name="company_name" type="text" required placeholder="نام استارتاپ" /><span className="cn-error"></span></div>
              <div className="cn-field"><label className="cn-label">حوزه فعالیت <span>*</span></label><select className="cn-select" name="sector" required><option value="">انتخاب کنید</option>{evalConfig.sector_options.map((option) => <option key={option} value={option}>{option}</option>)}</select><span className="cn-error"></span></div>
              <div className="cn-field"><label className="cn-label">مرحله فعلی <span>*</span></label><select className="cn-select" name="stage" required><option value="">انتخاب کنید</option>{evalConfig.stage_options.map((option) => <option key={option} value={option}>{option}</option>)}</select><span className="cn-error"></span></div>
              <div className="cn-field"><label className="cn-label">مبلغ سرمایه مورد نیاز <span>*</span></label><select className="cn-select" name="capital_required" required><option value="">انتخاب کنید</option>{evalConfig.capital_options.map((option) => <option key={option} value={option}>{option}</option>)}</select><span className="cn-error"></span></div>
            </div>
            <div className="cn-field"><label className="cn-label">توضیح کوتاه درباره استارتاپ <span>*</span></label><textarea className="cn-textarea" name="one_liner" rows={3} required placeholder="چه مشکلی را برای چه کسی حل می‌کنید؟"></textarea><span className="cn-error"></span></div>
          </div>
          <div className="cn-step" data-step="3" data-show="investor">
            <StepHeader
              title={evalConfig.step3i_title}
              subtitle={evalConfig.step3i_subtitle}
              titleLevel={evalConfig.step3i_title_level}
              titleAlign={evalConfig.step3i_title_align}
              subtitleLevel={evalConfig.step3i_subtitle_level}
              subtitleAlign={evalConfig.step3i_subtitle_align}
            />
            <div className="cn-field-grid">
              <div className="cn-field"><label className="cn-label">نام صندوق / سازمان <span>*</span></label><input className="cn-input" name="org_name" type="text" required placeholder="نام VC یا شرکت" /><span className="cn-error"></span></div>
              <div className="cn-field"><label className="cn-label">Ticket Size معمول <span>*</span></label><select className="cn-select" name="ticket_size" required><option value="">انتخاب کنید</option>{evalConfig.ticket_options.map((option) => <option key={option} value={option}>{option}</option>)}</select><span className="cn-error"></span></div>
              <div className="cn-field"><label className="cn-label">Stage مورد علاقه <span>*</span></label><select className="cn-select" name="stage_pref" required><option value="">انتخاب کنید</option>{evalConfig.stage_pref_options.map((option) => <option key={option} value={option}>{option}</option>)}</select><span className="cn-error"></span></div>
              <div className="cn-field"><label className="cn-label">جغرافیای هدف</label><input className="cn-input" name="geo_pref" type="text" placeholder="مثل: اروپا، MENA، آمریکا" /></div>
            </div>
          </div>
          <div className="cn-step" data-step="4">
            <StepHeader
              title={evalConfig.step4_title}
              subtitle={evalConfig.step4_subtitle}
              titleLevel={evalConfig.step4_title_level}
              titleAlign={evalConfig.step4_title_align}
              subtitleLevel={evalConfig.step4_subtitle_level}
              subtitleAlign={evalConfig.step4_subtitle_align}
            />
            <div className="cn-field">
              <label className="cn-label">آپلود Pitch Deck / Business Plan</label>
              <div className="cn-upload-area" id="cn-upload-area">
                <p className="cn-upload-text">فایل PDF را اینجا رها کنید یا کلیک کنید</p>
                <p className="cn-upload-hint">حداکثر 20MB</p>
                <input type="file" id="cn-file-input" name="deck" accept="application/pdf,.pdf" hidden />
              </div>
              <div className="cn-file-preview" id="cn-file-preview"></div>
            </div>
            <div className="cn-confirm-section">
              <div className="cn-confirm-panel">
                <p><strong>چقدر برای قدم بعدی آماده‌اید؟</strong></p>
                <div className="cn-radio-group">
                  {evalConfig.confidence_options.map((option) => (
                    <label key={option.value} className="cn-radio-item">
                      <input type="radio" name="confidence" value={option.value} required />
                      <div style={{ width: '100%' }}>
                        <CardHeading
                          title={option.label}
                          level={option.label_level}
                          align={option.label_align}
                        />
                        {(() => {
                          const SubTag = (option.sub_level || 'p') as keyof React.JSX.IntrinsicElements
                          return (
                            <SubTag style={{ margin: 0, textAlign: option.sub_align === 'center' ? 'center' : option.sub_align === 'left' ? 'left' : 'right', color: 'inherit' }}>
                              {option.sub}
                            </SubTag>
                          )
                        })()}
                      </div>
                    </label>
                  ))}
                </div>
                <span className="cn-error"></span>
              </div>
              <div className="cn-field">
                <label className="cn-label">توضیحات تکمیلی</label>
                <textarea className="cn-textarea" name="message" rows={4} placeholder="هر نکته مهمی که فکر می‌کنید باید بدانیم..."></textarea>
              </div>
              <div className="cn-confirm-checkbox-panel">
                <label className="cn-confirm-checkbox"><input type="checkbox" name="confirm_accuracy" value="1" required /><span>تأیید می‌کنم اطلاعات ارائه‌شده صحیح است و با قوانین موافقم.</span></label>
                <span className="cn-error"></span>
              </div>
            </div>
          </div>
          <div className="cn-step" data-step="5">
            <div className="cn-success">
              <StepHeader
                title={evalConfig.success_title}
                subtitle={evalConfig.success_subtitle}
                titleLevel={evalConfig.success_title_level}
                titleAlign={evalConfig.success_title_align}
                subtitleLevel={evalConfig.success_subtitle_level}
                subtitleAlign={evalConfig.success_subtitle_align}
              />
              <a href="/" className="cn-btn cn-btn-primary" id="cn-success-button" style={{ textAlign: evalConfig.success_btn_align === 'center' ? 'center' : evalConfig.success_btn_align === 'left' ? 'left' : 'right' }}>{evalConfig.success_btn}</a>
            </div>
          </div>
        </form>
        <div className="cn-nav">
          <button type="button" className="cn-btn cn-btn-secondary" id="cn-prev-btn" style={{ display: 'none' }}>مرحله قبل</button>
          <div className="cn-nav-spacer"></div>
          <button type="button" className="cn-btn cn-btn-primary" id="cn-next-btn">ادامه</button>
          <button type="submit" className="cn-btn cn-btn-submit" id="cn-submit-btn" style={{ display: 'none' }} form="cn-onboard-form">ارسال نهایی</button>
        </div>
      </div>
    </div>
    </div>
  )
}
