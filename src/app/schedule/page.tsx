'use client';

import { useEffect, useState } from 'react';
import liff from '@line/liff';
import { supabase } from '@/src/lib/supabase';

export default function SchedulePage() {
    const [assignments, setAssignments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMyJobs = async () => {
            try {
                const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
                if (liffId) await liff.init({ liffId });

                if (!liff.isLoggedIn()) {
                    liff.login();
                    return;
                }
                const profile = await liff.getProfile();

                // ดึงข้อมูลการจ้างงานที่เชื่อมกับตาราง jobs
                const { data, error } = await supabase
                    .from('job_assignments')
                    .select(`
                        *,
                        jobs (*)
                    `)
                    .eq('provider_id', profile.userId)
                    .order('assigned_at', { ascending: false });

                if (error) throw error;
                setAssignments(data || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchMyJobs();
    }, []);

    if (loading) return <div className="p-10 text-center">กำลังโหลดตารางงาน...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <h1 className="text-2xl font-bold text-purple-700 mb-6">📅 งานของฉัน</h1>

            <div className="space-y-4">
                {assignments.map((item) => (
                    <div key={item.id} className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-purple-500">
                        <div className="flex justify-between">
                            <h3 className="font-bold text-gray-800">{item.jobs?.description || 'งานไม่ระบุชื่อ'}</h3>
                            <span className={`text-xs px-2 py-1 rounded-full ${item.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                {item.status === 'completed' ? 'เสร็จสิ้น' : 'กำลังดำเนินการ'}
                            </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                            รับงานเมื่อ: {new Date(item.assigned_at).toLocaleDateString('th-TH')}
                        </p>
                        <div className="mt-3 text-sm">
                            <p>📞 ติดต่อลูกค้า: <a href={`tel:${item.jobs?.contact_phone}`} className="text-blue-600 underline">{item.jobs?.contact_phone}</a></p>
                        </div>
                        {item.status !== 'completed' && (
                            <button className="mt-4 w-full border border-green-600 text-green-600 py-2 rounded-lg hover:bg-green-50 text-sm font-semibold">
                                ✅ แจ้งงานเสร็จ
                            </button>
                        )}
                    </div>
                ))}

                {assignments.length === 0 && (
                    <div className="text-center text-gray-500 mt-10">คุณยังไม่มีงานที่รับไว้</div>
                )}
            </div>
        </div>
    );
}
