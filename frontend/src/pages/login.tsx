import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { useLogin } from "@/api";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Stethoscope, Loader2, ArrowLeft, ShieldCheck, Activity, Users, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const DEMO_ACCOUNTS = [
  { label: " Admin",         email: "admin@hospital.com",      role: "admin" },
  { label: " Doctor Desk",   email: "dr.carter@hospital.com",  role: "doctor" },
  { label: " Receptionist",  email: "reception@hospital.com",  role: "receptionist" },
  { label: " Patient Hub",   email: "john.doe@email.com",      role: "patient" },
];

export default function Login() {
  const { login } = useAuth();
  const { toast } = useToast();
  const loginMutation = useLogin();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (values: z.infer<typeof loginSchema>) => {
    loginMutation.mutate(
      { data: values },
      {
        onSuccess: (res) => {
          login(res.token, res.user);
        },
        onError: (err) => {
          toast({
            title: "Login failed",
            description: err.message || "Invalid credentials",
            variant: "destructive",
          });
        },
      }
    );
  };

  const demoLogin = (email: string) => {
    form.setValue("email", email);
    form.setValue("password", "password123");
  };

  return (
    <div className="h-screen w-screen overflow-hidden lg:grid lg:grid-cols-12 bg-background relative">
      
      {/* LEFT BRANDING PANEL */}
      <div className="hidden lg:flex lg:col-span-5 h-full bg-primary relative flex-col justify-between p-10 text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-emerald-700 opacity-95" />
        <div className="absolute -top-20 -left-20 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-2 rounded-xl backdrop-blur-md border border-white/20">
              <Stethoscope className="h-6 w-6 text-white" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-white">Medicore</span>
          </div>
          
          <div className="mt-12 space-y-2">
            <h1 className="text-3xl font-bold tracking-tight leading-tight">Advanced Healthcare Management.</h1>
            <p className="text-primary-foreground/80 text-sm max-w-sm">Streamlining hospital operations and patient care in one secure platform.</p>
          </div>
        </div>

        <div className="relative z-10 space-y-3 my-auto">
          <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <ShieldCheck className="h-5 w-5 text-emerald-300 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-sm text-white">100% Secure & HIPAA Compliant</h4>
              <p className="text-xs text-primary-foreground/75">End-to-end encryption for patient records.</p>
            </div>
          </div>
          <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <Activity className="h-5 w-5 text-cyan-300 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-sm text-white">Real-time Analytics</h4>
              <p className="text-xs text-primary-foreground/75">Live monitoring of clinic availability.</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-primary-foreground/60 flex items-center gap-2">
          <Users className="h-4 w-4" /> Trusted by 50+ Healthcare Facilities
        </div>
      </div>

      {/* RIGHT LOGIN FORM PANEL */}
      <div className="col-span-12 lg:col-span-7 h-full w-full flex flex-col items-center justify-center p-4 md:p-8 bg-muted/30 overflow-y-auto lg:overflow-hidden">
        <div className="w-full max-w-md space-y-4">
          
          {/* Mobile Logo */}
          <div className="flex lg:hidden items-center justify-center gap-2 mb-1 text-primary">
            <Stethoscope className="h-5 w-5" />
            <span className="font-bold text-lg">HMS</span>
          </div>

          <Card className="border-border/40 shadow-xl backdrop-blur-md bg-card">
            <CardHeader className="space-y-1 text-center py-4 border-b border-border/50">
              <CardTitle className="text-2xl font-extrabold tracking-tight">Welcome Back</CardTitle>
              <CardDescription className="text-xs">Enter your registered credentials to access your dashboard</CardDescription>
            </CardHeader>
            
            <CardContent className="pt-4 pb-4 space-y-4">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3.5">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-xs font-semibold">Email Address</FormLabel>
                        <FormControl>
                          <Input placeholder="you@example.com" type="email" className="h-10 text-sm focus-visible:ring-emerald-500" {...field} />
                        </FormControl>
                        <FormMessage className="text-[11px]" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <div className="flex items-center justify-between">
                          <FormLabel className="text-xs font-semibold">Password</FormLabel>
                          <Link href="/forgot-password" className="text-xs font-medium text-primary hover:underline">Forgot password?</Link>
                        </div>
                        <FormControl>
                          <div className="relative flex items-center">
                            <Input 
                              type={showPassword ? "text" : "password"} 
                              placeholder="••••••••" 
                              className="h-10 text-sm pr-10 focus-visible:ring-emerald-500 w-full" 
                              {...field} 
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 text-muted-foreground hover:text-foreground focus:outline-none"
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage className="text-[11px]" />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full h-10 text-sm font-semibold mt-1" disabled={loginMutation.isPending}>
                    {loginMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Sign In
                  </Button>
                </form>
              </Form>

              {/* Demo Accounts Panel */}
              <div className="space-y-2.5">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
                  <div className="relative flex justify-center text-[10px] uppercase tracking-wider font-bold">
                    <span className="bg-card px-2.5 text-muted-foreground">Quick Demo Login</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {DEMO_ACCOUNTS.map((acc) => (
                    <Button
                      key={acc.role}
                      variant="outline"
                      size="sm"
                      type="button"
                      onClick={() => demoLogin(acc.email)}
                      className="h-9 text-xs hover:bg-primary/5 hover:text-primary transition-all shadow-sm justify-center"
                    >
                      {acc.label}
                    </Button>
                  ))}
                </div>
              </div>
              
              {/* Footer Links & Back to Home */}
              <div className="text-center space-y-2 pt-3 border-t border-border/50 text-xs">
                <div className="text-muted-foreground">
                  Don't have an account?{" "}
                  <Link href="/register" className="font-semibold text-primary hover:underline">Register as Patient</Link>
                </div>
                
                <div className="pt-1">
                  <Link href="/">
                    <button type="button" className="inline-flex items-center justify-center gap-1.5 text-muted-foreground hover:text-foreground font-medium transition-colors border px-3 py-1 rounded-md bg-muted/40 hover:bg-muted">
                      <ArrowLeft className="h-3.5 w-3.5" /> Back to Home Page
                    </button>
                  </Link>
                </div>
              </div>

            </CardContent>
          </Card>
        </div>
      </div>

    </div>
  );
}