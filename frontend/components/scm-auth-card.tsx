"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Eye, EyeOff } from "lucide-react"

interface PasswordStrength {
  score: number
  text: string
  color: string
}

export function SCMAuthCard() {
  // Login state
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [showLoginPassword, setShowLoginPassword] = useState(false)

  // Sign up state
  const [signupName, setSignupName] = useState("")
  const [signupEmail, setSignupEmail] = useState("")
  const [signupPassword, setSignupPassword] = useState("")
  const [showSignupPassword, setShowSignupPassword] = useState(false)
  const [signupRole, setSignupRole] = useState("")
  const [signupContact, setSignupContact] = useState("")
  const [signupAddress, setSignupAddress] = useState("")
  const [activeTab, setActiveTab] = useState("login")

  // Calculate password strength
  const calculatePasswordStrength = (password: string): PasswordStrength => {
    let score = 0
    const hasMinLength = password.length >= 8
    const hasUppercase = /[A-Z]/.test(password)
    const hasLowercase = /[a-z]/.test(password)
    const hasNumber = /\d/.test(password)
    const hasSpecial = /[^a-zA-Z\d]/.test(password)

    if (hasMinLength) score++
    if (hasUppercase && hasLowercase) score++
    if (hasNumber) score++
    if (hasSpecial) score++

    if (score === 0) return { score: 0, text: "Too weak", color: "text-red-600" }
    if (score <= 1) return { score: 1, text: "Weak", color: "text-orange-600" }
    if (score <= 2) return { score: 2, text: "Fair", color: "text-yellow-600" }
    if (score === 3) return { score: 3, text: "Good", color: "text-blue-600" }
    return { score: 4, text: "Strong", color: "text-green-600" }
  }

  const passwordStrength = calculatePasswordStrength(signupPassword)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Login:", { loginEmail, loginPassword })
    // Handle login logic
  }

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Sign up:", {
      signupName,
      signupEmail,
      signupPassword,
      signupRole,
      signupContact,
      signupAddress,
    })
    // Handle signup logic
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#F4F4F4" }}>
      <div
        className="w-full flex flex-col items-center justify-center py-12 px-4"
        style={{ backgroundColor: "#018790" }}
      >
        <div className="max-w-2xl text-center">
          <h1 className="text-5xl font-bold mb-4 text-white">SCM System</h1>
          <p className="text-xl mb-6 text-white/90">Supply Chain Management Platform</p>
          <p className="text-white/80 text-sm">Streamline your supply chain operations</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 lg:p-8">
        <Card className="w-full max-w-md border-0 shadow-lg" style={{ backgroundColor: "#FFFFFF" }}>
          <CardHeader className="space-y-3 border-b px-8 pt-8" style={{ borderColor: "#E0E0E0" }}>
            <CardTitle className="text-3xl font-bold text-center" style={{ color: "#005461" }}>
              Access Portal
            </CardTitle>
            <CardDescription className="text-center text-sm" style={{ color: "#005461" }}>
              Enter your credentials to continue
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-8 px-8 pb-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 gap-2" style={{ backgroundColor: "transparent" }}>
                <TabsTrigger
                  value="login"
                  className="rounded-lg transition-colors py-2 px-4 text-base font-medium data-[state=active]:text-white data-[state=inactive]:text-[#005461]"
                  style={{
                    backgroundColor: activeTab === "login" ? "#018790" : "#F0F0F0",
                  }}
                >
                  Log In
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className="rounded-lg transition-colors py-2 px-4 text-base font-medium data-[state=active]:text-white data-[state=inactive]:text-[#005461]"
                  style={{
                    backgroundColor: activeTab === "signup" ? "#018790" : "#F0F0F0",
                  }}
                >
                  Sign Up
                </TabsTrigger>
              </TabsList>

              {/* Login Form */}
              <TabsContent value="login" className="space-y-6">
                <div className="space-y-1 mb-6">
                  <h3 className="text-xl font-semibold" style={{ color: "#005461" }}>
                    Welcome Back
                  </h3>
                  <p className="text-sm text-gray-600">Log in to your SCM account</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" style={{ color: "#005461" }} className="font-medium text-sm">
                      Email Address
                    </Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="you@example.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                      className="border border-gray-200 focus:border-[#018790] focus:ring-[#018790] h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password" style={{ color: "#005461" }} className="font-medium text-sm">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showLoginPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                        className="border border-gray-200 focus:border-[#018790] focus:ring-[#018790] pr-10 h-11"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        aria-label={showLoginPassword ? "Hide password" : "Show password"}
                      >
                        {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full font-medium text-white h-11 text-base"
                    style={{ backgroundColor: "#018790" }}
                  >
                    Log In
                  </Button>
                </form>

                <div className="text-center text-sm pt-4">
                  <p style={{ color: "#005461" }}>
                    Don't have an account?{" "}
                    <button
                      onClick={() => setActiveTab("signup")}
                      className="font-semibold hover:underline"
                      style={{ color: "#018790" }}
                    >
                      Sign Up
                    </button>
                  </p>
                </div>
              </TabsContent>

              {/* Sign Up Form */}
              <TabsContent value="signup" className="space-y-6">
                <div className="space-y-1 mb-6">
                  <h3 className="text-xl font-semibold" style={{ color: "#005461" }}>
                    Create Account
                  </h3>
                  <p className="text-sm text-gray-600">Join the SCM platform</p>
                </div>

                <form onSubmit={handleSignup} className="space-y-5 max-h-[calc(100vh-400px)] overflow-y-auto pr-2">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name" style={{ color: "#005461" }} className="font-medium text-sm">
                      Full Name
                    </Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="John Doe"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      required
                      className="border border-gray-200 focus:border-[#018790] focus:ring-[#018790] h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email" style={{ color: "#005461" }} className="font-medium text-sm">
                      Email Address
                    </Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      required
                      className="border border-gray-200 focus:border-[#018790] focus:ring-[#018790] h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password" style={{ color: "#005461" }} className="font-medium text-sm">
                      Set Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showSignupPassword ? "text" : "password"}
                        placeholder="Min. 8 characters"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        required
                        className="border border-gray-200 focus:border-[#018790] focus:ring-[#018790] pr-10 h-11"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignupPassword(!showSignupPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        aria-label={showSignupPassword ? "Hide password" : "Show password"}
                      >
                        {showSignupPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>

                    {/* Password Strength Indicator */}
                    <p className="text-xs" style={{ color: "#005461" }}>
                      Min 8 characters with uppercase, lowercase, number & special character
                    </p>

                    {signupPassword && (
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full transition-all"
                            style={{
                              width: `${(passwordStrength.score / 4) * 100}%`,
                              backgroundColor: {
                                0: "#EF4444",
                                1: "#F97316",
                                2: "#EAB308",
                                3: "#3B82F6",
                                4: "#22C55E",
                              }[passwordStrength.score],
                            }}
                          />
                        </div>
                        <span className={`text-xs font-medium ${passwordStrength.color}`}>{passwordStrength.text}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-role" style={{ color: "#005461" }} className="font-medium text-sm">
                      Select Your Role <span className="text-red-500">*</span>
                    </Label>
                    <Select value={signupRole} onValueChange={setSignupRole}>
                      <SelectTrigger
                        id="signup-role"
                        className="border border-gray-200 focus:border-[#018790] focus:ring-[#018790] h-11"
                      >
                        <SelectValue placeholder="Choose a role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="supplier">Supplier</SelectItem>
                        <SelectItem value="manufacturer">Manufacturer</SelectItem>
                        <SelectItem value="warehouse-manager">Warehouse Manager</SelectItem>
                        <SelectItem value="retailer">Retailer</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500">This role cannot be changed after registration</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-contact" style={{ color: "#005461" }} className="font-medium text-sm">
                      Contact Number
                    </Label>
                    <Input
                      id="signup-contact"
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={signupContact}
                      onChange={(e) => setSignupContact(e.target.value)}
                      required
                      className="border border-gray-200 focus:border-[#018790] focus:ring-[#018790] h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-address" style={{ color: "#005461" }} className="font-medium text-sm">
                      Physical Address
                    </Label>
                    <Textarea
                      id="signup-address"
                      placeholder="Street address, city, state, ZIP code"
                      value={signupAddress}
                      onChange={(e) => setSignupAddress(e.target.value)}
                      required
                      className="border border-gray-200 focus:border-[#018790] focus:ring-[#018790] min-h-20 resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full font-medium text-white h-11 text-base"
                    style={{ backgroundColor: "#018790" }}
                  >
                    Sign Up
                  </Button>
                </form>

                <div className="text-center text-sm pt-4">
                  <p style={{ color: "#005461" }}>
                    Already have an account?{" "}
                    <button
                      onClick={() => setActiveTab("login")}
                      className="font-semibold hover:underline"
                      style={{ color: "#018790" }}
                    >
                      Log In
                    </button>
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
