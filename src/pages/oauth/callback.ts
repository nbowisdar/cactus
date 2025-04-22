export const prerender = false;
import type { APIRoute } from "astro";
import { clientId, clientSecret, tokenUrl } from "./_config";

export const GET: APIRoute = async ({ url, redirect }) => {
  console.log("Callback URL:", url.toString());
  const code = url.searchParams.get("code");
  console.log("Code:", code);

  if (!code) {
    return new Response(
      `<html><body><h1>Error: No authorization code provided</h1></body></html>`,
      { headers: { "Content-Type": "text/html" } }
    );
  }

  const data = {
    code,
    client_id: clientId,
    client_secret: clientSecret,
  };

  try {
    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    console.log("Token response status:", response.status);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const body = await response.json();
    console.log("Token response body:", body);

    if (!body.access_token) {
      throw new Error("No access token in response");
    }

    const content = {
      token: body.access_token,
      provider: "github",
    };
    console.log("Content:", content);

    const script = `
      <script>
        try {
          console.log("Popup script running");
          if (!window.opener) throw new Error("No opener window");
          const receiveMessage = (message) => {
            console.log("Popup received message:", message.data, "from origin:", message.origin);
            try {
              window.opener.postMessage(
                'authorization:github:success:${JSON.stringify(content)}',
                "*"
              );
              console.log("Sent success message, closing popup");
              setTimeout(() => window.close(), 100);
            } catch (error) {
              console.error("Failed to send success message:", error);
              window.opener.postMessage(
                'authorization:github:error:' + error.message,
                "*"
              );
            }
            window.removeEventListener("message", receiveMessage, false);
          };
          window.addEventListener("message", receiveMessage, false);
          console.log("Sending authorizing message");
          window.opener.postMessage("authorizing:github", "*");
        } catch (error) {
          console.error("Popup script error:", error);
          document.body.innerHTML = '<h1>Error: ' + error.message + '</h1>';
          if (window.opener) {
            window.opener.postMessage("authorizing:error:" + error.message, "*");
          }
        }
      </script>
    `;

    return new Response(script, {
      headers: { "Content-Type": "text/html" },
    });
  } catch (err) {
    console.error("Callback error:", err);
    return new Response(
      `<html><body><h1>Error: ${err.message}</h1></body></html>`,
      { headers: { "Content-Type": "text/html" } }
    );
  }
};