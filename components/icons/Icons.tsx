"use client";

type Props = {
  size?: number;
  className?: string;
};

export const IconPlus = ({ size = 16, className = "" }: Props) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    className={className}
    fill="currentColor"
  >
    <path d="M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2h6z" />
  </svg>
);

export const IconTrash = ({ size = 16, className = "" }: Props) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    className={className}
    fill="currentColor"
  >
    <path d="M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
  </svg>
);

export const IconSettings = ({ size = 16, className = "" }: Props) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    className={className}
    fill="currentColor"
  >
    <path d="M19.14 12.94c.04-.3.06-.61.06-.94s-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .11-.63l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96a7.027 7.027 0 0 0-1.63-.94l-.36-2.54A.488.488 0 0 0 14.9 2h-3.8c-.25 0-.46.18-.49.42l-.36 2.54c-.59.23-1.14.55-1.64.94l-2.38-.96a.5.5 0 0 0-.61.22L2.7 8.85c-.13.22-.08.51.12.67l2.03 1.58c-.05.3-.08.63-.08.95s.03.64.08.94L2.83 14.5a.49.49 0 0 0-.11.63l1.92 3.32c.13.22.4.31.63.22l2.38-.96c.5.39 1.05.71 1.64.94l.36 2.54c.04.24.25.42.49.42h3.8c.25 0 .46-.18.49-.42l.36-2.54c.59-.23 1.14-.55 1.63-.94l2.39.96c.23.09.49 0 .62-.22l1.92-3.32a.5.5 0 0 0-.11-.63l-2.03-1.58zM12 15.6c-1.99 0-3.6-1.61-3.6-3.6S10.01 8.4 12 8.4s3.6 1.61 3.6 3.6-1.61 3.6-3.6 3.6z" />
    </svg>
);

export const IconSend = ({ size = 16, className = "" }: Props) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    className={className}
    fill="currentColor"
  >
    <path d="M2 21l21-9L2 3v7l15 2-15 2z" />
  </svg>
);