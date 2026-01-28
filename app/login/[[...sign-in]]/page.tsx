"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowRight, Lock, Mail } from "lucide-react"
import Image from "next/image"

import { createClient } from "@/lib/supabase/client"
import { ensureUserRecord } from "@/app/actions/user"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const searchParams = useSearchParams()
    const redirect = searchParams.get("redirect") || "/dashboard"
    const supabase = createClient()

    const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setLoading(true)
        setError("")

        try {
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (signInError) {
                setError(signInError.message)
                setLoading(false)
                return
            }

            const ensureUserPromise = ensureUserRecord().catch((e) => {
                console.warn("Could not ensure user record:", e)
            })

            await Promise.race([
                ensureUserPromise,
                new Promise((resolve) => setTimeout(resolve, 2000)),
            ])

            window.location.href = redirect
        } catch (e) {
            console.error("Login error:", e)
            setError("An unexpected error occurred. Please try again.")
            setLoading(false)
        }
    }

    const handleGoogleLogin = async () => {
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
            console.error("Google login error:", e)
            setError("An unexpected error occurred with Google login. Please try again.")
            setLoading(false)
        }
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
                            <Image src="/networkly-logo-new.png" alt="Networkly" width={200} height={80} className="shrink-0" />
                        </div>
                        <h2 className="text-5xl font-bold mb-8 leading-tight">
                            Welcome back to your
                            <br />
                            professional network
                        </h2>
                        <p className="text-xl text-white/90 mb-12 max-w-md">
                            Continue building meaningful connections and discovering opportunities powered by AI.
                        </p>
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                    <i className='bx bx-network-chart text-2xl'></i>
                                </div>
                                <div>
                                    <p className="font-semibold">Smart Networking</p>
                                    <p className="text-sm text-white/80">AI-powered connection recommendations</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                    <i className='bx bx-briefcase text-2xl'></i>
                                </div>
                                <div>
                                    <p className="font-semibold">Opportunity Discovery</p>
                                    <p className="text-sm text-white/80">Find jobs, internships, and projects</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
                {/* Animated gradient orbs */}
                <div className="absolute top-20 right-20 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
                <div className="absolute bottom-20 left-20 w-72 h-72 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
            </div>

            {/* Right Side - Login Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-background">
                <motion.div
                    className="w-full max-w-md"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex justify-center mb-10">
                        <Image src="/networkly-logo-new.png" alt="Networkly" width={160} height={60} />
                    </div>

                    <div className="space-y-3 mb-10">
                        <h2 className="text-3xl font-bold tracking-tight">Sign in</h2>
                        <p className="text-muted-foreground">Enter your credentials to access your account</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
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
                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2" htmlFor="password">
                                <Lock className="w-4 h-4 text-muted-foreground" />
                                Password
                            </label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                placeholder="Enter your password"
                                required
                                className="h-11 transition-all focus:ring-2 focus:ring-primary/20"
                            />
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
                                "Signing in..."
                            ) : (
                                <>
                                    Sign in
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
                        onClick={handleGoogleLogin}
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
                        Don&apos;t have an account?{" "}
                        <a 
                            className="text-primary font-medium hover:underline underline-offset-4 transition-colors" 
                            href={`/signup?redirect=${encodeURIComponent(redirect)}`}
                        >
                            Sign up for free
                        </a>
                    </p>
                </motion.div>
            </div>
        </div>
    )
}
