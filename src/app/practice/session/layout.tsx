"use client"; // This makes it a Client Component

import React from "react";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";

export default function ProtectedLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <GoogleReCaptchaProvider reCaptchaKey="6LfVyuAqAAAAAI60Sefn2MrQDzEgMzjUx72tuBmm">
        {children}
    </GoogleReCaptchaProvider>
  );
}