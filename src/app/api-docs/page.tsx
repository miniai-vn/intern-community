import SwaggerUIClient from "./SwaggerUI";

export const metadata = {
  title: "API Docs — Intern Community Hub",
};

export default function ApiDocsPage() {
  return (
    <main>
      <SwaggerUIClient url="/api/docs" />
    </main>
  );
}
