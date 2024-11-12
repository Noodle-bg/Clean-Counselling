// app/components/STUDENT_END/PreferencesForm.tsx
import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

interface College {
    collegeId: number;
    courses: { courseId: number; courseName: string }[];
}

interface CollegesData {
    [collegeName: string]: College;
}

interface Preference {
    collegeId: number | null;
    courseId: number | null;
}

interface PreferenceFormProps {
    studentId: number;
    onCancel: () => void;
}

export default function PreferencesForm({ studentId, onCancel }: PreferenceFormProps) {
    const [colleges, setColleges] = useState<CollegesData>({});
    const [preferences, setPreferences] = useState<Preference[]>(
        Array(10).fill({ collegeId: null, courseId: null })
    );
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [collegesResponse, preferencesResponse] = await Promise.all([
                    fetch('/api/STUDENT_END/collegesWithCourses'),
                    fetch(`/api/STUDENT_END/preferences/${studentId}`)
                ]);

                if (!collegesResponse.ok || !preferencesResponse.ok) {
                    throw new Error('Failed to fetch data');
                }

                const collegesData = await collegesResponse.json();
                const preferencesData = await preferencesResponse.json();

                setColleges(collegesData);

                // Map existing preferences
                const loadedPreferences = Array(10).fill({ collegeId: null, courseId: null });
                preferencesData.forEach((pref: any) => {
                    if (pref.Preference_Order >= 1 && pref.Preference_Order <= 10) {
                        loadedPreferences[pref.Preference_Order - 1] = {
                            collegeId: pref.College_Id,
                            courseId: pref.Course_Id
                        };
                    }
                });

                setPreferences(loadedPreferences);
            } catch (error) {
                setError('Failed to load preferences data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [studentId]);

    const handleSubmit = async () => {
        const validPreferences = preferences
            .filter(pref => pref.collegeId && pref.courseId)
            .map((pref, index) => ({
                collegeId: pref.collegeId,
                courseId: pref.courseId,
                preferenceOrder: index + 1
            }));

        if (validPreferences.length < 3) {
            setError('Please select at least 3 preferences');
            return;
        }

        try {
            setSaving(true);
            const response = await fetch(`/api/STUDENT_END/preferences/${studentId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(validPreferences)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update preferences');
            }

            setSuccessMessage('Preferences updated successfully!');
            setTimeout(onCancel, 1500);
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to update preferences');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
                <div className="bg-gray-900 rounded-lg p-8 flex items-center space-x-4">
                    <Loader2 className="w-6 h-6 text-teal-400 animate-spin" />
                    <p className="text-white">Loading preferences...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center overflow-y-auto py-8">
            <div className="bg-gray-900 text-white rounded-lg shadow-xl w-full max-w-3xl mx-4">
                <div className="p-6">
                    <h2 className="text-2xl font-semibold text-teal-400 mb-6">Edit Preferences</h2>

                    {error && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {successMessage && (
                        <Alert className="mb-4 bg-green-600 text-white border-none">
                            <AlertDescription>{successMessage}</AlertDescription>
                        </Alert>
                    )}

                    <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                        {preferences.map((preference, index) => (
                            <div key={index} className="p-4 bg-gray-800 rounded-lg">
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Preference {index + 1}:
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* College Select */}
                                    <select
                                        className="w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-200"
                                        value={preference.collegeId || ""}
                                        onChange={(e) => {
                                            const updatedPreferences = [...preferences];
                                            updatedPreferences[index] = {
                                                collegeId: e.target.value ? Number(e.target.value) : null,
                                                courseId: null
                                            };
                                            setPreferences(updatedPreferences);
                                            setError(null);
                                        }}
                                    >
                                        <option value="">Select College</option>
                                        {Object.entries(colleges).map(([collegeName, college]) => (
                                            <option key={college.collegeId} value={college.collegeId}>
                                                {collegeName}
                                            </option>
                                        ))}
                                    </select>

                                    {/* Course Select */}
                                    <select
                                        className="w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-200"
                                        value={preference.courseId || ""}
                                        onChange={(e) => {
                                            const updatedPreferences = [...preferences];
                                            updatedPreferences[index] = {
                                                ...updatedPreferences[index],
                                                courseId: e.target.value ? Number(e.target.value) : null
                                            };
                                            setPreferences(updatedPreferences);
                                            setError(null);
                                        }}
                                        disabled={!preference.collegeId}
                                    >
                                        <option value="">Select Course</option>
                                        {preference.collegeId &&
                                            colleges[
                                                Object.keys(colleges).find(
                                                    (key) => colleges[key].collegeId === preference.collegeId
                                                )!
                                            ].courses.map((course) => (
                                                <option key={course.courseId} value={course.courseId}>
                                                    {course.courseName}
                                                </option>
                                            ))}
                                    </select>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end gap-4 mt-6">
                        <button
                            type="button"
                            className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
                            onClick={onCancel}
                            disabled={saving}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors flex items-center gap-2"
                            onClick={handleSubmit}
                            disabled={saving}
                        >
                            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}