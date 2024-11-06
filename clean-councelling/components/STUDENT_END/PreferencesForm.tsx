// app/components/STUDENT_END/PreferencesForm.tsx
import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';

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

interface ServerPreference {
    College_Id: number;
    Course_Id: number;
    Preference_Order: number;
}

export default function PreferencesForm({ studentId, onCancel }: PreferenceFormProps) {
    const [colleges, setColleges] = useState<CollegesData>({});
    const [preferences, setPreferences] = useState<Preference[]>(Array(10).fill({ collegeId: null, courseId: null }));
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Fetch colleges and preferences on mount
    useEffect(() => {
        const fetchCollegesAndPreferences = async () => {
            try {
                const [collegesResponse, preferencesResponse] = await Promise.all([
                    fetch('/api/STUDENT_END/collegesWithCourses'),
                    fetch(`/api/STUDENT_END/preferences/${studentId}`)
                ]);

                const collegesData: CollegesData = await collegesResponse.json();
                const preferencesData: ServerPreference[] = await preferencesResponse.json();

                setColleges(collegesData);

                // Populate existing preferences in their order
                const loadedPreferences = preferences.map((_, index) => {
                    const pref = preferencesData.find(p => p.Preference_Order === index + 1);
                    return pref
                        ? { collegeId: pref.College_Id, courseId: pref.Course_Id }
                        : { collegeId: null, courseId: null };
                });
                setPreferences(loadedPreferences);
                setLoading(false);

                // Scroll to top when data is loaded
                window.scrollTo(0, 0);
            } catch (error) {
                console.error("Error fetching data:", error);
                setError("Failed to load preferences data");
                setLoading(false);
            }
        };

        fetchCollegesAndPreferences();
    }, [studentId]);

    const handleCollegeChange = (index: number, collegeId: number | "") => {
        const numCollegeId = collegeId === "" ? null : Number(collegeId);
        const updatedPreferences = [...preferences];
        updatedPreferences[index] = { collegeId: numCollegeId, courseId: null };
        setPreferences(updatedPreferences);
        setError(null);
    };

    const handleCourseChange = (index: number, courseId: number | "") => {
        const numCourseId = courseId === "" ? null : Number(courseId);
        const updatedPreferences = [...preferences];
        updatedPreferences[index] = {
            ...updatedPreferences[index],
            courseId: numCourseId
        };
        setPreferences(updatedPreferences);
        setError(null);
    };

    const handleSubmit = async () => {
        const validPreferences = preferences
            .filter(pref => pref.collegeId && pref.courseId)
            .map((pref, index) => ({ collegeId: pref.collegeId, courseId: pref.courseId, preferenceOrder: index + 1 }));

        if (validPreferences.length < 3) {
            setError("Please select at least 3 preferences");
            return;
        }

        try {
            const response = await fetch(`/api/STUDENT_END/preferences/${studentId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(validPreferences)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update preferences');
            }

            setSuccessMessage("Preferences updated successfully!");
            setTimeout(onCancel, 1500);
        } catch (error) {
            setError(error instanceof Error ? error.message : "Failed to update preferences");
        }
    };

    if (loading) {
        return <div>Loading preferences...</div>;
    }

    return (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center overflow-y-auto py-8">
            <div className="bg-gray-900 text-white rounded-lg shadow-xl w-full max-w-3xl mx-4 relative">
                <div className="p-6">
                    <h2 className="text-2xl font-semibold text-white mb-6">Edit Preferences</h2>

                    {error && <Alert variant="destructive" className="mb-4"><AlertDescription>{error}</AlertDescription></Alert>}
                    {successMessage && <Alert className="mb-4 bg-green-600 text-white border-none"><AlertDescription>{successMessage}</AlertDescription></Alert>}

                    <div className="space-y-4 max-h-96 overflow-y-auto">
                        {preferences.map((preference, index) => (
                            <div key={index} className="p-4 bg-gray-800 rounded-lg">
                                <label className="block text-sm font-medium text-gray-300 mb-2">Preference {index + 1}:</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <select
                                        className="w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-200"
                                        value={preference.collegeId || ""}
                                        onChange={(e) => handleCollegeChange(index, e.target.value as "" | number)}
                                    >
                                        <option value="">Select College</option>
                                        {Object.entries(colleges).map(([collegeName, college]) => (
                                            <option key={college.collegeId} value={college.collegeId}>
                                                {collegeName}
                                            </option>
                                        ))}
                                    </select>

                                    <select
                                        className="w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-200"
                                        value={preference.courseId || ""}
                                        onChange={(e) => handleCourseChange(index, e.target.value as "" | number)}
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
                            className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
                            onClick={onCancel}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500"
                            onClick={handleSubmit}
                        >
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
