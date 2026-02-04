import { useState } from 'react';
import { X, Save, Plus, Trash2 } from 'lucide-react';

export function Modal({ title, onClose, children }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <h3 className="font-bold text-lg text-slate-900">{title}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto flex-1">
                    {children}
                </div>
            </div>
        </div>
    );
}

export function ExperienceForm({ onSave, onCancel, initialData }) {
    const [formData, setFormData] = useState(initialData || {
        title: '',
        company: '',
        location: '',
        start_date: '',
        end_date: '',
        is_current: false,
        description: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            ...formData,
            // Split description into bullets by newline
            description_bullets: formData.description.split('\n').filter(Boolean)
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Job Title</label>
                <input
                    required
                    type="text"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Software Engineer"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Company</label>
                <input
                    required
                    type="text"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={formData.company}
                    onChange={e => setFormData({ ...formData, company: e.target.value })}
                    placeholder="e.g. Acme Corp"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                <input
                    type="text"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={formData.location}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. San Francisco, CA"
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                    <input
                        required
                        type="text"
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                        value={formData.start_date}
                        onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                        placeholder="MM/YYYY"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                    <input
                        disabled={formData.is_current}
                        type="text"
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                        value={formData.end_date}
                        onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                        placeholder="MM/YYYY"
                    />
                </div>
            </div>
            <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    id="current"
                    checked={formData.is_current}
                    onChange={e => setFormData({ ...formData, is_current: e.target.checked })}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <label htmlFor="current" className="text-sm text-slate-600">I currently work here</label>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[100px]"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your responsibilities (one per line)..."
                />
            </div>
            <div className="pt-4 flex gap-3">
                <button type="button" onClick={onCancel} className="flex-1 py-3 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition-colors">
                    Cancel
                </button>
                <button type="submit" className="flex-1 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200">
                    Save Experience
                </button>
            </div>
        </form>
    );
}

export function EducationForm({ onSave, onCancel, initialData }) {
    const [formData, setFormData] = useState(initialData || {
        institution: '',
        degree_type: '',
        field_of_study: '',
        start_date: '',
        end_date: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">School / University</label>
                <input
                    required
                    type="text"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={formData.institution}
                    onChange={e => setFormData({ ...formData, institution: e.target.value })}
                    placeholder="e.g. Stanford University"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Degree</label>
                <input
                    required
                    type="text"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={formData.degree_type}
                    onChange={e => setFormData({ ...formData, degree_type: e.target.value })}
                    placeholder="e.g. Bachelor of Science"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Field of Study</label>
                <input
                    required
                    type="text"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={formData.field_of_study}
                    onChange={e => setFormData({ ...formData, field_of_study: e.target.value })}
                    placeholder="e.g. Computer Science"
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                    <input
                        required
                        type="text"
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                        value={formData.start_date}
                        onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                        placeholder="YYYY"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                    <input
                        required
                        type="text"
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                        value={formData.end_date}
                        onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                        placeholder="YYYY (or Present)"
                    />
                </div>
            </div>
            <div className="pt-4 flex gap-3">
                <button type="button" onClick={onCancel} className="flex-1 py-3 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition-colors">
                    Cancel
                </button>
                <button type="submit" className="flex-1 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200">
                    Save Education
                </button>
            </div>
        </form>
    );
}

export function SkillsForm({ onSave, onCancel, initialSkills = [] }) {
    const [skillInput, setSkillInput] = useState('');
    const [skills, setSkills] = useState(initialSkills);

    const addSkill = (e) => {
        e?.preventDefault();
        if (skillInput.trim() && !skills.includes(skillInput.trim())) {
            setSkills([...skills, skillInput.trim()]);
            setSkillInput('');
        }
    };

    const removeSkill = (skillToRemove) => {
        setSkills(skills.filter(s => s !== skillToRemove));
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addSkill();
        }
    };

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Add Skills</label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                        value={skillInput}
                        onChange={e => setSkillInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="e.g. React, Python"
                    />
                    <button
                        type="button"
                        onClick={addSkill}
                        className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="flex flex-wrap gap-2 min-h-[100px] p-4 bg-slate-50 rounded-xl border border-slate-100">
                {skills.map((skill, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-slate-200 rounded-full text-sm font-medium text-slate-700">
                        {skill}
                        <button onClick={() => removeSkill(skill)} className="p-0.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-red-500">
                            <X className="w-3 h-3" />
                        </button>
                    </span>
                ))}
                {skills.length === 0 && (
                    <p className="text-slate-400 text-sm italic w-full text-center">Type a skill and press Enter</p>
                )}
            </div>

            <div className="pt-4 flex gap-3">
                <button type="button" onClick={onCancel} className="flex-1 py-3 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition-colors">
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={() => onSave(skills)}
                    className="flex-1 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200"
                >
                    Save Skills
                </button>
            </div>
        </div>
    );
}
