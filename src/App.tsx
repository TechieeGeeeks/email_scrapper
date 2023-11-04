import { request } from "http";
import React, { useState, useEffect } from "react";

function App() {
  const [activeTab, setActiveTab] = useState(0);
  const [scrapedEmails, setScrapedEmails] = useState<string[]>([]);

  // Hnadler which listens to this events
  chrome.runtime.onMessage.addListener((request,sender,sendResponse)=>{

    // Get Emails
    alert(request.emails);
  })

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

  const scrapEmailDataFromPage = () => {
    const emailRegEx = /[\w\.=-]+@[\w\.-]+\.[\w]{2,3}/gim;
    const emails = document.body.innerHTML.match(emailRegEx) || [];
    chrome.runtime.sendMessage({emails});
  } 

  const scrapData = () => {
    if (activeTab !== 0) {
      chrome.scripting.executeScript({
        target: { tabId: activeTab },
        func: scrapEmailDataFromPage
      }).then(() => console.log("Script injected"));
    }
  }

  useEffect(() => {
    getActiveTabInfo();
  }, []);

  return (
    <div className="App">
      <h1>Email Scrapper</h1>
      <button onClick={scrapData}>Scrap</button>

      <div>
        <h2>Scraped Emails</h2>
        <ul>
          {scrapedEmails.map((email, index) => (
            <li key={index}>{email}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
