'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import liff from '@line/liff';
import { supabase } from '@/src/lib/supabase';

export default function JobFeedPage() {
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        const { data, error } = await supabase
            .from('jobs')
            .select('*')
            .eq('status', 'open')
            .order('created_at', { ascending: false });

        if (error) console.error(error);
        else setJobs(data || []);
        setLoading(false);
    };

    const handleAcceptJob = async (jobId: string) => {
        if (!liff.isLoggedIn()) {
            alert('กรุณาล็อกอินก่อนรับงาน');
            liff.login();
            return;
        }

        const confirm = window.confirm('คุณต้องการรับงานนี้ใช่หรือไม่?');
        if (!confirm) return;

        try {
            const profile = await liff.getProfile();

            // 1. สร้าง Record ใน job_assignments
            const { error: assignError } = await supabase.from('job_assignments').insert([
                { job_id: jobId, provider_id: profile.userId, status: 'accepted' }
            ]);
            if (assignError) throw assignError;

            // 2. อัปเดตสถานะงานใน jobs เป็น in_progress (เพื่อไม่ให้คนอื่นเห็นซ้ำ)
            const { error: updateError } = await supabase
                .from('jobs')
                .update({ status: 'in_progress' })
                .eq('id', jobId);
            if (updateError) throw updateError;

            alert('รับงานสำเร็จ! ไปดูที่ตารางงานของคุณ');
            router.push('/schedule');
        } catch (err: any) {
            alert('เกิดข้อผิดพลาด: ' + err.message);
        }
    };

    if (loading) return <div className="p-10 text-center">กำลังค้นหางาน...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <h1 className="text-2xl font-bold text-blue-700 mb-6">งานที่ว่างอยู่ (Job Feed)</h1>

            {jobs.length === 0 ? (
                <p className="text-gray-500 text-center mt-10">ยังไม่มีงานใหม่ในขณะนี้</p>
            ) : (
                <div className="space-y-4">
                    {jobs.map((job) => (
                        <div key={job.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                            <div className="flex justify-between items-start mb-2">
                                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-semibold">
                                    {job.job_type === 'tractor' ? 'รถไถ' :
                                        job.job_type === 'drone' ? 'โดรน' :
                                            job.job_type === 'harvester' ? 'รถเกี่ยว' : 'แรงงาน'}
                                </span>
                                <span className="text-xs text-gray-400">
                                    {new Date(job.created_at).toLocaleDateString('th-TH')}
                                </span>
                            </div>
                            <h3 className="font-bold text-gray-800 mb-1">{job.description}</h3>
                            <p className="text-sm text-gray-600 mb-3">📞 {job.contact_phone}</p>

                            <div className="flex space-x-2 mt-4">
                                <button
                                    onClick={() => handleAcceptJob(job.id)}
                                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition"
                                >
                                    รับงานนี้
                                </button>
                                {job.location_lat && (
                                    <a
                                        href={`https://www.google.com/maps/search/?api=1&query=${job.location_lat},${job.location_lng}`}
                                        target="_blank"
                                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
                                    >📍 ดูแผนที่</a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
