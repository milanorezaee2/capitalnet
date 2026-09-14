/**
 * Enterprise Process Page
 * Main page component integrating all process sections
 */

import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  CheckCircle, 
  Clock, 
  Users, 
  Award, 
  TrendingUp,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileText,
  Code,
  Palette,
  BarChart
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { ProcessPage as ProcessPageType } from '../../types/process';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { StepCard } from '../../components/process/StepCard';
import { Timeline } from '../../components/process/Timeline';
import { WorkflowDiagram } from '../../components/process/WorkflowDiagram';
import { DeliverableCard } from '../../components/process/DeliverableCard';
import { StatisticCard } from '../../components/process/StatisticCard';
import { TestimonialCard } from '../../components/process/TestimonialCard';
import { TeamCard } from '../../components/process/TeamCard';
import { Accordion } from '../../components/process/FAQ';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';

import { t } from '@/i18n';


export interface ProcessPageProps {
  data: ProcessPageType;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
}

export const ProcessPage: React.FC<ProcessPageProps> = ({
  data,
  loading = false,
  error,
  onRetry,
}) => {
  if (loading) {
    return <LoadingState message={t("در حال بارگذاری صفحه فرآیند...")} />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={onRetry} />;
  }

  // SEO is handled by App.tsx with useSEO hook

  const renderHero = () => {
    if (!data.hero.enabled) return null;

    return (
      <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />
        <div
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%239C92AC\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          }}
        />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {data.hero.badge.enabled && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-6"
              >
                <Badge
                  text={data.hero.badge.text}
                  variant={data.hero.badge.variant}
                  size="lg"
                />
              </motion.div>
            )}
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                {data.hero.title}
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-4 max-w-3xl mx-auto">
              {data.hero.subtitle}
            </p>
            
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
              {data.hero.description}
            </p>
            
            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Button
                variant="primary"
                size="lg"
                icon={<ArrowRight className="w-5 h-5" />}
                iconPosition="left"
              >
                {data.hero.primaryCTA.text}
              </Button>
              {data.hero.secondaryCTA && (
                <Button
                  variant="outline"
                  size="lg"
                >
                  {data.hero.secondaryCTA.text}
                </Button>
              )}
            </motion.div>
            
            {data.hero.statistics && data.hero.statistics.enabled && (
              <motion.div
                className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                {data.hero.statistics.items.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                      {stat.prefix}{stat.value}{stat.suffix}
                    </div>
                    <div className="text-gray-400 text-sm">{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>
    );
  };

  const renderOverview = () => {
    if (!data.overview.enabled) return null;

    return (
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {data.overview.title}
            </h2>
            <p className="text-gray-400 max-w-3xl mx-auto">
              {data.overview.description}
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h3 className="text-xl font-bold text-white mb-4">{t("اهداف فرآیند")}</h3>
              <ul className="space-y-3">
                {data.overview.objectives.map((objective, index) => (
                  <li key={index} className="flex items-start gap-3 text-gray-300">
                    <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-1" />
                    {objective}
                  </li>
                ))}
              </ul>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h3 className="text-xl font-bold text-white mb-4">{t("مزایا")}</h3>
              <ul className="space-y-3">
                {data.overview.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3 text-gray-300">
                    <Award className="w-5 h-5 text-amber-400 flex-shrink-0 mt-1" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
          
          <motion.div
            className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-2xl p-8 border border-indigo-500/20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="text-xl font-bold text-white mb-2">{t("ارزش افزوده برای شما")}</h3>
            <p className="text-gray-300">{data.overview.valueProposition}</p>
          </motion.div>
        </div>
      </section>
    );
  };

  const renderTimeline = () => {
    if (!data.timeline.enabled) return null;

    return (
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {data.timeline.title}
            </h2>
            <p className="text-gray-400 max-w-3xl mx-auto">
              {data.timeline.description}
            </p>
          </motion.div>
          
          <Timeline
            steps={data.timeline.steps}
            variant={data.timeline.variant}
          />
        </div>
      </section>
    );
  };

  const renderWorkflow = () => {
    if (!data.workflow.enabled) return null;

    return (
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {data.workflow.title}
            </h2>
            <p className="text-gray-400 max-w-3xl mx-auto">
              {data.workflow.description}
            </p>
          </motion.div>
          
          <WorkflowDiagram
            workflow={data.workflow}
            interactive={true}
          />
        </div>
      </section>
    );
  };

  const renderDeliverables = () => {
    if (!data.deliverables.enabled) return null;

    return (
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {data.deliverables.title}
            </h2>
            <p className="text-gray-400 max-w-3xl mx-auto">
              {data.deliverables.description}
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.deliverables.deliverables.map((deliverable) => (
              <DeliverableCard
                key={deliverable.id}
                deliverable={deliverable}
              />
            ))}
          </div>
        </div>
      </section>
    );
  };

  const renderTimelineSchedule = () => {
    if (!data.timelineSchedule.enabled) return null;

    return (
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {data.timelineSchedule.title}
            </h2>
            <p className="text-gray-400 max-w-3xl mx-auto">
              {data.timelineSchedule.description}
            </p>
          </motion.div>
          
          <div className="bg-gray-900/50 rounded-2xl p-8 border border-gray-800">
            <div className="flex items-center justify-center gap-8 mb-8">
              <div className="text-center">
                <Clock className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{data.timelineSchedule.totalDuration}</div>
                <div className="text-gray-400 text-sm">{t("مدت کل پروژه")}</div>
              </div>
            </div>
            
            <div className="space-y-4">
              {data.timelineSchedule.phases.map((phase, index) => (
                <motion.div
                  key={phase.id}
                  className="relative pe-8"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="absolute end-0 top-0 w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                    {index + 1}
                  </div>
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-white font-semibold">{phase.name}</h4>
                      <Badge text={phase.duration} variant="primary" size="sm" />
                    </div>
                    {phase.milestone && (
                      <div className="flex items-center gap-2 text-amber-400 text-sm">
                        <Award className="w-4 h-4" />
                        {t("نقطه عطف مهم")}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  };

  const renderTeam = () => {
    if (!data.team.enabled) return null;

    return (
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {data.team.title}
            </h2>
            <p className="text-gray-400 max-w-3xl mx-auto">
              {data.team.description}
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {data.team.roles.map((member) => (
              <TeamCard
                key={member.id}
                member={member}
              />
            ))}
          </div>
        </div>
      </section>
    );
  };

  const renderTechnologies = () => {
    if (!data.technologies.enabled) return null;

    return (
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {data.technologies.title}
            </h2>
            <p className="text-gray-400 max-w-3xl mx-auto">
              {data.technologies.description}
            </p>
          </motion.div>
          
          <div className="space-y-8">
            {data.technologies.categories.map((category) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h3 className="text-xl font-bold text-white mb-4">{category.name}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {category.technologies.map((tech) => (
                    <Card
                      key={tech.id}
                      variant="glass"
                      hover={true}
                      className="p-4 text-center"
                    >
                      {tech.icon && (
                        <div className="text-3xl mb-2">{tech.icon}</div>
                      )}
                      <div className="text-white font-semibold text-sm">{tech.name}</div>
                      {tech.version && (
                        <div className="text-gray-500 text-xs">{tech.version}</div>
                      )}
                    </Card>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  const renderQualityAssurance = () => {
    if (!data.qualityAssurance.enabled) return null;

    return (
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {data.qualityAssurance.title}
            </h2>
            <p className="text-gray-400 max-w-3xl mx-auto">
              {data.qualityAssurance.description}
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.qualityAssurance.processes.map((process, index) => (
              <motion.div
                key={process.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card variant="glass" className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                    </div>
                    <h4 className="text-white font-semibold">{process.name}</h4>
                  </div>
                  <p className="text-gray-400 text-sm mb-4">{process.description}</p>
                  {process.tools && process.tools.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {process.tools.map((tool, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-gray-800/50 rounded text-gray-400 text-xs"
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  const renderStatistics = () => {
    if (!data.statistics.enabled) return null;

    return (
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {data.statistics.title}
            </h2>
            <p className="text-gray-400 max-w-3xl mx-auto">
              {data.statistics.description}
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {data.statistics.statistics.map((statistic, index) => (
              <StatisticCard
                key={statistic.id}
                statistic={statistic}
                animate={true}
              />
            ))}
          </div>
        </div>
      </section>
    );
  };

  const renderTestimonials = () => {
    if (!data.testimonials.enabled) return null;

    return (
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {data.testimonials.title}
            </h2>
            <p className="text-gray-400 max-w-3xl mx-auto">
              {data.testimonials.description}
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.testimonials.testimonials.map((testimonial) => (
              <TestimonialCard
                key={testimonial.id}
                testimonial={testimonial}
                variant={testimonial.featured ? 'featured' : 'default'}
              />
            ))}
          </div>
        </div>
      </section>
    );
  };

  const renderFAQ = () => {
    if (!data.faq.enabled) return null;

    return (
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {data.faq.title}
            </h2>
            <p className="text-gray-400 max-w-3xl mx-auto">
              {data.faq.description}
            </p>
          </motion.div>
          
          <Accordion
            items={data.faq.faqs}
            allowMultiple={true}
          />
        </div>
      </section>
    );
  };

  const renderCTA = () => {
    if (!data.cta.enabled) return null;

    return (
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className={cn(
              'rounded-2xl p-12 text-center',
              data.cta.background?.type === 'gradient'
                ? 'bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-cyan-500/20 border border-indigo-500/30'
                : 'bg-gray-900/50 border border-gray-800'
            )}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {data.cta.title}
            </h2>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              {data.cta.description}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                variant="primary"
                size="lg"
                icon={<ArrowRight className="w-5 h-5" />}
                iconPosition="left"
              >
                {data.cta.primaryCTA.text}
              </Button>
              {data.cta.secondaryCTA && (
                <Button
                  variant="outline"
                  size="lg"
                >
                  {data.cta.secondaryCTA.text}
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    );
  };

  const renderContact = () => {
    if (!data.contact.enabled) return null;

    return (
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {data.contact.title}
            </h2>
            <p className="text-gray-400 max-w-3xl mx-auto">
              {data.contact.description}
            </p>
          </motion.div>
          
          <div className="grid lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card variant="glass" className="p-8">
                <form className="space-y-6">
                  {data.contact.form.fields.map((field) => (
                    <div key={field.id}>
                      <label className="block text-white font-semibold mb-2">
                        {field.label}
                        {field.required && <span className="text-red-400 me-1">*</span>}
                      </label>
                      {field.type === 'textarea' ? (
                        <textarea
                          name={field.name}
                          placeholder={field.placeholder}
                          required={field.required}
                          className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                          rows={4}
                        />
                      ) : (
                        <input
                          type={field.type}
                          name={field.name}
                          placeholder={field.placeholder}
                          required={field.required}
                          className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                      )}
                    </div>
                  ))}
                  
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full"
                  >
                    {data.contact.form.submitButton.text}
                  </Button>
                  
                  {data.contact.form.privacyPolicy && (
                    <p className="text-gray-500 text-xs text-center">
                      {data.contact.form.privacyPolicy}
                    </p>
                  )}
                </form>
              </Card>
            </motion.div>
            
            <motion.div
 className="space-y-6"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              {data.contact.contactInfo && data.contact.contactInfo.map((info) => (
                <Card key={info.id} variant="glass" className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center">
                      {info.type === 'email' && <Mail className="w-6 h-6 text-indigo-400" />}
                      {info.type === 'phone' && <Phone className="w-6 h-6 text-indigo-400" />}
                      {info.type === 'address' && <MapPin className="w-6 h-6 text-indigo-400" />}
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">{info.label}</h4>
                      <p className="text-gray-400">{info.value}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </motion.div>
          </div>
        </div>
      </section>
    );
  };

  const renderRelatedServices = () => {
    if (!data.relatedServices.enabled) return null;

    return (
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {data.relatedServices.title}
            </h2>
            <p className="text-gray-400 max-w-3xl mx-auto">
              {data.relatedServices.description}
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.relatedServices.items.map((item) => (
              <Card key={item.id} variant="glass" hover={true} className="overflow-hidden">
                {item.image && (
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={item.image.url}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <Badge text={item.category || item.type} variant="primary" size="sm" className="mb-3" />
                  <h3 className="text-white font-bold text-lg mb-2">{item.title}</h3>
                  <p className="text-gray-400 text-sm line-clamp-2">{item.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  };

  const renderRelatedBlog = () => {
    if (!data.relatedBlog.enabled) return null;

    return (
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {data.relatedBlog.title}
            </h2>
            <p className="text-gray-400 max-w-3xl mx-auto">
              {data.relatedBlog.description}
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.relatedBlog.items.map((item) => (
              <Card key={item.id} variant="glass" hover={true} className="overflow-hidden">
                {item.image && (
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={item.image.url}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3 text-gray-500 text-xs">
                    <Calendar className="w-4 h-4" />
                    {item.date}
                    {item.readTime && <span>• {item.readTime}</span>}
                  </div>
                  <h3 className="text-white font-bold text-lg mb-2">{item.title}</h3>
                  <p className="text-gray-400 text-sm line-clamp-2">{item.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  };

  const renderNewsletter = () => {
    if (!data.newsletter.enabled) return null;

    return (
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-cyan-500/10 rounded-2xl p-12 text-center border border-indigo-500/20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {data.newsletter.title}
            </h2>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              {data.newsletter.description}
            </p>
            
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder={data.newsletter.form.emailPlaceholder}
                className="flex-1 bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <Button variant="primary" size="lg">
                {data.newsletter.form.submitButton.text}
              </Button>
            </form>
            
            {data.newsletter.form.privacyPolicy && (
              <p className="text-gray-500 text-xs mt-4">
                {data.newsletter.form.privacyPolicy}
              </p>
            )}
          </motion.div>
        </div>
      </section>
    );
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {renderHero()}
      {renderOverview()}
      {renderTimeline()}
      {renderWorkflow()}
      {renderDeliverables()}
      {renderTimelineSchedule()}
      {renderTeam()}
      {renderTechnologies()}
      {renderQualityAssurance()}
      {renderStatistics()}
      {renderTestimonials()}
      {renderFAQ()}
      {renderCTA()}
      {renderContact()}
      {renderRelatedServices()}
      {renderRelatedBlog()}
      {renderNewsletter()}
    </div>
  );
};
