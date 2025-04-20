export function cn(...inputs: (string | undefined)[]): string {
    return inputs.filter(Boolean).join(' ');
  }