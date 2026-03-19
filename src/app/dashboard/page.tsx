'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import liff from '@line/liff';
//import { type Profile } from '@line/liff';

export default function DashboardPage() {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const initLiff = async () => {
            try {
                const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
                if (liffId) {
                    await liff.init({ liffId });
                    if (liff.isLoggedIn()) {
                        const userProfile = await liff.getProfile();
                        setProfile(userProfile);
                    } else {
                        liff.login();
                    }
                }
            } catch (err) {
                console.error('LIFF Init failed', err);
            } finally {
                setLoading(false);
            }
        };
        initLiff();
    }, []);

    if (loading) return <div className="p-10 text-center text-green-600">กำลังโหลดข้อมูล...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <header className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">สวัสดี,</h1>
                    <p className="text-green-600 font-medium">{profile?.displayName || 'เกษตรกร'}</p>
                </div>
                {profile?.pictureUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={profile.pictureUrl}
                        alt="Profile"
                        className="w-12 h-12 rounded-full border-2 border-green-500"
                    />
                )}
            </header>

            <div className="grid grid-cols-1 gap-6">

                {/* ส่วนของผู้รับจ้าง (Service Providers) */}
                <div className="grid grid-cols-2 gap-4">
                    <div
                        onClick={() => router.push('/jobs/feed')}
                        className="bg-blue-50 p-4 rounded-xl border border-blue-200 active:scale-95 transition-transform cursor-pointer text-center"
                    >
                        <div className="text-3xl mb-2">🔍</div>
                        <h2 className="font-bold text-blue-800 text-sm">หางาน</h2>
                        <p className="text-xs text-blue-600">ดูงานใกล้ตัว</p>
                    </div>
                    <div
                        onClick={() => router.push('/schedule')}
                        className="bg-purple-50 p-4 rounded-xl border border-purple-200 active:scale-95 transition-transform cursor-pointer text-center"
                    >
                        <div className="text-3xl mb-2">📅</div>
                        <h2 className="font-bold text-purple-800 text-sm">งานของฉัน</h2>
                        <p className="text-xs text-purple-600">ตารางนัดหมาย</p>
                    </div>
                </div>

                <hr className="border-gray-200 my-2" />

                {/* ส่วนของร้านค้า (Vendors) */}
                <div className="grid grid-cols-3 gap-2">
                    <div onClick={() => router.push('/shop/products')} className="bg-orange-50 p-3 rounded-xl border border-orange-200 active:scale-95 transition-transform cursor-pointer text-center">
                        <div className="text-2xl mb-1">📦</div>
                        <p className="text-xs text-orange-800 font-bold">สต็อกสินค้า</p>
                    </div>
                    <div onClick={() => router.push('/shop/orders')} className="bg-orange-50 p-3 rounded-xl border border-orange-200 active:scale-95 transition-transform cursor-pointer text-center">
                        <div className="text-2xl mb-1">📃</div>
                        <p className="text-xs text-orange-800 font-bold">ออเดอร์</p>
                    </div>
                    <div onClick={() => router.push('/shop/broadcast')} className="bg-orange-50 p-3 rounded-xl border border-orange-200 active:scale-95 transition-transform cursor-pointer text-center">
                        <div className="text-2xl mb-1">📢</div>
                        <p className="text-xs text-orange-800 font-bold">บรอดแคสต์</p>
                    </div>
                </div>

                <hr className="border-gray-200 my-2" />

                {/* ส่วนของผู้เชี่ยวชาญ (Experts) */}
                <div className="grid grid-cols-2 gap-4">
                    <div onClick={() => router.push('/expert/knowledge')} className="bg-teal-50 p-4 rounded-xl border border-teal-200 active:scale-95 transition-transform cursor-pointer text-center">
                        <div className="text-3xl mb-2">📚</div>
                        <h2 className="font-bold text-teal-800 text-sm">คลังความรู้</h2>
                        <p className="text-xs text-teal-600">ลงบทความ/คลิป</p>
                    </div>
                    <div onClick={() => router.push('/expert/consults')} className="bg-indigo-50 p-4 rounded-xl border border-indigo-200 active:scale-95 transition-transform cursor-pointer text-center">
                        <div className="text-3xl mb-2">💬</div>
                        <h2 className="font-bold text-indigo-800 text-sm">ตอบคำถาม</h2>
                        <p className="text-xs text-indigo-600">ให้คำปรึกษา</p>
                    </div>
                </div>

                <hr className="border-gray-200 my-2" />

                {/* ฟีเจอร์ที่ 1: Job Posting */}
                <div
                    onClick={() => router.push('/jobs/create')}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-green-100 active:scale-95 transition-transform cursor-pointer flex items-center space-x-4"
                >
                    <div className="bg-green-100 p-4 rounded-full text-3xl">🚜</div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">ประกาศจ้างงาน</h2>
                        <p className="text-sm text-gray-500">หาคนขับรถไถ โดรน หรือรถเกี่ยว</p>
                    </div>
                </div>

                {/* ฟีเจอร์ที่ 2: Expert Chat */}
                <div
                    onClick={() => alert('ฟีเจอร์ Chat กำลังพัฒนาครับ')}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100 active:scale-95 transition-transform cursor-pointer flex items-center space-x-4"
                >
                    <div className="bg-blue-100 p-4 rounded-full text-3xl">👨‍⚕️</div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">ปรึกษาผู้เชี่ยวชาญ</h2>
                        <p className="text-sm text-gray-500">สอบถามโรคพืช การใช้ปุ๋ย</p>
                    </div>
                </div>

                {/* ฟีเจอร์ที่ 3: Marketplace */}
                <div
                    onClick={() => alert('ฟีเจอร์ Marketplace กำลังพัฒนาครับ')}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100 active:scale-95 transition-transform cursor-pointer flex items-center space-x-4"
                >
                    <div className="bg-orange-100 p-4 rounded-full text-3xl">🛒</div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">ร้านค้าเกษตร</h2>
                        <p className="text-sm text-gray-500">สั่งปุ๋ย ยา เมล็ดพันธุ์ใกล้บ้าน</p>
                    </div>
                </div>
            </div>

            <div className="mt-8 text-center">
                <button className="text-gray-400 text-sm underline" onClick={() => liff.closeWindow()}>
                    ปิดหน้าต่าง
                </button>
            </div>
        </div>
    );
}
