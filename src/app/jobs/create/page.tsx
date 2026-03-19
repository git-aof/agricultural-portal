'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import liff from '@line/liff';
import { supabase } from '@/src/lib/supabase';

export default function CreateJobPage() {
    const router = useRouter();
    const [jobType, setJobType] = useState('tractor');
    const [description, setDescription] = useState('');
    const [phone, setPhone] = useState('');
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');

    useEffect(() => {
        const initLiff = async () => {
            try {
                const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
                if (liffId) await liff.init({ liffId });
            } catch (e) {
                console.error(e);
            }
        };
        initLiff();
    }, []);

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            setStatusMessage('เบราว์เซอร์ของคุณไม่รองรับการระบุตำแหน่ง');
            return;
        }
        setStatusMessage('กำลังดึงตำแหน่ง...');
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
                setStatusMessage('ได้พิกัดเรียบร้อยแล้ว ✅');
            },
            () => {
                setStatusMessage('ไม่สามารถดึงตำแหน่งได้ กรุณาเปิด GPS');
            }
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (!liff.isLoggedIn()) {
            alert('กรุณาล็อกอิน LINE ก่อนใช้งาน');
            liff.login();
            return;
        }

        const profile = await liff.getProfile();

        const { error } = await supabase.from('jobs').insert([
            {
                farmer_id: profile.userId,
                job_type: jobType,
                description: description,
                contact_phone: phone,
                location_lat: location?.lat,
                location_lng: location?.lng,
                status: 'open'
            }
        ]);

        if (error) {
            console.error(error);
            alert('เกิดข้อผิดพลาด: ' + error.message);
        } else {
            alert('ประกาศงานเรียบร้อยแล้ว!');
            router.push('/dashboard');
        }
        setIsSubmitting(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <h1 className="text-2xl font-bold text-green-700 mb-6 text-center">🚜 ประกาศหาผู้รับจ้าง</h1>

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ประเภทงาน</label>
                    <select
                        className="w-full p-3 border rounded-lg bg-white"
                        value={jobType}
                        onChange={(e) => setJobType(e.target.value)}
                    >
                        <option value="tractor">รถไถ / เตรียมดิน</option>
                        <option value="drone">โดรนพ่นยา / หว่านปุ๋ย</option>
                        <option value="harvester">รถเกี่ยวข้าว</option>
                        <option value="labor">แรงงานคน</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">รายละเอียดงาน (เช่น ขนาดพื้นที่)</label>
                    <textarea
                        className="w-full p-3 border rounded-lg"
                        rows={3}
                        placeholder="เช่น พื้นที่ 10 ไร่ บ้านหนอง..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">เบอร์โทรติดต่อ</label>
                    <input
                        type="tel"
                        className="w-full p-3 border rounded-lg"
                        placeholder="08x-xxx-xxxx"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                    />
                </div>

                <div className="pt-2">
                    <button type="button" onClick={handleGetLocation} className="text-blue-600 underline text-sm mb-2 block">
                        📍 กดเพื่อปักหมุดพิกัดแปลงนา (GPS)
                    </button>
                    {statusMessage && <p className="text-xs text-gray-600">{statusMessage}</p>}
                </div>

                <button disabled={isSubmitting} className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 mt-4">
                    {isSubmitting ? 'กำลังบันทึก...' : 'ยืนยันการจ้างงาน'}
                </button>
            </form>
        </div>
    );
}
