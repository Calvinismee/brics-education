import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { useForm, usePage } from '@inertiajs/react';
import { toast } from 'sonner';

export default function UpdateProfileInformation({
    className = '',
}) {
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name ?? '',
            gender: user.gender ?? '',
            phone: user.phone ?? '',
            school_origin: user.school_origin ?? '',
        });

    const submit = (e) => {
        e.preventDefault();

        patch(route('profile.update'), {
            preserveScroll: true,
            onSuccess: () => toast.success('Profil berhasil diperbarui.'),
            onError: (formErrors) => {
                toast.error(Object.values(formErrors)[0] || 'Gagal memperbarui profil.');
            },
        });
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-bold text-gray-900">
                    Data Diri Siswa
                </h2>

                <p className="mt-1 text-sm text-gray-600">
                    Perbarui data identitas yang digunakan pada akun belajar.
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 grid gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                    <InputLabel htmlFor="name" value="Nama Lengkap" />

                    <TextInput
                        id="name"
                        className="mt-1 block w-full rounded-xl border-[#D8D7BE] bg-[#FDFCF8] px-4 py-3 text-sm focus:border-[#691D1B] focus:ring-[#691D1B]"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        isFocused
                        autoComplete="name"
                        placeholder="Masukkan nama lengkap"
                    />

                    <InputError className="mt-2" message={errors.name} />
                </div>

                <div>
                    <InputLabel htmlFor="gender" value="Jenis Kelamin" />

                    <select
                        id="gender"
                        className="mt-1 block w-full rounded-xl border-[#D8D7BE] bg-[#FDFCF8] px-4 py-3 text-sm shadow-sm focus:border-[#691D1B] focus:ring-[#691D1B]"
                        value={data.gender}
                        onChange={(e) => setData('gender', e.target.value)}
                    >
                        <option value="">Pilih jenis kelamin</option>
                        <option value="male">Laki-laki</option>
                        <option value="female">Perempuan</option>
                    </select>

                    <InputError className="mt-2" message={errors.gender} />
                </div>

                <div>
                    <InputLabel htmlFor="phone" value="No Telepon/WhatsApp" />

                    <TextInput
                        id="phone"
                        type="tel"
                        className="mt-1 block w-full rounded-xl border-[#D8D7BE] bg-[#FDFCF8] px-4 py-3 text-sm focus:border-[#691D1B] focus:ring-[#691D1B]"
                        value={data.phone}
                        onChange={(e) => setData('phone', e.target.value)}
                        autoComplete="tel"
                        placeholder="Contoh: 081234567890"
                    />

                    <InputError className="mt-2" message={errors.phone} />
                </div>

                <div className="md:col-span-2">
                    <InputLabel htmlFor="school_origin" value="Sekolah Asal" />

                    <TextInput
                        id="school_origin"
                        className="mt-1 block w-full rounded-xl border-[#D8D7BE] bg-[#FDFCF8] px-4 py-3 text-sm focus:border-[#691D1B] focus:ring-[#691D1B]"
                        value={data.school_origin}
                        onChange={(e) => setData('school_origin', e.target.value)}
                        autoComplete="organization"
                        placeholder="Masukkan nama sekolah asal"
                    />

                    <InputError className="mt-2" message={errors.school_origin} />
                </div>

                <div className="flex items-center gap-4 md:col-span-2">
                    <PrimaryButton disabled={processing}>
                        {processing ? 'Menyimpan...' : 'Simpan Profil'}
                    </PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-gray-600">
                            Tersimpan.
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
