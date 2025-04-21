// Function to clear localStorage on page refresh
export function clearStorageOnRefresh() {
    // Check if this is a fresh page load (not a client-side navigation)
    if (typeof window !== "undefined") {
      const lastRefreshTime = sessionStorage.getItem("lastRefreshTime")
      const currentTime = Date.now().toString()
      const currentPath = window.location.pathname
  
      // Only clear data if we're on the home page (/) and it's a fresh page load
      if (currentPath === "/" && (!lastRefreshTime || Date.now() - Number.parseInt(lastRefreshTime) > 1000)) {
        // Clear all map-related localStorage items
        localStorage.removeItem("selectedMapData")
        localStorage.removeItem("mapCustomization")
        localStorage.removeItem("dataLayers")
        localStorage.removeItem("clipToSelection")
        localStorage.removeItem("mapMetadata")
  
        console.log("Cleared localStorage data on home page refresh")
      }
  
      // Update the refresh time
      sessionStorage.setItem("lastRefreshTime", currentTime)
    }
  }
  