/**
 * Enterprise Testimonial Card Component
 * Customer testimonials with ratings
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote, Linkedin, Globe } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Testimonial } from '../../types/process';
import { Avatar } from '../ui/Avatar';

export interface TestimonialCardProps {
  testimonial: Testimonial;
  variant?: 'default' | 'compact' | 'featured';
  className?: string;
}

export const TestimonialCard: React.FC<TestimonialCardProps> = ({
  testimonial,
  variant = 'default',
  className,
}) => {
  const renderStars = () => {
    const stars = [];
    const maxRating = testimonial.maxRating || 5;
    
    for (let i = 1; i <= maxRating; i++) {
      stars.push(
        <Star
          key={i}
          className={cn(
            'w-4 h-4',
            i <= testimonial.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-600'
          )}
        />
      );
    }
    
    return stars;
  };

  const renderDefault = () => (
    <motion.div
      className={cn(
        'card-glass rounded-2xl p-6',
        testimonial.featured && 'border-2 border-amber-500/30',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      {testimonial.featured && (
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-amber-500/20 rounded-full text-amber-400 text-xs font-semibold">
            ویژه
          </span>
        </div>
      )}
      
      <div className="flex items-start gap-4 mb-4">
        <Avatar
          src={testimonial.avatar?.url}
          alt={testimonial.name}
          size="lg"
          fallback={testimonial.name}
        />
        <div className="flex-1">
          <h4 className="text-white font-bold">{testimonial.name}</h4>
          <p className="text-gray-400 text-sm">{testimonial.title}</p>
          <p className="text-gray-500 text-xs">{testimonial.company}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-1 mb-4">
        {renderStars()}
      </div>
      
      <div className="relative mb-4">
        <Quote className="absolute -top-2 -right-2 w-8 h-8 text-indigo-500/20" />
        <p className="text-gray-300 text-sm leading-relaxed pr-6">
          {testimonial.text}
        </p>
      </div>
      
      <div className="flex items-center gap-3 pt-4 border-t border-gray-800/50">
        {testimonial.linkedinUrl && (
          <a
            href={testimonial.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors text-gray-400 hover:text-blue-400"
          >
            <Linkedin className="w-4 h-4" />
          </a>
        )}
        {testimonial.websiteUrl && (
          <a
            href={testimonial.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors text-gray-400 hover:text-white"
          >
            <Globe className="w-4 h-4" />
          </a>
        )}
        {testimonial.projectType && (
          <span className="text-gray-500 text-xs mr-auto">
            پروژه: {testimonial.projectType}
          </span>
        )}
      </div>
    </motion.div>
  );

  const renderCompact = () => (
    <motion.div
      className={cn(
        'bg-gray-900/50 rounded-xl p-4 border border-gray-800',
        className
      )}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center gap-3 mb-2">
        <Avatar
          src={testimonial.avatar?.url}
          alt={testimonial.name}
          size="sm"
          fallback={testimonial.name}
        />
        <div className="flex-1 min-w-0">
          <h4 className="text-white font-semibold text-sm truncate">{testimonial.name}</h4>
          <p className="text-gray-500 text-xs truncate">{testimonial.company}</p>
        </div>
        <div className="flex items-center gap-0.5">
          {renderStars().slice(0, 3)}
        </div>
      </div>
      <p className="text-gray-400 text-xs line-clamp-2">{testimonial.text}</p>
    </motion.div>
  );

  const renderFeatured = () => (
    <motion.div
      className={cn(
        'relative rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-cyan-500/10 border-2 border-indigo-500/30',
        className
      )}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5" />
      
      <div className="relative p-8">
        <div className="flex items-center gap-2 mb-4">
          <Quote className="w-8 h-8 text-indigo-400" />
          <div className="flex items-center gap-1">
            {renderStars()}
          </div>
        </div>
        
        <p className="text-white text-lg leading-relaxed mb-6 font-medium">
          {testimonial.text}
        </p>
        
        <div className="flex items-center gap-4">
          <Avatar
            src={testimonial.avatar?.url}
            alt={testimonial.name}
            size="xl"
            fallback={testimonial.name}
          />
          <div>
            <h4 className="text-white font-bold text-lg">{testimonial.name}</h4>
            <p className="text-gray-400">{testimonial.title}</p>
            <p className="text-indigo-400 font-semibold">{testimonial.company}</p>
          </div>
        </div>
        
        {testimonial.projectType && (
          <div className="mt-4 pt-4 border-t border-gray-700/50">
            <span className="text-gray-500 text-sm">پروژه: </span>
            <span className="text-white font-semibold">{testimonial.projectType}</span>
          </div>
        )}
      </div>
    </motion.div>
  );

  switch (variant) {
    case 'compact':
      return renderCompact();
    case 'featured':
      return renderFeatured();
    default:
      return renderDefault();
  }
};
