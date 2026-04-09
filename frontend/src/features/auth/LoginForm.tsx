import { useState }          from "react";
import { useForm }           from "react-hook-form";
import { zodResolver }       from "@hookform/resolvers/zod";
import { z }                 from "zod";
import { Link }              from "react-router-dom";
import { useAuth }           from "@hooks/useAuth";

const schema = z.object({
  email:    z.string().email("Enter a valid university email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormValues = z.infer<typeof schema>;

export default function LoginForm() {
  const { login, isLoggingIn } = useAuth();
  const [showPass, setShowPass] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = (data: FormValues) => login(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-bodydark2 mb-1.5">
          University Email
        </label>
        <input
          {...register("email")}
          type="email"
          placeholder="you@university.edu"
          className="input"
          autoComplete="email"
        />
        {errors.email && (
          <p className="text-danger text-xs mt-1">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label className="block text-xs font-medium text-bodydark2 mb-1.5">
          Password
        </label>
        <div className="relative">
          <input
            {...register("password")}
            type={showPass ? "text" : "password"}
            placeholder="••••••••"
            className="input pr-11"
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPass((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-bodydark2 hover:text-white text-sm"
          >
            {showPass ? "🙈" : "👁️"}
          </button>
        </div>
        {errors.password && (
          <p className="text-danger text-xs mt-1">{errors.password.message}</p>
        )}
      </div>

      <div className="flex justify-end">
        <a href="#" className="text-xs text-primary-400 hover:text-primary-300 transition-colors">
          Forgot password?
        </a>
      </div>

      <button type="submit" className="btn-primary w-full" disabled={isLoggingIn}>
        {isLoggingIn ? "Signing in…" : "Sign In →"}
      </button>

      <p className="text-center text-sm text-bodydark2 pt-2">
        Don&apos;t have an account?{" "}
        <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
          Register
        </Link>
      </p>
    </form>
  );
}
