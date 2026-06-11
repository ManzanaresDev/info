# 📦 ZOD — Manuel complet de validation TypeScript

> **Zod** est une librairie de validation de schémas TypeScript-first. Elle permet de valider des données à runtime tout en inférant automatiquement les types TypeScript.

---

## Installation

```bash
npm install zod
```

```ts
import { z } from "zod";
```

---

## 🟢 NIVEAU DÉBUTANT — Les bases

### Types primitifs

```ts
import { z } from "zod";

// Chaîne de caractères
const nom = z.string();

// Nombre
const age = z.number();

// Booléen
const actif = z.boolean();

// Undefined / null
const rien = z.undefined();
const vide = z.null();

// N'importe quel type
const nimporte = z.any();
const inconnu = z.unknown();
```

---

### Validation de base

```ts
const schema = z.string();

// parse() → retourne la valeur ou lance une erreur
schema.parse("bonjour");     // ✅ "bonjour"
schema.parse(42);            // ❌ ZodError

// safeParse() → retourne { success, data } ou { success, error }
const result = schema.safeParse(42);
if (result.success) {
  console.log(result.data);  // string
} else {
  console.log(result.error); // ZodError
}
```

---

### Strings — validations courantes

```ts
const email = z.string().email();
const url = z.string().url();
const uuid = z.string().uuid();

const pseudo = z
  .string()
  .min(3, "Minimum 3 caractères")
  .max(20, "Maximum 20 caractères");

const codePostal = z.string().length(5, "Doit faire exactement 5 chiffres");

const slug = z.string().regex(/^[a-z0-9-]+$/, "Slug invalide");

// Optionnel avec valeur par défaut
const couleur = z.string().default("rouge");
```

---

### Numbers — validations courantes

```ts
const prix = z.number().positive("Le prix doit être positif");
const age = z.number().int().min(18).max(120);
const note = z.number().min(0).max(20);
const quantite = z.number().nonnegative(); // >= 0
```

---

### Objets

```ts
const UserSchema = z.object({
  nom: z.string(),
  email: z.string().email(),
  age: z.number().int().min(0),
});

// Inférer le type TypeScript automatiquement
type User = z.infer<typeof UserSchema>;
// équivalent à :
// type User = { nom: string; email: string; age: number; }

// Validation
const user = UserSchema.parse({
  nom: "Marcos",
  email: "marcos@test.com",
  age: 28,
}); // ✅

UserSchema.parse({
  nom: "Marcos",
  email: "pas-un-email",
  age: 28,
}); // ❌ ZodError sur le champ email
```

---

### Champs optionnels et nullables

```ts
const ProfileSchema = z.object({
  nom: z.string(),
  bio: z.string().optional(),       // string | undefined
  photo: z.string().nullable(),     // string | null
  site: z.string().nullish(),       // string | null | undefined
});

type Profile = z.infer<typeof ProfileSchema>;
// {
//   nom: string;
//   bio?: string | undefined;
//   photo: string | null;
//   site?: string | null | undefined;
// }
```

---

### Arrays

```ts
const tags = z.array(z.string());
tags.parse(["zod", "typescript"]); // ✅
tags.parse(["zod", 42]);           // ❌

// Avec contraintes
const liste = z.array(z.string()).min(1).max(10);

// Array d'objets
const produits = z.array(
  z.object({
    nom: z.string(),
    prix: z.number().positive(),
  })
);
```

---

### Enums

```ts
// Enum Zod
const RoleSchema = z.enum(["admin", "user", "moderator"]);
type Role = z.infer<typeof RoleSchema>; // "admin" | "user" | "moderator"

RoleSchema.parse("admin");     // ✅
RoleSchema.parse("superuser"); // ❌

// Enum TypeScript natif
enum Direction {
  Up = "UP",
  Down = "DOWN",
}
const DirectionSchema = z.nativeEnum(Direction);
```

---

### Messages d'erreur personnalisés

```ts
const schema = z.object({
  email: z.string({
    required_error: "L'email est obligatoire",
    invalid_type_error: "L'email doit être une chaîne",
  }).email("Format email invalide"),

  age: z.number({
    required_error: "L'âge est obligatoire",
  }).min(18, "Vous devez avoir au moins 18 ans"),
});
```

---

## 🟡 NIVEAU INTERMÉDIAIRE — Validation avancée

### Union et discriminated union

```ts
// Union simple — l'un ou l'autre
const StringOrNumber = z.union([z.string(), z.number()]);
StringOrNumber.parse("bonjour"); // ✅
StringOrNumber.parse(42);        // ✅
StringOrNumber.parse(true);      // ❌

// Discriminated union — plus performant pour les objets
const ResultSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("success"), data: z.string() }),
  z.object({ type: z.literal("error"), message: z.string() }),
]);

type Result = z.infer<typeof ResultSchema>;

ResultSchema.parse({ type: "success", data: "OK" });       // ✅
ResultSchema.parse({ type: "error", message: "Erreur" });  // ✅
ResultSchema.parse({ type: "pending" });                   // ❌
```

---

### Intersection

```ts
const BaseSchema = z.object({ id: z.string() });
const UserSchema = z.object({ nom: z.string(), email: z.string().email() });

const UserWithId = BaseSchema.and(UserSchema);
// équivalent à z.intersection(BaseSchema, UserSchema)

type UserWithId = z.infer<typeof UserWithId>;
// { id: string; nom: string; email: string; }
```

---

### Transformations

```ts
// transform() — transformer la valeur après validation
const TrimmedString = z.string().transform((val) => val.trim());
TrimmedString.parse("  bonjour  "); // "bonjour"

// Transformer le type
const NumberFromString = z.string().transform((val) => Number(val));
type T = z.infer<typeof NumberFromString>; // number

// Chaîner validation et transformation
const PrixSchema = z
  .string()
  .regex(/^\d+(\.\d{1,2})?$/, "Prix invalide")
  .transform((val) => parseFloat(val));

PrixSchema.parse("19.99"); // 19.99 (number)
PrixSchema.parse("abc");   // ❌

// preprocess() — transformer AVANT validation
const CoercedNumber = z.preprocess(
  (val) => Number(val),
  z.number().positive()
);
CoercedNumber.parse("42"); // 42
CoercedNumber.parse("-1"); // ❌
```

---

### Refine — validation personnalisée

```ts
// refine() — validation personnalisée simple
const MotDePasseSchema = z
  .string()
  .min(8)
  .refine(
    (val) => /[A-Z]/.test(val),
    "Doit contenir au moins une majuscule"
  )
  .refine(
    (val) => /[0-9]/.test(val),
    "Doit contenir au moins un chiffre"
  );

MotDePasseSchema.parse("password");  // ❌ pas de majuscule
MotDePasseSchema.parse("Password");  // ❌ pas de chiffre
MotDePasseSchema.parse("Password1"); // ✅

// superRefine() — accès complet au contexte d'erreur
const ConfirmPasswordSchema = z
  .object({
    password: z.string().min(8),
    confirm: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirm) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Les mots de passe ne correspondent pas",
        path: ["confirm"],
      });
    }
  });

ConfirmPasswordSchema.parse({
  password: "Password1",
  confirm: "Password2",
}); // ❌ erreur sur le champ "confirm"
```

---

### Extend, pick, omit, partial

```ts
const UserSchema = z.object({
  id: z.string(),
  nom: z.string(),
  email: z.string().email(),
  age: z.number(),
});

// Étendre un schéma
const AdminSchema = UserSchema.extend({
  role: z.enum(["admin", "superadmin"]),
});

// Sélectionner certains champs
const PublicUser = UserSchema.pick({ nom: true, email: true });
// { nom: string; email: string; }

// Exclure certains champs
const UserSansId = UserSchema.omit({ id: true });
// { nom: string; email: string; age: number; }

// Rendre tous les champs optionnels (pour les PATCH)
const UpdateUser = UserSchema.partial();
// { id?: string; nom?: string; email?: string; age?: number; }

// Partial sélectif
const PartialUpdate = UserSchema.partial({ nom: true, age: true });
// { id: string; nom?: string; email: string; age?: number; }
```

---

### Record et Map

```ts
// Record — objet avec clés dynamiques
const TraductionsSchema = z.record(z.string(), z.string());
// { [key: string]: string }

TraductionsSchema.parse({ fr: "bonjour", en: "hello" }); // ✅
TraductionsSchema.parse({ fr: 42 });                     // ❌

// Avec clés typées
const ScoresSchema = z.record(
  z.enum(["mathématiques", "physique", "histoire"]),
  z.number().min(0).max(20)
);

// Map
const MapSchema = z.map(z.string(), z.number());
MapSchema.parse(new Map([["a", 1], ["b", 2]])); // ✅
```

---

### Coercion — conversion automatique

```ts
// z.coerce convertit automatiquement les types
const NumberSchema = z.coerce.number();
NumberSchema.parse("42");   // 42 (number)
NumberSchema.parse(true);   // 1
NumberSchema.parse(false);  // 0

const DateSchema = z.coerce.date();
DateSchema.parse("2024-01-15"); // Date object ✅
DateSchema.parse(1705276800000); // Date object ✅

const BoolSchema = z.coerce.boolean();
BoolSchema.parse("true");  // true
BoolSchema.parse(1);       // true
BoolSchema.parse(0);       // false
```

---

### Gestion avancée des erreurs

```ts
const schema = z.object({
  email: z.string().email(),
  age: z.number().min(18),
});

const result = schema.safeParse({
  email: "pas-un-email",
  age: 15,
});

if (!result.success) {
  // Accéder aux erreurs
  console.log(result.error.issues);
  // [
  //   { path: ["email"], message: "Invalid email", code: "invalid_string" },
  //   { path: ["age"], message: "Number must be greater than or equal to 18", code: "too_small" }
  // ]

  // Format plat
  console.log(result.error.flatten());
  // {
  //   formErrors: [],
  //   fieldErrors: {
  //     email: ["Invalid email"],
  //     age: ["Number must be greater than or equal to 18"]
  //   }
  // }

  // Format imbriqué
  console.log(result.error.format());
  // {
  //   email: { _errors: ["Invalid email"] },
  //   age: { _errors: ["Number must be greater than or equal to 18"] }
  // }
}
```

---

## 🔴 NIVEAU COMPLET — Intégration Next.js / API Routes

### Validation des API Routes (App Router)

```ts
// src/app/api/users/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";

const CreateUserSchema = z.object({
  nom: z.string().min(2, "Nom trop court").max(50),
  email: z.string().email("Email invalide"),
  age: z.number().int().min(18, "Doit avoir 18 ans minimum"),
  role: z.enum(["user", "admin"]).default("user"),
});

export async function POST(req: Request) {
  const body = await req.json();

  const result = CreateUserSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      {
        error: "Données invalides",
        details: result.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  // result.data est typé correctement ici
  const { nom, email, age, role } = result.data;

  // ... logique métier
  return NextResponse.json({ success: true, user: result.data });
}
```

---

### Validation des paramètres de requête (searchParams)

```ts
// src/app/api/products/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";

const QuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  sort: z.enum(["asc", "desc"]).default("asc"),
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const result = QuerySchema.safeParse({
    page: searchParams.get("page"),
    limit: searchParams.get("limit"),
    search: searchParams.get("search"),
    sort: searchParams.get("sort"),
  });

  if (!result.success) {
    return NextResponse.json(
      { error: result.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { page, limit, search, sort } = result.data;
  // page, limit sont des numbers grâce à z.coerce
  // ...

  return NextResponse.json({ page, limit, search, sort });
}
```

---

### Validation des formulaires React avec react-hook-form

```bash
npm install react-hook-form @hookform/resolvers
```

```tsx
// src/components/RegisterForm.tsx
"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const RegisterSchema = z
  .object({
    nom: z.string().min(2, "Nom trop court"),
    email: z.string().email("Email invalide"),
    password: z
      .string()
      .min(8, "Minimum 8 caractères")
      .regex(/[A-Z]/, "Doit contenir une majuscule")
      .regex(/[0-9]/, "Doit contenir un chiffre"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof RegisterSchema>;

export default function RegisterForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(RegisterSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    // data est entièrement typé et validé
    const res = await fetch("/api/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
    // ...
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <input {...register("nom")} placeholder="Nom" />
        {errors.nom && <p>{errors.nom.message}</p>}
      </div>
      <div>
        <input {...register("email")} placeholder="Email" />
        {errors.email && <p>{errors.email.message}</p>}
      </div>
      <div>
        <input {...register("password")} type="password" placeholder="Mot de passe" />
        {errors.password && <p>{errors.password.message}</p>}
      </div>
      <div>
        <input {...register("confirmPassword")} type="password" placeholder="Confirmer" />
        {errors.confirmPassword && <p>{errors.confirmPassword.message}</p>}
      </div>
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Inscription..." : "S'inscrire"}
      </button>
    </form>
  );
}
```

---

### Schémas partagés entre frontend et backend

```ts
// src/lib/schemas/user.schema.ts
import { z } from "zod";

// Schéma de base
export const UserBaseSchema = z.object({
  nom: z.string().min(2).max(50),
  email: z.string().email(),
});

// Schéma de création (avec mot de passe)
export const CreateUserSchema = UserBaseSchema.extend({
  password: z.string().min(8),
  role: z.enum(["user", "admin"]).default("user"),
});

// Schéma de mise à jour (tout optionnel)
export const UpdateUserSchema = UserBaseSchema.partial();

// Schéma de réponse API (sans mot de passe)
export const UserResponseSchema = UserBaseSchema.extend({
  id: z.string(),
  role: z.enum(["user", "admin"]),
  createdAt: z.coerce.date(),
});

// Types inférés
export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
export type UserResponse = z.infer<typeof UserResponseSchema>;
```

```ts
// Réutilisation dans l'API
// src/app/api/users/route.ts
import { CreateUserSchema } from "@/lib/schemas/user.schema";

// Réutilisation dans le formulaire
// src/components/CreateUserForm.tsx
import { CreateUserSchema, type CreateUserInput } from "@/lib/schemas/user.schema";
```

---

### Validation avec Mongoose / MongoDB

```ts
// src/app/api/checkout/route.ts
import { z } from "zod";
import { NextResponse } from "next/server";

const CheckoutSchema = z.object({
  libroId: z
    .string()
    .regex(/^[a-f\d]{24}$/i, "ID MongoDB invalide"), // ObjectId format
});

export async function POST(req: Request) {
  const body = await req.json();

  const result = CheckoutSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: result.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { libroId } = result.data;
  // libroId est un string valide de format ObjectId
  // ...
}
```

---

### Middleware de validation réutilisable

```ts
// src/lib/validate.ts
import { z, ZodSchema } from "zod";
import { NextResponse } from "next/server";

export async function validateBody<T>(
  req: Request,
  schema: ZodSchema<T>
): Promise<{ data: T } | { error: NextResponse }> {
  const body = await req.json();
  const result = schema.safeParse(body);

  if (!result.success) {
    return {
      error: NextResponse.json(
        { error: "Données invalides", details: result.error.flatten().fieldErrors },
        { status: 400 }
      ),
    };
  }

  return { data: result.data };
}
```

```ts
// Utilisation dans n'importe quelle route
// src/app/api/books/route.ts
import { z } from "zod";
import { validateBody } from "@/lib/validate";

const CreateBookSchema = z.object({
  titulo: z.string().min(1),
  autor: z.string().min(1),
  precio: z.number().positive(),
  año: z.number().int().min(1000).max(new Date().getFullYear()),
});

export async function POST(req: Request) {
  const validated = await validateBody(req, CreateBookSchema);

  if ("error" in validated) return validated.error;

  const { titulo, autor, precio, año } = validated.data;
  // ...
}
```

---

### Schémas récursifs

```ts
// Exemple : catégories imbriquées
type Category = {
  nom: string;
  children?: Category[];
};

const CategorySchema: z.ZodType<Category> = z.lazy(() =>
  z.object({
    nom: z.string(),
    children: z.array(CategorySchema).optional(),
  })
);

CategorySchema.parse({
  nom: "Informatique",
  children: [
    { nom: "Frontend", children: [{ nom: "React" }, { nom: "Vue" }] },
    { nom: "Backend" },
  ],
}); // ✅
```

---

## 📊 Référence rapide

| Méthode | Usage |
|---|---|
| `z.string()` | Chaîne de caractères |
| `z.number()` | Nombre |
| `z.boolean()` | Booléen |
| `z.date()` | Date |
| `z.array(schema)` | Tableau |
| `z.object({})` | Objet |
| `z.enum([])` | Valeurs fixes |
| `z.union([])` | L'un ou l'autre |
| `z.optional()` | Rend optionnel |
| `z.nullable()` | Accepte null |
| `z.default(val)` | Valeur par défaut |
| `z.transform()` | Transformer la valeur |
| `z.refine()` | Validation personnalisée |
| `z.coerce` | Conversion automatique |
| `.parse()` | Valide ou lance une erreur |
| `.safeParse()` | Valide sans lancer d'erreur |
| `z.infer<typeof schema>` | Inférer le type TypeScript |
| `.partial()` | Tous les champs optionnels |
| `.pick({})` | Sélectionner des champs |
| `.omit({})` | Exclure des champs |
| `.extend({})` | Étendre un schéma |

---

> 📖 Documentation officielle : **zod.dev**
