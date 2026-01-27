"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { CheckCircle2, Mail, ArrowRight, Lock, User } from "lucide-react"
import Image from "next/image"

import { createClient } from "@/lib/supabase/client"
import { ensureUserRecord } from "@/app/actions/user"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function SignupPage() {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [signupSuccess, setSignupSuccess] = useState(false)
    const router = useRouter()
    const searchParams = useSearchParams()
    const redirect = searchParams.get("redirect") || "/dashboard"
    const supabase = createClient()

    const handleSignup = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setLoading(true)
        setError("")

        const { error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: name,
                },
                emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirect)}`,
            },
        })

        if (signUpError) {
            setError(signUpError.message)
            setLoading(false)
            return
        }

        // Create user record in public.users table
        try {
            await ensureUserRecord()
        } catch (e) {
            // Non-blocking - callback will also try to create the record
            console.warn("Could not create user record immediately:", e)
        }

        setSignupSuccess(true)
        setLoading(false)
    }

    const handleGoogleSignup = async () => {
        setLoading(true)
        setError("")

        try {
            const { error: signInError } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirect)}`,
                },
            })

            if (signInError) {
                setError(signInError.message)
                setLoading(false)
            }
        } catch (e) {
            console.error("Google signup error:", e)
            setError("An unexpected error occurred with Google signup. Please try again.")
            setLoading(false)
        }
    }

    if (signupSuccess) {
        return (
            <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10 bg-gradient-to-br from-background via-background to-primary/5">
                <motion.div
                    className="w-full max-w-lg space-y-6 rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-10 shadow-2xl"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                >
                    <div className="space-y-6 text-center">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg"
                        >
                            <CheckCircle2 className="w-10 h-10 text-white" />
                        </motion.div>

                        <div className="space-y-3">
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                Welcome to Networkly! 🎉
                            </h1>
                            <p className="text-base text-muted-foreground">
                                Your professional network journey begins now
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <motion.div
                            className="rounded-xl border border-border/50 bg-muted/30 p-5 space-y-4"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <Mail className="w-5 h-5 text-primary" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-semibold">Check your inbox</p>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        We've sent a verification link to <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-foreground">{email}</span>
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <CheckCircle2 className="w-5 h-5 text-primary" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-semibold">What's next?</p>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        After verifying, sign in to unlock AI-powered networking, opportunity discovery, and career insights
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="space-y-4"
                        >
                            <Button
                                onClick={() => router.push(`/login?redirect=${encodeURIComponent(redirect)}`)}
                                className="w-full h-12 relative overflow-hidden group text-base font-medium"
                                size="lg"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    Sign In to Get Started
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </span>
                            </Button>

                            <p className="text-center text-xs text-muted-foreground">
                                Can't find the email? Check your spam folder or{" "}
                                <button
                                    onClick={() => setSignupSuccess(false)}
                                    className="text-primary hover:underline underline-offset-2 font-medium"
                                >
                                    try again
                                </button>
                            </p>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen w-full">
            {/* Left Side - Visual Panel */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
                <div className="relative z-10 flex flex-col justify-center px-16 text-white">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="flex justify-center mb-12">
                            <Image src="/icon.svg" alt="Networkly" width={80} height={80} className="shrink-0" />
                        </div>
                        <h2 className="text-5xl font-bold mb-8 leading-tight">
                            Start your journey to
                            <br />
                            professional success
                        </h2>
                        <p className="text-xl text-white/90 mb-12 max-w-md">
                            Join thousands of professionals building meaningful connections and discovering opportunities.
                        </p>
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                    <i className='bx bx-brain text-2xl'></i>
                                </div>
                                <div>
                                    <p className="font-semibold">AI Career Assistant</p>
                                    <p className="text-sm text-white/80">Personalized career guidance and insights</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                    <i className='bx bx-trending-up text-2xl'></i>
                                </div>
                                <div>
                                    <p className="font-semibold">Track Your Growth</p>
                                    <p className="text-sm text-white/80">Analytics and insights on your progress</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                    <i className='bx bx-shield-alt-2 text-2xl'></i>
                                </div>
                                <div>
                                    <p className="font-semibold">Secure & Private</p>
                                    <p className="text-sm text-white/80">Your data is protected and encrypted</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
                {/* Animated gradient orbs */}
                <div className="absolute top-20 right-20 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
                <div className="absolute bottom-20 left-20 w-72 h-72 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
            </div>

            {/* Right Side - Signup Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-background">
                <motion.div
                    className="w-full max-w-md"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex justify-center mb-10">
                        <Image src="/icon.svg" alt="Networkly" width={60} height={60} />
                    </div>

                    <div className="space-y-3 mb-10">
                        <h2 className="text-3xl font-bold tracking-tight">Create your account</h2>
                        <p className="text-muted-foreground">Start building your professional network today</p>
                    </div>

                    <form onSubmit={handleSignup} className="space-y-6">
                        <div className="space-y-3">
                            <label className="text-sm font-medium flex items-center gap-2" htmlFor="name">
                                <User className="w-4 h-4 text-muted-foreground" />
                                Full name
                            </label>
                            <Input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                placeholder="Jane Doe"
                                required
                                className="h-11 transition-all focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-sm font-medium flex items-center gap-2" htmlFor="email">
                                <Mail className="w-4 h-4 text-muted-foreground" />
                                Email address
                            </label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                placeholder="you@example.com"
                                required
                                className="h-11 transition-all focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-sm font-medium flex items-center gap-2" htmlFor="password">
                                <Lock className="w-4 h-4 text-muted-foreground" />
                                Password
                            </label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                placeholder="Create a strong password"
                                required
                                className="h-11 transition-all focus:ring-2 focus:ring-primary/20"
                            />
                            <p className="text-xs text-muted-foreground">Must be at least 8 characters</p>
                        </div>
                        
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-3 rounded-lg bg-destructive/10 border border-destructive/20"
                            >
                                <p className="text-sm text-destructive">{error}</p>
                            </motion.div>
                        )}

                        <Button 
                            type="submit" 
                            className="w-full h-11 text-base font-medium group" 
                            disabled={loading}
                        >
                            {loading ? (
                                "Creating account..."
                            ) : (
                                <>
                                    Create account
                                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="my-8">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-border" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-3 text-muted-foreground font-medium">
                                    Or continue with
                                </span>
                            </div>
                        </div>
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        className="w-full h-11 font-medium hover:bg-accent transition-colors"
                        onClick={handleGoogleSignup}
                        disabled={loading}
                    >
                        <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
                            <path d="M1 1h22v22H1z" fill="none" />
                        </svg>
                        Continue with Google
                    </Button>

                    <p className="text-center text-sm text-muted-foreground mt-8">
                        Already have an account?{" "}
                        <a 
                            className="text-primary font-medium hover:underline underline-offset-4 transition-colors" 
                            href={`/login?redirect=${encodeURIComponent(redirect)}`}
                        >
                            Sign in
                        </a>
                    </p>
                </motion.div>
            </div>
        </div>
    )
}
