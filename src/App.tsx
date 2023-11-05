import React, { useState, useEffect } from "react";

function App() {
  const [activeTab, setActiveTab] = useState(0);
  const [scrapedContractCode, setScrapedContractCode] = useState<string>("");

  // This handler listens to events coming from the webpage and updates the extension's state
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // Get the contract code from the webpage
    let contractCode = request.contractCode;
    // Update the state with the scraped contract code
    setScrapedContractCode(contractCode);
  });

  // This function retrieves information about the active tab in the browser window
  const getActiveTabInfo = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        const activeTab = tabs[0];
        activeTab.id !== undefined && setActiveTab(activeTab.id);
      } else {
        console.error("No active tabs found.");
      }
    });
  }

  // This function reads the contract code from the specified element and sends it to the extension script
  const scrapContractCodeFromPage = () => {
    // Select the specific element containing the contract code
    const contractElement = document.querySelector("#editor1 > div.ace_scroller > div > div.ace_layer.ace_text-layer");

    // Check if the element exists
    if (contractElement) {
      const contractCode = contractElement.textContent;
      // Send the scraped contract code to the extension
      chrome.runtime.sendMessage({ contractCode });
    } else {
      console.error("Contract element not found on the page.");
    }
  }

  // This function triggers the scraping process when the "Scrap" button is clicked
  const scrapData = () => {
    if (activeTab !== 0) {
      chrome.scripting.executeScript({
        target: { tabId: activeTab },
        func: scrapContractCodeFromPage
      }).then(() => console.log("Script injected"));
    }
  }

  useEffect(() => {
    getActiveTabInfo();
  }, []);

  return (
    <div className="App">
      <h1>Contract Code Scraper</h1>
      <button onClick={scrapData}>Scrap</button>

      <div>
        <h2>Scraped Contract Code</h2>
        <pre>{scrapedContractCode}</pre>
      </div>
    </div>
  );
}

export default App;
