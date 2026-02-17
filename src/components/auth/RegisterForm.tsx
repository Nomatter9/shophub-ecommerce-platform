import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm, Watch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { defaultRegisterValues, registerFormSchema, RegisterFormValues } from "@/schemas/registerSchema";
import axios from "axios";
import { Eye, EyeOff, CheckCircle2, ShieldAlert } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import axiosClient from "@/axiosClient";
import { cn } from "@/lib/data/utils";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const navigate = useNavigate();

  const { register, handleSubmit, reset,setValue, watch,formState: { errors }, setError } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: defaultRegisterValues,
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setLoading(true);
    try {
      await axiosClient.post(`/auth/register`, data);
      setSuccessMessage("Account created successfully!");
      reset()
      setTimeout(() => navigate('/login'), 2000);
    } catch (error: any) {
      if (error.response?.status === 422) {
        Object.keys(error.response.data.errors).forEach((field) => {
          setError(field as keyof RegisterFormValues, { message: error.response.data.errors[field][0] });
        });
      } else {
        setGeneralError("An account with this email might already exist.");
      }
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-grid-overlay" />
      <div className="auth-bg-glow -top-20 -left-20" />
      <div className="auth-bg-glow -bottom-20 -right-20 opacity-10" />

      <Card className="z-10 w-full max-w-md mx-4 rounded-[2rem] bg-[#0B1632]/90 backdrop-blur-xl">
        <CardHeader className="text-center space-y-1 pt-8">
          <CardTitle className="text-3xl font-black tracking-tight">Join us</CardTitle>
          <CardDescription>Create your  account</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pb-8">
          {successMessage && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
              <CheckCircle2 size={16} /> {successMessage}
            </div>
          )}
          {generalError && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
              <ShieldAlert size={16} /> {generalError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" placeholder="John" {...register("firstName")} className="h-12" />
                {errors.firstName && <p className="text-rose-500 text-[10px]">{errors.firstName.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" placeholder="Doe" {...register("lastName")} className="h-12" />
                {errors.lastName && <p className="text-rose-500 text-[10px]">{errors.lastName.message}</p>}
              </div>
            </div>
              
            <div className="space-y-2">
              <Label 
                htmlFor="phone" 
                className="text-[#E6EEF8] text-xs font-bold uppercase tracking-widest ml-1"
              >
                Phone Number
              </Label>
              <Input
                id="phone"
                placeholder="+27 81 234 5678"
                className={cn(
                  "h-12 bg-[#0F1A37] border-[rgba(255,255,255,0.06)] text-[#E6EEF8] placeholder:text-[#9AA4C6]",
                  "focus:ring-2 focus:ring-[#6366F1] focus:border-[#6366F1]",
                  errors.phone ? "border-rose-500/50" : ""
                )}
                {...register("phone")}
              />
              {errors.phone && (
                <p className="text-rose-500 text-[10px] ml-1 font-medium">
                  {errors.phone.message}
                </p>
              )}
            </div>
     <div className="space-y-2">
  <Label className="text-[#E6EEF8] text-xs font-bold uppercase tracking-widest ml-1">
    Account Type
  </Label>
  <div className="grid grid-cols-2 gap-4">
    <button
      type="button"
      onClick={() => setValue("role", "user")}
      className={cn(
        "h-12 rounded-xl border transition-all text-sm font-bold",
        watch("role") === "user" 
          ? "bg-[#6366F1] border-[#6366F1] text-white shadow-lg shadow-indigo-500/20" 
          : "bg-[#0F1A37] border-white/5 text-[#9AA4C6] hover:border-white/10"
      )}
    >
                Customer
              </button>
              <button
                type="button"
                onClick={() => setValue("role", "seller")}
                className={cn(
                  "h-12 rounded-xl border transition-all text-sm font-bold",
                  watch("role") === "seller" 
                    ? "bg-[#6366F1] border-[#6366F1] text-white shadow-lg shadow-indigo-500/20" 
                    : "bg-[#0F1A37] border-white/5 text-[#9AA4C6] hover:border-white/10"
                )}
              >
                Seller
              </button>
            </div>
            <input type="hidden" {...register("role")} />
          </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" placeholder="name@company.com" {...register("email")} className="h-12" />
              {errors.email && <p className="text-rose-500 text-[10px]">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="h-12 pr-12"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9AA4C6] hover:text-white"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-rose-500 text-[10px]">{errors.password.message}</p>}
            </div>

            <Button type="submit" disabled={loading} className="w-full h-12 bg-[#6366F1] hover:bg-[#5558E3] text-white font-bold rounded-xl mt-4">
              {loading ? "Creating..." : "Create Account"}
            </Button>

            <p className="text-center text-[#9AA4C6] text-sm pt-4">
              Already have an account?{" "}
              <Link to="/login" className="text-[#6366F1] font-bold hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}