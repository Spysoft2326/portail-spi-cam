import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
      doitChangerMotDePasse?: boolean;
    };
  }

  interface User {
    role?: string;
    doitChangerMotDePasse?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    doitChangerMotDePasse?: boolean;
    invalide?: boolean;
  }
}
