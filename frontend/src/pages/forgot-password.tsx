import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForgotPassword } from "@/api";
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
import { Stethoscope, Loader2, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export default function ForgotPassword() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const forgotPasswordMutation = useForgotPassword();

  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (values: z.infer<typeof forgotPasswordSchema>) => {
    forgotPasswordMutation.mutate(
      { data: values },
      {
        onSuccess: () => {
          toast({
            title: "Reset link sent",
            description: "Check your email for password reset instructions",
          });
          setLocation("/login");
        },
        onError: (err) => {
          toast({
            title: "Request failed",
            description: err.message || "Could not process request",
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3 text-primary">
            <div className="bg-primary p-2 rounded-lg">
              <Stethoscope className="h-8 w-8 text-primary-foreground" />
            </div>
            <span className="font-bold text-3xl tracking-tight text-foreground">HMS</span>
          </div>
        </div>

        <Card className="border-border/50 shadow-xl shadow-black/5">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
            <CardDescription>
              Enter your email address and we'll send you a link to reset your password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="your.email@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" className="w-full" disabled={forgotPasswordMutation.isPending}>
                  {forgotPasswordMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Send Reset Link
                </Button>
              </form>
            </Form>
            
            <div className="mt-6 text-center text-sm">
              <Link href="/login" className="font-medium text-primary hover:underline inline-flex items-center">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}