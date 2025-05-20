import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

const registerSchema = z.object({
  name: z.string().min(1, "O nome é obrigatório"),
  username: z.string().min(1, "O email é obrigatório").email("Email inválido"),
  cpf: z.string().min(1, "O CPF é obrigatório"),
  phone: z.string().min(1, "O telefone é obrigatório"),
  password: z.string()
    .min(6, "A senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string(),
  termsAccepted: z.boolean()
    .refine(val => val === true, {
      message: "Você precisa aceitar os termos e condições",
    }),
}).refine(data => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  onSuccess?: () => void;
}

export default function RegisterForm({ onSuccess }: RegisterFormProps) {
  const { registerMutation } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      username: "",
      cpf: "",
      phone: "",
      password: "",
      confirmPassword: "",
      termsAccepted: false,
    },
  });

  // Format CPF as user types
  const formatCPF = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
  };

  // Format phone as user types
  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  };

  const onSubmit = (values: RegisterFormValues) => {
    // Simplifying username to just the email for authentication purposes
    registerMutation.mutate({
      username: values.username,
      password: values.password,
    }, {
      onSuccess: () => {
        onSuccess?.();
      }
    });
  };

  return (
    <>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Cadastro de Cliente</h2>
        <p className="text-gray-600 mt-1">Preencha as informações abaixo</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="relative">
                <FormLabel className={`absolute top-3 left-4 text-gray-500 pointer-events-none transition-all duration-200 ${
                  field.value ? "transform scale-85 -translate-y-5" : ""
                }`}>
                  Nome Completo
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className="h-14 pt-6 px-4"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem className="relative">
                <FormLabel className={`absolute top-3 left-4 text-gray-500 pointer-events-none transition-all duration-200 ${
                  field.value ? "transform scale-85 -translate-y-5" : ""
                }`}>
                  Email
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    className="h-14 pt-6 px-4"
                    autoComplete="email"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="cpf"
              render={({ field }) => (
                <FormItem className="relative">
                  <FormLabel className={`absolute top-3 left-4 text-gray-500 pointer-events-none transition-all duration-200 ${
                    field.value ? "transform scale-85 -translate-y-5" : ""
                  }`}>
                    CPF
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="h-14 pt-6 px-4"
                      maxLength={14}
                      onChange={(e) => {
                        const formatted = formatCPF(e.target.value);
                        e.target.value = formatted;
                        field.onChange(formatted);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem className="relative">
                  <FormLabel className={`absolute top-3 left-4 text-gray-500 pointer-events-none transition-all duration-200 ${
                    field.value ? "transform scale-85 -translate-y-5" : ""
                  }`}>
                    Telefone
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="h-14 pt-6 px-4"
                      maxLength={15}
                      onChange={(e) => {
                        const formatted = formatPhone(e.target.value);
                        e.target.value = formatted;
                        field.onChange(formatted);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="relative">
                <FormLabel className={`absolute top-3 left-4 text-gray-500 pointer-events-none transition-all duration-200 ${
                  field.value ? "transform scale-85 -translate-y-5" : ""
                }`}>
                  Senha
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      type={showPassword ? "text" : "password"}
                      className="h-14 pt-6 px-4 pr-10"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem className="relative">
                <FormLabel className={`absolute top-3 left-4 text-gray-500 pointer-events-none transition-all duration-200 ${
                  field.value ? "transform scale-85 -translate-y-5" : ""
                }`}>
                  Confirmar Senha
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      type={showConfirmPassword ? "text" : "password"}
                      className="h-14 pt-6 px-4 pr-10"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="termsAccepted"
            render={({ field }) => (
              <FormItem className="flex items-start space-x-2 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    id="terms"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <label
                    htmlFor="terms"
                    className="text-sm text-gray-700 cursor-pointer"
                  >
                    Concordo com os{" "}
                    <a href="#" className="text-primary hover:text-primary/90">
                      Termos e Condições
                    </a>
                  </label>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full h-12"
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending ? "Cadastrando..." : "Cadastrar"}
          </Button>
        </form>
      </Form>
    </>
  );
}
