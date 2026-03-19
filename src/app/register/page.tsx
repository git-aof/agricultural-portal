'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import liff, { type Profile } from '@line/liff';
import { supabase } from '@/src/lib/supabase'; // ตรวจสอบ path ให้ตรงกับไฟล์ที่คุณสร้าง

export default function RegisterPage() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [role, setRole] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formMessage, setFormMessage] = useState('');
    const router = useRouter();

    useEffect(() => {
        let isMounted = true;

        const initLiff = async () => {
            try {
                const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
                if (!liffId) {
                    console.error('LIFF ID is not set in .env file.');
                    if (isMounted) setFormMessage('เกิดข้อผิดพลาดในการตั้งค่าแอปพลิเคชัน (LIFF ID)');
                    return;
                }

                await liff.init({ liffId });
                if (!liff.isLoggedIn()) {
                    liff.login();
                } else {
                    const userProfile = await liff.getProfile();
                    if (isMounted) setProfile(userProfile);

                    // เช็คว่าเคยลงทะเบียนหรือยัง
                    const { data } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('line_id', userProfile.userId)
                        .single();

                    if (data && isMounted) {
                        router.push('/dashboard'); // ส่งไปหน้าหลักถ้าลงทะเบียนแล้ว
                    }
                }
            } catch (err) {
                console.error('LIFF Init Error', err);
                if (isMounted) setFormMessage('เกิดข้อผิดพลาดในการเชื่อมต่อกับ LINE');
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        initLiff();

        return () => {
            isMounted = false;
        };
    }, [router]);

    const handleRegister = async () => {
        setFormMessage('');
        if (!profile) {
            setFormMessage('ไม่สามารถโหลดข้อมูลโปรไฟล์ได้ กรุณาลองใหม่อีกครั้ง');
            return;
        }
        if (!role || !phone) {
            setFormMessage('กรุณากรอกข้อมูลให้ครบถ้วน');
            return;
        }

        const phoneRegex = /^0\d{9}$/;
        if (!phoneRegex.test(phone)) {
            setFormMessage('รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง (ต้องมี 10 หลักและขึ้นต้นด้วย 0)');
            return;
        }

        setIsSubmitting(true);
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
            setFormMessage(`เกิดข้อผิดพลาดในการลงทะเบียน: ${error.message}`);
        } else {
            setFormMessage('ลงทะเบียนสำเร็จ! กำลังนำคุณไปยังหน้าหลัก...');
            setTimeout(() => {
                router.push('/dashboard');
            }, 2000);
        }
        setIsSubmitting(false);
    };

    if (loading) return <div className="p-10 text-center">กำลังโหลด...</div>;

    return (
        <div className="min-h-screen bg-green-50 p-6 flex flex-col items-center">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
                <h1 className="text-2xl font-bold text-green-700 mb-6 text-center">ลงทะเบียนเกษตรกร</h1>

                {profile && (
                    <div className="flex flex-col items-center mb-6">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={profile.pictureUrl || ''} className="w-20 h-20 rounded-full border-4 border-green-200 mb-2" alt={`รูปโปรไฟล์ของ ${profile.displayName}`} />
                        <p className="font-semibold text-gray-700">สวัสดีคุณ {profile.displayName}</p>
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-600 mb-1">สถานะของคุณ</label>
                        <select
                            id="role"
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
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-600 mb-1">เบอร์โทรศัพท์</label>
                        <input
                            type="tel"
                            id="phone"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                            placeholder="08x-xxx-xxxx"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </div>

                    {formMessage && (
                        <p className={`text-sm text-center ${formMessage.includes('ผิดพลาด') ? 'text-red-500' : 'text-green-600'}`}>
                            {formMessage}
                        </p>
                    )}

                    <button
                        onClick={handleRegister}
                        disabled={isSubmitting}
                        className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition disabled:bg-gray-400"
                    >
                        {isSubmitting ? 'กำลังลงทะเบียน...' : 'เริ่มต้นใช้งาน'}
                    </button>
                </div>
            </div>
        </div>
    );
}