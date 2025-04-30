import { FormEventHandler } from 'react';
import Checkbox from '@/Components/Checkbox';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }: { status?: string, canResetPassword: boolean }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            {status && <div className="mb-4 font-medium text-sm text-green-600">{status}</div>}

            <form onSubmit={submit}>
                <div>
                    <InputLabel htmlFor="email" value="Email" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password" value="Password" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="block mt-4">
                    <label className="flex items-center">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                        />
                        <span className="ms-2 text-sm text-gray-600">Remember me</span>
                    </label>
                </div>

                <div className="flex items-center justify-end mt-4">
                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="underline text-sm text-gray-600 hover:text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Forgot your password?
                        </Link>
                    )}

                    <PrimaryButton className="ms-4" disabled={processing}>
                        Log in
                    </PrimaryButton>
                </div>
            </form>



                    {/* note for testing */}
                    
                    <div className="mt-6 text-sm text-gray-700">
                    <p className="font-semibold mb-2">Note: Use any of the following credentials to log in:</p>
                    
                                    <ul className="space-y-3">
                <li className="bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded-lg shadow-md">
                    <div className="flex justify-between items-center">
                    <span className="font-bold text-yellow-800 text-lg">[Admin]</span>
                    <span className="text-gray-500 text-sm">Account</span>
                    </div>
                    <div className="mt-2">
                    <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-700">Email:</span>
                        <span className="text-gray-900">admin@gmail.com</span>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                        <span className="font-medium text-gray-700">Password:</span>
                        <span className="text-gray-900">admin12345</span>
                    </div>
                    </div>
                </li>
                </ul>


             <div className="mt-5">
                <span className="font-bold text-yellow-800">[Branches]</span>
                <table className="min-w-full table-auto mt-3 border-collapse border border-gray-300">
                    <thead>
                    <tr className="bg-gray-100">
                        <th className="px-4 py-2 border border-gray-300 text-left">Email</th>
                        <th className="px-4 py-2 border border-gray-300 text-left">Password</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td className="px-4 py-2 border border-gray-300">sanmateo@gmail.com</td>
                        <td className="px-4 py-2 border border-gray-300">sanmateo12345</td>
                    </tr>
                    <tr>
                        <td className="px-4 py-2 border border-gray-300">cainta@gmail.com</td>
                        <td className="px-4 py-2 border border-gray-300">cainta12345</td>
                    </tr>
                    <tr>
                        <td className="px-4 py-2 border border-gray-300">pasig@gmail.com</td>
                        <td className="px-4 py-2 border border-gray-300">pasig12345</td>
                    </tr>
                    <tr>
                        <td className="px-4 py-2 border border-gray-300">makati@gmail.com</td>
                        <td className="px-4 py-2 border border-gray-300">makati12345</td>
                    </tr>
                    <tr>
                        <td className="px-4 py-2 border border-gray-300">quezoncity@gmail.com</td>
                        <td className="px-4 py-2 border border-gray-300">quezoncity12345</td>
                    </tr>
                    <tr>
                        <td className="px-4 py-2 border border-gray-300">sjdm@gmail.com</td>
                        <td className="px-4 py-2 border border-gray-300">sjdm12345</td>
                    </tr>
                    </tbody>
                </table>
                </div>


                </div>

        </GuestLayout>
    );
}
