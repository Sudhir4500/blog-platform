// lib/actions.ts

'use server';

import { cookies } from 'next/headers';


const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 7; // 7 days
const ACCESS_TOKEN_MAX_AGE = 60 * 60; // 60 minutes


export async function handleLogin(userId: string, accessToken: string, refreshToken: string) {
    (await cookies()).set('session_userid', userId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: REFRESH_TOKEN_MAX_AGE,
        path: '/',
    });
    (await cookies()).set('session_access_token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: ACCESS_TOKEN_MAX_AGE,
        path: '/',
    });
    (await cookies()).set('session_refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: REFRESH_TOKEN_MAX_AGE,
        path: '/',
    });
}

export async function resetAuthCookies() {
    (await cookies()).set('session_userid', '', { maxAge: 0 });
    (await cookies()).set('session_access_token', '', { maxAge: 0 });
    (await cookies()).set('session_refresh_token', '', { maxAge: 0 });
}

export async function getUserId() {
    const userId = (await cookies()).get('session_userid')?.value;
    return userId || null;
}


export async function getRefreshToken() {
    return (await cookies()).get('session_refresh_token')?.value || null;
}

