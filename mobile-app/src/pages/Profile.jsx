import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import useFileUpload from '../lib/useFileUpload';
import { Modal, ExperienceForm, EducationForm, SkillsForm } from '../components/ProfileForms';
import {
  Settings, Plus, ChevronDown, ChevronUp, Pencil, FileText,
  Briefcase, GraduationCap, FolderOpen, Globe, Award, Heart,
  Sparkles, Loader2, LogOut, User, Mail, MapPin, Linkedin, Github, Globe as GlobeIcon
} from 'lucide-react';

// Tab components
function ResumeTab({ profile, onUpdateProfile }) {
  const [expandedSections, setExpandedSections] = useState({
    experiences: true,
    education: true,
    projects: true,
    languages: false,
    skills: true,
    interests: false,
    awards: false
  });

  const [activeModal, setActiveModal] = useState(null);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleSaveExperience = async (data) => {
    const current = profile.work_experiences || [];
    const updated = [...current, { ...data, id: Date.now() }];
    await onUpdateProfile('work_experiences', updated);
    setActiveModal(null);
  };

  const handleSaveEducation = async (data) => {
    const current = profile.education_entries || [];
    const updated = [...current, { ...data, id: Date.now() }];
    await onUpdateProfile('education_entries', updated);
    setActiveModal(null);
  };

  const handleSaveSkills = async (newSkills) => {
    // Unique skills
    const current = profile.skills || [];
    const combined = [...new Set([...current, ...newSkills])];
    await onUpdateProfile('skills', combined);
    setActiveModal(null);
  };

  const Section = ({ id, title, icon: Icon, count, children, onAdd }) => (
    <div className="glass-card p-4 rounded-2xl space-y-3 animate-in fade-in duration-500">
      <div
        onClick={() => toggleSection(id)}
        className="w-full flex items-center justify-between cursor-pointer"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && toggleSection(id)}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-50 rounded-lg">
            <Icon className="w-5 h-5 text-purple-600" />
          </div>
          <span className="font-bold text-slate-800">{title}</span>
          {count > 0 && (
            <span className="text-xs font-semibold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
              {count}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {expandedSections[id] ? (
            <ChevronUp className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          )}
        </div>
      </div>

      {expandedSections[id] && (
        <div className="pt-2 border-t border-slate-100/50 space-y-3">
          {children}
          <button
            onClick={(e) => { e.stopPropagation(); onAdd?.(); }}
            className="w-full py-2 flex items-center justify-center gap-2 text-sm font-medium text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all border border-dashed border-slate-200 hover:border-purple-200"
          >
            <Plus className="w-4 h-4" />
            <span>Add {title}</span>
          </button>
        </div>
      )}
    </div>
  );

  const ExperienceCard = ({ exp }) => (
    <div className="relative group p-4 bg-white/50 rounded-xl border border-slate-100 hover:border-purple-200 hover:shadow-sm transition-all">
      <div className="flex gap-4">
        <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 font-bold text-lg shadow-sm">
          {exp.company?.[0] || 'C'}
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-slate-900">{exp.title}</h4>
          <p className="text-sm font-medium text-slate-600">{exp.company}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-slate-400 font-medium px-2 py-0.5 bg-slate-100 rounded-md">
              {exp.start_date} - {exp.is_current ? 'Present' : exp.end_date}
            </span>
          </div>
          {exp.location && <p className="text-xs text-slate-400 mt-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> {exp.location}</p>}
        </div>
      </div>
      {/* Edit button placeholder - for future implementation */}
      {/* <button className="absolute top-3 right-3 p-2 text-slate-300 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
        <Pencil className="w-4 h-4" />
      </button> */}
      {exp.description_bullets?.length > 0 && (
        <ul className="mt-3 text-sm text-slate-600 space-y-1.5 pl-1">
          {exp.description_bullets.map((bullet, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-purple-400 mt-1">•</span>
              <span className="leading-relaxed">{bullet}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  const EducationCard = ({ edu }) => (
    <div className="relative group p-4 bg-white/50 rounded-xl border border-slate-100 hover:border-purple-200 hover:shadow-sm transition-all">
      <div className="flex gap-4">
        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-bold text-lg shadow-sm">
          {edu.institution?.[0] || 'U'}
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-slate-900">{edu.institution}</h4>
          <p className="text-sm font-medium text-slate-600">{edu.degree_type} {edu.field_of_study && `in ${edu.field_of_study}`}</p>
          <span className="inline-block mt-1 text-xs text-slate-400 font-medium px-2 py-0.5 bg-slate-100 rounded-md">
            {edu.start_date} - {edu.end_date || 'Present'}
          </span>
        </div>
      </div>
    </div>
  );

  const ProjectCard = ({ project }) => (
    <div className="relative group p-4 bg-white/50 rounded-xl border border-slate-100 hover:border-purple-200 hover:shadow-sm transition-all">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-bold text-slate-900">{project.name}</h4>
      </div>
      <p className="text-sm text-slate-600 leading-relaxed mb-3">{project.description}</p>
      {project.technologies?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {project.technologies.map((tech, i) => (
            <span key={i} className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-1 rounded-md border border-slate-200">
              {tech}
            </span>
          ))}
        </div>
      )}
    </div>
  );

  const SimpleCard = ({ title, sub, icon: Icon, colorClass, bgClass }) => (
    <div className="flex items-center justify-between p-3 bg-white/50 rounded-xl border border-slate-100 hover:border-purple-200 transition-all">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className={`p-2 rounded-lg ${bgClass}`}>
            <Icon className={`w-4 h-4 ${colorClass}`} />
          </div>
        )}
        <div>
          <h4 className="font-medium text-slate-900">{title}</h4>
          {sub && <p className="text-xs text-slate-500">{sub}</p>}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 pb-24">
      <Section id="experiences" title="Work Experience" icon={Briefcase} count={profile.work_experiences?.length || 0} onAdd={() => setActiveModal('experience')}>
        {profile.work_experiences?.length > 0 ? (
          profile.work_experiences.map((exp, i) => <ExperienceCard key={i} exp={exp} />)
        ) : (
          <p className="text-sm text-slate-400 italic text-center py-2">No work experience added</p>
        )}
      </Section>

      <Section id="education" title="Education" icon={GraduationCap} count={profile.education_entries?.length || 0} onAdd={() => setActiveModal('education')}>
        {profile.education_entries?.length > 0 ? (
          profile.education_entries.map((edu, i) => <EducationCard key={i} edu={edu} />)
        ) : (
          <p className="text-sm text-slate-400 italic text-center py-2">No education added</p>
        )}
      </Section>

      <Section id="projects" title="Projects" icon={FolderOpen} count={profile.projects?.length || 0}>
        {profile.projects?.length > 0 ? (
          profile.projects.map((project, i) => <ProjectCard key={i} project={project} />)
        ) : (
          <p className="text-sm text-slate-400 italic text-center py-2">No projects added</p>
        )}
      </Section>

      <Section id="skills" title="Skills" icon={Sparkles} count={profile.skills?.length || 0} onAdd={() => setActiveModal('skills')}>
        <div className="flex flex-wrap gap-2">
          {profile.skills?.map((skill, i) => (
            <span key={i} className="text-sm font-medium bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full border border-emerald-100">
              {skill}
            </span>
          ))}
          {(!profile.skills || profile.skills.length === 0) && (
            <p className="text-sm text-slate-400 italic text-center w-full py-2">No skills added</p>
          )}
        </div>
      </Section>

      <Section id="languages" title="Languages" icon={Globe} count={profile.languages?.length || 0}>
        {profile.languages?.map((lang, i) => (
          <SimpleCard
            key={i}
            title={lang.language}
            sub={lang.proficiency}
            icon={Globe}
            bgClass="bg-blue-50"
            colorClass="text-blue-600"
          />
        ))}
        {(!profile.languages || profile.languages.length === 0) && (
          <p className="text-sm text-slate-400 italic text-center py-2">No languages added</p>
        )}
      </Section>

      <Section id="awards" title="Awards" icon={Award} count={profile.awards?.length || 0}>
        {profile.awards?.map((award, i) => (
          <SimpleCard
            key={i}
            title={award.title}
            sub={award.issuer}
            icon={Award}
            bgClass="bg-yellow-50"
            colorClass="text-yellow-600"
          />
        ))}
        {(!profile.awards || profile.awards.length === 0) && (
          <p className="text-sm text-slate-400 italic text-center py-2">No awards added</p>
        )}
      </Section>

      <Section id="interests" title="Interests" icon={Heart} count={profile.interests?.length || 0}>
        <div className="flex flex-wrap gap-2">
          {profile.interests?.map((interest, i) => (
            <span key={i} className="text-sm font-medium bg-pink-50 text-pink-700 px-3 py-1.5 rounded-full border border-pink-100">
              {interest}
            </span>
          ))}
          {(!profile.interests || profile.interests.length === 0) && (
            <p className="text-sm text-slate-400 italic text-center w-full py-2">No interests added</p>
          )}
        </div>
      </Section>

      {/* Modals */}
      {activeModal === 'experience' && (
        <Modal title="Add Experience" onClose={() => setActiveModal(null)}>
          <ExperienceForm onSave={handleSaveExperience} onCancel={() => setActiveModal(null)} />
        </Modal>
      )}
      {activeModal === 'education' && (
        <Modal title="Add Education" onClose={() => setActiveModal(null)}>
          <EducationForm onSave={handleSaveEducation} onCancel={() => setActiveModal(null)} />
        </Modal>
      )}
      {activeModal === 'skills' && (
        <Modal title="Manage Skills" onClose={() => setActiveModal(null)}>
          <SkillsForm initialSkills={profile.skills || []} onSave={handleSaveSkills} onCancel={() => setActiveModal(null)} />
        </Modal>
      )}
    </div>
  );
}

function PersonalTab({ profile }) {
  return (
    <div className="space-y-4 pb-24">
      <div className="glass-card p-5 rounded-2xl space-y-4">
        <h3 className="font-bold text-slate-900 flex items-center gap-2">
          <User className="w-5 h-5 text-purple-600" />
          Contact Information
        </h3>
        <div className="space-y-1">
          <InfoRow label="Email" value={profile.email} icon={Mail} />
          <InfoRow label="Phone" value={profile.phone} icon={Settings} /> {/* Placeholder icon */}
          <InfoRow label="Location" value={profile.location} icon={MapPin} />
        </div>
      </div>

      <div className="glass-card p-5 rounded-2xl space-y-4">
        <h3 className="font-bold text-slate-900 flex items-center gap-2">
          <GlobeIcon className="w-5 h-5 text-blue-600" />
          Social Links
        </h3>
        <div className="space-y-1">
          <InfoRow label="LinkedIn" value={profile.linkedin_url} isLink icon={Linkedin} />
          <InfoRow label="GitHub" value={profile.github_url} isLink icon={Github} />
          <InfoRow label="Portfolio" value={profile.portfolio_url} isLink icon={Globe} />
        </div>
      </div>

      <div className="glass-card p-5 rounded-2xl space-y-4">
        <h3 className="font-bold text-slate-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-emerald-600" />
          About
        </h3>
        <div className="space-y-4 divide-y divide-slate-100/50">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Headline</p>
            <p className="text-slate-800 font-medium">{profile.headline || 'Not set'}</p>
          </div>
          <div className="pt-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Bio</p>
            <p className="text-sm text-slate-600 leading-relaxed">{profile.bio || 'Not set'}</p>
          </div>
          <div className="pt-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Career Goals</p>
            <p className="text-sm text-slate-600 leading-relaxed">{profile.goals || 'Not set'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, isLink, icon: Icon }) {
  return (
    <div className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors">
      <div className="flex items-center gap-3">
        {Icon && <Icon className="w-4 h-4 text-slate-400" />}
        <span className="text-sm font-medium text-slate-500">{label}</span>
      </div>
      {isLink && value ? (
        <a href={value} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-purple-600 hover:text-purple-700 truncate max-w-[180px]">
          {value.replace(/^https?:\/\/(www\.)?/, '')}
        </a>
      ) : (
        <span className="text-sm font-semibold text-slate-900">{value || '-'}</span>
      )}
    </div>
  );
}

function FilesTab({ profile, userId, onUploadSuccess }) {
  const resume = useFileUpload({
    bucket: 'resumes',
    urlColumn: 'resume_url',
    filenameColumn: 'cv_filename',
    userId,
    onSuccess: onUploadSuccess,
  });

  const transcript = useFileUpload({
    bucket: 'transcripts',
    urlColumn: 'transcript_url',
    filenameColumn: 'transcript_filename',
    userId,
    onSuccess: onUploadSuccess,
  });

  return (
    <div className="space-y-4 pb-24 animate-in fade-in slide-in-from-bottom-2">
      {/* Hidden file inputs */}
      <input
        ref={resume.inputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        className="hidden"
        onChange={resume.handleFileChange}
      />
      <input
        ref={transcript.inputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        className="hidden"
        onChange={transcript.handleFileChange}
      />

      <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <FileText className="w-24 h-24 text-emerald-600" />
        </div>

        <div className="flex items-center justify-between mb-6 relative z-10">
          <div>
            <h3 className="font-bold text-lg text-slate-900">Resumes</h3>
            <p className="text-sm text-slate-500">Your professional CV</p>
          </div>
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${profile.cv_filename ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
            {profile.cv_filename ? 'Uploaded' : 'Missing'}
          </span>
        </div>

        {resume.error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
            {resume.error}
          </div>
        )}

        {profile.cv_filename ? (
          <div className="relative z-10 bg-white/60 backdrop-blur-sm border border-slate-200 rounded-xl p-4 flex items-center gap-4 hover:border-emerald-300 transition-colors shadow-sm">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center shadow-sm">
              <FileText className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">{profile.cv_filename}</p>
              <p className="text-xs text-emerald-600 font-medium">Ready for applications</p>
            </div>
            <button
              onClick={resume.triggerPicker}
              disabled={resume.uploading}
              className="p-2.5 bg-white text-slate-400 hover:text-emerald-600 hover:shadow-md rounded-xl transition-all border border-slate-100"
            >
              {resume.uploading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Pencil className="w-5 h-5" />
              )}
            </button>
          </div>
        ) : (
          <button
            onClick={resume.triggerPicker}
            disabled={resume.uploading}
            className="relative z-10 w-full flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-emerald-200 bg-emerald-50/50 rounded-xl text-emerald-600 hover:bg-emerald-50 hover:border-emerald-400 transition-all disabled:opacity-50"
          >
            {resume.uploading ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : (
              <div className="p-3 bg-white rounded-full shadow-sm">
                <Plus className="w-6 h-6" />
              </div>
            )}
            <span className="font-semibold">{resume.uploading ? 'Uploading...' : 'Upload Resume (PDF)'}</span>
          </button>
        )}
      </div>

      <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <FolderOpen className="w-24 h-24 text-blue-600" />
        </div>

        <div className="flex items-center justify-between mb-6 relative z-10">
          <div>
            <h3 className="font-bold text-lg text-slate-900">Transcripts</h3>
            <p className="text-sm text-slate-500">Academic records</p>
          </div>
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${profile.transcript_filename ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
            {profile.transcript_filename ? 'Uploaded' : 'Optional'}
          </span>
        </div>

        {transcript.error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
            {transcript.error}
          </div>
        )}

        {profile.transcript_filename ? (
          <div className="relative z-10 bg-white/60 backdrop-blur-sm border border-slate-200 rounded-xl p-4 flex items-center gap-4 hover:border-blue-300 transition-colors shadow-sm">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shadow-sm">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">{profile.transcript_filename}</p>
              <p className="text-xs text-blue-600 font-medium">Added to profile</p>
            </div>
            <button
              onClick={transcript.triggerPicker}
              disabled={transcript.uploading}
              className="p-2.5 bg-white text-slate-400 hover:text-blue-600 hover:shadow-md rounded-xl transition-all border border-slate-100"
            >
              {transcript.uploading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Pencil className="w-5 h-5" />
              )}
            </button>
          </div>
        ) : (
          <button
            onClick={transcript.triggerPicker}
            disabled={transcript.uploading}
            className="relative z-10 w-full flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-blue-200 bg-blue-50/50 rounded-xl text-blue-600 hover:bg-blue-50 hover:border-blue-400 transition-all disabled:opacity-50"
          >
            {transcript.uploading ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : (
              <div className="p-3 bg-white rounded-full shadow-sm">
                <Plus className="w-6 h-6" />
              </div>
            )}
            <span className="font-semibold">{transcript.uploading ? 'Uploading...' : 'Upload Transcript (PDF)'}</span>
          </button>
        )}
      </div>
    </div>
  );
}

// Calculate profile completion percentage
function calculateCompletion(profile) {
  const fields = [
    { key: 'name', altKey: 'full_name', weight: 10 }, // Check both name fields
    { key: 'email', weight: 5 },
    { key: 'headline', weight: 10 },
    { key: 'bio', weight: 10 },
    { key: 'work_experiences', weight: 15, isArray: true },
    { key: 'education_entries', weight: 15, isArray: true },
    { key: 'skills', weight: 10, isArray: true },
    { key: 'cv_filename', weight: 15 },
    { key: 'location', weight: 5 },
    { key: 'phone', weight: 5 },
  ];

  let completed = 0;
  let total = 0;

  for (const field of fields) {
    total += field.weight;
    // Check primary key first, then alternative key if provided
    const value = profile[field.key] || (field.altKey ? profile[field.altKey] : null);
    if (field.isArray) {
      if (value && value.length > 0) completed += field.weight;
    } else {
      if (value) completed += field.weight;
    }
  }

  return Math.round((completed / total) * 100);
}

export default function Profile() {
  const navigate = useNavigate();
  const { user: authUser, logout, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('resume');
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProfile();
  }, [authUser]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const loadProfile = async () => {
    if (!authUser) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (fetchError) throw fetchError;
      setProfile(data || {});
    } catch (err) {
      if (err.name === 'AbortError' || err.message?.includes('AbortError')) return;
      console.error('Profile load error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (field, value) => {
    try {
      if (!authUser) return;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ [field]: value })
        .eq('id', authUser.id);

      if (updateError) throw updateError;

      // Update local state optimistic logic
      setProfile(prev => ({ ...prev, [field]: value }));
    } catch (err) {
      console.error('Update profile error:', err);
      // maybe show toast?
    }
  };

  const handleUploadSuccess = useCallback(() => {
    loadProfile();
  }, [authUser]);

  const handleFinish = () => {
    const p = profile || {};
    // Navigate to first incomplete tab section
    if (!p.full_name || !p.email) {
      setActiveTab('personal');
    } else if (!p.cv_filename) {
      setActiveTab('files');
    } else if (!p.work_experiences?.length && !p.education_entries?.length) {
      setActiveTab('resume');
    } else {
      setActiveTab('files');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 min-h-screen bg-slate-50">
        <div className="animate-spin w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 min-h-screen bg-slate-50">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button onClick={loadProfile} className="text-purple-600 font-bold hover:underline">Retry</button>
        </div>
      </div>
    );
  }

  const completion = calculateCompletion(profile || {});
  const tabs = [
    { id: 'resume', label: 'Resume', icon: FileText },
    { id: 'personal', label: 'Personal', icon: Settings },
    { id: 'files', label: 'Files', icon: FolderOpen },
  ];

  // Resolve name from multiple sources with fallback chain:
  // 1. profile.name (set manually or from resume parsing)
  // 2. profile.full_name (alternative field name)
  // 3. authUser.user_metadata.full_name (from signup)
  // 4. Email prefix as final fallback
  const resolvedName =
    profile?.name ||
    profile?.full_name ||
    authUser?.user_metadata?.full_name ||
    authUser?.email?.split('@')[0] ||
    'Member';
  const firstName = resolvedName.split(' ')[0];

  return (
    <div className="flex-1 bg-slate-50 min-h-screen relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-200/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
      <div className="absolute top-0 left-0 w-[300px] h-[300px] bg-blue-200/20 rounded-full blur-[80px] -translate-y-1/2 -translate-x-1/2" />

      {/* Header */}
      <div className="relative z-10 bg-white/60 backdrop-blur-md border-b border-white/50 px-6 py-4 sticky top-0">
        <div className="safe-area-top" />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Profile</h1>
            <p className="text-xs font-medium text-slate-500">Manage your career presence</p>
          </div>
          <button
            onClick={async () => {
              await logout();
              navigate('/login', { replace: true });
            }}
            className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl transition-colors border border-transparent hover:border-red-100"
            title="Sign Out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="px-5 mt-6 relative z-0 space-y-6">

        {/* Credits Card */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-4 text-white shadow-xl shadow-slate-200/50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/10">
              <Sparkles className="w-6 h-6 text-yellow-400 fill-yellow-400" />
            </div>
            <div>
              <span className="block text-2xl font-bold tracking-tight">{profile?.daily_swipe_limit || 50}</span>
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Daily Credits</span>
            </div>
          </div>
          <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-semibold transition-colors border border-white/10">
            Get More
          </button>
        </div>

        {/* Profile Completion Card */}
        <div className="glass-card p-5 rounded-2xl flex items-center gap-5 relative overflow-hidden">
          {/* Completion Ring */}
          <div className="relative w-16 h-16 flex-shrink-0">
            <svg className="w-16 h-16 transform -rotate-90">
              <circle cx="32" cy="32" r="28" stroke="#e2e8f0" strokeWidth="6" fill="none" />
              <circle
                cx="32" cy="32" r="28"
                stroke="url(#gradient)" strokeWidth="6" fill="none"
                strokeDasharray={`${completion * 1.75} 175`}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#7c3aed" />
                  <stop offset="100%" stopColor="#c026d3" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-slate-700">{completion}%</span>
            </div>
          </div>

          <div className="flex-1 relative z-10">
            <h3 className="font-bold text-slate-900">Hello, {firstName}!</h3>
            <p className="text-sm text-slate-500 leading-tight mt-1">
              Complete your profile to unlock {100 - completion}% more visibility.
            </p>
          </div>

          {completion < 100 && (
            <button
              onClick={handleFinish}
              className="p-2 bg-purple-50 text-purple-600 rounded-xl hover:bg-purple-100 transition-colors"
            >
              <Pencil className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex p-1 bg-slate-200/50 rounded-2xl">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl transition-all ${activeTab === tab.id
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-purple-600' : 'text-slate-400'}`} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="min-h-[300px]">
          {activeTab === 'resume' && <ResumeTab profile={profile || {}} onUpdateProfile={handleUpdateProfile} />}
          {activeTab === 'personal' && <PersonalTab profile={profile || {}} />}
          {activeTab === 'files' && <FilesTab profile={profile || {}} userId={authUser?.id} onUploadSuccess={handleUploadSuccess} />}
        </div>
      </div>
    </div>
  );
}
