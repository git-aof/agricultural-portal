'use client';

import { useEffect, useState } from 'react';
import liff from '@line/liff';
import { supabase } from '@/src/lib/supabase';

export default function ProductCatalogPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMyProducts();
    }, []);

    const fetchMyProducts = async () => {
        try {
            const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
            if (liffId) await liff.init({ liffId });
            if (!liff.isLoggedIn()) return;

            const profile = await liff.getProfile();
            const { data } = await supabase
                .from('products')
                .select('*')
                .eq('vendor_id', profile.userId)
                .order('created_at', { ascending: false });

            setProducts(data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!liff.isLoggedIn()) return;

        const profile = await liff.getProfile();
        const { error } = await supabase.from('products').insert([{
            vendor_id: profile.userId,
            name,
            price: parseFloat(price),
            stock: parseInt(stock),
            category: 'general'
        }]);

        if (!error) {
            alert('เพิ่มสินค้าเรียบร้อย');
            setName(''); setPrice(''); setStock('');
            fetchMyProducts();
        } else {
            alert('เกิดข้อผิดพลาด: ' + error.message);
        }
    };

    if (loading) return <div className="p-10 text-center">กำลังโหลดข้อมูลสินค้า...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <h1 className="text-2xl font-bold text-orange-700 mb-6">📦 จัดการสินค้า (Catalog)</h1>

            <form onSubmit={handleAddProduct} className="bg-white p-5 rounded-xl shadow-sm mb-8 space-y-3">
                <h3 className="font-bold text-gray-700">เพิ่มสินค้าใหม่</h3>
                <input
                    className="w-full p-2 border rounded-lg"
                    placeholder="ชื่อสินค้า (เช่น ปุ๋ยยูเรีย 50kg)"
                    value={name} onChange={e => setName(e.target.value)} required
                />
                <div className="flex gap-2">
                    <input
                        type="number" className="w-1/2 p-2 border rounded-lg"
                        placeholder="ราคา (บาท)"
                        value={price} onChange={e => setPrice(e.target.value)} required
                    />
                    <input
                        type="number" className="w-1/2 p-2 border rounded-lg"
                        placeholder="สต็อก (ชิ้น)"
                        value={stock} onChange={e => setStock(e.target.value)} required
                    />
                </div>
                <button className="w-full bg-orange-600 text-white py-2 rounded-lg font-bold">บันทึกสินค้า</button>
            </form>

            <div className="space-y-4">
                <h3 className="font-bold text-gray-700">สินค้าของคุณ ({products.length})</h3>
                {products.map(p => (
                    <div key={p.id} className="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center">
                        <div>
                            <div className="font-bold text-gray-800">{p.name}</div>
                            <div className="text-sm text-gray-500">คงเหลือ: {p.stock} ชิ้น</div>
                        </div>
                        <div className="text-right">
                            <div className="text-orange-600 font-bold">฿{p.price}</div>
                            <button className="text-xs text-red-500 underline mt-1" onClick={async () => {
                                if (!confirm('ลบสินค้านี้?')) return;
                                await supabase.from('products').delete().eq('id', p.id);
                                fetchMyProducts();
                            }}>ลบ</button>
                        </div>
                    </div>
                ))}
                {products.length === 0 && <p className="text-center text-gray-400">ยังไม่มีสินค้า</p>}
            </div>
        </div>
    );
}
