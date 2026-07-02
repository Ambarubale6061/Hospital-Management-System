import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { useRegister, RegisterInputRole } from "@/api";
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
import { Link, useLocation } from "wouter";

const registerSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function Register() {
  const { login } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const registerMutation = useRegister();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof registerSchema>) => {
    registerMutation.mutate(
      { data: { ...values, role: RegisterInputRole.patient } },
      {
        onSuccess: (res) => {
          login(res.token, res.user);
          toast({
            title: "Registration successful",
            description: "Welcome to HMS",
          });
        },
        onError: (err) => {
          toast({
            title: "Registration failed",
            description: err.message || "Please check your details",
            variant: "destructive",
          });
        },
      }
    );
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

      {/* RIGHT REGISTRATION FORM PANEL */}
      <div className="col-span-12 lg:col-span-7 h-full w-full flex flex-col items-center justify-center p-4 md:p-8 bg-muted/30 overflow-y-auto lg:overflow-hidden">
        <div className="w-full max-w-md space-y-4">
          
          {/* Mobile Logo */}
          <div className="flex lg:hidden items-center justify-center gap-2 mb-1 text-primary">
            <Stethoscope className="h-5 w-5" />
            <span className="font-bold text-lg">Medicore</span>
          </div>

          <Card className="border-border/40 shadow-xl backdrop-blur-md bg-card">
            <CardHeader className="space-y-1 text-center py-4 border-b border-border/50">
              <CardTitle className="text-2xl font-extrabold tracking-tight">Create an account</CardTitle>
              <CardDescription className="text-xs">Register as a patient to book appointments and manage records</CardDescription>
            </CardHeader>
            
            <CardContent className="pt-4 pb-4 space-y-4">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3.5" autoComplete="off">
                  
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel className="text-xs font-semibold">First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John" autoComplete="off" className="h-10 text-sm focus-visible:ring-emerald-500" {...field} />
                          </FormControl>
                          <FormMessage className="text-[11px]" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel className="text-xs font-semibold">Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Doe" autoComplete="off" className="h-10 text-sm focus-visible:ring-emerald-500" {...field} />
                          </FormControl>
                          <FormMessage className="text-[11px]" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-xs font-semibold">Email Address</FormLabel>
                        <FormControl>
                          <Input placeholder="john.doe@example.com" type="email" autoComplete="new-email" className="h-10 text-sm focus-visible:ring-emerald-500" {...field} />
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
                        <FormLabel className="text-xs font-semibold">Password</FormLabel>
                        <FormControl>
                          <div className="relative flex items-center">
                            <Input 
                              type={showPassword ? "text" : "password"} 
                              placeholder="••••••••" 
                              autoComplete="new-password"
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

                  <Button type="submit" className="w-full h-10 text-sm font-semibold mt-2" disabled={registerMutation.isPending}>
                    {registerMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Register Account
                  </Button>
                </form>
              </Form>
              
              {/* Footer Links & Back to Home */}
              <div className="text-center space-y-2 pt-3 border-t border-border/50 text-xs">
                <div className="text-muted-foreground">
                  Already have an account?{" "}
                  <Link href="/login" className="font-semibold text-primary hover:underline">Sign in</Link>
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