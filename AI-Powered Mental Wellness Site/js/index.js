const api_url = "https://api.api-ninjas.com/v1/quotes";
const api_key = "biXVRlq0HcvUj03TLjPoNQ==JJWwIpcIfy0ddfeD";

async function getapi(url) {
  try {
    const response = await fetch(url, {
      headers: {
        "X-Api-Key": api_key,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    // Select a random quote from the fetched data array
    const randomIndex = Math.floor(Math.random() * data.length);
    const quote = data[randomIndex].quote || data[randomIndex].q; // depending on API response field
    const author = data[randomIndex].author || data[randomIndex].a;

    // Display the quote and author in the element with id="quote"
    const quoteElement = document.getElementById("quote");
    if (quoteElement) {
      quoteElement.textContent = `"${quote}" — ${author}`;
    } else {
      console.warn('Element with id "quote" not found.');
    }
  } catch (error) {
    console.error("Failed to fetch quotes:", error);
  }
}

// Call the function to fetch and display quotes when the script loads
getapi(api_url);
