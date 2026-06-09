import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-base-100 px-4 py-10 text-base-content">
      <SignUp
        appearance={{
          variables: {
            colorBackground: "#000000",
            colorText: "#ffffff",
            colorTextSecondary: "#a6a6a6",
            colorPrimary: "#ffffff",
            colorInputBackground: "#0f0f0f",
            colorInputText: "#ffffff",
            borderRadius: "0.5rem",
          },
          elements: {
            cardBox: "border border-base-300 bg-base-200 shadow-2xl",
            footerActionLink: "text-primary",
            formButtonPrimary: "btn btn-primary",
          },
        }}
      />
    </main>
  );
}
