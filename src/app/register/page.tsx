'use client';

import { useEffect, useState } from 'react';
import liff from '@line/liff';
import { supabase } from '@/lib/supabase'; // ตรวจสอบ path ให้ตรงกับไฟล์ที่คุณสร้าง

export default function RegisterPage() {
    const [profile, setProfile] = useState<any>(null);
    const [role, setRole] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initLiff = async () => {
            try {
                await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID! });
                if (!liff.isLoggedIn()) {
                    liff.login();
                } else {
                    const userProfile = await liff.getProfile();
                    setProfile(userProfile);

                    // เช็คว่าเคยลงทะเบียนหรือยัง
                    const { data } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('line_id', userProfile.userId)
                        .single();

                    if (data) {
                        alert('คุณลงทะเบียนเรียบร้อยแล้ว!');
                        // window.location.href = '/dashboard'; // ส่งไปหน้าหลักถ้าลงทะเบียนแล้ว
                    }
                }
            } catch (err) {
                console.error('LIFF Init Error', err);
            } finally {
                setLoading(false);
            }
        };
        initLiff();
    }, []);

    const handleRegister = async () => {
        if (!role || !phone) return alert('กรุณากรอกข้อมูลให้ครบถ้วน');

        const { error } = await supabase.from('profiles').insert([
            {
                line_id: profile.userId,
                display_name: profile.displayName,
                full_name: profile.displayName, // ใช้ชื่อ LINE เป็นค่าเริ่มต้น
                phone_number: phone,
                role: role,
            },
        ]);

        if (error) {
            console.error(error);
            alert('เกิดข้อผิดพลาดในการลงทะเบียน');
        } else {
            alert('ลงทะเบียนสำเร็จ!');
            liff.closeWindow(); // ปิดหน้าจอ LIFF เมื่อเสร็จสิ้น
        }
    };

    if (loading) return <div className="p-10 text-center">กำลังโหลด...</div>;

    return (
        <div className="min-h-screen bg-green-50 p-6 flex flex-col items-center">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
                <h1 className="text-2xl font-bold text-green-700 mb-6 text-center">ลงทะเบียนเกษตรกร</h1>

                {profile && (
                    <div className="flex flex-col items-center mb-6">
                        <img src={profile.pictureUrl} className="w-20 h-20 rounded-full border-4 border-green-200 mb-2" alt="Profile" />
                        <p className="font-semibold text-gray-700">สวัสดีคุณ {profile.displayName}</p>
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">สถานะของคุณ</label>
                        <select
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <option value="">เลือกประเภทผู้ใช้งาน</option>
                            <option value="farmer">เกษตรกร</option>
                            <option value="provider">ผู้รับจ้าง (โดรน/รถไถ)</option>
                            <option value="shop">ร้านขายของเกษตร</option>
                            <option value="expert">ผู้เชี่ยวชาญ</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">เบอร์โทรศัพท์</label>
                        <input
                            type="tel"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                            placeholder="08x-xxx-xxxx"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </div>

                    <button
                        onClick={handleRegister}
                        className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition"
                    >
                        เริ่มต้นใช้งาน
                    </button>
                </div>
            </div>
        </div>
    );
}