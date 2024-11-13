function checkForJobs() {
  console.log("Checking for new jobs...");

  // database lookup and PDF export done here
  // upload to cloudflare too
}

const interval = 10000; // 10 seconds in milliseconds

setInterval(checkForJobs, interval);