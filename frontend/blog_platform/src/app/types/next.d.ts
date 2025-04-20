import { NextPage } from 'next';

declare module 'next' {
  interface PageProps {
    params: { [key: string]: string };
    searchParams?: { [key: string]: string | string[] | undefined };
  }
}

declare module 'next/app' {
  interface PageProps {
    params: { [key: string]: string };
    searchParams?: { [key: string]: string | string[] | undefined };
  }
}