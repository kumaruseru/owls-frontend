'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User as UserIcon, Mail, Phone, MapPin, Save, Loader2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuthStore, type User } from '@/store/auth-store';

// GHN Address types
interface GHNProvince {
    ProvinceID: number;
    ProvinceName: string;
}

interface GHNDistrict {
    DistrictID: number;
    DistrictName: string;
}

interface GHNWard {
    WardCode: string;
    WardName: string;
}

const profileSchema = z.object({
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    district: z.string().optional(),
    ward: z.string().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

interface ProfileTabProps {
    user: User | null;
}

export function ProfileTab({ user }: ProfileTabProps) {
    const { updateProfile } = useAuthStore();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    // GHN Address State
    const [provinces, setProvinces] = useState<GHNProvince[]>([]);
    const [districts, setDistricts] = useState<GHNDistrict[]>([]);
    const [wards, setWards] = useState<GHNWard[]>([]);

    const [selectedProvinceId, setSelectedProvinceId] = useState<number | null>(null);
    const [selectedDistrictId, setSelectedDistrictId] = useState<number | null>(null);
    const [selectedWardCode, setSelectedWardCode] = useState<string | null>(null);

    const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);
    const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
    const [isLoadingWards, setIsLoadingWards] = useState(false);

    const profileForm = useForm<ProfileForm>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            first_name: '',
            last_name: '',
            email: '',
            phone: '',
            address: '',
            city: '',
            district: '',
            ward: '',
        },
    });

    // 1. Initial Data Load (User & Provinces)
    useEffect(() => {
        const initData = async () => {
            // Load Provinces
            setIsLoadingProvinces(true);
            try {
                const res = await api.get('/shipping/ghn/provinces/');
                setProvinces(res.data || []);
            } catch (error) {
                console.error('Failed to fetch provinces', error);
            } finally {
                setIsLoadingProvinces(false);
            }

            // Set User Data
            if (user && !isInitialized) {
                profileForm.reset({
                    first_name: user.first_name || '',
                    last_name: user.last_name || '',
                    email: user.email || '',
                    phone: user.phone || '',
                    address: user.address || '',
                    city: user.city || '',
                    district: user.district || '',
                    ward: user.ward || '',
                });

                if (user.province_id) setSelectedProvinceId(user.province_id);
                setIsInitialized(true);
            }
        };

        initData();
    }, [user, isInitialized, profileForm]);

    // 2. Fetch Districts
    useEffect(() => {
        if (!selectedProvinceId) {
            setDistricts([]);
            setWards([]);
            return;
        }

        const fetchDistricts = async () => {
            setIsLoadingDistricts(true);
            try {
                const response = await api.get(`/shipping/ghn/districts/${selectedProvinceId}/`);
                setDistricts(response.data || []);

                if (user?.district_id && user?.province_id === selectedProvinceId && !selectedDistrictId) {
                    setSelectedDistrictId(user.district_id);
                }
            } catch (error) {
                console.error('Failed to fetch districts:', error);
            } finally {
                setIsLoadingDistricts(false);
            }
        };
        fetchDistricts();
    }, [selectedProvinceId, user, selectedDistrictId]);

    // 3. Fetch Wards
    useEffect(() => {
        if (!selectedDistrictId) {
            setWards([]);
            return;
        }

        const fetchWards = async () => {
            setIsLoadingWards(true);
            try {
                const response = await api.get(`/shipping/ghn/wards/${selectedDistrictId}/`);
                setWards(response.data || []);

                if (user?.ward_code && user?.district_id === selectedDistrictId && !selectedWardCode) {
                    setSelectedWardCode(user.ward_code);
                }
            } catch (error) {
                console.error('Failed to fetch wards:', error);
            } finally {
                setIsLoadingWards(false);
            }
        };
        fetchWards();
    }, [selectedDistrictId, user, selectedWardCode]);


    //Handlers

    const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const provinceId = parseInt(e.target.value);
        const province = provinces.find(p => p.ProvinceID === provinceId);

        setSelectedProvinceId(provinceId || null);
        setSelectedDistrictId(null);
        setSelectedWardCode(null);
        setDistricts([]);
        setWards([]);

        profileForm.setValue('city', province?.ProvinceName || '');
        profileForm.setValue('district', '');
        profileForm.setValue('ward', '');
    };

    const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const districtId = parseInt(e.target.value);
        const district = districts.find(d => d.DistrictID === districtId);

        setSelectedDistrictId(districtId || null);
        setSelectedWardCode(null);
        setWards([]);

        profileForm.setValue('district', district?.DistrictName || '');
        profileForm.setValue('ward', '');
    };

    const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const wardCode = e.target.value;
        const ward = wards.find(w => w.WardCode === wardCode);

        setSelectedWardCode(wardCode || null);
        profileForm.setValue('ward', ward?.WardName || '');
    };

    const onUpdateProfile = async (data: ProfileForm) => {
        setIsSubmitting(true);
        try {
            if (selectedProvinceId && !selectedDistrictId) {
                toast.error("Vui lòng chọn Quận/Huyện");
                setIsSubmitting(false);
                return;
            }
            if (selectedDistrictId && !selectedWardCode) {
                toast.error("Vui lòng chọn Phường/Xã");
                setIsSubmitting(false);
                return;
            }

            const payload = {
                ...data,
                province_id: selectedProvinceId,
                district_id: selectedDistrictId,
                ward_code: selectedWardCode,
            };

            await updateProfile(payload);
            toast.success('Cập nhật thành công!');
        } catch (error: any) {
            console.error('Update profile error:', error);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const err = error as any;

            toast.error(err.response?.data?.error || 'Cập nhật thất bại');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl shadow-purple-900/5 transition-all hover:bg-white/[0.07]">
                <h2 className="text-xl font-bold text-white mb-8 border-b border-white/10 pb-4 flex items-center gap-3">
                    <div className="p-2 bg-purple-500/10 rounded-xl">
                        <UserIcon className="text-purple-400" size={20} />
                    </div>
                    Thông tin cá nhân
                </h2>

                <form onSubmit={profileForm.handleSubmit(onUpdateProfile)} className="space-y-8">
                    {/* Name Section */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-1">Họ</label>
                            <Input
                                {...profileForm.register('first_name')}
                                placeholder="Nguyễn Văn"
                                className="bg-black/20 border-white/10 h-12 rounded-xl focus:border-purple-500/50 transition-all text-white placeholder:text-neutral-600"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-1">Tên</label>
                            <Input
                                {...profileForm.register('last_name')}
                                placeholder="A"
                                className="bg-black/20 border-white/10 h-12 rounded-xl focus:border-purple-500/50 transition-all text-white placeholder:text-neutral-600"
                            />
                        </div>
                    </div>

                    {/* Contact Section */}
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-1">Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-hover:text-neutral-400 transition-colors" size={18} />
                                <Input
                                    {...profileForm.register('email')}
                                    disabled
                                    className="pl-11 bg-white/5 border-white/5 h-12 rounded-xl text-neutral-500 cursor-not-allowed font-mono text-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-1">Số điện thoại</label>
                            <div className="relative group">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-purple-400 transition-colors" size={18} />
                                <Input
                                    {...profileForm.register('phone')}
                                    placeholder="0912 345 678"
                                    className="pl-11 bg-black/20 border-white/10 h-12 rounded-xl focus:border-purple-500/50 transition-all text-white placeholder:text-neutral-600 font-mono"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Address Section */}
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-1">Địa chỉ chi tiết</label>
                            <div className="relative group">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-purple-400 transition-colors" size={18} />
                                <Input
                                    {...profileForm.register('address')}
                                    placeholder="Số nhà, tên đường, tòa nhà..."
                                    className="pl-11 bg-black/20 border-white/10 h-12 rounded-xl focus:border-purple-500/50 transition-all text-white placeholder:text-neutral-600"
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                            {/* Province Dropdown */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-1">Tỉnh / Thành phố</label>
                                <div className="relative">
                                    <select
                                        onChange={handleProvinceChange}
                                        value={selectedProvinceId || ''}
                                        className="w-full h-12 bg-black/20 border border-white/10 rounded-xl text-white px-4 pr-10 appearance-none focus:border-purple-500/50 focus:ring-0 outline-none transition-all hover:bg-white/5 cursor-pointer"
                                        disabled={isLoadingProvinces}
                                    >
                                        <option value="" className="bg-neutral-900 text-neutral-400">-- Chọn tỉnh/thành --</option>
                                        {provinces.map((province) => (
                                            <option key={province.ProvinceID} value={province.ProvinceID} className="bg-neutral-900">
                                                {province.ProvinceName}
                                            </option>
                                        ))}
                                    </select>
                                    {isLoadingProvinces ? (
                                        <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-neutral-500" />
                                    ) : (
                                        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
                                    )}
                                </div>
                                <input type="hidden" {...profileForm.register('city')} />
                            </div>

                            {/* District Dropdown */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-1">Quận / Huyện</label>
                                <div className="relative">
                                    <select
                                        onChange={handleDistrictChange}
                                        value={selectedDistrictId || ''}
                                        className="w-full h-12 bg-black/20 border border-white/10 rounded-xl text-white px-4 pr-10 appearance-none focus:border-purple-500/50 focus:ring-0 outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:bg-white/5 cursor-pointer"
                                        disabled={!selectedProvinceId || isLoadingDistricts}
                                    >
                                        <option value="" className="bg-neutral-900 text-neutral-400">-- Chọn quận/huyện --</option>
                                        {districts.map((district) => (
                                            <option key={district.DistrictID} value={district.DistrictID} className="bg-neutral-900">
                                                {district.DistrictName}
                                            </option>
                                        ))}
                                    </select>
                                    {isLoadingDistricts ? (
                                        <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-neutral-500" />
                                    ) : (
                                        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
                                    )}
                                </div>
                                <input type="hidden" {...profileForm.register('district')} />
                            </div>

                            {/* Ward Dropdown */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-1">Phường / Xã</label>
                                <div className="relative">
                                    <select
                                        onChange={handleWardChange}
                                        value={selectedWardCode || ''}
                                        className="w-full h-12 bg-black/20 border border-white/10 rounded-xl text-white px-4 pr-10 appearance-none focus:border-purple-500/50 focus:ring-0 outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:bg-white/5 cursor-pointer"
                                        disabled={!selectedDistrictId || isLoadingWards}
                                    >
                                        <option value="" className="bg-neutral-900 text-neutral-400">-- Chọn phường/xã --</option>
                                        {wards.map((ward) => (
                                            <option key={ward.WardCode} value={ward.WardCode} className="bg-neutral-900">
                                                {ward.WardName}
                                            </option>
                                        ))}
                                    </select>
                                    {isLoadingWards ? (
                                        <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-neutral-500" />
                                    ) : (
                                        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
                                    )}
                                </div>
                                <input type="hidden" {...profileForm.register('ward')} />
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-white/10 flex justify-end">
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            size="xl"
                            className="w-full md:w-auto rounded-xl bg-white text-black hover:bg-neutral-200 font-bold uppercase tracking-wider text-sm transition-all shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] hover:shadow-[0_0_25px_-5px_rgba(255,255,255,0.5)]"
                        >
                            {isSubmitting ? <Loader2 size={18} className="animate-spin mr-2" /> : <Save size={18} className="mr-2" />}
                            Lưu thay đổi
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
