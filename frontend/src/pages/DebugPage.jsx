import { useAuthStore } from '../store';

const DebugPage = () => {
    const authState = useAuthStore();

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4">
                <h1 className="text-3xl font-bold mb-6">🐛 Auth Debug Info</h1>

                <div className="card p-6 mb-4">
                    <h2 className="text-xl font-bold mb-4">Auth State:</h2>
                    <pre className="bg-gray-100 p-4 rounded overflow-auto">
                        {JSON.stringify(authState, null, 2)}
                    </pre>
                </div>

                <div className="card p-6">
                    <h2 className="text-xl font-bold mb-4">LocalStorage:</h2>
                    <pre className="bg-gray-100 p-4 rounded overflow-auto">
                        {JSON.stringify({
                            'auth-storage': localStorage.getItem('auth-storage'),
                            'token': localStorage.getItem('token')
                        }, null, 2)}
                    </pre>
                </div>

                <div className="mt-6">
                    <h3 className="font-bold mb-2">Quick Checks:</h3>
                    <ul className="space-y-2">
                        <li>✓ Is Authenticated: {authState.isAuthenticated ? '✅ YES' : '❌ NO'}</li>
                        <li>✓ User: {authState.user ? '✅ EXISTS' : '❌ NULL'}</li>
                        <li>✓ Role: {authState.user?.role || '❌ NOT SET'}</li>
                        <li>✓ First Name: {authState.user?.first_name || '❌ NOT SET'}</li>
                        <li>✓ Last Name: {authState.user?.last_name || '❌ NOT SET'}</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default DebugPage;
