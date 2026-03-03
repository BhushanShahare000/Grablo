import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

const authOptions = {
    providers: [
        CredentialsProvider({
            name: 'Crediential',
            credentials: {
                email: { label: "Emaiil", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                const user = await prisma.user.findUnique({
                    where: { email: credentials?.email },

                });
                if (!user) throw new Error('no user found with this email');

                const isValid = await bcrypt.compare(credentials.password, user.password)
                if (!isValid) throw new Error("Invalid Password ");

                return { id: user.id, email: user.email, name: user.name, role: user.role }

            },


        }),
    ],

    session: {
        strategy: "jwt",
    },

    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }) {
            session.user.id = token.id;
            session.user.role = token.role;
            return session;
        },

    },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

