'use client';

import { useEffect, useState } from 'react';
import liff from '@line/liff';
import { supabase } from '@/src/lib/supabase';

export default function ConsultingDashboardPage() {
    const [questions, setQuestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchQuestions();
    }, []);

    const fetchQuestions = async () => {
        // ดึงคำถามที่ยังไม่ได้ตอบ (status = pending)
        const { data } = await supabase
            .from('consultations')
            .select('*')
            .eq('status', 'pending')
            .order('created_at', { ascending: true }); // มาก่อนตอบก่อน

        setQuestions(data || []);
        setLoading(false);
    };

    const handleAnswer = async (id: string) => {
        const answer = prompt('พิมพ์คำแนะนำของคุณ:');
        if (!answer) return;

        if (!liff.isLoggedIn()) {
            alert('กรุณาล็อกอินก่อนตอบ');
            return;
        }
        const profile = await liff.getProfile();

        const { error } = await supabase
            .from('consultations')
            .update({
                answer: answer,
                expert_id: profile.userId,
                status: 'answered',
                answered_at: new Date()
            })
            .eq('id', id);

        if (!error) {
            alert('ส่งคำแนะนำเรียบร้อย!');
            fetchQuestions();
        } else {
            alert('Error: ' + error.message);
        }
    };

    if (loading) return <div className="p-10 text-center">กำลังโหลดคำถาม...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <h1 className="text-2xl font-bold text-indigo-700 mb-6">👨‍⚕️ คำถามรอการช่วยเหลือ</h1>

            <div className="space-y-4">
                {questions.map(q => (
                    <div key={q.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex justify-between items-start mb-2">
                            <span className={`text-xs px-2 py-1 rounded-full text-white font-bold
                                ${q.urgency === 'high' ? 'bg-red-500' : q.urgency === 'medium' ? 'bg-orange-400' : 'bg-green-400'}`}>
                                {q.urgency === 'high' ? 'ด่วนมาก 🔥' : q.urgency === 'medium' ? 'ปานกลาง' : 'ทั่วไป'}
                            </span>
                            <span className="text-xs text-gray-400">
                                {new Date(q.created_at).toLocaleDateString('th-TH')}
                            </span>
                        </div>

                        <h3 className="font-bold text-gray-800 text-lg mb-1">{q.topic}</h3>
                        <p className="text-gray-600 text-sm mb-4 bg-gray-50 p-3 rounded-lg">{q.details}</p>

                        {q.image_url && (
                            <div className="mb-4">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={q.image_url} alt="รูปประกอบ" className="w-full h-40 object-cover rounded-lg" />
                            </div>
                        )}

                        <button
                            onClick={() => handleAnswer(q.id)}
                            className="w-full bg-indigo-600 text-white py-2 rounded-lg font-bold hover:bg-indigo-700 transition"
                        >
                            ตอบคำถาม
                        </button>
                    </div>
                ))}

                {questions.length === 0 && <p className="text-center text-gray-500 mt-10">🎉 เยี่ยมมาก! ไม่มีคำถามค้างตอบ</p>}
            </div>
        </div>
    );
}