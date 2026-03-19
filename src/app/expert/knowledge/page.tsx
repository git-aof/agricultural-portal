'use client';

import { useEffect, useState } from 'react';
import liff from '@line/liff';
import { supabase } from '@/src/lib/supabase';

export default function KnowledgeHubPage() {
    const [articles, setArticles] = useState<any[]>([]);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchArticles();
    }, []);

    const fetchArticles = async () => {
        try {
            const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
            if (liffId) await liff.init({ liffId });

            // ในความเป็นจริงควรดึงเฉพาะของผู้ใช้คนนั้น หรือทั้งหมดถ้าเป็น admin
            const { data } = await supabase
                .from('articles')
                .select('*')
                .order('created_at', { ascending: false });

            setArticles(data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handlePostArticle = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!liff.isLoggedIn()) return;

        const profile = await liff.getProfile();
        const { error } = await supabase.from('articles').insert([{
            author_id: profile.userId,
            title,
            content,
            video_url: videoUrl,
            category: 'general'
        }]);

        if (!error) {
            alert('ลงบทความเรียบร้อย');
            setTitle(''); setContent(''); setVideoUrl('');
            fetchArticles();
        } else {
            alert('เกิดข้อผิดพลาด: ' + error.message);
        }
    };

    if (loading) return <div className="p-10 text-center">กำลังโหลดบทความ...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <h1 className="text-2xl font-bold text-teal-700 mb-6">📚 Knowledge Hub</h1>

            <form onSubmit={handlePostArticle} className="bg-white p-5 rounded-xl shadow-sm mb-8 space-y-3 border-t-4 border-teal-500">
                <h3 className="font-bold text-gray-700">สร้างบทความใหม่ / คลิปความรู้</h3>
                <input
                    className="w-full p-2 border rounded-lg"
                    placeholder="หัวข้อเรื่อง (เช่น วิธีแก้โรคใบไหม้)"
                    value={title} onChange={e => setTitle(e.target.value)} required
                />
                <textarea
                    className="w-full p-2 border rounded-lg h-24"
                    placeholder="เนื้อหาความรู้..."
                    value={content} onChange={e => setContent(e.target.value)} required
                />
                <input
                    className="w-full p-2 border rounded-lg"
                    placeholder="ลิงก์ YouTube (ถ้ามี)"
                    value={videoUrl} onChange={e => setVideoUrl(e.target.value)}
                />
                <button className="w-full bg-teal-600 text-white py-2 rounded-lg font-bold">โพสต์ความรู้</button>
            </form>

            <div className="space-y-4">
                <h3 className="font-bold text-gray-700">บทความล่าสุด</h3>
                {articles.map(a => (
                    <div key={a.id} className="bg-white p-4 rounded-xl shadow-sm">
                        <h4 className="font-bold text-gray-800 text-lg">{a.title}</h4>
                        <p className="text-gray-600 text-sm mt-1 line-clamp-3">{a.content}</p>
                        {a.video_url && (
                            <a href={a.video_url} target="_blank" className="text-blue-500 text-sm underline mt-2 block">
                                📺 ดูคลิปประกอบ
                            </a>
                        )}
                        <div className="mt-2 text-xs text-gray-400 text-right">
                            {new Date(a.created_at).toLocaleDateString('th-TH')}
                        </div>
                    </div>
                ))}
                {articles.length === 0 && <p className="text-center text-gray-400">ยังไม่มีบทความ</p>}
            </div>
        </div>
    );
}
