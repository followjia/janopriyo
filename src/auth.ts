import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectToDatabase from './lib/db';
import User from './models/User';
import bcrypt from 'bcryptjs';
import { headers } from 'next/headers';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please provide both email and password.');
        }

        const headersList = await headers();
        const domain = headersList.get('host') || 'unknown';

        await connectToDatabase();
        const user = await User.findOne({ email: credentials.email, domain }).select('+password');

        if (!user || !user.password) {
          throw new Error('No user found with this email on this store.');
        }

        const isPasswordValid = await bcrypt.compare(credentials.password as string, user.password);

        if (!isPasswordValid) {
          throw new Error('Invalid credentials.');
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      const headersList = await headers();
      const domain = headersList.get('host') || 'unknown';

      if (user) {
        // When user logs in, fetch fresh data from DB for role
        if (user.email) {
           await connectToDatabase();
           const dbUser = await User.findOne({ email: user.email, domain });
           if (dbUser) {
             token.id = dbUser._id.toString();
             token.role = dbUser.role ?? 'user';
             token.image = dbUser.image || user.image || token.picture;
           } else {
             token.id = user.id;
             token.role = (user as any).role ?? 'user';
             token.image = user.image || token.picture;
           }
        } else {
           token.id = user.id;
           token.role = (user as any).role ?? 'user';
           token.image = user.image || token.picture;
        }
      }

      // Update session if requested (e.g. name/image update)
      if (trigger === 'update') {
        if (session?.name !== undefined) token.name = session.name;
        if (session?.image !== undefined) token.image = session.image;
      }
      
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any).role = token.role ?? 'user';
        if (token.image) {
          session.user.image = token.image as string;
        }
      }
      return session;
    },
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        if (!user.email) return false;
        
        const headersList = await headers();
        const domain = headersList.get('host') || 'unknown';

        await connectToDatabase();
        try {
          await User.findOneAndUpdate(
            { email: user.email, domain },
            { 
              $setOnInsert: {
                name: user.name || 'Unknown',
                email: user.email,
                image: user.image || '',
                role: 'user',
                googleId: account.providerAccountId,
                domain,
              }
            },
            { upsert: true, new: true }
          );
          return true;
        } catch (error) {
          console.error('Error in Google signIn callback', error);
          return false;
        }
      }
      return true;
    },
  },
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login', // Will be created later
    error: '/login',
  },
});
