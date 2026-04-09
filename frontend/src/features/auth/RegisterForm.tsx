import { useState }     from "react";
import { useForm }      from "react-hook-form";
import { zodResolver }  from "@hookform/resolvers/zod";
import { z }            from "zod";
import { Link }         from "react-router-dom";
import { useAuth }      from "@hooks/useAuth";
import { ROLE_LABELS, ROLE_ICONS, ROLE_COLORS } from "@utils/constants";
import { cn }           from "@utils/cn";
import type { Role }    from "@types/index";

const schema = z.object({
  name:      z.string().min(2, "Name must be at least 2 characters"),
  email:     z.string().email("Enter a valid university email"),
  password:  z.string().min(8, "Password must be at least 8 characters"),
  confirm:   z.string(),
  role:      z.enum(["student", "admin", "inventory", "finance"]),
  studentId: z.string().optional(),
}).refine((d) => d.password === d.confirm, {
  message: "Passwords do not match",
  path:    ["confirm"],
});

type FormValues = z.infer<typeof schema>;

const ROLES = (["student", "admin", "inventory", "finance"] as Role[]);

export default function RegisterForm() {
  const { register: registerUser, isRegistering } = useAuth();
  const [showPass, setShowPass] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { role: "student" },
  });

  const selectedRole = watch("role");

  const onSubmit = (data: FormValues) =>
    registerUser({
      name:      data.name,
      email:     data.email,
      password:  data.password,
      role:      data.role,
      studentId: data.studentId,
    });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-bodydark2 mb-1.5">Full Name</label>
        <input {...register("name")} type="text" placeholder="Juan dela Cruz" className="input" />
        {errors.name && <p className="text-danger text-xs mt-1">{errors.name.message}</p>}
      </div>

      <div>
        <label className="block text-xs font-medium text-bodydark2 mb-2">Select Role</label>
        <div className="grid grid-cols-2 gap-2">
          {ROLES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setValue("role", r)}
              className={cn(
                "p-3 rounded-xl border text-left transition-all",
                selectedRole === r
                  ? "border-current"
                  : "border-white/[0.08] bg-white/[0.02] hover:border-white/20"
              )}
              style={
                selectedRole === r
                  ? { background: `${ROLE_COLORS[r]}15`, borderColor: `${ROLE_COLORS[r]}60`, color: ROLE_COLORS[r] }
                  : {}
              }
            >
              <div className="text-xl mb-1">{ROLE_ICONS[r]}</div>
              <div className="text-xs font-semibold text-white">{ROLE_LABELS[r]}</div>
            </button>
          ))}
        </div>
        {errors.role && <p className="text-danger text-xs mt-1">{errors.role.message}</p>}
      </div>

      {selectedRole === "student" && (
        <div>
          <label className="block text-xs font-medium text-bodydark2 mb-1.5">Student ID</label>
          <input {...register("studentId")} type="text" placeholder="2024-00001" className="input" />
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-bodydark2 mb-1.5">University Email</label>
        <input {...register("email")} type="email" placeholder="you@university.edu" className="input" />
        {errors.email && <p className="text-danger text-xs mt-1">{errors.email.message}</p>}
      </div>

      <div>
        <label className="block text-xs font-medium text-bodydark2 mb-1.5">Password</label>
        <div className="relative">
          <input
            {...register("password")}
            type={showPass ? "text" : "password"}
            placeholder="min 8 characters"
            className="input pr-11"
          />
          <button type="button" onClick={() => setShowPass((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-bodydark2 hover:text-white text-sm">
            {showPass ? "🙈" : "👁️"}
          </button>
        </div>
        {errors.password && <p className="text-danger text-xs mt-1">{errors.password.message}</p>}
      </div>

      <div>
        <label className="block text-xs font-medium text-bodydark2 mb-1.5">Confirm Password</label>
        <input {...register("confirm")} type="password" placeholder="••••••••" className="input" />
        {errors.confirm && <p className="text-danger text-xs mt-1">{errors.confirm.message}</p>}
      </div>

      <button type="submit" className="btn-primary w-full" disabled={isRegistering}>
        {isRegistering ? "Creating account…" : "Create Account →"}
      </button>

      <p className="text-center text-sm text-bodydark2 pt-2">
        Already have an account?{" "}
        <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
          Sign In
        </Link>
      </p>
    </form>
  );
}
