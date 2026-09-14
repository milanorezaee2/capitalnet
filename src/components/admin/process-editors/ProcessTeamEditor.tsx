/**
 * Process Team Section Editor
 */

import { useState } from 'react';
import { Plus, Trash2, Users } from 'lucide-react';

interface ProcessTeamEditorProps {
  onSave: () => void;
  hasChanges: boolean;
  setHasChanges: (value: boolean) => void;
}

export default function ProcessTeamEditor({ hasChanges, setHasChanges }: ProcessTeamEditorProps) {
  const [teamData, setTeamData] = useState({
    enabled: true,
    title: 'تیم پروژه',
    description: 'متخصصان و اعضای تیم اجرایی پروژه شما',
    roles: [
      {
        id: 'team-1',
        name: 'علی محمدی',
        title: 'مدیر پروژه',
        role: 'Project Manager',
        expertise: ['مدیریت پروژه', 'Agile', 'Scrum'],
      },
    ],
  });

  const handleChange = (path: string, value: any) => {
    setTeamData(prev => {
      const newData = { ...prev };
      const keys = path.split('.');
      let current: any = newData;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newData;
    });
    setHasChanges(true);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-800">فعال/غیرفعال کردن بخش</h3>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={teamData.enabled}
              onChange={(e) => handleChange('enabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600" />
          </label>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-cyan-600" />
            <h3 className="text-lg font-bold text-gray-800">اعضای تیم</h3>
          </div>
          <button className="flex items-center gap-2 text-cyan-600 hover:text-cyan-700 font-medium">
            <Plus className="w-4 h-4" />
            افزودن عضو
          </button>
        </div>
        
        <div className="space-y-4">
          {teamData.roles.map((member, index) => (
            <div key={member.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-gray-800">عضو {index + 1}</span>
                <button className="p-1 text-red-500 hover:text-red-700">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">نام</label>
                  <input
                    type="text"
                    value={member.name}
                    onChange={(e) => {
                      const newRoles = [...teamData.roles];
                      newRoles[index].name = e.target.value;
                      handleChange('roles', newRoles);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">عنوان</label>
                  <input
                    type="text"
                    value={member.title}
                    onChange={(e) => {
                      const newRoles = [...teamData.roles];
                      newRoles[index].title = e.target.value;
                      handleChange('roles', newRoles);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
