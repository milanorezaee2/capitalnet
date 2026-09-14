/**
 * Enterprise Team Card Component
 * Team member information and roles
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Linkedin, Mail, MapPin } from 'lucide-react';
import { cn } from '../../lib/utils';
import { TeamRole } from '../../types/process';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Tag } from '../ui/Tag';

export interface TeamCardProps {
  member: TeamRole;
  variant?: 'default' | 'compact';
  className?: string;
}

export const TeamCard: React.FC<TeamCardProps> = ({
  member,
  variant = 'default',
  className,
}) => {
  const renderDefault = () => (
    <motion.div
      className={cn(
        'card-glass rounded-2xl p-6 text-center',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-center mb-4">
        <Avatar
          src={member.avatar?.url}
          alt={member.name}
          size="xl"
          fallback={member.name}
        />
      </div>
      
      <h3 className="text-white font-bold text-lg mb-1">{member.name}</h3>
      <p className="text-indigo-400 font-semibold text-sm mb-1">{member.title}</p>
      <p className="text-gray-500 text-sm mb-4">{member.role}</p>
      
      {member.expertise && member.expertise.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {member.expertise.slice(0, 3).map((skill, index) => (
            <Tag key={index} text={skill} size="sm" variant="primary" />
          ))}
          {member.expertise.length > 3 && (
            <span className="text-gray-500 text-xs">+{member.expertise.length - 3}</span>
          )}
        </div>
      )}
      
      <div className="flex justify-center gap-2">
        {member.linkedinUrl && (
          <a
            href={member.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg bg-gray-800/50 hover:bg-blue-500/20 transition-colors text-gray-400 hover:text-blue-400"
          >
            <Linkedin className="w-4 h-4" />
          </a>
        )}
        {member.email && (
          <a
            href={`mailto:${member.email}`}
            className="p-2 rounded-lg bg-gray-800/50 hover:bg-emerald-500/20 transition-colors text-gray-400 hover:text-emerald-400"
          >
            <Mail className="w-4 h-4" />
          </a>
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
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ x: 4 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center gap-3">
        <Avatar
          src={member.avatar?.url}
          alt={member.name}
          size="md"
          fallback={member.name}
        />
        <div className="flex-1 min-w-0">
          <h4 className="text-white font-semibold text-sm">{member.name}</h4>
          <p className="text-gray-400 text-xs">{member.title}</p>
        </div>
        <Badge text={member.role} variant="secondary" size="sm" />
      </div>
    </motion.div>
  );

  return variant === 'compact' ? renderCompact() : renderDefault();
};
