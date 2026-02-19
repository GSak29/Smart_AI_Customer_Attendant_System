import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardContent, CardDescription, CardFooter, CardTitle } from '../components/ui/Card';
import { Loader2 } from 'lucide-react';
import { adminCredentials } from '../config/adminCredentials';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login, signup } = useAuth();
    const navigate = useNavigate();



    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await login(email, password);
            navigate('/');
        } catch (err: any) {
            console.error("Login error:", err);

            // Auto-Create Admin Logic
            if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
                // Check if the credentials match the admin config
                if (email === adminCredentials.email && password === adminCredentials.password) {
                    try {
                        console.log("Admin account not found. Attempting to create it...");
                        // We need access to signup function, but it's available via useAuth context
                        // However, we need to make sure we can import/use it. 
                        // The `login` and `signup` in context are wrappers around firebase functions.
                        // Let's use the `signup` from context if available, or import createUserWithEmailAndPassword directly?
                        // Context is cleaner. But `signup` is not destructured above.
                        // I will destructure `signup` from `useAuth` first.
                        await signup(email, password);
                        console.log("Admin account created! Logging in...");
                        // After signup, Firebase usually auto-logs in.
                        navigate('/');
                        return;
                    } catch (signupErr: any) {
                        console.error("Auto-signup failed:", signupErr);
                        setError("Failed to create admin account. Check console.");
                    }
                } else {
                    setError('Invalid email or password.');
                }
            } else if (err.code === 'auth/configuration-not-found') {
                setError('Error: Authentication not enabled in Firebase Console. Please enable Email/Password provider.');
            } else {
                setError(err.message || 'Login failed');
            }
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
                    <CardDescription className="text-center">
                        Enter your email and password to access the admin panel
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Email</label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Password</label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        {error && <div className="text-sm text-destructive">{error}</div>}
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Sign In
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                    {/* Signup option removed as per request */}
                    <p className="text-xs text-muted-foreground text-center">
                        Secure Admin Access
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
};

export default Login;
