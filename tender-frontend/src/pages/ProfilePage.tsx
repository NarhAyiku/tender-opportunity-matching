import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import {
  ChevronRight,
  Briefcase,
  GraduationCap,
  Code,
  Globe,
  Award,
  FileText,
  Plus,
  Trash2,
} from 'lucide-react';
import { useAuthStore } from '../stores';
import { usersApi, filesApi } from '../api';
import { AppLayout } from '../components/layout';
import { ProfileHeader } from '../components/profile';
import { Button, Input, Card, Spinner } from '../components/common';
import { WorkExperience, EducationEntry, ProfileUpdateRequest } from '../types';

type EditSection = 'basic' | 'work' | 'education' | 'skills' | null;

export function ProfilePage() {
  const { user, fetchUser } = useAuthStore();
  const [editSection, setEditSection] = useState<EditSection>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form states
  const [basicInfo, setBasicInfo] = useState({
    name: '',
    headline: '',
    bio: '',
    phone: '',
    linkedin_url: '',
    github_url: '',
    portfolio_url: '',
  });

  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');

  const [workExperiences, setWorkExperiences] = useState<WorkExperience[]>([]);
  const [educationEntries, setEducationEntries] = useState<EducationEntry[]>([]);

  useEffect(() => {
    if (user) {
      setBasicInfo({
        name: user.name || '',
        headline: user.headline || '',
        bio: user.bio || '',
        phone: user.phone || '',
        linkedin_url: user.linkedin_url || '',
        github_url: user.github_url || '',
        portfolio_url: user.portfolio_url || '',
      });
      setSkills(user.skills || []);
      setWorkExperiences(user.work_experiences || []);
      setEducationEntries(user.education_entries || []);
    }
  }, [user]);

  const handleSave = async (data: ProfileUpdateRequest) => {
    setIsLoading(true);
    setMessage(null);
    try {
      await usersApi.updateMe(data);
      await fetchUser();
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setEditSection(null);
    } catch {
      setMessage({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBasicSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleSave(basicInfo);
  };

  const handleSkillsSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleSave({ skills });
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleWorkSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleSave({ work_experiences: workExperiences });
  };

  const addWorkExperience = () => {
    setWorkExperiences([
      ...workExperiences,
      {
        title: '',
        company: '',
        location: '',
        start_date: '',
        end_date: '',
        is_current: false,
        bullets: [],
      },
    ]);
  };

  const updateWorkExperience = (index: number, field: keyof WorkExperience, value: string | boolean | string[]) => {
    const updated = [...workExperiences];
    updated[index] = { ...updated[index], [field]: value };
    setWorkExperiences(updated);
  };

  const removeWorkExperience = (index: number) => {
    setWorkExperiences(workExperiences.filter((_, i) => i !== index));
  };

  const handleEducationSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleSave({ education_entries: educationEntries });
  };

  const addEducation = () => {
    setEducationEntries([
      ...educationEntries,
      { institution: '', degree_type: '', field: '', start_date: '', end_date: '' },
    ]);
  };

  const updateEducation = (index: number, field: keyof EducationEntry, value: string) => {
    const updated = [...educationEntries];
    updated[index] = { ...updated[index], [field]: value };
    setEducationEntries(updated);
  };

  const removeEducation = (index: number) => {
    setEducationEntries(educationEntries.filter((_, i) => i !== index));
  };

  const handleResumeUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setMessage(null);
    try {
      await filesApi.uploadResume(file);
      await fetchUser();
      setMessage({ type: 'success', text: 'Resume uploaded successfully!' });
    } catch {
      setMessage({ type: 'error', text: 'Failed to upload resume' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-screen">
          <Spinner size="lg" />
        </div>
      </AppLayout>
    );
  }

  const sections = [
    { id: 'basic', icon: Globe, label: 'Basic Info', desc: 'Name, bio, contact' },
    { id: 'work', icon: Briefcase, label: 'Work Experience', desc: `${workExperiences.length} entries` },
    { id: 'education', icon: GraduationCap, label: 'Education', desc: `${educationEntries.length} entries` },
    { id: 'skills', icon: Code, label: 'Skills', desc: `${skills.length} skills` },
  ];

  return (
    <AppLayout>
      <div className="max-w-lg mx-auto px-4 py-6 pb-24">
        <ProfileHeader user={user} />

        {message && (
          <div
            className={`mb-4 p-3 rounded-lg text-sm ${
              message.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Resume upload */}
        <Card className="mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Resume</p>
                <p className="text-sm text-gray-500">
                  {user.cv_filename || 'No resume uploaded'}
                </p>
              </div>
            </div>
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleResumeUpload}
                className="hidden"
              />
              <span className="text-primary-600 font-medium text-sm hover:underline">
                {user.cv_filename ? 'Update' : 'Upload'}
              </span>
            </label>
          </div>
        </Card>

        {/* Section list */}
        {editSection === null && (
          <Card padding="none">
            {sections.map(({ id, icon: Icon, label, desc }, index) => (
              <button
                key={id}
                onClick={() => setEditSection(id as EditSection)}
                className={`w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${
                  index > 0 ? 'border-t border-gray-100' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Icon className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">{label}</p>
                    <p className="text-sm text-gray-500">{desc}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            ))}
          </Card>
        )}

        {/* Basic Info Edit */}
        {editSection === 'basic' && (
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Basic Info</h2>
              <button
                onClick={() => setEditSection(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
            <form onSubmit={handleBasicSubmit} className="space-y-4">
              <Input
                label="Full Name"
                value={basicInfo.name}
                onChange={(e) => setBasicInfo({ ...basicInfo, name: e.target.value })}
                placeholder="John Doe"
              />
              <Input
                label="Headline"
                value={basicInfo.headline}
                onChange={(e) => setBasicInfo({ ...basicInfo, headline: e.target.value })}
                placeholder="Software Engineer at Google"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                  value={basicInfo.bio}
                  onChange={(e) => setBasicInfo({ ...basicInfo, bio: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  rows={3}
                  placeholder="Tell us about yourself..."
                />
              </div>
              <Input
                label="Phone"
                type="tel"
                value={basicInfo.phone}
                onChange={(e) => setBasicInfo({ ...basicInfo, phone: e.target.value })}
                placeholder="+1 (555) 123-4567"
              />
              <Input
                label="LinkedIn URL"
                value={basicInfo.linkedin_url}
                onChange={(e) => setBasicInfo({ ...basicInfo, linkedin_url: e.target.value })}
                placeholder="https://linkedin.com/in/username"
              />
              <Input
                label="GitHub URL"
                value={basicInfo.github_url}
                onChange={(e) => setBasicInfo({ ...basicInfo, github_url: e.target.value })}
                placeholder="https://github.com/username"
              />
              <Input
                label="Portfolio URL"
                value={basicInfo.portfolio_url}
                onChange={(e) => setBasicInfo({ ...basicInfo, portfolio_url: e.target.value })}
                placeholder="https://yourportfolio.com"
              />
              <Button type="submit" className="w-full" isLoading={isLoading}>
                Save Changes
              </Button>
            </form>
          </Card>
        )}

        {/* Skills Edit */}
        {editSection === 'skills' && (
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Skills</h2>
              <button
                onClick={() => setEditSection(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
            <form onSubmit={handleSkillsSubmit} className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add a skill..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSkill();
                    }
                  }}
                />
                <Button type="button" onClick={addSkill} variant="secondary">
                  <Plus size={20} />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="hover:text-red-600"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
              <Button type="submit" className="w-full" isLoading={isLoading}>
                Save Skills
              </Button>
            </form>
          </Card>
        )}

        {/* Work Experience Edit */}
        {editSection === 'work' && (
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Work Experience</h2>
              <button
                onClick={() => setEditSection(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
            <form onSubmit={handleWorkSubmit} className="space-y-4">
              {workExperiences.map((exp, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium text-sm text-gray-500">Experience {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeWorkExperience(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <Input
                    label="Job Title"
                    value={exp.title}
                    onChange={(e) => updateWorkExperience(index, 'title', e.target.value)}
                    placeholder="Software Engineer"
                  />
                  <Input
                    label="Company"
                    value={exp.company}
                    onChange={(e) => updateWorkExperience(index, 'company', e.target.value)}
                    placeholder="Company Name"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Start Date"
                      type="month"
                      value={exp.start_date}
                      onChange={(e) => updateWorkExperience(index, 'start_date', e.target.value)}
                    />
                    <Input
                      label="End Date"
                      type="month"
                      value={exp.end_date || ''}
                      onChange={(e) => updateWorkExperience(index, 'end_date', e.target.value)}
                      disabled={exp.is_current}
                    />
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={exp.is_current}
                      onChange={(e) => updateWorkExperience(index, 'is_current', e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    Currently working here
                  </label>
                </div>
              ))}
              <Button type="button" onClick={addWorkExperience} variant="outline" className="w-full">
                <Plus size={16} className="mr-2" /> Add Experience
              </Button>
              <Button type="submit" className="w-full" isLoading={isLoading}>
                Save Work Experience
              </Button>
            </form>
          </Card>
        )}

        {/* Education Edit */}
        {editSection === 'education' && (
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Education</h2>
              <button
                onClick={() => setEditSection(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
            <form onSubmit={handleEducationSubmit} className="space-y-4">
              {educationEntries.map((edu, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium text-sm text-gray-500">Education {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeEducation(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <Input
                    label="Institution"
                    value={edu.institution}
                    onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                    placeholder="University Name"
                  />
                  <Input
                    label="Degree Type"
                    value={edu.degree_type}
                    onChange={(e) => updateEducation(index, 'degree_type', e.target.value)}
                    placeholder="Bachelor's, Master's, etc."
                  />
                  <Input
                    label="Field of Study"
                    value={edu.field}
                    onChange={(e) => updateEducation(index, 'field', e.target.value)}
                    placeholder="Computer Science"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Start Year"
                      value={edu.start_date || ''}
                      onChange={(e) => updateEducation(index, 'start_date', e.target.value)}
                      placeholder="2020"
                    />
                    <Input
                      label="End Year"
                      value={edu.end_date || ''}
                      onChange={(e) => updateEducation(index, 'end_date', e.target.value)}
                      placeholder="2024"
                    />
                  </div>
                </div>
              ))}
              <Button type="button" onClick={addEducation} variant="outline" className="w-full">
                <Plus size={16} className="mr-2" /> Add Education
              </Button>
              <Button type="submit" className="w-full" isLoading={isLoading}>
                Save Education
              </Button>
            </form>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
