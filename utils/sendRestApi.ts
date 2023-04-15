export const sendRestApi = async (
  url: string,
  method: "GET" | "POST",
  params?: {
    headers?:
      | Headers
      | {
          "Content-Type"?: string;
          Accept?: string;
          Authorization?: string;
          "X-Api-Key"?: string;
        };
    body?: any;
  }
) => {
  try {
    const res = await fetch(url, {
      method,
      headers: params && params.headers ? params.headers : undefined,
      body: params && params.body ? JSON.stringify(params.body) : undefined,
    });
    const data = await res.json();
    if (!res.ok || !data) throw new Error("Error");
    return data;
  } catch (err) {
    return undefined;
  }
};
